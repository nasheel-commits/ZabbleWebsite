<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, ArrowDown, BookOpen, Building2, CheckCircle2, Clock, FileText, Landmark, Mail, Receipt, Repeat, ScrollText, ShieldAlert, Table, Undo2, Workflow, Zap } from '@lucide/vue'

import type { Component } from 'vue'

type EventId =
  | 'sign-project'
  | 'ship-milestone'
  | 'renew-retainer'
  | 'refund-client'
  | 'bank-deposit'
  | 'contractor-invoice'

interface EventDef {
  id: EventId
  label: string
  detail: string
  icon: Component
}

const events: EventDef[] = [
  { id: 'sign-project',       label: 'Sign $50K project',           detail: 'Acme Corp · Class X build',  icon: FileText },
  { id: 'ship-milestone',     label: 'Ship milestone 2',            detail: 'Acme Corp · $12,500 stage',  icon: Workflow },
  { id: 'renew-retainer',     label: 'Renew retainer (3 clients)',  detail: '$8,500/mo × 3 = $25,500',    icon: Repeat },
  { id: 'refund-client',      label: 'Refund client',               detail: 'Beta Co · $4,800',           icon: Undo2 },
  { id: 'bank-deposit',       label: 'Receive bank deposit',        detail: '$50,000 · Acme Corp',        icon: Landmark },
  { id: 'contractor-invoice', label: 'Contractor invoice received', detail: 'Jane Park · $7,200',         icon: Receipt },
]

const activeEventId = ref<EventId>('sign-project')
const splitRetainer = ref(false)
const vatOnClassX = ref(false)
const manualMode = ref(false)

const activeEvent = computed(() => events.find((e) => e.id === activeEventId.value)!)

function fire(id: EventId) {
  activeEventId.value = id
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US')

interface JournalLine {
  account: string
  debit?: number
  credit?: number
  cc?: string
}

interface EngineOutput {
  artefactKind: string
  artefactLabel: string
  artefactRef: string
  artefactIcon: Component
  ruleId: string
  ruleDescription: string
  lines: JournalLine[]
  ledgers: { name: string; chip: string }[]
  notes: string[]
}

const engineOutput = computed<EngineOutput>(() => {
  switch (activeEventId.value) {
    case 'sign-project': {
      const lines: JournalLine[] = vatOnClassX.value
        ? [
            { account: 'Accounts Receivable',   debit: 60000 },
            { account: 'Revenue · Consulting',                    credit: 50000 },
            { account: 'VAT Payable',                              credit: 10000 },
          ]
        : [
            { account: 'Accounts Receivable',   debit: 50000 },
            { account: 'Revenue · Consulting',                    credit: 50000 },
          ]
      return {
        artefactKind:  'Invoice',
        artefactLabel: 'Invoice generated and emailed',
        artefactRef:   'INV-1042',
        artefactIcon:  Receipt,
        ruleId:        'project.signed → issue-invoice (class X)',
        ruleDescription: vatOnClassX.value
          ? 'New project of class X. VAT applied at 20%. Books AR, revenue, and VAT liability.'
          : 'New project of class X. No VAT. Books AR and revenue.',
        lines,
        ledgers: [
          { name: 'AR · Trade Debtors',   chip: 'AR' },
          { name: 'Revenue · Consulting', chip: 'REV' },
          ...(vatOnClassX.value ? [{ name: 'VAT Payable', chip: 'VAT' }] : []),
        ],
        notes: [
          'Invoice emailed to Acme AP automatically · Net 30.',
          'Reminder cadence scheduled at day 14, 21, 28.',
        ],
      }
    }
    case 'ship-milestone': {
      return {
        artefactKind:  'Invoice',
        artefactLabel: 'Milestone invoice generated',
        artefactRef:   'INV-1043',
        artefactIcon:  Receipt,
        ruleId:        'project.milestone.shipped → invoice + recognise-revenue',
        ruleDescription:
          'Milestone marked shipped in the project tool. Engine bills the stage amount and recognises revenue immediately.',
        lines: [
          { account: 'Accounts Receivable',   debit: 12500 },
          { account: 'Revenue · Consulting',                    credit: 12500 },
        ],
        ledgers: [
          { name: 'AR · Trade Debtors',   chip: 'AR' },
          { name: 'Revenue · Consulting', chip: 'REV' },
        ],
        notes: ['Linked back to project Acme Corp · Phase 2.'],
      }
    }
    case 'renew-retainer': {
      const total = 25500
      const lines: JournalLine[] = splitRetainer.value
        ? [
            { account: 'Accounts Receivable',   debit: total },
            { account: 'Revenue · Retainers',                     credit: 15300, cc: 'CC · Delivery' },
            { account: 'Revenue · Retainers',                     credit: 10200, cc: 'CC · Advisory' },
          ]
        : [
            { account: 'Accounts Receivable',   debit: total },
            { account: 'Revenue · Retainers',                     credit: total },
          ]
      return {
        artefactKind:  'Recurring charge',
        artefactLabel: '3 recurring invoices generated',
        artefactRef:   'INV-RTN-MAY × 3',
        artefactIcon:  Repeat,
        ruleId:        'subscription.renewal.due → issue-recurring-invoices',
        ruleDescription: splitRetainer.value
          ? 'Monthly retainer cycle. Revenue split 60/40 between Delivery and Advisory cost centres.'
          : 'Monthly retainer cycle. Single revenue line per client.',
        lines,
        ledgers: [
          { name: 'AR · Trade Debtors',  chip: 'AR' },
          { name: 'Revenue · Retainers', chip: 'REV' },
          ...(splitRetainer.value ? [{ name: 'Cost-centre tags applied', chip: 'CC' }] : []),
        ],
        notes: ['Payment due date set to invoice date + 14.'],
      }
    }
    case 'refund-client': {
      return {
        artefactKind:  'Payout',
        artefactLabel: 'Refund payout queued',
        artefactRef:   'PAY-RF-204',
        artefactIcon:  Undo2,
        ruleId:        'client.refund.issued → reverse-revenue + payout',
        ruleDescription:
          'Refund issued. Reverses the original revenue and books the cash outflow against the operating account.',
        lines: [
          { account: 'Revenue · Consulting',  debit: 4800 },
          { account: 'Cash · Operating',                         credit: 4800 },
        ],
        ledgers: [
          { name: 'Revenue · Consulting', chip: 'REV' },
          { name: 'Cash · Operating',     chip: 'CASH' },
        ],
        notes: ['Linked to original invoice INV-0998 · refund reason logged.'],
      }
    }
    case 'bank-deposit': {
      return {
        artefactKind:  'Journal entry',
        artefactLabel: 'Receipt posted · AR cleared',
        artefactRef:   'JE-7790',
        artefactIcon:  ScrollText,
        ruleId:        'bank.deposit.received → match-invoice + post-receipt',
        ruleDescription:
          'Bank feed deposit matched to outstanding invoice by amount and reference. AR cleared automatically.',
        lines: [
          { account: 'Cash · Operating',     debit: 50000 },
          { account: 'Accounts Receivable',                      credit: 50000 },
        ],
        ledgers: [
          { name: 'Cash · Operating',    chip: 'CASH' },
          { name: 'AR · Trade Debtors',  chip: 'AR' },
        ],
        notes: ['Matched to INV-1042 with 100% confidence.'],
      }
    }
    case 'contractor-invoice': {
      return {
        artefactKind:  'Journal entry',
        artefactLabel: 'AP recorded · cost-of-services booked',
        artefactRef:   'JE-7791',
        artefactIcon:  ScrollText,
        ruleId:        'vendor.invoice.received → record-AP + post-cogs',
        ruleDescription:
          'Contractor invoice parsed and matched to project. COGS booked against the project class.',
        lines: [
          { account: 'COGS · Subcontractor', debit: 7200 },
          { account: 'Accounts Payable',                         credit: 7200 },
        ],
        ledgers: [
          { name: 'COGS · Subcontractor', chip: 'COGS' },
          { name: 'AP · Trade Creditors', chip: 'AP' },
        ],
        notes: ['Cost allocated to Acme Corp · Class X · Phase 2.'],
      }
    }
  }
})

interface ManualStep {
  actor: string
  action: string
  risk: boolean
}

interface ManualOutput {
  steps: ManualStep[]
  eta: string
  risk: string
}

const manualOutput = computed<ManualOutput>(() => {
  switch (activeEventId.value) {
    case 'sign-project':
      return {
        steps: [
          { actor: 'Sales',      action: 'Emails finance "deal signed"',              risk: false },
          { actor: 'Finance',    action: 'Updates pipeline spreadsheet · next morning', risk: false },
          { actor: 'Bookkeeper', action: 'Raises invoice in QuickBooks by hand',      risk: false },
          { actor: 'Bookkeeper', action: 'Types journal entry · revenue line guessed', risk: true },
        ],
        eta: '2–3 days',
        risk: 'Revenue often posted to the wrong account · class-X VAT was missed last quarter.',
      }
    case 'ship-milestone':
      return {
        steps: [
          { actor: 'PM',         action: 'Marks "milestone done" in the project tool',  risk: false },
          { actor: 'Finance',    action: 'Notices via the weekly status email',         risk: false },
          { actor: 'Bookkeeper', action: 'Invoices the milestone · sometimes weeks late', risk: true },
        ],
        eta: '1–4 weeks',
        risk: 'Revenue recognition slips into the wrong period · cash collected later.',
      }
    case 'renew-retainer':
      return {
        steps: [
          { actor: 'Bookkeeper', action: 'Opens the "retainers due" spreadsheet',       risk: false },
          { actor: 'Bookkeeper', action: 'Manually generates 3 invoices in QuickBooks', risk: false },
          { actor: 'Client',     action: 'Pings finance, one renewal was missed last month', risk: true },
        ],
        eta: '1 day · if remembered',
        risk: 'One retainer was missed last May. $8,500 of revenue went uncollected.',
      }
    case 'refund-client':
      return {
        steps: [
          { actor: 'Support',    action: 'Emails finance · refund approved',           risk: false },
          { actor: 'Bookkeeper', action: 'Processes the refund in Stripe',             risk: false },
          { actor: 'Bookkeeper', action: 'Forgets to reverse revenue · P&L overstated', risk: true },
        ],
        eta: 'Same day for cash · weeks for books',
        risk: 'P&L overstated until the next manual reconciliation pass.',
      }
    case 'bank-deposit':
      return {
        steps: [
          { actor: 'Finance',    action: 'Downloads the bank statement weekly',         risk: false },
          { actor: 'Junior',     action: 'Matches deposits to invoices in Excel · VLOOKUP', risk: false },
          { actor: 'Junior',     action: '40% of lines need a follow-up email',          risk: true },
        ],
        eta: 'Half a day · every week',
        risk: 'AR clears late · cash position misleading mid-month.',
      }
    case 'contractor-invoice':
      return {
        steps: [
          { actor: 'Contractor', action: 'Emails a PDF invoice',                        risk: false },
          { actor: 'Ops',        action: 'Forwards to finance a few days later',       risk: false },
          { actor: 'Bookkeeper', action: 'Types invoice into AP · occasionally mis-keyed', risk: true },
        ],
        eta: '5–10 days to record',
        risk: 'Cash flow surprises · project margins reported late.',
      }
  }
})

// Reconciliation strip
interface Deposit {
  id: string
  date: string
  amount: number
  ref: string
  matched?: { invoice: string; confidence: number }
}

const deposits: Deposit[] = [
  { id: 'BD-2041', date: 'May 19', amount: 50000, ref: 'ACM-2026-04-01',  matched: { invoice: 'INV-1042',        confidence: 100 } },
  { id: 'BD-2042', date: 'May 20', amount: 8500,  ref: 'BETA RTNR MAY',    matched: { invoice: 'INV-RTN-2026-05', confidence: 96 } },
  { id: 'BD-2043', date: 'May 20', amount: 12500, ref: 'ACME PHASE 2',     matched: { invoice: 'INV-1043',        confidence: 88 } },
  { id: 'BD-2044', date: 'May 20', amount: 4800,  ref: 'BETA REFUND RVS',  matched: { invoice: 'INV-0998',        confidence: 72 } },
  { id: 'BD-2045', date: 'May 21', amount: 1250,  ref: 'J P TRSFR' },
]

const matched = computed(() => deposits.filter((d) => d.matched && d.matched.confidence >= 85))
const reviewQueue = computed(() => deposits.filter((d) => d.matched && d.matched.confidence < 85))
const unmatched = computed(() => deposits.filter((d) => !d.matched))

function confidenceTone(confidence: number) {
  if (confidence >= 95) return 'high'
  if (confidence >= 80) return 'mid'
  return 'low'
}

</script>

<template>
  <div class="bg-white text-ink">
    <!-- Header -->
    <header
      class="flex flex-col gap-4 border-b border-line p-5 md:p-7 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          <span class="dot" />
          Accounting Engine
        </div>
        <h3 class="mt-3 font-display text-[24px] md:text-[28px] leading-[1.12] text-ink">
          Books that follow the work.
        </h3>
        <p class="mt-2 max-w-xl text-[14.5px] leading-[1.55] text-mute">
          Fire an operational event on the left. The engine matches a rule, generates the right
          artefact, and posts the entry to the correct ledger.
        </p>
      </div>

      <button
        type="button"
        :aria-pressed="manualMode"
        class="group inline-flex items-center gap-2.5 self-start rounded-full border border-line bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        @click="manualMode = !manualMode"
      >
        <span
          :class="[
            'relative inline-block h-5 w-9 rounded-full border transition-colors',
            manualMode
              ? 'border-red-100 bg-[#FEF2F2]'
              : 'border-cyan-brand-deep/30 bg-cyan-brand/15',
          ]"
          aria-hidden="true"
        >
          <span
            :class="[
              'absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
              manualMode ? 'translate-x-4' : 'translate-x-0.5',
            ]"
          />
        </span>
        <span class="flex items-center gap-1.5">
          <component
            :is="manualMode ? ShieldAlert : Zap"
            :size="14"
            :stroke-width="2"
            :class="manualMode ? 'text-[#DC2626]' : 'text-cyan-brand-deep'"
            aria-hidden="true"
          />
          {{ manualMode ? 'Manual mode' : 'Engine mode' }}
        </span>
      </button>
    </header>

    <!-- Body grid -->
    <div class="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <!-- LEFT: events + rule editor -->
      <div class="border-b border-line lg:border-b-0 lg:border-r p-5 md:p-7">
        <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
          Fire an event
        </div>

        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            v-for="ev in events"
            :key="ev.id"
            type="button"
            :aria-pressed="activeEventId === ev.id"
            :class="[
              'group flex items-start gap-3 rounded-xl border bg-white px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              activeEventId === ev.id
                ? 'border-cyan-brand/50 ring-1 ring-cyan-brand/20 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.18)]'
                : 'border-line hover:border-cyan-brand/35',
            ]"
            @click="fire(ev.id)"
          >
            <span
              :class="[
                'inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-lg ring-1 transition-colors',
                activeEventId === ev.id
                  ? 'bg-cyan-brand/12 text-cyan-brand-deep ring-cyan-brand/25'
                  : 'bg-surface-alt text-mute-2 ring-line group-hover:text-cyan-brand-deep',
              ]"
              aria-hidden="true"
            >
              <component :is="ev.icon" :size="17" :stroke-width="1.85" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-[14px] font-semibold leading-tight text-ink">
                {{ ev.label }}
              </span>
              <span class="mt-0.5 block text-[12.5px] leading-snug text-mute">
                {{ ev.detail }}
              </span>
            </span>
          </button>
        </div>

        <!-- Rule editor -->
        <div class="mt-7">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Rule config
          </div>
          <p class="mt-1.5 text-[12.5px] text-mute-2">
            Flip a toggle and re-fire the same event to see different entries land.
          </p>

          <div class="mt-3 space-y-2">
            <button
              type="button"
              :aria-pressed="splitRetainer"
              class="flex w-full items-start justify-between gap-3 rounded-xl border border-line bg-white px-3.5 py-3 text-left transition-colors hover:border-cyan-brand/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              @click="splitRetainer = !splitRetainer"
            >
              <span class="flex-1">
                <span class="block text-[14px] font-semibold leading-tight text-ink">
                  Split retainer 60/40 between cost centres
                </span>
                <span class="mt-0.5 block text-[12.5px] leading-snug text-mute">
                  Applies to <code class="text-[12px] font-mono text-ink-soft">subscription.renewal.due</code> events.
                </span>
              </span>
              <span
                :class="[
                  'relative inline-block h-5 w-9 shrink-0 rounded-full border transition-colors',
                  splitRetainer
                    ? 'border-cyan-brand-deep/30 bg-cyan-brand'
                    : 'border-line bg-surface-alt',
                ]"
                aria-hidden="true"
              >
                <span
                  :class="[
                    'absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    splitRetainer ? 'translate-x-4' : 'translate-x-0.5',
                  ]"
                />
              </span>
            </button>

            <button
              type="button"
              :aria-pressed="vatOnClassX"
              class="flex w-full items-start justify-between gap-3 rounded-xl border border-line bg-white px-3.5 py-3 text-left transition-colors hover:border-cyan-brand/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              @click="vatOnClassX = !vatOnClassX"
            >
              <span class="flex-1">
                <span class="block text-[14px] font-semibold leading-tight text-ink">
                  VAT on for project class X
                </span>
                <span class="mt-0.5 block text-[12.5px] leading-snug text-mute">
                  Adds 20% VAT to class-X invoices and books the liability.
                </span>
              </span>
              <span
                :class="[
                  'relative inline-block h-5 w-9 shrink-0 rounded-full border transition-colors',
                  vatOnClassX
                    ? 'border-cyan-brand-deep/30 bg-cyan-brand'
                    : 'border-line bg-surface-alt',
                ]"
                aria-hidden="true"
              >
                <span
                  :class="[
                    'absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    vatOnClassX ? 'translate-x-4' : 'translate-x-0.5',
                  ]"
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT: chain of evidence -->
      <div class="p-5 md:p-7 bg-surface-alt/40">
        <div class="flex items-center justify-between gap-3">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Chain of evidence
          </div>
          <div
            :class="[
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold',
              manualMode
                ? 'border-red-100 bg-[#FEF2F2] text-[#DC2626]'
                : 'border-line bg-white text-cyan-brand-deep',
            ]"
          >
            <span
              :class="['h-1.5 w-1.5 rounded-full', manualMode ? 'bg-[#DC2626]' : 'bg-cyan-brand']"
              aria-hidden="true"
            />
            {{ manualMode ? 'Manual workflow' : 'Engine output' }}
          </div>
        </div>

        <!-- Engine chain -->
        <div v-if="!manualMode" class="mt-4 space-y-2.5">
          <!-- Step 1: Event -->
          <div class="rounded-xl border border-line bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-alt text-[11px] font-semibold text-mute-2 ring-1 ring-line">
                  1
                </span>
                <span class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">Event</span>
              </div>
              <code class="rounded bg-surface-alt px-2 py-0.5 text-[11.5px] font-mono text-ink-soft">
                evt_{{ activeEventId.replace(/-/g, '_') }}
              </code>
            </div>
            <div class="mt-2.5 flex items-start gap-2.5">
              <component :is="activeEvent.icon" :size="18" :stroke-width="1.85" class="mt-0.5 text-cyan-brand-deep" aria-hidden="true" />
              <div>
                <div class="text-[14.5px] font-semibold text-ink leading-tight">
                  {{ activeEvent.label }}
                </div>
                <div class="mt-0.5 text-[13px] text-mute">
                  {{ activeEvent.detail }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-center text-mute-2">
            <ArrowDown :size="14" :stroke-width="2" aria-hidden="true" />
          </div>

          <!-- Step 2: Rule -->
          <div class="rounded-xl border border-line bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-alt text-[11px] font-semibold text-mute-2 ring-1 ring-line">
                  2
                </span>
                <span class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">Matched rule</span>
              </div>
              <BookOpen :size="14" :stroke-width="1.9" class="text-mute-2" aria-hidden="true" />
            </div>
            <div class="mt-2.5">
              <code class="block text-[13px] font-mono text-ink break-words">
                {{ engineOutput.ruleId }}
              </code>
              <p class="mt-1.5 text-[13px] leading-snug text-mute">
                {{ engineOutput.ruleDescription }}
              </p>
            </div>
          </div>

          <div class="flex justify-center text-mute-2">
            <ArrowDown :size="14" :stroke-width="2" aria-hidden="true" />
          </div>

          <!-- Step 3: Entry / artefact -->
          <div class="rounded-xl border border-line bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-alt text-[11px] font-semibold text-mute-2 ring-1 ring-line">
                  3
                </span>
                <span class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                  {{ engineOutput.artefactKind }}
                </span>
              </div>
              <code class="rounded bg-surface-alt px-2 py-0.5 text-[11.5px] font-mono text-ink-soft">
                {{ engineOutput.artefactRef }}
              </code>
            </div>
            <div class="mt-2.5 flex items-start gap-2.5">
              <component :is="engineOutput.artefactIcon" :size="18" :stroke-width="1.85" class="mt-0.5 text-cyan-brand-deep" aria-hidden="true" />
              <div class="flex-1">
                <div class="text-[14px] font-semibold text-ink leading-tight">
                  {{ engineOutput.artefactLabel }}
                </div>
                <div class="mt-3 overflow-x-auto rounded-lg border border-line">
                  <table class="w-full text-[12.5px] min-w-[320px]">
                    <thead class="bg-surface-alt text-mute-2">
                      <tr>
                        <th class="px-2.5 py-1.5 text-left font-semibold uppercase tracking-[0.12em] text-[10.5px]">Account</th>
                        <th class="px-2.5 py-1.5 text-right font-semibold uppercase tracking-[0.12em] text-[10.5px]">Debit</th>
                        <th class="px-2.5 py-1.5 text-right font-semibold uppercase tracking-[0.12em] text-[10.5px]">Credit</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-line">
                      <tr v-for="(line, i) in engineOutput.lines" :key="i" class="bg-white">
                        <td class="px-2.5 py-1.5 text-ink">
                          {{ line.account }}
                          <span v-if="line.cc" class="ml-1 inline-flex items-center rounded-full bg-cyan-brand/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-cyan-brand-deep">
                            {{ line.cc }}
                          </span>
                        </td>
                        <td class="px-2.5 py-1.5 text-right font-mono tabular-nums text-ink">
                          <span v-if="line.debit">{{ fmt(line.debit) }}</span>
                        </td>
                        <td class="px-2.5 py-1.5 text-right font-mono tabular-nums text-ink">
                          <span v-if="line.credit">{{ fmt(line.credit) }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-center text-mute-2">
            <ArrowDown :size="14" :stroke-width="2" aria-hidden="true" />
          </div>

          <!-- Step 4: Ledgers -->
          <div class="rounded-xl border border-line bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-alt text-[11px] font-semibold text-mute-2 ring-1 ring-line">
                  4
                </span>
                <span class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">Posted to ledger</span>
              </div>
              <Building2 :size="14" :stroke-width="1.9" class="text-mute-2" aria-hidden="true" />
            </div>
            <div class="mt-2.5 flex flex-wrap gap-1.5">
              <span
                v-for="l in engineOutput.ledgers"
                :key="l.name"
                class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-alt px-2.5 py-1 text-[12px] text-ink"
              >
                <span class="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono font-semibold text-cyan-brand-deep ring-1 ring-cyan-brand/20">
                  {{ l.chip }}
                </span>
                {{ l.name }}
              </span>
            </div>
            <ul v-if="engineOutput.notes.length" class="mt-3 space-y-1">
              <li
                v-for="note in engineOutput.notes"
                :key="note"
                class="flex items-start gap-1.5 text-[12.5px] text-mute"
              >
                <CheckCircle2 :size="13" :stroke-width="2" class="mt-0.5 shrink-0 text-cyan-brand-deep" aria-hidden="true" />
                <span>{{ note }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Manual chain -->
        <div v-else class="mt-4 space-y-2.5">
          <div class="rounded-xl border border-[#FEE2E2] bg-[#FEF2F2]/60 p-4">
            <div class="flex items-start gap-2.5">
              <ShieldAlert :size="18" :stroke-width="1.9" class="mt-0.5 shrink-0 text-[#DC2626]" aria-hidden="true" />
              <div>
                <div class="text-[14px] font-semibold leading-tight text-ink">
                  Same event · spreadsheets and email
                </div>
                <div class="mt-0.5 text-[13px] leading-snug text-mute">
                  No engine. The work happens through inboxes, ad-hoc spreadsheets, and memory.
                </div>
              </div>
            </div>
          </div>

          <ol class="space-y-2">
            <li
              v-for="(step, i) in manualOutput.steps"
              :key="i"
              :class="[
                'flex items-start gap-3 rounded-xl border bg-white px-3.5 py-3',
                step.risk ? 'border-[#FEE2E2]' : 'border-line',
              ]"
            >
              <span
                :class="[
                  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ring-1',
                  step.risk
                    ? 'bg-[#FEF2F2] text-[#DC2626] ring-[#FEE2E2]'
                    : 'bg-surface-alt text-mute-2 ring-line',
                ]"
              >
                {{ i + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <component
                    :is="step.risk ? AlertTriangle : (i === 0 ? Mail : Table)"
                    :size="13"
                    :stroke-width="2"
                    :class="step.risk ? 'text-[#DC2626]' : 'text-mute-2'"
                    aria-hidden="true"
                  />
                  <span class="text-[11.5px] uppercase tracking-[0.16em] font-semibold text-mute-2">
                    {{ step.actor }}
                  </span>
                </div>
                <div class="mt-1 text-[13.5px] leading-snug text-ink">
                  {{ step.action }}
                </div>
              </div>
            </li>
          </ol>

          <div class="rounded-xl border border-line bg-white p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div class="flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                  <Clock :size="12" :stroke-width="2" aria-hidden="true" />
                  Time to book
                </div>
                <div class="mt-1.5 font-display text-[20px] leading-[1.1] text-ink">
                  {{ manualOutput.eta }}
                </div>
              </div>
              <div>
                <div class="flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-[#DC2626]">
                  <AlertTriangle :size="12" :stroke-width="2" aria-hidden="true" />
                  What goes wrong
                </div>
                <div class="mt-1.5 text-[13px] leading-snug text-mute">
                  {{ manualOutput.risk }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reconciliation strip -->
    <div class="border-t border-line bg-surface-alt/40 p-5 md:p-7">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Reconciliation · live bank feed
          </div>
          <p class="mt-1.5 text-[13px] text-mute">
            Deposits arriving from the bank. The engine matches each one to an outstanding invoice
            and posts the receipt, exceptions land in a small queue.
          </p>
        </div>
        <div
          v-if="!manualMode"
          class="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-cyan-brand" aria-hidden="true" />
          Auto-matching
        </div>
      </div>

      <div v-if="!manualMode" class="mt-4 grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-4">
        <!-- Matched + review queue -->
        <div class="rounded-xl border border-line bg-white overflow-hidden">
          <div class="flex items-center justify-between gap-3 border-b border-line bg-surface-alt/60 px-3.5 py-2">
            <span class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              Incoming
            </span>
            <span class="text-[11.5px] text-mute">
              {{ matched.length + reviewQueue.length }} of {{ deposits.length }} matched
            </span>
          </div>
          <ul class="divide-y divide-line">
            <li
              v-for="d in [...matched, ...reviewQueue]"
              :key="d.id"
              class="flex items-center gap-3 px-3.5 py-2.5"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono tabular-nums text-[13.5px] font-semibold text-ink">
                    {{ fmt(d.amount) }}
                  </span>
                  <span class="text-[11.5px] text-mute-2">· {{ d.date }}</span>
                </div>
                <div class="mt-0.5 flex items-center gap-1.5 text-[12px] text-mute truncate">
                  <span class="font-mono text-[11.5px] text-ink-soft">{{ d.ref }}</span>
                  <span v-if="d.matched" class="text-mute-2">→</span>
                  <span v-if="d.matched" class="font-mono text-[11.5px] text-cyan-brand-deep">
                    {{ d.matched.invoice }}
                  </span>
                </div>
              </div>
              <span
                v-if="d.matched"
                :class="[
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  confidenceTone(d.matched.confidence) === 'high'
                    ? 'bg-cyan-brand/15 text-cyan-brand-deep ring-1 ring-cyan-brand/25'
                    : confidenceTone(d.matched.confidence) === 'mid'
                    ? 'bg-surface-alt text-ink ring-1 ring-line'
                    : 'bg-[#FEF2F2] text-[#DC2626] ring-1 ring-[#FEE2E2]',
                ]"
              >
                <CheckCircle2
                  v-if="confidenceTone(d.matched.confidence) === 'high'"
                  :size="12"
                  :stroke-width="2"
                  aria-hidden="true"
                />
                <AlertTriangle
                  v-else
                  :size="12"
                  :stroke-width="2"
                  aria-hidden="true"
                />
                {{ d.matched.confidence }}%
              </span>
            </li>
          </ul>
        </div>

        <!-- Exception queue -->
        <div class="rounded-xl border border-line bg-white overflow-hidden">
          <div class="flex items-center justify-between gap-3 border-b border-line bg-surface-alt/60 px-3.5 py-2">
            <span class="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              <AlertTriangle :size="12" :stroke-width="2" aria-hidden="true" />
              Exceptions
            </span>
            <span class="text-[11.5px] text-mute">
              {{ unmatched.length }} waiting
            </span>
          </div>
          <ul v-if="unmatched.length" class="divide-y divide-line">
            <li
              v-for="d in unmatched"
              :key="d.id"
              class="px-3.5 py-2.5"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono tabular-nums text-[13.5px] font-semibold text-ink">
                  {{ fmt(d.amount) }}
                </span>
                <span class="text-[11.5px] text-mute-2">· {{ d.date }}</span>
              </div>
              <div class="mt-0.5 text-[12px] text-mute">
                <span class="font-mono text-[11.5px] text-ink-soft">{{ d.ref }}</span>
                <span class="ml-1">- no matching invoice</span>
              </div>
              <div class="mt-1.5 text-[11.5px] text-mute-2">
                Flagged for human review · won't touch the ledger.
              </div>
            </li>
          </ul>
          <div v-else class="px-3.5 py-4 text-[12.5px] text-mute">
            No exceptions in queue.
          </div>
        </div>
      </div>

      <!-- Manual mode: reconciliation overlay -->
      <div v-else class="mt-4 rounded-xl border border-[#FEE2E2] bg-white p-4">
        <div class="flex items-start gap-3">
          <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#DC2626] ring-1 ring-[#FEE2E2]">
            <Table :size="18" :stroke-width="1.9" aria-hidden="true" />
          </span>
          <div class="flex-1">
            <div class="text-[14px] font-semibold leading-tight text-ink">
              Every deposit lands in this queue
            </div>
            <p class="mt-1 text-[13px] leading-snug text-mute">
              In manual mode there's no auto-match. A junior accountant works through the bank
              statement in Excel, VLOOKUP-ing references against open invoices. Around 10 lines an
              hour. The half-day a week that nobody enjoys.
            </p>
            <div class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div class="rounded-lg border border-line bg-surface-alt/60 p-2.5">
                <div class="font-display text-[22px] leading-[1.05] text-ink">{{ deposits.length }}</div>
                <div class="mt-0.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-mute-2">Deposits</div>
              </div>
              <div class="rounded-lg border border-line bg-surface-alt/60 p-2.5">
                <div class="font-display text-[22px] leading-[1.05] text-ink">~6m</div>
                <div class="mt-0.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-mute-2">Per line</div>
              </div>
              <div class="rounded-lg border border-line bg-surface-alt/60 p-2.5">
                <div class="font-display text-[22px] leading-[1.05] text-ink">60%</div>
                <div class="mt-0.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-mute-2">First-pass</div>
              </div>
              <div class="rounded-lg border border-line bg-surface-alt/60 p-2.5">
                <div class="font-display text-[22px] leading-[1.05] text-ink">3–5d</div>
                <div class="mt-0.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-mute-2">AR lag</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
