<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight, PlayCircle } from '@lucide/vue'

import { useScroll } from '~/composables/useScroll'
import { useInView } from '~/composables/useInView'

const heroRef = ref<HTMLElement | null>(null)
const { scrollY: globalScrollY, reduced: reducedRef } = useScroll()
const { visible: heroVisible } = useInView(heroRef, { threshold: 0, rootMargin: '200px 0px' })

// Only feed parallax inline styles while the hero is on-screen and motion
// is not reduced, outside that window the elements are static, so writing
// transforms each rAF only repaints work nobody can see.
const scrollY = computed(() => {
  if (reducedRef.value) return 0
  if (!heroVisible.value) return 0
  return globalScrollY.value
})

const scrambleEl = ref<HTMLElement | null>(null)
const phrases = [
  'Bespoke Digital Systems',
  'Workflows That Compound',
  'Operations Made Visible',
  'Risk Caught Early',
  'Systems Built To Scale',
]
let scrambleTimer: number | undefined
let scrambleFrame: number | undefined

class TextScramble {
  el: HTMLElement
  chars = '!<>-_\\/[]{}-=+*^?#________'
  queue: { from: string; to: string; start: number; end: number; char?: string }[] = []
  frame = 0
  resolve: (() => void) | null = null

  constructor(el: HTMLElement) {
    this.el = el
    this.update = this.update.bind(this)
  }

  setText(newText: string): Promise<void> {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise<void>((res) => { this.resolve = res })
    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }
    if (scrambleFrame) cancelAnimationFrame(scrambleFrame)
    this.frame = 0
    this.update()
    return promise
  }

  update() {
    let output = ''
    let complete = 0
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }
        output += `<span class="scramble-dud">${char}</span>`
      } else {
        output += from
      }
    }
    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve?.()
    } else {
      scrambleFrame = requestAnimationFrame(this.update)
      this.frame++
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)]
  }
}

onMounted(() => {
  if (scrambleEl.value && !reducedRef.value) {
    const fx = new TextScramble(scrambleEl.value)
    let counter = 0
    const tick = () => {
      counter = (counter + 1) % phrases.length
      fx.setText(phrases[counter]).then(() => {
        scrambleTimer = window.setTimeout(tick, 2400)
      })
    }
    scrambleTimer = window.setTimeout(tick, 2600)
  }
})

onBeforeUnmount(() => {
  if (scrambleTimer) clearTimeout(scrambleTimer)
  if (scrambleFrame) cancelAnimationFrame(scrambleFrame)
})

</script>

<template>
  <section
    id="home"
    ref="heroRef"
    class="relative overflow-hidden pt-20 md:pt-40 pb-14 md:pb-28"
  >
    <div
      class="absolute inset-0 grid-bg fade-mask pointer-events-none"
      aria-hidden="true"
      :style="{ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }"
    />
    <div
      class="parallax-blob absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-brand/15 blur-3xl pointer-events-none"
      aria-hidden="true"
      :style="{ transform: `translate3d(0, ${scrollY * 0.25}px, 0)` }"
    />
    <div
      class="parallax-blob absolute top-40 left-[-8%] h-[320px] w-[320px] rounded-full bg-cyan-brand/10 blur-3xl pointer-events-none"
      aria-hidden="true"
      :style="{ transform: `translate3d(0, ${scrollY * -0.18}px, 0)` }"
    />

    <div class="relative mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
      <div class="mx-auto max-w-4xl text-center">
        <div
          v-reveal
          class="inline-flex items-center gap-2.5 text-[14px] uppercase tracking-[0.24em] text-cyan-brand-deep font-semibold"
        >
          <span class="dot" />
          <span ref="scrambleEl" class="scramble-text">Bespoke Digital Systems</span>
        </div>

        <h1
          v-reveal:blur="80"
          class="mt-6 md:mt-8 font-display text-[40px] leading-[1.06] sm:text-[56px] md:text-[70px] lg:text-[78px] tracking-tight text-ink"
        >
          Your business has a system or workflow that's costing you.
          <span class="block mt-2">
            We build the system that
            <span class="relative inline-block">
              <span class="cyan-underline">solves it.</span>
            </span>
          </span>
          <span class="block mt-5 md:mt-8 font-display text-[22px] leading-[1.2] sm:text-[30px] md:text-[36px] lg:text-[40px] text-ink/85">
            A system shaped to your business.
            <span class="block text-ink">Built for no one else.</span>
          </span>
        </h1>

        <p
          v-reveal="220"
          data-answer-first
          class="mx-auto mt-6 md:mt-8 max-w-2xl text-[16px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute"
        >
          Zabble designs bespoke operational systems: automation, audit trails, anomaly detection,
          and analytics. Built around the specific problem that's slowing your business down.
        </p>

        <div v-reveal="320" class="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink
            to="/diagnose"
            class="group inline-flex items-center justify-center gap-2 rounded-full bg-ink hover:bg-ink-soft text-white text-[16px] lg:text-[15.5px] font-medium pl-6 pr-5 py-3.5 transition shadow-[0_10px_30px_-12px_rgba(1,219,241,0.55)]"
          >
            Find my biggest problem
            <ArrowRight :size="17" class="transition group-hover:translate-x-0.5" />
          </NuxtLink>
          <a
            href="#plan"
            class="group inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white hover:bg-surface-alt text-ink text-[16px] lg:text-[15.5px] font-medium px-6 py-3.5 transition"
          >
            <PlayCircle :size="17" class="text-cyan-brand-deep" />
            See how we work
          </a>
        </div>

        <p v-reveal="420" class="mt-6 text-[16px] lg:text-[13.5px] text-mute-2">
          First conversation is free. And useful either way.
        </p>
      </div>

      <div
        class="relative mt-16 md:mt-20 hidden md:block"
        :style="{ transform: `translate3d(0, ${scrollY * -0.06}px, 0)` }"
      >
        <div
          v-reveal:scale="120"
          class="mx-auto max-w-5xl rounded-2xl border border-line bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] overflow-hidden"
        >
          <div class="flex items-center gap-1.5 px-4 py-3 border-b border-line bg-surface-alt">
            <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span class="ml-3 text-[12.5px] text-mute-2">zabble.ops · operations control</span>
          </div>
          <div class="grid grid-cols-12 gap-0">
            <aside class="hidden md:flex col-span-3 flex-col border-r border-line p-5 bg-surface-alt/40">
              <span class="text-[12px] uppercase tracking-[0.15em] text-mute-2 font-semibold">Workspace</span>
              <ul class="mt-4 flex flex-col gap-2 text-[14px]">
                <li class="flex items-center gap-2 text-ink font-medium">
                  <span class="h-1.5 w-1.5 rounded-full bg-cyan-brand" />
                  Workflows
                </li>
                <li class="text-mute pl-3.5">Approvals</li>
                <li class="text-mute pl-3.5">Audit trail</li>
                <li class="text-mute pl-3.5">Anomalies</li>
                <li class="text-mute pl-3.5">Dashboards</li>
              </ul>
            </aside>
            <div class="col-span-12 md:col-span-9 p-5 md:p-7">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div class="rounded-xl border border-line p-4 bg-white">
                  <p class="text-[12px] uppercase tracking-[0.12em] text-mute-2 font-semibold">Hours saved / wk</p>
                  <p class="mt-2 font-display text-[34px] leading-none text-ink">128<span class="text-cyan-brand-deep">·</span></p>
                  <p class="text-[12.5px] text-mute mt-2">+14% vs. last month</p>
                </div>
                <div class="rounded-xl border border-line p-4 bg-white">
                  <p class="text-[12px] uppercase tracking-[0.12em] text-mute-2 font-semibold">Anomalies caught</p>
                  <p class="mt-2 font-display text-[34px] leading-none text-ink">17</p>
                  <p class="text-[12.5px] text-mute mt-2">3 prevented losses</p>
                </div>
                <div class="rounded-xl border border-line p-4 bg-white">
                  <p class="text-[12px] uppercase tracking-[0.12em] text-mute-2 font-semibold">Audit readiness</p>
                  <p class="mt-2 font-display text-[34px] leading-none text-ink">98%</p>
                  <p class="text-[12.5px] text-mute mt-2">All trails intact</p>
                </div>
              </div>

              <div class="mt-6 rounded-xl border border-line p-4 bg-white">
                <div class="flex items-center justify-between">
                  <p class="text-[13.5px] font-semibold text-ink">Weekly throughput</p>
                  <span class="text-[12px] text-mute-2">Auto-generated</span>
                </div>
                <svg viewBox="0 0 600 130" class="mt-3 w-full h-24" aria-hidden="true">
                  <defs>
                    <linearGradient id="hg" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#01DBF1" stop-opacity="0.45" />
                      <stop offset="100%" stop-color="#01DBF1" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,95 C60,80 100,90 150,70 C200,50 250,75 300,55 C360,32 420,60 480,40 C540,22 580,32 600,28 L600,130 L0,130 Z"
                    fill="url(#hg)"
                  />
                  <path
                    d="M0,95 C60,80 100,90 150,70 C200,50 250,75 300,55 C360,32 420,60 480,40 C540,22 580,32 600,28"
                    fill="none"
                    stroke="#01DBF1"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div
          v-reveal:right="500"
          class="hidden lg:block absolute -right-6 top-12 rotate-2 rounded-xl border border-line bg-white shadow-xl p-3 w-56 float-soft"
        >
          <div class="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <span class="h-2 w-2 rounded-full bg-cyan-brand" />
            Anomaly detected
          </div>
          <p class="mt-2 text-[12.5px] text-mute leading-relaxed">
            Vendor invoice 3.2× higher than 90-day baseline. Flagged for review.
          </p>
        </div>
        <div
          v-reveal:left="620"
          class="hidden lg:block absolute -left-6 -bottom-4 -rotate-2 rounded-xl border border-line bg-white shadow-xl p-3 w-52"
        >
          <div class="text-[12px] uppercase tracking-[0.15em] text-mute-2 font-semibold">Audit</div>
          <p class="mt-2 text-[13px] text-ink leading-relaxed">
            12 actions logged in this workflow this hour.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scramble-text {
  display: inline-block;
  white-space: nowrap;
}
.scramble-text :deep(.scramble-dud) {
  color: var(--color-mute-2);
  opacity: 0.55;
}

@media (prefers-reduced-motion: reduce) {
  .scramble-text :deep(.scramble-dud) {
    color: inherit;
  }
}
</style>
