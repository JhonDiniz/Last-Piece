// Battle simulation: hero, enemies, waves, bosses, drops. No drawing here.
import { S, save } from '../core/state.js';
import { emit } from '../core/bus.js';
import { rand, clamp, pick } from '../core/util.js';
import { ST } from './stats.js';
import * as BAL from '../data/balance.js';
import { stageInfo } from '../data/regions.js';
import { ARCHETYPES, BOSSES } from '../art/enemies.js';
import { gainXp } from './hero.js';
import { enemyXp, bossXp } from '../data/hero.js';

export const W = 390;
// feet: bottom of the visible field. The island ground runs from gFar (far
// edge) to gNear; the captain stands on the ship deck at deckY.
export const world = { H: 456, feet: 330, gFar: 242, gNear: 326, gmid: 284, deckY: 300, horizon: 180, heroX: 132, shore: 200, gold: { x: 120, y: 30 }, gems: { x: 220, y: 30 }, shake: 0, flash: 0 };

const hero = { x: 132, hp: 110, max: 110, shield: 0, atkT: 0.5, anim: 0, animLen: 0.28, hitDone: true, hurtT: 0, blinkT: 2, face: 'idle', walk: 0, buffs: [], revived: false, abilityT: 0, victory: 0, dead: 0, squash: 0, lv: 0 };
export const B = {
  hero, enemies: [], projs: [], drops: [], texts: [], fx: [], clones: [],
  phase: 'intro', pt: 0, g: 1, info: stageInfo(1), kills: 0, total: BAL.stageKills(), queue: [], spawnT: 0,
  scroll: 0, walking: false, bossT: 0, boss: null, speed: 1, time: 0, skillCd: [0, 0, 0, 0, 0, 0], skillMax: [1, 1, 1, 1, 1, 1],
  mode: 'stage', bg: null, onKill: null, modeUpdate: null, onHeroDeath: null,
};
let uid = 0;
// ---------------------------------------------------------------- depth
// z in [0,1]: 0 = far edge of the island, 1 = near the viewer
export const zToY = z => world.gFar + 8 + z * (world.gNear - world.gFar - 8);
export const zScale = z => 0.72 + 0.28 * z;
// x of the coastline at a ground height (the shore bends toward the ship near the viewer)
export const shoreAt = y => 244 - (y - world.gFar) / (world.feet - world.gFar) * 54;
export const gy = e => (e.gy !== undefined ? e.gy : world.feet);
// formation: at most 5 enemies on the island, spread in depth
const SLOTS = [{ z: 0.5, dx: 16 }, { z: 0.05, dx: 30 }, { z: 0.95, dx: 22 }, { z: 0.28, dx: 86 }, { z: 0.74, dx: 96 }];
export const MAX_ON_ISLAND = SLOTS.length;
function freeSlot(ranged) {
  const used = new Set(B.enemies.filter(e => e.state !== 'die' && e.state !== 'flee' && e.slot !== undefined).map(e => e.slot));
  const order = ranged ? [3, 4, 1, 0, 2] : [0, 1, 2, 3, 4];
  return order.find(i => !used.has(i));
}
export function placeAt(e, z, dx) {
  e.z = z; e.gy = zToY(z);
  e.stopX = shoreAt(e.gy) + dx;
}
// the ship rocks gently; the captain and the crew ride it
export const shipBob = () => Math.sin(B.time * 1.6) * 2.2;

// ------------------------------------------------------------------ helpers
export function heroAtk() {
  let m = 1;
  for (const b of hero.buffs) if (b.atk) m += b.atk;
  return ST.atk * m;
}
export function heroAspd() {
  let add = 0, mul = 1;
  for (const b of hero.buffs) { if (b.aspd) add += b.aspd; if (b.aspdPct) mul += b.aspdPct; }
  return Math.min(8, (ST.aspd + add) * mul);
}
function heroCrit() { let c = ST.crit, d = ST.cdmg; for (const b of hero.buffs) { if (b.crit) c += b.crit; if (b.cdmg) d += b.cdmg; } return [Math.min(1, c), d]; }

export function text(x, y, v, col = '#fff', size = 20, opts = {}) {
  B.texts.push({ x: x + rand(-6, 6), y, v, col, size, t: 0, life: opts.life || 0.85, vy: opts.vy || -46, pop: 1 });
  if (B.texts.length > 40) B.texts.shift();
}
export function fx(kind, x, y, o = {}) { B.fx.push(Object.assign({ kind, x, y, t: 0, life: 0.4 }, o)); if (B.fx.length > 80) B.fx.shift(); }
export const alive = () => B.enemies.filter(e => e.state !== 'die');
export function front() {
  let best = null;
  for (const e of B.enemies) if (e.state !== 'die' && e.x < W + 10 && (!best || e.x < best.x)) best = e;
  return best;
}
const fmtHit = v => v;

// ------------------------------------------------------------------ stage flow
export function startStage(g, mode = 'intro') {
  B.mode = 'stage'; B.bg = null; B.onKill = null; B.modeUpdate = null; B.onHeroDeath = null;
  B.g = g; S.stage = g;
  B.info = stageInfo(g);
  B.kills = 0; B.total = BAL.stageKills();
  B.enemies.length = 0; B.projs.length = 0;
  B.boss = null; B.bossT = 0;
  const r = B.info.region;
  B.queue = [];
  for (let i = 0; i < B.total; i++) B.queue.push(r.enemies[(i + (i >> 2)) % r.enemies.length]);
  B.spawnT = 0.6;
  hero.revived = false;
  hero.hp = Math.max(hero.hp, 1);
  setPhase(mode);
  emit('stage', B.info);
  if (mode === 'intro') emit('stageTitle', B.info);
}
function setPhase(p) { B.phase = p; B.pt = 0; emit('phase', p); }

export function challengeBoss() {
  if (B.phase !== 'fight' || !S.farm) return;
  S.farm = false;
  B.kills = B.total;
  B.queue.length = 0;
  for (const e of B.enemies) if (e.state !== 'die') { e.state = 'flee'; }
  setPhase('bossIntro');
  emit('bossIntro', { g: B.g, key: B.info.region.boss, spec: bossSpec() });
}

// the stage boss is drawn with an existing look but carries its own name
export function bossSpec(info = B.info) {
  const r = info.region;
  return Object.assign({}, BOSSES[r.boss] || ARCHETYPES[r.boss], { name: r.bossName });
}

function spawn(kind, boss = false) {
  const spec = boss ? bossSpec() : ARCHETYPES[kind];
  const g = B.g;
  const tier = B.info.cycle - 1 + (boss ? 0 : 0);
  const hp = boss ? BAL.bossHp(g) : BAL.enemyHp(g) * (spec.fast ? 0.8 : spec.hat === 'knight' ? 1.4 : 1);
  const slot = boss ? -1 : freeSlot(!!spec.range);
  const sl = boss ? { z: 0.5, dx: 30 } : SLOTS[slot];
  const e = {
    id: ++uid, kind, boss, spec, tier, x: W + 30 + (boss ? 40 : rand(0, 20)), y: 0, hp, max: hp, slot: boss ? undefined : slot,
    dmg: boss ? BAL.bossDmg(g) : BAL.enemyDmg(g), spd: (boss ? 34 : spec.fast ? 62 : 46) * rand(0.92, 1.08),
    state: 'walk', t: rand(0, 1), atkT: rand(0.6, 1.2), anim: 0, ranged: !!spec.range, flash: 0, knock: 0,
    vx: 0, vy: 0, rot: 0, alpha: 1, slowT: 0, scale: (boss ? 1.5 : 1) * zScale(sl.z),
    gold: (boss ? BAL.bossGold(g) : BAL.enemyGold(g)),
  };
  placeAt(e, sl.z, sl.dx);
  B.enemies.push(e);
  return e;
}

// ------------------------------------------------------------------ damage
export function hitEnemy(e, dmg, o = {}) {
  if (!e || e.state === 'die' || e.state === 'flee') return 0;
  if (e.boss) dmg *= ST.boss * (o.bossX || 1);
  if (e.endless) { B.rushDmg = (B.rushDmg || 0) + dmg; e.flash = 0.12; text(e.x - 4, gy(e) - 70 * e.scale - 6, BAL_fmt(dmg), o.crit ? '#ffcf3a' : o.col || '#ffffff', o.crit ? 25 : o.size || 19, { vy: o.crit ? -60 : -46 }); if (o.crit) world.shake = Math.max(world.shake, S.settings.shake ? 0.12 : 0); return dmg; }
  e.hp -= dmg;
  e.flash = 0.12;
  if (!e.boss) e.knock = Math.max(e.knock, o.knock || 7);
  const col = o.col || (o.crit ? '#ffcf3a' : '#ffffff');
  text(e.x - 4, gy(e) - 70 * e.scale - 6, BAL_fmt(dmg), col, o.crit ? 25 : o.size || 19, { vy: o.crit ? -60 : -46 });
  if (o.crit) world.shake = Math.max(world.shake, S.settings.shake ? 0.12 : 0);
  if (e.hp <= 0) kill(e);
  return dmg;
}
let BAL_fmt = v => String(Math.round(v));
export function setDamageFormatter(f) { BAL_fmt = f; }

function kill(e) {
  e.state = 'die'; e.t = 0; e.flash = 0;
  e.vx = rand(120, 190); e.vy = -rand(240, 320); e.rot = 0;
  fx('poof', e.x, gy(e) - 30 * e.scale, { life: 0.5, s: e.scale });
  if (B.mode !== 'stage') { if (e.building) { e.vx = 0; e.vy = 0; } S.stats.kills++; if (B.onKill) B.onKill(e); emit('kill', e); return; }
  const gold = e.gold * ST.gold;
  S.gold += gold;
  gainXp(e.boss ? bossXp(B.g) : enemyXp(B.g));
  S.stats.kills++;
  const n = e.boss ? 14 : 4;
  for (let i = 0; i < n; i++) drop('coin', e.x, gy(e) - 40 * e.scale, gold / n, gy(e));
  emit('gold', gold);
  emit('kill', e);
  if (e.boss) {
    B.boss = null;
    S.stats.bosses++;
    if (B.g >= S.maxStage) {
      const gems = Math.round(BAL.bossGems(B.g) * ST.gems);
      S.gems += gems;
      for (let i = 0; i < 6; i++) drop('gem', e.x, gy(e) - 60, gems / 6, gy(e));
      emit('gems', gems);
    }
    setPhase('victory');
    emit('victory', { g: B.g });
  } else {
    B.kills++;
    emit('progress');
  }
}

function drop(kind, x, y, value, ground) {
  B.drops.push({ kind, x, y, ground: ground || world.feet, vx: rand(-70, 110), vy: -rand(150, 260), t: 0, state: 'pop', bounce: 0, value, delay: rand(0.35, 0.65) });
  if (B.drops.length > 70) B.drops.splice(0, B.drops.length - 70);
}

export function damageHero(d) {
  if (hero.dead) return;
  if (ST.dodge > 0 && Math.random() < ST.dodge) { text(hero.x, world.deckY - 84, 'Esquivou!', '#7ee0ff', 16, { vy: -40 }); fx('dodge', hero.x, world.deckY - 40, { life: 0.35 }); return; }
  d *= 1 - ST.def;
  if (hero.shield > 0) { const a = Math.min(hero.shield, d); hero.shield -= a; d -= a; fx('shieldHit', hero.x, world.deckY - 40); }
  if (d <= 0) return;
  hero.hp -= d;
  hero.hurtT = 0.25;
  text(hero.x, world.deckY - 80, '-' + BAL_fmt(d), '#ff6b8a', 17, { vy: -38 });
  if (hero.hp <= 0) {
    hero.hp = 0; hero.dead = 1;
    S.stats.deaths++;
    if (B.mode !== 'stage') { if (B.onHeroDeath) B.onHeroDeath(); return; }
    setPhase('defeat');
    emit('defeat', { boss: !!B.boss });
  }
}

// ------------------------------------------------------------------ update
export function update(dt) {
  B.time += dt;
  B.pt += dt;
  hero.max = ST.hp;
  const regenMul = B.phase === 'victory' || B.phase === 'intro' ? 6 : 1;
  if (!hero.dead) hero.hp = Math.min(hero.max, hero.hp + ST.rec * dt * regenMul);
  updateBuffs(dt);

  if (B.mode !== 'stage') { if (B.modeUpdate) B.modeUpdate(dt); }
  else switch (B.phase) {
    case 'intro':
      B.walking = true;
      if (B.pt > 1.4) setPhase('fight');
      break;
    case 'fight': {
      const live = alive().filter(e => e.state !== 'flee');
      if (B.queue.length && B.spawnT <= 0 && live.length < MAX_ON_ISLAND) {
        spawn(B.queue.shift());
        B.spawnT = rand(0.7, 1.2);
      }
      B.spawnT -= dt;
      if (!B.queue.length && !live.length) {
        if (S.farm) { B.kills = 0; refillQueue(); emit('progress'); }
        else { setPhase('bossIntro'); emit('bossIntro', { g: B.g, key: B.info.region.boss, spec: bossSpec() }); }
      }
      const near = live.some(e => e.x < hero.x + 230);
      B.walking = !near;
      break;
    }
    case 'bossIntro':
      B.walking = false;
      if (B.pt > 2.0) {
        B.boss = spawn(B.info.region.boss, true);
        B.bossT = BAL.B.bossTime;
        setPhase('boss');
      }
      break;
    case 'boss':
      B.walking = !!B.boss && B.boss.x > hero.x + 250;
      if (B.boss && B.boss.x < W - 40) B.bossT -= dt;
      if (B.bossT <= 0 && B.boss) {
        B.boss.state = 'flee';
        B.boss = null;
        S.farm = true;
        setPhase('fight');
        refillQueue();
        B.kills = 0;
        emit('bossFail');
      }
      break;
    case 'victory':
      B.walking = false;
      hero.victory = Math.min(1, hero.victory + dt);
      if (B.pt > 2.3) {
        hero.victory = 0;
        S.farm = false;
        const next = B.g + 1;
        S.maxStage = Math.max(S.maxStage, next);
        S.peak = Math.max(S.peak || 1, S.maxStage);
        save();
        startStage(next);
      }
      break;
    case 'defeat':
      B.walking = false;
      if (B.pt > 2.0) {
        hero.dead = 0; hero.hp = hero.max;
        hero.shield = 0; hero.buffs.length = 0;
        // only the captain has HP: after a defeat the same stage repeats without
        // the boss until the player taps "Desafiar chefe"
        S.farm = true;
        startStage(B.g, 'intro');
        emit('farmLoop');
      }
      break;
  }

  if (B.walking) { B.scroll += 70 * dt; hero.walk += dt; }

  updateHero(dt);
  for (const e of B.enemies) updateEnemy(e, dt);
  for (let i = B.enemies.length - 1; i >= 0; i--) { const e = B.enemies[i]; if ((e.state === 'die' && e.t > 1.1) || (e.state === 'flee' && e.x > W + 80)) B.enemies.splice(i, 1); }
  updateProjs(dt);
  updateDrops(dt);
  for (const t of B.texts) { t.t += dt; t.y += t.vy * dt; t.vy *= 0.94; }
  B.texts = B.texts.filter(t => t.t < t.life);
  for (const f of B.fx) { f.t += dt; if (f.update) f.update(f, dt); }
  B.fx = B.fx.filter(f => f.t < f.life);
  for (let i = 0; i < 6; i++) if (B.skillCd[i] > 0) B.skillCd[i] = Math.max(0, B.skillCd[i] - dt);
  if (world.shake > 0) world.shake = Math.max(0, world.shake - dt);
  if (world.flash > 0) world.flash = Math.max(0, world.flash - dt);
  for (const fn of updaters) fn(dt);
}
const updaters = [];
export function setExternalUpdate(fn) { updaters.push(fn); }

function refillQueue() {
  const r = B.info.region;
  B.queue = [];
  for (let i = 0; i < B.total; i++) B.queue.push(r.enemies[(i + (i >> 2)) % r.enemies.length]);
}

function updateBuffs(dt) {
  for (const b of hero.buffs) b.t -= dt;
  hero.buffs = hero.buffs.filter(b => b.t > 0);
}
export function addBuff(b) { hero.buffs.push(b); emit('buff', b); }

function updateHero(dt) {
  hero.blinkT -= dt;
  if (hero.blinkT < -0.12) hero.blinkT = rand(2, 4.5);
  if (hero.hurtT > 0) hero.hurtT -= dt;
  hero.squash *= Math.pow(0.001, dt);
  if (hero.dead) { hero.face = 'hurt'; return; }
  if (B.phase === 'victory') { hero.face = 'happy'; return; }
  const target = front();
  const dist = target ? target.x - hero.x : 999;
  const inRange = target && dist < 250 && target.state !== 'flee';
  hero.atkT -= dt;
  if (hero.anim > 0) {
    hero.anim -= dt;
    const p = 1 - hero.anim / hero.animLen;
    if (!hero.hitDone && p >= 0.45) { hero.hitDone = true; heroStrike(); }
  }
  if (hero.atkT <= 0 && inRange && hero.anim <= 0) {
    const sp = heroAspd();
    hero.atkT = 1 / sp;
    hero.animLen = Math.min(0.3, 0.75 / sp);
    hero.anim = hero.animLen;
    hero.hitDone = false;
  }
  hero.face = hero.hurtT > 0 ? 'hurt' : hero.anim > 0 ? 'attack' : hero.blinkT < 0 ? 'blink' : 'idle';
}

function heroStrike() {
  const t = front();
  if (!t) return;
  // the captain attacks from the deck with flying slashes (double/triple attacks send more)
  const [c, cd] = heroCrit();
  const swings = 1 + (Math.random() < ST.dbl ? 1 : 0) + (Math.random() < ST.trp ? 1 : 0);
  for (let i = 0; i < swings; i++) {
    const crit = Math.random() < c;
    const dmg = heroAtk() * (crit ? cd : 1) * rand(0.95, 1.05);
    B.projs.push({ kind: 'slash', from: 'hero', x: hero.x + 22 - i * 8, y: world.deckY - 40 + i * 6, tx: i === 0 ? t : null, v: 660, dmg, crit, col: '#e8f4ff' });
  }
  if (swings > 1) text(hero.x + 10, world.deckY - 104, swings === 2 ? 'Duplo!' : 'Triplo!', '#7ff0e0', 15);
  hero.squash = 1;
  emit('heroHit');
}

function updateEnemy(e, dt) {
  e.t += dt;
  if (e.flash > 0) e.flash -= dt;
  if (e.slowT > 0) e.slowT -= dt;
  if (e.knock > 0) { e.x += e.knock * 8 * dt; e.knock = Math.max(0, e.knock - 40 * dt); }
  const slowMul = (e.slowT > 0 ? 0.6 : 1) * (1 - ST.slow);
  if (e.state === 'die') {
    if (e.building) { if (B.walking) e.x -= 70 * dt; e.y = Math.min(60, e.t * 70); e.alpha = Math.max(0, 1 - e.t / 0.9); return; }
    e.x += e.vx * dt; e.y += e.vy * dt; e.vy += 900 * dt; e.rot += 7 * dt; e.alpha = Math.max(0, 1 - e.t / 1.0);
    return;
  }
  if (e.building) { if (B.walking) e.x -= 70 * dt; e.state = 'idle'; return; }
  if (e.state === 'flee') { e.x += 140 * dt; return; }
  if (hero.dead) { e.state = 'idle'; return; }
  if (e.stunT > 0) { e.stunT -= dt; e.state = 'idle'; e.anim = 0; return; }
  // walk to the formation spot on the island
  if (e.stopX === undefined) placeAt(e, e.z !== undefined ? e.z : 0.5, 30);
  const stop = e.stopX;
  if (e.x > stop + 1) {
    e.state = 'walk';
    e.x = Math.max(stop, e.x - e.spd * slowMul * dt);
  } else {
    if (e.state === 'walk') e.state = 'idle';
    const canHit = true;
    e.atkT -= dt * slowMul;
    if (e.anim > 0) {
      const before = e.anim;
      e.anim -= dt;
      if (before > 0.16 && e.anim <= 0.16) {
        if (e.ranged) B.projs.push({ kind: e.spec.weapon === 'bow' ? 'arrow' : 'orbE', from: 'enemy', x: e.x - 24 * e.scale, y: gy(e) - 50 * e.scale, v: 300, dmg: e.dmg });
        else if (canHit) damageHero(e.dmg);
      }
    } else if (e.atkT <= 0 && canHit) {
      e.atkT = (e.boss ? 1.5 : e.ranged ? 2.4 : 1.8) * rand(0.9, 1.1);
      e.anim = 0.42;
      e.state = 'atk';
    } else if (e.state === 'atk') e.state = 'idle';
  }
}

function updateProjs(dt) {
  for (const p of B.projs) {
    p.t = (p.t || 0) + dt;
    if (p.from === 'enemy') {
      // enemy shots fly to the captain on the deck
      const tx = hero.x + 14, ty = world.deckY - 40, dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
      p.vy = dy / Math.max(1, d);
      if (d < 12) { p.dead = true; damageHero(p.dmg); fx('hit', hero.x + 16, world.deckY - 44, { life: 0.25, s: 0.7 }); }
      else { p.x += dx / d * p.v * dt; p.y += dy / d * p.v * dt; }
    } else {
      const t = p.tx && p.tx.state !== 'die' ? p.tx : front();
      if (!t) { p.dead = true; continue; }
      const tx = t.x - 10, ty = gy(t) - 38 * t.scale;
      const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
      if (d < 14) { p.dead = true; hitEnemy(t, p.dmg, { col: p.crit ? '#ffcf3a' : '#ffffff', crit: p.crit, size: 17 }); fx(p.crit ? 'critHit' : 'hit', tx, ty, { life: 0.28, s: 0.85 }); continue; }
      p.vy = dy / d; p.x += dx / d * p.v * dt; p.y += dy / d * p.v * dt;
    }
    if (p.t > 4) p.dead = true;
  }
  B.projs = B.projs.filter(p => !p.dead);
}

function updateDrops(dt) {
  for (const d of B.drops) {
    d.t += dt;
    if (d.state === 'pop') {
      d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 760 * dt; d.vx *= 0.98;
      if (d.y > d.ground - 4) { d.y = d.ground - 4; d.vy *= -0.42; d.vx *= 0.6; d.bounce++; }
      if (d.t > d.delay + 0.25) { d.state = 'fly'; d.ft = 0; d.sx = d.x; d.sy = d.y; }
    } else {
      d.ft += dt * 1.9;
      const tgt = d.kind === 'gem' ? world.gems : world.gold;
      const t = Math.min(1, d.ft), e = t * t;
      const cx = (d.sx + tgt.x) / 2 - 40, cy = Math.min(d.sy, tgt.y) - 80;
      d.x = (1 - e) * (1 - e) * d.sx + 2 * (1 - e) * e * cx + e * e * tgt.x;
      d.y = (1 - e) * (1 - e) * d.sy + 2 * (1 - e) * e * cy + e * e * tgt.y;
      if (t >= 1) { d.done = true; emit('dropArrive', d.kind); }
    }
  }
  B.drops = B.drops.filter(d => !d.done);
}

export function spawnCustom(o) {
  const e = Object.assign({ id: ++uid, x: W + 30, y: 0, z: 0.5, state: 'walk', t: rand(0, 1), atkT: rand(0.6, 1.2), anim: 0, flash: 0, knock: 0, vx: 0, vy: 0, rot: 0, alpha: 1, slowT: 0, scale: 1, tier: 0, ranged: false, spd: 46, gold: 0 }, o);
  e.max = e.max || e.hp;
  if (!e.building) { e.scale *= zScale(e.z); placeAt(e, e.z, e.dx || 30); } else { e.gy = zToY(e.z); }
  B.enemies.push(e);
  return e;
}
export function setPhaseExt(p) { setPhase(p); }

export function resetHero() {
  hero.hp = ST.hp; hero.max = ST.hp; hero.dead = 0; hero.buffs.length = 0; hero.shield = 0;
}
