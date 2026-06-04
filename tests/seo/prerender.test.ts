// SEO-regression suite — assertions against the built static output
// (.output/public). Run `npm run build` (or `npm run test:seo`, which builds
// indexable) first; otherwise these are skipped with a visible placeholder.
// Owned by S01.

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { liveSystemRoutes, goneSystemRoutes, canonicalUrl } from '../../app/utils/seo'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const PUBLIC = resolve(ROOT, '.output/public')
const built = existsSync(PUBLIC)

const read = (rel: string) => readFileSync(resolve(PUBLIC, rel), 'utf-8')

/** Extract the canonical href regardless of attribute order. */
function canonicalHref(html: string): string | null {
  const tag = html.match(/<link\b[^>]*\brel="canonical"[^>]*>/i)?.[0]
  if (!tag) return null
  return tag.match(/\bhref="([^"]+)"/i)?.[1] ?? null
}

/** All <loc> values, trailing-slash-normalised (home is emitted as .../). */
function sitemapLocs(): string[] {
  const xml = read('sitemap.xml')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/\/+$/, '') || m[1])
}

describe.skipIf(!built)('built static output (.output/public)', () => {
  it('home emits full server HTML with an <h1> (render-completeness)', () => {
    const html = read('index.html')
    expect(html.length).toBeGreaterThan(20000)
    expect(html).toMatch(/<h1[\s>]/)
  })

  it('canonical present, non-www, no trailing slash on key pages', () => {
    for (const [file, path] of [
      ['index.html', '/'],
      ['systems/index.html', '/systems'],
      ['systems/bespoke-crm/index.html', '/systems/bespoke-crm'],
    ] as const) {
      const href = canonicalHref(read(file))
      expect(href, `canonical missing in ${file}`).toBe(canonicalUrl(path))
      expect(href).not.toContain('://www.')
    }
  })

  it('html lang is the en-ZA locale signal', () => {
    expect(read('index.html')).toMatch(/<html[^>]+lang="en-ZA"/i)
  })

  it('a live system page prerenders with real content', () => {
    const html = read('systems/reconciliation-engine/index.html')
    expect(html.length).toBeGreaterThan(10000)
    expect(html.toLowerCase()).toContain('reconciliation')
  })

  it('concept (gone) pages are NOT prerendered (OR-4)', () => {
    for (const route of goneSystemRoutes) {
      const file = resolve(PUBLIC, route.replace(/^\//, ''), 'index.html')
      expect(existsSync(file), `${route} must not be prerendered`).toBe(false)
    }
  })

  it('sitemap lists every live priority URL with lastmod, excludes gone pages (OR-4)', () => {
    expect(read('sitemap.xml')).toContain('<lastmod>')
    const locs = sitemapLocs()
    // sitemapLocs() trailing-slash-normalises every loc (home → bare origin);
    // canonicalUrl keeps the root slash, so normalise the expected the same way.
    const norm = (u: string) => u.replace(/\/+$/, '') || u
    for (const route of ['/', '/systems', '/diagnose', ...liveSystemRoutes]) {
      expect(locs, `sitemap missing ${route}`).toContain(norm(canonicalUrl(route)))
    }
    for (const route of goneSystemRoutes) {
      expect(locs, `sitemap must exclude ${route}`).not.toContain(norm(canonicalUrl(route)))
    }
  })

  // robots.txt is a static file only under `nuxt generate` (the suite's mode); a
  // hybrid `nuxt build` serves it at runtime, so guard on its presence.
  const robotsExists = existsSync(resolve(PUBLIC, 'robots.txt'))

  it.skipIf(!robotsExists)('robots: launch allows AI bots + Sitemap line; guard Disallows all', () => {
    const txt = read('robots.txt')
    const isGuard = /indexing disabled/i.test(txt)
    if (isGuard) {
      expect(txt).toMatch(/User-agent:\s*\*[\s\S]*Disallow:\s*\//i)
    } else {
      expect(txt).toContain('Sitemap: https://zabble.org/sitemap.xml')
      for (const bot of ['Googlebot', 'GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot']) {
        expect(txt, `robots must name ${bot}`).toContain(bot)
      }
    }
  })

  it.skipIf(!robotsExists)('live money pages are not accidentally noindexed when indexable', () => {
    const indexable = !/indexing disabled/i.test(read('robots.txt'))
    if (indexable) {
      expect(read('systems/bespoke-crm/index.html')).not.toMatch(/name="robots"[^>]*noindex/i)
    }
  })
})

describe.skipIf(built)('built static output', () => {
  it('SKIPPED — run `npm run build` or `npm run test:seo` to assert built output', () => {
    expect(built).toBe(false)
  })
})
