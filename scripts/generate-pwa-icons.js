import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Generate placeholder icons
ICON_SIZES.forEach(size => {
  const svgContent = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold">
    FC
  </text>
  <text x="50%" y="${size * 0.8}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.08}">
    ${size}x${size}
  </text>
</svg>`;

  const iconPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(iconPath, svgContent);
  console.log(`Generated: ${iconPath}`);
});

// Generate placeholder screenshots
const screenshots = [
  { name: 'desktop-home.png', width: 1280, height: 720 },
  { name: 'mobile-home.png', width: 390, height: 844 }
];

screenshots.forEach(screenshot => {
  const svgContent = `
<svg width="${screenshot.width}" height="${screenshot.height}" viewBox="0 0 ${screenshot.width} ${screenshot.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${screenshot.width}" height="${screenshot.height}" fill="url(#grad)"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${screenshot.width * 0.05}" font-weight="bold">
    FaithConnect Screenshot
  </text>
  <text x="50%" y="${screenshot.height * 0.6}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${screenshot.width * 0.02}">
    ${screenshot.width}x${screenshot.height}
  </text>
  <text x="50%" y="${screenshot.height * 0.7}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${screenshot.width * 0.015}">
    Replace with actual screenshot
  </text>
</svg>`;

  const screenshotPath = path.join(screenshotsDir, screenshot.name.replace('.png', '.svg'));
  fs.writeFileSync(screenshotPath, svgContent);
  console.log(`Generated: ${screenshotPath}`);
});

// Generate additional icon files
const additionalIcons = [
  { name: 'search-96x96.svg', size: 96, text: '🔍' },
  { name: 'business-96x96.svg', size: 96, text: '🏢' },
  { name: 'add-96x96.svg', size: 96, text: '➕' },
  { name: 'badge-72x72.svg', size: 72, text: 'FC' },
  { name: 'checkmark.png', size: 24, text: '✓' },
  { name: 'xmark.png', size: 24, text: '✕' }
];

additionalIcons.forEach(icon => {
  const svgContent = `
<svg width="${icon.size}" height="${icon.size}" viewBox="0 0 ${icon.size} ${icon.size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${icon.size}" height="${icon.size}" fill="url(#grad)" rx="${icon.size * 0.1}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${icon.size * 0.4}" font-weight="bold">
    ${icon.text}
  </text>
</svg>`;

  const iconPath = path.join(iconsDir, icon.name.replace('.png', '.svg'));
  fs.writeFileSync(iconPath, svgContent);
  console.log(`Generated: ${iconPath}`);
});

console.log('\n✅ PWA icons and screenshots generated successfully!');
console.log('\n📝 Next steps:');
console.log('1. Replace placeholder icons with your actual app icons');
console.log('2. Replace placeholder screenshots with actual app screenshots');
console.log('3. Convert SVG files to PNG if needed');
console.log('4. Test PWA functionality in browser');
