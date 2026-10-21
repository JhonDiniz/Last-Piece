// Rebirth: reset stage progress and attributes for permanent essence.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { REBIRTH_STAGE, essenceFor } from '../data/balance.js';
import { TALENT, talentCost } from '../data/talents.js';
import { recompute } from './stats.js';
import { startStage, resetHero } from './battle.js';

export const canRebirth = () => S.maxStage >= REBIRTH_STAGE;
export const rebirthGain = () => essenceFor(S.maxStage);

export function doRebirth() {
  if (!canRebirth()) return 0;
  const gain = rebirthGain();
  S.essence += gain;
  S.rebirth.n++;
  S.peak = Math.max(S.peak || 1, S.maxStage);
  const start = 1 + (S.rebirth.talents.start || 0) * 5;
  S.stage = start; S.maxStage = start; S.farm = false;
  for (const k in S.up) S.up[k] = 1;
  S.gold = 80 + start * 50;
  recompute(); resetHero();
  startStage(start, 'intro');
  save();
  emit('rebirth', gain);
  return gain;
}

export function buyTalent(id) {
  const t = TALENT[id], lv = S.rebirth.talents[id] || 0;
  if (lv >= t.max) return 'max';
  const c = talentCost(t, lv);
  if (S.essence < c) return 'cost';
  S.essence -= c;
  S.rebirth.talents[id] = lv + 1;
  recompute(); save();
  emit('talent', id);
  return 'ok';
}
