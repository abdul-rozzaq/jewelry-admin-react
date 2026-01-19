// Service Worker for Push Notifications

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting(); // Immediately replace the previous version
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(self.clients.claim()); // Become the active service worker immediately
});

// Push event - Handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  let notificationData = {};

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: "Yangi bildirishnoma",
        body: event.data.text() || "Yangi xabar mavjud",
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
      };
    }
  } else {
    notificationData = {
      title: "Jewelry Admin",
      body: "Yangi bildirishnoma mavjud",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
    };
  }

  const notificationOptions = {
    body: notificationData.body || "Yangi xabar",
    icon: notificationData.icon || "/pwa-192x192.png",
    badge: notificationData.badge || "/pwa-192x192.png",
    image: notificationData.image,
    data: notificationData.data || {},
    tag: notificationData.tag || "default",
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || [
      {
        action: "view",
        title: "Ko'rish",
        icon: "/pwa-192x192.png",
      },
      {
        action: "close",
        title: "Yopish",
        icon: "/pwa-192x192.png",
      },
    ],
    silent: false,
    timestamp: Date.now(),
  };

  event.waitUntil(self.registration.showNotification(notificationData.title || "Jewelry Admin", notificationOptions));
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === "close") {
    // User clicked close, do nothing
    return;
  }

  // Handle different actions
  let urlToOpen = "/";

  if (action === "view" && notificationData.url) {
    urlToOpen = notificationData.url;
  } else if (notificationData.url) {
    urlToOpen = notificationData.url;
  } 

  // Focus or open the app
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If there's an existing window, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          if (urlToOpen !== "/") {
            client.navigate(urlToOpen);
          }
          return;
        }
      }

      // If no existing window, open a new one
      return self.clients.openWindow(self.location.origin + urlToOpen);
    }),
  );
});

// Notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event);

  // You can track notification dismissals here
  // Send analytics data if needed
});

// Background sync for offline push handling
self.addEventListener("sync", (event) => {
  if (event.tag === "push-sync") {
    console.log("Background sync for push notifications");
    // Handle queued push notifications when back online
  }
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch event for caching and offline support
self.addEventListener("fetch", (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for navigation requests when offline
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
      }),
  );
});
