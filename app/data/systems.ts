// Systems showcase — single source of truth.
//
// Scaffolding only: all six entries are status "concept" with TODO copy.
// Replace the TODO strings with real content as systems are documented.
// Wire interactive demos via DemoSlot (see app/components/DemoSlot.vue).

import { Workflow, ShieldCheck, Radar, BarChart3 } from '@lucide/vue'
import type { Component } from 'vue'
import { AEO_CONTENT, type AnswerBlock, type Faq } from './aeo-content'

// Re-export the AEO types so existing `~/data/systems` consumers (site-faqs.ts,
// components, tests) keep importing them from here. Content itself lives in
// ./aeo-content.ts (one editable source for all per-system answer blocks + FAQs).
export type { AnswerBlock, Faq } from './aeo-content'

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

// Pillar-hub SEO (S02, from targets/keyword-map.md + intent-clusters.md, S03).
// Each pillar gets a `/pillars/<slug>` hub that gathers its member modules and
// owns a distinct commercial head term + the pillar's "what is" answer.
export interface PillarSeo {
  /** Page H1 (the pillar framed as a category). */
  h1: string
  /** Intro/blurb under the H1 (answer-first context, Zabble voice). */
  blurb: string
  /** Bare title (titleTemplate appends " · Zabble"). */
  seoTitle: string
  /** Meta description, ~150–160 chars. */
  seoDescription: string
  /** Primary intent first (cannibalisation guard), then supporting heads. */
  keywords: string[]
  /** Answer-first, liftable definition of the pillar (AEO/GEO + schema). */
  definition: string
}

export const PILLAR_SEO: Record<PillarSlug, PillarSeo> = {
  'automation': {
    h1: 'Business Process Automation',
    blurb:
      'Every business runs on workflows — the spreadsheet filled in by hand every week, the data copied between tools that don’t talk. Zabble automates the parts that shouldn’t need a person anymore, so your team does the work only people can do. These are the systems that deliver it.',
    seoTitle: 'Business Process Automation',
    seoDescription:
      'Automate the manual workflows running your South African business — the spreadsheets, the re-keying, the copy-paste. Built around how you actually work.',
    keywords: ['business process automation', 'robotic process automation', 'intelligent automation', 'how to automate business processes'],
    definition:
      'Business process automation is replacing the manual steps in a workflow — data entry, approvals, hand-offs between tools — with software that runs them automatically and on time. Zabble builds bespoke automation around one business’s real processes, so the work that shouldn’t need a person no longer does.',
  },
  'audit-trails': {
    h1: 'Audit Trails & Governance',
    blurb:
      'You can’t manage what you can’t see. Zabble builds visibility and governance into operations, so you know who did what, when, and why — and audit season stops being a fire drill. These are the systems that write the record by default.',
    seoTitle: 'Audit Trail Software',
    seoDescription:
      'Know who did what, when and why. Zabble builds tamper-evident audit trails into your operations: faster reviews, cleaner audits, a record ready on demand.',
    keywords: ['audit trail software', 'audit management software', 'compliance audit software', 'what is an audit trail'],
    definition:
      'An audit trail is a tamper-evident record of who did what, when and why across a system. Audit-trail software captures every action, decision and change as it happens, so reviews, disputes and regulator requests get answered by reading the record instead of reconstructing it from email weeks later.',
  },
  'anomaly-detection': {
    h1: 'Anomaly & Fraud Detection',
    blurb:
      'The risks that hurt most are the ones you don’t see coming. Zabble builds systems that watch operations in the background and flag what’s unusual — the fraud, the error, the drift — before it becomes a problem you can’t ignore. These are the systems that catch it early.',
    seoTitle: 'Anomaly & Fraud Detection Software',
    seoDescription:
      'Catch fraud, error and drift before they cost you. Zabble builds anomaly detection that watches a stream no human could and surfaces only the cases that matter.',
    keywords: ['fraud detection software', 'anomaly detection software', 'anomaly detection', 'what is anomaly detection'],
    definition:
      'Anomaly detection is software that watches a stream of activity and flags the unusual — the fraud, the error, the drift, the outlier — before it becomes a problem. Zabble builds detectors tuned to what counts as abnormal for one business, surfacing only the cases that matter, with their evidence already attached.',
  },
  'analytics': {
    h1: 'Operational Analytics & Decision Support',
    blurb:
      'Every business has more data than it uses. Zabble turns yours into a clear picture of what’s happening and what matters — composed for the people who actually make the decisions, not a 47-widget dashboard nobody opens. These are the systems that make decisions easier.',
    seoTitle: 'Operational Analytics & Decision Support',
    seoDescription:
      'Stop deciding on gut feel. Zabble builds analytics composed by role and decision — each number opens its calculation, its source and the next action.',
    keywords: ['decision support system', 'business intelligence software', 'data analytics software', 'operational analytics'],
    definition:
      'A decision support system turns a business’s operational data into the specific view each role needs to make a decision. Zabble composes analytics by role and by decision — not a 47-widget dashboard nobody reads — so every number opens its calculation, its source systems and the next action.',
  },
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
  /**
   * Short italic line rendered directly above the DemoSlot on the
   * detail page. Reminds visitors that the demo is one example of a
   * capability, not a fixed product.
   */
  demoFraming?: string
  /**
   * Override for the "How it fits the four pillars" section heading.
   * Defaults to "One system, <n> jobs." computed from `pillars.length`.
   */
  pillarHeading?: string

  // ── SEO / AEO slots (S02 on-page interface; populated by S05/S06/S07) ──
  // All optional and additive: when absent the page falls back to existing copy,
  // so existing entries keep working unchanged. See docs/seo/audits/05-onpage.md.

  /**
   * SEO: distinct `<title>` + OG-title fragment for this module page. The global
   * titleTemplate appends " · Zabble". Falls back to `name`. Keep ≤ ~45 chars so
   * the full tag stays under ~60. Intent-bearing where it helps (e.g.
   * "Bespoke CRM, built to your pipeline"). Owned by content (S06), targets from S05.
   */
  seoTitle?: string
  /**
   * SEO: meta description, 150–160 chars, answer-first, one concrete benefit, ZA
   * voice. Falls back to `tagline`. Distinct per module (duplicate descriptions
   * across 30 pages are the #1 on-page risk). Owned by content (S06).
   */
  seoDescription?: string
  /**
   * SEO: primary + secondary keyword targets for this page, from
   * targets/keyword-map.md (S05). Reference/QA only — not rendered. First entry
   * is the canonical primary intent for the cannibalisation guard.
   */
  keywords?: string[]
  /**
   * SEO/legacy: short answer-first definition string. Superseded on the detail
   * page by the richer AEO `answer` block below; retained for any consumer that
   * reads a plain definition string (kept additive — see audits/05-onpage.md).
   */
  definition?: string
  /**
   * AEO answer-first block (S07, owner of AEO answers) — a "What is …?" question
   * answered in 40–60 words, rendered high on the detail page. Populated from
   * `AEO_CONTENT` below. Mirrored 1:1 into JSON-LD by S08.
   */
  answer?: AnswerBlock
  /**
   * AEO FAQ set (S07) — question-shaped Q&A ({ question, answer }) targeting
   * People Also Ask. Rendered server-side near the foot of the detail page and
   * exposed for S08 to attach byte-identical FAQPage JSON-LD. Populated from
   * `AEO_CONTENT` below (single source of truth for FAQ copy).
   */
  faqs?: Faq[]
}

// All six entries are scaffolding. Replace TODO copy as content is finalised.
// Order chosen so the gallery opens with the broadest pillar mix.
export const SYSTEMS: System[] = [
  {
    slug: 'kairos',
    name: 'Kairos',
    tagline:
      'Your team stops being a switchboard. Outreach, day-of orchestration and follow-up run themselves — so they can do the work humans should.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Events, conferences, service businesses, clinics',
    bestFor:
      'Operators whose calendars, inboxes, and phone lines outpace a single coordinator',
    status: 'live',
    problem:
      'A conference with hundreds of registrants needs a coordinator chasing confirmations, fielding calls, calming no-shows, and running follow-up — for weeks. By Thursday you\'re the bottleneck — answering inbound while the next sponsor email sits unread, watching the no-show risk grow and not knowing who to call first. The work that gets dropped is the work that costs you the next event.',
    whatWeBuilt:
      'Kairos runs the full 21-day arc: pre-event outreach, day-of orchestration, post-event re-engagement. The same engine answers the phone as an AI receptionist. Every message, call and CRM update is logged with the reasoning that fired it. Built with KnvilLabs.',
    whatChanged:
      'Coordinators stopped being switchboards. No-show rates dropped because the system called every at-risk attendee on the morning of the event. Inbound calls to the business stopped going to voicemail. The administrative work that normally consumes a person now runs itself.',
    pillarNotes: {
      'automation':
        'Touchpoints fire on time, in order, without a human in the loop. Confirmations, reminders, last-mile directions, recovery calls, follow-up sequences — all on rails. The same engine handles inbound calls, books appointments and updates the CRM.',
      'audit-trails':
        'The system logs every outbound message, every inbound call and every CRM mutation with the reasoning that fired it. A coordinator can replay the system\'s decisions end to end.',
      'analytics':
        'Live attendance, RSVP conversion, call outcomes and recovery rates feed one dashboard. The next event is planned against what actually happened, not what was hoped for.',
    },
    demoFraming:
      'One example deployment — a UK financial-adviser forum running on Kairos. Yours would be shaped to the work your business actually does.',
  },
  {
    slug: 'approval-workflow',
    name: 'Approval & Sign-Off Workflow',
    tagline:
      'Stop chasing signatures. Your chain reshapes itself, every decision is captured, and work moves the moment the last signature lands.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Banking, NGOs, procurement-heavy operations, regulated industries',
    bestFor:
      'Operators where approvals stall in inboxes and audit reconstruction takes weeks',
    status: 'live',
    problem:
      'Your approvals live in inboxes. A loan, a grant, a PO sits with the wrong manager for a week. You stop opening the audit folder on Friday because you know what\'s coming. When the regulator asks for the trail, three people drop their week digging through email. What you hand them is a story, not a record.',
    whatWeBuilt:
      'A signature engine that routes work by rule — thresholds, roles, conditions. The next approver sees it the instant the previous one signs off. Every decision, every comment, every condition lands in an evidence pack a regulator can read as-is.',
    whatChanged:
      'Approval cycles dropped from days to hours. The audit response time for a regulator request went from a week of digging to a one-click export. Conditional approvals — "yes, but only if covenant X holds" — stopped getting lost in conversation. They bind the disbursement instead.',
    pillarNotes: {
      'automation':
        'The chain reshapes itself when the inputs change. Cross the threshold, the credit committee joins. Drop below it, they don\'t. Nobody phones the next approver — the system does.',
      'audit-trails':
        'Every approver, every comment, every timestamp is stitched into one immutable record. Reconstructing any decision now takes one click — not three people and a week.',
    },
  },
  {
    slug: 'multi-channel-inbox',
    name: 'Multi-Channel Inbox',
    tagline:
      'Six channels into one inbox. The right person reads the right thing without checking six tools.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Sales-heavy SMBs, service businesses, agencies, professional services',
    bestFor:
      'Operators whose team is watching five inboxes — and missing leads in the sixth they forgot existed',
    status: 'live',
    problem:
      'Customers and prospects pick the channel they like. Your team watches the channel they own. The high-value lead on the support contact form. The warm intro in a LinkedIn DM. The irate voicemail at 5:47pm. They don\'t get answered. You only find out when the customer leaves or the deal stalls. The worst part isn\'t the missed lead. It\'s not knowing what else you missed.',
    whatWeBuilt:
      'One inbox, every channel. Email, WhatsApp, SMS, web forms, social DMs, voicemail transcripts — all pulled into one stream. Each message is classified, routed, and on the right person\'s screen in seconds. Replies go back out on the same channel the message arrived on, so the customer never feels handed off.',
    whatChanged:
      'Sales response time dropped to minutes. Complaints stopped slipping through because nobody was watching the voicemail. The team stopped checking six tools and started reading one queue — theirs.',
    pillarNotes: {
      'automation':
        'Every inbound message lands, classifies and routes to the right person without a human reading it first. Replies fire from the same inbox, on the same channel — no copy-paste between tools.',
      'audit-trails':
        'Every message and reply carries its channel, classification, rule and timestamp. The conversation across channels reads as one thread, not six.',
      'analytics':
        'Channel mix, missed-message counter, and queue volumes update on every inbound. The team sees in ten seconds where the leaks are — and which channel is feeding them.',
    },
  },
  {
    slug: 'workflow-orchestrator',
    name: 'Event-Driven Workflow Orchestrator',
    tagline:
      'When one event happens, the right thing happens in every other system — without your team touching anything.',
    pillars: ['automation', 'audit-trails'],
    industry: 'E-commerce, professional services, multi-system operations',
    bestFor:
      'Operators where one business event has to land cleanly in five or six other systems — and the handoffs live in someone\'s head',
    status: 'live',
    problem:
      'A new order should fan out across six systems — invoice, stock, ticket, dispatch, email, CRM. In most businesses, someone copy-pastes between them the next morning. The ops manager refreshes the dashboard at 9pm, wondering if Tuesday\'s order went out. The founder finds out at month-end about an invoice no one sent. The handoff that gets forgotten is the one that costs the most.',
    whatWeBuilt:
      'An orchestrator that listens for business events and fans them out across every downstream system. Each step retries on transient failure. Failed retries fall back. If both fail, a human gets paged — with the reason already attached. Every signal — fired, succeeded, failed, retried, fallen-back, escalated — lands in an immutable event log. Workflows reshape from config. Add a "notify supplier" step after dispatch; the next run includes it. No engineering work.',
    whatChanged:
      'Order-to-dispatch lag dropped from a day to seconds. Failed steps stopped going unnoticed because the orchestrator surfaced them with their trace. Copy-paste between systems stopped. The team started looking at the small queue of cases that genuinely needed a human.',
    pillarNotes: {
      'automation':
        'One event fans out across six systems in seconds — invoice raised, stock deducted, ticket opened, dispatch booked, customer emailed, CRM updated. No human keystroke between trigger and outcome.',
      'audit-trails':
        'Every signal carries its event ID, the rule that fired, and the timestamp. Disputes get answered by replaying the chain, not by reconstructing it from email.',
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
      'Three reviewers, three different answers on the same case. Make the call once — then have every reviewer reach it the same way, every time.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry:
      'Lenders, sales orgs, retailers — any team that makes the same call thousands of times.',
    bestFor:
      'Operations where the same decision is made by different people, at different times, with different conclusions.',
    status: 'live',
    problem:
      'A consumer lender was approving loans by hand. Three reviewers, three different answers on the same applicant. Volume up, consistency down, and no one could explain why one borrower got 12% and another got 18%. The credit lead stopped opening the disputes folder on Mondays. She already knew what was in it.',
    whatWeBuilt:
      'We sat with the credit team for two weeks before writing a line of code. The fix was a rule engine that scores every applicant in real time. It returns the decision, the rate, and what to do next — and the "why" is right there, which rules fired and which were close. Policies (Conservative, Standard, Growth) swap without touching the code. The same engine now also routes their CRM leads and flags inventory write-downs.',
    whatChanged:
      'Every reviewer reaches the same call on the same applicant. Underwriters spend their time on the genuinely ambiguous cases. Policy tweaks ship in minutes, not sprints, and every decision carries its own audit trail.',
    pillarNotes: {
      'automation':
        'Routine cases route themselves — disbursed, declined, or escalated — without a human in the loop.',
      'audit-trails':
        'Every decision logs the rules that fired, the policy in force, and the score. Disputes get answered by replaying the call, not reconstructing it from email.',
      'analytics':
        'Every decision is scored, logged, and broken down by which rules fired. Switch policies and compare outcomes on the same book before you ship the change.',
    },
  },
  {
    slug: 'document-intelligence',
    name: 'Document Intelligence System',
    tagline:
      'The intake desk reads every document. It pulls the fields, checks the maths, routes the work. Humans only see the exceptions.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Law firms, claims handlers, financial services',
    bestFor: 'Operations teams whose mornings start with a backlog of PDFs',
    status: 'live',
    demoFraming:
      'One example — built for a South African law firm. Every Zabble system is shaped to its business.',
    problem:
      'Every morning the intake queue is full again. Four shapes of paper, the same five jobs each. Three people spend their first hour keying fields by hand. By 10am they\'re behind on the work that actually needs them. The ones that arrive crooked or missing a page sit there waiting.',
    whatWeBuilt:
      'We sat with three intake teams before writing a line of code. The job is always the same. A pipeline reads every document the moment it lands. Classification tags it. OCR pulls the fields. Validation rules check the structure — ID checksums, statement totals, signature blocks. A routing engine sends it on. Matters land in the lawyer\'s folder. KYC packets queue for compliance. Anything ambiguous lands in a human-review tray with the exact reason it stopped.',
    whatChanged:
      'Intake time dropped from forty minutes per document to under four seconds. The team stopped opening the queue at 8am. They open it at 11 now — only to look at the exceptions the system flagged. Every extraction, validation, and routing decision is timestamped and replayable. When someone asks "why did this go there?", the answer is one click away.',
    pillarNotes: {
      'automation':
        'Documents flow from inbox to destination without a human keystroke. The exception queue is the only place a person looks.',
      'audit-trails':
        'Every extraction, validation, and routing decision is logged with its rule and confidence score. Disputes get answered by reading the trail, not by re-doing the work.',
    },
  },
  {
    slug: 'document-assembly',
    name: 'Document Assembly System',
    tagline:
      'Proposals, contracts, statements, board reports — assembled from the CRM, pricing engine, and case-study library in seconds. Every field traceable to the source it came from.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Consulting, professional services, finance, B2B sales',
    bestFor:
      'Teams whose proposals, contracts, and statements get rebuilt from scratch every time, by copy-paste, with no audit trail',
    status: 'live',
    problem:
      'A consulting partner copy-pastes a proposal for two hours. The CRM, the pricing sheet, the case-study folder, three Slack threads — all open at once. The contract gets rebuilt from scratch. So does the monthly statement. By the third document, the partner has stopped trusting their own numbers. When a client queries the fee, nobody can say which version of which sheet it came from. Each rebuild costs an hour. And the next time the contract and the proposal disagree, the client is the first to notice.',
    whatWeBuilt:
      'A single assembly engine. Pick the deal. Pick the template — proposal, contract, statement, board report. The engine pulls every field from its live source. Client details from the CRM. Line items from the pricing engine. Success stories from the case-study library. Boilerplate from the template itself. Every field is colour-tagged by its source. Any override stays tagged so the team can see where a human stepped in.',
    whatChanged:
      'A two-hour proposal became an eight-minute one. The contract stopped contradicting the proposal because both pulled from the same record. Statements went out on time because nobody had to "find" the right numbers. The board report assembled itself on the first of the month. And the partner stopped second-guessing the numbers.',
    pillarNotes: {
      'automation':
        'The same engine produces a proposal, a contract, a statement, or a board report. Only the template and the source mix change. Export to PDF, send to e-sign, or attach to the deal in the CRM — all from one click.',
      'audit-trails':
        'Every field carries the source it came from. CRM record, pricing engine line, case-study entry, template constant. Human overrides stay tagged. Disputes get resolved by reading the document, not by recreating it.',
    },
  },
  {
    slug: 'bespoke-crm',
    name: 'Bespoke CRM',
    tagline: 'A CRM shaped around how your team actually sells — stages, automations, channels and dashboards that mirror your business, not someone else’s playbook.',
    pillars: ['automation', 'analytics', 'audit-trails'],
    industry: 'B2B sales teams (equipment, agency, consulting)',
    bestFor: 'Teams that have outgrown off-the-shelf CRMs and are duct-taping the gaps in spreadsheets, WhatsApp threads and shared inboxes',
    status: 'live',
    demoFraming:
      'One example. Switch the business type to see the same engine reshaped for a different sales motion.',
    problem:
      'Your pipeline lives in three places — the CRM, a shared spreadsheet, and the head of whoever spoke to the customer last. Stages don’t match how you actually sell. Quotes get re-typed. Site visits get forgotten. The contract is sent from a different tab. Nothing talks. Reps stop trusting the pipeline. Friday afternoon is spent guessing what’s real, and the deals you should have won fall out of the bottom because nobody noticed they’d gone quiet.',
    whatWeBuilt:
      'A CRM built around the way your team sells. Stages match your real pipeline. Moving a deal into a stage runs the right automation — quote drafted, visit booked, contract pushed to e-sign, ops notified. Every interaction across every channel lands on one deal timeline.',
    whatChanged:
      'The team stopped re-typing the same details into four tools. Forecasting tightened because the pipeline reflects what’s really happening. New reps onboard in days because the system encodes the playbook.',
    pillarNotes: {
      'automation':
        'Stage moves run the right automation: quote drafting, site-visit briefs, e-sign hand-off, accounting projection updates. The CRM does the chore work the team used to do manually.',
      'analytics':
        'Weighted pipeline, conversion by stage, rep load and automation completion all update live as deals move — calibrated to the way your business measures sales health, not a vendor default.',
      'audit-trails':
        'Every channel touch is captured against the deal: calls, WhatsApps, emails, in-person visits. Nothing lives only in someone’s head or one person’s phone.',
    },
  },
  {
    slug: 'customer-360',
    name: 'Unified Customer Record',
    tagline:
      'One customer record, stitched from the systems that already hold the data. Every team sees the same customer.',
    pillars: ['automation', 'audit-trails', 'anomaly-detection'],
    industry: 'B2B SaaS, financial services, multi-team service businesses',
    bestFor:
      'Companies whose sales, support, finance and CSM teams each keep their own version of the customer — and none of them quite agree',
    status: 'live',
    problem:
      'A renewal call goes wrong because Sales doesn\'t know there are three open tickets. Finance chases an invoice the CSM already negotiated. Support hears "we asked about that two weeks ago" — and they did. The answer landed in a different inbox. Four teams, four versions of the customer. The AE walks into the call already losing trust. The CSM doesn\'t know which channel went silent first. The customer is the one keeping them aligned — until the day they stop.',
    whatWeBuilt:
      'One record per customer, stitched from the systems already in use. Sales, support, billing, product use, marketing — every event lands on the same timeline. Sales, Support, Finance and CSM each get a lens on it. The lens decides which events sit forward and which actions the team should run next. Every event is one click from the source system that produced it.',
    whatChanged:
      'Account reviews stopped opening with "wait, what\'s the latest?". Cross-team handoffs stopped needing a 20-minute briefing. Customers stopped repeating themselves. Nobody has to keep two truths in their head anymore.',
    pillarNotes: {
      'automation':
        'Events flow from the source systems on their own schedule. No team retypes the customer into the next tool. The record updates itself and the right lens lights up.',
      'audit-trails':
        'Every event on the unified record carries its source system. One click jumps to the full source record. Disputes get resolved by reading the timeline, not by reconciling four exports.',
      'anomaly-detection':
        'Failed payments, detractor NPS, breached usage thresholds, silent owners — every signal surfaces against the record. No team has to spot the pattern across four tools a week too late.',
    },
    demoFraming:
      'One example. Built for a SaaS team with sales, support, finance and CSM. Your record mirrors your team shape and your source systems.',
    pillarHeading: 'One record. Three jobs done against the same customer.',
  },
  {
    slug: 'knowledge-assistant',
    name: 'Internal Knowledge & SOP Assistant',
    tagline:
      'The company playbook stops being a folder no one reads — it becomes the system that answers questions for the whole team.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Demoed across high-turnover retail, compliance-heavy finance, and complex-product manufacturing',
    bestFor:
      'Teams whose SOPs, contracts, pricing rules and policies live in a SharePoint nobody opens',
    status: 'live',
    problem:
      'The returns rule is in the policy folder. The complaint SOP is on page 14 of the operations manual. The casual-staff leave entitlement is buried in an HR PDF. Staff ask the same five questions every week — and every week, three people stop what they\'re doing to answer them again. Worse: even the people meant to know the rule stop trusting that the version they remember is still current.',
    whatWeBuilt:
      'An assistant that has read every SOP, contract, pricing rule and policy the business runs on. Staff ask plain-English questions and get plain-English answers, with every claim cited to its source. The source is one click away. Questions the system can\'t answer get flagged to the ops manager — and the gaps it surfaces become the SOPs written next.',
    whatChanged:
      'The "where do I find…?" interrupt disappeared. New hires onboarded against the system itself. Each week, the ops manager opens the dashboard and reads the questions the team actually asked — and the gaps in the playbook surface themselves.',
    pillarNotes: {
      'automation':
        'The assistant answers without a human. Routine policy lookups, refund rules, signoff thresholds — all served instantly, with the source attached.',
      'audit-trails':
        'Every answer carries its citations. Every "I don\'t know" lands as a tracked flag with an owner. The same trail that helps staff helps auditors.',
      'analytics':
        'The admin view shows what the team asked most, where the knowledge base ran dry, and which SOP the business should write next. The playbook gets sharper every week.',
    },
    demoFraming:
      'Three example playbooks — retail, finance, manufacturing. Same engine. Yours would be shaped to the SOPs, contracts and rules your business actually runs on.',
  },
  {
    slug: 'lead-qualifier',
    name: 'Lead Qualification Engine',
    tagline:
      'Every inbound enquiry, qualified before a rep sees it. The leads worth a call reach the right person with the brief already written; price-shoppers and out-of-scope ones get a polite reply and a place in line.',
    pillars: ['automation', 'audit-trails'],
    industry: 'B2B sales teams, boutique hotels, law firms, professional services',
    bestFor:
      'Teams whose inbox mixes high-value leads, price-shoppers and noise — and whose reps spend the day sorting it',
    status: 'live',
    problem:
      'The good lead and the time-waster land in the same inbox. The wedding planner with a £45k budget queues behind nine "do you rent cars?" messages. A serious buyer waits while a rep talks a shopper through pricing the shopper was never going to act on. The team stops trusting the inbox — and the leads worth chasing are the ones that slip.',
    whatWeBuilt:
      "An intake that runs the first conversation. Every inbound enquiry — web form, WhatsApp, voicemail, chat — gets a short structured exchange in the business's voice. The system extracts a qualifying brief as the conversation lands: intent, scope, timing, budget, urgency. When the brief is complete, the system routes the lead. Senior rep for high-value. AE diary booking for serious buyers. Self-serve nurture for price-shoppers. Polite redirect for out-of-scope. Anything the engine can't confidently call lands in a human-review queue with the reason it paused. Every rep that gets a lead gets the brief and a suggested approach — the first call lands warm.",
    whatChanged:
      'Reps stopped sorting the inbox and started working the leads. The wedding planner reached the head of events the same hour. The price-shopper got the rate sheet without a rep typing a reply. The "do you rent cars?" message stopped reaching anyone. Booked-call rate lifted because the conversations that needed a human got one — fast, with context.',
    pillarNotes: {
      'automation':
        'The intake holds the first conversation, captures the brief, and routes the lead — no human reads a message first. Replies fire on the same channel the enquiry arrived on, so the prospect never feels handed off.',
      'audit-trails':
        'Every qualifying exchange is logged in full. Questions asked, answers given, fields extracted, the rule that decided the routing — all stitched into one record. The brief the rep receives is the brief the system used to route. Disputes get answered by reading the trail, not by re-doing the call.',
    },
    pillarHeading: 'One example. Two jobs.',
    demoFraming:
      'One example of how this capability could be deployed. Your intake would be shaped to your business — different questions, routing, rules, and reps.',
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
    demoFraming:
      'One example of the capability. Zabble builds the version that matches your stages, your roles, your rules.',
    pillarHeading: 'One system. Every pillar pulling.',
    problem:
      'Bringing on a new HNW client should take days. In most firms it takes weeks. An advisor emails for an ID. The client signs the engagement later. Compliance asks for a missing form. Someone forgets to set up payment. The advisor lies awake wondering if the client has cooled. Compliance is one missing form from an audit finding. By the time anyone notices, the prospect has walked.',
    whatWeBuilt:
      'A two-sided workflow. The client gets a single checklist. The firm sees the mirror queue. KYC, file setup, advisor assignment, welcome packs and kick-off prep all fire from the client\'s actions. If the client stalls, the system nudges by email, then WhatsApp, then escalates to the advisor.',
    whatChanged:
      'Time-to-active dropped from fourteen days to under two. Advisors stopped sending follow-up emails. Compliance stopped chasing the same form across inboxes. Nothing sits in limbo — and when something does, the right person knows before the client notices.',
    pillarNotes: {
      'automation':
        'A completed client step triggers the matching firm step — KYC, file setup, advisor assignment, welcome pack, kick-off prep — without anyone in the loop.',
      'audit-trails':
        'Every nudge, every escalation, every state change is logged against the client record. The firm can show exactly when a step was triggered and by what.',
      'analytics':
        'Time-to-active, stuck-step rates and nudge-channel effectiveness feed one live pipeline view. The team sees where any new client is — and where any are at risk.',
    },
  },
  {
    slug: 'case-management',
    name: 'Case Management System',
    tagline:
      'Every matter, every owner, every deadline — tracked end to end with the audit trail written by default.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Law firms, NGOs, insurance, complaint desks, HR & facilities',
    bestFor:
      'Operators running lifecycles that span weeks and hands — where a missed deadline costs more than the system does.',
    status: 'live',
    problem:
      'A legal matter passes through five hands over three weeks. Documents land in one inbox, deadlines live in another, decisions get made in WhatsApp. Somebody forgets a filing date. The client phones to ask. Nobody can reconstruct who said what, when.',
    whatWeBuilt:
      'One engine owns the lifecycle. Cases move across a Kanban with SLA timers on every card. Opening a case shows every interaction, every document, every deadline and every decision on a single timeline. Events advance the case automatically. When an SLA breaches, the escalation fires itself — case bumped, supervisor notified, comment auto-logged. The example below is one such build. The same approach has shipped for NGO beneficiary files, complaints, HR incidents and more — shaped to each team that runs it.',
    whatChanged:
      'Missed deadlines dropped from one in four matters to under one in fifty. Audit prep that took a fortnight became an export. New role ramp dropped from six weeks to two days — the system encodes how the work runs.',
    pillarNotes: {
      'automation':
        'Events trigger the next step: stage transitions, deadline recomputes, assignee notifications, escalations on breach. The case moves from the event, not from someone remembering.',
      'audit-trails':
        'Every action ever taken on a case — by whom, when, why — written once and never edited. The full record exports as one document, ready for an auditor, a regulator, or the client.',
    },
    demoFraming:
      'Example deployment. Every Zabble case system is shaped to its business — workflow, fields, SLAs and escalations are all configurable.',
    pillarHeading: 'One engine. Two jobs done by default.',
  },
  {
    slug: 'task-management',
    name: 'Task Management System',
    tagline:
      'Every owner, every dependency, every deadline. When one slips, the rest of the matter knows — and the right person hears before the client does.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Property law firms',
    bestFor: 'Multi-role workflows with weeks of sequential and parallel steps',
    status: 'live',
    problem:
      'A residential transfer touches three roles over eleven weeks. When one person is on leave or a clearance is late, the matter quietly stalls — usually until the client phones to ask.',
    whatWeBuilt:
      'A board that shows every matter in flight, what\'s stuck, and who owes what to whom. Finish your task; the next person\'s brief is on their screen — deeds search, FICA pack, prior correspondence attached. Slip a clearance and the timeline recomputes so nothing surprises a partner the morning of lodgement.',
    whatChanged:
      'Matter cycle time dropped from twelve weeks to seven. The number of files sitting in nobody\'s queue dropped to zero. Partners stopped getting phoned by clients asking "is anything happening?".',
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
    demoFraming:
      'One example — five trades on one shell. Your trade gets its own forms, checklists and back-office view.',
    pillarHeading: 'One shell. Forms, audit and analytics shaped to your trade.',
    problem:
      'The job happens at a customer\'s site, in a basement, on a rooftop, in a van — wherever signal drops out. The data lands later — on paper, retyped by an admin, in the wrong order, the photo missing. Dispatch reads the calendar and guesses where the crews actually are. Bills go out wrong. Disputes can\'t be resolved. Tomorrow gets planned against yesterday\'s guess.',
    whatWeBuilt:
      'A field app shaped around the role. Same shell, role-specific forms — installer, inspector, driver, social worker, meter reader. Offline by default: every action queues locally and syncs the moment connectivity returns. The back office sees the work as it happens — or as the van rolls back into range.',
    whatChanged:
      'Field crews stopped doing double-entry at the end of the day. Disputes get resolved from the timeline, not from memory. Tomorrow\'s schedule plans against what actually happened today — photo, geo-stamp and signature on file.',
    pillarNotes: {
      'automation':
        'Field events trigger the back office. Dispatch, route, post-visit forms, customer notifications and invoicing fire from the visit itself. No admin retypes the day.',
      'audit-trails':
        'Every visit lands as one record: who, where (geo-stamped), when, every check, every finding, photos, signature. The timeline reconstructs the job for any dispute.',
      'analytics':
        'Live counts of crews on site, jobs completed, jobs flagged and exception rates roll up to dispatch. Planning runs on what\'s actually happening — not on yesterday\'s guess.',
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
    demoFraming:
      'One example deployment. Yours would compose around the systems and decisions your business actually runs on.',
    pillarHeading: 'Two jobs, one platform.',
    problem:
      'Four people open the same 47-widget dashboard at 06:30. They hunt for two minutes and close the tab no more informed than when they opened it. Reports get requested instead — and nobody reads those either. The dashboard was supposed to feed the decision; somewhere along the way it became the decision people kept avoiding. The cost lands in the calls that did not get made and the windows that closed while the team was scrolling.',
    whatWeBuilt:
      'A unified layer pulls from every operational system in the business, then composes the view by role. Each person sees only the KPIs that feed the decisions they actually make. The time horizon matches the cadence of those decisions. Every number opens its calculation, its source systems, the decision it informs, and the next action. Built for a logistics operator. Same engine, different sources — now also serving a hospitality group and a retail chain.',
    whatChanged:
      'Each role opens one screen and sees the decisions they have to make today. The 06:00 briefing arrives in Slack before the operator does — yesterday\'s anomalies, today\'s risks, this morning\'s calls. The old dashboard got archived. Nobody asked for it back.',
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
      'The books move when the business does. Invoices, receipts and journal entries fire from real events — not month-end memory.',
    pillars: ['automation', 'audit-trails', 'analytics'],
    industry: 'Consulting & professional services',
    bestFor: 'Firms whose books lag operations by days or weeks',
    status: 'live',
    demoFraming:
      'One example — a 12-person consulting firm on UK VAT. Yours would mirror your chart of accounts, tax rules and project taxonomy.',
    pillarHeading: 'Accounting that posts itself, audits itself, reports itself.',
    problem:
      'Sales signed a project on Monday. Finance heard about it on Thursday. The invoice went out the following Tuesday — and only if someone remembered. Retainers were missed. Refunds processed without reversing revenue. The founder spent month-end making decisions against numbers a fortnight stale, and the controller was the last one out every Thursday night.',
    whatWeBuilt:
      'An event-driven accounting layer. Operational systems emit events — projects signed, milestones shipped, refunds processed, deposits received. The engine writes the right artefact: a deposit invoice, a milestone draw-down, a recurring charge, a journal entry, a bank match. Rules are config, not code. The firm can change VAT treatment or cost-centre splits without engineering work.',
    whatChanged:
      'Books reconcile to within a day of operations. Month-end takes hours instead of weeks. Every entry traces back to the event that produced it. Auditors get answers in seconds. Revenue stops slipping through cracked spreadsheets.',
    pillarNotes: {
      'automation':
        'Every recurring accounting motion — deposit invoice, milestone draw-down, recurring charge, journal entry, bank match — fires from a real operational event, not a calendar reminder.',
      'audit-trails':
        'Every ledger entry carries the event ID and the rule that produced it. Auditors reconstruct the full chain of evidence for any line, any time.',
      'analytics':
        'Because the books reflect operations in near-real-time, AR ageing, MTD revenue and project margin are reportable any day of the month — not just at close.',
    },
  },
  {
    slug: 'compliance-reporting',
    name: 'Compliance & Regulatory Reporting Engine',
    tagline:
      'The submissions regulators, auditors, donors, and boards expect — assembled from the data you already generate, no quarter-end scramble.',
    pillars: ['automation', 'audit-trails', 'anomaly-detection'],
    industry: 'Banks, NGOs, regulated operators, finance teams',
    bestFor:
      'Teams whose quarter-end is a fortnight of spreadsheets, late nights, and "where did this number come from?"',
    status: 'live',
    demoFraming:
      'One example — a South African bank, NGO and finance team in scope. Yours would point at the submissions your team actually files, with the rule packs your regulators publish.',
    pillarHeading: 'One engine. Any regulator. Every figure traceable.',
    problem:
      'Every quarter the same scramble. Numbers pulled by hand from the loan book, the GL, the CRM. A finance lead reconciling six spreadsheets at 11pm, signing off on figures they don\'t fully trust. The auditor asks where a number came from and nobody can answer for ninety minutes. The cost of one wrong submission isn\'t paperwork. It\'s a SARB penalty, a R10M POPIA fine, or a donor walking back next year\'s grant.',
    whatWeBuilt:
      'A reporting engine that knows which systems each submission draws from and pulls the data itself. Validations run live against the regulator\'s rule pack. Exceptions surface with a one-line cause and a human action. The same engine produces a banking return, an NGO donor report, a POPIA filing, or a tax submission. Every figure traces back to its source row.',
    whatChanged:
      'Quarter-end stopped being a fortnight of late nights. The same engine, repointed at different sources and rule packs, now produces four kinds of submission. Auditors ask where a figure came from. They get an answer in seconds — the system already knew.',
    pillarNotes: {
      'automation':
        'The engine pulls from every source system on a schedule. It applies the rule pack for the chosen report and assembles the final submission. XBRL, PDF, or Excel — without anyone keying a number.',
      'audit-trails':
        'Every figure carries its lineage: which source system, which row, which rule applied. Click any cell of the output and the audit trail unrolls. Submissions stand up to a regulator months later.',
      'anomaly-detection':
        'Completeness, consistency, threshold, and reporting checks run as data lands. Variances surface before submission, not after. The finance team sees what the regulator will see — and acts on it first.',
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
      'Fraud, drift and equipment failure share one shape — a tiny signal inside an ocean of normal activity. By the time a human notices, the damage is already booked. The analyst, the engineer, the data lead — all of them dread finding out too late. Most teams cope by sampling, and the things they miss are the things that hurt.',
    whatWeBuilt:
      'A single engine ingests the live stream — card transactions, CRM events, sensor telemetry. The right detector picks up each event by source. Every flag carries its rule, its history, and the suggested action. Every decision lands in an immutable audit trail, keyed by case ID.',
    whatChanged:
      'The risks that hurt most — fraud, drift, equipment failure — started getting caught at volume. Investigators stopped triaging false positives by hand. They now receive cases with their evidence already attached. Mean time to detection dropped from days to seconds.',
    pillarNotes: {
      'anomaly-detection':
        'Four detector families run in parallel. Rules catch hard thresholds. Statistical models catch drift. Pattern scoring catches fraud. Signal-processing reads vibration data. Each event picks the right detector for its source.',
      'audit-trails':
        'Every flag opens a case. The case holds the rule that fired, the surrounding history, the suggested action, and the operator who reviewed it. Written once, never edited. Disputes get answered by replay, not by recollection.',
      'analytics':
        'A live sensitivity dial shows the trade-off between coverage and false positives. Weekly replays let the team count what would have been caught. The dial gets tuned against what the business actually wants to see.',
    },
    demoFraming:
      'Three example deployments — same engine. Yours would be one of them, shaped to your business alone.',
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
      'Reps quote from a price list, a tier-discount sheet, a contract folder, and a margin rule they half-remember. Every quote goes out with the rep wondering if the margin holds. Finance signs off later, holding their breath. The deal that should have made twelve points makes three. The team only finds out when the month closes. Another quarter like this and the gap between forecasted and actual margin is too wide to explain.',
    whatWeBuilt:
      'A pricing engine. List price, tier discount, volume break, contract override, manual discount — composed into one number on screen, in front of the rep. A margin floor blocks anything underwater. Breaches route to the right approver before the quote goes out. The same engine quotes parts, hotel nights, or consulting scopes — only the rule set changes.',
    whatChanged:
      'Quote turnaround dropped from days to minutes. Average margin lifted because the engine catches the breaches reps used to miss. Every quote arrives with its rule stack attached. Finance stops auditing in arrears — the audit trail is the quote.',
    pillarNotes: {
      'automation':
        'List price, tier discount, volume break and contract override compose automatically the moment a line is added. PDF generation, e-sign dispatch, CRM push and opportunity logging fire from one click — no copy-paste between tools.',
      'audit-trails':
        'Every line carries the rule stack that produced it: which discount fired, which override applied, who approved any breach. Finance can replay any quote end to end.',
      'analytics':
        'Live margin %, weighted COGS and floor status update with every line. The team sees what the deal does, not what the price list says.',
    },
    demoFraming:
      'One example. The same engine, repointed at your rules, your tiers, your approvers — shaped around your business.',
    pillarHeading: 'One engine. Three jobs.',
  },
  {
    slug: 'reconciliation-engine',
    name: 'Reconciliation Engine',
    tagline:
      'Stop chasing the agreement between systems. The engine matches the ledgers in the background and only surfaces what needs a human.',
    pillars: ['automation', 'audit-trails', 'anomaly-detection'],
    industry: 'Retail, multi-location operations, B2B billing',
    bestFor:
      'Finance and ops teams reconciling POS against processor, payouts against invoices, or stock against sales — by hand, every week',
    status: 'live',
    problem:
      'Every week somebody exports POS to a spreadsheet, downloads the bank statement, and opens accounting. Ten thousand transactions, three sources of truth, none agreeing. By Friday the numbers nobody fully trusts go to the board. The next reconciliation is already overdue. The audit finds the gap before you do — and your float pays for it.',
    whatWeBuilt:
      'A reconciliation engine that ingests every ledger as it lands — POS, bank, accounting, processor, inventory. It matches the easy cases in seconds. Only the mismatches that need a human ever reach the queue. Resolve one by hand and the engine saves the rule — the same kind auto-clears next time.',
    whatChanged:
      'The reconciliation queue went from ten thousand lines to a handful of real exceptions. Finance stopped doing data-entry and started doing decisions. The same engine handles POS-vs-processor, POS-vs-inventory, and processor-vs-invoices. Same logic, different ledgers.',
    pillarNotes: {
      'automation':
        'The engine ingests every ledger as it posts and matches what it can with no human in the loop. Identical entries match 1:1; combined deposits match by sum-and-window; predictable processor fees match by saved rule.',
      'audit-trails':
        'Every match — automatic, partial, or manually resolved — is logged with the rule that produced it. A finance lead can replay the decision behind any matched pair, and every manually-saved rule is versioned.',
      'anomaly-detection':
        'Only what the engine cannot close reaches a human: timing gaps, missing records on one side, unexplained deltas. The mismatches that matter rise to the top instead of being hidden in the noise.',
    },
    demoFraming:
      'One example — three ledger pairs a finance team would actually face. Yours would point at the ledgers your business already runs, with the rules your team already follows.',
    pillarHeading: 'One engine. Automation, audit and anomaly detection across every ledger pair.',
  },
  {
    slug: 'data-routing',
    name: 'Data Routing Pipeline',
    tagline:
      'The systems you already own, piped into one clean output — board pack, donor report, regulator return. The pipeline does the assembly that four people used to do over three days of email.',
    pillars: ['automation', 'audit-trails', 'anomaly-detection'],
    industry: 'Mutual banks, microfinance NGOs, regulated finance teams',
    bestFor:
      'Finance teams assembling the same numbers three ways — board pack, donor report, regulator return — three weeks running.',
    status: 'live',
    problem:
      'The GL, the payroll register, the CRM and the banking core each hold a slice of the truth. Four people spend three days emailing back and forth to assemble the board pack. The finance lead stops trusting the pack she ships. When the CEO asks where 22.8% came from, she cannot answer in the meeting. The donor report gets built the same way next week. The BA 900 return is a third pass. Same data, three angles, three weeks gone.',
    whatWeBuilt:
      'One pipeline that reads from every system the team already runs. Classify, join, validate, aggregate, render — the rule pack for the chosen output decides which transforms fire. The same engine produces the board pack on Monday, the donor report on Tuesday, the BA 900 return on Thursday. Click any figure and the lineage unrolls back to the source row.',
    whatChanged:
      'The pack stopped being assembled and started being generated. When a source drops offline the pipeline degrades to a known fallback rather than producing a wrong number quietly. Disputes get answered by clicking the number — the audit trail is the document.',
    pillarNotes: {
      'automation':
        'Source pulls, schema joins, validation rules and template rendering all fire from one button. The same engine, repointed at different sources and templates, produces every recurring submission the business owes.',
      'audit-trails':
        'Every figure in the output carries the source rows, the transforms and the rule pack that produced it. Click the number, watch the lineage unroll. Disputes get answered by replay, not by re-doing the work.',
      'anomaly-detection':
        'When a source drops offline the pipeline degrades to a known fallback rather than producing a wrong number silently. Impacted figures land in a human-review queue with the cause attached; the pack still ships, with a notice.',
    },
    demoFraming:
      'A South African mutual bank with a development foundation arm — one stack, three monthly outputs. Yours would point at the systems your business actually runs, with the rule packs your team already follows.',
    pillarHeading: 'One engine. Three outputs. Same source of truth.',
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
      'You bought eight tools and they pretend not to know each other. The booking platform talks to nobody. Accounting hears about new revenue when the bookkeeper opens the invoices folder. The CRM has yesterday\'s contacts and marketing is emailing customers who churned a month ago. You stopped trusting any single dashboard because you know what didn\'t get copied across. The business runs as eight islands with a person paddling between them.',
    whatWeBuilt:
      'An integration hub that sits between every system the business already uses. Each tool emits the events it already knows about. The hub forwards each one to every other tool that should know — transformed on the way. New bridges are point-and-click — no glue scripts, no agency invoices, no fragile zaps — and every event carries its trail.',
    whatChanged:
      'The team stopped copying. A booking lands once. Within seconds: contact in the CRM, invoice in accounting, slot held in the calendar, campaign target in marketing. New tools slot into the hub the day they arrive instead of becoming the next island.',
    pillarNotes: {
      'automation':
        'Every cross-tool motion the team used to do by hand — copy-paste, re-keying, email-and-wait — fires from one source event. The hub is the only thing that ever needs to know the other tool\'s shape.',
      'audit-trails':
        'The hub logs every event with its origin, its bridges, its targets and the outcome at each hop. If a CRM contact looks wrong, the trail shows which booking it came from and which transformation applied.',
    },
  },
  {
    slug: 'cross-system-sync',
    name: 'Cross-System Sync Engine',
    tagline:
      'Two systems, one truth. Edits on either side land on both in seconds. Conflicts resolve by the rule you set.',
    pillars: ['automation', 'audit-trails'],
    industry: 'Retail, hospitality, professional services, multi-tool operators',
    bestFor:
      'Teams whose inventory disagrees with their store, whose HR disagrees with payroll, whose calendar disagrees with bookings — and someone reconciles by eyeballing two screens',
    status: 'live',
    problem:
      'Stock changes in the warehouse. Nobody updates the storefront. A customer orders something that left the shelf two days ago. Same shape everywhere — HR raises someone, payroll keeps paying the old number. The booking lands in the calendar but not in the booking platform. Two systems hold the same record, drift apart, and a person spends their day eyeballing both screens. They never quite trust either. Refunds, overpayments, double-bookings — the cost of disagreement lands on the team that did not cause it.',
    whatWeBuilt:
      'A sync engine that sits between two systems and keeps every shared record identical. Edits on either side land on the other in seconds. We sit with teams reconciling inventory against e-commerce, HR against payroll, calendar against booking — the shape repeats. Direction is configurable. One-way for the systems where one is the source of truth. Bi-directional for true peers. When both sides edit the same field at once, the conflict rule you chose fires automatically. Last write, source-of-truth, or human review. The rule that fired is cited in the audit trail.',
    whatChanged:
      'The reconciliation staff used to do by hand stopped happening. Inventory and storefront agreed. HR and payroll agreed. The calendar and the booking system agreed. When a conflict did surface, it landed in one review queue. Both sides shown. The rule already chosen. Not in a Friday-afternoon spreadsheet.',
    pillarNotes: {
      'automation':
        'Every shared field stays identical across both systems without a human in the loop. The engine pushes the change, applies the conflict rule, and writes the audit entry. All within seconds of the edit.',
      'audit-trails':
        'Every sync event lands in the reconciliation log. Timestamp, originator, fields touched. If a conflict fired, the rule that decided it. Disputes get answered by replaying the log, not by re-reconciling the two systems.',
    },
    demoFraming:
      'One example — four common system pairs. Yours would point at the two your team already eyeballs.',
  },
  {
    slug: 'forecasting',
    name: 'Forecasting & Demand Planning',
    tagline:
      'Eighteen months of your numbers, projected forward. The orders, shifts and cash buffers it implies land where the team already works.',
    pillars: ['analytics', 'automation', 'anomaly-detection'],
    industry: 'Restaurants, distributors, SaaS, multi-site retail',
    bestFor:
      'Operators whose forecasts live in a spreadsheet and never quite arrive at the people who need them',
    status: 'live',
    demoFraming:
      'One example — restaurant covers, parts demand, SaaS cash. Yours would be shaped around your numbers, your drivers, and the systems your team already opens.',
    pillarHeading: 'One forecast, three jobs.',
    problem:
      'Somebody pulls eighteen months of history into a spreadsheet every Friday afternoon. They draw a line forward, guess Saturday\'s staffing, and email the supplier an order they don\'t trust. Sunday night, they\'re still wondering. By Tuesday the numbers are stale, the rota is wrong, and the kitchen over-prepped desserts nobody is ordering. Every week, the same money walks out the back door.',
    whatWeBuilt:
      'A forecasting engine trained on the operator\'s own history. Weather, local events, promo cadence and trend are first-class inputs the team can move. Forecasts redraw live. The confidence band widens visibly when the model is unsure. Recommendations — flour orders, Saturday rotas, hiring defers — push to the supplier portal, the rota tool, and the FP&A model. Same engine, repointed: restaurant covers today, parts reorder points tomorrow, SaaS cash collections the day after.',
    whatChanged:
      'Friday afternoon went away. The forecast was already on the screens that mattered by Monday morning. Forecast accuracy moved from a 20%+ trailing average to single digits. The operator stopped finding out about Wednesday\'s over-prep on Thursday.',
    pillarNotes: {
      'analytics':
        'Forecasts compose from the operator\'s real history plus the drivers they actually know about — weather, events, promos, trend. Every number is sized by the model, not by gut feel. The holdout accuracy sits next to the chart, so the operator can see what the model is worth.',
      'automation':
        'Recommendations push to the systems the team already opens — the supplier portal, the rota tool, the PO drafts, the FP&A model. The forecast doesn\'t live in a tab; it lands in the inboxes that drive the work.',
      'anomaly-detection':
        'The model flags the weeks it is least sure about — usually around events, promo launches, or unfamiliar weather. A "Highest uncertainty" chip surfaces the week and the driver behind it, so the operator sees the risk before it costs them.',
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
    pillars: ['automation', 'audit-trails', 'anomaly-detection'],
    industry: 'Multi-system operators, mid-market and up',
    bestFor:
      'Businesses where the CRM, the billing system and the shipping system each hold a slightly different version of the same customer',
    status: 'live',
    problem:
      'Sales has one address for the customer. Finance has a second. Support has a third. Shipping has a fourth — and the courier keeps returning the order. Every team trusts only its own record. Nobody quite trusts anything on screen. The customer ends up correcting all four. What everyone calls the source of truth is four spreadsheets that almost agree.',
    whatWeBuilt:
      'A hub that holds the canonical record for every entity the business runs on — customer, supplier, product, employee, asset. Edits happen once on the golden record. The hub fans the change out to every downstream system in under two seconds. A direct edit in a downstream system has to compete with the hub. The rule that resolves the conflict is explicit, configurable, and audited.',
    whatChanged:
      'Returned shipments dropped to near zero. The finance team stopped re-keying addresses. Support stopped asking the customer to confirm what should already be known. The four spreadsheets where the truth used to live got archived — nobody asked for them back.',
    pillarNotes: {
      'automation':
        'A field changes once on the golden record. The hub fans it out to every downstream system that consumes it. CRM, accounting, support, marketing, billing, shipping — under two seconds, no keystroke.',
      'audit-trails':
        'Every propagation, every conflict, every override is logged with the rule that resolved it. Disputes get answered by reading the lineage, not by phoning round.',
      'anomaly-detection':
        'Drift surfaces the moment it happens. A system that disagrees lights up red, with its source cited beside it. The cost of every disagreement is named: returned shipments, refund delays, late invoices. The team sees what consistency is worth.',
    },
    demoFraming:
      'One example — five entity types running on one hub. Yours might keep one or two; same rules, your fields, your downstream systems.',
    pillarHeading: 'One hub. Three jobs done before anyone disagrees.',
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
      'Every system shouts. Stock is low — everyone gets an email. A card decline trips a fraud signal — Slack pings twenty people. An on-call engineer\'s laptop pulses at 2am for a disk warning that could wait. After a week the team mutes the channel and archives the inbox folder. The one alert that was actually a fire goes unread next to nine hundred that weren\'t. Nobody on the team trusts the channel anymore. The on-call engineer screens her phone because the last six pings didn\'t matter.',
    whatWeBuilt:
      'A central rule engine sitting between every source system and every channel. Conditions and severity decide who hears about it. Channel preferences decide where. Quiet hours decide whether it can wait until 7am. Critical events override every rule and reach a human within seconds. Everything else routes by role, by shift, by on-call rota. Slack to the right channel. SMS only when needed. Email for the audit copy. WhatsApp for the field team. Push for the on-call phone.',
    whatChanged:
      'The team started noticing alerts again because there were fewer of them. The on-call engineer\'s phone stopped buzzing at 2am for things that could wait until coffee. Stock alerts reached the buyer, not the entire company. Every routing decision is logged with the rule that fired, the condition matched, and the channel chosen. When something is missed, the answer is one query away.',
    pillarNotes: {
      'automation':
        'Rules fire automatically as source events land. Severity, persona, quiet-hours and channel preferences compose into a single routing decision — no human deciding who to copy, no group chat to ignore.',
      'anomaly-detection':
        'The engine treats noise as a first-class problem. Repeating alerts, duplicate signals, and low-signal "FYI" pings are de-duplicated, batched or suppressed so the actual outliers reach a human within seconds.',
      'audit-trails':
        'Every alert carries its rule, the matched condition, the chosen channel, and the recipient set. Missed-alert post-mortems read the trail instead of guessing where the message went.',
    },
    demoFraming:
      'One example — five channels, four personas, one rota. Yours would use the channels your team already lives in, with the rules your business already follows.',
    pillarHeading: 'One engine. Three jobs done before anyone is woken up for nothing.',
  },
]

// ───────────────────────────────────────────────────────────────────────────
// SEO / AEO data (owned by S02 on-page, sourced from targets/keyword-map.md +
// intent-clusters.md, S03 keyword research — verified ZA metrics, 2026-06-04).
//
// Kept in one keyed map rather than inline on each entry so SEO copy lives
// together, stays DRY, and is easy to diff against the keyword map. Merged onto
// the live SYSTEMS entries once at module load (below). `keywords[0]` is the
// page's single PRIMARY intent (the cannibalisation guard asserts these are
// unique across all pages). `definition` is the answer-first, liftable
// "X is a system that …" used for the AEO/GEO answer block + (by S08) schema.
// Final long-form body copy remains S10's; these are the structural SEO assets.
// ───────────────────────────────────────────────────────────────────────────
// FAQ copy is owned by S07 (AEO) via AEO_CONTENT below — not duplicated here.
// SYSTEM_SEO carries on-page metadata only; the AEO loop is the single source
// of truth for `faqs` (and `answer`), so the on-page + JSON-LD strings stay
// byte-identical.
type SystemSeo = Pick<
  System,
  'seoTitle' | 'seoDescription' | 'keywords' | 'definition'
>

const SYSTEM_SEO: Record<string, SystemSeo> = {
  'kairos': {
    seoTitle: 'Kairos — AI Receptionist & Event Engine',
    seoDescription:
      'An AI voice agent and event-orchestration engine that answers every call, chases confirmations and recovers no-shows — so your team stops being the switchboard.',
    keywords: ['event management software', 'ai receptionist', 'virtual receptionist software', 'ai voice agent'],
    definition:
      'Kairos is a voice-first automation engine that answers the phone as an AI receptionist, runs the full arc around an event — pre-event outreach, day-of orchestration and post-event follow-up — and logs every call and message with the reasoning that fired it, so no booking is lost to a missed call.',
  },
  'approval-workflow': {
    seoTitle: 'Approval & Sign-Off Workflow Software',
    seoDescription:
      'Route approvals by rule instead of by inbox — thresholds, roles and conditions decide who signs next, and every decision lands in an audit-ready evidence pack.',
    keywords: ['approval workflow software', 'approval management software', 'loan approval workflow', 'sign off workflow software'],
    definition:
      'An approval workflow system routes a decision — a loan, a grant, a purchase order — to the right people in the right order by rule, advances the moment each person signs, and records every approver, comment and condition as an immutable trail a regulator can read as-is.',
  },
  'multi-channel-inbox': {
    seoTitle: 'Multi-Channel Inbox',
    seoDescription:
      'Email, WhatsApp, SMS, web forms, DMs and voicemail in one classified, routed queue — so no lead or complaint slips because nobody watched that channel.',
    keywords: ['omnichannel inbox', 'shared inbox software', 'unified inbox software', 'multichannel customer support software'],
    definition:
      'A multi-channel inbox pulls every inbound channel — email, WhatsApp, SMS, web forms, social DMs, voicemail — into one stream, classifies and routes each message to the right person in seconds, and replies on the channel the message arrived on, so nothing is missed and the customer never feels handed off.',
  },
  'workflow-orchestrator': {
    seoTitle: 'Event-Driven Workflow Orchestrator',
    seoDescription:
      'One business event fans out across every downstream system in seconds, with retries, fallbacks and human escalation — instead of next-morning copy-paste.',
    keywords: ['workflow orchestration software', 'workflow automation software', 'business workflow software', 'event driven automation'],
    definition:
      'A workflow orchestrator listens for a business event — a new order, a signed deal — and fans it out across every downstream system automatically, retrying on failure, falling back when needed and paging a human as a last resort, with every signal recorded in an immutable event log.',
  },
  'decision-engine': {
    seoTitle: 'Decision Engine',
    seoDescription:
      'Codify a judgment call once, then have every reviewer reach it the same way — each decision scored, explained and logged, only the hard cases reaching a human.',
    keywords: ['decision engine software', 'decision management software', 'rules engine software', 'loan decisioning software'],
    definition:
      'A decision engine encodes a policy as a weighted, branching rule set, scores each case in real time and returns the decision, the rate and the reasoning behind it. Routine cases clear automatically; only genuinely ambiguous ones reach a human, and every decision carries its own audit trail.',
  },
  'document-intelligence': {
    seoTitle: 'Document Intelligence System',
    seoDescription:
      'An intake pipeline that reads every document, extracts and validates the fields, and routes the work — so your team only ever sees the exceptions.',
    keywords: ['intelligent document processing', 'ocr automation software', 'invoice data capture software', 'document data extraction'],
    definition:
      'A document intelligence system is an intake pipeline that reads each document as it arrives, classifies it, extracts the fields with OCR, validates the structure — ID checksums, statement totals, signature blocks — and routes it where it belongs, sending only the ambiguous cases to a human review tray with the reason it stopped.',
  },
  'document-assembly': {
    seoTitle: 'Document Assembly System',
    seoDescription:
      'Proposals, contracts, statements and board reports assembled from your live systems — every field traceable to the source it came from.',
    keywords: ['document assembly software', 'document generation software', 'contract generation software', 'proposal automation software'],
    definition:
      'A document assembly system builds proposals, contracts, statements and reports from the systems that already hold the data — the CRM, the pricing engine, the case-study library — instead of copy-paste and memory. Every field is tagged to its source, so versions stop contradicting each other.',
  },
  'bespoke-crm': {
    seoTitle: 'Bespoke CRM — Built to Your Pipeline',
    seoDescription:
      'A CRM shaped to how your team actually sells — stages, automations and dashboards that mirror your pipeline, not a vendor’s template. Built in South Africa.',
    keywords: ['crm software in south africa', 'crm software south africa', 'custom crm', 'bespoke crm', 'custom crm development'],
    definition:
      'A bespoke CRM is a customer-relationship system built around one team’s real sales process — its stages, automations and channels — rather than a generic template. Moving a deal between stages fires the right work automatically, and every interaction across every channel lands on one deal timeline.',
  },
  'customer-360': {
    seoTitle: 'Unified Customer Record (Customer 360)',
    seoDescription:
      'One customer record stitched from the systems you already run, with a lens for sales, support, finance and CSM — so every team sees the same customer.',
    keywords: ['customer data platform', 'single customer view', 'unified customer view', 'customer 360 software'],
    definition:
      'A unified customer record (Customer 360) stitches one timeline per customer from the systems already in use — sales, support, billing, product, marketing — and gives each team a lens on it. Every event is one click from its source system, so four teams stop keeping four versions of the customer.',
  },
  'knowledge-assistant': {
    seoTitle: 'Internal Knowledge & SOP Assistant',
    seoDescription:
      'An assistant that has read every SOP, contract and policy you run on — it answers staff questions in plain English, cites each claim, and flags the gaps.',
    keywords: ['internal knowledge base software', 'sop software', 'company wiki software', 'ai knowledge assistant'],
    definition:
      'An internal knowledge assistant is a system that has read every SOP, contract, pricing rule and policy a business runs on, answers plain-English questions with each claim cited to its source one click away, and flags the questions it cannot answer so the gaps become the next SOPs written.',
  },
  'lead-qualifier': {
    seoTitle: 'Lead Qualification Engine',
    seoDescription:
      'Every inbound enquiry qualified before a rep sees it — leads worth a call routed with the brief written, price-shoppers and out-of-scope handled automatically.',
    keywords: ['lead qualification automation', 'automated lead qualification', 'lead scoring software', 'lead qualification software'],
    definition:
      'A lead qualification engine runs the first conversation with every inbound enquiry across web form, WhatsApp, voicemail and chat, extracts a qualifying brief — intent, scope, timing, budget, urgency — and routes the lead: high-value to a senior rep with context, serious buyers to a booked call, price-shoppers to self-serve.',
  },
  'legacy-bridge': {
    seoTitle: 'Legacy Bridge — Connect Old Systems',
    seoDescription:
      'Connect the spreadsheet, the old ERP and the bespoke tool to modern AI workflows through their existing surfaces — no migration, no rewrite of legacy code.',
    keywords: ['legacy system integration', 'legacy system modernization', 'erp integration software', 'legacy modernization'],
    definition:
      'A legacy bridge reads and writes through each old system’s existing surface — a file watcher on the Excel workbook, an ODBC read against the ERP, an API wrapper around the bespoke tool — so legacy systems join modern AI workflows without a migration and without touching their code.',
  },
  'inventory-clarity': {
    seoTitle: 'Inventory Clarity — RFID Stock System',
    seoDescription:
      'RFID readers turn every stock movement into a digital event, so the warehouse, the ledger and the order system always agree. No more clipboard counts.',
    keywords: ['inventory management software', 'stock management software', 'rfid inventory system', 'rfid asset tracking'],
    definition:
      'An inventory management system tracks stock levels and movements so the warehouse, the books and the order system stay in agreement. Zabble’s Inventory Clarity System uses RFID readers at every gate and bay to turn each physical movement into a digital event in under two seconds — counted by the building itself.',
  },
  'client-onboarding': {
    seoTitle: 'Client Onboarding System',
    seoDescription:
      'A two-sided onboarding workflow: the client works their checklist while KYC, file setup and assignment fire in lockstep — escalating the moment anything stalls.',
    keywords: ['client onboarding software', 'customer onboarding software', 'kyc onboarding software', 'digital onboarding software'],
    definition:
      'A client onboarding system runs the client’s steps and the firm’s steps as one mirrored workflow: a completed client action fires the matching firm action — KYC, file setup, advisor assignment, welcome pack — and the system nudges, then escalates, the moment something stalls, so no one sits in limbo.',
  },
  'case-management': {
    seoTitle: 'Case Management System',
    seoDescription:
      'Every matter, owner and deadline tracked on a board with SLA timers — cases advance automatically, escalate on breach, and the audit trail writes itself.',
    keywords: ['case management system', 'case management software', 'legal case management software', 'matter management software'],
    definition:
      'A case management system owns the full lifecycle of a matter: cases move across a board with SLA timers on every card, advance automatically as events fire, and escalate themselves when a deadline breaches. Every interaction, document and decision lands on one timeline — the audit trail is a by-product of the work.',
  },
  'task-management': {
    seoTitle: 'Task Management for Multi-Step Matters',
    seoDescription:
      'A dependency-aware board for multi-role matters — finish a task and the next brief is ready; slip a deadline and the timeline recomputes automatically.',
    keywords: ['conveyancing software', 'task management software', 'workflow task management'],
    definition:
      'This task management system runs multi-step, multi-role matters — like a property transfer — on a dependency-aware board: completing one task unblocks the next, assembles the brief the next person needs, and recomputes the timeline when something slips, so a late clearance never surprises anyone at lodgement.',
  },
  'field-ops-app': {
    seoTitle: 'Field Operations App (Offline-First)',
    seoDescription:
      'A role-shaped, offline-first field app that captures clean data where signal drops and syncs the moment connectivity returns — the office sees the work live.',
    keywords: ['field service management software', 'field operations software', 'field service app', 'offline data collection app'],
    definition:
      'A field service management system gives field crews role-specific forms on an offline-first app: every action queues locally and syncs the moment connectivity returns. The back office sees the work as it happens — photo, geo-stamp and signature on file — so tomorrow is planned against what actually happened today.',
  },
  'analytics-suite': {
    seoTitle: 'Analytics & Decision Support Suite',
    seoDescription:
      'One analytics layer pulling from every operational system, composed by role — each person sees only the KPIs that feed the decisions they actually make.',
    keywords: ['business analytics software', 'business intelligence dashboard', 'decision support software', 'operational analytics software'],
    definition:
      'This analytics and decision-support suite pulls from every operational system in a business and composes the view by role, so each person sees only the KPIs that feed the decisions they make, at the cadence those decisions live on. Every number opens its calculation, its source systems and the next action.',
  },
  'accounting-engine': {
    seoTitle: 'Accounting Engine — Books That Post Themselves',
    seoDescription:
      'Event-driven accounting for South African firms: invoices and journal entries fire from real operational events, so the books reconcile within a day.',
    keywords: ['accounting software south africa', 'accounting automation software', 'automated accounting software', 'event driven accounting'],
    definition:
      'Zabble’s Accounting Engine is an event-driven accounting layer: operational systems emit events — projects signed, milestones shipped, deposits received — and the engine writes the right artefact, from a deposit invoice to a journal entry to a bank match. Rules are configuration, so VAT treatment and cost-centre splits change without engineering.',
  },
  'compliance-reporting': {
    seoTitle: 'Compliance & Regulatory Reporting Engine',
    seoDescription:
      'POPIA filings, SARB returns and donor reports — assembled from data you already generate, validated against the rule pack, every figure traced to source.',
    keywords: ['popia compliance', 'regulatory reporting software', 'regulatory reporting automation', 'compliance reporting software'],
    definition:
      'A regulatory reporting engine knows which systems each submission draws from, pulls the data itself, validates it live against the regulator’s rule pack, and traces every figure back to its source row. The same engine produces a SARB banking return, a POPIA filing, an NGO donor report or a tax submission.',
  },
  'continuous-assurance': {
    seoTitle: 'Continuous Assurance Engine',
    seoDescription:
      'Background monitoring across a stream no human could watch — fraud, drift and failure surfaced with evidence attached, detection cut from days to seconds.',
    keywords: ['transaction monitoring software', 'continuous monitoring software', 'aml transaction monitoring'],
    definition:
      'A continuous assurance engine monitors a high-traffic stream of activity — card transactions, CRM events, sensor telemetry — applies the right detector to each event, and surfaces only the cases that matter, each with its rule, history and suggested action recorded in an immutable, case-keyed audit trail.',
  },
  'pricing-engine': {
    seoTitle: 'Pricing & Quote Engine (CPQ)',
    seoDescription:
      'List price, tier discount, volume break and override composed into one number — a margin floor blocks underwater deals and routes breaches for sign-off.',
    keywords: ['cpq software', 'pricing engine software', 'quote management software', 'quoting software'],
    definition:
      'A pricing and quote (CPQ) engine composes the correct price from every rule that applies — list price, tier discount, volume break, contract override, manual discount — blocks anything below the margin floor, and routes breaches to the right approver before the quote goes out. The audit trail is the quote.',
  },
  'reconciliation-engine': {
    seoTitle: 'Reconciliation Engine',
    seoDescription:
      'Ingests POS, bank, processor and accounting ledgers, auto-matches the routine cases, and surfaces only the exceptions that need a person.',
    keywords: ['bank reconciliation software', 'reconciliation software', 'automated bank reconciliation', 'account reconciliation software'],
    definition:
      'A reconciliation engine ingests every ledger as it lands — POS, bank, accounting, processor, inventory — matches the easy cases in seconds, and sends only the mismatches that need a human to the queue. Resolve one by hand and it saves the rule, so the same kind of exception auto-clears next time.',
  },
  'data-routing': {
    seoTitle: 'Data Routing Pipeline',
    seoDescription:
      'One pipeline that reads from every system you run and generates the board pack, donor report or regulator return — every figure traceable to its source.',
    keywords: ['data pipeline software', 'data integration platform', 'automated reporting software', 'regulatory reporting pipeline'],
    definition:
      'A data routing pipeline reads from every system a team already runs and assembles a clean, governed output — a board pack, a donor report, a regulator return. Classify, join, validate, aggregate, render: the rule pack for the chosen output decides which transforms fire, and every figure’s lineage unrolls back to its source row.',
  },
  'integration-hub': {
    seoTitle: 'Integration Hub',
    seoDescription:
      'The connective tissue between the tools you already run — a new booking, order or lead reaches every system that should know, the moment it happens.',
    keywords: ['integration platform', 'system integration software', 'api integration platform', 'business systems integration'],
    definition:
      'An integration hub sits between every tool a business runs and forwards each event to every other system that should hear about it — transformed on the way, with its trail attached. New bridges are point-and-click, so the stack stops being eight islands with a person paddling between them.',
  },
  'cross-system-sync': {
    seoTitle: 'Cross-System Sync Engine',
    seoDescription:
      'Keeps every shared record identical across two systems — edits on either side land on both in seconds, and conflicts resolve by the rule you set.',
    keywords: ['data synchronization software', 'real time data sync', 'system sync software', 'two way data sync'],
    definition:
      'A cross-system sync engine keeps every shared record identical across two systems: an edit on either side lands on the other in seconds. Direction is configurable — one-way where one system is the source of truth, bi-directional for true peers — and field-level conflicts resolve by an explicit, audited rule.',
  },
  'forecasting': {
    seoTitle: 'Forecasting & Demand Planning',
    seoDescription:
      'A forecast trained on your own history, with weather, events and promos as inputs you can move — and recommendations that push to the systems you already use.',
    keywords: ['demand forecasting software', 'demand planning software', 'sales forecasting software', 'inventory forecasting software'],
    definition:
      'A demand forecasting system projects a business’s own history forward, taking weather, local events, promotions and trend as inputs the team can adjust, and shows a confidence band that widens when the model is unsure. Its recommendations — orders, rotas, cash buffers — push to the systems the team already uses.',
  },
  'predictive-maintenance': {
    seoTitle: 'Predictive Maintenance System',
    seoDescription:
      'Pulls vibration, temperature and oil data into one model per asset class, predicts days-to-failure, and books the repair before the breakdown happens.',
    keywords: ['predictive maintenance software', 'condition monitoring software', 'predictive maintenance system', 'machine failure prediction'],
    definition:
      'A predictive maintenance system pulls vibration, temperature, oil-analysis and run-hour data into one model per asset class, predicts days-to-failure with a confidence band, and auto-schedules the intervention at the lowest-cost downtime window — shifting maintenance from calendar-driven to condition-driven.',
  },
  'master-data-hub': {
    seoTitle: 'Master Data Hub (MDM)',
    seoDescription:
      'One canonical record per customer, supplier and product — edit it once and every downstream system agrees within two seconds, by an explicit, audited rule.',
    keywords: ['mdm software', 'master data management', 'master data management software', 'golden record software'],
    definition:
      'A master data hub holds the golden record for every entity a business runs on — customer, supplier, product, employee, asset — and fans each edit out to every downstream system in under two seconds. A direct edit downstream competes with the hub, and the rule that resolves the conflict is explicit, configurable and audited.',
  },
  'notification-orchestration': {
    seoTitle: 'Notification & Alert Orchestration',
    seoDescription:
      'One rule engine decides who hears about what, on which channel, at what hour — critical events override everything; the rest route by role and quiet hours.',
    keywords: ['alert management software', 'notification management software', 'incident alerting software', 'alert orchestration software'],
    definition:
      'A notification orchestration engine sits between every source system and every channel, deciding who hears about what, where and when. Severity and conditions decide the recipient, channel preferences decide where, and quiet hours decide whether it can wait — while critical events override every rule and reach a human in seconds.',
  },
}

// Merge SEO data onto the live SYSTEMS entries once, at module load.
for (const sys of SYSTEMS) {
  const seo = SYSTEM_SEO[sys.slug]
  if (seo) Object.assign(sys, seo)
}

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

// ---------------------------------------------------------------------------
// AEO content merge (S07).
//
// Per-system answer-first blocks + FAQs live in ./aeo-content.ts (AEO_CONTENT),
// the single editable source authored to docs/seo/content/aeo-standard.md.
// Questions are shaped from real South-African SERP People-Also-Ask data in
// docs/seo/_evidence/07/. They are merged onto the matching system objects at
// module load so a page reads system.answer / system.faqs directly — and the
// SAME strings are exposed for S03/S08 to attach byte-identical FAQPage /
// QAPage JSON-LD. Regression tests in test/aeo.spec.ts enforce the 40-60 word
// budget, the >=3 FAQ minimum, and data<->rendered-HTML byte-consistency.
// ---------------------------------------------------------------------------
for (const sys of SYSTEMS) {
  const aeo = AEO_CONTENT[sys.slug]
  if (aeo) {
    sys.answer = aeo.answer
    sys.faqs = aeo.faqs
  }
}
