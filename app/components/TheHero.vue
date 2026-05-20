<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ArrowRight, PlayCircle } from '@lucide/vue'

const scrollY = ref(0)
let ticking = false
let reduced = false

function update() {
  scrollY.value = window.scrollY
  ticking = false
}

function onScroll() {
  if (ticking || reduced) return
  ticking = true
  window.requestAnimationFrame(update)
}

onMounted(() => {
  reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (reduced) return
  window.addEventListener('scroll', onScroll, { passive: true })
  update()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <section id="home" class="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28">
    <div
      class="absolute inset-0 grid-bg fade-mask pointer-events-none"
      aria-hidden="true"
      :style="{ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }"
    />
    <div
      class="parallax-blob absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-brand/15 blur-3xl pointer-events-none"
      aria-hidden="true"
      :style="{ transform: `translate3d(0, ${scrollY * 0.25}px, 0)` }"
    />
    <div
      class="parallax-blob absolute top-40 left-[-8%] h-[320px] w-[320px] rounded-full bg-cyan-brand/10 blur-3xl pointer-events-none"
      aria-hidden="true"
      :style="{ transform: `translate3d(0, ${scrollY * -0.18}px, 0)` }"
    />

    <div class="relative mx-auto max-w-7xl px-5 md:px-8 lg:px-12">
      <div class="mx-auto max-w-4xl text-center">
        <div
          v-reveal
          class="inline-flex items-center gap-2.5 text-[12.5px] uppercase tracking-[0.24em] text-cyan-brand-deep font-semibold"
        >
          <span class="dot" />
          Bespoke Digital Systems
        </div>

        <h1
          v-reveal:blur="80"
          class="mt-8 font-display text-[46px] leading-[1.06] sm:text-[60px] md:text-[74px] lg:text-[82px] tracking-tight text-ink"
        >
          Your business has a system that's costing you.
          <span class="block mt-2">
            We build the one that
            <span class="relative inline-block">
              <span class="cyan-underline">fixes it.</span>
            </span>
          </span>
        </h1>

        <p
          v-reveal="220"
          class="mx-auto mt-8 max-w-2xl text-[17px] md:text-[19px] leading-[1.65] text-mute"
        >
          Zabble designs bespoke operational systems: automation, audit trails, anomaly detection,
          and analytics. Built around the specific problem that's slowing your business down.
        </p>

        <div v-reveal="320" class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink
            to="/diagnose"
            class="group inline-flex items-center justify-center gap-2 rounded-full bg-ink hover:bg-ink-soft text-white text-[16px] lg:text-[15.5px] font-medium pl-6 pr-5 py-3.5 transition shadow-[0_10px_30px_-12px_rgba(1,219,241,0.55)]"
          >
            Find my biggest problem
            <ArrowRight :size="17" class="transition group-hover:translate-x-0.5" />
          </NuxtLink>
          <a
            href="#plan"
            class="group inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white hover:bg-surface-alt text-ink text-[16px] lg:text-[15.5px] font-medium px-6 py-3.5 transition"
          >
            <PlayCircle :size="17" class="text-cyan-brand-deep" />
            See how we work
          </a>
        </div>

        <p v-reveal="420" class="mt-6 text-[16px] lg:text-[13.5px] text-mute-2">
          First conversation is free. And useful either way.
        </p>
      </div>

      <div
        class="relative mt-16 md:mt-20 hidden md:block"
        :style="{ transform: `translate3d(0, ${scrollY * -0.06}px, 0)` }"
      >
        <div
          v-reveal:scale="120"
          class="mx-auto max-w-5xl rounded-2xl border border-line bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] overflow-hidden"
        >
          <div class="flex items-center gap-1.5 px-4 py-3 border-b border-line bg-surface-alt">
            <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span class="ml-3 text-[12.5px] text-mute-2">zabble.ops · operations control</span>
          </div>
          <div class="grid grid-cols-12 gap-0">
            <aside class="hidden md:flex col-span-3 flex-col border-r border-line p-5 bg-surface-alt/40">
              <span class="text-[12px] uppercase tracking-[0.15em] text-mute-2 font-semibold">Workspace</span>
              <ul class="mt-4 flex flex-col gap-2 text-[14px]">
                <li class="flex items-center gap-2 text-ink font-medium">
                  <span class="h-1.5 w-1.5 rounded-full bg-cyan-brand" />
                  Workflows
                </li>
                <li class="text-mute pl-3.5">Approvals</li>
                <li class="text-mute pl-3.5">Audit trail</li>
                <li class="text-mute pl-3.5">Anomalies</li>
                <li class="text-mute pl-3.5">Dashboards</li>
              </ul>
            </aside>
            <div class="col-span-12 md:col-span-9 p-5 md:p-7">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div class="rounded-xl border border-line p-4 bg-white">
                  <p class="text-[12px] uppercase tracking-[0.12em] text-mute-2 font-semibold">Hours saved / wk</p>
                  <p class="mt-2 font-display text-[34px] leading-none text-ink">128<span class="text-cyan-brand-deep">·</span></p>
                  <p class="text-[12.5px] text-mute mt-2">+14% vs. last month</p>
                </div>
                <div class="rounded-xl border border-line p-4 bg-white">
                  <p class="text-[12px] uppercase tracking-[0.12em] text-mute-2 font-semibold">Anomalies caught</p>
                  <p class="mt-2 font-display text-[34px] leading-none text-ink">17</p>
                  <p class="text-[12.5px] text-mute mt-2">3 prevented losses</p>
                </div>
                <div class="rounded-xl border border-line p-4 bg-white">
                  <p class="text-[12px] uppercase tracking-[0.12em] text-mute-2 font-semibold">Audit readiness</p>
                  <p class="mt-2 font-display text-[34px] leading-none text-ink">98%</p>
                  <p class="text-[12.5px] text-mute mt-2">All trails intact</p>
                </div>
              </div>

              <div class="mt-6 rounded-xl border border-line p-4 bg-white">
                <div class="flex items-center justify-between">
                  <p class="text-[13.5px] font-semibold text-ink">Weekly throughput</p>
                  <span class="text-[12px] text-mute-2">Auto-generated</span>
                </div>
                <svg viewBox="0 0 600 130" class="mt-3 w-full h-24" aria-hidden="true">
                  <defs>
                    <linearGradient id="hg" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#01DBF1" stop-opacity="0.45" />
                      <stop offset="100%" stop-color="#01DBF1" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,95 C60,80 100,90 150,70 C200,50 250,75 300,55 C360,32 420,60 480,40 C540,22 580,32 600,28 L600,130 L0,130 Z"
                    fill="url(#hg)"
                  />
                  <path
                    d="M0,95 C60,80 100,90 150,70 C200,50 250,75 300,55 C360,32 420,60 480,40 C540,22 580,32 600,28"
                    fill="none"
                    stroke="#01DBF1"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div
          v-reveal:right="500"
          class="hidden lg:block absolute -right-6 top-12 rotate-2 rounded-xl border border-line bg-white shadow-xl p-3 w-56 float-soft"
        >
          <div class="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <span class="h-2 w-2 rounded-full bg-cyan-brand" />
            Anomaly detected
          </div>
          <p class="mt-2 text-[12.5px] text-mute leading-relaxed">
            Vendor invoice 3.2× higher than 90-day baseline. Flagged for review.
          </p>
        </div>
        <div
          v-reveal:left="620"
          class="hidden lg:block absolute -left-6 -bottom-4 -rotate-2 rounded-xl border border-line bg-white shadow-xl p-3 w-52"
        >
          <div class="text-[12px] uppercase tracking-[0.15em] text-mute-2 font-semibold">Audit</div>
          <p class="mt-2 text-[13px] text-ink leading-relaxed">
            12 actions logged in this workflow this hour.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
