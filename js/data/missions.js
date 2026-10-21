// Guided missions. The first 60 are hand-made (several match the observed
// order and rewards); after that missions are generated in a cycle.
// type: up (attribute level), stage (clear stage n), sum (cumulative summons),
// equip, auto, skilllv, kills, raid, mine, rush, rebirth
const M = [
  ['up', 'atk', 3, 100], ['up', 'atk', 5, 100], ['up', 'hp', 5, 100], ['stage', 0, 1, 500], ['up', 'atk', 10, 100],
  ['up', 'hp', 10, 100], ['stage', 0, 2, 1500], ['sum', 'skill', 35, 500], ['up', 'atk', 25, 100], ['up', 'hp', 30, 100],
  ['stage', 0, 3, 300], ['up', 'atk', 30, 100], ['equip', 'skill', 1, 100], ['sum', 'skill', 70, 500], ['auto', 0, 1, 100],
  ['sum', 'gear', 35, 500], ['equip', 'weapon', 1, 100], ['stage', 0, 5, 300], ['up', 'atk', 40, 100], ['up', 'hp', 40, 100],
  ['stage', 0, 7, 300], ['up', 'atk', 50, 200], ['up', 'aspd', 5, 200], ['sum', 'skill', 105, 500], ['sum', 'pet', 35, 500],
  ['equip', 'pet', 1, 100], ['up', 'hp', 60, 100], ['stage', 0, 10, 500], ['skilllv', 0, 10, 300], ['raid', 0, 1, 500],
  ['up', 'atk', 80, 100], ['up', 'hp', 80, 1500], ['sum', 'any', 150, 500], ['stage', 0, 13, 300], ['up', 'aspd', 10, 200],
  ['mine', 0, 10, 500], ['up', 'atk', 100, 300], ['up', 'hp', 100, 300], ['stage', 0, 16, 300], ['kills', 0, 500, 300],
  ['sum', 'gear', 105, 500], ['rush', 0, 1, 500], ['up', 'atk', 130, 300], ['stage', 0, 20, 500], ['up', 'crit', 10, 300],
  ['sum', 'skill', 210, 500], ['raid', 0, 5, 500], ['stage', 0, 25, 500], ['up', 'aspd', 20, 300], ['sum', 'pet', 105, 500],
  ['mine', 0, 50, 500], ['up', 'atk', 160, 300], ['stage', 0, 30, 500], ['up', 'crit', 30, 300], ['rush', 0, 3, 500],
  ['sum', 'any', 600, 1000], ['up', 'hp', 150, 300], ['stage', 0, 40, 500], ['up', 'atk', 200, 500], ['stage', 0, 50, 1000],
];

// features unlocked when the current mission index reaches the value
export const UNLOCK = { skills: 8, gear: 16, pets: 25, raid: 30, mine: 36, rush: 42 };
export const UNLOCK_NAMES = { skills: 'Habilidade', gear: 'Equipamento', pets: 'Companheiro', raid: 'Incursão', mine: 'Mina', rush: 'Rei Toupeira' };

const CYCLE = ['up:atk', 'stage', 'sum:any', 'up:hp', 'raid', 'stage', 'up:aspd', 'mine', 'sum:skill', 'rush', 'stage', 'up:crit'];

export function missionAt(i) {
  if (i <= M.length) { const [t, k, n, r] = M[i - 1]; return { t, k, n, r }; }
  const j = i - M.length - 1, step = Math.floor(j / CYCLE.length) + 1;
  const [t, k] = CYCLE[j % CYCLE.length].split(':');
  const base = { 'up:atk': 200 + step * 25, 'up:hp': 150 + step * 20, 'up:aspd': 20 + step * 8, 'up:crit': 30 + step * 8, stage: 50 + step * 5 + (j % CYCLE.length), 'sum:any': 600 + step * 150, 'sum:skill': 210 + step * 70, raid: 5 + step * 2, mine: 50 + step * 30, rush: 3 + step };
  const n = base[k ? `${t}:${k}` : t];
  return { t, k: k || 0, n: Math.round(n), r: t === 'stage' ? 600 : 400 };
}

const UPN = { atk: 'ATQ', hp: 'PV', aspd: 'VATQ', crit: 'Chance de Crítico', rec: 'Recuperação de PV' };
const SUMN = { skill: 'Habilidade', gear: 'Equipamento', pet: 'Companheiro', any: 'qualquer coisa' };
const EQN = { skill: 'uma Habilidade', weapon: 'uma Arma', pet: 'um Companheiro' };
export function missionText(m, stageLabel) {
  switch (m.t) {
    case 'up': return `Melhore ${UPN[m.k] || m.k}`;
    case 'stage': return `Conclua ${stageLabel(m.n)}`;
    case 'sum': return `Invoque ${SUMN[m.k]}`;
    case 'equip': return `Equipe ${EQN[m.k]}`;
    case 'auto': return 'Ative a Habilidade Automática';
    case 'skilllv': return 'Nível total das habilidades';
    case 'kills': return 'Derrote inimigos';
    case 'raid': return 'Complete Incursões';
    case 'mine': return 'Cave blocos na Mina';
    case 'rush': return 'Desafie o Rei Toupeira';
    default: return '';
  }
}
