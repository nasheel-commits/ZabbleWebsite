<script setup lang="ts">
import { Comment, computed, h, nextTick, onMounted, ref, watch } from 'vue'
import { AlertCircle, ArrowRight, BarChart3, BookOpen, CheckCircle2, ChevronRight, Factory, FileText, Flag, GraduationCap, Landmark, Lock, MessageSquare, PenLine, Receipt, RotateCcw, ScrollText, Search, Send, ShieldCheck, Store, TrendingUp, Users, X } from '@lucide/vue'

type BusinessId = 'retail' | 'finance' | 'manufacturer'
type Mode = 'chat' | 'hire' | 'admin'
type SourceKind = 'SOP' | 'Contract' | 'Policy' | 'Pricing' | 'Procedure' | 'Memo'

interface SourceDoc {
  id: string
  kind: SourceKind
  label: string // small chip label, e.g. "SOP §3.2"
  title: string
  meta: string // version/owner line
  body: string[] // paragraphs
}

interface QA {
  id: string
  prompt: string
  unknown?: boolean
  answer: string
  citationIds: string[]
  featureSourceId?: string // onboarding: surfaced SOP card
}

interface KnowledgeBase {
  id: BusinessId
  label: string
  short: string
  icon: Component
  opsManager: string
  sources: SourceDoc[]
  staff: QA[]
  hire: QA[]
  admin: {
    totals: { questions: number; coverage: number; activeUsers: number }
    top: { label: string; count: number }[]
    gaps: { question: string; suggested: string }[]
  }
}

interface ChatTurn {
  id: number
  role: 'user' | 'assistant'
  text: string
  citationIds?: string[]
  unknown?: boolean
  qaId?: string
  featureSourceId?: string
}

// ---------------------------------------------------------------------------
// Knowledge bases
// ---------------------------------------------------------------------------

const retail: KnowledgeBase = {
  id: 'retail',
  label: 'High-turnover retail',
  short: 'Retail',
  icon: Store,
  opsManager: 'Sam Mensah',
  sources: [
    {
      id: 'sop-3-2',
      kind: 'SOP',
      label: 'SOP §3.2',
      title: 'Customer complaint handling',
      meta: 'v6 · owned by Ops · last reviewed Q1',
      body: [
        'Acknowledge every complaint within 4 hours of receipt — phone, email, or in-store. The duty manager owns acknowledgement when the complaint arrives outside an AE\'s working hours.',
        'Issue a written response within 24 hours. If the customer is dissatisfied after the first response, escalate to the duty manager and tag the case "esc-1" in the CRM.',
        'Every complaint logs a case ID. Refunds tied to a complaint follow the credit-note flow in §3.4 — they do not bypass the standard refund SOP.',
      ],
    },
    {
      id: 'contract-enterprise',
      kind: 'Contract',
      label: 'Contract — Enterprise',
      title: 'Master Services Agreement — Enterprise tier',
      meta: 'Template v9 · approved by Legal',
      body: [
        '§7.2 Refunds. Enterprise customers may request a refund within 30 days of invoice for service months not yet consumed. Refunds are pro-rated against unused months and exclude one-off setup fees.',
        '§7.3 Above threshold. Refund requests above $25,000 route through the named account manager before the credit note is issued. The account manager attaches a one-line justification to the case.',
        '§4.1 Payment terms. Standard term is NET-30. Extensions are governed by the Sales Playbook §5.',
      ],
    },
    {
      id: 'pricing-v4',
      kind: 'Pricing',
      label: 'Pricing rules v4',
      title: 'Discount approval matrix',
      meta: 'v4 · effective March · owner: Head of Sales',
      body: [
        'Up to 10% — at the AE\'s discretion. No additional approval required. Auto-logged in the pricing register.',
        '10–15% — sales manager approval. Comment field mandatory.',
        'Above 15% — head of sales approval.',
        'Above 25% — COO approval. CFO is copied automatically.',
        'Every discount is recorded against the deal in the pricing register; the register feeds the weekly margin review.',
      ],
    },
    {
      id: 'hr-7-1',
      kind: 'Policy',
      label: 'HR Policy 7.1',
      title: 'Contractor leave entitlements',
      meta: 'v3 · owned by People Ops',
      body: [
        'Contractors accrue annual leave at 1 day per 22 days worked, pro-rated to actual hours billed. Accrual is calculated monthly.',
        'Sick leave is unpaid unless the engagement contract specifies otherwise. Contractors are expected to notify their lead by 09:00 on the affected day.',
        'Bereavement: 2 paid days for immediate family, granted on application.',
        'All leave is recorded in the contractor portal. There is no carry-over across engagements.',
      ],
    },
    {
      id: 'sales-5',
      kind: 'Memo',
      label: 'Sales playbook §5',
      title: 'Payment-term flexibility',
      meta: 'Internal · revised quarterly',
      body: [
        'Standard NET-30 applies to all customers on the published price book.',
        'Accounts in good standing for 12+ months may be extended unilaterally to NET-60 by the account owner. Log the extension against the deal.',
        'Beyond NET-60 requires CFO approval. The CFO\'s decision is logged against the deal with a stated reason — the audit trail matters more than the speed.',
      ],
    },
    {
      id: 'sop-5-3',
      kind: 'SOP',
      label: 'SOP §5.3',
      title: 'End-of-shift till close-out',
      meta: 'v8 · owned by Store Ops',
      body: [
        'Count the float against the till tape. Variances over $5 raise an over/short note that the manager on duty signs off.',
        'Lock the cash drawer with the day\'s deposit slip inside. The deposit goes into the safe — never carried.',
        'Run the close-out report from the POS. Email it to the manager group; the system also files it against the day\'s shift log.',
      ],
    },
  ],
  staff: [
    {
      id: 'r-1',
      prompt: 'What\'s the refund policy for enterprise customers?',
      answer:
        'Enterprise customers can request a refund within 30 days of invoice; refunds are pro-rated against unused service months and exclude one-off setup fees. Anything above $25,000 routes through the named account manager before the credit note is issued.',
      citationIds: ['contract-enterprise', 'sop-3-2'],
    },
    {
      id: 'r-2',
      prompt: 'Can we extend payment terms on this deal?',
      answer:
        'Standard terms are NET-30. You can extend up to NET-60 unilaterally for accounts in good standing for 12+ months — just log it against the deal. Beyond NET-60 needs CFO approval, with the reason captured in the audit trail.',
      citationIds: ['sales-5', 'contract-enterprise'],
    },
    {
      id: 'r-3',
      prompt: 'What\'s the SOP for handling a complaint?',
      answer:
        'Acknowledge within 4 hours, written response within 24, and escalate to the duty manager if the customer is dissatisfied after the first response. Every complaint logs a case ID in the CRM.',
      citationIds: ['sop-3-2'],
    },
    {
      id: 'r-4',
      prompt: 'Who signs off on a discount above 15%?',
      answer:
        'Up to 10% sits with the AE. 10–15% is the sales manager. Above 15% is the head of sales — and above 25% goes to the COO with the CFO copied. Every discount auto-logs to the pricing register.',
      citationIds: ['pricing-v4'],
    },
    {
      id: 'r-5',
      prompt: 'What\'s the leave policy for contractors?',
      answer:
        'Contractors accrue annual leave at 1 day per 22 days worked, pro-rated to billed hours. Sick leave is unpaid unless the contract specifies otherwise; bereavement is 2 paid days for immediate family.',
      citationIds: ['hr-7-1'],
    },
    {
      id: 'r-unknown',
      prompt: 'What\'s our policy on accepting cryptocurrency at the till?',
      unknown: true,
      answer:
        'I don\'t have an answer for that in the current knowledge base — there\'s no policy document on cryptocurrency payments. I can flag this to the ops manager so it gets resolved and added to the playbook.',
      citationIds: [],
    },
  ],
  hire: [
    {
      id: 'r-h-1',
      prompt: 'How do I close out my till at end of shift?',
      answer:
        'Count the float against the till tape, lodge any over/short with the manager on duty, lock the cash drawer with the day\'s deposit slip inside, and run the close-out report from the POS. The full SOP is below — read it through once before your first close-out.',
      citationIds: ['sop-5-3'],
      featureSourceId: 'sop-5-3',
    },
    {
      id: 'r-h-2',
      prompt: 'Where do I log a customer complaint?',
      answer:
        'Open the CRM, find the customer record, click "New complaint", and fill in the category, severity, and your notes. The system creates a case ID and routes the case to the duty manager.',
      citationIds: ['sop-3-2'],
      featureSourceId: 'sop-3-2',
    },
  ],
  admin: {
    totals: { questions: 247, coverage: 86, activeUsers: 34 },
    top: [
      { label: 'Refund policy — enterprise', count: 32 },
      { label: 'Discount approval matrix', count: 24 },
      { label: 'Contractor leave', count: 19 },
      { label: 'Complaint handling SOP', count: 17 },
      { label: 'Payment-term extensions', count: 14 },
    ],
    gaps: [
      {
        question: 'Cryptocurrency payments at till',
        suggested: 'SOP — alternative payment methods (crypto / BNPL)',
      },
      {
        question: 'Returns over 90 days from purchase',
        suggested: 'Policy — extended returns and goodwill exceptions',
      },
      {
        question: 'Staff discount on online orders',
        suggested: 'HR Policy — employee online purchase discount',
      },
    ],
  },
}

const finance: KnowledgeBase = {
  id: 'finance',
  label: 'Compliance-heavy finance',
  short: 'Finance',
  icon: Landmark,
  opsManager: 'Priya Naidoo',
  sources: [
    {
      id: 'reg-cap',
      kind: 'Policy',
      label: 'Regulator cap table',
      title: 'Single-borrower exposure limits',
      meta: 'Statutory · refreshed annually',
      body: [
        'SME segment: 15% of CET1 capital per single borrower; 20% of CET1 per connected group.',
        'Corporate segment: 25% of CET1 capital per single borrower; 35% per connected group, subject to board credit-committee approval.',
        'Breaches trigger a same-day notification to the regulator. The credit team owns the watch list and reports weekly.',
      ],
    },
    {
      id: 'fee-2026',
      kind: 'Pricing',
      label: 'Fee schedule 2026',
      title: 'Standard fees and waivers',
      meta: 'v2026.1 · effective Jan 1 · owner: Treasury',
      body: [
        'Wire fee: $25 retail; $15 business; $0 private-wealth tier.',
        'Private-wealth accounts already enjoy the standard waiver — no further approval required. Wire-fee waivers for retail or business accounts require the branch manager\'s signoff.',
        'Annual card-fee waivers are restricted to relationship-managed accounts at the RM\'s discretion, up to two per year.',
      ],
    },
    {
      id: 'proc-pep',
      kind: 'Procedure',
      label: 'Procedure §11.6',
      title: 'PEP onboarding review',
      meta: 'v4 · owned by Compliance',
      body: [
        'Politically-Exposed Persons (PEPs) require Tier-3 KYC plus a senior-management review before the account is opened. The MLRO chairs the review.',
        'Source-of-funds documentation is mandatory: 12 months of bank statements, tax assessment, and a written declaration of source.',
        'Ongoing monitoring is enhanced — quarterly screening refresh and an annual relationship review by the RM and the compliance officer.',
      ],
    },
    {
      id: 'aml-2-4',
      kind: 'Policy',
      label: 'AML §2.4',
      title: 'Customer screening on onboarding',
      meta: 'v9 · owned by Compliance',
      body: [
        'Every new account runs sanctions screening, adverse-media check, and PEP check before the first deposit is accepted.',
        'A positive hit pauses onboarding and routes the case to the compliance queue with the screening evidence attached.',
        'Re-screening runs nightly on the full book; new hits open a case automatically and assign the relationship manager.',
      ],
    },
    {
      id: 'kyc-tier',
      kind: 'Procedure',
      label: 'KYC Tier Schedule',
      title: 'Tiered KYC requirements',
      meta: 'v7 · owned by Onboarding',
      body: [
        'Tier-1: ID + proof of address. Account limits apply. Self-service onboarding.',
        'Tier-2: Tier-1 documents plus source-of-funds declaration. Approved by onboarding analyst.',
        'Tier-3: Tier-2 documents plus enhanced due diligence pack — beneficial-ownership tree, sanctions narrative, RM sign-off. Required for high-risk segments and any PEP.',
        'Tier overrides (downgrade or expedited approval) require the head of compliance and are logged in the override register.',
      ],
    },
    {
      id: 'comp-q1',
      kind: 'Memo',
      label: 'Compliance memo Q1',
      title: 'Sanctions list refresh',
      meta: 'Internal · MLRO',
      body: [
        'Sanctions list refresh runs daily at 02:00 from OFAC, UN, EU, and the local regulator feed. The last successful refresh is published on the compliance dashboard.',
        'A failed refresh holds new onboarding until the issue is resolved. Existing accounts continue to be screened against the last good snapshot.',
        'The MLRO confirms the refresh status in the Monday standup and signs the weekly attestation.',
      ],
    },
  ],
  staff: [
    {
      id: 'f-1',
      prompt: 'What\'s the single-borrower exposure limit for SME loans?',
      answer:
        'SME single-borrower cap is 15% of CET1 capital; the connected-group cap is 20%. Breaches must be notified to the regulator the same day, and the credit team\'s watch list reports weekly.',
      citationIds: ['reg-cap'],
    },
    {
      id: 'f-2',
      prompt: 'Can I waive the wire fee on a private-wealth account?',
      answer:
        'Private-wealth accounts already carry a standard $0 wire-fee waiver — no extra approval is needed. Waivers for retail or business accounts need the branch manager\'s signoff.',
      citationIds: ['fee-2026'],
    },
    {
      id: 'f-3',
      prompt: 'What\'s the procedure for onboarding a PEP customer?',
      answer:
        'PEPs require Tier-3 KYC plus a senior-management review chaired by the MLRO. Source-of-funds docs are mandatory, and ongoing monitoring is enhanced with quarterly screening and an annual review.',
      citationIds: ['proc-pep', 'aml-2-4'],
    },
    {
      id: 'f-4',
      prompt: 'Who signs off on a Tier-3 KYC override?',
      answer:
        'KYC overrides — including Tier-3 downgrades and expedited approvals — sit with the head of compliance and are logged in the override register. The MLRO is copied on every override.',
      citationIds: ['kyc-tier'],
    },
    {
      id: 'f-5',
      prompt: 'When was the sanctions list last refreshed?',
      answer:
        'Sanctions refresh runs daily at 02:00 across OFAC, UN, EU, and the local regulator feed. The current refresh status is on the compliance dashboard; the MLRO attests to it weekly.',
      citationIds: ['comp-q1'],
    },
    {
      id: 'f-unknown',
      prompt: 'How do we treat stablecoin deposits from a retail customer?',
      unknown: true,
      answer:
        'I don\'t have an answer for that in the current knowledge base — there\'s no procedure covering stablecoin deposits yet. I can flag this to the ops manager so the gap is closed and the procedure is written.',
      citationIds: [],
    },
  ],
  hire: [
    {
      id: 'f-h-1',
      prompt: 'What\'s the difference between Tier-1, Tier-2 and Tier-3 KYC?',
      answer:
        'Tier-1 is ID plus proof of address with account limits. Tier-2 adds a source-of-funds declaration and analyst approval. Tier-3 is enhanced due diligence with a beneficial-ownership tree, sanctions narrative, and RM sign-off — required for high-risk segments and PEPs.',
      citationIds: ['kyc-tier'],
      featureSourceId: 'kyc-tier',
    },
    {
      id: 'f-h-2',
      prompt: 'Which screening runs on every new account?',
      answer:
        'Sanctions, adverse-media, and PEP screening run on every new account before the first deposit is accepted. Hits pause onboarding and route to the compliance queue with the evidence attached.',
      citationIds: ['aml-2-4'],
      featureSourceId: 'aml-2-4',
    },
  ],
  admin: {
    totals: { questions: 412, coverage: 78, activeUsers: 52 },
    top: [
      { label: 'PEP onboarding procedure', count: 47 },
      { label: 'Single-borrower exposure cap', count: 38 },
      { label: 'Wire-fee waiver rules', count: 31 },
      { label: 'Tier-3 KYC requirements', count: 26 },
      { label: 'Sanctions refresh status', count: 21 },
    ],
    gaps: [
      {
        question: 'Stablecoin and crypto-asset deposits',
        suggested: 'Procedure — digital-asset deposits and risk-class mapping',
      },
      {
        question: 'Cross-border remittance — sub-$1k',
        suggested: 'Policy — light-touch KYC for low-value remittance corridors',
      },
      {
        question: 'Dormant-account fee treatment',
        suggested: 'Policy — dormancy thresholds, fee schedule, and reactivation',
      },
    ],
  },
}

const manufacturer: KnowledgeBase = {
  id: 'manufacturer',
  label: 'Complex-product manufacturer',
  short: 'Manufacturer',
  icon: Factory,
  opsManager: 'Tomás Reyes',
  sources: [
    {
      id: 'safety-12',
      kind: 'SOP',
      label: 'Safety SOP §12',
      title: 'Lockout-tagout — press lines',
      meta: 'v11 · owned by EHS · audited quarterly',
      body: [
        'Before any maintenance on a press line: isolate the disconnect, apply your personal lock, hang the tag (initialled, dated), and verify zero-energy state with the calibrated meter.',
        'Press line 2 has dual hydraulic accumulators — bleed both before working on the ram. Verification card is mandatory and stays with the work order.',
        'Removal of a lock is by the person who applied it. Exceptions require a supervisor and EHS sign-off, logged in the LOTO register.',
      ],
    },
    {
      id: 'pricing-distrib',
      kind: 'Pricing',
      label: 'Distributor pricing v9',
      title: 'Volume discount tiers',
      meta: 'v9 · effective this quarter · owner: Sales',
      body: [
        'Tier-1 (up to 500 units/qtr): list price.',
        'Tier-2 (501–2,000): 7% discount.',
        'Tier-3 (2,001+): 12% discount, subject to a 90-day rolling volume check. Distributors below the threshold for two consecutive quarters revert to Tier-2.',
        'Trial pricing for new distributors is at the RM\'s discretion for the first 90 days, capped at Tier-2.',
      ],
    },
    {
      id: 'rma-3',
      kind: 'Policy',
      label: 'RMA Policy §3',
      title: 'Faulty unit return flow',
      meta: 'v5 · owned by Service Ops',
      body: [
        'Customer files RMA via the portal. The system issues an RMA number and a prepaid label within 1 hour for in-warranty units.',
        'Receive, inspect, and triage within 48 hours of arrival. Out-of-warranty units route to the quote-for-repair queue; in-warranty units route to repair or replacement at QC\'s discretion.',
        'Replacement ships within 5 working days of triage. Every RMA closes with a written failure-mode note that feeds the monthly quality review.',
      ],
    },
    {
      id: 'sup-credit',
      kind: 'Contract',
      label: 'Supplier credit terms',
      title: 'Tier-1 supplier payment schedule',
      meta: 'Master agreement · refreshed annually',
      body: [
        'Acme Suppliers run NET-45 from invoice date. 2% early-pay discount available within 10 days.',
        'Critical-path suppliers (motors, controllers) hold a standing PO with weekly draw-downs and net-monthly settlement.',
        'Late payments trigger a hold on next dispatch — finance owns the watch list and escalates to the COO when a critical supplier is at risk.',
      ],
    },
    {
      id: 'line-down',
      kind: 'Procedure',
      label: 'Line-down protocol',
      title: 'Critical machine failure response',
      meta: 'v8 · 24×7 · owned by Ops',
      body: [
        'Step 1: confirm the line is safe to approach — LOTO if any energy source is unconfirmed.',
        'Step 2: page the on-call maintenance lead. After-hours dispatch is via the duty roster; the current on-call is published on the ops dashboard.',
        'Step 3: open a line-down incident in the CMMS. Every step from page-out to restoration is timestamped — the post-incident review uses that log.',
        'Step 4: notify the production planner if downtime is forecast above 30 minutes; planning re-balances the day\'s schedule.',
      ],
    },
    {
      id: 'sop-qc-4',
      kind: 'SOP',
      label: 'QC SOP §4',
      title: 'Pre-shipment inspection checklist',
      meta: 'v6 · owned by Quality',
      body: [
        'Visual: external case, label alignment, serial number plate readable.',
        'Functional: power-on self-test passes, firmware version matches the production manifest, key sensors return values within spec.',
        'Documentation: certificate of conformity printed, customer-specific paperwork attached, packing list signed by QC.',
        'Anything failing routes to the rework queue with a written failure note. The QC lead reviews failure clusters at the weekly quality huddle.',
      ],
    },
  ],
  staff: [
    {
      id: 'm-1',
      prompt: 'What\'s the lockout-tagout procedure for press line 2?',
      answer:
        'Isolate the disconnect, apply your personal lock, tag (initialled and dated), and verify zero-energy state with the calibrated meter. Press line 2 has dual hydraulic accumulators — bleed both before working on the ram, and the verification card stays with the work order.',
      citationIds: ['safety-12'],
    },
    {
      id: 'm-2',
      prompt: 'When can we offer the Tier-3 distributor discount?',
      answer:
        'Tier-3 (12% off) applies from 2,001 units a quarter, with a 90-day rolling volume check. Distributors below the threshold for two consecutive quarters revert to Tier-2.',
      citationIds: ['pricing-distrib'],
    },
    {
      id: 'm-3',
      prompt: 'What\'s the SOP for handling a returned faulty unit?',
      answer:
        'The customer files an RMA on the portal — the system issues a number and a prepaid label within 1 hour for in-warranty units. We triage within 48 hours of arrival, replace within 5 working days, and close every RMA with a written failure-mode note.',
      citationIds: ['rma-3'],
    },
    {
      id: 'm-4',
      prompt: 'What credit terms does Acme Suppliers run on?',
      answer:
        'Acme is NET-45 from invoice date with a 2% early-pay discount available within 10 days. They\'re a Tier-1 supplier on the master agreement; critical-path SKUs are on a weekly-draw PO with net-monthly settlement.',
      citationIds: ['sup-credit'],
    },
    {
      id: 'm-5',
      prompt: 'Who do I call if line 4 goes down at 02:00?',
      answer:
        'Page the on-call maintenance lead — after-hours dispatch goes through the duty roster, and the current on-call is on the ops dashboard. Open a line-down incident in the CMMS so the response is timestamped end-to-end.',
      citationIds: ['line-down'],
    },
    {
      id: 'm-unknown',
      prompt: 'What\'s the policy on accepting carbon-offset credits as part-payment?',
      unknown: true,
      answer:
        'I don\'t have an answer for that in the current knowledge base — there\'s no policy on carbon-offset credits as a payment method. I can flag this to the ops manager so the policy gets written.',
      citationIds: [],
    },
  ],
  hire: [
    {
      id: 'm-h-1',
      prompt: 'How do I run a pre-shipment QC inspection?',
      answer:
        'Three stages: visual (case, labels, serial plate), functional (self-test, firmware match, sensors in spec), and documentation (CoC printed, customer paperwork attached, packing list signed by QC). Anything failing routes to rework with a written note. The full checklist is below.',
      citationIds: ['sop-qc-4'],
      featureSourceId: 'sop-qc-4',
    },
    {
      id: 'm-h-2',
      prompt: 'Where do I file an RMA?',
      answer:
        'RMAs are filed through the customer portal — the system issues the RMA number and, for in-warranty units, prints a prepaid return label within 1 hour. As a new hire, your first few RMAs go past the service-ops lead for a second look before close-out.',
      citationIds: ['rma-3'],
      featureSourceId: 'rma-3',
    },
  ],
  admin: {
    totals: { questions: 178, coverage: 81, activeUsers: 26 },
    top: [
      { label: 'Lockout-tagout — press lines', count: 28 },
      { label: 'Distributor discount tiers', count: 22 },
      { label: 'RMA return flow', count: 19 },
      { label: 'Line-down on-call roster', count: 15 },
      { label: 'Supplier credit terms — Acme', count: 11 },
    ],
    gaps: [
      {
        question: 'Carbon-offset credits as part-payment',
        suggested: 'Policy — alternative payment instruments and offset credits',
      },
      {
        question: 'Refurbished-unit warranty length',
        suggested: 'Policy — refurbished and reconditioned unit warranty terms',
      },
      {
        question: 'Distributor exclusivity by region',
        suggested: 'Contract addendum — territorial exclusivity and overlap rules',
      },
    ],
  },
}

const BUSINESSES: KnowledgeBase[] = [retail, finance, manufacturer]

const SOURCE_ICONS: Record<SourceKind, Component> = {
  SOP: ScrollText,
  Contract: FileText,
  Policy: ShieldCheck,
  Pricing: Receipt,
  Procedure: BookOpen,
  Memo: PenLine,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const activeBusinessId = ref<BusinessId>('retail')
const activeMode = ref<Mode>('chat')

interface BusinessChatState {
  transcript: ChatTurn[]
  askedIds: Set<string>
  flaggedIds: Set<string>
  flagsLanded: { id: string; question: string; ts: string }[]
}

function emptyChatState(): BusinessChatState {
  return {
    transcript: [],
    askedIds: new Set<string>(),
    flaggedIds: new Set<string>(),
    flagsLanded: [],
  }
}

const chatStates = ref<Record<BusinessId, BusinessChatState>>({
  retail: emptyChatState(),
  finance: emptyChatState(),
  manufacturer: emptyChatState(),
})

const hireStates = ref<Record<BusinessId, BusinessChatState>>({
  retail: emptyChatState(),
  finance: emptyChatState(),
  manufacturer: emptyChatState(),
})

const openSourceId = ref<string | null>(null)
const isThinking = ref(false)
let turnCounter = 0
let flagCounter = 4040 // start the flag ID sequence at something deal-y

// ---------------------------------------------------------------------------
// Derived
// ---------------------------------------------------------------------------

const activeKB = computed(
  () => BUSINESSES.find((b) => b.id === activeBusinessId.value)!,
)

const currentState = computed(() =>
  activeMode.value === 'hire'
    ? hireStates.value[activeBusinessId.value]
    : chatStates.value[activeBusinessId.value],
)

const availableQAs = computed<QA[]>(() =>
  activeMode.value === 'hire' ? activeKB.value.hire : activeKB.value.staff,
)

const remainingQAs = computed(() =>
  availableQAs.value.filter((q) => !currentState.value.askedIds.has(q.id)),
)

const openSource = computed<SourceDoc | null>(() => {
  if (!openSourceId.value) return null
  return activeKB.value.sources.find((s) => s.id === openSourceId.value) ?? null
})

const sourceById = (id: string) =>
  activeKB.value.sources.find((s) => s.id === id) ?? null

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function ask(qa: QA) {
  if (isThinking.value) return
  if (currentState.value.askedIds.has(qa.id)) return

  currentState.value.askedIds.add(qa.id)

  // user turn
  currentState.value.transcript.push({
    id: ++turnCounter,
    role: 'user',
    text: qa.prompt,
  })

  isThinking.value = true

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  const delay = prefersReducedMotion ? 60 : 360

  window.setTimeout(() => {
    currentState.value.transcript.push({
      id: ++turnCounter,
      role: 'assistant',
      text: qa.answer,
      citationIds: qa.citationIds,
      unknown: qa.unknown === true,
      qaId: qa.id,
      featureSourceId: qa.featureSourceId,
    })
    isThinking.value = false
    nextTick(() => scrollChatToEnd())
  }, delay)

  nextTick(() => scrollChatToEnd())
}

function flagToOps(qaId: string) {
  const state = currentState.value
  if (state.flaggedIds.has(qaId)) return
  const qa = availableQAs.value.find((q) => q.id === qaId)
  if (!qa) return
  state.flaggedIds.add(qaId)
  flagCounter += 1
  state.flagsLanded.push({
    id: `KQ-${flagCounter}`,
    question: qa.prompt,
    ts: nowStamp(),
  })
}

function resetConversation() {
  const id = activeBusinessId.value
  if (activeMode.value === 'hire') {
    hireStates.value[id] = emptyChatState()
  } else {
    chatStates.value[id] = emptyChatState()
  }
  openSourceId.value = null
}

function openCitation(id: string) {
  openSourceId.value = id
}

function closeSource() {
  openSourceId.value = null
}

function nowStamp() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

// ---------------------------------------------------------------------------
// Scroll
// ---------------------------------------------------------------------------

const scrollRef = ref<HTMLElement | null>(null)

function scrollChatToEnd() {
  const el = scrollRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
}

// When the user switches business or mode, close any open source panel —
// the IDs are per-KB and would dangle.
watch([activeBusinessId, activeMode], () => {
  openSourceId.value = null
  nextTick(() => scrollChatToEnd())
})

onMounted(() => {
  // Seed the retail chat with one example so the demo lands "alive".
  if (chatStates.value.retail.transcript.length === 0) {
    ask(retail.staff[2]!) // "What's the SOP for handling a complaint?"
  }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isFlagged(qaId: string | undefined): boolean {
  if (!qaId) return false
  return currentState.value.flaggedIds.has(qaId)
}

function lastFlagFor(qaId: string | undefined) {
  if (!qaId) return null
  return (
    [...currentState.value.flagsLanded].reverse().find((f) => {
      const qa = availableQAs.value.find((q) => q.id === qaId)
      return qa && f.question === qa.prompt
    }) ?? null
  )
}

</script>

<template>
  <div class="relative">
    <div class="p-4 md:p-7 lg:p-8">
      <!-- Header strip -->
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span
            class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
          >
            <span class="dot" />
            Live assistant
          </span>
          <p class="mt-3 max-w-xl text-[14.5px] md:text-[15px] leading-[1.55] text-mute">
            One assistant. Three knowledge bases.
            <strong class="text-ink font-semibold">Every answer cites its source.</strong>
            Questions it can't answer get flagged to the ops manager.
          </p>
        </div>
        <div
          class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2 flex items-center gap-2"
          aria-hidden="true"
        >
          <Search :size="14" :stroke-width="2" />
          <span>{{ activeKB.sources.length }} sources indexed</span>
        </div>
      </div>

      <!-- Business toggle -->
      <div class="mt-5">
        <div
          role="tablist"
          aria-label="Business context"
          class="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface-alt p-1"
        >
          <button
            v-for="b in BUSINESSES"
            :key="b.id"
            role="tab"
            :aria-selected="activeBusinessId === b.id"
            :class="[
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
              activeBusinessId === b.id
                ? 'bg-white text-ink shadow-[0_1px_0_rgba(15,23,42,0.04)] border border-line'
                : 'text-mute hover:text-ink',
            ]"
            @click="activeBusinessId = b.id"
          >
            <component :is="b.icon" :size="14" :stroke-width="2" aria-hidden="true" />
            {{ b.label }}
          </button>
        </div>
        <p class="mt-2 text-[12.5px] text-mute-2">
          Switching businesses swaps the playbook — same engine.
        </p>
      </div>

      <!-- Mode tabs -->
      <div class="mt-5 -mx-1 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Mode"
          class="inline-flex rounded-lg border border-line bg-white p-0.5 mx-1"
        >
          <button
            v-for="m in [
              { id: 'chat', label: 'Staff chat', icon: MessageSquare },
              { id: 'hire', label: 'New-hire onboarding', icon: GraduationCap },
              { id: 'admin', label: 'Admin view', icon: BarChart3 },
            ] as const"
            :key="m.id"
            role="tab"
            :aria-selected="activeMode === m.id"
            :class="[
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
              activeMode === m.id
                ? 'bg-ink text-white'
                : 'text-mute hover:text-ink',
            ]"
            @click="activeMode = m.id"
          >
            <component :is="m.icon" :size="13" :stroke-width="2" aria-hidden="true" />
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- =========================================================== -->
      <!-- CHAT / HIRE: tray + transcript                                -->
      <!-- =========================================================== -->
      <div
        v-if="activeMode !== 'admin'"
        class="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] gap-5"
      >
        <!-- LEFT TRAY: Suggested questions -->
        <aside class="rounded-xl border border-line bg-white p-4 md:p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-[11.5px] uppercase tracking-[0.22em] font-semibold text-mute-2">
              {{ activeMode === 'hire' ? 'New-hire prompts' : 'Suggested questions' }}
            </h3>
            <button
              v-if="currentState.transcript.length > 0"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-mute hover:text-ink hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="resetConversation"
            >
              <RotateCcw :size="13" :stroke-width="2" aria-hidden="true" />
              Reset
            </button>
          </div>

          <ul class="space-y-2">
            <li v-for="qa in availableQAs" :key="qa.id">
              <button
                type="button"
                :disabled="currentState.askedIds.has(qa.id) || isThinking"
                :class="[
                  'group w-full text-left rounded-lg border px-3 py-2.5 text-[13px] leading-[1.45] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                  currentState.askedIds.has(qa.id)
                    ? 'border-line bg-surface-alt/60 text-mute-2 cursor-not-allowed'
                    : 'border-line bg-white text-ink hover:border-cyan-brand/40 hover:bg-cyan-brand/[0.04]',
                ]"
                @click="ask(qa)"
              >
                <span class="flex items-start gap-2">
                  <span
                    :class="[
                      'mt-[3px] inline-flex h-1.5 w-1.5 rounded-full shrink-0',
                      qa.unknown
                        ? 'bg-mute-2 ring-2 ring-mute-2/20'
                        : 'bg-cyan-brand ring-2 ring-cyan-brand/20',
                    ]"
                    aria-hidden="true"
                  />
                  <span class="flex-1">{{ qa.prompt }}</span>
                </span>
              </button>
            </li>
          </ul>

          <div
            v-if="remainingQAs.length === 0 && currentState.transcript.length > 0"
            class="mt-3 text-[12px] text-mute-2"
          >
            That's the full set for this business. Hit reset to run it again.
          </div>

          <!-- Mini "Ops queue" sidecar — only when flags landed -->
          <div
            v-if="currentState.flagsLanded.length > 0"
            class="mt-5 rounded-lg border border-line bg-surface-alt/70 p-3.5"
          >
            <div class="flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              <Flag :size="12" :stroke-width="2" aria-hidden="true" />
              Ops queue
            </div>
            <ul class="mt-2 space-y-2">
              <li
                v-for="f in currentState.flagsLanded.slice(-2)"
                :key="f.id"
                class="rounded-md bg-white border border-line px-2.5 py-2"
              >
                <div class="flex items-center justify-between gap-2 text-[11px] text-mute-2 tabular-nums">
                  <span class="font-semibold text-ink">#{{ f.id }}</span>
                  <span>{{ f.ts }}</span>
                </div>
                <div class="mt-1 text-[12.5px] text-ink leading-[1.4] line-clamp-2">
                  {{ f.question }}
                </div>
                <div class="mt-1.5 text-[11.5px] text-mute-2">
                  Assigned · {{ activeKB.opsManager }}
                </div>
              </li>
            </ul>
          </div>
        </aside>

        <!-- RIGHT: Chat transcript -->
        <section class="rounded-xl border border-line bg-white overflow-hidden flex flex-col">
          <header class="flex items-center justify-between gap-2 px-4 md:px-5 py-3.5 border-b border-line bg-surface-alt/40">
            <div class="flex items-center gap-2.5">
              <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25" aria-hidden="true">
                <Sparkles :size="15" :stroke-width="2" />
              </span>
              <div>
                <div class="text-[13.5px] font-semibold text-ink leading-[1.2]">
                  {{ activeMode === 'hire' ? 'Onboarding assistant' : 'Playbook assistant' }}
                </div>
                <div class="text-[11.5px] text-mute-2 leading-[1.2] mt-0.5">
                  {{ activeKB.label }} · cites every claim
                </div>
              </div>
            </div>
            <span
              v-if="isThinking"
              class="inline-flex items-center gap-1.5 text-[11.5px] text-mute-2"
            >
              <span class="ka-typing" aria-hidden="true">
                <span /><span /><span />
              </span>
              <span>thinking</span>
            </span>
          </header>

          <div
            ref="scrollRef"
            class="px-4 md:px-5 py-5 space-y-4 overflow-y-auto"
            style="max-height: 540px; min-height: 380px;"
          >
            <!-- empty state -->
            <div
              v-if="currentState.transcript.length === 0"
              class="text-center py-10"
            >
              <span class="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-surface-alt text-cyan-brand-deep ring-1 ring-line" aria-hidden="true">
                <MessageSquare :size="18" :stroke-width="1.9" />
              </span>
              <p class="mt-3 text-[14.5px] text-ink font-semibold">
                Pick a question from the tray
              </p>
              <p class="mt-1 text-[13px] text-mute max-w-sm mx-auto leading-[1.5]">
                Each answer comes back with the source chips it pulled from.
                Click a chip to read the source.
              </p>
            </div>

            <template v-for="turn in currentState.transcript" :key="turn.id">
              <!-- USER TURN -->
              <div v-if="turn.role === 'user'" class="flex justify-end ka-bubble-in">
                <div class="max-w-[85%] rounded-2xl rounded-br-md bg-ink text-white px-3.5 py-2.5 text-[14px] leading-[1.5]">
                  {{ turn.text }}
                </div>
              </div>

              <!-- ASSISTANT TURN -->
              <div v-else class="flex flex-col ka-bubble-in">
                <div
                  :class="[
                    'max-w-[92%] rounded-2xl rounded-bl-md px-4 py-3 text-[14px] leading-[1.55] border',
                    turn.unknown
                      ? 'bg-surface-alt border-line text-ink'
                      : 'bg-white border-line text-ink',
                  ]"
                >
                  <div v-if="turn.unknown" class="flex items-start gap-2.5 mb-1.5">
                    <AlertCircle :size="15" :stroke-width="2" class="text-mute-2 mt-0.5 shrink-0" aria-hidden="true" />
                    <span class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                      Outside the knowledge base
                    </span>
                  </div>
                  <p>{{ turn.text }}</p>

                  <!-- Citation chips -->
                  <div
                    v-if="turn.citationIds && turn.citationIds.length > 0"
                    class="mt-3 flex flex-wrap items-center gap-1.5"
                  >
                    <span class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold mr-0.5">
                      Sources
                    </span>
                    <button
                      v-for="cid in turn.citationIds"
                      :key="cid"
                      type="button"
                      class="ka-chip group"
                      @click="openCitation(cid)"
                    >
                      <component
                        :is="SOURCE_ICONS[sourceById(cid)?.kind ?? 'SOP']"
                        :size="11.5"
                        :stroke-width="2"
                        aria-hidden="true"
                      />
                      {{ sourceById(cid)?.label }}
                      <ChevronRight :size="11" :stroke-width="2.2" aria-hidden="true" class="ka-chip-arrow" />
                    </button>
                  </div>

                  <!-- Unknown → flag CTA / confirmation -->
                  <div
                    v-if="turn.unknown"
                    class="mt-3 pt-3 border-t border-line"
                  >
                    <div v-if="!isFlagged(turn.qaId)" class="flex flex-col sm:flex-row sm:items-center gap-2">
                      <button
                        type="button"
                        class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[13px] font-semibold px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        @click="turn.qaId && flagToOps(turn.qaId)"
                      >
                        <Flag :size="13" :stroke-width="2" aria-hidden="true" />
                        Flag to ops manager
                      </button>
                      <span class="text-[12px] text-mute-2">
                        Will land in {{ activeKB.opsManager }}'s queue.
                      </span>
                    </div>
                    <div
                      v-else
                      class="ka-flag-landed flex items-start gap-2 rounded-lg bg-cyan-brand/[0.08] border border-cyan-brand/25 px-3 py-2.5"
                    >
                      <CheckCircle2
                        :size="15"
                        :stroke-width="2"
                        class="text-cyan-brand-deep mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <div class="text-[13px] text-ink leading-[1.45]">
                        <span class="font-semibold">Flag #{{ lastFlagFor(turn.qaId)?.id }} landed.</span>
                        Assigned to {{ activeKB.opsManager }} ·
                        {{ lastFlagFor(turn.qaId)?.ts }}. Added to the gaps register.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Onboarding: featured SOP card under the answer -->
                <button
                  v-if="turn.featureSourceId && sourceById(turn.featureSourceId)"
                  type="button"
                  class="ka-feature mt-2.5 max-w-[92%] text-left rounded-xl border border-cyan-brand/30 bg-gradient-to-b from-cyan-brand/[0.05] to-white p-3.5 transition-colors hover:border-cyan-brand/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                  @click="openCitation(turn.featureSourceId)"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white text-cyan-brand-deep ring-1 ring-cyan-brand/30 shrink-0" aria-hidden="true">
                        <component
                          :is="SOURCE_ICONS[sourceById(turn.featureSourceId)?.kind ?? 'SOP']"
                          :size="16"
                          :stroke-width="1.9"
                        />
                      </span>
                      <div class="min-w-0">
                        <div class="text-[11px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
                          Read the full SOP
                        </div>
                        <div class="text-[14px] font-semibold text-ink leading-[1.3] truncate">
                          {{ sourceById(turn.featureSourceId)?.title }}
                          <span class="font-normal text-mute-2">· {{ sourceById(turn.featureSourceId)?.label }}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight :size="16" :stroke-width="2" class="text-cyan-brand-deep shrink-0" aria-hidden="true" />
                  </div>
                </button>
              </div>
            </template>

            <!-- thinking indicator at end -->
            <div v-if="isThinking" class="flex">
              <div class="rounded-2xl rounded-bl-md border border-line bg-white px-3.5 py-2.5">
                <span class="ka-typing ka-typing-lg" aria-label="Assistant is composing a response">
                  <span /><span /><span />
                </span>
              </div>
            </div>
          </div>

          <!-- Fake input bar (read-only — the demo is question-driven) -->
          <div class="border-t border-line bg-surface-alt/40 px-4 py-3 flex items-center gap-2">
            <input
              type="text"
              :placeholder="
                activeMode === 'hire'
                  ? 'Ask anything a new hire would ask…'
                  : 'Ask the playbook…'
              "
              readonly
              aria-readonly="true"
              class="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-[14px] text-mute placeholder:text-mute-2 focus:outline-none cursor-default"
              @focus="(e) => (e.target as HTMLInputElement).blur()"
            />
            <button
              type="button"
              disabled
              aria-hidden="true"
              class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-ink/40 text-white cursor-default"
            >
              <Send :size="14" :stroke-width="2" />
            </button>
          </div>
        </section>
      </div>

      <!-- =========================================================== -->
      <!-- ADMIN view                                                    -->
      <!-- =========================================================== -->
      <div v-else class="mt-6 space-y-5">
        <!-- KPI strip -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="rounded-xl border border-line bg-white p-4">
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                Questions this week
              </span>
              <TrendingUp :size="14" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
            </div>
            <div class="mt-1 flex items-baseline gap-1.5">
              <span class="font-display text-[30px] leading-none text-ink tabular-nums">
                {{ activeKB.admin.totals.questions }}
              </span>
              <span class="text-[12px] text-mute-2">answered</span>
            </div>
          </div>
          <div class="rounded-xl border border-line bg-white p-4">
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                Coverage
              </span>
              <ShieldCheck :size="14" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
            </div>
            <div class="mt-1 flex items-baseline gap-1.5">
              <span class="font-display text-[30px] leading-none text-ink tabular-nums">
                {{ activeKB.admin.totals.coverage }}
              </span>
              <span class="text-[12px] text-mute-2">% cited from the playbook</span>
            </div>
            <div class="mt-2.5 h-1.5 rounded-full bg-surface-alt overflow-hidden">
              <div
                class="h-full bg-cyan-brand-deep transition-[width] duration-500 ease-out"
                :style="{ width: `${activeKB.admin.totals.coverage}%` }"
                aria-hidden="true"
              />
            </div>
          </div>
          <div class="rounded-xl border border-line bg-white p-4">
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                Active users
              </span>
              <Users :size="14" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
            </div>
            <div class="mt-1 flex items-baseline gap-1.5">
              <span class="font-display text-[30px] leading-none text-ink tabular-nums">
                {{ activeKB.admin.totals.activeUsers }}
              </span>
              <span class="text-[12px] text-mute-2">staff this week</span>
            </div>
          </div>
        </div>

        <!-- Top questions + Gaps -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Top questions -->
          <div class="rounded-xl border border-line bg-white p-5">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                Top questions this week
              </h4>
              <BarChart3 :size="14" :stroke-width="2" class="text-mute-2" aria-hidden="true" />
            </div>
            <ul class="space-y-3">
              <li
                v-for="(q, i) in activeKB.admin.top"
                :key="i"
                class="grid grid-cols-[1fr_auto] items-baseline gap-3"
              >
                <div class="min-w-0">
                  <div class="text-[13.5px] text-ink leading-[1.4] truncate">{{ q.label }}</div>
                  <div class="mt-1.5 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                    <div
                      class="h-full bg-cyan-brand-deep transition-[width] duration-500 ease-out"
                      :style="{ width: `${Math.round((q.count / activeKB.admin.top[0]!.count) * 100)}%` }"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <span class="tabular-nums text-[13px] font-semibold text-ink shrink-0">
                  {{ q.count }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Knowledge gaps -->
          <div class="rounded-xl border border-line bg-white p-5">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                Knowledge gaps · suggested SOPs to write
              </h4>
              <Flag :size="14" :stroke-width="2" class="text-mute-2" aria-hidden="true" />
            </div>
            <ul class="space-y-2.5">
              <li
                v-for="(g, i) in activeKB.admin.gaps"
                :key="i"
                class="rounded-lg border border-line bg-surface-alt/50 p-3"
              >
                <div class="flex items-start gap-2">
                  <AlertCircle :size="14" :stroke-width="2" class="text-mute-2 mt-0.5 shrink-0" aria-hidden="true" />
                  <div class="min-w-0">
                    <div class="text-[13px] text-ink leading-[1.45]">
                      <span class="font-semibold">Asked:</span> {{ g.question }}
                    </div>
                    <div class="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-cyan-brand-deep">
                      <PenLine :size="12" :stroke-width="2" aria-hidden="true" />
                      <span class="font-semibold">{{ g.suggested }}</span>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <p class="mt-3 text-[12px] text-mute-2 leading-[1.5]">
              Every "I don't know" lands here with a suggested SOP outline.
              The playbook gets sharper each week.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================================================== -->
    <!-- Source preview drawer                                         -->
    <!-- =========================================================== -->
    <transition name="ka-backdrop">
      <button
        v-if="openSource"
        type="button"
        aria-label="Close source preview"
        class="absolute inset-0 bg-ink/20 z-10"
        @click="closeSource"
      />
    </transition>
    <transition name="ka-drawer">
      <aside
        v-if="openSource"
        class="absolute inset-y-0 right-0 z-20 w-full sm:w-[min(440px,85%)] bg-white border-l border-line shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.18)] flex flex-col"
        role="dialog"
        aria-label="Source preview"
      >
        <header class="flex items-start justify-between gap-3 px-5 py-4 border-b border-line">
          <div class="min-w-0">
            <div class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] font-semibold text-cyan-brand-deep">
              <component :is="SOURCE_ICONS[openSource.kind]" :size="11.5" :stroke-width="2" aria-hidden="true" />
              {{ openSource.label }}
            </div>
            <h3 class="font-display text-[22px] md:text-[24px] leading-[1.15] text-ink mt-1.5">
              {{ openSource.title }}
            </h3>
            <p class="text-[11.5px] text-mute-2 mt-1">{{ openSource.meta }}</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center h-9 w-9 rounded-lg text-mute hover:text-ink hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 shrink-0"
            aria-label="Close"
            @click="closeSource"
          >
            <X :size="16" :stroke-width="2" />
          </button>
        </header>
        <div class="px-5 py-5 overflow-y-auto flex-1">
          <div class="space-y-3.5 text-[14px] leading-[1.65] text-ink">
            <p v-for="(para, i) in openSource.body" :key="i" class="ka-source-line">
              {{ para }}
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-line flex items-center gap-2 text-[12px] text-mute-2">
            <ShieldCheck :size="13" :stroke-width="2" aria-hidden="true" />
            Excerpt. The assistant always cites the latest approved version.
          </div>
        </div>
      </aside>
    </transition>
  </div>
</template>

<style scoped>
/* --- Citation chip --- */
.ka-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 9999px;
  border: 1px solid rgba(1, 219, 241, 0.35);
  background: rgba(1, 219, 241, 0.08);
  color: #00B8CC;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  padding: 0.25rem 0.55rem 0.25rem 0.5rem;
  transition: background-color 180ms cubic-bezier(0.22, 1, 0.36, 1),
              border-color 180ms cubic-bezier(0.22, 1, 0.36, 1),
              color 180ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}
.ka-chip:hover {
  background: rgba(1, 219, 241, 0.15);
  border-color: rgba(1, 219, 241, 0.55);
  color: #0A0F1A;
}
.ka-chip:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.22);
}
.ka-chip .ka-chip-arrow {
  opacity: 0.5;
  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms;
}
.ka-chip:hover .ka-chip-arrow {
  opacity: 1;
  transform: translateX(1.5px);
}

/* --- Typing indicator --- */
.ka-typing {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.ka-typing > span {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: #64748B;
  animation: kaTyping 1100ms cubic-bezier(0.4, 0, 0.6, 1) infinite both;
}
.ka-typing-lg > span {
  width: 5px;
  height: 5px;
}
.ka-typing > span:nth-child(1) { animation-delay: 0ms; }
.ka-typing > span:nth-child(2) { animation-delay: 160ms; }
.ka-typing > span:nth-child(3) { animation-delay: 320ms; }
@keyframes kaTyping {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
  40%           { transform: translateY(-3px); opacity: 1; }
}

/* --- Bubble in --- */
.ka-bubble-in {
  animation: kaBubbleIn 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes kaBubbleIn {
  0%   { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* --- Flag landed flash --- */
.ka-flag-landed {
  animation: kaFlagLanded 520ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes kaFlagLanded {
  0%   { opacity: 0; transform: translateY(4px) scale(0.985); }
  100% { opacity: 1; transform: translateY(0)   scale(1); }
}

/* --- Featured SOP card --- */
.ka-feature {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
              border-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.ka-feature:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px -18px rgba(1, 219, 241, 0.45);
}

/* --- Drawer transitions --- */
.ka-drawer-enter-active,
.ka-drawer-leave-active {
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
.ka-drawer-enter-from,
.ka-drawer-leave-to {
  transform: translateX(100%);
}
.ka-backdrop-enter-active,
.ka-backdrop-leave-active {
  transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.ka-backdrop-enter-from,
.ka-backdrop-leave-to {
  opacity: 0;
}

/* Source lines pick up a faint leading rule, like a doc excerpt. */
.ka-source-line {
  text-wrap: pretty;
}

@media (prefers-reduced-motion: reduce) {
  .ka-bubble-in,
  .ka-flag-landed,
  .ka-typing > span {
    animation: none !important;
  }
  .ka-drawer-enter-active,
  .ka-drawer-leave-active,
  .ka-backdrop-enter-active,
  .ka-backdrop-leave-active {
    transition: none !important;
  }
  .ka-feature:hover {
    transform: none;
  }
}

/* Tighten the line-clamp helper for the ops queue cards */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
