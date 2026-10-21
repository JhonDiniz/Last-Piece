// The attribute upgrade list under the battle.
import { S } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import { fmt, fmtS, fmtPct, fmtDec } from '../core/util.js';
import { UPGRADES, UP } from '../data/balance.js';
import { ST } from '../game/stats.js';
import { upgradeState, buyUpgrade } from '../game/progress.js';
import { B, fx, world } from '../game/battle.js';
import { $, ico, el, toast, holdRepeat } from './dom.js';
import { svg, OL } from '../art/kit.js';
import { sfx } from '../core/audio.js';

const rows = {};
const hexSvg = (col) => svg(52, 56,
  `<path d="M26 3 L49 15.5 L49 40.5 L26 53 L3 40.5 L3 15.5 Z" fill="${col}" stroke="${OL}" stroke-width="3.6" stroke-linejoin="round"/>` +
  `<path d="M26 7.5 L45 18 L45 26 Q26 20 7 26 L7 18 Z" fill="#fff" opacity=".22"/>` +
  `<path d="M7 38 L26 48.5 L45 38 L45 40 L26 50 L7 40 Z" fill="#000" opacity=".18"/>`);

function valueText(u) {
  const k = u.k;
  if (k === 'atk') return fmt(ST.atk);
  if (k === 'hp') return fmt(ST.hp);
  if (k === 'rec') return fmtS(ST.rec);
  if (k === 'aspd') return fmtDec(ST.aspd, 2);
  if (k === 'crit') return fmtPct(ST.crit);
  if (k === 'cdmg') return fmtPct(ST.cdmg, 0);
  if (k === 'dbl') return fmtPct(ST.dbl);
  if (k === 'trp') return fmtPct(ST.trp);
  if (k === 'boss') return fmtPct(ST.boss, 0);
  return '';
}

export function buildUpgrades() {
  const list = $('#list');
  list.innerHTML = '';
  for (const u of UPGRADES) {
    const r = el(`<div class="row" data-k="${u.k}">
      <div class="hex">${hexSvg(u.col)}${ico(u.icon)}<span class="lv f-num">NV 1</span></div>
      <div class="info"><span class="nm">${u.name}</span><span class="val f-num ol-s">0</span></div>
      <button class="buy ol-s"><span class="l1 f-num">Melhorar</span><span class="l2 f-num">${ico('coin')}<b class="c">0</b></span></button>
      <div class="lock hide">${ico('lock')}<span class="lt"></span></div>
    </div>`);
    list.appendChild(r);
    const o = { r, lv: r.querySelector('.lv'), val: r.querySelector('.val'), btn: r.querySelector('.buy'), cost: r.querySelector('.c'), lock: r.querySelector('.lock'), lt: r.querySelector('.lt'), last: '' };
    rows[u.k] = o;
    holdRepeat(o.btn, n => {
      const res = buyUpgrade(u.k);
      if (res === 'ok') {
        sfx('buy');
        o.r.classList.remove('flashok'); void o.r.offsetWidth; o.r.classList.add('flashok');
        fx('lvup', B.hero.x, world.feet - 30, { life: 0.6, col: u.col });
        refreshRow(u);
        return true;
      }
      if (res === 'gold' && n === 1) { sfx('nogold'); toast('Ouro insuficiente.', 'coin'); }
      return false;
    });
  }
  refreshUpgrades();
  on('upgrade', () => refreshUpgrades());
}

function gateText(g) {
  const nm = UP[g.k].name;
  return `Atinja o Nv ${g.lv} de ${nm} para desbloquear`;
}

function refreshRow(u) {
  const o = rows[u.k];
  const st = upgradeState(u.k);
  const lvTxt = 'NV ' + st.lv;
  if (o.lv.textContent !== lvTxt) o.lv.textContent = lvTxt;
  const v = valueText(u);
  if (o.val.textContent !== v) o.val.textContent = v;
  const c = st.max ? 'MÁX' : fmt(st.cost);
  if (o.cost.textContent !== c) o.cost.textContent = c;
  o.btn.classList.toggle('no', !st.max && !st.gate && S.gold < st.cost);
  o.btn.classList.toggle('max', !!st.max);
  if (st.gate) {
    o.lock.classList.remove('hide');
    const t = gateText(st.gate);
    if (o.lt.textContent !== t) o.lt.textContent = t;
  } else o.lock.classList.add('hide');
}
export function refreshUpgrades() { for (const u of UPGRADES) refreshRow(u); }
