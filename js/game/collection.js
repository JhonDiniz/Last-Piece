// Equipment, companions, slimes and relics management.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { GEAR, GEAR_BY, SLOTS, SLOT, gearEq } from '../data/gear.js';
import { PET, PETS, PET_SLOTS } from '../data/pets.js';
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
  S.pets.eq = PET_SLOTS.map((_, i) => (i < n ? own[i] || null : null));
  recompute(); emit('pets'); checkMission(); save();
}

// drop data from older saves that no longer exists (old companions, slimes)
const OLD_PET_GRADE = { pintinho: 0, gato: 0, morcego: 1, sapo: 1, raposa: 2, abelha: 2, coruja: 3, fantasma: 3, dragaozinho: 4, unicornio: 4, fenix: 5, golem: 5, polvo: 6, estrela: 6, leao: 7, baleia: 7 };
const OLD_SLOT = { armor: 'cloak', ring: 'hat', amulet: 'fruit' };
export function migrateSave() {
  // the old training / Haki points go back to the pool for the mastery tree
  const H = S.hero;
  for (const k of ['train', 'haki']) if (H[k]) { for (const x in H[k]) H.pts += H[k][x] || 0; delete H[k]; }
  // armor / ring / amulet became cloak / hat / devil fruit
  for (const id in S.gear.own) {
    const [slot, g, i] = id.split('_');
    if (OLD_SLOT[slot]) { const nid = `${OLD_SLOT[slot]}_${g}_${i}`; S.gear.own[nid] = S.gear.own[id]; delete S.gear.own[id]; }
  }
  for (const k in OLD_SLOT) if (k in S.gear.eq) { const id = S.gear.eq[k]; if (id) S.gear.eq[OLD_SLOT[k]] = id.replace(k + '_', OLD_SLOT[k] + '_'); delete S.gear.eq[k]; }
  // old companions become the crewmate of the same grade
  for (const id in S.pets.own) {
    if (PET[id]) continue;
    const g = OLD_PET_GRADE[id], to = g !== undefined && PETS.find(p => p.g === g);
    if (to) {
      const o = S.pets.own[id], cur = S.pets.own[to.id];
      S.pets.own[to.id] = cur ? { lv: Math.max(cur.lv, o.lv), cp: (cur.cp || 0) + (o.cp || 0) } : { lv: o.lv, cp: o.cp || 0 };
      S.pets.eq = S.pets.eq.map(e => (e === id ? to.id : e));
    }
    delete S.pets.own[id];
  }
  // the deck fits only two crewmates now
  const keep = [];
  for (const id of S.pets.eq) if (id && !keep.includes(id)) keep.push(id);
  S.pets.eq = PET_SLOTS.map((_, i) => keep[i] || null);
  S.pets.eq = S.pets.eq.map(id => (id && PET[id] && S.pets.own[id] ? id : null));
  delete S.slimes;
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
