# SEO/AEO/GEO — Status Board

Live state of all 11 sessions. **Edit only your own row** (conventions §2). Keep
it honest: `pending` → `in_progress` → `blocked` → `done`.

- **Project:** Zabble — https://zabble.org (pre-launch)
- **Primary market:** South Africa (`en-ZA`)
- **Last updated:** 2026-06-04 by S07-geo (GEO)

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
