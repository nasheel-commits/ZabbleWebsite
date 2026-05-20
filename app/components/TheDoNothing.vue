<script setup lang="ts">
import {
  TrendingDown,
  Flame,
  HelpCircle,
  BatteryLow,
  CloudLightning,
  ArrowRight,
  AlertTriangle,
} from '@lucide/vue'

const costs = [
  {
    icon: TrendingDown,
    text: 'Manual work keeps draining time and money.',
    impact: 'And it grows every quarter.',
  },
  {
    icon: Flame,
    text: 'Risk grows quietly as you scale.',
    impact: "Until one day, it doesn't.",
  },
  {
    icon: HelpCircle,
    text: 'Decisions stay guesswork.',
    impact: 'And the wrong calls compound.',
  },
  {
    icon: BatteryLow,
    text: 'Your team burns out doing work software should do.',
    impact: 'Your best people leave first.',
  },
]

const finale = {
  icon: CloudLightning,
  text: "The problems you can't see today become the crises you can't ignore tomorrow.",
  impact: 'And tomorrow always comes faster than you think.',
}
</script>

<template>
  <section
    class="cow-section relative py-24 md:py-32 lg:py-36 bg-surface-alt/60 border-y border-line/70"
  >
    <div class="relative mx-auto max-w-6xl px-5 md:px-8 lg:px-12">
      <div v-reveal class="max-w-3xl">
        <div
          class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
        >
          <span class="dot" />
          The Cost of Waiting
        </div>
        <h2
          class="mt-5 md:mt-6 font-display text-[34px] sm:text-[44px] md:text-[54px] leading-[1.08] tracking-tight text-ink"
        >
          Doing nothing has a cost.
          <span class="block mt-2 text-mute">
            Most businesses just don't have a number for it yet.
          </span>
        </h2>
        <p class="mt-6 md:mt-7 text-[16px] md:text-[17px] text-ink leading-[1.7] font-semibold">If nothing changes:</p>
      </div>

      <ul class="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        <li
          v-for="(c, i) in costs"
          :key="c.text"
          v-reveal:scale="i * 90"
          class="block"
        >
          <div
            class="pain-card group relative h-full rounded-2xl border border-line bg-white p-6 md:p-7 overflow-hidden"
          >
            <div class="flex items-start gap-4 md:gap-5">
              <span
                class="pain-icon shrink-0 inline-flex items-center justify-center h-11 w-11 md:h-12 md:w-12 rounded-xl bg-surface-alt text-red-600 ring-1 ring-red-100"
              >
                <component :is="c.icon" :size="20" :stroke-width="1.9" />
              </span>
              <div class="flex-1 min-w-0">
                <p
                  class="text-[16.5px] md:text-[17.5px] font-semibold text-ink leading-[1.45]"
                >
                  {{ c.text }}
                </p>
                <p
                  class="pain-card__impact mt-2.5 text-[16px] lg:text-[14.5px] text-mute font-medium italic leading-[1.5]"
                >
                  {{ c.impact }}
                </p>
              </div>
            </div>
          </div>
        </li>

        <li v-reveal:scale="360" class="block md:col-span-2">
          <div
            class="pain-card pain-card--finale group relative rounded-2xl border border-line bg-white overflow-hidden"
          >
            <div
              class="absolute inset-y-0 left-0 w-1 bg-ink"
              aria-hidden="true"
            />

            <div
              class="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8 p-6 md:p-10 pl-7 md:pl-12"
            >
              <span
                class="pain-icon shrink-0 inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100"
              >
                <component :is="finale.icon" :size="24" :stroke-width="1.9" />
              </span>

              <div class="flex-1 min-w-0">
                <div
                  class="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.22em] text-red-600 font-semibold mb-2"
                >
                  <AlertTriangle :size="13" :stroke-width="2.2" />
                  The one that hurts most
                </div>
                <p
                  class="font-display text-[22px] sm:text-[26px] md:text-[30px] leading-[1.2] text-ink"
                >
                  {{ finale.text }}
                </p>
                <p
                  class="mt-3 text-[16px] lg:text-[15.5px] text-ink-soft font-medium italic leading-[1.5]"
                >
                  {{ finale.impact }}
                </p>
              </div>

              <NuxtLink
                to="/diagnose"
                class="cow-finale-cta group shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[14.5px] font-semibold px-5 py-3 transition"
              >
                Find yours
                <ArrowRight :size="16" class="transition group-hover:translate-x-0.5" />
              </NuxtLink>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.pain-card {
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pain-card:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 23, 42, 0.18);
  box-shadow:
    0 24px 50px -28px rgba(15, 23, 42, 0.22),
    0 6px 14px -8px rgba(15, 23, 42, 0.08);
}
.pain-card--finale:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 23, 42, 0.22);
  box-shadow:
    0 30px 60px -28px rgba(15, 23, 42, 0.25),
    0 8px 18px -8px rgba(15, 23, 42, 0.08);
}

.pain-icon {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pain-card:hover .pain-icon {
  transform: scale(1.04);
}

.pain-card__impact {
  position: relative;
  padding-left: 14px;
}
.pain-card__impact::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  background: rgb(220, 38, 38);
}

@media (prefers-reduced-motion: reduce) {
  .pain-card,
  .pain-card .pain-icon {
    transition: none !important;
  }
}
</style>
