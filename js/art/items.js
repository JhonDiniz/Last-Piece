// Item art: skill icons, equipment, relics and treasures (64x64 viewBox).
import { OL, svg, nid, mix, dark, light, lin, rad, P, E, C, Cn, En, R, Rn, L, G, gloss, star, poly } from './kit.js';
import { GRADE_COL } from '../data/balance.js';

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
const ARMOR = {
  leaf: g => P('M 32 6 Q 58 18 52 44 Q 44 58 32 60 Q 20 58 12 44 Q 6 18 32 6 Z', '#7ed957', 4) + L('M 32 12 L 32 56 M 32 26 L 44 20 M 32 36 L 20 30 M 32 44 L 44 38', 2.6, '#3a8a2a'),
  tunic: g => P('M 18 10 L 26 6 L 32 12 L 38 6 L 46 10 L 56 22 L 48 28 L 46 22 L 46 58 L 18 58 L 18 22 L 16 28 L 8 22 Z', '#d8c8a8', 4) + L('M 18 40 L 46 40', 3, '#a88a5a'),
  leather: g => P('M 16 10 L 26 6 L 32 12 L 38 6 L 48 10 L 50 56 L 14 56 Z', '#a8683a', 4) + L('M 32 14 L 32 56', 2.6, '#6a4426') + C(26, 24, 2, '#ffcc3a', 1.6) + C(26, 34, 2, '#ffcc3a', 1.6) + C(26, 44, 2, '#ffcc3a', 1.6),
  shell: g => P('M 32 6 Q 56 10 56 34 Q 56 56 32 58 Q 8 56 8 34 Q 8 10 32 6 Z', '#9ad14b', 4) + P(poly(32, 32, 10, 6), '#c8f07a', 3) + L('M 32 22 L 32 8 M 41 27 L 54 22 M 41 37 L 52 46 M 23 37 L 12 46 M 23 27 L 10 22 M 32 42 L 32 56', 2.6, '#5a8a2a'),
  mail: g => P('M 14 10 L 26 6 L 32 12 L 38 6 L 50 10 L 52 56 L 12 56 Z', '#b8c4d6', 4) +
    [16, 24, 32, 40, 48].map(y => L(`M 16 ${y} Q 20 ${y + 4} 24 ${y} Q 28 ${y + 4} 32 ${y} Q 36 ${y + 4} 40 ${y} Q 44 ${y + 4} 48 ${y}`, 2, '#7a8496')).join(''),
  bronze: g => P('M 12 12 L 26 6 L 32 10 L 38 6 L 52 12 L 50 50 Q 32 60 14 50 Z', '#d8a03a', 4) + P('M 20 18 Q 32 28 44 18 L 44 30 Q 32 38 20 30 Z', '#f0c060', 2.6) + gloss(22, 18, 4, 2, -25, 0.7),
  plate: g => P('M 10 14 L 24 6 L 32 10 L 40 6 L 54 14 L 50 52 Q 32 62 14 52 Z', '#c3cfdf', 4) + L('M 32 12 L 32 56', 3, '#8a93a6') + P('M 10 14 Q 4 24 8 32 L 16 28 Z', '#a8b4c6', 3) + P('M 54 14 Q 60 24 56 32 L 48 28 Z', '#a8b4c6', 3) + gloss(22, 22, 5, 3, -25, 0.75),
  robe: g => P('M 20 8 L 32 14 L 44 8 L 54 58 L 10 58 Z', '#6a4bd0', 4) + P('M 26 10 L 32 58 L 38 10 Z', '#ffcc3a', 2.6) + P(star(18, 40, 4, 1.8), '#ffe680', 0) + P(star(46, 44, 4, 1.8), '#ffe680', 0),
  dragon: g => P('M 10 14 L 24 6 L 32 12 L 40 6 L 54 14 L 50 52 Q 32 62 14 52 Z', '#e8384f', 4) + [20, 30, 40].map(y => P(`M 22 ${y} Q 32 ${y + 8} 42 ${y} L 40 ${y + 4} Q 32 ${y + 10} 24 ${y + 4} Z`, '#ff8a6a', 2.4)).join('') + P('M 10 14 L 2 8 L 8 22 Z', '#ffcc3a', 2.6) + P('M 54 14 L 62 8 L 56 22 Z', '#ffcc3a', 2.6),
  aegis: g => P('M 32 4 L 56 12 Q 56 42 32 60 Q 8 42 8 12 Z', '#ffcc3a', 4) + P('M 32 12 L 48 18 Q 48 40 32 52 Q 16 40 16 18 Z', '#ff9a2e', 2.6) + `<circle cx="32" cy="30" r="8" fill="#fff3a6" stroke="${OL}" stroke-width="2.6"/>` + [0, 60, 120, 180, 240, 300].map(a => G(Rn(-1.5, -14, 3, 4, 1, '#fff3a6'), `translate(32 30) rotate(${a})`)).join(''),
  lunar: g => P('M 10 14 L 24 6 L 32 12 L 40 6 L 54 14 L 50 52 Q 32 62 14 52 Z', '#8fa8ff', 4) + P('M 30 18 Q 18 26 24 40 Q 30 48 40 44 Q 28 42 28 30 Q 28 22 30 18 Z', '#fffbe0', 2.6),
  prism: g => P('M 32 4 L 56 20 L 48 56 L 16 56 L 8 20 Z', '#33e0c0', 4) + `<path d="M 32 4 L 32 56 L 48 56 L 56 20 Z" fill="#1fb8a0"/>` + L('M 8 20 L 56 20 M 32 4 L 32 56', 2, OL, 'opacity=".5"') + gloss(20, 20, 5, 3, -30, 0.8),
  chaos: g => P('M 10 14 L 24 6 L 32 12 L 40 6 L 54 14 L 50 52 Q 32 62 14 52 Z', '#2f2a3d', 4) + P('M 32 16 L 40 30 L 34 30 L 38 46 L 26 28 L 32 28 Z', '#ff4f6a', 2.6) + L('M 12 20 L 20 26 M 52 20 L 44 26', 3, '#ff4f6a'),
  veil: g => P('M 32 4 Q 54 8 56 30 Q 58 50 48 58 Q 40 50 32 58 Q 24 50 16 58 Q 6 50 8 30 Q 10 8 32 4 Z', '#c8d8ff', 4) + P(star(24, 26, 4, 1.8), '#fff', 0) + P(star(40, 36, 5, 2), '#fff', 0) + P(star(30, 46, 3, 1.4), '#fff', 0),
  primal: g => P('M 10 14 L 24 6 L 32 12 L 40 6 L 54 14 L 50 52 Q 32 62 14 52 Z', '#ffd23f', 4) + P(poly(32, 32, 12, 6), '#ff4f6a', 3) + C(32, 32, 5, '#fff', 2) + L('M 10 14 L 54 14', 3, '#fff3a6'),
  genesis: g => P('M 32 4 L 56 12 Q 56 42 32 60 Q 8 42 8 12 Z', '#fffbe8', 4) + [0, 45, 90, 135, 180, 225, 270, 315].map(a => G(Rn(-1.5, -18, 3, 8, 1.5, '#ffcc3a'), `translate(32 30) rotate(${a})`)).join('') + C(32, 30, 7, '#ffcc3a', 3),
};
function ringArt(g, i) {
  const gem = [W_COL[g], i ? '#ff4f6a' : '#4cc9f0'][i % 2];
  return E(32, 38, 18, 16, 'none', 9) + E(32, 38, 18, 16, 'none', 0, `stroke="${g >= 4 ? '#ffcc3a' : '#c3cfdf'}" stroke-width="5"`) + P(poly(32, 18, 10, 6), gem, 3.6) + gloss(29, 15, 3, 2, -30, 0.9);
}
function amuletArt(g, i) {
  const gem = [W_COL[g], i ? '#7ed957' : '#c55cff'][i % 2];
  return L('M 14 6 Q 32 34 50 6', 7) + L('M 14 6 Q 32 34 50 6', 3.4, g >= 4 ? '#ffcc3a' : '#c3cfdf') + P('M 32 26 L 48 40 L 32 60 L 16 40 Z', gem, 4) + gloss(26, 38, 4, 2.4, -40, 0.85);
}
const gearCache = new Map();
export function gearIcon(item) {
  let v = gearCache.get(item.id);
  if (v) return v;
  let inner;
  if (item.slot === 'weapon') inner = (WEAPON[item.shape] || WEAPON.sword)(item.g);
  else if (item.slot === 'armor') inner = (ARMOR[item.shape] || ARMOR.plate)(item.g);
  else if (item.slot === 'ring') inner = ringArt(item.g, item.i);
  else inner = amuletArt(item.g, item.i);
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
