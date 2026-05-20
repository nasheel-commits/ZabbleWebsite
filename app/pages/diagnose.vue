<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Calendar,
  Loader2,
  Workflow,
  ShieldCheck,
  Radar,
  BarChart3,
  Layers,
} from '@lucide/vue'

useHead({
  title: 'Diagnose your operations · Zabble',
  meta: [
    {
      name: 'description',
      content:
        "A 2-minute diagnostic to find the operational problem that's costing your business the most.",
    },
  ],
})

type StepKey =
  | 'businessType'
  | 'primaryPain'
  | 'cost'
  | 'tried'
  | 'timeline'
  | 'decisionAuthority'
  | 'contact'

interface OptionDef {
  value: string
  label: string
  sub?: string
}

interface StepDef {
  key: StepKey
  question: string
  helper?: string
  options?: OptionDef[]
}

const totalSteps = 7

const stepDefs: StepDef[] = [
  {
    key: 'businessType',
    question: 'Which best describes your business?',
    helper: "Pick the closest fit. We work across all of them.",
    options: [
      { value: 'small', label: 'Small business', sub: 'Under 50 people' },
      { value: 'mid', label: 'Mid-sized', sub: '50–500 people' },
      { value: 'large', label: 'Large enterprise', sub: '500+ people' },
      { value: 'ngo', label: 'NGO or non-profit', sub: 'Mission-driven work' },
      { value: 'other', label: 'Something else', sub: "We'll meet you where you are" },
    ],
  },
  {
    key: 'primaryPain',
    question: 'Which of these feels most true about your operations right now?',
    helper: 'Pick the one that hits hardest. If they all do, the last option is for you.',
    options: [
      {
        value: 'automation',
        label: "We're drowning in manual work.",
        sub: 'The same spreadsheets, the same tasks, every week.',
      },
      {
        value: 'audit',
        label: "We can't see what's happening.",
        sub: 'Our data is scattered and our reporting is patchy.',
      },
      {
        value: 'risk',
        label: "We're worried about errors or risk slipping through.",
        sub: "The kind only caught when it's already too late.",
      },
      {
        value: 'analytics',
        label: 'We make big decisions on gut feel.',
        sub: "Because the numbers we'd want aren't there.",
      },
      {
        value: 'all',
        label: 'All of the above.',
        sub: 'Honestly, all of them apply.',
      },
    ],
  },
  {
    key: 'cost',
    question: "Roughly, what's this costing you?",
    helper: 'No need to be precise. Just the texture of it.',
    options: [
      {
        value: 'time',
        label: 'Mostly time',
        sub: 'Hours that should be going to higher-value work.',
      },
      { value: 'money', label: 'Mostly money', sub: 'Clear costs adding up.' },
      {
        value: 'risk',
        label: 'Mostly risk',
        sub: 'The kind that could really hurt us if it slipped.',
      },
      {
        value: 'opportunity',
        label: 'Mostly missed opportunity',
        sub: "We're not moving as fast as we should.",
      },
      {
        value: 'unsure',
        label: "Honestly, I'm not sure",
        sub: "That's part of the problem.",
      },
    ],
  },
  {
    key: 'tried',
    question: 'What have you tried so far to fix it?',
    options: [
      { value: 'saas', label: 'Off-the-shelf software or SaaS tools.' },
      { value: 'hires', label: 'Hired internally or brought in contractors.' },
      { value: 'inhouse', label: 'Built something in-house.' },
      { value: 'patched', label: 'Patched it together with spreadsheets and processes.' },
      { value: 'nothing', label: 'Nothing yet. Still figuring out what we need.' },
    ],
  },
  {
    key: 'timeline',
    question: 'If the right solution showed up tomorrow, when would you want it in place?',
    options: [
      { value: 'quarter', label: 'This quarter', sub: "It's bleeding now." },
      { value: '3to6', label: 'Next 3–6 months', sub: 'High priority.' },
      { value: 'year', label: 'Within the year', sub: 'Important but not urgent.' },
      { value: 'exploring', label: 'Just exploring options right now.' },
    ],
  },
  {
    key: 'decisionAuthority',
    question: "Who'd be involved in the call from your side?",
    helper: 'No wrong answer. This just helps us pace the call right.',
    options: [
      { value: 'solo', label: 'Just me', sub: 'I make the call.' },
      { value: 'team', label: 'Me and one or two others on my team.' },
      { value: 'leadership', label: "I'd need to loop in leadership." },
      {
        value: 'forothers',
        label: "I'm gathering info to share with someone else who decides.",
      },
    ],
  },
  {
    key: 'contact',
    question:
      'Where should we send your Operational Pain Profile and the link to book your call?',
    helper:
      "We'll only use this to send your profile and book the call. Nothing else.",
  },
]

const currentStep = ref(1)
const direction = ref<'forward' | 'backward'>('forward')
const completed = ref(false)
const submitting = ref(false)
const isAdvancing = ref(false)

const answers = reactive({
  businessType: null as string | null,
  primaryPain: null as string | null,
  cost: null as string | null,
  tried: null as string | null,
  timeline: null as string | null,
  decisionAuthority: null as string | null,
  contact: {
    name: '',
    email: '',
    company: '',
    phone: '',
    walkAway: '',
  },
})

const currentDef = computed(() => stepDefs[currentStep.value - 1])
const currentOptionValue = computed(() => {
  const def = currentDef.value
  if (def.key === 'contact') return null
  return (answers as Record<string, unknown>)[def.key] as string | null
})

function isSelected(value: string) {
  return currentOptionValue.value === value
}

function selectOption(value: string) {
  if (isAdvancing.value) return
  const def = currentDef.value
  ;(answers as Record<string, unknown>)[def.key] = value
  isAdvancing.value = true
  window.setTimeout(() => {
    advance()
    isAdvancing.value = false
  }, 320)
}

function advance() {
  if (currentStep.value < totalSteps) {
    direction.value = 'forward'
    currentStep.value++
  }
}

function back() {
  if (isAdvancing.value || submitting.value) return
  if (currentStep.value > 1) {
    direction.value = 'backward'
    currentStep.value--
  } else {
    navigateTo('/')
  }
}

function continueForward() {
  if (!currentOptionValue.value || isAdvancing.value) return
  advance()
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

const contactValid = computed(() => {
  return (
    answers.contact.name.trim().length > 0 &&
    isEmail(answers.contact.email) &&
    answers.contact.company.trim().length > 0
  )
})

function submitContact() {
  if (!contactValid.value || submitting.value) return
  submitting.value = true
  if (import.meta.client) {
    // eslint-disable-next-line no-console
    console.log('[Zabble Diagnose] Submission', JSON.parse(JSON.stringify(answers)))
  }
  window.setTimeout(() => {
    submitting.value = false
    completed.value = true
    direction.value = 'forward'
  }, 700)
}

const progress = computed(() => {
  if (completed.value) return 100
  // endowed-progress: step 1 already starts at 15%, last question step sits ~88%
  return Math.round(((currentStep.value - 1) / totalSteps) * 85 + 15)
})

const progressLabel = computed(() => {
  if (completed.value) return 'Complete'
  return `Step ${currentStep.value} of ${totalSteps}`
})

const profileMap = {
  automation: {
    title: 'a Workflow Automation business',
    icon: Workflow,
    body: "Businesses with your profile typically need their core operational workflows automated end-to-end. The highest-value first move is usually identifying the single workflow that costs the most hours every week, and rebuilding it so it runs itself.",
    quote:
      '“Three people were spending half their week on the same spreadsheet. We replaced that whole flow with one system, and those hours came straight back to the business.”',
  },
  audit: {
    title: 'an Audit Trail business',
    icon: ShieldCheck,
    body: "Your profile points to a visibility problem. Until you can see who did what, when, and why, in one place, every review costs more than it should and every audit feels like a fire drill. The first job is usually consolidating your operational truth into a single source.",
    quote:
      '“We used to scramble for two weeks before every audit. Now the trail is there before we even ask.”',
  },
  risk: {
    title: 'an Anomaly Detection business',
    icon: Radar,
    body: "The pattern in your answers is risk that grows quietly as you scale. The right system watches your operations in the background and flags what's unusual: the fraud, the error, the drift. All before it becomes a problem you can't ignore.",
    quote:
      '“We caught a vendor overcharging us 3× the baseline. The system flagged it before the invoice was even approved.”',
  },
  analytics: {
    title: 'an Analytics business',
    icon: BarChart3,
    body: "Your profile is a data-rich business making decisions on hunches. You almost certainly have the inputs you need. They're just trapped in the wrong tools. The first job is usually building the dashboards your leadership team actually opens on Monday morning.",
    quote:
      '“For the first time, every meeting starts with the same numbers. Decisions take half as long.”',
  },
  all: {
    title: 'a Full-System business',
    icon: Layers,
    body: "Your profile says all four of our pillars apply: automation, audit trails, anomaly detection, and analytics. That's common past a certain scale. The real work is sequencing: starting with the pillar that has the biggest dollar impact, then layering the others on top.",
    quote:
      '“We didn’t fix everything at once. We fixed the right thing first, and the rest got easier from there.”',
  },
} as const

const profile = computed(() => {
  const key = (answers.primaryPain || 'all') as keyof typeof profileMap
  return profileMap[key] || profileMap.all
})

const calendarUrl = computed(() => {
  const summary = [
    `Name: ${answers.contact.name}`,
    `Company: ${answers.contact.company}`,
    `Business size: ${answers.businessType ?? '(not specified)'}`,
    `Primary pain: ${answers.primaryPain ?? '(not specified)'}`,
    `Cost: ${answers.cost ?? '(not specified)'}`,
    `Tried so far: ${answers.tried ?? '(not specified)'}`,
    `Timeline: ${answers.timeline ?? '(not specified)'}`,
    `Decision: ${answers.decisionAuthority ?? '(not specified)'}`,
    answers.contact.walkAway
      ? `Wants to walk away with: ${answers.contact.walkAway}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
  const body = `Hi Zabble,\n\nI just completed the Operational Pain Profile and I'd like to book the 30-minute discovery call.\n\nMy profile:\n${summary}\n\nThanks,\n${answers.contact.name}`
  const params = new URLSearchParams({
    subject: 'Discovery call (from Operational Pain Profile)',
    body,
  })
  return `mailto:analytics@zabble.org?${params.toString()}`
})

function onKeydown(e: KeyboardEvent) {
  if (completed.value || submitting.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    back()
    return
  }
  const def = currentDef.value
  if (def.key === 'contact') return
  const target = e.target as HTMLElement | null
  if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
  const num = parseInt(e.key, 10)
  if (Number.isFinite(num) && def.options && num >= 1 && num <= def.options.length) {
    e.preventDefault()
    selectOption(def.options[num - 1].value)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

const transitionName = computed(() =>
  direction.value === 'forward' ? 'slide-forward' : 'slide-backward',
)

const stepFrame = computed(
  () => 'Find your most expensive operational problem in under 2 minutes.',
)
</script>

<template>
  <div class="diagnose-root relative min-h-screen flex flex-col bg-surface text-ink antialiased">
    <div
      class="absolute inset-x-0 -top-32 -z-10 pointer-events-none flex justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div class="h-[440px] w-[820px] rounded-full bg-cyan-brand/[0.09] blur-[120px]" />
    </div>

    <header class="relative z-10">
      <div
        class="mx-auto w-full max-w-3xl px-5 md:px-8 pt-4 pb-3 md:py-5 flex items-center gap-3 md:gap-5"
      >
        <NuxtLink
          to="/"
          class="inline-flex items-center group shrink-0 py-2 lg:py-0"
          aria-label="Zabble home"
        >
          <span class="font-display text-ink text-[22px] sm:text-[28px] leading-none tracking-[-0.02em] transition-colors group-hover:text-ink-soft">
            Zabble
          </span>
        </NuxtLink>

        <div class="flex-1 min-w-0">
          <div
            class="flex items-center justify-between text-[11.5px] md:text-[12.5px] text-mute-2 mb-1 md:mb-1.5 font-semibold"
          >
            <span>{{ progressLabel }}</span>
            <span class="tabular-nums">{{ progress }}%</span>
          </div>
          <div class="relative h-1 md:h-1.5 rounded-full bg-line/80 overflow-hidden">
            <div
              class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-brand to-cyan-brand-deep transition-[width] duration-700 ease-out shadow-[0_0_14px_rgba(1,219,241,0.55)]"
              :style="{ width: progress + '%' }"
            />
          </div>
        </div>

        <NuxtLink
          to="/"
          class="-mr-1.5 md:mr-0 inline-flex items-center justify-center h-10 w-10 lg:h-10 lg:w-10 rounded-full text-mute hover:text-ink hover:bg-ink/5 transition shrink-0"
          aria-label="Close and return home"
        >
          <X :size="20" :stroke-width="1.75" />
        </NuxtLink>
      </div>
    </header>

    <Transition name="fade">
      <div
        v-if="currentStep === 1 && !completed"
        class="mx-auto max-w-3xl w-full px-5 md:px-8 pt-1 pb-2 md:pt-2 md:pb-4 text-center"
      >
        <p
          class="text-[13.5px] md:text-[15px] text-mute font-medium tracking-[-0.005em]"
        >
          {{ stepFrame }}
        </p>
      </div>
    </Transition>

    <main class="flex-1 flex flex-col items-stretch">
      <div
        class="mx-auto w-full max-w-3xl px-5 md:px-8 py-4 md:py-12 flex-1 flex flex-col"
      >
        <div class="relative flex-1">
          <Transition :name="transitionName" mode="out-in">
            <div
              v-if="!completed && currentDef.key !== 'contact'"
              :key="`q-${currentStep}`"
              class="space-y-5 md:space-y-9"
            >
              <div>
                <h1
                  class="font-display text-[26px] sm:text-[34px] md:text-[44px] lg:text-[48px] leading-[1.12] tracking-tight text-ink"
                >
                  {{ currentDef.question }}
                </h1>
                <p
                  v-if="currentDef.helper"
                  class="mt-2.5 md:mt-4 text-[14.5px] md:text-[16.5px] text-mute leading-[1.55] md:leading-[1.6]"
                >
                  {{ currentDef.helper }}
                </p>
              </div>

              <div class="grid grid-cols-1 gap-2.5 md:gap-3">
                <button
                  v-for="(opt, i) in currentDef.options"
                  :key="opt.value"
                  type="button"
                  :disabled="isAdvancing"
                  :class="[
                    'option-card group flex items-start gap-3 md:gap-4 text-left rounded-xl md:rounded-2xl border bg-white px-3.5 md:px-6 py-3.5 md:py-5 transition-all duration-200 disabled:cursor-default',
                    isSelected(opt.value)
                      ? 'border-cyan-brand ring-2 ring-cyan-brand/30 shadow-[0_18px_50px_-22px_rgba(1,219,241,0.55)]'
                      : 'border-line hover:border-cyan-brand/55 hover:bg-cyan-brand/[0.02] hover:shadow-[0_18px_45px_-30px_rgba(15,23,42,0.18)] hover:-translate-y-px',
                  ]"
                  :style="{ animationDelay: `${i * 60}ms` }"
                  @click="selectOption(opt.value)"
                >
                  <span
                    :class="[
                      'mt-0.5 inline-flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg text-[12.5px] md:text-[13.5px] font-semibold transition-all',
                      isSelected(opt.value)
                        ? 'bg-cyan-brand text-ink ring-1 ring-cyan-brand'
                        : 'bg-surface-alt text-mute group-hover:bg-cyan-brand/10 group-hover:text-cyan-brand-deep ring-1 ring-line',
                    ]"
                    aria-hidden="true"
                  >
                    <Check v-if="isSelected(opt.value)" :size="15" />
                    <span v-else class="tabular-nums">{{ i + 1 }}</span>
                  </span>
                  <span class="flex-1 min-w-0">
                    <span
                      class="block text-[15.5px] md:text-[17.5px] font-semibold text-ink leading-snug"
                    >
                      {{ opt.label }}
                    </span>
                    <span
                      v-if="opt.sub"
                      class="block mt-0.5 md:mt-1 text-[13.5px] md:text-[15px] text-mute leading-[1.45] md:leading-[1.55]"
                    >
                      {{ opt.sub }}
                    </span>
                  </span>
                  <ArrowRight
                    :size="16"
                    :class="[
                      'mt-1 md:mt-1.5 shrink-0 transition-all',
                      isSelected(opt.value)
                        ? 'text-cyan-brand-deep translate-x-0.5'
                        : 'text-mute-2 group-hover:text-ink group-hover:translate-x-0.5',
                    ]"
                  />
                </button>
              </div>
            </div>

            <div
              v-else-if="!completed && currentDef.key === 'contact'"
              :key="'contact'"
              class="space-y-8 md:space-y-9"
            >
              <div>
                <h1
                  class="font-display text-[30px] sm:text-[38px] md:text-[44px] leading-[1.1] tracking-tight text-ink"
                >
                  {{ currentDef.question }}
                </h1>
                <p
                  class="mt-4 text-[16px] md:text-[16.5px] text-mute leading-[1.6]"
                >
                  {{ currentDef.helper }}
                </p>
              </div>

              <form class="space-y-5" @submit.prevent="submitContact">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label class="block">
                    <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                      Name
                    </span>
                    <input
                      v-model="answers.contact.name"
                      type="text"
                      autocomplete="name"
                      required
                      placeholder="Your full name"
                      class="form-field"
                    />
                  </label>
                  <label class="block">
                    <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                      Work email
                    </span>
                    <input
                      v-model="answers.contact.email"
                      type="email"
                      autocomplete="email"
                      required
                      placeholder="you@company.com"
                      class="form-field"
                    />
                  </label>
                  <label class="block">
                    <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                      Company
                    </span>
                    <input
                      v-model="answers.contact.company"
                      type="text"
                      autocomplete="organization"
                      required
                      placeholder="Company name"
                      class="form-field"
                    />
                  </label>
                  <label class="block">
                    <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                      Phone
                      <span class="font-normal text-mute-2">(optional)</span>
                    </span>
                    <input
                      v-model="answers.contact.phone"
                      type="tel"
                      autocomplete="tel"
                      placeholder="+1 555 0100"
                      class="form-field"
                    />
                  </label>
                </div>

                <label class="block">
                  <span class="block text-[13px] font-semibold text-ink mb-2 tracking-[0.01em]">
                    What's the one thing you'd want to walk away from the call with?
                    <span class="font-normal text-mute-2">(optional)</span>
                  </span>
                  <textarea
                    v-model="answers.contact.walkAway"
                    rows="3"
                    placeholder="A clear sense of what to tackle first, a rough scope, a price range, peace of mind…"
                    class="form-field resize-none leading-[1.55]"
                  />
                </label>

                <div class="pt-1">
                  <button
                    type="submit"
                    :disabled="!contactValid || submitting"
                    :class="[
                      'group inline-flex items-center justify-center gap-2 rounded-full text-[15.5px] font-semibold pl-7 pr-5 py-4 transition w-full sm:w-auto',
                      contactValid && !submitting
                        ? 'bg-ink hover:bg-ink-soft text-white shadow-[0_18px_50px_-15px_rgba(1,219,241,0.5)]'
                        : 'bg-line text-mute-2 cursor-not-allowed',
                    ]"
                  >
                    <Loader2 v-if="submitting" :size="18" class="animate-spin" />
                    <template v-else>
                      See my Operational Pain Profile
                      <ArrowRight
                        :size="18"
                        class="transition group-hover:translate-x-0.5"
                      />
                    </template>
                  </button>
                </div>

                <p class="text-[13px] text-mute-2 leading-[1.6]">
                  No marketing list. No spam. The only emails you'll receive are about your
                  profile and your call.
                </p>
              </form>
            </div>

            <div v-else :key="'result'" class="space-y-10 md:space-y-12">
              <div class="text-center">
                <div class="result-icon-wrap mx-auto mb-7">
                  <div
                    class="relative inline-flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-cyan-brand to-cyan-brand-deep text-ink shadow-[0_18px_50px_-12px_rgba(1,219,241,0.65)]"
                  >
                    <component :is="profile.icon" :size="32" :stroke-width="2" />
                    <span class="result-icon-halo" aria-hidden="true" />
                  </div>
                </div>

                <div
                  class="text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
                >
                  Your Operational Pain Profile
                </div>
                <h1
                  class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.05] tracking-tight text-ink"
                >
                  You're
                  <span class="cyan-underline">{{ profile.title }}</span
                  >.
                </h1>
                <p
                  class="mx-auto mt-7 max-w-2xl text-[17px] md:text-[18.5px] leading-[1.65] text-mute"
                >
                  {{ profile.body }}
                </p>
              </div>

              <div class="flex flex-col items-center gap-4">
                <a
                  :href="calendarUrl"
                  class="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-brand hover:bg-cyan-brand-deep text-ink text-[16px] font-semibold pl-7 pr-6 py-4 transition shadow-[0_22px_55px_-12px_rgba(1,219,241,0.65)]"
                >
                  <Calendar :size="18" />
                  Book your 30-minute call
                  <ArrowRight
                    :size="18"
                    class="transition group-hover:translate-x-0.5"
                  />
                </a>
                <p class="text-[16px] lg:text-[13.5px] text-mute-2">
                  First conversation is free. And useful either way.
                </p>
              </div>

              <figure
                class="mt-2 rounded-2xl border border-line bg-white/95 p-7 md:p-9 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.18)]"
              >
                <blockquote class="diagnose-quote text-[18px] md:text-[20px] text-ink leading-[1.6]">
                  {{ profile.quote }}
                </blockquote>
                <figcaption
                  class="mt-5 text-[12px] text-mute-2 uppercase tracking-[0.2em] font-semibold"
                >
                  From a similar business
                </figcaption>
              </figure>

              <div class="text-center pt-2">
                <NuxtLink
                  to="/"
                  class="inline-block py-3 lg:inline lg:py-0 text-[16px] lg:text-[14.5px] text-mute hover:text-ink transition underline-offset-4 hover:underline"
                >
                  ← Back to home
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <div
          v-if="!completed"
          class="mt-6 md:mt-12 flex items-center justify-between gap-4"
        >
          <button
            type="button"
            class="group inline-flex items-center gap-1.5 py-3 lg:py-0 text-[14.5px] font-medium text-mute hover:text-ink transition"
            @click="back"
          >
            <ArrowLeft :size="16" class="transition group-hover:-translate-x-0.5" />
            {{ currentStep === 1 ? 'Home' : 'Back' }}
          </button>

          <button
            v-if="currentOptionValue && currentDef.key !== 'contact'"
            type="button"
            class="group inline-flex items-center gap-2 rounded-full bg-ink hover:bg-ink-soft text-white text-[14.5px] font-medium pl-5 pr-4 py-3 lg:py-2.5 transition"
            @click="continueForward"
          >
            Continue
            <ArrowRight :size="16" class="transition group-hover:translate-x-0.5" />
          </button>

          <div
            v-else-if="currentDef.key !== 'contact'"
            class="text-[12.5px] text-mute-2 hidden md:block"
          >
            Press
            <kbd
              class="px-1.5 py-0.5 rounded border border-line bg-surface-alt font-medium text-mute mx-0.5"
            >1</kbd
            >–<kbd
              class="px-1.5 py-0.5 rounded border border-line bg-surface-alt font-medium text-mute mx-0.5"
            >{{ currentDef.options?.length || 1 }}</kbd
            >
            to select
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.diagnose-quote {
  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Source Serif Pro',
    'Charter', Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.005em;
  text-wrap: pretty;
}

.form-field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--color-line);
  background: #ffffff;
  padding: 0.875rem 1rem;
  font-size: 16px;
  line-height: 1.4;
  color: var(--color-ink);
  font-family: var(--font-sans);
  transition: border-color 180ms, box-shadow 180ms, background-color 180ms;
}
.form-field::placeholder {
  color: var(--color-mute-2);
}
.form-field:hover {
  border-color: rgba(1, 219, 241, 0.4);
}
.form-field:focus {
  outline: none;
  border-color: var(--color-cyan-brand);
  box-shadow: 0 0 0 3px rgba(1, 219, 241, 0.22);
}

.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-backward-enter-active,
.slide-backward-leave-active {
  transition: opacity 380ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-forward-enter-from {
  opacity: 0;
  transform: translate3d(36px, 0, 0);
}
.slide-forward-leave-to {
  opacity: 0;
  transform: translate3d(-26px, 0, 0);
}
.slide-backward-enter-from {
  opacity: 0;
  transform: translate3d(-36px, 0, 0);
}
.slide-backward-leave-to {
  opacity: 0;
  transform: translate3d(26px, 0, 0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 280ms ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.option-card {
  animation: option-fade-in 420ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
@keyframes option-fade-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-icon-wrap {
  animation: result-pop 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes result-pop {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  60% {
    opacity: 1;
    transform: scale(1.06);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.result-icon-halo {
  position: absolute;
  inset: -10px;
  border-radius: 1.25rem;
  background: rgba(1, 219, 241, 0.35);
  filter: blur(22px);
  z-index: -1;
  animation: result-halo 2.6s ease-in-out infinite;
}
@keyframes result-halo {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .slide-forward-enter-active,
  .slide-forward-leave-active,
  .slide-backward-enter-active,
  .slide-backward-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none !important;
  }
  .option-card,
  .result-icon-wrap,
  .result-icon-halo {
    animation: none !important;
  }
}
</style>
