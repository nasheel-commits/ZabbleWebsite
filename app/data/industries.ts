// Industry / solution pages — data (owned by S02 on-page).
//
// Each industry is a use-case landing page at /industries/<slug> that assembles
// the Zabble modules that vertical typically needs (the overview's "How It Comes
// Together") and targets the verified ZA industry keyword (targets/keyword-map.md,
// S03 — "Industry use-case" cluster). Structure + metadata are S02's; final
// long-form body copy is S10's. `moduleSlugs` must reference live SYSTEMS slugs.

export interface Industry {
  slug: string
  /** Display name of the vertical. */
  name: string
  /** Page H1. */
  h1: string
  /** Bare title (titleTemplate appends " · Zabble"). */
  seoTitle: string
  /** Meta description, ~150–160 chars. */
  seoDescription: string
  /** Primary intent first (cannibalisation guard), then supporting terms. */
  keywords: string[]
  /** Answer-first intro, 40–60 words, liftable. */
  intro: string
  /** Problem → what we build → what changes (structural; S10 refines prose). */
  problem: string
  whatWeBuild: string
  whatChanges: string
  /** Module slugs assembled for this vertical (must exist in SYSTEMS). */
  moduleSlugs: string[]
}

export const INDUSTRIES: Industry[] = [
  {
    slug: 'legal',
    name: 'Law firms',
    h1: 'Systems for South African law firms',
    seoTitle: 'Legal Practice Management Software, SA',
    seoDescription:
      'Bespoke systems for South African law firms — document intake, case and matter management, conveyancing tasks and client onboarding in one operating system.',
    keywords: ['legal practice management software south africa', 'software for law firms south africa', 'legal case management software'],
    intro:
      'Zabble builds bespoke systems for South African law firms — document intake, matter and case management, client onboarding and conveyancing task tracking — assembled into one operating system shaped to the firm. We start with the workflow costing the most billable hours and build the system that runs it.',
    problem:
      'A matter passes through five hands over weeks. Documents land in one inbox, deadlines in another, decisions in WhatsApp. A filing date gets missed; nobody can reconstruct who did what, when.',
    whatWeBuild:
      'Document intake that reads and routes every file, case management with SLA timers, dependency-aware task tracking for conveyancing, and two-sided client onboarding — connected, with the audit trail written by default.',
    whatChanges:
      'Missed deadlines drop sharply, audit prep becomes an export, and a new fee-earner ramps in days because the system encodes how the work runs.',
    moduleSlugs: ['document-intelligence', 'case-management', 'task-management', 'client-onboarding', 'document-assembly'],
  },
  {
    slug: 'hospitality',
    name: 'Hospitality',
    h1: 'Systems for hospitality & venues',
    seoTitle: 'Hospitality Management Software',
    seoDescription:
      'Bespoke systems for hotels and venues — AI reception, a unified guest inbox, booking-to-accounting sync and demand forecasting, shaped to how you run.',
    keywords: ['hospitality management software', 'restaurant management software south africa', 'booking management software'],
    intro:
      'Zabble builds bespoke systems for South African hospitality operators — AI reception and event orchestration, a unified guest inbox, booking-to-accounting integration and demand forecasting — assembled into one operating system, so revenue, calendar and CRM stop disagreeing and no enquiry goes unanswered.',
    problem:
      'A booking lands on one platform, the calendar on another, accounting hears about the revenue when the bookkeeper opens the folder. Enquiries arrive on six channels and the team watches one.',
    whatWeBuild:
      'AI reception that answers every call, one inbox across every channel, an integration hub that keeps booking, CRM, calendar and accounting in step, and a forecast that sizes covers and staffing.',
    whatChanges:
      'Calls stop going to voicemail, the systems agree within seconds of a booking, and the team plans against what’s actually coming, not last week’s guess.',
    moduleSlugs: ['kairos', 'multi-channel-inbox', 'integration-hub', 'reconciliation-engine', 'forecasting'],
  },
  {
    slug: 'logistics',
    name: 'Logistics & warehousing',
    h1: 'Systems for logistics & warehousing',
    seoTitle: 'Logistics Software, South Africa',
    seoDescription:
      'Bespoke logistics systems for South Africa — RFID inventory, an offline-first field app, demand forecasting and analytics: one source of truth for the floor.',
    keywords: ['logistics software south africa', 'warehouse management system south africa', 'inventory management software'],
    intro:
      'Zabble builds bespoke systems for South African logistics and warehousing operators — RFID inventory clarity, an offline-first field app, demand forecasting and role-based analytics — so stock, books and orders always agree and dispatch plans against what’s actually happening on the floor.',
    problem:
      'The warehouse says one thing, the ledger another, the order system a third. Someone walks the floor with a clipboard to find the truth — and by the time they finish, the count has moved.',
    whatWeBuild:
      'RFID readers that turn every movement into a digital event, an offline-first field app for crews and drivers, demand forecasting for reorder points, and analytics composed for each role.',
    whatChanges:
      'Cycle counts drop from a day to minutes, phantom stock disappears, and planning runs on live data instead of yesterday’s guess.',
    moduleSlugs: ['inventory-clarity', 'field-ops-app', 'forecasting', 'analytics-suite', 'predictive-maintenance'],
  },
  {
    slug: 'manufacturing',
    name: 'Manufacturing',
    h1: 'Systems for manufacturing',
    seoTitle: 'Manufacturing Software, South Africa',
    seoDescription:
      'Bespoke systems for South African manufacturers — predictive maintenance, RFID inventory, a legacy ERP bridge and master-data hub, no multi-year rewrite.',
    keywords: ['manufacturing software south africa', 'predictive maintenance software', 'erp integration software'],
    intro:
      'Zabble builds bespoke systems for South African manufacturers — predictive maintenance, RFID inventory clarity, a bridge to the legacy ERP and a master-data hub — connected into one operating system without the multi-year rewrite nobody can stomach, so the line keeps running and the data finally agrees.',
    problem:
      'A gearbox fails at 3am; the signals were in the data for weeks. Half the business runs on a 2008 ERP nobody dares migrate, the other half on one owner’s spreadsheet.',
    whatWeBuild:
      'Condition-based predictive maintenance per asset class, RFID inventory clarity, a legacy bridge that reads and writes through existing surfaces, and a master-data hub holding the golden record.',
    whatChanges:
      'Unplanned breakdowns drop because the system sees them coming, and old systems join modern workflows without a migration.',
    moduleSlugs: ['predictive-maintenance', 'inventory-clarity', 'legacy-bridge', 'master-data-hub', 'continuous-assurance'],
  },
  {
    slug: 'banking',
    name: 'Banks & FSPs',
    h1: 'Systems for banks & financial services',
    seoTitle: 'Banking Software Development, SA',
    seoDescription:
      'Bespoke systems for South African banks and FSPs — a decision engine, governed approvals, transaction monitoring, POPIA/SARB reporting and reconciliation.',
    keywords: ['banking software development south africa', 'fintech software development south africa', 'regulatory reporting software'],
    intro:
      'Zabble builds bespoke systems for South African banks and FSPs — a decision engine for consistent lending calls, governed sign-off workflows, continuous transaction monitoring, POPIA and SARB reporting, and reconciliation — woven into one governed flow where every decision and figure is traceable.',
    problem:
      'Three reviewers reach three answers on the same applicant. Quarter-end is a fortnight of spreadsheets, and when the regulator asks where a number came from, nobody can answer for ninety minutes.',
    whatWeBuild:
      'A decision engine that scores every application the same way, rule-based approval routing, background transaction monitoring, a reporting engine validated against the rule pack, and automated reconciliation.',
    whatChanges:
      'Every reviewer reaches the same call, quarter-end stops being a scramble, and auditors get a traced answer in seconds.',
    moduleSlugs: ['decision-engine', 'approval-workflow', 'continuous-assurance', 'compliance-reporting', 'reconciliation-engine'],
  },
  {
    slug: 'ngo',
    name: 'NGOs & non-profits',
    h1: 'Systems for NGOs & non-profits',
    seoTitle: 'NGO Management Software',
    seoDescription:
      'Bespoke systems for South African NGOs — beneficiary case management, donor and regulatory reporting, a data pipeline and governed grant approvals.',
    keywords: ['ngo management software', 'donor reporting software', 'grant management software'],
    intro:
      'Zabble builds bespoke systems for South African NGOs — beneficiary case management, donor and regulatory reporting, a data-routing pipeline and governed grant approvals — assembled into one operating system, so donor returns and compliance filings come from the data you already generate, not a quarter-end scramble.',
    problem:
      'Beneficiary files live across inboxes and spreadsheets. The donor report, the board pack and the regulator return each get rebuilt by hand, three weeks running, from the same data.',
    whatWeBuild:
      'Case management for beneficiary files, governed grant approvals, a data-routing pipeline that assembles each report, and a reporting engine that traces every figure to its source.',
    whatChanges:
      'Reports stop being assembled and start being generated, and a missing form stops being one audit finding away.',
    moduleSlugs: ['case-management', 'compliance-reporting', 'data-routing', 'approval-workflow', 'client-onboarding'],
  },
]

export function industryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug)
}
