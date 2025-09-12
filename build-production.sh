#!/bin/bash

# Production Build Script for FaithConnect
echo "🚀 Starting production build for FaithConnect..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -d "dist" ]; then
    echo "✅ Build directory created successfully"
    
    # Check for critical files
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html found"
    else
        echo "❌ index.html not found"
        exit 1
    fi
    
    # Check for assets directory
    if [ -d "dist/assets" ]; then
        echo "✅ Assets directory found"
        echo "📊 Assets in dist/assets/:"
        ls -la dist/assets/
    else
        echo "❌ Assets directory not found"
        exit 1
    fi
    
    # Check for service worker
    if [ -f "dist/sw.js" ]; then
        echo "✅ Service Worker found"
    else
        echo "❌ Service Worker not found"
        exit 1
    fi
    
    echo "🎉 Build completed successfully!"
    echo "📁 Build output: dist/"
    echo "📊 Build size:"
    du -sh dist/
    
else
    echo "❌ Build failed - dist directory not created"
    exit 1
fi
