// Draws the battle: sky and sea, the island with depth, the ship with the
// captain and crew, enemies, projectiles and effects.
import { S } from '../core/state.js';
import { B, W, world, heroAtk, shipBob, shoreAt, zToY, gy } from '../game/battle.js';
import { sprite, setScale } from './sprites.js';
import { biomeLayers, LAYER_H, STRIP, BIOMES, cloudSVG, propSVG, PROP_W, PROP_H, ISLAND_PROPS, ISLAND_GROUND } from '../art/scenery.js';
import { rng, dark, light } from '../art/kit.js';
import { humanParts, variant, EW, EH, PIV, buildingSVG, moleParts } from '../art/enemies.js';
import { icon } from '../art/icons.js';
import { shipSVG, SHIP_W, SHIP_H, SHIP_DECK } from '../art/ship.js';
import { SHIP } from '../data/ships.js';
import { chibiParts, CW, CH, CPIV } from '../art/chibi.js';
import { heroLook } from '../game/hero.js';
import { drawSkillFx } from './skillfx.js';
import { drawPets } from './petsfx.js';

let cv, ctx, dpr = 1, cssW = 390, cssH = 456, k = 1;
export const view = { k: 1 };
const layerCache = new Map();
const partCache = new Map();

export function initScene(canvas) {
  cv = canvas;
  ctx = cv.getContext('2d');
  resize();
}
export function resize() {
  const r = cv.getBoundingClientRect();
  cssW = Math.max(200, r.width); cssH = Math.max(200, r.height);
  dpr = Math.min(3, window.devicePixelRatio || 1);
  if (S.settings && S.settings.saver) dpr = Math.min(dpr, 1.5);
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
  k = cssW / W;
  view.k = k;
  world.H = cssH / k;
  setScale(k * dpr);
}
export const logicalH = () => world.H;

function layers(biome) {
  let L = layerCache.get(biome);
  if (!L) { L = biomeLayers(biome); layerCache.set(biome, L); }
  return L;
}
export const heroKey = () => 'hero:' + Object.values(heroLook()).join('|');
function heroParts() {
  const key = heroKey();
  let p = partCache.get(key);
  if (!p) { p = chibiParts(heroLook()); partCache.set(key, p); }
  return { key, p };
}
function enemyParts(e) {
  const key = (e.boss ? 'b:' : 'e:') + e.kind + ':' + e.tier;
  let p = partCache.get(key);
  if (!p) { p = e.kind === 'mole' ? moleParts() : humanParts(variant(e.spec, e.tier)); partCache.set(key, p); }
  return { key, p };
}

// ------------------------------------------------------------------ frame
export function draw(dt) {
  const H = world.H;
  ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
  let sx = 0, sy = 0;
  if (world.shake > 0) { sx = (Math.random() - 0.5) * 7 * world.shake / 0.15; sy = (Math.random() - 0.5) * 7 * world.shake / 0.15; }
  ctx.translate(sx, sy);
  const biome = B.bg || B.info.region.bg;
  const L = layers(biome), b = L.b;
  drawSky(biome, L, b, H);
  drawSea(world.horizon, H);
  drawIsland(biome, L, b, H);

  // entities: props and enemies sorted by depth; the ship sits on the left
  drawShip();
  drawPets(ctx, world.deckY, dt);
  drawHero();
  drawWaterFront();
  const items = [];
  for (const pr of islandProps(biome)) items.push({ y: pr.y, prop: pr });
  for (const e of B.enemies) if (e.state !== 'die') items.push({ y: gy(e), e });
  items.sort((p, q) => p.y - q.y);
  drawShadows();
  for (const it of items) { if (it.prop) drawProp(it.prop, biome); else drawEnemy(it.e); }
  for (const e of B.enemies) if (e.state === 'die') drawEnemy(e);
  drawSkillFx(ctx, world.gmid, dt);
  drawProjs();
  drawFx();
  drawDrops();
  drawTexts();
  if (world.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(0.8, world.flash * 3)})`; ctx.fillRect(-10, -10, W + 20, H + 20); }
}

function strip(biome, name, svgStr, y, par) {
  const h = LAYER_H[name];
  const s = sprite('bg:' + biome + ':' + name, svgStr, STRIP, h, { lowres: true });
  if (!s) return;
  let x = -((B.scroll * par) % STRIP);
  if (x > 0) x -= STRIP;
  ctx.drawImage(s.c, x, y, STRIP, h);
  ctx.drawImage(s.c, x + STRIP, y, STRIP, h);
  if (x + 2 * STRIP < W) ctx.drawImage(s.c, x + 2 * STRIP, y, STRIP, h);
}

function drawShadows() {
  ctx.fillStyle = 'rgba(30,16,50,.22)';
  for (const e of B.enemies) if (e.state !== 'die' && !e.building) ell(e.x, gy(e) + 1, 20 * e.scale, 5 * e.scale);
}
function ell(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }

// ------------------------------------------------------------------ sky, sea, island, ship
function drawSky(biome, L, b, H) {
  const hz = world.horizon;
  const grd = ctx.createLinearGradient(0, 0, 0, hz);
  grd.addColorStop(0, b.sky[0]); grd.addColorStop(0.6, b.sky[1]); grd.addColorStop(1, b.sky[2]);
  ctx.fillStyle = grd;
  ctx.fillRect(-10, -10, W + 20, hz + 20);
  const sg = ctx.createRadialGradient(W * 0.8, hz * 0.45, 4, W * 0.8, hz * 0.45, 110);
  sg.addColorStop(0, b.sun); sg.addColorStop(0.25, hexA(b.sun, 0.55)); sg.addColorStop(1, hexA(b.sun, 0));
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, hz);
  for (let i = 0; i < 4; i++) {
    const cs = sprite('cloud' + (i % 3) + biome, () => cloudSVG(i, b.cloud), 130, 70, { lowres: true });
    if (!cs) continue;
    const speed = 5 + i * 2.5;
    const x = ((i * 137 - B.time * speed) % (W + 160) + W + 160) % (W + 160) - 130;
    const y = hz - 120 + (i % 2) * 26 + i * 6;
    const sc = 0.6 + (i % 3) * 0.16;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(cs.c, x, y, 130 * sc, 70 * sc);
  }
  ctx.globalAlpha = 1;
  // distant islands sitting on the horizon (slightly faded)
  ctx.save(); ctx.beginPath(); ctx.rect(-10, -10, W + 20, hz + 10); ctx.clip();
  ctx.globalAlpha = 0.75;
  strip(biome, 'far', L.far, hz - LAYER_H.far + 58, 0.04);
  ctx.restore();
}

function drawSea(hz, H) {
  const t = B.time;
  const g = ctx.createLinearGradient(0, hz, 0, H);
  g.addColorStop(0, '#8adcf4'); g.addColorStop(0.18, '#4ab4e6'); g.addColorStop(0.6, '#2a86cf'); g.addColorStop(1, '#1f5fa8');
  ctx.fillStyle = g;
  ctx.fillRect(-10, hz, W + 20, H - hz + 10);
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(-10, hz, W + 20, 1.6);
  // sun sparkle on the water
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  for (let i = 0; i < 6; i++) { const x = W * 0.8 + Math.sin(t * 1.3 + i * 1.7) * 30 - i * 4, y = hz + 6 + i * 5; ctx.fillRect(x - 8 + i, y, 16 - i * 2, 1.4); }
  // wave lines: they get bigger and slower closer to the viewer
  ctx.lineCap = 'round';
  const sail = B.walking ? 1.8 : 1;
  for (let row = 0; row < 9; row++) {
    const p = row / 8, y = hz + 8 + p * p * (H - hz - 8);
    const len = 8 + p * 18, gap = 46 + p * 50, amp = 1.5 + p * 2.5;
    const off = ((t * (10 + p * 18) * sail) % gap + gap) % gap;
    ctx.strokeStyle = `rgba(255,255,255,${0.25 + p * 0.3})`; ctx.lineWidth = 1.2 + p * 1.6;
    ctx.beginPath();
    for (let x = -gap + off - (row % 2) * gap / 2; x < W + gap; x += gap) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + len / 2, y - amp, x + len, y); }
    ctx.stroke();
  }
}

// island outline: the coast follows shoreAt(), the far edge is a soft curve
function islandShape(inset, H) {
  const top = world.gFar - 6 + inset * 0.5;
  ctx.beginPath();
  ctx.moveTo(W + 20, top - 6);
  ctx.quadraticCurveTo(shoreAt(top) + 40, top - 8, shoreAt(top) + 10 + inset, top + 2);
  for (let y = top + 4; y <= H + 12; y += 5) ctx.lineTo(shoreAt(y) + inset + Math.sin(y * 0.11) * 2.4, y);
  ctx.lineTo(W + 20, H + 12);
  ctx.closePath();
}
const backCache = new Map();
function drawIsland(biome, L, b, H) {
  const [grass, sand] = ISLAND_GROUND[biome] || ISLAND_GROUND.forest;
  const top = world.gFar - 6, sx0 = shoreAt(top);
  // backdrop: a hill with the biome's trees and houses, sloping down to the coast
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(sx0 - 6, top + 4);
  ctx.bezierCurveTo(sx0 + 20, top - 40, sx0 + 40, top - 150, sx0 + 90, top - 190);
  ctx.lineTo(W + 20, top - 200); ctx.lineTo(W + 20, top + 4); ctx.closePath();
  ctx.clip();
  ctx.fillStyle = dark(b.far[0], 0.08);
  ctx.beginPath(); ctx.moveTo(sx0 - 10, top + 4); ctx.bezierCurveTo(sx0 + 10, top - 26, sx0 + 50, top - 46, W + 20, top - 54); ctx.lineTo(W + 20, top + 4); ctx.fill();
  strip(biome, 'mid', L.mid, top - LAYER_H.mid + 14, 0.02);
  ctx.restore();
  // beach and ground top
  islandShape(0, H);
  ctx.fillStyle = sand; ctx.fill();
  ctx.lineWidth = 2.6; ctx.strokeStyle = '#2a1a3e'; ctx.stroke();
  islandShape(14, H);
  const gg = ctx.createLinearGradient(0, top, 0, world.feet);
  gg.addColorStop(0, dark(grass, 0.18)); gg.addColorStop(0.5, grass); gg.addColorStop(1, light(grass, 0.12));
  ctx.fillStyle = gg; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = dark(grass, 0.3); ctx.stroke();
  // ground details (seeded, so they stay put), smaller when farther
  const R = rng(biome.length * 17 + 3);
  ctx.save(); islandShape(18, H); ctx.clip();
  for (let i = 0; i < 46; i++) {
    const z = R(), y = zToY(z) + R() * 10 - 4, x = shoreAt(y) + 20 + R() * (W - shoreAt(y));
    const s = 0.6 + z * 0.5;
    ctx.fillStyle = i % 3 ? dark(grass, 0.14) : light(grass, 0.2);
    ctx.beginPath();
    if (i % 3) { ctx.moveTo(x - 4 * s, y); ctx.lineTo(x - 2 * s, y - 6 * s); ctx.lineTo(x, y - 1); ctx.lineTo(x + 2 * s, y - 7 * s); ctx.lineTo(x + 4 * s, y); }
    else ctx.ellipse(x, y, 4 * s, 1.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // foam where the waves meet the beach
  const t = B.time;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.4; ctx.setLineDash([10, 7]); ctx.lineDashOffset = -t * 14;
  ctx.beginPath();
  for (let y = top + 6; y <= H + 10; y += 5) { const x = shoreAt(y) - 4 + Math.sin(t * 2 + y * 0.2) * 1.6; if (y === top + 6) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke();
  ctx.restore();
  void backCache;
}

function islandProps(biome) {
  return (ISLAND_PROPS[biome] || ISLAND_PROPS.forest).map(([kind, x, z]) => {
    const y = z < 0 ? world.gFar + 2 + z * 20 : zToY(z);
    return { kind, x, z, y, s: 0.55 + 0.25 * Math.max(0, Math.min(1, z + 0.2)) };
  });
}
function drawProp(pr, biome) {
  const sp = sprite('prop:' + biome + ':' + pr.kind, () => propSVG(pr.kind, biome), PROP_W * 0.7, PROP_H * 0.7, { lowres: true });
  if (!sp) return;
  const w = PROP_W * pr.s, h = PROP_H * pr.s;
  ctx.drawImage(sp.c, pr.x - w / 2, pr.y - h * (116 / 120), w, h);
}

const shipLeft = s => 158 - 200 * s.size;
function drawShip() {
  const s = SHIP[S.ships.cur] || SHIP.bote;
  const sp = sprite('ship:' + s.id, () => shipSVG(s), SHIP_W * s.size, SHIP_H * s.size);
  if (!sp) return;
  const bob = shipBob();
  const w = SHIP_W * s.size, h = SHIP_H * s.size;
  const x = shipLeft(s), y = world.deckY - SHIP_DECK * s.size + 4 * s.size + bob;
  // wake behind the ship
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.beginPath(); ctx.ellipse(x + w * 0.5, world.deckY + 26, w * 0.55, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(x + w / 2, y + h);
  ctx.rotate(Math.sin(B.time * 1.6 + 0.6) * 0.012);
  ctx.drawImage(sp.c, -w / 2, -h, w, h);
  ctx.restore();
}
function drawWaterFront() {
  // a translucent wave band over the bottom of the hull so the ship floats
  const t = B.time, wl = world.deckY + 26, s = SHIP[S.ships.cur] || SHIP.bote;
  const x0 = shipLeft(s) - 10, x1 = x0 + SHIP_W * s.size + 20;
  ctx.fillStyle = 'rgba(58,160,222,.9)';
  ctx.beginPath();
  ctx.moveTo(x0, wl + 40);
  for (let x = x0; x <= x1; x += 6) ctx.lineTo(x, wl + Math.sin(x * 0.08 + t * 3) * 2.2);
  ctx.lineTo(x1, wl + 40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 6) ctx.lineTo(x, wl + Math.sin(x * 0.08 + t * 3) * 2.2);
  ctx.stroke();
}

// ------------------------------------------------------------------ hero (chibi)
const HS = 0.64;
function drawHero() {
  const h = B.hero;
  const { key, p } = heroParts();
  const w = CW * HS, hh = CH * HS;
  const parts = {};
  for (const n of ['legB', 'legF', 'armB', 'body', 'armF']) parts[n] = sprite(key + ':' + n, p[n], w, hh, { flash: true });
  if (!parts.body) return;
  const t = B.time;
  let armA = 0, armB = 0, by = 0, lean = 0, rot = 0, oy = 0, alpha = 1, legA = 0;
  if (h.dead) {
    const d = Math.min(1, B.pt * 3);
    rot = -1.3 * d; oy = 4 * d; alpha = 1 - Math.max(0, B.pt - 1.2);
  } else if (B.phase === 'victory') {
    const j = Math.abs(Math.sin(B.pt * 6));
    oy = -j * 12; armA = -2.2; armB = 0.6; legA = 0.2 * j;
  } else if (h.anim > 0) {
    const pr = 1 - h.anim / h.animLen;
    if (pr < 0.4) armA = -1.5 * easeOut(pr / 0.4);
    else armA = -1.5 + 2.2 * easeOut(Math.min(1, (pr - 0.4) / 0.3));
    lean = pr > 0.4 ? 0.07 : -0.05; armB = -0.25;
  } else { by = Math.sin(t * 3.2) * 0.9; armA = Math.sin(t * 3.2) * 0.06; armB = -Math.sin(t * 3.2) * 0.06; }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(h.x, world.deckY + shipBob() + oy);
  ctx.rotate(rot + lean);
  ctx.scale(HS, HS);
  const ox = -50, oyy = -108;
  const flash = h.hurtT > 0;
  const part = (n, ang, piv) => {
    const sp = parts[n]; if (!sp) return;
    const img = flash && sp.flash ? sp.flash : sp.c;
    if (ang && piv) { ctx.save(); ctx.translate(piv[0] + ox, piv[1] + oyy); ctx.rotate(ang); ctx.drawImage(img, -piv[0], -piv[1], CW, CH); ctx.restore(); }
    else ctx.drawImage(img, ox, oyy, CW, CH);
  };
  part('armB', armB, CPIV.armB);
  part('legB', -legA, CPIV.legB);
  part('legF', legA, CPIV.legF);
  ctx.translate(0, by);
  part('body', 0);
  part('armF', armA, CPIV.armF);
  ctx.restore();
  const hy = world.deckY + shipBob();
  if (h.shield > 0) {
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.1 * Math.sin(t * 6);
    ctx.strokeStyle = '#8be0ff'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(139,224,255,.18)';
    ctx.beginPath(); ctx.ellipse(h.x, hy - 36, 40, 44, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  if (h.buffs.length) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.18 + 0.08 * Math.sin(t * 8);
    const ag = ctx.createRadialGradient(h.x, hy - 32, 10, h.x, hy - 32, 56);
    ag.addColorStop(0, '#ffd23f'); ag.addColorStop(1, 'rgba(255,210,63,0)');
    ctx.fillStyle = ag; ctx.fillRect(h.x - 66, hy - 98, 132, 104);
    ctx.restore();
  }
}

// ------------------------------------------------------------------ enemies
const ES = 0.52;
function drawBuilding(e) {
  const feet = gy(e);
  const sc = ES * e.scale, w = EW * sc, h = EH * sc;
  const sp = sprite('bld:' + e.kind + ':' + (e.tint || 0), () => buildingSVG(e.kind, e.tint || 0), w, h, { flash: true });
  if (!sp) return;
  const sh = e.flash > 0 ? Math.sin(e.t * 60) * 2 : 0;
  ctx.save();
  ctx.globalAlpha = e.alpha;
  ctx.beginPath(); ctx.rect(e.x - w, -1000, w * 2, feet + 4 + 1000); ctx.clip();
  ctx.translate(e.x + sh, feet + e.y);
  ctx.drawImage(e.flash > 0 && sp.flash ? sp.flash : sp.c, -68 * sc, -125 * sc, w, h);
  ctx.restore();
  if (e.state !== 'die') {
    const bw = 64, bx = e.x - bw / 2, byy = feet - h - 4;
    ctx.fillStyle = 'rgba(30,16,50,.8)'; rr(bx - 2, byy - 2, bw + 4, 10, 5); ctx.fill();
    ctx.fillStyle = '#ffb02e'; rr(bx, byy, bw * Math.max(0, e.hp / e.max), 6, 3); ctx.fill();
  }
}
function drawEnemy(e) {
  if (e.building) return drawBuilding(e);
  const feet = gy(e);
  const { key, p } = enemyParts(e);
  const sc = ES * e.scale;
  const w = EW * sc, h = EH * sc;
  const parts = {};
  for (const n of ['legB', 'legF', 'body', 'arm']) parts[n] = sprite(key + ':' + n, p[n], w, h, { flash: true });
  if (!parts.body) return;
  const t = e.t;
  let legA = 0, armA = 0, by = 0, lean = 0;
  if (e.state === 'walk') { legA = Math.sin(t * 10) * 0.45; by = -Math.abs(Math.sin(t * 10)) * 2.2; armA = Math.sin(t * 10) * 0.12; }
  else if (e.state === 'atk' || e.anim > 0) {
    const pr = 1 - Math.max(0, e.anim) / 0.42;
    if (pr < 0.55) armA = -0.95 * easeOut(pr / 0.55);
    else armA = -0.95 + 1.75 * easeOut(Math.min(1, (pr - 0.55) / 0.3));
    lean = pr > 0.55 ? -0.08 : 0.04;
  } else { by = Math.sin(t * 3) * 0.8; armA = Math.sin(t * 3) * 0.05; }
  ctx.save();
  ctx.globalAlpha = e.alpha;
  ctx.translate(e.x, feet + e.y);
  if (e.state === 'die') { ctx.translate(0, -h * 0.4); ctx.rotate(e.rot); ctx.translate(0, h * 0.4); }
  if (e.state === 'flee') ctx.scale(-1, 1);
  ctx.rotate(lean);
  const s = sc;
  ctx.scale(s, s);
  const ox = -68, oy = -125;
  const flash = e.flash > 0;
  const part = (n, ang, piv) => {
    const sp = parts[n]; if (!sp) return;
    const img = flash && sp.flash ? sp.flash : sp.c;
    if (ang && piv) {
      ctx.save();
      ctx.translate(piv[0] + ox, piv[1] + oy);
      ctx.rotate(ang);
      ctx.drawImage(img, -piv[0], -piv[1], EW, EH);
      ctx.restore();
    } else ctx.drawImage(img, ox, oy, EW, EH);
  };
  part('legB', -legA, PIV.legB);
  part('legF', legA, PIV.legF);
  ctx.translate(0, by / s);
  part('body', 0);
  part('arm', armA, PIV.arm);
  ctx.restore();
  // stunned: little stars spinning over the head
  if (e.stunT > 0 && e.state !== 'die') {
    ctx.fillStyle = '#ffe14a';
    for (let i = 0; i < 3; i++) { const a = B.time * 5 + i * 2.1; ctx.beginPath(); star(e.x + Math.cos(a) * 14, feet - h + 2 + Math.sin(a) * 4, 4.5, 2, 5); ctx.fill(); }
  }
  // hp bar
  if (e.state !== 'die' && e.state !== 'flee' && e.hp < e.max && !e.boss && !e.endless) {
    const bw = 40, bx = e.x - bw / 2, byy = feet - h - 8;
    ctx.fillStyle = 'rgba(30,16,50,.75)'; rr(bx - 1.5, byy - 1.5, bw + 3, 8, 4); ctx.fill();
    ctx.fillStyle = '#ff4d6d'; rr(bx, byy, bw * Math.max(0, e.hp / e.max), 5, 2.5); ctx.fill();
  }
}
const easeOut = t => 1 - (1 - t) * (1 - t);
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, Math.max(0, w), h, r) : ctx.rect(x, y, w, h); }

// ------------------------------------------------------------------ projectiles
function drawProjs() {
  for (const p of B.projs) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.kind === 'arrow') {
      ctx.strokeStyle = '#2a1a3e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(22, 0); ctx.stroke();
      ctx.strokeStyle = '#c98a4a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#d3dbe8'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(0, -4); ctx.lineTo(0, 4); ctx.fill();
      ctx.fillStyle = '#ff4d6d'; ctx.fillRect(18, -3, 5, 6);
    } else if (p.kind === 'slash') {
      ctx.rotate(Math.atan2(p.vy || 0, 1));
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = p.crit ? '#ffe680' : '#dff4ff';
      ctx.beginPath(); ctx.arc(-6, 0, 18, -1.1, 1.1); ctx.arc(-14, 0, 15, 1.0, -1.0, true); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(-16, 0, 16, -1.0, 1.0); ctx.arc(-22, 0, 14, 0.9, -0.9, true); ctx.closePath(); ctx.fill();
    } else if (p.kind === 'ball') {
      ctx.fillStyle = '#2a1a3e'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5a4a6a'; ctx.beginPath(); ctx.arc(-2, -2, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-12, 2, 5, 0, Math.PI * 2); ctx.arc(-20, 3, 4, 0, Math.PI * 2); ctx.fill();
    } else if (p.kind === 'pet' && p.proj === 'punch') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = p.col || '#ffffff'; ctx.lineWidth = 3; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(0, 0, 8, -1.2, 1.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(-6, 0, 6, -1.2, 1.2); ctx.stroke();
    } else if (p.kind === 'spit') {
      ctx.rotate(Math.sin(p.t * 20) * 0.2);
      ctx.fillStyle = '#2a1a3e'; ctx.beginPath(); ctx.ellipse(0, 0, 9.5, 7.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7ef09a'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 5.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.ellipse(-2, -2, 2.6, 1.6, -0.5, 0, Math.PI * 2); ctx.fill();
    } else {
      const col = p.kind === 'orbE' ? '#c55cff' : p.col || '#ffe14a';
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 14);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, col); g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ------------------------------------------------------------------ effects
function drawFx() {
  for (const f of B.fx) {
    const p = f.t / f.life;
    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.kind === 'hit' || f.kind === 'critHit') {
      const crit = f.kind === 'critHit', s = (f.s || 1) * (crit ? 1.35 : 1);
      ctx.rotate(f.rot || 0);
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = crit ? '#ffcf3a' : '#ffffff';
      const r1 = (10 + 26 * easeOut(p)) * s, r2 = r1 * 0.35;
      star(0, 0, r1, r2, crit ? 8 : 6);
      ctx.fill();
      if (crit) { ctx.fillStyle = '#fff'; star(0, 0, r1 * 0.55, r2 * 0.5, 8); ctx.fill(); }
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3 * (1 - p);
      ctx.beginPath(); ctx.arc(0, 0, r1 * 1.1, 0, Math.PI * 2); ctx.stroke();
    } else if (f.kind === 'poof') {
      ctx.globalAlpha = 0.85 * (1 - p);
      ctx.fillStyle = '#f4efff';
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2, d = 10 + 26 * easeOut(p);
        ctx.beginPath(); ctx.arc(Math.cos(a) * d * (f.s || 1), Math.sin(a) * d * 0.6 * (f.s || 1), (12 - 6 * p) * (f.s || 1), 0, Math.PI * 2); ctx.fill();
      }
    } else if (f.kind === 'aura' || f.kind === 'heal' || f.kind === 'revive') {
      const col = f.kind === 'heal' ? '#6fef8f' : f.kind === 'revive' ? '#ffe680' : f.col || '#ffd23f';
      ctx.globalAlpha = 1 - p;
      ctx.strokeStyle = col; ctx.lineWidth = 5 * (1 - p);
      ctx.beginPath(); ctx.ellipse(0, 30, 30 + 40 * p, 10 + 12 * p, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = col;
      for (let i = 0; i < 5; i++) { const a = i * 1.26 + f.t * 3; ctx.beginPath(); ctx.arc(Math.cos(a) * 28, 20 - p * 60 - i * 6, 3.2, 0, Math.PI * 2); ctx.fill(); }
    } else if (f.kind === 'shieldHit') {
      ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#bdf3ff'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0, 6, 50 + 8 * p, 44 + 8 * p, 0, -1, 1); ctx.stroke();
    } else if (f.kind === 'flames') {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - p;
      for (let i = 0; i < 9; i++) { const x = -170 + i * 42; const g = ctx.createRadialGradient(x, -10, 2, x, -10, 40); g.addColorStop(0, '#ffd23f'); g.addColorStop(0.5, '#ff6a2a'); g.addColorStop(1, 'rgba(255,90,40,0)'); ctx.fillStyle = g; ctx.fillRect(x - 40, -60, 80, 80); }
    } else if (f.kind === 'dodge') {
      ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#7ee0ff'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-10 - i * 8 - p * 20, -20 + i * 14); ctx.lineTo(-30 - i * 8 - p * 30, -20 + i * 14); ctx.stroke(); }
    } else if (f.kind === 'smoke') {
      ctx.globalAlpha = 0.8 * (1 - p); ctx.fillStyle = '#f4efff';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(8 + i * 7 + p * 20, -i * 3 - p * 14, (7 + i) * (0.6 + p), 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = Math.max(0, 1 - p * 3); ctx.fillStyle = '#ffcc3a'; ctx.beginPath(); ctx.arc(10, 0, 10, 0, Math.PI * 2); ctx.fill();
    } else if (f.kind === 'volley') {
      for (let i = 0; i < Math.max(3, f.hits.length); i++) {
        const [x, feetY] = f.hits[i] || [shoreAt(world.gmid) + 40 + i * 50, world.gmid];
        const q = Math.min(1, Math.max(0, (f.t - i * 0.06) / 0.35)), e2 = Math.max(0, (f.t - 0.35 - i * 0.06) / 0.5);
        if (q < 1) { ctx.fillStyle = '#2a1a3e'; ctx.beginPath(); ctx.arc(world.heroX + 30 + (x - world.heroX - 30) * q, world.deckY - 10 + (feetY - 30 - world.deckY + 10) * q - Math.sin(q * Math.PI) * 90, 6, 0, Math.PI * 2); ctx.fill(); }
        else if (e2 < 1) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, feetY - 30, 2, x, feetY - 30, 46 * (0.5 + e2)); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#ffb23f'); g.addColorStop(1, 'rgba(255,90,40,0)'); ctx.globalAlpha = 1 - e2; ctx.fillStyle = g; ctx.fillRect(x - 70, feetY - 100, 140, 140); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
      }
    } else if (f.kind === 'shock') {
      const col = f.col || '#ffcc3a';
      ctx.globalAlpha = 1 - p; ctx.strokeStyle = col; ctx.lineWidth = 8 * (1 - p);
      ctx.beginPath(); ctx.ellipse(0, 10, 30 + 340 * p, 20 + 120 * p, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 10, 10 + 260 * p, 8 + 90 * p, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (f.kind === 'slashX') {
      ctx.globalAlpha = 1 - p; ctx.strokeStyle = f.col || '#7ed957'; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.6, r = 40 + 20 * p; ctx.lineWidth = 7 * (1 - p) + 2; ctx.beginPath(); ctx.moveTo(-Math.cos(a) * r, -Math.sin(a) * r); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); }
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.6, r = 40 + 20 * p; ctx.beginPath(); ctx.moveTo(-Math.cos(a) * r, -Math.sin(a) * r); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); }
    } else if (f.kind === 'bolts') {
      ctx.globalAlpha = p < 0.2 ? 1 : 1 - (p - 0.2) / 0.8;
      ctx.strokeStyle = f.col || '#ffe14a'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
      for (const [x, gyv] of (f.xs.length ? f.xs : [[shoreAt(world.gmid) + 60, world.gmid]])) {
        ctx.beginPath(); let y = -10, xx = x; ctx.moveTo(xx, y);
        while (y < gyv - 20) { y += 22; xx = x + (Math.random() - 0.5) * 22; ctx.lineTo(xx, y); }
        ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.strokeStyle = f.col || '#ffe14a'; ctx.lineWidth = 4;
      }
    } else if (f.kind === 'burn') {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - p;
      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 34); g.addColorStop(0, '#ffd23f'); g.addColorStop(0.5, f.col || '#ff6a2a'); g.addColorStop(1, 'rgba(255,90,40,0)');
      ctx.fillStyle = g; ctx.fillRect(-40, -40 - p * 20, 80, 80);
    } else if (f.kind === 'petals') {
      ctx.globalAlpha = 1 - p * 0.8; ctx.fillStyle = f.col || '#ff8ab0';
      for (const [x, gyv] of (f.xs.length ? f.xs : [[shoreAt(world.gmid) + 60, world.gmid]])) {
        for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + f.t * 3; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 18, gyv - 30 + Math.sin(a) * 18, 6, 3, a, 0, Math.PI * 2); ctx.fill(); }
        ctx.strokeStyle = '#ffd2a6'; ctx.lineWidth = 4;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 14 + i * 9, gyv); ctx.lineTo(x - 12 + i * 8, gyv - 24 - 8 * Math.sin(p * Math.PI)); ctx.stroke(); }
      }
    } else if (f.kind === 'beam') {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
      const g = ctx.createLinearGradient(0, -16, 0, 16); g.addColorStop(0, 'rgba(126,224,255,0)'); g.addColorStop(0.5, f.col || '#7ee0ff'); g.addColorStop(1, 'rgba(126,224,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, -16, W, 32);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, -3, W, 6);
    } else if (f.kind === 'frost') {
      ctx.globalAlpha = 1 - p; ctx.fillStyle = f.col || '#a0e6ff'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      for (const [x, gyv] of (f.xs.length ? f.xs : [[shoreAt(world.gmid) + 60, world.gmid]])) {
        for (let i = 0; i < 5; i++) { const xx = x - 20 + i * 10, hgt = 16 + (i % 2) * 14; ctx.beginPath(); ctx.moveTo(xx - 6, gyv); ctx.lineTo(xx, gyv - hgt * Math.min(1, p * 4)); ctx.lineTo(xx + 6, gyv); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      }
    } else if (f.kind === 'lvup') {
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = f.col || '#7dff6a';
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; const d = 20 + 46 * easeOut(p); ctx.beginPath(); ctx.arc(Math.cos(a) * d, -20 + Math.sin(a) * d, 3.4 * (1 - p * 0.6), 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = f.col || '#7dff6a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 28, 26 + 26 * p, 8 + 6 * p, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
}
function star(x, y, r1, r2, n) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = i * Math.PI / n - Math.PI / 2; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  ctx.closePath();
}

function drawDrops() {
  const coin = sprite('ic:coin', icon('coin'), 16, 16);
  const gem = sprite('ic:gem', icon('gem'), 18, 18);
  for (const d of B.drops) {
    const s = d.kind === 'gem' ? gem : coin;
    if (!s) continue;
    const sz = d.kind === 'gem' ? 18 : 15;
    const spin = d.kind === 'coin' ? Math.abs(Math.cos(d.t * 9)) * 0.7 + 0.3 : 1;
    ctx.drawImage(s.c, d.x - sz * spin / 2, d.y - sz / 2, sz * spin, sz);
  }
}

function drawTexts() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  for (const t of B.texts) {
    const p = t.t / t.life;
    const pop = t.t < 0.12 ? 1 + 0.5 * (1 - t.t / 0.12) : 1;
    ctx.globalAlpha = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
    ctx.font = `${Math.round(t.size * pop)}px "Lilita One", "Nunito", sans-serif`;
    ctx.lineWidth = t.size > 22 ? 6 : 5;
    ctx.strokeStyle = '#2a1a3e';
    ctx.strokeText(t.v, t.x, t.y);
    ctx.fillStyle = t.col;
    ctx.fillText(t.v, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
export { hexA };
