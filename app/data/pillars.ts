// Pillar hubs — the topical-cluster layer of the site architecture (SEO S04),
// enriched with GEO content (S07-geo).
//
// Each of Zabble's four pillars (Automation, Audit Trails, Anomaly Detection,
// Analytics) gets a real, server-rendered hub page at /what-we-build/<pillar>
// that introduces the pillar and links to every live module that delivers on it
// (and every such module links back up — see app/pages/systems/[slug].vue and
// app/pages/what-we-build/[pillar].vue). This is the canonical replacement for
// the old faceted /systems?pillar= views (audit issue A3/A5; rule L6/L10) and
// the canonical pillar hub: the old /pillars/<slug> route 301-redirects here.
//
// Content is grounded in the Zabble Business & Modules overview ("The Four
// Pillars"). headTerm is the seed keyword cluster for the hub — S05 verifies
// volume/KD (see targets/keyword-map.md, OR-9). Membership is derived from the
// single source of truth (app/data/systems.ts), never hand-maintained.
//
// GEO fields (question/definition/whatWeBuild/stat/quote) make each hub liftable
// by a generative engine: a question-shaped framing, a self-contained ≤40-word
// definition, and a real cited statistic (number + source + year — see
// docs/seo/_evidence/07/geo-sources.md). Stats are real and verifiable; never
// invent figures.

import {
  SYSTEMS,
  PILLARS,
  type PillarSlug,
  type PillarMeta,
  type System,
} from './systems'

/** A real, attributed statistic an answer engine can lift verbatim (GEO). */
export interface CitedStat {
  /** The liftable statistic sentence (declarative, specific). */
  text: string
  /** Source attribution shown inline, e.g. "McKinsey Global Institute, 2017". */
  source: string
  /** Link to the source. */
  url: string
}

export interface PillarHub {
  slug: PillarSlug
  /** Full label (mirrors PILLARS). */
  label: string
  /** Seed head keyword for the hub (South Africa). S05 verifies — OR-9. */
  headTerm: string
  /** Eyebrow shown above the hub H1. */
  eyebrow: string
  /** Hub H1. */
  heading: string
  /** One-line promise under the H1 (the pillar's lede). */
  tagline: string
  /** Intro narrative (1–2 paragraphs) — the pillar in Zabble's own words. */
  intro: string[]
  /** Outcome bullets ("what changes"). */
  outcomes: string[]
  /**
   * Slugs of 2–4 flagship modules to name in the contextual prose with
   * descriptive in-body anchors (rule L11). Must be live slugs.
   */
  flagship: string[]
  /** SEO title (S02 may refine via useSeoMeta later). */
  seoTitle: string
  /** SEO description. */
  seoDescription: string

  // ── GEO (S07-geo): liftable, cited answer content for generative engines ──
  /** Question-shaped framing of the pillar (AEO/GEO heading). */
  question?: string
  /** ≤40-word self-contained definition — the liftable lead answer. */
  definition?: string
  /** What Zabble builds for this pillar (one paragraph). */
  whatWeBuild?: string
  /** Real, attributed statistic rendered as a cited figure. */
  stat?: CitedStat
  /** Optional verbatim, attributed quote. */
  quote?: { text: string; source: string; url: string }
}

// Order mirrors PILLARS so the hubs read in the same order everywhere.
export const PILLAR_HUBS: PillarHub[] = [
  {
    slug: 'automation',
    label: 'Automation',
    headTerm: 'business process automation South Africa',
    eyebrow: 'Automation',
    heading: 'Stop doing it by hand.',
    tagline:
      'We automate the parts of your business that should not need a human anymore — so your team does the work only people can do.',
    intro: [
      'Every business runs on workflows: the same spreadsheet filled out every week, the same data copied between two systems that do not talk, the same decisions made on the same handful of inputs. Automation is how Zabble takes that repetitive, error-prone work off your team and gives it to a system that never forgets a step.',
      'A Zabble automation build is shaped to one business, not an industry template. Sometimes it is a single workflow; more often it is several modules wired into one operating system — events fanning out across tools, documents reading themselves, approvals routing by rule, the books posting as the business moves.',
    ],
    outcomes: [
      'Manual, repetitive workflows run themselves end to end.',
      'One event lands cleanly in every downstream system — no copy-paste.',
      'Your team spends its time on the exceptions, not the routine.',
    ],
    flagship: ['workflow-orchestrator', 'integration-hub', 'document-intelligence', 'bespoke-crm'],
    seoTitle: 'Business Process Automation — Zabble',
    seoDescription:
      'Bespoke business process automation for South African operators: workflow orchestration, document intelligence, integrations and more — built around the work your business actually does.',
    question: 'What is business process automation?',
    definition:
      'Business process automation is using software to run the repeatable parts of a business — the data entry, the hand-offs, the routine decisions — without a human in the loop, so people do only the work that needs them.',
    whatWeBuild:
      'Zabble automates the parts of a business that should no longer need a human — outreach, hand-offs, approvals, document intake, reconciliations — and leaves people the work only people can do. Every automated step is logged with the reasoning that fired it.',
    stat: {
      text: 'About 60% of all occupations have at least 30% of their activities that could be automated.',
      source: 'McKinsey Global Institute, A Future That Works, 2017',
      url: 'https://www.mckinsey.com/featured-insights/future-of-work/jobs-lost-jobs-gained-what-the-future-of-work-will-mean-for-jobs-skills-and-wages',
    },
    quote: {
      text: 'More occupations will change than will be automated away.',
      source: 'McKinsey Global Institute, A Future That Works, 2017',
      url: 'https://www.mckinsey.com/featured-insights/future-of-work/jobs-lost-jobs-gained-what-the-future-of-work-will-mean-for-jobs-skills-and-wages',
    },
  },
  {
    slug: 'audit-trails',
    label: 'Audit Trails',
    headTerm: 'audit trail software',
    eyebrow: 'Audit Trails',
    heading: 'You can’t manage what you can’t see.',
    tagline:
      'We build visibility and governance into your operations, so you always know who did what, when, and why.',
    intro: [
      'When the regulator, the auditor, the board, or the customer asks "what happened here?", most teams hand over a story reconstructed from inboxes and memory. An audit trail makes the answer a record instead — every decision, every approval, every state change captured as it happens, replayable end to end.',
      'Zabble builds the audit trail in as a by-product of running the work, not as extra admin. The result is faster reviews, cleaner audits, and confidence that what is supposed to happen actually did.',
    ],
    outcomes: [
      'Every decision and approval is captured, timestamped and replayable.',
      'Audit prep collapses from weeks of digging to a one-click export.',
      'Disputes get answered by reading the trail, not re-doing the work.',
    ],
    flagship: ['approval-workflow', 'case-management', 'compliance-reporting', 'continuous-assurance'],
    seoTitle: 'Audit Trails & Operational Governance — Zabble',
    seoDescription:
      'Bespoke audit-trail and governance systems: approvals, case lifecycles, regulatory reporting and continuous assurance — every action who/what/when/why, captured as it happens.',
    question: 'What is an audit trail, and why does it matter?',
    definition:
      'An audit trail is a complete, tamper-evident record of who did what, when, and why across a business’s operations — so any decision can be reconstructed and proven later, not just remembered.',
    whatWeBuild:
      'Zabble builds visibility and governance into operations: every action, approval, and exception is written once and never edited, with the rule that fired it attached. Reviews get faster, audits get cleaner, and "who did what, when" stops being a guess.',
    stat: {
      text: 'Under South Africa’s POPIA, serious data-governance failures carry penalties of up to R10 million or 10 years’ imprisonment.',
      source: 'Protection of Personal Information Act 4 of 2013, ss. 107 & 109',
      url: 'https://popia.co.za/section-107-penalties/',
    },
  },
  {
    slug: 'anomaly-detection',
    label: 'Anomaly Detection',
    headTerm: 'anomaly detection for business',
    eyebrow: 'Anomaly Detection',
    heading: 'The risks that hurt most are the ones you don’t see coming.',
    tagline:
      'We build systems that watch your operations in the background and flag what’s unusual — before it becomes a problem.',
    intro: [
      'Fraud, error, drift, and equipment failure share one shape: a tiny signal hidden inside an ocean of normal activity. By the time a human notices, the damage is already booked. Anomaly detection watches the stream no person could realistically watch and surfaces only the cases that matter — each with its evidence already attached.',
      'Zabble tunes what counts as an anomaly to the specific business, and where it helps, compounds the rules with a model that learns the patterns over time. This is how you scale without losing control.',
    ],
    outcomes: [
      'The costly few surface out of the routine many, with evidence attached.',
      'Mean time to detection drops from days to seconds.',
      'Investigators stop triaging false positives by hand.',
    ],
    flagship: ['continuous-assurance', 'predictive-maintenance', 'reconciliation-engine', 'compliance-reporting'],
    seoTitle: 'Anomaly Detection for Operations — Zabble',
    seoDescription:
      'Bespoke anomaly-detection systems: continuous assurance, predictive maintenance, reconciliation and reporting checks that catch fraud, error and drift before they cost you.',
    question: 'What is anomaly detection in business operations?',
    definition:
      'Anomaly detection is software that watches a stream of business activity in the background and flags what’s unusual — the fraud, the error, the drift, the outlier — before it becomes a loss.',
    whatWeBuild:
      'Zabble builds engines that watch operations continuously and surface only the cases that matter — each with its rule, its history, and the suggested action. Mean time to detection drops from days to seconds, and investigators stop triaging false positives by hand.',
    stat: {
      text: 'A typical organization loses 5% of its revenue to occupational fraud every year, and the median scheme runs about 12 months before it is caught.',
      source: 'ACFE, Occupational Fraud 2024: A Report to the Nations',
      url: 'https://legacy.acfe.com/report-to-the-nations/2024/',
    },
  },
  {
    slug: 'analytics',
    label: 'Analytics',
    headTerm: 'business analytics and decision support',
    eyebrow: 'Analytics',
    heading: 'Every business has more data than it uses.',
    tagline:
      'We turn yours into a clear picture of what’s happening and what matters — so decisions get made on facts, not hunches.',
    intro: [
      'Most operational dashboards get opened once and closed no wiser. Analytics done right composes the view by role, so each person sees only the numbers that feed the decisions they actually make — at the cadence those decisions live on, with every figure one click from its source and its next action.',
      'Zabble builds the analytics layer on top of the systems already running the business, so the picture is live and trusted rather than assembled by hand three weeks late.',
    ],
    outcomes: [
      'Each role opens one screen and sees the decisions they have to make today.',
      'Every number opens its calculation, its source, and the next action.',
      'Forecasts and reports arrive before the meeting, not after.',
    ],
    flagship: ['analytics-suite', 'forecasting', 'bespoke-crm', 'accounting-engine'],
    seoTitle: 'Analytics & Decision Support — Zabble',
    seoDescription:
      'Bespoke analytics and decision-support systems: role-shaped dashboards, demand forecasting and live operational reporting — built on the systems already running your business.',
    question: 'What is operational analytics?',
    definition:
      'Operational analytics turns the data a business already generates into a clear, role-specific picture of what is happening and what to do next — so decisions get made on facts, not hunches.',
    whatWeBuild:
      'Zabble pulls from every operational system and composes the view by role, so each person sees only the KPIs that feed their decisions — at the cadence those decisions live on. Every number opens its calculation, its source, and the next action.',
    stat: {
      text: 'About 80% of the world’s data is unstructured, and only a fraction of all the data created is ever analysed.',
      source: 'IDC, Data Age 2025',
      url: 'https://www.seagate.com/files/www-content/our-story/trends/files/idc-seagate-dataage-whitepaper.pdf',
    },
  },
]

const HUBS_BY_SLUG = new Map<PillarSlug, PillarHub>(
  PILLAR_HUBS.map((h) => [h.slug, h]),
)

export function pillarHubBySlug(slug: string): PillarHub | undefined {
  return HUBS_BY_SLUG.get(slug as PillarSlug)
}

/**
 * Live modules that deliver on a pillar, ordered for the hub:
 *   1. modules whose PRIMARY pillar (pillars[0]) is this pillar — the clearest
 *      exemplars lead,
 *   2. then original SYSTEMS order as a stable, deterministic tie-break.
 * Concept/in-progress modules are excluded, so the thin pages stay delinked
 * (rule L3; the 2 concept pages are handled by S01).
 */
export function membersForPillar(slug: PillarSlug): System[] {
  return SYSTEMS
    .map((s, index) => ({ s, index }))
    .filter(({ s }) => s.status === 'live' && s.pillars.includes(slug))
    .sort((a, b) => {
      const aPrimary = a.s.pillars[0] === slug ? 0 : 1
      const bPrimary = b.s.pillars[0] === slug ? 0 : 1
      return aPrimary - bPrimary || a.index - b.index
    })
    .map(({ s }) => s)
}

/** Alias kept for GEO-era callers. Identical to membersForPillar. */
export const systemsForPillar = membersForPillar

/** The PillarMeta (icon/label) for a hub slug — for rendering chips/icons. */
export function pillarMetaForHub(slug: PillarSlug): PillarMeta | undefined {
  return PILLARS.find((p) => p.slug === slug)
}

/** Lucide icon component for a pillar (reuses the PILLARS registry). */
export function pillarIcon(slug: PillarSlug) {
  return PILLARS.find((p) => p.slug === slug)?.icon
}

/** The other three pillar hubs — for the cluster cross-link strip (rule L6). */
export function otherPillarHubs(slug: PillarSlug): PillarHub[] {
  return PILLAR_HUBS.filter((h) => h.slug !== slug)
}
