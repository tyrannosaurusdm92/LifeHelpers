# OurSpace record-player replacement — integration notes

## Source and removal

- Source: user-uploaded `01_Record_Player.zip`, including the exact turntable/transport/waveform HTML and three original audio-engine/metadata scripts.
- **Removed, not hidden:** the old `#recordDisplay` player, old `#profileAudio` audio tag, old `.record-vinyl` implementation and its `record-display` / `record-vinyl` / `record-info` CSS and JavaScript handlers.
- New real DOM markup is included directly inside **both** `assets/code/william.html` and `assets/code/jasper.html`. There is **no** `record_player.html`, iframe, Shadow DOM, canvas-as-site-viewport or second overlaid player.
- The replacement retains the functional audio engine, waveform canvas, turntable, metal tonearm and buttons. `js/record_player_inline-script-01.js` retains the supplied metadata logic. `-02.js` now compensates for the proportional CSS transform when sizing the waveform canvas; this keeps bars sharp and correctly stretched across the whole display at every size. In `-03.js`, only a path correction to the sample MP3 and a guard against starting on blank/public pages were added. `record_player_theme.js` scopes its light/dark toggle inside this record-player component rather than modifying the whole OurSpace page.
- The source MP3 is retained under `assets/audio/shared/record_player_create-in-defiance.mp3`, and its file bytes are unchanged.
- `css/record_player_style.css` contains the original CSS declaration bodies and keyframes, with rewritten selectors restricted to `#recordPlayerFlow` so that original global `html`, `body`, `:root` and button rules cannot overwrite other profiles/modules. A separate lightweight integration stylesheet `css/record_player_layout.css` handles the in-flow wrapper and proportional scaling without any editor handles. No original record-player hardware appearance is restyled into the old record player.
- A small Saved music links disclosure below the replacement preserves profile music entries and sends a music-sync event to the original player runtime without an iframe or a second playback engine.

## Designer migration

- The source's independent `record_player_design_widget.js` is deliberately **not loaded**: users use the existing page's designer.
- Its **19 original part specifications** are represented both in `json/record-player-parts.json` and `js/record_player_design_specs.js` and automatically registered in the profile's target picker with `Record Player · Parts` grouping.
- The profile designer's Style tab handles exact original part controls: cabinet wood, platter rim, vinyl grooves, label, tonearm, needle, knob, artist/title/time typography, five playback buttons, whole transport, and three waveform color channels. Colors have wheels and hex codes; fonts and sizes apply only to parts that support them.
- The source's material gradients and waveform CSS variables are reconstructed by the original algorithm; profile-wide design presets cannot override record-player internal geometry or hardware unless a part is specifically edited.
- Part-specific settings are saved in the existing per-profile/per-page design state (`recordParts`), so Undo, Redo, import/export and account design synchronization continue to use the existing designer.

## Record player position finalized, editor removed

The user-supplied `record-player.json` is now installed at `json/record-player.json`, and William's approved placement is applied automatically: sidebar, after `profile-identity` and before `profile-contact`; saved preferred width **327 px**, proportional reference width **980 px**, and requested scale **0.32959** (constrained by available viewport width when needed). Jasper's saved record-player placement remains null; his player continues at its ordinary default.

The record player's admin toolbar, all eight resize handles, size/move/export/reset event handlers, and admin-only CSS were **removed**, not hidden. `js/record_player_layout.js` now performs only stable saved placement and proportional display scaling; there is no record-player move/resize editor. The music player itself and its 19 design targets are preserved. The previous editor state is not read back from browser storage, so it cannot override the approved JSON.

The only profile placement editor in this pass is for the newly integrated Bulletin Board, and is offered only on `william.html` in `#admin` preview. See `docs/BULLETIN-BOARD-INTEGRATION.md`.
