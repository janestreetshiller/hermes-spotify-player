# Spotify Player 1.3 — ready-to-publish package

## Short post

Spotify, inside Hermes. No second web player.

Player 1.3 adds native seek + volume, shared polling that stops when hidden, Nokie glow and opt-in WebGL.

Try the interactive demo:
https://janestreetshiller.github.io/hermes-spotify-player/demo/

## Longer post / release caption

Keep the music. Lose the switching.

Hermes Spotify Player 1.3 controls the Spotify macOS app from a resizable Hermes pane and compact status bar. Play/pause, skip, seek and adjust volume without opening another web player.

This update replaces duplicate status polling with a shared cache, backs off when paused or stopped, and stops status polling when Hermes is hidden. Lyrics only tick while visible. Nokie's focus glow is adapted to Hermes theme colors, with a small CSS loader and an optional 12fps WebGL signal. Effects are off by default and respect reduced motion.

Updated for Spotify 1.2.98.301 and the current Hermes plugin SDK. Spotify search/library/playlist features need your own PKCE connection. macOS only; not affiliated with Spotify.

Code: https://github.com/janestreetshiller/hermes-spotify-player
Demo: https://janestreetshiller.github.io/hermes-spotify-player/demo/

## Media
- `media/player-1.3-social.png` — 1200×675 card.
- `media/player-1.3-demo.mp4` — silent real-UI interaction recording; simulated playback.
- `media/social-1.3.html` — editable composition source.
- `media/player-1.3-product.png` — screenshot of the production plugin rendered through a demo SDK adapter.

Alt text: “Hermes × Spotify. Keep the music. Lose the switching. A dark, gold-accented native-style player with generated ribbon artwork, playback controls, lyrics tabs and effects off.”

Artwork is AI-generated; player UI is real code. Demo track/lyrics are fixtures, not a Spotify session or music recording. Do not claim CPU/battery percentage savings or live OAuth validation.

Publication status: prepared, not posted to any social account. No destination/account was confirmed.
