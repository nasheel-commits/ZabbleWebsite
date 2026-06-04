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

/** First ~6 alphanumeric words of a string, for a quote-safe contains check. */
function probe(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .join(' ')
}

describe.skipIf(!haveBuild)('prerendered article HTML', () => {
  for (const a of ARTICLES) {
    describe(a.canonicalPath, () => {
      const html = haveBuild ? htmlFor(a.canonicalPath) : ''

      it('was generated to a static index.html', () => {
        expect(existsSync(`${publicDir}${a.canonicalPath}/index.html`)).toBe(true)
      })
      it('contains a canonical link to the production URL', () => {
        expect(html).toContain(`rel="canonical"`)
        expect(html).toContain(`${SITE_URL}${a.canonicalPath}`)
      })
      it('server-rendered the answer-first block', () => {
        expect(html).toContain('data-answer-first')
        expect(html).toContain(probe(a.answer))
      })
      it('server-rendered the FAQ block', () => {
        expect(html).toContain('Frequently asked questions')
      })
      it('server-rendered the title text', () => {
        expect(html).toContain(probe(a.title))
      })
    })
  }
})

describe.skipIf(haveBuild)('prerender check (skipped — no build)', () => {
  it('run `npm run generate` to exercise the prerender assertions', () => {
    expect(true).toBe(true)
  })
})
