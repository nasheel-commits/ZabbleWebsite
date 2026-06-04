<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { AlertTriangle, ArrowRight, Boxes, Check, Clock, CreditCard, FileText, Hourglass, Landmark, Play, RotateCcw, ShoppingCart, Sparkles, Wand2 } from '@lucide/vue'

type Scenario = 'bank' | 'pos' | 'processor'
type Reason = 'fee' | 'timing' | 'partial' | 'missing-a' | 'missing-b'
type Status =
  | 'pending'
  | 'matched'
  | 'partial'
  | 'exception'
  | 'resolved-auto'
  | 'resolved-manual'

interface Row {
  id: string
  side: 'A' | 'B'
  date: string
  desc: string
  amount: number
  unit?: string
  outcome: 'match' | 'partial' | 'exception'
  partnerIds: string[]
  reason?: Reason
  reasonLabel?: string
  patternLabel?: string
  status: Status
  justResolved?: boolean
}

interface ScenarioConfig {
  key: Scenario
  label: string
  shortLabel: string
  leftLabel: string
  rightLabel: string
  leftIcon: Component
  rightIcon: Component
  totalLeft: number
  totalRight: number
  units: 'currency' | 'qty'
  autoMatchedTotal: number
  partialTotal: number
  exceptionsTotal: number
  manualHours: number
  systemMinutes: number
  build: () => { left: Row[]; right: Row[] }
}

// ============================================================================
// Scenario data
// ============================================================================
//
// Each scenario pre-bakes the outcome for every visible row. The "run" only
// reveals those outcomes in waves; the truth was always there.

const bankScenario: ScenarioConfig = {
  key: 'bank',
  label: 'Bank vs Accounting',
  shortLabel: 'Bank',
  leftLabel: 'Accounting (POS register)',
  rightLabel: 'Bank deposits',
  leftIcon: ShoppingCart,
  rightIcon: Landmark,
  totalLeft: 10000,
  totalRight: 9830,
  units: 'currency',
  autoMatchedTotal: 9712,
  partialTotal: 102,
  exceptionsTotal: 16,
  manualHours: 32,
  systemMinutes: 14,
  build: () => {
    const left: Row[] = [
      r('ACT-2271', 'A', 'Mon 13', 'Card sale, register 2', 50.0,  'exception', ['BNK-9420'], 'fee', 'Fee delta, likely processor fee', 'Processor fee · 2.9% + $0.30'),
      r('ACT-2272', 'A', 'Mon 13', 'Card sale, register 1', 24.5,  'match', ['BNK-9421']),
      r('ACT-2273', 'A', 'Mon 13', 'Card sale, register 3', 78.2,  'match', ['BNK-9422']),
      r('ACT-2274', 'A', 'Mon 13', 'Card sale, register 1', 152.0, 'exception', ['BNK-9423'], 'fee', 'Fee delta, likely processor fee', 'Processor fee · 2.9% + $0.30'),
      r('ACT-2275', 'A', 'Mon 13', 'Card sale, register 2', 33.6,  'match', ['BNK-9424']),
      r('ACT-2276', 'A', 'Tue 14', 'Card sale, register 3', 17.4,  'match', ['BNK-9427']),
      r('ACT-2277', 'A', 'Tue 14', 'Card sale, register 1', 25.0,  'exception', ['BNK-9426'], 'fee', 'Fee delta, likely processor fee', 'Processor fee · 2.9% + $0.30'),
      r('ACT-2278', 'A', 'Tue 14', 'Card sale, register 2', 99.5,  'partial', ['BNK-9428', 'BNK-9429'], undefined, 'Split deposit, combined to match'),
      r('ACT-2279', 'A', 'Wed 15', 'Card sale, register 3', 41.2,  'match', ['BNK-9430']),
      r('ACT-2280', 'A', 'Wed 15', 'Card sale, register 1', 312.0, 'exception', ['BNK-9425'], 'timing', 'Timing gap, bank posted day earlier'),
      r('ACT-2281', 'A', 'Wed 15', 'Card sale, register 2', 88.0,  'match', ['BNK-9431']),
      r('ACT-2282', 'A', 'Wed 15', 'Card sale, register 3', 60.0,  'match', ['BNK-9432']),
      r('ACT-2283', 'A', 'Thu 16', 'Card sale, register 1', 250.0, 'exception', [], 'missing-b', 'No bank deposit found yet'),
      r('ACT-2284', 'A', 'Thu 16', 'Card sale, register 2', 14.99, 'match', ['BNK-9433']),
    ]
    const right: Row[] = [
      r('BNK-9420', 'B', 'Mon 13', 'Card processor deposit', 48.30,  'exception', ['ACT-2271'], 'fee', 'Fee delta, likely processor fee', 'Processor fee · 2.9% + $0.30'),
      r('BNK-9421', 'B', 'Mon 13', 'Card processor deposit', 24.5,   'match', ['ACT-2272']),
      r('BNK-9422', 'B', 'Mon 13', 'Card processor deposit', 78.2,   'match', ['ACT-2273']),
      r('BNK-9423', 'B', 'Mon 13', 'Card processor deposit', 147.29, 'exception', ['ACT-2274'], 'fee', 'Fee delta, likely processor fee', 'Processor fee · 2.9% + $0.30'),
      r('BNK-9424', 'B', 'Mon 13', 'Card processor deposit', 33.6,   'match', ['ACT-2275']),
      r('BNK-9425', 'B', 'Tue 14', 'Card processor deposit', 312.0,  'exception', ['ACT-2280'], 'timing', 'Timing gap, POS recorded day later'),
      r('BNK-9426', 'B', 'Tue 14', 'Card processor deposit', 23.98,  'exception', ['ACT-2277'], 'fee', 'Fee delta, likely processor fee', 'Processor fee · 2.9% + $0.30'),
      r('BNK-9427', 'B', 'Tue 14', 'Card processor deposit', 17.4,   'match', ['ACT-2276']),
      r('BNK-9428', 'B', 'Tue 14', 'Card processor deposit', 49.5,   'partial', ['ACT-2278'], undefined, 'Combined with BNK-9429 to match ACT-2278'),
      r('BNK-9429', 'B', 'Tue 14', 'Card processor deposit', 50.0,   'partial', ['ACT-2278'], undefined, 'Combined with BNK-9428 to match ACT-2278'),
      r('BNK-9430', 'B', 'Wed 15', 'Card processor deposit', 41.2,   'match', ['ACT-2279']),
      r('BNK-9431', 'B', 'Wed 15', 'Card processor deposit', 88.0,   'match', ['ACT-2281']),
      r('BNK-9432', 'B', 'Wed 15', 'Card processor deposit', 60.0,   'match', ['ACT-2282']),
      r('BNK-9433', 'B', 'Thu 16', 'Card processor deposit', 14.99,  'match', ['ACT-2284']),
    ]
    return { left, right }
  },
}

const posScenario: ScenarioConfig = {
  key: 'pos',
  label: 'POS vs Inventory',
  shortLabel: 'POS',
  leftLabel: 'POS sales',
  rightLabel: 'Inventory movements',
  leftIcon: ShoppingCart,
  rightIcon: Boxes,
  totalLeft: 10000,
  totalRight: 10000,
  units: 'qty',
  autoMatchedTotal: 9821,
  partialTotal: 88,
  exceptionsTotal: 12,
  manualHours: 28,
  systemMinutes: 11,
  build: () => {
    const left: Row[] = [
      r('POS-4112', 'A', 'Mon 13', 'SKU 8841, running shoes 9',   1, 'match',     ['INV-7301'], undefined, undefined, undefined, 'unit'),
      r('POS-4113', 'A', 'Mon 13', 'SKU 8841, running shoes 10',  1, 'exception', ['INV-7302'], 'timing', 'Inventory move logged Tue, POS sold Mon', 'Warehouse split-shipment · next-day move', 'unit'),
      r('POS-4114', 'A', 'Mon 13', 'SKU 6210, backpack',           2, 'partial',   ['INV-7303', 'INV-7304'], undefined, 'Split shipment, two warehouses', undefined, 'units'),
      r('POS-4115', 'A', 'Mon 13', 'SKU 4407, water bottle',       3, 'match',     ['INV-7305'], undefined, undefined, undefined, 'units'),
      r('POS-4116', 'A', 'Tue 14', 'SKU 1182, wool socks',         6, 'match',     ['INV-7306'], undefined, undefined, undefined, 'units'),
      r('POS-4117', 'A', 'Tue 14', 'SKU 9034, rain shell',         1, 'exception', ['INV-7308'], 'timing', 'Inventory move logged Wed, POS sold Tue', 'Warehouse split-shipment · next-day move', 'unit'),
      r('POS-4118', 'A', 'Tue 14', 'SKU 6210, backpack',           1, 'match',     ['INV-7307'], undefined, undefined, undefined, 'unit'),
      r('POS-4119', 'A', 'Tue 14', 'SKU 2255, head torch',         4, 'partial',   ['INV-7309', 'INV-7310'], undefined, 'Split shipment, two warehouses', undefined, 'units'),
      r('POS-4120', 'A', 'Wed 15', 'SKU 8841, running shoes 8',    1, 'exception', ['INV-7311'], 'timing', 'Inventory move logged Thu, POS sold Wed', 'Warehouse split-shipment · next-day move', 'unit'),
      r('POS-4121', 'A', 'Wed 15', 'SKU 4407, water bottle',       2, 'match',     ['INV-7312'], undefined, undefined, undefined, 'units'),
      r('POS-4122', 'A', 'Wed 15', 'SKU 5550, picnic blanket',     1, 'exception', [], 'missing-b', 'No inventory movement found, possible shrinkage', undefined, 'unit'),
      r('POS-4123', 'A', 'Wed 15', 'SKU 6210, backpack',           1, 'match',     ['INV-7313'], undefined, undefined, undefined, 'unit'),
      r('POS-4124', 'A', 'Thu 16', 'SKU 9034, rain shell',         1, 'match',     ['INV-7314'], undefined, undefined, undefined, 'unit'),
      r('POS-4125', 'A', 'Thu 16', 'SKU 1182, wool socks',         2, 'exception', ['INV-7315'], 'partial', 'Sale of 2, only 1 unit moved from stock', undefined, 'units'),
    ]
    const right: Row[] = [
      r('INV-7301', 'B', 'Mon 13', 'Out, Joburg warehouse',        1, 'match',     ['POS-4112'], undefined, undefined, undefined, 'unit'),
      r('INV-7302', 'B', 'Tue 14', 'Out, Cape warehouse',          1, 'exception', ['POS-4113'], 'timing', 'POS sold Mon, inventory left Tue', 'Warehouse split-shipment · next-day move', 'unit'),
      r('INV-7303', 'B', 'Mon 13', 'Out, Joburg warehouse',        1, 'partial',   ['POS-4114'], undefined, 'Combined with INV-7304 to match POS-4114', undefined, 'unit'),
      r('INV-7304', 'B', 'Mon 13', 'Out, Cape warehouse',          1, 'partial',   ['POS-4114'], undefined, 'Combined with INV-7303 to match POS-4114', undefined, 'unit'),
      r('INV-7305', 'B', 'Mon 13', 'Out, Joburg warehouse',        3, 'match',     ['POS-4115'], undefined, undefined, undefined, 'units'),
      r('INV-7306', 'B', 'Tue 14', 'Out, Joburg warehouse',        6, 'match',     ['POS-4116'], undefined, undefined, undefined, 'units'),
      r('INV-7307', 'B', 'Tue 14', 'Out, Joburg warehouse',        1, 'match',     ['POS-4118'], undefined, undefined, undefined, 'unit'),
      r('INV-7308', 'B', 'Wed 15', 'Out, Cape warehouse',          1, 'exception', ['POS-4117'], 'timing', 'POS sold Tue, inventory left Wed', 'Warehouse split-shipment · next-day move', 'unit'),
      r('INV-7309', 'B', 'Tue 14', 'Out, Joburg warehouse',        2, 'partial',   ['POS-4119'], undefined, 'Combined with INV-7310 to match POS-4119', undefined, 'units'),
      r('INV-7310', 'B', 'Tue 14', 'Out, Cape warehouse',          2, 'partial',   ['POS-4119'], undefined, 'Combined with INV-7309 to match POS-4119', undefined, 'units'),
      r('INV-7311', 'B', 'Thu 16', 'Out, Cape warehouse',          1, 'exception', ['POS-4120'], 'timing', 'POS sold Wed, inventory left Thu', 'Warehouse split-shipment · next-day move', 'unit'),
      r('INV-7312', 'B', 'Wed 15', 'Out, Joburg warehouse',        2, 'match',     ['POS-4121'], undefined, undefined, undefined, 'units'),
      r('INV-7313', 'B', 'Wed 15', 'Out, Joburg warehouse',        1, 'match',     ['POS-4123'], undefined, undefined, undefined, 'unit'),
      r('INV-7314', 'B', 'Thu 16', 'Out, Joburg warehouse',        1, 'match',     ['POS-4124'], undefined, undefined, undefined, 'unit'),
      r('INV-7315', 'B', 'Thu 16', 'Out, Joburg warehouse',        1, 'exception', ['POS-4125'], 'partial', 'Only 1 unit moved against a sale of 2', undefined, 'unit'),
    ]
    return { left, right }
  },
}

const processorScenario: ScenarioConfig = {
  key: 'processor',
  label: 'Processor vs Invoices',
  shortLabel: 'Processor',
  leftLabel: 'Invoices issued',
  rightLabel: 'Processor payouts',
  leftIcon: FileText,
  rightIcon: CreditCard,
  totalLeft: 4824,
  totalRight: 4801,
  units: 'currency',
  autoMatchedTotal: 4682,
  partialTotal: 96,
  exceptionsTotal: 12,
  manualHours: 18,
  systemMinutes: 8,
  build: () => {
    const left: Row[] = [
      r('INV-50111', 'A', 'Mon 13', 'Inv #50111, Acme Logistics',     1200.00, 'exception', ['PAY-1041'], 'fee', 'Net payout below invoice, processor fee', 'Processor fee · 2.9% + $0.30'),
      r('INV-50112', 'A', 'Mon 13', 'Inv #50112, Hilltop Hardware',     480.00, 'match', ['PAY-1042']),
      r('INV-50113', 'A', 'Mon 13', 'Inv #50113, Bluebird Cafe',        264.00, 'exception', ['PAY-1043'], 'fee', 'Net payout below invoice, processor fee', 'Processor fee · 2.9% + $0.30'),
      r('INV-50114', 'A', 'Tue 14', 'Inv #50114, Northridge Mills',    3120.00, 'match', ['PAY-1044']),
      r('INV-50115', 'A', 'Tue 14', 'Inv #50115, Quay Café',             97.50, 'exception', ['PAY-1045'], 'fee', 'Net payout below invoice, processor fee', 'Processor fee · 2.9% + $0.30'),
      r('INV-50116', 'A', 'Tue 14', 'Inv #50116, Westline Carriers',    540.00, 'match', ['PAY-1046']),
      r('INV-50117', 'A', 'Wed 15', 'Inv #50117, Brookside Restaurant', 318.00, 'partial', ['PAY-1047', 'PAY-1048'], undefined, 'Two payouts, combined to match'),
      r('INV-50118', 'A', 'Wed 15', 'Inv #50118, Apex Couriers',        720.00, 'match', ['PAY-1049']),
      r('INV-50119', 'A', 'Wed 15', 'Inv #50119, Riverbend Spa',        180.00, 'exception', ['PAY-1051'], 'timing', 'Payout settled Thu, invoice issued Wed'),
      r('INV-50120', 'A', 'Wed 15', 'Inv #50120, Lakeline Lodge',       640.00, 'match', ['PAY-1050']),
      r('INV-50121', 'A', 'Thu 16', 'Inv #50121, Stonepine B&B',        145.00, 'match', ['PAY-1052']),
      r('INV-50122', 'A', 'Thu 16', 'Inv #50122, Crowfoot Pty',         960.00, 'exception', [], 'missing-b', 'No matching payout found yet'),
      r('INV-50123', 'A', 'Thu 16', 'Inv #50123, Cedar & Co',           212.00, 'match', ['PAY-1053']),
      r('INV-50124', 'A', 'Fri 17', 'Inv #50124, Sunset Catering',      388.00, 'match', ['PAY-1054']),
    ]
    const right: Row[] = [
      r('PAY-1041', 'B', 'Mon 13', 'Processor payout',                 1164.50, 'exception', ['INV-50111'], 'fee', 'Likely processor fee on invoice #50111', 'Processor fee · 2.9% + $0.30'),
      r('PAY-1042', 'B', 'Mon 13', 'Processor payout',                  480.00, 'match', ['INV-50112']),
      r('PAY-1043', 'B', 'Mon 13', 'Processor payout',                  256.04, 'exception', ['INV-50113'], 'fee', 'Likely processor fee on invoice #50113', 'Processor fee · 2.9% + $0.30'),
      r('PAY-1044', 'B', 'Tue 14', 'Processor payout',                 3120.00, 'match', ['INV-50114']),
      r('PAY-1045', 'B', 'Tue 14', 'Processor payout',                   94.37, 'exception', ['INV-50115'], 'fee', 'Likely processor fee on invoice #50115', 'Processor fee · 2.9% + $0.30'),
      r('PAY-1046', 'B', 'Tue 14', 'Processor payout',                  540.00, 'match', ['INV-50116']),
      r('PAY-1047', 'B', 'Wed 15', 'Processor payout',                  158.00, 'partial', ['INV-50117'], undefined, 'Combined with PAY-1048 to match INV-50117'),
      r('PAY-1048', 'B', 'Wed 15', 'Processor payout',                  160.00, 'partial', ['INV-50117'], undefined, 'Combined with PAY-1047 to match INV-50117'),
      r('PAY-1049', 'B', 'Wed 15', 'Processor payout',                  720.00, 'match', ['INV-50118']),
      r('PAY-1050', 'B', 'Wed 15', 'Processor payout',                  640.00, 'match', ['INV-50120']),
      r('PAY-1051', 'B', 'Thu 16', 'Processor payout',                  180.00, 'exception', ['INV-50119'], 'timing', 'Invoice issued Wed, payout settled Thu'),
      r('PAY-1052', 'B', 'Thu 16', 'Processor payout',                  145.00, 'match', ['INV-50121']),
      r('PAY-1053', 'B', 'Thu 16', 'Processor payout',                  212.00, 'match', ['INV-50123']),
      r('PAY-1054', 'B', 'Fri 17', 'Processor payout',                  388.00, 'match', ['INV-50124']),
    ]
    return { left, right }
  },
}

const SCENARIOS: ScenarioConfig[] = [bankScenario, posScenario, processorScenario]

function r(
  id: string,
  side: 'A' | 'B',
  date: string,
  desc: string,
  amount: number,
  outcome: Row['outcome'],
  partnerIds: string[],
  reason?: Reason,
  reasonLabel?: string,
  patternLabel?: string,
  unit?: string,
): Row {
  return {
    id,
    side,
    date,
    desc,
    amount,
    outcome,
    partnerIds,
    reason,
    reasonLabel,
    patternLabel,
    unit,
    status: 'pending',
  }
}

// ============================================================================
// Reactive state
// ============================================================================

const scenarioKey = ref<Scenario>('bank')
const phase = ref<'idle' | 'running' | 'complete'>('idle')
const progress = ref(0)
const counters = ref({ matched: 0, partial: 0, exception: 0 })
const left = ref<Row[]>([])
const right = ref<Row[]>([])
const expandedExceptionId = ref<string | null>(null)
const learnedPatterns = ref<Set<string>>(new Set())
const banner = ref<{ text: string; kind: 'learn' | 'resolve' } | null>(null)
const timers: number[] = []

const scenario = computed<ScenarioConfig>(() =>
  SCENARIOS.find((s) => s.key === scenarioKey.value) ?? bankScenario,
)

const allRows = computed(() => [...left.value, ...right.value])

// Exceptions visible in the queue. Always show pair representatives by the
// "A-side" record so the user sees one queue item per real exception.
const exceptionsQueue = computed(() => {
  return left.value.filter((row) => row.status === 'exception')
})

const remainingExceptionsCount = computed(() => {
  // Exceptions still flagged for human review. Counted on the A-side only
  // because each pair is represented once in the queue.
  return left.value.filter((row) => row.status === 'exception').length
})

const summaryStats = computed(() => {
  const cfg = scenario.value
  const remaining = remainingExceptionsCount.value
  const initial = cfg.exceptionsTotal
  const autoResolvedExtras = Math.max(0, initial - remaining)
  const totalMatchedNow = cfg.autoMatchedTotal + cfg.partialTotal + autoResolvedExtras
  const autoPct = (totalMatchedNow / cfg.totalLeft) * 100
  return {
    autoMatchedTotal: cfg.autoMatchedTotal,
    partialTotal: cfg.partialTotal,
    initialExceptions: initial,
    remainingExceptions: remaining,
    totalMatchedNow,
    autoPct,
    manualHours: cfg.manualHours,
    systemMinutes: cfg.systemMinutes,
    hoursSaved: cfg.manualHours - cfg.systemMinutes / 60,
  }
})

// ============================================================================
// Lifecycle / scenario switching
// ============================================================================

function loadScenario(key: Scenario) {
  clearTimers()
  scenarioKey.value = key
  const cfg = SCENARIOS.find((s) => s.key === key) ?? bankScenario
  const { left: l, right: rt } = cfg.build()
  left.value = l
  right.value = rt
  phase.value = 'idle'
  progress.value = 0
  counters.value = { matched: 0, partial: 0, exception: 0 }
  expandedExceptionId.value = null
  learnedPatterns.value = new Set()
  banner.value = null
}

loadScenario('bank')

watch(scenarioKey, (key) => {
  loadScenario(key)
})

onBeforeUnmount(() => {
  clearTimers()
})

function clearTimers() {
  while (timers.length) {
    const id = timers.shift()
    if (id !== undefined) window.clearTimeout(id)
  }
}

function schedule(fn: () => void, ms: number) {
  const id = window.setTimeout(fn, ms)
  timers.push(id)
}

// ============================================================================
// Run reconciliation
// ============================================================================

function runReconciliation() {
  if (phase.value === 'running') return
  // Reset to a clean run if we're complete.
  if (phase.value === 'complete') {
    loadScenario(scenarioKey.value)
  }
  phase.value = 'running'
  progress.value = 0
  counters.value = { matched: 0, partial: 0, exception: 0 }

  const cfg = scenario.value
  // Total run duration: ~3000ms. Three waves: matches, partials, exceptions.
  const totalDuration = 2800
  const matchWaveEnd = 1800
  const partialWaveEnd = 2300
  const exceptionWaveEnd = totalDuration

  // Counter targets reflect the full population (10,000-ish), not the
  // visible 14 rows. We tween counters to those numbers so the proof reads
  // as scale, not toy.
  const matchedTarget = cfg.autoMatchedTotal
  const partialTarget = cfg.partialTotal
  const exceptionTarget = cfg.exceptionsTotal

  const matchedRows = allRows.value.filter((row) => row.outcome === 'match')
  const partialRows = allRows.value.filter((row) => row.outcome === 'partial')
  const exceptionRows = allRows.value.filter((row) => row.outcome === 'exception')

  // Reveal each row at a deterministic time inside its wave.
  matchedRows.forEach((row, idx) => {
    const t = (idx / matchedRows.length) * matchWaveEnd
    schedule(() => {
      mutateRow(row.id, { status: 'matched' })
    }, t)
  })
  partialRows.forEach((row, idx) => {
    const t = matchWaveEnd + (idx / partialRows.length) * (partialWaveEnd - matchWaveEnd)
    schedule(() => {
      mutateRow(row.id, { status: 'partial' })
    }, t)
  })
  exceptionRows.forEach((row, idx) => {
    const t = partialWaveEnd + (idx / exceptionRows.length) * (exceptionWaveEnd - partialWaveEnd)
    schedule(() => {
      mutateRow(row.id, { status: 'exception' })
    }, t)
  })

  // Tween progress + counters over the full duration.
  const stepMs = 30
  const steps = Math.ceil(totalDuration / stepMs)
  for (let i = 1; i <= steps; i++) {
    schedule(() => {
      const t = (i / steps) * totalDuration
      progress.value = Math.min(100, (t / totalDuration) * 100)
      // Wave-relative interpolation.
      counters.value = {
        matched: Math.round(
          matchedTarget * Math.min(1, t / matchWaveEnd),
        ),
        partial:
          t <= matchWaveEnd
            ? 0
            : Math.round(
                partialTarget *
                  Math.min(1, (t - matchWaveEnd) / (partialWaveEnd - matchWaveEnd)),
              ),
        exception:
          t <= partialWaveEnd
            ? 0
            : Math.round(
                exceptionTarget *
                  Math.min(
                    1,
                    (t - partialWaveEnd) / (exceptionWaveEnd - partialWaveEnd),
                  ),
              ),
      }
    }, i * stepMs)
  }

  schedule(() => {
    progress.value = 100
    counters.value = {
      matched: matchedTarget,
      partial: partialTarget,
      exception: exceptionTarget,
    }
    phase.value = 'complete'
  }, totalDuration + 50)
}

function mutateRow(id: string, patch: Partial<Row>) {
  const inLeft = left.value.find((r) => r.id === id)
  if (inLeft) {
    Object.assign(inLeft, patch)
    return
  }
  const inRight = right.value.find((r) => r.id === id)
  if (inRight) Object.assign(inRight, patch)
}

function resetDemo() {
  loadScenario(scenarioKey.value)
}

// ============================================================================
// Manual resolve + engine learns
// ============================================================================

function findRow(id: string): Row | undefined {
  return left.value.find((r) => r.id === id) ?? right.value.find((r) => r.id === id)
}

// Three "candidate" rows shown in the picker, top one is the correct partner.
function candidatesFor(exception: Row): Row[] {
  const otherSide = exception.side === 'A' ? right.value : left.value
  const truePartner = exception.partnerIds[0]
    ? otherSide.find((r) => r.id === exception.partnerIds[0])
    : undefined
  // Two "noise" candidates: any rows from the other side that are matched
  // (already resolved), they make a good visual contrast and reinforce that
  // the engine ranked the real partner highest.
  const noise = otherSide.filter(
    (r) => r.status === 'matched' && r.id !== truePartner?.id,
  )
  const picked: Row[] = []
  if (truePartner) picked.push(truePartner)
  // Pick two noise rows of similar amount-ish for plausibility.
  noise
    .slice()
    .sort(
      (a, b) =>
        Math.abs(a.amount - exception.amount) -
        Math.abs(b.amount - exception.amount),
    )
    .slice(0, 2)
    .forEach((r) => picked.push(r))
  return picked
}

function confidenceFor(candidate: Row, exception: Row): number {
  if (exception.partnerIds.includes(candidate.id)) {
    // Highly confident match, the engine knows this is its best candidate.
    return 96 + Math.floor(Math.random() * 3)
  }
  const delta = Math.abs(candidate.amount - exception.amount)
  const base = Math.max(0, 60 - delta * 2)
  return Math.round(base)
}

function toggleExpand(id: string) {
  expandedExceptionId.value = expandedExceptionId.value === id ? null : id
}

function resolveException(exception: Row, candidate: Row) {
  if (!exception.partnerIds.includes(candidate.id)) return

  // Mark this pair as resolved-manual.
  mutateRow(exception.id, { status: 'resolved-manual', justResolved: true })
  mutateRow(candidate.id, { status: 'resolved-manual', justResolved: true })
  expandedExceptionId.value = null

  const pattern = exception.patternLabel
  banner.value = { text: 'Resolved, match recorded to audit trail', kind: 'resolve' }

  // If this exception had a pattern label that hasn't been learned, learn
  // it and auto-clear similar exceptions.
  if (pattern && !learnedPatterns.value.has(pattern)) {
    schedule(() => {
      learnedPatterns.value = new Set([...learnedPatterns.value, pattern])
      banner.value = { text: `Pattern learned: ${pattern}`, kind: 'learn' }
    }, 700)

    // Auto-clear similar exceptions in two ticks for the visible "engine
    // working" effect.
    const matchingExceptions = left.value.filter(
      (row) => row.status === 'exception' && row.patternLabel === pattern,
    )
    matchingExceptions.forEach((row, idx) => {
      schedule(() => {
        mutateRow(row.id, { status: 'resolved-auto', justResolved: true })
        for (const pid of row.partnerIds) {
          mutateRow(pid, { status: 'resolved-auto', justResolved: true })
        }
      }, 1200 + idx * 450)
    })

    // Clear the "just resolved" pulse a bit later.
    schedule(() => {
      for (const row of allRows.value) {
        if (row.justResolved) mutateRow(row.id, { justResolved: false })
      }
    }, 1200 + matchingExceptions.length * 450 + 900)
  } else {
    // No pattern learning, just clear the pulse.
    schedule(() => {
      mutateRow(exception.id, { justResolved: false })
      mutateRow(candidate.id, { justResolved: false })
    }, 900)
  }

  // Banner fades after a moment.
  schedule(() => {
    if (banner.value?.kind === 'resolve') banner.value = null
  }, 2400)
  schedule(() => {
    if (banner.value?.kind === 'learn') banner.value = null
  }, 4200)
}

// ============================================================================
// Formatting helpers
// ============================================================================

function fmtAmount(row: Row): string {
  const cfg = scenario.value
  if (cfg.units === 'qty') {
    const unit = row.unit ?? 'units'
    return `${row.amount} ${unit}`
  }
  return `$${row.amount.toFixed(2)}`
}

function fmtNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function rowClasses(row: Row): string {
  const base = 'transition-[background-color,opacity] duration-500'
  if (row.justResolved) {
    return `${base} bg-cyan-brand/8`
  }
  switch (row.status) {
    case 'pending':
      return `${base} opacity-30`
    case 'matched':
      return `${base} opacity-55 hover:opacity-100`
    case 'partial':
      return `${base} bg-cyan-brand/[0.04]`
    case 'exception':
      return `${base} bg-red-50/40`
    case 'resolved-auto':
    case 'resolved-manual':
      return `${base} opacity-55 hover:opacity-100`
    default:
      return base
  }
}

function reasonChip(reason?: Reason): { label: string; tone: 'red' | 'cyan' | 'mute' } {
  switch (reason) {
    case 'fee':
      return { label: 'Fee delta', tone: 'red' }
    case 'timing':
      return { label: 'Timing gap', tone: 'cyan' }
    case 'partial':
      return { label: 'Partial payment', tone: 'red' }
    case 'missing-a':
      return { label: 'Missing on left', tone: 'red' }
    case 'missing-b':
      return { label: 'Missing on right', tone: 'red' }
    default:
      return { label: 'Exception', tone: 'red' }
  }
}

</script>

<template>
  <div class="p-5 md:p-7">
    <!-- =====================================================================
      Header: scenario toggle + title row
    ===================================================================== -->
    <header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          <span class="dot" />
          Live Reconciliation
        </div>
        <h3 class="mt-2 font-display text-[24px] md:text-[28px] leading-[1.15] text-ink">
          One week of activity. {{ fmtNumber(scenario.totalLeft) }} {{ scenario.units === 'qty' ? 'records' : 'transactions' }}.
        </h3>
        <p class="mt-1.5 text-[14px] md:text-[14.5px] text-mute max-w-xl">
          The engine matches what it can. You only see what needs a human.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Reconciliation type"
        class="inline-flex items-center rounded-xl border border-line bg-surface-alt p-1 self-start md:self-end overflow-x-auto"
      >
        <button
          v-for="s in SCENARIOS"
          :key="s.key"
          role="tab"
          :aria-selected="scenarioKey === s.key"
          type="button"
          class="whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          :class="
            scenarioKey === s.key
              ? 'bg-white text-ink shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
              : 'text-mute hover:text-ink'
          "
          @click="scenarioKey = s.key"
        >
          {{ s.label }}
        </button>
      </div>
    </header>

    <!-- =====================================================================
      Control bar: Run button + progress + counters
    ===================================================================== -->
    <section class="mt-6 rounded-2xl border border-line bg-surface-alt/60 p-4 md:p-5">
      <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[14px] font-semibold px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="phase === 'running'"
            @click="runReconciliation"
          >
            <Play v-if="phase !== 'running'" :size="15" :stroke-width="2.2" />
            <span
              v-else
              class="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/60 border-t-white animate-spin"
              aria-hidden="true"
            />
            {{ phase === 'idle' ? 'Run reconciliation' : phase === 'running' ? 'Reconciling…' : 'Run again' }}
          </button>
          <button
            v-if="phase !== 'idle'"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white hover:border-ink/30 text-ink text-[13.5px] font-semibold px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2"
            @click="resetDemo"
          >
            <RotateCcw :size="14" :stroke-width="2" />
            Reset
          </button>
        </div>

        <!-- Progress bar -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3 text-[12px] font-semibold text-mute-2 uppercase tracking-[0.18em]">
            <span>Progress</span>
            <span class="text-ink tabular-nums">{{ Math.round(progress) }}%</span>
          </div>
          <div class="mt-1.5 h-2 rounded-full bg-line/80 overflow-hidden">
            <div
              class="h-full rounded-full bg-cyan-brand-deep transition-[width] duration-100 ease-linear"
              :style="{ width: progress + '%' }"
            />
          </div>
        </div>
      </div>

      <!-- Counters -->
      <dl class="mt-5 grid grid-cols-3 gap-3 md:gap-4">
        <div class="rounded-xl border border-line bg-white p-3 md:p-4">
          <dt class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2 flex items-center gap-1.5">
            <Check :size="13" :stroke-width="2.4" class="text-cyan-brand-deep" />
            Matched
          </dt>
          <dd class="mt-1 font-display text-[26px] md:text-[30px] text-ink tabular-nums leading-none">
            {{ fmtNumber(counters.matched) }}
          </dd>
        </div>
        <div class="rounded-xl border border-line bg-white p-3 md:p-4">
          <dt class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2 flex items-center gap-1.5">
            <Sparkles :size="13" :stroke-width="2.2" class="text-cyan-brand-deep" />
            Partial
          </dt>
          <dd class="mt-1 font-display text-[26px] md:text-[30px] text-ink tabular-nums leading-none">
            {{ fmtNumber(counters.partial) }}
          </dd>
        </div>
        <div class="rounded-xl border border-line bg-white p-3 md:p-4">
          <dt class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2 flex items-center gap-1.5">
            <AlertTriangle :size="13" :stroke-width="2.2" class="text-red-600" />
            Exceptions
          </dt>
          <dd class="mt-1 font-display text-[26px] md:text-[30px] text-ink tabular-nums leading-none">
            {{ fmtNumber(counters.exception) }}
          </dd>
        </div>
      </dl>
    </section>

    <!-- =====================================================================
      Two ledger panes
    ===================================================================== -->
    <section class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
      <!-- Left ledger -->
      <article class="rounded-2xl border border-line bg-white overflow-hidden">
        <header class="flex items-center justify-between px-4 py-3 border-b border-line bg-surface-alt/60">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-brand/8 ring-1 ring-cyan-brand/25 text-cyan-brand-deep shrink-0">
              <component :is="scenario.leftIcon" :size="15" :stroke-width="1.9" />
            </span>
            <div class="min-w-0">
              <div class="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-mute-2">
                Ledger A
              </div>
              <div class="text-[14px] font-semibold text-ink truncate">{{ scenario.leftLabel }}</div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Records</div>
            <div class="font-display text-[18px] text-ink leading-none tabular-nums">{{ fmtNumber(scenario.totalLeft) }}</div>
          </div>
        </header>
        <ul class="divide-y divide-line/70 max-h-[440px] overflow-y-auto">
          <li
            v-for="row in left"
            :key="row.id"
            :class="rowClasses(row)"
          >
            <div class="flex items-start justify-between gap-3 px-4 py-2.5">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-[12px] font-semibold text-ink tabular-nums">{{ row.id }}</span>
                  <span class="text-[11px] text-mute-2">{{ row.date }}</span>
                  <span
                    v-if="row.status === 'matched'"
                    class="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-cyan-brand/12 text-cyan-brand-deep"
                    aria-label="Matched"
                  >
                    <Check :size="9" :stroke-width="3" />
                  </span>
                  <span
                    v-else-if="row.status === 'partial'"
                    class="inline-flex items-center rounded-full bg-cyan-brand/10 ring-1 ring-cyan-brand/30 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-cyan-brand-deep"
                  >
                    Partial
                  </span>
                  <span
                    v-else-if="row.status === 'exception'"
                    class="inline-flex items-center rounded-full bg-red-50 ring-1 ring-red-100 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-red-600"
                  >
                    {{ reasonChip(row.reason).label }}
                  </span>
                  <span
                    v-else-if="row.status === 'resolved-manual'"
                    class="inline-flex items-center rounded-full bg-ink/5 ring-1 ring-ink/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-soft"
                  >
                    Resolved
                  </span>
                  <span
                    v-else-if="row.status === 'resolved-auto'"
                    class="inline-flex items-center gap-1 rounded-full bg-cyan-brand/10 ring-1 ring-cyan-brand/30 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-cyan-brand-deep"
                  >
                    <Wand2 :size="8" :stroke-width="2.4" />
                    Auto
                  </span>
                </div>
                <div class="text-[12.5px] text-mute truncate mt-0.5">{{ row.desc }}</div>
                <div
                  v-if="row.reasonLabel && (row.status === 'exception' || row.status === 'partial' || row.status === 'resolved-manual' || row.status === 'resolved-auto')"
                  class="text-[11px] text-mute-2 mt-0.5 italic"
                >
                  {{ row.reasonLabel }}
                </div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-[13.5px] font-semibold text-ink tabular-nums">{{ fmtAmount(row) }}</div>
              </div>
            </div>
          </li>
        </ul>
        <footer class="px-4 py-2.5 border-t border-line bg-surface-alt/40 text-[12px] text-mute-2">
          + {{ fmtNumber(scenario.totalLeft - left.length) }} more
        </footer>
      </article>

      <!-- Right ledger -->
      <article class="rounded-2xl border border-line bg-white overflow-hidden">
        <header class="flex items-center justify-between px-4 py-3 border-b border-line bg-surface-alt/60">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-brand/8 ring-1 ring-cyan-brand/25 text-cyan-brand-deep shrink-0">
              <component :is="scenario.rightIcon" :size="15" :stroke-width="1.9" />
            </span>
            <div class="min-w-0">
              <div class="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-mute-2">
                Ledger B
              </div>
              <div class="text-[14px] font-semibold text-ink truncate">{{ scenario.rightLabel }}</div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Records</div>
            <div class="font-display text-[18px] text-ink leading-none tabular-nums">{{ fmtNumber(scenario.totalRight) }}</div>
          </div>
        </header>
        <ul class="divide-y divide-line/70 max-h-[440px] overflow-y-auto">
          <li
            v-for="row in right"
            :key="row.id"
            :class="rowClasses(row)"
          >
            <div class="flex items-start justify-between gap-3 px-4 py-2.5">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-[12px] font-semibold text-ink tabular-nums">{{ row.id }}</span>
                  <span class="text-[11px] text-mute-2">{{ row.date }}</span>
                  <span
                    v-if="row.status === 'matched'"
                    class="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-cyan-brand/12 text-cyan-brand-deep"
                    aria-label="Matched"
                  >
                    <Check :size="9" :stroke-width="3" />
                  </span>
                  <span
                    v-else-if="row.status === 'partial'"
                    class="inline-flex items-center rounded-full bg-cyan-brand/10 ring-1 ring-cyan-brand/30 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-cyan-brand-deep"
                  >
                    Partial
                  </span>
                  <span
                    v-else-if="row.status === 'exception'"
                    class="inline-flex items-center rounded-full bg-red-50 ring-1 ring-red-100 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-red-600"
                  >
                    {{ reasonChip(row.reason).label }}
                  </span>
                  <span
                    v-else-if="row.status === 'resolved-manual'"
                    class="inline-flex items-center rounded-full bg-ink/5 ring-1 ring-ink/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-soft"
                  >
                    Resolved
                  </span>
                  <span
                    v-else-if="row.status === 'resolved-auto'"
                    class="inline-flex items-center gap-1 rounded-full bg-cyan-brand/10 ring-1 ring-cyan-brand/30 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-cyan-brand-deep"
                  >
                    <Wand2 :size="8" :stroke-width="2.4" />
                    Auto
                  </span>
                </div>
                <div class="text-[12.5px] text-mute truncate mt-0.5">{{ row.desc }}</div>
                <div
                  v-if="row.reasonLabel && (row.status === 'exception' || row.status === 'partial' || row.status === 'resolved-manual' || row.status === 'resolved-auto')"
                  class="text-[11px] text-mute-2 mt-0.5 italic"
                >
                  {{ row.reasonLabel }}
                </div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-[13.5px] font-semibold text-ink tabular-nums">{{ fmtAmount(row) }}</div>
              </div>
            </div>
          </li>
        </ul>
        <footer class="px-4 py-2.5 border-t border-line bg-surface-alt/40 text-[12px] text-mute-2">
          + {{ fmtNumber(scenario.totalRight - right.length) }} more
        </footer>
      </article>
    </section>

    <!-- =====================================================================
      Banner (pattern learned / resolved)
    ===================================================================== -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-out"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="banner"
        :class="[
          'mt-5 rounded-xl border px-4 py-3 flex items-center gap-2.5 text-[13.5px]',
          banner.kind === 'learn'
            ? 'border-cyan-brand/40 bg-cyan-brand/8 text-ink'
            : 'border-line bg-white text-ink',
        ]"
        role="status"
        aria-live="polite"
      >
        <Wand2
          v-if="banner.kind === 'learn'"
          :size="16"
          :stroke-width="2"
          class="text-cyan-brand-deep shrink-0"
        />
        <Check
          v-else
          :size="16"
          :stroke-width="2.4"
          class="text-cyan-brand-deep shrink-0"
        />
        <span class="font-medium">{{ banner.text }}</span>
      </div>
    </Transition>

    <!-- =====================================================================
      Exceptions queue (post-complete)
    ===================================================================== -->
    <section v-if="phase === 'complete'" class="mt-6 rounded-2xl border border-line bg-white overflow-hidden">
      <header class="flex items-start justify-between gap-3 px-4 md:px-5 py-4 border-b border-line">
        <div class="min-w-0">
          <div class="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-cyan-brand-deep">
            <span class="dot" />
            Exceptions queue
          </div>
          <h4 class="mt-1.5 font-display text-[18px] md:text-[22px] text-ink leading-[1.15]">
            {{ exceptionsQueue.length }}
            {{ exceptionsQueue.length === 1 ? 'item' : 'items' }}
            need a human
          </h4>
        </div>
        <div class="text-right shrink-0">
          <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Initial</div>
          <div class="font-display text-[18px] text-ink leading-none tabular-nums">
            {{ scenario.exceptionsTotal }}
          </div>
        </div>
      </header>

      <ul v-if="exceptionsQueue.length" class="divide-y divide-line/70">
        <li
          v-for="exception in exceptionsQueue"
          :key="exception.id"
        >
          <button
            type="button"
            class="w-full text-left px-4 md:px-5 py-4 hover:bg-surface-alt/60 transition-colors focus-visible:outline-none focus-visible:bg-surface-alt"
            :aria-expanded="expandedExceptionId === exception.id"
            @click="toggleExpand(exception.id)"
          >
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
              <div class="flex items-start gap-2.5 min-w-0">
                <span class="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-red-50 ring-1 ring-red-100 text-red-600 shrink-0 mt-0.5">
                  <AlertTriangle :size="13" :stroke-width="2.2" />
                </span>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[13px] font-semibold text-ink tabular-nums">{{ exception.id }}</span>
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.16em]"
                      :class="reasonChip(exception.reason).tone === 'red'
                        ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                        : 'bg-cyan-brand/8 text-cyan-brand-deep ring-1 ring-cyan-brand/25'"
                    >
                      {{ reasonChip(exception.reason).label }}
                    </span>
                  </div>
                  <p class="mt-1 text-[13.5px] text-mute leading-[1.45]">
                    {{ exception.reasonLabel }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 shrink-0 ml-9 md:ml-0">
                <div class="text-right">
                  <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">{{ exception.date }}</div>
                  <div class="text-[14px] font-semibold text-ink tabular-nums">{{ fmtAmount(exception) }}</div>
                </div>
                <ArrowRight
                  :size="16"
                  :stroke-width="2"
                  class="text-mute-2 transition-transform"
                  :class="expandedExceptionId === exception.id ? 'rotate-90' : ''"
                />
              </div>
            </div>
          </button>

          <!-- Candidate picker -->
          <div
            v-if="expandedExceptionId === exception.id"
            class="px-4 md:px-5 pb-5 pt-1"
          >
            <div class="rounded-xl border border-line bg-surface-alt/60 p-3 md:p-4">
              <div class="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-mute-2">
                Engine suggestions · ranked by confidence
              </div>
              <ul class="mt-3 space-y-2">
                <li
                  v-for="candidate in candidatesFor(exception)"
                  :key="candidate.id"
                  class="rounded-lg border border-line bg-white px-3 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-[13px] font-semibold text-ink tabular-nums">{{ candidate.id }}</span>
                      <span class="text-[12px] text-mute-2">{{ candidate.date }}</span>
                    </div>
                    <div class="text-[12.5px] text-mute truncate">{{ candidate.desc }}</div>
                  </div>
                  <div class="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                    <div class="text-right">
                      <div class="text-[14px] font-semibold text-ink tabular-nums">{{ fmtAmount(candidate) }}</div>
                      <div class="text-[10.5px] text-mute-2 tabular-nums">
                        {{ confidenceFor(candidate, exception) }}% confidence
                      </div>
                    </div>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-md text-[12px] font-semibold px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                      :class="exception.partnerIds.includes(candidate.id)
                        ? 'bg-ink hover:bg-ink-soft text-white'
                        : 'bg-white text-mute border border-line opacity-60 cursor-not-allowed'"
                      :disabled="!exception.partnerIds.includes(candidate.id)"
                      @click="resolveException(exception, candidate)"
                    >
                      <Check :size="12" :stroke-width="2.4" />
                      Match
                    </button>
                  </div>
                </li>
              </ul>
              <p
                v-if="exception.patternLabel && !learnedPatterns.has(exception.patternLabel)"
                class="mt-3 text-[12px] text-mute-2 leading-[1.5]"
              >
                <Sparkles :size="12" :stroke-width="2" class="inline -mt-0.5 text-cyan-brand-deep" />
                Tip, resolve this one and the engine will learn the
                <span class="font-semibold text-ink">{{ exception.patternLabel }}</span>
                pattern. Similar exceptions will auto-clear.
              </p>
              <p
                v-else-if="exception.patternLabel && learnedPatterns.has(exception.patternLabel)"
                class="mt-3 text-[12px] text-mute-2 leading-[1.5]"
              >
                <Wand2 :size="12" :stroke-width="2" class="inline -mt-0.5 text-cyan-brand-deep" />
                Pattern already learned -
                <span class="font-semibold text-ink">{{ exception.patternLabel }}</span>.
              </p>
            </div>
          </div>
        </li>
      </ul>

      <div v-else class="px-4 md:px-5 py-10 text-center">
        <span class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-brand/8 ring-1 ring-cyan-brand/25 text-cyan-brand-deep mb-3">
          <Check :size="18" :stroke-width="2.2" />
        </span>
        <p class="font-display text-[20px] text-ink leading-[1.2]">
          Every exception cleared.
        </p>
        <p class="mt-1.5 text-[13.5px] text-mute">
          Engine handled the rest in the background. Finance team got their afternoon back.
        </p>
      </div>
    </section>

    <!-- =====================================================================
      Hours saved summary (post-complete)
    ===================================================================== -->
    <section v-if="phase === 'complete'" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
      <div class="rounded-2xl border border-line bg-white p-4 md:p-5">
        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2 flex items-center gap-1.5">
          <Clock :size="13" :stroke-width="2.2" />
          Auto-matched
        </div>
        <div class="mt-2 font-display text-[28px] md:text-[34px] text-ink tabular-nums leading-none">
          {{ summaryStats.autoPct.toFixed(1) }}%
        </div>
        <p class="mt-2 text-[13px] text-mute leading-[1.5]">
          {{ fmtNumber(summaryStats.totalMatchedNow) }} of {{ fmtNumber(scenario.totalLeft) }} closed without a human in the loop.
        </p>
      </div>

      <div class="rounded-2xl border border-line bg-white p-4 md:p-5">
        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2 flex items-center gap-1.5">
          <AlertTriangle :size="13" :stroke-width="2.2" />
          Real exceptions
        </div>
        <div class="mt-2 font-display text-[28px] md:text-[34px] text-ink tabular-nums leading-none">
          {{ summaryStats.remainingExceptions }} <span class="text-[18px] text-mute-2 font-sans align-middle">/ {{ summaryStats.initialExceptions }}</span>
        </div>
        <p class="mt-2 text-[13px] text-mute leading-[1.5]">
          {{ summaryStats.remainingExceptions === summaryStats.initialExceptions
            ? 'Pick the first exception to teach the engine, it will learn the pattern.'
            : `Engine learned ${learnedPatterns.size} pattern${learnedPatterns.size === 1 ? '' : 's'} and auto-cleared the rest of that kind.` }}
        </p>
      </div>

      <div class="rounded-2xl border border-cyan-brand/40 bg-cyan-brand/5 p-4 md:p-5 relative overflow-hidden">
        <div class="absolute -top-12 -right-10 h-32 w-32 rounded-full bg-cyan-brand/15 blur-[60px] pointer-events-none" aria-hidden="true" />
        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-brand-deep flex items-center gap-1.5 relative">
          <Hourglass :size="13" :stroke-width="2.2" />
          Hours saved this week
        </div>
        <div class="mt-2 font-display text-[28px] md:text-[34px] text-ink tabular-nums leading-none relative">
          {{ summaryStats.hoursSaved.toFixed(1) }}h
        </div>
        <p class="mt-2 text-[13px] text-mute leading-[1.5] relative">
          Manual reconciliation: ~{{ scenario.manualHours }}h. System run: ~{{ scenario.systemMinutes }} min.
        </p>
      </div>
    </section>
  </div>
</template>
