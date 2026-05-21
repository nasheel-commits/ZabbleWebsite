# Speed & Responsiveness Audit — Zabble Website

**Goal:** make the site noticeably faster — both initial load and runtime responsiveness — **without changing any styling, layout, animation, or copy**. Every recommendation below preserves the exact look/feel; only the *delivery mechanism* changes.

**Scope reviewed:** `nuxt.config.ts`, `app.vue`, `app/assets/css/main.css`, `app/plugins/reveal.client.ts`, all 18 marketing components (`app/components/Th*.vue`, `CpuArchitecture.vue`, `DemoSlot.vue`, `SystemCard.vue`, `SystemHero.vue`, `PillarChip.vue`, `PillarFilterBar.vue`, `CtaStrip.vue`), all 30 demos in `app/components/demos/*.vue` (~40k LOC, ~1.1 MB raw), `app/pages/index.vue`, `app/pages/diagnose.vue`, `app/pages/systems/*.vue`, `app/data/systems.ts`, `app/utils/demoRegistry.ts`.

**Health summary:** the site is already in good shape for a Nuxt 4 marketing build — demos are async-imported (`defineAsyncComponent`), Tailwind v4 is JIT, reveal uses a single shared `IntersectionObserver`, scroll handlers are `passive` + rAF-throttled, and `prefers-reduced-motion` is honoured everywhere. There are no images to optimize (everything is CSS / SVG / Lucide). The biggest wins are around **font delivery, initial JS payload, route-level data loading, and a few CPU-heavy paint patterns**.

---

## P0 — Highest impact, lowest risk (no visual change)

### 1. Self-host the two Google Fonts (`Inter`, `Instrument Serif`)
**File:** `nuxt.config.ts:26-32`

**What's happening now:** Every page does

```ts
link: [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif&display=swap' },
],
```

That's a render-blocking stylesheet pulled from a third-party origin, plus a second hop to `fonts.gstatic.com` for the actual font files. On a cold load that adds **2 extra TCP/TLS handshakes + 2 round-trips** before the first glyph paints — and Google's CSS file changes occasionally, so it can't be HTTP-cached aggressively.

**Fix (zero visual change):**
1. `npm i -D @nuxt/fonts` (officially supported by Nuxt 4; it auto-downloads and self-hosts).
2. Add to `nuxt.config.ts`:
   ```ts
   modules: ['@nuxt/fonts'],
   fonts: {
     families: [
       { name: 'Inter', weights: [400, 500, 600, 700, 800], styles: ['normal'] },
       { name: 'Instrument Serif', weights: [400], styles: ['normal'] },
     ],
   },
   ```
3. Remove the three manual `link` entries from `app.head`.

Result: fonts are served from your own origin alongside HTML, woff2-subset, with `font-display: swap` preserved. **Saves ~150-400 ms LCP on cold loads**, and your existing CSS variables (`--font-sans`, `--font-display`) keep working unchanged.

### 2. Add route-level rendering hints
**File:** `nuxt.config.ts`

The whole site is static marketing content (no per-user data, no auth). Switch on Nuxt's static generation / prerender so HTML is served from CDN edge instead of being SSR'd per request:

```ts
nitro: {
  prerender: {
    crawlLinks: true,
    routes: ['/', '/systems', '/diagnose'],
    // /systems/[slug] gets crawled automatically because index.vue links to all of them
  },
},
routeRules: {
  '/':           { prerender: true },
  '/systems':    { prerender: true },
  '/systems/**': { prerender: true },
  '/diagnose':   { prerender: true },
},
```

**Cost:** none. **Benefit:** TTFB drops to ~CDN latency; HTML is fully cacheable. The reveal/scramble/scroll animations still hydrate client-side exactly as today.

### 3. Drop the global `IntersectionObserver` retention in `reveal.client.ts`
**File:** `app/plugins/reveal.client.ts:11-28`

```ts
let observer: IntersectionObserver | null = null
const ensureObserver = () => { if (observer) return observer; ... observer = new IO(...) }
```

A single module-scoped observer survives across **every route navigation** — and so does the dataset of elements it once watched. On unmount we call `observer?.unobserve(el)`, which is correct, but the observer itself is never disconnected, so callbacks keep firing during route transitions on elements that are about to be GC'd.

**Fix:** scope the observer to the directive instance with no behavioural change:

```ts
nuxtApp.vueApp.directive('reveal', {
  mounted(el, binding) {
    // ... same body, but on each mount just observe via the shared observer
  },
  beforeUnmount(el) {
    observer?.unobserve(el)
  },
})
```

(Already mostly fine; the win is small. The bigger win is below.)

### 4. Reuse a single `IntersectionObserver` across `TheFinalCta`, `ThePlan`, and `reveal.client.ts`
**Files:** `app/components/TheFinalCta.vue:125-131`, `app/components/ThePlan.vue:36-48`, `app/plugins/reveal.client.ts:11`

Right now there are **at least three separate `IntersectionObserver` instances** running on the homepage (reveal plugin + ThePlan section trigger + TheFinalCta inSection trigger), each scheduling its own callback batch. They're cheap individually but multiply on slow Androids.

**Fix (no visual change):** add a tiny `useReveal()` / `useInView()` composable in `app/composables/` that wraps a singleton observer keyed by threshold/rootMargin. The plugin and both components import from it. The `v-reveal` directive keeps the same signature; `ThePlan` and `TheFinalCta` swap their bespoke `new IntersectionObserver(...)` for `useInView(el, { threshold: 0.25 }, (visible) => drawn.value = visible)`. Identical animation, fewer JS objects, fewer microtasks per scroll.

### 5. Replace the `TheHero` parallax scroll listener with CSS `scroll-timeline` (or keep handler, but stop re-painting non-visible elements)
**File:** `app/components/TheHero.vue:9-18, 122-135, 196-198`

Right now every scroll event (rAF-throttled, good) writes 3 inline `transform: translate3d(0, Npx, 0)` styles on three large blurred elements (`h-[420px]`, `h-[320px]`, the hero card). Even on idle, the layer-tree gets repainted because the `style` attribute keeps mutating.

**Two options that look identical:**

**Option A (preferred — zero JS):** use CSS `animation-timeline: scroll()` (Chromium 115+, ~75% of users today) with a `@supports` block. Keep the JS as fallback for Safari/Firefox. The blobs animate purely on the compositor with no layout/paint work:

```css
@supports (animation-timeline: scroll()) {
  .hero-blob-1 { animation: hero-parallax-1 linear; animation-timeline: scroll(); }
  /* etc */
}
@keyframes hero-parallax-1 { to { transform: translate3d(0, -200px, 0); } }
```

**Option B (smaller change):** keep `scrollY` listener, but `transform` only the blobs (already `will-change: transform`), and **stop re-styling the hero card / grid-bg on every frame**. Move those into the same `requestAnimationFrame` batch and only write when `scrollY` actually changed by ≥ 1 px.

Either way the visual result is identical; option A frees the main thread entirely.

### 6. Use direct icon paths for `@lucide/vue` in hot files
**Files:** every component that imports from `@lucide/vue` (45 files)

`@lucide/vue@1.16.0` has `sideEffects: false` so tree-shaking already works for the production bundle. **But** dev mode and per-chunk de-duplication both benefit from importing the icon module directly. Example for `TheNav.vue:3`:

```ts
// before
import { Menu, X, ArrowRight, ArrowUpRight, Mail } from '@lucide/vue'

// after — same visual icons, smaller per-chunk surface
import Menu from '@lucide/vue/icons/menu'
import X from '@lucide/vue/icons/x'
import ArrowRight from '@lucide/vue/icons/arrow-right'
import ArrowUpRight from '@lucide/vue/icons/arrow-up-right'
import Mail from '@lucide/vue/icons/mail'
```

3,424 individual icon modules exist in `node_modules/@lucide/vue/dist/esm/icons/`. The barrel re-export means Vite still has to resolve the whole index when building dev chunks. Direct paths shave dev-server boot and HMR by skipping the barrel walk, and they remove any risk of accidentally pulling unused icons into a shared vendor chunk in production. Across 45 files the cumulative dev-startup saving is significant on Windows file systems.

### 7. Defer the homepage decorative SVGs until the section is near the viewport
**Files:** `app/components/TheHero.vue:247-266` (weekly throughput chart), `app/components/ThePlan.vue:96-155` (animated connector path with two `animateMotion` loops)

Both are below-the-fold but ship in the initial HTML so the parser has to handle them, and the `<animateMotion>` paths in `ThePlan` start running immediately on mount even before the section is on-screen (`drawn.value` gates it correctly, good). Two cheap wins:

- Wrap them in `<ClientOnly>` with a same-size placeholder (`min-h-[Xpx]` matching the SVG), so the SSR HTML is lighter and the SVG hydrates only when needed.
- Or simpler still: stop the `<animateMotion>` elements from being in the DOM at all until `drawn` is true (currently they already are gated `v-if="drawn"` — good, **but the gradient/animate inside `cpu-text-gradient` and the always-on `plan-badge` conic-gradient spin are not gated**). Add `IntersectionObserver`-based gating to those too. Pure compositor animations, but they still consume one rAF slot each.

### 8. `TheScrollProgress` + `TheNav` listen to the same `scroll` event independently
**Files:** `app/components/TheScrollProgress.vue:14-23`, `app/components/TheNav.vue:8-20`, `app/components/TheHero.vue:14-18`

Three separate `window.addEventListener('scroll', ...)` calls. Each is `passive` and rAF-throttled, so individually fine — but on iOS Safari, the event-listener overhead alone is measurable when you have a long page.

**Fix (no visual change):** add `app/composables/useScroll.ts` that exposes a reactive `scrollY` ref + visibility utilities, all driven by a single `passive` listener. The nav, hero, and progress bar subscribe to that ref. Animations stay identical.

---

## P1 — Meaningful wins, small change footprint

### 9. Memoize `pillarChipsForCard` & related computed lists in `SystemCard.vue`
**File:** `app/components/SystemCard.vue:15-17`

```ts
const pillarChipsForCard = computed(() =>
  PILLARS.filter((p) => props.system.pillars.includes(p.slug)),
)
```

This re-filters on every render of every card. With ~30 cards on `/systems`, the filter runs 30× even though `PILLARS` and `system.pillars` are static once mounted. Precompute the chip array on the data layer (`app/data/systems.ts` → add a derived field `_pillarMetas`) so each card just reads it. Same UI, no `computed` machinery per card.

### 10. Drop `font-feature-settings: 'cv11', 'ss01', 'ss03', 'cv02'` from `body` if the variants aren't visually relied on
**File:** `app/assets/css/main.css:38`

These OpenType variants force the font engine to do extra substitution at layout time. They're nice typography polish but if removing them produces no visible difference (test side-by-side first), you cut a small per-paragraph cost. **Verify visually before removing — keep if you can see a difference.**

### 11. `min-h-screen` on every page wrapper + global `overflow-x: hidden` on `html` and `body`
**Files:** `app/assets/css/main.css:27, 40`, `app/pages/index.vue:2`, `app/pages/systems/index.vue:74`, `app/pages/systems/[slug].vue:38`

`overflow-x: hidden` on **both** `html` and `body` creates two scroll containers. Some browsers (notably Safari) then disable native scroll optimizations and force a software composite path. Keep it on **one** (typically `body`), drop from the other. Visually identical.

### 12. The mobile-menu `Transition` re-mounts the entire menu DOM on every open
**File:** `app/components/TheNav.vue:100-114`

`v-if="open"` plus an opacity-only transition means every tap parses and inserts ~140 lines of DOM. Switch to `v-show` (keeps the node mounted, just toggles `display`). Identical animation (the transition wrapper still drives opacity), but tap-to-open becomes near-instant.

If you keep `v-if` for memory reasons, that's fine — but consider this on mid-range Androids where the first open visibly stutters.

### 13. The `TextScramble` class in `TheHero.vue:31-91` does `el.innerHTML = output` every frame
**File:** `app/components/TheHero.vue:79`

`innerHTML` re-parses on every assignment. Visually you can replace it with a pre-built `<span>` per character + per-frame `textContent` writes; same animation, ~10× cheaper paint cost. Optional — only matters on very low-end devices since the loop pauses for 2.4 s between phrases.

### 14. Static SVG defs in `CpuArchitecture.vue` get duplicated each time the component re-mounts
**File:** `app/components/CpuArchitecture.vue:127-261`

When `TheMeet.vue` re-renders (e.g. on route return), the entire `<defs>` (8 gradients, 2 linear gradients, masks, filters, marker) gets re-parsed. If you only use one `CpuArchitecture` per page, leave it. If you ever embed it twice, hoist `<defs>` to a single top-level SVG (e.g. in `app.vue`) and reference IDs everywhere else. Optional — current usage is one instance.

### 15. Disable the cursor-arrow effect when the section isn't visible
**File:** `app/components/TheFinalCta.vue:88-111, 113-144`

The `tick()` rAF loop runs **continuously** while the user is anywhere on the page (the observer toggles `inSection`, but the rAF keeps scheduling itself). Fix:

```ts
function tick() {
  if (!inSection) {                // ← bail when offscreen
    rafId = requestAnimationFrame(tick)
    return
  }
  // ... existing body ...
}
```

Better: don't schedule rAF at all when `inSection` is false; restart it inside the IntersectionObserver entry callback. Same arrow animation when visible, zero CPU when not.

### 16. Body-class lock in `TheNav.vue:27-30` writes inline style on `document.body`
**File:** `app/components/TheNav.vue:27-30`

`document.body.style.overflow = isOpen ? 'hidden' : ''` is fine, but if you toggle `open` rapidly it can race with the watch. Prefer a CSS class (`body.nav-open { overflow: hidden }`) and just toggle the class. Functionally identical; cleaner cleanup.

---

## P2 — Nice-to-have polish

### 17. Pre-extract Tailwind utility classes for the demos route in production
With Tailwind v4 + JIT this is automatic, but verify that production CSS includes no unused selectors from the giant demo files. Run `npx nuxt build` then inspect `.output/public/_nuxt/*.css`. If it's > 80 KB gzipped, audit for stale demo classes referenced in commented HTML.

### 18. Long expression lists like `pillarChipsForCard` and `currentDef` should use `shallowRef` where deep reactivity isn't needed
**File:** `app/pages/diagnose.vue:178-194`

`reactive({ ... })` does deep proxying. The `answers` object is large; `contact.preferredDate` is a `Date` instance. Use `reactive` for the top-level keys but `shallowReactive` / `ref` for the contact subtree if you ever notice form-input lag. Currently fine; flagging for future scale.

### 19. `view-transition-name`-based hash navigation
The current `scroll-behavior: smooth` in `main.css:23` plus hash-based nav (`/#what-we-build`) is fine, but on mobile Chrome the smooth scroll fights the browser's chrome-hide gesture. Optionally gate to `@media (hover: hover)` so touch devices snap instantly. Visual feel is preserved on desktop; mobile becomes more responsive.

### 20. Use `content-visibility: auto` on long below-the-fold sections
Adding to `TheDoNothing`, `TheWhenItWorks`, `TheFinalCta` outer `<section>`:

```css
@supports (content-visibility: auto) {
  .lazy-section { content-visibility: auto; contain-intrinsic-size: 1px 800px; }
}
```

The browser skips render/layout for offscreen content. Strictly progressive, **no visual change** (the height hint keeps the scrollbar honest). Pair with the existing reveal animations — once the section scrolls in, both kick in correctly.

### 21. Switch the giant Lucide barrel imports in `diagnose.vue` to per-icon paths first
**File:** `app/pages/diagnose.vue:3-18`

`/diagnose` imports 13 icons in one statement, and it's a separate route chunk. This is the biggest single barrel-import in the codebase. Apply rec #6 here first for the largest visible improvement.

---

## What NOT to change (already optimal)

- **`defineAsyncComponent` for all 30 demos** in `app/utils/demoRegistry.ts` — perfect. The demos are ~40 KB each, and only the demo for the current slug is shipped to the user.
- **`prefers-reduced-motion` handling** — every animated section honours it; nothing to do.
- **Scroll listeners are `{ passive: true }` and rAF-throttled** — correct pattern throughout.
- **No images, no third-party scripts, no analytics SDK** — the site is already lean by avoiding the usual heavy hitters.
- **`shallowRef` in `DemoSlot.vue:46`** — already chose the right primitive for component swaps.
- **Single-source-of-truth data in `systems.ts`** — keeps the gallery / detail / nav coherent without runtime fetches.

---

## Suggested order of execution

1. **Day 1 (P0, 1-2 hrs total):** #1 (self-host fonts), #2 (prerender routes), #6 / #21 (direct lucide imports in TheNav + diagnose + the 5-6 hottest demos), #15 (gate the cursor-arrow rAF).
2. **Day 2 (P0/P1, 2-3 hrs):** #4 (single shared IntersectionObserver composable), #5 (option A or B for hero parallax), #8 (shared `useScroll` composable), #12 (`v-show` for mobile menu), #20 (`content-visibility` on long sections).
3. **Day 3 (P1 polish, optional):** #7 (gate decorative SVGs harder), #13 (TextScramble micro-opt), #11 (remove duplicate `overflow-x`), #9 (memo SystemCard derived data).

Total: roughly half a day of focused work to clear P0 alone. The site will look and animate identically — just faster.

---

## Quick measurement plan (verify each change)

After each P0 item lands, run:

```bash
npm run build && npm run preview
```

Then in Chrome DevTools → Lighthouse, run a **mobile, throttled, cold-load** audit against `http://localhost:3000/` and `/systems`. Track:

- **LCP** target: < 2.0 s mobile (currently likely ~2.5-3.0 s due to Google Fonts).
- **TBT** target: < 100 ms (currently likely 150-300 ms on slow CPUs from the multiple scroll/IO listeners).
- **Bundle size** for `/` route entry (`.output/public/_nuxt/_payload.json` + entry chunk): target < 90 KB gzipped JS.

Each individual change is reversible by a single git revert; none of them touch the visual layer, copy, or animation curves.
