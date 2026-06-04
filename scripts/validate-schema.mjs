// S03 structured-data validator — self-contained, reads only the prerendered
// static HTML in .output/public. It proves the JSON-LD is valid, complete,
// interlinked, and — crucially — byte-consistent with the VISIBLE page content.
//
// Asserts, per template:
//   • exactly one ld+json block, valid JSON, expected @types
//   • @id unique within each page; every @id reference resolves in-graph
//   • Service.description === the page's rendered <meta name="description">
//   • FAQPage Question/answer text === the rendered <dt>/<dd> text, byte-for-byte
//   • WebPage.mainEntity links every Question (and only those)
//   • Organization identity carries the canonical description, disambiguation,
//     areaServed, knowsAbout — and NO fabricated sameAs/logo
//   • pages without a visible FAQ emit no FAQPage/Question (no markup-only claims)
//
// Writes rendered graphs + RRT paste-in to docs/seo/_evidence/08/.
// Exit 0 = all pass; 1 = any failure.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'

const OUT = '.output/public'
const EV = 'docs/seo/_evidence/08'
if (!existsSync(EV)) mkdirSync(EV, { recursive: true })

let failures = 0
const log = (ok, msg) => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`) }
const read = (p) => readFileSync(p, 'utf8')

const CANON_DESC =
  'Zabble is a South African consulting firm that builds bespoke operational systems — automation, audit trails, anomaly detection, and analytics — shaped around the single problem slowing one specific business down.'

// ── parsing helpers ──────────────────────────────────────────────────────────
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
// Decode the HTML entities a Vue text interpolation can introduce, so the
// extracted DOM text can be byte-compared to the raw JSON string.
const decode = (s) => s == null ? s : s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
// Extract the ordered FAQ pairs the <FaqList> renders: each <dt> question and
// its following <dd> answer. Scoped to FaqList's own <dl> (class `divide-y
// divide-line`) so the SystemHero metadata <dl> (Industry/Best for) is NOT
// mistaken for FAQ content. Surrounding template whitespace is trimmed (layout,
// not content); the inner text is the data string verbatim.
const FAQ_DL = /<dl[^>]*divide-y divide-line[^>]*>([\s\S]*?)<\/dl>/g
function renderedFaqPairs(html) {
  const pairs = []
  for (const dl of [...html.matchAll(FAQ_DL)].map((m) => m[1])) {
    const dts = [...dl.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>/g)].map((m) => decode(m[1].trim()))
    const dds = [...dl.matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/g)].map((m) => decode(m[1].trim()))
    dts.forEach((q, i) => pairs.push({ question: q, answer: dds[i] }))
  }
  return pairs
}
const hasFaqList = (html) => /<dl[^>]*divide-y divide-line[^>]*>/.test(html)

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
// FAQ: assert the FAQPage Question/answer JSON is byte-identical to the rendered
// <dt>/<dd>, in order, and that mainEntity links exactly those Questions.
function checkFaqByteIdentity(graph, html, label) {
  const rendered = renderedFaqPairs(html)
  const wp = graph.find((n) => [].concat(n['@type']).includes('FAQPage'))
  const questions = graph.filter((n) => [].concat(n['@type']).includes('Question'))
  log(!!wp, `[${label}] WebPage typed FAQPage`)
  log(questions.length === rendered.length,
    `[${label}] Question count (${questions.length}) === rendered FAQ pairs (${rendered.length})`)
  let identical = questions.length === rendered.length && rendered.length > 0
  for (let i = 0; i < Math.min(questions.length, rendered.length); i++) {
    const qn = questions[i]
    const ans = typeof qn.acceptedAnswer === 'string' ? qn.acceptedAnswer : qn.acceptedAnswer?.text
    if (qn.name !== rendered[i].question || ans !== rendered[i].answer) {
      identical = false
      console.log(`      ↳ mismatch [${label}] #${i + 1}\n        Q json: ${JSON.stringify(qn.name)}\n        Q dom : ${JSON.stringify(rendered[i].question)}\n        A json: ${JSON.stringify(ans)}\n        A dom : ${JSON.stringify(rendered[i].answer)}`)
    }
  }
  log(identical, `[${label}] FAQ JSON-LD text === rendered <dt>/<dd> text, byte-for-byte`)
  // mainEntity must reference exactly the Question @ids
  const meRefs = new Set([].concat(wp?.mainEntity ?? []).map((r) => r?.['@id']).filter(Boolean))
  const qIds = new Set(questions.map((q) => q['@id']))
  const sameSet = meRefs.size === qIds.size && [...qIds].every((id) => meRefs.has(id))
  log(sameSet, `[${label}] FAQPage.mainEntity links exactly the ${qIds.size} Question node(s)`)
}
function loadPage(path, label) {
  const html = read(path)
  const graph = graphOf(html, label)
  writeFileSync(`${EV}/jsonld__${label}.json`, JSON.stringify(graph, null, 2))
  return { html, graph, byType: (t) => graph.find((n) => [].concat(n['@type']).includes(t)) }
}

// ── Home: identity + FAQPage ─────────────────────────────────────────────────
console.log('\n── home (/)')
{
  const { html, graph, byType } = loadPage(`${OUT}/index.html`, 'home')
  commonChecks(graph, 'home')
  const org = byType('Organization')
  log(org?.['@id'] === 'https://zabble.org/#identity', 'Organization @id = /#identity')
  log(org?.name === 'Zabble', 'Organization name = Zabble')
  log(org?.description === CANON_DESC, 'Organization description === canonical boilerplate (byte-exact)')
  log(typeof org?.disambiguatingDescription === 'string' && /Zabble, Inc\./.test(org.disambiguatingDescription),
    'disambiguatingDescription present (US homonym)')
  log(Array.isArray(org?.areaServed) && org.areaServed.some((a) => a.name === 'South Africa'),
    'areaServed includes South Africa (+ metros)')
  log(Array.isArray(org?.knowsAbout) && org.knowsAbout.length === 10, `knowsAbout has 10 entries (got ${org?.knowsAbout?.length})`)
  log(!('sameAs' in org), 'no fabricated sameAs (PENDING until profiles live)')
  log(!('logo' in org), 'no fabricated logo (wired-on-arrival; no asset yet)')
  log(org?.email === 'sales@zabble.org', 'Organization email present')
  log(byType('WebSite')?.publisher?.['@id'] === 'https://zabble.org/#identity', 'WebSite publisher → Organization')
  const wp = byType('WebPage')
  log(wp?.about?.['@id'] === 'https://zabble.org/#identity', 'WebPage about → Organization')
  log(wp?.isPartOf?.['@id'] === 'https://zabble.org/#website', 'WebPage isPartOf → WebSite')
  checkFaqByteIdentity(graph, html, 'home')
}

// ── System pages: classify, byte-check FAQ where present, none where absent ──
console.log('\n── system detail pages')
const sysDirs = readdirSync(`${OUT}/systems`, { withFileTypes: true })
  .filter((d) => d.isDirectory()).map((d) => d.name)
const withService = []; const withFaq = []; const withoutFaq = []
const SAVE = new Set(['bespoke-crm', 'integration-hub']) // one FAQ + one plain → RRT paste-in
for (const slug of sysDirs) {
  const p = `${OUT}/systems/${slug}/index.html`
  if (!existsSync(p)) continue
  const html = read(p)
  let graph
  try { graph = graphOf(html, `system-${slug}`) } catch (e) { log(false, `[${slug}] ${e.message}`); continue }
  const byType = (t) => graph.find((n) => [].concat(n['@type']).includes(t))
  commonChecks(graph, slug)
  if (!typesOf(graph).includes('ItemPage')) log(false, `[${slug}] WebPage typed ItemPage`)
  const bc = byType('BreadcrumbList')
  if (bc?.itemListElement?.length !== 3) log(false, `[${slug}] breadcrumb has 3 items`)
  const svc = byType('Service')
  if (svc) {
    withService.push(slug)
    const md = decode(metaDescription(html))
    log(svc.description === md, `[${slug}] Service.description === served <meta description>`)
    log(svc.provider?.['@id'] === 'https://zabble.org/#identity', `[${slug}] Service provider → Organization`)
    log(svc['@id'] === `https://zabble.org/systems/${slug}#service`, `[${slug}] Service @id page-unique`)
    log(bc?.itemListElement?.at(-1)?.name === svc.name, `[${slug}] last breadcrumb === Service name`)
  }
  const hasFaqDom = hasFaqList(html)
  const hasFaqSchema = typesOf(graph).includes('FAQPage')
  if (hasFaqDom || hasFaqSchema) {
    withFaq.push(slug)
    checkFaqByteIdentity(graph, html, slug)
  } else {
    withoutFaq.push(slug)
    log(!hasFaqSchema && !graph.some((n) => [].concat(n['@type']).includes('Question')),
      `[${slug}] no FAQPage/Question when page has no FAQ (no markup-only claim)`)
  }
  if (SAVE.has(slug)) writeFileSync(`${EV}/jsonld__system-${slug}.json`, JSON.stringify(graph, null, 2))
}
console.log(`   Service nodes: ${withService.length} | FAQ pages: ${withFaq.length} [${withFaq.join(', ')}] | non-FAQ: ${withoutFaq.length}`)

// ── Systems index ────────────────────────────────────────────────────────────
console.log('\n── systems index (/systems)')
{
  const { graph, byType } = loadPage(`${OUT}/systems/index.html`, 'systems-index')
  commonChecks(graph, 'systems-index')
  log(typesOf(graph).includes('CollectionPage'), 'WebPage typed CollectionPage')
  log(byType('BreadcrumbList')?.itemListElement?.length === 2, 'breadcrumb has 2 items')
  const il = byType('ItemList')
  log(il?.itemListElement?.length === withService.length,
    `ItemList length (${il?.itemListElement?.length}) === content-bearing system pages (${withService.length})`)
  const positionsOk = (il?.itemListElement || []).every((e, i) => e.position === i + 1)
  log(positionsOk, 'ItemList positions are 1..N sequential')
}

// ── Diagnose: WebPage only, no fabricated FAQPage ────────────────────────────
console.log('\n── diagnose (/diagnose)')
{
  const { html, graph, byType } = loadPage(`${OUT}/diagnose/index.html`, 'diagnose')
  commonChecks(graph, 'diagnose')
  log(!!byType('WebPage'), 'has WebPage')
  log(!byType('FAQPage') && !hasFaqList(html), 'no FAQPage (form prompts are not Q&A — correct)')
}

console.log(`\n${failures === 0 ? '✅ ALL CHECKS PASSED' : '❌ ' + failures + ' CHECK(S) FAILED'}`)
process.exit(failures === 0 ? 0 : 1)
