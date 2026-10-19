"""DuckDB 2.1.0-dev storage through db_dev: one connection, every query under one lock."""

import threading
from datetime import UTC, datetime

import db_dev

from monitor.config import settings

_lock = threading.Lock()
_conn: db_dev.Connection | None = None

SCHEMA = """
CREATE TABLE IF NOT EXISTS observations (
    observation_id VARCHAR PRIMARY KEY,
    started_at     TIMESTAMP ,
    stopped_at     TIMESTAMP ,
    norad          INTEGER,
    mode           VARCHAR,
    decoder        VARCHAR,
    frequency_hz   BIGINT,
    snr_db         DOUBLE,
    noise_db       DOUBLE,
    peak_db        DOUBLE,
    packets        INTEGER,
    decodable      BOOLEAN,
    decoder_status VARCHAR,
    waterfall      VARCHAR,
    images         VARCHAR[]
);
"""


def connect() -> None:
    global _conn
    settings.db_path.parent.mkdir(parents=True, exist_ok=True)
    _conn = db_dev.connect(str(settings.db_path))
    _conn.execute(SCHEMA)


def query(sql: str, params: list | None = None) -> list[dict]:
    with _lock:
        cur = _conn.cursor()
        try:
            cur.execute(sql, params or [])
            if cur.description is None:
                return []
            names = [d[0] for d in cur.description]
            return [dict(zip(names, row, strict=True)) for row in cur.fetchall()]
        finally:
            cur.close()


def known_ids() -> set[str]:
    return {r["observation_id"] for r in query("SELECT observation_id FROM observations")}


def _utc_naive(value):
    if isinstance(value, datetime) and value.tzinfo is not None:
        return value.astimezone(UTC).replace(tzinfo=None)
    return value


def insert_observation(row: dict) -> None:
    row = {key: _utc_naive(value) for key, value in row.items()}
    columns = list(row)
    placeholders = ", ".join("?" for _ in columns)
    query(
        f"INSERT OR REPLACE INTO observations ({', '.join(columns)}) VALUES ({placeholders})",
        [row[c] for c in columns],
    )


def delete_older_than(cutoff: datetime) -> None:
    query("DELETE FROM observations WHERE started_at < ?", [_utc_naive(cutoff)])
