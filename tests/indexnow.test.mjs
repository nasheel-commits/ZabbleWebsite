/**
 * S09 — IndexNow ping behaviour tests (no network; uses --dry-run).
 *
 * Proves the publish-time ping refuses staging/preview/localhost hosts and emits
 * a correct, host-scoped IndexNow payload for production.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const script = join(root, 'scripts/indexnow-ping.mjs')
const KEY = '34cc0be3679dd090c399c3f817b64ee0'

function run(args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' })
}
function urlsFile(contents) {
  const dir = mkdtempSync(join(tmpdir(), 'indexnow-'))
  const f = join(dir, 'urls.txt')
  writeFileSync(f, contents)
  return f
}

test('refuses a staging host (even with --dry-run)', () => {
  const r = run(['--host', 'https://staging.zabble.org', '--dry-run'])
  assert.equal(r.status, 1)
  assert.match(r.stderr, /Refusing/i)
})

test('refuses localhost and preview hosts', () => {
  assert.equal(run(['--host', 'http://localhost:3000', '--dry-run']).status, 1)
  assert.equal(run(['--host', 'https://preview.zabble.org', '--dry-run']).status, 1)
})

test('production dry-run emits a correct, host-scoped payload', () => {
  const f = urlsFile(
    'https://zabble.org/\nhttps://zabble.org/systems\n# a comment\nhttps://evil.example.com/x\n',
  )
  const r = run(['--host', 'https://zabble.org', '--dry-run', '--urls', f])
  assert.equal(r.status, 0, r.stderr)
  const payload = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')))
  assert.equal(payload.host, 'zabble.org')
  assert.equal(payload.key, KEY)
  assert.equal(payload.keyLocation, `https://zabble.org/${KEY}.txt`)
  assert.ok(payload.urlList.includes('https://zabble.org/'))
  assert.ok(payload.urlList.includes('https://zabble.org/systems'))
  // Off-host URLs and comments are dropped.
  assert.ok(!payload.urlList.some((u) => u.includes('evil.example.com')))
  assert.ok(!payload.urlList.some((u) => u.startsWith('#')))
})

test('--force overrides the staging guard (explicit cutover)', () => {
  const f = urlsFile('https://staging.zabble.org/\n')
  const r = run(['--host', 'https://staging.zabble.org', '--force', '--dry-run', '--urls', f])
  assert.equal(r.status, 0, r.stderr)
})
