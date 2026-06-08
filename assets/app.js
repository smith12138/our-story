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

/* ---------- 纪念日计数 ---------- */
function startCounter() {
  if (!CFG.anniversary) return;
  const start = new Date(CFG.anniversary);
  if (isNaN(start)) return;
  const days = Math.floor((Date.now() - start) / 86400000);
  if (days >= 0) $("#counter").innerHTML = `我们已经相爱 <b>${days}</b> 天 · 还有一辈子要走 ♾`;
}

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

function renderGallery() {
  const g = $("#gallery");
  g.innerHTML = "";
  if (!window.PHOTOS.length) {
    $("#empty").classList.remove("hidden");
    return;
  }
  $("#empty").classList.add("hidden");

  window.PHOTOS.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="photos/${encodeURIComponent(p.file)}" alt="" loading="lazy" decoding="async" />
      <span class="date">${fmtDate(p.date)}</span>`;
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
  const p = window.PHOTOS[lbIndex];
  if (!p) return;
  $("#lb-img").src = "photos/" + encodeURIComponent(p.file);
  $("#lb-caption").textContent = fmtDate(p.date);
}
function step(d) {
  lbIndex = (lbIndex + d + window.PHOTOS.length) % window.PHOTOS.length;
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
