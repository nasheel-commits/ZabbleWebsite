import { describe, expect, it } from 'vitest'

import {
  ARTICLES,
  CLUSTER_ARTICLES,
  SITE_URL,
  knownRoutes,
  type Article,
} from '~/data/articles'
import { SYSTEMS } from '~/data/systems'

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

/** Pull every href="..." out of an HTML string. */
function hrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!)
}

/** Internal route is anything starting with "/" (not "//", not a fragment). */
function isInternalRoute(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

/** Normalise "/blog/x#frag" and "/#home" → the route part. */
function routeOf(href: string): string {
  const path = href.split('#')[0]!
  if (path === '') return '/' // pure fragment like "#ref-1" → same page; treat as root-safe
  return path
}

describe('article dataset integrity', () => {
  it('has at least the 15 first-wave pieces once fully populated (>=2 while seeding)', () => {
    expect(ARTICLES.length).toBeGreaterThanOrEqual(2)
  })

  it('slugs, canonical paths and primary intents are unique (no cannibalisation)', () => {
    const slugs = ARTICLES.map((a) => a.slug)
    const paths = ARTICLES.map((a) => a.canonicalPath)
    const intents = ARTICLES.map((a) => a.primaryIntent.toLowerCase().trim())
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(paths).size).toBe(paths.length)
    expect(new Set(intents).size).toBe(intents.length)
  })

  it('every cluster article maps to exactly one real module money page', () => {
    for (const a of CLUSTER_ARTICLES) {
      expect(a.moduleSlug, `${a.slug} needs a moduleSlug`).toBeTruthy()
      expect(SYSTEMS.some((s) => s.slug === a.moduleSlug), `${a.slug} → /systems/${a.moduleSlug} must exist`).toBe(true)
    }
  })

  it('exactly one pillar article per pillar slug where present, and pillar pages carry a pillarSlug', () => {
    for (const a of ARTICLES.filter((x) => x.kind === 'pillar')) {
      expect(a.pillarSlug, `${a.slug} is a pillar and needs pillarSlug`).toBeTruthy()
    }
    const pillarSlugs = ARTICLES.filter((a) => a.kind === 'pillar').map((a) => a.pillarSlug)
    expect(new Set(pillarSlugs).size).toBe(pillarSlugs.length)
  })
})

describe.each(ARTICLES.map((a) => [a.slug, a] as [string, Article]))(
  'article: %s',
  (_slug, a) => {
    it('has a server-renderable title, meta description and canonical', () => {
      expect(a.metaTitle.length).toBeGreaterThan(10)
      expect(a.metaTitle.length).toBeLessThanOrEqual(70)
      expect(a.metaDescription.length).toBeGreaterThan(50)
      expect(a.metaDescription.length).toBeLessThanOrEqual(170)
      expect(a.canonicalPath.startsWith('/')).toBe(true)
      // canonical resolves to an absolute production URL
      expect(`${SITE_URL}${a.canonicalPath}`).toMatch(/^https:\/\/zabble\.org\//)
    })

    it('has an answer-first intro of 40–60 words (AEO)', () => {
      const n = wordCount(a.answer)
      expect(n, `answer is ${n} words`).toBeGreaterThanOrEqual(40)
      expect(n, `answer is ${n} words`).toBeLessThanOrEqual(60)
    })

    it('body has question-led H2s and at least one internal link', () => {
      expect(a.bodyHtml).toMatch(/<h2/)
      const internal = hrefs(a.bodyHtml).filter(isInternalRoute)
      expect(internal.length, 'body should link internally').toBeGreaterThanOrEqual(1)
    })

    it('has a FAQ block of at least 3 question/answer pairs (AEO/PAA)', () => {
      expect(a.faq.length).toBeGreaterThanOrEqual(3)
      for (const f of a.faq) {
        expect(f.q.trim().endsWith('?')).toBe(true)
        expect(f.a.trim().length).toBeGreaterThan(20)
      }
    })

    it('has at least one cited, verifiable statistic source (GEO)', () => {
      expect(a.sources.length).toBeGreaterThanOrEqual(1)
      for (const s of a.sources) {
        expect(s.url).toMatch(/^https:\/\//)
        expect(s.publisher.length).toBeGreaterThan(2)
        expect(s.year).toBeGreaterThanOrEqual(1990)
        expect(s.year).toBeLessThanOrEqual(2026)
      }
    })

    it('citation contract: every source id is referenced in the body and vice versa', () => {
      for (const s of a.sources) {
        expect(a.bodyHtml.includes(`#${s.id}`), `body must cite ${s.id}`).toBe(true)
      }
      const cited = [...a.bodyHtml.matchAll(/href="#(ref-\d+)"/g)].map((m) => m[1])
      for (const id of cited) {
        expect(a.sources.some((s) => s.id === id), `cited ${id} must have a source`).toBe(true)
      }
    })

    it('related modules and related articles reference real targets', () => {
      for (const m of a.relatedModules) {
        expect(SYSTEMS.some((s) => s.slug === m), `relatedModule ${m}`).toBe(true)
      }
      for (const r of a.relatedArticles) {
        expect(ARTICLES.some((x) => x.slug === r), `relatedArticle ${r}`).toBe(true)
      }
    })

    it('has a CTA pointing to a real internal route', () => {
      expect(isInternalRoute(a.cta.href)).toBe(true)
    })
  },
)

describe('internal link-checker (no dangling links)', () => {
  const routes = knownRoutes()

  it('every internal href in every article body + structured links resolves to a known route', () => {
    const broken: string[] = []
    for (const a of ARTICLES) {
      const candidates = [
        ...hrefs(a.bodyHtml),
        ...a.internalLinks.map((l) => l.href),
        a.cta.href,
      ]
      for (const href of candidates) {
        if (!isInternalRoute(href)) continue // external / mailto / #frag
        const route = routeOf(href)
        if (route === '/' ) continue // home + home-anchors
        if (!routes.has(route)) broken.push(`${a.slug}: ${href}`)
      }
    }
    expect(broken, `broken internal links:\n${broken.join('\n')}`).toEqual([])
  })

  it('structured internalLinks declare a relationship (up/across/down)', () => {
    for (const a of ARTICLES) {
      for (const l of a.internalLinks) {
        expect(['up', 'across', 'down']).toContain(l.rel)
      }
    }
  })
})
