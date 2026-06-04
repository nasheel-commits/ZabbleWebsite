# Reference — Measurement & Indexing

How we get Zabble indexed and how we measure all three layers. Owned by S00;
operationalised mostly by S10 (with S01 on indexing mechanics). The rule:
**every layer is measured with the right instrument** — don't try to read GEO
from Google Search Console.

---

## 1. Indexing — getting found in the first place

A prerendered site is crawlable, but crawling ≠ indexing. Steps (S01 owns the
code bits, this is the playbook):

1. **`site.url` + sitemap.** With `site.url = https://zabble.org` and the sitemap
   module, `https://zabble.org/sitemap.xml` lists `/`, `/systems`, the 30
   `/systems/<slug>` pages, and `/diagnose`. Verify it renders in
   `.output/public` after `npm run generate`.
2. **robots `Sitemap:` line.** `robots.txt` must point to the sitemap and allow
   crawling. (Currently bare — fix in S01.)
3. **Staging guard (P0).** While pre-launch on a staging URL, serve `noindex` +
   `Disallow` so the staging domain never indexes. Flip to indexable **only** on
   the production `zabble.org` cutover.
4. **Google Search Console (GSC).** Verify the `zabble.org` property (DNS TXT is
   cleanest for a domain property). Submit the sitemap. Use URL Inspection to
   request indexing of key pages at launch.
5. **Bing Webmaster Tools.** Verify + submit sitemap. Bing also powers some AEO
   and feeds Copilot — relevant to GEO. Importing from GSC is the fast path.
6. **IndexNow.** Bing/IndexNow lets us ping on publish for near-instant
   discovery. The Nuxt sitemap/robots ecosystem can emit it — evaluate in S01.
7. **At launch:** request indexing of `/` and the top money pages; watch
   Coverage/Pages reports for "Discovered – not indexed" (a thin-content signal
   that would confirm the duplication risk).

**Indexing health is itself a metric** — track "Indexed pages" vs "submitted" in
GSC weekly post-launch.

---

## 2. Analytics — measuring behaviour (POPIA-aware)

South Africa = **POPIA** applies. Default to a privacy-respecting setup:

- Prefer cookieless/aggregate analytics (e.g. a privacy-first analytics tool or
  GA4 configured with consent + IP anonymisation). Whatever we pick, it must have
  a consent path and a privacy policy reference (POPIA). Record the choice as an
  ADR.
- Tag the **conversion** that matters: the `/diagnose` completion and any contact
  action to `sales@zabble.org` are the business goals — instrument those, not
  vanity pageviews.
- Capture **referrer/source** so we can see AI-engine referrals (see §4).

> No analytics IDs or keys in git — same secrets rule. Runtime config via env.

---

## 3. Measuring SEO + AEO (search-side)

| Metric | Source | What it tells us |
|--------|--------|------------------|
| Impressions, clicks, CTR, avg position | **GSC** Performance | Are we ranking, and for what queries (SEO) |
| Indexed vs submitted | **GSC** Pages | Foundation health |
| Query → page mapping | GSC + `targets/keyword-map.md` | Are the right pages ranking for the right intent |
| Rank tracking (SA, scheduled) | **DataForSEO** `SERP live/advanced` + `DATAFORSEO_LABS ranked_keywords` | Positions over time without waiting on GSC lag |
| SERP-feature ownership (snippet/PAA) | **DataForSEO** SERP `item_types` | AEO wins — do we own the answer slot |
| Keyword difficulty / volume baselines | **DataForSEO** Labs | Prioritisation (S05) |

**Baseline now (pre-launch):** essentially zero — that's expected and *useful*.
Record the zero baseline so post-launch movement is measurable. S05 captures the
opportunity baseline (volumes/KD for target keywords); S10 sets up ongoing rank
tracking.

DataForSEO rank-tracking pattern (S10): a scheduled `SERP live/advanced` call per
priority keyword with `location_name: "South Africa"`, store positions to
`_evidence/10/` dated, chart the trend. This complements GSC (which only shows
queries Google chooses to report and lags ~2 days).

---

## 4. Measuring GEO (AI-side) — the hard part

GSC **cannot** see this. Use:

| Metric | Source | What it tells us |
|--------|--------|------------------|
| AI Overview presence for our queries | **DataForSEO** SERP `ai_overview` item type | Is Google's AI answer showing for our queries, and is Zabble in it |
| LLM answer + citations for a prompt | **DataForSEO** `AI_OPTIMIZATION` module | What ChatGPT/Gemini/etc. say to "who builds bespoke systems in South Africa" and whether they cite us |
| Brand/entity mentions + sentiment | **DataForSEO** `CONTENT_ANALYSIS` | Where "Zabble"/modules are mentioned across the web (corroboration signal) |
| Referral traffic from AI engines | **Analytics** referrers (chatgpt.com, perplexity.ai, gemini, copilot, `google` AI) | Actual visits driven by AI answers |
| Manual spot-checks | Prompt the engines directly, screenshot | Ground-truth; save to `_evidence/08/` |

**GEO baseline (pre-launch):** likely "not mentioned / not cited". Capture it
(S08) so we can show the entity work moving the needle. The leading indicators
are: (a) the "Zabble" entity being well-defined (schema + corroboration), and (b)
mentions appearing in `CONTENT_ANALYSIS` over time.

---

## 5. The metric stack (who measures what)

```
GEO   →  DataForSEO AI_OPTIMIZATION + CONTENT_ANALYSIS + SERP ai_overview + AI referrers   (S08)
AEO   →  DataForSEO SERP item_types (snippet/PAA) + GSC rich-result/appearance             (S07)
SEO   →  GSC (impressions/clicks/position) + DataForSEO rank tracking                       (S10/S02)
FOUND →  GSC Pages (indexing) + PSI/CrUX (CWV) + OnPage crawl                               (S01/S09)
```

## 6. KPIs to agree at launch (S10 proposes, S00 ratifies)

- **Foundation:** % of intended pages indexed; CWV pass rate (mobile); 0 crawl
  errors.
- **SEO:** # keywords ranking top-10 (SA); clicks from GSC; rank trend on the
  S05 priority set.
- **AEO:** # answer-slots (snippet/PAA) owned on target queries.
- **GEO:** # AI engines that name Zabble for the core prompts; # corroborating
  mentions; AI-referral sessions.

All baselines captured pre-launch (mostly zero) and re-measured on a cadence.

## 7. Tooling checklist (missing-access — surface in status.md)
- [ ] GSC property for `zabble.org` verified (needs DNS access at launch).
- [ ] Bing Webmaster Tools verified.
- [ ] Analytics tool chosen (POPIA-compliant) + installed + consent path.
- [ ] DataForSEO account **verified + funded** (blocks all rank/AI tracking).
- [ ] Decision on AI-referral tracking in analytics.

## 8. Sources
- Google Search Console: https://search.google.com/search-console/about
- Bing Webmaster Tools: https://www.bing.com/webmasters
- IndexNow: https://www.indexnow.org
- POPIA (South Africa): https://popia.co.za
- DataForSEO AI Optimization / Content Analysis: https://docs.dataforseo.com
