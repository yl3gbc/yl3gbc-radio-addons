"""FastAPI app on :8090 — page, JSON API and observation files."""

import os
import shutil
from datetime import UTC, date, datetime
from importlib import resources
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from monitor import collector, db, journal, portal
from monitor.config import settings

STATIC = Path(str(resources.files("monitor") / "static"))


def _ram_percent() -> float | None:
    try:
        info = {}
        for line in Path("/proc/meminfo").read_text().splitlines():
            key, value = line.split(":", 1)
            info[key] = int(value.split()[0])
        return round(100 * (1 - info["MemAvailable"] / info["MemTotal"]), 1)
    except (OSError, KeyError, ValueError):
        return None


def _disk_percent(path: str) -> float | None:
    try:
        usage = shutil.disk_usage(path)
        return round(100 * usage.used / usage.total, 1)
    except OSError:
        return None


def _satyaml_count() -> int | None:
    if not settings.satyaml_dir.is_dir():
        return None
    return sum(1 for _ in settings.satyaml_dir.glob("*.yml"))


def _today() -> dict:
    start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    return db.query(
        "SELECT count(*) AS observations, count(DISTINCT norad) AS satellites, "
        "coalesce(sum(packets), 0) AS packets FROM observations WHERE started_at >= ?",
        [start],
    )[0]


app = FastAPI(title="SONIKS Monitor", docs_url=None, redoc_url=None)
app.mount("/static", StaticFiles(directory=STATIC), name="static")

NO_STORE = {"Cache-Control": "no-store"}


@app.get("/")
def index():
    return FileResponse(STATIC / "index.html")


def _station_card(station_id: int) -> dict | None:
    card = portal.station(station_id)
    if card is None:
        return None
    return {**card, "owner": portal.owner(station_id)}


@app.get("/api/overview")
def overview():
    archive = settings.complete_dir.is_dir() and os.access(settings.complete_dir, os.R_OK)
    return JSONResponse({
        "station_id": settings.station_id,
        "station": _station_card(settings.station_id) or {},
        "today": _today(),
        "future_jobs": portal.future_jobs(settings.station_id),
        "health": collector.health() or {},
        "satyaml": _satyaml_count(),
        "ram_percent": _ram_percent(),
        "disk_percent": _disk_percent("/"),
        "archive_connected": archive,
    }, headers=NO_STORE)


@app.get("/api/station/{station_id}")
def compare(station_id: int):
    return JSONResponse({
        "station_id": station_id,
        "station": _station_card(station_id),
        "today": portal.today(station_id),
        "future_jobs": portal.future_jobs(station_id),
    }, headers=NO_STORE)


@app.get("/api/stations/online")
def stations_online():
    return JSONResponse(portal.online_stations() or [], headers=NO_STORE)


@app.get("/api/observations")
def observations(limit: int = 100):
    rows = db.query("SELECT * FROM observations ORDER BY started_at DESC LIMIT ?",
                    [min(limit, 1000)])
    for row in rows:
        for key in ("started_at", "stopped_at"):
            if row[key] is not None:
                row[key] = row[key].strftime("%Y-%m-%dT%H:%M:%SZ")
    return JSONResponse(rows, headers=NO_STORE)


@app.get("/api/journal/days")
def journal_days():
    return JSONResponse(journal.days(), headers=NO_STORE)


@app.get("/api/journal/{day}")
def journal_day(day: str):
    try:
        day_ = date.fromisoformat(day)
    except ValueError:
        raise HTTPException(status_code=400)
    return JSONResponse(journal.day(day_), headers=NO_STORE)


@app.get("/api/files/{observation_id}")
def observation_files(observation_id: str):
    if not observation_id.isdigit():
        raise HTTPException(status_code=404)
    return JSONResponse(journal.files(observation_id), headers=NO_STORE)


@app.get("/files/{observation_id}/{name}")
def observation_file(observation_id: str, name: str):
    base = settings.complete_dir.resolve()
    target = (base / observation_id / name).resolve()
    if base not in target.parents or not target.is_file():
        raise HTTPException(status_code=404)
    return FileResponse(target)
