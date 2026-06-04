<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, render, watch } from 'vue'
import { ArrowRight, AtSign, ChartColumn, CircleCheck, Funnel, Globe, HandCoins, Handshake, Inbox, Mail, MessageCircle, Pause, Play, RefreshCw, Send, Smartphone, Sparkles, TriangleAlert, Users, Voicemail } from '@lucide/vue'

type Channel = 'email' | 'whatsapp' | 'sms' | 'web' | 'social' | 'voicemail'
type Classification = 'sales-lead' | 'support' | 'complaint' | 'partner' | 'spam'
type Queue = 'sales' | 'support' | 'partnerships' | 'archive'
type Persona = 'all' | 'sales' | 'support' | 'partnerships'
type ComposerKind = 'email' | 'chat' | 'voicemail'

interface ChannelMeta {
  label: string
  icon: Component
  composer: ComposerKind
  sendLabel: string
}

interface ClassificationMeta {
  label: string
  queueLabel: string
  tone: 'cyan' | 'red' | 'mute'
}

interface RoutingRule {
  description: string
}

interface InboundMessage {
  id: number
  channel: Channel
  classification: Classification
  queue: Queue
  rule: RoutingRule
  from: string
  fromMeta?: string
  subject?: string
  body: string
  ts: number
  /** Caught a mis-channelled message, the routing engine reclassified it. */
  misrouted?: boolean
  /** Arrived on an under-watched channel (social/voicemail/web). */
  wouldHaveMissed?: boolean
  /** True once the user has replied via the composer. */
  replied?: boolean
  /** True for the injected edge-case message, for visual emphasis. */
  edgeCase?: boolean
}

interface PersonaMeta {
  id: Persona
  label: string
  icon: Component
  queue: Queue | null
}

// =============================================================================
// Meta dictionaries
// =============================================================================

const CHANNEL_META: Record<Channel, ChannelMeta> = {
  email:     { label: 'Email',     icon: Mail,          composer: 'email',     sendLabel: 'Reply via email' },
  whatsapp:  { label: 'WhatsApp',  icon: MessageCircle, composer: 'chat',      sendLabel: 'Send via WhatsApp' },
  sms:       { label: 'SMS',       icon: Smartphone,    composer: 'chat',      sendLabel: 'Send via SMS' },
  web:       { label: 'Web form',  icon: Globe,         composer: 'email',     sendLabel: 'Send web reply' },
  social:    { label: 'Social DM', icon: AtSign,        composer: 'chat',      sendLabel: 'Send DM' },
  voicemail: { label: 'Voicemail', icon: Voicemail,     composer: 'voicemail', sendLabel: 'Queue callback' },
}

const CLASSIFICATION_META: Record<Classification, ClassificationMeta> = {
  'sales-lead': { label: 'Sales lead', queueLabel: 'Sales',        tone: 'cyan' },
  'support':    { label: 'Support',    queueLabel: 'Support',      tone: 'cyan' },
  'complaint':  { label: 'Complaint',  queueLabel: 'Support',      tone: 'red'  },
  'partner':    { label: 'Partner',    queueLabel: 'Partnerships', tone: 'cyan' },
  'spam':       { label: 'Spam',       queueLabel: 'Archive',      tone: 'mute' },
}

const PERSONAS: PersonaMeta[] = [
  { id: 'all',          label: 'All inbound',  icon: Inbox,     queue: null },
  { id: 'sales',        label: 'Sales',        icon: HandCoins, queue: 'sales' },
  { id: 'support',      label: 'Support',      icon: Users,     queue: 'support' },
  { id: 'partnerships', label: 'Partnerships', icon: Handshake, queue: 'partnerships' },
]

// =============================================================================
// Message pool, cycled in fixed order so the demo plays consistently
// =============================================================================

const MESSAGE_POOL: Omit<InboundMessage, 'id' | 'ts'>[] = [
  {
    channel: 'email', classification: 'sales-lead', queue: 'sales',
    rule: { description: 'Email + buying-intent keywords ("demo", "fleet") → Sales queue' },
    from: 'Priya Bhatia',
    fromMeta: 'priya@nordicfreight.com',
    subject: 'Demo request, 40-strong fleet',
    body: "Hi team, I'm with Nordic Freight, we run 40 trucks across Sweden and Norway. Looking to overhaul our scheduling stack this quarter. Can we get a demo?",
  },
  {
    channel: 'whatsapp', classification: 'support', queue: 'support',
    rule: { description: 'WhatsApp from registered customer number → Support' },
    from: 'Liam Vermaak',
    fromMeta: '+27 82 491 5582 · existing customer',
    body: "Hey, the kanban tile won't load on iPad since this morning. Other devices fine. Anyone else seeing this?",
  },
  {
    channel: 'sms', classification: 'complaint', queue: 'support',
    rule: { description: 'SMS + negative-sentiment keywords ("tired of", "still") → Support · escalated' },
    from: 'Anonymous SMS',
    fromMeta: '+1 415 555 0188',
    body: "Third week running, my export still won't generate. Getting tired of waiting for someone to look at this.",
  },
  {
    channel: 'social', classification: 'partner', queue: 'partnerships',
    rule: { description: 'LinkedIn DM from known agency handle → Partnerships' },
    from: '@maya.delgado',
    fromMeta: 'LinkedIn DM · Delgado & Co.',
    body: "Loved your case study on the lender ops piece. Could we explore a referral arrangement? Two clients in mind already.",
    wouldHaveMissed: true,
  },
  {
    channel: 'voicemail', classification: 'sales-lead', queue: 'sales',
    rule: { description: 'Voicemail transcript + "demo" keyword → Sales' },
    from: 'Owen Carmichael',
    fromMeta: '+44 20 7946 0123 · Voicemail · 0:42',
    body: "\"Hi, this is Owen at Sundown Logistics. We met at the conference last week, would love to set up a demo. Call me back on this number, thanks.\"",
    wouldHaveMissed: true,
  },
  {
    channel: 'web', classification: 'spam', queue: 'archive',
    rule: { description: 'Web form + promo-link signature → Spam · auto-archived' },
    from: 'SEO Wizard',
    fromMeta: 'noreply@cheapseo.biz · /contact',
    subject: 'Boost your rankings 10x, guaranteed!',
    body: "Hi there, I noticed your site doesn't rank well for several important keywords. We offer a no-risk SEO package starting at $99/month...",
  },
  {
    channel: 'email', classification: 'support', queue: 'support',
    rule: { description: 'Email to support@ → Support queue' },
    from: 'Hannah Krüger',
    fromMeta: 'hannah@beechcroft.de',
    subject: 'CSV export drops the second row of multi-line items',
    body: "Hey, CSV exports on the pricing engine drop the second row of multi-line items. Steps to repro and a 3-row sample attached.",
  },
  {
    channel: 'whatsapp', classification: 'sales-lead', queue: 'sales',
    rule: { description: 'WhatsApp from unknown number + pricing intent → Sales' },
    from: 'Ravi Mehta',
    fromMeta: '+61 412 998 003 · new contact',
    body: "G'day, mate of mine recommended you. Looking at quotes for an inventory engine across 4 sites. What's the starting price?",
  },
  {
    channel: 'social', classification: 'complaint', queue: 'support',
    rule: { description: 'Public social mention + negative sentiment → Support · escalated' },
    from: '@frustrated_ops_lead',
    fromMeta: 'X · public reply',
    body: "Three days into the rollout and nobody at @zabble has answered my onboarding ticket. Not great.",
    wouldHaveMissed: true,
  },
  {
    channel: 'voicemail', classification: 'support', queue: 'support',
    rule: { description: 'Voicemail with "broken/stuck" keyword → Support' },
    from: 'Mark Anderssen',
    fromMeta: '+1 312 555 0199 · Voicemail · 1:14',
    body: "\"Hey, this is Mark from Sundown ops. Our dashboard won't load this morning, the whole night-shift team is stuck. Please call back.\"",
    wouldHaveMissed: true,
  },
  {
    channel: 'sms', classification: 'partner', queue: 'partnerships',
    rule: { description: 'SMS from known partner contact → Partnerships' },
    from: 'Eva Liang',
    fromMeta: '+1 646 555 0145 · Accel North',
    body: "Two portfolio companies that fit your ICP, want intros this week?",
  },
  {
    channel: 'email', classification: 'partner', queue: 'partnerships',
    rule: { description: 'Email from agency contact + "referral" keyword → Partnerships' },
    from: 'Thandi Mokoena',
    fromMeta: 'thandi@northbridge.partners',
    subject: 'Quick referral question',
    body: "Hi, Northbridge has a client of ours asking about your audit-trails work. Open to a 20-minute intro this week?",
  },
  {
    channel: 'web', classification: 'sales-lead', queue: 'sales',
    rule: { description: 'Web form + procurement-stage keywords ("$80–120k", "Q3 rollout") → Sales' },
    from: 'Charles Adebayo',
    fromMeta: 'charles@kingfisher.co.za · /contact',
    body: "We're looking at $80–120k for a Q3 rollout. Can we set up a call this week?",
  },
  {
    channel: 'whatsapp', classification: 'support', queue: 'support',
    rule: { description: 'WhatsApp from customer + "down/error" keyword → Support · priority' },
    from: 'Aoife Donnelly',
    fromMeta: '+353 87 218 4490 · existing customer',
    body: "Reporting view is throwing a 502 since 09:00 GMT. Whole team's blocked. Help?",
  },
  {
    channel: 'social', classification: 'sales-lead', queue: 'sales',
    rule: { description: 'Social DM + product-fit keywords → Sales' },
    from: '@kwame.ankrah',
    fromMeta: 'Instagram DM · Ankrah Logistics',
    body: "Hey, saw the warehouse case study. We're 25 staff, 3 sites, does the inventory engine work for that size?",
    wouldHaveMissed: true,
  },
  {
    channel: 'email', classification: 'spam', queue: 'archive',
    rule: { description: 'Email + cold-pitch pattern → Spam · auto-archived' },
    from: 'Tyler Stone',
    fromMeta: 'tyler@growthpros.io',
    subject: 'Quick question?',
    body: "Hi, I help SaaS companies generate 50+ qualified leads per month. Are you the right person to chat about lead gen?",
  },
]

// Edge-case message, injected on demand. Mis-channelled (came in on the
// support contact form, classifier reroutes to Sales).
const EDGE_CASE_MESSAGE: Omit<InboundMessage, 'id' | 'ts'> = {
  channel: 'web',
  classification: 'sales-lead',
  queue: 'sales',
  rule: {
    description:
      'Submitted on /contact (Support form) → default Support. Reclassifier matched "fleet of 80" + "enterprise deal" + ".com domain" → rerouted to Sales · priority high.',
  },
  from: 'Tomás Andrade',
  fromMeta: 'tomas@harborlinegroup.com · /contact (Support form)',
  subject: 'Question',
  body: "Hi, we run a fleet of 80 vehicles and our current ops platform is falling over. Looking for something fit for purpose. What does an enterprise deal look like for us?",
  misrouted: true,
  edgeCase: true,
}

// =============================================================================
// State
// =============================================================================

const messages = ref<InboundMessage[]>([])
const selectedId = ref<number | null>(null)
const persona = ref<Persona>('all')
const isPaused = ref<boolean>(false)
const draftBody = ref<string>('')
const draftSubject = ref<string>('')
const edgeCaseFired = ref<boolean>(false)
const now = ref<number>(0)

let nextId = 0
let poolCursor = 0
let pumpTimer: ReturnType<typeof setTimeout> | null = null
let tickInterval: ReturnType<typeof setInterval> | null = null

const MAX_MESSAGES = 22

// =============================================================================
// Stream control
// =============================================================================

function addPoolMessage(): void {
  if (messages.value.length >= MAX_MESSAGES) {
    isPaused.value = true
    return
  }
  const template = MESSAGE_POOL[poolCursor % MESSAGE_POOL.length]!
  poolCursor++
  const m: InboundMessage = {
    ...template,
    id: ++nextId,
    ts: Date.now(),
  }
  messages.value = [m, ...messages.value]
}

function scheduleNext(): void {
  if (isPaused.value) return
  if (messages.value.length >= MAX_MESSAGES) {
    isPaused.value = true
    return
  }
  const wait = 1600 + Math.floor(Math.random() * 1800)
  pumpTimer = setTimeout(() => {
    addPoolMessage()
    scheduleNext()
  }, wait)
}

function stopPump(): void {
  if (pumpTimer) {
    clearTimeout(pumpTimer)
    pumpTimer = null
  }
}

function startPump(): void {
  stopPump()
  scheduleNext()
}

function togglePause(): void {
  isPaused.value = !isPaused.value
  if (!isPaused.value) startPump()
  else stopPump()
}

function reset(): void {
  stopPump()
  messages.value = []
  selectedId.value = null
  poolCursor = 0
  nextId = 0
  edgeCaseFired.value = false
  isPaused.value = false
  draftBody.value = ''
  draftSubject.value = ''
  seedAndStart()
}

function triggerEdgeCase(): void {
  // Force the edge-case message in regardless of pause/cap state, and
  // auto-select it so the user sees the catch in action.
  const m: InboundMessage = { ...EDGE_CASE_MESSAGE, id: ++nextId, ts: Date.now() }
  messages.value = [m, ...messages.value]
  selectedId.value = m.id
  edgeCaseFired.value = true
  // Switch persona to Sales if the user isn't there already, they should
  // see the rerouted lead land in the Sales queue.
  if (persona.value !== 'all' && persona.value !== 'sales') {
    persona.value = 'sales'
  }
}

function seedAndStart(): void {
  // Pre-seed two messages so the inbox isn't empty on entry, feels alive
  // from the first frame.
  const seedCount = 2
  const t = Date.now()
  const seeds: InboundMessage[] = []
  for (let i = 0; i < seedCount; i++) {
    const template = MESSAGE_POOL[poolCursor % MESSAGE_POOL.length]!
    poolCursor++
    seeds.push({ ...template, id: ++nextId, ts: t - (seedCount - i) * 1800 })
  }
  // Reverse to render newest-first.
  messages.value = seeds.reverse()
  selectedId.value = seeds[0]?.id ?? null
  startPump()
}

onMounted(() => {
  now.value = Date.now()
  tickInterval = setInterval(() => { now.value = Date.now() }, 4000)
  seedAndStart()
})

onUnmounted(() => {
  stopPump()
  if (tickInterval) clearInterval(tickInterval)
})

// =============================================================================
// Derived state
// =============================================================================

const filteredMessages = computed<InboundMessage[]>(() => {
  // Spam/archive never shows in any persona's queue, it's auto-archived
  // and only summarised in the stats panel.
  const visible = messages.value.filter((m) => m.queue !== 'archive')
  if (persona.value === 'all') return visible
  const targetQueue = persona.value as Queue
  return visible.filter((m) => m.queue === targetQueue)
})

const selectedMessage = computed<InboundMessage | null>(() => {
  if (selectedId.value === null) return null
  return messages.value.find((m) => m.id === selectedId.value) ?? null
})

// If a persona switch hides the current selection, jump to the top of the new queue.
watch(persona, () => {
  if (persona.value === 'all') return
  const sel = selectedMessage.value
  const targetQueue = persona.value as Queue
  if (sel && sel.queue !== targetQueue) {
    selectedId.value = filteredMessages.value[0]?.id ?? null
  }
})

// Reset the composer draft whenever the selection changes.
watch(selectedId, () => {
  draftBody.value = ''
  draftSubject.value = selectedMessage.value?.subject
    ? `Re: ${selectedMessage.value.subject}`
    : ''
})

// =============================================================================
// Counters / stats
// =============================================================================

const totalProcessed = computed<number>(() => messages.value.length)

const wouldHaveMissedCount = computed<number>(
  () => messages.value.filter((m) => m.wouldHaveMissed && m.queue !== 'archive').length,
)

const spamCount = computed<number>(
  () => messages.value.filter((m) => m.queue === 'archive').length,
)

const queueCountFor = (queue: Queue): number =>
  messages.value.filter((m) => m.queue === queue).length

interface ChannelCount {
  channel: Channel
  label: string
  count: number
  icon: Component
}

const channelCounts = computed<ChannelCount[]>(() => {
  const c: Record<Channel, number> = {
    email: 0, whatsapp: 0, sms: 0, web: 0, social: 0, voicemail: 0,
  }
  for (const m of messages.value) c[m.channel]++
  return (Object.keys(c) as Channel[]).map((ch) => ({
    channel: ch,
    label: CHANNEL_META[ch].label,
    count: c[ch],
    icon: CHANNEL_META[ch].icon,
  }))
})

// =============================================================================
// Reply
// =============================================================================

function sendReply(): void {
  const sel = selectedMessage.value
  if (!sel) return
  const id = sel.id
  messages.value = messages.value.map((m) =>
    m.id === id ? { ...m, replied: true } : m,
  )
  draftBody.value = ''
  draftSubject.value = sel.subject ? `Re: ${sel.subject}` : ''
}

// =============================================================================
// Formatters
// =============================================================================

function formatTs(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function formatRelative(ts: number, ref: number): string {
  const reference = ref || Date.now()
  const diff = Math.max(0, reference - ts)
  if (diff < 8_000)     return 'Just now'
  if (diff < 60_000)    return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  return formatTs(ts)
}

function classificationToneClasses(tone: ClassificationMeta['tone']): string {
  if (tone === 'red')  return 'bg-red-50 text-red-600 ring-red-100'
  if (tone === 'cyan') return 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
  return 'bg-surface-alt text-mute-2 ring-line'
}

const personaQueueLabel = computed<string>(() => {
  if (persona.value === 'all') return 'All inbound'
  if (persona.value === 'sales') return 'Sales queue'
  if (persona.value === 'support') return 'Support queue'
  return 'Partnerships queue'
})

</script>

<template>
  <div class="relative">
    <!-- ===================================================================
         Header strip, live indicator + counters + transport controls
         =================================================================== -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-alt/40 px-4 sm:px-5 md:px-7 py-3.5"
    >
      <div
        class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
      >
        <span :class="['dot', isPaused ? 'opacity-50' : 'zb-pulse']" />
        {{ isPaused ? 'Stream paused' : 'Live unified inbox' }}
      </div>
      <div class="inline-flex items-center gap-2">
        <span class="text-[12px] text-mute-2 tabular-nums hidden sm:inline">
          {{ totalProcessed }} processed
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md border border-line bg-white hover:border-cyan-brand/40 text-ink text-[12.5px] font-semibold px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-1"
          @click="togglePause"
        >
          <Pause v-if="!isPaused" :size="12" :stroke-width="2" aria-hidden="true" />
          <Play  v-else            :size="12" :stroke-width="2" aria-hidden="true" />
          {{ isPaused ? 'Resume' : 'Pause' }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md border border-line bg-white hover:border-cyan-brand/40 text-ink text-[12.5px] font-semibold px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-1"
          @click="reset"
        >
          <RefreshCw :size="12" :stroke-width="2" aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>

    <!-- ===================================================================
         Persona tabs + edge-case trigger
         =================================================================== -->
    <div class="px-4 sm:px-5 md:px-7 pt-5 flex flex-wrap items-end justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2.5">
          Persona
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="p in PERSONAS"
            :key="p.id"
            type="button"
            :class="[
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2',
              persona === p.id
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink hover:border-cyan-brand/40 hover:text-ink-soft',
            ]"
            @click="persona = p.id"
          >
            <component :is="p.icon" :size="14" :stroke-width="1.9" aria-hidden="true" />
            {{ p.label }}
            <span
              v-if="p.queue"
              :class="[
                'tabular-nums rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold',
                persona === p.id
                  ? 'bg-white/20 text-white'
                  : 'bg-surface-alt text-mute-2',
              ]"
            >
              {{ queueCountFor(p.queue) }}
            </span>
          </button>
        </div>
      </div>
      <button
        type="button"
        :disabled="edgeCaseFired"
        :class="[
          'flex-none inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          edgeCaseFired
            ? 'border-line bg-surface-alt text-mute-2 cursor-not-allowed'
            : 'border-cyan-brand/40 bg-white text-ink hover:bg-cyan-brand/5',
        ]"
        @click="triggerEdgeCase"
      >
        <Sparkles :size="13" :stroke-width="2" aria-hidden="true" />
        {{ edgeCaseFired ? 'Edge case fired' : 'Trigger edge case' }}
      </button>
    </div>

    <!-- ===================================================================
         Inbox stream + selected detail
         =================================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 px-4 sm:px-5 md:px-7 pt-5">
      <!-- Inbox -->
      <div class="lg:col-span-5">
        <div
          class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2.5 inline-flex items-center gap-1.5"
        >
          <Inbox :size="12" :stroke-width="2" aria-hidden="true" />
          <span>Stream</span>
          <span class="text-mute font-medium normal-case tracking-normal">
            · {{ personaQueueLabel }} · {{ filteredMessages.length }}
            {{ filteredMessages.length === 1 ? 'message' : 'messages' }}
          </span>
        </div>
        <div
          class="rounded-xl border border-line bg-white max-h-[560px] overflow-y-auto"
          aria-live="polite"
        >
          <ul v-if="filteredMessages.length" class="divide-y divide-line">
            <li v-for="m in filteredMessages" :key="m.id">
              <button
                type="button"
                :class="[
                  'zb-inbox-row block w-full text-left px-3.5 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-inset',
                  selectedId === m.id ? 'bg-cyan-brand/5' : 'hover:bg-surface-alt/60',
                  m.edgeCase ? 'border-l-2 border-l-cyan-brand' : '',
                ]"
                @click="selectedId = m.id"
              >
                <div class="flex items-start gap-2.5">
                  <span
                    :class="[
                      'flex-none inline-flex items-center justify-center h-8 w-8 rounded-lg ring-1 mt-0.5',
                      m.replied
                        ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-cyan-brand/30'
                        : 'bg-surface-alt text-ink ring-line',
                    ]"
                    aria-hidden="true"
                  >
                    <component
                      :is="CHANNEL_META[m.channel].icon"
                      :size="15"
                      :stroke-width="1.9"
                    />
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-baseline justify-between gap-2">
                      <div class="text-[13px] font-semibold text-ink truncate">
                        {{ m.from }}
                      </div>
                      <div
                        class="text-[11px] text-mute-2 tabular-nums whitespace-nowrap"
                      >
                        {{ formatRelative(m.ts, now) }}
                      </div>
                    </div>
                    <div
                      v-if="m.subject"
                      class="text-[12.5px] text-ink/85 truncate mt-0.5"
                    >
                      {{ m.subject }}
                    </div>
                    <div
                      class="text-[12.5px] text-mute mt-0.5 leading-[1.5] zb-clamp-2"
                    >
                      {{ m.body }}
                    </div>
                    <div class="mt-2 flex flex-wrap items-center gap-1">
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-surface-alt border border-line px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-soft"
                      >
                        {{ CHANNEL_META[m.channel].label }}
                      </span>
                      <span
                        :class="[
                          'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold ring-1',
                          classificationToneClasses(CLASSIFICATION_META[m.classification].tone),
                        ]"
                      >
                        {{ CLASSIFICATION_META[m.classification].label }}
                      </span>
                      <span
                        v-if="m.misrouted"
                        class="inline-flex items-center gap-1 rounded-full bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 px-1.5 py-0.5 text-[10.5px] font-semibold"
                      >
                        Mis-channel · caught
                      </span>
                      <span
                        v-if="m.replied"
                        class="inline-flex items-center gap-1 rounded-full bg-surface-alt text-mute-2 ring-1 ring-line px-1.5 py-0.5 text-[10.5px] font-semibold"
                      >
                        Replied
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          </ul>
          <div v-else class="text-center py-12 px-5">
            <Inbox
              :size="22"
              :stroke-width="1.6"
              class="inline-block text-mute-2 mb-2"
              aria-hidden="true"
            />
            <p class="text-[13px] text-mute">
              No messages in this queue yet.
              <span v-if="isPaused">Resume the stream to keep loading.</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Detail + composer -->
      <div class="lg:col-span-7">
        <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2.5">
          Message detail
        </div>
        <div
          v-if="selectedMessage"
          :key="selectedMessage.id"
          class="rounded-xl border border-line bg-white p-4 md:p-5 space-y-4"
        >
          <!-- Header: channel → queue, sender, timestamp -->
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-1.5 mb-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-surface-alt border border-line px-2 py-0.5 text-[11px] font-semibold text-ink"
                >
                  <component
                    :is="CHANNEL_META[selectedMessage.channel].icon"
                    :size="13"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                  {{ CHANNEL_META[selectedMessage.channel].label }}
                </span>
                <ArrowRight
                  :size="12"
                  :stroke-width="2"
                  class="text-mute-2"
                  aria-hidden="true"
                />
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
                    classificationToneClasses(CLASSIFICATION_META[selectedMessage.classification].tone),
                  ]"
                >
                  {{ CLASSIFICATION_META[selectedMessage.classification].queueLabel }} queue
                </span>
              </div>
              <div class="font-display text-[20px] md:text-[22px] text-ink leading-[1.2]">
                {{ selectedMessage.from }}
              </div>
              <div v-if="selectedMessage.fromMeta" class="text-[12.5px] text-mute mt-0.5">
                {{ selectedMessage.fromMeta }}
              </div>
            </div>
            <div
              class="text-right text-[11.5px] text-mute-2 tabular-nums whitespace-nowrap"
            >
              {{ formatTs(selectedMessage.ts) }}
            </div>
          </div>

          <!-- Mis-channelled callout -->
          <div
            v-if="selectedMessage.misrouted"
            class="rounded-lg border border-cyan-brand/30 bg-cyan-brand/5 p-3"
          >
            <div
              class="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold"
            >
              <Sparkles :size="12" :stroke-width="2" aria-hidden="true" />
              Mis-channelled, caught and rerouted
            </div>
            <p class="mt-1 text-[12.5px] text-ink leading-[1.55]">
              This message landed on the support contact form, but the
              classifier recognised the buying intent and rerouted it to the
              Sales queue, before anyone watching support saw it.
            </p>
          </div>

          <!-- Rule that fired -->
          <div class="rounded-lg bg-surface-alt/60 border border-line p-3">
            <div
              class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-1 inline-flex items-center gap-1.5"
            >
              <Funnel :size="11" :stroke-width="2" aria-hidden="true" />
              Routing rule that fired
            </div>
            <p class="text-[12.5px] text-ink leading-[1.55]">
              {{ selectedMessage.rule.description }}
            </p>
          </div>

          <!-- Message body, channel-themed -->
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2">
              Message
            </div>
            <div
              v-if="selectedMessage.subject"
              class="text-[14px] font-semibold text-ink mb-1.5"
            >
              {{ selectedMessage.subject }}
            </div>

            <!-- Chat-style (WhatsApp / SMS / Social DM) -->
            <div
              v-if="CHANNEL_META[selectedMessage.channel].composer === 'chat'"
              class="inline-block max-w-full rounded-2xl rounded-bl-md bg-surface-alt border border-line px-3.5 py-2.5 text-[13.5px] text-ink leading-[1.55]"
            >
              {{ selectedMessage.body }}
            </div>

            <!-- Voicemail-style -->
            <div
              v-else-if="CHANNEL_META[selectedMessage.channel].composer === 'voicemail'"
              class="rounded-lg bg-surface-alt/60 border border-line p-3"
            >
              <div
                class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-1"
              >
                <Voicemail :size="11" :stroke-width="2" aria-hidden="true" />
                Transcript
              </div>
              <p class="text-[13.5px] text-ink leading-[1.55] italic">
                {{ selectedMessage.body }}
              </p>
            </div>

            <!-- Email / Web form style -->
            <div v-else class="text-[13.5px] text-ink leading-[1.65]">
              {{ selectedMessage.body }}
            </div>
          </div>

          <!-- Composer -->
          <div class="border-t border-line pt-4">
            <div
              class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2 inline-flex items-center gap-1.5"
            >
              <Send :size="11" :stroke-width="2" aria-hidden="true" />
              Reply on the same channel
            </div>

            <!-- Replied state -->
            <div
              v-if="selectedMessage.replied"
              class="rounded-lg border border-cyan-brand/30 bg-cyan-brand/5 p-3 flex items-center gap-2.5"
            >
              <span
                class="flex-none inline-flex items-center justify-center h-8 w-8 rounded-full bg-cyan-brand/15 text-cyan-brand-deep ring-1 ring-cyan-brand/30"
                aria-hidden="true"
              >
                <CircleCheck :size="14" :stroke-width="2" />
              </span>
              <div class="min-w-0">
                <div class="text-[13px] font-semibold text-ink">
                  Reply sent via {{ CHANNEL_META[selectedMessage.channel].label }}
                </div>
                <div class="text-[11.5px] text-mute-2">
                  Customer never sees a channel hand-off.
                </div>
              </div>
            </div>

            <!-- Active composer -->
            <div v-else class="space-y-2.5">
              <!-- Email / Web form -->
              <template v-if="CHANNEL_META[selectedMessage.channel].composer === 'email'">
                <div class="flex items-center gap-2 text-[12.5px]">
                  <span class="text-mute-2 font-semibold w-16 flex-none">To</span>
                  <span class="text-ink truncate">
                    {{ selectedMessage.fromMeta || selectedMessage.from }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-[12.5px]">
                  <span class="text-mute-2 font-semibold w-16 flex-none">Subject</span>
                  <input
                    v-model="draftSubject"
                    type="text"
                    class="zb-field flex-1"
                    placeholder="Reply subject"
                  />
                </div>
                <textarea
                  v-model="draftBody"
                  rows="3"
                  class="zb-field w-full"
                  placeholder="Write your reply…"
                />
              </template>

              <!-- Chat (WhatsApp / SMS / Social) -->
              <template v-else-if="CHANNEL_META[selectedMessage.channel].composer === 'chat'">
                <div class="text-[11.5px] text-mute-2 mb-1">
                  Threading reply to <span class="text-ink font-semibold">{{ selectedMessage.from }}</span>
                  on {{ CHANNEL_META[selectedMessage.channel].label }}.
                </div>
                <textarea
                  v-model="draftBody"
                  rows="2"
                  class="zb-field w-full"
                  placeholder="Write your message…"
                />
              </template>

              <!-- Voicemail -->
              <template v-else>
                <div
                  class="rounded-lg border border-line bg-surface-alt/60 p-3 text-[12.5px] text-mute leading-[1.55]"
                >
                  Queueing a callback adds this caller to the dialler with their
                  transcript attached. The note below routes alongside.
                </div>
                <textarea
                  v-model="draftBody"
                  rows="2"
                  class="zb-field w-full"
                  placeholder="Optional note for the callback log…"
                />
              </template>

              <div class="flex justify-end pt-1">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[13.5px] font-semibold px-3.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  @click="sendReply"
                >
                  <Send :size="14" :stroke-width="2.2" aria-hidden="true" />
                  {{ CHANNEL_META[selectedMessage.channel].sendLabel }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty selection -->
        <div
          v-else
          class="rounded-xl border border-dashed border-line bg-surface-alt/40 p-8 text-center"
        >
          <Inbox
            :size="22"
            :stroke-width="1.6"
            class="inline-block text-mute-2 mb-2"
            aria-hidden="true"
          />
          <p class="text-[13px] text-mute">Pick a message to read and reply.</p>
        </div>
      </div>
    </div>

    <!-- ===================================================================
         Stats panel, "what we would have missed" + channel mix
         =================================================================== -->
    <div class="px-4 sm:px-5 md:px-7 pt-7 md:pt-8 pb-6 md:pb-7">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5">
        <!-- Missed counter -->
        <div
          class="lg:col-span-2 rounded-xl border border-cyan-brand/30 bg-cyan-brand/5 p-4 md:p-5"
        >
          <div
            class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold mb-2"
          >
            <TriangleAlert :size="11" :stroke-width="2" aria-hidden="true" />
            What we would have missed
          </div>
          <div class="flex items-baseline gap-3 flex-wrap">
            <div
              class="font-display text-[40px] sm:text-[52px] md:text-[64px] leading-none text-ink tabular-nums"
            >
              {{ wouldHaveMissedCount }}
            </div>
            <div class="text-[13px] text-mute leading-[1.55] max-w-xs">
              messages on under-watched channels, social DMs, voicemail, public
              mentions, that would have slipped through under the "everyone
              watches their own inbox" model.
            </div>
          </div>
        </div>

        <!-- Channel mix -->
        <div class="lg:col-span-3 rounded-xl border border-line bg-white p-4 md:p-5">
          <div
            class="flex flex-wrap items-center justify-between gap-2 mb-3"
          >
            <div
              class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold"
            >
              <ChartColumn :size="11" :stroke-width="2" aria-hidden="true" />
              Channel mix
            </div>
            <span class="text-[11.5px] text-mute-2 tabular-nums">
              {{ totalProcessed }} processed · {{ spamCount }} auto-archived
            </span>
          </div>
          <div class="space-y-2">
            <div
              v-for="c in channelCounts"
              :key="c.channel"
              class="flex items-center gap-2"
            >
              <span
                class="inline-flex items-center gap-1.5 w-[88px] sm:w-[104px] flex-none text-[12.5px] text-ink"
              >
                <component
                  :is="c.icon"
                  :size="13"
                  :stroke-width="1.9"
                  class="flex-none text-mute-2"
                  aria-hidden="true"
                />
                {{ c.label }}
              </span>
              <div
                class="flex-1 h-1.5 rounded-full bg-surface-alt overflow-hidden"
              >
                <div
                  class="h-full bg-cyan-brand-deep zb-bar"
                  :style="{
                    width: `${totalProcessed ? (c.count / totalProcessed) * 100 : 0}%`,
                  }"
                />
              </div>
              <span
                class="text-[12px] text-mute-2 tabular-nums w-6 text-right"
              >
                {{ c.count }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Form fields, input + textarea share the same chrome. */
.zb-field {
  border-radius: 0.75rem;
  border: 1px solid var(--color-line, #E2E8F0);
  background: #fff;
  padding: 0.55rem 0.8rem;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-ink, #0a0f1a);
  font-family: var(--font-sans);
  transition: border-color 180ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1);
  resize: vertical;
}
.zb-field::placeholder { color: #94a3b8; }
.zb-field:hover { border-color: rgba(1, 219, 241, 0.4); }
.zb-field:focus {
  outline: none;
  border-color: #01dbf1;
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.22);
}

/* Two-line clamp for the inbox preview text. */
.zb-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Channel-mix bar width transitions softly as the stream evolves. */
.zb-bar {
  transition: width 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Newly-arrived inbox row slide-in. */
.zb-inbox-row {
  animation: zb-row-in 380ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes zb-row-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Live-stream pulse on the header dot. */
.zb-pulse { animation: zb-pulse 1.6s ease-out infinite; }
@keyframes zb-pulse {
  0%   { box-shadow: 0 0 0 0   rgba(1, 219, 241, 0.55); }
  70%  { box-shadow: 0 0 0 10px rgba(1, 219, 241, 0); }
  100% { box-shadow: 0 0 0 0   rgba(1, 219, 241, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .zb-bar       { transition: none; }
  .zb-inbox-row { animation: none; }
  .zb-pulse     { animation: none; }
}
</style>
