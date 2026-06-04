// Pillar-hub AEO content (S07) — one answer-first hub per pillar.
//
// Each of Zabble's four pillars (automation, audit trails, anomaly detection,
// analytics) gets a hub page at /pillars/<slug> that answers the category
// question ("What is business process automation?") and links to the systems
// that deliver that pillar. Authored to docs/seo/content/aeo-standard.md;
// questions shaped from SA SERP People-Also-Ask data in docs/seo/_evidence/07/.
//
// The answer/faqs strings are what render server-side AND what S08 marks up as
// FAQPage / QAPage JSON-LD — keep byte-identical. Member systems are derived
// from systems.ts at render time, so this file holds copy only.

import type { AnswerBlock, Faq } from '~/data/systems'
import type { PillarSlug } from '~/data/systems'

export interface PillarHub {
  /** Pillar slug — matches PILLARS in systems.ts and the /pillars/<slug> route. */
  slug: PillarSlug
  /** Page H1. */
  h1: string
  /** One-line hero subhead. */
  intro: string
  /** <title> for the hub page (S02 owns final meta; this is a sensible default). */
  metaTitle: string
  /** Meta description default. */
  metaDescription: string
  /** Answer-first block. */
  answer: AnswerBlock
  /** PAA-shaped FAQs. */
  faqs: Faq[]
}

export const PILLAR_HUBS: Record<PillarSlug, PillarHub> = {
  'automation': {
    slug: 'automation',
    h1: 'Automation — stop doing it by hand',
    intro:
      'The repetitive work that shouldn’t need a human anymore, run by a system built around how your business actually works.',
    metaTitle: 'Business Process Automation in South Africa · Zabble',
    metaDescription:
      'What business process automation is, what it can automate, and the bespoke systems Zabble builds around your real workflows — not a generic template.',
    answer: {
      question: 'What is business process automation?',
      answer:
        'Business process automation uses software to run the repetitive parts of a business — the same spreadsheet filled in weekly, the same data copied between systems, the same routine decisions — so people focus on the work only people can do. Zabble builds automation around one business’s actual workflows, not a generic template.',
    },
    faqs: [
      {
        question: 'What is an example of business process automation?',
        answer:
          'A new order that fires once and becomes an invoice, a stock update, a dispatch ticket, and a CRM record within seconds — instead of someone copy-pasting between tools the next morning. Or approvals that route themselves by rule, or documents read and filed the moment they arrive.',
      },
      {
        question: 'What can be automated in a business?',
        answer:
          'The work that shouldn’t need a human anymore: data entry between systems, approval routing, document intake, reconciliation, notifications, reporting, and follow-up. Zabble automates the specific workflows costing a business the most time, leaving judgment work to people.',
      },
      {
        question: 'Is automation the same as buying off-the-shelf software?',
        answer:
          'No. Off-the-shelf tools make you fit their workflow. Zabble builds automation around how your business actually works — the steps, rules, and systems you already run — so it fits the process instead of forcing the process to fit the tool.',
      },
      {
        question: 'Which Zabble systems deliver automation?',
        answer:
          'Most of them — from the Workflow Orchestrator and Integration Hub to the Reconciliation Engine, Approval Workflow, and Document Intelligence. Automation is the pillar that runs through the widest range of Zabble builds.',
      },
    ],
  },
  'audit-trails': {
    slug: 'audit-trails',
    h1: 'Audit Trails — you can’t manage what you can’t see',
    intro:
      'Governance and visibility built into operations, so you know who did what, when, and why — written as a by-product of running the work.',
    metaTitle: 'Audit Trails & Operational Governance · Zabble',
    metaDescription:
      'What an audit trail is, what it should include, and how Zabble builds immutable, one-click-exportable trails into the systems that run your operations.',
    answer: {
      question: 'What is an audit trail?',
      answer:
        'An audit trail is a complete, time-stamped record of who did what, when, and why in a system. Zabble builds audit trails into operations as a by-product of running the work, so reviews are faster, audits are cleaner, and reconstructing any decision takes one click instead of three people and a week.',
    },
    faqs: [
      {
        question: 'What should an audit trail include?',
        answer:
          'Every action, who took it, when, and the reason or rule behind it — plus the documents, comments, and conditions attached. In a Zabble build, that means a regulator request becomes a one-click export of an evidence pack, not a week of digging through email.',
      },
      {
        question: 'Why do audit trails matter?',
        answer:
          'You can’t manage what you can’t see. Audit trails give governance and the confidence that what’s supposed to happen actually did — and they turn audit season from a scramble into an export. For a regulated business, the trail is the difference between a record and a story.',
      },
      {
        question: 'Are audit trails extra work to maintain?',
        answer:
          'No — that’s the point of building them in. The trail is written automatically as the work runs in the system, not kept by hand on the side. Running the work and recording it become the same act.',
      },
      {
        question: 'Which Zabble systems produce audit trails?',
        answer:
          'The Approval Workflow, Case Management, Continuous Assurance, Compliance Reporting, and Reconciliation engines all write an immutable trail as they run — among many others. Audit trails are one of Zabble’s four pillars.',
      },
    ],
  },
  'anomaly-detection': {
    slug: 'anomaly-detection',
    h1: 'Anomaly Detection — catch it before it costs you',
    intro:
      'Systems that watch operations in the background and flag what’s unusual — the fraud, the error, the drift, the outlier — before it becomes a problem.',
    metaTitle: 'Anomaly Detection for Business · Zabble',
    metaDescription:
      'What anomaly detection is, what it catches, and how Zabble builds monitoring tuned to your business that surfaces only the cases that matter, with evidence attached.',
    answer: {
      question: 'What is anomaly detection?',
      answer:
        'Anomaly detection is automated monitoring that watches a stream of activity and flags what’s unusual before it becomes a problem — the fraud, the error, the drift, the outlier. Zabble builds detection tuned to what counts as unusual for a specific business, surfacing only the cases that matter with their evidence attached.',
    },
    faqs: [
      {
        question: 'What can anomaly detection catch?',
        answer:
          'Fraud in transactions, drift in operations, equipment failure, and outliers in performance — risks that share one shape: a tiny signal inside an ocean of normal activity. Sampling misses them; continuous monitoring catches them at volume, dropping detection time from days toward seconds.',
      },
      {
        question: 'Does anomaly detection use AI?',
        answer:
          'Where it helps. Zabble compounds a bespoke rules-based engine with a model that learns normal patterns over time, so detection improves — while every flag still carries its reason, keeping the system auditable rather than a black box.',
      },
      {
        question: 'How is this different from a person reviewing reports?',
        answer:
          'A person sees a fraction of activity, late. An anomaly detection engine reads the whole stream in real time and surfaces only genuine exceptions, each with its rule, history, and suggested action — so investigators act on evidence instead of triaging false positives by hand.',
      },
      {
        question: 'Which Zabble systems detect anomalies?',
        answer:
          'The Continuous Assurance Engine is the dedicated one; the Reconciliation Engine and Predictive Maintenance System also detect outliers in their domains. Anomaly detection is one of Zabble’s four pillars.',
      },
    ],
  },
  'analytics': {
    slug: 'analytics',
    h1: 'Analytics — decisions on facts, not hunches',
    intro:
      'The data you already have, turned into a clear picture of what’s happening and what matters — shaped for the person making the decision.',
    metaTitle: 'Business Analytics & Decision Support · Zabble',
    metaDescription:
      'What business analytics is, what it does, and how Zabble composes role-specific views where every number opens its source, the decision it informs, and the next action.',
    answer: {
      question: 'What is business analytics?',
      answer:
        'Business analytics turns the data a business already generates into a clear picture of what’s happening and what matters, so decisions get made on facts instead of hunches. Zabble shapes analytics by role, so each person sees only the numbers that feed the decisions they make — and every number opens its source and next action.',
    },
    faqs: [
      {
        question: 'What does business analytics do?',
        answer:
          'It composes operational data into the few numbers each role actually needs, at the cadence their decisions live on. Instead of a 47-widget dashboard nobody reads, each person opens one screen showing the decisions they have to make today, with the next action attached.',
      },
      {
        question: 'What are the types of business analytics?',
        answer:
          'Commonly four: descriptive (what happened), diagnostic (why), predictive (what’s likely), and prescriptive (what to do). Zabble’s analytics suite blends these into role-specific views, and pairs with the Forecasting engine for the predictive layer.',
      },
      {
        question: 'How is this different from a BI dashboard?',
        answer:
          'A generic dashboard displays data; a Zabble analytics layer drives a decision. Every number opens its calculation, its source systems, the decision it informs, and the next action — and the morning briefing arrives in Slack before the operator does.',
      },
      {
        question: 'Which Zabble systems deliver analytics?',
        answer:
          'The Analytics & Decision Support Suite is the dedicated one; Forecasting, the Bespoke CRM, and Kairos also surface analytics in their domains. Analytics is one of Zabble’s four pillars.',
      },
    ],
  },
}

export const PILLAR_HUB_LIST: PillarHub[] = Object.values(PILLAR_HUBS)
