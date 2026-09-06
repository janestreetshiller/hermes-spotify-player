# Original player cleanup — September 5, 2026

## Release scope

Hermes Desktop sidebar plugin only. The existing silver player's proportions, bounded controls and compact layouts are improved; this is not a completed collection of historic player replicas. The user's researched UIs remain the source for future players. The three generic alternatives briefly prototyped during development were rejected and are removed, including their selector and generated media. TERMIN8 work is kept in a separate local repository, not published as a Hermes feature.

## Changes

- Existing full, screen-off and mini modes: 320×280, 320×112 and 320×88 design space. Uniform content-box scaling includes borders and fractional host zoom. 234px+ is recommended for readable labels; a shorter host may still scroll vertically rather than crop its controls.
- Top-tab painted rims are separated by real chrome space. Previous/next buttons use compact horizontal capsules, following the supplied silver-player reference. Existing mirrored side controls remain inset from the curved frame.
- Mini metadata no longer clips; its play-button rim anchors to that button, not the whole row. Opening settings after selecting mini works reliably. Errors are visible in collapsed LCDs and failed sliders roll back.
- Connecting state is distinct from Spotify being closed. Native seek/volume wait for read-back and reject ignored commands. Native volume has a one-point quantization tolerance; seek permits one second of playback drift. Displayed values always come from Spotify, not a fabricated successful draft.
- Existing chrome/ice/graphite LCD finishes and ribbons/waves/pulse/grid ambient visualizers are preserved. These are finishes/effects, not additional historic player designs. Mini is a compact pane mode, not a separate OS window.

## Verification

- `npm test`: 19 JavaScript + 25 Python tests, native ignored/delayed command checks, compilation, resource and installer checks.
- `npm run test:browser`: browser regression suite and 17 focused UI audits, including painted-frame containment, settings fit, lyrics, account errors, likes races and control dispatch.
- `npm run test:stress`: 144 geometry cases (3 existing finishes × 3 modes × 4 widths × 4 zooms), 2× DPR, zero measured drift over 12 frames per case, no overlapping hardware/out-of-frame control rectangles. Also metadata fit, mini rim anchoring, settings reopening, finish persistence, transport/search/likes/playlist dispatch, 45 collapse/expand cycles and compact failure rollback.
- Fixture screenshots: `docs/evidence/stress/`. These render production plugin code but use simulated Spotify responses. They do not certify live account operations.
- Live terminal prototype previously displayed actual Spotify song/art/volume and confirmed pause. Playback was returned to playing and volume 44 was restored/read back. Exact live seek restoration was not certified. That prototype is now outside this release.
- Initial real Hermes UI was observed. Its window subsequently became unavailable, so the final revised source has not been re-certified in that native window. Installed default-profile plugin links resolve to this source.

## Remaining acceptance gates

Spotify Web API authorization remains disconnected. Live search → selected song playback, library lookup/mutation and playlist read/write/read-back are not certified; no live library writes were made. A signed-in account session and final native Hermes-window acceptance pass are still required. Passing fixtures is not a claim that every feature is live-proven or that all possible host sizes are glitch-free.

Marketing must describe this scope accurately. Generated demo video is simulated playback. The supplied poster base is concept artwork, not live UI evidence. No social-account publication is implied by generating or uploading marketing artifacts.
