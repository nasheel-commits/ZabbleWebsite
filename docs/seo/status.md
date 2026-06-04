# SEO/AEO/GEO — Status Board

Live state of all 11 sessions. **Edit only your own row** (conventions §2). Keep
it honest: `pending` → `in_progress` → `blocked` → `done`.

- **Project:** Zabble — https://zabble.org (pre-launch)
- **Primary market:** South Africa (`en-ZA`)
- **Last updated:** 2026-06-04 by S04

---

## Sessions

| # | Session | Branch | Owner | Status | Depends on | PR / outcome |
|---|---------|--------|-------|--------|------------|--------------|
| 00 | Setup & access foundation | `seo/00-setup` | SEO lead | **done** | — | docs/seo built; MCP ✓ Connected; account verified + funded ($50.998); live + sandbox `20000`. |
| 01 | Technical SEO & Crawlability | `seo/01-technical` | _unassigned_ | pending | 00 | — |
| 02 | On-Page & Metadata | `seo/02-onpage` | _unassigned_ | pending | 00, 05 (soft) | — |
| 03 | Structured Data / Schema.org | `seo/03-schema` | _unassigned_ | pending | 00, 01 (`site.url`) | — |
| 04 | Site Architecture & Internal Linking | `seo/04-architecture` | S04 | **done** | 00 | **IMPLEMENTED + tested.** 4 pillar hubs live at `/what-we-build/<pillar>`; hub↔member linking; footer + home wired to hubs + `/systems`; `SeoBreadcrumb` + `RelatedSystems` on all templates; faceted `?pillar=` removed from crawl graph; concept pages delinked. `nuxt generate` exit 0 (76 routes); **16/16** arch tests pass (`npm run test:arch`). Audit §8 = impl log. **OR-6/OR-7 now done by S04**; OR-3/OR-4/OR-8 remain (S01/S03). |
| 05 | Keyword & Market Research (SA) | `seo/05-keywords` | _unassigned_ | pending (unblocked) | 00 | — |
| 06 | Content Strategy & Editorial | `seo/06-content` | _unassigned_ | pending | 00, 05 | — |
| 07 | AEO — Answer Engine Optimization | `seo/07-aeo` | _unassigned_ | pending | 00, 03, 05 | — |
| 08 | GEO — Generative Engine Optimization | `seo/08-geo` | _unassigned_ | pending | 00, 03, 05, 07 | — |
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
| B4 | **GSC + Bing + analytics access** (DNS for `zabble.org` domain verification; POPIA-compliant analytics choice). | User → S10/S01 | S10 measurement, launch indexing | `reference/measurement-indexing.md` §7 |

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

---

## How a session starts (quick reference)
1. `git switch -c <your-branch> origin/main`.
2. Read `00-conventions.md` (binding) + your reference docs + your `audits/0X-*.md`.
3. Confirm your dependencies above are `done`/unblocked.
4. Load env (`set -a; source .env; set +a` or the PowerShell snippet in access
   doc §3) and launch Claude Code so the MCP gets credentials.
5. Do the audit; capture evidence; update **your row** here to `done` + PR link.
