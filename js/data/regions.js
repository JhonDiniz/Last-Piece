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
    ['Romance Dawn', 'Vila Foosha e base da Marinha', 'Piratas de Alvida e soldados da Marinha', 'marinha', 'Alvida e Morgan', 'capitao'],
    ['Orange Town', 'Orange Town', 'Piratas palhaços', 'piratas', 'Buggy', 'fazendeiro'],
    ['Vila Syrup', 'Vila Syrup e mansão Kaya', 'Piratas do Gato Preto', 'piratas', 'Jango e Buchi', 'feiticeira', 'forest'],
    ['Baratie', 'Restaurante Baratie', 'Piratas do Krieg', 'piratas', 'Pearl', 'escudeiro'],
    ['Baratie', 'Restaurante Baratie', 'Piratas do Krieg', 'piratas', 'Don Krieg e Gin', 'comandante'],
    ['Arlong Park', 'Parque de Arlong', 'Homens-peixe', 'peixe', 'Kuroobi', 'viking', 'swamp'],
    ['Arlong Park', 'Parque de Arlong', 'Homens-peixe', 'peixe', 'Chew e Hatchan', 'cacador', 'swamp'],
    ['Arlong Park', 'Parque de Arlong', 'Homens-peixe', 'peixe', 'Arlong', 'yeti', 'swamp'],
    ['Loguetown', 'Cidade de Loguetown', 'Fuzileiros navais e caçadores de piratas', 'cacadores', 'Daddy Masterson e Smoker', 'cacador', 'castle'],
    ['Loguetown', 'Cidade de Loguetown', 'Fuzileiros navais', 'marinha', 'Smoker', 'capitao', 'castle'],
  ] },
  { id: 'alabasta', name: 'Alabasta', bg: 'desert', stages: [
    ['Reverse Mountain', 'Reverse Mountain e farol de Twin Cape', 'Animais marinhos e agentes da Baroque Works', 'baroque', 'Mr. 9 e Miss Wednesday', 'bandido', 'forest'],
    ['Whisky Peak', 'Whisky Peak', 'Caçadores de recompensas da Baroque Works', 'baroque', 'Mr. 5 e Miss Valentine', 'tocheiro', 'village'],
    ['Little Garden', 'Ilha pré-histórica de Little Garden', 'Dinossauros e agentes da Baroque Works', 'feras', 'Mr. 3 e Miss Goldenweek', 'mago', 'forest'],
    ['Ilha Drum', 'Reino de Drum', 'Soldados do reino e animais selvagens', 'reino', 'Chess e Kuromarimo', 'escudeiro', 'snow'],
    ['Ilha Drum', 'Reino de Drum', 'Guardas e subordinados de Wapol', 'reino', 'Wapol', 'yeti', 'snow'],
    ['Alabasta', 'Reino de Alabasta', 'Rebeldes e soldados reais', 'rebeldes', 'Mr. 2 Bon Clay', 'feiticeira'],
    ['Alabasta', 'Reino de Alabasta', 'Agentes da Baroque Works', 'baroque', 'Mr. 4 e Miss Merry Christmas', 'mineiro'],
    ['Alabasta', 'Reino de Alabasta', 'Agentes da Baroque Works', 'baroque', 'Mr. 1 e Miss Doublefinger', 'nomade'],
    ['Alabasta', 'Reino de Alabasta', 'Soldados e assassinos da Baroque Works', 'baroque', 'Crocodile', 'sultao'],
    ['Alabasta', 'Reino de Alabasta', 'Guardas e agentes da Baroque Works', 'baroque', 'Crocodile (batalha final)', 'sultao'],
  ] },
  { id: 'skypiea', name: 'Skypiea', bg: 'sky', stages: [
    ['Jaya', 'Ilha de Jaya e Mock Town', 'Piratas locais', 'piratas', 'Bellamy', 'lenhador', 'forest'],
    ['Jaya', 'Ilha de Jaya e Mock Town', 'Piratas do bando de Bellamy', 'piratas', 'Sarquiss', 'bandido', 'forest'],
    ['Jaya', 'Ilha de Jaya e Mock Town', 'Piratas e saqueadores', 'piratas', 'Bellamy (revanche)', 'lenhador', 'forest'],
    ['Jaya', 'Ilha de Jaya e Mock Town', 'Caçadores e piratas rivais', 'cacadores', 'Masira e Shoujou', 'viking', 'forest'],
    ['Jaya', 'Ilha de Jaya e Mock Town', 'Piratas do Novo Mundo', 'piratas', 'Marshall D. Teach (Barba Negra)', 'fazendeiro', 'forest'],
    ['Skypiea', 'Mar Branco, Upper Yard e ilha do céu', 'Guerreiros de Skypiea', 'ceu', 'Satori', 'mago'],
    ['Skypiea', 'Mar Branco, Upper Yard e ilha do céu', 'Guerreiros de Enel', 'ceu', 'Shura', 'lanceiro'],
    ['Skypiea', 'Mar Branco, Upper Yard e ilha do céu', 'Guerreiros de Enel', 'ceu', 'Gedatsu', 'nomade'],
    ['Skypiea', 'Mar Branco, Upper Yard e ilha do céu', 'Sacerdotes e soldados celestiais', 'ceu', 'Ohm e Holy', 'cavaleiro'],
    ['Skypiea', 'Mar Branco, Upper Yard e ilha do céu', 'Exército de Enel', 'ceu', 'Enel', 'paladino'],
  ] },
  { id: 'water7', name: 'Water 7', bg: 'castle', stages: [
    ['Long Ring Long Land', 'Long Ring Long Land', 'Piratas do bando Foxy', 'piratas', 'Foxy', 'fazendeiro', 'village'],
    ['Water 7', 'Cidade de Water 7', 'Capangas e agentes do Governo Mundial', 'governo', 'Franky Family (Zambai e subordinados)', 'ferreiro', 'village'],
    ['Water 7', 'Cidade de Water 7', 'Agentes da CP9', 'governo', 'Blueno', 'escudeiro', 'village'],
    ['Water 7', 'Cidade de Water 7', 'Agentes da CP9', 'governo', 'Rob Lucci (confronto inicial)', 'comandante', 'village'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Soldados do Governo Mundial', 'marinha', 'Baskerville', 'cavaleiro'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Agentes da CP9', 'governo', 'Fukuro', 'mineiro'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Agentes da CP9', 'governo', 'Kumadori e Jabra', 'viking'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Agentes da CP9', 'governo', 'Kaku', 'lanceiro'],
    ['Enies Lobby', 'Ilha judicial de Enies Lobby', 'Agentes da CP9', 'governo', 'Rob Lucci', 'comandante'],
    ['Pós-Enies Lobby', 'Vila Water 7 e arredores', 'Piratas e adversários ocasionais', 'piratas', 'Encerramento da saga', 'lenhador', 'village'],
  ] },
  { id: 'thriller', name: 'Thriller Bark', bg: 'swamp', stages: [
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis comuns', 'zumbis', 'Victoria Cindry e zumbis especiais', 'feiticeira'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis do cemitério', 'zumbis', 'Capitão John (zumbi)', 'bandido'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis animais', 'zumbis', 'Jigoro e Inuppe', 'cacador'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis especiais', 'zumbis', 'Ryuma', 'cavaleiro'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis e subordinados de Hogback', 'zumbis', 'Dr. Hogback', 'mago'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Soldados zumbis', 'zumbis', 'Absalom', 'viking'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis gigantes', 'zumbis', 'Oars', 'yeti'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis e criaturas de sombra', 'zumbis', 'Gecko Moria', 'bruxa'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis e soldados de Thriller Bark', 'zumbis', 'Gecko Moria (forma fortalecida)', 'bruxa'],
    ['Thriller Bark', 'Navio-ilha Thriller Bark', 'Zumbis remanescentes', 'zumbis', 'Oars e Gecko Moria (batalha final)', 'bruxa'],
  ] },
  { id: 'marineford', name: 'Guerra de Marineford', bg: 'castle', stages: [
    ['Arquipélago de Sabaody', 'Arquipélago de Sabaody', 'Piratas e caçadores de recompensas', 'cacadores', 'Duval e os Homens-Peixe voadores', 'bandido', 'forest'],
    ['Arquipélago de Sabaody', 'Arquipélago de Sabaody', 'Soldados da Marinha e Pacifistas', 'pacifista', 'Sentomaru e PX-4', 'ferreiro', 'forest'],
    ['Amazon Lily', 'Ilha das Mulheres', 'Guerreiras Kuja e animais selvagens', 'kuja', 'Boa Sandersonia e Boa Marigold', 'feiticeira', 'forest'],
    ['Impel Down', 'Prisão submarina Impel Down', 'Guardas e criaturas do primeiro nível', 'prisao', 'Minotaurus', 'yeti', 'volcano'],
    ['Impel Down', 'Prisão submarina Impel Down', 'Guardas e prisioneiros perigosos', 'prisao', 'Sadi e os Jailer Beasts', 'bruxa', 'volcano'],
    ['Impel Down', 'Prisão submarina Impel Down', 'Guardas de elite e agentes do Governo', 'prisao', 'Magellan', 'ferreiro', 'volcano'],
    ['Marineford', 'Quartel-general da Marinha em Marineford', 'Fuzileiros navais', 'marinha', 'Vice-almirantes da Marinha', 'capitao'],
    ['Marineford', 'Quartel-general da Marinha em Marineford', 'Fuzileiros navais e gigantes', 'marinha', 'Pacifistas e vice-almirantes', 'comandante'],
    ['Marineford', 'Quartel-general da Marinha em Marineford', 'Almirantes e forças de elite', 'marinha', 'Kizaru, Aokiji e Akainu', 'paladino'],
    ['Pós-Guerra', 'Amazon Lily e região de treinamento', 'Animais selvagens', 'feras', 'Treinamento de Luffy', 'cacador', 'forest'],
  ] },
  { id: 'gyoncorde', name: 'Ilha dos Homens-Peixe', bg: 'swamp', stages: [
    ['Retorno a Sabaody', 'Arquipélago de Sabaody', 'Falsos Chapéus de Palha e criminosos', 'piratas', 'Demalo Black', 'lenhador', 'forest'],
    ['Retorno a Sabaody', 'Arquipélago de Sabaody', 'Piratas falsos e subordinados', 'piratas', 'Caribou e Coribou', 'mineiro', 'forest'],
    ['Retorno a Sabaody', 'Arquipélago de Sabaody', 'Fuzileiros navais', 'marinha', 'Sentomaru', 'ferreiro', 'forest'],
    ['Retorno a Sabaody', 'Arquipélago de Sabaody', 'Pacifistas', 'pacifista', 'PX-5', 'comandante', 'forest'],
    ['Retorno a Sabaody', 'Arquipélago de Sabaody', 'Soldados da Marinha e Pacifistas', 'pacifista', 'PX-7', 'comandante', 'forest'],
    ['Ilha dos Homens-Peixe', 'Ilha dos Homens-Peixe e Palácio Ryugu', 'Novos Piratas Homens-Peixe', 'peixe', 'Hody Jones (confronto inicial)', 'yeti'],
    ['Ilha dos Homens-Peixe', 'Ilha dos Homens-Peixe e Palácio Ryugu', 'Homens-peixe e soldados rebeldes', 'peixe', 'Dosun e Zeo', 'viking'],
    ['Ilha dos Homens-Peixe', 'Ilha dos Homens-Peixe e Palácio Ryugu', 'Homens-peixe e combatentes de Hody', 'peixe', 'Daruma e Ikaros Much', 'cacador'],
    ['Ilha dos Homens-Peixe', 'Ilha dos Homens-Peixe e Palácio Ryugu', 'Homens-peixe e subordinados de Hody', 'peixe', 'Hyouzou', 'bandido'],
    ['Ilha dos Homens-Peixe', 'Ilha dos Homens-Peixe e Palácio Ryugu', 'Novos Piratas Homens-Peixe', 'peixe', 'Hody Jones (batalha final)', 'yeti'],
  ] },
  { id: 'dressrosa', name: 'Dressrosa', bg: 'village', stages: [
    ['Punk Hazard', 'Ilha Punk Hazard', 'Centauros e guardas de Caesar', 'lab', 'Brownbeard', 'nomade', 'volcano'],
    ['Punk Hazard', 'Ilha Punk Hazard', 'Soldados e criaturas experimentais', 'lab', 'Monet', 'feiticeira', 'snow'],
    ['Punk Hazard', 'Ilha Punk Hazard', 'Crianças gigantes e guardas do laboratório', 'lab', 'Vergo', 'comandante', 'snow'],
    ['Punk Hazard', 'Ilha Punk Hazard', 'Experimentos químicos e soldados', 'lab', 'Caesar Clown', 'bruxa', 'volcano'],
    ['Punk Hazard', 'Ilha Punk Hazard', 'Criaturas e subordinados de Caesar', 'lab', 'Caesar Clown (batalha final)', 'bruxa', 'volcano'],
    ['Dressrosa', 'Reino de Dressrosa', 'Gladiadores e soldados de Doflamingo', 'reino', 'Bellamy', 'lenhador'],
    ['Dressrosa', 'Reino de Dressrosa', 'Oficiais da Família Donquixote', 'reino', 'Lao G e Machvise', 'fazendeiro'],
    ['Dressrosa', 'Reino de Dressrosa', 'Oficiais da Família Donquixote', 'reino', 'Senor Pink e Dellinger', 'bandido'],
    ['Dressrosa', 'Reino de Dressrosa', 'Oficiais e combatentes do Coliseu', 'reino', 'Pica e Trebol', 'mago'],
    ['Dressrosa', 'Reino de Dressrosa', 'Soldados de Doflamingo e combatentes transformados', 'reino', 'Donquixote Doflamingo', 'sultao'],
  ] },
  { id: 'wholecake', name: 'Ilha Whole Cake', bg: 'sky', stages: [
    ['Zou', 'Ilha Zou, nas costas do elefante Zunesha', 'Guerreiros Mink', 'feras', 'Jack', 'yeti', 'forest'],
    ['Zou', 'Ilha Zou, nas costas do elefante Zunesha', 'Guardas e combatentes dos Piratas das Feras', 'feras', 'Sheepshead', 'viking', 'forest'],
    ['Whole Cake', 'Totto Land e Ilha Whole Cake', 'Homens-biscoito e soldados de Big Mom', 'doces', 'Cracker', 'cavaleiro'],
    ['Whole Cake', 'Totto Land e Ilha Whole Cake', 'Homens-espelho e subordinados de Big Mom', 'doces', 'Charlotte Brûlée', 'bruxa'],
    ['Whole Cake', 'Totto Land e Ilha Whole Cake', 'Homens-doces e soldados da família Charlotte', 'doces', 'Perospero', 'mago'],
    ['Whole Cake', 'Totto Land e Ilha Whole Cake', 'Combatentes da família Charlotte', 'doces', 'Charlotte Katakuri (primeiro confronto)', 'lanceiro'],
    ['Whole Cake', 'Totto Land e Ilha Whole Cake', 'Homens-biscoito, soldados e Homies', 'doces', 'Big Mom', 'fazendeiro'],
    ['Levely (Reverie)', 'Mary Geoise, terra sagrada', 'Guardas e soldados dos Dragões Celestiais', 'governo', 'Rob Lucci', 'comandante', 'castle'],
    ['Levely (Reverie)', 'Mary Geoise, terra sagrada', 'Agentes do CP0', 'governo', 'Agentes do CP0', 'cavaleiro', 'castle'],
    ['Levely (Reverie)', 'Mary Geoise, terra sagrada', 'Guardas de elite de Mary Geoise', 'governo', 'Imu', 'paladino', 'castle'],
  ] },
  { id: 'wano', name: 'País de Wano', bg: 'castle', stages: [
    ['País de Wano', 'Kuri', 'Bandidos e soldados dos Piratas das Feras', 'wano', 'Basil Hawkins', 'mago', 'village'],
    ['País de Wano', 'Cidade de Bakura', 'Soldados dos Piratas das Feras', 'wano', 'Holdem', 'viking', 'village'],
    ['País de Wano', 'Prisão de Udon', 'Guardas e prisioneiros hostis', 'prisao', 'Babanuki', 'ferreiro', 'volcano'],
    ['País de Wano', 'Região de Kuri', 'Ninjas e samurais do xogunato', 'wano', 'Kyoshiro (Denjiro)', 'nomade', 'village'],
    ['País de Wano', 'Onigashima — entrada do castelo', 'Gifters e soldados dos Piratas das Feras', 'wano', 'Page One e Ulti', 'lanceiro'],
    ['País de Wano', 'Onigashima — salão principal', 'Headliners e combatentes dos Piratas das Feras', 'wano', "Who's-Who", 'cacador'],
    ['País de Wano', 'Onigashima — áreas internas do castelo', 'Combatentes de elite dos Piratas das Feras', 'wano', 'Sasaki e Black Maria', 'feiticeira'],
    ['País de Wano', 'Onigashima — telhado do castelo', 'Piratas das Feras de elite', 'wano', 'King e Queen', 'comandante', 'volcano'],
    ['País de Wano', 'Onigashima — telhado de batalha', 'Piratas das Feras e combatentes de Kaido', 'wano', 'Kaido (primeira batalha decisiva)', 'yeti', 'volcano'],
    ['País de Wano', 'Onigashima — batalha final', 'Piratas das Feras remanescentes', 'wano', 'Kaido (forma híbrida e Dragão Azul)', 'yeti', 'volcano'],
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
