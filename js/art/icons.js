// Interface icons (64x64 viewBox). icon(name) returns an SVG string.
import { OL, svg, nid, mix, dark, light, lin, rad, P, E, C, Cn, En, R, Rn, L, G, gloss, star, poly } from './kit.js';

const V = 64;
const I = {
  coin() {
    const g = nid('cg');
    return svg(V, V, C(32, 33, 25, `url(#${g})`, 4.5) + C(32, 33, 17.5, 'none', 0, `stroke="#d98a12" stroke-width="3"`) +
      P('M 23 37 L 23 27 L 28 31 L 32 24 L 36 31 L 41 27 L 41 37 Z', '#ffdf6e', 2.6) + gloss(23, 22, 6, 3.2, -35, 0.9),
      lin(g, [[0, '#ffe680'], [0.6, '#ffc21f'], [1, '#f29a12']]));
  },
  gem() {
    return svg(V, V, P('M 14 24 L 24 12 L 40 12 L 50 24 L 32 54 Z', '#d36cff', 4.5) +
      `<path d="M 14 24 L 50 24 L 32 54 Z" fill="#b04ce8"/><path d="M 24 12 L 28 24 L 36 24 L 40 12 Z" fill="#f0b8ff"/>` +
      `<path d="M 28 24 L 32 54 L 36 24 Z" fill="#c45cf5"/>` + L('M 14 24 L 50 24 M 24 12 L 28 24 L 32 54 L 36 24 L 40 12', 2, OL, 'opacity=".5"') +
      `<path d="M 20 22 L 25 15" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>`);
  },
  sword() {
    return svg(V, V, G(P('M -4 -26 L 4 -26 L 5 10 L -5 10 Z', '#e8eef8', 3.8) + `<path d="M -1 -24 L 1 -24 L 1 8 L -1 8 Z" fill="#fff"/>` +
      P('M -14 10 L 14 10 L 14 16 L -14 16 Z', '#ffcc3a', 3.6) + P('M -4 16 L 4 16 L 4 27 L -4 27 Z', '#c0392b', 3.4) + C(0, 30, 4, '#ffcc3a', 3), 'translate(32 32) rotate(45)'));
  },
  heart() {
    return svg(V, V, P('M 32 54 C 10 40 6 28 10 20 C 14 11 26 10 32 20 C 38 10 50 11 54 20 C 58 28 54 40 32 54 Z', '#ff4d6d', 4.5) +
      `<path d="M 32 50 C 46 40 52 32 52 24 C 50 30 44 38 32 46 Z" fill="#d42a50" opacity=".6"/>` + gloss(21, 21, 6, 3.5, -40, 0.9));
  },
  regen() {
    return svg(V, V, P('M 30 52 C 10 39 6 28 10 20 C 14 11 25 10 30 19 C 35 10 46 11 50 20 C 54 28 50 39 30 52 Z', '#ff4d6d', 4.2) + gloss(20, 21, 5.5, 3.2, -40, 0.9) +
      P('M 42 34 L 48 34 L 48 40 L 54 40 L 54 46 L 48 46 L 48 52 L 42 52 L 42 46 L 36 46 L 36 40 L 42 40 Z', '#4fdc7a', 3.4));
  },
  speed() {
    return svg(V, V, P('M 36 6 L 14 36 L 30 36 L 24 58 L 50 26 L 34 26 L 42 6 Z', '#4cc9f0', 4.2) + `<path d="M 36 9 L 20 33 L 28 33 Z" fill="#c8f2ff"/>`);
  },
  crit() {
    return svg(V, V, C(32, 32, 24, '#ff4d6d', 4.2) + C(32, 32, 16, '#fff', 3) + C(32, 32, 8, '#ff4d6d', 3) +
      L('M 52 12 L 34 30', 6) + L('M 52 12 L 34 30', 3, '#ffcc3a') + P('M 46 10 L 56 8 L 54 18 Z', '#ffcc3a', 2.6));
  },
  burst() {
    return svg(V, V, P(star(32, 32, 27, 13, 8), '#ff8a2a', 4) + P(star(32, 32, 17, 8, 8), '#ffd23f', 0) +
      `<text x="32" y="41" font-family="Lilita One,sans-serif" font-size="24" text-anchor="middle" fill="#fff" stroke="${OL}" stroke-width="4" paint-order="stroke">!</text>`);
  },
  double() {
    const b = (r) => G(P('M -3 -22 L 3 -22 L 4 8 L -4 8 Z', '#e8eef8', 3.4) + P('M -11 8 L 11 8 L 11 13 L -11 13 Z', '#4fd8c8', 3) + P('M -3 13 L 3 13 L 3 22 L -3 22 Z', '#3a6a8a', 3), `translate(32 34) rotate(${r})`);
    return svg(V, V, b(-35) + b(35));
  },
  triple() {
    const b = (r) => G(P('M -3 -22 L 3 -22 L 4 6 L -4 6 Z', '#e8eef8', 3.2) + P('M -10 6 L 10 6 L 10 11 L -10 11 Z', '#b07cff', 2.8) + P('M -3 11 L 3 11 L 3 20 L -3 20 Z', '#5a3a8a', 2.8), `translate(32 36) rotate(${r})`);
    return svg(V, V, b(-45) + b(45) + b(0));
  },
  bossdmg() {
    return svg(V, V, P('M 12 30 Q 12 10 32 10 Q 52 10 52 30 L 50 44 Q 32 52 14 44 Z', '#c3cfdf', 4.2) + Rn(18, 27, 28, 6, 3, OL) +
      P('M 14 22 Q 2 16 4 4 Q 10 14 18 16 Z', '#ff4d6d', 3) + P('M 50 22 Q 62 16 60 4 Q 54 14 46 16 Z', '#ff4d6d', 3) + gloss(24, 17, 6, 3, -25, 0.8));
  },
  gold() {
    return svg(V, V, C(24, 40, 14, '#ffc21f', 3.6) + C(40, 40, 14, '#ffc21f', 3.6) + C(32, 26, 14, '#ffd84a', 3.6) + gloss(27, 21, 4, 2.4, -35, 0.9));
  },
  lock() {
    return svg(V, V, L('M 20 30 L 20 22 Q 20 10 32 10 Q 44 10 44 22 L 44 30', 9) + L('M 20 30 L 20 22 Q 20 10 32 10 Q 44 10 44 22 L 44 30', 4.5, '#c3cfdf') +
      R(12, 28, 40, 28, 7, '#ffcc3a', 4.2) + C(32, 40, 4.5, OL, 0) + Rn(30, 41, 4, 9, 2, OL) + Rn(16, 31, 32, 5, 2.5, '#fff', 'opacity=".4"'));
  },
  menu() {
    return svg(V, V, [18, 32, 46].map(y => L(`M 16 ${y} L 48 ${y}`, 9) + L(`M 16 ${y} L 48 ${y}`, 4.6, '#fff')).join(''));
  },
  turbo() {
    return svg(V, V, P('M 8 14 L 32 32 L 8 50 Z', '#fff', 4) + P('M 30 14 L 56 32 L 30 50 Z', '#fff', 4));
  },
  map() {
    return svg(V, V, P('M 8 14 L 22 8 L 42 14 L 56 8 L 56 50 L 42 56 L 22 50 L 8 56 Z', '#f6e3b0', 4) +
      `<path d="M 22 8 L 22 50 L 8 56 L 8 14 Z" fill="#e8cf8a"/><path d="M 42 14 L 42 56 L 56 50 L 56 8 Z" fill="#e8cf8a"/>` +
      L('M 14 40 Q 24 30 30 36 Q 38 42 46 26', 3, '#e8384f', 'stroke-dasharray="4 4"') + P('M 44 18 L 50 24 M 50 18 L 44 24', '#e8384f', 3.6));
  },
  flag() {
    return svg(V, V, L('M 18 58 L 18 8', 8) + L('M 18 58 L 18 8', 4, '#c98a4a') + P('M 20 10 L 52 16 L 42 26 L 52 36 L 20 32 Z', '#ff4d6d', 4));
  },
  power() {
    return svg(V, V, P('M 32 4 Q 46 20 46 34 Q 50 28 50 22 Q 60 34 56 46 Q 52 58 32 60 Q 12 58 8 46 Q 4 34 14 22 Q 14 30 18 34 Q 18 18 32 4 Z', '#ff7a2a', 4) +
      `<path d="M 32 22 Q 40 32 40 42 Q 42 38 42 36 Q 48 44 44 50 Q 40 56 32 56 Q 22 56 20 48 Q 18 40 24 34 Q 24 40 27 42 Q 26 32 32 22 Z" fill="#ffd23f"/>` +
      G(P('M -2.5 -16 L 2.5 -16 L 3 6 L -3 6 Z', '#fff', 2.6) + P('M -8 6 L 8 6 L 8 10 L -8 10 Z', '#ffcc3a', 2.4) + P('M -2 10 L 2 10 L 2 16 L -2 16 Z', '#c0392b', 2.2), 'translate(32 38) rotate(35)'));
  },
  plus() { return svg(V, V, P('M 26 10 L 38 10 L 38 26 L 54 26 L 54 38 L 38 38 L 38 54 L 26 54 L 26 38 L 10 38 L 10 26 L 26 26 Z', '#fff', 4)); },
  close() { return svg(V, V, P('M 18 10 L 32 24 L 46 10 L 54 18 L 40 32 L 54 46 L 46 54 L 32 40 L 18 54 L 10 46 L 24 32 L 10 18 Z', '#fff', 4)); },
  check() { return svg(V, V, P('M 8 32 L 18 22 L 28 32 L 48 12 L 58 22 L 28 52 Z', '#6fdc4f', 4)); },
  star() { return svg(V, V, P(star(32, 34, 26, 12), '#ffd23f', 4.2) + gloss(26, 24, 5, 3, -35, 0.8)); },
  chest() {
    return svg(V, V, P('M 8 30 L 56 30 L 54 56 L 10 56 Z', '#c97a3a', 4) + P('M 8 30 Q 8 12 32 12 Q 56 12 56 30 Z', '#e0943f', 4) +
      Rn(10, 40, 44, 5, 2, '#a85a2a') + R(26, 24, 12, 14, 3, '#ffcc3a', 3.4) + Cn(32, 31, 2.2, OL) + gloss(20, 20, 6, 3, -20, 0.6));
  },
  gift() {
    return svg(V, V, R(10, 26, 44, 30, 4, '#ff5c93', 4) + R(6, 18, 52, 12, 4, '#ff7aa8', 4) + Rn(28, 18, 8, 38, 0, '#ffd23f') + L('M 28 18 L 28 56 M 36 18 L 36 56', 2.4) +
      P('M 32 18 Q 18 4 14 12 Q 12 18 32 18 Z', '#ffd23f', 3.4) + P('M 32 18 Q 46 4 50 12 Q 52 18 32 18 Z', '#ffd23f', 3.4));
  },
  slime() {
    return svg(V, V, P('M 10 54 C 4 54 4 46 6 40 C 10 24 18 12 32 12 C 46 12 54 24 58 40 C 60 46 60 54 54 54 Z', '#68dd8c', 4.2) +
      En(26, 36, 3.6, 5.2, OL) + En(40, 36, 3.6, 5.2, OL) + Cn(27.2, 33.6, 1.6, '#fff') + Cn(41.2, 33.6, 1.6, '#fff') + L('M 29 44 Q 33 47 37 44', 2.6) + gloss(19, 24, 6, 3.4, -38, 0.85));
  },
  raid() {
    return svg(V, V, P('M 10 58 L 10 26 L 18 26 L 18 32 L 26 32 L 26 26 L 38 26 L 38 32 L 46 32 L 46 26 L 54 26 L 54 58 Z', '#b8c4d6', 4) +
      P('M 26 58 L 26 46 Q 32 38 38 46 L 38 58 Z', '#5a3a2a', 3.4) + L('M 32 26 L 32 6', 5) + L('M 32 26 L 32 6', 2.4, '#c98a4a') + P('M 33 7 L 50 12 L 33 18 Z', '#ff4d6d', 3));
  },
  mine() {
    return svg(V, V, P('M 6 34 L 58 34 L 52 54 L 12 54 Z', '#8a93a6', 4) + C(20, 56, 5, '#3a3f5a', 3) + C(44, 56, 5, '#3a3f5a', 3) +
      P('M 12 34 Q 18 20 26 26 Q 32 16 40 24 Q 48 18 52 34 Z', '#ffcc3a', 3.6) + C(30, 27, 3, '#4cc9f0', 2) + C(42, 29, 2.6, '#ff4d6d', 2));
  },
  boss() {
    return svg(V, V, P('M 10 40 Q 8 14 32 12 Q 56 14 54 40 Q 54 52 44 54 L 44 60 L 20 60 L 20 54 Q 10 52 10 40 Z', '#f4efe6', 4) +
      En(23, 36, 6, 7, OL) + En(41, 36, 6, 7, OL) + P('M 30 46 L 32 42 L 34 46 Z', OL, 2) + L('M 26 54 L 26 60 M 32 54 L 32 60 M 38 54 L 38 60', 2.4) +
      P('M 14 16 L 14 2 L 22 10 L 32 0 L 42 10 L 50 2 L 50 16 Q 32 10 14 16 Z', '#ffcc3a', 3.4));
  },
  rebirth() {
    return svg(V, V, L('M 50 22 A 22 22 0 1 0 54 40', 10) + L('M 50 22 A 22 22 0 1 0 54 40', 5.5, '#b07cff') + P('M 42 10 L 58 14 L 52 30 Z', '#b07cff', 3.6) +
      C(32, 34, 9, '#ffd23f', 3.4) + gloss(29, 31, 3, 2, -30, 0.9));
  },
  shop() {
    return svg(V, V, R(10, 30, 44, 26, 3, '#f4efe6', 4) + R(24, 38, 16, 18, 2, '#8a5a3a', 3) +
      P('M 6 18 L 58 18 L 58 28 Q 52 34 45 28 Q 39 34 32 28 Q 25 34 19 28 Q 12 34 6 28 Z', '#ff4d6d', 4) +
      `<path d="M 19 18 L 19 28 Q 25 34 32 28 L 32 18 Z M 45 18 L 45 28 Q 52 34 58 28 L 58 18 Z" fill="#fff"/>` + L('M 6 18 L 58 18', 4) + R(8, 8, 48, 10, 3, '#ff7aa8', 3.6));
  },
  settings() {
    let d = '';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; d += `<rect x="28" y="4" width="8" height="12" rx="2" transform="rotate(${i * 45} 32 32)"/>`; }
    return svg(V, V, `<g fill="#c3cfdf" stroke="${OL}" stroke-width="7">${d}</g><g fill="#c3cfdf">${d}</g>` + C(32, 32, 18, '#c3cfdf', 4.2) + C(32, 32, 7, '#5a6478', 3.4));
  },
  book() {
    return svg(V, V, P('M 10 12 L 30 16 L 30 56 L 10 52 Z', '#6a4bd0', 4) + P('M 54 12 L 34 16 L 34 56 L 54 52 Z', '#8a6bf0', 4) + L('M 32 16 L 32 56', 4) +
      P(star(20, 33, 6, 2.6), '#ffd23f', 0) + P(star(44, 33, 6, 2.6), '#ffd23f', 0));
  },
  paw() {
    return svg(V, V, E(32, 42, 14, 12, '#ffb38a', 4) + E(16, 28, 6, 8, '#ffb38a', 3.6) + E(26, 18, 6, 8, '#ffb38a', 3.6) + E(38, 18, 6, 8, '#ffb38a', 3.6) + E(48, 28, 6, 8, '#ffb38a', 3.6));
  },
  relic() {
    return svg(V, V, L('M 18 10 Q 32 26 46 10', 7) + L('M 18 10 Q 32 26 46 10', 3.2, '#ffcc3a') + P(poly(32, 40, 18, 6, -90), '#4cc9f0', 4.2) +
      `<path d="${poly(32, 40, 10, 6, -90)}" fill="#bdf3ff"/>` + gloss(27, 34, 4, 2.4, -30, 0.9));
  },
  treasure() {
    return svg(V, V, P('M 12 52 L 22 22 L 42 22 L 52 52 Z', '#ffcc3a', 4) + P('M 22 22 L 32 8 L 42 22 Z', '#ffe680', 4) + C(32, 38, 7, '#ff4d6d', 3) + gloss(26, 30, 4, 2, -30, 0.8));
  },
  key() {
    return svg(V, V, C(20, 22, 13, '#ffcc3a', 4.2) + C(20, 22, 5, '#7a5a1a', 2.6) + P('M 28 30 L 54 56 L 48 60 L 44 56 L 40 58 L 36 54 L 38 50 L 24 36 Z', '#ffcc3a', 4));
  },
  pickaxe() {
    return svg(V, V, L('M 14 54 L 42 22', 9) + L('M 14 54 L 42 22', 4.5, '#c98a4a') + P('M 14 16 Q 38 6 58 30 Q 40 18 18 24 Z', '#c3cfdf', 4));
  },
  essence() {
    return svg(V, V, P('M 32 6 Q 50 26 48 40 Q 46 56 32 58 Q 18 56 16 40 Q 14 26 32 6 Z', '#b07cff', 4.2) +
      `<path d="M 32 22 Q 42 34 40 42 Q 38 50 32 50 Q 26 50 24 42 Q 22 34 32 22 Z" fill="#e8d0ff"/>` + gloss(26, 30, 3, 5, -10, 0.7));
  },
  clock() {
    return svg(V, V, C(32, 34, 24, '#fff', 4.4) + L('M 32 34 L 32 20 M 32 34 L 42 40', 4.2) + Rn(26, 4, 12, 7, 2, OL) + C(32, 34, 3, OL, 0));
  },
  sound() { return svg(V, V, P('M 8 24 L 20 24 L 34 12 L 34 52 L 20 40 L 8 40 Z', '#fff', 4) + L('M 42 22 Q 50 32 42 42 M 48 14 Q 62 32 48 50', 4.4, '#fff')); },
  music() { return svg(V, V, L('M 24 46 L 24 12 L 50 6 L 50 40', 5) + E(18, 46, 8, 6, '#fff', 4) + E(44, 40, 8, 6, '#fff', 4) + L('M 24 18 L 50 12', 5)); },
  info() { return svg(V, V, C(32, 32, 24, '#4cc9f0', 4) + Rn(29, 27, 6, 18, 3, '#fff') + Cn(32, 19, 4, '#fff')); },
  sparkle() { return svg(V, V, P('M 32 4 Q 36 28 60 32 Q 36 36 32 60 Q 28 36 4 32 Q 28 28 32 4 Z', '#fff7b0', 3.4)); },
  skull() {
    return svg(V, V, P('M 12 30 Q 12 8 32 8 Q 52 8 52 30 Q 52 42 44 44 L 44 54 L 20 54 L 20 44 Q 12 42 12 30 Z', '#f4efe6', 4) +
      En(24, 30, 6, 7, OL) + En(40, 30, 6, 7, OL) + P('M 30 40 L 32 36 L 34 40 Z', OL, 2) + L('M 26 48 L 26 54 M 32 48 L 32 54 M 38 48 L 38 54', 2.4));
  },
  ad() { return svg(V, V, R(6, 14, 52, 36, 8, '#fff', 4) + P('M 26 22 L 42 32 L 26 42 Z', OL, 0)); },
  arrowUp() { return svg(V, V, P('M 32 6 L 56 32 L 42 32 L 42 58 L 22 58 L 22 32 L 8 32 Z', '#6fdc4f', 4)); },
  sun() { return svg(V, V, C(32, 32, 14, '#ffd23f', 4) + [0, 45, 90, 135, 180, 225, 270, 315].map(a => G(Rn(-3, -28, 6, 9, 3, '#ffd23f', `stroke="${OL}" stroke-width="2.6"`), `translate(32 32) rotate(${a})`)).join('')); },
  calendar() { return svg(V, V, R(8, 12, 48, 44, 6, '#fff', 4) + Rn(10, 14, 44, 12, 4, '#ff4d6d') + L('M 8 26 L 56 26', 4) + L('M 20 6 L 20 16 M 44 6 L 44 16', 5) + `<text x="32" y="50" font-family="Lilita One,sans-serif" font-size="20" text-anchor="middle" fill="${OL}">7</text>`); },
  user() { return svg(V, V, C(32, 22, 12, '#ffd2a6', 4) + P('M 10 56 Q 12 36 32 36 Q 52 36 54 56 Z', '#4cc9f0', 4)); },
  save() { return svg(V, V, R(8, 8, 48, 48, 6, '#4cc9f0', 4) + R(18, 8, 26, 16, 2, '#fff', 3.4) + R(16, 34, 32, 22, 3, '#e8eef8', 3.4)); },
  trophy() {
    return svg(V, V, P('M 18 8 L 46 8 L 44 30 Q 40 40 32 40 Q 24 40 20 30 Z', '#ffcc3a', 4) + L('M 18 14 Q 6 14 8 24 Q 10 30 20 30 M 46 14 Q 58 14 56 24 Q 54 30 44 30', 4) +
      R(28, 40, 8, 10, 1, '#ffcc3a', 3.4) + R(18, 50, 28, 8, 3, '#a8683a', 3.6) + gloss(26, 16, 3, 6, -10, 0.7));
  },
  ship() {
    return svg(V, V, R(29, 6, 5, 36, 2, '#8a5a3a', 3) + P('M 12 12 Q 31 8 50 12 Q 53 24 49 36 Q 31 33 13 36 Q 9 24 12 12 Z', '#f4efe6', 3.4) +
      C(31, 22, 5, '#2a1a3e', 0) + Cn(31, 21, 3, '#f4efe6') +
      P('M 4 40 L 58 40 Q 56 52 46 56 L 16 56 Q 8 52 4 40 Z', '#c98a4a', 4) + L('M 8 46 L 56 46', 2.4, '#e8b878') +
      L('M 2 60 Q 10 56 18 60 T 34 60 T 50 60 T 62 60', 3, '#3fa8e0'));
  },
  pirate() {
    return svg(V, V, P('M 16 34 Q 16 10 32 10 Q 48 10 48 34 Z', '#f5cf66', 4) + Rn(17, 26, 30, 6, 2, '#d8384a') +
      E(32, 36, 28, 8, '#f2c45a', 4) + L('M 8 36 Q 32 43 56 36', 2, '#c99a33', 'opacity=".7"') + gloss(24, 18, 4, 2.4, -30, 0.8));
  },
};

const cache = new Map();
export function icon(name) {
  let s = cache.get(name);
  if (!s) { s = (I[name] || I.star)(); cache.set(name, s); }
  return s;
}
export const ICON_NAMES = Object.keys(I);
