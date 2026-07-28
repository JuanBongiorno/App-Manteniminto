const CACHE_NAME = 'suragua-v1';
const ASSETS = [
  './',
  './index.html',
  './logo.png',
  './fondo.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache abierto, agregando recursos...');
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});

// Background Sync: cuando el navegador despierte el SW, solicitamos al cliente
// que ejecute la sincronización completa (la lógica usa el cliente que ya conoce Supabase).
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pedidos') {
    event.waitUntil((async () => {
      const allClients = await clients.matchAll({ includeUncontrolled: true, type: 'window' });
      if (allClients && allClients.length > 0) {
        for (const client of allClients) {
          client.postMessage({ type: 'RUN_SYNC' });
        }
      } else {
        // Intentar abrir la app para despertar el contexto y que procese la cola
        try {
          await clients.openWindow('/');
        } catch (e) {
          // No se pudo abrir ventana, no hay mucho más que hacer desde el SW
          console.warn('No client to message and openWindow failed', e);
        }
      }
    })());
  }
});