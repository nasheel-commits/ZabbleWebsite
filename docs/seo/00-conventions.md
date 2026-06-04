# Conventions — binding rules for all SEO sessions

These rules are **binding** for every one of the 11 sessions. They exist so that
10 sessions can run in parallel without colliding, and so that every claim we
make is reproducible. If a rule blocks you, raise it as a decision (`decisions/`)
— don't quietly break it.

---

## 1. Branch-per-session

Each session works on its **own branch**. No session commits to `main`. No
session pushes to another session's branch.

| Session | Branch |
|---------|--------|
| 00 Setup | `seo/00-setup` |
| 01 Technical SEO & Crawlability | `seo/01-technical` |
| 02 On-Page & Metadata | `seo/02-onpage` |
| 03 Structured Data / Schema.org | `seo/03-schema` |
| 04 Site Architecture & Internal Linking | `seo/04-architecture` |
| 05 Keyword & Market Research | `seo/05-keywords` |
| 06 Content Strategy & Editorial | `seo/06-content` |
| 07 AEO | `seo/07-aeo` |
| 08 GEO | `seo/08-geo` |
| 09 Performance & Core Web Vitals | `seo/09-performance` |
| 10 Off-Page, Local SEO & Measurement | `seo/10-offpage-local` |

- Branch from the latest `main`: `git switch -c seo/05-keywords origin/main`.
- Keep branches rebased on `main` if a dependency merges before you finish.
- Open one PR per session into `main`. Title: `seo(0X): <discipline> audit + foundations`.
- Each PR must satisfy the **Definition of Done** (§4) before merge.

---

## 2. Write-ownership (who may edit what)

To avoid merge conflicts across 10 parallel branches, **every file has exactly
one owning session.** You may freely edit files your session owns. You may
**read** any file. To change a file you don't own, leave a note in your audit's
"Cross-session asks" section and let the owner make the edit — or raise an ADR.

| File / area | Owner |
|-------------|-------|
| `README.md`, `00-conventions.md`, `00-access-and-credentials.md`, `reference/*` | **S00 (Setup)** — others propose changes via ADR |
| `status.md` — **your own row only** | each session edits only its row |
| `audits/0X-*.md` | the session whose number is `0X` |
| `targets/keyword-map.md` | **S05** owns; S02/06/07/08 read and may append to the "Requests for keywords" section |
| `content/*` | the session that drafts the content (mostly S06; AEO FAQ blocks by S07) |
| `decisions/NNNN-*.md` | the author; reviewed by S00 owner |
| `_evidence/<session>/*` | each session owns its own evidence subfolder |
| App code (`app/`, `nuxt.config.ts`, `public/`) | the implementing session — **coordinate via status.md**, see below |

**App-code coordination.** Several sessions will touch `nuxt.config.ts`,
`app/app.vue`, and page files. To prevent collisions:
- S01 owns `nuxt.config.ts` SEO-module wiring, `public/robots.txt`, sitemap config.
- S02 owns per-page `useSeoMeta`/`useHead` blocks in `app/pages/**`.
- S03 owns JSON-LD/schema composables and their injection points.
- S09 owns performance-related config (fonts, images, prerender tuning).
- If two sessions need the same file, the later one rebases and the change is
  small and additive. Announce the intent in your `status.md` row's notes.

---

## 3. The secrets rule

**No secret ever enters git. Ever.**

- DataForSEO credentials live **only** in `.env` (git-ignored via `.env` /
  `.env.*` rules in `.gitignore`). Never paste them into a doc, an audit, a
  commit message, an evidence file, or a PR.
- `.mcp.json` (committed) references credentials by `${VAR}` expansion **only** —
  it contains no literal secrets. Verify before every commit: `git diff --cached`
  must show no `DATAFORSEO_PASSWORD` value, no Basic-auth token, no API key.
- `.env.example` documents the required variable **names** with placeholder
  values, nothing real.
- When you capture an API response into `_evidence/`, **redact** the request's
  `Authorization` header and any credential echoed in the payload. The
  `user_data` response echoes your `login` — that's fine (it's an email, not a
  secret) but never the password or Basic token.
- Local Claude Code settings that might carry secrets live in
  `.claude/settings.local.json` (git-ignored). Project MCP config in `.mcp.json`
  is safe to commit precisely because it holds no values.

Pre-commit self-check (run it):
```bash
git diff --cached -G'(DATAFORSEO_PASSWORD|Authorization:|Basic [A-Za-z0-9+/=]{20,})' --stat
# Any output here = STOP. A secret is staged.
```

---

## 4. Definition of Done (DoD)

A session is **done** when ALL of the following hold. A PR that misses any of
these is not ready to merge.

1. **Audit written** in `audits/0X-*.md` using the template in §5, with every
   section filled (use "N/A — <reason>" where a section doesn't apply).
2. **Every quantitative claim is backed by evidence** in `_evidence/` per §6.
   "Volume is 1,300/mo" with no evidence file is not a finding — it's a guess.
3. **Recommendations are concrete and prioritised** (P0/P1/P2) with the exact
   file + change for anything that touches code, and an owner if it's a
   cross-session ask.
4. **Anything implemented in code builds clean**: `npm run build` succeeds, and
   `npm run generate` prerenders without new warnings attributable to the change.
5. **`status.md` row updated** to `done` with the PR link and a one-line outcome.
6. **No secret staged** (§3 self-check passes).
7. **Cross-session asks logged** in both your audit and the target session's
   `status.md` notes, so nothing depends on a verbal handoff.

---

## 5. Audit-doc template

Every `audits/0X-*.md` follows this exact skeleton. Copy it verbatim and fill in.

```markdown
# Audit 0X — <Discipline>

- **Session:** 0X
- **Branch:** seo/0X-<slug>
- **Owner:** <name/agent>
- **Status:** in_progress | done
- **Date:** YYYY-MM-DD
- **Depends on:** <session numbers + what you needed from them>
- **Layer(s):** SEO | AEO | GEO | Foundation

## 1. Scope
What this audit covers, and explicitly what it does NOT (hand-offs to other sessions).

## 2. Method
How you gathered evidence: which DataForSEO endpoints (with `location_name`,
`language_code`), which manual checks, which pages. Enough that someone could
reproduce it.

## 3. Current state (findings)
What is true today. Each finding tagged with an evidence ref, e.g. `[E: 05/serp-bespoke-crm-za.json]`.
Use a table where it helps. State the baseline metric so we can measure change.

## 4. Gaps & opportunities
The delta between current state and where we should be. Prioritised P0/P1/P2.

## 5. Recommendations
Concrete, actionable, ordered. For code changes: exact file + the change.
For content: link the brief in `content/`. For cross-session work: name the session.

| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|

## 6. Cross-session asks
Things another session must do for this to land. Mirror each into that session's
status.md notes.

## 7. Evidence index
List every file under `_evidence/0X/` and one line on what it proves.
```

---

## 6. Evidence format

Every number, ranking, volume, or "the API says X" claim must be reproducible
from a file under `_evidence/<session>/`. The rule: **if it isn't in `_evidence/`,
it isn't a finding.**

**Folder:** `_evidence/0X/` (your session number). Subfolder by topic if large.

**Naming:** `<endpoint-or-source>__<subject>__<market>.<ext>`, lower-kebab.
Examples:
- `_evidence/05/labs-keyword-ideas__bespoke-crm__za.json`
- `_evidence/01/onpage-summary__zabble-org__crawl1.json`
- `_evidence/09/psi__home__mobile.json`
- `_evidence/07/serp-paa__document-intelligence__za.png` (screenshot of a SERP feature)

**For a DataForSEO response, the evidence file is the raw JSON**, plus a sidecar
`.md` note when interpretation is needed:
```
_evidence/05/labs-keyword-ideas__bespoke-crm__za.json     ← raw response
_evidence/05/labs-keyword-ideas__bespoke-crm__za.note.md  ← what we read from it
```
The sidecar records: the endpoint, the full request body (with the
`Authorization` header **redacted**), the date captured, whether it was live or
sandbox, and the cost (`cost` field from the response). Template:

```markdown
- **Endpoint:** POST /v3/dataforseo_labs/google/keyword_ideas/live
- **Request body:** `[{ "keywords": ["bespoke crm"], "location_name": "South Africa", "language_code": "en", "limit": 100 }]`
- **Auth:** Basic (redacted)
- **Captured:** 2026-06-DD
- **Mode:** live | sandbox
- **Cost (response.cost):** 0.0114
- **Read:** top opportunity is "custom crm south africa" at ~210/mo, KD 14.
```

Screenshots (SERP features, GSC, AI Overview citations) are evidence too — name
them the same way and reference them from the audit.

---

## 7. Markets & locales (binding defaults)

Unless a finding is explicitly about another market, **all DataForSEO queries use
South Africa**:
- `location_name`: `"South Africa"` (or `location_code` `2710`).
- `language_code`: `"en"` (English is the working market language; `en-ZA` for
  `hreflang`/HTML `lang` where the platform supports it).
- Currency for any volume/CPC reasoning: USD as returned by the API; note the
  ZAR context when it matters to the business.

If you query another market for comparison (e.g. global benchmark), label the
evidence file with that market and say why in the audit.

---

## 8. Definitions we keep consistent

So 10 sessions use the same words:
- **SEO** — being found in classic ranked results.
- **AEO** — being lifted into the answer (featured snippet, People-Also-Ask,
  FAQ rich result, voice answer).
- **GEO** — being cited/used by generative engines (AI Overviews, ChatGPT,
  Gemini, Perplexity, Copilot).
- **Foundation** — crawlability, render-completeness, speed, semantic HTML,
  structured data, and measurement that all three layers stand on.
- **System / module** — a Zabble product building block (e.g. "Bespoke CRM",
  "Document Intelligence"). 30 of them; see `app/data/systems.ts`. These are our
  primary money pages and the unit of keyword targeting.
