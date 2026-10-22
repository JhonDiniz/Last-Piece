// Left-side quick buttons (rest chest, daily gift), red dots and tutorial hints.
import { S, save } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import { fmt, fmtTime } from '../core/util.js';
import { sfx } from '../core/audio.js';
import * as BAL from '../data/balance.js';
import { ST } from '../game/stats.js';
import { B } from '../game/battle.js';
import { isOpen, currentMission } from '../game/progress.js';
import { canFuse } from '../game/skills.js';
import { canRebirth } from '../game/rebirth.js';
import { PICK_MAX, regenPicks } from '../game/mine.js';
import { resetDaily } from '../game/gacha.js';
import { $, ico, el, modal, toast, flyIcons } from './dom.js';
import { DOTS, refreshNav } from './nav.js';
import { openScreen, screenOpen } from './screens.js';

const CHEST_H = 8;
const chestRate = () => BAL.enemyGold(Math.max(1, S.maxStage - 1)) * 26 * ST.gold * 0.3;   // gold per minute
const chestSecs = () => Math.min(CHEST_H * 3600, (Date.now() - (S.chest.t || Date.now())) / 1000);
const chestGold = () => chestRate() * chestSecs() / 60;

let chestBtn, giftBtn;
export function buildSide() {
  const side = $('#side');
  side.innerHTML = `<button class="sidebtn ol-s" id="chestBtn"><i class="ic">${ico('chest')}</i><span id="chestT">0%</span></button>
    <button class="sidebtn ol-s hide" id="giftBtn"><i class="ic" style="background:linear-gradient(#ff9ac0,#e8508a)">${ico('gift')}</i><span>Presente</span></button>`;
  chestBtn = $('#chestBtn'); giftBtn = $('#giftBtn');
  chestBtn.onclick = () => {
    sfx('tap');
    const secs = chestSecs(), g = chestGold();
    modal({ title: 'Baú de descanso', body: `<div style="width:9rem;height:9rem;margin:0 auto">${ico('chest')}</div>
      <p>Enquanto você joga ou descansa, o baú enche de ouro (até ${CHEST_H} h).</p>
      <div class="kv"><span>Tempo acumulado</span><b class="ol-s">${fmtTime(secs)}</b></div>
      <div class="kv"><span>Ouro no baú</span><b class="ol-s">${fmt(g)}</b></div>
      <div class="kv"><span>Ritmo</span><b class="ol-s">${fmt(chestRate())}/min</b></div>`,
      buttons: [{ label: 'Coletar', icon: 'coin', onClick: () => { if (g < 1) { toast('O baú está vazio.', 'chest'); return; } S.gold += g; S.chest.t = Date.now(); save(); sfx('coin'); flyIcons(chestBtn, $('#goldPill'), 'coin', 8); toast(`+${fmt(g)} de ouro`, 'coin'); } }, { label: 'Fechar', cls: 'gray' }] });
  };
  giftBtn.onclick = () => { sfx('tap'); openScreen('shop', 'market'); };
  if (!S.chest.t) S.chest.t = Date.now();
  setInterval(tickSide, 1000);
  tickSide();
  // red dots on the bottom navigation
  DOTS.slime = () => anyFusable();
  DOTS.shop = () => { resetDaily(); return S.daily.shopFree > 0 || ['skill', 'gear', 'pet'].some(t => S.daily.free[t] > 0 && isOpen({ skill: 'skills', gear: 'gear', pet: 'pets' }[t])); };
  DOTS.raid = () => S.keys > 0;
  DOTS.rush = () => S.tickets > 0;
  DOTS.mine = () => { regenPicks(); return S.picks >= PICK_MAX; };
  DOTS.rebirth = () => canRebirth();
  for (const ev of ['collection', 'summoned', 'market', 'daily', 'stage', 'modeEnd', 'mine', 'rebirth', 'hero', 'levelUp', 'gear', 'pets', 'skills']) on(ev, () => refreshNav());
}
function anyFusable() {
  for (const col of [S.skills.own, S.gear.own, S.pets.own]) for (const id in col) if (canFuse(col[id])) return true;
  if (S.hero.pts > 0) return true;
  return false;
}
function tickSide() {
  const p = Math.min(1, chestSecs() / (CHEST_H * 3600));
  $('#chestT').textContent = Math.floor(p * 100) + '%';
  chestBtn.classList.toggle('ready', p >= 0.25);
  resetDaily();
  giftBtn.classList.toggle('hide', !(S.daily.shopFree > 0));
  if (Math.random() < 0.2) refreshNav();
  tutorial();
}

// ------------------------------------------------------------------ tutorial
let hintEl = null, hintKey = null;
function showHint(key, target, msg, place = 'top') {
  if (hintKey === key) return;
  hideHint();
  const t = typeof target === 'string' ? $(target) : target;
  if (!t || !t.offsetParent) return;
  const app = $('#app').getBoundingClientRect(), r = t.getBoundingClientRect();
  const x = r.left - app.left, y = r.top - app.top;
  hintEl = el(`<div class="hint" style="left:0;top:0;right:0;bottom:0;position:absolute">
    <div class="ring" style="left:${x - 6}px;top:${y - 6}px;width:${r.width + 12}px;height:${r.height + 12}px"></div>
    <div class="arrow" style="left:${x + r.width / 2 - 18}px;top:${place === 'top' ? y - 52 : y + r.height + 8}px"><div style="${place === 'top' ? 'transform:rotate(180deg)' : ''}">${ico('arrowUp')}</div></div>
    <div class="msg f-num" style="left:${Math.max(8, Math.min(app.width - 230, x + r.width / 2 - 110))}px;top:${place === 'top' ? y - 92 : y + r.height + 56}px">${msg}</div></div>`);
  $('#app').appendChild(hintEl);
  hintKey = key;
  const done = () => { S.tut[key] = 1; hideHint(); t.removeEventListener('pointerdown', done); };
  t.addEventListener('pointerdown', done);
}
function hideHint() { if (hintEl) hintEl.remove(); hintEl = null; hintKey = null; }
function tutorial() {
  if (B.mode !== 'stage' || $('.mback') || $('.sumov')) { hideHint(); return; }
  const scr = screenOpen();
  if (scr) { if (hintKey && !hintKey.startsWith('scr')) hideHint(); return; }
  const m = currentMission();
  if (!S.tut.claim && m.done) return showHint('claim', '#mission', 'Missão completa! Toque para resgatar', 'top');
  if (!S.tut.buy && S.mission === 1 && S.up.atk < 3) return showHint('buy', '.row[data-k="atk"] .buy', 'Toque em Melhorar para ficar mais forte', 'top');
  if (!S.tut.summon && isOpen('skills') && !Object.keys(S.skills.own).length) return showHint('summon', '.nb[data-k="shop"]', 'Invoque habilidades na Loja', 'top');
  if (!S.tut.equip && Object.keys(S.skills.own).length && !S.skills.eq.some(Boolean)) return showHint('equip', '.nb[data-k="slime"]', 'Equipe suas habilidades', 'top');
  if (!S.tut.auto && S.skills.eq.some(Boolean) && !S.skills.auto) return showHint('auto', '#autoB', 'Ligue a habilidade automática', 'top');
  if (hintKey) hideHint();
}
