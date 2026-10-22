// Mastery tree: the captain spends skill points (SP, one per level) on nodes.
// A node opens when every parent has at least REQ_LV points (or is maxed, if
// its max is lower) and the captain reached the node's level (lv).
// stat: what the node raises; per: amount per point (fractions, 0.03 = 3%).
export const REQ_LV = 5;

const pct = (v, d = 0) => (v * 100).toFixed(d).replace('.', ',') + '%';

export const TREES = [
  { k: 'base', name: 'Treino', nodes: [
    { id: 'forca', name: 'Força Bruta', icon: 'sword', col: '#ff5a5f', stat: 'atk', per: 0.03, max: 10, at: [1, 0] },
    { id: 'vigor', name: 'Vigor', icon: 'heart', col: '#ff4d7e', stat: 'hp', per: 0.04, max: 15, at: [0, 1], req: ['forca'] },
    { id: 'treino', name: 'Treino Duro', icon: 'sword', col: '#ff7a5a', stat: 'atk', per: 0.03, max: 15, at: [1, 1], req: ['forca'] },
    { id: 'ganancia', name: 'Olho no Tesouro', icon: 'gold', col: '#ffcc3a', stat: 'gold', per: 0.05, max: 10, at: [2, 1], req: ['forca'] },
    { id: 'resist', name: 'Pele de Aço', icon: 'heart', col: '#c3cfdf', stat: 'def', per: 0.01, max: 20, at: [0, 2], req: ['vigor'] },
    { id: 'agil', name: 'Reflexos', icon: 'speed', col: '#4cb8ff', stat: 'aspd', per: 0.015, max: 20, at: [1, 2], req: ['treino'] },
    { id: 'estudo', name: 'Experiência', icon: 'star', col: '#7ed957', stat: 'xp', per: 0.05, max: 10, at: [2, 2], req: ['ganancia'] },
    { id: 'regen', name: 'Fôlego', icon: 'regen', col: '#3fcf8e', stat: 'rec', per: 0.08, max: 15, at: [0, 3], req: ['resist'] },
    { id: 'precisao', name: 'Olhar Afiado', icon: 'crit', col: '#ffb02e', stat: 'crit', per: 0.006, max: 20, at: [1, 3], req: ['agil'] },
    { id: 'cacador', name: 'Caçador de Chefes', icon: 'bossdmg', col: '#e84a8a', stat: 'boss', per: 0.04, max: 15, at: [2, 3], req: ['estudo'] },
    { id: 'vital', name: 'Vitalidade', icon: 'heart', col: '#ff4d6d', stat: 'hp', per: 0.06, max: 15, at: [0, 4], req: ['regen'] },
    { id: 'golpe', name: 'Golpe Crítico', icon: 'burst', col: '#ff7a2e', stat: 'cdmg', per: 0.06, max: 20, at: [1, 4], req: ['precisao'] },
    { id: 'duplo', name: 'Combo', icon: 'double', col: '#4fd8c8', stat: 'dbl', per: 0.01, max: 15, at: [2, 4], req: ['cacador'] },
    { id: 'furia', name: 'Espírito Pirata', icon: 'pirate', col: '#ffe14a', stat: 'atk', per: 0.1, max: 10, at: [1, 5], req: ['vital', 'golpe', 'duplo'] },
  ] },
  { k: 'haki', name: 'Haki', lv: 15, nodes: [
    { id: 'obs', name: 'Haki da Observação', haki: '#7ee0ff', stat: 'dodge', per: 0.01, max: 20, lv: 15, at: [1, 0] },
    { id: 'futuro', name: 'Visão do Futuro', haki: '#a8f0ff', stat: 'crit', per: 0.008, max: 10, lv: 25, at: [0, 1], req: ['obs'] },
    { id: 'arm', name: 'Haki do Armamento', haki: '#8a6bd0', stat: 'arm', per: 0.06, max: 20, lv: 30, at: [1, 1], req: ['obs'] },
    { id: 'sentir', name: 'Sentir Presença', haki: '#7ee0ff', stat: 'dodge', per: 0.005, max: 10, lv: 25, at: [2, 1], req: ['obs'] },
    { id: 'endurecer', name: 'Endurecimento', haki: '#5a3ab0', stat: 'def', per: 0.01, max: 15, lv: 35, at: [0, 2], req: ['arm'] },
    { id: 'emissao', name: 'Emissão', haki: '#b08aff', stat: 'boss', per: 0.05, max: 15, lv: 40, at: [2, 2], req: ['arm'] },
    { id: 'king', name: 'Haki do Rei', haki: '#ffcc3a', stat: 'king', per: 1, max: 20, lv: 50, at: [1, 3], req: ['endurecer', 'emissao'] },
    { id: 'dominio', name: 'Domínio', haki: '#ffe680', stat: 'kingCd', per: 1, max: 10, lv: 60, at: [0, 4], req: ['king'] },
    { id: 'coroa', name: 'Revestimento do Rei', haki: '#ff9a3a', stat: 'kingDmg', per: 1, max: 10, lv: 70, at: [2, 4], req: ['king'] },
  ] },
];
export const NODE = {};
for (const t of TREES) for (const n of t.nodes) { n.tree = t.k; NODE[n.id] = n; }

// Haki do Rei: pulse every few seconds, stuns and hits every enemy
export const kingEvery = (lv, dom) => Math.max(8, 24 - Math.floor(lv / 4) - dom);
export const kingDmg = (lv, crown) => (300 + lv * 60) * (1 + crown * 0.5);

export function nodeDesc(n, p) {
  const v = n.per * p;
  switch (n.stat) {
    case 'atk': return `ATQ +${pct(v)}`;
    case 'hp': return `PV +${pct(v)}`;
    case 'gold': return `Ouro obtido +${pct(v)}`;
    case 'def': return `Dano recebido -${pct(v)}`;
    case 'aspd': return `VATQ +${pct(v, 1)}`;
    case 'xp': return `XP obtido +${pct(v)}`;
    case 'rec': return `Recuperação de PV +${pct(v)}`;
    case 'crit': return `Chance de crítico +${pct(v, 1)}`;
    case 'boss': return `Dano em chefes +${pct(v)}`;
    case 'cdmg': return `Dano crítico +${pct(v)}`;
    case 'dbl': return `Ataque duplo +${pct(v)}`;
    case 'dodge': return `Esquiva +${pct(v, 1)}`;
    case 'arm': return `Dano de todos os ataques +${pct(v)}`;
    case 'king': return p ? `A cada ${kingEvery(p, 0)} s atordoa os inimigos por 2 s e causa ${kingDmg(p, 0)}% do ATQ a todos` : 'Desperta o Haki do Rei';
    case 'kingCd': return `Haki do Rei ${p} s mais frequente`;
    case 'kingDmg': return `Dano do Haki do Rei +${p * 50}%`;
    default: return '';
  }
}
