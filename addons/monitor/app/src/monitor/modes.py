"""Signal tab, "by mode": at which SNR each mode (modulation + baud) still decodes.

One row per (mode, baud) over the last ``days`` days: passes, decoded passes, packets,
the lowest SNR that still gave packets or images, the average SNR of decoded and of
undecoded passes, and the share of decoded passes in SNR bands. All from the monitor's
own database (client metadata), nothing from the portal.
"""

from datetime import UTC, datetime, timedelta

from monitor import db

BANDS = [None, 5, 10, 15, 20, None]   # <5, 5-10, 10-15, 15-20, >=20 dB


def _r1(value):
    return round(value, 1) if isinstance(value, int | float) else None


def _band_sql() -> str:
    parts = []
    for i in range(len(BANDS) - 1):
        lo, hi = BANDS[i], BANDS[i + 1]
        cond = " AND ".join(c for c in (
            f"snr_db >= {lo}" if lo is not None else "",
            f"snr_db < {hi}" if hi is not None else "") if c)
        parts.append(f"count(*) FILTER (WHERE snr_db IS NOT NULL AND {cond}) AS b{i}_n")
        parts.append(f"count(*) FILTER (WHERE snr_db IS NOT NULL AND {cond} AND decodable) AS b{i}_ok")
    return ", ".join(parts)


def _labels() -> list[str]:
    out = []
    for i in range(len(BANDS) - 1):
        lo, hi = BANDS[i], BANDS[i + 1]
        out.append(f"<{hi}" if lo is None else f"≥{lo}" if hi is None else f"{lo}–{hi}")
    return out


def _rows(days: int, pairs: list[tuple] | None = None) -> list[dict]:
    since = (datetime.now(UTC) - timedelta(days=days)).replace(tzinfo=None)
    rows = db.query(
        "SELECT mode, baud, count(*) AS passes, count(*) FILTER (WHERE decodable) AS decoded, "
        "coalesce(sum(packets), 0) AS packets, "
        "min(snr_db) FILTER (WHERE decodable) AS min_snr_decoded, "
        "avg(snr_db) FILTER (WHERE decodable) AS avg_snr_decoded, "
        "avg(snr_db) FILTER (WHERE NOT decodable) AS avg_snr_failed, "
        f"{_band_sql()} "
        "FROM observations WHERE started_at >= ? AND mode IS NOT NULL "
        "GROUP BY mode, baud ORDER BY passes DESC, mode, baud",
        [since],
    )
    out = []
    for r in rows:
        if pairs is not None and (r["mode"], r["baud"]) not in pairs:
            continue
        out.append({
            "mode": r["mode"],
            "baud": r["baud"],
            "passes": r["passes"],
            "decoded": r["decoded"],
            "packets": int(r["packets"]),
            "min_snr_decoded": _r1(r["min_snr_decoded"]),
            "avg_snr_decoded": _r1(r["avg_snr_decoded"]),
            "avg_snr_failed": _r1(r["avg_snr_failed"]),
            "bands": [{"n": r[f"b{i}_n"], "ok": r[f"b{i}_ok"]} for i in range(len(BANDS) - 1)],
        })
    return out


def modes(days: int = 90) -> dict:
    days = max(1, min(int(days), 3650))
    return {"days": days, "bands": _labels(), "modes": _rows(days)}


def for_satellite(norad: int, days: int = 90) -> list[dict]:
    """Global per-mode figures for the modes this satellite was observed in."""

    pairs = {(r["mode"], r["baud"]) for r in db.query(
        "SELECT DISTINCT mode, baud FROM observations WHERE norad = ? AND mode IS NOT NULL", [norad])}
    return _rows(days, pairs) if pairs else []
