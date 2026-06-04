import { JWT } from 'google-auth-library'

// ---------------------------------------------------------------------------
// Shared Google booking helpers, used by /api/book and /api/availability.
// Nitro auto-imports everything exported here into server routes.
// ---------------------------------------------------------------------------

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.send',
]

export interface BookingConfig {
  clientEmail: string
  privateKey: string
  organizer: string
  salesEmail: string
  timeZone: string
  durationMin: number
}

/**
 * Read + normalise the booking runtime config. Returns null when the Google
 * service-account credentials aren't set, which callers treat as the graceful
 * "not configured" path.
 */
export function readBookingConfig(): BookingConfig | null {
  const cfg = useRuntimeConfig()
  const clientEmail = cfg.googleClientEmail as string
  const rawKey = cfg.googlePrivateKey as string
  if (!clientEmail || !rawKey) return null
  const organizer = cfg.googleImpersonatedUser as string
  return {
    clientEmail,
    // Env-stored keys carry literal "\n"; restore real newlines.
    privateKey: rawKey.replace(/\\n/g, '\n'),
    organizer,
    salesEmail: (cfg.salesNotifyEmail as string) || organizer,
    timeZone: (cfg.bookingTimezone as string) || 'Africa/Johannesburg',
    durationMin: parseInt(String(cfg.bookingDurationMinutes || '30'), 10) || 30,
  }
}

/** Mint an OAuth access token for the service account, impersonating the organizer. */
export async function getGoogleToken(c: BookingConfig): Promise<string | null> {
  const auth = new JWT({
    email: c.clientEmail,
    key: c.privateKey,
    scopes: SCOPES,
    subject: c.organizer,
  })
  const { token } = await auth.getAccessToken()
  return token || null
}

/**
 * UTC offset (e.g. "+02:00") for an IANA zone on a given date. Africa/Johannesburg
 * has no DST so this is constant, but computing it keeps the code correct if the
 * configured zone ever changes to one that observes DST.
 */
export function offsetForZone(timeZone: string, atISODate: string): string {
  try {
    const d = new Date(`${atISODate}T12:00:00Z`)
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    }).formatToParts(d)
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT+00:00'
    const m = /GMT([+-]\d{2}):?(\d{2})?/.exec(tzName)
    if (!m) return '+00:00'
    return `${m[1]}:${m[2] || '00'}`
  } catch {
    return '+00:00'
  }
}

export interface BusyInterval {
  start: string
  end: string
}

/** Query the FreeBusy API for the busy intervals on a calendar within a window. */
export async function getBusyIntervals(
  token: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
  timeZone: string,
): Promise<BusyInterval[]> {
  const res = await $fetch<{
    calendars?: Record<string, { busy?: BusyInterval[] }>
  }>('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: { timeMin, timeMax, timeZone, items: [{ id: calendarId }] },
  })
  return res.calendars?.[calendarId]?.busy ?? []
}

/** Half-open interval overlap test on epoch millis. */
export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart
}
