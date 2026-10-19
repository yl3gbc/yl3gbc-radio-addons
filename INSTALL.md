# Установка SONIKS Monitor: на работающую станцию или с клиентом СОНИКС из исходников

> **Альфа-версия 0.0.0** — для пробы и тестирования.

Пошаговая инструкция в двух вариантах:

- **шаг 0** — добавить монитор на уже работающую станцию СОНИКС, клиента не трогая;
- **шаги 1–11** — собрать клиента СОНИКС из исходников (amd64), поставить монитор
  с библиотекой `db_dev2.1.0`, запустить, проверить и обновлять после новых коммитов.

Всё время — **UTC**. Команды выполняются по одной.

## 0. Монитор на уже работающую станцию (без сборки клиента)

Если станция СОНИКС уже работает (официальный образ клиента, установка по инструкции СОНИКС),
клиента пересобирать не нужно — достаточно добавить монитор. Ниже `<папка станции>` — папка,
где лежат `docker-compose.yml` и `.env` вашей станции.

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

Добавьте в `.env` станции:

```
INFLUX_USER=...
INFLUX_PASSWORD=...
INFLUX_TOKEN=...
GRAFANA_PASSWORD=...
```

### 0.4. Сборка и запуск

```
cd <папка станции>
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml build monitor
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml up -d
```

`up -d` с файлом монитора пересоздаёт контейнер клиента: в нём включается сохранение
наблюдений в `./data/complete`. Клиент перезапускается за несколько секунд; не делайте этого
во время наблюдения (ближайшее — в `docker logs soniks-client`).

### 0.5. Проверка

Как в шаге 7. Монитор — http://127.0.0.1:8090, Grafana — http://127.0.0.1:3000.

### 0.6. Агент

`soniks-agent` обновляет клиента по команде портала. Если после такого обновления
`docker exec soniks-client printenv OBSERVATION__REMOVE_OBSERVATION_DATA` показывает не `False`,
клиент был пересоздан без файла монитора — запустите шаг 0.4 (`up -d`) ещё раз.

Остальные разделы ниже — полная установка с клиентом, собранным из исходников.

## 1. Что нужно

- Компьютер **amd64** с Linux, Docker и Docker Compose **2.17 или новее** (нужен `additional_contexts`).
- Приёмник (проверено на Airspy Mini).
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

`git describe --tags` показывает версию (например `3.0.2`) — она нужна при сборке.

### 3.2. Сборка с нуля

По умолчанию `build.sh` собирает arm64, поэтому платформа задаётся явно.
База и клиент собираются вместе, без кеша, в 5 потоков:

```
cd ~/soniks-client-new/soniks-client
BASE_IMAGE=soniks-base:local IMAGE=satnogs-soniks-client PLATFORMS=linux/amd64 ./build.sh 3.0.2 --base -- --no-cache --build-arg PARALLEL_JOBS=5 2>&1 | tee ~/client-build.log
```

Вместо `3.0.2` — версия из `git describe --tags`.

Проверка:

```
cd ~/soniks-client-new
docker inspect satnogs-soniks-client:3.0.2 --format '{{index .Config.Labels "org.opencontainers.image.revision"}}'
grep -c "CACHED" ~/client-build.log
docker images | grep -i soniks
```

- первая строка — коммит клиента (совпадает с `git log --oneline -1`);
- `CACHED` — `0`, то есть всё собрано с нуля;
- в списке есть `soniks-base:local` и `satnogs-soniks-client:3.0.2`.

### 3.3. docker-compose.yml и .env станции

`docker-compose.yml` и `.env` станции берутся из инструкции СОНИКС для вашей станции.
В `docker-compose.yml` у сервиса `soniks-client` образ меняется на собранный локально:

```
    image: satnogs-soniks-client:3.0.2
```

В `.env` должны быть `STATION__ID` и `URL__BASE`, а для монитора ещё:

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

Просто папка:

```
cd ~/soniks-client-new
mkdir -p data
```

Или на втором диске (пример: диск смонтирован в `/mnt/sdb2`):

```
sudo mkdir -p /mnt/sdb2/soniks-client-new
sudo chown $USER: /mnt/sdb2/soniks-client-new
cd ~/soniks-client-new
ln -s /mnt/sdb2/soniks-client-new data
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
docker ps --format "{{.Names}}  {{.Status}}  {{.Ports}}"
docker logs soniks-client --tail 30
docker logs monitor --tail 20
docker exec soniks-client printenv OBSERVATION__REMOVE_OBSERVATION_DATA
curl -s http://127.0.0.1:8090/api/overview | head -c 400
```

Должно быть:

- `soniks-client` — `Up … (healthy)`; в журнале «MQTT: подключено», «получен снимок расписания»,
  «Найдено приёмников: 1»;
- `monitor` — `Up`, в журнале `SONIKS Monitor: station <номер>, port 8090`;
- `OBSERVATION__REMOVE_OBSERVATION_DATA` — `False`;
- `/api/overview` отдаёт JSON со станцией.

Откройте:

- монитор — http://127.0.0.1:8090
- Grafana — http://127.0.0.1:3000 (пользователь `admin`, пароль `GRAFANA_PASSWORD` из `.env`)

После первого завершённого наблюдения (монитор просматривает `data/complete` раз в минуту)
оно появится в «Дневном журнале».

Проверка наблюдения в журнале клиента:

```
cd ~/soniks-client-new
docker logs soniks-client --since 30m 2>&1 | grep -i "Старт наблюдения\|ValueError\|код возврата\|Водопад"
```

Должно быть «Водопад построен», без `ValueError`.

Предупреждения монитора `healthz: … name resolution` / `Connection refused` во время
пересборки или перезапуска клиента — нормальны и проходят сами.

## 8. Обновление клиента после нового коммита

Каждый новый коммит СОНИКС — полная пересборка с нуля. Старый образ, база и кеш
удаляются **до** `git pull`.

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
docker image rm -f satnogs-soniks-client:3.0.2
docker image rm -f soniks-base:local
docker builder prune -af
docker images | grep -i soniks
```

В списке остаётся только `soniks-monitor:local`.
`docker builder prune -af` удаляет и кеш сборки монитора — следующая сборка монитора снова будет долгой.
Не запускайте этот шаг, пока идёт сборка монитора.

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
BASE_IMAGE=soniks-base:local IMAGE=satnogs-soniks-client PLATFORMS=linux/amd64 ./build.sh 3.0.2 --base -- --no-cache --build-arg PARALLEL_JOBS=5 2>&1 | tee ~/client-build.log
cd ~/soniks-client-new
docker inspect satnogs-soniks-client:3.0.2 --format '{{index .Config.Labels "org.opencontainers.image.revision"}}'
grep -c "CACHED" ~/client-build.log
docker compose -f docker-compose.yml -f addons/monitor/docker-compose.yml up -d soniks-client
docker logs soniks-client --tail 30
```

Если сборка упала с ошибкой — снова шаг 8.2 (всё удалить) и сборка с нуля.
Если сменилась версия (тег) — замените `3.0.2` в командах и в `docker-compose.yml`.

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

После обновления страницу монитора открывайте с Ctrl+Shift+R, чтобы браузер не взял старый `app.js`.

## 10. Известные проблемы Airspy

На портале, «Настройки станции» → приёмник:

- **Подавление постоянной составляющей (DC removal) — «Нет».** Airspy его не поддерживает; с «Да»
  граф падал: `ValueError: Channel 0 does not support automatic DC removal setting`.
  С клиента `dc56686` такая настройка с портала отклоняется проверкой приёмника.
- **«Другие настройки» без пустых значений.** Шаблон `LIN=,LNA=,MIX=,VGA=,SENS=` ронял граф
  (`ValueError: stod`). Указывайте один профиль с числом, например `LIN=16`
  (LIN или SENS, 0–21, не смешивать). С клиента `dc56686` пустые пары выбрасываются.

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
