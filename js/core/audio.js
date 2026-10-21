// Synthesized sound effects and music (WebAudio, no audio files).
import { S } from './state.js';

let ac = null, sfxGain = null, musGain = null, noiseBuf = null;
const last = {};

export function unlockAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    sfxGain = ac.createGain(); musGain = ac.createGain();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    sfxGain.connect(comp); musGain.connect(comp); comp.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyVolumes();
  } catch (e) { ac = null; }
}
export function applyVolumes() {
  if (!ac) return;
  sfxGain.gain.value = 0.55 * (S.settings.sfx ?? 0.8);
  musGain.gain.value = 0.32 * (S.settings.music ?? 0.6);
}

function tone(f, d, type = 'square', v = 0.2, t0 = 0, f2 = null, attack = 0.004) {
  const t = ac.currentTime + t0;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + d);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(sfxGain);
  o.start(t); o.stop(t + d + 0.02);
}
function noise(d, v = 0.2, t0 = 0, freq = 1200, q = 1, type = 'bandpass', f2 = null) {
  const t = ac.currentTime + t0;
  const s = ac.createBufferSource(); s.buffer = noiseBuf;
  const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + d);
  const g = ac.createGain();
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f); f.connect(g); g.connect(sfxGain);
  s.start(t); s.stop(t + d + 0.02);
}

const SFX = {
  tap: () => tone(1100, 0.05, 'sine', 0.12, 0, 700),
  buy: () => { tone(523, 0.07, 'square', 0.07); tone(784, 0.1, 'square', 0.07, 0.05); tone(1568, 0.08, 'sine', 0.05, 0.08); },
  nogold: () => { tone(180, 0.14, 'square', 0.08); tone(150, 0.16, 'square', 0.08, 0.08); },
  hit: () => { noise(0.06, 0.22, 0, 1800, 0.8); tone(160, 0.07, 'sine', 0.22, 0, 70); },
  crit: () => { noise(0.08, 0.3, 0, 2600, 0.7); tone(220, 0.09, 'sine', 0.25, 0, 60); tone(1760, 0.12, 'triangle', 0.08, 0.01); },
  coin: () => { tone(1320, 0.06, 'triangle', 0.08); tone(1980, 0.12, 'triangle', 0.07, 0.05); },
  gem: () => { [1568, 2093, 2637].forEach((f, i) => tone(f, 0.14, 'sine', 0.07, i * 0.05)); },
  die: () => { tone(620, 0.16, 'sine', 0.14, 0, 140); noise(0.12, 0.12, 0, 900, 1, 'lowpass', 300); },
  hurt: () => { tone(120, 0.14, 'sawtooth', 0.12, 0, 60); },
  bossIntro: () => { noise(0.9, 0.22, 0, 300, 0.7, 'bandpass', 3000); tone(55, 0.6, 'sawtooth', 0.18, 0.55, 40); noise(0.4, 0.35, 0.55, 200, 1, 'lowpass'); },
  victory: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'square', 0.08, i * 0.09)); tone(1047, 0.5, 'triangle', 0.1, 0.36); tone(1319, 0.5, 'triangle', 0.08, 0.36); },
  defeat: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.1, i * 0.16)); },
  mission: () => { [880, 1175, 1568].forEach((f, i) => tone(f, 0.16, 'sine', 0.1, i * 0.07)); },
  levelup: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.1, 'square', 0.06, i * 0.05)); },
  unlock: () => { [523, 784, 1047, 1568].forEach((f, i) => tone(f, 0.3, 'triangle', 0.1, i * 0.1)); noise(0.6, 0.08, 0.3, 6000, 0.5, 'highpass'); },
  whoosh: () => noise(0.35, 0.18, 0, 400, 0.8, 'bandpass', 2400),
  boom: () => { noise(0.5, 0.4, 0, 400, 0.6, 'lowpass', 80); tone(70, 0.4, 'sine', 0.3, 0, 35); },
  zap: () => { tone(1800, 0.18, 'sawtooth', 0.06, 0, 300); noise(0.15, 0.14, 0, 4000, 1); },
  splash: () => { noise(0.4, 0.25, 0, 1200, 0.6, 'bandpass', 300); tone(300, 0.2, 'sine', 0.08, 0, 120); },
  magic: () => { [1046, 1318, 1568, 2093, 2637].forEach((f, i) => tone(f, 0.18, 'sine', 0.05, i * 0.04)); },
  fire: () => { noise(0.6, 0.25, 0, 800, 0.4, 'lowpass', 2400); },
  ice: () => { [2637, 3136, 2349].forEach((f, i) => tone(f, 0.12, 'triangle', 0.05, i * 0.05)); noise(0.2, 0.12, 0, 6000, 1, 'highpass'); },
  summon: () => { tone(220, 0.8, 'sawtooth', 0.05, 0, 880); noise(0.8, 0.1, 0, 500, 0.6, 'bandpass', 5000); },
  reveal: () => { tone(880, 0.12, 'triangle', 0.08); tone(1320, 0.2, 'triangle', 0.06, 0.04); },
  rare: () => { [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.25, 'triangle', 0.08, i * 0.06)); noise(0.8, 0.08, 0.1, 7000, 0.5, 'highpass'); },
  open: () => { tone(400, 0.06, 'sine', 0.1, 0, 800); },
  close: () => { tone(700, 0.06, 'sine', 0.1, 0, 380); },
  dig: () => { noise(0.08, 0.3, 0, 600, 1); tone(140, 0.08, 'square', 0.08, 0, 90); },
};

export function sfx(name) {
  if (!ac || !SFX[name] || (S.settings.sfx ?? 0.8) <= 0) return;
  const now = performance.now();
  const gap = name === 'hit' || name === 'coin' || name === 'crit' ? 45 : name === 'die' ? 60 : 0;
  if (gap && last[name] && now - last[name] < gap) return;
  last[name] = now;
  try { SFX[name](); } catch (e) { }
}

// ------------------------------------------------------------------ music
// A tiny step sequencer. Tracks are original compositions written as note lists.
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
let musTimer = null, curTrack = -1, step = 0, nextT = 0;
import { TRACKS } from './music.js';

export function playMusic(i) {
  if (!ac || i === curTrack) return;
  stopMusic();
  curTrack = i; step = 0; nextT = ac.currentTime + 0.1;
  musTimer = setInterval(schedule, 50);
}
export function stopMusic() { if (musTimer) clearInterval(musTimer); musTimer = null; curTrack = -1; }
export const musicTrack = () => curTrack;

function mtone(f, t, d, type, v) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(musGain);
  o.start(t); o.stop(t + d + 0.03);
}
function mnoise(t, d, v, freq, type = 'highpass') {
  const s = ac.createBufferSource(); s.buffer = noiseBuf;
  const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f); f.connect(g); g.connect(musGain); s.start(t); s.stop(t + d + 0.02);
}
function schedule() {
  if (!ac || curTrack < 0) return;
  const tr = TRACKS[curTrack];
  const sp = 60 / tr.bpm / 4;       // 16th notes
  while (nextT < ac.currentTime + 0.25) {
    const len = tr.len;
    const s = step % len;
    for (const v of tr.voices) {
      const n = v.notes[s % v.notes.length];
      if (n === null || n === undefined || n === 0) continue;
      if (v.type === 'kick') { mtone(150, nextT, 0.18, 'sine', v.vol); mtone(60, nextT, 0.2, 'sine', v.vol); }
      else if (v.type === 'snare') mnoise(nextT, 0.12, v.vol, 1500, 'bandpass');
      else if (v.type === 'hat') mnoise(nextT, 0.04, v.vol, 7000);
      else mtone(NOTE(n), nextT, sp * (v.dur || 1) * 0.95, v.type, v.vol);
    }
    step++;
    nextT += sp;
  }
}
