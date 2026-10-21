// The eight regions of the world. Each has 10 stages; after the eighth
// region the cycle number goes up and the journey restarts, tougher.
export const REGIONS = [
  { id: 'bosque', name: 'Bosque Esmeralda', bg: 'forest', enemies: ['lenhador', 'arqueiro', 'campones'], boss: 'capitao', music: 0 },
  { id: 'aldeia', name: 'Aldeia dos Camponeses', bg: 'village', enemies: ['campones', 'escudeiro', 'tocheiro'], boss: 'fazendeiro', music: 0 },
  { id: 'pantano', name: 'Pântano Nebuloso', bg: 'swamp', enemies: ['bandido', 'feiticeira', 'cacador'], boss: 'bruxa', music: 1 },
  { id: 'deserto', name: 'Deserto Dourado', bg: 'desert', enemies: ['nomade', 'lanceiro', 'bandido'], boss: 'sultao', music: 1 },
  { id: 'picos', name: 'Picos Gelados', bg: 'snow', enemies: ['cacador', 'viking', 'arqueiro'], boss: 'yeti', music: 2 },
  { id: 'cidadela', name: 'Cidadela de Ferro', bg: 'castle', enemies: ['cavaleiro', 'escudeiro', 'lanceiro', 'mago'], boss: 'comandante', music: 2 },
  { id: 'vulcao', name: 'Vulcão Rubro', bg: 'volcano', enemies: ['ferreiro', 'mineiro', 'tocheiro'], boss: 'ferreiro', music: 3 },
  { id: 'celeste', name: 'Reino Celeste', bg: 'sky', enemies: ['cavaleiro', 'mago', 'feiticeira'], boss: 'paladino', music: 3 },
];

export function stageInfo(g) {
  const ri = Math.floor((g - 1) / 10) % REGIONS.length;
  const cycle = Math.floor((g - 1) / (10 * REGIONS.length)) + 1;
  const s = (g - 1) % 10 + 1;
  const region = REGIONS[ri];
  return { g, ri, region, cycle, s, label: `${region.name} ${cycle}-${s}`, short: `${cycle}-${s}` };
}
