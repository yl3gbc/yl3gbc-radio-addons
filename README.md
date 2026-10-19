# SONIKS Monitor — дополнение

Дополнительный веб-монитор наземной станции СОНИКС (soniks-client 3.x), порт **8090**.
Ставится только по желанию — станция работает и без него.

Всё время — **UTC**. Языки интерфейса: русский (по умолчанию) и английский.

## Где находится

- Репозиторий: https://github.com/yl3gbc/yl3gbc-radio-addons
- Ветка: `monitor`
- Папка: `addons/monitor`

Получить только монитор:

```
cd ~
git clone --branch monitor --single-branch https://github.com/yl3gbc/yl3gbc-radio-addons.git yl3gbc-monitor
cp -r yl3gbc-monitor/addons/monitor ~/soniks-client-new/addons/
```

## Что показывает

- **Станция** — карточка станции с портала (название, QTH, версия клиента, всего наблюдений, владелец),
  наблюдения / спутники / пакеты за сегодня, будущие задания, описания satyaml, память, диск,
  архив изображений.
- **Сравнить** — любая станция: выбрать из списка станций в сети или ввести номер.
  Статистика за сегодня и будущие задания берутся с портала.
- **Дневной журнал** — все наблюдения выбранного дня: время, спутник, режим, частота,
  шум, SNR, пик, пакеты (с декодированными файлами), изображения и водопад.
  Средние за день — общие и по каждому спутнику. Любой день за последние 3 месяца.

Вкладки «Спутник», «Орбита / Карта» и «Сигнал / Waterfall» в разработке.

## Как работает

- Монитор читает клиента только на чтение: `/healthz` и завершённые наблюдения в `data/complete`
  (`metadata_*.json`, `data_*`, изображения, водопад).
- Наблюдения хранятся в DuckDB **2.1.0-dev** (коммит `e08224d653`) через библиотеку
  `db_dev2.1.0` (ветка `db_dev2.1.0`).
- Каждое наблюдение и состояние станции публикуются в локальный mosquitto
  (`soniks/<станция>/pass`, `soniks/<станция>/health`) → telegraf → InfluxDB → Grafana (порт 3000).
- Данные портала (карточка станции, владелец, сегодня, будущие задания, станции в сети) читаются
  с sonik.space и кешируются на 5 минут.
- Данные хранятся **90 дней** (DuckDB, InfluxDB и папки наблюдений).

## Требования

- soniks-client 3.x, запущенный из `docker-compose.yml` (папка станции, например `~/soniks-client-new`).
- Библиотека `db_dev2.1.0` в папке станции: `libs/db_dev2.1.0`.
- В `.env`: `STATION__ID`, `URL__BASE`, `INFLUX_USER`, `INFLUX_PASSWORD`, `INFLUX_TOKEN`, `GRAFANA_PASSWORD`.
- `./data` в папке станции — место для наблюдений, базы и InfluxDB (рекомендуется второй диск).

Всё собирается из исходников (Python 3.15, uv, DuckDB, FastAPI, uvicorn, paho-mqtt).
Первая сборка занимает около часа, следующие берут кеш и идут секунды.

## Установка

Положите `addons/monitor` из этой ветки в папку станции, затем:

```
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml build monitor
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml up -d
```

Откройте http://127.0.0.1:8090

Compose дополнения меняет и клиента: завершённые наблюдения сохраняются в `./data/complete`
(`OBSERVATION__REMOVE_OBSERVATION_DATA=False`). Клиента всегда запускайте вместе с файлом дополнения,
иначе эта настройка теряется.

## Удаление

```
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml down
docker compose up -d
```

## Настройки (окружение сервиса `monitor`)

| Переменная | По умолчанию | Значение |
|---|---|---|
| `MONITOR_PORT` | `8090` | веб-порт |
| `MONITOR_CLIENT_HEALTH_URL` | `http://soniks-client:8080/healthz` | состояние клиента |
| `MONITOR_COMPLETE_DIR` | `/data/complete` | завершённые наблюдения |
| `MONITOR_DB_PATH` | `/data/monitor/monitor.duckdb` | база данных |
| `MONITOR_SATYAML_DIR` | `/satyaml` | описания спутников |
| `MONITOR_MQTT_HOST` / `MONITOR_MQTT_PORT` | `mosquitto` / `1883` | локальный брокер |
| `MONITOR_HEALTH_INTERVAL` | `30` | секунд между проверками `/healthz` |
| `MONITOR_SCAN_INTERVAL` | `60` | секунд между просмотрами `data/complete` |
| `MONITOR_PORTAL_INTERVAL` | `300` | кеш портала, секунд |
| `MONITOR_RETENTION_DAYS` | `90` | сколько хранятся данные |
