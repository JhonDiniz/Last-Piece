// Companions on the battlefield: they stand on the ship deck, attack, and
// unleash their ULT on their own every few seconds.
import { S } from '../core/state.js';
import { emit } from '../core/bus.js';
import { PET, petAtk, petSpd, ultPct } from '../data/pets.js';
import { ST } from './stats.js';
import { B, world, front, alive, hitEnemy, heroAtk, setExternalUpdate, fx, text, addBuff, shipBob } from './battle.js';
import { rand } from '../core/util.js';

export const PB = { list: [] };   // {id, x, y, t, atkT, anim, ultT}
const SPOTS = [[-30, 0], [-54, 0], [-78, 0], [-42, -6], [-66, -6]];

function sync() {
  const eq = S.pets.eq.filter(id => id && PET[id]);
  PB.list = PB.list.filter(p => eq.includes(p.id));
  eq.forEach((id, i) => {
    let p = PB.list.find(q => q.id === id);
    if (!p) { p = { id, x: B.hero.x - 60, y: 0, t: rand(0, 3), atkT: rand(0.3, 1), anim: 0, ultT: rand(0, 4), cast: 0 }; PB.list.push(p); }
    p.slot = i;
  });
}

function ult(p, def, lv) {
  const u = def.ult, dmg = heroAtk() * ultPct(def, lv) / 100 * ST.skill;
  p.cast = 0.9;
  text(p.x, world.feet - 96 + p.y, u.name + '!', u.col, 16, { life: 1.3, vy: -22 });
  emit('ult', { id: def.id, u });
  const targets = alive();
  switch (u.kind) {
    case 'multi': {
      for (let i = 0; i < u.hits; i++) setTimeout(() => { const t = front(); if (t) { hitEnemy(t, dmg, { col: u.col, size: 15 }); fx('hit', t.x - 14 + rand(-10, 10), world.feet - 40 * t.scale + rand(-14, 14), { life: 0.22, s: 0.7 }); } }, i * 70);
      break;
    }
    case 'single': {
      const t = front();
      fx('slashX', t ? t.x : p.x + 120, world.feet - 40, { life: 0.6, col: u.col });
      setTimeout(() => { const e = front(); if (e) hitEnemy(e, dmg * ST.cdmg, { col: '#ffcf3a', crit: true, size: 24 }); world.shake = Math.max(world.shake, S.settings.shake ? 0.18 : 0); }, 250);
      break;
    }
    case 'storm':
      fx('bolts', 0, 0, { life: 0.8, xs: targets.map(e => e.x), col: u.col });
      for (const e of targets) { e.stunT = Math.max(e.stunT || 0, u.stun); hitEnemy(e, dmg, { col: u.col }); }
      break;
    case 'cleave':
      targets.sort((a, b) => a.x - b.x).slice(0, u.n).forEach((e, i) => setTimeout(() => { if (e.state !== 'die') { hitEnemy(e, dmg, { col: u.col }); fx('burn', e.x, world.feet - 30 * e.scale, { life: 0.5, col: u.col }); } }, i * 140));
      break;
    case 'heal':
      B.hero.hp = Math.min(B.hero.max, B.hero.hp + B.hero.max * u.heal);
      addBuff(Object.assign({ t: u.dur, src: 'ult' }, u.buff));
      fx('heal', B.hero.x, world.feet - 40, { life: 0.9 });
      text(B.hero.x, world.feet - 96, '+' + Math.round(u.heal * 100) + '% PV', '#6fef8f', 16);
      break;
    case 'bind':
      fx('petals', 0, 0, { life: 1.0, xs: targets.map(e => e.x), col: u.col });
      for (const e of targets) { e.stunT = Math.max(e.stunT || 0, u.stun); hitEnemy(e, dmg, { col: u.col }); }
      break;
    case 'beam':
      fx('beam', p.x + 10, world.feet - 30 + p.y, { life: 0.7, col: u.col });
      for (const e of targets) hitEnemy(e, dmg, { col: u.col });
      break;
    case 'freeze':
      fx('frost', 0, 0, { life: 0.9, xs: targets.map(e => e.x), col: u.col });
      for (const e of targets) { e.slowT = Math.max(e.slowT || 0, u.slow); hitEnemy(e, dmg, { col: u.col }); }
      break;
  }
}

export function updatePets(dt) {
  sync();
  const bob = shipBob();
  for (const p of PB.list) {
    const def = PET[p.id], lv = (S.pets.own[p.id] || { lv: 1 }).lv;
    const spot = SPOTS[p.slot] || SPOTS[0];
    const tx = B.hero.x + spot[0], ty = spot[1] + bob;
    p.t += dt;
    p.anim = Math.max(0, p.anim - dt);
    p.cast = Math.max(0, p.cast - dt);
    const target = front();
    let ax = 0;
    if (def.kind === 'melee' && p.anim > 0) ax = Math.sin((1 - p.anim / 0.35) * Math.PI) * 18;
    p.x += (tx + ax - p.x) * Math.min(1, dt * 8);
    p.y += (ty - p.y) * Math.min(1, dt * 6);
    if (B.hero.dead) continue;
    const fighting = B.phase === 'fight' || B.phase === 'boss' || (B.mode !== 'stage' && B.phase !== 'end');
    if (!fighting) continue;
    p.ultT += dt;
    if (p.ultT >= def.ult.cd && alive().length) { p.ultT = 0; ult(p, def, lv); }
    p.atkT -= dt;
    if (target && p.atkT <= 0 && target.x - B.hero.x < 300) {
      p.atkT = 1 / petSpd(def, lv);
      const dmg = heroAtk() * petAtk(def, lv);
      if (def.kind === 'melee') {
        // melee crewmates send a short shockwave from the deck to the shore
        p.anim = 0.35;
        B.projs.push({ kind: 'pet', proj: 'punch', from: 'pet', x: p.x + 14, y: world.feet - 30 + p.y, tx: target, v: 620, dmg, col: def.ult.col });
      } else {
        p.anim = 0.25;
        B.projs.push({ kind: 'pet', proj: def.proj, from: 'pet', x: p.x + 14, y: world.feet - 36 + p.y, tx: target, v: 480, dmg, col: def.ult.col });
      }
    }
  }
}
export const ultCharge = p => Math.min(1, p.ultT / PET[p.id].ult.cd);
setExternalUpdate(updatePets);
