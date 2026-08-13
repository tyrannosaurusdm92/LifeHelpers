# LifeHelpers Arcade

LifeHelpers Arcade is designed to sit **directly inside the GitHub `games/` folder**. The archive must be extracted into that folder; it does not create another `games/` directory and it does not require a `LifeHelpers Game Loader/` wrapper.

Expected GitHub layout:

```text
games/
├── index.html
├── manifest.json
├── favicon.ico
├── favicon.svg
├── Both/
├── Desktop/
├── css/
├── js/
├── images/
└── docs/
```

- `Both/` contains games intended to work on desktop and mobile/touch devices.
- `Desktop/` contains desktop-focused games.
- The first letter of `Both` and `Desktop` must remain capitalized because GitHub paths are case-sensitive.
- `css/`, `js/`, `docs/`, `images/`, `Both/`, and `Desktop/` are siblings inside the GitHub `games/` folder.
- The arcade catalog is generated from `js/game-catalog.js`.

## Current catalog

- Supplied Both manifest: **82 games**
- Supplied Desktop manifest: **47 games**
- Games already bundled with the original loader and moved into `Both/`: **9 games**
- Loader catalog entries: **138**

The supplied manifest entries are intentionally present before all game files are populated. Once the matching HTML files are placed into the exact collection folder shown in the catalog, their existing cards will point to the correct location.

## Adding or replacing games

1. Put desktop + mobile games in `Both/`.
2. Put desktop-only games in `Desktop/`.
3. Keep the exact manifest filename, including spaces, capitalization, punctuation, and `.html`.
4. If adding a game not already represented in the catalog, add an object to `js/game-catalog.js` using the correct collection and relative path.
5. Loader paths must remain project-relative: `./Both/...` and `./Desktop/...`.
6. Do **not** prepend another `games/` segment from inside this project, because the project itself already lives in GitHub's `games/` folder.

## Documentation

- `README_BOTH.md`: complete 82-game Both manifest supplied with the project.
- `README_DESKTOP.md`: complete 47-game Desktop manifest supplied with the project.
- `MANIFEST.md`: project structure and loader catalog summary.
- `AUDIT.md`: revision audit and path/capitalization checks.
- `LICENSE.md`: loader license and third-party game licensing note.

## Empty Desktop folder on GitHub

`Desktop/.gitkeep` is intentional. Git does not track empty directories, so this placeholder keeps the capitalized `Desktop` folder present until the real desktop game files are added.
