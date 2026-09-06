# Audio visualizers — local continuation

## Implemented, not a new release

The former clock-driven ribbons/waves/pulse/grid concepts are removed. Stored selections migrate to **Spectrum**. Three renderers consume actual analysis frames:

- **Spectrum:** segmented, log-spaced frequency bands. Visual reference: the user's `retro-player-GUI/OIP-3142359896.jpg` jetAudio spectrum.
- **Scope:** a conventional measured waveform display, not another historic player replica.
- **Alchemy-inspired:** green radial traces and glow informed by the user's WMP image `60c704ea101d6fefc8b026eb4a0f164a-3794365472.png`. This is an original implementation driven by measured waveform/spectrum/RMS, **not** the original Microsoft visualization engine or a pixel-identical recreation.

These are display modes in the existing silver object. They do not complete the requested collection of historic player UIs.

## Source and privacy boundary

`dashboard/AudioSpectrum.swift` uses Apple's [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit), with `SCContentFilter(display:including:exceptingWindows:)` restricted to `com.spotify.client`. Only an `.audio` output is registered. No microphone output or screen-frame output is registered; no recording output, PCM file, remote upload, or Spotify credential is used.

macOS 13+ and Xcode Command Line Tools are required to build the optional helper. It compiles to a source-keyed user cache with deployment target macOS 13. It requires existing macOS Screen & System Audio Recording permission. Missing permission is reported; the component does not change security settings or automatically prompt on load. Ordinary playback controls do not depend on the helper.

**Enable audio** is explicit and session-local. Capture stops on Stop, pause, hidden/unmounted view, screen collapse, or reduced motion. The server expires abandoned viewer leases after five seconds and zeroes stale display data after two seconds. A dead parent also ends the helper. OS reduced motion always wins; the standalone adapter additionally honors the native host preference. No clock/random animation stands in for missing audio.

The helper analyzes mono 48kHz samples with a 1024-point Hann-windowed FFT, returning 32 bounded bands, 64 quantized waveform points and RMS at at most 12Hz. Raw samples stay in memory. Fixed amplitude scaling means quiet audio can appear quiet; the renderer does not manufacture beats. The client permits only one in-flight frame request.

## Evidence, separated by kind

- **Native DSP, generated input:** `scripts/test-audio-native.py`; verifies zero output for silence and the expected band/RMS for a 1500Hz tone. No sound is played or captured by that test.
- **Live source:** a bounded five-second Spotify-filtered probe returned 55 frames and exited cleanly.
- **Live terminal UI:** Spectrum, Scope and Alchemy each reported `streaming` and changed canvas pixels over 450ms. Stop returned `off`; no audio helper remained. Private PNGs are retained locally under `.test-output/live-*.png`. No playback, volume, like or playlist mutations were made in this continuation.
- **Synthetic browser fixtures:** `docs/evidence/audio/fixture-*.png`, `fixture-results.json` and `focus-motion-results.json`. Cover data-driven pixels, silence, explicit consent, reduced motion, lease cleanup, permission errors, visible playlist rows, pinned song selection and keyboard focus restoration. These are not live Spotify evidence.
- **Later host-preference patch:** adapter theme/font/focus/motion checks are separate from that live smoke. Native/OS motion preferences are not silently overridden for demonstrations. An isolated fixture or a documented theme callback is not a certificate for an updated running native application.

The final native Hermes window, native TERMIN8 embedding/packaging, additional historic shells and narrow-view legibility remain acceptance gates. See `PLAYER-CLEANUP.md`; keep the standalone repository distinct.
