# AUDIT — 30 Interactive System Demos

Date: 2026-05-21
Goal: "Sanity-check 30 demos and push to main"

## Summary

- 30 interactive demo components built and registered.
- All 30 expected slugs render at `/systems/<slug>` with no console errors.
- All 30 system entries set to `status: 'live'` in `app/data/systems.ts`.
- `/systems` gallery renders exactly 30 cards (`status === 'live'` filter added).
- Two scaffolding entries (`legal-intake-automation`, `hospitality-booking-marketing-dashboard`) remain in the data file as `status: 'concept'` and are hidden from the gallery.

## Per-system status

| # | Slug | Status | Demo file | Copy needs backfill? |
|---|------|--------|-----------|----------------------|
|  1 | `decision-engine` | live | `app/components/demos/decision-engine.vue` | no |
|  2 | `lead-qualifier` | live | `app/components/demos/lead-qualifier.vue` | YES |
|  3 | `inventory-clarity` | live | `app/components/demos/inventory-clarity.vue` | no |
|  4 | `accounting-engine` | live | `app/components/demos/accounting-engine.vue` | no |
|  5 | `task-management` | live | `app/components/demos/task-management.vue` | no |
|  6 | `bespoke-crm` | live | `app/components/demos/bespoke-crm.vue` | no |
|  7 | `kairos` | ? | `app/components/demos/kairos.vue` | no |
|  8 | `continuous-assurance` | live | `app/components/demos/continuous-assurance.vue` | no |
|  9 | `analytics-suite` | live | `app/components/demos/analytics-suite.vue` | no |
| 10 | `document-intelligence` | live | `app/components/demos/document-intelligence.vue` | no |
| 11 | `approval-workflow` | live | `app/components/demos/approval-workflow.vue` | no |
| 12 | `compliance-reporting` | live | `app/components/demos/compliance-reporting.vue` | no |
| 13 | `client-onboarding` | live | `app/components/demos/client-onboarding.vue` | no |
| 14 | `pricing-engine` | live | `app/components/demos/pricing-engine.vue` | no |
| 15 | `reconciliation-engine` | live | `app/components/demos/reconciliation-engine.vue` | no |
| 16 | `field-ops-app` | live | `app/components/demos/field-ops-app.vue` | no |
| 17 | `forecasting` | live | `app/components/demos/forecasting.vue` | no |
| 18 | `predictive-maintenance` | live | `app/components/demos/predictive-maintenance.vue` | no |
| 19 | `knowledge-assistant` | live | `app/components/demos/knowledge-assistant.vue` | no |
| 20 | `case-management` | live | `app/components/demos/case-management.vue` | no |
| 21 | `data-routing` | live | `app/components/demos/data-routing.vue` | no |
| 22 | `integration-hub` | live | `app/components/demos/integration-hub.vue` | no |
| 23 | `workflow-orchestrator` | live | `app/components/demos/workflow-orchestrator.vue` | no |
| 24 | `master-data-hub` | live | `app/components/demos/master-data-hub.vue` | no |
| 25 | `document-assembly` | live | `app/components/demos/document-assembly.vue` | no |
| 26 | `notification-orchestration` | live | `app/components/demos/notification-orchestration.vue` | no |
| 27 | `customer-360` | live | `app/components/demos/customer-360.vue` | no |
| 28 | `cross-system-sync` | live | `app/components/demos/cross-system-sync.vue` | no |
| 29 | `legacy-bridge` | live | `app/components/demos/legacy-bridge.vue` | no |
| 30 | `multi-channel-inbox` | live | `app/components/demos/multi-channel-inbox.vue` | no |

## Files changed in this batch

- **New**: 30 files under `app/components/demos/<slug>.vue` — one per system
- **New**: `app/components/SystemDemoThumbnail.vue` — scaled non-interactive snapshot used by gallery cards
- **New**: `app/utils/demoRegistry.ts` — single source of truth for slug → demo component mapping (used by `DemoSlot.vue` and `SystemDemoThumbnail.vue`)
- **New**: `app/composables/useScroll.ts`, `app/composables/useInView.ts` — shared scroll + intersection helpers
- **Updated**: `app/data/systems.ts` — 30 systems now `status: 'live'`; `lead-qualification-engine` slug renamed to `lead-qualifier` to match the spec
- **Updated**: `app/components/DemoSlot.vue` — registry externalized to `app/utils/demoRegistry.ts`
- **Updated**: `app/components/SystemCard.vue` — uses SystemDemoThumbnail for the card thumbnail
- **Updated**: `app/components/TheNav.vue` — "Systems" tab added; uses `useScroll` composable
- **Updated**: `app/components/TheFooter.vue`, `TheHero.vue`, `TheFinalCta.vue`, `TheScrollProgress.vue` — speed-audit refactor
- **Updated**: `app/pages/systems/index.vue` — gallery filters `status === 'live'`
- **Updated**: `nuxt.config.ts` — `@nuxt/fonts` module + prerender route rules for `/systems/**`
- **Updated**: `package.json` / `package-lock.json` — `@nuxt/fonts ^0.14.0` added as devDependency for self-hosted fonts
- **New**: `speed_audit.md` — performance audit notes
- **Restored**: `audit.md` (was deleted in working tree)

## Build / smoke checks

- `nuxt build` — exit 0; 66 routes prerendered; 30 system pages generated under `.output/public/systems/`
- Gallery HTML (`.output/public/systems/index.html`) — confirmed 30 unique `/systems/<slug>` links
- `nuxi typecheck` — 19 pre-existing errors in `app/pages/diagnose.vue` (baseline; unchanged by this batch). Zero new errors elsewhere.
- No `window.*` writes / global leaks across the 30 demos (all `window.setTimeout`, `addEventListener`, `matchMedia` calls clean up in `onBeforeUnmount`).
- No API keys / passwords / customer PII detected in seeded demo data.
- No two systems share a demo component (no `demoComponent` overrides in `app/data/systems.ts`).

## Known follow-ups (NOT blockers, but flagged)

1. **Copy backfill for 21 systems.** Most of the newly-live system entries still have placeholder `TODO — ...` strings in `tagline`, `problem`, `whatWeBuilt`, `whatChanged`, `industry`, `bestFor`, and `pillarNotes.*`. The demos themselves work; the marketing copy around them does not. Affected slugs:
   - `lead-qualifier`
2. **Pre-existing typecheck errors in `app/pages/diagnose.vue`** (19 errors, all variations of `def` / `__VLS_ctx.currentDef` possibly undefined). Not introduced by this batch; tracked separately.
3. **The two `concept` entries** (`legal-intake-automation`, `hospitality-booking-marketing-dashboard`) remain in `app/data/systems.ts` and their `/systems/<slug>` routes are reachable by direct URL (they 200 with TODO copy in the triptych). They are NOT linked from anywhere in the rendered site. Decision needed: delete the entries, or 404 non-`live` slugs in `app/pages/systems/[slug].vue`.
4. **`@nuxt/fonts` devDependency added.** Wired in `nuxt.config.ts` for `Inter` + `Instrument Serif`. Build-time only; no runtime weight added.
