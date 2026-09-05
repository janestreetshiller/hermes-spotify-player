# Spotify player UI verification

## Result and boundaries

The edited default-profile plugin is installed through the existing source links and was exercised in the running Hermes window. Playback integration, embedded forms, view placement, button treatments, and lyrics regressions are fixed. **Account-dependent end-to-end verification remains blocked by Spotify OAuth not being connected.** No live likes or playlists were modified.

## Measured control sizing

The sizing sweep uses the actual inner SVG silhouette, bounded painted rims, display clearance, a maximum 180px top-strip span, and at least 192px display width. Selected native sizes: top buttons 56×24px with 4px gaps and 11px labels; side buttons 30×30px with 18px vector icons and 8px gaps. Side centers are inset to x=43/277, leaving a 194px display. These are the largest feasible candidates under those explicit compact-player constraints, not universal touch-target sizes. `scripts/button-sizing.mjs` records the sweep; the UI audit samples button/rim perimeters against the real SVG inner path at 234, 280, and 340px widths. Live Hermes rendering was also inspected.

## Latest settings and liked-state checks

Settings now uses only text choices and a text account link, with no on-screen buttons, icons, radio decorations, or scrolling. Native radio semantics remain keyboard-accessible; the physical gear and Escape close settings. Content and entry bounds are asserted at three widths, and the real host screen was inspected.

An automatic song-start test supplies already-liked and unliked responses for different track URIs without clicking the heart. It verifies filled colored versus outlined icons, `aria-pressed`, exact URI reads, and zero library writes. Pending reads show an ellipsis; disconnected status shows a question mark rather than pretending the track is unliked. Live authorization remains disconnected, so real-account liked values are not verified.

## Reproduced defects fixed

- The pane depended on a mounted footer for status polling. It now owns polling while mounted, with the footer taking over otherwise.
- Native play/pause returned an old snapshot immediately after dispatch. The controller now waits for the requested state and reports an error if Spotify never confirms it. UI buttons send explicit Play/Pause, not an ambiguous toggle.
- Search, playlist selection, and connection used separate modal flows. They now render inside the player display.
- Embedded `DialogTitle`/`DialogDescription` crashed in real Hermes without a dialog context. Embedded forms now use normal headings/descriptions; the demo adapter enforces that SDK boundary.
- A late Like response could strand a newly selected song in a checking state. Saved-state updates are now guarded by track identity.
- Failed volume/seek requests could leave an optimistic slider value. Failed commits restore the confirmed value and show an in-player error.
- Search/playlist failures no longer claim there are simply no results.
- Lyrics now distinguish loading, unavailable, instrumental, service error/retry, and no-track states; long lines wrap, current lines are exposed accessibly, and manual scrolling has an explicit follow/resume control.
- Art / XP / Lyrics controls now sit on the existing top chrome instead of consuming the display.
- Chrome hover, focus, pressed feedback, and the licensed metal-fx accent are default treatment, not an FX button. Motion remains gated by visibility, playback, and reduced-motion settings.

## Control checks

| Control | Expected behavior and checked state |
|---|---|
| Play / Pause | Explicit action; busy lock; confirmed native state; synchronized pane/footer label. **Real Hermes → real Spotify round trip passed.** |
| Previous / Next | Correct native action and new track metadata; browser-fixture checked, not live skip-tested. |
| Seek | Keyboard/pointer commit, zero boundary, disabled without duration. Real native route seek/read-back/restoration passed. |
| Volume | Keyboard/pointer commit, zero boundary, rollback/error behavior. Real native route volume/read-back/restoration passed within Spotify's one-point quantization. |
| Heart | Loading, liked/unliked, busy, disconnected, no-track, failure/retry, delayed response after track change. Real embedded connection form checked; writes tested with fixtures only. |
| Search / song result | In-screen query and result selection, exact selected URI dispatched, panel closes on success, service failure shown. OAuth live search remains unverified. |
| Add to playlist / playlist result | In-screen playlist selection, selected playlist action, success close, loading/error/empty distinction. Live write remains unverified. |
| Art / XP / Lyrics | Selected state, arrow-key navigation, settings interaction, persisted selection, placement outside display. |
| Screen on/off | Correct label and pressed state; visualizer unmounts and host pane height updates; saved mode survives reload. |
| Settings / close | Opens/closes inside display; selected state, Escape handling, skin radios and persistence checked. |
| Spotify connection / close | Embedded account form; real host no longer crashes. Consent and login were not automated. |
| Taste palette actions | Read taste, private-playlist creation, like/remove draft, prompt generation/selection/back controls exercised against explicit fixtures. No live account writes. |
| Retry lyrics / Follow current lyric | Error recovery, manual scrolling, resume-follow behavior, active-line state and wrapping checked. |

`evidence/ui-audit/control-inventory.json` records hover labels and state snapshots across screen panels. It contains repeated controls in different panels, not a count of distinct buttons. Hardware hover, keyboard focus, and held-pointer pressed styles are asserted against computed styles; text-button hover labels are checked in the rendered DOM. Browser tooltips use the demo SDK adapter, so this is not a claim that every native tooltip was individually hovered in Hermes.

## Executed verification

- `npm test` with the Hermes Python environment: **15 JavaScript tests and 25 Python tests passed**, plus installer/resource checks.
- `npm run test:browser`: existing browser regression suite passed, including its 27 width/height/zoom geometry combinations; **16 additional UI audits passed**.
- `npm run test:live-ui`: real installed Hermes UI → scoped plugin REST → osascript → real Spotify. Pause and Play both confirmed; embedded connection opened and closed. Playback state restored.
- `python scripts/native-smoke.py` with the Hermes Python environment: real native pause, seek, volume, and restoration checks passed.
- `git diff --check`: passed.

Browser data are explicitly simulated. Live playback verification is separate. Personal live screenshots remain local evidence and should not be published without review. No unrelated profile, Hermes core runtime, or account credentials were changed.

## EQ investigation

Spotify's installed macOS scripting dictionary exposes playback, volume, position, repeat, and shuffle, but **no equalizer control**. No supported direct EQ integration was established during this task. Web search was unavailable; a fetched generic Web API reference did not provide usable endpoint evidence, so it is not treated as proof of API capabilities. No pretend EQ sliders, private preference writes, or audio interception were added. Direct EQ remains unimplemented.

## Remaining acceptance gate

Connect the Spotify account using the player's connection form (Spotify developer client ID and browser authorization). Then live-test search → select song, read/modify Liked Songs, and an explicitly approved playlist addition with read-back. Until then, those paths are integration/fixture-tested, **not certified as live-account complete**.
