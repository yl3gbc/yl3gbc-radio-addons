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
  grid.innerHTML = list.length ? list.map((o) => {
    const url = fileUrl(o.observation_id, o.waterfall);
    const freq = o.frequency_hz ? (o.frequency_hz / 1e6).toFixed(3) : "—";
    const stat = (label, value, cls = "") =>
      `<div><div class="mini-label">${label}</div><div class="mini-value ${cls}">${value}</div></div>`;
    return `<div class="wf-card">` +
      `<a href="${url}" target="_blank"><img class="wf-big" loading="lazy" src="${url}" alt=""></a>` +
      `<div class="wf-meta">` +
      `<div class="wf-title">${esc(o.satellite || `NORAD ${o.norad ?? "—"}`)}<span class="sub">${esc(o.norad)}</span></div>` +
      `<div class="wf-line">${hms(o.started_at)}–${hms(o.stopped_at)} UTC · #${esc(o.observation_id)}</div>` +
      `<div class="wf-line">${esc(o.mode)} · ${freq} ${lang === "ru" ? "МГц" : "MHz"}</div>` +
      `<div class="wf-stats">` +
      stat(t("j_snr"), db1(o.snr_db), o.decodable ? "ok" : "") +
      stat(t("j_noise"), db1(o.noise_db)) +
      stat(t("j_peak"), db1(o.peak_db)) +
      stat(t("j_packets"), num(o.packets), o.packets ? "ok" : "") +
      `</div></div></div>`;
  }).join("") : `<div class="card wide"><div class="card-label">${t("s_empty")}</div></div>`;
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
  document.getElementById("tab-placeholder").classList.toggle("hidden", ["station", "journal", "signal"].includes(tab));
  if (tab === "journal") loadJournalDays().then(() => loadJournal());
  if (tab === "signal") fillDays("s-day", signalDay).then(() => loadSignal());
}));

applyLang();
tick();
setInterval(tick, 1000);
loadOverview().then(loadOnline);
setInterval(loadOverview, 30000);
setInterval(loadOnline, 300000);
setInterval(() => {
  if (journalVisible() && journalDay === utcToday()) loadJournalDays().then(() => loadJournal());
  if (signalVisible() && signalDay === utcToday()) fillDays("s-day", signalDay).then(() => loadSignal());
}, 60000);
