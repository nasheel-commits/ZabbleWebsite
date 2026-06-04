import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { ARTICLES, SITE_URL } from '~/data/articles'

// Verifies that `nuxt generate` produced real server-rendered HTML for every
// article route, with title, canonical, the answer-first block and the FAQ —
// i.e. crawlers and AI engines get full content, not an empty shell.
// Skips (with a clear message) when .output/public is absent, so `npm test`
// passes pre-build; run `npm run generate` first to exercise it.

const publicDir = fileURLToPath(new URL('./../.output/public', import.meta.url))
const haveBuild = existsSync(publicDir)

function htmlFor(canonicalPath: string): string {
  const file = `${publicDir}${canonicalPath}/index.html`
  return readFileSync(file, 'utf8')
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

/** Collapse text to a punctuation/tag/entity-insensitive alphanumeric key. */
function alnum(s: string): string {
  return decodeEntities(s).toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Strip HTML tags, then reduce to an alphanumeric key for robust contains(). */
function pageKey(html: string): string {
  return alnum(html.replace(/<[^>]+>/g, ' '))
}

/** First ~44 alphanumeric chars of a string — survives entities & punctuation. */
function probe(text: string): string {
  return alnum(text).slice(0, 44)
}

// The four pillar hubs (/what-we-build/<pillar>) render via the canonical
// structural hub template (S04 IA owner) — answer-first block + cited GEO stat
// + member systems — NOT the article template, so they are excluded from the
// article-HTML assertions here. Their integrity is covered by the architecture
// suite (members/breadcrumbs/orphans/depth) + geo suite (cited stat). The
// editorial articles (/blog/*) and the bespoke-systems thesis still render via
// ArticleView and are asserted below.
const PILLAR_HUB_PATHS = new Set([
  '/what-we-build/automation',
  '/what-we-build/audit-trails',
  '/what-we-build/anomaly-detection',
  '/what-we-build/analytics',
])

describe.skipIf(!haveBuild)('prerendered article HTML', () => {
  for (const a of ARTICLES.filter((a) => !PILLAR_HUB_PATHS.has(a.canonicalPath))) {
    describe(a.canonicalPath, () => {
      const html = haveBuild ? htmlFor(a.canonicalPath) : ''
      const key = haveBuild ? pageKey(html) : ''

      it('was generated to a static index.html', () => {
        expect(existsSync(`${publicDir}${a.canonicalPath}/index.html`)).toBe(true)
      })
      it('contains a canonical link to the production URL', () => {
        expect(html).toContain(`rel="canonical"`)
        expect(html).toContain(`${SITE_URL}${a.canonicalPath}`)
      })
      it('server-rendered a meta description', () => {
        expect(html).toContain('name="description"')
      })
      it('server-rendered the answer-first block', () => {
        expect(html).toContain('data-answer-first')
        expect(key).toContain(probe(a.answer))
      })
      it('server-rendered the FAQ block', () => {
        expect(html).toContain('Frequently asked questions')
        // first FAQ question text present
        expect(key).toContain(probe(a.faq[0]!.q))
      })
      it('server-rendered the title text', () => {
        expect(key).toContain(probe(a.title))
      })
      it('server-rendered at least one source citation', () => {
        expect(html).toContain('Sources')
        expect(key).toContain(probe(a.sources[0]!.publisher))
      })
    })
  }
})

describe.skipIf(haveBuild)('prerender check (skipped — no build)', () => {
  it('run `npm run generate` to exercise the prerender assertions', () => {
    expect(true).toBe(true)
  })
})
