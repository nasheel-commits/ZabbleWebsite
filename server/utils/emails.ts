// ---------------------------------------------------------------------------
// Email rendering for the booking flow.
//   • renderLeadConfirmationEmail, the premium, branded confirmation the
//     prospect receives after booking (HTML + plain-text + subject).
//   • buildIcs, a calendar attachment so they can add it in one tap.
//   • buildRawMime, assembles a Gmail-API "raw" message (multipart, with an
//     optional .ics attachment), base64url-encoded.
// Nitro auto-imports these into server routes.
// ---------------------------------------------------------------------------

// --- Brand tokens (mirrors app/assets/css/main.css) ------------------------
const INK = '#0a0f1a'
const INK_SOFT = '#1f2937'
const MUTE = '#475569'
const MUTE_2 = '#64748b'
const CYAN = '#01DBF1'
const CYAN_DEEP = '#00b8cc'
const LINE = '#e6ecf3'
const BG = '#eef2f7'
const TINT = '#ecfeff'

const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
// Email-safe serif that echoes the brand display face (Instrument Serif).
const SERIF = "Georgia,'Times New Roman',Times,serif"

function firstNameOf(name: string): string {
  const n = (name || '').trim().split(/\s+/)[0]
  return n || 'there'
}

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface LeadEmailData {
  name: string
  dateLabel: string
  timeLabel: string
  timeZoneLabel: string // human label, e.g. "SAST · UTC+2"
  meetLink: string | null
  profileTitle: string
  durationMin: number
}

export function renderLeadConfirmationEmail(d: LeadEmailData): {
  subject: string
  html: string
  text: string
} {
  const first = firstNameOf(d.name)
  const whenLine = `${d.dateLabel}${d.timeLabel ? ` · ${d.timeLabel}` : ''}`
  const profile = (d.profileTitle || '').replace(/\.$/, '')
  const subject = `You're booked in, your Zabble call, ${d.dateLabel}`

  // --- Plain-text fallback (always present) --------------------------------
  const text = [
    `You're booked in, ${first}.`,
    '',
    `Your ${d.durationMin}-minute discovery call with Zabble is confirmed.`,
    '',
    `When:  ${whenLine} (${d.timeZoneLabel})`,
    `Where: Google Meet${d.meetLink ? `, ${d.meetLink}` : ' (link in your calendar invite)'}`,
    profile ? `\nWhat we'll dig into: ${profile}.` : '',
    '',
    "What to expect, no slide deck, no pitch. A real conversation about where",
    "your operations are straining, and you'll leave with a clear first move",
    'whether or not we work together.',
    '',
    'Need to move it? Just reply to this email.',
    '',
    '- The Zabble team',
    'sales@zabble.org · zabble.org',
  ]
    .filter((l) => l !== '')
    .join('\n')

  // --- Premium HTML --------------------------------------------------------
  const meetButton = d.meetLink
    ? `<a href="${esc(d.meetLink)}" style="display:inline-block;background:${CYAN};color:${INK};text-decoration:none;font-weight:700;font-size:15px;line-height:1;padding:15px 28px;border-radius:9999px;font-family:${SANS};">Join with Google Meet &rarr;</a>`
    : `<span style="font-family:${SANS};font-size:14px;color:${MUTE};">The Google Meet link is in your calendar invite.</span>`

  const profileBlock = profile
    ? `<tr><td style="padding:0 36px;">
         <div style="border-top:1px solid ${LINE};padding-top:26px;">
           <div style="font-family:${SANS};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${CYAN_DEEP};font-weight:700;">What we'll dig into</div>
           <div style="font-family:${SERIF};font-size:21px;line-height:1.4;color:${INK};margin-top:10px;">${esc(profile)}.</div>
           <div style="font-family:${SANS};font-size:14px;line-height:1.65;color:${MUTE};margin-top:10px;">That's our read from your answers, a starting point. On the call we'll map the wider operational picture, which is usually broader than a short form can capture.</div>
         </div>
       </td></tr>`
    : ''

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BG};">Your ${d.durationMin}-minute discovery call with Zabble is confirmed, ${esc(whenLine)}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px -32px rgba(15,23,42,0.28);">
        <!-- accent bar -->
        <tr><td style="height:4px;background:${CYAN};background:linear-gradient(90deg,${CYAN},${CYAN_DEEP});font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- header -->
        <tr><td style="padding:30px 36px 0 36px;">
          <span style="font-family:${SERIF};font-size:25px;font-weight:700;color:${INK};letter-spacing:-0.01em;">Zabble</span>
          <span style="font-family:${SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${MUTE_2};font-weight:700;margin-left:10px;">Bespoke Digital Systems</span>
        </td></tr>

        <!-- hero -->
        <tr><td style="padding:26px 36px 8px 36px;">
          <div style="font-family:${SANS};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${CYAN_DEEP};font-weight:700;">Booking confirmed</div>
          <div style="font-family:${SERIF};font-size:34px;line-height:1.12;color:${INK};margin-top:12px;">You're booked in, ${esc(first)}.</div>
          <div style="font-family:${SANS};font-size:16px;line-height:1.6;color:${MUTE};margin-top:14px;">Your ${d.durationMin}-minute discovery call with Zabble is locked in. Everything you need is below.</div>
        </td></tr>

        <!-- details card -->
        <tr><td style="padding:24px 36px 6px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${TINT};border:1px solid ${LINE};border-radius:14px;">
            <tr><td style="padding:22px 24px;">
              <div style="font-family:${SANS};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${MUTE_2};font-weight:700;">When</div>
              <div style="font-family:${SERIF};font-size:22px;line-height:1.3;color:${INK};margin-top:6px;">${esc(whenLine)}</div>
              <div style="font-family:${SANS};font-size:13px;color:${MUTE};margin-top:4px;">${esc(d.timeZoneLabel)} &nbsp;·&nbsp; ${d.durationMin} minutes</div>

              <div style="height:18px;line-height:18px;font-size:0;">&nbsp;</div>

              <div style="font-family:${SANS};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${MUTE_2};font-weight:700;">Where</div>
              <div style="margin-top:12px;">${meetButton}</div>
            </td></tr>
          </table>
        </td></tr>

        <!-- what to expect -->
        <tr><td style="padding:24px 36px 6px 36px;">
          <div style="font-family:${SANS};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${CYAN_DEEP};font-weight:700;">What to expect</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            <tr><td style="font-family:${SANS};font-size:15px;line-height:1.6;color:${INK_SOFT};padding:6px 0;"><span style="color:${CYAN_DEEP};font-weight:700;">·</span>&nbsp; No slide deck and no pitch, a real conversation.</td></tr>
            <tr><td style="font-family:${SANS};font-size:15px;line-height:1.6;color:${INK_SOFT};padding:6px 0;"><span style="color:${CYAN_DEEP};font-weight:700;">·</span>&nbsp; We dig into where your operations are actually straining.</td></tr>
            <tr><td style="font-family:${SANS};font-size:15px;line-height:1.6;color:${INK_SOFT};padding:6px 0;"><span style="color:${CYAN_DEEP};font-weight:700;">·</span>&nbsp; You leave with a clear first move, work with us or not.</td></tr>
          </table>
        </td></tr>

        ${profileBlock}

        <!-- reschedule -->
        <tr><td style="padding:26px 36px 0 36px;">
          <div style="font-family:${SANS};font-size:14px;line-height:1.6;color:${MUTE};">Need to move it? Just reply to this email and we'll find a better time.</div>
        </td></tr>

        <!-- sign off -->
        <tr><td style="padding:22px 36px 30px 36px;">
          <div style="font-family:${SERIF};font-size:17px;color:${INK};">- The Zabble team</div>
        </td></tr>

        <!-- footer -->
        <tr><td style="padding:20px 36px 30px 36px;border-top:1px solid ${LINE};">
          <div style="font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTE_2};">
            Zabble · <a href="mailto:sales@zabble.org" style="color:${MUTE_2};text-decoration:underline;">sales@zabble.org</a> · <a href="https://zabble.org" style="color:${MUTE_2};text-decoration:underline;">zabble.org</a><br>
            You're receiving this because you booked a discovery call at zabble.org.
          </div>
        </td></tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`

  return { subject, html, text }
}

// --- .ics calendar attachment ----------------------------------------------
export interface IcsData {
  uid: string
  startUtc: Date
  endUtc: Date
  summary: string
  description: string
  meetLink: string | null
  organizerEmail: string
}

function icsStamp(d: Date): string {
  // YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function icsEscape(s: string): string {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

export function buildIcs(d: IcsData): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zabble//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${d.uid}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(d.startUtc)}`,
    `DTEND:${icsStamp(d.endUtc)}`,
    `SUMMARY:${icsEscape(d.summary)}`,
    `DESCRIPTION:${icsEscape(d.description)}`,
    d.meetLink ? `LOCATION:${icsEscape(d.meetLink)}` : '',
    d.meetLink ? `URL:${icsEscape(d.meetLink)}` : '',
    `ORGANIZER;CN=Zabble:mailto:${d.organizerEmail}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Zabble discovery call',
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((l) => l !== '')
  return lines.join('\r\n')
}

// --- MIME assembly for the Gmail API ---------------------------------------
function b64(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64').replace(/(.{76})/g, '$1\r\n')
}
function b64Url(s: string): string {
  return Buffer.from(s, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
function encodeSubject(s: string): string {
  return `=?UTF-8?B?${Buffer.from(s, 'utf-8').toString('base64')}?=`
}

export interface RawMimeOpts {
  from: string
  to: string
  subject: string
  text: string
  html?: string
  ics?: { content: string; filename?: string }
}

/** Build a base64url-encoded MIME message for gmail.users.messages.send. */
export function buildRawMime(o: RawMimeOpts): string {
  const headers = (extra: string[]) =>
    [
      `From: Zabble <${o.from}>`,
      `To: ${o.to}`,
      `Subject: ${encodeSubject(o.subject)}`,
      'MIME-Version: 1.0',
      ...extra,
    ].join('\r\n')

  const altBoundary = `alt_${globalThis.crypto.randomUUID()}`
  const altPart = () =>
    [
      `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
      '',
      `--${altBoundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      b64(o.text),
      '',
      `--${altBoundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      b64(o.html || `<pre>${esc(o.text)}</pre>`),
      '',
      `--${altBoundary}--`,
    ].join('\r\n')

  let message: string

  if (o.ics) {
    const mixBoundary = `mix_${globalThis.crypto.randomUUID()}`
    const filename = o.ics.filename || 'zabble-call.ics'
    message = [
      headers([`Content-Type: multipart/mixed; boundary="${mixBoundary}"`]),
      '',
      `--${mixBoundary}`,
      altPart(),
      '',
      `--${mixBoundary}`,
      `Content-Type: text/calendar; charset="UTF-8"; method=PUBLISH; name="${filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${filename}"`,
      '',
      b64(o.ics.content),
      '',
      `--${mixBoundary}--`,
    ].join('\r\n')
  } else if (o.html) {
    message = [headers([]), '', altPart()].join('\r\n')
  } else {
    message = [
      headers([
        'Content-Type: text/plain; charset="UTF-8"',
        'Content-Transfer-Encoding: base64',
      ]),
      '',
      b64(o.text),
    ].join('\r\n')
  }

  return b64Url(message)
}
