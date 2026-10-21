// Summoning (gacha) for skills, equipment and companions.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { weighted, pick, today } from '../core/util.js';
import { gradeProbs, summonReq, SUMMON_MAX } from '../data/balance.js';
import { SKILLS } from '../data/skills.js';
import { GEAR, SLOTS } from '../data/gear.js';
import { PETS } from '../data/pets.js';
import { recompute, ST } from './stats.js';
import { isOpen, checkMission } from './progress.js';

export const BANNERS = {
  skill: { key: 'skill', name: 'Habilidade', feature: 'skills', col: '#6a4bd0' },
  gear: { key: 'gear', name: 'Equipamento', feature: 'gear', col: '#d88a2a' },
  pet: { key: 'pet', name: 'Companheiro', feature: 'pets', col: '#3aa86a' },
};
export const COST = { 11: 500, 35: 1500 };
export const costOf = n => Math.round(COST[n] * (1 - ST.discount));

function pool(type, g) {
  if (type === 'skill') return SKILLS.filter(s => s.g === g);
  if (type === 'pet') return PETS.filter(p => p.g === g);
  const open = SLOTS.filter(sl => Math.max(S.maxStage, S.peak || 1) >= sl.unlock || sl.unlock === 0).map(sl => sl.k);
  return GEAR.filter(x => x.g === g && open.includes(x.slot));
}
const col = type => (type === 'skill' ? S.skills.own : type === 'pet' ? S.pets.own : S.gear.own);

export function resetDaily() {
  const d = today();
  if (S.daily.day !== d) {
    S.daily.day = d;
    S.daily.free = { skill: 3, gear: 3, pet: 3 };
    S.daily.raid = 3; S.daily.boss = 2; S.daily.shopFree = 1;
    S.keys = Math.max(S.keys, 3); S.tickets = Math.max(S.tickets, 2);
    S.daily.login = (S.daily.login || 0) + 1;
    emit('daily');
  }
}

// mode: 'free' | 'gems'
export function summon(type, n, mode) {
  resetDaily();
  const b = BANNERS[type];
  if (!isOpen(b.feature)) return { err: 'locked' };
  if (mode === 'free') {
    if (S.daily.free[type] <= 0) return { err: 'nofree' };
    S.daily.free[type]--;
  } else {
    const c = costOf(n);
    if (S.gems < c) return { err: 'gems' };
    S.gems -= c;
  }
  const st = S.summon[type];
  st.total = st.total || 0;
  const res = [];
  const own = col(type);
  for (let i = 0; i < n; i++) {
    const probs = gradeProbs(st.lv);
    let g = weighted(probs);
    let p = pool(type, g);
    while (!p.length && g > 0) p = pool(type, --g);
    const item = pick(p);
    const isNew = !own[item.id];
    if (isNew) own[item.id] = { lv: 1, cp: 0 }; else own[item.id].cp++;
    res.push({ id: item.id, g: item.g ?? g, isNew, item });
    st.n++; st.total++;
    S.stats.summons++;
    if (st.lv < SUMMON_MAX && st.n >= summonReq(st.lv)) { st.n -= summonReq(st.lv); st.lv++; emit('summonLevel', { type, lv: st.lv }); }
  }
  recompute();
  save();
  emit('summoned', { type, res });
  emit('collection');
  checkMission();
  return { res };
}
