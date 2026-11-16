# SONIKS Monitor 0.1alfa

Дополнение (addon) к наземной станции SONIKS (https://sonik.space).
Автор: YL3GBC Arnis Armans.

Монитор — веб-страница станции на порту 8090. Показывает:

- завершённые наблюдения: пакеты, водопад, изображения;
- спутники, карту, журнал, сигнал и сравнение;
- историю за 7, 30 и 90 дней;
- описания спутников (satyaml) из клиента SONIKS.

Код клиента SONIKS не меняется: монитор только читает его данные
и передаёт их в локальный MQTT (mosquitto) для Grafana.

## Платформа

- linux/amd64 (x86_64) — собрано и проверено;
- arm64 (Raspberry Pi) — пока не проверялось.

## Как запустить

Подробная инструкция для начинающих, на русском, со скриншотами:
https://github.com/yl3gbc/yl3gbc-radio-addons/blob/main/station/README.md

В папке станции нужны три файла: `.env`, `docker-compose.yml`
клиента SONIKS и `docker-compose.override.yml` с монитором.

Адреса после запуска:

- монитор: http://адрес-станции:8090
- Grafana: http://адрес-станции:3000

## Теги

- `0.1alfa-amd64` — первая тестовая версия.

---

# SONIKS Monitor 0.1alfa (English)

An add-on for SONIKS ground stations (https://sonik.space).
Author: YL3GBC Arnis Armans.

The monitor is a web page for your station on port 8090. It shows:

- completed observations: packets, waterfall, images;
- satellites, map, log, signal and comparison;
- history for 7, 30 and 90 days;
- satellite descriptions (satyaml) from the SONIKS client.

The SONIKS client code is not changed: the monitor only reads its
data and sends it to a local MQTT broker (mosquitto) for Grafana.

## Platform

- linux/amd64 (x86_64) — built and tested;
- arm64 (Raspberry Pi) — not tested yet.

## How to run

Step-by-step guide for beginners (in Russian, with screenshots):
https://github.com/yl3gbc/yl3gbc-radio-addons/blob/main/station/README.md

The station folder needs three files: `.env`, the SONIKS client
`docker-compose.yml` and `docker-compose.override.yml` with the monitor.

Addresses after start:

- monitor: http://station-address:8090
- Grafana: http://station-address:3000

## Tags

- `0.1alfa-amd64` — first test version.
