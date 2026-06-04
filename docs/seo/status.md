# SEO/AEO/GEO — Status Board

Live state of all 11 sessions. **Edit only your own row** (conventions §2). Keep
it honest: `pending` → `in_progress` → `blocked` → `done`.

- **Project:** Zabble — https://zabble.org (pre-launch)
- **Primary market:** South Africa (`en-ZA`)
- **Last updated:** 2026-06-04 — integration (merging all discipline branches into main)

---

## Sessions

| # | Session | Branch | Owner | Status | Depends on | PR / outcome |
|---|---------|--------|-------|--------|------------|--------------|
| 00 | Setup & access foundation | `seo/00-setup` | SEO lead | **done** | — | docs/seo built; MCP ✓ Connected; account verified + funded ($50.998); live + sandbox `20000`. |
| 01 | Technical SEO & Crawlability | `seo/01-technical` | S01 | **done** | 00 | Foundation + **all S01 Open Requests resolved**. `@nuxtjs/seo` (sitemap+robots+link-checker) wired; `site.url` non-www; prerender live routes → full HTML; robots allows AI bots + `Sitemap:` (ADR-0002); fail-closed Vercel-env staging guard; canonicals non-www/no-trailing-slash. **OR-4 (P0):** 2 concept pages → 410 + `X-Robots-Tag` + sitemap-excluded (verified on hybrid server). **OR-3:** `?pillar=` → canonical `/systems`. **OR-2:** slug-immutability + validated 301 redirect-map (ADR-0004). **OR-1:** trailing-slash policy enforced. **SEO-regression vitest suite (29 tests) + nuxt-link-checker** green. CWV (prod, post-impl) good: LCP 1.97s/CLS 0/TBT 0ms. **Only open item: B5** (Vercel Primary Domain → apex; human). Audit: `audits/01-technical.md` §10–11. |
| 02 | On-Page & Metadata | `seo/05-onpage` | on-page agent | **done** | 00, 03-keywords | Branch `seo/05-onpage`. **Full build-out:** unique title/desc/canonical(non-www)/OG/Twitter via `usePageSeo` on **all 52 prerendered pages** (home, /systems, 30 modules, 4 pillar hubs `/pillars/*`, 6 industry pages `/industries/*`, 5 insight explainers `/insights/*`, /diagnose, /contact); `titleTemplate`; `lang=en-ZA`; answer-first slot + `definition`/`faqs` from S03's verified ZA keyword map; one canonical page per primary intent (52/52 unique). Regression test `npm run test:seo` (0 violations) + `nuxt generate` clean. Audit `audits/05-onpage.md` §13. |
| 03 | Structured Data / Schema.org | `seo/03-schema` | _unassigned_ | pending | 00, 01 (`site.url`) | — |
| 04 | Site Architecture & Internal Linking | `seo/04-architecture` | S04 | **done** | 00 | **IMPLEMENTED + tested.** 4 pillar hubs live at `/what-we-build/<pillar>`; hub↔member linking; footer + home wired to hubs + `/systems`; `SeoBreadcrumb` + `RelatedSystems` on all templates; faceted `?pillar=` removed from crawl graph; concept pages delinked. `nuxt generate` exit 0 (76 routes); **16/16** arch tests pass (`npm run test:arch`). Audit §8 = impl log. **OR-6/OR-7 now done by S04**; OR-3/OR-4/OR-8 remain (S01/S03). |
| 05 | Keyword & Market Research (SA) | `seo/05-keywords` | _unassigned_ | pending (unblocked) | 00 | — |
| 06 | Content Strategy & Editorial | `seo/06-content` | _unassigned_ | pending | 00, 05 | — |
| 07 | AEO — Answer Engine Optimization | `seo/07-aeo` | AEO agent | **done** | 00 ✓, 03 (ask), 05 (soft) | `seo/07-aeo` — AEO standard + components + **all 32 systems + 4 pillar hubs (`/pillars/*`) + home + `/systems` populated** (answer-first 40–60w + PAA FAQs), byte-verified server-side. **188 vitest regression tests pass; `nuxt generate` clean (76 routes).** Live SA SERP/PAA evidence ($0.081). Audit `audits/07-aeo.md`. **JSON-LD hand-off to S03/S08 logged below (P0).** |
| 08 | GEO — Generative Engine Optimization | `seo/08-geo` | _unassigned_ | pending | 00, 03, 05, 07 | — |
| 07′ | GEO (commissioned on `seo/07-geo`) | `seo/07-geo` | GEO agent | **done** | 00 | **Implemented on-site:** Organization JSON-LD + disambiguation (`organization.ts`/`app.vue`), home entity section, 4 pillar hubs (`/pillars/*`) + cited GEO blocks on 5 flagship pages (real sources: McKinsey/ACFE/POPIA/IDC/Salesforce), `/llms.txt`+`/llms-full.txt`, `npm run test:geo` (8/8), entity kit + ADR-0002 + AI-citation baseline (`_evidence/07/`). 78 routes prerender clean. Baseline SOV 0% / entity conflated w/ Zabble Inc — flips after deploy + entity-kit. |
| 09 | Performance & Core Web Vitals | `seo/09-performance` | _unassigned_ | pending | 00 | — |
| 10 | Off-Page, Local SEO & Measurement | `seo/10-offpage-local` | _unassigned_ | pending | 00, 05 | — |

### Dependency notes
- **Everything depends on S00** (this knowledge base + access). S00 is **done**;
  DataForSEO is verified, funded, and live.
- **S05 is the critical-path upstream** for S02, S06, S07, S08 — now unblocked and
  the highest-leverage session to run first.
- **S01 sets `site.url`** — S03's schema and S02's canonicals depend on it. Do S01
  early.
- **S03 → S07 → S08**: entity/schema foundation feeds AEO, which feeds GEO.

### Cross-session asks from On-Page (`seo/05-onpage`, 2026-06-04 — build-out complete)
> Mirrored from `audits/05-onpage.md §11 + §13.4`. Numbers are this board's.
> **Now live for downstream sessions:** 52 pages with answer-first `definition`s,
> `faqs`, `keywords[]` on `app/data/{systems,industries,insights}.ts` + `PILLAR_SEO`;
> routes `/pillars/*`, `/industries/*`, `/insights/*`, `/contact`.
- **→ S03 schema** — per-template JSON-LD reading `definition`/`faqs`/`keywords`
  off the data files: `Service`+`FAQPage`+`Breadcrumb` (modules, pillars,
  industries), `Article`/`BlogPosting` (`/insights/*`), `ContactPage` (`/contact`),
  `CollectionPage`+`ItemList` (hubs), `Organization`/`WebSite` site-wide.
- **→ S10 content** — long-form body under each `/insights` heading + `/industries`
  copy (answer-first intros + headings already in place); sharpen module FAQs.
- **→ S09 perf** — generate per-page OG images / ship `/public/og-default.png`
  (only known broken asset ref).
- **→ S01 technical** — set apex as Vercel **Primary Domain** so non-www canonical
  matches the served host (**B5**); install `@nuxtjs/seo` + `site.url` so
  `usePageSeo` can defer canonical/OG to the module and the sitemap enumerates all
  52 URLs.
- **→ S01:** set `site.url='https://zabble.org'`, install `@nuxtjs/seo` (Nuxt-4
  pin), sitemap from `systems.ts`, robots `Sitemap:` line, **staging `noindex`
  guard (B3)**. Then `usePageSeo` can drop its manual canonical. *Heads-up:* this
  session added `titleTemplate`, `lang='en-ZA'` + a fallback `title` to the shared
  `nuxt.config.ts` `app.head` (small/additive) — **rebase on it**.
- **→ S05 (keywords):** verify every cluster in `audits/05-onpage.md §9` (SA
  vol/KD/intent); confirm the **integration family** (integration-hub /
  cross-system-sync / legacy-bridge / master-data-hub / workflow-orchestrator) and
  **compliance-reporting vs data-routing** don't cannibalise on SERP.
- **→ S06 (content):** populate `seoTitle`, `seoDescription` (distinct per
  module), `definition` (40–60-word answer-first) + `faqs` on `app/data/systems.ts`;
  write `/solutions/*`, `/insights/*`, `/contact` copy (blueprints in §6).
- **→ S07 (AEO):** own FAQ question wording (match real PAA/SERP) + the answer-first
  definitions; confirm snippet-type per target.
- **→ S03 (schema):** implement per-template JSON-LD (`audits/05-onpage.md §10`)
  reading `definition`/`faqs` straight off `systems.ts` — markup only what's visible.
- **→ S09 (perf):** generate per-page OG images or ship `/public/og-default.png`
  (referenced by `usePageSeo`).
### S07 (AEO) cross-session asks — logged 2026-06-04
> Added by S07 without editing other rows (conventions §2). Each owner: please
> action and update your own row. Detail in `audits/07-aeo.md` §6.
- **→ S03 (Schema/JSON-LD owner) — P0 — JSON-LD HAND-OFF, serves S08/GEO.**
  Emit `FAQPage` JSON-LD on **all 36 answer pages** and `QAPage`/`Question` for
  each answer block, sourced verbatim from the structured data (so the marked-up
  text is byte-identical to what renders — proven by `test/aeo-rendered.spec.ts`):
  - per system: `system.answer` / `system.faqs` (merged onto `SYSTEMS` from
    `app/data/aeo-content.ts`);
  - home + `/systems`: `HOME_ANSWER`/`HOME_FAQS` + `SYSTEMS_INDEX_ANSWER`/
    `SYSTEMS_INDEX_FAQS` (`app/data/site-faqs.ts`);
  - pillar hubs: `PILLAR_HUBS[slug].answer` / `.faqs` (`app/data/pillar-content.ts`).
  Types `Faq`/`AnswerBlock` exported from `app/data/systems.ts`. Import the same
  objects — do not re-type the strings. (The goal brief calls this the "S08"
  hand-off; in repo numbering S03 owns JSON-LD injection and S08/GEO is the
  consumer. Logged to both.)
- **→ S05 (Keywords) — P1.** SA volume + KD for the AEO question set (request
  appended to `targets/keyword-map.md` §4) to re-rank the page backlog.
- **→ S08 (GEO) — P1.** AI Overview present on ~33/38 sampled queries; run
  citation tracking, report whether Zabble is cited. Consume the FAQ/answer
  JSON-LD (above) as GEO entity signal.
- **→ S06 (Content) — P1.** All systems now have a baseline answer + FAQ set;
  extend with deeper long-form/article copy per `content/aeo-standard.md`,
  keeping the answer-first shape.
- **→ S10/S08 — P1.** `local_pack` on SA service queries ("custom software
  development south africa", "who builds custom software…").
- **→ S02 (On-page) — P2.** New `/pillars/<slug>` hub pages carry a default
  `useHead` (title/description from `app/data/pillar-content.ts`); finalise their
  per-page meta + canonicals to your standard.

---

## Setup summary (S00 outcomes vs goal conditions)

| Goal condition | State |
|----------------|-------|
| 1. `claude mcp list` connected + sandbox call succeeds through MCP | **DONE** — MCP `dataforseo` (hosted HTTP) `✓ Connected`; sandbox SERP (SA) returns `20000 Ok` and live SERP returns `20000` (10 results, $0.002). *To call the MCP tools in a Claude Code session, launch with env loaded (access doc §3) — an already-running session won't have picked up a mid-session server add.* |
| 2. Live `user_data` returns positive `money.balance`, recorded | **DONE** — account verified + funded; `balance = 50.998` USD (was $1), captured 2026-06-04 in `00-access-and-credentials.md` + `_evidence/00/`. |
| 3. `.env` has creds, git-ignored; `.env.example` documents vars, no secrets | **DONE** — `.env` (creds + `DATAFORSEO_BASIC_AUTH`) git-ignored; `.env.example` placeholders only. |
| 4. `docs/seo/` exists with all required files | **DONE** — full tree authored (README, status, 00-conventions, 00-access, 4 reference docs, keyword-map skeleton, audits 00–10, content/, decisions/ + ADR-0001, _evidence/). |
| 5. status.md lists all 11 sessions (status/owner/branch/deps) | **DONE** — this board. |
| 6. Setup summary + missing-access written + reported | **DONE** — this section + below. |

**Net:** all 6 goal conditions met. Foundation in place, MCP wired + connected,
DataForSEO account verified + funded ($50.998), live + sandbox calls return
`20000`. The 10 discipline sessions can begin.

---

## ⚠ Blockers & missing access

| ID | What | Who | Blocks | Detail |
|----|------|-----|--------|--------|
| ~~B1~~ | ~~Verify DataForSEO account~~ — **RESOLVED 2026-06-04** (sandbox + live now `20000`). | User ✅ | — | `00-access-and-credentials.md` §2 |
| ~~B2~~ | ~~Fund the account~~ — **RESOLVED 2026-06-04** (balance $50.998). Keep an eye on burn as S05 runs at volume. | User ✅ | — | `00-access-and-credentials.md` §1 |
| ~~B3~~ | ~~Staging URL~~ — **OBSOLETED 2026-06-04 (S01).** The app is **already deployed to production on Vercel** (`zabble.org` 308→`www.zabble.org`). S01 implemented a **fail-closed, Vercel-env-aware noindex guard** instead (`VERCEL_ENV==='production'` → indexable; preview/staging → `Disallow: /` + noindex). No separate staging URL needed. | — | — | `audits/01-technical.md` §6 |
| B4 | **GSC + Bing + analytics access** (DNS for `zabble.org` domain verification; POPIA-compliant analytics choice). **Now urgent — site is LIVE + indexable.** | User → S10/S01 | S10 measurement, launch indexing | `reference/measurement-indexing.md` §7 |
| B5 | **Vercel Primary Domain** is `www` → apex 308-redirects to www, conflicting with the non-www canonical (S01 docs + tags). Set Primary Domain = `zabble.org` (apex) in Vercel → Settings → Domains. 30-sec dashboard toggle. | User/devops → S01 | S01 (P1, F2) | `decisions/0003-redirect-map.md` |

### Still needed from the user (not blocking session start)
1. **Staging URL** (B3) — for S01's pre-launch `noindex` guard.
2. **GSC / Bing / analytics access** (B4) — for S10 + launch indexing.

DataForSEO access is fully live — all 10 sessions can start. **Each new Claude
Code session must launch with env loaded** (access doc §3) so the MCP tools
authenticate.

---

## Open requests — S04 (Architecture) → other sessions

Raised 2026-06-04 by S04. Full detail in `audits/04-architecture.md` §6;
taxonomy in `targets/site-architecture.md`; rules in `targets/internal-linking.md`.
Owners: please action on your branch and tick here.

| Ref | To | Ask | Pri |
|---|----|-----|-----|
| **OR-4** | **S01** (+S06) | **P0 — indexing guard (delinking already done by S04).** S04 removed the 2 concept pages from every link surface, so `crawlLinks` no longer generates them (verified by test). **Still needed:** `noindex` + sitemap-exclude (and ideally a 404/410 route guard) so they can never be indexed even if hit directly **or** S06 publishes real copy. | **P0** |
| OR-3 | S01 + S03 | Faceted `/systems?pillar=` → canonical `/systems` (or `noindex,follow`); not the sole path to a pillar. | P1 |
| OR-2 | S01 | Adopt "published slugs immutable; rename ⇒ 301" + redirect-map mechanism. | P1 |
| OR-1 | S01 | Decide/document trailing-slash policy + clean-URL canonical form for the taxonomy. | P2 |
| ~~OR-6~~ | S04 ✓ | **DONE by S04** — footer block + home "What We Build" → hubs implemented & tested. S06: optional copy polish only. | done |
| ~~OR-7~~ | S04 ✓ | **DONE by S04** — 4 pillar hubs live with full membership linking. S06: optional hub-prose enrichment; S01: optionally add `/what-we-build/*` to `sitemap.xml` (auto-discovered via `crawlLinks` today). | done |
| OR-8 | S03 | `BreadcrumbList` JSON-LD matching the visible `SeoBreadcrumb` 1:1 on all non-home pages; hub schema for pillar/industry pages. | P1 |
| OR-5 | S02 | Upgrade `SystemCard` anchor to use the **module name** as link text; review breadcrumb/related blocks S04 added to `systems/index.vue` + `[slug].vue` (navigation regions only — `useHead`/meta untouched). | P2 |
| OR-9 | S05 | Verify 10 seed anchor clusters (`internal-linking.md` §2.2) + one "…South Africa" variant per module. *(Also appended to `targets/keyword-map.md` §4.)* | P1 |
## Cross-session asks (from S07-geo / GEO)

Logged here so nothing depends on a verbal handoff (conventions §4.7). Source:
[`audits/07-geo.md`](audits/07-geo.md) §6 + [`07-geo-entity-plan.md`](audits/07-geo-entity-plan.md).

| To | Ask | Priority | Where |
|----|-----|----------|-------|
| **S01** (robots, indexing, sitemap) | Replace `public/robots.txt` with the GEO-aligned policy; ensure the pre-launch `noindex` guard does **not** block AI crawlers; set `site.url` + emit `sitemap.xml`. | P0 | [ADR-0002](decisions/0002-ai-crawler-policy.md) |
| **S03** (schema) | Organization JSON-LD is **implemented** (`app/data/organization.ts` → `app.vue`). **Consume it (don't redeclare);** add per-page `Service`/`Product`, `FAQPage`, hub `ItemList`. | P0 | entity-plan §2 |
| **S06 / S02 / S07-aeo** (content/on-page/AEO) | Adopt the GEO content standard as the money-page editorial bar; apply the worked examples. | P1 | 07-geo §8–9 |
| **S10** (off-page/local/measurement) | Wikidata item + cross-web profiles (LinkedIn/GBP/Crunchbase/directories) using the brand-description standard; pursue the brand-mention target list; wire monthly AI-citation tracking + AI referral analytics. | P0–P2 | entity-plan §3–5 |
| **S05** (keywords) | Research SA volume/intent for the GEO question targets (appended to `targets/keyword-map.md` §4). | P1 | keyword-map §4 |

> Note: `/llms.txt` must stay crawlable under whatever robots policy S01 ships (it
> is covered by the default allow). `llms.txt` `sameAs`/contact links should be
> refreshed as S10 brings profiles live.
>
> **Single consolidated owner-action list** (deploy + external accounts + every
> cross-session ask, prioritised): [`audits/07-geo.md`](audits/07-geo.md) §12.
> External-account steps are copy-paste ready in [`entity-kit/`](entity-kit/).

---

## How a session starts (quick reference)
1. `git switch -c <your-branch> origin/main`.
2. Read `00-conventions.md` (binding) + your reference docs + your `audits/0X-*.md`.
3. Confirm your dependencies above are `done`/unblocked.
4. Load env (`set -a; source .env; set +a` or the PowerShell snippet in access
   doc §3) and launch Claude Code so the MCP gets credentials.
5. Do the audit; capture evidence; update **your row** here to `done` + PR link.
