# Evidence 09 — build + prerender verification

- **Captured:** 2026-06-04
- **Worktree:** `C:\Users\nashe\zabble-seo09-analytics` (isolated; own `node_modules`)
- **Branch:** `seo/09-analytics` @ foundation `b2962e1`

## What was run

```
npm run build      → ✨ Build complete!            (exit 0)
npm run generate   → ✔ Prerendered 68 routes in 5.975s  (exit 0)
                     ✔ Generated public .output/public
```

`find .output/public -name index.html | wc -l` → **33** HTML pages
(`/`, `/systems`, 30 × `/systems/<slug>`, `/diagnose`).

## Warnings (pre-existing, NOT from this change)

Two framework warnings appear on the clean foundation too, so they are not
attributable to the analytics work:

- `nuxt:module-preload-polyfill` sourcemap notice.
- `cache-driver.js … treating it as an external dependency` (Nitro internal).

No new warnings reference the analytics plugins, the consent banner, or the
diagnose changes.

## Note on the first (failed) generate

An earlier `npm run generate` returned `[500] Server Error` on **every** route
(incl. `/404.html`). Root cause was environmental, not code: the worktree's
`node_modules` was a junction to the shared install, and Nuxt's buildDir lives
under `node_modules/.cache` — concurrent builds from the other parallel session
worktrees corrupted the shared cache mid-prerender. Giving this worktree its own
`node_modules` (`npm install`) fully isolated the cache and generate passed
clean. Lesson for parallel sessions: **don't junction `node_modules`; install
per-worktree** (also recorded in repo memory).
