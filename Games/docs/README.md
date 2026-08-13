# LifeHelpers Arcade

LifeHelpers Arcade is a browser-based loader for two local game collections:

- `both/` — desktop + mobile/touch compatible games.
- `desktop/` — desktop-first games.

The original arcade design is retained, but the old hardcoded one-game list has been replaced with a complete catalog generated from the supplied desktop and both manifests. The nine games that were already inside the arcade were moved intact from `games/` into `both/`.

## Current catalog

- `both/`: 91 launch entries when fully populated: 9 bundled games already present + 82 standalone games from `README_both.md`.
- `desktop/`: 47 standalone games listed in `README_desktop.md`; the folder is intentionally ready for those files to be added.
- Total catalog: 138 launch entries.

## Using the arcade

Open `index.html`. The catalog can be searched and filtered by **All**, **Desktop + Mobile**, or **Desktop**. Selecting **Play** loads the game inside the arcade player. **Open separately** opens the same file directly in a new tab.

For the most predictable behavior, especially when games use browser APIs, serve the folder through a simple local/static web server. The catalog itself is stored as JavaScript rather than fetched JSON so browsing still works when `index.html` is opened directly from disk.

## Filling the folders

Place files using the exact filenames shown in:

- [`README_both.md`](README_both.md)
- [`README_desktop.md`](README_desktop.md)

Do not put those games back into a generic `games/` folder. The runtime paths are `./both/<filename>` and `./desktop/<filename>`. The nine bundled games already in `both/` include both single-file and multi-file game folders; keep the multi-file folders intact.

## Project structure

```text
LifeHelpers Game Loader/
├── index.html
├── manifest.json                 # Functional PWA web app manifest
├── favicon.ico
├── favicon.svg
├── both/                         # Desktop + mobile games
├── desktop/                      # Desktop-only games
├── css/
│   └── main.css
├── js/
│   ├── game-catalog.js           # Runtime catalog generated from manifests
│   └── main.js                   # Search/filter/player logic
├── images/
└── docs/
    ├── README.md
    ├── README_both.md
    ├── README_desktop.md
    ├── LICENSE
    ├── AUDIT.md
    └── MANIFEST.md
```

## Documentation

`MANIFEST.md` inventories the project. `AUDIT.md` records the changes made in this revision. `LICENSE` preserves the license that shipped with the source loader and notes that game-specific licensing must still be respected.
