// In-battle overlays: stage title, VS screen, victory and defeat.
import { S } from '../core/state.js';
import { on } from '../core/bus.js';
import { fmt } from '../core/util.js';
import { B } from '../game/battle.js';
import { slimeParts } from '../art/slime.js';
import { humanParts, variant, moleParts } from '../art/enemies.js';
import { SLIME } from '../data/slimes.js';
import * as BAL from '../data/balance.js';
import { $, el, ico, newContent, modal } from './dom.js';
import { RANKS, RANK_COL } from '../data/slimes.js';
import { icon } from '../art/icons.js';
import { sfx, playMusic } from '../core/audio.js';
import { BOSS_TRACK } from '../core/music.js';

const fxBox = () => $('#fx');
function put(node, ms) { fxBox().appendChild(node); setTimeout(() => node.remove(), ms); }

export function buildOverlays() {
  on('stageTitle', info => {
    put(el(`<div class="titlecard"><span class="t1 f-num ol-s">Fase ${info.g}</span><span class="t2 f-num ol">${info.label}</span></div>`), 1800);
  });
  on('bossIntro', d => {
    const sl = SLIME[S.slimes.cur] || SLIME.gelatino;
    const heroS = slimeParts({ color: sl.color, hat: sl.hat }).full('attack');
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
    put(el(`<div class="defeat"><div class="w f-num ol">Derrota...</div><div class="s ol-s">Melhore seus atributos e tente de novo!</div></div>`), 2100);
    sfx('defeat');
  });
  on('unlock', u => { newContent(u.name); sfx('unlock'); });
  on('newSlime', id => {
    const sl = SLIME[id];
    sfx('rare');
    modal({ title: 'Nova gosma obtida!', body: `<div class="det"><div class="big" style="--gc:#3a2a7a;--gc2:#7a4ad8;--gb:${RANK_COL[sl.r]};width:13rem;height:13rem">${slimeParts({ color: sl.color, hat: sl.hat }).full('happy')}</div>
      <div class="nm f-num ol"><span style="color:${RANK_COL[sl.r]}">${RANKS[sl.r]}</span> ${sl.name}</div>
      <div class="desc"><b>${sl.ability.name}:</b> ${sl.ability.desc}</div>
      <div class="desc" style="font-size:1.25rem">Equipe em Gosma › Minhas gosmas.</div></div>` });
  });
}
