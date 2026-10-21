// Equipment, companions, slimes and relics management.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { GEAR, GEAR_BY, SLOTS, SLOT, gearEq } from '../data/gear.js';
import { PET, PETS, PET_SLOTS } from '../data/pets.js';
import { SLIME, SLIMES, slimeNeed, SLIME_MAX } from '../data/slimes.js';
import { RELIC, RELIC_MAX, relicCost } from '../data/relics.js';
import { recompute } from './stats.js';
import { checkMission } from './progress.js';

export const gearSlotOpen = slot => Math.max(S.maxStage, S.peak || 1) >= SLOT[slot].unlock;
export function equipGear(id) {
  const it = GEAR_BY[id];
  if (!it || !S.gear.own[id] || !gearSlotOpen(it.slot)) return false;
  S.gear.eq[it.slot] = id;
  recompute(); emit('gear'); checkMission(); save();
  return true;
}
export function unequipGear(slot) { S.gear.eq[slot] = null; recompute(); emit('gear'); }
export function autoEquipGear() {
  for (const sl of SLOTS) {
    if (!gearSlotOpen(sl.k)) continue;
    let best = null, bv = -1;
    for (const id in S.gear.own) { const it = GEAR_BY[id]; if (!it || it.slot !== sl.k) continue; const v = gearEq(it, S.gear.own[id].lv).v; if (v > bv) { bv = v; best = id; } }
    if (best) S.gear.eq[sl.k] = best;
  }
  recompute(); emit('gear'); checkMission(); save();
}

export const petSlotsOpen = () => PET_SLOTS.filter(st => st === 0 || Math.max(S.maxStage, S.peak || 1) >= st).length;
export function equipPet(id, slot) {
  if (!S.pets.own[id]) return false;
  const eq = S.pets.eq, n = petSlotsOpen();
  const at = eq.indexOf(id);
  if (at >= 0) eq[at] = null;
  if (slot === undefined || slot < 0 || slot >= n) { slot = -1; for (let i = 0; i < n; i++) if (!eq[i]) { slot = i; break; } }
  if (slot < 0) slot = n - 1;
  eq[slot] = id;
  recompute(); emit('pets'); checkMission(); save();
  return true;
}
export function unequipPet(id) { const i = S.pets.eq.indexOf(id); if (i >= 0) { S.pets.eq[i] = null; emit('pets'); } }
export function autoEquipPets() {
  const own = Object.keys(S.pets.own).filter(id => PET[id]).sort((a, b) => (PET[b].g - PET[a].g) || (S.pets.own[b].lv - S.pets.own[a].lv));
  const n = petSlotsOpen();
  S.pets.eq = [0, 1, 2, 3, 4].map(i => (i < n ? own[i] || null : null));
  recompute(); emit('pets'); checkMission(); save();
}

export function setSlime(id) {
  if (!S.slimes.own[id]) return false;
  S.slimes.cur = id;
  recompute(); emit('slime'); save();
  return true;
}
export function slimeCanLevel(id) { const o = S.slimes.own[id]; return o && o.lv < SLIME_MAX && o.cp >= slimeNeed(o.lv); }
export function slimeLevelUp(id) {
  const o = S.slimes.own[id];
  if (!slimeCanLevel(id)) return false;
  o.cp -= slimeNeed(o.lv); o.lv++;
  recompute(); emit('slime'); save();
  return true;
}
// fragments for a slime; the slime is unlocked when it gets its first fragments
export function giveSlimeFragments(id, n) {
  if (!SLIME[id]) return false;
  let fresh = false;
  if (!S.slimes.own[id]) { S.slimes.own[id] = { lv: 1, cp: 0 }; fresh = true; n = Math.max(0, n - 1); }
  S.slimes.own[id].cp += n;
  recompute(); emit('slime');
  if (fresh) emit('newSlime', id);
  return fresh;
}
export function slimeForSource(src) {
  const c = SLIMES.filter(s => s.from === src);
  return c.length ? c[Math.floor(Math.random() * c.length)] : null;
}

export function relicLevelUp(id) {
  const lv = S.relics[id] || 0;
  if (!lv || lv >= RELIC_MAX) return false;
  const c = relicCost(lv);
  if (S.relicDust < c) return false;
  S.relicDust -= c; S.relics[id] = lv + 1;
  recompute(); emit('relics'); save();
  return true;
}
export function giveRelic(id) {
  if (!RELIC[id]) return false;
  const had = !!S.relics[id];
  if (had) S.relicDust += 10;
  else S.relics[id] = 1;
  recompute(); emit('relics');
  return !had;
}
