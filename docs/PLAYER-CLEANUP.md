# Original player cleanup — September 5, 2026

## Required digital-display rule

Every menu must fit one screen inside its exact padded display bounds: no menu scrolling, clipped controls, or reuse of the frame's physical button chrome inside the digital interface. Use explicit pages for lists, entries, prompts, and long errors. This applies to every current player view/layout; iPod players are subsequent work, not part of this release candidate. Current source-bound checks are in `docs/evidence/menus/results.json`; the notes below retain the earlier verification history.

## Release scope

Hermes Desktop sidebar plugin only. The existing silver player's proportions, bounded controls and compact layouts are improved; this is not a completed collection of historic player replicas. The user's researched UIs remain the source for future players. The three generic alternatives briefly prototyped during development were rejected and are removed, including their selector and generated media. TERMIN8 work is kept in a separate local repository, not published as a Hermes feature. The newer audio/focus continuation is a local candidate, not a newly published release or final native-window certificate.

## Changes

- Existing full, screen-off and mini modes: 320×280, 320×112 and 320×88 design space. Uniform content-box scaling includes borders and fractional host zoom. Narrow-view legibility is not certified: review measured approximately 7.25px text and 18.125px rows at 232px content width. Preserving proportions does not establish readability. A shorter host may still scroll vertically rather than crop its controls.
- Top-tab painted rims are separated by real chrome space. Previous/next buttons use compact horizontal capsules, following the supplied silver-player reference. Existing mirrored side controls remain inset from the curved frame.
- Mini metadata no longer clips; its play-button rim anchors to that button, not the whole row. Opening settings after selecting mini works reliably. Errors are visible in collapsed LCDs and failed sliders roll back.
- Connecting state is distinct from Spotify being closed. Native seek/volume wait for read-back and reject ignored commands. Native volume has a one-point quantization tolerance; seek permits one second of playback drift. Displayed values always come from Spotify, not a fabricated successful draft.
- Chrome/ice/graphite remain finishes, not separate historic player designs. Mini is a compact pane mode, not a separate OS window. The ambient ribbons/waves/pulse/grid concepts were subsequently replaced by measured-audio display modes.

## Local continuation

- Optional Spectrum, Scope and Alchemy-inspired renderers consume Spotify-filtered ScreenCaptureKit analysis. Explicit consent, permission/missing-source states, bounded frame requests and expiring viewer leases replace decorative activity. See [audio source and evidence boundaries](AUDIO-VISUALIZERS.md) and [privacy](../PRIVACY.md).
- The silver display is wider and side controls sit lower with measured bevel/screen clearance. Playlist rows are visibly reachable; the menu pins its song selection across playback changes. Digital menu controls use readable contrast rather than hardware-style chrome.
- Close/Escape restore the connected panel opener and preserve next-Tab order, without stealing focus from another selected tab. Host-supplied reduced motion joins the OS preference; it does not constitute native TERMIN8 integration.
- New audio and focus/motion fixture regressions are included in `npm run test:browser`. Source-hash-bound focus results are in `docs/evidence/audio/focus-motion-results.json`. A full final-candidate run must be recorded separately from the earlier checks below.

## Earlier verification (not a final-candidate certificate)

- `npm test`: 19 JavaScript + 25 Python tests, native ignored/delayed command checks, compilation, resource and installer checks.
- `npm run test:browser`: browser regression suite and 17 focused UI audits, including painted-frame containment, settings fit, lyrics, account errors, likes races and control dispatch.
- `npm run test:stress`: 144 geometry cases (3 existing finishes × 3 modes × 4 widths × 4 zooms), 2× DPR, zero measured drift over 12 frames per case, no overlapping hardware/out-of-frame control rectangles. Also metadata fit, mini rim anchoring, settings reopening, finish persistence, transport/search/likes/playlist dispatch, 45 collapse/expand cycles and compact failure rollback.
- Fixture screenshots: `docs/evidence/stress/`. These render production plugin code but use simulated Spotify responses. They do not certify live account operations.
- Live terminal prototype previously displayed actual Spotify song/art/volume and confirmed pause. Playback was returned to playing and volume 44 was restored/read back. Exact live seek restoration was not certified. That prototype is now outside this release.
- Initial real Hermes UI was observed. Its window subsequently became unavailable, so the final revised source has not been re-certified in that native window. Installed default-profile plugin links resolve to this source.

## Remaining acceptance gates

Spotify authorization, one real Like and one real playlist addition were subsequently verified through Hermes controls with Spotify read-back; the test state was restored/cleaned up. Those completed account mutations are not repeated during this cleanup. A later standalone live run verified changing pixels in all three sound visualizers and clean helper shutdown, but predates the final host-preference patch and does not certify the revised native Hermes window.

Remaining gates: complete tests/build tied to the final candidate's source and artifact hashes; final native Hermes-window and resource-budget acceptance; narrow-view legibility/supported-width review; and truthful release scope. Live search → selected playback, broader curation edge cases and exact native seek restoration are not certified here. The historic-player collection and native first-party TERMIN8 packaging remain unfinished and separate. Passing fixtures is not a claim that every feature is live-proven or that all host sizes are acceptable.

Marketing must describe this scope accurately. Generated demo video is simulated playback. The supplied poster base is concept artwork, not live UI evidence. No social-account publication is implied by generating or uploading marketing artifacts.
