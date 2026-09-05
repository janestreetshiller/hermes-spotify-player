import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
// Execute the disk plugin with SDK seams; no runtime package or private bridge.
const code = readFileSync(new URL('./plugin.js', import.meta.url), 'utf8').replace(/^import .* from .*$/gm, '').replace('export default', 'globalThis.plugin =')
function load() {
  const sandbox = { atom: value => ({ get: () => value, set: v => { value = v } }), console }
  vm.createContext(sandbox); vm.runInContext(code, sandbox); return sandbox
}
test('decorative GPU work requires explicit consent, visibility, playback and motion', () => {
  const s = load()
  assert.equal(typeof s.signalAllowed, 'function')
  assert.equal(s.signalAllowed(true, true, true, false), true)
  assert.equal(s.signalAllowed(false, true, true, false), false)
  assert.equal(s.signalAllowed(true, false, true, false), false)
  assert.equal(s.signalAllowed(true, true, false, false), false)
  assert.equal(s.signalAllowed(true, true, true, true), false)
})
test('polling backs off and fully stops in background', () => {
  const s = load()
  assert.equal(typeof s.statusInterval, 'function')
  assert.equal(s.statusInterval({state:'playing'}, true), 4000)
  assert.equal(s.statusInterval({state:'paused'}, true), 15000)
  assert.equal(s.statusInterval({state:'stopped',running:true}, true), 30000)
  assert.equal(s.statusInterval({state:'playing'}, false), false)
  assert.equal(s.statusInterval({state:'playing'}, true, true), 30000)
})
