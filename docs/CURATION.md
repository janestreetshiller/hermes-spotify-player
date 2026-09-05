# Taste palette and one-shot Spotify curation

## In the player

Open **Player settings → Taste palette**. Enter a playlist name and either exact Spotify track URIs or `Artist | Title` lines. **Create private** creates and reads back the new playlist. Named songs require exact case-insensitive title/artist matches; unmatched names prevent creation and return candidates. After creation the draft contains resolved track URIs.

**Like tracks / Unlike tracks** updates the URI draft explicitly and reads back every resulting state. **Read taste** fetches a sample of the 20 most recently liked tracks, not the user's entire taste/history. **LLM prompt** produces selectable text from the brief, seeds, and optional sample. It does not secretly send a chat message or automatically modify the account.

The form scrolls inside the player screen; it adds no external fixture or permanent height. Settings → Spotify connection opens the existing PKCE connection dialog.

## One LLM tool call

`spotify_player_curate` is registered by this plugin in the `spotify` toolset. A fresh tool catalog/session may be required after installing the backend. No separate LLM service is embedded in the player: the calling assistant chooses songs, then the tool resolves and saves the explicit selection.

Illustrative payload (not a real execution or a created playlist):

```json
{
  "action": "create",
  "name": "After-dark palette",
  "description": "A short mix curated from my brief",
  "public": false,
  "requestId": "a-new-unique-id-per-intended-playlist",
  "songs": [{"title": "White Wedding - Pt. 1", "artist": "Billy Idol"}]
}
```

- `create`: 1–20 explicit named songs **or** 1–50 exact `spotify:track:` URIs with 22-character IDs. URI duplicates are removed while preserving order. Public visibility is false unless explicitly requested; collaborative is always false. Supply a name, optional description, and unique `requestId`.
- `preview`: `queries` (1–10 strings) returns up to three Spotify candidates per query. No write.
- `taste`: returns the recent-liked sample. No write.
- `set-liked`: `tracks` (1–50 exact URIs) plus explicit `saved: true` or `false`. No toggle semantics.

Never invent IDs. Do not create/save when the user requested only recommendations. Named-song resolution selects the first exact title/artist result; use explicit URIs when a specific album/recording matters.

## Reliability and privacy

Creation uses `POST /me/playlists` and `POST /playlists/{id}/items`. It reads the exact playlist metadata and ordered item list before returning `verified:true` and the real playlist ID/URL. A partial failure retains the returned playlist handle and reports failure, never a fabricated success.

A private SQLite receipt at `$HERMES_HOME/spotify-player/curation.sqlite3` stores request fingerprints/results to prevent duplicate creation on retries. Reuse the same ID for the same operation. An interrupted create without a returned ID is explicitly uncertain; inspect Spotify before making a new request ID. A changed payload with an old ID is rejected. Replayed receipts describe the previous operation, not a new read of today's playlist state.

The backend needs Spotify PKCE authorization, including library read/modify and playlist read/modify scopes. The configured Hermes defaults include these scopes. Spotify developer account/quota restrictions still apply. The native desktop playback connection is independent of Web API authorization.

## Activation and verification

The new `/curate` route requires a backend reload (quit/reopen Hermes Desktop after saving active work); a JavaScript-only plugin reload does not mount new Python routes. This work did not restart the active app.

Local verification: 25 Python tests, 19 JavaScript tests, browser UI/geometry/lifecycle checks and plugin registration doctor passed. The browser adapter is test-only and explicitly simulated. Live auth was absent (`logged_in=false`; real client returned `SpotifyAuthRequiredError`), so real-account creation and likes remain unverified. No playlist/library mutations were made during development.

Reference: [Spotify Create Playlist](https://developer.spotify.com/documentation/web-api/reference/create-playlist), [Add Items](https://developer.spotify.com/documentation/web-api/reference/add-items-to-playlist), [Hermes plugin docs](https://hermes-agent.nousresearch.com/docs/developer-guide/plugins/).
