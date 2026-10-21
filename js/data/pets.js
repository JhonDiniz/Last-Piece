// Companions fight beside the slime. atk = fraction of the slime's ATQ per hit.
export const PETS = [
  { id: 'pintinho', name: 'Pintinho', g: 0, kind: 'melee', body: '#ffe14a', proj: null },
  { id: 'gato', name: 'Gato Preto', g: 0, kind: 'melee', body: '#3a3550', proj: null },
  { id: 'morcego', name: 'Morcego', g: 1, kind: 'ranged', body: '#7a5aa8', proj: 'wave', fly: true },
  { id: 'sapo', name: 'Sapo Saltador', g: 1, kind: 'melee', body: '#6fcf4a', proj: null },
  { id: 'raposa', name: 'Raposa de Fogo', g: 2, kind: 'ranged', body: '#ff8a3a', proj: 'fire' },
  { id: 'abelha', name: 'Abelha Rainha', g: 2, kind: 'ranged', body: '#ffcc3a', proj: 'sting', fly: true },
  { id: 'coruja', name: 'Coruja Arcana', g: 3, kind: 'ranged', body: '#8a6bd0', proj: 'orb', fly: true },
  { id: 'fantasma', name: 'Fantasminha', g: 3, kind: 'ranged', body: '#e8f0ff', proj: 'orb', fly: true },
  { id: 'dragaozinho', name: 'Dragãozinho', g: 4, kind: 'ranged', body: '#ff5a5a', proj: 'fire', fly: true },
  { id: 'unicornio', name: 'Unicórnio', g: 4, kind: 'ranged', body: '#fff0fa', proj: 'rainbow' },
  { id: 'fenix', name: 'Fênix', g: 5, kind: 'ranged', body: '#ff7a2a', proj: 'fire', fly: true },
  { id: 'golem', name: 'Golem de Cristal', g: 5, kind: 'melee', body: '#7ee0ff', proj: null },
  { id: 'polvo', name: 'Polvo Cósmico', g: 6, kind: 'ranged', body: '#c55cff', proj: 'ink', fly: true },
  { id: 'estrela', name: 'Estrela Viva', g: 6, kind: 'ranged', body: '#ffe680', proj: 'star', fly: true },
  { id: 'leao', name: 'Leão Solar', g: 7, kind: 'melee', body: '#ffb02e', proj: null },
  { id: 'baleia', name: 'Baleia Celeste', g: 7, kind: 'ranged', body: '#5cc8ff', proj: 'orb', fly: true },
];
export const PET = Object.fromEntries(PETS.map(p => [p.id, p]));

const ATK = [0.45, 0.6, 0.8, 1.1, 1.5, 2.1, 3.0, 4.2];
const SPD = [0.46, 0.52, 0.6, 0.68, 0.78, 0.88, 1.0, 1.15];
const PAS = [5, 12, 25, 50, 100, 200, 400, 800];
export const petAtk = (p, lv) => ATK[p.g] * (1 + 0.2 * (lv - 1));
export const petSpd = (p, lv) => SPD[p.g] * (1 + 0.02 * (lv - 1));
export const petPassive = (p, lv) => PAS[p.g] * (1 + 0.248 * (lv - 1));     // % ATQ
// companion slots open with progress
export const PET_SLOTS = [0, 30, 60, 100, 150];   // max stage needed (0 = when the feature opens)
