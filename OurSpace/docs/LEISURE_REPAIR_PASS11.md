# Leisure repair pass 11

This pass reconciles the resent `Ingredient_Garden_50_Board_Prototype_Pass9`, the latest testing export, the supplied gameplay dossier, and the GitHub asset tree.

## Canonical player flow

The embedded leisure page remains the only game page and is loaded by `onyx.html`:

`Level Select → Recipe Generator → Recipe Brief → Market Madness → Ingredient Garden → Bon Appétit → Onyx Verdict`

The older supplied `meow.html` is retained only as a repair reference. Its legacy Pinball Fishing and counter/kitchen navigation are not reintroduced into the canonical runtime because the dossier retires those flows.

## Applied corrections

- Market Madness stays the Pudding Pop-style press/drag/release line-connect phase for fresh/raw ingredients. Long traces create specials.
- Ingredient Garden stays the Candy Crush-style adjacent swap/match-3 phase for pantry/liquid/dry ingredients, with cascades and the 50 canonical board layouts. Donor board metadata is merged into `json/board_layouts.json` without changing the runtime shape used by the phase engine.
- Bon Appétit keeps the dossier’s YUM/YUCK → cookware → stove heat/twirl (no flipping) → oven blow → flavor shoot sequence.
- The real GitHub `cooking_machine.svg` flipbook is now mounted as an `<object>` in the embedded Bon Appétit screen. Joystick rotations send the SVG’s `applySpin`, `setFrameRate`, `setJoystickRPM`, and play/pause messages. The tube is rendered directly below the joystick so it reads as its active drive connection.
- The GitHub level-select PNG and tileable SVG are applied to the embedded level-select background and the level-path coordinate reference.
- Restored shared Garden action, success/failure, and music audio are mapped in `js/onyx/games/leisure/core-audio.js`, including a looping Garden music channel and per-match/collection cues.
- The resent CSS files are preserved at `css/onyx/games/leisure/feed_him_meow.css` and `css/onyx/games/leisure/ingredient_garden.css` for the supplied shell/reference selectors; the compact canonical shell uses the scoped `css/onyx/games/leisure/meow.css` plus `css/onyx/games/leisure/meow-repair-pass11.css` so old Page 1/Pinball selectors cannot corrupt the current embedded game.

## Asset split

The testing package contains code, JSON, docs, and the Onyx SVG/atlas/contact-sheet assets only (plus the testing-only notification-border asset). The GitHub package contains assets only, including the restored leisure audio, background art, flipbooks, room videos, and the legacy Onyx visual copies. `meow.html` is not copied into the final tree; `onyx.html` remains the sole HTML entry point.
