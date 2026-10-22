// Ships (ownership, upgrades, special abilities) and the Haki do Rei pulse.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { SHIP, SHIPS, SHIP_MAX, shipMul, shipUpCost, shipEarned } from '../data/ships.js';
import { hakiKingEvery, hakiKingDmg } from '../data/hero.js';
import { recompute, ST } from './stats.js';
import { B, world, front, alive, hitEnemy, heroAtk, fx, text, addBuff, setExternalUpdate } from './battle.js';

// ---------------- ownership ----------------
// ships are earned when the journey reaches their stage
export function checkShips() {
  for (const s of SHIPS) {
    if (!S.ships.own[s.id] && shipEarned(s, S.maxStage)) {
      S.ships.own[s.id] = 1;
      emit('newShip', s);
      save();
    }
  }
}
export function setShip(id) {
  if (!S.ships.own[id]) return false;
  S.ships.cur = id;
  shipT = 0;
  recompute(); emit('ship'); save();
  return true;
}
export function shipUpgrade(id) {
  const s = SHIP[id], lv = S.ships.own[id];
  if (!s || !lv || lv >= SHIP_MAX) return 'max';
  const c = shipUpCost(s, lv);
  if (S.gold < c) return 'gold';
  S.gold -= c;
  S.ships.own[id] = lv + 1;
  recompute(); emit('ship'); save();
  return 'ok';
}

// ---------------- abilities ----------------
let shipT = 0, kingT = 0;
const fighting = () => B.phase === 'fight' || B.phase === 'boss' || (B.mode !== 'stage' && B.phase !== 'end');
export const bowX = () => B.hero.x + 48;

function fireShip() {
  const s = SHIP[S.ships.cur], a = s.ab, m = shipMul(S.ships.own[s.id] || 1);
  const dmg = heroAtk() * (a.pct || 0) / 100 * m * ST.skill;
  text(B.hero.x, world.feet - 118, a.name + '!', '#ffe680', 18, { life: 1.2, vy: -26 });
  emit('shipAbility', s);
  switch (a.kind) {
    case 'buff':
      addBuff(Object.assign({ t: a.dur, src: 'ship' }, a.buff));
      fx('aura', B.hero.x, world.feet - 40, { life: 0.8, col: '#7ee0ff' });
      if (a.pct) { const e = front(); if (e) B.projs.push({ kind: 'ball', from: 'hero', x: bowX(), y: world.feet - 20, tx: e, v: 520, dmg, col: '#ffcc3a' }); }
      break;
    case 'shot': {
      const e = front();
      fx('smoke', bowX(), world.feet - 18, { life: 0.6 });
      if (e) B.projs.push({ kind: 'ball', from: 'hero', x: bowX(), y: world.feet - 18, tx: e, v: 520, dmg, col: '#ffcc3a' });
      break;
    }
    case 'volley': {
      fx('smoke', bowX(), world.feet - 18, { life: 0.6 });
      fx('volley', 0, 0, { life: 1.0, hits: alive().map(e => e.x) });
      setTimeout(() => { for (const e of alive()) hitEnemy(e, dmg, { col: '#ffb23f' }); world.shake = Math.max(world.shake, S.settings.shake ? 0.2 : 0); }, 350);
      break;
    }
    case 'guard':
      B.hero.shield = Math.max(B.hero.shield, B.hero.max * a.shield * m);
      B.hero.hp = Math.min(B.hero.max, B.hero.hp + B.hero.max * a.heal);
      fx('heal', B.hero.x, world.feet - 40, { life: 0.8 });
      break;
    case 'stun':
      fx('shock', B.hero.x, world.feet - 40, { life: 0.9, col: '#ff4f6a' });
      for (const e of alive()) { e.stunT = Math.max(e.stunT || 0, a.stun); hitEnemy(e, dmg, { col: '#ff8a9a' }); }
      world.shake = Math.max(world.shake, S.settings.shake ? 0.25 : 0);
      break;
  }
}

function fireKing() {
  const p = S.hero.haki.king;
  const dmg = heroAtk() * hakiKingDmg(p) / 100;
  text(B.hero.x, world.feet - 128, 'Haki do Rei!', '#ffcc3a', 20, { life: 1.3, vy: -24 });
  fx('shock', B.hero.x, world.feet - 40, { life: 1.0, col: '#ffcc3a' });
  for (const e of alive()) { if (!e.boss) e.stunT = Math.max(e.stunT || 0, 2); hitEnemy(e, dmg, { col: '#ffe14a' }); }
  world.shake = Math.max(world.shake, S.settings.shake ? 0.25 : 0);
}

export const shipCharge = () => { const s = SHIP[S.ships.cur]; return s ? Math.min(1, shipT / s.ab.every) : 0; };

setExternalUpdate(dt => {
  if (B.hero.dead || !fighting()) return;
  const s = SHIP[S.ships.cur];
  if (s) { shipT += dt; if (shipT >= s.ab.every && alive().length) { shipT = 0; fireShip(); } }
  if (S.hero.haki.king > 0) {
    kingT += dt;
    if (kingT >= hakiKingEvery(S.hero.haki.king) && alive().length) { kingT = 0; fireKing(); }
  }
});
