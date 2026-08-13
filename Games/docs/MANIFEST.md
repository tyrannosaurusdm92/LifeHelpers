# LifeHelpers Arcade Manifest

## Deployment location

The contents of this package belong **inside the existing GitHub `games/` folder**. `games/` is the parent destination, not an internal project subfolder.

## Project structure

```text
games/
├── index.html
├── manifest.json
├── favicon.ico
├── favicon.svg
├── Both/
│   └── [desktop + mobile games]
├── Desktop/
│   ├── .gitkeep
│   └── [desktop-focused games]
├── css/
│   └── main.css
├── js/
│   ├── game-catalog.js
│   └── main.js
├── images/
│   └── ...
└── docs/
    ├── README.md
    ├── README_BOTH.md
    ├── README_DESKTOP.md
    ├── LICENSE.md
    ├── AUDIT.md
    └── MANIFEST.md
```

## Catalog totals

- Both source manifest: **82**
- Desktop source manifest: **47**
- Prebundled loader games moved to `Both/`: **9**
- Total loader catalog entries: **138**

## Prebundled games now in `Both/`

- **Chess Game** — `Both/03-Chess-Game/index.html`
- **Solitaire Game** — `Both/05-Solitaire-Game/index.html`
- **Sudoku Game** — `Both/06-Sudoku-Game/index.html`
- **Wordle Game** — `Both/11-Wordle-Game/index.html`
- **Hangman Game** — `Both/12-Hangman-Game/index.html`
- **Archery Game** — `Both/14-Archery-Game/index.html`
- **Tic-Tac-Toe** — `Both/15-Tic-Tac-Toe/index.html`
- **Ping Pong Game** — `Both/19-Ping-Pong-Game/index.html`
- **Rainbow Bottles** — `Both/3d-rainbow-bottles.html`

## Source manifests

The complete expected HTML filenames are preserved in:

- `docs/README_BOTH.md`
- `docs/README_DESKTOP.md`

Those source manifests are also compiled into `js/game-catalog.js`, so the UI does not need to parse Markdown at runtime.
