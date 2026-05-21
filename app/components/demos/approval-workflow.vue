<script setup lang="ts">
import { computed, ref, watch, nextTick, type Component } from 'vue'
import {
  Building2,
  HeartHandshake,
  ShoppingCart,
  RotateCcw,
  Signature,
  Check,
  X as XIcon,
  ClipboardCheck,
  MessageSquare,
  ScrollText,
  FileDown,
  FileText,
  Send,
  Mail,
  BookOpen,
  ShieldCheck,
  Clock,
  SlidersHorizontal,
} from '@lucide/vue'

// =============================================================================
// Types
// =============================================================================

type ApprovalAction = 'approve' | 'conditional' | 'reject' | 'info'

interface Approver {
  id: string
  role: string
  name: string
  /** Approver joins the chain only when amount >= threshold. Undefined = always routes. */
  threshold?: number
  /** Short label shown on the chain tile, e.g. "≥ $1M". */
  thresholdNote?: string
}

interface DownstreamAction {
  label: string
  detail: string
  icon: Component
}

interface Scenario {
  id: string
  label: string
  icon: Component
  subject: string
  subjectContext: string
  amountLabel: string
  defaultAmount: number
  amountSteps: number[]
  amountMin: number
  amountMax: number
  approvers: Approver[]
  downstream: DownstreamAction[]
  ruleSummary: string
}

interface AuditEntry {
  id: number
  ts: number
  approverId: string
  action: ApprovalAction
  comment?: string
}

interface ApproverState {
  action: ApprovalAction
  comment?: string
  ts: number
}

// =============================================================================
// Scenarios — one engine, five rule packs
// =============================================================================

const SCENARIOS: Scenario[] = [
  {
    id: 'bank-loan',
    label: 'Bank loan',
    icon: Building2,
    subject: 'LF-2026-0421',
    subjectContext: 'ACME Manufacturing Pty Ltd · 7-year facility',
    amountLabel: 'Loan amount',
    defaultAmount: 2_000_000,
    amountSteps: [400_000, 1_000_000, 2_000_000, 6_000_000],
    amountMin: 100_000,
    amountMax: 8_000_000,
    ruleSummary:
      'Above $1M routes through Credit Committee. Above $5M also requires CFO sign-off.',
    approvers: [
      { id: 'rm', role: 'Relationship Manager', name: 'Sarah Chen' },
      { id: 'bm', role: 'Branch Manager', name: 'Marcus Webb' },
      { id: 'cc', role: 'Credit Committee', name: 'Aaliyah Patel', threshold: 1_000_000, thresholdNote: '≥ $1M' },
      { id: 'cfo', role: 'CFO Sign-off', name: 'James Liu', threshold: 5_000_000, thresholdNote: '≥ $5M' },
    ],
    downstream: [
      { label: 'Disbursement instruction created', detail: 'Treasury payment file queued for release.', icon: Send },
      { label: 'Customer notified',                detail: 'SMS + email confirmation dispatched.',     icon: Mail },
      { label: 'Loan agreement generated',         detail: 'Counter-signed PDF stored to record.',     icon: FileText },
      { label: 'Ledger entry posted',              detail: 'GL credit + receivable account opened.',   icon: BookOpen },
    ],
  },
  {
    id: 'ngo-grant',
    label: 'NGO grant',
    icon: HeartHandshake,
    subject: 'G-2026-0188',
    subjectContext: 'Lwala Health · Maternal care programme',
    amountLabel: 'Grant amount',
    defaultAmount: 150_000,
    amountSteps: [25_000, 75_000, 150_000, 500_000],
    amountMin: 5_000,
    amountMax: 800_000,
    ruleSummary:
      'Above $50k routes through the Country Director. Above $250k also requires Board Treasurer.',
    approvers: [
      { id: 'po', role: 'Programme Officer', name: 'Dr. Priya Okello' },
      { id: 'fo', role: 'Finance Officer',   name: 'Tomás García' },
      { id: 'cd', role: 'Country Director',  name: 'Anneke van Dijk', threshold: 50_000,  thresholdNote: '≥ $50k' },
      { id: 'bt', role: 'Board Treasurer',   name: 'Robert Mensah',   threshold: 250_000, thresholdNote: '≥ $250k' },
    ],
    downstream: [
      { label: 'Tranche payment scheduled', detail: 'First tranche released to programme account.',   icon: Send },
      { label: 'Recipient notified',        detail: 'Programme team and local lead emailed.',         icon: Mail },
      { label: 'Grant agreement issued',    detail: 'Counter-signed MoU stored to record.',           icon: FileText },
      { label: 'Donor report queued',       detail: 'Disbursement entry added to next donor report.', icon: BookOpen },
    ],
  },
  {
    id: 'purchase-order',
    label: 'Purchase order',
    icon: ShoppingCart,
    subject: 'PO-2026-7741',
    subjectContext: 'Capex · CNC machining centre',
    amountLabel: 'PO amount',
    defaultAmount: 85_000,
    amountSteps: [5_000, 25_000, 85_000, 350_000],
    amountMin: 1_000,
    amountMax: 500_000,
    ruleSummary:
      'Above $10k routes through Finance. Above $250k also requires CEO sign-off.',
    approvers: [
      { id: 'mgr',  role: "Requestor's Manager", name: 'Helena Brandt' },
      { id: 'proc', role: 'Procurement',         name: 'Daniel Osei' },
      { id: 'fin',  role: 'Finance Controller',  name: 'Yuki Tanaka',     threshold: 10_000,  thresholdNote: '≥ $10k' },
      { id: 'ceo',  role: 'CEO Sign-off',        name: 'Adaora Okafor',   threshold: 250_000, thresholdNote: '≥ $250k' },
    ],
    downstream: [
      { label: 'Vendor PO issued',           detail: 'PO file transmitted to supplier portal.', icon: Send },
      { label: 'Vendor notified',            detail: 'Confirmation email + delivery window.',   icon: Mail },
      { label: 'GRN template generated',     detail: 'Goods-received note ready for warehouse.', icon: FileText },
      { label: 'Budget reservation posted',  detail: 'GL commitment booked to cost centre.',     icon: BookOpen },
    ],
  },
  {
    id: 'refund',
    label: 'Refund',
    icon: RotateCcw,
    subject: 'RF-2026-1109',
    subjectContext: 'Order #ZBL-88421 · Customer dispute',
    amountLabel: 'Refund amount',
    defaultAmount: 3_500,
    amountSteps: [200, 1_500, 3_500, 12_000],
    amountMin: 50,
    amountMax: 20_000,
    ruleSummary:
      'Above $500 routes through Operations. Above $2.5k also requires Finance. Above $10k requires Head of CX.',
    approvers: [
      { id: 'sup', role: 'Support Lead',        name: 'Karina Mwamba' },
      { id: 'ops', role: 'Operations Manager',  name: 'Felipe Reyes',     threshold: 500,    thresholdNote: '≥ $500' },
      { id: 'fin', role: 'Finance',             name: 'Yael Ben-David',   threshold: 2_500,  thresholdNote: '≥ $2.5k' },
      { id: 'cx',  role: 'Head of CX',          name: 'Ngozi Adeyemi',    threshold: 10_000, thresholdNote: '≥ $10k' },
    ],
    downstream: [
      { label: 'Refund initiated',         detail: 'Reversal posted to original payment method.', icon: Send },
      { label: 'Customer notified',        detail: 'Apology + refund confirmation emailed.',      icon: Mail },
      { label: 'Credit note generated',    detail: 'Tax-compliant credit note stored to record.', icon: FileText },
      { label: 'Ledger reversal posted',   detail: 'Revenue and tax accounts adjusted.',          icon: BookOpen },
    ],
  },
  {
    id: 'contract',
    label: 'Contract sign-off',
    icon: Signature,
    subject: 'CT-2026-0312',
    subjectContext: 'MSA · Tier-1 supplier agreement',
    amountLabel: 'Contract value',
    defaultAmount: 750_000,
    amountSteps: [50_000, 250_000, 750_000, 3_000_000],
    amountMin: 10_000,
    amountMax: 5_000_000,
    ruleSummary:
      'Above $500k routes through the CFO. Above $2M also requires CEO sign-off.',
    approvers: [
      { id: 'legal', role: 'Legal Counsel',    name: 'Mei Lin' },
      { id: 'dept',  role: 'Department Head',  name: 'David Okereke' },
      { id: 'cfo',   role: 'CFO',              name: 'James Liu',     threshold: 500_000,   thresholdNote: '≥ $500k' },
      { id: 'ceo',   role: 'CEO',              name: 'Adaora Okafor', threshold: 2_000_000, thresholdNote: '≥ $2M' },
    ],
    downstream: [
      { label: 'Counterparty notified',     detail: 'Execution copy sent to vendor signatory.',       icon: Mail },
      { label: 'Contract e-signed',         detail: 'Both parties executed via signing service.',     icon: Send },
      { label: 'Vendor master updated',     detail: 'Counterparty status flipped to "Active".',       icon: FileText },
      { label: 'Spend commitment posted',   detail: 'Multi-year commitment booked to forecast.',      icon: BookOpen },
    ],
  },
]

// =============================================================================
// State
// =============================================================================

const activeScenarioId = ref<string>('bank-loan')
const scenario = computed<Scenario>(
  () => SCENARIOS.find((s) => s.id === activeScenarioId.value) ?? SCENARIOS[0]!,
)

const amount = ref<number>(SCENARIOS[0]!.defaultAmount)

const approverState = ref<Record<string, ApproverState>>({})
const auditLog = ref<AuditEntry[]>([])
const pendingComment = ref<string>('')
const showEvidence = ref<boolean>(false)
const lastEntryTs = ref<number>(0)
let nextAuditId = 0

function resetAll(): void {
  approverState.value = {}
  auditLog.value = []
  pendingComment.value = ''
  showEvidence.value = false
  lastEntryTs.value = 0
  nextAuditId = 0
}

// Switching scenarios fully resets the demo and sets the new default amount.
watch(activeScenarioId, () => {
  amount.value = scenario.value.defaultAmount
  resetAll()
})

// Active chain = approvers whose threshold (if any) is met by the current amount.
const activeChain = computed<Approver[]>(() =>
  scenario.value.approvers.filter(
    (a) => a.threshold === undefined || amount.value >= a.threshold,
  ),
)

// Every approver tile (active + dormant), with current decision attached.
const allChainTiles = computed(() =>
  scenario.value.approvers.map((approver) => {
    const isActive =
      approver.threshold === undefined || amount.value >= approver.threshold
    const state = approverState.value[approver.id]
    return {
      approver,
      isActive,
      action: state?.action,
      ts: state?.ts,
    }
  }),
)

// When amount changes, prune state for approvers no longer in the active chain.
// Keep state for everyone still in the chain — small nudges shouldn't wipe progress.
watch(amount, () => {
  const activeIds = new Set(activeChain.value.map((a) => a.id))
  const next: Record<string, ApproverState> = {}
  for (const [id, st] of Object.entries(approverState.value)) {
    if (activeIds.has(id)) next[id] = st
  }
  approverState.value = next
  auditLog.value = auditLog.value.filter((e) => activeIds.has(e.approverId))
})

type ChainStatus =
  | 'pending'
  | 'in-progress'
  | 'approved'
  | 'approved-conditional'
  | 'rejected'

const chainStatus = computed<ChainStatus>(() => {
  let any = false
  let conditional = false
  for (const a of activeChain.value) {
    const s = approverState.value[a.id]
    if (!s) return any ? 'in-progress' : 'pending'
    if (s.action === 'reject') return 'rejected'
    if (s.action === 'info')   return 'in-progress'
    if (s.action === 'conditional') conditional = true
    any = true
  }
  return conditional ? 'approved-conditional' : 'approved'
})

// First approver in the chain without a final decision. 'info' keeps them current.
const currentApprover = computed<Approver | null>(() => {
  if (chainStatus.value === 'rejected') return null
  for (const a of activeChain.value) {
    const s = approverState.value[a.id]
    if (!s) return a
    if (s.action === 'info') return a
  }
  return null
})

const isComplete = computed<boolean>(
  () => chainStatus.value === 'approved' || chainStatus.value === 'approved-conditional',
)
const isHalted = computed<boolean>(() => chainStatus.value === 'rejected')

// =============================================================================
// Actions
// =============================================================================

function takeAction(action: ApprovalAction): void {
  const a = currentApprover.value
  if (!a) return
  const now = Date.now()
  // Force a strictly-increasing timestamp so rapid clicks read as a sequence.
  const ts = Math.max(lastEntryTs.value + 7_000, now)
  lastEntryTs.value = ts
  const comment = pendingComment.value.trim() || undefined

  if (action !== 'info') {
    approverState.value = {
      ...approverState.value,
      [a.id]: { action, ts, comment },
    }
  }
  auditLog.value = [
    ...auditLog.value,
    { id: ++nextAuditId, ts, approverId: a.id, action, comment },
  ]
  pendingComment.value = ''
}

// Auto-scroll the audit log to the newest entry.
const auditLogEl = ref<HTMLElement | null>(null)
watch(
  () => auditLog.value.length,
  async () => {
    await nextTick()
    if (auditLogEl.value) auditLogEl.value.scrollTop = auditLogEl.value.scrollHeight
  },
)

function approverOf(id: string): Approver | undefined {
  return scenario.value.approvers.find((a) => a.id === id)
}

function setAmount(v: number): void {
  amount.value = Math.max(
    scenario.value.amountMin,
    Math.min(scenario.value.amountMax, Math.round(v)),
  )
}

function onAmountInput(e: Event): void {
  const target = e.target as HTMLInputElement
  const v = Number(target.value)
  if (!Number.isNaN(v)) setAmount(v)
}

// =============================================================================
// Formatters
// =============================================================================

function formatCurrency(v: number): string {
  return v.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function formatCurrencyCompact(v: number): string {
  if (v >= 1_000_000) {
    const m = v / 1_000_000
    return `$${m % 1 === 0 ? m : m.toFixed(1)}M`
  }
  if (v >= 1_000) {
    const k = v / 1_000
    return `$${k % 1 === 0 ? k : k.toFixed(1)}k`
  }
  return `$${v}`
}

function formatTs(ts: number): string {
  const d = new Date(ts)
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const date = d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  return `${date} · ${time}`
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((p) => !/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|van|der|de|von)$/i.test(p))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function actionLabel(action: ApprovalAction): string {
  switch (action) {
    case 'approve':     return 'Approved'
    case 'conditional': return 'Approved with conditions'
    case 'reject':      return 'Rejected'
    case 'info':        return 'Requested more info'
  }
}

function actionVerb(action: ApprovalAction): string {
  switch (action) {
    case 'approve':     return 'approves'
    case 'conditional': return 'approves with conditions'
    case 'reject':      return 'rejects'
    case 'info':        return 'requests more info'
  }
}

function tileStatusLabel(
  action: ApprovalAction | undefined,
  isActive: boolean,
  isCurrent: boolean,
): string {
  if (!isActive)              return 'Not in route'
  if (action === 'approve')   return 'Approved'
  if (action === 'conditional') return 'Approved (cond.)'
  if (action === 'reject')    return 'Rejected'
  if (isCurrent)              return 'Awaiting · You'
  return 'Pending'
}

function tileStatusClass(
  action: ApprovalAction | undefined,
  isActive: boolean,
  isCurrent: boolean,
): string {
  if (!isActive)            return 'text-mute-2'
  if (action === 'reject')  return 'text-red-600'
  if (action === 'approve' || action === 'conditional') return 'text-cyan-brand-deep'
  if (isCurrent)            return 'text-cyan-brand-deep'
  return 'text-mute-2'
}

const statusPill = computed<{ label: string; tone: 'mute' | 'cyan' | 'red' }>(() => {
  switch (chainStatus.value) {
    case 'pending':              return { label: 'Pending',                tone: 'mute' }
    case 'in-progress':          return { label: 'In review',              tone: 'cyan' }
    case 'approved':             return { label: 'Approved',               tone: 'cyan' }
    case 'approved-conditional': return { label: 'Approved (conditions)',  tone: 'cyan' }
    case 'rejected':             return { label: 'Rejected',               tone: 'red' }
  }
})

const evidenceGeneratedAt = computed<number>(() => {
  if (!auditLog.value.length) return Date.now()
  return auditLog.value[auditLog.value.length - 1]!.ts + 4_000
})
</script>

<template>
  <div class="relative">
    <!-- ===================================================================
         Header strip
         =================================================================== -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-alt/40 px-5 md:px-7 py-3.5"
    >
      <div
        class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
      >
        <span class="dot" />
        Live approval engine
      </div>
      <div class="inline-flex items-center gap-2 text-[12px] text-mute-2">
        <ShieldCheck :size="13" :stroke-width="1.9" aria-hidden="true" />
        Every action is logged. Nothing edits the record.
      </div>
    </div>

    <!-- ===================================================================
         Scenario tabs
         =================================================================== -->
    <div class="px-5 md:px-7 pt-5 md:pt-6">
      <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2.5">
        Scenario
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="s in SCENARIOS"
          :key="s.id"
          type="button"
          :class="[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
            activeScenarioId === s.id
              ? 'border-ink bg-ink text-white'
              : 'border-line bg-white text-ink hover:border-cyan-brand/40 hover:text-ink-soft',
          ]"
          @click="activeScenarioId = s.id"
        >
          <component :is="s.icon" :size="14" :stroke-width="1.9" aria-hidden="true" />
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- ===================================================================
         Subject + amount
         =================================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5 px-5 md:px-7 pt-5 md:pt-6">
      <!-- Subject -->
      <div class="lg:col-span-2 rounded-xl border border-line bg-white p-4 md:p-5">
        <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
          Subject
        </div>
        <div class="mt-1.5 font-display text-[24px] md:text-[28px] leading-[1.1] text-ink tabular-nums">
          {{ scenario.subject }}
        </div>
        <div class="mt-1 text-[13px] text-mute">{{ scenario.subjectContext }}</div>
        <div class="mt-3">
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold ring-1',
              statusPill.tone === 'red'
                ? 'bg-red-50 text-red-600 ring-red-100'
                : statusPill.tone === 'cyan'
                ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                : 'bg-surface-alt text-mute-2 ring-line',
            ]"
          >
            <span
              :class="[
                'h-1.5 w-1.5 rounded-full',
                statusPill.tone === 'red'
                  ? 'bg-red-600'
                  : statusPill.tone === 'cyan'
                  ? 'bg-cyan-brand'
                  : 'bg-mute-2',
              ]"
              aria-hidden="true"
            />
            {{ statusPill.label }}
          </span>
        </div>
      </div>

      <!-- Amount adjuster -->
      <div class="lg:col-span-3 rounded-xl border border-line bg-white p-4 md:p-5">
        <div class="flex items-baseline justify-between gap-3">
          <label
            :for="`${scenario.id}-amount`"
            class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold"
          >
            {{ scenario.amountLabel }}
          </label>
          <div class="font-display text-[22px] md:text-[30px] leading-none text-ink tabular-nums">
            {{ formatCurrency(amount) }}
          </div>
        </div>
        <input
          :id="`${scenario.id}-amount`"
          type="range"
          :min="scenario.amountMin"
          :max="scenario.amountMax"
          :step="Math.max(1, Math.round((scenario.amountMax - scenario.amountMin) / 200))"
          :value="amount"
          :aria-label="`${scenario.amountLabel}: ${formatCurrency(amount)}`"
          class="zb-range mt-4 w-full"
          @input="onAmountInput"
        />
        <div class="mt-3 flex flex-wrap gap-1.5">
          <button
            v-for="step in scenario.amountSteps"
            :key="step"
            type="button"
            :class="[
              'rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-1',
              amount === step
                ? 'border-cyan-brand bg-cyan-brand/10 text-cyan-brand-deep'
                : 'border-line bg-white text-mute hover:border-cyan-brand/40 hover:text-ink',
            ]"
            @click="setAmount(step)"
          >
            {{ formatCurrencyCompact(step) }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===================================================================
         Approval chain
         =================================================================== -->
    <div class="px-5 md:px-7 pt-7 md:pt-8">
      <div class="flex items-baseline justify-between gap-3 mb-3">
        <div
          class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold inline-flex items-center gap-1.5"
        >
          Approval chain
        </div>
        <div class="text-[12px] text-mute-2 hidden sm:block tabular-nums">
          {{ activeChain.length }} of {{ scenario.approvers.length }} approvers active at this amount
        </div>
      </div>

      <div class="-mx-1 overflow-x-auto pb-2">
        <ol class="inline-flex items-stretch gap-1 min-w-full px-1">
          <li
            v-for="(tile, i) in allChainTiles"
            :key="tile.approver.id"
            class="flex items-stretch"
          >
            <!-- Connector -->
            <div
              v-if="i > 0"
              :class="[
                'self-center mx-1.5 h-px w-5 md:w-7 transition-colors',
                tile.isActive && allChainTiles[i - 1]!.isActive
                  ? 'bg-line'
                  : 'border-t border-dashed border-line/70 bg-transparent',
              ]"
              aria-hidden="true"
            />
            <!-- Tile -->
            <div
              :class="[
                'relative w-[208px] md:w-[224px] flex-none rounded-xl border bg-white px-3.5 py-3 transition-all duration-300',
                !tile.isActive
                  ? 'border-line border-dashed opacity-55'
                  : currentApprover && currentApprover.id === tile.approver.id && !isHalted && !isComplete
                  ? 'border-cyan-brand ring-2 ring-cyan-brand/25 shadow-[0_10px_30px_-12px_rgba(1,219,241,0.45)]'
                  : tile.action === 'approve' || tile.action === 'conditional'
                  ? 'border-cyan-brand/30'
                  : tile.action === 'reject'
                  ? 'border-red-100'
                  : 'border-line',
              ]"
            >
              <div class="flex items-start gap-2.5">
                <div
                  :class="[
                    'flex-none inline-flex items-center justify-center h-9 w-9 rounded-full text-[12px] font-semibold ring-1 transition-colors',
                    !tile.isActive
                      ? 'bg-surface-alt text-mute-2 ring-line'
                      : tile.action === 'approve'
                      ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-cyan-brand/30'
                      : tile.action === 'conditional'
                      ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                      : tile.action === 'reject'
                      ? 'bg-red-50 text-red-600 ring-red-100'
                      : 'bg-surface-alt text-ink ring-line',
                  ]"
                  aria-hidden="true"
                >
                  <Check
                    v-if="tile.action === 'approve'"
                    :size="14"
                    :stroke-width="2.6"
                  />
                  <ClipboardCheck
                    v-else-if="tile.action === 'conditional'"
                    :size="13"
                    :stroke-width="2.2"
                  />
                  <XIcon
                    v-else-if="tile.action === 'reject'"
                    :size="14"
                    :stroke-width="2.6"
                  />
                  <template v-else>{{ initialsOf(tile.approver.name) }}</template>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-[10px] uppercase tracking-[0.18em] text-mute-2 font-semibold truncate">
                    {{ tile.approver.role }}
                  </div>
                  <div class="text-[13.5px] font-semibold text-ink leading-tight truncate">
                    {{ tile.approver.name }}
                  </div>
                </div>
              </div>

              <div class="mt-2.5 flex items-center justify-between gap-2">
                <span
                  v-if="tile.approver.thresholdNote"
                  :class="[
                    'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold',
                    tile.isActive
                      ? 'bg-cyan-brand/10 text-cyan-brand-deep'
                      : 'bg-surface-alt text-mute-2',
                  ]"
                >
                  {{ tile.approver.thresholdNote }}
                </span>
                <span v-else class="text-[10.5px] text-mute-2">Always routes</span>

                <span
                  class="text-[11px] font-semibold"
                  :class="tileStatusClass(
                    tile.action,
                    tile.isActive,
                    !!(currentApprover && currentApprover.id === tile.approver.id) && !isHalted && !isComplete,
                  )"
                >
                  {{
                    tileStatusLabel(
                      tile.action,
                      tile.isActive,
                      !!(currentApprover && currentApprover.id === tile.approver.id) && !isHalted && !isComplete,
                    )
                  }}
                </span>
              </div>
            </div>
          </li>
        </ol>
      </div>

      <p class="mt-3 text-[12.5px] text-mute leading-[1.55] max-w-3xl inline-flex items-start gap-1.5">
        <SlidersHorizontal
          :size="13"
          :stroke-width="2"
          class="mt-0.5 flex-none text-mute-2"
          aria-hidden="true"
        />
        <span>{{ scenario.ruleSummary }}</span>
      </p>
    </div>

    <!-- ===================================================================
         Action panel + audit
         =================================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-6 px-5 md:px-7 pt-7 md:pt-8">
      <!-- Action panel -->
      <div class="lg:col-span-3">
        <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2.5">
          Take action
        </div>
        <div class="rounded-xl border border-line bg-white p-4 md:p-5">
          <!-- Active step -->
          <div v-if="currentApprover" class="space-y-4">
            <div class="flex items-center gap-3">
              <div
                class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 text-[13px] font-semibold"
              >
                {{ initialsOf(currentApprover.name) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                  You are playing
                </div>
                <div class="text-[15px] font-semibold text-ink truncate">
                  {{ currentApprover.name }}
                  <span class="font-normal text-mute">· {{ currentApprover.role }}</span>
                </div>
              </div>
            </div>

            <label class="block">
              <span class="block text-[12px] font-semibold text-ink mb-1.5">
                Comment
                <span class="text-mute-2 font-normal">(optional)</span>
              </span>
              <textarea
                v-model="pendingComment"
                rows="2"
                placeholder="Add a condition, reason, or follow-up — threaded into the audit log."
                class="zb-field w-full"
              />
            </label>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[13.5px] font-semibold px-3.5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                @click="takeAction('approve')"
              >
                <Check :size="15" :stroke-width="2.4" aria-hidden="true" />
                Approve
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white hover:border-cyan-brand/40 hover:text-ink-soft text-ink text-[13.5px] font-semibold px-3.5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                @click="takeAction('conditional')"
              >
                <ClipboardCheck :size="15" :stroke-width="2" aria-hidden="true" />
                Approve with conditions
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white hover:border-mute/30 text-mute text-[13.5px] font-semibold px-3.5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                @click="takeAction('info')"
              >
                <MessageSquare :size="15" :stroke-width="2" aria-hidden="true" />
                Request more info
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white hover:bg-red-50 text-red-600 text-[13.5px] font-semibold px-3.5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                @click="takeAction('reject')"
              >
                <XIcon :size="15" :stroke-width="2.4" aria-hidden="true" />
                Reject
              </button>
            </div>
          </div>

          <!-- Completed / halted -->
          <div v-else class="text-center py-6 md:py-8">
            <div
              v-if="isComplete"
              class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 mb-3"
              aria-hidden="true"
            >
              <ShieldCheck :size="22" :stroke-width="1.9" />
            </div>
            <div
              v-else-if="isHalted"
              class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 text-red-600 ring-1 ring-red-100 mb-3"
              aria-hidden="true"
            >
              <XIcon :size="22" :stroke-width="1.9" />
            </div>
            <div class="font-display text-[20px] md:text-[24px] text-ink leading-[1.2]">
              <template v-if="isComplete">
                {{
                  chainStatus === 'approved-conditional'
                    ? 'Approved with conditions.'
                    : 'Approved. Downstream actions fired.'
                }}
              </template>
              <template v-else-if="isHalted">Application halted at rejection.</template>
              <template v-else>Chain ready.</template>
            </div>
            <p class="mt-1.5 text-[13.5px] text-mute max-w-md mx-auto leading-[1.55]">
              <template v-if="isComplete">
                The last signature landed — work moved instantly.
              </template>
              <template v-else-if="isHalted">
                No downstream actions fire. The full reasoning sits in the audit log to the right.
              </template>
              <template v-else>
                Adjust the amount or pick a scenario to begin.
              </template>
            </p>
            <button
              v-if="isComplete || isHalted"
              type="button"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white hover:border-cyan-brand/40 text-ink text-[13px] font-semibold px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              @click="resetAll"
            >
              <RotateCcw :size="13" :stroke-width="2" aria-hidden="true" />
              Restart this scenario
            </button>
          </div>
        </div>
      </div>

      <!-- Audit log -->
      <div class="lg:col-span-2">
        <div class="flex items-baseline justify-between gap-3 mb-2.5">
          <div
            class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold"
          >
            <ScrollText :size="12" :stroke-width="2" aria-hidden="true" />
            Audit trail
          </div>
          <span class="text-[11.5px] text-mute-2 tabular-nums">
            {{ auditLog.length }} {{ auditLog.length === 1 ? 'entry' : 'entries' }}
          </span>
        </div>
        <div
          ref="auditLogEl"
          class="rounded-xl border border-line bg-surface-alt/40 p-3 md:p-3.5 max-h-[360px] overflow-y-auto"
          aria-live="polite"
        >
          <ol v-if="auditLog.length" class="space-y-2.5">
            <li
              v-for="entry in auditLog"
              :key="entry.id"
              class="rounded-lg bg-white border border-line px-3 py-2.5"
            >
              <div class="flex items-start gap-2.5">
                <span
                  :class="[
                    'flex-none inline-flex items-center justify-center h-6 w-6 rounded-full ring-1 mt-0.5',
                    entry.action === 'reject'
                      ? 'bg-red-50 text-red-600 ring-red-100'
                      : entry.action === 'info'
                      ? 'bg-surface-alt text-mute-2 ring-line'
                      : 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25',
                  ]"
                  aria-hidden="true"
                >
                  <Check        v-if="entry.action === 'approve'"     :size="12" :stroke-width="2.6" />
                  <ClipboardCheck v-else-if="entry.action === 'conditional'" :size="12" :stroke-width="2.2" />
                  <XIcon        v-else-if="entry.action === 'reject'" :size="12" :stroke-width="2.6" />
                  <MessageSquare v-else                                :size="11" :stroke-width="2" />
                </span>
                <div class="min-w-0 flex-1">
                  <div class="text-[13px] text-ink leading-[1.35]">
                    <span class="font-semibold">{{ approverOf(entry.approverId)?.name }}</span>
                    <span class="text-mute"> {{ actionVerb(entry.action) }}</span>
                  </div>
                  <div class="mt-0.5 text-[11.5px] text-mute-2 tabular-nums">
                    {{ formatTs(entry.ts) }}
                  </div>
                  <div
                    v-if="entry.comment"
                    class="mt-1.5 text-[12.5px] text-ink/85 leading-[1.45] border-l-2 border-line pl-2 italic"
                  >
                    &ldquo;{{ entry.comment }}&rdquo;
                  </div>
                </div>
              </div>
            </li>
          </ol>
          <div v-else class="text-center py-8">
            <Clock
              :size="20"
              :stroke-width="1.8"
              class="inline-block text-mute-2 mb-2"
              aria-hidden="true"
            />
            <p class="text-[13px] text-mute leading-[1.55] max-w-[22ch] mx-auto">
              No actions yet. The log writes itself the moment you click.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================================================================
         Downstream actions (fires only on full approval)
         =================================================================== -->
    <div v-if="isComplete" class="px-5 md:px-7 pt-7 md:pt-8">
      <div
        class="text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold mb-3 inline-flex items-center gap-2"
      >
        <span class="dot" />
        Downstream actions fired
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="(d, i) in scenario.downstream"
          :key="d.label"
          class="zb-downstream rounded-xl border border-cyan-brand/30 bg-white p-4"
          :style="{ animationDelay: `${i * 140}ms` }"
        >
          <span
            class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25"
            aria-hidden="true"
          >
            <component :is="d.icon" :size="17" :stroke-width="1.9" />
          </span>
          <div class="mt-2.5 text-[13.5px] font-semibold text-ink leading-[1.3]">
            {{ d.label }}
          </div>
          <div class="mt-1 text-[12px] text-mute leading-[1.5]">{{ d.detail }}</div>
        </div>
      </div>
    </div>

    <!-- ===================================================================
         Evidence pack
         =================================================================== -->
    <div class="px-5 md:px-7 pt-7 md:pt-8 pb-6 md:pb-7">
      <div class="rounded-xl border border-line bg-surface-alt/40 p-4 md:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div class="min-w-0">
            <div
              class="text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold inline-flex items-center gap-2"
            >
              <FileDown :size="11" :stroke-width="2" aria-hidden="true" />
              Evidence pack
            </div>
            <h3
              class="mt-1.5 font-display text-[20px] md:text-[24px] text-ink leading-[1.15]"
            >
              The trail, rendered as a regulator would receive it.
            </h3>
            <p class="mt-1 text-[13px] md:text-[13.5px] text-mute leading-[1.55] max-w-xl">
              Every decision, every comment, every timestamp — stitched into a single
              document. One click, not a week of digging.
            </p>
          </div>
          <button
            type="button"
            :disabled="!auditLog.length"
            :class="[
              'flex-none inline-flex items-center gap-1.5 rounded-lg text-[13px] font-semibold px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              auditLog.length
                ? 'bg-ink hover:bg-ink-soft text-white'
                : 'bg-surface-alt text-mute-2 cursor-not-allowed',
            ]"
            @click="showEvidence = !showEvidence"
          >
            <FileText :size="13" :stroke-width="2" aria-hidden="true" />
            {{ showEvidence ? 'Hide pack' : 'Open evidence pack' }}
          </button>
        </div>

        <!-- Rendered evidence document -->
        <div
          v-if="showEvidence && auditLog.length"
          class="mt-4 rounded-lg border border-line bg-white p-5 md:p-7"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 border-b border-line pb-4 mb-4">
            <div class="min-w-0">
              <div class="text-[10px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                Evidence pack
              </div>
              <div class="mt-1 font-display text-[22px] md:text-[26px] text-ink leading-[1.15] tabular-nums">
                {{ scenario.subject }}
              </div>
              <div class="text-[12.5px] text-mute">{{ scenario.subjectContext }}</div>
            </div>
            <div class="text-left sm:text-right shrink-0">
              <div class="text-[10px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                Generated
              </div>
              <div class="mt-1 text-[12.5px] text-ink tabular-nums whitespace-nowrap">
                {{ formatTs(evidenceGeneratedAt) }}
              </div>
            </div>
          </div>

          <dl class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12.5px]">
            <div>
              <dt class="text-[10px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                {{ scenario.amountLabel }}
              </dt>
              <dd class="mt-0.5 text-ink tabular-nums">{{ formatCurrency(amount) }}</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                Outcome
              </dt>
              <dd
                class="mt-0.5"
                :class="statusPill.tone === 'red' ? 'text-red-600' : 'text-ink'"
              >
                {{ statusPill.label }}
              </dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                Approvers required
              </dt>
              <dd class="mt-0.5 text-ink tabular-nums">{{ activeChain.length }}</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                Total entries
              </dt>
              <dd class="mt-0.5 text-ink tabular-nums">{{ auditLog.length }}</dd>
            </div>
          </dl>

          <div class="mt-5">
            <div class="text-[10px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2">
              Decision log
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-[12.5px] min-w-[520px]">
                <thead>
                  <tr class="text-left text-mute-2 border-b border-line">
                    <th class="py-1.5 pr-3 font-semibold whitespace-nowrap">When</th>
                    <th class="py-1.5 pr-3 font-semibold">Approver</th>
                    <th class="py-1.5 pr-3 font-semibold">Role</th>
                    <th class="py-1.5 pr-3 font-semibold">Action</th>
                    <th class="py-1.5 font-semibold">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="entry in auditLog"
                    :key="entry.id"
                    class="border-b border-line/60 align-top"
                  >
                    <td class="py-2 pr-3 text-mute tabular-nums whitespace-nowrap">
                      {{ formatTs(entry.ts) }}
                    </td>
                    <td class="py-2 pr-3 font-medium text-ink whitespace-nowrap">
                      {{ approverOf(entry.approverId)?.name }}
                    </td>
                    <td class="py-2 pr-3 text-mute whitespace-nowrap">
                      {{ approverOf(entry.approverId)?.role }}
                    </td>
                    <td
                      class="py-2 pr-3 whitespace-nowrap"
                      :class="entry.action === 'reject' ? 'text-red-600' : 'text-ink'"
                    >
                      {{ actionLabel(entry.action) }}
                    </td>
                    <td class="py-2 text-mute">
                      {{ entry.comment || '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mt-5 pt-4 border-t border-line text-[11px] text-mute-2 leading-[1.55]">
            Generated automatically by the Zabble approval engine. Each row carries a
            tamper-evident hash and is reproducible from the underlying event store.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Textarea styling — sits alongside form-field defaults from brand.md. */
.zb-field {
  border-radius: 0.75rem;
  border: 1px solid var(--color-line, #E2E8F0);
  background: #fff;
  padding: 0.65rem 0.85rem;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-ink, #0a0f1a);
  font-family: var(--font-sans);
  transition: border-color 180ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1);
  resize: vertical;
}
.zb-field::placeholder { color: #94a3b8; }
.zb-field:hover  { border-color: rgba(1, 219, 241, 0.4); }
.zb-field:focus  {
  outline: none;
  border-color: #01dbf1;
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.22);
}

/* Range slider — light track, cyan-ringed thumb. */
.zb-range {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  height: 24px;
  cursor: pointer;
}
.zb-range:focus { outline: none; }

.zb-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 9999px;
  background: #e2e8f0;
}
.zb-range::-moz-range-track {
  height: 4px;
  border-radius: 9999px;
  background: #e2e8f0;
}
.zb-range::-moz-range-progress {
  height: 4px;
  border-radius: 9999px;
  background: linear-gradient(to right, #01dbf1, #00b8cc);
}

.zb-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: -7px;
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background: #fff;
  border: 2px solid #00b8cc;
  box-shadow: 0 2px 6px rgba(0, 184, 204, 0.25);
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 160ms cubic-bezier(0.22, 1, 0.36, 1);
}
.zb-range::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background: #fff;
  border: 2px solid #00b8cc;
  box-shadow: 0 2px 6px rgba(0, 184, 204, 0.25);
}
.zb-range::-webkit-slider-thumb:hover { transform: scale(1.08); }
.zb-range:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.22);
}
.zb-range:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.22);
}

/* Downstream cards stagger in once the chain completes. */
@keyframes zb-downstream-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.zb-downstream {
  opacity: 0;
  animation: zb-downstream-in 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .zb-downstream {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .zb-range::-webkit-slider-thumb,
  .zb-range::-moz-range-thumb { transition: none; }
}
</style>
