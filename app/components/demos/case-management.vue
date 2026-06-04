<script setup lang="ts">
import { Transition, computed, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { AlertTriangle, ArrowLeft, ArrowRight, Bell, CheckCircle2, Clock, Download, FastForward, FileText, Flag, HeartHandshake, History, Hourglass, Layers, ListChecks, MessageCircle, MessageSquare, Paperclip, Plus, RotateCcw, Scale, Send, ShieldAlert, Sparkles, UserCheck, Wrench, X, Zap } from '@lucide/vue'

type CaseTypeId =
  | 'legal'
  | 'ngo'
  | 'complaint'
  | 'hr'
  | 'insurance'
  | 'maintenance'

type EventKind =
  | 'intake'
  | 'document'
  | 'communication'
  | 'decision'
  | 'sla'
  | 'escalation'
  | 'comment'
  | 'transition'
  | 'assignment'

interface Stage {
  id: string
  label: string
}

interface FieldDef {
  key: string
  label: string
}

interface EventTemplate {
  id: string
  label: string
  detail?: string
  /** Allowed stages where this event can be fired. Empty means any stage. */
  stages?: string[]
  /** Transition the case to this stage after the event fires. */
  toStage?: string
  /** Reset the SLA timer to N hours after the event fires. */
  slaResetHours?: number
  /** Add a document to the case with this name. */
  documentName?: string
  /** Add a comment line to the timeline. */
  comment?: string
  /** Kind chip for the event in the timeline. */
  kind: EventKind
}

interface CaseTypeTemplate {
  id: CaseTypeId
  label: string
  short: string
  caseNoun: string
  caseIdPrefix: string
  icon: Component
  stages: Stage[]
  fields: FieldDef[]
  events: EventTemplate[]
  /** Default SLA in hours for non-resolved stages (overridden by events). */
  defaultSlaHours: number
}

interface SeedEvent {
  hoursAgo: number
  kind: EventKind
  title: string
  actor: string
  detail?: string
  meta?: string
}

interface SeedDoc {
  hoursAgo: number
  name: string
  uploadedBy: string
}

interface SeedCase {
  id: string
  subject: string
  assignee: string
  supervisor: string
  stage: string
  fields: Record<string, string>
  slaHours: number
  slaTotalHours: number
  initialEvents: SeedEvent[]
  initialDocs?: SeedDoc[]
}

interface CaseEvent {
  id: string
  at: number
  kind: EventKind
  title: string
  actor: string
  detail?: string
  meta?: string
}

interface CaseDoc {
  id: string
  name: string
  uploadedBy: string
  at: number
}

interface Case {
  id: string
  typeId: CaseTypeId
  subject: string
  assignee: string
  supervisor: string
  stage: string
  fields: Record<string, string>
  slaTotalHours: number
  slaDeadlineMs: number
  events: CaseEvent[]
  documents: CaseDoc[]
  hasEscalated: boolean
  isResolved: boolean
  createdAtMs: number
}

// ---------------------------------------------------------------------------
// Time model
// ---------------------------------------------------------------------------
//
// We pick a stable simulation epoch on mount (so seeds are deterministic
// relative to "now") and tick simHoursElapsed forward, 1 sim-hour per real
// 500ms. A 24h SLA visibly counts down in 12 real seconds.

const TICK_MS = 500
const HOURS_PER_TICK = 1

const simHoursElapsed = ref(0)
let simEpochMs = 0 // captured onMounted

const simNowMs = computed(() => simEpochMs + simHoursElapsed.value * 3_600_000)

// ---------------------------------------------------------------------------
// Identifier helper
// ---------------------------------------------------------------------------

let uidCounter = 0
function uid(prefix: string): string {
  uidCounter += 1
  return `${prefix}-${uidCounter}`
}

// ---------------------------------------------------------------------------
// Case type templates
// ---------------------------------------------------------------------------

const LEGAL: CaseTypeTemplate = {
  id: 'legal',
  label: 'Legal matter',
  short: 'Legal',
  caseNoun: 'matter',
  caseIdPrefix: 'LM',
  icon: Scale,
  defaultSlaHours: 24,
  stages: [
    { id: 'intake', label: 'Intake' },
    { id: 'discovery', label: 'Discovery' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'resolution', label: 'Resolution' },
  ],
  fields: [
    { key: 'client', label: 'Client' },
    { key: 'opposing', label: 'Opposing party' },
    { key: 'matterNo', label: 'Matter no.' },
    { key: 'court', label: 'Court' },
    { key: 'nextHearing', label: 'Next hearing' },
  ],
  events: [
    {
      id: 'witness',
      label: 'Witness statement filed',
      detail: 'Sworn statement filed by counsel and added to record.',
      stages: ['discovery'],
      slaResetHours: 36,
      documentName: 'Witness statement (Smith).pdf',
      kind: 'document',
    },
    {
      id: 'counter',
      label: 'Client uploads counter-offer',
      detail: 'Settlement counter received from opposing counsel.',
      stages: ['discovery', 'negotiation'],
      toStage: 'negotiation',
      slaResetHours: 12,
      documentName: 'Counter-offer (rev 2).pdf',
      kind: 'document',
    },
    {
      id: 'settle',
      label: 'Settlement received',
      detail: 'Funds in trust account; ready to issue release.',
      stages: ['negotiation'],
      toStage: 'resolution',
      slaResetHours: 8,
      documentName: 'Settlement agreement (signed).pdf',
      kind: 'decision',
    },
    {
      id: 'close',
      label: 'Matter closed',
      detail: 'File archived; client letter dispatched.',
      stages: ['resolution'],
      toStage: 'resolution',
      comment: 'Matter closed, archived to records.',
      kind: 'decision',
    },
    {
      id: 'discovery-open',
      label: 'Discovery opened',
      detail: 'Counsel briefed; document requests issued.',
      stages: ['intake'],
      toStage: 'discovery',
      slaResetHours: 48,
      documentName: 'Discovery request.pdf',
      kind: 'transition',
    },
  ],
}

const NGO: CaseTypeTemplate = {
  id: 'ngo',
  label: 'NGO beneficiary',
  short: 'NGO',
  caseNoun: 'beneficiary file',
  caseIdPrefix: 'BF',
  icon: HeartHandshake,
  defaultSlaHours: 36,
  stages: [
    { id: 'intake', label: 'Intake' },
    { id: 'assessment', label: 'Assessment' },
    { id: 'enrolled', label: 'Enrolled' },
    { id: 'closed', label: 'Closed' },
  ],
  fields: [
    { key: 'beneficiary', label: 'Beneficiary' },
    { key: 'programme', label: 'Programme' },
    { key: 'region', label: 'Region' },
    { key: 'household', label: 'Household size' },
    { key: 'enrolmentNo', label: 'Enrolment no.' },
  ],
  events: [
    {
      id: 'visit',
      label: 'Field visit completed',
      detail: 'Field officer recorded conditions and confirmed eligibility.',
      stages: ['intake', 'assessment'],
      toStage: 'assessment',
      slaResetHours: 24,
      documentName: 'Field visit report.pdf',
      kind: 'document',
    },
    {
      id: 'verify',
      label: 'Documents verified',
      detail: 'ID, proof of address and proof of dependants verified.',
      stages: ['assessment'],
      slaResetHours: 18,
      documentName: 'Verification pack.pdf',
      kind: 'decision',
    },
    {
      id: 'approve',
      label: 'Approved for enrolment',
      detail: 'Committee approval recorded; beneficiary number assigned.',
      stages: ['assessment'],
      toStage: 'enrolled',
      slaResetHours: 12,
      kind: 'decision',
    },
    {
      id: 'disburse',
      label: 'Disbursement issued',
      detail: 'First instalment disbursed against the disbursement schedule.',
      stages: ['enrolled'],
      slaResetHours: 24,
      documentName: 'Disbursement memo.pdf',
      kind: 'decision',
    },
    {
      id: 'closeBen',
      label: 'Programme exit recorded',
      detail: 'Beneficiary graduated; exit interview attached.',
      stages: ['enrolled'],
      toStage: 'closed',
      kind: 'decision',
    },
  ],
}

const COMPLAINT: CaseTypeTemplate = {
  id: 'complaint',
  label: 'Customer complaint',
  short: 'Complaint',
  caseNoun: 'complaint',
  caseIdPrefix: 'CC',
  icon: MessageCircle,
  defaultSlaHours: 12,
  stages: [
    { id: 'new', label: 'New' },
    { id: 'investigating', label: 'Investigating' },
    { id: 'resolving', label: 'Resolving' },
    { id: 'closed', label: 'Closed' },
  ],
  fields: [
    { key: 'customer', label: 'Customer' },
    { key: 'channel', label: 'Channel' },
    { key: 'severity', label: 'Severity' },
    { key: 'product', label: 'Product / order' },
    { key: 'ticket', label: 'Ticket no.' },
  ],
  events: [
    {
      id: 'invOpen',
      label: 'Investigation opened',
      detail: 'Owner assigned; root-cause workstream started.',
      stages: ['new'],
      toStage: 'investigating',
      slaResetHours: 8,
      kind: 'transition',
    },
    {
      id: 'custReply',
      label: 'Customer responded',
      detail: 'Follow-up email received with extra context.',
      stages: ['investigating', 'resolving'],
      slaResetHours: 6,
      documentName: 'Customer reply.eml',
      kind: 'communication',
    },
    {
      id: 'propose',
      label: 'Resolution proposed',
      detail: 'Offer sent: refund + good-will credit.',
      stages: ['investigating'],
      toStage: 'resolving',
      slaResetHours: 6,
      documentName: 'Resolution memo.pdf',
      kind: 'decision',
    },
    {
      id: 'refund',
      label: 'Refund issued',
      detail: 'Refund processed against original payment method.',
      stages: ['resolving'],
      slaResetHours: 4,
      documentName: 'Refund receipt.pdf',
      kind: 'decision',
    },
    {
      id: 'acceptResp',
      label: 'Customer accepted resolution',
      detail: 'Confirmation received; case ready to close.',
      stages: ['resolving'],
      toStage: 'closed',
      kind: 'decision',
    },
  ],
}

const HR: CaseTypeTemplate = {
  id: 'hr',
  label: 'HR incident',
  short: 'HR',
  caseNoun: 'incident',
  caseIdPrefix: 'HR',
  icon: ShieldAlert,
  defaultSlaHours: 24,
  stages: [
    { id: 'reported', label: 'Reported' },
    { id: 'investigation', label: 'Investigation' },
    { id: 'action', label: 'Action' },
    { id: 'closed', label: 'Closed' },
  ],
  fields: [
    { key: 'reporter', label: 'Reporter' },
    { key: 'subject', label: 'Subject' },
    { key: 'department', label: 'Department' },
    { key: 'severity', label: 'Severity' },
    { key: 'incidentNo', label: 'Incident no.' },
  ],
  events: [
    {
      id: 'invHr',
      label: 'Investigation opened',
      detail: 'HRBP appointed; confidential file created.',
      stages: ['reported'],
      toStage: 'investigation',
      slaResetHours: 24,
      kind: 'transition',
    },
    {
      id: 'witnessInt',
      label: 'Witness interviewed',
      detail: 'Interview notes saved to the confidential file.',
      stages: ['investigation'],
      slaResetHours: 12,
      documentName: 'Interview notes.pdf',
      kind: 'document',
    },
    {
      id: 'actionRec',
      label: 'Action recommended',
      detail: 'HRBP recommendation drafted and submitted for sign-off.',
      stages: ['investigation'],
      toStage: 'action',
      slaResetHours: 12,
      documentName: 'Action plan.pdf',
      kind: 'decision',
    },
    {
      id: 'actionAppr',
      label: 'Action approved',
      detail: 'Department head signed off on the recommended action.',
      stages: ['action'],
      slaResetHours: 8,
      kind: 'decision',
    },
    {
      id: 'closeHr',
      label: 'Case closed',
      detail: 'Outcome recorded; file sealed in compliance archive.',
      stages: ['action'],
      toStage: 'closed',
      kind: 'decision',
    },
  ],
}

const INSURANCE: CaseTypeTemplate = {
  id: 'insurance',
  label: 'Insurance claim',
  short: 'Insurance',
  caseNoun: 'claim',
  caseIdPrefix: 'IC',
  icon: FileText,
  defaultSlaHours: 18,
  stages: [
    { id: 'filed', label: 'Filed' },
    { id: 'assessing', label: 'Assessing' },
    { id: 'adjusting', label: 'Adjusting' },
    { id: 'paid', label: 'Paid' },
  ],
  fields: [
    { key: 'holder', label: 'Policy holder' },
    { key: 'policy', label: 'Policy no.' },
    { key: 'claimType', label: 'Claim type' },
    { key: 'lossDate', label: 'Loss date' },
    { key: 'amount', label: 'Amount claimed' },
  ],
  events: [
    {
      id: 'adjuster',
      label: 'Loss adjuster assigned',
      detail: 'External adjuster appointed; site visit scheduled.',
      stages: ['filed'],
      toStage: 'assessing',
      slaResetHours: 24,
      kind: 'assignment',
    },
    {
      id: 'report',
      label: 'Assessment report received',
      detail: 'Adjuster report uploaded; valuation noted.',
      stages: ['assessing'],
      slaResetHours: 12,
      documentName: 'Adjuster report.pdf',
      kind: 'document',
    },
    {
      id: 'extraDocs',
      label: 'Additional documents requested',
      detail: 'Holder asked for receipts and a police report.',
      stages: ['assessing'],
      slaResetHours: 12,
      documentName: 'Request letter.pdf',
      kind: 'communication',
    },
    {
      id: 'quote',
      label: 'Settlement quote agreed',
      detail: 'Quote agreed with the policy holder.',
      stages: ['assessing'],
      toStage: 'adjusting',
      slaResetHours: 8,
      documentName: 'Settlement quote.pdf',
      kind: 'decision',
    },
    {
      id: 'pay',
      label: 'Payment authorised',
      detail: 'Treasury authorised payout to the holder.',
      stages: ['adjusting'],
      toStage: 'paid',
      kind: 'decision',
    },
  ],
}

const MAINTENANCE: CaseTypeTemplate = {
  id: 'maintenance',
  label: 'Maintenance ticket',
  short: 'Maintenance',
  caseNoun: 'ticket',
  caseIdPrefix: 'MT',
  icon: Wrench,
  defaultSlaHours: 8,
  stages: [
    { id: 'logged', label: 'Logged' },
    { id: 'triaged', label: 'Triaged' },
    { id: 'inProgress', label: 'In progress' },
    { id: 'resolved', label: 'Resolved' },
  ],
  fields: [
    { key: 'asset', label: 'Asset' },
    { key: 'location', label: 'Location' },
    { key: 'reportedBy', label: 'Reported by' },
    { key: 'priority', label: 'Priority' },
    { key: 'ticketNo', label: 'Ticket no.' },
  ],
  events: [
    {
      id: 'triage',
      label: 'Triaged by supervisor',
      detail: 'Priority set; technician category assigned.',
      stages: ['logged'],
      toStage: 'triaged',
      slaResetHours: 6,
      kind: 'transition',
    },
    {
      id: 'dispatch',
      label: 'Technician dispatched',
      detail: 'Technician en-route; ETA 45 minutes.',
      stages: ['triaged'],
      toStage: 'inProgress',
      slaResetHours: 4,
      kind: 'assignment',
    },
    {
      id: 'parts',
      label: 'Parts ordered',
      detail: 'Replacement parts ordered from the central store.',
      stages: ['inProgress'],
      slaResetHours: 6,
      documentName: 'Parts order.pdf',
      kind: 'communication',
    },
    {
      id: 'fixed',
      label: 'Repair completed',
      detail: 'Asset returned to service; service report uploaded.',
      stages: ['inProgress'],
      toStage: 'resolved',
      documentName: 'Service report.pdf',
      kind: 'decision',
    },
    {
      id: 'qaMt',
      label: 'Quality check passed',
      detail: 'Foreman signed off on the repair.',
      stages: ['inProgress'],
      slaResetHours: 2,
      kind: 'decision',
    },
  ],
}

const CASE_TYPES: CaseTypeTemplate[] = [
  LEGAL,
  NGO,
  COMPLAINT,
  HR,
  INSURANCE,
  MAINTENANCE,
]

// Last stage in each type is terminal (resolved / paid / closed).
function isTerminalStage(typeId: CaseTypeId, stageId: string): boolean {
  const tpl = CASE_TYPES.find((t) => t.id === typeId)!
  return tpl.stages[tpl.stages.length - 1]!.id === stageId
}

function stageLabel(typeId: CaseTypeId, stageId: string): string {
  const tpl = CASE_TYPES.find((t) => t.id === typeId)!
  return tpl.stages.find((s) => s.id === stageId)?.label ?? stageId
}

function templateFor(typeId: CaseTypeId): CaseTypeTemplate {
  return CASE_TYPES.find((t) => t.id === typeId)!
}

// ---------------------------------------------------------------------------
// Seeds, 4 cases per type, distributed across the 4 stages.
// ---------------------------------------------------------------------------

const LEGAL_SEEDS: SeedCase[] = [
  {
    id: 'LM-2041',
    subject: 'Roberts v. Acme Holdings',
    assignee: 'M. Daniels',
    supervisor: 'P. Okoye (Partner)',
    stage: 'intake',
    slaHours: 4,
    slaTotalHours: 24,
    fields: {
      client: 'A. Roberts',
      opposing: 'Acme Holdings Ltd',
      matterNo: 'LM-2041',
      court: 'High Court, JHB',
      nextHearing: '14 Oct',
    },
    initialEvents: [
      { hoursAgo: 26, kind: 'intake', title: 'Matter opened', actor: 'Reception desk' },
      { hoursAgo: 22, kind: 'assignment', title: 'Assigned to M. Daniels', actor: 'System' },
      { hoursAgo: 18, kind: 'document', title: 'Document uploaded: Statement of Claim.pdf', actor: 'M. Daniels' },
    ],
    initialDocs: [
      { hoursAgo: 18, name: 'Statement of Claim.pdf', uploadedBy: 'M. Daniels' },
    ],
  },
  {
    id: 'LM-2039',
    subject: 'Estate of L. Khumalo',
    assignee: 'J. Singh',
    supervisor: 'P. Okoye (Partner)',
    stage: 'discovery',
    slaHours: 16,
    slaTotalHours: 36,
    fields: {
      client: 'Khumalo family',
      opposing: 'Standard Trust',
      matterNo: 'LM-2039',
      court: 'Master of the High Court',
      nextHearing: '02 Nov',
    },
    initialEvents: [
      { hoursAgo: 72, kind: 'intake', title: 'Matter opened', actor: 'Reception desk' },
      { hoursAgo: 60, kind: 'document', title: 'Document uploaded: Will (executed copy).pdf', actor: 'J. Singh' },
      { hoursAgo: 36, kind: 'transition', title: 'Moved to Discovery', actor: 'J. Singh' },
      { hoursAgo: 8, kind: 'document', title: 'Document uploaded: Estate inventory.xlsx', actor: 'J. Singh' },
    ],
    initialDocs: [
      { hoursAgo: 60, name: 'Will (executed copy).pdf', uploadedBy: 'J. Singh' },
      { hoursAgo: 8, name: 'Estate inventory.xlsx', uploadedBy: 'J. Singh' },
    ],
  },
  {
    id: 'LM-2037',
    subject: 'Patel & Co., Contract dispute',
    assignee: 'A. Naidoo',
    supervisor: 'P. Okoye (Partner)',
    stage: 'negotiation',
    slaHours: 10,
    slaTotalHours: 12,
    fields: {
      client: 'Patel & Co.',
      opposing: 'Riverside Supply',
      matterNo: 'LM-2037',
      court: 'Magistrates, DBN',
      nextHearing: '21 Sep',
    },
    initialEvents: [
      { hoursAgo: 168, kind: 'intake', title: 'Matter opened', actor: 'Reception desk' },
      { hoursAgo: 120, kind: 'transition', title: 'Moved to Discovery', actor: 'A. Naidoo' },
      { hoursAgo: 72, kind: 'document', title: 'Document uploaded: Counter-offer (rev 1).pdf', actor: 'A. Naidoo' },
      { hoursAgo: 48, kind: 'transition', title: 'Moved to Negotiation', actor: 'A. Naidoo' },
      { hoursAgo: 4, kind: 'communication', title: 'Mediation call held with opposing counsel', actor: 'A. Naidoo' },
    ],
    initialDocs: [
      { hoursAgo: 72, name: 'Counter-offer (rev 1).pdf', uploadedBy: 'A. Naidoo' },
    ],
  },
  {
    id: 'LM-2031',
    subject: 'Mensah employment claim',
    assignee: 'M. Daniels',
    supervisor: 'P. Okoye (Partner)',
    stage: 'resolution',
    slaHours: 0,
    slaTotalHours: 8,
    fields: {
      client: 'D. Mensah',
      opposing: 'GreenPoint Logistics',
      matterNo: 'LM-2031',
      court: 'CCMA',
      nextHearing: 'closed',
    },
    initialEvents: [
      { hoursAgo: 240, kind: 'intake', title: 'Matter opened', actor: 'Reception desk' },
      { hoursAgo: 192, kind: 'transition', title: 'Moved to Discovery', actor: 'M. Daniels' },
      { hoursAgo: 144, kind: 'transition', title: 'Moved to Negotiation', actor: 'M. Daniels' },
      { hoursAgo: 96, kind: 'decision', title: 'Settlement received', actor: 'M. Daniels' },
      { hoursAgo: 96, kind: 'transition', title: 'Moved to Resolution', actor: 'M. Daniels' },
      { hoursAgo: 72, kind: 'decision', title: 'Matter closed, archived to records', actor: 'M. Daniels' },
    ],
    initialDocs: [
      { hoursAgo: 96, name: 'Settlement agreement (signed).pdf', uploadedBy: 'M. Daniels' },
    ],
  },
]

const NGO_SEEDS: SeedCase[] = [
  {
    id: 'BF-0418',
    subject: 'N. Phiri household',
    assignee: 'T. Mthembu (Field officer)',
    supervisor: 'L. Banda (Programme manager)',
    stage: 'intake',
    slaHours: 6,
    slaTotalHours: 36,
    fields: {
      beneficiary: 'N. Phiri',
      programme: 'Food security · Tier 2',
      region: 'Northern district',
      household: '5',
      enrolmentNo: 'BF-0418',
    },
    initialEvents: [
      { hoursAgo: 30, kind: 'intake', title: 'Application received', actor: 'Intake desk' },
      { hoursAgo: 24, kind: 'assignment', title: 'Assigned to T. Mthembu', actor: 'System' },
    ],
  },
  {
    id: 'BF-0412',
    subject: 'S. Adeyemi household',
    assignee: 'T. Mthembu (Field officer)',
    supervisor: 'L. Banda (Programme manager)',
    stage: 'assessment',
    slaHours: 14,
    slaTotalHours: 24,
    fields: {
      beneficiary: 'S. Adeyemi',
      programme: 'Maternal health',
      region: 'Coastal district',
      household: '4',
      enrolmentNo: 'BF-0412',
    },
    initialEvents: [
      { hoursAgo: 72, kind: 'intake', title: 'Application received', actor: 'Intake desk' },
      { hoursAgo: 60, kind: 'transition', title: 'Moved to Assessment', actor: 'T. Mthembu' },
      { hoursAgo: 12, kind: 'document', title: 'Document uploaded: Field visit report.pdf', actor: 'T. Mthembu' },
    ],
    initialDocs: [
      { hoursAgo: 12, name: 'Field visit report.pdf', uploadedBy: 'T. Mthembu' },
    ],
  },
  {
    id: 'BF-0398',
    subject: 'M. Owusu household',
    assignee: 'R. Hassan (Caseworker)',
    supervisor: 'L. Banda (Programme manager)',
    stage: 'enrolled',
    slaHours: 18,
    slaTotalHours: 24,
    fields: {
      beneficiary: 'M. Owusu',
      programme: 'Cash transfer · Tier 1',
      region: 'Central district',
      household: '6',
      enrolmentNo: 'BF-0398',
    },
    initialEvents: [
      { hoursAgo: 200, kind: 'intake', title: 'Application received', actor: 'Intake desk' },
      { hoursAgo: 180, kind: 'transition', title: 'Moved to Assessment', actor: 'R. Hassan' },
      { hoursAgo: 120, kind: 'decision', title: 'Approved for enrolment', actor: 'L. Banda' },
      { hoursAgo: 120, kind: 'transition', title: 'Moved to Enrolled', actor: 'L. Banda' },
      { hoursAgo: 24, kind: 'decision', title: 'Disbursement issued', actor: 'R. Hassan' },
    ],
    initialDocs: [
      { hoursAgo: 24, name: 'Disbursement memo.pdf', uploadedBy: 'R. Hassan' },
    ],
  },
  {
    id: 'BF-0312',
    subject: 'K. Mbeki household',
    assignee: 'R. Hassan (Caseworker)',
    supervisor: 'L. Banda (Programme manager)',
    stage: 'closed',
    slaHours: 0,
    slaTotalHours: 12,
    fields: {
      beneficiary: 'K. Mbeki',
      programme: 'Cash transfer · Tier 2',
      region: 'Eastern district',
      household: '3',
      enrolmentNo: 'BF-0312',
    },
    initialEvents: [
      { hoursAgo: 720, kind: 'intake', title: 'Application received', actor: 'Intake desk' },
      { hoursAgo: 600, kind: 'transition', title: 'Moved to Enrolled', actor: 'L. Banda' },
      { hoursAgo: 96, kind: 'decision', title: 'Programme exit recorded', actor: 'R. Hassan' },
      { hoursAgo: 96, kind: 'transition', title: 'Moved to Closed', actor: 'R. Hassan' },
    ],
  },
]

const COMPLAINT_SEEDS: SeedCase[] = [
  {
    id: 'CC-9087',
    subject: 'Damaged shipment, order 88421',
    assignee: 'S. Pillay (CX)',
    supervisor: 'D. Rao (CX lead)',
    stage: 'new',
    slaHours: 3,
    slaTotalHours: 12,
    fields: {
      customer: 'J. Carter',
      channel: 'Email',
      severity: 'Medium',
      product: 'Order #88421',
      ticket: 'CC-9087',
    },
    initialEvents: [
      { hoursAgo: 9, kind: 'intake', title: 'Complaint received via email', actor: 'Inbox triage' },
      { hoursAgo: 8, kind: 'assignment', title: 'Assigned to S. Pillay', actor: 'System' },
    ],
  },
  {
    id: 'CC-9081',
    subject: 'Billing error, duplicate charge',
    assignee: 'S. Pillay (CX)',
    supervisor: 'D. Rao (CX lead)',
    stage: 'investigating',
    slaHours: 7,
    slaTotalHours: 8,
    fields: {
      customer: 'F. Costa',
      channel: 'Web form',
      severity: 'High',
      product: 'Invoice #44219',
      ticket: 'CC-9081',
    },
    initialEvents: [
      { hoursAgo: 30, kind: 'intake', title: 'Complaint received via web form', actor: 'Inbox triage' },
      { hoursAgo: 28, kind: 'transition', title: 'Moved to Investigating', actor: 'S. Pillay' },
      { hoursAgo: 4, kind: 'communication', title: 'Finance asked to confirm transaction log', actor: 'S. Pillay' },
    ],
  },
  {
    id: 'CC-9076',
    subject: 'Late delivery, order 88105',
    assignee: 'N. Botha (CX)',
    supervisor: 'D. Rao (CX lead)',
    stage: 'resolving',
    slaHours: 5,
    slaTotalHours: 6,
    fields: {
      customer: 'P. Ndiaye',
      channel: 'Phone',
      severity: 'Medium',
      product: 'Order #88105',
      ticket: 'CC-9076',
    },
    initialEvents: [
      { hoursAgo: 96, kind: 'intake', title: 'Complaint received via phone', actor: 'Inbox triage' },
      { hoursAgo: 90, kind: 'transition', title: 'Moved to Investigating', actor: 'N. Botha' },
      { hoursAgo: 12, kind: 'decision', title: 'Resolution proposed: refund + credit', actor: 'N. Botha' },
      { hoursAgo: 12, kind: 'transition', title: 'Moved to Resolving', actor: 'N. Botha' },
    ],
    initialDocs: [
      { hoursAgo: 12, name: 'Resolution memo.pdf', uploadedBy: 'N. Botha' },
    ],
  },
  {
    id: 'CC-9015',
    subject: 'Product defect, kettle',
    assignee: 'N. Botha (CX)',
    supervisor: 'D. Rao (CX lead)',
    stage: 'closed',
    slaHours: 0,
    slaTotalHours: 6,
    fields: {
      customer: 'R. Andersson',
      channel: 'Email',
      severity: 'Low',
      product: 'SKU K-220',
      ticket: 'CC-9015',
    },
    initialEvents: [
      { hoursAgo: 240, kind: 'intake', title: 'Complaint received via email', actor: 'Inbox triage' },
      { hoursAgo: 180, kind: 'decision', title: 'Refund issued', actor: 'N. Botha' },
      { hoursAgo: 168, kind: 'decision', title: 'Customer accepted resolution', actor: 'Customer' },
      { hoursAgo: 168, kind: 'transition', title: 'Moved to Closed', actor: 'N. Botha' },
    ],
  },
]

const HR_SEEDS: SeedCase[] = [
  {
    id: 'HR-0214',
    subject: 'Workplace conduct report',
    assignee: 'V. Pereira (HRBP)',
    supervisor: 'C. Adebayo (Head of HR)',
    stage: 'reported',
    slaHours: 5,
    slaTotalHours: 24,
    fields: {
      reporter: 'Confidential',
      subject: 'Confidential',
      department: 'Operations',
      severity: 'Medium',
      incidentNo: 'HR-0214',
    },
    initialEvents: [
      { hoursAgo: 18, kind: 'intake', title: 'Incident reported via confidential channel', actor: 'Speak-up line' },
      { hoursAgo: 16, kind: 'assignment', title: 'Assigned to V. Pereira', actor: 'System' },
    ],
  },
  {
    id: 'HR-0210',
    subject: 'Conflict of interest disclosure',
    assignee: 'V. Pereira (HRBP)',
    supervisor: 'C. Adebayo (Head of HR)',
    stage: 'investigation',
    slaHours: 14,
    slaTotalHours: 24,
    fields: {
      reporter: 'L. Naidoo (Manager)',
      subject: 'Confidential',
      department: 'Procurement',
      severity: 'High',
      incidentNo: 'HR-0210',
    },
    initialEvents: [
      { hoursAgo: 60, kind: 'intake', title: 'Incident reported by manager', actor: 'L. Naidoo' },
      { hoursAgo: 54, kind: 'transition', title: 'Moved to Investigation', actor: 'V. Pereira' },
      { hoursAgo: 24, kind: 'document', title: 'Document uploaded: Interview notes (witness 1).pdf', actor: 'V. Pereira' },
    ],
    initialDocs: [
      { hoursAgo: 24, name: 'Interview notes (witness 1).pdf', uploadedBy: 'V. Pereira' },
    ],
  },
  {
    id: 'HR-0204',
    subject: 'Safety incident, Warehouse B',
    assignee: 'V. Pereira (HRBP)',
    supervisor: 'C. Adebayo (Head of HR)',
    stage: 'action',
    slaHours: 9,
    slaTotalHours: 12,
    fields: {
      reporter: 'Floor supervisor',
      subject: 'Team, Warehouse B',
      department: 'Warehouse',
      severity: 'High',
      incidentNo: 'HR-0204',
    },
    initialEvents: [
      { hoursAgo: 120, kind: 'intake', title: 'Incident reported by floor supervisor', actor: 'Floor supervisor' },
      { hoursAgo: 96, kind: 'transition', title: 'Moved to Investigation', actor: 'V. Pereira' },
      { hoursAgo: 36, kind: 'decision', title: 'Action recommended: retraining + safety stand-down', actor: 'V. Pereira' },
      { hoursAgo: 36, kind: 'transition', title: 'Moved to Action', actor: 'V. Pereira' },
    ],
    initialDocs: [
      { hoursAgo: 36, name: 'Action plan.pdf', uploadedBy: 'V. Pereira' },
    ],
  },
  {
    id: 'HR-0188',
    subject: 'Grievance, performance review',
    assignee: 'V. Pereira (HRBP)',
    supervisor: 'C. Adebayo (Head of HR)',
    stage: 'closed',
    slaHours: 0,
    slaTotalHours: 12,
    fields: {
      reporter: 'Confidential',
      subject: 'Confidential',
      department: 'Finance',
      severity: 'Low',
      incidentNo: 'HR-0188',
    },
    initialEvents: [
      { hoursAgo: 480, kind: 'intake', title: 'Grievance reported', actor: 'Confidential' },
      { hoursAgo: 360, kind: 'transition', title: 'Moved to Action', actor: 'V. Pereira' },
      { hoursAgo: 168, kind: 'decision', title: 'Case closed, mediation outcome accepted', actor: 'C. Adebayo' },
      { hoursAgo: 168, kind: 'transition', title: 'Moved to Closed', actor: 'C. Adebayo' },
    ],
  },
]

const INSURANCE_SEEDS: SeedCase[] = [
  {
    id: 'IC-7714',
    subject: 'Motor, collision claim',
    assignee: 'O. Williams (Claims)',
    supervisor: 'B. Kruger (Claims lead)',
    stage: 'filed',
    slaHours: 4,
    slaTotalHours: 18,
    fields: {
      holder: 'D. Reddy',
      policy: 'M-44218',
      claimType: 'Motor · collision',
      lossDate: '07 Sep',
      amount: '$ 4,800',
    },
    initialEvents: [
      { hoursAgo: 16, kind: 'intake', title: 'Claim filed via mobile app', actor: 'Mobile intake' },
      { hoursAgo: 14, kind: 'document', title: 'Document uploaded: Incident photos (×6)', actor: 'D. Reddy' },
    ],
    initialDocs: [
      { hoursAgo: 14, name: 'Incident photos (6).zip', uploadedBy: 'D. Reddy' },
    ],
  },
  {
    id: 'IC-7702',
    subject: 'Household, burst geyser',
    assignee: 'O. Williams (Claims)',
    supervisor: 'B. Kruger (Claims lead)',
    stage: 'assessing',
    slaHours: 10,
    slaTotalHours: 24,
    fields: {
      holder: 'A. Khan',
      policy: 'H-22014',
      claimType: 'Household · escape of water',
      lossDate: '01 Sep',
      amount: '$ 2,200',
    },
    initialEvents: [
      { hoursAgo: 60, kind: 'intake', title: 'Claim filed via call centre', actor: 'Call centre' },
      { hoursAgo: 48, kind: 'transition', title: 'Moved to Assessing', actor: 'O. Williams' },
      { hoursAgo: 48, kind: 'assignment', title: 'Loss adjuster assigned: G. Pretorius', actor: 'O. Williams' },
    ],
  },
  {
    id: 'IC-7689',
    subject: 'Commercial, equipment loss',
    assignee: 'O. Williams (Claims)',
    supervisor: 'B. Kruger (Claims lead)',
    stage: 'adjusting',
    slaHours: 7,
    slaTotalHours: 8,
    fields: {
      holder: 'Lume Studios',
      policy: 'C-08821',
      claimType: 'Commercial · equipment loss',
      lossDate: '20 Aug',
      amount: '$ 14,300',
    },
    initialEvents: [
      { hoursAgo: 240, kind: 'intake', title: 'Claim filed', actor: 'Broker' },
      { hoursAgo: 192, kind: 'transition', title: 'Moved to Assessing', actor: 'O. Williams' },
      { hoursAgo: 72, kind: 'decision', title: 'Settlement quote agreed', actor: 'O. Williams' },
      { hoursAgo: 72, kind: 'transition', title: 'Moved to Adjusting', actor: 'O. Williams' },
    ],
    initialDocs: [
      { hoursAgo: 96, name: 'Adjuster report.pdf', uploadedBy: 'G. Pretorius' },
      { hoursAgo: 72, name: 'Settlement quote.pdf', uploadedBy: 'O. Williams' },
    ],
  },
  {
    id: 'IC-7641',
    subject: 'Travel, medical claim',
    assignee: 'O. Williams (Claims)',
    supervisor: 'B. Kruger (Claims lead)',
    stage: 'paid',
    slaHours: 0,
    slaTotalHours: 8,
    fields: {
      holder: 'M. Sato',
      policy: 'T-31180',
      claimType: 'Travel · medical',
      lossDate: '11 Aug',
      amount: '$ 1,140',
    },
    initialEvents: [
      { hoursAgo: 720, kind: 'intake', title: 'Claim filed via portal', actor: 'Portal' },
      { hoursAgo: 600, kind: 'transition', title: 'Moved to Adjusting', actor: 'O. Williams' },
      { hoursAgo: 240, kind: 'decision', title: 'Payment authorised', actor: 'B. Kruger' },
      { hoursAgo: 240, kind: 'transition', title: 'Moved to Paid', actor: 'B. Kruger' },
    ],
  },
]

const MAINTENANCE_SEEDS: SeedCase[] = [
  {
    id: 'MT-3306',
    subject: 'AC unit, meeting room 2 not cooling',
    assignee: 'Help desk',
    supervisor: 'K. Bekker (Facilities lead)',
    stage: 'logged',
    slaHours: 2,
    slaTotalHours: 8,
    fields: {
      asset: 'AC-MR2-A',
      location: 'HQ · Level 3 · Meeting Room 2',
      reportedBy: 'F. Wong',
      priority: 'Medium',
      ticketNo: 'MT-3306',
    },
    initialEvents: [
      { hoursAgo: 6, kind: 'intake', title: 'Ticket logged via portal', actor: 'F. Wong' },
    ],
  },
  {
    id: 'MT-3301',
    subject: 'Leaking pipe, kitchen sink',
    assignee: 'K. Bekker (Facilities lead)',
    supervisor: 'K. Bekker (Facilities lead)',
    stage: 'triaged',
    slaHours: 4,
    slaTotalHours: 6,
    fields: {
      asset: 'Plumbing · Kitchen 1',
      location: 'HQ · Level 1 · Kitchen',
      reportedBy: 'Reception',
      priority: 'High',
      ticketNo: 'MT-3301',
    },
    initialEvents: [
      { hoursAgo: 14, kind: 'intake', title: 'Ticket logged via reception', actor: 'Reception' },
      { hoursAgo: 12, kind: 'transition', title: 'Moved to Triaged', actor: 'K. Bekker' },
    ],
  },
  {
    id: 'MT-3294',
    subject: 'Generator service due',
    assignee: 'J. Pillai (Technician)',
    supervisor: 'K. Bekker (Facilities lead)',
    stage: 'inProgress',
    slaHours: 5,
    slaTotalHours: 6,
    fields: {
      asset: 'Generator-G2',
      location: 'HQ · Plant room',
      reportedBy: 'System alert',
      priority: 'High',
      ticketNo: 'MT-3294',
    },
    initialEvents: [
      { hoursAgo: 60, kind: 'intake', title: 'Service-due alert raised', actor: 'Monitoring system' },
      { hoursAgo: 48, kind: 'transition', title: 'Moved to Triaged', actor: 'K. Bekker' },
      { hoursAgo: 24, kind: 'transition', title: 'Moved to In progress', actor: 'J. Pillai' },
      { hoursAgo: 4, kind: 'communication', title: 'Parts ordered from central store', actor: 'J. Pillai' },
    ],
    initialDocs: [
      { hoursAgo: 4, name: 'Parts order.pdf', uploadedBy: 'J. Pillai' },
    ],
  },
  {
    id: 'MT-3270',
    subject: 'Lift, emergency call resolved',
    assignee: 'J. Pillai (Technician)',
    supervisor: 'K. Bekker (Facilities lead)',
    stage: 'resolved',
    slaHours: 0,
    slaTotalHours: 4,
    fields: {
      asset: 'Lift-A',
      location: 'HQ · Lift A',
      reportedBy: 'Security',
      priority: 'Critical',
      ticketNo: 'MT-3270',
    },
    initialEvents: [
      { hoursAgo: 120, kind: 'intake', title: 'Emergency call from lift A', actor: 'Security' },
      { hoursAgo: 118, kind: 'transition', title: 'Moved to In progress', actor: 'J. Pillai' },
      { hoursAgo: 96, kind: 'decision', title: 'Repair completed', actor: 'J. Pillai' },
      { hoursAgo: 96, kind: 'transition', title: 'Moved to Resolved', actor: 'J. Pillai' },
    ],
    initialDocs: [
      { hoursAgo: 96, name: 'Service report.pdf', uploadedBy: 'J. Pillai' },
    ],
  },
]

const SEEDS: Record<CaseTypeId, SeedCase[]> = {
  legal: LEGAL_SEEDS,
  ngo: NGO_SEEDS,
  complaint: COMPLAINT_SEEDS,
  hr: HR_SEEDS,
  insurance: INSURANCE_SEEDS,
  maintenance: MAINTENANCE_SEEDS,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const activeTypeId = ref<CaseTypeId>('legal')
const cases = reactive<Record<string, Case>>({})
const caseIdsByType = reactive<Record<CaseTypeId, string[]>>({
  legal: [],
  ngo: [],
  complaint: [],
  hr: [],
  insurance: [],
  maintenance: [],
})
const selectedCaseId = ref<string | null>(null)
const showAudit = ref(false)
const justEscalated = ref<Set<string>>(new Set())

const activeTemplate = computed(() => templateFor(activeTypeId.value))

const activeCases = computed<Case[]>(() =>
  caseIdsByType[activeTypeId.value].map((id) => cases[id]!).filter(Boolean),
)

const selectedCase = computed<Case | null>(() =>
  selectedCaseId.value ? cases[selectedCaseId.value] ?? null : null,
)

// Group cases by stage for the kanban.
const kanbanColumns = computed(() =>
  activeTemplate.value.stages.map((s) => ({
    stage: s,
    isTerminal: isTerminalStage(activeTypeId.value, s.id),
    cases: activeCases.value.filter((c) => c.stage === s.id),
  })),
)

// Triggerable events for the selected case at its current stage.
const triggerableEvents = computed<EventTemplate[]>(() => {
  const c = selectedCase.value
  if (!c || c.isResolved) return []
  const tpl = templateFor(c.typeId)
  return tpl.events.filter((e) => {
    if (!e.stages || e.stages.length === 0) return true
    return e.stages.includes(c.stage)
  })
})

// Top-level stats for the pillars row.
const stats = computed(() => {
  const all = activeCases.value
  const open = all.filter((c) => !c.isResolved)
  const breached = open.filter((c) => c.slaDeadlineMs - simNowMs.value <= 0)
  const escalated = open.filter((c) => c.hasEscalated)
  const totalEvents = all.reduce((acc, c) => acc + c.events.length, 0)
  return {
    open: open.length,
    breached: breached.length,
    escalated: escalated.length,
    totalEvents,
  }
})

// ---------------------------------------------------------------------------
// Seed instantiation
// ---------------------------------------------------------------------------

function buildCaseFromSeed(typeId: CaseTypeId, s: SeedCase, nowMs: number): Case {
  const events: CaseEvent[] = s.initialEvents
    .map((e) => ({
      id: uid('e'),
      at: nowMs - e.hoursAgo * 3_600_000,
      kind: e.kind,
      title: e.title,
      actor: e.actor,
      detail: e.detail,
      meta: e.meta,
    }))
    // newest-first for display
    .sort((a, b) => b.at - a.at)

  const documents: CaseDoc[] = (s.initialDocs ?? [])
    .map((d) => ({
      id: uid('d'),
      name: d.name,
      uploadedBy: d.uploadedBy,
      at: nowMs - d.hoursAgo * 3_600_000,
    }))
    .sort((a, b) => b.at - a.at)

  const resolved = isTerminalStage(typeId, s.stage)
  // For resolved cases, the deadline is irrelevant, set it well in the past.
  const deadline = resolved
    ? nowMs - 72 * 3_600_000
    : nowMs + s.slaHours * 3_600_000

  return {
    id: s.id,
    typeId,
    subject: s.subject,
    assignee: s.assignee,
    supervisor: s.supervisor,
    stage: s.stage,
    fields: { ...s.fields },
    slaTotalHours: s.slaTotalHours,
    slaDeadlineMs: deadline,
    events,
    documents,
    hasEscalated: false,
    isResolved: resolved,
    createdAtMs:
      events.length > 0
        ? Math.min(...events.map((e) => e.at))
        : nowMs - 24 * 3_600_000,
  }
}

function resetType(typeId: CaseTypeId) {
  const nowMs = simNowMs.value
  // Wipe existing entries for this type.
  for (const id of caseIdsByType[typeId]) {
    delete cases[id]
  }
  caseIdsByType[typeId] = []
  for (const seed of SEEDS[typeId]) {
    const built = buildCaseFromSeed(typeId, seed, nowMs)
    cases[built.id] = built
    caseIdsByType[typeId].push(built.id)
  }
}

function resetAll() {
  selectedCaseId.value = null
  showAudit.value = false
  justEscalated.value = new Set()
  ;(Object.keys(SEEDS) as CaseTypeId[]).forEach(resetType)
}

// ---------------------------------------------------------------------------
// Tick + breach detection
// ---------------------------------------------------------------------------

let tickHandle: ReturnType<typeof setInterval> | null = null

function tick() {
  simHoursElapsed.value += HOURS_PER_TICK
  checkBreaches()
}

function checkBreaches() {
  for (const id of Object.keys(cases)) {
    const c = cases[id]!
    if (c.isResolved) continue
    if (c.hasEscalated) continue
    if (simNowMs.value > c.slaDeadlineMs) {
      autoEscalate(c)
    }
  }
}

function autoEscalate(c: Case) {
  const now = simNowMs.value
  // All escalation events stamped at "now" so they cluster as a single event
  // in the timeline (newest-first display order = reverse of insertion).
  c.events.unshift(
    {
      id: uid('e'),
      at: now,
      kind: 'sla',
      title: 'SLA deadline crossed',
      actor: 'System',
      meta: 'Escalation rule triggered',
    },
    {
      id: uid('e'),
      at: now,
      kind: 'escalation',
      title: 'Escalation rule fired',
      actor: 'System',
      detail: `Case bumped. ${c.supervisor} notified. SLA reset to 6h.`,
    },
    {
      id: uid('e'),
      at: now,
      kind: 'communication',
      title: `Supervisor notified: ${c.supervisor}`,
      actor: 'System',
    },
    {
      id: uid('e'),
      at: now,
      kind: 'assignment',
      title: `Reassigned to ${c.supervisor}`,
      actor: 'System',
    },
    {
      id: uid('e'),
      at: now,
      kind: 'sla',
      title: 'SLA reset to 6h',
      actor: 'System',
    },
    {
      id: uid('e'),
      at: now,
      kind: 'comment',
      title: 'Auto-logged comment: "Escalated automatically on SLA breach."',
      actor: 'System',
    },
  )
  c.assignee = c.supervisor
  c.hasEscalated = true
  c.slaDeadlineMs = now + 6 * 3_600_000
  c.slaTotalHours = 6

  justEscalated.value.add(c.id)
  // Clear pulse highlight after 1.6s of real time.
  setTimeout(() => {
    justEscalated.value.delete(c.id)
    // Trigger reactivity on the set.
    justEscalated.value = new Set(justEscalated.value)
  }, 1600)
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function openCase(id: string) {
  selectedCaseId.value = id
  showAudit.value = false
}

function backToKanban() {
  selectedCaseId.value = null
  showAudit.value = false
}

function fastForward(hours: number) {
  simHoursElapsed.value += hours
  checkBreaches()
}

function fireEvent(tpl: EventTemplate) {
  const c = selectedCase.value
  if (!c || c.isResolved) return
  const now = simNowMs.value

  // Optional document upload, logged first so the timeline shows the upload
  // beneath the action that produced it.
  if (tpl.documentName) {
    c.documents.unshift({
      id: uid('d'),
      name: tpl.documentName,
      uploadedBy: c.assignee,
      at: now,
    })
    c.events.unshift({
      id: uid('e'),
      at: now,
      kind: 'document',
      title: `Document uploaded: ${tpl.documentName}`,
      actor: c.assignee,
    })
  }

  // Main action
  c.events.unshift({
    id: uid('e'),
    at: now,
    kind: tpl.kind,
    title: tpl.label,
    actor: c.assignee,
    detail: tpl.detail,
  })

  // Optional stage transition
  if (tpl.toStage && tpl.toStage !== c.stage) {
    const fromLabel = stageLabel(c.typeId, c.stage)
    const toLabel = stageLabel(c.typeId, tpl.toStage)
    c.stage = tpl.toStage
    c.events.unshift({
      id: uid('e'),
      at: now,
      kind: 'transition',
      title: `Moved to ${toLabel}`,
      actor: c.assignee,
      detail: `${fromLabel} → ${toLabel}`,
    })
    if (isTerminalStage(c.typeId, tpl.toStage)) {
      c.isResolved = true
      c.events.unshift({
        id: uid('e'),
        at: now,
        kind: 'decision',
        title: 'Case resolved, record sealed',
        actor: 'System',
      })
    }
  }

  // Optional SLA reset
  if (tpl.slaResetHours && !c.isResolved) {
    c.slaTotalHours = tpl.slaResetHours
    c.slaDeadlineMs = now + tpl.slaResetHours * 3_600_000
    c.events.unshift({
      id: uid('e'),
      at: now,
      kind: 'sla',
      title: `SLA reset to ${tpl.slaResetHours}h`,
      actor: 'System',
    })
  }

  // Optional comment
  if (tpl.comment) {
    c.events.unshift({
      id: uid('e'),
      at: now,
      kind: 'comment',
      title: tpl.comment,
      actor: c.assignee,
    })
  }
}

// ---------------------------------------------------------------------------
// Audit-trail export
// ---------------------------------------------------------------------------

function formatExportLine(c: CaseEvent): string {
  const ts = new Date(c.at).toISOString().replace('T', ' ').slice(0, 16)
  const meta = c.meta ? ` [${c.meta}]` : ''
  const detail = c.detail ? `\n      ${c.detail}` : ''
  return `  ${ts} UTC · ${c.actor} · ${c.title}${meta}${detail}`
}

function buildExportText(c: Case): string {
  const tpl = templateFor(c.typeId)
  const chronological = [...c.events].sort((a, b) => a.at - b.at)
  const stageLine = `${stageLabel(c.typeId, c.stage)}${c.isResolved ? ' (resolved)' : ''}`
  const headerLines = [
    'CASE AUDIT TRAIL',
    '================',
    '',
    `Case ID:   ${c.id}`,
    `Type:      ${tpl.label}`,
    `Subject:   ${c.subject}`,
    `Stage:     ${stageLine}`,
    `Assignee:  ${c.assignee}`,
    `Supervisor: ${c.supervisor}`,
    `Generated: ${new Date(simNowMs.value).toISOString().replace('T', ' ').slice(0, 16)} UTC`,
    '',
    'FIELDS',
    '------',
  ]
  const fieldLines = tpl.fields.map(
    (f) => `${f.label.padEnd(18, ' ')} ${c.fields[f.key] ?? '-'}`,
  )
  const docLines =
    c.documents.length > 0
      ? [
          '',
          'DOCUMENTS',
          '---------',
          ...c.documents.map(
            (d) =>
              `  ${new Date(d.at).toISOString().slice(0, 16).replace('T', ' ')} UTC · ${d.uploadedBy} · ${d.name}`,
          ),
        ]
      : ['', 'DOCUMENTS', '---------', '  (none)']
  const timelineLines = [
    '',
    'TIMELINE (chronological)',
    '------------------------',
    ...chronological.map(formatExportLine),
    '',
    '- end of record -',
  ]
  return [...headerLines, ...fieldLines, ...docLines, ...timelineLines].join('\n')
}

function downloadAudit() {
  const c = selectedCase.value
  if (!c) return
  const text = buildExportText(c)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-${c.id}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 500)
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function slaRemainingHours(c: Case): number {
  return (c.slaDeadlineMs - simNowMs.value) / 3_600_000
}

function formatSla(c: Case): string {
  if (c.isResolved) return 'Resolved'
  const h = slaRemainingHours(c)
  if (h <= 0) {
    const overdue = Math.abs(h)
    if (overdue < 1) {
      return `Breached · ${Math.round(overdue * 60)}m over`
    }
    return `Breached · ${Math.floor(overdue)}h over`
  }
  if (h < 1) {
    return `${Math.max(1, Math.round(h * 60))}m left`
  }
  const whole = Math.floor(h)
  return `${whole}h left`
}

type SlaState = 'on-track' | 'due-soon' | 'at-risk' | 'breached' | 'escalated' | 'resolved'

function slaState(c: Case): SlaState {
  if (c.isResolved) return 'resolved'
  const h = slaRemainingHours(c)
  if (h <= 0) return c.hasEscalated ? 'escalated' : 'breached'
  if (c.hasEscalated) return 'escalated'
  if (h < 4) return 'at-risk'
  if (h < 12) return 'due-soon'
  return 'on-track'
}

function slaBarPct(c: Case): number {
  if (c.isResolved) return 0
  const total = c.slaTotalHours
  const left = Math.max(0, slaRemainingHours(c))
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, (left / total) * 100))
}

function slaToneClasses(state: SlaState): {
  chip: string
  bar: string
  text: string
} {
  switch (state) {
    case 'on-track':
      return {
        chip: 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25',
        bar: 'bg-cyan-brand-deep',
        text: 'text-cyan-brand-deep',
      }
    case 'due-soon':
      return {
        chip: 'bg-surface-alt text-ink ring-line',
        bar: 'bg-ink/70',
        text: 'text-ink',
      }
    case 'at-risk':
      return {
        chip: 'bg-red-50 text-red-600 ring-red-100',
        bar: 'bg-red-600',
        text: 'text-red-600',
      }
    case 'breached':
      return {
        chip: 'bg-red-50 text-red-600 ring-red-100',
        bar: 'bg-red-600',
        text: 'text-red-600',
      }
    case 'escalated':
      return {
        chip: 'bg-ink text-white ring-ink',
        bar: 'bg-ink',
        text: 'text-ink',
      }
    case 'resolved':
      return {
        chip: 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25',
        bar: 'bg-cyan-brand-deep',
        text: 'text-cyan-brand-deep',
      }
  }
}

function slaLabel(state: SlaState): string {
  switch (state) {
    case 'on-track':
      return 'On track'
    case 'due-soon':
      return 'Due soon'
    case 'at-risk':
      return 'At risk'
    case 'breached':
      return 'Breached'
    case 'escalated':
      return 'Escalated'
    case 'resolved':
      return 'Resolved'
  }
}

function formatRelative(ms: number): string {
  const diff = simNowMs.value - ms
  if (diff < 0) {
    const ahead = Math.abs(diff) / 3_600_000
    if (ahead < 1) return `in ${Math.max(1, Math.round(ahead * 60))}m`
    return `in ${Math.floor(ahead)}h`
  }
  const hours = diff / 3_600_000
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m ago`
  if (hours < 24) return `${Math.floor(hours)}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function eventIcon(kind: EventKind): Component {
  switch (kind) {
    case 'intake':
      return Plus
    case 'document':
      return Paperclip
    case 'communication':
      return Send
    case 'decision':
      return CheckCircle2
    case 'sla':
      return Hourglass
    case 'escalation':
      return Flag
    case 'comment':
      return MessageSquare
    case 'transition':
      return ArrowRight
    case 'assignment':
      return UserCheck
  }
}

function eventToneClass(kind: EventKind): string {
  switch (kind) {
    case 'escalation':
    case 'sla':
      return 'bg-red-50 text-red-600 ring-red-100'
    case 'decision':
    case 'document':
      return 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
    default:
      return 'bg-surface-alt text-ink ring-line'
  }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

onMounted(() => {
  simEpochMs = Date.now()
  resetAll()
  tickHandle = setInterval(tick, TICK_MS)
})

onBeforeUnmount(() => {
  if (tickHandle !== null) clearInterval(tickHandle)
})

// When switching case type while a case is open, drop back to the kanban
// so we don't display a card that doesn't belong to the visible board.
watch(activeTypeId, () => {
  if (selectedCase.value && selectedCase.value.typeId !== activeTypeId.value) {
    selectedCaseId.value = null
    showAudit.value = false
  }
})

</script>

<template>
  <div class="p-5 md:p-7 lg:p-8">
    <!-- =========================================================== -->
    <!-- Header strip                                                 -->
    <!-- =========================================================== -->
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <span
          class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
        >
          <span class="dot" />
          Live engine
        </span>
        <p class="mt-3 max-w-xl text-[14.5px] md:text-[15px] leading-[1.55] text-mute">
          One engine, six case types. Fire an event and the case advances -
          deadlines recompute, assignees update, breach rules escalate
          themselves. Every action is written to the audit trail
          <strong class="text-ink font-semibold">as it happens</strong>.
        </p>
      </div>
      <div
        class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2 flex items-center gap-2"
        aria-hidden="true"
      >
        <Clock :size="14" :stroke-width="2" />
        <span>1s = 1 case-hour</span>
      </div>
    </div>

    <!-- =========================================================== -->
    <!-- Case-type tabs                                               -->
    <!-- =========================================================== -->
    <div class="mt-5">
      <div
        role="tablist"
        aria-label="Case type"
        class="flex flex-wrap gap-1 rounded-xl border border-line bg-surface-alt p-1"
      >
        <button
          v-for="t in CASE_TYPES"
          :key="t.id"
          role="tab"
          :aria-selected="activeTypeId === t.id"
          :class="[
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
            activeTypeId === t.id
              ? 'bg-white text-ink shadow-[0_1px_0_rgba(15,23,42,0.04)] border border-line'
              : 'text-mute hover:text-ink',
          ]"
          @click="activeTypeId = t.id"
        >
          <component :is="t.icon" :size="14" :stroke-width="2" aria-hidden="true" />
          {{ t.label }}
        </button>
      </div>
      <p class="mt-2 text-[12.5px] text-mute-2">
        Switching case type swaps the workflow, fields and SLAs, not the engine.
      </p>
    </div>

    <!-- =========================================================== -->
    <!-- Stats strip                                                  -->
    <!-- =========================================================== -->
    <div class="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2.5">
      <div class="rounded-xl border border-line bg-white px-4 py-3">
        <div class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
          Open cases
        </div>
        <div class="mt-1 font-display text-[24px] leading-none text-ink tabular-nums">
          {{ stats.open }}
        </div>
      </div>
      <div class="rounded-xl border border-line bg-white px-4 py-3">
        <div class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
          Breached
        </div>
        <div
          class="mt-1 font-display text-[24px] leading-none tabular-nums"
          :class="stats.breached > 0 ? 'text-red-600' : 'text-ink'"
        >
          {{ stats.breached }}
        </div>
      </div>
      <div class="rounded-xl border border-line bg-white px-4 py-3">
        <div class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
          Escalated
        </div>
        <div class="mt-1 font-display text-[24px] leading-none text-ink tabular-nums">
          {{ stats.escalated }}
        </div>
      </div>
      <div class="rounded-xl border border-line bg-white px-4 py-3">
        <div class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
          Audit events
        </div>
        <div class="mt-1 font-display text-[24px] leading-none text-ink tabular-nums">
          {{ stats.totalEvents }}
        </div>
      </div>
    </div>

    <!-- =========================================================== -->
    <!-- KANBAN view                                                  -->
    <!-- =========================================================== -->
    <template v-if="!selectedCase">
      <div class="mt-6 flex items-center justify-between">
        <div class="flex items-center gap-2 text-[13px] text-mute">
          <Layers :size="14" :stroke-width="2" aria-hidden="true" />
          <span>{{ activeTemplate.caseNoun.charAt(0).toUpperCase() + activeTemplate.caseNoun.slice(1) }} board</span>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-mute hover:text-ink hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          @click="() => resetType(activeTypeId)"
        >
          <RotateCcw :size="13" :stroke-width="2" aria-hidden="true" />
          Reset board
        </button>
      </div>

      <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="col in kanbanColumns"
          :key="col.stage.id"
          class="rounded-xl border border-line bg-surface-alt/60 p-3"
        >
          <div class="flex items-center justify-between mb-2.5 px-1">
            <div class="text-[11.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
              {{ col.stage.label }}
            </div>
            <div
              class="text-[11px] tabular-nums text-mute-2 inline-flex items-center justify-center min-w-[20px] h-[18px] rounded-full bg-white border border-line px-1.5"
            >
              {{ col.cases.length }}
            </div>
          </div>

          <div v-if="col.cases.length === 0" class="px-1 py-6 text-center text-[12px] text-mute-2">
            No {{ activeTemplate.caseNoun }}s
          </div>

          <div v-else class="space-y-2">
            <button
              v-for="c in col.cases"
              :key="c.id"
              type="button"
              :class="[
                'cm-card group w-full text-left rounded-xl border bg-white p-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                slaState(c) === 'breached' || slaState(c) === 'at-risk'
                  ? 'border-red-100 hover:border-red-200'
                  : slaState(c) === 'escalated'
                  ? 'border-ink/40'
                  : 'border-line hover:border-ink/25',
                justEscalated.has(c.id) ? 'cm-escalated-pulse' : '',
              ]"
              @click="openCase(c.id)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold tabular-nums">
                    {{ c.id }}
                  </div>
                  <div class="mt-0.5 text-[13.5px] font-semibold text-ink leading-[1.3] truncate">
                    {{ c.subject }}
                  </div>
                </div>
                <span
                  :class="[
                    'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em] font-bold ring-1',
                    slaToneClasses(slaState(c)).chip,
                  ]"
                >
                  <AlertTriangle
                    v-if="slaState(c) === 'breached' || slaState(c) === 'at-risk'"
                    :size="10"
                    :stroke-width="2.4"
                    aria-hidden="true"
                  />
                  <Flag
                    v-else-if="slaState(c) === 'escalated'"
                    :size="10"
                    :stroke-width="2.4"
                    aria-hidden="true"
                  />
                  <CheckCircle2
                    v-else-if="slaState(c) === 'resolved'"
                    :size="10"
                    :stroke-width="2.4"
                    aria-hidden="true"
                  />
                  <Clock v-else :size="10" :stroke-width="2.4" aria-hidden="true" />
                  {{ slaLabel(slaState(c)) }}
                </span>
              </div>

              <!-- SLA timer -->
              <div v-if="!c.isResolved" class="mt-3">
                <div class="flex items-baseline justify-between mb-1">
                  <span class="text-[10.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold">
                    SLA
                  </span>
                  <span
                    :class="[
                      'text-[12px] tabular-nums font-semibold',
                      slaToneClasses(slaState(c)).text,
                    ]"
                  >
                    {{ formatSla(c) }}
                  </span>
                </div>
                <div class="h-1.5 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    :class="['h-full transition-[width] duration-500 ease-out', slaToneClasses(slaState(c)).bar]"
                    :style="{ width: `${slaBarPct(c)}%` }"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <!-- Meta row -->
              <div class="mt-3 flex items-center justify-between text-[11.5px] text-mute">
                <span class="truncate">{{ c.assignee }}</span>
                <span class="inline-flex items-center gap-2 shrink-0 text-mute-2">
                  <span class="inline-flex items-center gap-0.5">
                    <Paperclip :size="11" :stroke-width="2" aria-hidden="true" />
                    {{ c.documents.length }}
                  </span>
                  <span class="inline-flex items-center gap-0.5">
                    <History :size="11" :stroke-width="2" aria-hidden="true" />
                    {{ c.events.length }}
                  </span>
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <p class="mt-3 text-[12.5px] text-mute-2 flex items-center gap-1.5">
        <Sparkles :size="12" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
        Click a card to open the case record and trigger events.
      </p>
    </template>

    <!-- =========================================================== -->
    <!-- CASE DETAIL view                                             -->
    <!-- =========================================================== -->
    <template v-else>
      <div class="mt-6">
        <!-- Top action row -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-mute hover:text-ink hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 self-start"
            @click="backToKanban"
          >
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            Back to board
          </button>
          <div class="flex items-center gap-2">
            <button
              v-if="!selectedCase.isResolved"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="() => fastForward(8)"
            >
              <FastForward :size="14" :stroke-width="2" aria-hidden="true" />
              Skip 8h
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              @click="showAudit = true"
            >
              <History :size="14" :stroke-width="2" aria-hidden="true" />
              Export audit trail
            </button>
          </div>
        </div>

        <!-- Case header card -->
        <div
          :class="[
            'mt-4 rounded-xl border bg-white p-5 md:p-6 transition-colors',
            slaState(selectedCase) === 'breached' || slaState(selectedCase) === 'at-risk'
              ? 'border-red-100'
              : slaState(selectedCase) === 'escalated'
              ? 'border-ink/30'
              : 'border-line',
            justEscalated.has(selectedCase.id) ? 'cm-escalated-pulse' : '',
          ]"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <div class="text-[11px] uppercase tracking-[0.22em] text-mute-2 font-semibold tabular-nums">
                {{ selectedCase.id }} · {{ activeTemplate.label }}
              </div>
              <h3 class="mt-1 font-display text-[22px] md:text-[32px] leading-[1.15] text-ink break-words">
                {{ selectedCase.subject }}
              </h3>
              <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-mute">
                <span class="inline-flex items-center gap-1.5">
                  <UserCheck :size="13" :stroke-width="2" class="text-mute-2" aria-hidden="true" />
                  {{ selectedCase.assignee }}
                </span>
                <span class="text-mute-2">·</span>
                <span class="inline-flex items-center gap-1.5">
                  <Layers :size="13" :stroke-width="2" class="text-mute-2" aria-hidden="true" />
                  {{ stageLabel(selectedCase.typeId, selectedCase.stage) }}
                </span>
              </div>
            </div>

            <!-- SLA panel (right side) -->
            <div
              v-if="!selectedCase.isResolved"
              class="shrink-0 rounded-lg border border-line bg-surface-alt/70 px-4 py-3 w-full md:w-auto md:min-w-[200px]"
            >
              <div class="flex items-baseline justify-between gap-2">
                <span class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                  SLA timer
                </span>
                <span
                  :class="[
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em] font-bold ring-1',
                    slaToneClasses(slaState(selectedCase)).chip,
                  ]"
                >
                  {{ slaLabel(slaState(selectedCase)) }}
                </span>
              </div>
              <div
                :class="['mt-1 font-display text-[24px] leading-none tabular-nums', slaToneClasses(slaState(selectedCase)).text]"
              >
                {{ formatSla(selectedCase) }}
              </div>
              <div class="mt-2 h-1.5 rounded-full bg-white border border-line overflow-hidden">
                <div
                  :class="['h-full transition-[width] duration-500 ease-out', slaToneClasses(slaState(selectedCase)).bar]"
                  :style="{ width: `${slaBarPct(selectedCase)}%` }"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div
              v-else
              class="shrink-0 rounded-lg border border-line bg-cyan-brand/[0.06] px-4 py-3 w-full md:w-auto md:min-w-[200px]"
            >
              <div class="text-[11px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                Status
              </div>
              <div class="mt-1 inline-flex items-center gap-1.5 font-display text-[20px] leading-none text-ink">
                <CheckCircle2 :size="18" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
                Resolved
              </div>
              <div class="mt-1.5 text-[12px] text-mute">
                Record sealed · audit trail available
              </div>
            </div>
          </div>

          <!-- Stage progress -->
          <div class="mt-5">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <template v-for="(s, idx) in activeTemplate.stages" :key="s.id">
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ring-1',
                      selectedCase.stage === s.id
                        ? 'bg-cyan-brand-deep text-white ring-cyan-brand-deep'
                        : activeTemplate.stages.findIndex((x) => x.id === selectedCase.stage) > idx || selectedCase.isResolved
                        ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                        : 'bg-white text-mute-2 ring-line',
                    ]"
                  >
                    {{ activeTemplate.stages.findIndex((x) => x.id === selectedCase.stage) > idx || (selectedCase.isResolved && idx <= activeTemplate.stages.findIndex((x) => x.id === selectedCase.stage)) ? '✓' : idx + 1 }}
                  </span>
                  <span
                    :class="[
                      'text-[12px] font-semibold whitespace-nowrap',
                      selectedCase.stage === s.id ? 'text-ink' : 'text-mute',
                    ]"
                  >
                    {{ s.label }}
                  </span>
                </div>
                <span
                  v-if="idx < activeTemplate.stages.length - 1"
                  class="hidden sm:inline-block flex-1 h-px bg-line"
                  aria-hidden="true"
                />
              </template>
            </div>
          </div>
        </div>

        <!-- Two-column: fields/docs + triggers -->
        <div class="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-4">
          <!-- Fields + Documents -->
          <div class="space-y-4">
            <div class="rounded-xl border border-line bg-white p-5">
              <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-3">
                Case record
              </div>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                <div v-for="f in activeTemplate.fields" :key="f.key">
                  <dt class="text-[11.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold">
                    {{ f.label }}
                  </dt>
                  <dd class="mt-0.5 text-[14px] text-ink">
                    {{ selectedCase.fields[f.key] ?? '-' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-[11.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold">
                    Supervisor
                  </dt>
                  <dd class="mt-0.5 text-[14px] text-ink">
                    {{ selectedCase.supervisor }}
                  </dd>
                </div>
              </dl>
            </div>

            <div class="rounded-xl border border-line bg-white p-5">
              <div class="flex items-center justify-between mb-3">
                <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                  Documents
                </div>
                <span class="text-[11.5px] text-mute-2 tabular-nums">
                  {{ selectedCase.documents.length }}
                </span>
              </div>
              <ul v-if="selectedCase.documents.length > 0" class="space-y-1.5">
                <li
                  v-for="d in selectedCase.documents"
                  :key="d.id"
                  class="flex items-center justify-between gap-2 rounded-md px-2.5 py-2 hover:bg-surface-alt transition-colors"
                >
                  <span class="inline-flex items-center gap-2 min-w-0">
                    <Paperclip :size="13" :stroke-width="2" class="text-cyan-brand-deep shrink-0" aria-hidden="true" />
                    <span class="text-[13.5px] text-ink truncate">{{ d.name }}</span>
                  </span>
                  <span class="text-[11.5px] text-mute-2 shrink-0 tabular-nums">
                    {{ formatRelative(d.at) }} · {{ d.uploadedBy }}
                  </span>
                </li>
              </ul>
              <p v-else class="text-[13px] text-mute py-2">
                No documents uploaded yet.
              </p>
            </div>
          </div>

          <!-- Event triggers -->
          <div class="rounded-xl border border-line bg-white p-5">
            <div class="flex items-center gap-2 mb-3">
              <Zap :size="14" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
              <h4 class="text-[14px] font-semibold uppercase tracking-[0.16em] text-ink">
                Trigger an event
              </h4>
            </div>

            <div v-if="selectedCase.isResolved" class="rounded-lg bg-surface-alt p-4 text-[13px] text-mute leading-[1.55]">
              <CheckCircle2 :size="16" :stroke-width="2" class="inline-block mr-1.5 text-cyan-brand-deep align-text-bottom" aria-hidden="true" />
              This case is resolved. The record is sealed, further events
              cannot fire. The full audit trail remains exportable.
            </div>

            <template v-else>
              <p class="text-[12.5px] text-mute leading-[1.55] mb-3">
                Events available at <strong class="text-ink font-semibold">{{ stageLabel(selectedCase.typeId, selectedCase.stage) }}</strong>.
                Firing one advances the case, recomputes the SLA, and writes to the audit trail.
              </p>
              <div class="space-y-2">
                <button
                  v-for="e in triggerableEvents"
                  :key="e.id"
                  type="button"
                  class="cm-event-btn group w-full text-left rounded-lg border border-line bg-white hover:border-cyan-brand/45 hover:bg-cyan-brand/[0.03] p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                  @click="() => fireEvent(e)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="text-[13.5px] font-semibold text-ink">
                        {{ e.label }}
                      </div>
                      <div class="mt-0.5 text-[12px] text-mute leading-[1.5]">
                        {{ e.detail }}
                      </div>
                      <div class="mt-1.5 flex flex-wrap gap-1.5">
                        <span
                          v-if="e.toStage && e.toStage !== selectedCase.stage"
                          class="inline-flex items-center gap-1 rounded-full bg-surface-alt ring-1 ring-line px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink"
                        >
                          <ArrowRight :size="9" :stroke-width="2.4" aria-hidden="true" />
                          {{ stageLabel(selectedCase.typeId, e.toStage) }}
                        </span>
                        <span
                          v-if="e.slaResetHours"
                          class="inline-flex items-center gap-1 rounded-full bg-cyan-brand/10 ring-1 ring-cyan-brand/25 px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-cyan-brand-deep"
                        >
                          <Clock :size="9" :stroke-width="2.4" aria-hidden="true" />
                          SLA {{ e.slaResetHours }}h
                        </span>
                        <span
                          v-if="e.documentName"
                          class="inline-flex items-center gap-1 rounded-full bg-surface-alt ring-1 ring-line px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink"
                        >
                          <Paperclip :size="9" :stroke-width="2.4" aria-hidden="true" />
                          Document
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      :size="14"
                      :stroke-width="2"
                      class="text-mute-2 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </div>

              <div
                class="mt-4 flex items-start gap-2 rounded-lg border border-dashed border-line bg-surface-alt/60 p-3"
              >
                <Bell :size="14" :stroke-width="2" class="text-cyan-brand-deep mt-0.5 shrink-0" aria-hidden="true" />
                <div class="text-[12.5px] text-mute leading-[1.55]">
                  Want to see the breach rule fire? Press
                  <strong class="text-ink font-semibold">Skip 8h</strong>
                  until the SLA hits zero. The escalation auto-runs:
                  case bumped, supervisor notified, comment auto-logged.
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Timeline -->
        <div class="mt-4 rounded-xl border border-line bg-white p-5 md:p-6">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <ListChecks :size="14" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
              <h4 class="text-[14px] font-semibold uppercase tracking-[0.16em] text-ink">
                Timeline
              </h4>
            </div>
            <span class="text-[11.5px] text-mute-2">
              {{ selectedCase.events.length }} events · newest first
            </span>
          </div>

          <ol class="space-y-2">
            <li
              v-for="ev in selectedCase.events"
              :key="ev.id"
              class="flex items-start gap-3 rounded-lg px-2.5 py-2 hover:bg-surface-alt/60 transition-colors"
            >
              <span
                :class="[
                  'mt-0.5 inline-flex items-center justify-center h-7 w-7 rounded-lg ring-1 shrink-0',
                  eventToneClass(ev.kind),
                ]"
                aria-hidden="true"
              >
                <component :is="eventIcon(ev.kind)" :size="13" :stroke-width="2" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span class="text-[13.5px] font-semibold text-ink">
                    {{ ev.title }}
                  </span>
                  <span class="text-[11.5px] text-mute-2 tabular-nums">
                    {{ formatRelative(ev.at) }} · {{ ev.actor }}
                  </span>
                </div>
                <div
                  v-if="ev.detail"
                  class="mt-0.5 text-[12.5px] text-mute leading-[1.55]"
                >
                  {{ ev.detail }}
                </div>
                <div
                  v-if="ev.meta"
                  class="mt-1 inline-flex items-center gap-1 rounded-full bg-red-50 ring-1 ring-red-100 px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-red-600"
                >
                  {{ ev.meta }}
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </template>

    <!-- =========================================================== -->
    <!-- Audit-trail export modal                                     -->
    <!-- =========================================================== -->
    <div
      v-if="showAudit && selectedCase"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Audit trail export"
      @click.self="showAudit = false"
    >
      <div
        class="cm-audit-modal w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-line bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.45)] overflow-hidden"
      >
        <!-- Modal header -->
        <div class="flex items-start justify-between gap-3 px-5 md:px-6 py-4 border-b border-line">
          <div>
            <div class="text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              Audit trail · single document
            </div>
            <div class="mt-1 font-display text-[20px] leading-[1.15] text-ink">
              {{ selectedCase.id }}, {{ selectedCase.subject }}
            </div>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center h-9 w-9 rounded-full text-mute hover:text-ink hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            aria-label="Close audit trail"
            @click="showAudit = false"
          >
            <X :size="16" :stroke-width="2" aria-hidden="true" />
          </button>
        </div>

        <!-- Modal body, document preview -->
        <div class="flex-1 overflow-y-auto px-5 md:px-6 py-5">
          <div class="rounded-xl border border-line bg-surface-alt/40 p-5 md:p-6">
            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px] text-ink">
              <div class="font-semibold text-mute-2 uppercase tracking-[0.12em] text-[11px]">Case ID</div>
              <div class="tabular-nums">{{ selectedCase.id }}</div>
              <div class="font-semibold text-mute-2 uppercase tracking-[0.12em] text-[11px]">Type</div>
              <div>{{ activeTemplate.label }}</div>
              <div class="font-semibold text-mute-2 uppercase tracking-[0.12em] text-[11px]">Stage</div>
              <div>
                {{ stageLabel(selectedCase.typeId, selectedCase.stage) }}
                <span v-if="selectedCase.isResolved" class="text-cyan-brand-deep font-semibold">(resolved)</span>
              </div>
              <div class="font-semibold text-mute-2 uppercase tracking-[0.12em] text-[11px]">Assignee</div>
              <div>{{ selectedCase.assignee }}</div>
              <div class="font-semibold text-mute-2 uppercase tracking-[0.12em] text-[11px]">Supervisor</div>
              <div>{{ selectedCase.supervisor }}</div>
              <template v-for="f in activeTemplate.fields" :key="f.key">
                <div class="font-semibold text-mute-2 uppercase tracking-[0.12em] text-[11px]">{{ f.label }}</div>
                <div>{{ selectedCase.fields[f.key] ?? '-' }}</div>
              </template>
            </div>

            <div class="mt-5">
              <div class="text-[11px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2">
                Documents
              </div>
              <ul v-if="selectedCase.documents.length > 0" class="space-y-1 text-[12.5px] text-ink">
                <li
                  v-for="d in [...selectedCase.documents].sort((a, b) => a.at - b.at)"
                  :key="d.id"
                  class="flex items-baseline justify-between gap-2"
                >
                  <span class="inline-flex items-center gap-1.5 min-w-0">
                    <Paperclip :size="11" :stroke-width="2" class="text-mute-2 shrink-0" aria-hidden="true" />
                    <span class="truncate">{{ d.name }}</span>
                  </span>
                  <span class="text-mute-2 shrink-0 tabular-nums">{{ d.uploadedBy }}</span>
                </li>
              </ul>
              <p v-else class="text-[12.5px] text-mute">(none)</p>
            </div>

            <div class="mt-5">
              <div class="text-[11px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2">
                Chronological event log
              </div>
              <ol class="space-y-2 text-[12.5px] text-ink">
                <li
                  v-for="ev in [...selectedCase.events].sort((a, b) => a.at - b.at)"
                  :key="ev.id"
                  class="border-l-2 border-line pl-3"
                >
                  <div class="font-semibold">{{ ev.title }}</div>
                  <div class="text-[11.5px] text-mute-2 tabular-nums">
                    {{ new Date(ev.at).toISOString().replace('T', ' ').slice(0, 16) }} UTC · {{ ev.actor }}
                  </div>
                  <div v-if="ev.detail" class="text-mute mt-0.5 text-[12px] leading-[1.5]">
                    {{ ev.detail }}
                  </div>
                </li>
              </ol>
            </div>
          </div>
          <p class="mt-3 text-[12px] text-mute-2 leading-[1.55]">
            Every line above was written by the engine as it happened, never edited.
            The full record exports as a single document, ready for an auditor,
            a regulator, or the client.
          </p>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-t border-line bg-surface-alt/40">
          <span class="text-[12px] text-mute-2 tabular-nums">
            {{ selectedCase.events.length }} events · {{ selectedCase.documents.length }} documents
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="showAudit = false"
            >
              Close
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              @click="downloadAudit"
            >
              <Download :size="14" :stroke-width="2" aria-hidden="true" />
              Download .txt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cm-card {
  transition:
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 240ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.cm-card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 12px 28px -16px rgba(15, 23, 42, 0.18),
    0 4px 10px -6px rgba(15, 23, 42, 0.06);
}

.cm-event-btn {
  transition:
    background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.cm-escalated-pulse {
  animation: cmEscalatePulse 1500ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes cmEscalatePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.35);
    transform: translateY(0);
  }
  25% {
    transform: translateY(-1px);
  }
  100% {
    box-shadow: 0 0 0 14px rgba(220, 38, 38, 0);
    transform: translateY(0);
  }
}

.cm-audit-modal {
  animation: cmModalIn 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes cmModalIn {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.985);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cm-card,
  .cm-event-btn,
  .cm-escalated-pulse,
  .cm-audit-modal {
    animation: none;
    transition: none;
  }
  .cm-card:hover {
    transform: none;
  }
}
</style>
