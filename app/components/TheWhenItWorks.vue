<script setup lang="ts">
import { BarChart3, Radar, ShieldCheck, Sparkles, Workflow } from '@lucide/vue'

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
  <section class="wiw-section lazy-section relative py-32 md:py-40 overflow-hidden">
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
            class="win-card win-card--finale group relative rounded-[1.75rem] overflow-hidden p-10 md:p-16 text-center"
          >
            <span class="finale-topline" aria-hidden="true" />
            <div
              class="absolute -top-28 left-1/2 -translate-x-1/2 h-[360px] w-[720px] rounded-full bg-cyan-brand/10 blur-[110px] pointer-events-none"
              aria-hidden="true"
            />

            <div class="relative flex flex-col items-center">
              <span class="finale-icon">
                <Sparkles :size="28" :stroke-width="1.75" />
              </span>
              <div
                class="mt-8 inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.24em] text-cyan-brand-deep font-semibold"
              >
                <span class="finale-rule" aria-hidden="true" />
                {{ finale.eyebrow }}
                <span class="finale-rule" aria-hidden="true" />
              </div>
              <p
                class="mt-6 font-display text-[27px] sm:text-[34px] md:text-[40px] leading-[1.18] text-ink max-w-3xl text-center text-balance"
              >
                {{ finale.text }}
                <span class="block mt-2.5">
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
.win-card--finale {
  background:
    radial-gradient(
      120% 120% at 50% -10%,
      rgba(1, 219, 241, 0.07) 0%,
      rgba(246, 248, 251, 0) 55%
    ),
    linear-gradient(180deg, #ffffff 0%, #fbfdfe 100%);
  border: 1px solid rgba(1, 219, 241, 0.18);
  box-shadow:
    0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
    0 28px 60px -34px rgba(10, 15, 26, 0.28),
    0 10px 24px -18px rgba(1, 219, 241, 0.22);
}
.win-card--finale:hover {
  transform: translateY(-4px);
  border-color: rgba(1, 219, 241, 0.4);
  box-shadow:
    0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
    0 40px 80px -34px rgba(10, 15, 26, 0.32),
    0 18px 44px -22px rgba(1, 219, 241, 0.34);
}

/* Hairline gradient accent across the top edge */
.finale-topline {
  position: absolute;
  top: 0;
  left: 12%;
  right: 12%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(1, 219, 241, 0.55) 30%,
    rgba(1, 219, 241, 0.7) 50%,
    rgba(1, 219, 241, 0.55) 70%,
    transparent
  );
  pointer-events: none;
}

/* Short decorative rules flanking the eyebrow */
.finale-rule {
  display: inline-block;
  height: 1px;
  width: 1.75rem;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 184, 204, 0.5)
  );
}
.finale-rule:last-of-type {
  background: linear-gradient(90deg, rgba(0, 184, 204, 0.5), transparent);
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
  position: relative;
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
  transition:
    transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 480ms ease;
}
/* Soft halo ring around the finale icon */
.finale-icon::before {
  content: '';
  position: absolute;
  inset: -7px;
  border-radius: inherit;
  border: 1px solid rgba(1, 219, 241, 0.22);
  background: radial-gradient(
    closest-side,
    rgba(1, 219, 241, 0.12),
    transparent
  );
  pointer-events: none;
}
.win-card--finale:hover .finale-icon {
  transform: scale(1.05);
  box-shadow:
    0 24px 50px -16px rgba(1, 219, 241, 0.6),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
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
  .win-icon,
  .finale-icon {
    transition: none !important;
  }
}
</style>
