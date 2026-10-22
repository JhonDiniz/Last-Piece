// The player's pirate: avatar options, experience curve, training and Haki.

// ---------------- avatar ----------------
// Each option list is [value, label]. Colours are shown as swatches.
export const LOOK_OPTS = {
  skin: { name: 'Pele', colors: ['#ffd2a6', '#f2bb8c', '#d59a6a', '#a8714a', '#7a4f33'] },
  hair: { name: 'Cabelo', list: [['short', 'Curto'], ['spiky', 'Espetado'], ['long', 'Longo'], ['bun', 'Coque'], ['none', 'Careca']] },
  hairC: { name: 'Cor do cabelo', colors: ['#2a1a12', '#5a3a22', '#c0562b', '#f2c14a', '#e8eef8', '#3fa85a', '#4a7ad8', '#e85a9a'] },
  hat: { name: 'Chapéu', list: [['none', 'Nenhum'], ['straw', 'Palha'], ['captain', 'Capitão'], ['bandana', 'Bandana'], ['cap', 'Boné'], ['turban', 'Turbante']] },
  hatC: { name: 'Cor do chapéu', colors: ['#d8384a', '#2a2a3a', '#3f6fd8', '#3fa85a', '#ffcc3a', '#f4efe6', '#7a3ab0'] },
  torso: { name: 'Roupa', list: [['shirt', 'Camisa'], ['vest', 'Colete'], ['fur', 'Casaco de pele'], ['robe', 'Manto']] },
  shirt: { name: 'Cor da roupa', colors: ['#d8384a', '#3f6fd8', '#3fa85a', '#ffcc3a', '#f4efe6', '#2a2a3a', '#ff8a3a', '#7a3ab0'] },
  pants: { name: 'Cor da calça', colors: ['#3f56b0', '#2a2a3a', '#5a3a22', '#3f8a5a', '#c9b88a', '#8a2a3a'] },
  beard: { name: 'Barba', list: [['none', 'Nenhuma'], ['stache', 'Bigode'], ['full', 'Cheia']] },
  mouth: { name: 'Expressão', list: [['shout', 'Animado'], ['grin', 'Confiante'], ['frown', 'Sério']] },
  weapon: { name: 'Arma', list: [['sword', 'Espada'], ['bigsword', 'Espadão'], ['scimitar', 'Cimitarra'], ['dagger', 'Adaga'], ['staff', 'Bastão'], ['none', 'Punhos']] },
};
export const LOOK_ORDER = ['skin', 'hair', 'hairC', 'hat', 'hatC', 'torso', 'shirt', 'pants', 'beard', 'mouth', 'weapon'];

export const defaultLook = () => ({ skin: '#ffd2a6', hair: 'spiky', hairC: '#2a1a12', hat: 'straw', hatC: '#d8384a', torso: 'vest', shirt: '#d8384a', pants: '#3f56b0', beard: 'none', mouth: 'shout', weapon: 'sword' });

// avatar -> spec for the human rig (art/enemies.js humanParts)
export function lookSpec(l) {
  return {
    skin: l.skin, hair: l.hair, hairC: l.hairC, hat: l.hat === 'none' ? '' : l.hat, hatC: l.hatC,
    torso: l.torso, shirt: l.shirt, vest: '#2a2a3a', pants: l.pants, shoe: '#5a3a22',
    beard: l.beard === 'none' ? '' : l.beard, beardC: l.hairC, mouth: l.mouth,
    weapon: l.weapon === 'none' ? '' : l.weapon, wc: '#ffcc3a', belt: '#ffcc3a',
  };
}

// ---------------- experience ----------------
export const LV_MAX = 300;
export const xpNeed = lv => Math.round(18 * Math.pow(lv, 1.5));
export const enemyXp = g => 2 + g * 0.9;
export const bossXp = g => enemyXp(g) * 12;
// natural growth from the character level alone (fractions)
export const lvAtk = lv => 0.05 * (lv - 1);
export const lvHp = lv => 0.06 * (lv - 1);
// training points earned per level (one, plus a bonus every 10 levels)
export const ptsForLevel = lv => 1 + (lv % 10 === 0 ? 2 : 0);

// ---------------- training ----------------
// per: bonus per point. stat names map to the stats engine.
export const TRAINING = [
  { k: 'str', name: 'Força', icon: 'sword', col: '#ff5a5f', per: 0.04, max: 100, desc: p => `ATQ +${Math.round(p * 4)}%` },
  { k: 'res', name: 'Resistência', icon: 'heart', col: '#ff4d7e', per: 0.006, max: 100, desc: p => `Dano recebido -${(Math.min(0.6, p * 0.006) * 100).toFixed(1).replace('.', ',')}% · PV +${p * 3}%` },
  { k: 'agi', name: 'Agilidade', icon: 'speed', col: '#4cb8ff', per: 0.012, max: 100, desc: p => `VATQ +${(p * 1.2).toFixed(1).replace('.', ',')}%` },
  { k: 'acc', name: 'Precisão', icon: 'crit', col: '#ffb02e', per: 0.003, max: 100, desc: p => `Crítico +${(p * 0.3).toFixed(1).replace('.', ',')}% · Dano crítico +${p * 2}%` },
  { k: 'vit', name: 'Vitalidade', icon: 'regen', col: '#3fcf8e', per: 0.05, max: 100, desc: p => `Recuperação de PV +${p * 5}%` },
];
export const TRAIN = Object.fromEntries(TRAINING.map(t => [t.k, t]));

// ---------------- Haki ----------------
export const HAKI = [
  { k: 'obs', name: 'Haki da Observação', lv: 15, col: '#7ee0ff', max: 40,
    desc: p => `Chance de esquivar de ataques: ${Math.round(hakiDodge(p) * 100)}%` },
  { k: 'arm', name: 'Haki do Armamento', lv: 30, col: '#8a6bd0', max: 40,
    desc: p => `Dano +${p * 6}% · Dano em chefes +${p * 4}%` },
  { k: 'king', name: 'Haki do Rei', lv: 50, col: '#ffcc3a', max: 40,
    desc: p => `A cada ${hakiKingEvery(p)} s, atordoa os inimigos por 2 s e causa ${hakiKingDmg(p)}% do ATQ a todos` },
];
export const HAKI_BY = Object.fromEntries(HAKI.map(h => [h.k, h]));
export const hakiDodge = p => Math.min(0.4, p * 0.01);
export const hakiKingEvery = p => Math.max(12, 24 - Math.floor(p / 4));
export const hakiKingDmg = p => 300 + p * 60;
