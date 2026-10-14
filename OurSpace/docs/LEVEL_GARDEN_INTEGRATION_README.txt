FEED HIM MEOW — NATIVE LEVEL SELECT / INGREDIENT GARDEN INTEGRATION

Pages
1. Level Select — native DOM replacement, no iframe.
2. Recipe Generator — existing native page.
3. Fishing — existing Fishing runtime retained.
4. Ingredient Garden — native DOM replacement, no iframe.
5. Kitchen — existing blank page retained.

Run progression
Level paw -> Solo/Duo popup -> Recipe Generator ->
- recipe without salmon/shrimp: Ingredient Garden
- recipe with salmon/shrimp: Fishing -> Ingredient Garden
Ingredient Garden completion -> Kitchen.

Fishing handoff
Caught salmon/shrimp are passed into the Garden randomizer as fishInventory and reduce the corresponding Garden objectives. A Fishing attempt that ends with a shortfall is marked partial/poor and the existing Ingredient Garden randomizer applies exactly one 1.05 fishing difficulty multiplier.

Folder organization
css/games/leisure/ingredient_garden.css
games/leisure/scripts/level_select.js
games/leisure/scripts/game_progression.js
games/leisure/scripts/ingredient_garden_*.js
json/games/leisure/ingredient_garden_*.json
assets/images/games/leisure/shared/*
assets/audio/games/leisure/garden/*

Onyx boosters
The shared Onyx bubble remains outside page sections. On Level Select, selecting a booster pre-arms it for the selected run and carries it through Generator/Fishing until Garden unless it is consumed earlier in Fishing. In Ingredient Garden the shared five Onyx boosters map to active board effects: Paw Hammer, Scent Bomb, Void Shuffle, Nine Lives, and Imperial Swap.
