// ---------------------------------------------------------------------------
// Zabble Tasks webhook — internal ops ingestion of booked discovery calls.
//
// After /api/book creates the Google Calendar event + Meet link and sends the
// confirmation emails, we POST the booking as JSON to the Zabble Tasks
// endpoint (path /api/v1/webhooks/diagnostic-lead), signed with HMAC-SHA256.
//
// Plain .mjs (not .ts) on purpose: the signing + skip logic is pure and
// dependency-free, so the unit test (tests/zabble-tasks-webhook.test.mjs) can
// import and exercise the exact same code under `node --test` without a TS
// loader or any test framework. The Nitro route imports it the same way.
//
// Contract:
//   • Reads ZABBLE_TASKS_WEBHOOK_URL + ZABBLE_TASKS_WEBHOOK_SECRET from env.
//     If either is unset → skip the POST and warn (never block the booking).
//   • Serialises the body ONCE, signs those exact bytes, sends those bytes.
//   • Header: X-Zabble-Signature: sha256=<lowercase hex digest>.
//   • Fire-and-forget, ~5s timeout, fully caught — never throws, never rejects.
// ---------------------------------------------------------------------------

import { createHmac } from 'node:crypto'

/**
 * Resolve the webhook URL + secret from an env bag (defaults to process.env).
 * Returns null when EITHER value is missing — callers treat null as "skip".
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {{ url: string, secret: string } | null}
 */
export function resolveWebhookConfig(env = process.env) {
  const url = (env.ZABBLE_TASKS_WEBHOOK_URL || '').trim()
  const secret = (env.ZABBLE_TASKS_WEBHOOK_SECRET || '').trim()
  if (!url || !secret) return null
  return { url, secret }
}

/**
 * Compute the X-Zabble-Signature header value over the EXACT raw body bytes.
 * HMAC-SHA256, lowercase hex, `sha256=` prefixed. `rawBody` must be the same
 * string that gets sent on the wire (UTF-8), so the digest matches the bytes.
 *
 * @param {string} secret
 * @param {string} rawBody
 * @returns {string} e.g. "sha256=9f86d0818..."
 */
export function signRequestBody(secret, rawBody) {
  const digest = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  return `sha256=${digest}`
}

/**
 * Map the booking/lead data we already have into the exact webhook JSON body.
 * Pure: no I/O, no clock — the caller passes `submittedAt` and the ids.
 *
 * @param {{
 *   bookingId: string,
 *   submittedAt: string,
 *   name: string,
 *   email: string,
 *   phone?: string | null,
 *   companyName: string,
 *   requestedTime: string,
 *   timezoneLabel: string,
 *   meetUrl?: string | null,
 *   googleCalendarId: string,
 *   googleEventId?: string | null,
 *   calendarEventUrl?: string | null,
 *   diagnostic?: Partial<Record<
 *     'pain_profile'|'business'|'most_pressing'|'main_cost'|'tried_so_far'|'timeline'|'who_is_involved'|'wants',
 *     string>>,
 * }} input
 */
export function buildDiagnosticLeadPayload(input) {
  const d = input.diagnostic ?? {}
  return {
    booking_id: input.bookingId,
    submitted_at: input.submittedAt,
    contact: {
      name: input.name,
      email: input.email,
      phone: input.phone ? input.phone : null,
    },
    company: { name: input.companyName },
    booking: {
      requested_time: input.requestedTime,
      timezone_label: input.timezoneLabel,
      meet_url: input.meetUrl ?? null,
      google_calendar_id: input.googleCalendarId,
      google_event_id: input.googleEventId ?? null,
      calendar_event_url: input.calendarEventUrl ?? null,
    },
    diagnostic: {
      pain_profile: d.pain_profile ?? '',
      business: d.business ?? '',
      most_pressing: d.most_pressing ?? '',
      main_cost: d.main_cost ?? '',
      tried_so_far: d.tried_so_far ?? '',
      timeline: d.timeline ?? '',
      who_is_involved: d.who_is_involved ?? '',
      wants: d.wants ?? '',
    },
  }
}

/**
 * POST a diagnostic-lead booking to Zabble Tasks. Non-blocking and defensive:
 * skips cleanly when unconfigured, times out, and swallows every error so a
 * webhook problem can NEVER fail or surface in the user's booking.
 *
 * Returns a result object (never throws / never rejects) — handy for tests and
 * for an optional caller log. `fetchImpl` and `env` are injectable for testing.
 *
 * @param {object} payload  Already-built body (see buildDiagnosticLeadPayload).
 * @param {{
 *   env?: Record<string, string | undefined>,
 *   fetchImpl?: typeof fetch,
 *   timeoutMs?: number,
 *   logger?: Pick<Console, 'warn' | 'error'>,
 * }} [opts]
 * @returns {Promise<{ ok: boolean, skipped?: boolean, status?: number, signature?: string, error?: boolean }>}
 */
export async function postDiagnosticLeadToZabbleTasks(payload, opts = {}) {
  const {
    env = process.env,
    fetchImpl = globalThis.fetch,
    timeoutMs = 5000,
    logger = console,
  } = opts

  const config = resolveWebhookConfig(env)
  if (!config) {
    logger.warn(
      '[zabble-tasks] ZABBLE_TASKS_WEBHOOK_URL/SECRET not set — skipping diagnostic-lead webhook (booking unaffected).',
    )
    return { ok: false, skipped: true }
  }

  // Serialise ONCE; sign those exact bytes; send those exact bytes.
  const rawBody = JSON.stringify(payload)
  const signature = signRequestBody(config.secret, rawBody)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchImpl(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Zabble-Signature': signature,
      },
      body: rawBody,
      signal: controller.signal,
    })
    if (!res || !res.ok) {
      logger.error(
        `[zabble-tasks] diagnostic-lead webhook returned ${res ? res.status : 'no response'} (non-fatal).`,
      )
      return { ok: false, status: res ? res.status : undefined, signature }
    }
    return { ok: true, status: res.status, signature }
  } catch (err) {
    logger.error('[zabble-tasks] diagnostic-lead webhook POST failed (non-fatal):', err)
    return { ok: false, error: true, signature }
  } finally {
    clearTimeout(timer)
  }
}
