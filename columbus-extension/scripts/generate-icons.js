#!/usr/bin/env node
// Render the master SVG into PNG icons for all required sizes.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SIZES = [16, 32, 48, 128];
const SVG_SOURCE = path.join(__dirname, '../icons/source/columbus.svg');
const OUTPUT_DIR = path.join(__dirname, '../src/assets/icons');

if (!fs.existsSync(SVG_SOURCE)) {
  console.error('Missing master SVG:', SVG_SOURCE);
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const svgBuffer = fs.readFileSync(SVG_SOURCE);

async function generateIcons() {
  for (const size of SIZES) {
    const outPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ compressionLevel: 9, effort: 10 })
      .toFile(outPath);
    console.log(`Generated: icon-${size}.png (${size}x${size})`);
  }
  console.log('Done! Icons written to', OUTPUT_DIR);
}

generateIcons().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
