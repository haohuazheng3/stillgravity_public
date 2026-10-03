// Generates every raster icon from the logo mark (one source of truth).
// Usage: node scripts/gen-icons.mjs
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (p) => path.join(root, "public", p);

const BG = "#0d1424";
const STRING = "#9aa5b8";
const BOB = "#e9a93b";
const FACET = "#b8761a";

// The mark on a 32-unit grid (same geometry as src/components/Logo.tsx).
const mark = (s = STRING, b = BOB, f = FACET) => `
  <circle cx="16" cy="3" r="1.6" fill="${s}"/>
  <line x1="16" y1="3.8" x2="16" y2="12.6" stroke="${s}" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M13.6 12.4h4.8l3.3 7.1L16 30.2l-5.7-10.7z" fill="${b}"/>
  <path d="M16 12.4h2.4l3.3 7.1L16 30.2z" fill="${f}" opacity=".55"/>`;

// Square tile with the mark scaled into a safe area.
function tile({ size = 512, radius = 0.22, pad = 0.16, bg = BG } = {}) {
  const r = size * radius;
  const inner = size * (1 - pad * 2);
  const scale = inner / 32;
  const off = (size - inner) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/>
  <g transform="translate(${off} ${off}) scale(${scale})">${mark()}</g>
</svg>`;
}

function png(svg, size) {
  return new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
}

// favicon.svg (crisp at any size, used by modern browsers)
fs.writeFileSync(pub("icon.svg"), tile({ size: 64, radius: 0.24, pad: 0.12 }));
// mono mark for print / one-colour uses
fs.writeFileSync(pub("brand/logo-mark.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${mark("#0d1424", "#0d1424", "#0d1424")}</svg>`);
fs.writeFileSync(pub("brand/logo-tile.svg"), tile({ size: 512 }));

// PNGs
const sizes = { "apple-icon.png": [180, { radius: 0, pad: 0.17 }], "icon-192.png": [192, {}], "icon-512.png": [512, {}], "brand/logo-512.png": [512, {}], "brand/logo-1024.png": [1024, {}] };
for (const [file, [size, opts]] of Object.entries(sizes)) {
  fs.writeFileSync(pub(file), png(tile({ size, ...opts }), size));
}
// maskable icon: full-bleed background, mark inside the 80% safe zone
fs.writeFileSync(pub("icon-maskable-512.png"), png(tile({ size: 512, radius: 0, pad: 0.24 }), 512));

// favicon.ico with 16/32/48 PNG entries
const icoSizes = [16, 32, 48];
const images = icoSizes.map((s) => png(tile({ size: 64, radius: 0.24, pad: s <= 16 ? 0.06 : 0.1 }), s));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const dir = [];
images.forEach((buf, i) => {
  const e = Buffer.alloc(16);
  const s = icoSizes[i];
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += buf.length;
  dir.push(e);
});
fs.writeFileSync(pub("favicon.ico"), Buffer.concat([header, ...dir, ...images]));
console.log("icons written");
