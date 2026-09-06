# Verification — Player 1.3

> Current visual contract: [Retro Player](RETRO-PLAYER.md). The compact/standard/expanded visual notes below describe the superseded design, not the current fixed-ratio faceplate.

## Current UI audit

See [UI audit](UI-AUDIT.md) for the current control-by-control results and limits. The latest run passed 15 JavaScript tests, 25 Python tests, the browser regression suite, and 16 targeted UI audits. The real installed Hermes Play/Pause buttons were verified against Spotify read-back; native seek/volume/restoration also passed. Screen navigation is now on the top chrome; search, playlists, and account setup are embedded; effects are default treatment. **Spotify account authorization is still missing; live library/search/playlist verification is not complete. Direct EQ remains unimplemented.**

## Previous two-mode/curation revision (historical)

- `npm test`: 19 JavaScript and 25 Python tests passed, plus temporary-profile installer checks.
- `npm run test:browser`: builds fresh production UI first; passed mode persistence, exact header-aware fit, narrow/wide resizes, 27 geometry combinations, visualizer lifecycle and curation form tests. Demo/backend responses are simulated.
- `hermes plugins doctor spotify-player`: discovers one tool, `spotify_player_curate`; the manifest declares it.
- Default-profile links resolve to the edited worktree. No other profile was modified.
- Live Web API read failed with `SpotifyAuthRequiredError`; auth is not connected. No playlist or library writes were attempted against the real account.
- Current live screenshot capture is blocked by ScreenCaptureKit/screencapture failures. AX metadata is visible, but the latest real-window auto-fit toggle is not newly verified.
- New Python routes need a safe desktop restart; this session did not restart the active app. Read [Curation](CURATION.md) before live verification.

## Earlier verification record (historical, not current readiness)

## Executed locally
- `bash scripts/test.sh`: **19 JavaScript tests, 19 Python tests passed**, Python compilation and macOS temporary-home install/uninstall passed.
- `hermes plugins doctor spotify-player`: manifest, runtime discovery, import and registration passed. No tools/hooks registered or overridden.
- `npm run demo:build && npm run test:browser`: Chromium ran the actual production UI against explicitly simulated demo fixtures. No page errors; compact/default/expanded, lyrics, synchronized pane/footer controls, seek commit, 390px layout, and legible track titles at a real 234px Hermes sidebar width checked. The narrow-sidebar failure was reproduced first, then fixed by putting controls on their own grid row.
- Shared polling: **2 status calls over 4.8 seconds** (initial + one poll), even with pane and footer mounted.
- Hidden-document event test: **0 new status requests over 4.5 seconds** after a settling window. Visibility state is injected in this browser test, not an OS battery measurement.
- Optional WebGL: actual **Alloy / metal-fx@1.0.4**, silver/dark. Last browser run: **11 draws over 1.1 seconds**; **96×96 maximum shared GPU buffer**, **30×28 output ring**, DPR 1. Exact upstream fragment-shader equality and visible painted pixels asserted. Reduced-motion/pause/offscreen/background release the artifact; offscreen/background produce no further draws. No-WebGL fallback preserves playback controls. Software SwiftShader used in headless tests; not a hardware GPU benchmark.
- `npm audit --audit-level=high`: **0 vulnerabilities**, including demo dependencies.
- `npm run demo:media`: generated a silent MP4 and 1200×675 PNG from real UI. Inspected final visual output; no clipping.

## Artifact correction
- Removed the custom `SignalField` shader rather than presenting it as a library artifact.
- Copied the original MIT-licensed `metal-fx@1.0.4` source from the supplied library’s pinned installation; checksum and deterministic embed checked by the test suite.
- `media/player-1.3-metal-fx.png` shows the real shader-rendered metallic transport rim. Demo playback is simulated; live Hermes connection status below remains separate.

## Lightweight full-player chrome
- A shared theme-aware brushed shell, inset cover edge, beveled transport, and thin silver seek/volume tracks apply to compact, standard, and expanded views. No new runtime dependency, GPU canvas, polling loop, or perpetual shell animation.
- Standard mode exposes the FX toggle and the same actual Alloy ring; no expansion is required. Native range keyboard and pointer commit semantics are preserved.
- Inspected both expanded and standard modes in the running Hermes window; returned the live pane to a short sidebar pocket. This is live visual verification, not a claim of new end-to-end playback testing.

## UI density refinement
- Default pane stays at 136px; expanded chrome is capped at 280px rather than stretching to fill oversized panes.
- Underlined 28px view tabs replace the large pill bar. Artwork capped at 128px; labeled volume is a short control beside transport.
- Browser assertions verify artwork/tab/volume bounds and every control fitting a 234×136 standard pane. Desktop/mobile screenshots and media regenerated.
- This is visual/renderer verification, not a fix or new claim for the unresolved live Hermes backend connection.

## Native Spotify — real app, not fixtures
`python scripts/native-smoke.py` ran the scoped FastAPI plugin route via TestClient with the real `osascript` helper and signed-in Spotify **1.2.98.301**, macOS 27 ARM64. Pause, seek, volume and restoration read-backs passed. Spotify reports integer volume with a one-point quantization tolerance.

Five uncached native snapshots: median **186.97 ms** wall time; aggregate child CPU **0.314 s**; maximum child RSS **31,457,280 bytes**. These measure transient helper processes, **not** total Spotify/Hermes memory, idle CPU, battery drain or a before/after savings percentage. No persistent helper daemon was added.

## Hermes host verification and activation boundary
- Desktop plugin is installed and enabled in the default local Hermes window; verified through Settings → Plugins and visible side pocket/status controls.
- Fresh import of the actual Hermes server discovers all three `/api/plugins/spotify-player` routes (`control`, `auth/status`, `auth/start`).
- This session's already-running Hermes server predates the install. Its routes are not hot-mounted by JavaScript reload. **Quit/reopen Hermes Desktop after this active conversation finishes** to activate the backend in that window. The live window currently reports Spotify unavailable until then. We did not restart/kill the user's active app or bypass route security.
- Native route behavior and renderer behavior were verified separately; full click-through from the already-running Hermes window is pending that safe restart.
- Hermes source tested: `f159e581c7afd22a5c94652c569e3859f1b994d2` (0.21.0). CI pins that same public upstream revision. This does not claim testing every later upstream commit.

## Explicitly not verified
- Spotify Web API OAuth is not connected here (`logged_in=false`). Search/library/playlist paths are contract-tested against the current Hermes request interface but **not live account-tested**. No library or playlist was mutated.
- Nokie **0.1.0**, remote main `e5ddecb70e4084dcf675e593179ef1eda3ffe9f3`, is the design reference. This is not a Nokie/Tauri runtime plugin. Nokie source and unrelated changes are untouched.
- Social media copy/assets are delivered, not posted to an unspecified account.

## Sources
- [Hermes desktop SDK](https://hermes-agent.nousresearch.com/docs/developer-guide/desktop-plugin-sdk)
- [Current Spotify macOS Homebrew metadata](https://formulae.brew.sh/api/cask/spotify.json)
- [Spotify February API migration](https://developer.spotify.com/documentation/web-api/references/changes/february-2026)
- [Spotify July quota changes](https://developer.spotify.com/documentation/web-api/references/changes/july-2026)

Machine-readable runs: `evidence/browser.json`, `evidence/native.json`, `evidence/tests.json`. Native listening history, tokens and personal window screenshots are intentionally excluded from published evidence.
