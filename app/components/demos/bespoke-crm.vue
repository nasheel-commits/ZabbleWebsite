<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, render } from 'vue'
import { Activity, CheckCircle2, ChevronRight, CircleDot, ClipboardList, Footprints, GripVertical, Mail, MapPin, MessageCircle, Phone, Send, Sparkles, TrendingUp, Users, Wallet, X, Zap } from '@lucide/vue'

type Channel = 'call' | 'whatsapp' | 'email' | 'visit'

type BusinessKey = 'equipment' | 'agency' | 'consulting'

interface Stage {
  key: string
  label: string
  /** Win probability for the weighted-pipeline calculation. */
  winProb: number
  /** Terminal stages don't show drag affordance; they cap the pipeline. */
  terminal?: 'won' | 'lost'
  /** Ritual that fires when a deal enters this stage. */
  ritual?: RitualKey
}

type RitualKey =
  | 'quote'
  | 'site-visit'
  | 'proposal-deck'
  | 'pitch-pack'
  | 'scoping-doc'
  | 'sow-draft'
  | 'won'

interface RitualDef {
  key: RitualKey
  title: string
  /** Per-line copy explaining the artifact the system produced. */
  lines: string[]
  /** Icon shown next to the ritual in the log and on the deal artifact strip. */
  icon: typeof Phone
}

interface Interaction {
  id: number
  channel: Channel
  at: string
  direction: 'in' | 'out'
  summary: string
}

interface Deal {
  id: string
  company: string
  contact: string
  value: number // ZAR thousands
  rep: string
  stageKey: string
  phone: string
  email: string
  interactions: Interaction[]
  artifacts: {
    quote?: { total: number; lines: number; createdAt: string }
    visit?: { when: string; address: string; brief: string }
    signature?: { status: string; ref: string }
    proposalDeck?: { slides: number; status: string }
    pitchPack?: { rehearsal: string }
    scopingDoc?: { sections: number }
    sowDraft?: { value: number }
  }
}

interface BusinessConfig {
  key: BusinessKey
  label: string
  pitch: string
  reps: string[]
  stages: Stage[]
  /** Metric labels for the dashboard side-pane. */
  metrics: {
    primary: string
    conversionLabel: string
  }
  /** Seed deals — only used at first switch into this business. */
  seed: () => Deal[]
}

// ---- ritual defs ----------------------------------------------------------

const RITUALS: Record<RitualKey, RitualDef> = {
  'quote': {
    key: 'quote',
    title: 'Quote draft generated',
    lines: [
      'Pricing engine priced 3 line items',
      'Draft saved against deal',
      'Awaiting rep review before send',
    ],
    icon: ClipboardList,
  },
  'site-visit': {
    key: 'site-visit',
    title: 'Site visit booked',
    lines: [
      'Visit brief drafted from prior calls',
      'Calendar slot held for rep + technician',
      'Address pinned to the deal',
    ],
    icon: MapPin,
  },
  'proposal-deck': {
    key: 'proposal-deck',
    title: 'Proposal deck assembled',
    lines: [
      'Template populated from discovery notes',
      'Pricing block pulled from rate card',
      'Draft saved against deal',
    ],
    icon: ClipboardList,
  },
  'pitch-pack': {
    key: 'pitch-pack',
    title: 'Pitch pack sent',
    lines: [
      'Reminder + agenda emailed to client',
      'Internal rehearsal booked',
      'Stakeholder map shared with team',
    ],
    icon: Send,
  },
  'scoping-doc': {
    key: 'scoping-doc',
    title: 'Scoping doc opened',
    lines: [
      'Template populated from discovery',
      'Scoping workshop slot held',
      'Doc shared with the client',
    ],
    icon: ClipboardList,
  },
  'sow-draft': {
    key: 'sow-draft',
    title: 'SOW drafted',
    lines: [
      'Scope, deliverables and rates lifted from scoping doc',
      'Draft saved against deal',
      'Awaiting partner review',
    ],
    icon: ClipboardList,
  },
  'won': {
    key: 'won',
    title: 'Deal won — hand-off fired',
    lines: [
      'Contract pushed to e-sign',
      'Accounting projection updated',
      'Ops notified',
    ],
    icon: CheckCircle2,
  },
}

// ---- business configurations ----------------------------------------------

function dealId(prefix: string, n: number) {
  return `${prefix}-${n.toString().padStart(2, '0')}`
}

const BUSINESSES: BusinessConfig[] = [
  {
    key: 'equipment',
    label: 'Equipment sales',
    pitch: 'B2B equipment pipeline — long cycles, site visits, hands-on quoting.',
    reps: ['SA', 'MK', 'TL'],
    stages: [
      { key: 'lead',        label: 'Lead',        winProb: 0.05 },
      { key: 'discovery',   label: 'Discovery',   winProb: 0.15 },
      { key: 'demo',        label: 'Demo',        winProb: 0.30 },
      { key: 'site-visit',  label: 'Site Visit',  winProb: 0.45, ritual: 'site-visit' },
      { key: 'quote',       label: 'Quote',       winProb: 0.60, ritual: 'quote' },
      { key: 'negotiation', label: 'Negotiation', winProb: 0.75 },
      { key: 'won',         label: 'Won',         winProb: 1.00, ritual: 'won', terminal: 'won' },
      { key: 'lost',        label: 'Lost',        winProb: 0.00, terminal: 'lost' },
    ],
    metrics: { primary: 'Weighted pipeline', conversionLabel: 'Stage → Stage conversion' },
    seed: () => [
      mkDeal('eq', 1, 'Hartebees Mining',   'Naledi Mokoena', 1840, 'SA', 'discovery'),
      mkDeal('eq', 2, 'Karoo Logistics',    'Pieter van Wyk',  640, 'MK', 'demo'),
      mkDeal('eq', 3, 'Inyanga Plant Hire', 'Thandi Dube',     920, 'TL', 'lead'),
      mkDeal('eq', 4, 'Drakensberg Civils', 'Schalk Pretorius',1320, 'SA', 'negotiation'),
      mkDeal('eq', 5, 'Mzansi Earthworks',  'Lebo Ngcobo',     480, 'MK', 'lead'),
      mkDeal('eq', 6, 'Cape Bulk Handling', 'Adriaan Smit',    760, 'TL', 'demo'),
      mkDeal('eq', 7, 'Vaal Aggregate',     'Sipho Khumalo',   2100, 'SA', 'site-visit'),
    ],
  },
  {
    key: 'agency',
    label: 'Agency',
    pitch: 'Creative agency pipeline — brief, pitch, contract, kickoff.',
    reps: ['JD', 'RP', 'KM'],
    stages: [
      { key: 'lead',        label: 'Lead',        winProb: 0.05 },
      { key: 'brief',       label: 'Brief',       winProb: 0.20 },
      { key: 'proposal',    label: 'Proposal',    winProb: 0.40, ritual: 'proposal-deck' },
      { key: 'pitch',       label: 'Pitch',       winProb: 0.55, ritual: 'pitch-pack' },
      { key: 'contract',    label: 'Contract',    winProb: 0.80 },
      { key: 'won',         label: 'Won',         winProb: 1.00, ritual: 'won', terminal: 'won' },
      { key: 'lost',        label: 'Lost',        winProb: 0.00, terminal: 'lost' },
    ],
    metrics: { primary: 'Weighted pipeline', conversionLabel: 'Pitch → Win ratio' },
    seed: () => [
      mkDeal('ag', 1, 'Tafelberg Beverages', 'Imke Joubert',  280, 'JD', 'brief'),
      mkDeal('ag', 2, 'Lulamile Telecom',    'Bongi Mthembu', 540, 'RP', 'proposal'),
      mkDeal('ag', 3, 'Roodepoort Retail',   'Mariska Coetzee',180,'KM', 'lead'),
      mkDeal('ag', 4, 'Sundara Cosmetics',   'Aisha Patel',   420, 'JD', 'pitch'),
      mkDeal('ag', 5, 'Bluewater Insurance', 'Wikus Steyn',   330, 'RP', 'lead'),
      mkDeal('ag', 6, 'Vumelana Fintech',    'Lwando Ndlovu', 610, 'KM', 'contract'),
    ],
  },
  {
    key: 'consulting',
    label: 'Consulting',
    pitch: 'Consulting pipeline — discovery, scoping, SOW, engagement.',
    reps: ['HN', 'EF', 'MO'],
    stages: [
      { key: 'lead',       label: 'Lead',        winProb: 0.05 },
      { key: 'discovery',  label: 'Discovery',   winProb: 0.20 },
      { key: 'scoping',    label: 'Scoping',     winProb: 0.40, ritual: 'scoping-doc' },
      { key: 'proposal',   label: 'SOW',         winProb: 0.60, ritual: 'sow-draft' },
      { key: 'engagement', label: 'Engagement',  winProb: 0.90 },
      { key: 'won',        label: 'Won',         winProb: 1.00, ritual: 'won', terminal: 'won' },
      { key: 'lost',       label: 'Lost',        winProb: 0.00, terminal: 'lost' },
    ],
    metrics: { primary: 'Weighted pipeline', conversionLabel: 'Scoping → Engaged ratio' },
    seed: () => [
      mkDeal('co', 1, 'Indaba Public Sector', 'Refilwe Tau',   720, 'HN', 'discovery'),
      mkDeal('co', 2, 'Highveld Health',      'Janneke Botha', 480, 'EF', 'scoping'),
      mkDeal('co', 3, 'Phoenix Mfg',          'Vusi Sithole',  260, 'MO', 'lead'),
      mkDeal('co', 4, 'Garden Route Energy',  'Anneli Visser', 940, 'HN', 'proposal'),
      mkDeal('co', 5, 'eThekwini Logistics',  'Sanele Mahlangu',150,'EF', 'lead'),
      mkDeal('co', 6, 'NewSands Mining',      'Bridget Naidoo',1240,'MO', 'engagement'),
    ],
  },
]

function mkDeal(
  prefix: string,
  n: number,
  company: string,
  contact: string,
  value: number,
  rep: string,
  stageKey: string,
): Deal {
  // Deterministic seed timeline — same content every render so SSR/hydrate match.
  const baseInteractions: Interaction[] = [
    {
      id: n * 100 + 1,
      channel: 'email',
      direction: 'in',
      at: 'Mon · 09:14',
      summary: `${contact.split(' ')[0]} replied to the intro email asking for next steps.`,
    },
    {
      id: n * 100 + 2,
      channel: 'call',
      direction: 'out',
      at: 'Mon · 14:22',
      summary: 'Discovery call. Budget signalled around the high end. Decision-maker confirmed.',
    },
    {
      id: n * 100 + 3,
      channel: 'whatsapp',
      direction: 'in',
      at: 'Tue · 08:01',
      summary: '"Send me a summary of what we discussed and I\'ll loop in finance."',
    },
  ]
  return {
    id: dealId(prefix, n),
    company,
    contact,
    value,
    rep,
    stageKey,
    phone: '+27 8' + (10 + n) + ' ' + (100 + n * 7) + ' ' + (1000 + n * 13),
    email: `${contact.split(' ')[0].toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.co.za`,
    interactions: baseInteractions,
    artifacts: {},
  }
}

// ---- state -----------------------------------------------------------------

const activeBusinessKey = ref<BusinessKey>('equipment')
const activeBusiness = computed(() => BUSINESSES.find((b) => b.key === activeBusinessKey.value)!)

// Per-business deal stores — switching business swaps the working set rather
// than wiping it (so you can flip between configs without losing your moves).
const dealsByBusiness: Record<BusinessKey, Deal[]> = reactive({
  equipment: BUSINESSES[0]!.seed(),
  agency: BUSINESSES[1]!.seed(),
  consulting: BUSINESSES[2]!.seed(),
})

const deals = computed(() => dealsByBusiness[activeBusinessKey.value])

const dealsByStage = computed(() => {
  const out: Record<string, Deal[]> = {}
  for (const stage of activeBusiness.value.stages) out[stage.key] = []
  for (const d of deals.value) (out[d.stageKey] ??= []).push(d)
  return out
})

// ---- mounting flag (avoids SSR hydration issues for the interactive bits) ---

const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

// ---- ritual log -----------------------------------------------------------

interface LogEntry {
  id: number
  kind: 'ritual' | 'inbound' | 'move'
  title: string
  body: string
  icon: typeof Phone
  channel?: Channel
}
const logId = ref(1)
const log = ref<LogEntry[]>([])
function pushLog(entry: Omit<LogEntry, 'id'>) {
  log.value.unshift({ ...entry, id: logId.value++ })
  if (log.value.length > 8) log.value.length = 8
}

// ---- stage move + rituals -------------------------------------------------

function moveDeal(dealId: string, toStageKey: string) {
  const d = deals.value.find((x) => x.id === dealId)
  if (!d) return
  if (d.stageKey === toStageKey) return
  const fromStage = activeBusiness.value.stages.find((s) => s.key === d.stageKey)
  const toStage = activeBusiness.value.stages.find((s) => s.key === toStageKey)
  if (!toStage) return
  d.stageKey = toStageKey
  pushLog({
    kind: 'move',
    title: `${d.company} → ${toStage.label}`,
    body: `Moved from ${fromStage?.label ?? '—'}. ${activeBusiness.value.reps.includes(d.rep) ? d.rep : 'rep'} owns it.`,
    icon: CircleDot,
  })
  if (toStage.ritual) fireRitual(d, toStage.ritual)
  flashStage(toStageKey)
}

function fireRitual(d: Deal, ritualKey: RitualKey) {
  const r = RITUALS[ritualKey]
  switch (ritualKey) {
    case 'quote':
      d.artifacts.quote = { total: d.value, lines: 3, createdAt: 'just now' }
      break
    case 'site-visit':
      d.artifacts.visit = {
        when: 'Thu · 10:30',
        address: `${d.company} HQ`,
        brief: 'Pre-visit brief seeded from call + WhatsApp notes.',
      }
      break
    case 'proposal-deck':
      d.artifacts.proposalDeck = { slides: 14, status: 'draft' }
      break
    case 'pitch-pack':
      d.artifacts.pitchPack = { rehearsal: 'Wed · 16:00' }
      break
    case 'scoping-doc':
      d.artifacts.scopingDoc = { sections: 6 }
      break
    case 'sow-draft':
      d.artifacts.sowDraft = { value: d.value }
      break
    case 'won':
      d.artifacts.signature = { status: 'sent to e-sign', ref: `ESIGN-${d.id.toUpperCase()}` }
      break
  }
  pushLog({
    kind: 'ritual',
    title: `Ritual fired · ${r.title}`,
    body: `${d.company} — ${r.lines.join(' · ')}`,
    icon: r.icon,
  })
}

// Brief column highlight when a deal lands.
const flashingStage = ref<string | null>(null)
let flashTimer: ReturnType<typeof setTimeout> | null = null
function flashStage(key: string) {
  flashingStage.value = key
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => {
    flashingStage.value = null
  }, 700)
}
onBeforeUnmount(() => {
  if (flashTimer) clearTimeout(flashTimer)
})

// ---- drag and drop --------------------------------------------------------

const dragging = ref<string | null>(null)
const dragOverStage = ref<string | null>(null)

function onDragStart(e: DragEvent, deal: Deal) {
  if (!e.dataTransfer) return
  e.dataTransfer.setData('text/plain', deal.id)
  e.dataTransfer.effectAllowed = 'move'
  dragging.value = deal.id
}
function onDragEnd() {
  dragging.value = null
  dragOverStage.value = null
}
function onDragOver(e: DragEvent, stageKey: string) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverStage.value = stageKey
}
function onDragLeave(stageKey: string) {
  if (dragOverStage.value === stageKey) dragOverStage.value = null
}
function onDrop(e: DragEvent, stageKey: string) {
  e.preventDefault()
  const id = e.dataTransfer?.getData('text/plain')
  if (id) moveDeal(id, stageKey)
  dragging.value = null
  dragOverStage.value = null
}

// Mobile / touch fallback — open a stage picker per card.
const stagePickerFor = ref<string | null>(null)
function openStagePicker(dealId: string) {
  stagePickerFor.value = stagePickerFor.value === dealId ? null : dealId
}
function pickStage(dealId: string, stageKey: string) {
  moveDeal(dealId, stageKey)
  stagePickerFor.value = null
}

// ---- deal detail modal ----------------------------------------------------

const openDealId = ref<string | null>(null)
const openDeal = computed(() => deals.value.find((d) => d.id === openDealId.value) ?? null)
function openDealModal(d: Deal) {
  openDealId.value = d.id
}
function closeDealModal() {
  openDealId.value = null
}
function onModalKey(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDealModal()
}
onMounted(() => window.addEventListener('keydown', onModalKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onModalKey))

// ---- channel simulator ----------------------------------------------------

const simChannel = ref<Channel>('whatsapp')
const channelMeta: Record<Channel, { label: string; icon: typeof Phone; sample: string[] }> = {
  call: {
    label: 'Call',
    icon: Phone,
    sample: [
      'Missed call · voicemail transcribed: "We\'d like to revisit pricing on the proposal."',
      'Returned call from procurement — wants delivery timeline by Friday.',
      'Inbound: contact wants to push site visit by a week.',
    ],
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: MessageCircle,
    sample: [
      '"Hi — just confirming Thursday at 10:30 still works for the visit?"',
      '"My MD reviewed the quote, can we knock 5% off line two?"',
      '"Sending through the floor plan, hope it helps the brief."',
    ],
  },
  email: {
    label: 'Email',
    icon: Mail,
    sample: [
      'Subject: "RE: Proposal v2" — finance has signed off, please share contract.',
      'Subject: "Question on warranty cover" — needs answer before they commit.',
      'Subject: "Intro from a friend" — referral with budget signalled.',
    ],
  },
  visit: {
    label: 'In-person',
    icon: Footprints,
    sample: [
      'Site walk-through log uploaded by tech. Three blockers flagged.',
      'Walk-in at the showroom — looked at the mid-range range.',
      'Lunch meeting notes: decision-maker introduced, timeline shared.',
    ],
  },
}

const sampleCursors = reactive<Record<Channel, number>>({
  call: 0,
  whatsapp: 0,
  email: 0,
  visit: 0,
})

function fireInbound() {
  const open = activeBusiness.value.stages.filter((s) => !s.terminal)
  const candidates = deals.value.filter((d) => open.some((s) => s.key === d.stageKey))
  if (candidates.length === 0) return
  // Deterministic round-robin across candidates so the demo feels stable.
  const idx = (logId.value + sampleCursors[simChannel.value]) % candidates.length
  const target = candidates[idx]!
  const samples = channelMeta[simChannel.value].sample
  const text = samples[sampleCursors[simChannel.value] % samples.length]!
  sampleCursors[simChannel.value]++
  const newInteraction: Interaction = {
    id: Date.now(),
    channel: simChannel.value,
    direction: 'in',
    at: 'just now',
    summary: text,
  }
  target.interactions.unshift(newInteraction)
  pushLog({
    kind: 'inbound',
    channel: simChannel.value,
    title: `${channelMeta[simChannel.value].label} inbound · auto-matched`,
    body: `${target.company} — matched on ${matchFieldFor(simChannel.value)}. "${text.length > 80 ? text.slice(0, 78) + '…' : text}"`,
    icon: channelMeta[simChannel.value].icon,
  })
  // Briefly pulse the card column so the user sees where it landed.
  flashStage(target.stageKey)
}

function matchFieldFor(c: Channel) {
  switch (c) {
    case 'call':     return 'phone number'
    case 'whatsapp': return 'WhatsApp number'
    case 'email':    return 'email domain'
    case 'visit':    return 'rep + location pin'
  }
}

// ---- ops dashboard --------------------------------------------------------

const weightedPipeline = computed(() => {
  let sum = 0
  for (const d of deals.value) {
    const s = activeBusiness.value.stages.find((x) => x.key === d.stageKey)
    if (!s) continue
    if (s.terminal === 'lost') continue
    sum += d.value * s.winProb
  }
  return Math.round(sum)
})

const grossPipeline = computed(() => {
  let sum = 0
  for (const d of deals.value) {
    const s = activeBusiness.value.stages.find((x) => x.key === d.stageKey)
    if (!s || s.terminal) continue
    sum += d.value
  }
  return sum
})

const stageCounts = computed(() => {
  const m: Record<string, number> = {}
  for (const s of activeBusiness.value.stages) m[s.key] = 0
  for (const d of deals.value) m[d.stageKey] = (m[d.stageKey] ?? 0) + 1
  return m
})

const stageValues = computed(() => {
  const m: Record<string, number> = {}
  for (const s of activeBusiness.value.stages) m[s.key] = 0
  for (const d of deals.value) m[d.stageKey] = (m[d.stageKey] ?? 0) + d.value
  return m
})

const repLoad = computed(() => {
  const m: Record<string, { count: number; value: number }> = {}
  for (const rep of activeBusiness.value.reps) m[rep] = { count: 0, value: 0 }
  for (const d of deals.value) {
    const s = activeBusiness.value.stages.find((x) => x.key === d.stageKey)
    if (!s || s.terminal) continue
    if (!m[d.rep]) m[d.rep] = { count: 0, value: 0 }
    m[d.rep]!.count++
    m[d.rep]!.value += d.value
  }
  return m
})

const maxRepValue = computed(() => {
  let max = 1
  for (const k of Object.keys(repLoad.value)) {
    if (repLoad.value[k]!.value > max) max = repLoad.value[k]!.value
  }
  return max
})

const wonCount = computed(
  () => deals.value.filter((d) => {
    const s = activeBusiness.value.stages.find((x) => x.key === d.stageKey)
    return s?.terminal === 'won'
  }).length,
)
const lostCount = computed(
  () => deals.value.filter((d) => {
    const s = activeBusiness.value.stages.find((x) => x.key === d.stageKey)
    return s?.terminal === 'lost'
  }).length,
)
const conversionPct = computed(() => {
  const decided = wonCount.value + lostCount.value
  if (decided === 0) return null
  return Math.round((wonCount.value / decided) * 100)
})

// ---- formatting helpers ---------------------------------------------------

function fmtK(value: number): string {
  if (value >= 1000) return `R${(value / 1000).toFixed(1)}m`
  return `R${value}k`
}

function channelIcon(c: Channel) {
  return channelMeta[c].icon
}

function repColor(rep: string) {
  // Stable colour-ish accent per rep, but using brand tokens only.
  const idx = activeBusiness.value.reps.indexOf(rep)
  switch (idx) {
    case 0:  return 'bg-cyan-brand/15 text-cyan-brand-deep ring-cyan-brand/30'
    case 1:  return 'bg-surface-alt text-ink ring-line'
    case 2:  return 'bg-ink/5 text-ink ring-ink/10'
    default: return 'bg-surface-alt text-mute ring-line'
  }
}

// Scroll the pipeline back to the start when business changes.
const pipelineRef = ref<HTMLElement | null>(null)
function switchBusiness(k: BusinessKey) {
  activeBusinessKey.value = k
  log.value = []
  openDealId.value = null
  nextTick(() => {
    if (pipelineRef.value) pipelineRef.value.scrollLeft = 0
  })
}

</script>

<template>
  <div class="bespoke-crm relative bg-white text-ink">
    <!-- ===== Top bar ===== -->
    <header class="border-b border-line bg-surface-alt/60 px-4 sm:px-6 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3 min-w-0">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-brand/12 text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0" aria-hidden="true">
          <Zap :size="17" :stroke-width="1.9" />
        </span>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-display text-[18px] leading-none text-ink">Bespoke CRM</span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              <span class="h-1.5 w-1.5 rounded-full bg-cyan-brand" aria-hidden="true" />
              Live demo
            </span>
          </div>
          <p class="mt-1 text-[12px] leading-tight text-mute truncate">{{ activeBusiness.pitch }}</p>
        </div>
      </div>

      <div class="flex flex-col items-stretch sm:items-end gap-2">
        <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">Business type</div>
        <div role="tablist" aria-label="Business type" class="inline-flex rounded-xl border border-line bg-white p-1">
          <button
            v-for="b in BUSINESSES"
            :key="b.key"
            type="button"
            role="tab"
            :aria-selected="b.key === activeBusinessKey"
            class="px-3 py-1.5 text-[12.5px] font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            :class="b.key === activeBusinessKey ? 'bg-ink text-white' : 'text-mute hover:text-ink'"
            @click="switchBusiness(b.key)"
          >
            {{ b.label }}
          </button>
        </div>
      </div>
    </header>

    <!-- ===== Body grid: pipeline + ops side-pane ===== -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
      <!-- ===== Pipeline column ===== -->
      <section class="border-b lg:border-b-0 lg:border-r border-line">
        <div class="px-4 sm:px-6 pt-4 flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <span class="dot" /> Pipeline
            </div>
            <p class="mt-1 text-[12.5px] text-mute leading-snug">
              Drag a deal between stages — the right ritual fires automatically.
              <span class="hidden md:inline">On touch, tap the grip to pick a stage.</span>
            </p>
          </div>
          <div class="hidden sm:flex items-center gap-1.5 text-[11.5px] text-mute-2">
            <span class="inline-flex items-center gap-1"><GripVertical :size="13" :stroke-width="1.9" /> drag</span>
            <span class="text-mute-2/60">·</span>
            <span class="inline-flex items-center gap-1"><Sparkles :size="12" :stroke-width="1.9" /> ritual</span>
          </div>
        </div>

        <!-- Kanban -->
        <div
          ref="pipelineRef"
          class="mt-4 overflow-x-auto pb-5 px-4 sm:px-6"
          style="scrollbar-width: thin;"
        >
          <ol class="flex gap-3 min-w-max" role="list">
            <li
              v-for="stage in activeBusiness.stages"
              :key="stage.key"
              class="w-[220px] sm:w-[230px] shrink-0"
            >
              <div
                class="rounded-2xl border bg-white/80 backdrop-blur-[1px] flex flex-col min-h-[280px] transition-colors"
                :class="[
                  stage.terminal === 'lost' ? 'border-line/80' : 'border-line',
                  dragOverStage === stage.key ? 'border-cyan-brand ring-2 ring-cyan-brand/20 bg-white' : '',
                  flashingStage === stage.key ? 'ring-2 ring-cyan-brand/40' : '',
                ]"
                @dragover="onDragOver($event, stage.key)"
                @dragleave="onDragLeave(stage.key)"
                @drop="onDrop($event, stage.key)"
              >
                <div class="px-3 pt-3 pb-2 flex items-center justify-between">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span
                        class="h-1.5 w-1.5 rounded-full"
                        :class="stage.terminal === 'won' ? 'bg-cyan-brand' : stage.terminal === 'lost' ? 'bg-mute-2/60' : 'bg-cyan-brand-deep/60'"
                        aria-hidden="true"
                      />
                      <span class="text-[12.5px] font-semibold text-ink leading-none">{{ stage.label }}</span>
                      <span v-if="stage.ritual" :title="`Ritual: ${RITUALS[stage.ritual].title}`" class="inline-flex">
                        <Sparkles :size="11" :stroke-width="2" class="text-cyan-brand-deep/80" />
                      </span>
                    </div>
                    <div class="mt-1 flex items-center gap-2 text-[10.5px] text-mute-2">
                      <span>{{ stageCounts[stage.key] }} {{ stageCounts[stage.key] === 1 ? 'deal' : 'deals' }}</span>
                      <span class="text-mute-2/50">·</span>
                      <span>{{ fmtK(stageValues[stage.key] || 0) }}</span>
                    </div>
                  </div>
                </div>

                <div class="px-2.5 pb-2.5 flex flex-col gap-2 grow">
                  <article
                    v-for="d in dealsByStage[stage.key]"
                    :key="d.id"
                    :draggable="mounted && !stage.terminal"
                    class="group relative rounded-xl border border-line bg-white px-2.5 py-2 cursor-grab active:cursor-grabbing transition-all"
                    :class="[
                      dragging === d.id ? 'opacity-50' : 'hover:border-ink/15 hover:shadow-[0_8px_22px_-14px_rgba(15,23,42,0.18)]',
                    ]"
                    @dragstart="onDragStart($event, d)"
                    @dragend="onDragEnd"
                  >
                    <div class="flex items-start gap-2">
                      <button
                        type="button"
                        class="shrink-0 -ml-1 mt-0.5 h-6 w-6 rounded-md inline-flex items-center justify-center text-mute-2 hover:text-ink hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                        :aria-label="`Move ${d.company}`"
                        @click.stop="openStagePicker(d.id)"
                      >
                        <GripVertical :size="13" :stroke-width="2" />
                      </button>
                      <button
                        type="button"
                        class="flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 rounded"
                        @click="openDealModal(d)"
                      >
                        <div class="text-[13px] font-semibold text-ink leading-snug truncate">{{ d.company }}</div>
                        <div class="mt-0.5 text-[11.5px] text-mute leading-snug truncate">{{ d.contact }}</div>
                        <div class="mt-1.5 flex items-center gap-1.5 justify-between">
                          <span class="font-display text-[14px] leading-none text-ink">{{ fmtK(d.value) }}</span>
                          <span
                            class="inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-semibold ring-1"
                            :class="repColor(d.rep)"
                            :aria-label="`Owner: ${d.rep}`"
                          >{{ d.rep }}</span>
                        </div>

                        <!-- Artifact strip -->
                        <div
                          v-if="d.artifacts.quote || d.artifacts.visit || d.artifacts.signature || d.artifacts.proposalDeck || d.artifacts.pitchPack || d.artifacts.scopingDoc || d.artifacts.sowDraft"
                          class="mt-2 flex flex-wrap gap-1"
                        >
                          <span v-if="d.artifacts.quote"        class="artifact-pill"><ClipboardList :size="10" :stroke-width="2" />Quote</span>
                          <span v-if="d.artifacts.visit"        class="artifact-pill"><MapPin :size="10" :stroke-width="2" />Visit</span>
                          <span v-if="d.artifacts.proposalDeck" class="artifact-pill"><ClipboardList :size="10" :stroke-width="2" />Deck</span>
                          <span v-if="d.artifacts.pitchPack"    class="artifact-pill"><Send :size="10" :stroke-width="2" />Pack</span>
                          <span v-if="d.artifacts.scopingDoc"   class="artifact-pill"><ClipboardList :size="10" :stroke-width="2" />Scope</span>
                          <span v-if="d.artifacts.sowDraft"     class="artifact-pill"><ClipboardList :size="10" :stroke-width="2" />SOW</span>
                          <span v-if="d.artifacts.signature"    class="artifact-pill"><CheckCircle2 :size="10" :stroke-width="2" />E-sign</span>
                        </div>
                      </button>
                    </div>

                    <!-- Stage picker popover (touch fallback) -->
                    <div
                      v-if="stagePickerFor === d.id"
                      class="absolute z-20 left-2 right-2 top-full mt-1 rounded-lg border border-line bg-white shadow-[0_18px_40px_-22px_rgba(15,23,42,0.25)] p-1"
                    >
                      <button
                        v-for="s in activeBusiness.stages"
                        :key="s.key"
                        type="button"
                        class="w-full text-left text-[12px] px-2 py-1.5 rounded-md flex items-center justify-between hover:bg-surface-alt"
                        :class="s.key === d.stageKey ? 'text-mute-2' : 'text-ink'"
                        :disabled="s.key === d.stageKey"
                        @click="pickStage(d.id, s.key)"
                      >
                        <span>{{ s.label }}</span>
                        <ChevronRight v-if="s.key !== d.stageKey" :size="12" :stroke-width="2" class="text-mute-2" />
                      </button>
                    </div>
                  </article>

                  <div
                    v-if="(dealsByStage[stage.key] || []).length === 0"
                    class="mt-1 text-[11.5px] text-mute-2/80 italic px-1 leading-snug"
                  >
                    Drop a deal here.
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>

        <!-- Channel simulator + ritual log -->
        <div class="border-t border-line grid grid-cols-1 md:grid-cols-2">
          <div class="border-b md:border-b-0 md:border-r border-line p-4 sm:p-5">
            <div class="flex items-center justify-between">
              <div class="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
                <span class="dot" /> Channel simulator
              </div>
            </div>
            <p class="mt-1 text-[12.5px] text-mute leading-snug">
              Fire a fake inbound — watch it auto-attach to the right deal.
            </p>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <button
                v-for="c in ['call','whatsapp','email','visit'] as Channel[]"
                :key="c"
                type="button"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                :class="simChannel === c ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-line hover:border-ink/30'"
                @click="simChannel = c"
              >
                <component :is="channelIcon(c)" :size="13" :stroke-width="2" />
                {{ channelMeta[c].label }}
              </button>
            </div>

            <button
              type="button"
              class="mt-3 inline-flex items-center gap-2 rounded-lg bg-cyan-brand-deep hover:bg-cyan-brand-deep/90 text-white text-[13px] font-semibold px-3.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="fireInbound"
            >
              <Send :size="14" :stroke-width="2" />
              Fire {{ channelMeta[simChannel].label.toLowerCase() }} inbound
            </button>

            <p class="mt-3 text-[11.5px] text-mute-2 leading-snug">
              Match logic mocked: inbounds attach by {{ matchFieldFor(simChannel) }}.
            </p>
          </div>

          <div class="p-4 sm:p-5">
            <div class="flex items-center justify-between">
              <div class="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
                <span class="dot" /> Ritual log
              </div>
              <span class="text-[10.5px] text-mute-2">Most recent first</span>
            </div>

            <ul v-if="log.length" class="mt-3 space-y-1.5">
              <li
                v-for="entry in log.slice(0, 5)"
                :key="entry.id"
                class="rounded-lg border border-line bg-white px-2.5 py-2 flex items-start gap-2"
              >
                <span
                  class="mt-0.5 inline-flex items-center justify-center h-6 w-6 rounded-md shrink-0"
                  :class="entry.kind === 'ritual'
                    ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-1 ring-cyan-brand/25'
                    : entry.kind === 'inbound'
                    ? 'bg-surface-alt text-ink ring-1 ring-line'
                    : 'bg-ink/5 text-ink ring-1 ring-ink/10'"
                  aria-hidden="true"
                >
                  <component :is="entry.icon" :size="12" :stroke-width="2" />
                </span>
                <div class="min-w-0">
                  <div class="text-[12px] font-semibold text-ink leading-snug">{{ entry.title }}</div>
                  <div class="mt-0.5 text-[11.5px] text-mute leading-snug truncate">{{ entry.body }}</div>
                </div>
              </li>
            </ul>
            <p v-else class="mt-3 text-[12px] text-mute italic">
              Move a deal or fire an inbound — events will appear here.
            </p>
          </div>
        </div>
      </section>

      <!-- ===== Ops dashboard side-pane ===== -->
      <aside class="bg-surface-alt/40 p-4 sm:p-5 flex flex-col gap-4">
        <div>
          <div class="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" /> Live ops
          </div>
          <p class="mt-1 text-[12px] text-mute leading-snug">{{ activeBusiness.label }} view.</p>
        </div>

        <!-- Weighted pipeline -->
        <div class="rounded-xl border border-line bg-white p-3.5">
          <div class="flex items-center justify-between">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">{{ activeBusiness.metrics.primary }}</div>
            <TrendingUp :size="14" :stroke-width="2" class="text-cyan-brand-deep" />
          </div>
          <div class="mt-1 font-display text-[24px] md:text-[28px] leading-none text-ink">{{ fmtK(weightedPipeline) }}</div>
          <div class="mt-1 text-[11px] text-mute-2 leading-snug">
            of <span class="text-ink font-semibold">{{ fmtK(grossPipeline) }}</span> gross open
          </div>
        </div>

        <!-- Conversion -->
        <div class="rounded-xl border border-line bg-white p-3.5">
          <div class="flex items-center justify-between">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">{{ activeBusiness.metrics.conversionLabel }}</div>
            <Activity :size="14" :stroke-width="2" class="text-cyan-brand-deep" />
          </div>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="font-display text-[24px] md:text-[28px] leading-none text-ink">{{ conversionPct === null ? '—' : conversionPct + '%' }}</span>
            <span class="text-[11px] text-mute-2">won of decided</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-[11px]">
            <span class="inline-flex items-center gap-1 text-ink"><CheckCircle2 :size="11" :stroke-width="2" class="text-cyan-brand-deep" /> {{ wonCount }} won</span>
            <span class="text-mute-2/50">·</span>
            <span class="text-mute">{{ lostCount }} lost</span>
          </div>
        </div>

        <!-- Stage funnel mini-bars -->
        <div class="rounded-xl border border-line bg-white p-3.5">
          <div class="flex items-center justify-between">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Stage load</div>
            <Wallet :size="14" :stroke-width="2" class="text-cyan-brand-deep" />
          </div>
          <ul class="mt-2 space-y-1.5">
            <li
              v-for="s in activeBusiness.stages.filter((x) => !x.terminal)"
              :key="s.key"
              class="text-[11.5px]"
            >
              <div class="flex items-center justify-between">
                <span class="text-ink truncate">{{ s.label }}</span>
                <span class="text-mute-2 tabular-nums">{{ stageCounts[s.key] }}</span>
              </div>
              <div class="mt-1 h-1 rounded-full bg-surface-alt overflow-hidden">
                <div
                  class="h-full bg-cyan-brand-deep/70 transition-[width] duration-500"
                  :style="{ width: `${Math.min(100, (stageCounts[s.key] || 0) * 22)}%` }"
                />
              </div>
            </li>
          </ul>
        </div>

        <!-- Rep load -->
        <div class="rounded-xl border border-line bg-white p-3.5">
          <div class="flex items-center justify-between">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Rep load</div>
            <Users :size="14" :stroke-width="2" class="text-cyan-brand-deep" />
          </div>
          <ul class="mt-2 space-y-2">
            <li
              v-for="rep in activeBusiness.reps"
              :key="rep"
              class="flex items-center gap-2"
            >
              <span
                class="inline-flex items-center justify-center h-6 w-6 rounded-full text-[10.5px] font-semibold ring-1"
                :class="repColor(rep)"
                :aria-hidden="true"
              >{{ rep }}</span>
              <div class="grow min-w-0">
                <div class="flex items-center justify-between text-[11.5px]">
                  <span class="text-ink tabular-nums">{{ repLoad[rep]?.count ?? 0 }} open</span>
                  <span class="text-mute-2 tabular-nums">{{ fmtK(repLoad[rep]?.value ?? 0) }}</span>
                </div>
                <div class="mt-1 h-1 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    class="h-full bg-cyan-brand-deep/70 transition-[width] duration-500"
                    :style="{ width: `${((repLoad[rep]?.value ?? 0) / maxRepValue) * 100}%` }"
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- ===== Deal modal ===== -->
    <Teleport to="body">
      <div
        v-if="openDeal && mounted"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="`Deal: ${openDeal.company}`"
      >
        <button
          type="button"
          class="absolute inset-0 bg-ink/35 backdrop-blur-[1px]"
          aria-label="Close deal"
          @click="closeDealModal"
        />
        <div class="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white border border-line shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
          <header class="sticky top-0 z-10 bg-white border-b border-line px-4 sm:px-5 py-3 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-[10.5px] uppercase tracking-[0.2em] text-cyan-brand-deep font-semibold">Deal</div>
              <h3 class="mt-0.5 font-display text-[18px] sm:text-[22px] leading-tight text-ink truncate">{{ openDeal.company }}</h3>
              <div class="mt-1 text-[12.5px] text-mute truncate">
                {{ openDeal.contact }} · {{ openDeal.email }} · {{ openDeal.phone }}
              </div>
            </div>
            <button
              type="button"
              class="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-lg text-mute hover:text-ink hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              aria-label="Close"
              @click="closeDealModal"
            >
              <X :size="16" :stroke-width="2" />
            </button>
          </header>

          <div class="px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-line">
            <div>
              <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Stage</div>
              <div class="mt-1 text-[14px] font-semibold text-ink">{{ activeBusiness.stages.find((s) => s.key === openDeal.stageKey)?.label }}</div>
            </div>
            <div>
              <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Value</div>
              <div class="mt-1 font-display text-[18px] leading-none text-ink">{{ fmtK(openDeal.value) }}</div>
            </div>
            <div>
              <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Owner</div>
              <div class="mt-1 flex items-center gap-1.5">
                <span
                  class="inline-flex items-center justify-center h-6 w-6 rounded-full text-[10.5px] font-semibold ring-1"
                  :class="repColor(openDeal.rep)"
                >{{ openDeal.rep }}</span>
                <span class="text-[13px] text-ink">{{ openDeal.rep }}</span>
              </div>
            </div>
          </div>

          <!-- Move-to-stage row -->
          <div class="px-4 sm:px-5 py-3 border-b border-line bg-surface-alt/60">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold mb-2">Move to</div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="s in activeBusiness.stages"
                :key="s.key"
                type="button"
                class="inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors"
                :class="s.key === openDeal.stageKey
                  ? 'bg-ink text-white border-ink cursor-default'
                  : 'bg-white border-line text-ink hover:border-ink/30'"
                :disabled="s.key === openDeal.stageKey"
                @click="moveDeal(openDeal.id, s.key)"
              >
                <Sparkles v-if="s.ritual" :size="11" :stroke-width="2" class="text-cyan-brand-deep" />
                {{ s.label }}
              </button>
            </div>
          </div>

          <!-- Artifacts -->
          <div
            v-if="openDeal.artifacts.quote || openDeal.artifacts.visit || openDeal.artifacts.signature || openDeal.artifacts.proposalDeck || openDeal.artifacts.pitchPack || openDeal.artifacts.scopingDoc || openDeal.artifacts.sowDraft"
            class="px-4 sm:px-5 py-4 border-b border-line"
          >
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold mb-2">Artifacts the system built</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div v-if="openDeal.artifacts.quote" class="artifact-card">
                <div class="artifact-card-head"><ClipboardList :size="13" :stroke-width="2" />Quote draft</div>
                <div class="text-[12px] text-mute leading-snug">{{ openDeal.artifacts.quote.lines }} line items · total {{ fmtK(openDeal.artifacts.quote.total) }} · {{ openDeal.artifacts.quote.createdAt }}</div>
              </div>
              <div v-if="openDeal.artifacts.visit" class="artifact-card">
                <div class="artifact-card-head"><MapPin :size="13" :stroke-width="2" />Site visit</div>
                <div class="text-[12px] text-mute leading-snug">{{ openDeal.artifacts.visit.when }} · {{ openDeal.artifacts.visit.address }}</div>
              </div>
              <div v-if="openDeal.artifacts.proposalDeck" class="artifact-card">
                <div class="artifact-card-head"><ClipboardList :size="13" :stroke-width="2" />Proposal deck</div>
                <div class="text-[12px] text-mute leading-snug">{{ openDeal.artifacts.proposalDeck.slides }} slides · {{ openDeal.artifacts.proposalDeck.status }}</div>
              </div>
              <div v-if="openDeal.artifacts.pitchPack" class="artifact-card">
                <div class="artifact-card-head"><Send :size="13" :stroke-width="2" />Pitch pack</div>
                <div class="text-[12px] text-mute leading-snug">Rehearsal {{ openDeal.artifacts.pitchPack.rehearsal }}</div>
              </div>
              <div v-if="openDeal.artifacts.scopingDoc" class="artifact-card">
                <div class="artifact-card-head"><ClipboardList :size="13" :stroke-width="2" />Scoping doc</div>
                <div class="text-[12px] text-mute leading-snug">{{ openDeal.artifacts.scopingDoc.sections }} sections drafted</div>
              </div>
              <div v-if="openDeal.artifacts.sowDraft" class="artifact-card">
                <div class="artifact-card-head"><ClipboardList :size="13" :stroke-width="2" />SOW draft</div>
                <div class="text-[12px] text-mute leading-snug">{{ fmtK(openDeal.artifacts.sowDraft.value) }} · ready for partner review</div>
              </div>
              <div v-if="openDeal.artifacts.signature" class="artifact-card">
                <div class="artifact-card-head"><CheckCircle2 :size="13" :stroke-width="2" />E-sign</div>
                <div class="text-[12px] text-mute leading-snug">{{ openDeal.artifacts.signature.status }} · {{ openDeal.artifacts.signature.ref }}</div>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="px-4 sm:px-5 py-4">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold mb-3">Interactions · all channels on one thread</div>
            <ol class="relative space-y-3 before:absolute before:left-[11px] before:top-1 before:bottom-1 before:w-px before:bg-line">
              <li
                v-for="ix in openDeal.interactions"
                :key="ix.id"
                class="relative pl-8"
              >
                <span
                  class="absolute left-0 top-0.5 inline-flex items-center justify-center h-6 w-6 rounded-full ring-1"
                  :class="ix.direction === 'in'
                    ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-cyan-brand/25'
                    : 'bg-surface-alt text-ink ring-line'"
                  :aria-label="ix.direction === 'in' ? 'Inbound' : 'Outbound'"
                >
                  <component :is="channelIcon(ix.channel)" :size="12" :stroke-width="2" />
                </span>
                <div class="flex items-center gap-2 text-[11px] text-mute-2">
                  <span class="font-semibold text-ink uppercase tracking-[0.14em]">{{ channelMeta[ix.channel].label }}</span>
                  <span class="text-mute-2/60">·</span>
                  <span>{{ ix.direction === 'in' ? 'Inbound' : 'Outbound' }}</span>
                  <span class="text-mute-2/60">·</span>
                  <span>{{ ix.at }}</span>
                </div>
                <p class="mt-0.5 text-[13px] leading-snug text-ink">{{ ix.summary }}</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.bespoke-crm {
  /* Local scrollbar tweaks so the kanban scrollbar reads light on the brand. */
}
.bespoke-crm::-webkit-scrollbar,
.bespoke-crm *::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.bespoke-crm *::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.12);
  border-radius: 9999px;
}
.bespoke-crm *::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.22);
}

.artifact-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 9999px;
  background: rgba(1, 219, 241, 0.12);
  color: #00b8cc;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.01em;
  border: 1px solid rgba(1, 219, 241, 0.22);
}
.artifact-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.625rem 0.75rem;
}
.artifact-card-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #0a0f1a;
  margin-bottom: 2px;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
