// S03 structured-data validator — self-contained, reads only the prerendered
// static HTML in .output/public. Asserts: valid JSON-LD, expected @types per
// template, unique @id within a page, every @id reference resolves in-graph,
// and markup matches the SERVED page content (Service description === the
// page's own rendered <meta name="description">). Writes each page's graph to
// docs/seo/_evidence/08/. Exit 0 = all pass; 1 = any failure.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'

const OUT = '.output/public'
const EV = 'docs/seo/_evidence/08'
if (!existsSync(EV)) mkdirSync(EV, { recursive: true })

let failures = 0
const log = (ok, msg) => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`) }

const read = (p) => readFileSync(p, 'utf8')
function graphOf(html, where) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  if (blocks.length === 0) throw new Error(`no ld+json in ${where}`)
  if (blocks.length > 1) throw new Error(`>1 ld+json block in ${where} (${blocks.length})`)
  const parsed = JSON.parse(blocks[0][1])
  return parsed['@graph'] ?? [parsed]
}
function metaDescription(html) {
  const m = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)
    || html.match(/<meta[^>]+content="([^"]*)"[^>]+name="description"/i)
  return m ? m[1] : null
}
// HTML-entity decode for comparing meta content to JSON values
const decode = (s) => s == null ? s : s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")

const typesOf = (g) => g.flatMap((n) => [].concat(n['@type']))
function refsIn(obj, acc = []) {
  if (Array.isArray(obj)) obj.forEach((o) => refsIn(o, acc))
  else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === '@id') continue
      if (v && typeof v === 'object' && !Array.isArray(v) && typeof v['@id'] === 'string' && Object.keys(v).length === 1)
        acc.push(v['@id'])
      else refsIn(v, acc)
    }
  }
  return acc
}
function commonChecks(graph, label) {
  const ids = graph.map((n) => n['@id']).filter(Boolean)
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i)
  log(dupes.length === 0, `[${label}] unique @id (${ids.length} nodes; dupes: ${dupes.join(',') || 'none'})`)
  const idSet = new Set(ids)
  const dangling = [...new Set(refsIn(graph))].filter((r) => !idSet.has(r))
  log(dangling.length === 0, `[${label}] all @id refs resolve in-graph (dangling: ${dangling.join(',') || 'none'})`)
}

function loadPage(path, label) {
  const html = read(path)
  const graph = graphOf(html, label)
  writeFileSync(`${EV}/jsonld__${label}.json`, JSON.stringify(graph, null, 2))
  return { html, graph, byType: (t) => graph.find((n) => [].concat(n['@type']).includes(t)) }
}

// ── Home ─────────────────────────────────────────────────────────────────────
console.log('\n── home (/)')
{
  const { graph, byType } = loadPage(`${OUT}/index.html`, 'home')
  commonChecks(graph, 'home')
  const org = byType('Organization')
  log(org?.['@id'] === 'https://zabble.org/#identity', 'Organization @id = /#identity')
  log(org?.name === 'Zabble' && !!org?.email && org?.address?.addressCountry === 'ZA', 'Organization name/email/address(ZA)')
  log(!('sameAs' in (org || {})), 'no fabricated sameAs (intentionally absent until verified)')
  log(byType('WebSite')?.publisher?.['@id'] === 'https://zabble.org/#identity', 'WebSite publisher → Organization')
  const wp = byType('WebPage')
  log(wp?.about?.['@id'] === 'https://zabble.org/#identity', 'WebPage about → Organization')
  log(wp?.isPartOf?.['@id'] === 'https://zabble.org/#website', 'WebPage isPartOf → WebSite')
}

// ── System pages: scan all, classify by presence of Service ──────────────────
console.log('\n── system detail pages')
const sysDirs = readdirSync(`${OUT}/systems`, { withFileTypes: true })
  .filter((d) => d.isDirectory()).map((d) => d.name)
const withService = []
const withoutService = []
let savedSample = false
for (const slug of sysDirs) {
  const p = `${OUT}/systems/${slug}/index.html`
  if (!existsSync(p)) continue
  const html = read(p)
  let graph
  try { graph = graphOf(html, `system-${slug}`) } catch (e) { log(false, `[${slug}] ${e.message}`); continue }
  const byType = (t) => graph.find((n) => [].concat(n['@type']).includes(t))
  const svc = byType('Service')
  const isItemPage = typesOf(graph).includes('ItemPage')
  const bc = byType('BreadcrumbList')
  // Per-page structural checks (kept terse; aggregate pass/fail)
  if (!isItemPage) log(false, `[${slug}] WebPage typed ItemPage`)
  if (!bc || bc.itemListElement?.length !== 3) log(false, `[${slug}] breadcrumb has 3 items`)
  commonChecks(graph, slug)
  if (svc) {
    withService.push(slug)
    // markup-matches-content: Service.description === the page's served meta description
    const md = decode(metaDescription(html))
    log(svc.description === md, `[${slug}] Service.description === served <meta description>`)
    log(svc.provider?.['@id'] === 'https://zabble.org/#identity', `[${slug}] Service provider → Organization`)
    log(svc['@id'] === `https://zabble.org/systems/${slug}#service`, `[${slug}] Service @id page-unique`)
    log(bc?.itemListElement?.at(-1)?.name === svc.name, `[${slug}] last breadcrumb === Service name`)
    if (!savedSample) { writeFileSync(`${EV}/jsonld__system-${slug}.json`, JSON.stringify(graph, null, 2)); savedSample = true }
  } else {
    withoutService.push(slug)
  }
}
console.log(`   systems with Service (live/content): ${withService.length}`)
console.log(`   systems without Service (concept/TODO): ${withoutService.length} ${withoutService.length ? '['+withoutService.join(', ')+']' : ''}`)

// ── Systems index: CollectionPage + ItemList must match the live set ─────────
console.log('\n── systems index (/systems)')
{
  const { graph, byType } = loadPage(`${OUT}/systems/index.html`, 'systems-index')
  commonChecks(graph, 'systems-index')
  log(typesOf(graph).includes('CollectionPage'), 'WebPage typed CollectionPage')
  log(byType('BreadcrumbList')?.itemListElement?.length === 2, 'breadcrumb has 2 items (Home → Systems)')
  const il = byType('ItemList')
  log(!!il, 'has ItemList')
  log(il?.itemListElement?.length === withService.length,
    `ItemList length (${il?.itemListElement?.length}) === # content-bearing system pages (${withService.length})`)
  const urlSlugs = new Set((il?.itemListElement || []).map((e) => (e.url || '').replace(/^https:\/\/zabble\.org\/systems\//, '').replace(/\/$/, '')))
  const matchesService = withService.every((s) => urlSlugs.has(s))
  log(matchesService, 'every content-bearing system is listed in ItemList')
  const noConceptLeak = withoutService.every((s) => !urlSlugs.has(s))
  log(noConceptLeak, 'no concept/TODO system leaked into ItemList')
  const positionsOk = (il?.itemListElement || []).every((e, i) => e.position === i + 1)
  log(positionsOk, 'ItemList positions are 1..N sequential')
}

// ── Diagnose: WebPage only, no fabricated FAQPage ────────────────────────────
console.log('\n── diagnose (/diagnose)')
{
  const { graph, byType } = loadPage(`${OUT}/diagnose/index.html`, 'diagnose')
  commonChecks(graph, 'diagnose')
  log(!!byType('WebPage'), 'has WebPage')
  log(!byType('FAQPage'), 'no FAQPage (form prompts are not Q&A — correct)')
}

console.log(`\n${failures === 0 ? '✅ ALL CHECKS PASSED' : '❌ ' + failures + ' CHECK(S) FAILED'}`)
process.exit(failures === 0 ? 0 : 1)
