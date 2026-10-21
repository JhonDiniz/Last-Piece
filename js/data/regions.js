// The ten sagas of the journey (One Piece). Each saga has 10 stages; every
// stage has its own arc, territory, enemies and boss. After the tenth saga
// the cycle number goes up and the journey restarts, tougher.
//
// Stage fields: arc, terr (territory), foes (enemy description), enemies
// (archetype keys from art/enemies.js), boss (name shown in the VS screen),
// look (BOSSES or ARCHETYPES key used to draw the boss), bg (optional biome).

// enemy groups -> archetypes that draw them
const F = {
  piratas: ['bandido', 'lenhador', 'tocheiro'],
  marinha: ['escudeiro', 'lanceiro', 'cavaleiro'],
  cacadores: ['cacador', 'arqueiro', 'bandido'],
  peixe: ['viking', 'lanceiro', 'cacador'],
  baroque: ['bandido', 'feiticeira', 'arqueiro'],
  feras: ['cacador', 'viking'],
  reino: ['escudeiro', 'lanceiro', 'arqueiro'],
  rebeldes: ['nomade', 'lanceiro', 'escudeiro'],
  ceu: ['mago', 'feiticeira', 'lanceiro'],
  governo: ['cavaleiro', 'mago', 'bandido'],
  zumbis: ['ferreiro', 'mineiro', 'campones'],
  kuja: ['arqueiro', 'feiticeira', 'lanceiro'],
  prisao: ['escudeiro', 'cavaleiro', 'tocheiro'],
  pacifista: ['cavaleiro', 'ferreiro'],
  lab: ['mineiro', 'ferreiro', 'mago'],
  doces: ['campones', 'escudeiro', 'feiticeira'],
  wano: ['nomade', 'lanceiro', 'viking', 'bandido'],
};

// [arc, territory, foes, enemy group, boss, look, bg?]
const SAGA_DATA = [
  { id: 'eastblue', name: 'East Blue', bg: 'village', stages: [
    ['Romance Dawn', 'Ilha de Garp e base da Marinha', 'Piratas de Alvida', 'piratas', 'Alvida', 'fazendeiro'],
    ['Shells Town', 'Base da Marinha em Shells Town', 'Soldados da Marinha', 'marinha', 'Capitão Morgan', 'capitao', 'castle'],
    ['Orange Town', 'Orange Town', 'Piratas Buggy', 'piratas', 'Buggy', 'mago'],
    ['Vila Syrup', 'Vila Syrup e mansão Kaya', 'Piratas do Gato Preto', 'piratas', 'Kuro', 'bandido', 'forest'],
    ['Baratie', 'Restaurante Baratie', 'Piratas do Krieg', 'piratas', 'Don Krieg', 'comandante'],
    ['Baratie', 'Restaurante Baratie', 'Piratas do Krieg', 'piratas', 'Dracule Mihawk', 'paladino'],
    ['Arlong Park', 'Parque de Arlong', 'Homens-peixe', 'peixe', 'Hatchan', 'cacador', 'swamp'],
    ['Arlong Park', 'Parque de Arlong', 'Homens-peixe', 'peixe', 'Kuroobi e Chew', 'viking', 'swamp'],
    ['Arlong Park', 'Parque de Arlong', 'Homens-peixe', 'peixe', 'Arlong', 'yeti', 'swamp'],
    ['Loguetown', 'Cidade de Loguetown', 'Fuzileiros navais e piratas', 'marinha', 'Smoker', 'capitao', 'castle'],
  ] },
  { id: 'alabasta', name: 'Alabasta', bg: 'desert', stages: [
    ['Reverse Mountain', 'Reverse Mountain e Twin Cape', 'Animais marinhos e agentes da Baroque Works', 'baroque', 'Laboon', 'yeti', 'snow'],
    ['Whisky Peak', 'Whisky Peak', 'Caçadores de recompensas da Baroque Works', 'baroque', 'Mr. 5 e Miss Valentine', 'tocheiro', 'village'],
    ['Little Garden', 'Ilha pré-histórica de Little Garden', 'Dinossauros e agentes da Baroque Works', 'feras', 'Mr. 3 e Miss Goldenweek', 'mago', 'forest'],
    ['Ilha Drum', 'Reino de Drum', 'Soldados de Wapol', 'reino', 'Chess e Kuromarimo', 'escudeiro', 'snow'],
    ['Ilha Drum', 'Reino de Drum', 'Soldados de Wapol', 'reino', 'Wapol', 'fazendeiro', 'snow'],
    ['Alabasta', 'Reino de Alabasta', 'Rebeldes e soldados reais', 'rebeldes', 'Mr. 2 Bon Clay', 'feiticeira'],
    ['Alabasta', 'Reino de Alabasta', 'Agentes da Baroque Works', 'baroque', 'Mr. 4 e Miss Merry Christmas', 'mineiro'],
    ['Alabasta', 'Reino de Alabasta', 'Agentes da Baroque Works', 'baroque', 'Mr. 1 e Miss Doublefinger', 'nomade'],
    ['Alabasta', 'Reino de Alabasta', 'Soldados e assassinos da Baroque Works', 'baroque', 'Crocodile (Rainbase)', 'sultao'],
    ['Alabasta', 'Reino de Alabasta', 'Guardas e agentes da Baroque Works', 'baroque', 'Crocodile (Alubarna)', 'sultao'],
  ] },
  { id: 'skypiea', name: 'Skypiea', bg: 'sky', stages: [
    ['Jaya', 'Ilha de Jaya e Mock Town', 'Piratas locais', 'piratas', 'Bellamy', 'lenhador', 'forest'],
    ['Jaya', 'Ilha de Jaya e Mock Town', 'Piratas do bando de Bellamy', 'piratas', 'Sarquiss', 'bandido', 'forest'],
    ['Skypiea', 'Ilha do Céu', 'Guerreiros de Enel', 'ceu', 'Satori', 'mago'],
    ['Skypiea', 'Ilha do Céu', 'Guerreiros de Enel', 'ceu', 'Shura', 'lanceiro'],
    ['Skypiea', 'Upper Yard', 'Guerreiros de Enel', 'ceu', 'Gedatsu', 'nomade'],
    ['Skypiea', 'Upper Yard', 'Sacerdotes de Enel', 'ceu', 'Ohm', 'cavaleiro'],
    ['Skypiea', 'Upper Yard', 'Guerreiros Shandia e soldados de Enel', 'ceu', 'Wyper', 'viking'],
    ['Skypiea', 'Upper Yard', 'Exército de Enel', 'ceu', 'Enel (primeiro confronto)', 'paladino'],
    ['Skypiea', 'Ilha do Céu', 'Exército de Enel', 'ceu', 'Enel (Arca Maxim)', 'paladino'],
    ['Skypiea', 'Cidade de Ouro Shandora', 'Soldados de Enel', 'ceu', 'Enel (batalha final)', 'paladino'],
  ] },
  { id: 'water7', name: 'Water 7', bg: 'castle', stages: [
    ['Long Ring Long Land', 'Long Ring Long Land', 'Piratas do bando Foxy', 'piratas', 'Foxy', 'fazendeiro', 'village'],
    ['Water 7', 'Cidade de Water 7', 'Capangas da Franky Family', 'governo', 'Franky', 'ferreiro', 'village'],
    ['Water 7', 'Cidade de Water 7', 'Agentes da CP9', 'governo', 'Blueno', 'escudeiro', 'village'],
    ['Water 7', 'Cidade de Water 7', 'Agentes da CP9', 'governo', 'Rob Lucci (confronto inicial)', 'comandante', 'village'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Soldados do Governo Mundial', 'marinha', 'Fukuro', 'mineiro'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Agentes da CP9', 'governo', 'Kumadori', 'viking'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Agentes da CP9', 'governo', 'Jabra', 'cacador'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Agentes da CP9', 'governo', 'Kaku', 'lanceiro'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Agentes da CP9', 'governo', 'Rob Lucci', 'comandante'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Soldados do Governo Mundial', 'marinha', 'Spandam', 'capitao'],
  ] },
  { id: 'thriller', name: 'Thriller Bark', bg: 'swamp', stages: [
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis comuns', 'zumbis', 'Perona', 'feiticeira'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis do cemitério', 'zumbis', 'Dr. Hogback', 'mago'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis do cemitério', 'zumbis', 'Victoria Cindry', 'bandido'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis animais', 'zumbis', 'Jigoro e Inuppe', 'cacador'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis especiais', 'zumbis', 'Ryuma', 'cavaleiro'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Soldados zumbis', 'zumbis', 'Absalom', 'viking'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis gigantes', 'zumbis', 'Oars', 'yeti'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis e criaturas de sombra', 'zumbis', 'Gecko Moria', 'bruxa'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis remanescentes', 'zumbis', 'Gecko Moria (batalha final)', 'bruxa'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Soldados da Marinha', 'marinha', 'Bartholomew Kuma', 'comandante'],
  ] },
  { id: 'marineford', name: 'Guerra de Marineford', bg: 'castle', stages: [
    ['Arquipélago de Sabaody', 'Arquipélago de Sabaody', 'Piratas e caçadores de recompensas', 'cacadores', 'Capitães Supernovas', 'bandido', 'forest'],
    ['Arquipélago de Sabaody', 'Arquipélago de Sabaody', 'Soldados da Marinha e Pacifistas', 'pacifista', 'Sentomaru e Pacifistas', 'ferreiro', 'forest'],
    ['Arquipélago de Sabaody', 'Arquipélago de Sabaody', 'Soldados da Marinha', 'marinha', 'Kizaru', 'paladino', 'forest'],
    ['Amazon Lily', 'Ilha das Mulheres', 'Guerreiras Kuja e animais selvagens', 'kuja', 'Sandersonia e Marigold', 'feiticeira', 'forest'],
    ['Impel Down', 'Prisão submarina Impel Down', 'Guardas e prisioneiros perigosos', 'prisao', 'Minotauro', 'yeti', 'volcano'],
    ['Impel Down', 'Prisão submarina Impel Down', 'Guardas e Jailer Beasts', 'prisao', 'Sadi', 'bruxa', 'volcano'],
    ['Impel Down', 'Prisão submarina Impel Down', 'Guardas de elite', 'prisao', 'Magellan', 'ferreiro', 'volcano'],
    ['Marineford', 'Quartel-general da Marinha em Marineford', 'Fuzileiros navais', 'marinha', 'Smoker', 'capitao'],
    ['Marineford', 'Quartel-general da Marinha em Marineford', 'Fuzileiros navais e Pacifistas', 'marinha', 'Aokiji', 'yeti'],
    ['Marineford', 'Quartel-general da Marinha em Marineford', 'Almirantes e forças de elite', 'marinha', 'Akainu', 'comandante'],
  ] },
  { id: 'gyoncorde', name: 'Ilha dos Homens-Peixe', bg: 'swamp', stages: [
    ['Retorno a Sabaody', 'Arquipélago de Sabaody', 'Falsos Chapéus de Palha e criminosos', 'piratas', 'Demalo Black', 'lenhador', 'forest'],
    ['Ilha dos Homens-Peixe', 'Ilha dos Homens-Peixe', 'Piratas e saqueadores', 'piratas', 'Caribou', 'mineiro'],
    ['Ilha dos Homens-Peixe', 'Palácio Ryugu', 'Novos Piratas Homens-Peixe', 'peixe', 'Daruma e Ikaros Much', 'cacador'],
    ['Ilha dos Homens-Peixe', 'Palácio Ryugu', 'Novos Piratas Homens-Peixe', 'peixe', 'Dosun e Zeo', 'viking'],
    ['Ilha dos Homens-Peixe', 'Palácio Ryugu', 'Novos Piratas Homens-Peixe', 'peixe', 'Hyouzou', 'bandido'],
    ['Ilha dos Homens-Peixe', 'Palácio Ryugu', 'Novos Piratas Homens-Peixe', 'peixe', 'Hody Jones (confronto inicial)', 'yeti'],
    ['Ilha dos Homens-Peixe', 'Palácio Ryugu', 'Novos Piratas Homens-Peixe', 'peixe', 'Vander Decken IX', 'cavaleiro'],
    ['Ilha dos Homens-Peixe', 'Floresta do Mar', 'Piratas do Vander Decken', 'peixe', 'Vander Decken IX (navio)', 'cavaleiro'],
    ['Ilha dos Homens-Peixe', 'Arca Noé', 'Novos Piratas Homens-Peixe', 'peixe', 'Hody Jones (batalha final)', 'yeti'],
    ['Ilha dos Homens-Peixe', 'Arca Noé', 'Soldados do reino', 'peixe', 'Hody Jones (Energy Steroids)', 'yeti'],
  ] },
  { id: 'dressrosa', name: 'Dressrosa', bg: 'village', stages: [
    ['Punk Hazard', 'Ilha Punk Hazard', 'Centauros e guardas de Caesar', 'lab', 'Brownbeard', 'nomade', 'volcano'],
    ['Punk Hazard', 'Ilha Punk Hazard', 'Soldados e criaturas experimentais', 'lab', 'Monet', 'feiticeira', 'snow'],
    ['Punk Hazard', 'Ilha Punk Hazard', 'Guardas do laboratório', 'lab', 'Vergo', 'comandante', 'snow'],
    ['Punk Hazard', 'Ilha Punk Hazard', 'Experimentos químicos e soldados', 'lab', 'Caesar Clown', 'bruxa', 'volcano'],
    ['Dressrosa', 'Reino de Dressrosa', 'Gladiadores e soldados de Doflamingo', 'reino', 'Bellamy', 'lenhador'],
    ['Dressrosa', 'Coliseu de Corrida', 'Gladiadores do Coliseu', 'reino', 'Diamante', 'fazendeiro'],
    ['Dressrosa', 'Reino de Dressrosa', 'Oficiais da Família Donquixote', 'reino', 'Pica', 'ferreiro'],
    ['Dressrosa', 'Reino de Dressrosa', 'Oficiais da Família Donquixote', 'reino', 'Trebol', 'mago'],
    ['Dressrosa', 'Reino de Dressrosa', 'Oficiais da Família Donquixote', 'reino', 'Dellinger e Senor Pink', 'bandido'],
    ['Dressrosa', 'Reino de Dressrosa', 'Soldados de Doflamingo e brinquedos', 'reino', 'Donquixote Doflamingo', 'sultao'],
  ] },
  { id: 'wholecake', name: 'Ilha Whole Cake', bg: 'sky', stages: [
    ['Zou', 'Ilha Zou, nas costas do elefante Zunesha', 'Guerreiros Mink', 'feras', 'Jack', 'yeti', 'forest'],
    ['Whole Cake', 'Totto Land e Ilha Whole Cake', 'Homens-biscoito e soldados de Big Mom', 'doces', 'Pekoms', 'viking'],
    ['Whole Cake', 'Floresta dos Seres Vivos', 'Soldados de Big Mom', 'doces', 'Cracker', 'cavaleiro'],
    ['Whole Cake', 'Totto Land e Ilha Whole Cake', 'Homens-espelho e subordinados de Big Mom', 'doces', 'Charlotte Brûlée', 'bruxa'],
    ['Whole Cake', 'Cidade dos Doces', 'Homens-doces e soldados da família Charlotte', 'doces', 'Charlotte Perospero', 'mago'],
    ['Whole Cake', 'Mundo dos Espelhos', 'Combatentes da família Charlotte', 'doces', 'Charlotte Katakuri (primeiro confronto)', 'lanceiro'],
    ['Whole Cake', 'Mundo dos Espelhos', 'Combatentes da família Charlotte', 'doces', 'Charlotte Katakuri (batalha final)', 'lanceiro'],
    ['Whole Cake', 'Castelo de Big Mom', 'Homies e soldados de Big Mom', 'doces', 'Charlotte Smoothie', 'feiticeira'],
    ['Whole Cake', 'Castelo de Big Mom', 'Homies e soldados de Big Mom', 'doces', 'Big Mom', 'fazendeiro'],
    ['Whole Cake', 'Mar de Totto Land', 'Navios de Big Mom', 'doces', 'Big Mom (perseguição)', 'fazendeiro'],
  ] },
  { id: 'wano', name: 'País de Wano', bg: 'castle', stages: [
    ['País de Wano', 'Kuri', 'Bandidos e soldados dos Piratas das Feras', 'wano', 'Basil Hawkins', 'mago', 'village'],
    ['País de Wano', 'Cidade de Bakura', 'Soldados dos Piratas das Feras', 'wano', 'Holdem', 'viking', 'village'],
    ['País de Wano', 'Prisão de Udon', 'Guardas e prisioneiros hostis', 'prisao', 'Babanuki', 'ferreiro', 'volcano'],
    ['País de Wano', 'Capital das Flores', 'Samurais do xogunato', 'wano', 'Orochi', 'sultao', 'village'],
    ['País de Wano', 'Onigashima', 'Gifters e soldados dos Piratas das Feras', 'wano', 'Page One e Ulti', 'lanceiro'],
    ['País de Wano', 'Onigashima', 'Headliners e soldados dos Piratas das Feras', 'wano', 'Black Maria', 'feiticeira'],
    ['País de Wano', 'Onigashima', 'Combatentes de elite dos Piratas das Feras', 'wano', 'Sasaki', 'comandante'],
    ['País de Wano', 'Onigashima', 'Piratas das Feras de elite', 'wano', 'King', 'cacador', 'volcano'],
    ['País de Wano', 'Onigashima', 'Piratas das Feras de elite', 'wano', 'Queen', 'ferreiro', 'volcano'],
    ['País de Wano', 'Onigashima', 'Piratas das Feras remanescentes', 'wano', 'Kaido', 'yeti', 'volcano'],
  ] },
];

const MUSIC = { forest: 0, village: 0, swamp: 1, desert: 1, snow: 2, castle: 2, volcano: 3, sky: 3 };

export const REGIONS = SAGA_DATA.map((sg, i) => {
  const stages = sg.stages.map(([arc, terr, foes, group, boss, look, bg], j) => {
    const b = bg || sg.bg;
    return { n: i + 1, s: j + 1, arc, terr, foes, enemies: F[group], boss, look, bg: b, music: MUSIC[b] };
  });
  return { id: sg.id, n: i + 1, name: sg.name, bg: sg.bg, music: MUSIC[sg.bg], stages };
});
export const STAGES_PER_CYCLE = REGIONS.length * 10;

export function stageInfo(g) {
  const ri = Math.floor((g - 1) / 10) % REGIONS.length;
  const cycle = Math.floor((g - 1) / STAGES_PER_CYCLE) + 1;
  const s = (g - 1) % 10 + 1;
  const saga = REGIONS[ri];
  const stage = saga.stages[s - 1];
  // region carries the per-stage look (biome, music, enemies, boss) so the battle and scene can read it directly
  const region = { ...saga, bg: stage.bg, music: stage.music, enemies: stage.enemies, boss: stage.look, bossName: stage.boss };
  const short = `${saga.n}-${s}`;
  const label = `${stage.arc} ${short}${cycle > 1 ? ` ★${cycle}` : ''}`;
  return { g, ri, saga, stage, region, cycle, s, label, short };
}
