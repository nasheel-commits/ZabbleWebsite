<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { Activity, ArrowRight, ChevronDown, Cog, Cpu, FastForward, FileText, Gauge, Landmark, Play, RotateCcw, Search, ShieldAlert, SlidersHorizontal, Snowflake, Thermometer, TrendingUp, Users, Vibrate, Wind, X, Zap } from '@lucide/vue'

type SourceKey = 'bank' | 'crm' | 'sensors'
type SensorKey = 'gearbox' | 'motor' | 'refrigeration' | 'hvac'
type FlagType = 'fraud' | 'drift' | 'vibration' | 'threshold'

interface FeedEvent {
  id: number
  ts: string
  line: string
  meta: string
  flag: FlagType | null
  caseId: string
}

interface FlagMeta {
  label: string
  icon: typeof ShieldAlert
}

interface SourceMeta {
  key: SourceKey
  label: string
  short: string
  icon: typeof Landmark
  rate: string
}

interface SensorMeta {
  key: SensorKey
  label: string
  icon: typeof Cog
}

interface EventTemplate {
  line: string
  meta: string
  trueFlag: FlagType | null
  fpFlag?: FlagType
  fpLine?: string
  fpMeta?: string
}

interface FlagPayload {
  rule: string
  history: string[]
  action: string
  audit: string
}

// ---------------------------------------------------------------------------
// Static metadata
// ---------------------------------------------------------------------------

const SOURCES: SourceMeta[] = [
  { key: 'bank',    label: 'Bank transactions', short: 'Bank',    icon: Landmark, rate: '~840 events/min' },
  { key: 'crm',     label: 'CRM data drift',    short: 'CRM',     icon: Users,    rate: '~120 events/min' },
  { key: 'sensors', label: 'Industrial sensors',short: 'Sensors', icon: Cpu,      rate: '~2,400 events/min' },
]

const SENSORS: SensorMeta[] = [
  { key: 'gearbox',       label: 'Gearbox',       icon: Cog },
  { key: 'motor',         label: 'Motor',         icon: Zap },
  { key: 'refrigeration', label: 'Refrigeration', icon: Snowflake },
  { key: 'hvac',          label: 'HVAC',          icon: Wind },
]

const FLAGS: Record<FlagType, FlagMeta> = {
  fraud:     { label: 'Fraud signal',      icon: ShieldAlert },
  drift:     { label: 'Data drift',        icon: Activity },
  vibration: { label: 'Vibration spike',   icon: Vibrate },
  threshold: { label: 'Threshold breach',  icon: Thermometer },
}

// ---------------------------------------------------------------------------
// Event templates, designed so each source feeds a recognisable pattern.
// `trueFlag` means the event was generated as a real anomaly; if non-null
// it surfaces whenever sensitivity is above ~25.
// `fpFlag` / `fpLine` / `fpMeta` describe how a normal-looking event would
// be re-styled if sensitivity is cranked high enough to trip a false positive.
// ---------------------------------------------------------------------------

const BANK_NORMAL: EventTemplate[] = [
  { line: 'Card-present · $42.10', meta: 'Brooklyn · coffee', trueFlag: null, fpFlag: 'fraud', fpLine: 'Card-present · $42.10', fpMeta: 'Brooklyn · merchant pattern unusual for cardholder' },
  { line: 'Card-not-present · $128.40', meta: 'Online retail · DE', trueFlag: null, fpFlag: 'fraud', fpLine: 'Card-not-present · $128.40', fpMeta: 'Online retail · IP geolocates 220km from billing' },
  { line: 'ATM withdrawal · $200', meta: 'Manhattan · 11:42', trueFlag: null },
  { line: 'Recurring · $14.99', meta: 'Streaming · monthly', trueFlag: null },
  { line: 'Wire · $4,200', meta: 'Chase → BoA · same beneficiary', trueFlag: null, fpFlag: 'fraud', fpLine: 'Wire · $4,200', fpMeta: 'Beneficiary first seen 6 days ago' },
  { line: 'POS · $63.55', meta: 'Grocery · weekly cadence', trueFlag: null },
  { line: 'Card-present · $9.20', meta: 'Transit · NYC subway', trueFlag: null },
  { line: 'Online · $89.00', meta: 'Hotel booking · 1 week out', trueFlag: null },
  { line: 'Card-not-present · $312.00', meta: 'SaaS subscription · annual', trueFlag: null },
  { line: 'P2P · $40.00', meta: 'Splitwise reimbursement', trueFlag: null },
]

const BANK_ANOMALIES: EventTemplate[] = [
  { line: 'Geo-velocity · card seen 11min apart', meta: 'Tokyo → Berlin · physically impossible', trueFlag: 'fraud' },
  { line: '9 declines in 4min', meta: 'same card · 7 merchants · card-testing pattern', trueFlag: 'fraud' },
  { line: '$9,800 withdrawal · 03:14 local', meta: 'Lagos NG · cardholder home country US', trueFlag: 'fraud' },
  { line: 'Card-not-present spree · 21 txns', meta: '6 minutes · merchants in 4 categories', trueFlag: 'fraud' },
  { line: 'Merchant category never seen · $2,400', meta: 'Jewelry · cardholder 7-yr history → none', trueFlag: 'fraud' },
  { line: 'Wire $48,200 to new beneficiary', meta: 'account opened 2 days ago · structuring shape', trueFlag: 'fraud' },
  { line: 'BIN-attack signature · 14 BINs in 90s', meta: 'all $1.01 auths · same IP /24', trueFlag: 'fraud' },
  { line: 'Withdrawal $3,000 above limit', meta: 'override attempted 4 times', trueFlag: 'threshold' },
]

const CRM_NORMAL: EventTemplate[] = [
  { line: 'Stage advance · Discovery → Demo', meta: 'deal #8721 · AE_03', trueFlag: null },
  { line: 'Lead enrich · firmographic match 92%', meta: 'auto-fill · industry, size, geo', trueFlag: null, fpFlag: 'drift', fpLine: 'Lead enrich · firmographic match 92%', fpMeta: 'enrichment confidence drifting · 4-day rolling −7pt' },
  { line: 'Activity logged · Call · 14min', meta: 'acct #4412 · outbound', trueFlag: null },
  { line: 'Field update · industry → Healthcare', meta: 'deal #8801 · manual', trueFlag: null },
  { line: 'Owner reassign · AE_03 → AE_05', meta: 'territory rebalance', trueFlag: null },
  { line: 'Quote sent · $84,000', meta: 'deal #7912 · 18mo term', trueFlag: null },
  { line: 'Email opened · 4th touch', meta: 'sequence · enterprise-nudge', trueFlag: null },
  { line: 'Demo booked', meta: 'deal #8841 · Thursday 14:30', trueFlag: null },
  { line: 'Pipeline event · meeting completed', meta: 'next step: proposal', trueFlag: null, fpFlag: 'drift', fpLine: 'Pipeline event · meeting completed', fpMeta: 'meeting-to-proposal lag widening · +21% vs baseline' },
  { line: 'Lifecycle stage · MQL → SQL', meta: 'deal #8902', trueFlag: null },
]

const CRM_ANOMALIES: EventTemplate[] = [
  { line: 'Field `industry` null on 38% of new leads', meta: 'rolling 1h · baseline 4% · pipeline source 3', trueFlag: 'drift' },
  { line: 'Lead source mix · paid 64%', meta: 'baseline 31% · last 4h', trueFlag: 'drift' },
  { line: 'Avg deal size −2.4σ in EU region', meta: 'last 4h · 124 deals affected', trueFlag: 'drift' },
  { line: 'Stage durations widening · Demo→Proposal +47%', meta: '7-day rolling · 38 deals', trueFlag: 'drift' },
  { line: 'Inbound webform schema changed · phone missing', meta: '12 of 14 last submissions · upstream change', trueFlag: 'drift' },
  { line: 'Dedupe rate −62%', meta: 'something upstream stopped normalising emails', trueFlag: 'drift' },
  { line: 'Pipeline value swung −$1.2M in 8min', meta: 'bulk close-lost on 47 deals · single user', trueFlag: 'threshold' },
]

const SENSOR_NORMAL: Record<SensorKey, EventTemplate[]> = {
  gearbox: [
    { line: 'Bearing temp 64°C', meta: 'RMS 1.2 mm/s · within band', trueFlag: null },
    { line: 'Shaft speed 1,450 rpm', meta: 'stable · load 68% nominal', trueFlag: null },
    { line: 'Oil temp 72°C', meta: 'cooling loop nominal', trueFlag: null },
    { line: 'Vibration baseline', meta: 'RMS 1.4 mm/s · ISO class A', trueFlag: null, fpFlag: 'vibration', fpLine: 'Vibration baseline drifting', fpMeta: 'RMS 1.8 mm/s · trending up 6h, still in band' },
  ],
  motor: [
    { line: 'Phase current 18.3A', meta: 'balanced · pf 0.92', trueFlag: null },
    { line: 'Winding temp 78°C', meta: 'class-F · headroom 77°C', trueFlag: null },
    { line: 'Speed 2,910 rpm', meta: 'load 71% · stable', trueFlag: null },
    { line: 'Inrush 4.2× nominal', meta: 'start cycle complete', trueFlag: null, fpFlag: 'threshold', fpLine: 'Inrush 4.2× nominal', fpMeta: 'this restart is the 6th in 90min · cycle pattern unusual' },
  ],
  refrigeration: [
    { line: 'Compartment 4 · -18.2°C', meta: 'setpoint -18 · stable', trueFlag: null },
    { line: 'Condenser fan 1,430 rpm', meta: 'discharge 42°C · nominal', trueFlag: null },
    { line: 'Defrost cycle complete', meta: 'compartment 2 · 3 min hold', trueFlag: null },
    { line: 'Compressor draw 8.6A', meta: 'duty cycle 52% · within band', trueFlag: null, fpFlag: 'threshold', fpLine: 'Compressor draw 8.6A', fpMeta: 'duty cycle climbing · 52 → 64% over 2h' },
  ],
  hvac: [
    { line: 'AHU-3 · 12.4 kW', meta: 'return air 22.4°C · stable', trueFlag: null },
    { line: 'Supply fan 4,820 rpm', meta: 'static pressure 250 Pa', trueFlag: null },
    { line: 'CO₂ 612 ppm · zone B', meta: 'ventilation nominal', trueFlag: null },
    { line: 'Filter ΔP 180 Pa', meta: '36% of replace threshold', trueFlag: null, fpFlag: 'threshold', fpLine: 'Filter ΔP 180 Pa', fpMeta: 'pressure-drop slope steepening · projected replace in 4d', },
  ],
}

const SENSOR_ANOMALIES: Record<SensorKey, EventTemplate[]> = {
  gearbox: [
    { line: 'Bearing temp 84°C · RMS 7.8 mm/s', meta: '3× baseline · stage-2 pinion · sideband at 2.3×', trueFlag: 'vibration' },
    { line: 'Harmonic energy +18 dB', meta: 'tooth-mesh frequency · 47 days since last service', trueFlag: 'vibration' },
    { line: 'Oil temp 98°C', meta: 'trip threshold 95°C · 4-min sustained', trueFlag: 'threshold' },
    { line: 'Vibration RMS 12.4 mm/s', meta: 'ISO 10816 zone D · alarm', trueFlag: 'threshold' },
  ],
  motor: [
    { line: 'Phase B 28A · Phase A 19A', meta: 'imbalance 32% · winding flag', trueFlag: 'vibration' },
    { line: 'Winding temp 142°C', meta: 'class-F limit 155°C · 8-min ramp', trueFlag: 'threshold' },
    { line: 'Inrush 6× nominal at start 03:14', meta: '4 prior restarts · soft-start suspect', trueFlag: 'vibration' },
    { line: 'Stator slot harmonics elevated', meta: 'broken-rotor-bar signature · score 0.83', trueFlag: 'vibration' },
  ],
  refrigeration: [
    { line: 'Compartment 4 · -8.4°C', meta: '9 min above -10°C · setpoint -18°C · door cycle normal', trueFlag: 'threshold' },
    { line: 'Compressor draw 14.2A', meta: 'baseline 8.6A · suction pressure 12% low', trueFlag: 'threshold' },
    { line: 'Defrost cycle failed to complete', meta: 'compartment 2 · 11-min timeout', trueFlag: 'threshold' },
    { line: 'Refrigerant leak signature', meta: 'evap-superheat trending +4.2°C in 6h', trueFlag: 'vibration' },
  ],
  hvac: [
    { line: 'AHU-3 fan vibration 9.1 mm/s', meta: 'alarm threshold 7.1 · bearing wear suspect', trueFlag: 'vibration' },
    { line: 'Filter ΔP 380 Pa', meta: 'replace threshold · pressure drop 38%', trueFlag: 'threshold' },
    { line: 'Power draw +38%', meta: 'AHU-3 · airflow drop · coil fouling suspect', trueFlag: 'threshold' },
    { line: 'Belt slip detected', meta: 'fan rpm vs commanded 12% low · 4-min sustained', trueFlag: 'vibration' },
  ],
}

// ---------------------------------------------------------------------------
// Flag payload, what the expanded view shows when a flag is clicked.
// ---------------------------------------------------------------------------

const FLAG_PAYLOAD: Record<FlagType, FlagPayload> = {
  fraud: {
    rule: 'Geo-velocity model · score 0.92 (threshold 0.70) · ensemble of 4 weak learners',
    history: [
      'card 4412 · 14 days clean · last decline 2 days ago, similar merchant cluster',
      '6-month average txn $46 · this one 200× cardholder norm',
      'IP 41.x.x.x first seen 8 minutes before this auth',
    ],
    action: 'Hold card · push notification to cardholder · escalate to fraud queue · 1-tap reverse if benign',
    audit: 'Case #FR-2026-0531 · written to fraud-audit/2026-05.parquet · signer chain verified',
  },
  drift: {
    rule: 'Population stability index PSI 0.34 (threshold 0.20) · sliding 1h vs trailing 7d',
    history: [
      'field stable for 18 days · drift began 03:42 from pipeline source 3',
      'similar drift seen during last vendor migration · 14 days ago',
      'downstream lead-scoring model trained on prior distribution',
    ],
    action: 'Pause downstream scoring · notify data steward · roll back source 3 to last good schema',
    audit: 'Case #DR-2026-1124 · written to crm-drift/2026-05.parquet · linked to data-contract v2.3',
  },
  vibration: {
    rule: 'RMS 3.1× rolling 7-day baseline (threshold 2.0×) · sideband energy +18 dB at 2.3× fr',
    history: [
      'asset GB-04 · last service 47 days ago · service interval 60 days',
      'trending up 6h · slope consistent with developing bearing fault',
      '2 prior similar signatures resolved by bearing replacement',
    ],
    action: 'Schedule inspection · derate to 70% load · notify supervisor · pre-stage replacement bearing',
    audit: 'Case #VS-2026-0044 · written to assets-audit/2026-05.parquet · CMMS work order #WO-7821',
  },
  threshold: {
    rule: 'Setpoint exceeded for longer than configured grace · value × duration both gating',
    history: [
      'asset/compartment has 6 prior excursions in 90 days',
      'last excursion resolved by compressor service · 3 weeks ago',
      'ambient room temp +2.4°C above baseline today',
    ],
    action: 'Open work order · notify duty manager · log running temperature on case · 30-min recheck',
    audit: 'Case #TB-2026-0312 · written to facilities-audit/2026-05.parquet · linked to work order',
  },
}

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

const source = ref<SourceKey>('bank')
const sensorSub = ref<SensorKey>('gearbox')
const sensitivity = ref<number>(55)
const events = shallowRef<FeedEvent[]>([])
const expandedId = ref<number | null>(null)

const replayState = ref<'idle' | 'running' | 'done'>('idle')
const replayProgress = ref(0) // 0..100
const replayCounts = ref({
  processed: 0,
  flagged: 0,
  caught: 0,
  humanCaught: 0,
})

let nextId = 1
let tickHandle: ReturnType<typeof setInterval> | null = null
let replayHandle: ReturnType<typeof setInterval> | null = null
const TICK_MS = 360
const FEED_MAX = 18

// ---------------------------------------------------------------------------
// Derived metrics, trade-off readouts
// ---------------------------------------------------------------------------

function flagsPerMinAt(sens: number): number {
  // Saturation-shaped curve: low at 0, ramps then levels.
  const x = Math.max(0, Math.min(100, sens)) / 100
  return Math.round((2 + 18 * Math.pow(x, 1.8)) * 10) / 10
}

function fpPercentAt(sens: number): number {
  // Convex curve: stays small until ~60, then climbs.
  const x = Math.max(0, Math.min(100, sens)) / 100
  return Math.round((0.4 + 28 * Math.pow(x, 2.3)) * 10) / 10
}

function coverageAt(sens: number): number {
  // 0..100, share of true anomalies actually surfaced.
  const x = Math.max(0, Math.min(100, sens)) / 100
  // Saturating: 0 at 0, ~94 at 50, ~99 at 80
  return Math.round(100 * (1 - Math.exp(-4.1 * x)))
}

const flagsPerMin = computed(() => flagsPerMinAt(sensitivity.value))
const fpPercent = computed(() => fpPercentAt(sensitivity.value))
const coverage = computed(() => coverageAt(sensitivity.value))

// ---------------------------------------------------------------------------
// Source helpers
// ---------------------------------------------------------------------------

const sourceMeta = computed(() => SOURCES.find((s) => s.key === source.value)!)
const showSensorSubs = computed(() => source.value === 'sensors')

function templatesForCurrentSource(): { normals: EventTemplate[]; anomalies: EventTemplate[] } {
  if (source.value === 'bank')   return { normals: BANK_NORMAL,            anomalies: BANK_ANOMALIES }
  if (source.value === 'crm')    return { normals: CRM_NORMAL,             anomalies: CRM_ANOMALIES }
  return                          { normals: SENSOR_NORMAL[sensorSub.value], anomalies: SENSOR_ANOMALIES[sensorSub.value] }
}

// ---------------------------------------------------------------------------
// Event generation
// ---------------------------------------------------------------------------

function timestamp(): string {
  const d = new Date()
  return d.toLocaleTimeString('en-GB', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

function caseIdFor(flag: FlagType | null): string {
  if (!flag) return ''
  const prefix = flag === 'fraud' ? 'FR' : flag === 'drift' ? 'DR' : flag === 'vibration' ? 'VS' : 'TB'
  const n = String(Math.floor(1000 + Math.random() * 9000))
  return `${prefix}-2026-${n}`
}

function pickEvent(): FeedEvent {
  const { normals, anomalies } = templatesForCurrentSource()
  const sens = sensitivity.value
  // ~6% of generated events are designed anomalies, always flagged at sens>=30.
  const isDesignedAnomaly = Math.random() < 0.065
  const sensFiresAnomalies = sens >= 25
  const fpProbability = Math.max(0, (sens - 55) / 50) * 0.32 // up to ~32% of normals at sens=100

  let tmpl: EventTemplate
  let flag: FlagType | null = null
  let line = ''
  let meta = ''

  if (isDesignedAnomaly && sensFiresAnomalies) {
    tmpl = anomalies[Math.floor(Math.random() * anomalies.length)]!
    line = tmpl.line
    meta = tmpl.meta
    flag = tmpl.trueFlag
  } else {
    tmpl = normals[Math.floor(Math.random() * normals.length)]!
    line = tmpl.line
    meta = tmpl.meta
    if (tmpl.fpFlag && Math.random() < fpProbability) {
      flag = tmpl.fpFlag
      if (tmpl.fpLine) line = tmpl.fpLine
      if (tmpl.fpMeta) meta = tmpl.fpMeta
    }
  }

  return {
    id: nextId++,
    ts: timestamp(),
    line,
    meta,
    flag,
    caseId: caseIdFor(flag),
  }
}

function tick() {
  if (replayState.value === 'running') return
  const next = pickEvent()
  const list = events.value.slice(0, FEED_MAX - 1)
  list.unshift(next)
  events.value = list
}

function startStream() {
  if (tickHandle) clearInterval(tickHandle)
  tickHandle = setInterval(tick, TICK_MS)
}

function stopStream() {
  if (tickHandle) {
    clearInterval(tickHandle)
    tickHandle = null
  }
}

function resetFeed() {
  events.value = []
  expandedId.value = null
}

// Reset feed when the source/sub changes so the user can read a clean stream.
watch([source, sensorSub], () => {
  resetFeed()
})

onMounted(() => {
  // Seed a few events so the feed isn't empty on first paint.
  for (let i = 0; i < 6; i++) {
    const e = pickEvent()
    events.value = [e, ...events.value]
  }
  startStream()
})

onBeforeUnmount(() => {
  stopStream()
  if (replayHandle) clearInterval(replayHandle)
})

// ---------------------------------------------------------------------------
// Expand / collapse a flagged event
// ---------------------------------------------------------------------------

function toggleExpand(ev: FeedEvent) {
  if (!ev.flag) return
  expandedId.value = expandedId.value === ev.id ? null : ev.id
}

// ---------------------------------------------------------------------------
// Replay last week
// ---------------------------------------------------------------------------

function startReplay() {
  if (replayState.value === 'running') return
  replayState.value = 'running'
  replayProgress.value = 0
  replayCounts.value = { processed: 0, flagged: 0, caught: 0, humanCaught: 0 }
  stopStream()

  // Source-specific weekly volume, anchors the headline number.
  const totals = {
    bank:    { processed: 5_643_120, flagged: 3140, caught: 314, humanCaught: 22 },
    crm:     { processed:   812_400, flagged:  482, caught:  47, humanCaught:  4 },
    sensors: { processed: 9_204_800, flagged: 1908, caught: 188, humanCaught:  9 },
  } as const
  const target = totals[source.value]

  const start = performance.now()
  const duration = 3600
  replayHandle = setInterval(() => {
    const t = Math.min(1, (performance.now() - start) / duration)
    // ease-out
    const eased = 1 - Math.pow(1 - t, 3)
    replayProgress.value = Math.round(eased * 100)
    replayCounts.value = {
      processed:   Math.round(target.processed   * eased),
      flagged:     Math.round(target.flagged     * eased),
      caught:      Math.round(target.caught      * eased),
      humanCaught: Math.round(target.humanCaught * eased),
    }
    if (t >= 1) {
      if (replayHandle) clearInterval(replayHandle)
      replayHandle = null
      replayState.value = 'done'
    }
  }, 60)
}

function exitReplay() {
  if (replayHandle) clearInterval(replayHandle)
  replayHandle = null
  replayState.value = 'idle'
  replayProgress.value = 0
  startStream()
}

// ---------------------------------------------------------------------------
// Chart geometry, small 320x110 SVG.
// Two curves over sensitivity 0..100:
//   - coverage (cyan-brand-deep, solid): % of true anomalies caught
//   - false-positive rate (mute, dashed): scaled into the same plot
// A vertical line marks current sensitivity.
// ---------------------------------------------------------------------------

const CHART_W = 320
const CHART_H = 110
const CHART_PAD = 6

function chartPathCoverage(): string {
  const pts: string[] = []
  for (let s = 0; s <= 100; s += 4) {
    const x = CHART_PAD + (s / 100) * (CHART_W - CHART_PAD * 2)
    const y = CHART_H - CHART_PAD - (coverageAt(s) / 100) * (CHART_H - CHART_PAD * 2)
    pts.push(`${pts.length ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

function chartPathFp(): string {
  // FP is on a 0..40% scale, plotted as fraction of plot height.
  const pts: string[] = []
  for (let s = 0; s <= 100; s += 4) {
    const x = CHART_PAD + (s / 100) * (CHART_W - CHART_PAD * 2)
    const fp = fpPercentAt(s) / 40
    const y = CHART_H - CHART_PAD - fp * (CHART_H - CHART_PAD * 2)
    pts.push(`${pts.length ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

const coveragePath = computed(() => chartPathCoverage())
const fpPath = computed(() => chartPathFp())
const markerX = computed(
  () => CHART_PAD + (sensitivity.value / 100) * (CHART_W - CHART_PAD * 2),
)

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

</script>

<template>
  <div class="relative bg-white text-ink">
    <!-- Top control bar: source toggle ------------------------------------- -->
    <div class="border-b border-line">
      <div class="px-3 sm:px-4 md:px-6 py-3.5 flex flex-wrap items-center gap-2 sm:gap-2.5">
        <span
          class="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.2em] font-semibold text-mute-2 pr-2 mr-1 border-r border-line"
        >
          Stream
        </span>
        <div
          class="inline-flex items-center rounded-lg border border-line bg-surface-alt p-0.5"
          role="tablist"
          aria-label="Data source"
        >
          <button
            v-for="s in SOURCES"
            :key="s.key"
            type="button"
            :aria-selected="source === s.key"
            role="tab"
            class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            :class="
              source === s.key
                ? 'bg-white text-ink shadow-[0_1px_0_rgba(15,23,42,0.04),0_4px_10px_-4px_rgba(15,23,42,0.12)] ring-1 ring-cyan-brand/30'
                : 'text-mute hover:text-ink'
            "
            @click="source = s.key"
          >
            <component :is="s.icon" :size="14" :stroke-width="2" aria-hidden="true" />
            <span>{{ s.short }}</span>
          </button>
        </div>

        <!-- Sensor sub-tabs -->
        <div
          v-if="showSensorSubs"
          class="inline-flex flex-wrap items-center rounded-lg border border-line bg-surface-alt p-0.5 max-w-full overflow-x-auto"
          aria-label="Sensor type"
        >
          <button
            v-for="sub in SENSORS"
            :key="sub.key"
            type="button"
            :aria-pressed="sensorSub === sub.key"
            class="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            :class="
              sensorSub === sub.key
                ? 'bg-white text-ink ring-1 ring-cyan-brand/25'
                : 'text-mute hover:text-ink'
            "
            @click="sensorSub = sub.key"
          >
            <component :is="sub.icon" :size="12" :stroke-width="2" aria-hidden="true" />
            <span>{{ sub.label }}</span>
          </button>
        </div>

        <span class="ml-auto inline-flex items-center gap-1.5 text-[12px] text-mute-2">
          <span class="relative inline-flex h-2 w-2">
            <span class="absolute inset-0 rounded-full bg-cyan-brand opacity-60 animate-ping" />
            <span class="relative inline-block h-2 w-2 rounded-full bg-cyan-brand" />
          </span>
          {{ sourceMeta.rate }}
        </span>
      </div>
    </div>

    <!-- Main grid: feed on left, controls + chart on right ----------------- -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-0">
      <!-- Live feed --------------------------------------------------------- -->
      <section
        class="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-line min-h-[420px] flex flex-col"
        aria-label="Live activity feed"
      >
        <header class="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 md:px-6 py-3 border-b border-line bg-surface-alt/50">
          <div class="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-mute-2">
            <Search :size="12" :stroke-width="2.2" aria-hidden="true" />
            Live activity · scoring in flight
          </div>
          <span class="text-[11.5px] text-mute-2 tabular-nums">
            engine v3.2 · 4 detectors active
          </span>
        </header>

        <div
          class="relative flex-1 overflow-hidden"
          :class="replayState !== 'idle' ? 'opacity-30 pointer-events-none' : ''"
        >
          <ul class="divide-y divide-line">
            <li
              v-for="ev in events"
              :key="ev.id"
              class="group transition-[background-color] duration-300"
              :class="ev.flag ? 'bg-cyan-brand/[0.04] hover:bg-cyan-brand/[0.07]' : 'hover:bg-surface-alt/60'"
            >
              <div
                class="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2.5"
                :class="ev.flag ? 'cursor-pointer' : ''"
                :role="ev.flag ? 'button' : undefined"
                :tabindex="ev.flag ? 0 : undefined"
                :aria-expanded="ev.flag ? expandedId === ev.id : undefined"
                @click="toggleExpand(ev)"
                @keydown.enter.prevent="toggleExpand(ev)"
                @keydown.space.prevent="toggleExpand(ev)"
              >
                <span
                  class="mt-0.5 inline-flex items-center text-[10px] sm:text-[10.5px] tabular-nums text-mute-2 font-mono w-[62px] sm:w-[78px] shrink-0"
                >
                  {{ ev.ts }}
                </span>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[13.5px] text-ink font-medium leading-snug">
                      {{ ev.line }}
                    </span>
                    <span
                      v-if="ev.flag"
                      class="inline-flex items-center gap-1 rounded-full bg-cyan-brand/10 text-cyan-brand-deep border border-cyan-brand/30 px-2 py-[1px] text-[10.5px] font-semibold uppercase tracking-[0.12em]"
                    >
                      <component :is="FLAGS[ev.flag].icon" :size="11" :stroke-width="2.4" aria-hidden="true" />
                      {{ FLAGS[ev.flag].label }}
                    </span>
                  </div>
                  <div class="mt-0.5 text-[12px] text-mute leading-snug">
                    {{ ev.meta }}
                    <span v-if="ev.flag" class="ml-1 text-mute-2 font-mono">· {{ ev.caseId }}</span>
                  </div>
                </div>

                <ChevronDown
                  v-if="ev.flag"
                  :size="14"
                  :stroke-width="2"
                  class="mt-1 shrink-0 text-mute-2 transition-transform duration-200"
                  :class="expandedId === ev.id ? 'rotate-180 text-cyan-brand-deep' : ''"
                  aria-hidden="true"
                />
              </div>

              <!-- Expanded inspector -->
              <div
                v-if="ev.flag && expandedId === ev.id"
                class="px-3 sm:px-4 md:px-6 pb-4 pt-1"
              >
                <div class="rounded-lg border border-cyan-brand/20 bg-surface-alt/70 p-3.5 md:p-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
                    <div>
                      <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
                        <Gauge :size="11" :stroke-width="2.4" aria-hidden="true" />
                        Rule fired
                      </div>
                      <p class="mt-1.5 text-[12.5px] text-ink leading-snug">
                        {{ FLAG_PAYLOAD[ev.flag].rule }}
                      </p>
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
                        <TrendingUp :size="11" :stroke-width="2.4" aria-hidden="true" />
                        Related history
                      </div>
                      <ul class="mt-1.5 space-y-1">
                        <li
                          v-for="(h, i) in FLAG_PAYLOAD[ev.flag].history"
                          :key="i"
                          class="text-[12.5px] text-mute leading-snug pl-2.5 relative"
                        >
                          <span class="absolute left-0 top-[7px] inline-block h-1 w-1 rounded-full bg-cyan-brand/60" aria-hidden="true" />
                          {{ h }}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
                        <ArrowRight :size="11" :stroke-width="2.4" aria-hidden="true" />
                        Suggested action
                      </div>
                      <p class="mt-1.5 text-[12.5px] text-ink leading-snug">
                        {{ FLAG_PAYLOAD[ev.flag].action }}
                      </p>
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
                        <FileText :size="11" :stroke-width="2.4" aria-hidden="true" />
                        Audit trail
                      </div>
                      <p class="mt-1.5 text-[12.5px] text-mute leading-snug font-mono">
                        {{ FLAG_PAYLOAD[ev.flag].audit }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <!-- Bottom gradient mask for the rolling-feed effect -->
          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"
            aria-hidden="true"
          />
        </div>

        <!-- Replay overlay --------------------------------------------------- -->
        <div
          v-if="replayState !== 'idle'"
          class="absolute inset-x-0 top-[68px] bottom-0 lg:right-auto lg:w-[60%] flex items-stretch z-10"
          aria-live="polite"
        >
          <div class="m-3 md:m-4 flex-1 rounded-xl border border-cyan-brand/30 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-line">
              <div class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-cyan-brand-deep">
                <FastForward :size="12" :stroke-width="2.4" aria-hidden="true" />
                {{ replayState === 'running' ? 'Replaying last week' : 'Replay complete' }}
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-[12px] text-mute hover:text-ink rounded px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                @click="exitReplay"
              >
                <X :size="13" :stroke-width="2.2" aria-hidden="true" />
                Exit
              </button>
            </div>
            <div class="px-4 py-4">
              <div class="h-1 w-full rounded-full bg-surface-alt overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-cyan-brand to-cyan-brand-deep transition-[width] duration-100"
                  :style="{ width: replayProgress + '%' }"
                />
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3 md:gap-4">
                <div class="rounded-lg bg-surface-alt/70 p-3">
                  <div class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                    Events processed
                  </div>
                  <div class="mt-1 font-display text-[22px] sm:text-[26px] md:text-[30px] leading-none tabular-nums text-ink">
                    {{ fmt(replayCounts.processed) }}
                  </div>
                </div>
                <div class="rounded-lg bg-surface-alt/70 p-3">
                  <div class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                    Flagged by engine
                  </div>
                  <div class="mt-1 font-display text-[22px] sm:text-[26px] md:text-[30px] leading-none tabular-nums text-ink">
                    {{ fmt(replayCounts.flagged) }}
                  </div>
                </div>
                <div class="rounded-lg bg-cyan-brand/10 ring-1 ring-cyan-brand/30 p-3">
                  <div class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
                    Real issues caught
                  </div>
                  <div class="mt-1 font-display text-[22px] sm:text-[26px] md:text-[30px] leading-none tabular-nums text-ink">
                    {{ fmt(replayCounts.caught) }}
                  </div>
                </div>
                <div class="rounded-lg bg-surface-alt/70 p-3">
                  <div class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                    Human review at sample rate
                  </div>
                  <div class="mt-1 font-display text-[22px] sm:text-[26px] md:text-[30px] leading-none tabular-nums text-ink">
                    {{ fmt(replayCounts.humanCaught) }}
                  </div>
                </div>
              </div>

              <p
                v-if="replayState === 'done'"
                class="mt-4 text-[12.5px] text-mute leading-snug"
              >
                Same week, same data.
                <span class="text-ink font-semibold">
                  {{ fmt(replayCounts.caught - replayCounts.humanCaught) }}
                </span>
                issues recovered that a human reviewer at sample rate would have missed -
                every one with its evidence trail already attached.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Right rail: controls + chart -------------------------------------- -->
      <aside class="lg:col-span-2 p-4 md:p-5 space-y-5">
        <!-- Sensitivity slider -->
        <div>
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-mute-2">
              <SlidersHorizontal :size="12" :stroke-width="2.2" aria-hidden="true" />
              Sensitivity
            </div>
            <span class="text-[12.5px] tabular-nums text-ink font-semibold">
              {{ sensitivity }}
            </span>
          </div>
          <input
            v-model.number="sensitivity"
            type="range"
            min="0"
            max="100"
            step="1"
            class="mt-2.5 w-full sensitivity-slider"
            aria-label="Detection sensitivity"
          />
          <div class="mt-1 flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
            <span>Quiet</span>
            <span>Balanced</span>
            <span>Loud</span>
          </div>
        </div>

        <!-- Trade-off chart -->
        <div class="rounded-xl border border-line bg-surface-alt/40 p-3.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="text-[11px] uppercase tracking-[0.2em] font-semibold text-mute-2">
              Trade-off curve
            </div>
            <div class="inline-flex flex-wrap items-center gap-2 sm:gap-3 text-[10.5px] text-mute-2">
              <span class="inline-flex items-center gap-1">
                <span class="h-[2px] w-3 bg-cyan-brand-deep rounded-full" aria-hidden="true" />
                Coverage
              </span>
              <span class="inline-flex items-center gap-1">
                <span class="h-[2px] w-3 border-t border-dashed border-mute-2/70" aria-hidden="true" />
                False positives
              </span>
            </div>
          </div>

          <svg
            :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
            class="mt-2 w-full h-[110px]"
            role="img"
            aria-label="Coverage and false-positive rate as a function of sensitivity"
          >
            <!-- baseline -->
            <line
              :x1="CHART_PAD"
              :y1="CHART_H - CHART_PAD"
              :x2="CHART_W - CHART_PAD"
              :y2="CHART_H - CHART_PAD"
              stroke="rgba(15,23,42,0.08)"
              stroke-width="1"
            />
            <line
              :x1="CHART_PAD"
              :y1="CHART_PAD"
              :x2="CHART_W - CHART_PAD"
              :y2="CHART_PAD"
              stroke="rgba(15,23,42,0.04)"
              stroke-width="1"
            />
            <!-- coverage area -->
            <path
              :d="coveragePath + ` L ${CHART_W - CHART_PAD} ${CHART_H - CHART_PAD} L ${CHART_PAD} ${CHART_H - CHART_PAD} Z`"
              fill="rgba(1, 219, 241, 0.10)"
            />
            <!-- coverage line -->
            <path
              :d="coveragePath"
              fill="none"
              stroke="#00b8cc"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- false-positive line -->
            <path
              :d="fpPath"
              fill="none"
              stroke="#64748b"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-dasharray="3 3"
            />
            <!-- vertical marker -->
            <line
              :x1="markerX"
              :y1="CHART_PAD"
              :x2="markerX"
              :y2="CHART_H - CHART_PAD"
              stroke="#01DBF1"
              stroke-width="1.5"
            />
            <circle :cx="markerX" :cy="CHART_PAD + 2" r="3" fill="#01DBF1" />
          </svg>

          <div class="mt-3 grid grid-cols-3 gap-2">
            <div class="rounded-md bg-white border border-line px-2.5 py-2">
              <div class="text-[9.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold">
                Flags / min
              </div>
              <div class="mt-0.5 font-display text-[18px] leading-none tabular-nums text-ink">
                {{ flagsPerMin }}
              </div>
            </div>
            <div class="rounded-md bg-white border border-line px-2.5 py-2">
              <div class="text-[9.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold">
                False positives
              </div>
              <div class="mt-0.5 font-display text-[18px] leading-none tabular-nums text-ink">
                {{ fpPercent }}%
              </div>
            </div>
            <div class="rounded-md bg-cyan-brand/10 ring-1 ring-cyan-brand/30 px-2.5 py-2">
              <div class="text-[9.5px] uppercase tracking-[0.16em] text-cyan-brand-deep font-semibold">
                Real issues caught
              </div>
              <div class="mt-0.5 font-display text-[18px] leading-none tabular-nums text-ink">
                {{ coverage }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Replay control -->
        <div class="rounded-xl border border-line bg-white p-3.5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-[11px] uppercase tracking-[0.2em] font-semibold text-mute-2">
                Replay last week
              </div>
              <p class="mt-1 text-[12.5px] text-mute leading-snug">
                Fast-forward a week of {{ sourceMeta.short.toLowerCase() }} activity. Count what
                the engine caught versus what a human reviewer at sample rate would have missed.
              </p>
            </div>
            <button
              v-if="replayState === 'idle'"
              type="button"
              class="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[12.5px] font-semibold px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="startReplay"
            >
              <Play :size="13" :stroke-width="2.4" aria-hidden="true" />
              Run
            </button>
            <button
              v-else-if="replayState === 'done'"
              type="button"
              class="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white hover:border-cyan-brand/40 text-ink text-[12.5px] font-semibold px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="exitReplay"
            >
              <RotateCcw :size="13" :stroke-width="2.4" aria-hidden="true" />
              Reset
            </button>
            <span
              v-else
              class="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-surface-alt text-mute-2 text-[12.5px] font-semibold px-3 py-2"
            >
              <FastForward :size="13" :stroke-width="2.4" aria-hidden="true" />
              Replaying…
            </span>
          </div>
        </div>

        <!-- Footnote -->
        <p class="text-[11.5px] text-mute-2 leading-snug">
          Demo data. The detectors, rules, history payload and audit-trail references are
          illustrative, the engine behind it is the same one we build for real.
        </p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.sensitivity-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: linear-gradient(to right, rgba(1, 219, 241, 0.55) 0%, rgba(1, 219, 241, 0.55) var(--p, 55%), rgba(15, 23, 42, 0.08) var(--p, 55%));
  border-radius: 9999px;
  outline: none;
}
.sensitivity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #ffffff;
  border: 2px solid #00b8cc;
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.15);
  cursor: pointer;
  transition: transform 120ms ease;
}
.sensitivity-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #ffffff;
  border: 2px solid #00b8cc;
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.15);
  cursor: pointer;
}
.sensitivity-slider::-webkit-slider-thumb:hover { transform: scale(1.06); }
</style>
