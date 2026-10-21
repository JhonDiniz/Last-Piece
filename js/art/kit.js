// Art kit: helpers shared by every SVG drawing in the game.
// All art is authored as SVG strings so the same drawing can be used
// inline in the interface and rasterized for the battle canvas.

export const OL = '#2a1a3e';          // outline colour used everywhere
export const SHADOW = '#1d1030';      // colour mixed in for cel shading
export const SKIN = '#ffd2a6';

let uid = 0;
export const nid = (p = 'g') => `${p}${(++uid).toString(36)}`;

export function svg(w, h, body, defs = '', extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ${extra}>` +
    (defs ? `<defs>${defs}</defs>` : '') + body + '</svg>';
}

function hx(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const h2 = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
export function mix(a, b, t) {
  const A = hx(a), B = hx(b);
  return '#' + h2(A[0] + (B[0] - A[0]) * t) + h2(A[1] + (B[1] - A[1]) * t) + h2(A[2] + (B[2] - A[2]) * t);
}
export const dark = (c, t = 0.3) => mix(c, SHADOW, t);
export const light = (c, t = 0.35) => mix(c, '#ffffff', t);

export function lin(id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
    stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('') +
    '</linearGradient>';
}
export function rad(id, stops, cx = 0.5, cy = 0.5, r = 0.5, fx, fy) {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ''}>` +
    stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('') +
    '</radialGradient>';
}

// outlined shape helpers
const st = (sw, extra) => (extra.includes('stroke=') ? '' : ` stroke="${OL}"`) + (extra.includes('stroke-width') ? '' : ` stroke-width="${sw}"`);
export const P = (d, fill, sw = 4, extra = '') =>
  `<path d="${d}" fill="${fill}"${st(sw, extra)} stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
export const Pn = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const E = (cx, cy, rx, ry, fill, sw = 4, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${st(sw, extra)} ${extra}/>`;
export const En = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
export const C = (cx, cy, r, fill, sw = 4, extra = '') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${st(sw, extra)} ${extra}/>`;
export const Cn = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
export const R = (x, y, w, h, rx, fill, sw = 4, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${st(sw, extra)} stroke-linejoin="round" ${extra}/>`;
export const Rn = (x, y, w, h, rx, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
export const L = (d, sw = 4, color = OL, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const G = (inner, tr = '', extra = '') => `<g${tr ? ` transform="${tr}"` : ''} ${extra}>${inner}</g>`;

// small white gloss used on round shapes
export const gloss = (x, y, rx, ry, rot = -30, a = 0.75) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${a}" transform="rotate(${rot} ${x} ${y})"/>`;

// seeded random for procedural scenery
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

// regular polygon / star helpers
export function star(cx, cy, r1, r2, n = 5, rot = -90) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1, a = (rot + i * 180 / n) * Math.PI / 180;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1) + ' ';
  }
  return d + 'Z';
}
export function poly(cx, cy, r, n, rot = -90) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (rot + i * 360 / n) * Math.PI / 180;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1) + ' ';
  }
  return d + 'Z';
}
