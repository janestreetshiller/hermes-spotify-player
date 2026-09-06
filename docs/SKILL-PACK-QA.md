# Mix Desk skill-pack dry run and UI QA

## Delivered scope

Three installed slash skills: `/my-mix`, `/new-tracks`, `/my-favorites`; one shared portable HTML renderer; a profile-scoped conflict-preserving installer; shared `AGENTS.md` / `CLAUDE.md`; workflow documentation and regression tests. This extends the existing `spotify_player_curate` tool, not Hermes core or the physical player UI.

The Configure flow is quiz → real read-only candidates → editable tracklist → explicit private creation → verified receipt. Song-title clicks show **inline details only**: no Spotify window, new tab or playback. The finished playlist has a separate, explicit open action.

## Actual dry-run execution

- Invoked the installed plugin's real `_curate` tool handler with `action: taste` and `action: preview`, using the existing Hermes Python/Spotify client and the user's active-profile OAuth; not mocked HTTP or synthesized API data.
- Taste returned `ok: true`, `mutation: false`, 20 recent liked songs and `hasMore: true`. This is a sample, not a complete favorite/history scan. The private raw response stays outside Git.
- Three demonstration artist queries returned nine unique real catalog candidates; selected eight for the local review artifact after excluding an off-anchor search result. Counts were computed from the saved JSON batches, not estimated.
- The demonstration brief is explicitly labeled, not inferred from the user's mood or claimed to be personalized from the liked sample. The UI keeps `dryRun: true`, so the create action is disabled.
- No create, add-items, like/unlike, queue, device, volume or playback calls were made. OAuth refresh may update the existing local credential cache; no credentials were printed or committed.
- Live artifacts: profile-local `artifacts/spotify-mix-desk/mix-desk.html`, `state.json` and `quiz.html`; raw reads are in ignored `.test-output/mix-live/`. These are intentionally not repository fixtures.

## Verified checks

| Gate | Result |
|---|---|
| `npm test` with existing Hermes Python | Passed: 19 JS tests, 26 API tests, 10 audio tests, 6 installer tests, 2 renderer tests and 1 pack-install test; native audio self-test passed. API mutation tests use explicit mocks, not live account writes. |
| `npm run test:mix-desk` | Passed all three modes, Back-value retention, source-locked favorites orbit, draft payload, remove/reorder, private approval payload, pending-edit lock, dry-run/empty disabled save, error recovery, synthetic success URL and no-bridge copy fallback. |
| Song-click correction | Browser regression found the old external song links, then passed after replacing them with inline details; no extra browser page opened. |
| Geometry | Passed at 320/480/760px: no horizontal document overflow; visible control targets at least 44px; pagination controls share a row; footer controls share a height. |
| Motion | Computed border/background transitions are 140ms `cubic-bezier(.2,.8,.2,1)`; reduced-motion computed duration is 0s. No perpetual animation or fake progress. |
| Theme / keyboard | Light and dark host-token fixtures rendered; screenshots inspected; Tab reaches a button; visible focus styles exist. This is not a screen-reader certification. |
| Script/data safety | Renderer escapes script-breaking JSON, preserves text as DOM text, rejects malformed IDs rather than repairing them, deduplicates track URIs, and validates success URL/state. |
| Installation | Installed twice successfully into the active default profile; temp-profile tests preserve conflicting edits and write no config. Fresh Hermes slash discovery found exactly the three requested commands. |
| Spotify availability | Existing auth was valid; enabled the previously disabled Spotify toolset with `hermes tools enable spotify`, after a timestamped config backup, and read back the setting. Takes effect in a new session; current conversation tool schemas were not changed. |
| Scope | Existing player source, approved README artwork, OAuth implementation and repository history were preserved; no backend/app restart or remote push was performed. |

## Easing / padding / interaction findings

These observations came from actual browser geometry and screenshot inspection, not just stylesheet review.

| Finding | Impact / severity | Refinement | Status / evidence |
|---|---|---|---|
| Pagination wrapped Next onto a second line at 320px | Inconsistent navigation grouping / medium | Shortened labels to Previous/Next and used an explicit three-column row with 8px gaps. | Fixed; row-position assertion passes at all three widths. |
| Footer action heights differed (44px vs 60px) | Unbalanced actions and cramped long label / medium | Stretch-aligned footer controls with 48px minimum height; narrow controls share available width. | Fixed; equal-height assertion and final narrow screenshot pass. |
| Repeated track rows felt too tall | Unnecessary scrolling / low | Reduced vertical row padding from 16px to 12px and reason spacing from 8px to 4px; retained 44px controls and natural title wrapping. | Fixed; narrow screenshot has clean two-line titles, no clipping. |
| Outer spacing needed an explicit narrow breakpoint | Cramped controls or excessive desktop whitespace / medium | 16px outer padding at widths up to 480px, 24px above; field grouping 16–20px. | Implemented; computed padding verified at 320/480/760px. |
| Song-title links opened Spotify | Broke the in-Hermes selection flow / high | Replaced song links with expandable inline details, return focus on close, and a visible Details cue. | Fixed; zero track anchors, inline-region and single-page browser assertions pass. |
| Track inspection looked like plain text at desktop width | Hidden interaction / medium | Added a small underlined Details cue while keeping the full title as a 44px-minimum button. | Fixed after screenshot review; layout/browser regression rerun passed. |
| Dry-run label implied the local draft could not be edited | Confusing account-vs-preview boundary / low | “Dry run · edits stay in this preview”; instructions explicitly say this run cannot save to Spotify. | Fixed; final screenshots inspected. |
| Ascending bars had no visible meaning | Could imply measured audio analysis / medium | Visible “Requested energy arc” label plus accessible description; workflow states editorial intent only. | Fixed; light/dark screenshot review. |
| Controls could be edited while approval was pending | Stale selection could diverge from submitted payload / high | Lock controls after a successful send, retain duplicate-send guard and visible pending status. | Fixed; browser pending-edit assertion. |
| Overly showy easing would delay a small form | Distraction and motion sensitivity / low | Color/border-only 140ms easing, no sliding wizard or spinner theater, zero reduced motion. | Implemented and computed-style verified. |

## Remaining limits / acceptance notes

- The browser harness uses the production HTML renderer and a **simulated Hermes send bridge**; it verifies outgoing request data, not an autonomous LLM's future music judgment. The live backend read path was exercised separately. A live user click-to-agent-to-artifact round trip in Hermes Desktop remains a user-facing smoke check; no fabricated end-to-end success is claimed.
- No live playlist creation was tested because this was explicitly a dry run. Existing create/retry/read-back behavior passes the repository's mocked API tests. A live save requires the user's explicit approval of an exact draft.
- Browser screenshots use synthetic tracks and injected host font/theme tokens. Actual theme-specific contrast, screen-reader behavior, 200% text scaling and subjective motion feel on lower-powered devices remain broader acceptance checks, not asserted passes.
- Native player browser/render tests were not rerun: the player renderer, physical display menus and marketing output were not modified. Its existing unit/API/native self-test gate did pass.
- No remaining material padding/clipping defect was seen in the inspected narrow/light/dark fixture views. A new host theme or unusually long localized labels should trigger the same bounds/screenshot audit rather than clipping or font shrinking.

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
