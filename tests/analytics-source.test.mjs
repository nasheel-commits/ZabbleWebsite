/**
 * S09 — analytics source contract tests (no build needed).
 *
 * Asserts the consent + key-event guarantees directly against the plugin/page
 * source, so a regression that weakens POPIA behaviour fails CI immediately.
 * Run: `npm run test:source` (or `npm test` for the full suite incl. static HTML).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

const core = read('app/plugins/1.analytics.client.ts')
const events = read('app/plugins/2.analytics-events.client.ts')
const diagnose = read('app/pages/diagnose.vue')

test('Consent Mode v2: all four signals default to denied', () => {
  for (const sig of ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']) {
    assert.match(core, new RegExp(`${sig}:\\s*'denied'`), `${sig} must default denied`)
  }
})

test('only security_storage is granted by default (strictly-necessary)', () => {
  assert.match(core, /security_storage:\s*'granted'/)
  assert.match(core, /functionality_storage:\s*'denied'/)
  assert.match(core, /personalization_storage:\s*'denied'/)
})

test('default consent is region-scoped to ZA', () => {
  // Region list defaults to ['ZA'] and is passed into a consent default push.
  assert.match(core, /\['ZA'\]/, "region default must include 'ZA'")
  assert.match(core, /'consent',\s*'default',\s*\{[^}]*region:\s*regions/s)
})

test('default consent uses wait_for_update + ads_data_redaction', () => {
  assert.match(core, /wait_for_update:\s*500/)
  assert.match(core, /ads_data_redaction['"]?,\s*true|ads_data_redaction.*true/)
})

test('gtag shim pushes the raw arguments object (consent parser needs it)', () => {
  assert.match(core, /dataLayer!?\.push\(arguments\)/)
})

test('opt-in: tags load only after a consent grant, never at boot', () => {
  // loadTags() is reachable only from applyConsent, gated on a granted category.
  assert.match(core, /if \(choice\.analytics \|\| choice\.ads\) loadTags\(\)/)
  // consent is UPDATED (granted/denied) inside applyConsent.
  assert.match(core, /'consent',\s*'update'/)
  // sanity: there is no unconditional loadTags() call at module top-level.
  const topLevel = core.split('export default defineNuxtPlugin')[1] || ''
  assert.doesNotMatch(topLevel, /\n\s*loadTags\(\)\s*\n/)
})

test('empty id ⇒ no-op (enabled is false without any id)', () => {
  assert.match(core, /const enabled = hasGtm \|\| hasGa4 \|\| hasClarity/)
})

test('Clarity is loaded first-party and consent-gated', () => {
  assert.match(core, /clarity\.ms\/tag\//)
  assert.match(core, /if \(state\.choice\.analytics\) loadClarity\(\)/)
})

test('all auto-captured key events are wired', () => {
  for (const ev of ['email_click', 'phone_call_click', 'file_download', 'schedule_click', 'page_view']) {
    assert.match(events, new RegExp(`'${ev}'`), `${ev} must be emitted`)
  }
  assert.match(events, /percent_scrolled:\s*90/, '90% scroll must be emitted')
  assert.match(events, /isMoneyPage/, 'scroll must be gated to money pages')
})

test('generate_lead + schedule_call are wired into the diagnose conversion', () => {
  assert.match(diagnose, /trackEvent\('generate_lead'/)
  assert.match(diagnose, /currency:\s*'ZAR'/)
  // schedule_call fires programmatically only after /api/book confirms the
  // booking (res.ok branch), so it counts real bookings, not click intent.
  // (Superseded the earlier data-analytics-event="schedule_call" click attr.)
  assert.match(diagnose, /trackEvent\('schedule_call'/)
})
