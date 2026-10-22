// The captain: experience, levels and the mastery tree (training and Haki).
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { xpNeed, LV_MAX, ptsForLevel, normalizeLook } from '../data/hero.js';
import { TREES, NODE, REQ_LV } from '../data/tree.js';
import { GEAR_BY } from '../data/gear.js';
import { recompute } from './stats.js';

export function gainXp(n) {
  const H = S.hero;
  if (H.lv >= LV_MAX) return;
  H.xp += n * (1 + treeVal('xp'));
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
    const haki = TREES.find(t => t.k === 'haki');
    if (H.lv - ups < haki.lv && H.lv >= haki.lv) emit('hakiUnlock', haki);
    save();
  }
}

// ---------------- mastery tree ----------------
const pts = id => S.hero.tree[id] || 0;
// sum of a stat over every node that raises it
export function treeVal(stat) {
  let v = 0;
  for (const id in S.hero.tree) { const n = NODE[id]; if (n && n.stat === stat) v += n.per * S.hero.tree[id]; }
  return v;
}
export const treeOpen = k => S.hero.lv >= (TREES.find(t => t.k === k).lv || 1);
// {p, max, open, why}
export function nodeState(id) {
  const n = NODE[id], p = pts(id);
  let why = '';
  if (!treeOpen(n.tree)) why = `Libera no nível ${TREES.find(t => t.k === n.tree).lv}`;
  else if (n.lv && S.hero.lv < n.lv) why = `Requer nível ${n.lv}`;
  else if (n.req) {
    const miss = n.req.filter(r => pts(r) < Math.min(REQ_LV, NODE[r].max));
    if (miss.length) why = `Requer ${miss.map(r => NODE[r].name).join(', ')} com ${REQ_LV} pontos`;
  }
  return { p, max: n.max, open: !why, why };
}
export function spendPoint(id) {
  const H = S.hero, n = NODE[id];
  if (!n) return 'bad';
  const st = nodeState(id);
  if (!st.open) return 'locked';
  if (st.p >= n.max) return 'max';
  if (H.pts <= 0) return 'pts';
  H.tree[id] = st.p + 1;
  H.pts--;
  recompute();
  emit('hero');
  save();
  return 'ok';
}
export const RESET_COST = 10;
// give back every spent point
export function resetPoints() {
  const H = S.hero;
  let n = 0;
  for (const id in H.tree) n += H.tree[id];
  if (!n) return 0;
  if (S.gems < RESET_COST) return -1;
  S.gems -= RESET_COST;
  H.tree = {};
  H.pts += n;
  recompute(); emit('hero'); emit('gems'); save();
  return n;
}
export const spentPoints = () => Object.values(S.hero.tree).reduce((a, b) => a + b, 0);

// the captain's look plus what the equipment shows (an equipped cloak becomes a cape)
const CAPE_COL = ['#8a7a6a', '#3f8a5a', '#2a5ab0', '#7a2aa8', '#c0392b', '#14917a', '#a8203a', '#d8a020'];
export function heroLook() {
  const l = normalizeLook(S.hero.look);
  const c = S.gear.eq.cloak && GEAR_BY[S.gear.eq.cloak];
  if (c) l.cape = CAPE_COL[c.g];
  return l;
}
