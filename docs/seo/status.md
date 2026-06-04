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
| 02 | On-Page & Metadata | `seo/05-onpage` | on-page agent | **done** | 00, 03-keywords | Branch `seo/05-onpage`. **Full build-out:** unique title/desc/canonical(non-www)/OG/Twitter via `usePageSeo` on **all 52 prerendered pages** (home, /systems, 30 modules, 4 pillar hubs `/pillars/*`, 6 industry pages `/industries/*`, 5 insight explainers `/insights/*`, /diagnose, /contact); `titleTemplate`; `lang=en-ZA`; answer-first slot + `definition`/`faqs` from S03's verified ZA keyword map; one canonical page per primary intent (52/52 unique). Regression test `npm run test:seo` (0 violations) + `nuxt generate` clean. Audit `audits/05-onpage.md` §13. |
| 03 | Structured Data / Schema.org | `seo/03-schema` | _unassigned_ | pending | 00, 01 (`site.url`) | — |
| 04 | Site Architecture & Internal Linking | `seo/04-architecture` | _unassigned_ | pending | 00 | — |
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
