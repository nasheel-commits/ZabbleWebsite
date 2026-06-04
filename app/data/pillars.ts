// Pillar hub content (GEO). One authoritative, citable hub per pillar.
//
// Each hub is built to be lifted by a generative engine: a question-shaped H1, a
// self-contained ≤40-word definition, a real cited statistic (number + source +
// year — see docs/seo/_evidence/07/geo-sources.md), and the live modules that
// deliver the pillar. Stats are real and verifiable; never invent figures.

import { PILLARS, SYSTEMS, type PillarSlug, type System } from './systems'

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
  /** Short label (matches PILLARS). */
  label: string
  /** Question-shaped H1 (AEO/GEO). */
  question: string
  /** ≤40-word self-contained definition — the liftable lead answer. */
  definition: string
  /** Supporting paragraph. */
  intro: string
  /** What Zabble builds for this pillar. */
  whatWeBuild: string
  /** Real, attributed statistic. */
  stat: CitedStat
  /** Optional verbatim, attributed quote. */
  quote?: { text: string; source: string; url: string }
  /** SEO/meta description. */
  metaDescription: string
}

export const PILLAR_HUBS: PillarHub[] = [
  {
    slug: 'automation',
    label: 'Automation',
    question: 'What is business process automation?',
    definition:
      'Business process automation is using software to run the repeatable parts of a business — the data entry, the hand-offs, the routine decisions — without a human in the loop, so people do only the work that needs them.',
    intro:
      "Every business runs on workflows: the same spreadsheet filled in every week, the same data copied between two systems that don't talk, the same decision made on the same handful of inputs. Automation removes that drag at its source.",
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
    metaDescription:
      'Business process automation in South Africa, explained — and the Zabble systems that run a business’s repeatable work without a human in the loop.',
  },
  {
    slug: 'audit-trails',
    label: 'Audit Trails',
    question: 'What is an audit trail, and why does it matter?',
    definition:
      'An audit trail is a complete, tamper-evident record of who did what, when, and why across a business’s operations — so any decision can be reconstructed and proven later, not just remembered.',
    intro:
      "You can't manage what you can't see. When the record of a decision lives in an inbox or someone's head, audits take weeks and disputes come down to whose memory wins. Built-in audit trails turn that into a one-click export.",
    whatWeBuild:
      'Zabble builds visibility and governance into operations: every action, approval, and exception is written once and never edited, with the rule that fired it attached. Reviews get faster, audits get cleaner, and "who did what, when" stops being a guess.',
    stat: {
      text: 'Under South Africa’s POPIA, serious data-governance failures carry penalties of up to R10 million or 10 years’ imprisonment.',
      source: 'Protection of Personal Information Act 4 of 2013, ss. 107 & 109',
      url: 'https://popia.co.za/section-107-penalties/',
    },
    metaDescription:
      'Audit trails explained — tamper-evident records of who did what, when, and why — and the Zabble systems that make audit prep a one-click export in South Africa.',
  },
  {
    slug: 'anomaly-detection',
    label: 'Anomaly Detection',
    question: 'What is anomaly detection in business operations?',
    definition:
      'Anomaly detection is software that watches a stream of business activity in the background and flags what’s unusual — the fraud, the error, the drift, the outlier — before it becomes a loss.',
    intro:
      'The risks that hurt most share one shape: a tiny signal inside an ocean of normal activity. By the time a human notices, the damage is booked. Most teams cope by sampling — and the things they miss are the things that hurt.',
    whatWeBuild:
      'Zabble builds engines that watch operations continuously and surface only the cases that matter — each with its rule, its history, and the suggested action. Mean time to detection drops from days to seconds, and investigators stop triaging false positives by hand.',
    stat: {
      text: 'A typical organization loses 5% of its revenue to occupational fraud every year, and the median scheme runs about 12 months before it is caught.',
      source: 'ACFE, Occupational Fraud 2024: A Report to the Nations',
      url: 'https://legacy.acfe.com/report-to-the-nations/2024/',
    },
    metaDescription:
      'Anomaly detection explained — catching fraud, error, and drift before they become losses — and the Zabble systems that do it in the background, in South Africa.',
  },
  {
    slug: 'analytics',
    label: 'Analytics',
    question: 'What is operational analytics?',
    definition:
      'Operational analytics turns the data a business already generates into a clear, role-specific picture of what is happening and what to do next — so decisions get made on facts, not hunches.',
    intro:
      'Every business has more data than it uses. The dashboard nobody reads, the report nobody opens, the number nobody can trace. Operational analytics composes the view around the decision each person actually has to make.',
    whatWeBuild:
      'Zabble pulls from every operational system and composes the view by role, so each person sees only the KPIs that feed their decisions — at the cadence those decisions live on. Every number opens its calculation, its source, and the next action.',
    stat: {
      text: 'About 80% of the world’s data is unstructured, and only a fraction of all the data created is ever analysed.',
      source: 'IDC, Data Age 2025',
      url: 'https://www.seagate.com/files/www-content/our-story/trends/files/idc-seagate-dataage-whitepaper.pdf',
    },
    metaDescription:
      'Operational analytics explained — turning the data a business already has into role-specific decisions — and the Zabble systems that deliver it in South Africa.',
  },
]

export function pillarHubBySlug(slug: string): PillarHub | undefined {
  return PILLAR_HUBS.find((p) => p.slug === slug)
}

/** Live systems that deliver a given pillar. */
export function systemsForPillar(slug: PillarSlug): System[] {
  return SYSTEMS.filter((s) => s.status === 'live' && s.pillars.includes(slug))
}

/** Lucide icon component for a pillar (reuses the PILLARS registry). */
export function pillarIcon(slug: PillarSlug) {
  return PILLARS.find((p) => p.slug === slug)?.icon
}
