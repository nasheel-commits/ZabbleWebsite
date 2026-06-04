// AEO content (S07) — answer-first blocks + FAQs for every system money page.
//
// Single source of truth for per-system AEO copy, merged onto SYSTEMS at module
// load by app/data/systems.ts. Authored to the answer-block standard
// (docs/seo/content/aeo-standard.md): a question-led heading, a self-contained
// 40–60 word answer first, then the page's existing detail. Questions are shaped
// from real South-African SERP People-Also-Ask data captured in
// docs/seo/_evidence/07/. Answers stay true to Zabble's bespoke model — outcomes
// are framed as representative ("in a Zabble build"), never guaranteed.
//
// The exact strings here are what render server-side AND what S08 marks up as
// FAQPage / QAPage JSON-LD — they must stay byte-identical. Do not reword in a
// template; edit here. Regression tests in test/aeo.spec.ts enforce the 40–60
// word budget, the ≥3-FAQ minimum, and data↔rendered-HTML byte-consistency.

/**
 * AEO answer block — a question-led heading paired with a self-contained,
 * 40–60 word answer an answer engine (PAA, AI Overview) can lift verbatim.
 */
export interface AnswerBlock {
  /** The question, phrased as a user would ask it. Rendered as a heading. */
  question: string
  /** Self-contained answer, 40–60 words, liftable without surrounding context. */
  answer: string
}

/** A single FAQ entry. Feeds on-page FAQs and (via S03/S08) FAQPage JSON-LD. */
export interface Faq {
  question: string
  answer: string
}

export interface SystemAeo {
  answer: AnswerBlock
  faqs: Faq[]
}

export const AEO_CONTENT: Record<string, SystemAeo> = {
  // ---- Originally populated (session 1) ------------------------------------
  'bespoke-crm': {
    answer: {
      question: 'What is a bespoke CRM?',
      answer:
        'A bespoke CRM is a customer relationship management system built around how your team actually sells — your real pipeline stages, automations, and channels — instead of a generic template. Moving a deal between stages triggers the right work automatically, and every interaction lands on one timeline, so the pipeline reflects what is really happening.',
    },
    faqs: [
      {
        question: 'How is a bespoke CRM different from an off-the-shelf CRM?',
        answer:
          'An off-the-shelf CRM makes your team fit its stages and fields. A bespoke CRM is shaped to your real pipeline: stages match how you sell, automations fire at the right step, and every channel lands on one deal timeline. Zabble builds it around your process, not someone else’s playbook.',
      },
      {
        question: 'When should a business build a bespoke CRM?',
        answer:
          'Build a bespoke CRM when your pipeline lives in three places that disagree, your stages don’t match how you actually sell, or reps have stopped trusting the system. If an off-the-shelf tool forces workarounds for site visits, quotes, or e-sign steps, a system shaped to your process usually pays back quickly.',
      },
      {
        question: 'How much does a bespoke CRM cost in South Africa?',
        answer:
          'Cost depends on how much of the pipeline it automates and how many systems it connects. A focused CRM for one sales team costs far less than one wired into quoting, e-sign, and ops. Zabble scopes it in a discovery session, so the price is set against your process before any build starts.',
      },
      {
        question: 'Can a bespoke CRM connect to our existing tools?',
        answer:
          'Yes. Zabble builds the CRM to sit on top of the tools you already run — email, WhatsApp, quoting, e-sign, accounting — so every interaction lands on one deal timeline. Where a system can’t be replaced, we bridge to it rather than forcing a migration.',
      },
    ],
  },
  'document-intelligence': {
    answer: {
      question: 'What is a document intelligence system?',
      answer:
        'A document intelligence system reads each document the moment it arrives, extracts and validates the fields, and routes it where it belongs — so a team only handles the exceptions. It replaces manual data entry from invoices, IDs, statements, and forms with an intake pipeline where every extraction and routing decision is timestamped and replayable.',
    },
    faqs: [
      {
        question: 'What is document automation?',
        answer:
          'Document automation is software that reads incoming documents, pulls the required fields, checks them against rules, and routes the work — without a person keying data by hand. In a Zabble build, intake time on a document dropped from around forty minutes to under four seconds, with humans handling only flagged exceptions.',
      },
      {
        question: 'Can document automation read scanned or handwritten forms?',
        answer:
          'Yes — OCR reads scanned documents, and validation rules catch what is unclear. Anything the system can’t confidently read is routed to a human-review tray with the exact reason it stopped, rather than guessed. Zabble tunes the classification and validation to the document shapes a specific business actually receives.',
      },
      {
        question: 'How accurate is automated document extraction?',
        answer:
          'Accuracy depends on document quality and how well the validation rules are tuned. Rather than trusting every read, a well-built system validates structure — ID checksums, statement totals, signature blocks — and sends low-confidence cases to a person. The goal isn’t zero human involvement; it is that people only see the exceptions.',
      },
      {
        question: 'What documents can it process?',
        answer:
          'Invoices, IDs, bank statements, KYC packets, applications, contracts, and correspondence — any back-office paper where the same fields are keyed by hand each day. Zabble sits with the intake team first, because the routing rules differ by business, then builds the pipeline around the documents that actually arrive.',
      },
    ],
  },
  'reconciliation-engine': {
    answer: {
      question: 'What is reconciliation automation?',
      answer:
        'Reconciliation automation matches transactions across ledgers — POS, bank, accounting, processor, inventory — in the background, clearing the easy matches in seconds and surfacing only the exceptions that need a person. It turns a weekly export-and-chase across three sources of truth into a short queue of real mismatches, with each resolved rule reused next time.',
    },
    faqs: [
      {
        question: 'Can bank reconciliation be automated?',
        answer:
          'Yes. A reconciliation engine ingests each ledger as it lands, auto-matches transactions that agree, and routes only genuine mismatches to a person. In a Zabble build, a queue of around ten thousand lines became a handful of real exceptions — and resolving one by hand teaches the engine to auto-clear that kind next time.',
      },
      {
        question: 'Can AI be used for reconciliation?',
        answer:
          'AI helps where rules alone fall short — learning resolution patterns so recurring exceptions clear themselves. Zabble pairs explicit matching rules with learned ones, so the engine stays auditable: every match carries the rule that made it. The aim is fewer manual matches, not a black box finance can’t explain.',
      },
      {
        question: 'What ledgers can a reconciliation engine match?',
        answer:
          'POS against bank and processor, accounting against inventory and invoices, processor against invoices — any pair or set of ledgers that should agree but never quite do. The same engine handles different ledger combinations; only the matching rules change for each source.',
      },
      {
        question: 'How long does automated reconciliation take?',
        answer:
          'Easy matches clear in seconds as each ledger lands, so finance stops waiting for a weekly export. The work that remains is the small set of true exceptions a person actually needs to judge — turning reconciliation from data entry into decisions.',
      },
    ],
  },
  'continuous-assurance': {
    answer: {
      question: 'What is anomaly detection in business?',
      answer:
        'Anomaly detection in business is automated monitoring that watches a stream of activity — transactions, operations, sensor data — and flags what is unusual before it becomes a problem: the fraud, the error, the drift, the outlier. Zabble’s engine surfaces only the cases that matter, each with the rule, history, and suggested action attached.',
    },
    faqs: [
      {
        question: 'What is AI anomaly detection?',
        answer:
          'AI anomaly detection learns the shape of normal activity and flags departures from it, catching patterns fixed rules miss. Zabble compounds a bespoke rules-based decision engine with a model that learns over time, so detection improves while every flag still carries its reason — keeping the system auditable, not a black box.',
      },
      {
        question: 'What does an anomaly detection system do?',
        answer:
          'It monitors a high-traffic stream no human could realistically watch, applies detectors tuned to what counts as unusual for that business, and surfaces only the cases that matter — each with its rule, history, and suggested action. Every decision lands in an immutable audit trail keyed by case ID.',
      },
      {
        question: 'What risks can continuous monitoring catch?',
        answer:
          'Fraud in transactions, drift in operations, equipment failure, and outliers in performance — risks that share one shape: a tiny signal hidden inside an ocean of normal activity. Sampling misses them; continuous monitoring catches them at volume, dropping mean time to detection from days toward seconds.',
      },
      {
        question: 'How is this different from sampling or manual review?',
        answer:
          'Manual review and sampling only ever see a fraction of activity, so the events that hurt most are the ones missed. A continuous assurance engine reads the whole stream, flags only genuine exceptions, and hands investigators cases with the evidence already attached — instead of leaving them to triage false positives by hand.',
      },
    ],
  },
  'compliance-reporting': {
    answer: {
      question: 'What is regulatory reporting automation?',
      answer:
        'Regulatory reporting automation assembles the submissions regulators, auditors, donors, and boards expect directly from the systems that already hold the data — validating each figure live against the rule pack and tracing it back to its source row. It replaces a quarter-end scramble across spreadsheets with a controlled, evidenced process auditors can follow in seconds.',
    },
    faqs: [
      {
        question: 'Can POPIA and regulatory reporting be automated?',
        answer:
          'Yes. A reporting engine knows which systems each submission draws from, pulls the data itself, and validates it against the regulator’s rule pack. The same engine can produce a SARB banking return, a POPIA filing, an NGO donor report, or a tax submission — each figure traced to the source row that produced it.',
      },
      {
        question: 'How does automated reporting reduce compliance risk?',
        answer:
          'It removes the hand-keyed spreadsheet step where wrong numbers creep in. Validations run live, exceptions surface with a one-line cause and a human action, and every figure traces to its source. A wrong submission’s cost — a SARB penalty, a POPIA fine, a donor walking — is met with an evidenced, repeatable process.',
      },
      {
        question: 'What reports can the engine produce?',
        answer:
          'Banking regulatory returns, POPIA filings, tax submissions, and donor reports — any recurring submission assembled from operational data. The same engine, repointed at different sources and rule packs, produces several kinds of report, so each new return reuses the validated pipeline rather than starting from scratch.',
      },
    ],
  },
  'kairos': {
    answer: {
      question: 'What is an AI receptionist?',
      answer:
        'An AI receptionist is a voice-first agent that answers calls, handles bookings and follow-up, and logs every interaction — so a team isn’t tied to the phone. Zabble’s Kairos engine acts as receptionist, event coordinator, and outbound caller, running the full arc around an event and never sending a call to voicemail.',
    },
    faqs: [
      {
        question: 'What can an AI voice agent do?',
        answer:
          'It answers inbound calls, confirms and chases bookings, recovers no-shows with morning-of reminder calls, runs outbound outreach, and updates the CRM — each call and message logged with the reasoning that fired it. Kairos handles the relationship admin that normally consumes a person, at any hour and at scale.',
      },
      {
        question: 'Does an AI receptionist replace staff?',
        answer:
          'No — it removes the switchboard work so staff do the work only people can. Kairos answers what would otherwise go to voicemail and handles routine confirmations and follow-up; anything needing judgment still reaches a person, with the context already attached. The goal is freeing the team, not removing it.',
      },
      {
        question: 'What businesses is a voice agent for?',
        answer:
          'Event businesses running conferences, expos, or weddings; any business needing a reception line answered after hours or at scale; and clinics, agencies, and service firms fielding constant inbound — anywhere the cost of a missed call or a dropped follow-up is a lost booking.',
      },
    ],
  },
  'workflow-orchestrator': {
    answer: {
      question: 'What is workflow automation?',
      answer:
        'Workflow automation makes one business event trigger the right action in every other system automatically — no copy-paste between tools. Zabble’s orchestrator listens for events like a new order and fans them out across invoicing, stock, dispatch, and CRM, with retries, fallbacks, and a human escalation of last resort, every step logged.',
    },
    faqs: [
      {
        question: 'What is an example of workflow automation?',
        answer:
          'A new order fires once and, within seconds, becomes an invoice, a stock update, a dispatch ticket, a CRM record, and a customer email — instead of someone copy-pasting between six tools the next morning. If a step fails it retries, then falls back, then pages a person with the reason attached.',
      },
      {
        question: 'How is workflow automation different from a Zap or script?',
        answer:
          'Simple zaps break quietly and forget steps. An event-driven orchestrator retries on failure, falls back when retries fail, escalates to a human as a last resort, and logs every signal — fired, succeeded, failed, escalated — in an immutable event log. Workflows reshape from config, so adding a step needs no re-engineering.',
      },
      {
        question: 'Can workflows change without engineering?',
        answer:
          'Yes. Steps are configuration, not code — add a “notify supplier” step after dispatch and the next run includes it. That keeps the system in the hands of the business rather than waiting on a developer for every change.',
      },
    ],
  },

  // ---- Newly populated (session 2 — boil the ocean) ------------------------
  'approval-workflow': {
    answer: {
      question: 'What is approval workflow automation?',
      answer:
        'Approval workflow automation routes a decision — a loan, grant, purchase order, or invoice — to the right people in the right order by rule, instead of by inbox. The next approver sees it the instant the previous one signs off, and every decision, comment, and condition lands in an evidence pack a regulator can read as-is.',
    },
    faqs: [
      {
        question: 'What is an approval workflow?',
        answer:
          'An approval workflow is the defined path a request takes to get signed off — who approves, in what order, under what conditions. Automating it means the chain reshapes itself by rule (threshold, role, amount), so work moves the moment the last signature lands instead of sitting in someone’s inbox.',
      },
      {
        question: 'What is an example of an approval workflow?',
        answer:
          'A loan that needs only a manager below R100k but adds a credit committee above it; a grant that needs finance then a director; a purchase order that routes by amount. In each, crossing a threshold changes who must sign — and Zabble encodes that rule so the right approvers join automatically.',
      },
      {
        question: 'How does automation speed up approvals?',
        answer:
          'It removes the inbox wait. The next approver is notified the instant the previous one signs, conditional approvals bind to the disbursement instead of getting lost in conversation, and audit response moves from a week of digging through email to a one-click export of the evidence pack.',
      },
    ],
  },
  'multi-channel-inbox': {
    answer: {
      question: 'What is a multi-channel inbox?',
      answer:
        'A multi-channel inbox pulls every inbound channel — email, WhatsApp, SMS, web forms, social DMs, voicemail — into one classified, routed queue, so nothing slips because nobody was watching the channel it arrived on. Each message lands on the right person’s screen in seconds, and replies go back out on the channel the message came in on.',
    },
    faqs: [
      {
        question: 'How does a shared inbox work?',
        answer:
          'Messages from every channel flow into one stream; each is classified and routed to the right person rather than sitting in a mailbox everyone half-watches. Zabble builds the routing around your team, so a support query, a sales lead, and a complaint each reach the person who should own them.',
      },
      {
        question: 'What are the drawbacks of a generic shared mailbox?',
        answer:
          'A plain shared mailbox shows everything to everyone, so messages get missed, double-handled, or left because each person assumes another will reply. A routed multi-channel inbox fixes that: every message is classified, assigned, and tracked, and you can see which channel is quietly leaking leads.',
      },
      {
        question: 'Which channels can it bring together?',
        answer:
          'Email, WhatsApp, SMS, web forms, social DMs, and voicemail transcripts — the channels your customers actually use. Replies go back out on the same channel the message arrived on, so the customer never feels handed off between tools.',
      },
    ],
  },
  'decision-engine': {
    answer: {
      question: 'What is a decision engine?',
      answer:
        'A decision engine turns a judgment call into a consistent, explainable output. It encodes a policy as a weighted, branching rule set: each input is scored, each branch is explicit, and each output carries the trace that produced it. Confident cases clear automatically; only genuinely ambiguous ones reach a human.',
    },
    faqs: [
      {
        question: 'What does a decision engine do?',
        answer:
          'It applies the same policy to every case, so three reviewers stop reaching three different answers on the same inputs. Clear cases auto-approve at volume; disputes get answered by replaying the trace. The policy stops living in people’s heads and starts living in one auditable system.',
      },
      {
        question: 'How is a decision engine built?',
        answer:
          'Zabble encodes your policy as scored inputs and explicit branches, with thresholds and weights the business owns as configuration — so you change the policy without re-engineering the system. Where it helps, we compound the rules with a model that learns from past decisions.',
      },
      {
        question: 'Where is a decision engine used?',
        answer:
          'Lenders auto-approving applications against affordability and risk rules; sales qualifying leads or authorising discounts; accounting approving expenses; inventory setting reorder points. Anywhere different people currently reach different answers on the same inputs, a decision engine makes the outcome consistent and explainable.',
      },
    ],
  },
  'document-assembly': {
    answer: {
      question: 'What is document assembly software?',
      answer:
        'Document assembly software builds documents — proposals, contracts, statements, board reports — from the systems that already hold the truth, instead of from copy-paste and memory. It pulls each field from its live source and tags it, so the numbers stop contradicting each other and a two-hour proposal becomes an eight-minute one.',
    },
    faqs: [
      {
        question: 'What does document assembly software do?',
        answer:
          'It assembles a document by pulling every field from its live source — client details from the CRM, line items from the pricing engine, success stories from the case-study library — rather than rebuilding from scratch each time. Every field is tagged by source, and any human override stays visible.',
      },
      {
        question: 'How is document assembly different from a document management system?',
        answer:
          'A document management system stores and organises finished files. Document assembly generates the document in the first place, from live data, so the contract can’t contradict the proposal because both pull from the same record. The two solve different problems — assembly is about producing accurate documents, not filing them.',
      },
      {
        question: 'What documents can it assemble?',
        answer:
          'Proposals, contracts, monthly statements, and board reports — any high-value document that gets rebuilt from scratch each time. Pick the deal and the template, and the engine pulls each field from its live source, so the board report assembles itself on the first of the month.',
      },
    ],
  },
  'customer-360': {
    answer: {
      question: 'What is a customer 360 view?',
      answer:
        'A customer 360 view is a single record per customer, stitched from the systems already in use — sales, support, billing, product, marketing — so every team sees the same customer. Each team gets a role-specific lens on one shared timeline, ending the “four teams, four versions of the customer” problem.',
    },
    faqs: [
      {
        question: 'What does a 360-degree view of the customer mean?',
        answer:
          'It means every interaction a customer has had — sales, support, billing, product use, marketing — lands on one timeline, so no team has to keep two truths in their head. Account reviews stop opening with “wait, what’s the latest?” and customers stop repeating themselves.',
      },
      {
        question: 'How do you build a customer 360 view?',
        answer:
          'You stitch a single record per customer from the systems already running, rather than migrating them into one tool. Zabble assembles the timeline and gives Sales, Support, Finance, and CSM each a lens that surfaces the events and next actions relevant to their role — every event one click from its source.',
      },
      {
        question: 'What is a customer 360 also called?',
        answer:
          'It’s also called a unified customer record, a single customer view, or a 360-degree customer view. Whatever the name, the goal is the same: one shared, trustworthy timeline per customer that every team reads from instead of maintaining its own version.',
      },
    ],
  },
  'knowledge-assistant': {
    answer: {
      question: 'What is an internal knowledge assistant?',
      answer:
        'An internal knowledge assistant has read every SOP, contract, pricing rule, and policy a business runs on, and answers plain-English questions with every claim cited to its source. It kills the “where do I find…?” interrupt, and the questions it can’t answer surface the gaps that become your next SOPs.',
    },
    faqs: [
      {
        question: 'How is this different from a generic AI chatbot?',
        answer:
          'A generic chatbot answers from the public internet and can invent details. This assistant answers only from your business’s own SOPs, contracts, and policies, and cites the source for every claim — one click away — so staff trust the answer and can verify it.',
      },
      {
        question: 'What can staff ask it?',
        answer:
          'The returns rule, the complaint SOP, the casual-staff leave entitlement, the current pricing policy — the same handful of questions that otherwise interrupt three colleagues every week. They ask in plain English and get a plain-English answer with the source attached.',
      },
      {
        question: 'What happens to questions it can’t answer?',
        answer:
          'They’re flagged to the ops manager rather than guessed at. Each week the dashboard shows the questions the team actually asked — and the gaps it surfaces become the next SOPs you write, so the playbook improves itself.',
      },
    ],
  },
  'lead-qualifier': {
    answer: {
      question: 'What is lead qualification?',
      answer:
        'Lead qualification is deciding which inbound enquiries are worth a rep’s time, and how to handle the rest. An automated lead qualifier runs the first conversation with every enquiry, extracts a qualifying brief — intent, scope, timing, budget, urgency — and routes accordingly, so reps stop sorting the inbox and start working the leads worth working.',
    },
    faqs: [
      {
        question: 'How does automated lead qualification work?',
        answer:
          'Every inbound enquiry — web form, WhatsApp, voicemail, chat — gets a short structured exchange in the business’s voice. The system extracts a brief as the conversation lands and routes the lead: senior rep for high-value, a booked call for serious buyers, self-serve for price-shoppers, and a polite redirect for out-of-scope.',
      },
      {
        question: 'What is a qualified lead?',
        answer:
          'A lead the system can confidently place — it knows the intent, scope, timing, and budget well enough to route it and brief the rep. A R45k wedding enquiry with a date is qualified; a “do you rent cars?” message is out of scope and never reaches a rep.',
      },
      {
        question: 'What happens after a lead is qualified?',
        answer:
          'The rep who receives it gets the brief and a suggested approach, so the first call lands warm. Anything the system can’t confidently call goes to a human-review queue with the reason it paused — so no real lead is lost to an automated mistake.',
      },
    ],
  },
  'legacy-bridge': {
    answer: {
      question: 'What is legacy system integration?',
      answer:
        'Legacy system integration connects old systems — a decade-old ERP, an owner’s Excel workbook, a bespoke in-house tool — to modern AI workflows without rewriting them. A bridge reads and writes through each system’s existing surface, so the old systems keep doing their job while finally participating in modern automation, with no multi-year migration.',
    },
    faqs: [
      {
        question: 'What is a legacy system?',
        answer:
          'A legacy system is older software a business still depends on — a 2008 ERP, a critical spreadsheet, a bespoke tool that still outperforms anything off-the-shelf. It usually can’t be replaced cheaply, but leaving it disconnected stops every modern AI workflow at its walls.',
      },
      {
        question: 'Can you modernise without replacing the old system?',
        answer:
          'Yes — that’s the point of a bridge. Zabble reads and writes through each legacy system’s existing surface — a file watcher on the workbook, an ODBC read on the ERP, an API wrapper on the bespoke tool — so you get the upside of modernisation with none of the rewrite.',
      },
      {
        question: 'What does the bridge actually do?',
        answer:
          'Changes flow from the legacy system into a normalised event stream, an AI agent enriches them, the result lands in a modern database and SaaS, and the bridge writes the answer back to the legacy system through the same surface it read from — all without touching legacy code.',
      },
    ],
  },
  'inventory-clarity': {
    answer: {
      question: 'What is RFID inventory management?',
      answer:
        'RFID inventory management turns every physical movement of stock into a digital event, using RFID readers at each gate and bay, so the warehouse, the ledger, and the order system always agree. It replaces the clipboard count with a source of truth that updates itself in seconds — cutting cycle counts from a day to about ten minutes.',
    },
    faqs: [
      {
        question: 'How does RFID inventory tracking work?',
        answer:
          'RFID readers at every gate, bay, and dispatch lane detect tagged items as they move. Each motion becomes a digital event: the floor plan updates, the journal entry posts, and the linked order changes status — all within about two seconds, all from one source of truth.',
      },
      {
        question: 'What problem does RFID inventory solve?',
        answer:
          'The warehouse, the ledger, and the order system disagreeing — and someone walking the floor with a clipboard to find out which is right, by which time the count has moved again. With RFID the count is always current, so phantom stock disappears and finance stops reconciling stock by hand.',
      },
      {
        question: 'Who is it for?',
        answer:
          'Warehousing and distribution reconciling stock against the books, hospitality tracking linen and equipment, and manufacturing or tool stores managing high-value movable inventory — any operation where someone still walks the floor to find out which system is telling the truth.',
      },
    ],
  },
  'client-onboarding': {
    answer: {
      question: 'What is client onboarding automation?',
      answer:
        'Client onboarding automation runs a two-sided workflow that mirrors the client’s steps against the firm’s, firing KYC, file setup, and assignment automatically and escalating the moment something stalls. It compresses weeks of back-and-forth into days, so a cooling prospect doesn’t walk before anyone notices, and nothing sits in limbo.',
    },
    faqs: [
      {
        question: 'How do you automate client onboarding?',
        answer:
          'The client gets a single checklist; the firm sees a mirror queue. KYC, file setup, advisor assignment, and welcome packs fire from the client’s actions. If the client stalls, the system nudges by email, then WhatsApp, then escalates to the advisor — so follow-up stops being a person’s job.',
      },
      {
        question: 'What does it change for the firm?',
        answer:
          'Time-to-active drops from around fourteen days to under two. Advisors stop sending follow-up emails, compliance stops chasing the same form across inboxes, and when something does stall, the right person knows before the client notices.',
      },
      {
        question: 'Who is client onboarding automation for?',
        answer:
          'Wealth managers onboarding high-net-worth clients, banks and FSPs running KYC-heavy account opening, and professional services taking on new engagements — any firm where bringing on a client should take days but takes weeks.',
      },
    ],
  },
  'case-management': {
    answer: {
      question: 'What is case management software?',
      answer:
        'Case management software tracks a matter end to end — every owner, document, deadline, and decision on one timeline — and writes the audit trail as a by-product of running the work. Cases move across a board with SLA timers, advance automatically as events fire, and escalate themselves when a deadline breaches.',
    },
    faqs: [
      {
        question: 'Is a spreadsheet enough for case management?',
        answer:
          'A spreadsheet can’t enforce a deadline, route a case, or reconstruct who did what when, and it goes stale the moment work moves to email or WhatsApp. A case management system owns the lifecycle, so the timeline, the SLAs, and the audit trail are always current.',
      },
      {
        question: 'What can it manage?',
        answer:
          'Legal matters, NGO beneficiary files, HR incidents, and operational complaints — any work that passes through many hands over weeks. The same engine is shaped to each team that runs it, so the board and the rules match how that team actually works.',
      },
      {
        question: 'How does it help with audits and deadlines?',
        answer:
          'Every interaction, document, deadline, and decision sits on one timeline, so audit prep that took a fortnight becomes an export. SLA breaches escalate themselves — case bumped, supervisor notified, comment logged — so missed deadlines drop sharply.',
      },
    ],
  },
  'task-management': {
    answer: {
      question: 'What is dependency-aware task management?',
      answer:
        'Dependency-aware task management shows every matter in flight, what’s stuck, and who owes what to whom — and when one task slips, it recomputes the timeline so nothing surprises anyone at the eleventh hour. The next person’s brief lands on their screen the moment the previous task finishes.',
    },
    faqs: [
      {
        question: 'How is this different from a simple to-do or Kanban board?',
        answer:
          'A plain board shows tasks; it doesn’t understand that task C can’t start until task A finishes. A dependency-aware board does — so a late clearance recomputes every downstream date, and a partner isn’t surprised the morning of lodgement. Slip one task and the whole matter knows.',
      },
      {
        question: 'What problem does it solve?',
        answer:
          'Work quietly stalling when one person is on leave or a clearance is late — usually discovered only when the client phones to ask. With dependencies tracked, the right person hears before the client does, and no file sits unseen in nobody’s queue.',
      },
      {
        question: 'Who is it for?',
        answer:
          'Conveyancing and legal teams running multi-step matters, and any project-based business with handoffs across roles — anywhere one person’s delay quietly stalls the whole job until someone finally notices.',
      },
    ],
  },
  'field-ops-app': {
    answer: {
      question: 'What is a field service app?',
      answer:
        'A field service app captures clean data where the job actually happens — signal-poor sites, gloves on, vehicles moving — and syncs it the moment connectivity returns. Built offline-first and shaped to each role, it ends end-of-day double-entry and lets the office plan tomorrow against what actually happened today, with photo, geo-stamp, and signature on file.',
    },
    faqs: [
      {
        question: 'Does a field service app work without signal?',
        answer:
          'Yes — it’s offline-first. Every action queues locally and syncs the moment connectivity returns, so a basement, a rooftop, or a moving van doesn’t lose data. The back office sees the work as it happens, or as the van rolls back into range.',
      },
      {
        question: 'What does it replace?',
        answer:
          'The paper form retyped later by an admin, in the wrong order, with the photo missing. Instead the data lands clean and in real time, so bills go out right, disputes get resolved from the timeline, and dispatch stops guessing where the crews are.',
      },
      {
        question: 'Who uses a field service app?',
        answer:
          'Installers, inspectors, and drivers on customer sites; utilities running meter readers and field crews; and NGOs with social workers in the field — the same app shell, with role-specific forms for each job.',
      },
    ],
  },
  'analytics-suite': {
    answer: {
      question: 'What is a decision support system?',
      answer:
        'A decision support system turns a business’s operational data into a clear picture shaped for the person making the decision. Zabble’s analytics suite composes the view by role, so each person sees only the KPIs that feed the decisions they actually make — and every number opens its own calculation, source, and next action.',
    },
    faqs: [
      {
        question: 'Why do most dashboards go unread?',
        answer:
          'Because they show everyone the same 47 widgets, so no one finds the two numbers that drive their decision. A role-composed analytics layer shows each person only what feeds the calls they make, at the time horizon those calls live on — so they open it first, not last.',
      },
      {
        question: 'How is this different from a BI dashboard?',
        answer:
          'Every number opens its calculation, its source systems, the decision it informs, and the next action — so it drives a decision rather than just displaying data. The 06:00 briefing arrives in Slack before the operator does: yesterday’s anomalies, today’s risks, this morning’s calls.',
      },
      {
        question: 'Who is it for?',
        answer:
          'Logistics and operations leaders running on instinct because the dashboard is unreadable, hospitality groups and retail chains needing role-specific views across sites, and any multi-team business where everyone opens the same dashboard and closes it no wiser.',
      },
    ],
  },
  'accounting-engine': {
    answer: {
      question: 'What is event-driven accounting?',
      answer:
        'Event-driven accounting writes the books from real operational events — projects signed, milestones shipped, refunds processed, deposits received — instead of from month-end memory. The engine emits the right artefact for each event: a deposit invoice, a draw-down, a journal entry, a bank match — so the books reconcile to within a day of operations.',
    },
    faqs: [
      {
        question: 'What does automated accounting actually automate?',
        answer:
          'The gap between when something happens and when the books know about it. Operational systems emit events; the engine writes the invoice, the recurring charge, the journal entry, or the bank match — so revenue stops slipping through cracked spreadsheets and month-end takes hours, not weeks.',
      },
      {
        question: 'Is it a replacement for our accounting software?',
        answer:
          'It’s a bespoke event-driven layer shaped to how your business actually operates — lean, targeted, with the audit trails, permission roles, and workflows you genuinely need. Rules are configuration, so you can change VAT treatment or cost-centre splits without engineering work.',
      },
      {
        question: 'How does it help at audit and month-end?',
        answer:
          'Every entry traces back to the event that produced it, so auditors get answers in seconds and month-end stops running long. The controller is no longer the last one out every Thursday night, reconciling six spreadsheets by hand.',
      },
    ],
  },
  'pricing-engine': {
    answer: {
      question: 'What is a pricing and quote engine?',
      answer:
        'A pricing and quote engine composes the correct price from every rule that applies — list price, tier discount, volume break, contract override, manual discount — into one number on screen. It blocks anything below the margin floor and routes breaches to the right approver before the quote goes out, so the audit trail is the quote.',
    },
    faqs: [
      {
        question: 'What is CPQ software used for?',
        answer:
          'CPQ — configure, price, quote — turns a tangle of price lists, discount sheets, and contract folders into one correct number in front of the rep. It catches the margin breaches reps used to miss, so quote turnaround drops from days to minutes and average margin lifts.',
      },
      {
        question: 'What’s the difference between a CRM and a pricing engine?',
        answer:
          'A CRM tracks the relationship and the pipeline; a pricing engine produces the correct, approved price for the quote. They complement each other — Zabble can wire the pricing engine to your CRM so the right number flows into the deal without anyone re-typing it.',
      },
      {
        question: 'Can it handle different products and rules?',
        answer:
          'Yes — the same engine quotes parts, hotel nights, or consulting scopes; only the rule set changes. List price, tier discount, volume break, and overrides compose into one number, with the rule stack attached so finance stops auditing margin in arrears.',
      },
    ],
  },
  'data-routing': {
    answer: {
      question: 'What is a data routing pipeline?',
      answer:
        'A data routing pipeline reads from every system a team already runs and assembles a clean, governed output — a board pack, a donor report, a regulator return — with every figure’s lineage traceable back to its source row. It targets the silo problem: where manual data transfer between systems is slow, expensive, and error-prone.',
    },
    faqs: [
      {
        question: 'What does a data pipeline do?',
        answer:
          'It moves data from many source systems through a defined set of steps — classify, join, validate, aggregate, render — into a finished output. The rule pack for the chosen output decides which transforms fire, so the same pipeline produces a board pack on Monday and a regulator return on Thursday.',
      },
      {
        question: 'How is this different from plain ETL?',
        answer:
          'ETL extracts, transforms, and loads data between stores. This pipeline goes further: it assembles a governed business output and keeps each figure’s lineage, so clicking any number unrolls it to the source row — and a dropped source degrades to a known fallback rather than producing a wrong number quietly.',
      },
      {
        question: 'What can it produce?',
        answer:
          'Board packs, donor reports, and regulatory returns like the BA 900 — any output where the same data gets re-assembled by hand for several deliverables. The pack stops being assembled by four people over three days and starts being generated.',
      },
    ],
  },
  'integration-hub': {
    answer: {
      question: 'What is an integration hub (iPaaS)?',
      answer:
        'An integration hub sits between every tool a business runs and forwards each event to every other system that should hear about it — transformed on the way, with its trail attached. A booking lands once and, within seconds, becomes a CRM contact, an invoice, a held calendar slot, and a campaign target. New bridges are point-and-click.',
    },
    faqs: [
      {
        question: 'What is iPaaS?',
        answer:
          'iPaaS — integration platform as a service — connects separate business tools so they share events automatically, instead of a person copying data between them. Zabble’s hub forwards each event to every system that should know, so a stack of eight tools stops behaving like eight islands.',
      },
      {
        question: 'How does an integration hub work?',
        answer:
          'Each tool emits the events it already knows about; the hub transforms each event and forwards it to every other tool that should react. New bridges are point-and-click — no glue scripts, no fragile zaps — and every event carries its trail for audit.',
      },
      {
        question: 'What changes once it’s in place?',
        answer:
          'The team stops copying data between tools. A booking lands once and ripples everywhere it should within seconds, and new tools slot into the hub the day they arrive instead of becoming the next island.',
      },
    ],
  },
  'cross-system-sync': {
    answer: {
      question: 'What is data synchronization between systems?',
      answer:
        'Data synchronization keeps a shared record identical across two systems, so edits on either side land on the other in seconds. Direction is configurable — one-way where one system is the source of truth, bi-directional for true peers — and when both sides edit the same field, the conflict rule you chose fires and is cited in the audit trail.',
    },
    faqs: [
      {
        question: 'What is an example of data synchronization?',
        answer:
          'Warehouse stock syncing to the storefront so a customer can’t order what left the shelf two days ago; HR and payroll keeping employee records aligned; a calendar and a booking platform staying in step. Each pair holds the same record and must not drift apart.',
      },
      {
        question: 'How are sync conflicts handled?',
        answer:
          'When both sides edit the same field at once, the rule you chose fires — last write, source-of-truth, or human review — and the rule that fired is recorded in the audit trail. Conflicts land in one review queue with both sides shown, not in a Friday-afternoon spreadsheet.',
      },
      {
        question: 'How is this different from an integration hub?',
        answer:
          'An integration hub fans one event out to many systems. A sync engine keeps one record identical between two systems, with an explicit conflict rule. Use sync for a pair that must always agree; use the hub for one event that should ripple across many tools.',
      },
    ],
  },
  'forecasting': {
    answer: {
      question: 'What is demand forecasting?',
      answer:
        'Demand forecasting projects a business’s own history forward to anticipate what it will need — covers, stock, staff, cash. Zabble trains the forecast on your numbers, with weather, events, promos, and trend as inputs the team can move, and pushes the orders, rotas, and cash buffers it implies straight to the tools where the team already works.',
    },
    faqs: [
      {
        question: 'How does demand forecasting work?',
        answer:
          'It learns the patterns in your own history and projects them forward, widening the confidence band visibly when it’s unsure. Weather, local events, and promo cadence are first-class inputs the team can adjust, and the forecast redraws live as they do.',
      },
      {
        question: 'What can it forecast?',
        answer:
          'Restaurant covers and prep, parts reorder points, and SaaS cash collections — the same engine repointed at different histories. Recommendations push to the supplier portal, the rota tool, and the FP&A model, so the forecast is already on the screens that matter by Monday.',
      },
      {
        question: 'How accurate is demand forecasting?',
        answer:
          'Accuracy depends on the data, but in a Zabble build forecast error moved from a 20%+ trailing average toward single digits. The point isn’t a perfect number — it’s replacing the Friday-afternoon spreadsheet guess with a forecast the team can act on, with its uncertainty shown.',
      },
    ],
  },
  'predictive-maintenance': {
    answer: {
      question: 'What is predictive maintenance?',
      answer:
        'Predictive maintenance pulls vibration, temperature, oil-analysis, and run-hour data into one model per asset class, predicts days-to-failure with a confidence band, and books the intervention at the lowest-cost downtime window. It shifts maintenance from calendar-driven to condition-driven — catching the breakdown before it happens, when the warning signs were already in the data.',
    },
    faqs: [
      {
        question: 'What’s the difference between preventive and predictive maintenance?',
        answer:
          'Preventive maintenance services equipment on a fixed schedule, whether it needs it or not. Predictive maintenance reads the asset’s actual condition and intervenes only when failure is approaching — fewer scheduled changeouts on healthy machines, far fewer 3am callouts on sick ones.',
      },
      {
        question: 'How does it predict a failure?',
        answer:
          'A model per asset class watches vibration, temperature, oil analysis, and run-hours together — the signals that show up weeks before a breakdown but that no one reads in combination. It predicts days-to-failure, reserves the part, and proposes the cheapest downtime window to take.',
      },
      {
        question: 'Is predictive maintenance worth it?',
        answer:
          'One prevented breakdown usually pays for the system. A gearbox that fails mid-shift can stop production for hours, and the warning was often in the data for weeks. Catching it converts an unplanned stop into a scheduled, low-cost intervention.',
      },
    ],
  },
  'master-data-hub': {
    answer: {
      question: 'What is master data management?',
      answer:
        'Master data management holds one canonical “golden record” for every entity a business runs on — customer, supplier, product, employee, asset — and fans each edit out to every downstream system in under two seconds. A direct edit downstream competes with the hub, and the rule that resolves the conflict is explicit, configurable, and audited.',
    },
    faqs: [
      {
        question: 'What is master data management in simple words?',
        answer:
          'It’s keeping one trusted version of your core records, instead of four spreadsheets that almost agree. Edit the customer’s address once on the golden record, and every system that needs it updates within seconds — so the courier stops returning shipments to an old address.',
      },
      {
        question: 'What problem does it solve?',
        answer:
          'Sales, finance, support, and shipping each holding a different address for the same customer — and the customer ending up correcting all four. With one golden record fanned out everywhere, returned shipments drop to near zero and teams stop re-keying data.',
      },
      {
        question: 'How is MDM different from ETL?',
        answer:
          'ETL moves and transforms data between systems for analysis. Master data management governs the single source of truth for an entity and keeps every system consistent with it in real time. One is about moving data; the other is about agreeing on it.',
      },
    ],
  },
  'notification-orchestration': {
    answer: {
      question: 'What is notification orchestration?',
      answer:
        'Notification orchestration is a central rule engine sitting between every source system and every channel, deciding who hears about what, where, and when. Critical events override every rule and reach a human in seconds; everything else routes by role, shift, and on-call rota — so the team stops muting the channel everyone learned to ignore.',
    },
    faqs: [
      {
        question: 'What causes alert fatigue?',
        answer:
          'Every system shouting at everyone: stock-low emails to the whole company, a fraud signal pinging twenty people, a 2am disk warning that could wait. After a week the team mutes the channel — and the one alert that was a fire goes unread next to nine hundred that weren’t.',
      },
      {
        question: 'How do you stop alert fatigue?',
        answer:
          'Route by condition and severity, not by broadcast. The buyer gets the stock alert, not everyone; quiet hours hold non-urgent pings until morning; critical events override everything. Fewer, better-targeted alerts mean the team starts noticing them again.',
      },
      {
        question: 'Can it reach the right person on the right channel?',
        answer:
          'Yes — Slack to the right channel, SMS only when needed, email for the audit copy, WhatsApp for the field team, push for the on-call phone. Every routing decision is logged with the rule that fired, so a missed alert is one query to explain.',
      },
    ],
  },
  'legal-intake-automation': {
    answer: {
      question: 'What is legal intake automation?',
      answer:
        'Legal intake automation reads every incoming matter and document the moment it lands, extracts the key fields, opens the file, and routes the work — so a firm’s intake team only handles the exceptions. It turns a queue that eats the morning into a tray of flagged cases, each decision timestamped and replayable.',
    },
    faqs: [
      {
        question: 'What is the legal intake process?',
        answer:
          'It’s how a firm takes on new matters — capturing the client and case details, running conflict and KYC checks, opening the file, and assigning it. Automating it means each document is read and validated on arrival, with anything ambiguous sent to a human with the reason it stopped.',
      },
      {
        question: 'What does it change for a law firm?',
        answer:
          'Intake stops eating the first hour of the day. Documents are classified, fields extracted, and matters opened automatically, so fee-earners see clean files instead of a pile of paper — and every extraction and routing decision is one click to explain.',
      },
      {
        question: 'Is it built for our firm specifically?',
        answer:
          'Yes — Zabble sits with the intake team before writing code, because the matters, checks, and routing rules differ by firm. The pipeline is shaped to the documents your firm actually receives and the way your matters actually open.',
      },
    ],
  },
  'hospitality-booking-marketing-dashboard': {
    answer: {
      question: 'What is a hospitality booking and marketing dashboard?',
      answer:
        'A hospitality booking and marketing dashboard pulls bookings, revenue, channels, and campaigns from the tools a property already runs into one role-shaped view, so managers see occupancy, pace, and marketing return on one screen. Every number opens its source and the next action, replacing scattered reports nobody reads with the screen each role opens first.',
    },
    faqs: [
      {
        question: 'What does it bring together?',
        answer:
          'Booking platform, property management system, CRM, and marketing data in one place — occupancy and pace, channel mix, campaign return, and guest contacts — so revenue, front desk, and marketing stop working from separate, half-agreeing reports.',
      },
      {
        question: 'How is it different from the reports our booking system already gives us?',
        answer:
          'Those reports each show one tool’s slice. This composes the whole picture by role and makes every number actionable — its source, the decision it informs, the next step — so the morning briefing drives decisions instead of being another tab nobody opens.',
      },
      {
        question: 'Is it bespoke to our property?',
        answer:
          'Yes — Zabble shapes it to the systems you already run and the decisions your team actually makes. The same approach serves a single property or a group, with the sources and views repointed to each.',
      },
    ],
  },
}
