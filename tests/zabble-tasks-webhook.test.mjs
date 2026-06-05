// Zabble Tasks webhook unit suite. Run: `npm run test:webhook`
// (or `node --test tests/zabble-tasks-webhook.test.mjs`).
//
// Asserts the security-critical contract of server/utils/zabble-tasks.mjs:
//   1. The X-Zabble-Signature header is HMAC-SHA256 over the EXACT serialized
//      body bytes that get sent (serialize once → sign those bytes → send them).
//   2. A missing URL or secret skips the call entirely (never fires fetch).
//   3. A failing webhook is swallowed — it never throws / never rejects.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

import {
  resolveWebhookConfig,
  signRequestBody,
  buildDiagnosticLeadPayload,
  postDiagnosticLeadToZabbleTasks,
} from '../server/utils/zabble-tasks.mjs'

const URL = 'https://tasks.zabble.org/api/v1/webhooks/diagnostic-lead'
const SECRET = 'test-shared-secret'

const fullEnv = {
  ZABBLE_TASKS_WEBHOOK_URL: URL,
  ZABBLE_TASKS_WEBHOOK_SECRET: SECRET,
}

// A no-op logger so the suite output stays clean.
const quietLogger = { warn() {}, error() {} }

// A fetch double that records the single call it receives and reports success.
function recordingFetch() {
  const calls = []
  const fetchImpl = async (url, init) => {
    calls.push({ url, init })
    return { ok: true, status: 202 }
  }
  return { calls, fetchImpl }
}

const samplePayload = buildDiagnosticLeadPayload({
  bookingId: 'evt_abc123',
  submittedAt: '2026-06-05T13:30:00.000Z',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: null,
  companyName: 'Analytical Engines',
  requestedTime: '2026-06-05T15:30:00+02:00',
  timezoneLabel: 'Johannesburg · UTC+2',
  meetUrl: 'https://meet.google.com/abc-defg-hij',
  googleCalendarId: 'sales@zabble.org',
  googleEventId: 'evt_abc123',
  calendarEventUrl: 'https://calendar.google.com/event?eid=BLOB',
  diagnostic: { pain_profile: 'Repetitive manual ops', wants: 'Time back' },
})

test('signs the exact serialized bytes that are sent', async () => {
  const { calls, fetchImpl } = recordingFetch()

  const result = await postDiagnosticLeadToZabbleTasks(samplePayload, {
    env: fullEnv,
    fetchImpl,
    logger: quietLogger,
  })

  assert.equal(result.ok, true)
  assert.equal(calls.length, 1, 'fetch should be called exactly once')

  const { url, init } = calls[0]
  assert.equal(url, URL)
  assert.equal(init.method, 'POST')
  assert.equal(init.headers['Content-Type'], 'application/json')

  // The body sent must be the byte-for-byte serialization of the payload...
  assert.equal(init.body, JSON.stringify(samplePayload))

  // ...and the signature header must be HMAC-SHA256 over THOSE bytes.
  const expected =
    'sha256=' + createHmac('sha256', SECRET).update(init.body, 'utf8').digest('hex')
  assert.equal(init.headers['X-Zabble-Signature'], expected)

  // Lowercase hex, sha256= prefixed.
  assert.match(init.headers['X-Zabble-Signature'], /^sha256=[0-9a-f]{64}$/)

  // The helper's standalone signer agrees with what was sent.
  assert.equal(signRequestBody(SECRET, init.body), init.headers['X-Zabble-Signature'])
})

test('skips the call when the secret is missing', async () => {
  const { calls, fetchImpl } = recordingFetch()

  const result = await postDiagnosticLeadToZabbleTasks(samplePayload, {
    env: { ZABBLE_TASKS_WEBHOOK_URL: URL }, // no secret
    fetchImpl,
    logger: quietLogger,
  })

  assert.deepEqual(result, { ok: false, skipped: true })
  assert.equal(calls.length, 0, 'fetch must NOT be called without a secret')
})

test('skips the call when the URL is missing', async () => {
  const { calls, fetchImpl } = recordingFetch()

  const result = await postDiagnosticLeadToZabbleTasks(samplePayload, {
    env: { ZABBLE_TASKS_WEBHOOK_SECRET: SECRET }, // no URL
    fetchImpl,
    logger: quietLogger,
  })

  assert.deepEqual(result, { ok: false, skipped: true })
  assert.equal(calls.length, 0, 'fetch must NOT be called without a URL')
})

test('resolveWebhookConfig: null unless BOTH url and secret are set', () => {
  assert.equal(resolveWebhookConfig({}), null)
  assert.equal(resolveWebhookConfig({ ZABBLE_TASKS_WEBHOOK_URL: URL }), null)
  assert.equal(resolveWebhookConfig({ ZABBLE_TASKS_WEBHOOK_SECRET: SECRET }), null)
  assert.deepEqual(resolveWebhookConfig(fullEnv), { url: URL, secret: SECRET })
  // Blank/whitespace-only values count as unset.
  assert.equal(
    resolveWebhookConfig({ ZABBLE_TASKS_WEBHOOK_URL: '  ', ZABBLE_TASKS_WEBHOOK_SECRET: SECRET }),
    null,
  )
})

test('a failing webhook is swallowed — never throws', async () => {
  const result = await postDiagnosticLeadToZabbleTasks(samplePayload, {
    env: fullEnv,
    fetchImpl: async () => {
      throw new Error('network down')
    },
    logger: quietLogger,
  })
  assert.equal(result.ok, false)
  assert.equal(result.error, true)
})

test('buildDiagnosticLeadPayload: null phone + defaulted diagnostic fields', () => {
  const p = buildDiagnosticLeadPayload({
    bookingId: 'id1',
    submittedAt: '2026-06-05T00:00:00.000Z',
    name: 'No Phone',
    email: 'np@example.com',
    phone: '',
    companyName: 'Acme',
    requestedTime: '2026-06-05T10:00:00+02:00',
    timezoneLabel: 'Johannesburg · UTC+2',
    meetUrl: null,
    googleCalendarId: 'sales@zabble.org',
    googleEventId: 'id1',
    calendarEventUrl: null,
  })
  assert.equal(p.contact.phone, null, 'empty phone serializes as null')
  assert.equal(p.booking.meet_url, null)
  // All 8 diagnostic keys are always present (default '').
  assert.deepEqual(Object.keys(p.diagnostic).sort(), [
    'business', 'main_cost', 'most_pressing', 'pain_profile',
    'timeline', 'tried_so_far', 'wants', 'who_is_involved',
  ])
  assert.equal(p.diagnostic.business, '')
})
