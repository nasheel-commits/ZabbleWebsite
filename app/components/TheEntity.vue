<script setup lang="ts">
import { MapPin, Mail, Globe, Building2 } from '@lucide/vue'
import { ORGANIZATION } from '~/data/organization'

// On-site entity-disambiguation section (GEO finding F2). Makes the Zabble entity
// explicit and unambiguous for both readers and generative engines: who Zabble is,
// where it is, and that it is distinct from the US homonym "Zabble, Inc."
const facts = [
  { icon: Building2, label: 'What', value: 'Operations-systems consultancy' },
  { icon: MapPin, label: 'Where', value: 'South Africa' },
  { icon: Mail, label: 'Contact', value: ORGANIZATION.email, href: `mailto:${ORGANIZATION.email}` },
  // Self-reference to the homepage — kept relative so it isn't flagged as an
  // absolute internal link (nuxt-link-checker absolute-site-urls).
  { icon: Globe, label: 'Web', value: 'zabble.org', href: '/' },
]
</script>

<template>
  <section id="who-we-are" class="relative py-24 md:py-32 lg:py-36 bg-white">
    <div class="relative mx-auto max-w-6xl px-5 md:px-8 lg:px-12">
      <div v-reveal class="max-w-3xl">
        <div
          class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
        >
          <span
            class="inline-block h-1.5 w-1.5 rounded-full bg-cyan-brand shadow-[0_0_0_4px_rgba(1,219,241,0.15)]"
            aria-hidden="true"
          />
          Who We Are
        </div>

        <h2
          class="mt-5 md:mt-6 font-display text-[34px] sm:text-[44px] md:text-[54px] leading-[1.08] tracking-tight text-ink"
        >
          Zabble is a South African
          <span class="cyan-underline">operations-systems consultancy.</span>
        </h2>

        <p class="mt-6 md:mt-7 text-[17px] md:text-[19px] text-ink leading-[1.7]">
          We build bespoke operational systems — automation, audit trails, anomaly
          detection, and analytics — shaped around the single problem slowing one
          specific business down. We don't sell off-the-shelf software. We assemble a
          library of 30 modules into one operating system, built for one business and
          no other.
        </p>

        <p class="mt-5 text-[16px] md:text-[17px] text-mute leading-[1.7]">
          We've built for NGOs, banks, hotels, law firms, parts suppliers, marketing
          agencies, and small businesses. The industries differ; the method doesn't —
          we find the operational problem costing the most, and build the exact system
          that fixes it.
        </p>
      </div>

      <!-- Cited evidence (GEO statistic + source) -->
      <figure
        v-reveal:fade="120"
        class="mt-10 md:mt-12 max-w-3xl rounded-2xl border border-line bg-surface-alt/60 p-6 md:p-7"
      >
        <blockquote class="text-[18px] md:text-[20px] leading-[1.55] text-ink font-display">
          “More occupations will change than will be automated away.”
        </blockquote>
        <figcaption class="mt-3 text-[14.5px] text-mute leading-[1.6]">
          About <strong class="text-ink font-semibold">60% of all occupations</strong>
          have at least 30% of their activities that could be automated — which is
          exactly the operational drag we remove.
          <a
            href="https://www.mckinsey.com/featured-insights/future-of-work/jobs-lost-jobs-gained-what-the-future-of-work-will-mean-for-jobs-skills-and-wages"
            target="_blank"
            rel="noopener"
            class="text-cyan-brand-deep hover:text-ink underline underline-offset-2 transition"
          >McKinsey Global Institute, <em>A Future That Works</em>, 2017</a>.
        </figcaption>
      </figure>

      <!-- NAP / identity row -->
      <dl
        v-reveal:fade="180"
        class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl"
      >
        <div
          v-for="f in facts"
          :key="f.label"
          class="rounded-xl border border-line bg-white p-4 md:p-5"
        >
          <dt class="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
            <component :is="f.icon" :size="14" :stroke-width="1.9" class="text-cyan-brand-deep" />
            {{ f.label }}
          </dt>
          <dd class="mt-2 text-[15px] md:text-[15.5px] font-medium text-ink leading-snug">
            <a
              v-if="f.href"
              :href="f.href"
              class="hover:text-cyan-brand-deep transition break-words"
            >{{ f.value }}</a>
            <span v-else>{{ f.value }}</span>
          </dd>
        </div>
      </dl>

      <p v-reveal:fade="240" class="mt-6 max-w-3xl text-[13.5px] text-mute-2 leading-[1.6]">
        Zabble (South Africa) is an operations-systems consultancy. It is not
        affiliated with Zabble, Inc., the United States waste-management software
        company.
      </p>
    </div>
  </section>
</template>
