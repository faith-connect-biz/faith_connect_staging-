# Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. CSS MIME Type Error
**Error**: `The stylesheet was not loaded because its MIME type, "text/html", is not "text/css"`

**Causes**:
- Server not configured to serve CSS files with correct MIME type
- Assets being served through wrong route
- Service Worker intercepting CSS requests incorrectly

**Solutions**:
- ✅ Updated `vercel.json` with proper MIME type headers
- ✅ Modified Service Worker to handle CSS files correctly
- ✅ Updated Vite config to prevent asset inlining issues

### 2. JavaScript Module Loading Failure
**Error**: `Failed to load module with source "https://www.faithconnect.biz/assets/index-DoDY_uYn.js"`

**Causes**:
- Service Worker intercepting critical asset requests
- Build output not generating proper asset files
- Network issues during asset loading

**Solutions**:
- ✅ Updated Service Worker to use network-first strategy for critical assets
- ✅ Added proper error handling in Service Worker registration
- ✅ Created production build script with verification

### 3. Service Worker Errors
**Error**: `A ServiceWorker intercepted the request and encountered an unexpected error`

**Causes**:
- Service Worker caching strategy conflicts
- Unhandled errors in Service Worker code
- Registration issues

**Solutions**:
- ✅ Added comprehensive error handling in Service Worker
- ✅ Created separate registration script with fallback
- ✅ Implemented proper cache management

## Deployment Steps

### For Vercel:
1. Run `npm run build:prod` to create production build
2. Deploy using Vercel CLI or GitHub integration
3. Verify assets are served with correct MIME types

### For Other Platforms:
1. Ensure server is configured to serve static files with correct MIME types
2. Update server configuration to handle SPA routing
3. Test Service Worker functionality

## Verification Checklist

- [ ] CSS files load without MIME type errors
- [ ] JavaScript modules load successfully
- [ ] Service Worker registers without errors
- [ ] Assets are cached properly
- [ ] Offline functionality works
- [ ] PWA features function correctly

## Debug Commands

```bash
# Check build output
npm run build:prod

# Test locally
npm run preview

# Check Service Worker
# Open DevTools > Application > Service Workers

# Clear all caches
# DevTools > Application > Storage > Clear storage
```

## Emergency Fallback

If Service Worker causes issues:
1. Unregister Service Worker in DevTools
2. Clear all caches
3. Reload page
4. Service Worker will be disabled automatically if registration fails
