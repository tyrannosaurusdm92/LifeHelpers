# OurSpace UX Layout / Zoom / Header Repair

This pass fixes default module placement and sizing without changing the retro/MySpace theme styling.

## Main repairs

- Replaced the previous rough-color Onyx/Messenger layout styling with layout-only defaults.
- Set desktop boards to pleasant two-column arrangements with consistent gutters.
- Kept the requested Onyx/Messenger structure: profile + links above Messenger on the left; DBT prompt, Onyx auto-face/status, and Onyx chat on the right.
- Rebuilt the module size dropdown so 25%, 50%, 75%, and 100% act like zoom levels for the module contents, not just the outer box.
- Kept modules movable, collapsible, resettable, and carousel-capable.
- Added the requested William/Dino and Jasper/Squishy marquee headers to their correct pages.
- Added the provided Onyx lore header text/markup only to the Onyx page; the uploaded header sizing CSS was not copied.
- Bumped the service-worker cache version so GitHub Pages will pull the repaired layout after refresh.

## Files changed

- `dino-nerdzone.html`
- `squishy-cottage.html`
- `css/ourspace-module-workshop.css`
- `js/ourspace-module-workshop.js`
- `service-worker.js`

## Testing performed

See `UX_LAYOUT_ZOOM_HEADERS_REPAIR_TEST_RESULTS.json`. The dropdown zooms the module interior by design, so very small sizes are compact previews rather than full-size touch layouts.
