// Generates Zabble's favicon set from a single vector source.
//
//   node scripts/gen-favicon.mjs
//
// Design: an ink (#0A0F1A) rounded tile with a bold geometric "Z". The Z's top
// bar + diagonal are white; its BOTTOM bar is brand cyan (#01DBF1) — the accent
// baked into the letterform, echoing the site's serif-headline-with-cyan-
// underline signature (brand.md §2). Ink tile = visible on both dark browser
// tabs (light glyph) and light chrome (dark mark). Outputs:
//   public/favicon.svg          — scalable, primary for modern browsers
//   public/favicon.ico          — 16/32/48 PNG-in-ICO, legacy + Google fallback
//   public/apple-touch-icon.png — 180×180 full-bleed, iOS home screen
//
// Regenerate after any change to the COLORS / GLYPH below.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const INK = '#0A0F1A'
const WHITE = '#FFFFFF'
const CYAN = '#01DBF1'

// Geometric "Z" on a 32-unit grid (7-unit inset, 5-unit bar weight) — chunky
// enough to stay legible at 16px. Single white polygon; the cyan rect recolors
// the bottom bar (clean seam at y=19, below where the diagonal ends).
const Z_PATH = 'M7 8 L25 8 L25 13 L16 19 L25 19 L25 24 L7 24 L7 19 L16 13 L7 13 Z'
const Z_BOTTOM_BAR = '<rect x="7" y="19" width="18" height="5" fill="' + CYAN + '"/>'

const glyph = '<path d="' + Z_PATH + '" fill="' + WHITE + '"/>' + Z_BOTTOM_BAR

// Rounded tile (transparent outside the radius) — best for browser tabs.
const svgRounded =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="Zabble">' +
  '<rect width="32" height="32" rx="7" fill="' + INK + '"/>' +
  glyph +
  '</svg>\n'

// Full-bleed tile (ink fills the whole square, no transparent corners) — for
// iOS/Android masks, which apply their own corner rounding.
const svgFullBleed =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">' +
  '<rect width="32" height="32" fill="' + INK + '"/>' +
  glyph +
  '</svg>'

const png = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size, { fit: 'contain' }).png().toBuffer()

// Minimal PNG-in-ICO encoder (Vista+; every modern browser supports it).
function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4) // image count

  const entries = []
  const blobs = []
  let offset = 6 + images.length * 16
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // width  (0 ⇒ 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // palette
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // colour planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(data.length, 8) // size of PNG blob
    entry.writeUInt32LE(offset, 12) // offset of PNG blob
    entries.push(entry)
    blobs.push(data)
    offset += data.length
  }
  return Buffer.concat([header, ...entries, ...blobs])
}

const out = (name) => join(PUBLIC, name)

writeFileSync(out('favicon.svg'), svgRounded)

const [p16, p32, p48, p180] = await Promise.all([
  png(svgRounded, 16),
  png(svgRounded, 32),
  png(svgRounded, 48),
  png(svgFullBleed, 180),
])

writeFileSync(
  out('favicon.ico'),
  buildIco([
    { size: 16, data: p16 },
    { size: 32, data: p32 },
    { size: 48, data: p48 },
  ]),
)
writeFileSync(out('apple-touch-icon.png'), p180)

console.log('Wrote public/favicon.svg, public/favicon.ico (16/32/48), public/apple-touch-icon.png')
