"""Portal sonik.space: station cards, today's statistics, future jobs, owner, online stations.

JSON API (``/api/...``) where it has the data (online = ``"status": "Online"``); the owner
is not in the API, so it is read from the public station page ``/stations/<id>/``.
Used for the own station and for "Сравнить". All times are UTC.
"""

import json
import re
import threading
import time
import urllib.request
from datetime import UTC, datetime
from urllib.parse import urlencode, urljoin, urlsplit

from monitor.config import settings

MAX_PAGES = 40

_cache: dict[tuple, tuple[float, object]] = {}
_lock = threading.Lock()


def _cached(key: tuple, fetch, max_age: float | None = None):
    """Return a cached value for ``portal_interval`` seconds; on error the last good one."""

    max_age = settings.portal_interval if max_age is None else max_age
    now = time.monotonic()
    with _lock:
        cached = _cache.get(key)
        if cached and now - cached[0] < max_age:
            return cached[1]
    try:
        value = fetch()
    except Exception:
        return cached[1] if cached else None
    with _lock:
        _cache[key] = (now, value)
    return value


def _get(url: str):
    with urllib.request.urlopen(url, timeout=10) as response:
        return json.load(response), response.headers.get("Link", "")


def _site(path: str) -> str:
    """Absolute URL on the portal site (not under /api/)."""

    parts = urlsplit(settings.portal_api)
    return f"{parts.scheme}://{parts.netloc}{path}"


def _get_html(url: str) -> str:
    with urllib.request.urlopen(url, timeout=10) as response:
        return response.read().decode("utf-8", errors="replace")


def _next_link(link_header: str) -> str | None:
    match = re.search(r'<([^>]+)>\s*;\s*rel="next"', link_header or "")
    return match.group(1) if match else None


def _pages(path: str, params: dict):
    """Yield items of a list endpoint, following the ``Link: rel="next"`` pages."""

    url = urljoin(settings.portal_api, path) + "?" + urlencode(params)
    for _ in range(MAX_PAGES):
        data, link = _get(url)
        items = data.get("results", []) if isinstance(data, dict) else data
        yield from items
        url = _next_link(link)
        if not url:
            return


def _time(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def station(station_id: int) -> dict | None:
    """Station record from ``/api/stations/<id>/``."""

    def fetch():
        data, _ = _get(urljoin(settings.portal_api, f"stations/{station_id}/"))
        return data

    return _cached(("station", station_id), fetch)


def today(station_id: int) -> dict | None:
    """Today (UTC) from ``/api/observations/``: observations started, satellites, packets.

    Future observations (not started yet) are not counted.
    """

    def fetch():
        now = datetime.now(UTC)
        midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
        params = {
            "ground_station": station_id,
            "start": midnight.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        observations, packets, satellites = 0, 0, set()
        for obs in _pages("observations/", params):
            start = _time(obs.get("start"))
            if start is None or start > now:
                continue
            if start < midnight:
                break  # list is newest first
            observations += 1
            packets += int(obs.get("demoddata_count") or 0)
            if obs.get("norad_cat_id") is not None:
                satellites.add(obs["norad_cat_id"])
        return {"observations": observations, "satellites": len(satellites), "packets": packets}

    return _cached(("today", station_id), fetch)


def jobs(station_id: int) -> list[dict] | None:
    """All jobs of the station from ``/api/jobs/`` (with TLE), cached for ``portal_interval``."""

    return _cached(("joblist", station_id), lambda: list(_pages("jobs/", {"ground_station": station_id})))


def future_jobs(station_id: int) -> int | None:
    """Number of jobs from ``/api/jobs/`` that have not started yet."""

    def fetch():
        now = datetime.now(UTC)
        return sum(
            1 for job in _pages("jobs/", {"ground_station": station_id})
            if (start := _time(job.get("start"))) is not None and start > now
        )

    return _cached(("jobs", station_id), fetch)


_OWNER = re.compile(r'Владелец</div>.*?<a[^>]*href="/users/[^"]*"[^>]*>\s*([^<]+?)\s*</a>', re.S)


def owner(station_id: int) -> str | None:
    """Owner shown on ``/stations/<id>/`` (row "Владелец")."""

    def fetch():
        match = _OWNER.search(_get_html(_site(f"/stations/{station_id}/")))
        return match.group(1) if match else None

    return _cached(("owner", station_id), fetch)


def online_stations() -> list[dict] | None:
    """Stations with ``"status": "Online"`` in ``/api/stations/`` (id, name, QTH)."""

    def fetch():
        return sorted(
            (
                {"id": int(st["id"]), "name": st.get("name"), "qthlocator": st.get("qthlocator")}
                for st in _pages("stations/", {})
                if isinstance(st, dict) and st.get("id") is not None and st.get("status") == "Online"
            ),
            key=lambda st: st["id"],
        )

    return _cached(("online",), fetch)


def satellite_names() -> dict[int, str]:
    """NORAD -> satellite name from ``/api/satellites/``, cached for an hour."""

    def fetch():
        names = {}
        for sat in _pages("satellites/", {}):
            if not isinstance(sat, dict):
                continue
            norad = sat.get("norad_cat_id", sat.get("norad"))
            if norad is not None and sat.get("name"):
                names[int(norad)] = sat["name"]
        return names

    return _cached(("satellites",), fetch, max_age=3600) or {}
