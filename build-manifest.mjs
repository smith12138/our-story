#!/usr/bin/env node
// Scans photos/ and writes photos.json (the gallery manifest).
//   - generates any missing thumbnails into thumbs/ (needs ImageMagick `magick`)
//   - records each photo's pixel size (w/h) so the gallery can reserve space
//   - PRESERVES existing display order (manual drag-reorder survives rebuilds);
//     brand-new files are added at the front (newest first)
// Run with: node build-manifest.mjs
// The website's admin panel updates photos.json automatically; you only need
// this if you ever drop files into photos/ by hand.

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const PHOTOS_DIR = "photos";
const THUMBS_DIR = "thumbs";
const OUT = "photos.json";
const PLACES = "places.json";
const IMG_RE = /\.(jpe?g|png|webp|gif)$/i;

const places = existsSync(PLACES) ? JSON.parse(readFileSync(PLACES, "utf8")) : {};

// 上一次清单：保留顺序 + 手动标注的地点
let prev = [];
if (existsSync(OUT)) {
  try { prev = JSON.parse(readFileSync(OUT, "utf8")).photos || []; } catch {}
}
const prevPlace = {};
prev.forEach((p) => { if (p.place) prevPlace[p.file] = p.place; });
const prevOrder = prev.map((p) => p.file);

function parseDate(name) {
  const digits = name.replace(/\D/g, "");
  const m = digits.match(/(20\d{2})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
  if (!m) return null;
  const [, y, mo, d, h = "00", mi = "00", s = "00"] = m;
  if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return null;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function thumbAndSize(file) {
  const src = `${PHOTOS_DIR}/${file}`;
  const dst = `${THUMBS_DIR}/${file}`;
  try {
    if (!existsSync(dst)) {
      execSync(`magick ${JSON.stringify(src)} -auto-orient -resize '640x640>' -quality 80 -strip ${JSON.stringify(dst)}`);
    }
    const out = execSync(`magick identify -format "%w %h" ${JSON.stringify(dst)}`).toString().trim();
    const [w, h] = out.split(" ").map(Number);
    if (w && h) return { w, h };
  } catch {}
  return {};
}

if (!existsSync(PHOTOS_DIR)) {
  console.error(`No ${PHOTOS_DIR}/ directory found.`);
  process.exit(1);
}
if (!existsSync(THUMBS_DIR)) mkdirSync(THUMBS_DIR);

const files = readdirSync(PHOTOS_DIR).filter((f) => IMG_RE.test(f));

// 顺序：已存在的按上次顺序；新文件按日期从新到旧排在最前面
const known = files.filter((f) => prevOrder.includes(f)).sort(
  (a, b) => prevOrder.indexOf(a) - prevOrder.indexOf(b)
);
const fresh = files.filter((f) => !prevOrder.includes(f)).sort((a, b) =>
  (parseDate(b) || "").localeCompare(parseDate(a) || "")
);
const ordered = [...fresh, ...known];

const photos = ordered.map((file) => {
  const p = { file, date: parseDate(file) };
  const loc = places[file] || prevPlace[file];
  if (loc && (loc.region || loc.country)) {
    p.place = { country: loc.country || "", region: loc.region || loc.city || "" };
  }
  const { w, h } = thumbAndSize(file);
  if (w && h) { p.w = w; p.h = h; }
  return p;
});

writeFileSync(OUT, JSON.stringify({ photos }, null, 2) + "\n");
console.log(`Wrote ${OUT} with ${photos.length} photos (thumbnails in ${THUMBS_DIR}/).`);
