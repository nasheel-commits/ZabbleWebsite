// 301 redirect map, owned by S01 (OR-2).
//
// Policy (ADR-0004): a *published* slug is immutable. If a page must change its
// URL, the old path ships a permanent (301) redirect to the new one, it is never
// silently dropped. This file is the single source of truth for those renames.
//
// Invariant: the map is FLAT, every `to` is a final destination, never another
// `from`. `validateRedirects` enforces no self-loops, no duplicate sources, and
// no chains/loops, and is run at config-load time so a bad entry fails the build
// instead of shipping a redirect loop. See docs/seo/decisions/0003-redirect-map.md.

export interface Redirect {
  /** Source path: absolute, no host, no trailing slash, no query. */
  from: string
  /** Destination: absolute path (or absolute URL), a FINAL destination. */
  to: string
  /** Permanent by default. */
  statusCode?: 301 | 308
}

// Empty by design. RETIRED-PATH 301s that would otherwise live here are instead
// handled at the host layer (vercel.json `redirects`) when the source is a
// structural/section path, because a `redirect` routeRule emits a meta-refresh
// HTML *stub* into the static output (ADR-0003), which then shows up as an
// orphan/unreachable "page" in the IA graph. The /pillars → /what-we-build
// consolidation (parallel-dev duplicate hub) is therefore in vercel.json.
//
// Add an entry here ONLY for a true in-app slug rename that must 301 without a
// host round-trip, e.g.: { from: '/systems/old-slug', to: '/systems/new-slug' }.
export const REDIRECTS: Redirect[] = []

/**
 * Throw if the redirect map is malformed. Guards against the three ways a
 * redirect map silently rots: self-loops, duplicate sources, and chains/loops
 * (a destination that is itself a source, which Google flags and which wastes
 * crawl budget).
 */
export function validateRedirects(redirects: Redirect[]): void {
  const froms = new Set<string>()
  for (const r of redirects) {
    if (!r.from.startsWith('/')) throw new Error(`Redirect "from" must be a root-relative path: ${r.from}`)
    if (r.from === r.to) throw new Error(`Redirect self-loop: ${r.from}`)
    if (froms.has(r.from)) throw new Error(`Duplicate redirect source: ${r.from}`)
    froms.add(r.from)
  }
  for (const r of redirects) {
    if (froms.has(r.to)) {
      throw new Error(`Redirect chain/loop: ${r.from} → ${r.to}, but ${r.to} also redirects`)
    }
  }
}

/**
 * Build Nuxt `routeRules` redirect entries from the map. Safe ONLY for retired
 * paths that do not overlap a live prerendered page (the immutability policy
 * guarantees this; an overlapping redirect rule would emit a meta-refresh stub
 * that clobbers the real page, see ADR-0003 §"why not routeRules").
 */
export function buildRedirectRouteRules(
  redirects: Redirect[] = REDIRECTS,
): Record<string, { redirect: { to: string; statusCode: number } }> {
  validateRedirects(redirects)
  const rules: Record<string, { redirect: { to: string; statusCode: number } }> = {}
  for (const r of redirects) {
    rules[r.from] = { redirect: { to: r.to, statusCode: r.statusCode ?? 301 } }
  }
  return rules
}
