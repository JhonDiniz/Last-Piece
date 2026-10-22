// Equipment: weapon, cloak, hat and devil fruit.
// eq = bonus while equipped, pas = collection bonus while owned.
export const SLOTS = [
  { k: 'weapon', name: 'Arma', eqStat: 'atk', pasStat: 'atk', unlock: 0 },
  { k: 'cloak', name: 'Manto', eqStat: 'hp', pasStat: 'hp', unlock: 0 },
  { k: 'hat', name: 'Chapéu', eqStat: 'cdmg', pasStat: 'atk', unlock: 40 },
  { k: 'fruit', name: 'Fruta', eqStat: 'skill', pasStat: 'hp', unlock: 80 },
];
export const SLOT = Object.fromEntries(SLOTS.map(s => [s.k, s]));

const N = {
  weapon: [['Galho', 'Colher de Pau'], ['Adaga de Bronze', 'Porrete'], ['Cutelo Pirata', 'Machadinha'], ['Tridente', 'Wado Ichimonji'],
    ['Martelo Trovão', 'Arco Solar'], ['Foice Lunar', 'Clima-Tact'], ['Lâmina do Caos', 'Lança Estelar'], ['Yoru', 'Bastão da Gênese']],
  cloak: [['Capa de Lona', 'Manto Remendado'], ['Capa de Viagem', 'Manto de Couro'], ['Sobretudo Pirata', 'Capa Escarlate'], ['Casaco de Capitão', 'Manto da Marinha'],
    ['Capa do Corsário', 'Manto da Justiça'], ['Casaco do Almirante', 'Manto Celestial'], ['Capa do Imperador', 'Manto Sombrio'], ['Casaco do Rei Pirata', 'Manto de Joy Boy']],
  hat: [['Bandana Simples', 'Boné de Marujo'], ['Chapéu de Pescador', 'Gorro de Lã'], ['Tricórnio Pirata', 'Chapéu de Caubói'], ['Chapéu de Capitão', 'Bandana de Mestre'],
    ['Chapéu de Palha', 'Gorro do Cirurgião'], ['Quepe da Marinha', 'Chapéu de Pluma'], ['Chapéu do Imperador', 'Coroa Pirata'], ['Chapéu do Rei Pirata', 'Coroa de Joy Boy']],
  fruit: [['Fruta Bara Bara', 'Fruta Sube Sube'], ['Fruta Bomu Bomu', 'Fruta Kilo Kilo'], ['Fruta Doru Doru', 'Fruta Hana Hana'], ['Fruta Suna Suna', 'Fruta Moku Moku'],
    ['Fruta Mera Mera', 'Fruta Goro Goro'], ['Fruta Hie Hie', 'Fruta Pika Pika'], ['Fruta Magu Magu', 'Fruta Ope Ope'], ['Fruta Gura Gura', 'Fruta Gomu Gomu']],
};
// shape keys used by the icon painter
const SHAPE = {
  weapon: [['stick', 'spoon'], ['dagger', 'club'], ['sword', 'axe'], ['trident', 'katana'], ['hammer', 'bow'], ['scythe', 'scepter'], ['chaosblade', 'starspear'], ['greatsword', 'staff']],
  hat: [['bandana', 'sailor'], ['fisher', 'beanie'], ['tricorn', 'cowboy'], ['captain', 'bandana2'], ['straw', 'surgeon'], ['marine', 'plume'], ['emperor', 'crown'], ['roger', 'crown2']],
};
// devil fruits: [skin colour, swirl colour]
export const FRUIT_COL = [[['#e8384f', '#ffd0d8'], ['#ff9ad0', '#fff0fa']], [['#ff7a2a', '#ffe0b0'], ['#a8a8b8', '#f0f0f8']], [['#f2e6c8', '#d8b878'], ['#ff8ab0', '#fff0f6']],
  [['#e8c88a', '#a8783a'], ['#d8dce8', '#8a92a6']], [['#ff5a2a', '#ffd23f'], ['#4cc9f0', '#ffe14a']], [['#8be0ff', '#ffffff'], ['#ffe680', '#fffbe0']],
  [['#c0302a', '#ff9a3a'], ['#ff6aa8', '#fff2b0']], [['#e8eef8', '#4cc9f0'], ['#f4efe6', '#c55cff']]];

export const GEAR = [];
for (const slot of ['weapon', 'cloak', 'hat', 'fruit']) {
  N[slot].forEach((pair, g) => pair.forEach((name, i) => {
    GEAR.push({ id: `${slot}_${g}_${i}`, slot, g, i, name, shape: (SHAPE[slot] && SHAPE[slot][g][i]) || slot });
  }));
}
export const GEAR_BY = Object.fromEntries(GEAR.map(x => [x.id, x]));

const EQ = { atk: [68.3, 150, 320, 700, 1500, 3200, 7000, 15000], hp: [60, 135, 290, 640, 1380, 2950, 6400, 14000],
  cdmg: [10, 20, 35, 60, 100, 160, 250, 400], skill: [20, 40, 70, 120, 200, 320, 500, 800] };
const PAS = { atk: [7.49, 16, 34, 74, 160, 340, 740, 1600], hp: [8.96, 18, 38, 80, 170, 360, 780, 1700] };
export function gearEq(item, lv) { const st = SLOT[item.slot].eqStat; return { stat: st, v: EQ[st][item.g] * (1 + (st === 'cdmg' || st === 'skill' ? 0.08 : 0.25) * (lv - 1)) }; }
export function gearPas(item, lv) { const st = SLOT[item.slot].pasStat; return { stat: st, v: PAS[st][item.g] * (1 + 0.3 * (lv - 1)) }; }
