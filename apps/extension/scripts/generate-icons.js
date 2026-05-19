#!/usr/bin/env node
// Render the web app's spiral brand mark into transparent PNG extension icons.

const fs = require("fs");
const path = require("path");
const { renderTransparentBrandMark } = require("./brand-mark-image");

const SIZES = [16, 32, 48, 128];
const BRAND_MARK_SOURCE = path.join(
  __dirname,
  "../../web/public/brand/slothing-mark.png",
);
const OUTPUT_DIR = path.join(__dirname, "../src/assets/icons");

if (!fs.existsSync(BRAND_MARK_SOURCE)) {
  console.error("Missing brand mark:", BRAND_MARK_SOURCE);
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sourceBuffer = fs.readFileSync(BRAND_MARK_SOURCE);

async function generateIcons() {
  for (const size of SIZES) {
    const outPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
    const icon = await renderTransparentBrandMark(sourceBuffer, size);
    fs.writeFileSync(outPath, icon);
    console.log(`Generated: icon-${size}.png (${size}x${size})`);
  }
  console.log("Done! Icons written to", OUTPUT_DIR);
}

generateIcons().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
