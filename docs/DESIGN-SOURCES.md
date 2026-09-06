# Design provenance

## Original player reference (authoritative)

User research folder: `retro-player-GUI`. The cleanup follows the supplied silver expanded/compact player references, not invented Cassette, MiniDisc or Receiver skins:

- `Codex Image Sep 4, 2026, 11_37_53 PM.png` — expanded silver frame, blue circular transport and capsule previous/next controls. SHA-256 `4d0040c915cfd9576f508ef15aafff262d034a75c0416ee944a754452512c78c`.
- `Codex Image Sep 4, 2026, 11_40_34 PM.png` — compact silver transport reference. SHA-256 `6ad1c20559b203cffe83a63630ce9466f2bd13ce3dd51fd58bd5512e4d1415db`.

These are reference inputs, not runtime bitmap assets or a claim of pixel-identical reproduction. The current candidate also implements reference-backed window, deck, handheld, droplet and multi-panel geometries through shared controls. [The full inventory](reference-styles.json) maps all **20 files / 19 byte identities** to **11 candidate layout families**, including duplicate/view-state accounting and explicit adaptation limits. Finishes are not layouts. The original organic illustration, playback equalizer, rip/burn/broadcast features and saved-album database are not fabricated or claimed. Native/reference acceptance remains separate from implementation. No endorsement, ownership of historic designs or asset redistribution clearance is claimed.

## Existing assets and effects

- Current marketing poster: user-supplied `Codex_Image_Sep_5_2026_12_40_36_AM_fdf1b4.png`, preserved as `docs/media/retro-poster-base.png`. Retro computer concept artwork, not live verification evidence. Original editorial composition in `docs/media/retro-poster.html`; portrait and landscape exports use the full supplied scene.

- Nokie: inspected `desktop/src/styles.css` engaged-perimeter treatment; adapted finite focus glow using Hermes theme tokens instead of importing Nokie's application runtime. Current Nokie remote main at verification: `e5ddecb70e4084dcf675e593179ef1eda3ffe9f3`, desktop 0.1.0. Local Nokie changes preserved.
- Existing repository compositions: `docs/media/hermes-spotify-announcement.png` and the prior player screenshot establish the dark editorial surface, product crop, restrained labeling and accent hierarchy. New editable composition: `docs/media/social-1.3.html`.
- Web Design Factory: reused the editorial hero + feature strip composition pattern inspected in `outputs/nvidia-batch/hero-editorial-commerce.html`, `outputs/nvidia-throughput-batch/hero-minimal.html`, `widget-kpi-react.tsx`, and `stats-strip-react.tsx`. Reimplemented loading bars in small CSS, not a full React/effects dependency import.
- Artifact Library, Alloy section (reviewed privately; internal endpoint omitted). Public package provenance: [metal-fx](https://github.com/Jakubantalik/metal-fx). Exact reviewed source: `desktop/src/ArtifactLibrary.jsx` at library revision `5efc351`, Alloy section, `metal-fx@1.0.4`. Spotify uses its published silver/dark palette, unchanged GLSL shaders, ring compositor and instance API, not the rejected custom sine-wave. Original package source, SHA-256 provenance and MIT license are retained in `vendor/metal-fx/`. `scripts/vendor-metal-fx.mjs` embeds only the engine into the single-file Hermes plugin, caps scheduling at 12fps and DPR at 1, and omits proximity scanning/glow/React wrapper. The stable native play/pause button remains separate from the decorative canvas. `img-fx`, `thinking-orbs`, and `liquid-gooey` are **not** claimed as integrated.
- Original artwork generated using the configured Imagegen/FAL tool. Source result: https://v3b.fal.media/files/b/0aa92550/ZPSEK9SUdkheQWS8o2rbL_3oEnASj9.png . Text-free chrome ribbon with muted gold/violet lighting. Original PNG retained; WebP conversion used by demo.
- All product controls in media are rendered from `desktop/plugin.js` with an explicitly demo-only SDK adapter and fixtures. No generated UI is used as verification evidence.
