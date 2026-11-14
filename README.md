# SONIKS Monitor — дополнение к станции SONIKS

**Версия 0.1alfa.** Автор: YL3GBC Arnis Armans.

> Альфа-версия: монитор в разработке, возможны ошибки и изменения.

Monitor — веб-страница наземной станции SONIKS (soniks-client 3.x) на порту **8090**.
Он очень похож на страницу станции на портале sonik.space: многое, что там есть,
можно увидеть прямо на самой станции.

- Ставится **по желанию** — станция работает и без него.
- **Код клиента SONIKS не изменён.** Он принадлежит команде SONIKS, монитор
  никак не вмешивается в их код и только читает данные станции.
- Время везде **UTC** — стандарт радиолюбителей. Местное время в шапке — только
  для справки.
- Языки интерфейса: русский (по умолчанию) и английский.

## Платформа

| Платформа | Состояние |
|---|---|
| amd64 (x86_64) | собрано и проверено |
| arm64 (Raspberry Pi, Orange Pi) | пока не проверялось, будет позже |

## Где находится

- Репозиторий: https://github.com/yl3gbc/yl3gbc-radio-addons
- Ветка: `monitor`
- Папка: `addons/monitor`
- Библиотека DuckDB: ветка `db_dev2.1.0` (папка `libs/db_dev2.1.0`)

## Что показывает монитор

| Раздел | Что там |
|---|---|
| **Станция** | станция и версия клиента, QTH, наблюдения всего, «Сегодня» (наблюдения, спутники и пакеты за сутки UTC), будущие задания, владелец; сравнение со станцией в сети; описания satyaml, память, диск, архив изображений |
| **Спутник** | сводка по спутнику, порог SNR по его режиму, лучший приём, наблюдения по дням и последние наблюдения |
| **Орбита / Карта** | положение спутника на карте, пролёт над станцией, ближайшие пролёты за 24 часа |
| **Дневной журнал** | итоги дня, средние по спутникам (шум, SNR, пик), наблюдения с водопадами |
| **Сигнал / Waterfall** | по режимам за 90 дней: с какого SNR приём декодируется; водопады за день |
| **История** | 7, 30 или 90 дней: графики наблюдений, пакетов, спутников, SNR и шума |
| **Офлайн-тест** | декодирование записи пролёта (.ogg) без станции. Кнопка видна только когда дополнение `offline` установлено и работает |
| **Руководство**, **FAQ** | описание монитора и ответы на вопросы (RU / EN) |

Нажатие на «SONIKS Monitor» в шапке возвращает на «Станцию».

### Архив изображений

- Каждое изображение (SSTV, SSDV, LRPT, пакетное изображение) копируется в
  `./data/images/ГГГГ/ММ/<номер наблюдения>/` и хранится **бессрочно**.
- По каждому снимку видно: тип, спутник, номер наблюдения, время UTC, режим.
- Каждые 2 месяца создаётся ZIP-архив в `./data/images/archives/`:
  01.01–28/29.02, 01.03–30.04, 01.05–30.06, 01.07–31.08, 01.09–31.10, 01.11–31.12
  (00:00:00–23:59:59 UTC). ZIP создаётся после окончания периода.
- Если файл изображения повреждён (не приняты все пакеты), вместо снимка показано
  «Изображение неполное». Сам файл сохранён и входит в ZIP.
- Архив открывается нажатием на карточку «Архив изображений» в разделе «Станция».

## Как это работает

- Монитор читает у клиента только две вещи: `/healthz` и завершённые наблюдения
  в `./data/complete` (`metadata_*.json`, пакеты `data_*`, изображения, водопад).
- Наблюдения хранятся в DuckDB **2.1.0-dev** через библиотеку `db_dev2.1.0`.
- Каждое наблюдение и состояние станции публикуются в локальный mosquitto
  (`soniks/<станция>/pass`, `soniks/<станция>/health`) → Telegraf → InfluxDB → Grafana.
- С портала sonik.space берутся: карточка станции, владелец, будущие задания,
  статистика сравниваемых станций, станции в сети. Кеш — 5 минут.
- Хранение: наблюдения **90 дней** (DuckDB, InfluxDB, папки в `data/complete`),
  изображения и ZIP — **бессрочно**.

## Образы

| Образ | Зачем |
|---|---|
| `soniks-monitor:local` | сам монитор, собирается из исходников |
| `eclipse-mosquitto:2` | локальный MQTT-брокер |
| `influxdb:2` | база для графиков |
| `telegraf:latest` | переносит данные из MQTT в InfluxDB |
| `grafana/grafana-oss` | графики, порт 3000 |

Монитор собирается **из исходников**: Python 3.15, uv, DuckDB 2.1.0-dev
(коммит `e08224d653`), FastAPI, uvicorn, paho-mqtt, sgp4. Первая сборка идёт
около часа, следующие берут кеш.

## Требования

- Станция SONIKS (soniks-client 3.x), запущенная из `docker-compose.yml` в папке
  станции, например `~/soniks-client-new`.
- Исходники клиента в `~/soniks-client-new/soniks-client` (оттуда берутся описания
  спутников `soniks-satyaml`).
- Библиотека `db_dev2.1.0` в `~/soniks-client-new/libs/db_dev2.1.0`.
- Место на диске: несколько ГБ для сборки, плюс данные. `./data` можно сделать
  ссылкой на второй диск (рекомендуется), но это не обязательно.

## Установка

Коротко — ниже. Полная пошаговая инструкция (в том числе сборка клиента SONIKS
из исходников и обновление после новых коммитов) — в [INSTALL.md](INSTALL.md).

**1. Взять монитор и библиотеку из GitHub:**

```
cd ~
git clone --branch monitor --single-branch https://github.com/yl3gbc/yl3gbc-radio-addons.git yl3gbc-monitor
git clone --branch db_dev2.1.0 --single-branch https://github.com/yl3gbc/yl3gbc-radio-addons.git yl3gbc-db-dev
```

**2. Положить их в папку станции:**

```
mkdir -p ~/soniks-client-new/addons ~/soniks-client-new/libs
cp -r ~/yl3gbc-monitor/addons/monitor ~/soniks-client-new/addons/
cp -r ~/yl3gbc-db-dev/libs/db_dev2.1.0 ~/soniks-client-new/libs/
```

**3. Дополнить `.env` станции.** Что добавить и зачем — в файле
`addons/monitor/env.example`. Коротко: `INFLUX_USER`, `INFLUX_PASSWORD`,
`INFLUX_TOKEN`, `GRAFANA_PASSWORD`. `STATION__ID` и `URL__BASE` уже есть у клиента.

**4. Создать папки для данных:**

```
cd ~/soniks-client-new
mkdir -p data/complete data/monitor data/offline data/images data/influxdb
```

**5. Собрать и запустить:**

```
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml build monitor
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml up -d
```

**6. Открыть:** http://127.0.0.1:8090 (Grafana — http://127.0.0.1:3000).

> **Важно.** Файл дополнения меняет у клиента одну настройку: завершённые наблюдения
> остаются в `./data/complete` (`OBSERVATION__REMOVE_OBSERVATION_DATA=False`).
> Поэтому клиента **всегда** запускайте вместе с файлом дополнения (оба `-f`),
> иначе эта настройка теряется и монитор перестаёт получать новые наблюдения.

## Обновление монитора

```
cd ~/yl3gbc-monitor
git pull
cp -r ~/yl3gbc-monitor/addons/monitor ~/soniks-client-new/addons/
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml build monitor
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml up -d monitor
```

После обновления обновите страницу в браузере (Ctrl+F5).

## Удаление

```
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml down
docker compose up -d
```

Данные в `./data` при этом остаются.

## Если что-то не так

| Что видно | Причина |
|---|---|
| «Сегодня» 0, новых наблюдений нет | клиент запущен без файла дополнения — запустите с обоими `-f` |
| «Архив изображений: Не подключено» | папка `./data/images` не создана или недоступна для записи |
| «Изображение неполное» | файл изображения повреждён (не все пакеты), это не ошибка монитора |
| нет кнопки «Офлайн-тест» | дополнение `offline` не установлено или не запущено |
| старый вид страницы после обновления | обновите страницу Ctrl+F5 |

## Настройки сервиса `monitor`

Значения по умолчанию подходят для обычной станции. Менять их можно в разделе
`environment` сервиса `monitor` в `addons/monitor/docker-compose.yml`.

| Переменная | По умолчанию | Значение |
|---|---|---|
| `MONITOR_PORT` | `8090` | веб-порт внутри контейнера |
| `MONITOR_CLIENT_HEALTH_URL` | `http://soniks-client:8080/healthz` | состояние клиента |
| `MONITOR_COMPLETE_DIR` | `/data/complete` | завершённые наблюдения |
| `MONITOR_IMAGES_DIR` | `/data/images` | архив изображений |
| `MONITOR_OFFLINE_DIR` | `/data/offline` | офлайн-тест |
| `MONITOR_DB_PATH` | `/data/monitor/monitor.duckdb` | база данных |
| `MONITOR_SATYAML_DIR` | `/satyaml` | описания спутников |
| `MONITOR_MQTT_HOST` / `MONITOR_MQTT_PORT` | `mosquitto` / `1883` | локальный брокер |
| `MONITOR_HEALTH_INTERVAL` | `30` | секунд между проверками `/healthz` |
| `MONITOR_SCAN_INTERVAL` | `60` | секунд между просмотрами `data/complete` и архива |
| `MONITOR_PORTAL_INTERVAL` | `300` | кеш портала, секунд |
| `MONITOR_RETENTION_DAYS` | `90` | сколько дней хранятся наблюдения |
| `MONITOR_OFFLINE_LOW_ELEVATION` | `10` | офлайн-тест: старше 90 дней удаляются декодированные записи и записи с макс. углом ниже этого |
