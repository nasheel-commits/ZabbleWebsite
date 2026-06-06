// Zabble Tasks webhook smoke test.
//
//   npm run smoke:webhook              # creates a fresh test lead (created:true)
//   npm run smoke:webhook -- --id WI-x # reuse a booking_id (expect duplicate_booking)
//
// Signs a clearly-marked TEST payload with the SAME helper the booking route
// uses (server/utils/zabble-tasks.mjs) and POSTs it to the live endpoint, so a
// {created:true,…} response confirms the URL + secret + google_calendar_id all
// line up — without going through a real /diagnose booking.
//
// Reads ZABBLE_TASKS_WEBHOOK_URL + ZABBLE_TASKS_WEBHOOK_SECRET from the
// environment, falling back to a .env file at the repo root (git-ignored).
// NOTE: this POST creates a real Work Item in Zabble Tasks. The booking_id is
// time-stamped and obviously a test; idempotency means re-runs with the same id
// dedupe (created:false, reason:"duplicate_booking").
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  buildDiagnosticLeadPayload,
  signRequestBody,
  resolveWebhookConfig,
} from '../server/utils/zabble-tasks.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Minimal .env loader (no dependency): only fills vars not already in the env.
function loadDotEnv() {
  const path = join(ROOT, '.env')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadDotEnv()

const config = resolveWebhookConfig(process.env)
if (!config) {
  console.error(
    'ABORT: ZABBLE_TASKS_WEBHOOK_URL and/or ZABBLE_TASKS_WEBHOOK_SECRET are not set.\n' +
      'Set them in the environment or in a .env file at the repo root.',
  )
  process.exit(2)
}

// Allow `-- --id <booking_id>` to re-test idempotency against an existing lead.
const idArgIndex = process.argv.indexOf('--id')
const bookingId =
  idArgIndex !== -1 && process.argv[idArgIndex + 1]
    ? process.argv[idArgIndex + 1]
    : `smoke-test-${new Date().toISOString().replace(/[:.]/g, '-')}`

const payload = buildDiagnosticLeadPayload({
  bookingId,
  submittedAt: new Date().toISOString(),
  name: 'Webhook Smoke Test',
  email: 'smoke-test@zabble.org',
  phone: null,
  companyName: 'Zabble Webhook Smoke Test (safe to delete)',
  requestedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  timezoneLabel: 'Johannesburg · UTC+2',
  meetUrl: 'https://meet.google.com/smoke-test-xyz',
  googleCalendarId: 'sales@zabble.org',
  googleEventId: `smoke-${bookingId}`,
  calendarEventUrl: 'https://www.google.com/calendar/event?eid=SMOKE_TEST',
  diagnostic: {
    pain_profile: 'Smoke test — alignment check',
    most_pressing: 'Verifying webhook URL + secret + account',
    wants: 'A {created:true} response',
  },
})

// Serialize ONCE; sign those exact bytes; send those exact bytes.
const raw = JSON.stringify(payload)
const signature = signRequestBody(config.secret, raw)

console.log(`POST ${config.url}`)
console.log(`booking_id: ${bookingId}`)
console.log(`google_calendar_id: ${payload.booking.google_calendar_id}`)
console.log(`X-Zabble-Signature: ${signature}`)

const res = await fetch(config.url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Zabble-Signature': signature },
  body: raw,
})

const text = await res.text()
console.log(`\nHTTP ${res.status}`)
console.log(text)

// Exit non-zero on anything that isn't an accepted lead, so CI/manual runs fail loudly.
let parsed
try {
  parsed = JSON.parse(text)
} catch {
  parsed = null
}
const accepted = res.status === 200 && parsed && parsed.accepted === true
process.exit(accepted ? 0 : 1)
