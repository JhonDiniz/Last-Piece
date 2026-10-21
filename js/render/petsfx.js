// Draws equipped companions next to the slime.
import { PB } from '../game/petsBattle.js';
import { PET } from '../data/pets.js';
import { petSVG } from '../art/pets.js';
import { sprite } from './sprites.js';
import { B } from '../game/battle.js';

const SZ = 38;
export function drawPets(ctx, feet) {
  for (const p of PB.list) {
    const def = PET[p.id];
    const s = sprite('pet:' + p.id, () => petSVG(def), SZ, SZ);
    if (!s) continue;
    const hop = def.fly ? 0 : Math.abs(Math.sin(p.t * (B.walking ? 9 : 3))) * (B.walking ? 6 : 1.5);
    const sq = p.anim > 0 ? 1 + Math.sin(p.anim * 20) * 0.08 : 1;
    ctx.save();
    if (!def.fly) { ctx.fillStyle = 'rgba(30,16,50,.2)'; ctx.beginPath(); ctx.ellipse(p.x, feet + 1, 13, 3.6, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.translate(p.x, feet + p.y - hop);
    ctx.scale(sq, 2 - sq);
    ctx.drawImage(s.c, -SZ / 2, -SZ + 2, SZ, SZ);
    ctx.restore();
  }
}
