async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open("MyCache_1");
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.match(/^\/inbox/)) {
    event.respondWith(networkFirst(event.request));
  }
});

self.addEventListener('push', event => {
    console.log('addEventListener push', event);
    const message = event.data.json();
    const options = {
        body: message.body,
        icon: message.icon, // Replace with your icon path
    };
    // バッジを設定またはクリアする
    if (navigator.setAppBadge) {
        const unreadCount = message.unreadCount;
        if (unreadCount && unreadCount > 0) {
            navigator.setAppBadge(unreadCount);
        } else {
            navigator.clearAppBadge();
        }
    }
    event.waitUntil(
        self.registration.showNotification('個展なび', options)
    );
});

self.addEventListener('notificationclick', event => {
    console.log('addEventListener notificationclick', event);
    event.notification.close();
    // Handle the click action, e.g., open a specific URL
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientsArr => {
            if (clientsArr[0]) {
                clientsArr[0].focus(); // Focus the existing window
            } else {
                clients.openWindow('/'); // Open a new window
            }
        })
    );
});

self.addEventListener('install', (event) => {
    console.log('addEventListener install', event);
});
