<script setup lang="ts">
import { ArrowLeft, ArrowRight, BarChart3, Radar, ShieldCheck, Workflow } from '@lucide/vue'

const hubs = [
  {
    href: '/what-we-build/bespoke-systems',
    icon: ArrowRight,
    title: 'Bespoke vs off-the-shelf',
    body: 'The thesis: when a system built around your workflow beats a product you bend to fit.',
  },
  {
    href: '/what-we-build/automation',
    icon: Workflow,
    title: 'Automation',
    body: 'Hand the repetitive, rule-based work to software, so your people do only what needs a human.',
  },
  {
    href: '/what-we-build/audit-trails',
    icon: ShieldCheck,
    title: 'Audit Trails',
    body: 'Who did what, when and why, captured as work happens. POPIA, FAIS and SARB-ready.',
  },
  {
    href: '/what-we-build/anomaly-detection',
    icon: Radar,
    title: 'Anomaly Detection',
    body: 'Catch the fraud, error and drift hiding inside an ocean of normal activity, before it costs you.',
  },
  {
    href: '/what-we-build/analytics',
    icon: BarChart3,
    title: 'Analytics',
    body: 'Turn the data you already have into the decisions each role actually makes.',
  },
]

// Per-page SEO (S02 standard): full title/description/canonical/OG/Twitter. The
// bare title gets the global " · Zabble" suffix from titleTemplate.
usePageSeo({
  title: 'What We Build',
  description:
    'Zabble builds bespoke operational systems across four pillars, automation, audit trails, anomaly detection and analytics, for South African businesses.',
  path: '/what-we-build',
  ogType: 'website',
})
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />
    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-24">
      <div class="mx-auto max-w-5xl px-5 md:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" class="mb-8">
          <NuxtLink to="/#home" class="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-mute hover:text-ink transition-colors">
            <ArrowLeft :size="14" :stroke-width="2" aria-hidden="true" />
            Home
          </NuxtLink>
        </nav>

        <header class="max-w-2xl">
          <div class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            <span class="dot" />
            What We Build
          </div>
          <h1 class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[54px] leading-[1.07] tracking-tight text-ink">
            Four things every modern business needs. <span class="cyan-underline">We build them around yours.</span>
          </h1>
        </header>

        <!-- Answer-first definition (AEO/GEO entity copy) -->
        <div class="mt-8 max-w-2xl rounded-2xl border border-cyan-brand/30 bg-cyan-brand/[0.04] p-5 md:p-6" data-answer-first>
          <div class="text-[11px] uppercase tracking-[0.2em] text-cyan-brand-deep font-semibold">In short</div>
          <p class="mt-2.5 text-[16.5px] md:text-[17px] leading-[1.6] text-ink font-medium">
            Zabble is a South African firm that builds bespoke operational systems, automation, audit trails,
            anomaly detection and analytics, shaped around the single problem slowing a specific business down.
            We don't sell software. We assemble the system your business actually needs, from a library of modules,
            and you run it.
          </p>
        </div>

        <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="h in hubs"
            :key="h.href"
            :to="h.href"
            class="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-cyan-brand/50 hover:shadow-[0_24px_60px_-32px_rgba(1,219,241,0.5)]"
          >
            <span class="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-cyan-brand/10 text-cyan-brand-deep ring-1 ring-cyan-brand/25">
              <component :is="h.icon" :size="20" />
            </span>
            <h2 class="mt-5 font-display text-[24px] leading-tight text-ink">{{ h.title }}</h2>
            <p class="mt-2.5 flex-1 text-[14.5px] leading-[1.55] text-mute">{{ h.body }}</p>
            <span class="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink">
              Explore
              <ArrowRight :size="15" class="text-cyan-brand-deep transition group-hover:translate-x-0.5" />
            </span>
          </NuxtLink>
        </div>

        <div class="mt-10">
          <NuxtLink to="/systems" class="inline-flex items-center gap-2 text-[15px] font-semibold text-ink hover:text-cyan-brand-deep transition-colors">
            See all 30 systems
            <ArrowRight :size="16" class="text-cyan-brand-deep" />
          </NuxtLink>
        </div>
      </div>
    </main>
    <CtaStrip eyebrow="Next step" heading="Not sure which system you need?" body="The two-minute diagnose flow finds your most expensive operational problem." />
    <TheFooter />
  </div>
</template>
