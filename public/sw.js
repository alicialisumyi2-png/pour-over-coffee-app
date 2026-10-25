const CACHE_NAME = 'pour-over-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  const url = new URL(request.url)
  const isNavigation = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')
  const isAsset = url.pathname.startsWith('/assets/')

  if (isNavigation || isAsset) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME)
      try {
        const response = await fetch(request)
        if (response.ok) await cache.put(request, response.clone())
        return response
      } catch {
        return (await cache.match(request)) || (isNavigation ? await cache.match('/index.html') : undefined) || Response.error()
      }
    })())
    return
  }

  event.respondWith((async () => {
    const cached = await caches.match(request)
    if (cached) return cached
    try {
      const response = await fetch(request)
      if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone())
      return response
    } catch {
      return (await caches.match('/index.html')) || Response.error()
    }
  })())
})
