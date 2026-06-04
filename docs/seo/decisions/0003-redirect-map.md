# 0003 — Canonicalisation & redirect map

- **Status:** accepted (in-repo parts) + **1 host action pending (P1)**
- **Date:** 2026-06-04
- **Author:** S01 (Technical SEO & Crawlability)
- **Affects:** S01, S02 (canonicals), S03 (schema `url`), infra/devops (Vercel)
- **Reviewed by:** S00 owner

## Context

Discovered during the S01 crawl (2026-06-04): the Nuxt app is **deployed to
Vercel** and live. `zabble.org` (apex) issues `308 → www.zabble.org`, which serves
the app. Meanwhile the entire knowledge base (`reference/*`, `measurement-indexing.md`)
and the legacy site's own canonical use the **non-www** host `https://zabble.org`.
So the *canonical we declare* (non-www) and the *host the infra serves* (www)
disagree — a self-inflicted canonical split.

Observed redirect chains (`_evidence/01/redirect-chains__key-paths__production.txt`):

```
http://zabble.org/      → 308 → https://zabble.org/
https://zabble.org/     → 308 → https://www.zabble.org/   ← apex→www (the conflict)
https://www.zabble.org/ → 200
https://www.zabble.org/systems/reconciliation-engine → 200
```

No loops. But a declared canonical (`https://zabble.org/...`) that itself
308-redirects to www is a weak signal — Google may pick www regardless, and link
equity takes an extra hop.

## Decision

### Canonical host = **non-www** (`https://zabble.org`)

Chosen to match the whole knowledge base, the legacy canonical, and brand
preference (shorter, conventional). `site.url = https://zabble.org`;
self-referencing `<link rel="canonical">` is emitted on every page from this URL
(`app/app.vue`), with **no trailing slash** except root. Verified:
`canonical` tags on `/`, `/systems`, `/systems/<slug>` all resolve to the non-www,
slash-stripped URL.

> Alternative (if devops prefers www): change `SITE_URL` in `nuxt.config.ts` to
> `https://www.zabble.org` and leave the Vercel redirect as-is. One-line change.
> Not chosen — it contradicts the documented canonical and needs an S00 ADR to
> re-baseline `reference/*`.

### Redirect map

| From | To | Code | Where implemented | Status |
|------|----|------|-------------------|--------|
| `http://*` | `https://*` | 308 | Vercel (automatic HTTPS) | ✅ live |
| `www.zabble.org/*` | `zabble.org/*` | 301/308 | **Vercel domain settings** (set apex as *primary domain*) | **⚠ PENDING (P1)** — currently REVERSED (apex→www) |
| `/path/` (trailing slash) | `/path` | 308 | `vercel.json` `trailingSlash:false` + canonical tag | ✅ in-repo |
| `/path/index.html`, `/path.html` | `/path` | 308 | `vercel.json` `cleanUrls:true` | ✅ in-repo |
| Legacy SPA content routes | new equivalents | 301 | **TBD** — capture from GSC/analytics at cutover | ⏳ deferred |

### Why redirects are NOT done in `nuxt.config` `routeRules`

A `redirect` routeRule on a static path makes Nitro emit a `meta http-equiv=refresh`
**stub** at that path's `index.html`. For paths that overlap a real page this
**clobbers the page**: a `'/systems/' → '/systems'` rule overwrote
`systems/index.html` with a 94-byte redirect-to-itself stub and dropped `/systems`
from the sitemap (caught + fixed during S01 — see audit §3). Structural
canonicalisation therefore lives at the **host layer** (`vercel.json` + Vercel
domain config), never in `routeRules`.

## Pending action (P1, infra/devops — cross-session)

In the **Vercel project → Settings → Domains**, set **`zabble.org` as the Primary
Domain** so `www.zabble.org → zabble.org` (301), and `zabble.org` serves `200`.
This aligns the served host with the declared canonical and removes the apex→www
hop. After the change, re-capture `redirect-chains__key-paths__production.txt`.
Mirrored into `status.md` blockers (B5).

## Consequences

- Canonical signal is consistent in-repo today (tags + sitemap + `site.url`).
- One 30-second Vercel dashboard toggle fully closes the host/canonical split.
- `vercel.json` must be verified on a **Vercel preview deploy** before it reaches
  production (it codifies already-observed clean-URL behaviour, so risk is low).
- Legacy → new 301s are deferred until the legacy URL set is known (the legacy
  site was a JS SPA with no enumerable sitemap; its `sitemap.xml` returned the SPA
  shell). Capture real legacy paths from GSC's "Pages" report at cutover.
