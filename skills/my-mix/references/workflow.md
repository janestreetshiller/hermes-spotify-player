# Mix Desk shared workflow

## Session contract

Keep one JSON state and one HTML artifact per conversation outside Git. Use the same output path for all updates; a widget callback is answered by rewriting that artifact, not by posting a replacement prose-only list. Never write to an arbitrary callback path: match `artifact` against the path this conversation created. On resumption read the saved state, not just the submitted widget text.

Start with `mode`, `stage: quiz`, `tracks: []`, `dryRun` (an explicit boolean), and any already supplied `answers`. Ask the quiz once; preserve values on Back and subsequent drafts. If the session cannot render previews, use `clarify` with at most four choices per question and one batched call per independent question group. Wait for answers before deciding dependent questions. All defaults are optional and visible; do not infer mental health from the mood field.

## Make preferences operational

| Control | Curation effect |
|---|---|
| Mood now → emotional destination | Meet: preserve emotional register; lift: brighten gradually; ground: reduce density/intensity; release: allow tension then resolution. |
| Listening scene | Focus favors lower lyrical distraction; moving favors pulse; company avoids abrupt style whiplash. These are editorial choices, not hard acoustic claims. |
| Sonic texture | Velvet: warm/soft edges; grit: raw/distorted/live-feeling; glass: sparse/clean/electronic; wood: acoustic/organic/intimate. Translate to artist/genre/arrangement queries, not fictional API fields. |
| Orbit distance 0–100 | In my-mix, requested discovery share; in new-tracks, distance from anchor styles; in favorites, 0 and source-locked. Calculate counts with Python. No claim of objective novelty. |
| Energy arc | Steady, slow bloom, build/crest/release, or soft landing. Sequence opener → body → landing. The bars visualize requested intent only, never analyzed waveforms. |
| Anchors / hard no / explicit | Seeds and hard exclusions outrank softer preferences. Unknown explicit status fails an exclude-explicit filter until metadata verifies it. |
| Freshness | New-to-me means absent from the explicitly checked sample. Release-window mode requires date metadata and a computed cutoff; do not substitute one meaning for another. |

## Read-only draft

1. Inspect actual schemas. Prefer the plugin's `spotify_player_curate` tool: `taste` reads a recent-liked sample; `preview` resolves up to 10 queries with up to 3 candidates each. Exact shapes live in the repository's `docs/CURATION.md` and the runtime tool schema.
2. Persist each tool-response batch locally; deduplicate URIs and calculate counts in Python. Verify declared sampleCount/total/hasMore against enumerated data. `total` describes the source; it is not the count you retrieved. Track artist/title, exact URI, source, and editorial reason. Never copy credentials into the artifact.
3. Query specific candidates based on the brief, not merely the first result of broad search. Title/artist/version identity must match intended recording. Reject malformed identifiers before lookup: `spotify:track:` plus exactly 22 ASCII letters/digits. Do not strip whitespace or normalize invalid input into a valid-looking token.
4. Use available native `spotify_search`/album metadata when the brief requires duration, release date, explicit status, or a specific market. The curation `preview` response only includes identity; it cannot prove those filters. Report unavailable filters and resolve the decision with the user instead of inventing values.
5. If fewer acceptable tracks exist, show the honest smaller draft and shortfall. Deduplicate exact IDs and inspect obvious duplicate recordings by title/artist/version. No filler and no silent relaxation of hard exclusions.
6. Save the local state below, including a fresh `requestId` from Python `uuid.uuid4().hex` for this intended creation. Render with `terminal(command='python3 "<my-mix-skill-dir>/scripts/mix_desk.py" --state "<state.json>" --output "<same-artifact.html>"')`. Emit the preview directive again only if the surface requires it.

```json
{
  "mode": "my-mix",
  "stage": "review",
  "dryRun": false,
  "name": "A short name derived from the brief",
  "note": "Explain actual vs requested count and limitations here.",
  "source": "Describe checked source and pagination coverage",
  "answers": {},
  "requestId": "generated-per-intended-playlist",
  "tracks": []
}
```

Every real track row must contain `uri`, `title`, `artist`, `reason`; optional metadata/provenance may be retained in the JSON state. Empty tracks render an honest empty state with saving disabled. The renderer refuses malformed URIs and unsafe success URLs. It escapes JSON and uses text nodes for user/catalog text. The widget itself does not fetch, authenticate, train, play or mutate anything.

## Approval, one write, exact read-back

- `action: draft` is not authorization to create, like, queue, or play. The review has remove/reorder controls and an explicit **Create private playlist** action. Song-title clicks open inline details only; they must never open Spotify, a browser tab, or start playback. Only an explicitly labeled action on the finished playlist may leave Hermes.
- A submitted `action: approve` must match this session's state, request ID, mode, artifact and known candidate URIs. Accept only an ordered unique subset of the stored verified candidates (1–50). Reject mismatches; do not trust an arbitrary JSON list as verified catalog data. Take playlist name/description and dry-run status from saved state. Preserve the current hard exclusions; a stale draft must not overwrite a newer one.
- If the state OR callback OR current request is dry-run, no mutations. Dry run ends with a review and a disabled create button. The user must explicitly request a fresh live workflow to leave dry-run mode.
- For approved live creation, call `spotify_player_curate` with `action: create`, explicit `name`, `description` (max 300 chars), `public: false`, the saved `requestId`, and exact ordered `tracks`. It forces collaborative false and verifies the remote result. Never create a second playlist just because a tool times out.
- Keep this request ID and exact payload for retries. A partial result with `playlistId`/URL must be shown as partial. A replayed receipt describes an earlier operation: read the exact playlist metadata and all items again before claiming current success. Use available native playlist reads; if their schema cannot paginate items, use the existing plugin's documented read path or the Hermes Spotify client via `terminal`, not guessed methods. If read-back is unavailable, report unverified rather than saved.
- Success requires the returned ID/URL, name, private visibility, noncollaborative setting, exact URI order/count, and `ok: true` + `verified: true`. Reconcile the real response against the approved payload in Python. Render `stage: success`, `verified: true` and the real `url` only after verification. Never reuse a success state for a changed draft.
- Error: preserve answers and request ID, render `stage: error`, `error` and any real playlist URL. Respect 429 Retry-After; surface 401/403 setup/scope failures. No hot-loop retries, no auth guessing, no automatic app restart.
- Playback is separate opt-in. Creating a playlist does not authorize autoplay, volume changes, device transfer, liking or unliking songs.

## UI acceptance / dry-run evidence

Test all three quiz modes, Back, preferences, empty results, long titles/reasons, row removal/reordering across pages, duplicate-submit guard, approval, no-bridge copy fallback, error recovery and verified-success links. Test 320/480/760px, keyboard focus, light/dark host tokens, reduced motion and both ordinary/long metadata. The widget uses host font/colors and no network assets; the physical Spotify player layout is unchanged.

Use 140ms `cubic-bezier(.2,.8,.2,1)` for border/background feedback only; no page-slide delay or animated fake progress. Reduce motion to zero. Maintain 44px controls, 24px desktop / 16px narrow outer padding, 16–20px field spacing and explicit track pagination. Inspect screenshots as well as DOM bounds: containment alone misses awkward wrapping. Log each discovered easing/padding defect, impact, severity, fix and verified viewport in `docs/SKILL-PACK-QA.md`. Keep real listening data and live screenshots outside Git; committed screenshots must be labeled fixtures and must not replace marketing artwork.
