// Editorial engine — single source of truth for Zabble's AEO/GEO-native content.
//
// Owned by the Content session (seo/10-content). Each Article renders as a
// server-rendered page: clusters at /blog/<slug>, the four pillar hubs at
// /what-we-build/<pillar>, and the thesis hub at /what-we-build.
//
// Structure is deliberately data-first so that:
//   - every page renders the same answer-first → body → FAQ → sources shape,
//   - tests can assert AEO/GEO invariants (answer length, ≥1 cited stat, FAQ,
//     resolving internal links, no two posts sharing a primary intent),
//   - S08 can attach Article/FAQPage JSON-LD from the same fields (hand-off),
//   - S09 can generate OG images from title + dek (hand-off).
//
// CITATION CONTRACT: every <sup> citation in `bodyHtml` is
//   <sup class="cite"><a href="#ref-N">N</a></sup>
// and must have a matching `sources[i].id === 'ref-N'`. The template renders
// the numbered reference list from `sources`. Statistics carry number + source
// + year and link to a real, verifiable URL. Named "expert" commentary is
// Zabble's own practitioner voice (first-party), never a fabricated third-party
// attribution — see audits/10-content.md §0a.

import type { PillarSlug } from '~/data/systems'
import { PILLARS, SYSTEMS } from '~/data/systems'

/** Canonical production origin (the live site). S01 owns any future override. */
export const SITE_URL = 'https://zabble.org'

export type ArticleKind = 'thesis' | 'pillar' | 'cluster'

/** Market focus, per the editorial calendar §5. */
export type Market = 'za-core' | 'broader-africa' | 'global-english'

export const MARKET_LABEL: Record<Market, string> = {
  'za-core': 'South Africa — core',
  'broader-africa': 'Broader Africa',
  'global-english': 'Global English',
}

export interface ArticleSource {
  /** Must match the `#ref-N` anchor used by <sup> citations in bodyHtml. */
  id: string
  /** Short statement of what this source backs (shown in the reference list). */
  claim: string
  publisher: string
  title: string
  year: number
  url: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface InternalLink {
  href: string
  label: string
  /** 'up' to pillar/entity, 'across' to sibling/module, 'down' to module pages. */
  rel: 'up' | 'across' | 'down'
}

export interface Article {
  slug: string
  kind: ArticleKind
  /** Set for kind === 'pillar'; the hub lives at /what-we-build/<pillarSlug>. */
  pillarSlug?: PillarSlug
  /** H1 / on-page title. */
  title: string
  /** Short dek shown under the H1 and in listings. */
  dek: string
  /** <title> — keep ≤ 62 chars where possible. */
  metaTitle: string
  /** meta description — keep ≤ 165 chars. */
  metaDescription: string
  /** Absolute path; canonical = SITE_URL + canonicalPath. Unique per article. */
  canonicalPath: string
  /** Keyword cluster from targets/keyword-map.md. */
  cluster: string
  /** The ONE primary intent this page owns — unique across all articles. */
  primaryIntent: string
  market: Market
  /** Pillar tags (for cross-linking + the four-pillar entity). */
  pillars: PillarSlug[]
  /** Canonical money page this piece supports (clusters). */
  moduleSlug?: string
  /** Module money pages a hub links DOWN to. */
  relatedModules: string[]
  /** Sibling article slugs to cross-link. */
  relatedArticles: string[]
  readMinutes: number
  /** ISO date for the dateline + RSS. */
  publishedISO: string
  updatedISO?: string
  /** Answer-first intro: 40–60 words, liftable, plain text. */
  answer: string
  /** Rich body HTML (h2/h3/p/ul/blockquote + inline <a> + <sup> citations). */
  bodyHtml: string
  faq: FaqItem[]
  sources: ArticleSource[]
  internalLinks: InternalLink[]
  cta: { text: string; href: string }
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export const ARTICLES: Article[] = [
  // === Cluster 07 — POPIA & regulatory reporting automation (ZA-core) ========
  {
    slug: 'popia-regulatory-reporting-automation',
    kind: 'cluster',
    title: 'POPIA & regulatory reporting automation: build the return from data you already have',
    dek: 'How South African banks, FSPs and NGOs turn a quarter-end reporting scramble into a controlled, evidenced process — without buying another off-the-shelf tool.',
    metaTitle: 'POPIA & Regulatory Reporting Automation (South Africa)',
    metaDescription:
      'How to automate POPIA, SARB and donor reporting in South Africa: pull data from your own systems, validate against the rule pack, and trace every figure to its source.',
    canonicalPath: '/blog/popia-regulatory-reporting-automation',
    cluster: 'compliance-reporting',
    primaryIntent: 'how to automate popia and regulatory reporting (informational)',
    market: 'za-core',
    pillars: ['audit-trails', 'automation', 'analytics'],
    moduleSlug: 'compliance-reporting',
    relatedModules: ['compliance-reporting', 'data-routing', 'reconciliation-engine'],
    relatedArticles: ['audit-trails', 'transaction-fraud-detection-fsp'],
    readMinutes: 8,
    publishedISO: '2026-06-04',
    answer:
      "Regulatory reporting automation is a system that knows which of your data sources each submission draws from, pulls the figures itself, validates them against the regulator's rule pack, and traces every number back to its source row. For POPIA, SARB, or donor reports, it turns a quarter-end scramble into an answer auditors get in seconds.",
    bodyHtml: `
<p>Every quarter, the same scramble. Numbers pulled by hand from the loan book, the general ledger and the CRM. A finance lead reconciling six spreadsheets at 11pm, signing off on figures they don't fully trust. The auditor asks where a number came from and nobody can answer for ninety minutes. In South Africa, the cost of one wrong submission isn't paperwork — it's a SARB penalty, a POPIA fine, or a donor walking back next year's grant.</p>

<h2 id="what-is-popia-compliance">What is POPIA compliance?</h2>
<p>POPIA — the Protection of Personal Information Act — is South Africa's data-protection law. Compliance means you process personal information lawfully, keep it secure, and can <em>prove</em> both on demand. The Information Regulator can issue an infringement notice carrying an administrative fine of up to <strong>R10 million</strong>, and the most serious offences carry up to <strong>10 years' imprisonment</strong>.<sup class="cite"><a href="#ref-1">1</a></sup> This is not theoretical: the Regulator issued its first enforcement fine — <strong>R5 million</strong> — in 2023.<sup class="cite"><a href="#ref-2">2</a></sup></p>
<p>The reporting burden that follows is the part most teams underestimate. Proving lawful processing, answering a data-subject request, filing a SARB return, or producing a donor report all draw on the same operational data — and in most organisations that data lives in systems that don't talk to each other.</p>

<h2 id="why-manual-breaks">Why quarter-end reporting breaks when it's manual</h2>
<p>The failure is structural, not a discipline problem. The general ledger holds one slice of the truth, the payroll register another, the CRM a third, the banking core a fourth. Four people spend three days emailing the pieces back and forth to assemble one return. By the time it ships, the finance lead has stopped trusting the pack she signed — and when the regulator asks how a figure was derived, the answer lives in someone's head, not in the system.</p>

<h2 id="how-to-automate">How to automate regulatory &amp; compliance reporting</h2>
<p>The Zabble approach is a reporting engine that <strong>knows which systems each submission draws from and pulls the data itself</strong> — not another dashboard you feed by hand. We build it in three moves:</p>
<h3 id="map-sources">Map each submission to its source systems</h3>
<p>A POPIA filing, a SARB return, an NGO donor report and a tax submission each have a known shape. We map every required field to the system of record that produces it, so the engine reads from source rather than from a re-keyed spreadsheet.</p>
<h3 id="validate-live">Validate live against the rule pack</h3>
<p>Validations run against the regulator's rule pack as the data lands. Exceptions surface with a one-line cause and a human action — not a silent wrong number. When a source drops offline, the pipeline degrades to a known fallback instead of quietly publishing a gap.</p>
<h3 id="trace-figures">Trace every figure to its source row</h3>
<p>Click any number in the finished return and the lineage unrolls back to the row that produced it. The audit trail isn't a separate artefact you assemble later — <a href="/what-we-build/audit-trails">it is the document itself</a>. The same engine, repointed at different sources and rule packs, produces a banking return on Thursday and a donor report the following week.</p>

<blockquote class="pull-quote"><p>"Every figure traces back to its source row. When the auditor asks where 22.8% came from, the answer is a click, not a ninety-minute hunt."</p><cite>— Zabble engagement lead, compliance &amp; reporting builds</cite></blockquote>

<h2 id="what-changes">What changes</h2>
<p>Quarter-end stops being a fortnight of late nights. The same engine produces four kinds of submission from the data you already generate, validated and evidenced. The risk of a wrong filing turns from a gamble into a controlled, audited process — and the finance team goes back to finance.</p>
<p>This is one expression of a <a href="/systems/compliance-reporting">compliance &amp; regulatory reporting engine</a>; it usually sits alongside a <a href="/systems/data-routing">data-routing pipeline</a> and, where filings draw on matched ledgers, an automated <a href="/systems/reconciliation-engine">reconciliation engine</a>. None of it is bought off a shelf — it's <a href="/what-we-build/bespoke-systems">shaped to how your business actually files</a>.</p>
`,
    faq: [
      {
        q: 'What is POPIA compliance?',
        a: "POPIA compliance means processing personal information lawfully and securely under South Africa's Protection of Personal Information Act — and being able to prove it. Non-compliance can draw an administrative fine of up to R10 million.",
      },
      {
        q: 'How do you get POPIA compliant?',
        a: 'Map what personal information you hold and why, secure it, document your lawful basis and retention, appoint an Information Officer, and keep an evidence trail you can produce on demand. Automating the reporting side is what makes that trail sustainable quarter after quarter.',
      },
      {
        q: 'What are the key compliance requirements of POPIA?',
        a: 'Lawful, minimal processing for a defined purpose; data-subject rights (access, correction, deletion); security safeguards; breach notification; and accountability — being able to demonstrate compliance to the Information Regulator.',
      },
      {
        q: 'Can regulatory reporting be automated?',
        a: 'Yes. A reporting engine can pull figures directly from your source systems, validate them against the regulator’s rule pack, and trace every number back to its origin — replacing hand-assembled spreadsheets for POPIA, SARB and donor returns alike.',
      },
    ],
    sources: [
      {
        id: 'ref-1',
        claim: 'POPIA administrative fines up to R10 million; serious offences up to 10 years’ imprisonment.',
        publisher: 'POPIA (popia.co.za), Section 109 — Administrative fines',
        title: 'Section 109 Administrative fines',
        year: 2021,
        url: 'https://popia.co.za/section-109-administrative-fines/',
      },
      {
        id: 'ref-2',
        claim: 'Information Regulator issued its first POPIA enforcement fine of R5 million in 2023.',
        publisher: 'Bowmans',
        title: 'Information Regulator issues first fine of ZAR 5 million under POPIA',
        year: 2023,
        url: 'https://bowmanslaw.com/insights/south-africa-beware-information-regulator-issues-first-fine-of-zar-5-million-under-popia/',
      },
    ],
    internalLinks: [
      { href: '/what-we-build/audit-trails', label: 'Audit trails & compliance automation', rel: 'up' },
      { href: '/systems/compliance-reporting', label: 'Compliance & Regulatory Reporting Engine', rel: 'down' },
      { href: '/systems/data-routing', label: 'Data Routing Pipeline', rel: 'across' },
      { href: '/systems/reconciliation-engine', label: 'Reconciliation Engine', rel: 'across' },
      { href: '/blog/transaction-fraud-detection-fsp', label: 'Fraud & anomaly detection for FSPs', rel: 'across' },
      { href: '/what-we-build/bespoke-systems', label: 'Why bespoke, not off-the-shelf', rel: 'up' },
    ],
    cta: { text: 'Which return costs your team the most every quarter? Tell us — we’ll build the one that files itself.', href: '/diagnose' },
  },

  // === Pillar 02 — Business process automation (Automation hub) =============
  {
    slug: 'automation',
    kind: 'pillar',
    pillarSlug: 'automation',
    title: 'Business process automation in South Africa: a practical guide',
    dek: 'What to automate first, how bespoke automation differs from off-the-shelf tools, and what changes when the repetitive work runs itself.',
    metaTitle: 'Business Process Automation in South Africa | Zabble',
    metaDescription:
      'A practical guide to business process automation for South African businesses: what to automate first, bespoke vs off-the-shelf, and what actually changes.',
    canonicalPath: '/what-we-build/automation',
    cluster: 'automation',
    primaryIntent: 'business process automation pillar guide (informational/commercial)',
    market: 'global-english',
    pillars: ['automation'],
    relatedModules: [
      'reconciliation-engine',
      'workflow-orchestrator',
      'approval-workflow',
      'integration-hub',
      'multi-channel-inbox',
      'client-onboarding',
    ],
    relatedArticles: ['automate-bank-reconciliation', 'integration-hub-vs-zapier', 'bespoke-systems'],
    readMinutes: 9,
    publishedISO: '2026-06-04',
    answer:
      'Business process automation hands the repetitive, rule-based parts of a workflow — the weekly spreadsheet, the copy-paste between two systems, the follow-up nobody got to — to software, so your people spend their time only on work that genuinely needs a human. Done well, it plugs the leaks that quietly cost a business time and money every week.',
    bodyHtml: `
<p>Every business runs on workflows. The same spreadsheet, filled out every week. The same data, copied between two systems that don't talk. The same decision, made on the same handful of inputs. The real question isn't whether you <em>could</em> automate — it's which workflow is quietly bleeding you of the most time, money or peace of mind, and what it would take to make it run itself.</p>

<h2 id="what-is-bpa">What is business process automation?</h2>
<p>Business process automation (BPA) is using software to carry out a repeatable, rule-based business process with little or no manual intervention. The opportunity is large and well-documented: the McKinsey Global Institute found that <strong>about 60% of all occupations have at least 30% of their activities that could be automated</strong> with currently demonstrated technology, while only around 5% of jobs could be fully automated.<sup class="cite"><a href="#ref-1">1</a></sup> Read correctly, that's the whole point — automation takes the <em>tasks</em>, not the jobs.</p>

<h2 id="what-it-looks-like">What does it actually look like in a South African business?</h2>
<p>It rarely looks like robots. It looks like the three things that show up in almost every discovery session:</p>
<h3 id="the-spreadsheet">The spreadsheet three people fill in by hand</h3>
<p>One workbook, owned by one person, re-keyed every week. When they're on leave, the process stops. Automation reads the source data once and produces the output without the re-keying.</p>
<h3 id="the-five-tools">The data trapped in five tools that don't talk</h3>
<p>A booking lands in one system; the invoice, the CRM contact and the calendar slot get created by hand the next morning — or don't. <a href="/systems/integration-hub">An integration hub</a> makes one event ripple through every system that should know about it, in seconds.</p>
<h3 id="the-gut-decision">The decision made on gut feel because the dashboard doesn't exist</h3>
<p>The reorder, the staffing call, the discount approval — made on memory because the number that should inform it isn't in front of anyone. Automation can put the decision, and its inputs, on the right person's screen at the right moment.</p>

<h2 id="what-first">Which processes are worth automating first?</h2>
<p>Pick the workflow that scores highest on three axes at once: <strong>most repetitive, most error-prone, most expensive when it goes wrong</strong>. A weekly reconciliation that takes a day and occasionally ships a wrong number to the board beats a quarterly task nobody minds doing by hand. If you're not sure, our <a href="/diagnose">two-minute diagnose flow</a> is built to surface it.</p>

<h2 id="bespoke-vs-off-the-shelf">Bespoke automation vs Zapier, RPA and off-the-shelf tools</h2>
<p>Off-the-shelf automation is excellent until your process has a branch the tool didn't anticipate, a volume it wasn't priced for, or an audit requirement it can't satisfy. Then the "no-code" automation becomes a fragile web of zaps that one person understands. Zabble builds automation <a href="/what-we-build/bespoke-systems">shaped to your workflow</a> — with the exceptions, the audit trail and the escalation path designed in from the start, because the workflow <em>is</em> the product.</p>

<blockquote class="pull-quote"><p>"We automate the parts of a business that shouldn't need a human anymore — so the people you have can focus on the work only people can do."</p><cite>— Zabble, on what to automate</cite></blockquote>

<h2 id="what-changes">What changes after automation</h2>
<p>The work that used to get dropped stops getting dropped. Order-to-dispatch lag falls from a day to seconds. An intake queue that ate three people's mornings becomes a tray of exceptions. And because every step is logged, you can finally answer "did that actually happen?" with evidence rather than a hopeful yes.</p>
<p>Automation is the first of Zabble's four pillars — it usually arrives woven together with <a href="/what-we-build/audit-trails">audit trails</a>, <a href="/what-we-build/anomaly-detection">anomaly detection</a> and <a href="/what-we-build/analytics">analytics</a>. Start with the process costing you the most; the rest follows. See it in practice in <a href="/blog/automate-bank-reconciliation">automating bank &amp; POS reconciliation</a>.</p>
`,
    faq: [
      {
        q: 'What is business process automation?',
        a: 'Business process automation uses software to carry out repeatable, rule-based work with little or no manual intervention — for example, generating a report from source data instead of re-keying a spreadsheet every week.',
      },
      {
        q: 'What business processes should I automate first?',
        a: 'Start with the workflow that is at once the most repetitive, the most error-prone, and the most expensive when it goes wrong. That combination, not raw frequency, is where automation pays back fastest.',
      },
      {
        q: 'How is bespoke automation different from Zapier or RPA?',
        a: 'Off-the-shelf tools handle the happy path well but struggle with branches, volume and audit requirements. Bespoke automation is designed around your actual workflow, with exceptions, audit trails and escalation built in.',
      },
      {
        q: 'Will automation replace my staff?',
        a: 'Typically no. McKinsey found only about 5% of jobs are fully automatable, while most jobs have a portion of tasks that are. Automation removes the repetitive tasks so your team spends time on the work that needs a human.',
      },
    ],
    sources: [
      {
        id: 'ref-1',
        claim: 'About 60% of occupations have at least 30% of activities that could be automated; ~5% of jobs are fully automatable.',
        publisher: 'McKinsey Global Institute',
        title: 'A Future That Works: Automation, Employment, and Productivity',
        year: 2017,
        url: 'https://www.mckinsey.com/featured-insights/digital-disruption/harnessing-automation-for-a-future-that-works',
      },
    ],
    internalLinks: [
      { href: '/what-we-build/bespoke-systems', label: 'Why bespoke, not off-the-shelf', rel: 'up' },
      { href: '/what-we-build/audit-trails', label: 'Audit trails', rel: 'across' },
      { href: '/what-we-build/anomaly-detection', label: 'Anomaly detection', rel: 'across' },
      { href: '/what-we-build/analytics', label: 'Analytics', rel: 'across' },
      { href: '/systems/integration-hub', label: 'Integration Hub', rel: 'down' },
      { href: '/systems/reconciliation-engine', label: 'Reconciliation Engine', rel: 'down' },
      { href: '/blog/automate-bank-reconciliation', label: 'Automating bank & POS reconciliation', rel: 'across' },
      { href: '/diagnose', label: 'Diagnose your most expensive process', rel: 'across' },
    ],
    cta: { text: 'Point us at the process that’s costing you the most. We’ll show you what it looks like running itself.', href: '/diagnose' },
  },
]

// ---------------------------------------------------------------------------
// Derived lookups
// ---------------------------------------------------------------------------

export const CLUSTER_ARTICLES = ARTICLES.filter((a) => a.kind === 'cluster')

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

export function clusterArticleBySlug(slug: string): Article | undefined {
  return CLUSTER_ARTICLES.find((a) => a.slug === slug)
}

export function pillarArticle(pillarSlug: PillarSlug): Article | undefined {
  return ARTICLES.find((a) => a.kind === 'pillar' && a.pillarSlug === pillarSlug)
}

export function thesisArticle(): Article | undefined {
  return ARTICLES.find((a) => a.kind === 'thesis')
}

export function articleByPath(path: string): Article | undefined {
  return ARTICLES.find((a) => a.canonicalPath === path)
}

/** Every internal route the content layer expects to resolve (for link-check). */
export function knownRoutes(): Set<string> {
  const routes = new Set<string>(['/', '/systems', '/diagnose', '/blog', '/what-we-build'])
  for (const s of SYSTEMS) routes.add(`/systems/${s.slug}`)
  for (const p of PILLARS) routes.add(`/what-we-build/${p.slug}`)
  routes.add('/what-we-build/bespoke-systems')
  for (const a of CLUSTER_ARTICLES) routes.add(`/blog/${a.slug}`)
  return routes
}
