// Boot, main loop and glue between systems.
import { S, load, save } from './core/state.js';
import { on, emit } from './core/bus.js';
import { fmt, fmtTime } from './core/util.js';
import { unlockAudio, sfx, playMusic, applyVolumes, musicTrack } from './core/audio.js';
import { recompute, ST } from './game/stats.js';
import { B, update, startStage, world, resetHero, setDamageFormatter, setExternalUpdate } from './game/battle.js';
import { checkMission, silentUnlocks, checkUnlocks } from './game/progress.js';
import { updateSkills, castSkill } from './game/skills.js';
import * as BAL from './data/balance.js';
import { initScene, resize as resizeScene, draw } from './render/scene.js';
import { spriteAsync } from './render/sprites.js';
import { buildHud, updateHud, measure } from './ui/hud.js';
import { buildUpgrades, refreshUpgrades } from './ui/upgrades.js';
import { buildDock, updateDock } from './ui/dock.js';
import { buildNav } from './ui/nav.js';
import { buildOverlays } from './ui/overlays.js';
import { buildSide } from './ui/side.js';
import { updateScreen } from './ui/screens.js';
import { $, modal, ico, toast } from './ui/dom.js';
import { biomeLayers, LAYER_H, STRIP } from './art/scenery.js';
import { humanParts, ARCHETYPES, BOSSES, variant, EW, EH } from './art/enemies.js';
import { slimeParts, SW, SH } from './art/slime.js';
import { SLIME, SLIMES } from './data/slimes.js';
import { giveSlimeFragments } from './game/collection.js';
import './ui/screens/index.js';

const bootbar = $('#bootbar'), bootmsg = $('#bootmsg');
const step = (p, m) => { bootbar.style.width = (p * 100) + '%'; if (m) bootmsg.textContent = m; };

function setUnit() {
  const app = $('#app');
  const w = app.clientWidth, h = app.clientHeight;
  const u = Math.max(7, Math.min(13.5, Math.min(w / 390, h / 800) * 10));
  document.documentElement.style.fontSize = u + 'px';
}
function layout() {
  setUnit();
  resizeScene();
  const st = $('#stage').getBoundingClientRect();
  const k = st.width / 390;
  const dockH = $('#dock').offsetHeight / k;
  world.feet = world.H - dockH + 4;
  world.heroX = 92;
  B.hero.x = 92;
  measure();
}

async function preload() {
  const sl = SLIME[S.slimes.cur] || SLIME.gelatino;
  const hp = slimeParts({ color: sl.color, hat: sl.hat });
  const k = $('#stage').getBoundingClientRect().width / 390;
  const jobs = [];
  const w = SW * 0.55, h = SH * 0.55;
  jobs.push(spriteAsync('h:' + sl.id + ':body', hp.body, w, h));
  for (const f of ['idle', 'blink', 'attack', 'hurt', 'happy']) jobs.push(spriteAsync('h:' + sl.id + ':f:' + f, hp.faces[f], w, h));
  jobs.push(spriteAsync('h:' + sl.id + ':hat', hp.hat, w, h));
  const r = B.info.region;
  const L = biomeLayers(r.bg);
  for (const n of ['far', 'mid', 'near', 'ground']) jobs.push(spriteAsync('bg:' + r.bg + ':' + n, L[n], STRIP, LAYER_H[n], { lowres: true }));
  let done = 0;
  const total = jobs.length;
  await Promise.all(jobs.map(p => Promise.resolve(p).then(() => step(0.35 + 0.6 * (++done / total)))));
  void k; void EW; void EH;
}

function offlineGains() {
  const now = Date.now();
  const secs = Math.max(0, (now - (S.last || now)) / 1000);
  if (secs < 120) return;
  const capH = 12 + ((S.rebirth.talents.offline || 0));
  const s = Math.min(secs, capH * 3600);
  const g = Math.max(1, S.stage - (S.farm ? 0 : 1));
  const killsPerMin = 26;
  const gold = BAL.enemyGold(g) * killsPerMin * (s / 60) * ST.gold * 0.5 * ST.offline;
  S.gold += gold;
  const gems = Math.floor(s / 3600) * 10;
  S.gems += gems;
  modal({
    title: 'Bem-vindo de volta!',
    body: `<p>Sua gosma continuou lutando por <b style="color:#fff">${fmtTime(s)}</b>${secs > s ? ` (limite de ${capH} h)` : ''}.</p>
      <div style="display:flex;justify-content:center;gap:1.6rem;font-size:2.2rem" class="f-num ol-s"><span style="display:flex;align-items:center;gap:.4rem"><span style="width:3.4rem;height:3.4rem">${ico('coin')}</span>+${fmt(gold)}</span>${gems ? `<span style="display:flex;align-items:center;gap:.4rem"><span style="width:3.4rem;height:3.4rem">${ico('gem')}</span>+${gems}</span>` : ''}</div>`,
    buttons: [{ label: 'Coletar', icon: 'check' }],
  });
}

function wire() {
  setDamageFormatter(fmt);
  on('kill', e => { sfx('die'); });
  on('heroHit', () => sfx('hit'));
  on('upgrade', () => { emit('dots'); });
  on('phase', p => {
    if (p === 'fight' || p === 'intro') { const tr = B.info.region.music; if (musicTrack() !== tr) playMusic(tr); }
  });
  on('stage', () => { checkMission(); checkUnlocks(); stageGifts(); });
  on('victory', () => { checkMission(); });
  on('gems', () => emit('dots'));
  setInterval(save, 10000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else { lastT = performance.now(); } });
  window.addEventListener('pagehide', save);
  window.addEventListener('resize', () => { layout(); });
  const first = () => {
    unlockAudio(); applyVolumes();
    playMusic(B.info.region.music);
    window.removeEventListener('pointerdown', first);
  };
  window.addEventListener('pointerdown', first);
}

function stageGifts() {
  for (const sl of SLIMES) {
    if (!sl.from.startsWith('stage:') || S.slimes.own[sl.id]) continue;
    if (S.maxStage >= +sl.from.split(':')[1]) giveSlimeFragments(sl.id, 1);
  }
}

let lastT = performance.now(), uiT = 0, frameSkip = 0;
function frame(t) {
  requestAnimationFrame(frame);
  if (S.settings.saver && (frameSkip ^= 1)) return;
  let dt = Math.min(0.1, (t - lastT) / 1000);
  lastT = t;
  if (dt <= 0) return;
  const turbo = S.turbo.on && S.turbo.left > 0;
  if (turbo) { S.turbo.left = Math.max(0, S.turbo.left - dt); if (S.turbo.left <= 0) S.turbo.on = false; }
  const sp = turbo ? 2 : 1;
  for (let i = 0; i < sp; i++) update(dt);
  S.stats.play += dt;
  draw(dt);
  updateHud(dt);
  updateDock(dt);
  updateScreen(dt);
  uiT += dt;
  if (uiT > 0.15) { uiT = 0; refreshUpgrades(); checkMission(); }
}

async function boot() {
  step(0.05, 'Carregando o reino…');
  load();
  silentUnlocks();
  recompute();
  try { await Promise.race([Promise.all([document.fonts.load('20px "Lilita One"'), document.fonts.load('900 20px Nunito')]), new Promise(r => setTimeout(r, 2500))]); } catch (e) { }
  step(0.2, 'Montando a interface…');
  initScene($('#scene'));
  buildHud(); buildDock(); buildUpgrades(); buildNav(); buildOverlays(); buildSide();
  layout();
  B.g = S.stage;
  startStage(S.stage, 'intro');
  resetHero();
  step(0.35, 'Pintando os cenários…');
  await preload();
  wire();
  step(1, 'Pronto!');
  const bootEl = $('#boot');
  bootEl.style.opacity = '0';
  setTimeout(() => bootEl.remove(), 500);
  layout();
  offlineGains();
  lastT = performance.now();
  requestAnimationFrame(frame);
  window.__RG = { S, B, ST, emit, recompute, startStage, castSkill };
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && !location.search.includes('nosw')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
boot();
