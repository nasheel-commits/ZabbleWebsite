<script setup lang="ts">
import { computed, watch } from 'vue'
import {
  SYSTEMS,
  PILLARS,
  filterSystemsByPillars,
  type PillarSlug,
} from '~/data/systems'

// Pillar hub / module index (S02 on-page). Canonical is the clean /systems URL,
// so filtered variants (/systems?pillar=automation) canonicalise here and never
// cannibalise it. Primary intent: "operational systems / business automation,
// South Africa" — verify against targets/keyword-map.md once S05 completes.
usePageSeo({
  title: 'Operational Systems We Build',
  description:
    'The building blocks Zabble assembles into bespoke operating systems for South African businesses — automation, audit trails, anomaly detection and analytics.',
  path: '/systems',
  ogType: 'website',
  primaryKeyword: 'operational systems',
})

const route = useRoute()
const router = useRouter()

// Parse ?pillar=automation,audit-trails -> ['automation','audit-trails'].
// Reject unknown slugs so a hand-edited URL can't poison filter state.
const validSlugs = new Set<string>(PILLARS.map((p) => p.slug))

function parseQuery(raw: unknown): PillarSlug[] {
  if (typeof raw !== 'string' || raw.length === 0) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is PillarSlug => validSlugs.has(s))
}

const activePillars = computed<PillarSlug[]>(() => parseQuery(route.query.pillar))

function setActive(next: PillarSlug[]) {
  router.replace({
    query: {
      ...route.query,
      pillar: next.length ? next.join(',') : undefined,
    },
  })
}

// Only `live` systems are surfaced in the gallery — concept/in-progress
// entries stay in the data file but are hidden until their copy is signed off.
const liveSystems = computed(() => SYSTEMS.filter((s) => s.status === 'live'))

const visibleSystems = computed(() =>
  filterSystemsByPillars(liveSystems.value, activePillars.value),
)

// Defensive: if the URL is hand-edited to all-unknown slugs we end up with []
// active pillars and "All" selected, which is fine. But if some slugs are
// valid and some aren't, drop the invalid ones from the URL so the URL stays
// honest about what's actually being filtered.
watch(
  () => route.query.pillar,
  (raw) => {
    if (typeof raw !== 'string') return
    const parsed = parseQuery(raw)
    if (parsed.join(',') !== raw) {
      router.replace({
        query: {
          ...route.query,
          pillar: parsed.length ? parsed.join(',') : undefined,
        },
      })
    }
  },
)
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24">
      <!-- Hero -->
      <section class="relative">
        <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
          <div v-reveal class="max-w-3xl">
            <div
              class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
            >
              <span class="dot" />
              Systems
            </div>
            <!-- TODO: finalise hero copy once we have signed-off marketing voice. -->
            <h1
              class="mt-5 font-display text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] leading-[1.04] tracking-tight text-ink"
            >
              The systems we've
              <span class="cyan-underline">built around businesses.</span>
            </h1>
            <p data-answer-first class="mt-6 max-w-2xl text-[16px] md:text-[19px] leading-[1.6] md:leading-[1.65] text-mute">
              These are the building blocks Zabble assembles into a bespoke operating system.
              No business gets all of them — each gets the handful that fix the problem costing it
              the most, wired into one system shaped to how it actually works. Filter by pillar to
              see the systems that match your operational pain.
            </p>
            <div class="mt-7 md:mt-8 flex flex-col sm:flex-row items-center gap-3">
              <NuxtLink
                to="/diagnose"
                class="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink-soft text-white text-[15px] font-semibold px-5 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Book a discovery call
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="transition-transform duration-200 group-hover:translate-x-0.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Filter + grid -->
      <section class="relative mt-12 md:mt-16">
        <div class="mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
          <PillarFilterBar :active="activePillars" @update:active="setActive" />

          <p
            v-if="activePillars.length"
            class="mt-3 text-[13.5px] text-mute"
            aria-live="polite"
          >
            Showing {{ visibleSystems.length }}
            {{ visibleSystems.length === 1 ? 'system' : 'systems' }}
            tagged with the selected pillar{{ activePillars.length > 1 ? 's' : '' }}.
          </p>

          <div
            v-if="visibleSystems.length"
            class="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          >
            <SystemCard
              v-for="(s, i) in visibleSystems"
              :key="s.slug"
              v-reveal:scale="i * 60"
              :system="s"
            />
          </div>

          <div
            v-else
            class="mt-10 rounded-2xl border border-dashed border-line bg-surface-alt/60 px-6 py-14 text-center"
            role="status"
          >
            <p class="font-display text-[22px] md:text-[26px] text-ink leading-[1.2]">
              No systems match those filters yet.
            </p>
            <p class="mt-2 text-[14.5px] text-mute">
              Try clearing the filters, or
              <NuxtLink to="/diagnose" class="text-ink underline underline-offset-4 hover:text-ink-soft">
                book a discovery call
              </NuxtLink>
              to tell us what you'd like to see.
            </p>
          </div>
        </div>
      </section>

      <CtaStrip
        eyebrow="Next Step"
        heading="Want one built for your business?"
      />
    </main>

    <TheFooter />
  </div>
</template>
