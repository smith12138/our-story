/* ============================================================
 *  app.js — 密码门 · 相册 · 灯箱 · 飘花 · 纪念日计数
 * ============================================================ */
const CFG = window.SITE_CONFIG;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// 全局照片列表（admin.js 也会用到）
window.PHOTOS = [];

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

// 初始按上次记忆的语言渲染密码门
window.LANG = localStorage.getItem("ourstory_lang") || "zh";
applyLang();

if (sessionStorage.getItem(GATE_KEY) === "1") unlock();

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

  // 已经进入相册时，刷新动态内容
  if (!$("#app").classList.contains("hidden")) {
    startCounter();
    startLoveQuote();
    if (window.PHOTOS.length) renderGallery();
    refreshSlideCaption();
  }
}

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
  $("#ss-play").textContent = "⏸";
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
  $("#ss-play").textContent = ssPlaying ? "⏸" : "▶";
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
    if (e.target.closest("button, a, input, .card, .chip, .id-pick, .admin, .identity, .lightbox, .ss-stage, .admin-fab, .music-btn"))
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
  if (!CFG.musicUrl) return;
  const btn = $("#music-btn");
  const audio = $("#music-audio");
  audio.src = CFG.musicUrl;
  btn.classList.remove("hidden");
  let on = false;
  btn.addEventListener("click", () => {
    on = !on;
    if (on) { audio.play().catch(() => {}); btn.classList.add("playing"); }
    else { audio.pause(); btn.classList.remove("playing"); }
  });
}
