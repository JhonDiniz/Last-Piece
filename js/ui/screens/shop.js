// Shop: summoning center and the gem market.
import { S, save } from '../../core/state.js';
import { on, emit } from '../../core/bus.js';
import { fmt, fmtTime, today, fmtInt, fmtGem } from '../../core/util.js';
import { sfx, playMusic, musicTrack } from '../../core/audio.js';
import { registerScreen, rerender, screenOpen } from '../screens.js';
import { $, ico, el, modal, toast, flyIcons } from '../dom.js';
import { gstyle, GC } from '../cards.js';
import { GRADES, gradeProbs, summonReq, SUMMON_MAX } from '../../data/balance.js';
import * as BAL from '../../data/balance.js';
import { SKILLS, SKILL } from '../../data/skills.js';
import { GEAR_BY } from '../../data/gear.js';
import { PET, PETS } from '../../data/pets.js';
import { SLIMES, SLIME } from '../../data/slimes.js';
import { skillIcon, gearIcon } from '../../art/items.js';
import { petSVG } from '../../art/pets.js';
import { slimeParts } from '../../art/slime.js';
import { icon } from '../../art/icons.js';
import { BANNERS, summon, costOf, resetDaily } from '../../game/gacha.js';
import { isOpen } from '../../game/progress.js';
import { UNLOCK } from '../../data/missions.js';
import { ST } from '../../game/stats.js';
import { giveSlimeFragments } from '../../game/collection.js';
import { CALM_TRACK, BOSS_TRACK } from '../../core/music.js';
import { B } from '../../game/battle.js';

let tab = 'Invocar', focus = null;
const artOf = (type, id) => (type === 'skill' ? skillIcon(SKILL[id]) : type === 'pet' ? petSVG(PET[id]) : gearIcon(GEAR_BY[id]));
const PREVIEW = { skill: ['meteoro', 'martelo', 'raio'], gear: ['weapon_4_0', 'armor_4_1', 'weapon_2_0'], pet: ['raposa', 'dragaozinho', 'gato'] };

registerScreen('shop', {
  render(body, arg) {
    resetDaily();
    if (arg === 'market') tab = 'Mercado'; else if (arg) { tab = 'Invocar'; focus = arg; }
    body.innerHTML = `<div class="scr-head"><div class="scr-title f-num ol">${ico('shop')}Loja</div></div>
      <div class="scr-scroll" id="shScroll"></div>
      <div class="tabs">${['Invocar', 'Mercado'].map(t => `<button class="tab f-num ol-s${t === tab ? ' on' : ''}" data-t="${t}">${t}</button>`).join('')}</div>`;
    body.querySelectorAll('.tab').forEach(b => b.onclick = () => { sfx('tap'); tab = b.dataset.t; rerender(); });
    const sc = body.querySelector('#shScroll');
    if (tab === 'Invocar') renderSummon(sc); else renderMarket(sc);
    if (focus) { const f = sc.querySelector(`[data-b="${focus}"]`); if (f) f.scrollIntoView({ block: 'center' }); focus = null; }
  },
});
on('summoned', () => { if (screenOpen() === 'shop') { const sc = $('#shScroll'); const y = sc ? sc.scrollTop : 0; rerender(); const n = $('#shScroll'); if (n) n.scrollTop = y; } });

function renderSummon(sc) {
  const mascot = slimeParts({ color: '#c55cff', hat: 'wizard' }).full('happy');
  const ban = type => {
    const b = BANNERS[type], st = S.summon[type], open = isOpen(b.feature);
    const req = summonReq(st.lv), max = st.lv >= SUMMON_MAX;
    const cols = { skill: ['#7a5ae0', '#4a32a8'], gear: ['#e8a03a', '#b8641a'], pet: ['#4fc87a', '#2a8a52'] }[type];
    const free = S.daily.free[type];
    return `<div class="ban" data-b="${type}" style="--bc2:${cols[0]};--bc:${cols[1]}">
      <div class="bt f-num ol">${ico(type === 'skill' ? 'book' : type === 'gear' ? 'sword' : 'paw')}${b.name}</div>
      <span class="bl f-num ol-s">NV ${st.lv}${max ? ' (máx.)' : ''}</span>
      <div class="lvbar"><i style="width:${max ? 100 : Math.min(100, st.n / req * 100)}%"></i><span class="f-num ol-s">${max ? 'MÁX' : `${st.n}/${req}`}</span></div>
      <div class="pics">${PREVIEW[type].map(id => `<div>${artOf(type, id)}</div>`).join('')}</div>
      <button class="btn free ol-s" data-a="free"${free > 0 ? '' : ' disabled'}><span class="c">${ico('gift')} Grátis x11 (${free}/3)</span></button>
      <div class="b2"><button class="btn blue ol-s" data-a="11"><span>x11</span><span class="c">${ico('gem')}${fmtInt(costOf(11))}</span></button><button class="btn purple ol-s" data-a="35"><span>x35</span><span class="c">${ico('gem')}${fmtInt(costOf(35))}</span></button></div>
      <button class="info" data-a="info" aria-label="Probabilidades">${ico('info')}</button>
      ${open ? '' : `<div class="lockov ol-s">${ico('lock')}<span>Desbloqueie com a Missão ${UNLOCK[b.feature]}</span></div>`}
    </div>`;
  };
  sc.innerHTML = `<div class="portal"><div class="circle"><i></i></div><div class="mascot">${mascot}</div></div>
    <div class="passive" style="margin-top:-1rem;position:relative">Centro de Invocação · ${ico('gem')} <b style="color:#fff">${fmtInt(S.gems)}</b></div>
    <div class="banners">${ban('skill')}${ban('gear')}${ban('pet')}
      <div class="ban" data-b="slimebox" style="--bc2:#4cc9f0;--bc:#2a7ab8">
        <div class="bt f-num ol">${ico('slime')}Gosmas</div><span class="bl f-num ol-s">Baú de fragmentos</span>
        <div class="pics"><div>${slimeParts({ color: '#ff8fb5', hat: 'wizard' }).full()}</div><div>${slimeParts({ color: '#c2c2d6', hat: 'astronaut' }).full('happy')}</div><div>${slimeParts({ color: '#9ad14b', hat: 'samurai' }).full()}</div></div>
        <p style="margin:0;font-size:1.15rem;color:#e8f8ff;text-align:center">6 fragmentos de uma gosma aleatória</p>
        <button class="btn gold ol-s" data-a="box" style="width:100%"><span class="c">${ico('gem')}300</span></button>
      </div>
    </div><div style="height:2rem"></div>`;
  sc.querySelectorAll('.ban').forEach(bn => {
    const type = bn.dataset.b;
    bn.querySelectorAll('[data-a]').forEach(btn => btn.onclick = () => {
      const a = btn.dataset.a;
      if (a === 'info') { sfx('tap'); probTable(type); return; }
      if (a === 'box') { buySlimeBox(btn); return; }
      doSummon(type, a === 'free' ? 11 : +a, a === 'free' ? 'free' : 'gems');
    });
  });
}

function probTable(type) {
  const st = S.summon[type];
  const p = gradeProbs(st.lv);
  modal({ title: `${BANNERS[type].name} NV ${st.lv}`, body: `<table class="ptable">${GRADES.map((g, i) => `<tr><td><i class="gdot" style="background:${GC[i][1]}"></i>${g}</td><td>${p[i] >= 1 ? p[i].toFixed(2).replace('.', ',') : p[i].toPrecision(2).replace('.', ',')}%</td></tr>`).join('')}</table>
    <p style="margin-top:1rem;font-size:1.25rem">Invoque mais para subir o nível e melhorar as chances.</p>` });
}

function buySlimeBox(btn) {
  if (S.gems < 300) { sfx('nogold'); toast('Gemas insuficientes.', 'gem'); return; }
  const pool = SLIMES.filter(s => !s.from.startsWith('stage:') || S.slimes.own[s.id] || +s.from.split(':')[1] <= S.maxStage);
  const s = pool[Math.floor(Math.random() * pool.length)];
  S.gems -= 300;
  const fresh = giveSlimeFragments(s.id, 6);
  save();
  sfx(fresh ? 'rare' : 'reveal');
  modal({ title: fresh ? 'Nova gosma!' : 'Fragmentos', body: `<div class="det"><div class="big" style="${gstyle(fresh ? 7 : 2)}">${slimeParts({ color: s.color, hat: s.hat }).full('happy')}</div><div class="nm f-num ol">${s.name}</div><div class="desc">${fresh ? 'Uma nova gosma se juntou ao reino! Equipe-a em Gosma › Minhas gosmas.' : '+6 fragmentos para melhorar esta gosma.'}</div></div>` });
  rerender();
}

export function doSummon(type, n, mode) {
  const r = summon(type, n, mode);
  if (r.err) {
    sfx('nogold');
    toast(r.err === 'gems' ? 'Gemas insuficientes.' : r.err === 'nofree' ? 'Invocações grátis esgotadas hoje.' : 'Bloqueado.', r.err === 'gems' ? 'gem' : 'lock');
    return;
  }
  showSummon(type, n, r.res);
}

// ------------------------------------------------------------------ animation
function showSummon(type, n, res) {
  const prevTrack = musicTrack();
  playMusic(CALM_TRACK);
  sfx('summon');
  const best = res.reduce((a, b) => (b.g > a.g ? b : a), res[0]);
  const ov = el(`<div class="sumov"><div class="rays"></div><div class="st f-num ol">Invocação de ${BANNERS[type].name}</div>
    <div class="grid ${n === 35 ? 'n35' : 'g4'}">${res.map((r, i) => `<div class="card" style="--gc:#2a2248;--gc2:#4a3a88;--gb:#8a7ac0;animation-delay:${i * (n === 35 ? 0.015 : 0.04)}s"><div class="art">${icon('star')}</div></div>`).join('')}</div>
    <div class="best f-num ol hide"></div><div class="flash"></div>
    <button class="btn sm gray ol-s skip">Pular</button><div class="bottom hide"></div></div>`);
  $('#modals').appendChild(ov);
  const cards = [...ov.querySelectorAll('.grid .card')];
  let i = 0, timer = null, done = false;
  const reveal = k => {
    const r = res[k], c = cards[k];
    c.style.cssText = gstyle(r.g);
    c.classList.add('flip');
    c.querySelector('.art').innerHTML = artOf(type, r.id);
    if (r.isNew) c.insertAdjacentHTML('beforeend', '<i class="new f-num ol-s">NOVO</i>');
    if (r.g >= 3) c.classList.add('hi');
    if (r.g >= 4) { const f = ov.querySelector('.flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); sfx('rare'); }
    else sfx('reveal');
  };
  const finish = () => {
    if (done) return; done = true;
    clearInterval(timer);
    while (i < res.length) reveal(i++);
    ov.querySelector('.skip').remove();
    const bl = ov.querySelector('.best');
    bl.classList.remove('hide');
    bl.innerHTML = `Melhor: <span style="color:${GC[best.g][2]}">${GRADES[best.g]}</span> — ${best.item.name}`;
    const bt = ov.querySelector('.bottom');
    bt.classList.remove('hide');
    bt.innerHTML = `<button class="btn blue ol-s" data-n="11">${ico('gem')}x11 · ${fmtInt(costOf(11))}</button><button class="btn purple ol-s" data-n="35">${ico('gem')}x35 · ${fmtInt(costOf(35))}</button><button class="btn ol-s" data-n="0">Ok</button>`;
    bt.querySelectorAll('button').forEach(b => b.onclick = () => {
      const k = +b.dataset.n;
      ov.remove();
      if (prevTrack >= 0) playMusic(B.phase === 'boss' || B.phase === 'bossIntro' ? BOSS_TRACK : B.info.region.music);
      if (k) doSummon(type, k, 'gems'); else sfx('close');
    });
  };
  setTimeout(() => {
    timer = setInterval(() => { if (i >= res.length) { finish(); return; } reveal(i++); }, n === 35 ? 45 : 110);
  }, 350);
  ov.querySelector('.skip').onclick = () => { sfx('tap'); finish(); };
}

// ------------------------------------------------------------------ market
function renderMarket(sc) {
  const goldMin = BAL.enemyGold(Math.max(1, S.stage)) * 26 * ST.gold;
  const items = [
    { k: 'daily', icon: 'gift', name: 'Presente diário', desc: '100 gemas e 10 minutos de turbo', price: 0, can: S.daily.shopFree > 0,
      buy: () => { S.daily.shopFree = 0; S.gems += 100; S.turbo.left += 600; return 'Presente coletado!'; } },
    { k: 'gold1', icon: 'gold', name: 'Saco de ouro', desc: `+${fmt(goldMin * 30)} de ouro (30 min de batalha)`, price: 100, buy: () => { S.gold += goldMin * 30; return 'Ouro recebido!'; } },
    { k: 'gold2', icon: 'chest', name: 'Baú de ouro', desc: `+${fmt(goldMin * 150)} de ouro (2,5 h de batalha)`, price: 400, buy: () => { S.gold += goldMin * 150; return 'Ouro recebido!'; } },
    { k: 'turbo', icon: 'turbo', name: 'Turbo x2', desc: '+30 minutos de velocidade dobrada', price: 150, buy: () => { S.turbo.left += 1800; return 'Turbo +30 min'; } },
    { k: 'key', icon: 'key', name: 'Chave de Incursão', desc: '+1 tentativa de Incursão', price: 150, buy: () => { S.keys++; return '+1 chave'; } },
    { k: 'ticket', icon: 'boss', name: 'Bilhete do Rei', desc: '+1 desafio ao Rei Toupeira', price: 150, buy: () => { S.tickets++; return '+1 bilhete'; } },
    { k: 'picks', icon: 'pickaxe', name: 'Picaretas x10', desc: '+10 picaretas para a Mina', price: 150, buy: () => { S.picks += 10; return '+10 picaretas'; } },
    { k: 'dust', icon: 'relic', name: 'Pó de relíquia x50', desc: 'Melhora relíquias', price: 300, buy: () => { S.relicDust += 50; return '+50 pó de relíquia'; } },
  ];
  sc.innerHTML = `<div class="passive" style="margin-top:1rem">${ico('gem')} Suas gemas: <b style="color:#fff">${fmtInt(S.gems)}</b></div>
    ${items.map(it => `<div class="setrow" style="margin-top:.8rem"><span style="width:4.4rem;height:4.4rem;flex:none">${icon(it.icon)}</span><span class="lbl"><span class="f-num ol-s" style="font-size:1.7rem;color:#fff">${it.name}</span><br><span style="font-size:1.25rem;color:var(--txt3)">${it.desc}</span></span>
      <button class="btn sm ${it.price ? 'blue' : ''} ol-s" data-k="${it.k}"${it.can === false ? ' disabled' : ''}>${it.price ? `${ico('gem')}${it.price}` : it.can === false ? 'Amanhã' : 'Grátis'}</button></div>`).join('')}
    <p style="font-size:1.2rem;color:var(--txt3);text-align:center;margin:1.6rem 0 2rem">Tudo aqui é comprado com gemas ganhas jogando. Não há compras com dinheiro real.</p>`;
  sc.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
    const it = items.find(x => x.k === b.dataset.k);
    if (it.can === false) return;
    if (S.gems < it.price) { sfx('nogold'); toast('Gemas insuficientes.', 'gem'); return; }
    S.gems -= it.price;
    const msg = it.buy();
    save(); sfx('buy'); toast(msg, it.icon);
    emit('market'); rerender();
  });
}
