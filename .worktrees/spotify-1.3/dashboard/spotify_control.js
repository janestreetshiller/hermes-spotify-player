#!/usr/bin/osascript -l JavaScript

function safe(call, fallback) {
  try {
    const value = call()
    return value === undefined || value === null ? fallback : value
  } catch (_error) {
    return fallback
  }
}

function snapshot(spotify) {
  if (!spotify.running()) {
    return { running: false, state: 'stopped' }
  }

  const state = String(safe(() => spotify.playerState(), 'stopped'))
  const track = safe(() => spotify.currentTrack(), null)

  return {
    running: true,
    state,
    appVersion: String(safe(() => spotify.version(), '')),
    title: track ? String(safe(() => track.name(), '')) : '',
    artist: track ? String(safe(() => track.artist(), '')) : '',
    album: track ? String(safe(() => track.album(), '')) : '',
    artworkUrl: track ? String(safe(() => track.artworkUrl(), '')) : '',
    spotifyUrl: track ? String(safe(() => track.spotifyUrl(), '')) : '',
    durationMs: track ? Number(safe(() => track.duration(), 0)) : 0,
    positionSeconds: Number(safe(() => spotify.playerPosition(), 0)),
    volume: Number(safe(() => spotify.soundVolume(), 0))
  }
}

function run(argv) {
  const action = String(argv[0] || 'status')
  const spotify = Application('Spotify')

  try {
    const expectedState = action === 'play' ? 'playing' : action === 'pause' ? 'paused' : action === 'playpause' ? (String(spotify.playerState()) === 'playing' ? 'paused' : 'playing') : null
    let expectedVolume = null, expectedPosition = null
    const initialUri = ['seek','volume'].includes(action) ? snapshot(spotify).spotifyUrl : null
    if (action === 'open') {
      spotify.activate()
    } else if (action === 'playpause') {
      spotify.playpause()
    } else if (action === 'play') {
      spotify.play()
    } else if (action === 'pause') {
      spotify.pause()
    } else if (action === 'next') {
      spotify.nextTrack()
    } else if (action === 'previous') {
      spotify.previousTrack()
    } else if (action === 'volume') {
      const nextVolume = Number(argv[1])
      if (!Number.isFinite(nextVolume) || nextVolume < 0 || nextVolume > 100) throw new Error('Invalid volume')
      expectedVolume = Math.round(nextVolume)
      spotify.soundVolume = expectedVolume
    } else if (action === 'seek') {
      const seconds = Number(argv[1])
      if (!Number.isFinite(seconds) || seconds < 0 || seconds > 86400) throw new Error('Invalid seek position')
      const duration = Number(safe(() => spotify.currentTrack().duration(), 0)) / 1000
      expectedPosition = duration > 0 ? Math.min(seconds, Math.max(0, duration - 0.1)) : seconds
      spotify.playerPosition = expectedPosition
    } else if (action === 'play-uri') {
      const uri = String(argv[1] || '')
      if (!/^spotify:(track|album|playlist|artist|episode|show):[A-Za-z0-9]+$/.test(uri)) {
        throw new Error('Invalid Spotify URI')
      }
      spotify.playTrack(uri)
    } else if (action !== 'status') {
      throw new Error(`Unknown action: ${action}`)
    }

    // Apple events acknowledge dispatch before Spotify updates playerState.
    // Publish only the read-back state so the UI cannot invert its next action.
    let result = snapshot(spotify)
    // Spotify's native volume can quantize by one point; seek read-back can
    // advance during playback. Always return the observed value, never the draft.
    const confirmed = value => (!expectedState || value.state === expectedState)
      && (expectedVolume === null || Math.abs(value.volume - expectedVolume) <= 1)
      && (expectedPosition === null || (value.spotifyUrl === initialUri && Math.abs(value.positionSeconds - expectedPosition) <= 1))
    for (let attempt = 0; !confirmed(result) && attempt < 20; attempt++) {
      delay(0.1)
      result = snapshot(spotify)
    }
    if (!confirmed(result)) throw new Error('Spotify did not confirm the requested playback state or slider value. Please retry.')
    return JSON.stringify({ ok: true, ...result })
  } catch (error) {
    return JSON.stringify({
      ok: false,
      error: String(error && error.message ? error.message : error),
      ...snapshot(spotify)
    })
  }
}
