# Evidence 09 — test harness, POPIA pages, verification

- **Captured:** 2026-06-04 (worktree `C:\Users\nashe\zabble-seo09-analytics`, isolated).

## Automated tests — `npm test` (node:test, zero new deps)

Cold run (after `rm -rf .output`): the harness regenerates the site itself with
placeholder ids, then asserts. Result:

```
[nitro] ✔ Prerendered 72 routes in ~5s
ℹ tests 21
ℹ pass 21
ℹ fail 0
```

Suites:
- `tests/analytics-source.test.mjs` (11) — Consent Mode v2 four signals default
  **denied**; only `security_storage` granted; default **region-scoped to ZA**;
  `wait_for_update`+`ads_data_redaction`; gtag pushes `arguments`; **opt-in**
  (tags load only on grant, never at boot); empty-id no-op; Clarity first-party +
  consent-gated; every key event wired (`email_click`, `phone_call_click`,
  `file_download`, `schedule_click`, `page_view`, 90% `scroll`); `generate_lead`
  (ZAR) + `schedule_call` in the diagnose flow.
- `tests/indexnow.test.mjs` (4) — ping **refuses** staging / preview / localhost
  (even with `--dry-run`); production dry-run emits a correct, **host-scoped**
  payload (`host`, `key`, `keyLocation`, filtered `urlList`); `--force` overrides.
- `tests/static-html.test.mjs` (6) — with placeholder ids set, prerendered HTML
  has **no** `googletagmanager/clarity/gtag(` and **no** `dataLayer/zabble_consent`,
  yet the id **is** in the client payload (gating ≠ wiring); GSC + Bing
  verification meta render into SSR head from env; IndexNow key served; `/privacy`
  + `/cookie-policy` prerendered with real POPIA content + linked from the footer.

`npm test` is self-contained (regenerates if `.output` is missing/stale).
`npm run test:source` runs the 15 build-free checks alone.

## Verification meta (clean manual generate with env)

```
NUXT_PUBLIC_VERIFICATION_GOOGLE=… NUXT_PUBLIC_VERIFICATION_BING=… \
NUXT_PUBLIC_ANALYTICS_GTM_ID=GTM-TEST123 npm run generate
```
`.output/public/index.html` then contains:
```
<meta name="google-site-verification" content="test-google-verify-123">
<meta name="msvalidate.01" content="TESTBING123">
```
With the env unset (pre-launch), neither tag renders — verified no-op.

## IndexNow ping (dry-run, prod)

`node scripts/indexnow-ping.mjs --dry-run` → 33 URLs discovered from the
generated output, payload host `zabble.org`, keyLocation
`https://zabble.org/34cc0be3679dd090c399c3f817b64ee0.txt`. Staging hosts are
refused (covered by the test suite).
