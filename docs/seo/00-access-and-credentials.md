# Access & Credentials — DataForSEO + MCP

Everything a session needs to call DataForSEO, plus the live record of account
state. **No secrets are in this file** (per the secrets rule in
`00-conventions.md` §3). Secrets live only in `.env` (git-ignored).

---

## 1. Account & balance record

| Field | Value |
|-------|-------|
| Provider | DataForSEO (https://dataforseo.com) |
| API login (username) | `nasheel@zabble.org` *(an email — not a secret)* |
| API password | in `.env` as `DATAFORSEO_PASSWORD` — **never recorded here** |
| Auth method | HTTP Basic (`username:password`), sent as `Authorization: Basic <base64>` |
| Dashboard | https://app.dataforseo.com |
| API base (live) | `https://api.dataforseo.com` |
| API base (sandbox, free) | `https://sandbox.dataforseo.com` |

### Balance verification (goal condition 2)

A live call to `/v3/appendix/user_data` succeeded and returned a **positive
balance**:

| Captured (date) | Endpoint | `status_code` | `money.balance` | `money.total` | Note |
|-----------------|----------|---------------|-----------------|---------------|------|
| 2026-06-04 (initial) | `GET /v3/appendix/user_data` | `20000` (Ok) | 1 (USD) | 1 | New-account $1 trial credit. Data endpoints still gated by `40104` at this point. |
| **2026-06-04 (verified + funded)** | `GET /v3/appendix/user_data` | `20000` (Ok) | **50.998** (USD) | 51 | After account verification + a ~$50 top-up. Live + sandbox data calls now return `20000`. Goal condition 2 fully satisfied. |

Raw responses captured at `_evidence/00/user_data__zabble__live.json` (initial) and
`_evidence/00/user_data__zabble__live-verified.json` (verified + funded) —
Authorization redacted. API version at capture: `0.1.20260525`. Account timezone:
`Africa/Johannesburg`. First live data call confirmed: SERP regular (SA) →
`20000`, 10 results, cost $0.002 (`_evidence/00/serp-live__bespoke-business-systems__za.note.md`).

> **Re-verify balance** any time with:
> ```bash
> curl -s --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
>   https://api.dataforseo.com/v3/appendix/user_data \
>   | python -c "import json,sys; d=json.load(sys.stdin); print(d['tasks'][0]['result'][0]['money'])"
> ```

---

## 2. ✅ RESOLVED — account verified + funded (2026-06-04)

Earlier on 2026-06-04 every data endpoint (including the free sandbox) returned
`40104 "Please verify your account before using the API."` That blocker is now
**cleared**: the account was verified in the user panel and funded with a ~$50
top-up (balance $50.998). Confirmation:
- Sandbox SERP (SA) → `20000 Ok`.
- Live SERP regular (SA) → `20000 Ok`, 10 results, cost $0.002.
- `user_data` → `money.balance` 50.998.

> If you ever see `40104` again on a new/sub account, the fix is: log in at
> https://app.dataforseo.com and complete the verification prompt. For funding,
> **confirm the current minimum top-up in the dashboard** (do not trust a figure
> from memory — pricing/minimums change) and record it here with its date.

---

## 3. MCP wiring (how Claude Code calls DataForSEO)

We use the **hosted (remote) DataForSEO MCP server** over HTTP transport. This is
the committed, canonical config in `.mcp.json` — **no secret** in it; the
Basic-auth token is injected from `.env` (`DATAFORSEO_BASIC_AUTH`) via `${VAR}`
expansion:

```json
{
  "mcpServers": {
    "dataforseo": {
      "type": "http",
      "url": "https://mcp.dataforseo.com/http",
      "headers": { "Authorization": "Basic ${DATAFORSEO_BASIC_AUTH}" }
    }
  }
}
```

`DATAFORSEO_BASIC_AUTH` is `base64("username:password")` (regenerate with
`printf '%s' "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" | base64`).

**Server status (2026-06-04):** `claude mcp list` →
`dataforseo: https://mcp.dataforseo.com/http (HTTP) - ✓ Connected`.

### One-time setup each session must do

Claude Code does **not** auto-load `.env`. For `${DATAFORSEO_BASIC_AUTH}` to
resolve, the variable must be in the environment that launches Claude Code.

**Option A — export then launch (recommended on this Windows machine).**
PowerShell, from the repo root:
```powershell
Get-Content .env | Where-Object { $_ -match '^\s*[^#].*=' } | ForEach-Object {
  $name, $value = $_ -split '=', 2
  Set-Item "env:$($name.Trim())" $value.Trim()
}
claude
```
Bash equivalent: `set -a; source .env; set +a; claude`

**Option B — local-scope add (token kept out of git via `~/.claude.json`).**
This is the exact hosted-server command from the DataForSEO docs, run at local
scope so the literal token is never committed:
```bash
claude mcp add --scope local --transport http \
  --header "Authorization: Basic $DATAFORSEO_BASIC_AUTH" \
  dataforseo https://mcp.dataforseo.com/http
```
> ⚠ Do **not** run this with `--scope project` — that writes the literal token
> into the committed `.mcp.json` and breaks the secrets rule. Project scope must
> use the `${VAR}` form above. (DataForSEO's published example names the server
> `dfs-mcp`; we use `dataforseo` to match this knowledge base — rename if you
> prefer.)

### Approving the project server

A committed `.mcp.json` server starts as **"Pending approval"**. It has been
pre-approved here via `.claude/settings.local.json`
(`enabledMcpjsonServers: ["dataforseo"]`, git-ignored). If a fresh clone shows
"pending", run `claude` and approve `dataforseo`, or add the same local setting.

### Module scoping — hosted vs local stdio

The goal calls for scoping via `ENABLED_MODULES`. **The hosted HTTP server does
not expose an `ENABLED_MODULES` control** (it serves the full tool surface).
`ENABLED_MODULES` is a feature of the **local `npx` stdio server**. We keep the
hosted server as primary (simpler, what was requested) and retain the scoped
stdio config as a documented alternative — switch to it when you need to restrict
the tool surface. `.env` already carries the intended scope:
`SERP, KEYWORDS_DATA, DATAFORSEO_LABS, ONPAGE, BACKLINKS, DOMAIN_ANALYTICS,
AI_OPTIMIZATION, CONTENT_ANALYSIS` (rationale + catalogue in
[`reference/dataforseo.md`](reference/dataforseo.md)).

**Scoped stdio alternative** (replace the `.mcp.json` block, or add at local
scope):
```json
{
  "mcpServers": {
    "dataforseo": {
      "command": "npx",
      "args": ["-y", "dataforseo-mcp-server@latest"],
      "env": {
        "DATAFORSEO_USERNAME": "${DATAFORSEO_USERNAME}",
        "DATAFORSEO_PASSWORD": "${DATAFORSEO_PASSWORD}",
        "ENABLED_MODULES": "${ENABLED_MODULES:-SERP,KEYWORDS_DATA,DATAFORSEO_LABS,ONPAGE,BACKLINKS,DOMAIN_ANALYTICS,AI_OPTIMIZATION,CONTENT_ANALYSIS}",
        "DATAFORSEO_FULL_RESPONSE": "${DATAFORSEO_FULL_RESPONSE:-false}"
      }
    }
  }
}
```
This stdio variant was also verified `✓ Connected` on 2026-06-04 before we
switched the committed config to the hosted server.

---

## 4. Smoke tests

**Auth + balance (works today):**
```bash
curl -s --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://api.dataforseo.com/v3/appendix/user_data | head -c 300
# expect: "status_code": 20000 ... "money": {"balance": <positive>}
```

**Free sandbox SERP (blocked by 40104 until verification):**
```bash
curl -s -X POST --user "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" \
  https://sandbox.dataforseo.com/v3/serp/google/organic/live/regular \
  -H "Content-Type: application/json" \
  -d '[{"language_code":"en","location_name":"South Africa","keyword":"bespoke business systems"}]'
# today: 40104 (verify account). after verification: 20000 with dummy SERP data.
```

**Through the MCP (after verification + restart):** ask Claude Code to call the
`dataforseo` SERP or Labs tool; a `20000` response confirms goal condition 1
end-to-end.

---

## 5. Cost discipline

- Use the **sandbox** (`sandbox.dataforseo.com`) for any wiring/CI check that
  doesn't need real data — it's free and returns dummy payloads.
- Use **live** only when you need real SA data, and prefer `live` Labs endpoints
  (one call, immediate) over `task_post`/`task_get` where cost is comparable.
- Every live call's `cost` field goes into the evidence sidecar (conventions §6)
  so we can see spend accrue.
- The $1 trial credit is for smoke-testing only. **Fund the account properly
  before S05 (keyword research) runs at volume** — see status.md missing-access.
