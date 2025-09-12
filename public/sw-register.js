// Service Worker Registration with Error Handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, refresh the page
              if (confirm('New version available! Refresh to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      // Handle service worker errors
      navigator.serviceWorker.addEventListener('error', (event) => {
        console.error('Service Worker error:', event);
      });
      
      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Service Worker message:', event.data);
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      
      // If service worker fails, try to unregister it
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
        console.log('Service Worker unregistered due to errors');
      } catch (unregisterError) {
        console.error('Failed to unregister Service Worker:', unregisterError);
      }
    }
  });
} else {
  console.log('Service Worker not supported');
}
