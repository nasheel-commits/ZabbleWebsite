<script setup lang="ts">
import { computed, h, onUnmounted, reactive, ref } from 'vue'
import { Activity, AlertTriangle, ArrowRight, Boxes, CheckCircle2, FileText, History, PackagePlus, Radio, RefreshCcw, ScanLine, ShoppingCart, Truck, X, Zap } from '@lucide/vue'

type LocationId = 'goodsIn' | 'bay1' | 'bay2' | 'bay3' | 'dispatch'
type AssetClassId = 'parts' | 'hotel' | 'construction'
type ChannelId = 'rfid' | 'ledger' | 'erp' | 'order'
type MovementType = 'receive' | 'move' | 'pick'

interface SkuRecord {
  id: string
  name: string
  ledger: Record<LocationId, number>
  rfid: Record<LocationId, number>
}

interface Movement {
  id: number
  ts: string
  sku: string
  qty: number
  from: LocationId | null
  to: LocationId | null
  operator: string
  gate: string
  type: MovementType
}

interface FeedEvent {
  id: number
  ts: string
  channel: ChannelId
  line: string
  detail?: string
  tone?: 'normal' | 'warn' | 'good'
}

interface ActionDef {
  id: string
  label: string
  detail: string
  sku: string
  qty: number
  from: LocationId | null
  to: LocationId | null
  orderRef?: string
  type: MovementType
}

interface AssetClass {
  id: AssetClassId
  label: string
  short: string
  unit: string
  operator: string
  locationLabels: Record<LocationId, string>
  skus: SkuRecord[]
  actions: ActionDef[]
}

// --- Floor plan layout (percent coords inside the 16:9 container) ----------
const LOCATIONS: {
  id: LocationId
  x: number
  y: number
  w: number
  h: number
  gate: { id: string; x: number; y: number }
}[] = [
  { id: 'goodsIn',  x: 3,  y: 17, w: 19, h: 66, gate: { id: 'G-IN',   x: 22, y: 50 } },
  { id: 'bay1',     x: 33, y: 6,  w: 24, h: 25, gate: { id: 'G-B1',   x: 33, y: 18 } },
  { id: 'bay2',     x: 33, y: 38, w: 24, h: 25, gate: { id: 'G-B2',   x: 33, y: 50 } },
  { id: 'bay3',     x: 33, y: 70, w: 24, h: 25, gate: { id: 'G-B3',   x: 33, y: 82 } },
  { id: 'dispatch', x: 67, y: 17, w: 30, h: 66, gate: { id: 'G-DISP', x: 67, y: 50 } },
]

const LOCATION_BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l])) as Record<
  LocationId,
  (typeof LOCATIONS)[number]
>

// --- Asset class data ------------------------------------------------------
function emptyMap(): Record<LocationId, number> {
  return { goodsIn: 0, bay1: 0, bay2: 0, bay3: 0, dispatch: 0 }
}

function sku(
  id: string,
  name: string,
  amounts: Partial<Record<LocationId, number>>,
  mismatch?: Partial<Record<LocationId, number>>,
): SkuRecord {
  const ledger = { ...emptyMap(), ...amounts }
  const rfid = { ...ledger, ...(mismatch ?? {}) }
  return { id, name, ledger, rfid }
}

const ASSET_CLASSES: AssetClass[] = [
  {
    id: 'parts',
    label: 'Parts supplier',
    short: 'Parts',
    unit: 'pallet',
    operator: 'OP-217 · J. Mensah',
    locationLabels: {
      goodsIn: 'Goods-In',
      bay1: 'Bay 1',
      bay2: 'Bay 2',
      bay3: 'Bay 3',
      dispatch: 'Dispatch',
    },
    skus: [
      sku('SKU-4471', 'M8×30 cap screw',     { bay1: 24, bay3: 96, dispatch: 0 }),
      // RFID shows 1 fewer in bay2 than the ledger, pre-seeded mismatch for cycle count
      sku('SKU-9012', 'Bearing 6204-2RS',    { bay2: 60, bay1: 12 },           { bay2: 59 }),
      sku('SKU-2204', 'Drive belt 1820',     { bay2: 40, dispatch: 8 }),
      sku('SKU-7788', 'Hydraulic seal kit',  { bay1: 18, bay3: 6 }),
    ],
    actions: [
      {
        id: 'move',
        label: 'Move pallet of SKU-4471 from Bay 3 to Dispatch',
        detail: 'Forklift run · 12 units',
        sku: 'SKU-4471',
        qty: 12,
        from: 'bay3',
        to: 'dispatch',
        orderRef: 'C-8842',
        type: 'move',
      },
      {
        id: 'receive',
        label: 'Receive 200 units of SKU-9012 at Goods-In',
        detail: 'PO-3391 · supplier delivery',
        sku: 'SKU-9012',
        qty: 200,
        from: null,
        to: 'goodsIn',
        orderRef: 'PO-3391',
        type: 'receive',
      },
      {
        id: 'pick',
        label: 'Customer order C-8842 picked',
        detail: '8 × SKU-2204 from Bay 2 → Dispatch',
        sku: 'SKU-2204',
        qty: 8,
        from: 'bay2',
        to: 'dispatch',
        orderRef: 'C-8842',
        type: 'pick',
      },
    ],
  },
  {
    id: 'hotel',
    label: 'Hotel',
    short: 'Hotel',
    unit: 'bundle',
    operator: 'HK-04 · A. Costa',
    locationLabels: {
      goodsIn: 'Laundry-In',
      bay1: 'Linen Room A',
      bay2: 'Linen Room B',
      bay3: 'Spa Closet',
      dispatch: 'Floors 4–9 Cart',
    },
    skus: [
      sku('LINEN-K',  'King sheet set',       { bay1: 84, bay2: 32 }),
      sku('LINEN-Q',  'Queen sheet set',      { bay1: 18, bay2: 70 }, { bay2: 68 }),
      sku('TOWEL-BL', 'Bath towel, large',   { bay1: 120, bay3: 36, dispatch: 20 }),
      sku('ROBE-CT',  'Cotton robe',          { bay3: 28, dispatch: 4 }),
    ],
    actions: [
      {
        id: 'move',
        label: 'Move bundle of LINEN-K from Linen Room A to Floors 4–9 Cart',
        detail: 'Housekeeping pull · 24 bundles',
        sku: 'LINEN-K',
        qty: 24,
        from: 'bay1',
        to: 'dispatch',
        orderRef: 'HK-417',
        type: 'move',
      },
      {
        id: 'receive',
        label: 'Receive 200 bundles of LINEN-Q from laundry',
        detail: 'Laundry return · vendor LC-02',
        sku: 'LINEN-Q',
        qty: 200,
        from: null,
        to: 'goodsIn',
        orderRef: 'LC-02-984',
        type: 'receive',
      },
      {
        id: 'pick',
        label: 'Stayover refresh, Floor 7 picked',
        detail: '12 × TOWEL-BL from Linen Room A → Floors Cart',
        sku: 'TOWEL-BL',
        qty: 12,
        from: 'bay1',
        to: 'dispatch',
        orderRef: 'HK-418',
        type: 'pick',
      },
    ],
  },
  {
    id: 'construction',
    label: 'Construction firm',
    short: 'Construction',
    unit: 'unit',
    operator: 'YM-09 · S. Patel',
    locationLabels: {
      goodsIn: 'Returns Yard',
      bay1: 'Tool Cage',
      bay2: 'Plant Bay',
      bay3: 'Consumables',
      dispatch: 'Site Lane',
    },
    skus: [
      sku('EXC-12',   'Mini excavator',       { bay2: 3, dispatch: 1 }),
      sku('SCAF-08',  'Scaffold tower set',   { bay1: 6, bay2: 2 }, { bay2: 1 }),
      sku('GEN-04',   '4 kVA generator',      { bay1: 4, dispatch: 2 }),
      sku('CON-50',   'Consumables pack',     { bay3: 50, dispatch: 4 }),
    ],
    actions: [
      {
        id: 'move',
        label: 'Check-out: EXC-12 from Plant Bay → Site Lane',
        detail: 'Site dispatch · 1 unit',
        sku: 'EXC-12',
        qty: 1,
        from: 'bay2',
        to: 'dispatch',
        orderRef: 'JOB-2207',
        type: 'move',
      },
      {
        id: 'receive',
        label: 'Check-in: 4 × GEN-04 returned from site',
        detail: 'Returns yard · site JOB-2199',
        sku: 'GEN-04',
        qty: 4,
        from: null,
        to: 'goodsIn',
        orderRef: 'JOB-2199',
        type: 'receive',
      },
      {
        id: 'pick',
        label: 'Job JOB-2207 picked for dispatch',
        detail: '2 × SCAF-08 from Tool Cage → Site Lane',
        sku: 'SCAF-08',
        qty: 2,
        from: 'bay1',
        to: 'dispatch',
        orderRef: 'JOB-2207',
        type: 'pick',
      },
    ],
  },
]

const ASSET_BY_ID = Object.fromEntries(ASSET_CLASSES.map((a) => [a.id, a])) as Record<
  AssetClassId,
  AssetClass
>

// --- Reactive state --------------------------------------------------------
const activeClassId = ref<AssetClassId>('parts')
const assetClass = computed(() => ASSET_BY_ID[activeClassId.value])

// Stock kept reactive per asset class so toggling preserves any prior state.
const stockState = reactive(
  Object.fromEntries(
    ASSET_CLASSES.map((a) => [
      a.id,
      a.skus.map((s) => ({
        id: s.id,
        name: s.name,
        ledger: { ...s.ledger },
        rfid: { ...s.rfid },
      })),
    ]),
  ) as Record<AssetClassId, SkuRecord[]>,
)

const movementsState = reactive(
  Object.fromEntries(ASSET_CLASSES.map((a) => [a.id, [] as Movement[]])) as Record<
    AssetClassId,
    Movement[]
  >,
)
const feedState = reactive(
  Object.fromEntries(ASSET_CLASSES.map((a) => [a.id, [] as FeedEvent[]])) as Record<
    AssetClassId,
    FeedEvent[]
  >,
)

const skus = computed(() => stockState[activeClassId.value])
const movements = computed(() => movementsState[activeClassId.value])
const feed = computed(() => feedState[activeClassId.value])

// UI state
const flashingGate = ref<string | null>(null)
const flashingLocation = ref<LocationId | null>(null)
const flashingStock = ref<{ loc: LocationId; sku: string; dir: 'up' | 'down' } | null>(null)
const cycleCountMode = ref(false)
const cycleCountResult = ref<null | {
  loc: LocationId
  perfect: boolean
  rows: { sku: string; ledger: number; rfid: number; delta: number; cause: string | null }[]
}>(null)
const selectedSku = ref<string | null>(null)
const busy = ref(false)

// --- Helpers ---------------------------------------------------------------
let _id = 1
const nextId = () => _id++

function nowStamp(): string {
  const d = new Date()
  return (
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0') +
    ':' +
    String(d.getSeconds()).padStart(2, '0')
  )
}

const timeouts: number[] = []
function later(fn: () => void, ms: number) {
  const t = window.setTimeout(fn, ms) as unknown as number
  timeouts.push(t)
}
onUnmounted(() => {
  for (const t of timeouts) clearTimeout(t)
})

function pushFeed(ev: Omit<FeedEvent, 'id' | 'ts'> & { ts?: string }) {
  const cls = activeClassId.value
  feedState[cls] = [
    { id: nextId(), ts: ev.ts ?? nowStamp(), ...ev },
    ...feedState[cls],
  ].slice(0, 30)
}

function flashGate(gateId: string) {
  flashingGate.value = gateId
  later(() => {
    if (flashingGate.value === gateId) flashingGate.value = null
  }, 1100)
}

function flashLocation(loc: LocationId) {
  flashingLocation.value = loc
  later(() => {
    if (flashingLocation.value === loc) flashingLocation.value = null
  }, 900)
}

function flashStock(loc: LocationId, skuId: string, dir: 'up' | 'down') {
  flashingStock.value = { loc, sku: skuId, dir }
  later(() => {
    if (
      flashingStock.value &&
      flashingStock.value.loc === loc &&
      flashingStock.value.sku === skuId
    ) {
      flashingStock.value = null
    }
  }, 1400)
}

function locationLabel(id: LocationId): string {
  return assetClass.value.locationLabels[id]
}

function findSku(id: string): SkuRecord | undefined {
  return skus.value.find((s) => s.id === id)
}

// --- Triggers --------------------------------------------------------------
function runAction(action: ActionDef) {
  if (busy.value) return
  busy.value = true

  const cls = activeClassId.value
  const op = assetClass.value.operator
  const sourceGateId =
    action.from && LOCATION_BY_ID[action.from] ? LOCATION_BY_ID[action.from].gate.id : 'G-IN'
  const destGate = action.to ? LOCATION_BY_ID[action.to].gate.id : 'G-IN'

  // t=0  RFID gate fires
  flashGate(sourceGateId)
  pushFeed({
    channel: 'rfid',
    line: `${sourceGateId} read · tag ${action.sku}`,
    detail: `${action.qty} × ${assetClass.value.unit}${action.qty === 1 ? '' : 's'} detected`,
  })

  // t=350  destination gate fires + stock moves
  later(() => {
    if (action.from && action.to) flashGate(destGate)
    const target = findSku(action.sku)
    if (!target) return
    if (action.from) {
      target.ledger[action.from] = Math.max(0, target.ledger[action.from] - action.qty)
      target.rfid[action.from] = Math.max(0, target.rfid[action.from] - action.qty)
      flashStock(action.from, target.id, 'down')
    }
    if (action.to) {
      target.ledger[action.to] = (target.ledger[action.to] ?? 0) + action.qty
      target.rfid[action.to] = (target.rfid[action.to] ?? 0) + action.qty
      flashStock(action.to, target.id, 'up')
    }
    if (action.from) flashLocation(action.from)
    if (action.to) flashLocation(action.to)
  }, 350)

  // t=700  ledger entry
  later(() => {
    let line = ''
    if (action.type === 'receive') {
      line = `DR Inventory  CR Accounts Payable · ${action.qty} × ${action.sku}`
    } else if (action.type === 'pick') {
      line = `DR COGS  CR Inventory · ${action.qty} × ${action.sku}`
    } else {
      line = `Inventory location transfer · ${action.qty} × ${action.sku}`
    }
    pushFeed({ channel: 'ledger', line, detail: action.orderRef ? `Ref ${action.orderRef}` : undefined })
  }, 700)

  // t=1000  ERP / order sync
  later(() => {
    let line = ''
    if (action.type === 'receive') {
      line = `PO ${action.orderRef ?? ''} → 3-way matched`
    } else if (action.type === 'pick') {
      line = `Order ${action.orderRef ?? ''} → Picked`
    } else {
      line = `Stock relocation logged · ${assetClass.value.locationLabels[action.from!]} → ${assetClass.value.locationLabels[action.to!]}`
    }
    pushFeed({ channel: action.type === 'move' ? 'erp' : 'order', line, tone: 'good' })
  }, 1000)

  // Movement record
  later(() => {
    movementsState[cls] = [
      {
        id: nextId(),
        ts: nowStamp(),
        sku: action.sku,
        qty: action.qty,
        from: action.from,
        to: action.to,
        operator: op,
        gate: sourceGateId,
        type: action.type,
      },
      ...movementsState[cls],
    ].slice(0, 40)
    busy.value = false
  }, 1200)
}

// --- Cycle count -----------------------------------------------------------
function toggleCycleCount() {
  cycleCountMode.value = !cycleCountMode.value
  cycleCountResult.value = null
}

function runCycleCount(loc: LocationId) {
  if (!cycleCountMode.value || busy.value) return
  busy.value = true

  flashGate(LOCATION_BY_ID[loc].gate.id)
  pushFeed({
    channel: 'rfid',
    line: `Cycle scan started · ${locationLabel(loc)}`,
    detail: `Reader ${LOCATION_BY_ID[loc].gate.id} sweeping`,
  })

  later(() => {
    const rows = skus.value
      .map((s) => {
        const ledger = s.ledger[loc] ?? 0
        const rfid = s.rfid[loc] ?? 0
        const delta = rfid - ledger
        let cause: string | null = null
        if (delta !== 0) {
          if (delta < 0)
            cause =
              'Probable cause: unscanned pick, tag moved out without gate confirmation.'
          else
            cause =
              'Probable cause: pallet relocated into bay without scan, re-tag at gate.'
        }
        return { sku: s.id, ledger, rfid, delta, cause }
      })
      .filter((r) => r.ledger > 0 || r.rfid > 0)

    const perfect = rows.every((r) => r.delta === 0)
    cycleCountResult.value = { loc, perfect, rows }

    pushFeed({
      channel: 'ledger',
      line: perfect
        ? `Cycle count ${locationLabel(loc)}, ledger matches RFID`
        : `Cycle count ${locationLabel(loc)}, mismatch surfaced`,
      tone: perfect ? 'good' : 'warn',
    })

    busy.value = false
  }, 900)
}

function reconcileMismatch() {
  const r = cycleCountResult.value
  if (!r) return
  for (const row of r.rows) {
    if (row.delta !== 0) {
      const target = findSku(row.sku)
      if (target) target.ledger[r.loc] = row.rfid
    }
  }
  pushFeed({
    channel: 'ledger',
    line: `Ledger adjusted to RFID · ${locationLabel(r.loc)}`,
    detail: 'Variance posted to Stock Adjustment',
    tone: 'good',
  })
  cycleCountResult.value = null
}

// --- Reset -----------------------------------------------------------------
function resetAll() {
  const cls = activeClassId.value
  const fresh = ASSET_BY_ID[cls].skus
  stockState[cls] = fresh.map((s) => ({
    id: s.id,
    name: s.name,
    ledger: { ...s.ledger },
    rfid: { ...s.rfid },
  }))
  movementsState[cls] = []
  feedState[cls] = []
  cycleCountMode.value = false
  cycleCountResult.value = null
  selectedSku.value = null
}

// --- Derived view helpers --------------------------------------------------
const channelMeta: Record<ChannelId, { label: string; cls: string }> = {
  rfid:   { label: 'RFID',   cls: 'text-cyan-brand-deep bg-cyan-brand/10 ring-cyan-brand/30' },
  ledger: { label: 'LEDGER', cls: 'text-ink bg-surface-alt ring-line' },
  erp:    { label: 'ERP',    cls: 'text-ink bg-surface-alt ring-line' },
  order:  { label: 'ORDER',  cls: 'text-ink bg-surface-alt ring-line' },
}

function stockAt(loc: LocationId): { sku: string; qty: number }[] {
  return skus.value
    .map((s) => ({ sku: s.id, qty: s.ledger[loc] }))
    .filter((r) => r.qty > 0)
    .sort((a, b) => b.qty - a.qty)
}

function totalAt(loc: LocationId): number {
  return skus.value.reduce((acc, s) => acc + (s.ledger[loc] ?? 0), 0)
}

function hasMismatchAt(loc: LocationId): boolean {
  return skus.value.some((s) => (s.ledger[loc] ?? 0) !== (s.rfid[loc] ?? 0))
}

const selectedSkuRecord = computed(() => (selectedSku.value ? findSku(selectedSku.value) : null))
const selectedSkuMovements = computed(() =>
  selectedSku.value ? movements.value.filter((m) => m.sku === selectedSku.value) : [],
)

function movementSummary(m: Movement): string {
  if (m.type === 'receive') return `Received ${m.qty} × ${m.sku} at ${locationLabel(m.to!)}`
  if (m.type === 'pick') return `Picked ${m.qty} × ${m.sku} → ${locationLabel(m.to!)}`
  return `Moved ${m.qty} × ${m.sku} from ${locationLabel(m.from!)} → ${locationLabel(m.to!)}`
}

</script>

<template>
  <div class="bg-white">
    <!-- Header -->
    <div class="border-b border-line px-4 sm:px-5 md:px-7 py-5 flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <span
          class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
          aria-hidden="true"
        >
          <Radio :size="18" :stroke-width="1.9" />
        </span>
        <div class="min-w-0">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold leading-none">
            Live demo
          </div>
          <div class="mt-1 font-display text-[17px] sm:text-[20px] md:text-[22px] leading-tight text-ink truncate">
            Inventory Clarity, {{ assetClass.label }} warehouse
          </div>
        </div>
      </div>

      <div class="sm:ml-auto flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Asset class"
          class="inline-flex items-center rounded-full border border-line bg-surface-alt p-1"
        >
          <button
            v-for="a in ASSET_CLASSES"
            :key="a.id"
            role="tab"
            type="button"
            :aria-selected="a.id === activeClassId"
            :class="[
              'rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
              a.id === activeClassId
                ? 'bg-white text-ink shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                : 'text-mute-2 hover:text-ink',
            ]"
            @click="activeClassId = a.id; cycleCountResult = null; selectedSku = null"
          >
            {{ a.short }}
          </button>
        </div>

        <button
          type="button"
          :class="[
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
            cycleCountMode
              ? 'bg-ink text-white hover:bg-ink-soft'
              : 'border border-line bg-white text-ink hover:border-cyan-brand/40',
          ]"
          @click="toggleCycleCount"
        >
          <ScanLine :size="14" :stroke-width="2" aria-hidden="true" />
          {{ cycleCountMode ? 'Cycle-count mode' : 'Cycle count' }}
        </button>

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

    <!-- Cycle count banner -->
    <div
      v-if="cycleCountMode && !cycleCountResult"
      class="px-4 sm:px-5 md:px-7 py-3 bg-cyan-brand/5 border-b border-cyan-brand/20 text-[13px] text-ink flex items-center gap-2"
      aria-live="polite"
    >
      <ScanLine :size="14" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
      Tap a bay to sweep its reader and compare RFID against the ledger.
    </div>

    <!-- Main grid -->
    <div class="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-0 lg:divide-x lg:divide-line">
      <!-- LEFT: floor plan + simulator -->
      <div class="p-4 sm:p-5 md:p-7">
        <!-- Floor plan -->
        <div class="relative w-full aspect-[16/9] rounded-2xl bg-surface-alt overflow-hidden ring-1 ring-line">
          <!-- Subtle grid backdrop -->
          <div class="absolute inset-0 grid-bg opacity-50 pointer-events-none" aria-hidden="true" />

          <!-- Connector lines (decorative) -->
          <svg
            class="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 22,50 L 33,18 M 22,50 L 33,50 M 22,50 L 33,82 M 57,18 L 67,50 M 57,50 L 67,50 M 57,82 L 67,50"
              stroke="rgba(15,23,42,0.08)"
              stroke-width="0.25"
              stroke-dasharray="0.8 0.8"
              fill="none"
              vector-effect="non-scaling-stroke"
            />
          </svg>

          <!-- Locations -->
          <button
            v-for="loc in LOCATIONS"
            :key="loc.id"
            type="button"
            :disabled="!cycleCountMode || busy"
            :class="[
              'absolute rounded-xl bg-white border text-left transition-all duration-300 ease-out flex flex-col p-2.5 md:p-3 overflow-hidden',
              flashingLocation === loc.id
                ? 'border-cyan-brand ring-2 ring-cyan-brand/30 shadow-[0_0_0_4px_rgba(1,219,241,0.12)]'
                : hasMismatchAt(loc.id)
                ? 'border-amber-300/70'
                : 'border-line',
              cycleCountMode && !busy
                ? 'cursor-pointer hover:border-cyan-brand hover:ring-2 hover:ring-cyan-brand/20'
                : 'cursor-default',
            ]"
            :style="{
              left: loc.x + '%',
              top: loc.y + '%',
              width: loc.w + '%',
              height: loc.h + '%',
            }"
            :aria-label="`${locationLabel(loc.id)}, ${totalAt(loc.id)} ${assetClass.unit}${totalAt(loc.id) === 1 ? '' : 's'}`"
            @click="runCycleCount(loc.id)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2 truncate">
                {{ locationLabel(loc.id) }}
              </span>
              <span class="text-[10.5px] md:text-[11.5px] tabular-nums font-semibold text-ink">
                {{ totalAt(loc.id) }}
              </span>
            </div>

            <div class="mt-1.5 flex flex-col gap-1 min-h-0">
              <span
                v-for="row in stockAt(loc.id).slice(0, 3)"
                :key="row.sku"
                :class="[
                  'inline-flex items-center justify-between gap-1 rounded-md px-1.5 py-0.5 text-[10px] md:text-[11px] tabular-nums transition-all duration-300',
                  flashingStock && flashingStock.loc === loc.id && flashingStock.sku === row.sku
                    ? flashingStock.dir === 'up'
                      ? 'bg-cyan-brand/20 text-cyan-brand-deep'
                      : 'bg-ink/5 text-ink'
                    : 'bg-surface-alt text-ink',
                ]"
              >
                <span class="font-semibold truncate">{{ row.sku }}</span>
                <span>{{ row.qty }}</span>
              </span>
              <span
                v-if="stockAt(loc.id).length > 3"
                class="text-[10px] text-mute-2"
              >
                +{{ stockAt(loc.id).length - 3 }} more
              </span>
              <span
                v-if="stockAt(loc.id).length === 0"
                class="text-[10.5px] italic text-mute-2"
              >
                empty
              </span>
            </div>
          </button>

          <!-- RFID gates -->
          <span
            v-for="loc in LOCATIONS"
            :key="loc.gate.id"
            :class="[
              'absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-white border px-1.5 py-0.5 text-[9.5px] md:text-[10px] font-semibold tabular-nums transition-all duration-300',
              flashingGate === loc.gate.id
                ? 'border-cyan-brand text-cyan-brand-deep shadow-[0_0_0_6px_rgba(1,219,241,0.18)]'
                : 'border-line text-mute-2',
            ]"
            :style="{ left: loc.gate.x + '%', top: loc.gate.y + '%' }"
            aria-hidden="true"
          >
            <Radio
              :size="9"
              :stroke-width="2.2"
              :class="flashingGate === loc.gate.id ? 'text-cyan-brand-deep' : 'text-mute-2'"
            />
            {{ loc.gate.id }}
          </span>
        </div>

        <!-- SKU strip -->
        <div class="mt-5 flex items-center gap-2 flex-wrap">
          <span class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mr-1">
            <Boxes :size="12" :stroke-width="2" class="inline -mt-0.5 mr-1" aria-hidden="true" />
            SKUs
          </span>
          <button
            v-for="s in skus"
            :key="s.id"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[12px] font-semibold text-ink hover:border-cyan-brand/50 hover:text-cyan-brand-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            :aria-label="`Show movement history for ${s.id}`"
            @click="selectedSku = s.id"
          >
            {{ s.id }}
            <span class="text-mute-2 font-normal">·</span>
            <span class="text-mute tabular-nums font-normal">
              {{ Object.values(s.ledger).reduce((a, b) => a + b, 0) }}
            </span>
            <History :size="11" :stroke-width="2" class="text-mute-2" aria-hidden="true" />
          </button>
        </div>

        <!-- Simulator panel -->
        <div class="mt-6 rounded-2xl border border-line bg-white p-4 md:p-5">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div>
              <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
                Simulator
              </div>
              <div class="mt-1 font-display text-[19px] leading-tight text-ink">
                Fire a physical event
              </div>
            </div>
            <span class="text-[11.5px] text-mute-2 tabular-nums">
              {{ assetClass.operator }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              v-for="(action, idx) in assetClass.actions"
              :key="action.id"
              type="button"
              :disabled="busy || cycleCountMode"
              class="group relative rounded-xl border border-line bg-white p-4 text-left transition-all duration-200 hover:border-cyan-brand/40 hover:shadow-[0_12px_30px_-22px_rgba(15,23,42,0.25)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="runAction(action)"
            >
              <span
                class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-surface-alt text-cyan-brand-deep ring-1 ring-cyan-brand/20 mb-3"
                aria-hidden="true"
              >
                <component
                  :is="idx === 0 ? Truck : idx === 1 ? PackagePlus : ShoppingCart"
                  :size="16"
                  :stroke-width="1.9"
                />
              </span>
              <div class="text-[13.5px] leading-[1.4] font-semibold text-ink">
                {{ action.label }}
              </div>
              <div class="mt-1 text-[12px] text-mute">
                {{ action.detail }}
              </div>
              <div class="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-mute-2 group-hover:text-cyan-brand-deep transition-colors">
                Fire event
                <ArrowRight :size="12" :stroke-width="2" class="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT: live sync feed -->
      <aside class="p-4 sm:p-5 md:p-7 bg-surface-alt/40 lg:bg-transparent">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              Live sync
            </div>
            <div class="mt-1 font-display text-[19px] leading-tight text-ink">
              RFID → Ledger → ERP
            </div>
          </div>
          <span class="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2">
            <span class="dot" />
            Streaming
          </span>
        </div>

        <ol class="mt-4 space-y-2 max-h-[560px] overflow-y-auto pr-1" aria-live="polite">
          <li
            v-for="ev in feed"
            :key="ev.id"
            class="rounded-xl border border-line bg-white p-3"
          >
            <div class="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold">
              <span
                :class="[
                  'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ring-1',
                  channelMeta[ev.channel].cls,
                ]"
              >
                <component
                  :is="ev.channel === 'rfid' ? Radio : ev.channel === 'ledger' ? FileText : ev.channel === 'erp' ? Zap : Activity"
                  :size="10"
                  :stroke-width="2.2"
                />
                {{ channelMeta[ev.channel].label }}
              </span>
              <span class="text-mute-2 tabular-nums tracking-normal normal-case">{{ ev.ts }}</span>
              <span
                v-if="ev.tone === 'good'"
                class="ml-auto inline-flex items-center gap-0.5 text-cyan-brand-deep normal-case tracking-normal"
              >
                <CheckCircle2 :size="11" :stroke-width="2.2" />
                synced
              </span>
              <span
                v-else-if="ev.tone === 'warn'"
                class="ml-auto inline-flex items-center gap-0.5 text-amber-600 normal-case tracking-normal"
              >
                <AlertTriangle :size="11" :stroke-width="2.2" />
                mismatch
              </span>
            </div>
            <div class="mt-1.5 text-[13px] leading-[1.45] text-ink">
              {{ ev.line }}
            </div>
            <div v-if="ev.detail" class="mt-0.5 text-[12px] text-mute">
              {{ ev.detail }}
            </div>
          </li>

          <li
            v-if="!feed.length"
            class="rounded-xl border border-dashed border-line bg-white/60 p-5 text-center text-[13px] text-mute"
          >
            Fire an event to see RFID, the ledger, and the order system update in lock-step.
          </li>
        </ol>
      </aside>
    </div>

    <!-- Cycle count result -->
    <div
      v-if="cycleCountResult"
      class="border-t border-line bg-surface-alt/50 p-4 sm:p-5 md:p-7"
      aria-live="polite"
    >
      <div class="flex items-start gap-3 flex-wrap">
        <span
          :class="[
            'inline-flex items-center justify-center h-10 w-10 rounded-xl ring-1',
            cycleCountResult.perfect
              ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
              : 'bg-amber-50 text-amber-600 ring-amber-200',
          ]"
        >
          <component
            :is="cycleCountResult.perfect ? CheckCircle2 : AlertTriangle"
            :size="18"
            :stroke-width="1.9"
          />
        </span>
        <div class="min-w-0 flex-1">
          <div class="font-display text-[20px] leading-tight text-ink">
            Cycle count · {{ locationLabel(cycleCountResult.loc) }}
          </div>
          <p class="mt-1 text-[13.5px] text-mute">
            <template v-if="cycleCountResult.perfect">
              RFID sweep matches the ledger line for line.
            </template>
            <template v-else>
              RFID sweep disagrees with the ledger. Cause inferred from movement history.
            </template>
          </p>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button
            v-if="!cycleCountResult.perfect"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-ink text-white px-3 py-2 text-[12.5px] font-semibold hover:bg-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="reconcileMismatch"
          >
            Adjust ledger to RFID
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-line bg-white text-mute hover:text-ink hover:border-cyan-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            aria-label="Close cycle count result"
            @click="cycleCountResult = null"
          >
            <X :size="14" :stroke-width="2" />
          </button>
        </div>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table class="w-full text-[13px] border-separate border-spacing-0">
          <thead>
            <tr class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
              <th class="text-left py-2 pr-3">SKU</th>
              <th class="text-right py-2 pr-3 tabular-nums">Ledger</th>
              <th class="text-right py-2 pr-3 tabular-nums">RFID</th>
              <th class="text-right py-2 pr-3 tabular-nums">Δ</th>
              <th class="text-left py-2 pr-3">Probable cause</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in cycleCountResult.rows"
              :key="row.sku"
              class="bg-white"
            >
              <td class="border-t border-line py-2 pr-3 font-semibold text-ink">{{ row.sku }}</td>
              <td class="border-t border-line py-2 pr-3 text-right tabular-nums text-ink">{{ row.ledger }}</td>
              <td class="border-t border-line py-2 pr-3 text-right tabular-nums text-ink">{{ row.rfid }}</td>
              <td
                :class="[
                  'border-t border-line py-2 pr-3 text-right tabular-nums font-semibold',
                  row.delta === 0 ? 'text-mute-2' : 'text-amber-600',
                ]"
              >
                {{ row.delta > 0 ? '+' : '' }}{{ row.delta }}
              </td>
              <td class="border-t border-line py-2 pr-3 text-mute">
                <span v-if="row.cause">{{ row.cause }}</span>
                <span v-else class="text-mute-2">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Movement history -->
    <div
      v-if="selectedSkuRecord"
      class="border-t border-line p-4 sm:p-5 md:p-7"
      aria-live="polite"
    >
      <div class="flex items-start gap-3 flex-wrap">
        <span
          class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-surface-alt text-cyan-brand-deep ring-1 ring-cyan-brand/25"
          aria-hidden="true"
        >
          <History :size="18" :stroke-width="1.9" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            Movement history
          </div>
          <div class="mt-1 font-display text-[22px] leading-tight text-ink">
            {{ selectedSkuRecord.id }} · {{ selectedSkuRecord.name }}
          </div>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-line bg-white text-mute hover:text-ink hover:border-cyan-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          aria-label="Close movement history"
          @click="selectedSku = null"
        >
          <X :size="14" :stroke-width="2" />
        </button>
      </div>

      <ol v-if="selectedSkuMovements.length" class="mt-5 space-y-2">
        <li
          v-for="m in selectedSkuMovements"
          :key="m.id"
          class="rounded-xl border border-line bg-white p-3 flex flex-wrap items-center gap-3"
        >
          <span class="text-[12px] tabular-nums text-mute-2 w-[68px]">{{ m.ts }}</span>
          <span
            :class="[
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold ring-1',
              m.type === 'receive'
                ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                : m.type === 'pick'
                ? 'bg-surface-alt text-ink ring-line'
                : 'bg-surface-alt text-ink ring-line',
            ]"
          >
            {{ m.type === 'receive' ? 'Receive' : m.type === 'pick' ? 'Pick' : 'Move' }}
          </span>
          <span class="text-[13px] text-ink flex-1 min-w-0">
            {{ movementSummary(m) }}
          </span>
          <span class="inline-flex items-center gap-1 text-[12px] text-mute-2 tabular-nums">
            <Radio :size="11" :stroke-width="2" />
            {{ m.gate }}
          </span>
          <span class="text-[12px] text-mute-2">{{ m.operator }}</span>
        </li>
      </ol>

      <p
        v-else
        class="mt-5 rounded-xl border border-dashed border-line bg-surface-alt/60 p-5 text-center text-[13px] text-mute"
      >
        No movements yet for {{ selectedSkuRecord.id }}. Fire an event from the simulator to see this SKU's history fill in.
      </p>
    </div>
  </div>
</template>
