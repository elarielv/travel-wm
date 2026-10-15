// 京阪神行程 App - Service Worker
// 策略：Network falling back to cache（優先抓最新版本，離線或斷線時改用快取版本）
// 這個檔案只有部署到 GitHub Pages（https）並放在跟 index.html 同一層目錄時才會運作，
// 直接用 file:// 打開 index.html 不會用到這個檔案，主頁面會自動偵測並略過註冊。

const CACHE_NAME = 'kansai-trip-v3';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
if (new URL(e.request.url).hostname.indexOf('firestore.googleapis.com') !== -1) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
