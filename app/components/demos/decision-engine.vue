<script setup lang="ts">
import { ref, computed, shallowRef, watch } from 'vue'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Gauge,
  BarChart3,
  Repeat,
  Layers,
  Play,
  ChevronRight,
  Info,
  ArrowRight,
  RotateCcw,
} from '@lucide/vue'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Decision = 'approve' | 'refer' | 'decline'
type Domain = 'lending' | 'crm' | 'inventory'

interface RuleResult {
  fired: boolean
  close: boolean
  display: string
  contribution: number
}

interface Rule<T> {
  id: string
  label: string
  weight: number
  evaluate: (input: T) => RuleResult
}

interface SelectOption {
  value: string
  label: string
}

interface InputDef<T> {
  key: keyof T & string
  label: string
  type: 'slider' | 'select'
  min?: number
  max?: number
  step?: number
  unit?: string
  prefix?: string
  options?: SelectOption[]
  format?: (v: number) => string
}

interface DecisionLabels {
  label: string
  action: string
  tone: 'good' | 'mid' | 'bad'
}

interface RuleSet<T> {
  id: Domain
  label: string
  short: string
  defaultInput: T
  inputs: InputDef<T>[]
  rules: Rule<T>[]
  decisions: Record<Decision, DecisionLabels>
  rateLabel: string
  rateUnit: string
  scoreLabel: string
  sample: () => T
}

interface Policy {
  id: 'conservative' | 'standard' | 'growth'
  label: string
  approveAt: number
  declineAt: number
  baseRate: number
  perPoint: number
  description: string
}

// ---------------------------------------------------------------------------
// Policies (apply across all three rule packs)
// ---------------------------------------------------------------------------

const POLICIES: Policy[] = [
  {
    id: 'conservative',
    label: 'Conservative',
    approveAt: 18,
    declineAt: 38,
    baseRate: 9.0,
    perPoint: 0.22,
    description:
      'Tight thresholds. Wider refer band. Higher base rate. Optimised for low default rate.',
  },
  {
    id: 'standard',
    label: 'Standard',
    approveAt: 30,
    declineAt: 55,
    baseRate: 6.5,
    perPoint: 0.16,
    description:
      'Balanced thresholds. The current production policy. Most volume routes here.',
  },
  {
    id: 'growth',
    label: 'Growth',
    approveAt: 45,
    declineAt: 72,
    baseRate: 4.5,
    perPoint: 0.11,
    description:
      'Lenient thresholds. Cheaper rate. Used in low-risk segments to win share.',
  },
]

// ---------------------------------------------------------------------------
// LENDING rule pack
// ---------------------------------------------------------------------------

type LendingInput = {
  monthlyIncome: number
  existingDebt: number
  creditScore: number
  employmentStatus: 'full-time' | 'part-time' | 'self-employed' | 'unemployed'
  loanAmount: number
  termMonths: number
  region: 'metro' | 'urban' | 'rural'
  priorDefaults: number
}

const lendingRules: Rule<LendingInput>[] = [
  {
    id: 'dti',
    label: 'Debt-to-income',
    weight: 22,
    evaluate: (i) => {
      const dti = i.existingDebt / Math.max(i.monthlyIncome, 1)
      const fired = dti > 0.45
      const close = !fired && dti > 0.38
      return {
        fired,
        close,
        contribution: fired ? 22 : close ? 6 : 0,
        display: `DTI ${(dti * 100).toFixed(0)}% (limit 45%)`,
      }
    },
  },
  {
    id: 'lti',
    label: 'Loan-to-income',
    weight: 18,
    evaluate: (i) => {
      const annual = i.monthlyIncome * 12
      const lti = i.loanAmount / Math.max(annual, 1)
      const fired = lti > 0.55
      const close = !fired && lti > 0.45
      return {
        fired,
        close,
        contribution: fired ? 18 : close ? 5 : 0,
        display: `Loan/annual income ${(lti * 100).toFixed(0)}% (limit 55%)`,
      }
    },
  },
  {
    id: 'credit',
    label: 'Credit score',
    weight: 28,
    evaluate: (i) => {
      const fired = i.creditScore < 600
      const close = !fired && i.creditScore < 660
      const tier =
        i.creditScore >= 720
          ? 'prime'
          : i.creditScore >= 660
          ? 'near-prime'
          : i.creditScore >= 600
          ? 'sub-prime'
          : 'deep sub-prime'
      return {
        fired,
        close,
        contribution: fired ? 28 : close ? 10 : 0,
        display: `Score ${i.creditScore} · ${tier}`,
      }
    },
  },
  {
    id: 'employment',
    label: 'Employment status',
    weight: 18,
    evaluate: (i) => {
      const status = i.employmentStatus
      const fired = status === 'unemployed'
      const close = status === 'self-employed' || status === 'part-time'
      const display = `Status: ${status.replace('-', ' ')}`
      return {
        fired,
        close,
        contribution: fired ? 18 : close ? 6 : 0,
        display,
      }
    },
  },
  {
    id: 'defaults',
    label: 'Prior defaults',
    weight: 25,
    evaluate: (i) => {
      const fired = i.priorDefaults >= 1
      const close = false
      return {
        fired,
        close,
        contribution: Math.min(25, i.priorDefaults * 12),
        display: `${i.priorDefaults} prior default${i.priorDefaults === 1 ? '' : 's'}`,
      }
    },
  },
  {
    id: 'term',
    label: 'Loan term',
    weight: 6,
    evaluate: (i) => {
      const fired = i.termMonths > 48
      const close = !fired && i.termMonths > 36
      return {
        fired,
        close,
        contribution: fired ? 6 : close ? 2 : 0,
        display: `Term ${i.termMonths} mo`,
      }
    },
  },
  {
    id: 'region',
    label: 'Region risk',
    weight: 5,
    evaluate: (i) => {
      const fired = i.region === 'rural'
      const close = i.region === 'urban'
      return {
        fired,
        close,
        contribution: fired ? 5 : close ? 2 : 0,
        display: `Region: ${i.region}`,
      }
    },
  },
]

const lendingSet: RuleSet<LendingInput> = {
  id: 'lending',
  label: 'Microfinance lending',
  short: 'Loan applications',
  rateLabel: 'Recommended rate',
  rateUnit: '%',
  scoreLabel: 'Risk score',
  defaultInput: {
    monthlyIncome: 4800,
    existingDebt: 1100,
    creditScore: 712,
    employmentStatus: 'full-time',
    loanAmount: 18000,
    termMonths: 24,
    region: 'metro',
    priorDefaults: 0,
  },
  inputs: [
    {
      key: 'monthlyIncome',
      label: 'Monthly income',
      type: 'slider',
      min: 800,
      max: 12000,
      step: 100,
      prefix: '$',
    },
    {
      key: 'existingDebt',
      label: 'Existing monthly debt',
      type: 'slider',
      min: 0,
      max: 6000,
      step: 50,
      prefix: '$',
    },
    {
      key: 'creditScore',
      label: 'Credit score',
      type: 'slider',
      min: 400,
      max: 850,
      step: 5,
    },
    {
      key: 'employmentStatus',
      label: 'Employment',
      type: 'select',
      options: [
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'self-employed', label: 'Self-employed' },
        { value: 'unemployed', label: 'Unemployed' },
      ],
    },
    {
      key: 'loanAmount',
      label: 'Loan amount',
      type: 'slider',
      min: 1000,
      max: 80000,
      step: 500,
      prefix: '$',
    },
    {
      key: 'termMonths',
      label: 'Term',
      type: 'slider',
      min: 6,
      max: 60,
      step: 6,
      unit: ' mo',
    },
    {
      key: 'region',
      label: 'Region',
      type: 'select',
      options: [
        { value: 'metro', label: 'Metro' },
        { value: 'urban', label: 'Urban' },
        { value: 'rural', label: 'Rural' },
      ],
    },
    {
      key: 'priorDefaults',
      label: 'Prior defaults',
      type: 'slider',
      min: 0,
      max: 4,
      step: 1,
    },
  ],
  rules: lendingRules,
  decisions: {
    approve: { label: 'Approve', action: 'Push to disbursement', tone: 'good' },
    refer: { label: 'Refer', action: 'Queue for underwriter review', tone: 'mid' },
    decline: { label: 'Decline', action: 'Send decline letter', tone: 'bad' },
  },
  sample: () => {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!
    return {
      monthlyIncome: 1500 + Math.floor(Math.random() * 9000),
      existingDebt: Math.floor(Math.random() * 4500),
      creditScore: 480 + Math.floor(Math.random() * 360),
      employmentStatus: pick<LendingInput['employmentStatus']>([
        'full-time',
        'full-time',
        'full-time',
        'part-time',
        'self-employed',
        'unemployed',
      ]),
      loanAmount: 2000 + Math.floor(Math.random() * 60000),
      termMonths: [12, 18, 24, 36, 48, 60][Math.floor(Math.random() * 6)]!,
      region: pick<LendingInput['region']>(['metro', 'urban', 'rural']),
      priorDefaults: Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 3) + 1,
    }
  },
}

// ---------------------------------------------------------------------------
// CRM rule pack
// ---------------------------------------------------------------------------

type CrmInput = {
  companySize: number
  budget: number
  intentScore: number
  sourceChannel: 'referral' | 'paid-search' | 'cold-outbound' | 'organic'
  responseTimeHours: number
  bantScore: number
}

const crmRules: Rule<CrmInput>[] = [
  {
    id: 'size',
    label: 'Company size',
    weight: 22,
    evaluate: (i) => {
      const fired = i.companySize < 10
      const close = !fired && i.companySize < 25
      return {
        fired,
        close,
        contribution: fired ? 22 : close ? 6 : 0,
        display: `${i.companySize} employees`,
      }
    },
  },
  {
    id: 'budget',
    label: 'Budget',
    weight: 28,
    evaluate: (i) => {
      const fired = i.budget < 1000
      const close = !fired && i.budget < 2000
      return {
        fired,
        close,
        contribution: fired ? 28 : close ? 8 : 0,
        display: `$${i.budget.toLocaleString()}/mo budget`,
      }
    },
  },
  {
    id: 'intent',
    label: 'Intent score',
    weight: 20,
    evaluate: (i) => {
      const fired = i.intentScore < 35
      const close = !fired && i.intentScore < 55
      return {
        fired,
        close,
        contribution: fired ? 20 : close ? 6 : 0,
        display: `Intent ${i.intentScore}/100`,
      }
    },
  },
  {
    id: 'channel',
    label: 'Source channel',
    weight: 12,
    evaluate: (i) => {
      const fired = i.sourceChannel === 'cold-outbound'
      const close = i.sourceChannel === 'paid-search'
      return {
        fired,
        close,
        contribution: fired ? 12 : close ? 4 : 0,
        display: `Channel: ${i.sourceChannel.replace('-', ' ')}`,
      }
    },
  },
  {
    id: 'response',
    label: 'Response latency',
    weight: 10,
    evaluate: (i) => {
      const fired = i.responseTimeHours > 48
      const close = !fired && i.responseTimeHours > 12
      return {
        fired,
        close,
        contribution: fired ? 10 : close ? 3 : 0,
        display: `Responded in ${i.responseTimeHours}h`,
      }
    },
  },
  {
    id: 'bant',
    label: 'BANT signal',
    weight: 18,
    evaluate: (i) => {
      const fired = i.bantScore < 40
      const close = !fired && i.bantScore < 60
      return {
        fired,
        close,
        contribution: fired ? 18 : close ? 5 : 0,
        display: `BANT ${i.bantScore}/100`,
      }
    },
  },
]

const crmSet: RuleSet<CrmInput> = {
  id: 'crm',
  label: 'CRM lead routing',
  short: 'Inbound leads',
  rateLabel: 'Touchpoint cadence',
  rateUnit: ' days',
  scoreLabel: 'Friction score',
  defaultInput: {
    companySize: 60,
    budget: 2800,
    intentScore: 72,
    sourceChannel: 'referral',
    responseTimeHours: 4,
    bantScore: 68,
  },
  inputs: [
    {
      key: 'companySize',
      label: 'Company size',
      type: 'slider',
      min: 2,
      max: 500,
      step: 1,
      unit: ' employees',
    },
    {
      key: 'budget',
      label: 'Stated budget',
      type: 'slider',
      min: 100,
      max: 20000,
      step: 100,
      prefix: '$',
      unit: '/mo',
    },
    {
      key: 'intentScore',
      label: 'Intent score',
      type: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '/100',
    },
    {
      key: 'sourceChannel',
      label: 'Source channel',
      type: 'select',
      options: [
        { value: 'referral', label: 'Referral' },
        { value: 'organic', label: 'Organic' },
        { value: 'paid-search', label: 'Paid search' },
        { value: 'cold-outbound', label: 'Cold outbound' },
      ],
    },
    {
      key: 'responseTimeHours',
      label: 'Time to first reply',
      type: 'slider',
      min: 0,
      max: 96,
      step: 1,
      unit: 'h',
    },
    {
      key: 'bantScore',
      label: 'BANT score',
      type: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '/100',
    },
  ],
  rules: crmRules,
  decisions: {
    approve: { label: 'Qualified', action: 'Push to AE within 1 hour', tone: 'good' },
    refer: { label: 'Nurture', action: 'Add to drip + revisit in 30 days', tone: 'mid' },
    decline: { label: 'Disqualified', action: 'Polite decline · archive', tone: 'bad' },
  },
  sample: () => {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!
    return {
      companySize: 5 + Math.floor(Math.random() * 300),
      budget: 200 + Math.floor(Math.random() * 12000),
      intentScore: Math.floor(Math.random() * 100),
      sourceChannel: pick<CrmInput['sourceChannel']>([
        'referral',
        'organic',
        'paid-search',
        'cold-outbound',
        'cold-outbound',
      ]),
      responseTimeHours: Math.floor(Math.random() * 80),
      bantScore: Math.floor(Math.random() * 100),
    }
  },
}

// ---------------------------------------------------------------------------
// INVENTORY rule pack
// ---------------------------------------------------------------------------

type InventoryInput = {
  daysOnShelf: number
  unitsOnHand: number
  daysSinceLastSale: number
  shrinkRatePct: number
  marginPct: number
  category: 'perishable' | 'seasonal' | 'staple' | 'electronics'
}

const inventoryRules: Rule<InventoryInput>[] = [
  {
    id: 'age',
    label: 'Days on shelf',
    weight: 26,
    evaluate: (i) => {
      const limit = i.category === 'perishable' ? 14 : i.category === 'seasonal' ? 60 : 120
      const fired = i.daysOnShelf > limit
      const close = !fired && i.daysOnShelf > limit * 0.75
      return {
        fired,
        close,
        contribution: fired ? 26 : close ? 8 : 0,
        display: `${i.daysOnShelf}d on shelf (limit ${limit}d for ${i.category})`,
      }
    },
  },
  {
    id: 'velocity',
    label: 'Sales velocity',
    weight: 22,
    evaluate: (i) => {
      const fired = i.daysSinceLastSale > 45
      const close = !fired && i.daysSinceLastSale > 21
      return {
        fired,
        close,
        contribution: fired ? 22 : close ? 7 : 0,
        display: `${i.daysSinceLastSale}d since last sale`,
      }
    },
  },
  {
    id: 'shrink',
    label: 'Shrink rate',
    weight: 18,
    evaluate: (i) => {
      const fired = i.shrinkRatePct > 5
      const close = !fired && i.shrinkRatePct > 3
      return {
        fired,
        close,
        contribution: fired ? 18 : close ? 5 : 0,
        display: `Shrink ${i.shrinkRatePct.toFixed(1)}%`,
      }
    },
  },
  {
    id: 'margin',
    label: 'Margin headroom',
    weight: 14,
    evaluate: (i) => {
      const fired = i.marginPct < 12
      const close = !fired && i.marginPct < 22
      return {
        fired,
        close,
        contribution: fired ? 14 : close ? 4 : 0,
        display: `Margin ${i.marginPct.toFixed(0)}%`,
      }
    },
  },
  {
    id: 'stock',
    label: 'Stock depth',
    weight: 10,
    evaluate: (i) => {
      const fired = i.unitsOnHand > 80
      const close = !fired && i.unitsOnHand > 40
      return {
        fired,
        close,
        contribution: fired ? 10 : close ? 3 : 0,
        display: `${i.unitsOnHand} units on hand`,
      }
    },
  },
  {
    id: 'category',
    label: 'Category risk',
    weight: 8,
    evaluate: (i) => {
      const fired = i.category === 'perishable'
      const close = i.category === 'seasonal'
      return {
        fired,
        close,
        contribution: fired ? 8 : close ? 3 : 0,
        display: `Category: ${i.category}`,
      }
    },
  },
]

const inventorySet: RuleSet<InventoryInput> = {
  id: 'inventory',
  label: 'Inventory write-down',
  short: 'SKU health',
  rateLabel: 'Markdown',
  rateUnit: '%',
  scoreLabel: 'Aging score',
  defaultInput: {
    daysOnShelf: 28,
    unitsOnHand: 22,
    daysSinceLastSale: 4,
    shrinkRatePct: 1.8,
    marginPct: 36,
    category: 'staple',
  },
  inputs: [
    {
      key: 'daysOnShelf',
      label: 'Days on shelf',
      type: 'slider',
      min: 1,
      max: 240,
      step: 1,
      unit: 'd',
    },
    {
      key: 'unitsOnHand',
      label: 'Units on hand',
      type: 'slider',
      min: 1,
      max: 200,
      step: 1,
    },
    {
      key: 'daysSinceLastSale',
      label: 'Days since last sale',
      type: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'd',
    },
    {
      key: 'shrinkRatePct',
      label: 'Shrink rate',
      type: 'slider',
      min: 0,
      max: 12,
      step: 0.1,
      unit: '%',
    },
    {
      key: 'marginPct',
      label: 'Gross margin',
      type: 'slider',
      min: 5,
      max: 70,
      step: 1,
      unit: '%',
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'staple', label: 'Staple' },
        { value: 'seasonal', label: 'Seasonal' },
        { value: 'perishable', label: 'Perishable' },
        { value: 'electronics', label: 'Electronics' },
      ],
    },
  ],
  rules: inventoryRules,
  decisions: {
    approve: { label: 'Hold', action: 'Keep at current price', tone: 'good' },
    refer: { label: 'Review', action: 'Queue for buyer review', tone: 'mid' },
    decline: { label: 'Auto write-down', action: 'Apply markdown overnight', tone: 'bad' },
  },
  sample: () => {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!
    return {
      daysOnShelf: 1 + Math.floor(Math.random() * 200),
      unitsOnHand: 1 + Math.floor(Math.random() * 150),
      daysSinceLastSale: Math.floor(Math.random() * 100),
      shrinkRatePct: Math.round(Math.random() * 10 * 10) / 10,
      marginPct: 8 + Math.floor(Math.random() * 55),
      category: pick<InventoryInput['category']>(['staple', 'seasonal', 'perishable', 'electronics']),
    }
  },
}

const RULE_SETS = [lendingSet, crmSet, inventorySet] as const

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

interface EvaluatedRule {
  id: string
  label: string
  weight: number
  result: RuleResult
}

interface EngineOutput {
  decision: Decision
  score: number
  rate: number
  confidence: number
  rules: EvaluatedRule[]
  elapsedMs: number
}

function evaluate<T>(input: T, ruleset: RuleSet<T>, policy: Policy): EngineOutput {
  const t0 =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now()
  const rules: EvaluatedRule[] = ruleset.rules.map((r) => ({
    id: r.id,
    label: r.label,
    weight: r.weight,
    result: r.evaluate(input),
  }))
  const rawScore = rules.reduce((acc, r) => acc + r.result.contribution, 0)
  const score = Math.min(100, Math.max(0, Math.round(rawScore)))
  const decision: Decision =
    score <= policy.approveAt
      ? 'approve'
      : score >= policy.declineAt
      ? 'decline'
      : 'refer'
  const rate = +(policy.baseRate + score * policy.perPoint).toFixed(2)

  const distApprove = Math.abs(score - policy.approveAt)
  const distDecline = Math.abs(score - policy.declineAt)
  const nearest = Math.min(distApprove, distDecline)
  const closeRules = rules.filter((r) => r.result.close).length
  const confidence = Math.round(
    Math.min(99, Math.max(48, 60 + nearest * 2.4 - closeRules * 6)),
  )

  const t1 =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now()
  return {
    decision,
    score,
    rate,
    confidence,
    rules,
    elapsedMs: Math.max(0, +(t1 - t0).toFixed(2)),
  }
}

// ---------------------------------------------------------------------------
// Component state
// ---------------------------------------------------------------------------

const activeDomain = ref<Domain>('lending')
const activePolicyId = ref<Policy['id']>('standard')

// Per-domain input state, deep-cloned so each pack is independent.
const inputs = ref<{
  lending: LendingInput
  crm: CrmInput
  inventory: InventoryInput
}>({
  lending: { ...lendingSet.defaultInput },
  crm: { ...crmSet.defaultInput },
  inventory: { ...inventorySet.defaultInput },
})

const activeRuleSet = computed(() => {
  switch (activeDomain.value) {
    case 'lending':
      return lendingSet
    case 'crm':
      return crmSet
    case 'inventory':
      return inventorySet
  }
})

const activePolicy = computed(
  () => POLICIES.find((p) => p.id === activePolicyId.value)!,
)

const activeInput = computed(() => inputs.value[activeDomain.value])

const output = computed<EngineOutput>(() => {
  const rs = activeRuleSet.value as RuleSet<unknown>
  return evaluate(activeInput.value as unknown, rs, activePolicy.value)
})

// Sibling-policy preview so the policy diff is always visible.
const policyPreviews = computed(() => {
  return POLICIES.map((p) => {
    const rs = activeRuleSet.value as RuleSet<unknown>
    const out = evaluate(activeInput.value as unknown, rs, p)
    return { policy: p, decision: out.decision, score: out.score }
  })
})

function resetInputs() {
  inputs.value[activeDomain.value] = {
    ...activeRuleSet.value.defaultInput,
  } as never
}

function formatInputValue(def: InputDef<unknown>, value: unknown): string {
  if (def.type === 'select') {
    const opt = def.options?.find((o) => o.value === value)
    return opt?.label ?? String(value)
  }
  const n = Number(value)
  const formatted =
    def.step && def.step < 1 ? n.toFixed(1) : n.toLocaleString()
  return `${def.prefix ?? ''}${formatted}${def.unit ?? ''}`
}

function decisionTone(d: Decision): 'good' | 'mid' | 'bad' {
  return activeRuleSet.value.decisions[d].tone
}

// ---------------------------------------------------------------------------
// Batch mode
// ---------------------------------------------------------------------------

const BATCH_SIZE = 50
const BATCH_DURATION_MS = 1800

const batchRunning = ref(false)
const batchProgress = ref(0) // 0..1
const batchCounts = ref<Record<Decision, number>>({
  approve: 0,
  refer: 0,
  decline: 0,
})
const batchTotalElapsed = ref(0)
const batchProcessed = ref(0)

function runBatch() {
  if (batchRunning.value) return
  batchRunning.value = true
  batchProgress.value = 0
  batchCounts.value = { approve: 0, refer: 0, decline: 0 }
  batchTotalElapsed.value = 0
  batchProcessed.value = 0

  const rs = activeRuleSet.value as RuleSet<unknown>
  const policy = activePolicy.value
  const samples = Array.from({ length: BATCH_SIZE }, () =>
    (rs.sample as () => unknown)(),
  )

  const start = performance.now()
  let i = 0

  function tick() {
    const now = performance.now()
    const elapsed = now - start
    const targetIdx = Math.min(
      BATCH_SIZE,
      Math.ceil((elapsed / BATCH_DURATION_MS) * BATCH_SIZE),
    )
    while (i < targetIdx) {
      const out = evaluate(samples[i]!, rs, policy)
      batchCounts.value[out.decision]++
      batchTotalElapsed.value += out.elapsedMs
      i++
    }
    batchProcessed.value = i
    batchProgress.value = i / BATCH_SIZE
    if (i < BATCH_SIZE) {
      requestAnimationFrame(tick)
    } else {
      batchRunning.value = false
    }
  }
  requestAnimationFrame(tick)
}

const batchTotal = computed(
  () => batchCounts.value.approve + batchCounts.value.refer + batchCounts.value.decline,
)
const hasBatchResults = computed(() => batchTotal.value > 0)

// Reset batch results when context switches — the counts no longer make sense.
watch([activeDomain, activePolicyId], () => {
  batchCounts.value = { approve: 0, refer: 0, decline: 0 }
  batchProgress.value = 0
  batchProcessed.value = 0
  batchTotalElapsed.value = 0
})

// ---------------------------------------------------------------------------
// Pulse cue on decision change so the eye knows the engine refired.
// ---------------------------------------------------------------------------

const decisionPulseKey = ref(0)
let lastSignature = ''
watch(
  output,
  (o) => {
    const sig = `${activeDomain.value}|${activePolicyId.value}|${o.decision}|${o.score}`
    if (sig !== lastSignature) {
      lastSignature = sig
      decisionPulseKey.value++
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="p-4 md:p-7 lg:p-8">
    <!-- Header strip with domain (reusability toggle) -->
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <span
          class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
        >
          <span class="dot" />
          Live engine
        </span>
        <p class="mt-3 max-w-xl text-[14.5px] md:text-[15px] leading-[1.55] text-mute">
          Same engine, three rule packs. Change an input and the decision,
          score, action, and audit trail refresh in
          <strong class="text-ink font-semibold">under a millisecond</strong>.
        </p>
      </div>
      <div
        class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2 flex items-center gap-2"
        aria-hidden="true"
      >
        <Gauge :size="14" :stroke-width="2" />
        <span>computed in {{ output.elapsedMs.toFixed(2) }} ms</span>
      </div>
    </div>

    <!-- Context tabs -->
    <div class="mt-5">
      <div
        role="tablist"
        aria-label="Engine context"
        class="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface-alt p-1"
      >
        <button
          v-for="rs in RULE_SETS"
          :key="rs.id"
          role="tab"
          :aria-selected="activeDomain === rs.id"
          :class="[
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
            activeDomain === rs.id
              ? 'bg-white text-ink shadow-[0_1px_0_rgba(15,23,42,0.04)] border border-line'
              : 'text-mute hover:text-ink',
          ]"
          @click="activeDomain = rs.id"
        >
          <Layers v-if="rs.id === 'lending'" :size="14" :stroke-width="2" aria-hidden="true" />
          <Repeat v-else-if="rs.id === 'crm'" :size="14" :stroke-width="2" aria-hidden="true" />
          <BarChart3 v-else :size="14" :stroke-width="2" aria-hidden="true" />
          {{ rs.label }}
        </button>
      </div>
      <p class="mt-2 text-[12.5px] text-mute-2">
        Switching context swaps the rule pack — not the engine.
      </p>
    </div>

    <!-- Policy selector + diff -->
    <div class="mt-5 rounded-xl border border-line bg-surface-alt p-3 md:p-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
            Policy
          </div>
          <p class="mt-1.5 text-[14px] text-ink leading-[1.5] max-w-xl">
            {{ activePolicy.description }}
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Risk policy"
          class="inline-flex rounded-lg border border-line bg-white p-0.5"
        >
          <button
            v-for="p in POLICIES"
            :key="p.id"
            role="tab"
            :aria-selected="activePolicyId === p.id"
            :class="[
              'rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60',
              activePolicyId === p.id
                ? 'bg-ink text-white'
                : 'text-mute hover:text-ink',
            ]"
            @click="activePolicyId = p.id"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Policy diff: same applicant, three outcomes -->
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div
          v-for="row in policyPreviews"
          :key="row.policy.id"
          :class="[
            'rounded-lg border bg-white p-3 transition-colors',
            row.policy.id === activePolicyId
              ? 'border-cyan-brand/40 ring-1 ring-cyan-brand/20'
              : 'border-line',
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              {{ row.policy.label }}
            </span>
            <span
              :class="[
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em] font-bold',
                row.decision === 'approve'
                  ? 'bg-cyan-brand/15 text-cyan-brand-deep'
                  : row.decision === 'refer'
                  ? 'bg-surface-alt text-ink ring-1 ring-line'
                  : 'bg-red-50 text-red-600 ring-1 ring-red-100',
              ]"
            >
              {{ activeRuleSet.decisions[row.decision].label }}
            </span>
          </div>
          <div class="mt-2 text-[12px] text-mute">
            Approve ≤ {{ row.policy.approveAt }} ·
            Decline ≥ {{ row.policy.declineAt }} ·
            Score {{ row.score }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main two-column: inputs + decision/why -->
    <div class="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-5">
      <!-- INPUTS -->
      <div class="rounded-xl border border-line bg-white p-4 md:p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-display text-[22px] leading-[1.15] text-ink">
            {{ activeDomain === 'lending' ? 'Applicant' : activeDomain === 'crm' ? 'Lead' : 'SKU' }}
          </h3>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-mute hover:text-ink hover:bg-surface-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="resetInputs"
          >
            <RotateCcw :size="13" :stroke-width="2" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="def in activeRuleSet.inputs" :key="def.key">
            <div class="flex items-baseline justify-between mb-1.5">
              <label
                :for="`de-input-${activeDomain}-${def.key}`"
                class="text-[13px] font-semibold text-ink"
              >
                {{ def.label }}
              </label>
              <span class="text-[13px] tabular-nums text-mute font-medium">
                {{ formatInputValue(def as InputDef<unknown>, (activeInput as Record<string, unknown>)[def.key]) }}
              </span>
            </div>

            <template v-if="def.type === 'slider'">
              <input
                :id="`de-input-${activeDomain}-${def.key}`"
                type="range"
                :min="def.min"
                :max="def.max"
                :step="def.step"
                :value="(activeInput as Record<string, unknown>)[def.key]"
                class="de-slider w-full"
                @input="(e) => {
                  const raw = (e.target as HTMLInputElement).value
                  const num = Number(raw)
                  ;((inputs as unknown as { value: Record<string, Record<string, unknown>> }).value[activeDomain] as Record<string, unknown>)[def.key] = num
                }"
              />
            </template>

            <template v-else-if="def.type === 'select'">
              <select
                :id="`de-input-${activeDomain}-${def.key}`"
                :value="(activeInput as Record<string, unknown>)[def.key]"
                class="w-full rounded-lg border border-line bg-white px-3 py-2 text-[14px] text-ink focus:border-cyan-brand focus:outline-none focus:ring-2 focus:ring-cyan-brand/25 transition-colors"
                @change="(e) => {
                  const v = (e.target as HTMLSelectElement).value
                  ;((inputs as unknown as { value: Record<string, Record<string, unknown>> }).value[activeDomain] as Record<string, unknown>)[def.key] = v
                }"
              >
                <option v-for="opt in def.options" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </template>
          </div>
        </div>
      </div>

      <!-- DECISION + WHY -->
      <div class="space-y-4">
        <!-- Decision card -->
        <div
          :key="decisionPulseKey"
          :class="[
            'de-decision rounded-xl border p-4 md:p-6 transition-colors',
            decisionTone(output.decision) === 'good'
              ? 'border-cyan-brand/35 bg-gradient-to-b from-cyan-brand/[0.04] to-white'
              : decisionTone(output.decision) === 'bad'
              ? 'border-red-100 bg-red-50/40'
              : 'border-line bg-white',
          ]"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'inline-flex items-center justify-center h-11 w-11 rounded-xl ring-1',
                  decisionTone(output.decision) === 'good'
                    ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                    : decisionTone(output.decision) === 'bad'
                    ? 'bg-red-50 text-red-600 ring-red-100'
                    : 'bg-surface-alt text-ink ring-line',
                ]"
                aria-hidden="true"
              >
                <CheckCircle2 v-if="decisionTone(output.decision) === 'good'" :size="22" :stroke-width="1.9" />
                <XCircle v-else-if="decisionTone(output.decision) === 'bad'" :size="22" :stroke-width="1.9" />
                <AlertTriangle v-else :size="22" :stroke-width="1.9" />
              </span>
              <div>
                <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                  Decision
                </div>
                <div class="font-display text-[24px] sm:text-[30px] md:text-[34px] leading-[1.05] text-ink">
                  {{ activeRuleSet.decisions[output.decision].label }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                Confidence
              </div>
              <div class="font-display text-[24px] leading-none text-ink mt-0.5 tabular-nums">
                {{ output.confidence }}%
              </div>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-3">
            <div class="rounded-lg border border-line bg-white p-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                {{ activeRuleSet.scoreLabel }}
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="font-display text-[26px] leading-none text-ink tabular-nums">
                  {{ output.score }}
                </span>
                <span class="text-[12px] text-mute-2">/ 100</span>
              </div>
              <!-- Score bar with policy thresholds -->
              <div class="mt-2.5 relative h-1.5 rounded-full bg-surface-alt overflow-hidden">
                <div
                  class="absolute inset-y-0 left-0 bg-cyan-brand/15"
                  :style="{ width: `${activePolicy.approveAt}%` }"
                  aria-hidden="true"
                />
                <div
                  class="absolute inset-y-0 bg-red-100/70"
                  :style="{ left: `${activePolicy.declineAt}%`, right: 0 }"
                  aria-hidden="true"
                />
                <div
                  class="absolute top-0 bottom-0 w-[2px] bg-ink"
                  :style="{ left: `calc(${output.score}% - 1px)` }"
                  aria-hidden="true"
                />
              </div>
              <div class="mt-1 flex justify-between text-[10.5px] text-mute-2">
                <span>0</span>
                <span>{{ activePolicy.approveAt }}</span>
                <span>{{ activePolicy.declineAt }}</span>
                <span>100</span>
              </div>
            </div>

            <div class="rounded-lg border border-line bg-white p-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                {{ activeRuleSet.rateLabel }}
              </div>
              <div class="mt-1 flex items-baseline gap-1">
                <span class="font-display text-[26px] leading-none text-ink tabular-nums">
                  {{ output.rate.toFixed(activeDomain === 'crm' ? 0 : 1) }}
                </span>
                <span class="text-[12px] text-mute-2">{{ activeRuleSet.rateUnit }}</span>
              </div>
              <div class="mt-2.5 text-[12px] text-mute">
                Base {{ activePolicy.baseRate }}{{ activeRuleSet.rateUnit }}
                + {{ activePolicy.perPoint }}/pt
              </div>
            </div>
          </div>

          <div
            :class="[
              'mt-4 flex items-center gap-2.5 rounded-lg px-3.5 py-3 text-[14px] leading-[1.45]',
              decisionTone(output.decision) === 'good'
                ? 'bg-cyan-brand/10 text-ink'
                : decisionTone(output.decision) === 'bad'
                ? 'bg-red-50 text-ink'
                : 'bg-surface-alt text-ink',
            ]"
          >
            <ArrowRight :size="16" :stroke-width="2.2" aria-hidden="true" class="shrink-0" />
            <span>
              <span class="font-semibold">Next:</span>
              {{ activeRuleSet.decisions[output.decision].action }}
            </span>
          </div>
        </div>

        <!-- Why panel -->
        <div class="rounded-xl border border-line bg-white p-4 md:p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Info :size="14" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
              <h4 class="font-semibold text-[14px] text-ink uppercase tracking-[0.16em]">
                Why this decision
              </h4>
            </div>
            <span class="text-[11.5px] text-mute-2">
              {{ output.rules.filter((r) => r.result.fired).length }} fired ·
              {{ output.rules.filter((r) => r.result.close).length }} close
            </span>
          </div>

          <ul class="space-y-1.5">
            <li
              v-for="r in output.rules"
              :key="r.id"
              :class="[
                'flex items-start gap-2.5 rounded-md px-2.5 py-2 transition-colors',
                r.result.fired
                  ? 'bg-red-50/60'
                  : r.result.close
                  ? 'bg-cyan-brand/[0.06]'
                  : '',
              ]"
            >
              <span
                :class="[
                  'mt-0.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold shrink-0',
                  r.result.fired
                    ? 'bg-red-600 text-white'
                    : r.result.close
                    ? 'bg-cyan-brand-deep text-white'
                    : 'bg-surface-alt text-mute-2 ring-1 ring-line',
                ]"
                aria-hidden="true"
              >
                {{ r.result.fired ? '!' : r.result.close ? '~' : '✓' }}
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-2">
                  <span class="text-[13.5px] font-semibold text-ink">
                    {{ r.label }}
                  </span>
                  <span
                    :class="[
                      'text-[11.5px] tabular-nums shrink-0',
                      r.result.fired ? 'text-red-600 font-semibold' : 'text-mute-2',
                    ]"
                  >
                    {{ r.result.contribution > 0 ? '+' : '' }}{{ r.result.contribution }}
                  </span>
                </div>
                <div class="text-[12.5px] text-mute leading-[1.5]">
                  {{ r.result.display }}
                </div>
              </div>
            </li>
          </ul>

          <div class="mt-3 pt-3 border-t border-line">
            <div class="flex items-center justify-between text-[12px] text-mute-2">
              <span>Confidence</span>
              <span class="tabular-nums font-semibold text-ink">{{ output.confidence }}%</span>
            </div>
            <div class="mt-1.5 h-1.5 rounded-full bg-surface-alt overflow-hidden">
              <div
                class="h-full bg-cyan-brand-deep transition-[width] duration-300 ease-out"
                :style="{ width: `${output.confidence}%` }"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch mode -->
    <div class="mt-6 rounded-xl border border-line bg-surface-alt/70 p-4 md:p-6">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div class="max-w-xl">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            Batch mode
          </div>
          <h4 class="mt-1.5 font-display text-[18px] sm:text-[22px] md:text-[24px] leading-[1.2] md:leading-[1.15] text-ink">
            Run 50 sample {{ activeDomain === 'lending' ? 'applicants' : activeDomain === 'crm' ? 'leads' : 'SKUs' }} through the engine
          </h4>
          <p class="mt-1.5 text-[13.5px] text-mute leading-[1.55]">
            Same engine, same policy, 50 fresh inputs. The chart shows how
            <strong class="text-ink font-semibold">{{ activePolicy.label.toLowerCase() }}</strong>
            scores under the current rule pack.
          </p>
        </div>
        <button
          type="button"
          :disabled="batchRunning"
          :class="[
            'inline-flex items-center justify-center gap-2 rounded-lg text-[14px] font-semibold px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white shrink-0',
            batchRunning
              ? 'bg-ink/70 text-white cursor-wait'
              : 'bg-ink hover:bg-ink-soft text-white',
          ]"
          @click="runBatch"
        >
          <Play :size="15" :stroke-width="2.2" aria-hidden="true" />
          {{ batchRunning ? `Running… ${batchProcessed}/${BATCH_SIZE}` : (hasBatchResults ? 'Run again' : 'Run 50 samples') }}
        </button>
      </div>

      <!-- Progress bar -->
      <div
        v-if="batchRunning"
        class="mt-4 h-1.5 rounded-full bg-white border border-line overflow-hidden"
      >
        <div
          class="h-full bg-cyan-brand transition-[width] duration-100 ease-linear"
          :style="{ width: `${batchProgress * 100}%` }"
          aria-hidden="true"
        />
      </div>

      <!-- Results: bars + counts -->
      <div v-if="hasBatchResults" class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          v-for="d in (['approve', 'refer', 'decline'] as Decision[])"
          :key="d"
          class="rounded-lg border border-line bg-white p-4"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
              {{ activeRuleSet.decisions[d].label }}
            </span>
            <span class="text-[11.5px] tabular-nums text-mute-2">
              {{ Math.round((batchCounts[d] / Math.max(batchTotal, 1)) * 100) }}%
            </span>
          </div>
          <div class="mt-1 flex items-baseline gap-1.5">
            <span class="font-display text-[28px] leading-none text-ink tabular-nums">
              {{ batchCounts[d] }}
            </span>
            <span class="text-[12px] text-mute-2">of {{ batchTotal }}</span>
          </div>
          <div class="mt-3 h-2 rounded-full bg-surface-alt overflow-hidden">
            <div
              :class="[
                'h-full transition-[width] duration-300 ease-out',
                d === 'approve' ? 'bg-cyan-brand-deep' : d === 'refer' ? 'bg-ink/60' : 'bg-red-600',
              ]"
              :style="{ width: `${(batchCounts[d] / Math.max(batchTotal, 1)) * 100}%` }"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div
        v-if="hasBatchResults && !batchRunning"
        class="mt-3 text-[12.5px] text-mute-2"
      >
        50 decisions in
        {{ batchTotalElapsed.toFixed(1) }} ms of engine time
        (avg {{ (batchTotalElapsed / 50).toFixed(2) }} ms each).
      </div>
    </div>
  </div>
</template>

<style scoped>
.de-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 9999px;
  background: linear-gradient(to right, rgba(1, 219, 241, 0.35), rgba(1, 219, 241, 0.15));
  outline: none;
  cursor: pointer;
}
.de-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background: #ffffff;
  border: 2px solid #00b8cc;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
  cursor: grab;
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 160ms cubic-bezier(0.22, 1, 0.36, 1);
}
.de-slider::-webkit-slider-thumb:hover {
  transform: scale(1.06);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.22);
}
.de-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
}
.de-slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 4px rgba(1, 219, 241, 0.25);
}
.de-slider::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background: #ffffff;
  border: 2px solid #00b8cc;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
  cursor: grab;
}
.de-slider::-moz-range-track {
  height: 6px;
  border-radius: 9999px;
  background: transparent;
}

.de-decision {
  animation: deDecisionPulse 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes deDecisionPulse {
  0%   { transform: translateY(2px); opacity: 0.85; }
  100% { transform: translateY(0);   opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .de-decision { animation: none; }
  .de-slider::-webkit-slider-thumb { transition: none; }
}
</style>
