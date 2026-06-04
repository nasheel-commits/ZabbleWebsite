// ZA local-SEO landing data — one entry per metro Zabble targets.
//
// Evidence (docs/seo/_evidence/04/): the dominant search intent in Zabble's market
// is geo-modified — "{software | IT | tech} company + {city}" — across every metro
// (Durban 720, Pretoria 480, Cape Town 480, Sandton 260, Johannesburg 210/mo,
// DataForSEO Labs, South Africa, 2026-06-04). Competitors win these with
// programmatic local pages; Zabble had none. These are the source for real,
// server-rendered local landings.
//
// CRITICAL: each city carries genuinely distinct copy (economy, sectors, why local
// delivery matters, which systems fit the local industry mix). Google penalises
// near-duplicate "doorway" local pages — so no boilerplate clones. The fields below
// are written per-city; the page composes 250+ unique words from them.
//
// Coordinates are public metro centroids used for schema `areaServed`/`Place` — NOT
// the business address (that's NAP, pending; see nap.ts).
//
// Owner: S04 (off-page/local). Keyword sizing: S05. Schema: S08.

export interface LocationSystemRef {
  /** A system slug from data/systems.ts. */
  slug: string
  /** City-specific reason this system matters to local operators. */
  angle: string
}

export interface Location {
  /** URL slug → /locations/<slug>. */
  slug: string
  /** City name, exact. */
  city: string
  /** Province. */
  province: string
  /** Region label for breadcrumbs/intro. */
  region: string
  /** Unique <title>. */
  metaTitle: string
  /** Unique meta description (≤ ~158 chars). */
  metaDescription: string
  /** H1. */
  h1: string
  /** Eyebrow/kicker above the H1. */
  kicker: string
  /** Lead paragraph — unique, specific to the city. */
  intro: string
  /** Local economic context — what this metro actually runs on. */
  economy: string
  /** Why on-the-ground / same-timezone delivery matters to operators here. */
  whyLocal: string
  /** Local sectors Zabble is well-suited to (display chips). */
  sectors: string[]
  /** Suburbs / nodes the page names for local relevance (also areaServed). */
  nearbyAreas: string[]
  /** 4–6 relevant systems with a city-specific angle. */
  systemRefs: LocationSystemRef[]
  /** Industry pages most relevant to this metro. */
  industrySlugs: string[]
  /** Target search terms (from evidence) — used by tests + S05. */
  searchTerms: string[]
  /** Public metro centroid for schema areaServed/Place. */
  geo: { lat: number; lng: number }
}

export const LOCATIONS: Location[] = [
  {
    slug: 'johannesburg',
    city: 'Johannesburg',
    province: 'Gauteng',
    region: 'Gauteng',
    metaTitle: 'Custom Software & Business Automation in Johannesburg | Zabble',
    metaDescription:
      'Bespoke operational systems for Johannesburg businesses — automation, audit trails and analytics built around the problem slowing your operation down.',
    h1: 'Bespoke operational systems for Johannesburg businesses',
    kicker: 'Johannesburg · Gauteng',
    intro:
      'Johannesburg runs at volume. The businesses that win here are the ones whose operations keep pace with their growth — and that is exactly where off-the-shelf software starts to crack. Zabble builds the custom system that fits how your Joburg operation actually works, not the other way round.',
    economy:
      'Joburg is the engine room of the South African economy: financial services, mining and resources head offices, wholesale and distribution, logistics across the N1 and N3 corridors, and the densest concentration of SMMEs in the country. The common thread is scale and complexity — multiple systems, multiple sites, and processes that were designed for a smaller business and never re-cut as the company grew.',
    whyLocal:
      'We work in your timezone, on your operation, with people who can sit in the room. For a Johannesburg business that means discovery happens on your floor — we watch the actual handoffs between sales, ops and finance before a line of code is written — and support happens during your working day, not someone else\'s.',
    sectors: ['Financial services', 'Logistics & distribution', 'Mining & resources services', 'Professional services', 'Wholesale & retail'],
    nearbyAreas: ['Sandton', 'Rosebank', 'Braamfontein', 'Midrand', 'Roodepoort', 'Soweto'],
    systemRefs: [
      { slug: 'workflow-orchestrator', angle: 'When one order has to land cleanly in six systems across a multi-branch Joburg operation, the orchestrator does the handoffs your team currently does by hand.' },
      { slug: 'reconciliation-engine', angle: 'High transaction volumes across POS, bank and processor make manual reconciliation a weekly tax on Joburg finance teams. The engine clears the easy matches and surfaces only the exceptions.' },
      { slug: 'integration-hub', angle: 'Most Joburg SMMEs run eight tools that pretend not to know each other. The hub makes them agree the moment something happens.' },
      { slug: 'bespoke-crm', angle: 'Sales-heavy Joburg businesses outgrow generic CRMs fast — a pipeline shaped around how you actually sell beats a vendor default.' },
      { slug: 'compliance-reporting', angle: 'Financial-services and regulated operators in Gauteng face SARB, POPIA and tax submissions — the engine assembles them from data you already generate.' },
    ],
    industrySlugs: ['financial-services', 'logistics', 'professional-services'],
    searchTerms: ['software companies in johannesburg', 'custom software johannesburg', 'business automation johannesburg'],
    geo: { lat: -26.2041, lng: 28.0473 },
  },
  {
    slug: 'sandton',
    city: 'Sandton',
    province: 'Gauteng',
    region: 'Gauteng',
    metaTitle: 'Custom Software for Sandton Financial & Professional Firms | Zabble',
    metaDescription:
      'Bespoke systems for Sandton\'s banks, asset managers and professional firms — audit-grade automation, compliance reporting and decision engines, built to fit.',
    h1: 'Custom systems for Sandton\'s financial and professional firms',
    kicker: 'Sandton · Gauteng',
    intro:
      'Sandton concentrates more financial and professional firepower per square kilometre than anywhere else on the continent — and those firms live or die on accuracy, auditability and speed. Zabble builds the operational systems that keep all three intact as volume climbs.',
    economy:
      'Sandton is South Africa\'s financial district: banks, asset and wealth managers, private equity, advisory firms, legal practices and corporate head offices. The work here is high-value and heavily scrutinised — a single mis-stated figure or a thin audit trail is not an inconvenience, it is a regulatory and reputational event.',
    whyLocal:
      'For a Sandton firm the bar is audit-grade by default. We build systems where every decision, approval and figure is replayable end to end — the kind of evidence a regulator, an auditor or a board can read as-is — and we do it close enough to sit in your offices through discovery and rollout.',
    sectors: ['Banking', 'Asset & wealth management', 'Private equity', 'Legal & advisory', 'Corporate head offices'],
    nearbyAreas: ['Rosebank', 'Bryanston', 'Morningside', 'Rivonia', 'Illovo', 'Hyde Park'],
    systemRefs: [
      { slug: 'approval-workflow', angle: 'Loan, mandate and investment sign-offs that stall in inboxes get a self-reshaping approval chain with an evidence pack a regulator can read as-is.' },
      { slug: 'decision-engine', angle: 'Underwriting and credit calls made differently by different reviewers get one consistent, explainable engine — every decision carries its own audit trail.' },
      { slug: 'compliance-reporting', angle: 'SARB returns, POPIA filings and audit submissions assemble themselves from source data, every figure traceable to its row.' },
      { slug: 'continuous-assurance', angle: 'Fraud, drift and control breaks hide in the volume a Sandton institution processes — background monitoring surfaces the costly few with evidence attached.' },
      { slug: 'document-assembly', angle: 'Mandates, proposals and statements stop being rebuilt by copy-paste and start assembling from the CRM and pricing engine, every field traceable.' },
    ],
    industrySlugs: ['financial-services', 'professional-services'],
    searchTerms: ['sandton it companies', 'it company sandton', 'software development sandton'],
    geo: { lat: -26.1076, lng: 28.0567 },
  },
  {
    slug: 'cape-town',
    city: 'Cape Town',
    province: 'Western Cape',
    region: 'Western Cape',
    metaTitle: 'Custom Software & Automation in Cape Town | Zabble',
    metaDescription:
      'Bespoke operational systems for Cape Town businesses — fintech, hospitality, retail and services. Automation and analytics built around your real workflow.',
    h1: 'Bespoke operational systems for Cape Town businesses',
    kicker: 'Cape Town · Western Cape',
    intro:
      'Cape Town builds things — software, brands, experiences. The operators who scale here are the ones whose back-office keeps up with the front-of-house. Zabble builds the custom systems that let a growing Cape Town business run lean without dropping the things that matter.',
    economy:
      'The Western Cape carries the country\'s densest fintech and tech-startup cluster, a tourism and hospitality economy that swings hard with the seasons, a strong retail and e-commerce base, and a deep services sector. The operational challenge here is variability — demand that spikes and collapses, multi-channel customers, and lean teams that cannot afford manual busywork.',
    whyLocal:
      'A Cape Town hospitality or retail operator needs a partner who understands seasonal load and multi-channel reality, and who is reachable in the same working day. We shape forecasting, inboxes and integrations around the way demand actually moves through your business — not a generic template built for a flat year.',
    sectors: ['Fintech & tech', 'Tourism & hospitality', 'Retail & e-commerce', 'Professional services', 'Media & creative'],
    nearbyAreas: ['Century City', 'Woodstock', 'Claremont', 'Bellville', 'Stellenbosch', 'V&A Waterfront'],
    systemRefs: [
      { slug: 'forecasting', angle: 'Seasonal demand is the defining Cape Town operational problem — covers, stock and staffing forecast from your own history, on the screens your team already opens.' },
      { slug: 'multi-channel-inbox', angle: 'Hospitality and retail customers arrive on six channels; one inbox means the high-value booking on the contact form never slips.' },
      { slug: 'cross-system-sync', angle: 'Inventory that disagrees with the storefront is a daily Cape Town e-commerce problem — two systems, one truth, conflicts resolved by rule.' },
      { slug: 'lead-qualifier', angle: 'Boutique operators drown good leads under price-shoppers; qualified intake routes the £45k enquiry to a human in the same hour.' },
      { slug: 'reconciliation-engine', angle: 'POS-versus-processor reconciliation across busy retail and hospitality books clears itself, leaving only real exceptions.' },
    ],
    industrySlugs: ['hospitality', 'financial-services', 'professional-services'],
    searchTerms: ['software companies cape town', 'cape town it companies', 'custom software development cape town'],
    geo: { lat: -33.9249, lng: 18.4241 },
  },
  {
    slug: 'pretoria',
    city: 'Pretoria',
    province: 'Gauteng',
    region: 'Gauteng',
    metaTitle: 'Custom Software & Compliance Systems in Pretoria | Zabble',
    metaDescription:
      'Bespoke operational systems for Pretoria\'s regulated, public-sector-adjacent and manufacturing operators — audit-grade automation and compliance reporting, built to fit.',
    h1: 'Custom systems for Pretoria\'s regulated and industrial operators',
    kicker: 'Pretoria · Gauteng',
    intro:
      'Pretoria runs on accountability. From regulated entities to manufacturers to the organisations that work alongside the public sector, the operators here are judged on whether the record holds up. Zabble builds systems where it always does.',
    economy:
      'Pretoria and Centurion concentrate regulated and public-sector-adjacent organisations, research and education institutions, automotive and component manufacturing, and a growing base of professional and technical firms. The shared demand is provability — submissions that withstand scrutiny, processes that can be reconstructed, and reporting that does not collapse into a quarter-end scramble.',
    whyLocal:
      'When the work has to be defensible, the partner has to be present. We build close enough to sit with your compliance, finance and operations teams, and we design every system so that the answer to "where did this number come from?" is one click, not ninety minutes.',
    sectors: ['Regulated & public-sector-adjacent', 'Manufacturing & automotive', 'Research & education', 'Professional services', 'Finance'],
    nearbyAreas: ['Centurion', 'Hatfield', 'Menlyn', 'Brooklyn', 'Midrand', 'Silverton'],
    systemRefs: [
      { slug: 'compliance-reporting', angle: 'Regulator, donor, board and tax submissions assemble from source data with every figure traceable — quarter-end stops being a fortnight of spreadsheets.' },
      { slug: 'case-management', angle: 'Matters that pass through many hands over weeks get one engine with SLA timers and an audit trail written by default.' },
      { slug: 'predictive-maintenance', angle: 'Pretoria\'s manufacturers turn unplanned breakdowns into scheduled interventions — the system hears failure coming weeks early.' },
      { slug: 'data-routing', angle: 'The same numbers assembled three ways — board pack, regulator return, internal report — generated from one source of truth.' },
      { slug: 'legacy-bridge', angle: 'On-prem ERPs and decade-old line-of-business tools keep doing their job and finally talk to modern workflows, without a risky migration.' },
    ],
    industrySlugs: ['financial-services', 'manufacturing', 'ngos'],
    searchTerms: ['it companies pretoria', 'it company in pretoria', 'software development pretoria'],
    geo: { lat: -25.7479, lng: 28.2293 },
  },
  {
    slug: 'durban',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    region: 'KwaZulu-Natal',
    metaTitle: 'Custom Software for Durban Logistics & Manufacturing | Zabble',
    metaDescription:
      'Bespoke operational systems for Durban\'s ports, logistics and manufacturing operators — automation, inventory clarity and field-ops, built around how the work moves.',
    h1: 'Custom systems for Durban\'s logistics and manufacturing operators',
    kicker: 'Durban · KwaZulu-Natal',
    intro:
      'Durban moves things — through the busiest port in Africa, across warehouses and factory floors, out to sites and customers. When goods move faster than the systems tracking them, the cost lands quietly. Zabble builds the systems that keep the physical and the digital in agreement.',
    economy:
      'Durban and the wider KwaZulu-Natal corridor run on ports and logistics, import-export, manufacturing, warehousing and distribution, and agri-processing. The defining operational problem is the gap between what is physically happening — a pallet through a gate, a container on the move, a job done on site — and what the books and order systems believe is happening.',
    whyLocal:
      'Logistics and manufacturing problems are physical, and physical problems need a partner who will walk the floor. We design around your gates, bays, vehicles and sites — building offline-first where signal drops out — and we stay reachable through your operating day, not a call centre\'s.',
    sectors: ['Ports & logistics', 'Manufacturing', 'Warehousing & distribution', 'Import / export', 'Agri-processing'],
    nearbyAreas: ['Umhlanga', 'Pinetown', 'Hillcrest', 'Mount Edgecombe', 'Westville', 'Amanzimtoti'],
    systemRefs: [
      { slug: 'inventory-clarity', angle: 'When the warehouse, the ledger and the order system each say something different, the building itself counts the stock — every motion a digital event.' },
      { slug: 'field-ops-app', angle: 'Work created on site, in vehicles and where signal drops out still produces clean back-office data — offline-first by design.' },
      { slug: 'predictive-maintenance', angle: 'A breakdown on the line or in the fleet costs more in a day than the system costs in a year — Durban operators catch it weeks early.' },
      { slug: 'workflow-orchestrator', angle: 'An order or shipment event fans out across invoicing, stock, dispatch and customer comms in seconds, not the next morning.' },
      { slug: 'cross-system-sync', angle: 'Warehouse stock and the storefront stop drifting apart — edits on either side land on both within seconds.' },
    ],
    industrySlugs: ['logistics', 'manufacturing'],
    searchTerms: ['it company in durban', 'software companies durban', 'custom software durban'],
    geo: { lat: -29.8587, lng: 31.0218 },
  },
]

export function locationBySlug(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug)
}

export const LOCATION_SLUGS: string[] = LOCATIONS.map((l) => l.slug)
