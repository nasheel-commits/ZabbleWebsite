// ---------------------------------------------------------------------------
// GET /api/health/zabble-tasks
// Authenticated config probe for the Zabble Tasks webhook. Confirms that THIS
// deployment can resolve ZABBLE_TASKS_WEBHOOK_URL/SECRET and what value it
// would send as booking.google_calendar_id — WITHOUT creating a Work Item and
// WITHOUT exposing the secret (only a short SHA-256 fingerprint, so you can
// compare against the known-good secret).
//
// Auth: send the webhook secret as a bearer token:
//   curl -H "Authorization: Bearer $ZABBLE_TASKS_WEBHOOK_SECRET" \
//        https://<deployment>/api/health/zabble-tasks
// (or ?token=… as a fallback). Compared timing-safe against the configured
// secret. If no secret is configured, the probe returns secret_set:false
// WITHOUT auth — that "not configured" fact is the diagnostic you need and
// there is no secret to protect.
// ---------------------------------------------------------------------------

import { createHash, timingSafeEqual } from 'node:crypto'
import { resolveWebhookConfig } from '../../utils/zabble-tasks.mjs'

/** First `n` hex chars of sha256(value) — a non-reversible fingerprint. */
function fingerprint(value: string, n = 12): string {
  return createHash('sha256').update(value, 'utf8').digest('hex').slice(0, n)
}

/** Constant-time equality on the sha256 of each side (also avoids length leak). */
function tokensMatch(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided, 'utf8').digest()
  const b = createHash('sha256').update(expected, 'utf8').digest()
  return timingSafeEqual(a, b)
}

export default defineEventHandler((event) => {
  const env = process.env
  const url = (env.ZABBLE_TASKS_WEBHOOK_URL || '').trim()
  const secret = (env.ZABBLE_TASKS_WEBHOOK_SECRET || '').trim()

  // --- Auth (only enforceable when a secret exists) ------------------------
  if (secret) {
    const header = getHeader(event, 'authorization') || ''
    const bearer = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
    const token = bearer || String(getQuery(event).token || '')
    if (!token || !tokensMatch(token, secret)) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
  }

  // --- Resolve exactly what the booking route would use --------------------
  const resolved = resolveWebhookConfig(env) // null unless BOTH url + secret set
  const cfg = useRuntimeConfig()
  // The calendar the event is created on === the impersonated user (book.post.ts
  // uses c.organizer). Default mirrors runtimeConfig in nuxt.config.ts.
  const impersonatedUser = (cfg.googleImpersonatedUser as string) || 'sales@zabble.org'
  const bookingConfigured = readBookingConfig() != null

  let urlHost: string | null = null
  let urlPath: string | null = null
  try {
    if (url) {
      const u = new URL(url)
      urlHost = u.host
      urlPath = u.pathname
    }
  } catch {
    urlHost = '(invalid URL)'
  }

  return {
    ok: true,
    // 'production' | 'preview' | 'development' on Vercel; undefined locally.
    vercel_env: env.VERCEL_ENV ?? null,
    // True only when BOTH url + secret resolve, i.e. the webhook will fire.
    resolves: resolved != null,
    webhook: {
      url_set: Boolean(url),
      url_host: urlHost,
      url_path: urlPath, // confirm this is /api/v1/webhooks/diagnostic-lead
      secret_set: Boolean(secret),
      secret_len: secret.length,
      // Compare to sha256(known-good secret).slice(0,12) to detect a mismatch
      // without ever transmitting the secret itself.
      secret_sha256_12: secret ? fingerprint(secret) : null,
    },
    google: {
      // This is what gets sent as booking.google_calendar_id — MUST be
      // sales@zabble.org or the proxy returns {created:false,unknown_account}.
      calendar_id_to_send: impersonatedUser,
      matches_seeded_account: impersonatedUser === 'sales@zabble.org',
      booking_configured: bookingConfigured, // false ⇒ /api/book returns not_configured
    },
  }
})
