// Small shared helpers: number formatting, maths, easing, timing.

// Big numbers: below 1000 plain, then A (thousand), B (million), C ... Z, AA, AB ...
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n);
  if (n < 1000) return String(Math.floor(n));
  let idx = Math.floor(Math.log10(n) / 3);
  let m = n / Math.pow(10, idx * 3);
  if (m >= 999.5) { m = 1; idx++; }
  let suf;
  if (idx <= 26) suf = String.fromCharCode(64 + idx);
  else { const k = idx - 27; suf = String.fromCharCode(65 + Math.floor(k / 26) % 26) + String.fromCharCode(65 + k % 26); }
  return trim(m < 10 ? m.toFixed(2) : m < 100 ? m.toFixed(1) : m.toFixed(0)) + suf;
}
// gem counts (full number like the original until 100k) and prices with thousands separators
export const fmtGem = n => (n < 1e5 ? String(Math.floor(n)) : fmt(n));
export const fmtInt = n => Math.floor(n).toLocaleString('pt-BR');
// stat style: 3 significant digits even below 1000 (13,9 / 1,09 / 350)
export function fmtS(n) {
  if (n >= 1000) return fmt(n);
  if (n >= 100) return String(Math.round(n));
  return trim(n >= 10 ? n.toFixed(1) : n.toFixed(2));
}
const trim = s => (s.includes('.') ? s.replace(/\.?0+$/, '') : s).replace('.', ',');
export const fmtPct = (v, d = 1) => trim((v * 100).toFixed(d)) + '%';
export const fmtDec = (v, d = 2) => v.toFixed(d).replace('.', ',');

export function fmtTime(s) {
  s = Math.max(0, Math.floor(s));
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${ss}s`;
  return `${ss}s`;
}
export function fmtClock(s) {
  s = Math.max(0, Math.ceil(s));
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randi = (a, b) => Math.floor(rand(a, b + 1));
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export function weighted(weights) {
  const tot = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return weights.length - 1;
}

export const ease = {
  outQuad: t => 1 - (1 - t) * (1 - t),
  inQuad: t => t * t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outBack: t => { const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  outElastic: t => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1),
};

export const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
export const now = () => Date.now();
