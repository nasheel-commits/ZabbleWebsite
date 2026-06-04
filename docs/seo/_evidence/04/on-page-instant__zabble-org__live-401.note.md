# Evidence note — DataForSEO On-Page attempt (live), HTTP 401

- **Endpoint:** DataForSEO On-Page — `on_page_instant_pages` (MCP `mcp__dataforseo__on_page_instant_pages`)
- **Request:** `{ "url": "https://zabble.org/", "enable_javascript": true }`
- **Auth:** Basic (redacted) — **not loaded in this session**
- **Captured:** 2026-06-04
- **Mode:** live (attempted)
- **Result:** `Error: HTTP error! status: 401`

## Interpretation

The MCP call failed authentication because this Claude Code session was not
launched with the DataForSEO env loaded — the exact caveat recorded in
`status.md` ("an already-running session won't have picked up a mid-session
server add … each new session must launch with env loaded", access doc §3).
This is **not** an account/funding problem — S00 verified the account is funded
(`balance 50.998`).

Independently, the site is **pre-launch** (blocker **B3**: no staging URL), so a
live On-Page crawl of the deployed build would not yet reflect the new IA even
with auth.

**Action:** the current-state link graph was therefore produced by static source
analysis (`link-graph__zabble__static.*`). Re-run this On-Page crawl from a fresh
env-loaded session **after** the staging build is up (B3 resolved) to validate
the static graph against rendered HTML, and to baseline crawl depth / orphan
findings with the live link report.
