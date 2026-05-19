const sharp = require("sharp");

const BACKGROUND_MIN_CHANNEL = 155;
const BACKGROUND_MAX_SPREAD = 95;

function isConnectedBackgroundPixel(data, offset) {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const a = data[offset + 3];
  if (a === 0) return true;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  return min >= BACKGROUND_MIN_CHANNEL && max - min <= BACKGROUND_MAX_SPREAD;
}

async function removeConnectedBackground(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (channels !== 4) {
    throw new Error(`Expected RGBA input, received ${channels} channels`);
  }

  const total = width * height;
  const seen = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  function enqueue(index) {
    if (seen[index]) return;
    const offset = index * 4;
    if (!isConnectedBackgroundPixel(data, offset)) return;
    seen[index] = 1;
    queue[tail++] = index;
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1);
    if (x < width - 1) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y < height - 1) enqueue(index + width);
  }

  for (let i = 0; i < total; i += 1) {
    if (seen[i]) data[i * 4 + 3] = 0;
  }

  return sharp(data, {
    raw: { width, height, channels: 4 },
  })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}

async function renderTransparentBrandMark(input, size) {
  const cleaned = await removeConnectedBackground(input);
  return sharp(cleaned)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}

module.exports = {
  renderTransparentBrandMark,
  removeConnectedBackground,
};
