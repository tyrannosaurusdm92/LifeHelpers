**Historical guide:** The Visual/Audio/Feed placement controls described below were retired in the Journal & Diary Cards pass. These older instructions are retained only as a record of the prior build; see `JOURNAL-DIARY-INTEGRATION.md` for the current editor.

# Visual, News Feed and Audio page integration (October 31, 2026)

This update is based on the user-supplied `fill-in_pages.zip` and the prior OurSpace package, retaining `william.html` and `jasper.html` as the **only** personal page HTML files. No new visual/audio/feed HTML file, iframe, viewport, or Shadow DOM was added.

## Actual page sections
- **Visual**: original `15_Visual_Player` photo/video library controller, IndexedDB folders, playlists, external media links, uploads and gallery UI. Two independently movable/resizable major panels (library, viewing area) created by the existing renderer.
- **Audio**: original `02_Audio_Page` library controller, IndexedDB folders/playlists, uploaded audio and mini-player. Two independently movable/resizable major panels (library, player/library content) created by the existing renderer.
- **Feed**: original `12_News_Feed` markup, search/filter controls, feed stream, four independent news screens and feed notes. Seven independently movable/resizable modules, with original filter logic retained.

The original stylesheets are preserved at the declaration level but selectors are prefixed with their exact owning page root to prevent global `html`, `body`, `button`, and media style rules leaking into other pages. The source page controllers remain in `js/` (with only route guards). No extra floating source designer is instantiated: the existing Design Widget uses the **19 original design-part configurations** transformed into targets, selected by page in `js/page-fills-design.js`, `json/page-design-targets.json`, and the standalone `assets/code/design-widget.html`. A style chosen on `/william.html?page=visual` is stored separately from audio, feed or profile styles.

## William-only placement editor
On `william.html` in `#admin`, use the eight handles on each of the seven / two / two sections and the Move section control. The E/W handles change **only width**, the N/S handles change **only height**, and corners change both. All panels use normal wrapping flow. Widening one pushes a neighbor to the next row instead of overlapping it; narrower media/page widths reserve the entire right-side 170px messenger rail.

`Save all page fills & export page-fills.json` saves the current page settings in browser storage and exports all three pages' accumulated records. Keep using William's profile and visit/edit each of the three pages before exporting to populate all page records. The file contains each module ID, order, width, selected minimum height, actual measured dimensions, and neighboring IDs. Jasper sees the same pages without admin placement controls. The old Sidebar Messenger editor was physically removed; William's supplied saved rail placement is the new default.

## Feature on profile (local-first, no extra profile modules)
- On Visual, select an image/video from the existing library and feature it on the profile's existing `pictures` carousel.
- On Feed, select an item and feature it in the existing `news` module.
- On Audio, select a track and feature it in the existing retro record player's track feed. Remote URLs are playable through their original links; local audio is resolved from IndexedDB on the same browser when available.
- Existing data is deduplicated by source ID (`ourspaceFeatureKey`) and remains in the original profile module's storage key. Uploaded image blobs that are small enough may be converted to locally stored data URLs; otherwise an IndexedDB reference is saved.

**Cross-device visitor access is not guaranteed:** the supplied backend was not modified or verified for `profile.feature.save`, public media delivery, or published updates. Uploaded IndexedDB media generally stays on the uploading browser unless hosted or synchronized through a compatible backend. If the backend cannot save a featured item, the UI tells the user it is saved only on this browser. No local-only item should be described as publicly available elsewhere.

## Backgrounds and color
Light defaults are white backgrounds and black text with borders/accent colors. The unified dark control switches to black backgrounds and white text. The existing Design Widget's per-page targets can override default styling independently. The previous profile layout, record player, bulletin, links, profile picture and jump nav are retained without re-enabling their admin placement editors.

## Known test boundaries
Browser tests checked the actual full Audio and Visual engines using an in-memory IndexedDB stand-in because local HTTP navigation is blocked in the test environment; real IndexedDB/hosted-backend behavior must still be verified after hosting. News feed filters, seven section controls, media content creation, local featuring, width-only and height-only resizing, dark mode, and placement JSON export were also exercised. The file format and routing scripts were syntactically validated.
