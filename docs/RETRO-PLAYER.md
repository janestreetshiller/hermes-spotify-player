# Retro Player: two shell modes

## Sizing and immersion

- **Screen-on:** 320 × 280 native faceplate. Artwork, XP-style ambient visualizer, lyrics, settings and curation live inside the display.
- **Screen-off:** 320 × 112 native transport shell; no display or visualizer canvas remains mounted.
- One click changes mode. Width uniformly scales the shell down to a 234px minimum; narrower docks scroll rather than crushing text.
- The contribution's `height`, `minHeight`, and `maxHeight` are updated together to the scaled shell height plus measured host chrome. This overrides a leftover tall sash reservation without removing/re-docking the pane or editing private host layout state. Registration is deduplicated by mode/height and keeps one stable render function.
- When a shared tab group or host reservation remains taller than the shell, the player is bottom-aligned above the footer. Increasing available height moves it down without stretching it; a too-short pane retains scroll access. Browser regression reproduces this at 300px and 420px group heights.
- A ResizeObserver updates fit when the pane width changes. It reads geometry only; it does not mutate host DOM.
- Three bundled finishes (Classic chrome, Ice blue, Graphite) and the selected mode/view persist in plugin storage.
- Chrome outlines, LCD text and blue transport controls stay inside the faceplate. Long metadata uses ellipsis and full-text tooltips.
- This is an authored SVG/CSS skin, not a cleaned original bitmap or an original Windows asset. Dimensions describe this implementation, not a measured historic skin.

## Honest media behavior

The XP canvas is a lightweight **ambient animation**, not an audio spectrum: Spotify supplies no PCM stream here. It stops/unmounts on hidden, paused, reduced-motion or screen-off states as appropriate. Lyrics are fetched from LRCLIB and advanced against playback position; they are not Spotify's proprietary lyric stream, and availability varies. The original licensed Alloy/metal-fx accent is enabled by default when visible and playing, respects reduced motion, and falls back to static chrome. There is no FX toggle.

## Curation

Open **Taste palette** using the side control. The compact form scrolls within the existing display rather than growing the player. See [Curation](CURATION.md) for the single-call tool, verified mutations and authorization boundary.

## Verification boundary

`npm test`, `npm run test:browser` and `git diff --check` passed for this revision. Browser coverage exercises mode persistence, host-header-aware exact fit at narrow/wide widths, the 27 width/height/zoom layout cases, control bounds, visualizer lifecycle and curation UI. Browser Spotify responses are explicitly simulated.

Installed default-profile links resolve to this source. Live Hermes Play/Pause and embedded connection open/close checks passed with real Spotify read-back. The top-shell Art / XP / Lyrics placement was captured in the real window. Search, playlist selection, and account forms use the existing screen. Web API auth is disconnected: no live playlist/library mutation was performed, and live account verification remains a release gate. See [UI audit](UI-AUDIT.md) for the current test results and EQ boundary.
