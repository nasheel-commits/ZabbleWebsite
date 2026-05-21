<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import { AlertTriangle, ArrowRight, Bell, Calendar, CalendarCheck, Check, ClipboardList, Clock, CreditCard, Eye, FolderPlus, Mail, MessageCircle, Pause, PenLine, Play, RotateCcw, ShieldCheck, Sparkles, Upload, User, UserPlus } from '@lucide/vue'

import type { Component } from 'vue'

interface ClientStep {
  id: ClientStepId
  label: string
  sub: string
  icon: Component
  triggers: FirmStepId
}

interface FirmStep {
  id: FirmStepId
  label: string
  sub: string
  role: string
  icon: Component
  triggerSource: ClientStepId
  processMs: number
}

type ClientStepId =
  | 'upload-id'
  | 'esign-engagement'
  | 'risk-profile'
  | 'payment-setup'
  | 'pick-kickoff'

type FirmStepId =
  | 'kyc-verify'
  | 'file-setup'
  | 'advisor-assign'
  | 'welcome-pack'
  | 'kickoff-prep'

const CLIENT_STEPS: ClientStep[] = [
  { id: 'upload-id',         label: 'Upload ID',              sub: 'Passport or driver licence',            icon: Upload,        triggers: 'kyc-verify' },
  { id: 'esign-engagement',  label: 'Sign engagement letter', sub: 'Services agreement & FICA disclosures', icon: PenLine,       triggers: 'file-setup' },
  { id: 'risk-profile',      label: 'Complete risk profile',  sub: '12 questions, ~3 minutes',              icon: ClipboardList, triggers: 'advisor-assign' },
  { id: 'payment-setup',     label: 'Set up payment',         sub: 'Debit order or once-off transfer',      icon: CreditCard,    triggers: 'welcome-pack' },
  { id: 'pick-kickoff',      label: 'Pick kick-off date',     sub: 'Choose first advisor meeting',          icon: Calendar,      triggers: 'kickoff-prep' },
]

const FIRM_STEPS: FirmStep[] = [
  { id: 'kyc-verify',      label: 'KYC verification',         sub: 'AML, sanctions, PEP screening',           role: 'Compliance team',  icon: ShieldCheck,   triggerSource: 'upload-id',        processMs: 1800 },
  { id: 'file-setup',      label: 'Contract & file setup',    sub: 'Engagement filed, client folder created', role: 'Ops admin',        icon: FolderPlus,    triggerSource: 'esign-engagement', processMs: 900 },
  { id: 'advisor-assign',  label: 'Advisor assignment',       sub: 'Matched to risk band and sector',         role: 'Manager',          icon: UserPlus,      triggerSource: 'risk-profile',     processMs: 1100 },
  { id: 'welcome-pack',    label: 'Welcome pack sent',        sub: 'Branded portfolio and portal login',      role: 'Client services',  icon: Mail,          triggerSource: 'payment-setup',    processMs: 700 },
  { id: 'kickoff-prep',    label: 'Kick-off prep',            sub: 'Advisor briefed, meeting confirmed',      role: 'Advisor',          icon: CalendarCheck, triggerSource: 'pick-kickoff',     processMs: 1500 },
]

// ---------------------------------------------------------------------------
// Reactive state — the focus onboarding
// ---------------------------------------------------------------------------

type ClientStatus = 'pending' | 'done'
type FirmStatus = 'pending' | 'processing' | 'done'

const clientState = reactive<Record<ClientStepId, ClientStatus>>({
  'upload-id':        'pending',
  'esign-engagement': 'pending',
  'risk-profile':     'pending',
  'payment-setup':    'pending',
  'pick-kickoff':     'pending',
})

const firmState = reactive<Record<FirmStepId, FirmStatus>>({
  'kyc-verify':     'pending',
  'file-setup':     'pending',
  'advisor-assign': 'pending',
  'welcome-pack':   'pending',
  'kickoff-prep':   'pending',
})

interface ActivityEntry {
  t: number
  label: string
  action: 'started' | 'complete'
}
const firmActivityLog = ref<ActivityEntry[]>([])

const startedAt = ref<number | null>(null)
const now = ref(Date.now())
const finalElapsedSeconds = ref<number | null>(null)

let tickTimer: ReturnType<typeof setInterval> | null = null
const firmTimers: ReturnType<typeof setTimeout>[] = []

function ensureTick() {
  if (tickTimer) return
  tickTimer = setInterval(() => { now.value = Date.now() }, 250)
}
function stopTick() {
  if (tickTimer) { clearInterval(tickTimer); tickTimer = null }
}

const elapsedSeconds = computed(() => {
  if (!startedAt.value) return 0
  return Math.floor((now.value - startedAt.value) / 1000)
})

function logFirmActivity(label: string, action: ActivityEntry['action']) {
  firmActivityLog.value.push({ t: elapsedSeconds.value, label, action })
}

const clientDoneCount = computed(() =>
  CLIENT_STEPS.filter((s) => clientState[s.id] === 'done').length,
)
const firmDoneCount = computed(() =>
  FIRM_STEPS.filter((s) => firmState[s.id] === 'done').length,
)
const isActive = computed(
  () => clientDoneCount.value === CLIENT_STEPS.length && firmDoneCount.value === FIRM_STEPS.length,
)

function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

function formatClock(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function completeClientStep(id: ClientStepId) {
  if (clientState[id] === 'done') return
  if (startedAt.value === null) {
    startedAt.value = Date.now()
    now.value = Date.now()
    ensureTick()
  }
  clientState[id] = 'done'

  const firmStep = FIRM_STEPS.find(
    (s) => s.id === CLIENT_STEPS.find((c) => c.id === id)!.triggers,
  )!
  firmState[firmStep.id] = 'processing'
  logFirmActivity(firmStep.label, 'started')
  const t = setTimeout(() => {
    firmState[firmStep.id] = 'done'
    logFirmActivity(firmStep.label, 'complete')
    if (isActive.value && finalElapsedSeconds.value === null) {
      finalElapsedSeconds.value = elapsedSeconds.value
      stopTick()
    }
  }, firmStep.processMs)
  firmTimers.push(t)

  if (stuckRunning.value) stopStuckScenario()
}

function resetOnboarding() {
  for (const s of CLIENT_STEPS) clientState[s.id] = 'pending'
  for (const s of FIRM_STEPS) firmState[s.id] = 'pending'
  startedAt.value = null
  finalElapsedSeconds.value = null
  now.value = Date.now()
  stopTick()
  for (const t of firmTimers) clearTimeout(t)
  firmTimers.length = 0
  stopStuckScenario()
  nudgeLog.value = []
  firmActivityLog.value = []
}

// ---------------------------------------------------------------------------
// Stuck-client simulator — picks the first pending client step and walks
// through an email nudge, a WhatsApp nudge, then an advisor escalation.
// ---------------------------------------------------------------------------

type NudgeChannel = 'email' | 'whatsapp' | 'advisor'

interface NudgeEntry {
  t: number
  channel: NudgeChannel
  text: string
}

const nudgeDelaySec = ref<number>(3)
const stuckRunning = ref(false)
const nudgeLog = ref<NudgeEntry[]>([])
let stuckTimer: ReturnType<typeof setTimeout> | null = null
let stuckNudgeCount = 0

const firstPendingClientStep = computed(() =>
  CLIENT_STEPS.find((s) => clientState[s.id] === 'pending') ?? null,
)

function startStuckScenario() {
  if (stuckRunning.value) return
  const step = firstPendingClientStep.value
  if (!step) return
  stuckRunning.value = true
  nudgeLog.value = []
  stuckNudgeCount = 0
  scheduleNextNudge(step.label)
}

function scheduleNextNudge(stepLabel: string) {
  stuckTimer = setTimeout(() => {
    stuckNudgeCount += 1
    const t = nudgeDelaySec.value * stuckNudgeCount
    if (stuckNudgeCount === 1) {
      nudgeLog.value.push({
        t,
        channel: 'email',
        text: `Email nudge sent — "${stepLabel}" still pending.`,
      })
      scheduleNextNudge(stepLabel)
    } else if (stuckNudgeCount === 2) {
      nudgeLog.value.push({
        t,
        channel: 'whatsapp',
        text: `WhatsApp nudge sent — same step, friendly tone.`,
      })
      scheduleNextNudge(stepLabel)
    } else {
      nudgeLog.value.push({
        t,
        channel: 'advisor',
        text: `Escalated to advisor Sarah K — two nudges ignored, client may need a call.`,
      })
      stuckTimer = null
    }
  }, nudgeDelaySec.value * 1000)
}

function stopStuckScenario() {
  if (stuckTimer) { clearTimeout(stuckTimer); stuckTimer = null }
  stuckRunning.value = false
}

onUnmounted(() => {
  stopTick()
  for (const t of firmTimers) clearTimeout(t)
  firmTimers.length = 0
  stopStuckScenario()
})

// ---------------------------------------------------------------------------
// Pipeline board — five mock onboardings, one of them stuck.
// ---------------------------------------------------------------------------

type BoardState = 'in-progress' | 'active' | 'stuck'

interface BoardRow {
  name: string
  context: string
  advisor: string
  doneClient: number
  doneFirm: number
  state: BoardState
  note?: string
}

const board: readonly BoardRow[] = [
  { name: 'Asha Patel',       context: 'Private equity exec',     advisor: 'Priya Reddy',     doneClient: 5, doneFirm: 4, state: 'in-progress', note: 'Kick-off prep finalising' },
  { name: 'Marcus Vellios',   context: 'Family office trustee',   advisor: 'Tariq Hendricks', doneClient: 5, doneFirm: 5, state: 'active' },
  { name: 'Yuki Hong',        context: 'Tech founder, post-exit', advisor: 'Sarah K',         doneClient: 1, doneFirm: 1, state: 'stuck', note: 'Engagement letter idle 3d · advisor notified' },
  { name: 'David Okonkwo',    context: 'Property developer',      advisor: 'Priya Reddy',     doneClient: 1, doneFirm: 0, state: 'in-progress', note: 'KYC running' },
  { name: 'Sophia Hartmann',  context: 'Surgeon, retiring',       advisor: 'Tariq Hendricks', doneClient: 5, doneFirm: 5, state: 'active' },
] as const

const boardSummary = computed(() => {
  const stuck = board.filter((r) => r.state === 'stuck').length
  const active = board.filter((r) => r.state === 'active').length
  const inProgress = board.length - active - stuck
  return { stuck, active, inProgress }
})

// ---------------------------------------------------------------------------
// Visual helpers
// ---------------------------------------------------------------------------

function clientStepClasses(status: ClientStatus): string {
  if (status === 'done') {
    return 'border-cyan-brand/40 ring-1 ring-cyan-brand/20 bg-white'
  }
  return 'border-line bg-white hover:border-cyan-brand/40'
}

function firmStepChip(status: FirmStatus): string {
  switch (status) {
    case 'done':       return 'bg-cyan-brand/15 text-cyan-brand-deep ring-cyan-brand/30'
    case 'processing': return 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/30 motion-safe:animate-pulse'
    case 'pending':    return 'bg-surface-alt text-mute-2 ring-line'
  }
}

function firmStatusLabel(status: FirmStatus): string {
  switch (status) {
    case 'done':       return 'Done'
    case 'processing': return 'Running'
    case 'pending':    return 'Waiting'
  }
}

function firmStatusColor(status: FirmStatus): string {
  switch (status) {
    case 'done':       return 'text-cyan-brand-deep'
    case 'processing': return 'text-cyan-brand-deep'
    case 'pending':    return 'text-mute-2'
  }
}

function boardChip(state: BoardState): { dot: string; chip: string; label: string } {
  switch (state) {
    case 'active':
      return { dot: 'bg-cyan-brand', chip: 'bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25', label: 'Active' }
    case 'stuck':
      return { dot: 'bg-[#DC2626]', chip: 'bg-[#FEF2F2] text-[#DC2626] ring-1 ring-[#FEE2E2]', label: 'Stuck' }
    case 'in-progress':
      return { dot: 'bg-mute-2/60', chip: 'bg-surface-alt text-mute-2 ring-1 ring-line', label: 'In progress' }
  }
}

</script>

<template>
  <div class="font-sans">
    <!-- Header strip -->
    <div class="relative border-b border-line bg-surface-alt/60">
      <div class="px-5 md:px-7 py-5 md:py-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <span class="dot" />
              Interactive demo
            </div>
            <span
              class="inline-flex items-center rounded-full border border-line bg-white px-2 py-0.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2"
            >
              Example scenario
            </span>
          </div>
          <div class="mt-2 flex items-center gap-3">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-cyan-brand-deep ring-1 ring-line">
              <User :size="18" :stroke-width="1.9" aria-hidden="true" />
            </span>
            <div>
              <div class="font-display text-[22px] md:text-[26px] leading-[1.1] text-ink">
                Aria Pillay · joining today
              </div>
              <div class="text-[13.5px] text-mute">
                HNW client onboarding · Pinnacle Wealth Advisors · Advisor: Sarah K
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="rounded-xl border border-line bg-white px-4 py-2.5 min-w-[10rem]">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
              Time to active
            </div>
            <div class="mt-0.5 font-display text-[22px] leading-[1.1] text-ink tabular-nums">
              {{ formatElapsed(finalElapsedSeconds ?? elapsedSeconds) }}
            </div>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="resetOnboarding"
          >
            <RotateCcw :size="14" :stroke-width="2" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      <!-- Old-way vs this-run strip -->
      <div class="px-5 md:px-7 pb-5">
        <div
          v-if="finalElapsedSeconds === null"
          class="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-mute"
        >
          <Clock :size="13" :stroke-width="2" aria-hidden="true" />
          Old way:&nbsp;<span class="text-ink font-semibold">~14 days</span>&nbsp;of email chase.
          <span class="text-cyan-brand-deep font-semibold ml-1">This is a sped-up demo of the live workflow.</span>
        </div>
        <div
          v-else
          class="inline-flex items-center gap-2 rounded-full border border-cyan-brand/40 bg-cyan-brand/8 px-3 py-1.5 text-[12.5px] text-ink"
        >
          <Sparkles :size="13" :stroke-width="2" aria-hidden="true" class="text-cyan-brand-deep" />
          Workflow complete.
          <span class="text-cyan-brand-deep font-semibold ml-1">In production: time-to-active under 2 days, down from ~14.</span>
        </div>
      </div>
    </div>

    <!-- Split view: client | firm -->
    <div class="px-5 md:px-7 pt-7 grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Client pane -->
      <section
        aria-labelledby="client-pane-heading"
        class="rounded-2xl border border-line bg-surface-alt/60 p-5"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <User :size="13" :stroke-width="2" aria-hidden="true" />
              What the client sees
            </div>
            <h4
              id="client-pane-heading"
              class="mt-1.5 font-display text-[20px] leading-[1.2] text-ink"
            >
              Aria's checklist
            </h4>
          </div>
          <span class="text-[11.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold tabular-nums">
            {{ clientDoneCount }} / {{ CLIENT_STEPS.length }}
          </span>
        </div>

        <ul class="mt-4 space-y-2.5">
          <li v-for="step in CLIENT_STEPS" :key="step.id">
            <button
              type="button"
              :disabled="clientState[step.id] === 'done'"
              :class="[
                'group w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                clientStepClasses(clientState[step.id]),
                clientState[step.id] === 'done' ? 'cursor-default' : 'cursor-pointer',
              ]"
              @click="completeClientStep(step.id)"
            >
              <span
                :class="[
                  'inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 shrink-0',
                  clientState[step.id] === 'done'
                    ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-cyan-brand/30'
                    : 'bg-surface-alt text-ink-soft ring-line',
                ]"
                aria-hidden="true"
              >
                <Check v-if="clientState[step.id] === 'done'" :size="16" :stroke-width="2.2" />
                <component v-else :is="step.icon" :size="16" :stroke-width="1.9" />
              </span>
              <span class="flex-1 min-w-0">
                <span class="block text-[14.5px] font-semibold text-ink leading-tight">
                  {{ step.label }}
                </span>
                <span class="block text-[12.5px] text-mute mt-0.5">{{ step.sub }}</span>
              </span>
              <span
                v-if="clientState[step.id] === 'done'"
                class="text-[11px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep"
              >
                Done
              </span>
              <ArrowRight
                v-else
                :size="14"
                :stroke-width="2"
                class="text-mute-2 group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </button>
          </li>
        </ul>
      </section>

      <!-- Firm pane -->
      <section
        aria-labelledby="firm-pane-heading"
        class="rounded-2xl border border-line bg-white p-5"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <ShieldCheck :size="13" :stroke-width="2" aria-hidden="true" />
              What the firm sees
            </div>
            <h4
              id="firm-pane-heading"
              class="mt-1.5 font-display text-[20px] leading-[1.2] text-ink"
            >
              The firm's queue
            </h4>
          </div>
          <span class="text-[11.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold tabular-nums">
            {{ firmDoneCount }} / {{ FIRM_STEPS.length }}
          </span>
        </div>

        <ul class="mt-4 space-y-2.5">
          <li
            v-for="step in FIRM_STEPS"
            :key="step.id"
            class="flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3"
          >
            <span
              :class="[
                'inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 shrink-0',
                firmStepChip(firmState[step.id]),
              ]"
              aria-hidden="true"
            >
              <Check v-if="firmState[step.id] === 'done'" :size="16" :stroke-width="2.2" />
              <component v-else :is="step.icon" :size="16" :stroke-width="1.9" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-[14.5px] font-semibold text-ink leading-tight">
                {{ step.label }}
              </span>
              <span class="block text-[12.5px] text-mute mt-0.5">
                <span class="font-semibold text-ink-soft">{{ step.role }}</span>
                <span class="text-mute-2"> · {{ step.sub }}</span>
              </span>
            </span>
            <span
              :class="[
                'text-[11px] uppercase tracking-[0.18em] font-semibold',
                firmStatusColor(firmState[step.id]),
              ]"
            >
              {{ firmStatusLabel(firmState[step.id]) }}
            </span>
          </li>
        </ul>

        <p class="mt-4 text-[12.5px] text-mute-2">
          Each firm step starts the moment the matching client step finishes — no inbox in between.
        </p>

        <!-- Activity log — every firm-step transition lands here with a
             relative timestamp. Makes the audit-trail pillar visible. -->
        <div
          v-if="firmActivityLog.length"
          class="mt-4 rounded-xl border border-line bg-surface-alt/60 p-3"
        >
          <div class="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
            <Eye :size="12" :stroke-width="2" aria-hidden="true" />
            Activity log
          </div>
          <ul class="mt-2 space-y-1">
            <li
              v-for="(a, i) in firmActivityLog"
              :key="i"
              class="flex items-baseline gap-3 text-[12.5px] text-ink"
            >
              <span class="text-mute-2 tabular-nums shrink-0">{{ formatClock(a.t) }}</span>
              <span class="min-w-0">
                {{ a.label }}
                <span class="text-mute-2"> · {{ a.action }}</span>
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- Stuck-client simulator -->
    <div class="px-5 md:px-7 pt-7">
      <section class="rounded-2xl border border-line bg-white p-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <Bell :size="13" :stroke-width="2" aria-hidden="true" />
              Stuck-client simulator
            </div>
            <h4 class="mt-1.5 font-display text-[20px] leading-[1.2] text-ink">
              If the client stalls, the system nudges. Then escalates.
            </h4>
            <p class="mt-2 text-[14px] text-mute max-w-prose">
              Email nudge first. WhatsApp nudge if that's ignored. Advisor escalation after two ignored nudges — without anyone watching.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <label class="flex items-center gap-2 text-[13px] text-ink">
              <span class="font-semibold">Nudge delay</span>
              <select
                v-model.number="nudgeDelaySec"
                :disabled="stuckRunning"
                class="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 disabled:opacity-60"
              >
                <option :value="2">2s</option>
                <option :value="3">3s</option>
                <option :value="5">5s</option>
              </select>
            </label>
            <button
              v-if="!stuckRunning"
              type="button"
              :disabled="firstPendingClientStep === null"
              class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink text-white px-3.5 py-2 text-[13.5px] font-semibold hover:bg-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="startStuckScenario"
            >
              <Play :size="14" :stroke-width="2" aria-hidden="true" />
              Simulate stuck client
            </button>
            <button
              v-else
              type="button"
              class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-[13.5px] font-semibold text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="stopStuckScenario"
            >
              <Pause :size="14" :stroke-width="2" aria-hidden="true" />
              Stop
            </button>
          </div>
        </div>

        <div v-if="nudgeLog.length" class="mt-5 rounded-xl border border-line bg-surface-alt/60 p-4">
          <ul class="space-y-2">
            <li
              v-for="(n, i) in nudgeLog"
              :key="i"
              class="flex items-center gap-3 text-[13.5px] text-ink"
            >
              <span
                :class="[
                  'inline-flex h-7 w-7 items-center justify-center rounded-lg ring-1 shrink-0',
                  n.channel === 'advisor'
                    ? 'bg-[#FEF2F2] text-[#DC2626] ring-[#FEE2E2]'
                    : 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25',
                ]"
                aria-hidden="true"
              >
                <Mail v-if="n.channel === 'email'" :size="13" :stroke-width="2" />
                <MessageCircle v-else-if="n.channel === 'whatsapp'" :size="13" :stroke-width="2" />
                <AlertTriangle v-else :size="13" :stroke-width="2" />
              </span>
              <span class="text-[12px] text-mute-2 tabular-nums w-12 shrink-0">T+{{ n.t }}s</span>
              <span class="min-w-0">{{ n.text }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- Pipeline board -->
    <div class="px-5 md:px-7 pt-7 pb-7">
      <section class="rounded-2xl border border-line bg-white overflow-hidden">
        <header class="px-5 py-4 border-b border-line flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <span class="dot" />
              Pipeline · this week
            </div>
            <h4 class="mt-1.5 font-display text-[20px] leading-[1.2] text-ink">
              Every active onboarding, in one view.
            </h4>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-[11.5px] text-mute-2">
            <span class="inline-flex items-center gap-1.5">
              <span class="h-1.5 w-1.5 rounded-full bg-cyan-brand" />
              {{ boardSummary.active }} active
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="h-1.5 w-1.5 rounded-full bg-mute-2/60" />
              {{ boardSummary.inProgress }} in progress
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
              {{ boardSummary.stuck }} stuck
            </span>
          </div>
        </header>

        <!-- KPI strip — surfaces the analytics pillar with the metrics the
             pillar note promises. Static illustrative figures. -->
        <div class="px-5 py-3 border-b border-line bg-surface-alt/40 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Median time-to-active</div>
            <div class="mt-0.5 font-display text-[18px] leading-[1.1] text-ink tabular-nums">1.7 days</div>
          </div>
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Stuck rate (30d)</div>
            <div class="mt-0.5 font-display text-[18px] leading-[1.1] text-ink tabular-nums">6%</div>
          </div>
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Nudge → resolved</div>
            <div class="mt-0.5 font-display text-[18px] leading-[1.1] text-ink tabular-nums">78%</div>
          </div>
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Mean nudges / client</div>
            <div class="mt-0.5 font-display text-[18px] leading-[1.1] text-ink tabular-nums">1.4</div>
          </div>
        </div>

        <ul class="divide-y divide-line">
          <li
            v-for="row in board"
            :key="row.name"
            class="px-5 py-4 flex flex-col gap-3 md:grid md:grid-cols-12 md:items-center md:gap-5"
          >
            <div class="md:col-span-3 min-w-0">
              <div class="text-[14.5px] font-semibold text-ink truncate">{{ row.name }}</div>
              <div class="text-[12.5px] text-mute truncate">
                {{ row.context }}
                <span class="text-mute-2"> · {{ row.advisor }}</span>
              </div>
            </div>

            <div class="md:col-span-3 flex items-center gap-2">
              <span class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold w-12 shrink-0">Client</span>
              <div class="flex-1 flex items-center gap-1">
                <span
                  v-for="n in 5"
                  :key="'c' + n"
                  :class="[
                    'h-1.5 flex-1 rounded-full',
                    n <= row.doneClient ? 'bg-ink' : 'bg-line',
                  ]"
                />
              </div>
            </div>

            <div class="md:col-span-3 flex items-center gap-2">
              <span class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold w-12 shrink-0">Firm</span>
              <div class="flex-1 flex items-center gap-1">
                <span
                  v-for="n in 5"
                  :key="'f' + n"
                  :class="[
                    'h-1.5 flex-1 rounded-full',
                    n <= row.doneFirm ? 'bg-cyan-brand-deep' : 'bg-line',
                  ]"
                />
              </div>
            </div>

            <div class="md:col-span-3 flex md:justify-end items-center gap-3 min-w-0">
              <span class="text-[12px] text-mute truncate md:text-right">{{ row.note }}</span>
              <span
                :class="[
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] font-semibold shrink-0',
                  boardChip(row.state).chip,
                ]"
              >
                <span
                  :class="['h-1.5 w-1.5 rounded-full', boardChip(row.state).dot]"
                  aria-hidden="true"
                />
                {{ boardChip(row.state).label }}
              </span>
            </div>
          </li>
        </ul>

        <div class="px-5 py-3 border-t border-line bg-surface-alt/50 text-[12.5px] text-mute">
          One client stuck — escalated automatically. The other four advance without intervention.
        </div>
      </section>
    </div>
  </div>
</template>
