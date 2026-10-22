// The captain drawn for the interface (same rig as the battle, facing right).
import { humanParts } from './enemies.js';
import { lookSpec, defaultLook } from '../data/hero.js';

export function avatarSVG(look) {
  const full = humanParts(lookSpec(look || defaultLook())).full;
  const i = full.indexOf('>') + 1;
  return full.slice(0, i) + '<g transform="translate(120 0) scale(-1 1)">' + full.slice(i, -6) + '</g></svg>';
}
