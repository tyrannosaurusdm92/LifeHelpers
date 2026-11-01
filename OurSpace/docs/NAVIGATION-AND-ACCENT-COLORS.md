# Page navigation and accent colors

- Single shared, original blue hieroglyph Jump Nav bubble appears on all implemented profile routes, with page-specific links and drag/collapse. It defaults next to the messenger rail at vertical center; local browser location is saved by profile + page. Profile menu and existing eight resize handles are retained.
- Red, gold, black, and white master NAV is 68×68px collapsed (original jump is 52×52px); gold inner links and red hover. It defaults to the top left and remains draggable.
- The original existing Design Widget controller persists on every page, now with the supplied quill artwork in bubble and header; no extra designer is created. Defaults in the upper-right content region, left of messenger rail, and can be dragged/collapsed.
- Profile starts 10vw from the left and extends to the reserved sidebar gap.
- The 75-color Green, Purple, Gold, Silver, and Copper palette is in `json/ourspace-accent-palette.json`. Bulletin notes offer these shades. Journals, music and visual folders, plus pinned communication messages can each save an accent by item in the browser.
- The Journal headline static quill is removed. No full theme palette or messenger chat transport is modified.
- Browser-backed accent preferences are local and do not claim cross-device synchronization. Existing backend behavior is unchanged.
