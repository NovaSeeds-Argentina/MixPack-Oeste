/* NOVA Seeds — PWA con caché acotada al sitio y navegación sin conexión. */
const CACHE_NAME = 'nova-oeste-shell-2026-11-v51';
const APP_SHELL = [
  "./",
  "./index.html",
  "./tutorial.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/pwa.js",
  "./manifest.webmanifest",
  "./img/00.png",
  "./img/01.webp",
  "./img/02.webp",
  "./img/02Genext/01/Front.jpg",
  "./img/02Genext/01/Front2.jpg",
  "./img/02Genext/01/foto1.webp",
  "./img/02Genext/01/foto2.jpg",
  "./img/02Genext/01/foto3.jpg",
  "./img/02Genext/01/foto4.jpg",
  "./img/02Genext/01/x2.webp",
  "./img/02Genext/02/Front.jpg",
  "./img/02Genext/02/Front2.jpg",
  "./img/02Genext/02/foto1.webp",
  "./img/02Genext/02/foto2.jpg",
  "./img/02Genext/02/foto3.jpg",
  "./img/02Genext/02/foto4.jpg",
  "./img/02Genext/02/x1.webp",
  "./img/02Genext/03/foto1.webp",
  "./img/02Genext/03/front.webp",
  "./img/02Genext/03/front2.webp",
  "./img/03.webp",
  "./img/Atras.png",
  "./img/ChatGPT Image 7 feb 2026, 10_44_40 p.m..webp",
  "./img/andreani.png",
  "./img/app2.webp",
  "./img/bsf-mixpack.webp",
  "./img/bsf-bank.svg",
  "./img/cf1.png",
  "./img/correo-argentino.jpg",
  "./img/fondo-germinacion.webp",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/logo.webp",
  "./img/red-line/logo.webp",
  "./img/red-line/portada.webp",
  "./img/red-line/detalle.webp"
];
const SCOPE = new URL(self.registration.scope);
const absolute = path => new URL(path, SCOPE).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL.map(path => new Request(absolute(path), {cache: 'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('nova-oeste-shell-') && key !== CACHE_NAME) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  const navigation = req.mode === 'navigate';
  const networkFirst = navigation || ['script', 'style', 'manifest'].includes(req.destination);
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (!networkFirst) {
      const hit = await cache.match(req);
      if (hit) return hit;
    }
    try {
      const response = await fetch(req, networkFirst ? {cache: 'no-cache'} : {});
      if (response.ok && response.type === 'basic') await cache.put(req, response.clone());
      return response;
    } catch (error) {
      const hit = await cache.match(req, {ignoreSearch: navigation});
      if (hit) return hit;
      if (navigation) {
        const page = url.pathname.endsWith('/tutorial.html') ? './tutorial.html' : './index.html';
        const fallback = await cache.match(absolute(page));
        if (fallback) return fallback;
      }
      return new Response('Sin conexión', {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
    }
  })());
});
