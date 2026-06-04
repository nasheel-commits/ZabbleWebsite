# Audit 05 — On-Page & Metadata (page blueprints + dynamic metadata)

- **Session:** 05 (On-Page & Metadata — "S05 on-page" per this session's brief)
- **Branch:** seo/05-onpage
- **Owner:** On-page specialist (agent)
- **Status:** done
- **Date:** 2026-06-04
- **Depends on:** 00 (foundation ✓), 05-keywords (SOFT — keyword-map is still a
  seed skeleton; targets below are UNVERIFIED until S05 fills volumes/KD), 04
  (architecture — placeholder), 01 (`site.url` + SEO suite — not yet installed)
- **Layer(s):** SEO + AEO hooks (Foundation for GEO entity)

> **Numbering note (read first).** This session was briefed as *"S05 — on-page"*.
> In the repo's 11-session board (`status.md`) the on-page discipline is **row 02
> (On-Page & Metadata)** and *05* is *Keyword Research*. To honour the brief's
> literal deliverable name this audit is filed as `audits/05-onpage.md`; the
> board's `02-onpage.md` placeholder now points here. Throughout, cross-session
> asks are mapped to the **board's** numbers: schema = **S03**, content = **S06**,
> AEO = **S07**, GEO = **S08**, keywords = **S05/keywords**, technical/config =
> **S01**, performance/OG-image = **S09**. (Where the brief said "S8 owns JSON-LD"
> / "S6/S10 own FAQ + article copy", that maps to S03 / S06–S07 here.)

---

## 1. Scope

**Owned and delivered by this session:**
- Reusable **page blueprints** for 7 templates: homepage, pillar hub, module
  (system) page, industry/solution page, use-case page, blog/insight post,
  contact. Each defines H1/H2/H3 outline, primary + secondary keyword targets, a
  40–60-word answer-first intro, required sections (in Zabble's *problem → what we
  built → what changed* voice), media, internal links and CTAs.
- **Dynamic metadata wiring** (`useSeoMeta`/`useHead`) on the four live templates,
  including the dynamic route `/systems/[slug]`: unique server-rendered title (via
  a global `titleTemplate`), meta description, canonical, Open Graph + Twitter.
- **Title + description formulas** per template, tuned for ZA SERPs and CTR.
- **AEO hooks**: structural slots (`definition`, `faqs`) on the module template so
  S06/S07 can drop answer-first definitions and FAQ blocks, and S03 can mirror
  them into schema. *Structure only — no final copy.*
- **Keyword → page mapping**: every priority cluster → exactly one canonical page
  (cannibalisation guard), §9.

**Explicitly NOT in scope (hand-offs):**
- **JSON-LD / schema** → **S03**. This audit exposes the data + visible FAQ/
  definition slots and lists schema requirements per template (§10); S03
  implements `Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, `Service`,
  `FAQPage`, `BreadcrumbList`.
- **Verified keyword volumes / KD / intent** → **S05 (keywords)**. All targets
  here are seed candidates pending DataForSEO verification.
- **Final article + FAQ + definition copy** → **S06 (content)** / **S07 (AEO)**.
- **`site.url`, SEO-module install, sitemap, robots, staging `noindex` guard** →
  **S01**. This audit deliberately does **not** set `robots`; indexability stays a
  global S01 decision so we never index staging.
- **OG image generation** (`nuxt-og-image`) and CWV → **S09**.

## 2. Method

- Read every live page component (`app/pages/**`), `app/data/systems.ts` (32
  module entries; the single source of truth), `nuxt.config.ts`, `app/app.vue`,
  and the four reference docs (`nuxt-seo-implementation.md`,
  `aeo-geo-principles.md`, `00-conventions.md`, `Zabble-Business-and-Modules-Overview`).
- Cross-referenced the seed `targets/keyword-map.md` (UNVERIFIED) to assign one
  canonical page per cluster.
- Implemented metadata via a single S02-owned composable (`usePageSeo`) + a global
  `titleTemplate`, then **prerendered the site (`npm run generate`)** and grepped
  `.output/public/**/index.html` to confirm the tags are unique and server-rendered
  (§7 evidence). No DataForSEO calls were made — keyword research is S05's owned
  scope and budget; this audit consumes the seed map and flags verification.

## 3. Current state (findings)

| # | Finding | Evidence |
|---|---------|----------|
| F1 | Before this session, only `app.head` set a **single global** title + description. The home page (`index.vue`) had **no** per-page meta at all — it inherited the global tag. | `nuxt.config.ts` `app.head`; `app/pages/index.vue` had no `<script>`. |
| F2 | `/systems`, `/systems/[slug]`, `/diagnose` set a bare `useHead` title + description only. **No canonical, no Open Graph, no Twitter, no `og:locale`** anywhere on the site. | `[E: 02/before-meta-grep.txt]` |
| F3 | Module pages derived their description from `system.tagline`. Taglines are punchy but several are generic/benefit-only → **thin/duplicate-meta risk across 30 pages** (the #1 on-page risk per `aeo-geo-principles.md §2`). | `app/data/systems.ts` |
| F4 | HTML `lang` was `en`, not `en-ZA` (conventions §7 wants the SA locale signal). | `nuxt.config.ts` |
| F5 | No SEO suite installed (`@nuxtjs/seo` absent) and `site.url` unset, so there is **no automatic canonical/sitemap** — canonicals must be wired manually until S01 lands. | `package.json`; `node_modules/@nuxtjs` absent |
| F6 | No answer-first definition or FAQ structure on any page → no AEO snippet/PAA eligibility yet. | page templates |
| F7 | Filtered hub URLs (`/systems?pillar=…`) are crawlable variants of `/systems` with no canonical → **self-cannibalisation risk**. | `app/pages/systems/index.vue` query handling |

## 4. Gaps & opportunities (prioritised)

| Pri | Gap | Opportunity |
|-----|-----|-------------|
| **P0** | No per-page title/description/canonical/OG (F1, F2, F7). | Unique, server-rendered tags on all live templates + canonical that folds `?pillar` variants into `/systems`. **Done this session.** |
| **P0** | Thin/duplicate meta across 30 module pages (F3). | `seoTitle`/`seoDescription` slots so S06 writes distinct, intent-bearing copy per module. **Slots added; copy = S06.** |
| **P1** | No AEO structure (F6). | `definition` (answer-first) + `faqs` slots on the module template, question-led H2s. **Structure added; copy = S06/S07; schema = S03.** |
| **P1** | `en` not `en-ZA` (F4). | Set `htmlAttrs.lang = 'en-ZA'`. **Done.** |
| **P1** | Whole clusters have no landing page: industries, informational/how-to, contact. | Add `/solutions/<industry>`, `/insights/<slug>`, `/contact` (blueprints in §6; build = S06 + S02 follow-up). |
| **P2** | OG image references a non-existent asset. | `nuxt-og-image` or a static `/og-default.png` (S09). |

## 5. Recommendations

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| R1 | P0 | Add `titleTemplate: '%s · Zabble'` + `lang: 'en-ZA'`; per-page `useSeoMeta` via `usePageSeo`. | `nuxt.config.ts`, `app/composables/usePageSeo.ts` (S02) | §7 |
| R2 | P0 | Wire home, hub, `[slug]` (dynamic), diagnose with unique title/desc/canonical/OG. | `app/pages/**` (S02) | §7 |
| R3 | P0 | Canonical `/systems` for all `?pillar=` variants. | `usePageSeo` `path:'/systems'` (S02) | §7 |
| R4 | P0 | Populate `seoTitle`/`seoDescription` per module (distinct, ≤60-char title, 150–160-char desc). | `app/data/systems.ts` (**S06**, targets **S05**) | §8, §9 |
| R5 | P1 | Write answer-first `definition` (40–60 words) + 3–5 `faqs` per priority module. | `app/data/systems.ts` (**S06/S07**) | §6.3 |
| R6 | P1 | Mirror visible `faqs`/`definition` into `FAQPage`/`Service`/`WebPage`/`Breadcrumb` JSON-LD. | schema composables (**S03**) | §10 |
| R7 | P1 | Build `/solutions/<industry>`, `/insights`, `/contact` from §6 blueprints. | new pages (**S02**+**S06**) | §6 |
| R8 | P1 | Set `site.url='https://zabble.org'`, install SEO suite, sitemap, robots `Sitemap:` line, staging `noindex`; then `usePageSeo` can defer canonical to the module. | `nuxt.config.ts` (**S01**) | §11 |
| R9 | P2 | Generate per-page OG images (or ship `/og-default.png`). | `nuxt-og-image` / `public/` (**S09**) | §11 |

---

## 6. Page blueprints (reusable templates)

Voice on every template: **problem → what we built → what changed**, plain,
specific, never overclaiming. SA English. One primary CTA: *Book a discovery
call* (`/diagnose`). Answer-first intros below are **examples** of the required
shape (40–60 words, declarative, liftable) — final copy is S06/S07.

### 6.1 Homepage `/` — *live, wired*
- **Intent / layer:** core-offering commercial + brand navigational → SEO + GEO entity.
- **Primary kw:** `bespoke business systems south africa`. **Secondary:** `custom
  software south africa`, `business automation company`, brand `zabble`.
- **H1:** "Your business has a system that's costing you. We build the one that fixes it."
- **H2s:** How we work (3 steps) · The four pillars (Automation / Audit Trails /
  Anomaly Detection / Analytics) · What we build · The cost of doing nothing · CTA.
- **Answer-first intro (example):** "Zabble is a South African firm that builds
  bespoke operational systems — automation, audit trails, anomaly detection and
  analytics — shaped around the single problem slowing one business down. We don't
  sell off-the-shelf software; we sit with a business, find the most expensive
  operational problem, and build the exact system that fixes it."
- **Media:** hero visual; pillar icons; (later) client/industry logos for trust.
- **Internal links:** → `/systems` (hub), → top 3–5 module pages, → `/diagnose`,
  → `/solutions/*` once built, → `/contact`.
- **CTA:** primary *Book a discovery call*; secondary *Browse the systems*.
- **AEO slot:** a "Who builds custom business software in South Africa?" answer
  block (GEO/voice). **Schema (S03):** `Organization` + `WebSite`.

### 6.2 Pillar hub `/systems` — *live, wired*
- **Intent / layer:** commercial → SEO. **Primary kw:** `business automation south
  africa`. **Secondary:** `operational systems`, `workflow automation south
  africa`, `custom software development south africa`.
- **H1:** "The systems we've built around businesses." **H2s:** pillar filter ·
  systems grid · CTA.
- **Answer-first intro (example):** "These are the building blocks Zabble
  assembles into a bespoke operating system. No business gets all of them — each
  gets the handful that fix the problem costing it the most, wired into one system
  shaped to how it actually works. Filter by the four pillars to see the systems
  that match your operational pain."
- **Media:** per-system gradient/thumbnail cards. **Internal links:** → every live
  module page (hub-and-spoke); ← from home; → `/diagnose`.
- **Canonical:** `/systems` (folds `?pillar=` variants). **Schema (S03):**
  `CollectionPage` + `BreadcrumbList` + optional `ItemList` of modules.

### 6.3 Module / system page `/systems/[slug]` — *live, wired (dynamic route)*
- **Intent / layer:** commercial → SEO, with AEO definition + FAQ. **Primary kw:**
  the module's cluster (§9, one per page). **Secondary:** pain-phrase variants.
- **H1:** `system.name` (or a benefit-led `seoTitle`). **H2s:** *(answer-first)*
  "What is `{name}`?" · The problem · What we built · What changed · Example
  deployment (demo) · How it fits the pillars · *(optional)* FAQs · CTA.
- **Answer-first intro (example, reconciliation-engine):** "A reconciliation
  engine automatically matches transactions across your ledgers — POS, bank,
  accounting, processor — as they land, clearing the routine matches and surfacing
  only the mismatches that need a person. It replaces the weekly spreadsheet export
  with a background process, turning ten thousand lines into a handful of real
  exceptions." (≈55 words → `system.definition`.)
- **Media:** interactive `DemoSlot`; pillar mini-grid. **Internal links:** ←
  `/systems` (breadcrumb), → 2–3 related modules ("works well with…"), → `/diagnose`.
- **CTAs:** mid-page (after demo) + closing `CtaStrip`.
- **AEO slots (added this session):** `definition` (renders a "What is {name}?"
  block high on the page) and `faqs` (renders a visible FAQ list). **Schema
  (S03):** `Service` (the module as an entity) + `BreadcrumbList` + `FAQPage`
  (mirror visible FAQs 1:1) + `WebPage`.

### 6.4 Industry / solution page `/solutions/<industry>` — *to create (gap)*
- **Intent / layer:** commercial, industry-qualified → SEO. **Primary kw:**
  `<industry> automation south africa` / `software for <industry> south africa`
  (e.g. `law firm automation south africa`, `ngo reporting software`).
- **H1:** "Systems for {industry} that {core outcome}." **H2s:** the problems this
  industry shares · the modules we combine for it (links to module pages) · a
  representative build (problem → built → changed) · FAQs · CTA.
- **Answer-first intro (example, law firms):** "Zabble builds bespoke systems for
  South African law firms — document intake, matter and case management, client
  onboarding and conveyancing task tracking — assembled into one operating system
  shaped to the firm. We start with the workflow costing the most billable hours
  and build the system that runs it."
- **Internal links:** → the modules cited (e.g. law → document-intelligence,
  case-management, task-management, client-onboarding), ← from home/`/systems`.
- **Schema (S03):** `Service` (audience = industry) + `BreadcrumbList` + `FAQPage`.
- **Candidate set (from the business overview):** law firms, NGOs, banks/FSPs,
  hospitality, parts/wholesale distribution, professional services/consulting.

### 6.5 Use-case / diagnostic page `/diagnose` — *live, wired*
- **Intent / layer:** question-led commercial-investigation → SEO + **AEO asset**.
  **Primary kw:** `how do I know which system my business needs` / `business
  process automation assessment`.
- **H1:** "Find your most expensive operational problem in under 2 minutes." (the
  step flow itself.) **Answer-first intro (example):** "This free two-minute
  diagnostic asks seven questions about how your operations run, then names the
  operational problem most likely costing you the most — and the kind of system
  that fixes it. No sign-up, no sales call required to get the result."
- **CTA:** complete the diagnostic → book the call. **Schema (S03):** `WebPage`;
  consider `HowTo`/`Quiz` only if it stays truthful to the flow.

### 6.6 Blog / insight post `/insights/<slug>` — *to create (gap)*
- **Intent / layer:** informational/how-to → **AEO + GEO**. **Primary kw:** a
  question or how-to (e.g. `how to automate bank reconciliation`, `what is anomaly
  detection in business`). One question-cluster per post.
- **H1:** the question, verbatim. **H2/H3s:** question-led sub-questions; the
  answer in the first 40–60 words; then steps/definition/comparison table as the
  query type demands (paragraph for "what is", numbered list for "how to", table
  for "X vs Y").
- **Answer-first intro:** 40–60-word direct answer **before** elaboration (S06/S10).
- **Internal links:** → the money page the post supports (e.g. a "how to automate
  reconciliation" post → `/systems/reconciliation-engine`). **Hub:** `/insights`
  index (`CollectionPage`). **Schema (S03):** `Article`/`BlogPosting` + `FAQPage`
  + `BreadcrumbList`.

### 6.7 Contact `/contact` — *to create (gap)*
- **Intent / layer:** navigational/local → SEO + **GEO/local entity**. **Primary
  kw:** `zabble contact` / `bespoke software company south africa contact`.
- **H1:** "Talk to Zabble." **Sections:** what to expect from the first call ·
  email `analytics@zabble.org` · the diagnostic as an alternative entry · NAP
  (name/SA location) for the local/GEO entity.
- **Answer-first intro (example):** "Zabble is a bespoke systems firm based in
  South Africa. The first conversation is free and useful either way: we listen for
  the operational problem costing you the most and tell you whether a system can fix
  it. Reach us at analytics@zabble.org or run the two-minute diagnostic."
- **Schema (S03):** `ContactPage` + `Organization` (consistent NAP — GEO infra).

---

## 7. Metadata implementation (delivered) + verification

**How it works.** A global `titleTemplate` (`%s · Zabble`) in `nuxt.config.ts`
appends the brand to a bare per-page `title`. One composable, `usePageSeo`
(`app/composables/usePageSeo.ts`), sets `useSeoMeta` (title, description,
OG title/desc/type/url/site_name/locale/image, Twitter card) **plus** a manual
`<link rel="canonical">` (until S01's SEO suite owns canonicals). Pages call it
once; the dynamic route passes a getter so tags track the resolved system.

**Title / description formulas (ZA-tuned):**

| Template | Title formula (→ ` · Zabble` appended) | Description formula (150–160 chars) |
|----------|----------------------------------------|--------------------------------------|
| Home | `{core-offering value prop}` | `Zabble builds {pillars} around the one problem slowing your business down.` |
| Pillar hub | `{offering category}` ("Operational Systems We Build") | `The building blocks Zabble assembles into bespoke operating systems for SA businesses — {pillars}.` |
| Module | `{seoTitle ?? name}` (benefit-led ≤45 chars) | `{what it is, one line}. {one concrete outcome}. {SA context where natural}.` |
| Industry | `{Industry} systems & automation` | `{Industry} operations, automated: {2–3 modules}. {outcome}. South Africa.` |
| Use-case | `Diagnose Your Operations` | `A free 2-minute diagnostic that finds the operational problem costing you most — and the system that fixes it.` |
| Blog | `{question / topic, verbatim}` | answer-first 1-sentence summary of the post's answer. |
| Contact | `Contact Zabble` | `Talk to Zabble about a bespoke system for your SA business. {email}.` |

**Verification (goal condition 2).** See `_evidence/05/` — grep of the
prerendered `.output/public/**` HTML showing unique, server-rendered
`<title>`, `<meta name=description>`, `<link rel=canonical>`, and `og:*`/`twitter:*`
on home, hub, three module pages and `/diagnose`, plus the `?pillar` → `/systems`
canonical fold.

---

## 8. Title/description worked examples (3 modules, for S06 to extend)

| Page | `seoTitle` (example) | `seoDescription` (example, ~155 char) |
|------|----------------------|----------------------------------------|
| `/systems/reconciliation-engine` | Automated Reconciliation Engine | Match POS, bank, processor and accounting ledgers automatically — clear the routine matches and surface only the exceptions that need a person. South Africa. |
| `/systems/bespoke-crm` | Bespoke CRM, built to your pipeline | A CRM shaped to how your team actually sells — stages, automations and dashboards that mirror your business, not a vendor's template. Built in South Africa. |
| `/systems/document-intelligence` | Document Intelligence System | An intake pipeline that reads every document, extracts and checks the fields, and routes the work — so your team only ever sees the exceptions. |

> These are illustrative. S06 writes the final 30 from S05's verified targets.

---

## 9. Keyword → page mapping (one canonical page per cluster)

**Status: targets UNVERIFIED** (seed candidates; S05 must confirm volume/KD/intent
in SA before any row counts as a target — conventions §6). Each row = one
**primary** intent on exactly one canonical page. Secondary keywords ride the same
page; question/AEO targets attach to the *same* money page as an answer layer (a
different layer, not a competing URL).

### Brand & core offering
| Cluster (primary) | Canonical page | Intent | Layer |
|---|---|---|---|
| zabble | `/` | navigational | GEO/brand |
| bespoke business systems south africa | `/` | commercial | SEO |
| business automation south africa | `/systems` | commercial | SEO |
| how do I know which system my business needs | `/diagnose` | investigation | SEO/AEO |
| who builds custom business software in south africa | `/` (answer block) | question | GEO/AEO |

### Module money pages (`/systems/<slug>`) — one primary each
| Slug | Primary (seed, UNVERIFIED) | AEO question target (same page) |
|------|----------------------------|----------------------------------|
| kairos | ai receptionist south africa | what is an AI receptionist |
| approval-workflow | approval workflow software | what is approval workflow automation |
| multi-channel-inbox | shared inbox software south africa | — |
| workflow-orchestrator | event-driven workflow automation | what is workflow orchestration |
| decision-engine | automated decision engine | what is a decision engine |
| document-intelligence | document data extraction south africa | how to automate document processing |
| document-assembly | automated document assembly | — |
| bespoke-crm | custom crm south africa | what is a bespoke CRM |
| customer-360 | unified customer record | what is a customer 360 view |
| knowledge-assistant | internal knowledge assistant ai | — |
| lead-qualifier | lead qualification automation | — |
| legacy-bridge | legacy system integration | how to integrate a legacy ERP |
| inventory-clarity | rfid inventory management south africa | — |
| client-onboarding | client onboarding software | what is automated KYC onboarding |
| case-management | case management system south africa | — |
| task-management | conveyancing workflow software | — |
| field-ops-app | offline field service app | — |
| analytics-suite | operational analytics dashboard | — |
| accounting-engine | event-driven accounting system | — |
| compliance-reporting | regulatory reporting automation (POPIA/SARB) | what is regulatory reporting automation |
| continuous-assurance | transaction fraud detection | what is anomaly detection in business |
| pricing-engine | quote automation software (CPQ) | what is CPQ |
| reconciliation-engine | automated bank reconciliation | how to automate reconciliation |
| data-routing | automated report assembly pipeline | — |
| integration-hub | ipaas south africa | what is iPaaS |
| cross-system-sync | two-way data sync software | — |
| forecasting | demand forecasting software south africa | — |
| predictive-maintenance | predictive maintenance software | — |
| master-data-hub | master data management south africa | what is master data management |
| notification-orchestration | alert orchestration software | — |
| legal-intake-automation | legal intake automation | — | *(status: concept — not published; map when live)* |
| hospitality-booking-marketing-dashboard | hospitality booking dashboard | — | *(status: concept — not published)* |

### Industry / informational clusters → to-create pages
| Cluster | Canonical page (to create) |
|---|---|
| law firm automation / legal software south africa | `/solutions/law-firms` |
| ngo reporting / donor report software | `/solutions/ngos` |
| bank / FSP regulatory automation | `/solutions/banks` |
| hospitality operations software | `/solutions/hospitality` |
| how-to / "what is" informational queries | `/insights/<slug>` (one cluster per post) |

### 9.1 Cannibalisation guard (goal condition 5)
Each live page above has a **distinct primary intent** — no two share one. The
**integration family** is the live collision risk and is flagged for S05 to verify
on SERP overlap before copy is finalised:

| Page | Primary (must stay distinct) |
|---|---|
| integration-hub | iPaaS / forward events between *many* tools |
| cross-system-sync | bi-directional record sync between *two* systems |
| legacy-bridge | connect a *legacy/ERP* system without migrating |
| master-data-hub | *golden-record* MDM (one canonical record) |
| workflow-orchestrator | *event fan-out* with retries/escalation |

Also flag for S05: `compliance-reporting` vs `data-routing` (both touch
"regulatory return" — kept distinct as *rule-pack submission* vs *report-assembly
pipeline*). If SERPs collapse any pair, **merge to one canonical page** + redirect,
or split intents harder in copy. Coverage check (keyword-map §3): every live
`/systems/<slug>` has ≥1 primary + most have ≥1 AEO question target; **0** shared
primaries.

---

## 10. Schema requirements handed to S03 (per template)

| Template | JSON-LD S03 should emit |
|----------|--------------------------|
| Site-wide (`app.vue`/plugin) | `Organization` (name, SA `addressCountry: ZA`, `email`, `sameAs`), `WebSite`. **GEO infra.** |
| Home | the site-wide blocks; optional `Service` summary. |
| Pillar hub | `CollectionPage` + `BreadcrumbList` + `ItemList` (the modules). |
| Module page | `Service` (module as entity) + `BreadcrumbList` + `WebPage` + `FAQPage` (mirror visible `faqs` 1:1) — only when `faqs` present. |
| Industry page | `Service` (audience=industry) + `BreadcrumbList` + `FAQPage`. |
| Blog post | `BlogPosting`/`Article` + `BreadcrumbList` + `FAQPage`. |
| Contact | `ContactPage` + `Organization` (consistent NAP). |

S03: read `definition` and `faqs` straight off `app/data/systems.ts`; do **not**
invent Q&A that isn't visibly on the page.

---

## 11. Cross-session asks (mirror into each target's status.md notes)

1. **S01** — set `site.url='https://zabble.org'`; install `@nuxtjs/seo` (pin a
   Nuxt-4-compatible version); add sitemap (enumerate `/systems/<slug>` from
   `systems.ts`) + robots `Sitemap:` line + **staging `noindex` guard** (B3). Then
   `usePageSeo` can defer canonical to the module (drop the manual `link`).
   *Heads-up:* this session added `titleTemplate`, `lang='en-ZA'` and a fallback
   `title` to the shared `nuxt.config.ts` `app.head` (small, additive) — rebase on
   it.
2. **S05 (keywords)** — verify every cluster in §9 (SA volume/KD/intent) and
   confirm the integration-family + compliance/data-routing pairs don't cannibalise.
   Fill `keywords[]`, then S06 writes copy. Append findings to `keyword-map.md`.
3. **S06 (content)** — populate `seoTitle`, `seoDescription` (distinct per module),
   `definition` (40–60-word answer-first), and `faqs` on `app/data/systems.ts`;
   write the `/solutions/*`, `/insights/*`, `/contact` body copy.
4. **S07 (AEO)** — own FAQ question selection (match real PAA/SERP phrasing) and
   the answer-first definitions; confirm snippet-type per target.
5. **S03 (schema)** — implement §10 against the `definition`/`faqs` slots.
6. **S09 (perf)** — generate per-page OG images or ship `/og-default.png`.

## 12. Evidence index

List of files under `_evidence/05/` (this session):
- `before-meta-grep.txt` — global-only meta state before the change (F1–F4 baseline).
- `rendered-tags.txt` — grep of prerendered `.output/public/**` HTML: unique
  title/description/canonical/OG/Twitter on home, hub, 3 module pages, diagnose;
  `?pillar` canonical fold (goal condition 2).
- `build.txt` — `npm run generate` tail showing a clean prerender of all routes.

---

## 13. Implementation log — full build-out (2026-06-04, pass 2)

Pass 1 (above) wired metadata on the 4 then-live templates and wrote the
blueprints/mapping/formulas. **Pass 2 applied the blueprints to *every* live page,
built the to-create templates, integrated S03's verified keyword targets, and
added automated regression tests.** All on `seo/05-onpage`.

### 13.1 What shipped
- **Verified targets integrated.** S03 (`seo/03-keywords`) completed its research
  (213 ZA keywords; `keyword-map.md` + `intent-clusters.md`). Every page's
  `primaryKeyword` + `seoTitle`/`seoDescription` now come from that map's
  **designated primary per page**, not the seed guesses. Items still `n/d` in ZA
  (most module heads) are intentionally targeted as AEO/GEO + global-English per
  S03 §7 — flagged, not dropped.
- **`usePageSeo` (composable).** Added `primaryKeyword` → renders
  `<meta name="zabble:primary-kw">`, the QA signal the cannibalisation test reads.
  Canonical remains **non-www** `https://zabble.org` (B5: the live apex 308-redirects
  to `www`; S01 must set the apex as Vercel Primary Domain so the canonical and the
  served host agree).
- **`app/data/systems.ts`.** `SYSTEM_SEO` map (all 30 live modules:
  `seoTitle`, `seoDescription` ≤160, `keywords` [primary first], answer-first
  `definition`; `faqs` on the 16 PAA/volume-backed modules) merged onto entries at
  load. `PILLAR_SEO` (4 pillar hubs: h1, blurb, title/desc, keywords, definition).
- **New templates (the to-create blueprints §6.2/6.4/6.6/6.7 → live):**
  - `/pillars` + `/pillars/[pillar]` (4 hubs) — owns the pillar head terms
    (business process automation, audit trail software, fraud detection software,
    decision support system); lists member modules; answer-first definition.
  - `/industries` + `/industries/[slug]` (6 verticals: legal, hospitality,
    logistics, manufacturing, banking, ngo) — `app/data/industries.ts`; assembles
    each vertical's modules; problem→build→change triptych; ZA industry primary.
  - `/insights` + `/insights/[slug]` (5 AEO explainers) — `app/data/insights.ts`;
    question-led H1, answer-first intro (the liftable answer), H2 structure (bodies
    = S10), internal link to the money page each supports.
  - `/contact` — `ContactPage`/local entity; NAP line; diagnostic + email CTAs.
- **Existing pages.** Home, `/systems`, `/systems/[slug]`, `/diagnose` all carry
  `primaryKeyword` + a `data-answer-first` slot. Home's answer-first is the existing
  `TheHero` definition line (marked, not duplicated).
- **Internal links + crawl.** Footer now links Home/Systems/Pillars/Industries/
  Insights/Contact (every page); `nuxt.config` prerenders the new hubs and
  `crawlLinks` discovers the dynamic children.
- **Cannibalisation resolved.** S03 had already split the integration family by
  head term (integration-hub=`integration platform`, cross-system-sync=`data
  synchronization software`, legacy-bridge=`legacy system integration`,
  master-data-hub=`mdm software`, workflow-orchestrator=`workflow orchestration
  software`). Test confirms **52/52 unique primary intents** — zero collisions.

### 13.2 Tests (required deliverable)
`scripts/seo-metadata.test.mjs` (zero-dependency Node) parses every prerendered
`.output/public/**/index.html` and asserts: unique + length-valid title (≤60,
with ` · Zabble`) and description (50–160); canonical present, https, **non-www**,
query-free, route-matching; OG + Twitter present; `og:url` non-www; `<html
lang="en-ZA">`; **answer-first slot on every money page**; and **no two pages share
a primary intent**. Wired as `npm run test:seo` and `npm run verify:seo`
(generate + test). **Result: 52 routes, 0 violations.**

### 13.3 Gotcha recorded for other sessions
`nuxt generate` failed with `[500]` on every route + `Only URLs with a scheme in:
file, data, node … Received protocol 'c:'` when the worktree's `node_modules` was a
**junction into the OneDrive path with a space** (`Our%20Website`): Nuxt's buildDir
resolves under `node_modules/.cache/nuxt/.nuxt` and the prerender worker can't load
the percent-encoded manifest. **Fix: a real `npm install` in the worktree** (deps
local, space-free). No dependencies were added (only `scripts`); `package-lock.json`
left unchanged.

### 13.4 Cross-session asks (this pass) — also mirrored in status.md
- **Schema (S08 / board S03)** — implement per-template JSON-LD (§10) reading
  `definition`/`faqs` off `systems.ts`, `INDUSTRIES`, `INSIGHTS`; add
  `Article`/`BlogPosting` for `/insights/*`, `ContactPage` for `/contact`,
  `CollectionPage`+`ItemList` for the hubs, `Service` for pillar/industry pages.
- **Content (S10 / board S06)** — write the long-form body under each `/insights`
  heading (answer-first intros are done) and the `/industries` long copy; refine
  module FAQs/definitions where a sharper claim helps. All structure + the
  answer-first first-sentences are in place.
- **OG image (S09)** — generate per-page images or ship `/public/og-default.png`
  (referenced by `usePageSeo`); currently the only known broken-ref.
- **Technical (S01)** — set the apex as Vercel Primary Domain so non-www canonical
  matches the served host (B5); install `@nuxtjs/seo` + `site.url` so `usePageSeo`
  can defer canonical/OG-image to the module and the sitemap enumerates all 52 URLs.
