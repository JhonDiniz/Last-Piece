// The captain drawn for the interface (same chibi as the battle).
import { chibiParts } from './chibi.js';
import { normalizeLook } from '../data/hero.js';

export function avatarSVG(look, extra) {
  return chibiParts(Object.assign(normalizeLook(look), extra || {})).full;
}
