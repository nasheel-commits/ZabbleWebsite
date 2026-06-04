// AEO rendered-HTML regression (S07) — server-render + byte-consistency.
//
// Requires `nuxt generate` to have produced .output/public first
// (npm run generate). For every prerendered AEO unit, asserts the answer text
// and each FAQ question + answer appear in the static HTML — proving the content
// is server-rendered (no JS needed) and that the rendered text is identical to
// the data string S08 will mark up as JSON-LD (modulo HTML entity encoding and
// insignificant whitespace, both lossless).

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { AEO_UNITS, renderedText, normalizeWhitespace } from './aeo-helpers'

const OUT_DIR = resolve(process.cwd(), '.output/public')

const prerendered = AEO_UNITS.filter((u) => u.prerendered)

beforeAll(() => {
  if (!existsSync(OUT_DIR)) {
    throw new Error(
      `No prerendered output at ${OUT_DIR}. Run \`npm run generate\` before the rendered AEO test.`,
    )
  }
})

describe.each(prerendered)('rendered AEO unit $id ($htmlPath)', (unit) => {
  let text = ''

  beforeAll(() => {
    const file = resolve(OUT_DIR, unit.htmlPath)
    expect(existsSync(file), `missing prerendered file: ${unit.htmlPath}`).toBe(true)
    text = renderedText(readFileSync(file, 'utf8'))
  })

  it('renders the answer-first block text server-side', () => {
    const needle = normalizeWhitespace(unit.answer.question)
    const answer = normalizeWhitespace(unit.answer.answer)
    expect(text.includes(needle), `question not in HTML: "${needle}"`).toBe(true)
    expect(text.includes(answer), `answer not in HTML (byte-mismatch): "${answer}"`).toBe(true)
  })

  it('renders every FAQ question + answer byte-identically', () => {
    for (const faq of unit.faqs) {
      const q = normalizeWhitespace(faq.question)
      const a = normalizeWhitespace(faq.answer)
      expect(text.includes(q), `FAQ question not in HTML: "${q}"`).toBe(true)
      expect(text.includes(a), `FAQ answer not in HTML (byte-mismatch): "${a}"`).toBe(true)
    }
  })
})
