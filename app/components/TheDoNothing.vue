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
    class="cow-section relative py-28 md:py-36 bg-surface-alt/70 border-y border-line/70 overflow-hidden"
  >
    <div class="cow-warning-stripe absolute inset-x-0 top-0 h-[3px] pointer-events-none" aria-hidden="true" />

    <div
      class="absolute -top-32 right-[-10%] h-[440px] w-[560px] rounded-full bg-red-500/[0.06] blur-[120px] pointer-events-none cow-blob cow-blob--1"
      aria-hidden="true"
    />
    <div
      class="absolute -bottom-28 left-[-8%] h-[380px] w-[480px] rounded-full bg-orange-500/[0.05] blur-[110px] pointer-events-none cow-blob cow-blob--2"
      aria-hidden="true"
    />
    <div
      class="absolute top-1/3 left-1/2 -translate-x-1/2 h-[260px] w-[640px] rounded-full bg-red-500/[0.04] blur-[100px] pointer-events-none"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-6xl px-5 md:px-8 lg:px-12">
      <div v-reveal class="max-w-3xl">
        <div
          class="inline-flex items-center gap-2.5 rounded-full bg-red-50 border border-red-100 px-3.5 py-1.5 text-[12.5px] uppercase tracking-[0.2em] text-red-600 font-semibold"
        >
          <span class="cow-warning-dot" aria-hidden="true" />
          The Cost of Waiting
        </div>
        <h2
          class="mt-6 font-display text-[36px] sm:text-[44px] md:text-[54px] leading-[1.08] tracking-tight text-ink"
        >
          Doing nothing has a cost.
          <span class="block mt-2 text-mute">
            Most businesses just don't have a number for it yet.
          </span>
        </h2>
        <p class="mt-7 text-[17px] text-ink leading-[1.7] font-semibold">If nothing changes:</p>
      </div>

      <ul class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        <li
          v-for="(c, i) in costs"
          :key="c.text"
          v-reveal:scale="i * 90"
          class="block"
        >
          <div
            class="pain-card group relative h-full rounded-2xl border border-line bg-white p-7 md:p-7 overflow-hidden"
          >
            <div
              class="pain-card__top-stripe absolute inset-x-0 top-0 h-[3px]"
              aria-hidden="true"
            />

            <div class="flex items-start gap-5">
              <span
                class="pain-icon relative shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-xl bg-red-50 text-red-500 ring-1 ring-red-100"
              >
                <span class="pain-icon__pulse" aria-hidden="true" />
                <span class="pain-icon__pulse pain-icon__pulse--delayed" aria-hidden="true" />
                <component :is="c.icon" :size="22" :stroke-width="2" class="relative z-10" />
              </span>
              <div class="flex-1 min-w-0">
                <p
                  class="text-[16.5px] md:text-[17.5px] font-semibold text-ink leading-[1.45]"
                >
                  {{ c.text }}
                </p>
                <p
                  class="pain-card__impact mt-2.5 text-[16px] lg:text-[14.5px] text-red-600 font-medium italic leading-[1.5]"
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
              class="absolute inset-0 bg-gradient-to-br from-red-500/[0.04] via-transparent to-orange-500/[0.06] pointer-events-none"
              aria-hidden="true"
            />
            <div
              class="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-red-500 via-red-500 to-orange-500"
              aria-hidden="true"
            />
            <div
              class="absolute -right-20 -top-20 h-[260px] w-[260px] rounded-full bg-red-500/10 blur-[80px] pointer-events-none"
              aria-hidden="true"
            />

            <div
              class="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-8 p-7 md:p-10 pl-8 md:pl-12"
            >
              <span
                class="pain-icon shrink-0 relative inline-flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-[0_18px_40px_-12px_rgba(239,68,68,0.5)]"
              >
                <span class="pain-icon__pulse pain-icon__pulse--finale" aria-hidden="true" />
                <span
                  class="pain-icon__pulse pain-icon__pulse--finale pain-icon__pulse--delayed"
                  aria-hidden="true"
                />
                <component :is="finale.icon" :size="28" :stroke-width="2" class="relative z-10" />
              </span>

              <div class="flex-1 min-w-0">
                <div
                  class="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.22em] text-red-600 font-semibold mb-2"
                >
                  <AlertTriangle :size="13" :stroke-width="2.4" />
                  The one that hurts most
                </div>
                <p
                  class="font-display text-[22px] sm:text-[26px] md:text-[30px] leading-[1.2] text-ink"
                >
                  {{ finale.text }}
                </p>
                <p
                  class="mt-3 text-[16px] lg:text-[15.5px] text-red-600 font-semibold italic leading-[1.5]"
                >
                  {{ finale.impact }}
                </p>
              </div>

              <NuxtLink
                to="/diagnose"
                class="cow-finale-cta group shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-ink hover:bg-ink-soft text-white text-[14.5px] font-semibold pl-5 pr-4 py-3.5 transition shadow-[0_18px_40px_-12px_rgba(15,23,42,0.35)]"
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
.cow-warning-stripe {
  background: repeating-linear-gradient(
    -45deg,
    rgba(239, 68, 68, 0.55),
    rgba(239, 68, 68, 0.55) 10px,
    rgba(239, 68, 68, 0) 10px,
    rgba(239, 68, 68, 0) 20px
  );
  opacity: 0.5;
}

.cow-warning-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: rgb(239, 68, 68);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.18);
  animation: cow-dot-pulse 1.6s ease-in-out infinite;
}
@keyframes cow-dot-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.18);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 7px rgba(239, 68, 68, 0.32);
    transform: scale(1.05);
  }
}

.cow-blob--1 {
  animation: cow-blob-1 18s ease-in-out infinite;
}
.cow-blob--2 {
  animation: cow-blob-2 22s ease-in-out infinite;
}
@keyframes cow-blob-1 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-22px, 14px, 0) scale(1.04);
  }
}
@keyframes cow-blob-2 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(18px, -16px, 0) scale(0.96);
  }
}

.pain-card {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pain-card:hover {
  transform: translateY(-3px);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow:
    0 28px 55px -24px rgba(239, 68, 68, 0.28),
    0 6px 14px -6px rgba(15, 23, 42, 0.06);
}
.pain-card--finale:hover {
  transform: translateY(-3px);
  border-color: rgba(239, 68, 68, 0.45);
  box-shadow:
    0 32px 70px -25px rgba(239, 68, 68, 0.32),
    0 8px 18px -6px rgba(15, 23, 42, 0.08);
}

.pain-card__top-stripe {
  background: linear-gradient(
    90deg,
    rgba(239, 68, 68, 0) 0%,
    rgba(239, 68, 68, 0.55) 30%,
    rgba(249, 115, 22, 0.7) 50%,
    rgba(239, 68, 68, 0.55) 70%,
    rgba(239, 68, 68, 0) 100%
  );
  opacity: 0.55;
  transition: opacity 280ms ease;
}
.pain-card:hover .pain-card__top-stripe {
  opacity: 1;
}

.pain-icon {
  isolation: isolate;
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pain-card:hover .pain-icon {
  transform: scale(1.06) rotate(-2deg);
}
.pain-card--finale:hover .pain-icon {
  transform: scale(1.05) rotate(-3deg);
}

.pain-icon__pulse {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(239, 68, 68, 0.32);
  animation: pain-pulse 2.6s ease-out infinite;
  z-index: 0;
  pointer-events: none;
}
.pain-icon__pulse--delayed {
  animation-delay: 1.3s;
}
.pain-icon__pulse--finale {
  background: rgba(239, 68, 68, 0.5);
}

@keyframes pain-pulse {
  0% {
    transform: scale(0.85);
    opacity: 0.85;
  }
  80% {
    opacity: 0;
  }
  100% {
    transform: scale(1.7);
    opacity: 0;
  }
}

.pain-card__impact {
  position: relative;
  padding-left: 14px;
}
.pain-card__impact::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.45em;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgb(239, 68, 68);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
}

@media (prefers-reduced-motion: reduce) {
  .cow-warning-dot,
  .cow-blob--1,
  .cow-blob--2,
  .pain-icon__pulse {
    animation: none !important;
  }
  .pain-card,
  .pain-card .pain-icon,
  .pain-card__top-stripe {
    transition: none !important;
  }
}
</style>
