// Top HUD: avatar, currencies, turbo, menu, stage banner and progress.
import { S } from '../core/state.js';
import { on } from '../core/bus.js';
import { fmt, fmtClock, fmtGem } from '../core/util.js';
import { B, W, world, challengeBoss } from '../game/battle.js';
import { avatarSVG } from '../art/avatar.js';
import { heroLook } from '../game/hero.js';
import { xpNeed } from '../data/hero.js';
import { B as BALCFG } from '../data/balance.js';
const BAL_waves = () => BALCFG.waves;
import { $, ico, el, toast } from './dom.js';
import { sfx } from '../core/audio.js';
import { openScreen } from './screens.js';
import { view } from '../render/scene.js';

let lvBadge, xpFill, shownGold = 0, shownGems = 0, gp, gv, mp, mv, fill, bar, ticks, tm, chal, turbo, turboT, avatarPic, badge, ribbonT;

export function buildHud() {
  const hud = $('#hud');
  hud.innerHTML = `
    <div class="hrow">
      <button class="avatar" id="avatar" aria-label="Perfil"><div class="pic" id="avatarPic"></div><div class="badge f-num ol-s">${ico('flag')}<span id="stageBadge">1</span></div><span class="lvb f-num ol-s" id="lvBadge">1</span><i class="xpb"><i id="xpFill"></i></i></button>
      <div class="pill gold" id="goldPill">${ico('coin')}<span class="v f-num ol-s" id="goldV">0</span></div>
      <div class="pill gems" id="gemPill">${ico('gem')}<span class="v f-num ol-s" id="gemV">0</span><button class="add" id="gemAdd" aria-label="Loja">${ico('plus')}</button></div>
      <div class="spacer"></div>
      <button class="turbo f-num ol-s" id="turbo">${ico('turbo')}<span id="turboT">10:00</span></button>
      <button class="sqbtn" id="menuBtn" aria-label="Menu">${ico('menu')}<i class="dot hide" id="menuDot"></i></button>
    </div>
    <div class="banner"><div class="ribbon"><button class="mapb" id="mapBtn" aria-label="Mapa">${ico('map')}</button><span class="t f-num ol-s" id="stageName">Bosque Esmeralda 1-1</span></div></div>
    <div class="prog" id="prog"><div class="fill" id="progFill"></div><div id="ticks"></div><span class="clock hide" id="progClock">${ico('clock')}</span><span class="tm f-num ol-s hide" id="progTm"></span><div class="bossi">${ico('skull')}</div></div>
    <button class="challenge f-num ol-s hide" id="challenge">${ico('skull')}Desafiar chefe</button>`;
  gp = $('#goldPill'); gv = $('#goldV'); mp = $('#gemPill'); mv = $('#gemV');
  fill = $('#progFill'); bar = $('#prog'); ticks = $('#ticks'); tm = $('#progTm'); chal = $('#challenge');
  turbo = $('#turbo'); turboT = $('#turboT'); avatarPic = $('#avatarPic'); lvBadge = $('#lvBadge'); xpFill = $('#xpFill'); badge = $('#stageBadge'); ribbonT = $('#stageName');
  shownGold = S.gold; shownGems = S.gems;
  drawTicks();
  refreshAvatar();
  chal.onclick = () => { sfx('tap'); challengeBoss(); chal.classList.add('hide'); };
  turbo.onclick = () => {
    sfx('tap');
    if (S.turbo.left <= 0) { toast('Sem turbo. Ganhe mais na Loja.', 'turbo'); return; }
    S.turbo.on = !S.turbo.on;
    toast(S.turbo.on ? 'Turbo ligado: velocidade x2' : 'Turbo desligado', 'turbo');
  };
  $('#gemAdd').onclick = () => { sfx('tap'); openScreen('shop'); };
  $('#menuBtn').onclick = () => { sfx('tap'); openScreen('menu'); };
  $('#mapBtn').onclick = () => { sfx('tap'); openScreen('map'); };
  $('#avatar').onclick = () => { sfx('tap'); openScreen('profile'); };
  on('stage', () => { refreshStage(); drawTicks(); });
  on('phase', p => { refreshStage(); });
  on('modeStart', () => refreshStage());
  on('bossFail', () => { chal.classList.remove('hide'); toast('O chefe escapou! Fique mais forte e desafie de novo.', 'skull'); });
  on('look', refreshAvatar);
  on('gear', refreshAvatar);
  on('levelUp', refreshAvatar);
  on('farmLoop', () => { refreshStage(); toast('Você foi derrotado! A fase vai se repetir até você desafiar o chefe.', 'skull'); });
  on('dropArrive', k => { const p = k === 'gem' ? mp : gp; p.classList.remove('pulse'); void p.offsetWidth; p.classList.add('pulse'); sfx(k === 'gem' ? 'gem' : 'coin'); });
  refreshStage();
  measure();
}

export function refreshAvatar() {
  avatarPic.innerHTML = avatarSVG(heroLook());
  lvBadge.textContent = S.hero.lv;
}

function drawTicks() {
  const waves = BAL_waves();
  const tot = waves.reduce((a, b) => a + b, 0);
  let acc = 0, h = '';
  for (let i = 0; i < waves.length - 1; i++) { acc += waves[i]; h += `<i class="tick" style="left:${(acc / tot * 100).toFixed(1)}%"></i>`; }
  ticks.innerHTML = h;
}

function refreshStage() {
  ribbonT.textContent = B.mode !== 'stage' && B.modeLabel ? B.modeLabel : B.info.label;
  badge.textContent = B.g;
  const boss = B.phase === 'boss' || B.mode !== 'stage';
  bar.classList.toggle('boss', boss);
  $('#progClock').classList.toggle('hide', !boss);
  tm.classList.toggle('hide', !boss);
  ticks.classList.toggle('hide', boss);
  chal.classList.toggle('hide', !(S.farm && B.phase === 'fight' && B.mode === 'stage'));
}

// convert the pills' positions to battle coordinates (coins fly there)
export function measure() {
  const st = $('#stage').getBoundingClientRect();
  const k = view.k || st.width / W;
  const c = e => { const r = e.getBoundingClientRect(); return { x: (r.left + 14 - st.left) / k, y: (r.top + r.height / 2 - st.top) / k }; };
  world.gold = c(gp); world.gems = c(mp);
}

export function updateHud(dt) {
  shownGold += (S.gold - shownGold) * Math.min(1, dt * 10);
  if (Math.abs(S.gold - shownGold) < 1) shownGold = S.gold;
  shownGems += (S.gems - shownGems) * Math.min(1, dt * 10);
  if (Math.abs(S.gems - shownGems) < 1) shownGems = S.gems;
  const gs = fmt(shownGold), ms = fmtGem(shownGems);
  if (gv.textContent !== gs) gv.textContent = gs;
  if (mv.textContent !== ms) mv.textContent = ms;
  if (B.mode === 'raid' && B.raid) {
    fill.style.width = `calc(${(Math.max(0, B.raid.t / 45) * 100).toFixed(1)}% - .4rem)`;
    tm.textContent = `${B.raid.destroyed}/${B.raid.total} · ${Math.ceil(Math.max(0, B.raid.t))}s`;
  } else if (B.mode === 'rush' && B.rush) {
    fill.style.width = `calc(${(Math.max(0, B.rush.t / 30) * 100).toFixed(1)}% - .4rem)`;
    tm.textContent = `${fmt(B.rushDmg || 0)} · ${Math.ceil(Math.max(0, B.rush.t))}s`;
  } else if (B.phase === 'boss') {
    const p = Math.max(0, B.boss ? B.boss.hp / B.boss.max : 0);
    fill.style.width = `calc(${(p * 100).toFixed(1)}% - .4rem)`;
    tm.textContent = Math.ceil(Math.max(0, B.bossT)) + 's';
  } else {
    const p = B.phase === 'victory' || B.phase === 'bossIntro' ? 1 : B.kills / B.total;
    fill.style.width = `calc(${(p * 100).toFixed(1)}% - ${p > 0 ? '.4rem' : '0rem'})`;
  }
  xpFill.style.width = Math.min(100, S.hero.xp / xpNeed(S.hero.lv) * 100).toFixed(1) + '%';
  const tt = fmtClock(S.turbo.left);
  if (turboT.textContent !== tt) turboT.textContent = tt;
  turbo.classList.toggle('on', S.turbo.on && S.turbo.left > 0);
  turbo.classList.toggle('off', S.turbo.left <= 0);
}
