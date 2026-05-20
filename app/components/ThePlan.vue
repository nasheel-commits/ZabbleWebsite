<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Search, Hammer, Activity } from '@lucide/vue'

const steps = [
  {
    n: '01',
    icon: Search,
    title: 'We sit with you.',
    body: "We spend time inside your business, with your team, your tools, and your data, until we can point to the operational problem that's costing you the most.",
  },
  {
    n: '02',
    icon: Hammer,
    title: 'We build it.',
    body: 'We design and deliver a system tailored to your business. Not your industry. Not businesses like yours. Yours.',
  },
  {
    n: '03',
    icon: Activity,
    title: 'You run it.',
    body: "Workflows run themselves. You see what's happening. Risk gets caught early. Decisions get easier. The business starts working the way you always thought it should.",
  },
]

const sectionRef = ref<HTMLElement | null>(null)
const drawn = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (reduced || !sectionRef.value || typeof IntersectionObserver === 'undefined') {
    drawn.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          drawn.value = true
          observer?.disconnect()
          break
        }
      }
    },
    { threshold: 0.25 },
  )
  observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())

const connectorPath =
  'M 60 39 L 188 39 C 320 -21, 480 99, 600 39 C 720 -21, 880 99, 1012 39 L 1140 39'
</script>

<template>
  <section
    id="plan"
    ref="sectionRef"
    class="relative py-28 md:py-36 overflow-hidden bg-gradient-to-b from-white via-cyan-brand/[0.05] to-white"
  >
    <div class="absolute inset-0 grid-bg fade-mask pointer-events-none" aria-hidden="true" />
    <div
      class="absolute top-8 left-1/2 -translate-x-1/2 h-[440px] w-[820px] rounded-full bg-cyan-brand/20 blur-[120px] pointer-events-none"
      aria-hidden="true"
    />
    <div
      class="absolute -bottom-24 right-[-12%] h-[340px] w-[460px] rounded-full bg-cyan-brand/15 blur-3xl pointer-events-none"
      aria-hidden="true"
    />
    <div
      class="absolute -top-20 left-[-10%] h-[300px] w-[380px] rounded-full bg-cyan-brand/10 blur-3xl pointer-events-none"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
      <div v-reveal class="max-w-3xl">
        <div class="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          <span class="dot" />
          The Plan
        </div>
        <h2
          class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.07] tracking-tight text-ink"
        >
          Three steps to a business that
          <span class="cyan-underline">runs the way it should.</span>
        </h2>
        <p class="mt-7 max-w-2xl text-[17px] md:text-[18.5px] leading-[1.7] text-mute">
          A simple, intentional path. From sitting beside you, to building the system, to watching it
          quietly do its job, every day.
        </p>
      </div>

      <div class="relative mt-24 md:mt-28">
        <svg
          class="hidden md:block absolute left-0 right-0 -top-2 w-full h-28 pointer-events-none"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="plan-line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#01DBF1" stop-opacity="0" />
              <stop offset="12%" stop-color="#01DBF1" stop-opacity="1" />
              <stop offset="50%" stop-color="#00b8cc" stop-opacity="1" />
              <stop offset="88%" stop-color="#01DBF1" stop-opacity="1" />
              <stop offset="100%" stop-color="#01DBF1" stop-opacity="0" />
            </linearGradient>
            <filter id="plan-dot-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            :d="connectorPath"
            fill="none"
            stroke="rgba(1, 219, 241, 0.15)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-dasharray="6 8"
          />

          <path
            :d="connectorPath"
            fill="none"
            stroke="url(#plan-line-grad)"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-dasharray="1300"
            :stroke-dashoffset="drawn ? 0 : 1300"
            class="plan-line"
          />

          <circle
            v-if="drawn"
            r="5"
            fill="#01DBF1"
            filter="url(#plan-dot-glow)"
          >
            <animateMotion dur="4.5s" repeatCount="indefinite" :path="connectorPath" />
          </circle>
          <circle
            v-if="drawn"
            r="3"
            fill="#ffffff"
            opacity="0.95"
          >
            <animateMotion dur="4.5s" repeatCount="indefinite" :path="connectorPath" />
          </circle>
        </svg>

        <div
          class="md:hidden absolute left-[27px] top-2 bottom-2 w-px overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-brand/45 to-transparent" />
          <div v-if="drawn" class="plan-mobile-trail" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
          <div
            v-for="(s, i) in steps"
            :key="s.n"
            v-reveal:up="220 + i * 180"
            class="group relative pl-20 md:pl-0 md:pt-16 md:text-center"
          >
            <div
              :class="[
                'plan-badge',
                'md:left-1/2 md:-translate-x-1/2 md:top-0 left-0 top-0',
              ]"
            >
              <span class="plan-badge__ring" />
              <span class="plan-badge__inner">
                <span class="font-display text-[22px] leading-none">{{ s.n }}</span>
              </span>
            </div>

            <div
              class="relative rounded-2xl border border-line bg-white/95 backdrop-blur-sm p-7 md:p-8 md:pt-12 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.2)] transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:border-cyan-brand/45 group-hover:shadow-[0_30px_70px_-25px_rgba(1,219,241,0.45)]"
            >
              <div class="md:flex md:justify-center">
                <div
                  class="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-brand/20 to-cyan-brand/5 text-cyan-brand-deep ring-1 ring-cyan-brand/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                >
                  <component :is="s.icon" :size="22" />
                </div>
              </div>
              <h3 class="mt-6 font-display text-[26px] md:text-[28px] leading-[1.15] text-ink">
                {{ s.title }}
              </h3>
              <p class="mt-3.5 text-[16px] lg:text-[15.5px] leading-[1.7] text-mute">{{ s.body }}</p>

              <div class="mt-6 flex items-center md:justify-center gap-1.5">
                <span
                  v-for="d in 3"
                  :key="d"
                  :class="[
                    'h-1 rounded-full transition-all duration-500',
                    d <= i + 1 ? 'bg-cyan-brand w-6' : 'bg-line w-3',
                  ]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.plan-line {
  transition: stroke-dashoffset 2.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.plan-badge {
  position: absolute;
  width: 56px;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.plan-badge__ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: conic-gradient(
    from 0deg,
    #01DBF1 0deg,
    #00b8cc 120deg,
    rgba(1, 219, 241, 0.25) 240deg,
    #01DBF1 360deg
  );
  animation: plan-badge-spin 5s linear infinite;
  filter: drop-shadow(0 10px 22px rgba(1, 219, 241, 0.4));
}
.plan-badge__ring::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  background: rgba(1, 219, 241, 0.18);
  filter: blur(10px);
  z-index: -1;
}
.plan-badge__inner {
  position: relative;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  border-radius: 9999px;
  background: #ffffff;
  color: var(--color-cyan-brand-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8);
}

@keyframes plan-badge-spin {
  to { transform: rotate(360deg); }
}

.plan-mobile-trail {
  position: absolute;
  left: -3px;
  top: 0;
  width: 7px;
  height: 56px;
  border-radius: 9999px;
  background: linear-gradient(
    to bottom,
    rgba(1, 219, 241, 0) 0%,
    rgba(1, 219, 241, 0.95) 50%,
    rgba(1, 219, 241, 0) 100%
  );
  box-shadow: 0 0 16px rgba(1, 219, 241, 0.7);
  animation: plan-mobile-trail-flow 3.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes plan-mobile-trail-flow {
  0% { transform: translateY(-60px); opacity: 0; }
  12% { opacity: 1; }
  88% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .plan-badge__ring { animation: none !important; }
  .plan-line { transition: none !important; }
  .plan-mobile-trail { display: none !important; }
}
</style>
