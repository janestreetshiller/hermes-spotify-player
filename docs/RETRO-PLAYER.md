# Original silver player: three shell modes

This release cleans up the original silver player. Its design references are the user's expanded and compact silver-player images in `retro-player-GUI`; see [design provenance](DESIGN-SOURCES.md). The rejected generic Cassette/MiniDisc/Receiver alternatives are removed. Further researched player UIs are future work, not shipped skins. TERMIN8's proprietary-terminal project is separate and is not included in this Hermes plugin.

See [release verification](PLAYER-CLEANUP.md) for current evidence and remaining live-account gates.

## Sizing and immersion

- **Screen-on:** 320 × 280 native faceplate. Artwork, XP-style ambient visualizer, lyrics, settings and curation live inside the display.
- **Screen-off:** 320 × 112 native transport shell; no display or visualizer canvas remains mounted.
- **Mini:** 320 × 88 compact transport with full metadata and settings/expand controls. It is a mode of the existing pane, not a detached OS window.
- Width uniformly scales the shell to the actual content box, including below 234px, avoiding the old border/zoom overflow. 234px or more is recommended for readability; unusually short panes retain vertical scrolling.
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

Installed default-profile links resolve to this source. Historical live Hermes Play/Pause and embedded connection open/close checks passed with real Spotify read-back. This collection revision was observed live in terminal-browser; a final Hermes-window recheck was unavailable after that window closed. The top-shell Art / XP / Lyrics placement was captured in the real window. Search, playlist selection, and account forms use the existing screen. Web API auth is disconnected: no live playlist/library mutation was performed, and live account verification remains a release gate. See [UI audit](UI-AUDIT.md) for the current test results and EQ boundary.
