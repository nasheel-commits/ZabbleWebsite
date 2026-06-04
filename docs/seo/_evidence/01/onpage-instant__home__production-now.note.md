# Evidence — On-Page instant snapshot of OUR Nuxt app in production (www.zabble.org)

- **Endpoint:** POST https://api.dataforseo.com/v3/on_page/instant_pages
- **Request body:** `[{ "url": "https://www.zabble.org/" }]`
- **Auth:** Basic (redacted)
- **Captured:** 2026-06-04
- **Mode:** live
- **Cost (response.cost):** 0.000125
- **Raw:** `onpage-instant__home__production-now.json`

## What this proves — full server-rendered HTML in production

| Field | Value | Meaning |
|-------|-------|---------|
| `status_code` | 200 | OK |
| `meta.title` | "Zabble · Bespoke Digital Systems" | Correct (our app) |
| `plain_text_word_count` | **1004** | Real text in the served HTML (no JS needed) |
| `no_h1_tag` (check) | **false** | H1 present: the hero headline |
| `internal_links_count` | 3 | Crawlable links present (S04 owns link depth) |
| `onpage_score` | 100 | Clean technical hygiene |

Contrast the legacy SPA previously on the domain (`*__legacy-live`):
`plain_text_word_count: 0`, `no_h1_tag: true`. The Nuxt prerender migration fixed
the render-completeness problem — crawlers and AI engines now receive full HTML.

> Note: `low_content_rate` is still flagged — a text-to-markup ratio artifact of
> the rich interactive home page; not a render-completeness problem (1004 words
> are present). Content depth per page is S02/S06 territory.
