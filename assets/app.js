/* ============================================================
 *  app.js — 密码门 · 相册 · 灯箱 · 飘花 · 纪念日计数
 * ============================================================ */
const CFG = window.SITE_CONFIG;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// 全局照片列表（admin.js 也会用到）
window.PHOTOS = [];

/* ---------- 高级线性图标（Lucide 风格 SVG）---------- */
const ICONS = {
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".9" fill="currentColor" stroke="none"/><circle cx="17.5" cy="10.5" r=".9" fill="currentColor" stroke="none"/><circle cx="8.5" cy="7.5" r=".9" fill="currentColor" stroke="none"/><circle cx="6.5" cy="12.5" r=".9" fill="currentColor" stroke="none"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  replace: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}
function applyIcons() {
  $$("[data-icon]").forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
}
window.icon = icon;

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- 密码门 ---------- */
const GATE_KEY = "ourstory_unlocked";

function unlock() {
  $("#gate").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#admin-fab").classList.remove("hidden");
  initSite();
  askIdentity();
}

async function checkGate(pw) {
  const hash = await sha256(pw);
  return hash === CFG.galleryPasswordHash;
}

$("#gate-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const pw = $("#gate-input").value;
  if (await checkGate(pw)) {
    sessionStorage.setItem(GATE_KEY, "1");
    unlock();
  } else {
    $("#gate-error").textContent = t("gateErr");
    $("#gate-input").value = "";
  }
});

// 初始渲染在文件末尾执行（确保所有 const 已初始化）

/* ---------- 多语言 ---------- */
function setLang(l) {
  window.LANG = l === "vi" ? "vi" : "zh";
  localStorage.setItem("ourstory_lang", window.LANG);
  applyLang();
}

// 把所有带 data-i18n / data-i18n-ph 的元素按当前语言更新
function applyLang() {
  document.documentElement.lang = window.LANG === "vi" ? "vi" : "zh-CN";
  $$("[data-i18n]").forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });

  // 首页标题 / 副标题（来自 config 的对应语言）
  $("#hero-title").textContent = window.LANG === "vi" ? (CFG.titleVi || CFG.title) : CFG.title;
  $("#hero-sub").textContent = window.LANG === "vi" ? (CFG.subtitleVi || CFG.subtitle) : CFG.subtitle;

  buildThemePicker(); // 主题名称随语言变化

  // 已经进入相册时，刷新动态内容
  if (!$("#app").classList.contains("hidden")) {
    startCounter();
    startLoveQuote();
    if (window.PHOTOS.length) renderGallery();
    refreshSlideCaption();
  }
}

/* ---------- 浪漫主题（7 套，每天自动轮换，可手动选）---------- */
const THEME_KEY = "ourstory_theme";

function dailyThemeKey() {
  const ts = CFG.themes || [];
  if (!ts.length) return "rosegold";
  return ts[new Date().getDay() % ts.length].key; // 按星期几每天换一套
}
function storedTheme() { return localStorage.getItem(THEME_KEY) || "auto"; }
function activeThemeKey() {
  const s = storedTheme();
  return s === "auto" ? dailyThemeKey() : s;
}
function applyTheme() {
  document.documentElement.setAttribute("data-theme", activeThemeKey());
  markThemeActive();
}
function setTheme(key) {
  localStorage.setItem(THEME_KEY, key);
  applyTheme();
}
function markThemeActive() {
  const cur = storedTheme();
  $$("#theme-list .theme-item").forEach((it) =>
    it.classList.toggle("active", it.dataset.key === cur)
  );
}
function buildThemePicker() {
  const list = $("#theme-list");
  if (!list) return;
  const ts = CFG.themes || [];
  list.innerHTML = "";

  // “每日自动”选项，色点用今天的主题
  const todays = ts.find((t) => t.key === dailyThemeKey()) || { swatch: ["#fff", "#fff"] };
  const auto = document.createElement("div");
  auto.className = "theme-item";
  auto.dataset.key = "auto";
  auto.innerHTML = `<span class="theme-dot" style="background:linear-gradient(135deg,${todays.swatch.join(",")})"></span>
    <span>${t("themeAuto")}</span><span class="chk">${icon("check")}</span>`;
  auto.addEventListener("click", () => setTheme("auto"));
  list.appendChild(auto);

  ts.forEach((th) => {
    const it = document.createElement("div");
    it.className = "theme-item";
    it.dataset.key = th.key;
    const name = window.LANG === "vi" ? th.vi : th.zh;
    it.innerHTML = `<span class="theme-dot" style="background:linear-gradient(135deg,${th.swatch.join(",")})"></span>
      <span>${name}</span><span class="chk">${icon("check")}</span>`;
    it.addEventListener("click", () => setTheme(th.key));
    list.appendChild(it);
  });
  markThemeActive();
}
// 主题按钮开关
$("#theme-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  $("#theme-panel").classList.toggle("show");
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#theme-panel, #theme-btn")) $("#theme-panel").classList.remove("show");
});

/* ---------- 站点内容 ---------- */
function initSite() {
  // 进入时按身份决定语言（其次用上次记忆）
  const v = currentViewer();
  window.LANG = v ? (v.lang || "zh") : (localStorage.getItem("ourstory_lang") || "zh");
  if (CFG.names) $("#footer-names").textContent = CFG.names;
  applyLang();
  startPetals();
  initMusic();
  initClickHearts();
  loadGallery();
}

/* ---------- 纪念日 + 生日提醒 ---------- */
function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

// 计算距离某人下一个生日还有几天（0 = 今天）
function daysUntilBirthday(birthday) {
  const b = new Date(birthday);
  if (isNaN(b)) return null;
  const today = midnight(new Date());
  let next = new Date(today.getFullYear(), b.getMonth(), b.getDate());
  if (next < today) next = new Date(today.getFullYear() + 1, b.getMonth(), b.getDate());
  return Math.round((next - today) / 86400000);
}

function startCounter() {
  const lines = [];

  // 结婚天数
  if (CFG.anniversary) {
    const start = new Date(CFG.anniversary);
    if (!isNaN(start)) {
      const days = Math.floor((midnight(new Date()) - midnight(start)) / 86400000);
      if (days >= 0) lines.push(t("married")(days));
    }
  }

  // 生日提醒
  const within = CFG.birthdayRemindWithinDays ?? 30;
  const people = CFG.people || [];
  let birthdayToday = null;

  people.forEach((p) => {
    const left = daysUntilBirthday(p.birthday);
    if (left === null) return;
    if (left === 0) {
      birthdayToday = p;
      lines.push(t("bdayToday")(p.name));
    } else if (left <= within) {
      lines.push(t("bdaySoon")(p.name, left));
    }
  });

  if (lines.length) $("#counter").innerHTML = lines.join("<br />");

  if (birthdayToday) celebrateBirthday(birthdayToday);
}

/* ---------- 生日庆祝动画 ---------- */
function celebrateBirthday(person) {
  // 同一人当天只自动弹一次
  const key = "bday_" + person.name + "_" + midnight(new Date()).toISOString().slice(0, 10);
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  const ov = $("#birthday-overlay");
  $("#bd-name").textContent = person.name;
  ov.classList.remove("hidden");

  // 气球 + 彩纸
  const stage = $("#bd-stage");
  stage.innerHTML = "";
  const balloons = ["🎈", "🎈", "🎈", "🎉", "💝", "🌹", "🎂", "🧁"];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement("div");
    s.className = "bd-float";
    s.textContent = balloons[i % balloons.length];
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 22 + Math.random() * 24 + "px";
    s.style.animationDuration = 4 + Math.random() * 5 + "s";
    s.style.animationDelay = Math.random() * 3 + "s";
    stage.appendChild(s);
  }
}
document.addEventListener("click", (e) => {
  if (e.target.id === "bd-close" || e.target.id === "birthday-overlay") {
    document.querySelector("#birthday-overlay").classList.add("hidden");
  }
});

/* ---------- 飘落花瓣 ---------- */
function startPetals() {
  const wrap = $(".petals");
  const glyphs = ["🌸", "🌺", "💗", "❀", "🌷"];
  const N = window.innerWidth < 640 ? 9 : 16;
  for (let i = 0; i < N; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    p.textContent = glyphs[i % glyphs.length];
    p.style.left = Math.random() * 100 + "vw";
    p.style.fontSize = 12 + Math.random() * 16 + "px";
    p.style.animationDuration = 9 + Math.random() * 11 + "s";
    p.style.animationDelay = -Math.random() * 12 + "s";
    wrap.appendChild(p);
  }
}

/* ---------- 加载相册 ---------- */
async function loadGallery() {
  try {
    const res = await fetch("photos.json?t=" + Date.now());
    const data = await res.json();
    window.PHOTOS = data.photos || [];
  } catch {
    window.PHOTOS = [];
  }
  renderGallery();
  startSlideshow();
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/* ---------- 按地点筛选 ---------- */
const ALL = "__all__";
const UNTAGGED = "__untagged__";
let activeFilter = ALL;
window.VISIBLE = []; // 当前筛选下可见的照片（灯箱也用它翻页）

// 与语言无关的地点键（用于筛选，始终用原始文字）
function placeKey(p) {
  if (!p.place) return null;
  const { country, region } = p.place;
  const s = [country, region].filter(Boolean).join(" · ");
  return s || null;
}
// 地点完整标签（按当前语言翻译显示）
function placeLabel(p) {
  if (!p.place) return null;
  const { country, region } = p.place;
  const s = [translatePlace(country), translatePlace(region)].filter(Boolean).join(" · ");
  return s || null;
}
// 卡片上的短标签（优先地区，按语言翻译）
function placeShort(p) {
  if (!p.place) return null;
  return translatePlace(p.place.region || p.place.country) || null;
}

function buildFilters() {
  const box = $("#filters");
  box.innerHTML = "";
  if (!window.PHOTOS.length) return;

  // 统计各地点数量（按与语言无关的 key 归类，显示用翻译后的 label）
  const counts = {};
  const labels = {};
  let untagged = 0;
  window.PHOTOS.forEach((p) => {
    const k = placeKey(p);
    if (k) { counts[k] = (counts[k] || 0) + 1; labels[k] = placeLabel(p); }
    else untagged++;
  });

  const places = Object.keys(counts);
  // 完全没有地点信息时，不显示筛选条
  if (places.length === 0) return;

  const chips = [{ key: ALL, label: t("filterAll"), n: window.PHOTOS.length }];
  places.sort((a, b) => counts[b] - counts[a]).forEach((k) =>
    chips.push({ key: k, label: labels[k], n: counts[k] })
  );
  if (untagged) chips.push({ key: UNTAGGED, label: t("filterUntagged"), n: untagged });

  chips.forEach((c) => {
    const el = document.createElement("button");
    el.className = "chip" + (c.key === activeFilter ? " active" : "");
    el.innerHTML = `${c.label}<span class="n">${c.n}</span>`;
    el.addEventListener("click", () => {
      activeFilter = c.key;
      buildFilters();
      renderGallery();
    });
    box.appendChild(el);
  });
}

function filteredPhotos() {
  if (activeFilter === ALL) return window.PHOTOS;
  if (activeFilter === UNTAGGED) return window.PHOTOS.filter((p) => !placeKey(p));
  return window.PHOTOS.filter((p) => placeKey(p) === activeFilter);
}

function renderGallery() {
  buildFilters();
  const g = $("#gallery");
  g.innerHTML = "";
  if (!window.PHOTOS.length) {
    $("#empty").classList.remove("hidden");
    return;
  }
  $("#empty").classList.add("hidden");

  window.VISIBLE = filteredPhotos();
  window.VISIBLE.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";
    const place = placeShort(p) ? ` · 📍${placeShort(p)}` : "";
    card.innerHTML = `
      <img src="photos/${encodeURIComponent(p.file)}" alt="" loading="lazy" decoding="async" />
      <span class="date">${fmtDate(p.date)}${place}</span>`;
    card.addEventListener("click", () => openLightbox(i));
    g.appendChild(card);
  });

  // 渐入动画
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { rootMargin: "120px" }
  );
  $$(".card").forEach((c) => io.observe(c));
}

/* ---------- 灯箱 ---------- */
let lbIndex = 0;
function openLightbox(i) {
  lbIndex = i;
  showLb();
  $("#lightbox").classList.remove("hidden");
}
function showLb() {
  const list = window.VISIBLE;
  const p = list[lbIndex];
  if (!p) return;
  $("#lb-img").src = "photos/" + encodeURIComponent(p.file);
  const loc = placeLabel(p) ? ` · 📍${placeLabel(p)}` : "";
  $("#lb-caption").textContent = fmtDate(p.date) + loc;
}
function step(d) {
  const len = window.VISIBLE.length;
  lbIndex = (lbIndex + d + len) % len;
  showLb();
}
$(".lb-close").addEventListener("click", () => $("#lightbox").classList.add("hidden"));
$(".lb-next").addEventListener("click", () => step(1));
$(".lb-prev").addEventListener("click", () => step(-1));
$("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") $("#lightbox").classList.add("hidden"); });
document.addEventListener("keydown", (e) => {
  if ($("#lightbox").classList.contains("hidden")) return;
  if (e.key === "Escape") $("#lightbox").classList.add("hidden");
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

/* ============================================================
 *  身份选择 · 欢迎 · Toast
 * ============================================================ */
const VIEWER_KEY = "ourstory_viewer";

function toast(msg, ms = 3200) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 400);
  }, ms);
}

function currentViewer() {
  const key = localStorage.getItem(VIEWER_KEY);
  return (CFG.viewers || []).find((v) => v.key === key) || null;
}

function welcome(v) {
  const partner = (CFG.viewers || []).find((x) => x.key !== v.key);
  const line = partner
    ? t("welcome")(v.short, v.emoji, partner.short)
    : t("welcomeSolo")(v.short, v.emoji);
  toast(line, 4000);
}

function askIdentity() {
  const viewers = CFG.viewers || [];
  if (!viewers.length) return;
  const existing = currentViewer();
  if (existing) { welcome(existing); return; }

  const box = $("#identity-choices");
  box.innerHTML = "";
  viewers.forEach((v) => {
    const el = document.createElement("div");
    el.className = "id-pick";
    el.innerHTML = `<div class="id-emoji">${v.emoji}</div>
      <div class="id-short">${v.short}</div>
      <div class="id-name">${v.name}</div>`;
    el.addEventListener("click", () => {
      localStorage.setItem(VIEWER_KEY, v.key);
      $("#identity").classList.add("hidden");
      setLang(v.lang || "zh"); // 切换语言（珍 → 越南语）
      initMusic();             // 按身份换歌
      burstHearts(window.innerWidth / 2, window.innerHeight / 2, 14);
      welcome(v);
    });
    box.appendChild(el);
  });
  $("#identity").classList.remove("hidden");
}

/* ============================================================
 *  每日情话（打字机）
 * ============================================================ */
function startLoveQuote() {
  const quotes = (window.LANG === "vi" ? CFG.loveQuotesVi : CFG.loveQuotes) || CFG.loveQuotes || [];
  if (!quotes.length) return;
  // 按一年中的第几天选句，每天一句
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const text = quotes[dayOfYear % quotes.length];
  const el = $("#love-quote");
  el.textContent = "";
  el.classList.remove("done");
  let i = 0;
  (function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i++);
      setTimeout(type, 110);
    } else {
      el.classList.add("done");
    }
  })();
}

/* ============================================================
 *  幻灯片轮播
 * ============================================================ */
let ssList = [], ssIdx = 0, ssTimer = null, ssActive = "a", ssPlaying = true;
const SS_INTERVAL = 6000;

function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function startSlideshow() {
  const sec = $("#slideshow");
  if (!window.PHOTOS.length) { sec.classList.add("hidden"); return; }
  // 取最多 15 张随机照片作为轮播
  ssList = shuffle(window.PHOTOS).slice(0, Math.min(15, window.PHOTOS.length));
  ssIdx = 0; ssActive = "a"; ssPlaying = true;
  sec.classList.remove("hidden");
  $("#ss-play").innerHTML = icon("pause");
  showSlide(0, true);
  scheduleSlide();
}

function scheduleSlide() {
  clearTimeout(ssTimer);
  if (ssPlaying) ssTimer = setTimeout(() => nextSlide(1), SS_INTERVAL);
}

function showSlide(idx, instant) {
  const p = ssList[idx];
  if (!p) return;
  const incoming = ssActive === "a" ? $("#ss-a") : $("#ss-b");
  const outgoing = ssActive === "a" ? $("#ss-b") : $("#ss-a");
  incoming.src = "photos/" + encodeURIComponent(p.file);
  incoming.classList.add("show", "kb");
  incoming.style.zIndex = 2;
  outgoing.style.zIndex = 1;
  outgoing.classList.remove("show", "kb");
  const loc = placeLabel(p) ? ` · 📍${placeLabel(p)}` : "";
  $("#ss-cap").textContent = fmtDate(p.date) + loc;
  ssActive = ssActive === "a" ? "b" : "a";
}

function nextSlide(d) {
  ssIdx = (ssIdx + d + ssList.length) % ssList.length;
  showSlide(ssIdx);
  scheduleSlide();
}

// 仅刷新当前幻灯片字幕（切换语言时用，不重新淡入）
function refreshSlideCaption() {
  const p = ssList[ssIdx];
  if (!p) return;
  const loc = placeLabel(p) ? ` · 📍${placeLabel(p)}` : "";
  $("#ss-cap").textContent = fmtDate(p.date) + loc;
}

$("#ss-next").addEventListener("click", () => nextSlide(1));
$("#ss-prev").addEventListener("click", () => nextSlide(-1));
$("#ss-play").addEventListener("click", () => {
  ssPlaying = !ssPlaying;
  $("#ss-play").innerHTML = ssPlaying ? icon("pause") : icon("play");
  scheduleSlide();
});
$(".ss-stage").addEventListener("mouseenter", () => { clearTimeout(ssTimer); });
$(".ss-stage").addEventListener("mouseleave", () => scheduleSlide());

/* ============================================================
 *  点击爱心绽放
 * ============================================================ */
function burstHearts(x, y, n = 6) {
  const glyphs = ["❤", "💕", "💗", "💖", "🌸"];
  for (let i = 0; i < n; i++) {
    const h = document.createElement("div");
    h.className = "fheart";
    h.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    h.style.left = x + (Math.random() * 50 - 25) + "px";
    h.style.top = y + (Math.random() * 20 - 10) + "px";
    h.style.fontSize = 16 + Math.random() * 18 + "px";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1200);
  }
}

function initClickHearts() {
  document.addEventListener("click", (e) => {
    // 交互元素与弹层上不触发，避免干扰
    if (e.target.closest("button, a, input, .card, .chip, .id-pick, .admin, .identity, .lightbox, .ss-stage, .fab-stack, .music-btn, .theme-panel"))
      return;
    burstHearts(e.clientX, e.clientY, 5);
  });
}

/* ============================================================
 *  灯箱双击点赞飘心
 * ============================================================ */
$("#lb-img").addEventListener("dblclick", (e) => {
  burstHearts(e.clientX, e.clientY, 12);
});

/* ============================================================
 *  背景音乐（可选）
 * ============================================================ */
function initMusic() {
  const btn = $("#music-btn");
  const audio = $("#music-audio");
  const disc = btn.querySelector(".music-disc");
  const v = currentViewer();
  const url = v && CFG.music ? CFG.music[v.key] : "";

  if (!url) { btn.classList.add("hidden"); audio.pause(); return; }

  // 文件存在才显示按钮（避免出现一个点了没反应的按钮）
  fetch(url, { method: "HEAD" })
    .then((r) => {
      if (r.ok) { audio.src = url; btn.classList.remove("hidden"); }
      else btn.classList.add("hidden");
    })
    .catch(() => btn.classList.add("hidden"));

  btn.onclick = () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };
  audio.onplay = () => disc.classList.add("playing");
  audio.onpause = () => disc.classList.remove("playing");
}

/* ============================================================
 *  初始化（放在文件末尾，确保上面的 const 都已初始化）
 * ============================================================ */
applyIcons();
window.LANG = localStorage.getItem("ourstory_lang") || "zh";
applyTheme();
applyLang();
if (sessionStorage.getItem(GATE_KEY) === "1") unlock();
