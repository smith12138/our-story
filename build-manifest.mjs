#!/usr/bin/env node
// Scans photos/ and writes photos.json (the gallery manifest).
// Run with: node build-manifest.mjs
// The website's admin panel updates photos.json automatically when you
// add/delete photos in the browser — you only need this script if you ever
// drop files into photos/ manually and want to regenerate the list.

import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PHOTOS_DIR = "photos";
const OUT = "photos.json";
const IMG_RE = /\.(jpe?g|png|webp|gif)$/i;

// Pull a sortable timestamp out of common phone filenames, e.g.
//   IMG20250128173052.jpg      -> 2025-01-28 17:30:52
//   IMG_20250320_131906.jpg    -> 2025-03-20 13:19:06
//   beauty_20260215210638.jpg  -> 2026-02-15 21:06:38
function parseDate(name) {
  const digits = name.replace(/\D/g, "");
  const m = digits.match(/(20\d{2})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
  if (!m) return null;
  const [, y, mo, d, h = "00", mi = "00", s = "00"] = m;
  if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return null;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

if (!existsSync(PHOTOS_DIR)) {
  console.error(`No ${PHOTOS_DIR}/ directory found.`);
  process.exit(1);
}

const files = readdirSync(PHOTOS_DIR).filter((f) => IMG_RE.test(f));

const photos = files
  .map((file) => ({ file, date: parseDate(file) }))
  .sort((a, b) => {
    // Newest first; files without a parsed date sink to the bottom.
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.file.localeCompare(b.file);
  });

writeFileSync(OUT, JSON.stringify({ photos }, null, 2) + "\n");
console.log(`Wrote ${OUT} with ${photos.length} photos.`);
