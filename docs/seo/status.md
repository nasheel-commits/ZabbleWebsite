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
| 04 | Site Architecture & Internal Linking | `seo/04-architecture` | S04 | **done** | 00 | **IMPLEMENTED + tested.** 4 pillar hubs live at `/what-we-build/<pillar>`; hub↔member linking; footer + home wired to hubs + `/systems`; `SeoBreadcrumb` + `RelatedSystems` on all templates; faceted `?pillar=` removed from crawl graph; concept pages delinked. `nuxt generate` exit 0 (76 routes); **16/16** arch tests pass (`npm run test:arch`). Audit §8 = impl log. **OR-6/OR-7 now done by S04**; OR-3/OR-4/OR-8 remain (S01/S03). |
| 03 | Structured Data / Schema.org | `seo/08-schema` ‡ | structured-data agent | **done** | 00, 01 (`site.url`) | Organization+WebSite identity + per-template schema (WebPage/CollectionPage/ItemPage, BreadcrumbList, Service, ItemList) via `nuxt-schema-org`; server-rendered, all validated → `_evidence/08/`. See `audits/08-schema.md`. ‡ commissioned on branch `seo/08-schema` (not `seo/03-schema`). |
| 07 | AEO — Answer Engine Optimization | `seo/07-aeo` | AEO agent | **done** | 00 ✓, 03 (ask), 05 (soft) | `seo/07-aeo` — AEO standard + components + **all 32 systems + 4 pillar hubs (`/pillars/*`) + home + `/systems` populated** (answer-first 40–60w + PAA FAQs), byte-verified server-side. **188 vitest regression tests pass; `nuxt generate` clean (76 routes).** Live SA SERP/PAA evidence ($0.081). Audit `audits/07-aeo.md`. **JSON-LD hand-off to S03/S08 logged below (P0).** |
| 06 | Content Strategy & Editorial | `seo/10-content`¹ | Content strategist | **done** | 00, 05 (used spot-research) | Strategy + **published articles**. Topical model + calendar (`content/editorial-calendar.md`) + 15 briefs. **All 15 first-wave articles now written & shipped as server-rendered pages** (`app/data/articles.ts`; `/blog/*`, `/what-we-build/*`, `/blog/rss.xml`) with real cited sources, answer-first intros, PAA FAQs + Zabble voice. `nuxt generate` clean (107 routes); `vitest` 231 green (content + link-checker + prerender). Audit/coverage §9 in `audits/10-content.md`. **Hand-offs → S03/S08:** Article+FAQPage JSON-LD ready to generate from `articles.ts` fields. **→ S09:** per-article OG images (og:image omitted). **→ S04:** nav adds Insights + links `/what-we-build`. |
| 07′ | GEO (commissioned on `seo/07-geo`) | `seo/07-geo` | GEO agent | **done** | 00 | **Implemented on-site:** Organization JSON-LD + disambiguation (`organization.ts`/`app.vue`), home entity section, 4 pillar hubs (`/pillars/*`) + cited GEO blocks on 5 flagship pages (real sources: McKinsey/ACFE/POPIA/IDC/Salesforce), `/llms.txt`+`/llms-full.txt`, `npm run test:geo` (8/8), entity kit + ADR-0002 + AI-citation baseline (`_evidence/07/`). 78 routes prerender clean. Baseline SOV 0% / entity conflated w/ Zabble Inc — flips after deploy + entity-kit. |
| 09a | Analytics, Measurement & Indexing | `seo/09-analytics` | analytics eng | **done** | 00; coord 01, 10 | GA4/GTM/Clarity + Consent Mode v2 (POPIA opt-in) + key events (no-op until env ids); **`/privacy` + `/cookie-policy`** built + CMP/footer-linked; in-code **GSC/Bing verification meta**; IndexNow key + ping; **`npm test` 21/21** (consent/events/IndexNow/static-HTML). `build`+`generate`+`test` clean. Only launch dep: ids + DNS/meta (B4) — see audit §8 owner list. Docs: `audits/09-analytics.md`, `measurement-plan.md`, `id-secret-registry.md`, ADR 0002. |

> ¹ The content-strategy task was **issued as "S10 content"** on branch
> `seo/10-content` (≠ the conventions' `seo/06-content`). Delivered there to
> satisfy the issued goal; functionally this is session 06. See
> `audits/10-content.md` §0 for the reconciliation. Off-page (true S10) untouched.
| 10 | Off-Page, Local SEO & Measurement | `seo/04-offpage-local` | S04 | **done** (audit + **on-site implementation**) | 00, 05 | **Audit:** competitor map, content/link gaps, digital-PR + velocity plan. **Built + tested:** 5 ZA metro landings + 8 industry pages + linkbait asset + About/Press (all server-rendered, 52 pages, `nuxt generate` clean, `test:seo` 26/26, 0 broken links); outreach + GBP/citation kits; LocalBusiness fields handed to S08. Branch `seo/04-offpage-local`. Spend ~$0.18 (no new spend this session). _B4/B5/B6 still owner-gated._ |
| 05 | Keyword & Market Research (SA) | `seo/03-keywords` | keyword agent | **done** | 00 | Keyword→URL→intent→layer→priority map operationalised (`targets/keyword-map.md`): SA volume/KD per cluster, full URL coverage of the money set, rank baseline + tracking list + a validator. Evidence in `_evidence/03|05/`. Feeds S02/S06/S07/S08 (OR-9 anchor/“…South Africa” clusters verified). |
| 09 | Performance & Core Web Vitals | _folded into S01_ | S01 | **done** | 00 | No separate branch was commissioned; CWV is owned within S01 (Technical). Production CWV measured **good** (LCP 1.97s / CLS 0 / TBT 0ms) for this static-generated codebase; integration added only static pages + **consent-gated/deferred** analytics (no tags pre-consent), so no perf regression. Re-run Lighthouse on the live deploy post-env-vars (launch-checklist). |

> **INTEGRATION (2026-06-04):** all 10 discipline branches merged into `main`
> (backup tag `pre-integration-backup`). Conflicts resolved by union; integration
> points reconciled (pillar hubs consolidated to `/what-we-build`, single
> Organization entity, FAQ↔FAQPage byte-match, llms.txt refreshed, metadata
> standardised). Full sanity suite green — see `launch-checklist.md`. Remaining
> work is **owner/DNS only** — see `owner-actions.md`.

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
### Cross-session asks from S03/schema (branch `seo/08-schema`, updated 2026-06-04)
Schema implemented + validated (all types pass; FAQ byte-identical to on-page text;
see `audits/08-schema.md`). Markup matches reality — nothing fabricated.

**Resolved this pass:**
- **S07 (AEO) ✓** — FAQ content delivered + integrated; **`FAQPage` now emits**
  byte-identically on home + 7 system pages. More systems light up automatically as
  S07 adds FAQ sets to `AEO_CONTENT`.
- **S07-geo (entity) ✓ (schema side)** — Organization `description`/`knowsAbout`
  applied byte-exact to boilerplate B + `llms.txt`; `disambiguatingDescription`
  carries the "not Zabble, Inc. (US)" signal.
- **S04 (local) ◑** — `areaServed` = South Africa + Jhb/CPT/Pretoria added.

**Still needed (wired-on-arrival — nothing fabricated until real):**
- **S10:** verified `sameAs` URLs (LinkedIn/Crunchbase/GBP) + the Wikidata item →
  uncomment the `sameAs` block in `nuxt.config.ts`. (All PENDING per 07-geo §2/§4.)
- **S01/design:** a ≥112×112 `/public/zabble-logo.png` → uncomment `logo`.
- **S04/S10:** verified NAP (blocker **B6**) → upgrade Organization to `LocalBusiness`.
- **S06/S10:** live blog pages → `Article`/`BlogPosting` via the ready
  `useContentSchema.ts` (only briefs exist today, no `app/pages` posts).
- **S01/S10:** run Google Rich Results Test on live URLs at launch — paste from
  `_evidence/08/rrt-paste-in.md` (no public API; site is pre-launch).
- **S01:** dedupe `nuxt-schema-org` vs the `@nuxtjs/seo` umbrella on rebase.

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
| B3 | **Staging URL** not provided. Needed so S01 can set the pre-launch `noindex` guard before any indexing happens. | User → S01 | S01 (P1) | `reference/nuxt-seo-implementation.md` §5 |
| B4 | **GSC + Bing + analytics access**. Analytics **stack now implemented** (S09a) and POPIA-compliant — *unblocked on the code side*. Still needs from the user: **GA4/GTM/Clarity ids** → `.env` (`NUXT_PUBLIC_ANALYTICS_*`), and **DNS access** to publish the GSC `TXT` for the `zabble.org` Domain property. | User → S09a/S10 | launch indexing + live data | `measurement-plan.md`, `id-secret-registry.md` |

### Still needed from the user (not blocking session start)
1. **Staging URL** (B3) — for S01's pre-launch `noindex` guard.
2. **GA4 / GTM / Clarity ids** (B4) → `.env`; and **DNS access** for the GSC TXT record. Analytics code is done and no-ops until ids are set.

### Cross-session asks from S09a (analytics)
- **S01:** confirm `site.url`, robots `Sitemap:` line, **staging `noindex`**, and the generated `sitemap.xml` path (IndexNow ping + GSC submit read it; never submit staging).
- **S02/S06 + owner:** add a **`/privacy`** POPIA/cookie policy page for the CMP + footer to link.
- **S10:** fold S09a's 6 key events + AI-referral channel into the launch KPI set.
| B4 | **GSC + Bing + analytics access** (DNS for `zabble.org` domain verification; POPIA-compliant analytics choice). | User → S04/S01 | S04 measurement, launch indexing | `reference/measurement-indexing.md` §7 |
| B5 | **DataForSEO Backlinks API not subscribed** — `40204 Access denied` on `backlinks/*`. It's a separate paid subscription (the "higher minimum commitment"). Decide whether to activate to unlock competitor referring-domain intel + link-velocity tracking. S04's digital-PR plan was built from observable competitor link-*assets* in the meantime. | User → S04 | S04 backlink data (not the plan) | `audits/04-offpage-local.md` §1,§4 F7; `_evidence/04/README.note.md` |
| B6 | **NAP inputs for local SEO** — confirm exact registered business name, a verifiable SA address (or service-area), a `+27` phone, and the public contact email. Required before GBP creation + citation build. | User → S04 | GBP, citations, local pages | `targets/local-seo.md` §2,§3 |

### S04 → S08 hand-off — LocalBusiness/Organization schema + `sameAs` (GEO entity)
**S04 built the local/industry/entity pages and left a marked `SCHEMA SLOT (S08)` in
each** (`app/pages/locations/[city].vue`, `industries/[industry].vue`, `about.vue`,
`press.vue`, `insights/…landscape.vue`). The **exact JSON-LD + every field source** is
specified in **`targets/localbusiness-schema-fields.md`** — S08 emits the schema;
S04 deliberately did not (schema write-ownership). All entity fields live in one place:
`app/data/nap.ts` (`NAP`), with `app/data/locations.ts` / `industries.ts` for page data.
- **Organization** (`/about`, home, `/press`): name, `NAP.description`, areaServed,
  `sameAs = NAP.sameAs[].url` (fill as profiles go live), `knowsAbout`.
- **LocalBusiness/ProfessionalService** per `/locations/<city>`: areaServed + `geo`
  from `locationBySlug`; omit address/phone until B6 (`napHasAddress()` guard).
- **Service** per `/industries/<slug>`; **Article** on the landscape asset;
  **BreadcrumbList** on every detail page. (All in the field doc.)
- **`sameAs` set:** LinkedIn, Crunchbase, GBP, Bing Places, Apple, Clutch, GoodFirms,
  DesignRush, Brabys, Nichemarket, X — full list with submit URLs in
  `targets/local-kit/citation-checklist.csv` (`sameas_for_s08 = yes`).
- **Never emit a `NAP_PENDING` value** — guard with `napReady()`/`napHasAddress()`.

### Cross-session coordination notes (new pages I added)
- **S01 / deployment (canonical host):** the live site has an apex↔www split
  (deployment B5). All new pages emit canonical/og/schema URLs from **one knob** —
  `NAP.url` in `app/data/nap.ts` (currently `https://zabble.org`). If www is the
  canonical host, change that single value to `https://www.zabble.org` and the whole
  landing system follows. (Flagged, not guessed — host canonicalisation is S01/deploy.)
- **S01 (nuxt.config):** the new routes prerender via `crawlLinks` (reached from the
  rebuilt footer) — **`nuxt.config.ts` left untouched.** If you change prerender
  config, keep `crawlLinks: true` (or add `/locations/**`, `/industries/**`,
  `/insights/**`, `/about`, `/press` to `prerender.routes`). Add them to the sitemap.
- **S02 (metadata):** new pages set their own unique `useSeoMeta` title/description +
  canonical (required for the build to pass `test:seo`). Fold into your sitewide
  meta strategy if/when you standardise it.
- **S03 (schema composable):** if you own a `useSchemaOrg`/`nuxt-schema-org` wiring,
  S08's emission should plug into it; field doc above is composable-agnostic.
- **S06 (content):** owns ongoing editorial for `/insights` (the landscape asset is
  live and citable; expand the hub).

### ⬇ Consolidated owner asks (one list — what S04 needs from you)
1. **NAP details (B6)** — exact registered name, a verifiable SA address *or*
   service-area confirmation, a `+27` phone, public email. Unblocks: GBP, all
   citations, address/phone in schema, page contact blocks. Edit one file:
   `app/data/nap.ts`.
2. **GBP creation + verification** — owner login. Spec ready:
   `targets/local-kit/gbp-profile-spec.md`.
3. **Backlinks subscription decision (B5)** — optional; activates competitor
   referring-domain export + link-velocity monitoring.
4. (Pre-existing) **Staging URL (B3)** and **GSC/Bing/analytics (B4)** — S01/measurement.

### Still needed from the user (not blocking session start)
1. **Staging URL** (B3) — for S01's pre-launch `noindex` guard.
2. **GSC / Bing / analytics access** (B4) — for S04 + launch indexing.
3. **Backlinks subscription decision** (B5) — to unlock competitor link data.
4. **NAP inputs** (B6) — to start GBP + local SEO + emit address/phone in schema.

DataForSEO access is fully live — all 10 sessions can start. **Each new Claude
Code session must launch with env loaded** (access doc §3) so the MCP tools
authenticate.

---

## Open requests — S04 (Architecture) → other sessions

Raised 2026-06-04 by S04. Full detail in `audits/04-architecture.md` §6;
taxonomy in `targets/site-architecture.md`; rules in `targets/internal-linking.md`.
Owners: please action on your branch and tick here.

**ALL CLOSED at integration (2026-06-04).** No dangling P0/P1.

| Ref | To | Ask | Pri | Status |
|---|----|-----|-----|--------|
| ~~OR-4~~ | S01 | **P0** — indexing guard for the 2 concept pages. | P0 | ✅ **CLOSED** — delinked (S04) + `noindex,nofollow` + `X-Robots-Tag` routeRules + prerender-excluded + served **410** by the `[slug].vue` gate; excluded from sitemap. Verified by the architecture suite (“concept/thin pages are delinked, not generated”). |
| ~~OR-3~~ | S01+S03 | Faceted `?pillar=` → canonical `/systems`. | P1 | ✅ **CLOSED** — `canonicalUrl` strips query → `/systems`; verified in `seo-logic.test.ts`. |
| ~~OR-2~~ | S01 | Slug-immutability + 301 redirect-map. | P1 | ✅ **CLOSED** — ADR-0004 + `app/data/redirects.ts` (`validateRedirects` guards loops/chains); host-layer structural redirects in `vercel.json`. |
| ~~OR-1~~ | S01 | Trailing-slash + clean-URL policy. | P2 | ✅ **CLOSED** — non-www, no trailing slash except root (`https://zabble.org/`); `cleanUrls`+`trailingSlash:false` in `vercel.json`; asserted in `seo-logic.test.ts` + `prerender.test.ts`. |
| ~~OR-6~~ | S04 | Footer + home → hubs/`/systems`. | P1 | ✅ **CLOSED** (S04) — footer hub block + home “What We Build” wired to `/what-we-build/*` + `/systems`. |
| ~~OR-7~~ | S04/S06 | 4 pillar hubs at `/what-we-build/<pillar>`. | P1 | ✅ **CLOSED** — canonical hubs live (the parallel `/pillars/*` duplicate was consolidated → `/what-we-build` + 301 at integration); in sitemap. |
| ~~OR-8~~ | S03 | `BreadcrumbList` JSON-LD 1:1 with visible breadcrumb. | P1 | ✅ **CLOSED** — `defineBreadcrumb` per template; `validate-schema.mjs` asserts breadcrumb item count + in-graph `@id` resolution. |
| ~~OR-5~~ | S02 | `SystemCard` module-name anchor + review S04 nav blocks. | P2 | ✅ **CLOSED** — module-name anchors verified by the architecture suite (“descriptive in-body anchors, not ‘view system’”). |
| ~~OR-9~~ | S05 | Verify seed anchor clusters + “…South Africa” variants. | P1 | ✅ **CLOSED** (S05/keywords) — clusters verified in `targets/keyword-map.md`; one ZA variant per module. |
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
