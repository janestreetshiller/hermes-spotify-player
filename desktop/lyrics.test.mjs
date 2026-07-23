import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./plugin.js', import.meta.url), 'utf8')
const start = source.indexOf('function lrcTimestampSeconds')
const end = source.indexOf('function SyncedLyrics')
assert.ok(start >= 0 && end > start, 'lyric timing helpers must exist in plugin.js')

const helpers = new Function(`${source.slice(start, end)}\nreturn { lrcTimestampSeconds, parseSyncedLyrics, activeLyricPosition }`)()

assert.equal(helpers.lrcTimestampSeconds('1', '02', '5'), 62.5)
assert.equal(helpers.lrcTimestampSeconds('0', '03', '25'), 3.25)
assert.equal(helpers.lrcTimestampSeconds('0', '04', '125'), 4.125)

const lines = helpers.parseSyncedLyrics([
  '[00:01.00] Quiet words arrive',
  '[00:04.00][00:08.00] Then move again',
  '[00:12.50] Last line'
].join('\n'), 20)

assert.deepEqual(lines.map(line => line.startSeconds), [1, 4, 8, 12.5])
assert.deepEqual(lines[0].words, ['Quiet ', 'words ', 'arrive'])
assert.equal(lines[0].endSeconds, 4)
assert.equal(lines.at(-1).endSeconds, 20)
assert.deepEqual(helpers.activeLyricPosition(lines, 0.9), { lineIndex: -1, wordIndex: -1 })
assert.deepEqual(helpers.activeLyricPosition(lines, 1), { lineIndex: 0, wordIndex: 0 })
assert.deepEqual(helpers.activeLyricPosition(lines, 2.5), { lineIndex: 0, wordIndex: 1 })
assert.deepEqual(helpers.activeLyricPosition(lines, 3.99), { lineIndex: 0, wordIndex: 2 })
assert.deepEqual(helpers.activeLyricPosition(lines, 8), { lineIndex: 2, wordIndex: 0 })

console.log('spotify lyric timing tests passed')
