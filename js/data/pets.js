// Companions: the Straw Hat crew. They fight beside the captain on the ship
// deck; atk = fraction of the captain's ATQ per hit. Every companion has an
// ULT that fires on its own every `cd` seconds.
//
// ult.kind: multi (many hits on the front enemy) | single (one huge hit)
//   | storm (all + stun) | cleave (front n enemies) | heal (captain) | bind (all, immobilize)
//   | beam (all) | freeze (all, slow)
export const PETS = [
  { id: 'chopper', name: 'Tony Tony Chopper', g: 0, kind: 'melee', proj: null,
    ult: { name: 'Rumble Ball', cd: 18, kind: 'heal', heal: 0.25, buff: { aspdPct: 0.3 }, dur: 6, col: '#ff8ad8', desc: 'Recupera 25% do PV do capitão e aumenta a VATQ em 30% por 6 s.' } },
  { id: 'nami', name: 'Nami', g: 1, kind: 'ranged', proj: 'wave',
    ult: { name: 'Thunderbolt Tempo', cd: 15, kind: 'storm', pct: 500, stun: 1.5, col: '#ffe14a', desc: 'Um raio atinge todos os inimigos: {p}% do ATQ e atordoa por 1,5 s.' } },
  { id: 'brook', name: 'Brook', g: 2, kind: 'melee', proj: null,
    ult: { name: 'Soul Solid', cd: 14, kind: 'freeze', pct: 350, slow: 5, col: '#a0e6ff', desc: 'Lâmina gélida: {p}% do ATQ a todos e deixa os inimigos lentos por 5 s.' } },
  { id: 'franky', name: 'Franky', g: 3, kind: 'ranged', proj: 'orb',
    ult: { name: 'Radical Beam', cd: 18, kind: 'beam', pct: 900, col: '#7ee0ff', desc: 'Um raio laser atravessa a ilha: {p}% do ATQ a todos os inimigos.' } },
  { id: 'robin', name: 'Nico Robin', g: 4, kind: 'ranged', proj: 'star',
    ult: { name: 'Mil Fleur: Clutch', cd: 16, kind: 'bind', pct: 450, stun: 3, col: '#ff8ab0', desc: 'Braços brotam e prendem todos os inimigos por 3 s: {p}% do ATQ.' } },
  { id: 'sanji', name: 'Sanji', g: 5, kind: 'melee', proj: null,
    ult: { name: 'Diable Jambe', cd: 12, kind: 'cleave', pct: 800, n: 3, col: '#ff7a2a', desc: 'Chutes em chamas nos 3 inimigos da frente: {p}% do ATQ cada.' } },
  { id: 'zoro', name: 'Roronoa Zoro', g: 6, kind: 'melee', proj: null,
    ult: { name: 'Santoryu: Sanzen Sekai', cd: 14, kind: 'single', pct: 2400, col: '#7ed957', desc: 'Corte de três espadas no inimigo da frente: {p}% do ATQ.' } },
  { id: 'luffy', name: 'Monkey D. Luffy', g: 7, kind: 'melee', proj: null,
    ult: { name: 'Gomu Gomu no Gatling', cd: 16, kind: 'multi', pct: 260, hits: 12, col: '#ff4f6a', desc: 'Uma rajada de 12 socos no inimigo da frente: {p}% do ATQ cada.' } },
];
export const PET = Object.fromEntries(PETS.map(p => [p.id, p]));

const ATK = [0.45, 0.6, 0.8, 1.1, 1.5, 2.1, 3.0, 4.2];
const SPD = [0.46, 0.52, 0.6, 0.68, 0.78, 0.88, 1.0, 1.15];
const PAS = [5, 12, 25, 50, 100, 200, 400, 800];
export const petAtk = (p, lv) => ATK[p.g] * (1 + 0.2 * (lv - 1));
export const petSpd = (p, lv) => SPD[p.g] * (1 + 0.02 * (lv - 1));
export const petPassive = (p, lv) => PAS[p.g] * (1 + 0.248 * (lv - 1));     // % ATQ
export const ultPct = (p, lv) => Math.round((p.ult.pct || 0) * (1 + 0.15 * (lv - 1)));
export const ultDesc = (p, lv) => p.ult.desc.replace('{p}', ultPct(p, lv));
// companion slots open with progress
export const PET_SLOTS = [0, 30, 60, 100, 150];   // max stage needed (0 = when the feature opens)
