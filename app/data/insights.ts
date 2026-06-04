// Insights / blog, data (structure owned by S02 on-page; body copy owned by S10).
//
// Each post is a question-shaped AEO/GEO explainer at /insights/<slug>, targeting
// a verified informational/question keyword (targets/keyword-map.md "AEO/GEO
// questions" cluster, S03) and linking up to the money page it supports. S02 owns
// the answer-first intro (the liftable 40–60-word answer that wins the snippet)
// and the heading structure; S10 writes the long-form body under each heading.

export interface InsightSection {
  /** Question-led H2. */
  h2: string
  /** Optional body, S10 fills. When absent, only the heading renders (a brief). */
  body?: string
}

export interface Insight {
  slug: string
  /** Post H1 / title, the question, verbatim. */
  title: string
  /** Bare SEO title (titleTemplate appends " · Zabble"). May trim the question. */
  seoTitle: string
  /** Meta description, ~150–160 chars, the answer in one line. */
  seoDescription: string
  /** Primary question/intent first (cannibalisation guard), then variants. */
  keywords: string[]
  /** Answer-first: the 40–60-word extractable answer, rendered before anything else. */
  answerFirst: string
  /** Heading structure; bodies are S10's. */
  sections: InsightSection[]
  /** The money page this explainer supports. */
  relatedHref: string
  relatedLabel: string
  /** Editorial note, flags this as a structural stub pending S10 copy. */
  draftNote: string
}

export const INSIGHTS: Insight[] = [
  {
    slug: 'what-is-popia',
    title: 'What is POPIA? A plain-English guide for South African businesses',
    seoTitle: 'What is POPIA? A Plain-English Guide',
    seoDescription:
      'POPIA is South Africa’s data-protection law. Here’s what it governs, its eight conditions for lawful processing, and what compliance requires of you.',
    keywords: ['what is popia', 'popia compliance requirements', 'what are the principles of the popi act'],
    answerFirst:
      'POPIA is South Africa’s Protection of Personal Information Act, the law governing how organisations collect, store, use and share personal data. It requires lawful, transparent and secure processing, gives people rights over their own information, and is built on eight conditions for lawful processing. Non-compliance can carry heavy fines.',
    sections: [
      { h2: 'What does POPIA stand for?' },
      { h2: 'What are the eight conditions for lawful processing?' },
      { h2: 'How do you become POPIA compliant?' },
      { h2: 'How software makes POPIA compliance routine, not a scramble' },
    ],
    relatedHref: '/systems/compliance-reporting',
    relatedLabel: 'See the Compliance & Regulatory Reporting Engine',
    draftNote: 'Structural stub, answer-first intro + headings by S02; body copy by S10.',
  },
  {
    slug: 'what-is-crm-software',
    title: 'What is CRM software, and does a small business need it?',
    seoTitle: 'What is CRM Software?',
    seoDescription:
      'CRM software keeps every customer interaction in one place to manage the relationship and pipeline. What it does, and when a custom CRM beats off-the-shelf.',
    keywords: ['what is crm software', 'what is a crm system', 'best crm for small business south africa'],
    answerFirst:
      'CRM (customer relationship management) software is a system that records every interaction with a customer or prospect, calls, emails, deals, tasks, in one place, so a team can see the full relationship and move deals through a pipeline without losing track. The best fit mirrors how your team actually sells.',
    sections: [
      { h2: 'What does CRM software actually do?' },
      { h2: 'What are the main types of CRM?' },
      { h2: 'Off-the-shelf vs a bespoke CRM: which do you need?' },
      { h2: 'Choosing a CRM for a South African business' },
    ],
    relatedHref: '/systems/bespoke-crm',
    relatedLabel: 'See the Bespoke CRM',
    draftNote: 'Structural stub, answer-first intro + headings by S02; body copy by S10.',
  },
  {
    slug: 'how-to-automate-bank-reconciliation',
    title: 'How to automate bank reconciliation',
    seoTitle: 'How to Automate Bank Reconciliation',
    seoDescription:
      'Automating reconciliation means a system matches the routine entries across your ledgers and surfaces only the exceptions. Here’s how it works.',
    keywords: ['how to automate bank reconciliation', 'what is reconciliation in accounting', 'automated bank reconciliation'],
    answerFirst:
      'To automate bank reconciliation, you feed each ledger into an engine that matches entries by rule, identical entries one-to-one, combined deposits by sum-and-window, predictable fees by saved rule, and routes only the unmatched items to a review queue. Manual resolutions are saved as rules that auto-clear similar cases next time.',
    sections: [
      { h2: 'What is reconciliation in accounting?' },
      { h2: 'Why manual reconciliation breaks down at volume' },
      { h2: 'How an automated reconciliation engine matches the easy cases' },
      { h2: 'What’s left for a human: the real exceptions' },
    ],
    relatedHref: '/systems/reconciliation-engine',
    relatedLabel: 'See the Reconciliation Engine',
    draftNote: 'Structural stub, answer-first intro + headings by S02; body copy by S10.',
  },
  {
    slug: 'custom-software-vs-off-the-shelf',
    title: 'Custom software vs off-the-shelf: how to choose',
    seoTitle: 'Custom Software vs Off-the-Shelf',
    seoDescription:
      'Off-the-shelf software is faster and cheaper to start; custom software fits your exact process. Here’s how to tell which one your business actually needs.',
    keywords: ['custom software vs off the shelf', 'bespoke software vs off the shelf software', 'what is bespoke software'],
    answerFirst:
      'Off-the-shelf software is faster and cheaper to start with and fits common needs well. Custom software costs more upfront but is built around your exact process, worth it once a business has outgrown the off-the-shelf tool and is patching the gaps with spreadsheets, manual work and tools that don’t talk to each other.',
    sections: [
      { h2: 'What is bespoke (custom) software?' },
      { h2: 'When off-the-shelf is the right call' },
      { h2: 'The signs you’ve outgrown off-the-shelf' },
      { h2: 'How much does custom software cost in South Africa?' },
    ],
    relatedHref: '/',
    relatedLabel: 'See how Zabble builds bespoke systems',
    draftNote: 'Structural stub, answer-first intro + headings by S02; body copy by S10.',
  },
  {
    slug: 'who-builds-custom-software-in-south-africa',
    title: 'Who builds custom software in South Africa?',
    seoTitle: 'Who Builds Custom Software in South Africa?',
    seoDescription:
      'Looking for a custom software partner in South Africa? Here’s what to look for in a bespoke systems firm, and how Zabble approaches it, problem-first.',
    keywords: ['who builds custom software in south africa', 'custom software development south africa', 'bespoke software development'],
    answerFirst:
      'Several South African firms build custom software, from large IT houses to specialist consultancies. Zabble is a Cape Town–based firm that builds bespoke operational systems, automation, audit trails, anomaly detection and analytics, shaped around the single problem costing a business the most, rather than selling off-the-shelf software.',
    sections: [
      { h2: 'What to look for in a custom software partner' },
      { h2: 'Bespoke systems vs a generic software house' },
      { h2: 'How Zabble works: problem-first, then build' },
    ],
    relatedHref: '/',
    relatedLabel: 'See how Zabble works',
    draftNote: 'Structural stub, answer-first intro + headings by S02; body copy by S10.',
  },
]

export function insightBySlug(slug: string): Insight | undefined {
  return INSIGHTS.find((i) => i.slug === slug)
}
