<script setup lang="ts">
// Site footer. Carries the sitewide internal-link block that flattens crawl
// depth (internal-linking rule L7): /systems + the four pillar hubs appear on
// every page, so every money page and hub sits <=2 clicks from anywhere.

import { PILLAR_HUBS } from '~/data/pillars'
import { useAnalytics } from '~/composables/useAnalytics'

const year = new Date().getFullYear()
const analytics = useAnalytics()
</script>

<template>
  <footer class="border-t border-line bg-white">
    <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 py-12 md:py-16">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
        <!-- Brand -->
        <div class="md:col-span-4">
          <NuxtLink to="/#home" class="inline-flex items-center" aria-label="Zabble home">
            <span class="font-display text-ink text-[30px] leading-none tracking-[-0.02em]">Zabble</span>
          </NuxtLink>
          <p class="text-[16px] lg:text-[14px] text-mute-2 mt-3 max-w-xs leading-relaxed">
            Bespoke operational systems — automation, audit trails, anomaly detection, and analytics — built around your business.
          </p>
        </div>

        <!-- What we build (pillar hubs) -->
        <nav class="md:col-span-3" aria-label="What we build">
          <p class="text-[11.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">What we build</p>
          <ul class="mt-4 space-y-2.5 text-[15px] lg:text-[14.5px] font-medium text-mute">
            <li v-for="hub in PILLAR_HUBS" :key="hub.slug">
              <NuxtLink :to="`/what-we-build/${hub.slug}`" class="hover:text-ink transition">{{ hub.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Explore -->
        <nav class="md:col-span-3" aria-label="Explore">
          <p class="text-[11.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Explore</p>
          <ul class="mt-4 space-y-2.5 text-[15px] lg:text-[14.5px] font-medium text-mute">
            <li><NuxtLink to="/systems" class="hover:text-ink transition">All systems</NuxtLink></li>
            <li><NuxtLink to="/#what-we-build" class="hover:text-ink transition">What We Build</NuxtLink></li>
            <li><NuxtLink to="/#meet" class="hover:text-ink transition">Use Cases</NuxtLink></li>
            <li><NuxtLink to="/diagnose" class="hover:text-ink transition">Book a discovery call</NuxtLink></li>
          </ul>
        </nav>

        <!-- Contact -->
        <nav class="md:col-span-2" aria-label="Contact">
          <p class="text-[11.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">Get in touch</p>
          <ul class="mt-4 space-y-2.5 text-[15px] lg:text-[14.5px] font-medium text-mute">
            <li><a href="mailto:analytics@zabble.org" class="hover:text-ink transition break-all">analytics@zabble.org</a></li>
          </ul>
        </nav>
      </div>

      <div class="mt-12 pt-7 border-t border-line flex flex-col gap-5">
        <!-- Footer nav: hub links for crawl depth + internal linking (OR-6, S02)
             plus the POPIA legal pages + consent re-open control (S09). -->
        <nav class="flex flex-wrap items-center gap-x-7 gap-y-2 text-[16px] lg:text-[14.5px] font-medium text-mute" aria-label="Footer">
          <NuxtLink to="/" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Home</NuxtLink>
          <NuxtLink to="/systems" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Systems</NuxtLink>
          <NuxtLink to="/pillars" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Pillars</NuxtLink>
          <NuxtLink to="/industries" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Industries</NuxtLink>
          <NuxtLink to="/insights" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Insights</NuxtLink>
          <NuxtLink to="/contact" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Contact</NuxtLink>
          <NuxtLink to="/privacy" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Privacy</NuxtLink>
          <NuxtLink to="/cookie-policy" class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition">Cookies</NuxtLink>
          <button
            v-if="analytics.enabled"
            type="button"
            class="px-2 py-3 lg:px-0 lg:py-0 hover:text-ink transition text-left"
            @click="analytics.openSettings()"
          >Cookie settings</button>
        </nav>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p class="text-[15px] lg:text-[13px] text-mute-2">© {{ year }} Zabble. All rights reserved.</p>
          <p class="text-[15px] lg:text-[13px] text-mute-2">Bespoke digital systems · South Africa</p>
        </div>
      </div>
    </div>
  </footer>
</template>
