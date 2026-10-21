// DOM helpers shared by every screen.
import { icon } from '../art/icons.js';
import { sfx } from '../core/audio.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const ico = (name, cls = '') => `<i class="ico ${cls}">${icon(name)}</i>`;

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function toast(msg, ic) {
  const box = $('#toasts');
  while (box.children.length > 2) box.firstChild.remove();
  const t = el(`<div class="toast ol-s">${ic ? ico(ic) : ''}<span>${msg}</span></div>`);
  box.appendChild(t);
  setTimeout(() => t.remove(), 1700);
}

// modal({title, body (html), buttons:[{label, cls, icon, onClick, keep}], onClose, closeX})
export function modal(o) {
  const back = el(`<div class="mback"><div class="mbox"><div class="mt ol">${o.title || ''}</div><div class="mbody">${o.body || ''}</div><div class="mbtns"></div></div></div>`);
  const btns = back.querySelector('.mbtns');
  const close = () => { back.remove(); if (o.onClose) o.onClose(); };
  for (const b of (o.buttons || [{ label: 'Ok' }])) {
    const e = el(`<button class="btn ${b.cls || ''} ol-s">${b.icon ? ico(b.icon) : ''}<span>${b.label}</span></button>`);
    e.onclick = () => { sfx('tap'); if (b.onClick && b.onClick(e) === false) return; if (!b.keep) close(); };
    btns.appendChild(e);
  }
  if (o.closeOnBack !== false) back.addEventListener('pointerdown', ev => { if (ev.target === back) close(); });
  $('#modals').appendChild(back);
  if (o.onOpen) o.onOpen(back);
  return { close, el: back };
}

// press-and-hold repeating action (for buying many levels quickly)
export function holdRepeat(btn, fn) {
  let t = null, n = 0, alive = false;
  const step = () => {
    if (!alive) return;
    const ok = fn(++n);
    if (ok === false) { stop(); return; }
    t = setTimeout(step, Math.max(45, 260 - n * 22));
  };
  const start = e => {
    e.preventDefault();
    alive = true; n = 0;
    btn.classList.add('press');
    const ok = fn(++n);
    if (ok === false) { stop(); return; }
    t = setTimeout(step, 380);
  };
  const stop = () => { alive = false; clearTimeout(t); btn.classList.remove('press'); };
  btn.addEventListener('pointerdown', start);
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(ev, stop);
  btn.addEventListener('contextmenu', e => e.preventDefault());
}

// fly a few icons from one element to another (rewards)
export function flyIcons(from, to, name, n = 6, onDone) {
  const app = $('#app').getBoundingClientRect();
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const x0 = a.left + a.width / 2 - app.left, y0 = a.top + a.height / 2 - app.top;
  const x1 = b.left + b.width / 2 - app.left, y1 = b.top + b.height / 2 - app.top;
  let left = n;
  for (let i = 0; i < n; i++) {
    const d = el(`<div style="position:absolute;left:0;top:0;width:2.8rem;height:2.8rem;z-index:80;pointer-events:none">${icon(name)}</div>`);
    $('#app').appendChild(d);
    const sx = x0 + (Math.random() - 0.5) * 60, sy = y0 + (Math.random() - 0.5) * 30;
    const anim = d.animate([
      { transform: `translate(${x0}px,${y0}px) scale(.4)` },
      { transform: `translate(${sx}px,${sy - 30}px) scale(1.1)`, offset: 0.3 },
      { transform: `translate(${x1}px,${y1}px) scale(.7)` },
    ], { duration: 650 + i * 60, easing: 'cubic-bezier(.5,0,.6,1)' });
    anim.onfinish = () => { d.remove(); if (--left === 0 && onDone) onDone(); };
  }
}

export function newContent(name) {
  const e = el(`<div class="newcontent"><div class="rib">Novo conteúdo!</div><div class="nm ol">${name}</div></div>`);
  $('#modals').appendChild(e);
  setTimeout(() => e.remove(), 2700);
}
