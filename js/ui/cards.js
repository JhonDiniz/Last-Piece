// Item cards and detail popups shared by the collection screens.
import { GRADES } from '../data/balance.js';
import { fuseNeed } from '../data/balance.js';
import { ico } from './dom.js';
import { fmt } from '../core/util.js';

export const GC = [
  ['#4a5068', '#8a92aa', '#c9cfdc'], ['#2f6a2a', '#6abf4a', '#a8f07a'], ['#1f4f9a', '#4a8ae8', '#8fd0ff'], ['#5a2090', '#9a4ad8', '#e09aff'],
  ['#9a5010', '#e08a2a', '#ffcc70'], ['#0f6a5a', '#2ab8a0', '#7ff8e0'], ['#8a1830', '#e0405a', '#ff9ab0'], ['#8a6a10', '#e0b830', '#fff3a0'],
];
export const gstyle = g => `--gc:${GC[g][0]};--gc2:${GC[g][1]};--gb:${GC[g][2]}`;
export const gradeBadge = g => `<span class="gr f-num ol-s" style="background:${GC[g][1]}">${GRADES[g]}</span>`;

// generic card: art svg, grade, own {lv,cp} or null, flags
export function card(id, art, g, own, o = {}) {
  if (!own) return `<button class="card none" data-id="${id}" style="${gstyle(g)}"><div class="art">${art}</div></button>`;
  const need = o.need ? o.need(own.lv) : fuseNeed(own.lv);
  const full = own.cp >= need;
  const pct = Math.min(100, own.cp / need * 100);
  return `<button class="card${o.sel ? ' sel' : ''}" data-id="${id}" style="${gstyle(g)}">
    <div class="art">${art}</div><span class="nv f-num ol-s">NV${own.lv}</span>
    <div class="bar${full ? ' full' : ''}"><i style="width:${pct}%"></i><span class="f-num ol-s">${fmt(own.cp)}/${fmt(need)}</span></div>
    ${o.eq ? `<i class="eq">${ico('check')}</i>` : ''}${o.isNew ? '<i class="new f-num ol-s">NOVO</i>' : ''}${full && !o.noUp ? `<i class="up">${ico('arrowUp')}</i>` : ''}
  </button>`;
}

export function detail({ art, g, name, lv, cp, need, desc, stats, gradeLabel }) {
  const full = cp >= need;
  return `<div class="det">
    <div class="big" style="${gstyle(g)}">${art}</div>
    ${gradeLabel || gradeBadge(g)}
    <div class="nm f-num ol">${name}${lv ? ` <span style="color:#ffe680">NV ${lv}</span>` : ''}</div>
    ${need ? `<div class="bigbar${full ? ' full' : ''}"><i style="width:${Math.min(100, cp / need * 100)}%"></i><span class="f-num ol-s">${fmt(cp)}/${fmt(need)}</span></div>` : ''}
    ${desc ? `<div class="desc">${desc}</div>` : ''}
    ${stats ? `<div class="stats">${stats.map(([k, v]) => `<div class="st"><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : ''}
  </div>`;
}
