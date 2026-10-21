// Mission bar, skill bar, AUTO toggle and the power badge.
import { S } from '../core/state.js';
import { on, emit } from '../core/bus.js';
import { fmt, fmtInt } from '../core/util.js';
import { ST } from '../game/stats.js';
import { B } from '../game/battle.js';
import { currentMission, claimMission, isOpen } from '../game/progress.js';
import { UNLOCK } from '../data/missions.js';
import { SKILL } from '../data/skills.js';
import { skillIcon } from '../art/items.js';
import { castSkill } from '../game/skills.js';
import { $, ico, el, toast, flyIcons } from './dom.js';
import { sfx } from '../core/audio.js';
import { openScreen } from './screens.js';

let mEl, slots = [], autoB, powerEl, lastPower = 0;

export function buildDock() {
  const d = $('#dock');
  d.innerHTML = `<div class="mission" id="mission"><span class="tag f-num ol-s" id="mTag">Missão 1</span><span class="txt ol-s" id="mTxt"></span><span class="rw f-num ol-s">${ico('gem')}<span id="mRw">100</span></span></div>
    <div class="skills" id="skills"></div>`;
  mEl = $('#mission');
  mEl.onclick = () => {
    const m = currentMission();
    if (!m.done) { sfx('tap'); return; }
    const before = mEl;
    const res = claimMission();
    if (res) {
      sfx('mission');
      flyIcons(before, $('#gemPill'), 'gem', 6, () => sfx('gem'));
      toast(`+${fmtInt(res.r)} gemas`, 'gem');
    }
  };
  const sk = $('#skills');
  sk.innerHTML = `<button class="sk mini" id="skBook" aria-label="Habilidades">${ico('book')}</button><button class="auto f-num ol-s" id="autoB"><span>AUTO</span><span id="autoS">OFF</span></button>` +
    Array.from({ length: 6 }, (_, i) => `<button class="sk" data-i="${i}"><div class="pic"></div><div class="cd"></div><span class="cdt f-num ol-s"></span></button>`).join('');
  slots = [...sk.querySelectorAll('.sk[data-i]')].map(b => ({ b, pic: b.querySelector('.pic'), cd: b.querySelector('.cd'), cdt: b.querySelector('.cdt'), id: undefined, ready: true }));
  autoB = $('#autoB');
  autoB.onclick = () => {
    sfx('tap');
    if (!isOpen('skills')) { toast(`Desbloqueia na Missão ${UNLOCK.skills}`, 'lock'); return; }
    S.skills.auto = !S.skills.auto;
    refreshSkills(); emit('auto');
  };
  $('#skBook').onclick = () => { sfx('tap'); if (!isOpen('skills')) { toast(`Desbloqueia na Missão ${UNLOCK.skills}`, 'lock'); return; } openScreen('slime', 'Habilidade'); };
  slots.forEach((s, i) => s.b.onclick = () => {
    if (!isOpen('skills')) { sfx('tap'); toast(`Desbloqueia na Missão ${UNLOCK.skills}`, 'lock'); return; }
    const id = S.skills.eq[i];
    if (!id) { sfx('tap'); openScreen('slime', 'Habilidade'); return; }
    if (!castSkill(i)) sfx('tap');
  });
  powerEl = $('#power');
  powerEl.innerHTML = `${ico('power')}<span class="f-num ol" id="powerV">0</span>`;
  refreshMission(); refreshSkills();
  on('mission', refreshMission);
  on('missionClaim', refreshMission);
  on('upgrade', refreshMission);
  on('stage', refreshMission);
  on('skills', refreshSkills);
  on('unlock', refreshSkills);
}

export function refreshMission() {
  const m = currentMission();
  mEl.classList.toggle('done', m.done);
  $('#mTag').textContent = m.done ? 'Resgatar' : `Missão ${S.mission}`;
  const showN = m.t !== 'stage' && m.t !== 'equip' && m.t !== 'auto';
  $('#mTxt').innerHTML = m.text + (showN ? ` <b>(${fmt(Math.min(m.p, m.n))}/${fmt(m.n)})</b>` : '');
  $('#mRw').textContent = fmtInt(m.r);
}

export function refreshSkills() {
  const open = isOpen('skills');
  autoB.classList.toggle('lock', !open);
  autoB.classList.toggle('on', open && S.skills.auto);
  $('#autoS').textContent = S.skills.auto ? 'ON' : 'OFF';
  slots.forEach((s, i) => {
    const id = S.skills.eq[i];
    s.b.classList.toggle('lock', !open);
    if (s.id !== id || s.open !== open) {
      s.id = id; s.open = open;
      s.pic.innerHTML = !open ? ico('lock') : id && SKILL[id] ? skillIcon(SKILL[id]) : `<span style="display:flex;align-items:center;justify-content:center;height:100%;font-size:2rem;opacity:.55">${ico('plus')}</span>`;
    }
  });
}

export function updateDock(dt) {
  for (let i = 0; i < 6; i++) {
    const s = slots[i], id = S.skills.eq[i];
    if (!id) { if (s.cdShown) { s.cd.style.background = ''; s.cdt.textContent = ''; s.cdShown = false; } continue; }
    const cd = B.skillCd[i], max = B.skillMax[i] || 1;
    if (cd > 0) {
      const a = (cd / max) * 360;
      s.cd.style.background = `conic-gradient(rgba(14,8,30,.72) ${a}deg, transparent ${a}deg)`;
      const t = Math.ceil(cd) + '';
      if (s.cdt.textContent !== t) s.cdt.textContent = t;
      s.cdShown = true; s.ready = false;
    } else if (!s.ready) {
      s.ready = true; s.cd.style.background = ''; s.cdt.textContent = '';
      s.b.classList.remove('ready'); void s.b.offsetWidth; s.b.classList.add('ready');
    }
  }
  const p = ST.power;
  if (Math.abs(p - lastPower) > 0.5) {
    $('#powerV').textContent = fmt(p);
    if (p > lastPower && lastPower > 0) { powerEl.classList.remove('up'); void powerEl.offsetWidth; powerEl.classList.add('up'); }
    lastPower = p;
  }
}
