"""History page: the station day by day over the last 7 / 30 / 90 days (UTC)."""

from datetime import UTC, datetime, timedelta

from monitor import db


def _r1(value):
    return round(value, 1) if isinstance(value, int | float) else None


def history(days: int) -> dict:
    days = max(1, min(days, 90))
    today = datetime.now(UTC).date()
    first = today - timedelta(days=days - 1)
    start = datetime(first.year, first.month, first.day)

    rows = db.query(
        "SELECT CAST(started_at AS DATE) AS day, count(*) AS observations, "
        "count(*) FILTER (WHERE decodable) AS decoded, coalesce(sum(packets), 0) AS packets, "
        "count(DISTINCT norad) AS satellites, avg(snr_db) AS avg_snr_db, avg(noise_db) AS avg_noise_db "
        "FROM observations WHERE started_at >= ? GROUP BY 1 ORDER BY 1",
        [start],
    )
    by_day = {r["day"]: r for r in rows}

    series = []
    for k in range(days):
        d = first + timedelta(days=k)
        r = by_day.get(d)
        series.append({
            "date": d.isoformat(),
            "observations": r["observations"] if r else 0,
            "decoded": r["decoded"] if r else 0,
            "packets": int(r["packets"]) if r else 0,
            "satellites": r["satellites"] if r else 0,
            "avg_snr_db": _r1(r["avg_snr_db"]) if r else None,
            "avg_noise_db": _r1(r["avg_noise_db"]) if r else None,
        })

    total = db.query(
        "SELECT count(*) AS observations, count(*) FILTER (WHERE decodable) AS decoded, "
        "coalesce(sum(packets), 0) AS packets, count(DISTINCT norad) AS satellites, "
        "avg(snr_db) AS avg_snr_db, avg(noise_db) AS avg_noise_db "
        "FROM observations WHERE started_at >= ?",
        [start],
    )[0]
    active = [s for s in series if s["observations"]]
    best = max(active, key=lambda s: (s["decoded"], s["packets"]), default=None)

    return {
        "days": days,
        "from": first.isoformat(),
        "to": today.isoformat(),
        "summary": {
            "observations": total["observations"],
            "decoded": total["decoded"],
            "packets": int(total["packets"]),
            "satellites": total["satellites"],
            "avg_snr_db": _r1(total["avg_snr_db"]),
            "avg_noise_db": _r1(total["avg_noise_db"]),
            "active_days": len(active),
            "best_day": best["date"] if best else None,
            "best_day_decoded": best["decoded"] if best else None,
        },
        "series": series,
    }
