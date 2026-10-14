Feed Him MEOW — Ingredient Garden / Level Select edition
=================================================
Entry: assets/code/meow.html (the only HTML file).
Because the page is nested two folders deep, it contains <base href="../../">.
Serve or deploy the entire directory; links are scoped to the project root.

Screens:
- Level Select (45 paws per map page; account progression and Solo/Duo)
- Recipe Generator
- Ingredient Garden

Removed: Pinball Fishing; kitchen counter, stove, plating and dining, associated code, audio and images.

Code: js/onyx/games/leisure, shared account progress: js/ourspace-core
Styles: css/onyx/games/leisure
WASM binary: script/aurora_kernel.wasm (loader JS is in js/)
Original garden and recipe JSON source data: assets/code/data/

Level Select art/sfx: assets/images/games/leisure/level_select and assets/audio/games/leisure/level_select
Garden art/sfx: assets/images/games/leisure/Ingredient_Garden and assets/audio/games/leisure/Ingredient_Garden
Onyx legacy static portraits: assets/images/shared/legacy-static

Existing account progress keys and five-star map were retained. Garden performance now determines up to five map stars and unlocks following levels.
