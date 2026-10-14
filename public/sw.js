const VERSION = 'decofleur-pwa-v2';
const SHELL = `${VERSION}-shell`;
const STATIC = `${VERSION}-static`;
const SHELL_URLS = ['/offline.html', '/icons/icon.svg', '/icons/icon-maskable.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith('decofleur-pwa-') && key !== SHELL && key !== STATIC)
      .map((key) => caches.delete(key)),
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // In local development, never cache or intercept assets to ensure HMR and live updates
  const isLocalhost = Boolean(
    self.location.hostname === 'localhost' ||
    self.location.hostname === '[::1]' ||
    self.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );
  if (isLocalhost) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match('/offline.html')) || Response.error(),
    ));
    return;
  }

  const isImmutableAsset = url.pathname.startsWith('/_next/static/');
  const isRevalidatableAsset = url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/');
  if (!isImmutableAsset && !isRevalidatableAsset) return;

  event.respondWith(caches.open(STATIC).then(async (cache) => {
    const cached = await cache.match(request);
    if (isImmutableAsset && cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
      return response;
    } catch (error) {
      if (cached) return cached;
      throw error;
    }
  }));
});
