// Related-systems selector for internal linking (SEO session 04).
//
// Given a system, return the live sibling systems that share the most pillars
// with it. Powers the "Related systems" block on a module detail page so every
// module links to >=3 contextual siblings (internal-linking rule L5) instead of
// being a dead-end. Pure + deterministic: same input always yields the same
// ordered list, so prerendered HTML is stable across builds.

import { SYSTEMS, type System } from '~/data/systems'

/**
 * Rank live siblings of `system` by:
 *   1. number of shared pillars (desc) — closest topical neighbours first,
 *   2. then original SYSTEMS order (stable tie-break, deterministic output).
 * Excludes the system itself and any non-`live` (concept/in-progress) entry, so
 * we never link to a thin/orphan page (rule L3).
 *
 * @param system the current module
 * @param limit  how many related modules to return (default 4; L5 wants 3–6)
 */
export function relatedSystems(system: System, limit = 4): System[] {
  const pillars = new Set(system.pillars)

  return SYSTEMS
    .filter((s) => s.slug !== system.slug && s.status === 'live')
    .map((s, index) => ({
      system: s,
      shared: s.pillars.filter((p) => pillars.has(p)).length,
      index,
    }))
    .filter((c) => c.shared > 0)
    .sort((a, b) => b.shared - a.shared || a.index - b.index)
    .slice(0, limit)
    .map((c) => c.system)
}
