# SEO/AEO/GEO — Status Board

Live state of all 11 sessions. **Edit only your own row** (conventions §2). Keep
it honest: `pending` → `in_progress` → `blocked` → `done`.

- **Project:** Zabble — https://zabble.org (pre-launch)
- **Primary market:** South Africa (`en-ZA`)
- **Last updated:** 2026-06-04 by S00

---

## Sessions

| # | Session | Branch | Owner | Status | Depends on | PR / outcome |
|---|---------|--------|-------|--------|------------|--------------|
| 00 | Setup & access foundation | `seo/00-setup` | SEO lead | **done** | — | docs/seo built; MCP ✓ Connected; account verified + funded ($50.998); live + sandbox `20000`. |
| 01 | Technical SEO & Crawlability | `seo/01-technical` | _unassigned_ | pending | 00 | — |
| 02 | On-Page & Metadata | `seo/02-onpage` | _unassigned_ | pending | 00, 05 (soft) | — |
| 03 | Structured Data / Schema.org | `seo/03-schema` | _unassigned_ | pending | 00, 01 (`site.url`) | — |
| 04 | Site Architecture & Internal Linking | `seo/04-architecture` | _unassigned_ | pending | 00 | — |
| 05 | Keyword & Market Research (SA) | `seo/05-keywords` | _unassigned_ | pending (unblocked) | 00 | — |
| 06 | Content Strategy & Editorial | `seo/06-content` | _unassigned_ | pending | 00, 05 | — |
| 07 | AEO — Answer Engine Optimization | `seo/07-aeo` | _unassigned_ | pending | 00, 03, 05 | — |
| 08 | GEO — Generative Engine Optimization | `seo/08-geo` | _unassigned_ | pending | 00, 03, 05, 07 | — |
| 09 | Performance & Core Web Vitals | `seo/09-performance` | _unassigned_ | pending | 00 | — |
| 10 | Off-Page, Local SEO & Measurement | `seo/04-offpage-local` | S04 | **done** (audit + **on-site implementation**) | 00, 05 | **Audit:** competitor map, content/link gaps, digital-PR + velocity plan. **Built + tested:** 5 ZA metro landings + 8 industry pages + linkbait asset + About/Press (all server-rendered, 52 pages, `nuxt generate` clean, `test:seo` 26/26, 0 broken links); outreach + GBP/citation kits; LocalBusiness fields handed to S08. Branch `seo/04-offpage-local`. Spend ~$0.18 (no new spend this session). _B4/B5/B6 still owner-gated._ |

### Dependency notes
- **Everything depends on S00** (this knowledge base + access). S00 is **done**;
  DataForSEO is verified, funded, and live.
- **S05 is the critical-path upstream** for S02, S06, S07, S08 — now unblocked and
  the highest-leverage session to run first.
- **S01 sets `site.url`** — S03's schema and S02's canonicals depend on it. Do S01
  early.
- **S03 → S07 → S08**: entity/schema foundation feeds AEO, which feeds GEO.

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
| B3 | **Staging URL** not provided. Needed so S01 can set the pre-launch `noindex` guard before any indexing happens. | User → S01 | S01 (P1) | `reference/nuxt-seo-implementation.md` §5 |
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

## How a session starts (quick reference)
1. `git switch -c <your-branch> origin/main`.
2. Read `00-conventions.md` (binding) + your reference docs + your `audits/0X-*.md`.
3. Confirm your dependencies above are `done`/unblocked.
4. Load env (`set -a; source .env; set +a` or the PowerShell snippet in access
   doc §3) and launch Claude Code so the MCP gets credentials.
5. Do the audit; capture evidence; update **your row** here to `done` + PR link.
