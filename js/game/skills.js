// Skill casting, AUTO mode, equipping and fusion.
import { S } from '../core/state.js';
import { emit } from '../core/bus.js';
import { SKILL, SKILLS, skillCd } from '../data/skills.js';
import { fuseNeed } from '../data/balance.js';
import { B, alive, setExternalUpdate } from './battle.js';
import { ST, recompute } from './stats.js';
import { spawnSkillFx, updateSkillFx, clearSkillFx } from '../render/skillfx.js';
import { sfx } from '../core/audio.js';
import { on } from '../core/bus.js';

const FX_SFX = { drop: 'whoosh', acid: 'splash', slam: 'whoosh', wave: 'splash', chain: 'zap', ice: 'ice', meteor: 'whoosh', tornado: 'whoosh', breath: 'fire', hammer: 'whoosh', vortex: 'whoosh', stars: 'magic', nova: 'magic', bubbles: 'splash' };

export function castSkill(i, auto = false) {
  const id = S.skills.eq[i];
  if (!id || !SKILL[id]) return false;
  if (B.skillCd[i] > 0) return false;
  if (B.phase !== 'fight' && B.phase !== 'boss') return false;
  const s = SKILL[id];
  const targets = alive().filter(e => e.state !== 'flee' && e.x < 400);
  if (!s.buff && !s.summon && !targets.length) return false;
  if (auto && (s.buff || s.summon) && !targets.length) return false;
  const lv = (S.skills.own[id] || { lv: 1 }).lv;
  const cd = skillCd(s, lv) * (1 - ST.cdr);
  B.skillCd[i] = cd; B.skillMax[i] = cd;
  spawnSkillFx(s, lv);
  if (FX_SFX[s.fx]) sfx(FX_SFX[s.fx]);
  emit('skillCast', s);
  return true;
}

let autoT = 0;
export function updateSkills(dt) {
  updateSkillFx(dt);
  if (!S.skills.auto) return;
  autoT -= dt;
  if (autoT > 0) return;
  autoT = 0.25;
  for (let i = 0; i < 6; i++) if (S.skills.eq[i] && B.skillCd[i] <= 0) { if (castSkill(i, true)) { autoT = 0.35; break; } }
}
setExternalUpdate(updateSkills);
on('stage', () => clearSkillFx());

// ---------------- collection management ----------------
export function canFuse(o) { return o && o.cp >= fuseNeed(o.lv); }
export function fuseOne(col, id) {
  const o = col[id];
  if (!canFuse(o)) return false;
  while (o.cp >= fuseNeed(o.lv)) { o.cp -= fuseNeed(o.lv); o.lv++; }
  return true;
}
export function fuseItem(col, id) { if (!fuseOne(col, id)) return false; recompute(); emit('collection'); return true; }
export function fuseAll(col) {
  let n = 0;
  for (const id in col) if (fuseOne(col, id)) n++;
  if (n) { recompute(); emit('collection'); }
  return n;
}

export function equipSkill(id, slot) {
  const eq = S.skills.eq;
  const at = eq.indexOf(id);
  if (at >= 0) { eq[at] = null; }
  if (slot === undefined || slot < 0) slot = eq.indexOf(null);
  if (slot < 0) slot = 5;
  eq[slot] = id;
  B.skillCd[slot] = Math.min(B.skillCd[slot] || 0, 1);
  emit('skills'); emit('mission');
  return slot;
}
export function unequipSkill(id) {
  const i = S.skills.eq.indexOf(id);
  if (i >= 0) { S.skills.eq[i] = null; emit('skills'); }
}
export function autoEquipSkills() {
  const own = Object.keys(S.skills.own).filter(id => SKILL[id]);
  own.sort((a, b) => (SKILL[b].g - SKILL[a].g) || (S.skills.own[b].lv - S.skills.own[a].lv));
  S.skills.eq = [0, 1, 2, 3, 4, 5].map(i => own[i] || null);
  emit('skills'); emit('mission');
}
export const ownedSkills = () => SKILLS.filter(s => S.skills.own[s.id]);
