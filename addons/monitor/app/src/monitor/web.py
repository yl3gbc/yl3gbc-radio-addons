"""FastAPI app on :8090 — page, JSON API and observation files."""

import hashlib
import os
import shutil
from datetime import UTC, date, datetime
from importlib import resources
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from monitor import archive, collector, db, history, journal, modes, offline, orbit, portal, satellite
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


class _Static(StaticFiles):
    """Static files that the browser must revalidate (ETag) before every use."""

    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        response.headers["Cache-Control"] = "no-cache"
        return response


app.mount("/static", _Static(directory=STATIC), name="static")

NO_STORE = {"Cache-Control": "no-store"}


def _version(name: str) -> str:
    return hashlib.sha256((STATIC / name).read_bytes()).hexdigest()[:12]


@app.get("/")
def index():
    """index.html with ?v=<content hash> on app.js / app.css: a new build is always fetched fresh."""

    html = (STATIC / "index.html").read_text(encoding="utf-8")
    for name in ("app.js", "app.css"):
        html = html.replace(f"/static/{name}\"", f"/static/{name}?v={_version(name)}\"")
    return HTMLResponse(html, headers=NO_STORE)


def _station_card(station_id: int) -> dict | None:
    card = portal.station(station_id)
    if card is None:
        return None
    return {**card, "owner": portal.owner(station_id)}


@app.get("/api/overview")
def overview():
    archive_ok = settings.images_dir.is_dir() and os.access(settings.images_dir, os.W_OK)
    return JSONResponse({
        "station_id": settings.station_id,
        "station": _station_card(settings.station_id) or {},
        "today": _today(),
        "future_jobs": portal.future_jobs(settings.station_id),
        "health": collector.health() or {},
        "satyaml": _satyaml_count(),
        "ram_percent": _ram_percent(),
        "disk_percent": _disk_percent("/"),
        "archive_connected": archive_ok,
        "archive_images": archive.count(),
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


@app.get("/api/satellites")
def satellites_list():
    return JSONResponse(satellite.satellites(), headers=NO_STORE)


@app.get("/api/satellite/{norad}")
def satellite_detail(norad: int):
    return JSONResponse(satellite.satellite(norad), headers=NO_STORE)


@app.get("/api/modes")
def modes_view(days: int = 90):
    return JSONResponse(modes.modes(days), headers=NO_STORE)


@app.get("/api/history")
def history_view(days: int = 30):
    return JSONResponse(history.history(days), headers=NO_STORE)


@app.get("/api/offline")
def offline_list():
    return JSONResponse({"worker": offline.worker_state(), "tests": offline.tests(),
                         "low_elevation": settings.offline_low_elevation,
                         "retention_days": settings.retention_days}, headers=NO_STORE)


@app.get("/api/offline/satellites")
def offline_satellites():
    return JSONResponse(offline.satellites(), headers=NO_STORE)


@app.post("/api/offline/upload")
async def offline_upload(request: Request, filename: str, satellite: str = "",
                         observation: str = "", elevation: str = "", iq: bool = False):
    try:
        return JSONResponse(await offline.upload(request.stream(), filename, satellite.strip(),
                                                 observation.strip(), elevation.strip(), iq))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/offline/from/{observation_id}")
def offline_from_observation(observation_id: str, satellite: str = ""):
    try:
        return JSONResponse(offline.from_observation(observation_id, satellite.strip()))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/offline/{test_id}")
def offline_test(test_id: str):
    try:
        return JSONResponse(offline.test(test_id), headers=NO_STORE)
    except FileNotFoundError:
        raise HTTPException(status_code=404)


@app.post("/api/offline/{test_id}/rerun")
def offline_rerun(test_id: str, satellite: str = "auto", iq: bool = False):
    try:
        return JSONResponse(offline.rerun(test_id, satellite.strip() or "auto", iq))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.delete("/api/offline/{test_id}")
def offline_delete(test_id: str):
    try:
        offline.delete(test_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404)
    return JSONResponse({"deleted": test_id})


@app.get("/api/offline/{test_id}/run/{run}/kiss")
def offline_kiss(test_id: str, run: int):
    try:
        path = offline.kiss_path(test_id, run)
    except FileNotFoundError:
        raise HTTPException(status_code=404)
    return FileResponse(path, filename=f"{test_id}_run{run}.kiss", media_type="application/octet-stream")


@app.get("/api/orbit")
def orbit_view():
    return JSONResponse(orbit.orbit(), headers=NO_STORE)


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


@app.get("/api/images")
def images_list(limit: int = 60, offset: int = 0):
    return JSONResponse(archive.listing(max(1, min(limit, 500)), max(0, offset),
                                        journal.satellite_names()), headers=NO_STORE)


@app.get("/api/images/archives")
def images_archives():
    return JSONResponse(archive.archives(), headers=NO_STORE)


@app.get("/images/{path:path}")
def image_file(path: str):
    base = settings.images_dir.resolve()
    target = (base / path).resolve()
    if base not in target.parents or not target.is_file() or target.name.endswith(".part"):
        raise HTTPException(status_code=404)
    if target.suffix == ".zip":
        return FileResponse(target, filename=target.name, media_type="application/zip")
    return FileResponse(target)
