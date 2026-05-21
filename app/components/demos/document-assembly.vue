<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch, type Component } from 'vue'
import { AlertTriangle, BarChart3, BookMarked, Briefcase, Calculator, Check, ChevronDown, Database, Download, FileText, FileType2, Hourglass, Paperclip, PenLine, Receipt, RotateCcw, ScrollText, Sparkles } from '@lucide/vue'

type Source = 'crm' | 'pricing' | 'case-study' | 'template'

interface SourceMeta {
  label: string
  short: string
  icon: Component
  // Tailwind class strings — pre-baked so the JIT picks them up.
  chip: string         // background + ring + text for inline field
  chipHover: string    // strengthened state on hover/focus
  chipEdited: string   // ring style for overridden field
  dot: string          // small colored dot for the legend
  legendChip: string   // legend chip style
}

const SOURCE_META: Record<Source, SourceMeta> = {
  'crm': {
    label: 'CRM',
    short: 'CRM',
    icon: Database,
    chip:        'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    chipHover:   'hover:bg-amber-100 hover:ring-amber-300',
    chipEdited:  'ring-2 ring-amber-400',
    dot:         'bg-amber-500',
    legendChip:  'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  },
  'pricing': {
    label: 'Pricing engine',
    short: 'Pricing',
    icon: Calculator,
    chip:        'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
    chipHover:   'hover:bg-sky-100 hover:ring-sky-300',
    chipEdited:  'ring-2 ring-sky-400',
    dot:         'bg-sky-500',
    legendChip:  'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
  },
  'case-study': {
    label: 'Case study library',
    short: 'Case study',
    icon: BookMarked,
    chip:        'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    chipHover:   'hover:bg-emerald-100 hover:ring-emerald-300',
    chipEdited:  'ring-2 ring-emerald-400',
    dot:         'bg-emerald-500',
    legendChip:  'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  },
  'template': {
    label: 'Static template',
    short: 'Template',
    icon: FileType2,
    chip:        'bg-violet-50 text-violet-800 ring-1 ring-violet-200',
    chipHover:   'hover:bg-violet-100 hover:ring-violet-300',
    chipEdited:  'ring-2 ring-violet-400',
    dot:         'bg-violet-500',
    legendChip:  'bg-violet-50 text-violet-800 ring-1 ring-violet-200',
  },
}

// ---------------------------------------------------------------------------
// Sample deals — three live CRM records.
// ---------------------------------------------------------------------------

type FeeModel = 'milestone' | 'retainer' | 'phased'

interface Deal {
  id: string
  // CRM facets
  clientName: string
  clientLegal: string
  contactName: string
  contactRole: string
  contactEmail: string
  industry: string
  billingAddress: string
  stage: string
  // Pricing engine facets
  engagementName: string
  engagementSummary: string
  feeTotal: string
  feeStructure: string
  /** Drives the statement template — milestone, retainer, or phased schedules. */
  feeModel: FeeModel
  /** Only meaningful when feeModel === 'retainer'. */
  monthlyRetainer?: string
  /** Settled-to-date line on milestone/phased statements. */
  statementPaidLine?: string
  /** Open / next-due line on milestone/phased statements. */
  statementDueLine?: string
  outstandingBalance: string
  lineItems: { label: string; qty: string; rate: string; amount: string }[]
  // Case study facet (chosen by industry match)
  caseRef: string
  caseOutcome: string
  caseBlurb: string
  /** Optional staleness flag on the case-study reference (drives a "Review" pill). */
  caseFlag?: { label: string; reason: string }
  // Generated CRM fields for reports
  dealAgeWeeks: string
  pipelineValue: string
}

const DEALS: Deal[] = [
  {
    id: 'd-northbank',
    clientName: 'Northbank Holdings',
    clientLegal: 'Northbank Holdings (Pty) Ltd',
    contactName: 'Olivia Reyes',
    contactRole: 'Chief Financial Officer',
    contactEmail: 'olivia.reyes@northbank.co.za',
    industry: 'Banking & financial services',
    billingAddress: '14 Maude Street, Sandton, 2196',
    stage: 'Proposal sent',
    engagementName: 'Capital raise readiness review',
    engagementSummary: 'Six-week readiness review across capital structure, investor materials, and roadshow plan.',
    feeTotal: 'R 2,400,000',
    feeStructure: 'Fixed fee — 50% on signing, 50% on delivery',
    feeModel: 'milestone',
    statementPaidLine: 'Signing invoice of R 1,200,000 — settled 21 March',
    statementDueLine: 'Delivery invoice of R 1,200,000 — due on countersign of the final deliverables',
    outstandingBalance: 'R 1,200,000',
    lineItems: [
      { label: 'Capital structure review', qty: '1', rate: 'R 720,000',   amount: 'R 720,000' },
      { label: 'Investor materials',       qty: '1', rate: 'R 540,000',   amount: 'R 540,000' },
      { label: 'Roadshow design',          qty: '1', rate: 'R 480,000',   amount: 'R 480,000' },
      { label: 'Advisory hours (60h)',     qty: '60', rate: 'R 11,000/h', amount: 'R 660,000' },
    ],
    caseRef: 'Helix Capital · private placement, 2025',
    caseOutcome: 'Closed 14% above target valuation in 11 weeks.',
    caseBlurb: 'A directly comparable engagement: ZAR-denominated raise, three-investor syndicate, identical board structure.',
    dealAgeWeeks: '3 weeks',
    pipelineValue: 'R 2.4m · weighted R 1.4m',
  },
  {
    id: 'd-helix-foods',
    clientName: 'Helix Foods',
    clientLegal: 'Helix Foods Group SA (Pty) Ltd',
    contactName: 'Daniel Pham',
    contactRole: 'Chief Operating Officer',
    contactEmail: 'd.pham@helixfoods.com',
    industry: 'FMCG & food manufacturing',
    billingAddress: 'Building 4, Linbro Business Park, Sandton, 2090',
    stage: 'Scoping',
    engagementName: 'Supply-chain optimisation engagement',
    engagementSummary: 'Network redesign across four distribution centres and a SKU rationalisation programme.',
    feeTotal: 'R 1,180,000',
    feeStructure: 'Fixed fee plus success share on landed-cost reduction',
    feeModel: 'retainer',
    monthlyRetainer: 'R 295,000',
    outstandingBalance: 'R 295,000',
    lineItems: [
      { label: 'Network redesign',         qty: '1', rate: 'R 420,000',  amount: 'R 420,000' },
      { label: 'SKU rationalisation',      qty: '1', rate: 'R 360,000',  amount: 'R 360,000' },
      { label: 'Supplier consolidation',   qty: '1', rate: 'R 220,000',  amount: 'R 220,000' },
      { label: 'Implementation hours (20h)', qty: '20', rate: 'R 9,000/h', amount: 'R 180,000' },
    ],
    caseRef: 'PrimeRetail · DC consolidation, 2024',
    caseOutcome: 'Landed cost down 11.4%, on-shelf availability up 3.2 pts.',
    caseBlurb: 'A national grocer with the same four-DC footprint. Same network-redesign approach, same eight-week sprint.',
    caseFlag: { label: 'Review', reason: 'Case study is 17 months old — confirm the comparison still holds before sending.' },
    dealAgeWeeks: '5 weeks',
    pipelineValue: 'R 1.2m · weighted R 0.5m',
  },
  {
    id: 'd-atlas-mining',
    clientName: 'Atlas Mining',
    clientLegal: 'Atlas Mining & Minerals Ltd',
    contactName: 'Mawande Ndlovu',
    contactRole: 'Head of Sustainability',
    contactEmail: 'm.ndlovu@atlas-mining.com',
    industry: 'Mining & resources',
    billingAddress: '88 Marshalltown, Johannesburg, 2107',
    stage: 'Negotiation',
    engagementName: 'ESG reporting framework programme',
    engagementSummary: 'Implementation of a JSE- and IFRS S2-aligned ESG reporting framework with assurance-ready evidence chains.',
    feeTotal: 'R 3,850,000',
    feeStructure: 'Phased — R 1.6m setup, R 510,000 per quarterly assurance pack, plus stakeholder workshops as delivered',
    feeModel: 'phased',
    statementPaidLine: 'Setup invoice of R 1,600,000 — paid 12 February',
    statementDueLine: 'Next quarterly assurance pack of R 510,000 — due on the first of the next quarter',
    outstandingBalance: 'R 2,040,000',
    lineItems: [
      { label: 'Framework setup',          qty: '1', rate: 'R 1,600,000', amount: 'R 1,600,000' },
      { label: 'Quarterly assurance pack', qty: '4', rate: 'R 510,000',   amount: 'R 2,040,000' },
      { label: 'Stakeholder workshops',    qty: '6', rate: 'R  35,000',   amount: 'R   210,000' },
    ],
    caseRef: 'Vermilion Minerals · ESG programme, 2024',
    caseOutcome: 'First-year audit cleared on first submission; JSE rating upgraded.',
    caseBlurb: 'A JSE-listed mining major. Same framework backbone, same assurance-evidence design, twelve-month rollout.',
    dealAgeWeeks: '8 weeks',
    pipelineValue: 'R 3.9m · weighted R 2.7m',
  },
]

// ---------------------------------------------------------------------------
// Field type — every coloured chip in the preview is a Field.
// `id` is stable per (template, deal, field), so overrides persist across
// re-renders without leaking between deals or templates.
// ---------------------------------------------------------------------------

interface Field {
  id: string
  value: string
  source: Source
  // Where the value would come from in a real system — shown in the tooltip.
  sourceRecord: string
  /** Optional review/conflict pill alongside the chip — e.g. stale case study. */
  flag?: { label: string; reason: string }
}

interface Block {
  heading?: string
  // Each block is rendered as a paragraph; fragments are interleaved as
  // plain-text spans and inline tagged Field chips.
  fragments: ({ text: string } | { field: Field })[]
}

// ---------------------------------------------------------------------------
// Templates — each one returns the block list for a chosen deal.
// ---------------------------------------------------------------------------

type TemplateKey = 'proposal' | 'contract' | 'statement' | 'board-report'

interface TemplateMeta {
  key: TemplateKey
  label: string
  short: string
  icon: Component
  blurb: string
}

const TEMPLATES: TemplateMeta[] = [
  { key: 'proposal',      label: 'Proposal',       short: 'Proposal',  icon: FileText,   blurb: 'CRM · pricing · case study · template' },
  { key: 'contract',      label: 'Contract',       short: 'Contract',  icon: ScrollText, blurb: 'CRM · pricing · template' },
  { key: 'statement',     label: 'Statement',      short: 'Statement', icon: Receipt,    blurb: 'CRM · pricing · template' },
  { key: 'board-report',  label: 'Board report',   short: 'Board',     icon: BarChart3,  blurb: 'CRM · pricing · case study · template' },
]

function f(
  id: string,
  value: string,
  source: Source,
  sourceRecord: string,
  flag?: { label: string; reason: string },
): Field {
  return { id, value, source, sourceRecord, flag }
}

function makeProposal(d: Deal): Block[] {
  return [
    {
      fragments: [
        { text: 'Prepared for ' },
        { field: f('contact-name', d.contactName, 'crm', `CRM · Deal ${d.id} · Primary contact`) },
        { text: ', ' },
        { field: f('contact-role', d.contactRole, 'crm', `CRM · Contact role`) },
        { text: ' at ' },
        { field: f('client-name', d.clientName, 'crm', `CRM · Deal ${d.id} · Account name`) },
        { text: '.' },
      ],
    },
    {
      heading: 'Engagement',
      fragments: [
        { field: f('engagement-name', d.engagementName, 'pricing', 'Pricing engine · Engagement template') },
        { text: '. ' },
        { field: f('engagement-summary', d.engagementSummary, 'template', 'Template · Scope paragraph (industry: ' + d.industry + ')') },
      ],
    },
    {
      heading: 'Investment',
      fragments: [
        { text: 'Total engagement value of ' },
        { field: f('fee-total', d.feeTotal, 'pricing', 'Pricing engine · Engagement quote total') },
        { text: ', billed as ' },
        { field: f('fee-structure', d.feeStructure, 'pricing', 'Pricing engine · Fee structure rules') },
        { text: '. Net 30 from invoice date, in line with our ' },
        { field: f('terms', 'standard terms of engagement', 'template', 'Template · §4 Payment terms') },
        { text: '.' },
      ],
    },
    {
      heading: 'Why we are well placed',
      fragments: [
        { text: 'Comparable engagement: ' },
        { field: f('case-ref', d.caseRef, 'case-study', 'Case study library · ' + d.industry, d.caseFlag) },
        { text: '. ' },
        { field: f('case-outcome', d.caseOutcome, 'case-study', 'Case study library · Outcome metric') },
        { text: ' ' },
        { field: f('case-blurb', d.caseBlurb, 'case-study', 'Case study library · Relevance note') },
      ],
    },
    {
      heading: 'Next step',
      fragments: [
        { field: f('next-step', 'A countersignature on the engagement letter starts the clock — kick-off within five working days.', 'template', 'Template · §7 Acceptance') },
      ],
    },
  ]
}

function makeContract(d: Deal): Block[] {
  return [
    {
      fragments: [
        { text: 'This Agreement is entered into between ' },
        { field: f('client-legal', d.clientLegal, 'crm', 'CRM · Deal ' + d.id + ' · Legal entity name') },
        { text: ' (the "Client"), registered at ' },
        { field: f('billing-address', d.billingAddress, 'crm', 'CRM · Account · Billing address') },
        { text: ', and Pinnacle Advisors (Pty) Ltd (the "Firm").' },
      ],
    },
    {
      heading: '1. Scope',
      fragments: [
        { text: 'The Firm shall deliver ' },
        { field: f('engagement-name', d.engagementName, 'pricing', 'Pricing engine · Engagement reference') },
        { text: ', as described in Schedule A. ' },
        { field: f('scope-clause', 'Variations require written agreement of both parties.', 'template', 'Template · §1.4 Variations') },
      ],
    },
    {
      heading: '2. Fees',
      fragments: [
        { text: 'Total fees of ' },
        { field: f('fee-total', d.feeTotal, 'pricing', 'Pricing engine · Quote total') },
        { text: ', billed as ' },
        { field: f('fee-structure', d.feeStructure, 'pricing', 'Pricing engine · Fee structure rules') },
        { text: '. Late payment attracts interest at ' },
        { field: f('interest-rate', 'the prime rate plus two percent per annum', 'template', 'Template · §2.6 Interest on late payment') },
        { text: '.' },
      ],
    },
    {
      heading: '3. Confidentiality and term',
      fragments: [
        { field: f('confidentiality', 'Each party keeps non-public information confidential for five years after termination.', 'template', 'Template · §3 Confidentiality (standard)') },
      ],
    },
  ]
}

function makeStatement(d: Deal): Block[] {
  const header: Block = {
    fragments: [
      { text: 'Statement for ' },
      { field: f('client-name', d.clientName, 'crm', 'CRM · Account name') },
      { text: ' · Account no. ' },
      { field: f('account-no', d.id.toUpperCase(), 'crm', 'CRM · Account number') },
      { text: '.' },
    ],
  }

  let period: Block
  if (d.feeModel === 'retainer') {
    period = {
      heading: 'This month',
      fragments: [
        { text: 'Monthly retainer of ' },
        { field: f('monthly-retainer', d.monthlyRetainer ?? '', 'pricing', 'Pricing engine · Retainer schedule') },
        { text: ' invoiced on the first of the month. ' },
        { field: f('payment-method', 'Payment due by EFT, 30 days from invoice date.', 'template', 'Template · Statement footer') },
      ],
    }
  } else if (d.feeModel === 'milestone') {
    period = {
      heading: 'Milestone schedule',
      fragments: [
        { text: 'Two-milestone billing. ' },
        { field: f('milestone-paid', d.statementPaidLine ?? '', 'pricing', 'Pricing engine · Milestone 1 (settled)') },
        { text: '. ' },
        { field: f('milestone-due', d.statementDueLine ?? '', 'pricing', 'Pricing engine · Milestone 2 (open)') },
        { text: '.' },
      ],
    }
  } else {
    period = {
      heading: 'Phased schedule',
      fragments: [
        { field: f('phase-paid', d.statementPaidLine ?? '', 'pricing', 'Pricing engine · Phase invoiced (paid)') },
        { text: '. ' },
        { field: f('phase-due', d.statementDueLine ?? '', 'pricing', 'Pricing engine · Phase invoiced (open)') },
        { text: '.' },
      ],
    }
  }

  const outstanding: Block = {
    heading: 'Outstanding',
    fragments: [
      { text: 'Outstanding balance: ' },
      { field: f('outstanding', d.outstandingBalance, 'pricing', 'Pricing engine · Open AR') },
      { text: '. Please contact your account manager, ' },
      { field: f('contact-name', d.contactName, 'crm', 'CRM · Account contact') },
      { text: ', with any queries.' },
    ],
  }

  return [header, period, outstanding]
}

function makeBoardReport(d: Deal): Block[] {
  return [
    {
      heading: 'Executive summary',
      fragments: [
        { field: f('exec-summary', 'The engagement is progressing in line with the plan presented at the prior meeting. Highlights and risks follow.', 'template', 'Template · Board pack header') },
      ],
    },
    {
      heading: 'Engagement',
      fragments: [
        { field: f('client-name', d.clientName, 'crm', 'CRM · Account name') },
        { text: ' · ' },
        { field: f('engagement-name', d.engagementName, 'pricing', 'Pricing engine · Engagement reference') },
        { text: '. Stage: ' },
        { field: f('stage', d.stage, 'crm', 'CRM · Deal stage') },
        { text: '. Age: ' },
        { field: f('deal-age', d.dealAgeWeeks, 'crm', 'CRM · Deal age') },
        { text: '.' },
      ],
    },
    {
      heading: 'Financials',
      fragments: [
        { text: 'Pipeline value: ' },
        { field: f('pipeline', d.pipelineValue, 'pricing', 'Pricing engine · Probability-weighted value') },
        { text: '. Total engagement value: ' },
        { field: f('fee-total', d.feeTotal, 'pricing', 'Pricing engine · Engagement quote total') },
        { text: '. Outstanding: ' },
        { field: f('outstanding', d.outstandingBalance, 'pricing', 'Pricing engine · Open AR') },
        { text: '.' },
      ],
    },
    {
      heading: 'Comparable',
      fragments: [
        { field: f('case-ref', d.caseRef, 'case-study', 'Case study library · ' + d.industry, d.caseFlag) },
        { text: ' — ' },
        { field: f('case-outcome', d.caseOutcome, 'case-study', 'Case study library · Outcome metric') },
      ],
    },
    {
      heading: 'Recommendation',
      fragments: [
        { field: f('recommendation', 'Continue on plan. No board action required this cycle.', 'template', 'Template · Default recommendation block') },
      ],
    },
  ]
}

function blocksFor(template: TemplateKey, deal: Deal): Block[] {
  switch (template) {
    case 'proposal':     return makeProposal(deal)
    case 'contract':     return makeContract(deal)
    case 'statement':    return makeStatement(deal)
    case 'board-report': return makeBoardReport(deal)
  }
}

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

const selectedDealId = ref<string>(DEALS[0].id)
const selectedTemplate = ref<TemplateKey>('proposal')
const assembleProgress = ref<number>(0)        // 0 → 1 over the animation
const isAssembling = ref<boolean>(false)
const hasAssembled = ref<boolean>(false)

// Manual overrides — keyed by field id. Cleared when the user re-assembles
// (because the source values may have changed).
const overrides = reactive<Record<string, string>>({})
const editingFieldId = ref<string | null>(null)

// Output-action confirmation toast.
type OutputKind = 'pdf' | 'esign' | 'attach'
const lastAction = ref<{ kind: OutputKind; at: number } | null>(null)

// Timer animation
let rafHandle: number | null = null
let assembleStart = 0
const ASSEMBLE_MS = 4000

const selectedDeal = computed(() =>
  DEALS.find((d) => d.id === selectedDealId.value) ?? DEALS[0],
)
const selectedTemplateMeta = computed(() =>
  TEMPLATES.find((t) => t.key === selectedTemplate.value) ?? TEMPLATES[0],
)

// Live blocks computed from selected deal + template, with overrides applied.
const blocks = computed<Block[]>(() => {
  const raw = blocksFor(selectedTemplate.value, selectedDeal.value)
  // Apply overrides in place (do not mutate the source array).
  return raw.map((b) => ({
    heading: b.heading,
    fragments: b.fragments.map((fr) => {
      if ('text' in fr) return fr
      const o = overrides[fr.field.id]
      if (o !== undefined) {
        return { field: { ...fr.field, value: o } }
      }
      return fr
    }),
  }))
})

// Sources used in the current template (drives the legend).
const sourcesInUse = computed<Source[]>(() => {
  const set = new Set<Source>()
  for (const b of blocks.value) {
    for (const fr of b.fragments) {
      if ('field' in fr) set.add(fr.field.source)
    }
  }
  // Stable order for the legend.
  return (['crm', 'pricing', 'case-study', 'template'] as Source[]).filter((s) => set.has(s))
})

// Timer label values
const newSecondsTotal = 8 * 60      // eight minutes
const oldSecondsTotal = 3 * 60 * 60 // three hours

const newSeconds = computed(() =>
  Math.round(assembleProgress.value * newSecondsTotal),
)
// The old way is far slower — both timers run for the same wall-clock
// duration, but the old-way counter only ticks through what it could fit
// into the new way's eight minutes. Drives the pace gap home visually.
const oldSeconds = computed(() =>
  Math.round(assembleProgress.value * newSecondsTotal),
)
const oldBarPct = computed(() =>
  // After the animation, old way is still at 8 / 180 ≈ 4.4% complete.
  Math.min(100, (oldSeconds.value / oldSecondsTotal) * 100),
)
const newBarPct = computed(() => assembleProgress.value * 100)

function fmtTimer(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function fmtRemaining(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  return `${m}m`
}

const oldSecondsRemaining = computed(() => Math.max(0, oldSecondsTotal - oldSeconds.value))

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function tick(now: number) {
  const t = Math.min(1, (now - assembleStart) / ASSEMBLE_MS)
  // ease-out (matches brand cubic-bezier(0.22,1,0.36,1))
  const eased = 1 - Math.pow(1 - t, 3)
  assembleProgress.value = eased
  if (t < 1) {
    rafHandle = requestAnimationFrame(tick)
  } else {
    isAssembling.value = false
    hasAssembled.value = true
    rafHandle = null
  }
}

function assemble() {
  if (isAssembling.value) return
  // Clear overrides on a fresh assembly — the source values may have updated.
  for (const k of Object.keys(overrides)) delete overrides[k]
  editingFieldId.value = null
  lastAction.value = null
  hasAssembled.value = false
  isAssembling.value = true
  assembleProgress.value = 0
  assembleStart = performance.now()
  if (rafHandle) cancelAnimationFrame(rafHandle)
  rafHandle = requestAnimationFrame(tick)
}

function resetDemo() {
  if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = null }
  for (const k of Object.keys(overrides)) delete overrides[k]
  editingFieldId.value = null
  lastAction.value = null
  assembleProgress.value = 0
  isAssembling.value = false
  hasAssembled.value = false
}

const editingDraft = ref<string>('')

function startEdit(id: string, initial: string) {
  if (!hasAssembled.value) return
  editingFieldId.value = id
  editingDraft.value = initial
}

function commitEdit(id: string) {
  const value = editingDraft.value
  if (value.trim().length > 0) {
    overrides[id] = value
  }
  editingFieldId.value = null
  editingDraft.value = ''
}

function cancelEdit() {
  editingFieldId.value = null
  editingDraft.value = ''
}

const editingFieldSourceRecord = computed<string | null>(() => {
  const id = editingFieldId.value
  if (!id) return null
  for (const b of blocks.value) {
    for (const fr of b.fragments) {
      if ('field' in fr && fr.field.id === id) {
        return `${SOURCE_META[fr.field.source].label} — ${fr.field.sourceRecord}`
      }
    }
  }
  return null
})

const OUTPUT_LABELS: Record<OutputKind, string> = {
  'pdf':    'PDF exported',
  'esign':  'Sent to e-sign',
  'attach': 'Attached to deal in CRM',
}

let actionTimer: ReturnType<typeof setTimeout> | null = null
function fireOutput(kind: OutputKind) {
  if (!hasAssembled.value) return
  lastAction.value = { kind, at: Date.now() }
  if (actionTimer) clearTimeout(actionTimer)
  actionTimer = setTimeout(() => {
    if (lastAction.value && Date.now() - lastAction.value.at >= 2200) {
      lastAction.value = null
    }
  }, 2400)
}

// Switching deal or template after an assembly clears the assembled state —
// the user must hit Assemble again to rebuild from the new sources.
watch([selectedDealId, selectedTemplate], () => {
  if (hasAssembled.value || isAssembling.value) {
    resetDemo()
  }
})

onUnmounted(() => {
  if (rafHandle) cancelAnimationFrame(rafHandle)
  if (actionTimer) clearTimeout(actionTimer)
})

// ---------------------------------------------------------------------------
// Visual helpers
// ---------------------------------------------------------------------------

function fieldChipClass(field: Field): string {
  const meta = SOURCE_META[field.source]
  const overridden = overrides[field.id] !== undefined
  return [
    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5',
    'text-[14.5px] leading-snug font-medium',
    'transition-colors cursor-text',
    meta.chip,
    meta.chipHover,
    overridden ? meta.chipEdited : '',
  ].filter(Boolean).join(' ')
}

function isFieldEdited(id: string): boolean {
  return overrides[id] !== undefined
}

</script>

<template>
  <div class="font-sans">
    <!-- Header strip -->
    <div class="relative border-b border-line bg-surface-alt/60">
      <div class="px-4 sm:px-5 md:px-7 py-5 md:py-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Interactive demo
          </div>
          <div class="mt-2 flex items-center gap-3">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-cyan-brand-deep ring-1 ring-line">
              <Briefcase :size="18" :stroke-width="1.9" aria-hidden="true" />
            </span>
            <div>
              <div class="font-display text-[19px] sm:text-[22px] md:text-[26px] leading-[1.1] text-ink">
                Pinnacle Advisors · document desk
              </div>
              <div class="text-[13.5px] text-mute">
                Pick a deal, pick a template, hit Assemble.
              </div>
              <div class="mt-1 text-[12px] text-mute-2">
                One example. Yours would map to your sources, your templates, your sign-off.
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="hasAssembled || isAssembling"
          type="button"
          class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 self-start md:self-auto"
          @click="resetDemo"
        >
          <RotateCcw :size="14" :stroke-width="2" aria-hidden="true" />
          Start over
        </button>
      </div>
    </div>

    <!-- Steps strip -->
    <div class="px-4 sm:px-5 md:px-7 pt-6 md:pt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Step 1: deal -->
      <div class="rounded-2xl border border-line bg-white p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Step 1 · Deal (CRM)
          </div>
          <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200" aria-hidden="true">
            <Database :size="12" :stroke-width="2" />
          </span>
        </div>
        <label class="mt-3 block relative">
          <span class="sr-only">Select a deal</span>
          <select
            v-model="selectedDealId"
            class="w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 py-2.5 text-[14.5px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 cursor-pointer"
          >
            <option v-for="d in DEALS" :key="d.id" :value="d.id">
              {{ d.clientName }} · {{ d.engagementName }}
            </option>
          </select>
          <ChevronDown
            :size="16"
            :stroke-width="2"
            class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute-2"
            aria-hidden="true"
          />
        </label>
        <p class="mt-2 text-[12.5px] text-mute">
          {{ selectedDeal.stage }} · {{ selectedDeal.industry }}
        </p>
      </div>

      <!-- Step 2: template -->
      <div class="rounded-2xl border border-line bg-white p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Step 2 · Template
          </div>
          <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200" aria-hidden="true">
            <FileType2 :size="12" :stroke-width="2" />
          </span>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            v-for="t in TEMPLATES"
            :key="t.key"
            type="button"
            :class="[
              'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[13px] font-semibold transition-colors text-left',
              selectedTemplate === t.key
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink hover:border-ink/30',
            ]"
            @click="selectedTemplate = t.key"
          >
            <component :is="t.icon" :size="14" :stroke-width="2" aria-hidden="true" />
            <span class="truncate">{{ t.short }}</span>
          </button>
        </div>
        <p class="mt-2 text-[12.5px] text-mute">
          {{ selectedTemplateMeta.blurb }}
        </p>
      </div>

      <!-- Step 3: assemble -->
      <div class="rounded-2xl border border-line bg-white p-4 flex flex-col">
        <div class="flex items-center justify-between gap-3">
          <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Step 3 · Assemble
          </div>
          <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-brand/15 text-cyan-brand-deep ring-1 ring-cyan-brand/30" aria-hidden="true">
            <Sparkles :size="12" :stroke-width="2" />
          </span>
        </div>
        <button
          type="button"
          :disabled="isAssembling"
          class="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-ink text-white px-3.5 py-2.5 text-[14px] font-semibold hover:bg-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="assemble"
        >
          <Sparkles :size="15" :stroke-width="2" aria-hidden="true" />
          {{ hasAssembled ? 'Re-assemble' : isAssembling ? 'Assembling…' : 'Assemble document' }}
        </button>
        <p class="mt-2 text-[12.5px] text-mute">
          Pulls every field from the source systems above.
        </p>
      </div>
    </div>

    <!-- Race timers -->
    <div class="px-4 sm:px-5 md:px-7 pt-5">
      <div class="rounded-2xl border border-line bg-white p-4 md:p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <Hourglass :size="13" :stroke-width="2" aria-hidden="true" />
            Time-to-document
          </div>
          <div class="text-[12px] text-mute-2">Old way races the new way · same wall clock</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- New way -->
          <div>
            <div class="flex items-end justify-between gap-3">
              <span class="text-[12.5px] font-semibold text-cyan-brand-deep uppercase tracking-[0.18em]">New way</span>
              <span class="font-display text-[24px] leading-none text-ink tabular-nums">
                {{ fmtTimer(newSeconds) }}
              </span>
            </div>
            <div class="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
              <div
                class="h-full rounded-full bg-cyan-brand-deep"
                :style="{ width: newBarPct + '%' }"
              />
            </div>
            <div class="mt-1.5 text-[11.5px] text-mute">
              Target: ~8 minutes from CRM to PDF
            </div>
            <div v-if="hasAssembled" class="mt-1 text-[11.5px] font-semibold text-cyan-brand-deep">
              Done.
            </div>
          </div>
          <!-- Old way -->
          <div>
            <div class="flex items-end justify-between gap-3">
              <span class="text-[12.5px] font-semibold text-mute-2 uppercase tracking-[0.18em]">Old way</span>
              <span class="font-display text-[24px] leading-none text-mute tabular-nums">
                {{ fmtTimer(oldSeconds) }} <span class="text-[12px] text-mute-2 font-sans">/ {{ fmtTimer(oldSecondsTotal) }}</span>
              </span>
            </div>
            <div class="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
              <div
                class="h-full rounded-full bg-mute-2/50"
                :style="{ width: oldBarPct + '%' }"
              />
            </div>
            <div class="mt-1.5 text-[11.5px] text-mute">
              Copy-paste from CRM, pricing sheet, case-study folder
            </div>
            <div v-if="hasAssembled || isAssembling" class="mt-1 text-[11.5px] font-semibold text-ink-soft">
              Still {{ fmtRemaining(oldSecondsRemaining) }} of copy-paste to go
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Document preview + side rail -->
    <div class="px-4 sm:px-5 md:px-7 pt-5 pb-6 md:pb-8 grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-5">
      <!-- Preview pane -->
      <section
        aria-label="Document preview"
        class="rounded-2xl border border-line bg-white overflow-hidden"
      >
        <!-- Preview header -->
        <header class="px-4 sm:px-5 md:px-7 py-4 border-b border-line bg-surface-alt/60 flex items-center gap-3">
          <component
            :is="selectedTemplateMeta.icon"
            :size="16"
            :stroke-width="2"
            class="text-ink-soft"
            aria-hidden="true"
          />
          <div class="flex-1 min-w-0">
            <div class="text-[11.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
              {{ selectedTemplateMeta.label }}
            </div>
            <div class="font-display text-[18px] md:text-[20px] leading-tight text-ink truncate">
              {{ selectedDeal.clientName }} · {{ selectedDeal.engagementName }}
            </div>
          </div>
          <span
            v-if="hasAssembled"
            class="inline-flex items-center gap-1 rounded-full bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] font-semibold"
          >
            <Check :size="11" :stroke-width="2.4" aria-hidden="true" />
            Assembled
          </span>
        </header>

        <!-- Preview body -->
        <div class="relative">
          <!-- Empty / pre-assemble state -->
          <div
            v-if="!hasAssembled && !isAssembling"
            class="px-4 sm:px-6 md:px-8 py-14 md:py-20 text-center"
          >
            <span
              class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-alt border border-line text-cyan-brand-deep mb-4"
              aria-hidden="true"
            >
              <FileText :size="20" :stroke-width="1.8" />
            </span>
            <p class="font-display text-[18px] sm:text-[20px] md:text-[22px] text-ink leading-[1.2]">
              Press Assemble to build the document.
            </p>
            <p class="mt-2 text-[14px] text-mute max-w-md mx-auto">
              The engine will pull every field from the source systems above. Each field stays tagged with where it came from.
            </p>
          </div>

          <!-- Assembling skeleton -->
          <div
            v-else-if="isAssembling"
            class="px-4 sm:px-6 md:px-8 py-10 md:py-12 space-y-4"
            aria-busy="true"
          >
            <div
              v-for="i in 5"
              :key="i"
              :class="[
                'h-3 rounded-full bg-line',
                'motion-safe:animate-pulse',
              ]"
              :style="{ width: (95 - i * 12) + '%' }"
            />
            <div class="h-3 rounded-full bg-line motion-safe:animate-pulse" style="width: 60%" />
            <div class="h-3 rounded-full bg-line motion-safe:animate-pulse" style="width: 85%" />
          </div>

          <!-- Assembled document -->
          <div
            v-else
            class="px-4 sm:px-6 md:px-10 py-8 md:py-10 max-w-3xl mx-auto"
          >
            <div class="border-b border-line pb-4 mb-6">
              <div class="text-[11px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                {{ selectedTemplateMeta.label }}
              </div>
              <h2 class="mt-1 font-display text-[22px] sm:text-[26px] md:text-[30px] leading-[1.1] text-ink">
                {{ selectedDeal.clientName }}
              </h2>
              <div class="mt-1 text-[13px] text-mute">
                {{ selectedDeal.engagementName }}
              </div>
            </div>

            <div
              v-for="(b, bi) in blocks"
              :key="bi"
              class="mb-5"
            >
              <h3
                v-if="b.heading"
                class="font-display text-[16px] md:text-[17px] leading-tight text-ink mb-2"
              >
                {{ b.heading }}
              </h3>
              <p class="text-[15px] leading-[1.7] text-ink-soft">
                <template v-for="(fr, fi) in b.fragments" :key="fi">
                  <template v-if="'text' in fr">{{ fr.text }}</template>
                  <template v-else>
                    <span
                      :class="fieldChipClass(fr.field)"
                      :title="`${SOURCE_META[fr.field.source].label} — ${fr.field.sourceRecord}`"
                      @click="startEdit(fr.field.id, fr.field.value)"
                    >
                      <span
                        :class="['h-1.5 w-1.5 rounded-full', SOURCE_META[fr.field.source].dot]"
                        aria-hidden="true"
                      />
                      <template v-if="editingFieldId === fr.field.id">
                        <input
                          v-model="editingDraft"
                          class="bg-transparent outline-none"
                          :size="Math.max(8, editingDraft.length + 1)"
                          @blur="commitEdit(fr.field.id)"
                          @keydown.enter.prevent="commitEdit(fr.field.id)"
                          @keydown.esc.prevent="cancelEdit"
                          @click.stop
                          autofocus
                        >
                      </template>
                      <template v-else>
                        {{ fr.field.value }}
                      </template>
                      <span
                        v-if="isFieldEdited(fr.field.id)"
                        class="text-[10px] uppercase tracking-[0.16em] font-semibold ml-0.5"
                      >
                        · edited
                      </span>
                    </span>
                    <span
                      v-if="fr.field.flag"
                      :title="fr.field.flag.reason"
                      class="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.16em] font-semibold align-middle cursor-help"
                    >
                      <AlertTriangle :size="10" :stroke-width="2.4" aria-hidden="true" />
                      {{ fr.field.flag.label }}
                    </span>
                  </template>
                </template>
              </p>
            </div>

            <!-- Source caption when editing a chip (touch-friendly audit-trail surface) -->
            <div
              v-if="editingFieldId && editingFieldSourceRecord"
              class="-mt-2 mb-4 text-[11.5px] text-mute-2"
              aria-live="polite"
            >
              Editing · source: {{ editingFieldSourceRecord }}. Enter saves · Esc cancels.
            </div>

            <!-- Line items table for proposal + contract -->
            <div
              v-if="selectedTemplate === 'proposal' || selectedTemplate === 'contract'"
              class="mt-6 rounded-xl border border-line overflow-x-auto"
            >
              <table class="w-full min-w-[480px] text-[13.5px]">
                <thead class="bg-surface-alt text-mute-2 text-[11px] uppercase tracking-[0.18em]">
                  <tr>
                    <th class="text-left font-semibold px-3 py-2">Item</th>
                    <th class="text-right font-semibold px-3 py-2 w-16">Qty</th>
                    <th class="text-right font-semibold px-3 py-2 w-32">Rate</th>
                    <th class="text-right font-semibold px-3 py-2 w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(li, idx) in selectedDeal.lineItems"
                    :key="idx"
                    class="border-t border-line"
                  >
                    <td class="px-3 py-2 text-ink">{{ li.label }}</td>
                    <td class="px-3 py-2 text-right tabular-nums">{{ li.qty }}</td>
                    <td class="px-3 py-2 text-right tabular-nums">{{ li.rate }}</td>
                    <td class="px-3 py-2 text-right tabular-nums font-semibold">{{ li.amount }}</td>
                  </tr>
                  <tr class="border-t border-line bg-surface-alt/60">
                    <td class="px-3 py-2 font-semibold text-ink" colspan="3">Total</td>
                    <td class="px-3 py-2 text-right tabular-nums font-semibold text-ink">
                      {{ selectedDeal.feeTotal }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p class="px-3 py-2 text-[11.5px] text-mute-2 border-t border-line">
                Line items pulled from the pricing engine.
              </p>
            </div>

            <!-- Output action toast -->
            <transition
              enter-active-class="motion-safe:transition motion-safe:duration-300 motion-safe:ease-out"
              enter-from-class="motion-safe:opacity-0 motion-safe:translate-y-1"
              enter-to-class="opacity-100"
              leave-active-class="motion-safe:transition motion-safe:duration-200 motion-safe:ease-in"
              leave-from-class="opacity-100"
              leave-to-class="motion-safe:opacity-0"
            >
              <div
                v-if="lastAction"
                class="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 px-3 py-1.5 text-[12.5px] font-semibold"
                role="status"
              >
                <Check :size="13" :stroke-width="2.4" aria-hidden="true" />
                {{ OUTPUT_LABELS[lastAction.kind] }}
              </div>
            </transition>
          </div>
        </div>

        <!-- Output actions -->
        <footer class="px-4 sm:px-5 md:px-7 py-4 border-t border-line bg-surface-alt/60 flex flex-wrap items-center gap-2">
          <button
            type="button"
            :disabled="!hasAssembled"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink hover:border-ink/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="fireOutput('pdf')"
          >
            <Download :size="13" :stroke-width="2" aria-hidden="true" />
            Export PDF
          </button>
          <button
            type="button"
            :disabled="!hasAssembled"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink hover:border-ink/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="fireOutput('esign')"
          >
            <PenLine :size="13" :stroke-width="2" aria-hidden="true" />
            Send to e-sign
          </button>
          <button
            type="button"
            :disabled="!hasAssembled"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink hover:border-ink/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="fireOutput('attach')"
          >
            <Paperclip :size="13" :stroke-width="2" aria-hidden="true" />
            Attach to deal
          </button>
        </footer>
      </section>

      <!-- Side rail: source legend + tip -->
      <aside class="space-y-4">
        <div class="rounded-2xl border border-line bg-white p-4">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            Source legend
          </div>
          <ul class="mt-3 space-y-2">
            <li
              v-for="s in (['crm', 'pricing', 'case-study', 'template'] as Source[])"
              :key="s"
              :class="[
                'flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-opacity',
                sourcesInUse.includes(s) || !hasAssembled ? '' : 'opacity-40',
              ]"
            >
              <span
                :class="['inline-flex h-6 w-6 items-center justify-center rounded-md', SOURCE_META[s].legendChip]"
                aria-hidden="true"
              >
                <component :is="SOURCE_META[s].icon" :size="12" :stroke-width="2" />
              </span>
              <span class="text-[13.5px] font-semibold text-ink leading-tight">
                {{ SOURCE_META[s].label }}
              </span>
            </li>
          </ul>
          <p class="mt-3 text-[12px] text-mute">
            Click any field to edit. The source shows beneath the input, and the tag stays so the team can see where a human overrode the engine.
          </p>
        </div>

        <div class="rounded-2xl border border-line bg-white p-4">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            Deal snapshot
          </div>
          <dl class="mt-3 space-y-2 text-[13px]">
            <div class="flex items-baseline justify-between gap-3">
              <dt class="text-mute-2">Stage</dt>
              <dd class="text-ink font-semibold text-right">{{ selectedDeal.stage }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-3">
              <dt class="text-mute-2">Industry</dt>
              <dd class="text-ink text-right">{{ selectedDeal.industry }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-3">
              <dt class="text-mute-2">Total</dt>
              <dd class="text-ink font-semibold tabular-nums text-right">{{ selectedDeal.feeTotal }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-3">
              <dt class="text-mute-2">Contact</dt>
              <dd class="text-ink text-right">{{ selectedDeal.contactName }}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  </div>
</template>
