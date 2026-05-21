// Systems showcase — single source of truth.
//
// Scaffolding only: all six entries are status "concept" with TODO copy.
// Replace the TODO strings with real content as systems are documented.
// Wire interactive demos via DemoSlot (see app/components/DemoSlot.vue).

import { Workflow, ShieldCheck, Radar, BarChart3 } from '@lucide/vue'
import type { Component } from 'vue'

export type PillarSlug =
  | 'automation'
  | 'audit-trails'
  | 'anomaly-detection'
  | 'analytics'

export interface PillarMeta {
  slug: PillarSlug
  label: string
  /** Short label for tight contexts (chips). */
  short: string
  icon: Component
}

export const PILLARS: PillarMeta[] = [
  { slug: 'automation',        label: 'Automation',        short: 'Automation',  icon: Workflow },
  { slug: 'audit-trails',      label: 'Audit Trails',      short: 'Audit',       icon: ShieldCheck },
  { slug: 'anomaly-detection', label: 'Anomaly Detection', short: 'Anomaly',     icon: Radar },
  { slug: 'analytics',         label: 'Analytics',         short: 'Analytics',   icon: BarChart3 },
]

export function pillarBySlug(slug: PillarSlug): PillarMeta | undefined {
  return PILLARS.find((p) => p.slug === slug)
}

export type SystemStatus = 'live' | 'in-progress' | 'concept'

export interface System {
  /** URL slug — used for /systems/[slug] route and as DemoSlot registry key. */
  slug: string
  name: string
  /** One-line tagline shown on cards and the detail hero. */
  tagline: string
  pillars: PillarSlug[]
  industry?: string
  bestFor?: string
  /** Optional override; if absent, SystemCard renders a deterministic gradient. */
  thumbnail?: string
  status: SystemStatus
  /** Detail-page triptych: "The problem". */
  problem?: string
  /** Detail-page triptych: "What we built". */
  whatWeBuilt?: string
  /** Detail-page triptych: "What changed". */
  whatChanged?: string
  /**
   * Per-pillar notes for the "How it fits the four pillars" mini-grid on the
   * detail page. Keys are pillar slugs; values are short paragraphs.
   */
  pillarNotes?: Partial<Record<PillarSlug, string>>
  /**
   * Optional override of the DemoSlot registry key. Defaults to `slug`.
   * Use this if multiple systems share a demo component.
   */
  demoComponent?: string
}

// All six entries are scaffolding. Replace TODO copy as content is finalised.
// Order chosen so the gallery opens with the broadest pillar mix.
export const SYSTEMS: System[] = [
  {
    slug: 'kairos',
    name: 'Kairos',
    tagline:
      'The coordinator that never sleeps. Outreach before, traffic-control during, follow-up after — the administrative work that normally consumes a person runs itself.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Events, conferences, service businesses, clinics',
    bestFor:
      'Operators whose calendars, inboxes, and phone lines outpace a single coordinator',
    status: 'live',
    problem:
      'A conference with 800 registrants needs a coordinator chasing confirmations, fielding calls, calming no-shows, and running follow-up — for weeks. Calendars and inboxes outpace the people staffing them, and the work that gets dropped is the work that costs you the next event.',
    whatWeBuilt:
      'Built in partnership with KnvilLabs. Kairos runs a 21-day arc — pre-event outreach, day-of orchestration, post-event re-engagement — and the same engine answers the phone as an AI receptionist. Every message, call, and CRM update is logged with the reasoning that triggered it.',
    whatChanged:
      'Coordinators stopped being switchboards. No-show rates dropped because the system called every at-risk attendee on the morning of the event. Inbound calls to the business stopped going to voicemail. The administrative work that normally consumes a person now runs itself.',
    pillarNotes: {
      'automation':
        'Touchpoints fire on time, in order, without a human in the loop — confirmations, reminders, last-mile directions, recovery calls, follow-up sequences. The same engine handles inbound calls, books appointments, and updates the CRM.',
      'audit-trails':
        'Every outbound message, every inbound call, every CRM mutation is logged with the reasoning that triggered it. A coordinator can replay the system\'s decisions end to end.',
      'analytics':
        'Live attendance, RSVP conversion, call outcomes, and recovery rates feed a single dashboard — so the next event is planned against what actually happened, not what was hoped for.',
    },
  },
  {
    slug: 'approval-workflow',
    name: 'Approval & Sign-Off Workflow',
    tagline:
      'Every approver, every comment, every timestamp — captured automatically. Work moves the instant the last signature lands, not the next business day.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Banking, NGOs, procurement-heavy operations, regulated industries',
    bestFor:
      'Operators where approvals stall in inboxes and audit reconstruction takes weeks',
    status: 'live',
    problem:
      'Approvals live in inboxes. A loan, a grant, a PO sits with the wrong manager for a week. When the auditor asks for the trail, three people dig through email threads to reconstruct who said yes to what — and the regulator gets a story, not a record.',
    whatWeBuilt:
      'A signature engine that routes work by rule — thresholds, roles, conditions — and surfaces it to the next approver the instant the previous one signs off. Every decision, every comment, every condition is captured in an evidence pack a regulator can read as-is.',
    whatChanged:
      'Approval cycles dropped from days to hours. The audit response time for a regulator request went from a week of digging to a one-click export. Conditional approvals — "yes, but only if covenant X holds" — stopped getting lost in conversation and started binding the disbursement.',
    pillarNotes: {
      'automation':
        'The chain reshapes itself when the inputs change. Cross the threshold, the credit committee joins. Drop below it, they don\'t. Nobody phones the next approver — the system does.',
      'audit-trails':
        'Every approver, every comment, every timestamp is stitched into one immutable record. Reconstructing the decision after the fact takes one click, not three people and a week.',
    },
  },
  {
    slug: 'multi-channel-inbox',
    name: 'Multi-Channel Inbox',
    tagline:
      'Every inbound message — email, WhatsApp, SMS, web form, social DM, voicemail — landing in one inbox, with the right person reading the right thing. Nothing slips because it came in on the wrong channel.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Sales-heavy SMBs, service businesses, agencies, professional services',
    bestFor:
      'Operators whose team is watching five inboxes — and missing leads in the sixth they forgot existed',
    status: 'live',
    problem:
      'Customers and prospects pick the channel they like. Your team watches the channel they own. The high-value lead that came in via the support contact form, the warm intro that landed in a LinkedIn DM, the irate voicemail at 5:47pm — they don\'t get answered, and you only find out when the customer leaves or the deal stalls.',
    whatWeBuilt:
      'One inbox, every channel. Email, WhatsApp, SMS, web forms, social DMs, voicemail transcripts — pulled into a single stream, each message classified, routed, and surfaced to the right person within seconds. Replies go back out on the same channel the message arrived on, so the customer never feels handed off.',
    whatChanged:
      'Sales response time dropped to minutes. Complaints stopped slipping through because nobody was watching the voicemail. The team stopped checking six tools and started reading one queue — theirs.',
    pillarNotes: {
      'automation':
        'Every inbound message lands, classifies and routes to the right person without a human reading it first. Replies fire from the same inbox, on the same channel — no copy-paste between tools.',
      'audit-trails':
        'Every message and reply carries its channel, classification, rule and timestamp. The full conversation across channels reads as one thread, not six.',
    },
  },
  {
    slug: 'workflow-orchestrator',
    name: 'Event-Driven Workflow Orchestrator',
    tagline:
      'When X happens, Y and Z follow — across every downstream system, without anyone touching anything.',
    pillars: ['automation', 'audit-trails', 'anomaly-detection'],
    industry: 'E-commerce, professional services, multi-system operations',
    bestFor:
      'Operators where one business event has to land cleanly in five or six other systems — and the handoffs live in someone\'s head',
    status: 'live',
    problem:
      'A new order should kick invoicing, deduct stock, raise a fulfilment ticket, schedule dispatch, email the customer, and update the CRM — all of which live in different tools. In most businesses, somebody copy-pastes between them the next morning, and the handoff that gets forgotten is the one that costs the most.',
    whatWeBuilt:
      'An orchestrator that listens for business events and fans them out across every downstream system. Each step retries on transient failure, falls back when retries are exhausted, and escalates to a human only when both fail. Every signal — fired, succeeded, failed, retried, fallen-back, escalated — lands in an immutable event log. Workflows reshape from config: add a "notify supplier" step after dispatch and the next run includes it, no engineering work.',
    whatChanged:
      'Order-to-dispatch lag dropped from a day to seconds. Failed steps stopped going unnoticed because the orchestrator surfaced them with their trace. The team stopped doing copy-paste between systems and started looking at the small queue of cases that genuinely needed a human.',
    pillarNotes: {
      'automation':
        'One event fans out across six systems in seconds — invoice raised, stock deducted, ticket opened, dispatch booked, customer emailed, CRM updated. No human keystroke between trigger and outcome.',
      'audit-trails':
        'Every signal carries its event ID, the rule that fired, and the timestamp. Disputes get answered by replaying the chain, not by reconstructing it from email.',
      'anomaly-detection':
        'Retries and fallbacks fire silently. The only thing that reaches a human is the case both attempts failed on — with the reason already attached.',
    },
  },
  {
    slug: 'legal-intake-automation',
    name: 'Legal Intake Automation',
    tagline: 'TODO — one-line tagline (StoryBrand voice, customer-as-hero).',
    pillars: ['automation', 'audit-trails'],
    industry: 'TODO — industry (e.g. "Law firms")',
    bestFor: 'TODO — best-for (e.g. "Mid-sized firms running intake by hand")',
    status: 'concept',
    problem: 'TODO — The problem in the client\'s words.',
    whatWeBuilt: 'TODO — What we built, in one short paragraph.',
    whatChanged: 'TODO — What changed for the business after we shipped.',
    pillarNotes: {
      'automation':   'TODO — how this system delivers on the Automation pillar.',
      'audit-trails': 'TODO — how this system delivers on the Audit Trails pillar.',
    },
  },
  {
    slug: 'hospitality-booking-marketing-dashboard',
    name: 'Hospitality Booking & Marketing Dashboard',
    tagline: 'TODO — one-line tagline.',
    pillars: ['analytics', 'automation'],
    industry: 'TODO — industry (e.g. "Hotels and short-stay")',
    bestFor: 'TODO — best-for.',
    status: 'concept',
    problem: 'TODO — The problem.',
    whatWeBuilt: 'TODO — What we built.',
    whatChanged: 'TODO — What changed.',
    pillarNotes: {
      'analytics':  'TODO — how this system delivers on the Analytics pillar.',
      'automation': 'TODO — how this system delivers on the Automation pillar.',
    },
  },
  {
    slug: 'decision-engine',
    name: 'Decision Engine',
    tagline:
      'The same judgement call, made the same way, every time — instantly, auditable, and tunable without code.',
    pillars: ['automation', 'analytics'],
    industry:
      'Lenders, sales orgs, retailers — any team that makes the same call thousands of times.',
    bestFor:
      'Operations where the same decision is made by different people, at different times, with different conclusions.',
    status: 'live',
    problem:
      'A microfinance lender was approving loans by hand. Three reviewers, three different answers on the same applicant. Volume up, consistency down, and no one could explain why one borrower got 12% and another got 18%.',
    whatWeBuilt:
      'A rule engine that scores every applicant in under a millisecond, returns the decision, the recommended rate, and the downstream action — and shows exactly which rules fired and which were close to firing. Policies (Conservative, Standard, Growth) can be swapped without touching the code. The same engine now also routes their CRM leads and flags inventory write-downs.',
    whatChanged:
      'Decisions are consistent across reviewers. Underwriters spend their time on the genuinely ambiguous cases. Policy tweaks ship in minutes, not sprints, and every decision carries its own audit trail.',
    pillarNotes: {
      'automation':
        'Routine cases route themselves — disbursed, declined, or escalated — without a human in the loop.',
      'analytics':
        'Every decision is scored, logged, and broken down by which rules fired. Policy changes can be A/B-tested against the same applicants.',
    },
  },
  {
    slug: 'document-intelligence',
    name: 'Document Intelligence System',
    tagline:
      'The intake desk reads every contract, invoice, ID and claim — extracts the fields, validates the maths, and routes the work. Humans only see the exceptions.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Law firms, claims handlers, financial services',
    bestFor: 'Operations teams whose mornings start with a backlog of PDFs',
    status: 'live',
    problem:
      'Every morning the intake queue is full again. ID copies, utility bills, supplier invoices, signed contracts, claim forms, bank statements — six different shapes, all needing the same five jobs: read it, classify it, pull the fields, check the maths, send it to the right person. Three people spend their first hour doing it by hand, and the ones that arrive crooked or missing a page sit there waiting.',
    whatWeBuilt:
      'A pipeline that reads every document the moment it arrives. OCR pulls the fields, classification tags the document type, validation rules check the structure — ID checksums, invoice subtotals, signature blocks — and a routing engine sends each one to its correct destination. Matters land in the lawyer\'s folder; invoices go to billing; KYC packets queue for compliance; anything ambiguous lands in a human-review tray with the exact reason it stopped.',
    whatChanged:
      'Intake time dropped from forty minutes per document to under four seconds. The team stopped opening the queue at 8am and started opening it at 11 — to look only at the handful of exceptions the system flagged. Every extraction, validation, and routing decision is timestamped and replayable, so when somebody asks "why did this go there?" the answer is one click away.',
    pillarNotes: {
      'automation':
        'Documents flow from inbox to destination without a human keystroke. The exception queue is the only place a person looks.',
      'audit-trails':
        'Every extraction, validation, and routing decision is logged with the rule that fired and the confidence score behind it — disputes get resolved by reading the trail, not by re-doing the work.',
    },
  },
  {
    slug: 'document-assembly',
    name: 'Document Assembly System',
    tagline:
      'Proposals, contracts, statements, board reports — assembled from CRM, pricing engine, and case-study library in seconds. Every field traceable to the source it came from.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Consulting, professional services, finance, B2B sales',
    bestFor:
      'Teams whose proposals, contracts, and statements get rebuilt from scratch every time, by copy-paste, with no audit trail',
    status: 'live',
    problem:
      'A consulting partner builds a proposal by opening last quarter\'s deck, the CRM tab, the pricing sheet, the case-study folder, and three Slack threads — then copy-pastes for two hours. The contract that follows is rebuilt again. The monthly statement is rebuilt again. Nothing pulls from the same source twice, and when a number is wrong, nobody can say which version of which sheet it came from.',
    whatWeBuilt:
      'A single assembly engine. Pick the deal, pick the template — proposal, contract, statement, board report — and the engine pulls every field from its live source: client details from the CRM, line items from the pricing engine, success stories from the case-study library, boilerplate from the template itself. Every field is colour-tagged by its source. Any override stays tagged so the team can see exactly where a human stepped in.',
    whatChanged:
      'A two-hour proposal became an eight-minute one. The contract behind the proposal stopped contradicting it because both pulled from the same record. Statements went out on time because nobody had to "find" the right numbers anymore. The board report assembled itself on the first of the month from the systems already in place.',
    pillarNotes: {
      'automation':
        'The same engine produces a proposal, a contract, a statement or a board report — only the template and the source mix change. Export to PDF, send to e-sign, attach to the deal in the CRM, all from one click.',
      'audit-trails':
        'Every field carries the source it came from — CRM record, pricing engine line, case-study entry, template constant — and any human override stays tagged. Disputes get resolved by reading the document, not by recreating it.',
      'analytics':
        'Time-to-document, override rate, and source-system usage all roll up — so the team can see which templates are doing the work and which sources are most often wrong.',
    },
  },
  {
    slug: 'bespoke-crm',
    name: 'Bespoke CRM',
    tagline: 'A CRM shaped around how your team actually sells — stages, rituals, channels and dashboards that mirror your business, not someone else’s playbook.',
    pillars: ['automation', 'analytics', 'audit-trails'],
    industry: 'B2B sales teams (equipment, agency, consulting)',
    bestFor: 'Teams that have outgrown off-the-shelf CRMs and are duct-taping the gaps in spreadsheets, WhatsApp threads and shared inboxes.',
    status: 'live',
    problem:
      'Your pipeline lives in three places — the CRM, a shared spreadsheet, and the head of whoever spoke to the customer last. Stages don’t match how you actually sell. Quotes get re-typed. Site visits get forgotten. The contract is sent from a different tab. Nothing talks.',
    whatWeBuilt:
      'A CRM built around the way your team sells. Stages match your real pipeline. Moving a deal into a stage triggers the right ritual automatically — quote drafted, visit booked, contract pushed to e-sign, ops notified. Every interaction across every channel lands on one deal timeline.',
    whatChanged:
      'The team stopped re-typing the same details into four tools. Forecasting tightened because the pipeline reflects what’s really happening. New reps onboard in days because the system encodes the playbook.',
    pillarNotes: {
      'automation':
        'Stage moves trigger rituals: quote drafting, site-visit briefs, e-sign hand-off, accounting projection updates. The CRM does the chore work the team used to do manually.',
      'analytics':
        'Weighted pipeline, conversion by stage, rep load and ritual completion all update live as deals move — calibrated to the way your business measures sales health, not a vendor default.',
      'audit-trails':
        'Every channel touch is captured against the deal: calls, WhatsApps, emails, in-person visits. Nothing lives only in someone’s head or one person’s phone.',
    },
  },
  {
    slug: 'customer-360',
    name: 'Customer 360',
    tagline:
      'One customer record stitched from every system that already holds the data — so everyone who touches the customer sees the same customer.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'B2B SaaS, financial services, multi-team service businesses',
    bestFor:
      'Companies whose sales, support, finance and CSM teams each keep their own version of the customer — and none of them quite agree',
    status: 'live',
    problem:
      'A renewal call goes wrong because Sales doesn\'t know there are three open tickets. Finance chases an invoice the CSM has already negotiated. Support hears "we asked about that two weeks ago" — and they did, but the answer landed in a different inbox. Four teams, four versions of the customer, and the customer is the one who has to keep them aligned.',
    whatWeBuilt:
      'A unified record that stitches together every event the customer touches — sales, support, billing, product use, marketing — from the source systems that already hold the data. Sales, Support, Finance and CSM each get a lens on the same record: the same timeline, with their next-best-actions surfaced and the events they care about emphasised. Every event is one click away from the source system that produced it.',
    whatChanged:
      'Account reviews stopped opening with "wait, what\'s the latest?". Cross-team handoffs stopped needing a 20-minute briefing. Customers stopped repeating themselves. Nobody has to keep two truths in their head anymore.',
    pillarNotes: {
      'automation':
        'Events flow from the source systems on their own schedule. No team has to retype the customer into the next tool — the record updates itself and the right lens lights up.',
      'audit-trails':
        'Every event on the unified record carries the source system that produced it and a link back to the full source record. Disputes get resolved by reading the timeline, not by reconciling four exports.',
      'analytics':
        'Health, ARR, ticket load, payment behaviour and NPS all roll up against the same record — so account decisions get made against the whole customer, not the slice one team can see.',
    },
  },
  {
    slug: 'knowledge-assistant',
    name: 'Internal Knowledge & SOP Assistant',
    tagline:
      'The company playbook stops being a folder no one reads — it becomes the system that answers questions for the whole team.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'High-turnover retail, compliance-heavy finance, complex-product manufacturing',
    bestFor:
      'Teams whose SOPs, contracts, pricing rules and policies live in a SharePoint nobody opens',
    status: 'live',
    problem:
      'The refund clause is in the enterprise contract template. The complaint SOP is on page 14 of the operations manual. The contractor leave rules are buried in an HR PDF. Staff ask the same five questions every week — and every week, three people stop what they\'re doing to answer them again.',
    whatWeBuilt:
      'An assistant that has read every SOP, contract, pricing rule and policy the business runs on. Staff ask plain-English questions and get plain-English answers — every claim cited back to its source, every source one click away. Questions the system can\'t answer get flagged to the ops manager; the gaps it surfaces become the SOPs the business writes next.',
    whatChanged:
      'The "where do I find…?" interrupt disappeared. New hires onboarded against the system itself. The ops manager started each week looking at the questions the team actually asked — and the gaps in the playbook surfaced themselves.',
    pillarNotes: {
      'automation':
        'The assistant answers without a human. Routine policy lookups, refund rules, signoff thresholds — all served instantly, with the source attached.',
      'audit-trails':
        'Every answer carries its citations. Every "I don\'t know" lands as a tracked flag with an owner. The same trail that helps staff helps auditors.',
      'analytics':
        'The admin view shows what the team asked most, where the knowledge base ran dry, and which SOP the business should write next. The playbook gets sharper every week.',
    },
  },
  {
    slug: 'lead-qualifier',
    name: 'Lead Qualification Engine',
    tagline: 'TODO — one-line tagline.',
    pillars: ['automation', 'analytics'],
    industry: 'TODO — industry (e.g. "B2B sales teams")',
    bestFor: 'TODO — best-for.',
    status: 'live',
    problem: 'TODO — The problem.',
    whatWeBuilt: 'TODO — What we built.',
    whatChanged: 'TODO — What changed.',
    pillarNotes: {
      'automation': 'TODO — how this system delivers on the Automation pillar.',
      'analytics':  'TODO — how this system delivers on the Analytics pillar.',
    },
  },
  {
    slug: 'legacy-bridge',
    name: 'Legacy Bridge',
    tagline:
      'Keep the spreadsheet, the green-screen ERP, and the bespoke tool that still does its job — and connect them to a modern AI workflow without rewriting any of them.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Manufacturing, finance, mid-market operators with on-prem stacks',
    bestFor: 'Businesses sitting on systems that still work but no longer talk to anything new',
    status: 'live',
    problem:
      'Half the business runs on a 2008 ERP that nobody dares migrate. The other half lives in an Excel workbook one person owns. The bespoke tool from a decade ago still does its one job better than anything off-the-shelf. Replacing them is a multi-year project nobody can stomach — but leaving them disconnected means every modern AI workflow stops at their walls.',
    whatWeBuilt:
      'A bridge that reads and writes through each legacy system\'s existing surface area — a file watcher on the Excel workbook, an ODBC read against the ERP database, an API wrapper around the bespoke tool. Changes flow into a normalised event stream, an AI agent enriches them, the result lands in a cloud database and the relevant modern SaaS — and the bridge writes the answer back to the legacy system through the same surface it read from.',
    whatChanged:
      'Nobody had to migrate anything. The old systems kept doing their job. The bridge made them participate in modern AI workflows for the first time — new pipeline rows got win-probability and next-best-action in Excel, ERP orders cleared credit before posting, bespoke records got AI follow-up notes — all without touching a line of legacy code.',
    pillarNotes: {
      'automation':
        'The bridge polls or watches each legacy surface, fires the modern workflow, and writes back automatically. People stop being the integration layer between yesterday\'s tools and today\'s.',
      'audit-trails':
        'Every legacy event becomes a recorded message with its origin surface, the rule that handled it, the AI output, and the write-back confirmation — so even un-modernised systems acquire a clean audit trail.',
      'analytics':
        'Operations that lived in incompatible silos now feed a single warehouse. Dashboards reflect the whole business — including the parts running on software older than the people using it.',
    },
  },
  {
    slug: 'inventory-clarity',
    name: 'Inventory Clarity System',
    tagline:
      'Every pallet, every linen, every tool — counted by the building itself. Stock, books, and orders stop disagreeing.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Warehousing, hospitality, plant & equipment hire',
    bestFor: 'Operators whose stock counts, accounts, and order system never quite match',
    status: 'live',
    problem:
      'The warehouse says one thing. The ledger says another. The order system says a third. Somebody has to walk the floor with a clipboard to find out which is true — and by the time they\'ve finished, the count has moved again.',
    whatWeBuilt:
      'RFID readers at every gate, bay and dispatch lane. Each physical motion is a digital event: the floor plan updates, the journal entry posts, and the linked order changes status — all within two seconds, all from the same source of truth.',
    whatChanged:
      'Cycle counts dropped from a full day to ten minutes. Phantom stock disappeared. The finance team stopped reconciling stock against accounts by hand because the two were always already in agreement.',
    pillarNotes: {
      'automation':
        'Physical motion drives the system, not data entry. The reader fires, the ledger posts, the order updates — no human keystroke in between.',
      'audit-trails':
        'Every SKU carries its full history: which gate, which operator, which timestamp. Disputes get resolved by reading the record, not by re-counting the warehouse.',
      'analytics':
        'Live dwell times, throughput per gate, and mismatch causes feed straight into the dashboard — so operations stops being a guessing game.',
    },
  },
  {
    slug: 'client-onboarding',
    name: 'Client Onboarding System',
    tagline:
      'Two checklists, one workflow. The client moves through their part; the firm\'s part runs itself in lockstep — no email chase, no client left in limbo.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Wealth advisory, professional services, regulated onboarding',
    bestFor:
      'Firms onboarding HNW clients across compliance, advisory, and operations roles',
    status: 'live',
    problem:
      'Bringing on a new HNW client should take days. In most firms it takes weeks. An advisor emails for an ID. The client signs the mandate later. Compliance asks for a missing form. Someone forgets to set up payment. The client wonders if anything is happening.',
    whatWeBuilt:
      'A two-sided workflow. The client gets a single checklist; the firm sees the mirror queue, and KYC, contract filing, advisor assignment, welcome packs and kick-off prep all fire from the client\'s actions. If the client stalls, the system nudges by email, then WhatsApp, then escalates to the advisor.',
    whatChanged:
      'Time-to-active dropped from fourteen days to under two. Advisors stopped sending follow-up emails. Compliance stopped chasing the same form across inboxes. Nothing sits in limbo — and when something does, the right person knows before the client notices.',
    pillarNotes: {
      'automation':
        'A completed client step triggers the matching firm step — KYC, file setup, advisor assignment, welcome pack, kick-off prep — without anyone in the loop.',
      'audit-trails':
        'Every nudge, every escalation, every state change is logged against the client record. The firm can show exactly when a step was triggered and by what.',
      'analytics':
        'Time-to-active, stuck-step rates, and nudge-channel effectiveness feed a live pipeline view, so the team can see where any new client is — and where any are at risk.',
    },
  },
  {
    slug: 'case-management',
    name: 'Case Management System',
    tagline:
      'Every matter, every owner, every deadline — tracked end to end with the audit trail written by default.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Law firms, NGOs, insurance, complaint desks, HR & facilities',
    bestFor:
      'Operators running lifecycles that span weeks, hands and inboxes — where a missed deadline or a lost document costs more than the system does.',
    status: 'live',
    problem:
      'A legal matter passes through five hands over three weeks. Documents land in one inbox, deadlines live in another, decisions get made in WhatsApp. Somebody forgets a filing date, the client phones to ask, and nobody can reconstruct who said what to whom or when.',
    whatWeBuilt:
      'One engine that owns the lifecycle. Cases move across a Kanban with SLA timers on every card. Opening a case shows every interaction, every document, every deadline and every decision on a single timeline. Events advance the case automatically — and when an SLA breaches, the escalation fires itself: case bumped, supervisor notified, comment auto-logged. The same engine runs NGO beneficiary files, customer complaints, HR incidents, insurance claims and maintenance tickets — only the fields, workflow and SLAs change.',
    whatChanged:
      'Deadlines stopped being missed because the system knew which were close. Audit became a button, not a fortnight. Onboarding a new role meant pointing at the workflow, not training someone on the lore — the system encodes how this kind of case is supposed to run.',
    pillarNotes: {
      'automation':
        'Events trigger the next step: stage transitions, deadline recomputes, assignee notifications, escalations on breach. The case moves from the event, not from someone remembering.',
      'audit-trails':
        'Every action ever taken on a case — by whom, when, why — written once and never edited. The full record exports as one document, ready for an auditor, a regulator, or the client.',
      'analytics':
        'Live counts per stage, SLA breach rate, mean time to resolution, escalation frequency — rolled up across case types so the team sees where the pipeline strains before it snaps.',
    },
  },
  {
    slug: 'task-management',
    name: 'Task Management System',
    tagline:
      'Every matter, every owner, every dependency — running whether anyone is managing it or not.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Property law firms',
    bestFor: 'Multi-role workflows with weeks of sequential and parallel steps',
    status: 'live',
    problem:
      'A residential transfer touches three roles over three weeks. When one person is on leave or a clearance is late, the matter quietly stalls — usually until the client phones to ask.',
    whatWeBuilt:
      'A hybrid Kanban + timeline that owns the dependency graph for the whole matter. The system tracks who owes what to whom, auto-notifies the next role on completion, and surfaces the prepared brief the next person needs to start.',
    whatChanged:
      'The matter runs on rails. People focus on the work that\'s actually theirs; the system handles handoffs, deadline cascades, and partner briefs.',
    pillarNotes: {
      'automation':
        'Completing one task unblocks the next, notifies the right role, and assembles the brief they need to start without anyone having to chase it.',
      'audit-trails':
        'Every state change, handoff, and due-date shift is captured against the matter — who did what, when, and what cascaded as a result.',
    },
  },
  {
    slug: 'field-ops-app',
    name: 'Field Operations App',
    tagline:
      'The team in the field works in their reality — signal-poor sites, gloves on, vehicles moving. The office still gets clean, real-time data.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'HVAC, inspections, logistics, utilities, community services',
    bestFor:
      'Operators whose value is created in the field but whose records still live on paper, in WhatsApp, or in someone\'s head until the van gets back to the depot',
    status: 'live',
    problem:
      'The job happens at a customer\'s site, in a basement, on a rooftop, in a van — wherever signal drops out. So the data of the day shows up later, on paper, retyped by an admin, in the wrong order, with the photo missing. Bills go out wrong. Disputes can\'t be resolved. Tomorrow gets planned against yesterday\'s guess.',
    whatWeBuilt:
      'A field app shaped around the role. Same shell, role-specific forms — installer, inspector, driver, social worker, field agent. Offline by default: every action queues locally and syncs the moment connectivity returns. The back office sees the work as it happens — or as the van rolls back into range.',
    whatChanged:
      'Field crews stopped doing double-entry at the end of the day. Disputes get resolved from the timeline, not from memory. Tomorrow\'s schedule is planned against what actually happened today, with the photo, the geo-stamp, and the signature already on file.',
    pillarNotes: {
      'automation':
        'Job dispatch, route order, post-visit forms, customer notifications and invoicing are triggered by the field events themselves — no admin retyping the day into a back-office system after the fact.',
      'audit-trails':
        'Every visit lands as a complete record: who, where (geo-stamped), when, what was checked, what was found, photos, signature. Any job is reconstructable from one timeline.',
      'analytics':
        'Live view of crew location, jobs completed, jobs flagged, exception rates and end-of-day rollups — so dispatch and planning stop being a guessing game.',
    },
  },
  {
    slug: 'analytics-suite',
    name: 'Analytics & Decision Support Suite',
    tagline:
      'One platform pulling from every system in the business — shaped four different ways for the four people who run it.',
    pillars: ['analytics', 'anomaly-detection'],
    industry: 'Logistics, hospitality, multi-site retail',
    bestFor:
      'Operators whose execs, directors and floor managers all open the same dashboard and find nothing useful on it',
    status: 'live',
    problem:
      'The fleet manager wants driver hours and route exceptions. The CEO wants runway and gross margin. The board wants quarter-on-quarter trend. They all open the same 47-widget dashboard, hunt for two minutes, and give up. Reports get requested instead — and nobody reads those either.',
    whatWeBuilt:
      'A unified layer that pulls from every operational system in the business, then composes the view by role. Each person sees only the KPIs that feed the decisions they actually make — at the time horizon those decisions live on. Every number is one click away from its calculation, its source systems, the decision it informs, and the action it suggests.',
    whatChanged:
      'Each role opens one screen and sees the three decisions they have to make today. The 06:00 briefing arrives in Slack before the operator does — yesterday\'s anomalies, today\'s risks, this morning\'s calls. The old dashboard got archived. Nobody asked for it back.',
    pillarNotes: {
      'analytics':
        'KPIs are chosen by the decision they support, not by what was easy to chart. Same underlying data, four compositions — fleet manager, operations director, CEO, board.',
      'anomaly-detection':
        'The morning briefing surfaces what broke yesterday, what is at risk today, and what needs a call. Quiet days produce a quiet message. Loud days lead the channel.',
    },
  },
  {
    slug: 'accounting-engine',
    name: 'Accounting Engine',
    tagline:
      'The books move when the business does — invoices, receipts and ledger entries fire from real events, not month-end memory.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Consulting & professional services',
    bestFor: 'Firms whose books lag operations by days or weeks',
    status: 'live',
    problem:
      'Sales signed a project on Monday. Finance heard about it on Thursday. The invoice went out the following Tuesday — and only if someone remembered. Retainers were missed, refunds processed without reversing revenue, and month-end was a fortnight of reconciliations against a reality already three weeks gone.',
    whatWeBuilt:
      'An event-driven accounting layer. Operational systems emit events — projects signed, milestones shipped, refunds processed, deposits received — and the engine writes the correct accounting artefact: an invoice, a recurring charge, a journal entry, a bank match. Rules are config, not code, so the firm can change VAT treatment or cost-centre splits without engineering work.',
    whatChanged:
      'Books reconcile to within a day of operations. Month-end takes hours instead of weeks. Every entry traces back to the originating event, so auditors get answers in seconds — and revenue can no longer slip through a cracked spreadsheet.',
    pillarNotes: {
      'automation':
        'Every recurring accounting motion — invoice, recurring charge, journal entry, bank match — fires from a real operational event, not a calendar reminder.',
      'audit-trails':
        'Every ledger entry carries the event ID and the rule that produced it. Auditors reconstruct the full chain of evidence for any line, any time.',
      'analytics':
        'Because the books reflect operations in near-real-time, revenue, AR ageing and project margin are reportable any day of the month — not just at close.',
    },
  },
  {
    slug: 'compliance-reporting',
    name: 'Compliance & Regulatory Reporting Engine',
    tagline:
      'The submissions regulators, auditors, donors, and boards expect — assembled from the data the business already generates, with no quarter-end scramble.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Banks, NGOs, regulated operators, finance teams',
    bestFor:
      'Teams whose quarter-end is a fortnight of spreadsheets, late nights, and "where did this number come from?"',
    status: 'live',
    problem:
      'Every quarter the same scramble. Numbers pulled by hand from the loan book, the GL, the CRM. A finance lead reconciling six spreadsheets at 11pm. The auditor asks where a figure came from and nobody can answer for ninety minutes.',
    whatWeBuilt:
      'A reporting engine that knows which systems each submission draws from and pulls the data itself. Validations run live against regulator-specific rules; exceptions surface with a one-line cause and a human action. The same engine produces a banking regulatory return, an NGO donor report, a POPIA submission, or a tax filing — every figure traceable back to its source row.',
    whatChanged:
      'Quarter-end stopped being a fortnight of late nights. The same engine, repointed at different sources and rule packs, now produces four kinds of submission. Auditors ask where a figure came from and get an answer in seconds — the system already knew.',
    pillarNotes: {
      'automation':
        'The engine pulls from every source system on a schedule, applies the rule pack for the chosen report, and assembles the final submission — PDF, XBRL, or spreadsheet — without anyone keying a number.',
      'audit-trails':
        'Every figure carries its lineage: which source system, which row, which rule applied. Click any cell of the output and the audit trail unrolls. Submissions are reproducible months after the fact.',
      'analytics':
        'Live completeness, consistency, and regulator-specific checks run as data lands. Variances surface before submission, not after — the finance team sees what the regulator will see.',
    },
  },
  {
    slug: 'continuous-assurance',
    name: 'Continuous Assurance Engine',
    tagline:
      'Background monitoring across a stream of activity no human could realistically watch — only the things that matter surface, with their evidence already attached.',
    pillars: ['anomaly-detection', 'audit-trails', 'analytics'],
    industry: 'Banks, fintech, B2B SaaS, manufacturing & facilities',
    bestFor:
      'Operators sitting on a firehose of events where the costly few are buried among the routine many',
    status: 'live',
    problem:
      'Fraud, drift and equipment failure all share the same shape: the signal is tiny, it arrives inside an ocean of normal activity, and by the time a human notices, the damage is already booked. Most teams cope by sampling — and the things they miss are exactly the things that hurt.',
    whatWeBuilt:
      'A single engine that ingests the live stream — card transactions, CRM events, sensor telemetry — and applies the right detector per source. Every event is scored, every flag carries its rule, its history and its suggested action, and every decision lands in an immutable audit trail keyed by case ID.',
    whatChanged:
      'The risks that hurt most — fraud, drift, equipment failure — started getting caught at volume. Investigators stopped triaging false positives by hand and started receiving cases with their evidence already attached. Mean time to detection dropped from days to seconds.',
    pillarNotes: {
      'anomaly-detection':
        'The same engine runs four detector families in parallel: rules for hard thresholds, statistical models for drift, ML scoring for fraud, and signal-processing on vibration data. Each event picks the right detector for its source.',
      'audit-trails':
        'Every flag opens a case with the rule that fired, the surrounding history, the suggested action and the operator who reviewed it — written once and never edited. Disputes get answered by replay, not by recollection.',
      'analytics':
        'A live sensitivity dial shows the trade-off between coverage and false positives in real time. Weekly replays let the team count what would have been caught, and tune the dial against what the business actually wants to see.',
    },
  },
  {
    slug: 'pricing-engine',
    name: 'Pricing & Quote Engine',
    tagline:
      'The right number, signed by the right person, in seconds. List price, tier discount, volume break and contract override — composed by one engine, not five spreadsheets.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Parts distribution, hospitality, professional services',
    bestFor:
      'Sales teams quoting thousands of SKUs across customer tiers — where every margin point matters and quotes still get typed out by hand.',
    status: 'live',
    problem:
      'Reps quote from a price list, a spreadsheet of tier discounts, a contract folder, and a margin rule they half-remember. Quotes go out slow, inconsistent, and sometimes underwater. The deal that should have made twelve points makes three — and nobody catches it until the month closes.',
    whatWeBuilt:
      'A pricing engine that composes the final number from a transparent rule stack: list price, tier discount, volume break, contract override, manual discount — with a margin floor that blocks anything underwater and routes it to the right approver. The same engine quotes parts, hotel nights, or consulting scopes — only the rule set changes.',
    whatChanged:
      'Quote turnaround dropped from days to minutes. Average margin lifted because the engine catches the breaches reps used to miss. Every quote arrives with the rule stack attached, so finance stops auditing in arrears — the audit trail is the quote.',
    pillarNotes: {
      'automation':
        'List price, tier discount, volume break and contract override compose automatically the moment a line is added. PDF generation, e-sign dispatch, CRM push and opportunity logging fire from one click — no copy-paste between tools.',
      'audit-trails':
        'Every line carries the rule stack that produced it: which discount fired, which override applied, who approved any breach. Finance can replay any quote end to end.',
      'analytics':
        'Live margin %, weighted COGS, breach rate and approval cycle time roll up across reps and customers — so pricing decisions are made against what the engine actually does, not what the price list says.',
    },
  },
  {
    slug: 'reconciliation-engine',
    name: 'Reconciliation Engine',
    tagline:
      'Stop chasing the agreement between systems. The engine matches the ledgers in the background and only surfaces what needs a human.',
    pillars: ['automation', 'audit-trails', 'anomaly-detection'],
    industry: 'Retail, hospitality, fintech, B2B services',
    bestFor:
      'Finance and ops teams reconciling POS against bank, payouts against invoices, or stock against sales — by hand, every week',
    status: 'live',
    problem:
      'Every week somebody exports POS to a spreadsheet, downloads the bank statement, opens accounting, and starts ticking lines off by hand. Ten thousand transactions, three sources of truth, none of them agreeing. By the time the reconciliation is finished, the next week has already started.',
    whatWeBuilt:
      'A reconciliation engine that ingests every ledger as it lands — POS, bank, accounting, processor, inventory. It matches the easy cases in seconds, surfaces only the mismatches that need a human, and learns from every manual resolution so the same pattern auto-clears next time.',
    whatChanged:
      'The reconciliation queue went from ten thousand lines to a handful of real exceptions. Finance stopped doing data-entry and started doing decisions. The same engine handles bank-vs-accounting, POS-vs-inventory, and processor-vs-invoices — same logic, different ledgers.',
    pillarNotes: {
      'automation':
        'The engine ingests every ledger as it posts and matches what it can with no human in the loop. Identical entries match 1:1; combined deposits match by sum-and-window; predictable processor fees match by learned pattern.',
      'audit-trails':
        'Every match — automatic, partial, or manually resolved — is logged with the rule that produced it. A finance lead can replay the decision behind any matched pair, and every manually-taught pattern is versioned.',
      'anomaly-detection':
        'The only items that reach a human are the ones the engine cannot confidently close: timing gaps, missing records on one side, unexplained deltas. The mismatches that matter rise to the top instead of being hidden in the noise.',
    },
  },
  {
    slug: 'data-routing',
    name: 'Data Routing Pipeline',
    tagline:
      'The systems you already own, piped into one clean output — board pack, donor report, regulatory submission. The pipeline does the assembly that four people used to do over three days of email.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Finance teams, NGOs, regulated operators',
    bestFor:
      'Operators whose monthly pack lives in twelve spreadsheets and three inboxes — and whose donor report and regulatory submission get built from the same numbers, by the same people, all over again.',
    status: 'live',
    problem:
      'The accounting tool, the payroll system, the sales database and the CRM each hold a slice of the truth. Four people spend three days emailing back and forth to assemble the board pack. The donor report gets built the same way next week, from the same numbers, by the same people. The regulatory submission is a third pass. Same data, three angles, three weeks gone.',
    whatWeBuilt:
      'A routing pipeline that connects to each source system, applies the transforms a given output needs — classify, join, validate, aggregate — and renders the finished document. One engine, different rule packs: board pack on Monday, donor report on Tuesday, regulatory submission on Thursday. Click any figure in the output and the lineage unrolls all the way back to the source row.',
    whatChanged:
      'The pack stopped being assembled and started being generated. When a source drops offline the pipeline degrades to a known fallback rather than producing a wrong number quietly. Disputes get answered by clicking the number — the audit trail is the document.',
    pillarNotes: {
      'automation':
        'Source pulls, schema joins, validation rules and template rendering all fire from one button. The same engine, repointed at different sources and templates, produces every recurring submission the business owes.',
      'audit-trails':
        'Every figure in the output carries the source rows, the transforms and the rule pack that produced it. Click the number, watch the lineage unroll. Disputes get answered by replay, not by re-doing the work.',
      'analytics':
        'Because the pipeline assembles the same numbers four different ways, the operating view, the donor view, the regulator view and the board view all reconcile to the same source of truth — not to four spreadsheets that almost agree.',
    },
  },
  {
    slug: 'integration-hub',
    name: 'Integration Hub',
    tagline:
      'The connective tissue between the tools you already run. New booking, new order, new lead — every system that should know, knows, the moment it happens.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Multi-tool service businesses, e-commerce, hospitality, clinics',
    bestFor:
      'Operators whose CRM, accounting, calendar and inventory only ever agree because someone is copying between them by hand',
    status: 'live',
    problem:
      'You bought eight tools and they pretend not to know each other. The booking platform talks to nobody. Accounting hears about new revenue when the bookkeeper opens the invoices folder. The CRM has yesterday\'s contacts and marketing is emailing customers who churned a month ago. The business runs as eight islands with a person paddling between them.',
    whatWeBuilt:
      'An integration hub that sits between every system the business already uses. Each tool emits the events it already knows about; the hub fans them out, transforms them, and writes them into every other tool that should know. New bridges are point-and-click — no glue scripts, no agency invoices, no fragile zaps — and every event carries its trail.',
    whatChanged:
      'The team stopped copying. A booking in the booking tool is a contact in the CRM, an invoice in accounting, a slot held in the calendar, and a campaign target in marketing — within seconds. New tools slot into the hub the day they arrive instead of becoming the next island.',
    pillarNotes: {
      'automation':
        'Every cross-tool motion the team used to do by hand — copy-paste, re-keying, email-and-wait — fires from one source event. The hub is the only thing that ever needs to know the other tool\'s shape.',
      'audit-trails':
        'Every event is logged with its origin, its bridges, its targets and the outcome at each hop. If a CRM contact looks wrong, the trail shows which booking it came from and which transformation applied.',
    },
  },
  {
    slug: 'cross-system-sync',
    name: 'Cross-System Sync Engine',
    tagline:
      'Two systems, one truth. The engine keeps every shared record in lockstep — both directions, in seconds, with the conflict rules already settled.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Retail, hospitality, professional services, multi-tool operators',
    bestFor:
      'Teams whose inventory disagrees with their store, whose HR disagrees with payroll, whose calendar disagrees with bookings — and someone reconciles by eyeballing two screens',
    status: 'live',
    problem:
      'Stock changes in the warehouse system. Nobody updates the storefront. A customer orders something that left the shelf two days ago. Same shape everywhere: HR raises someone, payroll keeps paying the old number. The booking lands in the calendar but not in the booking platform. Two systems hold the same record, drift apart, and a person spends their day eyeballing both screens to keep them in line.',
    whatWeBuilt:
      'A sync engine that sits between two systems and keeps every shared record identical. Edits in either side propagate to the other in under two seconds, with a visible trail. Direction is configurable — one-way for upstream-of-truth setups, bi-directional for true peers. When both sides edit the same field at once, the configured conflict rule fires automatically — last-write-wins, source-of-truth wins, or human review — and the rule that fired is cited in the audit trail.',
    whatChanged:
      'The reconciliation that staff used to do by hand stopped happening. Inventory and storefront agreed. HR and payroll agreed. The calendar and the booking system agreed. When the rare conflict did surface, it landed in one human-review queue with both sides shown and the rule already chosen — not in a Friday-afternoon spreadsheet.',
    pillarNotes: {
      'automation':
        'Every shared field stays identical across both systems without a human in the loop. The engine pushes the change, applies the conflict rule, and writes the audit entry — all within seconds of the edit.',
      'audit-trails':
        'Every sync event lands in the reconciliation log with timestamp, originator, fields touched, and — if a conflict fired — the rule that decided it. Disputes get answered by replaying the log, not by re-reconciling the two systems.',
    },
  },
  {
    slug: 'forecasting',
    name: 'Forecasting & Demand Planning',
    tagline:
      'Eighteen months of your numbers, projected eight weeks forward — with the orders, shifts and cash buffers it implies, dropped where the team already works.',
    pillars: ['analytics', 'automation', 'anomaly-detection'],
    industry: 'Restaurants, distributors, SaaS, multi-site retail',
    bestFor:
      'Operators whose forecasts live in a spreadsheet and never quite arrive at the people who need them',
    status: 'live',
    problem:
      'Somebody pulls eighteen months of history into a spreadsheet on Friday afternoon. They draw a line forward, eyeball Saturday\'s staffing, and email the supplier a flour order they\'re half-sure about. By Tuesday the numbers are stale, the rota is wrong, and the kitchen is over-prepping desserts nobody is ordering.',
    whatWeBuilt:
      'A forecasting engine trained on the operator\'s own history — weather, local events, promo cadence, and underlying trend are first-class inputs the team can move. Forecasts redraw live with a confidence band you can watch widen, and the recommendations it produces (order this much flour, schedule that many staff, defer this hire) push straight into the supplier portal, the rota tool and the FP&A model. Same engine, repointed: restaurant covers today, parts reorder points tomorrow, SaaS cash projections the day after.',
    whatChanged:
      'Friday afternoon went away. The forecast was already on the screens that mattered. MAPE dropped from a naive 20%+ trailing average to a single-digit number the team could plan against — and the operator stopped finding out about Wednesday\'s over-prep on Thursday.',
    pillarNotes: {
      'analytics':
        'Forecasts compose from the operator\'s real history plus the drivers they actually know about — weather, events, promos, trend. Every number is sized by the model, not by gut feel, and the holdout MAPE sits next to the chart so the operator can see what the model is worth.',
      'automation':
        'Recommendations are pushed to the systems the team already opens — the supplier portal, the rota tool, the PO drafts, the FP&A model. The forecast doesn\'t live in a tab; it lands in the inboxes that drive the work.',
      'anomaly-detection':
        'A widening confidence band flags weeks the model is least sure about — usually around events, promo launches, or unfamiliar weather. The operator sees the uncertainty before it costs them.',
    },
  },
  {
    slug: 'predictive-maintenance',
    name: 'Predictive Maintenance System',
    tagline:
      'Every bearing, motor and compressor has a voice. The system listens, learns the shape of failure, and books the repair before the breakdown.',
    pillars: ['anomaly-detection', 'analytics', 'automation'],
    industry: 'Mining, cold-chain, facilities, fleet operators',
    bestFor:
      'Operators whose unplanned breakdowns cost more in a single day than the system costs in a year',
    status: 'live',
    problem:
      'A gearbox fails at 03:14 on a Tuesday. Production stops for nine hours. The signals were in the vibration trace for three weeks, in the oil sample for two, in the casing temperature for nine days — but nobody was reading them together.',
    whatWeBuilt:
      'A fleet-wide monitor that pulls vibration, temperature, oil analysis and run-hour data into one model per asset class. The model predicts days-to-failure with a confidence band, auto-schedules the intervention, reserves the part, notifies the technician, and proposes a downtime window that costs the least to take.',
    whatChanged:
      'Unplanned breakdowns dropped because the system saw them coming. Maintenance shifted from calendar-driven to condition-driven — fewer scheduled changeouts on healthy assets, far fewer 3am callouts on sick ones. One prevented breakdown usually pays for the system.',
    pillarNotes: {
      'anomaly-detection':
        'Per-asset signatures replace generic thresholds. The model knows what THIS gearbox looks like healthy, and flags drift weeks before a hard alarm would trip.',
      'analytics':
        'Days-to-failure, confidence, downtime cost and lost-production cost all rendered against the same fleet — so the operator can sequence interventions by impact, not by who shouted loudest.',
      'automation':
        'A flagged asset auto-reserves parts, opens a work order, notifies the right technician, and books a downtime window against the production calendar — no human keystroke between the signal and the schedule.',
    },
  },
  {
    slug: 'master-data-hub',
    name: 'Master Data Hub',
    tagline:
      'One canonical record per customer, supplier, product. Edit it once; every system downstream agrees within two seconds.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Multi-system operators, mid-market and up',
    bestFor:
      'Businesses where the CRM, the billing system and the shipping system each hold a slightly different version of the same customer',
    status: 'live',
    problem:
      'Sales has one address for the customer. Finance has a second. Support has a third. Shipping has a fourth — and the courier keeps returning the order. Every team is sure their record is the right one. The single source of truth the business has been faking with spreadsheets is, in fact, four sources of slight untruth.',
    whatWeBuilt:
      'A hub that holds the canonical record for every entity the business cares about — customer, supplier, product, employee, asset. Edits happen once on the golden record and propagate to every downstream system in under two seconds. Direct edits in a downstream system race the hub and lose: the rules around conflict resolution are explicit, configurable, and audited.',
    whatChanged:
      'Returned shipments dropped to near zero. The finance team stopped re-keying addresses. Support stopped asking the customer to confirm what should already be known. The four spreadsheets where the truth used to live got archived — nobody asked for them back.',
    pillarNotes: {
      'automation':
        'A field changes once on the golden record. The hub fans the update out to every downstream system that consumes it — CRM, accounting, support, marketing, billing, shipping — in under two seconds, with no human keystroke.',
      'audit-trails':
        'Every propagation, every conflict, every override is logged with the rule that resolved it. Disputes get answered by reading the lineage, not by phoning round.',
      'analytics':
        'Drift between the hub and downstream systems is measured continuously. The cost of disagreement — returned shipments, duplicate sends, refund delays — is quantified so the business can see what consistency is worth.',
    },
  },
  {
    slug: 'notification-orchestration',
    name: 'Notification & Alert Orchestration',
    tagline:
      'One rule engine deciding who hears about what, on which channel, at what hour. The noise stops; the signal lands on the right person\'s phone.',
    pillars: ['automation', 'anomaly-detection', 'audit-trails'],
    industry: 'Operations-heavy teams: e-commerce, fintech, SaaS, field services',
    bestFor:
      'Teams whose Slack, SMS and email blast every alert to everyone — so the alerts that matter stop being noticed',
    status: 'live',
    problem:
      'Every system shouts. Stock is low — everyone gets an email. A card decline trips a fraud signal — Slack pings twenty people. An on-call engineer\'s laptop pulses at 2am for a non-critical disk warning. After a week the team mutes the channel, archives the inbox folder, and the one alert that was actually a fire goes unread next to nine hundred that weren\'t.',
    whatWeBuilt:
      'A central rule engine sitting between every source system and every channel. Conditions and severity decide who hears about it. Channel preferences decide where. Quiet hours decide whether it can wait until 7am. Critical events override every rule and reach a human within seconds; everything else routes by role, by shift, by on-call rota — Slack to the right channel, SMS only when needed, email for the audit copy, WhatsApp for the field team, push for the on-call phone.',
    whatChanged:
      'The team started noticing alerts again because there were fewer of them. The on-call engineer\'s phone stopped buzzing at 2am for things that could wait until coffee. Stock alerts reached the buyer, not the entire company. Every routing decision is logged with the rule that fired, the condition that matched, and the channel chosen — so when something is missed, the answer is one query away.',
    pillarNotes: {
      'automation':
        'Rules fire automatically as source events land. Severity, persona, quiet-hours and channel preferences compose into a single routing decision — no human deciding who to copy, no group chat to ignore.',
      'anomaly-detection':
        'The engine treats noise as a first-class problem. Repeating alerts, duplicate signals, and low-signal "FYI" pings are de-duplicated, batched or suppressed so the actual outliers reach a human within seconds.',
      'audit-trails':
        'Every alert carries its rule, the matched condition, the chosen channel, and the recipient set. Missed-alert post-mortems read the trail instead of guessing where the message went.',
    },
  },
]

export function systemBySlug(slug: string): System | undefined {
  return SYSTEMS.find((s) => s.slug === slug)
}

export function filterSystemsByPillars(
  systems: System[],
  active: PillarSlug[],
): System[] {
  if (active.length === 0) return systems
  // Union semantics: a system is included if it claims ANY of the active pillars.
  // This matches the "show me anything tagged Automation OR Audit Trails" mental model.
  return systems.filter((s) => s.pillars.some((p) => active.includes(p)))
}

// Per-system pillar metadata, precomputed once at module load so SystemCard
// doesn't re-filter PILLARS per render across the ~30-card gallery.
const PILLAR_METAS_BY_SYSTEM = new Map<string, PillarMeta[]>(
  SYSTEMS.map((s) => [s.slug, PILLARS.filter((p) => s.pillars.includes(p.slug))]),
)

export function pillarMetasForSystem(system: System): PillarMeta[] {
  return PILLAR_METAS_BY_SYSTEM.get(system.slug) ?? []
}
