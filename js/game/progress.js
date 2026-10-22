// Upgrades purchase, missions, feature unlocks.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { UP } from '../data/balance.js';
import { recompute, ST } from './stats.js';
import { missionAt, missionText, UNLOCK, UNLOCK_NAMES } from '../data/missions.js';
import { stageInfo } from '../data/regions.js';

// ---------------- upgrades ----------------
export function upgradeState(k) {
  const u = UP[k], lv = S.up[k];
  const gate = u.gate(lv, S.up);
  const max = u.max && lv >= u.max;
  const cost = u.cost(lv);
  return { u, lv, gate, max, cost, can: !gate && !max && S.gold >= cost };
}
export function buyUpgrade(k) {
  const st = upgradeState(k);
  if (st.gate || st.max) return 'locked';
  if (S.gold < st.cost) return 'gold';
  S.gold -= st.cost;
  S.up[k]++;
  recompute();
  emit('upgrade', k);
  checkMission();
  return 'ok';
}

// ---------------- missions ----------------
export function currentMission() {
  const m = missionAt(S.mission);
  const p = missionProgress(m);
  return Object.assign({}, m, { p, done: p >= m.n, text: missionText(m, g => stageInfo(g).label) });
}
export function missionProgress(m) {
  switch (m.t) {
    case 'up': return S.up[m.k] || 0;
    case 'stage': return S.maxStage > m.n ? m.n : 0;
    case 'sum': return m.k === 'any' ? S.stats.summons || 0 : (S.summon[m.k] ? S.summon[m.k].total || 0 : 0);
    case 'equip':
      if (m.k === 'skill') return S.skills.eq.some(Boolean) ? 1 : 0;
      if (m.k === 'weapon') return S.gear.eq.weapon ? 1 : 0;
      if (m.k === 'pet') return S.pets.eq.some(Boolean) ? 1 : 0;
      return 0;
    case 'auto': return S.skills.auto ? 1 : 0;
    case 'skilllv': return Object.values(S.skills.own).reduce((a, o) => a + (o.lv || 0), 0);
    case 'kills': return S.stats.kills;
    case 'raid': return S.stats.raids || 0;
    case 'mine': return S.stats.dug || 0;
    case 'rush': return S.stats.rush || 0;
    default: return 0;
  }
}
let lastDone = false;
export function checkMission() {
  const m = currentMission();
  if (m.done !== lastDone) { lastDone = m.done; emit('mission', m); }
  return m;
}
export function claimMission() {
  const m = currentMission();
  if (!m.done) return null;
  S.gems += m.r;
  S.mission++;
  lastDone = false;
  checkUnlocks();
  save();
  emit('missionClaim', m);
  emit('mission', currentMission());
  emit('gems', m.r);
  return m;
}

// ---------------- unlocks ----------------
export function isOpen(f) {
  if (f in UNLOCK) return S.mission >= UNLOCK[f];
  if (f === 'rebirth') return S.maxStage >= 50 || S.rebirth.n > 0;
  return true;
}
export function checkUnlocks() {
  for (const f of [...Object.keys(UNLOCK), 'rebirth']) {
    if (isOpen(f) && !S.unlocked[f]) {
      S.unlocked[f] = true;
      emit('unlock', { f, name: UNLOCK_NAMES[f] || 'Renascer' });
    }
  }
}
export function silentUnlocks() { for (const f of [...Object.keys(UNLOCK), 'rebirth']) if (isOpen(f)) S.unlocked[f] = true; }
