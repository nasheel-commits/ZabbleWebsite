<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, MapPin, Mail, Globe, Building2 } from '@lucide/vue'

import { ORGANIZATION } from '~/data/organization'
import { useInView } from '~/composables/useInView'

const industries = [
  'NGOs',
  'Banks & FSPs',
  'Hospitality',
  'Law firms',
  'Logistics & warehousing',
  'Manufacturing',
  'Marketing agencies',
  'Small & medium businesses',
]

// Entity-identity facts (NAP), moved here from the former standalone "Who We
// Are" section (TheEntity). The line below the row is a positive identity
// statement; entity disambiguation is positive-only (country + sector + metros)
// across visible copy and structured data — the site names no homonym (GEO F2).
const facts = [
  { icon: Building2, label: 'What', value: 'Operations-systems consultancy' },
  { icon: MapPin, label: 'Where', value: 'South Africa' },
  { icon: Mail, label: 'Contact', value: ORGANIZATION.email, href: `mailto:${ORGANIZATION.email}` },
  // Self-reference to the homepage, kept relative so it isn't flagged as an
  // absolute internal link (nuxt-link-checker absolute-site-urls).
  { icon: Globe, label: 'Web', value: 'zabble.org', href: '/' },
]

// Gate the CPU SVG's continuous animations (stroke gradient on text + marker
// pulse) so they only run while the section is on-screen. Visual result is
// identical when the user is looking; CPU is idle when they aren't.
const meetRef = ref<HTMLElement | null>(null)
const { visible: meetVisible } = useInView(meetRef, { threshold: 0.1, rootMargin: '100px 0px' })

</script>

<template>
  <section id="meet" ref="meetRef" class="relative py-28 md:py-36">
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
            We've worked with NGOs, banks and financial services providers, hospitality, law firms,
            logistics and warehousing, manufacturers, marketing agencies, and growing small and
            mid-sized businesses across a range of industries.
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
              <CpuArchitecture
                text="OPS"
                class="text-slate-400"
                :animate-text="meetVisible"
                :animate-markers="meetVisible"
              />
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
              <p class="mt-4 text-[13px] leading-[1.6] text-mute-2">
                A snapshot, not a menu. We build for any business with the right problem to solve,
                shaped around how you work, not your industry.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Entity-identity facts, moved from the former standalone "Who We Are"
           section so Meet Zabble carries the NAP without repeating the narrative.
           id retained for any deep links to #who-we-are. -->
      <div id="who-we-are" class="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-line scroll-mt-24">
        <!-- NAP / identity row -->
        <dl
          v-reveal:fade="180"
          class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl"
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
          Zabble is a South African operations-systems consultancy — bespoke
          systems built around the one problem slowing a specific business down.
        </p>
      </div>
    </div>
  </section>
</template>
