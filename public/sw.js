const CACHE_NAME = "currency-converter-v2"
const STATIC_CACHE = "static-v2"
const DYNAMIC_CACHE = "dynamic-v2"
const API_CACHE = "api-v2"

const urlsToCache = ["/", "/dashboard", "/manifest.json", "/icon-192.jpg", "/icon-512.jpg"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - network first for API, cache first for static
self.addEventListener("fetch", (event) => {
  const { request } = event

  // API requests - network first, fallback to cache
  if (request.url.includes("api.exchangerate-api.com")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline fallback data
            return new Response(
              JSON.stringify({
                rates: { BRL: 5.0, EUR: 0.85, GBP: 0.73, JPY: 110 },
                base: "USD",
                date: new Date().toISOString(),
              }),
              {
                headers: { "Content-Type": "application/json" },
              },
            )
          })
        }),
    )
    return
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === "error") {
          return response
        }

        const responseClone = response.clone()
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone)
        })

        return response
      })
    }),
  )
})

// Background sync for offline conversions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-conversions") {
    event.waitUntil(syncConversions())
  }
})

async function syncConversions() {
  // Sync offline conversions when back online
  console.log("Syncing offline conversions...")
}

// Push notifications for price alerts
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "Alerta de Preço"
  const options = {
    body: data.body || "Uma moeda atingiu o preço alvo",
    icon: "/icon-192.jpg",
    badge: "/icon-192.jpg",
    data: data.url,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data || "/dashboard/watchlist"))
})
