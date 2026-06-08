/* ============================================================
 *  admin.js — 后台：用 GitHub API 真正地增 / 删照片
 *  令牌仅保存在本机 localStorage，不会上传到任何地方。
 * ============================================================ */
(function () {
  const TOKEN_KEY = "ourstory_gh_token";
  const ADMIN_KEY = "ourstory_admin";
  const GH = () => window.SITE_CONFIG.github;
  const api = (path) =>
    `https://api.github.com/repos/${GH().owner}/${GH().repo}/contents/${path}`;

  const el = (s) => document.querySelector(s);
  const token = () => localStorage.getItem(TOKEN_KEY) || "";

  /* ---------- 打开 / 关闭 ---------- */
  function openAdmin() {
    el("#admin").classList.remove("hidden");
    routeAdmin();
  }
  function closeAdmin() { el("#admin").classList.add("hidden"); }
  el("#admin-fab").addEventListener("click", openAdmin);
  el(".admin-x").addEventListener("click", closeAdmin);
  // 在主体空白处双击也能呼出
  document.addEventListener("dblclick", (e) => {
    if (el("#app").classList.contains("hidden")) return;
    if (e.target.closest(".card, .lightbox, .admin, button, a, input")) return;
    openAdmin();
  });

  function show(step) {
    ["#admin-lock", "#admin-token", "#admin-panel"].forEach((s) =>
      el(s).classList.add("hidden")
    );
    el(step).classList.remove("hidden");
  }

  function routeAdmin() {
    if (sessionStorage.getItem(ADMIN_KEY) !== "1") return show("#admin-lock");
    if (!token()) return show("#admin-token");
    show("#admin-panel");
    renderAdminGrid();
  }

  /* ---------- step 1: 管理密码 ---------- */
  el("#admin-unlock").addEventListener("click", unlockAdmin);
  el("#admin-pass").addEventListener("keydown", (e) => { if (e.key === "Enter") unlockAdmin(); });
  async function unlockAdmin() {
    const buf = await crypto.subtle.digest(
      "SHA-256", new TextEncoder().encode(el("#admin-pass").value)
    );
    const hash = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hash === window.SITE_CONFIG.adminPasswordHash) {
      sessionStorage.setItem(ADMIN_KEY, "1");
      el("#admin-lock-err").textContent = "";
      el("#admin-pass").value = "";
      routeAdmin();
    } else {
      el("#admin-lock-err").textContent = "管理密码错误";
    }
  }

  /* ---------- step 2: GitHub 令牌 ---------- */
  el("#token-save").addEventListener("click", async () => {
    const t = el("#gh-token").value.trim();
    if (!t) return;
    el("#token-err").textContent = "校验中…";
    // 验证令牌有效且能访问仓库
    const ok = await fetch(api("photos.json"), { headers: ghHeaders(t) }).then((r) => r.ok);
    if (!ok) { el("#token-err").textContent = "令牌无效或无该仓库写入权限"; return; }
    localStorage.setItem(TOKEN_KEY, t);
    el("#gh-token").value = "";
    el("#token-err").textContent = "";
    routeAdmin();
  });

  el("#token-forget").addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_KEY);
    routeAdmin();
  });

  function ghHeaders(t) {
    return {
      Authorization: "Bearer " + (t || token()),
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  /* ---------- 日志 ---------- */
  function log(msg, cls = "") {
    const box = el("#admin-log");
    const line = document.createElement("div");
    line.className = cls;
    line.textContent = msg;
    box.prepend(line);
  }

  /* ---------- GitHub 读写 ---------- */
  async function ghGetJson(path) {
    const r = await fetch(api(path), { headers: ghHeaders() });
    if (!r.ok) throw new Error(`读取 ${path} 失败 (${r.status})`);
    const j = await r.json();
    const content = decodeURIComponent(escape(atob(j.content.replace(/\n/g, ""))));
    return { sha: j.sha, json: JSON.parse(content) };
  }
  async function ghPut(path, base64, message, sha) {
    const body = { message, content: base64, branch: GH().branch };
    if (sha) body.sha = sha;
    const r = await fetch(api(path), { method: "PUT", headers: ghHeaders(), body: JSON.stringify(body) });
    if (!r.ok) throw new Error(`写入 ${path} 失败 (${r.status})`);
    return r.json();
  }
  async function ghDelete(path, sha, message) {
    const r = await fetch(api(path), {
      method: "DELETE", headers: ghHeaders(),
      body: JSON.stringify({ message, sha, branch: GH().branch }),
    });
    if (!r.ok) throw new Error(`删除 ${path} 失败 (${r.status})`);
    return r.json();
  }
  const utf8ToB64 = (s) => btoa(unescape(encodeURIComponent(s)));

  async function putManifest(photos) {
    photos.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const cur = await ghGetJson("photos.json").catch(() => ({ sha: undefined }));
    const content = utf8ToB64(JSON.stringify({ photos }, null, 2) + "\n");
    await ghPut("photos.json", content, "chore: update photo manifest", cur.sha);
    window.PHOTOS = photos;
    if (window.renderGallery) window.renderGallery();
  }

  /* ---------- 上传 ---------- */
  const zone = el("#upload-zone");
  const fileInput = el("#file-input");
  zone.addEventListener("click", () => fileInput.click());
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault(); zone.classList.remove("drag");
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener("change", () => handleFiles(fileInput.files));

  function readAsB64(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]); // strip data: prefix
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  async function handleFiles(files) {
    const list = [...files].filter((f) => /^image\//.test(f.type));
    if (!list.length) return;
    let photos = [...window.PHOTOS];
    for (const f of list) {
      try {
        const ext = (f.name.match(/\.[a-z0-9]+$/i) || [".jpg"])[0].toLowerCase();
        const stamp = new Date();
        const name = `upload_${stamp.getTime()}_${Math.floor(Math.random() * 1e4)}${ext}`;
        log(`上传 ${f.name} …`);
        const b64 = await readAsB64(f);
        await ghPut("photos/" + name, b64, `feat: add photo ${name}`);
        photos.push({ file: name, date: stamp.toISOString().slice(0, 19) });
        log(`✓ ${f.name} 已上传`, "ok");
      } catch (err) {
        log(`✗ ${f.name}: ${err.message}`, "err");
      }
    }
    try {
      await putManifest(photos);
      renderAdminGrid();
      log("相册已更新（部署约 1 分钟后在线上生效）", "ok");
    } catch (err) {
      log("更新清单失败: " + err.message, "err");
    }
  }

  /* ---------- 删除 ---------- */
  async function deletePhoto(file) {
    if (!confirm(`确定删除这张照片吗？\n${file}`)) return;
    try {
      log(`删除 ${file} …`);
      // 取该文件 sha
      const meta = await fetch(api("photos/" + encodeURIComponent(file)), { headers: ghHeaders() }).then((r) => r.json());
      await ghDelete("photos/" + encodeURIComponent(file), meta.sha, `chore: remove photo ${file}`);
      const photos = window.PHOTOS.filter((p) => p.file !== file);
      await putManifest(photos);
      renderAdminGrid();
      log(`✓ ${file} 已删除`, "ok");
    } catch (err) {
      log(`✗ 删除失败: ${err.message}`, "err");
    }
  }

  /* ---------- 后台缩略图网格 ---------- */
  function renderAdminGrid() {
    const grid = el("#admin-grid");
    grid.innerHTML = "";
    window.PHOTOS.forEach((p) => {
      const d = document.createElement("div");
      d.className = "admin-thumb";
      const tag = p.place ? `<span class="tag">📍${p.place.region || p.place.country || ""}</span>` : "";
      d.innerHTML = `<img src="photos/${encodeURIComponent(p.file)}" loading="lazy" alt="" />
        <button class="edit-place" title="标注地点">📍</button>
        <button class="del" title="删除">🗑</button>${tag}`;
      d.querySelector(".del").addEventListener("click", () => deletePhoto(p.file));
      d.querySelector(".edit-place").addEventListener("click", () => openPlaceModal(p.file));
      grid.appendChild(d);
    });
  }

  /* ---------- 地点标注 ---------- */
  let placeTarget = null;
  function openPlaceModal(file) {
    placeTarget = file;
    const p = window.PHOTOS.find((x) => x.file === file);
    el("#place-preview").src = "photos/" + encodeURIComponent(file);
    el("#place-country").value = (p && p.place && p.place.country) || "";
    el("#place-region").value = (p && p.place && p.place.region) || "";
    el("#place-msg").textContent = "";
    el("#place-modal").classList.remove("hidden");
  }
  function closePlaceModal() { el("#place-modal").classList.add("hidden"); placeTarget = null; }
  el(".place-x").addEventListener("click", closePlaceModal);
  el("#place-modal").addEventListener("click", (e) => { if (e.target.id === "place-modal") closePlaceModal(); });

  async function savePlace(clear) {
    if (!placeTarget) return;
    const country = clear ? "" : el("#place-country").value.trim();
    const region = clear ? "" : el("#place-region").value.trim();
    if (!clear && !country && !region) { el("#place-msg").textContent = "请至少填写国家或地区"; return; }
    el("#place-msg").textContent = "保存中…";
    const photos = window.PHOTOS.map((p) => {
      if (p.file !== placeTarget) return p;
      const np = { ...p };
      if (clear || (!country && !region)) delete np.place;
      else np.place = { country, region };
      return np;
    });
    try {
      await putManifest(photos);
      renderAdminGrid();
      closePlaceModal();
      log(`✓ 地点已更新：${placeTarget}`, "ok");
    } catch (err) {
      el("#place-msg").textContent = "保存失败：" + err.message;
    }
  }
  el("#place-save").addEventListener("click", () => savePlace(false));
  el("#place-clear").addEventListener("click", () => savePlace(true));
})();
