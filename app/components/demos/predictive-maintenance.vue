<script setup lang="ts">
import { computed, h, onUnmounted, ref, watch } from 'vue'
import { Activity, AlertTriangle, ArrowRight, Calendar, CheckCircle2, ClipboardList, Cog, Fan, FlaskConical, Gauge, Package, Play, RefreshCcw, ScrollText, Snowflake, Truck, User2, Waves, X, Zap } from '@lucide/vue'

type AssetClassId = 'gearbox' | 'motor' | 'refrigeration' | 'hvac' | 'fleet'
type AssetStatus = 'green' | 'amber' | 'red'
type ChannelDirection = 'up' | 'down'

interface SensorChannel {
  id: string
  label: string
  unit: string
  baseline: number
  softThreshold: number
  hardThreshold: number
  noise: number
  direction: ChannelDirection
  decimals?: number
}

interface OilMetal {
  id: string
  label: string
  baseline: number
  softAt: number
  hardAt: number
  unit: string
}

interface AssetClassConfig {
  id: AssetClassId
  label: string
  short: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  prefix: string
  unit: string
  failureMode: string
  partName: string
  partLeadDays: string
  techRole: string
  techName: string
  spareLocation: string
  workOrderPrefix: string
  costPerDay: number
  lostProdPerDay: number
  interventionCost: number
  interventionHours: number
  downtimeWindow: string
  channels: SensorChannel[]
  oil: OilMetal[]
  contexts: string[]
}

interface AssetProfile {
  id: string
  classId: AssetClassId
  name: string
  criticality: number
  ageYears: number
  runHours: number
  healthScore: number
  status: AssetStatus
  dtf: number
  dtfLow: number
  dtfHigh: number
  severity: Record<string, number>
  oilSeverity: Record<string, number>
  topConcern: string
  daysSinceFlagged: number
}

// ---------------------------------------------------------------------------
// Seeded RNG (FNV-1a + Mulberry-32-ish). Deterministic per asset.
// ---------------------------------------------------------------------------
function seededRandom(seedStr: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Asset class catalogue
// ---------------------------------------------------------------------------

const CLASSES: AssetClassConfig[] = [
  {
    id: 'gearbox',
    label: 'Gearbox',
    short: 'Gearbox',
    icon: Cog,
    prefix: 'GBX',
    unit: 'gearbox',
    failureMode: 'Bearing race spalling · gear-tooth pitting',
    partName: 'Replacement bearing kit + planetary stage',
    partLeadDays: '5–12 days',
    techRole: 'Senior reliability fitter',
    techName: 'D. Mahlangu',
    spareLocation: 'Bay 3 — Plant Spares',
    workOrderPrefix: 'WO-MIN',
    costPerDay: 145000,
    lostProdPerDay: 92000,
    interventionCost: 14200,
    interventionHours: 6,
    downtimeWindow: 'Sun 22:00 → Mon 04:00 (planned maintenance shift)',
    channels: [
      { id: 'vibration', label: 'Overall vibration', unit: 'mm/s', baseline: 2.4, softThreshold: 6.0, hardThreshold: 11.2, noise: 0.18, direction: 'up', decimals: 2 },
      { id: 'harmonic',  label: 'BPFI harmonic',    unit: 'g',    baseline: 0.18, softThreshold: 0.55, hardThreshold: 0.95, noise: 0.025, direction: 'up', decimals: 2 },
      { id: 'temp',      label: 'Casing temperature', unit: '°C', baseline: 62,  softThreshold: 84,  hardThreshold: 96,  noise: 1.2, direction: 'up', decimals: 0 },
    ],
    oil: [
      { id: 'iron',     label: 'Iron',     baseline: 18, softAt: 70,  hardAt: 130, unit: 'ppm' },
      { id: 'copper',   label: 'Copper',   baseline: 4,  softAt: 22,  hardAt: 45,  unit: 'ppm' },
      { id: 'viscosity',label: 'Viscosity', baseline: 220, softAt: 188, hardAt: 165, unit: 'cSt' },
    ],
    contexts: [
      'Mill 1 main drive','Mill 2 main drive','Mill 3 main drive','Mill 4 main drive',
      'Primary crusher A','Primary crusher B','Secondary crusher A','Secondary crusher B',
      'SAG mill pinion','SAG mill girth gear','Ball mill A','Ball mill B',
      'Apron feeder 1','Apron feeder 2','Apron feeder 3',
      'Stacker reclaimer','Stacker boom drive','Reclaimer slew',
      'Conveyor C-101 head','Conveyor C-102 head','Conveyor C-103 head',
      'Conveyor C-104 head','Conveyor C-105 head','Conveyor C-201 head',
      'Conveyor C-202 head','Conveyor C-203 head','Conveyor C-204 head',
      'Overland C-301','Overland C-302',
      'Filter press drive','Thickener rake drive','Thickener bridge drive',
      'Ore screen drive 1','Ore screen drive 2',
      'Tailings pump gearbox A','Tailings pump gearbox B',
      'Concentrator bin reclaim','Loader-out drive',
      'Cyclone underflow drive','Truck dump apron drive',
    ],
  },
  {
    id: 'motor',
    label: 'Drive motor',
    short: 'Motor',
    icon: Zap,
    prefix: 'MOT',
    unit: 'motor',
    failureMode: 'Stator winding insulation · bearing wear',
    partName: 'Rewind + bearing replacement kit',
    partLeadDays: '3–7 days',
    techRole: 'Electrical reliability tech',
    techName: 'J. Pillay',
    spareLocation: 'Motor store — Workshop 2',
    workOrderPrefix: 'WO-MOT',
    costPerDay: 48000,
    lostProdPerDay: 31000,
    interventionCost: 5800,
    interventionHours: 4,
    downtimeWindow: 'Sat 18:00 → Sat 23:00 (weekend window)',
    channels: [
      { id: 'vibration', label: 'NDE vibration',    unit: 'mm/s', baseline: 1.8, softThreshold: 4.5, hardThreshold: 8.0, noise: 0.16, direction: 'up', decimals: 2 },
      { id: 'winding',   label: 'Winding temp',     unit: '°C',   baseline: 78,  softThreshold: 118, hardThreshold: 145, noise: 1.4, direction: 'up', decimals: 0 },
      { id: 'current',   label: 'Current draw',     unit: 'A',    baseline: 142, softThreshold: 168, hardThreshold: 188, noise: 2.2, direction: 'up', decimals: 0 },
    ],
    oil: [
      { id: 'pd',        label: 'Partial discharge', baseline: 35, softAt: 220, hardAt: 480, unit: 'pC' },
      { id: 'ir',        label: 'Insulation resistance', baseline: 1200, softAt: 480, hardAt: 200, unit: 'MΩ' },
    ],
    contexts: [
      'SAG mill drive A','SAG mill drive B','Ball mill drive A','Ball mill drive B',
      'Primary crusher motor','Secondary crusher motor 1','Secondary crusher motor 2',
      'Pump house P-1','Pump house P-2','Pump house P-3','Pump house P-4',
      'Pump house P-5','Pump house P-6','Pump house P-7','Pump house P-8',
      'Tailings pump motor A','Tailings pump motor B','Tailings pump motor C',
      'Lube oil motor 1','Lube oil motor 2','Lube oil motor 3',
      'Slurry pump M-201','Slurry pump M-202','Slurry pump M-203',
      'Vent fan motor 1','Vent fan motor 2','Vent fan motor 3','Vent fan motor 4',
      'Booster fan motor A','Booster fan motor B',
      'Filter press motor 1','Filter press motor 2',
      'Conveyor C-101 motor','Conveyor C-102 motor','Conveyor C-201 motor',
      'Conveyor C-301 motor','Conveyor C-302 motor',
      'Stacker drive motor','Reclaimer drive motor',
      'Thickener rake motor','Screen drive motor',
    ],
  },
  {
    id: 'refrigeration',
    label: 'Refrigeration',
    short: 'Refrig',
    icon: Snowflake,
    prefix: 'REF',
    unit: 'compressor',
    failureMode: 'Compressor valve leakage · refrigerant migration',
    partName: 'Replacement screw compressor + valve plate kit',
    partLeadDays: '2–5 days',
    techRole: 'Refrigeration technician',
    techName: 'A. van der Walt',
    spareLocation: 'Cold-side store — Yard 4',
    workOrderPrefix: 'WO-CRF',
    costPerDay: 32000,
    lostProdPerDay: 22000,
    interventionCost: 4200,
    interventionHours: 5,
    downtimeWindow: 'Tue 02:00 → Tue 07:00 (low-demand window)',
    channels: [
      { id: 'superheat', label: 'Suction superheat', unit: 'K',    baseline: 6.5, softThreshold: 11.5, hardThreshold: 16.0, noise: 0.25, direction: 'up', decimals: 1 },
      { id: 'disc',      label: 'Discharge temp',    unit: '°C',   baseline: 78,  softThreshold: 102, hardThreshold: 118, noise: 1.0, direction: 'up', decimals: 0 },
      { id: 'suction',   label: 'Suction pressure',  unit: 'bar',  baseline: 2.2, softThreshold: 1.55, hardThreshold: 1.2,  noise: 0.04, direction: 'down', decimals: 2 },
    ],
    oil: [
      { id: 'acid',     label: 'Oil acidity',     baseline: 0.04, softAt: 0.18, hardAt: 0.32, unit: 'mgKOH/g' },
      { id: 'moisture', label: 'Moisture',        baseline: 22,   softAt: 90,   hardAt: 165,  unit: 'ppm' },
    ],
    contexts: [
      'Cold chamber A1','Cold chamber A2','Cold chamber A3','Cold chamber A4',
      'Cold chamber B1','Cold chamber B2','Cold chamber B3','Cold chamber B4',
      'Freezer F-1','Freezer F-2','Freezer F-3','Freezer F-4','Freezer F-5',
      'Freezer F-6','Freezer F-7','Freezer F-8',
      'Blast cell 1','Blast cell 2','Blast cell 3','Blast cell 4',
      'Anteroom chiller 1','Anteroom chiller 2','Anteroom chiller 3',
      'Dock door curtain 1','Dock door curtain 2','Dock door curtain 3',
      'Process chiller PC-1','Process chiller PC-2','Process chiller PC-3',
      'Glycol loop GL-A','Glycol loop GL-B','Glycol loop GL-C',
      'Spiral freezer','IQF tunnel 1','IQF tunnel 2',
      'Coldroom retail 1','Coldroom retail 2','Coldroom retail 3',
      'Plate freezer P-1','Plate freezer P-2',
    ],
  },
  {
    id: 'hvac',
    label: 'HVAC',
    short: 'HVAC',
    icon: Fan,
    prefix: 'HVAC',
    unit: 'unit',
    failureMode: 'Fan bearing wear · coil fouling',
    partName: 'Fan bearing + drive belt kit',
    partLeadDays: '1–3 days',
    techRole: 'Facilities technician',
    techName: 'S. Naidoo',
    spareLocation: 'Facilities store — Plant room L2',
    workOrderPrefix: 'WO-FAC',
    costPerDay: 9500,
    lostProdPerDay: 4200,
    interventionCost: 2400,
    interventionHours: 3,
    downtimeWindow: 'After-hours · 19:00 → 22:00 (no occupants)',
    channels: [
      { id: 'fanvib', label: 'Fan vibration',  unit: 'mm/s', baseline: 1.2, softThreshold: 3.2, hardThreshold: 5.6, noise: 0.12, direction: 'up', decimals: 2 },
      { id: 'dp',     label: 'Filter ΔP',      unit: 'Pa',   baseline: 95,  softThreshold: 240, hardThreshold: 360, noise: 6, direction: 'up', decimals: 0 },
      { id: 'supply', label: 'Supply air temp', unit: '°C',  baseline: 14,  softThreshold: 18.5, hardThreshold: 21,  noise: 0.3, direction: 'up', decimals: 1 },
    ],
    oil: [
      { id: 'belt',  label: 'Belt slip',       baseline: 0.6, softAt: 3.5, hardAt: 6.8, unit: '%' },
      { id: 'coil',  label: 'Coil fouling',    baseline: 5,   softAt: 35,  hardAt: 62,  unit: '%' },
    ],
    contexts: [
      'RTU-1 South wing','RTU-2 South wing','RTU-3 South wing','RTU-4 South wing',
      'RTU-5 North wing','RTU-6 North wing','RTU-7 North wing','RTU-8 North wing',
      'AHU-1 Atrium','AHU-2 Atrium','AHU-3 Atrium','AHU-4 Atrium',
      'AHU-5 Server','AHU-6 Server','AHU-7 Server','AHU-8 Server',
      'Exhaust fan EF-101','Exhaust fan EF-102','Exhaust fan EF-103','Exhaust fan EF-104',
      'Make-up air MUA-1','Make-up air MUA-2','Make-up air MUA-3',
      'Cooling tower CT-1','Cooling tower CT-2','Cooling tower CT-3',
      'Chiller CH-1','Chiller CH-2','Chiller CH-3',
      'Boiler B-1','Boiler B-2','Boiler B-3',
      'VAV box VB-201','VAV box VB-202','VAV box VB-203','VAV box VB-204',
      'Pump P-401','Pump P-402','Pump P-403',
    ],
  },
  {
    id: 'fleet',
    label: 'Fleet vehicle',
    short: 'Fleet',
    icon: Truck,
    prefix: 'FLT',
    unit: 'vehicle',
    failureMode: 'Engine bearing wear · transmission slip',
    partName: 'Engine oil service + bearing inspection kit',
    partLeadDays: 'Same-day',
    techRole: 'Workshop foreman',
    techName: 'R. Botha',
    spareLocation: 'Workshop B — line 2',
    workOrderPrefix: 'WO-FLT',
    costPerDay: 2600,
    lostProdPerDay: 1400,
    interventionCost: 780,
    interventionHours: 2,
    downtimeWindow: 'Tomorrow 06:00 → 08:00 (pre-shift)',
    channels: [
      { id: 'engvib', label: 'Engine vibration', unit: 'mm/s', baseline: 1.6, softThreshold: 3.8, hardThreshold: 6.4, noise: 0.14, direction: 'up', decimals: 2 },
      { id: 'oilpr',  label: 'Oil pressure',     unit: 'kPa',  baseline: 380, softThreshold: 260, hardThreshold: 180, noise: 8,    direction: 'down', decimals: 0 },
      { id: 'coolant',label: 'Coolant temp',     unit: '°C',   baseline: 88,  softThreshold: 102, hardThreshold: 112, noise: 0.8,  direction: 'up',   decimals: 0 },
    ],
    oil: [
      { id: 'iron',     label: 'Iron',          baseline: 14, softAt: 55,  hardAt: 110, unit: 'ppm' },
      { id: 'soot',     label: 'Soot',          baseline: 0.2, softAt: 1.6, hardAt: 3.4, unit: '%' },
    ],
    contexts: [
      'Haul truck T-101','Haul truck T-102','Haul truck T-103','Haul truck T-104',
      'Haul truck T-105','Haul truck T-106','Haul truck T-107','Haul truck T-108',
      'Haul truck T-109','Haul truck T-110','Haul truck T-111','Haul truck T-112',
      'Haul truck T-113','Haul truck T-114','Haul truck T-115','Haul truck T-116',
      'Service rig SR-201','Service rig SR-202','Service rig SR-203',
      'Water cart W-301','Water cart W-302','Water cart W-303',
      'Fuel bowser FB-401','Fuel bowser FB-402',
      'Light vehicle LV-501','Light vehicle LV-502','Light vehicle LV-503',
      'Light vehicle LV-504','Light vehicle LV-505','Light vehicle LV-506',
      'Grader G-701','Grader G-702',
      'Dozer D-801','Dozer D-802','Dozer D-803',
      'Loader L-901','Loader L-902','Loader L-903',
      'Excavator EX-001','Excavator EX-002',
    ],
  },
]

const CLASS_BY_ID = Object.fromEntries(CLASSES.map((c) => [c.id, c])) as Record<AssetClassId, AssetClassConfig>

// ---------------------------------------------------------------------------
// Asset profile generation
// ---------------------------------------------------------------------------

// The seed string for an asset combines the class and index — deterministic
// across reloads but distinct per asset.
function buildAsset(cls: AssetClassConfig, index: number): AssetProfile {
  const id = `${cls.prefix}-${(index + 1).toString().padStart(3, '0')}`
  const rng = seededRandom(`${cls.id}:${id}`)

  // Bias the distribution: ~62% green, ~26% amber, ~12% red.
  const r = rng()
  let healthScore: number
  if (r < 0.62) {
    healthScore = 70 + Math.floor(rng() * 28) // 70..97
  } else if (r < 0.88) {
    healthScore = 38 + Math.floor(rng() * 26) // 38..63
  } else {
    healthScore = 10 + Math.floor(rng() * 25) // 10..34
  }

  const status: AssetStatus =
    healthScore >= 65 ? 'green' : healthScore >= 35 ? 'amber' : 'red'

  // DTF maps health → days-to-failure. Healthy ≈ 240+ days, red ≈ 4–18 days.
  const dtf =
    status === 'red'
      ? Math.round(4 + (healthScore - 10) * 0.55)
      : status === 'amber'
        ? Math.round(22 + (healthScore - 35) * 4.2)
        : Math.round(180 + (healthScore - 65) * 5)

  // Confidence band — tightens with severity (the worse it gets, the better
  // the model knows what's coming).
  const bandWidth =
    status === 'red' ? 0.25 : status === 'amber' ? 0.35 : 0.55
  const dtfLow = Math.max(1, Math.round(dtf * (1 - bandWidth)))
  const dtfHigh = Math.round(dtf * (1 + bandWidth))

  // Severity per channel: green = ~0.05–0.20, amber = 0.35–0.7, red = 0.7–0.95.
  // Distribute across channels so one channel usually leads.
  const severity: Record<string, number> = {}
  const channels = cls.channels
  const leadIdx = Math.floor(rng() * channels.length)
  channels.forEach((ch, i) => {
    const base =
      status === 'red'
        ? 0.7 + rng() * 0.25
        : status === 'amber'
          ? 0.35 + rng() * 0.35
          : 0.05 + rng() * 0.15
    const lead = i === leadIdx ? base : base * (0.55 + rng() * 0.35)
    severity[ch.id] = Math.min(0.98, lead)
  })

  // Oil-analysis severity scales with the worst channel severity but lags.
  const worstSev = Math.max(...Object.values(severity))
  const oilSeverity: Record<string, number> = {}
  cls.oil.forEach((m) => {
    oilSeverity[m.id] = Math.max(
      0.02,
      Math.min(0.96, worstSev * (0.55 + rng() * 0.35)),
    )
  })

  const topChannel = channels[leadIdx]!
  const topConcern =
    status === 'green'
      ? 'All channels within healthy band'
      : `${topChannel.label} trending ${topChannel.direction === 'up' ? 'upward' : 'downward'}`

  const daysSinceFlagged =
    status === 'red' ? 18 + Math.floor(rng() * 14) :
    status === 'amber' ? 4 + Math.floor(rng() * 12) :
    0

  const contextName = cls.contexts[index % cls.contexts.length]!

  return {
    id,
    classId: cls.id,
    name: contextName,
    criticality: 1 + Math.floor(rng() * 5),
    ageYears: Math.round((2 + rng() * 16) * 10) / 10,
    runHours: Math.round(800 + rng() * 70000),
    healthScore,
    status,
    dtf,
    dtfLow,
    dtfHigh,
    severity,
    oilSeverity,
    topConcern,
    daysSinceFlagged,
  }
}

// Build a fixed fleet of 40 per class once (computed lazily per class as needed).
function buildFleet(cls: AssetClassConfig): AssetProfile[] {
  return Array.from({ length: 40 }, (_, i) => buildAsset(cls, i))
}

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

const activeClassId = ref<AssetClassId>('gearbox')

// Cached fleets per class so toggling is instant after first visit.
const fleetCache: Record<AssetClassId, AssetProfile[] | null> = {
  gearbox: null, motor: null, refrigeration: null, hvac: null, fleet: null,
}
function getFleet(cls: AssetClassId): AssetProfile[] {
  let f = fleetCache[cls]
  if (!f) {
    f = buildFleet(CLASS_BY_ID[cls])
    fleetCache[cls] = f
  }
  return f
}

const activeClass = computed(() => CLASS_BY_ID[activeClassId.value])
const fleet = computed(() => getFleet(activeClassId.value))

type SortKey = 'health' | 'dtf' | 'criticality' | 'id'
type StatusFilter = 'all' | 'amber-red' | 'red'

const sortKey = ref<SortKey>('health')
const statusFilter = ref<StatusFilter>('all')

const selectedId = ref<string | null>(null)

const visibleFleet = computed(() => {
  const f = fleet.value.filter((a) => {
    if (statusFilter.value === 'red') return a.status === 'red'
    if (statusFilter.value === 'amber-red') return a.status !== 'green'
    return true
  })
  const sorted = f.slice().sort((a, b) => {
    if (sortKey.value === 'health') return a.healthScore - b.healthScore
    if (sortKey.value === 'dtf') return a.dtf - b.dtf
    if (sortKey.value === 'criticality') return b.criticality - a.criticality
    return a.id.localeCompare(b.id)
  })
  return sorted
})

const fleetStats = computed(() => {
  const f = fleet.value
  const red = f.filter((a) => a.status === 'red').length
  const amber = f.filter((a) => a.status === 'amber').length
  const green = f.length - red - amber
  return { total: f.length, green, amber, red }
})

const selected = computed(() =>
  selectedId.value ? fleet.value.find((a) => a.id === selectedId.value) ?? null : null,
)

watch(activeClassId, () => {
  // Reset selection and replay state on class change.
  selectedId.value = null
  replayDay.value = 90
  resetIntervention()
  doNothingState.value = 'idle'
  doNothingProgress.value = 0
})

// ---------------------------------------------------------------------------
// Telemetry generation (per selected asset, 90-day series, lazy)
// ---------------------------------------------------------------------------

interface SignalSeries {
  channel: SensorChannel
  // Array of 90 daily readings.
  values: number[]
  // Day index (0..89) when the value first reached the soft threshold (or null).
  softFlagDay: number | null
  hardFlagDay: number | null
  // Final reading (today).
  current: number
}

interface OilSample {
  day: number
  values: Record<string, number>
  flags: string[] // ids of metals that crossed soft threshold this sample
}

function generateSignal(asset: AssetProfile, ch: SensorChannel): SignalSeries {
  const rng = seededRandom(`${asset.classId}:${asset.id}:${ch.id}`)
  const sev = asset.severity[ch.id] ?? 0
  const values: number[] = []
  const range = ch.hardThreshold - ch.baseline
  for (let d = 0; d < 90; d++) {
    const t = d / 89
    // Failure trajectory: exponential ramp gated by severity.
    const ramp = sev * Math.pow(t, 1.7)
    // Adds a small uplift in the last 14 days for severe assets.
    const lateRamp = sev > 0.55 ? sev * Math.max(0, (t - 0.7)) * 0.8 : 0
    const noiseAmp = ch.noise * (0.8 + (rng() - 0.5) * 0.3)
    const trend = (ramp + lateRamp) * range
    const raw = ch.baseline + trend + (rng() - 0.5) * 2 * noiseAmp
    values.push(raw)
  }
  let softFlagDay: number | null = null
  let hardFlagDay: number | null = null
  for (let d = 0; d < 90; d++) {
    const v = values[d]!
    const crossedSoft =
      ch.direction === 'up' ? v >= ch.softThreshold : v <= ch.softThreshold
    const crossedHard =
      ch.direction === 'up' ? v >= ch.hardThreshold : v <= ch.hardThreshold
    if (softFlagDay === null && crossedSoft) softFlagDay = d
    if (hardFlagDay === null && crossedHard) hardFlagDay = d
  }
  return { channel: ch, values, softFlagDay, hardFlagDay, current: values[89]! }
}

function generateOil(asset: AssetProfile, cls: AssetClassConfig): OilSample[] {
  const samples: OilSample[] = []
  const rng = seededRandom(`${asset.classId}:${asset.id}:oil`)
  // Sample roughly every 14 days.
  for (let d = 7; d < 90; d += 14) {
    const t = d / 89
    const values: Record<string, number> = {}
    const flags: string[] = []
    for (const m of cls.oil) {
      const sev = asset.oilSeverity[m.id] ?? 0
      const ramp = sev * Math.pow(t, 1.4)
      const range = m.hardAt - m.baseline
      const v = m.baseline + ramp * range + (rng() - 0.5) * Math.abs(range) * 0.05
      values[m.id] = v
      const flagged =
        m.hardAt > m.baseline ? v >= m.softAt : v <= m.softAt
      if (flagged) flags.push(m.id)
    }
    samples.push({ day: d, values, flags })
  }
  return samples
}

const telemetry = computed(() => {
  if (!selected.value) return null
  const a = selected.value
  const cls = CLASS_BY_ID[a.classId]
  const signals = cls.channels.map((ch) => generateSignal(a, ch))
  const oil = generateOil(a, cls)
  return { signals, oil }
})

// ---------------------------------------------------------------------------
// 90-day replay
// ---------------------------------------------------------------------------
// `replayDay` = 0..90 where 90 = "today". Scrubbing left moves backwards.
const replayDay = ref(90)

const replayFlags = computed(() => {
  const t = telemetry.value
  if (!t) return [] as { day: number; label: string; tone: 'soft' | 'hard' }[]
  const arr: { day: number; label: string; tone: 'soft' | 'hard' }[] = []
  for (const s of t.signals) {
    if (s.softFlagDay !== null && s.softFlagDay <= replayDay.value) {
      arr.push({ day: s.softFlagDay, label: `${s.channel.label} crossed soft threshold`, tone: 'soft' })
    }
    if (s.hardFlagDay !== null && s.hardFlagDay <= replayDay.value) {
      arr.push({ day: s.hardFlagDay, label: `${s.channel.label} crossed hard threshold`, tone: 'hard' })
    }
  }
  for (const s of t.oil) {
    if (s.day <= replayDay.value && s.flags.length) {
      const cls = activeClass.value
      const labels = s.flags
        .map((id) => cls.oil.find((m) => m.id === id)?.label)
        .filter(Boolean)
        .join(', ')
      arr.push({ day: s.day, label: `Oil sample flagged: ${labels}`, tone: 'soft' })
    }
  }
  return arr.sort((a, b) => a.day - b.day)
})

// ---------------------------------------------------------------------------
// Intervention auto-schedule
// ---------------------------------------------------------------------------

type InterventionStep = 'analyze' | 'parts' | 'tech' | 'window' | 'order' | 'done'

interface InterventionEvent {
  step: InterventionStep
  label: string
  detail: string
}

const interventionTimeline = ref<InterventionEvent[]>([])
const interventionRunning = ref(false)
const interventionDone = ref(false)
const workOrderId = ref<string | null>(null)

const timeouts: number[] = []
function later(fn: () => void, ms: number) {
  const t = window.setTimeout(fn, ms) as unknown as number
  timeouts.push(t)
}
onUnmounted(() => {
  for (const t of timeouts) clearTimeout(t)
})

function resetIntervention() {
  interventionTimeline.value = []
  interventionRunning.value = false
  interventionDone.value = false
  workOrderId.value = null
}

function runIntervention() {
  if (interventionRunning.value || !selected.value) return
  const a = selected.value
  const cls = CLASS_BY_ID[a.classId]
  resetIntervention()
  interventionRunning.value = true

  const push = (ev: InterventionEvent) => {
    interventionTimeline.value = [...interventionTimeline.value, ev]
  }

  push({
    step: 'analyze',
    label: 'Model fired',
    detail: `Per-asset signature for ${a.id} matched degradation pattern · confidence ${Math.round(60 + a.severity[cls.channels[0]!.id]! * 35)}%`,
  })
  later(() => {
    push({
      step: 'parts',
      label: 'Parts reserved',
      detail: `${cls.partName} · ${cls.spareLocation} · lead ${cls.partLeadDays}`,
    })
  }, 600)
  later(() => {
    push({
      step: 'tech',
      label: 'Technician notified',
      detail: `${cls.techName} · ${cls.techRole} · acknowledged 00:00:03 ago`,
    })
  }, 1200)
  later(() => {
    push({
      step: 'window',
      label: 'Downtime window proposed',
      detail: cls.downtimeWindow,
    })
  }, 1800)
  later(() => {
    const id = `${cls.workOrderPrefix}-${Math.floor(40000 + Math.random() * 9000)}`
    workOrderId.value = id
    push({
      step: 'order',
      label: 'Work order opened',
      detail: `${id} · linked to ${a.id} · est. ${cls.interventionHours}h on-site`,
    })
  }, 2400)
  later(() => {
    push({
      step: 'done',
      label: 'Schedule confirmed',
      detail: 'Production calendar updated · cost variance posted to maintenance budget',
    })
    interventionRunning.value = false
    interventionDone.value = true
  }, 3000)
}

// ---------------------------------------------------------------------------
// Do-nothing simulator
// ---------------------------------------------------------------------------

type DoNothingState = 'idle' | 'running' | 'done'
const doNothingState = ref<DoNothingState>('idle')
const doNothingProgress = ref(0) // 0..1 across the predicted DTF window
let doNothingTimer: number | null = null

const doNothingCost = computed(() => {
  if (!selected.value) return 0
  const cls = CLASS_BY_ID[selected.value.classId]
  // After breakdown, assume 1.4 days of unplanned downtime + 1.4 days lost prod.
  const days = 1.4 * doNothingProgress.value * (doNothingProgress.value >= 0.999 ? 1 : 0.6)
  return Math.round((cls.costPerDay + cls.lostProdPerDay) * days)
})

const doNothingDays = computed(() => {
  if (!selected.value) return 0
  return Math.round(selected.value.dtf * (1 - doNothingProgress.value))
})

function runDoNothing() {
  if (!selected.value || doNothingState.value === 'running') return
  doNothingState.value = 'running'
  doNothingProgress.value = 0
  const start = performance.now()
  const total = 3200 // ms to play out the full DTF window
  const tick = () => {
    const elapsed = performance.now() - start
    doNothingProgress.value = Math.min(1, elapsed / total)
    if (doNothingProgress.value < 1) {
      doNothingTimer = requestAnimationFrame(tick) as unknown as number
    } else {
      doNothingState.value = 'done'
    }
  }
  doNothingTimer = requestAnimationFrame(tick) as unknown as number
}

function resetDoNothing() {
  if (doNothingTimer !== null) cancelAnimationFrame(doNothingTimer)
  doNothingState.value = 'idle'
  doNothingProgress.value = 0
}

onUnmounted(() => {
  if (doNothingTimer !== null) cancelAnimationFrame(doNothingTimer)
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_META: Record<AssetStatus, { label: string; chip: string; dot: string; text: string }> = {
  green: { label: 'Healthy',   chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200',  dot: 'bg-emerald-500', text: 'text-emerald-700' },
  amber: { label: 'Watch',     chip: 'bg-amber-50 text-amber-700 ring-amber-200',          dot: 'bg-amber-500',   text: 'text-amber-700' },
  red:   { label: 'Critical',  chip: 'bg-red-50 text-red-700 ring-red-200',                dot: 'bg-red-500',     text: 'text-red-700' },
}

function formatChannelValue(ch: SensorChannel, v: number): string {
  const d = ch.decimals ?? 1
  return v.toFixed(d) + ' ' + ch.unit
}

function formatMetal(m: OilMetal, v: number): string {
  if (m.unit === '%' || m.unit === 'mgKOH/g') return v.toFixed(2) + ' ' + m.unit
  if (m.unit === 'ppm' || m.unit === 'MΩ' || m.unit === 'pC') return Math.round(v).toString() + ' ' + m.unit
  return v.toFixed(1) + ' ' + m.unit
}

function fmtMoney(n: number): string {
  if (n >= 1000) return '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return '$' + n.toString()
}

function fmtMoneyFull(n: number): string {
  return '$' + Math.round(n).toLocaleString()
}

function selectAsset(a: AssetProfile) {
  if (a.status === 'green') return
  selectedId.value = a.id
  replayDay.value = 90
  resetIntervention()
  resetDoNothing()
}

function clearSelection() {
  selectedId.value = null
  resetIntervention()
  resetDoNothing()
}

function resetAll() {
  selectedId.value = null
  statusFilter.value = 'all'
  sortKey.value = 'health'
  replayDay.value = 90
  resetIntervention()
  resetDoNothing()
}

// ---------------------------------------------------------------------------
// SVG line-path builder
// ---------------------------------------------------------------------------
function pathFromValues(
  vals: number[],
  min: number,
  max: number,
  upToDay: number,
  width = 100,
  height = 100,
): string {
  if (!vals.length) return ''
  const stop = Math.max(1, Math.min(vals.length, upToDay + 1))
  const span = Math.max(0.0001, max - min)
  const stepX = width / (vals.length - 1)
  let d = ''
  for (let i = 0; i < stop; i++) {
    const x = i * stepX
    const y = height - ((vals[i]! - min) / span) * height
    d += (i === 0 ? 'M ' : ' L ') + x.toFixed(2) + ' ' + y.toFixed(2)
  }
  return d
}

function channelRange(ch: SensorChannel, vals: number[]): { min: number; max: number } {
  const lo = Math.min(ch.baseline, ch.hardThreshold, ch.softThreshold, ...vals)
  const hi = Math.max(ch.baseline, ch.hardThreshold, ch.softThreshold, ...vals)
  const pad = (hi - lo) * 0.1 || 1
  return { min: lo - pad, max: hi + pad }
}

function yForValue(v: number, min: number, max: number, height = 100): number {
  const span = Math.max(0.0001, max - min)
  return height - ((v - min) / span) * height
}

</script>

<template>
  <div class="bg-white">
    <!-- =============================================================== -->
    <!-- Header                                                           -->
    <!-- =============================================================== -->
    <div class="border-b border-line px-5 md:px-7 py-5 flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <span
          class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
          aria-hidden="true"
        >
          <Gauge :size="18" :stroke-width="1.9" />
        </span>
        <div class="min-w-0">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold leading-none">
            Live demo
          </div>
          <div class="mt-1 font-display text-[20px] md:text-[22px] leading-tight text-ink truncate">
            Predictive Maintenance — {{ activeClass.label }} fleet
          </div>
        </div>
      </div>

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Asset class"
          class="inline-flex items-center rounded-full border border-line bg-surface-alt p-1"
        >
          <button
            v-for="c in CLASSES"
            :key="c.id"
            role="tab"
            type="button"
            :aria-selected="c.id === activeClassId"
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
              c.id === activeClassId
                ? 'bg-white text-ink shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                : 'text-mute-2 hover:text-ink',
            ]"
            @click="activeClassId = c.id"
          >
            <component :is="c.icon" :size="13" :stroke-width="2" aria-hidden="true" />
            {{ c.short }}
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

    <!-- =============================================================== -->
    <!-- Stats banner                                                     -->
    <!-- =============================================================== -->
    <div class="border-b border-line bg-surface-alt/50 px-5 md:px-7 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div>
        <div class="text-[10.5px] uppercase tracking-[0.2em] text-mute-2 font-semibold">Fleet</div>
        <div class="mt-1 font-display text-[24px] leading-none text-ink tabular-nums">
          {{ fleetStats.total }}<span class="ml-1 text-[14px] text-mute font-sans">{{ activeClass.unit }}s</span>
        </div>
      </div>
      <div>
        <div class="text-[10.5px] uppercase tracking-[0.2em] text-emerald-700 font-semibold">Healthy</div>
        <div class="mt-1 font-display text-[24px] leading-none text-ink tabular-nums">
          {{ fleetStats.green }}
        </div>
      </div>
      <div>
        <div class="text-[10.5px] uppercase tracking-[0.2em] text-amber-700 font-semibold">Watch</div>
        <div class="mt-1 font-display text-[24px] leading-none text-ink tabular-nums">
          {{ fleetStats.amber }}
        </div>
      </div>
      <div>
        <div class="text-[10.5px] uppercase tracking-[0.2em] text-red-700 font-semibold">Critical</div>
        <div class="mt-1 font-display text-[24px] leading-none text-ink tabular-nums">
          {{ fleetStats.red }}
        </div>
      </div>
    </div>

    <!-- =============================================================== -->
    <!-- Main grid: fleet list + detail                                   -->
    <!-- =============================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-0 lg:divide-x lg:divide-line">
      <!-- LEFT: fleet list -->
      <div class="p-5 md:p-7">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              Fleet dashboard
            </div>
            <div class="mt-1 font-display text-[19px] leading-tight text-ink">
              Sortable health view · click any flagged asset
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div
              role="radiogroup"
              aria-label="Filter by status"
              class="inline-flex items-center rounded-full border border-line bg-surface-alt p-1"
            >
              <button
                v-for="f in [
                  { id: 'all' as const, label: 'All' },
                  { id: 'amber-red' as const, label: 'Watch + Critical' },
                  { id: 'red' as const, label: 'Critical only' },
                ]"
                :key="f.id"
                type="button"
                role="radio"
                :aria-checked="statusFilter === f.id"
                :class="[
                  'rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                  statusFilter === f.id
                    ? 'bg-white text-ink shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                    : 'text-mute-2 hover:text-ink',
                ]"
                @click="statusFilter = f.id"
              >
                {{ f.label }}
              </button>
            </div>

            <label class="inline-flex items-center gap-2 text-[12px] text-mute-2 font-semibold uppercase tracking-[0.18em]">
              Sort
              <select
                v-model="sortKey"
                class="rounded-lg border border-line bg-white px-2 py-1 text-[12.5px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 normal-case tracking-normal"
              >
                <option value="health">Worst health</option>
                <option value="dtf">Soonest failure</option>
                <option value="criticality">Highest criticality</option>
                <option value="id">Asset ID</option>
              </select>
            </label>
          </div>
        </div>

        <!-- List header -->
        <div class="hidden md:grid grid-cols-[auto_72px_1fr_64px_60px_72px] gap-3 px-3 py-2 text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
          <span class="w-2"></span>
          <span>Asset</span>
          <span>Name · concern</span>
          <span class="text-right">Health</span>
          <span class="text-right">DTF</span>
          <span class="text-right">Crit.</span>
        </div>

        <ol
          class="max-h-[640px] overflow-y-auto pr-1 rounded-xl ring-1 ring-line bg-white divide-y divide-line"
          role="listbox"
          aria-label="Fleet assets"
        >
          <li
            v-for="a in visibleFleet"
            :key="a.id"
            role="option"
            :aria-selected="selectedId === a.id"
          >
            <button
              type="button"
              :disabled="a.status === 'green'"
              :class="[
                'w-full grid grid-cols-[auto_72px_1fr_56px] md:grid-cols-[auto_72px_1fr_64px_60px_72px] gap-3 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                selectedId === a.id
                  ? 'bg-cyan-brand/8'
                  : a.status === 'green'
                    ? 'cursor-default'
                    : 'hover:bg-surface-alt cursor-pointer',
              ]"
              @click="selectAsset(a)"
            >
              <span
                :class="['inline-block w-2 h-2 mt-2 rounded-full', STATUS_META[a.status].dot]"
                aria-hidden="true"
              />
              <span class="font-mono text-[12.5px] font-semibold text-ink tabular-nums truncate">
                {{ a.id }}
              </span>
              <span class="min-w-0">
                <span class="block text-[13.5px] text-ink truncate font-medium">{{ a.name }}</span>
                <span class="hidden md:block text-[11.5px] text-mute truncate">{{ a.topConcern }}</span>
              </span>
              <span
                :class="['hidden md:block text-right text-[13px] tabular-nums font-semibold', STATUS_META[a.status].text]"
              >
                {{ a.healthScore }}
              </span>
              <span class="text-right text-[13px] tabular-nums text-ink">
                <template v-if="a.status === 'green'"><span class="text-mute-2">—</span></template>
                <template v-else>{{ a.dtf }}d</template>
              </span>
              <span class="hidden md:block text-right text-[12px] tabular-nums text-mute">
                C{{ a.criticality }}
              </span>
            </button>
          </li>

          <li v-if="!visibleFleet.length" class="p-6 text-center text-[13px] text-mute">
            No assets match this filter.
          </li>
        </ol>

        <p class="mt-3 text-[12px] text-mute">
          Healthy assets are not clickable. Tap a <span class="text-amber-700 font-semibold">Watch</span> or <span class="text-red-700 font-semibold">Critical</span> asset to open its detail panel.
        </p>
      </div>

      <!-- RIGHT: selected asset detail -->
      <div class="p-5 md:p-7 bg-surface-alt/30 lg:bg-transparent">
        <!-- Empty state -->
        <div
          v-if="!selected"
          class="h-full min-h-[420px] flex items-center justify-center text-center"
        >
          <div class="max-w-sm">
            <span
              class="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white border border-line text-cyan-brand-deep mb-4"
              aria-hidden="true"
            >
              <Activity :size="20" :stroke-width="1.8" />
            </span>
            <div class="font-display text-[22px] text-ink leading-[1.2]">
              Select a flagged asset.
            </div>
            <p class="mt-2 text-[13.5px] text-mute">
              Pick any amber or red asset from the list to see its sensor traces, the auto-scheduled intervention, and the cost of doing nothing.
            </p>
          </div>
        </div>

        <!-- Selected -->
        <div v-else class="space-y-6">
          <!-- Asset header -->
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span
                  :class="['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold ring-1', STATUS_META[selected.status].chip]"
                >
                  <span :class="['inline-block w-1.5 h-1.5 rounded-full', STATUS_META[selected.status].dot]" />
                  {{ STATUS_META[selected.status].label }}
                </span>
                <span class="text-[11.5px] tabular-nums text-mute-2">
                  C{{ selected.criticality }} · {{ selected.ageYears }}y · {{ selected.runHours.toLocaleString() }} run hrs
                </span>
              </div>
              <div class="mt-2 font-mono text-[13px] font-semibold text-mute tabular-nums">{{ selected.id }}</div>
              <div class="mt-0.5 font-display text-[24px] leading-tight text-ink">{{ selected.name }}</div>
              <div class="mt-1 text-[12.5px] text-mute-2">{{ selected.topConcern }} · flagged {{ selected.daysSinceFlagged }} day{{ selected.daysSinceFlagged === 1 ? '' : 's' }} ago</div>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-line bg-white text-mute hover:text-ink hover:border-cyan-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              aria-label="Close asset detail"
              @click="clearSelection"
            >
              <X :size="14" :stroke-width="2" />
            </button>
          </div>

          <!-- DTF + confidence band -->
          <div class="rounded-2xl border border-line bg-white p-5">
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
                Days to failure · model prediction
              </div>
              <span class="text-[11px] text-mute-2 tabular-nums">
                Confidence band {{ Math.round((1 - (selected.dtfHigh - selected.dtfLow) / (selected.dtfHigh + 1)) * 100) }}%
              </span>
            </div>

            <div class="flex items-end gap-4">
              <div>
                <div class="font-display text-[44px] leading-none text-ink tabular-nums">{{ selected.dtf }}</div>
                <div class="text-[11.5px] text-mute mt-1">predicted days</div>
              </div>
              <div class="flex-1">
                <!-- Band visual -->
                <div class="relative h-3 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    class="absolute top-0 bottom-0 bg-cyan-brand/30"
                    :style="{
                      left: ((selected.dtfLow / 270) * 100).toFixed(1) + '%',
                      width: (((selected.dtfHigh - selected.dtfLow) / 270) * 100).toFixed(1) + '%',
                    }"
                  />
                  <div
                    class="absolute top-0 bottom-0 w-[3px] bg-cyan-brand-deep"
                    :style="{ left: ((selected.dtf / 270) * 100).toFixed(1) + '%' }"
                  />
                </div>
                <div class="mt-2 flex items-center justify-between text-[11px] tabular-nums text-mute-2">
                  <span>{{ selected.dtfLow }}d (P10)</span>
                  <span>{{ selected.dtf }}d (predicted)</span>
                  <span>{{ selected.dtfHigh }}d (P90)</span>
                </div>
              </div>
            </div>
            <div class="mt-3 text-[12.5px] text-mute">
              Failure mode: <span class="text-ink">{{ activeClass.failureMode }}</span>
            </div>
          </div>

          <!-- Sensor traces -->
          <div class="rounded-2xl border border-line bg-white p-5">
            <div class="flex items-center justify-between mb-1">
              <div>
                <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
                  Sensor traces
                </div>
                <div class="mt-1 font-display text-[18px] leading-tight text-ink">
                  90-day rolling window
                </div>
              </div>
              <span class="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                <span class="dot" />
                streaming
              </span>
            </div>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="s in telemetry?.signals ?? []"
                :key="s.channel.id"
                class="rounded-xl border border-line bg-surface-alt/40 p-3"
              >
                <div class="flex items-baseline justify-between gap-2">
                  <span class="text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2">{{ s.channel.label }}</span>
                  <span
                    :class="[
                      'text-[13px] tabular-nums font-semibold',
                      (s.channel.direction === 'up' ? s.current >= s.channel.softThreshold : s.current <= s.channel.softThreshold)
                        ? (s.channel.direction === 'up' ? s.current >= s.channel.hardThreshold : s.current <= s.channel.hardThreshold)
                          ? 'text-red-700'
                          : 'text-amber-700'
                        : 'text-ink',
                    ]"
                  >
                    {{ formatChannelValue(s.channel, s.current) }}
                  </span>
                </div>

                <svg
                  viewBox="0 0 100 50"
                  preserveAspectRatio="none"
                  class="mt-2 w-full h-[64px]"
                  aria-hidden="true"
                >
                  <!-- Hard threshold line -->
                  <line
                    :x1="0"
                    :x2="100"
                    :y1="yForValue(s.channel.hardThreshold, channelRange(s.channel, s.values).min, channelRange(s.channel, s.values).max, 50)"
                    :y2="yForValue(s.channel.hardThreshold, channelRange(s.channel, s.values).min, channelRange(s.channel, s.values).max, 50)"
                    stroke="#dc2626"
                    stroke-width="0.5"
                    stroke-dasharray="1.5 1.5"
                    vector-effect="non-scaling-stroke"
                  />
                  <!-- Soft threshold line -->
                  <line
                    :x1="0"
                    :x2="100"
                    :y1="yForValue(s.channel.softThreshold, channelRange(s.channel, s.values).min, channelRange(s.channel, s.values).max, 50)"
                    :y2="yForValue(s.channel.softThreshold, channelRange(s.channel, s.values).min, channelRange(s.channel, s.values).max, 50)"
                    stroke="#d97706"
                    stroke-width="0.5"
                    stroke-dasharray="1.5 1.5"
                    vector-effect="non-scaling-stroke"
                  />
                  <!-- Series -->
                  <path
                    :d="pathFromValues(s.values, channelRange(s.channel, s.values).min, channelRange(s.channel, s.values).max, replayDay, 100, 50)"
                    fill="none"
                    stroke="#00B8CC"
                    stroke-width="1.4"
                    vector-effect="non-scaling-stroke"
                    stroke-linejoin="round"
                  />
                </svg>

                <div class="mt-1 flex items-center justify-between text-[10px] text-mute-2 tabular-nums">
                  <span>-90d</span>
                  <span v-if="s.softFlagDay !== null && s.softFlagDay <= replayDay" class="text-amber-700 font-semibold">
                    flag @ -{{ 89 - s.softFlagDay }}d
                  </span>
                  <span>today</span>
                </div>
              </div>
            </div>

            <!-- Oil analysis history -->
            <div class="mt-5 rounded-xl border border-line bg-surface-alt/40 p-3">
              <div class="flex items-center gap-2 mb-2">
                <FlaskConical :size="13" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
                <span class="text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2">Oil / condition samples</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-[12.5px] border-separate border-spacing-0">
                  <thead>
                    <tr class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                      <th class="text-left py-1.5 pr-3">Day</th>
                      <th
                        v-for="m in activeClass.oil"
                        :key="m.id"
                        class="text-right py-1.5 pr-3"
                      >
                        {{ m.label }}
                      </th>
                      <th class="text-left py-1.5 pr-3">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="s in (telemetry?.oil ?? []).filter((sample) => sample.day <= replayDay)"
                      :key="s.day"
                      class="bg-white"
                    >
                      <td class="border-t border-line py-1.5 pr-3 tabular-nums text-mute">-{{ 89 - s.day }}d</td>
                      <td
                        v-for="m in activeClass.oil"
                        :key="m.id"
                        :class="[
                          'border-t border-line py-1.5 pr-3 text-right tabular-nums',
                          s.flags.includes(m.id) ? 'text-amber-700 font-semibold' : 'text-ink',
                        ]"
                      >
                        {{ formatMetal(m, s.values[m.id] ?? 0) }}
                      </td>
                      <td class="border-t border-line py-1.5 pr-3 text-mute">
                        <span v-if="s.flags.length" class="inline-flex items-center gap-1 text-amber-700">
                          <AlertTriangle :size="11" :stroke-width="2.2" />
                          {{ s.flags.length }}
                        </span>
                        <span v-else class="text-mute-2">clean</span>
                      </td>
                    </tr>
                    <tr v-if="!(telemetry?.oil ?? []).some((s) => s.day <= replayDay)">
                      <td :colspan="activeClass.oil.length + 2" class="py-2 text-center text-mute-2 text-[12px] border-t border-line">
                        Scrub the timeline forward to see the first sample at day -{{ 89 - 7 }}.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =============================================================== -->
    <!-- Replay timeline (only when an asset is selected)                 -->
    <!-- =============================================================== -->
    <div
      v-if="selected"
      class="border-t border-line bg-white p-5 md:p-7"
    >
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            Historical replay · 90 days
          </div>
          <div class="mt-1 font-display text-[20px] leading-tight text-ink">
            Watch each flag emerge before the simulated failure point
          </div>
        </div>
        <div class="flex items-center gap-2 text-[12px] text-mute tabular-nums">
          <span>Showing through</span>
          <span class="text-ink font-semibold">
            <template v-if="replayDay >= 89">Today</template>
            <template v-else>-{{ 89 - replayDay }} days</template>
          </span>
        </div>
      </div>

      <!-- Timeline track -->
      <div class="relative pt-7 pb-3">
        <!-- Flag pins -->
        <div class="absolute inset-x-0 top-0 h-6 pointer-events-none">
          <span
            v-for="(f, i) in replayFlags"
            :key="i + '-' + f.day"
            :class="[
              'absolute -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 whitespace-nowrap',
              f.tone === 'hard'
                ? 'bg-red-50 text-red-700 ring-red-200'
                : 'bg-amber-50 text-amber-700 ring-amber-200',
            ]"
            :style="{ left: ((f.day / 89) * 100).toFixed(1) + '%' }"
            :title="f.label"
          >
            <AlertTriangle :size="9" :stroke-width="2.4" aria-hidden="true" />
            -{{ 89 - f.day }}d
          </span>
        </div>

        <input
          v-model.number="replayDay"
          type="range"
          min="0"
          max="90"
          step="1"
          class="w-full accent-cyan-brand-deep cursor-pointer"
          aria-label="Replay through 90-day history"
        />
        <div class="mt-1 flex items-center justify-between text-[10.5px] text-mute-2 tabular-nums">
          <span>-90d</span>
          <span>-60d</span>
          <span>-30d</span>
          <span>today</span>
        </div>
      </div>

      <ol v-if="replayFlags.length" class="mt-4 space-y-2">
        <li
          v-for="(f, i) in replayFlags"
          :key="i + '-' + f.day + '-row'"
          class="rounded-xl border border-line bg-white p-3 flex flex-wrap items-center gap-3"
        >
          <span class="text-[12px] tabular-nums text-mute-2 w-[68px]">
            day -{{ 89 - f.day }}
          </span>
          <span
            :class="[
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold ring-1',
              f.tone === 'hard'
                ? 'bg-red-50 text-red-700 ring-red-200'
                : 'bg-amber-50 text-amber-700 ring-amber-200',
            ]"
          >
            {{ f.tone === 'hard' ? 'Hard' : 'Soft' }} flag
          </span>
          <span class="text-[13px] text-ink flex-1 min-w-0">{{ f.label }}</span>
        </li>
      </ol>
      <p v-else class="mt-3 rounded-xl border border-dashed border-line bg-surface-alt/60 p-5 text-center text-[13px] text-mute">
        Drag the scrubber forward — flags will surface as soon as the model would have raised them.
      </p>
    </div>

    <!-- =============================================================== -->
    <!-- Intervention + Do-nothing (side-by-side, when selected)          -->
    <!-- =============================================================== -->
    <div
      v-if="selected"
      class="border-t border-line bg-surface-alt/40 p-5 md:p-7 grid grid-cols-1 lg:grid-cols-2 gap-5"
    >
      <!-- Auto-scheduled intervention -->
      <section class="rounded-2xl border border-line bg-white p-5 md:p-6">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              Auto-scheduled intervention
            </div>
            <div class="mt-1 font-display text-[20px] leading-tight text-ink">
              What the system books before the breakdown
            </div>
          </div>
          <button
            type="button"
            :disabled="interventionRunning"
            :class="[
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
              interventionRunning
                ? 'bg-surface-alt text-mute cursor-not-allowed'
                : interventionDone
                  ? 'border border-line bg-white text-ink hover:border-cyan-brand/40'
                  : 'bg-ink text-white hover:bg-ink-soft',
            ]"
            @click="runIntervention"
          >
            <component :is="interventionDone ? RefreshCcw : Play" :size="13" :stroke-width="2" aria-hidden="true" />
            {{ interventionDone ? 'Re-run' : interventionRunning ? 'Running' : 'Auto-schedule' }}
          </button>
        </div>

        <ol v-if="interventionTimeline.length" class="mt-5 space-y-2">
          <li
            v-for="(ev, i) in interventionTimeline"
            :key="i"
            class="rounded-xl border border-line bg-surface-alt/40 p-3 flex items-start gap-3"
          >
            <span
              :class="[
                'mt-0.5 inline-flex items-center justify-center h-7 w-7 rounded-lg ring-1 shrink-0',
                ev.step === 'done'
                  ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                  : 'bg-white text-cyan-brand-deep ring-line',
              ]"
              aria-hidden="true"
            >
              <component
                :is="
                  ev.step === 'analyze' ? Activity
                  : ev.step === 'parts' ? Package
                  : ev.step === 'tech' ? User2
                  : ev.step === 'window' ? Calendar
                  : ev.step === 'order' ? ClipboardList
                  : CheckCircle2
                "
                :size="14"
                :stroke-width="2"
              />
            </span>
            <div class="min-w-0">
              <div class="text-[13px] font-semibold text-ink">{{ ev.label }}</div>
              <div class="mt-0.5 text-[12.5px] text-mute">{{ ev.detail }}</div>
            </div>
          </li>
        </ol>
        <p v-else class="mt-5 rounded-xl border border-dashed border-line bg-surface-alt/60 p-5 text-center text-[13px] text-mute">
          Press <span class="font-semibold text-ink">Auto-schedule</span> to watch the system reserve parts, notify a technician, propose a downtime window and open a work order.
        </p>

        <div
          v-if="interventionDone && workOrderId"
          class="mt-5 rounded-xl border border-cyan-brand/30 bg-cyan-brand/8 p-4 flex flex-wrap items-center gap-3"
        >
          <span class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white text-cyan-brand-deep ring-1 ring-cyan-brand/25" aria-hidden="true">
            <ScrollText :size="16" :stroke-width="1.9" />
          </span>
          <div class="min-w-0">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              Work order
            </div>
            <div class="mt-0.5 font-mono text-[14px] font-semibold text-ink tabular-nums">{{ workOrderId }}</div>
          </div>
          <span class="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-cyan-brand-deep">
            Linked to {{ selected.id }}
            <ArrowRight :size="12" :stroke-width="2" />
          </span>
        </div>
      </section>

      <!-- Do-nothing simulator -->
      <section class="rounded-2xl border border-line bg-white p-5 md:p-6">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-red-700 font-semibold">
              Cost of doing nothing
            </div>
            <div class="mt-1 font-display text-[20px] leading-tight text-ink">
              Play out the breakdown · compare with intervention
            </div>
          </div>
          <button
            type="button"
            :disabled="doNothingState === 'running'"
            :class="[
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
              doNothingState === 'running'
                ? 'bg-surface-alt text-mute cursor-not-allowed'
                : doNothingState === 'done'
                  ? 'border border-line bg-white text-ink hover:border-cyan-brand/40'
                  : 'bg-ink text-white hover:bg-ink-soft',
            ]"
            @click="doNothingState === 'done' ? resetDoNothing() : runDoNothing()"
          >
            <component :is="doNothingState === 'done' ? RefreshCcw : Play" :size="13" :stroke-width="2" aria-hidden="true" />
            {{ doNothingState === 'done' ? 'Reset' : doNothingState === 'running' ? 'Running' : 'Simulate' }}
          </button>
        </div>

        <!-- Countdown bar -->
        <div class="mt-5">
          <div class="flex items-baseline justify-between text-[12px] text-mute">
            <span>Days remaining</span>
            <span class="text-ink font-semibold tabular-nums">{{ doNothingDays }}d</span>
          </div>
          <div class="mt-1 h-2 rounded-full bg-surface-alt overflow-hidden">
            <div
              class="h-full bg-red-500 transition-[width] duration-150 ease-linear"
              :style="{ width: (doNothingProgress * 100).toFixed(1) + '%' }"
            />
          </div>
        </div>

        <!-- Cost callout -->
        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-xl border border-red-100 bg-red-50/60 p-4">
            <div class="text-[10.5px] uppercase tracking-[0.2em] text-red-700 font-semibold">
              Unplanned downtime
            </div>
            <div
              :class="[
                'mt-1 font-display text-[22px] md:text-[28px] leading-none tabular-nums transition-colors break-words',
                doNothingState === 'done' ? 'text-red-700' : 'text-ink',
              ]"
            >
              {{ fmtMoneyFull(doNothingCost) }}
            </div>
            <div class="mt-2 text-[11.5px] text-mute">
              {{ fmtMoney(activeClass.costPerDay) }}/day downtime + {{ fmtMoney(activeClass.lostProdPerDay) }}/day lost production
            </div>
          </div>
          <div class="rounded-xl border border-cyan-brand/25 bg-cyan-brand/8 p-4">
            <div class="text-[10.5px] uppercase tracking-[0.2em] text-cyan-brand-deep font-semibold">
              Early intervention
            </div>
            <div class="mt-1 font-display text-[22px] md:text-[28px] leading-none tabular-nums text-ink break-words">
              {{ fmtMoneyFull(activeClass.interventionCost) }}
            </div>
            <div class="mt-2 text-[11.5px] text-mute">
              Parts + {{ activeClass.interventionHours }}h on-site, booked into the planned window above
            </div>
          </div>
        </div>

        <!-- Verdict -->
        <div
          v-if="doNothingState === 'done'"
          class="mt-5 rounded-xl border border-line bg-surface-alt/50 p-4 flex flex-wrap items-center gap-3"
        >
          <span class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white text-cyan-brand-deep ring-1 ring-cyan-brand/25" aria-hidden="true">
            <Waves :size="16" :stroke-width="1.9" />
          </span>
          <div class="text-[13.5px] text-ink min-w-0">
            <span class="font-semibold">{{ Math.max(1, Math.round(doNothingCost / activeClass.interventionCost)) }}×</span>
            the cost of the planned repair. The signals were in the trace from day -{{ replayFlags.length ? (89 - replayFlags[0]!.day) : 30 }}.
          </div>
        </div>
        <p v-else class="mt-5 text-[12.5px] text-mute">
          Press <span class="text-ink font-semibold">Simulate</span> to play out the failure timeline and watch the downtime cost ratchet up against the planned intervention.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Make the native range thumb feel a touch more on-brand. */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  height: 24px;
}
input[type='range']::-webkit-slider-runnable-track {
  height: 4px;
  background: var(--color-line);
  border-radius: 9999px;
}
input[type='range']::-moz-range-track {
  height: 4px;
  background: var(--color-line);
  border-radius: 9999px;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: -6px;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: var(--color-cyan-brand-deep);
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.18);
  border: 2px solid #fff;
  cursor: pointer;
}
input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: var(--color-cyan-brand-deep);
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.18);
  border: 2px solid #fff;
  cursor: pointer;
}
</style>
