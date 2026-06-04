<script setup lang="ts">
// Privacy / POPIA notice. New page owned by S09 (analytics/indexing); it carries
// its own minimal head (no marketing-meta overlap with S02). Server-rendered:
// prerendered via routeRules + reachable from the footer (crawlLinks).
import { useAnalytics } from '~/composables/useAnalytics'

const analytics = useAnalytics()
const lastUpdated = '4 June 2026'

useHead({
  title: 'Privacy Notice · Zabble',
  meta: [
    {
      name: 'description',
      content:
        'How Zabble collects, uses, and protects personal information under South Africa\'s ' +
        'Protection of Personal Information Act (POPIA), and the rights you have over your data.',
    },
    // Legal pages add no SEO value as ranking targets; keep them out of the index
    // race without blocking access. (S01 owns global robots; this is page-level.)
    { name: 'robots', content: 'noindex, follow' },
  ],
})
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
            Privacy Notice
          </h1>
          <p class="mt-4 text-[15px] text-mute-2">Last updated: {{ lastUpdated }}</p>
          <p class="mt-6 text-[16px] md:text-[17px] leading-[1.7] text-mute">
            This notice explains how <strong class="text-ink">Zabble</strong> ("we", "us") collects,
            uses, shares, and protects your personal information, and the rights you have under the
            <strong class="text-ink">Protection of Personal Information Act, 2013 (POPIA)</strong> of
            South Africa. We keep it plain on purpose — privacy shouldn't need a translator.
          </p>
        </header>

        <section>
          <h2>1. Who is responsible for your information</h2>
          <p>
            Zabble is the <em>responsible party</em> (the equivalent of a "data controller") for the
            personal information described here. You can reach our Information Officer at
            <a href="mailto:analytics@zabble.org">analytics@zabble.org</a> for any privacy question,
            request, or complaint.
          </p>
        </section>

        <section>
          <h2>2. The personal information we collect</h2>
          <ul>
            <li>
              <strong>Information you give us.</strong> When you complete the diagnostic at
              <NuxtLink to="/diagnose">/diagnose</NuxtLink> or email us, we collect your name, work
              email, company, optional phone number, and whatever you choose to tell us about your
              operational challenge and preferred call time.
            </li>
            <li>
              <strong>Information collected automatically.</strong> If — and only if — you consent to
              analytics cookies, we collect usage information: pages viewed, clicks, approximate
              location (country/region), device and browser type, and how you arrived. See our
              <NuxtLink to="/cookie-policy">Cookie Policy</NuxtLink> for the detail.
            </li>
          </ul>
          <p>
            We do not collect special personal information (e.g. health, religion, biometrics), and we
            do not knowingly collect information from children.
          </p>
        </section>

        <section>
          <h2>3. Why we use it, and our lawful basis</h2>
          <table>
            <thead>
              <tr><th>Purpose</th><th>POPIA lawful basis</th></tr>
            </thead>
            <tbody>
              <tr><td>Reply to your enquiry and run a discovery call</td><td>Performance of / steps toward a contract; your consent</td></tr>
              <tr><td>Build your Operational Pain Profile and follow up</td><td>Your consent; our legitimate interest in serving prospective clients</td></tr>
              <tr><td>Measure and improve the website (analytics)</td><td>Your <strong>consent</strong> (opt-in) — nothing analytics-related runs until you accept</td></tr>
              <tr><td>Keep records and meet legal obligations</td><td>Legal obligation; legitimate interest</td></tr>
            </tbody>
          </table>
          <p>
            We will not use your information for a new, incompatible purpose without telling you first
            and, where required, obtaining your consent.
          </p>
        </section>

        <section>
          <h2>4. Cookies and analytics</h2>
          <p>
            We use a privacy-first, opt-in approach. Until you accept, no non-essential cookies or
            analytics scripts load. The full breakdown — categories, providers (Google Analytics 4,
            Microsoft Clarity), and how to change your mind — lives in our
            <NuxtLink to="/cookie-policy">Cookie Policy</NuxtLink>.
          </p>
        </section>

        <section>
          <h2>5. Who we share it with (operators)</h2>
          <p>We don't sell your personal information. We share it only with:</p>
          <ul>
            <li><strong>Service providers ("operators")</strong> who process information on our behalf under contract — for example, our email provider, and (with your consent) Google for Analytics and Microsoft for Clarity.</li>
            <li><strong>Authorities</strong>, where we're legally required to disclose information.</li>
          </ul>
        </section>

        <section>
          <h2>6. Cross-border transfers</h2>
          <p>
            Some operators (e.g. Google, Microsoft) process information outside South Africa. Where we
            transfer personal information across borders, we do so in line with POPIA section 72 —
            relying on the operator's contractual safeguards and recognised data-protection standards.
          </p>
        </section>

        <section>
          <h2>7. How we keep it safe</h2>
          <p>
            We apply reasonable technical and organisational measures — access controls, encryption in
            transit, and the principle of collecting only what we need — to guard against loss, misuse,
            and unauthorised access, as POPIA section 19 requires.
          </p>
        </section>

        <section>
          <h2>8. How long we keep it</h2>
          <p>
            We keep enquiry and client information only as long as needed for the purpose collected, or
            as the law requires — typically up to 36 months after our last meaningful contact, after
            which we delete or de-identify it. Analytics data is retained per the settings in Google
            Analytics 4 (currently 14 months).
          </p>
        </section>

        <section>
          <h2>9. Your rights under POPIA</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Ask what personal information we hold about you, and request a copy;</li>
            <li>Ask us to correct or delete information that is inaccurate, irrelevant, or excessive;</li>
            <li>Object to processing based on legitimate interest, and withdraw consent at any time;</li>
            <li>Not be subject to a decision based solely on automated processing;</li>
            <li>Lodge a complaint with the Information Regulator.</li>
          </ul>
          <p>
            To exercise any of these, email <a href="mailto:analytics@zabble.org">analytics@zabble.org</a>.
            Withdrawing analytics consent is one click — use
            <button type="button" class="link-button" @click="analytics.openSettings()">cookie settings</button>
            or the control on our <NuxtLink to="/cookie-policy">Cookie Policy</NuxtLink> page.
          </p>
        </section>

        <section>
          <h2>10. The Information Regulator</h2>
          <p>
            If you're not satisfied with how we've handled your information, you may complain to South
            Africa's Information Regulator:
          </p>
          <ul>
            <li>Website: <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer">inforegulator.org.za</a></li>
            <li>Email: <a href="mailto:POPIAComplaints@inforegulator.org.za">POPIAComplaints@inforegulator.org.za</a></li>
          </ul>
        </section>

        <section>
          <h2>11. Changes to this notice</h2>
          <p>
            We'll update this page when our practices change and revise the "last updated" date above.
            Material changes affecting how we use your information will be made clear.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Questions? Email our Information Officer at
            <a href="mailto:analytics@zabble.org">analytics@zabble.org</a>. We'd rather you ask than wonder.
          </p>
        </section>

        <div class="mt-12">
          <NuxtLink to="/" class="text-[15px] text-mute hover:text-ink transition underline-offset-4 hover:underline">
            ← Back to home
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
.legal section + section {
  margin-top: 0.25rem;
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
.legal a,
.legal .link-button {
  color: var(--color-ink);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--color-cyan-brand);
  transition: color 160ms ease;
}
.legal a:hover,
.legal .link-button:hover {
  color: var(--color-cyan-brand-deep);
}
.legal .link-button {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
.legal table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 14.5px;
}
.legal th,
.legal td {
  text-align: left;
  vertical-align: top;
  border: 1px solid var(--color-line);
  padding: 0.6rem 0.8rem;
  color: var(--color-mute);
  line-height: 1.55;
}
.legal th {
  background: var(--color-surface-alt);
  color: var(--color-ink);
  font-weight: 600;
}
</style>
