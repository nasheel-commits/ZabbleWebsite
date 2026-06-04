// Pillar hubs — the topical-cluster layer of the site architecture (SEO S04).
//
// Each of Zabble's four pillars (Automation, Audit Trails, Anomaly Detection,
// Analytics) gets a real, server-rendered hub page at /what-we-build/<pillar>
// that introduces the pillar and links to every live module that delivers on it
// (and every such module links back up — see app/pages/systems/[slug].vue and
// app/pages/what-we-build/[pillar].vue). This is the canonical replacement for
// the old faceted /systems?pillar= views (audit issue A3/A5; rule L6/L10).
//
// Content is grounded in the Zabble Business & Modules overview ("The Four
// Pillars"). headTerm is the seed keyword cluster for the hub — S05 verifies
// volume/KD (see targets/keyword-map.md, OR-9). Membership is derived from the
// single source of truth (app/data/systems.ts), never hand-maintained.

import {
  SYSTEMS,
  PILLARS,
  type PillarSlug,
  type PillarMeta,
  type System,
} from './systems'

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
 *   2. then by how many pillars they share with nothing… simply original
 *      SYSTEMS order as a stable, deterministic tie-break.
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

/** The PillarMeta (icon/label) for a hub slug — for rendering chips/icons. */
export function pillarMetaForHub(slug: PillarSlug): PillarMeta | undefined {
  return PILLARS.find((p) => p.slug === slug)
}

/** The other three pillar hubs — for the cluster cross-link strip (rule L6). */
export function otherPillarHubs(slug: PillarSlug): PillarHub[] {
  return PILLAR_HUBS.filter((h) => h.slug !== slug)
}
