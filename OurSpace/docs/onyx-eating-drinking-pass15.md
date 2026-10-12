Onyx Movement Pass 15 | Eating / drinking sizing and playback

12 user-supplied SVGs normalized into identical 640x640 transparent viewBoxes, mapping to an existing 64x64 game sprite.
The opaque Onyx silhouette is 51 logical px wide and his grounded paw baseline is at y=61 across all twelve frames.
Head/tail poses retain their natural proportions; no per-frame canvas scaling or shifting is needed.

Actions:
  OnyxBaseMotion.eat({direction:'right',durationMs:2400})
  OnyxBaseMotion.drink({direction:'left',durationMs:2400})
  OnyxBaseMotion.perform('onyx-base-eat_drink',{mode:'eat',direction:'left',durationMs:2800})

Standalone: load onyx-base-runtime.js before other modules; load onyx-base-eat_drink.js for the visual player. Put frames/ adjacent to JS.
Integrated OurSpace: files are in js/games/virtual/; frame SVGs are in assets/images/games/virtual/atlases/.
The existing Onyx engine remains the position/movement authority; frame player only takes over the 64x64 canvas for explicitly triggered feeding actions.
Left and right are independent artwork, not horizontal mirrors. When loading is slow, previous sprite remains visible until the SVG is ready.
SVGs contain an embedded normalized transparent PNG, as did the source assets. They are not traced vector paths.
Use the included contact sheet and normalization_report.json to compare sizes and body/paw baseline.
Existing activity control panels and art for non-feeding animations are not replaced.
