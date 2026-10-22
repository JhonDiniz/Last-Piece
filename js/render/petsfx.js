// Draws the crew on the ship deck, with a small ULT charge bar under each one.
import { PB, ultCharge } from '../game/petsBattle.js';
import { PET } from '../data/pets.js';
import { petSVG } from '../art/pets.js';
import { sprite } from './sprites.js';
import { B, shipBob } from '../game/battle.js';

const SZ = 52;
export function drawPets(ctx, feet) {
  const list = PB.list.slice().sort((a, b) => a.y - b.y);
  for (const p of list) {
    const def = PET[p.id];
    const s = sprite('pet:' + p.id, () => petSVG(def), SZ, SZ);
    if (!s) continue;
    const hop = Math.abs(Math.sin(p.t * 3)) * 1.5;
    const sq = p.anim > 0 ? 1 + Math.sin(p.anim * 20) * 0.08 : 1;
    const base = feet + p.y;
    ctx.save();
    if (p.cast > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, p.cast) * 0.7;
      const g = ctx.createRadialGradient(p.x, base - 24, 4, p.x, base - 24, 40);
      g.addColorStop(0, def.ult.col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(p.x - 40, base - 64, 80, 80);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    ctx.translate(p.x, base - hop);
    ctx.scale(sq, 2 - sq);
    ctx.drawImage(s.c, -SZ / 2, -SZ + 2, SZ, SZ);
    ctx.restore();
    // ULT charge
    const c = ultCharge(p), bw = 22, bx = p.x - bw / 2, by = base + 4;
    ctx.fillStyle = 'rgba(30,16,50,.75)'; ctx.fillRect(bx - 1, by - 1, bw + 2, 5);
    ctx.fillStyle = c >= 1 ? '#ffffff' : def.ult.col; ctx.fillRect(bx, by, bw * c, 3);
  }
  void B; void shipBob;
}
