# Feed Him MEOW — Pass 3 cross-platform game-shell notes

## Reference used

User-directed reference: `tyrannosaurusdm92/LifeHelpers/Games/Both` on GitHub.

The folder's `README_BOTH.md` describes 82 unique standalone offline HTML games curated for desktop + mobile/touch use. This pass used that collection as a **delivery and interaction reference**, not as an asset source and not as permission to copy third-party proprietary game code.

Lightweight examples inspected included `3d-rainbow-bottles.html`, `Connect the Pipes.html`, `trapthecat.html`, and `spacebarclicker.html`. Useful recurring patterns included a fixed application play surface, touch-safe game areas, responsive HUD/status controls, direct game actions, sound toggles, and game-like result overlays.

## Feed Him MEOW application

Pass 3 applies those ideas to Feed Him MEOW's own design:

- fixed full-viewport game shell;
- persistent recipe-run HUD;
- phase rail for Market Madness → Ingredient Garden → Bon Appétit;
- safe-area-aware layout;
- touch/mouse/keyboard/controller paths;
- optional fullscreen;
- real pause state that freezes Bon Appétit simulation;
- auto-pause when the document becomes hidden during active play;
- modal Recipe, Booster, Pause, and Accessibility overlays;
- controller-aware focus navigation on level/result/modal controls;
- phase-start checkpoint/Continue Run behavior;
- no normal browser links used as the primary run navigation.

## Controller mapping

- D-pad / left stick: board/menu navigation, or Bon Appétit rotation.
- Right stick: Bon Appétit flavor aim.
- A: primary action / activate focused game control.
- B: back/cancel/pause according to context.
- X: recipe/inspect layer.
- Y: Onyx Boosters.
- Start: pause.

The game remains fully usable without a controller.

## Reuse boundary

No Games/Both art, branded content, music, or third-party game bundle was copied into Feed Him MEOW during this pass. The reference set informed shell/input behavior only.
