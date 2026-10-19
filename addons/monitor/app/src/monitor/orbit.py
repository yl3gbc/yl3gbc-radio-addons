"""Orbit / map tab: upcoming passes of this station, satellite positions now, pass tracks.

TLEs come with the station's jobs from the portal (``/api/jobs/``), so every pass is
computed with exactly the TLE the client will use. Propagation is SGP4 (python-sgp4);
TEME -> Earth-fixed uses GMST (IAU 1982), geodetic coordinates are WGS84. All times UTC.
"""

import math
import threading
import time
from datetime import UTC, datetime, timedelta

from sgp4.api import Satrec, jday

from monitor import journal, portal
from monitor.config import settings

HORIZON_HOURS = 24
MAX_PASSES = 40
TRACK_STEP_S = 10          # polar plot / ground track step during a pass
ORBIT_AHEAD_MIN = 95       # ground track ahead of "now" for the selected satellite
ORBIT_STEP_S = 60
CACHE_S = 30

WGS84_A = 6378.137
WGS84_F = 1 / 298.257223563
WGS84_E2 = WGS84_F * (2 - WGS84_F)
EARTH_R = 6371.0

_cache: tuple[float, dict] | None = None
_lock = threading.Lock()


# --- geometry -----------------------------------------------------------------------------

def _gmst(t: datetime) -> float:
    """Greenwich mean sidereal time, radians (IAU 1982)."""

    jd_whole, jd_frac = jday(t.year, t.month, t.day, t.hour, t.minute,
                             t.second + t.microsecond / 1e6)
    tut1 = (jd_whole + jd_frac - 2451545.0) / 36525.0
    seconds = (67310.54841 + (876600.0 * 3600 + 8640184.812866) * tut1
               + 0.093104 * tut1 ** 2 - 6.2e-6 * tut1 ** 3)
    return math.radians((seconds % 86400.0) / 240.0)


def _teme_to_ecef(r: tuple, t: datetime) -> tuple[float, float, float]:
    g = _gmst(t)
    cos_g, sin_g = math.cos(g), math.sin(g)
    x, y, z = r
    return (cos_g * x + sin_g * y, -sin_g * x + cos_g * y, z)


def _geodetic(ecef: tuple) -> tuple[float, float, float]:
    """ECEF km -> latitude, longitude (degrees), altitude km (WGS84)."""

    x, y, z = ecef
    lon = math.atan2(y, x)
    p = math.hypot(x, y)
    lat = math.atan2(z, p * (1 - WGS84_E2))
    for _ in range(5):
        n = WGS84_A / math.sqrt(1 - WGS84_E2 * math.sin(lat) ** 2)
        alt = p / math.cos(lat) - n
        lat = math.atan2(z, p * (1 - WGS84_E2 * n / (n + alt)))
    n = WGS84_A / math.sqrt(1 - WGS84_E2 * math.sin(lat) ** 2)
    alt = p / math.cos(lat) - n
    return math.degrees(lat), math.degrees(lon), alt


def _station_ecef(lat: float, lon: float, alt_km: float) -> tuple[float, float, float]:
    la, lo = math.radians(lat), math.radians(lon)
    n = WGS84_A / math.sqrt(1 - WGS84_E2 * math.sin(la) ** 2)
    return ((n + alt_km) * math.cos(la) * math.cos(lo),
            (n + alt_km) * math.cos(la) * math.sin(lo),
            (n * (1 - WGS84_E2) + alt_km) * math.sin(la))


def _look(sat_ecef: tuple, st_ecef: tuple, lat: float, lon: float) -> tuple[float, float]:
    """Azimuth, elevation (degrees) of the satellite from the station."""

    dx, dy, dz = (s - o for s, o in zip(sat_ecef, st_ecef, strict=True))
    la, lo = math.radians(lat), math.radians(lon)
    east = -math.sin(lo) * dx + math.cos(lo) * dy
    north = (-math.sin(la) * math.cos(lo) * dx - math.sin(la) * math.sin(lo) * dy
             + math.cos(la) * dz)
    up = (math.cos(la) * math.cos(lo) * dx + math.cos(la) * math.sin(lo) * dy
          + math.sin(la) * dz)
    az = (math.degrees(math.atan2(east, north)) + 360) % 360
    el = math.degrees(math.atan2(up, math.hypot(east, north)))
    return az, el


def _position(sat: Satrec, t: datetime) -> tuple | None:
    """Earth-fixed position km at ``t`` or None when SGP4 fails."""

    jd, fr = jday(t.year, t.month, t.day, t.hour, t.minute, t.second + t.microsecond / 1e6)
    err, r, _ = sat.sgp4(jd, fr)
    if err != 0:
        return None
    return _teme_to_ecef(r, t)


def _footprint_deg(alt_km: float) -> float:
    """Angular radius (degrees) of the area that sees the satellite above 0° elevation."""

    return math.degrees(math.acos(EARTH_R / (EARTH_R + max(alt_km, 0.0))))


# --- data -----------------------------------------------------------------------------------

def _time(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _iso(t: datetime) -> str:
    return t.strftime("%Y-%m-%dT%H:%M:%SZ")


_ALPHA5 = "ABCDEFGHJKLMNPQRSTUVWXYZ"  # Alpha-5: A=10 … Z=33, without I and O


def _norad(tle1: str) -> int | None:
    """NORAD number from TLE line 1, including Alpha-5 (``A0470`` -> 100470)."""

    try:
        field = tle1[2:7].strip()
        if field and field[0].isalpha():
            return (10 + _ALPHA5.index(field[0].upper())) * 10000 + int(field[1:])
        return int(field)
    except (TypeError, ValueError, IndexError):
        return None


def _pass(job: dict, sat: Satrec, st: tuple, lat: float, lon: float) -> dict | None:
    start, end = _time(job.get("start")), _time(job.get("end"))
    if start is None or end is None or end <= start:
        return None

    polar, ground = [], []
    best = (-90.0, None, None)
    t = start
    while t <= end:
        ecef = _position(sat, t)
        if ecef is not None:
            az, el = _look(ecef, st, lat, lon)
            slat, slon, _ = _geodetic(ecef)
            polar.append([round(az, 1), round(el, 1)])
            ground.append([round(slat, 2), round(slon, 2)])
            if el > best[0]:
                best = (el, az, t)
        t += timedelta(seconds=TRACK_STEP_S)

    if not polar:
        return None
    return {
        "aos_az": polar[0][0],
        "los_az": polar[-1][0],
        "max_el": round(best[0], 1),
        "max_az": round(best[1], 1),
        "max_at": _iso(best[2]),
        "polar": polar,
        "ground": ground,
    }


def _now_and_orbit(sat: Satrec, now: datetime) -> dict | None:
    ecef = _position(sat, now)
    if ecef is None:
        return None
    lat, lon, alt = _geodetic(ecef)
    orbit = []
    for k in range(0, ORBIT_AHEAD_MIN * 60 + 1, ORBIT_STEP_S):
        e = _position(sat, now + timedelta(seconds=k))
        if e is not None:
            la, lo, _ = _geodetic(e)
            orbit.append([round(la, 2), round(lo, 2)])
    return {
        "lat": round(lat, 2), "lon": round(lon, 2), "alt_km": round(alt, 1),
        "footprint_deg": round(_footprint_deg(alt), 2), "orbit": orbit,
    }


def _compute() -> dict:
    now = datetime.now(UTC)
    card = portal.station(settings.station_id) or {}
    lat, lon = card.get("lat"), card.get("lng")
    alt_km = (card.get("altitude") or 0) / 1000.0
    station = {"id": settings.station_id, "name": card.get("name"),
               "lat": lat, "lon": lon, "alt_m": card.get("altitude"),
               "qthlocator": card.get("qthlocator")}
    if lat is None or lon is None:
        return {"now": _iso(now), "station": station, "passes": [], "error": "no station position"}

    st = _station_ecef(lat, lon, alt_km)
    names = journal.satellite_names()
    horizon = now + timedelta(hours=HORIZON_HOURS)

    jobs = []
    for job in portal.jobs(settings.station_id) or []:
        end = _time(job.get("end"))
        start = _time(job.get("start"))
        if start is None or end is None or end < now or start > horizon:
            continue
        jobs.append((start, job))
    jobs.sort(key=lambda x: x[0])

    passes, sats = [], {}
    for start, job in jobs[:MAX_PASSES]:
        tle1, tle2 = job.get("tle1"), job.get("tle2")
        if not tle1 or not tle2:
            continue
        try:
            sat = Satrec.twoline2rv(tle1, tle2)
        except Exception:
            continue
        norad = _norad(tle1)
        geometry = _pass(job, sat, st, lat, lon)
        if geometry is None:
            continue
        name = names.get(norad) or job.get("tle0") or f"NORAD {norad}"
        passes.append({
            "id": job.get("id"),
            "norad": norad,
            "satellite": name,
            "start": job.get("start"),
            "end": job.get("end"),
            "frequency_hz": job.get("frequency"),
            "mode": job.get("mode"),
            "running": start <= now <= _time(job.get("end")),
            **geometry,
        })
        if norad not in sats:
            position = _now_and_orbit(sat, now)
            if position is not None:
                sats[norad] = {"norad": norad, "satellite": name, **position}

    return {"now": _iso(now), "station": station, "passes": passes,
            "satellites": list(sats.values())}


def orbit() -> dict:
    """Cached for ``CACHE_S`` seconds: positions move, but SGP4 for 40 passes is not free."""

    global _cache
    with _lock:
        if _cache and time.monotonic() - _cache[0] < CACHE_S:
            return _cache[1]
    data = _compute()
    with _lock:
        _cache = (time.monotonic(), data)
    return data
