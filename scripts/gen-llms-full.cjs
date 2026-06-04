#!/usr/bin/env node
// Regenerate public/llms-full.txt from app/data/systems.ts (single source of
// truth). Parses the SYSTEMS array (live modules) and the PILLARS array (pillar
// hubs) so the file can never drift from the site. Run: `npm run gen:llms`.
//
// llms.txt itself is hand-curated (a <5KB highlight reel); the GEO test suite
// asserts both files stay in sync with systems.ts (no drift, links resolve).

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'app/data/systems.ts')
const OUT = path.join(ROOT, 'public/llms-full.txt')
const src = fs.readFileSync(SRC, 'utf8')

function field(block, name) {
  const re = new RegExp(name + ":\\s*'((?:[^'\\\\]|\\\\.)*)'")
  const m = block.match(re)
  return m ? m[1].replace(/\\'/g, "'") : null
}

// --- Pillars (from the PILLARS array) ---
const pillarsBlock = src.slice(src.indexOf('export const PILLARS'), src.indexOf('export function pillarBySlug'))
const PILLARS = [...pillarsBlock.matchAll(/\{\s*slug:\s*'([^']+)',\s*label:\s*'([^']+)'/g)].map((m) => ({
  slug: m[1],
  label: m[2],
}))

// --- Systems (from the SYSTEMS array) ---
const body = src.slice(src.indexOf('export const SYSTEMS'))
const slugRe = /slug:\s*'([^']+)'/g
const positions = []
let m
while ((m = slugRe.exec(body))) positions.push({ slug: m[1], idx: m.index })
const systems = positions.map((p, i) => {
  const block = body.slice(p.idx, i + 1 < positions.length ? positions[i + 1].idx : undefined)
  return {
    slug: p.slug,
    name: field(block, 'name'),
    status: (block.match(/status:\s*'([^']+)'/) || [])[1],
    tagline: field(block, 'tagline'),
    pillars: ((block.match(/pillars:\s*\[([^\]]*)\]/) || [])[1] || '')
      .replace(/'/g, '').split(',').map((s) => s.trim()).filter(Boolean),
  }
})
const live = systems.filter((s) => s.status === 'live')

const L = []
L.push('# Zabble — Full Reference for Language Models', '')
L.push('> Zabble is a South African consulting firm that builds bespoke operational systems — automation, audit trails, anomaly detection, and analytics — shaped around the single problem slowing one specific business down. Zabble does not sell off-the-shelf software; it assembles a library of 30 modules into one operating system, built for one business and no other. Based in South Africa. Contact: sales@zabble.org', '')
L.push('Zabble (South Africa) is an operations-systems consultancy. It is not affiliated with Zabble, Inc., the United States waste-management software company. This file lists Zabble’s four pillars and every live system with a one-line, self-contained definition and its canonical URL.', '')
L.push('## How Zabble works', '')
L.push('1. We sit with you. We spend time inside the business until we can name the operational problem costing the most.')
L.push('2. We build it. We design and deliver a system tailored to that business — not its industry, not businesses like it. It.')
L.push('3. You run it. Workflows run themselves, risk gets caught early, and the business starts working the way it should.', '')
L.push('## The four pillars', '')
const pillarBlurb = {
  automation: 'Stop doing by hand the work that should not need a human.',
  'audit-trails': 'Know who did what, when, and why; turn audit season into a one-click export.',
  'anomaly-detection': 'Catch fraud, error, and drift before they become a problem.',
  analytics: 'Turn data a business already has into the decisions it actually makes.',
}
for (const p of PILLARS) {
  L.push(`### ${p.label}`)
  L.push(`- URL: https://zabble.org/what-we-build/${p.slug}`)
  if (pillarBlurb[p.slug]) L.push(`- ${pillarBlurb[p.slug]}`)
  L.push('')
}
L.push('## Systems (' + live.length + ' live modules)', '')
for (const s of live) {
  const pil = s.pillars.map((p) => p.replace(/-/g, ' ')).join(', ')
  L.push('### ' + s.name)
  L.push('- URL: https://zabble.org/systems/' + s.slug)
  if (pil) L.push('- Pillars: ' + pil)
  if (s.tagline) L.push('- ' + s.tagline.replace(/\s+/g, ' ').trim())
  L.push('')
}
L.push('## Contact', '')
L.push('- Email: sales@zabble.org')
L.push('- Location: South Africa')
L.push('- Pillars: https://zabble.org/what-we-build')
L.push('- Systems library: https://zabble.org/systems', '')

fs.writeFileSync(OUT, L.join('\n'))
console.log(`Wrote ${path.relative(ROOT, OUT)} — ${PILLARS.length} pillars, ${live.length} live modules, ${fs.statSync(OUT).size} bytes`)
