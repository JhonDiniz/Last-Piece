// Companions on the battlefield: they follow the slime and attack.
import { S } from '../core/state.js';
import { PET, petAtk, petSpd } from '../data/pets.js';
import { B, world, front, hitEnemy, heroAtk, setExternalUpdate, fx } from './battle.js';
import { rand } from '../core/util.js';

export const PB = { list: [] };   // {id, x, y, t, atkT, anim}
const SPOTS = [[-46, 0], [-22, -2], [-70, 2], [-56, -40], [-30, -46]];

function sync() {
  const eq = S.pets.eq.filter(Boolean);
  PB.list = PB.list.filter(p => eq.includes(p.id));
  eq.forEach((id, i) => {
    let p = PB.list.find(q => q.id === id);
    if (!p) { p = { id, x: B.hero.x - 60, y: 0, t: rand(0, 3), atkT: rand(0.3, 1), anim: 0 }; PB.list.push(p); }
    p.slot = i;
  });
}

export function updatePets(dt) {
  sync();
  for (const p of PB.list) {
    const def = PET[p.id], lv = (S.pets.own[p.id] || { lv: 1 }).lv;
    const spot = SPOTS[p.slot] || SPOTS[0];
    const fly = def.fly ? -38 - (p.slot % 2) * 10 : 0;
    const tx = B.hero.x + spot[0], ty = fly + (def.fly ? Math.sin(p.t * 3) * 5 : 0);
    p.t += dt;
    p.anim = Math.max(0, p.anim - dt);
    const target = front();
    let ax = 0;
    if (def.kind === 'melee' && p.anim > 0) ax = Math.sin((1 - p.anim / 0.35) * Math.PI) * 60;
    p.x += (tx + ax - p.x) * Math.min(1, dt * 8);
    p.y += (ty - p.y) * Math.min(1, dt * 6);
    if (B.phase !== 'fight' && B.phase !== 'boss') continue;
    p.atkT -= dt;
    if (target && p.atkT <= 0 && target.x - B.hero.x < 260) {
      p.atkT = 1 / petSpd(def, lv);
      const dmg = heroAtk() * petAtk(def, lv);
      if (def.kind === 'melee') {
        p.anim = 0.35;
        setTimeout(() => { const t = front(); if (t) { hitEnemy(t, dmg, { col: '#ffd0a0', size: 16 }); fx('hit', t.x - 14, world.feet - 30 * t.scale, { life: 0.25, s: 0.7 }); } }, 150);
      } else {
        p.anim = 0.25;
        B.projs.push({ kind: 'pet', proj: def.proj, from: 'pet', x: p.x + 14, y: world.feet - 26 + p.y, tx: target, v: 480, dmg, col: { fire: '#ff8a3a', wave: '#c8a0ff', sting: '#ffe14a', orb: '#bda0ff', rainbow: '#ff8ad8', ink: '#c55cff', star: '#ffe680' }[def.proj] || '#ffffff' });
      }
    }
  }
}
setExternalUpdate(updatePets);
