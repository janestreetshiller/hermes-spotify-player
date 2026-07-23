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
      const nextVolume = Math.max(0, Math.min(100, Number(argv[1] || 0)))
      spotify.soundVolume = nextVolume
    } else if (action === 'play-uri') {
      const uri = String(argv[1] || '')
      if (!/^spotify:(track|album|playlist|artist|episode|show):[A-Za-z0-9]+$/.test(uri)) {
        throw new Error('Invalid Spotify URI')
      }
      spotify.playTrack(uri)
    } else if (action !== 'status') {
      throw new Error(`Unknown action: ${action}`)
    }

    return JSON.stringify({ ok: true, ...snapshot(spotify) })
  } catch (error) {
    return JSON.stringify({
      ok: false,
      error: String(error && error.message ? error.message : error),
      ...snapshot(spotify)
    })
  }
}
