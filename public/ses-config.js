// SES (Secure EcmaScript) Configuration
// This script helps suppress non-critical SES lockdown warnings in production

(function() {
  'use strict';
  
  // Only run in production environment
  if (window.location.hostname === 'www.faithconnect.biz' || 
      window.location.hostname === 'faithconnect.biz') {
    
    // Suppress SES lockdown warnings in production
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    console.warn = function(...args) {
      const message = args[0];
      
      // Filter out SES lockdown warnings
      if (typeof message === 'string' && 
          (message.includes('SES') || 
           message.includes('lockdown') || 
           message.includes('Removing unpermitted intrinsics') ||
           message.includes('toTemporalInstant'))) {
        // Suppress these warnings in production
        return;
      }
      
      // Allow other warnings to pass through
      originalConsoleWarn.apply(console, args);
    };
    
    console.error = function(...args) {
      const message = args[0];
      
      // Filter out SES-related errors that are not critical
      if (typeof message === 'string' && 
          (message.includes('SES') || 
           message.includes('lockdown'))) {
        // Suppress these errors in production
        return;
      }
      
      // Allow other errors to pass through
      originalConsoleError.apply(console, args);
    };
    
    console.log('🔒 SES lockdown warnings suppressed in production');
  }
})();
