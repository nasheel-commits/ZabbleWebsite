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
    slug: 'credit-risk-decision-engine',
    name: 'Credit & Risk Decision Engine',
    tagline: 'TODO — one-line tagline.',
    pillars: ['anomaly-detection', 'analytics'],
    industry: 'TODO — industry (e.g. "Lenders, fintech, banks")',
    bestFor: 'TODO — best-for.',
    status: 'concept',
    problem: 'TODO — The problem.',
    whatWeBuilt: 'TODO — What we built.',
    whatChanged: 'TODO — What changed.',
    pillarNotes: {
      'anomaly-detection': 'TODO — how this system delivers on the Anomaly Detection pillar.',
      'analytics':         'TODO — how this system delivers on the Analytics pillar.',
    },
  },
  {
    slug: 'document-processing-pipeline',
    name: 'Document Processing Pipeline',
    tagline: 'TODO — one-line tagline.',
    pillars: ['automation', 'audit-trails'],
    industry: 'TODO — industry (e.g. "Operations-heavy businesses")',
    bestFor: 'TODO — best-for.',
    status: 'concept',
    problem: 'TODO — The problem.',
    whatWeBuilt: 'TODO — What we built.',
    whatChanged: 'TODO — What changed.',
    pillarNotes: {
      'automation':   'TODO — how this system delivers on the Automation pillar.',
      'audit-trails': 'TODO — how this system delivers on the Audit Trails pillar.',
    },
  },
  {
    slug: 'lead-qualification-engine',
    name: 'Lead Qualification Engine',
    tagline: 'TODO — one-line tagline.',
    pillars: ['automation', 'analytics'],
    industry: 'TODO — industry (e.g. "B2B sales teams")',
    bestFor: 'TODO — best-for.',
    status: 'concept',
    problem: 'TODO — The problem.',
    whatWeBuilt: 'TODO — What we built.',
    whatChanged: 'TODO — What changed.',
    pillarNotes: {
      'automation': 'TODO — how this system delivers on the Automation pillar.',
      'analytics':  'TODO — how this system delivers on the Analytics pillar.',
    },
  },
  {
    slug: 'operational-anomaly-monitor',
    name: 'Operational Anomaly Monitor',
    tagline: 'TODO — one-line tagline.',
    pillars: ['anomaly-detection', 'audit-trails'],
    industry: 'TODO — industry (e.g. "Mid-market operations")',
    bestFor: 'TODO — best-for.',
    status: 'concept',
    problem: 'TODO — The problem.',
    whatWeBuilt: 'TODO — What we built.',
    whatChanged: 'TODO — What changed.',
    pillarNotes: {
      'anomaly-detection': 'TODO — how this system delivers on the Anomaly Detection pillar.',
      'audit-trails':      'TODO — how this system delivers on the Audit Trails pillar.',
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
