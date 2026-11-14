"""Image archive: every decoded image is kept forever.

* Each image from ``data/complete/<id>/`` is copied as a plain file to
  ``/data/images/<YYYY>/<MM>/<id>/<name>`` (month of the pass start, UTC).
  These files are never deleted: the 3-month cleanup does not touch /data/images.
* Every 2 calendar months (UTC: 1.01–28/29.02, 1.03–30.04, 1.05–30.06,
  1.07–31.08, 1.09–31.10, 1.11–31.12, each 00:00:00–23:59:59) one ZIP of that
  period is written to ``/data/images/archives/`` once the period has ended.
  ZIP files are never deleted either.
* Image info lives in its own tables (``images``, ``image_archives``), which the
  3-month cleanup never touches, so old images stay visible in the monitor.

Image type: SSTV by the ``_sstv`` file name; LRPT, SSDV by the decoder stage in the
observation metadata; everything else is a packet image (assembled from the
satellite's own frames).
"""

import json
import logging
import shutil
import zipfile
from datetime import UTC, datetime, timedelta
from pathlib import Path

from monitor import db
from monitor.config import settings

log = logging.getLogger("monitor")

PERIOD_MONTHS = 2

IMAGES_SCHEMA = """
CREATE TABLE IF NOT EXISTS images (
    observation_id VARCHAR,
    name           VARCHAR,
    path           VARCHAR,
    kind           VARCHAR,
    started_at     TIMESTAMP,
    stopped_at     TIMESTAMP,
    norad          INTEGER,
    mode           VARCHAR,
    baud           INTEGER,
    frequency_hz   BIGINT,
    size_bytes     BIGINT,
    archived_at    TIMESTAMP,
    PRIMARY KEY (observation_id, name)
);
"""

ARCHIVES_SCHEMA = """
CREATE TABLE IF NOT EXISTS image_archives (
    period     VARCHAR PRIMARY KEY,
    file       VARCHAR,
    images     INTEGER,
    size_bytes BIGINT,
    created_at TIMESTAMP
);
"""


def init() -> None:
    db.query(IMAGES_SCHEMA)
    db.query(ARCHIVES_SCHEMA)


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


# --- periods ---------------------------------------------------------------------

def period_start(when: datetime) -> datetime:
    month = ((when.month - 1) // PERIOD_MONTHS) * PERIOD_MONTHS + 1
    return datetime(when.year, month, 1)


def period_end(start: datetime) -> datetime:
    """First moment of the next period (exclusive end)."""
    month = start.month + PERIOD_MONTHS
    return datetime(start.year + (month - 1) // 12, (month - 1) % 12 + 1, 1)


def period_name(start: datetime) -> str:
    last = start.month + PERIOD_MONTHS - 1
    return f"{start.year}-{start.month:02d}_{start.year}-{last:02d}"


# --- image type ------------------------------------------------------------------

def _metadata(directory: Path) -> dict:
    files = sorted(directory.glob("metadata_*.json"))
    if not files:
        return {}
    try:
        return json.loads(files[-1].read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def image_kind(name: str, md: dict) -> str:
    if "_sstv" in Path(name).stem.lower():
        return "sstv"
    reception = md.get("reception") or {}
    parts = ((md.get("stages") or {}).get("decoder") or {}).get("parts") or {}
    if "LRPT" in str(reception.get("mode", "")).upper() or (parts.get("meteor") or {}).get("status") == "ok":
        return "lrpt"
    if (parts.get("ssdv") or {}).get("status") == "ok":
        return "ssdv"
    return "packet"


# --- copy new images ---------------------------------------------------------------

def collect() -> int:
    """Copy images of new observations into /data/images. Returns how many were added."""

    settings.images_dir.mkdir(parents=True, exist_ok=True)
    known = {(r["observation_id"], r["name"])
             for r in db.query("SELECT observation_id, name FROM images")}
    rows = db.query(
        "SELECT observation_id, started_at, stopped_at, norad, mode, frequency_hz, images "
        "FROM observations WHERE images IS NOT NULL AND len(images) > 0"
    )

    added = 0
    for row in rows:
        names = [n for n in (row["images"] or []) if (row["observation_id"], n) not in known]
        if not names:
            continue
        src_dir = settings.complete_dir / row["observation_id"]
        md = _metadata(src_dir)
        reception = md.get("reception") or {}
        baud = reception.get("baud")
        started = row["started_at"] or _now()

        for name in names:
            src = src_dir / name
            if not src.is_file():
                continue
            rel = Path(f"{started.year:04d}") / f"{started.month:02d}" / row["observation_id"] / name
            dst = settings.images_dir / rel
            try:
                dst.parent.mkdir(parents=True, exist_ok=True)
                if not dst.is_file() or dst.stat().st_size != src.stat().st_size:
                    tmp = dst.with_name(dst.name + ".part")
                    shutil.copy2(src, tmp)
                    tmp.replace(dst)
            except OSError as e:
                log.warning("archive %s/%s: %s", row["observation_id"], name, e)
                continue

            db.query(
                "INSERT OR REPLACE INTO images (observation_id, name, path, kind, started_at, "
                "stopped_at, norad, mode, baud, frequency_hz, size_bytes, archived_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [row["observation_id"], name, rel.as_posix(), image_kind(name, md),
                 row["started_at"], row["stopped_at"], row["norad"], row["mode"],
                 int(baud) if isinstance(baud, int | float) else None,
                 row["frequency_hz"], dst.stat().st_size, _now()],
            )
            added += 1
    if added:
        log.info("archive: %s new images", added)
    return added


# --- 2-month ZIP files ----------------------------------------------------------------

def build_archives() -> int:
    """Write the ZIP of every ended period that has images and no up-to-date ZIP."""

    archives_dir = settings.images_dir / "archives"
    rows = db.query("SELECT observation_id, name, path, started_at FROM images "
                    "WHERE started_at IS NOT NULL ORDER BY started_at, observation_id, name")
    periods: dict[datetime, list[dict]] = {}
    for row in rows:
        periods.setdefault(period_start(row["started_at"]), []).append(row)

    done = {r["period"]: r["images"] for r in db.query("SELECT period, images FROM image_archives")}
    now = _now()
    built = 0
    for start, items in sorted(periods.items()):
        name = period_name(start)
        if period_end(start) > now or done.get(name) == len(items):
            continue
        archives_dir.mkdir(parents=True, exist_ok=True)
        target = archives_dir / f"images_{name}.zip"
        tmp = target.with_name(target.name + ".part")
        try:
            with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_STORED) as zf:
                for item in items:
                    src = settings.images_dir / item["path"]
                    if src.is_file():
                        zf.write(src, arcname=item["path"])
            tmp.replace(target)
        except OSError as e:
            log.warning("archive zip %s: %s", name, e)
            tmp.unlink(missing_ok=True)
            continue
        db.query(
            "INSERT OR REPLACE INTO image_archives (period, file, images, size_bytes, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            [name, f"archives/{target.name}", len(items), target.stat().st_size, now],
        )
        log.info("archive: %s (%s images)", target.name, len(items))
        built += 1
    return built


def run() -> None:
    collect()
    build_archives()


# --- for the web page -------------------------------------------------------------

def _iso(value: datetime | None) -> str | None:
    return value.strftime("%Y-%m-%dT%H:%M:%SZ") if value else None


def count() -> int:
    return db.query("SELECT count(*) AS n FROM images")[0]["n"]


def listing(limit: int, offset: int, names: dict[int, str]) -> dict:
    rows = db.query(
        "SELECT * FROM images ORDER BY started_at DESC, observation_id DESC, name LIMIT ? OFFSET ?",
        [limit, offset],
    )
    return {
        "total": count(),
        "items": [
            {**r, "started_at": _iso(r["started_at"]), "stopped_at": _iso(r["stopped_at"]),
             "archived_at": _iso(r["archived_at"]), "satellite": names.get(r["norad"]),
             "url": f"/images/{r['path']}"}
            for r in rows
        ],
    }


def archives() -> list[dict]:
    rows = db.query("SELECT * FROM image_archives ORDER BY period DESC")
    out = []
    for r in rows:
        first_year, first_month = (int(x) for x in r["period"].split("_")[0].split("-"))
        start = datetime(first_year, first_month, 1)
        out.append({
            "period": r["period"],
            "from": _iso(start),
            "to": _iso(period_end(start) - timedelta(seconds=1)),
            "images": r["images"],
            "size_bytes": r["size_bytes"],
            "created_at": _iso(r["created_at"]),
            "url": f"/images/{r['file']}",
        })
    return out
