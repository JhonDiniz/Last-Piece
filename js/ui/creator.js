// Character creation: the player builds a chibi pirate before the adventure starts.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { sfx } from '../core/audio.js';
import { LOOK_OPTS, LOOK_ORDER, normalizeLook } from '../data/hero.js';
import { avatarSVG } from '../art/avatar.js';
import { recompute } from '../game/stats.js';
import { $, el, ico, toast } from './dom.js';

const pick = a => a[Math.floor(Math.random() * a.length)];
function randomLook() {
  const l = {};
  for (const k of LOOK_ORDER) { const o = LOOK_OPTS[k]; l[k] = o.colors ? pick(o.colors) : pick(o.list)[0]; }
  return l;
}

export function openCreator(first) {
  const look = normalizeLook(S.hero.look);
  let name = S.hero.created ? S.name : '';
  const wrap = el(`<div class="creator"><div class="cr-head f-num ol">${first ? 'Crie seu pirata' : 'Editar visual'}</div>
    <div class="cr-top"><div class="cr-prev"><div class="cr-sea"></div><div class="cr-av" id="crAv"></div></div>
      <div class="cr-side"><label class="ol-s" for="crName">Nome do capitão</label><input id="crName" maxlength="16" placeholder="Seu nome" value="">
      <button class="btn sm purple ol-s" id="crRand">${ico('sparkle')}Aleatório</button></div></div>
    <div class="cr-opts" id="crOpts"></div>
    <div class="cr-foot">${first ? '' : `<button class="btn gray ol-s" id="crCancel">Cancelar</button>`}<button class="btn ol-s" id="crGo">${ico('check')}${first ? 'Zarpar!' : 'Salvar'}</button></div></div>`);
  document.querySelector('#app').appendChild(wrap);
  const nameIn = wrap.querySelector('#crName');
  nameIn.value = name;
  const draw = () => { wrap.querySelector('#crAv').innerHTML = avatarSVG(look); };
  const rows = () => {
    wrap.querySelector('#crOpts').innerHTML = LOOK_ORDER.map(k => {
      const o = LOOK_OPTS[k];
      const items = o.colors
        ? o.colors.map(c => `<button class="sw${look[k] === c ? ' on' : ''}" data-k="${k}" data-v="${c}" style="background:${c}" aria-label="${o.name}"></button>`).join('')
        : o.list.map(([v, n]) => `<button class="chip ol-s${look[k] === v ? ' on' : ''}" data-k="${k}" data-v="${v}">${n}</button>`).join('');
      return `<div class="cr-row"><div class="cr-lab">${o.name}</div><div class="cr-items">${items}</div></div>`;
    }).join('');
    wrap.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { sfx('tap'); look[b.dataset.k] = b.dataset.v; rows(); draw(); });
  };
  rows(); draw();
  wrap.querySelector('#crRand').onclick = () => { sfx('tap'); Object.assign(look, randomLook()); rows(); draw(); };
  const close = () => wrap.remove();
  if (!first) wrap.querySelector('#crCancel').onclick = () => { sfx('close'); close(); };
  wrap.querySelector('#crGo').onclick = () => {
    const n = nameIn.value.trim();
    if (!n) { sfx('nogold'); toast('Dê um nome ao seu capitão.', 'user'); nameIn.focus(); return; }
    sfx('levelup');
    S.name = n;
    S.hero.look = Object.assign({}, look);
    const fresh = !S.hero.created;
    S.hero.created = true;
    recompute(); save();
    emit('hero'); emit('look');
    close();
    if (fresh) toast(`${n}, a aventura começa agora!`, 'flag');
  };
}
