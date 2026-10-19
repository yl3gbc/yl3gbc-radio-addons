"""Monitor settings from the environment (station .env + addon compose)."""

import os
from dataclasses import dataclass
from pathlib import Path


def _env(name: str, default: str) -> str:
    value = os.environ.get(name, "").strip()
    return value or default


@dataclass(frozen=True)
class Settings:
    station_id: int
    portal_api: str
    client_health_url: str
    complete_dir: Path
    db_path: Path
    satyaml_dir: Path
    mqtt_host: str
    mqtt_port: int
    port: int
    health_interval: int
    scan_interval: int
    portal_interval: int
    retention_days: int


settings = Settings(
    station_id=int(_env("STATION__ID", "0")),
    portal_api=_env("URL__BASE", "https://sonik.space/api/"),
    client_health_url=_env("MONITOR_CLIENT_HEALTH_URL", "http://soniks-client:8080/healthz"),
    complete_dir=Path(_env("MONITOR_COMPLETE_DIR", "/data/complete")),
    db_path=Path(_env("MONITOR_DB_PATH", "/data/monitor/monitor.duckdb")),
    satyaml_dir=Path(_env("MONITOR_SATYAML_DIR", "/satyaml")),
    mqtt_host=_env("MONITOR_MQTT_HOST", "mosquitto"),
    mqtt_port=int(_env("MONITOR_MQTT_PORT", "1883")),
    port=int(_env("MONITOR_PORT", "8090")),
    health_interval=int(_env("MONITOR_HEALTH_INTERVAL", "30")),
    scan_interval=int(_env("MONITOR_SCAN_INTERVAL", "60")),
    portal_interval=int(_env("MONITOR_PORTAL_INTERVAL", "300")),
    retention_days=int(_env("MONITOR_RETENTION_DAYS", "90")),
)
