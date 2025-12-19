#!/usr/bin/env node
/**
 * Generate placeholder PNG icons for the Nudge extension.
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const sizes = [16, 32, 48, 128];

// CRC32 implementation for PNG
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBytes, data]);
  const crcValue = Buffer.alloc(4);
  crcValue.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBytes, data, crcValue]);
}

function createIcon(size) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // width
  ihdrData.writeUInt32BE(size, 4);  // height
  ihdrData.writeUInt8(8, 8);        // bit depth
  ihdrData.writeUInt8(2, 9);        // color type (RGB)
  ihdrData.writeUInt8(0, 10);       // compression
  ihdrData.writeUInt8(0, 11);       // filter
  ihdrData.writeUInt8(0, 12);       // interlace
  const ihdrChunk = createPngChunk('IHDR', ihdrData);

  // Create pixel data
  const center = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.22;

  // Colors
  const teal = [79, 209, 197];       // #4FD1C5
  const darkTeal = [44, 122, 123];   // #2C7A7B
  const bg = [250, 250, 250];        // Light gray background

  const rawData = Buffer.alloc((size * 3 + 1) * size);

  for (let y = 0; y < size; y++) {
    const rowOffset = y * (size * 3 + 1);
    rawData[rowOffset] = 0; // filter byte (none)

    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      const dist = Math.sqrt(Math.pow(x - center, 2) + Math.pow(y - center, 2));

      let r, g, b;

      if (dist <= innerRadius) {
        // Inner dark teal circle
        [r, g, b] = darkTeal;
      } else if (dist <= outerRadius) {
        // Gradient from dark teal to light teal
        const t = (dist - innerRadius) / (outerRadius - innerRadius);
        r = Math.round(darkTeal[0] + (teal[0] - darkTeal[0]) * t);
        g = Math.round(darkTeal[1] + (teal[1] - darkTeal[1]) * t);
        b = Math.round(darkTeal[2] + (teal[2] - darkTeal[2]) * t);
      } else {
        // Background
        [r, g, b] = bg;
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
    }
  }

  // Compress with zlib
  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createPngChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Main
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach((size) => {
  const pngData = createIcon(size);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, pngData);
  console.log(`Created ${filePath}`);
});

// Remove old SVG if exists
const svgPath = path.join(iconsDir, 'icon16.svg');
if (fs.existsSync(svgPath)) {
  fs.unlinkSync(svgPath);
  console.log(`Removed ${svgPath}`);
}

console.log('\n✓ Icons generated successfully!');
