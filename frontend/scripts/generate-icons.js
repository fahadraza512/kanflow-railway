#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * 
 * This script generates all required PWA icon sizes from a source image.
 * 
 * Requirements:
 * - Node.js
 * - sharp package (npm install sharp)
 * 
 * Usage:
 * node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: sharp package is not installed');
  console.log('\n📦 Install it with: npm install sharp --save-dev\n');
  process.exit(1);
}

// Configuration
const SOURCE_ICON = path.join(__dirname, '../public/icons/icon-512x512.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

const ICON_SIZES = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

async function generateIcons() {
  console.log('🎨 PWA Icon Generator\n');

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
    console.log('\n💡 Please ensure icon-512x512.png exists in public/icons/\n');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}\n`);
  }

  console.log(`📸 Source: ${path.basename(SOURCE_ICON)}\n`);

  // Generate each icon size
  for (const { size, name } of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);
    
    try {
      // Check if icon already exists
      if (fs.existsSync(outputPath)) {
        console.log(`⏭️  Skipping ${name} (already exists)`);
        continue;
      }

      // Generate icon
      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n🎉 Icon generation complete!\n');
  console.log('📋 Next steps:');
  console.log('1. Verify all icons in public/icons/');
  console.log('2. Test PWA installation on mobile devices');
  console.log('3. Check manifest.json references all icons\n');
}

// Run the generator
generateIcons().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
