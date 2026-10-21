// Relics (found in raids, levelled with relic dust) and treasures (dug up in the mine).
const RSHAPES = ['amulet', 'orb', 'ring', 'crown', 'book', 'feather', 'hourglass'];
const RCOLS = ['#4cc9f0', '#ff4f6a', '#7ed957', '#c55cff'];
const RSTATS = [
  ['atk', 'ATQ', 0.08], ['hp', 'PV', 0.08], ['gold', 'Ouro', 0.04], ['crit', 'Chance de Crítico', 0.004],
  ['cdmg', 'Dano Crítico', 0.02], ['aspd', 'VATQ', 0.006], ['skill', 'Dano de habilidades', 0.05],
];
const RNAMES = [
  'Amuleto da Aurora', 'Orbe Rubro', 'Anel do Musgo', 'Coroa Esquecida', 'Tomo das Marés', 'Pena de Grifo', 'Ampulheta de Areia',
  'Amuleto do Crepúsculo', 'Orbe Abissal', 'Anel do Viajante', 'Coroa de Espinhos', 'Tomo Rúnico', 'Pena da Fênix', 'Ampulheta Lunar',
  'Amuleto do Oráculo', 'Orbe da Tempestade', 'Anel Ancestral', 'Coroa do Deserto', 'Tomo Proibido', 'Pena Celeste', 'Ampulheta Solar',
  'Amuleto Gelatinoso', 'Orbe do Vazio', 'Anel do Rei', 'Coroa de Cristal', 'Tomo do Gênese', 'Pena Dourada', 'Ampulheta Eterna',
];
export const RELICS = RNAMES.map((name, i) => {
  const st = RSTATS[i % RSTATS.length];
  return { id: 'r' + i, name, shape: RSHAPES[i % 7], col: RCOLS[Math.floor(i / 7)], stat: st[0], statName: st[1], per: st[2] * (1 + Math.floor(i / 7) * 0.5), tier: Math.floor(i / 7) };
});
export const RELIC = Object.fromEntries(RELICS.map(r => [r.id, r]));
export const RELIC_MAX = 50;
export const relicCost = lv => 5 + lv * 5;     // dust to level up

const TSHAPES = ['coin', 'gem', 'skull', 'fossil', 'idol', 'map'];
const TCOLS = ['#ffcc3a', '#4cc9f0', '#ff7aa8', '#7ed957'];
const TNAMES = [
  'Moeda Antiga', 'Geodo Azul', 'Crânio de Cristal', 'Fóssil de Gosma', 'Ídolo de Ouro', 'Mapa Rasgado',
  'Dobrão Real', 'Safira Bruta', 'Máscara de Jade', 'Concha Fossilizada', 'Ídolo de Jade', 'Mapa Estelar',
  'Moeda Lunar', 'Rubi Bruto', 'Crânio Rosa', 'Âmbar com Inseto', 'Ídolo Rubro', 'Carta Náutica',
  'Medalha do Rei', 'Esmeralda Viva', 'Crânio Dourado', 'Ovo Petrificado', 'Ídolo Primordial', 'Mapa do Fim do Mundo',
];
const TSTATS = [['gold', 0.15], ['gems', 0.05], ['atk', 0.25], ['hp', 0.25], ['skill', 0.2], ['offline', 0.1]];
export const TREASURES = TNAMES.map((name, i) => ({ id: 't' + i, name, shape: TSHAPES[i % 6], col: TCOLS[Math.floor(i / 6)], stat: TSTATS[i % 6][0], v: TSTATS[i % 6][1] * (1 + Math.floor(i / 6)), depth: 5 + i * 8 + Math.floor(i * i * 0.6) }));
export const TREASURE = Object.fromEntries(TREASURES.map(t => [t.id, t]));
