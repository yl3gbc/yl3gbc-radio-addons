"use strict";

const I18N = {
  ru: {
    brand_sub: "SONIKS / Наземная станция",
    nav_overview: "Обзор", nav_orbit: "Орбита", nav_history: "История", nav_guide: "Руководство",
    utc_date: "Дата UTC", utc_time: "Время UTC", local_date: "Местная дата", local_time: "Местное время",
    tab_station: "Станция", tab_satellite: "Спутник", tab_journal: "Дневной журнал",
    tab_map: "Орбита / Карта", tab_signal: "Сигнал / Waterfall",
    station: "Станция", client: "Клиент", qth: "QTH", observations_total: "Наблюдения всего",
    today: "Сегодня", obs_short: "Набл.", sat_short: "Спут.", packets: "Пакеты",
    future_jobs: "Будущие задания", owner: "Владелец", compare: "Сравнить",
    compared_station: "Сравниваемая станция", coordinates: "Координаты",
    satyaml: "Описания satyaml", ram: "Оперативная память", disk: "Диск станции",
    archive: "Архив изображений", connected: "Подключено", not_connected: "Не подключено",
    a_images: "снимков", a_archives: "Архивы ZIP — по 2 месяца (UTC)", a_no_archives: "Архивов пока нет — ZIP создаётся после окончания периода",
    a_more: "Показать ещё", a_empty: "Изображений пока нет", a_shown: "Снимков", a_of: "из", a_download: "Скачать", a_broken: "Изображение неполное", f_author: "Автор", f_version: "Версия",
    a_baud: "Бод", k_sstv: "SSTV", k_ssdv: "SSDV", k_lrpt: "LRPT", k_packet: "Пакетное изображение",
    not_found: "Станция не найдена", soon: "Раздел в разработке",
    online_pick: "Станции в сети…",
    j_today: "Сегодня", j_per_sat: "По спутникам — средние за день", j_observations: "Наблюдения за день",
    j_obs: "Наблюдения", j_sats: "Спутники", j_decoded: "Декодировано", j_packets: "Пакеты",
    j_images: "Изображения", j_avg_noise: "Средний шум, дБ", j_avg_snr: "Средний SNR, дБ",
    j_avg_peak: "Средний пик, дБ", j_time: "Время UTC", j_id: "Наблюдение", j_sat: "Спутник",
    j_mode: "Режим", j_freq: "Частота, МГц", j_noise: "Шум, дБ", j_snr: "SNR, дБ", j_peak: "Пик, дБ",
    j_waterfall: "Водопад", j_count: "Набл.", j_empty: "За этот день наблюдений нет",
    s_all_sats: "Все спутники", s_decoded_only: "Только декодированные",
    s_shown: "Водопадов", s_empty: "Нет водопадов по этому выбору",
    md_title: "По режимам — с какого SNR декодируется", md_last: "последние", md_days: "дн.",
    md_mode: "Режим", md_baud: "Бод", md_passes: "Проходы", md_min: "Мин. SNR с данными, дБ",
    md_avg_ok: "SNR декод., дБ", md_avg_fail: "SNR без данных, дБ", md_band: "SNR",
    md_empty: "Пока нет данных", md_sat_title: "Режим спутника — порог по всем спутникам", md_more: "все режимы →",
    sat_best: "Лучший приём", sat_days: "По дням", sat_latest: "Последние наблюдения",
    sat_obs_total: "Наблюдения всего", sat_best_snr: "Лучший SNR, дБ", sat_last: "Последнее наблюдение",
    sat_first: "первое", sat_date: "Дата", sat_none: "Наблюдений этого спутника пока нет",
    m_map: "Карта", m_polar: "Пролёт над станцией", m_passes: "Ближайшие пролёты (24 ч)",
    m_max_el: "Макс. угол", m_az: "Азимут AOS → LOS", m_in: "Через", m_running: "идёт",
    m_alt: "Высота", m_none: "Ближайших пролётов нет", m_max_at: "максимум в",
    h_days: "дней", h_obs_chart: "Наблюдения по дням", h_not_decoded: "Без декодирования",
    h_packets_chart: "Пакеты по дням", h_sats_chart: "Спутники по дням", h_snr_chart: "Средний SNR по дням, дБ",
    h_noise_chart: "Средний шум по дням, дБ", h_table: "Таблица по дням", h_active: "Активных дней",
    h_best: "Лучший день", h_sats: "Спутников",
    nav_offline: "Офлайн-тест",
    o_note: "Офлайн-тест декодирует записанный пролёт (.ogg) без станции. Декодер работает без сети: результаты остаются только здесь и никуда не отправляются.",
    o_worker_off: "Офлайн-декодер (дополнение offline) не запущен — тесты встанут в очередь и начнутся, когда он заработает.",
    o_upload: "Загрузить запись", o_file: "Файл (.ogg, .wav)", o_sat: "Спутник (NORAD) — пусто = автоподбор",
    o_obs: "ID наблюдения (необязательно)", o_elev: "Макс. угол, ° (если нет ID)", o_iq: "Запись IQ (2 канала)",
    o_start: "Запустить", o_from: "Из моего наблюдения", o_obs_own: "ID наблюдения станции",
    o_tests: "Тесты", o_created: "Создан UTC", o_source: "Источник", o_file_col: "Файл", o_angle: "Макс. угол",
    o_state: "Статус", o_result: "Результат", o_best: "Лучший декодер", o_frames: "Кадров",
    st_queued: "в очереди", st_running: "идёт", st_done: "декодировано", st_fail: "не декодировано", st_error: "ошибка",
    o_auto: "автоподбор", o_given: "задан", o_rerun: "Повторить", o_delete: "Удалить", o_kiss: "Скачать KISS",
    o_ranking: "Кандидаты", o_hex: "Кадры (HEX)", o_log: "Журнал gr_satellites", o_runs: "Попытки",
    o_tried: "проверено", o_rec: "Запись", o_uploading: "Загрузка…", o_queued_msg: "Тест поставлен в очередь",
    o_keep: "Оригинал хранится, пока запись не декодирована", o_low: "низкий пролёт — можно удалить",
    o_src_upload: "загрузка", o_src_station: "станция", o_line: "линия", o_noline: "сигнал не найден — проверяются все описания", o_confirm: "Удалить тест и файл?", o_none: "Тестов пока нет",
  },
  en: {
    brand_sub: "SONIKS / Ground station",
    nav_overview: "Overview", nav_orbit: "Orbit", nav_history: "History", nav_guide: "Guide",
    utc_date: "UTC date", utc_time: "UTC time", local_date: "Local date", local_time: "Local time",
    tab_station: "Station", tab_satellite: "Satellite", tab_journal: "Daily journal",
    tab_map: "Orbit / Map", tab_signal: "Signal / Waterfall",
    station: "Station", client: "Client", qth: "QTH", observations_total: "Observations total",
    today: "Today", obs_short: "Obs.", sat_short: "Sats", packets: "Packets",
    future_jobs: "Future jobs", owner: "Owner", compare: "Compare",
    compared_station: "Compared station", coordinates: "Coordinates",
    satyaml: "Satyaml descriptions", ram: "Memory", disk: "Station disk",
    archive: "Image archive", connected: "Connected", not_connected: "Not connected",
    a_images: "images", a_archives: "ZIP archives — 2 months each (UTC)", a_no_archives: "No archives yet — a ZIP is made after the period ends",
    a_more: "Show more", a_empty: "No images yet", a_shown: "Images", a_of: "of", a_download: "Download", a_broken: "Incomplete image", f_author: "Author", f_version: "Version",
    a_baud: "Bd", k_sstv: "SSTV", k_ssdv: "SSDV", k_lrpt: "LRPT", k_packet: "Packet image",
    not_found: "Station not found", soon: "Section in development",
    online_pick: "Online stations…",
    j_today: "Today", j_per_sat: "Per satellite — daily averages", j_observations: "Observations of the day",
    j_obs: "Observations", j_sats: "Satellites", j_decoded: "Decoded", j_packets: "Packets",
    j_images: "Images", j_avg_noise: "Average noise, dB", j_avg_snr: "Average SNR, dB",
    j_avg_peak: "Average peak, dB", j_time: "Time UTC", j_id: "Observation", j_sat: "Satellite",
    j_mode: "Mode", j_freq: "Frequency, MHz", j_noise: "Noise, dB", j_snr: "SNR, dB", j_peak: "Peak, dB",
    j_waterfall: "Waterfall", j_count: "Obs.", j_empty: "No observations on this day",
    s_all_sats: "All satellites", s_decoded_only: "Decoded only",
    s_shown: "Waterfalls", s_empty: "No waterfalls for this selection",
    md_title: "By mode — from which SNR it decodes", md_last: "last", md_days: "days",
    md_mode: "Mode", md_baud: "Baud", md_passes: "Passes", md_min: "Min SNR with data, dB",
    md_avg_ok: "SNR decoded, dB", md_avg_fail: "SNR no data, dB", md_band: "SNR",
    md_empty: "No data yet", md_sat_title: "Satellite's mode — threshold over all satellites", md_more: "all modes →",
    sat_best: "Best reception", sat_days: "Per day", sat_latest: "Latest observations",
    sat_obs_total: "Observations total", sat_best_snr: "Best SNR, dB", sat_last: "Last observation",
    sat_first: "first", sat_date: "Date", sat_none: "No observations of this satellite yet",
    m_map: "Map", m_polar: "Pass over the station", m_passes: "Upcoming passes (24 h)",
    m_max_el: "Max elevation", m_az: "Azimuth AOS → LOS", m_in: "Starts in", m_running: "running",
    m_alt: "Altitude", m_none: "No upcoming passes", m_max_at: "maximum at",
    h_days: "days", h_obs_chart: "Observations per day", h_not_decoded: "Not decoded",
    h_packets_chart: "Packets per day", h_sats_chart: "Satellites per day", h_snr_chart: "Average SNR per day, dB",
    h_noise_chart: "Average noise per day, dB", h_table: "Table per day", h_active: "Active days",
    h_best: "Best day", h_sats: "Satellites",
    nav_offline: "Offline test",
    o_note: "The offline test decodes a recorded pass (.ogg) without the station. The decoder has no network: results stay here only and are never sent anywhere.",
    o_worker_off: "The offline decoder (offline addon) is not running — tests are queued and start once it runs.",
    o_upload: "Upload a recording", o_file: "File (.ogg, .wav)", o_sat: "Satellite (NORAD) — empty = auto",
    o_obs: "Observation ID (optional)", o_elev: "Max elevation, ° (if no ID)", o_iq: "IQ recording (2 channels)",
    o_start: "Start", o_from: "From my observation", o_obs_own: "Station observation ID",
    o_tests: "Tests", o_created: "Created UTC", o_source: "Source", o_file_col: "File", o_angle: "Max elevation",
    o_state: "Status", o_result: "Result", o_best: "Best decoder", o_frames: "Frames",
    st_queued: "queued", st_running: "running", st_done: "decoded", st_fail: "not decoded", st_error: "error",
    o_auto: "auto", o_given: "given", o_rerun: "Run again", o_delete: "Delete", o_kiss: "Download KISS",
    o_ranking: "Candidates", o_hex: "Frames (HEX)", o_log: "gr_satellites log", o_runs: "Attempts",
    o_tried: "tried", o_rec: "Recording", o_uploading: "Uploading…", o_queued_msg: "Test queued",
    o_keep: "The original is kept until the recording decodes", o_low: "low pass — may be deleted",
    o_src_upload: "upload", o_src_station: "station", o_line: "line", o_noline: "no signal found — trying every description", o_confirm: "Delete the test and its file?", o_none: "No tests yet",
  },
};

let lang = "ru";
try { lang = localStorage.getItem("monitor-lang") || "ru"; } catch (_) {}
let lastOverview = null;
let lastCompare = null;

const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N.ru[key] || key;
const esc = (v) => String(v ?? "—").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const num = (v) => (v === null || v === undefined ? "—" : Number(v).toLocaleString("ru-RU").replace(/ /g, ""));

// Maidenhead locator (6 chars) from coordinates — to catch QTH/coordinate mismatch.
function locator(lat, lng) {
  if (lat === undefined || lng === undefined || lat === null || lng === null) return null;
  const A = "ABCDEFGHIJKLMNOPQR", a = "abcdefghijklmnopqrstuvwx";
  let x = lng + 180, y = lat + 90;
  const f1 = A[Math.floor(x / 20)], f2 = A[Math.floor(y / 10)];
  x %= 20; y %= 10;
  const s1 = Math.floor(x / 2), s2 = Math.floor(y);
  x = (x % 2) * 12; y = (y % 1) * 24;
  return f1 + f2 + s1 + s2 + a[Math.floor(x)] + a[Math.floor(y)];
}

function card(label, value, extra = "") {
  return `<div class="card"><div class="card-label">${esc(label)}</div>` +
         `<div class="card-value">${value}</div>${extra}</div>`;
}

function stationCards(st, today, jobs, withId = true) {
  st = st || {};
  const name = st.name !== undefined ? (withId ? `${esc(st.name)} #${esc(st.id)}` : esc(st.name)) : "—";
  const client = st.client_version ? `<div class="card-sub">${t("client")} ${esc(st.client_version)}</div>` : "";

  let qth = esc(st.qthlocator);
  let qthExtra = "";
  const calc = locator(st.lat, st.lng);
  if (calc && st.qthlocator && calc.slice(0, 6).toUpperCase() !== String(st.qthlocator).slice(0, 6).toUpperCase()) {
    qth += `<span class="qth-warn">⚠ → ${esc(calc.slice(0, 4).toUpperCase() + calc.slice(4, 6))}</span>`;
    qthExtra = `<div class="card-warn">${t("coordinates")}: ${Number(st.lat).toFixed(3)} / ${Number(st.lng).toFixed(3)}</div>`;
  }

  const td = today || {};
  const todayHtml = `<div class="mini">` +
    `<div><div class="mini-label">${t("obs_short")}</div><div class="mini-value">${num(td.observations)}</div></div>` +
    `<div><div class="mini-label">${t("sat_short")}</div><div class="mini-value">${num(td.satellites)}</div></div>` +
    `<div><div class="mini-label">${t("packets")}</div><div class="mini-value">${num(td.packets)}</div></div></div>`;

  return card(t("station"), name, client) +
    card(t("qth"), qth, qthExtra) +
    card(t("observations_total"), num(st.observations)) +
    `<div class="card"><div class="card-label">${t("today")}</div>${todayHtml}</div>` +
    card(t("future_jobs"), num(jobs)) +
    card(t("owner"), esc(st.owner));
}

function barCard(label, pct) {
  const value = pct === null || pct === undefined ? "—" : `${Number(pct).toFixed(1)}%`;
  const width = Math.max(0, Math.min(100, pct || 0));
  return card(label, value, `<div class="bar"><span style="width:${width}%"></span></div>`);
}

function renderOverview() {
  const o = lastOverview;
  if (!o) return;
  document.getElementById("own-station").innerHTML = stationCards(o.station, o.today, o.future_jobs);
  document.getElementById("system").innerHTML =
    card(t("satyaml"), num(o.satyaml)) +
    barCard(t("ram"), o.ram_percent) +
    barCard(t("disk"), o.disk_percent) +
    `<div class="card card-link" id="archive-card" role="button" tabindex="0">` +
    `<div class="card-label">${esc(t("archive"))}</div>` +
    `<div class="card-value">${num(o.archive_images)} <span class="sub">${t("a_images")}</span></div>` +
    `<div class="card-sub">${esc(o.archive_connected ? t("connected") : t("not_connected"))}</div></div>`;
}

function renderCompare() {
  const panel = document.getElementById("compare-panel");
  if (!lastCompare) { panel.classList.add("hidden"); return; }
  panel.classList.remove("hidden");
  document.getElementById("compare-title").textContent = `${t("compared_station")} #${lastCompare.station_id}`;
  document.getElementById("compare-station").innerHTML = lastCompare.station
    ? stationCards(lastCompare.station, lastCompare.today, lastCompare.future_jobs, false)
    : `<div class="card wide"><div class="card-label">${t("not_found")}</div></div>`;
}

/* ---------- daily journal ---------- */

let journalDay = null;
let journalData = null;

const utcToday = () => new Date().toISOString().slice(0, 10);
const db1 = (v) => (v === null || v === undefined ? "—" : Number(v).toFixed(1));
const hms = (iso) => (iso ? iso.slice(11, 19) : "—");
const fileUrl = (id, name) => `/files/${encodeURIComponent(id)}/${encodeURIComponent(name)}`;

function satCell(name, norad) {
  return `<span class="sat-name">${esc(name || `NORAD ${norad ?? "—"}`)}</span>` +
    (name && norad !== null ? ` <span class="sub">${esc(norad)}</span>` : "");
}

function renderJournal() {
  const d = journalData;
  if (!d) return;
  const s = d.summary;

  document.getElementById("j-summary").innerHTML =
    card(t("j_obs"), num(s.observations)) +
    card(t("j_sats"), num(s.satellites)) +
    card(t("j_decoded"), `${num(s.decoded)} <span class="sub">/ ${num(s.observations)}</span>`) +
    card(t("j_packets"), num(s.packets)) +
    card(t("j_images"), num(s.images)) +
    card(t("j_avg_noise"), db1(s.avg_noise_db)) +
    card(t("j_avg_snr"), db1(s.avg_snr_db)) +
    card(t("j_avg_peak"), db1(s.avg_peak_db));

  const sats = document.getElementById("j-sats");
  sats.innerHTML = d.per_satellite.length
    ? `<tr><th>${t("j_sat")}</th><th class="num">${t("j_count")}</th><th class="num">${t("j_decoded")}</th>` +
      `<th class="num">${t("j_packets")}</th><th class="num">${t("j_images")}</th><th class="num">${t("j_noise")}</th>` +
      `<th class="num">${t("j_snr")}</th><th class="num">${t("j_peak")}</th></tr>` +
      d.per_satellite.map((x) =>
        `<tr><td>${satCell(x.satellite, x.norad)}</td><td class="num">${num(x.observations)}</td>` +
        `<td class="num">${num(x.decoded)}</td><td class="num">${num(x.packets)}</td><td class="num">${num(x.images)}</td>` +
        `<td class="num">${db1(x.avg_noise_db)}</td><td class="num">${db1(x.avg_snr_db)}</td>` +
        `<td class="num">${db1(x.avg_peak_db)}</td></tr>`).join("")
    : `<tr><td class="empty">${t("j_empty")}</td></tr>`;

  const obs = document.getElementById("j-obs");
  obs.innerHTML = d.observations.length
    ? `<tr><th>${t("j_time")}</th><th>${t("j_id")}</th><th>${t("j_sat")}</th><th>${t("j_mode")}</th>` +
      `<th class="num">${t("j_freq")}</th><th class="num">${t("j_noise")}</th><th class="num">${t("j_snr")}</th>` +
      `<th class="num">${t("j_peak")}</th><th class="num">${t("j_packets")}</th><th>${t("j_images")}</th>` +
      `<th>${t("j_waterfall")}</th></tr>` +
      d.observations.slice().reverse().map((o) => {
        const packets = o.packets
          ? `<button class="link-btn" data-files="${esc(o.observation_id)}">${num(o.packets)}</button>`
          : `<span class="none">0</span>`;
        const images = (o.images || []).map((n) =>
          `<a href="${fileUrl(o.observation_id, n)}" target="_blank"><img class="thumb" loading="lazy" src="${fileUrl(o.observation_id, n)}" alt=""></a>`).join("") || `<span class="none">—</span>`;
        const wf = o.waterfall
          ? `<a href="${fileUrl(o.observation_id, o.waterfall)}" target="_blank"><img class="wf" loading="lazy" src="${fileUrl(o.observation_id, o.waterfall)}" alt=""></a>`
          : `<span class="none">—</span>`;
        const freq = o.frequency_hz ? (o.frequency_hz / 1e6).toFixed(3) : "—";
        return `<tr><td>${hms(o.started_at)}–${hms(o.stopped_at)}</td><td>${esc(o.observation_id)}</td>` +
          `<td>${satCell(o.satellite, o.norad)}</td><td>${esc(o.mode)}</td><td class="num">${freq}</td>` +
          `<td class="num">${db1(o.noise_db)}</td><td class="num${o.decodable ? " ok" : ""}">${db1(o.snr_db)}</td>` +
          `<td class="num">${db1(o.peak_db)}</td><td class="num">${packets}</td><td>${images}</td><td>${wf}</td></tr>`;
      }).join("")
    : `<tr><td class="empty">${t("j_empty")}</td></tr>`;
}

async function loadJournalDays() {
  try {
    const r = await fetch("/api/journal/days", { cache: "no-store" });
    const list = await r.json();
    const today = utcToday();
    if (!list.some((x) => x.date === today)) list.unshift({ date: today, observations: 0 });
    const select = document.getElementById("j-day");
    select.innerHTML = list.map((x) => `<option value="${x.date}">${x.date} (${x.observations})</option>`).join("");
    select.value = journalDay || today;
  } catch (_) {}
}

async function loadJournal(dayValue) {
  journalDay = dayValue || journalDay || utcToday();
  document.getElementById("j-day").value = journalDay;
  try {
    const r = await fetch(`/api/journal/${journalDay}`, { cache: "no-store" });
    journalData = await r.json();
    renderJournal();
  } catch (_) {}
}

function stepJournal(delta) {
  const select = document.getElementById("j-day");
  const i = select.selectedIndex - delta; // list is newest first
  if (i >= 0 && i < select.options.length) loadJournal(select.options[i].value);
}

document.getElementById("j-day").addEventListener("change", (e) => loadJournal(e.target.value));
document.getElementById("j-prev").addEventListener("click", () => stepJournal(-1));
document.getElementById("j-next").addEventListener("click", () => stepJournal(1));
document.getElementById("j-today").addEventListener("click", () => loadJournal(utcToday()));

document.getElementById("j-obs").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-files]");
  if (!btn) return;
  const row = btn.closest("tr");
  if (row.nextElementSibling && row.nextElementSibling.classList.contains("files")) {
    row.nextElementSibling.remove();
    return;
  }
  const id = btn.dataset.files;
  let names = [];
  try { names = await (await fetch(`/api/files/${id}`, { cache: "no-store" })).json(); } catch (_) {}
  const tr = document.createElement("tr");
  tr.className = "files";
  tr.innerHTML = `<td colspan="11">` +
    (names.map((n) => `<a href="${fileUrl(id, n)}" target="_blank">${esc(n)}</a>`).join("") || "—") + `</td>`;
  row.after(tr);
});

/* ---------- signal / waterfall ---------- */

let signalDay = null;
let signalData = null;

async function fillDays(selectId, current) {
  try {
    const list = await (await fetch("/api/journal/days", { cache: "no-store" })).json();
    const today = utcToday();
    if (!list.some((x) => x.date === today)) list.unshift({ date: today, observations: 0 });
    const select = document.getElementById(selectId);
    select.innerHTML = list.map((x) => `<option value="${x.date}">${x.date} (${x.observations})</option>`).join("");
    select.value = current || today;
  } catch (_) {}
}

function wfCard(o, withDate = false) {
  const url = o.waterfall ? fileUrl(o.observation_id, o.waterfall) : null;
  const freq = o.frequency_hz ? (o.frequency_hz / 1e6).toFixed(3) : "—";
  const stat = (label, value, cls = "") =>
    `<div><div class="mini-label">${label}</div><div class="mini-value ${cls}">${value}</div></div>`;
  const when = withDate && o.started_at ? `${o.started_at.slice(0, 10)} ` : "";
  return `<div class="wf-card">` +
    (url ? `<a href="${url}" target="_blank"><img class="wf-big" loading="lazy" src="${url}" alt=""></a>` : "") +
    `<div class="wf-meta">` +
    `<div class="wf-title">${esc(o.satellite || `NORAD ${o.norad ?? "—"}`)}<span class="sub">${esc(o.norad)}</span></div>` +
    `<div class="wf-line">${when}${hms(o.started_at)}–${hms(o.stopped_at)} UTC · #${esc(o.observation_id)}</div>` +
    `<div class="wf-line">${esc(o.mode)} · ${freq} ${lang === "ru" ? "МГц" : "MHz"}</div>` +
    `<div class="wf-stats">` +
    stat(t("j_snr"), db1(o.snr_db), o.decodable ? "ok" : "") +
    stat(t("j_noise"), db1(o.noise_db)) +
    stat(t("j_peak"), db1(o.peak_db)) +
    stat(t("j_packets"), num(o.packets), o.packets ? "ok" : "") +
    `</div></div></div>`;
}

/* ---------- image archive ---------- */

const ARCHIVE_PAGE = 60;
let archiveItems = [];
let archiveTotal = 0;
let archiveZips = [];

const fmtSize = (b) => (b === null || b === undefined ? "—" : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const utcText = (iso) => (iso ? `${iso.slice(0, 10)} ${iso.slice(11, 19)}` : "—");

function imageCard(o) {
  const baud = o.baud ? ` · ${num(o.baud)} ${t("a_baud")}` : "";
  return `<div class="wf-card">` +
    `<a href="${esc(o.url)}" target="_blank"><img class="img-big" loading="lazy" src="${esc(o.url)}" alt=""></a>` +
    `<div class="wf-meta">` +
    `<div class="img-kind">${esc(t(`k_${o.kind}`))}</div>` +
    `<div class="wf-title">${esc(o.satellite || `NORAD ${o.norad ?? "—"}`)}<span class="sub">${esc(o.norad)}</span></div>` +
    `<div class="wf-line">#${esc(o.observation_id)}</div>` +
    `<div class="wf-line">${utcText(o.started_at)} – ${hms(o.stopped_at)} UTC</div>` +
    `<div class="wf-line">${esc(o.mode)}${baud}</div>` +
    `</div></div>`;
}

document.getElementById("a-grid").addEventListener("error", (e) => {
  if (e.target.tagName !== "IMG") return;
  const d = document.createElement("div");
  d.className = "img-big img-bad";
  d.textContent = t("a_broken");
  (e.target.closest("a") || e.target).replaceWith(d);
}, true);

function renderArchive() {
  const zips = document.getElementById("a-archives");
  zips.innerHTML = archiveZips.length
    ? archiveZips.map((z) =>
        `<a class="pill" href="${esc(z.url)}">${esc(z.from.slice(0, 10))} — ${esc(z.to.slice(0, 10))}` +
        ` <span class="sub">${num(z.images)} · ${fmtSize(z.size_bytes)}</span></a>`).join("")
    : `<div class="wf-line">${t("a_no_archives")}</div>`;
  document.getElementById("a-count").textContent = archiveTotal
    ? `${t("a_shown")}: ${num(archiveItems.length)} ${t("a_of")} ${num(archiveTotal)}`
    : t("a_empty");
  document.getElementById("a-grid").innerHTML = archiveItems.map(imageCard).join("");
  document.getElementById("a-more").classList.toggle("hidden", archiveItems.length >= archiveTotal);
}

async function loadArchive(more = false) {
  try {
    const offset = more ? archiveItems.length : 0;
    const limit = more ? ARCHIVE_PAGE : Math.max(ARCHIVE_PAGE, archiveItems.length);
    const [list, zips] = await Promise.all([
      fetch(`/api/images?limit=${limit}&offset=${offset}`, { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/images/archives", { cache: "no-store" }).then((r) => r.json()),
    ]);
    archiveItems = more ? archiveItems.concat(list.items) : list.items;
    archiveTotal = list.total;
    archiveZips = zips;
    renderArchive();
  } catch (_) {}
}

function archiveVisible() {
  return !document.getElementById("tab-images").classList.contains("hidden");
}

document.getElementById("a-more").addEventListener("click", () => loadArchive(true));

/* ---------- satellite ---------- */

let satNorad = null;
let satData = null;

async function loadSatellites() {
  try {
    const list = await (await fetch("/api/satellites", { cache: "no-store" })).json();
    const select = document.getElementById("sat-select");
    select.innerHTML = list.map((x) =>
      `<option value="${x.norad}">${esc(x.satellite || `NORAD ${x.norad}`)} (${x.norad}) — ${num(x.observations)}</option>`).join("");
    if (!list.length) return;
    if (!list.some((x) => String(x.norad) === String(satNorad))) satNorad = list[0].norad;
    select.value = satNorad;
  } catch (_) {}
}

async function loadSatellite(norad) {
  satNorad = norad ?? satNorad;
  if (satNorad === null) { renderSatellite(); return; }
  try {
    satData = await (await fetch(`/api/satellite/${satNorad}`, { cache: "no-store" })).json();
  } catch (_) { satData = null; }
  renderSatellite();
}

function renderSatellite() {
  const d = satData;
  const summary = document.getElementById("sat-summary");
  if (!d || !d.summary.observations) {
    summary.innerHTML = `<div class="card wide"><div class="card-label">${t("sat_none")}</div></div>`;
    ["sat-best", "sat-days", "sat-latest", "sat-modes"].forEach((id) => { document.getElementById(id).innerHTML = ""; });
    return;
  }
  const s = d.summary;
  const pct = s.observations ? Math.round((100 * s.decoded) / s.observations) : 0;
  const last = s.last ? `${s.last.slice(0, 10)} ${hms(s.last)}` : "—";
  summary.innerHTML =
    card(t("sat_obs_total"), num(s.observations)) +
    card(t("j_decoded"), `${num(s.decoded)} <span class="sub">/ ${num(s.observations)} · ${pct}%</span>`) +
    card(t("j_packets"), num(s.packets)) +
    card(t("j_images"), num(s.images)) +
    card(t("j_avg_snr"), db1(s.avg_snr_db)) +
    card(t("j_avg_noise"), db1(s.avg_noise_db)) +
    card(t("sat_best_snr"), db1(s.best_snr_db)) +
    card(t("sat_last"), `${last}`,
      `<div class="card-sub">${t("sat_first")}: ${s.first ? s.first.slice(0, 10) : "—"}</div>`);

  document.getElementById("sat-modes").innerHTML = modesTable(d.modes);

  document.getElementById("sat-best").innerHTML = d.best ? wfCard(d.best, true) : "—";

  document.getElementById("sat-days").innerHTML =
    `<tr><th>${t("sat_date")}</th><th class="num">${t("j_count")}</th><th class="num">${t("j_decoded")}</th>` +
    `<th class="num">${t("j_packets")}</th><th class="num">${t("j_snr")}</th><th class="num">${t("sat_best_snr")}</th>` +
    `<th class="num">${t("j_noise")}</th><th class="num">${t("j_peak")}</th></tr>` +
    d.days.map((x) =>
      `<tr><td>${x.date}</td><td class="num">${num(x.observations)}</td>` +
      `<td class="num${x.decoded ? " ok" : ""}">${num(x.decoded)}</td><td class="num">${num(x.packets)}</td>` +
      `<td class="num">${db1(x.avg_snr_db)}</td><td class="num">${db1(x.best_snr_db)}</td>` +
      `<td class="num">${db1(x.avg_noise_db)}</td><td class="num">${db1(x.avg_peak_db)}</td></tr>`).join("");

  document.getElementById("sat-latest").innerHTML =
    `<tr><th>${t("j_time")}</th><th>${t("j_id")}</th><th>${t("j_mode")}</th><th class="num">${t("j_freq")}</th>` +
    `<th class="num">${t("j_noise")}</th><th class="num">${t("j_snr")}</th><th class="num">${t("j_peak")}</th>` +
    `<th class="num">${t("j_packets")}</th><th>${t("j_waterfall")}</th></tr>` +
    d.latest.map((o) => {
      const freq = o.frequency_hz ? (o.frequency_hz / 1e6).toFixed(3) : "—";
      const wf = o.waterfall
        ? `<a href="${fileUrl(o.observation_id, o.waterfall)}" target="_blank"><img class="wf" loading="lazy" src="${fileUrl(o.observation_id, o.waterfall)}" alt=""></a>`
        : `<span class="none">—</span>`;
      return `<tr><td>${o.started_at ? o.started_at.slice(0, 10) : ""} ${hms(o.started_at)}–${hms(o.stopped_at)}</td>` +
        `<td>${esc(o.observation_id)}</td><td>${esc(o.mode)}</td><td class="num">${freq}</td>` +
        `<td class="num">${db1(o.noise_db)}</td><td class="num${o.decodable ? " ok" : ""}">${db1(o.snr_db)}</td>` +
        `<td class="num">${db1(o.peak_db)}</td><td class="num">${num(o.packets)}</td><td>${wf}</td></tr>`;
    }).join("");
}

document.getElementById("sat-select").addEventListener("change", (e) => loadSatellite(e.target.value));

function satelliteVisible() {
  return !document.getElementById("tab-satellite").classList.contains("hidden");
}

/* ---------- history ---------- */

let historyDays = 30;
let historyData = null;
let CW = 960;
const CH = 200, PL = 44, PR = 8, PT = 10, PB = 26;

function niceMax(v) {
  // 4 grid steps of a "nice" size, so every tick is a round number
  if (v <= 0) return 4;
  const raw = v / 4, p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * p).find((m) => m >= raw);
  return Math.max(4, step * 4);
}

function xLabels(series, x, bw) {
  const room = Math.max(1, Math.floor((CW - PL - PR) / 46));
  const every = Math.max(1, Math.ceil(series.length / room));
  return series.map((d, i) => (i % every === 0 || i === series.length - 1) && !(i === series.length - 1 && i % every && i % every < every / 2)
    ? `<text class="ax" x="${x(i) + bw / 2}" y="${CH - 8}" text-anchor="middle">${d.date.slice(5)}</text>` : "").join("");
}

function yAxis(lo, hi, y, fmt) {
  let out = "";
  for (let k = 0; k <= 4; k++) {
    const v = lo + ((hi - lo) * k) / 4;
    out += `<line class="gl" x1="${PL}" x2="${CW - PR}" y1="${y(v)}" y2="${y(v)}"/>` +
      `<text class="ax" x="${PL - 6}" y="${y(v) + 3}" text-anchor="end">${fmt(v)}</text>`;
  }
  return out;
}

function barPath(x, yTop, w, h, r) {
  // rounded top corners only, flat on the baseline
  if (h <= 0) return "";
  r = Math.min(r, w / 2, h);
  return `M${x},${yTop + h}V${yTop + r}Q${x},${yTop} ${x + r},${yTop}H${x + w - r}Q${x + w},${yTop} ${x + w},${yTop + r}V${yTop + h}Z`;
}

function chartWidth(el) {
  // draw in the element's own pixel width so text stays at its real size
  CW = Math.max(320, Math.round(el.clientWidth || 960));
}

function barChart(el, series, stacks, tip) {
  chartWidth(el);
  // stacks: [{key, color}] bottom -> top
  const n = series.length, iw = CW - PL - PR, ih = CH - PT - PB;
  const slot = iw / n, bw = Math.min(46, Math.max(2, slot - 2));
  const max = niceMax(Math.max(...series.map((d) => stacks.reduce((a, s) => a + (d[s.key] || 0), 0))));
  const x = (i) => PL + i * slot + (slot - bw) / 2;
  const y = (v) => PT + ih - (v / max) * ih;
  let svg = yAxis(0, max, y, (v) => num(Math.round(v)));
  series.forEach((d, i) => {
    let base = 0;
    stacks.forEach((s, k) => {
      const v = d[s.key] || 0;
      if (!v) return;
      const top = y(base + v), h = y(base) - top - (base ? 2 : 0);
      const isTop = stacks.slice(k + 1).every((t) => !(d[t.key] || 0));
      svg += isTop ? `<path d="${barPath(x(i), top, bw, h, 3)}" fill="${s.color}"/>`
        : `<rect x="${x(i)}" y="${top}" width="${bw}" height="${Math.max(h, 0)}" fill="${s.color}"/>`;
      base += v;
    });
    svg += `<rect class="hit" x="${PL + i * slot}" y="${PT}" width="${slot}" height="${ih}" data-i="${i}"/>`;
  });
  svg += xLabels(series, x, bw);
  el.innerHTML = `<svg viewBox="0 0 ${CW} ${CH}">${svg}</svg>`;
  bindTip(el, series, tip);
}

function lineChart(el, series, key, tip) {
  chartWidth(el);
  const n = series.length, iw = CW - PL - PR, ih = CH - PT - PB, slot = iw / n;
  const vals = series.map((d) => d[key]).filter((v) => v !== null && v !== undefined);
  if (!vals.length) { el.innerHTML = `<div class="empty">—</div>`; return; }
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const raw = Math.max(0.5, (hi - lo) * 1.3) / 4, p10 = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p10).find((m) => m >= raw);
  lo = Math.floor((lo - step * 0.5) / step) * step;
  hi = lo + step * 4;
  while (hi < Math.max(...vals)) { lo += step; hi += step; }
  const x = (i) => PL + i * slot + slot / 2;
  const y = (v) => PT + ih - ((v - lo) / (hi - lo)) * ih;
  let svg = yAxis(lo, hi, y, (v) => v.toFixed(step < 1 ? 1 : 0));
  let path = "", open = false;
  series.forEach((d, i) => {
    const v = d[key];
    if (v === null || v === undefined) { open = false; return; }
    path += `${open ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    open = true;
  });
  svg += `<path class="ln" d="${path}"/>`;
  if (n <= 31) series.forEach((d, i) => { if (d[key] !== null && d[key] !== undefined) svg += `<circle class="dot" cx="${x(i)}" cy="${y(d[key])}" r="4"/>`; });
  series.forEach((d, i) => { svg += `<rect class="hit" x="${PL + i * slot}" y="${PT}" width="${slot}" height="${ih}" data-i="${i}"/>`; });
  svg += xLabels(series, (i) => PL + i * slot, slot);
  el.innerHTML = `<svg viewBox="0 0 ${CW} ${CH}">${svg}</svg>`;
  bindTip(el, series, tip);
}

function bindTip(el, series, tip) {
  const box = document.getElementById("h-tip");
  el.querySelectorAll(".hit").forEach((r) => {
    r.addEventListener("mousemove", (e) => {
      box.innerHTML = tip(series[Number(r.dataset.i)]);
      box.classList.remove("hidden");
      const w = box.offsetWidth;
      box.style.left = `${Math.min(e.clientX + 14, window.innerWidth - w - 8)}px`;
      box.style.top = `${e.clientY + 14}px`;
    });
    r.addEventListener("mouseleave", () => box.classList.add("hidden"));
  });
}

function renderHistory() {
  const d = historyData;
  if (!d) return;
  const s = d.summary;
  const pct = s.observations ? Math.round((100 * s.decoded) / s.observations) : 0;
  document.getElementById("h-range").textContent = `${d.from} — ${d.to} UTC`;
  document.getElementById("h-summary").innerHTML =
    card(t("j_obs"), num(s.observations)) +
    card(t("j_decoded"), `${num(s.decoded)} <span class="sub">· ${pct}%</span>`) +
    card(t("j_packets"), num(s.packets)) +
    card(t("h_sats"), num(s.satellites)) +
    card(t("j_avg_snr"), db1(s.avg_snr_db)) +
    card(t("j_avg_noise"), db1(s.avg_noise_db)) +
    card(t("h_active"), `${num(s.active_days)} <span class="sub">/ ${d.days}</span>`) +
    card(t("h_best"), s.best_day || "—", s.best_day ? `<div class="card-sub">${t("j_decoded")}: ${num(s.best_day_decoded)}</div>` : "");

  const sw = (c) => `<i class="sw" style="background:${c}"></i>`;
  const head = (x) => `<b>${x.date}</b><br>`;
  barChart(document.getElementById("h-obs"), d.series,
    [{ key: "decoded", color: "var(--c-decoded)" }, { key: "other", color: "var(--c-other)" }].map((st) => st),
    (x) => head(x) + `${sw("var(--c-decoded)")}<span class="k">${t("j_decoded")}:</span> <b>${num(x.decoded)}</b><br>` +
      `${sw("var(--c-other)")}<span class="k">${t("h_not_decoded")}:</span> <b>${num(x.observations - x.decoded)}</b><br>` +
      `<span class="k">${t("j_obs")}:</span> <b>${num(x.observations)}</b>`);
  barChart(document.getElementById("h-packets"), d.series, [{ key: "packets", color: "var(--c-decoded)" }],
    (x) => head(x) + `<span class="k">${t("j_packets")}:</span> <b>${num(x.packets)}</b>`);
  barChart(document.getElementById("h-sats"), d.series, [{ key: "satellites", color: "var(--c-decoded)" }],
    (x) => head(x) + `<span class="k">${t("h_sats")}:</span> <b>${num(x.satellites)}</b>`);
  lineChart(document.getElementById("h-snr"), d.series, "avg_snr_db",
    (x) => head(x) + `<span class="k">SNR:</span> <b>${db1(x.avg_snr_db)} dB</b>`);
  lineChart(document.getElementById("h-noise"), d.series, "avg_noise_db",
    (x) => head(x) + `<span class="k">${t("j_noise")}:</span> <b>${db1(x.avg_noise_db)}</b>`);

  document.getElementById("h-table").innerHTML =
    `<tr><th>${t("sat_date")}</th><th class="num">${t("j_obs")}</th><th class="num">${t("j_decoded")}</th>` +
    `<th class="num">${t("j_packets")}</th><th class="num">${t("h_sats")}</th><th class="num">${t("j_snr")}</th>` +
    `<th class="num">${t("j_noise")}</th></tr>` +
    d.series.slice().reverse().map((x) =>
      `<tr><td>${x.date}</td><td class="num">${num(x.observations)}</td><td class="num">${num(x.decoded)}</td>` +
      `<td class="num">${num(x.packets)}</td><td class="num">${num(x.satellites)}</td>` +
      `<td class="num">${db1(x.avg_snr_db)}</td><td class="num">${db1(x.avg_noise_db)}</td></tr>`).join("");
}

async function loadHistory(days) {
  historyDays = days || historyDays;
  let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if (historyVisible()) renderHistory(); }, 150);
});

document.querySelectorAll("[data-hdays]").forEach((b) => b.classList.toggle("active", Number(b.dataset.hdays) === historyDays));
  try {
    historyData = await (await fetch(`/api/history?days=${historyDays}`, { cache: "no-store" })).json();
    historyData.series.forEach((x) => { x.other = x.observations - x.decoded; });
    renderHistory();
  } catch (_) {}
}

document.querySelectorAll("[data-hdays]").forEach((b) =>
  b.addEventListener("click", () => loadHistory(Number(b.dataset.hdays))));

function historyVisible() {
  return !document.getElementById("page-history").classList.contains("hidden");
}

/* ---------- offline test ---------- */

let offlineData = null;
let offlineOpen = null;
let offlineDetail = null;
let offlineSatsLoaded = false;

function runState(r) {
  if (!r) return "queued";
  if (r.state === "done") return r.decoded ? "done" : "fail";
  return r.state;
}

function stateCell(r) {
  const st = runState(r);
  let extra = "";
  if (st === "running" && r.progress && r.progress.total) extra = ` ${r.progress.done}/${r.progress.total}`;
  return `<span class="state ${st}">${t("st_" + st)}${extra}</span>`;
}

function angleText(v) {
  return v === null || v === undefined ? "—" : `${Number(v).toFixed(1)}°`;
}

async function loadOfflineSats() {
  if (offlineSatsLoaded) return;
  try {
    const list = await (await fetch("/api/offline/satellites")).json();
    document.getElementById("o-sats").innerHTML =
      list.map((x) => `<option value="${x.norad}">${esc(x.name)}</option>`).join("");
    offlineSatsLoaded = true;
  } catch (_) {}
}

function renderOfflineList() {
  const d = offlineData;
  if (!d) return;
  document.getElementById("o-worker").classList.toggle("hidden", d.worker.running);
  const table = document.getElementById("o-tests");
  if (!d.tests.length) { table.innerHTML = `<tr><td class="empty">${t("o_none")}</td></tr>`; return; }
  table.innerHTML =
    `<tr><th>${t("o_created")}</th><th>${t("o_source")}</th><th>${t("o_file_col")}</th><th>${t("j_sat")}</th>` +
    `<th class="num">${t("o_angle")}</th><th>${t("o_state")}</th><th>${t("o_best")}</th><th class="num">${t("o_frames")}</th></tr>` +
    d.tests.map((x) => {
      const last = x.runs[x.runs.length - 1];
      // a test that decoded once stays decoded; otherwise show the latest attempt
      const r = x.best_run && !(last && ["queued", "running"].includes(last.state)) ? x.best_run : last;
      const best = r && r.best ? `${esc(r.best.name)} <span class="sub">${esc(r.best.file)}</span>` : "—";
      const satCol = x.norad ? satCell(x.satellite, x.norad)
        : r && r.best ? `${satCell(r.best.name, r.best.norad)} <span class="sub">(${t("o_auto")})</span>`
        : `<span class="none">${t("o_auto")}</span>`;
      const low = x.max_elevation !== null && x.max_elevation !== undefined && x.max_elevation < d.low_elevation;
      return `<tr class="pick${offlineOpen === x.id ? " sel" : ""}" data-test="${esc(x.id)}">` +
        `<td>${esc(x.created.slice(0, 10))} ${hms(x.created)}</td>` +
        `<td>${t(x.source === "station" ? "o_src_station" : "o_src_upload")}${x.observation_id ? ` #${esc(x.observation_id)}` : ""}</td>` +
        `<td>${esc(x.filename)}</td><td>${satCol}</td>` +
        `<td class="num">${angleText(x.max_elevation)}${low ? ` <span class="sub">↓</span>` : ""}</td>` +
        `<td>${stateCell(r)}</td><td>${best}</td><td class="num">${r && r.best ? num(r.best.frames) : "—"}</td></tr>`;
    }).join("");
}

let offlineDetailKey = "";

function renderOfflineDetail(force = true) {
  const box = document.getElementById("o-detail");
  const x = offlineDetail;
  if (!x) { box.classList.add("hidden"); offlineDetailKey = ""; return; }
  // polling must not wipe what the user is typing: redraw only when something changed
  const key = lang + JSON.stringify(x);
  if (!force && key === offlineDetailKey) return;
  offlineDetailKey = key;
  box.classList.remove("hidden");
  const low = x.max_elevation !== null && x.max_elevation !== undefined && x.max_elevation < (offlineData ? offlineData.low_elevation : 10);
  const geo = x.max_elevation !== undefined && x.max_elevation !== null
    ? `${t("o_angle")}: <b>${angleText(x.max_elevation)}</b>` +
      (x.rise_azimuth !== undefined && x.rise_azimuth !== null ? ` · az ${x.rise_azimuth}° → ${x.set_azimuth}°` : "") +
      (x.station ? ` · ${esc(x.station)}` : "")
    : `${t("o_angle")}: —`;
  let html = `<div class="panel-title">${esc(x.filename)} <span class="map-now">${esc(x.id)}</span></div>` +
    `<div class="pass-info">${geo}<br>` +
    (x.decoded ? "" : `${t("o_keep")}${low ? ` · <b>${t("o_low")}</b>` : ""}`) + `</div>` +
    `<div class="o-actions">` +
    (x.has_input ? `<input id="o-rerun-sat" list="o-sats" placeholder="${t("o_sat")}">` +
      `<label class="check"><input type="checkbox" id="o-rerun-iq"> <span>${t("o_iq")}</span></label>` +
      `<button class="pill" type="button" id="o-rerun">${t("o_rerun")}</button>` : "") +
    `<button class="pill danger" type="button" id="o-del">${t("o_delete")}</button></div>`;

  html += `<div class="panel-title">${t("o_runs")}</div>`;
  for (const r of x.runs.slice().reverse()) {
    const req = r.request || {};
    const rec = r.recording ? `${t("o_rec")}: ${r.recording.samp_rate} Hz · ${r.recording.channels} ch · ${r.recording.seconds} s` +
      (r.recording.baud ? ` · ~${num(r.recording.baud)} Bd (${t("o_line")} ${r.recording.confidence}×)`
        : r.recording.lines ? ` · ${t("o_noline")}` : "") : "";
    html += `<div class="panel">` +
      `<div class="chart-head"><div class="o-run-head"><b>#${r.run}</b> · ${req.satellite && req.satellite !== "auto" ? `${t("o_given")}: ${esc(req.satellite)}` : t("o_auto")}` +
      `${req.iq ? " · IQ" : ""} · ${stateCell(r)}${r.tried ? ` · ${t("o_tried")} ${num(r.tried)}` : ""}</div>` +
      (r.has_kiss ? `<a class="pill" href="/api/offline/${encodeURIComponent(x.id)}/run/${r.run}/kiss">${t("o_kiss")}</a>` : "") + `</div>` +
      (rec ? `<div class="pass-info">${rec}</div>` : "") +
      (r.error ? `<div class="note warn">${esc(r.error)}</div>` : "");
    if (r.ranking && r.ranking.length) {
      html += `<div class="table-wrap"><table class="tbl"><tr><th>${t("o_ranking")}</th><th>satyaml</th>` +
        `<th class="num">Bd</th><th class="num">${t("o_frames")}</th></tr>` +
        r.ranking.slice(0, 15).map((c) => `<tr><td>${satCell(c.name, c.norad)}</td><td class="sub">${esc(c.file)}</td>` +
          `<td class="num">${c.bauds.map((b) => num(b)).join(", ")}</td><td class="num${c.frames ? " ok" : ""}">${num(c.frames)}</td></tr>`).join("") +
        `</table></div>`;
    }
    if (r.frames_hex && r.frames_hex.length) {
      html += `<div class="panel-title">${t("o_hex")} (${num(r.frames_hex.length)})</div>` +
        `<div class="hex">${r.frames_hex.map((h) => `<div>${h.replace(/(..)/g, "$1 ").trim()}</div>`).join("")}</div>`;
    }
    if (r.log_tail) {
      html += `<details><summary class="panel-title">${t("o_log")}</summary><div class="hex log">${esc(r.log_tail)}</div></details>`;
    }
    html += `</div>`;
  }
  box.innerHTML = html;

  const rerun = document.getElementById("o-rerun");
  if (rerun) rerun.addEventListener("click", async () => {
    const sat = document.getElementById("o-rerun-sat").value.trim() || "auto";
    const iq = document.getElementById("o-rerun-iq").checked;
    await fetch(`/api/offline/${encodeURIComponent(x.id)}/rerun?satellite=${encodeURIComponent(sat)}&iq=${iq}`, { method: "POST" });
    loadOffline();
  });
  document.getElementById("o-del").addEventListener("click", async () => {
    if (!window.confirm(t("o_confirm"))) return;
    await fetch(`/api/offline/${encodeURIComponent(x.id)}`, { method: "DELETE" });
    offlineOpen = null; offlineDetail = null;
    loadOffline();
  });
}

async function loadOffline() {
  loadOfflineSats();
  try {
    offlineData = await (await fetch("/api/offline", { cache: "no-store" })).json();
    renderOfflineList();
    if (offlineOpen) {
      const r = await fetch(`/api/offline/${encodeURIComponent(offlineOpen)}`, { cache: "no-store" });
      offlineDetail = r.ok ? await r.json() : null;
      if (!r.ok) offlineOpen = null;
    } else {
      offlineDetail = null;
    }
    renderOfflineDetail(false);
  } catch (_) {}
}

document.getElementById("o-tests").addEventListener("click", (e) => {
  const row = e.target.closest("[data-test]");
  if (!row) return;
  offlineOpen = row.dataset.test;
  loadOffline();
});

document.getElementById("o-upload").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("o-upload-msg");
  const file = document.getElementById("o-file").files[0];
  if (!file) return;
  const q = new URLSearchParams({
    filename: file.name,
    satellite: document.getElementById("o-sat").value.trim(),
    observation: document.getElementById("o-obs").value.trim(),
    elevation: document.getElementById("o-elev").value.trim().replace(",", "."),
    iq: document.getElementById("o-iq").checked,
  });
  msg.className = "o-msg"; msg.textContent = t("o_uploading");
  try {
    const r = await fetch(`/api/offline/upload?${q}`, { method: "POST", body: file });
    const body = await r.json();
    if (!r.ok) throw new Error(body.detail || r.status);
    msg.textContent = t("o_queued_msg");
    offlineOpen = body.id;
    e.target.reset();
    loadOffline();
  } catch (err) { msg.className = "o-msg err"; msg.textContent = String(err.message || err); }
});

document.getElementById("o-from").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("o-from-msg");
  const id = document.getElementById("o-from-obs").value.trim();
  const sat = document.getElementById("o-from-sat").value.trim();
  try {
    const r = await fetch(`/api/offline/from/${encodeURIComponent(id)}?satellite=${encodeURIComponent(sat)}`, { method: "POST" });
    const body = await r.json();
    if (!r.ok) throw new Error(body.detail || r.status);
    msg.className = "o-msg"; msg.textContent = t("o_queued_msg");
    offlineOpen = body.id;
    e.target.reset();
    loadOffline();
  } catch (err) { msg.className = "o-msg err"; msg.textContent = String(err.message || err); }
});

function offlineVisible() {
  return !document.getElementById("page-offline").classList.contains("hidden");
}

/* ---------- orbit / map ---------- */

let orbitData = null;
let orbitPick = null;
let land = null;

const mx = (lon) => lon + 180;
const my = (lat) => 90 - lat;

function segments(points) {
  // split [lat, lon] lines where they cross the antimeridian
  const out = [];
  let cur = [];
  for (const [lat, lon] of points) {
    if (cur.length && Math.abs(lon - cur[cur.length - 1][1]) > 180) { out.push(cur); cur = []; }
    cur.push([lat, lon]);
  }
  if (cur.length) out.push(cur);
  return out.map((seg) => seg.map(([lat, lon]) => `${mx(lon).toFixed(2)},${my(lat).toFixed(2)}`).join(" "));
}

function footprint(lat, lon, radiusDeg) {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180, d = (radiusDeg * Math.PI) / 180;
  const pts = [];
  for (let b = 0; b <= 360; b += 5) {
    const br = (b * Math.PI) / 180;
    const la2 = Math.asin(Math.sin(la) * Math.cos(d) + Math.cos(la) * Math.sin(d) * Math.cos(br));
    const lo2 = lo + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(la), Math.cos(d) - Math.sin(la) * Math.sin(la2));
    let lon2 = ((lo2 * 180) / Math.PI + 540) % 360 - 180;
    pts.push([(la2 * 180) / Math.PI, lon2]);
  }
  return pts;
}

function countdown(iso) {
  const sec = Math.round((Date.parse(iso) - Date.now()) / 1000);
  if (sec <= 0) return null;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function selectedPass() {
  if (!orbitData || !orbitData.passes.length) return null;
  return orbitData.passes.find((p) => p.id === orbitPick) || orbitData.passes[0];
}

function renderMap() {
  const d = orbitData;
  const svg = document.getElementById("m-map");
  if (!d) return;
  const pick = selectedPass();
  let html = "";
  for (let lon = -150; lon <= 150; lon += 30) html += `<line class="grid" x1="${mx(lon)}" y1="0" x2="${mx(lon)}" y2="180"/>`;
  for (let lat = -60; lat <= 60; lat += 30) html += `<line class="grid" x1="0" y1="${my(lat)}" x2="360" y2="${my(lat)}"/>`;
  if (land) {
    // rings crossing the antimeridian are stored unwrapped (lon beyond ±180): draw them shifted too
    const poly = (ring, shift) =>
      `<polygon class="land" points="${ring.map(([lon, lat]) => `${(mx(lon + shift)).toFixed(2)},${my(lat)}`).join(" ")}"/>`;
    for (const ring of land) {
      html += poly(ring, 0);
      if (ring.some(([lon]) => lon > 180)) html += poly(ring, -360);
      if (ring.some(([lon]) => lon < -180)) html += poly(ring, 360);
    }
  }
  const sel = d.satellites.find((x) => pick && x.norad === pick.norad);
  if (sel) {
    segments(footprint(sel.lat, sel.lon, sel.footprint_deg)).forEach((pts) => { html += `<polyline class="foot" points="${pts}"/>`; });
    segments(sel.orbit).forEach((pts) => { html += `<polyline class="orbit" points="${pts}"/>`; });
  }
  if (pick) segments(pick.ground).forEach((pts) => { html += `<polyline class="track" points="${pts}"/>`; });
  for (const x of d.satellites) {
    const isSel = sel && x.norad === sel.norad;
    html += `<circle class="sat${isSel ? " sel" : ""}" cx="${mx(x.lon)}" cy="${my(x.lat)}" r="${isSel ? 1.8 : 1.1}"/>` +
      `<text class="sat-label${isSel ? " sel" : ""}" x="${mx(x.lon) + 2}" y="${my(x.lat) + 1}">${esc(x.satellite)}</text>`;
  }
  if (d.station.lat !== null && d.station.lat !== undefined) {
    html += `<rect class="station" x="${mx(d.station.lon) - 1.6}" y="${my(d.station.lat) - 1.6}" width="3.2" height="3.2"/>`;
  }
  svg.innerHTML = html;
  document.getElementById("m-now").textContent = d.now ? `${d.now.slice(0, 10)} ${hms(d.now)} UTC` : "";
}

function renderPolar() {
  const pick = selectedPass();
  const svg = document.getElementById("m-polar");
  const r = (el) => ((90 - Math.max(el, 0)) / 90) * 100;
  const xy = (az, el) => {
    const a = (az * Math.PI) / 180;
    return [r(el) * Math.sin(a), -r(el) * Math.cos(a)];
  };
  let html = [0, 30, 60].map((el) => `<circle class="ring" r="${r(el)}"/>`).join("") +
    `<line class="axis" x1="-100" y1="0" x2="100" y2="0"/><line class="axis" x1="0" y1="-100" x2="0" y2="100"/>` +
    `<text class="lbl" x="0" y="-106">N</text><text class="lbl" x="106" y="0">E</text>` +
    `<text class="lbl" x="0" y="106">S</text><text class="lbl" x="-106" y="0">W</text>` +
    `<text class="lbl" x="5" y="${-r(30) + 6}">30°</text><text class="lbl" x="5" y="${-r(60) + 6}">60°</text>`;
  const info = document.getElementById("m-pass");
  if (pick) {
    const pts = pick.polar.map(([az, el]) => xy(az, el).map((v) => v.toFixed(1)).join(",")).join(" ");
    const [ax, ay] = xy(...pick.polar[0]);
    const [lx, ly] = xy(...pick.polar[pick.polar.length - 1]);
    html += `<polyline class="path" points="${pts}"/>` +
      `<circle class="aos" cx="${ax}" cy="${ay}" r="4"/><circle class="los" cx="${lx}" cy="${ly}" r="4"/>`;
    // where the satellite is now, if the pass is running
    const now = Date.now(), t0 = Date.parse(pick.start);
    const i = Math.round((now - t0) / 10000);
    if (i >= 0 && i < pick.polar.length) {
      const [nx, ny] = xy(...pick.polar[i]);
      html += `<circle class="now" cx="${nx}" cy="${ny}" r="5"/>`;
    }
    const freq = pick.frequency_hz ? (pick.frequency_hz / 1e6).toFixed(3) : "—";
    const sat = orbitData.satellites.find((x) => x.norad === pick.norad);
    info.innerHTML = `<div class="pass-info">` +
      `<b>${esc(pick.satellite)}</b> <span class="sub">${esc(pick.norad)}</span><br>` +
      `${hms(pick.start)}–${hms(pick.end)} UTC · ${esc(pick.mode)} · ${freq} ${lang === "ru" ? "МГц" : "MHz"}<br>` +
      `${t("m_max_el")}: <b>${pick.max_el}°</b> (${t("m_max_at")} ${hms(pick.max_at)}, az ${pick.max_az}°)<br>` +
      `${t("m_az")}: <b>${pick.aos_az}° → ${pick.los_az}°</b>` +
      (sat ? `<br>${t("m_alt")}: <b>${num(Math.round(sat.alt_km))} km</b>` : "") +
      `</div>`;
  } else {
    info.innerHTML = `<div class="pass-info">${t("m_none")}</div>`;
  }
  svg.innerHTML = html;
}

function renderPasses() {
  const d = orbitData;
  const table = document.getElementById("m-passes");
  if (!d) return;
  if (!d.passes.length) { table.innerHTML = `<tr><td class="empty">${t("m_none")}</td></tr>`; return; }
  const pick = selectedPass();
  table.innerHTML =
    `<tr><th>${t("j_time")}</th><th>${t("j_sat")}</th><th>${t("j_mode")}</th><th class="num">${t("j_freq")}</th>` +
    `<th class="num">${t("m_max_el")}</th><th>${t("m_az")}</th><th class="num">${t("m_in")}</th></tr>` +
    d.passes.map((p) => {
      const freq = p.frequency_hz ? (p.frequency_hz / 1e6).toFixed(3) : "—";
      return `<tr class="pick${pick && p.id === pick.id ? " sel" : ""}" data-pass="${p.id}">` +
        `<td>${hms(p.start)}–${hms(p.end)}</td><td>${satCell(p.satellite, p.norad)}</td><td>${esc(p.mode)}</td>` +
        `<td class="num">${freq}</td><td class="num">${p.max_el}°</td><td>${p.aos_az}° → ${p.los_az}°</td>` +
        `<td class="num" data-start="${p.start}" data-end="${p.end}"></td></tr>`;
    }).join("");
  updateCountdowns();
}

function updateCountdowns() {
  document.querySelectorAll("#m-passes [data-start]").forEach((td) => {
    const left = countdown(td.dataset.start);
    const running = !left && Date.parse(td.dataset.end) > Date.now();
    td.innerHTML = left ? left : running ? `<span class="run">${t("m_running")}</span>` : "—";
  });
}

function renderOrbit() {
  renderMap();
  renderPolar();
  renderPasses();
}

async function loadOrbit() {
  try {
    if (!land) land = await (await fetch("/static/land.json")).json();
    orbitData = await (await fetch("/api/orbit", { cache: "no-store" })).json();
    if (orbitPick === null && orbitData.passes.length) {
      const running = orbitData.passes.find((p) => p.running);
      orbitPick = (running || orbitData.passes[0]).id;
    }
    renderOrbit();
  } catch (_) {}
}

document.getElementById("m-passes").addEventListener("click", (e) => {
  const row = e.target.closest("[data-pass]");
  if (!row) return;
  orbitPick = Number(row.dataset.pass);
  renderOrbit();
});

function mapVisible() {
  return !document.getElementById("tab-map").classList.contains("hidden");
}

function renderSignal() {
  const d = signalData;
  if (!d) return;
  const satSelect = document.getElementById("s-sat");
  const keep = satSelect.value;
  const sats = new Map();
  for (const o of d.observations) {
    if (o.waterfall) sats.set(String(o.norad), o.satellite || `NORAD ${o.norad ?? "—"}`);
  }
  satSelect.querySelectorAll("option[data-norad]").forEach((o) => o.remove());
  [...sats.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([norad, name]) => {
    const o = document.createElement("option");
    o.value = norad;
    o.dataset.norad = norad;
    o.textContent = `${name} (${norad})`;
    satSelect.appendChild(o);
  });
  satSelect.value = sats.has(keep) ? keep : "";

  const onlyDecoded = document.getElementById("s-decoded").checked;
  const list = d.observations.slice().reverse().filter((o) =>
    o.waterfall && (!satSelect.value || String(o.norad) === satSelect.value) && (!onlyDecoded || o.decodable));

  document.getElementById("s-count").textContent = `${t("s_shown")}: ${list.length}`;
  const grid = document.getElementById("s-grid");
  grid.innerHTML = list.length ? list.map((o) => wfCard(o)).join("")
    : `<div class="card wide"><div class="card-label">${t("s_empty")}</div></div>`;
}

async function loadSignal(dayValue) {
  signalDay = dayValue || signalDay || utcToday();
  document.getElementById("s-day").value = signalDay;
  try {
    signalData = await (await fetch(`/api/journal/${signalDay}`, { cache: "no-store" })).json();
    renderSignal();
  } catch (_) {}
}

function stepSignal(delta) {
  const select = document.getElementById("s-day");
  const i = select.selectedIndex - delta;
  if (i >= 0 && i < select.options.length) loadSignal(select.options[i].value);
}

document.getElementById("s-day").addEventListener("change", (e) => loadSignal(e.target.value));
document.getElementById("s-prev").addEventListener("click", () => stepSignal(-1));
document.getElementById("s-next").addEventListener("click", () => stepSignal(1));
document.getElementById("s-today").addEventListener("click", () => loadSignal(utcToday()));
document.getElementById("s-sat").addEventListener("change", renderSignal);
document.getElementById("s-decoded").addEventListener("change", renderSignal);

/* ---------- by mode (signal tab, satellite tab) ---------- */

const MD_BANDS = ["<5", "5–10", "10–15", "15–20", "≥20"];
let modesData = null;

function modesHead() {
  return `<tr><th>${t("md_mode")}</th><th class="num">${t("md_baud")}</th><th class="num">${t("md_passes")}</th>` +
    `<th class="num">${t("j_decoded")}</th><th class="num">${t("j_packets")}</th><th class="num">${t("md_min")}</th>` +
    `<th class="num">${t("md_avg_ok")}</th><th class="num">${t("md_avg_fail")}</th>` +
    MD_BANDS.map((b) => `<th class="num">${t("md_band")} ${b}</th>`).join("") + `</tr>`;
}

function modeRow(m) {
  const pct = m.passes ? Math.round((100 * m.decoded) / m.passes) : 0;
  const bands = m.bands.map((b) => {
    if (!b.n) return `<td class="num"><span class="none">—</span></td>`;
    const p = Math.round((100 * b.ok) / b.n);
    return `<td class="num${b.ok ? " ok" : ""}">${p}% <span class="sub">${b.ok}/${b.n}</span></td>`;
  }).join("");
  return `<tr><td>${esc(m.mode)}</td><td class="num">${m.baud ? num(m.baud) : "—"}</td>` +
    `<td class="num">${num(m.passes)}</td>` +
    `<td class="num${m.decoded ? " ok" : ""}">${num(m.decoded)} <span class="sub">${pct}%</span></td>` +
    `<td class="num">${num(m.packets)}</td><td class="num ok">${db1(m.min_snr_decoded)}</td>` +
    `<td class="num">${db1(m.avg_snr_decoded)}</td><td class="num">${db1(m.avg_snr_failed)}</td>${bands}</tr>`;
}

function modesTable(list) {
  return list && list.length ? modesHead() + list.map(modeRow).join("")
    : `<tr><td class="none">${t("md_empty")}</td></tr>`;
}

function renderModes() {
  const d = modesData;
  if (!d) return;
  document.getElementById("md-period").textContent = `${t("md_last")} ${d.days} ${t("md_days")}`;
  document.getElementById("md-table").innerHTML = modesTable(d.modes);
}

async function loadModes() {
  try {
    modesData = await (await fetch("/api/modes?days=90", { cache: "no-store" })).json();
    renderModes();
  } catch (_) {}
}

document.getElementById("sat-modes-more").addEventListener("click", () => {
  document.querySelector('[data-tab="signal"]').click();
});

function signalVisible() {
  return !document.getElementById("tab-signal").classList.contains("hidden");
}

function journalVisible() {
  return !document.getElementById("tab-journal").classList.contains("hidden");
}

async function loadGuide() {
  const el = document.getElementById("page-guide");
  if (el.dataset.loaded) return;
  const r = await fetch("/static/guide.html");
  if (r.ok) { el.innerHTML = await r.text(); el.dataset.loaded = "1"; }
}

async function loadFaq() {
  const el = document.getElementById("page-faq");
  if (el.dataset.loaded) return;
  const r = await fetch("/static/faq.html");
  if (r.ok) { el.innerHTML = await r.text(); el.dataset.loaded = "1"; }
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-lang]").forEach((el) => el.classList.toggle("active", el.dataset.lang === lang));
  renderOverview();
  renderCompare();
  renderJournal();
  renderSignal();
  renderModes();
  renderSatellite();
  if (orbitData) renderOrbit();
  renderHistory();
  renderOfflineList();
  renderOfflineDetail();
  renderArchive();
}

function pad(n) { return String(n).padStart(2, "0"); }

function tick() {
  const now = new Date();
  document.getElementById("utc-date").textContent =
    `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
  document.getElementById("utc-time").textContent =
    `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  document.getElementById("local-date").textContent =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  document.getElementById("local-time").textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById("local-tz").textContent =
    Intl.DateTimeFormat().resolvedOptions().timeZone;
}

async function loadOverview() {
  try {
    const r = await fetch("/api/overview", { cache: "no-store" });
    lastOverview = await r.json();
    renderOverview();
  } catch (_) {}
}

async function loadOnline() {
  try {
    const r = await fetch("/api/stations/online", { cache: "no-store" });
    const list = await r.json();
    const select = document.getElementById("compare-online");
    const keep = select.value;
    select.querySelectorAll("option[data-id]").forEach((o) => o.remove());
    for (const st of list) {
      if (lastOverview && String(st.id) === String(lastOverview.station_id)) continue;
      const o = document.createElement("option");
      o.value = st.id;
      o.dataset.id = st.id;
      o.textContent = `#${st.id} — ${st.name ?? "—"} — ${st.qthlocator ?? "—"}`;
      select.appendChild(o);
    }
    select.value = keep;
  } catch (_) {}
}

document.getElementById("compare-online").addEventListener("change", (e) => {
  if (!e.target.value) return;
  document.getElementById("compare-id").value = e.target.value;
  document.getElementById("compare-form").requestSubmit();
});

document.getElementById("compare-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("compare-id").value.trim();
  if (!/^\d+$/.test(id)) return;
  try {
    const r = await fetch(`/api/station/${id}`, { cache: "no-store" });
    lastCompare = await r.json();
  } catch (_) { lastCompare = { station_id: id, station: null }; }
  renderCompare();
});

document.querySelectorAll("[data-lang]").forEach((el) => el.addEventListener("click", () => {
  lang = el.dataset.lang;
  try { localStorage.setItem("monitor-lang", lang); } catch (_) {}
  applyLang();
}));

document.querySelectorAll("[data-page]").forEach((el) => el.addEventListener("click", () => {
  document.querySelectorAll("[data-page]").forEach((b) => b.classList.toggle("active", b === el));
  const page = el.dataset.page;
  document.getElementById("page-overview").classList.toggle("hidden", page !== "overview");
  document.getElementById("page-history").classList.toggle("hidden", page !== "history");
  document.getElementById("page-offline").classList.toggle("hidden", page !== "offline");
  document.getElementById("page-guide").classList.toggle("hidden", page !== "guide");
  document.getElementById("page-placeholder").classList.toggle("hidden", ["overview", "history", "offline", "guide", "faq"].includes(page));
  if (page === "guide") loadGuide();
  document.getElementById("page-faq").classList.toggle("hidden", page !== "faq");
  if (page === "faq") loadFaq();
  if (page === "history") loadHistory();
  if (page === "offline") loadOffline();
}));

function showTab(tab) {
  document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.getElementById("tab-station").classList.toggle("hidden", tab !== "station");
  document.getElementById("tab-journal").classList.toggle("hidden", tab !== "journal");
  document.getElementById("tab-signal").classList.toggle("hidden", tab !== "signal");
  document.getElementById("tab-satellite").classList.toggle("hidden", tab !== "satellite");
  document.getElementById("tab-map").classList.toggle("hidden", tab !== "map");
  document.getElementById("tab-images").classList.toggle("hidden", tab !== "images");
  document.getElementById("tab-placeholder").classList.toggle("hidden", ["station", "journal", "signal", "satellite", "map", "images"].includes(tab));
  if (tab === "map") loadOrbit();
  if (tab === "satellite") loadSatellites().then(() => loadSatellite());
  if (tab === "journal") loadJournalDays().then(() => loadJournal());
  if (tab === "signal") { loadModes(); fillDays("s-day", signalDay).then(() => loadSignal()); }
  if (tab === "images") loadArchive();
}

document.querySelectorAll("[data-tab]").forEach((el) => el.addEventListener("click", () => showTab(el.dataset.tab)));

// The image archive opens from the "Архив изображений" card on the Station tab.
document.getElementById("system").addEventListener("click", (e) => {
  if (e.target.closest("#archive-card")) showTab("images");
});
document.getElementById("system").addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.closest("#archive-card")) { e.preventDefault(); showTab("images"); }
});

document.getElementById("brand").addEventListener("click", () => {
  document.querySelector('[data-tab="station"]').click();
});

async function checkAddons() {
  const b = document.querySelector('[data-page="offline"]');
  let on = false;
  try {
    const r = await fetch("/api/offline", { cache: "no-store" });
    on = !!(await r.json()).worker.running;
  } catch (_) {}
  b.classList.toggle("hidden", !on);
  const pg = document.getElementById("page-offline");
  if (!on && !pg.classList.contains("hidden")) {
    document.querySelector('[data-tab="station"]').click();
  }
}

document.querySelector('[data-page="offline"]').classList.add("hidden");
checkAddons();
setInterval(checkAddons, 30000);

applyLang();
tick();
setInterval(tick, 1000);
loadOverview().then(loadOnline);
setInterval(loadOverview, 30000);
setInterval(loadOnline, 300000);
setInterval(() => { if (mapVisible()) loadOrbit(); }, 30000);
setInterval(() => { if (historyVisible()) loadHistory(); }, 300000);
setInterval(() => { if (offlineVisible()) loadOffline(); }, 4000);
setInterval(() => { if (mapVisible()) { updateCountdowns(); renderPolar(); } }, 1000);
setInterval(() => {
  if (journalVisible() && journalDay === utcToday()) loadJournalDays().then(() => loadJournal());
  if (signalVisible() && signalDay === utcToday()) fillDays("s-day", signalDay).then(() => loadSignal());
  if (signalVisible()) loadModes();
  if (satelliteVisible()) loadSatellites().then(() => loadSatellite());
  if (archiveVisible()) loadArchive();
}, 60000);
