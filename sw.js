/* Offline cache for the gym diary: the app shell first, then the readers for coach programmes (PDF, Word, Excel, photo OCR). */
const V = 'zhelezo-e3734384ec';
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "nunito-cyrillic.woff2", "nunito-latin.woff2", "unbounded-cyrillic.woff2", "unbounded-latin.woff2"];
const EXTRA = ["pdf.min.js", "pdf.worker.min.js", "mammoth.browser.min.js", "xlsx.full.min.js", "tesseract.min.js", "worker.min.js", "tesseract-core-simd-lstm.wasm.js", "tesseract-core-lstm.wasm.js", "rus.traineddata.gz", "eng.traineddata.gz"];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(CORE);
    await Promise.all(EXTRA.map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(V);
    const hit = await c.match(r, { ignoreSearch: true }) || (r.mode === 'navigate' ? await c.match('index.html') : null);
    if (hit) return hit;
    try {
      const res = await fetch(r);
      if (res.ok) c.put(r, res.clone());
      return res;
    } catch (err) {
      return Response.error();
    }
  })());
});
