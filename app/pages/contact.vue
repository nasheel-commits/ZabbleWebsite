<script setup lang="ts">
import { ArrowRight, Mail } from '@lucide/vue'

usePageSeo({
  title: 'Contact Zabble',
  description:
    'Talk to Zabble about a bespoke system for your South African business. The first conversation is free. Email sales@zabble.org or book a call.',
  path: '/contact',
  ogType: 'website',
  primaryKeyword: 'zabble contact',
})
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <section class="mx-auto max-w-3xl px-5 md:px-8 lg:px-12">
        <div v-reveal>
          <div class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            Contact
          </div>
          <h1 class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[60px] leading-[1.05] tracking-tight text-ink">
            Talk to Zabble.
          </h1>
          <p data-answer-first class="mt-6 text-[16px] md:text-[18px] leading-[1.6] text-ink">
            Zabble is a bespoke systems firm based in South Africa. The first conversation is free and useful either way: we listen for the operational problem costing you the most and tell you honestly whether a system can fix it. Reach us at sales@zabble.org or run the two-minute diagnostic.
          </p>
        </div>

        <div class="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          <NuxtLink
            to="/diagnose"
            class="group rounded-2xl border border-line bg-white p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-brand/40 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60"
          >
            <div class="font-display text-[20px] text-ink">Run the 2-minute diagnostic</div>
            <p class="mt-2 text-[14.5px] leading-[1.55] text-mute">
              Find the operational problem costing you the most, and the kind of system that fixes it. No sign-up to see the result.
            </p>
            <span class="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
              Start the diagnostic
              <ArrowRight :size="15" class="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </NuxtLink>

          <a
            href="mailto:sales@zabble.org"
            class="group rounded-2xl border border-line bg-white p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-brand/40 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)]"
          >
            <div class="font-display text-[20px] text-ink">Email us directly</div>
            <p class="mt-2 text-[14.5px] leading-[1.55] text-mute">
              Prefer email? Tell us what’s slowing your operations down and we’ll take it from there.
            </p>
            <span class="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
              <Mail :size="15" class="text-mute" />
              sales@zabble.org
            </span>
          </a>
        </div>

        <p class="mt-8 text-[13.5px] text-mute-2">
          Zabble · Bespoke operational systems · South Africa
        </p>
      </section>
    </main>

    <TheFooter />
  </div>
</template>
