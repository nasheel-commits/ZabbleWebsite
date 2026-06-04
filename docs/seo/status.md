# SEO/AEO/GEO — Status Board

Live state of all 11 sessions. **Edit only your own row** (conventions §2). Keep
it honest: `pending` → `in_progress` → `blocked` → `done`.

- **Project:** Zabble — https://zabble.org (pre-launch)
- **Primary market:** South Africa (`en-ZA`)
- **Last updated:** 2026-06-04 by S07 (AEO)

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
| 07 | AEO — Answer Engine Optimization | `seo/07-aeo` | AEO agent | **done** | 00 ✓, 03 (ask), 05 (soft) | `seo/07-aeo` — AEO standard + components + **all 32 systems + 4 pillar hubs (`/pillars/*`) + home + `/systems` populated** (answer-first 40–60w + PAA FAQs), byte-verified server-side. **188 vitest regression tests pass; `nuxt generate` clean (76 routes).** Live SA SERP/PAA evidence ($0.081). Audit `audits/07-aeo.md`. **JSON-LD hand-off to S03/S08 logged below (P0).** |
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

## How a session starts (quick reference)
1. `git switch -c <your-branch> origin/main`.
2. Read `00-conventions.md` (binding) + your reference docs + your `audits/0X-*.md`.
3. Confirm your dependencies above are `done`/unblocked.
4. Load env (`set -a; source .env; set +a` or the PowerShell snippet in access
   doc §3) and launch Claude Code so the MCP gets credentials.
5. Do the audit; capture evidence; update **your row** here to `done` + PR link.
