<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { AlertTriangle, ArrowRight, Award, BarChart3, Boxes, Cable, CalendarCheck, CalendarClock, CheckCircle2, ChevronRight, CreditCard, FileText, GitBranch, LifeBuoy, Megaphone, MessageSquare, Plus, Receipt, RotateCw, ShoppingCart, Sparkles, Star, Trash2, Truck, Users, Workflow, X, Zap } from '@lucide/vue'

type ToolId = string
type CompareTriggerKey = 'booking' | 'order' | 'lead'
type TriggerKey = CompareTriggerKey | 'outage'

interface ToolKind {
  key: string
  name: string
  category: string
  icon: Component
  /** Events this tool emits (verbs other tools can listen to). */
  emits: string[]
  /** Actions this tool can perform when an inbound bridge fires. */
  actions: string[]
}

interface ToolNode {
  id: ToolId
  kindKey: string
  x: number
  y: number
}

interface Bridge {
  id: string
  from: ToolId
  to: ToolId
  trigger: string
  action: string
}

interface LogEntry {
  id: number
  kind: 'emit' | 'fire' | 'note' | 'retry'
  origin?: ToolId
  bridgeId?: string
  title: string
  body: string
  at: string
}

interface ActivePacket {
  id: number
  bridgeId: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

interface BeforeStep {
  id: number
  at: string
  who: string
  text: string
}

// ---- canvas + chip geometry -----------------------------------------------

const CANVAS_W = 880
const CANVAS_H = 460
const CHIP_W = 116
const CHIP_H = 76

// Compare-canvas dimensions (fixed pixel size, scaled down from CANVAS_W/H so
// offset-path on packets and absolute chip positions all live in the same
// pixel coordinate system).
const COMPARE_W = 520
const COMPARE_H = 272
const COMPARE_SCALE = COMPARE_W / CANVAS_W
const COMPARE_CHIP_W = CHIP_W * COMPARE_SCALE
const COMPARE_CHIP_H = CHIP_H * COMPARE_SCALE
function cx(v: number) { return v * COMPARE_SCALE }

// ---- tool kinds (the 8 built-in + addable templates) -----------------------

const TOOL_KINDS: Record<string, ToolKind> = {
  booking: {
    key: 'booking',
    name: 'Booking',
    category: 'Customer',
    icon: CalendarCheck,
    emits: ['booking.created', 'booking.cancelled', 'booking.modified'],
    actions: ['create booking', 'cancel booking', 'attach note'],
  },
  accounting: {
    key: 'accounting',
    name: 'Accounting',
    category: 'Finance',
    icon: Receipt,
    emits: ['invoice.drafted', 'payment.posted', 'refund.issued'],
    actions: ['draft invoice', 'post payment', 'issue refund', 'tag transaction'],
  },
  crm: {
    key: 'crm',
    name: 'CRM',
    category: 'Customer',
    icon: Users,
    emits: ['contact.upserted', 'lead.created', 'segment.changed'],
    actions: ['upsert contact', 'create lead', 'add to segment', 'log activity'],
  },
  ecommerce: {
    key: 'ecommerce',
    name: 'E-commerce',
    category: 'Customer',
    icon: ShoppingCart,
    emits: ['order.placed', 'cart.abandoned', 'stock.updated'],
    actions: ['create order', 'tag customer', 'flag fraud'],
  },
  inventory: {
    key: 'inventory',
    name: 'Inventory',
    category: 'Operations',
    icon: Boxes,
    emits: ['stock.changed', 'item.lowstock', 'item.received'],
    actions: ['decrement stock', 'reserve stock', 'reorder item', 'flag short'],
  },
  helpdesk: {
    key: 'helpdesk',
    name: 'Helpdesk',
    category: 'Support',
    icon: LifeBuoy,
    emits: ['ticket.opened', 'ticket.escalated', 'ticket.closed'],
    actions: ['open ticket', 'escalate', 'attach note', 'close ticket'],
  },
  calendar: {
    key: 'calendar',
    name: 'Calendar',
    category: 'Operations',
    icon: CalendarClock,
    emits: ['slot.blocked', 'event.created', 'attendee.confirmed'],
    actions: ['block slot', 'send invite', 'release slot', 'remind attendee'],
  },
  marketing: {
    key: 'marketing',
    name: 'Marketing',
    category: 'Customer',
    icon: Megaphone,
    emits: ['lead.captured', 'campaign.sent', 'segment.tagged'],
    actions: ['add to nurture', 'send campaign', 'remove from list', 'tag audience'],
  },
  // Addable templates
  reviews: {
    key: 'reviews',
    name: 'Reviews',
    category: 'Customer',
    icon: Star,
    emits: ['review.received', 'review.requested'],
    actions: ['request review', 'attach review', 'flag negative'],
  },
  loyalty: {
    key: 'loyalty',
    name: 'Loyalty',
    category: 'Customer',
    icon: Award,
    emits: ['points.awarded', 'reward.redeemed'],
    actions: ['award points', 'redeem reward', 'enroll member'],
  },
  analytics: {
    key: 'analytics',
    name: 'Analytics',
    category: 'Operations',
    icon: BarChart3,
    emits: ['event.tracked', 'cohort.entered'],
    actions: ['log event', 'increment counter', 'create cohort'],
  },
  sms: {
    key: 'sms',
    name: 'SMS',
    category: 'Customer',
    icon: MessageSquare,
    emits: ['sms.delivered', 'sms.reply'],
    actions: ['send SMS', 'add to campaign'],
  },
  quoting: {
    key: 'quoting',
    name: 'Quoting',
    category: 'Finance',
    icon: FileText,
    emits: ['quote.drafted', 'quote.sent', 'quote.accepted'],
    actions: ['draft quote', 'send quote', 'mark accepted'],
  },
  payments: {
    key: 'payments',
    name: 'Payments',
    category: 'Finance',
    icon: CreditCard,
    emits: ['payment.received', 'payout.scheduled', 'chargeback.opened'],
    actions: ['charge card', 'refund payment', 'reconcile payout'],
  },
  shipping: {
    key: 'shipping',
    name: 'Shipping',
    category: 'Operations',
    icon: Truck,
    emits: ['shipment.created', 'parcel.scanned', 'delivery.confirmed'],
    actions: ['create label', 'request pickup', 'notify customer'],
  },
}

const ADDABLE_KEYS = ['reviews', 'loyalty', 'analytics', 'sms', 'quoting', 'payments', 'shipping']

// Which actions emit a downstream event (so cascades happen)?
const ACTION_EMITS: Record<string, string | null> = {
  'upsert contact': 'contact.upserted',
  'create lead': 'lead.created',
  'add to segment': 'segment.changed',
  'log activity': null,
  'open ticket': 'ticket.opened',
  'decrement stock': 'stock.changed',
  'reserve stock': 'stock.changed',
  'draft invoice': null,
  'post payment': 'payment.posted',
  'block slot': null,
  'send invite': null,
  'add to nurture': null,
  'send campaign': 'campaign.sent',
  'create booking': 'booking.created',
  'attach review': 'review.received',
  'award points': 'points.awarded',
  'log event': null,
  'send SMS': 'sms.delivered',
  'draft quote': null,
}

// ---- initial layout & bridges ---------------------------------------------

function id(prefix: string, n: number) {
  return `${prefix}-${n}`
}

const INITIAL_NODES: ToolNode[] = [
  { id: 'booking',    kindKey: 'booking',    x: 80,  y: 40 },
  { id: 'marketing',  kindKey: 'marketing',  x: 80,  y: 192 },
  { id: 'ecommerce',  kindKey: 'ecommerce',  x: 80,  y: 344 },
  { id: 'helpdesk',   kindKey: 'helpdesk',   x: 382, y: 40 },
  { id: 'crm',        kindKey: 'crm',        x: 382, y: 192 },
  { id: 'calendar',   kindKey: 'calendar',   x: 684, y: 40 },
  { id: 'accounting', kindKey: 'accounting', x: 684, y: 192 },
  { id: 'inventory',  kindKey: 'inventory',  x: 684, y: 344 },
]

function mkBridge(
  bid: string,
  from: ToolId,
  to: ToolId,
  trigger: string,
  action: string,
): Bridge {
  return { id: bid, from, to, trigger, action }
}

const INITIAL_BRIDGES: Bridge[] = [
  mkBridge('b1',  'booking',   'crm',        'booking.created',  'upsert contact'),
  mkBridge('b2',  'booking',   'accounting', 'booking.created',  'draft invoice'),
  mkBridge('b3',  'booking',   'calendar',   'booking.created',  'block slot'),
  mkBridge('b4',  'ecommerce', 'inventory',  'order.placed',     'decrement stock'),
  mkBridge('b5',  'ecommerce', 'accounting', 'order.placed',     'draft invoice'),
  mkBridge('b6',  'ecommerce', 'crm',        'order.placed',     'upsert contact'),
  mkBridge('b7',  'marketing', 'crm',        'lead.captured',    'create lead'),
  mkBridge('b8',  'helpdesk',  'crm',        'ticket.opened',    'log activity'),
  mkBridge('b9',  'crm',       'marketing',  'contact.upserted', 'add to nurture'),
  mkBridge('b10', 'crm',       'marketing',  'lead.created',     'add to nurture'),
]

// ---- reactive state -------------------------------------------------------

const nodes = ref<ToolNode[]>(JSON.parse(JSON.stringify(INITIAL_NODES)))
const bridges = ref<Bridge[]>(JSON.parse(JSON.stringify(INITIAL_BRIDGES)))

const mounted = ref(false)
const view = ref<'hub' | 'compare'>('hub')

const log = ref<LogEntry[]>([])
let logId = 1
function pushLog(entry: Omit<LogEntry, 'id' | 'at'>, at?: string) {
  log.value.unshift({ ...entry, id: logId++, at: at ?? nowLabel() })
  if (log.value.length > 14) log.value.length = 14
}

let nowSec = 0
function resetClock() {
  nowSec = 0
}
function nowLabel() {
  const ms = Math.floor(nowSec)
  if (ms < 1000) return `+${ms}ms`
  return `+${(ms / 1000).toFixed(2)}s`
}

// Active event packets currently animating along bridges
const packets = ref<ActivePacket[]>([])
let packetId = 1

// Highlight state for tools while events are flying
const flashingTool = ref<Set<ToolId>>(new Set())
function flashTool(id: ToolId, duration = 700) {
  flashingTool.value.add(id)
  flashingTool.value = new Set(flashingTool.value)
  setTimeout(() => {
    flashingTool.value.delete(id)
    flashingTool.value = new Set(flashingTool.value)
  }, duration)
}

// ---- derived --------------------------------------------------------------

const nodeById = computed<Record<ToolId, ToolNode>>(() => {
  const m: Record<ToolId, ToolNode> = {}
  for (const n of nodes.value) m[n.id] = n
  return m
})

function kindOf(n: ToolNode) {
  return TOOL_KINDS[n.kindKey]!
}
function kindByKey(k: string): ToolKind {
  return TOOL_KINDS[k]!
}

function nodeCenter(n: ToolNode) {
  return { x: n.x + CHIP_W / 2, y: n.y + CHIP_H / 2 }
}

const bridgePaths = computed(() =>
  bridges.value.map((b) => {
    const f = nodeById.value[b.from]
    const t = nodeById.value[b.to]
    if (!f || !t) return null
    const a = nodeCenter(f)
    const c = nodeCenter(t)
    // Offset the path slightly perpendicular to its direction so bidirectional
    // edges don't overlap. Hash the bridge id for a stable offset sign.
    const hash = b.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const sign = (hash + (b.from < b.to ? 0 : 1)) % 2 === 0 ? 1 : -1
    const dx = c.x - a.x
    const dy = c.y - a.y
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy))
    const off = 14 * sign
    const mx = (a.x + c.x) / 2 + (-dy / len) * off
    const my = (a.y + c.y) / 2 + (dx / len) * off
    const d = `M ${a.x} ${a.y} Q ${mx} ${my} ${c.x} ${c.y}`
    return { bridge: b, d, ax: a.x, ay: a.y, cx: c.x, cy: c.y, mx, my }
  }).filter((p): p is NonNullable<typeof p> => p !== null),
)

// ---- drag a node ----------------------------------------------------------

const draggingNodeId = ref<ToolId | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const dragOffset = { dx: 0, dy: 0 }
let pointerId: number | null = null

function onNodePointerDown(e: PointerEvent, n: ToolNode) {
  if (connectMode.value) return
  // Don't start a drag if user clicked the connect handle (it stops propagation)
  const target = e.target as HTMLElement
  if (target.closest('[data-handle]')) return
  draggingNodeId.value = n.id
  pointerId = e.pointerId
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  dragOffset.dx = e.clientX - rect.left
  dragOffset.dy = e.clientY - rect.top
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onNodePointerMove(e: PointerEvent, n: ToolNode) {
  if (draggingNodeId.value !== n.id || !canvasRef.value) return
  const canvasRect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - canvasRect.left - dragOffset.dx
  const y = e.clientY - canvasRect.top - dragOffset.dy
  n.x = Math.max(0, Math.min(CANVAS_W - CHIP_W, x))
  n.y = Math.max(0, Math.min(CANVAS_H - CHIP_H, y))
}
function onNodePointerUp(e: PointerEvent) {
  if (pointerId !== null) {
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(pointerId)
    } catch {
      // pointer already released
    }
  }
  draggingNodeId.value = null
  pointerId = null
}

// ---- connect-mode: draw a bridge ------------------------------------------

const connectMode = ref(false)
const connectFromId = ref<ToolId | null>(null)

function startConnectFrom(n: ToolNode) {
  connectFromId.value = n.id
  connectMode.value = true
}
function cancelConnect() {
  connectMode.value = false
  connectFromId.value = null
}

function onNodeClick(n: ToolNode) {
  if (!connectMode.value || !connectFromId.value) return
  if (n.id === connectFromId.value) {
    cancelConnect()
    return
  }
  // Open bridge configuration modal
  openBridgeModal(connectFromId.value, n.id)
  cancelConnect()
}

// ESC cancels connect mode
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (bridgeModalOpen.value) closeBridgeModal()
    else if (addToolOpen.value) addToolOpen.value = false
    else if (connectMode.value) cancelConnect()
  }
}

onMounted(() => {
  mounted.value = true
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})

// ---- bridge configuration modal -------------------------------------------

const bridgeModalOpen = ref(false)
const bridgeFromId = ref<ToolId | null>(null)
const bridgeToId = ref<ToolId | null>(null)
const draftTrigger = ref('')
const draftAction = ref('')
let nextBridgeNum = 11

function openBridgeModal(from: ToolId, to: ToolId) {
  const fromKind = TOOL_KINDS[nodeById.value[from]!.kindKey]!
  const toKind = TOOL_KINDS[nodeById.value[to]!.kindKey]!
  bridgeFromId.value = from
  bridgeToId.value = to
  draftTrigger.value = fromKind.emits[0] ?? ''
  draftAction.value = toKind.actions[0] ?? ''
  bridgeModalOpen.value = true
}
function closeBridgeModal() {
  bridgeModalOpen.value = false
  bridgeFromId.value = null
  bridgeToId.value = null
}
function saveBridge() {
  if (!bridgeFromId.value || !bridgeToId.value) return
  const newBridge: Bridge = {
    id: `b${nextBridgeNum++}`,
    from: bridgeFromId.value,
    to: bridgeToId.value,
    trigger: draftTrigger.value,
    action: draftAction.value,
  }
  bridges.value.push(newBridge)
  pushLog({
    kind: 'note',
    title: 'New bridge wired',
    body: `${TOOL_KINDS[nodeById.value[newBridge.from]!.kindKey]!.name} → ${TOOL_KINDS[nodeById.value[newBridge.to]!.kindKey]!.name}: when ${newBridge.trigger}, ${newBridge.action}.`,
  })
  closeBridgeModal()
}

function deleteBridge(bid: string) {
  const b = bridges.value.find((x) => x.id === bid)
  if (!b) return
  bridges.value = bridges.value.filter((x) => x.id !== bid)
  pushLog({
    kind: 'note',
    title: 'Bridge removed',
    body: `${TOOL_KINDS[nodeById.value[b.from]?.kindKey ?? '']?.name ?? '—'} → ${TOOL_KINDS[nodeById.value[b.to]?.kindKey ?? '']?.name ?? '—'} disconnected.`,
  })
}

// ---- add a tool -----------------------------------------------------------

const addToolOpen = ref(false)
function openAddTool() {
  addToolOpen.value = true
}
function addToolFromTemplate(kindKey: string) {
  const kind = TOOL_KINDS[kindKey]!
  // Find an open spot near the CRM (center). Cycle through a few offsets.
  const baseX = 540
  const baseY = 344
  const offsetSlots = [
    { x: baseX,        y: baseY },
    { x: baseX + 140,  y: baseY - 80 },
    { x: baseX - 140,  y: baseY + 30 },
    { x: baseX + 200,  y: baseY + 30 },
    { x: baseX - 220,  y: baseY - 80 },
  ]
  const existingKinds = nodes.value.map((n) => n.kindKey)
  // Cycle through the offset slots, nudging each cycle by ~18px so chips
  // added past the first cycle don't perfectly stack on the previous ones.
  const addedCount = Math.max(0, nodes.value.length - 8)
  const slotIdx = addedCount % offsetSlots.length
  const cycle = Math.floor(addedCount / offsetSlots.length)
  const baseSlot = offsetSlots[slotIdx]!
  const jitter = cycle * 18
  const pos = {
    x: Math.max(0, Math.min(CANVAS_W - CHIP_W, baseSlot.x + jitter)),
    y: Math.max(0, Math.min(CANVAS_H - CHIP_H, baseSlot.y + jitter)),
  }
  // Generate a unique id: kindKey + suffix if needed
  let nid: ToolId = kindKey
  if (existingKinds.includes(kindKey)) {
    let i = 2
    while (nodes.value.some((n) => n.id === `${kindKey}-${i}`)) i++
    nid = `${kindKey}-${i}`
  }
  nodes.value.push({ id: nid, kindKey, x: pos.x, y: pos.y })
  pushLog({
    kind: 'note',
    title: `${kind.name} added to the hub`,
    body: 'Wire it up by clicking the + handle and choosing a target.',
  })
  addToolOpen.value = false
  // Briefly flash the new node
  nextTick(() => flashTool(nid, 1100))
}

// ---- trigger an event -----------------------------------------------------

interface TriggerDef {
  key: TriggerKey
  label: string
  shortLabel: string
  originId: ToolId
  eventName: string
  /** Friendly sample subject for the log */
  subject: string
}

const TRIGGERS: TriggerDef[] = [
  {
    key: 'booking',
    label: 'Simulate new booking',
    shortLabel: 'New booking',
    originId: 'booking',
    eventName: 'booking.created',
    subject: 'Lerato Mokoena · Thu 10:30',
  },
  {
    key: 'order',
    label: 'Simulate new order',
    shortLabel: 'New order',
    originId: 'ecommerce',
    eventName: 'order.placed',
    subject: 'Order #29841 · R 4,260',
  },
  {
    key: 'lead',
    label: 'Simulate new lead',
    shortLabel: 'New lead',
    originId: 'marketing',
    eventName: 'lead.captured',
    subject: 'Adriaan Smit · Cape Bulk Handling',
  },
  {
    key: 'outage',
    label: 'Simulate booking · Accounting outage',
    shortLabel: 'Booking · outage',
    originId: 'booking',
    eventName: 'booking.created',
    subject: 'Lerato Mokoena · Thu 10:30',
  },
]

// The accounting outage trigger reuses the booking event but the hub
// pretends accounting is briefly down. The bridge into accounting fails
// once, queues, then retries successfully — the rest of the cascade is
// unaffected. Set per-fire by `fireTrigger`.
const failingToolForFire = ref<ToolId | null>(null)

const firing = ref(false)
const lastTrigger = ref<TriggerKey | null>(null)

const RETRY_DELAY_MS = 1400

async function fireTrigger(trig: TriggerDef) {
  if (firing.value) return
  if (!nodeById.value[trig.originId]) return
  firing.value = true
  lastTrigger.value = trig.key
  failingToolForFire.value = trig.key === 'outage' ? 'accounting' : null
  resetClock()
  pushLog({
    kind: 'emit',
    origin: trig.originId,
    title: `${TOOL_KINDS[nodeById.value[trig.originId]!.kindKey]!.name} · ${trig.eventName}`,
    body: `Emitted by source · ${trig.subject}`,
  })
  flashTool(trig.originId, 900)

  // BFS through bridges, deduping fired edges
  const firedEdges = new Set<string>()
  // queue of {fromId, eventName, atMs}
  const queue: { fromId: ToolId; eventName: string; atMs: number }[] = [
    { fromId: trig.originId, eventName: trig.eventName, atMs: 0 },
  ]
  let lastWaveEndsAt = 0

  while (queue.length > 0) {
    const { fromId, eventName, atMs } = queue.shift()!
    const outgoing = bridges.value.filter(
      (b) => b.from === fromId && b.trigger === eventName,
    )
    for (const b of outgoing) {
      if (firedEdges.has(b.id)) continue
      firedEdges.add(b.id)
      const hopDelay = 220 + Math.floor(Math.random() * 80)
      const fireAt = atMs + hopDelay
      const willRetry = b.to === failingToolForFire.value
      scheduleHop(b, fireAt, trig, willRetry)
      const tailMs = willRetry ? RETRY_DELAY_MS + 820 : 820
      lastWaveEndsAt = Math.max(lastWaveEndsAt, fireAt + tailMs)
      const emitted = ACTION_EMITS[b.action] ?? null
      if (emitted) {
        // Cascade waits for the (retried) success before continuing.
        const cascadeAt = fireAt + (willRetry ? RETRY_DELAY_MS : 0) + 200
        queue.push({ fromId: b.to, eventName: emitted, atMs: cascadeAt })
      }
    }
  }

  if (lastWaveEndsAt === 0) {
    // No outgoing bridges — note it
    pushLog({
      kind: 'note',
      title: 'No outgoing bridges',
      body: `Nothing listens to ${trig.eventName} from this tool yet. Click the + handle on the source tool to wire one.`,
    })
  }

  // Clear "firing" flag a little after the last packet lands
  setTimeout(() => {
    firing.value = false
    failingToolForFire.value = null
  }, lastWaveEndsAt + 200)
}

function firePacketAndLog(b: Bridge, atMs: number, trig: TriggerDef, retried: boolean) {
  const f = nodeById.value[b.from]
  const t = nodeById.value[b.to]
  if (!f || !t) return
  const a = nodeCenter(f)
  const c = nodeCenter(t)
  const pid = packetId++
  packets.value.push({
    id: pid,
    bridgeId: b.id,
    fromX: a.x,
    fromY: a.y,
    toX: c.x,
    toY: c.y,
  })
  nowSec = atMs
  pushLog({
    kind: 'fire',
    origin: b.from,
    bridgeId: b.id,
    title: `${TOOL_KINDS[nodeById.value[b.from]!.kindKey]!.name} → ${TOOL_KINDS[nodeById.value[b.to]!.kindKey]!.name}`,
    body: retried
      ? `${b.action} · subject: ${trig.subject} · retry succeeded`
      : `${b.action} · subject: ${trig.subject}`,
  })
  // Mid-flight target flash
  setTimeout(() => flashTool(b.to, 700), 500)
  // Remove the packet when its CSS animation ends
  setTimeout(() => {
    packets.value = packets.value.filter((p) => p.id !== pid)
  }, 860)
}

function scheduleHop(b: Bridge, atMs: number, trig: TriggerDef, willRetry: boolean) {
  setTimeout(() => {
    if (willRetry) {
      // First attempt fails; queue a retry.
      nowSec = atMs
      const targetName = TOOL_KINDS[nodeById.value[b.to]!.kindKey]!.name
      pushLog({
        kind: 'retry',
        origin: b.from,
        bridgeId: b.id,
        title: `${targetName} · 503 · queued for retry`,
        body: `${b.action} · subject: ${trig.subject} · retrying in ~${Math.round(RETRY_DELAY_MS / 100) / 10}s`,
      })
      setTimeout(() => {
        firePacketAndLog(b, atMs + RETRY_DELAY_MS, trig, true)
      }, RETRY_DELAY_MS)
    } else {
      firePacketAndLog(b, atMs, trig, false)
    }
  }, atMs)
}

// ---- before/after comparison ----------------------------------------------

const beforeSteps = ref<BeforeStep[]>([])
const afterSteps = ref<BeforeStep[]>([])
const afterPackets = ref<ActivePacket[]>([])
const compareFiring = ref(false)
const compareTrigger = ref<CompareTriggerKey>('booking')

// Compare view only handles the three "real" triggers — outage doesn't
// have a before-recipe and would be meaningless side-by-side.
const COMPARE_TRIGGERS = computed(() =>
  TRIGGERS.filter((t): t is TriggerDef & { key: CompareTriggerKey } => t.key !== 'outage'),
)

let stepIdCounter = 1

interface BeforeRecipe {
  steps: { who: string; afterSec: number; text: string }[]
  totalMinutes: number
  errorRate: string
}

const BEFORE_RECIPES: Record<CompareTriggerKey, BeforeRecipe> = {
  booking: {
    steps: [
      { who: 'Sue (admin)', afterSec: 240,  text: 'Sees booking email · opens CRM, types contact details' },
      { who: 'Sue (admin)', afterSec: 660,  text: 'Opens accounting, copies booking line, drafts invoice' },
      { who: 'Sue (admin)', afterSec: 1020, text: 'Opens internal calendar, blocks staff slot' },
      { who: 'Marie (marketing)', afterSec: 1560, text: 'Picks up handover note, adds contact to nurture list' },
    ],
    totalMinutes: 26,
    errorRate: 'a few bookings a month copied wrong',
  },
  order: {
    steps: [
      { who: 'Thandi (ops)',   afterSec: 180,  text: 'Sees order email · opens inventory, decrements stock by hand' },
      { who: 'Thandi (ops)',   afterSec: 540,  text: 'Opens accounting, retypes the order as an invoice' },
      { who: 'Thandi (ops)',   afterSec: 900,  text: 'Pastes customer details into CRM (missing two fields)' },
      { who: 'Lebo (finance)', afterSec: 1320, text: 'Reconciles invoice against stock movement the next morning' },
    ],
    totalMinutes: 22,
    errorRate: 'a handful of orders a week with the CRM out of sync',
  },
  lead: {
    steps: [
      { who: 'Marie (marketing)', afterSec: 300,  text: 'Sees the form notification · waits till morning to grab the lead' },
      { who: 'Marie (marketing)', afterSec: 780,  text: 'Re-types the lead into Pipedrive, tags the source by hand' },
      { who: 'Sales',             afterSec: 1320, text: 'Lead surfaces in Monday standup — three days late' },
      { who: 'Sales',             afterSec: 1740, text: 'Books follow-up call after another two days of email tag' },
    ],
    totalMinutes: 29,
    errorRate: 'half the leads die before sales calls them back',
  },
}

const COMPARE_NODES: ToolNode[] = INITIAL_NODES.map((n) => ({ ...n }))
const COMPARE_BRIDGES: Bridge[] = INITIAL_BRIDGES.map((b) => ({ ...b }))

function fmtMs(ms: number) {
  if (ms < 1000) return `+${ms}ms`
  return `+${(ms / 1000).toFixed(2)}s`
}
function fmtMin(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `T+${m}m` : `T+${m}m${s.toString().padStart(2, '0')}s`
}

let compareTimers: ReturnType<typeof setTimeout>[] = []

function clearCompareTimers() {
  for (const t of compareTimers) clearTimeout(t)
  compareTimers = []
}

function fireCompare(key: CompareTriggerKey) {
  if (compareFiring.value) return
  clearCompareTimers()
  compareFiring.value = true
  compareTrigger.value = key
  beforeSteps.value = []
  afterSteps.value = []
  afterPackets.value = []

  const trig = TRIGGERS.find((t) => t.key === key)!
  const recipe = BEFORE_RECIPES[key]

  // ---- BEFORE timeline: real-time scaled down so the demo finishes in a few seconds ----
  const beforeScale = 0.0035 // 1740 sec * 0.0035 = ~6s
  recipe.steps.forEach((s) => {
    const t = setTimeout(() => {
      beforeSteps.value.push({
        id: stepIdCounter++,
        at: fmtMin(s.afterSec),
        who: s.who,
        text: s.text,
      })
    }, s.afterSec * beforeScale * 1000)
    compareTimers.push(t)
  })
  // Final "done" line for before
  const tDone = setTimeout(() => {
    beforeSteps.value.push({
      id: stepIdCounter++,
      at: fmtMin(recipe.totalMinutes * 60),
      who: 'System',
      text: `Total: ${recipe.totalMinutes} minutes of staff time · ${recipe.errorRate}`,
    })
  }, (recipe.steps[recipe.steps.length - 1]!.afterSec + 60) * beforeScale * 1000)
  compareTimers.push(tDone)

  // ---- AFTER timeline ----
  // Pre-compute fire schedule against COMPARE_BRIDGES, deduped via BFS
  const firedEdges = new Set<string>()
  const queue: { fromId: ToolId; eventName: string; atMs: number }[] = [
    { fromId: trig.originId, eventName: trig.eventName, atMs: 0 },
  ]
  // Origin emission
  const t0 = setTimeout(() => {
    afterSteps.value.push({
      id: stepIdCounter++,
      at: fmtMs(0),
      who: TOOL_KINDS[trig.originId]!.name,
      text: `${trig.eventName} emitted · ${trig.subject}`,
    })
  }, 0)
  compareTimers.push(t0)

  let maxFireTime = 0
  while (queue.length > 0) {
    const { fromId, eventName, atMs } = queue.shift()!
    const outgoing = COMPARE_BRIDGES.filter(
      (b) => b.from === fromId && b.trigger === eventName,
    )
    for (const b of outgoing) {
      if (firedEdges.has(b.id)) continue
      firedEdges.add(b.id)
      const hopDelay = 220 + Math.floor(Math.random() * 80)
      const fireAt = atMs + hopDelay
      maxFireTime = Math.max(maxFireTime, fireAt)
      // Schedule the packet + log
      const fromNode = COMPARE_NODES.find((n) => n.id === b.from)!
      const toNode = COMPARE_NODES.find((n) => n.id === b.to)!
      const fA = { x: fromNode.x + CHIP_W / 2, y: fromNode.y + CHIP_H / 2 }
      const tC = { x: toNode.x + CHIP_W / 2, y: toNode.y + CHIP_H / 2 }
      const tx = setTimeout(() => {
        const pid = packetId++
        afterPackets.value.push({
          id: pid,
          bridgeId: b.id,
          fromX: fA.x, fromY: fA.y,
          toX: tC.x, toY: tC.y,
        })
        afterSteps.value.push({
          id: stepIdCounter++,
          at: fmtMs(fireAt),
          who: TOOL_KINDS[COMPARE_NODES.find((n) => n.id === b.to)!.kindKey]!.name,
          text: `${b.action} · via ${TOOL_KINDS[COMPARE_NODES.find((n) => n.id === b.from)!.kindKey]!.name}`,
        })
        setTimeout(() => {
          afterPackets.value = afterPackets.value.filter((p) => p.id !== pid)
        }, 860)
      }, fireAt + 200) // compress 1ms event time to 1ms playback (already small enough)
      compareTimers.push(tx)
      const emitted = ACTION_EMITS[b.action] ?? null
      if (emitted) {
        queue.push({ fromId: b.to, eventName: emitted, atMs: fireAt + 200 })
      }
    }
  }

  // Final after summary
  const tAfterDone = setTimeout(() => {
    afterSteps.value.push({
      id: stepIdCounter++,
      at: fmtMs(maxFireTime + 200),
      who: 'Hub',
      text: `Total: ${fmtMs(maxFireTime + 200)} elapsed · 0 staff time · audit trail attached`,
    })
  }, maxFireTime + 700)
  compareTimers.push(tAfterDone)

  // Release the firing flag after the longer of the two timelines
  const beforeEnd = (recipe.steps[recipe.steps.length - 1]!.afterSec + 60) * beforeScale * 1000
  const afterEnd = maxFireTime + 1500
  const tEnd = setTimeout(() => {
    compareFiring.value = false
  }, Math.max(beforeEnd, afterEnd))
  compareTimers.push(tEnd)
}

onBeforeUnmount(() => {
  clearCompareTimers()
})

// ---- bridges counter for the chip ------------------------------------------

const bridgeCount = computed(() => bridges.value.length)
const nodeCount = computed(() => nodes.value.length)

// Compute compact compare-canvas bridge paths (in scaled COMPARE coordinates
// so they live in the same pixel space as the chips and packets above).
const compareBridgePaths = computed(() =>
  COMPARE_BRIDGES.map((b) => {
    const fromNode = COMPARE_NODES.find((n) => n.id === b.from)!
    const toNode = COMPARE_NODES.find((n) => n.id === b.to)!
    const a = { x: cx(fromNode.x + CHIP_W / 2), y: cx(fromNode.y + CHIP_H / 2) }
    const c = { x: cx(toNode.x + CHIP_W / 2), y: cx(toNode.y + CHIP_H / 2) }
    const hash = b.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const sign = hash % 2 === 0 ? 1 : -1
    const dx = c.x - a.x, dy = c.y - a.y
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy))
    const off = 8 * sign
    const mx = (a.x + c.x) / 2 + (-dy / len) * off
    const my = (a.y + c.y) / 2 + (dx / len) * off
    return { bridge: b, d: `M ${a.x} ${a.y} Q ${mx} ${my} ${c.x} ${c.y}` }
  }),
)

// Cycle accent for new tool flashes
function isFlashing(id: ToolId) {
  return flashingTool.value.has(id)
}

// Watch the trigger to switch the comparison view automatically
watch(view, (v) => {
  if (v === 'compare') {
    // Auto-run the first comparison so the panel has content
    if (!compareFiring.value && beforeSteps.value.length === 0) {
      // Defer slightly so the layout settles
      setTimeout(() => fireCompare(compareTrigger.value), 250)
    }
  } else {
    clearCompareTimers()
    compareFiring.value = false
  }
})

// Helper for the bridge config modal "select" rendering
function emitsFor(id: ToolId | null): string[] {
  if (!id || !nodeById.value[id]) return []
  return TOOL_KINDS[nodeById.value[id]!.kindKey]!.emits
}
function actionsFor(id: ToolId | null): string[] {
  if (!id || !nodeById.value[id]) return []
  return TOOL_KINDS[nodeById.value[id]!.kindKey]!.actions
}
function toolNameOf(id: ToolId | null): string {
  if (!id || !nodeById.value[id]) return ''
  return TOOL_KINDS[nodeById.value[id]!.kindKey]!.name
}
function toolIconOf(id: ToolId | null): Component | null {
  if (!id || !nodeById.value[id]) return null
  return TOOL_KINDS[nodeById.value[id]!.kindKey]!.icon
}

// Reset everything to scaffolding state
function resetAll() {
  // Wipe in-flight fires + compare timelines so the reset is clean even if
  // the user clicked mid-cascade.
  clearCompareTimers()
  firing.value = false
  compareFiring.value = false
  failingToolForFire.value = null
  nodes.value = JSON.parse(JSON.stringify(INITIAL_NODES))
  bridges.value = JSON.parse(JSON.stringify(INITIAL_BRIDGES))
  log.value = []
  packets.value = []
  beforeSteps.value = []
  afterSteps.value = []
  afterPackets.value = []
  packetId = 1
  pushLog({
    kind: 'note',
    title: 'Hub reset',
    body: 'Eight tools, ten pre-wired bridges. Drag a tool, draw a bridge, fire a trigger.',
  })
}

</script>

<template>
  <div class="integration-hub relative bg-white text-ink">
    <!-- ===== Top toolbar ===== -->
    <header class="border-b border-line bg-surface-alt/60 px-4 sm:px-6 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3 min-w-0">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-brand/12 text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0" aria-hidden="true">
          <Cable :size="17" :stroke-width="1.9" />
        </span>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-display text-[18px] leading-none text-ink">Integration Hub</span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              <span class="h-1.5 w-1.5 rounded-full bg-cyan-brand" aria-hidden="true" />
              Example wiring
            </span>
          </div>
          <p class="mt-1 text-[12px] leading-tight text-mute truncate">
            {{ nodeCount }} tools · {{ bridgeCount }} bridges · drag a tool, draw a bridge, fire a trigger.
          </p>
        </div>
      </div>

      <div class="flex flex-col items-stretch sm:items-end gap-2">
        <div class="text-[10.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">View</div>
        <div role="tablist" aria-label="View" class="inline-flex rounded-xl border border-line bg-white p-1">
          <button
            type="button"
            role="tab"
            :aria-selected="view === 'hub'"
            class="px-3 py-1.5 text-[12.5px] font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 inline-flex items-center gap-1.5"
            :class="view === 'hub' ? 'bg-ink text-white' : 'text-mute hover:text-ink'"
            @click="view = 'hub'"
          >
            <Workflow :size="13" :stroke-width="2" />
            Hub
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="view === 'compare'"
            class="px-3 py-1.5 text-[12.5px] font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 inline-flex items-center gap-1.5"
            :class="view === 'compare' ? 'bg-ink text-white' : 'text-mute hover:text-ink'"
            @click="view = 'compare'"
          >
            <GitBranch :size="13" :stroke-width="2" />
            Before vs After
          </button>
        </div>
      </div>
    </header>

    <!-- ===== HUB VIEW ===== -->
    <div v-show="view === 'hub'" class="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
      <!-- Canvas column -->
      <section class="border-b lg:border-b-0 lg:border-r border-line">
        <!-- Sub-toolbar: connect hint + add tool -->
        <div class="px-4 sm:px-6 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div class="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <span class="dot" /> Canvas
            </div>
            <p class="mt-1 text-[12.5px] text-mute leading-snug">
              <span v-if="connectMode" class="text-cyan-brand-deep font-semibold">
                Click a target tool to draw a bridge from <span class="font-semibold">{{ toolNameOf(connectFromId) }}</span>.
                <button type="button" class="underline ml-1" @click="cancelConnect">Cancel</button>
              </span>
              <span v-else>
                Drag tools to rearrange. Click the <Plus :size="11" :stroke-width="2.4" class="inline -mt-0.5 text-cyan-brand-deep" /> handle on a tool to start a bridge.
              </span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white text-ink text-[12.5px] font-semibold px-2.5 py-1.5 hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="resetAll"
            >
              Reset
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-cyan-brand-deep hover:bg-cyan-brand-deep/90 text-white text-[12.5px] font-semibold px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="openAddTool"
            >
              <Plus :size="13" :stroke-width="2.2" />
              Add a tool
            </button>
          </div>
        </div>

        <!-- Canvas wrapper (scroll on narrow screens) -->
        <div class="mt-3 overflow-x-auto pb-3 px-4 sm:px-6" style="scrollbar-width: thin;">
          <div
            ref="canvasRef"
            class="ih-canvas relative rounded-2xl border border-line bg-white"
            :style="{
              width: `${CANVAS_W}px`,
              height: `${CANVAS_H}px`,
            }"
          >
            <!-- Decorative grid + halo -->
            <div class="absolute inset-0 ih-grid pointer-events-none rounded-2xl" />
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[260px] w-[460px] rounded-full bg-cyan-brand/8 blur-[80px] pointer-events-none" aria-hidden="true" />

            <!-- SVG edges layer -->
            <svg
              class="absolute inset-0 pointer-events-none"
              :viewBox="`0 0 ${CANVAS_W} ${CANVAS_H}`"
              :width="CANVAS_W"
              :height="CANVAS_H"
              aria-hidden="true"
            >
              <defs>
                <marker id="arrow-cyan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#00B8CC" />
                </marker>
                <marker id="arrow-line" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                </marker>
              </defs>
              <g>
                <path
                  v-for="p in bridgePaths"
                  :key="p.bridge.id"
                  :d="p.d"
                  fill="none"
                  stroke="#94a3b8"
                  stroke-width="1.4"
                  stroke-dasharray="0"
                  marker-end="url(#arrow-line)"
                  class="ih-edge"
                />
              </g>
            </svg>

            <!-- Event packets layer -->
            <div class="absolute inset-0 pointer-events-none">
              <span
                v-for="pk in packets"
                :key="pk.id"
                class="event-packet"
                :style="{
                  offsetPath: `path('M ${pk.fromX} ${pk.fromY} L ${pk.toX} ${pk.toY}')`,
                }"
              />
            </div>

            <!-- Tool chips -->
            <div
              v-for="n in nodes"
              :key="n.id"
              class="ih-chip group select-none absolute"
              :class="[
                draggingNodeId === n.id ? 'is-dragging' : '',
                isFlashing(n.id) ? 'is-flashing' : '',
                connectMode && connectFromId === n.id ? 'is-connecting-from' : '',
                connectMode && connectFromId !== n.id ? 'is-connect-target' : '',
              ]"
              :style="{
                left: `${n.x}px`,
                top: `${n.y}px`,
                width: `${CHIP_W}px`,
                height: `${CHIP_H}px`,
              }"
              @pointerdown="onNodePointerDown($event, n)"
              @pointermove="onNodePointerMove($event, n)"
              @pointerup="onNodePointerUp"
              @click="onNodeClick(n)"
            >
              <div class="ih-chip-inner">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-brand/12 text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0" aria-hidden="true">
                    <component :is="kindOf(n).icon" :size="15" :stroke-width="1.9" />
                  </span>
                  <div class="min-w-0">
                    <div class="text-[12.5px] font-semibold text-ink leading-tight truncate">{{ kindOf(n).name }}</div>
                    <div class="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-mute-2 truncate">{{ kindOf(n).category }}</div>
                  </div>
                </div>
              </div>

              <!-- "+" connect handle -->
              <button
                type="button"
                data-handle
                class="ih-handle"
                :title="`Draw a bridge from ${kindOf(n).name}`"
                :aria-label="`Draw a bridge from ${kindOf(n).name}`"
                @click.stop="startConnectFrom(n)"
              >
                <Plus :size="11" :stroke-width="2.6" />
              </button>
            </div>
          </div>
        </div>

        <!-- Trigger + bridge list -->
        <div class="border-t border-line grid grid-cols-1 md:grid-cols-[1fr_1fr]">
          <div class="border-b md:border-b-0 md:border-r border-line p-4 sm:p-5">
            <div class="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              <span class="dot" /> Trigger panel
            </div>
            <p class="mt-1 text-[12.5px] text-mute leading-snug">
              Fire a real-world event. Watch the ripple cross the bridges.
            </p>
            <div class="mt-3 flex flex-col gap-1.5">
              <button
                v-for="t in TRIGGERS"
                :key="t.key"
                type="button"
                :disabled="firing"
                class="inline-flex items-center justify-between gap-2 rounded-lg border text-[13px] font-semibold px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                :class="firing
                  ? 'border-line bg-surface-alt/60 text-mute-2 cursor-not-allowed'
                  : 'border-line bg-white text-ink hover:border-ink/30 hover:bg-surface-alt'"
                @click="fireTrigger(t)"
              >
                <span class="inline-flex items-center gap-2">
                  <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-md ring-1"
                    :class="t.key === 'outage'
                      ? 'bg-white text-ink ring-ink/40'
                      : 'bg-cyan-brand/12 text-cyan-brand-deep ring-cyan-brand/25'"
                    aria-hidden="true"
                  >
                    <AlertTriangle v-if="t.key === 'outage'" :size="12" :stroke-width="2.2" />
                    <Zap v-else :size="12" :stroke-width="2.2" />
                  </span>
                  {{ t.label }}
                </span>
                <ArrowRight :size="13" :stroke-width="2" class="text-mute-2 group-hover:text-ink" />
              </button>
            </div>
            <p class="mt-3 text-[11.5px] text-mute-2 leading-snug">
              The source fires. The hub forwards every wired bridge. If a target's action emits, the next wave runs.
            </p>
          </div>

          <div class="p-4 sm:p-5">
            <div class="flex items-center justify-between">
              <div class="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
                <span class="dot" /> Bridges
              </div>
              <span class="text-[10.5px] text-mute-2">{{ bridgeCount }} wired</span>
            </div>
            <ul class="mt-3 space-y-1.5 max-h-[200px] overflow-y-auto pr-1" style="scrollbar-width: thin;">
              <li
                v-for="b in bridges"
                :key="b.id"
                class="rounded-lg border border-line bg-white px-2.5 py-2 flex items-start gap-2"
              >
                <span class="mt-0.5 inline-flex items-center justify-center h-5 w-5 rounded-md bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/20 shrink-0" aria-hidden="true">
                  <Cable :size="10" :stroke-width="2" />
                </span>
                <div class="min-w-0 grow">
                  <div class="text-[11.5px] font-semibold text-ink leading-tight truncate">
                    {{ toolNameOf(b.from) }} → {{ toolNameOf(b.to) }}
                  </div>
                  <div class="mt-0.5 text-[10.5px] text-mute leading-tight truncate">
                    when <span class="font-medium text-ink">{{ b.trigger }}</span> · {{ b.action }}
                  </div>
                </div>
                <button
                  type="button"
                  class="shrink-0 h-6 w-6 inline-flex items-center justify-center rounded-md text-mute-2 hover:text-ink hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                  :aria-label="`Delete bridge ${toolNameOf(b.from)} to ${toolNameOf(b.to)}`"
                  @click="deleteBridge(b.id)"
                >
                  <Trash2 :size="11" :stroke-width="2" />
                </button>
              </li>
              <li v-if="bridges.length === 0" class="text-[12px] text-mute italic px-1">
                No bridges. Click the + handle on any tool to draw one.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Event log side pane -->
      <aside class="bg-surface-alt/40 p-4 sm:p-5 flex flex-col gap-4">
        <div>
          <div class="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" /> Event log
          </div>
          <p class="mt-1 text-[12px] text-mute leading-snug">Most recent first. Audit trail for every hop.</p>
        </div>

        <ul v-if="log.length" class="space-y-1.5">
          <li
            v-for="entry in log"
            :key="entry.id"
            class="rounded-lg border border-line bg-white px-2.5 py-2 flex items-start gap-2"
          >
            <span
              class="mt-0.5 inline-flex items-center justify-center h-6 w-6 rounded-md shrink-0"
              :class="entry.kind === 'fire'
                ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-1 ring-cyan-brand/25'
                : entry.kind === 'emit'
                ? 'bg-ink text-white'
                : entry.kind === 'retry'
                ? 'bg-white text-ink ring-1 ring-ink/40'
                : 'bg-surface-alt text-ink ring-1 ring-line'"
              aria-hidden="true"
            >
              <Zap v-if="entry.kind === 'emit'" :size="12" :stroke-width="2" />
              <ArrowRight v-else-if="entry.kind === 'fire'" :size="12" :stroke-width="2" />
              <RotateCw v-else-if="entry.kind === 'retry'" :size="12" :stroke-width="2" />
              <Sparkles v-else :size="12" :stroke-width="2" />
            </span>
            <div class="min-w-0 grow">
              <div class="flex items-center gap-1.5 text-[10.5px] text-mute-2 uppercase tracking-[0.12em]">
                <span class="font-semibold">{{ entry.kind === 'emit' ? 'Emit' : entry.kind === 'fire' ? 'Bridge fire' : entry.kind === 'retry' ? 'Retry' : 'Note' }}</span>
                <span class="text-mute-2/60">·</span>
                <span>{{ entry.at }}</span>
              </div>
              <div class="mt-0.5 text-[12px] font-semibold text-ink leading-snug">{{ entry.title }}</div>
              <div class="text-[11.5px] text-mute leading-snug">{{ entry.body }}</div>
            </div>
          </li>
        </ul>
        <p v-else class="text-[12px] text-mute italic">
          Fire a trigger or wire a bridge — events will appear here.
        </p>
      </aside>
    </div>

    <!-- ===== BEFORE vs AFTER VIEW ===== -->
    <div v-show="view === 'compare'" class="px-4 sm:px-6 py-5">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" /> Same event, two stories
          </div>
          <h3 class="mt-1 font-display text-[22px] md:text-[26px] leading-[1.15] text-ink">
            One trigger. The before is people. The after is the hub.
          </h3>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="t in COMPARE_TRIGGERS"
            :key="t.key"
            type="button"
            :disabled="compareFiring"
            class="inline-flex items-center gap-1.5 rounded-lg border text-[12.5px] font-semibold px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            :class="compareFiring
              ? 'border-line bg-surface-alt/60 text-mute-2 cursor-not-allowed'
              : compareTrigger === t.key
              ? 'border-ink bg-ink text-white'
              : 'border-line bg-white text-ink hover:border-ink/30'"
            @click="fireCompare(t.key)"
          >
            <Zap :size="12" :stroke-width="2.2" />
            {{ t.shortLabel }}
          </button>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- BEFORE panel -->
        <article class="rounded-2xl border border-line bg-white overflow-hidden">
          <header class="px-4 py-3 border-b border-line bg-surface-alt/60 flex items-center justify-between">
            <div class="inline-flex items-center gap-2">
              <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white border border-line text-mute-2">
                <Users :size="13" :stroke-width="2" />
              </span>
              <span class="text-[12.5px] font-semibold text-ink">Before · 8 islands, paddled by hand</span>
            </div>
          </header>
          <!-- Compact static diagram -->
          <div class="px-3 pt-3">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold mb-2">No bridges</div>
            <div class="ih-compact-grid">
              <div
                v-for="n in COMPARE_NODES"
                :key="n.id"
                class="ih-compact-chip"
              >
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-alt text-mute-2 ring-1 ring-line">
                  <component :is="kindByKey(n.kindKey).icon" :size="11" :stroke-width="2" />
                </span>
                <span class="text-[11px] font-semibold text-ink truncate">{{ kindByKey(n.kindKey).name }}</span>
              </div>
            </div>
          </div>
          <div class="px-4 py-3">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold mb-2">Staff timeline</div>
            <ol v-if="beforeSteps.length" class="space-y-1.5">
              <li
                v-for="s in beforeSteps"
                :key="s.id"
                class="rounded-lg border border-line bg-white px-2.5 py-2"
              >
                <div class="flex items-center gap-1.5 text-[10.5px] text-mute-2 uppercase tracking-[0.12em]">
                  <span class="font-semibold">{{ s.who }}</span>
                  <span class="text-mute-2/60">·</span>
                  <span>{{ s.at }}</span>
                </div>
                <p class="mt-0.5 text-[12px] text-ink leading-snug">{{ s.text }}</p>
              </li>
            </ol>
            <p v-else class="text-[12px] text-mute italic">Click a trigger above. The Before timeline plays out at compressed real-time.</p>
          </div>
        </article>

        <!-- AFTER panel -->
        <article class="rounded-2xl border border-cyan-brand/30 bg-white overflow-hidden ring-1 ring-cyan-brand/15">
          <header class="px-4 py-3 border-b border-line bg-surface-alt/60 flex items-center justify-between">
            <div class="inline-flex items-center gap-2">
              <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-cyan-brand/15 ring-1 ring-cyan-brand/25 text-cyan-brand-deep">
                <Cable :size="13" :stroke-width="2" />
              </span>
              <span class="text-[12.5px] font-semibold text-ink">After · 8 tools wired into one hub</span>
            </div>
          </header>
          <!-- Compact dynamic canvas -->
          <div class="px-3 pt-3 overflow-x-auto" style="scrollbar-width: thin;">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold mb-2">{{ COMPARE_BRIDGES.length }} bridges wired</div>
            <div
              class="ih-compare-canvas relative rounded-xl border border-line bg-surface-alt/30 overflow-hidden"
              :style="{
                width: `${COMPARE_W}px`,
                height: `${COMPARE_H}px`,
              }"
            >
              <svg
                class="absolute inset-0 pointer-events-none"
                :viewBox="`0 0 ${COMPARE_W} ${COMPARE_H}`"
                :width="COMPARE_W"
                :height="COMPARE_H"
                aria-hidden="true"
              >
                <g>
                  <path
                    v-for="p in compareBridgePaths"
                    :key="p.bridge.id"
                    :d="p.d"
                    fill="none"
                    stroke="#00B8CC"
                    stroke-width="1.2"
                    opacity="0.65"
                  />
                </g>
              </svg>
              <!-- Compact tool chips inside compare canvas -->
              <div
                v-for="n in COMPARE_NODES"
                :key="n.id"
                class="ih-compare-chip absolute pointer-events-none"
                :style="{
                  left: `${cx(n.x)}px`,
                  top: `${cx(n.y)}px`,
                  width: `${COMPARE_CHIP_W}px`,
                  height: `${COMPARE_CHIP_H}px`,
                }"
              >
                <div class="ih-compare-chip-inner">
                  <span class="inline-flex h-4 w-4 items-center justify-center rounded-md bg-cyan-brand/12 text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0">
                    <component :is="kindByKey(n.kindKey).icon" :size="9" :stroke-width="2" />
                  </span>
                  <span class="text-[9.5px] font-semibold text-ink truncate">{{ kindByKey(n.kindKey).name }}</span>
                </div>
              </div>
              <!-- Active packets (pixel-scaled offset-path) -->
              <div class="absolute inset-0 pointer-events-none">
                <span
                  v-for="pk in afterPackets"
                  :key="pk.id"
                  class="event-packet event-packet--compare"
                  :style="{
                    offsetPath: `path('M ${cx(pk.fromX)} ${cx(pk.fromY)} L ${cx(pk.toX)} ${cx(pk.toY)}')`,
                  }"
                />
              </div>
            </div>
          </div>
          <div class="px-4 py-3">
            <div class="text-[10.5px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold mb-2">Hub timeline</div>
            <ol v-if="afterSteps.length" class="space-y-1.5">
              <li
                v-for="s in afterSteps"
                :key="s.id"
                class="rounded-lg border border-line bg-white px-2.5 py-2"
              >
                <div class="flex items-center gap-1.5 text-[10.5px] text-mute-2 uppercase tracking-[0.12em]">
                  <span class="font-semibold text-cyan-brand-deep">{{ s.who }}</span>
                  <span class="text-mute-2/60">·</span>
                  <span class="tabular-nums">{{ s.at }}</span>
                </div>
                <p class="mt-0.5 text-[12px] text-ink leading-snug">{{ s.text }}</p>
              </li>
            </ol>
            <p v-else class="text-[12px] text-mute italic">Same event. The hub fans it out automatically.</p>
          </div>
        </article>
      </div>

      <!-- Summary strip -->
      <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="rounded-xl border border-line bg-white p-3.5">
          <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Before</div>
          <div class="mt-1 font-display text-[22px] leading-none text-ink">{{ BEFORE_RECIPES[compareTrigger].totalMinutes }} min</div>
          <div class="mt-1 text-[11.5px] text-mute leading-snug">of staff time per event · {{ BEFORE_RECIPES[compareTrigger].errorRate }}.</div>
        </div>
        <div class="rounded-xl border border-cyan-brand/30 bg-white p-3.5 ring-1 ring-cyan-brand/15">
          <div class="text-[10.5px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">After</div>
          <div class="mt-1 font-display text-[22px] leading-none text-ink">under 2 sec</div>
          <div class="mt-1 text-[11.5px] text-mute leading-snug">end-to-end · zero staff time · every hop logged.</div>
        </div>
        <div class="rounded-xl border border-line bg-surface-alt/60 p-3.5">
          <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">What changed</div>
          <p class="mt-1 text-[12.5px] text-ink leading-snug">
            The tools didn't change. The way they talk did.
          </p>
        </div>
      </div>
    </div>

    <!-- ===== BRIDGE CONFIG MODAL ===== -->
    <Teleport to="body">
      <div
        v-if="bridgeModalOpen && mounted"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Configure bridge"
      >
        <button
          type="button"
          class="absolute inset-0 bg-ink/35 backdrop-blur-[1px]"
          aria-label="Close"
          @click="closeBridgeModal"
        />
        <div class="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white border border-line shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
          <header class="border-b border-line px-5 py-3 flex items-start justify-between gap-3">
            <div>
              <div class="text-[10.5px] uppercase tracking-[0.2em] text-cyan-brand-deep font-semibold">Configure bridge</div>
              <h3 class="mt-0.5 font-display text-[20px] leading-tight text-ink">
                {{ toolNameOf(bridgeFromId) }} <span class="text-mute-2 mx-1">→</span> {{ toolNameOf(bridgeToId) }}
              </h3>
            </div>
            <button
              type="button"
              class="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-lg text-mute hover:text-ink hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              aria-label="Close"
              @click="closeBridgeModal"
            >
              <X :size="16" :stroke-width="2" />
            </button>
          </header>

          <div class="px-5 py-4 space-y-4">
            <div>
              <label class="block text-[13px] font-semibold text-ink mb-2">
                When this event fires in <span class="text-cyan-brand-deep">{{ toolNameOf(bridgeFromId) }}</span>
              </label>
              <select
                v-model="draftTrigger"
                class="form-field-select"
              >
                <option v-for="e in emitsFor(bridgeFromId)" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>

            <div class="flex justify-center text-mute-2">
              <ChevronRight :size="16" :stroke-width="2" class="rotate-90" />
            </div>

            <div>
              <label class="block text-[13px] font-semibold text-ink mb-2">
                Do this in <span class="text-cyan-brand-deep">{{ toolNameOf(bridgeToId) }}</span>
              </label>
              <select
                v-model="draftAction"
                class="form-field-select"
              >
                <option v-for="a in actionsFor(bridgeToId)" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
          </div>

          <footer class="border-t border-line px-5 py-3 flex items-center justify-end gap-2 bg-surface-alt/60">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-line bg-white text-ink text-[13px] font-semibold px-3.5 py-2 hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="closeBridgeModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[13px] font-semibold px-3.5 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="saveBridge"
            >
              <CheckCircle2 :size="14" :stroke-width="2.2" />
              Wire bridge
            </button>
          </footer>
        </div>
      </div>
    </Teleport>

    <!-- ===== ADD TOOL DRAWER ===== -->
    <Teleport to="body">
      <div
        v-if="addToolOpen && mounted"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Add a tool"
      >
        <button
          type="button"
          class="absolute inset-0 bg-ink/35 backdrop-blur-[1px]"
          aria-label="Close"
          @click="addToolOpen = false"
        />
        <div class="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white border border-line shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
          <header class="border-b border-line px-5 py-3 flex items-start justify-between gap-3">
            <div>
              <div class="text-[10.5px] uppercase tracking-[0.2em] text-cyan-brand-deep font-semibold">Add a tool</div>
              <h3 class="mt-0.5 font-display text-[20px] leading-tight text-ink">
                Drop a new tool onto the hub
              </h3>
              <p class="mt-1 text-[12px] text-mute leading-snug">
                It lands on the canvas and is ready to wire. The hub doesn't care which tool it is.
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-lg text-mute hover:text-ink hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              aria-label="Close"
              @click="addToolOpen = false"
            >
              <X :size="16" :stroke-width="2" />
            </button>
          </header>

          <div class="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              v-for="key in ADDABLE_KEYS"
              :key="key"
              type="button"
              class="text-left rounded-xl border border-line bg-white px-3 py-3 hover:border-ink/30 hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="addToolFromTemplate(key)"
            >
              <div class="flex items-center gap-2">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-brand/12 text-cyan-brand-deep ring-1 ring-cyan-brand/25">
                  <component :is="kindByKey(key).icon" :size="16" :stroke-width="1.9" />
                </span>
                <div class="min-w-0">
                  <div class="text-[13px] font-semibold text-ink leading-tight truncate">{{ kindByKey(key).name }}</div>
                  <div class="text-[10.5px] uppercase tracking-[0.14em] text-mute-2 truncate">{{ kindByKey(key).category }}</div>
                </div>
              </div>
              <p class="mt-2 text-[11.5px] text-mute leading-snug truncate">
                Emits {{ kindByKey(key).emits.length }} events · {{ kindByKey(key).actions.length }} actions
              </p>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.integration-hub {
  contain: layout;
}

.ih-canvas {
  background:
    radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,1) 0%, rgba(246,248,251,0.6) 100%);
  position: relative;
  user-select: none;
  touch-action: none;
}

.ih-grid {
  background-image:
    linear-gradient(to right,  rgba(15,23,42,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(ellipse at center, black 55%, transparent 100%);
          mask-image: radial-gradient(ellipse at center, black 55%, transparent 100%);
  opacity: 0.5;
}

.ih-chip {
  cursor: grab;
  transition:
    transform 200ms cubic-bezier(0.22,1,0.36,1),
    box-shadow 200ms cubic-bezier(0.22,1,0.36,1);
  z-index: 2;
}
.ih-chip.is-dragging {
  cursor: grabbing;
  transform: translateY(-1px);
}
.ih-chip.is-flashing .ih-chip-inner {
  border-color: #01DBF1;
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.18);
}
.ih-chip.is-connecting-from .ih-chip-inner {
  border-color: #00B8CC;
  background: rgba(1, 219, 241, 0.06);
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.22);
}
.ih-chip.is-connect-target {
  cursor: pointer;
}
.ih-chip.is-connect-target:hover .ih-chip-inner {
  border-color: rgba(1, 219, 241, 0.55);
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.14);
}

.ih-chip-inner {
  width: 100%;
  height: 100%;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow:
    0 8px 22px -16px rgba(15,23,42,0.18),
    0 2px 6px -3px rgba(15,23,42,0.05);
  transition:
    border-color 220ms cubic-bezier(0.22,1,0.36,1),
    box-shadow 220ms cubic-bezier(0.22,1,0.36,1),
    background 220ms cubic-bezier(0.22,1,0.36,1);
}

.ih-handle {
  position: absolute;
  right: -10px;
  top: -10px;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: #00B8CC;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px -3px rgba(0, 184, 204, 0.45);
  z-index: 3;
  opacity: 0;
  transform: scale(0.85);
  transition:
    opacity 200ms cubic-bezier(0.22,1,0.36,1),
    transform 200ms cubic-bezier(0.22,1,0.36,1),
    background 200ms;
}
.ih-handle:hover {
  background: #0A0F1A;
}
.ih-handle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.45);
}

.ih-chip:hover .ih-handle,
.ih-chip:focus-within .ih-handle,
.ih-chip.is-connecting-from .ih-handle {
  opacity: 1;
  transform: scale(1);
}
/* Touch — always visible */
@media (hover: none) {
  .ih-handle { opacity: 1; transform: scale(1); }
}

.ih-edge {
  transition: stroke 220ms cubic-bezier(0.22,1,0.36,1);
}

.event-packet {
  position: absolute;
  left: 0; top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #01DBF1;
  box-shadow:
    0 0 0 4px rgba(1, 219, 241, 0.22),
    0 0 12px 2px rgba(1, 219, 241, 0.55);
  pointer-events: none;
  z-index: 1;
  offset-rotate: 0deg;
  animation: ih-travel 820ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.event-packet--compare {
  width: 9px;
  height: 9px;
}

@keyframes ih-travel {
  0%   { offset-distance: 0%;   opacity: 0; transform: scale(0.6); }
  10%  { opacity: 1; transform: scale(1); }
  90%  { opacity: 1; transform: scale(1); }
  100% { offset-distance: 100%; opacity: 0; transform: scale(0.6); }
}

/* compact mirror diagrams */
.ih-compact-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  padding-bottom: 4px;
}
@media (max-width: 480px) {
  .ih-compact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.ih-compact-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  background: #fff;
}

.ih-compare-canvas {
  min-height: 220px;
}
.ih-compare-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.ih-compare-chip-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  box-shadow: 0 4px 10px -8px rgba(15,23,42,0.18);
}

.form-field-select {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #E2E8F0;
  background: #FFFFFF;
  padding: 0.625rem 0.875rem;
  font-size: 14px;
  line-height: 1.4;
  color: #0A0F1A;
  font-family: inherit;
  transition: border-color 180ms, box-shadow 180ms, background-color 180ms;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #64748B 50%),
    linear-gradient(135deg, #64748B 50%, transparent 50%);
  background-position:
    calc(100% - 18px) 50%,
    calc(100% - 13px) 50%;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 30px;
}
.form-field-select:hover { border-color: rgba(1,219,241,0.4); }
.form-field-select:focus {
  outline: none;
  border-color: #01DBF1;
  box-shadow: 0 0 0 3px rgba(1,219,241,0.22);
}

.tabular-nums { font-variant-numeric: tabular-nums; }

.integration-hub *::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.integration-hub *::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.12);
  border-radius: 9999px;
}
.integration-hub *::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.22);
}

@media (prefers-reduced-motion: reduce) {
  .event-packet { animation-duration: 200ms; }
  .ih-chip,
  .ih-chip-inner,
  .ih-handle { transition: none; }
}
</style>
