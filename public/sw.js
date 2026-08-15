// Kidoz Service Worker — offline-capable PWA cache
// Cache strategy:
//  - HTML navigations: NetworkFirst (always try fresh, fall back to cache → offline page)
//  - Static assets (JS/CSS/img/fonts): StaleWhileRevalidate
//  - Same-origin API responses are NOT cached (avoid stale data)

const CACHE_VERSION = 'kidoz-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const HTML_CACHE = `${CACHE_VERSION}-html`;
const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/robots.txt',
  '/sitemap.xml',
];

// Offline fallback HTML (inline to avoid extra fetch)
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sem ligação — Kidoz</title>
  <style>
    *{margin:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;display:flex;min-height:100dvh;align-items:center;justify-content:center;background:#fdf8ee;color:#1e293b;text-align:center;padding:1.5rem}
    .card{max-width:22rem;padding:2rem;border-radius:1.5rem;border:2px solid #fed7aa;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,.06)}
    h1{font-size:1.5rem;font-weight:700;margin-bottom:.5rem}
    p{font-size:.875rem;color:#64748b;margin-bottom:1rem}
    button{display:inline-flex;align-items:center;justify-content:center;padding:.625rem 1.25rem;border-radius:1rem;border:2px solid #ff8c42;background:#ff8c42;color:#fff;font-weight:600;font-size:.875rem;cursor:pointer}
    button:hover{background:#e67a30}
  </style>
</head>
<body>
  <div class="card">
    <h1>📴 Sem ligação à internet</h1>
    <p>Parece que estás offline. Verifica a tua ligação e tenta de novo.</p>
    <button onclick="window.location.reload()">Tentar de novo</button>
  </div>
</body>
</html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Skip API, auth, server functions
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_serverFn') || url.pathname.startsWith('/_server')) return;

  // HTML navigations → network-first with offline fallback
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(HTML_CACHE);
        cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        // Return styled offline page
        return new Response(OFFLINE_HTML, {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
        });
      }
    })());
    return;
  }

  // Assets → stale-while-revalidate
  if (/\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|svg|webp|ico|webmanifest)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
        return res;
      }).catch(() => null);
      return cached || (await network) || new Response('', { status: 504 });
    })());
  }
});
