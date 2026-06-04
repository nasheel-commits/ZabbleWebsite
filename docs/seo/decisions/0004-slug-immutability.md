# 0004 — Published slugs are immutable; renames ship a 301

- **Status:** accepted
- **Date:** 2026-06-04
- **Author:** S01 (Technical SEO & Crawlability)
- **Affects:** S01 (routing/redirects), S04 (IA/architecture), S02/S06 (content), anyone renaming a route
- **Implements:** OR-2 (from S04's audit / `status.md`)
- **Reviewed by:** S00 owner

## Context

Zabble's money pages are `/systems/<slug>`, sourced from `app/data/systems.ts`.
Slugs double as the canonical URL and as link/citation targets. If a slug changes
after a page is published (indexed, linked, or cited by an AI engine), every
inbound link and every accrued ranking signal breaks, and Google/agents see a
404 where authority used to be. S04 asked S01 (OR-2) to make this safe.

## Decision

1. **A published (`status: 'live'`) slug is immutable.** Treat it as a permanent
   identifier. Prefer fixing copy/positioning over renaming the URL.
2. **If a rename is unavoidable, it ships a 301** from the old path to the new one,
   added to the single redirect map in `app/data/redirects.ts`. The old slug is
   never reused for a different page.
3. **The redirect map is validated at build time** — `validateRedirects()` (run by
   `buildRedirectRouteRules()` in `nuxt.config.ts`) throws on self-loops, duplicate
   sources, and chains/loops (a destination that is itself a source). A malformed
   map fails the build instead of shipping a redirect loop. Covered by the
   SEO-regression suite (`tests/seo/seo-logic.test.ts`).
4. **Concept slugs are exempt** because they are not published — they are
   de-indexed + 410-gated (ADR/OR-4), so renaming one before launch carries no SEO
   cost. Immutability begins at `status: 'live'`.

## Mechanism

```
app/data/redirects.ts     REDIRECTS: Redirect[]  (from → to, 301 by default)
                          validateRedirects()    (no self-loop/dupe/chain)
                          buildRedirectRouteRules()
nuxt.config.ts            routeRules: { ...buildRedirectRouteRules(REDIRECTS) }
```

On Vercel (hybrid `nuxt build`) these become real server 301s. The map is empty
today (pre-launch, no renames). To rename a published slug:

1. Change the slug in `systems.ts`.
2. Add `{ from: '/systems/<old>', to: '/systems/<new>' }` to `REDIRECTS`.
3. `npm test` — the suite proves no chain/loop and that the build still passes.

## Why not host-level (vercel.json) for these

`vercel.json` redirects are fine for *structural* canonicalisation (trailing
slash, clean URLs) but a slug rename is **content-coupled** — it belongs with the
data that changed (`systems.ts` + `redirects.ts`), versioned and tested in one
commit, not in a hand-maintained host file that can drift from the catalogue.
A retired slug's `from` path never overlaps a live prerendered page (the page now
lives at the new slug), so the routeRules stub-clobber hazard (ADR-0003) does not
apply here.

## Consequences

- Renames are safe, atomic, and tested; no silent 404s or redirect loops.
- One more discipline at rename time (add a map entry) — enforced by the build.
- Marginal: the redirect map is a tiny, always-valid file even when empty.
