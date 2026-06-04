# 0002 — Analytics stack, Consent Mode v2 & CMP

- **Status:** accepted
- **Date:** 2026-06-04
- **Author:** S09 (analytics + indexing)
- **Affects:** app code (`nuxt.config.ts`, `app/plugins/*`, `app/components/ConsentBanner.vue`, `app/composables/useAnalytics.ts`), S01 (robots/sitemap/staging), S10 (KPIs)

## Context

Zabble (pre-launch, South Africa, **POPIA**) needs GA4 + GTM + Microsoft Clarity
with **Consent Mode v2** (four signals, default-denied → update), a CMP, and the
B2B lead-gen key events — on a **statically prerendered Nuxt 4.4** site. Three
forces shaped the choice:

1. **POPIA = opt-in.** No non-essential tag may fire before consent. Consent Mode
   ordering is strict: the denied default must be pushed *before* any tag loads.
2. **Clean build is binding** (conventions §4: `npm run build`/`generate` must
   pass with no new warnings). Adding a module that doesn't cleanly support Nuxt
   4.4 would break that.
3. The reference doc nudges toward `@nuxt/scripts` **or** `nuxt-gtag`.

The maintained options:
- **`@nuxt/scripts`** (`useScriptGoogleTagManager`, `useScriptClarity`, consent
  triggers) — ergonomic, but adds a dependency + abstraction over the exact
  consent ordering, and its Nuxt 4.4 behaviour can't be browser-verified in this
  environment.
- **`nuxt-gtag`** — GA4 (gtag) only; no GTM container, no Clarity.
- **Hand-rolled** — the canonical Google `gtag`/GTM/Clarity snippets in a Nuxt
  client plugin, with full control of consent ordering and zero new dependency.

## Decision

**Hand-roll** a small, typed, env-driven, consent-first measurement layer:

- A client plugin boots `dataLayer`/`gtag`, pushes **Consent Mode v2 defaults =
  denied** (region `['ZA']` + global, `wait_for_update`, `ads_data_redaction`,
  `url_passthrough`) **before** any tag, and loads **GTM (carrying GA4)** +
  **first-party Clarity** only **after** an explicit opt-in (or stored grant).
  Reject → nothing loads.
- Ids come only from env → `runtimeConfig.public.analytics`. **Empty id ⇒ no-op**
  (correct pre-launch state) — so the layer adds zero risk before ids exist.
- A first-party **CMP** (`ConsentBanner.vue`): Accept/Reject equal weight,
  per-category Manage, persisted choice, re-openable from the footer.
- Key events auto-captured by **event delegation** (so none of the 30 components
  are touched), plus an explicit `generate_lead` at the diagnose submit.

### Why hand-rolled over `@nuxt/scripts`
- **Strict, auditable POPIA ordering** — we control that denied-default precedes
  every load, and that *nothing* loads on reject (no cookieless pings either).
- **Zero dependency / guaranteed Nuxt 4.4 compatibility** — protects the binding
  clean-build requirement; verified `build` + `generate` exit 0.
- **The snippets are Google's reference implementation**, not bespoke invention.

`@nuxt/scripts` remains a clean future migration path (the consent contract in
`useAnalytics`/the plugin is the seam). If adopted, keep the same default-denied
ordering and opt-in gating.

### CMP choice
Ship the **first-party banner** now (no dependency, full styling control, works
pre-launch). Recommend a **managed CMP (CookieYes or Usercentrics)** when the
business wants a maintained consent log / IAB TCF / multi-jurisdiction coverage —
both emit the same Consent Mode signals, so the wiring is unchanged. Scope CMP
regions to include **ZA**.

## Consequences
- ✅ POPIA opt-in provably holds; pre-launch is a safe no-op; build/generate clean.
- ✅ Adding GTM/GA4/Clarity later = set env ids + build the documented GTM
  container; no code change.
- ⚠️ We maintain ~250 lines of measurement code rather than leaning on a module
  (mitigated: small, typed, documented, single-responsibility).
- ⚠️ GA4 property settings (TZ Africa/Johannesburg, currency ZAR, enhanced
  measurement) and the GTM container are configured in those UIs — see
  `measurement-plan.md`. Browser/Tag-Assistant verification is pending real ids.
- ➡️ Needs a `/privacy` POPIA/cookie page (cross-session ask) for the CMP to link.
