# Onyx merged pass 9

## One-page shell

`onyx.html` is the only HTML file. It contains the widget and loads three fullscreen products through embedded source documents:

- Virtual Health
- Feed Him MEOW
- Work

Feed Him MEOW no longer has a separate `meow.html` file.

## Shared currency

The game, Virtual Health store, widget tools, and fullscreen Work share `ourspace.onyx.currency.v1`.

- 10 copper converts to 1 silver.
- 10 silver converts to 1 gold.
- 10 gold converts to 1 platinum.
- Copper, silver, and gold are normalized to 0–9.
- Platinum is unlimited.

Meaningful widget and Work actions award copper. Short action-specific cooldowns reject duplicate DOM events without imposing a total balance cap. Feed Him MEOW completion awards use idempotent run IDs.

## Store and room editor

The store is divided into Food, Treats, Beds, Bowls, Fountains, Toys, and Tablets. Every catalog item has a positive price and purchases debit the shared wallet. Room layout, resizing, recoloring, materials, and object arrangement remain free.

All 33 embedded-video tablets cost 666 platinum, 6 gold, 6 silver, and 6 copper (666,666 copper units).

## Animation

Quadruped and biped renderers preserve atlas timing for their key poses and use SVG source frames during the second half of frame segments. This provides drawn in-between motion for directions, locomotion, posture transitions, mood states, and Professor Onyx instead of holding one atlas cell across the full segment.

## Package split

- Testing contains `onyx.html`, all code and data, the full runtime asset tree, SVG Onyx frames, atlases, contact sheets, and documentation.
- GitHub assets contains assets only. Onyx source frames, atlases, and contact sheets are grouped below `https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/legacy`.
- The notification frame `assets/images/shared/frame-black.svg` remains testing-only.
