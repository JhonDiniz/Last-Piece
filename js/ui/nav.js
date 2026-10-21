// Bottom navigation.
import { S } from '../core/state.js';
import { on } from '../core/bus.js';
import { isOpen } from '../game/progress.js';
import { UNLOCK } from '../data/missions.js';
import { $, ico, el, toast } from './dom.js';
import { sfx } from '../core/audio.js';
import { openScreen, screenOpen, closeScreen } from './screens.js';

const ITEMS = [
  { k: 'slime', icon: 'slime', label: 'Gosma', open: () => true },
  { k: 'raid', icon: 'raid', label: 'Incursão', open: () => isOpen('raid'), lock: `Missão ${UNLOCK.raid}` },
  { k: 'mine', icon: 'mine', label: 'Mina', open: () => isOpen('mine'), lock: `Missão ${UNLOCK.mine}` },
  { k: 'rush', icon: 'boss', label: 'Chefe', open: () => isOpen('rush'), lock: `Missão ${UNLOCK.rush}` },
  { k: 'rebirth', icon: 'rebirth', label: 'Renascer', open: () => isOpen('rebirth'), lock: 'fase 50' },
  { k: 'shop', icon: 'shop', label: 'Loja', open: () => true },
];
const btns = {};

export function buildNav() {
  const nav = $('#nav');
  nav.innerHTML = '';
  for (const it of ITEMS) {
    const b = el(`<button class="nb ol-s" data-k="${it.k}"><i class="ic">${ico(it.icon)}</i><span>${it.label}</span><i class="lk hide">${ico('lock')}</i><i class="dot hide"></i></button>`);
    b.onclick = () => {
      if (!it.open()) { sfx('nogold'); toast(`Desbloqueia na ${it.lock}`, 'lock'); return; }
      if (screenOpen() === it.k) { sfx('close'); closeScreen(); return; }
      openScreen(it.k);
    };
    nav.appendChild(b);
    btns[it.k] = b;
  }
  refreshNav();
  on('unlock', refreshNav);
  on('screen', refreshNav);
  on('missionClaim', refreshNav);
  on('stage', refreshNav);
  on('dots', refreshNav);
}
export function refreshNav() {
  const cur = screenOpen();
  for (const it of ITEMS) {
    const b = btns[it.k], open = it.open();
    b.classList.toggle('locked', !open);
    b.querySelector('.lk').classList.toggle('hide', open);
    b.classList.toggle('active', cur === it.k);
    b.querySelector('.dot').classList.toggle('hide', !(open && DOTS[it.k] && DOTS[it.k]()));
  }
}
export const DOTS = {};
