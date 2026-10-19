"""Entry point: storage, collector threads, FastAPI under uvicorn."""

import logging

import uvicorn

from monitor import collector, db
from monitor.config import settings


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    logging.getLogger("monitor").info(
        "SONIKS Monitor: station %s, port %s", settings.station_id, settings.port
    )
    db.connect()
    collector.start()
    uvicorn.run("monitor.web:app", host="0.0.0.0", port=settings.port, log_level="warning")


if __name__ == "__main__":
    main()
