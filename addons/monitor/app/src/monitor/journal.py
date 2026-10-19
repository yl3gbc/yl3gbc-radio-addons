"""Daily journal: every observation of one UTC day with noise, signal, packets, images.

Averages for the whole day and per satellite. Satellite names come from satyaml
(``name:`` / ``norad:`` of each file), the same descriptions the client decodes with.
"""

import re
import threading
import time
from datetime import date, datetime, timedelta

from monitor import db
from monitor.config import settings

_NAME = re.compile(r"^name:\s*['\"]?(.+?)['\"]?\s*$", re.M)
_NORAD = re.compile(r"^norad:\s*(\d+)\s*$", re.M)

_names: dict[int, str] = {}
_names_loaded = 0.0
_lock = threading.Lock()


def satellite_names() -> dict[int, str]:
    """NORAD -> name from satyaml, re-read every 10 minutes."""

    global _names, _names_loaded
    with _lock:
        if time.monotonic() - _names_loaded < 600 and _names:
            return _names
        names = {}
        if settings.satyaml_dir.is_dir():
            for path in settings.satyaml_dir.glob("*.yml"):
                try:
                    text = path.read_text(encoding="utf-8", errors="replace")
                except OSError:
                    continue
                name, norad = _NAME.search(text), _NORAD.search(text)
                if name and norad:
                    names[int(norad.group(1))] = name.group(1)
        _names, _names_loaded = names, time.monotonic()
        return _names


def _avg(values: list) -> float | None:
    values = [v for v in values if isinstance(v, int | float)]
    return round(sum(values) / len(values), 1) if values else None


def _stats(rows: list[dict]) -> dict:
    return {
        "observations": len(rows),
        "satellites": len({r["norad"] for r in rows if r["norad"] is not None}),
        "decoded": sum(1 for r in rows if r["decodable"]),
        "packets": sum(r["packets"] or 0 for r in rows),
        "images": sum(len(r["images"] or []) for r in rows),
        "avg_noise_db": _avg([r["noise_db"] for r in rows]),
        "avg_snr_db": _avg([r["snr_db"] for r in rows]),
        "avg_peak_db": _avg([r["peak_db"] for r in rows]),
    }


def _iso(value: datetime | None) -> str | None:
    return value.strftime("%Y-%m-%dT%H:%M:%SZ") if value else None


def day(day_: date) -> dict:
    start = datetime(day_.year, day_.month, day_.day)
    rows = db.query(
        "SELECT * FROM observations WHERE started_at >= ? AND started_at < ? ORDER BY started_at",
        [start, start + timedelta(days=1)],
    )
    names = satellite_names()

    observations = []
    for r in rows:
        observations.append({
            **r,
            "started_at": _iso(r["started_at"]),
            "stopped_at": _iso(r["stopped_at"]),
            "satellite": names.get(r["norad"]) if r["norad"] is not None else None,
        })

    per_satellite = []
    by_norad: dict = {}
    for r in rows:
        by_norad.setdefault(r["norad"], []).append(r)
    for norad, group in by_norad.items():
        per_satellite.append({
            "norad": norad,
            "satellite": names.get(norad) if norad is not None else None,
            **_stats(group),
        })
    per_satellite.sort(key=lambda s: (-s["observations"], s["satellite"] or ""))

    return {
        "date": day_.isoformat(),
        "summary": _stats(rows),
        "per_satellite": per_satellite,
        "observations": observations,
    }


def days() -> list[dict]:
    """Days (UTC) that have observations, newest first, with their counts."""

    rows = db.query(
        "SELECT CAST(started_at AS DATE) AS day, count(*) AS observations "
        "FROM observations WHERE started_at IS NOT NULL GROUP BY 1 ORDER BY 1 DESC"
    )
    return [{"date": r["day"].isoformat(), "observations": r["observations"]} for r in rows]


def files(observation_id: str) -> list[str]:
    """Decoded data files (``data_*``) of one observation."""

    directory = settings.complete_dir / observation_id
    if not directory.is_dir():
        return []
    return sorted(p.name for p in directory.glob("data_*") if p.is_file())
