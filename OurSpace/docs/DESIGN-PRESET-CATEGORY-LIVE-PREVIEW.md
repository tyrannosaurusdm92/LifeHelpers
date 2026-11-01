# OurSpace Design Widget — Category Browsing and Live Keep/Undo (October 31, 2026)

This pass modifies the supplied **OurSpace_MySpace_100_Preset_Upgrade(1).zip** in place as a new deliverable. No login, profile, backend, or unrelated module was replaced.

## Browse categories instead of 100 previews at once

The 100 existing archive-linked presets remain in the embedded catalog, but the gallery initially shows only six choices and **zero thumbnail images** until a category is chosen:

1. Aesthetics & Styles (19)
2. Colors & Color Preferences (27)
3. Themes & General Interests (39)
4. Music (5)
5. Movies & Television (3)
6. Video Games (7)

Each item belongs to exactly one category. These are practical **visual-inspiration groupings** based on the archival title and appearance, not assertions that a preset is officially associated with any film, band, artist, show or game. The original archive category, title, image URL and source link are preserved. The six categories are authored in the user's requested order.

Only **eight thumbnails** render on a gallery page, with Previous / Next paging. Searches apply within the currently selected category; changing categories clears search results. Thumbnails use lazy loading, low fetch priority and asynchronous decoding. Background images are not loaded as hidden CSS backgrounds for every gallery card. The selected layout's detailed image remains available on demand.

## Real profile preview before save

Clicking a layout card (or Preview on profile) immediately styles the **actual visible page behind the designer**, including its profile modules, rather than just a small simulated comparison. Its prior saved state is captured before any trial.

A prominent Keep / Undo bar remains visible while previewing. **View profile** temporarily hides the designer so the member can inspect more of the page without losing the buttons. Reopening the bubble returns to the designer and pending trial. The red X and Escape discard an unconfirmed trial. Switching designer tabs is blocked until Keep or Undo is explicitly chosen. Selecting another preset within the gallery replaces only the temporary preview, without replacing the saved baseline.

- **Keep** saves the new design to the current profile/page storage key, adds one undo-history entry and triggers the same existing optional account-sync event as any committed design change.
- **Undo** restores the pre-preview design and does not write the trial to browser storage or trigger account synchronization.
- Without Keep, refreshing or leaving the page never commits the trial.
- Original six saved personal looks, text/color/scrollbar tools, target discovery, export/import, per-page style-copy controls and the older historical 100 entries remain available.

## Files changed

- `js/design-widget.js`: category metadata/UI, paging, preview state machine and Keep/Undo controls.
- `css/design-widget.css`: category chooser and fixed confirmation bar.
- `assets/code/william.html` and `assets/code/jasper.html`: visible Keep/Undo bar for both profile documents.
- `assets/code/design-widget.html`: same gallery and confirmation behavior in the independent standalone editor.
- `service-worker.js`: static-shell version bumped so browsers can obtain the new UI assets.

No new HTML file or extra nested folder was introduced. All other files from the incoming ZIP are retained.

## Test coverage

Chromium checks completed at 1440px, 1024px and 390px on the two profile pages and on the standalone designer. Confirmed no thumbnails before category selection, maximum eight cards after selection, on-page CSS changes on preview, no storage write before Keep, complete CSS restoration with Undo, persistence only on Keep, and automatic preview cancellation from the red X. Checks did not contact the user's backend, fetch all archived image sources, or prove external image availability.

## October 31 removal update

Six selected layout presets were removed from the archive, reducing the active gallery from 100 to 94. See `json/deleted.json` for the permanent tombstones.
