// Full-screen panels (menus) that slide over the game.
import { $, el, ico } from './dom.js';
import { sfx, playMusic } from '../core/audio.js';
import { emit } from '../core/bus.js';

const REG = {};
let current = null;

export function registerScreen(name, def) { REG[name] = def; }
export function openScreen(name, arg) {
  const def = REG[name];
  if (!def) { import('./dom.js').then(m => m.toast('Em breve!', 'star')); return; }
  if (def.modal) { def.open(arg); return; }
  closeScreen(true);
  const wrap = el(`<div class="screen ${def.cls || ''}"><div class="scr-body"></div>${def.noClose ? '' : `<button class="xbtn scr-x" aria-label="Fechar">${ico('close')}</button>`}</div>`);
  $('#screens').appendChild(wrap);
  current = { name, def, wrap, body: wrap.querySelector('.scr-body') };
  if (!def.noClose) wrap.querySelector('.scr-x').onclick = () => { sfx('close'); closeScreen(); };
  sfx('open');
  def.render(current.body, arg, current);
  emit('screen', name);
}
export function closeScreen(silent) {
  if (!current) return;
  const c = current;
  current = null;
  if (c.def.onClose) c.def.onClose();
  c.wrap.classList.add('out');
  setTimeout(() => c.wrap.remove(), silent ? 0 : 180);
  emit('screen', null);
}
export const screenOpen = () => current && current.name;
export function rerender(arg) { if (current) current.def.render(current.body, arg, current); }
export function updateScreen(dt) { if (current && current.def.update) current.def.update(dt, current); }
