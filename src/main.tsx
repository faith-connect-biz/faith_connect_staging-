import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ==========================================
// Console Log Management
// ==========================================
// Override console.log globally while keeping error, warn, and API logs
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;
const originalDebug = console.debug;

// Store API logs
const apiLogs: string[] = [];

// Function to detect API-related logs
const isApiLog = (args: any[]): boolean => {
  const logMessage = args.map(arg => 
    typeof arg === 'string' ? arg : JSON.stringify(arg)
  ).join(' ');
  
  return logMessage.includes('[API]') || 
         logMessage.includes('API request') || 
         logMessage.includes('API response') ||
         logMessage.includes('Response status:') ||
         logMessage.includes('Request to:') ||
         logMessage.includes('API Configuration') ||
         logMessage.includes('Token expired') ||
         logMessage.includes('refresh token') ||
         logMessage.includes('Adding auth token') ||
         logMessage.includes('Public endpoint') ||
         logMessage.includes('New access token') ||
         logMessage.includes('Token refreshed') ||
         logMessage.includes('GET /') ||
         logMessage.includes('POST /') ||
         logMessage.includes('PUT /') ||
         logMessage.includes('PATCH /') ||
         logMessage.includes('DELETE /') ||
         logMessage.includes('SW registered') ||
         logMessage.includes('Service Worker');
};

// Override console.log
console.log = function(...args: any[]) {
  // Only show API logs in development
  if (isApiLog(args)) {
    if (import.meta.env.DEV) {
      originalLog.apply(console, args);
    }
    return;
  }
  
  // Suppress all other logs (they're never shown)
};

// Keep console.error and console.warn intact
console.error = originalError;
console.warn = originalWarn;

// Optional: Override console.info and console.debug (only show in development)
console.info = function(...args: any[]) {
  if (isApiLog(args) && import.meta.env.DEV) {
    originalInfo.apply(console, args);
  }
};

console.debug = function(...args: any[]) {
  if (isApiLog(args) && import.meta.env.DEV) {
    originalDebug.apply(console, args);
  }
};

// ==========================================
// End Console Log Management
// ==========================================

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
