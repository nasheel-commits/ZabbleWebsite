// Site-level AEO content (S07) — the home / core-offering answer block + FAQs.
//
// Targets the brand and core-offering question cluster: "what does Zabble do",
// "who builds custom business software in South Africa", "bespoke vs
// off-the-shelf", "how much does a bespoke system cost". Questions are shaped
// from South-African SERP People-Also-Ask data in docs/seo/_evidence/07/.
// Authored to the answer-block standard (docs/seo/content/aeo-standard.md):
// self-contained 40–60 word answers, true to Zabble's bespoke model, no
// overclaiming. Exposed for S03 to attach FAQPage JSON-LD on `/`.

import type { AnswerBlock, Faq } from '~/data/systems'

/** The primary answer-first block for the home page. */
export const HOME_ANSWER: AnswerBlock = {
  question: 'What does Zabble do?',
  answer:
    'Zabble is a South African consulting firm that builds bespoke operational systems — automation, audit trails, anomaly detection, and analytics — shaped around the single problem slowing a business down. We don’t sell off-the-shelf software. We sit with a business, find the operational problem costing it the most, and build the exact system that fixes it.',
}

/** Home / core-offering FAQs. */
export const HOME_FAQS: Faq[] = [
  {
    question: 'Who builds custom business software in South Africa?',
    answer:
      'Zabble builds custom business software and operational systems in South Africa. We work with banks, NGOs, hotels, law firms, suppliers, and small businesses — designing bespoke automation, audit trails, anomaly detection, and analytics around each client’s biggest operational problem, rather than selling a fixed product. Every system is built for one business and no one else.',
  },
  {
    question: 'What is a bespoke system?',
    answer:
      'A bespoke system is operational software built around one business’s specific workflows, instead of a generic off-the-shelf tool everyone else also uses. Zabble assembles bespoke systems from modules — automation, audit trails, anomaly detection, analytics — chosen in a discovery session to fix the problem costing a business the most.',
  },
  {
    question: 'Bespoke software or off-the-shelf — which is better?',
    answer:
      'Off-the-shelf software is faster to buy and fits common needs; bespoke software is built around how your business actually works. Off-the-shelf wins for standard tasks. Bespoke wins when a business has outgrown generic tools and one workflow — reconciliation, approvals, intake — is quietly costing more than the rest combined.',
  },
  {
    question: 'How much does a bespoke business system cost?',
    answer:
      'A bespoke system’s cost depends on the problem it solves and the number of modules it needs — a single workflow costs far less than a multi-system build. Zabble scopes each engagement during a discovery session, so you see the cost against the problem before any build starts. The first conversation is free.',
  },
  {
    question: 'How does Zabble build a system for my business?',
    answer:
      'In three steps. First we sit with your team, tools, and data until we can point to the operational problem costing the most. Then we build a system tailored to that problem — not your industry, your business. Then you run it: workflows run themselves, risk gets caught early, and decisions get easier.',
  },
]
