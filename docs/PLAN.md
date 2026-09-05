# Spotify Player 1.3 plan

## Baseline / preservation
- Original repository: janestreetshiller/hermes-spotify-player, main d2f52c0.
- Separate Git worktree; preserve original checkout's moved-document pointers and all Nokie changes.
- Installed Spotify 1.2.98.301 matches current Homebrew metadata; verify the app automation interface, not a scraped DOM.
- Hermes runtime f159e581c7; migrate deprecated auth imports.
- Nokie initial remote main f48b4f06d1b8bfac09ced15760b951d8b2954eb3; refreshed remote main e5ddecb70e4084dcf675e593179ef1eda3ffe9f3 during verification. Local desktop has uncommitted work. Reuse engaged-perimeter CSS from its current styles without modifying Nokie. This is design compatibility, not an invented Nokie plugin API.

## Implementation
1. Shared React Query status cache for pane/status bar, deduped requests, 4s playing / 15s paused / 30s stopped or error, no background interval; commands invalidate and refresh all consumers.
2. Visible-only timeline/lyrics ticks; no continuous lyric RAF. Static status label. Lyrics only while expanded and visible.
3. Native seek and strict finite volume/seek validation before any process launch. Serialize/cache native snapshots briefly to coalesce clients without running a daemon. Preserve Spotify API search/library/playlists.
4. Nokie focus perimeter, finite interaction glow, CSS-only loading indicator inspired by Web Design Factory. Opt-in small WebGL signal field, capped resolution/frame rate, off when hidden, paused or reduced motion; dispose GPU resources.
5. Maintain no web player, embedded browser, audio capture, analytics, shell interpolation, or additional runtime dependencies.

## Demo and delivery
- Reuse existing announcement/square composition language after inspecting prior assets. Generate an original FAL artwork layer; never present generated UI as proof.
- A static interactive demo renders the actual plugin with an explicitly labeled fixture backend. Separate live native smoke report proves Spotify control; record demo video and PNG social composition.
- Automated behavior tests + native integration + responsive/reduced-motion/offscreen UI checks and measured request/GPU budgets.
- Push feature branch, open full PR, read back remote head/checks. Supply a ready-to-publish social post; publishing destination/account must be specified before posting externally.
