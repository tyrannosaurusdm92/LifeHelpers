# Feed Him MEOW fullscreen integration

Feed Him MEOW opens from the **Leisure** tab in the Onyx widget. The tab remains Onyx chat; its existing game button opens the game fullscreen. Both `assets/code/william.html` and `assets/code/jasper.html` retain the same fullscreen host iframe and personalized Onyx chat, while their shared runtime loads the same game.

The canonical fullscreen game document lives at `assets/code/meow.html`. `js/onyx/onyx-core/shared-shells.js` loads it into the existing fullscreen iframe only when the Leisure launcher is used. The document base resolves game assets from the OurSpace root. Both profile pages cache-bust the shared loader; there is no top-level game navigation entry or duplicated hidden game DOM.

The game runtime now replaces the previous leisure game runtime in `css/onyx/games/leisure/` and `js/onyx/games/leisure/`. The original Feed Him MEOW personality, visual shell, Onyx widget chat, keyboard/touch/gamepad support, and profile navigation remain owned by the existing Onyx systems.

## Run flow

1. Open Onyx, choose Leisure, and use **Feed Him MEOW** to enter fullscreen.
2. Level Select appears first. It routes to recipe generation when the player picks a level.
3. Hungry Onyx accepts the order and speaks the generated recipe. Market Madness and Ingredient Garden gather the fresh and pantry portions of that order.
4. Bon Appétit handles sorting, measuring, assembling, cookware routing, cooking, seasoning, serving, tasting, and the verdict. Hungry Onyx stays in the upper left behind the counter during play. The result uses the hungry, purring, or judgmental SVG flipbook as the single portrait.
5. Exit returns to the profile with Leisure chat available.

## Board and recipe data

`assets/json/bon_appetit/recipes.json` contains 5,001 recipe records. The 50 authored board definitions are board types; `meow-board-generator.js` creates new recipe-specific board instances and advances a persisted decimal sequence shared by Market and Garden. The documented distinct-opening space is finite but exceeds 2.5 quintillion board instances per recipe across all 50 types while storage is retained (at least `3^35`, about 50 quadrillion, openings on each individual type). The generator routes large orders through batches so each recipe ingredient reaches the kitchen ledger.

## Audio and visual assets

Garden swaps, matches, cascades, collection, and boosters each use their own supplied audio event. Bon Appétit action sounds live in `assets/audio/games/leisure/Bon-Appetit/`; purring and judgmental result cues use the existing result recordings in `Bon-Appetit_result/`. The three Onyx SVG flipbooks are in `assets/images/games/leisure/Bon-Appetit/`. The corresponding `Ingredient_Garden` and `Market_Madness` directories keep the OurSpace path casing.

## Verification

Automated checks passed against the fullscreen document: 500 generated openings with serial 501 after reload, all 5,001 recipe IDs, 50 Garden boards settling after valid swaps, eight complex board types in both puzzle engines, the 24-ingredient route through three Market and three Garden batches, and the Bon Appétit hungry/purring/judgmental portrait states. The external HTTP route loaded all 5,001 recipe records. These checks do not replace touch testing on physical phones.

See `Mobile-Gameplay-Review.md` for the Candy Crush, Pudding Pop/Pudding Splash, and cooking-station comparison; `Feed_Him_MEOW_QA_and_Limitations.md` and `Feed_Him_MEOW_Board_Generation.md` document the generator checks and limits of browser storage and finite board space.
