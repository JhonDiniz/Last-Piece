// Side-view ships (bow to the right). viewBox 220x190, deck at y = SHIP_DECK.
import { OL, svg, mix, dark, light, P, E, C, Cn, En, R, Rn, L, G, gloss, star } from './kit.js';

export const SHIP_W = 220, SHIP_H = 190, SHIP_DECK = 130;

function flag(kind, x, y) {
  const cloth = kind === 'marine' ? '#f4efe6' : kind === 'roger' ? '#2a2a3a' : '#2a1a3e';
  let s = P(`M ${x} ${y} L ${x + 26} ${y + 2} Q ${x + 22} ${y + 9} ${x + 27} ${y + 16} L ${x} ${y + 16} Z`, cloth, 2.4);
  if (kind === 'marine') s += L(`M ${x + 6} ${y + 5} Q ${x + 12} ${y + 12} ${x + 18} ${y + 5}`, 2, '#3f6fd8') + Cn(x + 12, y + 7, 2, '#3f6fd8');
  else {
    s += Cn(x + 12, y + 7, 4, '#f4efe6') + L(`M ${x + 6} ${y + 12} L ${x + 18} ${y + 4} M ${x + 6} ${y + 4} L ${x + 18} ${y + 12}`, 1.8, '#f4efe6');
    if (kind === 'straw') s += P(`M ${x + 7} ${y + 5} Q ${x + 12} ${y - 1} ${x + 17} ${y + 5} Z`, '#f2c45a', 1.2);
    if (kind === 'whitebeard') s += L(`M ${x + 8} ${y + 9} Q ${x + 12} ${y + 13} ${x + 16} ${y + 9}`, 1.6, '#f4efe6');
    if (kind === 'shanks') s += L(`M ${x + 9} ${y + 4} L ${x + 13} ${y + 10}`, 1.4, '#e8384f');
  }
  return s;
}

function figure(kind, col) {
  switch (kind) {
    case 'sheep': return C(206, 108, 13, '#f4efe6', 3.4) + C(198, 98, 6, '#f4efe6', 2.4) + C(212, 97, 6, '#f4efe6', 2.4) +
      P('M 200 104 Q 192 100 196 92 Q 202 96 202 104 Z', '#c9a06a', 2.2) + P('M 212 104 Q 220 100 216 92 Q 210 96 210 104 Z', '#c9a06a', 2.2) +
      Cn(203, 108, 1.6, OL) + Cn(211, 108, 1.6, OL);
    case 'lion': {
      let s = '';
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; s += `<path d="M ${206 + Math.cos(a) * 10} ${104 + Math.sin(a) * 10} L ${206 + Math.cos(a + 0.26) * 19} ${104 + Math.sin(a + 0.26) * 19} L ${206 + Math.cos(a + 0.52) * 10} ${104 + Math.sin(a + 0.52) * 10} Z" fill="#ff8a2a" stroke="${OL}" stroke-width="2"/>`; }
      return s + C(206, 104, 11, '#ffcc3a', 3) + Cn(202, 101, 1.6, OL) + Cn(210, 101, 1.6, OL) + L('M 202 108 Q 206 111 210 108', 1.6);
    }
    case 'whale': return P('M 190 120 Q 196 92 214 96 Q 222 106 216 122 Z', '#f4efe6', 3) + Cn(208, 104, 2, OL) + L('M 200 116 Q 208 120 216 116', 1.8);
    case 'dragon': return P('M 192 118 Q 196 90 214 92 L 222 98 L 212 102 Q 216 112 206 122 Z', col, 3) + Cn(210, 98, 1.8, '#ffe14a') + P('M 204 92 L 206 82 L 210 92 Z', '#ffcc3a', 1.8);
    default: return '';
  }
}

export function shipSVG(s) {
  const hull = s.hull, hd = dark(hull, 0.3), hl = light(hull, 0.25);
  const deck = SHIP_DECK;
  let o = '';
  // masts and sails
  const masts = s.mast === 2 ? [70, 130] : [100];
  for (const mx of masts) {
    o += R(mx - 4, 14, 8, deck - 12, 3, '#8a5a3a', 3);
    o += P(`M ${mx - 46} 36 Q ${mx} 26 ${mx + 46} 36 Q ${mx + 52} 70 ${mx + 44} 104 Q ${mx} 96 ${mx - 44} 104 Q ${mx - 52} 70 ${mx - 46} 36 Z`, s.sail, 3.4);
    o += `<path d="M ${mx + 20} 34 Q ${mx + 48} 70 ${mx + 42} 102 Q ${mx + 30} 100 ${mx + 22} 99 Q ${mx + 30} 70 ${mx + 20} 34 Z" fill="${dark(s.sail, 0.12)}"/>`;
    o += R(mx - 52, 30, 104, 6, 3, '#8a5a3a', 2.6);
    if (s.flag === 'straw' || s.flag === 'roger' || s.flag === 'shanks' || s.flag === 'whitebeard') {
      o += C(mx, 66, 13, '#2a1a3e', 0) + C(mx, 64, 8, '#f4efe6', 0) + L(`M ${mx - 13} 78 L ${mx + 13} 58 M ${mx - 13} 58 L ${mx + 13} 78`, 3.4, '#f4efe6');
      if (s.flag === 'straw') o += P(`M ${mx - 9} 60 Q ${mx} 50 ${mx + 9} 60 Z`, '#f2c45a', 1.6) + Rn(mx - 9, 58, 18, 2.4, 1, '#d8384a');
    } else if (s.flag === 'marine') o += L(`M ${mx - 14} 66 Q ${mx} 80 ${mx + 14} 66`, 4, '#3f6fd8') + C(mx, 62, 5, '#3f6fd8', 0);
    o += flag(s.flag, mx + 4, 4);
  }
  // hull
  o += P(`M 6 ${deck - 6} L 196 ${deck - 6} Q 214 ${deck - 4} 218 ${deck - 14} Q 214 ${deck + 26} 186 ${deck + 46} L 34 ${deck + 46} Q 12 ${deck + 30} 6 ${deck - 6} Z`, hull, 4);
  o += `<path d="M 12 ${deck + 18} L 206 ${deck + 18} Q 200 ${deck + 34} 186 ${deck + 44} L 34 ${deck + 44} Q 18 ${deck + 32} 12 ${deck + 18} Z" fill="${hd}" opacity=".55"/>`;
  o += L(`M 10 ${deck + 4} L 208 ${deck + 4}`, 2.4, hl, 'opacity=".8"');
  // railing
  o += R(4, deck - 12, 196, 7, 3, hl, 3);
  for (let x = 16; x < 196; x += 22) o += Rn(x, deck - 6, 3, 6, 1, hd);
  // portholes / cannons
  const holes = s.r >= 2 ? [40, 80, 120, 160] : s.r === 1 ? [60, 130] : [];
  for (const x of holes) o += C(x, deck + 14, 5, '#2a1a3e', 2.6) + (s.r >= 2 ? R(x - 2, deck + 11, 12, 6, 2, '#3a3a4a', 2) : '');
  o += figure(s.fig, hull);
  return svg(SHIP_W, SHIP_H, o);
}
