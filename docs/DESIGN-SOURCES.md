# Design provenance

- Nokie: inspected `desktop/src/styles.css` engaged-perimeter treatment; adapted finite focus glow using Hermes theme tokens instead of importing Nokie's application runtime. Current Nokie remote main at verification: `e5ddecb70e4084dcf675e593179ef1eda3ffe9f3`, desktop 0.1.0. Local Nokie changes preserved.
- Existing repository compositions: `docs/media/hermes-spotify-announcement.png` and the prior player screenshot establish the dark editorial surface, product crop, restrained labeling and accent hierarchy. New editable composition: `docs/media/social-1.3.html`.
- Web Design Factory: reused the editorial hero + feature strip composition pattern inspected in `outputs/nvidia-batch/hero-editorial-commerce.html`, `outputs/nvidia-throughput-batch/hero-minimal.html`, `widget-kpi-react.tsx`, and `stats-strip-react.tsx`. Reimplemented loading bars in small CSS, not a full React/effects dependency import.
- Original artwork generated using the configured Imagegen/FAL tool. Source result: https://v3b.fal.media/files/b/0aa92550/ZPSEK9SUdkheQWS8o2rbL_3oEnASj9.png . Text-free chrome ribbon with muted gold/violet lighting. Original PNG retained; WebP conversion used by demo.
- All product controls in media are rendered from `desktop/plugin.js` with an explicitly demo-only SDK adapter and fixtures. No generated UI is used as verification evidence.
