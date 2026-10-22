// Skill effects: each one owns its timeline, deals damage on the right frame
// and draws itself on the battle canvas.
import { B, W, world, hitEnemy, alive, front, heroAtk, addBuff, fx, text, gy } from '../game/battle.js';
import { ST } from '../game/stats.js';
import { rand, clamp } from '../core/util.js';
import { sfx } from '../core/audio.js';
import { sprite } from './sprites.js';
import { icon } from '../art/icons.js';

export const skillFx = [];
const OL = '#2a1a3e';
const TAU = Math.PI * 2;

export function drawSkillFx(ctx, feet, dt) {
  for (const f of skillFx) { ctx.save(); try { f.draw(ctx, feet, f); } catch (e) { f.t = f.life; console.warn('fx', e); } ctx.restore(); }
}
export function updateSkillFx(dt) {
  for (const f of skillFx) { f.t += dt; f.update(f, dt); }
  for (let i = skillFx.length - 1; i >= 0; i--) if (skillFx[i].t >= skillFx[i].life) skillFx.splice(i, 1);
}
export function clearSkillFx() { skillFx.length = 0; }

const dmgOf = (s, lv, mult = 1) => heroAtk() * (s.dmgPct / 100) * ST.skill * mult;
const hitAll = (s, dmg, filter, o = {}) => { for (const e of alive()) if (!filter || filter(e)) hitEnemy(e, dmg * rand(0.95, 1.05), Object.assign({ col: '#ffe14a', size: 20 }, o)); };
const eY = e => gy(e) - 36 * e.scale;
function shake(v) { world.shake = Math.max(world.shake, v); }
function cluster() {
  const a = alive().filter(e => e.state !== 'flee').sort((p, q) => p.x - q.x).slice(0, 3);
  if (!a.length) return Math.min(W - 60, B.hero.x + 160);
  return a.reduce((s, e) => s + e.x, 0) / a.length;
}
function particles(n, x, y, col, spd = 160, life = 0.6, grav = 500, size = 4) {
  const ps = [];
  for (let i = 0; i < n; i++) { const a = rand(0, TAU), v = rand(spd * 0.4, spd); ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.4, t: 0, life: life * rand(0.6, 1), col, size: size * rand(0.6, 1.3), grav }); }
  return ps;
}
function stepParts(ps, dt) { for (const p of ps) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt; p.vx *= 0.98; } }
function drawParts(ctx, ps, add) {
  if (add) ctx.globalCompositeOperation = 'lighter';
  for (const p of ps) { if (p.t > p.life) continue; ctx.globalAlpha = 1 - p.t / p.life; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function ring(ctx, x, y, r, col, w, a) { ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.35, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
function glow(ctx, x, y, r, col, a = 1) {
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function jelly(ctx, x, y, w, h, col) {
  ctx.lineWidth = 3.5; ctx.strokeStyle = OL; ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.45, y); ctx.bezierCurveTo(x - w * 0.62, y, x - w * 0.6, y - h * 0.3, x - w * 0.5, y - h * 0.45);
  ctx.bezierCurveTo(x - w * 0.35, y - h * 0.95, x + w * 0.35, y - h * 0.95, x + w * 0.5, y - h * 0.45);
  ctx.bezierCurveTo(x + w * 0.6, y - h * 0.3, x + w * 0.62, y, x + w * 0.45, y); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(x - w * 0.22, y - h * 0.62, w * 0.12, h * 0.07, -0.6, 0, TAU); ctx.fill();
}
function bolt(ctx, x1, y1, x2, y2, col, w) {
  const n = 7; ctx.beginPath(); ctx.moveTo(x1, y1);
  for (let i = 1; i < n; i++) { const t = i / n; ctx.lineTo(x1 + (x2 - x1) * t + rand(-9, 9), y1 + (y2 - y1) * t + rand(-9, 9)); }
  ctx.lineTo(x2, y2);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = col; ctx.lineWidth = w * 2.4; ctx.globalAlpha *= 0.45; ctx.stroke();
  ctx.globalAlpha /= 0.45; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = w; ctx.stroke();
}

// ------------------------------------------------------------------ factories
const F = {
  drop(s, lv) {
    const x = cluster();
    return { life: 1.0, x, y: -80, hit: false, ps: [],
      update(f, dt) {
        if (!f.hit) { const p = Math.min(1, f.t / 0.38); f.y = -80 + (world.gmid - 10 + 80) * p * p; if (p >= 1) { f.hit = true; hitAll(s, dmgOf(s, lv), e => Math.abs(e.x - f.x) < 95); shake(0.25); sfx('splash'); f.ps = particles(16, f.x, world.gmid - 20, s.col, 220, 0.7, 700, 5); } }
        stepParts(f.ps, dt);
      },
      draw(ctx, feet, f) {
        if (!f.hit) {
          ctx.globalAlpha = 0.25; ctx.fillStyle = OL; ctx.beginPath(); ctx.ellipse(f.x, feet, 50 * Math.min(1, f.t / 0.38), 9, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
          ctx.save(); ctx.translate(f.x, f.y);
          ctx.fillStyle = s.col; ctx.strokeStyle = OL; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(0, -70); ctx.bezierCurveTo(30, -30, 42, -6, 38, 12); ctx.bezierCurveTo(32, 40, -32, 40, -38, 12); ctx.bezierCurveTo(-42, -6, -30, -30, 0, -70); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-14, -10, 7, 14, 0.3, 0, TAU); ctx.fill();
          ctx.restore();
        } else {
          const p = (f.t - 0.38) / 0.62;
          ctx.globalAlpha = 1 - p;
          jelly(ctx, f.x, feet + 2, 120 + 60 * p, 36 * (1 - p) + 6, s.col);
          ring(ctx, f.x, feet - 4, 50 + 90 * p, '#ffffff', 5 * (1 - p), 1 - p);
          ctx.globalAlpha = 1;
          drawParts(ctx, f.ps);
        }
      } };
  },
  acid(s, lv) {
    const balls = [];
    const tg = alive().filter(e => e.state !== 'flee');
    for (let i = 0; i < 3; i++) balls.push({ delay: i * 0.12, tgt: tg.length ? tg[i % tg.length] : null, done: false, ps: [] });
    return { life: 1.2, balls,
      update(f, dt) {
        for (const b of f.balls) {
          const t = (f.t - b.delay) / 0.45;
          if (t < 0 || b.done) { stepParts(b.ps, dt); continue; }
          const tgt = b.tgt && b.tgt.state !== 'die' ? b.tgt : front();
          b.tx = tgt ? tgt.x : W - 60; b.ty = tgt ? eY(tgt) : world.gmid - 40;
          const sx = B.hero.x + 24, sy = world.deckY - 50;
          const tt = Math.min(1, t);
          b.x = sx + (b.tx - sx) * tt; b.y = sy + (b.ty - sy) * tt - Math.sin(tt * Math.PI) * 70;
          if (t >= 1) { b.done = true; if (tgt) hitEnemy(tgt, dmgOf(s, lv), { col: '#d8ff6a', size: 19 }); b.ps = particles(8, b.x, b.y, '#c8f05a', 140, 0.5, 400, 4); sfx('splash'); }
          stepParts(b.ps, dt);
        }
      },
      draw(ctx, feet, f) {
        for (const b of f.balls) {
          if (!b.done && b.x !== undefined) { ctx.fillStyle = OL; ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, TAU); ctx.fill(); ctx.fillStyle = '#c8f05a'; ctx.beginPath(); ctx.arc(b.x, b.y, 7.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x - 2.5, b.y - 2.5, 2.4, 0, TAU); ctx.fill(); }
          drawParts(ctx, b.ps);
        }
      } };
  },
  slam(s, lv) {
    return { life: 1.3, hits: 0, ps: [],
      update(f, dt) {
        const tg = front(); f.tx = tg ? tg.x : B.hero.x + 120;
        for (let i = 0; i < 2; i++) if (f.hits === i && f.t > 0.45 + i * 0.5) { f.hits++; hitAll(s, dmgOf(s, lv), e => Math.abs(e.x - f.tx) < 70); shake(0.2); sfx('boom'); f.ps.push(...particles(10, f.tx, world.gmid - 6, '#ffffff', 160, 0.4, 600, 4)); }
        stepParts(f.ps, dt);
      },
      draw(ctx, feet, f) {
        const k = f.t < 0.45 ? f.t / 0.45 : ((f.t - 0.45) % 0.5) / 0.5;
        const sx = f.t < 0.45 ? B.hero.x : f.tx - 30, ex = f.tx;
        const x = sx + (ex - sx) * k, y = feet - Math.sin(k * Math.PI) * 110;
        if (f.t < 1.0) { ctx.globalAlpha = 0.85; jelly(ctx, x, y, 70, 60, s.col); ctx.globalAlpha = 1; }
        if (f.hits) ring(ctx, f.tx, feet - 4, 30 + 80 * ((f.t - 0.45) % 0.5) / 0.5, '#ffffff', 4, 0.8);
        drawParts(ctx, f.ps);
      } };
  },
  buff(s, lv) {
    const b = Object.assign({ t: s.dur, src: s.id }, s.buff);
    if (s.buff.aspd) b.aspd = s.buff.aspd * (1 + 0.1 * (lv - 1));
    addBuff(b);
    sfx('magic');
    const label = s.buff.aspd ? `VATQ +${(b.aspd).toFixed(1).replace('.', ',')}!` : s.buff.crit ? 'Crítico +30%!' : s.buff.atk ? `ATQ +${Math.round(s.buff.atk * 100)}%!` : s.name;
    text(B.hero.x, world.deckY - 110, label, s.col, 20, { life: 1.2, vy: -30 });
    return { life: 0.9, ps: particles(14, B.hero.x, world.deckY - 30, s.col, 120, 0.9, -200, 3.4),
      update(f, dt) { stepParts(f.ps, dt); },
      draw(ctx, feet, f) { const p = f.t / f.life; ring(ctx, B.hero.x, world.deckY - 4, 20 + 70 * p, s.col, 6 * (1 - p), 1 - p); glow(ctx, B.hero.x, world.deckY - 34, 70, s.col, 0.5 * (1 - p)); drawParts(ctx, f.ps, true); } };
  },
  shield(s, lv) {
    const h = B.hero;
    h.shield = Math.max(h.shield, h.max * s.buff.shield * (1 + 0.1 * (lv - 1)));
    const heal = h.max * s.buff.heal;
    h.hp = Math.min(h.max, h.hp + heal);
    text(h.x, world.deckY - 110, '+' + Math.round(heal), '#6fef8f', 18);
    sfx('magic');
    setTimeout(() => { h.shield = 0; }, s.dur * 1000);
    return F.buff(Object.assign({}, s, { buff: {}, dur: 0.01 }), lv);
  },
  bubbles(s, lv) {
    const bs = [];
    for (let i = 0; i < 8; i++) { const tg = alive(); const e = tg.length ? tg[i % tg.length] : null; bs.push({ x: (e ? e.x : B.hero.x + 100 + i * 25) + rand(-20, 20), y: -20 - rand(0, 60), vy: rand(150, 220), r: rand(10, 16), done: false, delay: i * 0.08, wob: rand(0, TAU), ps: [] }); }
    return { life: 2.0, bs,
      update(f, dt) {
        for (const b of f.bs) {
          if (f.t < b.delay) continue;
          if (!b.done) {
            b.y += b.vy * dt; b.x += Math.sin(f.t * 6 + b.wob) * 30 * dt;
            const hitE = alive().find(e => Math.abs(e.x - b.x) < 30 && b.y > world.gmid - 70 * e.scale);
            if (hitE || b.y > world.gmid - 10) { b.done = true; if (hitE) hitEnemy(hitE, dmgOf(s, lv), { col: '#bdf3ff', size: 17 }); b.ps = particles(8, b.x, b.y, '#e8fbff', 120, 0.35, 0, 3); sfx('tap'); }
          }
          stepParts(b.ps, dt);
        }
      },
      draw(ctx, feet, f) {
        for (const b of f.bs) {
          if (!b.done && f.t >= b.delay) {
            ctx.strokeStyle = OL; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(190,240,255,.35)';
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#8be0ff'; ctx.lineWidth = 1.6; ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.28, b.r * 0.16, -0.6, 0, TAU); ctx.fill();
          }
          drawParts(ctx, b.ps);
        }
      } };
  },
  wave(s, lv) {
    const hitSet = new Set();
    sfx('splash');
    return { life: 1.1, x: B.hero.x - 40, ps: [],
      update(f, dt) {
        f.x = B.hero.x - 40 + (W + 120 - B.hero.x) * (f.t / 0.95);
        for (const e of alive()) if (!hitSet.has(e) && e.x < f.x + 20) { hitSet.add(e); hitEnemy(e, dmgOf(s, lv), { col: '#8be0ff', size: 21, knock: 26 }); }
        if (Math.random() < 0.6) f.ps.push(...particles(1, f.x + rand(-10, 10), world.gmid - rand(40, 90), '#e8fbff', 80, 0.5, 300, 3.4));
        stepParts(f.ps, dt);
      },
      draw(ctx, feet, f) {
        const x = f.x, h = 96;
        const g = ctx.createLinearGradient(x - 160, 0, x + 20, 0);
        g.addColorStop(0, 'rgba(63,169,255,0)'); g.addColorStop(0.5, 'rgba(63,169,255,.75)'); g.addColorStop(1, '#5cc8ff');
        ctx.fillStyle = g; ctx.strokeStyle = OL; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x - 180, feet + 6); ctx.lineTo(x - 180, feet - h * 0.3);
        ctx.quadraticCurveTo(x - 60, feet - h * 0.6, x - 10, feet - h); ctx.quadraticCurveTo(x + 34, feet - h * 1.05, x + 30, feet - h * 0.7);
        ctx.quadraticCurveTo(x + 10, feet - h * 0.78, x + 8, feet - h * 0.55); ctx.quadraticCurveTo(x + 26, feet - 20, x + 24, feet + 6); ctx.closePath();
        ctx.fill();
        ctx.beginPath(); ctx.moveTo(x - 70, feet - h * 0.62);
        ctx.quadraticCurveTo(x - 40, feet - h * 0.75, x - 10, feet - h); ctx.quadraticCurveTo(x + 34, feet - h * 1.05, x + 30, feet - h * 0.7);
        ctx.quadraticCurveTo(x + 10, feet - h * 0.78, x + 8, feet - h * 0.55); ctx.quadraticCurveTo(x + 26, feet - 20, x + 24, feet + 6);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 30, feet - h * 0.86); ctx.quadraticCurveTo(x + 10, feet - h * 1.0, x + 26, feet - h * 0.74); ctx.stroke();
        drawParts(ctx, f.ps);
      } };
  },
  chain(s, lv) {
    const tg = alive().filter(e => e.state !== 'flee').sort((a, b) => a.x - b.x).slice(0, s.hits);
    const pts = [{ x: B.hero.x + 20, y: world.deckY - 50 }];
    sfx('zap');
    return { life: 0.25 + tg.length * 0.08, tg, pts, done: 0,
      update(f, dt) {
        while (f.done < f.tg.length && f.t > f.done * 0.08) {
          const e = f.tg[f.done++];
          if (e.state !== 'die') { hitEnemy(e, dmgOf(s, lv), { col: '#fff36a', size: 20 }); e.flash = 0.2; }
          f.pts.push({ x: e.x, y: eY(e) });
        }
      },
      draw(ctx, feet, f) {
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 1; i < f.pts.length; i++) { ctx.globalAlpha = Math.max(0, 1 - (f.t - (i - 1) * 0.08) / 0.3); if (ctx.globalAlpha > 0) bolt(ctx, f.pts[i - 1].x, f.pts[i - 1].y, f.pts[i].x, f.pts[i].y, '#ffe14a', 3); glow(ctx, f.pts[i].x, f.pts[i].y, 30, '#ffe14a', ctx.globalAlpha); }
      } };
  },
  ice(s, lv) {
    const tg = alive().filter(e => e.state !== 'flee').sort((a, b) => a.x - b.x);
    sfx('ice');
    return { life: 1.0, sp: tg.map((e, i) => ({ e, x: e.x, d: i * 0.05, hit: false })),
      update(f, dt) { for (const p of f.sp) if (!p.hit && f.t > p.d + 0.08) { p.hit = true; if (p.e.state !== 'die') { hitEnemy(p.e, dmgOf(s, lv), { col: '#bdf3ff', size: 20 }); p.e.slowT = 4; } } },
      draw(ctx, feet, f) {
        for (const p of f.sp) {
          const t = f.t - p.d; if (t < 0) continue;
          const grow = Math.min(1, t / 0.12), fade = t > 0.6 ? Math.max(0, 1 - (t - 0.6) / 0.3) : 1;
          ctx.globalAlpha = fade;
          for (const [ox, h, w] of [[-14, 46, 9], [0, 70, 12], [14, 50, 9], [-26, 28, 7], [26, 32, 7]]) {
            ctx.fillStyle = '#d8f8ff'; ctx.strokeStyle = OL; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(p.x + ox - w, feet); ctx.lineTo(p.x + ox, feet - h * grow); ctx.lineTo(p.x + ox + w, feet); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#9fe6ff'; ctx.beginPath(); ctx.moveTo(p.x + ox, feet - h * grow); ctx.lineTo(p.x + ox + w, feet); ctx.lineTo(p.x + ox + w * 0.3, feet); ctx.closePath(); ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      } };
  },
  meteor(s, lv) {
    const tx = cluster();
    return { life: 1.3, tx, hit: false, ps: [], trail: [],
      update(f, dt) {
        const p = Math.min(1, f.t / 0.55);
        f.x = W + 40 + (f.tx - W - 40) * p; f.y = -60 + (world.gmid - 20 + 60) * p;
        if (!f.hit) f.trail.push(...particles(2, f.x, f.y, Math.random() < 0.5 ? '#ffd23f' : '#ff7a2a', 40, 0.4, -60, 7));
        if (!f.hit && p >= 1) { f.hit = true; hitAll(s, dmgOf(s, lv), e => Math.abs(e.x - f.tx) < 120, { col: '#ffb23f', size: 23 }); shake(0.4); world.flash = 0.12; sfx('boom'); f.ps = particles(22, f.tx, world.gmid - 20, '#ff7a2a', 260, 0.8, 600, 5); }
        stepParts(f.ps, dt); stepParts(f.trail, dt);
      },
      draw(ctx, feet, f) {
        drawParts(ctx, f.trail, true);
        if (!f.hit) { glow(ctx, f.x, f.y, 50, '#ff7a2a'); ctx.fillStyle = OL; ctx.beginPath(); ctx.arc(f.x, f.y, 19, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff7a2a'; ctx.beginPath(); ctx.arc(f.x, f.y, 15.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(f.x - 4, f.y - 4, 7, 0, TAU); ctx.fill(); }
        else { const p = (f.t - 0.55) / 0.75; glow(ctx, f.tx, feet - 30, 140 * (0.5 + p), '#ff7a2a', 1 - p); ring(ctx, f.tx, feet - 4, 40 + 140 * p, '#ffd23f', 7 * (1 - p), 1 - p); drawParts(ctx, f.ps); }
      } };
  },
  tornado(s, lv) {
    sfx('whoosh');
    return { life: 1.9, x: B.hero.x + 20, hits: 0, ps: [],
      update(f, dt) {
        f.x = B.hero.x + 20 + (W - B.hero.x + 20) * (f.t / 1.8);
        if (f.hits < s.hits && f.t > f.hits * 0.2 + 0.1) {
          f.hits++;
          const near = alive().filter(e => Math.abs(e.x - f.x) < 60);
          (near.length ? near : [front()].filter(Boolean)).forEach(e => { hitEnemy(e, dmgOf(s, lv), { col: '#d8fff0', size: 17 }); e.y = Math.min(e.y, -8); });
        }
        if (Math.random() < 0.7) f.ps.push(...particles(1, f.x + rand(-20, 20), world.gmid - 4, '#d8c8a8', 70, 0.5, -100, 4));
        stepParts(f.ps, dt);
      },
      draw(ctx, feet, f) {
        drawParts(ctx, f.ps);
        for (let i = 0; i < 9; i++) {
          const y = feet - i * 13, w = 10 + i * 6, ox = Math.sin(f.t * 14 + i * 0.8) * (4 + i);
          ctx.globalAlpha = 0.75; ctx.strokeStyle = OL; ctx.lineWidth = 3; ctx.fillStyle = i % 2 ? '#e8fff6' : '#c8f0e0';
          ctx.beginPath(); ctx.ellipse(f.x + ox, y, w, 6 + i * 0.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } };
  },
  clones(s, lv) {
    sfx('magic');
    const cl = [{ dx: -34, t: 0 }, { dx: 46, t: 0.3 }];
    return { life: s.dur, cl,
      update(f, dt) {
        if (B.phase !== 'fight' && B.phase !== 'boss') { f.t = f.life; return; }
        for (const c of f.cl) { c.t -= dt; if (c.t <= 0) { c.t = 0.6; const e = front(); if (e) B.projs.push({ kind: 'spit', from: 'hero', x: B.hero.x + c.dx + 12, y: world.deckY - 22, tx: e, v: 520, dmg: heroAtk() * 0.5 * (1 + 0.15 * (lv - 1)) * ST.skill, col: '#e8a8ff' }); } }
      },
      draw(ctx, feet, f) {
        const a = Math.min(1, f.t / 0.3, (f.life - f.t) / 0.3);
        ctx.globalAlpha = a;
        f.cl.forEach((c, i) => { const hop = Math.abs(Math.sin(f.t * 5 + i)) * 4; jelly(ctx, B.hero.x + c.dx, world.deckY + 2 - hop, 40, 34, i ? '#e8a8ff' : '#d07bff'); ctx.fillStyle = OL; ctx.beginPath(); ctx.arc(B.hero.x + c.dx + 2, world.deckY - 14 - hop, 2.4, 0, TAU); ctx.arc(B.hero.x + c.dx + 10, world.deckY - 14 - hop, 2.4, 0, TAU); ctx.fill(); });
        ctx.globalAlpha = 1;
      } };
  },
  breath(s, lv) {
    sfx('fire');
    return { life: 1.4, ticks: 0, ps: [],
      update(f, dt) {
        if (f.t < 1.2) for (let i = 0; i < 4; i++) { const a = rand(-0.22, 0.22); const v = rand(300, 420); f.ps.push({ x: B.hero.x + 30, y: world.deckY - 40, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: rand(0.45, 0.7), col: Math.random() < 0.5 ? '#ffd23f' : '#ff6a2a', size: rand(6, 11), grav: -60 }); }
        if (f.ticks < s.hits && f.t > f.ticks * 0.1) { f.ticks++; hitAll(s, dmgOf(s, lv), e => e.x - B.hero.x < 300, { col: '#ffb23f', size: 16 }); }
        for (const p of f.ps) p.size *= 1 + dt * 1.6;
        stepParts(f.ps, dt);
      },
      draw(ctx, feet, f) { drawParts(ctx, f.ps, true); } };
  },
  hammer(s, lv) {
    const tg = front();
    return { life: 1.2, tg, tx: tg ? tg.x : W - 80, hit: false, ps: [],
      update(f, dt) {
        const p = Math.min(1, f.t / 0.45);
        f.y = -80 + (world.gmid - 30 + 80) * p * p; f.rot = -1.4 + 1.4 * p;
        if (!f.hit && p >= 1) {
          f.hit = true; shake(0.45); world.flash = 0.15; sfx('boom');
          const e = f.tg && f.tg.state !== 'die' ? f.tg : front();
          if (e) hitEnemy(e, dmgOf(s, lv), { col: '#ffe14a', size: 26, bossX: s.bossX || 1, crit: true });
          hitAll(s, dmgOf(s, lv) * 0.25, o => o !== e && Math.abs(o.x - f.tx) < 90);
          f.ps = particles(18, f.tx, world.gmid - 6, '#ffe680', 240, 0.7, 700, 4.5);
        }
        stepParts(f.ps, dt);
      },
      draw(ctx, feet, f) {
        if (!f.hit || f.t < 0.75) {
          ctx.save(); ctx.translate(f.tx + 20, f.y); ctx.rotate(f.rot || 0);
          ctx.fillStyle = '#a8683a'; ctx.strokeStyle = OL; ctx.lineWidth = 4;
          ctx.fillRect(-5, -10, 10, 70); ctx.strokeRect(-5, -10, 10, 70);
          ctx.fillStyle = '#ffcc3a'; ctx.beginPath(); ctx.roundRect(-34, -34, 68, 36, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#fff3a6'; ctx.fillRect(-29, -30, 58, 8);
          ctx.restore();
        }
        if (f.hit) { const p = (f.t - 0.45) / 0.75; ring(ctx, f.tx, feet - 4, 30 + 110 * p, '#ffe680', 8 * (1 - p), 1 - p); glow(ctx, f.tx, feet - 30, 120, '#ffd23f', 1 - p); drawParts(ctx, f.ps); }
      } };
  },
  vortex(s, lv) {
    const cx = cluster();
    sfx('whoosh');
    return { life: 1.7, cx, hit: false,
      update(f, dt) {
        if (f.t < 1.2) for (const e of alive()) if (!e.boss) e.x += (f.cx - e.x) * Math.min(1, dt * 2.2);
        if (!f.hit && f.t > 1.2) { f.hit = true; hitAll(s, dmgOf(s, lv), null, { col: '#e0b0ff', size: 24 }); shake(0.35); world.flash = 0.1; sfx('boom'); }
      },
      draw(ctx, feet, f) {
        const a = f.hit ? Math.max(0, 1 - (f.t - 1.2) / 0.5) : Math.min(1, f.t / 0.3);
        ctx.save(); ctx.translate(f.cx, feet - 50); ctx.scale(1, 0.75); ctx.globalAlpha = a;
        glow(ctx, 0, 0, 110, '#7a3ab0', 0.9);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) { ctx.rotate(f.t * 6 + i * TAU / 4); ctx.strokeStyle = i % 2 ? '#c55cff' : '#e0b0ff'; ctx.lineWidth = 6; ctx.beginPath(); for (let r = 4; r < 90; r += 4) ctx.lineTo(Math.cos(r * 0.06) * r, Math.sin(r * 0.06) * r); ctx.stroke(); ctx.rotate(-(f.t * 6 + i * TAU / 4)); }
        ctx.restore();
      } };
  },
  stars(s, lv) {
    const st = [];
    for (let i = 0; i < s.hits; i++) { const tg = alive(); const e = tg.length ? tg[i % tg.length] : null; const tx = (e ? e.x : B.hero.x + 80 + rand(0, 220)) + rand(-26, 26); st.push({ d: i * 0.07, tx, x0: tx + 160, y0: -40, done: false }); }
    sfx('magic');
    return { life: 2.2, st, ps: [],
      update(f, dt) {
        for (const p of f.st) {
          const t = (f.t - p.d) / 0.35; if (t < 0 || p.done) continue;
          p.x = p.x0 + (p.tx - p.x0) * Math.min(1, t); p.y = p.y0 + (world.gmid - 20 - p.y0) * Math.min(1, t);
          if (t >= 1) { p.done = true; const e = alive().sort((a, b) => Math.abs(a.x - p.tx) - Math.abs(b.x - p.tx))[0]; if (e && Math.abs(e.x - p.tx) < 70) hitEnemy(e, dmgOf(s, lv), { col: '#fff3a6', size: 17 }); f.ps.push(...particles(5, p.tx, world.gmid - 20, '#ffe680', 130, 0.4, 300, 3)); }
        }
        stepParts(f.ps, dt);
      },
      draw(ctx, feet, f) {
        ctx.globalCompositeOperation = 'lighter';
        for (const p of f.st) { if (p.done || p.x === undefined) continue; ctx.strokeStyle = 'rgba(255,240,160,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 40, p.y - 40); ctx.stroke(); glow(ctx, p.x, p.y, 16, '#ffe680'); }
        ctx.globalCompositeOperation = 'source-over';
        drawParts(ctx, f.ps, true);
      } };
  },
  nova(s, lv) {
    sfx('magic');
    return { life: 1.3, hit: false,
      update(f) { if (!f.hit && f.t > 0.45) { f.hit = true; hitAll(s, dmgOf(s, lv), null, { col: '#ffd0d8', size: 26 }); world.flash = 0.3; shake(0.4); sfx('boom'); } },
      draw(ctx, feet, f) {
        if (!f.hit) glow(ctx, B.hero.x, world.deckY - 34, 30 + 120 * (f.t / 0.45), '#ff8a9a', 0.9);
        else { const p = (f.t - 0.45) / 0.85; ring(ctx, B.hero.x, world.deckY - 30, 40 + 460 * p, '#ffffff', 12 * (1 - p), 1 - p); glow(ctx, B.hero.x, world.deckY - 34, 220 * (1 - p * 0.5), '#ff4f6a', 1 - p); }
      } };
  },
  decree(s, lv) {
    addBuff({ t: s.dur, src: s.id, atk: s.buff.atk });
    text(B.hero.x, world.deckY - 116, 'ATQ +150%!', '#ffe14a', 21, { life: 1.3 });
    sfx('rare');
    const coins = [];
    for (let i = 0; i < 26; i++) coins.push({ x: B.hero.x + 40 + rand(0, W - B.hero.x - 20), y: -rand(20, 220), vy: rand(260, 360), w: i < 13 ? 0 : 1, done: false });
    return { life: 1.8, coins, waves: 0,
      update(f, dt) {
        for (const c of f.coins) { c.y += c.vy * dt; if (c.y > world.gmid - 6) c.done = true; }
        if (f.waves < 2 && f.t > 0.55 + f.waves * 0.45) { f.waves++; hitAll(s, dmgOf(s, lv), null, { col: '#ffe14a', size: 22 }); sfx('coin'); }
      },
      draw(ctx, feet, f) {
        const cs = sprite('ic:coin', icon('coin'), 16, 16);
        for (const c of f.coins) if (!c.done && cs) { const sp = Math.abs(Math.cos(f.t * 10 + c.x)); ctx.drawImage(cs.c, c.x - 9 * sp, c.y - 9, 18 * sp + 1, 18); }
        const cr = sprite('sk:crown', icon('star'), 40, 40);
        const p = Math.min(1, f.t / 0.3);
        glow(ctx, B.hero.x, world.deckY - 110, 50, '#ffd23f', (1 - f.t / f.life));
        void cr; void p;
      } };
  },
  genesis(s, lv) {
    addBuff({ t: s.dur, src: s.id, atk: s.buff.atk });
    sfx('rare');
    const tg = alive().map(e => e.x);
    return { life: 1.6, xs: tg.length ? tg : [W * 0.6, W * 0.8], hit: false,
      update(f) { if (!f.hit && f.t > 0.5) { f.hit = true; hitAll(s, dmgOf(s, lv), null, { col: '#fffbe0', size: 28 }); world.flash = 0.35; shake(0.5); sfx('boom'); } },
      draw(ctx, feet, f) {
        const a = f.t < 0.5 ? f.t / 0.5 : Math.max(0, 1 - (f.t - 0.5) / 1.1);
        ctx.globalAlpha = a * 0.35; ctx.fillStyle = '#1a1030'; ctx.fillRect(0, 0, W, feet + 40); ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'lighter';
        for (const x of f.xs) { const g = ctx.createLinearGradient(x - 24, 0, x + 24, 0); g.addColorStop(0, 'rgba(255,240,160,0)'); g.addColorStop(0.5, `rgba(255,250,220,${a})`); g.addColorStop(1, 'rgba(255,240,160,0)'); ctx.fillStyle = g; ctx.fillRect(x - 24, 0, 48, feet); glow(ctx, x, feet - 20, 60, '#fff3a6', a); }
        ctx.globalCompositeOperation = 'source-over';
      } };
  },
};

export function spawnSkillFx(s, lv) {
  const make = s.fx === 'buff' ? F.buff : F[s.fx];
  if (!make) return;
  const sObj = Object.assign({}, s, { dmgPct: (s.dmg || 0) * (1 + 0.12 * (lv - 1)) });
  const f = make(sObj, lv);
  f.t = 0;
  f.update(f, 0);
  skillFx.push(f);
}
