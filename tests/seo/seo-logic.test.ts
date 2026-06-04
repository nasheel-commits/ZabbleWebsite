// SEO-regression suite — pure logic (no build required). Owned by S01.
// Asserts the invariants behind the canonical, indexability, thin-page, and
// redirect-map decisions so a future edit can't silently regress them.

import { describe, it, expect } from 'vitest'
import {
  canonicalUrl,
  computeIndexable,
  isSystemPublished,
  liveSystemSlugs,
  goneSystemSlugs,
  liveSystemRoutes,
  goneSystemRoutes,
  CANONICAL_SITE_URL,
} from '../../app/utils/seo'
import {
  REDIRECTS,
  validateRedirects,
  buildRedirectRouteRules,
  type Redirect,
} from '../../app/data/redirects'
import { SYSTEMS } from '../../app/data/systems'

describe('canonicalUrl (OR-1 trailing-slash + non-www + OR-3 facet strip)', () => {
  it('home canonicalises to the non-www origin with the root slash (the one exception)', () => {
    expect(canonicalUrl('/')).toBe('https://zabble.org/')
  })
  it('keeps deep paths, no trailing slash', () => {
    expect(canonicalUrl('/systems')).toBe('https://zabble.org/systems')
    expect(canonicalUrl('/systems/bespoke-crm')).toBe('https://zabble.org/systems/bespoke-crm')
  })
  it('strips a trailing slash (single trailing-slash policy)', () => {
    expect(canonicalUrl('/systems/')).toBe('https://zabble.org/systems')
    expect(canonicalUrl('/systems/bespoke-crm/')).toBe('https://zabble.org/systems/bespoke-crm')
  })
  it('strips query + hash so faceted /systems?pillar= collapses to /systems (OR-3)', () => {
    expect(canonicalUrl('/systems?pillar=automation')).toBe('https://zabble.org/systems')
    expect(canonicalUrl('/systems?pillar=automation,audit-trails')).toBe('https://zabble.org/systems')
    expect(canonicalUrl('/systems#grid')).toBe('https://zabble.org/systems')
  })
  it('is never www', () => {
    for (const p of ['/', '/systems', '/diagnose', '/systems/bespoke-crm']) {
      expect(canonicalUrl(p)).not.toContain('://www.')
    }
  })
  it('CANONICAL_SITE_URL is the non-www apex', () => {
    expect(CANONICAL_SITE_URL).toBe('https://zabble.org')
  })
})

describe('computeIndexable (fail-closed staging guard)', () => {
  it('is false with no signals (staging/preview/local)', () => {
    expect(computeIndexable({})).toBe(false)
    expect(computeIndexable({ VERCEL_ENV: 'preview' })).toBe(false)
    expect(computeIndexable({ VERCEL_ENV: 'development' })).toBe(false)
  })
  it('is true on Vercel production', () => {
    expect(computeIndexable({ VERCEL_ENV: 'production' })).toBe(true)
  })
  it('is true with the explicit override', () => {
    expect(computeIndexable({ NUXT_SITE_INDEXABLE: 'true' })).toBe(true)
  })
  it('treats any non-"true" override as false', () => {
    expect(computeIndexable({ NUXT_SITE_INDEXABLE: '1' })).toBe(false)
    expect(computeIndexable({ NUXT_SITE_INDEXABLE: 'yes' })).toBe(false)
  })
})

describe('thin/orphan pages (OR-4)', () => {
  it('exactly the two known concept slugs are "gone"', () => {
    expect([...goneSystemSlugs].sort()).toEqual(
      ['hospitality-booking-marketing-dashboard', 'legal-intake-automation'].sort(),
    )
  })
  it('every gone slug is a non-live system', () => {
    for (const slug of goneSystemSlugs) {
      const sys = SYSTEMS.find((s) => s.slug === slug)!
      expect(sys.status).not.toBe('live')
      expect(isSystemPublished(sys)).toBe(false)
    }
  })
  it('live + gone partition the catalogue with no overlap', () => {
    expect(liveSystemSlugs.length + goneSystemSlugs.length).toBe(SYSTEMS.length)
    for (const slug of liveSystemSlugs) expect(goneSystemSlugs).not.toContain(slug)
  })
  it('route helpers map slugs to /systems/<slug>', () => {
    expect(goneSystemRoutes).toContain('/systems/legal-intake-automation')
    expect(liveSystemRoutes).toContain('/systems/bespoke-crm')
    expect(liveSystemRoutes).not.toContain('/systems/legal-intake-automation')
  })
})

describe('redirect map (OR-2 — immutable slugs, no chains/loops)', () => {
  it('the shipped map is valid', () => {
    expect(() => validateRedirects(REDIRECTS)).not.toThrow()
  })
  it('rejects a self-loop', () => {
    expect(() => validateRedirects([{ from: '/a', to: '/a' }])).toThrow(/self-loop/i)
  })
  it('rejects a duplicate source', () => {
    const dup: Redirect[] = [{ from: '/a', to: '/b' }, { from: '/a', to: '/c' }]
    expect(() => validateRedirects(dup)).toThrow(/duplicate/i)
  })
  it('rejects a chain/loop (a destination that is itself a source)', () => {
    const chain: Redirect[] = [{ from: '/a', to: '/b' }, { from: '/b', to: '/c' }]
    expect(() => validateRedirects(chain)).toThrow(/chain|loop/i)
  })
  it('rejects a non-root-relative source', () => {
    expect(() => validateRedirects([{ from: 'a', to: '/b' }])).toThrow(/root-relative/i)
  })
  it('builds 301 routeRules by default', () => {
    const rules = buildRedirectRouteRules([{ from: '/old', to: '/new' }])
    expect(rules['/old']).toEqual({ redirect: { to: '/new', statusCode: 301 } })
  })
  it('a built redirect target is never also a source (no chains in output)', () => {
    const rules = buildRedirectRouteRules(REDIRECTS)
    const sources = new Set(Object.keys(rules))
    for (const key of sources) {
      expect(sources.has(rules[key].redirect.to)).toBe(false)
    }
  })
})
