# 0001 — DataForSEO MCP transport + secrets handling

- **Status:** accepted
- **Date:** 2026-06-04
- **Author:** S00 (setup)
- **Affects:** all sessions that call DataForSEO (00, 01, 05, 07, 08, 10)

## Context
We need Claude Code to call DataForSEO via MCP. There are two server options:
1. **Local stdio** — `npx dataforseo-mcp-server`, credentials via env
   (`DATAFORSEO_USERNAME`/`PASSWORD`), and tool-surface scoping via
   `ENABLED_MODULES`.
2. **Hosted HTTP** — `https://mcp.dataforseo.com/http`, Basic-auth via an
   `Authorization` header.

Two constraints pull on the choice:
- The session goal asks to **scope via `ENABLED_MODULES`** — only the stdio server
  supports that.
- The project owner explicitly asked to use the **hosted HTTP transport**.
- The binding **secrets rule** (`00-conventions.md` §3): no secret in git. The
  hosted server's Basic-auth token *is* a secret; DataForSEO's published
  `claude mcp add --header "Authorization: Basic <token>"` would, at project
  scope, write that literal token into the committed `.mcp.json`.

## Decision
- Use the **hosted HTTP server** as the active, committed configuration
  (`.mcp.json`, server name `dataforseo`).
- Inject the token via **`${DATAFORSEO_BASIC_AUTH}` expansion** from `.env`, so
  `.mcp.json` contains **no secret**. `.env` (git-ignored) holds the token.
- Retain the **stdio + `ENABLED_MODULES` config as a documented alternative** in
  `00-access-and-credentials.md` §3, for when restricting the tool surface
  matters. Both were verified `✓ Connected` on 2026-06-04.
- Never run the hosted `claude mcp add --header …<literal token>…` at
  `--scope project`. Local scope (`~/.claude.json`, outside the repo) is the only
  acceptable place for a literal token.

## Consequences
- Easy: one shareable, secret-free `.mcp.json` for all 10 sessions; full DataForSEO
  tool surface available over HTTP.
- Harder: the hosted server has **no `ENABLED_MODULES` control**, so the tool
  surface isn't restricted in the active config. If a session needs scoping (e.g.
  to reduce tool noise), switch to the documented stdio variant.
- Every session must load `DATAFORSEO_BASIC_AUTH` into its environment before
  launching Claude Code (see access doc §3, Option A).

## Alternatives considered
- **Stdio as primary (scoped):** satisfies `ENABLED_MODULES` cleanly, but the
  owner asked for HTTP and stdio needs a local node/npx run per session. Kept as
  the documented fallback rather than primary.
- **Hosted with literal token in `.mcp.json`:** simplest to set up, but violates
  the secrets rule. Rejected.
