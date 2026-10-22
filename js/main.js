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
import { humanParts, EW, EH } from './art/enemies.js';
import { shipSVG, SHIP_W, SHIP_H } from './art/ship.js';
import { SHIP } from './data/ships.js';
import { migrateSave } from './game/collection.js';
import { checkShips } from './game/ship.js';
import { heroSpec } from './render/scene.js';
import { fx, text } from './game/battle.js';
import './game/petsBattle.js';
import { openCreator } from './ui/creator.js';
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
  world.heroX = 120;
  B.hero.x = 120;
  measure();
}

async function preload() {
  const hp = humanParts(heroSpec());
  const key = 'hero:' + Object.values(heroSpec()).join('|');
  const jobs = [];
  const w = EW * 0.6, h = EH * 0.6;
  for (const n of ['legB', 'legF', 'body', 'arm']) jobs.push(spriteAsync(key + ':' + n, hp[n], w, h, { flash: true }));
  const sh = SHIP[S.ships.cur] || SHIP.bote;
  jobs.push(spriteAsync('ship:' + sh.id, shipSVG(sh), SHIP_W * sh.size, SHIP_H * sh.size));
  const r = B.info.region;
  const L = biomeLayers(r.bg);
  for (const n of ['far', 'mid', 'near', 'ground']) jobs.push(spriteAsync('bg:' + r.bg + ':' + n, L[n], STRIP, LAYER_H[n], { lowres: true }));
  let done = 0;
  const total = jobs.length;
  await Promise.all(jobs.map(p => Promise.resolve(p).then(() => step(0.35 + 0.6 * (++done / total)))));
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
    body: `<p>Seu bando continuou lutando por <b style="color:#fff">${fmtTime(s)}</b>${secs > s ? ` (limite de ${capH} h)` : ''}.</p>
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
  on('stage', () => { checkMission(); checkUnlocks(); checkShips(); });
  on('levelUp', d => {
    fx('lvup', B.hero.x, world.feet - 40, { life: 1.0, col: '#ffe14a' });
    text(B.hero.x, world.feet - 120, `Nível ${d.lv}!`, '#ffe14a', 22, { life: 1.4, vy: -26 });
    sfx('levelup');
  });
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
  step(0.05, 'Içando as velas…');
  load();
  migrateSave();
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
  checkShips();
  if (!S.hero.created) openCreator(true);
  else offlineGains();
  lastT = performance.now();
  requestAnimationFrame(frame);
  window.__RG = { S, B, ST, emit, recompute, startStage, castSkill };
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && !location.search.includes('nosw')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
boot();
