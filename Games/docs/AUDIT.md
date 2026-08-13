# LifeHelpers Arcade Revision Audit

## Corrected deployment structure

- [x] Treats GitHub `games/` as the **parent destination folder**, not as a folder inside the arcade project.
- [x] Removed the extra internal `games/` wrapper.
- [x] Removed the archive-level `LifeHelpers Game Loader/` wrapper from the deliverable ZIP.
- [x] Places `Both/` and `Desktop/` directly beside `css/`, `js/`, `docs/`, `images/`, and `index.html`.
- [x] Preserves exact capitalized folder names `Both` and `Desktop`.
- [x] Moved all games previously bundled with the loader into root-level `Both/`.
- [x] Added `Desktop/.gitkeep` so the empty Desktop folder survives the initial Git commit.
- [x] Preserved the supplied full Both and Desktop README manifests in `docs/`.

## Loader path corrections

- [x] Catalog entries now use `./Both/...` and `./Desktop/...`.
- [x] No catalog entry uses `./games/Both/...` or `./games/Desktop/...`.
- [x] PWA `start_url` and `scope` remain project-relative.
- [x] Main CSS, JavaScript, image, favicon, and manifest links remain project-relative from `index.html`.
- [x] Rainbow Bottles references were corrected back to one-level-up paths (`../`) after flattening `Both/` beside the loader assets.

## Loader functionality retained

- [x] Catalog contains **138 entries**.
- [x] Includes the supplied **82-game Both manifest**.
- [x] Includes the supplied **47-game Desktop manifest**.
- [x] Includes the **9 games bundled with the loader**.
- [x] Retains All / Both / Desktop filters.
- [x] Retains title/filename search.
- [x] Retains runtime game-card generation from `js/game-catalog.js`.
- [x] Keeps direct local-file use possible without fetching a JSON catalog.

## Licensing note

The original loader included an MIT license. Individual third-party games can carry separate upstream licensing or attribution requirements; the loader license does not automatically relicense game content.
