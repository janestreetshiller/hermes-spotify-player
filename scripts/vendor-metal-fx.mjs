// Embed the actual library engine: Hermes runtime plugins cannot import local modules.
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const source = await readFile(new URL('../vendor/metal-fx/index.es.js', import.meta.url), 'utf8')
const provenance = JSON.parse(await readFile(new URL('../vendor/metal-fx/provenance.json', import.meta.url)))
assert.equal(createHash('sha256').update(source).digest('hex'), provenance.sha256)
const start = source.indexOf('function xt(e) {')
const end = source.indexOf('\nconst ce = {')
assert.ok(start > 0 && end > start)
// Preserve the published shaders, palettes, ring compositor and instance API.
// Omit React wrapper/proximity-glow code: Spotify owns a stable native button.
let engine = source.slice(start, end)
assert.equal(engine.split('Tt = 2').length, 2)
engine = engine.replace('Tt = 2', 'Tt = 1')
engine = engine.replaceAll('typeof window < "u" && window.devicePixelRatio || 1', '1')
const license = await readFile(new URL('../vendor/metal-fx/LICENSE', import.meta.url), 'utf8')
const block = `// BEGIN VENDORED METAL-FX\n/*! metal-fx@1.0.4 — Alloy artifact.\n${license}*/\nlet metalFxLibrary\nfunction getMetalFxLibrary() {\n  if (metalFxLibrary) return metalFxLibrary\n  // Local scheduling only: never replace the host's animation APIs.\n  const requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 1000 / 12)\n  const cancelAnimationFrame = handle => clearTimeout(handle)\n${engine}\n  return metalFxLibrary = { createInstance: Wt, destroyInstance: Gt, updateInstance: oe, setSharedPreset: Ut, dispose: $t }\n}\n// END VENDORED METAL-FX`
const target = new URL('../desktop/plugin.js', import.meta.url)
const plugin = await readFile(target, 'utf8')
const marker = /\/\/ BEGIN VENDORED METAL-FX[\s\S]*?\/\/ END VENDORED METAL-FX/
const next = marker.test(plugin) ? plugin.replace(marker, () => block) : plugin.replace("const PLUGIN_ID =", `${block}\n\nconst PLUGIN_ID =`)
if (process.argv.includes('--check')) assert.equal(plugin, next, 'Run node scripts/vendor-metal-fx.mjs to regenerate the vendored engine')
else await writeFile(target, next)
console.log(`metal-fx@1.0.4 ${process.argv.includes('--check') ? 'verified' : 'embedded'}; original shader retained; DPR 1, 12fps, no proximity scanning`)
