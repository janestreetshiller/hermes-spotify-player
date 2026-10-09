# Changelog

## 1.3.0 — release candidate

- Preserve the silver player and bundled reference layouts; iPod players remain separate future work.
- Fit settings, account setup, search, playlist selection, and Taste pages within one padded display without menu scrolling.
- Use flat digital text actions inside screens; physical frame-button chrome stays outside.
- Start visualizers immediately on selecting Visual, with no live Stop/source labels; retain session-local consent, permission errors, reduced motion, and cleanup.
- Page playlist/search destinations, multiline track entries, long messages and prompts without hiding controls.
- Document fresh-user PKCE setup with the installer's own Spotify Client ID/account; never bundle credentials or personal library data.
- Do not append a recent-liked account sample to generated prompts or claim unverified Spotify DNA support.
- Add source-hash-bound menu geometry tests across all shipped layouts and current installer checks.

## 1.2.0 — 2026-07-23

- Native resizable Spotify player pane and status-bar controls
- Spotify track search and playback
- Liked-track state and idempotent like/unlike updates
- Playlist picker and add-current-track flow
- Synced LRCLIB lyrics with timeline highlighting
- In-app Spotify PKCE connection flow
- Scoped backend API with validation and tests
