# ID & Secret Registry — Zabble measurement / indexing

Where every id, key, and credential lives. **Binding rule (conventions §3): no
secret in git, ever.** Real values live only in `.env` (git-ignored). This file
records *names and locations*, never values — except the IndexNow key, which is
**public by design** (it is served openly at a URL).

Last updated: 2026-06-04 (S09).

---

## 1. Analytics ids (env → `runtimeConfig.public.analytics`)

These are **not secrets** in the cryptographic sense (a GA4/GTM/Clarity id is
visible in client HTML once a tag loads), but we keep them in env so staging and
production differ and ids never hard-code into source.

| Thing | Env var | Maps to | Format | Where the real value comes from |
|-------|---------|---------|--------|---------------------------------|
| GTM container | `NUXT_PUBLIC_ANALYTICS_GTM_ID` | `analytics.gtmId` | `GTM-XXXXXXX` | tagmanager.google.com → container |
| GA4 measurement id | `NUXT_PUBLIC_ANALYTICS_GA4_ID` | `analytics.ga4Id` | `G-XXXXXXXXXX` | GA4 → Admin → Data streams (only needed if no GTM) |
| Clarity project id | `NUXT_PUBLIC_ANALYTICS_CLARITY_ID` | `analytics.clarityId` | short alnum | clarity.microsoft.com → project |
| Debug tracing | `NUXT_PUBLIC_ANALYTICS_DEBUG` | `analytics.debug` | `true`/`false` | dev convenience |
| GSC verification (meta) | `NUXT_PUBLIC_VERIFICATION_GOOGLE` | `verification.google` | token | GSC → HTML-tag method (fallback to DNS TXT) |
| Bing verification (meta) | `NUXT_PUBLIC_VERIFICATION_BING` | `verification.bing` | token | Bing Webmaster → "Add a meta tag" |
| Prod origin | `NUXT_PUBLIC_SITE_URL` | (script) | URL | fixed: `https://zabble.org` |

- **Declared (no value)** in `nuxt.config.ts → runtimeConfig.public.{analytics,verification}`
  and documented in `.env.example`. Empty id ⇒ that tag/meta never renders.
- **Status:** all **empty pre-launch** — user to create the properties and place
  ids in `.env`.

## 2. IndexNow key (PUBLIC)

| Thing | Value | Location |
|-------|-------|----------|
| IndexNow key | `34cc0be3679dd090c399c3f817b64ee0` | committed at `public/34cc0be3679dd090c399c3f817b64ee0.txt`; served at `https://zabble.org/34cc0be3679dd090c399c3f817b64ee0.txt` |
| Override (rotate) | `NUXT_INDEXNOW_KEY` | env, optional |

The key is **meant to be public** (IndexNow verifies ownership by fetching it at
that URL). Committing it is correct and not a secrets-rule violation.

## 3. Verification tokens / access (held by the user, not in repo)

| Thing | Lives where | Notes |
|-------|-------------|-------|
| GSC `google-site-verification` TXT | DNS zone for `zabble.org` (apex `TXT`) | Domain property; **needs DNS access**. Not in repo. |
| Bing Webmaster verification | Imported from GSC | No repo artifact when importing. |
| GA4 / GTM / Clarity account access | Google / Microsoft accounts | Org accounts; not in repo. |

## 4. Pre-existing (S00) — for completeness

| Thing | Env var | Location |
|-------|---------|----------|
| DataForSEO API login | `DATAFORSEO_USERNAME` | `.env` (git-ignored) |
| DataForSEO API password | `DATAFORSEO_PASSWORD` | `.env` only — **never** in git |
| DataForSEO MCP basic-auth | `DATAFORSEO_BASIC_AUTH` | `.env`; referenced by `.mcp.json` as `${…}` |

See `00-access-and-credentials.md` for the full S00 set.

## 5. Pre-commit secret self-check (conventions §3)

```bash
git diff --cached -G'(DATAFORSEO_PASSWORD|Authorization:|Basic [A-Za-z0-9+/=]{20,}|G-[A-Z0-9]{8,}|GTM-[A-Z0-9]{5,})' --stat
# Any output here = STOP. Only the public IndexNow key file is allowed to carry a token.
```
