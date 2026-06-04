// Industry-solution structure — one entry per vertical Zabble serves.
//
// The audit (audits/04-offpage-local.md, competitors.md §3 Cluster C) calls for an
// industry-solution layer alongside the city landings: pages that meet a buyer who
// searches by their world ("compliance reporting for banks", "case management for
// law firms") rather than by a Zabble product name. Each industry maps to the
// systems from data/systems.ts that fit it, with vertical-specific framing.
//
// Grounded in the real industries named across data/systems.ts (law firms, banks &
// lenders, NGOs, logistics, hospitality, manufacturing, professional services,
// field services). Copy is unique per industry — no clones.
//
// Owner: S04. Keyword sizing: S05. Schema: S08.

export interface IndustrySystemRef {
  slug: string
  /** Why this system matters to this industry specifically. */
  angle: string
}

export interface Industry {
  /** URL slug → /industries/<slug>. */
  slug: string
  /** Industry name. */
  name: string
  /** Unique <title>. */
  metaTitle: string
  /** Unique meta description. */
  metaDescription: string
  /** H1. */
  h1: string
  /** Eyebrow. */
  kicker: string
  /** Lead paragraph. */
  intro: string
  /** The operational reality / pain of this vertical. */
  pain: string
  /** What changes when the systems are in place. */
  outcome: string
  /** 4–6 systems with an industry-specific angle. */
  systemRefs: IndustrySystemRef[]
  /** Target search terms (S05 to size). */
  searchTerms: string[]
}

export const INDUSTRIES: Industry[] = [
  {
    slug: 'financial-services',
    name: 'Financial Services & Banking',
    metaTitle: 'Custom Software for Financial Services & Banking (South Africa) | Zabble',
    metaDescription:
      'Audit-grade systems for South African banks, lenders and fintechs — compliance reporting, reconciliation, decision engines and continuous assurance, built to fit.',
    h1: 'Operational systems for financial services that stand up to scrutiny',
    kicker: 'Industry · Financial Services',
    intro:
      'In financial services the record is the product. Every figure has to be traceable, every decision defensible, every submission on time. Zabble builds the operational systems that make all three automatic — so accuracy stops depending on someone\'s late night.',
    pain:
      'Numbers get pulled by hand from the loan book, the GL and the CRM. Underwriting decisions come out differently from different reviewers. Reconciliation eats a finance team\'s week. And when a regulator or auditor asks where a number came from, the answer takes ninety minutes of digging. The cost of one wrong submission is not paperwork — it is a SARB penalty, a POPIA fine, or a mandate lost.',
    outcome:
      'Submissions assemble themselves from source data with every figure traceable to its row. Every credit and approval decision carries its own audit trail. Reconciliation clears the easy matches and surfaces only the real exceptions. The risks that hurt most — fraud, drift, control breaks — get caught at volume, with evidence attached.',
    systemRefs: [
      { slug: 'compliance-reporting', angle: 'SARB returns, POPIA filings, tax and audit submissions — assembled from the systems they draw from, validated against the rule pack, every figure traceable.' },
      { slug: 'reconciliation-engine', angle: 'POS, bank, processor and accounting ledgers matched in the background; only the exceptions that need a human reach the queue.' },
      { slug: 'decision-engine', angle: 'Lending and credit decisions made consistently and explainably — the same applicant gets the same call, with the "why" attached.' },
      { slug: 'continuous-assurance', angle: 'Card and transaction streams monitored for fraud and drift; the costly few events surface from the routine many with their evidence ready.' },
      { slug: 'approval-workflow', angle: 'Mandate, loan and disbursement sign-offs reshape by rule and land in an evidence pack a regulator can read as-is.' },
      { slug: 'data-routing', angle: 'The same numbers rendered as a board pack, a regulator return and an internal report — one source of truth, three outputs.' },
    ],
    searchTerms: ['compliance reporting software south africa', 'reconciliation software', 'regulatory reporting automation'],
  },
  {
    slug: 'legal',
    name: 'Legal & Law Firms',
    metaTitle: 'Custom Software for Law Firms (South Africa) | Zabble',
    metaDescription:
      'Bespoke systems for South African law firms — document intelligence, case and matter management, intake automation and document assembly, with the audit trail by default.',
    h1: 'Systems that run the matter so the firm can run the law',
    kicker: 'Industry · Legal',
    intro:
      'A legal matter passes through many hands over many weeks. The firms that stay profitable are the ones where nothing falls between them. Zabble builds the systems that track every matter, read every document, and write the audit trail by default.',
    pain:
      'Documents land in one inbox, deadlines live in another, decisions get made in WhatsApp. Intake teams key fields by hand every morning. A filing date gets missed and nobody can reconstruct who said what, when. The cost is not just rework — it is a missed deadline, a compliance finding, or a client who walks.',
    outcome:
      'Every document is read, classified and routed the moment it lands; humans see only the exceptions. Every matter moves across a board with SLA timers and escalations that fire themselves. Intake, proposals and engagement letters assemble from live sources. And reconstructing any decision takes one click.',
    systemRefs: [
      { slug: 'document-intelligence', angle: 'The intake desk reads every document, pulls the fields, checks the structure and routes the work — built originally for a South African law firm.' },
      { slug: 'case-management', angle: 'Every matter, owner and deadline tracked end to end, with the audit trail written by default and escalations on SLA breach.' },
      { slug: 'task-management', angle: 'Multi-role workflows — a transfer touching three roles over eleven weeks — with dependencies that recompute when one step slips.' },
      { slug: 'client-onboarding', angle: 'KYC, file setup and engagement run as a two-sided workflow; the client moves through their part while the firm\'s part runs in lockstep.' },
      { slug: 'document-assembly', angle: 'Contracts, engagement letters and statements assembled from the CRM and matter record, every field traceable to its source.' },
    ],
    searchTerms: ['case management software for law firms', 'legal document automation', 'law firm software south africa'],
  },
  {
    slug: 'ngos',
    name: 'NGOs & Non-Profits',
    metaTitle: 'Custom Software for NGOs & Non-Profits (South Africa) | Zabble',
    metaDescription:
      'Bespoke systems for South African NGOs — donor and regulatory reporting, beneficiary case management and document assembly, with full traceability for funders and audits.',
    h1: 'Systems that turn the data you already hold into the reports funders trust',
    kicker: 'Industry · NGOs & Non-Profits',
    intro:
      'Non-profits run on trust — of donors, regulators and boards — and trust runs on evidence. Zabble builds the systems that turn the data an NGO already generates into reports that hold up, without the quarter-end scramble.',
    pain:
      'The same numbers get assembled three ways — board pack, donor report, regulator return — three weeks running, by people emailing spreadsheets back and forth. A missing form is one audit finding away from a donor walking back next year\'s grant. And beneficiary records live in inboxes nobody can fully reconstruct.',
    outcome:
      'Reports generate from one source of truth, every figure traceable to its row. Beneficiary cases run on an engine with the audit trail built in. Submissions and acquittals assemble themselves. When a funder or auditor asks where a figure came from, the answer is one click.',
    systemRefs: [
      { slug: 'data-routing', angle: 'Board pack, donor report and regulator return generated from the same source data — built for a South African mutual bank with a development-foundation arm.' },
      { slug: 'compliance-reporting', angle: 'Donor reports, POPIA filings and grant acquittals assembled from source systems and validated before submission.' },
      { slug: 'case-management', angle: 'Beneficiary files and programme cases tracked end to end, with every action recorded once and never edited.' },
      { slug: 'document-assembly', angle: 'Grant proposals, acquittals and board reports assembled from live data instead of rebuilt by copy-paste.' },
      { slug: 'approval-workflow', angle: 'Grant and disbursement sign-offs reshape by rule, with an evidence pack ready for the funder or auditor.' },
    ],
    searchTerms: ['ngo reporting software', 'donor reporting automation', 'nonprofit management software south africa'],
  },
  {
    slug: 'logistics',
    name: 'Logistics & Supply Chain',
    metaTitle: 'Custom Software for Logistics & Supply Chain (South Africa) | Zabble',
    metaDescription:
      'Bespoke systems for South African logistics and distribution operators — inventory clarity, demand forecasting, field operations and event-driven orchestration.',
    h1: 'Systems that keep the physical and the digital in agreement',
    kicker: 'Industry · Logistics & Supply Chain',
    intro:
      'In logistics the goods move faster than the systems tracking them, and the gap is where margin leaks. Zabble builds the systems that close it — so stock, books and orders stop disagreeing, and the team plans against what actually happened.',
    pain:
      'The warehouse says one thing, the ledger says another, the order system says a third. Someone walks the floor with a clipboard to find out which is true — and by the time they finish, the count has moved. An order should fan out across six systems; instead someone copy-pastes between them the next morning. Tomorrow gets planned against yesterday\'s guess.',
    outcome:
      'Every physical motion becomes a digital event — the floor plan, the ledger and the order update together. One event fans out across every downstream system in seconds. Demand forecasts from your own history land on the screens the team already opens. And work created in the field produces clean back-office data, even where signal drops out.',
    systemRefs: [
      { slug: 'inventory-clarity', angle: 'RFID at every gate and bay means the building counts itself — stock, books and orders agree within two seconds of a motion.' },
      { slug: 'workflow-orchestrator', angle: 'An order or shipment event fans out across invoicing, stock, dispatch and customer comms automatically, with retries and escalation.' },
      { slug: 'forecasting', angle: 'Demand and reorder points forecast from your own history, pushed to the supplier portal and PO drafts the team already uses.' },
      { slug: 'field-ops-app', angle: 'Drivers and crews work offline-first; the back office sees the work as it happens or as the van rolls back into range.' },
      { slug: 'cross-system-sync', angle: 'Warehouse stock and storefront kept identical; edits on either side land on both within seconds.' },
      { slug: 'predictive-maintenance', angle: 'Fleet and plant failures caught weeks early, with the repair booked before the breakdown.' },
    ],
    searchTerms: ['logistics software south africa', 'inventory management software', 'supply chain automation'],
  },
  {
    slug: 'hospitality',
    name: 'Hospitality & Events',
    metaTitle: 'Custom Software for Hospitality & Events (South Africa) | Zabble',
    metaDescription:
      'Bespoke systems for South African hospitality and events operators — multi-channel inbox, demand forecasting, lead qualification and day-of orchestration.',
    h1: 'Systems that let a lean hospitality team run like a large one',
    kicker: 'Industry · Hospitality & Events',
    intro:
      'Hospitality lives on attention — to the guest, the booking, the moment. The operators who scale without losing it are the ones whose admin runs itself. Zabble builds the systems that answer, qualify, forecast and orchestrate, so the team can do the work humans should.',
    pain:
      'Customers arrive on six channels; the team watches the channel they own and misses the high-value booking in the one they forgot. The good lead queues behind nine price-shoppers. Saturday\'s staffing is a Friday-afternoon guess. And the day-of coordination for an event turns one person into a switchboard for weeks.',
    outcome:
      'Every channel lands in one inbox, routed in seconds. Qualified intake routes the serious enquiry to a human the same hour and handles the rest. Demand forecasts size covers, stock and rotas from real history. And the full event arc — outreach, day-of orchestration, follow-up — runs on rails.',
    systemRefs: [
      { slug: 'kairos', angle: 'The full event arc — pre-event outreach, day-of orchestration, post-event re-engagement — plus an AI receptionist that answers the phone, so coordinators stop being switchboards.' },
      { slug: 'multi-channel-inbox', angle: 'Email, WhatsApp, web forms, social DMs and voicemail in one inbox, so the high-value booking never slips through the channel nobody was watching.' },
      { slug: 'lead-qualifier', angle: 'Every enquiry qualified before a human sees it; the serious booking reaches the right person warm, with the brief already written.' },
      { slug: 'forecasting', angle: 'Covers, stock and staffing forecast from your own seasonal history — the defining hospitality operational problem, solved.' },
      { slug: 'pricing-engine', angle: 'Rates, packages and overrides composed into one number, signed by the right person, in seconds.' },
      { slug: 'cross-system-sync', angle: 'The calendar and the booking platform kept in agreement, so double-bookings stop happening.' },
    ],
    searchTerms: ['hospitality management software', 'booking automation', 'restaurant forecasting software'],
  },
  {
    slug: 'manufacturing',
    name: 'Manufacturing & Industrial',
    metaTitle: 'Custom Software for Manufacturing & Industry (South Africa) | Zabble',
    metaDescription:
      'Bespoke systems for South African manufacturers — predictive maintenance, legacy-system bridging, continuous assurance and master data, built around the floor.',
    h1: 'Systems built around the factory floor, not a software vendor\'s template',
    kicker: 'Industry · Manufacturing & Industrial',
    intro:
      'Manufacturing runs on uptime and consistency. The operators who protect both are the ones whose systems hear failure coming and keep every record in agreement. Zabble builds those systems — around the equipment, the floor and the stack you already run.',
    pain:
      'A gearbox fails at 03:14 and production stops for nine hours — the signals were in the data for weeks, but nobody read them together. Half the business runs on a 2008 ERP nobody dares migrate, and every modern workflow stops at its walls. Sales has one version of the customer, finance another, shipping a third — and the courier keeps returning the order.',
    outcome:
      'Equipment failures get predicted weeks out, with the part reserved and the downtime window booked. Legacy systems keep doing their job and finally participate in modern workflows, without a risky migration. One canonical record per customer, supplier and product — edited once, agreed everywhere within two seconds.',
    systemRefs: [
      { slug: 'predictive-maintenance', angle: 'Vibration, temperature and oil data per asset predict days-to-failure, auto-reserve the part and book the cheapest downtime window.' },
      { slug: 'legacy-bridge', angle: 'Read and write through each legacy system\'s existing surface — keep the ERP and the bespoke tool, connect them to modern AI workflows without rewriting them.' },
      { slug: 'continuous-assurance', angle: 'Sensor telemetry and process streams monitored for drift and equipment anomaly, with evidence attached to every flag.' },
      { slug: 'master-data-hub', angle: 'One golden record per customer, supplier and product, fanned out to every downstream system in under two seconds.' },
      { slug: 'inventory-clarity', angle: 'Raw materials and finished goods counted by the building itself — stock, books and orders in constant agreement.' },
      { slug: 'forecasting', angle: 'Demand and reorder points projected from real history, pushed to the systems planning already runs on.' },
    ],
    searchTerms: ['predictive maintenance software', 'manufacturing software south africa', 'erp integration south africa'],
  },
  {
    slug: 'professional-services',
    name: 'Professional Services & Consulting',
    metaTitle: 'Custom Software for Professional Services & Consulting | Zabble',
    metaDescription:
      'Bespoke systems for South African consulting and professional firms — document assembly, a CRM shaped to how you sell, pricing engines and event-driven accounting.',
    h1: 'Systems that let a professional firm bill its expertise, not its admin',
    kicker: 'Industry · Professional Services',
    intro:
      'Professional firms sell judgement, then lose hours to the admin around it — proposals rebuilt by copy-paste, pipelines spread across tabs, books that lag the work by weeks. Zabble builds the systems that take the admin back, so the firm sells its expertise instead.',
    pain:
      'A partner copy-pastes a proposal for two hours with the CRM, the pricing sheet and three Slack threads open at once. The pipeline lives in three places and reps stop trusting it. Sales signs a project on Monday; finance hears about it on Thursday; the invoice goes out the following Tuesday, if someone remembers.',
    outcome:
      'Proposals, contracts and statements assemble from live sources in minutes, every field traceable. The CRM mirrors how the firm actually sells, and stage moves run the right automation. Quotes compose the right number, signed by the right person, in seconds. And the books reconcile to within a day of operations.',
    systemRefs: [
      { slug: 'document-assembly', angle: 'Proposals, contracts, statements and board reports assembled from the CRM, pricing engine and case-study library — a two-hour proposal becomes eight minutes.' },
      { slug: 'bespoke-crm', angle: 'A CRM shaped around how your team sells — stages, automations and dashboards that mirror your business, not a vendor playbook.' },
      { slug: 'pricing-engine', angle: 'Scopes and rates composed into one number with a margin floor and approval routing before the quote goes out.' },
      { slug: 'accounting-engine', angle: 'Books that move when the business does — invoices and journal entries fire from real events, not month-end memory.' },
      { slug: 'client-onboarding', angle: 'A two-sided onboarding workflow that takes time-to-active from weeks to days, with nothing left in limbo.' },
      { slug: 'knowledge-assistant', angle: 'The firm\'s SOPs, contracts and pricing rules become a system that answers the team\'s questions, every claim cited.' },
    ],
    searchTerms: ['professional services automation', 'proposal automation software', 'consulting crm south africa'],
  },
  {
    slug: 'field-services',
    name: 'Field Services',
    metaTitle: 'Custom Software for Field Services (South Africa) | Zabble',
    metaDescription:
      'Bespoke systems for South African field-services operators — offline-first field apps, smart notification routing and dependency-aware task management.',
    h1: 'Systems for work that happens where the signal drops out',
    kicker: 'Industry · Field Services',
    intro:
      'Field-services value is created on rooftops, in basements and in vans — and lost on the way back to the depot, retyped from paper in the wrong order with the photo missing. Zabble builds the systems that capture the work in the field and deliver clean data to the office.',
    pain:
      'The job happens where signal drops out; the data lands later, on paper, retyped by an admin. Dispatch reads the calendar and guesses where crews actually are. Every system shouts every alert at everyone, so the team mutes the channel and the one that mattered goes unread. And a job that touches several roles stalls quietly until the customer phones.',
    outcome:
      'A role-shaped field app works offline by default and syncs the moment connectivity returns. A central rule engine decides who hears about what, on which channel, at what hour — so signal reaches the right phone and noise stops. And dependency-aware task management means a slip in one step reshapes the timeline before it surprises anyone.',
    systemRefs: [
      { slug: 'field-ops-app', angle: 'Installer, inspector, driver — same shell, role-specific forms, offline-first, with geo-stamp, photo and signature on every visit.' },
      { slug: 'notification-orchestration', angle: 'One rule engine decides who hears about what, on which channel, at what hour — critical events override everything, noise gets suppressed.' },
      { slug: 'task-management', angle: 'Multi-role jobs with dependencies that recompute when a step slips, so nothing surprises a supervisor the morning of.' },
      { slug: 'integration-hub', angle: 'The booking, scheduling, accounting and CRM tools a field operator runs finally agree the moment a job is booked or closed.' },
    ],
    searchTerms: ['field service management software', 'field operations app', 'offline field app south africa'],
  },
]

export function industryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug)
}

export const INDUSTRY_SLUGS: string[] = INDUSTRIES.map((i) => i.slug)
