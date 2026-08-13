# LifeHelpers Arcade Revision Audit

## Requested changes completed

- Renamed page entry file to `index.html`.
- Extracted all CSS to `css/main.css`.
- Extracted all JavaScript and catalog data to `js/main.js`.
- Search controls moved above the loader/viewer.
- Added genre, vibe, and player-mode filters.
- Added Shooter, Cozy / Casual, and Multiplayer / Versus filtering.
- Removed the long grid of individual game cards/buttons.
- Added separate `Both` and `Desktop` game dropdowns, each with a Load button.
- Retained embedded, non-fullscreen viewer by default.
- Retained separate Fullscreen Desktop and Fullscreen Mobile modes.
- Added `GameBots/` placeholder folder for future multiplayer bots.
- Preserved exact `Both/` and `Desktop/` capitalization in loader paths.
- Did not bundle or modify any game HTML files.

## Catalog source

The selector catalog was compiled from `README_BOTH.md`, `README_DESKTOP.md`, and the nine additional Both loader entries documented in the supplied repository manifest.

## Classification note

Genre/vibe/player filters are loader metadata only; they do not alter the games. Multiplayer / versus tagging is intentionally conservative and should be refined later if a particular game build exposes different modes.

## GameBots addition

GameBots is populated with 26 bot modules. The GameBots subtree contains no HTML. The multiplayer count rule is 1 bot for 2-player games and 2 bots for the three 2–4-player games. See `GameBots/docs/AUDIT.md` for validation details.
