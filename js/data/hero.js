// The player's pirate: avatar options and experience curve.
// The mastery tree (training and Haki) lives in data/tree.js.

// ---------------- avatar ----------------
// Each option list is [value, label]. Colours are shown as swatches.
export const LOOK_OPTS = {
  skin: { name: 'Pele', colors: ['#ffd2a6', '#f2bb8c', '#d59a6a', '#a8714a', '#7a4f33'] },
  hair: { name: 'Cabelo', list: [['spiky', 'Espetado'], ['short', 'Curto'], ['long', 'Longo'], ['ponytail', 'Rabo de cavalo'], ['bun', 'Coque'], ['buzz', 'Raspado'], ['none', 'Careca']] },
  hairC: { name: 'Cor do cabelo', colors: ['#2a1a12', '#5a3a22', '#c0562b', '#ff8a3a', '#f2c14a', '#e8eef8', '#3fa85a', '#4a7ad8', '#e85a9a'] },
  eyeC: { name: 'Cor dos olhos', colors: ['#3a2a1a', '#7a4a2a', '#3f8a5a', '#4a7ad8', '#8a4ad8', '#c0392b', '#2a2a2a'] },
  hat: { name: 'Chapéu', list: [['none', 'Nenhum'], ['straw', 'Palha'], ['captain', 'Capitão'], ['bandana', 'Bandana'], ['cap', 'Boné'], ['beanie', 'Gorro']] },
  hatC: { name: 'Cor do chapéu', colors: ['#d8384a', '#2a2a3a', '#3f6fd8', '#3fa85a', '#ffcc3a', '#f4efe6', '#7a3ab0'] },
  outfit: { name: 'Roupa', list: [['vest', 'Colete aberto'], ['shirt', 'Camiseta'], ['coat', 'Sobretudo'], ['suit', 'Terno'], ['kimono', 'Quimono']] },
  shirt: { name: 'Cor da roupa', colors: ['#d8384a', '#3f6fd8', '#3fa85a', '#ffcc3a', '#f4efe6', '#2a2a3a', '#ff8a3a', '#7a3ab0', '#3f8a5a'] },
  legs: { name: 'Calça', list: [['shorts', 'Bermuda'], ['long', 'Calça comprida']] },
  pants: { name: 'Cor da calça', colors: ['#3f56b0', '#2a2a3a', '#5a3a22', '#3f8a5a', '#c9b88a', '#8a2a3a'] },
  mouth: { name: 'Expressão', list: [['smile', 'Sorriso'], ['grin', 'Risada'], ['serious', 'Sério']] },
  detail: { name: 'Detalhe', list: [['none', 'Nenhum'], ['scar', 'Cicatriz'], ['stache', 'Bigode'], ['goatee', 'Cavanhaque']] },
  weapon: { name: 'Arma', list: [['katana', 'Katana'], ['sword', 'Sabre'], ['staff', 'Bastão'], ['pistol', 'Pistola'], ['none', 'Punhos']] },
};
export const LOOK_ORDER = ['skin', 'hair', 'hairC', 'eyeC', 'hat', 'hatC', 'outfit', 'shirt', 'legs', 'pants', 'mouth', 'detail', 'weapon'];

export const defaultLook = () => ({ skin: '#ffd2a6', hair: 'spiky', hairC: '#2a1a12', eyeC: '#3a2a1a', hat: 'straw', hatC: '#d8384a', outfit: 'vest', shirt: '#d8384a', legs: 'shorts', pants: '#3f56b0', mouth: 'smile', detail: 'none', weapon: 'katana' });

// fill in missing fields and convert looks saved by the previous avatar
const OLD = {
  torso: { vest: 'vest', shirt: 'shirt', fur: 'coat', robe: 'kimono' },
  beard: { stache: 'stache', full: 'goatee' },
  weapon: { sword: 'katana', bigsword: 'katana', scimitar: 'sword', dagger: 'sword', staff: 'staff', none: 'none' },
  mouth: { shout: 'smile', grin: 'grin', frown: 'serious' },
  hat: { turban: 'bandana' },
};
export function normalizeLook(l) {
  const out = defaultLook();
  if (!l) return out;
  for (const k in l) if (k in out) out[k] = l[k];
  if (l.torso && !l.outfit) out.outfit = OLD.torso[l.torso] || 'vest';
  if (l.beard && !l.detail) out.detail = OLD.beard[l.beard] || 'none';
  if (OLD.weapon[l.weapon] && !LOOK_OPTS.weapon.list.some(o => o[0] === l.weapon)) out.weapon = OLD.weapon[l.weapon];
  if (OLD.mouth[l.mouth]) out.mouth = OLD.mouth[l.mouth];
  if (OLD.hat[l.hat]) out.hat = OLD.hat[l.hat];
  for (const k of LOOK_ORDER) {
    const o = LOOK_OPTS[k];
    const ok = o.colors ? typeof out[k] === 'string' && out[k][0] === '#' : o.list.some(v => v[0] === out[k]);
    if (!ok) out[k] = defaultLook()[k];
  }
  return out;
}

// ---------------- experience ----------------
export const LV_MAX = 300;
export const xpNeed = lv => Math.round(18 * Math.pow(lv, 1.5));
export const enemyXp = g => 2 + g * 0.9;
export const bossXp = g => enemyXp(g) * 12;
// natural growth from the character level alone (fractions)
export const lvAtk = lv => 0.05 * (lv - 1);
export const lvHp = lv => 0.06 * (lv - 1);
// skill points (SP) earned per level (one, plus a bonus every 10 levels)
export const ptsForLevel = lv => 1 + (lv % 10 === 0 ? 2 : 0);

