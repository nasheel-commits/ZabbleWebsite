// Architecture & internal-linking tests (SEO S04).
//
// These assert the hub-and-spoke architecture against the REAL generated output
// in .output/public — i.e. exactly what a crawler / browser receives. Run AFTER
// `npm run generate`:
//
//     npm run generate && npm run test:arch
//
// They are dependency-free (Node's built-in node:test + node:assert), so they
// add nothing to package.json's deps and never touch the (junctioned) node_modules.
//
// Coverage (maps to internal-linking rules L1–L12 + the goal conditions):
//   - every live module page is generated;
//   - ZERO orphans (every indexable page has >=1 inbound internal link)         [L3]
//   - max crawl depth <=3 from home                                             [L1]
//   - breadcrumbs present on every relevant template                           [L4]
//   - each pillar hub links ALL its members AND every member links back        [L6/L2]
//   - the 4 pillar hubs exist and replace faceted ?pillar= URLs                [A3/A5]
//   - the 2 concept/thin pages are delinked (no inbound links, not generated)  [L3]
//   - every internal link resolves (no broken internal links)                  [link-checker]
//   - footer is a sitewide hub block (/systems + 4 hubs on every page)         [L7]
//   - home links to /systems + all 4 pillar hubs                               [L8]

import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, sep } from 'node:path'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const PUBLIC_DIR = join(ROOT, '.output', 'public')
const SYSTEMS_TS = join(ROOT, 'app', 'data', 'systems.ts')

const PILLAR_SLUGS = ['automation', 'audit-trails', 'anomaly-detection', 'analytics']
const HUB_ROUTES = PILLAR_SLUGS.map((p) => `/what-we-build/${p}`)

// ---------------------------------------------------------------------------
// Ground truth: parse the single source of truth (app/data/systems.ts) for each
// system's slug, pillars and status. Scoped to the SYSTEMS array so PILLARS /
// interface declarations can't pollute the parse.
// ---------------------------------------------------------------------------
function parseSystems() {
  const src = readFileSync(SYSTEMS_TS, 'utf8')
  const start = src.indexOf('export const SYSTEMS')
  const end = src.indexOf('export function systemBySlug')
  assert.ok(start !== -1 && end !== -1 && end > start, 'could not locate SYSTEMS array in systems.ts')
  const slice = src.slice(start, end)
  const re = /slug:\s*'([^']+)'[\s\S]*?name:\s*'([^']*)'[\s\S]*?pillars:\s*\[([^\]]*)\][\s\S]*?status:\s*'([^']+)'/g
  const out = []
  let m
  while ((m = re.exec(slice))) {
    const slug = m[1]
    const name = m[2]
    const pillars = m[3]
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
    out.push({ slug, name, pillars, status: m[4] })
  }
  return out
}

// ---------------------------------------------------------------------------
// Crawl the generated output into a route graph.
// ---------------------------------------------------------------------------
function walk(dir) {
  const files = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) files.push(...walk(full))
    else if (name.endsWith('.html')) files.push(full)
  }
  return files
}

/** Map a generated .html file path to its canonical route. */
function fileToRoute(file) {
  let rel = relative(PUBLIC_DIR, file).split(sep).join('/')
  rel = rel.replace(/index\.html$/, '').replace(/\.html$/, '')
  rel = rel.replace(/\/$/, '')
  return '/' + rel === '/' ? '/' : '/' + rel.replace(/^\//, '')
}

/** Normalize an href to a canonical internal route, or null if not an internal page. */
function hrefToRoute(href) {
  if (!href) return null
  // Absolute URLs: strip ONLY our own origin; any other host is external (e.g.
  // the cited source links in /blog articles — 411locals.us, apqc.org, …). The
  // earlier blanket strip of `https?://[^/]+` mis-read external citation paths as
  // internal and reported them as broken.
  const m = href.match(/^https?:\/\/([^/]+)(\/.*)?$/i)
  if (m) {
    if (!/(^|\.)zabble\.org$/i.test(m[1])) return null // external domain
    href = m[2] || '/'
  }
  if (!href.startsWith('/')) return null // relative #hash, mailto:, tel:, external
  if (href.startsWith('/_') || href.startsWith('/api/')) return null // assets / api
  // drop query + hash
  href = href.split('#')[0].split('?')[0]
  if (href === '' || href === '/') return '/'
  href = href.replace(/\/$/, '')
  // skip anything that looks like a static file (has an extension in last segment)
  const last = href.split('/').pop()
  if (last && last.includes('.')) return null
  return href
}

function extractInternalLinks(html) {
  const routes = new Set()
  const re = /<a\b[^>]*\bhref\s*=\s*"([^"]*)"/gi
  let m
  while ((m = re.exec(html))) {
    const r = hrefToRoute(m[1])
    if (r) routes.add(r)
  }
  return routes
}

// Shared state built once.
const G = {
  systems: [],
  liveSlugs: [],
  conceptSlugs: [],
  routes: new Set(),
  html: new Map(), // route -> html
  out: new Map(), // route -> Set<route> internal targets (resolvable + unresolved)
}

before(() => {
  assert.ok(
    existsSync(PUBLIC_DIR),
    `.output/public not found — run \`npm run generate\` before the tests (looked in ${PUBLIC_DIR})`,
  )
  G.systems = parseSystems()
  G.liveSlugs = G.systems.filter((s) => s.status === 'live').map((s) => s.slug)
  G.conceptSlugs = G.systems.filter((s) => s.status !== 'live').map((s) => s.slug)

  const IGNORE = new Set(['/200', '/404'])
  for (const file of walk(PUBLIC_DIR)) {
    const route = fileToRoute(file)
    if (IGNORE.has(route)) continue
    const html = readFileSync(file, 'utf8')
    G.routes.add(route)
    G.html.set(route, html)
    G.out.set(route, extractInternalLinks(html))
  }
})

// ---------------------------------------------------------------------------
test('sanity: parsed 30 live + 2 concept systems from systems.ts', () => {
  assert.equal(G.liveSlugs.length, 30, `expected 30 live modules, got ${G.liveSlugs.length}`)
  assert.equal(G.conceptSlugs.length, 2, `expected 2 concept modules, got ${G.conceptSlugs.length}`)
})

test('core routes + every live module page are generated', () => {
  for (const r of ['/', '/systems', '/diagnose', ...HUB_ROUTES]) {
    assert.ok(G.routes.has(r), `missing generated route ${r}`)
  }
  for (const slug of G.liveSlugs) {
    assert.ok(G.routes.has(`/systems/${slug}`), `missing generated module page /systems/${slug}`)
  }
})

test('the 4 pillar hubs exist (faceted ?pillar= is replaced by canonical hubs)', () => {
  for (const r of HUB_ROUTES) assert.ok(G.routes.has(r), `missing pillar hub ${r}`)
  // No generated page should still be linking the faceted facet URLs as <a href>.
  for (const [route, html] of G.html) {
    assert.ok(!/href="[^"]*\/systems\?pillar=/.test(html), `faceted ?pillar= link still present on ${route}`)
  }
})

test('L3 — zero orphans: every indexable page has >=1 inbound internal link', () => {
  const inbound = new Map([...G.routes].map((r) => [r, 0]))
  for (const [from, targets] of G.out) {
    for (const t of targets) {
      if (t !== from && inbound.has(t)) inbound.set(t, inbound.get(t) + 1)
    }
  }
  const orphans = [...inbound].filter(([r, n]) => r !== '/' && n === 0).map(([r]) => r)
  assert.deepEqual(orphans, [], `orphan pages with no inbound internal link: ${orphans.join(', ')}`)
})

test('L1 — every page is <=3 clicks from home', () => {
  // BFS over resolvable internal edges.
  const depth = new Map([['/', 0]])
  const queue = ['/']
  while (queue.length) {
    const cur = queue.shift()
    const d = depth.get(cur)
    for (const t of G.out.get(cur) ?? []) {
      if (G.routes.has(t) && !depth.has(t)) {
        depth.set(t, d + 1)
        queue.push(t)
      }
    }
  }
  const unreachable = [...G.routes].filter((r) => !depth.has(r))
  assert.deepEqual(unreachable, [], `unreachable from home: ${unreachable.join(', ')}`)
  const tooDeep = [...depth].filter(([, d]) => d > 3).map(([r, d]) => `${r}(${d})`)
  assert.deepEqual(tooDeep, [], `pages deeper than 3 clicks: ${tooDeep.join(', ')}`)
})

test('L4 — breadcrumbs present on every relevant template', () => {
  // Relevant = systems index, every live module page, every pillar hub.
  // Home (root) and /diagnose (full-screen conversion funnel, rule L9) are exempt.
  const needsCrumb = ['/systems', ...HUB_ROUTES, ...G.liveSlugs.map((s) => `/systems/${s}`)]
  for (const r of needsCrumb) {
    const html = G.html.get(r)
    assert.ok(html, `route ${r} not generated`)
    assert.ok(/aria-label="Breadcrumb"/.test(html), `breadcrumb missing on ${r}`)
  }
})

test('L6/L2 — each pillar hub links ALL its members, and every member links back', () => {
  for (const pillar of PILLAR_SLUGS) {
    const hubRoute = `/what-we-build/${pillar}`
    const members = G.systems
      .filter((s) => s.status === 'live' && s.pillars.includes(pillar))
      .map((s) => s.slug)
    assert.ok(members.length > 0, `pillar ${pillar} has no live members (parse error?)`)

    const hubTargets = G.out.get(hubRoute)
    // hub -> every member
    for (const slug of members) {
      assert.ok(
        hubTargets.has(`/systems/${slug}`),
        `hub ${hubRoute} does not link member /systems/${slug}`,
      )
    }
    // hub links ONLY members (no live module outside its membership is listed in the grid)
    const linkedModules = [...hubTargets].filter((t) => t.startsWith('/systems/') && t !== '/systems')
    for (const t of linkedModules) {
      const slug = t.slice('/systems/'.length)
      // ignore concept slugs (asserted delinked elsewhere) and the hub's own members
      if (members.includes(slug)) continue
      assert.fail(`hub ${hubRoute} links non-member ${t}`)
    }
    // member -> hub (back-link)
    for (const slug of members) {
      const modTargets = G.out.get(`/systems/${slug}`)
      assert.ok(
        modTargets.has(hubRoute),
        `module /systems/${slug} does not link back up to ${hubRoute}`,
      )
    }
  }
})

test('concept/thin pages are delinked (no inbound links, not generated)', () => {
  for (const slug of G.conceptSlugs) {
    const route = `/systems/${slug}`
    assert.ok(!G.routes.has(route), `concept page ${route} should not be generated`)
    for (const [from, targets] of G.out) {
      assert.ok(!targets.has(route), `concept page ${route} is linked from ${from} (should be delinked)`)
    }
  }
})

test('link-checker — every internal link resolves to a generated page', () => {
  const broken = []
  for (const [from, targets] of G.out) {
    for (const t of targets) {
      if (!G.routes.has(t)) broken.push(`${from} -> ${t}`)
    }
  }
  assert.deepEqual(broken, [], `broken internal links:\n  ${broken.join('\n  ')}`)
})

// Chrome-less templates: /diagnose is a full-screen conversion funnel with its
// own minimal header and no nav/footer (rule L9 — conversion pages are link
// sinks). It is reachable from every other page's nav/footer, but does not
// itself carry the sitewide block. Exempt it from the footer assertion.
const CHROMELESS = new Set(['/diagnose'])

test('L7 — footer is a sitewide hub block: /systems + 4 hubs on every chrome page', () => {
  for (const [route, targets] of G.out) {
    if (CHROMELESS.has(route)) continue
    assert.ok(targets.has('/systems'), `page ${route} missing sitewide /systems link (footer)`)
    for (const hub of HUB_ROUTES) {
      assert.ok(targets.has(hub), `page ${route} missing sitewide ${hub} link (footer)`)
    }
  }
})

test('L8 — home links to /systems and all 4 pillar hubs', () => {
  const home = G.out.get('/')
  assert.ok(home.has('/systems'), 'home does not link /systems')
  for (const hub of HUB_ROUTES) {
    assert.ok(home.has(hub), `home does not link pillar hub ${hub}`)
  }
})

test('L2 — every live module has inbound in-degree >=4 (hub + grid + contextual)', () => {
  const inbound = new Map(G.liveSlugs.map((s) => [`/systems/${s}`, 0]))
  for (const [from, targets] of G.out) {
    for (const t of targets) {
      if (t !== from && inbound.has(t)) inbound.set(t, inbound.get(t) + 1)
    }
  }
  const weak = [...inbound].filter(([, n]) => n < 4).map(([r, n]) => `${r}(${n})`)
  assert.deepEqual(weak, [], `modules with in-degree <4: ${weak.join(', ')}`)
})

test('L5 — every module page links to >=3 sibling modules (RelatedSystems)', () => {
  for (const slug of G.liveSlugs) {
    const targets = G.out.get(`/systems/${slug}`)
    const siblings = [...targets].filter(
      (t) => t.startsWith('/systems/') && t !== '/systems' && t !== `/systems/${slug}`,
    )
    assert.ok(
      siblings.length >= 3,
      `module /systems/${slug} links only ${siblings.length} sibling modules (need >=3)`,
    )
  }
})

test('L6 — each pillar hub also links the other 3 hubs and /systems', () => {
  for (const pillar of PILLAR_SLUGS) {
    const hubRoute = `/what-we-build/${pillar}`
    const targets = G.out.get(hubRoute)
    assert.ok(targets.has('/systems'), `${hubRoute} does not link /systems`)
    for (const other of HUB_ROUTES) {
      if (other === hubRoute) continue
      assert.ok(targets.has(other), `${hubRoute} does not cross-link ${other}`)
    }
  }
})

test('L9 — /diagnose is a link sink (no out-links to money pages or hubs)', () => {
  const targets = G.out.get('/diagnose') ?? new Set()
  const leaks = [...targets].filter(
    (t) => t.startsWith('/systems/') || t.startsWith('/what-we-build/'),
  )
  assert.deepEqual(leaks, [], `/diagnose leaks equity to money pages: ${leaks.join(', ')}`)
})

// Decode the handful of HTML entities that appear in module names (& -> &amp;,
// ' -> &#39;, etc.) so anchor text compares equal to the source name.
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

test('L11 — pillar hubs carry descriptive in-body anchors (module name, not "view system")', () => {
  const nameBySlug = new Map(G.systems.map((s) => [s.slug, s.name]))
  const anchorRe = /<a\b[^>]*\bhref\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  for (const pillar of PILLAR_SLUGS) {
    const html = G.html.get(`/what-we-build/${pillar}`)
    let descriptive = 0
    let m
    while ((m = anchorRe.exec(html))) {
      const route = hrefToRoute(m[1])
      if (!route || !route.startsWith('/systems/')) continue
      const slug = route.slice('/systems/'.length)
      const text = decodeEntities(m[2].replace(/<[^>]*>/g, '').trim())
      const name = nameBySlug.get(slug)
      if (name && text.includes(name)) descriptive++
    }
    assert.ok(
      descriptive >= 3,
      `pillar hub /what-we-build/${pillar} has only ${descriptive} descriptive module-name anchors (need >=3)`,
    )
  }
})
