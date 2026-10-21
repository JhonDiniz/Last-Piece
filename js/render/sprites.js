// Rasterizes SVG strings into canvases (once) so the battle can draw them fast.
let scale = 2;                 // device pixels per logical unit
const cache = new Map();       // key -> {c, flash?}
const loading = new Map();     // key -> promise

export function setScale(s) {
  s = Math.max(0.5, Math.min(4, s));
  if (Math.abs(s - scale) / scale > 0.12) { scale = s; cache.clear(); loading.clear(); }
}
export const getScale = () => scale;

// An SVG drawn via <img> cannot load external files, so PNG hrefs are inlined first.
const dataUrls = new Map();
function inlineImages(str) {
  const urls = [...new Set([...str.matchAll(/href="(assets\/[^"]+)"/g)].map(m => m[1]))];
  return Promise.all(urls.map(u => {
    if (!dataUrls.has(u)) dataUrls.set(u, fetch(u).then(r => r.blob()).then(b => new Promise(ok => {
      const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b);
    })));
    return dataUrls.get(u).then(d => { str = str.split(`href="${u}"`).join(`href="${d}"`); });
  })).then(() => str);
}

export function rasterize(svgStr, w, h, sc = scale) {
  return inlineImages(svgStr).then(str => rasterizeSvg(str, w, h, sc));
}
function rasterizeSvg(svgStr, w, h, sc) {
  const pw = Math.max(1, Math.round(w * sc)), ph = Math.max(1, Math.round(h * sc));
  const s = svgStr.replace('<svg ', `<svg width="${pw}" height="${ph}" preserveAspectRatio="none" `);
  const url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' }));
  const img = new Image();
  img.src = url;
  return img.decode().then(() => {
    const c = document.createElement('canvas');
    c.width = pw; c.height = ph;
    c.getContext('2d').drawImage(img, 0, 0, pw, ph);
    URL.revokeObjectURL(url);
    return c;
  }).catch(e => { URL.revokeObjectURL(url); console.warn('raster fail', e, s.slice(0, 300)); return null; });
}

function whiteOf(c) {
  const f = document.createElement('canvas');
  f.width = c.width; f.height = c.height;
  const x = f.getContext('2d');
  x.drawImage(c, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, f.width, f.height);
  return f;
}

// returns the cached sprite or null while it is still loading
export function sprite(key, make, w, h, opts = {}) {
  const k = key + '@' + w + 'x' + h;
  const hit = cache.get(k);
  if (hit) return hit;
  if (!loading.has(k)) {
    const sc = opts.lowres ? Math.min(scale, 2) : scale;
    const p = rasterize(typeof make === 'function' ? make() : make, w, h, sc).then(c => {
      if (c) cache.set(k, { c, w, h, flash: opts.flash ? whiteOf(c) : null });
      return cache.get(k);
    });
    loading.set(k, p);
  }
  return null;
}
export function spriteAsync(key, make, w, h, opts = {}) {
  const s = sprite(key, make, w, h, opts);
  if (s) return Promise.resolve(s);
  return loading.get(key + '@' + w + 'x' + h);
}
