<script setup lang="ts">
import { ArrowRight, Mail, Sparkles, Check, Zap } from '@lucide/vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const sectionRef = ref<HTMLElement | null>(null)
const pathRef = ref<SVGPathElement | null>(null)
const headRef = ref<SVGPathElement | null>(null)
const arrowVisible = ref(false)

let buttonEl: HTMLElement | null = null
let observer: IntersectionObserver | null = null
let rafId: number | null = null
let mediaQueries: { mq: MediaQueryList; handler: () => void }[] = []
let mouseX = 0
let mouseY = 0
let pointerX = 0
let pointerY = 0
let inSection = false
let cleanup: (() => void) | null = null

const EASE = 0.18
const HIDE_NEAR = 78
const HIDE_FAR = 900

function onMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function distanceToRect(x: number, y: number, rect: DOMRect) {
  const cx = Math.max(rect.left, Math.min(x, rect.right))
  const cy = Math.max(rect.top, Math.min(y, rect.bottom))
  return Math.hypot(x - cx, y - cy)
}

function targetOnRectEdge(rect: DOMRect) {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const horiz = Math.min(Math.abs(mouseX - rect.left), Math.abs(mouseX - rect.right))
  const vert = Math.min(Math.abs(mouseY - rect.top), Math.abs(mouseY - rect.bottom))
  let tx: number, ty: number
  if (horiz < vert) {
    tx = mouseX < cx ? rect.left : rect.right
    ty = Math.max(rect.top + 6, Math.min(rect.bottom - 6, mouseY))
  } else {
    ty = mouseY < cy ? rect.top : rect.bottom
    tx = Math.max(rect.left + 6, Math.min(rect.right - 6, mouseX))
  }
  return { x: tx, y: ty }
}

function controlPoint(sx: number, sy: number, ex: number, ey: number) {
  const dx = ex - sx
  const dy = ey - sy
  const dist = Math.hypot(dx, dy)
  if (dist < 40) return null
  const factor = Math.min(dist * 0.22, 120)
  const ang = Math.atan2(dy, dx)
  const perp = ang + Math.PI / 2
  const dir = (dx > 0 && dy > 0) || (dx < 0 && dy < 0) ? -1 : 1
  const mx = sx + dx * 0.5
  const my = sy + dy * 0.5
  return {
    x: mx + factor * Math.cos(perp) * dir,
    y: my + factor * Math.sin(perp) * dir,
  }
}

function buildPath(sx: number, sy: number, ex: number, ey: number) {
  const cp = controlPoint(sx, sy, ex, ey)
  if (!cp) return `M${sx},${sy} L${ex},${ey}`
  return `M${sx},${sy} Q${cp.x},${cp.y} ${ex},${ey}`
}

function buildHead(x: number, y: number, angle: number) {
  const len = 13
  const wing = Math.PI / 5
  const x1 = x - len * Math.cos(angle - wing)
  const y1 = y - len * Math.sin(angle - wing)
  const x2 = x - len * Math.cos(angle + wing)
  const y2 = y - len * Math.sin(angle + wing)
  const back = len * 0.55
  const x3 = x - back * Math.cos(angle)
  const y3 = y - back * Math.sin(angle)
  return `M${x},${y} L${x1},${y1} L${x3},${y3} L${x2},${y2} Z`
}

function tick() {
  if (!buttonEl || !pathRef.value || !headRef.value) {
    rafId = requestAnimationFrame(tick)
    return
  }
  const rect = buttonEl.getBoundingClientRect()
  const target = targetOnRectEdge(rect)
  pointerX += (target.x - pointerX) * EASE
  pointerY += (target.y - pointerY) * EASE

  pathRef.value.setAttribute('d', buildPath(mouseX, mouseY, pointerX, pointerY))

  const cp = controlPoint(mouseX, mouseY, pointerX, pointerY)
  const angle = cp
    ? Math.atan2(pointerY - cp.y, pointerX - cp.x)
    : Math.atan2(pointerY - mouseY, pointerX - mouseX)
  headRef.value.setAttribute('d', buildHead(pointerX, pointerY, angle))

  const dist = distanceToRect(mouseX, mouseY, rect)
  const shouldShow = inSection && dist > HIDE_NEAR && dist < HIDE_FAR
  if (arrowVisible.value !== shouldShow) arrowVisible.value = shouldShow

  rafId = requestAnimationFrame(tick)
}

function start() {
  if (cleanup) return
  buttonEl = sectionRef.value?.querySelector('.cta-primary') as HTMLElement | null
  if (!buttonEl) return

  pointerX = window.innerWidth / 2
  pointerY = window.innerHeight / 2
  mouseX = pointerX
  mouseY = pointerY

  window.addEventListener('mousemove', onMove, { passive: true })

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) inSection = entry.isIntersecting
    },
    { threshold: 0.2 },
  )
  if (sectionRef.value) observer.observe(sectionRef.value)

  rafId = requestAnimationFrame(tick)

  cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    window.removeEventListener('mousemove', onMove)
    observer?.disconnect()
    observer = null
    inSection = false
    arrowVisible.value = false
  }
}

function stop() {
  cleanup?.()
  cleanup = null
}

onMounted(() => {
  if (typeof window === 'undefined') return

  const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)')

  const evaluate = () => {
    if (hoverMq.matches && !reducedMq.matches) start()
    else stop()
  }

  const reducedHandler = () => evaluate()
  const hoverHandler = () => evaluate()
  reducedMq.addEventListener('change', reducedHandler)
  hoverMq.addEventListener('change', hoverHandler)
  mediaQueries.push({ mq: reducedMq, handler: reducedHandler })
  mediaQueries.push({ mq: hoverMq, handler: hoverHandler })

  evaluate()
})

onBeforeUnmount(() => {
  stop()
  for (const { mq, handler } of mediaQueries) mq.removeEventListener('change', handler)
  mediaQueries = []
})
</script>

<template>
  <section
    id="contact"
    ref="sectionRef"
    class="relative py-32 md:py-40 overflow-hidden"
  >
    <div
      class="absolute inset-0 grid-bg fade-mask opacity-50 pointer-events-none"
      aria-hidden="true"
    />

    <div
      class="cta-blob cta-blob--1 absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[920px] rounded-full bg-cyan-brand/20 blur-[130px] pointer-events-none"
      aria-hidden="true"
    />
    <div
      class="cta-blob cta-blob--2 absolute top-44 right-[-12%] h-[400px] w-[520px] rounded-full bg-cyan-brand/15 blur-[110px] pointer-events-none"
      aria-hidden="true"
    />
    <div
      class="cta-blob cta-blob--3 absolute -bottom-24 left-[-12%] h-[400px] w-[520px] rounded-full bg-cyan-brand/12 blur-[110px] pointer-events-none"
      aria-hidden="true"
    />

    <span class="cta-particle cta-particle--1" aria-hidden="true" />
    <span class="cta-particle cta-particle--2" aria-hidden="true" />
    <span class="cta-particle cta-particle--3" aria-hidden="true" />
    <span class="cta-particle cta-particle--4" aria-hidden="true" />
    <span class="cta-particle cta-particle--5" aria-hidden="true" />
    <span class="cta-particle cta-particle--6" aria-hidden="true" />
    <span class="cta-particle cta-particle--7" aria-hidden="true" />

    <div class="relative mx-auto max-w-4xl px-5 md:px-8 lg:px-12">
      <div v-reveal:scale class="relative">
        <div class="cta-border" aria-hidden="true" />

        <div
          class="cta-card relative rounded-[26px] bg-white px-7 sm:px-12 md:px-16 lg:px-20 py-16 md:py-20 lg:py-24 text-center overflow-hidden"
        >
          <div
            class="absolute -top-32 left-1/2 -translate-x-1/2 h-[380px] w-[720px] rounded-full bg-cyan-brand/15 blur-[100px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            class="absolute -bottom-24 right-[-15%] h-[260px] w-[420px] rounded-full bg-cyan-brand/10 blur-[80px] pointer-events-none"
            aria-hidden="true"
          />

          <svg
            class="absolute top-0 left-0 w-32 h-32 text-cyan-brand/15 pointer-events-none"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            stroke-width="0.5"
            aria-hidden="true"
          >
            <circle cx="20" cy="20" r="14" />
            <circle cx="20" cy="20" r="20" />
            <circle cx="20" cy="20" r="26" />
          </svg>
          <svg
            class="absolute bottom-0 right-0 w-32 h-32 text-cyan-brand/15 pointer-events-none"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            stroke-width="0.5"
            aria-hidden="true"
          >
            <circle cx="80" cy="80" r="14" />
            <circle cx="80" cy="80" r="20" />
            <circle cx="80" cy="80" r="26" />
          </svg>

          <div class="relative">
            <div
              class="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
            >
              <span class="dot animate-pulse" />
              First Step
            </div>

            <h2
              class="mt-6 font-display text-[38px] sm:text-[50px] md:text-[62px] leading-[1.05] tracking-tight text-ink"
            >
              Let's find the problem
              <span class="block sm:inline">
                <span class="cyan-underline">worth solving first.</span>
              </span>
            </h2>

            <p
              class="mx-auto mt-7 max-w-2xl text-[17px] md:text-[18.5px] leading-[1.7] text-mute"
            >
              Every business has one. We'll help you name it, scope it, and decide what's worth
              building. The first conversation is free. And useful either way.
            </p>

            <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
              <NuxtLink to="/diagnose" class="cta-primary group">
                <span class="cta-primary__halo" aria-hidden="true" />
                <Sparkles :size="17" class="relative z-10" />
                <span class="relative z-10">Start the 2-minute diagnostic</span>
                <ArrowRight
                  :size="17"
                  class="relative z-10 transition group-hover:translate-x-0.5"
                />
              </NuxtLink>
              <a
                href="mailto:analytics@zabble.org"
                class="group inline-flex items-center justify-center gap-2 rounded-full border border-line hover:border-cyan-brand/50 bg-white hover:bg-surface-alt text-ink text-[16px] lg:text-[15.5px] font-medium px-6 py-4 transition"
              >
                <Mail :size="17" class="text-cyan-brand-deep" />
                analytics@zabble.org
              </a>
            </div>
          </div>
        </div>

        <div class="cta-badge cta-badge--tl hidden lg:flex items-center gap-2.5">
          <span
            class="inline-flex items-center justify-center h-7 w-7 rounded-full bg-cyan-brand/15 text-cyan-brand-deep ring-1 ring-cyan-brand/30"
          >
            <Check :size="14" :stroke-width="2.5" />
          </span>
          <span class="text-[13px] font-semibold text-ink leading-none">Free consultation</span>
        </div>

        <div class="cta-badge cta-badge--br hidden lg:flex items-center gap-2.5">
          <span
            class="inline-flex items-center justify-center h-7 w-7 rounded-full bg-cyan-brand/15 text-cyan-brand-deep ring-1 ring-cyan-brand/30"
          >
            <Zap :size="14" :stroke-width="2.5" />
          </span>
          <span class="text-[13px] font-semibold text-ink leading-none">30 min · 1:1</span>
        </div>
      </div>
    </div>

    <div
      class="cursor-arrow"
      :class="{ 'is-visible': arrowVisible }"
      aria-hidden="true"
    >
      <svg class="cursor-arrow__svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="zabbleArrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#01DBF1" />
            <stop offset="100%" stop-color="#00B8CC" />
          </linearGradient>
        </defs>
        <path ref="pathRef" class="cursor-arrow__path" d="M0,0" />
        <path ref="headRef" class="cursor-arrow__head" d="M0,0" />
      </svg>
    </div>
  </section>
</template>

<style scoped>
@property --cta-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.cta-border {
  position: absolute;
  inset: -1.5px;
  border-radius: 28px;
  background: conic-gradient(
    from var(--cta-angle),
    rgba(1, 219, 241, 0.35) 0deg,
    rgba(1, 219, 241, 0.35) 70deg,
    #ffffff 88deg,
    rgba(0, 184, 204, 0.95) 100deg,
    rgba(1, 219, 241, 0.45) 180deg,
    rgba(1, 219, 241, 0.35) 250deg,
    #ffffff 268deg,
    rgba(0, 184, 204, 0.95) 280deg,
    rgba(1, 219, 241, 0.35) 360deg
  );
  animation: cta-border-rotate 7s linear infinite;
  z-index: 0;
  filter: drop-shadow(0 0 24px rgba(1, 219, 241, 0.25));
}

@keyframes cta-border-rotate {
  to {
    --cta-angle: 360deg;
  }
}

.cta-card {
  z-index: 1;
  box-shadow:
    0 30px 80px -30px rgba(15, 23, 42, 0.18),
    0 8px 24px -12px rgba(15, 23, 42, 0.08);
}

.cta-blob {
  will-change: transform;
}
.cta-blob--1 {
  animation: cta-blob-1 16s ease-in-out infinite;
}
.cta-blob--2 {
  animation: cta-blob-2 19s ease-in-out infinite;
}
.cta-blob--3 {
  animation: cta-blob-3 17s ease-in-out infinite;
}

@keyframes cta-blob-1 {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) translateY(22px) scale(1.05);
    opacity: 0.85;
  }
}
@keyframes cta-blob-2 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-30px, -18px, 0) scale(0.95);
  }
}
@keyframes cta-blob-3 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(28px, 16px, 0) scale(1.05);
  }
}

.cta-primary {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 1rem 1.5rem 1rem 1.75rem;
  background: linear-gradient(135deg, #01dbf1 0%, #00b8cc 100%);
  color: var(--color-ink);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.005em;
  box-shadow:
    0 22px 55px -18px rgba(1, 219, 241, 0.7),
    0 8px 18px -8px rgba(1, 219, 241, 0.4),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
  isolation: isolate;
}
@media (min-width: 1024px) {
  .cta-primary {
    font-size: 15.5px;
  }
}
.cta-primary:hover {
  transform: translateY(-1.5px);
  box-shadow:
    0 28px 60px -16px rgba(1, 219, 241, 0.8),
    0 10px 22px -8px rgba(1, 219, 241, 0.5),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6);
}

.cta-primary__halo {
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  background: radial-gradient(closest-side, rgba(1, 219, 241, 0.55), rgba(1, 219, 241, 0) 70%);
  opacity: 0.55;
  filter: blur(8px);
  animation: cta-halo-pulse 3.2s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
@keyframes cta-halo-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.96);
  }
  50% {
    opacity: 0.75;
    transform: scale(1.05);
  }
}

.cursor-arrow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 60;
  opacity: 0;
  transition: opacity 900ms ease-out;
}
.cursor-arrow.is-visible {
  opacity: 0.42;
  animation: cursor-arrow-breathe 4.2s ease-in-out infinite;
}
.cursor-arrow__svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}
.cursor-arrow__path {
  fill: none;
  stroke: url(#zabbleArrowGradient);
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-dasharray: 5 6;
  filter: drop-shadow(0 0 4px rgba(1, 219, 241, 0.28));
  animation: cursor-arrow-dash 2.6s linear infinite;
}
.cursor-arrow__head {
  fill: url(#zabbleArrowGradient);
  opacity: 0.85;
  filter: drop-shadow(0 0 4px rgba(1, 219, 241, 0.3));
}
@keyframes cursor-arrow-dash {
  to {
    stroke-dashoffset: -22;
  }
}
@keyframes cursor-arrow-breathe {
  0%,
  100% {
    opacity: 0.32;
  }
  50% {
    opacity: 0.5;
  }
}

.cta-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgba(1, 219, 241, 0.7);
  box-shadow: 0 0 14px rgba(1, 219, 241, 0.6);
  animation: cta-particle-float 9s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
.cta-particle--1 {
  top: 16%;
  left: 10%;
  animation-delay: 0s;
}
.cta-particle--2 {
  top: 22%;
  right: 13%;
  width: 4px;
  height: 4px;
  animation-delay: 1.5s;
}
.cta-particle--3 {
  top: 52%;
  left: 6%;
  width: 5px;
  height: 5px;
  animation-delay: 3s;
}
.cta-particle--4 {
  top: 66%;
  right: 8%;
  animation-delay: 4.5s;
}
.cta-particle--5 {
  bottom: 14%;
  left: 22%;
  width: 4px;
  height: 4px;
  animation-delay: 2s;
}
.cta-particle--6 {
  top: 42%;
  right: 28%;
  width: 5px;
  height: 5px;
  animation-delay: 5.5s;
}
.cta-particle--7 {
  bottom: 24%;
  right: 22%;
  width: 4px;
  height: 4px;
  animation-delay: 6.5s;
}

@keyframes cta-particle-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 0.3;
  }
  25% {
    opacity: 0.85;
  }
  50% {
    transform: translate3d(12px, -24px, 0);
    opacity: 0.55;
  }
  75% {
    opacity: 0.85;
  }
}

.cta-badge {
  position: absolute;
  z-index: 2;
  background: #ffffff;
  border: 1px solid var(--color-line);
  border-radius: 9999px;
  padding: 0.625rem 1rem 0.625rem 0.625rem;
  box-shadow:
    0 20px 45px -22px rgba(15, 23, 42, 0.25),
    0 4px 10px -6px rgba(15, 23, 42, 0.06);
}
.cta-badge--tl {
  top: -18px;
  left: -28px;
  animation: cta-badge-float-tl 5.5s ease-in-out infinite;
}
.cta-badge--br {
  bottom: -18px;
  right: -28px;
  animation: cta-badge-float-br 6s ease-in-out infinite;
  animation-delay: 1.2s;
}
@keyframes cta-badge-float-tl {
  0%,
  100% {
    transform: rotate(-4deg) translateY(0);
  }
  50% {
    transform: rotate(-4deg) translateY(-8px);
  }
}
@keyframes cta-badge-float-br {
  0%,
  100% {
    transform: rotate(4deg) translateY(0);
  }
  50% {
    transform: rotate(4deg) translateY(-8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta-border,
  .cta-blob--1,
  .cta-blob--2,
  .cta-blob--3,
  .cta-primary__halo,
  .cta-particle,
  .cta-badge--tl,
  .cta-badge--br,
  .cursor-arrow__path {
    animation: none !important;
  }
  .cta-badge--tl {
    transform: rotate(-4deg);
  }
  .cta-badge--br {
    transform: rotate(4deg);
  }
  .cursor-arrow {
    display: none !important;
  }
}
</style>
