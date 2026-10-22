// Screens for the extra modes: raid, Mole King, mine and rebirth.
import { S, save } from '../../core/state.js';
import { on, emit } from '../../core/bus.js';
import { fmt, fmtInt, fmtTime, fmtClock, fmtPct } from '../../core/util.js';
import { sfx } from '../../core/audio.js';
import { registerScreen, rerender, closeScreen, screenOpen } from '../screens.js';
import { $, ico, el, modal, toast } from '../dom.js';
import { gstyle } from '../cards.js';
import * as BAL from '../../data/balance.js';
import { TALENTS, TALENT, talentCost } from '../../data/talents.js';
import { TREASURE } from '../../data/relics.js';
import { ST } from '../../game/stats.js';
import { B } from '../../game/battle.js';
import { startRaid, startRush, maxRaidLevel, RUSH_TIERS, RUSH_REWARD, rushRef, RAID_TIME } from '../../game/modes.js';
import { COLS, tile, isDug, tileDmg, canDig, dig, regenPicks, nextPickIn, PICK_MAX, mineDepth } from '../../game/mine.js';
import { canRebirth, rebirthGain, doRebirth, buyTalent } from '../../game/rebirth.js';
import { biomeLayers, BIOMES } from '../../art/scenery.js';
import { buildingSVG, moleParts } from '../../art/enemies.js';
import { avatarSVG } from '../../art/avatar.js';
import { treasureIcon, relicIcon } from '../../art/items.js';
import { icon } from '../../art/icons.js';

const head = (ic, title, extra = '') => `<div class="scr-head" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap"><div class="scr-title f-num ol">${ico(ic)}${title}</div>${extra}</div>`;
const chip = (ic, v, id = '') => `<div class="pill" style="min-width:auto;height:3.4rem"${id ? ` id="${id}"` : ''}>${ico(ic)}<span class="v f-num ol-s">${v}</span></div>`;
const busy = () => B.mode !== 'stage';

// ------------------------------------------------------------------ raid
registerScreen('raid', {
  render(body) {
    const maxL = maxRaidLevel();
    const b = BIOMES.village;
    const levels = [];
    for (let L = maxL; L >= Math.max(1, maxL - 9); L--) levels.push(L);
    body.innerHTML = head('raid', 'Incursão', chip('key', `${S.keys}`)) + `<div class="scr-scroll">
      <div class="panelx" style="padding:0;overflow:hidden;margin-top:0">
        <div style="height:12rem;position:relative;background:linear-gradient(${b.sky[0]},${b.sky[2]})">
          <div style="position:absolute;left:0;right:0;bottom:1.4rem;height:9rem;background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(biomeLayers('village').mid)}');background-size:auto 100%;background-repeat:repeat-x"></div>
          <div style="position:absolute;left:0;right:0;bottom:0;height:1.6rem;background:${b.ground[1]}"></div>
          <div style="position:absolute;left:1.2rem;bottom:.6rem;width:6rem;height:5.6rem;animation:bob 1.4s ease-in-out infinite">${avatarSVG(S.hero.look)}</div>
          <div style="position:absolute;right:1.4rem;bottom:.2rem;width:9rem;height:9.8rem">${buildingSVG('prefeitura', 0)}</div>
        </div>
        <div style="padding:1rem 1.2rem;font-size:1.35rem;color:var(--txt2)">Destrua as 5 construções da vila em ${RAID_TIME} s. Cada uma dá <b style="color:#c8a0ff">pó de relíquia</b>, e a Prefeitura guarda um <b style="color:#ffe680">baú com uma relíquia</b>. Chaves: 3 por dia.</div>
      </div>
      ${levels.map(L => {
        const rec = BAL.enemyHp(L * 10) * 8;
        const done = (S.raidBest || 0) >= L;
        return `<div class="setrow" style="margin-top:1rem"><span style="width:4.4rem;height:4.4rem;flex:none">${icon('raid')}</span>
          <span class="lbl"><span class="f-num ol-s" style="font-size:1.8rem;color:#fff">Vila ${L}</span><br><span style="font-size:1.2rem;color:var(--txt3)">Poder sugerido ${fmt(rec)}${done ? ' · 3★ concluída' : ` · 1ª vitória 3★: ${100 + 50 * L} gemas`}</span></span>
          <button class="btn sm ${done ? 'blue' : 'gold'} ol-s" data-l="${L}">${ico('key')}Atacar</button></div>`;
      }).join('')}<div style="height:2rem"></div></div>`;
    body.querySelectorAll('[data-l]').forEach(btn => btn.onclick = () => {
      if (busy()) { toast('Termine a batalha atual primeiro.', 'info'); return; }
      if (S.keys <= 0) { sfx('nogold'); toast('Sem chaves. Novas amanhã ou na Loja.', 'key'); return; }
      sfx('bossIntro');
      closeScreen();
      startRaid(+btn.dataset.l);
    });
  },
});

// ------------------------------------------------------------------ rush
registerScreen('rush', {
  render(body) {
    const ref = rushRef();
    body.innerHTML = head('boss', 'Rei Toupeira', chip('boss', `${S.tickets}`)) + `<div class="scr-scroll">
      <div class="panelx" style="display:flex;align-items:center;gap:1rem;margin-top:0;background:linear-gradient(#8a3a2a,#4a1f22)">
        <div style="width:13rem;height:14rem;flex:none">${moleParts().full}</div>
        <div style="flex:1"><div class="f-num ol" style="font-size:2.2rem">Rei Toupeira</div>
          <p style="font-size:1.3rem;color:#ffd8c8;margin:.4rem 0">Ele não cai! Cause o máximo de dano em 30 s. Quanto maior o dano, melhor a recompensa.</p>
          <div class="kv" style="margin:0"><span>Recorde</span><b class="ol-s">${fmt(S.bossBest || 0)}</b></div></div>
      </div>
      <div class="sec">Recompensas por dano</div>
      ${RUSH_TIERS.map((m, i) => `<div class="kv"><span>${fmt(m * ref)}+</span><b class="ol-s" style="display:flex;gap:.8rem;align-items:center;font-size:1.4rem"><span style="display:flex;align-items:center;gap:.2rem"><span style="width:2rem;height:2rem">${icon('gem')}</span>${RUSH_REWARD.gems[i + 1]}</span><span style="display:flex;align-items:center;gap:.2rem"><span style="width:2rem;height:2rem">${icon('pickaxe')}</span>${RUSH_REWARD.picks[i + 1]}</span></b></div>`).join('')}
      <div class="btnrow"><button class="btn red ol-s" id="rushGo">${ico('boss')}Desafiar (${S.tickets})</button></div><div style="height:2rem"></div></div>`;
    body.querySelector('#rushGo').onclick = () => {
      if (busy()) { toast('Termine a batalha atual primeiro.', 'info'); return; }
      if (S.tickets <= 0) { sfx('nogold'); toast('Sem bilhetes. Novos amanhã ou na Loja.', 'boss'); return; }
      closeScreen();
      startRush();
    };
  },
});

// ------------------------------------------------------------------ mine
const TILE_COL = { dirt: ['#b98a5a', '#9a6a42'], stone: ['#8f8fa6', '#6f6f88'], rock: ['#5f5878', '#48405e'] };
const ITEM_ICON = { gold: 'gold', gem: 'gem', dust: 'relic', slime: 'slime', bomb: 'burst', picks: 'pickaxe', treasure: 'treasure' };
let mineTimer = null;
registerScreen('mine', {
  render(body) {
    regenPicks();
    const depth = mineDepth();
    const top = Math.max(0, depth - 4), bottom = top + 11;
    let rows = '';
    for (let r = top; r < bottom; r++) {
      rows += `<div style="display:grid;grid-template-columns:3.4rem repeat(${COLS},1fr);gap:.4rem;margin-bottom:.4rem;align-items:center"><span class="f-num ol-s" style="font-size:1.1rem;color:var(--txt3);text-align:right;padding-right:.2rem">${r}m</span>`;
      for (let c = 0; c < COLS; c++) {
        if (isDug(r, c)) { rows += `<div style="aspect-ratio:1;border-radius:.8rem;background:radial-gradient(circle at 50% 40%, #2a1a1a, #160c12);box-shadow:inset 0 .3rem .6rem rgba(0,0,0,.6)"></div>`; continue; }
        const t = tile(r, c), can = canDig(r, c), d = tileDmg(r, c);
        const [c1, c2] = TILE_COL[t.kind];
        const cracks = d ? `<svg viewBox="0 0 40 40" style="position:absolute;inset:0;width:100%;height:100%"><path d="M 20 4 L 16 16 L 24 20 L 18 34${d > 1 ? ' M 24 20 L 34 26 M 16 16 L 6 14' : ''}" stroke="#1a1020" stroke-width="2.4" fill="none" stroke-linejoin="round"/></svg>` : '';
        const item = can && t.item ? `<span style="position:absolute;inset:18%;filter:drop-shadow(0 0 .4rem #fff)">${icon(ITEM_ICON[t.item])}</span>` : '';
        rows += `<button class="mt" data-r="${r}" data-c="${c}" style="position:relative;aspect-ratio:1;border-radius:.8rem;border:.25rem solid var(--ol);background:linear-gradient(${c1},${c2});box-shadow:inset 0 .3rem 0 rgba(255,255,255,.18), inset 0 -.3rem 0 rgba(0,0,0,.2)${can ? ', 0 0 0 .2rem #ffe680' : ''};opacity:${can ? 1 : .82}">
          <span style="position:absolute;left:20%;top:24%;width:.6rem;height:.6rem;border-radius:50%;background:rgba(0,0,0,.18)"></span><span style="position:absolute;right:22%;bottom:22%;width:.9rem;height:.7rem;border-radius:50%;background:rgba(0,0,0,.15)"></span>${cracks}${item}</button>`;
      }
      rows += '</div>';
    }
    body.innerHTML = head('mine', 'Mina', chip('pickaxe', `${S.picks}`, 'pickChip')) + `
      <div style="display:flex;justify-content:space-between;padding:0 1.2rem;font-size:1.3rem;color:var(--txt2)"><span>Profundidade: <b class="f-num ol-s" style="color:#fff">${depth} m</b> · Recorde ${S.mine.best || 0} m</span><span id="pickNext">${S.picks >= PICK_MAX ? 'Picaretas cheias' : `+1 em ${fmtClock(nextPickIn())}`}</span></div>
      <div class="scr-scroll" style="padding-top:1rem"><div style="border-radius:1.4rem;padding:1rem .8rem;background:linear-gradient(#3a2a2a,#22161c);border:.25rem solid var(--ol)">${rows}</div>
      <p style="font-size:1.2rem;color:var(--txt3);text-align:center">Toque nos blocos com borda dourada. Terra: 1 golpe · Pedra: 2 · Rocha: 3. Tesouros raros escondem-se nas profundezas.</p><div style="height:2rem"></div></div>`;
    body.querySelectorAll('.mt').forEach(b => b.onclick = () => {
      const r = +b.dataset.r, c = +b.dataset.c;
      const res = dig(r, c);
      if (!res.ok) { sfx('nogold'); toast(res.why === 'picks' ? 'Sem picaretas. Elas recarregam com o tempo.' : 'Cave a partir dos blocos abertos.', 'pickaxe'); return; }
      sfx('dig');
      b.animate([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 120 });
      if (res.broke) {
        for (const l of res.loot) {
          if (l.k === 'treasure') { const t = TREASURE[l.id]; sfx('rare'); modal({ title: 'Tesouro encontrado!', body: `<div class="det"><div class="big" style="${gstyle(4)}">${treasureIcon(t)}</div><div class="nm f-num ol">${t.name}</div><div class="desc">Bônus permanente adicionado. Veja em Pirata › Relíquia.</div></div>` }); }
          else if (l.k === 'bomb') { sfx('boom'); toast('Bomba! Blocos ao redor explodiram.', 'burst'); }
          else { sfx(l.k === 'gem' ? 'gem' : 'coin'); toast(`+${fmt(l.v)} ${{ gold: 'ouro', gem: 'gemas', dust: 'pó de relíquia', picks: 'picaretas' }[l.k]}`, ITEM_ICON[l.k]); }
        }
        setTimeout(() => { if (screenOpen() === 'mine') rerender(); }, 120);
      } else rerender();
    });
    clearInterval(mineTimer);
    mineTimer = setInterval(() => {
      if (screenOpen() !== 'mine') { clearInterval(mineTimer); return; }
      if (regenPicks()) rerender();
      const n = $('#pickNext'); if (n) n.textContent = S.picks >= PICK_MAX ? 'Picaretas cheias' : `+1 em ${fmtClock(nextPickIn())}`;
    }, 1000);
  },
  onClose() { clearInterval(mineTimer); },
});

// ------------------------------------------------------------------ rebirth
registerScreen('rebirth', {
  render(body) {
    const gain = rebirthGain();
    body.innerHTML = head('rebirth', 'Renascer', chip('essence', fmtInt(S.essence))) + `<div class="scr-scroll">
      <div class="panelx" style="margin-top:0;text-align:center;background:linear-gradient(#6a3ab0,#3a1f70)">
        <div style="width:9rem;height:9rem;margin:0 auto">${icon('rebirth')}</div>
        <p style="font-size:1.4rem;color:#ecdcff;margin:.6rem 0">Volte à fase 1 com seus atributos zerados e ganhe <b style="color:#fff">Essência</b>. Habilidades, equipamentos, companheiros, barcos, nível do capitão e relíquias continuam com você.</p>
        <div class="kv"><span>Fase máxima desta jornada</span><b class="ol-s">${S.maxStage}</b></div>
        <div class="kv"><span>Essência ao renascer</span><b class="ol-s" style="color:#e0b0ff">+${fmtInt(gain)}</b></div>
        <button class="btn purple ol-s" id="rbGo" style="margin-top:.8rem"${canRebirth() ? '' : ' disabled'}>${ico('rebirth')}${canRebirth() ? 'Renascer' : `Chegue à fase ${BAL.REBIRTH_STAGE}`}</button>
      </div>
      <div class="sec">Talentos</div>
      ${TALENTS.map(t => {
        const lv = S.rebirth.talents[t.id] || 0, max = lv >= t.max, c = talentCost(t, lv);
        const v = t.flat ? `${t.per * lv}` : fmtPct(t.per * lv, 0);
        return `<div class="setrow"><span style="width:4rem;height:4rem;flex:none">${icon(t.icon)}</span><span class="lbl"><span class="f-num ol-s" style="font-size:1.6rem;color:#fff">${t.name} <span style="color:#ffe680;font-size:1.3rem">${lv}/${t.max}</span></span><br><span style="font-size:1.2rem;color:var(--txt3)">${t.desc.replace('{v}', v)}</span></span>
          <button class="btn sm ${max ? 'gray' : 'purple'} ol-s" data-t="${t.id}"${max ? ' disabled' : ''}>${max ? 'MÁX' : `${ico('essence')}${fmtInt(c)}`}</button></div>`;
      }).join('')}<div style="height:2rem"></div></div>`;
    body.querySelector('#rbGo').onclick = () => {
      if (!canRebirth()) return;
      if (busy()) { toast('Termine a batalha atual primeiro.', 'info'); return; }
      modal({ title: 'Renascer?', body: `<p>Você volta à fase ${1 + (S.rebirth.talents.start || 0) * 5}, os atributos voltam ao nível 1 e o ouro é zerado.</p><p>Ganha <b style="color:#e0b0ff">+${fmtInt(gain)} Essência</b>.</p>`,
        buttons: [{ label: 'Renascer', cls: 'purple', onClick: () => { const g = doRebirth(); sfx('unlock'); closeScreen(); toast(`+${fmtInt(g)} Essência!`, 'essence'); } }, { label: 'Cancelar', cls: 'gray' }] });
    };
    body.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
      const r = buyTalent(b.dataset.t);
      if (r === 'ok') { sfx('levelup'); rerender(); } else { sfx('nogold'); toast(r === 'max' ? 'Nível máximo.' : 'Essência insuficiente.', 'essence'); }
    });
  },
});

// ------------------------------------------------------------------ results
on('modeEnd', res => {
  if (res.mode === 'raid') {
    sfx(res.stars >= 2 ? 'victory' : 'defeat');
    const stars = [1, 2, 3].map(i => `<span style="width:4.4rem;height:4.4rem;display:inline-block;${i <= res.stars ? '' : 'filter:grayscale(1) brightness(.5)'}">${icon('star')}</span>`).join('');
    modal({ title: res.stars ? 'Incursão concluída!' : 'Incursão falhou', body: `<div style="display:flex;justify-content:center;gap:.4rem;margin-bottom:.8rem">${stars}</div>
      <div class="kv"><span>Pó de relíquia</span><b class="ol-s">+${fmtInt(res.dust)}</b></div><div class="kv"><span>Ouro</span><b class="ol-s">+${fmt(res.gold)}</b></div>
      ${res.relic ? `<div class="kv"><span style="display:flex;align-items:center;gap:.6rem"><span style="width:3rem;height:3rem">${relicIcon(res.relic)}</span>${res.relic.name}</span><b class="ol-s">${res.relicNew ? 'NOVA!' : '+10 pó'}</b></div>` : ''}
      ${res.gems ? `<div class="kv"><span>1ª vitória 3★</span><b class="ol-s">+${res.gems} gemas</b></div>` : ''}
      ${res.slime ? `<div class="kv"><span>Fragmentos</span><b class="ol-s">${res.slime.name}</b></div>` : ''}
      ${res.why === 'dead' ? '<p style="color:#ff9aaa">Seu capitão foi derrotado.</p>' : res.why === 'time' ? '<p>O tempo acabou.</p>' : ''}` });
  } else if (res.mode === 'rush') {
    sfx(res.tier ? 'victory' : 'defeat');
    modal({ title: 'Rei Toupeira', body: `<div class="f-num ol" style="font-size:3.2rem;color:#ffe14a">${fmt(res.score)}</div><p style="margin:0 0 .8rem">de dano${res.best ? ' — <b style="color:#9dff7a">novo recorde!</b>' : ''}</p>
      <div class="kv"><span>Faixa de recompensa</span><b class="ol-s">${res.tier}/${RUSH_TIERS.length}</b></div>
      <div class="kv"><span>Gemas</span><b class="ol-s">+${res.gems}</b></div><div class="kv"><span>Picaretas</span><b class="ol-s">+${res.picks}</b></div>
      ${res.slime ? `<div class="kv"><span>Fragmentos</span><b class="ol-s">${res.slime.name}</b></div>` : ''}` });
  }
});
