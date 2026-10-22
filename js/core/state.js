// Save data. Everything that must survive a reload lives in S.
import { today } from './util.js';

export const SAVE_KEY = 'reino-gelatina-save';
const VERSION = 1;

export function defaults() {
  return {
    v: VERSION, created: Date.now(), last: Date.now(), name: 'Capitão',
    gold: 80, gems: 100, essence: 0,
    stage: 1, maxStage: 1, peak: 1, farm: false,
    up: { atk: 1, hp: 1, rec: 1, aspd: 1, crit: 1, cdmg: 1, dbl: 1, trp: 1, boss: 1 },
    mission: 1, mprog: {},                 // mission index and counters for event missions
    skills: { own: {}, eq: [null, null, null, null, null, null], auto: false },
    gear: { own: {}, eq: { weapon: null, cloak: null, hat: null, fruit: null } },
    pets: { own: {}, eq: [null, null] },
    hero: { created: false, look: null, lv: 1, xp: 0, pts: 0, tree: {} },
    ships: { own: { bote: 1 }, cur: 'bote' },
    relics: {}, relicDust: 0, treasures: {},
    summon: { skill: { lv: 1, n: 0 }, gear: { lv: 1, n: 0 }, pet: { lv: 1, n: 0 } },
    daily: { day: today(), free: { skill: 3, gear: 3, pet: 3 }, raid: 3, boss: 2, shopFree: 1, login: 0 },
    keys: 3, tickets: 2, picks: 10, pickT: Date.now(),
    mine: { depth: 0, grid: null, best: 0 },
    bossBest: 0, raidBest: 0,
    rebirth: { n: 0, talents: {} },
    turbo: { left: 600, on: false },
    chest: { t: Date.now() },
    unlocked: {}, seen: {},
    settings: { music: 0.6, sfx: 0.8, shake: true, saver: false, notation: 'letters' },
    stats: { kills: 0, bosses: 0, play: 0, summons: 0, deaths: 0, clicks: 0 },
    tut: {},
  };
}

export let S = defaults();

function merge(base, data) {
  for (const k in data) {
    if (data[k] && typeof data[k] === 'object' && !Array.isArray(data[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], data[k]);
    else base[k] = data[k];
  }
  return base;
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) S = merge(defaults(), JSON.parse(raw));
  } catch (e) { console.warn('save load failed', e); }
  return S;
}
export function save() {
  try { S.last = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage may be unavailable */ }
}
export function wipe() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
  S = defaults();
}

// export as a compact text code (base64 of JSON + checksum)
function sum(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
export function exportSave() {
  const json = JSON.stringify(S);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return `RG1.${sum(json)}.${b64}`;
}
export function importSave(code) {
  const parts = String(code).trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'RG1') throw new Error('Código inválido');
  const json = decodeURIComponent(escape(atob(parts[2])));
  if (sum(json) !== parts[1]) throw new Error('Código corrompido');
  S = merge(defaults(), JSON.parse(json));
  save();
  return S;
}
