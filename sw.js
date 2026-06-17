const CACHE_NAME = "wechat-sticker-deck-v4";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./assets/arrange-cursor.png",
  "./ppt-faithful/media/media1.mp4",
  "./ppt-faithful/media/slide-033-poster.png",
];

const SLIDE_ASSETS = Array.from({ length: 65 }, (_, index) => {
  const page = String(index + 1).padStart(3, "0");
  return `./rendered-webp/slide-${page}.webp`;
});

const FRAME_ASSETS = ["016", "017", "018", "023", "024", "025", "026", "027", "028", "029"]
  .map((page) => `./rendered-webp-frame-base/slide-${page}.webp`);

const ALL_ASSETS = [...CORE_ASSETS, ...SLIDE_ASSETS, ...FRAME_ASSETS];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ALL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
