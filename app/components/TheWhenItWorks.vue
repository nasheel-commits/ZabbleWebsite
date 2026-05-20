<script setup lang="ts">
import {
  Workflow,
  ShieldCheck,
  Radar,
  BarChart3,
  Sparkles,
} from '@lucide/vue'

const wins = [
  {
    icon: Workflow,
    text: 'The workflow that used to take three people now runs itself.',
    detail: 'Automation, fully on.',
  },
  {
    icon: ShieldCheck,
    text: 'Every transaction, action, and decision leaves a trail.',
    detail: null,
  },
  {
    icon: Radar,
    text: 'Problems get flagged before they cost you anything.',
    detail: null,
  },
  {
    icon: BarChart3,
    text: 'You walk into every meeting with the numbers you need.',
    detail: 'One source of truth.',
  },
]

const finale = {
  icon: Sparkles,
  eyebrow: 'The compound effect',
  text: 'And the time you used to spend holding things together?',
  highlight: 'You get it back.',
}
</script>

<template>
  <section class="wiw-section relative py-32 md:py-40 overflow-hidden">
    <div class="relative mx-auto max-w-5xl px-5 md:px-8 lg:px-12">
      <div v-reveal class="max-w-3xl">
        <div
          class="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
        >
          <span class="dot" />
          What It Looks Like When It Works
        </div>
        <h2
          class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.07] tracking-tight text-ink"
        >
          Picture your business
          <span class="cyan-underline">six months from now.</span>
        </h2>
        <p
          class="mt-7 text-[17px] md:text-[18.5px] leading-[1.7] text-mute max-w-2xl"
        >
          Quieter operations. A clearer head. Decisions made on facts, not guesses. And time to spend on the work only you can do.
        </p>
      </div>

      <div class="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
        <div
          v-for="(w, i) in wins"
          :key="w.text"
          v-reveal:scale="100 + i * 110"
          class="block"
        >
          <article
            class="win-card group h-full rounded-2xl border border-line/80 bg-white p-8 md:p-9"
          >
            <div class="flex items-start gap-5">
              <span class="win-icon shrink-0">
                <component :is="w.icon" :size="22" :stroke-width="1.75" />
              </span>
              <div class="flex-1 min-w-0">
                <p
                  class="text-[17px] md:text-[18px] text-ink leading-[1.55] font-semibold tracking-[-0.005em]"
                >
                  {{ w.text }}
                </p>
                <p
                  v-if="w.detail"
                  class="mt-3 text-[16px] lg:text-[14.5px] text-cyan-brand-deep italic leading-[1.6]"
                >
                  {{ w.detail }}
                </p>
              </div>
            </div>
          </article>
        </div>

        <div v-reveal:scale="540" class="block md:col-span-2">
          <article
            class="win-card win-card--finale group relative rounded-2xl border border-cyan-brand/20 bg-white overflow-hidden p-10 md:p-14 text-center"
          >
            <div
              class="absolute -top-24 left-1/2 -translate-x-1/2 h-[320px] w-[640px] rounded-full bg-cyan-brand/10 blur-[100px] pointer-events-none"
              aria-hidden="true"
            />

            <div class="relative flex flex-col items-center">
              <span class="finale-icon">
                <Sparkles :size="28" :stroke-width="1.75" />
              </span>
              <div
                class="mt-7 inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep/80 font-semibold"
              >
                <Sparkles :size="13" :stroke-width="2" />
                {{ finale.eyebrow }}
              </div>
              <p
                class="mt-5 font-display text-[26px] sm:text-[32px] md:text-[38px] leading-[1.2] text-ink max-w-3xl text-center"
              >
                {{ finale.text }}
                <span class="block mt-2">
                  <span class="wiw-highlight">{{ finale.highlight }}</span>
                </span>
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.win-card {
  transition:
    transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 480ms ease,
    background-color 480ms ease,
    box-shadow 480ms ease;
}
.win-card:hover {
  transform: translateY(-3px);
  border-color: rgba(1, 219, 241, 0.35);
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0 24px 50px -28px rgba(1, 219, 241, 0.25);
}
.win-card--finale:hover {
  transform: translateY(-3px);
  border-color: rgba(1, 219, 241, 0.45);
  box-shadow: 0 30px 70px -28px rgba(1, 219, 241, 0.3);
}

.win-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 0.875rem;
  background: linear-gradient(
    135deg,
    rgba(1, 219, 241, 0.12),
    rgba(0, 184, 204, 0.04)
  );
  color: var(--color-cyan-brand-deep);
  box-shadow: inset 0 0 0 1px rgba(1, 219, 241, 0.18);
  transition:
    transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 480ms ease;
}
.win-card:hover .win-icon {
  transform: scale(1.04);
  box-shadow:
    inset 0 0 0 1px rgba(1, 219, 241, 0.35),
    0 8px 24px -10px rgba(1, 219, 241, 0.4);
}

.finale-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 3.5rem;
  width: 3.5rem;
  border-radius: 1.125rem;
  background: linear-gradient(135deg, #01dbf1, #00b8cc);
  color: var(--color-ink);
  box-shadow:
    0 18px 40px -15px rgba(1, 219, 241, 0.5),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.45);
}

.wiw-highlight {
  background: linear-gradient(
    135deg,
    #01dbf1 0%,
    #00b8cc 30%,
    #7feefb 50%,
    #00b8cc 70%,
    #01dbf1 100%
  );
  background-size: 260% 100%;
  background-position: 0% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-style: italic;
  animation: wiw-highlight-shimmer 7s ease-in-out infinite;
}
@keyframes wiw-highlight-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wiw-highlight {
    animation: none !important;
  }
  .win-card,
  .win-icon {
    transition: none !important;
  }
}
</style>
