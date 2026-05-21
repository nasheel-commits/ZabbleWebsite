<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import {
  Workflow as WorkflowIcon,
  Zap, Play, RotateCcw, Plus,
  Clock, CheckCircle2, AlertTriangle, RotateCw, Hand, Loader2,
  ShoppingCart, PenLine, UserPlus, Undo2, CircleSlash,
  Receipt, PackageMinus, Ticket, Truck, Mail, Users, BellRing,
  FileText, Server, CalendarClock, UserCheck, Send, CreditCard,
  KeyRound, Package, Banknote, HeartHandshake, CalendarDays,
  Building2, ShieldCheck, PackagePlus, Network, BookOpen,
  MessageCircle, Repeat, Hourglass, Archive, Bell,
  ChevronRight, Flag, Octagon, GitBranch,
  Wrench, Timer,
} from '@lucide/vue'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EventId =
  | 'new-order'
  | 'signed-contract'
  | 'new-employee'
  | 'refund-request'
  | 'subscription-cancelled'

type NodeStatus =
  | 'queued'
  | 'running'
  | 'done'
  | 'failed'
  | 'retrying'
  | 'escalated'

interface NodeDef {
  id: string
  label: string
  system: string
  icon: Component
  failureReason: string
  fallbackAction: string
  escalationAction: string
}

interface WorkflowDef {
  id: EventId
  label: string
  detail: string
  icon: Component
  nodes: NodeDef[]
  /** When the extension toggle is on, this node is spliced in after afterIndex. */
  extension: { afterIndex: number; node: NodeDef }
  manual: { people: number; tools: number; elapsed: string; risk: string }
}

interface LogEntry {
  id: number
  ts: string
  kind: LogKind
  nodeLabel?: string
  detail: string
}

type LogKind =
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.halted'
  | 'node.started'
  | 'node.succeeded'
  | 'node.failed'
  | 'retry.fired'
  | 'retry.failed'
  | 'fallback.activated'
  | 'fallback.failed'
  | 'human.escalated'
  | 'workflow.reshaped'

// ---------------------------------------------------------------------------
// Workflow definitions
// ---------------------------------------------------------------------------

const WORKFLOWS: WorkflowDef[] = [
  {
    id: 'new-order',
    label: 'New order placed',
    detail: 'Acme #2041 · $1,280 · 3 SKUs',
    icon: ShoppingCart,
    nodes: [
      { id: 'no-invoice',  label: 'Raise invoice',           system: 'Finance',    icon: Receipt,
        failureReason: 'Invoice service returned 503 · upstream queue saturated',
        fallbackAction: 'Re-routed to secondary invoice queue',
        escalationAction: 'Finance lead notified · invoice required by hand' },
      { id: 'no-stock',    label: 'Deduct stock',            system: 'Inventory',  icon: PackageMinus,
        failureReason: 'SKU lock held by warehouse scanner',
        fallbackAction: 'Reserved against in-transit batch',
        escalationAction: 'Warehouse manager paged · manual reservation' },
      { id: 'no-ticket',   label: 'Open fulfilment ticket',  system: 'Ops',        icon: Ticket,
        failureReason: 'Ticket store timeout · primary region',
        fallbackAction: 'Retried against cold replica',
        escalationAction: 'Ops lead paged · ticket opened manually' },
      { id: 'no-dispatch', label: 'Schedule dispatch',       system: 'Logistics',  icon: Truck,
        failureReason: 'Courier API rate-limit hit',
        fallbackAction: 'Rerouted to secondary courier',
        escalationAction: 'Dispatch desk paged · manual booking' },
      { id: 'no-email',    label: 'Email customer',          system: 'Comms',      icon: Mail,
        failureReason: 'Email gateway throttled',
        fallbackAction: 'Retried via secondary SMTP relay',
        escalationAction: 'Customer success ping · alternate channel' },
      { id: 'no-crm',      label: 'Update CRM record',       system: 'CRM',        icon: Users,
        failureReason: 'CRM write-lock contention',
        fallbackAction: 'Buffered into CRM journal',
        escalationAction: 'CRM admin notified · manual reconcile' },
    ],
    extension: {
      afterIndex: 3,
      node: {
        id: 'no-supplier', label: 'Notify supplier', system: 'Procurement', icon: BellRing,
        failureReason: 'Supplier portal offline',
        fallbackAction: 'Notified via fallback email',
        escalationAction: 'Procurement lead paged',
      },
    },
    manual: { people: 4, tools: 6, elapsed: '~1 day', risk: 'One step always missed by 9am the next morning.' },
  },
  {
    id: 'signed-contract',
    label: 'Signed contract',
    detail: 'Beta Co · advisory retainer · $8,500/mo',
    icon: PenLine,
    nodes: [
      { id: 'sc-file',     label: 'File contract',           system: 'Legal vault', icon: FileText,
        failureReason: 'Vault write rejected · checksum mismatch',
        fallbackAction: 'Re-uploaded with re-computed hash',
        escalationAction: 'Legal ops notified · manual filing required' },
      { id: 'sc-workspace',label: 'Provision workspace',     system: 'IT',          icon: Server,
        failureReason: 'Provisioning quota exceeded',
        fallbackAction: 'Reserved from spare quota pool',
        escalationAction: 'IT lead paged · manual provisioning' },
      { id: 'sc-kickoff',  label: 'Schedule kick-off',       system: 'Calendars',   icon: CalendarClock,
        failureReason: 'Calendar API auth token expired',
        fallbackAction: 'Refreshed token · retry against backup calendar',
        escalationAction: 'Account manager paged · booking by hand' },
      { id: 'sc-am',       label: 'Assign account manager',  system: 'CRM',         icon: UserCheck,
        failureReason: 'AM allocation rule returned no match',
        fallbackAction: 'Routed to round-robin queue',
        escalationAction: 'Head of accounts paged · manual assignment' },
      { id: 'sc-welcome',  label: 'Send welcome packet',     system: 'Comms',       icon: Send,
        failureReason: 'Template render failed · missing merge field',
        fallbackAction: 'Rendered with stripped-down template',
        escalationAction: 'Comms lead paged · packet sent manually' },
      { id: 'sc-billing',  label: 'Set up billing schedule', system: 'Finance',     icon: CreditCard,
        failureReason: 'Billing rule conflict · retainer + project terms',
        fallbackAction: 'Created split schedule with manual review flag',
        escalationAction: 'Finance ops notified · billing set by hand' },
    ],
    extension: {
      afterIndex: 2,
      node: {
        id: 'sc-brief', label: 'Brief delivery team', system: 'Ops', icon: BookOpen,
        failureReason: 'Brief template missing required fields',
        fallbackAction: 'Used last-good brief template',
        escalationAction: 'Delivery lead paged · brief by hand',
      },
    },
    manual: { people: 5, tools: 7, elapsed: '3–5 days', risk: 'Kick-off slips because someone forgot a step.' },
  },
  {
    id: 'new-employee',
    label: 'New employee start',
    detail: 'Maya O. · joining 1 June · Engineering',
    icon: UserPlus,
    nodes: [
      { id: 'ne-it',       label: 'Create IT accounts',      system: 'IT',          icon: KeyRound,
        failureReason: 'Directory sync paused · scheduled maintenance window',
        fallbackAction: 'Queued to post-maintenance batch',
        escalationAction: 'IT admin paged · accounts created manually' },
      { id: 'ne-equipment',label: 'Order equipment',         system: 'Procurement', icon: Package,
        failureReason: 'Preferred laptop SKU out of stock',
        fallbackAction: 'Substituted to equivalent SKU',
        escalationAction: 'Procurement lead paged · hand-picked replacement' },
      { id: 'ne-payroll',  label: 'Enrol in payroll',        system: 'Finance',     icon: Banknote,
        failureReason: 'Tax ID validation failed',
        fallbackAction: 'Queued for next manual review window',
        escalationAction: 'Payroll admin paged · tax ID corrected by hand' },
      { id: 'ne-benefits', label: 'Enrol in benefits',       system: 'HR',          icon: HeartHandshake,
        failureReason: 'Benefits provider portal timeout',
        fallbackAction: 'Retried against alternate region endpoint',
        escalationAction: 'HR lead paged · enrolment by hand' },
      { id: 'ne-buddy',    label: 'Assign onboarding buddy', system: 'People ops',  icon: Users,
        failureReason: 'No buddy available in matching cohort',
        fallbackAction: 'Routed to cross-team buddy pool',
        escalationAction: 'People ops paged · buddy assigned manually' },
      { id: 'ne-meetings', label: 'Schedule first-week 1:1s',system: 'Calendars',   icon: CalendarDays,
        failureReason: 'Manager calendar fully booked week 1',
        fallbackAction: 'Auto-booked into week-2 slots',
        escalationAction: 'EA paged · manual scheduling required' },
    ],
    extension: {
      afterIndex: 4,
      node: {
        id: 'ne-facilities', label: 'Add to facilities list', system: 'Facilities', icon: Building2,
        failureReason: 'Building access roster out of date',
        fallbackAction: 'Issued temporary access card',
        escalationAction: 'Facilities lead paged · access issued by hand',
      },
    },
    manual: { people: 4, tools: 8, elapsed: '4–7 days', risk: 'Laptop arrives late · employee starts on borrowed kit.' },
  },
  {
    id: 'refund-request',
    label: 'Refund request',
    detail: 'Order #1998 · Beta Co · $4,800',
    icon: Undo2,
    nodes: [
      { id: 'rf-eligible', label: 'Validate eligibility',    system: 'Policy engine', icon: ShieldCheck,
        failureReason: 'Policy lookup timed out',
        fallbackAction: 'Used cached policy snapshot',
        escalationAction: 'Support lead paged · eligibility checked manually' },
      { id: 'rf-reverse',  label: 'Reverse the charge',      system: 'Payments',      icon: RotateCcw,
        failureReason: 'Payment processor returned soft-decline',
        fallbackAction: 'Routed to secondary processor',
        escalationAction: 'Finance ops paged · refund processed manually' },
      { id: 'rf-restock',  label: 'Restock item',            system: 'Inventory',     icon: PackagePlus,
        failureReason: 'Item flagged for inspection',
        fallbackAction: 'Booked into inspection queue',
        escalationAction: 'Warehouse manager paged · manual restock decision' },
      { id: 'rf-crm',      label: 'Adjust CRM lifecycle',    system: 'CRM',           icon: Network,
        failureReason: 'CRM state transition rejected',
        fallbackAction: 'Force-applied via admin API',
        escalationAction: 'CRM admin paged · lifecycle adjusted by hand' },
      { id: 'rf-email',    label: 'Email customer',          system: 'Comms',         icon: MessageCircle,
        failureReason: 'Customer email address bounced',
        fallbackAction: 'Sent via alternate contact on file',
        escalationAction: 'Support lead paged · phoned the customer' },
      { id: 'rf-journal',  label: 'Post refund journal',     system: 'Finance',       icon: BookOpen,
        failureReason: 'GL period locked for close',
        fallbackAction: 'Posted to next-period accrual',
        escalationAction: 'Finance lead paged · journal posted by hand' },
    ],
    extension: {
      afterIndex: 3,
      node: {
        id: 'rf-retain', label: 'Notify retention team', system: 'Comms', icon: Bell,
        failureReason: 'Retention queue offline',
        fallbackAction: 'Logged into next-day retention digest',
        escalationAction: 'Retention lead paged · followed up manually',
      },
    },
    manual: { people: 3, tools: 5, elapsed: '5–10 days', risk: 'Revenue not reversed · P&L overstated until close.' },
  },
  {
    id: 'subscription-cancelled',
    label: 'Subscription cancelled',
    detail: 'Gamma Inc · Pro tier · 14 seats',
    icon: CircleSlash,
    nodes: [
      { id: 'sc-revoke',   label: 'Revoke licences',         system: 'IAM',         icon: KeyRound,
        failureReason: 'IAM provider returned partial-failure',
        fallbackAction: 'Queued unresolved seats for retry sweep',
        escalationAction: 'IT lead paged · seats revoked by hand' },
      { id: 'sc-stop-bill',label: 'Stop recurring invoice',  system: 'Finance',     icon: Repeat,
        failureReason: 'Billing engine still in mid-cycle',
        fallbackAction: 'Scheduled stop for next cycle boundary',
        escalationAction: 'Finance ops paged · invoice cancelled manually' },
      { id: 'sc-stage',    label: 'Update CRM stage',        system: 'CRM',         icon: Network,
        failureReason: 'Stage transition rule blocked move',
        fallbackAction: 'Force-applied via admin API',
        escalationAction: 'CRM admin paged · stage moved by hand' },
      { id: 'sc-offboard', label: 'Send offboarding email',  system: 'Comms',       icon: Send,
        failureReason: 'Template missing for tier-specific copy',
        fallbackAction: 'Sent generic offboarding template',
        escalationAction: 'Comms lead paged · email written by hand' },
      { id: 'sc-winback',  label: 'Schedule win-back cadence',system: 'Comms',      icon: Hourglass,
        failureReason: 'Cadence service queue offline',
        fallbackAction: 'Stored cadence for next sweep',
        escalationAction: 'Growth lead paged · cadence scheduled manually' },
      { id: 'sc-archive',  label: 'Archive workspace',       system: 'Storage',     icon: Archive,
        failureReason: 'Archive job rejected · object lock active',
        fallbackAction: 'Marked for delayed archive',
        escalationAction: 'IT admin paged · archive run by hand' },
    ],
    extension: {
      afterIndex: 2,
      node: {
        id: 'sc-csm', label: 'Notify CSM', system: 'Customer Success', icon: Bell,
        failureReason: 'CSM Slack channel rate-limited',
        fallbackAction: 'Notified via email digest',
        escalationAction: 'CSM lead paged directly',
      },
    },
    manual: { people: 4, tools: 6, elapsed: '~1 week', risk: 'Customer still billed after cancellation.' },
  },
]

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

const activeEventId = ref<EventId>('new-order')
const addExtension = ref(false)
const failureTarget = ref<string | null>(null)
const isRunning = ref(false)
const isHalted = ref(false)
const isComplete = ref(false)

const activeWorkflow = computed(() => WORKFLOWS.find((w) => w.id === activeEventId.value)!)

const activeNodes = computed<NodeDef[]>(() => {
  const base = [...activeWorkflow.value.nodes]
  if (addExtension.value) {
    const { afterIndex, node } = activeWorkflow.value.extension
    base.splice(afterIndex + 1, 0, node)
  }
  return base
})

const nodeStatus = reactive<Record<string, NodeStatus>>({})
const nodeTrace = reactive<Record<string, string>>({})
const eventLog = ref<LogEntry[]>([])

let logId = 0
let runToken = 0
let timers: ReturnType<typeof setTimeout>[] = []

// ---------------------------------------------------------------------------
// Run engine
// ---------------------------------------------------------------------------

function clearTimers() {
  for (const t of timers) clearTimeout(t)
  timers = []
}

function reset() {
  clearTimers()
  runToken++
  isRunning.value = false
  isHalted.value = false
  isComplete.value = false
  // Reset every node status / trace for the current node set.
  for (const n of activeNodes.value) {
    nodeStatus[n.id] = 'queued'
    delete nodeTrace[n.id]
  }
  eventLog.value = []
}

function delay(ms: number, token: number): Promise<boolean> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(token === runToken), ms)
    timers.push(t)
  })
}

function fmtTs(): string {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

function log(kind: LogKind, detail: string, nodeLabel?: string) {
  eventLog.value.unshift({
    id: logId++,
    ts: fmtTs(),
    kind,
    nodeLabel,
    detail,
  })
}

async function run() {
  reset()
  const token = runToken
  // Give the reset a beat to render before kicking off.
  if (!(await delay(220, token))) return
  isRunning.value = true
  log('workflow.started', `${activeWorkflow.value.label} · ${activeWorkflow.value.detail}`)
  if (addExtension.value) {
    log('workflow.reshaped', `+1 step: ${activeWorkflow.value.extension.node.label}`, activeWorkflow.value.extension.node.label)
  }

  for (const node of activeNodes.value) {
    if (!(await delay(360, token))) return

    nodeStatus[node.id] = 'running'
    log('node.started', `→ ${node.system}`, node.label)

    if (!(await delay(880, token))) return

    if (failureTarget.value === node.id) {
      // 1. Initial failure
      nodeStatus[node.id] = 'failed'
      nodeTrace[node.id] = node.failureReason
      log('node.failed', node.failureReason, node.label)
      if (!(await delay(620, token))) return

      // 2. Retry
      nodeStatus[node.id] = 'retrying'
      nodeTrace[node.id] = 'Retry 1 of 1 · back-off 2s'
      log('retry.fired', 'Retry attempt fired', node.label)
      if (!(await delay(840, token))) return

      // 3. Retry fails
      nodeStatus[node.id] = 'failed'
      nodeTrace[node.id] = 'Retry hit the same error'
      log('retry.failed', 'Retry exhausted', node.label)
      if (!(await delay(620, token))) return

      // 4. Fallback
      nodeStatus[node.id] = 'retrying'
      nodeTrace[node.id] = `Fallback engaged · ${node.fallbackAction}`
      log('fallback.activated', node.fallbackAction, node.label)
      if (!(await delay(840, token))) return

      // 5. Fallback fails (deterministic demo: both attempts fail)
      nodeStatus[node.id] = 'failed'
      nodeTrace[node.id] = 'Fallback path also failed'
      log('fallback.failed', 'Primary and secondary unavailable', node.label)
      if (!(await delay(620, token))) return

      // 6. Escalate
      nodeStatus[node.id] = 'escalated'
      nodeTrace[node.id] = `Escalated · ${node.escalationAction}`
      log('human.escalated', node.escalationAction, node.label)

      if (!(await delay(420, token))) return
      isRunning.value = false
      isHalted.value = true
      log('workflow.halted', 'Chain stopped — waiting on a human')
      return
    }

    nodeStatus[node.id] = 'done'
    log('node.succeeded', `${node.system} acknowledged`, node.label)
  }

  isRunning.value = false
  isComplete.value = true
  log('workflow.completed', `All ${activeNodes.value.length} steps acknowledged`)
}

// Auto-run on mount and on any setting change.
onMounted(() => {
  run()
})

watch(
  [activeEventId, addExtension, failureTarget],
  () => {
    run()
  },
)

onUnmounted(() => clearTimers())

// ---------------------------------------------------------------------------
// View helpers
// ---------------------------------------------------------------------------

function statusClasses(status: NodeStatus | undefined): {
  card: string
  chipBg: string
  chipText: string
  chipRing: string
  iconBg: string
  iconRing: string
  iconText: string
} {
  switch (status) {
    case 'running':
      return {
        card: 'border-cyan-brand/50 ring-1 ring-cyan-brand/20 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.18)]',
        chipBg: 'bg-cyan-brand/15',
        chipText: 'text-cyan-brand-deep',
        chipRing: 'ring-cyan-brand/30',
        iconBg: 'bg-cyan-brand/12',
        iconRing: 'ring-cyan-brand/25',
        iconText: 'text-cyan-brand-deep',
      }
    case 'done':
      return {
        card: 'border-cyan-brand/35',
        chipBg: 'bg-cyan-brand/12',
        chipText: 'text-cyan-brand-deep',
        chipRing: 'ring-cyan-brand/25',
        iconBg: 'bg-cyan-brand/10',
        iconRing: 'ring-cyan-brand/25',
        iconText: 'text-cyan-brand-deep',
      }
    case 'failed':
      return {
        card: 'border-[#FECACA] ring-1 ring-[#FEE2E2]',
        chipBg: 'bg-[#FEF2F2]',
        chipText: 'text-[#DC2626]',
        chipRing: 'ring-[#FEE2E2]',
        iconBg: 'bg-[#FEF2F2]',
        iconRing: 'ring-[#FEE2E2]',
        iconText: 'text-[#DC2626]',
      }
    case 'retrying':
      return {
        card: 'border-[#FED7AA] ring-1 ring-[#FFEDD5]',
        chipBg: 'bg-[#FFFBEB]',
        chipText: 'text-[#B45309]',
        chipRing: 'ring-[#FED7AA]',
        iconBg: 'bg-[#FFFBEB]',
        iconRing: 'ring-[#FED7AA]',
        iconText: 'text-[#B45309]',
      }
    case 'escalated':
      return {
        card: 'border-[#FCA5A5] ring-1 ring-[#FEE2E2]',
        chipBg: 'bg-[#FEF2F2]',
        chipText: 'text-[#B91C1C]',
        chipRing: 'ring-[#FCA5A5]',
        iconBg: 'bg-[#FEF2F2]',
        iconRing: 'ring-[#FCA5A5]',
        iconText: 'text-[#B91C1C]',
      }
    case 'queued':
    default:
      return {
        card: 'border-line',
        chipBg: 'bg-surface-alt',
        chipText: 'text-mute-2',
        chipRing: 'ring-line',
        iconBg: 'bg-surface-alt',
        iconRing: 'ring-line',
        iconText: 'text-mute-2',
      }
  }
}

const STATUS_LABEL: Record<NodeStatus, string> = {
  queued:    'Queued',
  running:   'Running',
  done:      'Done',
  failed:    'Failed',
  retrying:  'Retrying',
  escalated: 'Escalated',
}

const STATUS_ICON: Record<NodeStatus, Component> = {
  queued:    Clock,
  running:   Loader2,
  done:      CheckCircle2,
  failed:    AlertTriangle,
  retrying:  RotateCw,
  escalated: Hand,
}

const LOG_ICON: Record<LogKind, Component> = {
  'workflow.started':    Play,
  'workflow.completed':  Flag,
  'workflow.halted':     Octagon,
  'workflow.reshaped':   Plus,
  'node.started':        ChevronRight,
  'node.succeeded':      CheckCircle2,
  'node.failed':         AlertTriangle,
  'retry.fired':         RotateCw,
  'retry.failed':        AlertTriangle,
  'fallback.activated':  GitBranch,
  'fallback.failed':     AlertTriangle,
  'human.escalated':     Hand,
}

function logTone(kind: LogKind): 'cyan' | 'amber' | 'red' | 'mute' {
  switch (kind) {
    case 'workflow.started':
    case 'node.started':
    case 'workflow.reshaped':
      return 'mute'
    case 'node.succeeded':
    case 'workflow.completed':
      return 'cyan'
    case 'retry.fired':
    case 'fallback.activated':
      return 'amber'
    case 'node.failed':
    case 'retry.failed':
    case 'fallback.failed':
    case 'human.escalated':
    case 'workflow.halted':
      return 'red'
  }
}

const LOG_LABEL: Record<LogKind, string> = {
  'workflow.started':    'workflow.started',
  'workflow.completed':  'workflow.completed',
  'workflow.halted':     'workflow.halted',
  'workflow.reshaped':   'workflow.reshaped',
  'node.started':        'node.started',
  'node.succeeded':      'node.succeeded',
  'node.failed':         'node.failed',
  'retry.fired':         'retry.fired',
  'retry.failed':        'retry.failed',
  'fallback.activated':  'fallback.activated',
  'fallback.failed':     'fallback.failed',
  'human.escalated':     'human.escalated',
}

const overallStatus = computed<'queued' | 'running' | 'completed' | 'halted'>(() => {
  if (isHalted.value) return 'halted'
  if (isComplete.value) return 'completed'
  if (isRunning.value) return 'running'
  return 'queued'
})

const overallStatusLabel = computed(() => {
  switch (overallStatus.value) {
    case 'running':   return 'Running'
    case 'completed': return 'Completed'
    case 'halted':    return 'Halted · human required'
    default:          return 'Ready'
  }
})

const overallStatusTone = computed(() => {
  switch (overallStatus.value) {
    case 'running':   return 'cyan'
    case 'completed': return 'cyan'
    case 'halted':    return 'red'
    default:          return 'mute'
  }
})

function selectEvent(id: EventId) {
  if (id === activeEventId.value) return
  // Clear the failure target whenever the workflow changes — node ids don't carry over.
  failureTarget.value = null
  activeEventId.value = id
}

function toggleExtension() {
  addExtension.value = !addExtension.value
}

function setFailureTarget(id: string | null) {
  failureTarget.value = failureTarget.value === id ? null : id
}

function replay() {
  run()
}
</script>

<template>
  <div class="bg-white text-ink">
    <!-- ----------------------------------------------------------------- -->
    <!-- Header                                                            -->
    <!-- ----------------------------------------------------------------- -->
    <header
      class="flex flex-col gap-4 border-b border-line p-4 sm:p-5 md:p-7 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          <span class="dot" />
          Workflow Orchestrator
        </div>
        <h3 class="mt-3 font-display text-[22px] sm:text-[24px] md:text-[28px] leading-[1.12] text-ink">
          When one event has to land in six systems.
        </h3>
        <p class="mt-2 max-w-xl text-[14.5px] leading-[1.55] text-mute">
          Fire an event on the left. Watch the orchestrator fan it out across the chain. Knock out a step
          to see retry, fallback, and human-escalation run with their reasons.
        </p>
      </div>

      <button
        type="button"
        class="group inline-flex items-center gap-2.5 self-start rounded-full border border-line bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        @click="replay"
      >
        <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-brand/15 ring-1 ring-cyan-brand/30 text-cyan-brand-deep">
          <RotateCcw :size="11" :stroke-width="2.4" aria-hidden="true" />
        </span>
        Replay run
      </button>
    </header>

    <!-- ----------------------------------------------------------------- -->
    <!-- Body grid: controls · graph · event log                            -->
    <!-- ----------------------------------------------------------------- -->
    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px]">
      <!-- LEFT: controls -->
      <div class="border-b border-line lg:border-b-0 lg:border-r p-4 sm:p-5 md:p-6 space-y-7">
        <!-- Event picker -->
        <div>
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Fire an event
          </div>
          <p class="mt-1 text-[12.5px] text-mute-2">
            Each event has its own downstream chain.
          </p>

          <div class="mt-3 space-y-1.5">
            <button
              v-for="w in WORKFLOWS"
              :key="w.id"
              type="button"
              :aria-pressed="activeEventId === w.id"
              :class="[
                'group flex w-full items-start gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                activeEventId === w.id
                  ? 'border-cyan-brand/50 ring-1 ring-cyan-brand/20 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.18)]'
                  : 'border-line hover:border-cyan-brand/35',
              ]"
              @click="selectEvent(w.id)"
            >
              <span
                :class="[
                  'inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-lg ring-1 transition-colors',
                  activeEventId === w.id
                    ? 'bg-cyan-brand/12 text-cyan-brand-deep ring-cyan-brand/25'
                    : 'bg-surface-alt text-mute-2 ring-line group-hover:text-cyan-brand-deep',
                ]"
                aria-hidden="true"
              >
                <component :is="w.icon" :size="15" :stroke-width="1.9" />
              </span>
              <span class="flex-1 min-w-0">
                <span class="block text-[13.5px] font-semibold leading-tight text-ink">
                  {{ w.label }}
                </span>
                <span class="mt-0.5 block text-[12px] leading-snug text-mute truncate">
                  {{ w.detail }}
                </span>
              </span>
            </button>
          </div>
        </div>

        <!-- Extend workflow toggle -->
        <div>
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Extend workflow
          </div>
          <button
            type="button"
            :aria-pressed="addExtension"
            class="mt-2.5 flex w-full items-start justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-left transition-colors hover:border-cyan-brand/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            @click="toggleExtension"
          >
            <span class="flex-1">
              <span class="block text-[13.5px] font-semibold leading-tight text-ink">
                + {{ activeWorkflow.extension.node.label }}
              </span>
              <span class="mt-0.5 block text-[12px] leading-snug text-mute">
                Spliced after step {{ activeWorkflow.extension.afterIndex + 1 }} on the next run.
              </span>
            </span>
            <span
              :class="[
                'relative inline-block h-5 w-9 shrink-0 rounded-full border transition-colors',
                addExtension
                  ? 'border-cyan-brand-deep/30 bg-cyan-brand'
                  : 'border-line bg-surface-alt',
              ]"
              aria-hidden="true"
            >
              <span
                :class="[
                  'absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                  addExtension ? 'translate-x-4' : 'translate-x-0.5',
                ]"
              />
            </span>
          </button>
        </div>

        <!-- Failure simulator -->
        <div>
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Knock out a step
          </div>
          <p class="mt-1 text-[12.5px] text-mute-2">
            The next run will retry, fall back, then escalate.
          </p>

          <div class="mt-2.5 space-y-1">
            <button
              v-for="n in activeNodes"
              :key="n.id"
              type="button"
              :aria-pressed="failureTarget === n.id"
              :class="[
                'flex w-full items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5 text-left text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                failureTarget === n.id
                  ? 'border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]'
                  : 'border-line text-ink hover:border-[#FCA5A5]/60',
              ]"
              @click="setFailureTarget(n.id)"
            >
              <span
                :class="[
                  'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1',
                  failureTarget === n.id
                    ? 'bg-[#DC2626] text-white ring-[#DC2626]'
                    : 'bg-white text-mute-2 ring-line',
                ]"
                aria-hidden="true"
              >
                <AlertTriangle v-if="failureTarget === n.id" :size="9" :stroke-width="2.6" />
              </span>
              <span class="truncate font-medium">{{ n.label }}</span>
            </button>
            <button
              v-if="failureTarget"
              type="button"
              class="mt-1 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-mute-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              @click="failureTarget = null"
            >
              Clear failure
            </button>
          </div>
        </div>
      </div>

      <!-- CENTER: graph -->
      <div class="border-b border-line lg:border-b-0 lg:border-r p-4 sm:p-5 md:p-6 bg-surface-alt/30">
        <div class="flex items-center justify-between gap-3">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            <WorkflowIcon :size="13" :stroke-width="2" aria-hidden="true" />
            Workflow graph
          </div>
          <div
            :class="[
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold',
              overallStatusTone === 'cyan'
                ? 'border-cyan-brand/30 bg-cyan-brand/12 text-cyan-brand-deep'
                : overallStatusTone === 'red'
                ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
                : 'border-line bg-white text-mute-2',
            ]"
          >
            <span
              :class="[
                'h-1.5 w-1.5 rounded-full',
                overallStatusTone === 'cyan'
                  ? 'bg-cyan-brand'
                  : overallStatusTone === 'red'
                  ? 'bg-[#DC2626]'
                  : 'bg-mute-2',
                overallStatus === 'running' ? 'animate-pulse' : '',
              ]"
              aria-hidden="true"
            />
            {{ overallStatusLabel }}
          </div>
        </div>

        <!-- Event chip on top of the chain -->
        <div class="mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 max-w-full rounded-2xl border border-line bg-white px-3 py-1.5">
          <component :is="activeWorkflow.icon" :size="14" :stroke-width="1.9" class="text-cyan-brand-deep shrink-0" aria-hidden="true" />
          <span class="text-[12.5px] font-semibold text-ink">{{ activeWorkflow.label }}</span>
          <span class="text-[12px] text-mute-2 hidden sm:inline">·</span>
          <span class="text-[12px] text-mute">{{ activeWorkflow.detail }}</span>
        </div>

        <!-- Node chain -->
        <ol class="mt-4 space-y-2">
          <li v-for="(node, i) in activeNodes" :key="node.id">
            <div
              :class="[
                'rounded-xl border bg-white p-3.5 transition-all duration-300',
                statusClasses(nodeStatus[node.id]).card,
              ]"
            >
              <div class="flex items-start gap-3">
                <span
                  :class="[
                    'relative inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-lg ring-1',
                    statusClasses(nodeStatus[node.id]).iconBg,
                    statusClasses(nodeStatus[node.id]).iconRing,
                  ]"
                  aria-hidden="true"
                >
                  <component
                    :is="node.icon"
                    :size="17"
                    :stroke-width="1.9"
                    :class="statusClasses(nodeStatus[node.id]).iconText"
                  />
                  <span
                    v-if="nodeStatus[node.id] === 'running'"
                    class="absolute inset-0 rounded-lg ring-2 ring-cyan-brand/40 animate-ping"
                    aria-hidden="true"
                  />
                </span>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-[10.5px] font-mono font-semibold text-mute-2">
                          {{ String(i + 1).padStart(2, '0') }}
                        </span>
                        <span class="text-[14px] font-semibold leading-tight text-ink">
                          {{ node.label }}
                        </span>
                      </div>
                      <div class="mt-0.5 text-[12px] text-mute">
                        {{ node.system }}
                      </div>
                    </div>

                    <span
                      :class="[
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] ring-1',
                        statusClasses(nodeStatus[node.id]).chipBg,
                        statusClasses(nodeStatus[node.id]).chipText,
                        statusClasses(nodeStatus[node.id]).chipRing,
                      ]"
                    >
                      <component
                        :is="STATUS_ICON[nodeStatus[node.id] ?? 'queued']"
                        :size="10"
                        :stroke-width="2.4"
                        :class="[
                          nodeStatus[node.id] === 'running' ? 'animate-spin' : '',
                          nodeStatus[node.id] === 'retrying' ? 'animate-spin' : '',
                        ]"
                        aria-hidden="true"
                      />
                      {{ STATUS_LABEL[nodeStatus[node.id] ?? 'queued'] }}
                    </span>
                  </div>

                  <p
                    v-if="nodeTrace[node.id]"
                    :class="[
                      'mt-2 text-[12.5px] leading-snug',
                      nodeStatus[node.id] === 'escalated'
                        ? 'text-[#B91C1C]'
                        : nodeStatus[node.id] === 'failed'
                        ? 'text-[#DC2626]'
                        : nodeStatus[node.id] === 'retrying'
                        ? 'text-[#B45309]'
                        : 'text-mute',
                    ]"
                  >
                    {{ nodeTrace[node.id] }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Connector -->
            <div
              v-if="i < activeNodes.length - 1"
              class="flex justify-center py-1"
              aria-hidden="true"
            >
              <span
                :class="[
                  'block h-3 w-px transition-colors',
                  nodeStatus[node.id] === 'done' || nodeStatus[node.id] === 'running' || nodeStatus[node.id] === 'retrying'
                    ? 'bg-cyan-brand/50'
                    : nodeStatus[node.id] === 'failed' || nodeStatus[node.id] === 'escalated'
                    ? 'bg-[#FCA5A5]'
                    : 'bg-line',
                ]"
              />
            </div>
          </li>
        </ol>
      </div>

      <!-- RIGHT: event log -->
      <div class="p-4 sm:p-5 md:p-6 bg-surface-alt/40">
        <div class="flex items-center justify-between gap-3">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Live event log
          </div>
          <span class="text-[11px] text-mute-2 tabular-nums">
            {{ eventLog.length }} {{ eventLog.length === 1 ? 'signal' : 'signals' }}
          </span>
        </div>

        <ol
          class="mt-3 max-h-[480px] lg:max-h-[560px] overflow-y-auto pr-1 space-y-1.5"
          aria-live="polite"
        >
          <li
            v-for="entry in eventLog"
            :key="entry.id"
            class="rounded-lg border border-line bg-white px-2.5 py-2"
          >
            <div class="flex items-center gap-1.5">
              <span
                :class="[
                  'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded',
                  logTone(entry.kind) === 'cyan'
                    ? 'bg-cyan-brand/15 text-cyan-brand-deep'
                    : logTone(entry.kind) === 'amber'
                    ? 'bg-[#FFFBEB] text-[#B45309]'
                    : logTone(entry.kind) === 'red'
                    ? 'bg-[#FEF2F2] text-[#DC2626]'
                    : 'bg-surface-alt text-mute-2',
                ]"
                aria-hidden="true"
              >
                <component :is="LOG_ICON[entry.kind]" :size="10" :stroke-width="2.4" />
              </span>
              <code class="text-[10.5px] font-mono text-mute-2 tabular-nums">{{ entry.ts }}</code>
              <code
                :class="[
                  'text-[10.5px] font-mono font-semibold',
                  logTone(entry.kind) === 'cyan'
                    ? 'text-cyan-brand-deep'
                    : logTone(entry.kind) === 'amber'
                    ? 'text-[#B45309]'
                    : logTone(entry.kind) === 'red'
                    ? 'text-[#DC2626]'
                    : 'text-mute-2',
                ]"
              >
                {{ LOG_LABEL[entry.kind] }}
              </code>
            </div>
            <div v-if="entry.nodeLabel" class="mt-1 text-[12px] font-semibold text-ink leading-snug">
              {{ entry.nodeLabel }}
            </div>
            <div class="mt-0.5 text-[11.5px] text-mute leading-snug">
              {{ entry.detail }}
            </div>
          </li>
          <li v-if="!eventLog.length" class="rounded-lg border border-dashed border-line bg-white px-3 py-4 text-center text-[12px] text-mute-2">
            Waiting on the next signal…
          </li>
        </ol>
      </div>
    </div>

    <!-- ----------------------------------------------------------------- -->
    <!-- Bottom: "what would this take by hand" overlay                    -->
    <!-- ----------------------------------------------------------------- -->
    <div class="border-t border-line bg-surface-alt/40 p-4 sm:p-5 md:p-7">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            What this would take by hand
          </div>
          <p class="mt-1.5 text-[13px] text-mute max-w-2xl">
            Same event, no orchestrator. Different people in different tools, with the handoffs living in inboxes —
            and the one that gets forgotten is the one that costs the most.
          </p>
        </div>
        <div class="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-cyan-brand/25 bg-cyan-brand/10 px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
          <Zap :size="11" :stroke-width="2.4" aria-hidden="true" />
          Engine · ~3 seconds, end to end
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="rounded-xl border border-line bg-white p-3.5">
          <div class="flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
            <Users :size="12" :stroke-width="2" aria-hidden="true" />
            People involved
          </div>
          <div class="mt-1.5 font-display text-[28px] leading-[1.05] text-ink">
            {{ activeWorkflow.manual.people }}
          </div>
          <div class="mt-0.5 text-[12px] text-mute">
            across departments
          </div>
        </div>
        <div class="rounded-xl border border-line bg-white p-3.5">
          <div class="flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
            <Wrench :size="12" :stroke-width="2" aria-hidden="true" />
            Tools to jump between
          </div>
          <div class="mt-1.5 font-display text-[28px] leading-[1.05] text-ink">
            {{ activeWorkflow.manual.tools }}
          </div>
          <div class="mt-0.5 text-[12px] text-mute">
            SaaS apps, sheets, inboxes
          </div>
        </div>
        <div class="rounded-xl border border-line bg-white p-3.5">
          <div class="flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
            <Timer :size="12" :stroke-width="2" aria-hidden="true" />
            Time elapsed
          </div>
          <div class="mt-1.5 font-display text-[28px] leading-[1.05] text-ink">
            {{ activeWorkflow.manual.elapsed }}
          </div>
          <div class="mt-0.5 text-[12px] text-mute">
            from event to last system updated
          </div>
        </div>
        <div class="rounded-xl border border-[#FECACA] bg-white p-3.5">
          <div class="flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-[#DC2626]">
            <AlertTriangle :size="12" :stroke-width="2" aria-hidden="true" />
            What goes wrong
          </div>
          <div class="mt-1.5 text-[13px] leading-snug text-ink">
            {{ activeWorkflow.manual.risk }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
