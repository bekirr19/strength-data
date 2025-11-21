import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';

const OUTPUT_DIR = join(process.cwd(), 'public', 'icons');
const SIZES = [192, 512];

const COLORS = {
  background: { r: 12, g: 18, b: 16 },
  neon: { r: 13, g: 242, b: 147 },
  neonSoft: { r: 45, g: 255, b: 178 }
};

function fillRect(png, x, y, width, height, color) {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(png.width, Math.ceil(x + width));
  const endY = Math.min(png.height, Math.ceil(y + height));

  for (let yy = startY; yy < endY; yy += 1) {
    for (let xx = startX; xx < endX; xx += 1) {
      const idx = (png.width * yy + xx) << 2;
      png.data[idx] = color.r;
      png.data[idx + 1] = color.g;
      png.data[idx + 2] = color.b;
      png.data[idx + 3] = 255;
    }
  }
}

function drawIcon(size) {
  const png = new PNG({ width: size, height: size });

  // Background
  fillRect(png, 0, 0, size, size, COLORS.background);

  const stroke = size * 0.015;
  const neon = COLORS.neon;
  const neonSoft = COLORS.neonSoft;

  // Bench base
  const baseHeight = size * 0.08;
  fillRect(png, size * 0.18, size * 0.74, size * 0.64, baseHeight, neon);

  // Bench pads
  fillRect(png, size * 0.36, size * 0.62, size * 0.28, size * 0.07, neonSoft);
  fillRect(png, size * 0.47, size * 0.69, size * 0.06, size * 0.07, neon);

  // Uprights
  const uprightWidth = size * 0.06;
  const uprightHeight = size * 0.5;
  fillRect(png, size * 0.26, size * 0.28, uprightWidth, uprightHeight, neon);
  fillRect(png, size * 0.68, size * 0.28, uprightWidth, uprightHeight, neon);

  // Top rail
  fillRect(png, size * 0.26, size * 0.28, size * 0.48 + uprightWidth, stroke * 2, neon);

  // Support feet
  fillRect(png, size * 0.24, size * 0.72, uprightWidth + stroke * 2, stroke * 1.5, neon);
  fillRect(png, size * 0.66, size * 0.72, uprightWidth + stroke * 2, stroke * 1.5, neon);

  // Barbell sleeves
  fillRect(png, size * 0.18, size * 0.32, size * 0.04, size * 0.22, neon);
  fillRect(png, size * 0.78, size * 0.32, size * 0.04, size * 0.22, neon);

  // Data plates left
  fillRect(png, size * 0.12, size * 0.26, size * 0.08, size * 0.34, neonSoft);
  fillRect(png, size * 0.13, size * 0.32, size * 0.02, size * 0.18, neon);
  fillRect(png, size * 0.16, size * 0.35, size * 0.02, size * 0.12, neon);
  fillRect(png, size * 0.19, size * 0.38, size * 0.02, size * 0.08, neon);

  // Data plates right
  fillRect(png, size * 0.80, size * 0.26, size * 0.08, size * 0.34, neonSoft);
  fillRect(png, size * 0.82, size * 0.32, size * 0.02, size * 0.18, neon);
  fillRect(png, size * 0.85, size * 0.35, size * 0.02, size * 0.12, neon);
  fillRect(png, size * 0.88, size * 0.41, size * 0.02, size * 0.08, neon);

  // Weight plates highlight
  fillRect(png, size * 0.17, size * 0.44, size * 0.04, size * 0.04, neon);
  fillRect(png, size * 0.81, size * 0.44, size * 0.04, size * 0.04, neon);

  return png;
}

function savePng(png, filePath) {
  const buffer = PNG.sync.write(png);
  writeFileSync(filePath, buffer);
}

function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const size of SIZES) {
    const png = drawIcon(size);
    const filename = `strength-data-icon-${size}.png`;
    savePng(png, join(OUTPUT_DIR, filename));
    console.log(`Generated ${filename}`);
  }

  // Apple touch icon uses 180x180
  const applePng = drawIcon(180);
  savePng(applePng, join(OUTPUT_DIR, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

main();
