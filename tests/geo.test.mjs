// GEO test suite (S07-geo). Run: `npm run test:geo` (after `npm run generate`
// for the link-resolution checks). Asserts:
//   1. llms.txt < 5 KB, H1 + brand-summary present (both llms files).
//   2. No drift between llms-full.txt and systems.ts (every live module + pillar).
//   3. No dead/stale module links in llms.txt.
//   4. Every llms link resolves to a prerendered file in the build output.
//   5. Entity disambiguation data (different-from / sameAs) present for S08.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')

const BRAND_SUMMARY = 'Zabble is a South African consulting firm'
const llms = read('public/llms.txt')
const llmsFull = read('public/llms-full.txt')
const systemsSrc = read('app/data/systems.ts')

// Walk each system object to collect the live slugs.
function parseLiveSlugs(src) {
  const body = src.slice(src.indexOf('export const SYSTEMS'))
  const positions = [...body.matchAll(/slug:\s*'([^']+)'/g)].map((m) => ({ slug: m[1], idx: m.index }))
  const out = []
  for (let i = 0; i < positions.length; i++) {
    const block = body.slice(positions[i].idx, positions[i + 1]?.idx)
    if (/status:\s*'live'/.test(block)) out.push(positions[i].slug)
  }
  return out
}
const live = parseLiveSlugs(systemsSrc)

function parsePillarSlugs(src) {
  const block = src.slice(src.indexOf('export const PILLARS'), src.indexOf('export function pillarBySlug'))
  return [...block.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
}
const pillars = parsePillarSlugs(systemsSrc)

const urlsIn = (txt) => [...new Set([...txt.matchAll(/https:\/\/zabble\.org[^\s)>\]]*/g)].map((m) => m[0]))]
const systemSlugsIn = (txt) => [...txt.matchAll(/zabble\.org\/systems\/([a-z0-9-]+)/g)].map((m) => m[1])
// Pillar hubs are canonical at /what-we-build/<slug> (consolidated from the
// earlier /pillars/* duplicate, which now 301s here).
const pillarSlugsIn = (txt) => [...txt.matchAll(/zabble\.org\/what-we-build\/([a-z0-9-]+)/g)].map((m) => m[1])

test('llms.txt is under 5 KB', () => {
  const bytes = Buffer.byteLength(llms, 'utf8')
  assert.ok(bytes < 5120, `llms.txt is ${bytes} bytes (must be < 5120)`)
})

test('both llms files have an H1 and the brand-summary blockquote', () => {
  for (const [name, txt] of [['llms.txt', llms], ['llms-full.txt', llmsFull]]) {
    assert.ok(txt.split('\n')[0].startsWith('# '), `${name} first line must be an H1`)
    assert.ok(txt.includes(BRAND_SUMMARY), `${name} must contain the brand summary`)
  }
})

test('no drift: llms-full.txt lists exactly the live systems in systems.ts', () => {
  assert.ok(live.length >= 30, `expected >= 30 live systems, found ${live.length}`)
  const inFull = new Set(systemSlugsIn(llmsFull))
  for (const slug of live) assert.ok(inFull.has(slug), `llms-full.txt is missing live system: ${slug}`)
  for (const slug of inFull) assert.ok(live.includes(slug), `llms-full.txt links a non-live/stale system: ${slug}`)
})

test('no drift: llms-full.txt lists every pillar hub', () => {
  assert.equal(pillars.length, 4)
  const inFull = new Set(pillarSlugsIn(llmsFull))
  for (const slug of pillars) assert.ok(inFull.has(slug), `llms-full.txt is missing pillar hub: ${slug}`)
})

test('no dead links: every system link in llms.txt is a live system', () => {
  for (const slug of systemSlugsIn(llms)) assert.ok(live.includes(slug), `llms.txt links a non-live system: ${slug}`)
})

test('entity disambiguation is positive-only (no homonym named anywhere in the entity)', () => {
  const org = read('app/data/organization.ts')
  assert.ok(org.includes('disambiguatingDescription'), 'organization.ts must define disambiguatingDescription')
  assert.ok(/South African/.test(org), 'disambiguation must assert the South African identity')
  assert.ok(org.includes('sameAsTargets'), 'organization.ts must define the sameAs target set for S10')
  // Policy: the site names no homonym; positive signals carry the distinction.
  assert.ok(!/Zabble, ?Inc|zabbleinc|waste-management/i.test(org), 'organization.ts must not name the US homonym')
})

test('every llms link resolves to a prerendered file in the build output', (t) => {
  const pub = join(ROOT, '.output/public')
  if (!existsSync(pub)) {
    t.skip('.output/public not found — run `npm run generate` first to check link resolution')
    return
  }
  const toFile = (url) => {
    const path = new URL(url).pathname
    if (path === '/') return 'index.html'
    return path.replace(/^\//, '').replace(/\/$/, '') + '/index.html'
  }
  const all = [...new Set([...urlsIn(llms), ...urlsIn(llmsFull)])]
  assert.ok(all.length >= 30, `expected >= 30 links, found ${all.length}`)
  const missing = all.filter((u) => !existsSync(join(pub, toFile(u))))
  assert.deepEqual(missing, [], `links with no prerendered page: ${missing.join(', ')}`)
})

test('built home page carries the Organization JSON-LD + disambiguation (when built)', (t) => {
  const home = join(ROOT, '.output/public/index.html')
  if (!existsSync(home)) {
    t.skip('.output/public/index.html not found — run `npm run generate` first')
    return
  }
  const html = readFileSync(home, 'utf8')
  assert.ok(html.includes('application/ld+json'), 'home must emit JSON-LD')
  assert.ok(html.includes('disambiguatingDescription'), 'JSON-LD must include disambiguatingDescription')
  // Positive-only disambiguation: the JSON-LD asserts the SA identity and names
  // no homonym (the site references no other company).
  assert.ok(/South African/.test(html), 'home JSON-LD must carry the positive SA identity')
  assert.ok(!/Zabble, ?Inc|waste-management/i.test(html), 'home must not name the US homonym')
})
