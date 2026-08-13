# LifeHelpers Arcade

This package is a replacement shell for the existing GitHub `games/` folder. It intentionally does **not** bundle the HTML games themselves. Keep the existing game files in `Both/` and `Desktop/`.

## Required placement

```text
games/
├── index.html
├── css/
│   └── main.css
├── js/
│   └── main.js
├── docs/
├── Desktop/
├── Both/
├── images/
└── GameBots/
```

## Loader behavior

- Search and filters are above the game viewer.
- `Both` and `Desktop` each use one dropdown plus one Load button.
- Filters include genre, vibe, and player mode, including **Shooter**, **Cozy / Casual**, and **Multiplayer / Versus**.
- The viewer stays embedded until **Fullscreen Desktop** or **Fullscreen Mobile** is chosen.
- Mobile fullscreen uses a centered portrait-width game viewport.
- The loader catalog contains **138 entries**: **91 Both** and **47 Desktop**.
- Game paths are project-relative and keep the exact capitalized `Both/` and `Desktop/` directory names.
- `GameBots/` contains the arcade bot runtime.

## Updating the catalog

All loader JavaScript, including the catalog, lives in `js/main.js`, per the requested single-JavaScript-file structure. Add future games to the `GAMES` array near the top of that file.

`docs/README_BOTH.md` and `docs/README_DESKTOP.md` preserve the source manifests used for this build.


## GameBots

`GameBots/` includes the bot runtime and the GitHub-safe `backend/LifeHelpers.gs`. The arcade is connected to its public Apps Script web-app endpoint; private AI-Brain library details stay server-side.
