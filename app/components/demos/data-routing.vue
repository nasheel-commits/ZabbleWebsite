<script setup lang="ts">
import { computed, onBeforeUnmount, ref, render, watch } from 'vue'
import { AlertTriangle, ArrowDown, ArrowRight, BookOpen, CheckCircle2, ClipboardList, Database, FileSpreadsheet, Filter, GitBranch, Heart, Landmark, Layers, Mail, Play, Power, RotateCcw, Scale, ShieldCheck, Sparkles, Users, Users2, Wifi, WifiOff } from '@lucide/vue'

type OutputId = 'board' | 'donor' | 'regulatory'

interface SourceDef {
  id: string
  label: string
  system: string
  icon: Component
  records: number
  /** Outputs that genuinely need this source. */
  criticalFor: OutputId[]
  /** What the pipeline falls back to when this source is offline. */
  fallback?: string
}

interface TransformDef {
  id: string
  label: string
  sub: string
  icon: Component
}

interface MetricDef {
  id: string
  label: string
  valueDisplay: string
  sources: string[]
  transforms: string[]
  formula: string
}

interface OutputDef {
  id: OutputId
  label: string
  short: string
  template: string
  icon: Component
  sources: string[]
  metrics: MetricDef[]
}

const SOURCES: SourceDef[] = [
  {
    id: 'accounting',
    label: 'Accounting',
    system: 'QuickBooks · GL',
    icon: BookOpen,
    records: 12_400,
    criticalFor: ['board', 'donor', 'regulatory'],
    fallback: 'Last quarter-close snapshot',
  },
  {
    id: 'payroll',
    label: 'Payroll',
    system: 'Workday',
    icon: Users,
    records: 87,
    criticalFor: ['board', 'regulatory'],
    fallback: "Previous month's payroll register",
  },
  {
    id: 'sales',
    label: 'Sales database',
    system: 'PostgreSQL',
    icon: Database,
    records: 1_840,
    criticalFor: ['board'],
    fallback: 'CRM-derived revenue total',
  },
  {
    id: 'crm',
    label: 'CRM',
    system: 'Salesforce',
    icon: Users2,
    records: 320,
    criticalFor: ['board', 'donor'],
    fallback: 'Last sync · 6 hours stale',
  },
  {
    id: 'grants',
    label: 'Grants system',
    system: 'Custom · NGO',
    icon: Heart,
    records: 38,
    criticalFor: ['donor'],
    fallback: 'Grant register · manual import',
  },
  {
    id: 'me',
    label: 'M&E platform',
    system: 'KoboToolbox',
    icon: ClipboardList,
    records: 12_840,
    criticalFor: ['donor'],
    fallback: 'Last quarter beneficiary count',
  },
  {
    id: 'loans',
    label: 'Loan book',
    system: 'Banking core',
    icon: Landmark,
    records: 2_400,
    criticalFor: ['regulatory'],
    fallback: 'End-of-day batch file',
  },
]

const TRANSFORMS: TransformDef[] = [
  { id: 'normalize', label: 'Normalize schemas', sub: 'Map source columns onto canonical fields',          icon: Filter },
  { id: 'join',      label: 'Join across systems', sub: 'Resolve customer / employee / grant entity keys', icon: GitBranch },
  { id: 'validate',  label: 'Validate',            sub: 'Tie-outs, subtotals, regulator-specific checks',  icon: ShieldCheck },
  { id: 'aggregate', label: 'Aggregate',           sub: 'Roll figures up to template line items',          icon: Layers },
  { id: 'render',    label: 'Render template',     sub: 'PDF · XBRL · spreadsheet',                        icon: FileSpreadsheet },
]

const OUTPUTS: Record<OutputId, OutputDef> = {
  board: {
    id: 'board',
    label: 'Monthly board pack',
    short: 'Board pack',
    template: 'May board pack · Q2 review',
    icon: BookOpen,
    sources: ['accounting', 'payroll', 'sales', 'crm'],
    metrics: [
      { id: 'rev-mtd',     label: 'Revenue MTD',      valueDisplay: '$1.24M',     sources: ['accounting', 'sales'],     transforms: ['normalize', 'join', 'validate', 'aggregate'], formula: 'Σ recognised revenue · May 1–31' },
      { id: 'op-margin',   label: 'Operating margin', valueDisplay: '18.4%',      sources: ['accounting', 'payroll'],   transforms: ['normalize', 'validate', 'aggregate'],         formula: '(Revenue − Operating costs) ÷ Revenue' },
      { id: 'headcount',   label: 'Headcount',        valueDisplay: '87',         sources: ['payroll'],                 transforms: ['normalize'],                                   formula: 'Active employees on cut-off date' },
      { id: 'pipeline',    label: 'Pipeline value',   valueDisplay: '$4.8M',      sources: ['crm'],                     transforms: ['normalize', 'validate', 'aggregate'],         formula: 'Σ (deal value × stage probability)' },
      { id: 'runway',      label: 'Cash runway',      valueDisplay: '7.2 months', sources: ['accounting', 'payroll'],   transforms: ['normalize', 'join', 'aggregate'],              formula: 'Cash ÷ Average monthly burn' },
      { id: 'nps',         label: 'Customer NPS',     valueDisplay: '62',         sources: ['crm'],                     transforms: ['normalize', 'aggregate'],                      formula: '% promoters − % detractors · trailing 30d' },
    ],
  },
  donor: {
    id: 'donor',
    label: 'Monthly donor report',
    short: 'Donor report',
    template: 'May donor report · grant cohort 2026',
    icon: Heart,
    sources: ['accounting', 'crm', 'grants', 'me'],
    metrics: [
      { id: 'beneficiaries',   label: 'Beneficiaries served', valueDisplay: '12,840',  sources: ['me'],                       transforms: ['normalize', 'aggregate'],                       formula: 'Count of unique beneficiary IDs · May' },
      { id: 'funds-disbursed', label: 'Funds disbursed',      valueDisplay: '$342K',   sources: ['accounting', 'grants'],     transforms: ['normalize', 'join', 'validate', 'aggregate'], formula: 'Σ outflows tagged to active grants' },
      { id: 'restricted-split', label: 'Restricted / unrestricted', valueDisplay: '64 / 36', sources: ['accounting', 'grants'], transforms: ['normalize', 'join', 'aggregate'],         formula: 'Restricted outflows ÷ Total outflows' },
      { id: 'cost-per-ben',    label: 'Cost per beneficiary', valueDisplay: '$26.63',  sources: ['accounting', 'me'],         transforms: ['normalize', 'join', 'aggregate'],              formula: 'Total programme cost ÷ Beneficiaries' },
      { id: 'donor-retention', label: 'Major-donor retention', valueDisplay: '91%',    sources: ['crm'],                       transforms: ['normalize', 'aggregate'],                      formula: 'Donors retained ÷ Donors at start of month' },
      { id: 'grant-compliance', label: 'Grant compliance',     valueDisplay: '100%',   sources: ['accounting', 'grants'],     transforms: ['normalize', 'validate'],                        formula: 'Restricted outflows passing donor-terms validation' },
    ],
  },
  regulatory: {
    id: 'regulatory',
    label: 'Regulatory submission',
    short: 'Regulatory',
    template: 'BA 900 · prudential return',
    icon: Scale,
    sources: ['accounting', 'payroll', 'loans'],
    metrics: [
      { id: 'car',         label: 'Capital adequacy ratio', valueDisplay: '14.6%',  sources: ['accounting', 'loans'], transforms: ['normalize', 'join', 'validate', 'aggregate'], formula: 'Eligible capital ÷ Risk-weighted assets' },
      { id: 'npl',         label: 'NPL ratio',             valueDisplay: '3.2%',   sources: ['loans'],                transforms: ['normalize', 'validate', 'aggregate'],          formula: 'Non-performing loans ÷ Gross loan book' },
      { id: 'tier-1',      label: 'Tier-1 capital',        valueDisplay: '$48.2M', sources: ['accounting'],          transforms: ['normalize', 'validate', 'aggregate'],          formula: 'Σ tier-1 capital instruments · cut-off date' },
      { id: 'liquidity',   label: 'Liquidity coverage',    valueDisplay: '142%',   sources: ['accounting', 'loans'], transforms: ['normalize', 'aggregate'],                       formula: 'HQLA ÷ 30-day net cash outflows' },
      { id: 'paye',        label: 'PAYE withheld',         valueDisplay: '$18,420', sources: ['payroll'],             transforms: ['normalize', 'validate'],                        formula: 'Σ employee PAYE · current period' },
      { id: 'coverage',    label: 'Period coverage',       valueDisplay: '100%',   sources: ['accounting', 'payroll', 'loans'], transforms: ['normalize', 'validate'],          formula: 'Days with complete data ÷ Reporting days' },
    ],
  },
}

// =============================================================================
// Reactive state
// =============================================================================

const view = ref<'pipeline' | 'before'>('pipeline')
const activeOutput = ref<OutputId>('board')
const offlineSources = ref<Set<string>>(new Set())
const selectedMetric = ref<string | null>(null)

/** Animation phase. 0 idle · 1 pulling · 2 transforming · 3 rendering · 4 done */
const runStep = ref<0 | 1 | 2 | 3 | 4>(0)
const runProgress = ref(0) // 0..1 within current phase, for counters
const isRunning = computed(() => runStep.value > 0 && runStep.value < 4)
const isDone = computed(() => runStep.value === 4)

let runTimers: ReturnType<typeof setTimeout>[] = []
let runFrame: ReturnType<typeof setInterval> | null = null

function clearRunTimers() {
  runTimers.forEach((t) => clearTimeout(t))
  runTimers = []
  if (runFrame) {
    clearInterval(runFrame)
    runFrame = null
  }
}

function resetRun() {
  clearRunTimers()
  runStep.value = 0
  runProgress.value = 0
  selectedMetric.value = null
}

function runPipeline() {
  if (isRunning.value) return
  clearRunTimers()
  selectedMetric.value = null
  runStep.value = 1
  runProgress.value = 0

  // Sub-phase progress ticker for counter animations.
  const phaseStart = { current: Date.now() }
  const phaseLength = 1100
  runFrame = setInterval(() => {
    const t = (Date.now() - phaseStart.current) / phaseLength
    runProgress.value = Math.min(1, Math.max(0, t))
  }, 30)

  const schedule = (delay: number, fn: () => void) => {
    runTimers.push(setTimeout(fn, delay))
  }

  schedule(phaseLength, () => {
    phaseStart.current = Date.now()
    runStep.value = 2
    runProgress.value = 0
  })
  schedule(phaseLength * 2, () => {
    phaseStart.current = Date.now()
    runStep.value = 3
    runProgress.value = 0
  })
  schedule(phaseLength * 3, () => {
    runStep.value = 4
    runProgress.value = 1
    if (runFrame) {
      clearInterval(runFrame)
      runFrame = null
    }
  })
}

onBeforeUnmount(() => {
  clearRunTimers()
})

// Whenever the user changes the output or toggles a source, reset the run.
watch([activeOutput, offlineSources], () => {
  resetRun()
}, { deep: true })

// =============================================================================
// Derived data
// =============================================================================

const activeOutputDef = computed(() => OUTPUTS[activeOutput.value])

/** Sources used by the active output, in canonical order. */
const activeSources = computed(() =>
  SOURCES.filter((s) => activeOutputDef.value.sources.includes(s.id)),
)

const offlineCriticalForOutput = computed(() =>
  activeSources.value.filter((s) => offlineSources.value.has(s.id)),
)

const hasDegraded = computed(() => offlineCriticalForOutput.value.length > 0)

/** Metrics that depend on at least one offline source. */
const impactedMetricIds = computed(() => {
  const offline = offlineSources.value
  return new Set(
    activeOutputDef.value.metrics
      .filter((m) => m.sources.some((s) => offline.has(s)))
      .map((m) => m.id),
  )
})

/** Counter for a single source row during pull phase. */
function sourcePullCount(source: SourceDef) {
  if (offlineSources.value.has(source.id)) return 0
  if (runStep.value === 0) return 0
  if (runStep.value === 1) {
    return Math.round(source.records * easeOut(runProgress.value))
  }
  return source.records
}

/** Transform sub-counter ("rows processed") during transform phase. */
function transformCount(transform: TransformDef) {
  // Total rows in flight = sum of active sources' records.
  const total = activeSources.value
    .filter((s) => !offlineSources.value.has(s.id))
    .reduce((acc, s) => acc + s.records, 0)
  if (runStep.value < 2) return 0
  if (runStep.value === 2) {
    // Stagger transforms — earlier ones finish first within the phase.
    const idx = TRANSFORMS.findIndex((t) => t.id === transform.id)
    const t0 = idx / TRANSFORMS.length
    const t1 = (idx + 1) / TRANSFORMS.length
    const local = clamp((runProgress.value - t0) / (t1 - t0), 0, 1)
    return Math.round(total * easeOut(local))
  }
  return total
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function fmtNumber(n: number) {
  return n.toLocaleString('en-US')
}

// =============================================================================
// Interaction handlers
// =============================================================================

function selectOutput(id: OutputId) {
  if (activeOutput.value === id) return
  activeOutput.value = id
}

function toggleOffline(id: string) {
  const next = new Set(offlineSources.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  offlineSources.value = next
}

function clickMetric(id: string) {
  if (!isDone.value) return
  selectedMetric.value = selectedMetric.value === id ? null : id
}

const selectedMetricDef = computed<MetricDef | null>(() => {
  if (!selectedMetric.value) return null
  return activeOutputDef.value.metrics.find((m) => m.id === selectedMetric.value) ?? null
})

/** Which transform IDs are in the lineage of the selected metric. */
const selectedLineageTransforms = computed<Set<string>>(() => {
  if (!selectedMetricDef.value) return new Set()
  return new Set(selectedMetricDef.value.transforms)
})

const selectedLineageSources = computed<Set<string>>(() => {
  if (!selectedMetricDef.value) return new Set()
  return new Set(selectedMetricDef.value.sources)
})

function isSourceLit(id: string) {
  if (selectedMetric.value) return selectedLineageSources.value.has(id)
  if (runStep.value >= 1) return true
  return false
}

function isTransformLit(id: string) {
  if (selectedMetric.value) return selectedLineageTransforms.value.has(id)
  if (runStep.value >= 2) {
    const idx = TRANSFORMS.findIndex((t) => t.id === id)
    if (runStep.value > 2) return true
    return runProgress.value * TRANSFORMS.length > idx
  }
  return false
}

// =============================================================================
// "Before" view — 3-day email chain
// =============================================================================

interface EmailEvent {
  from: string
  to: string
  day: 1 | 2 | 3
  time: string
  subject: string
  note?: string
  risk?: boolean
}

const beforePeople = [
  { id: 'finance', label: 'Finance Lead',       initials: 'FL', detail: 'Owns the pack' },
  { id: 'sales',   label: 'Sales Ops',          initials: 'SO', detail: 'Pulls CRM + sales DB' },
  { id: 'hr',      label: 'HR · Payroll',       initials: 'HR', detail: 'Pulls Workday register' },
  { id: 'acc',     label: 'Accountant',         initials: 'AC', detail: 'Owns GL & cost centres' },
]

const beforeEmails: EmailEvent[] = [
  { day: 1, time: '09:14', from: 'finance', to: 'sales', subject: 'Need May pipeline + revenue export' },
  { day: 1, time: '09:16', from: 'finance', to: 'hr',    subject: 'May payroll register (with cost-centre tags)' },
  { day: 1, time: '09:18', from: 'finance', to: 'acc',   subject: 'GL extract — please run with class X enabled' },
  { day: 1, time: '14:02', from: 'sales',   to: 'finance', subject: 'Re: pipeline — out tomorrow, OOO Wed' },
  { day: 1, time: '16:48', from: 'hr',      to: 'finance', subject: 'Payroll attached · headcount 86 (one TBC)', risk: true },
  { day: 2, time: '08:31', from: 'acc',     to: 'finance', subject: 'GL ready — but Mar revenue restated, headsup' },
  { day: 2, time: '10:11', from: 'finance', to: 'acc',     subject: 'Which revenue line goes against retained earnings?' },
  { day: 2, time: '11:55', from: 'finance', to: 'hr',      subject: 'Is it 86 or 87? Board will ask.' },
  { day: 2, time: '13:20', from: 'finance', to: 'sales',   subject: 'Pipeline weight method — using stage prob, OK?' },
  { day: 2, time: '17:02', from: 'finance', to: 'finance', subject: 'Margin doesn\'t tie · 12pts off · investigating', risk: true },
  { day: 3, time: '08:45', from: 'acc',     to: 'finance', subject: 'Found it — cost centre mis-tag on $84K invoice' },
  { day: 3, time: '10:30', from: 'sales',   to: 'finance', subject: 'Pipeline export attached — apologies for delay' },
  { day: 3, time: '12:14', from: 'finance', to: 'finance', subject: 'Final pack assembled · sending to CEO for review' },
  { day: 3, time: '15:50', from: 'finance', to: 'finance', subject: 'CEO: where did 18.4% come from? · reviewing', risk: true },
]

function personById(id: string) {
  return beforePeople.find((p) => p.id === id)
}

</script>

<template>
  <div class="bg-white text-ink">
    <!-- ============================ HEADER ============================ -->
    <header class="border-b border-line p-5 md:p-7">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Data Routing Pipeline
          </div>
          <h3 class="mt-3 font-display text-[24px] md:text-[28px] leading-[1.12] text-ink">
            One pipeline. Three outputs. No assembly.
          </h3>
          <p class="mt-2 max-w-xl text-[14.5px] leading-[1.55] text-mute">
            Pick an output, hit Run, watch the same source systems get composed into a board pack,
            a donor report, or a regulatory submission. Click any figure to trace its lineage back
            through every transform and source.
          </p>
        </div>

        <!-- View toggle: Pipeline vs Before -->
        <div
          role="tablist"
          aria-label="Demo view"
          class="inline-flex items-center self-start rounded-full border border-line bg-surface-alt/60 p-1"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="view === 'pipeline'"
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              view === 'pipeline'
                ? 'bg-white text-ink ring-1 ring-line shadow-[0_4px_12px_-8px_rgba(15,23,42,0.18)]'
                : 'text-mute-2 hover:text-ink',
            ]"
            @click="view = 'pipeline'"
          >
            <Sparkles :size="13" :stroke-width="2" aria-hidden="true" />
            Pipeline
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="view === 'before'"
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              view === 'before'
                ? 'bg-white text-ink ring-1 ring-line shadow-[0_4px_12px_-8px_rgba(15,23,42,0.18)]'
                : 'text-mute-2 hover:text-ink',
            ]"
            @click="view = 'before'"
          >
            <Mail :size="13" :stroke-width="2" aria-hidden="true" />
            Before · email chain
          </button>
        </div>
      </div>
    </header>

    <!-- ============================ PIPELINE VIEW ============================ -->
    <div v-if="view === 'pipeline'">
      <!-- Toolbar -->
      <div class="flex flex-col gap-3 border-b border-line bg-surface-alt/40 p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <!-- Output selector -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 md:overflow-visible md:pb-0">
          <span class="hidden md:inline-flex items-center gap-2 mr-2 text-[11.5px] uppercase tracking-[0.2em] text-mute-2 font-semibold">
            Output
          </span>
          <button
            v-for="o in Object.values(OUTPUTS)"
            :key="o.id"
            type="button"
            :aria-pressed="activeOutput === o.id"
            :class="[
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              activeOutput === o.id
                ? 'border-cyan-brand-deep/40 bg-cyan-brand/12 text-cyan-brand-deep'
                : 'border-line bg-white text-ink hover:border-cyan-brand/35',
            ]"
            @click="selectOutput(o.id)"
          >
            <component :is="o.icon" :size="13" :stroke-width="2" aria-hidden="true" />
            {{ o.short }}
          </button>
        </div>

        <!-- Run / Reset -->
        <div class="flex items-center gap-2">
          <button
            v-if="isDone || isRunning"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-mute transition-colors hover:border-ink/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            :disabled="isRunning"
            @click="resetRun"
          >
            <RotateCcw :size="13" :stroke-width="2" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            :disabled="isRunning"
            :class="[
              'group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              isRunning
                ? 'cursor-not-allowed bg-surface-alt text-mute-2 ring-1 ring-line'
                : 'bg-ink text-white hover:-translate-y-px hover:bg-ink-soft',
            ]"
            @click="runPipeline"
          >
            <Play
              v-if="!isRunning"
              :size="14"
              :stroke-width="2.2"
              aria-hidden="true"
              class="transition-transform group-hover:translate-x-0.5"
            />
            <span
              v-else
              class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"
              aria-hidden="true"
            />
            {{ isRunning ? 'Running…' : isDone ? 'Run again' : 'Run pipeline' }}
          </button>
        </div>
      </div>

      <!-- Status banner -->
      <div
        v-if="hasDegraded"
        class="border-b border-[#FEE2E2] bg-[#FEF2F2]/70 px-5 py-3 md:px-7"
        role="status"
      >
        <div class="flex items-start gap-2.5">
          <AlertTriangle :size="16" :stroke-width="2" class="mt-0.5 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <div class="flex-1 text-[13px] leading-snug text-ink">
            <span class="font-semibold">Degraded source · </span>
            <span class="text-mute">
              <template v-for="(s, i) in offlineCriticalForOutput" :key="s.id">
                <span class="font-semibold text-ink">{{ s.label }}</span>
                <span v-if="i < offlineCriticalForOutput.length - 1">, </span>
              </template>
              offline. Pipeline falls back to
              <template v-for="(s, i) in offlineCriticalForOutput" :key="s.id">
                <span class="italic text-ink">{{ s.fallback }}</span>
                <span v-if="i < offlineCriticalForOutput.length - 1">; </span>
              </template>
              and flags impacted figures for human review.
            </span>
          </div>
        </div>
      </div>

      <!-- Canvas: 3 columns -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.15fr]">
        <!-- ----------------- COLUMN 1: SOURCES ----------------- -->
        <section
          class="border-b border-line p-5 md:p-7 lg:border-b-0 lg:border-r"
          aria-label="Source systems"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
              <Database :size="13" :stroke-width="2" aria-hidden="true" />
              Source systems
            </div>
            <div class="text-[11.5px] text-mute-2 font-semibold">
              {{ activeSources.length }} feeds
            </div>
          </div>

          <ul class="mt-3 space-y-2">
            <li
              v-for="s in activeSources"
              :key="s.id"
              :class="[
                'group relative rounded-xl border bg-white p-3.5 transition-all',
                offlineSources.has(s.id)
                  ? 'border-[#FEE2E2] bg-[#FEF2F2]/40'
                  : isSourceLit(s.id)
                  ? 'border-cyan-brand/45 ring-1 ring-cyan-brand/15'
                  : 'border-line',
                selectedMetricDef && !selectedLineageSources.has(s.id) && !offlineSources.has(s.id)
                  ? 'opacity-45'
                  : '',
              ]"
            >
              <div class="flex items-start gap-3">
                <span
                  :class="[
                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors',
                    offlineSources.has(s.id)
                      ? 'bg-[#FEF2F2] text-[#DC2626] ring-[#FEE2E2]'
                      : isSourceLit(s.id)
                      ? 'bg-cyan-brand/12 text-cyan-brand-deep ring-cyan-brand/25'
                      : 'bg-surface-alt text-mute-2 ring-line',
                  ]"
                  aria-hidden="true"
                >
                  <component :is="s.icon" :size="17" :stroke-width="1.85" />
                </span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <div class="text-[14px] font-semibold leading-tight text-ink">
                      {{ s.label }}
                    </div>
                    <button
                      type="button"
                      :aria-pressed="offlineSources.has(s.id)"
                      :aria-label="`${offlineSources.has(s.id) ? 'Bring' : 'Knock'} ${s.label} ${offlineSources.has(s.id) ? 'online' : 'offline'}`"
                      :class="[
                        'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-1',
                        offlineSources.has(s.id)
                          ? 'bg-[#FEF2F2] text-[#DC2626] ring-[#FEE2E2] hover:bg-[#FEE2E2]'
                          : 'bg-white text-mute-2 ring-line hover:text-ink hover:ring-ink/25',
                      ]"
                      @click="toggleOffline(s.id)"
                    >
                      <component
                        :is="offlineSources.has(s.id) ? WifiOff : Wifi"
                        :size="12"
                        :stroke-width="2"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <div class="mt-0.5 text-[12px] text-mute">
                    {{ s.system }}
                  </div>
                  <div class="mt-1.5 flex items-center justify-between gap-2">
                    <code
                      :class="[
                        'rounded bg-surface-alt px-1.5 py-0.5 font-mono tabular-nums text-[11px] font-semibold transition-colors',
                        offlineSources.has(s.id) ? 'text-[#DC2626]' : 'text-ink-soft',
                      ]"
                    >
                      <template v-if="offlineSources.has(s.id)">offline</template>
                      <template v-else>{{ fmtNumber(sourcePullCount(s)) }} rows</template>
                    </code>
                    <span
                      v-if="!offlineSources.has(s.id) && runStep === 1"
                      class="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep"
                    >
                      <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-brand" aria-hidden="true" />
                      Pulling
                    </span>
                    <span
                      v-else-if="!offlineSources.has(s.id) && runStep >= 2"
                      class="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep"
                    >
                      <CheckCircle2 :size="11" :stroke-width="2.2" aria-hidden="true" />
                      Pulled
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <p class="mt-4 text-[11.5px] leading-snug text-mute-2">
            Knock a source offline with its <Wifi :size="11" :stroke-width="2" class="inline-block translate-y-px" aria-hidden="true" /> toggle.
            The pipeline degrades to a fallback for that source rather than producing a wrong number silently.
          </p>
        </section>

        <!-- ----------------- COLUMN 2: TRANSFORMS ----------------- -->
        <section
          class="border-b border-line bg-surface-alt/30 p-5 md:p-7 lg:border-b-0 lg:border-r"
          aria-label="Transforms"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
              <GitBranch :size="13" :stroke-width="2" aria-hidden="true" />
              Transforms
            </div>
            <div class="text-[11.5px] text-mute-2 font-semibold">
              {{ TRANSFORMS.length }} stages
            </div>
          </div>

          <ol class="mt-3 space-y-2">
            <li
              v-for="(t, i) in TRANSFORMS"
              :key="t.id"
              :class="[
                'relative rounded-xl border bg-white p-3.5 transition-all',
                isTransformLit(t.id)
                  ? 'border-cyan-brand/45 ring-1 ring-cyan-brand/15'
                  : 'border-line',
                selectedMetricDef && !selectedLineageTransforms.has(t.id)
                  ? 'opacity-45'
                  : '',
              ]"
            >
              <div class="flex items-start gap-3">
                <span
                  :class="[
                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors',
                    isTransformLit(t.id)
                      ? 'bg-cyan-brand/12 text-cyan-brand-deep ring-cyan-brand/25'
                      : 'bg-surface-alt text-mute-2 ring-line',
                  ]"
                  aria-hidden="true"
                >
                  <component :is="t.icon" :size="17" :stroke-width="1.85" />
                </span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[10.5px] font-mono font-semibold text-mute-2">{{ String(i + 1).padStart(2, '0') }}</span>
                    <div class="text-[14px] font-semibold leading-tight text-ink">
                      {{ t.label }}
                    </div>
                  </div>
                  <div class="mt-0.5 text-[12px] leading-snug text-mute">
                    {{ t.sub }}
                  </div>
                  <div class="mt-1.5 flex items-center justify-between gap-2">
                    <code
                      class="rounded bg-surface-alt px-1.5 py-0.5 font-mono tabular-nums text-[11px] font-semibold text-ink-soft"
                    >
                      <template v-if="runStep < 2">—</template>
                      <template v-else>{{ fmtNumber(transformCount(t)) }} rows</template>
                    </code>
                    <span
                      v-if="runStep === 2 && isTransformLit(t.id)"
                      class="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep"
                    >
                      <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-brand" aria-hidden="true" />
                      Running
                    </span>
                    <span
                      v-else-if="runStep > 2 && isTransformLit(t.id)"
                      class="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep"
                    >
                      <CheckCircle2 :size="11" :stroke-width="2.2" aria-hidden="true" />
                      Done
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ol>

          <!-- Validation summary chip — appears once validate has run -->
          <div
            v-if="runStep >= 3"
            class="mt-4 flex items-start gap-2 rounded-xl border border-line bg-white p-3"
          >
            <ShieldCheck :size="14" :stroke-width="2" class="mt-0.5 shrink-0 text-cyan-brand-deep" aria-hidden="true" />
            <div class="text-[12px] leading-snug text-mute">
              <span class="font-semibold text-ink">14,580 valid · 67 flagged</span> · validations
              run against the {{ activeOutputDef.short.toLowerCase() }} rule pack. Flagged rows land
              in a human-review queue; the pack still ships with a notice attached.
            </div>
          </div>
        </section>

        <!-- ----------------- COLUMN 3: OUTPUT ----------------- -->
        <section class="p-5 md:p-7" aria-label="Output">
          <div class="flex items-center justify-between gap-2">
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
              <component :is="activeOutputDef.icon" :size="13" :stroke-width="2" aria-hidden="true" />
              Output
            </div>
            <span
              :class="[
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold',
                isDone
                  ? 'border-cyan-brand-deep/30 bg-cyan-brand/12 text-cyan-brand-deep'
                  : 'border-line bg-surface-alt text-mute-2',
              ]"
            >
              <span
                :class="['h-1.5 w-1.5 rounded-full', isDone ? 'bg-cyan-brand' : 'bg-mute-2']"
                aria-hidden="true"
              />
              {{ isDone ? 'Rendered' : 'Awaiting run' }}
            </span>
          </div>

          <article
            :class="[
              'mt-3 overflow-hidden rounded-xl border bg-white transition-all',
              isDone ? 'border-cyan-brand/30 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.22)]' : 'border-line',
            ]"
          >
            <header class="border-b border-line bg-surface-alt/60 px-4 py-3">
              <div class="flex items-center justify-between gap-2">
                <div class="font-display text-[17px] leading-[1.15] text-ink">
                  {{ activeOutputDef.template }}
                </div>
                <component :is="activeOutputDef.icon" :size="16" :stroke-width="1.8" class="text-cyan-brand-deep" aria-hidden="true" />
              </div>
              <div class="mt-0.5 text-[11.5px] text-mute">
                Generated by pipeline · ref
                <code class="font-mono text-[11px] text-ink-soft">pl_{{ activeOutput }}_2026_05</code>
              </div>
            </header>

            <!-- Pre-run shimmer placeholder -->
            <div v-if="!isDone" class="px-4 py-5">
              <div class="space-y-2.5">
                <div
                  v-for="i in 5"
                  :key="i"
                  class="flex items-center justify-between gap-3"
                >
                  <div class="h-2.5 w-1/2 rounded-full bg-surface-alt" />
                  <div
                    :class="[
                      'h-2.5 w-16 rounded-full bg-surface-alt',
                      runStep === 3 ? 'animate-pulse' : '',
                    ]"
                  />
                </div>
              </div>
              <div class="mt-5 text-[12px] leading-snug text-mute-2">
                <template v-if="runStep === 0">
                  Press <span class="font-semibold text-ink">Run pipeline</span> to assemble the
                  {{ activeOutputDef.short.toLowerCase() }}.
                </template>
                <template v-else-if="runStep === 1">Pulling source data…</template>
                <template v-else-if="runStep === 2">Applying transforms…</template>
                <template v-else>Rendering template…</template>
              </div>
            </div>

            <!-- Rendered metrics -->
            <ul v-else class="divide-y divide-line">
              <li
                v-for="m in activeOutputDef.metrics"
                :key="m.id"
              >
                <button
                  type="button"
                  :aria-pressed="selectedMetric === m.id"
                  :class="[
                    'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-brand/60',
                    selectedMetric === m.id
                      ? 'bg-cyan-brand/[0.06]'
                      : 'hover:bg-surface-alt/60',
                  ]"
                  @click="clickMetric(m.id)"
                >
                  <div class="flex flex-1 items-center gap-2 min-w-0">
                    <span class="text-[13px] font-medium text-ink">{{ m.label }}</span>
                    <span
                      v-if="impactedMetricIds.has(m.id)"
                      class="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-1.5 py-0.5 text-[10px] font-semibold text-[#DC2626] ring-1 ring-[#FEE2E2]"
                    >
                      <AlertTriangle :size="9" :stroke-width="2.2" aria-hidden="true" />
                      Fallback used
                    </span>
                  </div>
                  <div
                    :class="[
                      'shrink-0 font-display tabular-nums text-[18px] leading-[1.1] transition-colors',
                      impactedMetricIds.has(m.id)
                        ? 'text-[#DC2626]'
                        : selectedMetric === m.id
                        ? 'text-cyan-brand-deep'
                        : 'text-ink',
                    ]"
                  >
                    {{ impactedMetricIds.has(m.id) ? '— · review' : m.valueDisplay }}
                  </div>
                </button>
              </li>
            </ul>

            <footer
              v-if="isDone"
              class="border-t border-line bg-surface-alt/40 px-4 py-2.5"
            >
              <p class="text-[11.5px] leading-snug text-mute-2">
                <span class="font-semibold text-ink">Click any figure</span>
                to unroll the lineage back through every transform and source.
              </p>
            </footer>
          </article>
        </section>
      </div>

      <!-- ============================ LINEAGE PANEL ============================ -->
      <div
        v-if="selectedMetricDef"
        class="border-t border-line bg-cyan-brand/[0.04] p-5 md:p-7"
        role="region"
        aria-label="Lineage"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div class="flex-1">
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <span class="dot" />
              Lineage
            </div>
            <div class="mt-2 font-display text-[20px] leading-[1.15] text-ink">
              {{ selectedMetricDef.label }}
              <span class="text-cyan-brand-deep">·</span>
              <span class="tabular-nums">{{ selectedMetricDef.valueDisplay }}</span>
            </div>
            <p class="mt-1.5 text-[13px] leading-snug text-mute">
              <code class="rounded bg-white px-1.5 py-0.5 font-mono text-[11.5px] text-ink-soft ring-1 ring-line">
                {{ selectedMetricDef.formula }}
              </code>
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 self-start rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-mute transition-colors hover:border-ink/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            @click="selectedMetric = null"
          >
            Close lineage
          </button>
        </div>

        <!-- Lineage chain visualisation: sources → transforms → metric -->
        <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1.2fr_auto_1fr] md:items-center">
          <!-- Sources -->
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              Sources
            </div>
            <ul class="mt-2 flex flex-wrap gap-1.5">
              <li
                v-for="sid in selectedMetricDef.sources"
                :key="sid"
              >
                <span class="inline-flex items-center gap-1.5 rounded-full border border-cyan-brand/30 bg-white px-2.5 py-1 text-[12px] font-semibold text-ink">
                  <component
                    :is="SOURCES.find((s) => s.id === sid)?.icon"
                    :size="12"
                    :stroke-width="2"
                    class="text-cyan-brand-deep"
                    aria-hidden="true"
                  />
                  {{ SOURCES.find((s) => s.id === sid)?.label }}
                </span>
              </li>
            </ul>
          </div>
          <ArrowRight :size="18" :stroke-width="1.8" class="hidden md:block text-mute-2 justify-self-center" aria-hidden="true" />
          <ArrowDown :size="18" :stroke-width="1.8" class="md:hidden text-mute-2 justify-self-center" aria-hidden="true" />

          <!-- Transforms -->
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              Transforms
            </div>
            <ol class="mt-2 flex flex-wrap items-center gap-1.5">
              <template
                v-for="(tid, i) in selectedMetricDef.transforms"
                :key="tid"
              >
                <li>
                  <span class="inline-flex items-center gap-1.5 rounded-full border border-cyan-brand/30 bg-white px-2.5 py-1 text-[12px] font-semibold text-ink">
                    <component
                      :is="TRANSFORMS.find((t) => t.id === tid)?.icon"
                      :size="12"
                      :stroke-width="2"
                      class="text-cyan-brand-deep"
                      aria-hidden="true"
                    />
                    {{ TRANSFORMS.find((t) => t.id === tid)?.label }}
                  </span>
                </li>
                <li
                  v-if="i < selectedMetricDef.transforms.length - 1"
                  class="text-mute-2"
                  aria-hidden="true"
                >
                  →
                </li>
              </template>
            </ol>
          </div>
          <ArrowRight :size="18" :stroke-width="1.8" class="hidden md:block text-mute-2 justify-self-center" aria-hidden="true" />
          <ArrowDown :size="18" :stroke-width="1.8" class="md:hidden text-mute-2 justify-self-center" aria-hidden="true" />

          <!-- Metric -->
          <div>
            <div class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              Figure
            </div>
            <div class="mt-2 inline-flex items-center gap-2 rounded-xl border border-cyan-brand/30 bg-white px-3 py-2">
              <component :is="activeOutputDef.icon" :size="14" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
              <span class="text-[13px] font-semibold text-ink">{{ selectedMetricDef.label }}</span>
              <span class="font-display tabular-nums text-[18px] leading-[1.1] text-cyan-brand-deep">
                {{ selectedMetricDef.valueDisplay }}
              </span>
            </div>
          </div>
        </div>

        <p class="mt-4 text-[12.5px] leading-snug text-mute-2">
          Every figure carries its full chain of evidence — when an auditor asks
          <span class="italic">"where did this come from?"</span> the answer is the click you just made.
        </p>
      </div>
    </div>

    <!-- ============================ BEFORE VIEW ============================ -->
    <div v-else class="p-5 md:p-7">
      <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-[#DC2626] font-semibold">
            <span class="h-1.5 w-1.5 rounded-full bg-[#DC2626]" aria-hidden="true" />
            Before · without the pipeline
          </div>
          <h4 class="mt-2 font-display text-[22px] leading-[1.15] text-ink">
            Same numbers · four people · three days · email.
          </h4>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-alt/60 px-2.5 py-1 text-[11.5px] font-semibold text-ink">
            <Mail :size="11" :stroke-width="2" class="text-mute-2" aria-hidden="true" />
            {{ beforeEmails.length }} emails
          </div>
          <div class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-alt/60 px-2.5 py-1 text-[11.5px] font-semibold text-ink">
            <AlertTriangle :size="11" :stroke-width="2" class="text-[#DC2626]" aria-hidden="true" />
            {{ beforeEmails.filter((e) => e.risk).length }} disputes
          </div>
        </div>
      </div>

      <!-- Stick-figure org chart -->
      <div class="mt-5 rounded-xl border border-line bg-white p-4 md:p-5">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            v-for="p in beforePeople"
            :key="p.id"
            class="flex flex-col items-center gap-2 rounded-lg border border-line bg-surface-alt/40 p-3 text-center"
          >
            <span
              class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-line"
              aria-hidden="true"
            >
              <svg viewBox="0 0 32 32" fill="none" class="h-7 w-7 text-ink-soft" stroke="currentColor" stroke-width="1.6">
                <!-- head -->
                <circle cx="16" cy="10" r="4" />
                <!-- body -->
                <path d="M16 14 v8" stroke-linecap="round" />
                <!-- arms -->
                <path d="M9 18 h14" stroke-linecap="round" />
                <!-- legs -->
                <path d="M16 22 l-5 7 M16 22 l5 7" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <div class="text-[12.5px] font-semibold leading-tight text-ink">{{ p.label }}</div>
              <div class="mt-0.5 text-[11px] leading-snug text-mute-2">{{ p.detail }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3-day email timeline -->
      <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <div
          v-for="day in [1, 2, 3]"
          :key="day"
          class="rounded-xl border border-line bg-white"
        >
          <header class="flex items-center justify-between gap-2 border-b border-line bg-surface-alt/50 px-3.5 py-2">
            <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              <span class="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white ring-1 ring-line text-[10px] font-mono text-ink">
                {{ day }}
              </span>
              Day {{ day }}
            </div>
            <span class="text-[11px] text-mute-2">
              {{ beforeEmails.filter((e) => e.day === day).length }} emails
            </span>
          </header>
          <ol class="divide-y divide-line">
            <li
              v-for="(e, i) in beforeEmails.filter((ev) => ev.day === day)"
              :key="day + '-' + i"
              :class="[
                'flex items-start gap-2.5 px-3.5 py-2.5',
                e.risk ? 'bg-[#FEF2F2]/40' : '',
              ]"
            >
              <div class="flex items-center gap-1 shrink-0 pt-0.5">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-alt text-[10px] font-mono font-semibold text-ink-soft ring-1 ring-line">
                  {{ personById(e.from)?.initials }}
                </span>
                <ArrowRight :size="12" :stroke-width="2" class="text-mute-2" aria-hidden="true" />
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-alt text-[10px] font-mono font-semibold text-ink-soft ring-1 ring-line">
                  {{ personById(e.to)?.initials }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[10.5px] text-mute-2">{{ e.time }}</span>
                  <AlertTriangle
                    v-if="e.risk"
                    :size="11"
                    :stroke-width="2.2"
                    class="text-[#DC2626]"
                    aria-hidden="true"
                  />
                </div>
                <div class="mt-0.5 text-[12.5px] leading-snug text-ink">
                  {{ e.subject }}
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <!-- Bottom summary -->
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-lg border border-line bg-surface-alt/60 p-3 text-center">
          <div class="font-display text-[24px] leading-[1.05] text-ink">3 days</div>
          <div class="mt-0.5 text-[10.5px] uppercase tracking-[0.16em] font-semibold text-mute-2">Time to pack</div>
        </div>
        <div class="rounded-lg border border-line bg-surface-alt/60 p-3 text-center">
          <div class="font-display text-[24px] leading-[1.05] text-ink">4 people</div>
          <div class="mt-0.5 text-[10.5px] uppercase tracking-[0.16em] font-semibold text-mute-2">Assembling</div>
        </div>
        <div class="rounded-lg border border-line bg-surface-alt/60 p-3 text-center">
          <div class="font-display text-[24px] leading-[1.05] text-ink">14</div>
          <div class="mt-0.5 text-[10.5px] uppercase tracking-[0.16em] font-semibold text-mute-2">Email round-trips</div>
        </div>
        <div class="rounded-lg border border-line bg-surface-alt/60 p-3 text-center">
          <div class="font-display text-[24px] leading-[1.05] text-[#DC2626]">3</div>
          <div class="mt-0.5 text-[10.5px] uppercase tracking-[0.16em] font-semibold text-mute-2">Disputed numbers</div>
        </div>
      </div>

      <div class="mt-4 flex items-start gap-2.5 rounded-xl border border-cyan-brand/20 bg-cyan-brand/[0.04] p-4">
        <Power :size="16" :stroke-width="2" class="mt-0.5 shrink-0 text-cyan-brand-deep" aria-hidden="true" />
        <div class="text-[13px] leading-snug text-mute">
          <span class="font-semibold text-ink">The systems don't change.</span>
          The same accounting tool, the same payroll register, the same CRM. What changes is the
          friction of getting them to produce one clean output. Switch back to the
          <button
            type="button"
            class="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded font-semibold text-ink"
            @click="view = 'pipeline'"
          >
            Pipeline view
          </button>
          and watch the same pack assemble in one click.
        </div>
      </div>
    </div>
  </div>
</template>
