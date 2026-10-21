// Collectible slimes. The equipped one is the hero on the battlefield.
// ability: active effect from level 1; unique: extra effect from level 35;
// passives unlock at levels 10/25/50/75/100.
export const RANKS = ['B', 'A', 'S', 'SS'];
export const RANK_COL = ['#9ad14b', '#ffb02e', '#ff4f6a', '#c55cff'];

export const SLIMES = [
  { id: 'gelatino', name: 'Gelatino', r: 0, color: '#68dd8c', hat: 'crown', from: 'start',
    ability: { name: 'Ordem Real', every: 15, dur: 5, buff: { atk: 0.2 }, desc: 'A cada 15 s, aumenta o ATQ em 20% por 5 s.' },
    unique: { name: 'Coroa Brilhante', stat: 'gold', v: 0.1, desc: 'Ouro obtido +10%.' } },
  { id: 'brotinho', name: 'Brotinho', r: 0, color: '#9ad14b', hat: 'sprout', from: 'stage:11',
    ability: { name: 'Fotossíntese', every: 5, heal: 0.03, desc: 'A cada 5 s, recupera 3% do PV.' },
    unique: { name: 'Raízes', stat: 'hp', v: 0.2, desc: 'PV +20%.' } },
  { id: 'pirata', name: 'Capitã Gosma', r: 1, color: '#ffb347', hat: 'pirate', from: 'stage:21',
    ability: { name: 'Pilhagem', passive: { gold: 0.3 }, desc: 'Ouro obtido +30%.' },
    unique: { name: 'Mapa do Tesouro', stat: 'gold', v: 0.25, desc: 'Ouro obtido +25%.' } },
  { id: 'chef', name: 'Chef Gelatina', r: 1, color: '#ff6b6b', hat: 'chef', from: 'raid',
    ability: { name: 'Banquete', passive: { rec: 0.4 }, desc: 'Recuperação de PV +40%.' },
    unique: { name: 'Sobremesa', stat: 'hp', v: 0.3, desc: 'PV +30%.' } },
  { id: 'viking', name: 'Gosma Nórdica', r: 1, color: '#7be0d0', hat: 'viking', from: 'stage:41',
    ability: { name: 'Fúria Nórdica', every: 12, dur: 5, buff: { aspd: 0.5 }, desc: 'A cada 12 s, aumenta a VATQ em 50% por 5 s.' },
    unique: { name: 'Machado Gelado', stat: 'atk', v: 0.3, desc: 'ATQ +30%.' } },
  { id: 'ninja', name: 'Sombra Gosmenta', r: 1, color: '#b18cff', hat: 'ninja', from: 'mine',
    ability: { name: 'Passo Sombrio', passive: { dbl: 0.15 }, desc: 'Ataque Duplo +15%.' },
    unique: { name: 'Lâmina Oculta', stat: 'cdmg', v: 0.3, desc: 'Dano Crítico +30%.' } },
  { id: 'bruxinha', name: 'Bruxinha', r: 2, color: '#ff8fb5', hat: 'wizard', from: 'stage:31',
    ability: { name: 'Feitiço Estelar', every: 10, bolt: 500, desc: 'A cada 10 s, lança um feitiço que causa 500% do ATQ.' },
    unique: { name: 'Grimório', stat: 'skill', v: 0.4, desc: 'Dano de habilidades +40%.' } },
  { id: 'samurai', name: 'Lâmina Verde', r: 2, color: '#9ad14b', hat: 'samurai', from: 'boss',
    ability: { name: 'Corte Preciso', every: 12, dur: 6, buff: { crit: 0.3, cdmg: 0.1 }, desc: 'A cada 12 s, Chance de Crítico +30% e Dano Crítico +10% por 6 s.' },
    unique: { name: 'Explosão de Água', stat: 'atk', v: 0.5, desc: 'ATQ +50%.' } },
  { id: 'xerife', name: 'Xerife Geleia', r: 2, color: '#f0a14a', hat: 'cowboy', from: 'stage:61',
    ability: { name: 'Saque Rápido', passive: { crit: 0.2 }, desc: 'Chance de Crítico +20%.' },
    unique: { name: 'Estrela de Lata', stat: 'gold', v: 0.4, desc: 'Ouro obtido +40%.' } },
  { id: 'gelida', name: 'Rainha Gélida', r: 2, color: '#a0e6ff', hat: 'ice', from: 'stage:51',
    ability: { name: 'Sopro Gelado', passive: { slow: 0.25 }, desc: 'Inimigos 25% mais lentos.' },
    unique: { name: 'Coração de Gelo', stat: 'hp', v: 0.6, desc: 'PV +60%.' } },
  { id: 'dj', name: 'DJ Gosma', r: 2, color: '#8fa8ff', hat: 'headphones', from: 'shop',
    ability: { name: 'Batida Forte', passive: { aspd: 0.25 }, desc: 'VATQ +25%.' },
    unique: { name: 'Grave Pesado', stat: 'skill', v: 0.5, desc: 'Dano de habilidades +50%.' } },
  { id: 'anjo', name: 'Gosma Anjo', r: 3, color: '#d07bff', hat: 'angel', from: 'stage:71',
    ability: { name: 'Bênção', revive: 0.5, desc: 'Revive uma vez por fase com 50% do PV.' },
    unique: { name: 'Auréola', stat: 'hp', v: 1.0, desc: 'PV +100%.' } },
  { id: 'diabrete', name: 'Diabrete', r: 3, color: '#5ee0a8', hat: 'horns', from: 'raid',
    ability: { name: 'Chamas Travessas', every: 8, nova: 1000, desc: 'A cada 8 s, chamas causam 1000% do ATQ a todos.' },
    unique: { name: 'Tridente', stat: 'atk', v: 1.0, desc: 'ATQ +100%.' } },
  { id: 'astronauta', name: 'Astrogosma', r: 3, color: '#c2c2d6', hat: 'astronaut', from: 'stage:81',
    ability: { name: 'Gravidade Zero', passive: { atk: 0.5, slow: 0.2 }, desc: 'ATQ +50% e inimigos 20% mais lentos.' },
    unique: { name: 'Propulsor', stat: 'aspd', v: 0.3, desc: 'VATQ +30%.' } },
  { id: 'brasa', name: 'Brasa', r: 3, color: '#ff9a6b', hat: 'flame', from: 'mine',
    ability: { name: 'Inferno', passive: { skill: 0.8 }, desc: 'Dano de habilidades +80%.' },
    unique: { name: 'Fornalha', stat: 'atk', v: 1.2, desc: 'ATQ +120%.' } },
  { id: 'florzinha', name: 'Florzinha', r: 2, color: '#ffd84a', hat: 'flower', from: 'boss',
    ability: { name: 'Pólen Mágico', passive: { cdr: 0.15 }, desc: 'Recarga das habilidades -15%.' },
    unique: { name: 'Primavera', stat: 'rec', v: 1.0, desc: 'Recuperação de PV +100%.' } },
];
export const SLIME = Object.fromEntries(SLIMES.map(s => [s.id, s]));

// passive bonuses by level milestone (index = milestone 10/25/50/75/100)
export const MILESTONES = [10, 25, 50, 75, 100];
export const MILESTONE_BONUS = [
  { stat: 'atk', v: [0.1, 0.2, 0.35, 0.6] },
  { stat: 'hp', v: [0.1, 0.2, 0.35, 0.6] },
  { stat: 'gold', v: [0.05, 0.1, 0.18, 0.3] },
  { stat: 'atk', v: [0.2, 0.4, 0.7, 1.2] },
  { stat: 'all', v: [0.2, 0.4, 0.7, 1.2] },
];
export const UNIQUE_LV = 35;
export const SLIME_MAX = 100;
// fragments needed to go from lv to lv+1 ("0/30"-style counter)
export const slimeNeed = lv => 2 + Math.floor(lv / 4);
// base collection bonus per owned slime level (% ATQ and PV)
export const slimeBase = (r, lv) => [4, 8, 15, 28][r] * lv;
