// Equipment. eq = bonus while equipped, pas = collection bonus while owned.
export const SLOTS = [
  { k: 'weapon', name: 'Arma', eqStat: 'atk', pasStat: 'atk', unlock: 0 },
  { k: 'armor', name: 'Armadura', eqStat: 'hp', pasStat: 'hp', unlock: 0 },
  { k: 'ring', name: 'Anel', eqStat: 'cdmg', pasStat: 'atk', unlock: 40 },
  { k: 'amulet', name: 'Amuleto', eqStat: 'gold', pasStat: 'hp', unlock: 80 },
];
export const SLOT = Object.fromEntries(SLOTS.map(s => [s.k, s]));

const N = {
  weapon: [['Graveto', 'Colher de Pau'], ['Adaga de Bronze', 'Clava Cravejada'], ['Espada Curta', 'Machadinha'], ['Lança Tridente', 'Katana Azul'],
    ['Martelo Trovão', 'Arco Solar'], ['Foice Lunar', 'Cetro Prismático'], ['Lâmina do Caos', 'Lança Estelar'], ['Espada Primordial', 'Cajado da Gênese']],
  armor: [['Folha Grande', 'Túnica de Lã'], ['Couro Batido', 'Casco de Tartaruga'], ['Cota de Malha', 'Peitoral de Bronze'], ['Placas de Aço', 'Manto Arcano'],
    ['Armadura Dracônica', 'Égide Solar'], ['Couraça Lunar', 'Manto Prismático'], ['Armadura do Caos', 'Véu Estelar'], ['Égide Primordial', 'Manto da Gênese']],
  ring: [['Anel de Cobre', 'Anel de Osso'], ['Anel de Prata', 'Anel de Jade'], ['Anel de Safira', 'Anel de Rubi'], ['Anel Rúnico', 'Anel do Lobo'],
    ['Anel do Dragão', 'Anel Solar'], ['Anel Lunar', 'Anel Prismático'], ['Anel do Caos', 'Anel Estelar'], ['Anel Primordial', 'Anel da Gênese']],
  amulet: [['Pingente de Pedra', 'Colar de Conchas'], ['Medalhão de Prata', 'Amuleto de Jade'], ['Amuleto de Safira', 'Talismã de Rubi'], ['Amuleto Rúnico', 'Olho de Tigre'],
    ['Coração de Dragão', 'Amuleto Solar'], ['Lágrima Lunar', 'Prisma Vivo'], ['Núcleo do Caos', 'Fragmento Estelar'], ['Relógio Primordial', 'Semente da Gênese']],
};
// shape keys used by the icon painter
const SHAPE = {
  weapon: [['stick', 'spoon'], ['dagger', 'club'], ['sword', 'axe'], ['trident', 'katana'], ['hammer', 'bow'], ['scythe', 'scepter'], ['chaosblade', 'starspear'], ['greatsword', 'staff']],
  armor: [['leaf', 'tunic'], ['leather', 'shell'], ['mail', 'bronze'], ['plate', 'robe'], ['dragon', 'aegis'], ['lunar', 'prism'], ['chaos', 'veil'], ['primal', 'genesis']],
};

export const GEAR = [];
for (const slot of ['weapon', 'armor', 'ring', 'amulet']) {
  N[slot].forEach((pair, g) => pair.forEach((name, i) => {
    GEAR.push({ id: `${slot}_${g}_${i}`, slot, g, i, name, shape: (SHAPE[slot] && SHAPE[slot][g][i]) || slot });
  }));
}
export const GEAR_BY = Object.fromEntries(GEAR.map(x => [x.id, x]));

const EQ = { atk: [68.3, 150, 320, 700, 1500, 3200, 7000, 15000], hp: [60, 135, 290, 640, 1380, 2950, 6400, 14000],
  cdmg: [10, 20, 35, 60, 100, 160, 250, 400], gold: [10, 20, 35, 60, 100, 160, 250, 400] };
const PAS = { atk: [7.49, 16, 34, 74, 160, 340, 740, 1600], hp: [8.96, 18, 38, 80, 170, 360, 780, 1700] };
export function gearEq(item, lv) { const st = SLOT[item.slot].eqStat; return { stat: st, v: EQ[st][item.g] * (1 + (st === 'cdmg' || st === 'gold' ? 0.08 : 0.25) * (lv - 1)) }; }
export function gearPas(item, lv) { const st = SLOT[item.slot].pasStat; return { stat: st, v: PAS[st][item.g] * (1 + 0.3 * (lv - 1)) }; }
