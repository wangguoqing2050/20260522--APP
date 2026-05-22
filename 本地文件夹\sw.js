// Service Worker - 打卡记录器离线缓存
var CACHE_NAME = 'punch-clock-v2';
var urlsToCache = [
  '.',
  'index.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache).catch(function(err) {
        console.log('SW 缓存失败（可忽略）:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // 跳过云开发 SDK CDN 请求（让浏览器直接加载）
  if (event.request.url.indexOf('static.cloudbase.net') > -1) return;
  // 跳过 Chrome 扩展等非 HTTP 请求
  if (event.request.url.indexOf('chrome-extension') > -1) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        // 只缓存同源请求
        if (response && response.status === 200 && event.request.url.indexOf(self.location.origin) === 0) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }).catch(function() {
      // 离线时返回缓存
      return caches.match(event.request);
    })
  );
});
