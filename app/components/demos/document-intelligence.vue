<script setup lang="ts">
import { computed, h, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { AlertCircle, AlertTriangle, ArrowRight, Banknote, Boxes, CheckCircle2, ClipboardList, Eye, FileText, Folder, IdCard, Inbox, Play, Receipt, RotateCcw, ScanLine, ScrollText, ShieldCheck, Tag, Zap } from '@lucide/vue'

type ValidationStatus = 'pass' | 'fail' | 'warn'

interface DocField {
  id: string
  label: string
  value: string
  confidence: number // 0..1
}

interface Validation {
  label: string
  detail: string
  status: ValidationStatus
}

interface Routing {
  destination: string
  rule: string
  exception?: boolean
}

interface Paper {
  orientation: 'portrait' | 'card'
  /** Small rotation applied to simulate a crooked scan. */
  skew?: number
  /** Adds visual scan-noise overlay. */
  noise?: boolean
}

type Block =
  | { kind: 'headline'; text: string }
  | { kind: 'subhead'; text: string }
  | { kind: 'meta'; text: string }
  | { kind: 'divider' }
  | { kind: 'spacer'; h?: 'sm' | 'md' | 'lg' }
  | { kind: 'paragraph'; text: string }
  | { kind: 'row'; label: string; field: string; emphasis?: boolean }
  | { kind: 'kv-grid'; items: { label: string; field: string }[]; cols?: 2 | 3 }
  | { kind: 'table-head'; cells: string[] }
  | { kind: 'table-row'; cells: string[]; field?: string }
  | {
      kind: 'sig-pair'
      a: { label: string; field?: string }
      b?: { label: string; field?: string }
      missing?: 'b' | 'both'
    }
  | { kind: 'torn-page'; text: string }

interface SampleDoc {
  id: string
  shortName: string
  category: string
  classificationConfidence: number
  icon: Component
  accent: 'cyan' | 'amber'
  paper: Paper
  blocks: Block[]
  fields: DocField[]
  validations: Validation[]
  routing: Routing
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const documents: SampleDoc[] = [
  {
    id: 'gov-id',
    shortName: 'Government ID',
    category: 'Government-issued ID',
    classificationConfidence: 0.99,
    icon: IdCard,
    accent: 'cyan',
    paper: { orientation: 'card' },
    blocks: [
      { kind: 'meta', text: 'REPUBLIC OF KENYA' },
      { kind: 'headline', text: 'NATIONAL IDENTITY CARD' },
      { kind: 'spacer', h: 'sm' },
      {
        kind: 'kv-grid',
        cols: 2,
        items: [
          { label: 'Full name', field: 'name' },
          { label: 'Date of birth', field: 'dob' },
          { label: 'Sex', field: 'sex' },
          { label: 'ID number', field: 'idnum' },
          { label: 'Date of expiry', field: 'exp' },
        ],
      },
    ],
    fields: [
      { id: 'name', label: 'Full name', value: 'Jordan A. Mwangi', confidence: 0.98 },
      { id: 'dob', label: 'Date of birth', value: '14 Mar 1986', confidence: 0.96 },
      { id: 'sex', label: 'Sex', value: 'M', confidence: 0.99 },
      { id: 'idnum', label: 'ID number', value: '8603145012089', confidence: 0.99 },
      { id: 'exp', label: 'Date of expiry', value: '03 Jan 2031', confidence: 0.95 },
    ],
    validations: [
      { label: 'ID checksum', detail: 'Mod-11 verification passed.', status: 'pass' },
      { label: 'Not expired', detail: 'Valid until 03 Jan 2031.', status: 'pass' },
      { label: 'Photo present', detail: 'Face detected; quality good.', status: 'pass' },
    ],
    routing: {
      destination: 'Client matter folder · KYC',
      rule: 'Government-ID + checksum ok + not-expired → Matter / KYC',
    },
  },
  {
    id: 'utility',
    shortName: 'Utility Bill',
    category: 'Proof of address',
    classificationConfidence: 0.97,
    icon: Zap,
    accent: 'cyan',
    paper: { orientation: 'portrait' },
    blocks: [
      { kind: 'headline', text: 'Naledi Power Co.' },
      { kind: 'meta', text: 'Statement of account · NPC-2026-58812 · Issued 02 May 2026' },
      { kind: 'divider' },
      { kind: 'row', label: 'Supplier', field: 'supplier' },
      { kind: 'row', label: 'Account holder', field: 'account-holder' },
      { kind: 'row', label: 'Service address', field: 'address' },
      { kind: 'row', label: 'Billing period', field: 'period' },
      { kind: 'spacer', h: 'md' },
      { kind: 'row', label: 'Amount due', field: 'amount', emphasis: true },
    ],
    fields: [
      { id: 'supplier', label: 'Supplier', value: 'Naledi Power Co.', confidence: 0.97 },
      { id: 'account-holder', label: 'Account holder', value: 'Jordan A. Mwangi', confidence: 0.95 },
      { id: 'address', label: 'Service address', value: '42 Ridgeway, Kilimani, Nairobi', confidence: 0.93 },
      { id: 'period', label: 'Billing period', value: '01 Apr 2026 – 30 Apr 2026', confidence: 0.94 },
      { id: 'amount', label: 'Amount due', value: 'KES 4,820.50', confidence: 0.97 },
    ],
    validations: [
      { label: 'Issued within 90 days', detail: 'Bill dated 02 May 2026.', status: 'pass' },
      { label: 'Address matches client file', detail: 'Geocoded address matches on-file record.', status: 'pass' },
      { label: 'Account holder named', detail: 'Holder string matches client name exactly.', status: 'pass' },
    ],
    routing: {
      destination: 'Client matter folder · KYC packet',
      rule: 'Utility-bill + <90d + holder=client → Matter / KYC',
    },
  },
  {
    id: 'invoice',
    shortName: 'Supplier Invoice',
    category: 'Accounts-payable invoice',
    classificationConfidence: 0.98,
    icon: Receipt,
    accent: 'cyan',
    paper: { orientation: 'portrait' },
    blocks: [
      { kind: 'headline', text: 'Invoice' },
      { kind: 'meta', text: 'AOS-2026-04812 · 14 May 2026 · PO #4471' },
      { kind: 'divider' },
      { kind: 'row', label: 'Vendor', field: 'vendor' },
      { kind: 'row', label: 'Invoice no.', field: 'invno' },
      { kind: 'row', label: 'Date', field: 'invdate' },
      { kind: 'spacer', h: 'sm' },
      { kind: 'table-head', cells: ['Description', 'Qty', 'Unit', 'Line'] },
      { kind: 'table-row', cells: ['Acid-free file boxes', '120', 'R 56.00', 'R 6,720.00'] },
      { kind: 'table-row', cells: ['Index dividers, 5-tab', '50', 'R 28.00', 'R 1,400.00'] },
      { kind: 'table-row', cells: ['A4 ream, 80gsm', '40', 'R 109.00', 'R 4,360.00'] },
      { kind: 'spacer', h: 'sm' },
      { kind: 'row', label: 'Subtotal', field: 'subtotal' },
      { kind: 'row', label: 'VAT (15%)', field: 'vat' },
      { kind: 'row', label: 'Total', field: 'total', emphasis: true },
    ],
    fields: [
      { id: 'vendor', label: 'Vendor', value: 'Acme Office Supplies Ltd', confidence: 0.99 },
      { id: 'invno', label: 'Invoice no.', value: 'AOS-2026-04812', confidence: 0.98 },
      { id: 'invdate', label: 'Invoice date', value: '14 May 2026', confidence: 0.97 },
      { id: 'subtotal', label: 'Subtotal', value: 'R 12,480.00', confidence: 0.98 },
      { id: 'vat', label: 'VAT (15%)', value: 'R 1,872.00', confidence: 0.98 },
      { id: 'total', label: 'Total', value: 'R 14,352.00', confidence: 0.99 },
    ],
    validations: [
      { label: 'Subtotal + VAT = Total', detail: '12,480.00 + 1,872.00 = 14,352.00.', status: 'pass' },
      { label: 'Vendor on approved list', detail: 'Matched against vendor master.', status: 'pass' },
      { label: 'PO reference present', detail: 'Cross-referenced to PO #4471.', status: 'pass' },
    ],
    routing: {
      destination: 'Billing system · Accounts Payable',
      rule: 'Invoice + math ok + vendor approved → AP queue',
    },
  },
  {
    id: 'contract',
    shortName: 'Signed Contract',
    category: 'Mutual non-disclosure agreement',
    classificationConfidence: 0.95,
    icon: ScrollText,
    accent: 'cyan',
    paper: { orientation: 'portrait' },
    blocks: [
      { kind: 'headline', text: 'Mutual Non-Disclosure Agreement' },
      { kind: 'meta', text: 'Counter-signed · 7 pages · Effective 01 May 2026' },
      { kind: 'divider' },
      { kind: 'paragraph', text: 'This Agreement is entered into between the following parties, each of whom acknowledges the terms set out below:' },
      { kind: 'row', label: 'Party A', field: 'party-a' },
      { kind: 'row', label: 'Party B', field: 'party-b' },
      { kind: 'spacer', h: 'sm' },
      { kind: 'paragraph', text: '1. Confidential Information. Each party agrees to hold in strict confidence any non-public information disclosed by the other party in connection with the Purpose, and to use it solely to evaluate or perform that Purpose.' },
      { kind: 'paragraph', text: '2. Term. The obligations of confidentiality in this Agreement shall survive for the period stated below, regardless of any termination of the underlying relationship.' },
      { kind: 'row', label: 'Effective date', field: 'effective' },
      { kind: 'row', label: 'Term', field: 'term' },
      { kind: 'row', label: 'Governing law', field: 'law' },
      { kind: 'spacer', h: 'md' },
      {
        kind: 'sig-pair',
        a: { label: 'For Party A', field: 'sig-a' },
        b: { label: 'For Party B', field: 'sig-b' },
      },
    ],
    fields: [
      { id: 'party-a', label: 'Party A', value: 'Acme Office Supplies Ltd', confidence: 0.97 },
      { id: 'party-b', label: 'Party B', value: 'Hawthorne & Vega LLP', confidence: 0.97 },
      { id: 'effective', label: 'Effective date', value: '01 May 2026', confidence: 0.96 },
      { id: 'term', label: 'Term', value: '24 months', confidence: 0.95 },
      { id: 'law', label: 'Governing law', value: 'Republic of South Africa', confidence: 0.94 },
      { id: 'sig-a', label: 'Signature · Party A', value: 'Signed (initialled)', confidence: 0.92 },
      { id: 'sig-b', label: 'Signature · Party B', value: 'Signed (initialled)', confidence: 0.93 },
    ],
    validations: [
      { label: 'Both signature blocks present', detail: 'Counter-signed by both parties.', status: 'pass' },
      { label: 'Initials on every page', detail: 'Pages 1–7 initialled by both.', status: 'pass' },
      { label: 'Effective date populated', detail: 'Field present and parses as a date.', status: 'pass' },
    ],
    routing: {
      destination: 'Matter folder · Contracts',
      rule: 'Contract + both sigs + effective date ok → Matter / Contracts',
    },
  },
  {
    id: 'claim',
    shortName: 'Claim Form',
    category: 'Insurance claim · motor',
    classificationConfidence: 0.94,
    icon: ClipboardList,
    accent: 'cyan',
    paper: { orientation: 'portrait' },
    blocks: [
      { kind: 'headline', text: 'Insurance Claim Form' },
      { kind: 'meta', text: 'Galaxy Insurance Co. · Motor, third-party damage' },
      { kind: 'divider' },
      {
        kind: 'kv-grid',
        cols: 2,
        items: [
          { label: 'Claimant', field: 'claimant' },
          { label: 'Policy no.', field: 'policy' },
          { label: 'Date of loss', field: 'loss-date' },
          { label: 'Category', field: 'category' },
        ],
      },
      { kind: 'spacer', h: 'sm' },
      { kind: 'paragraph', text: 'Description: Whilst stationary at a controlled intersection, the claimant\'s vehicle was rear-ended by a third party. Police case #2026/05/08-114.' },
      { kind: 'spacer', h: 'sm' },
      { kind: 'row', label: 'Amount claimed', field: 'amount-claimed', emphasis: true },
      { kind: 'spacer', h: 'md' },
      {
        kind: 'sig-pair',
        a: { label: 'Claimant signature', field: 'sig' },
      },
    ],
    fields: [
      { id: 'claimant', label: 'Claimant', value: 'Priya Naidoo', confidence: 0.96 },
      { id: 'policy', label: 'Policy no.', value: 'GIC-PV-99481-22', confidence: 0.97 },
      { id: 'loss-date', label: 'Date of loss', value: '08 May 2026', confidence: 0.95 },
      { id: 'category', label: 'Category', value: 'Motor, third-party damage', confidence: 0.93 },
      { id: 'amount-claimed', label: 'Amount claimed', value: 'R 38,400.00', confidence: 0.94 },
      { id: 'sig', label: 'Claimant signature', value: 'Signed', confidence: 0.91 },
    ],
    validations: [
      { label: 'Policy in force at date of loss', detail: 'Active 11 Jan 2022 → 11 Jan 2027.', status: 'pass' },
      { label: 'Within 30-day notification window', detail: '8 days from loss to submission.', status: 'pass' },
      { label: 'Claimant signature present', detail: 'Page 3 signed and dated.', status: 'pass' },
    ],
    routing: {
      destination: 'Compliance review · Motor claims',
      rule: 'Claim + policy active + within window → Compliance / Motor',
    },
  },
  {
    id: 'statement',
    shortName: 'Bank Statement',
    category: 'Bank statement · trust account',
    classificationConfidence: 0.98,
    icon: Banknote,
    accent: 'cyan',
    paper: { orientation: 'portrait' },
    blocks: [
      { kind: 'headline', text: 'Kibo Bank, Consolidated Statement' },
      { kind: 'meta', text: 'Generated 02 May 2026 · Page 1 of 4' },
      { kind: 'divider' },
      { kind: 'row', label: 'Account holder', field: 'holder' },
      { kind: 'row', label: 'Account no.', field: 'account-no' },
      { kind: 'row', label: 'Statement period', field: 'period' },
      { kind: 'spacer', h: 'sm' },
      { kind: 'row', label: 'Opening balance', field: 'opening' },
      { kind: 'row', label: 'Closing balance', field: 'closing' },
      { kind: 'row', label: 'Net movement', field: 'movement', emphasis: true },
      { kind: 'spacer', h: 'sm' },
      { kind: 'table-head', cells: ['Date', 'Description', 'Amount'] },
      { kind: 'table-row', cells: ['03 Apr', 'Transfer · Estate D. Naidoo', '−R 184,000.00'] },
      { kind: 'table-row', cells: ['11 Apr', 'Deposit · Settlement #2147', '+R 96,200.00'] },
      { kind: 'table-row', cells: ['19 Apr', 'Disbursement · Counsel fees', '−R 42,300.00'] },
      { kind: 'table-row', cells: ['28 Apr', 'Service charge', '−R 1,800.00'] },
    ],
    fields: [
      { id: 'holder', label: 'Account holder', value: 'Hawthorne & Vega LLP, Trust', confidence: 0.97 },
      { id: 'account-no', label: 'Account no.', value: '6201-44871-002', confidence: 0.98 },
      { id: 'period', label: 'Statement period', value: '01 Apr 2026 – 30 Apr 2026', confidence: 0.96 },
      { id: 'opening', label: 'Opening balance', value: 'R 4,210,884.12', confidence: 0.98 },
      { id: 'closing', label: 'Closing balance', value: 'R 3,987,012.40', confidence: 0.98 },
      { id: 'movement', label: 'Net movement', value: '−R 223,871.72', confidence: 0.96 },
    ],
    validations: [
      { label: 'Opening + transactions = Closing', detail: '4,210,884.12 + (−223,871.72) = 3,987,012.40.', status: 'pass' },
      { label: 'No duplicate entries', detail: '47 distinct transactions, no replays.', status: 'pass' },
      { label: 'Period matches request', detail: 'April 2026, as requested.', status: 'pass' },
    ],
    routing: {
      destination: 'Matter folder · Estate audit',
      rule: 'Statement + math ok + period match → Matter / Estate audit',
    },
  },
  {
    id: 'malformed-claim',
    shortName: 'Crooked Scan',
    category: 'Insurance claim · ambiguous',
    classificationConfidence: 0.62,
    icon: AlertTriangle,
    accent: 'amber',
    paper: { orientation: 'portrait', skew: -2.4, noise: true },
    blocks: [
      { kind: 'headline', text: 'Insurance Claim Form' },
      { kind: 'meta', text: 'Galaxy Insurance Co. · Home, water damage' },
      { kind: 'divider' },
      {
        kind: 'kv-grid',
        cols: 2,
        items: [
          { label: 'Claimant', field: 'claimant' },
          { label: 'Policy no.', field: 'policy' },
          { label: 'Date of loss', field: 'loss-date' },
          { label: 'Category', field: 'category' },
        ],
      },
      { kind: 'spacer', h: 'sm' },
      { kind: 'paragraph', text: 'Description: B?rst geyser on upper floor caused water in?ress to k?tchen ceiling. Plumber attended same evening; ce?ling pa?els removed.' },
      { kind: 'torn-page', text: 'Page 2 of 3 not received, amount claimed & signature block missing' },
    ],
    fields: [
      { id: 'claimant', label: 'Claimant', value: 'M??r?us E. K??ler', confidence: 0.41 },
      { id: 'policy', label: 'Policy no.', value: 'GIC-HM-???1?-1?', confidence: 0.38 },
      { id: 'loss-date', label: 'Date of loss', value: '0? Apr 2026', confidence: 0.46 },
      { id: 'category', label: 'Category', value: 'Home, water damage', confidence: 0.82 },
      { id: 'amount-claimed', label: 'Amount claimed', value: '- missing -', confidence: 0.12 },
      { id: 'sig', label: 'Claimant signature', value: '- page 2 missing -', confidence: 0.0 },
    ],
    validations: [
      { label: 'Page 2 detected', detail: 'Expected 3 pages; received 2. Signature & amount block on missing page.', status: 'fail' },
      { label: 'Scan quality', detail: 'Skew −2.4°, low DPI, name and policy fields below 50% confidence.', status: 'warn' },
      { label: 'Policy lookup', detail: 'Policy number partially obscured, no unambiguous match.', status: 'fail' },
    ],
    routing: {
      destination: 'Human review tray · Exceptions',
      rule: 'Confidence < 75% OR missing page → Human review',
      exception: true,
    },
  },
]

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type Mode = 'single' | 'batch'
type Stage = 'idle' | 'ocr' | 'classify' | 'validate' | 'route' | 'done'

const mode = ref<Mode>('single')
const selectedId = ref<string>('gov-id')
const stage = ref<Stage>('idle')

const docOf = (id: string) => documents.find((d) => d.id === id)!
const selected = computed(() => docOf(selectedId.value))

const ocrRevealedFields = ref<Set<string>>(new Set())
const dropHover = ref(false)

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const timers: number[] = []
function clearTimers() {
  for (const t of timers.splice(0)) clearTimeout(t)
}
onBeforeUnmount(clearTimers)

function schedule(fn: () => void, ms: number) {
  timers.push(window.setTimeout(fn, reducedMotion ? 0 : ms))
}

function pickDoc(id: string) {
  if (mode.value !== 'single') return
  clearTimers()
  selectedId.value = id
  stage.value = 'idle'
  ocrRevealedFields.value = new Set()
}

function runSingle() {
  clearTimers()
  stage.value = 'ocr'
  ocrRevealedFields.value = new Set()

  const doc = selected.value
  // Stagger the OCR field reveals.
  doc.fields.forEach((f, i) => {
    schedule(() => {
      const next = new Set(ocrRevealedFields.value)
      next.add(f.id)
      ocrRevealedFields.value = next
    }, 250 + i * 220)
  })

  const ocrTotal = 250 + doc.fields.length * 220

  schedule(() => {
    stage.value = 'classify'
  }, ocrTotal + 250)

  schedule(() => {
    stage.value = 'validate'
  }, ocrTotal + 700)

  schedule(() => {
    stage.value = 'route'
  }, ocrTotal + 1150)

  schedule(() => {
    stage.value = 'done'
  }, ocrTotal + 1500)
}

function resetSingle() {
  clearTimers()
  stage.value = 'idle'
  ocrRevealedFields.value = new Set()
}

// ---------------------------------------------------------------------------
// Drag-and-drop from tray to dropzone
// ---------------------------------------------------------------------------

const draggingId = ref<string | null>(null)

function onDragStart(e: DragEvent, id: string) {
  draggingId.value = id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
}
function onDragEnd() {
  draggingId.value = null
}
function onDropZoneOver(e: DragEvent) {
  if (mode.value !== 'single') return
  e.preventDefault()
  dropHover.value = true
}
function onDropZoneLeave() {
  dropHover.value = false
}
function onDropZoneDrop(e: DragEvent) {
  e.preventDefault()
  dropHover.value = false
  const id = e.dataTransfer?.getData('text/plain')
  if (id && documents.some((d) => d.id === id)) {
    pickDoc(id)
  }
}

// ---------------------------------------------------------------------------
// Batch mode
// ---------------------------------------------------------------------------

interface BatchTick {
  index: number
  docId: string
  shortName: string
  category: string
  exception: boolean
  reason?: string
}

const BATCH_SIZE = 25
const batchProcessed = ref(0)
const batchExceptions = ref<BatchTick[]>([])
const batchTail = ref<BatchTick[]>([]) // recent few ticks for the ticker
const batchActive = ref(false)
const batchDone = ref(false)

// Pre-defined batch script: 22 happy-path docs across the six types, then
// 3 known exceptions sprinkled at indices 7, 14 and 22 (1-indexed).
const happyTypes: { id: string; reason?: undefined }[] = (
  ['gov-id', 'utility', 'invoice', 'contract', 'claim', 'statement'] as const
).map((id) => ({ id }))

const exceptionScript: { at: number; docId: string; reason: string }[] = [
  { at: 7, docId: 'malformed-claim', reason: 'Page 2 missing, claimant signature & amount not captured.' },
  { at: 14, docId: 'invoice', reason: 'Subtotal + VAT does not equal Total (R 0.10 mismatch).' },
  { at: 22, docId: 'gov-id', reason: 'ID number failed Mod-11 checksum.' },
]

function buildBatchScript(): BatchTick[] {
  const ticks: BatchTick[] = []
  let happyIdx = 0
  for (let i = 1; i <= BATCH_SIZE; i++) {
    const ex = exceptionScript.find((e) => e.at === i)
    if (ex) {
      const d = docOf(ex.docId)
      ticks.push({
        index: i,
        docId: d.id,
        shortName: d.shortName,
        category: d.category,
        exception: true,
        reason: ex.reason,
      })
    } else {
      const pick = happyTypes[happyIdx % happyTypes.length]!
      happyIdx++
      const d = docOf(pick.id)
      ticks.push({
        index: i,
        docId: d.id,
        shortName: d.shortName,
        category: d.category,
        exception: false,
      })
    }
  }
  return ticks
}

function runBatch() {
  clearTimers()
  batchProcessed.value = 0
  batchExceptions.value = []
  batchTail.value = []
  batchActive.value = true
  batchDone.value = false

  const script = buildBatchScript()
  const tickMs = reducedMotion ? 0 : 220

  script.forEach((tick, i) => {
    schedule(() => {
      batchProcessed.value = tick.index
      // Keep tail to 5 most recent
      const tail = [tick, ...batchTail.value].slice(0, 5)
      batchTail.value = tail
      if (tick.exception) {
        batchExceptions.value = [...batchExceptions.value, tick]
      }
      if (i === script.length - 1) {
        schedule(() => {
          batchActive.value = false
          batchDone.value = true
        }, 350)
      }
    }, i * tickMs)
  })
}

function resetBatch() {
  clearTimers()
  batchProcessed.value = 0
  batchExceptions.value = []
  batchTail.value = []
  batchActive.value = false
  batchDone.value = false
}

watch(mode, (m) => {
  clearTimers()
  if (m === 'single') {
    resetBatch()
    stage.value = 'idle'
    ocrRevealedFields.value = new Set()
  } else {
    resetSingle()
  }
})

// ---------------------------------------------------------------------------
// Derived UI helpers
// ---------------------------------------------------------------------------

const isOcrActive = computed(() => stage.value !== 'idle')
const isDone = computed(() => stage.value === 'done')
const showClassification = computed(() =>
  ['classify', 'validate', 'route', 'done'].includes(stage.value),
)
const showValidation = computed(() =>
  ['validate', 'route', 'done'].includes(stage.value),
)
const showRouting = computed(() => ['route', 'done'].includes(stage.value))

function fieldRevealed(id: string) {
  return ocrRevealedFields.value.has(id) || isDone.value
}
function fieldOf(doc: SampleDoc, id: string): DocField | undefined {
  return doc.fields.find((f) => f.id === id)
}
function confidenceBand(c: number): 'high' | 'med' | 'low' {
  if (c >= 0.9) return 'high'
  if (c >= 0.7) return 'med'
  return 'low'
}
function confidencePct(c: number): string {
  return `${Math.round(c * 100)}%`
}
function statusIcon(s: ValidationStatus): Component {
  if (s === 'pass') return CheckCircle2
  if (s === 'warn') return AlertCircle
  return XCircle
}
function statusClasses(s: ValidationStatus): string {
  if (s === 'pass') return 'text-cyan-brand-deep bg-cyan-brand/8 ring-cyan-brand/25'
  if (s === 'warn') return 'text-amber-700 bg-amber-50 ring-amber-200'
  return 'text-red-600 bg-red-50 ring-red-100'
}

const batchProgress = computed(() =>
  Math.min(100, Math.round((batchProcessed.value / BATCH_SIZE) * 100)),
)
const batchClean = computed(() => batchProcessed.value - batchExceptions.value.length)

</script>

<template>
  <div class="di-demo">
    <!-- Header strip -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-4 border-b border-line">
      <div>
        <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          <span class="dot" />
          Document Intelligence · Intake Desk
        </div>
        <h3 class="mt-2 font-display text-[18px] sm:text-[22px] md:text-[24px] leading-[1.15] text-ink">
          <template v-if="mode === 'single'">
            Pick a document, watch the desk read it.
          </template>
          <template v-else>
            Drop 25 in at once, watch only the exceptions surface.
          </template>
        </h3>
      </div>

      <!-- Mode toggle -->
      <div
        role="tablist"
        aria-label="Demo mode"
        class="self-start sm:self-auto inline-flex p-1 rounded-xl border border-line bg-surface-alt/70"
      >
        <button
          role="tab"
          :aria-selected="mode === 'single'"
          @click="mode = 'single'"
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
            mode === 'single' ? 'bg-white text-ink border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)]' : 'text-mute hover:text-ink',
          ]"
        >
          <FileText :size="14" :stroke-width="1.9" aria-hidden="true" />
          Single doc
        </button>
        <button
          role="tab"
          :aria-selected="mode === 'batch'"
          @click="mode = 'batch'"
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
            mode === 'batch' ? 'bg-white text-ink border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)]' : 'text-mute hover:text-ink',
          ]"
        >
          <Boxes :size="14" :stroke-width="1.9" aria-hidden="true" />
          Batch of 25
        </button>
      </div>
    </header>

    <!-- ===================================================================
         SINGLE-DOC MODE
         =================================================================== -->
    <div v-if="mode === 'single'" class="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_320px] gap-0">
      <!-- Tray -->
      <aside
        class="border-b lg:border-b-0 lg:border-r border-line bg-surface-alt/40 px-3 md:px-4 py-4"
        aria-label="Sample document tray"
      >
        <div class="text-[11px] uppercase tracking-[0.22em] font-semibold text-mute-2 mb-3 px-1">
          Tray · drag or pick
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-2">
          <button
            v-for="d in documents"
            :key="d.id"
            type="button"
            draggable="true"
            @dragstart="onDragStart($event, d.id)"
            @dragend="onDragEnd"
            @click="pickDoc(d.id)"
            :class="[
              'group flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all duration-200 cursor-grab active:cursor-grabbing',
              selectedId === d.id
                ? 'border-cyan-brand/50 bg-white ring-1 ring-cyan-brand/25'
                : 'border-line bg-white hover:border-cyan-brand/40 hover:-translate-y-0.5',
              draggingId === d.id ? 'opacity-50' : '',
            ]"
            :aria-pressed="selectedId === d.id"
            :aria-label="`Select ${d.shortName}, ${d.category}`"
          >
            <span
              :class="[
                'inline-flex items-center justify-center h-8 w-8 rounded-lg ring-1 shrink-0',
                d.accent === 'amber'
                  ? 'bg-amber-50 text-amber-700 ring-amber-200'
                  : 'bg-cyan-brand/8 text-cyan-brand-deep ring-cyan-brand/25',
              ]"
              aria-hidden="true"
            >
              <component :is="d.icon" :size="15" :stroke-width="1.9" />
            </span>
            <span class="min-w-0">
              <span class="block text-[12.5px] font-semibold text-ink leading-tight truncate">{{ d.shortName }}</span>
              <span class="block text-[10.5px] text-mute-2 leading-tight truncate">{{ d.category }}</span>
            </span>
          </button>
        </div>
      </aside>

      <!-- Preview area -->
      <section
        class="relative px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 bg-[radial-gradient(ellipse_at_top,rgba(1,219,241,0.05),transparent_60%)]"
        @dragover="onDropZoneOver"
        @dragleave="onDropZoneLeave"
        @drop="onDropZoneDrop"
        aria-label="Document preview"
      >
        <!-- Dropzone affordance -->
        <div
          v-if="dropHover"
          class="pointer-events-none absolute inset-2 rounded-2xl border-2 border-dashed border-cyan-brand/60 bg-cyan-brand/5 z-10 flex items-center justify-center"
          aria-hidden="true"
        >
          <span class="inline-flex items-center gap-2 rounded-full bg-white border border-cyan-brand/40 px-3 py-1.5 text-[12.5px] font-semibold text-cyan-brand-deep">
            <Inbox :size="14" :stroke-width="2" />
            Drop to inspect
          </span>
        </div>

        <!-- Paper -->
        <div class="flex flex-col items-center">
          <div
            :class="[
              'di-paper relative bg-white border border-line shadow-[0_30px_60px_-40px_rgba(15,23,42,0.25),0_8px_18px_-12px_rgba(15,23,42,0.08)]',
              selected.paper.orientation === 'card' ? 'di-paper--card' : 'di-paper--portrait',
              selected.paper.noise ? 'di-paper--noise' : '',
            ]"
            :style="selected.paper.skew ? `transform: rotate(${selected.paper.skew}deg);` : ''"
            :aria-label="`Preview · ${selected.shortName}`"
          >
            <!-- Scan beam -->
            <div
              v-if="stage === 'ocr'"
              class="di-scan-beam pointer-events-none"
              aria-hidden="true"
            />

            <!-- ID-card layout -->
            <div v-if="selected.paper.orientation === 'card'" class="p-5 md:p-6 h-full flex gap-5">
              <div class="shrink-0 w-[88px] md:w-[104px]">
                <div class="aspect-[3/4] rounded-lg bg-[linear-gradient(135deg,#cfd8e3_0%,#e9eef5_60%,#f6f8fb_100%)] border border-line flex items-center justify-center">
                  <span class="font-display text-[28px] md:text-[32px] text-ink/30 leading-none">JM</span>
                </div>
                <div class="mt-2 h-1.5 rounded-full bg-line"></div>
                <div class="mt-1 h-1.5 rounded-full bg-line w-3/4"></div>
              </div>

              <div class="flex-1 min-w-0">
                <template v-for="(b, i) in selected.blocks" :key="i">
                  <div v-if="b.kind === 'meta'" class="text-[10px] uppercase tracking-[0.28em] text-mute-2 font-semibold">
                    {{ b.text }}
                  </div>
                  <div v-else-if="b.kind === 'headline'" class="mt-1 font-display text-[18px] md:text-[20px] leading-[1.1] text-ink">
                    {{ b.text }}
                  </div>
                  <div v-else-if="b.kind === 'spacer'" :class="b.h === 'lg' ? 'h-4' : b.h === 'md' ? 'h-3' : 'h-2'" />
                  <div v-else-if="b.kind === 'kv-grid'" class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    <div
                      v-for="item in b.items"
                      :key="item.field"
                      class="di-field"
                      :data-revealed="fieldRevealed(item.field)"
                      :data-band="confidenceBand(fieldOf(selected, item.field)?.confidence ?? 0)"
                    >
                      <div class="text-[9px] uppercase tracking-[0.2em] text-mute-2 font-semibold">{{ item.label }}</div>
                      <div class="text-[12.5px] font-semibold text-ink leading-tight truncate">
                        {{ fieldOf(selected, item.field)?.value }}
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Portrait layout (generic blocks) -->
            <div v-else class="px-4 sm:px-6 md:px-8 py-5 sm:py-7 md:py-9">
              <template v-for="(b, i) in selected.blocks" :key="i">
                <div v-if="b.kind === 'headline'" class="font-display text-[18px] sm:text-[22px] md:text-[26px] leading-[1.1] text-ink">{{ b.text }}</div>
                <div v-else-if="b.kind === 'subhead'" class="font-display text-[16px] md:text-[18px] leading-[1.15] text-ink/80 mt-1">{{ b.text }}</div>
                <div v-else-if="b.kind === 'meta'" class="text-[11px] uppercase tracking-[0.22em] text-mute-2 font-semibold mt-1">{{ b.text }}</div>
                <div v-else-if="b.kind === 'divider'" class="my-3 border-t border-line" />
                <div v-else-if="b.kind === 'spacer'" :class="b.h === 'lg' ? 'h-5' : b.h === 'md' ? 'h-3.5' : 'h-2'" />
                <p v-else-if="b.kind === 'paragraph'" class="text-[12.5px] leading-[1.65] text-ink/80 my-2">{{ b.text }}</p>

                <div
                  v-else-if="b.kind === 'row'"
                  class="di-field flex items-baseline gap-3 py-1"
                  :data-revealed="fieldRevealed(b.field)"
                  :data-band="confidenceBand(fieldOf(selected, b.field)?.confidence ?? 0)"
                >
                  <span class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold w-[100px] sm:w-[140px] shrink-0">{{ b.label }}</span>
                  <span :class="['text-[13px] text-ink', b.emphasis ? 'font-display text-[16px] md:text-[18px] leading-[1.2]' : 'font-semibold']">
                    {{ fieldOf(selected, b.field)?.value }}
                  </span>
                </div>

                <div v-else-if="b.kind === 'kv-grid'" class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 mt-1">
                  <div
                    v-for="item in b.items"
                    :key="item.field"
                    class="di-field"
                    :data-revealed="fieldRevealed(item.field)"
                    :data-band="confidenceBand(fieldOf(selected, item.field)?.confidence ?? 0)"
                  >
                    <div class="text-[10px] uppercase tracking-[0.2em] text-mute-2 font-semibold">{{ item.label }}</div>
                    <div class="text-[13px] font-semibold text-ink leading-tight">
                      {{ fieldOf(selected, item.field)?.value }}
                    </div>
                  </div>
                </div>

                <div v-else-if="b.kind === 'table-head'" class="mt-2 grid gap-2 text-[10px] uppercase tracking-[0.18em] text-mute-2 font-semibold border-b border-line pb-1.5"
                  :style="`grid-template-columns: ${b.cells.length === 4 ? '2fr 0.6fr 0.8fr 0.8fr' : 'repeat(' + b.cells.length + ', 1fr)'};`"
                >
                  <span v-for="(c, ci) in b.cells" :key="ci" :class="ci === b.cells.length - 1 ? 'text-right' : ''">{{ c }}</span>
                </div>

                <div v-else-if="b.kind === 'table-row'" class="grid gap-2 text-[12px] text-ink/85 py-1"
                  :style="`grid-template-columns: ${b.cells.length === 4 ? '2fr 0.6fr 0.8fr 0.8fr' : 'repeat(' + b.cells.length + ', 1fr)'};`"
                >
                  <span v-for="(c, ci) in b.cells" :key="ci" :class="ci === b.cells.length - 1 ? 'text-right font-semibold' : ''">{{ c }}</span>
                </div>

                <div v-else-if="b.kind === 'sig-pair'" class="mt-3 grid gap-6" :class="b.b ? 'grid-cols-2' : 'grid-cols-1'">
                  <div
                    class="di-field"
                    :data-revealed="b.a.field ? fieldRevealed(b.a.field) : false"
                    :data-band="b.a.field ? confidenceBand(fieldOf(selected, b.a.field)?.confidence ?? 0) : 'high'"
                  >
                    <div class="text-[10px] uppercase tracking-[0.18em] text-mute-2 font-semibold">{{ b.a.label }}</div>
                    <div class="mt-3 h-px bg-ink/30" />
                    <div class="mt-1.5 text-[11.5px] italic text-ink/70">
                      {{ b.a.field ? fieldOf(selected, b.a.field)?.value : '' }}
                    </div>
                  </div>
                  <div
                    v-if="b.b"
                    class="di-field"
                    :data-revealed="b.b.field ? fieldRevealed(b.b.field) : false"
                    :data-band="b.b.field ? confidenceBand(fieldOf(selected, b.b.field)?.confidence ?? 0) : 'high'"
                  >
                    <div class="text-[10px] uppercase tracking-[0.18em] text-mute-2 font-semibold">{{ b.b.label }}</div>
                    <div class="mt-3 h-px bg-ink/30" />
                    <div class="mt-1.5 text-[11.5px] italic text-ink/70">
                      {{ b.b.field ? fieldOf(selected, b.b.field)?.value : '' }}
                    </div>
                  </div>
                </div>

                <div v-else-if="b.kind === 'torn-page'" class="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2.5 text-[11.5px] text-amber-800 inline-flex items-center gap-1.5">
                  <AlertTriangle :size="13" :stroke-width="2" />
                  {{ b.text }}
                </div>
              </template>
            </div>
          </div>

          <!-- Status strip / controls -->
          <div class="mt-5 w-full max-w-[640px]">
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
              <div class="flex items-center gap-2 text-[12.5px] font-semibold text-ink min-w-0">
                <ScanLine
                  :size="15"
                  :stroke-width="2"
                  :class="['shrink-0', stage === 'ocr' ? 'text-cyan-brand-deep di-spin' : 'text-mute-2']"
                  aria-hidden="true"
                />
                <span class="truncate">
                  <template v-if="stage === 'idle'">Ready, press “Process” to begin.</template>
                  <template v-else-if="stage === 'ocr'">OCR running · extracting fields…</template>
                  <template v-else-if="stage === 'classify'">Classifying document type…</template>
                  <template v-else-if="stage === 'validate'">Validating structure & maths…</template>
                  <template v-else-if="stage === 'route'">Routing to destination…</template>
                  <template v-else>
                    Done · {{ Math.round(selected.classificationConfidence * 100) }}% classifier confidence.
                  </template>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="stage === 'idle'"
                  type="button"
                  @click="runSingle"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[13px] font-semibold px-3.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                >
                  <Play :size="13" :stroke-width="2" />
                  Process document
                </button>
                <button
                  v-else
                  type="button"
                  @click="resetSingle"
                  :disabled="stage !== 'done'"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white hover:border-ink/30 disabled:opacity-50 disabled:cursor-not-allowed text-ink text-[13px] font-semibold px-3.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                >
                  <RotateCcw :size="13" :stroke-width="2" />
                  Run another
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Inspector -->
      <aside
        class="border-t lg:border-t-0 lg:border-l border-line bg-surface-alt/30 px-4 md:px-5 py-5"
        aria-label="Inspector"
      >
        <!-- Classification -->
        <div class="di-panel" :data-visible="showClassification">
          <div class="di-panel__head">
            <Tag :size="13" :stroke-width="2" />
            Classification
          </div>
          <div class="rounded-xl border border-line bg-white px-3.5 py-3">
            <div class="text-[12.5px] font-semibold text-ink leading-tight">{{ selected.category }}</div>
            <div class="mt-1.5 flex items-center gap-2">
              <div class="h-1.5 flex-1 rounded-full bg-line overflow-hidden">
                <div
                  class="h-full bg-cyan-brand-deep transition-[width] duration-500 ease-out"
                  :style="`width: ${Math.round(selected.classificationConfidence * 100)}%`"
                />
              </div>
              <span class="text-[11px] font-semibold text-mute">{{ confidencePct(selected.classificationConfidence) }}</span>
            </div>
          </div>
        </div>

        <!-- Fields -->
        <div class="di-panel mt-4" :data-visible="showClassification">
          <div class="di-panel__head">
            <ScanLine :size="13" :stroke-width="2" />
            Extracted fields
          </div>
          <ul class="space-y-1.5">
            <li
              v-for="f in selected.fields"
              :key="f.id"
              class="flex items-baseline justify-between gap-2 rounded-lg border border-line bg-white px-3 py-2"
            >
              <div class="min-w-0">
                <div class="text-[10px] uppercase tracking-[0.18em] text-mute-2 font-semibold">{{ f.label }}</div>
                <div class="text-[12.5px] text-ink font-semibold truncate">{{ f.value }}</div>
              </div>
              <span
                :class="[
                  'shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1',
                  confidenceBand(f.confidence) === 'high' ? 'text-cyan-brand-deep bg-cyan-brand/8 ring-cyan-brand/25'
                    : confidenceBand(f.confidence) === 'med' ? 'text-amber-700 bg-amber-50 ring-amber-200'
                    : 'text-red-600 bg-red-50 ring-red-100',
                ]"
              >
                {{ confidencePct(f.confidence) }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Validation -->
        <div class="di-panel mt-4" :data-visible="showValidation">
          <div class="di-panel__head">
            <ShieldCheck :size="13" :stroke-width="2" />
            Validation
          </div>
          <ul class="space-y-1.5">
            <li
              v-for="(v, vi) in selected.validations"
              :key="vi"
              class="flex items-start gap-2 rounded-lg border border-line bg-white px-3 py-2"
            >
              <span
                :class="[
                  'shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full ring-1 mt-0.5',
                  statusClasses(v.status),
                ]"
                aria-hidden="true"
              >
                <component :is="statusIcon(v.status)" :size="11" :stroke-width="2.4" />
              </span>
              <div class="min-w-0">
                <div class="text-[12px] font-semibold text-ink leading-tight">{{ v.label }}</div>
                <div class="text-[11.5px] text-mute leading-snug mt-0.5">{{ v.detail }}</div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Routing -->
        <div class="di-panel mt-4" :data-visible="showRouting">
          <div class="di-panel__head">
            <ArrowRight :size="13" :stroke-width="2" />
            Routing decision
          </div>
          <div
            :class="[
              'rounded-xl border px-3.5 py-3',
              selected.routing.exception
                ? 'border-amber-200 bg-amber-50/60'
                : 'border-cyan-brand/30 bg-cyan-brand/5',
            ]"
          >
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'inline-flex items-center justify-center h-7 w-7 rounded-lg ring-1',
                  selected.routing.exception
                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                    : 'bg-white text-cyan-brand-deep ring-cyan-brand/30',
                ]"
                aria-hidden="true"
              >
                <component :is="selected.routing.exception ? Eye : Folder" :size="13" :stroke-width="2" />
              </span>
              <div class="text-[12.5px] font-semibold text-ink">{{ selected.routing.destination }}</div>
            </div>
            <div class="mt-2 text-[11.5px] text-mute leading-snug font-mono">
              <span class="text-mute-2 mr-1">rule:</span>{{ selected.routing.rule }}
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- ===================================================================
         BATCH MODE
         =================================================================== -->
    <div v-else class="px-4 sm:px-5 md:px-6 py-5 sm:py-6">
      <!-- Counters -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-5">
        <div class="rounded-xl border border-line bg-white px-4 py-3">
          <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">Processed</div>
          <div class="mt-1 font-display text-[22px] sm:text-[28px] md:text-[34px] leading-none text-ink">{{ batchProcessed }} <span class="text-mute-2 text-[14px] sm:text-[16px]">/ {{ BATCH_SIZE }}</span></div>
        </div>
        <div class="rounded-xl border border-cyan-brand/30 bg-cyan-brand/5 px-4 py-3">
          <div class="text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">Auto-routed</div>
          <div class="mt-1 font-display text-[22px] sm:text-[28px] md:text-[34px] leading-none text-ink">{{ batchClean }}</div>
        </div>
        <div :class="[
          'rounded-xl border px-4 py-3',
          batchExceptions.length ? 'border-amber-200 bg-amber-50/60' : 'border-line bg-white',
        ]">
          <div :class="['text-[10.5px] uppercase tracking-[0.22em] font-semibold', batchExceptions.length ? 'text-amber-700' : 'text-mute-2']">Exceptions</div>
          <div class="mt-1 font-display text-[22px] sm:text-[28px] md:text-[34px] leading-none text-ink">{{ batchExceptions.length }}</div>
        </div>
      </div>

      <!-- Throughput bar -->
      <div class="rounded-xl border border-line bg-white px-4 py-3 mb-5">
        <div class="flex items-center justify-between text-[11.5px] font-semibold text-mute">
          <span>Throughput</span>
          <span class="text-ink">{{ batchProgress }}%</span>
        </div>
        <div class="mt-2 h-2 rounded-full bg-line overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-cyan-brand to-cyan-brand-deep transition-[width] duration-200 ease-out"
            :style="`width: ${batchProgress}%`"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <!-- Ticker -->
        <div class="rounded-xl border border-line bg-surface-alt/50 px-4 py-3 min-h-[180px]">
          <div class="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-mute-2 mb-2">
            Live · last five
          </div>
          <ul class="space-y-1.5">
            <li
              v-for="tick in batchTail"
              :key="tick.index"
              :class="[
                'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] di-ticker-row min-w-0',
                tick.exception ? 'border-amber-200 bg-amber-50/60' : 'border-line bg-white',
              ]"
            >
              <span :class="[
                'inline-flex h-6 w-6 items-center justify-center rounded-md ring-1 shrink-0',
                tick.exception ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-cyan-brand/8 text-cyan-brand-deep ring-cyan-brand/25',
              ]" aria-hidden="true">
                <component :is="tick.exception ? AlertTriangle : CheckCircle2" :size="13" :stroke-width="2" />
              </span>
              <span class="font-mono text-[10.5px] text-mute-2 w-7 text-right">{{ String(tick.index).padStart(2, '0') }}</span>
              <span class="text-ink font-semibold truncate">{{ tick.shortName }}</span>
              <span class="text-mute-2 truncate">· {{ tick.category }}</span>
              <span :class="[
                'ml-auto text-[10.5px] font-semibold',
                tick.exception ? 'text-amber-700' : 'text-cyan-brand-deep',
              ]">
                {{ tick.exception ? 'review' : 'routed' }}
              </span>
            </li>
            <li v-if="!batchTail.length" class="text-[12.5px] text-mute-2 italic">
              No documents yet, press “Run batch”.
            </li>
          </ul>
        </div>

        <!-- Exceptions -->
        <div class="rounded-xl border border-line bg-white px-4 py-3 min-h-[180px]">
          <div class="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-mute-2 mb-2 flex items-center gap-2">
            <Eye :size="12" :stroke-width="2" />
            Exceptions surfaced for review
          </div>
          <ul class="space-y-2">
            <li
              v-for="ex in batchExceptions"
              :key="ex.index"
              class="rounded-lg border border-amber-200 bg-amber-50/40 px-3 py-2"
            >
              <div class="flex items-center gap-2 text-[12px]">
                <span class="font-mono text-[10.5px] text-amber-800 bg-white border border-amber-200 rounded px-1.5 py-0.5">#{{ String(ex.index).padStart(2, '0') }}</span>
                <span class="font-semibold text-ink">{{ ex.shortName }}</span>
                <span class="text-mute-2">· {{ ex.category }}</span>
              </div>
              <div class="mt-1 text-[11.5px] text-amber-900 leading-snug">{{ ex.reason }}</div>
            </li>
            <li v-if="!batchExceptions.length" class="text-[12.5px] text-mute-2 italic">
              <template v-if="batchActive">Quiet so far, that's how the team likes it.</template>
              <template v-else>Run the batch to see only what needs human eyes.</template>
            </li>
          </ul>
        </div>
      </div>

      <!-- Summary / controls -->
      <div class="mt-5 rounded-xl border border-line bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div class="text-[13px] text-ink min-w-0">
          <template v-if="batchDone">
            <span class="font-semibold">{{ batchClean }} auto-routed silently.</span>
            <span class="text-mute"> {{ batchExceptions.length }} needed your eyes.</span>
          </template>
          <template v-else-if="batchActive">
            <span class="text-mute">Streaming… most are routing themselves.</span>
          </template>
          <template v-else>
            <span class="text-mute">25 documents queued: 6 types, mixed quality, three known exceptions.</span>
          </template>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="!batchActive && !batchDone"
            type="button"
            @click="runBatch"
            class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[13px] font-semibold px-3.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          >
            <Boxes :size="13" :stroke-width="2" />
            Run batch of 25
          </button>
          <button
            v-else
            type="button"
            @click="resetBatch"
            :disabled="batchActive"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white hover:border-ink/30 disabled:opacity-50 disabled:cursor-not-allowed text-ink text-[13px] font-semibold px-3.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          >
            <RotateCcw :size="13" :stroke-width="2" />
            Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.di-demo {
  /* The DemoSlot wrapper already provides the card chrome. */
  font-family: var(--font-sans);
}

/* ---- Paper shapes ---- */
.di-paper {
  border-radius: 14px;
  width: 100%;
  max-width: 640px;
  overflow: hidden;
  transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
}
.di-paper--portrait {
  min-height: 520px;
}
.di-paper--card {
  aspect-ratio: 1.585 / 1;
  max-width: 520px;
  min-height: 0;
}
.di-paper--noise::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px);
  background-size: 3px 3px;
  mix-blend-mode: multiply;
  opacity: 0.5;
}

/* ---- OCR field overlay ----
   Idle: just renders the text plain.
   Once revealed (data-revealed=true), wrap field in a tinted, ringed pill
   keyed off confidence band. */
.di-field {
  position: relative;
  border-radius: 6px;
  padding: 2px 6px;
  margin: -2px -6px;
  transition:
    background-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.di-field[data-revealed='true'][data-band='high'] {
  background: rgba(1, 219, 241, 0.10);
  box-shadow: inset 0 0 0 1.5px rgba(0, 184, 204, 0.45);
}
.di-field[data-revealed='true'][data-band='med'] {
  background: rgba(245, 158, 11, 0.10);
  box-shadow: inset 0 0 0 1.5px rgba(217, 119, 6, 0.55);
}
.di-field[data-revealed='true'][data-band='low'] {
  background: rgba(220, 38, 38, 0.08);
  box-shadow: inset 0 0 0 1.5px rgba(220, 38, 38, 0.55);
}

/* ---- Scan beam (OCR animation) ---- */
.di-scan-beam {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(1, 219, 241, 0) 0%,
    rgba(1, 219, 241, 0.0) 40%,
    rgba(1, 219, 241, 0.32) 50%,
    rgba(1, 219, 241, 0.0) 60%,
    rgba(1, 219, 241, 0) 100%
  );
  background-size: 100% 220%;
  background-position: 0 -100%;
  animation: di-beam 1800ms cubic-bezier(0.22, 1, 0.36, 1) infinite;
  mix-blend-mode: multiply;
}
@keyframes di-beam {
  0%   { background-position: 0 -100%; opacity: 0.0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { background-position: 0 100%; opacity: 0; }
}

/* ---- Inspector panel reveal ---- */
.di-panel {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 360ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
}
.di-panel[data-visible='true'] {
  opacity: 1;
  transform: translateY(0);
}
.di-panel__head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--color-cyan-brand-deep);
  margin-bottom: 8px;
}

/* ---- Ticker row entry animation ---- */
.di-ticker-row {
  animation: di-tick-in 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes di-tick-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---- Spinner ---- */
.di-spin {
  animation: di-rotate 1.2s linear infinite;
}
@keyframes di-rotate {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .di-paper,
  .di-field,
  .di-panel { transition: none !important; }
  .di-scan-beam,
  .di-ticker-row,
  .di-spin { animation: none !important; }
  .di-scan-beam { opacity: 0 !important; }
  .di-panel { opacity: 1 !important; transform: none !important; }
}
</style>
