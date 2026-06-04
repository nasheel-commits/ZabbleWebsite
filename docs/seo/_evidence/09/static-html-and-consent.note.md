# Evidence 09 — POPIA / consent behaviour in the static output

- **Captured:** 2026-06-04 from `.output/public` after `npm run generate`.

## 1. Pre-launch (no ids configured) — nothing fires

| Check | Command | Result |
|-------|---------|--------|
| No GTM/GA/Clarity script in HTML | `grep -c "googletagmanager\|clarity.ms\|gtag" .output/public/index.html` | **0** ✓ |
| No `dataLayer` / consent push in static HTML | `grep -c "dataLayer\|zabble_consent" .output/public/index.html` | **0** ✓ |
| IndexNow key file served | `cat .output/public/34cc0be3679dd090c399c3f817b64ee0.txt` | `34cc0be3679dd090c399c3f817b64ee0` ✓ |

Confirms the POPIA stance: with no id (and, at runtime, before opt-in) **nothing
is injected**. All tag/consent logic is client-only — it never renders into the
prerendered HTML.

## 2. The machinery is present in the client bundle

| Check | Command | Result |
|-------|---------|--------|
| Consent Mode v2 default-denied logic | `grep -rl "ad_personalization" .output/public/_nuxt/` | `_nuxt/D5jSP2dR.js` ✓ |
| Key events compiled in | `grep -rho "email_click\|phone_call_click\|file_download\|schedule_click\|generate_lead" .output/public/_nuxt/` | all 5 present ✓ |

(`schedule_call` + `generate_lead` also present via the diagnose chunk
`_nuxt/CTBUZKvF.js`. The diagnose result-screen `data-analytics-event` is behind
client-only state, so it is correctly absent from the *initial* prerendered DOM.)

## 3. env → runtimeConfig → client wiring proven (test id)

Ran `NUXT_PUBLIC_ANALYTICS_GTM_ID=GTM-TEST123 npm run generate` (test id via env
only — never committed):

| Check | Result |
|-------|--------|
| Test id reaches the client runtime payload | `grep -o "GTM-TEST123" .output/public/index.html` → **found** ✓ |
| GTM script still NOT injected server-side | `grep -c "googletagmanager.com/gtm.js" .output/public/index.html` → **0** ✓ |

So a real id flows from env to the client correctly, and even with an id set the
script only loads client-side after opt-in — exactly the consent-gated, POPIA
behaviour intended.

## What still needs a browser (documented, not blocked)

Tag Assistant / GA DebugView confirmation of the exact `consent default`
(all-denied) → `consent update` (granted) ordering, and that GTM/GA/Clarity fire
only after "Accept", requires a real id + a deployed/preview URL opened in a
browser. Procedure is in `docs/seo/measurement-plan.md` §"Verification".
