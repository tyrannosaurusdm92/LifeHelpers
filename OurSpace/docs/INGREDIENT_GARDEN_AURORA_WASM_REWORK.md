# Ingredient Garden — Aurora/WASM + SVG-only renderer pass

## What changed

Ingredient Garden no longer uses raster gameplay-effect sprites for the active board. The old `bursteffects_*` family and raster board-tile skins were retired. Visual feedback is now drawn by code:

- trace/connect ribbon and moving trace head
- match clear bursts
- special-piece bursts
- cascade feedback
- shuffle sweep
- invalid-action feedback
- blocker-hit feedback
- per-cell animated aurora color fields

The board still follows the project's existing Trace/Connect and Swap/Match-3 mechanics. This pass changes *how effects are rendered*, not the recipe authority or progression contract.

## Aurora donor adaptation

The uploaded AuroraSim project was used as a programming donor for color/motion math. `games/leisure/scripts/wasm/aurora_kernel.c` adapts:

- AuroraSim's red/green/blue emission-probability polynomial fits
- its RGB photon-density contribution ratios
- a magnetic-field-inspired directional/shearing field for flowing ribbons

The result is deliberately a lightweight visual kernel, not a scientific aurora simulation.

The kernel is compiled to `aurora_kernel.wasm`. `aurora_wasm_loader.js` loads the WASM and also contains an equivalent JavaScript fallback plus embedded WASM bytes so local `file://` builds remain usable.

## Input

Ingredient Garden supports pointer/touch plus keyboard navigation. WASD and arrow keys move the current board focus. Enter/Space selects or extends the current interaction. Existing Garden action keys remain available.

## SVG-only ingredient rule

`assets/images/games/leisure/shared/ingredients/` is the only canonical board-ingredient library. Every catalog entry routes to an SVG there. `ingredients_game.js` also refuses to render a board ingredient whose runtime asset path is not SVG.

Legacy `ingredient_*.webp/png/jpg/jpeg/gif` files and `bursteffects_*` image sprites are rejected by the project validator.

## Folder organization

```text
feed_him_MEOW/
├── meow.html
├── js/
├── css/
├── docs/
├── json/
├── assets/
└── games/
    ├── shared/
    └── leisure/
        ├── scripts/
        │   └── wasm/
        ├── audio/
        │   └── shared/
        │       ├── garden/
        │       └── kitchen/
        └── images/
            └── shared/
                ├── progression/
                ├── ingredients/
                ├── kitchen/
                │   └── images/
                └── garden/
                    └── images/
```

Additional fishing resources remain in the Leisure tree because Pinball Fishing is part of the same project.

## Important visual lock

The reorganization changes paths, not the intended appearance of Level Select (Page 1) or Bon Apatite (Page 5). Their existing art is reused from the reorganized locations.
