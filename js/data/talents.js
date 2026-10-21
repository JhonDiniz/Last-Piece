// Rebirth talents bought with essence.
export const TALENTS = [
  { id: 'atk', name: 'Força Real', icon: 'sword', max: 50, per: 0.5, stat: 'atk', desc: 'ATQ +{v}' },
  { id: 'hp', name: 'Geleia Robusta', icon: 'heart', max: 50, per: 0.5, stat: 'hp', desc: 'PV +{v}' },
  { id: 'gold', name: 'Tesouraria', icon: 'gold', max: 50, per: 0.25, stat: 'gold', desc: 'Ouro +{v}' },
  { id: 'skill', name: 'Sabedoria', icon: 'book', max: 30, per: 0.3, stat: 'skill', desc: 'Dano de habilidades +{v}' },
  { id: 'offline', name: 'Soneca Real', icon: 'clock', max: 20, per: 0.1, stat: 'offline', desc: 'Ganhos offline +{v} e limite +1 h' },
  { id: 'start', name: 'Atalho', icon: 'flag', max: 10, per: 5, stat: 'start', desc: 'Começa {v} fases à frente após renascer', flat: true },
  { id: 'crit', name: 'Olhar Aguçado', icon: 'crit', max: 20, per: 0.01, stat: 'crit', desc: 'Chance de Crítico +{v}' },
  { id: 'summon', name: 'Sorte de Invocador', icon: 'gem', max: 10, per: 0.03, stat: 'discount', desc: 'Invocações {v} mais baratas' },
];
export const TALENT = Object.fromEntries(TALENTS.map(t => [t.id, t]));
export const talentCost = (t, lv) => Math.ceil((t.flat ? 5 : 1) * Math.pow(1.35, lv) * (lv + 1));
