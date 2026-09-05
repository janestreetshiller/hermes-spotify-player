# Verification — Player 1.3

## Executed locally
- `bash scripts/test.sh`: **19 JavaScript tests, 19 Python tests passed**, Python compilation and macOS temporary-home install/uninstall passed.
- `hermes plugins doctor spotify-player`: manifest, runtime discovery, import and registration passed. No tools/hooks registered or overridden.
- `npm run demo:build && npm run test:browser`: Chromium ran the actual production UI against explicitly simulated demo fixtures. No page errors; compact/default/expanded, lyrics, synchronized pane/footer controls, seek commit, 390px layout, and legible track titles at a real 234px Hermes sidebar width checked. The narrow-sidebar failure was reproduced first, then fixed by putting controls on their own grid row.
- Shared polling: **2 status calls over 4.8 seconds** (initial + one poll), even with pane and footer mounted.
- Hidden-document event test: **0 new status requests over 4.5 seconds** after a settling window. Visibility state is injected in this browser test, not an OS battery measurement.
- Optional WebGL: **13 draws over 1.1 seconds**, buffer **350×40**; max configured 480×40, DPR 1. No canvas by default. Reduced-motion/offscreen/compact paths release it. Software SwiftShader used in headless CI; not a hardware GPU benchmark.
- `npm audit --audit-level=high`: **0 vulnerabilities**, including demo dependencies.
- `npm run demo:media`: generated a silent MP4 and 1200×675 PNG from real UI. Inspected final visual output; no clipping.

## UI density refinement
- Default pane reduced to 136px; demo expanded view reduced to 320px.
- Underlined 28px view tabs replace the large pill bar. Artwork capped at 192px; labeled volume is a short control beside transport.
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
