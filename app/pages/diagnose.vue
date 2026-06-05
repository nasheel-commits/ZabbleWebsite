<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Video,
  Workflow,
  ShieldCheck,
  Radar,
  BarChart3,
  Layers,
} from '@lucide/vue'

// Use-case / lead-capture page (S02 on-page). Question-led intent: "how do I
// know which system my business needs", an AEO asset. Canonical /diagnose.
usePageSeo({
  title: 'Diagnose Your Operations',
  description:
    "A free 2-minute diagnostic that finds the operational problem costing your business the most, and the kind of system that fixes it.",
  path: '/diagnose',
  ogType: 'website',
  primaryKeyword: 'business operations diagnostic',
})

// Measurement (S09). generate_lead fires on contact capture; schedule_call
// fires when the call is booked (see submitContact).
const analytics = useAnalytics()

type StepKey =
  | 'businessType'
  | 'primaryPain'
  | 'cost'
  | 'tried'
  | 'timeline'
  | 'decisionAuthority'
  | 'contact'

interface OptionDef {
  value: string
  label: string
  sub?: string
}

interface StepDef {
  key: StepKey
  question: string
  helper?: string
  options?: OptionDef[]
}

const totalSteps = 7

const stepDefs: StepDef[] = [
  {
    key: 'businessType',
    question: 'Which best describes your business?',
    helper: "Pick the closest fit. We work across all of them.",
    options: [
      { value: 'small', label: 'Small business', sub: 'Under 50 people' },
      { value: 'mid', label: 'Mid-sized', sub: '50–500 people' },
      { value: 'large', label: 'Large enterprise', sub: '500+ people' },
      { value: 'ngo', label: 'NGO or non-profit', sub: 'Mission-driven work' },
      { value: 'other', label: 'Something else', sub: "We'll meet you where you are" },
    ],
  },
  {
    key: 'primaryPain',
    question: 'Which of these feels most true about your operations right now?',
    helper: 'Pick the one that hits hardest. If they all do, the last option is for you.',
    options: [
      {
        value: 'automation',
        label: "We're drowning in manual work.",
        sub: 'The same spreadsheets, the same tasks, every week.',
      },
      {
        value: 'audit',
        label: "We can't see what's happening.",
        sub: 'Our data is scattered and our reporting is patchy.',
      },
      {
        value: 'risk',
        label: "We're worried about errors or risk slipping through.",
        sub: "The kind only caught when it's already too late.",
      },
      {
        value: 'analytics',
        label: 'We make big decisions on gut feel.',
        sub: "Because the numbers we'd want aren't there.",
      },
      {
        value: 'all',
        label: 'All of the above.',
        sub: 'Honestly, all of them apply.',
      },
    ],
  },
  {
    key: 'cost',
    question: "Roughly, what's this costing you?",
    helper: 'No need to be precise. Just the texture of it.',
    options: [
      {
        value: 'time',
        label: 'Mostly time',
        sub: 'Hours that should be going to higher-value work.',
      },
      { value: 'money', label: 'Mostly money', sub: 'Clear costs adding up.' },
      {
        value: 'risk',
        label: 'Mostly risk',
        sub: 'The kind that could really hurt us if it slipped.',
      },
      {
        value: 'opportunity',
        label: 'Mostly missed opportunity',
        sub: "We're not moving as fast as we should.",
      },
      {
        value: 'unsure',
        label: "Honestly, I'm not sure",
        sub: "That's part of the problem.",
      },
    ],
  },
  {
    key: 'tried',
    question: 'What have you tried so far to fix it?',
    options: [
      { value: 'saas', label: 'Off-the-shelf software or SaaS tools.' },
      { value: 'hires', label: 'Hired internally or brought in contractors.' },
      { value: 'inhouse', label: 'Built something in-house.' },
      { value: 'patched', label: 'Patched it together with spreadsheets and processes.' },
      { value: 'nothing', label: 'Nothing yet. Still figuring out what we need.' },
    ],
  },
  {
    key: 'timeline',
    question: 'If the right solution showed up tomorrow, when would you want it in place?',
    options: [
      { value: 'quarter', label: 'This quarter', sub: "It's bleeding now." },
      { value: '3to6', label: 'Next 3–6 months', sub: 'High priority.' },
      { value: 'year', label: 'Within the year', sub: 'Important but not urgent.' },
      { value: 'exploring', label: 'Just exploring options right now.' },
    ],
  },
  {
    key: 'decisionAuthority',
    question: "Who'd be involved in the call from your side?",
    helper: 'No wrong answer. This just helps us pace the call right.',
    options: [
      { value: 'solo', label: 'Just me', sub: 'I make the call.' },
      { value: 'team', label: 'Me and one or two others on my team.' },
      { value: 'leadership', label: "I'd need to loop in leadership." },
      {
        value: 'forothers',
        label: "I'm gathering info to share with someone else who decides.",
      },
    ],
  },
  {
    key: 'contact',
    question: 'Last step: your details and a time that works.',
    helper:
      "We'll book the call, send a calendar invite with a Google Meet link, and email you your Operational Pain Profile. Nothing else.",
  },
]

const currentStep = ref(1)
const direction = ref<'forward' | 'backward'>('forward')
const completed = ref(false)
const submitting = ref(false)
const isAdvancing = ref(false)

// Booking slots are offered in the business's timezone (SAST has no DST).
const BUSINESS_TZ_LABEL = 'SAST · UTC+2'
// SAST is a fixed +02:00 offset. Used to place a slot's wall-clock time on the
// absolute timeline so the "must be at least 1h from now" rule is correct
// regardless of the visitor's own timezone.
const BUSINESS_UTC_OFFSET = '+02:00'
// A slot must start at least this far in the future to be bookable.
const MIN_LEAD_MS = 60 * 60 * 1000

// Result of a successful /api/book call; null until (and unless) one succeeds.
const booking = ref<{
  meetLink: string | null
  htmlLink: string | null
  start: { dateLabel: string; timeLabel: string; timeZone: string }
} | null>(null)
// True when the booking call failed or isn't configured yet, the result
// screen then shows the profile plus a mailto fallback instead of "booked".
const bookingError = ref(false)
// True when the chosen slot was taken between selection and submit, we keep
// the user on the form to pick another time rather than showing the result.
const slotConflict = ref(false)

// Slots that conflict with sales@'s live Google Calendar for the chosen date.
const unavailableSlots = ref<Set<string>>(new Set())
const slotsLoading = ref(false)

const answers = reactive({
  businessType: null as string | null,
  primaryPain: null as string | null,
  cost: null as string | null,
  tried: null as string | null,
  timeline: null as string | null,
  decisionAuthority: null as string | null,
  contact: {
    name: '',
    email: '',
    company: '',
    phone: '',
    walkAway: '',
    preferredDate: null as Date | null,
    preferredTime: null as string | null,
  },
})

const today = new Date()
today.setHours(0, 0, 0, 0)
const calendarMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const monthLabel = computed(() =>
  calendarMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
)

const calendarDays = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d))
  return cells
})

const canPrevMonth = computed(() => {
  const cur = calendarMonth.value
  return (
    cur.getFullYear() > today.getFullYear() ||
    (cur.getFullYear() === today.getFullYear() && cur.getMonth() > today.getMonth())
  )
})

function isPast(date: Date) {
  return date < today
}
function isWeekend(date: Date) {
  const d = date.getDay()
  return d === 0 || d === 6
}
function isToday(date: Date) {
  return date.getTime() === today.getTime()
}
function isDateSelected(date: Date) {
  const sd = answers.contact.preferredDate
  return !!sd && sd.getTime() === date.getTime()
}
function isUnavailable(date: Date) {
  return isPast(date) || isWeekend(date)
}
function selectDate(date: Date) {
  if (isUnavailable(date)) return
  answers.contact.preferredDate = new Date(date)
  // A new date invalidates the prior time + busy map; reload from the calendar.
  answers.contact.preferredTime = null
  unavailableSlots.value = new Set()
  slotConflict.value = false
  loadAvailability(date)
}
function prevMonth() {
  if (!canPrevMonth.value) return
  calendarMonth.value = new Date(
    calendarMonth.value.getFullYear(),
    calendarMonth.value.getMonth() - 1,
    1,
  )
}
function nextMonth() {
  calendarMonth.value = new Date(
    calendarMonth.value.getFullYear(),
    calendarMonth.value.getMonth() + 1,
    1,
  )
}
function selectTime(slot: string) {
  if (isSlotUnavailable(slot)) return
  answers.contact.preferredTime = slot
}

// Absolute (epoch-ms) start of a slot on a given date, in business time.
function slotStartMs(date: Date, slot: string): number {
  const dateISO = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
  return Date.parse(`${dateISO}T${slotTo24h(slot)}:00${BUSINESS_UTC_OFFSET}`)
}

// True when a slot is less than the minimum lead time away (mainly affects
// today, e.g. at 15:30, every slot before 16:30 is too soon).
function isTooSoon(slot: string): boolean {
  const d = answers.contact.preferredDate
  if (!d) return false
  return slotStartMs(d, slot) < Date.now() + MIN_LEAD_MS
}

function isSlotUnavailable(slot: string) {
  return unavailableSlots.value.has(slot) || isTooSoon(slot)
}

const blockedSlotsOnDate = computed(() => {
  if (!answers.contact.preferredDate) return 0
  return timeSlots.filter((s) => isSlotUnavailable(s)).length
})
const allSlotsUnavailable = computed(
  () => !!answers.contact.preferredDate && blockedSlotsOnDate.value === timeSlots.length,
)

// Pull sales@'s busy intervals for the chosen day and mark conflicting slots.
// Fails open: if the lookup errors or isn't configured, all slots stay open and
// the booking endpoint does the authoritative conflict check on submit.
async function loadAvailability(date: Date) {
  const dateISO = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
  slotsLoading.value = true
  try {
    const res = await $fetch<
      | { ok: true; offset: string; durationMin: number; busy: Array<{ start: string; end: string }> }
      | { ok: false; reason: string }
    >('/api/availability', { query: { date: dateISO } })
    const next = new Set<string>()
    if (res.ok) {
      for (const slot of timeSlots) {
        const start = Date.parse(`${dateISO}T${slotTo24h(slot)}:00${res.offset}`)
        const end = start + res.durationMin * 60_000
        if (res.busy.some((b) => start < Date.parse(b.end) && end > Date.parse(b.start))) {
          next.add(slot)
        }
      }
    }
    unavailableSlots.value = next
    // If the previously chosen time just became unavailable, drop it.
    if (answers.contact.preferredTime && next.has(answers.contact.preferredTime)) {
      answers.contact.preferredTime = null
    }
  } catch {
    unavailableSlots.value = new Set()
  } finally {
    slotsLoading.value = false
  }
}

const timeSlots = [
  '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM',
]

const selectedDateLabel = computed(() => {
  const sd = answers.contact.preferredDate
  if (!sd) return ''
  return sd.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

const currentDef = computed(() => stepDefs[currentStep.value - 1])
const currentOptionValue = computed(() => {
  const def = currentDef.value
  if (def.key === 'contact') return null
  return (answers as Record<string, unknown>)[def.key] as string | null
})

function isSelected(value: string) {
  return currentOptionValue.value === value
}

function selectOption(value: string) {
  if (isAdvancing.value) return
  const def = currentDef.value
  ;(answers as Record<string, unknown>)[def.key] = value
  isAdvancing.value = true
  window.setTimeout(() => {
    advance()
    isAdvancing.value = false
  }, 320)
}

function advance() {
  if (currentStep.value < totalSteps) {
    direction.value = 'forward'
    currentStep.value++
  }
}

function back() {
  if (isAdvancing.value || submitting.value) return
  if (currentStep.value > 1) {
    direction.value = 'backward'
    currentStep.value--
  } else {
    navigateTo('/')
  }
}

function continueForward() {
  if (!currentOptionValue.value || isAdvancing.value) return
  advance()
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

const contactValid = computed(() => {
  return (
    answers.contact.name.trim().length > 0 &&
    isEmail(answers.contact.email) &&
    answers.contact.company.trim().length > 0 &&
    !!answers.contact.preferredDate &&
    !!answers.contact.preferredTime
  )
})

// --- Build the naive (zone-less) start time the booking API expects ---------
function pad2(n: number) {
  return String(n).padStart(2, '0')
}
function slotTo24h(slot: string): string {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(slot)
  if (!m) return '09:00'
  let h = parseInt(m[1], 10)
  const ap = m[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return `${pad2(h)}:${m[2]}`
}
const startDateTime = computed(() => {
  const d = answers.contact.preferredDate
  const t = answers.contact.preferredTime
  if (!d || !t) return null
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${slotTo24h(t)}:00`
})

async function submitContact() {
  if (!contactValid.value || submitting.value) return
  submitting.value = true
  bookingError.value = false
  slotConflict.value = false
  booking.value = null

  // Measurement (S09): generate_lead is the primary B2B conversion, fires on
  // contact capture, independent of whether auto-booking ultimately succeeds.
  if (import.meta.client) {
    analytics.trackEvent('generate_lead', {
      currency: 'ZAR',
      value: 0,
      lead_source: 'diagnose',
      business_type: answers.businessType,
      primary_pain: answers.primaryPain,
      timeline: answers.timeline,
    })
  }

  try {
    const res = await $fetch<
      | { ok: true; meetLink: string | null; htmlLink: string | null; start: { dateLabel: string; timeLabel: string; timeZone: string } }
      | { ok: false; reason: string }
    >('/api/book', {
      method: 'POST',
      body: {
        contact: {
          name: answers.contact.name.trim(),
          email: answers.contact.email.trim(),
          company: answers.contact.company.trim(),
          phone: answers.contact.phone.trim(),
          walkAway: answers.contact.walkAway.trim(),
        },
        start: {
          dateTime: startDateTime.value,
          dateLabel: selectedDateLabel.value,
          timeLabel: answers.contact.preferredTime,
        },
        profileTitle: profile.value.title,
        summaryLines: summaryLines.value,
        // Structured answers for the internal Zabble Tasks webhook (human labels).
        diagnostic: {
          pain_profile: profile.value.title,
          business: labelForStep('businessType', answers.businessType),
          most_pressing: labelForStep('primaryPain', answers.primaryPain),
          main_cost: labelForStep('cost', answers.cost),
          tried_so_far: labelForStep('tried', answers.tried),
          timeline: labelForStep('timeline', answers.timeline),
          who_is_involved: labelForStep('decisionAuthority', answers.decisionAuthority),
          wants: answers.contact.walkAway.trim(),
        },
      },
    })
    if (res.ok) {
      booking.value = { meetLink: res.meetLink, htmlLink: res.htmlLink, start: res.start }
      // schedule_call key event, the call is now actually booked.
      analytics.trackEvent('schedule_call', { lead_source: 'diagnose_result' })
    } else if (res.reason === 'slot_taken' || res.reason === 'too_soon') {
      // Slot got taken, or the 1h lead time lapsed while they filled the form -
      // refresh the calendar and keep them on the form to repick.
      slotConflict.value = true
      if (answers.contact.preferredDate) await loadAvailability(answers.contact.preferredDate)
      answers.contact.preferredTime = null
      submitting.value = false
      return
    } else {
      bookingError.value = true
    }
  } catch {
    bookingError.value = true
  }
  submitting.value = false
  completed.value = true
  direction.value = 'forward'
}

const progress = computed(() => {
  if (completed.value) return 100
  // endowed-progress: step 1 already starts at 15%, last question step sits ~88%
  return Math.round(((currentStep.value - 1) / totalSteps) * 85 + 15)
})

const progressLabel = computed(() => {
  if (completed.value) return 'Complete'
  return `Step ${currentStep.value} of ${totalSteps}`
})

// The pain profile is a *starting hypothesis*, not a label. Each entry leads
// with the operational theme the answers point to; the body stays general
// because the call is where the real, usually broader, scope gets mapped.
const profileMap = {
  automation: {
    title: 'Too much of your week goes to work a system should be doing.',
    icon: Workflow,
    body: "When the same manual steps repeat every week, the cost compounds quietly. It's rarely just the hours; it's the focus those hours pull away from the work only your team can do.",
    quote:
      '“Three people were spending half their week on the same spreadsheet. We replaced that whole flow with one system, and those hours came straight back to the business.”',
  },
  audit: {
    title: "You're running without one clear view of what's actually happening.",
    icon: ShieldCheck,
    body: "When your operational truth is scattered across tools and inboxes, every review, decision, and audit costs more than it should, and confidence is the first thing to go.",
    quote:
      '“We used to scramble for two weeks before every audit. Now the trail is there before we even ask.”',
  },
  risk: {
    title: "Your real exposure is what you can't see until it's already cost you.",
    icon: Radar,
    body: "Errors, drift, and the occasional bad actor tend to surface late, long after the cheapest moment to catch them has passed. The right system watches quietly in the background and flags what's unusual before it becomes a problem you can't ignore.",
    quote:
      '“We caught a vendor overcharging us 3× the baseline. The system flagged it before the invoice was even approved.”',
  },
  analytics: {
    title: 'You make big calls without the numbers those calls deserve.',
    icon: BarChart3,
    body: "The numbers you'd want almost always already exist. They're just trapped in the wrong tools, so decisions lean on instinct when they could lean on evidence.",
    quote:
      '“For the first time, every meeting starts with the same numbers. Decisions take half as long.”',
  },
  all: {
    title: "The strain isn't in one place; it's in how the whole operation runs.",
    icon: Layers,
    body: "Past a certain scale, manual work, blind spots, risk, and thin reporting stop being separate problems and start feeding each other. The work is sequencing the fix, starting where the impact is biggest, not attempting all of it at once.",
    quote:
      '“We didn’t fix everything at once. We fixed the right thing first, and the rest got easier from there.”',
  },
} as const

const profile = computed(() => {
  const key = (answers.primaryPain || 'all') as keyof typeof profileMap
  return profileMap[key] || profileMap.all
})

// --- Synthesis: a sentence woven from the *rest* of their answers -----------
// This is what makes the profile feel earned across the whole form, and sets
// up the call as the place where the real scope (broader than this) is found.
const costPhrase: Record<string, string> = {
  time: 'the cost is showing up mostly as lost time',
  money: 'the cost is landing mostly as money',
  risk: "the cost is mostly risk you can't afford to carry",
  opportunity: 'the cost is mostly opportunities slipping past',
  unsure: "you're not yet sure where the cost is hiding, which is itself a telling sign",
}
const triedPhrase: Record<string, string> = {
  saas: "off-the-shelf tools haven't quite fit",
  hires: "adding people hasn't closed the gap",
  inhouse: 'an in-house build only got you part of the way',
  patched: 'spreadsheets and workarounds are holding it together for now',
  nothing: 'you’re starting fresh, with no fix locked in yet',
}
const timelinePhrase: Record<string, string> = {
  quarter: 'you want it handled this quarter',
  '3to6': "you're looking at the next three to six months",
  year: "you'd like it solved within the year",
  exploring: "you're still exploring what's possible",
}

const synthesis = computed(() => {
  const parts: string[] = []
  if (answers.cost && costPhrase[answers.cost]) parts.push(costPhrase[answers.cost])
  if (answers.tried && triedPhrase[answers.tried]) parts.push(triedPhrase[answers.tried])
  if (answers.timeline && timelinePhrase[answers.timeline])
    parts.push(timelinePhrase[answers.timeline])

  const tail =
    "the call is where we map the full operational picture, which is almost always broader than a few questions can capture."

  if (!parts.length) {
    return `From here, ${tail}`
  }
  const joined =
    parts.length === 1
      ? parts[0]
      : `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
  const sentence = joined.charAt(0).toUpperCase() + joined.slice(1)
  const Tail = tail.charAt(0).toUpperCase() + tail.slice(1)
  return `${sentence}. That's a starting point, not a verdict. ${Tail}`
})

// --- Readable summary of every answer, for the API / email / calendar -------
function labelForStep(key: StepKey, value: string | null): string {
  if (!value) return '(not answered)'
  const def = stepDefs.find((s) => s.key === key)
  const opt = def?.options?.find((o) => o.value === value)
  return opt?.label ?? value
}

const summaryLines = computed(() => [
  `Business: ${labelForStep('businessType', answers.businessType)}`,
  `Most pressing: ${labelForStep('primaryPain', answers.primaryPain)}`,
  `Main cost: ${labelForStep('cost', answers.cost)}`,
  `Tried so far: ${labelForStep('tried', answers.tried)}`,
  `Timeline: ${labelForStep('timeline', answers.timeline)}`,
  `Who's involved: ${labelForStep('decisionAuthority', answers.decisionAuthority)}`,
])

// Fallback only: used when auto-booking can't complete (e.g. before the Google
// credentials are configured). Pre-fills an email to sales@ with everything.
const fallbackMailto = computed(() => {
  const preferredWhen =
    answers.contact.preferredDate && answers.contact.preferredTime
      ? `${selectedDateLabel.value} at ${answers.contact.preferredTime} (${BUSINESS_TZ_LABEL})`
      : ''
  const summary = summaryLines.value.join('\n')
  const body =
    `Hi Zabble,\n\nI just completed the Operational Pain Profile and I'd like to book the 30-minute discovery call` +
    `${preferredWhen ? `; my preferred time is ${preferredWhen}` : ''}.\n\n` +
    `My answers:\n${summary}\n\n` +
    `Name: ${answers.contact.name}\nCompany: ${answers.contact.company}` +
    `${answers.contact.phone ? `\nPhone: ${answers.contact.phone}` : ''}` +
    `${answers.contact.walkAway ? `\n\nWhat I'd like to walk away with: ${answers.contact.walkAway}` : ''}` +
    `\n\nThanks,\n${answers.contact.name}`
  const params = new URLSearchParams({
    subject: 'Discovery call (from Operational Pain Profile)',
    body,
  })
  return `mailto:sales@zabble.org?${params.toString()}`
})

function onKeydown(e: KeyboardEvent) {
  if (completed.value || submitting.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    back()
    return
  }
  const def = currentDef.value
  if (def.key === 'contact') return
  const target = e.target as HTMLElement | null
  if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
  const num = parseInt(e.key, 10)
  if (Number.isFinite(num) && def.options && num >= 1 && num <= def.options.length) {
    e.preventDefault()
    selectOption(def.options[num - 1].value)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

const transitionName = computed(() =>
  direction.value === 'forward' ? 'slide-forward' : 'slide-backward',
)

const stepFrame = computed(
  () => 'Find your most expensive operational problem in under 2 minutes.',
)
</script>

<template>
  <div class="diagnose-root relative min-h-screen flex flex-col bg-surface text-ink antialiased">
    <div
      class="absolute inset-x-0 -top-32 -z-10 pointer-events-none flex justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div class="h-[440px] w-[820px] rounded-full bg-cyan-brand/[0.09] blur-[120px]" />
    </div>

    <header class="relative z-10">
      <div
        class="mx-auto w-full max-w-3xl px-5 md:px-8 pt-4 pb-3 md:py-5 flex items-center gap-3 md:gap-5"
      >
        <NuxtLink
          to="/"
          class="inline-flex items-center group shrink-0 py-2 lg:py-0"
          aria-label="Zabble home"
        >
          <span class="font-display text-ink text-[22px] sm:text-[28px] leading-none tracking-[-0.02em] transition-colors group-hover:text-ink-soft">
            Zabble
          </span>
        </NuxtLink>

        <div class="flex-1 min-w-0">
          <div
            class="flex items-center justify-between text-[11.5px] md:text-[12.5px] text-mute-2 mb-1 md:mb-1.5 font-semibold"
          >
            <span>{{ progressLabel }}</span>
            <span class="tabular-nums">{{ progress }}%</span>
          </div>
          <div class="relative h-1 md:h-1.5 rounded-full bg-line/80 overflow-hidden">
            <div
              class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-brand to-cyan-brand-deep transition-[width] duration-700 ease-out shadow-[0_0_14px_rgba(1,219,241,0.55)]"
              :style="{ width: progress + '%' }"
            />
          </div>
        </div>

        <NuxtLink
          to="/"
          class="-mr-1.5 md:mr-0 inline-flex items-center justify-center h-10 w-10 lg:h-10 lg:w-10 rounded-full text-mute hover:text-ink hover:bg-ink/5 transition shrink-0"
          aria-label="Close and return home"
        >
          <X :size="20" :stroke-width="1.75" />
        </NuxtLink>
      </div>
    </header>

    <Transition name="fade">
      <div
        v-if="currentStep === 1 && !completed"
        class="mx-auto max-w-3xl w-full px-5 md:px-8 pt-1 pb-2 md:pt-2 md:pb-4 text-center"
      >
        <p
          data-answer-first
          class="text-[13.5px] md:text-[15px] text-mute font-medium tracking-[-0.005em]"
        >
          {{ stepFrame }}
        </p>
      </div>
    </Transition>

    <main class="flex-1 flex flex-col items-stretch">
      <div
        class="mx-auto w-full max-w-3xl px-5 md:px-8 py-4 md:py-12 flex-1 flex flex-col"
      >
        <div class="relative flex-1">
          <Transition :name="transitionName" mode="out-in">
            <div
              v-if="!completed && currentDef.key !== 'contact'"
              :key="`q-${currentStep}`"
              class="space-y-5 md:space-y-9"
            >
              <div>
                <h1
                  class="font-display text-[26px] sm:text-[34px] md:text-[44px] lg:text-[48px] leading-[1.12] tracking-tight text-ink"
                >
                  {{ currentDef.question }}
                </h1>
                <p
                  v-if="currentDef.helper"
                  class="mt-2.5 md:mt-4 text-[14.5px] md:text-[16.5px] text-mute leading-[1.55] md:leading-[1.6]"
                >
                  {{ currentDef.helper }}
                </p>
              </div>

              <div class="grid grid-cols-1 gap-2.5 md:gap-3">
                <button
                  v-for="(opt, i) in currentDef.options"
                  :key="opt.value"
                  type="button"
                  :disabled="isAdvancing"
                  :class="[
                    'option-card group flex items-start gap-3 md:gap-4 text-left rounded-xl md:rounded-2xl border bg-white px-3.5 md:px-6 py-3.5 md:py-5 transition-all duration-200 disabled:cursor-default',
                    isSelected(opt.value)
                      ? 'border-cyan-brand ring-2 ring-cyan-brand/30 shadow-[0_18px_50px_-22px_rgba(1,219,241,0.55)]'
                      : 'border-line hover:border-cyan-brand/55 hover:bg-cyan-brand/[0.02] hover:shadow-[0_18px_45px_-30px_rgba(15,23,42,0.18)] hover:-translate-y-px',
                  ]"
                  :style="{ animationDelay: `${i * 60}ms` }"
                  @click="selectOption(opt.value)"
                >
                  <span
                    :class="[
                      'mt-0.5 inline-flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg text-[12.5px] md:text-[13.5px] font-semibold transition-all',
                      isSelected(opt.value)
                        ? 'bg-cyan-brand text-ink ring-1 ring-cyan-brand'
                        : 'bg-surface-alt text-mute group-hover:bg-cyan-brand/10 group-hover:text-cyan-brand-deep ring-1 ring-line',
                    ]"
                    aria-hidden="true"
                  >
                    <Check v-if="isSelected(opt.value)" :size="15" />
                    <span v-else class="tabular-nums">{{ i + 1 }}</span>
                  </span>
                  <span class="flex-1 min-w-0">
                    <span
                      class="block text-[15.5px] md:text-[17.5px] font-semibold text-ink leading-snug"
                    >
                      {{ opt.label }}
                    </span>
                    <span
                      v-if="opt.sub"
                      class="block mt-0.5 md:mt-1 text-[13.5px] md:text-[15px] text-mute leading-[1.45] md:leading-[1.55]"
                    >
                      {{ opt.sub }}
                    </span>
                  </span>
                  <ArrowRight
                    :size="16"
                    :class="[
                      'mt-1 md:mt-1.5 shrink-0 transition-all',
                      isSelected(opt.value)
                        ? 'text-cyan-brand-deep translate-x-0.5'
                        : 'text-mute-2 group-hover:text-ink group-hover:translate-x-0.5',
                    ]"
                  />
                </button>
              </div>
            </div>

            <div
              v-else-if="!completed && currentDef.key === 'contact'"
              :key="'contact'"
              class="space-y-8 md:space-y-9"
            >
              <div>
                <h1
                  class="font-display text-[30px] sm:text-[38px] md:text-[44px] leading-[1.1] tracking-tight text-ink"
                >
                  {{ currentDef.question }}
                </h1>
                <p
                  class="mt-4 text-[16px] md:text-[16.5px] text-mute leading-[1.6]"
                >
                  {{ currentDef.helper }}
                </p>
              </div>

              <form class="space-y-5" @submit.prevent="submitContact">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label class="block">
                    <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                      Name
                    </span>
                    <input
                      v-model="answers.contact.name"
                      type="text"
                      autocomplete="name"
                      required
                      placeholder="Your full name"
                      class="form-field"
                    />
                  </label>
                  <label class="block">
                    <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                      Work email
                    </span>
                    <input
                      v-model="answers.contact.email"
                      type="email"
                      autocomplete="email"
                      required
                      placeholder="you@company.com"
                      class="form-field"
                    />
                  </label>
                  <label class="block">
                    <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                      Company
                    </span>
                    <input
                      v-model="answers.contact.company"
                      type="text"
                      autocomplete="organization"
                      required
                      placeholder="Company name"
                      class="form-field"
                    />
                  </label>
                  <label class="block">
                    <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                      Phone
                      <span class="font-normal text-mute-2">(optional)</span>
                    </span>
                    <input
                      v-model="answers.contact.phone"
                      type="tel"
                      autocomplete="tel"
                      placeholder="+1 555 0100"
                      class="form-field"
                    />
                  </label>
                </div>

                <div>
                  <div class="flex items-baseline justify-between gap-3 mb-2.5">
                    <span class="block text-[13px] font-semibold text-ink tracking-[0.01em]">
                      Pick your call time
                      <span class="font-normal text-mute-2">· times in {{ BUSINESS_TZ_LABEL }}</span>
                    </span>
                    <span
                      v-if="answers.contact.preferredDate && answers.contact.preferredTime"
                      class="inline-flex items-center gap-1.5 text-[12.5px] text-cyan-brand-deep font-semibold"
                    >
                      <Check :size="13" :stroke-width="2.4" />
                      {{ selectedDateLabel }} · {{ answers.contact.preferredTime }}
                    </span>
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div class="rounded-xl border border-line bg-white p-4">
                      <div class="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          @click="prevMonth"
                          :disabled="!canPrevMonth"
                          aria-label="Previous month"
                          class="inline-flex items-center justify-center h-8 w-8 rounded-md text-mute hover:text-ink hover:bg-surface-alt disabled:text-mute-2/40 disabled:cursor-not-allowed transition"
                        >
                          <ChevronLeft :size="18" />
                        </button>
                        <span class="text-[13.5px] font-semibold text-ink">{{ monthLabel }}</span>
                        <button
                          type="button"
                          @click="nextMonth"
                          aria-label="Next month"
                          class="inline-flex items-center justify-center h-8 w-8 rounded-md text-mute hover:text-ink hover:bg-surface-alt transition"
                        >
                          <ChevronRight :size="18" />
                        </button>
                      </div>
                      <div class="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-[0.1em] text-mute-2 font-semibold mb-1.5">
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                      </div>
                      <div class="grid grid-cols-7 gap-1">
                        <template v-for="(day, i) in calendarDays" :key="i">
                          <span v-if="!day" class="h-9" aria-hidden="true" />
                          <button
                            v-else
                            type="button"
                            @click="selectDate(day)"
                            :disabled="isUnavailable(day)"
                            :aria-pressed="isDateSelected(day)"
                            :class="[
                              'h-9 w-full inline-flex items-center justify-center rounded-md text-[13.5px] font-medium transition',
                              isDateSelected(day)
                                ? 'bg-cyan-brand text-ink ring-1 ring-cyan-brand-deep'
                                : isUnavailable(day)
                                ? 'text-mute-2/40 cursor-not-allowed'
                                : isToday(day)
                                ? 'text-ink ring-1 ring-line hover:bg-surface-alt'
                                : 'text-ink hover:bg-surface-alt',
                            ]"
                          >
                            {{ day.getDate() }}
                          </button>
                        </template>
                      </div>
                      <p class="mt-3 text-[11.5px] text-mute-2 leading-relaxed">
                        Weekends and past dates are unavailable.
                      </p>
                    </div>

                    <div class="rounded-xl border border-line bg-white p-4">
                      <div
                        v-if="!answers.contact.preferredDate"
                        class="flex flex-col items-center justify-center text-center min-h-[200px] text-mute-2"
                      >
                        <Clock :size="22" :stroke-width="1.7" class="mb-2" />
                        <p class="text-[13.5px]">Pick a date to see available times.</p>
                      </div>
                      <div v-else>
                        <div class="flex items-center gap-2 mb-3">
                          <Clock :size="14" :stroke-width="2" class="text-cyan-brand-deep" />
                          <span class="text-[13px] font-semibold text-ink">
                            {{ selectedDateLabel }}
                          </span>
                          <span
                            v-if="slotsLoading"
                            class="ml-auto inline-flex items-center gap-1.5 text-[11.5px] text-mute-2"
                          >
                            <Loader2 :size="12" class="animate-spin" />
                            Checking calendar…
                          </span>
                        </div>
                        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
                          <button
                            v-for="slot in timeSlots"
                            :key="slot"
                            type="button"
                            @click="selectTime(slot)"
                            :disabled="isSlotUnavailable(slot)"
                            :aria-pressed="answers.contact.preferredTime === slot"
                            :title="isSlotUnavailable(slot) ? 'Already booked' : undefined"
                            :class="[
                              'py-2 rounded-md text-[12.5px] font-semibold transition',
                              isSlotUnavailable(slot)
                                ? 'text-mute-2/40 line-through cursor-not-allowed border border-transparent'
                                : answers.contact.preferredTime === slot
                                ? 'bg-cyan-brand text-ink ring-1 ring-cyan-brand-deep'
                                : 'border border-line text-ink hover:border-cyan-brand/55 hover:bg-cyan-brand/[0.04]',
                            ]"
                          >
                            {{ slot }}
                          </button>
                        </div>
                        <p
                          v-if="!slotsLoading && allSlotsUnavailable"
                          class="mt-2.5 text-[11.5px] text-mute-2 leading-relaxed"
                        >
                          No more times available on this day. Please pick another date.
                        </p>
                        <p
                          v-else-if="!slotsLoading && blockedSlotsOnDate > 0"
                          class="mt-2.5 text-[11.5px] text-mute-2 leading-relaxed"
                        >
                          Crossed-out times aren't available: already booked, or less than an
                          hour away.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <label class="block">
                  <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                    What's the one thing you'd want to walk away from the call with?
                    <span class="font-normal text-mute-2">(optional)</span>
                  </span>
                  <textarea
                    v-model="answers.contact.walkAway"
                    rows="3"
                    placeholder="A clear sense of what to tackle first, a rough scope, a price range, peace of mind…"
                    class="form-field resize-none leading-[1.55]"
                  />
                </label>

                <p
                  v-if="slotConflict"
                  class="rounded-xl border border-cyan-brand/40 bg-cyan-brand/[0.06] px-4 py-3 text-[13.5px] text-ink leading-[1.55]"
                >
                  That time just became unavailable. We've refreshed the calendar, so
                  please pick another slot.
                </p>

                <div class="pt-1">
                  <button
                    type="submit"
                    :disabled="!contactValid || submitting"
                    :class="[
                      'group inline-flex items-center justify-center gap-2 rounded-full text-[15.5px] font-semibold pl-7 pr-5 py-4 transition w-full sm:w-auto',
                      contactValid && !submitting
                        ? 'bg-ink hover:bg-ink-soft text-white shadow-[0_18px_50px_-15px_rgba(1,219,241,0.5)]'
                        : 'bg-line text-mute-2 cursor-not-allowed',
                    ]"
                  >
                    <template v-if="submitting">
                      <Loader2 :size="18" class="animate-spin" />
                      Booking your call…
                    </template>
                    <template v-else>
                      Book my 30-minute call
                      <ArrowRight
                        :size="18"
                        class="transition group-hover:translate-x-0.5"
                      />
                    </template>
                  </button>
                </div>

                <p class="text-[13px] text-mute-2 leading-[1.6]">
                  No marketing list. No spam. The only emails you'll receive are about your
                  profile and your call.
                </p>
              </form>
            </div>

            <div v-else :key="'result'" class="space-y-10 md:space-y-12">
              <div class="text-center">
                <div class="result-icon-wrap mx-auto mb-7">
                  <div
                    class="relative inline-flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-cyan-brand to-cyan-brand-deep text-ink shadow-[0_18px_50px_-12px_rgba(1,219,241,0.65)]"
                  >
                    <component :is="profile.icon" :size="32" :stroke-width="2" />
                    <span class="result-icon-halo" aria-hidden="true" />
                  </div>
                </div>

                <div
                  class="text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
                >
                  Your Operational Pain Profile
                </div>
                <h1
                  class="mt-5 font-display text-[32px] sm:text-[42px] md:text-[50px] leading-[1.08] tracking-tight text-ink text-balance"
                >
                  {{ profile.title }}
                </h1>
                <p
                  class="mx-auto mt-7 max-w-2xl text-[17px] md:text-[18.5px] leading-[1.65] text-mute"
                >
                  {{ profile.body }}
                </p>
                <p
                  class="mx-auto mt-4 max-w-2xl text-[15.5px] md:text-[16.5px] leading-[1.6] text-mute-2"
                >
                  {{ synthesis }}
                </p>
              </div>

              <!-- Booked: the call is confirmed on sales@'s calendar -->
              <div
                v-if="booking"
                class="booked-card mx-auto max-w-xl rounded-2xl border border-cyan-brand/40 bg-cyan-brand/[0.05] p-6 md:p-7"
              >
                <div class="flex items-start gap-4">
                  <span
                    class="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-brand text-ink shadow-[0_10px_30px_-8px_rgba(1,219,241,0.7)]"
                  >
                    <CalendarCheck :size="22" :stroke-width="2" />
                  </span>
                  <div class="flex-1 min-w-0">
                    <h2 class="text-[18px] md:text-[19px] font-semibold text-ink leading-snug">
                      Your 30-minute call is booked.
                    </h2>
                    <p
                      v-if="booking.start.dateLabel"
                      class="mt-1 text-[14.5px] text-mute leading-[1.55]"
                    >
                      {{ booking.start.dateLabel
                      }}<template v-if="booking.start.timeLabel">
                        at {{ booking.start.timeLabel }}</template
                      >
                      <span class="text-mute-2">· {{ BUSINESS_TZ_LABEL }}</span>
                    </p>
                    <p class="mt-2 text-[14px] text-mute leading-[1.6]">
                      A calendar invite with the Google Meet link is on its way to
                      <span class="font-semibold text-ink">{{ answers.contact.email }}</span>.
                    </p>
                    <a
                      v-if="booking.meetLink"
                      :href="booking.meetLink"
                      target="_blank"
                      rel="noopener"
                      class="group mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-ink hover:bg-ink-soft text-white text-[14.5px] font-semibold pl-5 pr-5 py-3 transition"
                    >
                      <Video :size="17" />
                      Join with Google Meet
                      <ArrowRight :size="16" class="transition group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </div>

              <!-- Fallback: auto-booking unavailable → let them reach us directly -->
              <div
                v-else
                class="mx-auto max-w-xl rounded-2xl border border-line bg-surface-alt p-6 md:p-7 text-center"
              >
                <p class="text-[15.5px] text-ink font-semibold">
                  We couldn't lock the time in automatically.
                </p>
                <p class="mx-auto mt-2 max-w-md text-[14px] text-mute leading-[1.6]">
                  No problem. Your profile is ready below. Send us one click and we'll
                  confirm your call by hand, usually within a few hours.
                </p>
                <a
                  :href="fallbackMailto"
                  class="group mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-brand hover:bg-cyan-brand-deep text-ink text-[15px] font-semibold pl-6 pr-5 py-3.5 transition shadow-[0_18px_45px_-14px_rgba(1,219,241,0.6)]"
                >
                  <Calendar :size="17" />
                  Email us to confirm your call
                  <ArrowRight :size="16" class="transition group-hover:translate-x-0.5" />
                </a>
              </div>

              <figure
                class="mt-2 rounded-2xl border border-line bg-white/95 p-7 md:p-9 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.18)]"
              >
                <blockquote class="diagnose-quote text-ink">
                  {{ profile.quote }}
                </blockquote>
                <figcaption
                  class="mt-5 text-[12px] text-mute-2 uppercase tracking-[0.2em] font-semibold"
                >
                  From a similar business
                </figcaption>
              </figure>

              <div class="text-center pt-2">
                <NuxtLink
                  to="/"
                  class="inline-block py-3 lg:inline lg:py-0 text-[16px] lg:text-[14.5px] text-mute hover:text-ink transition underline-offset-4 hover:underline"
                >
                  ← Back to home
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <div
          v-if="!completed"
          class="mt-6 md:mt-12 flex items-center justify-between gap-4"
        >
          <button
            type="button"
            class="group inline-flex items-center gap-1.5 py-3 lg:py-0 text-[14.5px] font-medium text-mute hover:text-ink transition"
            @click="back"
          >
            <ArrowLeft :size="16" class="transition group-hover:-translate-x-0.5" />
            {{ currentStep === 1 ? 'Home' : 'Back' }}
          </button>

          <button
            v-if="currentOptionValue && currentDef.key !== 'contact'"
            type="button"
            class="group inline-flex items-center gap-2 rounded-full bg-ink hover:bg-ink-soft text-white text-[14.5px] font-medium pl-5 pr-4 py-3 lg:py-2.5 transition"
            @click="continueForward"
          >
            Continue
            <ArrowRight :size="16" class="transition group-hover:translate-x-0.5" />
          </button>

          <div
            v-else-if="currentDef.key !== 'contact'"
            class="text-[12.5px] text-mute-2 hidden md:block"
          >
            Press
            <kbd
              class="px-1.5 py-0.5 rounded border border-line bg-surface-alt font-medium text-mute mx-0.5"
            >1</kbd
            >–<kbd
              class="px-1.5 py-0.5 rounded border border-line bg-surface-alt font-medium text-mute mx-0.5"
            >{{ currentDef.options?.length || 1 }}</kbd
            >
            to select
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.diagnose-quote {
  /* Brand display serif (Instrument Serif), an elegant, editorial pull-quote
     that reads as considered rather than decorative. */
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(21px, 2.5vw, 29px);
  line-height: 1.42;
  letter-spacing: -0.01em;
  color: var(--color-ink);
  text-wrap: pretty;
  font-feature-settings: 'liga', 'dlig';
}

.form-field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--color-line);
  background: #ffffff;
  padding: 0.875rem 1rem;
  font-size: 16px;
  line-height: 1.4;
  color: var(--color-ink);
  font-family: var(--font-sans);
  transition: border-color 180ms, box-shadow 180ms, background-color 180ms;
}
.form-field::placeholder {
  color: var(--color-mute-2);
}
.form-field:hover {
  border-color: rgba(1, 219, 241, 0.4);
}
.form-field:focus {
  outline: none;
  border-color: var(--color-cyan-brand);
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.22);
}

.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-backward-enter-active,
.slide-backward-leave-active {
  transition: opacity 380ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-forward-enter-from {
  opacity: 0;
  transform: translate3d(36px, 0, 0);
}
.slide-forward-leave-to {
  opacity: 0;
  transform: translate3d(-26px, 0, 0);
}
.slide-backward-enter-from {
  opacity: 0;
  transform: translate3d(-36px, 0, 0);
}
.slide-backward-leave-to {
  opacity: 0;
  transform: translate3d(26px, 0, 0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 280ms ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.option-card {
  animation: option-fade-in 420ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
@keyframes option-fade-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-icon-wrap {
  animation: result-pop 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes result-pop {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  60% {
    opacity: 1;
    transform: scale(1.06);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.result-icon-halo {
  position: absolute;
  inset: -10px;
  border-radius: 1.25rem;
  background: rgba(1, 219, 241, 0.35);
  filter: blur(22px);
  z-index: -1;
  animation: result-halo 2.6s ease-in-out infinite;
}
@keyframes result-halo {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .slide-forward-enter-active,
  .slide-forward-leave-active,
  .slide-backward-enter-active,
  .slide-backward-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none !important;
  }
  .option-card,
  .result-icon-wrap,
  .result-icon-halo {
    animation: none !important;
  }
}
</style>
