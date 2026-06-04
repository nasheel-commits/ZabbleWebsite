<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ArrowDown, ArrowRight, Cable, CheckCircle2, Circle, Clock, Database, Eye, FileSpreadsheet, FolderSync, Loader2, MessageSquare, MonitorCog, Plug, RefreshCw, ShieldCheck, Sparkles, Terminal, Ticket, Wand2 } from '@lucide/vue'

type LegacyId = 'excel' | 'erp' | 'bespoke'
type Stage = 0 | 1 | 2 | 3 | 4 | 5

interface LegacyConfig {
  id: LegacyId
  label: string
  short: string
  surface: string
  surfaceIcon: Component
  surfaceDetail: string
  schedule: string
  triggerLabel: string
  rawEventLabel: string
  recordRef: string
  normalised: { key: string; value: string }[]
  aiSummary: string
  aiFields: { label: string; value: string }[]
  writeBack: string
  writeBackTarget: string
  modern: {
    db: { table: string; rowKey: string }
    saas: { name: string; icon: Component; action: string }
  }
}

const legacies: Record<LegacyId, LegacyConfig> = {
  excel: {
    id: 'excel',
    label: 'Excel workbook',
    short: 'Excel',
    surface: 'File watcher',
    surfaceIcon: FolderSync,
    surfaceDetail: 'OneDrive sync',
    schedule: 'Live · on save',
    triggerLabel: 'New row added to Excel workbook',
    rawEventLabel: 'PIPELINE.xlsx · row 247 saved',
    recordRef: 'PIPELINE.xlsx · row 247',
    normalised: [
      { key: 'customer',  value: 'Acme Capital' },
      { key: 'stage',     value: 'Proposal' },
      { key: 'value',     value: '$45,000.00' },
      { key: 'owner',     value: 'JM → Jane Miller' },
    ],
    aiSummary: 'Healthy mid-funnel deal · technical scoping call is the next high-leverage move.',
    aiFields: [
      { label: 'Win %',       value: '64' },
      { label: 'Health',      value: 'On track' },
      { label: 'Next action', value: 'Schedule technical scoping call' },
    ],
    writeBack: 'Columns AI Win % and AI Action filled on row 247',
    writeBackTarget: 'PIPELINE.xlsx',
    modern: {
      db:   { table: 'pipeline.deals', rowKey: 'deal_id = D-2026-0247' },
      saas: { name: 'HubSpot · Deal updated', icon: Ticket, action: 'Deal stage + win % synced' },
    },
  },
  erp: {
    id: 'erp',
    label: 'On-prem ERP (2008)',
    short: 'Green-screen ERP',
    surface: 'SQL read',
    surfaceIcon: Database,
    surfaceDetail: 'ODBC · read-only view',
    schedule: '5 min poll',
    triggerLabel: 'Order entered in green-screen ERP',
    rawEventLabel: 'Sales order SO-04127 written',
    recordRef: 'SO-04127',
    normalised: [
      { key: 'customer', value: 'Cust 8821 → Wide River Trading' },
      { key: 'item',     value: '4452 → Coupling assembly · 3/4-in' },
      { key: 'qty',      value: '50 @ $12.40' },
      { key: 'subtotal', value: '$620.00' },
    ],
    aiSummary: 'Existing customer · credit utilisation 38% · no fraud signals. Safe to release.',
    aiFields: [
      { label: 'Credit',  value: '38% used' },
      { label: 'Fraud',   value: 'None' },
      { label: 'Verdict', value: 'Release order' },
    ],
    writeBack: 'cust_status field set to READY on SO-04127',
    writeBackTarget: 'ERP order record',
    modern: {
      db:   { table: 'erp.orders_mirror', rowKey: 'order_id = SO-04127' },
      saas: { name: 'Slack · #sales-ops', icon: MessageSquare, action: 'Order ready alert posted' },
    },
  },
  bespoke: {
    id: 'bespoke',
    label: 'Bespoke internal tool',
    short: 'Bespoke tool',
    surface: 'API wrapper',
    surfaceIcon: Plug,
    surfaceDetail: 'HTTP poll · /records',
    schedule: '60 s poll',
    triggerLabel: 'Record updated in legacy tool',
    rawEventLabel: 'Record #88412 status changed',
    recordRef: '#88412',
    normalised: [
      { key: 'id',        value: '88412 → proj_88412' },
      { key: 'name',      value: 'Q3 KPI Refresh' },
      { key: 'status',    value: 'Active → Pending Review' },
      { key: 'owner',     value: 'PS → Priya Shah' },
    ],
    aiSummary: 'Refresh stalled at review gate · medium risk. Recommend owner + due date.',
    aiFields: [
      { label: 'Risk',      value: 'Medium' },
      { label: 'Owner',     value: 'Priya Shah' },
      { label: 'Due',       value: 'Jun 14' },
    ],
    writeBack: 'Notes field appended with AI summary',
    writeBackTarget: 'Record #88412',
    modern: {
      db:   { table: 'projects.tracked', rowKey: 'project_id = proj_88412' },
      saas: { name: 'Linear · Ticket created', icon: Ticket, action: 'Follow-up ticket assigned to Priya' },
    },
  },
}

const activeLegacy = ref<LegacyId>('excel')
const stage = ref<Stage>(0)
const fireCount = ref(0)
const log = ref<{ time: string; legacy: LegacyId; label: string }[]>([])

const cfg = computed(() => legacies[activeLegacy.value])
const isAnimating = computed(() => stage.value > 0 && stage.value < 5)

let timers: ReturnType<typeof setTimeout>[] = []

function clearTimers() {
  for (const t of timers) clearTimeout(t)
  timers = []
}

function nowHMS() {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function fire(id?: LegacyId) {
  clearTimers()
  if (id && id !== activeLegacy.value) {
    activeLegacy.value = id
  }
  stage.value = 0
  fireCount.value++
  const reduce = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
  const step = reduce ? 0 : 600
  timers.push(setTimeout(() => (stage.value = 1), reduce ? 0 : 80))
  timers.push(setTimeout(() => (stage.value = 2), step * 1 + (reduce ? 0 : 80)))
  timers.push(setTimeout(() => (stage.value = 3), step * 2 + (reduce ? 0 : 80)))
  timers.push(setTimeout(() => (stage.value = 4), step * 3 + (reduce ? 0 : 80)))
  timers.push(
    setTimeout(() => {
      stage.value = 5
      log.value.unshift({ time: nowHMS(), legacy: cfg.value.id, label: cfg.value.rawEventLabel })
      if (log.value.length > 5) log.value.length = 5
    }, step * 4 + (reduce ? 0 : 80)),
  )
}

function setActive(id: LegacyId) {
  if (id === activeLegacy.value) return
  clearTimers()
  stage.value = 0
  activeLegacy.value = id
}

onBeforeUnmount(clearTimers)

interface PipelineStep {
  key: number
  title: string
  detail: string
}

const pipelineSteps = computed<PipelineStep[]>(() => [
  { key: 1, title: 'Detect',     detail: cfg.value.rawEventLabel },
  { key: 2, title: 'Normalise',  detail: 'Map to canonical schema · resolve codes' },
  { key: 3, title: 'AI enrich',  detail: cfg.value.aiSummary },
  { key: 4, title: 'Write back', detail: cfg.value.writeBack },
])

function stepState(key: number): 'done' | 'active' | 'pending' {
  if (stage.value === 0) return 'pending'
  if (stage.value > key || stage.value === 5) return 'done'
  if (stage.value === key) return 'active'
  return 'pending'
}

// Excel grid sample rows. Row 247 is the highlighted new row that appears
// (or fills out) when the Excel event fires.
const excelRows = [
  { n: 244, a: 'Helio Logistics',  b: 'Won',         c: '$28,400',  d: 'JM' },
  { n: 245, a: 'Northwind Co.',    b: 'Negotiation', c: '$72,500',  d: 'PS' },
  { n: 246, a: 'Bluebird Inc.',    b: 'Qualified',   c: '$14,000',  d: 'JM' },
  { n: 247, a: 'Acme Capital',     b: 'Proposal',    c: '$45,000',  d: 'JM' },
]

const excelEnrichedVisible = computed(() => stage.value >= 4)

</script>

<template>
  <div class="bg-white text-ink">
    <!-- Header -->
    <header class="border-b border-line p-5 md:p-7">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Legacy Bridge
          </div>
          <h3 class="mt-3 font-display text-[24px] md:text-[28px] leading-[1.12] text-ink">
            Keep what works. Connect it to what's new.
          </h3>
          <p class="mt-2 max-w-xl text-[14.5px] leading-[1.55] text-mute">
            The bridge listens on the legacy system's existing surface, normalises the change, sends
            it to a modern stack for enrichment, and writes the result back, through the same
            surface. No migration project.
          </p>
        </div>

        <!-- Legacy toggle -->
        <div
          class="inline-flex flex-wrap shrink-0 rounded-full border border-line bg-white p-1 max-w-full"
          role="tablist"
          aria-label="Legacy system"
        >
          <button
            v-for="lg in (Object.values(legacies) as LegacyConfig[])"
            :key="lg.id"
            type="button"
            :aria-pressed="activeLegacy === lg.id"
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
              activeLegacy === lg.id
                ? 'bg-ink text-white'
                : 'text-mute-2 hover:text-ink',
            ]"
            @click="setActive(lg.id)"
          >
            <component :is="lg.id === 'excel' ? FileSpreadsheet : lg.id === 'erp' ? Terminal : MonitorCog" :size="13" :stroke-width="2" aria-hidden="true" />
            {{ lg.short }}
          </button>
        </div>
      </div>

      <!-- No-migration banner -->
      <div
        class="mt-5 flex flex-col gap-2 rounded-xl border border-cyan-brand/25 bg-cyan-brand/[0.06] p-3.5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-start gap-2.5">
          <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-brand-deep ring-1 ring-cyan-brand/30">
            <ShieldCheck :size="15" :stroke-width="2" aria-hidden="true" />
          </span>
          <div>
            <div class="text-[13.5px] font-semibold text-ink leading-tight">
              No migration project required
            </div>
            <div class="mt-0.5 text-[12.5px] text-mute leading-snug">
              The bridge reads and writes through the legacy system's existing surface area -
              not by rewriting it.
            </div>
          </div>
        </div>
        <div class="inline-flex items-center gap-1.5 rounded-full border border-cyan-brand/25 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-cyan-brand-deep">
          <component :is="cfg.surfaceIcon" :size="13" :stroke-width="2" aria-hidden="true" />
          {{ cfg.surface }} · {{ cfg.surfaceDetail }}
        </div>
      </div>
    </header>

    <!-- Body: 3-column rail -->
    <div class="grid grid-cols-1 lg:grid-cols-[1.15fr_0.9fr_1.05fr]">
      <!-- LEFT: Legacy panel -->
      <div class="border-b border-line lg:border-b-0 lg:border-r p-5 md:p-6 bg-white">
        <div class="flex items-center justify-between gap-3">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Legacy system
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-alt px-2 py-0.5 text-[11px] font-semibold text-mute-2">
            <component :is="cfg.surfaceIcon" :size="11" :stroke-width="2" aria-hidden="true" />
            {{ cfg.label }}
          </span>
        </div>

        <!-- Excel -->
        <div v-if="activeLegacy === 'excel'" class="mt-3 overflow-x-auto">
          <div class="rounded-md border border-[#d0d7de] bg-white overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.04)] min-w-[560px]">
            <!-- Excel ribbon stub -->
            <div class="flex items-center gap-2 border-b border-[#d0d7de] bg-[#f6f8fa] px-2.5 py-1.5">
              <span class="inline-flex h-5 w-5 items-center justify-center rounded bg-[#107c41] text-white text-[10px] font-bold">
                X
              </span>
              <span class="font-sans text-[11.5px] text-[#1f2328]">
                PIPELINE.xlsx, 2026 Q2
              </span>
              <span class="ml-auto font-mono text-[10.5px] text-[#57606a]">
                Saved {{ stage >= 1 ? '· just now' : '· 2 min ago' }}
              </span>
            </div>
            <!-- Grid -->
            <div class="grid grid-cols-[36px_1.5fr_1fr_1fr_0.7fr_1fr_1.2fr] bg-[#f6f8fa] border-b border-[#d0d7de] font-sans text-[11px] text-[#57606a]">
              <span class="border-r border-[#d0d7de] py-1 text-center"></span>
              <span class="border-r border-[#d0d7de] px-2 py-1 text-center font-semibold">A</span>
              <span class="border-r border-[#d0d7de] px-2 py-1 text-center font-semibold">B</span>
              <span class="border-r border-[#d0d7de] px-2 py-1 text-center font-semibold">C</span>
              <span class="border-r border-[#d0d7de] px-2 py-1 text-center font-semibold">D</span>
              <span
                :class="[
                  'border-r border-[#d0d7de] px-2 py-1 text-center font-semibold transition-colors',
                  excelEnrichedVisible ? 'bg-[#dbf3ea] text-[#0a6c45]' : '',
                ]"
              >E</span>
              <span
                :class="[
                  'px-2 py-1 text-center font-semibold transition-colors',
                  excelEnrichedVisible ? 'bg-[#dbf3ea] text-[#0a6c45]' : '',
                ]"
              >F</span>
            </div>
            <!-- Header row (A1 etc) -->
            <div class="grid grid-cols-[36px_1.5fr_1fr_1fr_0.7fr_1fr_1.2fr] bg-white font-sans text-[11.5px] text-[#1f2328] border-b border-[#d0d7de]">
              <span class="border-r border-[#d0d7de] bg-[#f6f8fa] text-center text-[10.5px] text-[#57606a] py-1">1</span>
              <span class="border-r border-[#d0d7de] px-2 py-1 font-semibold">Customer</span>
              <span class="border-r border-[#d0d7de] px-2 py-1 font-semibold">Stage</span>
              <span class="border-r border-[#d0d7de] px-2 py-1 font-semibold">Value</span>
              <span class="border-r border-[#d0d7de] px-2 py-1 font-semibold">Owner</span>
              <span
                :class="[
                  'border-r border-[#d0d7de] px-2 py-1 font-semibold transition-colors',
                  excelEnrichedVisible ? 'text-[#0a6c45]' : 'text-[#8c8c8c]',
                ]"
              >AI Win %</span>
              <span
                :class="[
                  'px-2 py-1 font-semibold transition-colors',
                  excelEnrichedVisible ? 'text-[#0a6c45]' : 'text-[#8c8c8c]',
                ]"
              >AI Action</span>
            </div>

            <div
              v-for="(row, i) in excelRows"
              :key="row.n"
              :class="[
                'grid grid-cols-[36px_1.5fr_1fr_1fr_0.7fr_1fr_1.2fr] font-sans text-[11.5px] text-[#1f2328] border-b border-[#eaeef2] transition-colors',
                row.n === 247 ? (stage >= 1 ? 'bg-[#fff8c5]' : 'bg-white') : 'bg-white',
              ]"
            >
              <span class="border-r border-[#d0d7de] bg-[#f6f8fa] text-center text-[10.5px] text-[#57606a] py-1">{{ i + 2 }}</span>
              <span class="border-r border-[#d0d7de] px-2 py-1 truncate">{{ row.a }}</span>
              <span class="border-r border-[#d0d7de] px-2 py-1">{{ row.b }}</span>
              <span class="border-r border-[#d0d7de] px-2 py-1 tabular-nums">{{ row.c }}</span>
              <span class="border-r border-[#d0d7de] px-2 py-1">{{ row.d }}</span>
              <span
                :class="[
                  'border-r border-[#d0d7de] px-2 py-1 tabular-nums',
                  row.n === 247 && excelEnrichedVisible
                    ? 'bg-[#dbf3ea] text-[#0a6c45] font-semibold'
                    : 'text-[#8c8c8c]',
                ]"
              >
                <span v-if="row.n === 247 && excelEnrichedVisible">64%</span>
              </span>
              <span
                :class="[
                  'px-2 py-1 truncate',
                  row.n === 247 && excelEnrichedVisible
                    ? 'bg-[#dbf3ea] text-[#0a6c45] font-semibold'
                    : 'text-[#8c8c8c]',
                ]"
              >
                <span v-if="row.n === 247 && excelEnrichedVisible">Schedule scoping call</span>
              </span>
            </div>
          </div>
        </div>

        <!-- ERP green-screen -->
        <div v-else-if="activeLegacy === 'erp'" class="mt-3">
          <div
            class="rounded-md border border-[#1a1a1a] bg-black p-3 font-mono text-[12px] leading-[1.45] text-[#5ee69b] shadow-[inset_0_0_24px_rgba(94,230,155,0.08)]"
            style="font-family: 'Consolas', 'Courier New', monospace;"
          >
            <div class="flex items-center justify-between text-[#7fd8ff]">
              <span>═══ ACME ERP v2.4.1 ═══</span>
              <span>{{ stage >= 1 ? 'WRITING…' : 'READY' }}</span>
            </div>
            <div class="mt-2 text-[#5ee69b]/70">SCREEN: SO-ENTRY-01 &nbsp; USER: SALES03 &nbsp; TERM: T-12</div>
            <div class="mt-3 border-t border-[#5ee69b]/30 pt-2">
              <div>&gt; ENTER NEW SALES ORDER ___________________</div>
              <div class="mt-1">ORDER NO . . : <span class="text-white">SO-04127</span></div>
              <div>CUST CODE . . : <span class="text-white">8821</span></div>
              <div>ITEM CODE . . : <span class="text-white">4452</span></div>
              <div>QUANTITY  . . : <span class="text-white">50</span></div>
              <div>UNIT PRICE  . : <span class="text-white">12.40</span></div>
              <div class="mt-1">SUBTOTAL  . . : <span class="text-white">620.00</span></div>
            </div>
            <div class="mt-2 border-t border-[#5ee69b]/30 pt-2">
              <div>CUST_STATUS : <span :class="stage >= 4 ? 'text-[#fff48a]' : 'text-[#5ee69b]'">{{ stage >= 4 ? 'READY' : 'PENDING' }}</span></div>
              <div v-if="stage >= 4" class="text-[#fff48a]/80">↳ updated by BRIDGE-WRTBK</div>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#5ee69b]/30 pt-2 text-[#5ee69b]/80 text-[11px]">
              <span>F1=HELP</span><span>F2=NEW</span><span>F3=EXIT</span><span>F5=POST</span>
              <span class="ml-auto inline-flex h-2 w-1 bg-[#5ee69b]" aria-hidden="true" />
            </div>
          </div>
        </div>

        <!-- Bespoke tool (Win98-ish) -->
        <div v-else class="mt-3">
          <div
            class="rounded-sm bg-[#c0c0c0] p-1.5 text-[#000]"
            style="box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #5a5a5a, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #808080; font-family: 'MS Sans Serif', 'Tahoma', sans-serif;"
          >
            <!-- Title bar -->
            <div class="flex items-center gap-1.5 bg-[#000080] px-1.5 py-0.5 text-[11px] font-bold text-white">
              <span class="inline-flex h-3.5 w-3.5 items-center justify-center bg-[#c0c0c0] text-[8px] text-[#000080]" style="box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #404040;">P</span>
              <span>Project Tracker 3.2.7, Record Edit</span>
              <span class="ml-auto font-mono text-[10px]" aria-hidden="true">_ □ X</span>
            </div>
            <!-- Menu bar -->
            <div class="flex items-center gap-3 px-1.5 py-0.5 text-[11px] text-[#000]">
              <span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>R</u>ecord</span><span><u>H</u>elp</span>
            </div>
            <!-- Content panel -->
            <div
              class="m-1 p-2.5 bg-[#c0c0c0]"
              style="box-shadow: inset -1px -1px 0 #ffffff, inset 1px 1px 0 #5a5a5a;"
            >
              <div class="grid grid-cols-[88px_1fr] gap-y-1.5 gap-x-2 text-[11.5px]">
                <span>Record ID:</span>
                <span class="bg-white px-1.5 py-0.5 font-mono text-[11px]" style="box-shadow: inset 1px 1px 0 #5a5a5a, inset -1px -1px 0 #ffffff;">88412</span>
                <span>Project:</span>
                <span class="bg-white px-1.5 py-0.5 text-[11px]" style="box-shadow: inset 1px 1px 0 #5a5a5a, inset -1px -1px 0 #ffffff;">Q3 KPI Refresh</span>
                <span>Owner:</span>
                <span class="bg-white px-1.5 py-0.5 text-[11px]" style="box-shadow: inset 1px 1px 0 #5a5a5a, inset -1px -1px 0 #ffffff;">PS</span>
                <span>Status:</span>
                <span class="bg-white px-1.5 py-0.5 text-[11px]" style="box-shadow: inset 1px 1px 0 #5a5a5a, inset -1px -1px 0 #ffffff;">
                  <span :class="stage >= 1 ? 'text-[#a00000]' : ''">Pending Review</span>
                </span>
                <span>Notes:</span>
                <div
                  class="bg-white px-1.5 py-1 text-[11px] min-h-[44px]"
                  style="box-shadow: inset 1px 1px 0 #5a5a5a, inset -1px -1px 0 #ffffff;"
                >
                  <div v-if="stage < 4" class="text-[#666] italic">(no notes)</div>
                  <div v-else>
                    <div class="text-[10.5px] text-[#666]">- Bridge · {{ nowHMS() }} -</div>
                    <div>Risk: Medium · Suggested owner: Priya Shah · Due: Jun 14.</div>
                  </div>
                </div>
              </div>
              <!-- Buttons -->
              <div class="mt-3 flex items-center gap-1.5 justify-end">
                <span
                  class="inline-block px-3 py-0.5 text-[11px] bg-[#c0c0c0]"
                  style="box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #5a5a5a;"
                >Save</span>
                <span
                  class="inline-block px-3 py-0.5 text-[11px] bg-[#c0c0c0]"
                  style="box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #5a5a5a;"
                >Cancel</span>
              </div>
            </div>
            <!-- Status bar -->
            <div
              class="m-1 mt-1 flex items-center justify-between px-1.5 py-0.5 text-[10.5px] text-[#000]"
              style="box-shadow: inset 1px 1px 0 #5a5a5a, inset -1px -1px 0 #ffffff;"
            >
              <span>Connected · Server LX-2014</span>
              <span>{{ stage >= 4 ? 'Modified by BRIDGE' : 'Idle' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MIDDLE: Bridge -->
      <div class="border-b border-line lg:border-b-0 lg:border-r p-5 md:p-6 bg-surface-alt/40">
        <div class="flex items-center justify-between gap-3">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <Cable :size="13" :stroke-width="2" aria-hidden="true" />
            Bridge
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2 py-0.5 text-[11px] font-semibold text-mute-2">
            <Clock :size="11" :stroke-width="2" aria-hidden="true" />
            {{ cfg.schedule }}
          </span>
        </div>

        <!-- Read / write indicators -->
        <div class="mt-3 grid grid-cols-2 gap-2">
          <div class="rounded-xl border border-line bg-white p-2.5">
            <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              <Eye :size="11" :stroke-width="2" aria-hidden="true" />
              Read
            </div>
            <div class="mt-1 text-[12.5px] font-semibold leading-tight text-ink">
              {{ cfg.surface }}
            </div>
            <div class="text-[11.5px] text-mute leading-snug">
              {{ cfg.surfaceDetail }}
            </div>
          </div>
          <div class="rounded-xl border border-line bg-white p-2.5">
            <div class="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              <RefreshCw :size="11" :stroke-width="2" aria-hidden="true" />
              Write back
            </div>
            <div class="mt-1 flex items-center gap-1.5">
              <span
                :class="[
                  'h-2 w-2 rounded-full',
                  stage >= 4 ? 'bg-cyan-brand' : 'bg-mute-2/40',
                ]"
                aria-hidden="true"
              />
              <span class="text-[12.5px] font-semibold leading-tight text-ink">
                {{ stage >= 4 ? 'Just posted' : stage >= 1 ? 'In flight' : 'Idle' }}
              </span>
            </div>
            <div class="text-[11.5px] text-mute leading-snug">
              {{ cfg.writeBackTarget }}
            </div>
          </div>
        </div>

        <!-- Pipeline -->
        <div class="mt-4 space-y-2">
          <div
            v-for="step in pipelineSteps"
            :key="step.key"
            :class="[
              'rounded-xl border bg-white p-3 transition-colors',
              stepState(step.key) === 'done'
                ? 'border-cyan-brand/40'
                : stepState(step.key) === 'active'
                ? 'border-cyan-brand/60 ring-1 ring-cyan-brand/25'
                : 'border-line',
            ]"
          >
            <div class="flex items-center gap-2.5">
              <span
                :class="[
                  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors',
                  stepState(step.key) === 'done'
                    ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-cyan-brand/30'
                    : stepState(step.key) === 'active'
                    ? 'bg-white text-cyan-brand-deep ring-cyan-brand/40'
                    : 'bg-surface-alt text-mute-2 ring-line',
                ]"
                aria-hidden="true"
              >
                <CheckCircle2 v-if="stepState(step.key) === 'done'" :size="14" :stroke-width="2" />
                <Loader2 v-else-if="stepState(step.key) === 'active'" :size="14" :stroke-width="2" class="animate-spin" />
                <Circle v-else :size="14" :stroke-width="2" />
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                    Step {{ step.key }}
                  </span>
                  <span class="text-[13.5px] font-semibold text-ink leading-tight">
                    {{ step.title }}
                  </span>
                </div>
                <div
                  :class="[
                    'mt-0.5 text-[12px] leading-snug transition-colors',
                    stepState(step.key) === 'pending' ? 'text-mute-2/70' : 'text-mute',
                  ]"
                >
                  {{ step.detail }}
                </div>
              </div>
            </div>

            <!-- Normalised payload preview -->
            <div
              v-if="step.key === 2 && stepState(step.key) !== 'pending'"
              class="mt-2.5 rounded-lg bg-surface-alt/70 p-2 text-[11.5px]"
            >
              <div
                v-for="n in cfg.normalised"
                :key="n.key"
                class="grid grid-cols-[78px_1fr] gap-x-2 py-0.5"
              >
                <span class="font-mono text-mute-2">{{ n.key }}</span>
                <span class="text-ink">{{ n.value }}</span>
              </div>
            </div>

            <!-- AI fields -->
            <div
              v-else-if="step.key === 3 && stepState(step.key) !== 'pending'"
              class="mt-2.5 flex flex-wrap gap-1.5"
            >
              <span
                v-for="f in cfg.aiFields"
                :key="f.label"
                class="inline-flex items-center gap-1.5 rounded-full border border-cyan-brand/25 bg-white px-2 py-0.5 text-[11px]"
              >
                <Sparkles :size="10" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
                <span class="font-semibold text-mute-2">{{ f.label }}:</span>
                <span class="text-ink">{{ f.value }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Modern stack -->
      <div class="p-5 md:p-6 bg-white">
        <div class="flex items-center justify-between gap-3">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Modern stack
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-alt px-2 py-0.5 text-[11px] font-semibold text-mute-2">
            <Sparkles :size="11" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
            Cloud · AI · SaaS
          </span>
        </div>

        <div class="mt-3 space-y-2">
          <!-- Cloud DB -->
          <div
            :class="[
              'rounded-xl border bg-white p-3 transition-colors',
              stage >= 2 ? 'border-cyan-brand/40' : 'border-line',
            ]"
          >
            <div class="flex items-center gap-2.5">
              <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-cyan-brand-deep ring-1 ring-cyan-brand/25">
                <Database :size="16" :stroke-width="1.9" aria-hidden="true" />
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-[13.5px] font-semibold text-ink leading-tight">
                  Cloud database
                </div>
                <div class="font-mono text-[11.5px] text-mute truncate">
                  {{ cfg.modern.db.table }}
                </div>
              </div>
              <span
                :class="[
                  'inline-flex h-1.5 w-1.5 rounded-full',
                  stage >= 2 ? 'bg-cyan-brand' : 'bg-mute-2/40',
                ]"
                aria-hidden="true"
              />
            </div>
            <div
              v-if="stage >= 2"
              class="mt-2 rounded-lg bg-surface-alt/60 px-2 py-1 font-mono text-[11px] text-ink-soft"
            >
              upsert · {{ cfg.modern.db.rowKey }}
            </div>
          </div>

          <!-- AI agent -->
          <div
            :class="[
              'rounded-xl border bg-white p-3 transition-colors',
              stage >= 3 ? 'border-cyan-brand/40' : 'border-line',
            ]"
          >
            <div class="flex items-center gap-2.5">
              <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-cyan-brand-deep ring-1 ring-cyan-brand/25">
                <Wand2 :size="16" :stroke-width="1.9" aria-hidden="true" />
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-[13.5px] font-semibold text-ink leading-tight">
                  AI agent
                </div>
                <div class="text-[11.5px] text-mute truncate">
                  Enrich · classify · suggest action
                </div>
              </div>
              <span
                :class="[
                  'inline-flex h-1.5 w-1.5 rounded-full',
                  stage >= 3 ? 'bg-cyan-brand' : 'bg-mute-2/40',
                ]"
                aria-hidden="true"
              />
            </div>
            <div
              v-if="stage >= 3"
              class="mt-2 rounded-lg border border-cyan-brand/20 bg-cyan-brand/[0.05] p-2 text-[11.5px] leading-snug text-ink"
            >
              {{ cfg.aiSummary }}
            </div>
          </div>

          <!-- SaaS -->
          <div
            :class="[
              'rounded-xl border bg-white p-3 transition-colors',
              stage >= 4 ? 'border-cyan-brand/40' : 'border-line',
            ]"
          >
            <div class="flex items-center gap-2.5">
              <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-cyan-brand-deep ring-1 ring-cyan-brand/25">
                <component :is="cfg.modern.saas.icon" :size="16" :stroke-width="1.9" aria-hidden="true" />
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-[13.5px] font-semibold text-ink leading-tight">
                  {{ cfg.modern.saas.name }}
                </div>
                <div class="text-[11.5px] text-mute truncate">
                  {{ cfg.modern.saas.action }}
                </div>
              </div>
              <span
                :class="[
                  'inline-flex h-1.5 w-1.5 rounded-full',
                  stage >= 4 ? 'bg-cyan-brand' : 'bg-mute-2/40',
                ]"
                aria-hidden="true"
              />
            </div>
          </div>

          <!-- Write-back arrow back to legacy -->
          <div
            :class="[
              'mt-3 rounded-xl border border-dashed p-3 text-center transition-colors',
              stage >= 4 ? 'border-cyan-brand/40 bg-cyan-brand/[0.05]' : 'border-line bg-surface-alt/40',
            ]"
          >
            <div class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              <ArrowDown :size="12" :stroke-width="2" aria-hidden="true" />
              Write back to legacy
            </div>
            <div class="mt-1 text-[12.5px] text-ink leading-snug">
              <span v-if="stage >= 4" class="font-semibold text-cyan-brand-deep">
                {{ cfg.writeBack }}
              </span>
              <span v-else class="text-mute">
                Posts back through {{ cfg.surface.toLowerCase() }} · no legacy code touched
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trigger panel + log -->
    <div class="border-t border-line bg-surface-alt/40 p-5 md:p-6">
      <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        <!-- Triggers -->
        <div>
          <div class="flex items-center justify-between gap-3">
            <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
              Trigger an event
            </div>
            <span v-if="isAnimating" class="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-cyan-brand-deep">
              <Loader2 :size="12" :stroke-width="2" class="animate-spin" aria-hidden="true" />
              Bridging…
            </span>
          </div>
          <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              v-for="lg in (Object.values(legacies) as LegacyConfig[])"
              :key="lg.id"
              type="button"
              :class="[
                'group flex flex-col items-start gap-1.5 rounded-xl border bg-white px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                activeLegacy === lg.id
                  ? 'border-cyan-brand/50 ring-1 ring-cyan-brand/20 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.18)]'
                  : 'border-line hover:border-cyan-brand/35',
              ]"
              @click="fire(lg.id)"
            >
              <div class="flex items-center gap-2">
                <component
                  :is="lg.id === 'excel' ? FileSpreadsheet : lg.id === 'erp' ? Terminal : MonitorCog"
                  :size="15"
                  :stroke-width="1.9"
                  :class="activeLegacy === lg.id ? 'text-cyan-brand-deep' : 'text-mute-2'"
                  aria-hidden="true"
                />
                <span class="text-[11px] uppercase tracking-[0.16em] font-semibold text-mute-2">
                  {{ lg.short }}
                </span>
              </div>
              <span class="text-[13.5px] font-semibold leading-tight text-ink">
                {{ lg.triggerLabel }}
              </span>
              <span class="inline-flex items-center gap-1 text-[11.5px] font-semibold text-cyan-brand-deep">
                Fire
                <ArrowRight :size="11" :stroke-width="2" class="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>

        <!-- Log -->
        <div>
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Recent activity
          </div>
          <div class="mt-3 rounded-xl border border-line bg-white overflow-hidden">
            <ul v-if="log.length" class="divide-y divide-line">
              <li
                v-for="(entry, i) in log"
                :key="`${entry.time}-${i}`"
                class="flex items-center gap-2.5 px-3 py-2"
              >
                <span class="font-mono text-[11px] tabular-nums text-mute-2 shrink-0">
                  {{ entry.time }}
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-alt px-1.5 py-0.5 text-[10.5px] font-semibold text-mute-2 shrink-0">
                  <component
                    :is="entry.legacy === 'excel' ? FileSpreadsheet : entry.legacy === 'erp' ? Terminal : MonitorCog"
                    :size="10"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                  {{ legacies[entry.legacy].short }}
                </span>
                <span class="text-[12px] text-ink truncate">{{ entry.label }}</span>
                <CheckCircle2 :size="13" :stroke-width="2" class="ml-auto shrink-0 text-cyan-brand-deep" aria-hidden="true" />
              </li>
            </ul>
            <div v-else class="px-3 py-3 text-[12.5px] text-mute">
              Trigger an event to see the bridge fire.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .animate-spin { animation: none !important; }
}
</style>
