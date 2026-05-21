<script setup lang="ts">
import { computed, h, ref, render, watch } from 'vue'
import { AlertTriangle, ArrowRight, Briefcase, Calculator, ChevronRight, ClipboardList, Clock, Database, Eye, EyeOff, GitBranch, Hash, Landmark, Minus, Send, Sparkles, TrendingDown, TrendingUp, Truck, X } from '@lucide/vue'

type IndustryKey = 'logistics' | 'hospitality' | 'retail'
type PersonaKey = 'frontline' | 'ops' | 'ceo' | 'board'

interface KPI {
  id: string
  label: string
  value: string
  /** Movement: +/-/flat with whether the direction is good for this metric. */
  delta: { text: string; dir: 'up' | 'down' | 'flat'; good: boolean }
  /** Time horizon shown as a small label. */
  horizon: string
  /** Six points (0..1) used to render a tiny sparkline. */
  spark: number[]
  /** Drill-down content. */
  calc: string
  sources: string[]
  decision: string
  action: string
}

interface Briefing {
  anomalies: string[]
  risks: string[]
  decisions: string[]
}

interface PersonaDef {
  key: PersonaKey
  icon: typeof Truck
  horizon: string
  primesFor: string
}

interface IndustryDef {
  key: IndustryKey
  label: string
  short: string
}

// ---------- Static config ----------

const INDUSTRIES: IndustryDef[] = [
  { key: 'logistics',   label: 'Logistics',   short: 'Logistics' },
  { key: 'hospitality', label: 'Hospitality', short: 'Hospitality' },
  { key: 'retail',      label: 'Retail',      short: 'Retail' },
]

const PERSONAS: PersonaDef[] = [
  { key: 'frontline', icon: Truck,         horizon: 'Today',     primesFor: 'Calls to make before lunch' },
  { key: 'ops',       icon: ClipboardList, horizon: 'This week', primesFor: 'Where the week is bending' },
  { key: 'ceo',       icon: Briefcase,     horizon: 'MTD',       primesFor: 'What changes the quarter' },
  { key: 'board',     icon: Landmark,      horizon: 'Quarter',   primesFor: 'Trend lines, not noise' },
]

const PERSONA_LABELS: Record<IndustryKey, Record<PersonaKey, string>> = {
  logistics: {
    frontline: 'Fleet Manager',
    ops: 'Operations Director',
    ceo: 'CEO',
    board: 'Board',
  },
  hospitality: {
    frontline: 'General Manager',
    ops: 'Operations Director',
    ceo: 'CEO',
    board: 'Board',
  },
  retail: {
    frontline: 'Store Manager',
    ops: 'Operations Director',
    ceo: 'CEO',
    board: 'Board',
  },
}

// ---------- KPI data ----------

const KPIS: Record<IndustryKey, Record<PersonaKey, KPI[]>> = {
  logistics: {
    frontline: [
      {
        id: 'log-fm-otp',
        label: 'Routes on time',
        value: '87%',
        delta: { text: '-3pp vs trailing 7d', dir: 'down', good: false },
        horizon: 'Today',
        spark: [0.7, 0.8, 0.85, 0.78, 0.82, 0.74, 0.6],
        calc: 'Deliveries marked complete inside the SLA window ÷ deliveries completed today, recomputed every 10 minutes.',
        sources: ['Telematics (Geotab)', 'Dispatch system', 'POD scans'],
        decision: 'Reshuffle the afternoon waves, or absorb the misses.',
        action: 'Two drivers running 25+ min late on the N1 corridor. Re-allocate stops 14–18 to the spare truck before 14:00.',
      },
      {
        id: 'log-fm-hours',
        label: 'Driver hours risk',
        value: '4 / 45',
        delta: { text: '4 at 90%+ of cap', dir: 'up', good: false },
        horizon: 'Today',
        spark: [0.2, 0.3, 0.4, 0.5, 0.7, 0.8, 0.9],
        calc: 'Drivers projected to breach the 12-hour duty limit before close, based on current route ETAs.',
        sources: ['Telematics', 'Roster system', 'Live ETAs'],
        decision: 'Pre-empt a CCMA-grade fatigue incident.',
        action: 'Swap routes for J. Mokoena and T. Pillay onto the standby pair before 15:00. Both are tracking 12h12 and 12h08.',
      },
      {
        id: 'log-fm-avail',
        label: 'Vehicle availability',
        value: '41 / 45',
        delta: { text: '+2 vs yesterday', dir: 'up', good: true },
        horizon: 'Now',
        spark: [0.85, 0.86, 0.84, 0.88, 0.9, 0.91, 0.91],
        calc: 'Vehicles cleared for dispatch ÷ active fleet, minus any flagged in workshop, service, or licensing hold.',
        sources: ['Workshop CMMS', 'Vehicle compliance log', 'Fuel cards'],
        decision: 'Whether to take the booked overflow load on Friday.',
        action: 'Two trucks complete service today by 16:00. Confirm the Friday overflow before the 14:00 customer cut-off.',
      },
      {
        id: 'log-fm-cpd',
        label: 'Cost per drop',
        value: 'R 142',
        delta: { text: '+R 6 vs trailing 4w', dir: 'up', good: false },
        horizon: 'This week',
        spark: [0.45, 0.5, 0.48, 0.52, 0.55, 0.6, 0.62],
        calc: 'All-in route cost (fuel + driver time + tolls + maintenance allocation) ÷ drops completed, rolling 7 days.',
        sources: ['Fuel cards', 'Payroll', 'Tolls (e-tag)', 'CMMS allocation'],
        decision: 'Whether the current route plan is still earning its keep.',
        action: 'Two corridors driving the increase: KZN-North and Cape-East. Run the route optimiser against last week\'s drop pattern.',
      },
    ],
    ops: [
      {
        id: 'log-ops-sla',
        label: 'Service level',
        value: '94.2%',
        delta: { text: '+0.7pp vs last week', dir: 'up', good: true },
        horizon: 'This week',
        spark: [0.88, 0.9, 0.91, 0.92, 0.93, 0.94, 0.942],
        calc: 'Drops inside SLA ÷ total drops, weighted by customer-tier multiplier.',
        sources: ['Dispatch', 'POD scans', 'Customer master'],
        decision: 'Whether to surface the gain to the top-three accounts in next week\'s QBR.',
        action: 'Bake the trend into the QBR deck for the three accounts with SLA penalty clauses.',
      },
      {
        id: 'log-ops-fuel',
        label: 'Fuel cost',
        value: 'R 387k',
        delta: { text: '+12% vs forecast', dir: 'up', good: false },
        horizon: 'MTD',
        spark: [0.4, 0.5, 0.55, 0.6, 0.7, 0.78, 0.84],
        calc: 'Sum of fuel card transactions month-to-date, normalised against the forecast curve from the budget tool.',
        sources: ['Fuel cards', 'Budget tool', 'Diesel price feed'],
        decision: 'Whether to trigger the price-recovery clause on the variable-rate contracts.',
        action: 'Diesel up 9% vs forecast input. Trigger the clause on Klipfontein and Bayside contracts before month-end.',
      },
      {
        id: 'log-ops-late',
        label: 'Late-delivery cost',
        value: 'R 84k',
        delta: { text: '-18% vs last month', dir: 'down', good: true },
        horizon: 'MTD',
        spark: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.42],
        calc: 'SLA-breach penalty exposure ÷ matched POD timestamps, less waived penalties.',
        sources: ['Dispatch', 'POD scans', 'Customer SLA matrix'],
        decision: 'Whether the new dispatcher workflow can come off review.',
        action: 'Lift the dispatcher trial flag at the operations stand-up on Friday.',
      },
      {
        id: 'log-ops-yard',
        label: 'Yard utilisation',
        value: '68%',
        delta: { text: '+4pp vs trailing 4w', dir: 'up', good: true },
        horizon: 'This week',
        spark: [0.55, 0.58, 0.6, 0.62, 0.64, 0.66, 0.68],
        calc: 'Bay-occupancy minutes ÷ bay-available minutes during the dispatch window.',
        sources: ['Yard management', 'Telematics', 'Gate scans'],
        decision: 'Whether to defer the planned third yard expansion.',
        action: 'Push the expansion business case out one quarter; revisit if utilisation crosses 78%.',
      },
    ],
    ceo: [
      {
        id: 'log-ceo-rev',
        label: 'Revenue',
        value: 'R 4.2M',
        delta: { text: '+8% YoY', dir: 'up', good: true },
        horizon: 'MTD',
        spark: [0.5, 0.55, 0.62, 0.68, 0.74, 0.82, 0.88],
        calc: 'Invoiced revenue MTD across all business units, gross of credit notes.',
        sources: ['Billing', 'CRM', 'Credit-note log'],
        decision: 'Whether to lift the headcount freeze on commercial roles.',
        action: 'Discuss with FD at Monday\'s leadership: revenue trend supports two of the four held roles.',
      },
      {
        id: 'log-ceo-gm',
        label: 'Gross margin',
        value: '22.4%',
        delta: { text: '-1.1pp vs last month', dir: 'down', good: false },
        horizon: 'MTD',
        spark: [0.7, 0.72, 0.7, 0.66, 0.62, 0.6, 0.58],
        calc: '(Revenue − direct cost) ÷ Revenue, MTD, with diesel and labour pulled in real time.',
        sources: ['GL', 'Fuel cards', 'Payroll', 'Route cost engine'],
        decision: 'Whether to renegotiate the two contracts with the worst gross-margin contribution.',
        action: 'Direct cost up 9% on diesel. Open the Klipfontein and Bayside renegotiation files this week.',
      },
      {
        id: 'log-ceo-ebitda',
        label: 'EBITDA run-rate',
        value: 'R 9.8M',
        delta: { text: 'On plan', dir: 'flat', good: true },
        horizon: 'MTD',
        spark: [0.6, 0.62, 0.62, 0.63, 0.63, 0.64, 0.64],
        calc: 'Trailing-three-month EBITDA annualised, with adjustments for one-off items flagged in close.',
        sources: ['GL', 'Close adjustments', 'Headcount plan'],
        decision: 'Whether to brief the board ahead of the quarterly.',
        action: 'No board email needed; revisit if run-rate moves more than 5% off plan.',
      },
      {
        id: 'log-ceo-cash',
        label: 'Cash runway',
        value: '14 months',
        delta: { text: '-1 month vs last month', dir: 'down', good: false },
        horizon: 'As of today',
        spark: [0.95, 0.92, 0.9, 0.87, 0.85, 0.82, 0.8],
        calc: 'Cash on hand ÷ trailing-three-month operating burn, adjusted for known inflows in next 30 days.',
        sources: ['Bank feeds', 'AR aging', 'AP aging'],
        decision: 'Whether to draw on the revolver early.',
        action: 'Move the revolver conversation up by a month with the FD and the relationship manager.',
      },
    ],
    board: [
      {
        id: 'log-bd-rev',
        label: 'Revenue',
        value: 'R 11.8M',
        delta: { text: '+14% YoY', dir: 'up', good: true },
        horizon: 'Quarter',
        spark: [0.4, 0.5, 0.6, 0.65, 0.74, 0.82, 0.9],
        calc: 'Quarter revenue, audited where the close is final, latest-estimate where it is not.',
        sources: ['Audited GL', 'Close pack', 'CRM forecast'],
        decision: 'Whether to confirm the FY guidance to investors.',
        action: 'Hold guidance for one more quarter; trajectory is in range but margin compression is the watch item.',
      },
      {
        id: 'log-bd-gm',
        label: 'Gross margin',
        value: '23.1%',
        delta: { text: '+0.4pp QoQ', dir: 'up', good: true },
        horizon: 'Quarter',
        spark: [0.6, 0.6, 0.62, 0.62, 0.64, 0.65, 0.65],
        calc: 'Quarter (Revenue − direct cost) ÷ Revenue, normalised for one-off costs.',
        sources: ['Audited GL', 'Cost allocation model'],
        decision: 'Whether the margin uplift is structural or mix-driven.',
        action: 'Ask the FD to split the QoQ delta between price, mix, and route efficiency at next board.',
      },
      {
        id: 'log-bd-conc',
        label: 'Customer concentration',
        value: '41%',
        delta: { text: '-3pp vs last quarter', dir: 'down', good: true },
        horizon: 'Top 3, quarter',
        spark: [0.5, 0.48, 0.46, 0.45, 0.44, 0.42, 0.41],
        calc: 'Revenue from the top three customers ÷ total quarterly revenue.',
        sources: ['Billing', 'CRM', 'Customer master'],
        decision: 'Whether the diversification effort can be wound down.',
        action: 'Keep the mid-market sales programme running for one more quarter; threshold target is 35%.',
      },
      {
        id: 'log-bd-nrr',
        label: 'Net revenue retention',
        value: '108%',
        delta: { text: '+2pp vs last quarter', dir: 'up', good: true },
        horizon: 'Quarter',
        spark: [0.5, 0.55, 0.58, 0.6, 0.62, 0.64, 0.66],
        calc: 'Quarter revenue from prior-period customers ÷ same-cohort revenue 12 months ago.',
        sources: ['Billing', 'CRM cohorts'],
        decision: 'Whether to allocate more capital to account expansion.',
        action: 'Recommend a 1.5x lift in the account-expansion budget at the strategy session.',
      },
    ],
  },
  hospitality: {
    frontline: [
      {
        id: 'hos-gm-revpar',
        label: 'RevPAR',
        value: 'R 1,420',
        delta: { text: '-4% vs trailing 7d', dir: 'down', good: false },
        horizon: 'Today',
        spark: [0.75, 0.78, 0.8, 0.76, 0.74, 0.7, 0.66],
        calc: 'Room revenue ÷ available rooms, day-of, refreshed every 30 minutes.',
        sources: ['PMS', 'Channel manager', 'Direct bookings'],
        decision: 'Whether to flex the rate on remaining rooms.',
        action: 'Drop the published rate on the last 15 rooms by R 120 for the next four hours; review at 16:00.',
      },
      {
        id: 'hos-gm-occ',
        label: 'Occupancy tonight',
        value: '78%',
        delta: { text: '15 rooms left', dir: 'flat', good: false },
        horizon: 'Tonight',
        spark: [0.5, 0.6, 0.65, 0.7, 0.73, 0.76, 0.78],
        calc: 'Confirmed nights ÷ total saleable rooms for the current night.',
        sources: ['PMS', 'Channel manager', 'Walk-in log'],
        decision: 'Whether to release the held block to OTA.',
        action: 'Release the 8-room corporate hold at 17:00 if it has not converted; OTA demand is strong tonight.',
      },
      {
        id: 'hos-gm-comp',
        label: 'Service complaints',
        value: '3 open',
        delta: { text: '1 escalated', dir: 'up', good: false },
        horizon: 'Last 24h',
        spark: [0.2, 0.25, 0.3, 0.4, 0.45, 0.5, 0.55],
        calc: 'Open guest complaints in the CRM, weighted by guest tier and platform exposure.',
        sources: ['Guest CRM', 'Front-desk log', 'Public review feeds'],
        decision: 'Whether the GM needs to make the recovery call personally.',
        action: 'Take the room 412 escalation yourself before 11:00; the guest is loyalty-tier and posting tonight.',
      },
      {
        id: 'hos-gm-stock',
        label: 'Stock-out risk',
        value: '2 SKUs',
        delta: { text: '+1 vs yesterday', dir: 'up', good: false },
        horizon: 'Today',
        spark: [0.3, 0.32, 0.35, 0.4, 0.45, 0.48, 0.5],
        calc: 'F&B SKUs projected to deplete before next delivery, based on consumption rate and stock-on-hand.',
        sources: ['POS', 'Stock counts', 'Supplier delivery schedule'],
        decision: 'Whether to call in an emergency order or rework the menu.',
        action: 'Rework the wine-by-the-glass list around the available SKUs; the next delivery is on Thursday.',
      },
    ],
    ops: [
      {
        id: 'hos-ops-revpar',
        label: 'RevPAR',
        value: 'R 1,486',
        delta: { text: '+6% YoY', dir: 'up', good: true },
        horizon: 'This week',
        spark: [0.55, 0.6, 0.62, 0.66, 0.7, 0.74, 0.78],
        calc: 'Weekly room revenue ÷ available rooms, weighted across the portfolio.',
        sources: ['PMS portfolio feed', 'Channel manager'],
        decision: 'Whether to push the same rate strategy to the underperforming properties.',
        action: 'Roll the rate plan from Cape Quarter out to the two Northern properties from Monday.',
      },
      {
        id: 'hos-ops-alos',
        label: 'ALOS',
        value: '1.9 nights',
        delta: { text: 'Flat vs last week', dir: 'flat', good: false },
        horizon: 'This week',
        spark: [0.4, 0.42, 0.42, 0.43, 0.43, 0.42, 0.42],
        calc: 'Total nights booked ÷ total reservations, this week, all properties.',
        sources: ['PMS', 'Channel manager'],
        decision: 'Whether the min-stay restrictions need re-tuning.',
        action: 'Trial a 2-night min on Fri/Sat at three properties next month; measure ALOS lift against ADR drag.',
      },
      {
        id: 'hos-ops-fnb',
        label: 'F&B cost ratio',
        value: '31%',
        delta: { text: '+2pp vs target', dir: 'up', good: false },
        horizon: 'MTD',
        spark: [0.5, 0.52, 0.55, 0.58, 0.6, 0.62, 0.64],
        calc: 'Cost of goods sold (F&B) ÷ F&B revenue, MTD across the portfolio.',
        sources: ['POS', 'Supplier invoices', 'Inventory'],
        decision: 'Whether to escalate to the chefs or to procurement.',
        action: 'Procurement first — two suppliers have raised price 7%+ without notice. Then the menu mix conversation.',
      },
      {
        id: 'hos-ops-chan',
        label: 'Direct booking %',
        value: '38%',
        delta: { text: '+3pp vs trailing 4w', dir: 'up', good: true },
        horizon: 'This week',
        spark: [0.4, 0.42, 0.45, 0.48, 0.5, 0.52, 0.54],
        calc: 'Bookings via direct channels ÷ total bookings, this week.',
        sources: ['Channel manager', 'Direct booking engine'],
        decision: 'Whether the loyalty programme is earning its cost.',
        action: 'Greenlight the second wave of the loyalty roll-out; ROI is now visible in the channel mix.',
      },
    ],
    ceo: [
      {
        id: 'hos-ceo-rev',
        label: 'Revenue',
        value: 'R 2.8M',
        delta: { text: '+11% YoY', dir: 'up', good: true },
        horizon: 'MTD',
        spark: [0.45, 0.52, 0.6, 0.66, 0.74, 0.8, 0.86],
        calc: 'Total invoiced revenue MTD across rooms, F&B and events.',
        sources: ['PMS', 'POS', 'Events booking system'],
        decision: 'Whether to release the budget for the December marketing push.',
        action: 'Release 60% of the December marketing budget now; reassess after the next two weeks of pace.',
      },
      {
        id: 'hos-ceo-gop',
        label: 'GOP margin',
        value: '38.2%',
        delta: { text: '+1.2pp vs last month', dir: 'up', good: true },
        horizon: 'MTD',
        spark: [0.5, 0.52, 0.55, 0.58, 0.6, 0.62, 0.64],
        calc: 'Gross operating profit ÷ revenue, MTD, after departmental costs but before fixed overhead.',
        sources: ['PMS', 'POS', 'Payroll', 'Property GL'],
        decision: 'Whether to commit to the renovation capex sooner.',
        action: 'Bring the renovation capex case forward to the next board agenda; cash flow now supports it.',
      },
      {
        id: 'hos-ceo-nps',
        label: 'NPS (90-day rolling)',
        value: '62',
        delta: { text: '+4 vs last quarter', dir: 'up', good: true },
        horizon: 'Rolling 90d',
        spark: [0.5, 0.52, 0.55, 0.58, 0.6, 0.62, 0.64],
        calc: '(Promoters − Detractors) ÷ total respondents, rolling 90-day.',
        sources: ['Guest survey', 'Review feeds', 'Loyalty CRM'],
        decision: 'Whether the staff-incentive trial scales to the rest of the portfolio.',
        action: 'Scale the staff-incentive scheme to all properties from the next cycle.',
      },
      {
        id: 'hos-ceo-cash',
        label: 'Cash runway',
        value: '22 months',
        delta: { text: 'Flat vs last month', dir: 'flat', good: true },
        horizon: 'As of today',
        spark: [0.7, 0.7, 0.71, 0.71, 0.7, 0.71, 0.71],
        calc: 'Cash on hand ÷ trailing-three-month operating burn, adjusted for seasonality.',
        sources: ['Bank feeds', 'AR aging', 'Booking pipeline'],
        decision: 'No action; this is the watch metric, not the action metric.',
        action: 'No board email required this month.',
      },
    ],
    board: [
      {
        id: 'hos-bd-rev',
        label: 'Revenue',
        value: 'R 7.9M',
        delta: { text: '+12% YoY', dir: 'up', good: true },
        horizon: 'Quarter',
        spark: [0.4, 0.5, 0.58, 0.65, 0.74, 0.82, 0.88],
        calc: 'Quarter revenue across the portfolio, audited where the close is final.',
        sources: ['Audited GL', 'PMS', 'POS'],
        decision: 'Whether to recommit to the FY revenue target.',
        action: 'Confirm the FY target at next board; trajectory is comfortable.',
      },
      {
        id: 'hos-bd-gop',
        label: 'GOP margin',
        value: '37.6%',
        delta: { text: '+0.9pp QoQ', dir: 'up', good: true },
        horizon: 'Quarter',
        spark: [0.55, 0.58, 0.6, 0.62, 0.64, 0.65, 0.66],
        calc: 'Quarter GOP ÷ revenue, normalised across property tiers.',
        sources: ['Audited GL', 'Property cost allocation'],
        decision: 'Whether the cost-discipline mandate is still required.',
        action: 'Sunset the cost-discipline mandate; replace with a guest-experience investment mandate.',
      },
      {
        id: 'hos-bd-direct',
        label: 'Direct booking %',
        value: '36%',
        delta: { text: '+5pp YoY', dir: 'up', good: true },
        horizon: 'Quarter',
        spark: [0.3, 0.34, 0.38, 0.42, 0.46, 0.5, 0.52],
        calc: 'Bookings via owned channels ÷ total quarter bookings.',
        sources: ['Channel manager', 'Loyalty CRM'],
        decision: 'Whether to formally retire the OTA-only legacy properties.',
        action: 'Retire OTA-only at the two unwound properties; re-platform onto the unified stack.',
      },
      {
        id: 'hos-bd-capex',
        label: 'Capex / EBITDA',
        value: '0.18',
        delta: { text: '-0.04 vs last quarter', dir: 'down', good: true },
        horizon: 'TTM',
        spark: [0.6, 0.58, 0.55, 0.52, 0.5, 0.48, 0.46],
        calc: 'Trailing-twelve-month capex ÷ trailing-twelve-month EBITDA.',
        sources: ['Audited GL', 'Capex pipeline'],
        decision: 'Whether there is room for an extra refurb cycle in FY+1.',
        action: 'Open the FY+1 refurb shortlist with the COO before the strategy session.',
      },
    ],
  },
  retail: {
    frontline: [
      {
        id: 'ret-sm-sales',
        label: 'Sales vs plan',
        value: 'R 84k',
        delta: { text: '-6% vs plan', dir: 'down', good: false },
        horizon: 'Today',
        spark: [0.6, 0.65, 0.62, 0.58, 0.55, 0.52, 0.5],
        calc: 'Net sales today ÷ daily plan, computed against the store-specific seasonality curve.',
        sources: ['POS', 'Sales plan', 'Door counter'],
        decision: 'Whether to call the late-shift power hour.',
        action: 'Trigger the 17:00 power-hour staffing; promote the bundle the head-office team pushed yesterday.',
      },
      {
        id: 'ret-sm-conv',
        label: 'Conversion rate',
        value: '14.8%',
        delta: { text: '-1.2pp vs trailing 7d', dir: 'down', good: false },
        horizon: 'Today',
        spark: [0.6, 0.62, 0.58, 0.55, 0.52, 0.5, 0.48],
        calc: 'Transactions ÷ door entries, day-of.',
        sources: ['POS', 'Door counter', 'Floor map'],
        decision: 'Whether the floor coverage is the bottleneck or the offer is.',
        action: 'Pull one back-of-house assistant to the floor between 12:00 and 14:00; review at 14:30.',
      },
      {
        id: 'ret-sm-basket',
        label: 'Basket size',
        value: 'R 412',
        delta: { text: '+R 8 vs trailing 7d', dir: 'up', good: true },
        horizon: 'Today',
        spark: [0.55, 0.57, 0.58, 0.6, 0.62, 0.63, 0.65],
        calc: 'Total revenue ÷ transactions today.',
        sources: ['POS', 'Promotion log'],
        decision: 'Whether the upsell coaching is sticking.',
        action: 'Recognise the two top performers on the WhatsApp group at close.',
      },
      {
        id: 'ret-sm-stockout',
        label: 'Stock-outs',
        value: '7 SKUs',
        delta: { text: '+2 vs yesterday', dir: 'up', good: false },
        horizon: 'Now',
        spark: [0.2, 0.25, 0.3, 0.4, 0.45, 0.5, 0.55],
        calc: 'SKUs where on-hand has fallen to zero, filtered to the top-quartile of velocity.',
        sources: ['Stock-on-hand', 'POS velocity', 'Replenishment queue'],
        decision: 'Whether to pull replenishment forward or substitute on-floor.',
        action: 'Pull the Friday DC delivery to Thursday for the two velocity-A SKUs; substitute on-shelf for the rest.',
      },
    ],
    ops: [
      {
        id: 'ret-ops-lfl',
        label: 'Like-for-like',
        value: '+4.2%',
        delta: { text: '+0.6pp vs last week', dir: 'up', good: true },
        horizon: 'This week',
        spark: [0.5, 0.55, 0.58, 0.6, 0.62, 0.64, 0.66],
        calc: 'Current-week sales ÷ same-week prior-year sales, stores open in both periods.',
        sources: ['POS', 'Store master', 'Promotion log'],
        decision: 'Whether the autumn campaign is working.',
        action: 'Extend the campaign by one week at the seven stores tracking above plan.',
      },
      {
        id: 'ret-ops-shrink',
        label: 'Shrinkage',
        value: '1.4%',
        delta: { text: '+0.2pp vs last month', dir: 'up', good: false },
        horizon: 'MTD',
        spark: [0.4, 0.42, 0.45, 0.48, 0.5, 0.52, 0.54],
        calc: '(Book stock − physical stock) ÷ sales, MTD, across all stores.',
        sources: ['POS', 'Cycle counts', 'Loss-prevention log'],
        decision: 'Whether to bring forward the quarterly count or focus loss-prevention.',
        action: 'Bring the count forward to next Wednesday for the four stores showing the most drift.',
      },
      {
        id: 'ret-ops-markdown',
        label: 'Markdown rate',
        value: '8.6%',
        delta: { text: '-1.1pp vs last month', dir: 'down', good: true },
        horizon: 'MTD',
        spark: [0.6, 0.58, 0.55, 0.52, 0.5, 0.48, 0.46],
        calc: 'Markdown value ÷ gross sales, MTD.',
        sources: ['POS', 'Markdown approvals log'],
        decision: 'Whether the buying team\'s new sizing matrix is paying off.',
        action: 'Lift the matrix into the next two category reviews; close the loop with the buyers.',
      },
      {
        id: 'ret-ops-turn',
        label: 'Stock turn',
        value: '6.2x',
        delta: { text: 'Flat vs trailing 90d', dir: 'flat', good: true },
        horizon: 'Rolling 90d',
        spark: [0.55, 0.56, 0.56, 0.55, 0.56, 0.56, 0.56],
        calc: 'Cost of goods sold (rolling 90d) ÷ average stock-on-hand at cost.',
        sources: ['POS', 'Stock-on-hand', 'Purchase orders'],
        decision: 'Whether the buying cadence needs adjusting.',
        action: 'No change; reassess after the autumn season is fully read.',
      },
    ],
    ceo: [
      {
        id: 'ret-ceo-rev',
        label: 'Revenue',
        value: 'R 38.2M',
        delta: { text: '+9% YoY', dir: 'up', good: true },
        horizon: 'MTD',
        spark: [0.45, 0.52, 0.6, 0.66, 0.74, 0.8, 0.86],
        calc: 'Net invoiced revenue MTD across all stores and the online channel.',
        sources: ['POS', 'eCom', 'Returns log'],
        decision: 'Whether to fund the third online warehouse this year.',
        action: 'Bring the warehouse business case to the next leadership session; trajectory supports it.',
      },
      {
        id: 'ret-ceo-gm',
        label: 'Gross margin',
        value: '47.6%',
        delta: { text: '-0.6pp vs last month', dir: 'down', good: false },
        horizon: 'MTD',
        spark: [0.65, 0.63, 0.6, 0.58, 0.56, 0.54, 0.52],
        calc: '(Revenue − COGS) ÷ revenue, MTD, with markdown and shrink baked in.',
        sources: ['POS', 'Inventory ledger', 'Markdown log'],
        decision: 'Whether the markdown discipline is slipping or the supplier price is.',
        action: 'Pull the supplier price-walk report into Friday\'s review; markdown is healthy this month.',
      },
      {
        id: 'ret-ceo-stores',
        label: 'Stores above plan',
        value: '22 of 31',
        delta: { text: '-3 vs last month', dir: 'down', good: false },
        horizon: 'MTD',
        spark: [0.85, 0.82, 0.8, 0.78, 0.75, 0.72, 0.7],
        calc: 'Stores tracking ≥ 100% of plan ÷ total stores, MTD.',
        sources: ['POS', 'Sales plan', 'Store master'],
        decision: 'Whether the three slipped stores need a turnaround playbook.',
        action: 'Send the regional director out to the three slipped stores this week.',
      },
      {
        id: 'ret-ceo-cash',
        label: 'Cash runway',
        value: '11 months',
        delta: { text: '-2 months vs last month', dir: 'down', good: false },
        horizon: 'As of today',
        spark: [0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5],
        calc: 'Cash on hand ÷ trailing-three-month operating burn, including working-capital build for the season.',
        sources: ['Bank feeds', 'AR aging', 'AP aging', 'Inventory build'],
        decision: 'Whether to slow the inventory build or extend the working-capital facility.',
        action: 'Open the facility-extension conversation this week; do not slow the build, the season is set.',
      },
    ],
    board: [
      {
        id: 'ret-bd-rev',
        label: 'Revenue',
        value: 'R 108M',
        delta: { text: '+9% YoY', dir: 'up', good: true },
        horizon: 'Quarter',
        spark: [0.4, 0.5, 0.58, 0.65, 0.74, 0.82, 0.88],
        calc: 'Quarter revenue across all stores and online, audited where the close is final.',
        sources: ['Audited GL', 'POS', 'eCom'],
        decision: 'Whether the FY revenue guidance needs revising.',
        action: 'Hold FY guidance; trajectory remains within the corridor.',
      },
      {
        id: 'ret-bd-gm',
        label: 'Gross margin',
        value: '47.8%',
        delta: { text: '+0.2pp QoQ', dir: 'up', good: true },
        horizon: 'Quarter',
        spark: [0.6, 0.61, 0.62, 0.63, 0.63, 0.64, 0.64],
        calc: 'Quarter (Revenue − COGS) ÷ Revenue, normalised for one-off items.',
        sources: ['Audited GL', 'Cost allocation'],
        decision: 'Whether to invest in the private-label expansion.',
        action: 'Greenlight private-label phase two at the strategy session.',
      },
      {
        id: 'ret-bd-newstore',
        label: 'New-store contribution',
        value: '11%',
        delta: { text: '+3pp vs last quarter', dir: 'up', good: true },
        horizon: 'Quarter',
        spark: [0.4, 0.42, 0.45, 0.5, 0.55, 0.6, 0.65],
        calc: 'Revenue from stores opened in the last 12 months ÷ total quarter revenue.',
        sources: ['Store master', 'Audited GL'],
        decision: 'Whether to accelerate the new-store programme.',
        action: 'Bring two FY+1 stores forward into FY by one quarter each.',
      },
      {
        id: 'ret-bd-nwc',
        label: 'Net working capital days',
        value: '38',
        delta: { text: '-4 vs last quarter', dir: 'down', good: true },
        horizon: 'Quarter',
        spark: [0.7, 0.65, 0.6, 0.55, 0.5, 0.48, 0.46],
        calc: '(Receivables + inventory − payables) ÷ daily revenue, quarter-end.',
        sources: ['Audited GL', 'AR aging', 'AP aging', 'Inventory ledger'],
        decision: 'Whether the working-capital efficiency programme can be wound down.',
        action: 'Keep the programme running one more quarter; target is 32 days.',
      },
    ],
  },
}

// ---------- Briefings ----------

const BRIEFINGS: Record<IndustryKey, Record<PersonaKey, Briefing>> = {
  logistics: {
    frontline: {
      anomalies: [
        'Two N1 corridor routes finished 47 and 52 minutes late — same dispatcher, same shift.',
        'Three returns flagged against the new packaging spec; loaders not yet retrained.',
        'Workshop completed both scheduled services overnight — fleet at 41 of 45.',
      ],
      risks: [
        'Four drivers projected to breach 12-hour duty before close.',
        'KZN-North corridor showing R 12 lift in cost-per-drop on early reads.',
      ],
      decisions: [
        'Swap routes for J. Mokoena and T. Pillay before 15:00.',
        'Re-allocate stops 14–18 on the N1 to the spare truck before 14:00.',
        'Confirm the Friday overflow load to the customer before the 14:00 cut-off.',
      ],
    },
    ops: {
      anomalies: [
        'Fuel spend tracking +12% against forecast — diesel up 9%, the rest is route mix.',
        'Dispatcher trial completing its eighth consecutive week below SLA penalty exposure.',
      ],
      risks: [
        'Two contracts (Klipfontein, Bayside) now eligible for the price-recovery clause.',
        'Yard utilisation crossed 68% — expansion business case threshold is 78%.',
      ],
      decisions: [
        'Trigger the price-recovery clause on Klipfontein and Bayside before month-end.',
        'Lift the dispatcher trial flag at Friday\'s stand-up.',
        'Defer the third-yard expansion business case by one quarter.',
      ],
    },
    ceo: {
      anomalies: [
        'Gross margin slipped 1.1pp on diesel pass-through; revenue still tracking +8% YoY.',
        'Cash runway dropped a month against the forecast curve.',
      ],
      risks: [
        'Two top-five contracts are price-recovery candidates and will need executive sign-off.',
        'Headcount freeze becomes the bottleneck on commercial roles within four weeks.',
      ],
      decisions: [
        'Lift the headcount freeze on two of the four held commercial roles.',
        'Move the revolver conversation up by a month with FD and relationship manager.',
        'Brief the board ahead of the quarterly — margin compression is the watch item.',
      ],
    },
    board: {
      anomalies: [
        'Customer concentration dropped 3pp on top three — diversification is working.',
        'Gross margin held QoQ despite a fuel headwind that hit competitors harder.',
      ],
      risks: [
        'FY revenue guidance is within corridor but margin is the variable to watch.',
        'Net retention at 108% — capital allocation question is now timely.',
      ],
      decisions: [
        'Hold FY guidance one more quarter.',
        'Ask FD for a price/mix/efficiency split on the margin uplift.',
        'Approve the 1.5x lift in account-expansion budget at strategy session.',
      ],
    },
  },
  hospitality: {
    frontline: {
      anomalies: [
        'Room 412 escalation overnight — loyalty-tier guest, posting tonight.',
        'Wine-by-the-glass list down two SKUs ahead of the Thursday delivery.',
      ],
      risks: [
        'RevPAR tracking -4% on today\'s pace; 15 rooms still saleable.',
        'Corporate hold of 8 rooms not yet converted.',
      ],
      decisions: [
        'Make the 412 recovery call yourself before 11:00.',
        'Drop the rate on the last 15 rooms by R 120 until 16:00.',
        'Release the corporate hold to OTA at 17:00 if it has not landed.',
      ],
    },
    ops: {
      anomalies: [
        'F&B cost ratio crossed 31% — two suppliers raised price 7%+ without notice.',
        'Direct booking share climbed another 3pp; loyalty programme is paying.',
      ],
      risks: [
        'Cape Quarter rate plan delivering +6% YoY — Northern properties still on the old plan.',
        'ALOS flat against last week despite the long-weekend push.',
      ],
      decisions: [
        'Take the supplier conversation to procurement first; menu mix after.',
        'Roll the Cape Quarter rate plan to the two Northern properties from Monday.',
        'Approve the second wave of the loyalty roll-out.',
      ],
    },
    ceo: {
      anomalies: [
        'GOP up 1.2pp — staff-incentive trial is the visible driver.',
        'NPS at 62 on the rolling 90 — best read of the year.',
      ],
      risks: [
        'December marketing budget held pending pace read.',
        'Renovation capex case is now timing-sensitive.',
      ],
      decisions: [
        'Release 60% of December marketing now.',
        'Bring the renovation capex case forward to the next board agenda.',
        'Scale staff-incentive to all properties from the next cycle.',
      ],
    },
    board: {
      anomalies: [
        'Direct booking share at 36% — five-percentage-point gain YoY.',
        'Two legacy OTA-only properties now on the unified platform after rebuild.',
      ],
      risks: [
        'FY revenue target is comfortable; the watch item is the refurb cycle.',
        'Capex / EBITDA at 0.18 — historically low, opens room for FY+1 spend.',
      ],
      decisions: [
        'Confirm the FY revenue target at next board.',
        'Sunset the cost-discipline mandate; replace with experience-investment mandate.',
        'Open the FY+1 refurb shortlist with the COO ahead of strategy session.',
      ],
    },
  },
  retail: {
    frontline: {
      anomalies: [
        'Conversion -1.2pp on today\'s pace despite door count holding steady.',
        'Two velocity-A SKUs went out-of-stock overnight; replenishment is Friday.',
      ],
      risks: [
        'Sales tracking -6% to plan — afternoon pace needs to recover.',
        'Five lower-velocity SKUs also stocked-out, but substitutes are on the floor.',
      ],
      decisions: [
        'Trigger the 17:00 power-hour staffing and push the head-office bundle.',
        'Pull one back-of-house assistant to the floor between 12:00 and 14:00.',
        'Pull the Friday DC delivery to Thursday for the two velocity-A SKUs.',
      ],
    },
    ops: {
      anomalies: [
        'Shrinkage drifted +0.2pp at four stores — common factor: same regional team.',
        'Markdown rate down 1.1pp; new sizing matrix is the visible driver.',
      ],
      risks: [
        'Autumn campaign extension would tie up additional working capital.',
        'Stock turn flat at 6.2x — no movement signal either way.',
      ],
      decisions: [
        'Bring the count forward to next Wednesday for the four drifting stores.',
        'Lift the sizing matrix into the next two category reviews.',
        'Extend the autumn campaign by one week at the seven over-plan stores.',
      ],
    },
    ceo: {
      anomalies: [
        'Three stores slipped below plan in the last four weeks — same region.',
        'Gross margin softened 0.6pp; markdown is healthy, so it\'s supplier-side.',
      ],
      risks: [
        'Cash runway down two months as the season inventory builds.',
        'Working-capital facility extension is the cleaner lever than slowing the build.',
      ],
      decisions: [
        'Send the regional director out to the three slipped stores this week.',
        'Open the facility-extension conversation with the bank this week.',
        'Bring the third online warehouse business case to leadership.',
      ],
    },
    board: {
      anomalies: [
        'New-store contribution at 11% — three points of QoQ acceleration.',
        'NWC days improved by four — efficiency programme is working.',
      ],
      risks: [
        'FY guidance is comfortable; private-label decision is now timing-sensitive.',
        'Two FY+1 stores could be pulled forward without overheating the property team.',
      ],
      decisions: [
        'Hold FY guidance.',
        'Greenlight private-label phase two at strategy session.',
        'Approve pulling two FY+1 stores forward by one quarter each.',
      ],
    },
  },
}

// ---------- State ----------

const industry = ref<IndustryKey>('logistics')
const persona = ref<PersonaKey>('frontline')
const openKpiId = ref<string | null>(null)
const briefingOpen = ref(false)
const briefingPhase = ref<'idle' | 'ticking' | 'landed'>('idle')
const showOldDashboard = ref(false)

const currentKpis = computed(() => KPIS[industry.value][persona.value])
const currentBriefing = computed(() => BRIEFINGS[industry.value][persona.value])
const personaLabel = computed(() => PERSONA_LABELS[industry.value][persona.value])
const personaDef = computed(() => PERSONAS.find((p) => p.key === persona.value)!)
const openKpi = computed(
  () => currentKpis.value.find((k) => k.id === openKpiId.value) ?? null,
)

function setIndustry(i: IndustryKey) {
  industry.value = i
  openKpiId.value = null
  resetBriefing()
}

function setPersona(p: PersonaKey) {
  persona.value = p
  openKpiId.value = null
  resetBriefing()
}

function toggleKpi(id: string) {
  openKpiId.value = openKpiId.value === id ? null : id
}

function resetBriefing() {
  briefingOpen.value = false
  briefingPhase.value = 'idle'
}

let briefingTimer: number | null = null
function runBriefing() {
  if (briefingTimer) window.clearTimeout(briefingTimer)
  briefingOpen.value = true
  briefingPhase.value = 'ticking'
  briefingTimer = window.setTimeout(() => {
    briefingPhase.value = 'landed'
  }, 1200)
}

function closeBriefing() {
  if (briefingTimer) window.clearTimeout(briefingTimer)
  briefingOpen.value = false
  briefingPhase.value = 'idle'
}

// Tiny sparkline points (64×24 viewBox)
function sparkPoints(values: number[]): string {
  if (values.length === 0) return ''
  const w = 64
  const h = 24
  const pad = 2
  const innerW = w - pad * 2
  const innerH = h - pad * 2
  return values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * innerW
      const y = pad + (1 - Math.max(0, Math.min(1, v))) * innerH
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

// The chaotic "old dashboard" — 47 deliberately-tiny labelled tiles.
// Stable across renders (no random reseeding on toggle).
const OLD_WIDGETS: string[] = [
  'Vehicles dispatched (hour)',
  'Vehicles dispatched (day)',
  'Vehicles dispatched (week)',
  'Drivers on duty',
  'Drivers off duty',
  'Drivers on leave',
  'Drivers in training',
  'Routes assigned',
  'Routes started',
  'Routes completed',
  'Routes overdue',
  'Drops planned',
  'Drops attempted',
  'Drops successful',
  'Drops failed',
  'Returns inbound',
  'Returns processed',
  'Fuel cost (day)',
  'Fuel cost (week)',
  'Fuel cost (month)',
  'Fuel cost (YTD)',
  'Maintenance open',
  'Maintenance closed',
  'Workshop bays in use',
  'Workshop bays free',
  'Parts on hand',
  'Parts on order',
  'Tyres replaced (week)',
  'Insurance claims open',
  'Insurance claims closed',
  'Compliance flags',
  'Licensing expiries (30d)',
  'Licensing expiries (90d)',
  'Yard bays in use',
  'Yard bays free',
  'Gate scans (in)',
  'Gate scans (out)',
  'Average dwell (yard)',
  'Average dwell (customer)',
  'Customer complaints',
  'Customer compliments',
  'Customer queries open',
  'POD scans pending',
  'POD scans matched',
  'POD exceptions',
  'Invoices issued',
  'Invoices outstanding',
]

</script>

<template>
  <div class="text-ink">
    <!-- Header bar: title + industry segment + old-dashboard toggle -->
    <header class="border-b border-line p-5 md:p-6 lg:p-7 bg-surface-alt/40">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Live demo
          </div>
          <h3 class="mt-2 font-display text-[22px] md:text-[26px] leading-[1.15] text-ink">
            One platform, four lenses.
          </h3>
          <p class="mt-1 text-[14px] md:text-[14.5px] leading-[1.55] text-mute max-w-xl">
            Pick a business type, pick who's looking. The dashboard reshapes around the decisions that person actually makes.
          </p>
        </div>

        <div class="flex flex-col items-stretch sm:items-end gap-2">
          <div
            role="tablist"
            aria-label="Business type"
            class="inline-flex rounded-xl border border-line bg-white p-1 self-start sm:self-end"
          >
            <button
              v-for="i in INDUSTRIES"
              :key="i.key"
              role="tab"
              :aria-selected="industry === i.key"
              :class="[
                'px-3.5 py-2 text-[13px] font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                industry === i.key
                  ? 'bg-ink text-white'
                  : 'text-mute hover:text-ink',
              ]"
              @click="setIndustry(i.key)"
            >
              {{ i.label }}
            </button>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 self-start sm:self-end text-[12.5px] text-mute hover:text-ink transition-colors px-2 py-1 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 rounded"
            :aria-pressed="showOldDashboard"
            @click="showOldDashboard = !showOldDashboard"
          >
            <component :is="showOldDashboard ? Eye : EyeOff" :size="14" :stroke-width="2" aria-hidden="true" />
            <span v-if="!showOldDashboard">Show the old 47-widget dashboard</span>
            <span v-else>Hide the old dashboard</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Old dashboard mode -->
    <div v-if="showOldDashboard" class="p-5 md:p-6 lg:p-7">
      <div class="rounded-2xl border border-line bg-surface-alt/60 p-3 md:p-4">
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Legacy operations dashboard · 47 widgets
          </div>
          <div class="text-[11px] text-mute-2 hidden sm:block">
            Last opened: 11 days ago
          </div>
        </div>
        <div
          class="grid gap-1.5"
          style="grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));"
        >
          <div
            v-for="(w, idx) in OLD_WIDGETS"
            :key="w"
            class="rounded-md border border-line bg-white px-2 py-2 text-[10.5px] leading-[1.25] text-mute-2 truncate"
            :title="w"
          >
            <div class="text-[9.5px] uppercase tracking-[0.1em] text-mute-2/80 truncate">
              {{ w }}
            </div>
            <div class="mt-0.5 font-display text-[14px] text-ink/70">
              {{ (((idx * 13) % 97) + 3) }}{{ idx % 3 === 0 ? 'k' : (idx % 4 === 0 ? '%' : '') }}
            </div>
          </div>
        </div>
        <p class="mt-4 text-[12.5px] text-mute px-1 max-w-2xl">
          Built once, by committee. Every team asked for "their" tile and nobody removed anything.
          When the operator opens it, the eye doesn't know where to start — so it doesn't.
        </p>
      </div>
    </div>

    <!-- Role-built dashboard -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-0">
      <!-- Persona sidebar -->
      <aside class="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-line bg-surface-alt/30 p-5 md:p-6">
        <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
          Who's looking
        </div>

        <!-- Mobile/tablet: horizontal pill row -->
        <div class="mt-3 lg:hidden -mx-1 overflow-x-auto">
          <div class="flex gap-2 px-1 pb-2">
            <button
              v-for="p in PERSONAS"
              :key="p.key"
              :class="[
                'shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                persona === p.key
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-ink border-line hover:border-cyan-brand/40',
              ]"
              @click="setPersona(p.key)"
            >
              <component :is="p.icon" :size="14" :stroke-width="2" aria-hidden="true" />
              {{ PERSONA_LABELS[industry][p.key] }}
            </button>
          </div>
        </div>

        <!-- Desktop: vertical list -->
        <ul class="mt-3 hidden lg:flex flex-col gap-1" role="tablist" aria-label="Persona">
          <li v-for="p in PERSONAS" :key="p.key">
            <button
              role="tab"
              :aria-selected="persona === p.key"
              :class="[
                'group w-full text-left rounded-xl border px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                persona === p.key
                  ? 'bg-white border-cyan-brand/40 ring-1 ring-cyan-brand/20'
                  : 'bg-white border-line hover:border-cyan-brand/30',
              ]"
              @click="setPersona(p.key)"
            >
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'inline-flex items-center justify-center h-7 w-7 rounded-lg ring-1',
                    persona === p.key
                      ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                      : 'bg-surface-alt text-mute-2 ring-line',
                  ]"
                  aria-hidden="true"
                >
                  <component :is="p.icon" :size="14" :stroke-width="2" />
                </span>
                <span class="font-semibold text-[13.5px] text-ink">
                  {{ PERSONA_LABELS[industry][p.key] }}
                </span>
              </div>
              <div class="mt-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-mute-2 font-semibold">
                <Clock :size="11" :stroke-width="2" aria-hidden="true" />
                {{ p.horizon }}
              </div>
              <p class="mt-1 text-[12px] leading-[1.4] text-mute">
                {{ p.primesFor }}
              </p>
            </button>
          </li>
        </ul>

        <!-- Today's decisions -->
        <div class="mt-6 hidden lg:block">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Decisions today
          </div>
          <ol class="mt-3 space-y-2.5">
            <li
              v-for="(d, idx) in currentBriefing.decisions"
              :key="idx"
              class="flex gap-2 text-[12.5px] leading-[1.45] text-ink"
            >
              <span
                class="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-cyan-brand/10 text-cyan-brand-deep text-[10.5px] font-semibold ring-1 ring-cyan-brand/25"
                aria-hidden="true"
              >{{ idx + 1 }}</span>
              <span>{{ d }}</span>
            </li>
          </ol>
        </div>
      </aside>

      <!-- KPI panel -->
      <section class="lg:col-span-9 p-5 md:p-6 lg:p-7">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4 md:mb-5">
          <div>
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              {{ personaLabel }} · {{ personaDef.horizon }}
            </div>
            <h4 class="mt-1 font-display text-[20px] sm:text-[24px] md:text-[28px] leading-[1.15] md:leading-[1.12] text-ink">
              {{ personaDef.primesFor }}.
            </h4>
          </div>
          <p class="text-[12.5px] text-mute max-w-xs">
            Tap any number to see the calculation, the systems it pulled from, the decision it informs, and the action it suggests.
          </p>
        </div>

        <ul
          class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3 md:gap-4"
          aria-label="Key metrics"
        >
          <li v-for="k in currentKpis" :key="k.id">
            <button
              type="button"
              :class="[
                'w-full text-left rounded-2xl border bg-white p-4 md:p-5 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
                openKpiId === k.id
                  ? 'border-cyan-brand/50 ring-1 ring-cyan-brand/20 -translate-y-px'
                  : 'border-line hover:border-cyan-brand/30 hover:-translate-y-px hover:shadow-[0_18px_44px_-30px_rgba(15,23,42,0.22)]',
              ]"
              :aria-expanded="openKpiId === k.id"
              :aria-controls="`drill-${k.id}`"
              @click="toggleKpi(k.id)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-[10.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                    {{ k.horizon }}
                  </div>
                  <div class="mt-1 font-display text-[26px] sm:text-[30px] md:text-[34px] leading-[1.05] text-ink tracking-tight break-words">
                    {{ k.value }}
                  </div>
                  <div class="mt-1 text-[13.5px] font-semibold text-ink">
                    {{ k.label }}
                  </div>
                </div>
                <svg
                  class="shrink-0 mt-1.5"
                  width="64"
                  height="24"
                  viewBox="0 0 64 24"
                  aria-hidden="true"
                >
                  <polyline
                    :points="sparkPoints(k.spark)"
                    fill="none"
                    :stroke="k.delta.good ? '#00B8CC' : '#94A3B8'"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div
                  :class="[
                    'inline-flex items-center gap-1 text-[12px] font-semibold rounded-full px-2 py-1',
                    k.delta.good
                      ? 'bg-cyan-brand/10 text-cyan-brand-deep'
                      : k.delta.dir === 'flat'
                      ? 'bg-surface-alt text-mute-2'
                      : 'bg-red-50 text-red-600',
                  ]"
                >
                  <component
                    :is="k.delta.dir === 'up' ? TrendingUp : k.delta.dir === 'down' ? TrendingDown : Minus"
                    :size="12"
                    :stroke-width="2.2"
                    aria-hidden="true"
                  />
                  {{ k.delta.text }}
                </div>
                <span
                  :class="[
                    'inline-flex items-center gap-1 text-[12px] font-semibold transition-colors',
                    openKpiId === k.id ? 'text-cyan-brand-deep' : 'text-mute',
                  ]"
                >
                  {{ openKpiId === k.id ? 'Hide details' : 'See details' }}
                  <ChevronRight
                    :size="13"
                    :stroke-width="2.2"
                    :class="['transition-transform', openKpiId === k.id ? 'rotate-90' : '']"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </button>

            <!-- Drill-down -->
            <div
              v-if="openKpiId === k.id"
              :id="`drill-${k.id}`"
              class="mt-2 rounded-2xl border border-cyan-brand/30 bg-cyan-brand/[0.04] p-4 md:p-5"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                    <Calculator :size="12" :stroke-width="2" aria-hidden="true" />
                    Calculation
                  </div>
                  <p class="mt-1.5 text-[13px] leading-[1.55] text-ink">{{ k.calc }}</p>
                </div>
                <div>
                  <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                    <Database :size="12" :stroke-width="2" aria-hidden="true" />
                    Source systems
                  </div>
                  <ul class="mt-1.5 flex flex-wrap gap-1.5">
                    <li
                      v-for="src in k.sources"
                      :key="src"
                      class="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[12px] text-ink"
                    >
                      <Hash :size="11" :stroke-width="2" class="text-mute-2" aria-hidden="true" />
                      {{ src }}
                    </li>
                  </ul>
                </div>
                <div>
                  <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                    <GitBranch :size="12" :stroke-width="2" aria-hidden="true" />
                    Decision it informs
                  </div>
                  <p class="mt-1.5 text-[13px] leading-[1.55] text-ink">{{ k.decision }}</p>
                </div>
                <div>
                  <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                    <ArrowRight :size="12" :stroke-width="2" aria-hidden="true" />
                    Suggested action
                  </div>
                  <p class="mt-1.5 text-[13px] leading-[1.55] text-ink">{{ k.action }}</p>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- Mobile: decisions list (lg version is in the sidebar) -->
        <div class="lg:hidden mt-6 rounded-2xl border border-line bg-surface-alt/60 p-4">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Decisions today
          </div>
          <ol class="mt-3 space-y-2.5">
            <li
              v-for="(d, idx) in currentBriefing.decisions"
              :key="idx"
              class="flex gap-2 text-[13px] leading-[1.5] text-ink"
            >
              <span
                class="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-cyan-brand/10 text-cyan-brand-deep text-[10.5px] font-semibold ring-1 ring-cyan-brand/25"
                aria-hidden="true"
              >{{ idx + 1 }}</span>
              <span>{{ d }}</span>
            </li>
          </ol>
        </div>

        <!-- Briefing simulator -->
        <div class="mt-6 md:mt-8 rounded-2xl border border-line bg-white overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 md:p-5 border-b border-line bg-surface-alt/40">
            <div>
              <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
                <Sparkles :size="12" :stroke-width="2" aria-hidden="true" />
                Daily briefing
              </div>
              <p class="mt-1 text-[13.5px] leading-[1.5] text-mute max-w-md">
                Every morning at 06:00, the briefing lands in the channel before the operator does.
              </p>
            </div>
            <button
              v-if="!briefingOpen"
              type="button"
              class="self-start sm:self-auto inline-flex items-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[13.5px] font-semibold px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="runBriefing"
            >
              <Clock :size="14" :stroke-width="2" aria-hidden="true" />
              Fast-forward to 06:00
            </button>
            <button
              v-else
              type="button"
              class="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg border border-line bg-white text-ink hover:border-ink/30 text-[12.5px] font-semibold px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="closeBriefing"
            >
              <X :size="13" :stroke-width="2" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div v-if="briefingOpen" class="p-4 md:p-5">
            <!-- Channel header (Slack-ish, not Slack-branded) -->
            <div class="rounded-xl border border-line bg-white overflow-hidden">
              <div class="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-line bg-surface-alt/40">
                <div class="flex items-center gap-2 min-w-0">
                  <Hash :size="14" :stroke-width="2.2" class="text-mute-2" aria-hidden="true" />
                  <span class="font-semibold text-[13px] text-ink truncate">ops-morning</span>
                  <span class="text-[11.5px] text-mute-2 hidden sm:inline">· {{ personaLabel.toLowerCase() }} channel</span>
                </div>
                <span class="text-[11.5px] text-mute-2">{{ briefingPhase === 'ticking' ? '05:59…' : '06:00' }}</span>
              </div>

              <div v-if="briefingPhase === 'ticking'" class="p-5 flex flex-col items-center justify-center gap-2">
                <div class="h-9 w-9 rounded-full border-2 border-cyan-brand/20 border-t-cyan-brand-deep animate-spin" aria-hidden="true" />
                <p class="text-[12.5px] text-mute">Pulling overnight events…</p>
              </div>

              <div v-else class="p-4 md:p-5">
                <div class="flex items-start gap-3">
                  <div
                    class="shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-lg bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25 font-semibold text-[13px]"
                    aria-hidden="true"
                  >Db</div>
                  <div class="min-w-0">
                    <div class="flex items-baseline gap-2 flex-wrap">
                      <span class="font-semibold text-[13.5px] text-ink">Decision Brief</span>
                      <span class="text-[11px] uppercase tracking-[0.16em] text-mute-2 font-semibold rounded-full bg-surface-alt px-1.5 py-0.5">App</span>
                      <span class="text-[11.5px] text-mute-2">06:00</span>
                    </div>
                    <p class="mt-1 text-[14px] leading-[1.55] text-ink">
                      Morning. Here's what changed overnight for {{ personaLabel.toLowerCase() }} ({{ INDUSTRIES.find(i => i.key === industry)!.label.toLowerCase() }}).
                    </p>

                    <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <section class="rounded-xl border border-line p-3 bg-surface-alt/40">
                        <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                          <AlertTriangle :size="12" :stroke-width="2" aria-hidden="true" />
                          Yesterday · anomalies
                        </div>
                        <ul class="mt-2 space-y-1.5 text-[13px] leading-[1.5] text-ink">
                          <li v-for="(a, i) in currentBriefing.anomalies" :key="i" class="flex gap-1.5">
                            <span class="text-mute-2 select-none">•</span>
                            <span>{{ a }}</span>
                          </li>
                        </ul>
                      </section>

                      <section class="rounded-xl border border-line p-3 bg-surface-alt/40">
                        <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                          <Clock :size="12" :stroke-width="2" aria-hidden="true" />
                          Today · risks
                        </div>
                        <ul class="mt-2 space-y-1.5 text-[13px] leading-[1.5] text-ink">
                          <li v-for="(r, i) in currentBriefing.risks" :key="i" class="flex gap-1.5">
                            <span class="text-mute-2 select-none">•</span>
                            <span>{{ r }}</span>
                          </li>
                        </ul>
                      </section>
                    </div>

                    <section class="mt-3 rounded-xl border border-cyan-brand/30 bg-cyan-brand/[0.06] p-3">
                      <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                        <GitBranch :size="12" :stroke-width="2" aria-hidden="true" />
                        Three decisions you need to make today
                      </div>
                      <ol class="mt-2 space-y-1.5 text-[13px] leading-[1.5] text-ink">
                        <li v-for="(d, i) in currentBriefing.decisions" :key="i" class="flex gap-2">
                          <span class="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-cyan-brand-deep text-[10.5px] font-semibold ring-1 ring-cyan-brand/30">{{ i + 1 }}</span>
                          <span>{{ d }}</span>
                        </li>
                      </ol>
                    </section>

                    <div class="mt-3 flex items-center gap-2 text-[12px] text-mute-2">
                      <Send :size="12" :stroke-width="2" aria-hidden="true" />
                      Reply to acknowledge each decision; the system files your action against the KPI.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="px-4 md:px-5 pb-4 md:pb-5">
            <div class="rounded-xl border border-dashed border-line bg-surface-alt/40 px-4 py-6 text-center">
              <p class="text-[13px] text-mute max-w-md mx-auto">
                Same briefing every morning. Quiet days produce a quiet message. Loud days lead the channel.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
