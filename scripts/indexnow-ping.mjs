#!/usr/bin/env node
/**
 * IndexNow publish-time ping — Zabble (S09 analytics / indexing).
 *
 * Submits changed/published URLs to IndexNow (Bing, Yandex, Seznam, …) for
 * near-instant discovery. Run AFTER `nuxt generate`, at publish/deploy time.
 *
 *   node scripts/indexnow-ping.mjs                      # ping all sitemap URLs
 *   node scripts/indexnow-ping.mjs --dry-run            # print, don't submit
 *   node scripts/indexnow-ping.mjs --urls urls.txt      # one URL per line
 *   node scripts/indexnow-ping.mjs --host https://zabble.org --key <key>
 *
 * URL discovery order: --urls file → .output/public/sitemap.xml → walk
 * .output/public for index.html files. The IndexNow key file must be hosted at
 * https://<host>/<key>.txt (public/<key>.txt — committed; the key is PUBLIC by
 * design, per the IndexNow spec).
 *
 * SAFETY: refuses to submit for staging/preview/localhost hosts (pre-launch
 * hygiene — we never want a staging URL indexed). Override with --force only on
 * the production cutover if you understand why.
 *
 * S1 owns robots.txt + sitemap.xml. This script only READS the generated
 * sitemap; it does not edit either. Coordinate the sitemap path via status.md.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const DEFAULT_HOST = 'https://zabble.org'
// Key is public (hosted at /<key>.txt). Override with --key or NUXT_INDEXNOW_KEY.
const DEFAULT_KEY = '34cc0be3679dd090c399c3f817b64ee0'
const OUTPUT_DIR = '.output/public'

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1]
  }
  return fallback
}
const hasFlag = (name) => process.argv.includes(`--${name}`)

const host = arg('host', process.env.NUXT_PUBLIC_SITE_URL || DEFAULT_HOST).replace(/\/$/, '')
const key = arg('key', process.env.NUXT_INDEXNOW_KEY || DEFAULT_KEY)
const dryRun = hasFlag('dry-run')
const force = hasFlag('force')

const hostname = new URL(host).hostname
if (/staging|preview|localhost|127\.0\.0\.1|\.local$/i.test(hostname) && !force) {
  console.error(
    `✋ Refusing to ping IndexNow for non-production host "${hostname}".\n` +
      `   Pre-launch hygiene: never submit staging URLs. Use --force only at the\n` +
      `   production cutover if this really is the live domain.`,
  )
  process.exit(1)
}

// ── Collect URLs ─────────────────────────────────────────────────────────────
function fromUrlsFile(path) {
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
}

function fromSitemap(path) {
  const xml = readFileSync(path, 'utf8')
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1])
}

function walkHtml(dir, base = dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walkHtml(full, base, acc)
    else if (entry === 'index.html') {
      const rel = relative(base, full).split(sep).slice(0, -1).join('/')
      acc.push(`${host}/${rel}`.replace(/\/$/, '') || host)
    }
  }
  return acc
}

let urls = []
const urlsFile = arg('urls', null)
const sitemapPath = join(OUTPUT_DIR, 'sitemap.xml')
if (urlsFile && existsSync(urlsFile)) {
  urls = fromUrlsFile(urlsFile)
  console.log(`• ${urls.length} URLs from ${urlsFile}`)
} else if (existsSync(sitemapPath)) {
  urls = fromSitemap(sitemapPath)
  console.log(`• ${urls.length} URLs from ${sitemapPath}`)
} else if (existsSync(OUTPUT_DIR)) {
  urls = walkHtml(OUTPUT_DIR)
  console.log(`• ${urls.length} URLs from ${OUTPUT_DIR} (no sitemap.xml yet — S1)`)
} else {
  console.error(
    `No URL source found. Run \`nuxt generate\` first, pass --urls <file>, or wait\n` +
      `for S1's sitemap. Looked for: ${urlsFile || '(no --urls)'}, ${sitemapPath}, ${OUTPUT_DIR}`,
  )
  process.exit(1)
}

// Keep only same-host http(s) URLs, de-duplicated.
urls = [...new Set(urls.filter((u) => u.startsWith(host)))]
if (!urls.length) {
  console.error(`No URLs matching host ${host} — nothing to submit.`)
  process.exit(1)
}

const payload = {
  host: hostname,
  key,
  keyLocation: `${host}/${key}.txt`,
  urlList: urls,
}

if (dryRun) {
  console.log('— DRY RUN — would POST to https://api.indexnow.org/indexnow:')
  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
})

// IndexNow returns 200 (accepted) or 202 (accepted, pending). 403 ⇒ key not
// found at keyLocation; 422 ⇒ URLs don't match host/key.
if (res.ok) {
  console.log(`✓ IndexNow accepted ${urls.length} URLs (HTTP ${res.status}) for ${hostname}.`)
} else {
  const body = await res.text().catch(() => '')
  console.error(`✗ IndexNow ping failed: HTTP ${res.status}. ${body}`)
  console.error(`  Check the key file is live at ${payload.keyLocation}`)
  process.exit(1)
}
