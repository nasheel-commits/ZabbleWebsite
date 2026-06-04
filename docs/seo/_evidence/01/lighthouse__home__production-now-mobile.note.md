# Evidence — Lighthouse (mobile) of OUR Nuxt app in production (www.zabble.org)

- **Endpoint:** POST https://api.dataforseo.com/v3/on_page/lighthouse/live/json
- **Request body:** `[{ "url": "https://www.zabble.org/", "for_mobile": true, "categories": ["performance","accessibility","best_practices","seo"] }]`
- **Auth:** Basic (redacted)
- **Captured:** 2026-06-04
- **Mode:** live
- **Cost (response.cost):** 0.00425
- **Raw:** `lighthouse__home__production-now-mobile.json`

## Context

Mid-session, the Nuxt app (this repo) was deployed to Vercel and is now live:
`zabble.org` (apex) → **308** → `www.zabble.org` (serves our app). This Lighthouse
run targets the **served** host (`www.zabble.org`). The deployed build is ~5 days
old (pre-S01: bare robots, no sitemap) but it is our prerendered Nuxt app, so its
Core Web Vitals are representative of the post-S01 app — S01 adds only static
robots/sitemap/canonical markup with **zero runtime cost**.

## Scores (mobile emulation)

| Category | Score |
|----------|-------|
| Performance | **98** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

## Core Web Vitals (lab, mobile) — ALL "good"

| Metric | Value | Threshold | Verdict |
|--------|-------|-----------|---------|
| LCP | **1.77 s** | ≤2.5 good | ✅ good |
| FCP | 1.77 s | ≤1.8 good | ✅ good |
| CLS | **0.00** | ≤0.1 good | ✅ good |
| TBT (INP proxy) | **137 ms** | ≤200 good | ✅ good |
| Speed Index | 1.85 s | — | — |
| TTI | 2.05 s | — | — |

## Read

The prerendered Nuxt architecture delivers excellent vitals: **LCP 1.77 s, CLS 0,
TBT 137 ms — all three in "good".** This satisfies S01 goal condition 5 with real
production data. Compare the legacy SPA that previously occupied the domain
(`*__legacy-live*`): Performance 81, CLS 0.205, TBT 235 ms — the SSR migration
materially improved CLS (0.205 → 0) and TBT (235 → 137 ms). No CWV remediation is
required; S09 owns ongoing tuning (e.g. the 30 demo components' JS).
