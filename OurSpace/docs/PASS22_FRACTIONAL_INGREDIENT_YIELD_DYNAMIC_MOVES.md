# Pass 22 — Fractional Ingredient Yield + Objective-Derived Garden Limits

## Requested gameplay change

Ingredient Garden no longer uses the Pass 21 fixed 15-turn (swap) / 45-turn (trace) completion gate. The extra play time is now explained by the ingredient collection itself: each cleared recipe-ingredient tile contributes only a fraction of one required Garden ingredient unit.

The level yield curve is continuous and hits these exact anchors:

| Level | Ingredient yield per cleared target tile |
|---:|---:|
| 1 | 92% |
| 10 | 89% |
| 25 | 86% |
| 50 | 82% |
| 90 | 75% |
| 140+ | 68% minimum |

Between anchors, yield is linearly interpolated. After Level 140 it never drops below 68%.

## Recipe requirement scaling

Pass 22 preserves Pass 21's +35% Ingredient Garden objective volume and then applies the requested +12% recipe requirement increase.

For each Garden-collectable recipe ingredient:

`gardenUnits = roundToHundredths(baseGardenUnits × 1.35 × 1.12)`

This changes the Ingredient Garden collection requirement. It does not rewrite the culinary measurement text used by Bon Apatite/Kitchen recipes.

## Fractional collection

When a recipe-target ingredient tile is cleared:

`credit = min(levelYieldRate, ingredientOutstanding)`

The objective's remaining amount and collected inventory are stored to hundredths. A Level 1 target tile normally contributes 0.92 units; a Level 140+ target tile contributes 0.68 units. A multi-tile match credits every cleared recipe-target tile independently.

The HUD now shows the current yield percentage and the objective-derived plan. Each objective also shows its decimal amount remaining and estimated number of matching target tiles still needed.

## Objective-derived move/time planning

The old fixed 15/45 minimum-turn rule has been removed from the active config, level generator, and Garden runtime. Winning occurs as soon as all ingredient objectives are complete.

The generator now derives the play allowance from the actual outstanding ingredient work:

1. Each objective calculates `ceil(outstanding / yieldRate)` required target tiles.
2. Those target-tile requirements are summed for the level.
3. The board mode converts that work into productive turns using expected target tiles per turn: swap 2.2, trace 4.0.
4. A difficulty-aware safety margin and a small ingredient-diversity allowance are added so the percentage mechanic does not make a generated board mathematically possible but practically unreasonable.
5. Move levels receive that planned move budget. Timed levels receive 18 seconds plus 5 seconds per planned move, with a 40-second minimum. The generator will not truncate a timed board below its objective-derived requirement.

This means a short early trace board can legitimately have fewer than the old 45 turns, while a recipe with much more required ingredient work receives substantially more room.

## Progression preserved

Pass 21's route and star rules remain unchanged:

- Full Level, Pinball Only, and Ingredient Garden Only remain selectable.
- 1 overall star is enough to unlock the next level.
- A standalone minigame clear can earn that progression star.
- 5 stars still requires Pinball + Ingredient Garden + Bon Apatite in one full run, with 3-star Garden performance.

## QA

Pass 22 QA checks:

- exact 92/89/86/82/75/68 percent anchor values;
- monotonic interpolation through Level 250 and a permanent 68% floor;
- all 5,001 live recipes;
- 45,509 generated Garden ingredient objectives for exact `1.35 × 1.12` requirement scaling;
- deterministic objective-derived limits across 200 generated levels;
- no active `minimumTurns`/15-turn/45-turn completion gate;
- 420 deterministic ecology board generations with every starting board playable;
- mud, quicksand, honey, bee, vines, flowers, thorns and existing level-program coverage;
- existing 1–5-star progression cases;
- complete project validator and JavaScript syntax validation.

Validation result: PASS.
