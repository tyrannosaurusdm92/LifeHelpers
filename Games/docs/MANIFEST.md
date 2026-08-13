# LifeHelpers Arcade Project Manifest

## Runtime files

| Path | Purpose |
|---|---|
| `index.html` | Arcade shell, game filters, player modal |
| `css/main.css` | Original arcade styling plus catalog/player additions |
| `js/main.js` | Dynamic search, filter, rendering, accessibility, game player |
| `js/game-catalog.js` | 138 game catalog entries |
| `manifest.json` | PWA/browser manifest; not the documentation manifest |
| `favicon.ico`, `favicon.svg` | Existing arcade icons |
| `images/` | Existing visual assets |

## Game folders

| Folder | Catalog entries | Files present at revision time | Intended use |
|---|---:|---:|---|
| `both/` | 91 | 9 launch entries | Desktop + mobile/touch games |
| `desktop/` | 47 | 0 game files (`.gitkeep` only) | Desktop-first games |
| **Total** | **138** | **9** | Complete arcade catalog |

## Bundled games moved into `both/`

- `both/3d-rainbow-bottles.html` — Rainbow Bottles
- `both/03-Chess-Game/index.html` — Chess Game (Bundled)
- `both/05-Solitaire-Game/index.html` — Solitaire Game (Bundled)
- `both/06-Sudoku-Game/index.html` — Sudoku Game (Bundled)
- `both/11-Wordle-Game/index.html` — Wordle Game (Bundled)
- `both/12-Hangman-Game/index.html` — Hangman Game (Bundled)
- `both/14-Archery-Game/index.html` — Archery Game (Bundled)
- `both/15-Tic-Tac-Toe/index.html` — Tic-Tac-Toe (Bundled)
- `both/19-Ping-Pong-Game/index.html` — Ping Pong Game (Bundled)

## Documentation files

- `docs/README.md` — project usage and structure.
- `docs/README_both.md` — complete `both/` manifest, including moved bundled entries plus the 82 supplied standalone manifest entries.
- `docs/README_desktop.md` — complete 47-game desktop manifest.
- `docs/LICENSE` — source loader license and game-license note.
- `docs/AUDIT.md` — revision audit.
- `docs/MANIFEST.md` — this file.

## Catalog path rules

- Both-compatible standalone game: `./both/<exact manifest filename>`
- Desktop-only standalone game: `./desktop/<exact manifest filename>`
- Bundled multi-file game: `./both/<game folder>/index.html`

Filenames with spaces and original capitalization are preserved in the catalog exactly as supplied by the manifests.
