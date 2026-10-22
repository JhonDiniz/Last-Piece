// The captain as a chibi (big head, small body), facing right.
// Split into parts so the battle can animate them:
//   armB / armF pivot at the shoulder, legB / legF pivot at the hip, body is static.
// viewBox CW x CH, feet at y = CFEET.
import { OL, svg, mix, dark, light, P, E, C, Cn, En, R, Rn, L, G, gloss } from './kit.js';

export const CW = 100, CH = 120, CFEET = 108;
export const CPIV = { legB: [45, 87], legF: [56, 87], armB: [43, 63], armF: [58, 63] };

const SW = 3;          // outline width
const HX = 50, HY = 34; // head centre

// ---------------- head ----------------
function face(l) {
  const sk = l.skin, eye = l.eyeC || '#3a2a1a';
  let s = '';
  // ear (back side) + head
  s += E(28, 39, 4.6, 6.2, sk, SW) + En(28.5, 39, 2, 3.4, dark(sk, 0.22));
  s += E(HX, HY, 24.5, 23, sk, SW);
  s += `<path d="M 66 17 Q 76 30 71.5 48.5 Q 67.5 53.5 62 55.4 Q 72.5 42 66 17 Z" fill="${dark(sk, 0.2)}" opacity=".35"/>`;
  s += `<path d="M 31 45 Q 36 54 46 56.5 Q 38 56 33 51 Z" fill="${dark(sk, 0.2)}" opacity=".3"/>`;
  // eyes: big chibi eyes on the right half of the face
  const ey = 37;
  const eyeAt = (x, sc = 1) => En(x, ey, 3.9 * sc, 5.4, OL) + En(x + 0.2 * sc, ey + 1.4, 2.8 * sc, 3.5, eye) +
    En(x + 0.2 * sc, ey + 2.6, 2.2 * sc, 2, light(eye, 0.35)) + Cn(x + 1.1 * sc, ey - 2.2, 1.6 * sc, '#fff') + Cn(x - 1.2 * sc, ey + 2.4, 0.8 * sc, '#fff');
  if (l.mouth === 'grin') {
    s += L(`M 49 ${ey - 0.5} Q 53 ${ey - 5} 57 ${ey - 0.5}`, 2.8) + L(`M 65 ${ey - 0.5} Q 69 ${ey - 5} 73 ${ey - 0.5}`, 2.8);
  } else {
    s += eyeAt(53, 0.92) + eyeAt(69);
  }
  // brows
  const angry = l.mouth === 'serious';
  s += L(angry ? 'M 48 28 L 57 30.5' : 'M 48.5 29 Q 53 26.5 57 28.5', 2.4, dark(l.hairC || '#2a1a12', 0.2)) +
    L(angry ? 'M 74 28 L 65 30.5' : 'M 65 28.5 Q 69.5 26.5 74 29', 2.4, dark(l.hairC || '#2a1a12', 0.2));
  // blush + nose
  s += En(47.5, 45.5, 3.6, 2.1, '#ff7aa8', 'opacity=".5"') + En(71.5, 45.5, 2.8, 1.9, '#ff7aa8', 'opacity=".5"');
  // mouth
  if (l.mouth === 'grin') s += P('M 56 46 Q 62.5 56 70 46 Z', '#7a2140', 2.4) + `<path d="M 57.5 46.6 L 68.6 46.6 L 68 48.4 L 58.2 48.4 Z" fill="#fff"/>` + En(63, 51.3, 3, 1.6, '#ff7b9c');
  else if (l.mouth === 'serious') s += L('M 59 49 Q 63 47.6 67 49', 2.4);
  else s += P('M 58.5 47 Q 63 53 67.5 47 Z', '#7a2140', 2.2) + En(63, 49.8, 2, 1.2, '#ff7b9c');
  // detail
  if (l.detail === 'scar') s += L('M 48 42 Q 52 44.5 56.5 42', 1.8, dark(sk, 0.45)) + L('M 50 41 L 50.6 44 M 53 41.6 L 53.4 44.6', 1.3, dark(sk, 0.45));
  if (l.detail === 'stache') s += P('M 56 45 Q 60 42.6 63 44.6 Q 66 42.6 70 45 Q 66 47 63 45.8 Q 60 47 56 45 Z', l.hairC, 1.8);
  if (l.detail === 'goatee') s += P('M 60 54 Q 63 60 66 54 Q 63 55.6 60 54 Z', l.hairC, 1.8);
  return s;
}

// hair is split: back layer (behind the head) and front layer (over the forehead)
function hairBack(l) {
  const h = l.hairC, dk = dark(h, 0.2);
  switch (l.hair) {
    case 'long': return P('M 30 18 Q 18 30 20 52 Q 21 64 30 70 Q 34 62 38 64 Q 40 56 34 50 Q 30 40 34 26 Z', h, SW) + L('M 24 40 Q 23 54 29 64', 1.6, dk);
    case 'ponytail': return P('M 30 22 Q 14 24 10 40 Q 8 52 14 60 Q 16 50 20 46 Q 18 56 24 62 Q 24 46 32 36 Z', h, SW) + C(29, 25, 4.2, l.hatC || '#d8384a', 2.2);
    case 'bun': return C(28, 13, 9, h, SW) + gloss(25, 9, 3, 1.8, -30, 0.5);
    default: return '';
  }
}
function hairFront(l) {
  const h = l.hairC, hi = light(h, 0.28);
  switch (l.hair) {
    case 'spiky':
      return P('M 26 44 Q 20 32 24 24 L 18 21 L 28 17 L 25 8 L 37 12 L 40 2 L 49 9 L 57 1 L 61 10 L 71 5 L 71 13 L 80 12 L 76 20 L 82 24 L 75.5 27 L 74 32 L 69 26.5 L 65 32 L 61 25 L 56.5 31 L 52 24.5 L 47 30 L 43 23.5 L 38 31 L 34.5 25 Q 31 33 32.5 44 Z', h, SW) +
        L('M 33 15 Q 44 8 56 9', 2.2, hi, 'opacity=".8"') + L('M 47 13 L 44 22 M 60 13 L 58 21 M 68 15 L 69 22', 1.4, dark(h, 0.35), 'opacity=".7"');
    case 'short':
      return P('M 26 44 Q 18 18 46 10 Q 72 5 78.5 26 Q 74 24.5 70 27.5 Q 66 21.5 60.5 26 Q 55 20.5 49.5 25.5 Q 44 21 39 26.5 Q 35 26 33 32 Q 31 38 32.5 44 Z', h, SW) +
        L('M 34 17 Q 44 11 56 11', 2.2, hi, 'opacity=".8"');
    case 'long':
      return P('M 26 50 Q 16 18 46 10 Q 72 5 79 27 Q 74 25 70.5 28.5 Q 66 21 59.5 26.5 Q 54 19.5 47.5 25.5 Q 42 20 37 27 Q 33 30 33 38 Q 33 46 30 52 Z', h, SW) +
        L('M 34 17 Q 44 11 56 11', 2.2, hi, 'opacity=".8"');
    case 'ponytail': case 'bun':
      return P('M 26 42 Q 20 16 47 10 Q 73 6 78 26 Q 66 19 54 22 Q 42 24 34 32 Q 32 37 32.5 42 Z', h, SW) +
        L('M 34 17 Q 44 12 56 12', 2.2, hi, 'opacity=".8"');
    case 'buzz':
      return P('M 27 38 Q 25 13 50 11.2 Q 72 11 76 25 Q 64 19.5 51 20.5 Q 37 22 31 38 Z', h, SW) + L('M 36 17 Q 46 13 58 14', 1.8, hi, 'opacity=".7"');
    default: return '';
  }
}

function hat(l) {
  const c = l.hatC;
  switch (l.hat) {
    case 'straw':
      return `<path d="M 30 26 Q 50 33 74 25 L 74 30 Q 50 37 30 31 Z" fill="${dark(l.skin, 0.3)}" opacity=".28"/>` + G(E(51, 21, 35, 7.6, '#f2c45a', SW) + L('M 18 21 Q 51 30 84 21', 1.4, '#c99a33', 'opacity=".7"') +
        P('M 31 20 Q 30 1.5 51.5 1.5 Q 72 1.5 72 20 Z', '#f5cf66', SW) + `<path d="M 31.4 13 L 71.6 13 L 71.9 19.6 L 31.1 19.6 Z" fill="${c}"/>` +
        L('M 31.4 13 L 71.6 13', 1.4, dark(c, 0.3), 'opacity=".6"') + gloss(42, 7, 5, 2, -20, 0.6), 'rotate(-6 51 21)');
    case 'captain':
      return P('M 22 24 Q 26 2 52 4 Q 78 2 82 22 Q 72 15 62 20 Q 52 12 42 20 Q 32 15 22 24 Z', c, SW) +
        L('M 25 21.5 Q 33 15.5 42 19 Q 52 11 62 19 Q 71 15.5 79.5 20.5', 2, '#ffcc3a') +
        C(52, 11, 4.2, '#f4efe6', 1.8) + Cn(50.6, 10.6, 1, OL) + Cn(53.4, 10.6, 1, OL) + L('M 47.5 16 L 56.5 18.6 M 56.5 16 L 47.5 18.6', 1.6, '#f4efe6');
    case 'bandana':
      return P('M 25.5 31 Q 23 9 51 8.5 Q 76 8.5 78.5 27 Q 66 19 51 20 Q 36 21 25.5 31 Z', c, SW) +
        P('M 27 25 Q 16 26 12 32 Q 20 33 24 30 Q 18 38 20 42 Q 26 36 29 29 Z', c, 2.4) +
        Cn(44, 15, 1.6, '#fff', 'opacity=".85"') + Cn(56, 12.5, 1.6, '#fff', 'opacity=".85"') + Cn(66, 16, 1.6, '#fff', 'opacity=".85"') + Cn(36, 20, 1.4, '#fff', 'opacity=".85"');
    case 'cap':
      return P('M 26.5 28 Q 26 7.5 51 7.5 Q 75 7.5 76 26 Z', c, SW) + P('M 70 24 Q 87 21.5 93 26.5 Q 84 31 70 29.5 Z', dark(c, 0.2), 2.6) +
        C(51, 8, 2.4, light(c, 0.3), 1.6) + L('M 51 8 L 51 26', 1.4, dark(c, 0.25), 'opacity=".6"') + gloss(40, 13, 4, 2, -25, 0.55);
    case 'beanie':
      return P('M 25 29 Q 22 2 51 2 Q 80 2 77 29 Z', '#f4efe6', SW) + R(24, 22.5, 54, 8.5, 4, c, 2.6) +
        En(40, 12, 3.4, 2.6, dark(c, 0.1)) + En(56, 8, 3.4, 2.6, dark(c, 0.1)) + En(66, 15, 3, 2.4, dark(c, 0.1)) + En(48, 18, 2.6, 2, dark(c, 0.1));
    default: return '';
  }
}

// ---------------- body ----------------
const TORSO = 'M 38 62 Q 39.5 56 47 56 L 56 56 Q 63 56 64 62 L 66 84 Q 66 88.5 61.5 88.5 L 40.5 88.5 Q 36 88.5 36 84 Z';
function torso(l) {
  const sh = l.shirt, sk = l.skin;
  let s = Rn(46, 52, 10, 7, 2, dark(sk, 0.15));
  switch (l.outfit) {
    case 'vest': {
      s += P(TORSO, sk, SW) + L('M 50 66 L 52 72 M 50 72 Q 52 74 54 72', 1.4, dark(sk, 0.3), 'opacity=".7"');
      s += P('M 38 62 Q 39.5 56 47 56 L 48.5 56 L 47 76 L 46 88.5 L 40.5 88.5 Q 36 88.5 36 84 Z', sh, SW);
      s += P('M 57.5 56 Q 63 56 64 62 L 66 84 Q 66 88.5 61.5 88.5 L 58.5 88.5 L 58 74 Z', sh, SW);
      break;
    }
    case 'coat': {
      s += P('M 36 60 Q 38 55 47 55 L 57 55 Q 64 55 65.5 61 L 70 102 Q 60 106 52 102 Q 42 106 32 102 Z', l.shirt, SW);
      s += P('M 46 56 L 56 56 L 57 84 L 45 84 Z', '#f4efe6', 2.4);
      s += P('M 45 55.5 L 51 70 L 44 66 Z', light(l.shirt, 0.2), 2) + P('M 57 55.5 L 52 70 L 59 66 Z', light(l.shirt, 0.2), 2);
      s += L(`M 47 62 L 55 62`, 0.01);
      break;
    }
    case 'suit': {
      s += P(TORSO, sh, SW);
      s += P('M 46 56 L 56 56 L 51.5 72 Z', '#f4efe6', 2.2) + P('M 50 58 L 53 58 L 54 70 L 51.5 74 L 49 70 Z', '#e8384f', 1.8);
      s += C(51.5, 78, 1.3, '#ffcc3a', 1) + C(51.5, 83, 1.3, '#ffcc3a', 1);
      break;
    }
    case 'kimono': {
      s += P(TORSO, sh, SW) + P('M 46 56 L 54 56 L 60 76 L 56 78 Z', light(sh, 0.18), 2.2) + P('M 56 56 L 47.5 74 L 44 70 L 47 56 Z', dark(sh, 0.12), 2);
      s += P('M 36.5 76 L 65.5 76 L 66 84 L 36 84 Z', '#8a2a3a', 2.4);
      break;
    }
    default: { // shirt
      s += P(TORSO, sh, SW) + P('M 46 56 Q 51.5 63 57 56 Z', sk, 2) + L('M 40 70 Q 51 74 63 70', 1.4, dark(sh, 0.18), 'opacity=".6"');
    }
  }
  s += `<path d="M 60 60 Q 64 66 65.5 82 L 61 87 Q 63 72 58 60 Z" fill="${dark(sh, 0.25)}" opacity=".35"/>`;
  // belt / sash
  if (l.outfit === 'vest') s += P('M 36.2 79 L 65.8 79 L 66 85 L 36 85 Z', '#ffcc3a', 2.4) + P('M 39 84 L 37 95 L 41 94 L 43 84 Z', '#ffcc3a', 2);
  else if (l.outfit === 'shirt') s += P('M 36.2 81 L 65.8 81 L 66 86 L 36 86 Z', '#5a3a22', 2.2) + R(48.5, 80.3, 6, 6, 1.4, '#ffcc3a', 1.8);
  if (l.cape) s = P('M 40 57 Q 22 72 24 104 Q 32 108 40 104 L 46 64 Z', l.cape, SW) + `<path d="M 36 66 Q 27 80 28 102 L 33 104 Q 32 82 40 66 Z" fill="${dark(l.cape, 0.25)}" opacity=".6"/>` + s;
  return s;
}

function sleeve(l, back) {
  const sk = back ? dark(l.skin, 0.12) : l.skin;
  const col = l.outfit === 'coat' ? l.shirt : l.shirt;
  const c = back ? dark(col, 0.15) : col;
  return { sk, c, bare: l.outfit === 'vest', short: l.outfit === 'shirt' };
}
function armShape(x0, x1, y1, l, back) {
  // shoulder (x0,63) -> hand (x1,y1)
  const o = sleeve(l, back);
  const d = `M ${x0 - 4.6} 62 Q ${x0 - 5} 58.5 ${x0} 58.5 Q ${x0 + 5} 58.5 ${x0 + 4.8} 62.5 L ${x1 + 3.6} ${y1 - 2} Q ${x1 + 2} ${y1 + 2} ${x1 - 1} ${y1 + 1} L ${x1 - 3.8} ${y1 - 3} Z`;
  let s = P(d, o.bare ? o.sk : o.c, SW);
  if (o.short) s += P(`M ${x0 - 4.6} 62 Q ${x0 - 5} 58.5 ${x0} 58.5 Q ${x0 + 5} 58.5 ${x0 + 4.8} 62.5 L ${x0 + 5.6} 69 L ${x0 - 3.4} 70.5 Z`, o.c, 0) +
    `<path d="M ${(x0 + x1) / 2 - 3.5} ${(63 + y1) / 2 + 1} L ${(x0 + x1) / 2 + 3} ${(63 + y1) / 2 - 1} L ${x1 + 3.6} ${y1 - 2} Q ${x1 + 2} ${y1 + 2} ${x1 - 1} ${y1 + 1} L ${x1 - 3.8} ${y1 - 3} Z" fill="${o.sk}"/>`;
  if (o.short) s += L(`M ${x0 - 3.6} 70.4 L ${x0 + 5.6} 68.8`, SW - 0.6);
  if (l.outfit === 'kimono') s += P(`M ${x1 - 6} ${y1 - 8} L ${x1 + 6} ${y1 - 11} L ${x1 + 7} ${y1 - 3} L ${x1 - 6} ${y1} Z`, o.c, 2.2);
  s += C(x1, y1, 4.6, o.sk, SW);
  return s;
}

function weaponArt(kind) {
  // drawn in arm space; the front hand is at (64, 80)
  const metal = '#e8eef8';
  switch (kind) {
    case 'katana':
      return L('M 61 87 L 68 75', 7) + L('M 61 87 L 68 75', 3.6, '#2f2a3d') + L('M 62.4 84 L 64 82 M 64 81 L 65.6 79 M 65.6 78 L 67 76', 1.2, '#f4efe6') +
        E(68.6, 74, 5.4, 2.4, '#ffcc3a', 2, 'transform="rotate(-58 68.6 74)"') +
        P('M 67 72 Q 75.5 57.5 85.5 43 L 89 45.5 Q 79.5 60.5 71 74.5 Z', metal, 2.4) + L('M 70.2 71.5 Q 78.4 58.4 87 45.4', 1.2, '#fff', 'opacity=".9"');
    case 'sword':
      return L('M 62 86 L 67 77', 7) + L('M 62 86 L 67 77', 3.6, '#7a4a2a') + P('M 60 74 L 74 80 L 75 78 L 61 72 Z', '#ffcc3a', 2) +
        P('M 66 75 Q 70 58 84 48 Q 86 50 85 53 Q 76 62 70 78 Z', metal, 2.6) + L('M 69 72 Q 74 60 83 51', 1, '#fff', 'opacity=".9"');
    case 'staff':
      return L('M 54 102 L 76 52', 7) + L('M 54 102 L 76 52', 3.6, '#a8683a') + L('M 55.6 98.4 L 57.4 94.4 M 73 59 L 74.6 55.4', 3.6, '#ffcc3a');
    case 'pistol':
      return R(63, 74, 18, 5, 1.6, '#5a6070', 2.2) + R(79, 73, 3, 7, 1, '#3a3a4a', 1.6) + P('M 62 76 L 68 76 L 66 86 L 61 85 Z', '#7a4a2a', 2.2) + L('M 65 79 Q 67 82 64 82', 1.2);
    default: return '';
  }
}
function armFront(l) {
  const fist = l.weapon === 'none';
  return weaponArt(l.weapon) + armShape(58, 64, 80, l, false) + (fist ? C(64.5, 80.5, 5.8, l.skin, SW) + L('M 62 78 L 67 78 M 62 81 L 67 81', 1.2, dark(l.skin, 0.3)) : '');
}
function armBack(l) { return armShape(43, 38, 80, l, true); }

function leg(x, l, back) {
  const pants = back ? dark(l.pants, 0.18) : l.pants, sk = back ? dark(l.skin, 0.12) : l.skin;
  let s = '';
  if (l.legs === 'shorts') {
    s += P(`M ${x - 4.6} 86 L ${x - 4.6} 101 Q ${x - 4.6} 103 ${x - 2.6} 103 L ${x + 2.6} 103 Q ${x + 4.6} 103 ${x + 4.6} 101 L ${x + 4.6} 86 Z`, sk, SW);
    s += P(`M ${x - 5.4} 85 L ${x - 5.6} 95 L ${x + 5.6} 95 L ${x + 5.4} 85 Z`, pants, SW) + Rn(x - 5.4, 93, 11, 2.4, 1, light(pants, 0.25));
    s += P(`M ${x - 4} 102 L ${x + 7.5} 102 Q ${x + 9.5} 105.5 ${x + 7} 107.5 L ${x - 4.5} 107.5 Q ${x - 6} 105 ${x - 4} 102 Z`, back ? '#7a5a3a' : '#a8683a', SW - 0.4) +
      L(`M ${x - 2} 102.4 L ${x + 3.6} 105`, 1.4, back ? '#5a3a22' : '#7a4a2a');
  } else {
    s += P(`M ${x - 5.4} 85 L ${x - 5} 101 L ${x + 5} 101 L ${x + 5.4} 85 Z`, pants, SW);
    s += P(`M ${x - 5.4} 99.5 L ${x + 5.2} 99.5 Q ${x + 10} 101 ${x + 9} 107.5 L ${x - 5.6} 107.5 Z`, back ? '#2a2030' : '#3a2e44', SW - 0.4) + Rn(x - 3.6, 101, 6, 1.6, 0.8, '#fff', 'opacity=".25"');
  }
  return s;
}

function bodyArt(l) {
  return hairBack(l) + torso(l) + face(l) + hairFront(l) + hat(l);
}

export function chibiParts(l) {
  return {
    legB: svg(CW, CH, leg(CPIV.legB[0], l, true)),
    legF: svg(CW, CH, leg(CPIV.legF[0], l, false)),
    armB: svg(CW, CH, armBack(l)),
    body: svg(CW, CH, bodyArt(l)),
    armF: svg(CW, CH, armFront(l)),
    full: svg(CW, CH, armBack(l) + leg(CPIV.legB[0], l, true) + leg(CPIV.legF[0], l, false) + bodyArt(l) + armFront(l)),
  };
}
