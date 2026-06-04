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

/**
 * AEO answer block — a question-led heading paired with a self-contained,
 * 40–60 word answer that an answer engine (featured snippet, People Also Ask,
 * AI Overview) can lift verbatim. See docs/seo/content/aeo-standard.md.
 */
export interface AnswerBlock {
  /** The question, phrased as a user would ask it. Rendered as a heading. */
  question: string
  /** Self-contained answer, 40–60 words, liftable without surrounding context. */
  answer: string
}

/** A single FAQ entry. Feeds on-page FAQs and (via S03) FAQPage JSON-LD. */
export interface Faq {
  question: string
  answer: string
}

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
  /**
   * AEO answer-first block — a "What is …?" question answered in 40–60 words,
   * rendered high on the detail page. Populated from `AEO_CONTENT` below.
   */
  answer?: AnswerBlock
  /**
   * AEO FAQ set — question-shaped Q&A targeting People Also Ask. Rendered
   * server-side near the foot of the detail page and exposed for S03 to attach
   * FAQPage JSON-LD. Populated from `AEO_CONTENT` below.
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
// AEO content (S07) — answer-first blocks + FAQs for the highest-value pages.
//
// Authored to the answer-block standard in docs/seo/content/aeo-standard.md:
// a question-led heading, a self-contained 40–60 word answer first, then the
// page's existing detail. Questions are shaped from real South-African SERP
// People-Also-Ask data captured in docs/seo/_evidence/07/. Answers stay true to
// Zabble's bespoke model — outcomes are framed as representative ("in a Zabble
// build"), never guaranteed. Kept in a separate map so the 32 system objects
// above stay untouched; merged onto the systems at module load.
//
// Remaining systems are populated as their per-page question sets are
// researched (see audits/07-aeo.md §4). The page + components already render
// any system that has `answer`/`faqs`, so filling more is data-only.
// ---------------------------------------------------------------------------

const AEO_CONTENT: Record<string, { answer: AnswerBlock; faqs: Faq[] }> = {
  'bespoke-crm': {
    answer: {
      question: 'What is a bespoke CRM?',
      answer:
        'A bespoke CRM is a customer relationship management system built around how your team actually sells — your real pipeline stages, automations, and channels — instead of a generic template. Moving a deal between stages triggers the right work automatically, and every interaction lands on one timeline, so the pipeline reflects what is really happening.',
    },
    faqs: [
      {
        question: 'How is a bespoke CRM different from an off-the-shelf CRM?',
        answer:
          'An off-the-shelf CRM makes your team fit its stages and fields. A bespoke CRM is shaped to your real pipeline: stages match how you sell, automations fire at the right step, and every channel lands on one deal timeline. Zabble builds it around your process, not someone else’s playbook.',
      },
      {
        question: 'When should a business build a bespoke CRM?',
        answer:
          'Build a bespoke CRM when your pipeline lives in three places that disagree, your stages don’t match how you actually sell, or reps have stopped trusting the system. If an off-the-shelf tool forces workarounds for site visits, quotes, or e-sign steps, a system shaped to your process usually pays back quickly.',
      },
      {
        question: 'How much does a bespoke CRM cost in South Africa?',
        answer:
          'Cost depends on how much of the pipeline it automates and how many systems it connects. A focused CRM for one sales team costs far less than one wired into quoting, e-sign, and ops. Zabble scopes it in a discovery session, so the price is set against your process before any build starts.',
      },
      {
        question: 'Can a bespoke CRM connect to our existing tools?',
        answer:
          'Yes. Zabble builds the CRM to sit on top of the tools you already run — email, WhatsApp, quoting, e-sign, accounting — so every interaction lands on one deal timeline. Where a system can’t be replaced, we bridge to it rather than forcing a migration.',
      },
    ],
  },
  'document-intelligence': {
    answer: {
      question: 'What is a document intelligence system?',
      answer:
        'A document intelligence system reads each document the moment it arrives, extracts and validates the fields, and routes it where it belongs — so a team only handles the exceptions. It replaces manual data entry from invoices, IDs, statements, and forms with an intake pipeline where every extraction and routing decision is timestamped and replayable.',
    },
    faqs: [
      {
        question: 'What is document automation?',
        answer:
          'Document automation is software that reads incoming documents, pulls the required fields, checks them against rules, and routes the work — without a person keying data by hand. In a Zabble build, intake time on a document dropped from around forty minutes to under four seconds, with humans handling only flagged exceptions.',
      },
      {
        question: 'Can document automation read scanned or handwritten forms?',
        answer:
          'Yes — OCR reads scanned documents, and validation rules catch what is unclear. Anything the system can’t confidently read is routed to a human-review tray with the exact reason it stopped, rather than guessed. Zabble tunes the classification and validation to the document shapes a specific business actually receives.',
      },
      {
        question: 'How accurate is automated document extraction?',
        answer:
          'Accuracy depends on document quality and how well the validation rules are tuned. Rather than trusting every read, a well-built system validates structure — ID checksums, statement totals, signature blocks — and sends low-confidence cases to a person. The goal isn’t zero human involvement; it is that people only see the exceptions.',
      },
      {
        question: 'What documents can it process?',
        answer:
          'Invoices, IDs, bank statements, KYC packets, applications, contracts, and correspondence — any back-office paper where the same fields are keyed by hand each day. Zabble sits with the intake team first, because the routing rules differ by business, then builds the pipeline around the documents that actually arrive.',
      },
    ],
  },
  'reconciliation-engine': {
    answer: {
      question: 'What is reconciliation automation?',
      answer:
        'Reconciliation automation matches transactions across ledgers — POS, bank, accounting, processor, inventory — in the background, clearing the easy matches in seconds and surfacing only the exceptions that need a person. It turns a weekly export-and-chase across three sources of truth into a short queue of real mismatches, with each resolved rule reused next time.',
    },
    faqs: [
      {
        question: 'Can bank reconciliation be automated?',
        answer:
          'Yes. A reconciliation engine ingests each ledger as it lands, auto-matches transactions that agree, and routes only genuine mismatches to a person. In a Zabble build, a queue of around ten thousand lines became a handful of real exceptions — and resolving one by hand teaches the engine to auto-clear that kind next time.',
      },
      {
        question: 'Can AI be used for reconciliation?',
        answer:
          'AI helps where rules alone fall short — learning resolution patterns so recurring exceptions clear themselves. Zabble pairs explicit matching rules with learned ones, so the engine stays auditable: every match carries the rule that made it. The aim is fewer manual matches, not a black box finance can’t explain.',
      },
      {
        question: 'What ledgers can a reconciliation engine match?',
        answer:
          'POS against bank and processor, accounting against inventory and invoices, processor against invoices — any pair or set of ledgers that should agree but never quite do. The same engine handles different ledger combinations; only the matching rules change for each source.',
      },
      {
        question: 'How long does automated reconciliation take?',
        answer:
          'Easy matches clear in seconds as each ledger lands, so finance stops waiting for a weekly export. The work that remains is the small set of true exceptions a person actually needs to judge — turning reconciliation from data entry into decisions.',
      },
    ],
  },
  'continuous-assurance': {
    answer: {
      question: 'What is anomaly detection in business?',
      answer:
        'Anomaly detection in business is automated monitoring that watches a stream of activity — transactions, operations, sensor data — and flags what is unusual before it becomes a problem: the fraud, the error, the drift, the outlier. Zabble’s engine surfaces only the cases that matter, each with the rule, history, and suggested action attached.',
    },
    faqs: [
      {
        question: 'What is AI anomaly detection?',
        answer:
          'AI anomaly detection learns the shape of normal activity and flags departures from it, catching patterns fixed rules miss. Zabble compounds a bespoke rules-based decision engine with a model that learns over time, so detection improves while every flag still carries its reason — keeping the system auditable, not a black box.',
      },
      {
        question: 'What does an anomaly detection system do?',
        answer:
          'It monitors a high-traffic stream no human could realistically watch, applies detectors tuned to what counts as unusual for that business, and surfaces only the cases that matter — each with its rule, history, and suggested action. Every decision lands in an immutable audit trail keyed by case ID.',
      },
      {
        question: 'What risks can continuous monitoring catch?',
        answer:
          'Fraud in transactions, drift in operations, equipment failure, and outliers in performance — risks that share one shape: a tiny signal hidden inside an ocean of normal activity. Sampling misses them; continuous monitoring catches them at volume, dropping mean time to detection from days toward seconds.',
      },
      {
        question: 'How is this different from sampling or manual review?',
        answer:
          'Manual review and sampling only ever see a fraction of activity, so the events that hurt most are the ones missed. A continuous assurance engine reads the whole stream, flags only genuine exceptions, and hands investigators cases with the evidence already attached — instead of leaving them to triage false positives by hand.',
      },
    ],
  },
  'compliance-reporting': {
    answer: {
      question: 'What is regulatory reporting automation?',
      answer:
        'Regulatory reporting automation assembles the submissions regulators, auditors, donors, and boards expect directly from the systems that already hold the data — validating each figure live against the rule pack and tracing it back to its source row. It replaces a quarter-end scramble across spreadsheets with a controlled, evidenced process auditors can follow in seconds.',
    },
    faqs: [
      {
        question: 'Can POPIA and regulatory reporting be automated?',
        answer:
          'Yes. A reporting engine knows which systems each submission draws from, pulls the data itself, and validates it against the regulator’s rule pack. The same engine can produce a SARB banking return, a POPIA filing, an NGO donor report, or a tax submission — each figure traced to the source row that produced it.',
      },
      {
        question: 'How does automated reporting reduce compliance risk?',
        answer:
          'It removes the hand-keyed spreadsheet step where wrong numbers creep in. Validations run live, exceptions surface with a one-line cause and a human action, and every figure traces to its source. A wrong submission’s cost — a SARB penalty, a POPIA fine, a donor walking — is met with an evidenced, repeatable process.',
      },
      {
        question: 'What reports can the engine produce?',
        answer:
          'Banking regulatory returns, POPIA filings, tax submissions, and donor reports — any recurring submission assembled from operational data. The same engine, repointed at different sources and rule packs, produces several kinds of report, so each new return reuses the validated pipeline rather than starting from scratch.',
      },
    ],
  },
  'kairos': {
    answer: {
      question: 'What is an AI receptionist?',
      answer:
        'An AI receptionist is a voice-first agent that answers calls, handles bookings and follow-up, and logs every interaction — so a team isn’t tied to the phone. Zabble’s Kairos engine acts as receptionist, event coordinator, and outbound caller, running the full arc around an event and never sending a call to voicemail.',
    },
    faqs: [
      {
        question: 'What can an AI voice agent do?',
        answer:
          'It answers inbound calls, confirms and chases bookings, recovers no-shows with morning-of reminder calls, runs outbound outreach, and updates the CRM — each call and message logged with the reasoning that fired it. Kairos handles the relationship admin that normally consumes a person, at any hour and at scale.',
      },
      {
        question: 'Does an AI receptionist replace staff?',
        answer:
          'No — it removes the switchboard work so staff do the work only people can. Kairos answers what would otherwise go to voicemail and handles routine confirmations and follow-up; anything needing judgment still reaches a person, with the context already attached. The goal is freeing the team, not removing it.',
      },
      {
        question: 'What businesses is a voice agent for?',
        answer:
          'Event businesses running conferences, expos, or weddings; any business needing a reception line answered after hours or at scale; and clinics, agencies, and service firms fielding constant inbound — anywhere the cost of a missed call or a dropped follow-up is a lost booking.',
      },
    ],
  },
  'workflow-orchestrator': {
    answer: {
      question: 'What is workflow automation?',
      answer:
        'Workflow automation makes one business event trigger the right action in every other system automatically — no copy-paste between tools. Zabble’s orchestrator listens for events like a new order and fans them out across invoicing, stock, dispatch, and CRM, with retries, fallbacks, and a human escalation of last resort, every step logged.',
    },
    faqs: [
      {
        question: 'What is an example of workflow automation?',
        answer:
          'A new order fires once and, within seconds, becomes an invoice, a stock update, a dispatch ticket, a CRM record, and a customer email — instead of someone copy-pasting between six tools the next morning. If a step fails it retries, then falls back, then pages a person with the reason attached.',
      },
      {
        question: 'How is workflow automation different from a Zap or script?',
        answer:
          'Simple zaps break quietly and forget steps. An event-driven orchestrator retries on failure, falls back when retries fail, escalates to a human as a last resort, and logs every signal — fired, succeeded, failed, escalated — in an immutable event log. Workflows reshape from config, so adding a step needs no re-engineering.',
      },
      {
        question: 'Can workflows change without engineering?',
        answer:
          'Yes. Steps are configuration, not code — add a “notify supplier” step after dispatch and the next run includes it. That keeps the system in the hands of the business rather than waiting on a developer for every change.',
      },
    ],
  },
}

// Merge the AEO content onto the matching system objects at module load. Keeps
// answer/faqs co-located in one editable block rather than scattered across the
// 32 large system literals above.
for (const sys of SYSTEMS) {
  const aeo = AEO_CONTENT[sys.slug]
  if (aeo) {
    sys.answer = aeo.answer
    sys.faqs = aeo.faqs
  }
}
