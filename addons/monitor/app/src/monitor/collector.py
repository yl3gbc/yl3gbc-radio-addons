"""Reads the client (read-only) and publishes to the local mosquitto.

Topics:
    soniks/<id>/health  station state from /healthz
    soniks/<id>/pass    per observation: signal, noise, decodable
"""

import json
import logging
import shutil
import threading
import time
import urllib.error
import urllib.request
from datetime import UTC, datetime, timedelta
from pathlib import Path

import paho.mqtt.client as paho

from monitor import db
from monitor.config import settings

log = logging.getLogger("monitor")

_health: dict | None = None
_health_lock = threading.Lock()
_mqtt: paho.Client | None = None


def health() -> dict | None:
    with _health_lock:
        return _health


def _now_iso() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def _publish(kind: str, payload: dict) -> None:
    if _mqtt is None:
        return
    topic = f"soniks/{settings.station_id}/{kind}"
    _mqtt.publish(topic, json.dumps(payload), qos=1)


def start_mqtt() -> None:
    global _mqtt
    client = paho.Client(
        paho.CallbackAPIVersion.VERSION2,
        client_id=f"monitor-{settings.station_id}",
    )
    client.reconnect_delay_set(min_delay=1, max_delay=60)
    client.connect_async(settings.mqtt_host, settings.mqtt_port, keepalive=60)
    client.loop_start()
    _mqtt = client


# --- /healthz -----------------------------------------------------------------

def _poll_health() -> None:
    global _health
    try:
        with urllib.request.urlopen(settings.client_health_url, timeout=5) as r:
            body = json.load(r)
            body["http_status"] = r.status
    except urllib.error.HTTPError as e:
        body = json.load(e)
        body["http_status"] = e.code
    except Exception as e:
        log.warning("healthz: %s", e)
        body = {"http_status": 0}

    body["checked_at"] = _now_iso()
    with _health_lock:
        _health = body

    seconds_to_next = None
    if body.get("next_observation"):
        nxt = datetime.fromisoformat(body["next_observation"])
        seconds_to_next = int((nxt - datetime.now(UTC)).total_seconds())

    payload = {
        "time": body["checked_at"],
        "healthy": int(body["http_status"] == 200),
        "scheduler_running": int(bool(body.get("scheduler_running"))),
        "executor_alive": int(bool(body.get("executor_alive"))),
        "observation_running": int(bool(body.get("observation_running"))),
        "receiver_deaf": int(body.get("receiver_deaf") is not None),
    }
    for key in ("incomplete", "incomplete_oldest_age_seconds",
                "last_sync_age_seconds", "clock_skew_seconds"):
        if isinstance(body.get(key), int | float):
            payload[key] = body[key]
    if seconds_to_next is not None:
        payload["seconds_to_next_observation"] = seconds_to_next

    _publish("health", payload)


# --- data/complete --------------------------------------------------------------

def _read_observation(directory: Path) -> dict | None:
    metadata_files = sorted(directory.glob("metadata_*.json"))
    if not metadata_files:
        return None

    md = json.loads(metadata_files[-1].read_text(encoding="utf-8"))
    reception = md.get("reception") or {}
    signal = md.get("signal") or {}
    decoder_stage = (md.get("stages") or {}).get("decoder") or {}

    data_files = sorted(p.name for p in directory.glob("data_*") if p.is_file())
    images = [n for n in data_files if n.endswith((".png", ".jpg", ".jpeg"))]
    waterfall = next((p.name for p in sorted(directory.glob("waterfall_*.png"))), None)
    packets = len([n for n in data_files if n not in images])

    def ts(key: str):
        value = reception.get(key)
        return datetime.fromisoformat(value.replace("Z", "+00:00")) if value else None

    started = ts("started_at") or datetime.fromtimestamp(directory.stat().st_mtime, UTC)

    return {
        "observation_id": directory.name,
        "started_at": started,
        "stopped_at": ts("stopped_at"),
        "norad": int(reception["norad"]) if str(reception.get("norad", "")).isdigit() else None,
        "mode": reception.get("mode"),
        "decoder": str(reception["decoder"]) if reception.get("decoder") is not None else None,
        "frequency_hz": int(reception["frequency_hz"])
        if isinstance(reception.get("frequency_hz"), int | float) else None,
        "snr_db": signal.get("snr_db"),
        "noise_db": signal.get("noise_db"),
        "peak_db": signal.get("peak_db"),
        "packets": packets,
        "decodable": packets > 0 or bool(images),
        "decoder_status": decoder_stage.get("status"),
        "waterfall": waterfall,
        "images": images,
    }


def _scan_complete() -> None:
    if not settings.complete_dir.is_dir():
        return

    known = db.known_ids()
    for directory in sorted(settings.complete_dir.iterdir()):
        if not directory.is_dir() or directory.name in known:
            continue
        try:
            row = _read_observation(directory)
        except Exception as e:
            log.warning("observation %s: %s", directory.name, e)
            continue
        if row is None:
            continue

        db.insert_observation(row)

        payload = {
            "time": row["started_at"].strftime("%Y-%m-%dT%H:%M:%SZ"),
            "observation_id": row["observation_id"],
            "packets": row["packets"],
            "decodable": int(row["decodable"]),
        }
        for key in ("snr_db", "noise_db", "peak_db"):
            if isinstance(row[key], int | float):
                payload[key] = row[key]
        for key in ("norad", "mode", "decoder"):
            if row[key] is not None:
                payload[key] = str(row[key])
        _publish("pass", payload)


# --- 3-month retention ------------------------------------------------------------

def _cleanup() -> None:
    cutoff = datetime.now(UTC) - timedelta(days=settings.retention_days)
    db.delete_older_than(cutoff)

    if not settings.complete_dir.is_dir():
        return
    for directory in settings.complete_dir.iterdir():
        try:
            if datetime.fromtimestamp(directory.stat().st_mtime, UTC) < cutoff:
                shutil.rmtree(directory) if directory.is_dir() else directory.unlink()
        except OSError as e:
            log.warning("cleanup %s: %s", directory, e)


# --- loops ----------------------------------------------------------------------------

def _loop(name: str, interval: int, func) -> None:
    def run():
        while True:
            try:
                func()
            except Exception:
                log.exception("%s failed", name)
            time.sleep(interval)

    threading.Thread(target=run, name=name, daemon=True).start()


def start() -> None:
    start_mqtt()
    _loop("health", settings.health_interval, _poll_health)
    _loop("scan", settings.scan_interval, _scan_complete)
    _loop("cleanup", 3600, _cleanup)
