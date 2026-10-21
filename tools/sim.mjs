// Progression simulator: plays the game's real formulas with a simple bot
// and prints how fast stages are reached. Usage: node tools/sim.mjs [hours]
import { S, defaults } from '../js/core/state.js';
import * as BAL from '../js/data/balance.js';
import { recompute, ST } from '../js/game/stats.js';
import { buyUpgrade, upgradeState, currentMission, claimMission, isOpen } from '../js/game/progress.js';
import { summon } from '../js/game/gacha.js';
import { fuseAll, autoEquipSkills } from '../js/game/skills.js';
import { autoEquipGear, autoEquipPets } from '../js/game/collection.js';
import { SKILL, skillDmg } from '../js/data/skills.js';
import { PET, petAtk, petSpd } from '../js/data/pets.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const HOURS = +(process.argv[2] || 6);
if (process.argv[3]) Object.assign(BAL.B, JSON.parse(process.argv[3]));
const QUIET = process.argv[4] === 'q';
Object.assign(S, defaults());
recompute();

const fmt = n => (n < 1000 ? n.toFixed(0) : n.toExponential(2));
let t = 0, stage = 1, log = [], deaths = 0, bossFails = 0, nextLog = 60;
const marks = [2, 5, 10, 20, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 1440, 2880].map(m => m * 60);

function dps() {
  const crit = 1 + ST.crit * (ST.cdmg - 1);
  let d = ST.atk * Math.min(8, ST.aspd) * crit * (1 + ST.dbl + ST.trp);
  // skills: average damage per second when on cooldown
  for (const id of S.skills.eq) if (id) { const s = SKILL[id]; if (s.dmg) d += ST.atk * skillDmg(s, S.skills.own[id].lv) / 100 * (s.hits || 1) * ST.skill / s.cd * 0.8; }
  for (const id of S.pets.eq) if (id) { const p = PET[id], lv = S.pets.own[id].lv; d += ST.atk * petAtk(p, lv) * petSpd(p, lv); }
  return d;
}
function spend() {
  // buy upgrades greedily, cheapest first among useful ones
  for (let guard = 0; guard < 400; guard++) {
    const opts = ['atk', 'hp', 'rec', 'aspd', 'crit', 'cdmg', 'dbl', 'trp', 'boss'].map(k => ({ k, st: upgradeState(k) })).filter(o => !o.st.gate && !o.st.max);
    if (!opts.length) break;
    const w = { atk: 1, hp: 1.6, rec: 3, aspd: 1.2, crit: 1.2, cdmg: 1.5, dbl: 1.4, trp: 1.4, boss: 2 };
    opts.sort((a, b) => a.st.cost * w[a.k] - b.st.cost * w[b.k]);
    if (S.gold < opts[0].st.cost) break;
    buyUpgrade(opts[0].k);
  }
  let m = currentMission();
  while (m.done) { claimMission(); m = currentMission(); }
  for (const type of ['skill', 'pet', 'gear']) {
    const f = { skill: 'skills', gear: 'gear', pet: 'pets' }[type];
    if (!isOpen(f)) continue;
    while (S.daily.free[type] > 0) summon(type, 11, 'free');
  }
  const cm = currentMission();
  if (cm.t === 'sum') {
    const tp = cm.k === 'any' ? 'skill' : cm.k;
    while (S.gems >= 500 && !currentMission().done) if (summon(tp, 11, 'gems').err) break;
  }
  while (S.gems >= 1500) {
    const types = ['skill', 'pet', 'gear'].filter(tp => isOpen({ skill: 'skills', gear: 'gear', pet: 'pets' }[tp]));
    if (!types.length) break;
    const tp = types[Math.floor(Math.random() * types.length)];
    if (summon(tp, 35, 'gems').err) break;
  }
  if (isOpen('skills')) S.skills.auto = true;
  fuseAll(S.skills.own); fuseAll(S.gear.own); fuseAll(S.pets.own);
  autoEquipSkills(); autoEquipGear(); autoEquipPets();
  recompute();
}
let day = 0;
while (t < HOURS * 3600) {
  if (Math.floor(t / 86400) !== day) { day = Math.floor(t / 86400); S.daily.free = { skill: 3, gear: 3, pet: 3 }; }
  S.stage = stage;
  const hp = BAL.enemyHp(stage), D = dps();
  const killT = Math.max(1 / Math.min(8, ST.aspd), hp / D) + 1.0;
  const waveT = BAL.stageKills() * killT + 6;
  const incoming = BAL.enemyDmg(stage) * 2 / 1.8;            // ~2 enemies hitting at once
  const net = incoming - ST.rec;
  const survive = net <= 0 || ST.hp / net > waveT * 0.5;
  t += waveT;
  S.gold += BAL.enemyGold(stage) * BAL.stageKills() * ST.gold;
  S.gems += BAL.stageKills() * BAL.GEM_DROP * BAL.gemDropAmount(stage);
  S.stats.kills += BAL.stageKills();
  if (!survive) { deaths++; t += 2; spend(); continue; }
  const bossT = BAL.bossHp(stage) / (D * ST.boss);
  const bossIn = BAL.bossDmg(stage) / 1.5 - ST.rec;
  const bossOk = bossT <= BAL.B.bossTime && (bossIn <= 0 || ST.hp / bossIn > bossT);
  if (bossOk) {
    t += bossT + 5;
    S.gold += BAL.bossGold(stage) * ST.gold;
    if (stage >= S.maxStage) { S.gems += BAL.bossGems(stage); }
    stage++; S.maxStage = Math.max(S.maxStage, stage); S.peak = Math.max(S.peak, S.maxStage);
  } else { bossFails++; t += BAL.B.bossTime; }
  spend();
  while (marks.length && t >= marks[0]) {
    const m = marks.shift();
    const bm = dps() * ST.boss * 30 / BAL.bossHp(stage), net2 = BAL.enemyDmg(stage) * 2 / 1.8 - ST.rec;
    log.push(`${String(m / 60).padStart(4)} min | fase ${String(stage).padStart(3)} | ATQ nv ${S.up.atk} PV nv ${S.up.hp} | ATQ ${fmt(ST.atk)} DPS ${fmt(dps())} HPe ${fmt(BAL.enemyHp(stage))} | chefe x${bm.toFixed(2)} | vida ${net2 > 0 ? (ST.hp / net2).toFixed(0) + 's' : 'inf'} | missão ${S.mission} | invoc ${S.stats.summons} | mortes ${deaths} falhas ${bossFails}`);
  }
}
if (QUIET) console.log(log.map(l => l.split('|').slice(0, 2).join('|').replace(/\s+/g, ' ')).join(' / ') + ` | mortes ${deaths}`);
else console.log(log.join('\n'));
