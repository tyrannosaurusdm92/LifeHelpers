# QA checklist — Pass 4 recipe-generator / level-star / split-export pass

## Authoritative run flow
- [x] Level selection opens an explicit Recipe Generator screen.
- [x] Recipe Generator produces and locks the active recipe before Market Madness.
- [x] `startMarket()` guards against null recipe state and routes back to Recipe Generator instead of allowing a bypass.
- [x] Recipe brief is shown after generation and before Market Madness.
- [x] Flow remains Market Madness → Ingredient Garden → full Bon Appétit → Onyx/results.
- [x] Replay begins at Recipe Generator for the current level.
- [x] Continue Run restores an already-generated/checkpointed recipe run rather than creating a new mid-run recipe.

## Level stars / progression loop
- [x] Full-level star rating is calculated on the result screen.
- [x] `lastStars` is stored for the most recent completion.
- [x] `bestStars` is stored persistently for the level-select rating.
- [x] Level cards render 0–5 filled/empty stars from persistent save data.
- [x] Level cards are refreshed immediately when a result is saved.
- [x] Result → Continue returns to Level Select focused on the next level.
- [x] Result → Level Select returns focused on the completed level.
- [x] Level Select shows completed-level and total-star summary counts.

## Pass 24 UI preservation / deduplication
- [x] Compared current Ingredient_Garden assets against Pass 24 UI Refresh assets.
- [x] 17 Pass 24-only filenames were identified.
- [x] All 17 were byte-identical to art already present under canonical filenames.
- [x] Duplicate payloads were not copied into the final asset tree.
- [x] `json/pass24_ui_asset_aliases.json` records every old Pass 24 filename → canonical filename mapping.
- [x] Exact duplicate file-hash groups in `assets/`: 0.

## Ingredient / flipbook regression
- [x] Canonical ingredient records: 230.
- [x] Unique canonical ingredient IDs: 230.
- [x] Missing canonical ingredient asset references: 0.
- [x] Multi-image SVG flipbook/contact sheets remaining: 0.
- [x] Individual flipbook SVG frame manifest remains present.

## Static validation
- [x] All active custom JavaScript passes `node --check`.
- [x] All JSON files parse.
- [x] `meow.html` remains the only HTML file in Testing.
- [x] Testing package contains `meow.html`, `css/`, `js/`, `json/`, `docs/`, `script/wasm/`, and `assets/`.
- [x] GitHub package contains only the `assets/` tree.
- [x] GitHub `assets/` tree is byte-for-byte equivalent to Testing `assets/` tree.
