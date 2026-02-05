#!/usr/bin/env node
// Generate simple placeholder icons for the extension
// Creates solid teal colored PNG icons at various sizes

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = [16, 32, 48, 128];
const OUTPUT_DIR = path.join(__dirname, '../src/assets/icons');

// Teal color (same as Columbus brand)
const COLOR = { r: 20, g: 184, b: 166, a: 255 };

function createPNG(size) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk (image data)
  const rawData = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    rawData[rowStart] = 0; // filter byte
    for (let x = 0; x < size; x++) {
      const pixelStart = rowStart + 1 + x * 4;
      // Create a simple "C" letter shape for Columbus
      const inBorder = x < 2 || y < 2 || x >= size - 2 || y >= size - 2;
      const inC = !inBorder && (
        x < size * 0.35 || // left bar
        (y < size * 0.25 && x < size * 0.8) || // top bar
        (y > size * 0.75 && x < size * 0.8) // bottom bar
      );

      if (inC) {
        rawData[pixelStart] = COLOR.r;
        rawData[pixelStart + 1] = COLOR.g;
        rawData[pixelStart + 2] = COLOR.b;
        rawData[pixelStart + 3] = COLOR.a;
      } else if (!inBorder) {
        // Background (white)
        rawData[pixelStart] = 255;
        rawData[pixelStart + 1] = 255;
        rawData[pixelStart + 2] = 255;
        rawData[pixelStart + 3] = 255;
      } else {
        // Border (dark teal)
        rawData[pixelStart] = 13;
        rawData[pixelStart + 1] = 148;
        rawData[pixelStart + 2] = 136;
        rawData[pixelStart + 3] = 255;
      }
    }
  }
  const compressedData = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressedData);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32 implementation for PNG
function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0; // Ensure unsigned
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate icons
for (const size of SIZES) {
  const png = createPNG(size);
  const filename = path.join(OUTPUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Generated: icon-${size}.png`);
}

console.log('Done! Icons generated in', OUTPUT_DIR);
