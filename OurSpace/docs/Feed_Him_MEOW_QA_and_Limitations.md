# QA and limitations — integrated package

## Automated checks

### Current repair pass

- A DOM runtime smoke test traversed Level Select → Hungry Onyx's order → Market Madness → Ingredient Garden → Bon Appétit and verified gathered ingredient IDs in the Bon sorting pool.
- Swaps settled without input locks on all 50 authored Garden boards; 41 also completed a second swap. A deliberately thrown resolver error released the lock and left cells interactive.
- An oven recipe mounted its preparation, oven, tasting and result views; both 5-star Purring and 2-star Judgmental states used one SVG portrait slot.
- An HTTP-loaded run read the 5,001 external recipe records and still displayed Level Select first when a checkpoint existed. Local file loading used the bundled data fallback.
- The Snack Tax booster awarded six hidden fragments in both Market and Garden, and a distinct phrase was emitted.
- A generator check produced 500 distinct tile openings for one recipe, used all 50 board types, and continued with number 501 after a simulated reload. It accepted each of the 5,001 recipe IDs. Complex types 5, 10, 12, 13, 17, 32, 47 and 50 mounted with a legal opening in both puzzle engines.
- A difficulty-six recipe with 24 required ingredients traversed three Market boards and three Garden boards; all required IDs entered Bon stock. The full catalog was checked to have fresh and pantry routes for every recipe.

These are scripted DOM and engine checks; they do not measure actual browser rendering or touch performance on a physical phone.

- Every shipped JavaScript file passes `node --check`. The ZIP integrity and required folder layout were also checked.

## Manual release checks

Before deployment, exercise a complete visible run on desktop and mobile: finish Market Madness, collect Garden goals, measure mixed units, route cookware, cook, assemble, serve, pause/resume, inspect the tasting scene and confirm the purring/judgmental swap at the 3-star boundary. Verify touch, keyboard, gamepad, reduced motion, mute and the optional microphone permission.

## Known limits

- The opening sequence is collision-free within the finite range described in `Feed_Him_MEOW_Board_Generation.md` while browser storage is retained. Clearing site data resets its history; simultaneous tabs do not reserve board numbers atomically.
- Browser audio requires a user gesture. The oven microphone is optional and never required.
- Household Duo is a local input mode, not network multiplayer.
- The package contains the supplied source notices and design adaptations; Windows builds, Unity binaries, Flash SWFs and other proprietary runtimes are not redistributed.
- `script/` is reserved for WASM and remains empty.
