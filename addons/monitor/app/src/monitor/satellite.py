"""Satellite tab: one satellite over all stored days (up to the retention period).

Totals and averages, a per-day series, the best observation and the latest observations.
Names come from the same source as the journal (portal first, satyaml for the rest).
"""

from datetime import datetime

from monitor import db, journal

LATEST = 50


def _iso(value: datetime | None) -> str | None:
    return value.strftime("%Y-%m-%dT%H:%M:%SZ") if value else None


def _r1(value):
    return round(value, 1) if isinstance(value, int | float) else None


def satellites() -> list[dict]:
    """Every satellite with observations: NORAD, name, count, last observation."""

    rows = db.query(
        "SELECT norad, count(*) AS observations, max(started_at) AS last "
        "FROM observations WHERE norad IS NOT NULL GROUP BY norad ORDER BY observations DESC, norad"
    )
    names = journal.satellite_names()
    return [
        {"norad": r["norad"], "satellite": names.get(r["norad"]),
         "observations": r["observations"], "last": _iso(r["last"])}
        for r in rows
    ]


def satellite(norad: int) -> dict:
    names = journal.satellite_names()

    total = db.query(
        "SELECT count(*) AS observations, count(*) FILTER (WHERE decodable) AS decoded, "
        "coalesce(sum(packets), 0) AS packets, coalesce(sum(len(images)), 0) AS images, "
        "avg(snr_db) AS avg_snr_db, avg(noise_db) AS avg_noise_db, avg(peak_db) AS avg_peak_db, "
        "max(snr_db) AS best_snr_db, min(started_at) AS first, max(started_at) AS last "
        "FROM observations WHERE norad = ?",
        [norad],
    )[0]

    days = db.query(
        "SELECT CAST(started_at AS DATE) AS day, count(*) AS observations, "
        "count(*) FILTER (WHERE decodable) AS decoded, coalesce(sum(packets), 0) AS packets, "
        "avg(snr_db) AS avg_snr_db, avg(noise_db) AS avg_noise_db, avg(peak_db) AS avg_peak_db, "
        "max(snr_db) AS best_snr_db "
        "FROM observations WHERE norad = ? AND started_at IS NOT NULL "
        "GROUP BY 1 ORDER BY 1 DESC",
        [norad],
    )

    latest = db.query(
        "SELECT * FROM observations WHERE norad = ? ORDER BY started_at DESC LIMIT ?",
        [norad, LATEST],
    )

    best = db.query(
        "SELECT * FROM observations WHERE norad = ? AND snr_db IS NOT NULL "
        "ORDER BY snr_db DESC LIMIT 1",
        [norad],
    )

    def obs(r: dict) -> dict:
        return {**r, "started_at": _iso(r["started_at"]), "stopped_at": _iso(r["stopped_at"]),
                "satellite": names.get(norad)}

    return {
        "norad": norad,
        "satellite": names.get(norad),
        "summary": {
            "observations": total["observations"],
            "decoded": total["decoded"],
            "packets": int(total["packets"]),
            "images": int(total["images"]),
            "avg_snr_db": _r1(total["avg_snr_db"]),
            "avg_noise_db": _r1(total["avg_noise_db"]),
            "avg_peak_db": _r1(total["avg_peak_db"]),
            "best_snr_db": _r1(total["best_snr_db"]),
            "first": _iso(total["first"]),
            "last": _iso(total["last"]),
        },
        "days": [
            {
                "date": d["day"].isoformat(),
                "observations": d["observations"],
                "decoded": d["decoded"],
                "packets": int(d["packets"]),
                "avg_snr_db": _r1(d["avg_snr_db"]),
                "avg_noise_db": _r1(d["avg_noise_db"]),
                "avg_peak_db": _r1(d["avg_peak_db"]),
                "best_snr_db": _r1(d["best_snr_db"]),
            }
            for d in days
        ],
        "best": obs(best[0]) if best else None,
        "latest": [obs(r) for r in latest],
    }
