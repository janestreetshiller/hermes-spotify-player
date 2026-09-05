# Hermes Spotify Player

A native Spotify side pocket for [Hermes Desktop](https://hermes-agent.nousresearch.com/docs/user-guide/desktop) on macOS.

![Hermes Spotify Player 1.3 — actual UI with simulated demo playback](docs/media/player-1.3-social.png)

[Interactive demo](https://janestreetshiller.github.io/hermes-spotify-player/demo/) · [Demo video](docs/media/player-1.3-demo.mp4) · [Verification](docs/VERIFICATION.md) · [Social copy](docs/SOCIAL.md)

It keeps playback inside the desktop workflow without embedding Spotify's Widevine-protected web player. Hermes controls the signed-in Spotify macOS app locally, while its scoped backend uses Hermes' existing Spotify PKCE connection for catalog and library actions.

## Features

- Resizable now-playing pane with artwork and progress
- Play/pause, previous, next, seek, and volume controls
- One shared status cache: 4s playing / 15s paused / 30s stopped or error; no hidden-window status polling
- Nokie-inspired finite focus glow and CSS-only Web Design Factory-style loading bars
- Opt-in decorative WebGL: 12fps cap, 480×40 maximum buffer, DPR 1; released when paused, hidden, offscreen, reduced-motion, or collapsed
- Search and play tracks from the command palette
- Like/unlike the current track
- Add the current track to a playlist
- Synced lyrics when LRCLIB has a match
- Compact status-bar controller when the pane is closed
- Native Hermes components and theme variables

## Requirements

- macOS
- Hermes Agent **0.21.x** with Hermes Desktop and the documented `useQuery`/`queryClient` plugin SDK exports; tested against `f159e581c7`
- Spotify **1.2.98.301** tested on macOS 27 ARM64 (matches Homebrew metadata at verification)
- Spotify for macOS, signed in
- A Spotify developer Client ID for search, likes, and playlists (the in-app PKCE setup walks through this)

Playback control is local through Spotify's macOS automation interface. Search, library, and playlist actions use Spotify's official Web API through Hermes' built-in Spotify client.

## Install

```bash
hermes plugins install janestreetshiller/hermes-spotify-player --enable
~/.hermes/plugins/spotify-player/scripts/install-desktop.sh
```

Then **quit and reopen Hermes Desktop after saving active work** so its own `hermes serve` backend mounts the newly installed routes. Restarting the messaging gateway alone does not refresh an already-running Desktop backend. Open **Settings → Plugins** and enable **Spotify Player** if its saved desktop toggle is off. Run **Cmd+K → Reload desktop plugins** for subsequent JavaScript-only edits. The player appears below the Sessions pane. You can drag or resize it like any other pane.

Hermes deliberately separates Python gateway plugins from native desktop UI plugins. The first command installs and enables the scoped backend. The script links `desktop/plugin.js` into `$HERMES_HOME/desktop-plugins/spotify-player/` so Hermes Desktop can hot-load it.

### Profiles

Set `HERMES_HOME` before running the installer for a named/custom profile:

```bash
HERMES_HOME="$HOME/.hermes/profiles/work"   "$HOME/.hermes/plugins/spotify-player/scripts/install-desktop.sh"
```

The backend plugin must also be installed and enabled in that profile's Hermes home.

## Connect Spotify

Open the Spotify connection dialog from the status bar. First-time setup asks for a Spotify Client ID and shows the exact redirect URI:

```text
http://127.0.0.1:43827/spotify/callback
```

Hermes uses PKCE. No Spotify client secret or Spotify password is stored by this plugin.

The setup dialog reads Hermes' configured redirect URI, including a custom `HERMES_SPOTIFY_REDIRECT_URI`, instead of assuming the default callback.

## Privacy and network access

- No telemetry or analytics.
- Local playback commands go to the installed Spotify macOS app through `/usr/bin/osascript`.
- Search, library, playlist, and authorization calls go to Spotify through Hermes' built-in Spotify client.
- Lyrics requests send track title, artist, album, and duration to [LRCLIB](https://lrclib.net/). Lyrics are cached in memory for the running gateway process.

See [PRIVACY.md](PRIVACY.md) for the exact data flow.

## Update

```bash
hermes plugins update spotify-player
```

Reopen Hermes Desktop after Python backend updates. The desktop file is symlinked into the installed repository, so it follows plugin updates automatically. Use **Cmd+K → Reload desktop plugins** if the UI does not hot-reload.

## Uninstall

```bash
~/.hermes/plugins/spotify-player/scripts/uninstall-desktop.sh
hermes plugins disable spotify-player
hermes plugins remove spotify-player
```

## Development and tests

```bash
./scripts/test.sh
npm ci --include=dev
npx playwright install chromium
npm run demo:build
npm run test:browser
npm run demo:media  # needs ffmpeg
# Opt-in: briefly changes and restores native playback
npm run test:native
```

For a live smoke test:

```bash
/usr/bin/osascript -l JavaScript dashboard/spotify_control.js status
```

## Compatibility and resource boundaries

The Nokie reference is its current 0.1.0 desktop design (remote main `e5ddecb70e40`, local style source inspected without editing it). This remains a **Hermes plugin**, not a Nokie/Tauri plugin or a claimed Nokie SDK integration. No Nokie runtime dependencies are bundled.

The installed plugin reuses Hermes React and React Query. Demo-only npm dependencies are not required at runtime. WebGL is decorative, **not audio-reactive**; there is no microphone, audio capture, playback SDK, embedded Spotify site, analytics, or resident helper daemon. A transient `osascript` runs on status polls and commands. The status bar remains active if the pane closes.

Spotify search, likes, and playlist APIs require separate PKCE authorization and applicable Spotify account/app access. Current `/me/library`, `/me/library/contains`, and playlist `/items` routes replace removed convenience methods in Hermes. API errors are surfaced rather than retried aggressively. No claim of live OAuth verification is made without a connected account.

## Security

The backend allow-lists actions, validates Spotify URIs and playlist IDs, uses fixed executable paths, and calls subprocesses without a shell. The desktop UI reaches only its scoped `/api/plugins/spotify-player` REST namespace.

Report vulnerabilities through GitHub's private security advisory flow. See [SECURITY.md](SECURITY.md).

## License

MIT
