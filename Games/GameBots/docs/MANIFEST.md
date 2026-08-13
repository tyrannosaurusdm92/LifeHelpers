# GameBots Manifest

## Package summary

- Package: `GameBots/`
- Version: 1.0.0
- HTML files inside GameBots: **0**
- Specific bot modules: **16**
- Universal bot modules: **10**
- Total bot modules: **26**
- Game-specific profiles: **13 games**
- Apps Script backend: **1** (`backend/LifeHelpers.gs`)

## Runtime

- `js/gamebots.js` — asynchronous plain-script bootstrap; loads the core and all 26 bot modules.
- `js/core/runtime.js` — registry, session lifecycle, iframe input driver, canvas-motion observer, optional structured game bridge, high-level strategy client, lightweight A*, utility helpers, and minimax helper.

## Specific bots

1. `js/bots/specific/bad-ice-cream-bot.js`
2. `js/bots/specific/bad-ice-cream-2-bot.js`
3. `js/bots/specific/bad-ice-cream-3-bot.js`
4. `js/bots/specific/house-of-hazards-bot-1.js`
5. `js/bots/specific/house-of-hazards-bot-2.js`
6. `js/bots/specific/rooftop-snipers-2-bot.js`
7. `js/bots/specific/stick-archers-battle-bot.js`
8. `js/bots/specific/tag-bot-1.js`
9. `js/bots/specific/tag-bot-2.js`
10. `js/bots/specific/tube-jumpers-bot-1.js`
11. `js/bots/specific/tube-jumpers-bot-2.js`
12. `js/bots/specific/stick-fighter-bot.js`
13. `js/bots/specific/poor-bunny-bot.js`
14. `js/bots/specific/temple-of-boom-bot.js`
15. `js/bots/specific/eight-ball-classic-bot.js`
16. `js/bots/specific/chess-bot.js`

## Universal bots

1. `js/bots/universal/universal-agile-navigator.js`
2. `js/bots/universal/universal-duelist.js`
3. `js/bots/universal/universal-projectile-sniper.js`
4. `js/bots/universal/universal-coop-partner.js`
5. `js/bots/universal/universal-hazard-runner.js`
6. `js/bots/universal/universal-physics-pilot.js`
7. `js/bots/universal/universal-turn-planner.js`
8. `js/bots/universal/universal-racer.js`
9. `js/bots/universal/universal-survivalist.js`
10. `js/bots/universal/universal-tactical-commander.js`

## Config

- `config/bots.json` — machine-readable 26-bot registry.
- `config/games.json` — 13 game profiles and required bot count per title.
- `config/backend.json` — GitHub-safe backend configuration keys with no private deployment values.
- `config/controls.json` — documented common control assumptions for the 13 specific game profiles.

## Backend

- `backend/LifeHelpers.gs` — GitHub-safe Apps Script strategy gateway. Private deployment values are supplied outside the repository.

## Documentation

- `docs/README.md`
- `docs/MANIFEST.md`
- `docs/AUDIT.md`
- `docs/LICENSE.md`
- `docs/THIRD_PARTY_SOURCES.md`
