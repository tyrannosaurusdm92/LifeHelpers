# Feed Him MEOW — Pass 4 flow/export report

This pass enforces the runtime flow as:

`Level Select → Recipe Generator → Recipe Brief → Market Madness → Ingredient Garden → Bon Appétit → Results → Level Select`

The recipe generator is now a visible, non-skippable gate for normal new runs. Market Madness refuses to start without recipe state.

Completed level results are persisted in local storage with both `lastStars` and `bestStars`. Level Select renders `bestStars` as the persistent level rating and retains the last run for history/debugging. Result continuation returns to Level Select so the newly earned stars are visible before another level begins.

The supplied Pass 24 UI Refresh was compared against the consolidated asset tree. Seventeen filenames absent from the current tree were found, but every one was byte-identical to an already-preserved canonical UI file. They are recorded in `json/pass24_ui_asset_aliases.json` rather than duplicated.

Two export forms are produced:

1. **GitHub Assets Only** — only `assets/`.
2. **Testing Full Code** — complete requested game tree including `assets/`.
