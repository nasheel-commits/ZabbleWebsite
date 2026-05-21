<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { AlertTriangle, ArrowLeftRight, ArrowRight, BookOpenCheck, Boxes, Briefcase, Calendar, Check, History, Lock, Pencil, Receipt, RefreshCw, ShieldCheck, ShoppingCart, Sparkles, Users, Wallet, X, Zap } from '@lucide/vue'

type PairKey = 'inv-ecom' | 'hr-pay' | 'cal-book' | 'acct-pm'
type Direction = 'one-way' | 'bi'
type ConflictRule = 'last-write' | 'source-a' | 'human-review'

type FieldType = 'text' | 'number' | 'currency' | 'select' | 'time'

interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: string[]
  shared: boolean
}

interface PaneDef {
  side: 'A' | 'B'
  label: string
  shortLabel: string
  icon: Component
}

interface PairedRecord {
  id: string
  titleA: string
  titleB: string
  fieldsA: Record<string, string | number>
  fieldsB: Record<string, string | number>
}

interface ConflictScenario {
  recordId: string
  field: string
  valueFromA: string | number
  valueFromB: string | number
}

interface PairConfig {
  key: PairKey
  label: string
  shortLabel: string
  paneA: PaneDef
  paneB: PaneDef
  fieldsA: FieldDef[]
  fieldsB: FieldDef[]
  buildRecords: () => PairedRecord[]
  conflict: ConflictScenario
}

type CellStatus =
  | 'idle'
  | 'editing'
  | 'syncing-out'
  | 'arriving'
  | 'conflict'
  | 'review-pending'

interface CellState {
  status: CellStatus
  draft?: string | number
}

interface LogEntry {
  id: number
  ts: string
  kind:
    | 'synced'
    | 'blocked'
    | 'conflict-resolved'
    | 'review-pending'
    | 'review-resolved'
  originator: 'A' | 'B' | 'engine'
  srcLabel: string
  destLabel: string
  recordId: string
  fieldKey: string
  fieldLabel: string
  oldValue: string
  newValue: string
  conflict?: {
    rule: ConflictRule
    winner: 'A' | 'B' | 'human'
    valueA: string
    valueB: string
    ruleLabel: string
  }
}

interface PendingReview {
  logId: number
  recordId: string
  fieldKey: string
  fieldLabel: string
  valueA: string | number
  valueB: string | number
}

// ============================================================================
// Pair configurations
// ============================================================================

const invEcomPair: PairConfig = {
  key: 'inv-ecom',
  label: 'Inventory ↔ E-commerce',
  shortLabel: 'Inventory ↔ E-com',
  paneA: { side: 'A', label: 'Inventory', shortLabel: 'INV', icon: Boxes },
  paneB: { side: 'B', label: 'E-commerce', shortLabel: 'ECOM', icon: ShoppingCart },
  fieldsA: [
    { key: 'stock', label: 'Stock on hand', type: 'number', shared: true },
    { key: 'price', label: 'Price', type: 'currency', shared: true },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Discontinued'], shared: true },
    { key: 'lastCheck', label: 'Last shelf check', type: 'text', shared: false },
  ],
  fieldsB: [
    { key: 'stock', label: 'Available', type: 'number', shared: true },
    { key: 'price', label: 'Sell price', type: 'currency', shared: true },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Discontinued'], shared: true },
    { key: 'visibility', label: 'Storefront', type: 'select', options: ['Listed', 'Hidden'], shared: false },
  ],
  buildRecords: () => [
    {
      id: 'SKU-8841',
      titleA: 'Trail running shoes',
      titleB: 'Trail Runner Pro — Men\'s',
      fieldsA: { stock: 42, price: 89.0, status: 'Active', lastCheck: 'Mon 13 May' },
      fieldsB: { stock: 42, price: 89.0, status: 'Active', visibility: 'Listed' },
    },
    {
      id: 'SKU-6210',
      titleA: 'Wool day backpack',
      titleB: 'Field Pack 22L',
      fieldsA: { stock: 18, price: 64.0, status: 'Active', lastCheck: 'Mon 13 May' },
      fieldsB: { stock: 18, price: 64.0, status: 'Active', visibility: 'Listed' },
    },
    {
      id: 'SKU-4407',
      titleA: 'Insulated water bottle',
      titleB: 'Trail Bottle 750ml',
      fieldsA: { stock: 96, price: 24.5, status: 'Active', lastCheck: 'Mon 13 May' },
      fieldsB: { stock: 96, price: 24.5, status: 'Active', visibility: 'Listed' },
    },
  ],
  conflict: {
    recordId: 'SKU-8841',
    field: 'stock',
    valueFromA: 38,
    valueFromB: 44,
  },
}

const hrPayPair: PairConfig = {
  key: 'hr-pay',
  label: 'HR ↔ Payroll',
  shortLabel: 'HR ↔ Payroll',
  paneA: { side: 'A', label: 'HR', shortLabel: 'HR', icon: Users },
  paneB: { side: 'B', label: 'Payroll', shortLabel: 'PAY', icon: Wallet },
  fieldsA: [
    { key: 'role', label: 'Role', type: 'text', shared: true },
    { key: 'salary', label: 'Annual salary', type: 'currency', shared: true },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'On leave'], shared: true },
    { key: 'manager', label: 'Reports to', type: 'text', shared: false },
  ],
  fieldsB: [
    { key: 'role', label: 'Job title', type: 'text', shared: true },
    { key: 'salary', label: 'Annual salary', type: 'currency', shared: true },
    { key: 'status', label: 'Pay status', type: 'select', options: ['Active', 'On leave'], shared: true },
    { key: 'schedule', label: 'Pay cycle', type: 'select', options: ['Monthly', 'Bi-weekly'], shared: false },
  ],
  buildRecords: () => [
    {
      id: 'EMP-301',
      titleA: 'Lerato Khoza',
      titleB: 'Lerato Khoza',
      fieldsA: { role: 'Senior analyst', salary: 78000, status: 'Active', manager: 'D. Naidoo' },
      fieldsB: { role: 'Senior analyst', salary: 78000, status: 'Active', schedule: 'Monthly' },
    },
    {
      id: 'EMP-415',
      titleA: 'Michael Brown',
      titleB: 'Michael Brown',
      fieldsA: { role: 'Field engineer', salary: 64000, status: 'Active', manager: 'A. Pillay' },
      fieldsB: { role: 'Field engineer', salary: 64000, status: 'Active', schedule: 'Bi-weekly' },
    },
    {
      id: 'EMP-528',
      titleA: 'Priya Patel',
      titleB: 'Priya Patel',
      fieldsA: { role: 'Ops manager', salary: 92000, status: 'Active', manager: 'D. Naidoo' },
      fieldsB: { role: 'Ops manager', salary: 92000, status: 'Active', schedule: 'Monthly' },
    },
  ],
  conflict: {
    recordId: 'EMP-415',
    field: 'salary',
    valueFromA: 68000,
    valueFromB: 66000,
  },
}

const calBookPair: PairConfig = {
  key: 'cal-book',
  label: 'Calendar ↔ Booking',
  shortLabel: 'Calendar ↔ Booking',
  paneA: { side: 'A', label: 'Calendar', shortLabel: 'CAL', icon: Calendar },
  paneB: { side: 'B', label: 'Booking', shortLabel: 'BOOK', icon: BookOpenCheck },
  fieldsA: [
    { key: 'time', label: 'Slot', type: 'time', shared: true },
    { key: 'duration', label: 'Duration', type: 'select', options: ['30 min', '45 min', '60 min', '90 min'], shared: true },
    { key: 'room', label: 'Room', type: 'select', options: ['Studio 1', 'Studio 2', 'Studio 3'], shared: true },
    { key: 'notes', label: 'Internal notes', type: 'text', shared: false },
  ],
  fieldsB: [
    { key: 'time', label: 'Time slot', type: 'time', shared: true },
    { key: 'duration', label: 'Duration', type: 'select', options: ['30 min', '45 min', '60 min', '90 min'], shared: true },
    { key: 'room', label: 'Location', type: 'select', options: ['Studio 1', 'Studio 2', 'Studio 3'], shared: true },
    { key: 'channel', label: 'Booked via', type: 'select', options: ['Website', 'Phone', 'Walk-in'], shared: false },
  ],
  buildRecords: () => [
    {
      id: 'BK-7701',
      titleA: 'Sarah Adams · Studio session',
      titleB: 'Sarah Adams',
      fieldsA: { time: '09:30', duration: '60 min', room: 'Studio 1', notes: 'Returning client' },
      fieldsB: { time: '09:30', duration: '60 min', room: 'Studio 1', channel: 'Website' },
    },
    {
      id: 'BK-7702',
      titleA: 'Hilltop Holdings · Strategy',
      titleB: 'Hilltop Holdings',
      fieldsA: { time: '11:00', duration: '90 min', room: 'Studio 2', notes: 'Bring brief' },
      fieldsB: { time: '11:00', duration: '90 min', room: 'Studio 2', channel: 'Phone' },
    },
    {
      id: 'BK-7703',
      titleA: 'Marie Lerou · Intro call',
      titleB: 'Marie Lerou',
      fieldsA: { time: '14:00', duration: '30 min', room: 'Studio 3', notes: 'First-time' },
      fieldsB: { time: '14:00', duration: '30 min', room: 'Studio 3', channel: 'Website' },
    },
  ],
  conflict: {
    recordId: 'BK-7702',
    field: 'time',
    valueFromA: '11:30',
    valueFromB: '11:15',
  },
}

const acctPmPair: PairConfig = {
  key: 'acct-pm',
  label: 'Accounting ↔ Project Mgmt',
  shortLabel: 'Acct ↔ PM',
  paneA: { side: 'A', label: 'Accounting', shortLabel: 'ACCT', icon: Receipt },
  paneB: { side: 'B', label: 'Project Mgmt', shortLabel: 'PM', icon: Briefcase },
  fieldsA: [
    { key: 'budget', label: 'Project budget', type: 'currency', shared: true },
    { key: 'billed', label: 'Billed to date', type: 'currency', shared: true },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'On hold', 'Closed'], shared: true },
    { key: 'glCode', label: 'GL code', type: 'text', shared: false },
  ],
  fieldsB: [
    { key: 'budget', label: 'Budget', type: 'currency', shared: true },
    { key: 'billed', label: 'Billed', type: 'currency', shared: true },
    { key: 'status', label: 'Project status', type: 'select', options: ['Active', 'On hold', 'Closed'], shared: true },
    { key: 'progress', label: 'Progress', type: 'select', options: ['Kickoff', '25%', '50%', '75%', 'Wrapping'], shared: false },
  ],
  buildRecords: () => [
    {
      id: 'PRJ-101',
      titleA: 'Westline rebrand',
      titleB: 'Westline rebrand',
      fieldsA: { budget: 48000, billed: 12000, status: 'Active', glCode: '4200-OPS' },
      fieldsB: { budget: 48000, billed: 12000, status: 'Active', progress: '25%' },
    },
    {
      id: 'PRJ-104',
      titleA: 'Bluebird mobile app',
      titleB: 'Bluebird mobile app',
      fieldsA: { budget: 120000, billed: 60000, status: 'Active', glCode: '4200-OPS' },
      fieldsB: { budget: 120000, billed: 60000, status: 'Active', progress: '50%' },
    },
    {
      id: 'PRJ-107',
      titleA: 'Crowfoot data warehouse',
      titleB: 'Crowfoot data warehouse',
      fieldsA: { budget: 86000, billed: 21500, status: 'Active', glCode: '4250-DATA' },
      fieldsB: { budget: 86000, billed: 21500, status: 'Active', progress: '25%' },
    },
  ],
  conflict: {
    recordId: 'PRJ-104',
    field: 'billed',
    valueFromA: 72000,
    valueFromB: 68000,
  },
}

const PAIRS: PairConfig[] = [invEcomPair, hrPayPair, calBookPair, acctPmPair]

// ============================================================================
// Reactive state
// ============================================================================

const pairKey = ref<PairKey>('inv-ecom')
const direction = ref<Direction>('bi')
const conflictRule = ref<ConflictRule>('last-write')

const records = ref<PairedRecord[]>([])
const log = ref<LogEntry[]>([])
const cellStates = ref<Record<string, CellState>>({})
const editor = ref<{
  side: 'A' | 'B'
  recordId: string
  field: FieldDef
  draft: string
} | null>(null)
const arrowFlash = ref<'A→B' | 'B→A' | 'conflict' | null>(null)
const pendingReview = ref<PendingReview | null>(null)
const banner = ref<{ text: string; kind: 'info' | 'conflict' | 'review' } | null>(null)
const triggeringConflict = ref(false)

const timers: number[] = []
let logIdSeq = 1

// ============================================================================
// Derived state
// ============================================================================

const pair = computed<PairConfig>(() =>
  PAIRS.find((p) => p.key === pairKey.value) ?? invEcomPair,
)

const sharedFieldKeysA = computed<Set<string>>(
  () => new Set(pair.value.fieldsA.filter((f) => f.shared).map((f) => f.key)),
)

const conflictRuleLabel = computed<string>(() => {
  switch (conflictRule.value) {
    case 'last-write':
      return 'Last write wins'
    case 'source-a':
      return `Source-of-truth: ${pair.value.paneA.label}`
    case 'human-review':
      return 'Human review'
  }
})

const isOneWay = computed(() => direction.value === 'one-way')

// ============================================================================
// Lifecycle / pair switching
// ============================================================================

function loadPair(key: PairKey) {
  clearTimers()
  pairKey.value = key
  records.value = (PAIRS.find((p) => p.key === key) ?? invEcomPair).buildRecords()
  cellStates.value = {}
  log.value = []
  editor.value = null
  arrowFlash.value = null
  pendingReview.value = null
  banner.value = null
  triggeringConflict.value = false
  logIdSeq = 1
}

loadPair('inv-ecom')

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
// Cell state helpers
// ============================================================================

function cellKey(side: 'A' | 'B', recordId: string, field: string): string {
  return `${side}:${recordId}:${field}`
}

function getCell(side: 'A' | 'B', recordId: string, field: string): CellState {
  return cellStates.value[cellKey(side, recordId, field)] ?? { status: 'idle' }
}

function setCell(side: 'A' | 'B', recordId: string, field: string, state: CellState) {
  cellStates.value = { ...cellStates.value, [cellKey(side, recordId, field)]: state }
}

function resetCell(side: 'A' | 'B', recordId: string, field: string) {
  const next = { ...cellStates.value }
  delete next[cellKey(side, recordId, field)]
  cellStates.value = next
}

// ============================================================================
// Formatting
// ============================================================================

function formatValue(field: FieldDef, value: string | number): string {
  if (value === '' || value === undefined || value === null) return '—'
  if (field.type === 'currency') {
    return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }
  if (field.type === 'number') {
    return Number(value).toLocaleString('en-US')
  }
  return String(value)
}

function parseValue(field: FieldDef, draft: string): string | number {
  if (field.type === 'number' || field.type === 'currency') {
    const n = Number(draft.replace(/[^0-9.\-]/g, ''))
    return isNaN(n) ? 0 : n
  }
  return draft
}

function nowTimestamp(): string {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

// ============================================================================
// Editing
// ============================================================================

function findRecord(recordId: string): PairedRecord | undefined {
  return records.value.find((r) => r.id === recordId)
}

function getFieldDef(side: 'A' | 'B', key: string): FieldDef | undefined {
  return (side === 'A' ? pair.value.fieldsA : pair.value.fieldsB).find((f) => f.key === key)
}

function canEdit(side: 'A' | 'B'): boolean {
  // One-way: B is downstream and read-only.
  if (isOneWay.value && side === 'B') return false
  return true
}

function startEdit(side: 'A' | 'B', recordId: string, field: FieldDef) {
  if (!canEdit(side)) return
  if (pendingReview.value) return
  const rec = findRecord(recordId)
  if (!rec) return
  const current = side === 'A' ? rec.fieldsA[field.key] : rec.fieldsB[field.key]
  editor.value = {
    side,
    recordId,
    field,
    draft: String(current ?? ''),
  }
  setCell(side, recordId, field.key, { status: 'editing' })
}

function cancelEdit() {
  if (!editor.value) return
  const { side, recordId, field } = editor.value
  resetCell(side, recordId, field.key)
  editor.value = null
}

function commitEdit() {
  if (!editor.value) return
  const { side, recordId, field, draft } = editor.value
  const rec = findRecord(recordId)
  if (!rec) return
  const oldValue = side === 'A' ? rec.fieldsA[field.key] : rec.fieldsB[field.key]
  const newValue = parseValue(field, draft)
  editor.value = null

  if (String(newValue) === String(oldValue)) {
    resetCell(side, recordId, field.key)
    return
  }

  // Apply locally.
  if (side === 'A') rec.fieldsA = { ...rec.fieldsA, [field.key]: newValue }
  else rec.fieldsB = { ...rec.fieldsB, [field.key]: newValue }

  // Mirror sync if the field is shared.
  if (!field.shared) {
    resetCell(side, recordId, field.key)
    return
  }
  fireSync({ originator: side, recordId, fieldKey: field.key, oldValue, newValue })
}

// ============================================================================
// Sync engine
// ============================================================================

function fireSync(args: {
  originator: 'A' | 'B'
  recordId: string
  fieldKey: string
  oldValue: string | number
  newValue: string | number
}) {
  const { originator, recordId, fieldKey, oldValue, newValue } = args
  const otherSide: 'A' | 'B' = originator === 'A' ? 'B' : 'A'
  const fieldDefSrc = getFieldDef(originator, fieldKey)
  const fieldDefDest = getFieldDef(otherSide, fieldKey)
  if (!fieldDefSrc || !fieldDefDest) return

  const srcLabel = originator === 'A' ? pair.value.paneA.shortLabel : pair.value.paneB.shortLabel
  const destLabel = otherSide === 'A' ? pair.value.paneA.shortLabel : pair.value.paneB.shortLabel

  // One-way: only A→B propagates. Edits on B (which canEdit blocks above)
  // never reach here, but guard anyway by logging blocked.
  if (isOneWay.value && originator === 'B') {
    appendLog({
      kind: 'blocked',
      originator,
      srcLabel,
      destLabel,
      recordId,
      fieldKey,
      fieldLabel: fieldDefSrc.label,
      oldValue: formatValue(fieldDefSrc, oldValue),
      newValue: formatValue(fieldDefSrc, newValue),
    })
    resetCell(originator, recordId, fieldKey)
    return
  }

  // Start the sync animation: source pulses, arrow flashes, destination arrives.
  setCell(originator, recordId, fieldKey, { status: 'syncing-out', draft: newValue })
  arrowFlash.value = originator === 'A' ? 'A→B' : 'B→A'
  schedule(() => {
    if (arrowFlash.value === (originator === 'A' ? 'A→B' : 'B→A')) {
      arrowFlash.value = null
    }
  }, 1100)

  schedule(() => {
    // Apply on destination side.
    const rec = findRecord(recordId)
    if (!rec) return
    if (otherSide === 'A') rec.fieldsA = { ...rec.fieldsA, [fieldKey]: newValue }
    else rec.fieldsB = { ...rec.fieldsB, [fieldKey]: newValue }
    setCell(otherSide, recordId, fieldKey, { status: 'arriving' })
    setCell(originator, recordId, fieldKey, { status: 'arriving' })

    appendLog({
      kind: 'synced',
      originator,
      srcLabel,
      destLabel,
      recordId,
      fieldKey,
      fieldLabel: fieldDefSrc.label,
      oldValue: formatValue(fieldDefSrc, oldValue),
      newValue: formatValue(fieldDefSrc, newValue),
    })

    schedule(() => {
      resetCell(originator, recordId, fieldKey)
      resetCell(otherSide, recordId, fieldKey)
    }, 700)
  }, 1100)
}

// ============================================================================
// Conflict simulation
// ============================================================================

function triggerConflict() {
  if (triggeringConflict.value) return
  if (pendingReview.value) return
  // Conflicts are only meaningful when both sides can write.
  if (isOneWay.value) {
    direction.value = 'bi'
    banner.value = {
      text: 'Switched to bi-directional — conflicts only fire when both sides can write.',
      kind: 'info',
    }
    schedule(() => {
      if (banner.value?.kind === 'info') banner.value = null
    }, 2600)
  }

  const cfg = pair.value
  const { recordId, field, valueFromA, valueFromB } = cfg.conflict
  const fieldDefA = getFieldDef('A', field)
  const fieldDefB = getFieldDef('B', field)
  const rec = findRecord(recordId)
  if (!fieldDefA || !fieldDefB || !rec) return

  triggeringConflict.value = true
  const oldA = rec.fieldsA[field]
  const oldB = rec.fieldsB[field]

  // Stage 1: both sides start "editing" with their own draft.
  setCell('A', recordId, field, { status: 'syncing-out', draft: valueFromA })
  setCell('B', recordId, field, { status: 'syncing-out', draft: valueFromB })
  arrowFlash.value = 'conflict'

  // Stage 2: both writes "land" at the engine simultaneously — conflict.
  schedule(() => {
    setCell('A', recordId, field, { status: 'conflict', draft: valueFromA })
    setCell('B', recordId, field, { status: 'conflict', draft: valueFromB })
  }, 700)

  // Stage 3: engine applies the configured rule.
  schedule(() => {
    arrowFlash.value = null
    resolveConflict(rec, field, fieldDefA, fieldDefB, valueFromA, valueFromB, oldA, oldB)
    triggeringConflict.value = false
  }, 1400)
}

function resolveConflict(
  rec: PairedRecord,
  fieldKey: string,
  fieldDefA: FieldDef,
  fieldDefB: FieldDef,
  valueFromA: string | number,
  valueFromB: string | number,
  oldA: string | number,
  oldB: string | number,
) {
  const cfg = pair.value
  const ruleAtFire = conflictRule.value
  const ruleLabel =
    ruleAtFire === 'last-write'
      ? 'Last write wins'
      : ruleAtFire === 'source-a'
        ? `Source-of-truth: ${cfg.paneA.label}`
        : 'Human review'

  if (ruleAtFire === 'human-review') {
    // Park both cells as pending review. The user picks via the banner.
    setCell('A', rec.id, fieldKey, { status: 'review-pending', draft: valueFromA })
    setCell('B', rec.id, fieldKey, { status: 'review-pending', draft: valueFromB })
    const entry: LogEntry = {
      id: logIdSeq++,
      ts: nowTimestamp(),
      kind: 'review-pending',
      originator: 'engine',
      srcLabel: cfg.paneA.shortLabel,
      destLabel: cfg.paneB.shortLabel,
      recordId: rec.id,
      fieldKey,
      fieldLabel: fieldDefA.label,
      oldValue: '',
      newValue: '',
      conflict: {
        rule: ruleAtFire,
        winner: 'human',
        valueA: formatValue(fieldDefA, valueFromA),
        valueB: formatValue(fieldDefB, valueFromB),
        ruleLabel,
      },
    }
    log.value = [entry, ...log.value]
    pendingReview.value = {
      logId: entry.id,
      recordId: rec.id,
      fieldKey,
      fieldLabel: fieldDefA.label,
      valueA: valueFromA,
      valueB: valueFromB,
    }
    banner.value = { text: 'Conflict — human review required.', kind: 'review' }
    return
  }

  // Auto-resolve: pick winner.
  let winner: 'A' | 'B' = 'A'
  let winningValue: string | number = valueFromA
  if (ruleAtFire === 'last-write') {
    // For the demo, treat the B edit as having landed microseconds later.
    winner = 'B'
    winningValue = valueFromB
  } else if (ruleAtFire === 'source-a') {
    winner = 'A'
    winningValue = valueFromA
  }

  // Apply winner to both sides.
  rec.fieldsA = { ...rec.fieldsA, [fieldKey]: winningValue }
  rec.fieldsB = { ...rec.fieldsB, [fieldKey]: winningValue }
  setCell('A', rec.id, fieldKey, { status: 'arriving' })
  setCell('B', rec.id, fieldKey, { status: 'arriving' })

  const entry: LogEntry = {
    id: logIdSeq++,
    ts: nowTimestamp(),
    kind: 'conflict-resolved',
    originator: 'engine',
    srcLabel: cfg.paneA.shortLabel,
    destLabel: cfg.paneB.shortLabel,
    recordId: rec.id,
    fieldKey,
    fieldLabel: fieldDefA.label,
    oldValue: formatValue(fieldDefA, winner === 'A' ? oldA : oldB),
    newValue: formatValue(fieldDefA, winningValue),
    conflict: {
      rule: ruleAtFire,
      winner,
      valueA: formatValue(fieldDefA, valueFromA),
      valueB: formatValue(fieldDefB, valueFromB),
      ruleLabel,
    },
  }
  log.value = [entry, ...log.value]
  banner.value = {
    text: `Conflict resolved per ${ruleLabel} — ${winner === 'A' ? cfg.paneA.label : cfg.paneB.label} wins.`,
    kind: 'conflict',
  }
  schedule(() => {
    if (banner.value?.kind === 'conflict') banner.value = null
  }, 3200)
  schedule(() => {
    resetCell('A', rec.id, fieldKey)
    resetCell('B', rec.id, fieldKey)
  }, 1000)
}

function acceptReview(side: 'A' | 'B') {
  if (!pendingReview.value) return
  const review = pendingReview.value
  const rec = findRecord(review.recordId)
  const fieldDef = getFieldDef('A', review.fieldKey)
  if (!rec || !fieldDef) return
  const winningValue = side === 'A' ? review.valueA : review.valueB

  rec.fieldsA = { ...rec.fieldsA, [review.fieldKey]: winningValue }
  rec.fieldsB = { ...rec.fieldsB, [review.fieldKey]: winningValue }
  setCell('A', rec.id, review.fieldKey, { status: 'arriving' })
  setCell('B', rec.id, review.fieldKey, { status: 'arriving' })

  // Promote the pending-review log entry into a review-resolved entry.
  log.value = log.value.map((entry) =>
    entry.id === review.logId
      ? {
          ...entry,
          kind: 'review-resolved',
          newValue: formatValue(fieldDef, winningValue),
          conflict: entry.conflict
            ? {
                ...entry.conflict,
                winner: side,
              }
            : entry.conflict,
        }
      : entry,
  )

  pendingReview.value = null
  banner.value = null

  schedule(() => {
    resetCell('A', rec.id, review.fieldKey)
    resetCell('B', rec.id, review.fieldKey)
  }, 900)
}

// ============================================================================
// Log
// ============================================================================

function appendLog(args: {
  kind: LogEntry['kind']
  originator: LogEntry['originator']
  srcLabel: string
  destLabel: string
  recordId: string
  fieldKey: string
  fieldLabel: string
  oldValue: string
  newValue: string
}) {
  const entry: LogEntry = {
    id: logIdSeq++,
    ts: nowTimestamp(),
    ...args,
  }
  log.value = [entry, ...log.value]
}

function clearLog() {
  log.value = []
}

function resetDemo() {
  loadPair(pairKey.value)
}

// ============================================================================
// Cell display helpers (background tint per status)
// ============================================================================

function cellClass(side: 'A' | 'B', recordId: string, fieldKey: string): string {
  const state = getCell(side, recordId, fieldKey)
  const base = 'transition-[background-color,box-shadow] duration-500'
  switch (state.status) {
    case 'editing':
      return `${base} bg-cyan-brand/8 ring-1 ring-cyan-brand/40`
    case 'syncing-out':
      return `${base} bg-cyan-brand/8 ring-1 ring-cyan-brand/30`
    case 'arriving':
      return `${base} bg-cyan-brand/12 ring-1 ring-cyan-brand/40`
    case 'conflict':
    case 'review-pending':
      return `${base} bg-red-50 ring-1 ring-red-100`
    default:
      return base
  }
}

function fieldHoverable(side: 'A' | 'B'): string {
  return canEdit(side)
    ? 'cursor-pointer hover:bg-surface-alt focus-visible:outline-none focus-visible:bg-surface-alt'
    : 'cursor-not-allowed opacity-90'
}

</script>

<template>
  <div class="p-5 md:p-6 lg:p-7">
    <!-- =====================================================================
      Header — eyebrow, title, pair selector
    ===================================================================== -->
    <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          <span class="dot" />
          Live Sync Engine
        </div>
        <h3 class="mt-2 font-display text-[24px] md:text-[28px] leading-[1.15] text-ink">
          Two systems, kept in lockstep.
        </h3>
        <p class="mt-1.5 text-[14px] md:text-[14.5px] text-mute max-w-2xl">
          Edit any value on either side. The engine propagates the change to its mirror in under two seconds — every event lands in the log on the right.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="System pair"
        class="inline-flex items-center rounded-xl border border-line bg-surface-alt p-1 self-start lg:self-end overflow-x-auto max-w-full"
      >
        <button
          v-for="p in PAIRS"
          :key="p.key"
          role="tab"
          :aria-selected="pairKey === p.key"
          type="button"
          class="whitespace-nowrap rounded-lg px-3 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          :class="
            pairKey === p.key
              ? 'bg-white text-ink shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
              : 'text-mute hover:text-ink'
          "
          @click="loadPair(p.key)"
        >
          {{ p.shortLabel }}
        </button>
      </div>
    </header>

    <!-- =====================================================================
      Control bar — direction, conflict rule, trigger conflict
    ===================================================================== -->
    <section class="mt-5 rounded-2xl border border-line bg-surface-alt/60 p-4">
      <div class="flex flex-col md:flex-row md:items-center md:flex-wrap gap-3 md:gap-5">
        <!-- Direction toggle -->
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2">Direction</span>
          <div
            role="tablist"
            aria-label="Sync direction"
            class="inline-flex items-center rounded-lg border border-line bg-white p-0.5"
          >
            <button
              role="tab"
              type="button"
              :aria-selected="direction === 'one-way'"
              class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              :class="
                direction === 'one-way'
                  ? 'bg-ink text-white'
                  : 'text-mute hover:text-ink'
              "
              @click="direction = 'one-way'"
            >
              <ArrowRight :size="13" :stroke-width="2.2" />
              One-way
            </button>
            <button
              role="tab"
              type="button"
              :aria-selected="direction === 'bi'"
              class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              :class="
                direction === 'bi'
                  ? 'bg-ink text-white'
                  : 'text-mute hover:text-ink'
              "
              @click="direction = 'bi'"
            >
              <ArrowLeftRight :size="13" :stroke-width="2.2" />
              Bi-directional
            </button>
          </div>
        </div>

        <!-- Conflict rule -->
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2">Conflict rule</span>
          <div
            role="tablist"
            aria-label="Conflict resolution rule"
            class="inline-flex items-center rounded-lg border border-line bg-white p-0.5 flex-wrap"
          >
            <button
              role="tab"
              type="button"
              :aria-selected="conflictRule === 'last-write'"
              class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              :class="conflictRule === 'last-write' ? 'bg-ink text-white' : 'text-mute hover:text-ink'"
              @click="conflictRule = 'last-write'"
            >
              Last write
            </button>
            <button
              role="tab"
              type="button"
              :aria-selected="conflictRule === 'source-a'"
              class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              :class="conflictRule === 'source-a' ? 'bg-ink text-white' : 'text-mute hover:text-ink'"
              @click="conflictRule = 'source-a'"
            >
              <ShieldCheck :size="12" :stroke-width="2.2" />
              Source-of-truth
            </button>
            <button
              role="tab"
              type="button"
              :aria-selected="conflictRule === 'human-review'"
              class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              :class="conflictRule === 'human-review' ? 'bg-ink text-white' : 'text-mute hover:text-ink'"
              @click="conflictRule = 'human-review'"
            >
              Human review
            </button>
          </div>
        </div>

        <!-- Trigger conflict + reset -->
        <div class="flex items-center gap-2 md:ml-auto">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[13px] font-semibold px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="triggeringConflict || !!pendingReview"
            @click="triggerConflict"
          >
            <Zap :size="14" :stroke-width="2.2" />
            Trigger conflict
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white hover:border-ink/30 text-ink text-[13px] font-semibold px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="resetDemo"
          >
            <RefreshCw :size="13" :stroke-width="2.2" />
            Reset
          </button>
        </div>
      </div>

      <!-- Quick context strip -->
      <p class="mt-3 text-[12.5px] text-mute-2 leading-[1.55]">
        <template v-if="isOneWay">
          <Lock :size="11" :stroke-width="2.2" class="inline -mt-0.5 mr-0.5 text-mute-2" />
          {{ pair.paneB.label }} is read-only — edits flow only from {{ pair.paneA.label }}.
        </template>
        <template v-else>
          <ArrowLeftRight :size="11" :stroke-width="2.2" class="inline -mt-0.5 mr-0.5 text-cyan-brand-deep" />
          Edits on either side propagate to the other. Conflicts resolve per <span class="font-semibold text-ink">{{ conflictRuleLabel }}</span>.
        </template>
      </p>
    </section>

    <!-- =====================================================================
      Pending-review banner (human review path only)
    ===================================================================== -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-out"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="pendingReview"
        class="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 flex flex-col md:flex-row md:items-center gap-3"
        role="alert"
      >
        <div class="flex items-start gap-2.5 min-w-0">
          <span class="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-white ring-1 ring-red-100 text-red-600 shrink-0 mt-0.5">
            <AlertTriangle :size="14" :stroke-width="2.2" />
          </span>
          <div class="min-w-0">
            <div class="text-[13px] font-semibold text-ink">
              Human review · {{ pendingReview.recordId }} · {{ pendingReview.fieldLabel }}
            </div>
            <div class="text-[12.5px] text-mute mt-0.5">
              Both sides wrote within the same window. Pick the value that should win.
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 md:ml-auto shrink-0 flex-wrap">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md bg-white ring-1 ring-line hover:ring-ink/30 text-ink text-[12.5px] font-semibold px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="acceptReview('A')"
          >
            <Check :size="12" :stroke-width="2.4" />
            {{ pair.paneA.shortLabel }}:
            <span class="tabular-nums font-bold ml-0.5">
              {{ formatValue(getFieldDef('A', pendingReview.fieldKey)!, pendingReview.valueA) }}
            </span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md bg-white ring-1 ring-line hover:ring-ink/30 text-ink text-[12.5px] font-semibold px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="acceptReview('B')"
          >
            <Check :size="12" :stroke-width="2.4" />
            {{ pair.paneB.shortLabel }}:
            <span class="tabular-nums font-bold ml-0.5">
              {{ formatValue(getFieldDef('B', pendingReview.fieldKey)!, pendingReview.valueB) }}
            </span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- =====================================================================
      Toast banner (non-review messages)
    ===================================================================== -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-out"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="banner && banner.kind !== 'review'"
        class="mt-4 rounded-xl border px-4 py-2.5 flex items-center gap-2 text-[13px]"
        :class="banner.kind === 'conflict'
          ? 'border-cyan-brand/40 bg-cyan-brand/8 text-ink'
          : 'border-line bg-white text-ink'"
        role="status"
        aria-live="polite"
      >
        <Sparkles
          v-if="banner.kind === 'conflict'"
          :size="14"
          :stroke-width="2"
          class="text-cyan-brand-deep shrink-0"
        />
        <ArrowLeftRight
          v-else
          :size="14"
          :stroke-width="2"
          class="text-mute-2 shrink-0"
        />
        <span class="font-medium">{{ banner.text }}</span>
      </div>
    </Transition>

    <!-- =====================================================================
      Main grid — pane A | pane B | log
    ===================================================================== -->
    <section class="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_320px] gap-4 md:gap-5 relative">
      <!-- Engine connector arrow (md+ only) -->
      <div
        class="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 lg:top-0 lg:relative lg:hidden pointer-events-none z-10"
        aria-hidden="true"
      >
        <span
          class="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white border border-line text-cyan-brand-deep transition-all duration-300"
          :class="arrowFlash ? 'shadow-[0_0_0_4px_rgba(1,219,241,0.18)] border-cyan-brand/60' : ''"
        >
          <ArrowLeftRight :size="14" :stroke-width="2.2" />
        </span>
      </div>

      <!-- Pane A -->
      <article class="rounded-2xl border border-line bg-white overflow-hidden flex flex-col">
        <header class="flex items-center justify-between px-4 py-3 border-b border-line bg-surface-alt/60">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-brand/8 ring-1 ring-cyan-brand/25 text-cyan-brand-deep shrink-0">
              <component :is="pair.paneA.icon" :size="15" :stroke-width="1.9" />
            </span>
            <div class="min-w-0">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2">System A</div>
              <div class="text-[14px] font-semibold text-ink truncate">{{ pair.paneA.label }}</div>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1 rounded-full bg-cyan-brand/8 ring-1 ring-cyan-brand/25 text-cyan-brand-deep text-[10.5px] font-semibold uppercase tracking-[0.16em] px-2 py-0.5"
            :class="arrowFlash === 'A→B' || arrowFlash === 'conflict' ? 'animate-pulse' : ''"
          >
            <ArrowRight v-if="arrowFlash === 'A→B'" :size="10" :stroke-width="2.4" />
            <Check v-else :size="10" :stroke-width="2.4" />
            {{ arrowFlash === 'A→B' ? 'Syncing →' : 'In sync' }}
          </span>
        </header>

        <ul class="divide-y divide-line/70">
          <li v-for="rec in records" :key="rec.id" class="px-4 py-3">
            <div class="flex items-baseline justify-between gap-2 mb-2">
              <div class="min-w-0">
                <div class="text-[12px] font-semibold text-ink tabular-nums">{{ rec.id }}</div>
                <div class="text-[13px] text-mute truncate">{{ rec.titleA }}</div>
              </div>
            </div>
            <dl class="grid grid-cols-1 gap-1.5">
              <div
                v-for="field in pair.fieldsA"
                :key="field.key"
                class="rounded-lg px-2.5 py-1.5 -mx-0.5 flex items-center justify-between gap-3"
                :class="[cellClass('A', rec.id, field.key), fieldHoverable('A')]"
                role="button"
                :tabindex="canEdit('A') ? 0 : -1"
                :aria-disabled="!canEdit('A')"
                @click="startEdit('A', rec.id, field)"
                @keydown.enter.prevent="startEdit('A', rec.id, field)"
              >
                <dt class="text-[11.5px] font-semibold text-mute-2 uppercase tracking-[0.12em] flex items-center gap-1.5 shrink-0">
                  <span
                    v-if="field.shared"
                    class="h-1.5 w-1.5 rounded-full bg-cyan-brand"
                    aria-label="Synced field"
                  />
                  <span
                    v-else
                    class="h-1.5 w-1.5 rounded-full bg-line"
                    aria-label="Local field"
                  />
                  {{ field.label }}
                </dt>
                <dd class="text-[13.5px] font-semibold text-ink tabular-nums flex items-center gap-1.5 min-w-0">
                  <!-- Inline editor -->
                  <template v-if="editor && editor.side === 'A' && editor.recordId === rec.id && editor.field.key === field.key">
                    <select
                      v-if="field.type === 'select'"
                      v-model="editor.draft"
                      class="rounded-md border border-cyan-brand/60 bg-white text-[13.5px] font-semibold text-ink px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-brand/30"
                      @keydown.enter.prevent="commitEdit"
                      @keydown.escape.prevent="cancelEdit"
                      @click.stop
                    >
                      <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <input
                      v-else
                      v-model="editor.draft"
                      :type="field.type === 'number' || field.type === 'currency' ? 'number' : 'text'"
                      :inputmode="field.type === 'number' || field.type === 'currency' ? 'decimal' : 'text'"
                      step="0.01"
                      class="w-20 rounded-md border border-cyan-brand/60 bg-white text-[13.5px] font-semibold text-ink text-right tabular-nums px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-brand/30"
                      @keydown.enter.prevent="commitEdit"
                      @keydown.escape.prevent="cancelEdit"
                      @click.stop
                    />
                    <button
                      type="button"
                      class="inline-flex items-center justify-center h-5 w-5 rounded-md bg-ink hover:bg-ink-soft text-white"
                      aria-label="Save"
                      @click.stop="commitEdit"
                    >
                      <Check :size="10" :stroke-width="3" />
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center h-5 w-5 rounded-md border border-line bg-white text-mute-2 hover:text-ink"
                      aria-label="Cancel"
                      @click.stop="cancelEdit"
                    >
                      <X :size="10" :stroke-width="2.4" />
                    </button>
                  </template>
                  <template v-else>
                    <span
                      v-if="getCell('A', rec.id, field.key).status === 'syncing-out'"
                      class="inline-flex items-center justify-center h-3.5 w-3.5"
                      aria-label="Syncing"
                    >
                      <RefreshCw :size="12" :stroke-width="2.2" class="text-cyan-brand-deep animate-spin" />
                    </span>
                    <span
                      v-else-if="getCell('A', rec.id, field.key).status === 'conflict' || getCell('A', rec.id, field.key).status === 'review-pending'"
                      class="inline-flex items-center justify-center h-3.5 w-3.5 text-red-600"
                      aria-label="Conflict"
                    >
                      <AlertTriangle :size="12" :stroke-width="2.2" />
                    </span>
                    <span class="truncate">
                      {{ formatValue(field, (getCell('A', rec.id, field.key).draft !== undefined && (getCell('A', rec.id, field.key).status === 'syncing-out' || getCell('A', rec.id, field.key).status === 'conflict' || getCell('A', rec.id, field.key).status === 'review-pending')) ? getCell('A', rec.id, field.key).draft! : rec.fieldsA[field.key]) }}
                    </span>
                    <Pencil
                      v-if="canEdit('A')"
                      :size="11"
                      :stroke-width="2"
                      class="text-mute-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  </template>
                </dd>
              </div>
            </dl>
          </li>
        </ul>
      </article>

      <!-- Pane B -->
      <article class="rounded-2xl border border-line bg-white overflow-hidden flex flex-col">
        <header class="flex items-center justify-between px-4 py-3 border-b border-line bg-surface-alt/60">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-brand/8 ring-1 ring-cyan-brand/25 text-cyan-brand-deep shrink-0">
              <component :is="pair.paneB.icon" :size="15" :stroke-width="1.9" />
            </span>
            <div class="min-w-0">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2 flex items-center gap-1.5">
                System B
                <span
                  v-if="isOneWay"
                  class="inline-flex items-center gap-0.5 rounded-full bg-ink/5 ring-1 ring-ink/10 text-mute-2 text-[9.5px] font-semibold tracking-[0.14em] px-1.5 py-0.5"
                >
                  <Lock :size="8" :stroke-width="2.4" />
                  READ-ONLY
                </span>
              </div>
              <div class="text-[14px] font-semibold text-ink truncate">{{ pair.paneB.label }}</div>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1 rounded-full bg-cyan-brand/8 ring-1 ring-cyan-brand/25 text-cyan-brand-deep text-[10.5px] font-semibold uppercase tracking-[0.16em] px-2 py-0.5"
            :class="arrowFlash === 'B→A' || arrowFlash === 'conflict' ? 'animate-pulse' : ''"
          >
            <ArrowRight v-if="arrowFlash === 'B→A'" :size="10" :stroke-width="2.4" class="-scale-x-100" />
            <Check v-else :size="10" :stroke-width="2.4" />
            {{ arrowFlash === 'B→A' ? '← Syncing' : 'In sync' }}
          </span>
        </header>

        <ul class="divide-y divide-line/70">
          <li v-for="rec in records" :key="rec.id" class="px-4 py-3">
            <div class="flex items-baseline justify-between gap-2 mb-2">
              <div class="min-w-0">
                <div class="text-[12px] font-semibold text-ink tabular-nums">{{ rec.id }}</div>
                <div class="text-[13px] text-mute truncate">{{ rec.titleB }}</div>
              </div>
            </div>
            <dl class="grid grid-cols-1 gap-1.5">
              <div
                v-for="field in pair.fieldsB"
                :key="field.key"
                class="rounded-lg px-2.5 py-1.5 -mx-0.5 flex items-center justify-between gap-3"
                :class="[cellClass('B', rec.id, field.key), fieldHoverable('B')]"
                role="button"
                :tabindex="canEdit('B') ? 0 : -1"
                :aria-disabled="!canEdit('B')"
                @click="startEdit('B', rec.id, field)"
                @keydown.enter.prevent="startEdit('B', rec.id, field)"
              >
                <dt class="text-[11.5px] font-semibold text-mute-2 uppercase tracking-[0.12em] flex items-center gap-1.5 shrink-0">
                  <span
                    v-if="field.shared"
                    class="h-1.5 w-1.5 rounded-full bg-cyan-brand"
                    aria-label="Synced field"
                  />
                  <span
                    v-else
                    class="h-1.5 w-1.5 rounded-full bg-line"
                    aria-label="Local field"
                  />
                  {{ field.label }}
                </dt>
                <dd class="text-[13.5px] font-semibold text-ink tabular-nums flex items-center gap-1.5 min-w-0">
                  <template v-if="editor && editor.side === 'B' && editor.recordId === rec.id && editor.field.key === field.key">
                    <select
                      v-if="field.type === 'select'"
                      v-model="editor.draft"
                      class="rounded-md border border-cyan-brand/60 bg-white text-[13.5px] font-semibold text-ink px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-brand/30"
                      @keydown.enter.prevent="commitEdit"
                      @keydown.escape.prevent="cancelEdit"
                      @click.stop
                    >
                      <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <input
                      v-else
                      v-model="editor.draft"
                      :type="field.type === 'number' || field.type === 'currency' ? 'number' : 'text'"
                      :inputmode="field.type === 'number' || field.type === 'currency' ? 'decimal' : 'text'"
                      step="0.01"
                      class="w-20 rounded-md border border-cyan-brand/60 bg-white text-[13.5px] font-semibold text-ink text-right tabular-nums px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-brand/30"
                      @keydown.enter.prevent="commitEdit"
                      @keydown.escape.prevent="cancelEdit"
                      @click.stop
                    />
                    <button
                      type="button"
                      class="inline-flex items-center justify-center h-5 w-5 rounded-md bg-ink hover:bg-ink-soft text-white"
                      aria-label="Save"
                      @click.stop="commitEdit"
                    >
                      <Check :size="10" :stroke-width="3" />
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center h-5 w-5 rounded-md border border-line bg-white text-mute-2 hover:text-ink"
                      aria-label="Cancel"
                      @click.stop="cancelEdit"
                    >
                      <X :size="10" :stroke-width="2.4" />
                    </button>
                  </template>
                  <template v-else>
                    <span
                      v-if="getCell('B', rec.id, field.key).status === 'syncing-out'"
                      class="inline-flex items-center justify-center h-3.5 w-3.5"
                      aria-label="Syncing"
                    >
                      <RefreshCw :size="12" :stroke-width="2.2" class="text-cyan-brand-deep animate-spin" />
                    </span>
                    <span
                      v-else-if="getCell('B', rec.id, field.key).status === 'conflict' || getCell('B', rec.id, field.key).status === 'review-pending'"
                      class="inline-flex items-center justify-center h-3.5 w-3.5 text-red-600"
                      aria-label="Conflict"
                    >
                      <AlertTriangle :size="12" :stroke-width="2.2" />
                    </span>
                    <span class="truncate">
                      {{ formatValue(field, (getCell('B', rec.id, field.key).draft !== undefined && (getCell('B', rec.id, field.key).status === 'syncing-out' || getCell('B', rec.id, field.key).status === 'conflict' || getCell('B', rec.id, field.key).status === 'review-pending')) ? getCell('B', rec.id, field.key).draft! : rec.fieldsB[field.key]) }}
                    </span>
                  </template>
                </dd>
              </div>
            </dl>
          </li>
        </ul>
      </article>

      <!-- Reconciliation log -->
      <aside class="md:col-span-2 lg:col-span-1 rounded-2xl border border-line bg-white overflow-hidden flex flex-col">
        <header class="flex items-center justify-between px-4 py-3 border-b border-line bg-surface-alt/60">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-brand/8 ring-1 ring-cyan-brand/25 text-cyan-brand-deep shrink-0">
              <History :size="15" :stroke-width="1.9" />
            </span>
            <div class="min-w-0">
              <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute-2">Audit</div>
              <div class="text-[14px] font-semibold text-ink truncate">Reconciliation log</div>
            </div>
          </div>
          <button
            v-if="log.length"
            type="button"
            class="text-[11.5px] font-semibold text-mute hover:text-ink transition-colors focus-visible:outline-none"
            @click="clearLog"
          >
            Clear
          </button>
        </header>

        <div v-if="!log.length" class="px-4 py-8 text-center">
          <span class="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-surface-alt ring-1 ring-line text-mute-2 mb-3">
            <Sparkles :size="16" :stroke-width="2" />
          </span>
          <p class="text-[13px] text-mute leading-[1.55]">
            Edit a value in either pane, or hit <span class="font-semibold text-ink">Trigger conflict</span>. Every sync event lands here.
          </p>
        </div>

        <ul v-else class="divide-y divide-line/70 max-h-[480px] overflow-y-auto">
          <li v-for="entry in log" :key="entry.id" class="px-3.5 py-3">
            <!-- Synced -->
            <template v-if="entry.kind === 'synced'">
              <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                <span class="tabular-nums">{{ entry.ts }}</span>
                <span class="h-1 w-1 rounded-full bg-line" />
                <span class="text-cyan-brand-deep">
                  {{ entry.srcLabel }} → {{ entry.destLabel }}
                </span>
              </div>
              <div class="mt-1 text-[13px] text-ink">
                <span class="font-semibold tabular-nums">{{ entry.recordId }}</span>
                <span class="text-mute"> · {{ entry.fieldLabel }}</span>
              </div>
              <div class="mt-0.5 text-[12px] text-mute-2 tabular-nums leading-[1.4]">
                <span class="text-mute-2 line-through">{{ entry.oldValue }}</span>
                <ArrowRight :size="10" :stroke-width="2.4" class="inline mx-1 -mt-0.5 text-cyan-brand-deep" />
                <span class="text-ink font-semibold">{{ entry.newValue }}</span>
              </div>
            </template>

            <!-- Blocked (one-way) -->
            <template v-else-if="entry.kind === 'blocked'">
              <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                <span class="tabular-nums">{{ entry.ts }}</span>
                <span class="h-1 w-1 rounded-full bg-line" />
                <span class="text-red-600">Blocked</span>
              </div>
              <div class="mt-1 text-[13px] text-ink">
                <span class="font-semibold tabular-nums">{{ entry.recordId }}</span>
                <span class="text-mute"> · {{ entry.fieldLabel }}</span>
              </div>
              <div class="mt-0.5 text-[12px] text-mute-2 leading-[1.4]">
                {{ entry.srcLabel }} → {{ entry.destLabel }} blocked — one-way sync
              </div>
            </template>

            <!-- Conflict resolved -->
            <template v-else-if="entry.kind === 'conflict-resolved'">
              <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold">
                <span class="tabular-nums text-mute-2">{{ entry.ts }}</span>
                <span class="h-1 w-1 rounded-full bg-line" />
                <span class="text-red-600 inline-flex items-center gap-0.5">
                  <AlertTriangle :size="9" :stroke-width="2.4" />
                  Conflict resolved
                </span>
              </div>
              <div class="mt-1 text-[13px] text-ink">
                <span class="font-semibold tabular-nums">{{ entry.recordId }}</span>
                <span class="text-mute"> · {{ entry.fieldLabel }}</span>
              </div>
              <div class="mt-1 grid grid-cols-2 gap-1.5">
                <div
                  class="rounded-md px-2 py-1 text-[11.5px] tabular-nums"
                  :class="entry.conflict?.winner === 'A' ? 'bg-cyan-brand/10 ring-1 ring-cyan-brand/30 text-ink' : 'bg-surface-alt ring-1 ring-line text-mute-2 line-through'"
                >
                  <div class="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute-2 not-italic no-underline">{{ entry.srcLabel }}</div>
                  <div class="font-semibold">{{ entry.conflict?.valueA }}</div>
                </div>
                <div
                  class="rounded-md px-2 py-1 text-[11.5px] tabular-nums"
                  :class="entry.conflict?.winner === 'B' ? 'bg-cyan-brand/10 ring-1 ring-cyan-brand/30 text-ink' : 'bg-surface-alt ring-1 ring-line text-mute-2 line-through'"
                >
                  <div class="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute-2 not-italic no-underline">{{ entry.destLabel }}</div>
                  <div class="font-semibold">{{ entry.conflict?.valueB }}</div>
                </div>
              </div>
              <div class="mt-1.5 text-[11px] text-mute-2 italic">
                Rule: <span class="text-ink not-italic font-semibold">{{ entry.conflict?.ruleLabel }}</span>
              </div>
            </template>

            <!-- Review pending -->
            <template v-else-if="entry.kind === 'review-pending'">
              <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold">
                <span class="tabular-nums text-mute-2">{{ entry.ts }}</span>
                <span class="h-1 w-1 rounded-full bg-line" />
                <span class="text-red-600 inline-flex items-center gap-0.5">
                  <AlertTriangle :size="9" :stroke-width="2.4" />
                  Awaiting review
                </span>
              </div>
              <div class="mt-1 text-[13px] text-ink">
                <span class="font-semibold tabular-nums">{{ entry.recordId }}</span>
                <span class="text-mute"> · {{ entry.fieldLabel }}</span>
              </div>
              <div class="mt-1 text-[11.5px] text-mute-2 leading-[1.45]">
                {{ entry.srcLabel }}: <span class="font-semibold text-ink tabular-nums">{{ entry.conflict?.valueA }}</span>
                · {{ entry.destLabel }}: <span class="font-semibold text-ink tabular-nums">{{ entry.conflict?.valueB }}</span>
              </div>
              <div class="mt-1.5 text-[11px] text-mute-2 italic">
                Rule: <span class="text-ink not-italic font-semibold">Human review</span>
              </div>
            </template>

            <!-- Review resolved -->
            <template v-else-if="entry.kind === 'review-resolved'">
              <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold">
                <span class="tabular-nums text-mute-2">{{ entry.ts }}</span>
                <span class="h-1 w-1 rounded-full bg-line" />
                <span class="text-cyan-brand-deep inline-flex items-center gap-0.5">
                  <Check :size="10" :stroke-width="2.4" />
                  Review resolved
                </span>
              </div>
              <div class="mt-1 text-[13px] text-ink">
                <span class="font-semibold tabular-nums">{{ entry.recordId }}</span>
                <span class="text-mute"> · {{ entry.fieldLabel }}</span>
              </div>
              <div class="mt-1 grid grid-cols-2 gap-1.5">
                <div
                  class="rounded-md px-2 py-1 text-[11.5px] tabular-nums"
                  :class="entry.conflict?.winner === 'A' ? 'bg-cyan-brand/10 ring-1 ring-cyan-brand/30 text-ink' : 'bg-surface-alt ring-1 ring-line text-mute-2 line-through'"
                >
                  <div class="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute-2 not-italic no-underline">{{ entry.srcLabel }}</div>
                  <div class="font-semibold">{{ entry.conflict?.valueA }}</div>
                </div>
                <div
                  class="rounded-md px-2 py-1 text-[11.5px] tabular-nums"
                  :class="entry.conflict?.winner === 'B' ? 'bg-cyan-brand/10 ring-1 ring-cyan-brand/30 text-ink' : 'bg-surface-alt ring-1 ring-line text-mute-2 line-through'"
                >
                  <div class="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute-2 not-italic no-underline">{{ entry.destLabel }}</div>
                  <div class="font-semibold">{{ entry.conflict?.valueB }}</div>
                </div>
              </div>
              <div class="mt-1.5 text-[11px] text-mute-2 italic">
                Rule: <span class="text-ink not-italic font-semibold">Human review</span>
                · resolved by operator
              </div>
            </template>
          </li>
        </ul>

        <footer v-if="log.length" class="px-4 py-2.5 border-t border-line bg-surface-alt/40 text-[11.5px] text-mute-2">
          {{ log.length }} {{ log.length === 1 ? 'event' : 'events' }} · newest first
        </footer>
      </aside>
    </section>

    <!-- =====================================================================
      Legend / footnote
    ===================================================================== -->
    <p class="mt-4 text-[12px] text-mute-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <span class="inline-flex items-center gap-1.5">
        <span class="h-1.5 w-1.5 rounded-full bg-cyan-brand" />
        Shared field — propagates between systems
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="h-1.5 w-1.5 rounded-full bg-line" />
        Local field — lives only on this system
      </span>
    </p>
  </div>
</template>
