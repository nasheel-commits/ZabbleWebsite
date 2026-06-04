/**
 * S09 — static-output (prerender) guarantees.
 *
 * The strongest POPIA proof: generate the site WITH placeholder analytics +
 * verification ids set, then assert that the prerendered HTML contains NO
 * analytics scripts and NO dataLayer/consent state — yet the id still reaches
 * the client runtime payload. That is consent-gating (nothing fires pre-consent)
 * separated from wiring (the id is available to load once the user opts in).
 *
 * Self-contained: regenerates `.output/public` with the placeholder ids if the
 * current output doesn't already carry the marker. ~40-60s on a cold run.
 */
import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, '.output/public')
const KEY = '34cc0be3679dd090c399c3f817b64ee0'
const GTM_MARKER = 'GTM-TEST123'
const GOOGLE_MARKER = 'test-google-verify-123'
const BING_MARKER = 'TESTBING123'

const indexHtml = () => readFileSync(join(pub, 'index.html'), 'utf8')

before(
  () => {
    const idx = join(pub, 'index.html')
    // Comprehensive readiness: every feature this build introduces must already
    // be present, otherwise a stale output would silently pass/fail wrongly.
    const ready =
      existsSync(idx) &&
      indexHtml().includes(GTM_MARKER) &&
      indexHtml().includes(GOOGLE_MARKER) &&
      existsSync(join(pub, 'privacy/index.html')) &&
      existsSync(join(pub, 'cookie-policy/index.html'))
    if (!ready) {
      execSync('npm run generate', {
        cwd: root,
        stdio: 'inherit',
        env: {
          ...process.env,
          NUXT_PUBLIC_ANALYTICS_GTM_ID: GTM_MARKER,
          NUXT_PUBLIC_VERIFICATION_GOOGLE: GOOGLE_MARKER,
          NUXT_PUBLIC_VERIFICATION_BING: BING_MARKER,
        },
      })
    }
  },
  { timeout: 600000 },
)

test('prerendered HTML loads NO analytics scripts pre-consent', () => {
  assert.doesNotMatch(indexHtml(), /googletagmanager\.com|clarity\.ms|gtag\(/)
})

test('prerendered HTML exposes NO dataLayer / consent state pre-consent', () => {
  assert.doesNotMatch(indexHtml(), /dataLayer|zabble_consent/)
})

test('the analytics id IS wired to the client (env → runtime payload)', () => {
  // Present as config so the client CAN load it after opt-in — but not as a tag.
  assert.match(indexHtml(), new RegExp(GTM_MARKER))
})

test('GSC + Bing verification meta render into SSR head from env', () => {
  const html = indexHtml()
  assert.match(html, new RegExp(`name="google-site-verification"[^>]*content="${GOOGLE_MARKER}"`))
  assert.match(html, new RegExp(`name="msvalidate.01"[^>]*content="${BING_MARKER}"`))
})

test('IndexNow key file is served at /<key>.txt', () => {
  const served = readFileSync(join(pub, `${KEY}.txt`), 'utf8').trim()
  assert.equal(served, KEY)
})

test('POPIA legal pages are prerendered (server-rendered)', () => {
  assert.ok(existsSync(join(pub, 'privacy/index.html')), '/privacy must prerender')
  assert.ok(existsSync(join(pub, 'cookie-policy/index.html')), '/cookie-policy must prerender')
})

test('legal pages are reachable from the footer (crawl path + real content)', () => {
  const html = indexHtml()
  assert.match(html, /href="\/privacy"/)
  assert.match(html, /href="\/cookie-policy"/)
  // The pages carry real POPIA content, not stubs.
  const privacy = readFileSync(join(pub, 'privacy/index.html'), 'utf8')
  assert.match(privacy, /Protection of Personal Information Act/)
  assert.match(privacy, /Information Regulator/)
  const cookies = readFileSync(join(pub, 'cookie-policy/index.html'), 'utf8')
  assert.match(cookies, /Consent Mode/)
  assert.match(cookies, /Strictly necessary/)
})
