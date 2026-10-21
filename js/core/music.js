// Original chiptune loops. Each voice is a list of MIDI notes per 16th step
// (null = rest). Written as bars of 16 steps for readability.
const P = s => s.trim().split(/\s+/).map(x => (x === '.' ? null : Number(x)));
const rep = (arr, n) => Array.from({ length: n }, () => arr).flat();
const chordArp = (chords, notesPer = 16) => chords.flatMap(c => Array.from({ length: notesPer }, (_, i) => c[i % c.length]));
const bassLine = (roots, pat = [0, null, null, null, 12, null, 0, null, 0, null, null, null, 7, null, 12, null]) =>
  roots.flatMap(r => pat.map(p => (p === null ? null : r + p)));
const drums = (bars, kick = 'x . . . . . . . x . . . . . . .', snare = '. . . . x . . . . . . . x . . .', hat = 'x . x . x . x . x . x . x . x .') => {
  const f = s => s.trim().split(/\s+/).map(c => (c === 'x' ? 1 : null));
  return { kick: rep(f(kick), bars), snare: rep(f(snare), bars), hat: rep(f(hat), bars) };
};

// ---- 0: Bosque (C major, bright) ----
const t0mel = P(`
76 . 79 . 84 . 79 . 81 . 79 . 76 . 74 .
74 . 71 . 74 . 79 . 77 . 76 . 74 . 71 .
72 . 76 . 81 . 76 . 79 . 77 . 76 . 72 .
77 . 81 . 84 . 81 . 79 . . . 77 . . .
76 . 79 . 84 . 79 . 81 . 79 . 76 . 79 .
83 . 81 . 79 . 74 . 76 . 77 . 79 . 74 .
77 . 76 . 74 . 72 . 74 . 76 . 77 . 81 .
79 . . . 74 . 71 . 72 . . . . . . .`);
const t0ch = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65], [60, 64, 67, 72], [55, 59, 62, 67], [53, 57, 60, 65], [55, 59, 62, 67]];
const d0 = drums(8);

// ---- 1: Pântano / Deserto (A minor, mysterious) ----
const t1mel = P(`
69 . . 72 . . 76 . 74 . 72 . 71 . . .
65 . . 69 . . 72 . 71 . 69 . 67 . . .
67 . . 71 . . 74 . 72 . 71 . 69 . 71 .
68 . . . 71 . . . 76 . . . 74 . . .
69 . 72 . 76 . 81 . 79 . 76 . 74 . 72 .
77 . 76 . 74 . 72 . 74 . . . 72 . . .
71 . 72 . 74 . 76 . 79 . 77 . 76 . 74 .
76 . . . 75 . . . 76 . . . . . . .`);
const t1ch = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59], [57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]];
const d1 = drums(8, 'x . . . . . x . x . . . . . . .', '. . . . x . . . . . . . x . . x', 'x . . x x . . x x . . x x . x .');

// ---- 2: Gelo / Cidadela (D minor, epic) ----
const t2mel = P(`
74 . . . 77 . 81 . 79 . 77 . 76 . 77 .
70 . . . 74 . 77 . 76 . 74 . 72 . 70 .
72 . . . 76 . 79 . 77 . 76 . 74 . 72 .
73 . . . 76 . . . 81 . . . 79 . 76 .
74 . 77 . 81 . 86 . 84 . 81 . 79 . 77 .
82 . 81 . 79 . 77 . 79 . . . 74 . . .
76 . 77 . 79 . 81 . 79 . 77 . 76 . 73 .
74 . . . . . . . 74 . 72 . 73 . . .`);
const t2ch = [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64], [62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]];
const d2 = drums(8, 'x . . x . . x . x . . x . . . .', '. . . . x . . . . . . . x . x .', 'x x x x x x x x x x x x x x x x');

// ---- 3: Vulcão / Céu (E minor, driving) ----
const t3mel = P(`
76 . 79 . 83 . 79 . 76 . 79 . 83 . 86 .
84 . 83 . 79 . 76 . 79 . . . 72 . . .
74 . 78 . 81 . 78 . 74 . 78 . 81 . 86 .
83 . . . 78 . . . 75 . 78 . 81 . 78 .
76 . 79 . 83 . 88 . 86 . 83 . 79 . 83 .
84 . 83 . 81 . 79 . 81 . . . 76 . . .
74 . 76 . 78 . 79 . 81 . 79 . 78 . 74 .
76 . . . 71 . . . 76 . . . . . . .`);
const t3ch = [[64, 67, 71], [60, 64, 67], [62, 66, 69], [59, 63, 66], [64, 67, 71], [60, 64, 67], [62, 66, 69], [59, 63, 66]];
const d3 = drums(8, 'x . . . x . . . x . . . x . . .', '. . . . x . . . . . . . x . . .', 'x . x x x . x x x . x x x . x x');

// ---- 4: Chefe (E phrygian, tense) ----
const t4mel = P(`
76 . 76 . 77 . 76 . 74 . 76 . . . 71 .
76 . 76 . 77 . 79 . 77 . 76 . . . 74 .
76 . 76 . 77 . 76 . 74 . 76 . 79 . 81 .
82 . 81 . 79 . 77 . 76 . . . 77 . 76 .`);
const t4ch = [[64, 67, 71], [65, 69, 72], [64, 67, 71], [62, 65, 69]];
const d4 = drums(4, 'x . x . x . x . x . x . x . x .', '. . . . x . . . . . . . x . . x', 'x x x x x x x x x x x x x x x x');

// ---- 5: Calmo (menus, invocação) ----
const t5mel = P(`
72 . . . 76 . . . 79 . . . 76 . . .
71 . . . 74 . . . 79 . . . 74 . . .
69 . . . 72 . . . 76 . . . 81 . . .
77 . . . 76 . . . 74 . . . . . . .`);
const t5ch = [[60, 64, 67, 71], [55, 59, 62, 66], [57, 60, 64, 67], [53, 57, 60, 64]];

function track(bpm, mel, chords, d, bassRoots, opts = {}) {
  const len = mel.length;
  const voices = [
    { type: 'square', notes: mel, vol: opts.lead ?? 0.045, dur: 2 },
    { type: 'triangle', notes: chordArp(chords.map(c => c.map(n => n - 12)), 16).map((n, i) => (i % 2 === 0 ? n : null)), vol: opts.arp ?? 0.03, dur: 1.5 },
    { type: 'triangle', notes: bassLine(bassRoots), vol: opts.bass ?? 0.09, dur: 2 },
  ];
  if (d) voices.push({ type: 'kick', notes: d.kick, vol: 0.32 }, { type: 'snare', notes: d.snare, vol: 0.09 }, { type: 'hat', notes: d.hat, vol: 0.025 });
  return { bpm, len, voices };
}
const roots = chords => chords.map(c => c[0] - 24);

export const TRACKS = [
  track(132, t0mel, t0ch, d0, roots(t0ch)),
  track(112, t1mel, t1ch, d1, roots(t1ch)),
  track(138, t2mel, t2ch, d2, roots(t2ch)),
  track(146, t3mel, t3ch, d3, roots(t3ch)),
  track(152, t4mel, t4ch, d4, roots(t4ch), { lead: 0.05 }),
  track(92, t5mel, t5ch, null, roots(t5ch), { lead: 0.035, arp: 0.035 }),
];
export const BOSS_TRACK = 4, CALM_TRACK = 5;
