# 1.3 release-candidate verification

## Fresh install: passed

Tested runtime revision: `93f6e00a9e8123f8a900a7aa08dfc45456e649ab`.

Production renderer SHA-256: `70793592be3baadc9ed309b78978c92239080982ff7dd3254b6f8d5f942c7504`.

The official Hermes CLI installed that exact HTTPS revision into newly created, empty `HOME` and `HERMES_HOME` directories with a cleared environment and no Spotify variables. The normal plugin security scan remained enabled. Its caution report was reviewed and explicitly accepted at the interactive prompt; no global scan setting was changed and no credentials were supplied.

- The installed Git HEAD matched the requested revision.
- The desktop installer ran twice successfully; the resulting link resolves to the installed `desktop/plugin.js`, with the hash above.
- `hermes plugins doctor <installed-plugin-directory>` passed runtime discovery, manifest parsing, import, and registration: one tool, no hooks.
- FastAPI TestClient mounted the real installed backend without mocking its authentication functions: `GET /auth/status` returned HTTP 200 with `loggedIn:false`, `clientConfigured:false`, and `phase:idle`.
- Empty and malformed Client IDs were rejected by `POST /auth/start` with HTTP 400 before any browser authorization.
- No `auth.json` or personal curation database was present. Existing user profiles and Spotify accounts were not modified.

Machine-readable receipt: [fresh-install.json](evidence/fresh-install.json).

## Install this tested build

Run in an interactive terminal with a Hermes CLI supporting immutable `--ref` installs:

```bash
hermes plugins install https://github.com/janestreetshiller/hermes-spotify-player.git \
  --ref 93f6e00a9e8123f8a900a7aa08dfc45456e649ab --enable
"${HERMES_HOME:-$HOME/.hermes}/plugins/spotify-player/scripts/install-desktop.sh"
hermes plugins doctor "${HERMES_HOME:-$HOME/.hermes}/plugins/spotify-player"
```

If the scan requests confirmation, review it and approve only if you trust this source. Expected findings include scoped macOS subprocess calls, the localhost PKCE callback, bundled browser demo code/media, and a CSS comment false-positive. A noninteractive install correctly stops for confirmation; do not disable scanning globally. For an existing plugin checkout, save local source edits before intentionally replacing it with `--force`.

Save active work, quit/reopen Hermes Desktop to mount the backend, and enable Spotify Player under Settings → Plugins if needed. Follow [your own account setup](../README.md#your-spotify-account-not-the-authors). The package contains no author Client ID or account credentials; OAuth tokens belong to the installer's active Hermes profile.

## Final local gate: passed

- `npm test` with the installed Hermes Python: 19 JavaScript tests, 26 API tests, 10 audio-lifecycle tests, six desktop-installer tests, plus native Swift DSP/resource checks.
- `npm run test:browser`: behavioral regression suite, UI audits, audio tests, keyboard focus/reduced-motion checks, layout tests, and the new menu matrix.
- Menu matrix: **495 cases**, all 11 shipped layouts at 234/340/640px; settings, Taste details/tracks/actions/results/prompts, multiple track/message pages, playlist paging/error/created-link states, search, and fresh-user account/setup screens. Checks real descendant overflow/control bounds, including close controls, and rejects digital button gradients, shadows, and frame pseudo-elements.
- `npm run test:stress`: 144 geometry cases, three finishes, mode/zoom combinations, transitions, and error recovery.
- `npm audit --audit-level=high`: zero reported vulnerabilities.
- Gitleaks publication-tree and Git-history scans: no leaks found.
- `git diff --check`: clean.

Source-bound results: [menus](evidence/menus/results.json), [focus/motion](evidence/audio/focus-motion-results.json), [styles](evidence/styles/results.json). Published screenshots use synthetic fixtures. The full menu screenshot matrix stays in ignored `.test-output/menu-matrix/`; representative narrow screenshots are committed.

## Explicit limits

- Browser account/playback responses are synthetic; passing these tests is not a claim that another person completed Spotify OAuth or performed real library writes.
- The final native Hermes window was unavailable to desktop inspection (no discoverable windows; no CDP endpoint). No app was restarted and no OS permission was changed to force that check.
- New users must authorize their own Spotify account and satisfy Spotify's current developer-app/account restrictions; optional audio analysis additionally requires their macOS recording permission.
- iPod players, Spotify DNA/n-gen integration, and the separate TERMIN8 prototype are not part of this candidate.
- Keep PR #11 open for review. This is a release candidate, not a declaration that all native-host/manual gates have passed.
