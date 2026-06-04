<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Activity, AlertTriangle, ArrowRight, Bell, Building2, Check, ChevronRight, FileSignature, Lock, RotateCcw, ScrollText, Sliders, Sparkles, Users } from '@lucide/vue'

type Role = 'paralegal' | 'conveyancer' | 'partner'
type RoleFilter = 'all' | Role
type Phase = 'intake' | 'due-diligence' | 'drafting' | 'sign-off' | 'lodgement'
type Status = 'blocked' | 'ready' | 'done'

interface TaskSeed {
  id: string
  title: string
  blurb: string
  owner: Role
  phase: Phase
  baseDue: number
  deps: string[]
}

interface Task extends TaskSeed {
  status: Status
  effDue: number
  slipDays: number
  atRisk: boolean
}

const SEED: TaskSeed[] = [
  { id: 't1',  title: 'Open matter & client onboarding', blurb: 'Capture parties, property, mandate, fee estimate.', owner: 'paralegal',   phase: 'intake',        baseDue: 1,  deps: [] },
  { id: 't2',  title: 'FICA verification',               blurb: 'Verify ID and proof of address for buyer and seller.', owner: 'paralegal',   phase: 'intake',        baseDue: 3,  deps: ['t1'] },
  { id: 't3',  title: 'Order deeds office search',       blurb: 'Confirm title, bondholder, and existing endorsements.', owner: 'conveyancer', phase: 'due-diligence', baseDue: 3,  deps: ['t1'] },
  { id: 't4',  title: 'Review Offer to Purchase',        blurb: 'Suspensive conditions, occupation date, agent commission.', owner: 'conveyancer', phase: 'due-diligence', baseDue: 4,  deps: ['t1'] },
  { id: 't5',  title: 'Bond approval from bank',         blurb: 'Track grant letter, raise queries with bond originator.', owner: 'paralegal',   phase: 'due-diligence', baseDue: 6,  deps: ['t2'] },
  { id: 't6',  title: 'Request rates clearance',         blurb: 'Apply to municipality, settle figures, await certificate.', owner: 'paralegal',   phase: 'due-diligence', baseDue: 7,  deps: ['t3'] },
  { id: 't7',  title: 'Request levy clearance',          blurb: 'Body corporate consent and outstanding levies.', owner: 'paralegal',   phase: 'due-diligence', baseDue: 7,  deps: ['t3'] },
  { id: 't8',  title: 'Receive guarantees',              blurb: 'Bank guarantees lodged with the firm in lieu of cash.', owner: 'paralegal',   phase: 'due-diligence', baseDue: 9,  deps: ['t5'] },
  { id: 't9',  title: 'Draft transfer documents',        blurb: 'Deed of transfer, power of attorney, declarations.', owner: 'conveyancer', phase: 'drafting',      baseDue: 11, deps: ['t4', 't8'] },
  { id: 't10', title: 'Client signature appointment',    blurb: 'Witnessed signatures on transfer pack.', owner: 'conveyancer', phase: 'drafting',      baseDue: 13, deps: ['t9'] },
  { id: 't11', title: 'Compile partner brief',           blurb: 'Assemble the matter pack with summary memo.', owner: 'paralegal',   phase: 'sign-off',      baseDue: 14, deps: ['t6', 't7', 't10'] },
  { id: 't12', title: 'Partner sign-off',                blurb: 'Final review and signature on the deed.', owner: 'partner',     phase: 'sign-off',      baseDue: 15, deps: ['t11'] },
  { id: 't13', title: 'Lodge at Deeds Office',           blurb: 'Submit to Registrar of Deeds for examination.', owner: 'conveyancer', phase: 'lodgement',     baseDue: 16, deps: ['t12'] },
  { id: 't14', title: 'Registration & invoice',          blurb: 'Confirm registration, release funds, send invoice.', owner: 'paralegal',   phase: 'lodgement',     baseDue: 21, deps: ['t13'] },
]

const ROLE_META: Record<Role, { label: string; initials: string; ring: string; chipBg: string; chipText: string }> = {
  paralegal:   { label: 'Paralegal',   initials: 'PL', ring: 'ring-cyan-brand/30',     chipBg: 'bg-cyan-brand/10',    chipText: 'text-cyan-brand-deep' },
  conveyancer: { label: 'Conveyancer', initials: 'CV', ring: 'ring-ink/15',            chipBg: 'bg-surface-alt',      chipText: 'text-ink' },
  partner:     { label: 'Partner',     initials: 'PT', ring: 'ring-ink/30',            chipBg: 'bg-ink',              chipText: 'text-white' },
}

const PHASE_META: Record<Phase, { label: string; short: string }> = {
  'intake':        { label: 'Intake',                    short: 'Intake' },
  'due-diligence': { label: 'Due diligence',             short: 'Diligence' },
  'drafting':      { label: 'Drafting & signature',      short: 'Drafting' },
  'sign-off':      { label: 'Partner sign-off',          short: 'Sign-off' },
  'lodgement':     { label: 'Lodgement & registration',  short: 'Lodgement' },
}

const PHASE_ORDER: Phase[] = ['intake', 'due-diligence', 'drafting', 'sign-off', 'lodgement']

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

const completed = reactive<Record<string, boolean>>({})
const slip = reactive<Record<string, number>>({})
const roleFilter = ref<RoleFilter>('all')
const simulatorTaskId = ref<string | null>(null)
const briefForTaskId = ref<string | null>(null)
const partnerSummaryOpen = ref(false)

interface ActivityEntry {
  id: number
  kind: 'open' | 'complete' | 'handoff' | 'unblock' | 'risk' | 'reset' | 'brief'
  text: string
}
const activity = ref<ActivityEntry[]>([])
let activitySeq = 0

function log(kind: ActivityEntry['kind'], text: string) {
  activity.value.unshift({ id: ++activitySeq, kind, text })
  if (activity.value.length > 12) activity.value.length = 12
}

log('open', 'Matter 2026-0341 opened, 11 Acacia Avenue, Sandton. Playbook loaded.')

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------

const tasks = computed<Task[]>(() => {
  const byId = new Map(SEED.map((t) => [t.id, t]))
  const cache: Record<string, number> = {}
  const effDue = (id: string): number => {
    if (id in cache) return cache[id]!
    const t = byId.get(id)!
    let d = t.baseDue + (slip[id] ?? 0)
    for (const dep of t.deps) d = Math.max(d, effDue(dep))
    cache[id] = d
    return d
  }
  SEED.forEach((t) => effDue(t.id))

  return SEED.map((t) => {
    const isDone = !!completed[t.id]
    const allDepsDone = t.deps.every((d) => !!completed[d])
    const status: Status = isDone ? 'done' : allDepsDone ? 'ready' : 'blocked'
    const eff = cache[t.id]!
    const slipDays = eff - t.baseDue
    return {
      ...t,
      status,
      effDue: eff,
      slipDays,
      atRisk: !isDone && slipDays > 0,
    }
  })
})

const byStatus = computed(() => {
  const out: Record<Status, Task[]> = { blocked: [], ready: [], done: [] }
  for (const t of tasks.value) out[t.status].push(t)
  // Order by phase then due
  for (const k of Object.keys(out) as Status[]) {
    out[k].sort((a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase) || a.effDue - b.effDue)
  }
  return out
})

const riskCount = computed(() => tasks.value.filter((t) => t.atRisk).length)

const progressPct = computed(() => {
  const total = SEED.length
  const done = Object.keys(completed).length
  return Math.round((done / total) * 100)
})

const timelineMax = computed(() => Math.max(22, ...tasks.value.map((t) => t.effDue)) + 1)

// Tasks visible per role: when a role is selected, the other tasks fade.
function isContextual(t: Task): boolean {
  return roleFilter.value !== 'all' && t.owner !== roleFilter.value
}

// Auto-generated partner brief (would normally be assembled from matter data).
const partnerSummary = computed(() => (
  'Matter 2026-0341, Transfer of 11 Acacia Avenue, Sandton (Erf 4421) from J & A Smith to N Naidoo for R 4,250,000. ' +
  'FICA cleared for all parties on day 3. Bond approval received from Investec on day 6 with guarantees lodged on day 9. ' +
  'Rates and levy clearance certificates issued. Transfer documents signed by both parties on day 13. ' +
  'All suspensive conditions met, ready for your signature on the deed of transfer and supporting power of attorney.'
))

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function markComplete(id: string) {
  const t = tasks.value.find((x) => x.id === id)
  if (!t || t.status !== 'ready') return
  completed[id] = true
  log('complete', `${ROLE_META[t.owner].label} marked "${t.title}" complete.`)

  // Find tasks that just became ready (deps all done now).
  const newlyReady = tasks.value.filter((x) => x.status === 'ready' && x.deps.includes(id))
  for (const r of newlyReady) {
    if (r.owner !== t.owner) {
      log('handoff', `Handed to ${ROLE_META[r.owner].label}: "${r.title}". Brief prepared.`)
    } else {
      log('unblock', `Unblocked for ${ROLE_META[r.owner].label}: "${r.title}".`)
    }
    if (r.id === 't12') {
      partnerSummaryOpen.value = true
      briefForTaskId.value = 't12'
      log('brief', 'Partner brief generated from matter context. Summary surfaced.')
    } else if (newlyReady.length === 1) {
      briefForTaskId.value = r.id
    }
  }
}

function selectSimulatorTask(id: string | null) {
  simulatorTaskId.value = id
}

function applySlip(id: string, days: number) {
  if (days <= 0) delete slip[id]
  else slip[id] = days
}

function onSlipChange(id: string, ev: Event) {
  const v = Math.max(0, Math.min(10, Number((ev.target as HTMLInputElement).value || 0)))
  applySlip(id, v)
  if (v > 0) {
    const t = SEED.find((x) => x.id === id)
    const risks = tasks.value.filter((x) => x.atRisk).length
    if (t) log('risk', `What-if: "${t.title}" slips +${v}d → ${risks} downstream task${risks === 1 ? '' : 's'} at risk.`)
  }
}

function resetMatter() {
  for (const k of Object.keys(completed)) delete completed[k]
  for (const k of Object.keys(slip)) delete slip[k]
  simulatorTaskId.value = null
  briefForTaskId.value = null
  partnerSummaryOpen.value = false
  activity.value = []
  activitySeq = 0
  log('reset', 'Matter reset to intake. All tasks blocked except the opener.')
}

// ---------------------------------------------------------------------------
// Visual helpers
// ---------------------------------------------------------------------------

function timelinePct(day: number): number {
  return Math.max(0, Math.min(100, (day / timelineMax.value) * 100))
}

function ringForRole(role: Role): string {
  return ROLE_META[role].ring
}

function isBriefShown(id: string): boolean {
  return briefForTaskId.value === id
}

function toggleBrief(id: string) {
  briefForTaskId.value = briefForTaskId.value === id ? null : id
}

function selectedSimulatorTask() {
  return simulatorTaskId.value ? tasks.value.find((t) => t.id === simulatorTaskId.value) ?? null : null
}

// Pre-seed: open the first task so the demo doesn't start fully blocked.
function ensureSeed() {
  // Nothing pre-completed, keeps the reset path obvious. The first card
  // ("Open matter") is always 'ready' because it has no deps.
}
ensureSeed()

</script>

<template>
  <div class="font-sans">
    <!-- Header strip -->
    <div class="relative border-b border-line bg-surface-alt/60">
      <div class="px-5 md:px-7 py-5 md:py-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Interactive demo
          </div>
          <div class="mt-2 flex items-center gap-3">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-cyan-brand-deep ring-1 ring-line">
              <Building2 :size="18" :stroke-width="1.9" aria-hidden="true" />
            </span>
            <div>
              <div class="font-display text-[22px] md:text-[26px] leading-[1.1] text-ink">
                Matter 2026-0341 · 11 Acacia Avenue, Sandton
              </div>
              <div class="text-[13.5px] text-mute">
                Residential transfer · Smith → Naidoo · R 4,250,000
              </div>
            </div>
          </div>
        </div>

        <!-- Role switcher + reset -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div
            role="tablist"
            aria-label="Role"
            class="inline-flex flex-wrap items-center rounded-xl border border-line bg-white p-1 max-w-full"
          >
            <button
              v-for="r in (['all','paralegal','conveyancer','partner'] as RoleFilter[])"
              :key="r"
              role="tab"
              :aria-selected="roleFilter === r"
              class="px-3 py-1.5 text-[12.5px] font-semibold rounded-lg transition-colors"
              :class="roleFilter === r
                ? 'bg-ink text-white'
                : 'text-mute hover:text-ink'"
              @click="roleFilter = r"
            >
              {{ r === 'all' ? 'All roles' : ROLE_META[r as Role].label }}
            </button>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
            @click="resetMatter"
          >
            <RotateCcw :size="14" :stroke-width="2" aria-hidden="true" />
            Reset matter
          </button>
        </div>
      </div>

      <!-- Progress + at-risk summary -->
      <div class="px-5 md:px-7 pb-5">
        <div class="flex items-center gap-4 text-[12.5px] text-mute">
          <div class="flex-1">
            <div class="h-1.5 rounded-full bg-line overflow-hidden">
              <div
                class="h-full rounded-full bg-cyan-brand-deep transition-all duration-500"
                :style="{ width: `${progressPct}%` }"
                aria-hidden="true"
              />
            </div>
          </div>
          <div class="shrink-0 tabular-nums text-ink font-semibold">{{ progressPct }}%</div>
          <div
            v-if="riskCount > 0"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] text-[#DC2626] ring-1 ring-[#FEE2E2] px-2.5 py-1 text-[11.5px] font-semibold"
          >
            <AlertTriangle :size="12" :stroke-width="2" aria-hidden="true" />
            {{ riskCount }} at risk
          </div>
        </div>
      </div>
    </div>

    <!-- Kanban -->
    <div class="px-5 md:px-7 pt-7">
      <div class="flex items-center justify-between gap-3 mb-4">
        <h3 class="font-display text-[20px] md:text-[22px] leading-[1.15] text-ink">Board</h3>
        <div class="hidden md:flex items-center gap-3 text-[11.5px] text-mute-2">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-mute-2/40" /> Blocked</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-cyan-brand" /> Ready</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-ink" /> Done</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <!-- Column -->
        <section
          v-for="col in (['blocked','ready','done'] as Status[])"
          :key="col"
          class="rounded-2xl border border-line bg-surface-alt/40 p-3 md:p-4"
        >
          <header class="flex items-center justify-between px-1 mb-3">
            <div class="inline-flex items-center gap-2">
              <span
                :class="[
                  'h-2 w-2 rounded-full',
                  col === 'blocked' ? 'bg-mute-2/50' : col === 'ready' ? 'bg-cyan-brand' : 'bg-ink',
                ]"
                aria-hidden="true"
              />
              <span class="text-[12.5px] uppercase tracking-[0.18em] font-semibold text-ink">
                {{ col === 'blocked' ? 'Blocked' : col === 'ready' ? 'Ready' : 'Done' }}
              </span>
            </div>
            <span class="text-[12px] text-mute-2 tabular-nums">{{ byStatus[col].length }}</span>
          </header>

          <div class="flex flex-col gap-2.5">
            <article
              v-for="t in byStatus[col]"
              :key="t.id"
              :class="[
                'group relative rounded-xl border bg-white p-3.5 transition-all',
                t.atRisk ? 'border-[#FEE2E2] ring-1 ring-[#FEE2E2]' : 'border-line',
                isContextual(t) ? 'opacity-40' : 'opacity-100',
                t.status === 'ready' ? 'shadow-[0_0_0_2px_rgba(1,219,241,0.18)]' : '',
              ]"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1.5">
                    <span
                      :class="[
                        'inline-flex h-6 w-6 items-center justify-center rounded-md text-[10.5px] font-semibold tracking-wide ring-1',
                        ROLE_META[t.owner].chipBg, ROLE_META[t.owner].chipText, ROLE_META[t.owner].ring,
                      ]"
                      :title="ROLE_META[t.owner].label"
                    >
                      {{ ROLE_META[t.owner].initials }}
                    </span>
                    <span class="text-[10.5px] uppercase tracking-[0.16em] font-semibold text-mute-2">
                      {{ PHASE_META[t.phase].short }}
                    </span>
                  </div>
                  <div class="text-[14px] font-semibold text-ink leading-[1.35]">
                    {{ t.title }}
                  </div>
                  <div class="mt-1 text-[12.5px] text-mute leading-[1.45]">
                    {{ t.blurb }}
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <div class="text-[10.5px] uppercase tracking-[0.16em] text-mute-2">Due</div>
                  <div :class="['font-display text-[20px] leading-none tabular-nums', t.atRisk ? 'text-[#DC2626]' : 'text-ink']">
                    d{{ t.effDue }}
                  </div>
                  <div v-if="t.atRisk" class="mt-0.5 text-[10.5px] text-[#DC2626] font-semibold">
                    +{{ t.slipDays }}d
                  </div>
                </div>
              </div>

              <!-- Footer row -->
              <div class="mt-3 flex items-center justify-between gap-2">
                <!-- Status meta -->
                <div class="inline-flex items-center gap-1.5 text-[11.5px] text-mute">
                  <Lock v-if="t.status === 'blocked'" :size="12" :stroke-width="2" aria-hidden="true" />
                  <Sparkles v-else-if="t.status === 'ready'" :size="12" :stroke-width="2" class="text-cyan-brand-deep" aria-hidden="true" />
                  <Check v-else :size="12" :stroke-width="2.4" class="text-ink" aria-hidden="true" />
                  <span v-if="t.status === 'blocked'">
                    Waiting on {{ t.deps.length }} task{{ t.deps.length === 1 ? '' : 's' }}
                  </span>
                  <span v-else-if="t.status === 'ready'">
                    Ready · {{ ROLE_META[t.owner].label }}
                  </span>
                  <span v-else>Complete</span>
                </div>

                <div class="flex items-center gap-1.5">
                  <button
                    v-if="t.status === 'ready'"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-[11.5px] font-semibold text-mute hover:text-ink hover:border-ink/25 transition-colors"
                    :class="{ 'border-cyan-brand/40 text-cyan-brand-deep': simulatorTaskId === t.id }"
                    :title="'Late-task simulator'"
                    @click="selectSimulatorTask(simulatorTaskId === t.id ? null : t.id)"
                  >
                    <Sliders :size="12" :stroke-width="2" aria-hidden="true" />
                    Late?
                  </button>
                  <button
                    v-if="t.status === 'ready'"
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-md bg-ink text-white px-2.5 py-1 text-[11.5px] font-semibold hover:bg-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-1"
                    @click="markComplete(t.id)"
                  >
                    Complete
                    <ArrowRight :size="11" :stroke-width="2.2" aria-hidden="true" />
                  </button>
                  <button
                    v-if="t.status === 'ready' && t.id !== 't12'"
                    type="button"
                    class="inline-flex items-center justify-center rounded-md border border-line bg-white h-[26px] w-[26px] text-mute hover:text-ink hover:border-ink/25 transition-colors"
                    :title="isBriefShown(t.id) ? 'Hide brief' : 'Show brief'"
                    @click="toggleBrief(t.id)"
                  >
                    <ScrollText :size="12" :stroke-width="2" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <!-- Inline brief panel -->
              <div
                v-if="isBriefShown(t.id) && t.id !== 't12'"
                class="mt-3 rounded-lg border border-line bg-surface-alt/60 p-3 text-[12.5px] text-ink leading-[1.55]"
              >
                <div class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold mb-1.5">
                  <ScrollText :size="11" :stroke-width="2" aria-hidden="true" />
                  Prepared brief
                </div>
                <p>
                  The system has prepared the linked deeds search, FICA pack, and prior correspondence for this task, surfaced where {{ ROLE_META[t.owner].label }} starts.
                </p>
              </div>

              <!-- Partner sign-off handoff -->
              <div
                v-if="t.id === 't12' && t.status === 'ready' && partnerSummaryOpen"
                class="mt-3 rounded-lg border border-line bg-white p-3.5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.18)]"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink text-white">
                    <FileSignature :size="14" :stroke-width="2" aria-hidden="true" />
                  </span>
                  <div class="text-[12.5px] font-semibold text-ink">Partner brief delivered</div>
                </div>
                <p class="text-[13px] text-ink leading-[1.6]">
                  {{ partnerSummary }}
                </p>
                <div class="mt-2.5 flex items-center gap-2 text-[11.5px] text-mute">
                  <Users :size="12" :stroke-width="2" aria-hidden="true" />
                  Auto-generated from matter context, every fact links back to the source document.
                </div>
              </div>

              <!-- Late-task simulator panel -->
              <div
                v-if="simulatorTaskId === t.id && t.status === 'ready'"
                class="mt-3 rounded-lg border border-line bg-surface-alt/60 p-3"
              >
                <div class="flex items-center justify-between gap-2 mb-2">
                  <div class="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                    <Sliders :size="11" :stroke-width="2" aria-hidden="true" />
                    What if this is late?
                  </div>
                  <div class="text-[11.5px] text-mute tabular-nums">
                    {{ slip[t.id] ?? 0 }}d slip
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  :value="slip[t.id] ?? 0"
                  class="w-full accent-cyan-brand-deep"
                  :aria-label="`Days late for ${t.title}`"
                  @input="onSlipChange(t.id, $event)"
                />
                <div class="mt-1 flex justify-between text-[10.5px] text-mute-2 tabular-nums">
                  <span>On time</span>
                  <span>+10d</span>
                </div>
                <p class="mt-2 text-[12px] text-mute leading-[1.5]">
                  The timeline recomputes downstream tasks live, anything that can no longer meet its target due date is flagged in red.
                </p>
              </div>
            </article>

            <div
              v-if="byStatus[col].length === 0"
              class="rounded-xl border border-dashed border-line bg-white/40 px-3 py-6 text-center text-[12px] text-mute-2"
            >
              <template v-if="col === 'blocked'">Nothing waiting on anything else.</template>
              <template v-else-if="col === 'ready'">No tasks ready to start.</template>
              <template v-else>Nothing complete yet.</template>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Timeline -->
    <div class="px-5 md:px-7 pt-8">
      <div class="flex items-center justify-between gap-3 mb-3">
        <h3 class="font-display text-[20px] md:text-[22px] leading-[1.15] text-ink">Timeline</h3>
        <div class="text-[11.5px] text-mute-2">
          Days from intake · target completion d21
        </div>
      </div>

      <div class="rounded-2xl border border-line bg-white p-4 md:p-5">
        <!-- Axis -->
        <div class="relative h-5 border-b border-line">
          <template v-for="d in [0, 5, 10, 15, 20]" :key="d">
            <div
              class="absolute -translate-x-1/2 top-0 text-[10.5px] text-mute-2 tabular-nums"
              :style="{ left: `${timelinePct(d)}%` }"
            >
              d{{ d }}
            </div>
            <div
              class="absolute top-3 h-2 w-px bg-line"
              :style="{ left: `${timelinePct(d)}%` }"
              aria-hidden="true"
            />
          </template>
        </div>

        <!-- Lanes -->
        <div class="mt-3 space-y-2">
          <div
            v-for="phase in PHASE_ORDER"
            :key="phase"
            class="relative flex items-center gap-3"
          >
            <div class="shrink-0 w-[72px] md:w-[110px] text-[10.5px] md:text-[11.5px] text-mute uppercase tracking-[0.14em] md:tracking-[0.16em] font-semibold">
              {{ PHASE_META[phase].short }}
            </div>
            <div class="relative flex-1 h-9 rounded-md bg-surface-alt/40">
              <!-- Dependency hairlines (subtle) -->
              <svg class="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                <template v-for="t in tasks.filter((x) => x.phase === phase)" :key="`dep-${t.id}`">
                  <template v-for="depId in t.deps" :key="`dep-${t.id}-${depId}`">
                    <line
                      v-if="tasks.find((x) => x.id === depId)?.phase === phase"
                      :x1="`${timelinePct((tasks.find((x) => x.id === depId)!.effDue))}%`"
                      x2="100%"
                      y1="50%"
                      y2="50%"
                      stroke="rgba(15,23,42,0.08)"
                      stroke-width="1"
                    />
                  </template>
                </template>
              </svg>

              <!-- Task pips -->
              <button
                v-for="t in tasks.filter((x) => x.phase === phase)"
                :key="`pip-${t.id}`"
                type="button"
                :class="[
                  'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group',
                  isContextual(t) ? 'opacity-40' : 'opacity-100',
                ]"
                :style="{ left: `${timelinePct(t.effDue)}%` }"
                :aria-label="`${t.title}, due day ${t.effDue}${t.atRisk ? `, ${t.slipDays} days late` : ''}`"
                @click="t.status === 'ready' ? selectSimulatorTask(simulatorTaskId === t.id ? null : t.id) : null"
              >
                <span
                  :class="[
                    'block h-3.5 w-3.5 rounded-full ring-2 transition-transform',
                    t.status === 'done' ? 'bg-ink ring-ink/20' :
                    t.status === 'ready' ? 'bg-cyan-brand ring-cyan-brand/30' :
                    'bg-white ring-line',
                    t.atRisk ? 'ring-[#DC2626]/40 outline outline-2 outline-[#FEE2E2]' : '',
                  ]"
                  aria-hidden="true"
                />
                <span
                  class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-ink text-white text-[10.5px] font-semibold px-1.5 py-0.5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                >
                  {{ t.title }} · d{{ t.effDue }}
                </span>
              </button>

              <!-- Base-due ghost markers when slipped -->
              <template
                v-for="t in tasks.filter((x) => x.phase === phase && x.atRisk)"
                :key="`ghost-${t.id}`"
              >
                <span
                  class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-2 w-2 rounded-full border border-dashed border-[#DC2626]/40"
                  :style="{ left: `${timelinePct(t.baseDue)}%` }"
                  :title="`Original target d${t.baseDue}`"
                  aria-hidden="true"
                />
              </template>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-mute-2">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-white ring-2 ring-line" /> Blocked</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-cyan-brand ring-2 ring-cyan-brand/30" /> Ready</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-ink ring-2 ring-ink/20" /> Done</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full border border-dashed border-[#DC2626]/40" /> Original target</span>
          <span class="ml-auto inline-flex items-center gap-1.5">
            <Sliders :size="11" :stroke-width="2" aria-hidden="true" />
            Click a ready pip to open the late-task simulator
          </span>
        </div>
      </div>
    </div>

    <!-- Activity -->
    <div class="px-5 md:px-7 pt-8 pb-7">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Activity feed -->
        <section class="lg:col-span-2 rounded-2xl border border-line bg-white p-4 md:p-5">
          <header class="flex items-center justify-between gap-3 mb-3">
            <h3 class="font-display text-[20px] leading-[1.15] text-ink">Activity</h3>
            <div class="inline-flex items-center gap-1.5 text-[11.5px] text-mute-2">
              <Bell :size="12" :stroke-width="2" aria-hidden="true" />
              Notifications fire automatically
            </div>
          </header>
          <ol class="space-y-2.5">
            <li
              v-for="entry in activity"
              :key="entry.id"
              class="flex items-start gap-2.5 text-[13px] leading-[1.5]"
            >
              <span
                :class="[
                  'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1',
                  entry.kind === 'risk' ? 'bg-[#FEF2F2] text-[#DC2626] ring-[#FEE2E2]' :
                  entry.kind === 'handoff' || entry.kind === 'brief' ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25' :
                  entry.kind === 'complete' ? 'bg-ink text-white ring-ink/15' :
                  entry.kind === 'reset' ? 'bg-surface-alt text-mute ring-line' :
                  'bg-surface-alt text-ink ring-line',
                ]"
                aria-hidden="true"
              >
                <AlertTriangle v-if="entry.kind === 'risk'" :size="12" :stroke-width="2" />
                <FileSignature v-else-if="entry.kind === 'brief'" :size="12" :stroke-width="2" />
                <ArrowRight v-else-if="entry.kind === 'handoff'" :size="12" :stroke-width="2.2" />
                <Check v-else-if="entry.kind === 'complete'" :size="12" :stroke-width="2.4" />
                <RotateCcw v-else-if="entry.kind === 'reset'" :size="12" :stroke-width="2" />
                <ChevronRight v-else :size="12" :stroke-width="2" />
              </span>
              <span class="text-ink">{{ entry.text }}</span>
            </li>
            <li v-if="activity.length === 0" class="text-[13px] text-mute-2">
              No activity yet.
            </li>
          </ol>
        </section>

        <!-- What this proves -->
        <aside class="rounded-2xl border border-line bg-surface-alt/60 p-4 md:p-5">
          <div class="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            What this proves
          </div>
          <h4 class="mt-3 font-display text-[20px] leading-[1.15] text-ink">
            Nothing falls between desks.
          </h4>
          <ul class="mt-3 space-y-2.5 text-[13.5px] text-ink leading-[1.55]">
            <li class="flex gap-2"><span class="text-cyan-brand-deep">·</span> Each role sees only what's theirs; the rest stays as context.</li>
            <li class="flex gap-2"><span class="text-cyan-brand-deep">·</span> Completing a task unblocks the next role and surfaces the brief they need.</li>
            <li class="flex gap-2"><span class="text-cyan-brand-deep">·</span> A late task cascades through the timeline so deadlines at risk surface early.</li>
            <li class="flex gap-2"><span class="text-cyan-brand-deep">·</span> The matter runs whether anyone is actively "managing" it or not.</li>
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Range input styling, keep brand-consistent. */
input[type='range'] {
  height: 4px;
  border-radius: 9999px;
  background: #e2e8f0;
  appearance: none;
  cursor: pointer;
}
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  background: #00b8cc;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #e2e8f0;
}
input[type='range']::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  background: #00b8cc;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #e2e8f0;
}
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
