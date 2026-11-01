> **Update 2026-10-31:** The admin Bulletin placement editor described below has been removed in the Links Module pass. The supplied `bulletin.json` is now the fixed packaged placement, applied by `js/bulletin_board_placement.js`. For the current editor and workflow see `docs/LINKS-MODULE-REPLACEMENT.md`.

# OurSpace Bulletin Board replacement — October 31, 2026

## Full replacement, not overlay

The old `profile-bulletins` post form, `bulletinsList`, old bulletin profile-data model and the old `data-collection="bulletins"` handler were removed. **In its place** is the complete visual Bulletin Board/scrapbook/pinboard from the supplied `03_Bulletin_Board.zip`, embedded as real HTML into `assets/code/william.html` and `assets/code/jasper.html`. There is no `bulletin_board.html` (or standalone entry), iframe, Shadow DOM or duplicated overlay widget. The source board library, searchable scrap entries, native add/edit dialogs, inspector, pinboard/list/grid/journal views, Post-it palettes, archive import/export, arrangement and view controls are present.

## Code and design integration

- `css/bulletin_board_style.css` retains the source stylesheet's rules, declarations and media sections, but scopes **every selector** to `#bulletinBoardModule`. Source `:root`, `html`, `body`, broad type selectors and mobile media rules cannot change the surrounding OurSpace profile.
- `js/bulletin_board_inline-script-01.js` through `-07.js` retain the source app model, runtime and interactions. Where necessary, source theme injection and iframe-ready signaling were scoped/removed because this is not a frame. The original bulletin theme control remains and now lives inside the scaled board toolbar.
- The source's local-first storage (IndexedDB, localStorage fallback) is now keyed by the owning profile: `william` vs `jasper`. This is not a claim that the existing authentication backend has been integrated with bulletin storage.
- The original standalone `bulletin_board_design_widget.js` is **not loaded**. All **ten original design part specifications** are instead represented in the existing profile Design Studio as `Bulletin Board · Parts` through `js/bulletin_board_design_specs.js`. The original permitted color/font/size fields and specific elements are preserved, with no independently floating board designer.
- Existing record-player hardware part design controls, previously deleted image/layout denylists, Drive links and other widgets are preserved.

## William-only placement editor

In the OurSpace portal, use `#admin` in **both login fields**, choose William, and open `william.html?page=profile`. Drag **↕ Move Bulletin** to reorder its profile section within the main column or move it into the sidebar. Keyboard arrows work while the Move button is focused. Grab any of eight edge/corner handles to resize the **entire bulletin interface**, including the board library, scraps, toolbar, texts, inspector and controls. The artwork is drawn in a 1180×790-pixel reference space and scaled proportionally as one unit; both rendered width and rendered height change together.

The enclosing section participates in normal profile-column flow, so shrinking or enlarging the section pushes sibling modules up or down. The inner art uses a transform only inside an exactly measured normal-flow wrapper; it is not an iframe, page-level viewport, Shadow DOM, or overlay. The board itself retains its original internal scrollable pinboard canvas (`#boardViewport`), which is part of the original component.

**Save & export bulletin.json** stores the current width, height, scale, column, sibling anchors, vertical gap, horizontal offset and measurement/viewport details locally, while downloading `bulletin.json`. Send it and this ZIP back to have your chosen geometry installed as the packaged default. Until then `json/bulletin.json` has null defaults for both profiles. Jasper's HTML has no bulletin move/resize buttons or handles.

## Final record player placement

Your supplied `record-player.json` has been installed at `json/record-player.json`, with William's chosen placement in the sidebar, between Profile Identity and Contact, at a preferred **327-pixel width** and **0.32959 proportional artwork scale** (actual width may be clamped by the available column). The music player continues to function and its 19 profile-design targets remain available. The record player's old #admin move/resize toolbar, eight handles and editor handlers have been **physically removed**.

## Limitations

The original bulletin is local-first. Different devices will not automatically share its boards without a confirmed backend data contract. Existing old basic bulletins are not silently imported into the new bulletin's storage because the user requested the old module's removal. Very small proportional sizes make every element, including text and buttons, proportionally smaller. Browser-native dialogs are left unscaled so they stay accessible when the bulletin is reduced. The native pinboard's internal zoom/fullscreen controls remain part of the original bulletin's functions.
