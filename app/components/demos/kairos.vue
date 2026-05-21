<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Activity, AlertCircle, Brain, Building2, Calendar, CalendarCheck, CheckCircle2, Database, Headphones, Mail, MessageSquare, Pause, Phone, PhoneCall, PhoneIncoming, Play, Radio, RotateCcw, Send, Sparkles, TrendingUp, UserCheck, Users, Workflow } from '@lucide/vue'

type Mode = 'event' | 'receptionist'
const mode = ref<Mode>('event')

// =============================================================================
// EVENT MODE — timeline data (T-14 → T+7)
// =============================================================================

type Channel = 'email' | 'sms' | 'whatsapp' | 'call' | 'calendar' | 'system' | 'crm'

interface Touchpoint {
  time: string
  channel: Channel
  label: string
  detail?: string
  count?: number
  reason?: string
}

interface TimelineDay {
  day: number
  label: string
  date: string
  phase: 'pre' | 'day-of' | 'post'
  headline: string
  description: string
  touchpoints: Touchpoint[]
  metric?: { label: string; value: string; sub?: string }
  /** Hard-confirmed count for the pre-event "Confirmed" tile. */
  confirmed?: number
  /** Open rate of the most recent send. Only set on days that did a send. */
  openRatePct?: number
  /** No-show-risk count from the model. Null until the model has signal. */
  riskFlagged?: number
}

// Conference: Adviser Forum 2026 — 783 registrants, day-of on 2026-06-04 (Thu).
// Dates are illustrative; the system runs the same arc regardless of date.
// Counts are deliberately un-rounded — this is one real-shaped example, not a brochure.
const TIMELINE: TimelineDay[] = [
  {
    day: -14, label: 'T-14', date: 'Thu 21 May', phase: 'pre',
    headline: 'Onboarding wave',
    description: 'Confirmation, calendar invite and pre-read pushed to every registrant. Bounces re-route to alternate channels.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'Confirmation + agenda', count: 783, reason: 'Registration intake closed at midnight' },
      { time: '09:00', channel: 'calendar', label: 'Calendar invites attached', count: 783 },
      { time: '13:42', channel: 'system', label: 'Bounces routed to SMS fallback', count: 14, reason: 'Hard-bounce flag from ESP' },
    ],
    metric: { label: 'Opens · day one', value: '61%', sub: '478 of 783' },
    confirmed: 0,
    openRatePct: 61,
  },
  {
    day: -13, label: 'T-13', date: 'Fri 22 May', phase: 'pre',
    headline: 'Inbound parsing · first replies',
    description: 'Reply-to parser turns email replies into structured intent — RSVPs, reschedules, declines.',
    touchpoints: [
      { time: '11:18', channel: 'crm', label: '51 RSVPs locked in', reason: 'Reply-to parser matched intent' },
      { time: '12:47', channel: 'crm', label: '2 reschedule requests auto-applied', reason: 'Free-text matched a known reschedule pattern' },
      { time: '16:30', channel: 'sms', label: 'SMS fallback delivered', count: 14, reason: 'Email bounces from prior day' },
    ],
    metric: { label: 'RSVPs', value: '51', sub: 'Hard yes' },
    confirmed: 51,
  },
  {
    day: -12, label: 'T-12', date: 'Sat 23 May', phase: 'pre',
    headline: 'Weekend send-quiet · inbound only',
    description: 'No outbound on the weekend per the firm\'s contact policy. Inbound is still parsed and logged.',
    touchpoints: [
      { time: '—', channel: 'system', label: 'Policy: weekend send-quiet active' },
      { time: '09:14', channel: 'system', label: 'Corporate auto-responders parsed · ignored', count: 23, reason: 'Out-of-office detected · no follow-up triggered' },
    ],
    metric: { label: 'RSVPs', value: '63' },
    confirmed: 63,
  },
  {
    day: -11, label: 'T-11', date: 'Sun 24 May', phase: 'pre',
    headline: 'Weekend send-quiet · inbound only',
    description: 'No outbound. The system still reads what lands and updates the record.',
    touchpoints: [
      { time: '—', channel: 'system', label: 'Inbound-only mode' },
      { time: '14:02', channel: 'crm', label: '4 reschedules logged · 1 corporate-policy decline', reason: 'Free-text intent matched' },
    ],
    metric: { label: 'RSVPs', value: '71' },
    confirmed: 71,
  },
  {
    day: -10, label: 'T-10', date: 'Mon 25 May', phase: 'pre',
    headline: 'Reminder one',
    description: 'Soft reminder to non-responders, segmented by adviser specialism.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'Reminder one · specialism-segmented', count: 712, reason: '71 non-responder filter applied' },
      { time: '14:12', channel: 'whatsapp', label: 'WhatsApp reminders · intl. attendees', count: 287 },
      { time: '15:36', channel: 'crm', label: 'Ambiguous replies · sent to review queue', count: 4, reason: 'Confidence below threshold · human triage' },
    ],
    metric: { label: 'RSVPs', value: '184' },
    confirmed: 184,
    openRatePct: 38,
  },
  {
    day: -9, label: 'T-9', date: 'Tue 26 May', phase: 'pre',
    headline: 'Speaker bios + session selection',
    description: 'Personalised agenda goes out; attendees pick the two breakout sessions that match their book.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'Personalised agenda', count: 783 },
      { time: '15:48', channel: 'crm', label: 'Session preferences captured', count: 397 },
    ],
    metric: { label: 'Sessions picked', value: '397' },
    confirmed: 247,
    openRatePct: 47,
    riskFlagged: 158,
  },
  {
    day: -8, label: 'T-8', date: 'Wed 27 May', phase: 'pre',
    headline: 'Inbound triage · clarifications',
    description: 'Free-text replies parsed; the ones that need a person land in a tray with the reason already attached.',
    touchpoints: [
      { time: '10:04', channel: 'crm', label: '14 reschedules processed', reason: 'Free-text matched reschedule intent' },
      { time: '13:22', channel: 'email', label: 'Wrong-date clarifications sent', count: 3, reason: 'Reply implied 11 Jun, not 4 Jun' },
    ],
    metric: { label: 'RSVPs', value: '312' },
    confirmed: 312,
    riskFlagged: 144,
  },
  {
    day: -7, label: 'T-7', date: 'Thu 28 May', phase: 'pre',
    headline: 'One-week-out push',
    description: 'Multi-channel reminder; non-responders get a phone call from the AI agent.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'One-week-out reminder', count: 783 },
      { time: '11:30', channel: 'call', label: 'Outbound reminder calls · non-responders', count: 142, reason: 'No engagement in 14 days' },
      { time: '16:22', channel: 'sms', label: 'SMS follow-up · voicemails', count: 87, reason: 'Call routed to voicemail' },
    ],
    metric: { label: 'RSVPs', value: '484' },
    confirmed: 484,
    openRatePct: 52,
    riskFlagged: 142,
  },
  {
    day: -6, label: 'T-6', date: 'Fri 29 May', phase: 'pre',
    headline: 'Hotel + travel logistics',
    description: 'Travel and accommodation guide pushed to attendees flagged as out-of-region.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'Travel + hotel block', count: 258 },
      { time: '14:00', channel: 'whatsapp', label: 'Accessibility offer · opt-in', count: 783 },
    ],
    metric: { label: 'RSVPs', value: '521' },
    confirmed: 521,
    openRatePct: 44,
    riskFlagged: 128,
  },
  {
    day: -5, label: 'T-5', date: 'Sat 30 May', phase: 'pre',
    headline: 'Weekend send-quiet · inbound only',
    description: 'Inbound parsed; declines and dietary updates logged. No outbound.',
    touchpoints: [
      { time: '—', channel: 'system', label: 'Policy: weekend send-quiet active' },
      { time: '10:46', channel: 'system', label: 'Corporate auto-replies ignored · 2 hard declines logged', count: 18 },
    ],
    metric: { label: 'RSVPs', value: '538' },
    confirmed: 538,
    riskFlagged: 112,
  },
  {
    day: -4, label: 'T-4', date: 'Sun 31 May', phase: 'pre',
    headline: 'Weekend send-quiet · inbound only',
    description: 'Inbound only. A dietary update on a Sunday gets the same handling as one on a Tuesday.',
    touchpoints: [
      { time: '—', channel: 'system', label: 'Inbound-only mode' },
      { time: '11:09', channel: 'crm', label: 'Dietary preference updated · 1', reason: 'Reply parsed · field auto-merged' },
    ],
    metric: { label: 'RSVPs', value: '548' },
    confirmed: 548,
    riskFlagged: 104,
  },
  {
    day: -3, label: 'T-3', date: 'Mon 1 Jun', phase: 'pre',
    headline: 'Final RSVP nudge',
    description: 'Last call for non-responders. The system escalates email → SMS → call.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'Final RSVP nudge', count: 213 },
      { time: '11:48', channel: 'system', label: 'Calendar invites bounced from Microsoft tenant · routed to ICS attachment', count: 19, reason: 'Tenant policy blocked external organiser · fallback fired' },
      { time: '13:00', channel: 'sms', label: 'SMS escalation · email un-opened', count: 87 },
      { time: '16:30', channel: 'call', label: 'Outbound calls · still silent', count: 38 },
    ],
    metric: { label: 'RSVPs', value: '612' },
    confirmed: 612,
    openRatePct: 28,
    riskFlagged: 94,
  },
  {
    day: -2, label: 'T-2', date: 'Tue 2 Jun', phase: 'pre',
    headline: 'Parking, venue, accessibility',
    description: 'Practical logistics: parking codes, venue address, accessibility lanes, dietary confirmations.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'Parking + venue map', count: 691 },
      { time: '11:00', channel: 'crm', label: 'Dietary preferences locked in', count: 624 },
      { time: '15:18', channel: 'system', label: 'Catering numbers handed off to venue', reason: 'Threshold reached: 88% confirmed' },
    ],
    metric: { label: 'Hard-confirmed', value: '691' },
    confirmed: 691,
    openRatePct: 67,
    riskFlagged: 86,
  },
  {
    day: -1, label: 'T-1', date: 'Wed 3 Jun', phase: 'pre',
    headline: 'Day-before reminders + at-risk calls',
    description: 'Final reminder to everyone; AI agent calls the 79 attendees the model flagged as no-show-risk.',
    touchpoints: [
      { time: '08:30', channel: 'sms', label: 'Day-before SMS · all confirmed', count: 691 },
      { time: '10:00', channel: 'call', label: 'At-risk reminder calls', count: 79, reason: 'No-show risk score ≥ 0.62' },
      { time: '14:08', channel: 'system', label: 'WhatsApp delivery failed · fell back to SMS', count: 11, reason: 'Number not on WhatsApp · channel fallback fired' },
      { time: '17:00', channel: 'email', label: 'Last-mile directions + QR pass', count: 691 },
    ],
    metric: { label: 'Risk-flagged', value: '79' },
    confirmed: 691,
    openRatePct: 71,
    riskFlagged: 79,
  },
  {
    day: 0, label: 'T-0', date: 'Thu 4 Jun', phase: 'day-of',
    headline: 'Day of · live ops',
    description: 'Doors open. The system runs the registration feed, fires no-show recovery calls in real time, and updates the live dashboard.',
    touchpoints: [
      { time: '07:55', channel: 'system', label: 'Day-of ops switched on' },
      { time: '08:00', channel: 'sms', label: 'Doors-open SMS', count: 691 },
      { time: '08:42', channel: 'call', label: 'Recovery calls placed · running', count: 47, reason: 'Not checked in within 30 min of arrival window' },
      { time: '09:31', channel: 'system', label: 'Declined help on recovery call · marked no-show', count: 16, reason: 'Caller stated they could no longer attend' },
    ],
    metric: { label: 'Checked in', value: '597' },
  },
  {
    day: 1, label: 'T+1', date: 'Fri 5 Jun', phase: 'post',
    headline: 'Thank-you + feedback survey',
    description: 'Personalised thank-you naming the sessions each attendee actually went to. NPS survey + one open question.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'Thank-you · personalised', count: 597 },
      { time: '09:00', channel: 'crm', label: 'NPS survey attached', count: 597 },
      { time: '14:30', channel: 'crm', label: 'Survey responses parsed · sentiment scored', count: 376, reason: 'Free-text classified · sentiment + topic' },
      { time: '15:42', channel: 'crm', label: 'Replies the classifier couldn\'t place · queued for a human', count: 6, reason: 'Confidence below threshold' },
    ],
    metric: { label: 'Survey response', value: '63%' },
  },
  {
    day: 2, label: 'T+2', date: 'Sat 6 Jun', phase: 'post',
    headline: 'Weekend send-quiet · recap queued',
    description: 'Recap queued for Monday send. Inbound replies still parsed.',
    touchpoints: [
      { time: '—', channel: 'system', label: 'Recap queued for Monday send' },
      { time: '12:14', channel: 'crm', label: '7 late survey replies parsed', reason: 'Sentiment scored · attached to attendee record' },
    ],
    metric: { label: 'NPS', value: '+56' },
  },
  {
    day: 3, label: 'T+3', date: 'Sun 7 Jun', phase: 'post',
    headline: 'Weekend send-quiet · inbound only',
    description: 'Inbound parsed and routed. Things that need a human land in a small tray.',
    touchpoints: [
      { time: '—', channel: 'system', label: 'Inbound-only mode' },
      { time: '13:48', channel: 'crm', label: 'Photo permission queries · routed to ops manager', count: 3, reason: 'Intent matched · not auto-resolvable' },
    ],
    metric: { label: 'NPS', value: '+56' },
  },
  {
    day: 4, label: 'T+4', date: 'Mon 8 Jun', phase: 'post',
    headline: 'Recap + hot-attendee detection',
    description: 'Recap email with photos and session recordings. Engagement signals + sentiment classify "hot" attendees for re-engagement.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'Recap · photos + recordings', count: 597 },
      { time: '15:18', channel: 'crm', label: 'Hot attendees flagged', count: 39, reason: 'NPS ≥ 9 + 2+ session-replay clicks' },
    ],
    metric: { label: 'Hot leads', value: '39' },
  },
  {
    day: 5, label: 'T+5', date: 'Tue 9 Jun', phase: 'post',
    headline: 'Re-engagement sequence kicks off',
    description: 'Each hot attendee gets a tailored follow-up referencing the sessions they attended. AI agent books discovery calls.',
    touchpoints: [
      { time: '09:00', channel: 'email', label: 'Personalised follow-up · hot 39', count: 39 },
      { time: '14:00', channel: 'call', label: 'Outbound discovery booking calls', count: 24, reason: 'Email open + role match' },
    ],
    metric: { label: 'Calls booked', value: '15' },
  },
  {
    day: 6, label: 'T+6', date: 'Wed 10 Jun', phase: 'post',
    headline: 'Inbound + reschedule handling',
    description: 'The AI receptionist (same engine, different deployment) handles the inbound spillover from re-engagement.',
    touchpoints: [
      { time: '10:00', channel: 'call', label: 'Inbound calls handled · receptionist', count: 19 },
      { time: '15:00', channel: 'crm', label: 'Calendar adjustments processed', count: 7 },
    ],
    metric: { label: 'Calls booked', value: '22' },
  },
  {
    day: 7, label: 'T+7', date: 'Thu 11 Jun', phase: 'post',
    headline: 'Sales handoff',
    description: 'Fully-qualified hot attendees handed off to the partnerships team with the full Kairos audit trail attached.',
    touchpoints: [
      { time: '09:00', channel: 'crm', label: 'Qualified accounts handed off', count: 11, reason: 'Sales-ready: booked discovery + budget signal' },
      { time: '09:00', channel: 'email', label: 'Internal: pipeline notes to partnerships', count: 11 },
    ],
    metric: { label: 'Pipeline added', value: '£387k' },
  },
]

const dayIndex = ref(0) // 0..21 — index into TIMELINE
const currentDay = computed(() => TIMELINE[dayIndex.value]!)
const phase = computed(() => currentDay.value.phase)

// ---- "Vs. last forum" comparator (small analytics surface) ----
// Q1 Adviser Forum tracked about 11% slower at the same arc point. This is
// the honest comparison the planning team uses to gauge whether the next
// event is on track. Hard-coded ratio — the prior event is fixed history.
const PRIOR_TRACKING_FACTOR = 0.89
const priorConfirmedForDay = computed(() => {
  const c = currentDay.value.confirmed
  return c != null ? Math.round(c * PRIOR_TRACKING_FACTOR).toLocaleString() : '—'
})
const comparePct = computed(() => {
  const c = currentDay.value.confirmed ?? 0
  if (c <= 0) return ''
  const prior = Math.max(1, Math.round(c * PRIOR_TRACKING_FACTOR))
  const delta = c - prior
  const pct = Math.round((delta / prior) * 100)
  return (pct >= 0 ? '▲ +' : '▼ ') + pct + '%'
})

// Cumulative discovery calls booked over the post-event arc. 15 land on T+5,
// another 7 on T+6 → 22 by T+7. Rendered as a running total.
const callsBookedRunning = computed(() => {
  if (dayIndex.value >= 20) return 22
  if (dayIndex.value >= 19) return 15
  return 0
})

function setDayByValue(d: number) {
  const idx = TIMELINE.findIndex((t) => t.day === d)
  if (idx >= 0) dayIndex.value = idx
}

// ---- Timeline auto-play ----
const playing = ref(false)
let playTimer: ReturnType<typeof setInterval> | null = null

function togglePlay() {
  playing.value = !playing.value
  if (playing.value) {
    playTimer = setInterval(() => {
      if (dayIndex.value >= TIMELINE.length - 1) {
        playing.value = false
        if (playTimer) clearInterval(playTimer)
        return
      }
      dayIndex.value += 1
    }, 900)
  } else if (playTimer) {
    clearInterval(playTimer)
  }
}

function resetTimeline() {
  if (playing.value) togglePlay()
  dayIndex.value = 0
}

onBeforeUnmount(() => {
  if (playTimer) clearInterval(playTimer)
  if (callTimer) clearTimeout(callTimer)
})

// ---- Day-of dashboard (only relevant when phase === 'day-of') ----
const checkedIn = ref(0)
const recoveryRunning = ref(0)
const recoverySuccess = ref(0)
const recoveryDeclined = ref(0)

watch(phase, (p) => {
  if (p === 'day-of') {
    animateDayOf()
  } else {
    checkedIn.value = 0
    recoveryRunning.value = 0
    recoverySuccess.value = 0
    recoveryDeclined.value = 0
  }
}, { immediate: false })

function animateDayOf() {
  // 47 recovery calls placed. 31 attendees said "yes, I am coming" and showed
  // up; 16 said they couldn't make it and were marked no-show. Real recovery
  // hovers around two-thirds — not 100% — so that is what the demo shows.
  const targetCheckedIn = 597
  const targetRecoverySuccess = 31
  const targetRecoveryDeclined = 16
  const start = performance.now()
  const dur = 1400
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / dur)
    const eased = 1 - Math.pow(1 - t, 3)
    checkedIn.value = Math.round(targetCheckedIn * eased)
    recoverySuccess.value = Math.round(targetRecoverySuccess * eased)
    recoveryDeclined.value = Math.round(targetRecoveryDeclined * eased)
    recoveryRunning.value = Math.max(0, 5 - Math.floor(eased * 5)) + (t < 1 ? 5 : 0)
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// ---- Recovery call transcript (replayable) ----
interface TranscriptLine {
  speaker: 'ai' | 'human'
  text: string
  delay: number
}

const RECOVERY_TRANSCRIPT: TranscriptLine[] = [
  { speaker: 'ai',    delay: 0,    text: 'Hi Maria, this is Kairos calling on behalf of Adviser Forum. We had you confirmed for today\'s keynote — are you still able to make it?' },
  { speaker: 'human', delay: 2400, text: 'Oh — I\'m running late. Traffic is awful and I can\'t find parking.' },
  { speaker: 'ai',    delay: 2200, text: 'No problem. The keynote starts in 35 minutes. Building 4, doors C — I\'ll text you directions and a code for the overflow lot. Sound good?' },
  { speaker: 'human', delay: 2300, text: 'Yes please, that would help.' },
  { speaker: 'ai',    delay: 1800, text: 'Sent. The host knows you\'re en route. See you there, Maria.' },
]

const visibleTranscript = ref<TranscriptLine[]>([])
let callTimer: ReturnType<typeof setTimeout> | null = null

function playRecoveryCall() {
  visibleTranscript.value = []
  let cumulative = 600
  RECOVERY_TRANSCRIPT.forEach((line) => {
    cumulative += line.delay
    setTimeout(() => {
      if (phase.value === 'day-of') visibleTranscript.value.push(line)
    }, cumulative)
  })
}

watch(phase, (p) => {
  if (p === 'day-of') playRecoveryCall()
})

// ---- Check-in feed (rolling, on day-of) ----
const CHECKIN_FEED = [
  { time: '08:52', name: 'Alex Rourke',  org: 'Northwind Capital',    badge: 'VIP' as const },
  { time: '08:51', name: 'Priya Shah',   org: 'Veridian Logistics',   badge: 'Speaker' as const },
  { time: '08:51', name: 'Dan Kelly',    org: 'Heron Partners',       badge: null },
  { time: '08:50', name: 'Lara Mendez',  org: 'Saffron Bio',          badge: null },
  { time: '08:50', name: 'Mo Iqbal',     org: 'Kestrel Industries',   badge: null },
  { time: '08:49', name: 'Sara Lin',     org: 'Concord Health',       badge: 'Sponsor' as const },
  { time: '08:49', name: 'Tom Bramble',  org: 'Greylock Mfg.',        badge: null },
  { time: '08:48', name: 'Aysha Khan',   org: 'Bluefin Markets',      badge: 'VIP' as const },
]

// =============================================================================
// RECEPTIONIST MODE — call simulation
// =============================================================================

interface ActionEvent {
  time: string
  label: string
  detail?: string
  icon: 'crm' | 'calendar' | 'reason' | 'send' | 'check' | 'phone'
}

interface ReceptionistLine {
  speaker: 'ai' | 'caller'
  text: string
  delay: number
  actions?: ActionEvent[]
}

const RECEPTIONIST_SCRIPT: ReceptionistLine[] = [
  {
    speaker: 'ai',
    delay: 600,
    text: 'Bramley Dental, this is Kairos. How can I help?',
    actions: [
      { time: '14:02:01', label: 'Inbound call accepted', detail: '+44 7700 900 184', icon: 'phone' },
      { time: '14:02:01', label: 'Caller ID matched', detail: 'Adam Hassan · CRM #4821', icon: 'crm' },
      { time: '14:02:02', label: 'Context loaded', detail: 'Last visit 14 Nov · 6-month check-up due', icon: 'reason' },
    ],
  },
  {
    speaker: 'caller',
    delay: 2400,
    text: 'Hi — I\'d like to book a check-up.',
  },
  {
    speaker: 'ai',
    delay: 2000,
    text: 'Of course. I can see you\'re due for your six-month check-up with Dr. Patel — is this Mr. Hassan?',
    actions: [
      { time: '14:02:07', label: 'Intent classified', detail: 'book_appointment · routine_checkup', icon: 'reason' },
      { time: '14:02:07', label: 'Suggested provider', detail: 'Dr. Patel (last-seen continuity)', icon: 'reason' },
    ],
  },
  {
    speaker: 'caller',
    delay: 1700,
    text: 'Yes that\'s me.',
  },
  {
    speaker: 'ai',
    delay: 1700,
    text: 'Great. I have Tuesday the 2nd at 2pm or Thursday the 4th at 4:30pm — both with Dr. Patel, both in your usual slot.',
    actions: [
      { time: '14:02:10', label: 'Calendar queried', detail: 'Dr. Patel · next 14 days · ≥30min slot', icon: 'calendar' },
      { time: '14:02:10', label: 'Slots ranked', detail: 'Filter: prior preference Tue/Thu afternoons', icon: 'reason' },
    ],
  },
  {
    speaker: 'caller',
    delay: 2100,
    text: 'Tuesday 2pm works.',
  },
  {
    speaker: 'ai',
    delay: 1500,
    text: 'Booked. I\'ll send confirmation to the email on file and a reminder the day before. Anything else?',
    actions: [
      { time: '14:02:14', label: 'Appointment created', detail: 'Tue 2 Jun · 14:00 · Dr. Patel · Routine', icon: 'calendar' },
      { time: '14:02:14', label: 'CRM updated', detail: 'next_appointment, last_contact, notes', icon: 'crm' },
      { time: '14:02:15', label: 'Confirmation email queued', detail: 'a.hassan@…  · template: confirm_v3', icon: 'send' },
      { time: '14:02:15', label: 'Reminder scheduled', detail: 'SMS · 1 Jun 09:00', icon: 'send' },
    ],
  },
  {
    speaker: 'caller',
    delay: 1900,
    text: 'Actually — could I bring my son in too? He\'s eight and overdue.',
  },
  {
    speaker: 'ai',
    delay: 2200,
    text: 'I can hold the 14:30 slot for him on the same Tuesday, but a child needs an adult on the account first. I\'ll text you the form and have a coordinator confirm by 5pm today. Shall I hold it?',
    actions: [
      { time: '14:02:24', label: 'Intent classified', detail: 'add_dependent · paediatric', icon: 'reason' },
      { time: '14:02:24', label: 'Confidence below threshold', detail: 'No paediatric flag on account · cannot auto-resolve', icon: 'reason' },
      { time: '14:02:25', label: 'Tentative slot held', detail: 'Tue 2 Jun · 14:30 · expires 17:00 if unconfirmed', icon: 'calendar' },
      { time: '14:02:25', label: 'Escalated to human', detail: 'Coordinator queue · SLA: same-day', icon: 'send' },
    ],
  },
  {
    speaker: 'caller',
    delay: 1800,
    text: 'Yes please. Thanks.',
  },
  {
    speaker: 'ai',
    delay: 1300,
    text: 'Held. The form is on its way, and you\'ll hear from us by five. See you Tuesday, Mr. Hassan.',
    actions: [
      { time: '14:02:30', label: 'Form sent', detail: 'paed_consent_v2 · SMS link · expires 48h', icon: 'send' },
      { time: '14:02:31', label: 'Call ended · 1m 38s', detail: 'Sentiment: positive · resolved: partial · 1 follow-up', icon: 'check' },
    ],
  },
]

const receptionistRunning = ref(false)
const receptionistDone = ref(false)
const visibleCallLines = ref<ReceptionistLine[]>([])
const visibleActions = ref<ActionEvent[]>([])
const receptionistTimers: ReturnType<typeof setTimeout>[] = []

function clearReceptionistTimers() {
  while (receptionistTimers.length) {
    const t = receptionistTimers.pop()
    if (t) clearTimeout(t)
  }
}

function playReceptionist() {
  clearReceptionistTimers()
  visibleCallLines.value = []
  visibleActions.value = []
  receptionistDone.value = false
  receptionistRunning.value = true

  let cumulative = 0
  RECEPTIONIST_SCRIPT.forEach((line, i) => {
    cumulative += line.delay
    receptionistTimers.push(setTimeout(() => {
      visibleCallLines.value.push(line)
      if (line.actions) {
        line.actions.forEach((a, k) => {
          receptionistTimers.push(setTimeout(() => {
            visibleActions.value.push(a)
          }, 200 + k * 220))
        })
      }
      if (i === RECEPTIONIST_SCRIPT.length - 1) {
        receptionistTimers.push(setTimeout(() => {
          receptionistRunning.value = false
          receptionistDone.value = true
        }, 1400))
      }
    }, cumulative))
  })
}

function resetReceptionist() {
  clearReceptionistTimers()
  visibleCallLines.value = []
  visibleActions.value = []
  receptionistRunning.value = false
  receptionistDone.value = false
}

watch(mode, (m, prev) => {
  if (prev === 'receptionist') {
    clearReceptionistTimers()
    receptionistRunning.value = false
  }
  if (m === 'receptionist' && visibleCallLines.value.length === 0) {
    // auto-start the call when the user first switches to the receptionist tab
    playReceptionist()
  }
})

// =============================================================================
// Channel chip / icon helpers
// =============================================================================

function channelLabel(c: Channel): string {
  switch (c) {
    case 'email':    return 'Email'
    case 'sms':      return 'SMS'
    case 'whatsapp': return 'WhatsApp'
    case 'call':     return 'Call'
    case 'calendar': return 'Calendar'
    case 'crm':      return 'CRM'
    case 'system':   return 'System'
  }
}

function channelIcon(c: Channel) {
  switch (c) {
    case 'email':    return Mail
    case 'sms':      return MessageSquare
    case 'whatsapp': return MessageSquare
    case 'call':     return Phone
    case 'calendar': return Calendar
    case 'crm':      return Database
    case 'system':   return Activity
  }
}

function actionIcon(k: ActionEvent['icon']) {
  switch (k) {
    case 'crm':      return Database
    case 'calendar': return Calendar
    case 'reason':   return Brain
    case 'send':     return Send
    case 'check':    return CheckCircle2
    case 'phone':    return PhoneIncoming
  }
}

</script>

<template>
  <div class="kairos-demo">
    <!-- Mode toggle -->
    <header class="kairos-head">
      <div class="kairos-head__lede">
        <span class="kairos-eyebrow">
          <span class="dot" />
          Interactive Demo · Kairos
        </span>
        <p class="kairos-head__sub">
          Same engine. Two deployments. The administrative work runs itself —
          your team handles the work humans should.
        </p>
      </div>

      <div
        class="kairos-toggle"
        role="tablist"
        aria-label="Demo mode"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'event'"
          :class="['kairos-toggle__btn', mode === 'event' && 'is-active']"
          @click="mode = 'event'"
        >
          <CalendarCheck :size="15" :stroke-width="1.9" aria-hidden="true" />
          Event coordinator
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="mode === 'receptionist'"
          :class="['kairos-toggle__btn', mode === 'receptionist' && 'is-active']"
          @click="mode = 'receptionist'"
        >
          <Headphones :size="15" :stroke-width="1.9" aria-hidden="true" />
          AI receptionist
        </button>
      </div>
    </header>

    <!-- ====================================================================
         EVENT COORDINATOR
    ===================================================================== -->
    <section v-if="mode === 'event'" class="kairos-event" aria-label="Event coordinator demo">
      <!-- Sub-header strip: event facts -->
      <div class="kairos-event__strip">
        <div class="kairos-strip__group">
          <span class="kairos-strip__label">Event</span>
          <span class="kairos-strip__value">Adviser Forum 2026 · UK</span>
        </div>
        <div class="kairos-strip__group">
          <span class="kairos-strip__label">Registrants</span>
          <span class="kairos-strip__value">783</span>
        </div>
        <div class="kairos-strip__group">
          <span class="kairos-strip__label">Day of</span>
          <span class="kairos-strip__value">Thu 4 Jun</span>
        </div>
        <div class="kairos-strip__group">
          <span class="kairos-strip__label">Phase</span>
          <span class="kairos-strip__value kairos-strip__value--accent">
            <template v-if="phase === 'pre'">Pre-event</template>
            <template v-else-if="phase === 'day-of'">Day of · live</template>
            <template v-else>Post-event</template>
          </span>
        </div>
      </div>

      <!-- Scrubbable timeline -->
      <div class="kairos-scrub">
        <div class="kairos-scrub__head">
          <div>
            <div class="kairos-scrub__day">{{ currentDay.label }}</div>
            <div class="kairos-scrub__date">{{ currentDay.date }}</div>
          </div>
          <div class="kairos-scrub__controls">
            <button
              type="button"
              :class="['kairos-icon-btn', playing && 'is-active']"
              :aria-label="playing ? 'Pause timeline playback' : 'Play timeline'"
              @click="togglePlay"
            >
              <component :is="playing ? Pause : Play" :size="14" :stroke-width="2" aria-hidden="true" />
              {{ playing ? 'Pause' : 'Play 21 days' }}
            </button>
            <button
              type="button"
              class="kairos-icon-btn kairos-icon-btn--ghost"
              aria-label="Reset timeline to T-14"
              @click="resetTimeline"
            >
              <RotateCcw :size="14" :stroke-width="2" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <!-- Track -->
        <div class="kairos-track-wrap">
          <div class="kairos-track" aria-hidden="true">
            <div
              v-for="(d, i) in TIMELINE"
              :key="d.day"
              :class="[
                'kairos-tick',
                d.phase === 'day-of' && 'kairos-tick--anchor',
                i === dayIndex && 'is-active',
                i < dayIndex && 'is-past',
              ]"
              :style="{ left: `${(i / (TIMELINE.length - 1)) * 100}%` }"
              :title="`${d.label} · ${d.headline}`"
            />
            <div
              class="kairos-track__fill"
              :style="{ width: `${(dayIndex / (TIMELINE.length - 1)) * 100}%` }"
            />
          </div>
          <input
            type="range"
            :min="0"
            :max="TIMELINE.length - 1"
            :value="dayIndex"
            step="1"
            aria-label="Scrub the 21-day timeline from T-14 to T+7"
            class="kairos-range"
            @input="(e) => { dayIndex = Number((e.target as HTMLInputElement).value); if (playing) togglePlay() }"
          />
          <div class="kairos-scale" aria-hidden="true">
            <span>T-14</span>
            <span>T-7</span>
            <span class="kairos-scale__anchor">Day of</span>
            <span>T+3</span>
            <span>T+7</span>
          </div>
        </div>
      </div>

      <!-- Day content -->
      <div class="kairos-grid">
        <!-- Touchpoints feed -->
        <article class="kairos-card kairos-card--feed">
          <header class="kairos-card__head">
            <div>
              <div class="kairos-card__eyebrow">
                <span class="dot" />
                Automated touchpoints
              </div>
              <h3 class="kairos-card__title">{{ currentDay.headline }}</h3>
              <p class="kairos-card__sub">{{ currentDay.description }}</p>
            </div>
            <div
              v-if="currentDay.metric"
              class="kairos-card__metric"
              :title="currentDay.metric.sub"
            >
              <div class="kairos-card__metric-label">{{ currentDay.metric.label }}</div>
              <div class="kairos-card__metric-value">{{ currentDay.metric.value }}</div>
              <div v-if="currentDay.metric.sub" class="kairos-card__metric-sub">
                {{ currentDay.metric.sub }}
              </div>
            </div>
          </header>

          <ul class="kairos-feed">
            <li
              v-for="(t, i) in currentDay.touchpoints"
              :key="i + currentDay.label"
              class="kairos-feed__item"
            >
              <span class="kairos-feed__time">{{ t.time }}</span>
              <span :class="['kairos-feed__chip', `kairos-feed__chip--${t.channel}`]">
                <component :is="channelIcon(t.channel)" :size="13" :stroke-width="2" aria-hidden="true" />
                {{ channelLabel(t.channel) }}
              </span>
              <div class="kairos-feed__body">
                <div class="kairos-feed__label">
                  {{ t.label }}
                  <span v-if="t.count !== undefined" class="kairos-feed__count">
                    · {{ t.count.toLocaleString() }}
                  </span>
                </div>
                <div v-if="t.reason" class="kairos-feed__reason">
                  <Brain :size="11" :stroke-width="2" aria-hidden="true" />
                  {{ t.reason }}
                </div>
              </div>
            </li>
          </ul>
        </article>

        <!-- Right panel — varies by phase -->
        <article class="kairos-card kairos-card--side">
          <!-- PRE-EVENT: rolling status -->
          <template v-if="phase === 'pre'">
            <header class="kairos-card__head kairos-card__head--col">
              <div class="kairos-card__eyebrow">
                <span class="dot" />
                Pre-event status
              </div>
              <h3 class="kairos-card__title">Engagement signals</h3>
            </header>
            <div class="kairos-stats">
              <div class="kairos-stat">
                <Users :size="16" :stroke-width="1.9" class="kairos-stat__icon" />
                <div>
                  <div class="kairos-stat__label">Confirmed</div>
                  <div class="kairos-stat__value">
                    {{ currentDay.confirmed != null ? currentDay.confirmed.toLocaleString() : '—' }}
                  </div>
                </div>
              </div>
              <div class="kairos-stat">
                <TrendingUp :size="16" :stroke-width="1.9" class="kairos-stat__icon" />
                <div>
                  <div class="kairos-stat__label">Open rate · last send</div>
                  <div class="kairos-stat__value">
                    {{ currentDay.openRatePct != null ? currentDay.openRatePct + '%' : '—' }}
                  </div>
                </div>
              </div>
              <div class="kairos-stat">
                <AlertCircle :size="16" :stroke-width="1.9" class="kairos-stat__icon" />
                <div>
                  <div class="kairos-stat__label">No-show risk flagged</div>
                  <div class="kairos-stat__value">
                    {{ currentDay.riskFlagged != null ? currentDay.riskFlagged : '—' }}
                  </div>
                </div>
              </div>
              <div class="kairos-stat">
                <CheckCircle2 :size="16" :stroke-width="1.9" class="kairos-stat__icon" />
                <div>
                  <div class="kairos-stat__label">Channel mix · 7d</div>
                  <div class="kairos-stat__value">Email · SMS · Call</div>
                </div>
              </div>
            </div>

            <div class="kairos-channels">
              <div class="kairos-channel">
                <span class="kairos-channel__label">Email</span>
                <div class="kairos-channel__bar"><div class="kairos-channel__fill" style="width: 64%" /></div>
                <span class="kairos-channel__pct">64%</span>
              </div>
              <div class="kairos-channel">
                <span class="kairos-channel__label">SMS</span>
                <div class="kairos-channel__bar"><div class="kairos-channel__fill" style="width: 21%" /></div>
                <span class="kairos-channel__pct">21%</span>
              </div>
              <div class="kairos-channel">
                <span class="kairos-channel__label">Call</span>
                <div class="kairos-channel__bar"><div class="kairos-channel__fill" style="width: 9%" /></div>
                <span class="kairos-channel__pct">9%</span>
              </div>
              <div class="kairos-channel">
                <span class="kairos-channel__label">WhatsApp</span>
                <div class="kairos-channel__bar"><div class="kairos-channel__fill" style="width: 6%" /></div>
                <span class="kairos-channel__pct">6%</span>
              </div>
            </div>

            <!-- Small "vs. last forum" analytics comparator — an honest read on
                 whether this campaign is tracking ahead of the last one. -->
            <div v-if="(currentDay.confirmed ?? 0) >= 100" class="kairos-compare">
              <TrendingUp :size="13" :stroke-width="2" aria-hidden="true" />
              <span class="kairos-compare__text">
                <strong>{{ comparePct }}</strong>
                vs. Q1 Adviser Forum at the same day — last event had
                <strong>{{ priorConfirmedForDay }}</strong>
                confirmed by {{ currentDay.label }}.
              </span>
            </div>
          </template>

          <!-- DAY-OF: live ops -->
          <template v-else-if="phase === 'day-of'">
            <header class="kairos-card__head kairos-card__head--col">
              <div class="kairos-card__eyebrow kairos-card__eyebrow--live">
                <span class="kairos-live-dot" />
                Day of · live ops
              </div>
              <h3 class="kairos-card__title">Attendance &amp; recovery</h3>
            </header>

            <div class="kairos-dayof">
              <div class="kairos-dayof__row">
                <div class="kairos-dayof__stat">
                  <div class="kairos-dayof__stat-label">Expected</div>
                  <div class="kairos-dayof__stat-value">691</div>
                </div>
                <div class="kairos-dayof__stat kairos-dayof__stat--accent">
                  <div class="kairos-dayof__stat-label">Checked in</div>
                  <div class="kairos-dayof__stat-value">{{ checkedIn }}</div>
                </div>
                <div class="kairos-dayof__stat">
                  <div class="kairos-dayof__stat-label">Recovered</div>
                  <div class="kairos-dayof__stat-value">{{ recoverySuccess }}</div>
                  <div class="kairos-dayof__stat-sub">of 47 called</div>
                </div>
                <div class="kairos-dayof__stat">
                  <div class="kairos-dayof__stat-label">Declined · no-show</div>
                  <div class="kairos-dayof__stat-value">{{ recoveryDeclined }}</div>
                </div>
                <div class="kairos-dayof__stat">
                  <div class="kairos-dayof__stat-label">Calls live</div>
                  <div class="kairos-dayof__stat-value kairos-dayof__stat-value--pulse">
                    {{ recoveryRunning }}
                  </div>
                </div>
              </div>

              <!-- Live AI recovery call -->
              <div class="kairos-call">
                <div class="kairos-call__head">
                  <span class="kairos-call__pill">
                    <PhoneCall :size="12" :stroke-width="2" aria-hidden="true" />
                    Live recovery call · Maria S.
                  </span>
                  <span class="kairos-call__meta">Outbound · 00:34</span>
                </div>
                <ul class="kairos-call__lines">
                  <transition-group name="kairos-bubble" tag="ul">
                    <li
                      v-for="(line, i) in visibleTranscript"
                      :key="i"
                      :class="['kairos-bubble', `kairos-bubble--${line.speaker}`]"
                    >
                      <span class="kairos-bubble__who">
                        {{ line.speaker === 'ai' ? 'Kairos' : 'Maria' }}
                      </span>
                      {{ line.text }}
                    </li>
                  </transition-group>
                  <li v-if="visibleTranscript.length < RECOVERY_TRANSCRIPT.length" class="kairos-typing" aria-label="Speaking">
                    <span /><span /><span />
                  </li>
                </ul>
              </div>

              <!-- Reg desk feed -->
              <div class="kairos-deskfeed">
                <div class="kairos-deskfeed__head">
                  <UserCheck :size="13" :stroke-width="2" aria-hidden="true" />
                  Registration desk · last few
                </div>
                <ul>
                  <li v-for="(c, i) in CHECKIN_FEED.slice(0, 4)" :key="i">
                    <span class="kairos-deskfeed__time">{{ c.time }}</span>
                    <span class="kairos-deskfeed__name">{{ c.name }}</span>
                    <span class="kairos-deskfeed__org">{{ c.org }}</span>
                    <span
                      v-if="c.badge"
                      :class="['kairos-deskfeed__badge', c.badge === 'VIP' && 'is-vip']"
                    >
                      {{ c.badge }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </template>

          <!-- POST-EVENT: feedback + re-engagement -->
          <template v-else>
            <header class="kairos-card__head kairos-card__head--col">
              <div class="kairos-card__eyebrow">
                <span class="dot" />
                Post-event
              </div>
              <h3 class="kairos-card__title">Feedback &amp; re-engagement</h3>
            </header>

            <div class="kairos-post">
              <div class="kairos-post__row">
                <div class="kairos-post__cell">
                  <div class="kairos-post__cell-label">NPS</div>
                  <div class="kairos-post__cell-value">+56</div>
                  <div class="kairos-post__cell-sub">63% response</div>
                </div>
                <div class="kairos-post__cell">
                  <div class="kairos-post__cell-label">Hot attendees</div>
                  <div class="kairos-post__cell-value">{{ dayIndex >= 18 ? 39 : '—' }}</div>
                  <div class="kairos-post__cell-sub">
                    {{ dayIndex >= 18 ? 'Engagement + sentiment' : 'Flagged on T+4' }}
                  </div>
                </div>
                <div class="kairos-post__cell">
                  <div class="kairos-post__cell-label">Calls booked</div>
                  <div class="kairos-post__cell-value">{{ callsBookedRunning }}</div>
                  <div class="kairos-post__cell-sub">
                    {{ dayIndex >= 20 ? '+7 today · by AI agent' : (dayIndex >= 19 ? 'By AI agent' : 'Pending T+5') }}
                  </div>
                </div>
                <div class="kairos-post__cell">
                  <div class="kairos-post__cell-label">Pipeline added</div>
                  <div class="kairos-post__cell-value">{{ dayIndex >= 21 ? '£387k' : '—' }}</div>
                  <div class="kairos-post__cell-sub">Sales-ready</div>
                </div>
              </div>

              <div class="kairos-survey">
                <div class="kairos-survey__head">
                  <MessageSquare :size="13" :stroke-width="2" aria-hidden="true" />
                  Feedback · classified
                </div>
                <ul>
                  <li>
                    <span class="kairos-survey__topic kairos-survey__topic--pos">Sessions</span>
                    "Best breakout I’ve been to all year — concrete, no fluff."
                  </li>
                  <li>
                    <span class="kairos-survey__topic kairos-survey__topic--pos">Hospitality</span>
                    "Front desk was a dream. Felt looked after."
                  </li>
                  <li>
                    <span class="kairos-survey__topic kairos-survey__topic--neg">Catering</span>
                    "Lunch queue was long around 12:45."
                  </li>
                </ul>
              </div>

              <div v-if="dayIndex >= 19" class="kairos-reeng">
                <div class="kairos-reeng__head">
                  <Sparkles :size="13" :stroke-width="2" aria-hidden="true" />
                  Re-engagement · hot 43 queued
                </div>
                <div class="kairos-reeng__bar"><div class="kairos-reeng__fill" :style="{ width: `${Math.min(100, (dayIndex - 18) * 33)}%` }" /></div>
                <div class="kairos-reeng__sub">
                  Personalised by session attended · AI agent books discovery calls
                </div>
              </div>
            </div>
          </template>
        </article>
      </div>
    </section>

    <!-- ====================================================================
         AI RECEPTIONIST
    ===================================================================== -->
    <section v-else class="kairos-recep" aria-label="AI receptionist demo">
      <div class="kairos-recep__strip">
        <div class="kairos-recep__biz">
          <span class="kairos-recep__biz-icon" aria-hidden="true">
            <Building2 :size="18" :stroke-width="1.9" />
          </span>
          <div>
            <div class="kairos-recep__biz-name">Bramley Dental Practice</div>
            <div class="kairos-recep__biz-meta">
              Mon–Fri · 08:00–18:00 · 4 dentists · 1,840 patients on file
            </div>
          </div>
        </div>
        <div class="kairos-recep__pill">
          <Radio :size="12" :stroke-width="2" aria-hidden="true" />
          Inbound · live
        </div>
      </div>

      <div class="kairos-recep__grid">
        <!-- Call panel -->
        <article class="kairos-card kairos-card--call">
          <header class="kairos-card__head">
            <div>
              <div class="kairos-card__eyebrow">
                <span class="dot" />
                Inbound call
              </div>
              <h3 class="kairos-card__title">+44 7700 900 184</h3>
              <p class="kairos-card__sub">Caller ID matched to a record on file. The AI agent answered on ring one.</p>
            </div>
            <div class="kairos-call__controls">
              <button
                type="button"
                :class="['kairos-icon-btn', receptionistRunning && 'is-active']"
                :disabled="receptionistRunning"
                aria-label="Play the inbound call"
                @click="playReceptionist"
              >
                <Play :size="14" :stroke-width="2" aria-hidden="true" />
                {{ receptionistRunning ? 'Playing…' : (receptionistDone ? 'Replay call' : 'Play call') }}
              </button>
              <button
                v-if="receptionistDone || receptionistRunning"
                type="button"
                class="kairos-icon-btn kairos-icon-btn--ghost"
                aria-label="Reset the call"
                @click="resetReceptionist"
              >
                <RotateCcw :size="14" :stroke-width="2" aria-hidden="true" />
                Reset
              </button>
            </div>
          </header>

          <ul class="kairos-call__lines kairos-call__lines--big">
            <transition-group name="kairos-bubble" tag="ul">
              <li
                v-for="(line, i) in visibleCallLines"
                :key="i"
                :class="['kairos-bubble', `kairos-bubble--${line.speaker === 'caller' ? 'human' : 'ai'}`]"
              >
                <span class="kairos-bubble__who">
                  {{ line.speaker === 'ai' ? 'Kairos' : 'Adam Hassan' }}
                </span>
                {{ line.text }}
              </li>
            </transition-group>
            <li v-if="receptionistRunning" class="kairos-typing" aria-label="AI is responding">
              <span /><span /><span />
            </li>
            <li v-if="!receptionistRunning && visibleCallLines.length === 0" class="kairos-callempty">
              <Phone :size="18" :stroke-width="1.9" aria-hidden="true" />
              <span>Ready when you are — press Play to hear how the system handles an inbound call, partial escalation and all.</span>
            </li>
          </ul>
        </article>

        <!-- Reasoning + actions -->
        <article class="kairos-card kairos-card--actions">
          <header class="kairos-card__head kairos-card__head--col">
            <div class="kairos-card__eyebrow">
              <span class="dot" />
              Reasoning + actions
            </div>
            <h3 class="kairos-card__title">What the system did, and why</h3>
            <p class="kairos-card__sub">
              Every step is logged with the reasoning that triggered it — a coordinator can replay the call end to end.
            </p>
          </header>

          <ol class="kairos-actions">
            <transition-group name="kairos-action" tag="ol">
              <li
                v-for="(a, i) in visibleActions"
                :key="i"
                class="kairos-action"
              >
                <span class="kairos-action__time">{{ a.time }}</span>
                <span :class="['kairos-action__icon', a.icon === 'reason' && 'is-reason']" aria-hidden="true">
                  <component :is="actionIcon(a.icon)" :size="14" :stroke-width="2" />
                </span>
                <div class="kairos-action__body">
                  <div class="kairos-action__label">{{ a.label }}</div>
                  <div v-if="a.detail" class="kairos-action__detail">{{ a.detail }}</div>
                </div>
              </li>
            </transition-group>
            <li v-if="visibleActions.length === 0" class="kairos-actions__empty">
              The reasoning log will populate as the call progresses.
            </li>
          </ol>

          <div v-if="receptionistDone" class="kairos-summary">
            <div class="kairos-summary__head">
              <CheckCircle2 :size="14" :stroke-width="2" aria-hidden="true" />
              Partially resolved · 1m 38s · 1 follow-up open
            </div>
            <ul>
              <li><Calendar :size="12" :stroke-width="2" aria-hidden="true" />Appointment booked: Tue 2 Jun, 14:00 · Dr. Patel</li>
              <li><Calendar :size="12" :stroke-width="2" aria-hidden="true" />Tentative slot held: Tue 2 Jun, 14:30 · paediatric · expires 17:00</li>
              <li><Database :size="12" :stroke-width="2" aria-hidden="true" />CRM updated: next_appointment, notes, last_contact</li>
              <li><Send :size="12" :stroke-width="2" aria-hidden="true" />Coordinator queued: same-day SLA · paed_consent_v2 sent to caller</li>
            </ul>
          </div>
        </article>
      </div>

      <p class="kairos-recep__foot">
        <Workflow :size="13" :stroke-width="2" aria-hidden="true" />
        Same engine as Event Coordinator. The deployment is what changes — receptionists, clinics, service businesses, sales lines.
      </p>
    </section>
  </div>
</template>

<style scoped>
/* ---- shell ---- */
.kairos-demo {
  --kairos-radius: 16px;
  --kairos-radius-sm: 10px;
  --kairos-line: #e2e8f0;
  --kairos-surface: #ffffff;
  --kairos-surface-alt: #f6f8fb;
  --kairos-ink: #0a0f1a;
  --kairos-mute: #475569;
  --kairos-mute-2: #64748b;
  --kairos-cyan: #01dbf1;
  --kairos-cyan-deep: #00b8cc;
  --kairos-ease: cubic-bezier(0.22, 1, 0.36, 1);

  background: var(--kairos-surface);
  color: var(--kairos-ink);
  padding: 20px;
}

@media (min-width: 768px) {
  .kairos-demo { padding: 28px; }
}

/* ---- header / mode toggle ---- */
.kairos-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 18px;
}
@media (min-width: 900px) {
  .kairos-head {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }
}

.kairos-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--kairos-cyan-deep);
  font-weight: 600;
}

.kairos-head__sub {
  margin-top: 10px;
  max-width: 50ch;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--kairos-mute);
}

.kairos-toggle {
  display: inline-flex;
  padding: 4px;
  background: var(--kairos-surface-alt);
  border: 1px solid var(--kairos-line);
  border-radius: 9999px;
  align-self: flex-start;
}

.kairos-toggle__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  padding: 9px 16px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--kairos-mute);
  border-radius: 9999px;
  cursor: pointer;
  letter-spacing: -0.005em;
  transition: color 220ms var(--kairos-ease), background 220ms var(--kairos-ease), box-shadow 220ms var(--kairos-ease);
}
.kairos-toggle__btn:hover { color: var(--kairos-ink); }
.kairos-toggle__btn.is-active {
  background: var(--kairos-ink);
  color: white;
  box-shadow: 0 6px 18px -10px rgba(15, 23, 42, 0.32);
}
.kairos-toggle__btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.4);
}

/* ---- event sub-header strip ---- */
.kairos-event__strip {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
  padding: 14px 16px;
  border: 1px solid var(--kairos-line);
  border-radius: var(--kairos-radius-sm);
  background: var(--kairos-surface-alt);
  margin-bottom: 18px;
}
@media (min-width: 768px) {
  .kairos-event__strip { grid-template-columns: repeat(4, 1fr); }
}

.kairos-strip__label {
  display: block;
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kairos-mute-2);
  font-weight: 600;
  margin-bottom: 4px;
}
.kairos-strip__value {
  font-size: 14px;
  color: var(--kairos-ink);
  font-weight: 600;
}
.kairos-strip__value--accent { color: var(--kairos-cyan-deep); }

/* ---- scrubber ---- */
.kairos-scrub {
  border: 1px solid var(--kairos-line);
  border-radius: var(--kairos-radius);
  background: var(--kairos-surface);
  padding: 18px 18px 22px;
  margin-bottom: 18px;
  box-shadow: 0 4px 16px -10px rgba(15, 23, 42, 0.08);
}

.kairos-scrub__head {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
@media (min-width: 640px) {
  .kairos-scrub__head { flex-direction: row; align-items: center; }
}

.kairos-scrub__day {
  font-family: 'Instrument Serif', 'Inter', serif;
  font-size: 36px;
  line-height: 1;
  color: var(--kairos-ink);
  letter-spacing: -0.01em;
}
.kairos-scrub__date {
  margin-top: 4px;
  font-size: 13px;
  color: var(--kairos-mute);
}

.kairos-scrub__controls {
  display: inline-flex;
  gap: 8px;
}

.kairos-icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--kairos-ink);
  background: var(--kairos-surface);
  border: 1px solid var(--kairos-line);
  border-radius: 9999px;
  cursor: pointer;
  transition: border-color 200ms var(--kairos-ease), background 200ms var(--kairos-ease), color 200ms var(--kairos-ease);
}
.kairos-icon-btn:hover { border-color: rgba(15, 23, 42, 0.3); }
.kairos-icon-btn.is-active {
  background: var(--kairos-ink);
  color: white;
  border-color: var(--kairos-ink);
}
.kairos-icon-btn--ghost {
  background: transparent;
  color: var(--kairos-mute);
}
.kairos-icon-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.32);
}
.kairos-icon-btn:disabled { opacity: 0.7; cursor: default; }

/* ---- track ---- */
.kairos-track-wrap {
  position: relative;
  padding-top: 6px;
}

.kairos-track {
  position: relative;
  height: 6px;
  border-radius: 9999px;
  background: var(--kairos-surface-alt);
  border: 1px solid var(--kairos-line);
}

.kairos-track__fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(1, 219, 241, 0.85), rgba(0, 184, 204, 0.95));
  border-radius: 9999px;
  transition: width 220ms var(--kairos-ease);
  pointer-events: none;
}

.kairos-tick {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  margin-top: -4px;
  margin-left: -4px;
  border-radius: 9999px;
  background: white;
  border: 1px solid var(--kairos-line);
  transition: transform 220ms var(--kairos-ease), background 220ms var(--kairos-ease), border-color 220ms var(--kairos-ease);
}
.kairos-tick.is-past {
  background: var(--kairos-cyan);
  border-color: var(--kairos-cyan-deep);
}
.kairos-tick.is-active {
  background: var(--kairos-ink);
  border-color: var(--kairos-ink);
  transform: scale(1.45);
  box-shadow: 0 0 0 5px rgba(1, 219, 241, 0.22);
}
.kairos-tick--anchor {
  width: 12px;
  height: 12px;
  margin-top: -6px;
  margin-left: -6px;
  background: white;
  border: 2px solid var(--kairos-cyan-deep);
  z-index: 1;
}

/* native range thumb on top of the track */
.kairos-range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 28px;
  top: -8px;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 2;
}
.kairos-range::-webkit-slider-thumb {
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: transparent;
}
.kairos-range::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: transparent;
  border: none;
}
.kairos-range:focus-visible {
  outline: none;
}
.kairos-range:focus-visible + .kairos-scale,
.kairos-range:focus-visible ~ .kairos-scale {
  outline: none;
}

.kairos-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--kairos-mute-2);
  font-weight: 600;
}
.kairos-scale__anchor { color: var(--kairos-cyan-deep); }

/* ---- grid layout ---- */
.kairos-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
@media (min-width: 980px) {
  .kairos-grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); }
}

.kairos-card {
  border: 1px solid var(--kairos-line);
  border-radius: var(--kairos-radius);
  background: var(--kairos-surface);
  padding: 20px;
  min-height: 380px;
  box-shadow: 0 4px 16px -10px rgba(15, 23, 42, 0.08);
}
@media (min-width: 768px) {
  .kairos-card { padding: 22px; }
}

.kairos-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}
.kairos-card__head--col {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.kairos-card__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--kairos-cyan-deep);
  font-weight: 600;
}
.kairos-card__eyebrow--live { color: var(--kairos-ink); }

.kairos-card__title {
  margin-top: 6px;
  font-family: 'Instrument Serif', 'Inter', serif;
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.012em;
  color: var(--kairos-ink);
}
@media (min-width: 768px) {
  .kairos-card__title { font-size: 26px; }
}

.kairos-card__sub {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--kairos-mute);
  max-width: 52ch;
}

.kairos-card__metric {
  text-align: right;
  flex-shrink: 0;
  padding: 8px 14px 10px;
  background: var(--kairos-surface-alt);
  border-radius: 10px;
  border: 1px solid var(--kairos-line);
  min-width: 110px;
}
.kairos-card__metric-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--kairos-mute-2);
  font-weight: 600;
}
.kairos-card__metric-value {
  font-family: 'Instrument Serif', 'Inter', serif;
  font-size: 26px;
  line-height: 1.05;
  color: var(--kairos-ink);
}
.kairos-card__metric-sub {
  font-size: 11px;
  color: var(--kairos-mute-2);
  margin-top: 2px;
}

/* ---- touchpoints feed ---- */
.kairos-feed {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kairos-feed__item {
  display: grid;
  grid-template-columns: 56px 110px 1fr;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid var(--kairos-line);
  border-radius: 10px;
  background: var(--kairos-surface);
  transition: border-color 200ms var(--kairos-ease), background 200ms var(--kairos-ease);
}
.kairos-feed__item:hover {
  border-color: rgba(1, 219, 241, 0.35);
  background: rgba(246, 248, 251, 0.5);
}

.kairos-feed__time {
  font-size: 12px;
  color: var(--kairos-mute-2);
  font-variant-numeric: tabular-nums;
  padding-top: 2px;
}

.kairos-feed__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  background: var(--kairos-surface-alt);
  border: 1px solid var(--kairos-line);
  color: var(--kairos-ink);
  width: fit-content;
  height: fit-content;
}
.kairos-feed__chip--email    { color: var(--kairos-cyan-deep); border-color: rgba(1, 219, 241, 0.25); background: rgba(1, 219, 241, 0.08); }
.kairos-feed__chip--call     { background: var(--kairos-ink); color: white; border-color: var(--kairos-ink); }
.kairos-feed__chip--sms,
.kairos-feed__chip--whatsapp { background: rgba(15, 23, 42, 0.04); }
.kairos-feed__chip--crm      { color: var(--kairos-cyan-deep); border-color: rgba(0, 184, 204, 0.3); background: rgba(1, 219, 241, 0.06); }
.kairos-feed__chip--system   { color: var(--kairos-mute-2); }

.kairos-feed__label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--kairos-ink);
  line-height: 1.4;
}
.kairos-feed__count { color: var(--kairos-mute); font-weight: 500; font-variant-numeric: tabular-nums; }

.kairos-feed__reason {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--kairos-mute);
  font-style: italic;
}

@media (max-width: 540px) {
  .kairos-feed__item {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .kairos-feed__time { padding-top: 0; }
}

/* ---- pre-event stats panel ---- */
.kairos-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 6px;
}
.kairos-stat {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid var(--kairos-line);
  border-radius: 10px;
  background: var(--kairos-surface);
}
.kairos-stat__icon { color: var(--kairos-cyan-deep); flex-shrink: 0; margin-top: 2px; }
.kairos-stat__label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--kairos-mute-2);
  font-weight: 600;
}
.kairos-stat__value {
  margin-top: 2px;
  font-size: 16px;
  font-weight: 600;
  color: var(--kairos-ink);
  font-variant-numeric: tabular-nums;
}

.kairos-channels {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* "vs. last forum" comparator — small analytics surface */
.kairos-compare {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid var(--kairos-line);
  border-radius: 10px;
  background: var(--kairos-surface-alt);
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--kairos-mute);
}
.kairos-compare svg {
  color: var(--kairos-cyan-deep);
  flex-shrink: 0;
  margin-top: 3px;
}
.kairos-compare__text strong {
  color: var(--kairos-ink);
  font-weight: 600;
}
.kairos-channel {
  display: grid;
  grid-template-columns: 70px 1fr 40px;
  gap: 10px;
  align-items: center;
}
.kairos-channel__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--kairos-ink);
}
.kairos-channel__bar {
  height: 6px;
  background: var(--kairos-surface-alt);
  border-radius: 9999px;
  border: 1px solid var(--kairos-line);
  overflow: hidden;
}
.kairos-channel__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--kairos-cyan), var(--kairos-cyan-deep));
  border-radius: 9999px;
}
.kairos-channel__pct {
  font-size: 11px;
  text-align: right;
  color: var(--kairos-mute);
  font-variant-numeric: tabular-nums;
}

/* ---- day-of dashboard ---- */
.kairos-dayof { display: flex; flex-direction: column; gap: 14px; }
.kairos-dayof__row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.kairos-dayof__stat-sub {
  margin-top: 4px;
  font-size: 10.5px;
  color: var(--kairos-mute-2);
  letter-spacing: 0.04em;
}
.kairos-dayof__stat {
  padding: 10px 12px;
  border: 1px solid var(--kairos-line);
  border-radius: 10px;
  background: var(--kairos-surface);
}
.kairos-dayof__stat--accent {
  background: rgba(1, 219, 241, 0.06);
  border-color: rgba(1, 219, 241, 0.3);
}
.kairos-dayof__stat-label {
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kairos-mute-2);
  font-weight: 600;
}
.kairos-dayof__stat-value {
  margin-top: 4px;
  font-family: 'Instrument Serif', 'Inter', serif;
  font-size: 22px;
  line-height: 1;
  color: var(--kairos-ink);
  font-variant-numeric: tabular-nums;
}
.kairos-dayof__stat-value--pulse {
  position: relative;
  color: var(--kairos-cyan-deep);
}

/* live call inside day-of */
.kairos-call {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--kairos-line);
  background: var(--kairos-surface-alt);
}
.kairos-call__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.kairos-call__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: var(--kairos-ink);
  padding: 4px 10px;
  border-radius: 9999px;
}
.kairos-call__meta {
  font-size: 11px;
  color: var(--kairos-mute);
  font-variant-numeric: tabular-nums;
}

.kairos-call__lines {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
  scroll-behavior: smooth;
}
.kairos-call__lines--big {
  max-height: 360px;
  min-height: 180px;
}

.kairos-bubble {
  padding: 8px 12px;
  font-size: 13.5px;
  line-height: 1.5;
  border-radius: 12px;
  max-width: 90%;
}
.kairos-bubble__who {
  display: block;
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 3px;
  opacity: 0.7;
}
.kairos-bubble--ai {
  align-self: flex-start;
  background: rgba(1, 219, 241, 0.1);
  color: var(--kairos-ink);
  border: 1px solid rgba(1, 219, 241, 0.28);
}
.kairos-bubble--ai .kairos-bubble__who { color: var(--kairos-cyan-deep); }
.kairos-bubble--human {
  align-self: flex-end;
  background: var(--kairos-surface);
  border: 1px solid var(--kairos-line);
}

.kairos-typing {
  display: inline-flex;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(1, 219, 241, 0.08);
  border: 1px solid rgba(1, 219, 241, 0.2);
  width: fit-content;
  align-self: flex-start;
}
.kairos-typing span {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--kairos-cyan-deep);
  animation: kairosTyping 1.4s infinite var(--kairos-ease);
}
.kairos-typing span:nth-child(2) { animation-delay: 0.18s; }
.kairos-typing span:nth-child(3) { animation-delay: 0.36s; }

@keyframes kairosTyping {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%           { transform: translateY(-3px); opacity: 1; }
}

.kairos-callempty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px;
  color: var(--kairos-mute);
  font-size: 13.5px;
  border: 1px dashed var(--kairos-line);
  border-radius: 12px;
  justify-content: center;
}

/* desk feed inside day-of */
.kairos-deskfeed {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--kairos-line);
  background: var(--kairos-surface);
}
.kairos-deskfeed__head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kairos-mute-2);
  font-weight: 600;
  margin-bottom: 8px;
}
.kairos-deskfeed ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.kairos-deskfeed li {
  display: grid;
  grid-template-columns: 46px 1fr 1fr auto;
  gap: 8px;
  align-items: center;
  font-size: 12.5px;
  color: var(--kairos-ink);
}
.kairos-deskfeed__time { color: var(--kairos-mute-2); font-variant-numeric: tabular-nums; }
.kairos-deskfeed__name { font-weight: 600; }
.kairos-deskfeed__org { color: var(--kairos-mute); }
.kairos-deskfeed__badge {
  display: inline-flex;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--kairos-surface-alt);
  border: 1px solid var(--kairos-line);
  color: var(--kairos-mute-2);
}
.kairos-deskfeed__badge.is-vip {
  color: var(--kairos-cyan-deep);
  border-color: rgba(1, 219, 241, 0.3);
  background: rgba(1, 219, 241, 0.08);
}

/* ---- post-event ---- */
.kairos-post { display: flex; flex-direction: column; gap: 14px; }
.kairos-post__row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 640px) {
  .kairos-post__row { grid-template-columns: repeat(4, 1fr); }
}
.kairos-post__cell {
  padding: 12px;
  border: 1px solid var(--kairos-line);
  border-radius: 10px;
  background: var(--kairos-surface);
}
.kairos-post__cell-label {
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kairos-mute-2);
  font-weight: 600;
}
.kairos-post__cell-value {
  margin-top: 4px;
  font-family: 'Instrument Serif', 'Inter', serif;
  font-size: 22px;
  color: var(--kairos-ink);
  font-variant-numeric: tabular-nums;
}
.kairos-post__cell-sub {
  margin-top: 2px;
  font-size: 11px;
  color: var(--kairos-mute);
}

.kairos-survey {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--kairos-line);
  background: var(--kairos-surface);
}
.kairos-survey__head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kairos-mute-2);
  font-weight: 600;
  margin-bottom: 10px;
}
.kairos-survey ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.kairos-survey li {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 10px;
  align-items: start;
  font-size: 13px;
  color: var(--kairos-ink);
  line-height: 1.5;
  font-style: italic;
}
.kairos-survey__topic {
  font-style: normal;
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid var(--kairos-line);
  background: var(--kairos-surface-alt);
  color: var(--kairos-mute);
  height: fit-content;
  text-align: center;
}
.kairos-survey__topic--pos { color: var(--kairos-cyan-deep); border-color: rgba(1, 219, 241, 0.3); background: rgba(1, 219, 241, 0.08); }
.kairos-survey__topic--neg { color: #b45309; border-color: rgba(180, 83, 9, 0.3); background: rgba(180, 83, 9, 0.06); }

.kairos-reeng {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--kairos-line);
  background: var(--kairos-surface-alt);
}
.kairos-reeng__head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kairos-cyan-deep);
  font-weight: 600;
  margin-bottom: 8px;
}
.kairos-reeng__bar {
  height: 6px;
  background: var(--kairos-surface);
  border: 1px solid var(--kairos-line);
  border-radius: 9999px;
  overflow: hidden;
}
.kairos-reeng__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--kairos-cyan), var(--kairos-cyan-deep));
  transition: width 320ms var(--kairos-ease);
}
.kairos-reeng__sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--kairos-mute);
}

/* ---- receptionist mode ---- */
.kairos-recep__strip {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 16px;
  background: var(--kairos-surface-alt);
  border: 1px solid var(--kairos-line);
  border-radius: var(--kairos-radius-sm);
  margin-bottom: 18px;
}
@media (min-width: 640px) {
  .kairos-recep__strip { flex-direction: row; align-items: center; }
}

.kairos-recep__biz {
  display: flex;
  align-items: center;
  gap: 12px;
}
.kairos-recep__biz-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(1, 219, 241, 0.08);
  color: var(--kairos-cyan-deep);
  border: 1px solid rgba(1, 219, 241, 0.25);
}
.kairos-recep__biz-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--kairos-ink);
}
.kairos-recep__biz-meta {
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--kairos-mute);
}

.kairos-recep__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: white;
  background: var(--kairos-ink);
  padding: 5px 12px;
  border-radius: 9999px;
}
.kairos-recep__pill svg { animation: kairosLivePulse 2.4s infinite var(--kairos-ease); }

@keyframes kairosLivePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.65; transform: scale(0.92); }
}

.kairos-recep__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
@media (min-width: 980px) {
  .kairos-recep__grid { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); }
}

.kairos-call__controls {
  display: inline-flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ---- actions log ---- */
.kairos-actions {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.kairos-action {
  display: grid;
  grid-template-columns: 70px 32px 1fr;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid var(--kairos-line);
  border-radius: 10px;
  background: var(--kairos-surface);
}
.kairos-action__time {
  font-size: 11px;
  color: var(--kairos-mute-2);
  font-variant-numeric: tabular-nums;
  padding-top: 5px;
}
.kairos-action__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--kairos-surface-alt);
  border: 1px solid var(--kairos-line);
  color: var(--kairos-cyan-deep);
}
.kairos-action__icon.is-reason {
  background: rgba(1, 219, 241, 0.08);
  border-color: rgba(1, 219, 241, 0.3);
}
.kairos-action__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--kairos-ink);
  line-height: 1.4;
}
.kairos-action__detail {
  margin-top: 2px;
  font-size: 12px;
  color: var(--kairos-mute);
  line-height: 1.45;
}

.kairos-actions__empty {
  text-align: center;
  font-size: 13px;
  color: var(--kairos-mute);
  padding: 24px 12px;
  border: 1px dashed var(--kairos-line);
  border-radius: 10px;
  font-style: italic;
}

.kairos-summary {
  margin-top: 14px;
  padding: 12px 14px;
  background: rgba(1, 219, 241, 0.06);
  border: 1px solid rgba(1, 219, 241, 0.25);
  border-radius: 10px;
}
.kairos-summary__head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kairos-cyan-deep);
  font-weight: 600;
  margin-bottom: 8px;
}
.kairos-summary ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.kairos-summary li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--kairos-ink);
}
.kairos-summary li svg { color: var(--kairos-cyan-deep); flex-shrink: 0; }

.kairos-recep__foot {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--kairos-mute);
  font-style: italic;
}
.kairos-recep__foot svg { color: var(--kairos-cyan-deep); }

/* ---- enter transitions for streamed content ---- */
.kairos-bubble-enter-active,
.kairos-action-enter-active {
  transition: opacity 320ms var(--kairos-ease), transform 320ms var(--kairos-ease);
}
.kairos-bubble-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.kairos-action-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}

/* live tick on day-of stat */
@keyframes kairosCallsPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}
.kairos-dayof__stat-value--pulse { animation: kairosCallsPulse 1.8s infinite var(--kairos-ease); }

/* live dot for day-of eyebrow */
.kairos-live-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--kairos-cyan);
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.18);
  animation: kairosLivePulse 1.8s infinite var(--kairos-ease);
}

@media (prefers-reduced-motion: reduce) {
  .kairos-typing span,
  .kairos-recep__pill svg,
  .kairos-dayof__stat-value--pulse,
  .kairos-live-dot {
    animation: none !important;
  }
  .kairos-bubble-enter-active,
  .kairos-action-enter-active {
    transition: opacity 1ms;
  }
  .kairos-bubble-enter-from,
  .kairos-action-enter-from {
    transform: none;
  }
}

/* ---- mobile overrides (<=640px) ---- */
@media (max-width: 640px) {
  .kairos-demo { padding: 14px; }

  .kairos-toggle { align-self: stretch; }
  .kairos-toggle__btn { flex: 1; padding: 9px 10px; justify-content: center; }

  .kairos-event__strip { padding: 12px 12px; gap: 10px 14px; }
  .kairos-strip__value { font-size: 13px; }

  .kairos-scrub { padding: 14px 14px 18px; }
  .kairos-scrub__day { font-size: 28px; }
  .kairos-scrub__controls { flex-wrap: wrap; }
  .kairos-icon-btn { padding: 7px 12px; font-size: 12.5px; }

  .kairos-card { padding: 16px; min-height: 0; }
  .kairos-card__head { gap: 12px; }
  .kairos-card__metric { min-width: 0; padding: 8px 10px 10px; }
  .kairos-card__title { font-size: 22px; }

  .kairos-bubble { max-width: 100%; }

  .kairos-dayof__row { grid-template-columns: repeat(2, 1fr); }

  .kairos-call__head { flex-wrap: wrap; gap: 6px; }
  .kairos-call__pill { font-size: 10.5px; padding: 4px 8px; }

  .kairos-deskfeed li {
    grid-template-columns: 46px 1fr auto;
    grid-template-rows: auto auto;
    row-gap: 2px;
  }
  .kairos-deskfeed__org {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
    font-size: 11.5px;
  }

  .kairos-action { grid-template-columns: 56px 28px 1fr; padding: 10px; }
  .kairos-action__time { font-size: 10.5px; }

  .kairos-channel { grid-template-columns: 60px 1fr 36px; }
  .kairos-channel__label { font-size: 11.5px; }

  .kairos-feed__item { padding: 10px; }

  .kairos-recep__strip { padding: 12px; }
  .kairos-recep__biz-icon { width: 34px; height: 34px; }
}

@media (max-width: 380px) {
  .kairos-action { grid-template-columns: 48px 26px 1fr; gap: 8px; }
  .kairos-deskfeed li { font-size: 12px; }
  .kairos-survey li { grid-template-columns: 72px 1fr; font-size: 12.5px; }
}
</style>
