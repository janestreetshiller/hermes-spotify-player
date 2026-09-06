# Privacy

Hermes Spotify Player does not collect telemetry, analytics, advertising identifiers, or crash reports.

## Local data and processes

Playback status and controls are sent to the installed Spotify macOS application through Apple's automation interface using `/usr/bin/osascript`. The plugin may launch Spotify in the background with `/usr/bin/open` when a playback command needs it.

## Optional audio analysis

Opening the player or Visualizer view does not authorize capture. **Enable audio** starts a session-scoped helper using Apple's ScreenCaptureKit, configured to include the Spotify macOS application (`com.spotify.client`). Only an audio output callback is registered; no microphone, screen-frame or recording output is registered. macOS recording permission is required. The plugin does not change security settings or grant itself permission.

Raw samples are analyzed in memory. The helper emits bounded frequency bands, quantized waveform points and RMS at at most 12Hz to Hermes' scoped backend and the player UI. This component does not save PCM/audio recordings or upload analysis to Spotify, LRCLIB, an LLM or an analytics service. No audio-analysis data is used for account authorization.

Stop, pause, hiding/unmounting the view, screen collapse and reduced motion release capture. Abandoned viewer leases expire after five seconds; stale visual data clears after two seconds. Missing audio or permission is displayed honestly. Hermes/macOS may retain their own ordinary operational logs; this plugin does not collect or transmit crash reports.

The optional helper is built locally with Xcode Command Line Tools and cached under `~/.cache/hermes-spotify-player/audio/`, keyed by source/build configuration. The cache contains an executable, not recordings, and is separate from Spotify credentials. Ordinary playback controls do not require this helper.

## Spotify

Authorization, search, liked-track state, and playlist actions use Hermes Agent's built-in Spotify Web API client. OAuth tokens remain in Hermes' normal credential store under `$HERMES_HOME/auth.json`. This plugin does not receive or store a Spotify password or client secret.

## LRCLIB

When the user opens the Lyrics view, the backend sends the current track title, artist, album, and rounded duration to `https://lrclib.net/api/get`. The response is cached only in memory for the life of the gateway process. No Hermes identity, Spotify token, playlist, or listening-history payload is sent to LRCLIB.

## Storage

The desktop plugin does not automatically record a listening history. Current playback, lyrics and audio-analysis frames are held in memory. Display preferences (mode, finish, selected view and visualizer) and the enabled/disabled setting use Hermes' normal plugin storage; audio-analysis consent is session-local, not a saved preference.

Explicit Taste palette playlist creation writes retry-protection receipts to `$HERMES_HOME/spotify-player/curation.sqlite3` (owner-only permissions). Receipts can contain the request ID/fingerprint, playlist name/ID/URL, selected track URIs, verification result and bounded error details. They are not an automatic playback log. Removing receipts removes duplicate-creation protection, so do not remove them while resolving an uncertain creation.

The Taste palette can prepare an editable prompt containing a taste brief, seed tracks and an explicitly requested recent-liked sample. Merely preparing it does not call an LLM. If you submit it to an agent, its contents are governed by that agent/provider's privacy settings.
