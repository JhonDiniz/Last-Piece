// Menu, settings, profile, world map and help.
import { S, save, exportSave, importSave, wipe } from '../../core/state.js';
import { emit } from '../../core/bus.js';
import { fmt, fmtTime } from '../../core/util.js';
import { sfx, applyVolumes, playMusic } from '../../core/audio.js';
import { registerScreen, rerender, closeScreen, openScreen } from '../screens.js';
import { $, ico, el, modal, toast } from '../dom.js';
import { REGIONS, stageInfo } from '../../data/regions.js';
import { SLIMES, SLIME } from '../../data/slimes.js';
import { RELICS, TREASURES } from '../../data/relics.js';
import { biomeLayers, BIOMES } from '../../art/scenery.js';
import { slimeParts } from '../../art/slime.js';
import { icon } from '../../art/icons.js';
import { ST } from '../../game/stats.js';
import { B, startStage } from '../../game/battle.js';
import { resize as resizeScene } from '../../render/scene.js';

registerScreen('menu', {
  modal: true,
  open() {
    const items = [['settings', 'Configurações', () => openSettings()], ['user', 'Perfil', () => openScreen('profile')], ['map', 'Mapa-múndi', () => openScreen('map')],
      ['save', 'Salvar e exportar', () => openSave()], ['info', 'Como jogar', () => openHelp()]];
    const m = modal({ title: 'Menu', body: `<div style="display:flex;flex-direction:column;gap:.8rem">${items.map(([i, l], k) => `<button class="setrow" data-k="${k}" style="margin:0;color:#fff"><span style="width:3.4rem;height:3.4rem;flex:none">${icon(i)}</span><span class="lbl f-num ol-s" style="text-align:left;font-size:1.7rem">${l}</span>${ico('arrowUp', '')}</button>`).join('')}</div>`,
      buttons: [{ label: 'Fechar', cls: 'gray' }] });
    m.el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { sfx('tap'); m.close(); items[+b.dataset.k][2](); });
    m.el.querySelectorAll('.setrow .ico').forEach(i => { i.style.transform = 'rotate(90deg)'; i.style.fontSize = '2rem'; });
  },
});

function openSettings() {
  const st = S.settings;
  const m = modal({ title: 'Configurações', body: `
    <div class="setrow">${ico('music')}<span class="lbl">Música</span><input type="range" min="0" max="1" step="0.05" value="${st.music}" id="sMus"></div>
    <div class="setrow">${ico('sound')}<span class="lbl">Efeitos sonoros</span><input type="range" min="0" max="1" step="0.05" value="${st.sfx}" id="sSfx"></div>
    <div class="setrow"><span class="lbl">Tremor da tela</span><button class="toggle${st.shake ? ' on' : ''}" id="sShake" aria-label="Tremor da tela"></button></div>
    <div class="setrow"><span class="lbl">Economia de bateria</span><button class="toggle${st.saver ? ' on' : ''}" id="sSaver" aria-label="Economia de bateria"></button></div>
    <p style="font-size:1.2rem;color:var(--txt3);margin:.4rem 0 0">Reino Gelatina v1.0 · arte, música e código originais.</p>`,
    buttons: [{ label: 'Reiniciar jogo', cls: 'red sm', keep: true, onClick: () => confirmWipe() }, { label: 'Fechar', cls: 'gray' }] });
  const e = m.el;
  e.querySelector('#sMus').oninput = ev => { st.music = +ev.target.value; applyVolumes(); };
  e.querySelector('#sSfx').oninput = ev => { st.sfx = +ev.target.value; applyVolumes(); };
  e.querySelector('#sSfx').onchange = () => sfx('coin');
  e.querySelector('#sShake').onclick = ev => { st.shake = !st.shake; ev.target.classList.toggle('on', st.shake); sfx('tap'); };
  e.querySelector('#sSaver').onclick = ev => { st.saver = !st.saver; ev.target.classList.toggle('on', st.saver); sfx('tap'); resizeScene(); };
}

function confirmWipe() {
  modal({ title: 'Reiniciar?', body: '<p>Todo o progresso será apagado para sempre. Exporte seu save antes se quiser guardar.</p>',
    buttons: [{ label: 'Apagar tudo', cls: 'red', onClick: () => { wipe(); location.reload(); } }, { label: 'Cancelar', cls: 'gray' }] });
}

function openSave() {
  save();
  const code = exportSave();
  const m = modal({ title: 'Salvar', body: `<p>O jogo salva sozinho neste aparelho. Para levar o progresso a outro aparelho, copie o código ou baixe o arquivo.</p>
    <textarea class="code" id="svCode" readonly>${code}</textarea>
    <p style="margin:.8rem 0 .4rem">Importar de outro aparelho:</p><textarea class="code" id="svIn" placeholder="Cole aqui um código RG1..." style="height:6rem;color:#fff"></textarea>`,
    buttons: [
      { label: 'Copiar', cls: 'blue sm', keep: true, onClick: () => { navigator.clipboard && navigator.clipboard.writeText(code).then(() => toast('Código copiado', 'check'), () => toast('Selecione e copie o código', 'info')); } },
      { label: 'Baixar', cls: 'purple sm', keep: true, onClick: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' })); a.download = 'reino-gelatina-save.txt'; a.click(); } },
      { label: 'Importar', cls: 'gold sm', keep: true, onClick: () => { const v = m.el.querySelector('#svIn').value; if (!v.trim()) { toast('Cole um código primeiro', 'info'); return; } try { importSave(v); toast('Save importado!', 'check'); setTimeout(() => location.reload(), 600); } catch (e) { sfx('nogold'); toast(e.message, 'info'); } } },
      { label: 'Fechar', cls: 'gray sm' }] });
  m.el.querySelector('#svCode').onclick = ev => ev.target.select();
}

function openHelp() {
  modal({ title: 'Como jogar', body: `<div style="text-align:left;font-size:1.35rem;line-height:1.5">
    <p>${ico('sword')} A gosma luta sozinha. Use o ouro para <b style="color:#fff">Melhorar</b> ATQ, PV e outros atributos (segure o botão para comprar vários).</p>
    <p>${ico('skull')} Derrote as ondas e o chefe de cada fase em 30 segundos. Se ele escapar, fique mais forte e toque em <b style="color:#fff">Desafiar chefe</b>.</p>
    <p>${ico('gem')} Missões dão gemas. Use-as na Loja para invocar habilidades, equipamentos e companheiros.</p>
    <p>${ico('arrowUp')} Cópias repetidas fundem e aumentam o nível. Todo item possuído dá um bônus passivo, mesmo sem estar equipado.</p>
    <p>${ico('rebirth')} Na fase 50, renascer troca o progresso das fases por Essência, que compra talentos permanentes.</p></div>` });
}

// ------------------------------------------------------------------ profile
registerScreen('profile', {
  modal: true,
  open() {
    const sl = SLIME[S.slimes.cur];
    const lvSum = Object.values(S.slimes.own).reduce((a, o) => a + o.lv, 0);
    const info = stageInfo(S.stage);
    const rows = [['Fase', `${info.label} (${S.stage})`], ['Fase máxima', S.maxStage], ['Suas gosmas', `${Object.keys(S.slimes.own).length}/${SLIMES.length}`], ['Nível acumulado das gosmas', lvSum],
      ['Relíquias descobertas', `${Object.keys(S.relics).length}/${RELICS.length}`], ['Tesouros descobertos', `${Object.keys(S.treasures).length}/${TREASURES.length}`],
      ['Profundidade da mina', `${S.mine.best || 0} m`], ['Recorde contra o Rei Toupeira', fmt(S.bossBest || 0)], ['Renascimentos', S.rebirth.n],
      ['Inimigos derrotados', fmt(S.stats.kills)], ['Chefes derrotados', fmt(S.stats.bosses)], ['Invocações', fmt(S.stats.summons)], ['Tempo de jogo', fmtTime(S.stats.play)]];
    const m = modal({ title: 'Minhas informações', body: `
      <div style="display:flex;align-items:center;gap:1.2rem;margin-bottom:1rem"><div style="width:7.6rem;height:7.6rem;border-radius:1.6rem;border:.3rem solid var(--ol);background:linear-gradient(#7fe0ff,#3a9ae8);padding:.4rem;flex:none">${slimeParts({ color: sl.color, hat: sl.hat }).full('happy')}</div>
        <div style="flex:1;text-align:left"><input id="pfName" value="${S.name.replace(/"/g, '&quot;')}" maxlength="18" style="width:100%;height:3.6rem;border-radius:1rem;border:.25rem solid var(--ol);background:#1a1236;color:#fff;font:inherit;font-size:1.6rem;padding:0 1rem">
        <div class="f-num ol-s" style="display:flex;align-items:center;gap:.4rem;margin-top:.6rem;font-size:2rem"><span style="width:3rem;height:3rem">${icon('power')}</span>${fmt(ST.power)}</div></div></div>
      ${rows.map(([k, v]) => `<div class="kv"><span>${k}</span><b class="ol-s">${v}</b></div>`).join('')}`,
      buttons: [{ label: 'Ok' }], onClose: () => { const v = (m.el.querySelector('#pfName').value || '').trim(); if (v) { S.name = v.slice(0, 18); save(); } } });
  },
});

// ------------------------------------------------------------------ world map
registerScreen('map', {
  render(body) {
    const cur = stageInfo(S.stage), maxR = Math.floor((S.maxStage - 1) / 10);
    const cycles = Math.floor((S.maxStage - 1) / 80);
    body.innerHTML = `<div class="scr-head"><div class="scr-title f-num ol">${ico('map')}Mapa-múndi</div></div>
      <div class="scr-scroll"><p class="ol-s" style="text-align:center;font-size:1.4rem;margin:.2rem 0 1rem">Localização atual: <span style="color:#ffe680">${cur.label}</span></p>
      ${REGIONS.map((r, i) => {
        const gStart = cycles * 80 + i * 10 + 1;
        const reachedAny = S.maxStage >= i * 10 + 1;
        const open = S.maxStage >= gStart || reachedAny;
        const first = Math.min(S.maxStage, open ? (S.maxStage >= gStart ? gStart : i * 10 + 1) : gStart);
        const here = cur.ri === i;
        const b = BIOMES[r.bg];
        const done = Math.max(0, Math.min(10, S.maxStage - 1 - (Math.floor((S.maxStage - 1) / 80) * 80) - i * 10));
        return `<div class="panelx" style="padding:0;overflow:hidden;${open ? '' : 'filter:grayscale(.85) brightness(.6)'}">
          <div style="height:9rem;position:relative;background:linear-gradient(${b.sky[0]},${b.sky[2]})">
            <div style="position:absolute;left:0;right:0;bottom:0;height:7rem;background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(biomeLayers(r.bg).mid)}');background-size:auto 100%;background-repeat:repeat-x"></div>
            <div style="position:absolute;left:0;right:0;bottom:0;height:1.6rem;background:${b.ground[0]}"></div>
            ${here ? `<div style="position:absolute;left:1rem;bottom:.6rem;width:5rem;height:4.6rem;animation:bob 1.6s ease-in-out infinite">${slimeParts({ color: SLIME[S.slimes.cur].color, hat: SLIME[S.slimes.cur].hat }).full('happy')}</div>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:1rem;padding:1rem 1.2rem">
            <div style="flex:1"><div class="f-num ol" style="font-size:1.9rem">${r.name}</div><div style="font-size:1.25rem;color:var(--txt3)">${open ? `${done}/10 fases concluídas` : `Chegue à fase ${i * 10 + 1}`}</div></div>
            ${open ? `<button class="btn sm ${here ? 'gray' : 'blue'} ol-s" data-g="${here ? 0 : first}">${here ? 'Aqui' : 'Ir'}</button>` : `<span style="width:3.4rem;height:3.4rem">${icon('lock')}</span>`}
          </div></div>`;
      }).join('')}<div style="height:2rem"></div></div>`;
    body.querySelectorAll('[data-g]').forEach(btn => btn.onclick = () => {
      const g = +btn.dataset.g;
      if (!g) { sfx('tap'); return; }
      sfx('tap');
      S.farm = g < S.maxStage;
      startStage(g, 'intro');
      closeScreen();
    });
  },
});
