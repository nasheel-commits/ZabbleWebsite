# Evidence — Production Lighthouse recheck (mobile), post-implementation

- **Endpoint:** POST https://api.dataforseo.com/v3/on_page/lighthouse/live/json
- **Request body:** `[{ "url": "https://www.zabble.org/", "for_mobile": true, "categories": ["performance","accessibility","best_practices","seo"] }]`
- **Auth:** Basic (redacted)
- **Captured:** 2026-06-04 (implementation pass)
- **Mode:** live
- **Cost (response.cost):** 0.00425
- **Raw:** `lighthouse__home__production-recheck-mobile.json`

## Scores (mobile)

| Category | Score |
|----------|-------|
| Performance | **98** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

## Core Web Vitals — ALL "good"

| Metric | Value | Threshold | Verdict |
|--------|-------|-----------|---------|
| LCP | **1.97 s** | ≤2.5 good | ✅ good |
| CLS | **0.00** | ≤0.1 good | ✅ good |
| TBT (INP proxy) | **0 ms** | ≤200 good | ✅ good |

## Read

CWV remain in "good" after the OR-1..OR-4 implementation pass. This is expected:
the S01 changes (de-indexing 2 thin pages, the redirect-map mechanism, the 410
gate, link-checker, and the vitest suite) add **zero runtime cost** to served
pages — they change build-time route selection, server responses for unpublished
slugs, and dev tooling, not the rendered payload of live pages. The deployed
production build is the prerendered Nuxt app; LCP 1.97 s / CLS 0 / TBT 0 ms hold.
No CWV remediation required; ongoing tuning of the demo-component JS is S09.
