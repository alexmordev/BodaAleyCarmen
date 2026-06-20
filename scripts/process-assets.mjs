// Procesa los assets crudos (fotos pesadas + icono del gato) a versiones web.
// Uso puntual: `node scripts/process-assets.mjs`. Las salidas se commitean en
// src/assets/images y Vite las empaqueta; sharp NO se usa en el build.
import sharp from 'sharp'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'dist/assets/Photos-3-001'
const OUT = 'src/assets/images'
const GAL = join(OUT, 'gallery')
mkdirSync(GAL, { recursive: true })

// ---------- 1) Gato: quitar fondo blanco (flood-fill desde los bordes) ----------
async function processCat() {
  const ico = 'dist/assets/image_66285125.ico'
  const base = sharp(readFileSync(ico)).ensureAlpha()
  const { data, info } = await base
    .resize({ width: 480, height: 480, fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: W, height: H, channels: C } = info
  const idx = (x, y) => (y * W + x) * C
  const isWhite = (i) => data[i] > 232 && data[i + 1] > 232 && data[i + 2] > 232
  const visited = new Uint8Array(W * H)
  const stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return
    const p = y * W + x
    if (visited[p]) return
    visited[p] = 1
    if (isWhite(idx(x, y))) stack.push(x, y)
  }
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1) }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y) }
  while (stack.length) {
    const y = stack.pop(), x = stack.pop()
    data[idx(x, y) + 3] = 0 // transparente
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1)
  }
  const png = await sharp(data, { raw: { width: W, height: H, channels: C } })
    .png({ compressionLevel: 9 })
    .toBuffer()
  writeFileSync(join(OUT, 'gato.png'), png)
  console.log('✓ gato.png (fondo transparente)', W + 'x' + H)
}

// ---------- 2) Fotos: recorte a proporcion + compresion ----------
// slot: { name, w, h } ; cover crop con deteccion de saliencia (caras)
const jobs = [
  // Hero (vertical 3:4)
  { file: 'IMG_1035 fav.jpeg', out: 'hero.jpg', w: 900, h: 1200 },
  // Galeria
  { file: 'IMG_1029 fav.jpeg', out: 'gallery/g1.jpg', w: 1400, h: 1050 }, // 4:3
  { file: 'IMG_1024 fav.jpeg', out: 'gallery/g2.jpg', w: 900, h: 1200 },  // 3:4
  { file: 'IMG_0998 fav.jpeg', out: 'gallery/g3.jpg', w: 1000, h: 1000 }, // 1:1
  { file: 'IMG_1027 fav.jpeg', out: 'gallery/g4.jpg', w: 1000, h: 1000 }, // 1:1
  { file: 'IMG_1010.jpeg',     out: 'gallery/g5.jpg', w: 1000, h: 1000 }, // 1:1
  { file: 'IMG_0879.jpeg',     out: 'gallery/g6.jpg', w: 900, h: 1200 },  // 3:4
  { file: 'IMG_1031 fav.jpeg', out: 'gallery/g7.jpg', w: 1400, h: 1050 }, // 4:3
]

async function processPhotos() {
  for (const j of jobs) {
    await sharp(join(SRC, j.file))
      .rotate() // respeta orientacion EXIF
      .resize({ width: j.w, height: j.h, fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(join(OUT, j.out))
    console.log('✓', j.out, '<-', j.file)
  }
}

await processCat()
await processPhotos()
console.log('Listo.')
