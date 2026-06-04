# Evidence — Legacy SPA on zabble.org at session start (historical, 2026-06-04)

**Why this is a note, not raw files:** the original raw captures (legacy home
HTML, instant_pages JSON, Lighthouse JSON) were written into a working tree that
a *parallel session* (S04) reset mid-run — the files were lost before commit. The
numbers below were captured and read directly during the run; the production
re-captures (`*__production-now*`) are the surviving raw exports. This note
preserves the historical baseline.

## State at session start (~14:59 SAST, 2026-06-04)

`https://zabble.org/` returned **HTTP 200** directly and served a **legacy Vite
SPA** — NOT this Nuxt repo. Key markers in the served HTML:

- `<div id="root"></div>` + `/assets/index-*.js` (Vite SPA mount), **no** Nuxt
  `__nuxt` / `_payload.json`.
- `<title>Zabble: Bespoke Business Solutions</title>`,
  `meta description = "Smart Data-Driven Digital Marketing & Real-Time Analytics"`.
- JSON-LD `Organization` with `email: sales@zabble.org`, `addressCountry: US`,
  `areaServed: Worldwide` — **wrong positioning** (US digital-marketing, not
  SA bespoke-operational-systems; contact should be analytics@zabble.org).

### On-Page instant_pages (POST /v3/on_page/instant_pages, live)
- `cost`: 0.000125
- `plain_text_word_count`: **0** (zero server-rendered text — JS-only)
- `no_h1_tag`: **true**; `low_content_rate`, `low_character_count`,
  `low_readability_rate`: true
- `internal_links_count`: 1; `external_links_count`: 0
- `size` == `total_dom_size` == 6100 for both `/` and `/systems/*` (identical shell)
- `onpage_score`: 92.32 (misleadingly high — blind to empty body)

### Lighthouse (POST /v3/on_page/lighthouse/live/json, mobile, live)
- `cost`: 0.00425
- Performance **81**, Accessibility 86, Best-Practices 96, SEO 100
- LCP 2.33 s · FCP 2.33 s · Speed-Index 2.33 s (all identical = single client paint
  after JS boot) · **CLS 0.205** (needs-improvement) · **TBT 235 ms**
  (needs-improvement) · TTI 2.94 s

## Mid-session change

The Nuxt app was deployed to Vercel during the session. By ~15:10 SAST,
`zabble.org` (apex) **308-redirects to `www.zabble.org`**, which serves our Nuxt
app (`plain_text_word_count: 1004`, H1 present — see `*__production-now*`). The
legacy SPA is no longer served. The findings above are retained as the pre-migration
baseline and as justification for the render/indexability work.
