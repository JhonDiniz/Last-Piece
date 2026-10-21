// Parallax scenery for every region. Each layer is a seamless 780-wide strip.
import { OL, svg, mix, dark, light, rng, star } from './kit.js';

export const STRIP = 780;
export const LAYER_H = { far: 170, mid: 200, near: 80, ground: 240 };
const TAU = Math.PI * 2;

// ---------- helpers ----------
function wave(h, base, comps, seed = 1) {
  const r = rng(seed);
  const ph = comps.map(() => r() * TAU);
  let d = `M 0 ${h} `;
  for (let x = 0; x <= STRIP; x += 6) {
    let y = base;
    comps.forEach(([k, a], i) => { y += a * Math.sin(TAU * k * x / STRIP + ph[i]); });
    d += `L ${x} ${y.toFixed(1)} `;
  }
  return d + `L ${STRIP} ${h} Z`;
}
// draw the same element at x, x-STRIP and x+STRIP so strips tile seamlessly
function wrap(x, w, fn) {
  let s = fn(x);
  if (x - w < 0) s += fn(x + STRIP);
  if (x + w > STRIP) s += fn(x - STRIP);
  return s;
}
// union of shapes with a single outer outline (stroke all, then fill all)
function blob(shapes, fill, sw = 3.5, oc = OL) {
  const stroke = shapes.map(s => s.replace('/>', ` fill="${oc}" stroke="${oc}" stroke-width="${sw * 2}" stroke-linejoin="round"/>`)).join('');
  const fills = shapes.map(s => s.replace('/>', ` fill="${fill}"/>`)).join('');
  return stroke + fills;
}
const c = (x, y, r) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/>`;
const pth = d => `<path d="${d}"/>`;

function roundTree(x, y, s, leaf, trunk, ol, sw) {
  const t = `<path d="M ${x - 7 * s} ${y} L ${x - 5 * s} ${y - 46 * s} L ${x + 5 * s} ${y - 46 * s} L ${x + 7 * s} ${y} Z" fill="${trunk}" stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  const circles = [c(x, y - 70 * s, 30 * s), c(x - 24 * s, y - 52 * s, 22 * s), c(x + 24 * s, y - 54 * s, 22 * s), c(x - 8 * s, y - 96 * s, 22 * s), c(x + 14 * s, y - 88 * s, 20 * s)];
  const hi = light(leaf, 0.22), lo = dark(leaf, 0.22);
  return t + blob(circles, leaf, sw / 2 + 0.6, ol) +
    `<circle cx="${x + 12 * s}" cy="${y - 48 * s}" r="${16 * s}" fill="${lo}" opacity=".5"/>` +
    `<circle cx="${x - 12 * s}" cy="${y - 92 * s}" r="${9 * s}" fill="${hi}" opacity=".9"/>` +
    `<circle cx="${x - 30 * s}" cy="${y - 58 * s}" r="${7 * s}" fill="${hi}" opacity=".8"/>`;
}
function pine(x, y, s, leaf, trunk, ol, sw, snow) {
  let out = `<rect x="${x - 5 * s}" y="${y - 22 * s}" width="${10 * s}" height="${22 * s}" fill="${trunk}" stroke="${ol}" stroke-width="${sw}"/>`;
  const tiers = [[y - 18 * s, 34], [y - 46 * s, 28], [y - 72 * s, 21]];
  const shapes = tiers.map(([ty, w]) => pth(`M ${x - w * s} ${ty} L ${x} ${ty - 44 * s} L ${x + w * s} ${ty} Q ${x} ${ty + 8 * s} ${x - w * s} ${ty} Z`));
  out += blob(shapes, leaf, sw / 2 + 0.6, ol);
  out += tiers.map(([ty, w]) => `<path d="M ${x} ${ty - 40 * s} L ${x + w * s * 0.85} ${ty - 2 * s} Q ${x + w * 0.5 * s} ${ty + 3 * s} ${x + 4 * s} ${ty} Z" fill="${dark(leaf, 0.2)}" opacity=".55"/>`).join('');
  if (snow) out += tiers.map(([ty, w]) => `<path d="M ${x - 12 * s} ${ty - 30 * s} L ${x} ${ty - 44 * s} L ${x + 12 * s} ${ty - 30 * s} Q ${x + 4 * s} ${ty - 26 * s} ${x} ${ty - 30 * s} Q ${x - 5 * s} ${ty - 25 * s} ${x - 12 * s} ${ty - 30 * s} Z" fill="#fff"/>`).join('');
  return out;
}
function bush(x, y, s, col, ol, sw, berries) {
  const shapes = [c(x - 16 * s, y - 12 * s, 14 * s), c(x + 2 * s, y - 20 * s, 18 * s), c(x + 20 * s, y - 11 * s, 13 * s), `<rect x="${x - 28 * s}" y="${y - 12 * s}" width="${58 * s}" height="${12 * s}"/>`];
  let out = blob(shapes, col, sw, ol) + `<circle cx="${x - 4 * s}" cy="${y - 28 * s}" r="${6 * s}" fill="${light(col, 0.3)}" opacity=".8"/>`;
  if (berries) for (let i = 0; i < 3; i++) out += `<circle cx="${x - 10 * s + i * 11 * s}" cy="${y - (12 + (i % 2) * 8) * s}" r="${3.2 * s}" fill="${berries}" stroke="${ol}" stroke-width="1.6"/>`;
  return out;
}
function rock(x, y, s, col, ol, sw) {
  return `<path d="M ${x - 18 * s} ${y} Q ${x - 20 * s} ${y - 14 * s} ${x - 6 * s} ${y - 20 * s} Q ${x + 12 * s} ${y - 24 * s} ${x + 18 * s} ${y - 8 * s} Q ${x + 20 * s} ${y} ${x + 14 * s} ${y} Z" fill="${col}" stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round"/>` +
    `<path d="M ${x - 10 * s} ${y - 14 * s} Q ${x - 2 * s} ${y - 20 * s} ${x + 6 * s} ${y - 18 * s}" stroke="#fff" stroke-width="${2.4 * s}" fill="none" stroke-linecap="round" opacity=".45"/>`;
}
function mushroom(x, y, s, cap, ol) {
  return `<path d="M ${x - 4 * s} ${y} L ${x - 3 * s} ${y - 10 * s} L ${x + 3 * s} ${y - 10 * s} L ${x + 4 * s} ${y} Z" fill="#f4efe6" stroke="${ol}" stroke-width="2.4"/>` +
    `<path d="M ${x - 12 * s} ${y - 9 * s} Q ${x} ${y - 26 * s} ${x + 12 * s} ${y - 9 * s} Z" fill="${cap}" stroke="${ol}" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<circle cx="${x - 4 * s}" cy="${y - 15 * s}" r="${2 * s}" fill="#fff"/><circle cx="${x + 5 * s}" cy="${y - 13 * s}" r="${1.6 * s}" fill="#fff"/>`;
}
function tuft(x, y, s, col) {
  return `<path d="M ${x - 8 * s} ${y} Q ${x - 7 * s} ${y - 10 * s} ${x - 10 * s} ${y - 16 * s} Q ${x - 2 * s} ${y - 10 * s} ${x} ${y - 20 * s} Q ${x + 3 * s} ${y - 10 * s} ${x + 10 * s} ${y - 15 * s} Q ${x + 7 * s} ${y - 8 * s} ${x + 8 * s} ${y} Z" fill="${col}"/>`;
}
function flower(x, y, s, col) {
  return `<path d="M ${x} ${y} L ${x} ${y - 9 * s}" stroke="#4b8f2c" stroke-width="${2 * s}"/>` +
    [0, 72, 144, 216, 288].map(a => `<circle cx="${(x + Math.cos(a * Math.PI / 180) * 3.4 * s).toFixed(1)}" cy="${(y - 11 * s + Math.sin(a * Math.PI / 180) * 3.4 * s).toFixed(1)}" r="${2.6 * s}" fill="${col}"/>`).join('') +
    `<circle cx="${x}" cy="${y - 11 * s}" r="${2 * s}" fill="#fff3a6"/>`;
}
function house(x, y, s, wall, roof, ol, sw, kind = 'house') {
  const w = (kind === 'barn' ? 92 : 74) * s, h = (kind === 'barn' ? 60 : 52) * s;
  let out = '';
  if (kind === 'house') out += `<rect x="${x + w * 0.18}" y="${y - h - 46 * s}" width="${11 * s}" height="${26 * s}" fill="#a86a4a" stroke="${ol}" stroke-width="${sw}"/>`;
  out += `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="${wall}" stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  out += `<rect x="${x + w * 0.12}" y="${y - h}" width="${w * 0.38}" height="${h}" fill="${dark(wall, 0.25)}" opacity=".35"/>`;
  if (kind === 'barn') {
    out += `<path d="M ${x - w / 2 - 8 * s} ${y - h + 2 * s} L ${x - w * 0.3} ${y - h - 30 * s} L ${x + w * 0.3} ${y - h - 30 * s} L ${x + w / 2 + 8 * s} ${y - h + 2 * s} Z" fill="${roof}" stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    out += `<rect x="${x - 18 * s}" y="${y - 38 * s}" width="${36 * s}" height="${38 * s}" fill="${dark(wall, 0.2)}" stroke="${ol}" stroke-width="${sw * 0.8}"/>`;
    out += `<path d="M ${x - 18 * s} ${y - 38 * s} L ${x + 18 * s} ${y} M ${x + 18 * s} ${y - 38 * s} L ${x - 18 * s} ${y}" stroke="#f4efe6" stroke-width="${3.6 * s}"/>`;
    out += `<circle cx="${x}" cy="${y - h - 12 * s}" r="${7 * s}" fill="#f4efe6" stroke="${ol}" stroke-width="${sw * 0.8}"/>`;
  } else {
    out += `<path d="M ${x - w / 2 - 10 * s} ${y - h + 4 * s} L ${x} ${y - h - 40 * s} L ${x + w / 2 + 10 * s} ${y - h + 4 * s} Z" fill="${roof}" stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    out += `<path d="M ${x - w / 2 - 4 * s} ${y - h} L ${x} ${y - h - 32 * s} L ${x + w / 2 + 4 * s} ${y - h}" fill="none" stroke="${light(roof, 0.25)}" stroke-width="${3 * s}" opacity=".7"/>`;
    out += `<rect x="${x - 26 * s}" y="${y - 30 * s}" width="${17 * s}" height="${30 * s}" rx="${3 * s}" fill="#8a5a3a" stroke="${ol}" stroke-width="${sw * 0.8}"/>`;
    out += `<rect x="${x + 4 * s}" y="${y - 38 * s}" width="${18 * s}" height="${16 * s}" fill="#ffe9a8" stroke="${ol}" stroke-width="${sw * 0.8}"/>`;
    out += `<path d="M ${x + 13 * s} ${y - 38 * s} L ${x + 13 * s} ${y - 22 * s} M ${x + 4 * s} ${y - 30 * s} L ${x + 22 * s} ${y - 30 * s}" stroke="${ol}" stroke-width="${2 * s}"/>`;
  }
  return out;
}
function hay(x, y, s, ol) {
  return `<path d="M ${x - 22 * s} ${y} Q ${x - 24 * s} ${y - 30 * s} ${x} ${y - 34 * s} Q ${x + 24 * s} ${y - 30 * s} ${x + 22 * s} ${y} Z" fill="#f2c45a" stroke="${ol}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M ${x - 14 * s} ${y - 6 * s} Q ${x - 12 * s} ${y - 22 * s} ${x - 2 * s} ${y - 26 * s} M ${x + 4 * s} ${y - 4 * s} Q ${x + 6 * s} ${y - 18 * s} ${x + 14 * s} ${y - 22 * s}" stroke="#c99a33" stroke-width="2" fill="none"/>`;
}
function fence(y, ol, wood, seed) {
  let out = '';
  const r = rng(seed);
  out += `<rect x="-4" y="${y - 40}" width="${STRIP + 8}" height="8" fill="${wood}" stroke="${ol}" stroke-width="3"/>`;
  out += `<rect x="-4" y="${y - 22}" width="${STRIP + 8}" height="8" fill="${dark(wood, 0.1)}" stroke="${ol}" stroke-width="3"/>`;
  for (let x = 10; x < STRIP; x += 52) {
    const h = 50 + r() * 6;
    out += `<path d="M ${x - 7} ${y} L ${x - 7} ${y - h + 6} L ${x} ${y - h} L ${x + 7} ${y - h + 6} L ${x + 7} ${y} Z" fill="${wood}" stroke="${ol}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M ${x + 2} ${y - h + 8} L ${x + 2} ${y - 4}" stroke="${dark(wood, 0.25)}" stroke-width="3" opacity=".5"/>`;
  }
  return out;
}
function windmill(x, y, s, ol) {
  let out = `<path d="M ${x - 12 * s} ${y} L ${x - 8 * s} ${y - 54 * s} L ${x + 8 * s} ${y - 54 * s} L ${x + 12 * s} ${y} Z" fill="#e8d8b8" stroke="${ol}" stroke-width="2.4"/>`;
  out += `<path d="M ${x - 11 * s} ${y - 54 * s} L ${x} ${y - 66 * s} L ${x + 11 * s} ${y - 54 * s} Z" fill="#c0563a" stroke="${ol}" stroke-width="2.4"/>`;
  for (let i = 0; i < 4; i++) out += `<rect x="${x - 3 * s}" y="${y - 58 * s - 32 * s}" width="${8 * s}" height="${30 * s}" fill="#f4efe6" stroke="${ol}" stroke-width="2" transform="rotate(${i * 90 + 20} ${x} ${y - 58 * s})"/>`;
  return out + `<circle cx="${x}" cy="${y - 58 * s}" r="${3 * s}" fill="${ol}"/>`;
}

// ---------- biome definitions ----------
// sky: gradient stops top->bottom; ground: [grass, dirt, deep]
export const BIOMES = {
  forest: { sky: ['#62c4ea', '#9fe0f3', '#e6fbff'], sun: '#fffbe0', cloud: '#ffffff', fog: '#d6f5ff',
    far: ['#9fdcc4', '#7fcaa8'], leaf: '#5cc25a', leaf2: '#3fa85a', trunk: '#9a6a4a', ground: ['#7ccf4e', '#cf9a5c', '#8a5a3a'], tuft: '#5fae3c' },
  village: { sky: ['#6cc6e8', '#a8e2f2', '#fff3d6'], sun: '#fff6cc', cloud: '#ffffff', fog: '#fff1d6',
    far: ['#c8e08a', '#a6cf6a'], leaf: '#6fc05a', leaf2: '#4fa84a', trunk: '#9a6a4a', ground: ['#8fcf5a', '#ddb070', '#9a6a3a'], tuft: '#6fae3c' },
  swamp: { sky: ['#3f4a7a', '#6a7aa0', '#b8c8c0'], sun: '#e8ffd8', cloud: '#c8d8e0', fog: '#a8c8b8',
    far: ['#5a7a72', '#4a665e'], leaf: '#5a8a4a', leaf2: '#3f6a4a', trunk: '#5a4a3a', ground: ['#5f8a4a', '#6a6a4a', '#3f3a2a'], tuft: '#3f6a3a' },
  desert: { sky: ['#f2a65a', '#ffd08a', '#fff0c8'], sun: '#fff6d8', cloud: '#fff4e0', fog: '#ffe8c0',
    far: ['#f2c27a', '#e0a860'], leaf: '#6fae4a', leaf2: '#4f8f3a', trunk: '#9a6a3a', ground: ['#f2cc7a', '#e6b060', '#b07a3a'], tuft: '#c8a04a' },
  snow: { sky: ['#7ab8e8', '#b8dcf6', '#f0f8ff'], sun: '#ffffff', cloud: '#ffffff', fog: '#e8f4ff',
    far: ['#d8e8f8', '#b8d0ec'], leaf: '#3f8a6a', leaf2: '#2f6a5a', trunk: '#6a4a3a', ground: ['#f4f8ff', '#d8e4f4', '#a8b8d0'], tuft: '#c8d8ec' },
  castle: { sky: ['#5a6a9a', '#8a9ac0', '#d8dcec'], sun: '#ffffff', cloud: '#e8ecf6', fog: '#c8d0e4',
    far: ['#8a92b0', '#727a98'], leaf: '#5a9a5a', leaf2: '#3f7a4a', trunk: '#6a4a3a', ground: ['#8a9a7a', '#a8a8b8', '#6a6a7a'], tuft: '#5a7a4a' },
  volcano: { sky: ['#3a1a2a', '#8a2a2a', '#f08a4a'], sun: '#ffd08a', cloud: '#6a4a4a', fog: '#c86a4a',
    far: ['#5a2a2a', '#3f1f22'], leaf: '#4a3a3a', leaf2: '#3a2a2a', trunk: '#3a2a2a', ground: ['#4a3a3a', '#3a2a2a', '#22161a'], tuft: '#6a4a3a' },
  sky: { sky: ['#a88ae8', '#e0b8f0', '#fff0f8'], sun: '#fffbe8', cloud: '#ffffff', fog: '#fff0fa',
    far: ['#f0d8f8', '#dcc0f0'], leaf: '#ffb8d8', leaf2: '#f090c0', trunk: '#d8c0a8', ground: ['#ffffff', '#f0e8ff', '#c8b8e8'], tuft: '#e8dcff' },
};

function far(b, k) {
  const H = LAYER_H.far, R = rng(k.length * 31 + 7);
  let s = `<path d="${wave(H, 70, [[2, 18], [5, 8], [9, 4]], 3)}" fill="${b.far[0]}"/>`;
  if (k === 'forest' || k === 'village') {
    for (let i = 0; i < 14; i++) {
      const x = R() * STRIP, y = 96 + R() * 30, sz = 0.35 + R() * 0.2;
      s += wrap(x, 20, xx => `<rect x="${xx - 2}" y="${y - 10}" width="4" height="12" fill="${dark(b.far[1], 0.2)}"/><circle cx="${xx}" cy="${y - 16 * sz * 2}" r="${12 * sz * 2}" fill="${dark(b.far[0], 0.12)}"/>`);
    }
  }
  if (k === 'village') s += windmill(220, 112, 1.1, mix(OL, b.far[1], 0.5)) + windmill(600, 104, 0.8, mix(OL, b.far[1], 0.5));
  if (k === 'desert') s += `<path d="M 460 120 L 520 40 L 580 120 Z" fill="${dark(b.far[0], 0.12)}"/><path d="M 520 40 L 580 120 L 548 120 Z" fill="${dark(b.far[0], 0.25)}"/><path d="M 600 120 L 640 70 L 680 120 Z" fill="${dark(b.far[0], 0.15)}"/>`;
  if (k === 'snow' || k === 'castle' || k === 'volcano') {
    const peaks = k === 'volcano' ? [[390, 10, 150]] : [[120, 20, 120], [330, 0, 140], [560, 26, 110], [720, 14, 120]];
    for (const [x, top, w] of peaks) s += wrap(x, w, xx => `<path d="M ${xx - w} 150 L ${xx} ${top} L ${xx + w} 150 Z" fill="${b.far[1]}"/>` +
      (k === 'volcano' ? `<path d="M ${xx - 24} ${top + 16} L ${xx} ${top} L ${xx + 24} ${top + 16} L ${xx + 10} ${top + 40} L ${xx - 6} ${top + 26} Z" fill="#ff7a2a"/><path d="M ${xx - 6} ${top + 26} L ${xx + 10} ${top + 40} L ${xx + 4} 150 L ${xx - 10} 150 Z" fill="#ff5a2a" opacity=".8"/>`
        : `<path d="M ${xx - w * 0.3} ${top + 40} L ${xx} ${top} L ${xx + w * 0.3} ${top + 40} L ${xx + 10} ${top + 30} L ${xx - 6} ${top + 44} Z" fill="#fff"/>`));
  }
  if (k === 'castle') {
    for (const x of [200, 520]) s += `<rect x="${x - 60}" y="70" width="120" height="100" fill="${dark(b.far[1], 0.1)}"/>` +
      [x - 60, x - 20, x + 20, x + 60].map(tx => `<rect x="${tx - 14}" y="40" width="28" height="60" fill="${dark(b.far[1], 0.15)}"/><path d="M ${tx - 18} 42 L ${tx} 14 L ${tx + 18} 42 Z" fill="${dark(b.far[1], 0.3)}"/>`).join('');
  }
  if (k === 'sky') for (let i = 0; i < 5; i++) {
    const x = 80 + i * 160, y = 60 + (i % 2) * 30;
    s += `<path d="M ${x - 50} ${y} Q ${x} ${y - 20} ${x + 50} ${y} L ${x + 20} ${y + 40} L ${x} ${y + 64} L ${x - 20} ${y + 40} Z" fill="${b.far[1]}"/><ellipse cx="${x}" cy="${y}" rx="52" ry="10" fill="#fff" opacity=".7"/>`;
  }
  s += `<path d="${wave(H, 118, [[3, 10], [7, 5], [13, 2]], 9)}" fill="${b.far[1]}"/>`;
  s += `<rect x="0" y="0" width="${STRIP}" height="${H}" fill="${b.fog}" opacity=".18"/>`;
  return svg(STRIP, H, s);
}

function mid(b, k) {
  const H = LAYER_H.mid, y = H - 4, R = rng(k.length * 97 + 3);
  const ol = mix(OL, b.leaf2, 0.35), sw = 3;
  let s = '';
  if (k === 'forest' || k === 'castle') {
    const items = [];
    for (let i = 0; i < 9; i++) items.push([i * 88 + R() * 40, R()]);
    for (const [x, t] of items) s += wrap(x, 80, xx => t < 0.45 ? pine(xx, y, 0.9 + t * 0.6, b.leaf2, b.trunk, ol, sw) : roundTree(xx, y, 0.85 + t * 0.4, b.leaf, b.trunk, ol, sw));
  } else if (k === 'village') {
    s += wrap(90, 80, xx => roundTree(xx, y, 1.05, b.leaf, b.trunk, ol, sw));
    s += wrap(250, 60, xx => house(xx, y, 1, '#f0dcb4', '#d8584a', ol, sw));
    s += wrap(420, 70, xx => house(xx, y, 1.05, '#c9563a', '#8a3a2a', ol, sw, 'barn'));
    s += wrap(560, 50, xx => hay(xx, y, 1.2, ol) + hay(xx + 40, y, 0.9, ol));
    s += wrap(680, 60, xx => house(xx, y, 0.95, '#e8c89a', '#7a5a3a', ol, sw));
  } else if (k === 'swamp') {
    for (let i = 0; i < 7; i++) {
      const x = i * 112 + R() * 30;
      s += wrap(x, 60, xx => `<path d="M ${xx - 10} ${y} Q ${xx - 6} ${y - 60} ${xx - 30} ${y - 110} M ${xx - 6} ${y - 70} Q ${xx + 20} ${y - 100} ${xx + 34} ${y - 96}" stroke="${ol}" stroke-width="13" fill="none" stroke-linecap="round"/>` +
        `<path d="M ${xx - 10} ${y} Q ${xx - 6} ${y - 60} ${xx - 30} ${y - 110} M ${xx - 6} ${y - 70} Q ${xx + 20} ${y - 100} ${xx + 34} ${y - 96}" stroke="${b.trunk}" stroke-width="7" fill="none" stroke-linecap="round"/>` +
        blob([c(xx - 30, y - 118, 20), c(xx - 12, y - 126, 16), c(xx + 34, y - 102, 16)], b.leaf, 1.8, ol) + mushroom(xx + 26, y, 1.3, '#c86ad8', ol));
    }
  } else if (k === 'desert') {
    for (let i = 0; i < 6; i++) {
      const x = i * 130 + R() * 40, t = R();
      s += wrap(x, 60, xx => t < 0.5
        ? `<path d="M ${xx - 9} ${y} L ${xx - 9} ${y - 70} Q ${xx} ${y - 84} ${xx + 9} ${y - 70} L ${xx + 9} ${y} Z M ${xx - 9} ${y - 36} L ${xx - 24} ${y - 36} Q ${xx - 30} ${y - 36} ${xx - 30} ${y - 44} L ${xx - 30} ${y - 58} Q ${xx - 24} ${y - 64} ${xx - 18} ${y - 58} L ${xx - 18} ${y - 46} L ${xx - 9} ${y - 46} Z" fill="${b.leaf}" stroke="${ol}" stroke-width="3" stroke-linejoin="round"/>`
        : `<rect x="${xx - 14}" y="${y - 96}" width="28" height="96" fill="#e8c88a" stroke="${ol}" stroke-width="3"/><rect x="${xx - 20}" y="${y - 104}" width="40" height="12" fill="#f2d8a0" stroke="${ol}" stroke-width="3"/><path d="M ${xx - 6} ${y - 90} L ${xx - 6} ${y - 6}" stroke="#c8a060" stroke-width="3"/>`);
    }
  } else if (k === 'snow') {
    for (let i = 0; i < 9; i++) { const x = i * 88 + R() * 40, t = R(); s += wrap(x, 60, xx => pine(xx, y, 0.9 + t * 0.6, b.leaf, b.trunk, ol, sw, true)); }
  } else if (k === 'volcano') {
    for (let i = 0; i < 7; i++) {
      const x = i * 112 + R() * 40, h = 60 + R() * 70;
      s += wrap(x, 50, xx => `<path d="M ${xx - 40} ${y} L ${xx - 20} ${y - h} L ${xx + 4} ${y - h - 14} L ${xx + 30} ${y - h + 20} L ${xx + 44} ${y} Z" fill="#4a3236" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M ${xx - 6} ${y - h + 6} L ${xx + 2} ${y - h / 2} L ${xx - 8} ${y}" stroke="#ff7a2a" stroke-width="4" fill="none"/>`);
    }
  } else if (k === 'sky') {
    for (let i = 0; i < 6; i++) {
      const x = i * 130 + 40;
      s += wrap(x, 40, xx => `<rect x="${xx - 14}" y="${y - 120}" width="28" height="120" fill="#fbf6ff" stroke="${ol}" stroke-width="3"/>` +
        `<rect x="${xx - 20}" y="${y - 128}" width="40" height="12" rx="3" fill="#fff" stroke="${ol}" stroke-width="3"/>` +
        `<path d="M ${xx - 6} ${y - 114} L ${xx - 6} ${y - 6} M ${xx + 6} ${y - 114} L ${xx + 6} ${y - 6}" stroke="#e8dcf6" stroke-width="3"/>` +
        blob([c(xx + 40, y - 20, 22), c(xx + 62, y - 26, 18), c(xx + 20, y - 14, 16)], '#ffffff', 1.6, ol));
    }
  }
  return svg(STRIP, H, s);
}

function near(b, k) {
  const H = LAYER_H.near, y = H - 2, R = rng(k.length * 13 + 11);
  const ol = OL;
  let s = '';
  if (k === 'village') return svg(STRIP, H, fence(y, ol, '#c98a4a', 5));
  if (k === 'castle') {
    for (let x = 0; x < STRIP; x += 60) s += `<rect x="${x}" y="${y - 34}" width="58" height="34" fill="#9a9aae" stroke="${ol}" stroke-width="3"/><rect x="${x + 4}" y="${y - 30}" width="24" height="12" fill="#b0b0c4"/>`;
    return svg(STRIP, H, s);
  }
  for (let i = 0; i < 10; i++) {
    const x = i * 78 + R() * 30, t = R();
    const berry = k === 'forest' ? '#e8384f' : k === 'sky' ? '#ffcc3a' : null;
    if (k === 'desert' || k === 'volcano') s += wrap(x, 30, xx => rock(xx, y, 0.9 + t * 0.6, k === 'volcano' ? '#3a2a2e' : '#d8a868', ol, 3));
    else if (k === 'snow') s += wrap(x, 30, xx => `<path d="M ${xx - 14} ${y} L ${xx - 6} ${y - 30 - t * 20} L ${xx + 2} ${y - 10} L ${xx + 8} ${y - 24 - t * 10} L ${xx + 14} ${y} Z" fill="#bdf3ff" stroke="${ol}" stroke-width="3" stroke-linejoin="round"/>`);
    else s += wrap(x, 40, xx => t < 0.6 ? bush(xx, y, 0.8 + t * 0.5, b.leaf2, ol, 1.6, berry) : rock(xx, y, 0.8, '#a8a8b8', ol, 3) + mushroom(xx + 22, y, 1, '#e8384f', ol));
  }
  return svg(STRIP, H, s);
}

function ground(b, k) {
  const H = LAYER_H.ground, R = rng(k.length * 5 + 1);
  const [g, dirt, deep] = b.ground;
  let s = `<rect x="0" y="0" width="${STRIP}" height="${H}" fill="${dirt}"/>`;
  s += `<rect x="0" y="120" width="${STRIP}" height="${H - 120}" fill="${dark(dirt, 0.12)}"/>`;
  s += `<rect x="0" y="170" width="${STRIP}" height="${H - 170}" fill="${deep}"/>`;
  for (let i = 0; i < 26; i++) {
    const x = R() * STRIP, y = 40 + R() * 70, r = 2 + R() * 4;
    s += wrap(x, 10, xx => `<ellipse cx="${xx}" cy="${y}" rx="${r * 1.6}" ry="${r}" fill="${dark(dirt, 0.2)}" opacity=".55"/>`);
  }
  for (let i = 0; i < 14; i++) {
    const x = R() * STRIP, y = 50 + R() * 60;
    s += wrap(x, 10, xx => `<ellipse cx="${xx}" cy="${y}" rx="5" ry="3.5" fill="${light(dirt, 0.25)}" stroke="${mix(OL, dirt, 0.4)}" stroke-width="1.6"/>`);
  }
  if (k === 'village') s += `<path d="M 0 66 L ${STRIP} 66 M 0 92 L ${STRIP} 92" stroke="${dark(dirt, 0.18)}" stroke-width="5" opacity=".5"/>`;
  if (k === 'volcano') for (let i = 0; i < 8; i++) { const x = R() * STRIP; s += wrap(x, 30, xx => `<path d="M ${xx} 40 L ${xx + 10} 60 L ${xx + 2} 80 L ${xx + 16} 104" stroke="#ff7a2a" stroke-width="3" fill="none"/>`); }
  // grass / top edge
  const edge = wave(30, 14, [[26, 3], [52, 2]], 4).replace(`M 0 30`, 'M 0 0').replace(`L ${STRIP} 30 Z`, `L ${STRIP} 0 Z`);
  s += `<path d="${wave(26, 16, [[26, 3], [52, 2]], 4)}" fill="${g}" transform="scale(1,-1) translate(0,-26)"/>`;
  s += `<rect x="0" y="0" width="${STRIP}" height="12" fill="${g}"/>`;
  s += `<path d="M 0 2 L ${STRIP} 2" stroke="${light(g, 0.3)}" stroke-width="3" opacity=".6"/>`;
  for (let i = 0; i < 18; i++) {
    const x = R() * STRIP;
    s += wrap(x, 12, xx => tuft(xx, 18 + R() * 6, 0.9, b.tuft));
  }
  if (k === 'forest' || k === 'village' || k === 'sky') for (let i = 0; i < 8; i++) {
    const x = R() * STRIP, col = ['#ff7aa8', '#ffd23f', '#ffffff', '#8be0ff'][i % 4];
    s += wrap(x, 8, xx => flower(xx, 20, 1, col));
  }
  void edge;
  return svg(STRIP, H, s);
}

export function cloudSVG(i, col = '#ffffff') {
  const shapes = [
    [c(40, 40, 22), c(64, 30, 26), c(92, 40, 20), `<rect x="24" y="40" width="86" height="20" rx="10"/>`],
    [c(36, 42, 18), c(58, 32, 22), c(80, 38, 18), c(98, 46, 14), `<rect x="22" y="44" width="90" height="16" rx="8"/>`],
    [c(40, 36, 20), c(64, 40, 18), `<rect x="24" y="40" width="56" height="16" rx="8"/>`],
  ][i % 3];
  return svg(130, 70, blob(shapes, col, 2, mix(col, '#7a8ab8', 0.45)) + `<ellipse cx="54" cy="30" rx="14" ry="6" fill="#fff" opacity=".8"/>`);
}

export function biomeLayers(k) {
  const b = BIOMES[k] || BIOMES.forest;
  return { b, far: far(b, k), mid: mid(b, k), near: near(b, k), ground: ground(b, k) };
}
