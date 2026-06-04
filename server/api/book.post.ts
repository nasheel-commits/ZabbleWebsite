// ---------------------------------------------------------------------------
// POST /api/book
// Books a 30-minute discovery call from the /diagnose lead form:
//   1. Re-checks the slot against sales@'s live calendar (no double-booking)
//   2. Creates an event on sales@zabble.org's Google Calendar
//   3. Attaches an auto-generated Google Meet link (conferenceData)
//   4. Invites the prospect + sales@, Google emails both the invite + Meet
//      link automatically (sendUpdates: 'all')
//   5. Sends sales@ a separate lead-notification email with the pain profile
//
// Auth + config live in server/utils/booking.ts (NUXT_GOOGLE_* env vars).
// Until those are set the endpoint returns { ok:false, reason:'not_configured' }
// and the UI falls back to a mailto. See docs/booking-setup.md.
// ---------------------------------------------------------------------------

interface BookBody {
  contact?: {
    name?: string
    email?: string
    company?: string
    phone?: string
    walkAway?: string
  }
  start?: {
    // Naive wall-clock time, no offset, e.g. "2026-06-10T14:30:00".
    // Interpreted in the configured booking timezone.
    dateTime?: string
    dateLabel?: string
    timeLabel?: string
  }
  profileTitle?: string
  summaryLines?: string[]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAIVE_DT_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/

/** Add `minutes` to a naive "YYYY-MM-DDTHH:MM:SS" string, returning the same shape. */
function addMinutes(naive: string, minutes: number): string {
  const m = NAIVE_DT_RE.exec(naive)
  if (!m) return naive
  const [, y, mo, d, h, min] = m
  // UTC anchor purely for arithmetic, we only read wall-clock fields back.
  const next = new Date(Date.UTC(+y, +mo - 1, +d, +h, +min, 0) + minutes * 60_000)
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    `${next.getUTCFullYear()}-${p(next.getUTCMonth() + 1)}-${p(next.getUTCDate())}` +
    `T${p(next.getUTCHours())}:${p(next.getUTCMinutes())}:00`
  )
}

export default defineEventHandler(async (event) => {
  const body = await readBody<BookBody>(event)

  // --- Validate ------------------------------------------------------------
  const contact = body?.contact ?? {}
  const name = (contact.name ?? '').trim()
  const email = (contact.email ?? '').trim()
  const company = (contact.company ?? '').trim()
  const startDateTime = (body?.start?.dateTime ?? '').trim()

  if (!name || !company || !EMAIL_RE.test(email) || !NAIVE_DT_RE.test(startDateTime)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid booking details.' })
  }

  const dateLabel = body?.start?.dateLabel ?? startDateTime
  const timeLabel = body?.start?.timeLabel ?? ''
  const summaryLines = Array.isArray(body?.summaryLines) ? body!.summaryLines! : []
  const profileTitle = (body?.profileTitle ?? '').trim()
  const phone = (contact.phone ?? '').trim()
  const walkAway = (contact.walkAway ?? '').trim()

  // --- Durable lead capture — ALWAYS, before any Google call ---------------
  // Every validated submission is logged here so a lead is NEVER lost: not when
  // booking isn't configured yet, not when Google later errors, not when the
  // visitor never sends the mailto fallback. On Vercel these land in the
  // function logs (filter for "[lead]"). The calendar event + emails below are
  // the happy path on top of this guaranteed record.
  console.log(
    '[lead] diagnose submission ' +
      JSON.stringify({
        receivedAt: new Date().toISOString(),
        name,
        email,
        company,
        phone,
        walkAway,
        profileTitle,
        requestedSlot: { dateTime: startDateTime, dateLabel, timeLabel },
        answers: summaryLines,
      }),
  )

  const c = readBookingConfig()
  if (!c) {
    // Lead is already captured in the log above; the UI shows the mailto
    // fallback. To enable auto-booking + emails, set the NUXT_GOOGLE_* env vars
    // in Vercel → Settings → Environment Variables (see docs/booking-setup.md).
    console.warn('[book] not_configured: NUXT_GOOGLE_* env vars are unset — lead logged, UI falls back to mailto.')
    return { ok: false as const, reason: 'not_configured' as const }
  }

  const endDateTime = addMinutes(startDateTime, c.durationMin)

  try {
    const token = await getGoogleToken(c)
    if (!token) {
      console.error('[book] Failed to obtain Google access token.')
      return { ok: false as const, reason: 'auth_failed' as const }
    }

    // --- Enforce the minimum 1h lead time (authoritative) ------------------
    const offset = offsetForZone(c.timeZone, startDateTime.slice(0, 10))
    const slotStart = Date.parse(`${startDateTime}${offset}`)
    const slotEnd = slotStart + c.durationMin * 60_000
    if (slotStart < Date.now() + 60 * 60 * 1000) {
      return { ok: false as const, reason: 'too_soon' as const }
    }

    // --- Re-check the slot against the live calendar (race guard) ----------
    const busy = await getBusyIntervals(
      token,
      c.organizer,
      `${startDateTime}${offset}`,
      `${endDateTime}${offset}`,
      c.timeZone,
    )
    const conflict = busy.some((b) =>
      overlaps(slotStart, slotEnd, Date.parse(b.start), Date.parse(b.end)),
    )
    if (conflict) {
      return { ok: false as const, reason: 'slot_taken' as const }
    }

    // Gmail send helper + internal-notification builders. Defined BEFORE the
    // event call so the calendar-failure path can also alert sales@.
    const sendGmail = (raw: string) =>
      $fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { raw },
      })

    // Human-friendly timezone label, e.g. "Johannesburg · UTC+2".
    const tzCity = c.timeZone.split('/').pop()?.replace(/_/g, ' ') ?? c.timeZone
    const tzLabel = `${tzCity} · UTC${offset.slice(0, 3).replace(/0(\d)/, '$1')}`

    // Internal lead email body — shared by the booked + booking-failed paths,
    // so sales@ is notified of the lead either way.
    const internalLead = (o: { booked: boolean; meetLink?: string | null; htmlLink?: string | null }) =>
      [
        o.booked
          ? 'New discovery call booked via the diagnostic.'
          : 'Lead from the diagnostic — auto-booking FAILED. Please follow up and book manually.',
        '',
        `When (requested): ${dateLabel}${timeLabel ? ` at ${timeLabel}` : ''} (${tzLabel})`,
        o.meetLink ? `Google Meet: ${o.meetLink}` : '',
        o.htmlLink ? `Calendar event: ${o.htmlLink}` : '',
        '',
        `Name: ${name}`,
        `Company: ${company}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : '',
        '',
        profileTitle ? `Operational Pain Profile: ${profileTitle}` : '',
        '',
        'Diagnostic answers:',
        ...summaryLines.map((l) => `• ${l}`),
        walkAway ? `\nWants to walk away with: ${walkAway}` : '',
      ]
        .filter((l) => l !== '')
        .join('\n')

    const notifySales = async (subject: string, text: string) => {
      try {
        await sendGmail(buildRawMime({ from: c.organizer, to: c.salesEmail, subject, text }))
      } catch (mailErr) {
        console.error('[book] Internal sales@ notification failed (non-fatal):', mailErr)
      }
    }

    const descriptionLines = [
      `Discovery call with ${name}${company ? ` (${company})` : ''}.`,
      '',
      profileTitle ? `Operational Pain Profile: ${profileTitle}` : '',
      '',
      'What they shared on the diagnostic:',
      ...summaryLines.map((l) => `• ${l}`),
      '',
      `Contact: ${email}${phone ? ` · ${phone}` : ''}`,
      walkAway ? `Wants to walk away with: ${walkAway}` : '',
    ].filter((l) => l !== '')

    // --- Create the calendar event + Meet link -----------------------------
    const requestId = globalThis.crypto?.randomUUID?.() ?? `zabble-${startDateTime}-${email}`
    let eventRes: {
      id?: string
      htmlLink?: string
      hangoutLink?: string
      conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> }
    }
    try {
      // sendUpdates:'none' — we send our own premium confirmation to the lead
      // instead of Google's plain invite. The event still lands on sales@'s
      // calendar (they're the organizer), and sales@ gets our internal email.
      eventRes = await $fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        query: { conferenceDataVersion: 1, sendUpdates: 'none' },
        headers: { Authorization: `Bearer ${token}` },
        body: {
          summary: `Zabble discovery call · ${company}`,
          description: descriptionLines.join('\n'),
          start: { dateTime: startDateTime, timeZone: c.timeZone },
          end: { dateTime: endDateTime, timeZone: c.timeZone },
          attendees: [
            { email, displayName: name },
            { email: c.salesEmail, organizer: true, responseStatus: 'accepted' },
          ],
          guestsCanModify: false,
          reminders: { useDefault: true },
          conferenceData: {
            createRequest: { requestId, conferenceSolutionKey: { type: 'hangoutsMeet' } },
          },
        },
      })
    } catch (eventErr) {
      // Calendar write failed, but the lead is already logged AND Gmail may
      // still be reachable — actively alert sales@ so the lead is never dropped.
      console.error('[book] Calendar event creation failed:', eventErr)
      await notifySales(
        `Lead (auto-booking FAILED) — ${name}${company ? `, ${company}` : ''}`,
        internalLead({ booked: false }),
      )
      return { ok: false as const, reason: 'calendar_failed' as const }
    }

    const meetLink =
      eventRes.hangoutLink ||
      eventRes.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ||
      null

    // --- Premium, branded confirmation email to the LEAD (with .ics) -------
    try {
      const startUtc = new Date(`${startDateTime}${offset}`)
      const endUtc = new Date(startUtc.getTime() + c.durationMin * 60_000)
      const ics = buildIcs({
        uid: eventRes.id ? `${eventRes.id}@zabble.org` : `${requestId}@zabble.org`,
        startUtc,
        endUtc,
        summary: 'Zabble discovery call',
        description: `Your ${c.durationMin}-minute discovery call with Zabble.${meetLink ? `\nJoin: ${meetLink}` : ''}`,
        meetLink,
        organizerEmail: c.salesEmail,
      })
      const mail = renderLeadConfirmationEmail({
        name,
        dateLabel,
        timeLabel,
        timeZoneLabel: tzLabel,
        meetLink,
        profileTitle,
        durationMin: c.durationMin,
      })
      await sendGmail(
        buildRawMime({
          from: c.organizer,
          to: email,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
          ics: { content: ics, filename: 'zabble-call.ics' },
        }),
      )
    } catch (mailErr) {
      // Booking + Meet succeeded; a failed confirmation must not fail the call.
      console.error('[book] Lead confirmation email failed (non-fatal):', mailErr)
    }

    // --- Internal lead-notification email to sales@ (best effort) ----------
    await notifySales(
      `New call booked — ${name}${company ? `, ${company}` : ''}`,
      internalLead({ booked: true, meetLink, htmlLink: eventRes.htmlLink ?? null }),
    )

    return {
      ok: true as const,
      meetLink,
      htmlLink: eventRes.htmlLink ?? null,
      start: { dateTime: startDateTime, dateLabel, timeLabel, timeZone: c.timeZone },
    }
  } catch (err: unknown) {
    console.error('[book] Calendar booking failed:', err)
    return { ok: false as const, reason: 'calendar_failed' as const }
  }
})
