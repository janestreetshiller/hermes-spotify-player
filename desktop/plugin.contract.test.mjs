import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const pluginUrl = new URL('./plugin.js', import.meta.url)

async function pluginSource() {
  return readFile(pluginUrl, 'utf8')
}

test('uses the supported plugin REST namespace instead of a private desktop bridge', async () => {
  const text = await pluginSource()

  assert.match(text, /ctx\.rest\('\/control'/)
  assert.doesNotMatch(text, /hermesDesktop\?\.spotify\?\.control/)
})

test('registers Spotify in a deterministic resizable side pocket', async () => {
  const text = await pluginSource()

  assert.match(text, /id:\s*'native-side-pocket'/)
  assert.match(text, /area:\s*'panes'/)
  assert.match(text, /placement:\s*'left'/)
  assert.match(text, /collapsible:\s*true/)
  assert.match(text, /dock:\s*\{\s*pane:\s*'sessions',\s*pos:\s*'bottom'\s*\}/)
  assert.match(text, /height:\s*'152px'/)
  assert.match(text, /minHeight:\s*'68px'/)
  assert.match(text, /maxHeight:\s*'520px'/)
})

test('scales the player from compact through default to expanded artwork and lyrics', async () => {
  const text = await pluginSource()

  assert.match(text, /new ResizeObserver/)
  assert.match(text, /function nextPlayerDisplayMode/)
  assert.match(text, /activeExpandedView/)
  assert.match(text, /children: 'Artwork'/)
  assert.match(text, /children: 'Lyrics'/)
  assert.match(text, /runNativeSpotify\('lyrics'/)
  assert.match(text, /formatTime\(player\.positionSeconds\)/)
})

test('uses a stable viewport and hysteresis so resize jitter cannot strobe modes', async () => {
  const text = await pluginSource()
  const start = text.indexOf('function nextPlayerDisplayMode')
  const end = text.indexOf('\n\nfunction NativePlayer()', start)

  assert.ok(start >= 0 && end > start)
  const selectMode = Function(`${text.slice(start, end)}; return nextPlayerDisplayMode`)()
  assert.equal([103, 105, 102, 106, 104].reduce(selectMode, 'default'), 'default')
  assert.equal(selectMode('default', 95), 'compact')
  assert.equal([98, 104, 111].reduce(selectMode, 'compact'), 'compact')
  assert.equal(selectMode('compact', 113), 'default')
  assert.equal([252, 260, 268, 259].reduce(selectMode, 'default'), 'default')
  assert.equal(selectMode('default', 277), 'expanded')
  assert.equal([270, 260, 245].reduce(selectMode, 'expanded'), 'expanded')
  assert.equal(selectMode('expanded', 243), 'default')
  assert.match(text, /const viewport = element\.parentElement/)
  assert.match(text, /observer\.observe\(viewport\)/)
  assert.doesNotMatch(text, /observer\.observe\(element\)/)
})

test('keeps one persistent player state while the side pocket crosses size thresholds', async () => {
  const text = await pluginSource()
  const nativePlayer = text.slice(text.indexOf('function NativePlayer()'), text.indexOf('function SpotifyPlaylistDialog'))
  const fullHeightSurfaces = nativePlayer.match(/className: '[^']*h-full[^']*min-h-0[^']*overflow-hidden[^']*'/g) || []

  assert.equal(fullHeightSurfaces.length, 3)
  assert.ok(nativePlayer.indexOf('const [player, setPlayer]') < nativePlayer.indexOf('const [displayMode, setDisplayMode]'))
  assert.ok(nativePlayer.indexOf('const [savedState, setSavedState]') < nativePlayer.indexOf('const [displayMode, setDisplayMode]'))
  assert.doesNotMatch(nativePlayer, /key: displayMode|setPlayer\([^)]*displayMode/)
})

test('keeps a compact Spotify control visible when the right rail is closed', async () => {
  const text = await pluginSource()

  assert.match(text, /function SpotifyStatusBar\(\)/)
  assert.match(text, /id:\s*'persistent-status'/)
  assert.match(text, /area:\s*'statusBar\.right'/)
  assert.match(text, /showArtist\s*\?\s*secondaryLabel\s*:\s*primaryLabel/)
  assert.match(text, /FOOTER_ROTATE_MS/)
  assert.match(text, /aria-label':\s*isPlaying\s*\?\s*'Pause Spotify'\s*:\s*'Play Spotify'/)
  assert.match(text, /defaultEnabled:\s*true/)
})

test('provides a centered command-palette-style Spotify search', async () => {
  const text = await pluginSource()

  assert.match(text, /function SpotifySearchDialog\(\)/)
  assert.match(text, /jsx\(DialogContent,\s*\{[\s\S]*max-w-lg/)
  assert.match(text, /area:\s*PALETTE_AREA/)
  assert.match(text, /label:\s*'Spotify: Search music'/)
  assert.match(text, /runNativeSpotify\('search',\s*query\)/)
  assert.match(text, /setResults\(snapshot\.results\.slice\(0,\s*10\)\)/)
  assert.match(text, /results\.map\(result\s*=>/)
  assert.match(text, /runNativeSpotify\('play-uri',\s*result\.uri\)/)
  assert.equal((text.match(/'aria-label':\s*'Search Spotify'/g) || []).length, 3)
})

test('provides native playback controls and status polling', async () => {
  const text = await pluginSource()

  assert.match(text, /runNativeSpotify\('status'\)/)
  assert.match(text, /act\('playpause'\)/)
  assert.match(text, /act\('previous'\)/)
  assert.match(text, /act\('next'\)/)
})

test('advances the visible timeline one second at a time between authoritative polls', async () => {
  const text = await pluginSource()
  const start = text.indexOf('function nextTimelinePosition')
  const end = text.indexOf('\n\nfunction nextPlayerDisplayMode', start)

  assert.ok(start >= 0 && end > start)
  const nextPosition = Function(`${text.slice(start, end)}; return nextTimelinePosition`)()
  assert.equal(nextPosition({ state: 'playing', positionSeconds: 111.2, durationMs: 219000 }), 112)
  assert.equal(nextPosition({ state: 'playing', positionSeconds: 112, durationMs: 219000 }), 113)
  assert.equal(nextPosition({ state: 'paused', positionSeconds: 112, durationMs: 219000 }), 112)
  assert.equal(nextPosition({ state: 'playing', positionSeconds: 219, durationMs: 219000 }), 219)
  assert.match(text, /setPlayer\(current => \{[\s\S]*nextTimelinePosition\(current\)[\s\S]*positionSeconds: nextPosition/)
  assert.match(text, /\}, 1000\)/)
  assert.match(text, /POLL_MS = 4000/)
})

test('reconciles small polling drift without skipping or rewinding the displayed second', async () => {
  const text = await pluginSource()
  const start = text.indexOf('function mergePlayerSnapshot')
  const end = text.indexOf('\n\nfunction nextPlayerDisplayMode', start)

  assert.ok(start >= 0 && end > start)
  const merge = Function(`${text.slice(start, end)}; return mergePlayerSnapshot`)()
  const current = { state: 'playing', spotifyUrl: 'spotify:track:a', positionSeconds: 112, durationMs: 219000 }
  assert.equal(merge(current, { ...current, positionSeconds: 113.8 }).positionSeconds, 113)
  assert.equal(merge(current, { ...current, positionSeconds: 111.4 }).positionSeconds, 112)
  assert.equal(merge(current, { ...current, positionSeconds: 130 }).positionSeconds, 130)
  assert.equal(merge(current, { ...current, spotifyUrl: 'spotify:track:b', positionSeconds: 5 }).positionSeconds, 5)
  assert.match(text, /setPlayer\(current => mergePlayerSnapshot\(current, snapshot\)\)/)
})

test('provides subtle like and add-to-playlist controls for the current track', async () => {
  const text = await pluginSource()

  assert.match(text, /runNativeSpotify\('saved-status',\s*uri\)/)
  assert.match(text, /runNativeSpotify\('set-saved'/)
  assert.match(text, /savedAriaLabel/)
  assert.match(text, /savedControlLabel/)
  assert.match(text, /aria-label':\s*'Add current track to playlist'/)
  assert.match(text, /function SpotifyPlaylistDialog/)
  assert.match(text, /runNativeSpotify\('playlists'\)/)
  assert.match(text, /runNativeSpotify\('playlist-add'/)
  assert.match(text, /SearchField/)
  assert.match(text, /Filter playlists…/)
  assert.match(text, /playlist\.trackCount === 1 \? 'track' : 'tracks'/)
})

test('binds liked state to the exact active stream before allowing mutations', async () => {
  const text = await pluginSource()

  assert.match(text, /const \[savedState, setSavedState\] = useState\(\{ uri: '', status: 'idle', saved: null \}\)/)
  assert.match(text, /setSavedState\(\{ uri, status: 'loading', saved: null \}\)/)
  assert.match(text, /snapshot\.uri === uri/)
  assert.match(text, /savedState\.uri === player\.spotifyUrl/)
  assert.match(text, /savedState\.status === 'ready'/)
  assert.match(text, /runNativeSpotify\('set-saved', JSON\.stringify\(\{ uri, saved: desiredSaved \}\)\)/)
  assert.match(text, /disabled: libraryBusy \|\| !savedReady/)
  assert.doesNotMatch(text, /runNativeSpotify\('toggle-save'/)
})

test('provides a polished Spotify PKCE connection dialog', async () => {
  const text = await pluginSource()

  assert.match(text, /const \$authOpen = atom\(false\)/)
  assert.match(text, /function SpotifyAuthDialog\(\)/)
  assert.match(text, /pluginRest\('\/auth\/status'/)
  assert.match(text, /pluginRest\('\/auth\/start'/)
  assert.match(text, /Secure PKCE connection/)
  assert.match(text, /https:\/\/developer\.spotify\.com\/dashboard/)
  assert.match(text, /http:\/\/127\.0\.0\.1:43827\/spotify\/callback/)
  assert.match(text, /children: 'Connect Spotify'/)
  assert.match(text, /aria-label': 'Spotify connection'/)
})

test('uses native themed tooltips and spinners for compact controls', async () => {
  const text = await pluginSource()

  assert.match(text, /jsx\(Tip, \{/)
  assert.match(text, /jsx\(GlyphSpinner, \{ ariaLabel: 'Loading playlists'/)
  assert.doesNotMatch(text, /jsx\(Button, \{[\s\S]{0,250}\btitle:/)
})

test('mounts only the native player with no Spotify webpage', async () => {
  const text = await pluginSource()

  assert.match(text, /function SpotifyRightRail\(\)[\s\S]*children:\s*jsx\(NativePlayer,\s*\{\}\)/)
  assert.doesNotMatch(text, /<webview|jsx\('webview'|open\.spotify\.com|insertCSS/)
})

test('uses only supported runtime plugin imports', async () => {
  const text = await pluginSource()
  const imports = [...text.matchAll(/^import\s+.*?\s+from\s+['"]([^'"]+)['"]/gm)].map(match => match[1])

  assert.deepEqual(imports, ['@hermes/plugin-sdk', 'react', 'react/jsx-runtime'])
})
