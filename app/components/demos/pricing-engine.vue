<script setup lang="ts">
import { computed, h, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ArrowRight, Briefcase, Building2, Check, ChevronDown, ChevronUp, FileText, Hotel, Info, Layers, ListChecks, Lock, PenLine, Plus, Receipt, RotateCcw, Search, ShieldCheck, Sparkles, Tag, Target, TriangleAlert, Wrench, X } from '@lucide/vue'

type Business = 'parts' | 'hotel' | 'consulting'
type Tier = 't1' | 't2' | 't3' | 'strategic'
type ArtefactKey = 'pdf' | 'esign' | 'crm' | 'opp'

interface SKU {
  id: string
  code: string
  name: string
  unit: string          // 'each', 'night', 'sprint', etc.
  list: number
  cost: number
  // Optional fixed override per tier, when present, overrides the composed
  // price after the volume break (still subject to manual discount + margin).
  contractOverrides?: Partial<Record<Tier, number>>
  // Optional tag shown in the catalogue card (e.g. "Anchor SKU").
  tag?: string
}

interface BusinessConfig {
  key: Business
  label: string
  short: string
  icon: Component
  // Catalogue / line-item language
  catalogueTitle: string
  qtyNoun: string            // "qty" / "nights" / "modules"
  unitColLabel: string       // "Unit price"
  // Tier display
  tierLabels: Record<Tier, { name: string; short: string }>
  tierDiscounts: Record<Tier, number>   // off list, fraction
  // Volume / scope break
  volumeLabel: string        // "Volume break" / "Length-of-stay" / "Scope bundle"
  volumeBasis: 'lineQty' | 'quoteLineCount'
  volumeBreaks: { threshold: number; pct: number; basisLabel: string }[]
  // Margin guard
  marginFloorPct: number
  approver: { name: string; role: string; sla: string }
  // Catalogue copy
  contractLabel: string
  // Initial lines
  initial: { skuId: string; qty: number }[]
}

interface QuoteLine {
  id: number
  skuId: string
  qty: number
  // Manual discount %, additive on top of the composed price. Capped at 100.
  manualPct: number
  // True once the user has pushed past the margin floor via approval flow.
  approvedBreach?: boolean
}

interface BreakdownStep {
  label: string
  detail?: string
  unitPriceAfter: number
  // Optional delta off the previous step (negative for discounts).
  deltaPct?: number
  kind: 'list' | 'tier' | 'volume' | 'override' | 'manual' | 'final'
  applied: boolean
}

// ============================================================================
// Catalogue data
// ============================================================================

const PARTS_SKUS: SKU[] = [
  { id: 'p-brk220', code: 'BRK-220',  name: 'Brake Caliper Mk2',     unit: 'each',  list: 186,  cost: 112,
    contractOverrides: { strategic: 108 }, tag: 'Strategic contract' },
  { id: 'p-hyd410', code: 'HYD-410',  name: 'Hydraulic Pump 4.0',    unit: 'each',  list: 1240, cost: 720,
    contractOverrides: { strategic: 760 }, tag: 'Strategic contract' },
  { id: 'p-seno2',  code: 'SEN-O2',   name: 'O₂ Sensor',        unit: 'each',  list: 94,   cost: 48 },
  { id: 'p-bltm12', code: 'BLT-M12',  name: 'M12 Bolt (50-pack)',    unit: 'pack',  list: 32,   cost: 14 },
  { id: 'p-fltair', code: 'FLT-AIR',  name: 'Air Filter Type-A',     unit: 'each',  list: 46,   cost: 20 },
  { id: 'p-brg62',  code: 'BRG-6204', name: 'Bearing 6204-ZZ',       unit: 'each',  list: 28,   cost: 11 },
  { id: 'p-gskhd',  code: 'GSK-HEAD', name: 'Head Gasket V8',        unit: 'each',  list: 148,  cost: 74 },
  { id: 'p-wpr',    code: 'WPR-OEM',  name: 'Wiper Blade OEM',       unit: 'each',  list: 22,   cost: 8 },
  { id: 'p-alt',    code: 'ALT-180A', name: 'Alternator 180A',       unit: 'each',  list: 560,  cost: 310 },
  { id: 'p-ign',    code: 'IGN-COIL', name: 'Ignition Coil Pack',    unit: 'each',  list: 128,  cost: 58 },
]

const HOTEL_SKUS: SKU[] = [
  { id: 'h-stdking',  code: 'STD-KING',    name: 'Standard King',          unit: 'night',  list: 260,  cost: 108 },
  { id: 'h-dlxocean', code: 'DLX-OCEAN',   name: 'Deluxe Ocean View',      unit: 'night',  list: 410,  cost: 148 },
  { id: 'h-steexec',  code: 'STE-EXEC',    name: 'Executive Suite',        unit: 'night',  list: 620,  cost: 208 },
  { id: 'h-stepres',  code: 'STE-PRES',    name: 'Presidential Suite',     unit: 'night',  list: 1180, cost: 360,
    contractOverrides: { strategic: 880 }, tag: 'Loyalty VIP rate' },
  { id: 'h-break',    code: 'EXTR-BREAK',  name: 'Breakfast Add-on',       unit: 'pax/day', list: 32,   cost: 11 },
  { id: 'h-trf',      code: 'EXTR-AIRTRF', name: 'Airport Transfer',       unit: 'trip',   list: 48,   cost: 18 },
  { id: 'h-spa',      code: 'EXTR-SPA',    name: 'Spa Package',            unit: 'guest',  list: 120,  cost: 42 },
  { id: 'h-dine',     code: 'EXTR-DINE',   name: "Chef's Tasting Menu",    unit: 'cover',  list: 95,   cost: 34 },
]

const CONSULTING_SKUS: SKU[] = [
  { id: 'c-disc',   code: 'DISC-WORK',   name: 'Discovery Workshop (2-day)', unit: 'engagement', list: 9800,  cost: 3200 },
  { id: 'c-arch',   code: 'ARCH-REV',    name: 'Architecture Review',        unit: 'engagement', list: 14500, cost: 5200 },
  { id: 'c-impl',   code: 'IMPL-SPRINT', name: 'Implementation Sprint',      unit: 'sprint',     list: 22000, cost: 9500 },
  { id: 'c-data',   code: 'DATA-MIGR',   name: 'Data Migration Engagement',  unit: 'engagement', list: 28400, cost: 11200,
    contractOverrides: { strategic: 22500 }, tag: 'Partner pricing' },
  { id: 'c-change', code: 'CHANGE-MGMT', name: 'Change Management Program',  unit: 'program',    list: 18200, cost: 7800 },
  { id: 'c-train',  code: 'TRAIN-PROG',  name: 'Training Program (3 cohorts)', unit: 'program',  list: 12600, cost: 4200 },
  { id: 'c-mon',    code: 'MONITOR-90D', name: '90-Day Hypercare',           unit: 'engagement', list: 16800, cost: 5400 },
  { id: 'c-bench',  code: 'BENCH-AUDIT', name: 'Benchmark & Audit',          unit: 'engagement', list: 7400,  cost: 2400 },
]

const BUSINESSES: Record<Business, BusinessConfig> = {
  parts: {
    key: 'parts',
    label: 'Parts distribution',
    short: 'Parts',
    icon: Wrench,
    catalogueTitle: 'Parts catalogue',
    qtyNoun: 'qty',
    unitColLabel: 'Unit price',
    tierLabels: {
      t1:        { name: 'Tier 1 · Distributor', short: 'Distributor' },
      t2:        { name: 'Tier 2 · Reseller',    short: 'Reseller' },
      t3:        { name: 'Tier 3 · End customer', short: 'End customer' },
      strategic: { name: 'Strategic account',     short: 'Strategic' },
    },
    tierDiscounts: { t1: 0.35, t2: 0.22, t3: 0, strategic: 0.28 },
    volumeLabel: 'Volume break',
    volumeBasis: 'lineQty',
    volumeBreaks: [
      { threshold: 10,  pct: 0.03, basisLabel: '≥10 units'  },
      { threshold: 50,  pct: 0.07, basisLabel: '≥50 units'  },
      { threshold: 100, pct: 0.12, basisLabel: '≥100 units' },
    ],
    marginFloorPct: 22,
    approver: { name: 'Anya Pillay', role: 'Sales Director', sla: '2 h' },
    contractLabel: 'Contract override',
    initial: [
      { skuId: 'p-brk220', qty: 25 },
      { skuId: 'p-hyd410', qty: 8 },
    ],
  },
  hotel: {
    key: 'hotel',
    label: 'Hotel · seasonal',
    short: 'Hotel',
    icon: Hotel,
    catalogueTitle: 'Rate & extras card',
    qtyNoun: 'qty',
    unitColLabel: 'Nightly rate',
    tierLabels: {
      t1:        { name: 'Corporate contract', short: 'Corporate' },
      t2:        { name: 'Travel agency',      short: 'Travel agency' },
      t3:        { name: 'Direct guest',       short: 'Direct guest' },
      strategic: { name: 'Loyalty VIP',        short: 'Loyalty VIP' },
    },
    tierDiscounts: { t1: 0.28, t2: 0.18, t3: 0, strategic: 0.22 },
    volumeLabel: 'Length-of-stay discount',
    volumeBasis: 'lineQty',
    volumeBreaks: [
      { threshold: 3,  pct: 0.05, basisLabel: '≥3 nights'  },
      { threshold: 7,  pct: 0.10, basisLabel: '≥7 nights'  },
      { threshold: 14, pct: 0.15, basisLabel: '≥14 nights' },
    ],
    marginFloorPct: 18,
    approver: { name: 'Marcus Chen', role: 'Revenue Manager', sla: '1 h' },
    contractLabel: 'Loyalty override',
    initial: [
      { skuId: 'h-dlxocean', qty: 5 },
      { skuId: 'h-break',    qty: 5 },
      { skuId: 'h-trf',      qty: 2 },
    ],
  },
  consulting: {
    key: 'consulting',
    label: 'Consulting · scope',
    short: 'Consulting',
    icon: Briefcase,
    catalogueTitle: 'Service catalogue',
    qtyNoun: 'units',
    unitColLabel: 'Per unit',
    tierLabels: {
      t1:        { name: 'Enterprise',        short: 'Enterprise' },
      t2:        { name: 'Mid-market',        short: 'Mid-market' },
      t3:        { name: 'SMB',               short: 'SMB' },
      strategic: { name: 'Strategic partner', short: 'Strategic partner' },
    },
    tierDiscounts: { t1: 0, t2: 0.12, t3: 0.22, strategic: 0.28 },
    volumeLabel: 'Scope bundle break',
    volumeBasis: 'quoteLineCount',
    volumeBreaks: [
      { threshold: 3, pct: 0.08, basisLabel: '≥3 modules' },
      { threshold: 5, pct: 0.14, basisLabel: '≥5 modules' },
      { threshold: 8, pct: 0.20, basisLabel: '≥8 modules' },
    ],
    marginFloorPct: 28,
    approver: { name: 'Priya Reddy', role: 'Practice Lead', sla: '4 h' },
    contractLabel: 'Partner override',
    initial: [
      { skuId: 'c-disc', qty: 1 },
      { skuId: 'c-arch', qty: 1 },
      { skuId: 'c-impl', qty: 1 },
    ],
  },
}

const SKUS_BY_BUSINESS: Record<Business, SKU[]> = {
  parts:      PARTS_SKUS,
  hotel:      HOTEL_SKUS,
  consulting: CONSULTING_SKUS,
}

// ============================================================================
// State
// ============================================================================

const activeBusiness = ref<Business>('parts')
const cfg = computed(() => BUSINESSES[activeBusiness.value])
const skus = computed(() => SKUS_BY_BUSINESS[activeBusiness.value])
const skuById = computed(() => {
  const m: Record<string, SKU> = {}
  for (const s of skus.value) m[s.id] = s
  return m
})

const tier = ref<Tier>('t2')

const lines = reactive<QuoteLine[]>([])
let nextLineId = 1

const search = ref('')
const inspectedLineId = ref<number | null>(null)
const justAddedLineId = ref<number | null>(null)

// Margin breach modal state
interface BreachState {
  lineId: number
  attemptedPct: number
  previousPct: number
  attemptedMarginPct: number
}
const breach = ref<BreachState | null>(null)

// Artefact destination tracking
interface ArtefactState {
  done: boolean
  flying: boolean
  ts?: string
  ref?: string  // e.g. "v3" or "Opp #4582"
}
const artefacts = reactive<Record<ArtefactKey, ArtefactState>>({
  pdf:   { done: false, flying: false },
  esign: { done: false, flying: false },
  crm:   { done: false, flying: false },
  opp:   { done: false, flying: false },
})

const ARTEFACT_META: Record<ArtefactKey, {
  label: string
  destination: string
  icon: Component
  refTemplate: () => string
}> = {
  pdf: {
    label: 'Generate quote PDF',
    destination: 'Document store',
    icon: FileText,
    refTemplate: () => 'Quote v3 · ' + ts(),
  },
  esign: {
    label: 'Send to e-sign',
    destination: 'Signing queue',
    icon: PenLine,
    refTemplate: () => 'DocuSign · awaiting buyer',
  },
  crm: {
    label: 'Push to CRM',
    destination: 'CRM record',
    icon: Building2,
    refTemplate: () => 'CRM acct synced',
  },
  opp: {
    label: 'Log to opportunity',
    destination: 'Opportunity ledger',
    icon: Target,
    refTemplate: () => 'Opp #' + (4500 + Math.floor(Math.random() * 200)),
  },
}

function ts() {
  const d = new Date()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ============================================================================
// Catalogue search
// ============================================================================

const filteredCatalogue = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return skus.value
  return skus.value.filter(
    (s) =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q),
  )
})

// ============================================================================
// Pricing engine, core composition
// ============================================================================

type VolumeBreak = { threshold: number; pct: number; basisLabel: string }

function pickVolumeBreak(basis: number): VolumeBreak | null {
  const matches = cfg.value.volumeBreaks.filter((b) => basis >= b.threshold)
  return matches.length > 0 ? (matches[matches.length - 1] ?? null) : null
}

function volumeBasisFor(line: QuoteLine): number {
  if (cfg.value.volumeBasis === 'quoteLineCount') return lines.length
  return line.qty
}

interface ComputedLine {
  line: QuoteLine
  sku: SKU
  unitList: number
  tierPct: number
  unitAfterTier: number
  volBreak: { threshold: number; pct: number; basisLabel: string } | null
  unitAfterVol: number
  override?: number
  unitAfterOverride: number
  manualPct: number
  unitFinal: number
  lineTotal: number
  lineCogs: number
  marginPct: number
  breakdown: BreakdownStep[]
}

function computeLine(line: QuoteLine): ComputedLine | null {
  const sku = skuById.value[line.skuId]
  if (!sku) return null

  const unitList = sku.list
  const tierPct = cfg.value.tierDiscounts[tier.value]
  const unitAfterTier = unitList * (1 - tierPct)

  const volBreak = pickVolumeBreak(volumeBasisFor(line))
  const volPct = volBreak?.pct ?? 0
  const unitAfterVol = unitAfterTier * (1 - volPct)

  const override = sku.contractOverrides?.[tier.value]
  const unitAfterOverride = override !== undefined ? override : unitAfterVol

  const manualPct = clamp(line.manualPct, 0, 100) / 100
  const unitFinal = Math.max(0, unitAfterOverride * (1 - manualPct))

  const lineTotal = unitFinal * line.qty
  const lineCogs = sku.cost * line.qty
  const marginPct = lineTotal > 0 ? ((lineTotal - lineCogs) / lineTotal) * 100 : 0

  const breakdown: BreakdownStep[] = []

  breakdown.push({
    label: 'List price',
    detail: `${sku.code} · catalogue rate`,
    unitPriceAfter: unitList,
    kind: 'list',
    applied: true,
  })

  breakdown.push({
    label: `${cfg.value.tierLabels[tier.value].short} discount`,
    detail: tierPct > 0
      ? `Tier rule: −${pctLabel(tierPct)} off list`
      : 'No tier discount at this level',
    unitPriceAfter: unitAfterTier,
    deltaPct: -tierPct,
    kind: 'tier',
    applied: tierPct > 0,
  })

  breakdown.push({
    label: cfg.value.volumeLabel,
    detail: volBreak
      ? `${volBreak.basisLabel} · −${pctLabel(volBreak.pct)}`
      : 'No break unlocked at current volume',
    unitPriceAfter: unitAfterVol,
    deltaPct: volBreak ? -volBreak.pct : 0,
    kind: 'volume',
    applied: !!volBreak,
  })

  breakdown.push({
    label: cfg.value.contractLabel,
    detail: override !== undefined
      ? `Fixed rate for ${cfg.value.tierLabels[tier.value].short}`
      : 'No override on this SKU for this tier',
    unitPriceAfter: unitAfterOverride,
    kind: 'override',
    applied: override !== undefined,
  })

  if (manualPct > 0) {
    breakdown.push({
      label: 'Manual discount',
      detail: line.approvedBreach
        ? `−${pctLabel(manualPct)} · approved by ${cfg.value.approver.name}`
        : `−${pctLabel(manualPct)}`,
      unitPriceAfter: unitFinal,
      deltaPct: -manualPct,
      kind: 'manual',
      applied: true,
    })
  }

  breakdown.push({
    label: 'Final unit price',
    detail: `× ${line.qty} ${sku.unit}${line.qty === 1 ? '' : 's'}`,
    unitPriceAfter: unitFinal,
    kind: 'final',
    applied: true,
  })

  return {
    line, sku, unitList, tierPct, unitAfterTier, volBreak, unitAfterVol,
    override, unitAfterOverride, manualPct: manualPct, unitFinal,
    lineTotal, lineCogs, marginPct, breakdown,
  }
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function pctLabel(frac: number) {
  return Math.round(frac * 1000) / 10 + '%'
}

// ============================================================================
// Reactive computed lines + roll-ups
// ============================================================================

const computedLines = computed(() => {
  const out: ComputedLine[] = []
  for (const l of lines) {
    const c = computeLine(l)
    if (c) out.push(c)
  }
  return out
})

const totalNet = computed(() => computedLines.value.reduce((s, c) => s + c.lineTotal, 0))
const totalCogs = computed(() => computedLines.value.reduce((s, c) => s + c.lineCogs, 0))
const weightedMargin = computed(() =>
  totalNet.value > 0 ? ((totalNet.value - totalCogs.value) / totalNet.value) * 100 : 0,
)
const marginBelowFloor = computed(() => weightedMargin.value < cfg.value.marginFloorPct)
const totalUnits = computed(() => lines.reduce((s, l) => s + l.qty, 0))

// ============================================================================
// Mutations
// ============================================================================

function addSku(skuId: string) {
  const existing = lines.find((l) => l.skuId === skuId)
  let pulseId: number
  if (existing) {
    existing.qty = existing.qty + 1
    pulseId = existing.id
  } else {
    pulseId = nextLineId++
    lines.push({ id: pulseId, skuId, qty: 1, manualPct: 0 })
  }
  justAddedLineId.value = pulseId
  resetArtefacts()
  setTimeout(() => {
    if (justAddedLineId.value === pulseId) justAddedLineId.value = null
  }, 700)
}

function removeLine(id: number) {
  const idx = lines.findIndex((l) => l.id === id)
  if (idx >= 0) lines.splice(idx, 1)
  if (inspectedLineId.value === id) inspectedLineId.value = null
  resetArtefacts()
}

function bumpQty(line: QuoteLine, delta: number) {
  const newQty = clamp(line.qty + delta, 1, 9999)
  if (newQty === line.qty) return
  line.qty = newQty
  // Manual discounts re-evaluated against floor, but qty change alone
  // generally improves margin via volume breaks. No breach check needed.
  resetArtefacts()
}

function onDiscountInput(line: QuoteLine, el: HTMLInputElement) {
  const newPct = clamp(Number(el.value), 0, 100)
  const prev = line.manualPct

  // Always keep the visible input synced to the last accepted state.
  // (If we reject the change below, we still need the DOM to snap back.)
  const syncDom = () => { el.value = String(line.manualPct) }

  if (newPct === prev) { syncDom(); return }

  const sim: QuoteLine = { ...line, manualPct: newPct, approvedBreach: false }
  const c = computeLine(sim)
  if (!c) { syncDom(); return }

  if (c.marginPct < cfg.value.marginFloorPct) {
    breach.value = {
      lineId: line.id,
      attemptedPct: newPct,
      previousPct: prev,
      attemptedMarginPct: c.marginPct,
    }
    syncDom()
    return
  }

  line.manualPct = newPct
  line.approvedBreach = false
  resetArtefacts()
}

function cancelBreach() {
  breach.value = null
}

function approveBreach() {
  if (!breach.value) return
  const ln = lines.find((l) => l.id === breach.value!.lineId)
  if (ln) {
    ln.manualPct = breach.value.attemptedPct
    ln.approvedBreach = true
  }
  breach.value = null
  resetArtefacts()
}

function inspect(id: number | null) {
  inspectedLineId.value = inspectedLineId.value === id ? null : id
}

// ============================================================================
// Artefacts
// ============================================================================

let artefactTimers: ReturnType<typeof setTimeout>[] = []

function fireArtefact(k: ArtefactKey) {
  if (artefacts[k].done || artefacts[k].flying) return
  artefacts[k].flying = true
  artefactTimers.push(
    setTimeout(() => {
      artefacts[k].flying = false
      artefacts[k].done = true
      artefacts[k].ts = ts()
      artefacts[k].ref = ARTEFACT_META[k].refTemplate()
    }, 720),
  )
}

function resetArtefacts() {
  for (const t of artefactTimers) clearTimeout(t)
  artefactTimers = []
  for (const k of Object.keys(artefacts) as ArtefactKey[]) {
    artefacts[k].done = false
    artefacts[k].flying = false
    artefacts[k].ts = undefined
    artefacts[k].ref = undefined
  }
}

const artefactCount = computed(() =>
  (Object.keys(artefacts) as ArtefactKey[]).filter((k) => artefacts[k].done).length,
)

// Convenience context for the breach modal, keeps template free of '!' asserts.
const breachContext = computed(() => {
  const b = breach.value
  if (!b) return null
  const line = lines.find((l) => l.id === b.lineId)
  const sku = line ? skuById.value[line.skuId] : undefined
  return { breach: b, line, sku }
})

// ============================================================================
// Business / tier switching
// ============================================================================

function loadInitial(b: Business) {
  lines.splice(0)
  for (const seed of BUSINESSES[b].initial) {
    lines.push({ id: nextLineId++, skuId: seed.skuId, qty: seed.qty, manualPct: 0 })
  }
  inspectedLineId.value = null
  search.value = ''
  resetArtefacts()
}

function switchBusiness(b: Business) {
  if (activeBusiness.value === b) return
  activeBusiness.value = b
  // Reset tier to a sensible mid-range default per business.
  tier.value = b === 'consulting' ? 't2' : 't2'
  loadInitial(b)
}

watch(tier, () => {
  // Tier change may invalidate prior manual discounts (lower tier price ⇒
  // existing discount could now breach). Reset only the breach-approved
  // markers so the floor re-applies; keep the user-set manualPct.
  for (const l of lines) {
    if (l.approvedBreach) l.approvedBreach = false
  }
  resetArtefacts()
})

// Initial load.
loadInitial(activeBusiness.value)

onBeforeUnmount(() => {
  for (const t of artefactTimers) clearTimeout(t)
})

// ============================================================================
// Formatting
// ============================================================================

const currency = (n: number, big = false) => {
  if (big || n >= 1000) {
    return '$' + Math.round(n).toLocaleString('en-US')
  }
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const initials = (name: string) =>
  name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

// ============================================================================
// Tier order (for rendering)
// ============================================================================

const TIER_ORDER: Tier[] = ['t1', 't2', 't3', 'strategic']

</script>

<template>
  <div class="pe-root bg-white">
    <!-- ====================== Header / intro ====================== -->
    <header class="border-b border-line bg-white px-4 sm:px-5 md:px-6 py-4 md:py-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Live demo
          </div>
          <h3 class="mt-2 font-display text-[20px] sm:text-[24px] md:text-[28px] leading-[1.15] text-ink">
            One engine. Three rule sets. The right number every time.
          </h3>
          <p class="mt-1.5 text-[14px] text-mute max-w-2xl">
            Add lines from the catalogue, switch tiers, push a discount past the margin floor. The engine composes the price, blocks underwater lines, and emits an audit-grade quote.
          </p>
        </div>
      </div>

      <!-- Business toggle -->
      <div class="mt-5">
        <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2">
          Business · rule set
        </div>
        <div role="tablist" aria-label="Business rule set" class="flex flex-wrap gap-2">
          <button
            v-for="(meta, key) in BUSINESSES"
            :key="key"
            type="button"
            role="tab"
            :aria-selected="activeBusiness === key"
            @click="switchBusiness(key as Business)"
            :class="[
              'inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              activeBusiness === key
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-ink border-line hover:border-cyan-brand/40',
            ]"
          >
            <component :is="meta.icon" :size="15" :stroke-width="1.9" aria-hidden="true" />
            {{ meta.label }}
          </button>
        </div>
      </div>

      <!-- Customer tier -->
      <div class="mt-4">
        <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2">
          Customer
        </div>
        <div role="tablist" aria-label="Customer tier" class="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            v-for="t in TIER_ORDER"
            :key="t"
            type="button"
            role="tab"
            :aria-selected="tier === t"
            @click="tier = t"
            :class="[
              'flex flex-col items-start text-left rounded-xl border px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              tier === t
                ? 'border-cyan-brand/45 bg-cyan-brand/8 ring-1 ring-cyan-brand/25'
                : 'border-line bg-white hover:border-cyan-brand/40',
            ]"
          >
            <span
              :class="[
                'text-[10.5px] uppercase tracking-[0.18em] font-semibold',
                tier === t ? 'text-cyan-brand-deep' : 'text-mute-2',
              ]"
            >
              {{ t === 'strategic' ? 'Strategic' : 'Tier ' + t.slice(1) }}
            </span>
            <span class="mt-0.5 text-[14px] font-semibold text-ink leading-tight">
              {{ cfg.tierLabels[t].short }}
            </span>
            <span class="mt-0.5 text-[11.5px] text-mute font-mono">
              −{{ Math.round(cfg.tierDiscounts[t] * 100) }}% off list
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- ============================== MAIN GRID ============================== -->
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <!-- ----------------------- Catalogue ----------------------- -->
      <aside
        class="border-b lg:border-b-0 lg:border-r border-line flex flex-col"
        aria-label="Catalogue"
      >
        <div class="px-4 sm:px-5 md:px-6 py-4 border-b border-line flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              {{ cfg.catalogueTitle }}
            </div>
            <div class="mt-1 text-[12.5px] text-mute truncate">
              {{ skus.length }} {{ cfg.short === 'Hotel' ? 'rate codes' : 'SKUs' }} · click + to add
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-alt/70 px-2.5 py-1 text-[11.5px] text-mute"
            aria-hidden="true"
          >
            <Layers :size="12" :stroke-width="2" />
            {{ cfg.short }}
          </span>
        </div>

        <div class="px-4 sm:px-5 md:px-6 py-3 border-b border-line bg-surface-alt/40">
          <label class="block">
            <span class="sr-only">Search catalogue</span>
            <span class="relative flex items-center">
              <Search
                :size="15"
                :stroke-width="2"
                class="absolute left-3 text-mute-2"
                aria-hidden="true"
              />
              <input
                v-model="search"
                type="text"
                placeholder="Search by code or name…"
                class="pe-input w-full rounded-xl border border-line bg-white pl-9 pr-3 py-2.5 text-[14.5px] text-ink placeholder:text-mute-2 focus:outline-none focus:border-cyan-brand focus:shadow-[0_0_0_3px_rgba(1,219,241,0.22)] transition-all"
              />
            </span>
          </label>
        </div>

        <div class="pe-catalogue overflow-y-auto px-3 md:px-3.5 py-3">
          <ul class="flex flex-col gap-2">
            <li
              v-for="s in filteredCatalogue"
              :key="s.id"
              class="rounded-xl border border-line bg-white px-3 py-2.5 flex items-center gap-3 hover:border-cyan-brand/40 transition-colors"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[11.5px] font-mono text-mute-2 uppercase tracking-wide">
                    {{ s.code }}
                  </span>
                  <span
                    v-if="s.tag"
                    class="inline-flex items-center rounded-full bg-cyan-brand/10 text-cyan-brand-deep border border-cyan-brand/25 px-2 py-0.5 text-[10.5px] font-semibold"
                  >
                    {{ s.tag }}
                  </span>
                </div>
                <div class="mt-0.5 text-[14px] text-ink font-semibold leading-tight truncate">
                  {{ s.name }}
                </div>
                <div class="mt-0.5 text-[12px] text-mute">
                  {{ currency(s.list) }}/{{ s.unit }} · cost {{ currency(s.cost) }}
                </div>
              </div>
              <button
                type="button"
                @click="addSku(s.id)"
                class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-ink text-white hover:bg-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                :aria-label="`Add ${s.name} to quote`"
              >
                <Plus :size="16" :stroke-width="2.2" />
              </button>
            </li>

            <li
              v-if="!filteredCatalogue.length"
              class="rounded-xl border border-dashed border-line bg-surface-alt/40 px-3 py-6 text-center text-[13px] text-mute"
            >
              No matches for “{{ search }}”.
            </li>
          </ul>
        </div>
      </aside>

      <!-- ----------------------- Quote ----------------------- -->
      <section class="flex flex-col" aria-label="Quote builder">
        <div class="px-4 sm:px-5 md:px-6 py-4 border-b border-line flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              Quote · live
            </div>
            <div class="mt-1 text-[12.5px] text-mute truncate">
              {{ cfg.tierLabels[tier].name }} · {{ lines.length }} lines · {{ totalUnits }} {{ cfg.qtyNoun }}
            </div>
          </div>
          <button
            type="button"
            @click="loadInitial(activeBusiness)"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-mute hover:text-ink hover:border-cyan-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Reset quote"
          >
            <RotateCcw :size="13" :stroke-width="2" />
            Reset
          </button>
        </div>

        <!-- Lines -->
        <div class="pe-lines overflow-y-auto px-3 md:px-4 py-3">
          <transition-group name="pe-line" tag="ul" class="flex flex-col gap-2.5">
            <li
              v-for="c in computedLines"
              :key="c.line.id"
              :class="[
                'rounded-xl border bg-white transition-colors',
                inspectedLineId === c.line.id
                  ? 'border-cyan-brand/45 ring-1 ring-cyan-brand/20'
                  : 'border-line',
                justAddedLineId === c.line.id ? 'pe-line-pulse' : '',
              ]"
            >
              <div class="flex flex-col sm:flex-row sm:items-stretch">
                <!-- Identity -->
                <div class="flex-1 min-w-0 px-3.5 py-3 sm:py-3.5">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[11px] font-mono text-mute-2 uppercase tracking-wide">
                      {{ c.sku.code }}
                    </span>
                    <span
                      v-if="c.line.approvedBreach"
                      class="inline-flex items-center gap-1 rounded-full bg-cyan-brand/10 text-cyan-brand-deep border border-cyan-brand/30 px-2 py-0.5 text-[10.5px] font-semibold"
                    >
                      <ShieldCheck :size="10" :stroke-width="2.4" />
                      Approved · {{ cfg.approver.name }}
                    </span>
                    <span
                      v-else-if="c.override !== undefined"
                      class="inline-flex items-center gap-1 rounded-full bg-surface-alt text-mute border border-line px-2 py-0.5 text-[10.5px] font-semibold"
                    >
                      <Tag :size="10" :stroke-width="2.4" />
                      Override active
                    </span>
                  </div>
                  <div class="mt-0.5 text-[14px] font-semibold text-ink leading-tight">
                    {{ c.sku.name }}
                  </div>

                  <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px]">
                    <!-- Qty -->
                    <div class="inline-flex items-center gap-1.5">
                      <span class="text-mute-2">{{ cfg.qtyNoun }}</span>
                      <div class="inline-flex items-center rounded-lg border border-line overflow-hidden">
                        <button
                          type="button"
                          @click="bumpQty(c.line, -1)"
                          class="h-7 w-7 inline-flex items-center justify-center text-mute hover:text-ink hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                          :aria-label="`Decrease quantity for ${c.sku.name}`"
                        >−</button>
                        <span class="px-2.5 text-[13px] font-semibold text-ink min-w-[2ch] text-center">{{ c.line.qty }}</span>
                        <button
                          type="button"
                          @click="bumpQty(c.line, +1)"
                          class="h-7 w-7 inline-flex items-center justify-center text-mute hover:text-ink hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                          :aria-label="`Increase quantity for ${c.sku.name}`"
                        >+</button>
                      </div>
                    </div>

                    <!-- Manual discount -->
                    <div class="inline-flex items-center gap-1.5">
                      <span class="text-mute-2">Discount</span>
                      <div class="inline-flex items-center rounded-lg border border-line overflow-hidden">
                        <input
                          :value="c.line.manualPct"
                          @change="(e) => onDiscountInput(c.line, e.target as HTMLInputElement)"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          class="pe-disc h-7 w-12 text-center text-[13px] font-semibold text-ink bg-white focus:outline-none focus:bg-surface-alt"
                          :aria-label="`Manual discount % for ${c.sku.name}`"
                        />
                        <span class="px-1.5 text-[12px] text-mute-2 border-l border-line h-7 inline-flex items-center">%</span>
                      </div>
                    </div>

                    <!-- Why this price -->
                    <button
                      type="button"
                      @click="inspect(c.line.id)"
                      :class="[
                        'inline-flex items-center gap-1 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded',
                        inspectedLineId === c.line.id ? 'text-cyan-brand-deep' : 'text-mute hover:text-cyan-brand-deep',
                      ]"
                    >
                      <Info :size="13" :stroke-width="2" />
                      Why this price?
                      <component
                        :is="inspectedLineId === c.line.id ? ChevronUp : ChevronDown"
                        :size="13"
                        :stroke-width="2"
                      />
                    </button>
                  </div>
                </div>

                <!-- Totals -->
                <div
                  class="sm:w-[200px] sm:border-l border-t sm:border-t-0 border-line px-3.5 py-3 flex flex-col sm:items-end gap-1 bg-surface-alt/30"
                >
                  <div class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    Line total
                  </div>
                  <div class="font-display text-[22px] leading-none text-ink">
                    {{ currency(c.lineTotal) }}
                  </div>
                  <div class="text-[12px] text-mute font-mono">
                    {{ currency(c.unitFinal) }}/{{ c.sku.unit }}
                  </div>
                  <div
                    :class="[
                      'text-[11.5px] font-semibold inline-flex items-center gap-1',
                      c.marginPct < cfg.marginFloorPct
                        ? 'text-red-600'
                        : c.marginPct < cfg.marginFloorPct + 5
                        ? 'text-ink'
                        : 'text-cyan-brand-deep',
                    ]"
                  >
                    <TriangleAlert
                      v-if="c.marginPct < cfg.marginFloorPct"
                      :size="11"
                      :stroke-width="2.4"
                    />
                    {{ c.marginPct.toFixed(1) }}% margin
                  </div>
                </div>

                <!-- Remove -->
                <button
                  type="button"
                  @click="removeLine(c.line.id)"
                  class="absolute-or-corner inline-flex items-center justify-center h-8 w-8 self-start sm:self-center m-2 rounded-lg text-mute-2 hover:text-ink hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                  :aria-label="`Remove ${c.sku.name}`"
                >
                  <X :size="14" :stroke-width="2" />
                </button>
              </div>

              <!-- Rule inspector (inline expansion) -->
              <transition name="pe-expand">
                <div
                  v-if="inspectedLineId === c.line.id"
                  class="border-t border-line bg-surface-alt/50 px-4 py-4"
                >
                  <div class="text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold flex items-center gap-1.5">
                    <ListChecks :size="12" :stroke-width="2.2" />
                    Rule stack
                  </div>
                  <ol class="mt-3 flex flex-col gap-1.5">
                    <li
                      v-for="(step, i) in c.breakdown"
                      :key="i"
                      :class="[
                        'flex items-start gap-3 rounded-lg border px-3 py-2 transition-colors',
                        step.kind === 'final'
                          ? 'border-cyan-brand/40 bg-cyan-brand/8'
                          : step.applied
                          ? 'border-line bg-white'
                          : 'border-dashed border-line bg-white opacity-60',
                      ]"
                    >
                      <span
                        :class="[
                          'inline-flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-semibold ring-1 shrink-0 mt-0.5',
                          step.kind === 'final'
                            ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-cyan-brand/35'
                            : step.applied
                            ? 'bg-white text-ink ring-line'
                            : 'bg-surface-alt text-mute-2 ring-line',
                        ]"
                        aria-hidden="true"
                      >{{ i + 1 }}</span>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-[13px] font-semibold text-ink">{{ step.label }}</span>
                          <span
                            v-if="step.deltaPct && step.applied"
                            class="text-[11.5px] font-mono"
                            :class="step.deltaPct < 0 ? 'text-cyan-brand-deep' : 'text-mute'"
                          >
                            {{ step.deltaPct < 0 ? '−' : '+' }}{{ Math.abs(step.deltaPct * 100).toFixed(1) }}%
                          </span>
                          <span
                            v-if="!step.applied"
                            class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold"
                          >
                            Not applied
                          </span>
                        </div>
                        <div
                          v-if="step.detail"
                          class="text-[12.5px] text-mute mt-0.5 leading-[1.4]"
                        >
                          {{ step.detail }}
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <div
                          :class="[
                            'font-mono text-[13px]',
                            step.kind === 'final' ? 'text-cyan-brand-deep font-semibold' : 'text-ink',
                          ]"
                        >
                          {{ currency(step.unitPriceAfter) }}
                        </div>
                        <div class="text-[10.5px] text-mute-2 uppercase tracking-[0.16em]">per {{ c.sku.unit }}</div>
                      </div>
                    </li>
                  </ol>

                  <p class="mt-3 text-[12px] text-mute italic flex items-start gap-1.5">
                    <Sparkles :size="12" :stroke-width="2" class="mt-0.5 text-cyan-brand-deep shrink-0" />
                    Same stack, every line, every quote, change the tier and watch every row recompose.
                  </p>
                </div>
              </transition>
            </li>

            <li
              v-if="!lines.length"
              key="empty"
              class="rounded-xl border border-dashed border-line bg-surface-alt/40 px-3 py-8 text-center text-[13.5px] text-mute"
            >
              Add a line from the catalogue to start a quote.
            </li>
          </transition-group>
        </div>

        <!-- Totals -->
        <div class="border-t border-line bg-white px-4 sm:px-5 md:px-6 py-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div>
              <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                Net total
              </div>
              <div class="mt-1 font-display text-[20px] sm:text-[24px] md:text-[28px] leading-[1.05] text-ink">
                {{ currency(totalNet, true) }}
              </div>
            </div>
            <div>
              <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                Weighted COGS
              </div>
              <div class="mt-1 font-display text-[18px] sm:text-[20px] md:text-[22px] leading-[1.1] text-ink">
                {{ currency(totalCogs, true) }}
              </div>
            </div>
            <div>
              <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold flex items-center gap-1">
                Margin
                <span
                  class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold border"
                  :class="marginBelowFloor
                    ? 'border-red-100 bg-red-50 text-red-600'
                    : 'border-line bg-white text-mute-2'"
                >
                  Floor {{ cfg.marginFloorPct }}%
                </span>
              </div>
              <div
                :class="[
                  'mt-1 font-display text-[20px] sm:text-[24px] md:text-[28px] leading-[1.05] inline-flex items-center gap-1.5',
                  marginBelowFloor ? 'text-red-600' : 'text-ink',
                ]"
              >
                <TriangleAlert
                  v-if="marginBelowFloor"
                  :size="18"
                  :stroke-width="2"
                />
                {{ weightedMargin.toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ====================== Output actions / artefacts ====================== -->
    <div class="border-t border-line bg-surface-alt/40 px-4 sm:px-5 md:px-6 py-4 md:py-5">
      <div class="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div>
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold inline-flex items-center gap-1.5">
            <Receipt :size="12" :stroke-width="2.2" />
            Quote actions
          </div>
          <p class="mt-1 text-[13px] text-mute">
            One click each. The engine emits the artefact to its destination, audit-trail attached.
          </p>
        </div>
        <span
          v-if="artefactCount"
          class="inline-flex items-center gap-1.5 rounded-full bg-cyan-brand/10 text-cyan-brand-deep border border-cyan-brand/25 px-2.5 py-1 text-[11.5px] font-semibold"
        >
          <Check :size="11" :stroke-width="2.5" />
          {{ artefactCount }} of 4 emitted
        </span>
      </div>

      <!-- Destinations row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
        <div
          v-for="(meta, k) in ARTEFACT_META"
          :key="k"
          :class="[
            'relative rounded-xl border bg-white px-3 py-3 transition-colors',
            artefacts[k as ArtefactKey].done
              ? 'border-cyan-brand/40 ring-1 ring-cyan-brand/20'
              : 'border-line',
          ]"
        >
          <div class="flex items-start gap-2.5">
            <span
              :class="[
                'inline-flex items-center justify-center h-9 w-9 rounded-lg ring-1 shrink-0',
                artefacts[k as ArtefactKey].done
                  ? 'bg-cyan-brand/12 text-cyan-brand-deep ring-cyan-brand/30'
                  : 'bg-surface-alt text-mute-2 ring-line',
              ]"
              aria-hidden="true"
            >
              <component :is="meta.icon" :size="16" :stroke-width="1.9" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                {{ meta.destination }}
              </div>
              <div class="text-[13px] font-semibold text-ink leading-tight truncate">
                {{ meta.label.replace(/^(Generate |Send to |Push to |Log to )/, '') }}
              </div>
              <transition name="pe-fade">
                <div
                  v-if="artefacts[k as ArtefactKey].done"
                  class="mt-1 text-[11.5px] text-cyan-brand-deep font-mono flex items-center gap-1"
                >
                  <Check :size="11" :stroke-width="2.5" />
                  {{ artefacts[k as ArtefactKey].ref }} · {{ artefacts[k as ArtefactKey].ts }}
                </div>
              </transition>
              <div
                v-if="!artefacts[k as ArtefactKey].done && !artefacts[k as ArtefactKey].flying"
                class="mt-1 text-[11px] text-mute-2"
              >
                Awaiting dispatch
              </div>
              <div
                v-if="artefacts[k as ArtefactKey].flying"
                class="mt-1 text-[11px] text-mute inline-flex items-center gap-1"
              >
                <span class="pe-dot" /><span class="pe-dot" /><span class="pe-dot" />
                Dispatching…
              </div>
            </div>
          </div>

          <!-- Flying artefact chip -->
          <div
            v-if="artefacts[k as ArtefactKey].flying"
            class="pe-fly pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-1"
            aria-hidden="true"
          >
            <span class="inline-flex items-center justify-center h-7 px-2 rounded-full bg-ink text-white text-[11px] font-semibold shadow-md">
              <component :is="meta.icon" :size="11" :stroke-width="2.2" />
              <span class="ml-1">{{ cfg.short }} quote</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Action buttons row -->
      <div class="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
        <button
          v-for="(meta, k) in ARTEFACT_META"
          :key="k"
          type="button"
          :disabled="!lines.length || artefacts[k as ArtefactKey].done || artefacts[k as ArtefactKey].flying || marginBelowFloor"
          @click="fireArtefact(k as ArtefactKey)"
          :class="[
            'group inline-flex items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
            !lines.length || marginBelowFloor
              ? 'bg-surface-alt text-mute-2 border border-line cursor-not-allowed'
              : artefacts[k as ArtefactKey].done
              ? 'bg-white text-mute border border-line cursor-default'
              : 'bg-ink text-white hover:bg-ink-soft border border-ink',
          ]"
          :aria-label="meta.label"
        >
          <span class="inline-flex items-center gap-2">
            <component :is="meta.icon" :size="14" :stroke-width="2" />
            {{ meta.label }}
          </span>
          <component
            :is="artefacts[k as ArtefactKey].done ? Check : ArrowRight"
            :size="14"
            :stroke-width="2"
            :class="!artefacts[k as ArtefactKey].done ? 'transition-transform group-hover:translate-x-0.5' : ''"
          />
        </button>
      </div>

      <p
        v-if="marginBelowFloor && lines.length"
        class="mt-3 text-[12.5px] text-red-600 inline-flex items-start gap-1.5"
      >
        <Lock :size="13" :stroke-width="2.2" class="mt-0.5 shrink-0" />
        Quote actions are locked while the weighted margin sits below the {{ cfg.marginFloorPct }}% floor.
      </p>
    </div>

    <!-- ============================== MARGIN BREACH MODAL ============================== -->
    <transition name="pe-modal">
      <div
        v-if="breachContext"
        class="pe-modal-wrap absolute inset-0 z-30 flex items-end md:items-center justify-center bg-ink/30 backdrop-blur-[2px] px-4 py-6"
        role="dialog"
        aria-modal="true"
        :aria-label="`Margin floor breach for ${breachContext.sku?.name ?? 'line'}`"
      >
        <div class="w-full max-w-md rounded-2xl bg-white border border-line shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] overflow-hidden">
          <div class="px-5 py-4 border-b border-line bg-red-50/60 flex items-start gap-3">
            <span class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-red-100 text-red-600 shrink-0">
              <TriangleAlert :size="18" :stroke-width="2" />
            </span>
            <div>
              <div class="text-[11px] uppercase tracking-[0.22em] text-red-600 font-semibold">
                Margin floor breached
              </div>
              <div class="mt-1 font-display text-[22px] leading-[1.1] text-ink">
                {{ breachContext.sku?.name ?? 'Line' }}
              </div>
              <p class="mt-1.5 text-[13.5px] text-mute leading-[1.5]">
                A {{ breachContext.breach.attemptedPct }}% manual discount would drop this line's margin to
                <span class="font-semibold text-red-600">{{ breachContext.breach.attemptedMarginPct.toFixed(1) }}%</span>
               , below the {{ cfg.marginFloorPct }}% floor for {{ cfg.label }}.
              </p>
            </div>
          </div>

          <div class="px-5 py-4">
            <div class="text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              Approval routes to
            </div>
            <div class="mt-2 flex items-center gap-3">
              <span class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-surface-alt text-mute font-semibold text-[12.5px] border border-line shrink-0">
                {{ initials(cfg.approver.name) }}
              </span>
              <div class="min-w-0">
                <div class="text-[14px] font-semibold text-ink leading-tight">
                  {{ cfg.approver.name }}
                </div>
                <div class="text-[12.5px] text-mute leading-tight">
                  {{ cfg.approver.role }} · SLA {{ cfg.approver.sla }}
                </div>
              </div>
            </div>

            <p class="mt-3 text-[12.5px] text-mute-2 italic">
              The line is blocked until approval lands. The full rule stack, including this attempted discount, is attached to the approval request.
            </p>
          </div>

          <div class="px-5 py-3 border-t border-line bg-surface-alt/40 flex items-center justify-end gap-2">
            <button
              type="button"
              @click="cancelBreach"
              class="inline-flex items-center justify-center rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] font-semibold text-ink hover:border-cyan-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="approveBreach"
              class="inline-flex items-center gap-1.5 rounded-lg bg-ink text-white px-3 py-2 text-[13.5px] font-semibold hover:bg-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Request approval
              <ArrowRight :size="13" :stroke-width="2.2" />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.pe-root {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
}

.pe-catalogue {
  min-height: 320px;
  max-height: 420px;
}
.pe-lines {
  min-height: 320px;
  max-height: 420px;
}

@media (min-width: 1024px) {
  .pe-catalogue,
  .pe-lines {
    min-height: 440px;
    max-height: 460px;
  }
}

/* iOS auto-zoom guard */
.pe-input { font-size: 16px; }
@media (min-width: 768px) { .pe-input { font-size: 14.5px; } }

.pe-disc { -moz-appearance: textfield; }
.pe-disc::-webkit-outer-spin-button,
.pe-disc::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

/* Line enter / leave */
.pe-line-enter-from { opacity: 0; transform: translateY(8px); }
.pe-line-enter-active,
.pe-line-leave-active { transition: opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1); }
.pe-line-leave-to { opacity: 0; transform: translateY(-4px); }

/* Just-added pulse */
@keyframes pe-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(1, 219, 241, 0.55); }
  60%  { box-shadow: 0 0 0 8px rgba(1, 219, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(1, 219, 241, 0); }
}
.pe-line-pulse { animation: pe-pulse 700ms cubic-bezier(0.22, 1, 0.36, 1); }

/* Rule-stack expand */
.pe-expand-enter-from { opacity: 0; max-height: 0; }
.pe-expand-enter-active { transition: opacity 220ms ease, max-height 320ms cubic-bezier(0.22, 1, 0.36, 1); overflow: hidden; }
.pe-expand-enter-to { opacity: 1; max-height: 800px; }
.pe-expand-leave-from { opacity: 1; max-height: 800px; }
.pe-expand-leave-active { transition: opacity 160ms ease, max-height 260ms cubic-bezier(0.22, 1, 0.36, 1); overflow: hidden; }
.pe-expand-leave-to { opacity: 0; max-height: 0; }

/* Fade for artefact ref */
.pe-fade-enter-from { opacity: 0; transform: translateY(2px); }
.pe-fade-enter-active { transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1); }
.pe-fade-enter-to { opacity: 1; transform: translateY(0); }

/* Dispatch dots */
.pe-dot {
  display: inline-block;
  width: 4px; height: 4px;
  margin: 0 1px;
  border-radius: 9999px;
  background: #94a3b8;
  animation: pe-bounce 1.2s infinite;
}
.pe-dot:nth-child(2) { animation-delay: 0.15s; }
.pe-dot:nth-child(3) { animation-delay: 0.30s; }
@keyframes pe-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
  40%           { transform: translateY(-3px); opacity: 1; }
}

/* Flying artefact chip, rises out of the destination card */
@keyframes pe-fly {
  0%   { transform: translate(-50%, 80%) scale(0.85); opacity: 0; }
  30%  { transform: translate(-50%, 0%)  scale(1.0);  opacity: 1; }
  100% { transform: translate(-50%, -160%) scale(0.95); opacity: 0; }
}
.pe-fly { animation: pe-fly 720ms cubic-bezier(0.22, 1, 0.36, 1); }

/* Modal */
.pe-modal-enter-from { opacity: 0; }
.pe-modal-enter-active { transition: opacity 220ms ease; }
.pe-modal-enter-to { opacity: 1; }
.pe-modal-leave-from { opacity: 1; }
.pe-modal-leave-active { transition: opacity 180ms ease; }
.pe-modal-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .pe-line-enter-active,
  .pe-line-leave-active,
  .pe-expand-enter-active,
  .pe-expand-leave-active,
  .pe-fade-enter-active,
  .pe-modal-enter-active,
  .pe-modal-leave-active { transition: none !important; }
  .pe-line-pulse,
  .pe-dot,
  .pe-fly { animation: none !important; }
}
</style>
