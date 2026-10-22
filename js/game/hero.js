// The captain: experience, levels, training points and Haki.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { xpNeed, LV_MAX, ptsForLevel, TRAIN, HAKI_BY } from '../data/hero.js';
import { recompute } from './stats.js';

export function gainXp(n) {
  const H = S.hero;
  if (H.lv >= LV_MAX) return;
  H.xp += n;
  let ups = 0;
  while (H.lv < LV_MAX && H.xp >= xpNeed(H.lv)) {
    H.xp -= xpNeed(H.lv);
    H.lv++;
    H.pts += ptsForLevel(H.lv);
    ups++;
  }
  if (H.lv >= LV_MAX) H.xp = 0;
  if (ups) {
    recompute();
    emit('levelUp', { lv: H.lv, ups });
    for (const h of Object.values(HAKI_BY)) if (H.lv - ups < h.lv && H.lv >= h.lv) emit('hakiUnlock', h);
    save();
  }
}

export const hakiOpen = k => S.hero.lv >= HAKI_BY[k].lv;

// spend one training point on an attribute ('str', 'res'…) or a Haki ('obs', 'arm', 'king')
export function spendPoint(k) {
  const H = S.hero;
  if (H.pts <= 0) return 'pts';
  if (TRAIN[k]) {
    if (H.train[k] >= TRAIN[k].max) return 'max';
    H.train[k]++;
  } else if (HAKI_BY[k]) {
    if (!hakiOpen(k)) return 'locked';
    if (H.haki[k] >= HAKI_BY[k].max) return 'max';
    H.haki[k]++;
  } else return 'bad';
  H.pts--;
  recompute();
  emit('hero');
  save();
  return 'ok';
}

// give back every spent point (free respec)
export function resetPoints() {
  const H = S.hero;
  let n = 0;
  for (const k in H.train) { n += H.train[k]; H.train[k] = 0; }
  for (const k in H.haki) { n += H.haki[k]; H.haki[k] = 0; }
  H.pts += n;
  recompute(); emit('hero'); save();
  return n;
}
