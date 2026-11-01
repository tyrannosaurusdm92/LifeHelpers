**Update for Store editing pass:** The previous `#admin` Journal & Diary placement editor and its Save/export `bulletin.json` button have been retired. The user-supplied `bulletin (1).json` geometry is retained as read-only layout. The Journal and Diary tabs, scripts, and shared designer support remain. The section below documents the previous layout editor for historical reference only. See [STORE-INTEGRATION.md](STORE-INTEGRATION.md).

# OurSpace — Journal & Diary Cards native integration

## What was replaced

The previously unimplemented Journal and Diary destinations are now **one actual page, Journal & Diary Cards**, with two tabs. Their contents are embedded directly in the two existing HTML files:

- `assets/code/william.html?page=journal` and `?page=journal&tab=diary`.
- `assets/code/jasper.html?page=journal` and `?page=journal&tab=diary`.
- The old `?page=diary` URL redirects to `?page=journal&tab=diary`.

These are not blank placeholders, iframe documents, or a Shadow DOM. Each profile contains its own native full Journal and Diary Card markup. The original Journal functional code (notes, entry editor, searchable folders, checklists, settings, local storage fallback, etc.) and the original respective diary code (daily table, skill tracker, notes, save/export/print) are incorporated in their own account-specific runtime file. Each module's original CSS declaration blocks and responsive rules were retained, with the selectors namespaced to prevent collisions with unrelated OurSpace modules. A copy of each original component stylesheet is preserved in `docs/` for future comparisons. The quill asset is in `assets/images/journal-quill.webp`.

The original nested Journal and Diary design-widget elements were **not** included. The existing floating OurSpace Design Widget (the same one already in the profile HTML files) is the only designer. Its `js/page-fills-design.js` registry now exposes 76 explicit parts from the supplied source designers, targeting the Journal or Diary Card only, plus their own separate typography, inputs, navigation, and backgrounds. Target styles save in the existing account/page-specific Design Widget state; no generated styles are injected into other pages. The former visual/audio/feed *page placement* editor and part-specific design registry were retired, but the actual Visual, Audio, and Feed pages have not been deleted or replaced.

## Placement in `#admin`

Sign in using the existing app's `#admin` mode and open `william.html?page=journal`. Each tab has a real module frame. The frame contains its complete native module content. Use **✥ Drag Journal** or **✥ Drag Diary Card** to move the frame. Eight grips allow side-only height/width editing or corner width+height editing. The grips also support arrow-key adjustments (10 px per press; Shift+arrow 25 px). Each tab's width, height, horizontal offset, and vertical gap are stored separately.

This editor uses **document flow**: movement changes layout margin, not `position:absolute` or `transform`, so following content reflows instead of overlapping it. When the frame becomes narrower or shorter, its own content remains accessible via scrolling rather than losing entries. Both module behaviors remain active even when switched between tabs. The editor is unavailable on Jasper's page and outside William's `#admin` view.

Click **Save layout & export bulletin.json** to persist locally and download `bulletin.json` containing the actual dimensions and offsets of both tabs. Send that download with the package for the next layout pass. Its schema is `ourspace.journal-diary-placement.v1`, and it is separate from the old profile Pinboard's `json/bulletin.json`, which the integration has deliberately left untouched. **Do not overwrite the old profile `json/bulletin.json` with this layout file** when manually editing the ZIP; send the exported file separately instead. The subsequent update can install the layout into the appropriate new module schema without deleting the separate bulletin board.

The layout stored in this browser belongs to William's admin view. No backend or automatic synchronization across devices is claimed. Other profiles use their own unedited default placements unless a subsequent project update explicitly applies the exported geometry.

## Source and test boundaries

The integrated scripts, module markup and the merged Design Widget were exercised with a headless Chromium isolated-page test. Both journals initialized, populated their Today views, and the two diary cards rendered their original hundreds of editable inputs with no recorded JavaScript page errors. The William handles appeared, Jasper had no handles, and the top tabs switched. Resize/drag testing verified width-only, move-offset and corner width+height edits, and a browser test verified downloading a correctly structured file named `bulletin.json`. The original profile application and server authentication were not exercised against a live deployment; actual account-backed persistence still depends on the original OurSpace host, and the old public-profile guard remains in place. No live backend data was changed.

CSS and JS paths remain under `css/` and `js/`, and no extra standalone page HTML (including `bulletin_board.html`) or Windows batch file was added.
