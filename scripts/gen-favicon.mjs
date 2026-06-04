// Generates Zabble's favicon set from a single vector source.
//
//   node scripts/gen-favicon.mjs
//
// Design (light mode — brand is light-mode only, white-heavy; brand.md §1):
// a WHITE (#FFFFFF) rounded tile with a hairline brand-line (#E2E8F0) border for
// definition on light chrome, and a refined geometric "Z" — ink (#0A0F1A) top
// bar + diagonal, brand-cyan (#01DBF1) bottom bar. The cyan accent is baked into
// the letterform, echoing the site's serif-headline-with-cyan-underline
// signature. Lighter bar weight + 7-unit padding keep it elegant, not chunky.
// Outputs:
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
const LINE = '#E2E8F0'

// Refined geometric "Z" on a 32-unit grid: 7-unit padding, 4-unit bar weight
// (lighter/more elegant than a chunky mark, still legible at 16px). Single ink
// polygon; the cyan rect recolors the bottom bar (clean seam at y=21, below
// where the diagonal ends).
const Z_PATH = 'M7 7 L25 7 L25 11 L16 21 L25 21 L25 25 L7 25 L7 21 L16 11 L7 11 Z'
const Z_BOTTOM_BAR = '<rect x="7" y="21" width="18" height="4" fill="' + CYAN + '"/>'

const glyph = '<path d="' + Z_PATH + '" fill="' + INK + '"/>' + Z_BOTTOM_BAR

// Rounded white tile with hairline border (transparent outside the radius) —
// best for browser tabs. Stroke inset by 0.5 so its 1-unit width stays on-canvas.
const svgRounded =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="Zabble">' +
  '<rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="' + WHITE + '" stroke="' + LINE + '" stroke-width="1"/>' +
  glyph +
  '</svg>\n'

// Full-bleed white tile (no transparent corners) — for iOS/Android masks, which
// apply their own corner rounding.
const svgFullBleed =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">' +
  '<rect width="32" height="32" fill="' + WHITE + '"/>' +
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
