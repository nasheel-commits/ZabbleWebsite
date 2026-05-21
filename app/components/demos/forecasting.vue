<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Activity, Box, Briefcase, CheckCircle2, ChefHat, FileText, LineChart, Package, RefreshCcw, Send, Truck, Users, Wallet, Wrench } from '@lucide/vue'

type UseCaseId = 'restaurant' | 'parts' | 'saas'
type DriverId = 'd1' | 'd2' | 'd3' | 'd4'

type DriverShape =
  | {
      type: 'slider'
      min: number
      max: number
      step: number
      minLabel: string
      maxLabel: string
    }
  | { type: 'toggle'; offLabel: string; onLabel: string }
  | { type: 'select'; options: Array<{ value: number; label: string }> }

interface DriverDef {
  id: DriverId
  label: string
  shape: DriverShape
  default: number
  /** How much the driver shifts the forecast (per unit of value). */
  effect: number
}

interface Destination {
  id: string
  label: string
  artefactName: string
  icon: Component
  buttonLabel: string
}

interface RecDef {
  id: string
  icon: Component
  format: (peak: number, avg: number, drivers: Record<DriverId, number>) => string
  reason: string
  destination: Destination
}

interface UseCase {
  id: UseCaseId
  label: string
  short: string
  yLabel: string
  unit: string
  history: number[]
  baseForecast: number[]
  driverDefs: DriverDef[]
  recs: RecDef[]
  mape: { forecast: number; naive: number }
}

// ---------------------------------------------------------------------------
// Deterministic data generation
// ---------------------------------------------------------------------------

function noiseSeq(seed: number): (i: number) => number {
  return (i: number) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
    return (x - Math.floor(x)) * 2 - 1
  }
}

function genHistory(opts: {
  N: number
  base: number
  growth: number
  seasonalAmp: number
  seasonalPeriod: number
  seasonalPhase: number
  noiseAmp: number
  seed: number
}): number[] {
  const noise = noiseSeq(opts.seed)
  const out: number[] = []
  for (let i = 0; i < opts.N; i++) {
    const trend = opts.base + opts.growth * i
    const season =
      opts.seasonalAmp *
      Math.sin((2 * Math.PI * (i + opts.seasonalPhase)) / opts.seasonalPeriod)
    const n = noise(i) * opts.noiseAmp
    out.push(Math.max(0, trend + season + n))
  }
  return out
}

function genBaseForecast(opts: {
  start: number
  N: number
  historyLen: number
  growth: number
  seasonalAmp: number
  seasonalPeriod: number
  seasonalPhase: number
}): number[] {
  const out: number[] = []
  for (let k = 1; k <= opts.N; k++) {
    const i = opts.historyLen - 1 + k
    const trend = opts.start + opts.growth * i
    const season =
      opts.seasonalAmp *
      Math.sin((2 * Math.PI * (i + opts.seasonalPhase)) / opts.seasonalPeriod)
    out.push(Math.max(0, trend + season))
  }
  return out
}

function computeMape(
  history: number[],
  seed: number,
): { forecast: number; naive: number } {
  const lastN = 12
  const N = history.length
  const noise = noiseSeq(seed + 91)
  let fErr = 0
  let nErr = 0
  for (let i = N - lastN; i < N; i++) {
    const actual = history[i] ?? 0
    if (actual === 0) continue
    const winStart = Math.max(0, i - 11)
    const win = history.slice(winStart, i)
    const naive = win.reduce((a, b) => a + b, 0) / win.length
    // Synthetic "system forecast" tracks the actual closely — this is the
    // model's holdout performance, not driver-dependent.
    const sys = actual * (1 + noise(i) * 0.085)
    fErr += Math.abs((sys - actual) / actual)
    nErr += Math.abs((naive - actual) / actual)
  }
  return {
    forecast: (fErr / lastN) * 100,
    naive: (nErr / lastN) * 100,
  }
}

const HISTORY_LEN = 78
const FORECAST_LEN = 8

function buildUseCase(spec: {
  id: UseCaseId
  label: string
  short: string
  yLabel: string
  unit: string
  base: number
  growth: number
  seasonalAmp: number
  seasonalPeriod: number
  seasonalPhase: number
  noiseAmp: number
  seed: number
  driverDefs: DriverDef[]
  recs: RecDef[]
}): UseCase {
  const history = genHistory({
    N: HISTORY_LEN,
    base: spec.base,
    growth: spec.growth,
    seasonalAmp: spec.seasonalAmp,
    seasonalPeriod: spec.seasonalPeriod,
    seasonalPhase: spec.seasonalPhase,
    noiseAmp: spec.noiseAmp,
    seed: spec.seed,
  })
  const baseForecast = genBaseForecast({
    start: spec.base,
    N: FORECAST_LEN,
    historyLen: HISTORY_LEN,
    growth: spec.growth,
    seasonalAmp: spec.seasonalAmp,
    seasonalPeriod: spec.seasonalPeriod,
    seasonalPhase: spec.seasonalPhase,
  })
  return {
    id: spec.id,
    label: spec.label,
    short: spec.short,
    yLabel: spec.yLabel,
    unit: spec.unit,
    history,
    baseForecast,
    driverDefs: spec.driverDefs,
    recs: spec.recs,
    mape: computeMape(history, spec.seed),
  }
}

// ---------------------------------------------------------------------------
// Destinations (per use-case)
// ---------------------------------------------------------------------------

const REST_DEST = {
  supplier: {
    id: 'supplier',
    label: 'Supplier portal',
    artefactName: 'Order request',
    icon: Truck,
    buttonLabel: 'Send to supplier portal',
  },
  rota: {
    id: 'rota',
    label: 'Rota tool',
    artefactName: 'Shift draft',
    icon: Users,
    buttonLabel: 'Push to rota tool',
  },
  kitchen: {
    id: 'kitchen',
    label: 'Kitchen brief',
    artefactName: 'Prep sheet',
    icon: ChefHat,
    buttonLabel: 'Send to kitchen brief',
  },
}

const PARTS_DEST = {
  po: {
    id: 'po',
    label: 'PO drafts',
    artefactName: 'Purchase order',
    icon: FileText,
    buttonLabel: 'Draft PO',
  },
  mrp: {
    id: 'mrp',
    label: 'MRP system',
    artefactName: 'Stock hold note',
    icon: Box,
    buttonLabel: 'Push to MRP',
  },
  dispatch: {
    id: 'dispatch',
    label: 'Dispatch board',
    artefactName: 'Courier brief',
    icon: Truck,
    buttonLabel: 'Send to dispatch',
  },
}

const SAAS_DEST = {
  fpna: {
    id: 'fpna',
    label: 'FP&A model',
    artefactName: 'Cash buffer line',
    icon: Wallet,
    buttonLabel: 'Push to FP&A',
  },
  crm: {
    id: 'crm',
    label: 'CRM (Sales Ops)',
    artefactName: 'Renewal batch',
    icon: Briefcase,
    buttonLabel: 'Send to CRM',
  },
  people: {
    id: 'people',
    label: 'People Ops',
    artefactName: 'Hiring memo',
    icon: Users,
    buttonLabel: 'Send to People Ops',
  },
}

// ---------------------------------------------------------------------------
// Use-cases
// ---------------------------------------------------------------------------

const USE_CASES: UseCase[] = [
  buildUseCase({
    id: 'restaurant',
    label: 'Restaurant staffing',
    short: 'Restaurant',
    yLabel: 'Covers / week',
    unit: 'covers',
    base: 720,
    growth: 4.0,
    seasonalAmp: 110,
    seasonalPeriod: 52,
    seasonalPhase: 12,
    noiseAmp: 48,
    seed: 17,
    driverDefs: [
      {
        id: 'd1',
        label: 'Weather (next week)',
        shape: {
          type: 'slider',
          min: -2,
          max: 2,
          step: 1,
          minLabel: 'Wet & cold',
          maxLabel: 'Hot & dry',
        },
        default: 0,
        effect: 0.045,
      },
      {
        id: 'd2',
        label: 'Local event nearby',
        shape: { type: 'toggle', offLabel: 'No event', onLabel: 'Sports final' },
        default: 0,
        effect: 0.085,
      },
      {
        id: 'd3',
        label: 'Promo running',
        shape: {
          type: 'select',
          options: [
            { value: 0, label: 'None' },
            { value: 1, label: 'Soft' },
            { value: 2, label: 'Aggressive' },
          ],
        },
        default: 0,
        effect: 0.05,
      },
      {
        id: 'd4',
        label: 'Recent trend strength',
        shape: {
          type: 'slider',
          min: -1,
          max: 1,
          step: 1,
          minLabel: 'Cooling',
          maxLabel: 'Heating',
        },
        default: 0,
        effect: 0.06,
      },
    ],
    recs: [
      {
        id: 'flour',
        icon: ChefHat,
        format: (peak) => `Order ${Math.round((peak * 0.20) / 10) * 10}kg flour Tuesday`,
        reason: 'Sized to the forecast peak — covers Wed–Sat prep without surplus.',
        destination: REST_DEST.supplier,
      },
      {
        id: 'staff',
        icon: Users,
        format: (peak) =>
          `Schedule ${Math.max(10, Math.round(peak * 0.0155))} staff Saturday lunch`,
        reason: 'Peak Saturday demand at one FOH per ~55 covers / shift.',
        destination: REST_DEST.rota,
      },
      {
        id: 'dessert',
        icon: ChefHat,
        format: (_peak, avg) => {
          const pct = Math.max(6, Math.min(22, Math.round(12 + (avg < 900 ? 4 : -2))))
          return `Reduce dessert prep ${pct}% Wednesday`
        },
        reason: 'Midweek dessert pull lags the weekly average — cut to avoid waste.',
        destination: REST_DEST.kitchen,
      },
    ],
  }),

  buildUseCase({
    id: 'parts',
    label: 'Parts reorder points',
    short: 'Parts',
    yLabel: 'Units / week',
    unit: 'units',
    base: 1180,
    growth: 2.6,
    seasonalAmp: 175,
    seasonalPeriod: 52,
    seasonalPhase: 30,
    noiseAmp: 68,
    seed: 41,
    driverDefs: [
      {
        id: 'd1',
        label: 'Inbound lead-time pressure',
        shape: {
          type: 'slider',
          min: -2,
          max: 2,
          step: 1,
          minLabel: 'Loose',
          maxLabel: 'Tight',
        },
        default: 0,
        effect: 0.04,
      },
      {
        id: 'd2',
        label: 'OEM launch nearby',
        shape: { type: 'toggle', offLabel: 'None', onLabel: 'Tier-1 OEM' },
        default: 0,
        effect: 0.075,
      },
      {
        id: 'd3',
        label: 'Volume contract',
        shape: {
          type: 'select',
          options: [
            { value: 0, label: 'None' },
            { value: 1, label: 'Standing' },
            { value: 2, label: 'Forward 90d' },
          ],
        },
        default: 0,
        effect: 0.05,
      },
      {
        id: 'd4',
        label: 'Recent trend strength',
        shape: {
          type: 'slider',
          min: -1,
          max: 1,
          step: 1,
          minLabel: 'Cooling',
          maxLabel: 'Heating',
        },
        default: 0,
        effect: 0.05,
      },
    ],
    recs: [
      {
        id: 'bearings',
        icon: Package,
        format: (peak) =>
          `Reorder ${Math.round((peak * 0.32) / 20) * 20} bearings by Monday`,
        reason: 'Sized to peak draw + 14-day lead time on Tier-2 bearings.',
        destination: PARTS_DEST.po,
      },
      {
        id: 'pumps',
        icon: Wrench,
        format: (_peak, avg) => {
          const pct = Math.max(15, Math.min(45, Math.round(30 + (avg > 1300 ? 5 : -3))))
          return `Hold pump kits at ${pct}% above plan`
        },
        reason: 'Forecast band sits above mean — buffer absorbs the variance.',
        destination: PARTS_DEST.mrp,
      },
      {
        id: 'courier',
        icon: Truck,
        format: (_peak, avg) => {
          const pct = Math.max(8, Math.min(22, Math.round(13 + (avg < 1150 ? 3 : -2))))
          return `Cut Thursday courier load ${pct}%`
        },
        reason: 'Midweek dip in dispatch volume — courier slot scales down.',
        destination: PARTS_DEST.dispatch,
      },
    ],
  }),

  buildUseCase({
    id: 'saas',
    label: 'SaaS cash-flow',
    short: 'SaaS',
    yLabel: 'Weekly cash ($k)',
    unit: '$k',
    base: 168,
    growth: 1.45,
    seasonalAmp: 18,
    seasonalPeriod: 52,
    seasonalPhase: 4,
    noiseAmp: 8,
    seed: 73,
    driverDefs: [
      {
        id: 'd1',
        label: 'Market sentiment',
        shape: {
          type: 'slider',
          min: -2,
          max: 2,
          step: 1,
          minLabel: 'Freezing',
          maxLabel: 'Expanding',
        },
        default: 0,
        effect: 0.035,
      },
      {
        id: 'd2',
        label: 'Product launch nearby',
        shape: { type: 'toggle', offLabel: 'No launch', onLabel: 'GA next month' },
        default: 0,
        effect: 0.055,
      },
      {
        id: 'd3',
        label: 'Pricing change',
        shape: {
          type: 'select',
          options: [
            { value: 0, label: 'None' },
            { value: 1, label: '+8% new logo' },
            { value: 2, label: '+15% & tier shift' },
          ],
        },
        default: 0,
        effect: 0.04,
      },
      {
        id: 'd4',
        label: 'Net-new logo trend',
        shape: {
          type: 'slider',
          min: -1,
          max: 1,
          step: 1,
          minLabel: 'Cooling',
          maxLabel: 'Heating',
        },
        default: 0,
        effect: 0.05,
      },
    ],
    recs: [
      {
        id: 'buffer',
        icon: Wallet,
        format: (peak) =>
          `Hold $${Math.round((peak * 0.22) / 2) * 2}k cash buffer in October`,
        reason: 'Buffer covers October payables against forecast variance.',
        destination: SAAS_DEST.fpna,
      },
      {
        id: 'renewals',
        icon: Briefcase,
        format: (peak) =>
          `Pull forward ${Math.max(8, Math.round(peak / 18))} annual renewals`,
        reason: 'Quarter-end target met without leaning on net-new pipeline.',
        destination: SAAS_DEST.crm,
      },
      {
        id: 'hire',
        icon: Users,
        format: (_peak, avg) => {
          const q = avg < 195 ? 'one quarter' : avg < 220 ? 'half a quarter' : 'two weeks'
          return `Defer 3rd AE hire by ${q}`
        },
        reason: 'Forecast clears the hiring threshold one quarter later than plan.',
        destination: SAAS_DEST.people,
      },
    ],
  }),
]

const USE_CASE_BY_ID = Object.fromEntries(
  USE_CASES.map((u) => [u.id, u]),
) as Record<UseCaseId, UseCase>

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

const activeUseCaseId = ref<UseCaseId>('restaurant')

const driverState: Record<UseCaseId, Record<DriverId, number>> = reactive({
  restaurant: { d1: 0, d2: 0, d3: 0, d4: 0 },
  parts: { d1: 0, d2: 0, d3: 0, d4: 0 },
  saas: { d1: 0, d2: 0, d3: 0, d4: 0 },
})

const activeUseCase = computed(() => USE_CASE_BY_ID[activeUseCaseId.value])
const drivers = computed(() => driverState[activeUseCaseId.value])

function setDriver(id: DriverId, value: number) {
  driverState[activeUseCaseId.value][id] = value
}

// ---------------------------------------------------------------------------
// Forecast computation
// ---------------------------------------------------------------------------

interface ForecastResult {
  median: number[]
  lower: number[]
  upper: number[]
  peak: number
  avg: number
  delta: number // % vs last history point
}

const forecast = computed<ForecastResult>(() => {
  const uc = activeUseCase.value
  const d = drivers.value
  let totalShift = 0
  for (const def of uc.driverDefs.slice(0, 3)) {
    const v = d[def.id]
    if (def.shape.type === 'slider') totalShift += def.effect * v
    else if (def.shape.type === 'toggle') totalShift += v === 1 ? def.effect : 0
    else if (def.shape.type === 'select') totalShift += def.effect * v
  }
  const trendVal = d.d4
  const trendSlope = trendVal * 0.022

  const median: number[] = []
  const lower: number[] = []
  const upper: number[] = []
  uc.baseForecast.forEach((v, i) => {
    const slopeFactor = 1 + trendSlope * (i + 1)
    const m = v * (1 + totalShift) * slopeFactor
    median.push(m)
    const driverNoise = Math.min(0.06, Math.abs(totalShift) * 0.35)
    const w = 0.065 + (i + 1) * 0.012 + driverNoise * 0.5
    lower.push(m * (1 - w))
    upper.push(m * (1 + w))
  })

  const peak = Math.max(...median)
  const avg = median.reduce((a, b) => a + b, 0) / median.length
  const last = uc.history[uc.history.length - 1] ?? 1
  const lastMedian = median[median.length - 1] ?? last
  const delta = ((lastMedian - last) / last) * 100

  return { median, lower, upper, peak, avg, delta }
})

const fullSeries = computed(() => {
  const uc = activeUseCase.value
  const all = [...uc.history, ...forecast.value.median]
  return all
})

const naiveBaseline = computed(() => {
  const s = fullSeries.value
  const out: number[] = []
  for (let i = 0; i < s.length; i++) {
    const win = s.slice(Math.max(0, i - 11), i + 1)
    out.push(win.reduce((a, b) => a + b, 0) / win.length)
  }
  return out
})

// ---------------------------------------------------------------------------
// Chart geometry
// ---------------------------------------------------------------------------

const CHART_W = 1000
const CHART_H = 360
const PAD_L = 60
const PAD_R = 28
const PAD_T = 24
const PAD_B = 38

const chartMetrics = computed(() => {
  const s = fullSeries.value
  const all = [...s, ...forecast.value.lower, ...forecast.value.upper, ...naiveBaseline.value]
  const yMin = Math.min(...all) * 0.9
  const yMax = Math.max(...all) * 1.07
  const n = s.length
  const xToPx = (i: number) =>
    PAD_L + (i / (n - 1)) * (CHART_W - PAD_L - PAD_R)
  const yToPx = (v: number) =>
    CHART_H - PAD_B - ((v - yMin) / (yMax - yMin)) * (CHART_H - PAD_T - PAD_B)
  return { yMin, yMax, n, xToPx, yToPx }
})

function pathFor(values: number[], offset = 0): string {
  const { xToPx, yToPx } = chartMetrics.value
  return values
    .map(
      (v, i) =>
        `${i === 0 ? 'M' : 'L'} ${xToPx(i + offset).toFixed(2)} ${yToPx(v).toFixed(2)}`,
    )
    .join(' ')
}

const historyPath = computed(() => pathFor(activeUseCase.value.history))

const forecastPath = computed(() => {
  const uc = activeUseCase.value
  const start = uc.history[uc.history.length - 1] ?? 0
  return pathFor([start, ...forecast.value.median], uc.history.length - 1)
})

const bandPath = computed(() => {
  const uc = activeUseCase.value
  const startVal = uc.history[uc.history.length - 1] ?? 0
  const upper: number[] = [startVal, ...forecast.value.upper]
  const lower: number[] = [startVal, ...forecast.value.lower]
  const { xToPx, yToPx } = chartMetrics.value
  const offset = uc.history.length - 1
  const top = upper
    .map(
      (v, i) =>
        `${i === 0 ? 'M' : 'L'} ${xToPx(i + offset).toFixed(2)} ${yToPx(v).toFixed(2)}`,
    )
    .join(' ')
  let bot = ''
  for (let i = lower.length - 1; i >= 0; i--) {
    bot += ` L ${xToPx(i + offset).toFixed(2)} ${yToPx(lower[i] ?? 0).toFixed(2)}`
  }
  return `${top}${bot} Z`
})

const naivePath = computed(() => pathFor(naiveBaseline.value))

const boundaryX = computed(() => chartMetrics.value.xToPx(activeUseCase.value.history.length - 1))

const yTicks = computed(() => {
  const { yMin, yMax, yToPx } = chartMetrics.value
  const ticks: { v: number; y: number }[] = []
  for (let k = 0; k <= 4; k++) {
    const v = yMin + (yMax - yMin) * (k / 4)
    ticks.push({ v, y: yToPx(v) })
  }
  return ticks
})

const xTicks = computed(() => {
  const uc = activeUseCase.value
  const total = uc.history.length + forecast.value.median.length
  const labels = ['Q1 ’24', 'Q2 ’24', 'Q3 ’24', 'Q4 ’24', 'Q1 ’25', 'Q2 ’25', 'Now', 'Fcst']
  const { xToPx } = chartMetrics.value
  const ticks: { x: number; label: string }[] = []
  for (let k = 0; k < labels.length; k++) {
    const i = Math.round((k / (labels.length - 1)) * (total - 1))
    ticks.push({ x: xToPx(i), label: labels[k] ?? '' })
  }
  return ticks
})

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

interface ResolvedRec {
  id: string
  icon: Component
  text: string
  reason: string
  destination: Destination
}

const recommendations = computed<ResolvedRec[]>(() => {
  const uc = activeUseCase.value
  const fc = forecast.value
  const d = drivers.value
  return uc.recs.map((r) => ({
    id: r.id,
    icon: r.icon,
    text: r.format(fc.peak, fc.avg, d),
    reason: r.reason,
    destination: r.destination,
  }))
})

// ---------------------------------------------------------------------------
// Push-to-system animation state
// ---------------------------------------------------------------------------

interface PushState {
  status: 'idle' | 'flying' | 'landed'
  ts: string
}

function pushKey(useCaseId: UseCaseId, recId: string): string {
  return `${useCaseId}:${recId}`
}

const pushState: Record<string, PushState> = reactive(
  Object.fromEntries(
    USE_CASES.flatMap((uc) =>
      uc.recs.map((r) => [pushKey(uc.id, r.id), { status: 'idle', ts: '' }]),
    ),
  ),
)

function recState(rec: ResolvedRec): PushState {
  return pushState[pushKey(activeUseCaseId.value, rec.id)]!
}

function nowHm(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function pushRec(rec: ResolvedRec) {
  const state = pushState[pushKey(activeUseCaseId.value, rec.id)]
  if (!state || state.status === 'flying') return
  state.status = 'flying'
  state.ts = nowHm()
  window.setTimeout(() => {
    state.status = 'landed'
  }, 720)
}

function resetAll() {
  for (const id of ['restaurant', 'parts', 'saas'] as UseCaseId[]) {
    driverState[id].d1 = 0
    driverState[id].d2 = 0
    driverState[id].d3 = 0
    driverState[id].d4 = 0
    for (const r of USE_CASE_BY_ID[id].recs) {
      pushState[pushKey(id, r.id)] = { status: 'idle', ts: '' }
    }
  }
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

function fmtValue(v: number, unit: string): string {
  if (unit === '$k') return `$${Math.round(v)}k`
  if (v >= 10000) return `${(v / 1000).toFixed(1)}k`
  return Math.round(v).toLocaleString()
}

function fmtUnit(v: number): string {
  return fmtValue(v, activeUseCase.value.unit)
}

const lastForecastValue = computed(() => {
  const m = forecast.value.median
  return m[m.length - 1] ?? 0
})

function driverValueLabel(def: DriverDef, value: number): string {
  if (def.shape.type === 'slider') {
    if (def.shape.min === -2 && def.shape.max === 2) {
      if (value === 0) return 'Neutral'
      if (value === -2) return `${def.shape.minLabel} (heavy)`
      if (value === -1) return def.shape.minLabel
      if (value === 1) return def.shape.maxLabel
      return `${def.shape.maxLabel} (heavy)`
    }
    if (def.shape.min === -1 && def.shape.max === 1) {
      if (value === 0) return 'Steady'
      return value === -1 ? def.shape.minLabel : def.shape.maxLabel
    }
    return String(value)
  }
  if (def.shape.type === 'toggle') {
    return value === 1 ? def.shape.onLabel : def.shape.offLabel
  }
  if (def.shape.type === 'select') {
    return def.shape.options.find((o) => o.value === value)?.label ?? ''
  }
  return ''
}

</script>

<template>
  <div class="bg-white">
    <!-- Header -->
    <div
      class="border-b border-line px-4 md:px-7 py-5 flex flex-wrap items-center gap-4"
    >
      <div class="flex items-center gap-3 min-w-0">
        <span
          class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
          aria-hidden="true"
        >
          <LineChart :size="18" :stroke-width="1.9" />
        </span>
        <div class="min-w-0">
          <div
            class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold leading-none"
          >
            Live demo
          </div>
          <div
            class="mt-1 font-display text-[20px] md:text-[22px] leading-tight text-ink truncate"
          >
            Forecasting — {{ activeUseCase.label }}
          </div>
        </div>
      </div>

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Use case"
          class="inline-flex items-center rounded-full border border-line bg-surface-alt p-1"
        >
          <button
            v-for="u in USE_CASES"
            :key="u.id"
            role="tab"
            type="button"
            :aria-selected="u.id === activeUseCaseId"
            :class="[
              'rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
              u.id === activeUseCaseId
                ? 'bg-white text-ink shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                : 'text-mute-2 hover:text-ink',
            ]"
            @click="activeUseCaseId = u.id"
          >
            {{ u.short }}
          </button>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[12.5px] font-semibold text-mute hover:text-ink hover:border-cyan-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          @click="resetAll"
        >
          <RefreshCcw :size="14" :stroke-width="2" aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>

    <!-- Chart + drivers -->
    <div
      class="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-0 lg:divide-x lg:divide-line"
    >
      <!-- LEFT: chart + accuracy -->
      <div class="p-4 md:p-7">
        <div class="rounded-2xl border border-line bg-white p-4 md:p-5">
          <div class="flex flex-wrap items-baseline gap-3 mb-3">
            <div>
              <div
                class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
              >
                Demand · 18-month history + 8-week forecast
              </div>
              <div class="mt-1 font-display text-[19px] leading-tight text-ink">
                {{ activeUseCase.yLabel }}
              </div>
            </div>
            <div
              class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2.5 py-1 text-[11.5px] font-semibold text-mute-2"
              aria-live="polite"
            >
              <Activity
                :size="11"
                :stroke-width="2"
                class="text-cyan-brand-deep"
                aria-hidden="true"
              />
              Wk +8 forecast {{ fmtUnit(lastForecastValue) }}
              <span class="text-mute font-normal">·</span>
              <span
                :class="
                  forecast.delta >= 0
                    ? 'text-cyan-brand-deep'
                    : 'text-amber-600'
                "
              >
                {{ forecast.delta >= 0 ? '+' : '' }}{{ forecast.delta.toFixed(1) }}%
              </span>
            </div>
          </div>

          <svg
            viewBox="0 0 1000 360"
            class="w-full h-auto block"
            role="img"
            aria-label="Forecast chart with confidence band and naive baseline"
          >
            <!-- Y grid lines -->
            <line
              v-for="t in yTicks"
              :key="`gy${t.v}`"
              :x1="PAD_L"
              :x2="1000 - PAD_R"
              :y1="t.y"
              :y2="t.y"
              stroke="rgba(15,23,42,0.06)"
              stroke-width="1"
            />

            <!-- Y tick labels -->
            <text
              v-for="t in yTicks"
              :key="`yl${t.v}`"
              :x="PAD_L - 8"
              :y="t.y + 4"
              text-anchor="end"
              font-size="11"
              fill="rgba(71,85,105,0.95)"
              font-family="Inter, sans-serif"
            >
              {{ fmtUnit(t.v) }}
            </text>

            <!-- Forecast zone shading -->
            <rect
              :x="boundaryX"
              :y="PAD_T"
              :width="(1000 - PAD_R) - boundaryX"
              :height="CHART_H - PAD_T - PAD_B"
              fill="rgba(246,248,251,0.65)"
            />

            <!-- Confidence band -->
            <path :d="bandPath" fill="rgba(1,219,241,0.14)" />

            <!-- Naive baseline -->
            <path
              :d="naivePath"
              fill="none"
              stroke="rgba(71,85,105,0.55)"
              stroke-width="1.4"
              stroke-dasharray="4 4"
            />

            <!-- History -->
            <path
              :d="historyPath"
              fill="none"
              stroke="#0A0F1A"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
            />

            <!-- Forecast median -->
            <path
              :d="forecastPath"
              fill="none"
              stroke="#00B8CC"
              stroke-width="2.4"
              stroke-linejoin="round"
              stroke-linecap="round"
            />

            <!-- Boundary line -->
            <line
              :x1="boundaryX"
              :x2="boundaryX"
              :y1="PAD_T"
              :y2="CHART_H - PAD_B"
              stroke="rgba(15,23,42,0.22)"
              stroke-width="1.2"
              stroke-dasharray="3 3"
            />
            <text
              :x="boundaryX + 6"
              :y="PAD_T + 12"
              font-size="10.5"
              font-weight="600"
              fill="rgba(71,85,105,0.95)"
              font-family="Inter, sans-serif"
            >
              Now
            </text>

            <!-- X tick labels -->
            <text
              v-for="t in xTicks"
              :key="`xl${t.x}`"
              :x="t.x"
              :y="CHART_H - 12"
              text-anchor="middle"
              font-size="11"
              fill="rgba(71,85,105,0.95)"
              font-family="Inter, sans-serif"
            >
              {{ t.label }}
            </text>
          </svg>

          <div
            class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-mute"
          >
            <span class="inline-flex items-center gap-1.5">
              <span class="h-[2px] w-5 bg-ink rounded" />
              History
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="h-[2px] w-5 bg-cyan-brand-deep rounded" />
              Forecast (median)
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="h-2 w-5 rounded-sm bg-cyan-brand/20 ring-1 ring-cyan-brand/30" />
              Confidence band
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="forecasting-legend-dash w-5" />
              Naive baseline (12-wk avg)
            </span>
          </div>
        </div>

        <!-- Accuracy ribbon -->
        <div
          class="mt-4 md:mt-5 rounded-2xl bg-surface-alt/60 border border-line px-4 py-3 md:px-5 md:py-4"
        >
          <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div class="min-w-0">
              <div
                class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
              >
                Holdout accuracy · last 12 weeks
              </div>
              <div class="mt-1 text-[13.5px] text-mute leading-[1.5] max-w-md">
                System forecast vs naive 12-week trailing average — measured on the same window.
              </div>
            </div>
            <div class="w-full sm:w-auto sm:ml-auto flex flex-wrap items-end gap-4 md:gap-6">
              <div>
                <div
                  class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2"
                >
                  System
                </div>
                <div
                  class="mt-1 font-display text-[26px] leading-none text-ink tabular-nums"
                >
                  {{ activeUseCase.mape.forecast.toFixed(1)
                  }}<span
                    class="text-[14px] text-mute font-sans font-semibold ml-0.5"
                    >%</span
                  >
                </div>
                <div
                  class="mt-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2"
                >
                  MAPE
                </div>
              </div>
              <div class="opacity-90">
                <div
                  class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2"
                >
                  Naive
                </div>
                <div
                  class="mt-1 font-display text-[26px] leading-none text-mute tabular-nums"
                >
                  {{ activeUseCase.mape.naive.toFixed(1)
                  }}<span
                    class="text-[14px] text-mute font-sans font-semibold ml-0.5"
                    >%</span
                  >
                </div>
                <div
                  class="mt-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2"
                >
                  MAPE
                </div>
              </div>
              <div
                class="rounded-xl bg-cyan-brand/10 ring-1 ring-cyan-brand/25 px-3 py-2"
              >
                <div
                  class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep"
                >
                  Delta
                </div>
                <div
                  class="mt-1 font-display text-[26px] leading-none text-cyan-brand-deep tabular-nums"
                >
                  −{{ (activeUseCase.mape.naive - activeUseCase.mape.forecast).toFixed(1)
                  }}<span class="text-[14px] font-sans font-semibold ml-0.5">pp</span>
                </div>
                <div
                  class="mt-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep"
                >
                  Better
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: drivers -->
      <aside class="p-4 md:p-7 bg-surface-alt/40 lg:bg-transparent">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div
              class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
            >
              Drivers
            </div>
            <div class="mt-1 font-display text-[19px] leading-tight text-ink">
              Move the inputs the model uses
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2"
          >
            <span class="dot" />
            Live
          </span>
        </div>

        <div class="mt-4 space-y-3.5">
          <div
            v-for="def in activeUseCase.driverDefs"
            :key="def.id"
            class="rounded-xl border border-line bg-white p-3.5"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-[13px] font-semibold text-ink">
                {{ def.label }}
              </span>
              <span class="text-[12px] text-mute-2 tabular-nums truncate ml-2">
                {{ driverValueLabel(def, drivers[def.id]) }}
              </span>
            </div>

            <template v-if="def.shape.type === 'slider'">
              <input
                type="range"
                :min="def.shape.min"
                :max="def.shape.max"
                :step="def.shape.step"
                :value="drivers[def.id]"
                :aria-label="def.label"
                class="forecast-slider mt-3 w-full"
                @input="
                  setDriver(
                    def.id,
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
              <div
                class="mt-1 flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2"
              >
                <span>{{ def.shape.minLabel }}</span>
                <span>{{ def.shape.maxLabel }}</span>
              </div>
            </template>

            <button
              v-else-if="def.shape.type === 'toggle'"
              type="button"
              :aria-pressed="drivers[def.id] === 1"
              class="mt-3 inline-flex items-stretch rounded-full border border-line bg-surface-alt p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="setDriver(def.id, drivers[def.id] === 1 ? 0 : 1)"
            >
              <span
                :class="[
                  'inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-semibold transition-colors',
                  drivers[def.id] === 0
                    ? 'bg-ink text-white'
                    : 'text-mute-2',
                ]"
              >
                {{ def.shape.offLabel }}
              </span>
              <span
                :class="[
                  'inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-semibold transition-colors',
                  drivers[def.id] === 1
                    ? 'bg-ink text-white'
                    : 'text-mute-2',
                ]"
              >
                {{ def.shape.onLabel }}
              </span>
            </button>

            <div
              v-else-if="def.shape.type === 'select'"
              class="mt-3 flex flex-wrap gap-1.5"
              role="radiogroup"
              :aria-label="def.label"
            >
              <button
                v-for="o in def.shape.options"
                :key="o.value"
                type="button"
                role="radio"
                :aria-checked="drivers[def.id] === o.value"
                :class="[
                  'rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                  drivers[def.id] === o.value
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-mute hover:text-ink border-line hover:border-cyan-brand/40',
                ]"
                @click="setDriver(def.id, o.value)"
              >
                {{ o.label }}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Recommendations + destinations -->
    <div class="border-t border-line p-4 md:p-7">
      <div class="flex items-end justify-between gap-3 mb-4">
        <div>
          <div
            class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
          >
            Recommendations
          </div>
          <div class="mt-1 font-display text-[20px] leading-tight text-ink">
            Drop them where the team already works
          </div>
        </div>
        <span
          class="hidden sm:inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2"
        >
          Pushed from the forecast above
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <div
          v-for="rec in recommendations"
          :key="rec.id"
          class="relative flex flex-col gap-4"
        >
          <!-- Recommendation card -->
          <div
            class="rounded-2xl border border-line bg-white p-4 md:p-5 flex flex-col gap-3 h-full"
          >
            <div class="flex items-start gap-3">
              <span
                class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0"
                aria-hidden="true"
              >
                <component :is="rec.icon" :size="18" :stroke-width="1.9" />
              </span>
              <div class="min-w-0">
                <div
                  class="text-[15.5px] font-semibold leading-[1.35] text-ink"
                >
                  {{ rec.text }}
                </div>
                <div
                  class="mt-1.5 text-[12.5px] text-mute leading-[1.5]"
                >
                  {{ rec.reason }}
                </div>
              </div>
            </div>

            <button
              type="button"
              :disabled="recState(rec).status === 'flying'"
              :class="[
                'mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                recState(rec).status === 'landed'
                  ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/30'
                  : 'bg-ink text-white hover:bg-ink-soft',
                'disabled:opacity-70 disabled:cursor-progress',
              ]"
              @click="pushRec(rec)"
            >
              <template v-if="recState(rec).status === 'landed'">
                <CheckCircle2 :size="14" :stroke-width="2.2" aria-hidden="true" />
                Sent · {{ recState(rec).ts }}
              </template>
              <template v-else>
                <Send :size="14" :stroke-width="2" aria-hidden="true" />
                {{ rec.destination.buttonLabel }}
              </template>
            </button>
          </div>

          <!-- Destination dock chip -->
          <div
            :class="[
              'relative rounded-xl bg-white p-3 transition-colors duration-300',
              recState(rec).status === 'landed' || recState(rec).status === 'flying'
                ? 'border border-cyan-brand/40 ring-1 ring-cyan-brand/15'
                : 'border border-dashed border-line',
            ]"
          >
            <div class="flex items-center gap-2.5">
              <span
                :class="[
                  'inline-flex items-center justify-center h-8 w-8 rounded-lg ring-1 transition-colors',
                  recState(rec).status === 'landed' ||
                  recState(rec).status === 'flying'
                    ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-cyan-brand/30'
                    : 'bg-surface-alt text-mute-2 ring-line',
                ]"
                aria-hidden="true"
              >
                <component
                  :is="rec.destination.icon"
                  :size="14"
                  :stroke-width="2"
                />
              </span>
              <div class="min-w-0 flex-1">
                <div
                  class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2"
                >
                  Destination
                </div>
                <div
                  class="text-[13px] font-semibold text-ink leading-tight truncate"
                >
                  {{ rec.destination.label }}
                </div>
              </div>
              <span
                v-if="recState(rec).status === 'landed'"
                class="inline-flex items-center gap-0.5 text-[11px] font-semibold text-cyan-brand-deep shrink-0"
              >
                <CheckCircle2 :size="11" :stroke-width="2.4" aria-hidden="true" />
                landed
              </span>
            </div>

            <!-- Landed artefact -->
            <div
              v-if="recState(rec).status === 'landed'"
              class="mt-2.5 rounded-lg bg-cyan-brand/8 ring-1 ring-cyan-brand/20 px-2.5 py-2 flex items-center gap-2"
            >
              <FileText
                :size="13"
                :stroke-width="2"
                class="text-cyan-brand-deep shrink-0"
                aria-hidden="true"
              />
              <span class="text-[12px] font-semibold text-ink truncate">
                {{ rec.destination.artefactName }}
              </span>
              <span class="ml-auto text-[11px] text-mute tabular-nums shrink-0">
                {{ recState(rec).ts }}
              </span>
            </div>

            <!-- Flying artefact -->
            <div
              v-if="recState(rec).status === 'flying'"
              class="forecasting-artefact pointer-events-none absolute left-1/2 top-0 z-10"
              aria-hidden="true"
            >
              <div
                class="rounded-lg bg-white ring-1 ring-cyan-brand/45 shadow-[0_14px_30px_-14px_rgba(1,219,241,0.55)] px-2.5 py-1.5 flex items-center gap-1.5 whitespace-nowrap"
              >
                <FileText
                  :size="13"
                  :stroke-width="2"
                  class="text-cyan-brand-deep"
                />
                <span class="text-[12px] font-semibold text-ink">
                  {{ rec.destination.artefactName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forecasting-artefact {
  animation: forecasting-fly 720ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes forecasting-fly {
  0% {
    opacity: 0;
    transform: translate(-50%, -132%) scale(0.85);
  }
  18% {
    opacity: 1;
    transform: translate(-50%, -118%) scale(1);
  }
  85% {
    opacity: 1;
    transform: translate(-50%, -22%) scale(0.96);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, 4%) scale(0.78);
  }
}

.forecasting-legend-dash {
  display: inline-block;
  height: 0;
  border-top: 1.5px dashed rgba(71, 85, 105, 0.7);
}

.forecast-slider {
  -webkit-appearance: none;
  appearance: none;
  background: #e2e8f0;
  height: 4px;
  border-radius: 9999px;
  outline: none;
  cursor: pointer;
}
.forecast-slider:focus-visible {
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.22);
}
.forecast-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #0a0f1a;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.22);
  cursor: pointer;
  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}
.forecast-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}
.forecast-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #0a0f1a;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.22);
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .forecasting-artefact {
    animation: none;
    opacity: 0;
  }
  .forecast-slider::-webkit-slider-thumb {
    transition: none;
  }
}
</style>
