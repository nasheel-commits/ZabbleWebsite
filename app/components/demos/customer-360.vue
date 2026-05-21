<script setup lang="ts">
import { Fragment, computed, onUnmounted, reactive, ref, watch } from 'vue'
import { Activity, AlertTriangle, ArrowRight, Briefcase, CheckCircle2, ChevronLeft, ClipboardList, CreditCard, Eye, FileText, Headphones, Layers, LifeBuoy, Mail, Plus, Sparkles, Star, TrendingUp, Users, Wallet, X } from '@lucide/vue'

type Lens = 'sales' | 'support' | 'finance' | 'csm'
type EventKind = 'sale' | 'support' | 'billing' | 'product' | 'marketing' | 'csm'
type Health = 'healthy' | 'watch' | 'at-risk'

interface SourceRecord {
  system: string             // "Salesforce · Sales Cloud"
  objectLabel: string        // "Opportunity 0067H-1a"
  fields: { label: string; value: string }[]
}

interface EventSeed {
  id: string
  kind: EventKind
  tag?: string
  title: string
  detail?: string
  daysAgo: number            // for sorting; rendered as "<n>d ago"
  severity?: 'low' | 'med' | 'high'
  source: SourceRecord
}

interface Nba {
  title: string
  body: string
  severity: 'low' | 'med' | 'high'
  cta: string
}

interface Fragment {
  tool: string
  toolBadge: string          // "CRM · HubSpot"
  toolNote: string           // staleness/info
  lines: { label: string; value: string; warning?: boolean }[]
}

interface CustomerSeed {
  id: string
  name: string
  initial: string
  short: string              // chip label
  tag: string                // "Long-tenure SMB"
  tier: string
  tenure: string
  arr: string
  industry: string
  owner: string
  health: Health
  healthLabel: string
  events: EventSeed[]
  nba: Record<Lens, Nba[]>
  fragments: Record<'crm' | 'support' | 'billing' | 'csm', Fragment>
}

// ──────────────────────────────────────────────────────────────
// Seed customers
// ──────────────────────────────────────────────────────────────

const CUSTOMERS: CustomerSeed[] = [
  // ───── 1. Greengate Group — long-tenure SMB, healthy
  {
    id: 'greengate',
    name: 'Greengate Group',
    initial: 'G',
    short: 'Greengate',
    tag: 'Long-tenure SMB',
    tier: 'SMB Annual · 12 seats',
    tenure: '7 yrs · since 2019',
    arr: 'R 84,000',
    industry: 'Specialty grocery · 12 stores · Gauteng',
    owner: 'Lerato Ndlovu',
    health: 'healthy',
    healthLabel: 'Healthy',
    events: [
      {
        id: 'gg-1', kind: 'csm', tag: 'check-in',
        title: 'Q1 check-in held', detail: 'Pleased with mobile receipts module; asked about analytics roadmap',
        daysAgo: 3,
        source: {
          system: 'Gainsight · Success',
          objectLabel: 'Touchpoint TP-1187',
          fields: [
            { label: 'Type',        value: 'Quarterly check-in' },
            { label: 'CSM',         value: 'L. Ndlovu' },
            { label: 'Sentiment',   value: 'Positive' },
            { label: 'Next step',   value: 'Share analytics roadmap deck' },
            { label: 'Recorded at', value: '2026-05-18 10:14' },
          ],
        },
      },
      {
        id: 'gg-2', kind: 'sale', tag: 'renewal',
        title: 'Renewal signed for 2026', detail: '12 seats · R 84,000 · 12-month term',
        daysAgo: 12,
        source: {
          system: 'Salesforce · Sales Cloud',
          objectLabel: 'Opportunity 0067H-1a',
          fields: [
            { label: 'Stage',     value: 'Closed Won' },
            { label: 'Amount',    value: 'R 84,000.00' },
            { label: 'Term',      value: '12 months · auto-renew' },
            { label: 'Close date',value: '2026-05-09' },
            { label: 'Contract',  value: 'GG-RNW-2026.pdf · DocuSign' },
          ],
        },
      },
      {
        id: 'gg-3', kind: 'marketing', tag: 'nps',
        title: 'NPS submitted · 9', detail: '"Wouldn\'t run the stores without it."',
        daysAgo: 24,
        source: {
          system: 'Survicate · Surveys',
          objectLabel: 'Response R-9914',
          fields: [
            { label: 'Score',     value: '9 / 10 (Promoter)' },
            { label: 'Verbatim',  value: '"Wouldn\'t run the stores without it."' },
            { label: 'Survey',    value: 'Quarterly NPS · Q1-26' },
            { label: 'Respondent',value: 'Tumi M. · Ops Lead' },
          ],
        },
      },
      {
        id: 'gg-4', kind: 'billing', tag: 'paid',
        title: 'Invoice INV-7218 paid', detail: 'R 7,000 · paid day-2',
        daysAgo: 32,
        source: {
          system: 'Stripe · Billing',
          objectLabel: 'Invoice INV-7218',
          fields: [
            { label: 'Amount',     value: 'R 7,000.00' },
            { label: 'Status',     value: 'paid' },
            { label: 'Days to pay',value: '2' },
            { label: 'Method',     value: 'EFT · FNB' },
            { label: 'Paid at',    value: '2026-04-19 08:42' },
          ],
        },
      },
      {
        id: 'gg-5', kind: 'product', tag: 'feature-use',
        title: 'Feature adopted: mobile receipts', detail: '4 users in 2 days · +18% scans',
        daysAgo: 45,
        source: {
          system: 'Mixpanel · Product',
          objectLabel: 'Feature use · mobile-receipts',
          fields: [
            { label: 'First use',  value: '2026-04-06' },
            { label: 'Users (7d)', value: '4' },
            { label: 'Events (7d)',value: '312' },
            { label: 'Trend',      value: '+18% receipt scans' },
          ],
        },
      },
      {
        id: 'gg-6', kind: 'support', tag: 'resolved',
        title: 'Ticket T-4471 resolved', detail: 'CSV import format clarification · 1h first response',
        daysAgo: 67,
        source: {
          system: 'Zendesk · Support',
          objectLabel: 'Ticket T-4471',
          fields: [
            { label: 'Subject',     value: 'CSV import — date column format' },
            { label: 'Severity',    value: 'Low' },
            { label: 'First reply', value: '58 minutes' },
            { label: 'Resolution',  value: '1.4 hours' },
            { label: 'CSAT',        value: '5 / 5' },
          ],
        },
      },
      {
        id: 'gg-7', kind: 'marketing', tag: 'webinar',
        title: 'Attended webinar', detail: '"Stock takes that aren\'t a nightmare"',
        daysAgo: 88,
        source: {
          system: 'HubSpot · Marketing',
          objectLabel: 'Event registration RE-2204',
          fields: [
            { label: 'Webinar',  value: 'Stock takes that aren\'t a nightmare' },
            { label: 'Attended', value: 'Yes · 42 min watched' },
            { label: 'Source',   value: 'Email · 2026-02-08' },
          ],
        },
      },
    ],
    nba: {
      sales: [
        { title: 'Surface analytics roadmap', body: 'Ops Lead asked about it on the Q1 check-in. Add a 15-min slot before they buy a separate tool.', severity: 'med', cta: 'Draft outreach' },
        { title: 'Float a 24-month renewal', body: 'NPS 9, 7-year tenure, day-2 payer. The discount maths is in your favour.', severity: 'low', cta: 'Run terms' },
        { title: 'Reference programme', body: 'Promoter verbatim + multi-store footprint — they fit your specialty-grocery case study.', severity: 'low', cta: 'Invite to programme' },
      ],
      support: [
        { title: 'Promote CSV-import doc', body: 'T-4471 was a doc gap. Promote the resolution into the help centre so the next ten customers self-serve.', severity: 'low', cta: 'Promote KB' },
        { title: 'Nothing else open', body: 'Zero open tickets, full CSAT on last resolution. Healthy.', severity: 'low', cta: 'Send appreciation' },
        { title: 'Schedule resilience review', body: 'Long-tenure customers stop testing edges. Run an annual integrations review before something quietly breaks.', severity: 'low', cta: 'Book review' },
      ],
      finance: [
        { title: 'No collections action', body: 'Last 12 invoices paid on or before day-3. Move to the auto-clear queue and stop dunning.', severity: 'low', cta: 'Update billing rule' },
        { title: 'Project next 12 months', body: 'R 84k recurring at +0% — model their expansion case so you know what a "good year" looks like.', severity: 'low', cta: 'Update forecast' },
        { title: 'Annual VAT pack', body: 'Their accountant asks every February. Pre-build the pack now so you reply in one line.', severity: 'low', cta: 'Pre-build pack' },
      ],
      csm: [
        { title: 'Send analytics deck', body: 'They asked. Send before the next check-in to keep the trust dividend going.', severity: 'med', cta: 'Send deck' },
        { title: 'Health: keep on auto-pilot', body: 'NPS 9, on-time payments, steady product use. Quarterly cadence is the right cadence.', severity: 'low', cta: 'Confirm cadence' },
        { title: 'Look for second product', body: 'They\'re ready for the analytics module. CSM-led upsells convert ~2× sales-led on this tier.', severity: 'low', cta: 'Hand back to sales' },
      ],
    },
    fragments: {
      crm: {
        tool: 'CRM',
        toolBadge: 'CRM · HubSpot',
        toolNote: 'Last touch: Aug 2025',
        lines: [
          { label: 'Owner',    value: 'L. Ndlovu' },
          { label: 'Stage',    value: 'Active customer' },
          { label: 'Last note',value: '"Renewal — needs follow-up"' },
        ],
      },
      support: {
        tool: 'Support',
        toolBadge: 'Tickets · Zendesk',
        toolNote: 'Last open: 67 days ago',
        lines: [
          { label: 'Open tickets', value: '0' },
          { label: 'Last subject', value: 'CSV import format' },
        ],
      },
      billing: {
        tool: 'Billing',
        toolBadge: 'Billing · Xero',
        toolNote: 'Current period · open',
        lines: [
          { label: 'Last invoice', value: 'INV-7218 · R 7,000' },
          { label: 'Status',       value: '(re-check?)' },
        ],
      },
      csm: {
        tool: 'CSM',
        toolBadge: 'Success · Gainsight',
        toolNote: 'Touchpoint 3 days ago',
        lines: [
          { label: 'Health', value: 'Healthy' },
          { label: 'Notes',  value: '"Asked about analytics module"' },
        ],
      },
    },
  },

  // ───── 2. Solis International — high-touch enterprise, watch signals
  {
    id: 'solis',
    name: 'Solis International',
    initial: 'S',
    short: 'Solis',
    tag: 'High-touch enterprise',
    tier: 'Enterprise · 380 seats · multi-year',
    tenure: '3 yrs · since 2023',
    arr: 'R 4,200,000',
    industry: 'Logistics holding · Sub-Saharan Africa',
    owner: 'David Wilson + CSM pod',
    health: 'watch',
    healthLabel: 'Watch',
    events: [
      {
        id: 'sl-1', kind: 'csm', tag: 'exec-review',
        title: 'Executive QBR booked', detail: 'VP Ops + CFO joining; agenda finalised',
        daysAgo: 5,
        source: {
          system: 'Gainsight · Success',
          objectLabel: 'Touchpoint TP-3091',
          fields: [
            { label: 'Type',         value: 'Executive QBR' },
            { label: 'Attendees',    value: 'VP Ops, CFO, Head of Integrations' },
            { label: 'Scheduled',    value: '2026-05-28 14:00 SAST' },
            { label: 'Agenda',       value: 'API quotas · renewal terms · 2026 roadmap' },
            { label: 'CSM pod lead', value: 'D. Wilson' },
          ],
        },
      },
      {
        id: 'sl-2', kind: 'billing', tag: 'issued',
        title: 'Invoice INV-9920 issued', detail: 'R 350,000 · net-60',
        daysAgo: 8,
        source: {
          system: 'Xero · Billing',
          objectLabel: 'Invoice INV-9920',
          fields: [
            { label: 'Amount',     value: 'R 350,000.00' },
            { label: 'Terms',      value: 'Net-60' },
            { label: 'Due date',   value: '2026-07-13' },
            { label: 'Status',     value: 'Awaiting · 55 days to due' },
            { label: 'Cost centre',value: 'Solis · LOG-2025-Q2' },
          ],
        },
      },
      {
        id: 'sl-3', kind: 'support', tag: 'opened',
        title: 'P2 ticket opened · API rate limit', detail: '18 users affected · routes module',
        daysAgo: 10,
        severity: 'high',
        source: {
          system: 'Zendesk · Support',
          objectLabel: 'Ticket T-8842',
          fields: [
            { label: 'Subject',  value: 'Rate-limit errors from routes API' },
            { label: 'Severity', value: 'P2 · 18 users impacted' },
            { label: 'Owner',    value: 'M. Khoza (TAM)' },
            { label: 'Linked',   value: 'Eng · INC-554 · status investigating' },
            { label: 'SLA',      value: 'First response 36 min · within 1h target' },
          ],
        },
      },
      {
        id: 'sl-4', kind: 'product', tag: 'feature-use',
        title: 'API integrations · heavy use', detail: '+30% week-on-week calls',
        daysAgo: 12,
        source: {
          system: 'Mixpanel · Product',
          objectLabel: 'Feature use · api-integrations',
          fields: [
            { label: 'Calls (7d)', value: '2.41M' },
            { label: 'Change WoW', value: '+30.4%' },
            { label: 'Top route',  value: '/v2/routes/optimise' },
            { label: 'Error rate', value: '0.42% (above 0.1% target)' },
          ],
        },
      },
      {
        id: 'sl-5', kind: 'sale', tag: 'stakeholder',
        title: 'New executive stakeholder', detail: 'VP Ops added as exec sponsor',
        daysAgo: 18,
        source: {
          system: 'Salesforce · Sales Cloud',
          objectLabel: 'Contact 003V0-EXC-22',
          fields: [
            { label: 'Name',     value: 'P. van der Walt' },
            { label: 'Role',     value: 'VP Operations' },
            { label: 'Sponsor?', value: 'Yes · executive sponsor' },
            { label: 'Added by', value: 'D. Wilson (CSM)' },
          ],
        },
      },
      {
        id: 'sl-6', kind: 'marketing', tag: 'nps',
        title: 'NPS submitted · 8', detail: '"Great product. Support response could be faster."',
        daysAgo: 22,
        source: {
          system: 'Survicate · Surveys',
          objectLabel: 'Response R-10402',
          fields: [
            { label: 'Score',     value: '8 / 10 (Passive-promoter)' },
            { label: 'Verbatim',  value: 'Great product. Support response could be faster.' },
            { label: 'Survey',    value: 'Quarterly NPS · Q1-26' },
            { label: 'Respondent',value: 'P. van der Walt · VP Ops' },
          ],
        },
      },
      {
        id: 'sl-7', kind: 'marketing', tag: 'event',
        title: 'Attended Operations Summit', detail: '4 attendees · 2 demo bookings',
        daysAgo: 92,
        source: {
          system: 'HubSpot · Marketing',
          objectLabel: 'Event registration RE-3018',
          fields: [
            { label: 'Event',     value: 'Africa Operations Summit 2026' },
            { label: 'Attendees', value: '4 from Solis' },
            { label: 'Outcome',   value: '2 demo requests · API expansion' },
          ],
        },
      },
      {
        id: 'sl-8', kind: 'sale', tag: 'contract',
        title: 'Multi-year contract signed', detail: '3-year term · R 12.6M total',
        daysAgo: 365,
        source: {
          system: 'DocuSign · Contracts',
          objectLabel: 'Agreement AG-2025-031',
          fields: [
            { label: 'Term',        value: '3 years · auto-renew' },
            { label: 'TCV',         value: 'R 12,600,000' },
            { label: 'Signed by',   value: 'CFO · Solis International' },
            { label: 'Counter-sig.',value: 'CRO · Zabble' },
            { label: 'Effective',   value: '2025-05-21' },
          ],
        },
      },
    ],
    nba: {
      sales: [
        { title: 'Pre-brief the VP Ops', body: 'New sponsor on the QBR. Open with the API integration story; that\'s their problem.', severity: 'high', cta: 'Draft pre-read' },
        { title: 'Position 2027 expansion', body: 'Their API usage is +30% WoW. The current quota will choke them in two quarters — pitch the next tier now, before the renewal calendar locks in.', severity: 'med', cta: 'Build expansion case' },
        { title: 'Reference customer ask', body: 'Promoter sponsor + multi-year deal. A 30-min reference call would be the warmest one on your panel.', severity: 'low', cta: 'Send reference ask' },
      ],
      support: [
        { title: 'Escalate T-8842', body: 'P2 on rate-limit, 18 users impacted, error rate above target. Hand to engineering today; don\'t wait for SLA.', severity: 'high', cta: 'Escalate to Eng' },
        { title: 'Issue customer comms', body: 'They\'ll mention it in the QBR. Send a status note before then so you control the narrative.', severity: 'med', cta: 'Send status note' },
        { title: 'Quota review', body: 'Error rate is rising with usage, not bugs. Pull the quota review forward — it\'s a sales motion disguised as support.', severity: 'med', cta: 'Open quota ticket' },
      ],
      finance: [
        { title: 'No collections action', body: 'INV-9920 is at day 8 of net-60. Last 12 invoices all paid by day 45. Healthy.', severity: 'low', cta: 'Confirm cadence' },
        { title: 'Pre-model 2027 ARR', body: 'Multi-year contract + API expansion appetite — finance should know the 2027 ARR ceiling before sales sells it.', severity: 'med', cta: 'Model expansion' },
        { title: 'Tax pack for accountant', body: 'Their finance team requests a tax summary every June. Auto-schedule it.', severity: 'low', cta: 'Schedule pack' },
      ],
      csm: [
        { title: 'Walk the QBR through API quotas', body: 'NPS comment + open P2 both point at one thing. The QBR resolves it or it surfaces twice on the call.', severity: 'high', cta: 'Update QBR deck' },
        { title: 'Map the buying committee', body: 'New VP Ops sponsor. Map their goals against your roadmap before the meeting.', severity: 'med', cta: 'Map stakeholders' },
        { title: 'Renewal in 12 mo', body: 'Start the renewal motion now — multi-year contracts move on partner cycles, not yours.', severity: 'med', cta: 'Open renewal play' },
      ],
    },
    fragments: {
      crm: {
        tool: 'CRM',
        toolBadge: 'CRM · Salesforce',
        toolNote: 'Last update: 18 days ago',
        lines: [
          { label: 'Owner',    value: 'D. Wilson' },
          { label: 'Stage',    value: 'Customer · Healthy' },
          { label: 'Last note',value: '"Renewal: 12 months out — no actions"' },
        ],
      },
      support: {
        tool: 'Support',
        toolBadge: 'Tickets · Zendesk',
        toolNote: '1 open · P2 ·  no exec visibility',
        lines: [
          { label: 'Open tickets', value: '1 · P2 rate-limit', warning: true },
          { label: 'Last update',  value: '6 hours ago' },
        ],
      },
      billing: {
        tool: 'Billing',
        toolBadge: 'Billing · Xero',
        toolNote: 'INV-9920 open · net-60',
        lines: [
          { label: 'Open invoice', value: 'INV-9920 · R 350,000' },
          { label: 'Status',       value: 'awaiting (55d to due)' },
          { label: 'Notes',        value: '"Customer healthy"' },
        ],
      },
      csm: {
        tool: 'CSM',
        toolBadge: 'Success · Gainsight',
        toolNote: 'QBR scheduled · agenda thin',
        lines: [
          { label: 'Health', value: 'Watch', warning: true },
          { label: 'Notes',  value: '"NPS 8 — investigate support gap"' },
        ],
      },
    },
  },

  // ───── 3. KwaZulu Café Co. — churn risk
  {
    id: 'kwazulu',
    name: 'KwaZulu Café Co.',
    initial: 'K',
    short: 'KwaZulu Café',
    tag: 'Churn-risk SMB',
    tier: 'SMB Monthly · 4 seats',
    tenure: '14 mo',
    arr: 'R 14,400',
    industry: 'Café group · 6 locations · KZN coast',
    owner: 'Pending re-assignment',
    health: 'at-risk',
    healthLabel: 'At risk',
    events: [
      {
        id: 'kz-1', kind: 'support', tag: 'opened',
        title: 'Ticket T-5042 · cancellation signal', detail: '"Considering cancelling — sync failing every day"',
        daysAgo: 1,
        severity: 'high',
        source: {
          system: 'Zendesk · Support',
          objectLabel: 'Ticket T-5042',
          fields: [
            { label: 'Subject',      value: 'Sync to POS failing daily — considering cancelling' },
            { label: 'Severity',     value: 'High · churn signal' },
            { label: 'Sentiment',    value: 'Frustrated' },
            { label: 'Owner',        value: 'unassigned', },
            { label: 'First reply',  value: '— still pending —' },
          ],
        },
      },
      {
        id: 'kz-2', kind: 'marketing', tag: 'nps',
        title: 'NPS submitted · 3', detail: '"Not what we expected."',
        daysAgo: 4,
        severity: 'high',
        source: {
          system: 'Survicate · Surveys',
          objectLabel: 'Response R-10488',
          fields: [
            { label: 'Score',     value: '3 / 10 (Detractor)' },
            { label: 'Verbatim',  value: 'Not what we expected.' },
            { label: 'Survey',    value: 'Quarterly NPS · Q1-26' },
            { label: 'Respondent',value: 'A. Naidoo · Owner' },
            { label: 'Flag',      value: 'Detractor — escalate to CSM' },
          ],
        },
      },
      {
        id: 'kz-3', kind: 'billing', tag: 'failed',
        title: 'Payment failed · INV-8104', detail: 'R 1,200 · card declined · retry queued',
        daysAgo: 7,
        severity: 'high',
        source: {
          system: 'Stripe · Billing',
          objectLabel: 'Invoice INV-8104',
          fields: [
            { label: 'Amount',     value: 'R 1,200.00' },
            { label: 'Status',     value: 'payment_failed · retrying' },
            { label: 'Reason',     value: 'card_declined · do_not_honor' },
            { label: 'Retry',      value: 'queued · 2026-05-21 18:00' },
            { label: 'Notify',     value: 'CSM not notified (rule missing)' },
          ],
        },
      },
      {
        id: 'kz-4', kind: 'product', tag: 'drop',
        title: 'Active sessions dropped', detail: 'Weekly: 12 → 4 (-67%) over 14 days',
        daysAgo: 14,
        severity: 'med',
        source: {
          system: 'Mixpanel · Product',
          objectLabel: 'Cohort kwazulu-cafe',
          fields: [
            { label: 'Metric',     value: 'Weekly active sessions' },
            { label: 'Before',     value: '12 (4-week avg)' },
            { label: 'After',      value: '4 (last week)' },
            { label: 'Change',     value: '-67%' },
            { label: 'Threshold',  value: 'breached · health rule R-009' },
          ],
        },
      },
      {
        id: 'kz-5', kind: 'marketing', tag: 'unsubscribe',
        title: 'Unsubscribed from emails', detail: 'All transactional + product · primary contact',
        daysAgo: 21,
        source: {
          system: 'Mailchimp · Marketing',
          objectLabel: 'Subscriber S-8821',
          fields: [
            { label: 'Subscriber', value: 'A. Naidoo' },
            { label: 'Status',     value: 'Unsubscribed (all)' },
            { label: 'Reason',     value: '"Getting too much email"' },
            { label: 'Effective',  value: '2026-04-30 09:11' },
          ],
        },
      },
      {
        id: 'kz-6', kind: 'csm', tag: 'missed',
        title: 'CSM check-in missed', detail: '4th unanswered attempt',
        daysAgo: 28,
        severity: 'high',
        source: {
          system: 'Gainsight · Success',
          objectLabel: 'Touchpoint TP-3142',
          fields: [
            { label: 'Type',         value: 'Quarterly check-in attempt' },
            { label: 'Attempt count',value: '4' },
            { label: 'Channel',      value: 'Email, then call' },
            { label: 'Outcome',      value: 'No response · 4-week silence' },
          ],
        },
      },
      {
        id: 'kz-7', kind: 'support', tag: 'opened',
        title: 'Ticket T-4998 · POS export broken', detail: 'Resolved after 6 days · low CSAT',
        daysAgo: 35,
        source: {
          system: 'Zendesk · Support',
          objectLabel: 'Ticket T-4998',
          fields: [
            { label: 'Subject',     value: 'POS export breaks on weekend file' },
            { label: 'Severity',    value: 'Medium' },
            { label: 'First reply', value: '36 hours (target 4h)' },
            { label: 'Resolution',  value: '6.2 days' },
            { label: 'CSAT',        value: '2 / 5' },
          ],
        },
      },
      {
        id: 'kz-8', kind: 'sale', tag: 'signup',
        title: 'Signed up', detail: 'Self-serve · 4 seats · monthly plan',
        daysAgo: 425,
        source: {
          system: 'Salesforce · Sales Cloud',
          objectLabel: 'Account 001K-4488',
          fields: [
            { label: 'Source',      value: 'Self-serve (web)' },
            { label: 'Plan',        value: 'SMB Monthly · 4 seats' },
            { label: 'Initial ACV', value: 'R 14,400 (12 mo equivalent)' },
            { label: 'Signed up',   value: '2025-03-22' },
          ],
        },
      },
    ],
    nba: {
      sales: [
        { title: 'Don\'t pitch — save first', body: 'Detractor NPS, failed payment, cancellation signal in a live ticket. Any sales motion here ends the relationship. Hand to CSM, not to AE.', severity: 'high', cta: 'Block outbound' },
        { title: 'Tag for win-back', body: 'If they leave, they leave as a known story — POS export, sync. Tag the account so the win-back motion in 3-6 mo doesn\'t start from zero.', severity: 'low', cta: 'Tag account' },
        { title: 'Post-mortem feed', body: 'Three SMBs cancelled in Q1 with the same POS issue. Feed this into the SMB retention review.', severity: 'med', cta: 'Add to review' },
      ],
      support: [
        { title: 'Answer T-5042 now', body: 'Cancellation language in an unassigned ticket. First response should not be from a bot. Owner = senior agent, today.', severity: 'high', cta: 'Assign senior' },
        { title: 'Root-cause the sync', body: 'Failing every day = config drift or a regression. Get an engineer on it before the answer is "we\'ll investigate".', severity: 'high', cta: 'Open INC' },
        { title: 'Reopen T-4998 review', body: '6-day resolution + 2/5 CSAT on a basic export. This is the first thing in the post-mortem for this account.', severity: 'med', cta: 'Pull learnings' },
      ],
      finance: [
        { title: 'Pause dunning', body: 'Auto-dunning a churning customer adds spite to the exit. Pause until CSM has had the conversation.', severity: 'high', cta: 'Pause dunning' },
        { title: 'Offer a one-month credit', body: 'R 1,200 is recoverable; R 14,400 ARR is not. Pre-approve the credit so CSM doesn\'t have to come back to ask.', severity: 'med', cta: 'Pre-approve credit' },
        { title: 'Update collections rule', body: 'Failed-payment notifications should auto-page CSM for at-risk accounts. The rule\'s missing — add it.', severity: 'med', cta: 'Add CSM trigger' },
      ],
      csm: [
        { title: 'Call the owner today', body: 'Detractor NPS · 4 missed check-ins · failed payment · cancellation signal in a live ticket. This is a call, not an email. Today.', severity: 'high', cta: 'Initiate save call' },
        { title: 'Re-assign the account', body: '"Pending re-assignment" for 28 days is how customers leave. Park no longer — name an owner before the save call.', severity: 'high', cta: 'Assign CSM' },
        { title: 'Run the save play', body: 'Acknowledge POS pain · pre-approved credit · concrete fix date · 30-day check-in scheduled. All before the next renewal date.', severity: 'high', cta: 'Run play' },
      ],
    },
    fragments: {
      crm: {
        tool: 'CRM',
        toolBadge: 'CRM · Salesforce',
        toolNote: 'Last touch: 35 days ago',
        lines: [
          { label: 'Owner',    value: '(empty)', warning: true },
          { label: 'Stage',    value: 'Customer · Active' },
          { label: 'Last note',value: '"Onboarding done"' },
        ],
      },
      support: {
        tool: 'Support',
        toolBadge: 'Tickets · Zendesk',
        toolNote: '1 open · unassigned',
        lines: [
          { label: 'Open tickets', value: '1 · unassigned', warning: true },
          { label: 'Subject',      value: 'Sync to POS failing' },
        ],
      },
      billing: {
        tool: 'Billing',
        toolBadge: 'Billing · Stripe',
        toolNote: 'INV-8104 retrying',
        lines: [
          { label: 'Last attempt', value: 'failed · card declined', warning: true },
          { label: 'Status',       value: 'auto-dunning queued' },
        ],
      },
      csm: {
        tool: 'CSM',
        toolBadge: 'Success · Gainsight',
        toolNote: 'Touchpoint missed × 4',
        lines: [
          { label: 'Health', value: 'Healthy?', warning: true },
          { label: 'Notes',  value: '"No response — likely on holiday"' },
        ],
      },
    },
  },
]

function customerById(id: string): CustomerSeed {
  return CUSTOMERS.find((c) => c.id === id) ?? CUSTOMERS[0]
}

// ──────────────────────────────────────────────────────────────
// Lens metadata
// ──────────────────────────────────────────────────────────────

interface LensMeta {
  slug: Lens
  label: string
  short: string
  icon: any
  helper: string
}

const LENSES: LensMeta[] = [
  { slug: 'sales',   label: 'Sales view',   short: 'Sales',   icon: TrendingUp, helper: 'Deals, renewals, expansion signals' },
  { slug: 'support', label: 'Support view', short: 'Support', icon: Headphones, helper: 'Tickets, severity, product issues' },
  { slug: 'finance', label: 'Finance view', short: 'Finance', icon: Wallet,     helper: 'Invoices, payments, ARR' },
  { slug: 'csm',     label: 'CSM view',     short: 'CSM',     icon: Users,      helper: 'Health, usage, NPS, exec touch' },
]

function lensMeta(l: Lens): LensMeta {
  return LENSES.find((x) => x.slug === l)!
}

// Which kinds/tags each lens considers "in focus".
function isInLens(ev: { kind: EventKind; tag?: string; severity?: string }, lens: Lens): boolean {
  switch (lens) {
    case 'sales':
      return ev.kind === 'sale'
        || (ev.kind === 'marketing' && ev.tag !== 'unsubscribe')
        || (ev.kind === 'csm' && (ev.tag === 'exec-review' || ev.tag === 'check-in'))
    case 'support':
      return ev.kind === 'support'
        || ev.kind === 'product'
    case 'finance':
      return ev.kind === 'billing'
        || (ev.kind === 'sale' && (ev.tag === 'contract' || ev.tag === 'renewal'))
    case 'csm':
      return ev.kind === 'csm'
        || (ev.kind === 'marketing' && ev.tag === 'nps')
        || ev.kind === 'product'
        || (ev.kind === 'support' && (ev.tag === 'opened' || ev.severity === 'high'))
  }
}

// Lens chips that should "ripple" when this event lands.
function rippleLenses(ev: { kind: EventKind; tag?: string }): Lens[] {
  const out: Lens[] = []
  for (const l of LENSES) {
    if (isInLens(ev, l.slug)) out.push(l.slug)
  }
  return out
}

// ──────────────────────────────────────────────────────────────
// Event kind styling
// ──────────────────────────────────────────────────────────────

interface KindMeta {
  label: string
  icon: any
  chip: string         // chip text
  ringClass: string    // bg + text + ring
}

const KIND: Record<EventKind, KindMeta> = {
  sale:      { label: 'Sales',     icon: Briefcase,   chip: 'Sales',     ringClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  support:   { label: 'Support',   icon: LifeBuoy,    chip: 'Support',   ringClass: 'bg-rose-50 text-rose-700 ring-rose-200' },
  billing:   { label: 'Billing',   icon: CreditCard,  chip: 'Billing',   ringClass: 'bg-violet-50 text-violet-700 ring-violet-200' },
  product:   { label: 'Product',   icon: Activity,    chip: 'Product',   ringClass: 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25' },
  marketing: { label: 'Marketing', icon: Mail,        chip: 'Marketing', ringClass: 'bg-amber-50 text-amber-700 ring-amber-200' },
  csm:       { label: 'CSM',       icon: Users,       chip: 'CSM',       ringClass: 'bg-sky-50 text-sky-700 ring-sky-200' },
}

const HEALTH: Record<Health, { label: string; class: string; icon: any }> = {
  'healthy': { label: 'Healthy', class: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  'watch':   { label: 'Watch',   class: 'bg-amber-50 text-amber-700 ring-amber-200',       icon: AlertTriangle },
  'at-risk': { label: 'At risk', class: 'bg-rose-50 text-rose-700 ring-rose-200',          icon: AlertTriangle },
}

const SEVERITY_CLASS: Record<'low' | 'med' | 'high', string> = {
  low:  'bg-surface-alt text-mute ring-line',
  med:  'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-rose-200',
}

// ──────────────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────────────

const selectedId = ref<string>('solis')          // open on the high-touch enterprise — best demo balance
const lens = ref<Lens>('csm')
const mode = ref<'before' | 'after'>('after')
const selectedEventId = ref<string | null>(null)

// Live events per customer (added via simulator).
const extraEvents = reactive<Record<string, EventSeed[]>>({})

// Lens chips that should briefly pulse — set when a live event lands.
const flashedLenses = ref<Set<Lens>>(new Set())
const newEventIds = ref<Set<string>>(new Set())
const flashTimers: number[] = []

function clearFlashTimers() {
  while (flashTimers.length) {
    const id = flashTimers.shift()
    if (id !== undefined) window.clearTimeout(id)
  }
}
onUnmounted(clearFlashTimers)

const customer = computed(() => customerById(selectedId.value))
const events = computed<EventSeed[]>(() => {
  const extras = extraEvents[selectedId.value] ?? []
  return [...extras, ...customer.value.events].sort((a, b) => a.daysAgo - b.daysAgo)
})

const selectedEvent = computed<EventSeed | null>(() => {
  if (!selectedEventId.value) return null
  return events.value.find((e) => e.id === selectedEventId.value) ?? null
})

const lensNba = computed(() => customer.value.nba[lens.value])

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

let liveCounter = 0
function uniq(): string {
  liveCounter += 1
  return `live-${Date.now().toString(36)}-${liveCounter}`
}

function daysAgoLabel(d: number): string {
  if (d <= 0) return 'just now'
  if (d === 1) return '1 day ago'
  if (d < 7) return `${d} days ago`
  if (d < 31) return `${Math.round(d / 7)}w ago`
  if (d < 365) return `${Math.round(d / 30)}mo ago`
  return `${(d / 365).toFixed(1)}y ago`
}

function pickCustomer(id: string) {
  if (id === selectedId.value) return
  selectedId.value = id
  selectedEventId.value = null
  clearFlashTimers()
  flashedLenses.value = new Set()
  newEventIds.value = new Set()
}

function pickLens(l: Lens) {
  lens.value = l
}

function openEvent(id: string) {
  selectedEventId.value = id
}

function closeEvent() {
  selectedEventId.value = null
}

function toggleMode() {
  mode.value = mode.value === 'after' ? 'before' : 'after'
  if (mode.value === 'before') selectedEventId.value = null
}

function flashLensesForEvent(ev: EventSeed) {
  const lenses = rippleLenses(ev)
  if (lenses.length === 0) return
  flashedLenses.value = new Set([...flashedLenses.value, ...lenses])
  const t = window.setTimeout(() => {
    const next = new Set(flashedLenses.value)
    for (const l of lenses) next.delete(l)
    flashedLenses.value = next
  }, 1700)
  flashTimers.push(t)

  newEventIds.value = new Set([...newEventIds.value, ev.id])
  const t2 = window.setTimeout(() => {
    const next = new Set(newEventIds.value)
    next.delete(ev.id)
    newEventIds.value = next
  }, 2400)
  flashTimers.push(t2)
}

// ──────────────────────────────────────────────────────────────
// Live event simulator
// ──────────────────────────────────────────────────────────────

interface SimMeta {
  slug: 'ticket' | 'payment' | 'nps' | 'feature'
  label: string
  icon: any
  describe: string
}

const SIM: SimMeta[] = [
  { slug: 'ticket',  label: 'Open support ticket', icon: LifeBuoy,    describe: 'Adds a new ticket to Zendesk · lens: Support, CSM' },
  { slug: 'payment', label: 'Record payment',      icon: CreditCard,  describe: 'Posts a Stripe payment · lens: Finance' },
  { slug: 'nps',     label: 'Submit NPS',          icon: Star,        describe: 'Adds a Survicate response · lens: CSM, Sales' },
  { slug: 'feature', label: 'Log feature use',     icon: Activity,    describe: 'Adds a Mixpanel event · lens: Support, CSM' },
]

function simulate(kind: SimMeta['slug']) {
  const c = customer.value
  const id = uniq()
  let ev: EventSeed

  if (kind === 'ticket') {
    ev = {
      id, kind: 'support', tag: 'opened',
      title: 'Live · new support ticket',
      detail: `${c.name === 'Solis International'
        ? 'API quota error on /v2/routes/optimise'
        : c.name === 'KwaZulu Café Co.'
          ? 'Sync to POS failing — second time today'
          : 'Mobile receipts not printing on Bluetooth dock'}`,
      daysAgo: 0,
      severity: c.health === 'at-risk' ? 'high' : 'med',
      source: {
        system: 'Zendesk · Support',
        objectLabel: `Ticket T-${5000 + Math.floor(Math.random() * 999)}`,
        fields: [
          { label: 'Subject',     value: 'Live-simulated ticket' },
          { label: 'Severity',    value: c.health === 'at-risk' ? 'High' : 'Medium' },
          { label: 'Sentiment',   value: c.health === 'at-risk' ? 'Frustrated' : 'Neutral' },
          { label: 'First reply', value: 'pending · SLA 1h' },
          { label: 'Opened at',   value: 'just now' },
        ],
      },
    }
  } else if (kind === 'payment') {
    ev = {
      id, kind: 'billing', tag: 'paid',
      title: 'Live · payment received',
      detail: `Invoice cleared · ${c.name === 'Solis International' ? 'R 350,000' : c.name === 'Greengate Group' ? 'R 7,000' : 'R 1,200 · retry succeeded'}`,
      daysAgo: 0,
      source: {
        system: 'Stripe · Billing',
        objectLabel: `Payment PI-${100000 + Math.floor(Math.random() * 99999)}`,
        fields: [
          { label: 'Amount',  value: c.name === 'Solis International' ? 'R 350,000.00' : c.name === 'Greengate Group' ? 'R 7,000.00' : 'R 1,200.00' },
          { label: 'Status',  value: 'succeeded' },
          { label: 'Method',  value: c.name === 'KwaZulu Café Co.' ? 'card · re-attempt' : 'EFT' },
          { label: 'Posted',  value: 'just now' },
        ],
      },
    }
  } else if (kind === 'nps') {
    const score = c.health === 'at-risk' ? 4 : c.health === 'watch' ? 7 : 9
    ev = {
      id, kind: 'marketing', tag: 'nps',
      title: `Live · NPS submitted · ${score}`,
      detail: c.health === 'at-risk'
        ? '"Trying to give you another chance."'
        : c.health === 'watch'
          ? '"Good product. Wish support were faster."'
          : '"Couldn\'t run the business without it."',
      daysAgo: 0,
      severity: score <= 5 ? 'high' : score <= 7 ? 'med' : 'low',
      source: {
        system: 'Survicate · Surveys',
        objectLabel: `Response R-${10500 + Math.floor(Math.random() * 99)}`,
        fields: [
          { label: 'Score',     value: `${score} / 10` },
          { label: 'Verbatim',  value: c.health === 'at-risk' ? 'Trying to give you another chance.' : c.health === 'watch' ? 'Good product. Wish support were faster.' : 'Couldn\'t run the business without it.' },
          { label: 'Survey',    value: 'Quarterly NPS · Q2-26' },
          { label: 'Submitted', value: 'just now' },
        ],
      },
    }
  } else {
    ev = {
      id, kind: 'product', tag: 'feature-use',
      title: 'Live · feature first use',
      detail: c.name === 'Solis International'
        ? 'Bulk export · API v2 · 14 users in 1h'
        : c.name === 'KwaZulu Café Co.'
          ? 'Mobile receipts · 1 user · first time in 30d'
          : 'Reports module · 3 users · 18 reports run',
      daysAgo: 0,
      source: {
        system: 'Mixpanel · Product',
        objectLabel: `Feature use · ${kind === 'feature' ? 'live-feature' : 'feature'}`,
        fields: [
          { label: 'First use',  value: 'just now' },
          { label: 'Users (1h)', value: c.name === 'Solis International' ? '14' : '3' },
          { label: 'Events (1h)',value: c.name === 'Solis International' ? '212' : '18' },
        ],
      },
    }
  }

  if (!extraEvents[c.id]) extraEvents[c.id] = []
  extraEvents[c.id].unshift(ev)
  flashLensesForEvent(ev)
}

// ──────────────────────────────────────────────────────────────
// View helpers
// ──────────────────────────────────────────────────────────────

const summaryKpis = computed(() => {
  const c = customer.value
  return [
    { label: 'ARR',              value: c.arr },
    { label: 'Tenure',           value: c.tenure },
    { label: 'Seats / tier',     value: c.tier },
    { label: 'Account owner',    value: c.owner },
  ]
})

</script>

<template>
  <div class="relative">
    <!-- ────── Top control bar ────── -->
    <div class="border-b border-line bg-surface-alt/60 px-4 md:px-6 py-3 md:py-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">

        <!-- Customer picker -->
        <div class="flex items-center gap-3 min-w-0">
          <span class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold shrink-0">
            <span class="dot" />
            Customer
          </span>
          <div class="-mx-1 px-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              v-for="c in CUSTOMERS"
              :key="c.id"
              type="button"
              :aria-pressed="c.id === selectedId"
              class="shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
              :class="c.id === selectedId
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink hover:border-ink/30'"
              @click="pickCustomer(c.id)"
            >
              <span
                class="inline-flex items-center justify-center h-5 w-5 rounded-full text-[10.5px] font-bold"
                :class="c.id === selectedId
                  ? 'bg-white text-ink'
                  : 'bg-surface-alt text-ink ring-1 ring-line'"
              >
                {{ c.initial }}
              </span>
              <span class="truncate max-w-[140px]">{{ c.short }}</span>
              <span
                class="hidden sm:inline-flex items-center text-[10.5px] font-semibold uppercase tracking-[0.06em] opacity-75"
              >
                · {{ c.tag.split(' ').slice(0, 2).join(' ') }}
              </span>
            </button>
          </div>
        </div>

        <!-- Mode toggle -->
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[11px] uppercase tracking-[0.22em] text-mute-2 font-semibold hidden sm:inline">
            View
          </span>
          <div
            class="inline-flex items-center rounded-full bg-white ring-1 ring-line p-0.5"
            role="tablist"
          >
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
              :class="mode === 'before'
                ? 'bg-ink text-white'
                : 'text-mute hover:text-ink'"
              :aria-pressed="mode === 'before'"
              @click="mode = 'before'; selectedEventId = null"
            >
              Before
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
              :class="mode === 'after'
                ? 'bg-ink text-white'
                : 'text-mute hover:text-ink'"
              :aria-pressed="mode === 'after'"
              @click="mode = 'after'"
            >
              <Layers :size="12" :stroke-width="2.25" />
              Unified
            </button>
          </div>
        </div>
      </div>

      <!-- Lens chips — only in unified mode -->
      <div v-if="mode === 'after'" class="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
        <span class="text-[11px] uppercase tracking-[0.22em] text-mute-2 font-semibold shrink-0">
          Lens
        </span>
        <button
          v-for="l in LENSES"
          :key="l.slug"
          type="button"
          :aria-pressed="l.slug === lens"
          class="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors lens-chip"
          :class="[
            l.slug === lens
              ? 'border-cyan-brand bg-cyan-brand/10 text-cyan-brand-deep'
              : 'border-line bg-white text-mute hover:text-ink hover:border-ink/30',
            flashedLenses.has(l.slug) ? 'is-flashed' : '',
          ]"
          @click="pickLens(l.slug)"
        >
          <component :is="l.icon" :size="12" :stroke-width="2.25" />
          {{ l.short }}
        </button>
      </div>
    </div>

    <!-- ────── Customer header (always shown) ────── -->
    <div class="px-4 md:px-6 py-4 md:py-5 border-b border-line bg-white">
      <div class="flex items-start gap-4">
        <span
          class="inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-ink text-white font-display text-[24px] md:text-[26px] leading-none shrink-0"
          aria-hidden="true"
        >
          {{ customer.initial }}
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-display text-[19px] sm:text-[22px] md:text-[26px] leading-[1.2] md:leading-[1.15] text-ink">
              {{ customer.name }}
            </h3>
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset"
              :class="HEALTH[customer.health].class"
            >
              <component :is="HEALTH[customer.health].icon" :size="11" :stroke-width="2.25" />
              {{ HEALTH[customer.health].label }}
            </span>
          </div>
          <p class="text-[13px] text-mute mt-1">{{ customer.industry }}</p>
        </div>
      </div>
    </div>

    <!-- ────── BEFORE: fragmented tools ────── -->
    <div v-if="mode === 'before'" class="px-4 md:px-6 py-6 md:py-8 bg-surface-alt/40">
      <div class="max-w-3xl">
        <p class="text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold inline-flex items-center gap-2">
          <span class="dot" />
          Before · four tools, four versions
        </p>
        <h4 class="mt-2 font-display text-[19px] sm:text-[22px] md:text-[26px] leading-[1.25] md:leading-[1.2] text-ink">
          The same customer in four places — and no two of them agree.
        </h4>
        <p class="mt-2 text-[13.5px] text-mute">
          This is what the team sees today. No one has the whole picture.
          {{ customer.name }} sits in four systems with four owners, four "last updates",
          and four versions of the truth.
        </p>
      </div>

      <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <article
          v-for="(frag, key) in customer.fragments"
          :key="key"
          class="rounded-2xl border border-line bg-white p-4 md:p-5"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
              <ClipboardList :size="12" :stroke-width="2.25" />
              {{ frag.toolBadge }}
            </span>
            <span class="text-[10.5px] text-mute-2 italic">{{ frag.toolNote }}</span>
          </div>
          <p class="mt-2 font-display text-[17px] text-ink leading-[1.2]">
            {{ customer.name }}
          </p>
          <dl class="mt-2 space-y-1">
            <div
              v-for="line in frag.lines"
              :key="line.label"
              class="flex items-start gap-2 text-[12.5px]"
            >
              <dt class="w-[76px] sm:w-[88px] shrink-0 text-mute-2 uppercase tracking-[0.06em] text-[10.5px] font-semibold mt-0.5">
                {{ line.label }}
              </dt>
              <dd
                class="flex-1 leading-snug"
                :class="line.warning ? 'text-rose-700 font-medium' : 'text-ink'"
              >
                {{ line.value }}
                <span
                  v-if="line.warning"
                  class="ml-1 inline-flex items-center gap-0.5 text-[10px] uppercase tracking-[0.06em] text-rose-700 align-middle"
                  aria-hidden="true"
                >
                  <AlertTriangle :size="10" :stroke-width="2.25" />
                </span>
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div class="mt-5 rounded-xl border border-line bg-white p-4 flex items-start gap-3">
        <span class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0">
          <Sparkles :size="15" :stroke-width="2" />
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-[13.5px] font-semibold text-ink leading-tight">
            None of the four is wrong. None of them is complete.
          </p>
          <p class="mt-1 text-[12.5px] text-mute leading-snug">
            Flip to <span class="font-medium text-ink">Unified</span> to see what every team sees
            when the record is stitched together — same data, one record, four lenses.
          </p>
        </div>
        <button
          type="button"
          class="self-center inline-flex items-center gap-1.5 rounded-lg bg-ink text-white text-[12.5px] font-semibold px-3 py-2 hover:bg-ink-soft transition-colors shrink-0"
          @click="mode = 'after'"
        >
          Unify
          <ArrowRight :size="13" :stroke-width="2.25" />
        </button>
      </div>
    </div>

    <!-- ────── AFTER: unified record ────── -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-0">

      <!-- Summary rail -->
      <aside class="border-b lg:border-b-0 lg:border-r border-line bg-surface-alt/40 px-4 md:px-5 py-4 md:py-5">
        <p class="text-[11px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
          {{ customer.tag }}
        </p>
        <dl class="mt-3 space-y-2.5">
          <div v-for="k in summaryKpis" :key="k.label">
            <dt class="text-[10.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold">{{ k.label }}</dt>
            <dd class="text-[14px] text-ink leading-snug mt-0.5">{{ k.value }}</dd>
          </div>
        </dl>

        <div class="mt-5 rounded-xl border border-line bg-white p-3">
          <p class="text-[10.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold flex items-center gap-1.5">
            <Eye :size="11" :stroke-width="2.25" />
            Current lens
          </p>
          <p class="mt-1 text-[13.5px] font-semibold text-ink leading-tight">
            {{ lensMeta(lens).label }}
          </p>
          <p class="mt-0.5 text-[12px] text-mute leading-snug">
            {{ lensMeta(lens).helper }}
          </p>
        </div>

        <div class="mt-3 rounded-xl border border-line bg-white p-3">
          <p class="text-[10.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold flex items-center gap-1.5">
            <Layers :size="11" :stroke-width="2.25" />
            Stitched from
          </p>
          <ul class="mt-2 space-y-1 text-[11.5px] text-mute leading-tight">
            <li class="flex items-center gap-1.5"><Briefcase :size="11" :stroke-width="2" class="text-emerald-600" /> Salesforce · Sales</li>
            <li class="flex items-center gap-1.5"><LifeBuoy :size="11" :stroke-width="2" class="text-rose-600" /> Zendesk · Support</li>
            <li class="flex items-center gap-1.5"><CreditCard :size="11" :stroke-width="2" class="text-violet-600" /> Stripe / Xero · Billing</li>
            <li class="flex items-center gap-1.5"><Activity :size="11" :stroke-width="2" class="text-cyan-brand-deep" /> Mixpanel · Product</li>
            <li class="flex items-center gap-1.5"><Mail :size="11" :stroke-width="2" class="text-amber-600" /> HubSpot / Survicate · Marketing</li>
            <li class="flex items-center gap-1.5"><Users :size="11" :stroke-width="2" class="text-sky-600" /> Gainsight · CSM</li>
          </ul>
        </div>
      </aside>

      <!-- Timeline -->
      <section class="px-4 md:px-6 py-4 md:py-5 border-b lg:border-b-0 lg:border-r border-line bg-white">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p class="text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold inline-flex items-center gap-2">
              <span class="dot" />
              Unified timeline
            </p>
            <h4 class="mt-1 font-display text-[20px] leading-[1.2] text-ink">
              One record · {{ events.length }} events · {{ lensMeta(lens).short }} lens
            </h4>
          </div>
          <span class="text-[11.5px] text-mute hidden sm:inline-flex items-center gap-1.5">
            <Eye :size="12" :stroke-width="2" />
            Click any event to inspect its source
          </span>
        </div>

        <ol class="mt-4 relative pl-5">
          <span class="absolute top-1 bottom-1 left-[7px] w-px bg-line" aria-hidden="true" />
          <li
            v-for="ev in events"
            :key="ev.id"
            class="relative pb-3 last:pb-0"
          >
            <span
              class="absolute -left-[14px] top-[14px] inline-flex items-center justify-center h-[18px] w-[18px] rounded-full ring-2 ring-white"
              :class="KIND[ev.kind].ringClass"
              aria-hidden="true"
            >
              <component :is="KIND[ev.kind].icon" :size="9" :stroke-width="2.5" />
            </span>
            <button
              type="button"
              class="w-full text-left rounded-xl border bg-white px-3 py-2.5 transition-colors timeline-card"
              :class="[
                isInLens(ev, lens) ? 'border-line opacity-100' : 'border-line opacity-55',
                selectedEventId === ev.id ? 'border-ink ring-1 ring-ink/20' : 'hover:border-ink/30',
                newEventIds.has(ev.id) ? 'is-new' : '',
              ]"
              @click="openEvent(ev.id)"
            >
              <div class="flex items-start gap-2.5">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      class="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-[0.06em]"
                      :class="KIND[ev.kind].ringClass"
                    >
                      {{ KIND[ev.kind].chip }}
                    </span>
                    <span
                      v-if="ev.severity"
                      class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-[0.06em]"
                      :class="SEVERITY_CLASS[ev.severity]"
                    >
                      {{ ev.severity === 'high' ? 'High' : ev.severity === 'med' ? 'Med' : 'Low' }}
                    </span>
                    <span class="text-[10.5px] text-mute-2 tabular-nums ml-auto">{{ daysAgoLabel(ev.daysAgo) }}</span>
                  </div>
                  <p class="mt-1 text-[13.5px] font-semibold text-ink leading-tight">
                    {{ ev.title }}
                  </p>
                  <p v-if="ev.detail" class="mt-0.5 text-[12px] text-mute leading-snug">
                    {{ ev.detail }}
                  </p>
                  <p class="mt-1 text-[10.5px] text-mute-2 inline-flex items-center gap-1">
                    <FileText :size="10" :stroke-width="2.25" />
                    {{ ev.source.system }}
                  </p>
                </div>
              </div>
            </button>
          </li>
        </ol>
      </section>

      <!-- Right rail: NBA + simulator OR source panel -->
      <aside class="px-4 md:px-5 py-4 md:py-5 bg-surface-alt/40">

        <!-- Source panel -->
        <div v-if="selectedEvent" class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-1 text-[12px] font-medium text-mute hover:text-ink transition-colors"
            @click="closeEvent"
          >
            <ChevronLeft :size="13" :stroke-width="2.25" />
            Back to actions
          </button>

          <div class="mt-3 rounded-xl border border-line bg-white p-3">
            <div class="flex items-start gap-2">
              <span
                class="inline-flex items-center justify-center h-8 w-8 rounded-lg ring-1 shrink-0"
                :class="KIND[selectedEvent.kind].ringClass"
                aria-hidden="true"
              >
                <component :is="KIND[selectedEvent.kind].icon" :size="14" :stroke-width="2" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[10.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold">
                  Source system
                </p>
                <p class="text-[13px] font-semibold text-ink leading-tight">
                  {{ selectedEvent.source.system }}
                </p>
                <p class="text-[11.5px] text-mute leading-tight mt-0.5">
                  {{ selectedEvent.source.objectLabel }}
                </p>
              </div>
              <button
                type="button"
                class="inline-flex items-center justify-center h-7 w-7 rounded-md text-mute hover:bg-ink/5 hover:text-ink transition-colors"
                aria-label="Close source panel"
                @click="closeEvent"
              >
                <X :size="13" :stroke-width="2.25" />
              </button>
            </div>

            <div class="mt-3 pt-3 border-t border-line/70">
              <p class="text-[10.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold">
                Event
              </p>
              <p class="text-[13px] font-semibold text-ink leading-tight mt-0.5">
                {{ selectedEvent.title }}
              </p>
              <p v-if="selectedEvent.detail" class="text-[12px] text-mute leading-snug mt-0.5">
                {{ selectedEvent.detail }}
              </p>
            </div>

            <div class="mt-3 pt-3 border-t border-line/70">
              <p class="text-[10.5px] uppercase tracking-[0.16em] text-mute-2 font-semibold mb-2">
                Source record
              </p>
              <dl class="space-y-1.5">
                <div
                  v-for="(f, i) in selectedEvent.source.fields"
                  :key="i"
                  class="flex items-start gap-2 text-[12px]"
                >
                  <dt class="w-[78px] shrink-0 text-mute-2 uppercase tracking-[0.05em] text-[10px] font-semibold mt-0.5 leading-tight">
                    {{ f.label }}
                  </dt>
                  <dd class="flex-1 text-ink leading-snug">{{ f.value }}</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              class="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-white text-ink text-[11.5px] font-semibold py-1.5 hover:border-ink/30 transition-colors"
              @click="closeEvent"
            >
              Open in {{ selectedEvent.source.system.split(' · ')[0] }}
              <ArrowRight :size="11" :stroke-width="2.25" />
            </button>
          </div>
        </div>

        <!-- NBA + simulator -->
        <div v-else>
          <p class="text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold inline-flex items-center gap-2">
            <span class="dot" />
            Next best actions
          </p>
          <p class="text-[12px] text-mute mt-1 leading-snug">
            What this lens recommends for {{ customer.short }} right now.
          </p>

          <ul class="mt-3 space-y-2">
            <li
              v-for="(nba, i) in lensNba"
              :key="i"
              class="rounded-xl border bg-white p-3"
              :class="nba.severity === 'high'
                ? 'border-rose-200'
                : nba.severity === 'med'
                  ? 'border-amber-200'
                  : 'border-line'"
            >
              <div class="flex items-start gap-2">
                <span
                  class="mt-0.5 inline-flex items-center justify-center h-5 w-5 rounded-full ring-1 shrink-0"
                  :class="SEVERITY_CLASS[nba.severity]"
                  aria-hidden="true"
                >
                  <component
                    :is="nba.severity === 'high' ? AlertTriangle : nba.severity === 'med' ? Sparkles : CheckCircle2"
                    :size="11"
                    :stroke-width="2.25"
                  />
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-[12.5px] font-semibold text-ink leading-tight">{{ nba.title }}</p>
                  <p class="text-[11.5px] text-mute leading-snug mt-0.5">{{ nba.body }}</p>
                </div>
              </div>
              <div class="mt-2 flex justify-end">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-[11px] font-medium text-ink hover:border-ink/30 transition-colors"
                >
                  {{ nba.cta }}
                  <ArrowRight :size="11" :stroke-width="2.25" />
                </button>
              </div>
            </li>
          </ul>

          <div class="mt-5 pt-5 border-t border-line">
            <p class="text-[11px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold inline-flex items-center gap-2">
              <Sparkles :size="11" :stroke-width="2.25" />
              Simulate a live event
            </p>
            <p class="text-[12px] text-mute mt-1 leading-snug">
              Inject a new event from a source system and watch it land on the timeline.
              The lenses that care about it pulse.
            </p>

            <div class="mt-3 grid grid-cols-1 gap-1.5">
              <button
                v-for="s in SIM"
                :key="s.slug"
                type="button"
                class="group inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-left transition-colors hover:border-ink/30"
                @click="simulate(s.slug)"
              >
                <span class="inline-flex items-center justify-center h-7 w-7 rounded-md bg-surface-alt text-cyan-brand-deep ring-1 ring-cyan-brand/25 shrink-0">
                  <component :is="s.icon" :size="13" :stroke-width="2" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-[12.5px] font-semibold text-ink leading-tight">{{ s.label }}</span>
                  <span class="block text-[10.5px] text-mute-2 leading-tight mt-0.5">{{ s.describe }}</span>
                </span>
                <Plus :size="13" :stroke-width="2.25" class="text-mute group-hover:text-ink transition-colors shrink-0" />
              </button>
            </div>
          </div>
        </div>

      </aside>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

/* Lens chip ripple — gentle pulse when a new event lands that's relevant. */
.lens-chip {
  transition:
    background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    color 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.lens-chip.is-flashed {
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.22);
  animation: lens-flash 1.6s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes lens-flash {
  0%   { box-shadow: 0 0 0 0   rgba(1, 219, 241, 0.36); }
  30%  { box-shadow: 0 0 0 6px rgba(1, 219, 241, 0.22); }
  100% { box-shadow: 0 0 0 0   rgba(1, 219, 241, 0); }
}

/* Newly added event card — brief cyan glow and slide-in. */
.timeline-card.is-new {
  animation: tl-new-in 600ms cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow:
    0 0 0 3px rgba(1, 219, 241, 0.22),
    0 8px 24px -16px rgba(15, 23, 42, 0.18);
}
@keyframes tl-new-in {
  from {
    opacity: 0;
    transform: translate3d(-6px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lens-chip.is-flashed,
  .timeline-card.is-new {
    animation: none !important;
  }
}
</style>
