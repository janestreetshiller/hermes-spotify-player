# Release checklist

## 1.3 release candidate

- [x] Current runtime tested and pushed without rewriting history
- [x] No-scroll digital menu rule, with no physical frame-button chrome inside displays
- [x] Full local unit/browser/audio/focus/layout suites, 495 menu cases and 144 stress cases
- [x] Official pinned HTTPS install into an empty isolated home, normal scan reviewed and accepted
- [x] Real disconnected backend, Client ID validation, idempotent desktop link, and plugin doctor
- [x] Own-account PKCE setup documented; no author credentials or personal curation database bundled
- [x] Gitleaks history/tree scans and npm audit passed
- [ ] Final native-window certification (inspection could not discover a window)
- [ ] Independent user's OAuth approval and live library actions
- [ ] Final stable release/merge; PR #11 remains open for review

Evidence and exact tested revision: [INSTALL-VERIFICATION.md](docs/INSTALL-VERIFICATION.md).

## Historical 1.2 record (not a 1.3 certificate)

- [x] Standalone repository layout (required for third-party integrations)
- [x] Backend and desktop plugin IDs both equal `spotify-player`
- [x] Manifest versions aligned at `1.2.0`
- [x] Automated desktop contract tests pass
- [x] Automated backend tests pass
- [x] Real macOS Spotify status smoke test passes
- [x] Fresh-profile install test through the Hermes Git installer (local Git URL)
- [ ] Visual QA in light and dark themes at compact/default/expanded heights
- [x] Add 2–4 product images under `docs/media/`
- [x] Independent security/code review
- [x] Create public GitHub repository and push the verified commit
- [x] Tag `v1.2.0` and publish release notes
- [ ] Post launch copy and images to X / Discord
