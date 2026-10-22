// Item art: skill icons, equipment, relics and treasures (64x64 viewBox).
import { OL, svg, nid, mix, dark, light, lin, rad, P, E, C, Cn, En, R, Rn, L, G, gloss, star, poly } from './kit.js';
import { GRADE_COL } from '../data/balance.js';
import { FRUIT_COL } from '../data/gear.js';

const V = 64;
function tile(col, inner) {
  const g = nid('ti');
  return svg(V, V, `<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#${g})"/>` + inner,
    rad(g, [[0, light(col, 0.35)], [0.7, col], [1, dark(col, 0.35)]], 0.4, 0.35, 0.75));
}

// ------------------------------------------------------------------ skills
const SYM = {
  drop: () => P('M 32 8 Q 46 28 46 38 Q 46 54 32 54 Q 18 54 18 38 Q 18 28 32 8 Z', '#7ef09a', 4) + gloss(26, 34, 4, 7, -10, 0.85) +
    L('M 10 16 L 14 24 M 52 14 L 49 22', 3, '#fff', 'opacity=".8"'),
  blobs: () => C(20, 40, 9, '#c8f05a', 3.4) + C(36, 30, 8, '#c8f05a', 3.4) + C(48, 18, 7, '#c8f05a', 3.4) + L('M 6 48 L 12 44 M 22 36 L 28 32', 3, '#fff', 'opacity=".7"') + gloss(17, 37, 3, 2, -30, 0.9),
  bounce: () => L('M 8 46 Q 20 6 32 30 Q 42 8 56 40', 4, '#fff', 'stroke-dasharray="4 5"') +
    P('M 34 54 C 30 54 30 50 31 47 C 33 40 38 36 44 36 C 50 36 55 40 57 47 C 58 50 58 54 54 54 Z', '#5cc8ff', 3.4) + Cn(41, 46, 1.8, OL) + Cn(48, 46, 1.8, OL),
  bolt: () => P('M 36 4 L 16 34 L 30 34 L 24 60 L 48 26 L 34 26 L 42 4 Z', '#ffd23f', 4) + `<path d="M 36 7 L 21 31 L 28 31 Z" fill="#fff6c0"/>`,
  bubbles: () => C(22, 38, 12, 'rgba(255,255,255,.35)', 3.4) + C(42, 24, 9, 'rgba(255,255,255,.35)', 3.4) + C(44, 46, 6, 'rgba(255,255,255,.35)', 3) + C(18, 16, 5, 'rgba(255,255,255,.35)', 2.6) +
    gloss(18, 33, 4, 2.4, -35, 0.95) + gloss(39, 20, 3, 2, -35, 0.95),
  shield: () => P('M 32 6 L 54 14 Q 54 40 32 58 Q 10 40 10 14 Z', '#7be0d0', 4) + `<path d="M 32 12 L 48 18 Q 48 38 32 51 Z" fill="#4fbfaf"/>` + gloss(22, 22, 5, 3, -35, 0.9),
  wave: () => P('M 4 50 Q 10 22 34 18 Q 56 16 58 34 Q 48 26 40 32 Q 50 34 50 44 Q 36 38 28 50 Z', '#8be0ff', 4) + `<path d="M 4 50 L 60 50 L 60 58 L 4 58 Z" fill="#3fa9ff" stroke="${OL}" stroke-width="3.4"/>` + L('M 14 40 Q 22 26 36 24', 3, '#fff', 'opacity=".8"'),
  bolt2: () => L('M 8 14 L 22 26 L 16 34 L 34 40 L 28 48 L 56 56', 8) + L('M 8 14 L 22 26 L 16 34 L 34 40 L 28 48 L 56 56', 4, '#fff6a0') + C(8, 14, 4, '#ffe14a', 2.6) + C(34, 40, 4, '#ffe14a', 2.6) + C(56, 56, 4, '#ffe14a', 2.6),
  ice: () => P('M 8 56 L 18 22 L 26 56 Z', '#bdf3ff', 3.4) + P('M 22 56 L 34 8 L 46 56 Z', '#dff8ff', 3.6) + P('M 40 56 L 50 28 L 58 56 Z', '#bdf3ff', 3.4) + L('M 34 16 L 34 40', 2.4, '#fff'),
  eye: () => P('M 4 32 Q 32 6 60 32 Q 32 58 4 32 Z', '#fff', 4) + C(32, 32, 12, '#ff4d6d', 3.4) + Cn(32, 32, 5.5, OL) + Cn(29, 29, 2.4, '#fff') + L('M 32 2 L 32 12 M 32 52 L 32 62', 3.6, '#fff'),
  meteor: () => L('M 56 6 L 30 32', 14, '#ffd23f', 'opacity=".55"') + L('M 52 4 L 34 22 M 60 12 L 42 30', 4, '#fff', 'opacity=".7"') + C(24, 40, 15, '#ff7a2a', 4) + Cn(20, 36, 5, '#ffd23f') + Cn(30, 46, 3, '#c0392b'),
  tornado: () => P('M 6 10 Q 32 2 58 10 Q 54 18 46 20 Q 50 26 40 30 Q 42 38 34 40 Q 34 48 30 58 Q 26 48 28 40 Q 20 36 24 30 Q 14 26 18 20 Q 8 18 6 10 Z', '#c8f0e0', 3.6) +
    L('M 14 14 Q 32 10 50 14 M 22 24 Q 34 22 44 24 M 28 34 Q 34 33 38 34', 2.4, '#7aaa98'),
  twins: () => P('M 6 54 C 2 54 2 48 4 44 C 8 34 14 28 22 28 C 30 28 36 34 40 44 C 42 48 42 54 38 54 Z', '#d07bff', 3.4) +
    P('M 26 56 C 22 56 22 50 24 46 C 28 36 34 30 42 30 C 50 30 56 36 60 46 C 62 50 62 56 58 56 Z', '#e8a8ff', 3.4) + Cn(16, 42, 2, OL) + Cn(25, 42, 2, OL) + Cn(39, 44, 2, OL) + Cn(48, 44, 2, OL),
  fire: () => P('M 32 4 Q 48 20 46 34 Q 52 30 52 24 Q 60 36 56 46 Q 50 60 32 60 Q 14 60 8 46 Q 4 36 12 24 Q 12 30 18 34 Q 16 18 32 4 Z', '#ff5a2a', 4) +
    `<path d="M 32 22 Q 42 32 40 42 Q 44 40 44 36 Q 48 44 44 50 Q 40 56 32 56 Q 22 56 20 48 Q 18 40 24 34 Q 24 40 27 42 Q 26 32 32 22 Z" fill="#ffd23f"/>`,
  hammer: () => G(R(-20, -24, 40, 22, 5, '#ffcc3a', 4) + Rn(-17, -21, 34, 6, 3, '#fff3a6') + R(-4, -2, 8, 28, 3, '#a8683a', 3.6), 'translate(32 32) rotate(-30)'),
  vortex: () => L('M 32 32 m -2 0 a 4 4 0 1 1 6 3 a 9 9 0 1 1 -14 -6 a 15 15 0 1 1 22 12 a 22 22 0 1 1 -32 -14', 7) +
    L('M 32 32 m -2 0 a 4 4 0 1 1 6 3 a 9 9 0 1 1 -14 -6 a 15 15 0 1 1 22 12 a 22 22 0 1 1 -32 -14', 3.4, '#e0b0ff'),
  star: () => L('M 58 4 L 40 22 M 50 2 L 36 16 M 62 14 L 46 28', 4, '#fff', 'opacity=".7"') + P(star(26, 38, 20, 9), '#ffe680', 4) + gloss(20, 30, 4, 2.5, -35, 0.9),
  nova: () => P(star(32, 32, 30, 12, 12), '#ffd0d8', 3.6) + C(32, 32, 13, '#fff', 3.4) + Cn(32, 32, 7, '#ff8a9a'),
  crown: () => P('M 8 48 L 8 18 L 20 30 L 32 10 L 44 30 L 56 18 L 56 48 Z', '#ffcc3a', 4) + Rn(10, 38, 44, 6, 2, '#e89a22') + C(32, 30, 4.5, '#ff4d6d', 2.6) + C(18, 41, 3, '#4cc9f0', 2) + C(46, 41, 3, '#4cc9f0', 2) + gloss(18, 24, 4, 2, -35, 0.8),
  genesis: () => [0, 30, 60, 90, 120, 150].map(a => G(Rn(-2.5, -30, 5, 60, 2.5, '#fffbe0'), `translate(32 32) rotate(${a})`)).join('') + C(32, 32, 15, '#fff3a6', 4) + C(32, 32, 7, '#ffcc3a', 3) + Cn(30, 30, 2.4, '#fff'),
};
const skillCache = new Map();
export function skillIcon(s) {
  let v = skillCache.get(s.id);
  if (!v) { v = tile(s.col, (SYM[s.sym] || SYM.star)()); skillCache.set(s.id, v); }
  return v;
}

// ------------------------------------------------------------------ equipment
const W_COL = ['#c9cfdc', '#7ed957', '#3fa9ff', '#c55cff', '#ffa22e', '#33e0c0', '#ff4f6a', '#ffd23f'];
function blade(len, col, tipCol) {
  return P(`M -5 ${-len} L 5 ${-len} L 6 10 L -6 10 Z`, col, 3.6) + `<path d="M -1.5 ${-len + 3} L 1.5 ${-len + 3} L 1.5 7 L -1.5 7 Z" fill="#fff" opacity=".7"/>` +
    (tipCol ? `<path d="M -5 ${-len} L 0 ${-len - 8} L 5 ${-len} Z" fill="${tipCol}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/>` : '');
}
const WEAPON = {
  stick: g => G(L('M 0 -26 L 0 26', 9) + L('M 0 -26 L 0 26', 5, '#a8683a') + L('M 0 -6 L 10 -16', 6) + L('M 0 -6 L 10 -16', 3, '#a8683a') + E(12, -18, 4, 3, '#7ed957', 2.4), 'translate(32 32) rotate(30)'),
  spoon: g => G(L('M 0 -6 L 0 28', 9) + L('M 0 -6 L 0 28', 5, '#c98a4a') + E(0, -16, 11, 15, '#e0a868', 4) + E(0, -16, 6, 9, '#c98a4a', 0), 'translate(32 32) rotate(35)'),
  dagger: g => G(blade(20, '#e0c08a') + P('M -12 10 L 12 10 L 12 15 L -12 15 Z', W_COL[g], 3) + R(-3, 15, 6, 12, 2, '#6a4426', 3), 'translate(32 30) rotate(40)'),
  club: g => G(P('M -6 26 L -4 -6 Q -14 -20 -6 -28 Q 4 -34 10 -24 Q 14 -14 4 -6 L 6 26 Z', '#a8683a', 4) + C(-2, -20, 2.6, '#d3dbe8', 2) + C(6, -14, 2.6, '#d3dbe8', 2) + C(-6, -10, 2.6, '#d3dbe8', 2), 'translate(32 32) rotate(30)'),
  sword: g => G(blade(26, '#e8eef8') + P('M -15 10 L 15 10 L 15 16 L -15 16 Z', W_COL[g], 3.4) + R(-3.5, 16, 7, 12, 2, '#3a6aa8', 3) + C(0, 30, 3.6, W_COL[g], 2.6), 'translate(32 30) rotate(40)'),
  axe: g => G(L('M 0 -26 L 0 28', 9) + L('M 0 -26 L 0 28', 5, '#a8683a') + P('M 2 -24 Q 26 -26 24 -4 Q 14 -10 2 -6 Z', '#d3dbe8', 3.6) + L('M 22 -20 Q 22 -12 20 -8', 2, '#fff'), 'translate(30 32) rotate(25)'),
  trident: g => G(L('M 0 -14 L 0 28', 9) + L('M 0 -14 L 0 28', 5, '#3fa9ff') + P('M -14 -14 L 14 -14 L 14 -8 L -14 -8 Z', '#ffcc3a', 3) + P('M -14 -14 L -14 -26 L -10 -18 Z', '#ffcc3a', 3) + P('M 14 -14 L 14 -26 L 10 -18 Z', '#ffcc3a', 3) + P('M -3 -14 L 0 -30 L 3 -14 Z', '#ffcc3a', 3), 'translate(32 32) rotate(30)'),
  katana: g => G(P('M -3 -28 Q 6 -10 4 12 L -4 12 Q -2 -10 -3 -28 Z', '#e8eef8', 3.4) + E(0, 14, 9, 3.6, '#2f2a3d', 3) + R(-3.5, 16, 7, 14, 2, '#3a7ae8', 3), 'translate(32 30) rotate(40)'),
  hammer: g => G(R(-16, -26, 32, 18, 4, '#8a93a6', 3.8) + Rn(-13, -23, 26, 5, 2, '#fff', 'opacity=".35"') + L('M 0 -8 L 0 28', 9) + L('M 0 -8 L 0 28', 5, '#a8683a') + L('M -10 -17 L 4 -26 L -2 -14 L 10 -20', 3, '#ffe14a'), 'translate(32 32) rotate(30)'),
  bow: g => G(L('M 0 -28 Q -22 0 0 28', 9) + L('M 0 -28 Q -22 0 0 28', 5, '#ffcc3a') + L('M 0 -26 L 0 26', 2, '#fff') + L('M 0 0 L 22 0', 4) + L('M 0 0 L 22 0', 2, '#fff') + P('M 22 0 L 16 -4 L 16 4 Z', '#ff8a2a', 2.4), 'translate(34 32) rotate(-10)'),
  scythe: g => G(L('M 0 -26 L 0 28', 9) + L('M 0 -26 L 0 28', 5, '#5a4a6a') + P('M 0 -26 Q 24 -32 30 -10 Q 18 -20 0 -18 Z', '#c8e8ff', 3.6), 'translate(26 32) rotate(15)'),
  scepter: g => G(L('M 0 -12 L 0 28', 9) + L('M 0 -12 L 0 28', 5, '#ffcc3a') + P(poly(0, -20, 11, 6), '#33e0c0', 3.6) + gloss(-3, -23, 3, 2, -30, 0.9) + C(0, 28, 4, '#ffcc3a', 2.6), 'translate(32 32) rotate(25)'),
  chaosblade: g => G(P('M -6 -28 L 8 -18 L 2 -6 L 8 10 L -6 10 L -2 -6 Z', '#ff4f6a', 3.6) + P('M -14 10 L 14 10 L 14 16 L -14 16 Z', '#2f2a3d', 3) + R(-3.5, 16, 7, 12, 2, '#2f2a3d', 3), 'translate(32 30) rotate(40)'),
  starspear: g => G(L('M 0 -10 L 0 30', 9) + L('M 0 -10 L 0 30', 5, '#5a8ae8') + P(star(0, -18, 14, 6), '#ffe680', 3.4), 'translate(32 32) rotate(30)'),
  greatsword: g => G(blade(30, '#fff6d8', '#ffd23f') + P('M -18 10 L 18 10 L 16 18 L -16 18 Z', '#ffd23f', 3.4) + C(0, 14, 3.4, '#4cc9f0', 2) + R(-3.5, 18, 7, 10, 2, '#a8683a', 3), 'translate(32 30) rotate(40)'),
  staff: g => G(L('M 0 -10 L 0 30', 9) + L('M 0 -10 L 0 30', 5, '#c98a4a') + C(0, -20, 11, '#fff3a6', 3.6) + `<circle cx="0" cy="-20" r="17" fill="#fff3a6" opacity=".3"/>` + L('M -12 -8 Q 0 -2 12 -8', 3, '#7ed957'), 'translate(32 32) rotate(20)'),
};
// hats
const HAT = {
  bandana: (g, c) => P('M 10 40 Q 8 14 32 12 Q 56 12 56 36 Q 32 28 10 40 Z', c, 4) + P('M 12 34 L 2 40 L 6 30 Z', c, 3) + P('M 12 36 L 4 48 L 12 44 Z', c, 3) + Cn(24, 22, 2.4, '#fff') + Cn(36, 18, 2.4, '#fff') + Cn(44, 26, 2.4, '#fff'),
  sailor: (g, c) => E(32, 40, 26, 7, '#f4efe6', 4) + P('M 14 38 Q 14 18 32 18 Q 50 18 50 38 Z', '#ffffff', 4) + Rn(15, 31, 34, 6, 2, c) + gloss(24, 24, 4, 2, -20, 0.8),
  fisher: (g, c) => P('M 6 44 Q 32 30 58 44 Q 32 52 6 44 Z', dark(c, 0.15), 4) + P('M 16 40 Q 16 18 32 18 Q 48 18 48 40 Z', c, 4) + L('M 18 34 Q 32 30 46 34', 2.4, light(c, 0.3)),
  beanie: (g, c) => P('M 12 44 Q 10 14 32 14 Q 54 14 52 44 Z', c, 4) + R(10, 38, 44, 10, 4, dark(c, 0.15), 3.4) + C(32, 12, 6, '#fff', 3) + L('M 22 20 L 22 38 M 32 18 L 32 38 M 42 20 L 42 38', 2, dark(c, 0.2)),
  tricorn: (g, c) => P('M 4 40 Q 10 16 32 18 Q 54 16 60 40 Q 48 32 32 36 Q 16 32 4 40 Z', '#2a2a3a', 4) + L('M 7 38 Q 16 31 32 34 Q 48 31 57 38', 2.6, c) + C(32, 26, 5, '#f4efe6', 2.2) + L('M 27 32 L 37 34 M 37 32 L 27 34', 1.8, '#f4efe6'),
  cowboy: (g, c) => P('M 2 42 Q 10 48 32 46 Q 54 48 62 42 Q 54 36 32 38 Q 10 36 2 42 Z', '#a8683a', 4) + P('M 16 40 Q 14 16 26 18 Q 32 22 38 18 Q 50 16 48 40 Z', '#b8784a', 4) + Rn(16, 32, 32, 5, 2, c),
  captain: (g, c) => E(32, 40, 24, 8, '#2a2a3a', 4) + P('M 12 38 Q 10 16 32 14 Q 54 16 52 38 Z', '#f4efe6', 4) + Rn(12, 32, 40, 7, 2, '#2a2a3a') + C(32, 27, 5, c, 2.4) + P('M 14 42 Q 32 50 50 42 L 46 48 Q 32 54 18 48 Z', '#2a2a3a', 3),
  bandana2: (g, c) => P('M 10 40 Q 8 14 32 12 Q 56 12 56 36 Q 32 28 10 40 Z', '#2a2a3a', 4) + P('M 12 34 L 2 40 L 6 30 Z', '#2a2a3a', 3) + C(34, 22, 5, '#f4efe6', 0) + L('M 28 28 L 40 22 M 28 22 L 40 28', 2, '#f4efe6') + L('M 12 38 Q 32 30 55 35', 2.4, c),
  straw: (g, c) => E(32, 40, 28, 8, '#f2c45a', 4) + P('M 14 38 Q 14 14 32 14 Q 50 14 50 38 Z', '#f5cf66', 4) + Rn(15, 29, 34, 7, 2, '#d8384a') + gloss(24, 20, 4, 2, -20, 0.7),
  surgeon: (g, c) => P('M 10 44 Q 8 10 32 10 Q 56 10 54 44 Z', '#f4efe6', 4) + R(8, 38, 48, 10, 5, '#f4efe6', 3.4) + En(22, 24, 4, 3, '#5a3a22') + En(38, 18, 4, 3, '#5a3a22') + En(44, 30, 3.4, 2.6, '#5a3a22') + En(28, 34, 3, 2.2, '#5a3a22'),
  marine: (g, c) => P('M 12 40 Q 12 16 32 16 Q 52 16 52 40 Z', '#ffffff', 4) + Rn(13, 32, 38, 7, 2, '#3f6fd8') + P('M 40 40 Q 56 40 60 46 Q 50 48 40 44 Z', '#2a2a3a', 3) + L('M 24 26 Q 32 30 40 26', 2.6, '#3f6fd8'),
  plume: (g, c) => P('M 4 42 Q 10 22 32 22 Q 54 22 60 42 Q 32 34 4 42 Z', '#7a3ab0', 4) + P('M 34 24 Q 44 2 60 4 Q 52 10 50 22 Q 44 16 34 24 Z', c, 3) + L('M 36 22 Q 46 10 56 7', 1.6, '#fff'),
  emperor: (g, c) => P('M 2 40 Q 8 10 32 12 Q 56 10 62 40 Q 48 30 32 34 Q 16 30 2 40 Z', '#c0392b', 4) + L('M 5 38 Q 16 28 32 32 Q 48 28 59 38', 3, '#ffcc3a') + P('M 30 14 Q 36 -2 54 2 Q 44 6 42 14 Z', '#f4efe6', 3) + C(32, 24, 5, '#ffcc3a', 2.4),
  crown: (g, c) => P('M 8 48 L 8 18 L 20 30 L 32 10 L 44 30 L 56 18 L 56 48 Z', '#ffcc3a', 4) + Rn(10, 38, 44, 6, 2, '#e89a22') + C(32, 30, 4.5, c, 2.6),
  roger: (g, c) => P('M 2 40 Q 8 10 32 12 Q 56 10 62 40 Q 48 30 32 34 Q 16 30 2 40 Z', '#1e1a2a', 4) + L('M 5 38 Q 16 28 32 32 Q 48 28 59 38', 3, '#ffcc3a') + C(32, 22, 5.6, '#f4efe6', 2.2) + L('M 24 28 Q 32 26 40 28', 2.4, '#f4efe6') + gloss(18, 24, 4, 2, -20, 0.4),
  crown2: (g, c) => [0, 40, 80, 120, 160, 200, 240, 280, 320].map(a => G(Rn(-1.6, -30, 3.2, 10, 1.6, '#fff3a6'), `translate(32 36) rotate(${a})`)).join('') + P('M 12 46 L 12 22 L 22 32 L 32 14 L 42 32 L 52 22 L 52 46 Z', '#fffbe8', 4) + C(32, 34, 5, '#ffcc3a', 2.4),
};
// cloaks: capes (even index) and long coats (odd index)
const CLOAK_COL = [['#c9b88a', '#8a7a6a'], ['#5a7a4a', '#7a4a2a'], ['#2a2a3a', '#c0392b'], ['#2a3a6a', '#f4efe6'], ['#5a2a7a', '#f4efe6'], ['#f4efe6', '#a8d8ff'], ['#1e1a2a', '#3a2a4a'], ['#c0392b', '#fffbe8']];
function cloakArt(g, i) {
  const c = CLOAK_COL[g][i], trim = g >= 4 ? '#ffcc3a' : light(c, 0.3);
  if (i === 0) return P('M 32 8 Q 14 10 8 56 Q 20 60 32 56 Q 44 60 56 56 Q 50 10 32 8 Z', c, 4) + P('M 18 12 Q 32 22 46 12 L 44 6 Q 32 12 20 6 Z', trim, 3) +
    `<path d="M 40 14 Q 52 30 52 54 L 46 56 Q 46 32 38 16 Z" fill="${dark(c, 0.25)}" opacity=".6"/>` + (g >= 3 ? C(32, 16, 3, '#ffcc3a', 2) : '');
  return P('M 18 8 L 32 14 L 46 8 L 58 22 L 52 26 L 50 20 L 50 58 L 14 58 L 14 20 L 12 26 L 6 22 Z', c, 4) +
    P('M 26 12 L 32 30 L 38 12', 'none', 3) + L('M 32 30 L 32 58', 2.4, dark(c, 0.3)) + L('M 14 54 L 50 54', 3, trim) +
    (c === '#f4efe6' ? `<text x="34" y="46" font-size="11" font-weight="900" fill="#2a2a3a" font-family="sans-serif">正義</text>` : '');
}
// devil fruits: a round fruit covered in swirls, with a curly stem
function fruitArt(g, i) {
  const [skin, sw] = FRUIT_COL[g][i];
  const id = nid('fr');
  const swirl = (x, y, r) => `<path d="M ${x} ${y} m -1 0 a 1.6 1.6 0 1 1 2.6 1.4 a ${r * 0.45} ${r * 0.45} 0 1 1 -5 -2.4 a ${r * 0.8} ${r * 0.8} 0 1 1 8.6 4.6" fill="none" stroke="${sw}" stroke-width="2.4" stroke-linecap="round"/>`;
  return `<defs><clipPath id="${id}"><path d="M 32 14 Q 50 12 54 32 Q 56 54 32 58 Q 8 54 10 32 Q 14 12 32 14 Z"/></clipPath></defs>` +
    P('M 32 14 Q 50 12 54 32 Q 56 54 32 58 Q 8 54 10 32 Q 14 12 32 14 Z', skin, 4) +
    `<g clip-path="url(#${id})">${swirl(22, 28, 9)}${swirl(40, 26, 8)}${swirl(30, 44, 10)}${swirl(48, 46, 8)}${swirl(14, 46, 7)}` +
    `<path d="M 44 18 Q 58 30 52 52 L 60 60 L 62 10 Z" fill="${dark(skin, 0.3)}" opacity=".4"/></g>` +
    gloss(22, 22, 4, 2.4, -35, 0.8) + L('M 32 14 Q 30 6 38 4 Q 42 8 36 10', 3, '#3a6a2a') + P('M 34 10 Q 44 2 52 8 Q 44 14 34 10 Z', '#5aa83a', 2.4);
}
const gearCache = new Map();
export function gearIcon(item) {
  let v = gearCache.get(item.id);
  if (v) return v;
  let inner;
  if (item.slot === 'weapon') inner = (WEAPON[item.shape] || WEAPON.sword)(item.g);
  else if (item.slot === 'cloak') inner = cloakArt(item.g, item.i);
  else if (item.slot === 'hat') inner = (HAT[item.shape] || HAT.straw)(item.g, W_COL[item.g]);
  else inner = fruitArt(item.g, item.i);
  v = svg(V, V, inner);
  gearCache.set(item.id, v);
  return v;
}

// ------------------------------------------------------------------ relics & treasures
const RSH = {
  amulet: c => L('M 14 6 Q 32 30 50 6', 7) + L('M 14 6 Q 32 30 50 6', 3.4, '#ffcc3a') + P(poly(32, 40, 18, 6), c, 4) + `<path d="${poly(32, 40, 9, 6)}" fill="${light(c, 0.5)}"/>`,
  orb: c => P('M 16 54 L 48 54 L 44 46 L 20 46 Z', '#a8683a', 3.4) + C(32, 28, 19, c, 4) + gloss(25, 21, 6, 4, -30, 0.85) + `<circle cx="32" cy="28" r="9" fill="${light(c, 0.4)}" opacity=".6"/>`,
  ring: c => E(32, 38, 18, 15, 'none', 9) + E(32, 38, 18, 15, 'none', 0, 'stroke="#ffcc3a" stroke-width="5"') + P(poly(32, 18, 11, 8), c, 3.6) + gloss(28, 15, 3, 2, -30, 0.9),
  crown: c => P('M 8 50 L 8 20 L 20 32 L 32 12 L 44 32 L 56 20 L 56 50 Z', '#ffcc3a', 4) + C(32, 38, 6, c, 3) + C(16, 42, 3.4, c, 2.2) + C(48, 42, 3.4, c, 2.2),
  book: c => P('M 10 10 L 30 14 L 30 56 L 10 52 Z', c, 4) + P('M 54 10 L 34 14 L 34 56 L 54 52 Z', light(c, 0.2), 4) + L('M 32 14 L 32 56', 4) + C(20, 32, 4, '#ffcc3a', 2) + C(44, 32, 4, '#ffcc3a', 2),
  feather: c => P('M 50 6 Q 20 14 14 46 L 10 58 L 18 50 Q 46 40 50 6 Z', c, 4) + L('M 48 10 Q 30 30 14 52', 2.6, light(c, 0.5)),
  hourglass: c => P('M 14 6 L 50 6 L 50 12 L 14 12 Z', '#a8683a', 3.4) + P('M 14 52 L 50 52 L 50 58 L 14 58 Z', '#a8683a', 3.4) + P('M 18 12 L 46 12 Q 46 26 34 32 Q 46 38 46 52 L 18 52 Q 18 38 30 32 Q 18 26 18 12 Z', '#e8f4ff', 3.6) + `<path d="M 22 48 L 42 48 Q 38 40 32 38 Q 26 40 22 48 Z" fill="${c}"/>`,
};
const TSH = {
  coin: c => C(32, 32, 24, c, 4) + C(32, 32, 16, 'none', 0, `stroke="${dark(c, 0.3)}" stroke-width="3"`) + P(star(32, 32, 9, 4), light(c, 0.4), 2.4),
  gem: c => P('M 14 24 L 24 10 L 40 10 L 50 24 L 32 56 Z', c, 4) + `<path d="M 14 24 L 50 24 L 32 56 Z" fill="${dark(c, 0.2)}"/>` + gloss(24, 18, 4, 2, -30, 0.9),
  skull: c => P('M 12 30 Q 12 8 32 8 Q 52 8 52 30 Q 52 42 44 44 L 44 54 L 20 54 L 20 44 Q 12 42 12 30 Z', c, 4) + En(24, 30, 6, 7, OL) + En(40, 30, 6, 7, OL) + gloss(22, 16, 5, 3, -30, 0.8),
  fossil: c => E(32, 34, 24, 20, '#c9b08a', 4) + L('M 32 34 m -2 0 a 3 3 0 1 1 5 2 a 7 7 0 1 1 -11 -4 a 12 12 0 1 1 17 10', 5, c),
  idol: c => P('M 20 58 L 22 26 Q 22 8 32 8 Q 42 8 42 26 L 44 58 Z', c, 4) + En(27, 24, 3, 4, OL) + En(37, 24, 3, 4, OL) + L('M 26 36 L 38 36', 3) + L('M 22 46 L 42 46', 3, dark(c, 0.3)),
  map: c => P('M 8 12 L 24 8 L 40 12 L 56 8 L 56 52 L 40 56 L 24 52 L 8 56 Z', '#f6e3b0', 4) + L('M 14 40 Q 26 26 34 36 Q 42 44 48 22', 3, c, 'stroke-dasharray="4 4"') + P('M 44 18 L 52 26 M 52 18 L 44 26', c, 3.6),
};
const relCache = new Map();
export function relicIcon(r) { let v = relCache.get(r.id); if (!v) { v = svg(V, V, (RSH[r.shape] || RSH.orb)(r.col)); relCache.set(r.id, v); } return v; }
export function treasureIcon(t) { let v = relCache.get(t.id); if (!v) { v = svg(V, V, (TSH[t.shape] || TSH.coin)(t.col)); relCache.set(t.id, v); } return v; }
export function unknownIcon() { return svg(V, V, `<text x="32" y="44" text-anchor="middle" font-size="36" font-family="Lilita One, sans-serif" fill="#8a7ac0" stroke="${OL}" stroke-width="3" paint-order="stroke">?</text>`); }
export { GRADE_COL };
