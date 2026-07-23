# Privacy

Hermes Spotify Player does not collect telemetry, analytics, advertising identifiers, or crash reports.

## Local data and processes

Playback status and controls are sent to the installed Spotify macOS application through Apple's automation interface using `/usr/bin/osascript`. The plugin may launch Spotify in the background with `/usr/bin/open` when a playback command needs it.

## Spotify

Authorization, search, liked-track state, and playlist actions use Hermes Agent's built-in Spotify Web API client. OAuth tokens remain in Hermes' normal credential store under `$HERMES_HOME/auth.json`. This plugin does not receive or store a Spotify password or client secret.

## LRCLIB

When the user opens the Lyrics view, the backend sends the current track title, artist, album, and rounded duration to `https://lrclib.net/api/get`. The response is cached only in memory for the life of the gateway process. No Hermes identity, Spotify token, playlist, or listening-history payload is sent to LRCLIB.

## Storage

The desktop plugin does not write a listening history. Hermes Desktop may retain the plugin's enabled/disabled preference in its normal plugin settings store.
