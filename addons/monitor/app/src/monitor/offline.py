"""Offline test (monitor side): uploads, runs, results. Decoding is done by the ``offline`` addon.

The monitor only writes files into ``/data/offline`` and reads what the worker writes back;
nothing from here is ever sent to the portal.

Retention: the original upload stays until it decodes. A test is removed after the retention
period only when it was decoded, or when its pass was so low (max elevation below
``MONITOR_OFFLINE_LOW_ELEVATION``) that it is not worth keeping.
"""

import json
import re
import shutil
import uuid
from datetime import UTC, datetime
from pathlib import Path

from monitor import db, journal, portal
from monitor.config import settings

MAX_UPLOAD = 1024 * 1024 * 1024          # 1 GiB
ALLOWED = {".ogg", ".oga", ".wav"}
WORKER_STALE_S = 30


def _now() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def _read(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return None


def _write(path: Path, data: dict) -> None:
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1))
    tmp.replace(path)


def _test_dir(test_id: str) -> Path:
    if not re.fullmatch(r"[0-9TZ-]+_[0-9a-f]{6}", test_id):
        raise FileNotFoundError(test_id)
    path = settings.offline_dir / test_id
    if not path.is_dir():
        raise FileNotFoundError(test_id)
    return path


def worker_state() -> dict:
    beat = _read_text(settings.offline_dir / ".worker")
    if not beat:
        return {"running": False, "last": None}
    try:
        age = (datetime.now(UTC) - datetime.fromisoformat(beat.replace("Z", "+00:00"))).total_seconds()
    except ValueError:
        return {"running": False, "last": beat}
    return {"running": age < WORKER_STALE_S, "last": beat}


def _read_text(path: Path) -> str | None:
    try:
        return path.read_text().strip()
    except OSError:
        return None


# --- pass geometry ---------------------------------------------------------------------------------

def _pass_info(observation_id: str | None) -> dict:
    """Max elevation, azimuths, satellite, station of a portal observation (SONIKS)."""

    if not observation_id or not str(observation_id).isdigit():
        return {}
    data = portal.observation(int(observation_id))
    if not data:
        return {}
    return {
        "observation_id": int(observation_id),
        "max_elevation": data.get("max_altitude"),
        "rise_azimuth": data.get("rise_azimuth"),
        "set_azimuth": data.get("set_azimuth"),
        "norad": data.get("norad_cat_id"),
        "station": data.get("station_name"),
        "ground_station": data.get("ground_station"),
        "start": data.get("start"),
        "frequency_hz": data.get("observation_frequency"),
    }


# --- create ---------------------------------------------------------------------------------------

def _new_test(filename: str, meta: dict) -> tuple[str, Path]:
    test_id = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ") + "_" + uuid.uuid4().hex[:6]
    path = settings.offline_dir / test_id
    path.mkdir(parents=True)
    _write(path / "test.json", {"id": test_id, "created": _now(), "filename": filename, **meta})
    return test_id, path


def _new_run(path: Path, satellite: str, iq: bool) -> int:
    runs = sorted(int(p.name[4:]) for p in path.glob("run-*") if p.name[4:].isdigit())
    n = (runs[-1] + 1) if runs else 1
    run = path / f"run-{n}"
    run.mkdir()
    _write(run / "request.json", {"satellite": satellite or "auto", "iq": iq, "created": _now()})
    return n


async def upload(stream, filename: str, satellite: str, observation_id: str,
                 elevation: str, iq: bool) -> dict:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED:
        raise ValueError("only .ogg or .wav")

    meta = {"source": "upload", **_pass_info(observation_id)}
    if elevation and "max_elevation" not in meta:
        meta["max_elevation"] = float(elevation)
    test_id, path = _new_test(filename, meta)

    size = 0
    try:
        with open(path / f"input{'.ogg' if ext == '.oga' else ext}", "wb") as f:
            async for chunk in stream:
                size += len(chunk)
                if size > MAX_UPLOAD:
                    raise ValueError("file larger than 1 GiB")
                f.write(chunk)
        if size == 0:
            raise ValueError("empty file")
    except Exception:
        shutil.rmtree(path, ignore_errors=True)
        raise

    _new_run(path, satellite or str(meta.get("norad") or ""), iq)
    return {"id": test_id}


def from_observation(observation_id: str, satellite: str) -> dict:
    """Copy the .ogg of one of this station's completed observations into a new test."""

    directory = settings.complete_dir / str(observation_id)
    ogg = next(iter(sorted(directory.glob("*.ogg"))), None) if directory.is_dir() else None
    if ogg is None:
        raise FileNotFoundError(f"no .ogg for observation {observation_id}")

    row = db.query("SELECT norad, mode FROM observations WHERE observation_id = ?", [str(observation_id)])
    meta = {"source": "station", **_pass_info(observation_id)}
    if row and row[0]["norad"] is not None:
        meta.setdefault("norad", row[0]["norad"])
        meta["mode"] = row[0]["mode"]
    test_id, path = _new_test(ogg.name, meta)
    shutil.copyfile(ogg, path / "input.ogg")
    _new_run(path, satellite or str(meta.get("norad") or ""), False)
    return {"id": test_id}


def rerun(test_id: str, satellite: str, iq: bool) -> dict:
    path = _test_dir(test_id)
    if not any(p.name.startswith("input.") for p in path.iterdir()):
        raise FileNotFoundError("original file is gone")
    return {"id": test_id, "run": _new_run(path, satellite, iq)}


def delete(test_id: str) -> None:
    shutil.rmtree(_test_dir(test_id))


# --- read ------------------------------------------------------------------------------------------

def _run_view(run: Path, full: bool) -> dict:
    request = _read(run / "request.json") or {}
    result = _read(run / "result.json")
    status = _read(run / "status.json")
    state = ("error" if result and result.get("status") == "error"
             else "done" if result else "running" if status else "queued")
    view = {"run": int(run.name[4:]), "request": request, "state": state,
            "progress": status if state == "running" else None}
    if result:
        view["decoded"] = result.get("decoded", False)
        view["best"] = result.get("best")
        view["tried"] = result.get("tried")
        view["error"] = result.get("error")
        view["recording"] = result.get("recording")
        view["finished"] = result.get("finished")
        if full:
            view["ranking"] = result.get("ranking", [])
            view["frames_hex"] = result.get("frames_hex", [])
            view["has_kiss"] = (run / "best.kiss").is_file()
            log = _read_text(run / "log.txt") or ""
            view["log_tail"] = log[-4000:]
    return view


def _test_view(path: Path, full: bool) -> dict:
    meta = _read(path / "test.json") or {"id": path.name}
    runs = sorted((p for p in path.glob("run-*") if p.name[4:].isdigit()), key=lambda p: int(p.name[4:]))
    run_views = [_run_view(r, full) for r in runs]
    norad = meta.get("norad")
    names = journal.satellite_names()
    meta["satellite"] = names.get(norad) if norad else None
    decoded = any(r.get("decoded") for r in run_views)
    best_run = max((r for r in run_views if r.get("decoded")),
                   key=lambda r: r["best"]["frames"], default=None)
    return {**meta, "decoded": decoded, "best_run": best_run,
            "has_input": any(p.name.startswith("input.") for p in path.iterdir()),
            "runs": run_views if full else run_views[-1:]}


def tests() -> list[dict]:
    root = settings.offline_dir
    if not root.is_dir():
        return []
    return [_test_view(p, False) for p in sorted(root.iterdir(), reverse=True)
            if p.is_dir() and (p / "test.json").is_file()]


def test(test_id: str) -> dict:
    return _test_view(_test_dir(test_id), True)


def kiss_path(test_id: str, run: int) -> Path:
    path = _test_dir(test_id) / f"run-{int(run)}" / "best.kiss"
    if not path.is_file():
        raise FileNotFoundError(str(path))
    return path


def satellites() -> list[dict]:
    """Satellites with a satyaml description, for the selector (NORAD + name)."""

    return [{"norad": n, "name": name} for n, name in sorted(journal._satyaml_names().items(),
                                                              key=lambda x: x[1].lower())]


# --- retention -------------------------------------------------------------------------------------

def cleanup(cutoff: datetime) -> None:
    root = settings.offline_dir
    if not root.is_dir():
        return
    for path in root.iterdir():
        if not path.is_dir() or not (path / "test.json").is_file():
            continue
        try:
            if datetime.fromtimestamp(path.stat().st_mtime, UTC) >= cutoff:
                continue
            view = _test_view(path, False)
            low = (view.get("max_elevation") is not None
                   and float(view["max_elevation"]) < settings.offline_low_elevation)
            if view["decoded"] or low:
                shutil.rmtree(path)
        except (OSError, ValueError):
            continue
