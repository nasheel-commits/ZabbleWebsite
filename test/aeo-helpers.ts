// Shared helpers for the AEO regression suite (S07).
//
// Builds the registry of "AEO units" — every page that must carry an
// answer-first block + FAQs — directly from the structured data, and maps each
// to the static HTML file `nuxt generate` produces. Tests assert structure
// (word budget, ≥3 FAQs) and that the rendered text is byte-consistent with the
// data (so the strings S08 marks up as JSON-LD are exactly what renders).

import { SYSTEMS, type AnswerBlock, type Faq } from '~/data/systems'
import {
  HOME_ANSWER,
  HOME_FAQS,
  SYSTEMS_INDEX_ANSWER,
  SYSTEMS_INDEX_FAQS,
} from '~/data/site-faqs'
import { PILLAR_HUBS } from '~/data/pillar-content'

export interface AeoUnit {
  id: string
  kind: 'system' | 'pillar-hub' | 'money-page'
  /** Path of the prerendered HTML, relative to .output/public. */
  htmlPath: string
  /** True if the page is linked/prerendered (so its HTML exists to check). */
  prerendered: boolean
  answer: AnswerBlock
  faqs: Faq[]
}

function liveSystemUnits(): AeoUnit[] {
  return SYSTEMS.filter((s) => s.answer && s.faqs).map((s) => ({
    id: `system:${s.slug}`,
    kind: 'system' as const,
    htmlPath: `systems/${s.slug}/index.html`,
    // Concept systems exist in data + render on demand, but aren't linked from
    // the gallery, so crawlLinks doesn't prerender them — skip the HTML check.
    prerendered: s.status === 'live',
    answer: s.answer!,
    faqs: s.faqs!,
  }))
}

function pillarHubUnits(): AeoUnit[] {
  return Object.values(PILLAR_HUBS).map((h) => ({
    id: `pillar-hub:${h.slug}`,
    kind: 'pillar-hub' as const,
    htmlPath: `pillars/${h.slug}/index.html`,
    prerendered: true,
    answer: h.answer,
    faqs: h.faqs,
  }))
}

function moneyPageUnits(): AeoUnit[] {
  return [
    {
      id: 'money-page:home',
      kind: 'money-page' as const,
      htmlPath: 'index.html',
      prerendered: true,
      answer: HOME_ANSWER,
      faqs: HOME_FAQS,
    },
    {
      id: 'money-page:systems-index',
      kind: 'money-page' as const,
      htmlPath: 'systems/index.html',
      prerendered: true,
      answer: SYSTEMS_INDEX_ANSWER,
      faqs: SYSTEMS_INDEX_FAQS,
    },
  ]
}

export const AEO_UNITS: AeoUnit[] = [
  ...moneyPageUnits(),
  ...pillarHubUnits(),
  ...liveSystemUnits(),
]

/** Count words in a self-contained answer (whitespace-delimited tokens). */
export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}

/** Decode the HTML entities Vue's SSR emits in text/attribute content. */
export function decodeEntities(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
}

/** Collapse insignificant whitespace so HTML pretty-printing doesn't matter. */
export function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

/** A node's visible text, entity-decoded and whitespace-normalized. */
export function renderedText(html: string): string {
  return normalizeWhitespace(decodeEntities(html))
}
