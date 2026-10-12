# OurSpace Pass 35 — research and movement-timing stability

This is a non-destructive enhancement committed as **individual JavaScript and Markdown files**. The original OurSpace HTML, profiles, game logic, imagery, state handling, and tested Apps Script backend remain unchanged.

## Research-to-code decisions

- **Godot 2D sprite animation** (https://docs.godotengine.org/en/4.5/tutorials/2d/2d_sprite_animation.html): discrete full-body frames can come from individual images or a spritesheet; do not fabricate additional original art.
- **Phaser animation system** (https://docs.phaser.io/phaser/concepts/animations): one atlas may serve idle, walk, run and distinct named clips. Pass 35 models separately named timings and phases.
- **Disney's The Aristocats**, Walt Disney Family Museum (https://www.waltdisney.org/education/workshops/sold-out-person-studio-series-animate-cat-adult-session): model deliberate timing, poses and anticipation, *not* proprietary artwork.
- **Oliver & Company**, D23 (https://d23.com/a-to-z/oliver-company-film/): observational feline/canine acting reference, *not* copied frames.
- **Neko Atsume 2**, Hit-Point (https://www.nekoatsume.com/sp2/index_en.html): feeding, toys and deliberate player-driven pet interaction are relevant to Feed Him Meow.
- **The Sims 4 build mode**, EA (https://www.ea.com/games/the-sims/the-sims-4/faq/cheats): furniture placement and collision boundaries are relevant to Happy Home.
- **Bluesky moderation guide** (https://github.com/bluesky-social/bsky-docs/blob/main/docs/advanced-guides/moderation.md): user control and separation of private/public interactions help maintain the two-person OurSpace boundary. No social backend was changed.

## New source

`js/onyx/games/virtual/onyx-animation-controller.js` provides an **opt-in** phase clock, with variable weighted exposures, measured-travel gait timing, six original view families stable under eight-direction movement, pausing, reduced-motion support, and per-mood durations. It does *not* replace the existing Onyx renderer: existing game systems may adopt it incrementally.

`docs/PASS35_ANIMATION_TEST.js` provides eight local Node regression checks. Run `node docs/PASS35_ANIMATION_TEST.js` from `OurSpace/`.

## Preservation and limitations

The current game remains in control of scene geometry, inventory, UI and persistence. The source research does not support claiming any new frames have been drawn. True north/south sprites, full browser QA, and visual integration of the new optional controller remain unverified. No asset or backend files are touched.
