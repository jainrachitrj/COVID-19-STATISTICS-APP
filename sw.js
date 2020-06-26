const staticAssets = [
  "./",
  "./index.html",
  "./news.html",
  "./assets/main.css",
  "./assets/icon_192.png",
  "./assets/icon_512.png",
  "./assets/script.js",
  "./manifest.json",
  "./registerSw.js",
  "./sw.js",
  "./assets/icon.ico",
  "./assets/search-icon.png",
  "./assets/search-icon.svg",
  "./assets/important.js",
];

self.addEventListener("install", async (e) => {
  const cache = caches.open("static");
  (await cache).addAll(staticAssets);
  return self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  self.clients.claim();
});

self.addEventListener("fetch", async (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(req));
  } else {
    e.respondWith(networkAndCache(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open("static");
  const cached = await cache.match(req);
  return cached || fetch(req);
}

async function networkAndCache(req) {
  const cache = await caches.open("static");
  try {
    const fresh = await fetch(req);
    await cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return cached;
  }
}
