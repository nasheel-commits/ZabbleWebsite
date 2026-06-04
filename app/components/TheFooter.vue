<script setup lang="ts">
import { Mail } from '@lucide/vue'
import { LOCATIONS } from '~/data/locations'
import { NAP } from '~/data/nap'

const year = new Date().getFullYear()

// Internal-link surface for off-page/local SEO: every page links to the local +
// industry hubs and the entity pages, so crawlers (and crawlLinks prerendering)
// reach them, and link equity flows to the money pages. Owner: S04.
const explore = [
  { to: '/#home', label: 'Home' },
  { to: '/systems', label: 'Systems' },
  { to: '/industries', label: 'Industries' },
  { to: '/locations', label: 'Locations' },
]
const company = [
  { to: '/about', label: 'About' },
  { to: '/insights', label: 'Insights' },
  { to: '/press', label: 'Press' },
  { to: '/diagnose', label: 'Book a call' },
]
</script>

<template>
  <footer class="border-t border-line bg-white">
    <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12 py-12 md:py-16">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
        <!-- Brand -->
        <div class="md:col-span-5">
          <p class="font-display text-ink text-[30px] leading-none tracking-[-0.02em]">Zabble</p>
          <p class="text-[15px] lg:text-[14px] text-mute mt-3 max-w-xs leading-[1.6]">
            {{ NAP.description }}
          </p>
          <a
            :href="`mailto:${NAP.email}`"
            class="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-ink hover:text-ink-soft transition-colors"
          >
            <Mail :size="15" class="text-mute" />
            {{ NAP.email }}
          </a>
        </div>

        <!-- Explore -->
        <nav class="md:col-span-3" aria-label="Explore">
          <p class="text-[11.5px] uppercase tracking-[0.2em] text-mute-2 font-semibold">Explore</p>
          <ul class="mt-4 space-y-2.5">
            <li v-for="l in explore" :key="l.to">
              <NuxtLink :to="l.to" class="text-[15px] lg:text-[14.5px] font-medium text-mute hover:text-ink transition">{{ l.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Company -->
        <nav class="md:col-span-2" aria-label="Company">
          <p class="text-[11.5px] uppercase tracking-[0.2em] text-mute-2 font-semibold">Company</p>
          <ul class="mt-4 space-y-2.5">
            <li v-for="l in company" :key="l.to">
              <NuxtLink :to="l.to" class="text-[15px] lg:text-[14.5px] font-medium text-mute hover:text-ink transition">{{ l.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Cities -->
        <nav class="md:col-span-2" aria-label="Locations">
          <p class="text-[11.5px] uppercase tracking-[0.2em] text-mute-2 font-semibold">Cities</p>
          <ul class="mt-4 space-y-2.5">
            <li v-for="l in LOCATIONS" :key="l.slug">
              <NuxtLink :to="`/locations/${l.slug}`" class="text-[15px] lg:text-[14.5px] font-medium text-mute hover:text-ink transition">{{ l.city }}</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p class="text-[13px] text-mute-2">© {{ year }} Zabble. Bespoke operational systems for South African businesses.</p>
        <p class="text-[13px] text-mute-2">Serving {{ NAP.areasServed.filter((a) => a !== 'South Africa').join(' · ') }}</p>
      </div>
    </div>
  </footer>
</template>
