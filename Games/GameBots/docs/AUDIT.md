# GameBots Audit

## Requested scope

- [x] Folder is named `GameBots`.
- [x] No HTML exists inside `GameBots/`.
- [x] 26 total bot modules.
- [x] 16 game-specific bot modules.
- [x] 10 reusable multi-game bot modules.
- [x] 2-player games receive 1 bot.
- [x] 2–4-player games receive 2 bots.
- [x] House of Hazards has 2 specific bots.
- [x] Tag has 2 specific bots.
- [x] Tube Jumpers has 2 specific bots.
- [x] README/license/audit/manifest material is under `GameBots/docs/`.
- [x] `LifeHelpers.gs` is inside `GameBots/backend/`.
- [x] Public backend/config expose only the browser-facing web-app endpoint; private AI-Brain endpoint/library Script ID/version remain server-side.
- [x] AI-Brain use is limited to strategy/gameplay routing.
- [x] No creation/general-chat action is exposed by LifeHelpers.gs.
- [x] Fast gameplay loops continue locally if backend is absent or slow.
- [x] Arcade loader exposes Bot 1, Bot 2 when appropriate, and Bots Off.

## Static validation performed

- Every `.js` file passed `node --check`.
- `LifeHelpers.gs` passed JavaScript syntax validation by piping it through Node's parser.
- Every JSON file parsed successfully.
- Bot registry reports 26 entries, split 16 specific / 10 universal.
- Game profile bot totals sum to 16.
- A filesystem scan found zero `.html` files beneath `GameBots/`.
- Documentation-name scan found README/MANIFEST/AUDIT/LICENSE files only under a `docs/` directory.

## Architecture audit

### Local control layer

The runtime runs an approximately 80 ms tick for enabled bots. It injects keyboard/pointer events into the same-origin game iframe, samples lightweight canvas motion where readable, and accepts structured game-state hooks when a game exposes them.

### Strategy layer

The strategy client is rate-limited and optional. It does not sit in the frame-by-frame path. This avoids Apps Script/network latency breaking movement and jumping.

### Backend restriction

LifeHelpers.gs accepts only `strategy`, `gameplay`, and `health`. It creates a structured `gameplay_strategy_only` request. It intentionally does not forward a free-form prompt field and does not define content-creation endpoints.

## Compatibility note

The uploaded arcade replacement contains `.gitkeep` placeholders rather than the actual game HTML files. Static integration and bot counts could therefore be validated here, but exact runtime control mappings could not be executed against those game binaries in this package. The framework includes canvas/DOM fallback observation and optional structured bridges specifically so individual GitHub game builds can be tuned without changing the overall architecture.
