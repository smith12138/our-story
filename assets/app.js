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
    $("#gate-error").textContent = "密码不对哦，再试试 💔";
    $("#gate-input").value = "";
  }
});

if (sessionStorage.getItem(GATE_KEY) === "1") unlock();

/* ---------- 站点内容 ---------- */
function initSite() {
  $("#hero-title").textContent = CFG.title;
  $("#hero-sub").textContent = CFG.subtitle;
  if (CFG.names) $("#footer-names").textContent = CFG.names;
  startPetals();
  startCounter();
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
      if (days >= 0) lines.push(`结婚已经 <b>${days}</b> 天 · 还有一辈子要走 ♾`);
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
      lines.push(`🎂 今天是 <b>${p.name}</b> 的生日 · 生日快乐！`);
    } else if (left <= within) {
      lines.push(`🎈 距离 <b>${p.name}</b> 的生日还有 <b>${left}</b> 天`);
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

function cityOf(p) { return p.place && p.place.city ? p.place.city : null; }

function buildFilters() {
  const box = $("#filters");
  box.innerHTML = "";
  if (!window.PHOTOS.length) return;

  // 统计各城市数量
  const counts = {};
  let untagged = 0;
  window.PHOTOS.forEach((p) => {
    const c = cityOf(p);
    if (c) counts[c] = (counts[c] || 0) + 1;
    else untagged++;
  });

  const cities = Object.keys(counts);
  // 只有一个或没有地点信息时，不显示筛选条
  if (cities.length === 0) return;

  const chips = [{ key: ALL, label: "全部", n: window.PHOTOS.length }];
  cities.sort((a, b) => counts[b] - counts[a]).forEach((c) =>
    chips.push({ key: c, label: c, n: counts[c] })
  );
  if (untagged) chips.push({ key: UNTAGGED, label: "未标注地点", n: untagged });

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
  if (activeFilter === UNTAGGED) return window.PHOTOS.filter((p) => !cityOf(p));
  return window.PHOTOS.filter((p) => cityOf(p) === activeFilter);
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
    const place = cityOf(p) ? ` · 📍${cityOf(p)}` : "";
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
  const loc = p.place && p.place.city ? ` · 📍${p.place.city}${p.place.country ? "，" + p.place.country : ""}` : "";
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
