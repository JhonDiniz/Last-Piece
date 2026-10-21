// Service worker: makes the game work offline after the first visit.
// Strategy: serve from cache right away and refresh the cache in the
// background (stale-while-revalidate). Bump VERSION to force a full refresh.
const VERSION = 'rg-v1.1.1';
const CORE = ['./', './index.html', './css/base.css', './css/ui.css', './css/screens.css', './js/main.js', './manifest.webmanifest',
  './assets/fonts/lilita-one.woff2', './assets/fonts/nunito-800.woff2', './assets/fonts/nunito-900.woff2', './assets/icons/icon-192.png',
  './assets/pets/luffy.png', './assets/pets/zoro.png', './assets/pets/nami.png', './assets/pets/sanji.png', './assets/pets/chopper.png', './assets/pets/robin.png', './assets/pets/franky.png', './assets/pets/brook.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
