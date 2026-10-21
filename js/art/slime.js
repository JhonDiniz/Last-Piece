// The player's jelly slimes. Every slime shares the same body and face rig;
// colour and headwear make each one unique.
import { OL, svg, nid, mix, dark, light, lin, rad, P, E, C, Cn, En, L, G, gloss, star } from './kit.js';

export const SW = 140, SH = 130;         // viewBox of slime sprites
export const SLIME_FEET = 124;           // y of the body bottom inside the viewBox

const BODY = 'M 26 124 C 12 124 8 112 12 100 C 18 68 38 38 70 38 C 102 38 122 68 128 100 C 132 112 128 124 114 124 Z';

export function slimeBody(color) {
  const g = nid('sb'), r = nid('sr'), cp = nid('sc');
  const hi = light(color, 0.5), lo = dark(color, 0.35), core = light(color, 0.22);
  const defs = lin(g, [[0, hi], [0.55, color], [1, dark(color, 0.12)]]) +
    rad(r, [[0, core, 0.9], [1, core, 0]], 0.42, 0.5, 0.45) +
    `<clipPath id="${cp}"><path d="${BODY}"/></clipPath>`;
  const body =
    `<ellipse cx="70" cy="125" rx="54" ry="6" fill="${OL}" opacity=".0"/>` +
    `<path d="${BODY}" fill="url(#${g})"/>` +
    `<g clip-path="url(#${cp})">` +
    `<ellipse cx="64" cy="86" rx="46" ry="34" fill="url(#${r})"/>` +
    `<path d="M 0 104 C 30 120 110 122 140 98 L 140 140 L 0 140 Z" fill="${lo}" opacity=".55"/>` +
    `<path d="M 104 50 C 126 66 134 92 130 120 L 140 120 L 140 40 Z" fill="${lo}" opacity=".35"/>` +
    `<circle cx="40" cy="106" r="5" fill="${hi}" opacity=".55"/><circle cx="52" cy="114" r="3" fill="${hi}" opacity=".5"/>` +
    `<circle cx="104" cy="108" r="3.5" fill="${hi}" opacity=".45"/>` +
    `</g>` +
    `<path d="${BODY}" fill="none" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>` +
    gloss(46, 62, 15, 8.5, -38, 0.85) + `<circle cx="32" cy="80" r="4.2" fill="#fff" opacity=".8"/>` +
    L('M 26 96 C 27 84 31 74 37 66', 3.5, '#fff', 'opacity=".35"');
  return { defs, body };
}

export function slimeFace(kind = 'idle') {
  const ex1 = 64, ex2 = 94, ey = 84;
  const blush = En(52, 97, 7, 3.8, '#ff6f9a', 'opacity=".55"') + En(106, 97, 7, 3.8, '#ff6f9a', 'opacity=".55"');
  if (kind === 'blink') {
    return blush + L(`M ${ex1 - 7} ${ey} Q ${ex1} ${ey - 5} ${ex1 + 7} ${ey}`, 4) + L(`M ${ex2 - 7} ${ey} Q ${ex2} ${ey - 5} ${ex2 + 7} ${ey}`, 4) +
      L('M 74 97 Q 79 102 84 97', 3.4);
  }
  if (kind === 'hurt') {
    return blush + L(`M ${ex1 - 7} ${ey - 6} L ${ex1 + 5} ${ey} L ${ex1 - 7} ${ey + 6}`, 4.2) +
      L(`M ${ex2 + 7} ${ey - 6} L ${ex2 - 5} ${ey} L ${ex2 + 7} ${ey + 6}`, 4.2) +
      L('M 70 101 Q 74 97 78 101 Q 82 105 86 101', 3.4);
  }
  if (kind === 'happy') {
    return blush + L(`M ${ex1 - 7} ${ey + 2} Q ${ex1} ${ey - 8} ${ex1 + 7} ${ey + 2}`, 4.2) + L(`M ${ex2 - 7} ${ey + 2} Q ${ex2} ${ey - 8} ${ex2 + 7} ${ey + 2}`, 4.2) +
      P('M 70 95 Q 79 110 88 95 Z', '#7a2140', 3.2) + En(79, 102, 4, 2.5, '#ff7b9c');
  }
  const eye = (x) => En(x, ey, 6.8, 9.6, OL) + Cn(x + 2.2, ey - 4.2, 2.9, '#fff') + Cn(x - 2, ey + 4, 1.4, '#fff');
  if (kind === 'attack') {
    return blush + eye(ex1) + eye(ex2) +
      L(`M ${ex1 - 9} ${ey - 15} L ${ex1 + 6} ${ey - 10}`, 4) + L(`M ${ex2 + 9} ${ey - 15} L ${ex2 - 6} ${ey - 10}`, 4) +
      P('M 71 96 Q 79 108 87 96 Z', '#7a2140', 3.2) + En(79, 102, 3.6, 2.2, '#ff7b9c');
  }
  return blush + eye(ex1) + eye(ex2) + L('M 73 97 Q 79 103 85 97', 3.4);
}

// ---- headwear -------------------------------------------------------------
const HATS = {
  crown() {
    return G(P('M -17 7 L -17 -9 L -9 -1 L 0 -14 L 9 -1 L 17 -9 L 17 7 Z', '#ffcc3a', 3.6) +
      `<path d="M -15 1 L 15 1 L 15 6 L -15 6 Z" fill="#e89a22"/>` +
      C(0, 3.6, 2.6, '#ff4d6d', 2) + C(-10, 3.6, 1.8, '#4cc9f0', 1.6) + C(10, 3.6, 1.8, '#4cc9f0', 1.6) +
      C(-17, -10, 2.4, '#ffcc3a', 2.4) + C(0, -15, 2.6, '#ffcc3a', 2.4) + C(17, -10, 2.4, '#ffcc3a', 2.4) +
      `<path d="M -12 -3 L -6 2" stroke="#fff6c0" stroke-width="2" stroke-linecap="round" opacity=".8"/>`, 'translate(84 37) rotate(14)');
  },
  sprout() {
    return G(L('M 0 6 Q -2 -6 2 -14', 4, OL) + L('M 0 6 Q -2 -6 2 -14', 2, '#5fae3c') +
      P('M 2 -14 Q 18 -26 26 -12 Q 14 -4 2 -14 Z', '#7ed957', 3) + P('M 1 -12 Q -14 -24 -22 -10 Q -10 -2 1 -12 Z', '#9be36d', 3) +
      L('M 4 -14 Q 14 -16 20 -13', 1.6, '#4b8f2c'), 'translate(74 38)');
  },
  wizard() {
    return G(P('M -30 6 Q 0 -4 30 6 Q 0 16 -30 6 Z', '#5b3fb0', 3.6) +
      P('M -18 5 Q -6 -30 6 -46 Q 10 -50 14 -46 Q 10 -28 18 5 Z', '#6a4bd0', 3.6) +
      `<path d="M -16 1 Q 0 -4 17 1 L 17.5 4 Q 0 0 -16.5 4.5 Z" fill="#ffcc3a"/>` +
      `<path d="${star(2, -16, 5, 2.2)}" fill="#ffe680"/>` + `<path d="${star(8, -32, 3.5, 1.5)}" fill="#ffe680"/>`,
      'translate(80 36) rotate(10)');
  },
  ninja() {
    return G(`<path d="M -56 2 Q 0 -8 56 2 L 55 13 Q 0 4 -55 13 Z" fill="#e8384f" stroke="${OL}" stroke-width="3.6" stroke-linejoin="round"/>` +
      `<rect x="-6" y="-2" width="12" height="12" rx="2" fill="#c9d2e0" stroke="${OL}" stroke-width="2.6"/>` +
      L('M 54 7 Q 66 2 72 12', 5, OL) + L('M 54 7 Q 66 2 72 12', 2.6, '#e8384f') + L('M 54 9 Q 62 16 68 24', 5, OL) + L('M 54 9 Q 62 16 68 24', 2.6, '#e8384f'),
      'translate(72 56) rotate(-4)');
  },
  pirate() {
    return G(P('M -36 4 Q -30 -10 -22 -14 Q 0 -30 22 -14 Q 30 -10 36 4 Q 0 -6 -36 4 Z', '#2f2a3d', 3.6) +
      `<path d="M -30 0 Q 0 -10 30 0" fill="none" stroke="#ffcc3a" stroke-width="2.4"/>` +
      C(0, -14, 5.5, '#f4efe6', 2.4) + Cn(-2, -15, 1.3, OL) + Cn(2, -15, 1.3, OL) +
      L('M -7 -6 L 7 -2 M 7 -6 L -7 -2', 2, '#f4efe6'), 'translate(78 38) rotate(8)');
  },
  viking() {
    return G(P('M -24 10 Q -24 -18 0 -20 Q 24 -18 24 10 Z', '#b8c4d6', 3.6) +
      `<rect x="-26" y="4" width="52" height="8" rx="3" fill="#8b5a2b" stroke="${OL}" stroke-width="3"/>` +
      P('M -22 -2 Q -40 -10 -38 -30 Q -30 -16 -18 -12 Z', '#fff4dc', 3) + P('M 22 -2 Q 40 -10 38 -30 Q 30 -16 18 -12 Z', '#fff4dc', 3) +
      gloss(-8, -10, 7, 3.5, -20, 0.6), 'translate(76 40) rotate(6)');
  },
  chef() {
    return G(P('M -16 8 L -16 -4 Q -30 -6 -26 -20 Q -22 -32 -8 -26 Q -2 -40 10 -32 Q 24 -36 24 -22 Q 32 -12 18 -4 L 18 8 Z', '#ffffff', 3.4) +
      `<rect x="-16" y="0" width="34" height="8" fill="#e6e6f2"/>` + L('M -16 0 L 18 0', 2.4, '#c9c9dc'), 'translate(80 36) rotate(8)');
  },
  samurai() {
    return G(P('M -30 10 Q -26 -16 0 -18 Q 26 -16 30 10 Q 0 4 -30 10 Z', '#3a3f5a', 3.6) +
      P('M -36 12 Q -32 4 -26 6 L 26 6 Q 32 4 36 12 Q 0 20 -36 12 Z', '#2b2f47', 3.4) +
      P('M -4 -16 Q -18 -38 -26 -40 Q -12 -30 -2 -20 Z', '#ffcc3a', 2.6) + P('M 4 -16 Q 18 -38 26 -40 Q 12 -30 2 -20 Z', '#ffcc3a', 2.6) +
      C(0, -8, 4.4, '#e8384f', 2.4), 'translate(78 38) rotate(6)');
  },
  flower() {
    let f = '';
    const cols = ['#ff7aa8', '#ffd23f', '#8be0ff', '#c69cff', '#ff9a4a'];
    for (let i = 0; i < 5; i++) {
      const x = -30 + i * 15, y = i % 2 ? -2 : 2;
      f += G(C(0, -5, 4.2, cols[i], 2.2) + C(5, 0, 4.2, cols[i], 2.2) + C(0, 5, 4.2, cols[i], 2.2) + C(-5, 0, 4.2, cols[i], 2.2) + C(0, 0, 3.4, '#fff3a6', 2), `translate(${x} ${y})`);
    }
    return G(L('M -34 4 Q 0 -6 34 4', 4, '#5fae3c') + f, 'translate(76 44) rotate(4)');
  },
  headphones() {
    return G(L('M -46 30 Q -46 -22 0 -24 Q 46 -22 46 30', 9, OL) + L('M -46 30 Q -46 -22 0 -24 Q 46 -22 46 30', 4.5, '#ff4d8d') +
      `<rect x="-58" y="18" width="20" height="30" rx="9" fill="#2f2a3d" stroke="${OL}" stroke-width="3.4"/>` +
      `<rect x="38" y="18" width="20" height="30" rx="9" fill="#2f2a3d" stroke="${OL}" stroke-width="3.4"/>` +
      Cn(-48, 33, 5, '#4cc9f0') + Cn(48, 33, 5, '#4cc9f0'), 'translate(70 52)');
  },
  angel() {
    return G(`<ellipse cx="0" cy="0" rx="22" ry="6" fill="none" stroke="${OL}" stroke-width="8"/>` +
      `<ellipse cx="0" cy="0" rx="22" ry="6" fill="none" stroke="#ffe56b" stroke-width="4.5"/>`, 'translate(74 20) rotate(-6)');
  },
  horns() {
    return G(P('M -30 8 Q -40 -6 -34 -22 Q -28 -8 -18 0 Z', '#ff5a4f', 3.2) + P('M 30 8 Q 40 -6 34 -22 Q 28 -8 18 0 Z', '#ff5a4f', 3.2), 'translate(76 42)');
  },
  cowboy() {
    return G(P('M -44 6 Q -40 -2 -30 2 Q 0 10 30 2 Q 40 -2 44 6 Q 0 22 -44 6 Z', '#a8683a', 3.6) +
      P('M -20 4 Q -22 -22 -8 -22 Q 0 -16 8 -22 Q 22 -22 20 4 Q 0 10 -20 4 Z', '#b9763f', 3.6) +
      `<path d="M -20 -2 Q 0 4 20 -2 L 20 2 Q 0 8 -20 2 Z" fill="#5a3a22"/>` +
      `<path d="${star(0, -10, 5, 2.2)}" fill="#ffcc3a" stroke="${OL}" stroke-width="1.4"/>`, 'translate(78 38) rotate(8)');
  },
  ice() {
    return G(P('M -20 8 L -24 -6 L -14 -2 L -10 -22 L -2 -4 L 4 -26 L 10 -4 L 18 -18 L 18 0 L 26 -8 L 22 8 Z', '#bdf3ff', 3.2) +
      `<path d="M -10 -18 L -6 -4 M 4 -22 L 6 -6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`, 'translate(78 38) rotate(8)');
  },
  flame() {
    return G(P('M -20 10 Q -28 -6 -16 -14 Q -14 -4 -8 -6 Q -12 -22 2 -34 Q 2 -18 10 -14 Q 12 -24 20 -26 Q 16 -12 24 -2 Q 26 6 20 10 Z', '#ff8a2a', 3.2) +
      `<path d="M -10 8 Q -14 -2 -6 -6 Q -2 -2 2 -4 Q 0 -14 8 -20 Q 8 -10 14 -4 Q 16 4 12 8 Z" fill="#ffd23f"/>`, 'translate(80 38) rotate(6)');
  },
  bow() {
    return G(P('M 0 0 Q -18 -16 -24 -4 Q -26 8 0 2 Z', '#ff5c93', 3.2) + P('M 0 0 Q 18 -16 24 -4 Q 26 8 0 2 Z', '#ff5c93', 3.2) +
      C(0, 0, 5, '#ff8fb5', 3), 'translate(96 44) rotate(16)');
  },
  goggles() {
    return G(L('M -56 0 Q 0 -10 56 0', 8, OL) + L('M -56 0 Q 0 -10 56 0', 4, '#7a5230') +
      C(-12, -4, 11, '#4cc9f0', 3.6) + C(12, -4, 11, '#4cc9f0', 3.6) + gloss(-15, -8, 4, 2.5, -30, 0.9) + gloss(9, -8, 4, 2.5, -30, 0.9), 'translate(74 52) rotate(-3)');
  },
  none() { return ''; },
};

// optional weapon-ish accessory held at the side (drawn behind body)
export function slimeParts(o = {}) {
  const color = o.color || '#68dd8c';
  const b = slimeBody(color);
  const hat = (HATS[o.hat || 'crown'] || HATS.none)();
  const faces = {};
  for (const k of ['idle', 'blink', 'attack', 'hurt', 'happy']) faces[k] = svg(SW, SH, slimeFace(k));
  const extraFront = o.hat === 'astronaut'
    ? `<path d="M 6 120 C 0 60 30 22 70 22 C 110 22 140 60 134 120 Z" fill="#bfefff" opacity=".28" stroke="${OL}" stroke-width="4"/>` + gloss(40, 48, 14, 7, -35, 0.7)
    : '';
  return {
    body: svg(SW, SH, b.body, b.defs),
    faces,
    hat: svg(SW, SH, hat + extraFront),
    full: (face = 'idle') => svg(SW, SH, b.body + slimeFace(face) + hat + extraFront, b.defs),
  };
}

export const HAT_NAMES = Object.keys(HATS);
