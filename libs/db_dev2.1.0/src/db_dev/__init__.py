"""db_dev — Python 3.15 access to DuckDB 2.1.0-dev through its C API (ctypes, no compiled binding).

Loads libduckdb.so built from source and talks to it directly:

    import db_dev
    con = db_dev.connect("/data/monitor/monitor.duckdb")
    cur = con.cursor()
    cur.execute("SELECT ? AS answer", [42])
    cur.description      # [("answer", "INTEGER")]
    cur.fetchall()       # [(42,)]

Library lookup order: DB_DEV_LIBRARY env, /opt/duckdb/lib/libduckdb.so, system search path.

Parameters: None, bool, int, float, str, naive datetime (UTC), date, list[str].
Results: BOOLEAN, (U)TINY/SMALL/INT/BIGINT, HUGEINT, FLOAT, DOUBLE, VARCHAR, BLOB,
DATE, TIMESTAMP (naive UTC), TIMESTAMP_TZ (aware UTC) and LIST of these.
"""

import ctypes
import ctypes.util
import os
import struct
import threading
from datetime import UTC, date, datetime, timedelta

__all__ = ["connect", "Connection", "Cursor", "Error", "library_version"]

# --- library ---------------------------------------------------------------------------

_c_void = ctypes.c_void_p
_idx = ctypes.c_uint64
_state = ctypes.c_int  # duckdb_state: 0 success, 1 error


class _Result(ctypes.Structure):  # struct duckdb_result
    _fields_ = [
        ("deprecated_column_count", _idx),
        ("deprecated_row_count", _idx),
        ("deprecated_rows_changed", _idx),
        ("deprecated_columns", _c_void),
        ("deprecated_error_message", ctypes.c_char_p),
        ("internal_data", _c_void),
    ]


class _Timestamp(ctypes.Structure):  # struct duckdb_timestamp
    _fields_ = [("micros", ctypes.c_int64)]


_SIGNATURES = {
    "duckdb_library_version": (ctypes.c_char_p, []),
    "duckdb_open": (_state, [ctypes.c_char_p, ctypes.POINTER(_c_void)]),
    "duckdb_close": (None, [ctypes.POINTER(_c_void)]),
    "duckdb_connect": (_state, [_c_void, ctypes.POINTER(_c_void)]),
    "duckdb_disconnect": (None, [ctypes.POINTER(_c_void)]),
    "duckdb_prepare": (_state, [_c_void, ctypes.c_char_p, ctypes.POINTER(_c_void)]),
    "duckdb_prepare_error": (ctypes.c_char_p, [_c_void]),
    "duckdb_destroy_prepare": (None, [ctypes.POINTER(_c_void)]),
    "duckdb_nparams": (_idx, [_c_void]),
    "duckdb_bind_null": (_state, [_c_void, _idx]),
    "duckdb_bind_boolean": (_state, [_c_void, _idx, ctypes.c_bool]),
    "duckdb_bind_int64": (_state, [_c_void, _idx, ctypes.c_int64]),
    "duckdb_bind_double": (_state, [_c_void, _idx, ctypes.c_double]),
    "duckdb_bind_varchar": (_state, [_c_void, _idx, ctypes.c_char_p]),
    "duckdb_bind_timestamp": (_state, [_c_void, _idx, _Timestamp]),
    "duckdb_bind_value": (_state, [_c_void, _idx, _c_void]),
    "duckdb_execute_prepared": (_state, [_c_void, ctypes.POINTER(_Result)]),
    "duckdb_result_error": (ctypes.c_char_p, [ctypes.POINTER(_Result)]),
    "duckdb_destroy_result": (None, [ctypes.POINTER(_Result)]),
    "duckdb_rows_changed": (_idx, [ctypes.POINTER(_Result)]),
    "duckdb_column_count": (_idx, [ctypes.POINTER(_Result)]),
    "duckdb_column_name": (ctypes.c_char_p, [ctypes.POINTER(_Result), _idx]),
    "duckdb_column_logical_type": (_c_void, [ctypes.POINTER(_Result), _idx]),
    "duckdb_fetch_chunk": (_c_void, [_Result]),
    "duckdb_data_chunk_get_size": (_idx, [_c_void]),
    "duckdb_data_chunk_get_vector": (_c_void, [_c_void, _idx]),
    "duckdb_destroy_data_chunk": (None, [ctypes.POINTER(_c_void)]),
    "duckdb_vector_get_data": (_c_void, [_c_void]),
    "duckdb_vector_get_validity": (ctypes.POINTER(ctypes.c_uint64), [_c_void]),
    "duckdb_list_vector_get_child": (_c_void, [_c_void]),
    "duckdb_get_type_id": (ctypes.c_int, [_c_void]),
    "duckdb_list_type_child_type": (_c_void, [_c_void]),
    "duckdb_create_logical_type": (_c_void, [ctypes.c_int]),
    "duckdb_destroy_logical_type": (None, [ctypes.POINTER(_c_void)]),
    "duckdb_create_varchar": (_c_void, [ctypes.c_char_p]),
    "duckdb_create_list_value": (_c_void, [_c_void, ctypes.POINTER(_c_void), _idx]),
    "duckdb_destroy_value": (None, [ctypes.POINTER(_c_void)]),
}


def _load() -> ctypes.CDLL:
    candidates = [os.environ.get("DB_DEV_LIBRARY"), "/opt/duckdb/lib/libduckdb.so",
                  ctypes.util.find_library("duckdb")]
    errors = []
    for path in filter(None, candidates):
        try:
            lib = ctypes.CDLL(path)
            break
        except OSError as e:
            errors.append(f"{path}: {e}")
    else:
        raise ImportError("libduckdb not found: " + "; ".join(errors or ["no candidates"]))

    for name, (restype, argtypes) in _SIGNATURES.items():
        fn = getattr(lib, name)
        fn.restype = restype
        fn.argtypes = argtypes
    return lib


_lib = _load()


def library_version() -> str:
    return _lib.duckdb_library_version().decode()


# --- types ----------------------------------------------------------------------------------

T_BOOLEAN, T_TINYINT, T_SMALLINT, T_INTEGER, T_BIGINT = 1, 2, 3, 4, 5
T_UTINYINT, T_USMALLINT, T_UINTEGER, T_UBIGINT = 6, 7, 8, 9
T_FLOAT, T_DOUBLE, T_TIMESTAMP, T_DATE = 10, 11, 12, 13
T_HUGEINT, T_VARCHAR, T_BLOB, T_LIST, T_TIMESTAMP_TZ = 16, 17, 18, 24, 31

_TYPE_NAMES = {
    T_BOOLEAN: "BOOLEAN", T_TINYINT: "TINYINT", T_SMALLINT: "SMALLINT", T_INTEGER: "INTEGER",
    T_BIGINT: "BIGINT", T_UTINYINT: "UTINYINT", T_USMALLINT: "USMALLINT", T_UINTEGER: "UINTEGER",
    T_UBIGINT: "UBIGINT", T_FLOAT: "FLOAT", T_DOUBLE: "DOUBLE", T_TIMESTAMP: "TIMESTAMP",
    T_DATE: "DATE", T_HUGEINT: "HUGEINT", T_VARCHAR: "VARCHAR", T_BLOB: "BLOB", T_LIST: "LIST",
    T_TIMESTAMP_TZ: "TIMESTAMP WITH TIME ZONE",
}

# fixed-width readers: (struct format, byte width)
_FIXED = {
    T_BOOLEAN: ("?", 1), T_TINYINT: ("b", 1), T_SMALLINT: ("h", 2), T_INTEGER: ("i", 4),
    T_BIGINT: ("q", 8), T_UTINYINT: ("B", 1), T_USMALLINT: ("H", 2), T_UINTEGER: ("I", 4),
    T_UBIGINT: ("Q", 8), T_FLOAT: ("f", 4), T_DOUBLE: ("d", 8),
}

_EPOCH = datetime(1970, 1, 1)
_EPOCH_DATE = date(1970, 1, 1)


class Error(Exception):
    """Any DuckDB error (prepare, bind, execute, unsupported type)."""


class _Column:
    """Reader for one result column, built once from its logical type."""

    def __init__(self, logical_type: int):
        self.type_id = _lib.duckdb_get_type_id(logical_type)
        self.child = None
        if self.type_id == T_LIST:
            child_type = _c_void(_lib.duckdb_list_type_child_type(logical_type))
            self.child = _Column(child_type.value)
            _lib.duckdb_destroy_logical_type(ctypes.byref(child_type))
        elif self.type_id not in _TYPE_NAMES:
            raise Error(f"unsupported DuckDB type id {self.type_id}")

    @property
    def name(self) -> str:
        if self.type_id == T_LIST:
            return f"{self.child.name}[]"
        return _TYPE_NAMES[self.type_id]

    def read(self, vector: int, count: int, offset: int = 0) -> list:
        """Read ``count`` values of ``vector`` starting at row ``offset``."""

        data = _lib.duckdb_vector_get_data(vector)
        validity = _lib.duckdb_vector_get_validity(vector)
        t = self.type_id
        out = []

        if t == T_LIST:
            child_vector = _lib.duckdb_list_vector_get_child(vector)
            for row in range(offset, offset + count):
                if validity and not _valid(validity, row):
                    out.append(None)
                    continue
                start, length = struct.unpack_from("QQ", _bytes(data + row * 16, 16))
                out.append(self.child.read(child_vector, length, start))
            return out

        width = {T_VARCHAR: 16, T_BLOB: 16, T_HUGEINT: 16, T_TIMESTAMP: 8,
                 T_TIMESTAMP_TZ: 8, T_DATE: 4}.get(t) or _FIXED[t][1]
        raw = _bytes(data + offset * width, count * width) if count else b""

        for i in range(count):
            row = offset + i
            if validity and not _valid(validity, row):
                out.append(None)
                continue
            base = i * width
            if t in (T_VARCHAR, T_BLOB):
                value = _string(raw, base)
                out.append(value.decode("utf-8") if t == T_VARCHAR else value)
            elif t == T_HUGEINT:
                lower, upper = struct.unpack_from("Qq", raw, base)
                out.append((upper << 64) | lower)
            elif t == T_TIMESTAMP:
                out.append(_EPOCH + timedelta(microseconds=struct.unpack_from("q", raw, base)[0]))
            elif t == T_TIMESTAMP_TZ:
                micros = struct.unpack_from("q", raw, base)[0]
                out.append((_EPOCH + timedelta(microseconds=micros)).replace(tzinfo=UTC))
            elif t == T_DATE:
                out.append(_EPOCH_DATE + timedelta(days=struct.unpack_from("i", raw, base)[0]))
            else:
                out.append(struct.unpack_from(_FIXED[t][0], raw, base)[0])
        return out


def _bytes(address: int, size: int) -> bytes:
    return ctypes.string_at(address, size)


def _valid(validity, row: int) -> bool:
    return bool(validity[row // 64] & (1 << (row % 64)))


def _string(raw: bytes, base: int) -> bytes:
    """duckdb_string_t: length (uint32) + 12 inlined bytes, or prefix + pointer."""

    length = struct.unpack_from("I", raw, base)[0]
    if length <= 12:
        return raw[base + 4: base + 4 + length]
    pointer = struct.unpack_from("Q", raw, base + 8)[0]
    return ctypes.string_at(pointer, length)


# --- connection / cursor -------------------------------------------------------------------

class Connection:
    def __init__(self, path: str | None):
        self._db = _c_void()
        if _lib.duckdb_open(path.encode() if path else None, ctypes.byref(self._db)) != 0:
            raise Error(f"cannot open database {path!r}")
        self._con = _c_void()
        if _lib.duckdb_connect(self._db, ctypes.byref(self._con)) != 0:
            _lib.duckdb_close(ctypes.byref(self._db))
            raise Error("cannot connect")
        self._lock = threading.Lock()

    def cursor(self) -> "Cursor":
        return Cursor(self)

    def execute(self, sql: str, params=None) -> "Cursor":
        return self.cursor().execute(sql, params)

    def close(self) -> None:
        if self._con:
            _lib.duckdb_disconnect(ctypes.byref(self._con))
        if self._db:
            _lib.duckdb_close(ctypes.byref(self._db))

    def __enter__(self):
        return self

    def __exit__(self, *exc) -> None:
        self.close()


class Cursor:
    def __init__(self, connection: Connection):
        self.connection = connection
        self.description: list[tuple[str, str]] | None = None
        self.rowcount = -1
        self._rows: list[tuple] = []
        self._pos = 0

    def execute(self, sql: str, params=None) -> "Cursor":
        params = list(params or [])
        con = self.connection
        with con._lock:
            stmt = _c_void()
            try:
                if _lib.duckdb_prepare(con._con, sql.encode(), ctypes.byref(stmt)) != 0:
                    raise Error(_text(_lib.duckdb_prepare_error(stmt)) or "prepare failed")
                expected = _lib.duckdb_nparams(stmt)
                if expected != len(params):
                    raise Error(f"expected {expected} parameters, got {len(params)}")
                for index, value in enumerate(params, start=1):
                    _bind(stmt, index, value)
                result = _Result()
                try:
                    if _lib.duckdb_execute_prepared(stmt, ctypes.byref(result)) != 0:
                        raise Error(_text(_lib.duckdb_result_error(ctypes.byref(result))) or "execute failed")
                    self._collect(result)
                finally:
                    _lib.duckdb_destroy_result(ctypes.byref(result))
            finally:
                _lib.duckdb_destroy_prepare(ctypes.byref(stmt))
        return self

    def _collect(self, result: _Result) -> None:
        ncols = _lib.duckdb_column_count(ctypes.byref(result))
        columns, names = [], []
        for col in range(ncols):
            lt = _c_void(_lib.duckdb_column_logical_type(ctypes.byref(result), col))
            try:
                columns.append(_Column(lt.value))
            finally:
                _lib.duckdb_destroy_logical_type(ctypes.byref(lt))
            names.append(_text(_lib.duckdb_column_name(ctypes.byref(result), col)))

        self.description = [(n, c.name) for n, c in zip(names, columns, strict=True)] or None
        self.rowcount = _lib.duckdb_rows_changed(ctypes.byref(result))

        rows: list[tuple] = []
        while True:
            chunk = _c_void(_lib.duckdb_fetch_chunk(result))
            if not chunk.value:
                break
            try:
                size = _lib.duckdb_data_chunk_get_size(chunk)
                if size == 0:
                    break
                values = [c.read(_lib.duckdb_data_chunk_get_vector(chunk, i), size)
                          for i, c in enumerate(columns)]
                rows.extend(zip(*values, strict=True))
            finally:
                _lib.duckdb_destroy_data_chunk(ctypes.byref(chunk))
        self._rows, self._pos = rows, 0

    def fetchall(self) -> list[tuple]:
        rows, self._pos = self._rows[self._pos:], len(self._rows)
        return rows

    def fetchone(self) -> tuple | None:
        if self._pos >= len(self._rows):
            return None
        self._pos += 1
        return self._rows[self._pos - 1]

    def close(self) -> None:
        self._rows = []


def _text(value: bytes | None) -> str | None:
    return value.decode() if value is not None else None


def _bind(stmt: _c_void, index: int, value) -> None:
    match value:
        case None:
            state = _lib.duckdb_bind_null(stmt, index)
        case bool():
            state = _lib.duckdb_bind_boolean(stmt, index, value)
        case int():
            state = _lib.duckdb_bind_int64(stmt, index, value)
        case float():
            state = _lib.duckdb_bind_double(stmt, index, value)
        case str():
            state = _lib.duckdb_bind_varchar(stmt, index, value.encode())
        case datetime():
            if value.tzinfo is not None:
                value = value.astimezone(UTC).replace(tzinfo=None)
            micros = (value - _EPOCH) // timedelta(microseconds=1)
            state = _lib.duckdb_bind_timestamp(stmt, index, _Timestamp(micros))
        case date():
            state = _lib.duckdb_bind_varchar(stmt, index, value.isoformat().encode())
        case list() | tuple() if all(isinstance(v, str) for v in value):
            state = _bind_str_list(stmt, index, value)
        case _:
            raise Error(f"unsupported parameter type {type(value).__name__}")
    if state != 0:
        raise Error(f"cannot bind parameter {index}")


def _bind_str_list(stmt: _c_void, index: int, items) -> int:
    child = _c_void(_lib.duckdb_create_logical_type(T_VARCHAR))
    values = (_c_void * max(len(items), 1))()
    try:
        for i, item in enumerate(items):
            values[i] = _lib.duckdb_create_varchar(item.encode())
        lst = _c_void(_lib.duckdb_create_list_value(child, values, len(items)))
        try:
            return _lib.duckdb_bind_value(stmt, index, lst)
        finally:
            _lib.duckdb_destroy_value(ctypes.byref(lst))
    finally:
        for i in range(len(items)):
            v = _c_void(values[i])
            _lib.duckdb_destroy_value(ctypes.byref(v))
        _lib.duckdb_destroy_logical_type(ctypes.byref(child))


def connect(path: str | None = None) -> Connection:
    """Open (or create) a DuckDB database file; ``None`` or ``":memory:"`` for in-memory."""

    return Connection(None if path in (None, ":memory:") else str(path))
