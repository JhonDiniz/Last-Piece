// Final hero stats = attribute upgrades x collection bonuses.
import { S } from '../core/state.js';
import { UP, power } from '../data/balance.js';
import { SKILL, skillPassive } from '../data/skills.js';
import { GEAR_BY, gearEq, gearPas } from '../data/gear.js';
import { PET, petPassive } from '../data/pets.js';
import { SLIME, MILESTONES, MILESTONE_BONUS, UNIQUE_LV, slimeBase } from '../data/slimes.js';
import { RELIC, TREASURE } from '../data/relics.js';
import { TALENT } from '../data/talents.js';

export const ST = { atk: 10, hp: 110, rec: 13.9, aspd: 1, crit: 0, cdmg: 1.2, dbl: 0, trp: 0, boss: 1, gold: 1, skill: 1, cdr: 0, slow: 0, offline: 1, gems: 1, discount: 0, power: 130 };
export const BONUS = {};       // breakdown for the attributes screen

export function recompute() {
  const L = S.up;
  const base = {};
  for (const k in UP) base[k] = UP[k].value(L[k] || 1);

  // additive pools (fractions, 1 = +100%)
  const b = { skills: 0, pets: 0, gearAtk: 0, gearHp: 0, eqAtk: 0, eqHp: 0, eqCdmg: 0, eqGold: 0,
    slimeAtk: 0, slimeHp: 0, relic: {}, treasure: {}, talent: {}, slime: {} };
  for (const id in S.skills.own) { const o = S.skills.own[id]; if (SKILL[id] && o.lv > 0) b.skills += skillPassive(SKILL[id], o.lv) / 100; }
  for (const id in S.pets.own) { const o = S.pets.own[id]; if (PET[id] && o.lv > 0) b.pets += petPassive(PET[id], o.lv) / 100; }
  for (const id in S.gear.own) {
    const o = S.gear.own[id], it = GEAR_BY[id];
    if (!it || o.lv <= 0) continue;
    const p = gearPas(it, o.lv);
    if (p.stat === 'atk') b.gearAtk += p.v / 100; else b.gearHp += p.v / 100;
  }
  for (const slot in S.gear.eq) {
    const id = S.gear.eq[slot]; if (!id || !S.gear.own[id]) continue;
    const e = gearEq(GEAR_BY[id], S.gear.own[id].lv);
    if (e.stat === 'atk') b.eqAtk += e.v / 100; else if (e.stat === 'hp') b.eqHp += e.v / 100;
    else if (e.stat === 'cdmg') b.eqCdmg += e.v / 100; else if (e.stat === 'gold') b.eqGold += e.v / 100;
  }
  const add = (o, k, v) => { o[k] = (o[k] || 0) + v; };
  for (const id in S.slimes.own) {
    const o = S.slimes.own[id], sl = SLIME[id]; if (!sl || o.lv <= 0) continue;
    const pct = slimeBase(sl.r, o.lv) / 100;
    b.slimeAtk += pct; b.slimeHp += pct;
    MILESTONES.forEach((m, i) => {
      if (o.lv >= m) {
        const mb = MILESTONE_BONUS[i], v = mb.v[sl.r];
        if (mb.stat === 'all') { add(b.slime, 'atk', v); add(b.slime, 'hp', v); } else add(b.slime, mb.stat, v);
      }
    });
  }
  const cur = SLIME[S.slimes.cur];
  if (cur) {
    const lv = (S.slimes.own[cur.id] || {}).lv || 1;
    if (cur.ability.passive) for (const k in cur.ability.passive) add(b.slime, k, cur.ability.passive[k]);
    if (lv >= UNIQUE_LV) add(b.slime, cur.unique.stat, cur.unique.v);
  }
  for (const id in S.relics) { const r = RELIC[id], lv = S.relics[id]; if (r && lv > 0) add(b.relic, r.stat, r.per * lv); }
  for (const id in S.treasures) { const t = TREASURE[id]; if (t && S.treasures[id]) add(b.treasure, t.stat, t.v); }
  for (const id in S.rebirth.talents) { const t = TALENT[id], lv = S.rebirth.talents[id]; if (t && lv > 0) add(b.talent, t.stat, t.per * lv); }

  const g = (o, k) => o[k] || 0;
  const extra = k => g(b.slime, k) + g(b.relic, k) + g(b.treasure, k) + g(b.talent, k);

  ST.atk = base.atk * (1 + b.skills) * (1 + b.pets) * (1 + b.gearAtk) * (1 + b.eqAtk) * (1 + b.slimeAtk) * (1 + g(b.slime, 'atk')) * (1 + g(b.relic, 'atk')) * (1 + g(b.treasure, 'atk')) * (1 + g(b.talent, 'atk'));
  ST.hp = base.hp * (1 + b.gearHp) * (1 + b.eqHp) * (1 + b.slimeHp) * (1 + g(b.slime, 'hp')) * (1 + g(b.relic, 'hp')) * (1 + g(b.treasure, 'hp')) * (1 + g(b.talent, 'hp'));
  ST.rec = base.rec * (1 + extra('rec')) * (1 + b.slimeHp * 0.2);
  ST.aspd = base.aspd * (1 + extra('aspd'));
  ST.crit = Math.min(1, base.crit + extra('crit'));
  ST.cdmg = base.cdmg + b.eqCdmg + extra('cdmg');
  ST.dbl = Math.min(1, base.dbl + extra('dbl'));
  ST.trp = Math.min(1, base.trp + extra('trp'));
  ST.boss = base.boss;
  ST.gold = (1 + b.eqGold + extra('gold'));
  ST.skill = 1 + extra('skill');
  ST.cdr = Math.min(0.5, extra('cdr'));
  ST.slow = Math.min(0.6, extra('slow'));
  ST.offline = 1 + extra('offline');
  ST.gems = 1 + extra('gems');
  ST.discount = Math.min(0.3, extra('discount'));
  ST.power = power(ST);
  ST.base = base;
  Object.assign(BONUS, b);
  return ST;
}
