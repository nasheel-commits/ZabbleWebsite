// ---------------------------------------------------------------------------
// GET /api/availability?date=YYYY-MM-DD
// Returns sales@zabble.org's busy intervals for the given day so the lead-form
// time picker can hide slots that already have something on the calendar.
//
// Response (configured):  { ok: true, offset, durationMin, busy: [{start,end}] }
// Response (no creds):    { ok: false, reason: 'not_configured' }
// On any lookup failure it returns ok:false and the UI leaves all slots open -
// availability is a convenience guard; the booking endpoint re-checks for real.
// ---------------------------------------------------------------------------

export default defineEventHandler(async (event) => {
  const date = String(getQuery(event).date || '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or missing date.' })
  }

  const c = readBookingConfig()
  if (!c) return { ok: false as const, reason: 'not_configured' as const }

  try {
    const token = await getGoogleToken(c)
    if (!token) return { ok: false as const, reason: 'auth_failed' as const }

    const offset = offsetForZone(c.timeZone, date)
    const busy = await getBusyIntervals(
      token,
      c.organizer,
      `${date}T00:00:00${offset}`,
      `${date}T23:59:59${offset}`,
      c.timeZone,
    )
    return { ok: true as const, offset, durationMin: c.durationMin, busy }
  } catch (err) {
    console.error('[availability] FreeBusy lookup failed:', err)
    return { ok: false as const, reason: 'lookup_failed' as const }
  }
})
