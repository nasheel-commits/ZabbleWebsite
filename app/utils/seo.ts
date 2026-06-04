// Shared SEO predicates + pure helpers — owned by S01. Imported by nuxt.config.ts
// (prerender + sitemap + indexability), app/app.vue (canonical), app/pages/
// systems/[slug].vue (410 gate), and the SEO-regression tests, so every surface
// agrees on ONE rule. Everything here is pure and side-effect-free.

import { SYSTEMS, type System } from '../data/systems'

/** The canonical production host. Single source of truth for tests + helpers. */
export const CANONICAL_SITE_URL = 'https://zabble.org'

/**
 * A system detail page is *published* — prerendered, indexable, in the sitemap,
 * served 200 — iff its status is `live`. `concept` / `in-progress` systems are
 * thin/orphan: de-indexed + 410-gated until real copy is signed off (OR-4).
 */
export function isSystemPublished(system: Pick<System, 'status'>): boolean {
  return system.status === 'live'
}

/** Live (published) system slugs — the indexable money pages. */
export const liveSystemSlugs: string[] = SYSTEMS.filter(isSystemPublished).map((s) => s.slug)

/** Un-published (concept/in-progress) slugs — de-indexed + return 410. */
export const goneSystemSlugs: string[] = SYSTEMS.filter((s) => !isSystemPublished(s)).map((s) => s.slug)

/** `/systems/<slug>` paths for the live set (prerendered + in sitemap). */
export const liveSystemRoutes: string[] = liveSystemSlugs.map((s) => `/systems/${s}`)

/** `/systems/<slug>` paths for the gone set (never prerendered; 410). */
export const goneSystemRoutes: string[] = goneSystemSlugs.map((s) => `/systems/${s}`)

/**
 * Canonical absolute URL for a route path. Policy (OR-1): non-www host, **no**
 * trailing slash (except root), query/hash stripped (so faceted `/systems?pillar=`
 * canonicalises to `/systems` — OR-3).
 */
export function canonicalUrl(path: string, siteUrl: string = CANONICAL_SITE_URL): string {
  const base = siteUrl.replace(/\/+$/, '')
  const pathOnly = path.replace(/[?#].*$/, '')
  const clean = pathOnly === '/' ? '' : pathOnly.replace(/\/+$/, '')
  return `${base}${clean}` || `${base}/`
}

/**
 * Indexability decision — FAIL-CLOSED. The build is non-indexable (staging guard)
 * unless explicitly opted in (`NUXT_SITE_INDEXABLE=true`) or running on Vercel's
 * production environment (`VERCEL_ENV=production`), so a deploy can never
 * accidentally noindex the live site, and a preview/staging deploy never indexes.
 */
export function computeIndexable(
  env: { NUXT_SITE_INDEXABLE?: string; VERCEL_ENV?: string } = {},
): boolean {
  return env.NUXT_SITE_INDEXABLE === 'true' || env.VERCEL_ENV === 'production'
}
