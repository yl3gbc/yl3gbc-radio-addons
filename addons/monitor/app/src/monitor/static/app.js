"use strict";

const I18N = {
  ru: {
    brand_sub: "SONIKS / Наземная станция",
    nav_overview: "Обзор", nav_orbit: "Орбита", nav_history: "История", nav_guide: "Руководство",
    utc_date: "Дата UTC", utc_time: "Время UTC",
    tab_station: "Станция", tab_satellite: "Спутник", tab_journal: "Дневной журнал",
    tab_map: "Орбита / Карта", tab_signal: "Сигнал / Waterfall",
    station: "Станция", client: "Клиент", qth: "QTH", observations_total: "Наблюдения всего",
    today: "Сегодня", obs_short: "Набл.", sat_short: "Спут.", packets: "Пакеты",
    future_jobs: "Будущие задания", owner: "Владелец", compare: "Сравнить",
    compared_station: "Сравниваемая станция", coordinates: "Координаты",
    satyaml: "Описания satyaml", ram: "Оперативная память", disk: "Диск станции",
    archive: "Архив изображений", connected: "Подключено", not_connected: "Не подключено",
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
    sat_best: "Лучший приём", sat_days: "По дням", sat_latest: "Последние наблюдения",
    sat_obs_total: "Наблюдения всего", sat_best_snr: "Лучший SNR, дБ", sat_last: "Последнее наблюдение",
    sat_first: "первое", sat_date: "Дата", sat_none: "Наблюдений этого спутника пока нет",
    m_map: "Карта", m_polar: "Пролёт над станцией", m_passes: "Ближайшие пролёты (24 ч)",
    m_max_el: "Макс. угол", m_az: "Азимут AOS → LOS", m_in: "Через", m_running: "идёт",
    m_alt: "Высота", m_none: "Ближайших пролётов нет", m_max_at: "максимум в",
  },
  en: {
    brand_sub: "SONIKS / Ground station",
    nav_overview: "Overview", nav_orbit: "Orbit", nav_history: "History", nav_guide: "Guide",
    utc_date: "UTC date", utc_time: "UTC time",
    tab_station: "Station", tab_satellite: "Satellite", tab_journal: "Daily journal",
    tab_map: "Orbit / Map", tab_signal: "Signal / Waterfall",
    station: "Station", client: "Client", qth: "QTH", observations_total: "Observations total",
    today: "Today", obs_short: "Obs.", sat_short: "Sats", packets: "Packets",
    future_jobs: "Future jobs", owner: "Owner", compare: "Compare",
    compared_station: "Compared station", coordinates: "Coordinates",
    satyaml: "Satyaml descriptions", ram: "Memory", disk: "Station disk",
    archive: "Image archive", connected: "Connected", not_connected: "Not connected",
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
    sat_best: "Best reception", sat_days: "Per day", sat_latest: "Latest observations",
    sat_obs_total: "Observations total", sat_best_snr: "Best SNR, dB", sat_last: "Last observation",
    sat_first: "first", sat_date: "Date", sat_none: "No observations of this satellite yet",
    m_map: "Map", m_polar: "Pass over the station", m_passes: "Upcoming passes (24 h)",
    m_max_el: "Max elevation", m_az: "Azimuth AOS → LOS", m_in: "Starts in", m_running: "running",
    m_alt: "Altitude", m_none: "No upcoming passes", m_max_at: "maximum at",
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
    card(t("archive"), esc(o.archive_connected ? t("connected") : t("not_connected")).toUpperCase());
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
    ["sat-best", "sat-days", "sat-latest"].forEach((id) => { document.getElementById(id).innerHTML = ""; });
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

function signalVisible() {
  return !document.getElementById("tab-signal").classList.contains("hidden");
}

function journalVisible() {
  return !document.getElementById("tab-journal").classList.contains("hidden");
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-lang]").forEach((el) => el.classList.toggle("active", el.dataset.lang === lang));
  renderOverview();
  renderCompare();
  renderJournal();
  renderSignal();
  renderSatellite();
  if (orbitData) renderOrbit();
}

function pad(n) { return String(n).padStart(2, "0"); }

function tick() {
  const now = new Date();
  document.getElementById("utc-date").textContent =
    `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
  document.getElementById("utc-time").textContent =
    `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
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
  const overview = el.dataset.page === "overview";
  document.getElementById("page-overview").classList.toggle("hidden", !overview);
  document.getElementById("page-placeholder").classList.toggle("hidden", overview);
}));

document.querySelectorAll("[data-tab]").forEach((el) => el.addEventListener("click", () => {
  document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b === el));
  const tab = el.dataset.tab;
  document.getElementById("tab-station").classList.toggle("hidden", tab !== "station");
  document.getElementById("tab-journal").classList.toggle("hidden", tab !== "journal");
  document.getElementById("tab-signal").classList.toggle("hidden", tab !== "signal");
  document.getElementById("tab-satellite").classList.toggle("hidden", tab !== "satellite");
  document.getElementById("tab-map").classList.toggle("hidden", tab !== "map");
  document.getElementById("tab-placeholder").classList.toggle("hidden", ["station", "journal", "signal", "satellite", "map"].includes(tab));
  if (tab === "map") loadOrbit();
  if (tab === "satellite") loadSatellites().then(() => loadSatellite());
  if (tab === "journal") loadJournalDays().then(() => loadJournal());
  if (tab === "signal") fillDays("s-day", signalDay).then(() => loadSignal());
}));

applyLang();
tick();
setInterval(tick, 1000);
loadOverview().then(loadOnline);
setInterval(loadOverview, 30000);
setInterval(loadOnline, 300000);
setInterval(() => { if (mapVisible()) loadOrbit(); }, 30000);
setInterval(() => { if (mapVisible()) { updateCountdowns(); renderPolar(); } }, 1000);
setInterval(() => {
  if (journalVisible() && journalDay === utcToday()) loadJournalDays().then(() => loadJournal());
  if (signalVisible() && signalDay === utcToday()) fillDays("s-day", signalDay).then(() => loadSignal());
  if (satelliteVisible()) loadSatellites().then(() => loadSatellite());
}, 60000);
