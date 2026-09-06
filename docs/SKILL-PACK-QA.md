# Mix Desk skill-pack dry run and UI QA

## Delivered scope

Three installed slash skills: `/my-mix`, `/new-tracks`, `/my-favorites`; one shared portable HTML renderer; a profile-scoped conflict-preserving installer; shared `AGENTS.md` / `CLAUDE.md`; workflow documentation and regression tests. This extends the existing `spotify_player_curate` tool, not Hermes core or the physical player UI.

The Configure flow is quiz → real read-only candidates → editable tracklist → explicit private creation → verified receipt. Song-title clicks show **inline details only**: no Spotify window, new tab or playback. The finished playlist has a separate, explicit open action.

## Actual dry-run execution

- This PR preparation run does not include a live dry-run execution. The existing implementation already describes a fixture-backed dry-run flow, and this draft preserves that behavior without re-running account-coupled interactions.

## Verified checks

| Gate | Result |
|---|---|
| `npm test` with existing Hermes Python | Passed: 19 JS tests, 26 API tests, 10 audio tests, 6 installer tests, 2 renderer tests and 1 pack-install test; native audio self-test passed. API mutation tests use explicit mocks, not live account writes. |
| `npm run test:mix-desk` | Fails in this environment. `playwright` missing initially, then browser launch fails with macOS sandbox permissions (`bootstrap_check_in ... Permission denied (1100)`) after running `npm ci`. Visual-mode checks could not execute. |
| Song-click correction | Not re-verified in this environment. |
| Geometry | Not re-verified in this environment. |
| Motion | Not re-verified in this environment. |
| Theme / keyboard | Not re-verified in this environment. |
| Script/data safety | Renderer escapes script-breaking JSON, preserves text as DOM text, rejects malformed IDs rather than repairing them, deduplicates track URIs, and validates success URL/state. |
| Installation | Installed twice successfully into the active default profile; temp-profile tests preserve conflicting edits and write no config. Fresh Hermes slash discovery found exactly the three requested commands. |
| Spotify availability | Existing auth was valid; enabled the previously disabled Spotify toolset with `hermes tools enable spotify`, after a timestamped config backup, and read back the setting. Takes effect in a new session; current conversation tool schemas were not changed. |
| Scope | Existing player source, approved README artwork, OAuth implementation and repository history were preserved; no backend/app restart or remote push was performed. |

## Easing / padding / interaction findings

These findings are inherited from implementation-level notes and were not re-verified in this run because the browser harness could not launch.

| Finding | Impact / severity | Refinement | Status / evidence |
|---|---|---|---|
| Pagination wrap and action height drift | Could not be re-verified in this environment because `test:mix-desk` did not complete successfully. | Implementation-level refinements remain in the shipped template styles. | Pending re-run with working Playwright host.
| Row padding and outer spacing | Could not be re-verified in this environment because `test:mix-desk` did not complete successfully. | Implementation-level refinements remain in the shipped template styles. | Pending re-run with working Playwright host.
| Song detail interaction and approval state transitions | Could not be re-verified in this environment because `test:mix-desk` did not complete successfully. | Implementation-level refinements remain in the shipped template behavior. | Pending re-run with working Playwright host.
| Reduced-motion and easing curves | Could not be re-verified in this environment because `test:mix-desk` did not complete successfully. | Implementation-level refinements remain in the shipped template styles. | Pending re-run with working Playwright host.

## Remaining limits / acceptance notes

- The browser harness uses the production HTML renderer and a **simulated Hermes send bridge**; it verifies outgoing request data, not an autonomous LLM's future music judgment. The live backend read path was not exercised in this prep pass. A live user click-to-agent-to-artifact round trip in Hermes Desktop remains a user-facing smoke check; no fabricated end-to-end success is claimed.
- No live playlist creation was tested because this was explicitly a dry run. Existing create/retry/read-back behavior passes the repository's mocked API tests. A live save requires the user's explicit approval of an exact draft.
- Browser screenshots use synthetic tracks and injected host font/theme tokens. Actual theme-specific contrast, screen-reader behavior, 200% text scaling and subjective motion feel on lower-powered devices remain broader acceptance checks, not asserted passes.
- Native player browser/render tests were not rerun: the player renderer, physical display menus and marketing output were not modified. Its existing unit/API/native self-test gate did pass.
- Browser screenshot viewing/inspection was not available in this environment due Playwright launch failure, so no new screenshot-based claims were made. A new host theme or unusually long localized labels should trigger the same bounds/screenshot audit rather than clipping or font shrinking.

## Reproduce

From the repository root:

```bash
python3 -m unittest discover -s tests -p 'test_mix_desk.py' -v
python3 -m unittest discover -s tests -p 'test_skill_install.py' -v
npm run test:mix-desk
HERMES_PYTHON=<existing-Hermes-python> npm test
python3 scripts/install-skills.py
```

Browser measurements and labeled synthetic screenshots are regenerated under `.test-output/mix-desk/`; they are not marketing artwork. Never commit real liked-song responses, session mood data, tokens or live desktop captures.
