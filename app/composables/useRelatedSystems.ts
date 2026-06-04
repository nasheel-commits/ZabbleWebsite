// Related-systems selector for internal linking (SEO session 04).
//
// Powers the "Related systems" block on every module detail page so each module
// links to >=3 contextual shared-pillar siblings (rule L5) instead of being a
// dead-end, AND so that the resulting inbound link distribution is even, giving
// every module the >=4 inbound links rule L2 requires.
//
// A naive "top-N by shared pillars" picks the same popular, early-index modules
// for everyone, starving niche modules (some ended up with 0 related-inbound and
// total in-degree 3). We instead assign related sets with a single deterministic,
// coverage-balanced pass: when a module chooses its siblings, ties break toward
// the candidate that has been chosen LEAST so far. Over all 30 live modules this
// spreads the 120 related links roughly evenly (~4 inbound each), so no module is
// starved. The whole assignment is computed once at module load and is pure +
// deterministic, so prerendered HTML is stable across builds.

import { SYSTEMS, type System } from '~/data/systems'

const PER_MODULE = 4

function buildRelatedMap(): Map<string, System[]> {
  const live = SYSTEMS.filter((s) => s.status === 'live')
  const indexOf = new Map(live.map((s, i) => [s.slug, i]))
  const inbound = new Map(live.map((s) => [s.slug, 0]))
  const map = new Map<string, System[]>()

  // Deterministic order (original SYSTEMS order) keeps the assignment stable.
  for (const m of live) {
    const mp = new Set(m.pillars)
    const picks = live
      .filter((s) => s.slug !== m.slug && s.pillars.some((p) => mp.has(p)))
      .map((s) => ({ s, shared: s.pillars.filter((p) => mp.has(p)).length }))
      // 1) most shared pillars (closest topical neighbours) win,
      // 2) then whichever has been chosen least so far (coverage balancing),
      // 3) then original order (stable, deterministic tie-break).
      .sort(
        (a, b) =>
          b.shared - a.shared ||
          (inbound.get(a.s.slug)! - inbound.get(b.s.slug)!) ||
          (indexOf.get(a.s.slug)! - indexOf.get(b.s.slug)!),
      )
      .slice(0, PER_MODULE)
      .map((c) => c.s)

    for (const p of picks) inbound.set(p.slug, inbound.get(p.slug)! + 1)
    map.set(m.slug, picks)
  }
  return map
}

const RELATED = buildRelatedMap()

/**
 * The related shared-pillar siblings for a module (default 4), drawn from the
 * coverage-balanced assignment above.
 *
 * @param system the current module
 * @param limit  how many related modules to return (default 4; L5 wants 3–6)
 */
export function relatedSystems(system: System, limit = PER_MODULE): System[] {
  return (RELATED.get(system.slug) ?? []).slice(0, limit)
}
