> Historical Pass 23 notes. Superseded by the 2026-10-15 fullscreen integration documented in `Feed_Him_MEOW_Integration.md`; the game now opens only from the Onyx Leisure widget and does not use `assets/code/meow.html`.

# Pass 23: Remove fishing and kitchen, retain level select

- Kept level-select map, 45 paw nodes, account progression, modal stars, Solo/Duo, recipe generator, Ingredient Garden, Onyx Garden boosters, accessibility/settings/chat navigation.
- Removed Pinball Fishing page, level-select fishing-only option, all kitchen stages (counter, stove, plating, dining), kitchen editor and asset registries, fishing/kitchen scripts, CSS, config, images and audio.
- Garden progression awards 1/3/5 map stars for 1/2/3 Garden result stars; 1+ unlocks next account level. Prior earned stars stay intact.
- One HTML file: assets/code/meow.html. Root-level scripts, CSS, audio, visuals, JSON and WASM reorganized per requested layout. HTML uses a relative base element to keep nested hosting correct.
- Removed kitchen-owned shared global controls and replaced them with small independent toolbar script.
- Dataset still includes original recipes for garden ingredient collection; no kitchen gameplay is loaded.
