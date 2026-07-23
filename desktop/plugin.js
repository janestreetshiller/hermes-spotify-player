/**
 * Compact native Spotify controller for Hermes Desktop.
 *
 * Playback is delegated to the installed, signed-in Spotify macOS app through
 * this plugin's scoped Hermes REST backend. No Spotify webpage or webview is
 * mounted.
 */

import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, GlyphSpinner, Input, PALETTE_AREA, SearchField, StatusDot, Tip, atom, host, icons, useValue } from '@hermes/plugin-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'

const PLUGIN_ID = 'spotify-player'
const POLL_MS = 4000
const FOOTER_ROTATE_MS = 4500
const $searchOpen = atom(false)
const $authOpen = atom(false)
let pluginRest = null
let restControl = null

async function runNativeSpotify(action = 'status', argument = '') {
  if (!restControl) throw new Error('Spotify plugin backend is not ready.')

  const snapshot = await restControl(action, argument)
  if (!snapshot?.ok) throw new Error(snapshot?.error || 'Spotify command failed.')
  return snapshot
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0))
  const minutes = Math.floor(safeSeconds / 60)
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`
}

function lrcTimestampSeconds(minutes, seconds, fraction = '') {
  const fractionSeconds = fraction ? Number(fraction.padEnd(3, '0').slice(0, 3)) / 1000 : 0
  return Number(minutes) * 60 + Number(seconds) + fractionSeconds
}

function parseSyncedLyrics(rawLyrics, durationSeconds) {
  const parsed = []
  const timestampPattern = /\[(\d{1,3}):([0-5]\d)(?:[.:](\d{1,3}))?\]/g

  String(rawLyrics || '').split(/\r?\n/).forEach(sourceLine => {
    const timestamps = [...sourceLine.matchAll(timestampPattern)]
    if (!timestamps.length) return
    const finalTimestamp = timestamps[timestamps.length - 1]
    const text = sourceLine.slice((finalTimestamp.index || 0) + finalTimestamp[0].length).trim()
    if (!text) return

    timestamps.forEach(timestamp => {
      parsed.push({
        startSeconds: lrcTimestampSeconds(timestamp[1], timestamp[2], timestamp[3]),
        text
      })
    })
  })

  parsed.sort((left, right) => left.startSeconds - right.startSeconds)
  return parsed
    .filter((line, index) => index === 0 || line.startSeconds !== parsed[index - 1].startSeconds || line.text !== parsed[index - 1].text)
    .map((line, index, lines) => ({
      ...line,
      endSeconds: lines[index + 1]?.startSeconds || Math.max(line.startSeconds + 4, Number(durationSeconds) || 0),
      words: line.text.match(/\S+\s*/g) || [line.text]
    }))
}

function activeLyricPosition(lines, playbackSeconds) {
  let lineIndex = -1
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].startSeconds > playbackSeconds) break
    lineIndex = index
  }
  if (lineIndex < 0) return { lineIndex: -1, wordIndex: -1 }

  const line = lines[lineIndex]
  const lineDuration = Math.max(0.25, line.endSeconds - line.startSeconds)
  const lineProgress = Math.max(0, Math.min(0.999, (playbackSeconds - line.startSeconds) / lineDuration))
  return {
    lineIndex,
    wordIndex: Math.min(line.words.length - 1, Math.floor(lineProgress * line.words.length))
  }
}

function SyncedLyrics({ durationSeconds, isPlaying, plainLyrics, positionSeconds, syncedLyrics }) {
  const lines = useMemo(() => parseSyncedLyrics(syncedLyrics, durationSeconds), [syncedLyrics, durationSeconds])
  const scrollerRef = useRef(null)
  const lineRefs = useRef([])
  const activeRef = useRef({ lineIndex: -1, wordIndex: -1 })
  const [active, setActive] = useState(activeRef.current)

  useEffect(() => {
    let animationFrame = 0
    const anchoredPosition = Math.max(0, Number(positionSeconds) || 0)
    const anchoredAt = globalThis.performance?.now?.() || Date.now()

    const update = now => {
      const elapsed = isPlaying ? Math.max(0, now - anchoredAt) / 1000 : 0
      const playback = Math.min(Number(durationSeconds) || Infinity, anchoredPosition + elapsed)
      const next = activeLyricPosition(lines, playback)
      const current = activeRef.current
      if (next.lineIndex !== current.lineIndex || next.wordIndex !== current.wordIndex) {
        activeRef.current = next
        setActive(next)
      }
      if (isPlaying) animationFrame = globalThis.requestAnimationFrame(update)
    }

    update(anchoredAt)
    return () => {
      if (animationFrame) globalThis.cancelAnimationFrame(animationFrame)
    }
  }, [durationSeconds, isPlaying, lines, positionSeconds])

  useEffect(() => {
    const scroller = scrollerRef.current
    const activeLine = lineRefs.current[active.lineIndex]
    if (!scroller || !activeLine) return
    const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const top = Math.max(0, activeLine.offsetTop - (scroller.clientHeight - activeLine.offsetHeight) / 2)
    scroller.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [active.lineIndex])

  if (!lines.length) {
    return jsx('div', {
      className: 'min-h-0 flex-1 overflow-y-auto whitespace-pre-line rounded-lg bg-(--ui-bg-secondary) px-3 py-2 text-center text-sm leading-6 text-(--ui-text-secondary)',
      children: plainLyrics
    })
  }

  return jsx('div', {
    'aria-label': 'Synced lyrics',
    className: 'relative min-h-0 flex-1 overflow-y-auto rounded-lg bg-(--ui-bg-secondary) px-3 py-8 text-center text-sm leading-6',
    ref: scrollerRef,
    children: lines.map((line, lineIndex) => {
      const isActiveLine = lineIndex === active.lineIndex
      return jsx('div', {
        className: 'py-1',
        ref: element => { lineRefs.current[lineIndex] = element },
        style: {
          color: 'var(--ui-text-secondary)',
          opacity: isActiveLine ? 1 : 0.38,
          transition: 'opacity 220ms ease'
        },
        children: line.words.map((word, wordIndex) => {
          const isActiveWord = isActiveLine && wordIndex === active.wordIndex
          return jsx('span', {
            style: {
              color: isActiveWord ? 'var(--ui-text-primary)' : 'var(--ui-text-secondary)',
              fontWeight: isActiveWord ? 500 : 400,
              opacity: isActiveWord ? 1 : isActiveLine ? 0.62 : 1,
              transition: 'color 180ms ease, opacity 180ms ease, font-weight 180ms ease'
            },
            children: word
          }, `${lineIndex}-${wordIndex}`)
        })
      }, `${line.startSeconds}-${lineIndex}`)
    })
  })
}

function nextTimelinePosition(player) {
  const position = Math.max(0, Number(player?.positionSeconds) || 0)
  if (player?.state !== 'playing') return position
  const duration = Math.max(0, Number(player?.durationMs) || 0) / 1000
  return Math.min(duration || Infinity, Math.floor(position) + 1)
}

function mergePlayerSnapshot(current, snapshot) {
  if (
    current?.state !== 'playing' ||
    snapshot?.state !== 'playing' ||
    !current.spotifyUrl ||
    current.spotifyUrl !== snapshot.spotifyUrl
  ) return snapshot

  const currentPosition = Math.max(0, Number(current.positionSeconds) || 0)
  const snapshotPosition = Math.max(0, Number(snapshot.positionSeconds) || 0)
  const drift = snapshotPosition - currentPosition
  if (Math.abs(drift) > 2) return snapshot
  const nextPosition = drift < 0
    ? currentPosition
    : Math.min(snapshotPosition, Math.floor(currentPosition) + 1)
  return { ...snapshot, positionSeconds: nextPosition }
}

function nextPlayerDisplayMode(currentMode, measuredHeight) {
  const height = Number(measuredHeight) || 152
  if (currentMode === 'compact') return height > 112 ? 'default' : 'compact'
  if (currentMode === 'expanded') return height < 244 ? 'default' : 'expanded'
  if (height < 96) return 'compact'
  if (height > 276) return 'expanded'
  return 'default'
}

function NativePlayer() {
  const [player, setPlayer] = useState({ running: false, state: 'loading' })
  const [savedState, setSavedState] = useState({ uri: '', status: 'idle', saved: null })
  const [libraryBusy, setLibraryBusy] = useState(false)
  const [playlistOpen, setPlaylistOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [displayMode, setDisplayMode] = useState('default')
  const [activeExpandedView, setActiveExpandedView] = useState('artwork')
  const [lyrics, setLyrics] = useState('')
  const [syncedLyrics, setSyncedLyrics] = useState('')
  const [lyricsState, setLyricsState] = useState('idle')
  const containerRef = useRef(null)
  const refreshingRef = useRef(false)

  const refresh = async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true
    try {
      const snapshot = await runNativeSpotify('status')
      setPlayer(current => mergePlayerSnapshot(current, snapshot))
      setError('')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Could not read Spotify player state.')
    } finally {
      refreshingRef.current = false
    }
  }

  useEffect(() => {
    void refresh()
    const interval = globalThis.setInterval(() => void refresh(), POLL_MS)
    return () => globalThis.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (player.state !== 'playing') return undefined
    const interval = globalThis.setInterval(() => {
      setPlayer(current => {
        const nextPosition = nextTimelinePosition(current)
        if (nextPosition === Number(current.positionSeconds || 0)) return current
        return { ...current, positionSeconds: nextPosition }
      })
    }, 1000)
    return () => globalThis.clearInterval(interval)
  }, [player.state, player.spotifyUrl])

  useEffect(() => {
    const element = containerRef.current
    if (!element || typeof ResizeObserver === 'undefined') return undefined
    const viewport = element.parentElement
    if (!viewport) return undefined
    let frameId = 0
    const observer = new ResizeObserver(entries => {
      const nextHeight = Math.round(entries[0]?.contentRect?.height || viewport.clientHeight || 152)
      if (frameId) globalThis.cancelAnimationFrame(frameId)
      frameId = globalThis.requestAnimationFrame(() => {
        frameId = 0
        setDisplayMode(currentMode => nextPlayerDisplayMode(currentMode, nextHeight))
      })
    })
    observer.observe(viewport)
    return () => {
      observer.disconnect()
      if (frameId) globalThis.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const uri = player.spotifyUrl || ''
    if (!uri) {
      setSavedState({ uri: '', status: 'idle', saved: null })
      return undefined
    }
    setSavedState({ uri, status: 'loading', saved: null })
    void runNativeSpotify('saved-status', uri)
      .then(snapshot => {
        if (!cancelled && snapshot.uri === uri) {
          setSavedState({ uri, status: 'ready', saved: Boolean(snapshot.saved) })
        }
      })
      .catch(() => {
        if (!cancelled) setSavedState({ uri, status: 'error', saved: null })
      })
    return () => {
      cancelled = true
    }
  }, [player.spotifyUrl])

  useEffect(() => {
    let cancelled = false
    setLyrics('')
    setSyncedLyrics('')
    setLyricsState('idle')
    if (activeExpandedView !== 'lyrics' || !player.title || !player.artist || !player.durationMs) return undefined
    setLyricsState('loading')
    const signature = JSON.stringify({
      title: player.title,
      artist: player.artist,
      album: player.album || '',
      duration: Math.round(Number(player.durationMs) / 1000)
    })
    void runNativeSpotify('lyrics', signature)
      .then(snapshot => {
        if (cancelled) return
        setLyrics(snapshot.lyrics || '')
        setSyncedLyrics(snapshot.syncedLyrics || '')
        setLyricsState(snapshot.instrumental ? 'instrumental' : snapshot.lyrics || snapshot.syncedLyrics ? 'ready' : 'missing')
      })
      .catch(() => {
        if (!cancelled) setLyricsState('missing')
      })
    return () => {
      cancelled = true
    }
  }, [activeExpandedView, player.title, player.artist, player.album, player.durationMs])

  const toggleSaved = async () => {
    const uri = player.spotifyUrl || ''
    if (!uri || libraryBusy || !savedReady) return
    const desiredSaved = !savedState.saved
    setLibraryBusy(true)
    try {
      const snapshot = await runNativeSpotify('set-saved', JSON.stringify({ uri, saved: desiredSaved }))
      if (snapshot.uri !== uri) throw new Error('Spotify returned liked status for a different track.')
      setSavedState({ uri, status: 'ready', saved: Boolean(snapshot.saved) })
      host.notify({
        kind: 'success',
        message: snapshot.saved ? 'Added to Liked Songs.' : 'Removed from Liked Songs.'
      })
    } catch (libraryError) {
      host.notify({
        kind: 'error',
        message: libraryError instanceof Error ? libraryError.message : 'Spotify library update failed.'
      })
    } finally {
      setLibraryBusy(false)
    }
  }

  const act = async action => {
    setBusy(true)
    try {
      const snapshot = await runNativeSpotify(action)
      setPlayer(snapshot)
      setError('')
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Spotify command failed.'
      setError(message)
      host.notify({ kind: 'error', message })
    } finally {
      setBusy(false)
    }
  }

  const isPlaying = player.state === 'playing'
  const durationSeconds = Number(player.durationMs || 0) / 1000
  const progress = durationSeconds > 0 ? Math.min(100, (Number(player.positionSeconds || 0) / durationSeconds) * 100) : 0
  const status = error
    ? { label: 'Unavailable', tone: 'bad' }
    : player.running
      ? { label: isPlaying ? 'Playing' : 'Paused', tone: isPlaying ? 'good' : 'muted' }
      : { label: 'Spotify app closed', tone: 'warn' }
  const savedReady = Boolean(player.spotifyUrl) && savedState.uri === player.spotifyUrl && savedState.status === 'ready'
  const saved = savedReady && savedState.saved === true
  const savedControlLabel = savedReady
    ? saved ? 'Remove from Liked Songs' : 'Add to Liked Songs'
    : savedState.status === 'error' ? 'Liked status unavailable' : 'Checking Liked Songs status'
  const savedAriaLabel = savedReady
    ? saved ? 'Unlike current track' : 'Like current track'
    : savedControlLabel
  if (displayMode === 'compact') {
    return jsxs('section', {
      ref: containerRef,
      className: 'flex h-full min-h-0 items-center gap-1.5 overflow-hidden px-2 py-1',
      children: [
        jsxs('div', {
          className: 'min-w-0 flex-1',
          children: [
            jsx('div', {
              className: 'truncate text-xs font-medium',
              title: player.title || '',
              children: player.title || (player.running ? 'Nothing selected' : 'Open Spotify')
            }),
            jsxs('div', {
              className: 'flex min-w-0 items-center gap-1 text-[0.625rem] text-(--ui-text-tertiary)',
              children: [
                jsx('span', { className: 'truncate', children: player.artist || status.label }),
                jsx('span', { children: '·' }),
                jsx('span', { className: 'shrink-0 tabular-nums', children: `${formatTime(player.positionSeconds)} / ${formatTime(durationSeconds)}` })
              ]
            })
          ]
        }),
        jsxs('div', {
          className: 'flex shrink-0 items-center gap-0.5',
          children: [
            jsx(Button, {
              'aria-label': 'Previous track',
              disabled: busy || !player.running,
              onClick: () => void act('previous'),
              size: 'icon-sm',
              type: 'button',
              variant: 'ghost',
              children: jsx(icons.ChevronLeft, {})
            }),
            jsx(Button, {
              'aria-label': isPlaying ? 'Pause Spotify' : 'Play Spotify',
              disabled: busy,
              onClick: () => void act('playpause'),
              size: 'icon-sm',
              type: 'button',
              children: jsx(isPlaying ? icons.Pause : icons.Play, {})
            }),
            jsx(Button, {
              'aria-label': 'Next track',
              disabled: busy || !player.running,
              onClick: () => void act('next'),
              size: 'icon-sm',
              type: 'button',
              variant: 'ghost',
              children: jsx(icons.ChevronRight, {})
            })
          ]
        }),
        jsx(SpotifyPlaylistDialog, { open: playlistOpen, onOpenChange: setPlaylistOpen, track: player })
      ]
    })
  }

  if (displayMode === 'expanded') {
    const lyricsMessage = lyricsState === 'loading'
      ? 'Loading lyrics…'
      : lyricsState === 'instrumental'
        ? 'This track is instrumental.'
        : lyricsState === 'missing'
          ? 'Lyrics are not available for this track.'
          : lyrics

    return jsxs('section', {
      ref: containerRef,
      className: 'flex h-full min-h-0 flex-col overflow-hidden p-2',
      children: [
        jsxs('div', {
          'aria-label': 'Expanded player view',
          className: 'mb-2 flex shrink-0 items-center gap-1 rounded-full bg-(--ui-bg-secondary) p-0.5',
          role: 'tablist',
          children: [
            jsx(Button, {
              'aria-selected': activeExpandedView === 'artwork',
              className: 'flex-1 rounded-full',
              onClick: () => setActiveExpandedView('artwork'),
              role: 'tab',
              size: 'xs',
              type: 'button',
              variant: activeExpandedView === 'artwork' ? 'secondary' : 'ghost',
              children: 'Artwork'
            }),
            jsx(Button, {
              'aria-selected': activeExpandedView === 'lyrics',
              className: 'flex-1 rounded-full',
              onClick: () => setActiveExpandedView('lyrics'),
              role: 'tab',
              size: 'xs',
              type: 'button',
              variant: activeExpandedView === 'lyrics' ? 'secondary' : 'ghost',
              children: 'Lyrics'
            })
          ]
        }),
        activeExpandedView === 'artwork'
          ? player.artworkUrl
            ? jsx('img', {
                alt: player.album ? `${player.album} cover` : 'Album cover',
                className: 'mx-auto min-h-0 max-h-64 w-auto flex-1 rounded-lg object-cover shadow-lg',
                src: player.artworkUrl
              })
            : jsx('div', {
                className: 'flex min-h-0 flex-1 items-center justify-center rounded-lg bg-(--ui-bg-secondary) text-(--ui-text-quaternary)',
                children: jsx(icons.AudioLines, { className: 'size-10' })
              })
          : lyricsState === 'loading'
            ? jsx('div', {
                className: 'flex min-h-0 flex-1 items-center justify-center',
                children: jsx(GlyphSpinner, { ariaLabel: 'Loading lyrics', size: 'md' })
              })
            : lyricsState === 'ready' && syncedLyrics
              ? jsx(SyncedLyrics, {
                  durationSeconds,
                  isPlaying,
                  plainLyrics: lyrics,
                  positionSeconds: player.positionSeconds,
                  syncedLyrics
                })
              : jsx('div', {
                  className: 'min-h-0 flex-1 overflow-y-auto whitespace-pre-line rounded-lg bg-(--ui-bg-secondary) px-3 py-2 text-center text-sm leading-6 text-(--ui-text-secondary)',
                  children: lyricsMessage
                }),
        jsxs('div', {
          className: 'mt-2 flex shrink-0 items-center gap-2',
          children: [
            jsxs('div', {
              className: 'min-w-0 flex-1',
              children: [
                jsx('div', { className: 'truncate text-sm font-semibold', children: player.title || 'Nothing selected' }),
                jsx('div', { className: 'truncate text-xs text-(--ui-text-secondary)', children: player.artist || status.label })
              ]
            }),
            jsx(Button, {
              'aria-label': savedAriaLabel,
              disabled: libraryBusy || !savedReady,
              onClick: () => void toggleSaved(),
              size: 'icon-sm',
              type: 'button',
              variant: 'ghost',
              children: jsx('span', { className: saved ? 'text-(--ui-accent)' : 'text-(--ui-text-tertiary)', children: saved ? '♥' : '♡', 'aria-label': savedAriaLabel })
            }),
            jsx(Button, {
              'aria-label': 'Add current track to playlist',
              disabled: !player.spotifyUrl,
              onClick: () => setPlaylistOpen(true),
              size: 'icon-sm',
              type: 'button',
              variant: 'ghost',
              children: jsx(icons.Plus, {})
            })
          ]
        }),
        jsxs('div', {
          className: 'mt-1 flex shrink-0 items-center gap-1.5 text-[0.625rem] text-(--ui-text-quaternary)',
          children: [
            jsx('span', { className: 'w-7 tabular-nums', children: formatTime(player.positionSeconds) }),
            jsx('div', {
              className: 'h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-(--ui-stroke-secondary)',
              children: jsx('div', { className: 'h-full rounded-full bg-(--ui-accent)', style: { width: `${progress}%` } })
            }),
            jsx('span', { className: 'w-7 text-right tabular-nums', children: formatTime(durationSeconds) })
          ]
        }),
        jsxs('div', {
          className: 'mt-1 flex shrink-0 items-center justify-center gap-1',
          children: [
            jsx(Button, { 'aria-label': 'Previous track', disabled: busy || !player.running, onClick: () => void act('previous'), size: 'icon-sm', type: 'button', variant: 'ghost', children: jsx(icons.ChevronLeft, {}) }),
            jsx(Button, { 'aria-label': isPlaying ? 'Pause Spotify' : 'Play Spotify', disabled: busy, onClick: () => void act('playpause'), size: 'icon-sm', type: 'button', children: jsx(isPlaying ? icons.Pause : icons.Play, {}) }),
            jsx(Button, { 'aria-label': 'Next track', disabled: busy || !player.running, onClick: () => void act('next'), size: 'icon-sm', type: 'button', variant: 'ghost', children: jsx(icons.ChevronRight, {}) })
          ]
        }),
        jsx(SpotifyPlaylistDialog, { open: playlistOpen, onOpenChange: setPlaylistOpen, track: player })
      ]
    })
  }

  return jsxs('section', {
    ref: containerRef,
    className: 'h-full min-h-0 overflow-hidden px-2 py-2',
    children: [
      jsxs('div', {
        className: 'flex min-w-0 items-center gap-2',
        children: [
          player.artworkUrl
            ? jsx('img', {
                alt: player.album ? `${player.album} cover` : 'Album cover',
                className: 'size-14 shrink-0 rounded object-cover',
                src: player.artworkUrl
              })
            : jsx('div', {
                className: 'flex size-14 shrink-0 items-center justify-center rounded border border-(--ui-stroke-secondary) text-(--ui-text-quaternary)',
                children: jsx(icons.AudioLines, {})
              }),
          jsxs('div', {
            className: 'min-w-0 flex-1',
            children: [
              jsx('div', {
                className: 'truncate text-sm font-medium',
                title: player.title || '',
                children: player.title || (player.running ? 'Nothing selected' : 'Open Spotify to start listening')
              }),
              jsxs('div', {
                className: 'mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-(--ui-text-secondary)',
                title: error || status.label,
                children: [
                  jsx(StatusDot, { tone: status.tone }),
                  jsx('span', {
                    className: 'truncate',
                    title: player.artist || '',
                    children: player.artist || 'Spotify for macOS'
                  })
                ]
              })
            ]
          }),
          jsxs('div', {
            className: 'flex shrink-0 items-center gap-0.5',
            children: [
              jsx(Tip, {
                label: 'Search Spotify',
                children: jsx(Button, {
                  'aria-label': 'Search Spotify',
                  onClick: () => $searchOpen.set(true),
                  size: 'icon-sm',
                  type: 'button',
                  variant: 'ghost',
                  children: jsx(icons.Search, {})
                })
              }),
              jsx(Tip, {
                label: savedControlLabel,
                children: jsx(Button, {
                  'aria-label': savedAriaLabel,
                  disabled: libraryBusy || !savedReady,
                  onClick: () => void toggleSaved(),
                  size: 'icon-sm',
                  type: 'button',
                  variant: 'ghost',
                  children: jsx('span', {
                    className: saved ? 'text-sm text-(--ui-accent)' : 'text-sm text-(--ui-text-tertiary)',
                    children: saved ? '♥' : '♡',
                    'aria-label': savedAriaLabel
                  })
                })
              }),
              jsx(Tip, {
                label: 'Add to playlist',
                children: jsx(Button, {
                  'aria-label': 'Add current track to playlist',
                  disabled: !player.spotifyUrl,
                  onClick: () => setPlaylistOpen(true),
                  size: 'icon-sm',
                  type: 'button',
                  variant: 'ghost',
                  children: jsx(icons.Plus, {})
                })
              }),
              jsx(Tip, {
                label: 'Previous track',
                children: jsx(Button, {
                  'aria-label': 'Previous track',
                  disabled: busy || !player.running,
                  onClick: () => void act('previous'),
                  size: 'icon-sm',
                  type: 'button',
                  variant: 'ghost',
                  children: jsx(icons.ChevronLeft, {})
                })
              }),
              jsx(Tip, {
                label: isPlaying ? 'Pause' : 'Play',
                children: jsx(Button, {
                  'aria-label': isPlaying ? 'Pause Spotify' : 'Play Spotify',
                  disabled: busy,
                  onClick: () => void act('playpause'),
                  size: 'icon-sm',
                  type: 'button',
                  children: jsx(isPlaying ? icons.Pause : icons.Play, {})
                })
              }),
              jsx(Tip, {
                label: 'Next track',
                children: jsx(Button, {
                  'aria-label': 'Next track',
                  disabled: busy || !player.running,
                  onClick: () => void act('next'),
                  size: 'icon-sm',
                  type: 'button',
                  variant: 'ghost',
                  children: jsx(icons.ChevronRight, {})
                })
              })
            ]
          })
        ]
      }),
      jsxs('div', {
        className: 'mt-1.5 flex items-center gap-1.5 text-[0.625rem] text-(--ui-text-quaternary)',
        children: [
          jsx('span', { className: 'w-7', children: formatTime(player.positionSeconds) }),
          jsx('div', {
            className: 'h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-(--ui-stroke-secondary)',
            children: jsx('div', {
              className: 'h-full rounded-full bg-(--ui-accent)',
              style: { width: `${progress}%` }
            })
          }),
          jsx('span', { className: 'w-7 text-right', children: formatTime(durationSeconds) })
        ]
      }),
      jsx(SpotifyPlaylistDialog, {
        open: playlistOpen,
        onOpenChange: setPlaylistOpen,
        track: player
      })
    ]
  })
}

function SpotifyPlaylistDialog({ open, onOpenChange, track }) {
  const [playlists, setPlaylists] = useState([])
  const [playlistQuery, setPlaylistQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    let cancelled = false
    setPlaylistQuery('')
    setLoading(true)
    setError('')
    void runNativeSpotify('playlists')
      .then(snapshot => {
        if (!cancelled) setPlaylists(snapshot.playlists || [])
      })
      .catch(loadError => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load playlists.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const addToPlaylist = async playlist => {
    if (!track.spotifyUrl || addingId) return
    setAddingId(playlist.id)
    setError('')
    try {
      await runNativeSpotify('playlist-add', JSON.stringify({
        playlistId: playlist.id,
        uri: track.spotifyUrl
      }))
      host.notify({ kind: 'success', message: `Added to ${playlist.name}.` })
      onOpenChange(false)
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add track to playlist.')
    } finally {
      setAddingId('')
    }
  }

  const normalizedQuery = playlistQuery.trim().toLocaleLowerCase()
  const visiblePlaylists = normalizedQuery
    ? playlists.filter(playlist => playlist.name.toLocaleLowerCase().includes(normalizedQuery))
    : playlists

  return jsx(Dialog, {
    open,
    onOpenChange,
    children: jsx(DialogContent, {
      className: 'max-w-sm gap-0 overflow-hidden p-0',
      children: jsxs('div', {
        children: [
          jsxs(DialogHeader, {
            className: 'border-b border-(--ui-stroke-secondary) px-4 py-3 text-left',
            children: [
              jsx(DialogTitle, { children: 'Add to playlist' }),
              jsx(DialogDescription, {
                children: track.title ? `${track.title} — ${track.artist || 'Spotify'}` : 'Choose a playlist.'
              })
            ]
          }),
          loading
            ? jsx('div', {
                className: 'flex items-center justify-center px-4 py-6',
                children: jsx(GlyphSpinner, { ariaLabel: 'Loading playlists' })
              })
            : playlists.length
              ? jsxs('div', {
                  children: [
                    playlists.length > 5
                      ? jsx('div', {
                          className: 'border-b border-(--ui-stroke-secondary) px-3 py-2',
                          children: jsx(SearchField, {
                            containerClassName: 'w-full',
                            onChange: setPlaylistQuery,
                            placeholder: 'Filter playlists…',
                            value: playlistQuery
                          })
                        })
                      : null,
                    visiblePlaylists.length
                      ? jsx('div', {
                          className: 'max-h-80 overflow-y-auto p-1.5',
                          children: visiblePlaylists.map(playlist =>
                            jsxs('button', {
                              'aria-label': `Add to ${playlist.name}`,
                              className: 'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-(--ui-bg-hover)',
                              disabled: Boolean(addingId),
                              onClick: () => void addToPlaylist(playlist),
                              type: 'button',
                              children: [
                                playlist.artworkUrl
                                  ? jsx('img', {
                                      alt: '',
                                      className: 'size-9 shrink-0 rounded object-cover',
                                      src: playlist.artworkUrl
                                    })
                                  : jsx('div', {
                                      className: 'flex size-9 shrink-0 items-center justify-center rounded bg-(--ui-bg-secondary) text-(--ui-text-quaternary)',
                                      children: jsx(icons.AudioLines, { className: 'size-4' })
                                    }),
                                jsxs('span', {
                                  className: 'min-w-0 flex-1',
                                  children: [
                                    jsx('span', { className: 'block truncate text-sm font-medium', children: playlist.name }),
                                    jsx('span', {
                                      className: 'block text-xs text-(--ui-text-secondary)',
                                      children: `${playlist.trackCount} ${playlist.trackCount === 1 ? 'track' : 'tracks'}`
                                    })
                                  ]
                                }),
                                addingId === playlist.id
                                  ? jsx(GlyphSpinner, { ariaLabel: `Adding to ${playlist.name}`, className: 'size-3.5' })
                                  : jsx(icons.Plus, { className: 'size-4 text-(--ui-text-tertiary)' })
                              ]
                            }, playlist.id)
                          )
                        })
                      : jsx('p', {
                          className: 'px-4 py-6 text-center text-sm text-(--ui-text-secondary)',
                          children: 'No matching playlists.'
                        })
                  ]
                })
              : jsx('p', {
                  className: 'px-4 py-6 text-center text-sm text-(--ui-text-secondary)',
                  children: 'No playlists found.'
                }),
          error ? jsx('p', { className: 'px-4 pb-3 text-xs text-destructive', children: error }) : null
        ]
      })
    })
  })
}

function SpotifyAuthDialog() {
  const open = useValue($authOpen)
  const [auth, setAuth] = useState({
    loggedIn: false,
    clientConfigured: false,
    phase: 'idle',
    redirectUri: 'http://127.0.0.1:43827/spotify/callback'
  })
  const [clientId, setClientId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const refreshAuth = async () => {
    if (!pluginRest) return
    try {
      const snapshot = await pluginRest('/auth/status', { method: 'GET' })
      setAuth(snapshot)
      setError('')
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not read Spotify connection status.')
    }
  }

  useEffect(() => {
    if (!open) return undefined
    void refreshAuth()
    const interval = globalThis.setInterval(() => void refreshAuth(), 1200)
    return () => globalThis.clearInterval(interval)
  }, [open])

  const setOpen = next => {
    $authOpen.set(next)
    if (!next) {
      setClientId('')
      setError('')
    }
  }

  const connect = async () => {
    if (!pluginRest || busy) return
    setBusy(true)
    setError('')
    try {
      const snapshot = await pluginRest('/auth/start', {
        method: 'POST',
        body: { clientId: clientId.trim() }
      })
      setAuth(current => ({ ...current, ...snapshot }))
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Could not start Spotify authorization.')
    } finally {
      setBusy(false)
    }
  }

  const waiting = auth.phase === 'waiting' || auth.phase === 'starting'
  const connected = Boolean(auth.loggedIn || auth.phase === 'connected')

  return jsx(Dialog, {
    open,
    onOpenChange: setOpen,
    children: jsx(DialogContent, {
      className: 'max-w-md gap-0 overflow-hidden p-0',
      children: jsxs('div', {
        children: [
          jsx('div', { className: 'h-1 bg-[#1ed760]' }),
          jsxs(DialogHeader, {
            className: 'px-5 pb-4 pt-5 text-left',
            children: [
              jsxs('div', {
                className: 'mb-2 flex items-center gap-3',
                children: [
                  jsx('div', {
                    className: 'flex size-10 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-lg',
                    children: jsx(icons.AudioLines, { className: 'size-5' })
                  }),
                  jsxs('div', {
                    children: [
                      jsx(DialogTitle, { children: connected ? 'Spotify connected' : 'Connect Spotify' }),
                      jsx('div', { className: 'mt-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-(--ui-text-tertiary)', children: 'Secure PKCE connection' })
                    ]
                  })
                ]
              }),
              jsx(DialogDescription, {
                children: connected
                  ? 'Hermes can search, save, and organize music through your Spotify account.'
                  : 'Authorize through Spotify in your browser. Your password is never shared with Hermes.'
              })
            ]
          }),
          connected
            ? jsxs('div', {
                className: 'mx-5 mb-5 flex items-start gap-3 rounded-lg border border-[#1ed760]/30 bg-[#1ed760]/[0.08] p-3',
                children: [
                  jsx(icons.CheckCircle2, { className: 'mt-0.5 size-5 shrink-0 text-[#1ed760]' }),
                  jsxs('div', {
                    children: [
                      jsx('div', { className: 'text-sm font-semibold', children: 'Connected securely' }),
                      jsx('div', { className: 'mt-0.5 text-xs text-(--ui-text-secondary)', children: 'OAuth tokens are stored by Hermes and refreshed automatically.' })
                    ]
                  })
                ]
              })
            : jsxs('div', {
                className: 'space-y-3 border-t border-(--ui-stroke-secondary) px-5 py-4',
                children: [
                  !auth.clientConfigured
                    ? jsxs('div', {
                        className: 'rounded-lg bg-(--ui-bg-secondary) p-3',
                        children: [
                          jsxs('div', {
                            className: 'flex items-center justify-between gap-3',
                            children: [
                              jsxs('div', {
                                children: [
                                  jsx('div', { className: 'text-sm font-semibold', children: '1. Create a Spotify app' }),
                                  jsx('div', { className: 'mt-0.5 text-xs text-(--ui-text-secondary)', children: 'Select Web API. No client secret is needed.' })
                                ]
                              }),
                              jsx(Button, {
                                asChild: true,
                                size: 'xs',
                                variant: 'outline',
                                children: jsx('a', {
                                  href: 'https://developer.spotify.com/dashboard',
                                  rel: 'noreferrer',
                                  target: '_blank',
                                  children: 'Open dashboard'
                                })
                              })
                            ]
                          }),
                          jsx('div', { className: 'mt-3 text-xs font-semibold', children: '2. Add this redirect URI' }),
                          jsx('code', {
                            className: 'mt-1 block select-all overflow-x-auto rounded bg-black/20 px-2 py-1.5 text-[0.6875rem] text-(--ui-text-secondary)',
                            children: auth.redirectUri || 'http://127.0.0.1:43827/spotify/callback'
                          }),
                          jsx('div', { className: 'mt-3 text-xs font-semibold', children: '3. Paste the Client ID' }),
                          jsx(Input, {
                            'aria-label': 'Spotify Client ID',
                            autoComplete: 'off',
                            className: 'mt-1 font-mono text-xs',
                            disabled: busy || waiting,
                            maxLength: 128,
                            onChange: event => setClientId(event.target.value),
                            placeholder: 'Spotify Client ID',
                            value: clientId
                          })
                        ]
                      })
                    : jsx('div', {
                        className: 'rounded-lg bg-(--ui-bg-secondary) p-3 text-sm text-(--ui-text-secondary)',
                        children: 'Your Spotify app is configured. Continue to approve access in Spotify.'
                      }),
                  waiting
                    ? jsxs('div', {
                        className: 'flex items-center gap-2 rounded-lg border border-(--ui-stroke-secondary) px-3 py-2 text-sm',
                        children: [
                          jsx(GlyphSpinner, { ariaLabel: 'Waiting for Spotify authorization', size: 'sm' }),
                          jsx('span', { children: 'Finish connecting in your browser…' })
                        ]
                      })
                    : null,
                  error || auth.phase === 'error'
                    ? jsx('p', { className: 'text-xs text-destructive', children: error || auth.message || 'Spotify authorization did not complete.' })
                    : null,
                  jsx(Button, {
                    className: 'w-full bg-[#1ed760] font-semibold text-black hover:bg-[#1fdf64]',
                    disabled: busy || waiting || (!auth.clientConfigured && clientId.trim().length < 20),
                    onClick: () => void connect(),
                    type: 'button',
                    children: 'Connect Spotify'
                  })
                ]
              }),
          jsxs('div', {
            className: 'flex items-center gap-2 border-t border-(--ui-stroke-secondary) px-5 py-3 text-[0.6875rem] text-(--ui-text-quaternary)',
            children: [
              jsx(icons.Lock, { className: 'size-3.5 shrink-0' }),
              jsx('span', { children: 'Authorization uses Spotify Web API, PKCE, state verification, and a localhost callback.' })
            ]
          })
        ]
      })
    })
  })
}

function SpotifyStatusBar() {
  const [player, setPlayer] = useState({ running: false, state: 'loading' })
  const [showArtist, setShowArtist] = useState(false)
  const [error, setError] = useState('')
  const refreshingRef = useRef(false)

  const refresh = async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true
    try {
      setPlayer(await runNativeSpotify('status'))
      setError('')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Spotify unavailable')
    } finally {
      refreshingRef.current = false
    }
  }

  useEffect(() => {
    void refresh()
    const interval = globalThis.setInterval(() => void refresh(), POLL_MS)
    return () => globalThis.clearInterval(interval)
  }, [])

  useEffect(() => {
    setShowArtist(false)
    if (!player.title || !player.artist || player.title === player.artist) return undefined
    const interval = globalThis.setInterval(() => setShowArtist(current => !current), FOOTER_ROTATE_MS)
    return () => globalThis.clearInterval(interval)
  }, [player.title, player.artist])

  const toggle = async () => {
    try {
      setPlayer(await runNativeSpotify('playpause'))
      setError('')
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Spotify command failed.'
      setError(message)
      host.notify({ kind: 'error', message })
    }
  }

  const isPlaying = player.state === 'playing'
  const primaryLabel = error ? 'Spotify unavailable' : player.title || (player.running ? 'Spotify' : 'Open Spotify')
  const secondaryLabel = error ? primaryLabel : player.artist || primaryLabel
  const label = showArtist ? secondaryLabel : primaryLabel

  return jsxs('div', {
    className: 'flex min-w-0 items-center gap-1.5',
    title: error || `${player.artist || 'Spotify'}${player.title ? ` — ${player.title}` : ''}`,
    children: [
      jsx(StatusDot, { tone: error ? 'bad' : isPlaying ? 'good' : player.running ? 'muted' : 'warn' }),
      jsx('span', {
        className: 'max-w-36 truncate text-[0.6875rem] text-(--ui-text-secondary)',
        children: label
      }),
      jsx(Tip, {
        label: 'Spotify connection',
        children: jsx(Button, {
          'aria-label': 'Spotify connection',
          onClick: () => $authOpen.set(true),
          size: 'icon-sm',
          type: 'button',
          variant: 'ghost',
          children: jsx(icons.Lock, {})
        })
      }),
      jsx(Tip, {
        label: 'Search Spotify',
        children: jsx(Button, {
          'aria-label': 'Search Spotify',
          onClick: () => $searchOpen.set(true),
          size: 'icon-sm',
          type: 'button',
          variant: 'ghost',
          children: jsx(icons.Search, {})
        })
      }),
      jsx(Tip, {
        label: isPlaying ? 'Pause Spotify' : 'Play Spotify',
        children: jsx(Button, {
          'aria-label': isPlaying ? 'Pause Spotify' : 'Play Spotify',
          onClick: () => void toggle(),
          size: 'icon-sm',
          type: 'button',
          variant: 'ghost',
          children: jsx(isPlaying ? icons.Pause : icons.Play, {})
        })
      }),
      jsx(SpotifySearchDialog, {}),
      jsx(SpotifyAuthDialog, {})
    ]
  })
}

function SpotifySearchDialog() {
  const open = useValue($searchOpen)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const setOpen = next => {
    $searchOpen.set(next)
    if (!next) {
      setQuery('')
      setResults([])
      setHasSearched(false)
      setError('')
    }
  }

  const submit = async event => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || busy) return

    setBusy(true)
    try {
      const snapshot = await runNativeSpotify('search', query)
      setResults(snapshot.results.slice(0, 10))
      setHasSearched(true)
      setError('')
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Spotify search failed.')
    } finally {
      setBusy(false)
    }
  }

  const playResult = async result => {
    if (busy) return
    setBusy(true)
    try {
      await runNativeSpotify('play-uri', result.uri)
      setOpen(false)
    } catch (playError) {
      setError(playError instanceof Error ? playError.message : 'Could not play that track.')
    } finally {
      setBusy(false)
    }
  }

  return jsx(Dialog, {
    open,
    onOpenChange: setOpen,
    children: jsx(DialogContent, {
      className: 'max-w-lg gap-0 overflow-hidden p-0',
      children: jsxs('form', {
        onSubmit: submit,
        children: [
          jsxs(DialogHeader, {
            className: 'border-b border-(--ui-stroke-secondary) px-4 py-3 text-left',
            children: [
              jsx(DialogTitle, { children: 'Search Spotify' }),
              jsx(DialogDescription, { children: 'Find a track, then click it to play.' })
            ]
          }),
          jsxs('div', {
            className: 'flex items-center gap-2 px-4 py-3',
            children: [
              jsx(icons.Search, { className: 'size-4 shrink-0 text-(--ui-text-tertiary)' }),
              jsx(Input, {
                'aria-label': 'Search Spotify',
                autoFocus: true,
                disabled: busy,
                maxLength: 200,
                onChange: event => setQuery(event.target.value),
                placeholder: 'Search music…',
                value: query
              })
            ]
          }),
          results.length
            ? jsx('div', {
                className: 'max-h-80 overflow-y-auto border-t border-(--ui-stroke-secondary) p-1.5',
                children: results.map(result =>
                  jsxs('button', {
                    'aria-label': `Play ${result.title} by ${result.artist}`,
                    className: 'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-(--ui-bg-hover)',
                    disabled: busy,
                    onClick: () => void playResult(result),
                    type: 'button',
                    children: [
                      result.artworkUrl
                        ? jsx('img', {
                            alt: '',
                            className: 'size-9 shrink-0 rounded object-cover',
                            src: result.artworkUrl
                          })
                        : jsx('div', {
                            className: 'flex size-9 shrink-0 items-center justify-center rounded bg-(--ui-bg-secondary) text-(--ui-text-quaternary)',
                            children: jsx(icons.AudioLines, { className: 'size-4' })
                          }),
                      jsxs('span', {
                        className: 'min-w-0 flex-1',
                        children: [
                          jsx('span', { className: 'block truncate text-sm font-medium', children: result.title }),
                          jsx('span', {
                            className: 'block truncate text-xs text-(--ui-text-secondary)',
                            children: `${result.artist}${result.album ? ` — ${result.album}` : ''}`
                          })
                        ]
                      }),
                      jsx(icons.Play, { className: 'size-4 shrink-0 text-(--ui-text-tertiary)' })
                    ]
                  }, result.uri)
                )
              })
            : hasSearched && !error
              ? jsx('p', {
                  className: 'border-t border-(--ui-stroke-secondary) px-4 py-6 text-center text-sm text-(--ui-text-secondary)',
                  children: 'No tracks found.'
                })
              : null,
          error
            ? jsx('p', { className: 'px-4 pb-3 text-xs text-destructive', children: error })
            : jsx('p', {
                className: 'px-4 pb-3 text-[0.6875rem] text-(--ui-text-quaternary)',
                children: results.length ? 'Select a result to play it. Esc closes.' : 'Press Enter to search. Esc closes.'
              })
        ]
      })
    })
  })
}

function SpotifyRightRail() {
  return jsx('div', {
    className: 'h-full',
    children: jsx(NativePlayer, {})
  })
}

export default {
  id: PLUGIN_ID,
  name: 'Spotify Player',
  defaultEnabled: true,
  register(ctx) {
    pluginRest = (path, options) => ctx.rest(path, options)
    restControl = (action, argument) =>
      ctx.rest('/control', {
        method: 'POST',
        body: { action, argument }
      })

    ctx.register({
      id: 'native-side-pocket',
      area: 'panes',
      title: 'Spotify',
      data: {
        placement: 'left',
        collapsible: true,
        dock: { pane: 'sessions', pos: 'bottom' },
        height: '152px',
        minHeight: '68px',
        maxHeight: '520px'
      },
      render: () => jsx(SpotifyRightRail, {})
    })

    ctx.register({
      id: 'persistent-status',
      area: 'statusBar.right',
      order: 115,
      render: () => jsx(SpotifyStatusBar, {})
    })

    ctx.register({
      id: 'search',
      area: PALETTE_AREA,
      data: {
        id: 'spotify.search',
        label: 'Spotify: Search music',
        keywords: ['spotify', 'music', 'song', 'artist', 'album', 'playlist'],
        run: () => $searchOpen.set(true)
      }
    })
  }
}