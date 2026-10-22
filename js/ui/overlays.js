// In-battle overlays: stage title, VS screen, victory and defeat.
import { S } from '../core/state.js';
import { on } from '../core/bus.js';
import { fmt } from '../core/util.js';
import { B } from '../game/battle.js';
import { avatarSVG } from '../art/avatar.js';
import { shipSVG } from '../art/ship.js';
import { humanParts, variant, moleParts } from '../art/enemies.js';
import * as BAL from '../data/balance.js';
import { $, el, ico, newContent, modal } from './dom.js';
import { icon } from '../art/icons.js';
import { sfx, playMusic } from '../core/audio.js';
import { BOSS_TRACK } from '../core/music.js';

const fxBox = () => $('#fx');
function put(node, ms) { fxBox().appendChild(node); setTimeout(() => node.remove(), ms); }

export function buildOverlays() {
  on('stageTitle', info => {
    put(el(`<div class="titlecard"><span class="t1 f-num ol-s">${info.saga.name} · Fase ${info.short}</span><span class="t2 f-num ol">${info.stage.arc}</span><span class="t3 ol-s">${info.stage.terr}</span></div>`), 1800);
  });
  on('bossIntro', d => {
    const heroS = avatarSVG(S.hero.look);
    const boss = d.mole ? moleParts().full : humanParts(variant(d.spec, B.info.cycle - 1)).full;
    put(el(`<div class="vs"><div class="bgv"></div><div class="who l">${heroS}</div><div class="who r">${boss}</div><div class="word f-num ol">VS</div><div class="nm f-num ol">${d.spec.name}</div></div>`), 2100);
    sfx('bossIntro');
    playMusic(BOSS_TRACK);
  });
  on('victory', d => {
    const first = d.g >= S.maxStage;
    put(el(`<div class="victory"><div class="stars">${ico('star')}${ico('star')}${ico('star')}</div><div class="w f-num ol">VITÓRIA!</div>${first ? `<div class="sub f-num ol-s">${ico('gem')}+${BAL.bossGems(d.g)}</div>` : ''}</div>`), 2300);
    sfx('victory');
  });
  on('defeat', () => {
    put(el(`<div class="defeat"><div class="w f-num ol">Derrota...</div><div class="s ol-s">A fase vai se repetir. Fique mais forte e toque em <b>Desafiar chefe</b>.</div></div>`), 2100);
    sfx('defeat');
  });
  on('unlock', u => { newContent(u.name); sfx('unlock'); });
  on('newShip', sh => {
    sfx('rare');
    modal({ title: 'Novo barco!', body: `<div class="det"><div class="big" style="--gc:#2a6ab8;--gc2:#8fd8ff;--gb:#ffe680;width:15rem;height:13rem">${shipSVG(sh)}</div>
      <div class="nm f-num ol">${sh.name}</div>
      <div class="desc"><b>${sh.ab.name}:</b> ${sh.ab.desc}</div>
      <div class="desc" style="font-size:1.25rem">Troque de barco em Pirata › Barco.</div></div>` });
  });
  on('hakiUnlock', () => {
    sfx('unlock');
    modal({ title: 'Haki despertado!', body: `<div class="det"><div class="big" style="--gc:#2a1a5a;--gc2:#5a3ab0;--gb:#7ee0ff;width:12rem;height:12rem"><div style="width:70%;height:70%;margin:15%;border-radius:50%;background:radial-gradient(circle at 40% 35%, #fff, #7ee0ff 45%, #2a1a3e)"></div></div>
      <div class="nm f-num ol">Árvore de Haki</div><div class="desc">A árvore de Haki foi liberada. Gaste SP em Pirata › Maestria › Haki.</div></div>` });
  });
}
