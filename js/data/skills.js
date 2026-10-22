// Active skills. dmg is % of ATQ per hit; passive is % ATQ granted to the
// collection while owned (grows with level, as observed in play).
export const SKILLS = [
  { id: 'gota', name: 'Gota Gigante', g: 0, cd: 6, dmg: 280, hits: 1, fx: 'drop', col: '#68dd8c', sym: 'drop',
    desc: 'Uma gota gigante de geleia despenca sobre os inimigos da frente, causando {d} do ATQ em área.' },
  { id: 'cuspe', name: 'Cuspe Ácido', g: 0, cd: 5, dmg: 140, hits: 3, fx: 'acid', col: '#b6e04a', sym: 'blobs',
    desc: 'Dispara 3 bolhas ácidas que causam {d} do ATQ cada.' },
  { id: 'quique', name: 'Quique Duplo', g: 0, cd: 7, dmg: 190, hits: 2, fx: 'slam', col: '#5cc8ff', sym: 'bounce',
    desc: 'Salta duas vezes sobre o alvo, causando {d} do ATQ por impacto.' },
  { id: 'frenesi', name: 'Frenesi', g: 1, cd: 10, buff: { aspd: 1.0 }, dur: 8, fx: 'buff', col: '#ff9a2e', sym: 'bolt',
    desc: 'Aumenta a VATQ em {b} por {t} segundos.' },
  { id: 'bolhas', name: 'Chuva de Bolhas', g: 1, cd: 9, dmg: 90, hits: 8, fx: 'bubbles', col: '#8be0ff', sym: 'bubbles',
    desc: 'Faz chover 8 bolhas que estouram causando {d} do ATQ cada.' },
  { id: 'escudo', name: 'Escudo de Geleia', g: 1, cd: 15, buff: { shield: 0.3, heal: 0.1 }, dur: 8, fx: 'shield', col: '#7be0d0', sym: 'shield',
    desc: 'Cria um escudo que absorve {s} do PV máximo por {t} segundos e cura {h}.' },
  { id: 'mare', name: 'Onda de Maré', g: 2, cd: 10, dmg: 420, hits: 1, fx: 'wave', col: '#3fa9ff', sym: 'wave',
    desc: 'Uma onda atravessa a tela, causando {d} do ATQ a todos e empurrando-os.' },
  { id: 'raio', name: 'Raio Encadeado', g: 2, cd: 9, dmg: 360, hits: 5, fx: 'chain', col: '#ffe14a', sym: 'bolt2',
    desc: 'Um raio salta entre até 5 inimigos, causando {d} do ATQ em cada.' },
  { id: 'gelo', name: 'Espinhos de Gelo', g: 2, cd: 11, dmg: 400, hits: 1, fx: 'ice', col: '#bdf3ff', sym: 'ice', slow: 0.4,
    desc: 'Espinhos de gelo brotam do chão: {d} do ATQ a todos e lentidão por 4 segundos.' },
  { id: 'olho', name: 'Olho Crítico', g: 2, cd: 14, buff: { crit: 0.3, cdmg: 0.5 }, dur: 8, fx: 'buff', col: '#ff4d6d', sym: 'eye',
    desc: 'Aumenta a Chance de Crítico em 30% e o Dano Crítico em 50% por {t} segundos.' },
  { id: 'meteoro', name: 'Meteoro', g: 3, cd: 13, dmg: 900, hits: 1, fx: 'meteor', col: '#ff7a2a', sym: 'meteor',
    desc: 'Invoca um meteoro que explode causando {d} do ATQ em área.' },
  { id: 'tornado', name: 'Tornado', g: 3, cd: 14, dmg: 160, hits: 8, fx: 'tornado', col: '#c8f0e0', sym: 'tornado',
    desc: 'Um tornado avança pelo campo atingindo 8 vezes, {d} do ATQ por golpe.' },
  { id: 'clones', name: 'Clones Sombrios', g: 3, cd: 18, summon: 2, dur: 10, fx: 'clones', col: '#c55cff', sym: 'twins',
    desc: 'Invoca 2 clones de sombra que lutam por {t} segundos com 50% do seu ATQ.' },
  { id: 'dragao', name: 'Sopro de Dragão', g: 4, cd: 15, dmg: 140, hits: 12, fx: 'breath', col: '#ff5a2a', sym: 'fire',
    desc: 'Cospe uma torrente de fogo: 12 golpes de {d} do ATQ.' },
  { id: 'martelo', name: 'Martelo Celeste', g: 4, cd: 16, dmg: 2200, hits: 1, fx: 'hammer', col: '#ffd23f', sym: 'hammer', bossX: 2,
    desc: 'Um martelo dourado cai do céu: {d} do ATQ ao alvo. Dano dobrado contra chefes.' },
  { id: 'vortice', name: 'Vórtice Sombrio', g: 5, cd: 18, dmg: 3000, hits: 1, fx: 'vortex', col: '#7a3ab0', sym: 'vortex',
    desc: 'Abre um vórtice que puxa os inimigos e causa {d} do ATQ a todos.' },
  { id: 'estrelas', name: 'Chuva de Estrelas', g: 5, cd: 17, dmg: 260, hits: 20, fx: 'stars', col: '#ffe680', sym: 'star',
    desc: '20 estrelas cadentes caem sobre o campo, {d} do ATQ cada.' },
  { id: 'supernova', name: 'Supernova', g: 6, cd: 22, dmg: 8000, hits: 1, fx: 'nova', col: '#ff4f6a', sym: 'nova',
    desc: 'O capitão brilha e explode em luz: {d} do ATQ a todos os inimigos.' },
  { id: 'decreto', name: 'Decreto Real', g: 6, cd: 20, dmg: 1500, hits: 2, buff: { atk: 1.5 }, dur: 10, fx: 'decree', col: '#ffcc3a', sym: 'crown',
    desc: 'Ouro chove sobre o campo ({d} do ATQ, 2 vezes) e o ATQ aumenta 150% por {t} segundos.' },
  { id: 'genese', name: 'Gênese', g: 7, cd: 25, dmg: 20000, hits: 1, buff: { atk: 1.0 }, dur: 10, fx: 'genesis', col: '#fff3a6', sym: 'genesis',
    desc: 'O primeiro brilho do reino: {d} do ATQ a todos e +100% de ATQ por {t} segundos.' },
];
export const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));

const PASSIVE = [10, 30, 60, 120, 250, 500, 1000, 2000];
export const skillPassive = (s, lv) => PASSIVE[s.g] * (1 + 0.62 * (lv - 1));        // % ATQ
export const skillDmg = (s, lv) => (s.dmg || 0) * (1 + 0.12 * (lv - 1));             // % ATQ per hit
export const skillCd = (s, lv) => s.cd;
export const skillsBy = g => SKILLS.filter(s => s.g === g);
