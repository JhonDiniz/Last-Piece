// "Pirata" screen: captain, ship, skills, crew, relics, attributes.
import { S } from '../../core/state.js';
import { on, emit } from '../../core/bus.js';
import { fmt, fmtS, fmtPct, fmtDec } from '../../core/util.js';
import { sfx } from '../../core/audio.js';
import { registerScreen, rerender, screenOpen, openScreen } from '../screens.js';
import { $, $$, ico, el, modal, toast } from '../dom.js';
import { card, detail, gstyle, gradeBadge } from '../cards.js';
import { GRADES, fuseNeed } from '../../data/balance.js';
import { SKILLS, SKILL, skillPassive, skillDmg } from '../../data/skills.js';
import { GEAR, GEAR_BY, SLOTS, SLOT, gearEq, gearPas } from '../../data/gear.js';
import { PETS, PET, petAtk, petSpd, petPassive, PET_SLOTS, ultDesc } from '../../data/pets.js';
import { TRAINING, HAKI, xpNeed, LV_MAX } from '../../data/hero.js';
import { SHIPS, SHIP, SHIP_MAX, shipMul, shipUpCost, RANK_NAMES, RANK_COLS } from '../../data/ships.js';
import { RELICS, RELIC, TREASURES, RELIC_MAX, relicCost } from '../../data/relics.js';
import { UPGRADES, UP } from '../../data/balance.js';
import { skillIcon, gearIcon, relicIcon, treasureIcon, unknownIcon } from '../../art/items.js';
import { petSVG } from '../../art/pets.js';
import { avatarSVG } from '../../art/avatar.js';
import { shipSVG } from '../../art/ship.js';
import { icon } from '../../art/icons.js';
import { ST, BONUS } from '../../game/stats.js';
import { isOpen } from '../../game/progress.js';
import { UNLOCK } from '../../data/missions.js';
import { equipSkill, unequipSkill, autoEquipSkills, fuseAll, fuseItem, canFuse } from '../../game/skills.js';
import { equipGear, unequipGear, autoEquipGear, gearSlotOpen, petSlotsOpen, equipPet, unequipPet, autoEquipPets, relicLevelUp } from '../../game/collection.js';
import { spendPoint, resetPoints, hakiOpen } from '../../game/hero.js';
import { setShip, shipUpgrade } from '../../game/ship.js';
import { openCreator } from '../creator.js';

const TABS = [
  { k: 'Pirata', open: () => true },
  { k: 'Barco', open: () => true },
  { k: 'Habilidade', open: () => isOpen('skills'), lock: `Missão ${UNLOCK.skills}` },
  { k: 'Bando', open: () => isOpen('pets'), lock: `Missão ${UNLOCK.pets}` },
  { k: 'Relíquia', open: () => isOpen('raid'), lock: `Missão ${UNLOCK.raid}` },
  { k: 'Atributo', open: () => true },
];
let tab = 'Pirata', selSlot = -1, newIds = new Set();
on('summoned', d => { for (const r of d.res) if (r.isNew) newIds.add(r.id); });

const pct = v => '+' + fmt(Math.round(v * 100)) + '%';

registerScreen('slime', {
  render(body, arg) {
    if (arg) tab = arg;
    const t = TABS.find(x => x.k === tab);
    if (arg === 'Companheiro') tab = 'Bando';
    if (!TABS.find(x => x.k === tab) || (t && !t.open())) tab = 'Pirata';
    body.innerHTML = `<div class="scr-head"><div class="scr-title f-num ol">${ico(tab === 'Habilidade' ? 'book' : tab === 'Bando' ? 'paw' : tab === 'Relíquia' ? 'relic' : tab === 'Atributo' ? 'sword' : tab === 'Barco' ? 'ship' : 'pirate')}${tab}</div></div>
      <div class="scr-scroll" id="slScroll"></div>
      <div class="tabs t6">${TABS.map(x => `<button class="tab f-num ol-s${x.k === tab ? ' on' : ''}${x.open() ? '' : ' locked'}" data-t="${x.k}">${x.open() ? '' : ico('lock')}${x.k}</button>`).join('')}</div>`;
    body.querySelectorAll('.tab').forEach(b => b.onclick = () => {
      const x = TABS.find(y => y.k === b.dataset.t);
      if (!x.open()) { sfx('nogold'); toast(`Desbloqueia na ${x.lock}`, 'lock'); return; }
      sfx('tap'); tab = x.k; selSlot = -1; rerender();
    });
    const sc = body.querySelector('#slScroll');
    ({ Pirata: tabPirate, Barco: tabShip, Habilidade: tabSkills, Bando: tabPets, 'Relíquia': tabRelics, Atributo: tabStats })[tab](sc);
  },
  onClose() { newIds.clear(); emit('dots'); },
});
const refresh = () => { if (screenOpen() === 'slime') { const sc = $('#slScroll'); const y = sc ? sc.scrollTop : 0; rerender(); const n = $('#slScroll'); if (n) n.scrollTop = y; } };
on('collection', refresh); on('skills', refresh); on('gear', refresh); on('pets', refresh); on('hero', refresh); on('ship', refresh); on('relics', refresh); on('levelUp', refresh); on('newShip', refresh);

// ------------------------------------------------------------------ Pirata
function tabPirate(sc) {
  const H = S.hero, need = xpNeed(H.lv);
  const gearRow = SLOTS.map(slot => {
    const open = gearSlotOpen(slot.k), gid = S.gear.eq[slot.k], it = gid && GEAR_BY[gid];
    return `<button class="card${it ? '' : ' none'}" data-slot="${slot.k}" style="${it ? gstyle(it.g) : ''}">
      <div class="art">${it ? gearIcon(it) : open ? `<div style="opacity:.5">${icon(slot.k === 'weapon' ? 'sword' : slot.k === 'armor' ? 'heart' : slot.k === 'ring' ? 'relic' : 'treasure')}</div>` : icon('lock')}</div>
      <span class="nv f-num ol-s">${it ? 'NV' + S.gear.own[gid].lv : slot.name}</span>${!open ? `<div class="bar"><span class="f-num ol-s">Fase ${slot.unlock}</span></div>` : ''}</button>`;
  }).join('');
  const row = (k, name, ic, col, p, max, desc, locked) => `<div class="trow${locked ? ' locked' : ''}">
      <span class="ti" style="--c:${col}">${ic}</span>
      <div class="tt"><div class="tn"><b class="f-num ol-s">${name}</b><span class="f-num ol-s">${locked ? '' : `${p}/${max}`}</span></div><div class="td">${desc}</div></div>
      <button class="btn sm ol-s tplus" data-pt="${k}"${locked || H.pts <= 0 || p >= max ? ' disabled' : ''}>${locked ? ico('lock') : ico('plus')}</button></div>`;
  sc.innerHTML = `
    <div class="panelx" style="display:flex;gap:1.2rem;align-items:center;background:linear-gradient(#5fb3e6,#3a7ac0)">
      <div style="width:12rem;height:13rem;flex:none;position:relative"><div style="position:absolute;left:1rem;right:1rem;bottom:.2rem;height:1.6rem;border-radius:50%;background:rgba(20,10,40,.3)"></div><div style="position:absolute;inset:0;animation:bob 2.2s ease-in-out infinite">${avatarSVG(H.look)}</div></div>
      <div style="flex:1;min-width:0">
        <div class="f-num ol" style="font-size:2.2rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${S.name}</div>
        <div class="f-num ol-s" style="font-size:1.6rem;margin:.3rem 0">Nível ${H.lv}${H.lv >= LV_MAX ? ' (máx.)' : ''}</div>
        <div class="det" style="align-items:stretch"><div class="bigbar" style="width:100%"><i style="width:${H.lv >= LV_MAX ? 100 : Math.min(100, H.xp / need * 100)}%"></i><span class="f-num ol-s">${H.lv >= LV_MAX ? 'MÁX' : `${fmt(H.xp)}/${fmt(need)} XP`}</span></div></div>
        <button class="btn sm purple ol-s" id="hLook" style="margin-top:.6rem;width:100%">${ico('user')}Editar visual</button>
      </div>
    </div>
    <div class="passive" style="margin-top:1rem">${ico('star')} Pontos de treino: <b>${H.pts}</b> <span style="color:var(--txt3);font-size:1.2rem">(+1 por nível)</span></div>
    <div class="sec">Treino</div>
    ${TRAINING.map(t => row(t.k, t.name, icon(t.icon), t.col, H.train[t.k], t.max, t.desc(H.train[t.k]), false)).join('')}
    <div class="sec">Haki</div>
    ${HAKI.map(h => row(h.k, h.name, `<span style="display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 40% 35%, #fff, ${h.col} 45%, #2a1a3e)"></span>`, h.col, H.haki[h.k], h.max,
      hakiOpen(h.k) ? h.desc(H.haki[h.k]) : `Libera no nível ${h.lv}`, !hakiOpen(h.k))).join('')}
    <div class="btnrow"><button class="btn sm gray ol-s" id="hReset">${ico('rebirth')}Redistribuir pontos</button></div>
    <div class="sec">Equipamento</div>
    <div class="grid g4">${gearRow}</div>
    <div class="btnrow"><button class="btn sm blue ol-s" id="gAuto">${ico('check')}Equipar melhor</button><button class="btn sm purple ol-s" id="gFuse">${ico('arrowUp')}Fundir tudo</button></div>
    <div class="sec">Coleção de equipamentos</div>
    <div class="passive">${ico('sword')} ATQ <b>${pct(BONUS.gearAtk || 0)}</b> &nbsp; ${ico('heart')} PV <b>${pct(BONUS.gearHp || 0)}</b></div>
    <div class="grid" id="gGrid" style="margin-top:1rem">${GEAR.filter(x => gearSlotOpen(x.slot)).map(x => card(x.id, gearIcon(x), x.g, S.gear.own[x.id], { eq: S.gear.eq[x.slot] === x.id, isNew: newIds.has(x.id) })).join('')}</div>
    <div style="height:2rem"></div>`;
  sc.querySelector('#hLook').onclick = () => { sfx('tap'); openCreator(false); };
  sc.querySelector('#hReset').onclick = () => { const n = resetPoints(); sfx(n ? 'levelup' : 'tap'); toast(n ? `${n} pontos devolvidos` : 'Nenhum ponto gasto', 'star'); };
  sc.querySelectorAll('[data-pt]').forEach(b => b.onclick = () => {
    const r = spendPoint(b.dataset.pt);
    if (r === 'ok') sfx('levelup');
    else { sfx('nogold'); toast(r === 'pts' ? 'Sem pontos. Suba de nível derrotando inimigos.' : r === 'locked' ? 'Ainda bloqueado.' : 'Nível máximo.', 'star'); }
  });
  sc.querySelector('#gAuto').onclick = () => { sfx('tap'); autoEquipGear(); toast('Melhores equipamentos equipados', 'check'); };
  sc.querySelector('#gFuse').onclick = () => { const n = fuseAll(S.gear.own); sfx(n ? 'levelup' : 'nogold'); toast(n ? `${n} equipamentos melhorados` : 'Nada para fundir', 'arrowUp'); };
  sc.querySelectorAll('[data-slot]').forEach(b => b.onclick = () => {
    const slot = b.dataset.slot;
    if (!gearSlotOpen(slot)) { sfx('nogold'); toast(`Desbloqueia na fase ${SLOT[slot].unlock}`, 'lock'); return; }
    if (!isOpen('gear')) { sfx('nogold'); toast(`Desbloqueia na Missão ${UNLOCK.gear}`, 'lock'); return; }
    sfx('tap'); gearPicker(slot);
  });
  sc.querySelectorAll('#gGrid .card').forEach(b => b.onclick = () => { sfx('tap'); gearDetail(b.dataset.id); });
}

// ------------------------------------------------------------------ Barco
const PAS_N = { atk: 'ATQ', hp: 'PV', aspd: 'VATQ', gold: 'Ouro', rec: 'Recuperação de PV', crit: 'Chance de Crítico', cdmg: 'Dano Crítico' };
const pasText = (s, lv) => Object.entries(s.pas).map(([k, v]) => `${PAS_N[k]} +${Math.round(v * shipMul(lv) * 100)}%`).join(' · ');
function tabShip(sc) {
  const cur = SHIP[S.ships.cur] || SHIP.bote, lv = S.ships.own[cur.id] || 1;
  const cost = shipUpCost(cur, lv);
  sc.innerHTML = `
    <div class="panelx" style="padding:0;overflow:hidden">
      <div style="position:relative;height:15rem;background:linear-gradient(#8fd8ff,#c8f0ff 62%,#3fa8e0 62%,#1f5fa8)">
        <div style="position:absolute;left:50%;bottom:.6rem;width:${17 * cur.size + 4}rem;transform:translateX(-50%);animation:bob 2.6s ease-in-out infinite">${shipSVG(cur)}</div>
      </div>
      <div style="padding:1rem 1.2rem">
        <div style="display:flex;align-items:center;gap:.8rem"><span class="gr f-num ol-s" style="background:${RANK_COLS[cur.r]};padding:.1rem .8rem;border-radius:.8rem;border:.2rem solid var(--ol);font-size:1.2rem">${RANK_NAMES[cur.r]}</span><span class="f-num ol" style="font-size:2.2rem">${cur.name}</span><span class="f-num ol-s" style="margin-left:auto;font-size:1.6rem">NV ${lv}</span></div>
        <div style="font-size:1.3rem;color:var(--txt3);margin:.4rem 0 .8rem">${cur.lore}</div>
        <div class="kv"><span>Bônus</span><b class="ol-s" style="font-size:1.35rem;text-align:right">${pasText(cur, lv)}</b></div>
        <div class="passive" style="flex-direction:column;align-items:flex-start;gap:.2rem;text-align:left"><span class="f-num ol-s" style="color:#ffe680;font-size:1.5rem">${cur.ab.name}</span><span style="color:var(--txt2);font-size:1.3rem">${cur.ab.desc}${cur.ab.pct || cur.ab.shield ? ` <span style="color:#9dff7a">(força x${shipMul(lv).toFixed(2).replace('.', ',')})</span>` : ''}</span></div>
        <div class="btnrow"><button class="btn ol-s" id="shUp"${lv >= SHIP_MAX ? ' disabled' : ''}>${ico('arrowUp')}${lv >= SHIP_MAX ? 'Nível máximo' : `Melhorar ${ico('coin')}${fmt(cost)}`}</button></div>
      </div>
    </div>
    <div class="sec">Frota</div>
    ${SHIPS.map(sh => {
      const own = S.ships.own[sh.id], here = sh.id === cur.id;
      return `<button class="shiprow${own ? '' : ' locked'}${here ? ' on' : ''}" data-sh="${sh.id}">
        <div class="sa">${shipSVG(sh)}</div>
        <div class="st"><div><b class="f-num ol-s" style="font-size:1.6rem">${sh.name}</b> <span style="color:${RANK_COLS[sh.r]};font-size:1.2rem" class="f-num ol-s">${RANK_NAMES[sh.r]}</span></div>
          <div style="font-size:1.2rem;color:var(--txt3)">${own ? `NV ${own} · ${pasText(sh, own)}` : `Chega na fase ${sh.stage}`}</div>
          <div style="font-size:1.2rem;color:var(--txt2)">${sh.ab.name}</div></div>
        <span class="sb f-num ol-s">${here ? 'Em uso' : own ? 'Usar' : ico('lock')}</span></button>`;
    }).join('')}
    <div style="height:2rem"></div>`;
  const up = sc.querySelector('#shUp');
  up.onclick = () => { const r = shipUpgrade(cur.id); if (r === 'ok') sfx('levelup'); else { sfx('nogold'); if (r === 'gold') toast('Ouro insuficiente.', 'coin'); } };
  sc.querySelectorAll('[data-sh]').forEach(b => b.onclick = () => {
    const sh = SHIP[b.dataset.sh];
    if (!S.ships.own[sh.id]) { sfx('nogold'); toast(`${sh.name} chega na fase ${sh.stage}.`, 'lock'); return; }
    if (sh.id === cur.id) { sfx('tap'); return; }
    setShip(sh.id); sfx('levelup'); toast(`Zarpando no ${sh.name}!`, 'ship');
  });
}

function gearPicker(slot) {
  const items = GEAR.filter(x => x.slot === slot && S.gear.own[x.id]).sort((a, b) => b.g - a.g);
  if (!items.length) { toast('Invoque equipamentos na Loja.', 'shop'); return; }
  modal({ title: SLOT[slot].name, body: `<div class="grid g4">${items.map(x => card(x.id, gearIcon(x), x.g, S.gear.own[x.id], { eq: S.gear.eq[slot] === x.id })).join('')}</div>`,
    buttons: [{ label: 'Fechar', cls: 'gray' }],
    onOpen(m) { m.querySelectorAll('.card').forEach(c => c.onclick = () => { sfx('tap'); m.remove(); gearDetail(c.dataset.id); }); } });
}
function gearDetail(id) {
  const it = GEAR_BY[id], own = S.gear.own[id];
  const eqd = S.gear.eq[it.slot] === id;
  const eqv = gearEq(it, own ? own.lv : 1), pv = gearPas(it, own ? own.lv : 1);
  const nm = { atk: 'ATQ', hp: 'PV', cdmg: 'Dano Crítico', gold: 'Ouro' };
  const nextE = gearEq(it, (own ? own.lv : 1) + 1), nextP = gearPas(it, (own ? own.lv : 1) + 1);
  const b = [];
  if (own) {
    b.push({ label: eqd ? 'Remover' : 'Equipar', cls: eqd ? 'gray' : 'blue', onClick: () => { if (eqd) unequipGear(it.slot); else if (!equipGear(id)) { toast(`Desbloqueia na fase ${SLOT[it.slot].unlock}`, 'lock'); return false; } sfx('tap'); } });
    b.push({ label: 'Fundir', cls: 'purple', onClick: () => { if (fuseItem(S.gear.own, id)) { sfx('levelup'); emit('gear'); } else { sfx('nogold'); toast('Cópias insuficientes.', 'arrowUp'); return false; } } });
  } else b.push({ label: 'Fechar', cls: 'gray' });
  modal({ title: SLOT[it.slot].name, body: detail({ art: gearIcon(it), g: it.g, name: it.name, lv: own && own.lv, cp: own ? own.cp : 0, need: own ? fuseNeed(own.lv) : 0,
    stats: [[`Efeito equipado (${nm[eqv.stat]})`, `+${fmt(eqv.v)}%${own ? ` → +${fmt(nextE.v)}%` : ''}`], [`Efeito passivo (${nm[pv.stat]})`, `+${fmt(pv.v)}%${own ? ` → +${fmt(nextP.v)}%` : ''}`]],
    desc: own ? 'Os atributos aumentam ao fundir cópias.' : 'Ainda não obtido. Invoque Equipamentos na Loja.' }), buttons: b });
}

// ------------------------------------------------------------------ Habilidade
function tabSkills(sc) {
  const eq = S.skills.eq;
  const total = Object.entries(S.skills.own).reduce((a, [id, o]) => a + (SKILL[id] ? skillPassive(SKILL[id], o.lv) : 0), 0);
  sc.innerHTML = `
    <div class="sec">Equipadas ${selSlot >= 0 ? '<span style="color:#ffe680;font-size:1.25rem">— escolha uma habilidade</span>' : ''}</div>
    <div class="slots6">${eq.map((id, i) => `<button class="slot${selSlot === i ? ' sel' : ''}" data-i="${i}">${id ? `<div class="art">${skillIcon(SKILL[id])}</div>` : ico('plus')}</button>`).join('')}</div>
    <div class="btnrow"><button class="btn sm blue ol-s" id="skAuto">${ico('check')}Equipar automático</button><button class="btn sm purple ol-s" id="skFuse">${ico('arrowUp')}Fundir tudo</button><button class="btn sm gold ol-s" id="skSum">${ico('gem')}Invocar</button></div>
    <div class="sec">Coleção</div>
    <div class="passive">Efeito passivo: ${ico('sword')} ATQ <b>+${fmt(Math.round(total))}%</b></div>
    <div class="grid" style="margin-top:1rem">${SKILLS.map(s => card(s.id, skillIcon(s), s.g, S.skills.own[s.id], { eq: eq.includes(s.id), isNew: newIds.has(s.id) })).join('')}</div>
    <div style="height:2rem"></div>`;
  sc.querySelectorAll('.slot').forEach(b => b.onclick = () => {
    sfx('tap');
    const i = +b.dataset.i;
    selSlot = selSlot === i ? -1 : i;
    rerender();
  });
  sc.querySelector('#skAuto').onclick = () => { sfx('tap'); autoEquipSkills(); };
  sc.querySelector('#skFuse').onclick = () => { const n = fuseAll(S.skills.own); sfx(n ? 'levelup' : 'nogold'); toast(n ? `${n} habilidades melhoradas` : 'Nada para fundir', 'arrowUp'); };
  sc.querySelector('#skSum').onclick = () => { sfx('tap'); openScreen('shop', 'skill'); };
  sc.querySelectorAll('.grid .card').forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    if (selSlot >= 0 && S.skills.own[id]) { equipSkill(id, selSlot); selSlot = -1; sfx('levelup'); return; }
    sfx('tap'); skillDetail(id);
  });
}
function skillDetail(id) {
  const s = SKILL[id], o = S.skills.own[id];
  const lv = o ? o.lv : 1;
  const d = skillDmg(s, lv), dn = skillDmg(s, lv + 1);
  let desc = s.desc.replace('{d}', `<b>${fmt(Math.round(d))}%</b>`).replace('{t}', `<b>${s.dur || 0}</b>`).replace('{b}', `<b>${s.buff && s.buff.aspd ? (s.buff.aspd * (1 + 0.1 * (lv - 1))).toFixed(1).replace('.', ',') : ''}</b>`)
    .replace('{s}', `<b>${s.buff && s.buff.shield ? Math.round(s.buff.shield * 100 * (1 + 0.1 * (lv - 1))) + '%' : ''}</b>`).replace('{h}', `<b>${s.buff && s.buff.heal ? Math.round(s.buff.heal * 100) + '%' : ''}</b>`);
  const isEq = S.skills.eq.includes(id);
  const btns = [];
  if (o) {
    btns.push({ label: isEq ? 'Remover' : 'Equipar', cls: isEq ? 'gray' : 'blue', onClick: () => { if (isEq) unequipSkill(id); else equipSkill(id); sfx('tap'); } });
    btns.push({ label: 'Fundir', cls: 'purple', onClick: () => { if (fuseItem(S.skills.own, id)) { sfx('levelup'); } else { sfx('nogold'); toast('Cópias insuficientes.', 'arrowUp'); return false; } } });
  } else btns.push({ label: 'Fechar', cls: 'gray' });
  modal({ title: 'Habilidade', body: detail({ art: skillIcon(s), g: s.g, name: s.name, lv: o && o.lv, cp: o ? o.cp : 0, need: o ? fuseNeed(o.lv) : 0, desc,
    stats: [['Recarga', `${s.cd} s`], ...(s.dmg ? [['Dano', `${fmt(Math.round(d))}%${o ? ` → ${fmt(Math.round(dn))}%` : ''}`]] : []), ['Efeito passivo (ATQ)', `+${fmt(Math.round(skillPassive(s, lv)))}%${o ? ` → +${fmt(Math.round(skillPassive(s, lv + 1)))}%` : ''}`]] }), buttons: btns });
}

// ------------------------------------------------------------------ Companheiro
function tabPets(sc) {
  const n = petSlotsOpen();
  const total = Object.entries(S.pets.own).reduce((a, [id, o]) => a + (PET[id] ? petPassive(PET[id], o.lv) : 0), 0);
  sc.innerHTML = `
    <div class="panelx" style="background:linear-gradient(#8fd0ff,#5aa8e8);display:flex;justify-content:space-around;align-items:flex-end;height:11rem;padding-bottom:1.6rem">
      ${[0, 1, 2, 3, 4].map(i => { const id = S.pets.eq[i]; const open = i < n; return `<button class="pslot" data-i="${i}" style="position:relative;width:5.6rem;height:5.6rem;${open ? '' : 'opacity:.55'}">
        <div style="position:absolute;left:.4rem;right:.4rem;bottom:-.4rem;height:1.4rem;border-radius:50%;background:rgba(20,10,40,.25)"></div>
        ${id ? `<div style="position:absolute;inset:0;animation:bob ${1.6 + i * .2}s ease-in-out infinite">${petSVG(PET[id])}</div>` : `<div style="position:absolute;inset:.6rem;border-radius:1.2rem;border:.25rem dashed rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;font-size:2.2rem">${open ? ico('plus') : ico('lock')}</div>`}
        ${!open ? `<span class="f-num ol-s" style="position:absolute;left:50%;bottom:-2rem;transform:translateX(-50%);font-size:1rem;white-space:nowrap">Fase ${PET_SLOTS[i]}</span>` : ''}</button>`; }).join('')}
    </div>
    <div class="btnrow"><button class="btn sm blue ol-s" id="pAuto">${ico('check')}Equipar automático</button><button class="btn sm purple ol-s" id="pFuse">${ico('arrowUp')}Fundir tudo</button><button class="btn sm gold ol-s" id="pSum">${ico('gem')}Invocar</button></div>
    <div class="sec">Coleção</div>
    <div class="passive">Efeito passivo: ${ico('sword')} ATQ <b>+${fmt(Math.round(total))}%</b></div>
    <div class="grid" style="margin-top:1rem">${PETS.map(p => card(p.id, petSVG(p), p.g, S.pets.own[p.id], { eq: S.pets.eq.includes(p.id), isNew: newIds.has(p.id) })).join('')}</div>
    <div style="height:2rem"></div>`;
  sc.querySelectorAll('.pslot').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i >= n) { sfx('nogold'); toast(`Desbloqueia na fase ${PET_SLOTS[i]}`, 'lock'); return; } const id = S.pets.eq[i]; sfx('tap'); if (id) petDetail(id); else toast('Toque em um companheiro da coleção para equipar.', 'paw'); });
  sc.querySelector('#pAuto').onclick = () => { sfx('tap'); autoEquipPets(); };
  sc.querySelector('#pFuse').onclick = () => { const k = fuseAll(S.pets.own); sfx(k ? 'levelup' : 'nogold'); toast(k ? `${k} companheiros melhorados` : 'Nada para fundir', 'arrowUp'); };
  sc.querySelector('#pSum').onclick = () => { sfx('tap'); openScreen('shop', 'pet'); };
  sc.querySelectorAll('.grid .card').forEach(b => b.onclick = () => { sfx('tap'); petDetail(b.dataset.id); });
}
function petDetail(id) {
  const p = PET[id], o = S.pets.own[id], lv = o ? o.lv : 1;
  const isEq = S.pets.eq.includes(id);
  const btns = [];
  if (o) {
    btns.push({ label: isEq ? 'Remover' : 'Equipar', cls: isEq ? 'gray' : 'blue', onClick: () => { if (isEq) unequipPet(id); else equipPet(id); sfx('tap'); } });
    btns.push({ label: 'Fundir', cls: 'purple', onClick: () => { if (fuseItem(S.pets.own, id)) { sfx('levelup'); } else { sfx('nogold'); toast('Cópias insuficientes.', 'arrowUp'); return false; } } });
  } else btns.push({ label: 'Fechar', cls: 'gray' });
  modal({ title: 'Companheiro', body: detail({ art: petSVG(p), g: p.g, name: p.name, lv: o && o.lv, cp: o ? o.cp : 0, need: o ? fuseNeed(o.lv) : 0,
    desc: `<b style="color:${p.ult.col}">ULT — ${p.ult.name}</b> (a cada ${p.ult.cd} s): ${ultDesc(p, lv)}`,
    stats: [['ATQ', fmt(ST.atk * petAtk(p, lv))], ['VATQ', fmtDec(petSpd(p, lv), 2)], ['Efeito passivo (ATQ)', `+${fmt(Math.round(petPassive(p, lv)))}%`]] }), buttons: btns });
}

// ------------------------------------------------------------------ Relíquia
function tabRelics(sc) {
  const found = Object.keys(S.relics).length, tf = Object.keys(S.treasures).length;
  sc.innerHTML = `
    <div class="passive">${ico('relic')} Pó de relíquia: <b>${fmt(S.relicDust)}</b> &nbsp;·&nbsp; Relíquias ${found}/${RELICS.length}</div>
    <div class="grid" style="margin-top:1rem">${RELICS.map(r => {
      const lv = S.relics[r.id];
      return `<button class="card${lv ? '' : ' none'}" data-r="${r.id}" style="--gc:#3a2e6e;--gc2:#5a4aa0;--gb:${r.col}"><div class="art">${lv ? relicIcon(r) : unknownIcon()}</div>${lv ? `<span class="nv f-num ol-s">NV${lv}</span>` : ''}${lv && lv < RELIC_MAX && S.relicDust >= relicCost(lv) ? `<i class="up">${ico('arrowUp')}</i>` : ''}</button>`;
    }).join('')}</div>
    <div class="sec">Tesouros da mina <span style="color:var(--txt3);font-size:1.3rem">(${tf}/${TREASURES.length})</span></div>
    <div class="grid">${TREASURES.map(t => `<button class="card${S.treasures[t.id] ? '' : ' none'}" data-t="${t.id}" style="--gc:#3a2e2e;--gc2:#6a4a3a;--gb:${t.col}"><div class="art">${S.treasures[t.id] ? treasureIcon(t) : unknownIcon()}</div></button>`).join('')}</div>
    <div style="height:2rem"></div>`;
  const statN = { atk: 'ATQ', hp: 'PV', gold: 'Ouro', crit: 'Chance de Crítico', cdmg: 'Dano Crítico', aspd: 'VATQ', skill: 'Dano de habilidades', gems: 'Gemas', offline: 'Ganhos offline' };
  sc.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
    sfx('tap');
    const r = RELIC[b.dataset.r], lv = S.relics[r.id];
    if (!lv) { toast('Encontre relíquias nas Incursões.', 'raid'); return; }
    modal({ title: 'Relíquia', body: detail({ art: relicIcon(r), g: 4 + r.tier % 4, name: r.name, lv, cp: S.relicDust, need: relicCost(lv), gradeLabel: '',
      stats: [[statN[r.stat], `+${fmtPct(r.per * lv)} → +${fmtPct(r.per * (lv + 1))}`], ['Custo', `${fmt(relicCost(lv))} pó`]] }),
      buttons: [{ label: 'Melhorar', cls: 'purple', keep: true, onClick: (e) => { if (relicLevelUp(r.id)) { sfx('levelup'); document.querySelector('.mback').remove(); b.click(); } else { sfx('nogold'); toast(lv >= RELIC_MAX ? 'Nível máximo.' : 'Pó insuficiente.', 'relic'); } } }, { label: 'Fechar', cls: 'gray' }] });
  });
  sc.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
    sfx('tap');
    const t = TREASURES.find(x => x.id === b.dataset.t);
    if (!S.treasures[t.id]) { toast(`Cave até ${t.depth} m na Mina.`, 'pickaxe'); return; }
    modal({ title: 'Tesouro', body: detail({ art: treasureIcon(t), g: 4, name: t.name, gradeLabel: '', stats: [[statN[t.stat], '+' + fmtPct(t.v)], ['Encontrado a', `${t.depth} m`]] }) });
  });
}

// ------------------------------------------------------------------ Atributo
function tabStats(sc) {
  const b = BONUS;
  const g = (o, k) => (o && o[k]) || 0;
  const rows = [
    ['sword', 'ATQ', fmt(ST.atk)], ['heart', 'PV', fmt(ST.hp)], ['regen', 'Recuperação de PV', fmtS(ST.rec) + '/s'], ['speed', 'VATQ', fmtDec(ST.aspd, 2)],
    ['crit', 'Chance de Crítico', fmtPct(ST.crit)], ['burst', 'Dano Crítico', fmtPct(ST.cdmg, 0)], ['double', 'Ataque Duplo', fmtPct(ST.dbl)], ['triple', 'Ataque Triplo', fmtPct(ST.trp)],
    ['bossdmg', 'Dano em Chefes', fmtPct(ST.boss, 0)], ['heart', 'Redução de dano', fmtPct(ST.def)], ['speed', 'Esquiva', fmtPct(ST.dodge)], ['gold', 'Ouro obtido', fmtPct(ST.gold, 0)], ['book', 'Dano de habilidades', fmtPct(ST.skill, 0)], ['clock', 'Redução de recarga', fmtPct(ST.cdr, 0)],
    ['power', 'Poder', fmt(ST.power)],
  ];
  const src = [
    ['Coleção de habilidades', 'ATQ ' + pct(b.skills || 0)], ['Coleção de companheiros', 'ATQ ' + pct(b.pets || 0)],
    ['Equipamentos (passivo)', `ATQ ${pct(b.gearAtk || 0)} · PV ${pct(b.gearHp || 0)}`], ['Equipamentos (equipados)', `ATQ ${pct(b.eqAtk || 0)} · PV ${pct(b.eqHp || 0)}`],
    ['Nível do capitão', `ATQ ${pct(b.lvAtk || 0)} · PV ${pct(b.lvHp || 0)}`], ['Treino', `ATQ ${pct(g(b.train, 'atk'))} · PV ${pct(g(b.train, 'hp'))}`],
    ['Barco', `ATQ ${pct(g(b.ship, 'atk'))} · PV ${pct(g(b.ship, 'hp'))}`], ['Haki do Armamento', `Dano ${pct(ST.armDmg || 0)}`], ['Relíquias', `ATQ ${pct(g(b.relic, 'atk'))} · PV ${pct(g(b.relic, 'hp'))}`],
    ['Tesouros', `ATQ ${pct(g(b.treasure, 'atk'))} · PV ${pct(g(b.treasure, 'hp'))}`], ['Talentos', `ATQ ${pct(g(b.talent, 'atk'))} · PV ${pct(g(b.talent, 'hp'))}`],
  ];
  sc.innerHTML = `<div class="sec">Atributos finais</div>${rows.map(([i, k, v]) => `<div class="kv"><span style="display:flex;align-items:center;gap:.8rem"><span style="width:2.6rem;height:2.6rem">${icon(i)}</span>${k}</span><b class="ol-s">${v}</b></div>`).join('')}
    <div class="sec">Multiplicadores</div>${src.map(([k, v]) => `<div class="kv"><span>${k}</span><b class="ol-s" style="font-size:1.35rem">${v}</b></div>`).join('')}<div style="height:2rem"></div>`;
}
