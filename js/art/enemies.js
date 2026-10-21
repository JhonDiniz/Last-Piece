// Human enemies, built from a small rig so they can walk and swing weapons.
// Every enemy is split into parts drawn in the same 120x130 space:
//   legB, legF (pivot at the hip), body (static), arm (pivot at the shoulder).
import { OL, svg, nid, mix, dark, light, lin, P, E, C, Cn, En, R, Rn, L, G, gloss, star } from './kit.js';

export const EW = 120, EH = 130, EFEET = 125;
export const PIV = { legB: [74, 96], legF: [62, 96], arm: [60, 72] };

const SKINS = ['#ffd2a6', '#f2bb8c', '#d59a6a', '#a8714a', '#7a4f33'];

// ---------- pieces ----------
function leg(x, pants, shoe, back) {
  const p = back ? dark(pants, 0.18) : pants, s = back ? dark(shoe, 0.15) : shoe;
  return P(`M ${x - 5} 94 L ${x - 5} 113 Q ${x - 5} 116 ${x - 2} 116 L ${x + 2} 116 Q ${x + 5} 116 ${x + 5} 113 L ${x + 5} 94 Z`, p, 3.6) +
    P(`M ${x - 10} 114 Q ${x - 11} 124 ${x - 3} 124 L ${x + 6} 124 Q ${x + 8} 118 ${x + 4} 113 Z`, s, 3.6) +
    Rn(x - 8, 115, 5, 2.4, 1.2, '#fff', 'opacity=".3"');
}

function torso(spec) {
  const sh = spec.shirt, st = spec.torso || 'shirt';
  const base = 'M 50 70 Q 52 63 60 63 L 78 63 Q 86 63 87 71 L 90 96 Q 90 101 85 101 L 52 101 Q 47 101 48 96 Z';
  let s = '';
  if (st === 'robe') {
    s += P('M 52 68 Q 54 62 62 62 L 76 62 Q 84 62 85 70 L 96 120 Q 96 124 90 124 L 46 124 Q 40 124 41 120 Z', sh, 4);
    s += `<path d="M 80 66 L 92 120 L 96 121 L 85 68 Z" fill="${dark(sh, 0.25)}" opacity=".6"/>`;
    s += P('M 46 92 L 92 92 L 93 99 L 45 99 Z', spec.belt || '#ffcc3a', 3);
    s += L('M 66 64 L 66 90', 2.4, light(sh, 0.3));
    return s;
  }
  s += P(base, sh, 4);
  s += `<path d="M 80 66 Q 86 70 87 80 L 89 98 L 82 99 Z" fill="${dark(sh, 0.25)}" opacity=".55"/>`;
  if (st === 'overalls') {
    const o = spec.over || '#4f6fd8';
    s += P('M 54 78 L 82 78 L 86 98 Q 86 101 82 101 L 54 101 Q 50 101 50 97 Z', o, 3.4);
    s += L('M 57 79 L 59 64', 3.4, o) + L('M 79 79 L 77 64', 3.4, o);
    s += C(58, 80, 2, '#ffcc3a', 1.6) + C(78, 80, 2, '#ffcc3a', 1.6) + Rn(63, 85, 10, 7, 2, dark(o, 0.2));
  } else if (st === 'armor') {
    const a = spec.armor || '#b8c4d6';
    s += P('M 51 70 Q 53 64 61 64 L 77 64 Q 85 64 86 71 L 88 92 Q 69 100 50 92 Z', a, 3.6);
    s += L('M 68 66 L 68 94', 2.4, dark(a, 0.25)) + gloss(58, 74, 5, 3, -40, 0.7);
    s += P('M 49 92 Q 69 100 89 92 L 90 99 Q 69 106 48 99 Z', dark(a, 0.15), 3);
  } else if (st === 'vest') {
    const v = spec.vest || '#7a4a2a';
    s += P('M 50 70 Q 52 63 60 63 L 62 63 L 60 101 L 52 101 Q 47 101 48 96 Z', v, 3.2);
    s += P('M 76 63 L 78 63 Q 86 63 87 71 L 90 96 Q 90 101 85 101 L 78 101 Z', v, 3.2);
  } else if (st === 'apron') {
    s += P('M 55 74 L 82 74 L 86 101 L 52 101 Z', spec.apron || '#5a3a22', 3.2) + L('M 56 74 L 64 64 M 81 74 L 74 64', 2.6, spec.apron || '#5a3a22');
  } else if (st === 'fur') {
    s += P('M 48 68 Q 68 58 90 68 L 92 76 Q 68 70 46 76 Z', '#f2ece0', 3.2);
  }
  if (st !== 'robe' && st !== 'apron') {
    s += P('M 48 91 L 90 91 L 90 97 L 48 97 Z', spec.belt || '#6b4426', 3);
    s += R(63, 90, 9, 8, 1.5, '#ffcc3a', 2.4);
  }
  if (st === 'shirt' || st === 'vest') s += P('M 60 64 L 69 72 L 78 64 Z', light(sh, 0.25), 2.6);
  return s;
}

function backArm(spec) {
  const sl = spec.torso === 'armor' ? (spec.armor || '#b8c4d6') : spec.torso === 'robe' ? spec.shirt : spec.shirt;
  return P('M 78 66 Q 92 68 94 86 Q 95 92 89 92 Q 85 90 83 80 Z', dark(sl, 0.15), 3.6) + C(90, 92, 5, dark(spec.skin, 0.12), 3.2);
}

function hair(spec) {
  const h = spec.hairC || '#5a3a22';
  switch (spec.hair) {
    case 'short': return P('M 43 34 Q 48 14 70 14 Q 94 15 95 40 Q 88 30 78 31 Q 62 25 43 34 Z', h, 3.4);
    case 'spiky': return P('M 42 34 L 44 22 L 50 26 L 54 12 L 62 20 L 70 8 L 76 19 L 86 12 L 87 24 L 96 24 L 94 40 Q 86 30 76 31 Q 60 25 42 34 Z', h, 3.4);
    case 'long': return P('M 42 36 Q 46 12 70 12 Q 98 14 96 46 L 98 66 Q 90 62 88 50 Q 86 32 72 30 Q 56 28 42 36 Z', h, 3.4);
    case 'bun': return C(86, 18, 8, h, 3.4) + P('M 43 34 Q 48 14 70 14 Q 94 15 95 40 Q 88 30 78 31 Q 62 25 43 34 Z', h, 3.4);
    default: return '';
  }
}

function face(spec) {
  const sk = spec.skin;
  let s = '';
  s += E(93, 46, 5, 7, sk, 3.4) + En(93, 46, 2, 3.5, dark(sk, 0.25));
  s += C(68, 42, 26, sk, 4);
  s += `<path d="M 82 22 Q 98 38 90 60 Q 84 66 76 68 Q 92 50 82 22 Z" fill="${dark(sk, 0.3)}" opacity=".35"/>`;
  s += hair(spec);
  if (spec.mask) {
    s += P('M 42 46 Q 46 64 66 68 Q 84 66 92 50 Q 68 56 42 46 Z', spec.mask, 3.2);
  }
  // eyes
  const ey = 45;
  if (spec.eyes === 'closed') {
    s += L(`M 51 ${ey} L 59 ${ey}`, 3.6) + L(`M 66 ${ey} L 74 ${ey}`, 3.6);
  } else {
    s += En(55, ey, 3.5, 4.8, OL) + En(70, ey, 3.5, 4.8, OL) + Cn(56.2, ey - 1.8, 1.3, '#fff') + Cn(71.2, ey - 1.8, 1.3, '#fff');
  }
  const bc = spec.browC || OL;
  s += L(`M 48 ${ey - 9} L 60 ${ey - 5}`, 3.6, bc) + L(`M 65 ${ey - 5} L 77 ${ey - 9}`, 3.6, bc);
  // nose
  s += E(46, 51, 5.5, 4.6, sk, 3.2) + gloss(45, 49.5, 2, 1.2, -20, 0.6);
  if (!spec.mask) {
    if (spec.mouth === 'grin') s += P('M 50 58 Q 58 66 66 58 Z', '#fff', 2.8) + L('M 54 60 L 54 62.5 M 58 60.5 L 58 63.5 M 62 60 L 62 62.5', 1.2, '#c9c9dc');
    else if (spec.mouth === 'frown') s += L('M 51 62 Q 57 57 63 62', 3.2);
    else s += P('M 50 58 Q 57 68 64 58 Z', '#7a2140', 2.8) + En(57, 62.5, 3, 1.6, '#ff7b9c');
  }
  if (spec.beard) {
    const b = spec.beardC || spec.hairC || '#5a3a22';
    if (spec.beard === 'full') s += P('M 42 50 Q 44 72 62 76 Q 80 76 90 58 Q 86 64 78 62 Q 66 68 56 66 Q 48 62 42 50 Z', b, 3.2) + P('M 50 58 Q 57 66 64 58 Z', '#7a2140', 2.4);
    else if (spec.beard === 'braid') s += P('M 44 54 Q 48 72 58 74 Q 70 74 80 62 Q 70 66 58 64 Q 50 62 44 54 Z', b, 3.2) + P('M 54 72 L 52 88 L 58 88 L 60 72 Z', b, 2.8) + C(55, 89, 2.5, '#ffcc3a', 1.8);
    else if (spec.beard === 'stache') s += P('M 46 56 Q 52 52 58 56 Q 64 52 70 56 Q 64 60 58 58 Q 52 60 46 56 Z', b, 2.6);
  }
  return s;
}

function headwear(spec) {
  const c = spec.hatC;
  switch (spec.hat) {
    case 'straw':
      return P('M 47 24 Q 48 4 68 4 Q 88 4 89 24 Z', '#f5cf66', 3.6) + Rn(48, 17, 40, 6, 2, c || '#d8384a') +
        E(67, 25, 37, 7.5, '#f2c45a', 3.6) + L('M 36 25 Q 67 32 98 25', 1.6, '#c99a33', 'opacity=".7"');
    case 'hood': {
      const h = c || '#3f8f4a';
      return P('M 38 52 Q 34 10 68 10 Q 102 12 100 50 Q 102 68 96 74 Q 94 52 86 40 Q 70 26 50 34 Q 42 40 38 52 Z', h, 3.8) +
        P('M 96 42 Q 112 40 116 58 Q 106 54 98 56 Z', dark(h, 0.2), 3.2);
    }
    case 'cap':
      return P('M 42 34 Q 44 12 70 12 Q 96 12 96 34 Q 70 28 42 34 Z', c || '#3f6fd8', 3.6) + P('M 46 31 Q 30 30 24 36 Q 34 38 48 35 Z', dark(c || '#3f6fd8', 0.2), 3.2);
    case 'helmet':
      return P('M 40 36 Q 42 10 68 10 Q 96 10 97 36 Q 68 30 40 36 Z', c || '#b8c4d6', 3.6) + P('M 38 36 Q 68 28 99 36 L 98 41 Q 68 34 39 41 Z', dark(c || '#b8c4d6', 0.2), 3) + gloss(56, 18, 7, 3, -20, 0.7);
    case 'knight': {
      const k = c || '#c3cfdf';
      return P('M 40 50 Q 36 10 68 10 Q 100 10 98 48 L 96 66 Q 68 74 42 66 Z', k, 4) +
        `<path d="M 86 16 Q 100 30 96 64 L 90 66 Q 94 34 86 16 Z" fill="${dark(k, 0.3)}" opacity=".5"/>` +
        Rn(42, 40, 40, 6, 3, OL) + L('M 46 52 L 76 52 M 46 58 L 74 58', 2.4, dark(k, 0.35)) +
        gloss(54, 22, 8, 4, -25, 0.75) + C(90, 46, 2.4, dark(k, 0.2), 1.6) +
        P('M 64 12 Q 70 -6 92 -4 Q 84 4 86 14 Q 76 8 64 12 Z', spec.plume || '#e8384f', 3.2);
    }
    case 'wizard': {
      const w = c || '#4a5fd0';
      return P('M 34 30 Q 68 18 102 30 Q 68 40 34 30 Z', dark(w, 0.1), 3.6) +
        P('M 46 28 Q 56 0 80 -10 Q 86 -12 86 -6 Q 78 6 90 28 Z', w, 3.6) + `<path d="${star(70, 14, 5, 2.2)}" fill="#ffe680"/>` + Cn(60, 22, 1.6, '#ffe680');
    }
    case 'bandana':
      return P('M 40 34 Q 44 12 70 12 Q 96 14 96 36 Q 68 26 40 34 Z', c || '#d8384a', 3.6) + P('M 94 30 Q 108 26 112 36 Q 104 36 100 40 Z', c || '#d8384a', 3) + Cn(56, 22, 2, '#fff', 'opacity=".8"') + Cn(72, 18, 2, '#fff', 'opacity=".8"') + Cn(84, 24, 2, '#fff', 'opacity=".8"');
    case 'miner':
      return P('M 40 36 Q 42 10 68 10 Q 96 10 97 36 Z', c || '#ffc93a', 3.6) + P('M 36 36 L 100 36 L 99 41 L 37 41 Z', dark(c || '#ffc93a', 0.2), 3) + C(54, 22, 6, '#fff7c2', 3) + Cn(54, 22, 3, '#fff');
    case 'viking':
      return P('M 40 36 Q 42 10 68 10 Q 96 10 97 36 Z', c || '#a9b5c8', 3.6) + P('M 38 34 L 98 34 L 97 40 L 39 40 Z', '#8b5a2b', 3) +
        P('M 44 24 Q 26 18 26 -2 Q 36 12 48 14 Z', '#fff4dc', 3) + P('M 92 24 Q 110 18 110 -2 Q 100 12 88 14 Z', '#fff4dc', 3);
    case 'turban':
      return P('M 40 36 Q 36 10 68 8 Q 100 10 96 36 Q 68 28 40 36 Z', c || '#f4efe6', 3.6) + L('M 44 26 Q 68 16 94 26 M 46 32 Q 68 22 94 30', 2.2, dark(c || '#f4efe6', 0.2)) + C(60, 22, 4.5, '#e8384f', 2.6);
    case 'fur':
      return P('M 38 38 Q 34 8 68 8 Q 102 8 98 38 Q 68 30 38 38 Z', c || '#7a5230', 3.6) + P('M 36 32 Q 68 22 100 32 L 100 40 Q 68 32 36 40 Z', '#f2ece0', 3.2) + P('M 94 36 Q 104 50 100 62 Q 92 56 90 40 Z', '#f2ece0', 3);
    case 'crown':
      return P('M 48 18 L 48 0 L 56 8 L 68 -6 L 80 8 L 88 0 L 88 18 Z', '#ffcc3a', 3.4) + C(68, 12, 3, '#e8384f', 2);
    case 'chef':
      return P('M 48 24 L 48 14 Q 36 12 40 2 Q 44 -8 56 -4 Q 62 -14 74 -6 Q 88 -10 88 2 Q 96 10 86 14 L 86 24 Z', '#fff', 3.4);
    default: return '';
  }
}

// weapons are drawn in arm space (hand at 46,89)
function weapon(kind, c) {
  const wood = '#a8683a', metal = '#d3dbe8';
  switch (kind) {
    case 'pitchfork':
      return L('M 54 108 L 22 40', 7) + L('M 54 108 L 22 40', 3.6, wood) +
        L('M 31 35.7 L 13 44.3', 6) + L('M 25 23 L 31 35.7 M 16 27.3 L 22 40 M 7 31.6 L 13 44.3', 6) +
        L('M 31 35.7 L 13 44.3', 3, metal) + L('M 25 23 L 31 35.7 M 16 27.3 L 22 40 M 7 31.6 L 13 44.3', 3, metal);
    case 'axe':
      return L('M 54 106 L 34 46', 7) + L('M 54 106 L 34 46', 3.6, wood) +
        P('M 36 52 Q 14 44 16 30 Q 30 34 32 40 Q 34 46 38 50 Z', metal, 3.4) + L('M 18 33 Q 20 42 30 46', 2, '#fff', 'opacity=".7"');
    case 'bow':
      return L('M 46 52 Q 18 89 46 126', 7) + L('M 46 52 Q 18 89 46 126', 3.6, wood) + L('M 46 54 L 46 124', 1.6, '#f4efe6') +
        L('M 46 88 L 14 86', 4) + L('M 46 88 L 14 86', 1.8, '#f4efe6') + P('M 14 86 L 20 82 L 20 90 Z', metal, 1.8);
    case 'club':
      return P('M 50 96 L 42 66 Q 34 52 40 44 Q 50 38 54 50 L 56 94 Z', wood, 3.6) + Cn(42, 52, 2, dark(wood, 0.3)) + Cn(48, 60, 1.6, dark(wood, 0.3)) + gloss(44, 50, 3, 1.6, -60, 0.4);
    case 'sword':
      return P('M 44 84 L 20 42 L 22 36 L 28 40 L 50 82 Z', metal, 3.4) + L('M 24 42 L 46 82', 1.6, '#fff', 'opacity=".8"') +
        L('M 38 88 L 54 78', 6) + L('M 38 88 L 54 78', 3, c || '#ffcc3a') + L('M 48 90 L 51 96', 5) + C(52, 97, 2.6, c || '#ffcc3a', 2);
    case 'bigsword':
      return P('M 44 84 L 8 14 L 12 4 L 22 10 L 54 80 Z', metal, 3.6) + L('M 14 12 L 48 80', 2, '#fff', 'opacity=".8"') +
        L('M 34 90 L 58 76', 7) + L('M 34 90 L 58 76', 3.6, c || '#ffcc3a') + C(52, 98, 3, c || '#ffcc3a', 2);
    case 'staff':
      return L('M 50 124 L 40 34', 7) + L('M 50 124 L 40 34', 3.6, '#7a4a2a') + C(39, 28, 8, c || '#7ee0ff', 3.4) + gloss(37, 25, 3, 2, -30, 0.9) +
        `<circle cx="39" cy="28" r="13" fill="${c || '#7ee0ff'}" opacity=".25"/>`;
    case 'dagger':
      return P('M 44 86 L 18 80 L 16 84 L 44 92 Z', metal, 3) + L('M 46 82 L 46 96', 5) + L('M 46 82 L 46 96', 2.4, c || '#ffcc3a');
    case 'pickaxe':
      return L('M 54 106 L 36 48', 7) + L('M 54 106 L 36 48', 3.6, wood) + P('M 14 40 Q 36 30 58 50 Q 36 40 14 46 Z', metal, 3.2);
    case 'spear':
      return L('M 62 112 L 18 34', 7) + L('M 62 112 L 18 34', 3.6, wood) + P('M 22 40 L 8 18 L 26 32 Z', metal, 3) + P('M 24 42 L 30 38 L 32 44 Z', c || '#e8384f', 2);
    case 'scimitar':
      return P('M 44 84 Q 16 70 18 40 Q 30 60 50 80 Z', metal, 3.4) + L('M 20 46 Q 24 64 44 80', 1.6, '#fff', 'opacity=".8"') + L('M 38 88 L 54 80', 6) + L('M 38 88 L 54 80', 3, c || '#ffcc3a');
    case 'hammer':
      return L('M 54 108 L 38 50', 7) + L('M 54 108 L 38 50', 3.6, wood) + R(20, 30, 32, 22, 4, '#8a93a6', 3.6) + Rn(22, 32, 28, 6, 3, '#fff', 'opacity=".3"');
    case 'torch':
      return L('M 52 106 L 40 56', 7) + L('M 52 106 L 40 56', 3.6, wood) + P('M 40 58 Q 30 44 38 30 Q 40 40 44 38 Q 46 28 52 24 Q 52 40 48 56 Z', '#ff8a2a', 3) + `<path d="M 42 54 Q 38 46 42 38 Q 46 44 48 42 Q 48 50 46 54 Z" fill="#ffd23f"/>`;
    case 'wand':
      return L('M 46 90 L 26 60', 6) + L('M 46 90 L 26 60', 3, '#3a2a5a') + `<path d="${star(24, 56, 8, 3.6)}" fill="${c || '#ffe680'}" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round"/>`;
    default: return '';
  }
}

function frontArm(spec) {
  const sl = spec.torso === 'armor' ? (spec.armor || '#b8c4d6') : spec.shirt;
  return weapon(spec.weapon, spec.wc) +
    P('M 64 66 Q 52 68 46 82 Q 43 89 49 91 Q 54 90 58 82 Q 62 76 66 72 Z', sl, 3.6) +
    C(46.5, 89, 5.6, spec.skin, 3.4);
}

function shield(spec) {
  if (!spec.shield) return '';
  const c = spec.shield;
  return P('M 46 70 Q 58 66 70 70 L 69 88 Q 66 100 58 104 Q 50 100 47 88 Z', c, 3.8) +
    P('M 50 74 Q 58 71 66 74 L 65 87 Q 63 96 58 99 Q 53 96 51 87 Z', light(c, 0.25), 0) +
    C(58, 84, 4, '#ffcc3a', 2.4);
}

function cape(spec) {
  if (!spec.cape) return '';
  return P('M 70 62 Q 100 64 108 120 Q 92 126 78 118 Q 82 92 70 62 Z', spec.cape, 3.6) +
    `<path d="M 86 70 Q 102 84 104 116 L 98 118 Q 96 88 86 70 Z" fill="${dark(spec.cape, 0.3)}" opacity=".5"/>`;
}

export function humanParts(spec) {
  spec = Object.assign({ skin: SKINS[0], shirt: '#c98a4a', pants: '#4a5aa8', shoe: '#5a3a22', hair: 'short', mouth: 'shout' }, spec);
  const head = spec.hat === 'knight' ? headwear(spec) : face(spec) + headwear(spec);
  const body = cape(spec) + backArm(spec) + torso(spec) + head + shield(spec);
  return {
    legB: svg(EW, EH, leg(PIV.legB[0], spec.pants, spec.shoe, true)),
    legF: svg(EW, EH, leg(PIV.legF[0], spec.pants, spec.shoe, false)),
    body: svg(EW, EH, body),
    arm: svg(EW, EH, frontArm(spec)),
    full: svg(EW, EH, leg(PIV.legB[0], spec.pants, spec.shoe, true) + leg(PIV.legF[0], spec.pants, spec.shoe, false) + body + frontArm(spec)),
    ranged: spec.weapon === 'bow' || spec.weapon === 'staff' || spec.weapon === 'wand',
  };
}

// ---------- roster ----------
// archetypes: base specs. Regions tint them through `variant`.
export const ARCHETYPES = {
  campones: { name: 'Camponês', hat: 'straw', shirt: '#d98b4a', torso: 'overalls', over: '#4f6fd8', pants: '#3f56b0', weapon: 'pitchfork', hair: 'short', beard: 'stache' },
  lenhador: { name: 'Lenhador', hat: 'none', hair: 'spiky', hairC: '#c0562b', shirt: '#d8384a', torso: 'shirt', pants: '#3a4a7a', weapon: 'axe', beard: 'full', beardC: '#c0562b' },
  arqueiro: { name: 'Arqueira', hat: 'hood', hatC: '#3f8f4a', hair: 'long', hairC: '#f2c14a', shirt: '#5aa65a', torso: 'vest', vest: '#7a4a2a', pants: '#5a3a22', weapon: 'bow', mouth: 'frown', range: true },
  escudeiro: { name: 'Escudeiro', hat: 'helmet', shirt: '#4f7fd8', torso: 'shirt', pants: '#5a4a3a', weapon: 'club', shield: '#a8683a' },
  cavaleiro: { name: 'Cavaleiro', hat: 'knight', torso: 'armor', armor: '#c3cfdf', shirt: '#c3cfdf', pants: '#8a93a6', shoe: '#5f6678', weapon: 'sword', shield: '#4f7fd8' },
  mago: { name: 'Mago', hat: 'wizard', hatC: '#4a5fd0', torso: 'robe', shirt: '#4a5fd0', belt: '#ffcc3a', weapon: 'staff', beard: 'full', beardC: '#f4efe6', hair: 'none', range: true },
  bandido: { name: 'Bandido', hat: 'bandana', hatC: '#2f2a3d', mask: '#2f2a3d', shirt: '#7a4a8a', torso: 'vest', vest: '#3a2a3a', pants: '#2f2a3d', weapon: 'dagger', hair: 'none', fast: true },
  mineiro: { name: 'Mineiro', hat: 'miner', shirt: '#8a7a6a', torso: 'overalls', over: '#5a6a7a', pants: '#4a5a6a', weapon: 'pickaxe', beard: 'stache', beardC: '#3a2a22' },
  viking: { name: 'Viking', hat: 'viking', shirt: '#8a5a3a', torso: 'fur', pants: '#5a4a3a', weapon: 'axe', beard: 'braid', beardC: '#f2a03a', hair: 'long', hairC: '#f2a03a' },
  lanceiro: { name: 'Lanceiro', hat: 'helmet', hatC: '#d8a03a', shirt: '#c0392b', torso: 'armor', armor: '#d8a03a', pants: '#6a3a2a', weapon: 'spear' },
  nomade: { name: 'Nômade', hat: 'turban', shirt: '#e8d8b8', torso: 'vest', vest: '#2a7f8a', pants: '#c98a4a', weapon: 'scimitar', beard: 'stache', skin: '#c98a5c' },
  cacador: { name: 'Caçador', hat: 'fur', shirt: '#8a5a3a', torso: 'fur', pants: '#4a3a2a', weapon: 'spear', beard: 'full', beardC: '#6a4a2a' },
  ferreiro: { name: 'Ferreiro', hat: 'none', hair: 'bun', hairC: '#3a2a22', shirt: '#c9b8a0', torso: 'apron', apron: '#4a3a2a', pants: '#3a3a4a', weapon: 'hammer', beard: 'full', beardC: '#3a2a22' },
  tocheiro: { name: 'Tocheiro', hat: 'cap', hatC: '#8a2a2a', shirt: '#3a3a4a', torso: 'shirt', pants: '#2a2a3a', weapon: 'torch' },
  feiticeira: { name: 'Feiticeira', hat: 'wizard', hatC: '#7a3ab0', torso: 'robe', shirt: '#7a3ab0', belt: '#4cc9f0', weapon: 'wand', hair: 'long', hairC: '#2a1a3e', mouth: 'grin', range: true },
};

export const BOSSES = {
  capitao: { name: 'Capitão da Guarda', hat: 'knight', torso: 'armor', armor: '#ffd36a', plume: '#4cc9f0', shirt: '#ffd36a', pants: '#a8823a', shoe: '#6b4426', weapon: 'bigsword', wc: '#e8384f', cape: '#c0392b', shield: '#c0392b' },
  fazendeiro: { name: 'Fazendeirão', hat: 'straw', hatC: '#4f6fd8', shirt: '#e8eef8', torso: 'overalls', over: '#c0392b', pants: '#a83226', weapon: 'club', beard: 'full', beardC: '#8a5a3a', hair: 'short', hairC: '#8a5a3a', skin: '#f2bb8c' },
  bruxa: { name: 'Bruxa do Brejo', hat: 'wizard', hatC: '#3a8a4a', torso: 'robe', shirt: '#2f6a3a', belt: '#b0f04a', weapon: 'staff', wc: '#b0f04a', hair: 'long', hairC: '#c0c0d0', mouth: 'grin', skin: '#b8e0a0', cape: '#3a2a4a' },
  sultao: { name: 'Sultão das Dunas', hat: 'turban', hatC: '#ffd36a', shirt: '#7a3ab0', torso: 'vest', vest: '#ffcc3a', pants: '#e8384f', weapon: 'scimitar', wc: '#4cc9f0', beard: 'full', beardC: '#2a1a12', skin: '#c98a5c', cape: '#4a2a8a' },
  yeti: { name: 'Caçador do Gelo', hat: 'fur', hatC: '#e8eef8', shirt: '#5a8ab8', torso: 'fur', pants: '#3a4a6a', weapon: 'spear', wc: '#7ee0ff', beard: 'full', beardC: '#f4efe6', cape: '#e8eef8' },
  comandante: { name: 'Comandante de Ferro', hat: 'knight', hatC: '#7a8496', plume: '#ffcc3a', torso: 'armor', armor: '#7a8496', shirt: '#7a8496', pants: '#4a5266', shoe: '#2f3446', weapon: 'bigsword', wc: '#7a3ab0', cape: '#2f2a3d', shield: '#3a3f5a' },
  ferreiro: { name: 'Mestre Forjador', hat: 'none', hair: 'spiky', hairC: '#ff6a2a', shirt: '#5a3a2a', torso: 'apron', apron: '#2a1a12', pants: '#3a2a2a', weapon: 'hammer', beard: 'full', beardC: '#ff6a2a', skin: '#d59a6a' },
  paladino: { name: 'Paladino Celeste', hat: 'crown', torso: 'armor', armor: '#f4efe6', shirt: '#f4efe6', pants: '#c9b06a', shoe: '#8a6a2a', weapon: 'bigsword', wc: '#4cc9f0', hair: 'long', hairC: '#ffe680', cape: '#4cc9f0', shield: '#ffcc3a' },
};

// recolour a spec for a given cycle/region so later stages look tougher
export function variant(spec, tier) {
  if (!tier) return spec;
  const s = Object.assign({}, spec);
  const tints = ['#e8384f', '#3a3f8a', '#2a7f5a', '#8a3ab0', '#d88a2a'];
  const t = tints[(tier - 1) % tints.length];
  if (s.shirt) s.shirt = mix(s.shirt, t, 0.45);
  if (s.pants) s.pants = mix(s.pants, t, 0.3);
  if (s.over) s.over = mix(s.over, t, 0.4);
  if (s.hatC) s.hatC = mix(s.hatC, t, 0.35);
  return s;
}

// ---------- raid buildings (single body sprite, same 120x130 space, base at y=125) ----------
export function buildingSVG(kind, tint = 0) {
  const ol = OL;
  const roofs = ['#d8584a', '#4f6fd8', '#8a5a3a', '#3fa85a'];
  const roof = roofs[tint % roofs.length];
  let s = '';
  if (kind === 'casa') {
    s = R(22, 70, 76, 55, 3, '#f0dcb4', 4) + P('M 12 74 L 60 30 L 108 74 Z', roof, 4) + R(48, 92, 22, 33, 3, '#8a5a3a', 3.4) + R(76, 82, 16, 14, 2, '#ffe9a8', 3) + R(28, 82, 14, 14, 2, '#ffe9a8', 3) + R(78, 40, 10, 20, 2, '#a86a4a', 3);
  } else if (kind === 'celeiro') {
    s = R(14, 66, 92, 59, 3, '#c9563a', 4) + P('M 6 70 L 30 36 L 90 36 L 114 70 Z', '#8a3a2a', 4) + R(42, 86, 36, 39, 2, '#a8402a', 3.4) + L('M 42 86 L 78 125 M 78 86 L 42 125', 3.4, '#f4efe6') + C(60, 54, 7, '#f4efe6', 3);
  } else if (kind === 'torre') {
    s = R(36, 40, 48, 85, 3, '#b8b8c8', 4) + P('M 30 44 L 60 4 L 90 44 Z', roof, 4) + R(52, 60, 16, 20, 7, '#3a3050', 3) + R(50, 100, 20, 25, 3, '#8a5a3a', 3) + L('M 36 84 L 84 84', 2.4, '#9a9aae') + P('M 60 4 L 60 -6', 'none', 3) + P('M 60 -6 L 74 -2 L 60 2 Z', '#e8384f', 2.4);
  } else if (kind === 'moinho') {
    s = P('M 40 125 L 46 50 L 74 50 L 80 125 Z', '#e8d8b8', 4) + P('M 42 52 L 60 30 L 78 52 Z', roof, 4) + R(52, 100, 16, 25, 3, '#8a5a3a', 3) +
      [20, 110, 200, 290].map(a => `<rect x="57" y="4" width="8" height="34" fill="#f4efe6" stroke="${ol}" stroke-width="3" transform="rotate(${a} 60 40)"/>`).join('') + C(60, 40, 4, ol, 0);
  } else {
    s = R(10, 60, 100, 65, 3, '#e8d0a0', 4) + P('M 4 64 L 60 22 L 116 64 Z', roof, 4) + R(48, 34, 24, 26, 3, '#f4efe6', 3) + C(60, 46, 7, '#fff', 2.4) + L('M 60 46 L 60 41 M 60 46 L 64 47', 1.8) +
      R(46, 92, 28, 33, 12, '#8a5a3a', 3.4) + R(18, 80, 16, 16, 2, '#ffe9a8', 3) + R(86, 80, 16, 16, 2, '#ffe9a8', 3) + P('M 60 22 L 60 8', 'none', 3) + P('M 60 8 L 78 12 L 60 17 Z', '#ffcc3a', 2.4);
  }
  return svg(EW, EH, s);
}
export const BUILDING_NAMES = { casa: 'Casa', celeiro: 'Celeiro', torre: 'Torre de vigia', moinho: 'Moinho', prefeitura: 'Prefeitura' };

// ---------- the Mole King (Rei Toupeira) uses the human rig layout ----------
export function moleParts() {
  const fur = '#8a5a3a', belly = '#d8a878';
  const lb = P('M 68 100 L 66 120 L 82 124 L 84 104 Z', dark(fur, 0.2), 3.6);
  const lf = P('M 52 100 L 46 120 L 64 124 L 66 104 Z', fur, 3.6) + L('M 48 124 L 46 128 M 54 125 L 53 129 M 60 125 L 60 129', 2.4, '#f4efe6');
  const bd = (
    P('M 84 70 Q 104 76 100 96 Q 94 110 86 104 Z', dark(fur, 0.15), 3.6) +
    E(66, 78, 34, 32, fur, 4.4) + E(58, 86, 20, 18, belly, 0) +
    E(58, 40, 30, 26, fur, 4.4) + `<path d="M 74 20 Q 92 30 88 56 Q 84 62 78 60 Q 88 40 74 20 Z" fill="${dark(fur, 0.3)}" opacity=".4"/>` +
    E(38, 46, 10, 7, '#ff8aa8', 3.4) + gloss(35, 44, 3, 1.6, -20, 0.8) +
    L('M 46 34 L 54 37', 4) + L('M 62 37 L 70 34', 4) + En(51, 41, 2.4, 1.6, OL) + En(66, 41, 2.4, 1.6, OL) +
    P('M 40 56 Q 50 62 58 56 L 56 60 Q 50 64 42 60 Z', '#fff', 2.4) +
    P('M 38 22 L 38 6 L 47 14 L 58 0 L 69 14 L 78 6 L 78 22 Z', '#ffcc3a', 3.6) + C(58, 15, 3.4, '#e8384f', 2.2) + C(44, 18, 2, '#4cc9f0', 1.4) + C(72, 18, 2, '#4cc9f0', 1.4) +
    P('M 34 66 Q 66 58 98 66 L 96 74 Q 66 66 36 74 Z', '#c0392b', 3.2));
  const am = (
    L('M 52 108 L 18 34', 8) + L('M 52 108 L 18 34', 4, '#a8683a') + P('M 2 30 Q 18 16 34 30 L 26 46 Q 18 40 10 46 Z', '#c3cfdf', 3.6) +
    P('M 64 66 Q 50 70 44 84 Q 42 92 50 92 Q 56 90 58 82 Q 62 76 66 72 Z', fur, 3.6) + C(46, 90, 7, belly, 3.4) + L('M 40 92 L 37 97 M 45 95 L 44 100 M 50 95 L 51 100', 2.4, '#f4efe6'));
  return { legB: svg(EW, EH, lb), legF: svg(EW, EH, lf), body: svg(EW, EH, bd), arm: svg(EW, EH, am), full: svg(EW, EH, lb + lf + bd + am), name: 'Rei Toupeira' };
}
