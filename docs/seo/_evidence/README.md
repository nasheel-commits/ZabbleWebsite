# _evidence/ — raw proof behind every claim

The rule (conventions §6): **if it isn't in `_evidence/`, it isn't a finding.**
Every number, ranking, volume, SERP feature, or "the API says X" must be
reproducible from a file here.

## Layout
- One subfolder per session: `_evidence/0X/`.
- Naming: `<endpoint-or-source>__<subject>__<market>.<ext>` (lower-kebab).
  Examples:
  - `05/labs-keyword-ideas__bespoke-crm__za.json`
  - `01/onpage-summary__zabble-org__crawl1.json`
  - `07/serp-paa__document-intelligence__za.png`
- DataForSEO responses: save the **raw JSON**, plus a `.note.md` sidecar
  (endpoint, request body, **Authorization redacted**, date, live|sandbox, the
  `cost` field, and what you read from it). Template is in conventions §6.
- Screenshots (SERP features, GSC, AI-Overview citations, AI answers) are valid
  evidence — name them the same way.

## Secrets
Redact the `Authorization` header and any credential from saved payloads. An
echoed `login` (email) is fine; a password or Basic token is never allowed.

## Current contents
- `00/user_data__zabble__live.json` (+ `.note.md`) — auth OK, balance $1, the
  40104 verification caveat. Backs goal condition 2.
