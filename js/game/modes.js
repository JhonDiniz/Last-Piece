// Extra battle modes that reuse the battlefield: village raid and the Mole King.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { rand, pick } from '../core/util.js';
import * as BAL from '../data/balance.js';
import { B, W, world, spawnCustom, startStage, text, fx, damageHero, resetHero } from './battle.js';
import { ARCHETYPES, BUILDING_NAMES } from '../art/enemies.js';
import { RELICS } from '../data/relics.js';
import { recompute, ST } from './stats.js';
import { giveRelic } from './collection.js';
import { checkMission } from './progress.js';
import { clearSkillFx } from '../render/skillfx.js';

export const RAID_TIME = 45, RUSH_TIME = 30;
export const maxRaidLevel = () => Math.max(1, Math.floor(Math.max(S.maxStage, S.peak || 1) / 10));
const BUILDINGS = ['casa', 'celeiro', 'torre', 'moinho', 'prefeitura'];
const BHP = [3, 4, 5, 6, 9];

function enterMode(name, bg) {
  clearSkillFx();
  B.enemies.length = 0; B.projs.length = 0; B.drops.length = 0;
  B.mode = name; B.bg = bg; B.pt = 0; B.phase = 'fight';
  B.boss = null;
  resetHero();
  emit('phase', 'fight');
}

// ------------------------------------------------------------------ raid
export function startRaid(L) {
  if (S.keys <= 0) return false;
  S.keys--;
  const gR = L * 10;
  enterMode('raid', 'village');
  const R = B.raid = { L, gR, t: RAID_TIME, idx: 0, destroyed: 0, total: BUILDINGS.length, dust: 0, gold: 0, chest: false, spawnT: 1.5, cur: null, over: false };
  B.modeLabel = `Incursão — Vila ${L}`;
  const nextBuilding = () => {
    if (R.idx >= BUILDINGS.length) return;
    const k = BUILDINGS[R.idx];
    const hp = BAL.enemyHp(gR) * BHP[R.idx];
    R.cur = spawnCustom({ building: true, kind: k, hp, max: hp, x: W + 70, scale: k === 'prefeitura' ? 1.35 : 1.15, spd: 0, dmg: 0, state: 'idle', tint: L % 4, spec: { name: BUILDING_NAMES[k] } });
    R.idx++;
    for (let i = 0; i < 2; i++) spawnDefender(R, 0.5 + i * 0.7);
  };
  R.next = nextBuilding;
  nextBuilding();
  B.onKill = e => {
    if (e.building) {
      R.destroyed++;
      const dust = 3 + L * 2, gold = BAL.enemyGold(gR) * 15 * ST.gold;
      R.dust += dust; R.gold += gold;
      text(e.x, world.feet - 110, `+${dust} pó`, '#c8a0ff', 20, { life: 1.2 });
      fx('poof', e.x, world.feet - 40, { life: 0.8, s: 2 });
      world.shake = 0.3;
      if (e.kind === 'prefeitura') R.chest = true;
      emit('raidProgress', R);
      if (R.destroyed >= R.total) endRaid('win');
      else setTimeout(() => { if (B.mode === 'raid') nextBuilding(); }, 600);
    } else {
      R.gold += BAL.enemyGold(gR) * ST.gold;
    }
  };
  B.onHeroDeath = () => endRaid('dead');
  B.modeUpdate = dt => {
    if (R.over) return;
    R.t -= dt;
    const live = B.enemies.filter(e => e.state !== 'die');
    const bld = live.find(e => e.building);
    B.walking = !live.some(e => e.x < B.hero.x + 230);
    R.spawnT -= dt;
    if (bld && R.spawnT <= 0 && live.length < 5) { spawnDefender(R, 0); R.spawnT = rand(2.6, 3.6); }
    if (R.t <= 0) endRaid('time');
  };
  emit('modeStart', { mode: 'raid', L });
  return true;
}
function spawnDefender(R, delay) {
  setTimeout(() => {
    if (B.mode !== 'raid' || R.over) return;
    const kind = pick(['campones', 'escudeiro', 'tocheiro', 'lenhador']);
    const spec = ARCHETYPES[kind];
    spawnCustom({ kind, spec, hp: BAL.enemyHp(R.gR), dmg: BAL.enemyDmg(R.gR) * 0.8, spd: 50 * rand(0.9, 1.1), ranged: !!spec.range, x: W + 40 });
  }, delay * 1000);
}
function endRaid(why) {
  const R = B.raid;
  if (!R || R.over) return;
  R.over = true;
  const stars = R.destroyed >= 5 ? 3 : R.destroyed >= 4 ? 2 : R.destroyed >= 2 ? 1 : 0;
  const mult = [0.5, 1, 1.3, 1.6][stars];
  const res = { mode: 'raid', why, stars, L: R.L, dust: Math.round(R.dust * mult), gold: R.gold * mult, relic: null, relicNew: false, gems: 0, slime: null };
  S.relicDust += res.dust; S.gold += res.gold;
  if (R.chest) {
    const r = pick(RELICS.filter(x => x.tier <= Math.min(3, Math.floor(R.L / 3))));
    res.relic = r; res.relicNew = giveRelic(r.id);
  }
  if (stars === 3 && (S.raidBest || 0) < R.L) {
    S.raidBest = R.L;
    res.gems = 100 + 50 * R.L; S.gems += res.gems;
  }
  S.stats.raids = (S.stats.raids || 0) + 1;
  recompute(); save(); checkMission();
  setTimeout(() => { emit('modeEnd', res); backToStage(); }, why === 'dead' ? 1200 : 900);
}

// ------------------------------------------------------------------ rush (Mole King)
export const RUSH_TIERS = [3, 10, 30, 80, 200, 500, 1200];
export const RUSH_REWARD = { gems: [0, 50, 100, 200, 300, 450, 650, 900], picks: [2, 4, 6, 8, 10, 14, 18, 24] };
export const rushRef = () => BAL.enemyHp(Math.max(1, S.maxStage, S.peak || 1));
export function startRush() {
  if (S.tickets <= 0) return false;
  S.tickets--;
  enterMode('rush', 'volcano');
  B.modeLabel = 'Rei Toupeira';
  B.rushDmg = 0;
  const R = B.rush = { t: RUSH_TIME, over: false };
  const g = Math.max(1, S.maxStage, S.peak || 1);
  const mole = spawnCustom({ kind: 'mole', endless: true, boss: true, hp: 1, max: 1, x: W + 60, scale: 1.75, spd: 40, dmg: BAL.bossDmg(g) * 0.9, spec: { name: 'Rei Toupeira', weapon: 'shovel' } });
  B.boss = mole;
  B.onHeroDeath = () => endRush('dead');
  B.modeUpdate = dt => {
    if (R.over) return;
    if (mole.x < W - 30) R.t -= dt;
    B.walking = mole.x > B.hero.x + 250;
    if (R.t <= 0) endRush('time');
  };
  emit('modeStart', { mode: 'rush' });
  emit('bossIntro', { g, key: 'mole', spec: { name: 'Rei Toupeira' }, mole: true });
  return true;
}
function endRush(why) {
  const R = B.rush;
  if (!R || R.over) return;
  R.over = true;
  const score = B.rushDmg || 0, ref = rushRef();
  let tier = 0;
  RUSH_TIERS.forEach((m, i) => { if (score >= m * ref) tier = i + 1; });
  const res = { mode: 'rush', why, score, tier, gems: RUSH_REWARD.gems[tier], picks: RUSH_REWARD.picks[tier], slime: null, best: score > (S.bossBest || 0) };
  S.gems += res.gems; S.picks += res.picks;
  if (res.best) S.bossBest = score;
  S.stats.rush = (S.stats.rush || 0) + 1;
  for (const e of B.enemies) if (e.endless) e.state = 'flee';
  recompute(); save(); checkMission();
  setTimeout(() => { emit('modeEnd', res); backToStage(); }, 1000);
}

function backToStage() {
  B.raid = null; B.rush = null; B.modeLabel = null;
  startStage(S.stage, 'intro');
}
