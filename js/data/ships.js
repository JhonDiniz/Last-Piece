// Ships. The crew starts on a small rowboat and earns better ships along the
// journey. Every ship gives passive buffs (they grow with the ship level) and
// has a special ability that fires on its own.
//
// pas: passive bonuses at level 1 (fractions). ab: special ability.
// ab.kind: buff | shot (front enemy) | volley (all enemies) | guard (shield + heal) | stun (all)
export const SHIPS = [
  { id: 'bote', name: 'Bote', stage: 1, r: 0, hull: '#a8683a', sail: '#f4efe6', mast: 1, size: 0.62, fig: 'none', flag: 'jolly',
    pas: { aspd: 0.05, gold: 0.05 },
    ab: { name: 'Remada Rápida', every: 20, kind: 'buff', buff: { aspdPct: 0.2 }, dur: 5, desc: 'A cada 20 s, VATQ +20% por 5 s.' },
    lore: 'Um barquinho a remo. Pequeno, mas é o começo de tudo.' },
  { id: 'merry', name: 'Going Merry', stage: 5, r: 1, hull: '#c98a4a', sail: '#f4efe6', mast: 1, size: 0.86, fig: 'sheep', flag: 'straw',
    pas: { atk: 0.25, gold: 0.1 },
    ab: { name: 'Canhão de Proa', every: 12, kind: 'shot', pct: 600, desc: 'A cada 12 s, dispara um canhão que causa 600% do ATQ no inimigo da frente.' },
    lore: 'A caravela presente da Vila Syrup. Leva o bando pelo East Blue e além.' },
  { id: 'galeao', name: 'Galeão da Marinha', stage: 21, r: 2, hull: '#e8eef8', sail: '#f4efe6', mast: 2, size: 0.95, fig: 'none', flag: 'marine',
    pas: { hp: 0.5, atk: 0.2 },
    ab: { name: 'Salva de Canhões', every: 14, kind: 'volley', pct: 350, desc: 'A cada 14 s, uma salva de canhões causa 350% do ATQ a todos os inimigos.' },
    lore: 'Um navio de guerra capturado da Marinha. Resistente e bem armado.' },
  { id: 'sunny', name: 'Thousand Sunny', stage: 41, r: 3, hull: '#f2c14a', sail: '#f4efe6', mast: 1, size: 1.0, fig: 'lion', flag: 'straw',
    pas: { atk: 0.7, aspd: 0.1 },
    ab: { name: 'Gaon Cannon', every: 20, kind: 'volley', pct: 2500, desc: 'A cada 20 s, o Gaon Cannon causa 2500% do ATQ a todos os inimigos.' },
    lore: 'Construído por Franky com madeira de Adam. O navio dos sonhos.' },
  { id: 'mobydick', name: 'Moby Dick', stage: 61, r: 4, hull: '#f4efe6', sail: '#f4efe6', mast: 2, size: 1.08, fig: 'whale', flag: 'whitebeard',
    pas: { hp: 1.2, rec: 0.6, atk: 0.5 },
    ab: { name: 'Proteção do Pai', every: 18, kind: 'guard', shield: 0.3, heal: 0.2, desc: 'A cada 18 s, ganha um escudo de 30% do PV e recupera 20% do PV.' },
    lore: 'O lendário navio do Barba Branca, em forma de baleia.' },
  { id: 'redforce', name: 'Red Force', stage: 81, r: 5, hull: '#c0392b', sail: '#f4efe6', mast: 2, size: 1.08, fig: 'dragon', flag: 'shanks',
    pas: { atk: 1.2, crit: 0.1, cdmg: 0.5 },
    ab: { name: 'Haki de Shanks', every: 16, kind: 'stun', pct: 1200, stun: 2.5, desc: 'A cada 16 s, atordoa todos os inimigos por 2,5 s e causa 1200% do ATQ.' },
    lore: 'O navio do Ruivo. Poucos ousam cruzar o seu caminho.' },
  { id: 'oro', name: 'Oro Jackson', stage: 101, r: 6, hull: '#8a5a3a', sail: '#ffe9a8', mast: 2, size: 1.12, fig: 'none', flag: 'roger',
    pas: { atk: 2.0, hp: 1.0, gold: 0.5 },
    ab: { name: 'Ventos de Roger', every: 12, kind: 'buff', buff: { atk: 1.0 }, dur: 6, pct: 1500, desc: 'A cada 12 s, ATQ +100% por 6 s e um golpe de 1500% do ATQ no inimigo da frente.' },
    lore: 'O navio do Rei dos Piratas, que chegou ao fim do Grand Line.' },
];
export const SHIP = Object.fromEntries(SHIPS.map(s => [s.id, s]));
export const SHIP_MAX = 100;
export const RANK_NAMES = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico', 'Antigo'];
export const RANK_COLS = ['#c9cfdc', '#7ed957', '#3fa9ff', '#c55cff', '#ffa22e', '#ff4f6a', '#ffd23f'];

// passive bonus of a ship at a level, and ability strength
export const shipMul = lv => 1 + 0.12 * (lv - 1);
export const shipUpCost = (s, lv) => Math.round(60 * Math.pow(1.6, s.r) * Math.pow(1.13, lv - 1));
// ship is earned once this stage is reached
export const shipEarned = (s, maxStage) => maxStage >= s.stage;
