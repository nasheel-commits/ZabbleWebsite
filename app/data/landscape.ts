// Data for the linkbait / citation asset: "The South African Operations-Software
// Landscape" (audits/04-offpage-local.md §5 R2 — the recommended link magnet).
//
// A genuinely useful reference: the categories of operational software a South
// African business runs, what each does, where off-the-shelf tools stop, and where
// bespoke fits. Structured for citation (each category is a stable, anchorable
// entity) and for internal linking into Zabble's system pages.
//
// Editorial discipline: NO fabricated market statistics. The value is the taxonomy
// and the build-vs-buy judgement, both defensible without invented numbers. Any
// future hard data must be sourced (conventions §6).
//
// Owner: S04 (asset) / S06 (editorial). Schema: S08 (Article + ItemList).

export interface SoftwareCategory {
  /** Stable anchor id → deep-linkable / citable. */
  id: string
  /** Category name. */
  name: string
  /** What this category of software does. */
  whatItIs: string
  /** Representative off-the-shelf tool types (generic, not endorsements). */
  offTheShelf: string
  /** Where off-the-shelf stops and bespoke earns its keep. */
  whereBespokeFits: string
  /** Zabble system slugs that play in this category. */
  systemSlugs: string[]
}

export const LANDSCAPE_CATEGORIES: SoftwareCategory[] = [
  {
    id: 'crm-sales',
    name: 'Customer & Sales (CRM)',
    whatItIs: 'Software that records customers, tracks the pipeline, and runs the sales motion from first touch to close.',
    offTheShelf: 'Horizontal CRMs and sales suites with fixed stages and add-on marketplaces.',
    whereBespokeFits: 'When the way you actually sell stops matching the vendor\'s stages — multi-channel deals, site visits, quoting quirks — and the team starts duct-taping the gaps in spreadsheets and WhatsApp.',
    systemSlugs: ['bespoke-crm', 'customer-360', 'lead-qualifier'],
  },
  {
    id: 'workflow-automation',
    name: 'Workflow & Process Automation',
    whatItIs: 'Software that moves work between people and systems by rule — approvals, handoffs, and event-driven sequences.',
    offTheShelf: 'No-code automation builders and point-to-point connectors.',
    whereBespokeFits: 'When one business event has to land cleanly across six systems with retries, fallbacks and an audit trail — the point where brittle "zaps" start failing silently.',
    systemSlugs: ['workflow-orchestrator', 'approval-workflow', 'notification-orchestration'],
  },
  {
    id: 'document-processing',
    name: 'Document Processing & Assembly',
    whatItIs: 'Software that reads inbound documents and assembles outbound ones — extraction, classification, routing, and generation.',
    offTheShelf: 'OCR services, template/merge tools, and e-signature platforms.',
    whereBespokeFits: 'When the documents are messy and high-volume, the validation rules are yours, and "where did this field come from?" has to be answerable a year later.',
    systemSlugs: ['document-intelligence', 'document-assembly', 'knowledge-assistant'],
  },
  {
    id: 'finance-operations',
    name: 'Finance & Accounting Operations',
    whatItIs: 'Software that runs the money-movement around the books — invoicing, reconciliation, pricing and quoting.',
    offTheShelf: 'Accounting packages, reconciliation add-ons and CPQ tools.',
    whereBespokeFits: 'When the books lag operations by days, reconciliation eats a week, and pricing rules live across five spreadsheets nobody fully trusts.',
    systemSlugs: ['accounting-engine', 'reconciliation-engine', 'pricing-engine'],
  },
  {
    id: 'compliance-reporting',
    name: 'Compliance & Regulatory Reporting',
    whatItIs: 'Software that assembles the submissions regulators, auditors, donors and boards expect, from the data the business already holds.',
    offTheShelf: 'Spreadsheet templates, GRC suites and reporting add-ons.',
    whereBespokeFits: 'When submissions draw from many systems, must validate against a specific rule pack, and every figure has to trace to its source row — the gap a generic template can\'t close.',
    systemSlugs: ['compliance-reporting', 'data-routing'],
  },
  {
    id: 'risk-assurance',
    name: 'Risk, Fraud & Assurance',
    whatItIs: 'Software that watches a stream of activity for the costly few events and makes the recurring decision consistently.',
    offTheShelf: 'Rules engines, fraud-scoring services and monitoring tools.',
    whereBespokeFits: 'When the signal is buried in your specific data, detection has to run at volume, and every flag needs its evidence and reasoning attached for a human or an auditor.',
    systemSlugs: ['continuous-assurance', 'decision-engine'],
  },
  {
    id: 'integration-data',
    name: 'Data & Integration (iPaaS / MDM)',
    whatItIs: 'The connective tissue between systems — moving events between tools, keeping shared records in agreement, and holding the golden record.',
    offTheShelf: 'iPaaS platforms, MDM suites and ETL tools.',
    whereBespokeFits: 'When the stack includes a legacy ERP or bespoke tool nothing connects to, and the cost of two systems disagreeing — returned shipments, double-bookings — lands on the team that didn\'t cause it.',
    systemSlugs: ['integration-hub', 'cross-system-sync', 'master-data-hub', 'legacy-bridge'],
  },
  {
    id: 'analytics-decision',
    name: 'Analytics & Decision Support',
    whatItIs: 'Software that turns operational data into the specific decisions a role has to make — dashboards, forecasts, briefings.',
    offTheShelf: 'BI platforms and forecasting add-ons.',
    whereBespokeFits: 'When the dashboard has 47 widgets nobody reads, and what each role actually needs is the two numbers that drive today\'s call, composed for them.',
    systemSlugs: ['analytics-suite', 'forecasting'],
  },
  {
    id: 'operations-cases',
    name: 'Field & Case Operations',
    whatItIs: 'Software that runs work with a lifecycle — field visits, matters, onboarding, multi-role tasks across weeks.',
    offTheShelf: 'Field-service suites, ticketing tools and project trackers.',
    whereBespokeFits: 'When the work is offline-first, multi-role, or regulated, and a missed deadline or a lost record costs more than the software ever will.',
    systemSlugs: ['field-ops-app', 'task-management', 'case-management', 'client-onboarding'],
  },
  {
    id: 'inventory-assets',
    name: 'Inventory & Asset Operations',
    whatItIs: 'Software that keeps the physical world and the digital record in agreement — stock, equipment, and the things that move.',
    offTheShelf: 'Inventory modules, WMS and CMMS tools.',
    whereBespokeFits: 'When stock, books and orders never quite match, or unplanned equipment failure costs more in a day than a system costs in a year.',
    systemSlugs: ['inventory-clarity', 'predictive-maintenance'],
  },
  {
    id: 'customer-comms',
    name: 'Customer Communications',
    whatItIs: 'Software that handles inbound and outbound conversation across every channel a customer might use.',
    offTheShelf: 'Shared inboxes, helpdesks and chatbot builders.',
    whereBespokeFits: 'When customers arrive on six channels, the high-value one slips through the channel nobody watched, and the orchestration has to run in your business\'s voice.',
    systemSlugs: ['multi-channel-inbox', 'kairos'],
  },
]

export interface BuildVsBuyHeuristic {
  q: string
  a: string
}

/** Citable build-vs-buy judgement — the opinionated core of the asset. */
export const BUILD_VS_BUY: BuildVsBuyHeuristic[] = [
  {
    q: 'Is the process a source of competitive advantage?',
    a: 'If how you do it is part of why customers choose you, shaping software to it is worth it. If it\'s a commodity (payroll, email), buy.',
  },
  {
    q: 'Are you already paying people to bridge the gaps?',
    a: 'When staff spend their days copy-pasting between tools, reconciling by hand, or chasing approvals, that recurring labour is the real cost a bespoke system removes.',
  },
  {
    q: 'Does the record have to stand up later?',
    a: 'If a regulator, auditor or court might ask "where did this come from?", you need traceability the average off-the-shelf tool doesn\'t give you.',
  },
  {
    q: 'Do your rules keep changing?',
    a: 'Config-driven bespoke systems let you change pricing, policy or tax treatment without a vendor release cycle — valuable when your rules move faster than a roadmap.',
  },
  {
    q: 'Is a legacy system blocking everything?',
    a: 'When a system you can\'t replace is the wall every modern workflow stops at, a bridge beats a multi-year migration.',
  },
]
