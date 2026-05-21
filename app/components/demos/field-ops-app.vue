<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { Activity, ArrowRight, Battery, Building2, Camera, Check, CheckCircle2, ChevronLeft, CircleDot, ClipboardCheck, FileText, FlagTriangleRight, Gauge, HardHat, Heart, Image as ImageIcon, Inbox, ListChecks, MapPin, PenLine, RefreshCw, Signal, Trash2, Truck, Wifi, WifiOff } from '@lucide/vue'

type Persona = 'installer' | 'inspector' | 'driver' | 'social-worker' | 'field-agent'

interface VisitHistory { date: string; note: string }
interface JobSeed {
  id: string
  time: string
  customer: string
  address: string
  city: string
  category: string
  equipment: string[]
  history: VisitHistory[]
  lastPhotos: { caption: string; tone: 'sky' | 'slate' | 'amber' | 'lime' }[]
}

interface PersonaCfg {
  slug: Persona
  label: string
  short: string
  icon: any
  noun: string                  // singular: "install", "inspection", etc.
  nounPlural: string            // "installs"
  dayTitle: string              // header on the phone "Today's installs"
  checklist: string[]
  findingLabel: string
  findingPlaceholder: string
  signatureLabel: string
  jobs: JobSeed[]
}

const PERSONAS: PersonaCfg[] = [
  {
    slug: 'installer',
    label: 'HVAC installer',
    short: 'Installer',
    icon: HardHat,
    noun: 'install',
    nounPlural: 'installs',
    dayTitle: "Today's installs",
    checklist: [
      'Site survey complete',
      'Refrigerant lines pressure tested',
      'Electrical disconnect verified',
      'System charged & operating',
      'Thermostat paired with homeowner',
    ],
    findingLabel: 'Findings',
    findingPlaceholder: 'Note any deviations from spec…',
    signatureLabel: 'Customer sign-off',
    jobs: [
      {
        id: 'INS-1042',
        time: '08:30',
        customer: 'M. Okafor',
        address: '14 Linden Crescent',
        city: 'Roosevelt Park',
        category: 'Split AC install',
        equipment: ['Carrier 24ACC6 · 3-ton', 'Honeywell T9 thermostat'],
        history: [
          { date: '2024-11-02', note: 'Spec walk: condenser pad, 4m line run.' },
          { date: '2025-09-18', note: 'Quote signed. Permit on file.' },
        ],
        lastPhotos: [
          { caption: 'Condenser pad (Nov)', tone: 'slate' },
          { caption: 'Line set route',     tone: 'sky' },
        ],
      },
      {
        id: 'INS-1043',
        time: '11:00',
        customer: 'Ferreira Bakery',
        address: '7 Park Lane',
        city: 'Bryanston',
        category: 'Ducted system swap',
        equipment: ['Daikin FXAQ × 4', 'Trane Hyperion air handler'],
        history: [
          { date: '2025-08-30', note: 'Removed legacy 2009 unit.' },
        ],
        lastPhotos: [
          { caption: 'Plenum (pre-swap)',  tone: 'amber' },
          { caption: 'Roof penetration',   tone: 'slate' },
        ],
      },
      {
        id: 'INS-1044',
        time: '14:15',
        customer: 'Sithole household',
        address: '88 Hill Road',
        city: 'Linden',
        category: 'Service call — no cooling',
        equipment: ['LG dual-inverter (2022)'],
        history: [
          { date: '2025-12-04', note: 'Reported icing on indoor coil.' },
        ],
        lastPhotos: [{ caption: 'Indoor coil',        tone: 'sky' }],
      },
    ],
  },
  {
    slug: 'inspector',
    label: 'Property inspector',
    short: 'Inspector',
    icon: ClipboardCheck,
    noun: 'inspection',
    nounPlural: 'inspections',
    dayTitle: "Today's inspections",
    checklist: [
      'Exterior envelope surveyed',
      'Roof condition recorded',
      'Plumbing pressure test',
      'Electrical panel reviewed',
      'HVAC operability confirmed',
    ],
    findingLabel: 'Cited issues',
    findingPlaceholder: 'Issues to cite in the report…',
    signatureLabel: 'Owner acknowledgement',
    jobs: [
      {
        id: 'INSP-307',
        time: '09:00',
        customer: 'Olive Tree Estate · Unit 14',
        address: '14 Olive Tree Estate',
        city: 'Centurion',
        category: 'Pre-sale inspection',
        equipment: ['Geyser (Kwikot 200L)', 'DB board (3-phase)'],
        history: [
          { date: '2025-10-12', note: 'Buyer requested second inspection.' },
        ],
        lastPhotos: [
          { caption: 'DB board',     tone: 'slate' },
          { caption: 'Roof valley',  tone: 'amber' },
        ],
      },
      {
        id: 'INSP-308',
        time: '11:30',
        customer: 'Riverside Lodge',
        address: '4 Riverside Drive',
        city: 'Hartbeespoort',
        category: 'Annual compliance',
        equipment: ['Solar geyser', 'Plant room manifold'],
        history: [
          { date: '2024-11-22', note: 'Prior cert filed. No outstanding items.' },
        ],
        lastPhotos: [{ caption: 'Plant room',       tone: 'sky' }],
      },
      {
        id: 'INSP-309',
        time: '14:45',
        customer: 'Mthembu residence',
        address: '23 Acacia Avenue',
        city: 'Sandton',
        category: 'Damp & leak inspection',
        equipment: [],
        history: [],
        lastPhotos: [{ caption: 'Bathroom ceiling', tone: 'amber' }],
      },
    ],
  },
  {
    slug: 'driver',
    label: 'Delivery driver',
    short: 'Driver',
    icon: Truck,
    noun: 'drop',
    nounPlural: 'drops',
    dayTitle: "Today's drops",
    checklist: [
      'Goods unloaded & counted',
      'Proof of delivery captured',
      'Site contact briefed',
      'Damage check complete',
    ],
    findingLabel: 'Exceptions',
    findingPlaceholder: 'Damage, shorts or delivery notes…',
    signatureLabel: 'Recipient signature',
    jobs: [
      {
        id: 'DRP-2210',
        time: '07:45',
        customer: 'Greengate Spar',
        address: '12 Greengate Rd',
        city: 'Boksburg',
        category: 'Dry goods pallet × 3',
        equipment: [],
        history: [
          { date: '2025-12-10', note: 'Receiver prefers rear bay 2.' },
        ],
        lastPhotos: [
          { caption: 'Bay 2 access', tone: 'slate' },
        ],
      },
      {
        id: 'DRP-2211',
        time: '10:20',
        customer: 'KwaZulu Café',
        address: '46 Beach Rd',
        city: 'Durban North',
        category: 'Chilled · 2 crates',
        equipment: [],
        history: [],
        lastPhotos: [],
      },
      {
        id: 'DRP-2212',
        time: '13:10',
        customer: 'Solis Office Tower',
        address: '1 Solis Plaza',
        city: 'Sandton',
        category: 'Stationery resupply',
        equipment: [],
        history: [{ date: '2025-09-04', note: 'Use freight lift, not main.' }],
        lastPhotos: [{ caption: 'Loading dock', tone: 'sky' }],
      },
      {
        id: 'DRP-2213',
        time: '15:40',
        customer: 'Allenby Pharmacy',
        address: '88 Allenby Lane',
        city: 'Pretoria East',
        category: 'Cold chain · medical',
        equipment: ['Insulated tote × 2'],
        history: [],
        lastPhotos: [],
      },
    ],
  },
  {
    slug: 'social-worker',
    label: 'Social worker',
    short: 'Social worker',
    icon: Heart,
    noun: 'visit',
    nounPlural: 'visits',
    dayTitle: "Today's visits",
    checklist: [
      'Welfare check complete',
      'Children present & safe',
      'Safety hazards observed',
      'Referrals required',
    ],
    findingLabel: 'Case narrative',
    findingPlaceholder: 'Narrative for the case file…',
    signatureLabel: 'Caregiver acknowledgement',
    jobs: [
      {
        id: 'CAS-481',
        time: '09:15',
        customer: 'Dlamini family',
        address: '6 Loop Street',
        city: 'Mamelodi',
        category: 'Quarterly welfare visit',
        equipment: [],
        history: [
          { date: '2025-09-02', note: 'Children attending school regularly.' },
        ],
        lastPhotos: [{ caption: 'Home exterior', tone: 'lime' }],
      },
      {
        id: 'CAS-482',
        time: '11:00',
        customer: 'Mr A. Khan',
        address: '14 Albert Street',
        city: 'Lenasia',
        category: 'Follow-up · housing referral',
        equipment: [],
        history: [{ date: '2025-11-19', note: 'Application submitted.' }],
        lastPhotos: [],
      },
      {
        id: 'CAS-483',
        time: '14:00',
        customer: 'Maseko family',
        address: '22 Vlei Road',
        city: 'Soweto',
        category: 'New intake assessment',
        equipment: [],
        history: [],
        lastPhotos: [],
      },
    ],
  },
  {
    slug: 'field-agent',
    label: 'Meter reader',
    short: 'Field agent',
    icon: Gauge,
    noun: 'read',
    nounPlural: 'reads',
    dayTitle: "Today's meter route",
    checklist: [
      'Meter accessible',
      'Reading captured',
      'Seal intact',
      'Tamper indicator clean',
    ],
    findingLabel: 'Anomalies',
    findingPlaceholder: 'Anomaly or follow-up needed…',
    signatureLabel: 'On-site witness (if any)',
    jobs: [
      {
        id: 'MTR-9001',
        time: '08:00',
        customer: 'Account 4471-23 · Mrs. Naidoo',
        address: '11 Acorn Crescent',
        city: 'Westville',
        category: 'Quarterly read',
        equipment: ['Itron AMI 100', 'Bulk meter L3'],
        history: [
          { date: '2025-09-22', note: 'Last read 4,182 kWh.' },
        ],
        lastPhotos: [{ caption: 'Meter face (Sep)', tone: 'slate' }],
      },
      {
        id: 'MTR-9002',
        time: '09:35',
        customer: 'Account 4488-12 · J. van Wyk',
        address: '6 Sunset Drive',
        city: 'Westville',
        category: 'Quarterly read',
        equipment: ['Itron AMI 100'],
        history: [],
        lastPhotos: [],
      },
      {
        id: 'MTR-9003',
        time: '11:10',
        customer: 'Account 4502-08 · Ngcobo',
        address: '24 Forest Way',
        city: 'Pinetown',
        category: 'Read + seal check',
        equipment: ['Itron AMI 100'],
        history: [{ date: '2025-06-04', note: 'Seal flagged loose — re-sealed.' }],
        lastPhotos: [{ caption: 'Seal close-up', tone: 'amber' }],
      },
      {
        id: 'MTR-9004',
        time: '13:00',
        customer: 'Account 4515-66 · Patel',
        address: '88 Riverview',
        city: 'Hillcrest',
        category: 'Quarterly read',
        equipment: ['Itron AMI 100'],
        history: [],
        lastPhotos: [],
      },
    ],
  },
]

function personaCfg(slug: Persona): PersonaCfg {
  return PERSONAS.find((p) => p.slug === slug)!
}

// ──────────────────────────────────────────────────────────────
// Reactive state
// ──────────────────────────────────────────────────────────────

const personaSlug = ref<Persona>('installer')
const online = ref(true)
const screen = ref<'list' | 'job' | 'summary'>('list')
const activeJobId = ref<string | null>(null)

const cfg = computed(() => personaCfg(personaSlug.value))
const jobs = computed(() => cfg.value.jobs)
const activeJob = computed(() =>
  jobs.value.find((j) => j.id === activeJobId.value) ?? null,
)

interface JobProgress {
  photos: { id: string; tone: 'sky' | 'slate' | 'amber' | 'lime' }[]
  signed: boolean
  geoStamp: { lat: string; lng: string; acc: string; at: string } | null
  checklist: Record<string, boolean>
  finding: string
  completed: boolean
  flagged: boolean
}

const progress = reactive<Record<string, JobProgress>>({})

function ensureProgress(jobId: string): JobProgress {
  if (!progress[jobId]) {
    const checklist: Record<string, boolean> = {}
    cfg.value.checklist.forEach((c) => { checklist[c] = false })
    progress[jobId] = {
      photos: [],
      signed: false,
      geoStamp: null,
      checklist,
      finding: '',
      completed: false,
      flagged: false,
    }
  }
  return progress[jobId]
}

const activeProgress = computed(() => {
  const j = activeJob.value
  return j ? ensureProgress(j.id) : null
})

// ──────────────────────────────────────────────────────────────
// Back-office event feed + sync queue
// ──────────────────────────────────────────────────────────────

type EventStatus = 'queued' | 'syncing' | 'synced'

interface FeedEvent {
  id: string
  ts: number
  persona: Persona
  jobId: string
  jobCategory: string
  customer: string
  action: string
  detail?: string
  status: EventStatus
}

const events = ref<FeedEvent[]>([])
const MAX_FEED = 14

let evCounter = 0
function uniq(): string {
  evCounter += 1
  return `e-${Date.now().toString(36)}-${evCounter}`
}

function fmtTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function emit(action: string, detail?: string) {
  const j = activeJob.value
  const ev: FeedEvent = {
    id: uniq(),
    ts: Date.now(),
    persona: personaSlug.value,
    jobId: j?.id ?? '—',
    jobCategory: j?.category ?? '—',
    customer: j?.customer ?? '—',
    action,
    detail,
    status: online.value ? 'syncing' : 'queued',
  }
  events.value = [ev, ...events.value].slice(0, MAX_FEED)
  if (online.value) {
    // Brief "syncing" beat, then settle to synced — feels like a network round-trip.
    setTimeout(() => {
      const target = events.value.find((e) => e.id === ev.id)
      if (target && target.status === 'syncing') target.status = 'synced'
    }, 280)
  }
}

// Track timers so a persona switch / unmount can clear them without leaks.
const syncTimers: number[] = []

function clearTimers() {
  while (syncTimers.length) {
    const id = syncTimers.shift()
    if (id !== undefined) window.clearTimeout(id)
  }
}

function flushQueue() {
  const queued = events.value.filter((e) => e.status === 'queued')
  // Oldest first so the visual feed flushes in the order the user took action.
  const ordered = [...queued].reverse()
  ordered.forEach((ev, i) => {
    const start = window.setTimeout(() => {
      ev.status = 'syncing'
      const end = window.setTimeout(() => {
        ev.status = 'synced'
      }, 320)
      syncTimers.push(end)
    }, 200 + i * 220)
    syncTimers.push(start)
  })
}

watch(online, (now, prev) => {
  if (now && !prev) flushQueue()
})

// Switching persona resets the day: clear progress, clear feed, return to list.
function switchPersona(p: Persona) {
  if (p === personaSlug.value) return
  clearTimers()
  personaSlug.value = p
  for (const k of Object.keys(progress)) delete progress[k]
  events.value = []
  screen.value = 'list'
  activeJobId.value = null
}

onUnmounted(clearTimers)

// ──────────────────────────────────────────────────────────────
// Phone interactions
// ──────────────────────────────────────────────────────────────

function openJob(jobId: string) {
  activeJobId.value = jobId
  screen.value = 'job'
  ensureProgress(jobId)
  const j = jobs.value.find((x) => x.id === jobId)!
  emit('Job opened', `${j.id} · ${j.category}`)
}

function backToList() {
  screen.value = 'list'
  activeJobId.value = null
}

const photoTones: Array<'sky' | 'slate' | 'amber' | 'lime'> = ['sky', 'slate', 'amber', 'lime']
const photoCaptions = [
  'Site overview',
  'Close-up',
  'Wide angle',
  'Detail shot',
]

const shutterFlash = ref(false)

function takePhoto() {
  const ap = activeProgress.value
  if (!ap) return
  if (ap.photos.length >= 4) return
  shutterFlash.value = true
  setTimeout(() => { shutterFlash.value = false }, 180)
  const tone = photoTones[ap.photos.length % photoTones.length]
  const caption = photoCaptions[ap.photos.length % photoCaptions.length]
  ap.photos.push({ id: uniq(), tone })
  emit('Photo captured', `${caption} · ${ap.photos.length}/4`)
}

function captureGeo() {
  const ap = activeProgress.value
  const j = activeJob.value
  if (!ap || !j) return
  // Deterministic-but-varied mock coordinate derived from job id, so each job
  // shows different lat/lng without needing real geolocation.
  const seed = j.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const lat = (-(26 + (seed % 40) / 100)).toFixed(4) + '° S'
  const lng = ((28 + (seed % 55) / 100)).toFixed(4) + '° E'
  const acc = `±${4 + (seed % 6)}m`
  ap.geoStamp = { lat, lng, acc, at: fmtTime(Date.now()) }
  emit('Geo-stamp captured', `${lat} ${lng} · ${acc}`)
}

function toggleCheck(name: string) {
  const ap = activeProgress.value
  if (!ap) return
  ap.checklist[name] = !ap.checklist[name]
  emit(`Checklist · ${ap.checklist[name] ? 'ticked' : 'cleared'}`, name)
}

const signing = ref(false)
function sign() {
  const ap = activeProgress.value
  if (!ap || ap.signed) return
  signing.value = true
  setTimeout(() => {
    signing.value = false
    ap.signed = true
    emit('Signature captured', `${cfg.value.signatureLabel}`)
  }, 850)
}

function clearSignature() {
  const ap = activeProgress.value
  if (!ap) return
  ap.signed = false
  emit('Signature cleared')
}

let findingFlushTimer: number | null = null
function onFindingInput() {
  if (findingFlushTimer) window.clearTimeout(findingFlushTimer)
  findingFlushTimer = window.setTimeout(() => {
    const ap = activeProgress.value
    if (!ap) return
    if (ap.finding.trim().length === 0) return
    emit('Finding recorded', ap.finding.slice(0, 60) + (ap.finding.length > 60 ? '…' : ''))
  }, 600)
}

function completeJob() {
  const ap = activeProgress.value
  const j = activeJob.value
  if (!ap || !j) return
  ap.completed = true
  emit('Job completed', `${j.id}`)
  backToList()
}

function flagForTomorrow() {
  const ap = activeProgress.value
  const j = activeJob.value
  if (!ap || !j) return
  ap.flagged = !ap.flagged
  emit(ap.flagged ? 'Flagged for tomorrow' : 'Flag cleared', j.id)
}

function endOfDay() {
  emit('Daily summary submitted', `${completedCount.value}/${jobs.value.length} ${cfg.value.nounPlural}`)
  screen.value = 'summary'
}

// ──────────────────────────────────────────────────────────────
// Derived counters
// ──────────────────────────────────────────────────────────────

const completedCount = computed(() =>
  jobs.value.filter((j) => progress[j.id]?.completed).length,
)
const flaggedCount = computed(() =>
  jobs.value.filter((j) => progress[j.id]?.flagged).length,
)
const queuedCount = computed(() =>
  events.value.filter((e) => e.status === 'queued').length,
)
const syncedCount = computed(() =>
  events.value.filter((e) => e.status === 'synced').length,
)

const allChecked = computed(() => {
  const ap = activeProgress.value
  if (!ap) return false
  return Object.values(ap.checklist).every(Boolean)
})

// ──────────────────────────────────────────────────────────────
// UI helpers
// ──────────────────────────────────────────────────────────────

function personaIcon(slug: Persona) {
  return personaCfg(slug).icon
}

function personaInitial(slug: Persona): string {
  return personaCfg(slug).short.charAt(0).toUpperCase()
}

const photoToneClasses: Record<string, string> = {
  sky:   'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25',
  slate: 'bg-slate-100 text-slate-500 ring-slate-200',
  amber: 'bg-amber-50 text-amber-600 ring-amber-200',
  lime:  'bg-emerald-50 text-emerald-600 ring-emerald-200',
}

const eventStatusLabel: Record<EventStatus, string> = {
  queued:  'Queued',
  syncing: 'Syncing',
  synced:  'Synced',
}

const eventStatusClass: Record<EventStatus, string> = {
  queued:  'bg-amber-50 text-amber-700 ring-amber-200',
  syncing: 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25',
  synced:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

</script>

<template>
  <div class="relative">
    <!-- ────── Control bar: persona + connection ────── -->
    <div class="border-b border-line bg-surface-alt/60 px-3 sm:px-4 md:px-6 py-3 md:py-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          <span class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Persona
          </span>
          <div
            class="-mx-1 px-1 flex items-center gap-1.5 overflow-x-auto scroll-px-1 scrollbar-none"
            role="tablist"
            aria-label="Persona"
          >
            <button
              v-for="p in PERSONAS"
              :key="p.slug"
              type="button"
              role="tab"
              :aria-selected="p.slug === personaSlug"
              class="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
              :class="p.slug === personaSlug
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink hover:border-ink/30'"
              @click="switchPersona(p.slug)"
            >
              <component :is="p.icon" :size="13" :stroke-width="2" aria-hidden="true" />
              {{ p.short }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[11px] uppercase tracking-[0.22em] text-mute-2 font-semibold hidden sm:inline">
            Connection
          </span>
          <button
            type="button"
            class="group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
            :class="online
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'"
            :aria-pressed="online"
            @click="online = !online"
          >
            <component :is="online ? Wifi : WifiOff" :size="14" :stroke-width="2" aria-hidden="true" />
            {{ online ? 'Online' : 'Offline' }}
            <span
              v-if="!online && queuedCount > 0"
              class="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-amber-600 text-white text-[10.5px] font-semibold px-1.5"
              aria-label="Queued actions"
            >
              {{ queuedCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- ────── Main demo grid: phone + back-office ────── -->
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-0">

      <!-- Phone mockup column -->
      <div class="border-b lg:border-b-0 lg:border-r border-line bg-surface-alt/40 px-3 sm:px-4 md:px-6 py-5 sm:py-6 md:py-8 flex justify-center">
        <div
          class="phone-frame relative w-[280px] h-[560px] rounded-[36px] bg-ink shadow-[0_30px_60px_-28px_rgba(15,23,42,0.4),0_10px_25px_-12px_rgba(15,23,42,0.18)]"
          aria-label="Field app — phone mockup"
        >
          <!-- Notch -->
          <div
            class="absolute top-2 left-1/2 -translate-x-1/2 h-[22px] w-[110px] rounded-b-2xl bg-ink z-10 flex items-end justify-center pb-1"
            aria-hidden="true"
          >
            <span class="h-[5px] w-[5px] rounded-full bg-slate-700" />
          </div>

          <!-- Screen -->
          <div class="absolute inset-[6px] rounded-[30px] bg-white overflow-hidden flex flex-col">
            <!-- Status bar -->
            <div class="h-[28px] px-4 pt-1.5 flex items-center justify-between text-[10.5px] font-medium text-ink tabular-nums">
              <span>{{ activeJob?.time ?? '08:14' }}</span>
              <div class="flex items-center gap-1 text-ink/70">
                <Signal :size="10" :stroke-width="2.5" />
                <component
                  :is="online ? Wifi : WifiOff"
                  :size="10"
                  :stroke-width="2.5"
                />
                <Battery :size="12" :stroke-width="2.5" />
              </div>
            </div>

            <!-- Connection banner when offline -->
            <div
              v-if="!online"
              class="mx-2 mb-1 rounded-md bg-amber-50 ring-1 ring-inset ring-amber-200 px-2.5 py-1 flex items-center gap-1.5 text-[10.5px] text-amber-700 font-medium"
              role="status"
            >
              <WifiOff :size="11" :stroke-width="2.25" />
              <span>Offline · actions will sync when you're back.</span>
            </div>

            <!-- LIST screen -->
            <div v-if="screen === 'list'" class="flex-1 overflow-y-auto px-3 pb-3">
              <header class="px-1 pt-2 pb-3">
                <p class="text-[10px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                  {{ cfg.short }}
                </p>
                <h3 class="font-display text-[20px] leading-[1.15] text-ink mt-1">
                  {{ cfg.dayTitle }}
                </h3>
                <p class="text-[11.5px] text-mute mt-0.5">
                  {{ completedCount }} of {{ jobs.length }} done
                  <span v-if="flaggedCount > 0">
                    · {{ flaggedCount }} flagged
                  </span>
                </p>
              </header>

              <ul class="space-y-2">
                <li v-for="j in jobs" :key="j.id">
                  <button
                    type="button"
                    class="w-full text-left rounded-xl border bg-white p-2.5 transition-colors"
                    :class="progress[j.id]?.completed
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : progress[j.id]?.flagged
                        ? 'border-amber-200 bg-amber-50/40'
                        : 'border-line hover:border-ink/30'"
                    @click="openJob(j.id)"
                  >
                    <div class="flex items-start gap-2.5">
                      <span
                        class="mt-0.5 inline-flex items-center justify-center h-8 w-8 rounded-lg ring-1 shrink-0"
                        :class="progress[j.id]?.completed
                          ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                          : progress[j.id]?.flagged
                            ? 'bg-amber-100 text-amber-700 ring-amber-200'
                            : 'bg-surface-alt text-cyan-brand-deep ring-cyan-brand/25'"
                      >
                        <CheckCircle2 v-if="progress[j.id]?.completed" :size="14" :stroke-width="2" />
                        <FlagTriangleRight v-else-if="progress[j.id]?.flagged" :size="14" :stroke-width="2" />
                        <Building2 v-else :size="14" :stroke-width="2" />
                      </span>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5">
                          <span class="text-[10.5px] font-semibold text-mute-2 tabular-nums">{{ j.time }}</span>
                          <span class="text-[10px] text-mute-2">· {{ j.id }}</span>
                        </div>
                        <p class="text-[12.5px] font-semibold text-ink leading-tight mt-0.5 truncate">
                          {{ j.customer }}
                        </p>
                        <p class="text-[11px] text-mute leading-tight mt-0.5 truncate">
                          {{ j.address }}, {{ j.city }}
                        </p>
                        <p class="text-[10.5px] text-cyan-brand-deep mt-0.5 truncate">
                          {{ j.category }}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              </ul>

              <button
                v-if="completedCount + flaggedCount === jobs.length && completedCount + flaggedCount > 0"
                type="button"
                class="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink text-white text-[12.5px] font-semibold py-2.5 hover:bg-ink-soft transition-colors"
                @click="endOfDay"
              >
                End-of-day summary
                <ArrowRight :size="13" :stroke-width="2" />
              </button>
              <p v-else class="mt-3 text-[10.5px] text-mute-2 text-center">
                Complete or flag every {{ cfg.noun }} to roll up the day.
              </p>
            </div>

            <!-- JOB screen -->
            <div v-else-if="screen === 'job' && activeJob && activeProgress" class="flex-1 overflow-y-auto">
              <div class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-line/70 px-3 py-2 flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center justify-center h-8 w-8 rounded-full text-ink hover:bg-ink/5 transition"
                  aria-label="Back to list"
                  @click="backToList"
                >
                  <ChevronLeft :size="16" :stroke-width="2.25" />
                </button>
                <div class="min-w-0 flex-1">
                  <p class="text-[10.5px] text-mute-2 truncate">
                    {{ activeJob.time }} · {{ activeJob.id }}
                  </p>
                  <p class="text-[13px] font-semibold text-ink truncate leading-tight">
                    {{ activeJob.customer }}
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-semibold ring-1 transition-colors"
                  :class="activeProgress.flagged
                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                    : 'bg-white text-mute ring-line hover:text-ink'"
                  :aria-pressed="activeProgress.flagged"
                  @click="flagForTomorrow"
                >
                  <FlagTriangleRight :size="11" :stroke-width="2.25" />
                  Flag
                </button>
              </div>

              <div class="px-3 pt-3 pb-4 space-y-3">
                <!-- Address card -->
                <section class="rounded-xl border border-line p-2.5">
                  <p class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    Address
                  </p>
                  <p class="text-[12.5px] text-ink mt-1 leading-snug">
                    {{ activeJob.address }}, {{ activeJob.city }}
                  </p>
                  <p class="text-[11px] text-cyan-brand-deep mt-1">
                    {{ activeJob.category }}
                  </p>
                </section>

                <!-- Equipment / history -->
                <section
                  v-if="activeJob.equipment.length || activeJob.history.length"
                  class="rounded-xl border border-line p-2.5"
                >
                  <p class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    Equipment &amp; history
                  </p>
                  <ul v-if="activeJob.equipment.length" class="mt-1.5 space-y-1">
                    <li
                      v-for="e in activeJob.equipment"
                      :key="e"
                      class="text-[11.5px] text-ink leading-tight flex items-start gap-1.5"
                    >
                      <CircleDot :size="10" :stroke-width="2.25" class="mt-0.5 shrink-0 text-cyan-brand-deep" />
                      <span class="truncate">{{ e }}</span>
                    </li>
                  </ul>
                  <ul v-if="activeJob.history.length" class="mt-2 space-y-1 pt-2 border-t border-line/70">
                    <li
                      v-for="(h, i) in activeJob.history"
                      :key="i"
                      class="text-[10.5px] text-mute leading-tight"
                    >
                      <span class="text-mute-2 tabular-nums">{{ h.date }}</span> ·
                      <span class="text-ink/85">{{ h.note }}</span>
                    </li>
                  </ul>
                </section>

                <!-- Last-visit photos -->
                <section v-if="activeJob.lastPhotos.length" class="rounded-xl border border-line p-2.5">
                  <p class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    Last visit · photos
                  </p>
                  <div class="mt-1.5 grid grid-cols-2 gap-1.5">
                    <figure
                      v-for="(p, i) in activeJob.lastPhotos"
                      :key="i"
                      class="rounded-lg overflow-hidden ring-1"
                      :class="photoToneClasses[p.tone]"
                    >
                      <div class="h-[60px] flex items-center justify-center">
                        <ImageIcon :size="18" :stroke-width="1.75" />
                      </div>
                      <figcaption class="text-[9.5px] px-1.5 py-0.5 text-center bg-white/70 text-ink/70 truncate">
                        {{ p.caption }}
                      </figcaption>
                    </figure>
                  </div>
                </section>

                <!-- Photo capture -->
                <section class="rounded-xl border border-line p-2.5">
                  <div class="flex items-center justify-between">
                    <p class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                      On-site photos
                    </p>
                    <span class="text-[10px] text-mute-2 tabular-nums">{{ activeProgress.photos.length }}/4</span>
                  </div>
                  <div class="mt-1.5 grid grid-cols-4 gap-1.5">
                    <figure
                      v-for="p in activeProgress.photos"
                      :key="p.id"
                      class="rounded-lg ring-1 h-[48px] flex items-center justify-center"
                      :class="photoToneClasses[p.tone]"
                    >
                      <ImageIcon :size="14" :stroke-width="1.75" />
                    </figure>
                    <button
                      v-if="activeProgress.photos.length < 4"
                      type="button"
                      class="rounded-lg border border-dashed border-line h-[48px] flex items-center justify-center text-mute hover:text-ink hover:border-ink/30 transition-colors"
                      aria-label="Take photo"
                      @click="takePhoto"
                    >
                      <Camera :size="14" :stroke-width="1.9" />
                    </button>
                  </div>
                </section>

                <!-- Geo-stamp -->
                <section class="rounded-xl border border-line p-2.5">
                  <p class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    Geo-stamp
                  </p>
                  <div v-if="activeProgress.geoStamp" class="mt-1.5 text-[11px] text-ink leading-tight">
                    <div class="flex items-center gap-1.5">
                      <MapPin :size="12" :stroke-width="2.25" class="text-cyan-brand-deep" />
                      <span class="tabular-nums">{{ activeProgress.geoStamp.lat }} · {{ activeProgress.geoStamp.lng }}</span>
                    </div>
                    <p class="text-[10px] text-mute mt-0.5">
                      Accuracy {{ activeProgress.geoStamp.acc }} · captured {{ activeProgress.geoStamp.at }}
                    </p>
                  </div>
                  <button
                    v-else
                    type="button"
                    class="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink hover:border-ink/30 transition-colors"
                    @click="captureGeo"
                  >
                    <MapPin :size="12" :stroke-width="2.25" />
                    Drop pin
                  </button>
                </section>

                <!-- Checklist -->
                <section class="rounded-xl border border-line p-2.5">
                  <p class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold flex items-center gap-1.5">
                    <ListChecks :size="11" :stroke-width="2.25" />
                    Checklist
                  </p>
                  <ul class="mt-1.5 space-y-1">
                    <li v-for="item in cfg.checklist" :key="item">
                      <label class="flex items-start gap-2 text-[11.5px] text-ink cursor-pointer select-none">
                        <span
                          class="mt-0.5 inline-flex items-center justify-center h-[16px] w-[16px] rounded-[4px] ring-1 shrink-0 transition-colors"
                          :class="activeProgress.checklist[item]
                            ? 'bg-cyan-brand text-ink ring-cyan-brand'
                            : 'bg-white ring-line'"
                        >
                          <Check v-if="activeProgress.checklist[item]" :size="11" :stroke-width="3" />
                        </span>
                        <input
                          type="checkbox"
                          class="sr-only"
                          :checked="activeProgress.checklist[item]"
                          @change="toggleCheck(item)"
                        />
                        <span class="leading-tight">{{ item }}</span>
                      </label>
                    </li>
                  </ul>
                </section>

                <!-- Finding -->
                <section class="rounded-xl border border-line p-2.5">
                  <p class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    {{ cfg.findingLabel }}
                  </p>
                  <textarea
                    v-model="activeProgress.finding"
                    rows="3"
                    :placeholder="cfg.findingPlaceholder"
                    class="mt-1.5 w-full rounded-md border border-line bg-white px-2 py-1.5 text-[11.5px] leading-snug text-ink placeholder:text-mute-2 focus:outline-none focus:border-cyan-brand focus:ring-2 focus:ring-cyan-brand/30 resize-none"
                    @input="onFindingInput"
                  />
                </section>

                <!-- E-sign -->
                <section class="rounded-xl border border-line p-2.5">
                  <p class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    {{ cfg.signatureLabel }}
                  </p>
                  <div class="mt-1.5 rounded-md ring-1 ring-line bg-surface-alt h-[58px] relative overflow-hidden flex items-center justify-center">
                    <svg
                      v-if="activeProgress.signed || signing"
                      viewBox="0 0 160 40"
                      class="h-[36px] w-[140px]"
                      :class="{ 'sig-drawing': signing }"
                      aria-hidden="true"
                    >
                      <path
                        class="sig-path"
                        d="M5 28 C 15 5, 25 5, 35 28 S 55 5, 65 28 T 95 28 T 125 28 C 135 18, 145 18, 155 22"
                        fill="none"
                        stroke="#0A0F1A"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span v-else class="text-[11px] text-mute-2 italic">Customer signs here</span>
                  </div>
                  <div class="mt-1.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-[10.5px] font-medium text-ink hover:border-ink/30 transition-colors"
                      :disabled="activeProgress.signed || signing"
                      :class="{ 'opacity-50 cursor-not-allowed': activeProgress.signed || signing }"
                      @click="sign"
                    >
                      <PenLine :size="10" :stroke-width="2.25" />
                      {{ activeProgress.signed ? 'Signed' : signing ? 'Signing…' : 'Sign' }}
                    </button>
                    <button
                      v-if="activeProgress.signed"
                      type="button"
                      class="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-[10.5px] font-medium text-mute hover:text-ink hover:border-ink/30 transition-colors"
                      @click="clearSignature"
                    >
                      <Trash2 :size="10" :stroke-width="2.25" />
                      Clear
                    </button>
                  </div>
                </section>

                <!-- Complete -->
                <button
                  type="button"
                  class="w-full inline-flex items-center justify-center gap-1.5 rounded-lg text-white text-[12.5px] font-semibold py-2.5 transition-colors"
                  :class="allChecked && activeProgress.signed
                    ? 'bg-ink hover:bg-ink-soft'
                    : 'bg-ink/40 cursor-not-allowed'"
                  :disabled="!(allChecked && activeProgress.signed)"
                  @click="completeJob"
                >
                  <CheckCircle2 :size="14" :stroke-width="2" />
                  Complete {{ cfg.noun }}
                </button>
                <p
                  v-if="!(allChecked && activeProgress.signed)"
                  class="text-[10px] text-mute-2 text-center -mt-1"
                >
                  Tick every item and capture a signature to close out.
                </p>
              </div>
            </div>

            <!-- SUMMARY screen -->
            <div v-else-if="screen === 'summary'" class="flex-1 overflow-y-auto px-3 pb-3">
              <header class="px-1 pt-2 pb-3">
                <p class="text-[10px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                  End of day
                </p>
                <h3 class="font-display text-[20px] leading-[1.15] text-ink mt-1">
                  Daily summary
                </h3>
                <p class="text-[11.5px] text-mute mt-0.5">
                  {{ cfg.short }} · {{ jobs.length }} {{ cfg.nounPlural }} planned
                </p>
              </header>

              <div class="grid grid-cols-3 gap-1.5">
                <div class="rounded-lg border border-line p-2 text-center">
                  <p class="font-display text-[22px] leading-none text-ink">{{ completedCount }}</p>
                  <p class="text-[10px] text-mute-2 mt-1 uppercase tracking-[0.14em]">Done</p>
                </div>
                <div class="rounded-lg border border-line p-2 text-center">
                  <p class="font-display text-[22px] leading-none text-ink">{{ flaggedCount }}</p>
                  <p class="text-[10px] text-mute-2 mt-1 uppercase tracking-[0.14em]">Flagged</p>
                </div>
                <div class="rounded-lg border border-line p-2 text-center">
                  <p class="font-display text-[22px] leading-none text-ink">{{ jobs.length - completedCount - flaggedCount }}</p>
                  <p class="text-[10px] text-mute-2 mt-1 uppercase tracking-[0.14em]">Open</p>
                </div>
              </div>

              <section class="mt-3 rounded-xl border border-line p-2.5">
                <p class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                  Route
                </p>
                <ol class="mt-2 relative pl-3">
                  <span class="absolute top-1 bottom-1 left-[5px] w-px bg-line" aria-hidden="true" />
                  <li
                    v-for="j in jobs"
                    :key="j.id"
                    class="relative pb-2 last:pb-0"
                  >
                    <span
                      class="absolute -left-[6px] top-1 inline-block h-[11px] w-[11px] rounded-full ring-2 ring-white"
                      :class="progress[j.id]?.completed
                        ? 'bg-emerald-500'
                        : progress[j.id]?.flagged
                          ? 'bg-amber-500'
                          : 'bg-slate-300'"
                      aria-hidden="true"
                    />
                    <div class="pl-3">
                      <p class="text-[11px] text-ink leading-tight truncate">
                        <span class="tabular-nums text-mute-2">{{ j.time }}</span>
                        · {{ j.customer }}
                      </p>
                      <p class="text-[10px] text-mute leading-tight truncate">
                        {{ j.address }}, {{ j.city }}
                      </p>
                    </div>
                  </li>
                </ol>
              </section>

              <button
                type="button"
                class="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white text-ink text-[12.5px] font-semibold py-2.5 hover:border-ink/30 transition-colors"
                @click="screen = 'list'"
              >
                <ChevronLeft :size="13" :stroke-width="2.25" />
                Back to list
              </button>
            </div>

            <!-- Shutter flash overlay -->
            <div
              class="pointer-events-none absolute inset-0 bg-white transition-opacity duration-150"
              :class="shutterFlash ? 'opacity-80' : 'opacity-0'"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <!-- Back-office pane -->
      <div class="px-4 sm:px-5 md:px-6 py-5 sm:py-6 md:py-8 bg-white">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p class="text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold inline-flex items-center gap-2">
              <span class="dot" />
              Back office · live feed
            </p>
            <h3 class="mt-2 font-display text-[18px] sm:text-[22px] md:text-[26px] leading-[1.15] text-ink">
              What the office sees, the moment the field works.
            </h3>
            <p class="mt-1.5 text-[13px] text-mute max-w-md">
              When you're online, every action lands here in seconds. When you're offline, it queues
              locally and flushes the moment connectivity returns.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <div
              class="inline-flex items-center gap-1.5 rounded-full bg-surface-alt ring-1 ring-line px-2.5 py-1 text-[11.5px] font-medium"
              :class="queuedCount > 0 ? 'text-amber-700' : 'text-mute'"
            >
              <Inbox :size="13" :stroke-width="2" />
              {{ queuedCount }} queued
            </div>
            <div class="inline-flex items-center gap-1.5 rounded-full bg-surface-alt ring-1 ring-line px-2.5 py-1 text-[11.5px] font-medium text-emerald-700">
              <CheckCircle2 :size="13" :stroke-width="2" />
              {{ syncedCount }} synced
            </div>
          </div>
        </div>

        <!-- Feed -->
        <div class="mt-5 rounded-xl border border-line bg-surface-alt/40">
          <div class="px-3 py-2 border-b border-line/70 flex items-center justify-between">
            <span class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold inline-flex items-center gap-1.5">
              <Activity :size="12" :stroke-width="2.25" />
              Activity stream
            </span>
            <span v-if="!online && queuedCount > 0" class="text-[11px] text-amber-700 inline-flex items-center gap-1">
              <RefreshCw :size="11" :stroke-width="2.25" class="opacity-70" />
              Will flush when reconnected
            </span>
          </div>

          <ul v-if="events.length" class="divide-y divide-line/70 max-h-[460px] overflow-y-auto">
            <li
              v-for="ev in events"
              :key="ev.id"
              class="flex items-start gap-3 px-3 py-2.5"
            >
              <span
                class="mt-0.5 inline-flex items-center justify-center h-7 w-7 rounded-lg ring-1 shrink-0"
                :class="ev.status === 'queued'
                  ? 'bg-amber-50 text-amber-700 ring-amber-200'
                  : ev.status === 'syncing'
                    ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                    : 'bg-emerald-50 text-emerald-700 ring-emerald-200'"
                aria-hidden="true"
              >
                <component
                  :is="ev.status === 'synced' ? CheckCircle2 : ev.status === 'syncing' ? RefreshCw : Inbox"
                  :size="13"
                  :stroke-width="2"
                  :class="{ 'animate-spin-slow': ev.status === 'syncing' }"
                />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[12.5px] font-semibold text-ink leading-tight">
                    {{ ev.action }}
                  </span>
                  <span class="text-[10.5px] text-mute-2 tabular-nums">{{ fmtTime(ev.ts) }}</span>
                  <span
                    class="ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-[0.08em]"
                    :class="eventStatusClass[ev.status]"
                  >
                    {{ eventStatusLabel[ev.status] }}
                  </span>
                </div>
                <p v-if="ev.detail" class="text-[11.5px] text-mute leading-tight mt-0.5">
                  {{ ev.detail }}
                </p>
                <p class="text-[10.5px] text-mute-2 leading-tight mt-0.5 inline-flex items-center gap-1.5">
                  <span class="inline-flex items-center justify-center h-[14px] w-[14px] rounded-full bg-ink text-white text-[8.5px] font-bold">
                    {{ personaInitial(ev.persona) }}
                  </span>
                  <component :is="personaIcon(ev.persona)" :size="10" :stroke-width="2.25" class="text-mute" />
                  <span>{{ ev.jobId }} · {{ ev.customer }}</span>
                </p>
              </div>
            </li>
          </ul>

          <div
            v-else
            class="px-6 py-10 text-center"
          >
            <span class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white ring-1 ring-line text-cyan-brand-deep mb-2">
              <FileText :size="16" :stroke-width="1.9" />
            </span>
            <p class="text-[13px] text-ink font-medium">No activity yet.</p>
            <p class="text-[12px] text-mute mt-1 max-w-xs mx-auto">
              Open a job on the phone, take a photo, tick a checklist item — the feed will fill in
              real time.
            </p>
          </div>
        </div>

        <!-- Hint strip -->
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div class="rounded-lg border border-line bg-white px-3 py-2 flex items-start gap-2">
            <Camera :size="14" :stroke-width="2" class="mt-0.5 text-cyan-brand-deep shrink-0" />
            <p class="text-[11.5px] text-ink leading-tight">
              Capture photos, geo-stamps and signatures from the phone.
            </p>
          </div>
          <div class="rounded-lg border border-line bg-white px-3 py-2 flex items-start gap-2">
            <WifiOff :size="14" :stroke-width="2" class="mt-0.5 text-amber-600 shrink-0" />
            <p class="text-[11.5px] text-ink leading-tight">
              Toggle Offline — actions keep working and queue locally.
            </p>
          </div>
          <div class="rounded-lg border border-line bg-white px-3 py-2 flex items-start gap-2">
            <RefreshCw :size="14" :stroke-width="2" class="mt-0.5 text-cyan-brand-deep shrink-0" />
            <p class="text-[11.5px] text-ink leading-tight">
              Flip back Online to watch the queue flush in order.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.phone-frame {
  /* Phone bezel — gives the frame a subtle inner highlight without a gradient. */
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 30px 60px -28px rgba(15, 23, 42, 0.4),
    0 10px 25px -12px rgba(15, 23, 42, 0.18);
}

/* Animated signature drawing — pen sweeps left to right. */
.sig-path {
  stroke-dasharray: 320;
  stroke-dashoffset: 0;
}
.sig-drawing .sig-path {
  stroke-dashoffset: 320;
  animation: sig-draw 850ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes sig-draw {
  to { stroke-dashoffset: 0; }
}

/* Slow spin for "syncing" indicator — gentler than Tailwind's default. */
.animate-spin-slow {
  animation: spin-slow 1.4s linear infinite;
}
@keyframes spin-slow {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .sig-drawing .sig-path,
  .animate-spin-slow {
    animation: none !important;
  }
}
</style>
