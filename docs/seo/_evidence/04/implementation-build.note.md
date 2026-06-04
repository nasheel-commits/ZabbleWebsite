# Implementation build + test record — Session 04 (on-site assets)

Records the build/test evidence for the on-site implementation of
`audits/04-offpage-local.md` §8. **No DataForSEO calls this session — $0 new spend.**
Captured 2026-06-04.

## Build environment
- Isolated git worktree `C:/Users/nashe/zabble-seo10` (outside OneDrive), branch
  `seo/04-offpage-local`.
- **node_modules:** a junction to the OneDrive repo's `node_modules` first **broke**
  `nuxt generate` — recent Nuxt defaults `buildDir` to `node_modules/.cache/nuxt/.nuxt`,
  so the build path resolved into the spaced OneDrive path (`Our%20Website`) and the
  prerender worker failed to load the percent-encoded client manifest → `[500]` on
  every route. **Fix:** removed the junction and ran a real `npm install` so
  `node_modules` (and the build cache) live locally in the space-free worktree.
  *(Lesson for parallel SEO sessions: worktrees need a real install, not a junction,
  because of the spaced parent path.)*

## `npm run generate`
- Result: **exit 0**, "Generated public .output/public", **52 routes prerendered**.
- New routes confirmed as static HTML (bytes): about 21,224 · press 18,555 ·
  locations 20,211 · industries 23,638 · insights 14,717 ·
  locations/{johannesburg 27,027, cape-town 26,843, durban 26,155, pretoria 26,789,
  sandton 26,205} · industries/{financial-services 24,315, legal 22,947, …} ·
  insights/south-african-operations-software-landscape 41,344.
- Discovery: `nitro.prerender.crawlLinks: true` reaches every new page via the rebuilt
  footer + hub links — **no `nuxt.config.ts` change needed** (S01's file untouched).

## `npm run test:seo` (scripts/check-seo.mjs)
- Result: **26/26 checks pass.**
  - 19 required pages: exist, server-rendered (`<main>` text > 400 chars), exactly one
    non-empty `<h1>`, and contain a route-specific content marker (proves dynamic SSR,
    not an empty shell).
  - **52/52 unique `<title>`** across all generated pages (no duplicates).
  - Required internal links present (locations→/systems, →/industries; legal→/systems;
    landscape→/systems; about→/locations).
  - **Link-checker: 1,538 internal links, 0 broken.**

## Reproduce
```bash
cd <worktree>            # space-free path
npm install              # real node_modules (NOT a junction)
npm run verify           # = nuxt generate && node scripts/check-seo.mjs
```
