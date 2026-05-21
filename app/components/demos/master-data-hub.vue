<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Activity, ArrowRight, Badge, Building2, CircleCheck, Clock, Cog, CreditCard, Database, FileSpreadsheet, GitMerge, Globe, HardHat, Hexagon, IdCard, Inbox, Landmark, LifeBuoy, Loader, MapPin, Megaphone, Monitor, Package, Pencil, Receipt, RefreshCw, Send, ShieldCheck, Sparkles, Store, Tag, Truck, UserCheck, Users, Wallet, Warehouse, Wrench, X } from '@lucide/vue'

type EntityId = 'customer' | 'supplier' | 'product' | 'employee' | 'asset'
type TileStatus =
  | 'idle'
  | 'propagating'
  | 'updated'
  | 'conflict'
  | 'pending-review'

interface FieldDef {
  id: string
  label: string
  editable: boolean
}

interface SystemDef {
  id: string
  label: string
  team: string
  icon: Component
}

interface BeforeRow {
  systemId: string
  value: string
  source: string
}

interface EntityDef {
  id: EntityId
  label: string
  short: string
  icon: Component
  recordTitle: string
  recordSubtitle: string
  fields: FieldDef[]
  golden: Record<string, string>
  systems: SystemDef[]
  conflictField: string
  beforeField: string
  before: BeforeRow[]
  beforeCost: { label: string; sub: string }
  demoTarget: { fieldId: string; newValue: string }
  conflictAttempt: string
}

interface TileState {
  status: TileStatus
  flashFieldId?: string
  oldValue?: string
  newValue?: string
}

interface LogEntry {
  id: number
  ts: number
  text: string
  kind: 'propagation' | 'conflict' | 'rule' | 'edit'
}

// =============================================================================
// Reference data (one block per entity)
// =============================================================================

const ENTITIES: EntityDef[] = [
  {
    id: 'customer',
    label: 'Customer',
    short: 'Customer',
    icon: Users,
    recordTitle: 'Customer · Atlas Logistics (Pty) Ltd',
    recordSubtitle: 'GR-CUS-00184 · canonical record',
    fields: [
      { id: 'name',     label: 'Legal name',       editable: false },
      { id: 'contact',  label: 'Primary contact',  editable: true },
      { id: 'shipping', label: 'Shipping address', editable: true },
      { id: 'billing',  label: 'Billing address',  editable: true },
      { id: 'taxId',    label: 'Tax / VAT number', editable: true },
      { id: 'segment',  label: 'Segment',          editable: true },
    ],
    golden: {
      name:     'Atlas Logistics (Pty) Ltd',
      contact:  'Naledi Mahlangu · ops@atlas.co.za',
      shipping: 'Unit 14, Capricorn Park, Muizenberg 7945',
      billing:  '23rd Floor, Portside Tower, Cape Town 8001',
      taxId:    'VAT 4520198472',
      segment:  'Enterprise · cold-chain',
    },
    systems: [
      { id: 'crm',        label: 'CRM',         team: 'Sales',     icon: Users },
      { id: 'accounting', label: 'Accounting',  team: 'Finance',   icon: Receipt },
      { id: 'support',    label: 'Support',     team: 'CS',        icon: LifeBuoy },
      { id: 'marketing',  label: 'Marketing',   team: 'Marketing', icon: Megaphone },
      { id: 'billing',    label: 'Billing',     team: 'Finance',   icon: CreditCard },
      { id: 'shipping',   label: 'Shipping',    team: 'Ops',       icon: Truck },
    ],
    conflictField: 'shipping',
    beforeField:   'shipping',
    before: [
      { systemId: 'crm',        value: 'Unit 14, Capricorn Park, Muizenberg', source: 'Sales rep typed it from a phone call · Q2 2024' },
      { systemId: 'accounting', value: '23rd Floor, Portside Tower, Cape Town', source: 'A/R copied from the first invoice ever issued' },
      { systemId: 'support',    value: 'Atlas warehouse, 14 Capricorn Way',     source: 'Support agent re-typed from a ticket footer' },
      { systemId: 'marketing',  value: '23rd Floor, Portside Tower, Cape Town', source: 'Mailchimp import in 2023' },
      { systemId: 'billing',    value: '23rd Floor, Portside Tower, Cape Town', source: 'Synced from Accounting at go-live' },
      { systemId: 'shipping',   value: 'Atlas, Capricorn Industrial, M\'berg',  source: 'WMS operator best guess — courier kept asking' },
    ],
    beforeCost: {
      label: 'R 28,400 / quarter wasted',
      sub: 'Returned shipments, redirect fees, customer-service hours spent confirming addresses.',
    },
    demoTarget: {
      fieldId: 'shipping',
      newValue: '14 Capricorn Park, Muizenberg 7945 (new bay 3)',
    },
    conflictAttempt: 'Unit 14, Cap. Park, Muizenberg 7950',
  },
  {
    id: 'supplier',
    label: 'Supplier',
    short: 'Supplier',
    icon: Building2,
    recordTitle: 'Supplier · Karoo Coffee Roasters CC',
    recordSubtitle: 'GR-SUP-00417 · canonical record',
    fields: [
      { id: 'name',    label: 'Legal name',         editable: false },
      { id: 'contact', label: 'Primary contact',    editable: true },
      { id: 'taxId',   label: 'Tax / VAT number',   editable: true },
      { id: 'terms',   label: 'Payment terms',      editable: true },
      { id: 'bank',    label: 'Bank account',       editable: true },
      { id: 'class',   label: 'Spend category',     editable: true },
    ],
    golden: {
      name:    'Karoo Coffee Roasters CC',
      contact: 'Pieter du Toit · pieter@karooroasters.com',
      taxId:   'VAT 4180273619',
      terms:   'Net 30 · early-pay 2% / 10',
      bank:    'FNB · 62518473291 · branch 250655',
      class:   'Raw materials · F&B',
    },
    systems: [
      { id: 'erp',         label: 'ERP',           team: 'Finance Ops',  icon: Cog },
      { id: 'procurement', label: 'Procurement',   team: 'Sourcing',     icon: Inbox },
      { id: 'ap',          label: 'Accounts Payable', team: 'Finance',   icon: Wallet },
      { id: 'compliance',  label: 'Compliance',    team: 'Risk',         icon: ShieldCheck },
      { id: 'treasury',    label: 'Treasury',      team: 'Treasury',     icon: Landmark },
      { id: 'sustain',     label: 'Sustainability',team: 'ESG',          icon: Globe },
    ],
    conflictField: 'bank',
    beforeField:   'bank',
    before: [
      { systemId: 'erp',         value: 'FNB · 62518473291 · branch 250655',  source: 'ERP master · last verified Q4 2024' },
      { systemId: 'procurement', value: 'FNB · 62518473291 · branch 250655',  source: 'Procurement synced from ERP' },
      { systemId: 'ap',          value: 'Nedbank · 1185374029 · branch 198765', source: 'Vendor email change — A/P updated without verification' },
      { systemId: 'compliance',  value: 'FNB · 62518473291 · branch 250655',  source: 'KYC pack on file · independent verification' },
      { systemId: 'treasury',    value: 'Nedbank · 1185374029 · branch 198765', source: 'Treasury matched A/P at next pay run' },
      { systemId: 'sustain',     value: 'FNB · 62518473291 · branch 250655',  source: 'ESG vendor file — original onboarding' },
    ],
    beforeCost: {
      label: '2 fraud near-misses · 9 days of A/P friction',
      sub: 'A spoofed email changed the bank account in A/P only; the hub would have refused without compliance + ERP agreement.',
    },
    demoTarget: {
      fieldId: 'terms',
      newValue: 'Net 45 · early-pay 2.5% / 10 (re-negotiated)',
    },
    conflictAttempt: 'Net 60 · no discount',
  },
  {
    id: 'product',
    label: 'Product',
    short: 'Product',
    icon: Package,
    recordTitle: 'Product · ZAB-COLD-S 8L stackable crate',
    recordSubtitle: 'GR-PRD-09421 · canonical record',
    fields: [
      { id: 'sku',    label: 'SKU',          editable: false },
      { id: 'name',   label: 'Display name', editable: true },
      { id: 'price',  label: 'Unit price',   editable: true },
      { id: 'weight', label: 'Weight',       editable: true },
      { id: 'dims',   label: 'Dimensions',   editable: true },
      { id: 'cat',    label: 'Category',     editable: true },
    ],
    golden: {
      sku:    'ZAB-COLD-S',
      name:   'Stackable cold-chain crate · 8 L',
      price:  'R 184.50 incl. VAT',
      weight: '1.42 kg empty',
      dims:   '320 × 240 × 180 mm',
      cat:    'Cold-chain · reusable',
    },
    systems: [
      { id: 'pim',         label: 'PIM',           team: 'Merch',     icon: Database },
      { id: 'ecom',        label: 'E-commerce',    team: 'Digital',   icon: Store },
      { id: 'warehouse',   label: 'Warehouse',     team: 'Ops',       icon: Warehouse },
      { id: 'marketplace', label: 'Marketplace',   team: 'Channels',  icon: Tag },
      { id: 'erp',         label: 'ERP',           team: 'Finance',   icon: Cog },
      { id: 'returns',     label: 'Returns portal',team: 'CS',        icon: LifeBuoy },
    ],
    conflictField: 'price',
    beforeField:   'price',
    before: [
      { systemId: 'pim',         value: 'R 184.50 incl. VAT',         source: 'PIM · canonical at the merch team' },
      { systemId: 'ecom',        value: 'R 184.50 incl. VAT',         source: 'Auto-pulled from PIM nightly' },
      { systemId: 'warehouse',   value: 'R 165.00 (legacy excl. VAT)', source: 'WMS still on pre-2024 cost-plus margin' },
      { systemId: 'marketplace', value: 'R 199.00 incl. VAT',          source: 'Marketplace manager raised it during promo, never reverted' },
      { systemId: 'erp',         value: 'R 184.50 incl. VAT',          source: 'ERP price master · synced from PIM' },
      { systemId: 'returns',     value: 'R 159.00 (2023 list)',         source: 'Returns refund table — last touched 14 months ago' },
    ],
    beforeCost: {
      label: 'R 11k / month in mis-charged refunds',
      sub: 'Customer pays one price online and gets refunded a different price on return. Marketplace flags listing as inconsistent.',
    },
    demoTarget: {
      fieldId: 'price',
      newValue: 'R 192.00 incl. VAT',
    },
    conflictAttempt: 'R 199.00 incl. VAT (channel override)',
  },
  {
    id: 'employee',
    label: 'Employee',
    short: 'Employee',
    icon: UserCheck,
    recordTitle: 'Employee · Lerato Khumalo',
    recordSubtitle: 'GR-EMP-01298 · canonical record',
    fields: [
      { id: 'name',    label: 'Full name',      editable: false },
      { id: 'role',    label: 'Role',           editable: true },
      { id: 'dept',    label: 'Department',     editable: true },
      { id: 'manager', label: 'Reports to',     editable: true },
      { id: 'email',   label: 'Work email',     editable: true },
      { id: 'payroll', label: 'Payroll number', editable: false },
    ],
    golden: {
      name:    'Lerato Khumalo',
      role:    'Senior Data Engineer',
      dept:    'Platform — Data',
      manager: 'Tendai Moyo (VP Engineering)',
      email:   'lerato.khumalo@zabble.org',
      payroll: 'P-01298',
    },
    systems: [
      { id: 'hris',     label: 'HRIS',          team: 'People',  icon: IdCard },
      { id: 'payroll',  label: 'Payroll',       team: 'Finance', icon: Wallet },
      { id: 'directory',label: 'IT directory',  team: 'IT',      icon: Monitor },
      { id: 'comms',    label: 'Slack / comms', team: 'IT',      icon: Send },
      { id: 'benefits', label: 'Benefits',      team: 'People',  icon: ShieldCheck },
      { id: 'access',   label: 'Badge access',  team: 'Facilities', icon: Badge },
    ],
    conflictField: 'dept',
    beforeField:   'dept',
    before: [
      { systemId: 'hris',      value: 'Platform — Data',      source: 'HRIS · canonical after the Q1 re-org' },
      { systemId: 'payroll',   value: 'Engineering',           source: 'Payroll on the pre-re-org cost-centre map' },
      { systemId: 'directory', value: 'Data Engineering',      source: 'IT directory edited locally by a sysadmin' },
      { systemId: 'comms',     value: 'Data Engineering',      source: 'Slack workspace · synced from IT directory' },
      { systemId: 'benefits',  value: 'Platform — Data',       source: 'Benefits provider · synced from HRIS at hire' },
      { systemId: 'access',    value: 'Engineering',           source: 'Badge system · pre-re-org seat assignment' },
    ],
    beforeCost: {
      label: 'Org chart wrong on 18 hires last quarter',
      sub: 'Benefits onboarding misrouted, cost-centre allocations needed manual correction every payroll run.',
    },
    demoTarget: {
      fieldId: 'role',
      newValue: 'Staff Data Engineer (promoted)',
    },
    conflictAttempt: 'Lead Data Engineer (manager draft)',
  },
  {
    id: 'asset',
    label: 'Asset',
    short: 'Asset',
    icon: HardHat,
    recordTitle: 'Asset · Compressor unit C-44 (Kenmare branch)',
    recordSubtitle: 'GR-AST-02087 · canonical record',
    fields: [
      { id: 'tag',     label: 'Asset tag',       editable: false },
      { id: 'type',    label: 'Type',            editable: true },
      { id: 'site',    label: 'Site',            editable: true },
      { id: 'cust',    label: 'Custodian',       editable: true },
      { id: 'value',   label: 'Capitalised value', editable: true },
      { id: 'status',  label: 'Status',          editable: true },
    ],
    golden: {
      tag:    'AST-C-44',
      type:   'Industrial compressor · 7.5 kW',
      site:   'Kenmare branch · Mokopane',
      cust:   'Sipho Dlamini (site supervisor)',
      value:  'R 312,400 (capitalised 2023-04)',
      status: 'In service · maintenance cycle 90d',
    },
    systems: [
      { id: 'erp-fa',     label: 'ERP fixed assets', team: 'Finance',   icon: Cog },
      { id: 'insurance',  label: 'Insurance',        team: 'Risk',      icon: ShieldCheck },
      { id: 'cmms',       label: 'Maintenance CMMS', team: 'Ops',       icon: Wrench },
      { id: 'tax',        label: 'Tax / depreciation', team: 'Finance', icon: FileSpreadsheet },
      { id: 'gis',        label: 'GIS / site map',   team: 'Facilities', icon: MapPin },
      { id: 'iot',        label: 'IoT telemetry',    team: 'Engineering', icon: Activity },
    ],
    conflictField: 'site',
    beforeField:   'site',
    before: [
      { systemId: 'erp-fa',    value: 'Kenmare branch · Mokopane',   source: 'ERP fixed-asset register · last audited 2024-06' },
      { systemId: 'insurance', value: 'Polokwane depot',              source: 'Insurance schedule from 2022 — never updated post-move' },
      { systemId: 'cmms',      value: 'Kenmare branch',               source: 'CMMS · last service entry confirmed location' },
      { systemId: 'tax',       value: 'Polokwane depot',              source: 'Tax schedule · copy of old insurance file' },
      { systemId: 'gis',       value: 'Kenmare branch · plant area',  source: 'GIS · facilities surveyed Q1 2025' },
      { systemId: 'iot',       value: 'Kenmare branch · plant area',  source: 'Telemetry · GPS-pinned at install' },
    ],
    beforeCost: {
      label: 'Insurance premium overstated by R 64k',
      sub: 'Wrong site mapping inflated the rate band. 11 audit exceptions raised against the fixed-asset register last year.',
    },
    demoTarget: {
      fieldId: 'status',
      newValue: 'In service · maintenance cycle 60d (uprated)',
    },
    conflictAttempt: 'Out of service (CMMS work-order draft)',
  },
]
// =============================================================================
// State
// =============================================================================

type Mode = 'before' | 'after'

const activeEntityId    = ref<EntityId>('customer')
const mode              = ref<Mode>('after')
const editingFieldId    = ref<string | null>(null)
const editingDraft      = ref('')
const isPropagating     = ref(false)
const conflictRule      = ref<'hub-wins' | 'human-review'>('hub-wins')
const pendingReview     = ref<{ entityId: EntityId; systemId: string; fieldId: string; hubValue: string; localValue: string } | null>(null)
const logEntries        = ref<LogEntry[]>([])

// Mutable copy of golden record values (so edits stick during the session).
const goldenState = reactive<Record<EntityId, Record<string, string>>>({
  customer: { ...ENTITIES[0]!.golden },
  supplier: { ...ENTITIES[1]!.golden },
  product:  { ...ENTITIES[2]!.golden },
  employee: { ...ENTITIES[3]!.golden },
  asset:    { ...ENTITIES[4]!.golden },
})

// Tile state per (entity, systemId).
function makeTiles(entity: EntityDef): Record<string, TileState> {
  return entity.systems.reduce(
    (acc, s) => ({ ...acc, [s.id]: { status: 'idle' as TileStatus } }),
    {},
  )
}
const tileState = reactive<Record<EntityId, Record<string, TileState>>>({
  customer: makeTiles(ENTITIES[0]!),
  supplier: makeTiles(ENTITIES[1]!),
  product:  makeTiles(ENTITIES[2]!),
  employee: makeTiles(ENTITIES[3]!),
  asset:    makeTiles(ENTITIES[4]!),
})

let logSeq = 0
function log(text: string, kind: LogEntry['kind']) {
  logSeq += 1
  logEntries.value = [
    { id: logSeq, ts: Date.now(), text, kind },
    ...logEntries.value,
  ].slice(0, 6)
}

// =============================================================================
// Computeds
// =============================================================================

const activeEntity = computed<EntityDef>(
  () => ENTITIES.find((e) => e.id === activeEntityId.value)!,
)

const activeGolden = computed(() => goldenState[activeEntityId.value])
const activeTiles  = computed(() => tileState[activeEntityId.value])

const beforeMap = computed<Record<string, BeforeRow>>(() =>
  activeEntity.value.before.reduce(
    (acc, r) => ({ ...acc, [r.systemId]: r }),
    {} as Record<string, BeforeRow>,
  ),
)

const driftCount = computed(() => {
  const e = activeEntity.value
  const golden = activeGolden.value[e.beforeField]
  return e.before.filter((r) => r.value !== golden).length
})

const driftDistinct = computed(() => {
  const e = activeEntity.value
  return new Set(e.before.map((r) => r.value)).size
})

// =============================================================================
// Actions
// =============================================================================

function selectEntity(id: EntityId) {
  if (id === activeEntityId.value) return
  activeEntityId.value = id
  editingFieldId.value = null
  pendingReview.value = null
  resetTiles()
}

function setMode(next: Mode) {
  if (mode.value === next) return
  mode.value = next
  editingFieldId.value = null
  pendingReview.value = null
  resetTiles()
}

function resetTiles() {
  const e = activeEntity.value
  for (const s of e.systems) {
    tileState[e.id]![s.id] = { status: 'idle' }
  }
}

function tileValueFor(systemId: string, fieldId: string): string {
  const tile = activeTiles.value![systemId]!
  if (mode.value === 'before' && fieldId === activeEntity.value.beforeField) {
    return beforeMap.value[systemId]?.value ?? activeGolden.value[fieldId] ?? ''
  }
  if (tile.status === 'updated' && tile.flashFieldId === fieldId && tile.newValue) {
    return tile.newValue
  }
  if (tile.status === 'pending-review' && tile.flashFieldId === fieldId && tile.oldValue) {
    return tile.oldValue
  }
  return activeGolden.value[fieldId] ?? ''
}

function tileSummaryFor(systemId: string): string {
  // What field to highlight on the tile face. Use the conflict / before field
  // when it's a "before" view; otherwise show the most-recently-updated field
  // for this tile, or the conflict field as a sensible default.
  const e = activeEntity.value
  const tile = activeTiles.value![systemId]!
  if (mode.value === 'before') return tileValueFor(systemId, e.beforeField)
  if (tile.flashFieldId) return tileValueFor(systemId, tile.flashFieldId)
  return activeGolden.value[e.conflictField] ?? ''
}

function startEdit(fieldId: string) {
  if (mode.value === 'before') return
  if (isPropagating.value) return
  const field = activeEntity.value.fields.find((f) => f.id === fieldId)
  if (!field || !field.editable) return
  editingFieldId.value = fieldId
  editingDraft.value = activeGolden.value[fieldId] ?? ''
}

function cancelEdit() {
  editingFieldId.value = null
  editingDraft.value = ''
}

function commitEdit() {
  const fieldId = editingFieldId.value
  if (!fieldId) return
  const oldVal = activeGolden.value[fieldId] ?? ''
  const newVal = editingDraft.value.trim()
  editingFieldId.value = null
  editingDraft.value = ''
  if (!newVal || newVal === oldVal) return
  applyHubEdit(fieldId, oldVal, newVal)
}

function applyHubEdit(fieldId: string, oldVal: string, newVal: string) {
  const e = activeEntity.value
  activeGolden.value[fieldId] = newVal
  log(`Edit committed on golden record · ${fieldLabel(fieldId)}`, 'edit')
  propagate(fieldId, oldVal, newVal)
}

function propagate(fieldId: string, oldVal: string, newVal: string) {
  const e = activeEntity.value
  isPropagating.value = true
  // Reset everyone to idle so the flash plays cleanly even on repeat edits.
  for (const s of e.systems) {
    tileState[e.id]![s.id] = { status: 'idle' }
  }
  log(`Propagation started · fanning out to ${e.systems.length} systems`, 'propagation')
  e.systems.forEach((s, i) => {
    const startDelay  = 180 + i * 110
    const finishDelay = 700 + i * 180
    window.setTimeout(() => {
      const cur = tileState[e.id]![s.id]!
      if (cur.status === 'conflict' || cur.status === 'pending-review') return
      tileState[e.id]![s.id] = { status: 'propagating', flashFieldId: fieldId, oldValue: oldVal, newValue: newVal }
    }, startDelay)
    window.setTimeout(() => {
      const cur = tileState[e.id]![s.id]!
      if (cur.status === 'conflict' || cur.status === 'pending-review') return
      tileState[e.id]![s.id] = { status: 'updated', flashFieldId: fieldId, oldValue: oldVal, newValue: newVal }
      if (i === e.systems.length - 1) {
        isPropagating.value = false
        log(`Propagation complete · all ${e.systems.length} systems aligned in 1.6s`, 'propagation')
      }
    }, finishDelay)
  })
}

function fieldLabel(fieldId: string): string {
  return activeEntity.value.fields.find((f) => f.id === fieldId)?.label ?? fieldId
}

function runDemoEdit() {
  if (mode.value !== 'after' || isPropagating.value) return
  const { fieldId, newValue } = activeEntity.value.demoTarget
  const oldVal = activeGolden.value[fieldId] ?? ''
  if (oldVal === newValue) return
  applyHubEdit(fieldId, oldVal, newValue)
}

function simulateConflict() {
  if (mode.value !== 'after' || isPropagating.value) return
  const e = activeEntity.value
  const fieldId = e.conflictField
  const oldVal = activeGolden.value[fieldId] ?? ''
  const newVal = e.demoTarget.fieldId === fieldId
    ? e.demoTarget.newValue
    : `${oldVal} (hub revision)`
  // Step 1: hub starts propagating its new value.
  applyHubEdit(fieldId, oldVal, newVal)
  // Step 2: CRM rep tries to edit the SAME field with a different value while
  // propagation is mid-flight. We schedule the "conflict" to land just after
  // the CRM tile's propagation begins.
  const crmSystem = e.systems[0]!
  const conflictDelay = 240 // ~just after the first tile starts propagating
  window.setTimeout(() => {
    if (mode.value !== 'after') return
    tileState[e.id]![crmSystem.id] = {
      status: 'conflict',
      flashFieldId: fieldId,
      oldValue: e.conflictAttempt,
      newValue: newVal,
    }
    log(`Conflict · ${crmSystem.label} attempted overwrite · ${fieldLabel(fieldId)}`, 'conflict')
    // Step 3: resolution rule fires after a beat.
    window.setTimeout(() => fireResolution(fieldId, newVal), 900)
  }, conflictDelay)
}

function fireResolution(fieldId: string, hubValue: string) {
  const e = activeEntity.value
  const crmSystem = e.systems[0]!
  if (conflictRule.value === 'hub-wins') {
    tileState[e.id]![crmSystem.id] = {
      status: 'updated',
      flashFieldId: fieldId,
      newValue: hubValue,
      oldValue: e.conflictAttempt,
    }
    log(`Rule fired · hub wins · ${crmSystem.label} reverted to canonical value`, 'rule')
  } else {
    tileState[e.id]![crmSystem.id] = {
      status: 'pending-review',
      flashFieldId: fieldId,
      oldValue: e.conflictAttempt,
      newValue: hubValue,
    }
    pendingReview.value = {
      entityId: e.id,
      systemId: crmSystem.id,
      fieldId,
      hubValue,
      localValue: e.conflictAttempt,
    }
    log(`Rule fired · human review queued · ${crmSystem.label} change held pending decision`, 'rule')
  }
}

function resolveReview(choice: 'accept-hub' | 'accept-local') {
  const r = pendingReview.value
  if (!r) return
  const e = activeEntity.value
  if (choice === 'accept-hub') {
    tileState[e.id]![r.systemId] = {
      status: 'updated',
      flashFieldId: r.fieldId,
      oldValue: r.localValue,
      newValue: r.hubValue,
    }
    log(`Review decision · hub value accepted for ${r.systemId.toUpperCase()}`, 'rule')
  } else {
    activeGolden.value[r.fieldId] = r.localValue
    tileState[e.id]![r.systemId] = {
      status: 'updated',
      flashFieldId: r.fieldId,
      oldValue: r.hubValue,
      newValue: r.localValue,
    }
    log(`Review decision · CRM value promoted · golden record updated`, 'rule')
    e.systems.forEach((s, i) => {
      if (s.id === r.systemId) return
      window.setTimeout(() => {
        tileState[e.id]![s.id] = {
          status: 'updated',
          flashFieldId: r.fieldId,
          oldValue: r.hubValue,
          newValue: r.localValue,
        }
      }, 200 + i * 120)
    })
  }
  pendingReview.value = null
}

// =============================================================================
// Template helpers
// =============================================================================

function tileBorderClass(status: TileStatus, beforeDrift: boolean): string {
  if (status === 'propagating') return 'border-cyan-brand/50 ring-1 ring-cyan-brand/25'
  if (status === 'updated')     return 'border-cyan-brand/40 ring-1 ring-cyan-brand/15'
  if (status === 'conflict' || status === 'pending-review') return 'border-red-100 ring-1 ring-red-100 bg-red-50/40'
  if (beforeDrift)              return 'border-red-100 bg-red-50/30'
  return 'border-line'
}

function tileStatusLabel(systemId: string): string {
  const tile = activeTiles.value![systemId]!
  if (mode.value === 'before') {
    const before = beforeMap.value[systemId]
    const golden = activeGolden.value[activeEntity.value.beforeField] ?? ''
    return before && before.value !== golden ? 'drift' : 'in sync'
  }
  switch (tile.status) {
    case 'propagating':    return 'propagating'
    case 'updated':        return 'updated'
    case 'conflict':       return 'conflict'
    case 'pending-review': return 'review'
    default:               return 'in sync'
  }
}

function tileStatusIcon(systemId: string): Component {
  const tile = activeTiles.value![systemId]!
  if (mode.value === 'before') {
    const before = beforeMap.value[systemId]
    const golden = activeGolden.value[activeEntity.value.beforeField] ?? ''
    return before && before.value !== golden ? RefreshCw : CircleCheck
  }
  switch (tile.status) {
    case 'propagating':    return Loader
    case 'updated':        return CircleCheck
    case 'conflict':       return GitMerge
    case 'pending-review': return Clock
    default:               return CircleCheck
  }
}

function tileBadgeClass(systemId: string): string {
  const tile = activeTiles.value![systemId]!
  if (mode.value === 'before') {
    const before = beforeMap.value[systemId]
    const golden = activeGolden.value[activeEntity.value.beforeField] ?? ''
    return before && before.value !== golden ? 'text-red-600' : 'text-cyan-brand-deep'
  }
  switch (tile.status) {
    case 'conflict':       return 'text-red-600'
    default:               return 'text-cyan-brand-deep'
  }
}

function tileFieldLabel(systemId: string): string {
  if (mode.value === 'before') return fieldLabel(activeEntity.value.beforeField)
  const tile = activeTiles.value![systemId]!
  if (tile.flashFieldId) return fieldLabel(tile.flashFieldId)
  return fieldLabel(activeEntity.value.conflictField)
}

function logKindIcon(kind: LogEntry['kind']): Component {
  switch (kind) {
    case 'propagation': return Sparkles
    case 'conflict':    return GitMerge
    case 'rule':        return ShieldCheck
    case 'edit':        return Pencil
  }
}

function logKindClass(kind: LogEntry['kind']): string {
  if (kind === 'conflict') return 'bg-red-50 text-red-600 ring-red-100'
  return 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

</script>

<template>
  <div class="relative">
    <!-- ===================================================================
         Header — eyebrow, heading, entity tabs, before/after toggle
         =================================================================== -->
    <header class="px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-5 border-b border-line">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Master Data Hub
          </div>
          <h3 class="mt-3 font-display text-[24px] sm:text-[28px] md:text-[32px] leading-[1.1] text-ink">
            One canonical record. Six systems agree.
          </h3>
          <p class="mt-2 max-w-2xl text-[14.5px] md:text-[15px] leading-[1.55] text-mute">
            Pick an entity. See where each downstream system kept its own version before the hub, then watch the canonical record propagate everywhere in under two seconds.
          </p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2">View</span>
          <div class="inline-flex items-center rounded-full border border-line bg-surface-alt p-1">
            <button
              type="button"
              class="px-3 py-1.5 text-[13px] font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              :class="mode === 'before' ? 'bg-ink text-white' : 'text-mute hover:text-ink'"
              @click="setMode('before')"
            >
              Before the hub
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-[13px] font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              :class="mode === 'after' ? 'bg-ink text-white' : 'text-mute hover:text-ink'"
              @click="setMode('after')"
            >
              Hub live
            </button>
          </div>
        </div>
      </div>

      <!-- Entity tabs -->
      <div class="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Entity selector">
        <button
          v-for="e in ENTITIES"
          :key="e.id"
          type="button"
          role="tab"
          :aria-selected="activeEntityId === e.id"
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          :class="
            activeEntityId === e.id
              ? 'border-cyan-brand/50 bg-cyan-brand/10 text-cyan-brand-deep'
              : 'border-line bg-white text-mute hover:text-ink hover:border-cyan-brand/40'
          "
          @click="selectEntity(e.id)"
        >
          <component :is="e.icon" :size="14" :stroke-width="2" aria-hidden="true" />
          {{ e.label }}
        </button>
      </div>
    </header>

    <!-- ===================================================================
         Workspace — golden record + downstream tile grid
         =================================================================== -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-line">
      <!-- Golden record -->
      <div class="lg:col-span-5 p-5 md:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-line bg-white">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
              <Hexagon :size="12" :stroke-width="2.2" />
              Golden record
            </div>
            <div class="mt-2 font-display text-[20px] md:text-[22px] leading-[1.15] text-ink truncate">
              {{ activeEntity.recordTitle }}
            </div>
            <div class="mt-1 text-[12.5px] text-mute-2 truncate">{{ activeEntity.recordSubtitle }}</div>
          </div>
          <span
            class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0"
            aria-hidden="true"
          >
            <component :is="activeEntity.icon" :size="20" :stroke-width="1.9" />
          </span>
        </div>

        <ul class="mt-4 divide-y divide-line rounded-xl border border-line overflow-hidden">
          <li
            v-for="f in activeEntity.fields"
            :key="f.id"
            class="px-3.5 py-2.5 transition-colors"
            :class="{
              'bg-cyan-brand/[0.04]': mode === 'before' && f.id === activeEntity.beforeField,
            }"
          >
            <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2 shrink-0">
                {{ f.label }}
              </span>
              <div class="flex items-center gap-2 min-w-0">
                <template v-if="editingFieldId === f.id">
                  <input
                    v-model="editingDraft"
                    type="text"
                    class="form-field !py-1.5 !px-2.5 !rounded-lg !text-[13px] w-[15rem] max-w-full"
                    aria-label="New value"
                    @keydown.enter.prevent="commitEdit"
                    @keydown.escape="cancelEdit"
                  />
                </template>
                <template v-else>
                  <span class="text-[13.5px] text-ink truncate">{{ activeGolden[f.id] }}</span>
                </template>
              </div>
            </div>
            <div v-if="f.editable && mode === 'after'" class="mt-1.5 flex items-center gap-2 justify-end">
              <template v-if="editingFieldId === f.id">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md bg-ink hover:bg-ink-soft text-white text-[11.5px] font-semibold px-2.5 py-1 transition-colors"
                  @click="commitEdit"
                >
                  <CircleCheck :size="11" :stroke-width="2.2" /> Save & propagate
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md border border-line bg-white hover:bg-surface-alt text-ink text-[11.5px] font-semibold px-2.5 py-1 transition-colors"
                  @click="cancelEdit"
                >
                  <X :size="11" :stroke-width="2.2" /> Cancel
                </button>
              </template>
              <button
                v-else
                type="button"
                :disabled="isPropagating || editingFieldId !== null"
                class="inline-flex items-center gap-1 rounded-md border border-line bg-white hover:border-cyan-brand/50 text-mute hover:text-ink text-[11.5px] font-semibold px-2 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                @click="startEdit(f.id)"
              >
                <Pencil :size="10" :stroke-width="2.2" /> Edit
              </button>
            </div>
          </li>
        </ul>

        <div v-if="mode === 'after'" class="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            :disabled="isPropagating"
            class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[12.5px] font-semibold px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="runDemoEdit"
          >
            <Sparkles :size="12" :stroke-width="2.2" />
            Run scenario · change {{ fieldLabel(activeEntity.demoTarget.fieldId).toLowerCase() }}
          </button>
          <button
            type="button"
            :disabled="isPropagating"
            class="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-surface-alt border border-line text-ink text-[12.5px] font-semibold px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="simulateConflict"
          >
            <GitMerge :size="12" :stroke-width="2.2" />
            Simulate conflict
          </button>
        </div>

        <div v-if="mode === 'before'" class="mt-4 rounded-xl border border-red-100 bg-red-50/40 p-4">
          <div class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-red-600">
            <Receipt :size="11" :stroke-width="2.2" />
            Cost of disagreement
          </div>
          <div class="mt-1.5 text-[15px] font-semibold text-ink leading-tight">
            {{ activeEntity.beforeCost.label }}
          </div>
          <p class="mt-1.5 text-[12.5px] text-mute leading-snug">{{ activeEntity.beforeCost.sub }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-mute-2">
            <span class="inline-flex items-center gap-1">
              <span class="dot" style="background: #DC2626; box-shadow: 0 0 0 4px rgba(220,38,38,0.18);" />
              {{ driftDistinct }} distinct values across {{ activeEntity.systems.length }} systems
            </span>
            <span class="text-mute-2/70 hidden sm:inline">·</span>
            <span>{{ driftCount }} systems disagree with the canonical record</span>
          </div>
        </div>
      </div>

      <!-- Downstream system tiles -->
      <div class="lg:col-span-7 p-5 md:p-6 lg:p-7 bg-surface-alt/30">
        <div class="flex items-baseline justify-between">
          <h4 class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Downstream systems
          </h4>
          <span
            class="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold"
            :class="
              mode === 'before'
                ? 'text-red-600'
                : (isPropagating ? 'text-cyan-brand-deep' : 'text-cyan-brand-deep')
            "
          >
            <template v-if="mode === 'before'">
              <span class="h-1.5 w-1.5 rounded-full bg-red-600" />
              out of sync
            </template>
            <template v-else-if="isPropagating">
              <Loader :size="11" :stroke-width="2.2" class="animate-spin-soft" />
              propagating
            </template>
            <template v-else>
              <CircleCheck :size="11" :stroke-width="2.2" />
              all aligned
            </template>
          </span>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <article
            v-for="s in activeEntity.systems"
            :key="s.id"
            class="relative rounded-xl border bg-white p-3.5 transition-all duration-300"
            :class="[
              tileBorderClass(activeTiles[s.id]?.status ?? 'idle', mode === 'before' && (beforeMap[s.id]?.value !== activeGolden[activeEntity.beforeField])),
              activeTiles[s.id]?.status === 'propagating' ? 'tile-pulse' : '',
              activeTiles[s.id]?.status === 'updated' ? 'tile-flash' : '',
            ]"
          >
            <header class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="inline-flex items-center justify-center h-7 w-7 rounded-md ring-1 shrink-0"
                  :class="
                    mode === 'before' && beforeMap[s.id] && beforeMap[s.id]!.value !== activeGolden[activeEntity.beforeField]
                      ? 'bg-red-50 text-red-600 ring-red-100'
                      : 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                  "
                  aria-hidden="true"
                >
                  <component :is="s.icon" :size="14" :stroke-width="2" />
                </span>
                <div class="min-w-0">
                  <div class="text-[12.5px] font-semibold text-ink leading-tight truncate">{{ s.label }}</div>
                  <div class="text-[10.5px] text-mute-2 uppercase tracking-[0.14em] font-semibold">{{ s.team }}</div>
                </div>
              </div>
              <span
                class="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] font-semibold"
                :class="tileBadgeClass(s.id)"
              >
                <component :is="tileStatusIcon(s.id)" :size="10" :stroke-width="2.4" />
                {{ tileStatusLabel(s.id) }}
              </span>
            </header>

            <div class="mt-2.5 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-mute-2">
              {{ tileFieldLabel(s.id) }}
            </div>
            <div class="mt-1 text-[13px] text-ink leading-snug min-h-[2.4em]">
              <template v-if="mode === 'after' && activeTiles[s.id]?.status === 'updated' && activeTiles[s.id]?.oldValue">
                <span class="text-mute-2 line-through decoration-red-300 decoration-1 mr-1.5">{{ activeTiles[s.id]?.oldValue }}</span>
                <span class="text-cyan-brand-deep font-semibold">{{ activeTiles[s.id]?.newValue }}</span>
              </template>
              <template v-else-if="mode === 'after' && activeTiles[s.id]?.status === 'conflict'">
                <span class="text-red-600 font-semibold">{{ activeTiles[s.id]?.oldValue }}</span>
                <span class="text-mute-2"> (local attempt)</span>
              </template>
              <template v-else-if="mode === 'after' && activeTiles[s.id]?.status === 'pending-review'">
                <span class="text-mute-2">CRM: <span class="text-ink">{{ activeTiles[s.id]?.oldValue }}</span></span>
                <span class="text-mute-2"> · Hub: <span class="text-ink">{{ activeTiles[s.id]?.newValue }}</span></span>
              </template>
              <template v-else>
                {{ tileSummaryFor(s.id) }}
              </template>
            </div>

            <!-- Before-mode source note -->
            <div
              v-if="mode === 'before' && beforeMap[s.id]"
              class="mt-2 text-[11px] text-mute-2 leading-snug flex items-start gap-1"
            >
              <ArrowRight :size="10" :stroke-width="2.2" class="mt-0.5 shrink-0 text-mute-2/70" />
              <span>{{ beforeMap[s.id]?.source }}</span>
            </div>
          </article>
        </div>

        <!-- Pending-review banner -->
        <transition name="lineage">
          <div
            v-if="pendingReview"
            class="mt-4 rounded-xl border border-cyan-brand/40 bg-white p-4"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
                <Clock :size="12" :stroke-width="2.2" />
                Held for human review
              </div>
              <span class="text-[11px] text-mute-2">{{ fieldLabel(pendingReview.fieldId) }}</span>
            </div>
            <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]">
              <div class="rounded-lg border border-line p-2.5">
                <div class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">Hub value</div>
                <div class="mt-1 text-ink">{{ pendingReview.hubValue }}</div>
              </div>
              <div class="rounded-lg border border-line p-2.5">
                <div class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">Local attempt</div>
                <div class="mt-1 text-ink">{{ pendingReview.localValue }}</div>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[12.5px] font-semibold px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                @click="resolveReview('accept-hub')"
              >
                Keep hub value
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-surface-alt border border-line text-ink text-[12.5px] font-semibold px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                @click="resolveReview('accept-local')"
              >
                Promote local value
              </button>
            </div>
          </div>
        </transition>
      </div>
    </section>

    <!-- ===================================================================
         Footer strip — conflict rule selector + propagation log
         =================================================================== -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-0">
      <div class="lg:col-span-5 p-5 md:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-line bg-white">
        <h4 class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">Conflict resolution rule</h4>
        <p class="mt-2 text-[13px] text-mute leading-snug">
          When a downstream system tries to overwrite a field while the hub is propagating, the same rule fires every time.
        </p>
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            class="text-left rounded-xl border p-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            :class="conflictRule === 'hub-wins' ? 'border-cyan-brand/60 ring-1 ring-cyan-brand/30 bg-cyan-brand/[0.04]' : 'border-line bg-white hover:border-cyan-brand/40'"
            :aria-pressed="conflictRule === 'hub-wins'"
            @click="conflictRule = 'hub-wins'"
          >
            <div class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
              <ShieldCheck :size="12" :stroke-width="2.2" /> Hub wins
            </div>
            <div class="mt-1.5 text-[13.5px] font-semibold text-ink leading-snug">Canonical record overrides</div>
            <p class="mt-1 text-[12px] text-mute leading-snug">
              The downstream change is logged and reverted. Use when the golden record is the only authority.
            </p>
          </button>
          <button
            type="button"
            class="text-left rounded-xl border p-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            :class="conflictRule === 'human-review' ? 'border-cyan-brand/60 ring-1 ring-cyan-brand/30 bg-cyan-brand/[0.04]' : 'border-line bg-white hover:border-cyan-brand/40'"
            :aria-pressed="conflictRule === 'human-review'"
            @click="conflictRule = 'human-review'"
          >
            <div class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
              <UserCheck :size="12" :stroke-width="2.2" /> Human review
            </div>
            <div class="mt-1.5 text-[13.5px] font-semibold text-ink leading-snug">Hub holds, asks for sign-off</div>
            <p class="mt-1 text-[12px] text-mute leading-snug">
              Both values surface to a data steward. The decision becomes the new canonical.
            </p>
          </button>
        </div>
      </div>

      <div class="lg:col-span-7 p-5 md:p-6 lg:p-7 bg-surface-alt/30">
        <div class="flex items-baseline justify-between">
          <h4 class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">Audit log</h4>
          <span class="text-[11px] text-mute-2">Live · last 6 events</span>
        </div>
        <ul v-if="logEntries.length" class="mt-3 space-y-1.5">
          <li
            v-for="entry in logEntries"
            :key="entry.id"
            class="rounded-lg border border-line bg-white px-3 py-2 flex items-start gap-2.5"
          >
            <span
              class="inline-flex items-center justify-center h-6 w-6 rounded-md shrink-0 mt-0.5 ring-1"
              :class="logKindClass(entry.kind)"
              aria-hidden="true"
            >
              <component :is="logKindIcon(entry.kind)" :size="11" :stroke-width="2.2" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-[12.5px] text-ink leading-snug">{{ entry.text }}</div>
              <div class="text-[10.5px] text-mute-2">{{ formatTime(entry.ts) }}</div>
            </div>
          </li>
        </ul>
        <div
          v-else
          class="mt-3 rounded-lg border border-dashed border-line bg-white px-3 py-4 text-center"
        >
          <p class="text-[12.5px] text-mute">
            Edit a field on the golden record, or run the conflict simulator — every motion lands here with the rule that resolved it.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes tile-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(1, 219, 241, 0.45); }
  60%  { box-shadow: 0 0 0 10px rgba(1, 219, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(1, 219, 241, 0); }
}
.tile-pulse {
  animation: tile-pulse-ring 1.05s ease-out infinite;
}

@keyframes tile-flash {
  0%   { background-color: rgba(1, 219, 241, 0.10); }
  100% { background-color: #ffffff; }
}
.tile-flash {
  animation: tile-flash 1100ms cubic-bezier(0.22, 1, 0.36, 1) 1;
}

@keyframes spin-soft {
  to { transform: rotate(360deg); }
}
.animate-spin-soft {
  animation: spin-soft 1s linear infinite;
}

.lineage-enter-active,
.lineage-leave-active {
  transition:
    opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.lineage-enter-from,
.lineage-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .tile-pulse,
  .tile-flash,
  .animate-spin-soft {
    animation: none !important;
  }
  .lineage-enter-active,
  .lineage-leave-active {
    transition: none !important;
  }
}
</style>
