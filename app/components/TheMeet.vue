<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

const industries = [
  'NGOs',
  'Banks',
  'Hotels',
  'Law firms',
  'Parts suppliers',
  'Marketing agencies',
  'Small businesses',
]
</script>

<template>
  <section id="meet" class="relative py-28 md:py-36">
    <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
      <div v-reveal class="max-w-4xl">
        <div class="text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
          Meet Zabble
        </div>
        <h2
          class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.07] tracking-tight text-ink"
        >
          We don't sell software. We build the
          <span class="cyan-underline">system your business actually needs.</span>
        </h2>
      </div>

      <div class="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div v-reveal:left="100" class="lg:col-span-7 space-y-6 text-[17px] md:text-[18px] leading-[1.7] text-mute">
          <p>
            We build bespoke operational systems for businesses that have outgrown off-the-shelf tools.
            We've worked with NGOs, banks, hotels, law firms, parts suppliers, marketing agencies, and
            small businesses.
          </p>
          <p>
            The industries differ. The pattern doesn't:
            <span class="text-ink font-medium">
              every business has one operational problem that costs more than the rest combined.
            </span>
            Our job is to find it. And build the exact system that fixes it.
          </p>
          <p class="text-ink font-medium">
            We sit with your business until we understand it. Then we build what only your business
            needs.
          </p>

          <div class="pt-3">
            <a
              href="#contact"
              class="group inline-flex items-center gap-2 py-3 lg:py-0 text-[16px] lg:text-[15.5px] font-semibold text-ink"
            >
              <span class="border-b border-cyan-brand/60 group-hover:border-cyan-brand pb-1">
                Start a conversation
              </span>
              <ArrowRight :size="16" class="text-cyan-brand-deep transition group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div v-reveal:right="200" class="lg:col-span-5">
          <div class="rounded-2xl border border-line bg-white p-6 md:p-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.18)]">
            <div class="flex items-center justify-between">
              <div class="text-[12px] uppercase tracking-[0.2em] text-mute-2 font-semibold">
                How it works
              </div>
              <div class="flex items-center gap-1.5 text-[12.5px] text-mute-2">
                <span class="h-1.5 w-1.5 rounded-full bg-cyan-brand animate-pulse" />
                Live
              </div>
            </div>

            <div class="mt-4 rounded-xl bg-gradient-to-br from-cyan-brand/8 via-surface-alt to-cyan-brand/5 ring-1 ring-line p-4 md:p-5">
              <CpuArchitecture text="OPS" class="text-slate-400" />
            </div>

            <p class="mt-5 text-[16px] lg:text-[15px] leading-[1.7] text-ink">
              <span class="font-semibold">Your workflows flow through one system.</span>
              <span class="text-mute">
                Inputs from every corner of your business, captured, automated, audited, and
                analysed by infrastructure built only for you.
              </span>
            </p>

            <div class="mt-6 pt-6 border-t border-line">
              <div class="text-[12px] uppercase tracking-[0.2em] text-mute-2 font-semibold">
                Industries we've served
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="i in industries"
                  :key="i"
                  class="inline-flex items-center rounded-full border border-line bg-surface-alt px-3.5 py-1.5 text-[13px] text-ink"
                >
                  {{ i }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
