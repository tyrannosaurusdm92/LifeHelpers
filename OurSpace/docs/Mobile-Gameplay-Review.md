# Mobile gameplay review and changes in this pass

This cartridge is one campaign: Level Select → Hungry Onyx's order → Market Madness → Ingredient Garden → Bon Appétit → verdict. Bon Appétit has no second level map. Continuing a saved run is an explicit button on the first map.

| Reference pattern | Feed Him MEOW implementation |
| --- | --- |
| Candy Crush's adjacent swap, rejected nonmatches, falling refill and cascades | Garden generates a new board from one of 50 authored types for each recipe visit. A swap settles or returns to its original position; a cascade gets its own cue. The busy lock is released in `finally`, even when a resolver fails. Invalid swaps get a soft warning cue. |
| Pudding Pop's connected line of at least three matching pieces | Market keeps its connected path input. A resolved trace has a separate sound and retains the six-fragment ingredient ledger. |
| Cooking games' visible order ticket, separate preparation/cook/build stations and service judgment | Bon keeps the ticket visible during prep, carries one portion object through sorting, measuring, cookware, heat/oven, seasoning and assembly, freezes the served plate, then changes Onyx's single SVG mood after tasting. |

The 50 Garden masks now function as reusable board types. A recipe's persistent sequence selects and varies those types across both puzzles. The full 5,001-recipe catalog is available; large orders spread their fresh and pantry goals over several generated boards so touch targets and match odds stay manageable.

Primary public references: [King's match-three help](https://community.king.com/en/candy-crush-saga/discussion/497746/how-do-i-play), [CookApps' Pudding Splash listing](https://play.google.com/store/apps/details?id=com.cookappsplay.puddingsplash), and [Flipline's station overview](https://www.flipline.com/games/papascupcakeria/info.html). The CookApps listing currently describes Pudding Splash as connecting puddings in a line; this review uses only that connected-line mechanic, not its art or code.

## Exact freeze repair

`meow-garden-adapter.js` called an undefined `q` helper while a matched tile advanced the recipe counter. The exception interrupted `trySwap` after setting `busy=true`, leaving cells disabled. The helper is now defined; swap and booster work release the lock in `finally`. A board can also be left while its animation is pending without its old resolver changing the new screen.

## Audio and Onyx

The package's own Garden files now distinguish swap, invalid swap, match, cascade, collection and booster. Market tracing has a separate sample. Eight puzzle boosters each have a specific Onyx line in the feedback UI; Bon's Steady Paw and Second Helping have their own lines. Their effects are checked before a stock count is consumed. The kitchen reuses the existing order, oven, plate, purr and grumble cues.

I inspected the supplied archives. Dish Dash includes WAV files under its MIT project license; this package uses its `Pickup (1).wav`, `Chop (1).wav` and `Drop (1).wav` as Bon's pickup, measured prep and plated component cues. The original `docs/Dish-Dash-MIT-License.txt` remains alongside them. Burger Kitchen Simulator contains C# sound wiring but no sound assets in the provided ZIP. Restaurant Game Canvas JS contains sound assets, but its README credits those files to Zapsplat separately, so its files were not copied here. The Deep Fry and Little Chef Windows builds and the Flash SWFs remain references only.

## Release checks

Test a fresh load and a saved checkpoint, valid and invalid Garden swaps, a linked board, Market tracing, each booster target, partial Market/Garden inventory, a non-oven dish, an oven dish, pause/resume, both tasting outcomes, and the 130 × 130 Hungry SVG behind the kitchen counter. The package uses responsive CSS, but an actual device layout pass is still appropriate before publication.
