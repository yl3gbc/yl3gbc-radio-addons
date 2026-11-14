# Установка SONIKS Monitor: на работающую станцию или с клиентом СОНИКС из исходников

> **Альфа-версия 0.1alfa** — для пробы и тестирования. Автор: YL3GBC Arnis Armans.
>
> **Платформа:** amd64 (x86_64) — собрано и проверено. arm64 (Raspberry Pi, Orange Pi) — пока
> не проверялось.
>
> **Код клиента SONIKS не изменён** — он принадлежит команде SONIKS, монитор только читает
> данные станции.

Пошаговая инструкция в двух вариантах:

- **шаг 0** — добавить монитор на уже работающую станцию СОНИКС, клиента не трогая;
- **шаги 1–11** — собрать клиента СОНИКС из исходников (amd64), поставить монитор
  с библиотекой `db_dev2.1.0`, запустить, проверить и обновлять после новых коммитов.

Всё время — **UTC**. Команды выполняются по одной.

## 0. Монитор на уже работающую станцию (без сборки клиента)

Если станция СОНИКС уже работает (официальный образ клиента, установка по инструкции СОНИКС),
клиента пересобирать не нужно — достаточно добавить монитор. Ниже `<папка станции>` — папка,
где лежат `docker-compose.yml` и `.env` вашей станции.

Логи станции смотрите только командой из описания SONIKS:

```
cd <папка станции>
sudo docker-compose logs -f
```

(выход — Ctrl+C).

Нужны Docker Compose **2.17 или новее** и около 10 ГБ места. Монитор собирается из исходников:
на amd64 первый раз 30–60 минут, на Raspberry Pi (arm64) — несколько часов.

### 0.1. Монитор и библиотека

```
cd ~
git clone --branch monitor --single-branch https://github.com/yl3gbc/yl3gbc-radio-addons.git yl3gbc-monitor
git clone --branch db_dev2.1.0 --single-branch https://github.com/yl3gbc/yl3gbc-radio-addons.git yl3gbc-db_dev
cd <папка станции>
mkdir -p addons
mkdir -p libs
cp -r ~/yl3gbc-monitor/addons/monitor addons/
cp -r ~/yl3gbc-db_dev/libs/db_dev2.1.0 libs/
```

### 0.2. Описания спутников (satyaml)

Монитор берёт названия спутников из `soniks-client/soniks-satyaml/satyaml` в папке станции.
Клиента собирать не нужно — только исходники с описаниями:

```
cd <папка станции>
git clone --depth 1 --branch soniks https://gitlab.com/space-education-development/soniks/client/soniks-client.git soniks-client
cd <папка станции>/soniks-client
git submodule update --init --depth 1 soniks-satyaml
ls soniks-satyaml/satyaml | head
```

### 0.3. Папка данных и .env

```
cd <папка станции>
mkdir -p data
```

(или ссылка `data` на второй диск — см. шаг 5).

Добавьте в `.env` станции четыре строки. Что они значат и как их придумать — в файле
`addons/monitor/env.example`:

```
INFLUX_USER=...
INFLUX_PASSWORD=...
INFLUX_TOKEN=...
GRAFANA_PASSWORD=...
```

Папки для данных:

```
cd <папка станции>
mkdir -p data/complete data/monitor data/offline data/images data/influxdb
```

### 0.4. Сборка и запуск

```
cd <папка станции>
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml build monitor
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml up -d
```

`up -d` с файлом монитора пересоздаёт контейнер клиента: в нём включается сохранение
наблюдений в `./data/complete`. Клиент перезапускается за несколько секунд; не делайте этого
во время наблюдения (ближайшее видно в «Будущие задания» на портале и в логе
`sudo docker-compose logs -f`).

### 0.5. Проверка

Как в шаге 7. Монитор — http://127.0.0.1:8090, Grafana — http://127.0.0.1:3000.

### 0.6. Агент

`soniks-agent` обновляет клиента по команде портала. Если после такого обновления в мониторе
перестали появляться новые наблюдения («Сегодня» не растёт, в «Дневном журнале» нет новых),
клиент был пересоздан без файла монитора — запустите шаг 0.4 (`up -d`) ещё раз.

Остальные разделы ниже — полная установка с клиентом, собранным из исходников.

## 1. Что нужно

- Компьютер **amd64** с Linux, Docker и Docker Compose **2.17 или новее** (нужен `additional_contexts`).
- Приёмник (проверено на Airspy Mini и Airspy R2).
- Зарегистрированная станция на портале sonik.space (номер станции и токен).
- Место на диске: около 25 ГБ под образы и кеш сборки, плюс место под наблюдения (рекомендуется второй диск).
- Время: клиент с базой собирается примерно 10–20 минут, монитор в первый раз — 30–60 минут
  (Python 3.15, Rust, uv и DuckDB собираются из исходников). Повторные сборки монитора — секунды.

## 2. Папка станции

Всё лежит в одной папке, например `~/soniks-client-new`:

```
~/soniks-client-new/
├── docker-compose.yml        станция (клиент, rigctld, агент)
├── .env                      настройки станции
├── soniks-client/            исходники клиента СОНИКС
├── addons/monitor/           монитор (ветка monitor)
├── libs/db_dev2.1.0/         библиотека DuckDB 2.1.0-dev (ветка db_dev2.1.0)
└── data/                     наблюдения, база монитора, InfluxDB
```

```
mkdir -p ~/soniks-client-new
cd ~/soniks-client-new
```

## 3. Клиент СОНИКС из исходников

### 3.1. Исходники

```
cd ~/soniks-client-new
git clone --branch soniks https://gitlab.com/space-education-development/soniks/client/soniks-client.git soniks-client
cd ~/soniks-client-new/soniks-client
git submodule update --init
git log --oneline -1
git describe --tags
```

`git describe --tags` показывает версию (например `3.1.0`) — она нужна при сборке.

### 3.2. Сборка с нуля

По умолчанию `build.sh` собирает arm64, поэтому платформа задаётся явно.
База и клиент собираются вместе, без кеша, в 5 потоков:

```
cd ~/soniks-client-new/soniks-client
BASE_IMAGE=soniks-base:local IMAGE=satnogs-soniks-client PLATFORMS=linux/amd64 ./build.sh 3.1.0 --base -- --no-cache --build-arg PARALLEL_JOBS=5 2>&1 | tee ~/client-build.log
```

Вместо `3.1.0` — версия из `git describe --tags`.

Проверка:

```
cd ~/soniks-client-new
grep -c "CACHED" ~/client-build.log
docker images
```

- `CACHED` — `0`, то есть всё собрано с нуля;
- в списке есть `soniks-base:local` и `satnogs-soniks-client:3.1.0`.

### 3.3. docker-compose.yml и .env станции

`docker-compose.yml` и `.env` станции берутся из инструкции СОНИКС для вашей станции.
В `docker-compose.yml` у сервиса `soniks-client` образ меняется на собранный локально:

```
    image: satnogs-soniks-client:3.1.0
```

С версии 3.0.3 USB приёмника подключается через `volumes`, а не через `devices`:

```
    volumes:
      - /dev/bus/usb:/dev/bus/usb
```

В `.env` должны быть `STATION__ID` и `URL__BASE`, а для монитора ещё (подробно — в
`addons/monitor/env.example`):

```
INFLUX_USER=...
INFLUX_PASSWORD=...
INFLUX_TOKEN=...
GRAFANA_PASSWORD=...
```

`.env` содержит токены и пароли — никому его не пересылайте и не кладите в git.

**Агент.** `soniks-agent` по команде портала ставит официальный образ клиента и заменил бы
локальную сборку. Пока станция работает на своей сборке, агент держите остановленным
(см. шаг 6).

## 4. Монитор и библиотека db_dev2.1.0

Монитор и библиотека лежат в публичном репозитории https://github.com/yl3gbc/yl3gbc-radio-addons,
каждый в своей ветке:

| Ветка | Что | Куда положить |
|---|---|---|
| `monitor` | монитор | `~/soniks-client-new/addons/monitor` |
| `db_dev2.1.0` | доступ к DuckDB 2.1.0-dev | `~/soniks-client-new/libs/db_dev2.1.0` |

```
cd ~
git clone --branch monitor --single-branch https://github.com/yl3gbc/yl3gbc-radio-addons.git yl3gbc-monitor
git clone --branch db_dev2.1.0 --single-branch https://github.com/yl3gbc/yl3gbc-radio-addons.git yl3gbc-db_dev
mkdir -p ~/soniks-client-new/addons
mkdir -p ~/soniks-client-new/libs
cp -r ~/yl3gbc-monitor/addons/monitor ~/soniks-client-new/addons/
cp -r ~/yl3gbc-db_dev/libs/db_dev2.1.0 ~/soniks-client-new/libs/
```

## 5. Папка данных

Наблюдения (с изображениями и водопадом), база монитора и InfluxDB хранятся 90 дней в `./data`.
Архив изображений (`./data/images`) и его ZIP хранятся бессрочно.

Просто папка:

```
cd ~/soniks-client-new
mkdir -p data
```

Или на втором диске (рекомендуется, но не обязательно) (пример: диск смонтирован в `/mnt/sdb2`):

```
sudo mkdir -p /mnt/sdb2/soniks-client-new
sudo chown $USER: /mnt/sdb2/soniks-client-new
cd ~/soniks-client-new
ln -s /mnt/sdb2/soniks-client-new data
```

Затем папки внутри `data`:

```
cd ~/soniks-client-new
mkdir -p data/complete data/monitor data/offline data/images data/influxdb
```

Если данные на втором диске — диск должен монтироваться при загрузке (`/etc/fstab`)
раньше, чем стартует Docker.

## 6. Сборка монитора и запуск

```
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml build --no-cache monitor 2>&1 | tee ~/monitor-build.log
grep -a "duckdb core\|libduckdb" ~/monitor-build.log
```

В журнале сборки должны быть `duckdb core: e08224d653…` и `libduckdb v2.1.0-dev…`.

Запуск всей станции вместе с монитором:

```
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml up -d
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml stop soniks-agent
```

**Важно:** клиента всегда запускайте с обоими файлами (`-f docker-compose.yml -f addons/monitor/docker-compose.yml`).
Файл монитора включает сохранение завершённых наблюдений в `./data/complete`; без него
клиент удаляет наблюдения после выгрузки, и монитору нечего показывать.

## 7. Проверка

```
cd ~/soniks-client-new
docker ps
sudo docker-compose logs -f
```

(выход из лога — Ctrl+C). Должно быть:

- `soniks-client` — `Up … (healthy)`; в логе «MQTT: подключено», «получен снимок расписания»,
  «Найдено приёмников: 1»;
- `monitor` — `Up`;
- в мониторе на «Станции» — карточка вашей станции и версия клиента.

Откройте:

- монитор — http://127.0.0.1:8090
- Grafana — http://127.0.0.1:3000 (пользователь `admin`, пароль `GRAFANA_PASSWORD` из `.env`)

После первого завершённого наблюдения (монитор просматривает `data/complete` раз в минуту)
оно появится в «Дневном журнале».

В логе после наблюдения должно быть «Водопад построен» и «Директория перемещена … в
…/data/complete/…», без `ValueError`.

Предупреждения монитора `healthz: … name resolution` / `Connection refused` во время
пересборки или перезапуска клиента — нормальны и проходят сами.

## 8. Обновление клиента после нового коммита

Каждый новый коммит СОНИКС — полная пересборка с нуля. Порядок обязателен:

1. удалить старый образ, базу и кеш;
2. **`sudo reboot`** — с версии 3.1 обязательно, иначе после сборки клиент не видит SDR
   («Найдено приёмников: 0»);
3. `git pull` с подмодулями;
4. сборка с нуля и запуск.

### 8.1. Есть ли новый коммит

```
cd ~/soniks-client-new/soniks-client
git fetch origin
git log --oneline -3 origin/soniks
git --no-pager show --stat origin/soniks
```

### 8.2. Остановить клиента и удалить образ, базу и кеш

```
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml stop soniks-client
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml rm -f soniks-client
docker image rm -f satnogs-soniks-client:3.1.0
docker image rm -f soniks-base:local
docker builder prune -af
docker images | grep -i soniks
```

В списке остаётся только `soniks-monitor:local`.
`docker builder prune -af` удаляет и кеш сборки монитора — следующая сборка монитора снова будет долгой.
Не запускайте этот шаг, пока идёт сборка монитора.

Затем перезагрузка (обязательно):

```
sudo reboot
```

### 8.3. Новый коммит

```
cd ~/soniks-client-new/soniks-client
git pull
git submodule update --init
git log --oneline -1
```

### 8.4. Сборка с нуля и запуск

```
cd ~/soniks-client-new/soniks-client
BASE_IMAGE=soniks-base:local IMAGE=satnogs-soniks-client PLATFORMS=linux/amd64 ./build.sh 3.1.0 --base -- --no-cache --build-arg PARALLEL_JOBS=5 2>&1 | tee ~/client-build.log
cd ~/soniks-client-new
grep -c "CACHED" ~/client-build.log
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml up -d soniks-client
sudo docker-compose logs -f
```

В логе должно быть «Найдено приёмников: 1».

Если сборка упала с ошибкой — снова шаг 8.2 (всё удалить) и сборка с нуля.
Если сменилась версия (тег) — замените `3.1.0` в командах и в `docker-compose.yml`.

## 9. Обновление монитора

```
cd ~/yl3gbc-monitor
git pull
cd ~/yl3gbc-db_dev
git pull
cp -r ~/yl3gbc-monitor/addons/monitor ~/soniks-client-new/addons/
cp -r ~/yl3gbc-db_dev/libs/db_dev2.1.0 ~/soniks-client-new/libs/
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml build monitor
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml up -d monitor
```

После обновления страницу монитора обновите Ctrl+F5.

## 10. Известные проблемы Airspy

На портале, «Настройки станции» → приёмник:

- **Подавление постоянной составляющей (DC removal) — «Нет».** Airspy его не поддерживает; с «Да»
  граф падал: `ValueError: Channel 0 does not support automatic DC removal setting`.
  С клиента `dc56686` такая настройка с портала отклоняется проверкой приёмника.
- **Усиление — через «Режим усиления» и «Усиление», не через «Другие настройки».**
  С версии 3.1 `LIN=`, `LNA=`, `MIX=`, `VGA=` в «Других настройках» (`FLOWGRAPH__OTHER_SETTINGS`)
  до приёмника не доходят — клиент пишет предупреждение
  «FLOWGRAPH_OTHER_SETTINGS задаёт усиление (LIN)…». Задавайте `FLOWGRAPH__GAIN_MODE=Overall`
  и `FLOWGRAPH__RF_GAIN` (0–21). В «Других настройках» — только настройки драйвера,
  например `biastee=true`. Пустые пары (`LIN=,LNA=`) клиент выбрасывает.
- **После пересборки клиента — `sudo reboot`** (шаг 8.2), иначе SDR не виден.

Новые настройки с портала клиент применяет после текущего прохода
(«Конфигурация … получена, применится после прохода»).

## 11. Удаление монитора

```
cd ~/soniks-client-new
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml down
docker compose up -d
```

Станция продолжает работать без монитора; клиент снова удаляет наблюдения после выгрузки.
Данные в `./data` остаются, пока их не удалить вручную.
