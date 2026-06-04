<script setup lang="ts">
// Cookie Policy. New page owned by S09. Server-rendered (prerendered + footer
// crawl path). The "Manage cookie settings" control re-opens the CMP dialog.
import { useAnalytics } from '~/composables/useAnalytics'

const analytics = useAnalytics()
const lastUpdated = '4 June 2026'

// Per-page SEO (S02 standard): bare title + canonical + OG/Twitter via usePageSeo.
usePageSeo({
  title: 'Cookie Policy',
  description:
    'The cookies Zabble uses, why, and how to control them. Opt-in by design under POPIA, nothing non-essential loads until you accept.',
  path: '/cookie-policy',
  ogType: 'website',
})
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })
</script>

<template>
  <div class="min-h-screen bg-surface text-ink antialiased">
    <TheNav />

    <main class="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-24">
      <article class="legal mx-auto max-w-3xl px-5 md:px-8 lg:px-12">
        <header>
          <div
            class="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
          >
            <span class="dot" />
            Legal
          </div>
          <h1
            class="mt-5 font-display text-[36px] sm:text-[46px] md:text-[56px] leading-[1.05] tracking-tight text-ink"
          >
            Cookie Policy
          </h1>
          <p class="mt-4 text-[15px] text-mute-2">Last updated: {{ lastUpdated }}</p>
          <p class="mt-6 text-[16px] md:text-[17px] leading-[1.7] text-mute">
            This policy explains the cookies and similar technologies Zabble uses, and how you stay in
            control. It sits alongside our <NuxtLink to="/privacy">Privacy Notice</NuxtLink>.
          </p>
        </header>

        <section>
          <h2>1. Our opt-in approach</h2>
          <p>
            Under South Africa's <strong class="text-ink">POPIA</strong>, we treat analytics and
            marketing cookies as opt-in. When you arrive, only strictly-necessary cookies are active.
            <strong class="text-ink">Nothing else loads until you press "Accept".</strong> We use
            Google Consent Mode v2 with every signal denied by default, and we only load Google
            Analytics and Microsoft Clarity after you consent. Reject, and they never load.
          </p>
        </section>

        <section>
          <h2>2. What is a cookie?</h2>
          <p>
            A cookie is a small file a website stores on your device. Some sites also use related
            technologies (local storage, tags). We use a single local-storage entry
            (<code>zabble_consent_v1</code>) just to remember your cookie choice, that one is
            strictly necessary and always on.
          </p>
        </section>

        <section>
          <h2>3. The cookies we use</h2>
          <table>
            <thead>
              <tr><th>Category</th><th>Provider</th><th>Purpose</th><th>Typical duration</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Strictly necessary</td>
                <td>Zabble</td>
                <td>Remember your consent choice (<code>zabble_consent_v1</code>); keep the site working. Always on.</td>
                <td>Until you clear it</td>
              </tr>
              <tr>
                <td>Analytics</td>
                <td>Google Analytics 4</td>
                <td>Understand which pages and systems are useful, so we can improve them. Loaded only with consent.</td>
                <td>Up to 2 years</td>
              </tr>
              <tr>
                <td>Analytics</td>
                <td>Microsoft Clarity</td>
                <td>Aggregate heatmaps and session insights to find usability issues. Loaded only with consent.</td>
                <td>Up to 1 year</td>
              </tr>
              <tr>
                <td>Marketing</td>
                <td>Google</td>
                <td>Ad-measurement signals. <strong>Off by default</strong>; only if you enable Marketing.</td>
                <td>Up to 2 years</td>
              </tr>
            </tbody>
          </table>
          <p>
            Exact cookie names depend on each provider; the categories above are what matters for your
            choice.
          </p>
        </section>

        <section>
          <h2>4. Manage your choices</h2>
          <p>
            You can change or withdraw your consent at any time, your choice takes effect immediately.
          </p>
          <p>
            <button type="button" class="manage-btn" @click="analytics.openSettings()">
              Manage cookie settings
            </button>
          </p>
          <p>
            You can also clear cookies and site data in your browser, or use your browser's tracking
            controls. If you withdraw analytics consent, we stop loading those tools on your next page
            view.
          </p>
        </section>

        <section>
          <h2>5. Third-party tools</h2>
          <ul>
            <li>Google Analytics 4, <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
            <li>Microsoft Clarity, <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft Privacy Statement</a></li>
          </ul>
          <p>These tools only run with your consent and are configured to respect Consent Mode.</p>
        </section>

        <section>
          <h2>6. Changes &amp; contact</h2>
          <p>
            We'll update this page when our cookie use changes and revise the date above. Questions go
            to <a href="mailto:sales@zabble.org">sales@zabble.org</a>.
          </p>
        </section>

        <div class="mt-12">
          <NuxtLink to="/privacy" class="text-[15px] text-mute hover:text-ink transition underline-offset-4 hover:underline">
            ← Read our Privacy Notice
          </NuxtLink>
        </div>
      </article>
    </main>

    <TheFooter />
  </div>
</template>

<style scoped>
.legal :deep(h2) {
  font-family: var(--font-display);
  font-size: 24px;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--color-ink);
  margin-top: 2.75rem;
  margin-bottom: 0.75rem;
}
.legal p {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-mute);
  margin-top: 0.75rem;
}
.legal ul {
  list-style: disc;
  padding-left: 1.25rem;
  margin-top: 0.75rem;
}
.legal li {
  font-size: 16px;
  line-height: 1.65;
  color: var(--color-mute);
  margin-top: 0.4rem;
}
.legal a {
  color: var(--color-ink);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--color-cyan-brand);
  transition: color 160ms ease;
}
.legal a:hover {
  color: var(--color-cyan-brand-deep);
}
.legal code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-line);
  border-radius: 4px;
  padding: 0.05rem 0.35rem;
}
.legal table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 14px;
}
.legal th,
.legal td {
  text-align: left;
  vertical-align: top;
  border: 1px solid var(--color-line);
  padding: 0.55rem 0.7rem;
  color: var(--color-mute);
  line-height: 1.5;
}
.legal th {
  background: var(--color-surface-alt);
  color: var(--color-ink);
  font-weight: 600;
}
.manage-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  background: var(--color-ink);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 0.6rem 1.1rem;
  transition: background-color 160ms ease;
}
.manage-btn:hover {
  background: var(--color-ink-soft);
}
</style>
