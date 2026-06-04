# Evidence note — current-state internal link graph (static-source method)

- **Subject:** Zabble pre-launch site internal link graph
- **Captured:** 2026-06-04
- **Mode:** static source analysis (no live crawl available)
- **Companion data:** `link-graph__zabble__static.json`

## Why static analysis (not a crawler / DataForSEO On-Page)

The site is **pre-launch**. Two facts make a live crawl impossible right now, so
the link graph is derived from the source that *generates* the HTML:

1. **No crawlable build / staging URL** — `status.md` blocker **B3** (staging URL
   not provided). `https://zabble.org` is not serving the new build to crawl.
2. **DataForSEO On-Page returned HTTP 401** in this session — the running Claude
   Code session did not have the MCP env loaded (documented caveat in
   `status.md`: "an already-running session won't have picked up a mid-session
   server add … each new session must launch with env loaded"). See
   `on-page-instant__zabble-org__live-401.note.md`.

The Nuxt app is **statically prerendered** (`nitro.prerender` + `routeRules`,
`crawlLinks: true` — see `reference/nuxt-seo-implementation.md` §1). Prerendered
HTML is a deterministic function of the page/component source and
`app/data/systems.ts`. Therefore enumerating `<NuxtLink :to>` / `<a :href>` edges
across the components that appear on each route reproduces exactly the link graph
a crawler would find on the generated `.output/public/**`. This is the correct,
reproducible pre-launch method. **Re-run as a live DataForSEO On-Page crawl once
B3 is resolved** (endpoint `POST /v3/on_page/task_post` → `/links`, or
`/on_page/instant_pages` per URL) to confirm against rendered output.

## How to reproduce

Files read (commit `b2962e1` / branch `seo/04-architecture`):
- Routes: `app/pages/index.vue`, `app/pages/systems/index.vue`,
  `app/pages/systems/[slug].vue`, `app/pages/diagnose.vue`.
- Sitewide chrome: `app/components/TheNav.vue`, `app/components/TheFooter.vue`.
- Link-bearing sections: `TheHero`, `TheMeet`, `TheDoNothing`, `TheFinalCta`,
  `CtaStrip`, `SystemCard`, `PillarChip`, `SystemHero`.
- Data: `app/data/systems.ts` (32 entries: **30 `live`**, **2 `concept`**).

Edge extraction command (illustrative):
```
grep -rnoE "to=\"[^\"]+\"|:to=\"'[^']+'\"|href=\"[^\"#][^\"]*\"" app/pages app/components
```
Then attribute each component's edges to the routes it renders on.

## Key reads (what the graph proves)

- **Live modules:** 30. **Concept/thin:** 2 (`legal-intake-automation`,
  `hospitality-booking-marketing-dashboard`) — render 200 with TODO copy, linked
  from nowhere → **orphans** (`[slug].vue` only 404s on *unknown* slug; no
  `status` guard).
- **`/systems` lists `live` only** (`index.vue` line 50) → confirms the 2 concept
  pages are unreachable via UI.
- **Footer** (`TheFooter.vue`) has **no `/systems` link** and no module links.
- **Home body** links only to `/diagnose` + hash anchors; the four-pillar section
  (`TheWhatWeBuild.vue`) links to nothing.
- **Module pages** link to `/systems`, `/diagnose`, and `?pillar=` facets only —
  **zero sibling-module links** (in-degree 1, sibling out-degree 0).
- **Pillar chips** (`PillarChip.vue`, link mode) → `/systems?pillar=<slug>`
  (faceted query-param view), not a hub page.

Click-depth from `/`: `/systems` = 1, every live `/systems/<slug>` = 2,
`/diagnose` = 1, concept pages = unreachable. **≤3-click rule met for all 30
live money pages; broken only by the 2 orphans.**
