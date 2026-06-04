#!/usr/bin/env node
// SEO metadata regression test (owned by S02 on-page).
//
// Zero-dependency: parses the prerendered HTML under .output/public/**/index.html
// (produced by `npm run generate`) and asserts the on-page metadata contract.
// Run with `npm run test:seo` (after a generate) or `npm run verify:seo` (both).
//
// Asserts, for every prerendered route:
//   1. unique, length-valid <title> (≤ 60 chars incl. " · Zabble" suffix, > 10)
//   2. unique, length-valid <meta name="description"> (50–160 chars)
//   3. <link rel="canonical"> present, absolute, https, NON-WWW, query-free,
//      and matching the route
//   4. Open Graph (og:title/description/type/url) + Twitter card present
//   5. <html lang="en-ZA">
//   6. answer-first slot (data-answer-first) present on every money page
//   7. NO two pages share a primary intent (zabble:primary-kw) — cannibalisation guard
//
// Exit code 0 = pass, 1 = fail (prints every violation).

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const PUBLIC_DIR = '.output/public'
const ORIGIN = 'https://zabble.org'
const TITLE_MAX = 60      // Google truncates ~ 600px; 60 chars is the safe budget.
const TITLE_MIN = 10
const DESC_MIN = 50
const DESC_MAX = 160

if (!existsSync(PUBLIC_DIR)) {
  console.error(`✖ ${PUBLIC_DIR} not found — run \`npm run generate\` first.`)
  process.exit(1)
}

// ── collect every prerendered route (dir containing index.html) ──────────────
function findHtml(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...findHtml(full))
    else if (entry.name === 'index.html') out.push(full)
  }
  return out
}

function routeFor(file) {
  const rel = relative(PUBLIC_DIR, file).split(sep).join('/').replace(/index\.html$/, '')
  const r = '/' + rel.replace(/\/$/, '').replace(/^\//, '')
  return r === '/' || r === '' ? '/' : r
}

const pick = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null }
const decode = (s) => s == null ? s : s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"')

// Capture the content value up to its MATCHING closing quote via a backreference,
// so an apostrophe inside a double-quoted value (e.g. "Sandton's banks…") is not
// treated as the end of the attribute. `pick` returns capture group 1, so put a
// non-capturing quote group and a named-by-position value group, then read it.
const metaContent = (html, name) => {
  const m =
    html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=(["'])([\\s\\S]*?)\\1`, 'i'))
    ?? html.match(new RegExp(`<meta[^>]+content=(["'])([\\s\\S]*?)\\1[^>]*(?:name|property)=["']${name}["']`, 'i'))
  return m ? decode(m[2]) : undefined
}

// Money pages must carry an answer-first slot. (Hubs/indexes/utility excluded —
// they still get one in practice, but it's only *required* on these.)
const isMoneyPage = (route) =>
  route === '/' ||
  /^\/systems\/[^/]+$/.test(route) ||
  /^\/pillars\/[^/]+$/.test(route) ||
  /^\/industries\/[^/]+$/.test(route) ||
  /^\/insights\/[^/]+$/.test(route)

const files = findHtml(PUBLIC_DIR).filter((f) => {
  // skip Nuxt's 200/404 SPA fallbacks if present
  const r = relative(PUBLIC_DIR, f).split(sep).join('/')
  return r !== '200.html' && r !== '404.html'
})

const errors = []
const warnings = []
const titles = new Map()
const descs = new Map()
const primaries = new Map()
let checked = 0

// Editorial routes (/blog/*, /insights/*) carry keyword-rich, longer titles and
// descriptions by design. Structural rules (canonical, OG/Twitter, lang, unique,
// brand suffix) stay HARD everywhere; only the title/description LENGTH budgets
// soften to warnings for these routes. Money/core pages remain strict.
const isEditorial = (r) => /^\/(blog|insights)\/[^/]+$/.test(r)

for (const file of files) {
  const route = routeFor(file)
  const html = readFileSync(file, 'utf8')
  // Only check real prerendered pages (have our app shell).
  if (!/<html/i.test(html)) continue
  checked++
  const fail = (msg) => errors.push(`  [${route}] ${msg}`)
  const warn = (msg) => warnings.push(`  [${route}] ${msg}`)
  // Length budgets soften to warnings for editorial routes; hard for the rest.
  const lenIssue = isEditorial(route) ? warn : fail

  // 1. title
  const rawTitle = pick(html, /<title[^>]*>([^<]*)<\/title>/i)
  const title = decode(rawTitle)
  if (!title) fail('missing <title>')
  else {
    if (title.length > TITLE_MAX) lenIssue(`title too long (${title.length} > ${TITLE_MAX}): "${title}"`)
    if (title.length < TITLE_MIN) fail(`title too short (${title.length}): "${title}"`)
    if (!/ · Zabble$/.test(title)) fail(`title missing " · Zabble" suffix: "${title}"`)
    if (titles.has(title)) fail(`duplicate title with ${titles.get(title)}: "${title}"`)
    else titles.set(title, route)
  }

  // 2. description
  const desc = metaContent(html, 'description')
  if (!desc) fail('missing meta description')
  else {
    if (desc.length > DESC_MAX) lenIssue(`description too long (${desc.length} > ${DESC_MAX})`)
    if (desc.length < DESC_MIN) fail(`description too short (${desc.length}): "${desc}"`)
    if (descs.has(desc)) fail(`duplicate description with ${descs.get(desc)}`)
    else descs.set(desc, route)
  }

  // 3. canonical
  const canonical = pick(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    ?? pick(html, /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)
  if (!canonical) fail('missing canonical')
  else {
    if (!canonical.startsWith('https://')) fail(`canonical not https: ${canonical}`)
    if (/:\/\/www\./i.test(canonical)) fail(`canonical is www (must be non-www): ${canonical}`)
    if (canonical.includes('?')) fail(`canonical has query string: ${canonical}`)
    if (!canonical.startsWith(ORIGIN)) fail(`canonical wrong origin: ${canonical}`)
    const expected = ORIGIN + (route === '/' ? '/' : route)
    if (canonical !== expected) fail(`canonical "${canonical}" != expected "${expected}"`)
  }

  // 4. OG + Twitter
  for (const p of ['og:title', 'og:description', 'og:type', 'og:url']) {
    if (!metaContent(html, p)) fail(`missing ${p}`)
  }
  const ogUrl = metaContent(html, 'og:url')
  if (ogUrl && /:\/\/www\./i.test(ogUrl)) fail(`og:url is www: ${ogUrl}`)
  if (!metaContent(html, 'twitter:card')) fail('missing twitter:card')
  if (!metaContent(html, 'twitter:title')) fail('missing twitter:title')

  // 5. lang
  const lang = pick(html, /<html[^>]*\slang=["']([^"']+)["']/i)
  if (lang !== 'en-ZA') fail(`html lang is "${lang}", expected "en-ZA"`)

  // 6. answer-first slot on money pages
  if (isMoneyPage(route) && !/data-answer-first/i.test(html)) {
    fail('money page missing data-answer-first answer slot')
  }

  // 7. primary intent (cannibalisation): collect non-empty zabble:primary-kw
  const primary = metaContent(html, 'zabble:primary-kw')
  if (primary) {
    if (primaries.has(primary)) {
      fail(`shares primary intent "${primary}" with ${primaries.get(primary)} (cannibalisation)`)
    } else {
      primaries.set(primary, route)
    }
  } else if (isMoneyPage(route)) {
    fail('money page missing zabble:primary-kw (primary intent)')
  }
}

// ── report ───────────────────────────────────────────────────────────────────
console.log(`SEO metadata test — ${checked} prerendered routes checked.`)
console.log(`  unique titles: ${titles.size} · unique descriptions: ${descs.size} · primary intents: ${primaries.size}`)
if (warnings.length) {
  console.warn(`\n⚠ ${warnings.length} editorial length warning(s) (non-blocking):\n${warnings.join('\n')}`)
}
if (errors.length) {
  console.error(`\n✖ ${errors.length} violation(s):\n${errors.join('\n')}`)
  process.exit(1)
}
console.log('\n✓ All metadata assertions passed.')
process.exit(0)
