import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
// Execute the disk plugin with SDK seams; no runtime package or private bridge.
const code = readFileSync(new URL('./plugin.js', import.meta.url), 'utf8').replace(/^import .* from .*$/gm, '').replace('export default', 'globalThis.plugin =')
function load() {
  const sandbox = { PALETTE_AREA: 'commands', atom: value => ({ get: () => value, set: v => { value = v } }), console }
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
test('shell settings accept only the two modes and bundled skins', () => {
  const s = load()
  assert.equal(typeof s.playerPreferences, 'function')
  assert.equal(JSON.stringify(s.playerPreferences({mode:'off',skin:'ice',view:'lyrics'})), JSON.stringify({mode:'off',skin:'ice',view:'lyrics'}))
  assert.equal(JSON.stringify(s.playerPreferences({mode:'tiny',skin:'url(evil)',view:'bad'})), JSON.stringify({mode:'on',skin:'chrome',view:'artwork'}))
})

test('screen-off releases the actual contributed pane height, not just its child', () => {
  const s = load(), panes = new Map()
  s.plugin.register({storage:{get:()=>null}, rest:()=>{},register:c=>panes.set(c.id,c)})
  assert.equal(typeof s.updatePlayerPane, 'function')
  const original = panes.get('native-side-pocket')
  s.updatePlayerPane('off')
  const compact = panes.get('native-side-pocket')
  assert.equal(compact.data.height, '112px')
  assert.equal(compact.data.minHeight, '112px')
  assert.equal(compact.data.maxHeight, '112px', 'no unused reservation in screen-off')
  assert.equal(compact.render, original.render, 'a mode switch cannot remount the player')
  assert.equal(compact.data.collapsible, true)
  s.updatePlayerPane('on')
  assert.equal(panes.get('native-side-pocket').data.height, '280px')
  assert.equal(panes.get('native-side-pocket').data.maxHeight, '280px', 'screen-on also fits exactly')
  s.updatePlayerPane('on',234/320,28)
  assert.equal(panes.get('native-side-pocket').data.height, `${Math.ceil(280*234/320)+28}px`)
  s.updatePlayerPane('off',234/320,28)
  assert.equal(panes.get('native-side-pocket').data.height, `${Math.ceil(112*234/320)+28}px`)
  assert.equal(panes.size,3,'never add another pane or reset the layout')
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
