const CACHE_NAME = 'faithconnect-v1.0.0';
const STATIC_CACHE = 'faithconnect-static-v1.0.0';
const DYNAMIC_CACHE = 'faithconnect-dynamic-v1.0.0';
const API_CACHE = 'faithconnect-api-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/categories/',
  '/api/businesses/',
  '/api/auth/user/',
  '/api/businesses/services/',
  '/api/businesses/products/'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static file requests
  if (url.origin === self.location.origin) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle external requests (images, fonts, etc.)
  event.respondWith(handleExternalRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'No internet connection',
        message: 'Please check your connection and try again'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static file requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Cache and network failed', error);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    // Return empty response for other static files
    return new Response('', { status: 404 });
  }
}

// Handle external requests (images, fonts, etc.)
async function handleExternalRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: External request failed', error);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return empty response
    return new Response('', { status: 404 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData.length === 0) {
      console.log('Service Worker: No offline data to sync');
      return;
    }
    
    console.log('Service Worker: Syncing offline data', offlineData.length, 'items');
    
    // Process each offline action
    for (const data of offlineData) {
      try {
        await processOfflineAction(data);
        await removeOfflineData(data.id);
      } catch (error) {
        console.error('Service Worker: Error syncing offline action', error);
      }
    }
    
    console.log('Service Worker: Offline sync completed');
  } catch (error) {
    console.error('Service Worker: Error in background sync', error);
  }
}

// Process individual offline action
async function processOfflineAction(data) {
  const { type, payload, url, method } = data;
  
  try {
    const response = await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('Service Worker: Successfully synced', type);
    return response;
  } catch (error) {
    console.error('Service Worker: Failed to sync', type, error);
    throw error;
  }
}

// Get authentication token from IndexedDB
async function getAuthToken() {
  // This would be implemented to get the stored auth token
  // For now, return null (the backend should handle unauthenticated requests)
  return null;
}

// Get offline data from IndexedDB
async function getOfflineData() {
  // This would be implemented to get stored offline actions
  // For now, return empty array
  return [];
}

// Remove processed offline data
async function removeOfflineData(id) {
  // This would be implemented to remove processed offline actions
  console.log('Service Worker: Removing offline data', id);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'FaithConnect',
    body: 'New notification from FaithConnect',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  // Parse notification data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      // If not JSON, treat as text
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncOfflineNotifications());
  }
});

// Sync offline notifications when connection is restored
async function syncOfflineNotifications() {
  try {
    // Get stored offline notifications from IndexedDB
    const notifications = await getOfflineNotifications();
    
    if (notifications.length === 0) {
      console.log('Service Worker: No offline notifications to sync');
      return;
    }
    
    console.log('Service Worker: Syncing offline notifications', notifications.length);
    
    for (const notification of notifications) {
      try {
        // Show the notification
        await self.registration.showNotification(notification.title, notification.options);
        
        // Remove from offline storage
        await removeOfflineNotification(notification.id);
        
        console.log('Service Worker: Successfully synced notification:', notification.title);
      } catch (error) {
        console.error('Service Worker: Error syncing notification:', error);
      }
    }
    
    console.log('Service Worker: Offline notification sync completed');
  } catch (error) {
    console.error('Service Worker: Error in offline notification sync:', error);
  }
}

// Store notification for offline delivery
async function storeOfflineNotification(notification) {
  // This would be implemented to store notifications in IndexedDB
  // For now, we'll use a simple approach
  console.log('Service Worker: Storing offline notification:', notification.title);
}

// Get offline notifications
async function getOfflineNotifications() {
  // This would be implemented to get stored notifications from IndexedDB
  // For now, return empty array
  return [];
}

// Remove offline notification
async function removeOfflineNotification(id) {
  // This would be implemented to remove stored notification from IndexedDB
  console.log('Service Worker: Removing offline notification:', id);
}

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});
