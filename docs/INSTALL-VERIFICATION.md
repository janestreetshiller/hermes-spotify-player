# Candidate installation verification — 2026-09-06

Runtime and installer revision: `2c23f6529cab8618dbc9c09c69563a6c9e0211cd`.

## Verified

- `HERMES_PYTHON=/Users/main/.hermes/hermes-agent/venv/bin/python npm test` passed: JavaScript contracts, backend routes with fixtures, audio lifecycle tests, native DSP self-test, and six isolated desktop installer cases.
- Installer cases cover clean and repeated install/uninstall, source updates through the link, a custom profile and checkout with spaces, stale-link repair, missing source, and preservation of existing files/directories. A link to a directory is rejected rather than followed.
- `npm run demo:build && npm run demo:media` passed. The refreshed product and social PNGs use the current player with demo fixtures; the social composition was visually inspected. The README now uses this product shot instead of the earlier concept poster.
- The pinned runtime commit was pushed to GitHub before the clean CLI attempt. No demo npm dependencies are needed by the desktop link installer.

## Clean CLI install gate

The actual command was attempted with an empty temporary `HERMES_HOME`:

```sh
hermes plugins install janestreetshiller/hermes-spotify-player \
  --ref 2c23f6529cab8618dbc9c09c69563a6c9e0211cd --enable
```

GitHub cloning reached Hermes's plugin security scan. Its CAUTION verdict requires confirmation, so the non-interactive command exited without installing/enabling the plugin. Findings include local command execution, loopback OAuth URLs, minified demo code, media size, and a comment matched by its injection heuristic. Scan approval has been requested for the temporary profile. Scanning was not disabled, and the active profile was not changed.

This is **not yet a certified clean end-to-end Hermes install**. After approval, finish the CLI install, run the installed desktop script twice, verify the link and installed revision, and check backend loading. A fresh desktop restart and Spotify authorization remain separate native acceptance steps; earlier live coverage and limits are in [the QA report](QA-2026-09-05.md).

Pinned installs intentionally refuse ordinary `plugins update`. The README now gives the explicit pin, custom-profile installation, replacement guidance, and full Desktop restart requirement.
