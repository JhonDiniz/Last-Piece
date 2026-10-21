// The Mine: dig a shaft block by block with pickaxes.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import * as BAL from '../data/balance.js';
import { TREASURES } from '../data/relics.js';
import { recompute, ST } from './stats.js';
import { giveSlimeFragments, slimeForSource } from './collection.js';
import { checkMission } from './progress.js';

export const COLS = 6, PICK_MAX = 20, PICK_SECS = 600;

function hash(r, c, seed) {
  let h = (r * 73856093) ^ (c * 19349663) ^ (seed * 83492791);
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function mineState() {
  const m = S.mine;
  if (!m.seed) m.seed = 1 + Math.floor(Math.random() * 1e6);
  if (!m.dug) m.dug = {};
  if (!m.dmg) m.dmg = {};
  if (m.depth === undefined) m.depth = 0;
  return m;
}
// tile: {hp, kind: dirt|stone|rock, item: null|gold|gem|dust|slime|bomb|picks|treasure, tid}
export function tile(r, c) {
  const m = mineState();
  const u = hash(r, c, m.seed), v = hash(r + 977, c + 31, m.seed);
  const hard = Math.min(0.75, r / 160);
  const kind = u < 0.55 - hard * 0.5 ? 'dirt' : u < 0.88 - hard * 0.2 ? 'stone' : 'rock';
  const hp = kind === 'dirt' ? 1 : kind === 'stone' ? 2 : 3;
  let item = null;
  if (v < 0.11) item = 'gold'; else if (v < 0.14) item = 'gem'; else if (v < 0.18) item = 'dust';
  else if (v < 0.19) item = 'slime'; else if (v < 0.215) item = 'bomb'; else if (v < 0.235) item = 'picks';
  const t = TREASURES.find(x => x.depth === r && Math.floor(hash(r, 7, m.seed) * COLS) === c);
  if (t) return { hp: 3, kind: 'rock', item: 'treasure', tid: t.id };
  return { hp, kind, item };
}
export const isDug = (r, c) => !!mineState().dug[r + ',' + c];
export const tileDmg = (r, c) => mineState().dmg[r + ',' + c] || 0;
export function canDig(r, c) {
  if (c < 0 || c >= COLS || r < 0 || isDug(r, c)) return false;
  if (r === 0) return true;
  return isDug(r - 1, c) || isDug(r + 1, c) || isDug(r, c - 1) || isDug(r, c + 1);
}

export function regenPicks() {
  const now = Date.now();
  if (!S.pickT) S.pickT = now;
  if (S.picks >= PICK_MAX) { S.pickT = now; return 0; }
  const n = Math.floor((now - S.pickT) / (PICK_SECS * 1000));
  if (n > 0) { S.picks = Math.min(PICK_MAX, S.picks + n); S.pickT += n * PICK_SECS * 1000; if (S.picks >= PICK_MAX) S.pickT = now; }
  return n;
}
export const nextPickIn = () => (S.picks >= PICK_MAX ? 0 : PICK_SECS - ((Date.now() - S.pickT) / 1000) % PICK_SECS);

function open(r, c, out) {
  const m = mineState();
  const t = tile(r, c);
  m.dug[r + ',' + c] = 1;
  delete m.dmg[r + ',' + c];
  m.depth = Math.max(m.depth, r + 1);
  m.best = Math.max(m.best || 0, m.depth);
  S.stats.dug = (S.stats.dug || 0) + 1;
  const g = Math.max(1, S.maxStage);
  switch (t.item) {
    case 'gold': { const v = BAL.enemyGold(g) * 12 * ST.gold * (1 + r / 40); S.gold += v; out.push({ k: 'gold', v }); break; }
    case 'gem': { const v = 5 + Math.floor(r / 10) * 2; S.gems += v; out.push({ k: 'gem', v }); break; }
    case 'dust': { const v = 2 + Math.floor(r / 15); S.relicDust += v; out.push({ k: 'dust', v }); break; }
    case 'picks': { S.picks += 3; out.push({ k: 'picks', v: 3 }); break; }
    case 'slime': { const sl = slimeForSource('mine'); if (sl) { giveSlimeFragments(sl.id, 1); out.push({ k: 'slime', v: 1, id: sl.id }); } break; }
    case 'treasure': { if (!S.treasures[t.tid]) { S.treasures[t.tid] = 1; out.push({ k: 'treasure', id: t.tid }); } break; }
    case 'bomb': {
      out.push({ k: 'bomb' });
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if (rr >= 0 && cc >= 0 && cc < COLS && !isDug(rr, cc)) open(rr, cc, out); }
      break;
    }
  }
}

// returns {ok, broke, loot[]}
export function dig(r, c) {
  regenPicks();
  if (!canDig(r, c)) return { ok: false, why: 'far' };
  if (S.picks <= 0) return { ok: false, why: 'picks' };
  const m = mineState();
  S.picks--;
  if (S.picks < PICK_MAX && S.pickT < Date.now() - PICK_SECS * 1000) S.pickT = Date.now();
  const key = r + ',' + c;
  m.dmg[key] = (m.dmg[key] || 0) + 1;
  const t = tile(r, c);
  const loot = [];
  let broke = false;
  if (m.dmg[key] >= t.hp) { open(r, c, loot); broke = true; }
  // keep the save small: forget rows far above the frontier
  const cut = m.depth - 14;
  if (cut > 0) for (const k in m.dug) if (+k.split(',')[0] < cut) delete m.dug[k];
  if (loot.some(l => l.k === 'treasure' || l.k === 'slime')) recompute();
  save(); checkMission();
  emit('mine', { r, c, broke, loot });
  return { ok: true, broke, loot };
}
export const mineDepth = () => mineState().depth;
