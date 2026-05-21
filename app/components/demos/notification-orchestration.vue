<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, render, watch } from 'vue'
import { Activity, ArrowRight, Bell, BellOff, Box, Briefcase, Clock, Filter, HardHat, Hash, Headset, Mail, MessageCircle, MessageSquare, Moon, Play, RotateCcw, Server, Settings2, ShieldAlert, Smartphone, Star, Sun, Trash2, UserRound, Volume2 } from '@lucide/vue'

type ConditionId =
  | 'low-stock'
  | 'fraud'
  | 'sla-breach'
  | 'high-value-lead'
  | 'outage'

type Severity = 'low' | 'medium' | 'high' | 'critical'
const SEVERITY_RANK: Record<Severity, number> = { low: 0, medium: 1, high: 2, critical: 3 }

type ChannelId = 'slack' | 'sms' | 'email' | 'whatsapp' | 'push'

type PersonaId = 'ops-manager' | 'on-call-engineer' | 'field-team-lead' | 'sales-rep'

interface Condition {
  id: ConditionId
  label: string
  icon: Component
}

interface ChannelMeta {
  id: ChannelId
  label: string
  short: string
  icon: Component
  bg: string
  fg: string
  tint: string
}

interface Persona {
  id: PersonaId
  name: string
  role: string
  icon: Component
  prefers: ChannelId[]
}

interface Rule {
  id: string
  condition: ConditionId
  minSeverity: Severity
  channel: ChannelId
  recipient: PersonaId
  active: boolean
}

interface SampleEvent {
  id: string
  condition: ConditionId
  severity: Severity
  title: string
  body: string
  meta: string
}

interface Alert {
  uid: number
  channel: ChannelId
  recipient: PersonaId
  condition: ConditionId
  severity: Severity
  title: string
  body: string
  meta: string
  ruleId: string
  ts: string
  held?: boolean
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const CONDITIONS: Condition[] = [
  { id: 'low-stock', label: 'Low stock', icon: Box },
  { id: 'fraud', label: 'Fraud signal', icon: ShieldAlert },
  { id: 'sla-breach', label: 'SLA breach', icon: Clock },
  { id: 'high-value-lead', label: 'High-value lead', icon: Star },
  { id: 'outage', label: 'System outage', icon: Server },
]

const CHANNELS: ChannelMeta[] = [
  { id: 'slack', label: 'Slack', short: 'Slack', icon: Hash, bg: 'bg-[#4A154B]', fg: 'text-white', tint: 'bg-[#4A154B]/8' },
  { id: 'sms', label: 'SMS', short: 'SMS', icon: MessageSquare, bg: 'bg-[#0F766E]', fg: 'text-white', tint: 'bg-[#0F766E]/8' },
  { id: 'email', label: 'Email', short: 'Email', icon: Mail, bg: 'bg-[#1E3A8A]', fg: 'text-white', tint: 'bg-[#1E3A8A]/8' },
  { id: 'whatsapp', label: 'WhatsApp', short: 'WApp', icon: MessageCircle, bg: 'bg-[#128C7E]', fg: 'text-white', tint: 'bg-[#128C7E]/8' },
  { id: 'push', label: 'Push', short: 'Push', icon: Smartphone, bg: 'bg-[#0A0F1A]', fg: 'text-white', tint: 'bg-[#0A0F1A]/8' },
]

const PERSONAS: Persona[] = [
  { id: 'ops-manager', name: 'Ola Adekunle', role: 'Operations manager', icon: UserRound, prefers: ['slack', 'email'] },
  { id: 'on-call-engineer', name: 'Tomás Vega', role: 'On-call engineer', icon: Headset, prefers: ['slack', 'sms', 'push'] },
  { id: 'field-team-lead', name: 'Sipho Khumalo', role: 'Field team lead', icon: HardHat, prefers: ['whatsapp', 'slack'] },
  { id: 'sales-rep', name: 'Priya Naidoo', role: 'Senior sales rep', icon: Briefcase, prefers: ['whatsapp', 'email'] },
]

const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical']

// Default rules — user can edit channel, threshold, and recipient.
const DEFAULT_RULES: Rule[] = [
  { id: 'r-stock', condition: 'low-stock', minSeverity: 'medium', channel: 'slack', recipient: 'ops-manager', active: true },
  { id: 'r-fraud', condition: 'fraud', minSeverity: 'high', channel: 'sms', recipient: 'on-call-engineer', active: true },
  { id: 'r-sla', condition: 'sla-breach', minSeverity: 'high', channel: 'slack', recipient: 'field-team-lead', active: true },
  { id: 'r-lead', condition: 'high-value-lead', minSeverity: 'medium', channel: 'whatsapp', recipient: 'sales-rep', active: true },
  { id: 'r-outage', condition: 'outage', minSeverity: 'critical', channel: 'push', recipient: 'on-call-engineer', active: true },
]

const EVENTS: SampleEvent[] = [
  {
    id: 'e-stock',
    condition: 'low-stock',
    severity: 'medium',
    title: 'Stock running low · SKU AOS-0042',
    body: 'A4 ream (80gsm) — 18 units on hand, 7-day reorder lead time.',
    meta: 'warehouse-emea',
  },
  {
    id: 'e-fraud',
    condition: 'fraud',
    severity: 'high',
    title: 'Card decline cluster',
    body: '4 refused authorisations from the same IP in 90 s · merchant id 81472.',
    meta: 'fraud-engine · score 0.87',
  },
  {
    id: 'e-sla',
    condition: 'sla-breach',
    severity: 'high',
    title: 'Ticket #2418 response SLA at risk',
    body: '92 % of response allowance consumed — 7 min to breach.',
    meta: 'helpdesk · priority p2',
  },
  {
    id: 'e-lead',
    condition: 'high-value-lead',
    severity: 'medium',
    title: 'High-value lead · Acme Corp',
    body: 'Demo request, fit score 0.92 · est. pipeline value €420k.',
    meta: 'crm · scoring v3',
  },
  {
    id: 'e-outage',
    condition: 'outage',
    severity: 'critical',
    title: 'Payments gateway · partial outage',
    body: 'p99 latency > 2 s for 60 s · 14 % of traffic failing.',
    meta: 'observability · sev-1',
  },
  {
    id: 'e-disk',
    condition: 'outage',
    severity: 'low',
    title: 'Disk space warning · web-03',
    body: '82 % capacity · projected full in 11 days.',
    meta: 'observability · sev-4',
  },
]

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type Mode = 'after' | 'before'

const mode = ref<Mode>('after')
const rules = reactive<Rule[]>(DEFAULT_RULES.map((r) => ({ ...r })))
const currentPersona = ref<PersonaId>('on-call-engineer')
const quietHours = ref(false) // false = day, true = 2am
const alerts = ref<Alert[]>([])
const heldAlerts = ref<Alert[]>([])
const matchedRuleId = ref<string | null>(null)
const lastEvent = ref<SampleEvent | null>(null)

let alertSeq = 0
const timers: number[] = []
function clearTimers() {
  for (const t of timers.splice(0)) clearTimeout(t)
}
onBeforeUnmount(clearTimers)

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function schedule(fn: () => void, ms: number) {
  timers.push(window.setTimeout(fn, reducedMotion ? 0 : ms))
}

const conditionOf = (id: ConditionId) => CONDITIONS.find((c) => c.id === id)!
const channelOf = (id: ChannelId) => CHANNELS.find((c) => c.id === id)!
const personaOf = (id: PersonaId) => PERSONAS.find((p) => p.id === id)!

function nowLabel(): string {
  if (quietHours.value) {
    const min = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    return `02:${min}`
  }
  const date = new Date()
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function findMatchingRule(ev: SampleEvent): Rule | undefined {
  return rules.find(
    (r) =>
      r.active &&
      r.condition === ev.condition &&
      SEVERITY_RANK[ev.severity] >= SEVERITY_RANK[r.minSeverity],
  )
}

function fireEvent(ev: SampleEvent) {
  lastEvent.value = ev
  const rule = findMatchingRule(ev)

  if (!rule) {
    matchedRuleId.value = null
    return
  }

  matchedRuleId.value = rule.id
  schedule(() => {
    if (matchedRuleId.value === rule.id) matchedRuleId.value = null
  }, 1500)

  const isCritical = ev.severity === 'critical'
  const held = quietHours.value && !isCritical

  const alert: Alert = {
    uid: ++alertSeq,
    channel: rule.channel,
    recipient: rule.recipient,
    condition: ev.condition,
    severity: ev.severity,
    title: ev.title,
    body: ev.body,
    meta: ev.meta,
    ruleId: rule.id,
    ts: nowLabel(),
    held,
  }

  if (held) {
    heldAlerts.value = [alert, ...heldAlerts.value].slice(0, 12)
  } else {
    alerts.value = [alert, ...alerts.value].slice(0, 40)
  }
}

function releaseHeld() {
  // Simulate morning: held alerts land in their channels.
  const releasing = [...heldAlerts.value].reverse()
  heldAlerts.value = []
  releasing.forEach((a, i) => {
    schedule(() => {
      alerts.value = [{ ...a, held: false, ts: '07:00' }, ...alerts.value].slice(0, 40)
    }, i * 180)
  })
}

function resetDemo() {
  clearTimers()
  alerts.value = []
  heldAlerts.value = []
  matchedRuleId.value = null
  lastEvent.value = null
  for (let i = 0; i < rules.length; i++) {
    Object.assign(rules[i]!, DEFAULT_RULES[i])
  }
}

watch(quietHours, (q, prev) => {
  if (prev && !q) {
    // Morning arrived — release held alerts.
    releaseHeld()
  }
})

watch(mode, () => {
  // Keep state but jump scroll: nothing to do beyond UI re-render.
})

// ---------------------------------------------------------------------------
// Derived UI
// ---------------------------------------------------------------------------

const visibleAlerts = computed(() =>
  alerts.value.filter((a) => a.recipient === currentPersona.value),
)

function alertsForChannel(ch: ChannelId): Alert[] {
  return visibleAlerts.value.filter((a) => a.channel === ch).slice(0, 6)
}

function totalForChannel(ch: ChannelId): number {
  return visibleAlerts.value.filter((a) => a.channel === ch).length
}

function personaReceivesChannel(ch: ChannelId): boolean {
  return personaOf(currentPersona.value).prefers.includes(ch)
}

function severityClasses(s: Severity): string {
  if (s === 'critical') return 'text-red-600 bg-red-50 ring-red-100'
  if (s === 'high') return 'text-amber-700 bg-amber-50 ring-amber-200'
  if (s === 'medium') return 'text-cyan-brand-deep bg-cyan-brand/8 ring-cyan-brand/25'
  return 'text-mute-2 bg-surface-alt ring-line'
}

function severityLabel(s: Severity): string {
  return s[0]!.toUpperCase() + s.slice(1)
}

// ---------------------------------------------------------------------------
// "Before" mode — synthetic blast
// ---------------------------------------------------------------------------

// 200 silhouette badges across the 5 channels for a clear "fatigue mountain".
const blastByChannel = computed(() => {
  // Distribute total ~200 across channels — Slack the loudest, push the smallest.
  return [
    { ch: channelOf('slack'),    unread: 87 },
    { ch: channelOf('email'),    unread: 64 },
    { ch: channelOf('sms'),      unread: 23 },
    { ch: channelOf('whatsapp'), unread: 18 },
    { ch: channelOf('push'),     unread: 11 },
  ]
})

const blastTotal = computed(() => blastByChannel.value.reduce((s, x) => s + x.unread, 0))

</script>

<template>
  <div class="no-demo">
    <!-- Header strip -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-line">
      <div>
        <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          <span class="dot" />
          Alert Orchestration · Routing engine
        </div>
        <h3 class="mt-2 font-display text-[22px] md:text-[24px] leading-[1.15] text-ink">
          Pick a persona, fire a signal — see where it lands and where it doesn't.
        </h3>
      </div>

      <!-- Mode toggle -->
      <div
        role="tablist"
        aria-label="Before / After mode"
        class="self-start sm:self-auto inline-flex flex-wrap p-1 rounded-xl border border-line bg-surface-alt/70 shrink-0 max-w-full"
      >
        <button
          role="tab"
          :aria-selected="mode === 'after'"
          @click="mode = 'after'"
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
            mode === 'after' ? 'bg-white text-ink border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)]' : 'text-mute hover:text-ink',
          ]"
        >
          <Filter :size="14" :stroke-width="1.9" />
          After · orchestrated
        </button>
        <button
          role="tab"
          :aria-selected="mode === 'before'"
          @click="mode = 'before'"
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
            mode === 'before' ? 'bg-white text-ink border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)]' : 'text-mute hover:text-ink',
          ]"
        >
          <Volume2 :size="14" :stroke-width="1.9" />
          Before · blast to all
        </button>
      </div>
    </header>

    <!-- ===================================================================
         AFTER MODE — orchestrated
         =================================================================== -->
    <div v-if="mode === 'after'" class="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,380px)_minmax(0,1fr)] gap-0">
      <!-- Left col: persona + hour -->
      <aside
        class="border-b lg:border-b-0 lg:border-r border-line bg-surface-alt/40 px-3 md:px-4 py-4"
        aria-label="Persona and time controls"
      >
        <div class="text-[11px] uppercase tracking-[0.22em] font-semibold text-mute-2 mb-3 px-1">
          Persona
        </div>
        <div class="space-y-1.5">
          <button
            v-for="p in PERSONAS"
            :key="p.id"
            type="button"
            @click="currentPersona = p.id"
            :class="[
              'w-full flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all duration-200',
              currentPersona === p.id
                ? 'border-cyan-brand/50 bg-white ring-1 ring-cyan-brand/25'
                : 'border-line bg-white hover:border-cyan-brand/40 hover:-translate-y-0.5',
            ]"
            :aria-pressed="currentPersona === p.id"
          >
            <span
              :class="[
                'inline-flex items-center justify-center h-8 w-8 rounded-lg ring-1 shrink-0',
                currentPersona === p.id
                  ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/30'
                  : 'bg-surface-alt text-ink/70 ring-line',
              ]"
              aria-hidden="true"
            >
              <component :is="p.icon" :size="15" :stroke-width="1.9" />
            </span>
            <span class="min-w-0">
              <span class="block text-[12.5px] font-semibold text-ink leading-tight truncate">{{ p.name }}</span>
              <span class="block text-[10.5px] text-mute-2 leading-tight truncate">{{ p.role }}</span>
            </span>
          </button>
        </div>

        <!-- Persona channel prefs -->
        <div class="mt-4 rounded-xl border border-line bg-white px-3 py-2.5">
          <div class="text-[10px] uppercase tracking-[0.22em] font-semibold text-mute-2 mb-1.5">Receives on</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="ch in CHANNELS"
              :key="ch.id"
              :class="[
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 transition-opacity',
                personaReceivesChannel(ch.id)
                  ? 'text-ink bg-white ring-line'
                  : 'text-mute-2 bg-surface-alt ring-line opacity-40',
              ]"
            >
              <component :is="ch.icon" :size="10" :stroke-width="2" />
              {{ ch.short }}
            </span>
          </div>
        </div>

        <!-- Hour -->
        <div class="mt-4">
          <div class="text-[11px] uppercase tracking-[0.22em] font-semibold text-mute-2 mb-2 px-1">
            Hour of day
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              @click="quietHours = false"
              :class="[
                'inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[12px] font-semibold transition-colors',
                !quietHours ? 'bg-white border-cyan-brand/40 text-ink ring-1 ring-cyan-brand/25' : 'bg-white border-line text-mute hover:text-ink',
              ]"
            >
              <Sun :size="13" :stroke-width="2" />
              Day · 14:32
            </button>
            <button
              type="button"
              @click="quietHours = true"
              :class="[
                'inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[12px] font-semibold transition-colors',
                quietHours ? 'bg-white border-cyan-brand/40 text-ink ring-1 ring-cyan-brand/25' : 'bg-white border-line text-mute hover:text-ink',
              ]"
            >
              <Moon :size="13" :stroke-width="2" />
              2am · quiet
            </button>
          </div>
          <p class="mt-2 text-[11.5px] leading-snug text-mute">
            <template v-if="quietHours">
              Non-critical alerts will be held until 07:00. Critical events still go through.
            </template>
            <template v-else>
              All routed alerts flow live. Toggle 2am to engage quiet hours.
            </template>
          </p>
        </div>

        <!-- Held queue -->
        <div v-if="heldAlerts.length" class="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5">
          <div class="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-800 mb-1.5">
            <span class="inline-flex items-center gap-1.5"><BellOff :size="11" :stroke-width="2" /> Held until 07:00</span>
            <span>{{ heldAlerts.length }}</span>
          </div>
          <ul class="space-y-1">
            <li v-for="a in heldAlerts.slice(0, 4)" :key="a.uid" class="text-[11.5px] text-amber-900 leading-snug truncate">
              · {{ a.title }}
            </li>
            <li v-if="heldAlerts.length > 4" class="text-[11px] text-amber-700 italic">
              + {{ heldAlerts.length - 4 }} more
            </li>
          </ul>
        </div>
      </aside>

      <!-- Middle col: rules + triggers -->
      <section class="border-b lg:border-b-0 lg:border-r border-line px-4 md:px-5 py-4 md:py-5 bg-white">
        <!-- Rules -->
        <div class="flex items-center justify-between mb-2">
          <div class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-cyan-brand-deep">
            <Settings2 :size="12" :stroke-width="2" />
            Routing rules
          </div>
          <button
            type="button"
            @click="resetDemo"
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-mute hover:text-ink transition-colors"
            aria-label="Reset rules and feed"
          >
            <RotateCcw :size="11" :stroke-width="2" />
            Reset
          </button>
        </div>

        <ul class="space-y-2">
          <li
            v-for="r in rules"
            :key="r.id"
            :class="[
              'no-rule rounded-xl border px-3 py-2.5 transition-all duration-200',
              matchedRuleId === r.id
                ? 'border-cyan-brand/60 bg-cyan-brand/5 ring-1 ring-cyan-brand/30 no-rule--pulse'
                : 'border-line bg-white',
              !r.active ? 'opacity-50' : '',
            ]"
          >
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'inline-flex items-center justify-center h-6 w-6 rounded-md ring-1',
                  matchedRuleId === r.id
                    ? 'bg-white text-cyan-brand-deep ring-cyan-brand/40'
                    : 'bg-surface-alt text-ink/70 ring-line',
                ]"
                aria-hidden="true"
              >
                <component :is="conditionOf(r.condition).icon" :size="12" :stroke-width="2" />
              </span>
              <span class="text-[12.5px] font-semibold text-ink truncate">{{ conditionOf(r.condition).label }}</span>
              <label class="ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold text-mute cursor-pointer">
                <input type="checkbox" v-model="r.active" class="accent-cyan-brand-deep h-3 w-3" />
                Active
              </label>
            </div>

            <div class="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-1.5 text-[11.5px]">
              <label class="block">
                <span class="block text-[9.5px] uppercase tracking-[0.18em] font-semibold text-mute-2 mb-0.5">Min severity</span>
                <select v-model="r.minSeverity" class="no-select">
                  <option v-for="s in SEVERITIES" :key="s" :value="s">{{ severityLabel(s) }}</option>
                </select>
              </label>
              <label class="block">
                <span class="block text-[9.5px] uppercase tracking-[0.18em] font-semibold text-mute-2 mb-0.5">Channel</span>
                <select v-model="r.channel" class="no-select">
                  <option v-for="c in CHANNELS" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </label>
              <label class="block">
                <span class="block text-[9.5px] uppercase tracking-[0.18em] font-semibold text-mute-2 mb-0.5">Recipient</span>
                <select v-model="r.recipient" class="no-select">
                  <option v-for="p in PERSONAS" :key="p.id" :value="p.id">{{ p.role }}</option>
                </select>
              </label>
            </div>
          </li>
        </ul>

        <!-- Triggers -->
        <div class="mt-5 mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-cyan-brand-deep">
          <Activity :size="12" :stroke-width="2" />
          Fire a sample event
        </div>
        <div class="grid grid-cols-1 gap-1.5">
          <button
            v-for="ev in EVENTS"
            :key="ev.id"
            type="button"
            @click="fireEvent(ev)"
            class="group flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-left transition-all duration-200 hover:border-ink/25 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          >
            <span
              :class="[
                'inline-flex items-center justify-center h-7 w-7 rounded-md ring-1 shrink-0',
                ev.severity === 'critical'
                  ? 'bg-red-50 text-red-600 ring-red-100'
                  : 'bg-surface-alt text-ink/70 ring-line',
              ]"
              aria-hidden="true"
            >
              <component :is="conditionOf(ev.condition).icon" :size="13" :stroke-width="2" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[12.5px] font-semibold text-ink leading-tight truncate">{{ ev.title }}</span>
              <span class="block text-[10.5px] text-mute-2 leading-tight truncate">{{ ev.meta }}</span>
            </span>
            <span
              :class="['inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1', severityClasses(ev.severity)]"
            >
              {{ severityLabel(ev.severity) }}
            </span>
            <Play :size="11" :stroke-width="2" class="text-mute-2 group-hover:text-ink transition-colors" />
          </button>
        </div>

        <!-- Last event status -->
        <div v-if="lastEvent" class="mt-3 rounded-lg border border-line bg-surface-alt/60 px-3 py-2 text-[11.5px] leading-snug">
          <template v-if="findMatchingRule(lastEvent)">
            <span class="font-semibold text-ink">Matched.</span>
            <span class="text-mute">
              Rule fired → {{ channelOf(findMatchingRule(lastEvent)!.channel).label }} to {{ personaOf(findMatchingRule(lastEvent)!.recipient).role }}.
              <template v-if="quietHours && lastEvent.severity !== 'critical'">
                <span class="text-amber-700"> Held by quiet hours.</span>
              </template>
              <template v-else-if="quietHours && lastEvent.severity === 'critical'">
                <span class="text-red-600"> Critical override — sent.</span>
              </template>
            </span>
          </template>
          <template v-else>
            <span class="font-semibold text-ink">No rule matched.</span>
            <span class="text-mute"> Event was below all active thresholds — nobody pinged.</span>
          </template>
        </div>
      </section>

      <!-- Right col: channel feeds -->
      <section class="px-4 md:px-5 py-4 md:py-5 bg-surface-alt/30">
        <div class="flex items-center justify-between mb-3">
          <div class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-cyan-brand-deep">
            <Bell :size="12" :stroke-width="2" />
            What {{ personaOf(currentPersona).name.split(' ')[0] }} sees
          </div>
          <button
            v-if="alerts.length"
            type="button"
            @click="alerts = []"
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-mute hover:text-ink transition-colors"
          >
            <Trash2 :size="11" :stroke-width="2" />
            Clear feeds
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <div
            v-for="ch in CHANNELS"
            :key="ch.id"
            :class="[
              'rounded-xl border bg-white overflow-hidden flex flex-col min-h-[260px]',
              personaReceivesChannel(ch.id) ? 'border-line' : 'border-line opacity-50',
            ]"
          >
            <div :class="['flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold', ch.bg, ch.fg]">
              <span class="inline-flex items-center gap-1.5">
                <component :is="ch.icon" :size="11" :stroke-width="2.2" />
                {{ ch.label }}
              </span>
              <span v-if="totalForChannel(ch.id)" class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/20 text-[10px]">
                {{ totalForChannel(ch.id) }}
              </span>
            </div>
            <div class="flex-1 p-2 space-y-1.5">
              <article
                v-for="a in alertsForChannel(ch.id)"
                :key="a.uid"
                class="no-alert rounded-md border border-line bg-white px-2 py-1.5"
              >
                <div class="flex items-start justify-between gap-1.5">
                  <span :class="['inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ring-1', severityClasses(a.severity)]">
                    {{ severityLabel(a.severity) }}
                  </span>
                  <span class="text-[10px] text-mute-2 font-mono shrink-0">{{ a.ts }}</span>
                </div>
                <div class="mt-1 text-[11.5px] font-semibold text-ink leading-tight">{{ a.title }}</div>
                <div class="mt-0.5 text-[10.5px] text-mute leading-snug line-clamp-2">{{ a.body }}</div>
              </article>
              <div v-if="!alertsForChannel(ch.id).length" class="h-full min-h-[160px] flex items-center justify-center text-center px-2">
                <p v-if="!personaReceivesChannel(ch.id)" class="text-[10.5px] text-mute-2 italic">
                  Not subscribed.
                </p>
                <p v-else class="text-[10.5px] text-mute-2 italic">
                  Quiet — nothing for this channel.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty hint -->
        <p v-if="!alerts.length && !heldAlerts.length" class="mt-3 text-[12px] text-mute text-center">
          <span class="inline-flex items-center gap-1.5">
            <ArrowRight :size="12" :stroke-width="2" />
            Fire an event from the panel to see only what this persona receives.
          </span>
        </p>
      </section>
    </div>

    <!-- ===================================================================
         BEFORE MODE — alert blast
         =================================================================== -->
    <div v-else class="px-5 md:px-6 py-5 md:py-6 bg-surface-alt/30">
      <div class="mx-auto max-w-3xl text-center">
        <div class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-red-600">
          <Volume2 :size="12" :stroke-width="2" />
          Without orchestration · everyone sees everything
        </div>
        <h4 class="mt-2 font-display text-[22px] md:text-[26px] leading-[1.15] text-ink">
          {{ blastTotal.toLocaleString() }} alerts in someone's inbox. Three of them mattered.
        </h4>
        <p class="mt-2 text-[14px] leading-[1.55] text-mute">
          A single morning, blasted to every channel, every person — the same event copied five ways. After a week, nobody opens the channel at all.
        </p>
      </div>

      <!-- Channels with massive unread badges -->
      <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          v-for="row in blastByChannel"
          :key="row.ch.id"
          class="rounded-2xl border border-line bg-white overflow-hidden"
        >
          <div :class="['flex items-center justify-between px-3 py-2 text-[12px] font-semibold', row.ch.bg, row.ch.fg]">
            <span class="inline-flex items-center gap-1.5">
              <component :is="row.ch.icon" :size="12" :stroke-width="2.2" />
              {{ row.ch.label }}
            </span>
            <span class="inline-flex items-center justify-center min-w-[26px] h-[20px] px-1.5 rounded-full bg-red-600 text-white text-[10.5px] no-badge-pulse">
              {{ row.unread }}
            </span>
          </div>
          <!-- Mountain of grey unread rows -->
          <div class="p-2 space-y-1">
            <div
              v-for="n in 9"
              :key="n"
              class="rounded-md border border-line bg-surface-alt px-2 py-1.5 opacity-60"
            >
              <div class="flex items-center justify-between">
                <div class="h-2 rounded-full bg-line w-3/5"></div>
                <div class="h-2 rounded-full bg-line w-8 ml-2"></div>
              </div>
              <div class="mt-1.5 h-1.5 rounded-full bg-line w-full"></div>
              <div class="mt-1 h-1.5 rounded-full bg-line w-4/5"></div>
            </div>
            <div class="text-center text-[10px] text-mute-2 font-mono pt-1">
              + {{ row.unread - 9 }} unread
            </div>
          </div>
        </div>
      </div>

      <!-- Anchor: the comparison -->
      <div class="mt-6 rounded-2xl border border-line bg-white px-4 md:px-5 py-4 md:py-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-red-600">Before</div>
            <h5 class="mt-1 font-display text-[18px] md:text-[20px] leading-[1.2] text-ink">
              Every alert, every channel, everyone.
            </h5>
            <p class="mt-2 text-[13px] leading-[1.55] text-mute">
              The fraud signal pings the entire engineering channel. The low-stock email lands in 47 inboxes. Sales gets the disk warning. The on-call engineer's phone buzzes at 2am because someone's laptop ran a backup.
            </p>
            <p class="mt-2 text-[13px] leading-[1.55] text-mute">
              After a week, the channel is muted and the inbox folder is archived. The one alert that was actually a fire goes unread next to nine hundred that weren't.
            </p>
          </div>
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-cyan-brand-deep">After</div>
            <h5 class="mt-1 font-display text-[18px] md:text-[20px] leading-[1.2] text-ink">
              Right channel, right person, right hour.
            </h5>
            <p class="mt-2 text-[13px] leading-[1.55] text-mute">
              Low stock → Slack to the buyer, once. Fraud → SMS to the on-call engineer, only if severity ≥ high. High-value lead → WhatsApp to the rep who owns the territory.
            </p>
            <p class="mt-2 text-[13px] leading-[1.55] text-mute">
              The 2am disk warning waits until 07:00. The 2am payments outage rings every phone in the rota. People start noticing alerts again because there are fewer of them.
            </p>
            <button
              type="button"
              @click="mode = 'after'"
              class="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[13px] font-semibold px-3.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            >
              <Filter :size="13" :stroke-width="2" />
              Try the orchestrated view
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-demo {
  font-family: var(--font-sans);
}

/* Native selects styled to match form-field token. */
.no-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  border-radius: 8px;
  border: 1px solid var(--color-line);
  background: #fff;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'><path d='M1 1l4 4 4-4' stroke='%2364748B' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding: 5px 22px 5px 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.3;
  cursor: pointer;
  transition: border-color 180ms, box-shadow 180ms;
}
.no-select:hover { border-color: rgba(1, 219, 241, 0.4); }
.no-select:focus {
  outline: none;
  border-color: var(--color-cyan-brand);
  box-shadow: 0 0 0 2px rgba(1, 219, 241, 0.22);
}

/* Rule pulse when matched. */
.no-rule { will-change: transform; }
.no-rule--pulse {
  animation: no-pulse 1.4s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes no-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(1, 219, 241, 0.45); }
  40%  { box-shadow: 0 0 0 10px rgba(1, 219, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(1, 219, 241, 0); }
}

/* Alert card entry animation. */
.no-alert {
  animation: no-alert-in 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes no-alert-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Before-mode badge pulse — the fatigue beacon. */
.no-badge-pulse {
  animation: no-badge 2.4s ease-in-out infinite;
}
@keyframes no-badge {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.06); opacity: 0.92; }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .no-rule--pulse,
  .no-alert,
  .no-badge-pulse { animation: none !important; }
}
</style>
