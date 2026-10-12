# Canonical Sprite Routing

There is one canonical path for each runtime role.

- **Module / bubble:** `js/onyx/onyx-core/` + `css/onyx/onyx-core/`
  - Ten coded chest-up mood sprites.
  - `https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_<mood>.png` is fallback-only.
- **Leisure / Feed Him MEOW:** `js/onyx/games/leisure/` + `css/onyx/games/leisure/`
  - Current Kitchen biped actors: Hungry, Judgmental, Purring.
  - Counter, Stove, and Plating do not render Onyx; Kitchen Table/Taste uses these three actors.
- **Virtual:** `js/onyx/games/virtual/` + `css/onyx/games/virtual/`
  - Current actor: the one full-body/bipedal Advising Professor.
  - No quadruped Professor file exists or may be generated.
  - Future edited non-Professor quadrupeds are exported here at one canonical `onyx_quadro_*` path per mood.
- **Game shared:** `js/onyx/onyx-core/` + `css/onyx/onyx-core/`
  - Infrastructure/factories only. This is not a third game and does not own mood sprite copies.

The Studio exporter overwrites its own generated `onyx_quadro_*` canonical paths inside the new ZIP and removes legacy `_edit2`, `_edit3`, etc. paths instead of accumulating duplicate versions.
