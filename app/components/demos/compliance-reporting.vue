<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Activity, BookOpen, ChevronRight, CircleCheck, Database, FileCode, FileSpreadsheet, FileText, HandHeart, HeartHandshake, Landmark, Network, Receipt, RefreshCw, ShieldCheck, TriangleAlert, Undo, UserCheck, Users, X } from '@lucide/vue'

type ReportId = 'banking' | 'ngo' | 'popia' | 'tax'
type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
type SourceId =
  | 'loan-book'
  | 'gl'
  | 'transactions'
  | 'customer-master'
  | 'donor-crm'
  | 'me-database'
type CheckStatus = 'pass' | 'fail'

interface ReportDef {
  id: ReportId
  label: string
  short: string
  body: string
  icon: typeof Landmark
  format: 'XBRL' | 'PDF' | 'Spreadsheet'
  formatIcon: typeof FileCode
  sources: SourceId[]
}

interface SourceDef {
  id: SourceId
  label: string
  desc: string
  icon: typeof Database
}

interface Validation {
  id: string
  kind: 'Completeness' | 'Consistency' | 'Threshold' | 'Reporting'
  label: string
  rule: string
  status: CheckStatus
  detail?: string
}

interface ExceptionItem {
  id: string
  validationId: string
  title: string
  cause: string
  owner: string
}

interface OutputRow {
  id: string
  label: string
  unit?: string
  lineage: {
    source: SourceId
    rows: string
    rule: string
    calc: string
  }
}

interface QuarterPack {
  validations: Validation[]
  exceptions: ExceptionItem[]
  values: Record<string, string>
}

// =============================================================================
// Static reference data
// =============================================================================

const REPORTS: ReportDef[] = [
  {
    id: 'banking',
    label: 'Banking regulatory submission',
    short: 'Banking',
    body: 'BA200 quarterly return · SARB',
    icon: Landmark,
    format: 'XBRL',
    formatIcon: FileCode,
    sources: ['loan-book', 'gl', 'transactions', 'customer-master'],
  },
  {
    id: 'ngo',
    label: 'NGO donor & grant report',
    short: 'NGO',
    body: 'Consolidated donor & outcomes report',
    icon: HandHeart,
    format: 'PDF',
    formatIcon: FileText,
    sources: ['donor-crm', 'me-database', 'gl'],
  },
  {
    id: 'popia',
    label: 'POPIA data-protection report',
    short: 'POPIA',
    body: 'Information Regulator · s.32 submission',
    icon: ShieldCheck,
    format: 'PDF',
    formatIcon: FileText,
    sources: ['customer-master', 'transactions'],
  },
  {
    id: 'tax',
    label: 'Tax submission',
    short: 'Tax',
    body: 'VAT201 + provisional IT corp',
    icon: Receipt,
    format: 'Spreadsheet',
    formatIcon: FileSpreadsheet,
    sources: ['gl', 'transactions', 'loan-book'],
  },
]

const SOURCES: SourceDef[] = [
  { id: 'loan-book',       label: 'Loan Book',        desc: 'Core banking · 1.2M rows',         icon: BookOpen },
  { id: 'gl',              label: 'General Ledger',   desc: 'NetSuite · 412k entries',          icon: Database },
  { id: 'transactions',    label: 'Transactions',     desc: 'Real-time stream · 8.4M/day',      icon: Activity },
  { id: 'customer-master', label: 'Customer Master',  desc: 'KYC store · 92k subjects',         icon: Users },
  { id: 'donor-crm',       label: 'Donor CRM',        desc: 'Salesforce NPSP · 4.8k records',   icon: HeartHandshake },
  { id: 'me-database',     label: 'M&E Database',     desc: 'Programme outcomes · 28k records', icon: Network },
]

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

const SOURCE_LABEL: Record<SourceId, string> = SOURCES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.label }),
  {} as Record<SourceId, string>,
)

// Output row definitions. Lineage is static; values are per-quarter (see DATA).
const OUTPUT_ROWS: Record<ReportId, OutputRow[]> = {
  banking: [
    {
      id: 'car',
      label: 'Capital adequacy ratio',
      lineage: {
        source: 'gl',
        rows: 'Σ Tier 1 + Tier 2 capital ÷ Risk-weighted assets',
        rule: 'BA200 §3.4 · Basel III CAR',
        calc: '(Tier 1 + Tier 2) / RWA · regulatory floor 8%',
      },
    },
    {
      id: 'tier1',
      label: 'Tier 1 capital',
      lineage: {
        source: 'gl',
        rows: 'GL accounts 3000–3199 (equity + reserves)',
        rule: 'SARB Directive D7/2024 · Tier 1 composition',
        calc: 'Paid-up shares + retained earnings + audited reserves − deductions',
      },
    },
    {
      id: 'rwa',
      label: 'Risk-weighted assets',
      lineage: {
        source: 'loan-book',
        rows: '1,184,302 active exposures · risk-bucketed',
        rule: 'BA200 §4.2 · standardised approach',
        calc: 'Σ (exposure × risk weight) over loan book + off-balance positions',
      },
    },
    {
      id: 'lcr',
      label: 'Liquidity coverage ratio',
      lineage: {
        source: 'transactions',
        rows: '30-day stressed outflow projection',
        rule: 'Basel III §LCR · regulatory floor 100%',
        calc: 'HQLA stock ÷ 30-day net cash outflow',
      },
    },
    {
      id: 'npl',
      label: 'Non-performing loans',
      lineage: {
        source: 'loan-book',
        rows: '90+ DPD exposures ÷ gross loan book',
        rule: 'BA200 §5.1 · IFRS 9 stage 3',
        calc: 'Σ stage-3 exposures ÷ gross advances',
      },
    },
  ],
  ngo: [
    {
      id: 'donor-income',
      label: 'Donor income recognised',
      lineage: {
        source: 'donor-crm',
        rows: '4,821 donor commitments · 1,407 disbursed this quarter',
        rule: 'IFRS for SMEs · grant recognition criteria',
        calc: 'Σ disbursed donations where conditions are met',
      },
    },
    {
      id: 'restricted',
      label: 'Restricted funds spent',
      lineage: {
        source: 'gl',
        rows: 'GL cost centres tagged restricted-grant',
        rule: 'Donor MOU §4.2 · restricted use',
        calc: 'Σ expense lines tagged to restricted grant agreements',
      },
    },
    {
      id: 'beneficiaries',
      label: 'Direct beneficiaries reached',
      lineage: {
        source: 'me-database',
        rows: 'Outcome records with verified beneficiary ID',
        rule: 'M&E framework v3 · primary outcome metric',
        calc: 'Count of unique verified beneficiary IDs in quarter',
      },
    },
    {
      id: 'cost-per',
      label: 'Cost per beneficiary',
      lineage: {
        source: 'gl',
        rows: 'Programme expense ÷ verified beneficiaries',
        rule: 'M&E framework v3 · efficiency metric',
        calc: 'Σ programme expense ÷ unique verified beneficiaries',
      },
    },
    {
      id: 'admin-ratio',
      label: 'Admin & overhead ratio',
      lineage: {
        source: 'gl',
        rows: 'Cost centres tagged admin / total expense',
        rule: 'Donor MOU §6.1 · overhead ceiling 15%',
        calc: 'Σ admin expense ÷ total expense · donor ceiling 15%',
      },
    },
  ],
  popia: [
    {
      id: 'subjects',
      label: 'Data subjects on file',
      lineage: {
        source: 'customer-master',
        rows: '92,418 unique data subjects',
        rule: 'POPIA s.14 · retention disclosure',
        calc: 'Count of active records in customer master at quarter close',
      },
    },
    {
      id: 'lawful-basis',
      label: 'Records with lawful basis',
      lineage: {
        source: 'customer-master',
        rows: 'Lawful-basis field populated · POPIA s.11 enum',
        rule: 'POPIA s.11 · lawful processing',
        calc: 'Count of records with valid s.11 basis ÷ total records',
      },
    },
    {
      id: 'consent',
      label: 'Active marketing consents',
      lineage: {
        source: 'customer-master',
        rows: 'Consent log · opt-in records still active',
        rule: 'POPIA s.69 · direct marketing',
        calc: 'Count where consent state = active and not expired',
      },
    },
    {
      id: 'cross-border',
      label: 'Cross-border transfers logged',
      lineage: {
        source: 'transactions',
        rows: 'Outbound flows tagged with foreign processor',
        rule: 'POPIA s.72 · trans-border data flows',
        calc: 'Count of logged transfers · adequacy + safeguards recorded',
      },
    },
    {
      id: 'subject-requests',
      label: 'Subject access requests',
      lineage: {
        source: 'customer-master',
        rows: 'PAIA + POPIA s.23 requests received this quarter',
        rule: 'POPIA s.23 · access to personal information',
        calc: 'Count of requests received · response within 30 days',
      },
    },
  ],
  tax: [
    {
      id: 'vat-output',
      label: 'Output VAT (Line 1A + 1B)',
      lineage: {
        source: 'transactions',
        rows: 'Sales invoices · standard + zero-rated',
        rule: 'VAT Act s.7 · VAT201 schema',
        calc: 'Σ output VAT on taxable supplies in the period',
      },
    },
    {
      id: 'vat-input',
      label: 'Input VAT (Line 14)',
      lineage: {
        source: 'gl',
        rows: 'Purchase invoices · GL VAT input account 2401',
        rule: 'VAT Act s.16 · deductions',
        calc: 'Σ input VAT claimable on capital + operating purchases',
      },
    },
    {
      id: 'vat-net',
      label: 'Net VAT payable',
      lineage: {
        source: 'gl',
        rows: 'Output VAT − Input VAT',
        rule: 'VAT201 Box 20',
        calc: 'Output VAT − Input VAT · payable to / refundable from SARS',
      },
    },
    {
      id: 'ringfenced',
      label: 'Ring-fenced interest expense',
      lineage: {
        source: 'loan-book',
        rows: 'Inter-company funding lines · ITA s.23M',
        rule: 'ITA s.23M · interest deduction limitation',
        calc: 'Interest expense ÷ adjusted taxable income · limited to 30%',
      },
    },
    {
      id: 'prov-tax',
      label: 'Provisional tax · IRP6',
      lineage: {
        source: 'gl',
        rows: 'Forecast taxable income × 27% · current period',
        rule: 'ITA s.89bis · provisional tax',
        calc: 'Estimated taxable income × statutory rate − rebates',
      },
    },
  ],
}

// Per (report, quarter) dataset: validations + exceptions + figure values.
const DATA: Record<ReportId, Record<Quarter, QuarterPack>> = {
  banking: {
    Q1: {
      values: { car: '14.2%', tier1: 'R 2.84B', rwa: 'R 20.00B', lcr: '96.4%', npl: '3.1%' },
      validations: [
        { id: 'b-comp',   kind: 'Completeness', label: 'All 137 BA200 line items populated',           rule: 'BA200 §schedule-1',         status: 'pass' },
        { id: 'b-cons',   kind: 'Consistency',  label: 'Tier 1 capital = paid-up + reserves + R/E',    rule: 'SARB Directive D7/2024',    status: 'pass' },
        { id: 'b-car',    kind: 'Threshold',    label: 'Capital adequacy ratio ≥ 8.0%',                rule: 'Basel III §CAR',            status: 'pass' },
        { id: 'b-lcr',    kind: 'Threshold',    label: 'Liquidity coverage ratio ≥ 100%',              rule: 'Basel III §LCR',            status: 'fail', detail: 'Observed 96.4% · below regulatory floor' },
      ],
      exceptions: [
        {
          id: 'e-b-q1-lcr',
          validationId: 'b-lcr',
          title: 'LCR below regulatory floor',
          cause: '30-day stressed outflow modelled R 142M higher than HQLA stock at quarter close.',
          owner: 'Treasury — N. Mokoena',
        },
      ],
    },
    Q2: {
      values: { car: '13.9%', tier1: 'R 2.91B', rwa: 'R 20.93B', lcr: '122%', npl: '3.4%' },
      validations: [
        { id: 'b-comp', kind: 'Completeness', label: 'All 137 BA200 line items populated',         rule: 'BA200 §schedule-1',      status: 'pass' },
        { id: 'b-cons', kind: 'Consistency',  label: 'Tier 1 capital = paid-up + reserves + R/E',  rule: 'SARB Directive D7/2024', status: 'pass' },
        { id: 'b-car',  kind: 'Threshold',    label: 'Capital adequacy ratio ≥ 8.0%',              rule: 'Basel III §CAR',         status: 'pass' },
        { id: 'b-lcr',  kind: 'Threshold',    label: 'Liquidity coverage ratio ≥ 100%',            rule: 'Basel III §LCR',         status: 'pass' },
      ],
      exceptions: [],
    },
    Q3: {
      values: { car: '14.6%', tier1: 'R 3.02B', rwa: 'R 20.69B', lcr: '115%', npl: '2.9%' },
      validations: [
        { id: 'b-comp', kind: 'Completeness', label: 'All 137 BA200 line items populated',          rule: 'BA200 §schedule-1',      status: 'pass' },
        { id: 'b-cons', kind: 'Consistency',  label: 'Tier 1 capital = paid-up + reserves + R/E',   rule: 'SARB Directive D7/2024', status: 'pass' },
        { id: 'b-car',  kind: 'Threshold',    label: 'Capital adequacy ratio ≥ 8.0%',               rule: 'Basel III §CAR',         status: 'pass' },
        { id: 'b-lcr',  kind: 'Threshold',    label: 'Liquidity coverage ratio ≥ 100%',             rule: 'Basel III §LCR',         status: 'pass' },
      ],
      exceptions: [],
    },
    Q4: {
      values: { car: '15.1%', tier1: 'R 3.18B', rwa: 'R 21.06B', lcr: '124%', npl: '2.7%' },
      validations: [
        { id: 'b-comp', kind: 'Completeness', label: 'All 137 BA200 line items populated',         rule: 'BA200 §schedule-1',      status: 'pass' },
        { id: 'b-cons', kind: 'Consistency',  label: 'Tier 1 capital = paid-up + reserves + R/E',  rule: 'SARB Directive D7/2024', status: 'pass' },
        { id: 'b-car',  kind: 'Threshold',    label: 'Capital adequacy ratio ≥ 8.0%',              rule: 'Basel III §CAR',         status: 'pass' },
        { id: 'b-lcr',  kind: 'Threshold',    label: 'Liquidity coverage ratio ≥ 100%',            rule: 'Basel III §LCR',         status: 'pass' },
      ],
      exceptions: [],
    },
  },
  ngo: {
    Q1: {
      values: { 'donor-income': 'R 18.4M', restricted: 'R 11.2M', beneficiaries: '14,820', 'cost-per': 'R 758', 'admin-ratio': '11.8%' },
      validations: [
        { id: 'n-comp', kind: 'Completeness', label: 'Every disbursement linked to outcome metric',  rule: 'Donor MOU §4.2',         status: 'fail', detail: '3 grants disbursed with no M&E linkage' },
        { id: 'n-cons', kind: 'Consistency',  label: 'Donor income (CRM) = recognised income (GL)',  rule: 'IFRS for SMEs s.24',     status: 'pass' },
        { id: 'n-thr',  kind: 'Threshold',    label: 'Admin & overhead ratio ≤ 15%',                 rule: 'Donor MOU §6.1',         status: 'pass' },
        { id: 'n-rep',  kind: 'Reporting',    label: 'Outcome targets met for all KPIs',             rule: 'M&E framework v3',       status: 'pass' },
      ],
      exceptions: [
        {
          id: 'e-n-q1',
          validationId: 'n-comp',
          title: 'Three grants missing M&E linkage',
          cause: 'GR-2241, GR-2287, GR-2299 disbursed before outcome metric was wired in the M&E DB.',
          owner: 'Programmes — K. Adebayo',
        },
      ],
    },
    Q2: {
      values: { 'donor-income': 'R 21.7M', restricted: 'R 13.9M', beneficiaries: '17,406', 'cost-per': 'R 712', 'admin-ratio': '12.1%' },
      validations: [
        { id: 'n-comp', kind: 'Completeness', label: 'Every disbursement linked to outcome metric',  rule: 'Donor MOU §4.2',         status: 'pass' },
        { id: 'n-cons', kind: 'Consistency',  label: 'Donor income (CRM) = recognised income (GL)',  rule: 'IFRS for SMEs s.24',     status: 'pass' },
        { id: 'n-thr',  kind: 'Threshold',    label: 'Admin & overhead ratio ≤ 15%',                 rule: 'Donor MOU §6.1',         status: 'pass' },
        { id: 'n-rep',  kind: 'Reporting',    label: 'Outcome targets met for all KPIs',             rule: 'M&E framework v3',       status: 'pass' },
      ],
      exceptions: [],
    },
    Q3: {
      values: { 'donor-income': 'R 19.1M', restricted: 'R 12.4M', beneficiaries: '16,205', 'cost-per': 'R 765', 'admin-ratio': '15.4%' },
      validations: [
        { id: 'n-comp', kind: 'Completeness', label: 'Every disbursement linked to outcome metric',  rule: 'Donor MOU §4.2',         status: 'pass' },
        { id: 'n-cons', kind: 'Consistency',  label: 'Donor income (CRM) = recognised income (GL)',  rule: 'IFRS for SMEs s.24',     status: 'pass' },
        { id: 'n-thr',  kind: 'Threshold',    label: 'Admin & overhead ratio ≤ 15%',                 rule: 'Donor MOU §6.1',         status: 'fail', detail: 'Observed 15.4% · ceiling 15%' },
        { id: 'n-rep',  kind: 'Reporting',    label: 'Outcome targets met for all KPIs',             rule: 'M&E framework v3',       status: 'pass' },
      ],
      exceptions: [
        {
          id: 'e-n-q3',
          validationId: 'n-thr',
          title: 'Admin ratio breaches donor ceiling',
          cause: 'New finance lead onboarding cost (R 312k) classed admin — re-tag to programme set-up?',
          owner: 'Finance — D. Pillay',
        },
      ],
    },
    Q4: {
      values: { 'donor-income': 'R 24.5M', restricted: 'R 16.0M', beneficiaries: '19,118', 'cost-per': 'R 691', 'admin-ratio': '12.7%' },
      validations: [
        { id: 'n-comp', kind: 'Completeness', label: 'Every disbursement linked to outcome metric',  rule: 'Donor MOU §4.2',         status: 'pass' },
        { id: 'n-cons', kind: 'Consistency',  label: 'Donor income (CRM) = recognised income (GL)',  rule: 'IFRS for SMEs s.24',     status: 'pass' },
        { id: 'n-thr',  kind: 'Threshold',    label: 'Admin & overhead ratio ≤ 15%',                 rule: 'Donor MOU §6.1',         status: 'pass' },
        { id: 'n-rep',  kind: 'Reporting',    label: 'Outcome targets met for all KPIs',             rule: 'M&E framework v3',       status: 'pass' },
      ],
      exceptions: [],
    },
  },
  popia: {
    Q1: {
      values: { subjects: '92,418', 'lawful-basis': '99.84%', consent: '41,207', 'cross-border': '184', 'subject-requests': '17' },
      validations: [
        { id: 'p-comp', kind: 'Completeness', label: 'Lawful basis recorded for every data subject', rule: 'POPIA s.11',  status: 'fail', detail: '148 records · lawful basis = null' },
        { id: 'p-cons', kind: 'Consistency',  label: 'Consent log matches marketing comms sent',     rule: 'POPIA s.69',  status: 'pass' },
        { id: 'p-thr',  kind: 'Threshold',    label: 'Sensitive data access reviewed quarterly',     rule: 'POPIA s.26',  status: 'pass' },
        { id: 'p-rep',  kind: 'Reporting',    label: 'Cross-border transfers logged with safeguards', rule: 'POPIA s.72', status: 'pass' },
      ],
      exceptions: [
        {
          id: 'e-p-q1',
          validationId: 'p-comp',
          title: '148 data subjects missing lawful basis',
          cause: 'Pre-2021 imports from legacy CRM never had the s.11 field populated.',
          owner: 'Info Officer — L. Khumalo',
        },
      ],
    },
    Q2: {
      values: { subjects: '93,104', 'lawful-basis': '100.00%', consent: '40,418', 'cross-border': '209', 'subject-requests': '23' },
      validations: [
        { id: 'p-comp', kind: 'Completeness', label: 'Lawful basis recorded for every data subject', rule: 'POPIA s.11',  status: 'pass' },
        { id: 'p-cons', kind: 'Consistency',  label: 'Consent log matches marketing comms sent',     rule: 'POPIA s.69',  status: 'pass' },
        { id: 'p-thr',  kind: 'Threshold',    label: 'Sensitive data access reviewed quarterly',     rule: 'POPIA s.26',  status: 'pass' },
        { id: 'p-rep',  kind: 'Reporting',    label: 'Cross-border transfers logged with safeguards', rule: 'POPIA s.72', status: 'pass' },
      ],
      exceptions: [],
    },
    Q3: {
      values: { subjects: '94,201', 'lawful-basis': '100.00%', consent: '39,886', 'cross-border': '231', 'subject-requests': '31' },
      validations: [
        { id: 'p-comp', kind: 'Completeness', label: 'Lawful basis recorded for every data subject', rule: 'POPIA s.11',  status: 'pass' },
        { id: 'p-cons', kind: 'Consistency',  label: 'Consent log matches marketing comms sent',     rule: 'POPIA s.69',  status: 'fail', detail: '14 comms sent to subjects whose consent had lapsed' },
        { id: 'p-thr',  kind: 'Threshold',    label: 'Sensitive data access reviewed quarterly',     rule: 'POPIA s.26',  status: 'pass' },
        { id: 'p-rep',  kind: 'Reporting',    label: 'Cross-border transfers logged with safeguards', rule: 'POPIA s.72', status: 'pass' },
      ],
      exceptions: [
        {
          id: 'e-p-q3',
          validationId: 'p-cons',
          title: 'Marketing comms sent past consent expiry',
          cause: '14 records · consent expired between send-time and the daily sync.',
          owner: 'Marketing Ops — T. Sithole',
        },
      ],
    },
    Q4: {
      values: { subjects: '95,612', 'lawful-basis': '100.00%', consent: '42,114', 'cross-border': '247', 'subject-requests': '28' },
      validations: [
        { id: 'p-comp', kind: 'Completeness', label: 'Lawful basis recorded for every data subject', rule: 'POPIA s.11',  status: 'pass' },
        { id: 'p-cons', kind: 'Consistency',  label: 'Consent log matches marketing comms sent',     rule: 'POPIA s.69',  status: 'pass' },
        { id: 'p-thr',  kind: 'Threshold',    label: 'Sensitive data access reviewed quarterly',     rule: 'POPIA s.26',  status: 'pass' },
        { id: 'p-rep',  kind: 'Reporting',    label: 'Cross-border transfers logged with safeguards', rule: 'POPIA s.72', status: 'pass' },
      ],
      exceptions: [],
    },
  },
  tax: {
    Q1: {
      values: { 'vat-output': 'R 4.81M', 'vat-input': 'R 3.62M', 'vat-net': 'R 1.19M', ringfenced: 'R 0.21M', 'prov-tax': 'R 1.94M' },
      validations: [
        { id: 't-comp', kind: 'Completeness', label: 'Every taxable supply has a VAT class',          rule: 'VAT Act s.7',         status: 'pass' },
        { id: 't-cons', kind: 'Consistency',  label: 'GL VAT control = Σ VAT201 line 1A + 4',         rule: 'VAT201 schema',       status: 'pass' },
        { id: 't-thr',  kind: 'Threshold',    label: 'Zero-rated supplies properly invoiced',         rule: 'VAT Act s.11',        status: 'pass' },
        { id: 't-rep',  kind: 'Reporting',    label: 'Income tax expense reconciles to IRP6',         rule: 'ITA s.89bis',         status: 'pass' },
      ],
      exceptions: [],
    },
    Q2: {
      values: { 'vat-output': 'R 5.12M', 'vat-input': 'R 3.78M', 'vat-net': 'R 1.34M', ringfenced: 'R 0.24M', 'prov-tax': 'R 2.07M' },
      validations: [
        { id: 't-comp', kind: 'Completeness', label: 'Every taxable supply has a VAT class',          rule: 'VAT Act s.7',         status: 'pass' },
        { id: 't-cons', kind: 'Consistency',  label: 'GL VAT control = Σ VAT201 line 1A + 4',         rule: 'VAT201 schema',       status: 'fail', detail: 'Variance R 12,408 · 7 invoices coded to wrong VAT class' },
        { id: 't-thr',  kind: 'Threshold',    label: 'Zero-rated supplies properly invoiced',         rule: 'VAT Act s.11',        status: 'pass' },
        { id: 't-rep',  kind: 'Reporting',    label: 'Income tax expense reconciles to IRP6',         rule: 'ITA s.89bis',         status: 'pass' },
      ],
      exceptions: [
        {
          id: 'e-t-q2',
          validationId: 't-cons',
          title: 'VAT control variance R 12,408',
          cause: '7 supplier invoices coded standard-rate but should be zero-rated (s.11(1)(g) export).',
          owner: 'Tax — M. Ngubane',
        },
      ],
    },
    Q3: {
      values: { 'vat-output': 'R 5.43M', 'vat-input': 'R 4.01M', 'vat-net': 'R 1.42M', ringfenced: 'R 0.27M', 'prov-tax': 'R 2.21M' },
      validations: [
        { id: 't-comp', kind: 'Completeness', label: 'Every taxable supply has a VAT class',          rule: 'VAT Act s.7',         status: 'pass' },
        { id: 't-cons', kind: 'Consistency',  label: 'GL VAT control = Σ VAT201 line 1A + 4',         rule: 'VAT201 schema',       status: 'pass' },
        { id: 't-thr',  kind: 'Threshold',    label: 'Zero-rated supplies properly invoiced',         rule: 'VAT Act s.11',        status: 'pass' },
        { id: 't-rep',  kind: 'Reporting',    label: 'Income tax expense reconciles to IRP6',         rule: 'ITA s.89bis',         status: 'pass' },
      ],
      exceptions: [],
    },
    Q4: {
      values: { 'vat-output': 'R 5.79M', 'vat-input': 'R 4.18M', 'vat-net': 'R 1.61M', ringfenced: 'R 0.29M', 'prov-tax': 'R 2.38M' },
      validations: [
        { id: 't-comp', kind: 'Completeness', label: 'Every taxable supply has a VAT class',          rule: 'VAT Act s.7',         status: 'pass' },
        { id: 't-cons', kind: 'Consistency',  label: 'GL VAT control = Σ VAT201 line 1A + 4',         rule: 'VAT201 schema',       status: 'pass' },
        { id: 't-thr',  kind: 'Threshold',    label: 'Zero-rated supplies properly invoiced',         rule: 'VAT Act s.11',        status: 'pass' },
        { id: 't-rep',  kind: 'Reporting',    label: 'Income tax expense reconciles to IRP6',         rule: 'ITA s.89bis',         status: 'pass' },
      ],
      exceptions: [],
    },
  },
}

// =============================================================================
// State
// =============================================================================

const selectedReportId   = ref<ReportId>('banking')
const selectedQuarter    = ref<Quarter>('Q1')
const selectedFigureId   = ref<string | null>(null)
const dismissedExceptions = ref<Set<string>>(new Set())
const exceptionFeedback  = ref<{ id: string; text: string } | null>(null)
const regenTick          = ref(0)
const isRegenerating     = ref(false)

const activeReport = computed(() =>
  REPORTS.find((r) => r.id === selectedReportId.value)!,
)

const pack = computed<QuarterPack>(
  () => DATA[selectedReportId.value][selectedQuarter.value],
)

const outputRows = computed<OutputRow[]>(
  () => OUTPUT_ROWS[selectedReportId.value],
)

const activeExceptions = computed(() =>
  pack.value.exceptions.filter((e) => !dismissedExceptions.value.has(e.id)),
)

const selectedFigure = computed(() => {
  if (!selectedFigureId.value) return null
  return outputRows.value.find((r) => r.id === selectedFigureId.value) ?? null
})

const passCount = computed(
  () => pack.value.validations.filter((v) => v.status === 'pass').length,
)
const failCount = computed(
  () => pack.value.validations.filter((v) => v.status === 'fail').length,
)

// =============================================================================
// Actions
// =============================================================================

function selectReport(id: ReportId) {
  if (id === selectedReportId.value) return
  selectedReportId.value = id
  selectedFigureId.value = null
  dismissedExceptions.value = new Set()
  exceptionFeedback.value = null
  pulseRegen()
}

function selectQuarter(q: Quarter) {
  if (q === selectedQuarter.value) return
  selectedQuarter.value = q
  selectedFigureId.value = null
  dismissedExceptions.value = new Set()
  exceptionFeedback.value = null
  pulseRegen()
}

function selectFigure(id: string) {
  selectedFigureId.value = selectedFigureId.value === id ? null : id
}

function dismissException(id: string, action: 'resolve' | 'accept' | 'reassign') {
  dismissedExceptions.value = new Set(dismissedExceptions.value).add(id)
  const verb =
    action === 'resolve'  ? 'Resolved · queued for re-submission'
    : action === 'accept' ? 'Accepted with audit note · variance signed off'
    :                       'Reassigned to risk team · audit logged'
  exceptionFeedback.value = { id, text: verb }
}

function pulseRegen() {
  isRegenerating.value = true
  regenTick.value++
  // Visual pulse only — no real async work. Auto-clear in ~700ms.
  window.setTimeout(() => { isRegenerating.value = false }, 700)
}

// Restart the pull animations whenever the report changes by re-mounting the
// flow rails (key on regenTick).
watch(regenTick, () => {})

function sourceFor(id: SourceId): SourceDef {
  return SOURCES.find((s) => s.id === id)!
}

</script>

<template>
  <div class="relative">
    <!-- ===================================================================
         Header — eyebrow, heading, quarter switcher
         =================================================================== -->
    <header class="px-5 md:px-8 lg:px-10 pt-6 md:pt-8 pb-5 border-b border-line">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Compliance & Regulatory Reporting
          </div>
          <h3 class="mt-3 font-display text-[24px] sm:text-[28px] md:text-[32px] leading-[1.1] text-ink">
            One engine. Four submissions. Every figure traceable.
          </h3>
          <p class="mt-2 max-w-2xl text-[14.5px] md:text-[15px] leading-[1.55] text-mute">
            Pick a report. Watch the engine pull from the source systems, validate against the regulator's rule pack, and assemble the submission. Then change the quarter and watch it run again.
          </p>
        </div>

        <!-- Quarter switcher -->
        <div class="flex items-center gap-3">
          <span class="text-[12px] uppercase tracking-[0.18em] font-semibold text-mute-2">Quarter</span>
          <div class="inline-flex items-center rounded-full border border-line bg-surface-alt p-1">
            <button
              v-for="q in QUARTERS"
              :key="q"
              type="button"
              class="px-3 py-1.5 text-[13px] font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              :class="
                selectedQuarter === q
                  ? 'bg-ink text-white'
                  : 'text-mute hover:text-ink'
              "
              @click="selectQuarter(q)"
            >
              {{ q }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- ===================================================================
         Report selector
         =================================================================== -->
    <section
      class="px-5 md:px-8 lg:px-10 py-5 border-b border-line bg-surface-alt/40"
      aria-label="Report selector"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          v-for="r in REPORTS"
          :key="r.id"
          type="button"
          class="group relative text-left rounded-xl border bg-white p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          :class="
            selectedReportId === r.id
              ? 'border-cyan-brand/60 ring-1 ring-cyan-brand/30 shadow-[0_10px_30px_-18px_rgba(1,184,204,0.45)]'
              : 'border-line hover:border-cyan-brand/40 hover:-translate-y-0.5'
          "
          :aria-pressed="selectedReportId === r.id"
          @click="selectReport(r.id)"
        >
          <div class="flex items-center gap-3">
            <span
              class="inline-flex items-center justify-center h-10 w-10 rounded-lg ring-1 transition-colors"
              :class="
                selectedReportId === r.id
                  ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/30'
                  : 'bg-surface-alt text-ink-soft ring-line'
              "
              aria-hidden="true"
            >
              <component :is="r.icon" :size="18" :stroke-width="1.9" />
            </span>
            <div class="min-w-0">
              <div class="font-semibold text-[14.5px] text-ink leading-tight">{{ r.label }}</div>
              <div class="mt-0.5 text-[12.5px] text-mute-2 truncate">{{ r.body }}</div>
            </div>
          </div>
          <div
            v-if="selectedReportId === r.id"
            class="absolute top-3 right-3 inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep"
          >
            <CircleCheck :size="13" :stroke-width="2" /> selected
          </div>
        </button>
      </div>
    </section>

    <!-- ===================================================================
         Three-column workspace: sources · validations · output
         =================================================================== -->
    <section
      class="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-line"
      :class="{ 'opacity-90': isRegenerating }"
    >
      <!-- Sources -->
      <div class="lg:col-span-4 p-5 md:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-line bg-white">
        <div class="flex items-baseline justify-between">
          <h4 class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">Source systems</h4>
          <span class="text-[11px] text-mute-2">{{ activeReport.sources.length }} feeding</span>
        </div>
        <p class="mt-2 text-[13px] text-mute">
          The engine pulls from these systems on schedule. Inactive sources are skipped for this report.
        </p>

        <ul class="mt-4 space-y-2.5">
          <li
            v-for="s in SOURCES"
            :key="s.id"
            class="relative rounded-xl border bg-white px-3 py-2.5 overflow-hidden transition-all duration-300"
            :class="
              activeReport.sources.includes(s.id)
                ? 'border-cyan-brand/50 ring-1 ring-cyan-brand/15 bg-cyan-brand/[0.025]'
                : 'border-line opacity-55'
            "
          >
            <div class="flex items-center gap-3">
              <span
                class="inline-flex items-center justify-center h-9 w-9 rounded-lg ring-1 shrink-0"
                :class="
                  activeReport.sources.includes(s.id)
                    ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                    : 'bg-surface-alt text-mute-2 ring-line'
                "
                aria-hidden="true"
              >
                <component :is="s.icon" :size="17" :stroke-width="1.9" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[13.5px] font-semibold text-ink truncate">{{ s.label }}</span>
                  <span
                    v-if="activeReport.sources.includes(s.id)"
                    class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep"
                  >
                    pulling
                  </span>
                </div>
                <div class="text-[12px] text-mute truncate">{{ s.desc }}</div>
              </div>
            </div>

            <!-- Pull animation rail — only when source is active -->
            <div
              v-if="activeReport.sources.includes(s.id)"
              :key="`${selectedReportId}-${selectedQuarter}-${regenTick}-${s.id}`"
              class="pointer-events-none absolute left-3 right-3 bottom-1 h-px bg-cyan-brand/15"
              aria-hidden="true"
            >
              <span class="pull-dot" />
              <span class="pull-dot pull-dot--lag" />
            </div>
          </li>
        </ul>

        <div class="mt-4 rounded-lg border border-dashed border-line bg-surface-alt/60 px-3 py-2.5 flex items-center gap-2">
          <RefreshCw
            :size="14"
            :stroke-width="2"
            :class="isRegenerating ? 'text-cyan-brand-deep animate-spin-soft' : 'text-mute-2'"
          />
          <span class="text-[12px] text-mute">
            <template v-if="isRegenerating">Re-running against {{ selectedQuarter }} data…</template>
            <template v-else>Last run {{ selectedQuarter }} · 2.3s wall-clock</template>
          </span>
        </div>
      </div>

      <!-- Validations -->
      <div class="lg:col-span-4 p-5 md:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-line bg-white">
        <div class="flex items-baseline justify-between">
          <h4 class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">Validations</h4>
          <span class="text-[11px]">
            <span class="text-cyan-brand-deep font-semibold">{{ passCount }} pass</span>
            <span class="text-mute-2"> · </span>
            <span :class="failCount ? 'text-red-600 font-semibold' : 'text-mute-2'">{{ failCount }} fail</span>
          </span>
        </div>
        <p class="mt-2 text-[13px] text-mute">
          Each rule from the regulator's rule pack runs against the pulled data. Cite, status, evidence — all retained.
        </p>

        <ul class="mt-4 space-y-2.5">
          <li
            v-for="v in pack.validations"
            :key="v.id"
            class="rounded-xl border bg-white px-3 py-3"
            :class="v.status === 'fail' ? 'border-red-100 bg-red-50/40' : 'border-line'"
          >
            <div class="flex items-start gap-3">
              <span
                class="inline-flex items-center justify-center h-7 w-7 rounded-lg shrink-0 mt-0.5 ring-1"
                :class="
                  v.status === 'fail'
                    ? 'bg-red-50 text-red-600 ring-red-100'
                    : 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                "
                aria-hidden="true"
              >
                <TriangleAlert v-if="v.status === 'fail'" :size="14" :stroke-width="2" />
                <CircleCheck v-else :size="14" :stroke-width="2" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                    {{ v.kind }}
                  </span>
                  <span
                    class="text-[10.5px] uppercase tracking-[0.18em] font-semibold"
                    :class="v.status === 'fail' ? 'text-red-600' : 'text-cyan-brand-deep'"
                  >
                    · {{ v.status }}
                  </span>
                </div>
                <div class="mt-1 text-[13.5px] text-ink leading-snug">{{ v.label }}</div>
                <div class="mt-1 flex items-center gap-2 text-[11.5px] text-mute-2">
                  <FileText :size="11" :stroke-width="2" aria-hidden="true" />
                  <span>{{ v.rule }}</span>
                </div>
                <p v-if="v.detail" class="mt-1.5 text-[12.5px] text-red-600">{{ v.detail }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Output preview -->
      <div class="lg:col-span-4 p-5 md:p-6 lg:p-7 bg-surface-alt/30">
        <div class="flex items-baseline justify-between">
          <h4 class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">Output preview</h4>
          <span class="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-ink-soft">
            <component :is="activeReport.formatIcon" :size="12" :stroke-width="2" />
            {{ activeReport.format }}
          </span>
        </div>

        <div
          class="mt-3 rounded-xl border border-line bg-white overflow-hidden transition-opacity duration-300"
          :class="{ 'opacity-60': isRegenerating }"
        >
          <div class="px-4 py-3 border-b border-line flex items-center gap-2">
            <component :is="activeReport.icon" :size="15" :stroke-width="2" class="text-cyan-brand-deep" />
            <div class="min-w-0">
              <div class="text-[13px] font-semibold text-ink truncate">{{ activeReport.label }}</div>
              <div class="text-[11px] text-mute-2 truncate">{{ activeReport.body }} · {{ selectedQuarter }} 2026</div>
            </div>
          </div>

          <ul>
            <li
              v-for="(row, i) in outputRows"
              :key="row.id"
              :class="[
                'group flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
                i !== outputRows.length - 1 ? 'border-b border-line' : '',
                selectedFigureId === row.id
                  ? 'bg-cyan-brand/[0.05]'
                  : 'hover:bg-surface-alt/60',
              ]"
              :aria-pressed="selectedFigureId === row.id"
              tabindex="0"
              role="button"
              @click="selectFigure(row.id)"
              @keydown.enter.prevent="selectFigure(row.id)"
              @keydown.space.prevent="selectFigure(row.id)"
            >
              <span class="flex-1 text-[13px] text-ink truncate">{{ row.label }}</span>
              <span
                class="font-display text-[17px] leading-none text-ink tabular-nums tracking-tight transition-colors"
                :class="selectedFigureId === row.id ? 'text-cyan-brand-deep' : 'group-hover:text-cyan-brand-deep'"
              >
                {{ pack.values[row.id] }}
              </span>
              <ChevronRight
                :size="13"
                :stroke-width="2"
                class="text-mute-2 transition-transform"
                :class="selectedFigureId === row.id ? 'rotate-90 text-cyan-brand-deep' : 'group-hover:translate-x-0.5'"
              />
            </li>
          </ul>
        </div>

        <!-- Lineage panel -->
        <transition name="lineage">
          <div
            v-if="selectedFigure"
            :key="selectedFigure.id"
            class="mt-3 rounded-xl border border-cyan-brand/30 bg-white p-4"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-cyan-brand-deep">
                <UserCheck :size="12" :stroke-width="2" />
                Trace this figure
              </div>
              <button
                type="button"
                class="inline-flex items-center justify-center h-7 w-7 rounded-md text-mute-2 hover:text-ink hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
                aria-label="Close lineage"
                @click="selectedFigureId = null"
              >
                <X :size="13" :stroke-width="2" />
              </button>
            </div>
            <div class="mt-2 text-[13.5px] text-ink font-semibold">
              {{ selectedFigure.label }} · {{ pack.values[selectedFigure.id] }}
            </div>
            <dl class="mt-3 space-y-2 text-[12.5px]">
              <div class="grid grid-cols-[88px_1fr] gap-2">
                <dt class="text-mute-2 uppercase tracking-[0.14em] text-[10.5px] mt-0.5">Source</dt>
                <dd class="text-ink">{{ SOURCE_LABEL[selectedFigure.lineage.source] }}</dd>
              </div>
              <div class="grid grid-cols-[88px_1fr] gap-2">
                <dt class="text-mute-2 uppercase tracking-[0.14em] text-[10.5px] mt-0.5">Rows</dt>
                <dd class="text-ink">{{ selectedFigure.lineage.rows }}</dd>
              </div>
              <div class="grid grid-cols-[88px_1fr] gap-2">
                <dt class="text-mute-2 uppercase tracking-[0.14em] text-[10.5px] mt-0.5">Rule</dt>
                <dd class="text-ink">{{ selectedFigure.lineage.rule }}</dd>
              </div>
              <div class="grid grid-cols-[88px_1fr] gap-2">
                <dt class="text-mute-2 uppercase tracking-[0.14em] text-[10.5px] mt-0.5">Calc</dt>
                <dd class="text-mute">{{ selectedFigure.lineage.calc }}</dd>
              </div>
            </dl>
          </div>
        </transition>

        <p v-if="!selectedFigure" class="mt-3 text-[12px] text-mute-2 leading-snug">
          Click any figure to unroll its lineage — source system, source rows, applicable rule and the exact calculation.
        </p>
      </div>
    </section>

    <!-- ===================================================================
         Exceptions strip
         =================================================================== -->
    <section class="px-5 md:px-8 lg:px-10 py-5 md:py-6 bg-white" aria-label="Exceptions for human review">
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
        <div class="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] uppercase tracking-[0.22em] font-semibold"
          :class="activeExceptions.length ? 'text-red-600' : 'text-cyan-brand-deep'">
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="activeExceptions.length ? 'bg-red-600' : 'bg-cyan-brand'"
            aria-hidden="true"
          />
          Exceptions for human review
          <span class="text-mute-2 font-medium normal-case tracking-normal">
            · {{ activeExceptions.length }} open
          </span>
        </div>
        <button
          v-if="dismissedExceptions.size && pack.exceptions.length"
          type="button"
          class="inline-flex items-center gap-1 text-[12px] text-mute hover:text-ink transition-colors"
          @click="dismissedExceptions = new Set(); exceptionFeedback = null"
        >
          <Undo :size="12" :stroke-width="2" /> Undo dismissals
        </button>
      </div>

      <div v-if="activeExceptions.length" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <article
          v-for="ex in activeExceptions"
          :key="ex.id"
          class="rounded-xl border border-red-100 bg-red-50/40 p-4"
        >
          <div class="flex items-start gap-3">
            <span
              class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100 shrink-0"
              aria-hidden="true"
            >
              <TriangleAlert :size="16" :stroke-width="2" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-[14px] font-semibold text-ink leading-snug">{{ ex.title }}</div>
              <p class="mt-1 text-[12.5px] text-mute leading-snug">{{ ex.cause }}</p>
              <div class="mt-2 text-[11.5px] text-mute-2">Owner · {{ ex.owner }}</div>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-[12.5px] font-semibold px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="dismissException(ex.id, 'resolve')"
            >
              <CircleCheck :size="12" :stroke-width="2.2" /> Resolve
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-surface-alt border border-line text-ink text-[12.5px] font-semibold px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="dismissException(ex.id, 'accept')"
            >
              Accept with note
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-surface-alt border border-line text-ink text-[12.5px] font-semibold px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
              @click="dismissException(ex.id, 'reassign')"
            >
              Reassign
            </button>
          </div>
        </article>
      </div>

      <div
        v-else
        class="mt-4 rounded-xl border border-line bg-surface-alt/50 px-4 py-5 text-center"
      >
        <p class="text-[13.5px] text-ink font-semibold leading-tight">
          No exceptions left for {{ selectedQuarter }}.
        </p>
        <p class="mt-1 text-[12.5px] text-mute">
          <template v-if="pack.exceptions.length && dismissedExceptions.size === pack.exceptions.length">
            All flagged items dismissed — submission cleared for filing.
          </template>
          <template v-else>
            All rules in the {{ activeReport.short }} pack passed against {{ selectedQuarter }} data.
          </template>
        </p>
      </div>

      <p
        v-if="exceptionFeedback"
        class="mt-3 inline-flex items-center gap-2 text-[12.5px] text-cyan-brand-deep"
      >
        <CircleCheck :size="13" :stroke-width="2.2" />
        {{ exceptionFeedback.text }}
      </p>
    </section>
  </div>
</template>

<style scoped>
/* Pull-flow animation: a small dot travels along the source row's rail.
   The rail is `position: absolute` inside the source card and runs across
   the bottom of the card; the dot translates from -8px to 100% along it. */
.pull-dot {
  position: absolute;
  top: -2px;
  left: 0;
  height: 4px;
  width: 14px;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    rgba(1, 219, 241, 0) 0%,
    rgba(1, 219, 241, 0.85) 60%,
    rgba(0, 184, 204, 1) 100%
  );
  box-shadow: 0 0 6px rgba(1, 219, 241, 0.55);
  opacity: 0;
  animation: pull-flow 2.1s cubic-bezier(0.55, 0.08, 0.45, 1) infinite;
}
.pull-dot--lag {
  animation-delay: 1.05s;
  opacity: 0;
}

@keyframes pull-flow {
  0%   { transform: translateX(-8%);  opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translateX(102%); opacity: 0; }
}

@keyframes spin-soft {
  to { transform: rotate(360deg); }
}
.animate-spin-soft {
  animation: spin-soft 1s linear infinite;
}

/* Lineage panel enter/leave */
.lineage-enter-active,
.lineage-leave-active {
  transition:
    opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.lineage-enter-from,
.lineage-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .pull-dot,
  .pull-dot--lag {
    animation: none !important;
    opacity: 0 !important;
  }
  .animate-spin-soft {
    animation: none !important;
  }
  .lineage-enter-active,
  .lineage-leave-active {
    transition: none !important;
  }
}
</style>
