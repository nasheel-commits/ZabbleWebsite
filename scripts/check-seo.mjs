#!/usr/bin/env node
// SEO build checks for the off-page/local landing system (S04).
//
// Dependency-free. Runs against the prerendered output in `.output/public` and
// asserts the things the off-page/local goal requires:
//   1. SERVER-RENDERED — every required page exists as static HTML with real
//      content in <main> (not an empty SPA shell) and exactly one non-empty <h1>.
//   2. UNIQUE-TITLED   — no two pages share a <title>.
//   3. INTERNAL-LINKED — the new pages link out to systems/industries/locations.
//   4. LINK-CHECKER    — every internal href resolves to a generated file (no 404s).
//
// Usage: `npm run test:seo` (run `npm run generate` first).
// Exit code 0 = all pass, 1 = any failure.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC = join(ROOT, '.output', 'public')

// --- Required new routes (the deliverable surface) + a content marker that MUST
// appear in the server-rendered HTML, proving the dynamic content rendered. ---
const REQUIRED = [
  ['/about', 'around the problem'],
  ['/press', 'write about Zabble'],
  ['/locations', 'South Africa works'],
  ['/locations/johannesburg', 'Johannesburg'],
  ['/locations/sandton', 'Sandton'],
  ['/locations/cape-town', 'Cape Town'],
  ['/locations/pretoria', 'Pretoria'],
  ['/locations/durban', 'Durban'],
  // Industries: the canonical /industries taxonomy is S02's (app/data/industries.ts) —
  // legal/hospitality/logistics/manufacturing/banking/ngo. (S10's richer
  // angle-linked industry data is an owner-checklist enhancement to fold in later;
  // see docs/seo/status.md integration notes.)
  ['/industries', 'Shaped to your business'],
  ['/industries/legal', 'South African law firms'],
  ['/industries/hospitality', 'hospitality'],
  ['/industries/logistics', 'logistics'],
  ['/industries/manufacturing', 'manufacturing'],
  ['/industries/banking', 'financial services'],
  ['/industries/ngo', 'NGOs'],
  ['/insights', 'questions buyers actually ask'],
  ['/insights/south-african-operations-software-landscape', 'Operations-Software Landscape'],
]

const fail = []
const warn = []
const pass = []
function ok(m) { pass.push(m) }
function bad(m) { fail.push(m) }

if (!existsSync(PUBLIC)) {
  console.error(`✗ ${relative(ROOT, PUBLIC)} not found — run \`npm run generate\` first.`)
  process.exit(1)
}

// Resolve a route to its generated HTML file, mirroring Nitro's output layout.
function routeToFile(route) {
  const clean = route.split('#')[0].split('?')[0]
  const candidates =
    clean === '/'
      ? ['index.html']
      : [
          join(clean.slice(1), 'index.html'),
          `${clean.slice(1)}.html`,
          clean.slice(1),
        ]
  for (const c of candidates) {
    const f = join(PUBLIC, c)
    if (existsSync(f) && statSync(f).isFile()) return f
  }
  return null
}

function textOf(html, tag) {
  const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null
}
function mainText(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''
}

// --- 1. Required pages: exist, server-rendered, single non-empty h1, content marker.
for (const [route, marker] of REQUIRED) {
  const f = routeToFile(route)
  if (!f) { bad(`MISSING page: ${route}`); continue }
  const html = readFileSync(f, 'utf8')
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
  if (h1s.length === 0) bad(`${route}: no <h1>`)
  else if (h1s.length > 1) bad(`${route}: ${h1s.length} <h1> elements (want exactly 1)`)
  else if (!h1s[0][1].replace(/<[^>]+>/g, '').trim()) bad(`${route}: empty <h1>`)
  const body = mainText(html)
  if (body.length < 400) bad(`${route}: <main> has only ${body.length} chars of text (looks like an empty shell)`)
  if (!html.includes(marker)) bad(`${route}: server-rendered content missing marker "${marker}"`)
  if (routeToFile(route)) ok(`server-rendered: ${route}`)
}

// --- Gather ALL generated pages for title-uniqueness + link crawl.
function walk(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    const s = statSync(p)
    if (s.isDirectory()) out.push(...walk(p))
    else if (e.endsWith('.html')) out.push(p)
  }
  return out
}
const htmlFiles = walk(PUBLIC).filter((f) => {
  const b = f.toLowerCase()
  return !b.endsWith('200.html') && !b.endsWith('404.html')
})

// --- 2. Unique titles across all real pages.
const titles = new Map()
for (const f of htmlFiles) {
  const t = textOf(readFileSync(f, 'utf8'), 'title')
  if (!t) { bad(`${relative(PUBLIC, f)}: missing <title>`); continue }
  if (!titles.has(t)) titles.set(t, [])
  titles.get(t).push(relative(PUBLIC, f))
}
for (const [t, files] of titles) {
  if (files.length > 1) bad(`Duplicate <title> "${t}" on: ${files.join(', ')}`)
}
ok(`unique titles: ${titles.size} distinct across ${htmlFiles.length} pages`)

// --- 3. Internal-linking: each new landing must link to money/hub pages.
const linkReq = [
  ['/locations/johannesburg', '/systems/'],
  ['/locations/cape-town', '/industries/'],
  ['/industries/legal', '/systems/'],
  ['/insights/south-african-operations-software-landscape', '/systems/'],
  ['/about', '/locations'],
]
for (const [route, mustLink] of linkReq) {
  const f = routeToFile(route)
  if (!f) continue
  const html = readFileSync(f, 'utf8')
  if (html.includes(`href="${mustLink}`)) ok(`${route} links to ${mustLink}*`)
  else bad(`${route}: expected an internal link to ${mustLink}*`)
}

// --- 4. Link-checker: every internal href resolves to a generated file.
let linkCount = 0
const broken = new Set()
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8')
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = m[1]
    if (href.startsWith('/_') || href.startsWith('//')) continue // assets, protocol-rel
    if (/\.(css|js|json|woff2?|ico|png|jpe?g|svg|webp|xml|txt)$/i.test(href)) continue
    linkCount++
    if (!routeToFile(href)) broken.add(`${href}  (on ${relative(PUBLIC, f)})`)
  }
}
if (broken.size) for (const b of broken) bad(`BROKEN internal link: ${b}`)
else ok(`link-checker: ${linkCount} internal links, 0 broken`)

// --- Report.
console.log('\nSEO build checks — off-page/local landing system\n' + '='.repeat(52))
for (const p of pass) console.log(`  ✓ ${p}`)
if (warn.length) { console.log(''); for (const w of warn) console.log(`  ! ${w}`) }
if (fail.length) {
  console.log('')
  for (const f of fail) console.log(`  ✗ ${f}`)
  console.log(`\n${fail.length} check(s) FAILED.`)
  process.exit(1)
}
console.log(`\nAll checks passed (${pass.length}).`)
process.exit(0)
