// AEO data regression (S07) — structure of the answer/FAQ data.
//
// No build required: validates the structured content every page renders from.
// Asserts each system / pillar hub / money page has an answer-first block in the
// 40–60 word budget and at least 3 question-shaped FAQs, and that the data is
// clean enough for S08 to mark up as FAQPage / QAPage JSON-LD verbatim.

import { describe, it, expect } from 'vitest'
import { SYSTEMS } from '~/data/systems'
import { AEO_UNITS, wordCount } from './aeo-helpers'

describe('AEO content coverage', () => {
  it('covers every live system + the money pages', () => {
    const liveSystems = SYSTEMS.filter((s) => s.status === 'live')
    const systemUnits = AEO_UNITS.filter((u) => u.kind === 'system')
    const liveSystemUnits = systemUnits.filter((u) =>
      liveSystems.some((s) => `system:${s.slug}` === u.id),
    )

    // Every live system has AEO content.
    expect(liveSystemUnits.length).toBe(liveSystems.length)
    // Money pages: home + systems index.
    expect(AEO_UNITS.filter((u) => u.kind === 'money-page').length).toBe(2)
    // Pillar hubs (/what-we-build/<pillar>) are served by the canonical
    // structural template (answer-first + cited GEO stat, not an FAQ page), so
    // they are intentionally NOT AEO FAQ units anymore — see test/aeo-helpers.ts.
    expect(AEO_UNITS.some((u) => u.kind === ('pillar-hub' as string))).toBe(false)
  })

  it('every live system in the data file has an answer + FAQs', () => {
    const missing = SYSTEMS.filter(
      (s) => s.status === 'live' && (!s.answer || !s.faqs || s.faqs.length < 3),
    ).map((s) => s.slug)
    expect(missing, `live systems missing AEO content: ${missing.join(', ')}`).toEqual([])
  })
})

describe.each(AEO_UNITS)('AEO unit $id', (unit) => {
  it('has an answer-first block of 40–60 words', () => {
    expect(unit.answer.question.trim().length).toBeGreaterThan(0)
    expect(unit.answer.question.trim().endsWith('?')).toBe(true)
    const wc = wordCount(unit.answer.answer)
    expect(wc, `answer is ${wc} words: "${unit.answer.answer}"`).toBeGreaterThanOrEqual(40)
    expect(wc, `answer is ${wc} words: "${unit.answer.answer}"`).toBeLessThanOrEqual(60)
  })

  it('has at least 3 question-shaped FAQs', () => {
    expect(unit.faqs.length).toBeGreaterThanOrEqual(3)
    for (const faq of unit.faqs) {
      expect(faq.question.trim().endsWith('?'), `not a question: "${faq.question}"`).toBe(true)
      const wc = wordCount(faq.answer)
      // FAQ answers are self-contained but allowed a slightly wider band than
      // the headline answer block; still capped to a liftable snippet length.
      expect(wc, `FAQ "${faq.question}" answer is ${wc} words`).toBeGreaterThanOrEqual(25)
      expect(wc, `FAQ "${faq.question}" answer is ${wc} words`).toBeLessThanOrEqual(75)
    }
  })

  it('has no duplicate FAQ questions', () => {
    const qs = unit.faqs.map((f) => f.question.toLowerCase().trim())
    expect(new Set(qs).size).toBe(qs.length)
  })
})
