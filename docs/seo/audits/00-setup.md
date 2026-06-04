# Audit 00 — Setup & Access Foundation

- **Session:** 00
- **Branch:** seo/00-setup
- **Owner:** SEO lead (this session)
- **Status:** done (with one external blocker — see §6)
- **Date:** 2026-06-04
- **Depends on:** none (this is the foundation the other 10 sessions depend on)
- **Layer(s):** Foundation

## 1. Scope
Stand up everything the 10 parallel sessions need: a working + verified DataForSEO
API/MCP connection, and the complete `docs/seo/` knowledge base (conventions,
reference docs, targets/audits skeletons, status board). **Not** in scope: any
discipline audit or application/page code changes beyond `.env.example` + `.mcp.json`.

## 2. Method
- Inspected repo state (`nuxt.config.ts`, `package.json`, `public/robots.txt`,
  `app/data/systems.ts`, `.gitignore`).
- Wrote `.env` (git-ignored) with the DataForSEO credentials; `.env.example` with
  names only.
- Live-tested auth + balance: `GET /v3/appendix/user_data`.
- Attempted free sandbox SERP + Labs calls to confirm data access.
- Wired the official DataForSEO MCP server via committed `.mcp.json` (no secrets,
  `${VAR}` expansion); pre-approved via `.claude/settings.local.json`; confirmed
  with `claude mcp list`.
- Authored the full `docs/seo/` tree.

## 3. Current state (findings)
- **Auth: valid.** `user_data` → `status_code` 20000. `[E: 00/user_data__zabble__live.json]`
- **Balance: $1 (positive).** `money.balance = 1`, `money.total = 1`. Likely the
  new-account trial credit. Satisfies goal condition 2. `[E: 00/user_data__zabble__live.note.md]`
- **Data endpoints blocked.** Sandbox **and** live SERP/Labs return `40104`
  "Please verify your account before using the API." Auth is fine; the account
  itself is unverified.
- **MCP: connected.** Active config is the **hosted HTTP server**
  (`https://mcp.dataforseo.com/http`), Basic-auth token injected from `.env`
  (`${DATAFORSEO_BASIC_AUTH}`) — no secret in committed `.mcp.json`.
  `claude mcp list` → `dataforseo: …/http (HTTP) - ✓ Connected`. The scoped
  `npx` stdio variant (`ENABLED_MODULES` = 8 modules) was also verified Connected
  and is retained as the documented scoped alternative (the hosted server has no
  `ENABLED_MODULES` control).
- **Repo SEO baseline:** statically prerendered (good); only global `app.head`
  meta; no per-page meta, no canonicals, no OG, no sitemap, bare `robots.txt`, no
  structured data. (Detailed in `reference/nuxt-seo-implementation.md` for S01–S03.)
- **Secrets:** `.env`/`.env.*` git-ignored; `.mcp.json` carries no literal
  secrets; `.claude/settings.local.json` git-ignored. Verified nothing secret is
  staged.

## 4. Gaps & opportunities
- **P0 — DataForSEO account verification** (blocks all data calls; user action).
- **P0 — proper funding** before S05 runs at volume ($1 trial won't sustain it).
- **P1 — GSC/Bing/analytics access** not yet set up (needed by S01/S10 at launch).
- **P1 — staging URL** not provided; pre-launch noindex guard (S01) needs it.

## 5. Recommendations
| # | Priority | Recommendation | File / owner | Evidence |
|---|----------|----------------|--------------|----------|
| 1 | P0 | Verify the DataForSEO account at app.dataforseo.com, then re-run the sandbox smoke test | User → then S00/S05 | `00-access-and-credentials.md` §4 |
| 2 | P0 | Fund the account; confirm current minimum top-up in-dashboard and record with date | User | — |
| 3 | P1 | Provide staging URL so S01 can set the pre-launch noindex guard | User → S01 | — |
| 4 | P1 | Plan GSC (DNS), Bing, POPIA-compliant analytics access for launch | S10/S01 | `reference/measurement-indexing.md` §7 |
| 5 | P2 | Each session reads `00-conventions.md` before starting | all | — |

## 6. Cross-session asks / blockers
- **BLOCKER (external):** account verification — every session that calls
  DataForSEO (S01, S05, S07, S08, S10) is blocked until cleared. Mirrored in
  `status.md` for those sessions.

## 7. Evidence index
- `_evidence/00/user_data__zabble__live.json` — redacted `user_data` response; proves auth OK + balance $1.
- `_evidence/00/user_data__zabble__live.note.md` — capture metadata + reading + the 40104 caveat.
