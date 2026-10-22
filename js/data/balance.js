// Economy and progression formulas.
// Early values (levels 1-100, first ~20 stages) were calibrated against
// observed gameplay; later curves are designed and tuned by tools/sim.mjs.

export const B = {
  waves: [4, 5, 6],          // enemies per wave before the boss
  bossTime: 30,              // seconds to beat a boss
  hpBase: 50, hpEarly: 2.2, hpLate: 1.2, hpKnee: 11, hpRegionStep: 1.7,
  dmgBase: 5, dmgEarly: 1.2, dmgLate: 1.11, dmgRegionStep: 1.2,
  goldBase: 4.2, goldGrowth: 1.128,
  bossHpMul: 9, bossDmgMul: 2.2, bossGoldMul: 8,
  costLate: 1.036, atkLate: 1.024, hpLateV: 1.026,
};

const pw = Math.pow;

// ---------------- enemies ----------------
export function enemyHp(g) {
  const early = Math.min(g, B.hpKnee) - 1, late = Math.max(0, g - B.hpKnee);
  return B.hpBase * pw(B.hpEarly, early) * pw(B.hpLate, late) * pw(B.hpRegionStep, Math.floor((g - 1) / 10));
}
export function enemyDmg(g) {
  const early = Math.min(g, B.hpKnee) - 1, late = Math.max(0, g - B.hpKnee);
  return B.dmgBase * pw(B.dmgEarly, early) * pw(B.dmgLate, late) * pw(B.dmgRegionStep, Math.floor((g - 1) / 10));
}
export function enemyGold(g) { return B.goldBase * pw(B.goldGrowth, g - 1) * pw(1.15, Math.floor((g - 1) / 10)); }
export const bossHp = g => enemyHp(g) * B.bossHpMul;
export const bossDmg = g => enemyDmg(g) * B.bossDmgMul;
export const bossGold = g => enemyGold(g) * B.bossGoldMul;
export const bossGems = g => (g % 10 === 0 ? 100 : 20) + Math.floor(g / 10) * 10;   // first clear only
export const stageKills = () => B.waves.reduce((a, b) => a + b, 0);
// enemies sometimes drop a few gems (as seen in play)
export const GEM_DROP = 0.04;
export const gemDropAmount = g => 1 + Math.floor(g / 25);

// ---------------- attribute upgrades ----------------
// Each upgrade: value(lv), cost(lv) = price to go from lv to lv+1,
// gate(lv, L) returns null when buyable or {k, lv} = level of another
// attribute that must be reached first.
function atkCost(l) {
  if (l <= 20) return 8.86 + 2.14 * pw(l, 0.63);
  if (l <= 62) return l + 2 + (l - 20) * (2 / 42);
  if (l <= 91) return 66 + (l - 62) * 1.24;
  if (l <= 99) return 102 + (l - 91) * 6.1;
  return 151 * pw(B.costLate, l - 99);
}
function hpCost(l) {
  if (l <= 25) return 5.13 + 1.87 * pw(l, 0.6);
  if (l <= 56) return 18 + 0.667 * (l - 25);
  if (l <= 100) return 38 + 0.8 * (l - 56);
  return 73 * pw(B.costLate, l - 100);
}

export const UPGRADES = [
  { k: 'atk', name: 'ATQ', icon: 'sword', col: '#ff5a5f',
    value: l => 10 * l * pw(B.atkLate, Math.max(0, l - 100)), cost: atkCost,
    gate: () => null },
  { k: 'hp', name: 'PV', icon: 'heart', col: '#ff4d7e',
    value: l => (l <= 100 ? 100 + 10 * l : 1100 * pw(B.hpLateV, l - 100)), cost: hpCost,
    gate: (l, L) => (l >= 100 && L.atk < l ? { k: 'atk', lv: l } : null) },
  { k: 'rec', name: 'Recuperação de PV', icon: 'regen', col: '#3fcf8e',
    value: l => (13.9 + 1.4 * (l - 1)) * pw(1.012, Math.max(0, l - 50)), cost: l => (l <= 50 ? 5 + 0.5 * (l - 1) : 29.5 * pw(1.04, l - 50)),
    gate: (l, L) => (L.hp < 100 ? { k: 'hp', lv: 100 } : (l >= L.hp - 90 ? { k: 'hp', lv: l + 91 } : null)) },
  { k: 'aspd', name: 'VATQ', icon: 'speed', col: '#4cb8ff', max: 301, dec: 2,
    value: l => 1 + 0.01 * (l - 1), cost: l => (l <= 10 ? 15 * pw(1.194, l - 1) : 74 * pw(1.052, l - 10)),
    gate: (l, L) => (L.atk < 50 ? { k: 'atk', lv: 50 } : l >= 10 && L.atk < 130 + (l - 10) * 4 ? { k: 'atk', lv: 130 + (l - 10) * 4 } : null) },
  { k: 'crit', name: 'Chance de Crítico', icon: 'crit', col: '#ffb02e', max: 201, pct: true,
    value: l => 0.005 * (l - 1), cost: l => 15 * pw(1.085, l - 1),
    gate: (l, L) => (L.aspd < 10 ? { k: 'aspd', lv: 10 } : null) },
  { k: 'cdmg', name: 'Dano Crítico', icon: 'burst', col: '#ff7a2e', pct: true,
    value: l => 1.2 + 0.01 * (l - 1), cost: l => 60 * pw(1.055, l - 1),
    gate: (l, L) => (L.crit < 100 ? { k: 'crit', lv: 100 } : null) },
  { k: 'dbl', name: 'Ataque Duplo', icon: 'double', col: '#4fd8c8', max: 201, pct: true,
    value: l => 0.005 * (l - 1), cost: l => 313 * pw(1.06, l - 1),
    gate: (l, L) => (L.aspd < 200 ? { k: 'aspd', lv: 200 } : null) },
  { k: 'trp', name: 'Ataque Triplo', icon: 'triple', col: '#b07cff', max: 201, pct: true,
    value: l => 0.005 * (l - 1), cost: l => 5000 * pw(1.065, l - 1),
    gate: (l, L) => (L.dbl < 100 ? { k: 'dbl', lv: 100 } : null) },
  { k: 'boss', name: 'Dano em Chefes', icon: 'bossdmg', col: '#e84a8a', pct: true,
    value: l => 1 + 0.02 * (l - 1), cost: l => 2000 * pw(1.055, l - 1),
    gate: (l, L) => (L.cdmg < 50 ? { k: 'cdmg', lv: 50 } : null) },
];
export const UP = Object.fromEntries(UPGRADES.map(u => [u.k, u]));

// ---------------- power ----------------
export function power(st) {
  return 2 * st.atk * (1 + st.crit * (st.cdmg - 1)) * (1 + st.dbl + st.trp) * Math.max(1, st.aspd) + st.hp / (1 - (st.def || 0)) / (1 - (st.dodge || 0));
}

// ---------------- grades ----------------
export const GRADES = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico', 'Exótico', 'Antigo'];
export const GRADE_COL = ['#c9cfdc', '#7ed957', '#3fa9ff', '#c55cff', '#ffa22e', '#33e0c0', '#ff4f6a', '#ffd23f'];
export const GRADE_DARK = ['#6b7385', '#3a8a2a', '#1f5fb0', '#7a2aa8', '#b8640e', '#14917a', '#a8203a', '#b08a10'];

// copies needed to go from lv to lv+1 (observed: 2,3,4 then 2*(lv-1))
export const fuseNeed = lv => (lv <= 3 ? lv + 1 : 2 * (lv - 1));

// summon levels: summons needed per level (observed 35, 10, then 10*L)
export const summonReq = L => (L === 1 ? 35 : L === 2 ? 10 : 10 * L);
// grade probabilities (%) by summon level, observed for levels 3,4,6,9,12,17,20
const PROB = {
  1: [100, 0, 0, 0, 0, 0, 0, 0],
  2: [58, 36, 6, 0, 0, 0, 0, 0],
  3: [47, 43, 10, 0, 0, 0, 0, 0],
  4: [19, 56, 23, 2, 0, 0, 0, 0],
  6: [19.89, 31, 37, 12, 0.09, 0.02, 0, 0],
  9: [7.358, 10, 22, 60, 0.48, 0.16, 0.002, 0],
  12: [10.0469, 9.4887, 11.1632, 66.9792, 1.3396, 0.8931, 0.0893, 0],
  17: [9.816, 9.5706, 11.0429, 55.2147, 12.2699, 1.8405, 0.2454, 0],
  20: [8.7566, 8.5064, 10.633, 37.5281, 31.2735, 3.0023, 0.3002, 0],
  30: [7, 7, 9, 30, 36, 9, 1.9, 0.1],
};
const PK = Object.keys(PROB).map(Number).sort((a, b) => a - b);
export function gradeProbs(L) {
  if (PROB[L]) return PROB[L];
  if (L >= 30) return PROB[30];
  let a = 1, b = 30;
  for (const k of PK) { if (k < L) a = k; if (k > L) { b = k; break; } }
  const t = (L - a) / (b - a);
  return PROB[a].map((v, i) => v + (PROB[b][i] - v) * t);
}
export const SUMMON_MAX = 30;

// ---------------- rebirth ----------------
export const REBIRTH_STAGE = 50;
export const essenceFor = maxStage => (maxStage < REBIRTH_STAGE ? 0 : Math.floor(pw(maxStage / 10, 1.8) * 2));
