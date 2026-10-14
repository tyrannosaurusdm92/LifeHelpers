# Pass 21 — Universal UI Resize + Garden Pacing + Standalone Minigames

- Added one shared 8-handle resize system (four edges + four corners) to game windows and menus. Window size and content scale are persisted per surface in localStorage. Resizing scales fonts, buttons, icons, and child UI; double-click a resize edge/corner to reset that surface.
- Ingredient Garden objective quotas and move/time budgets are multiplied by 1.35.
- Match-3 / swap Garden levels require at least 15 valid turns before success.
- Pudding-Pop-style trace/connect Garden levels require at least 45 valid turns before success. Timed trace levels receive a minimum time floor based on required turns.
- Level Select now chooses both player mode (Solo/Duo) and run type (Full Level / Pinball Only / Ingredient Garden Only) before starting.
- Full Level always routes through Pinball Fishing, even for recipes without fish; such recipes receive a deterministic bonus Pinball target so the minigame is actually played.
- Level progression is now 1–5 stars. One completed minigame yields enough progress to unlock the next level. Completing all three yields 3 stars, with 4–5 requiring full-run completion plus stronger Ingredient Garden performance. Therefore 5 stars can never be awarded unless Pinball Fishing, Ingredient Garden, and Bon Apatite are all completed in the same run.
- Garden's internal 1–3 performance stars are stored separately from the overall 1–5 level rating.

## Resize coverage
The same eight-direction resizer is attached to the top game menu, utility panels, master navigation menu, Onyx booster menu, Level Select HUD/map/dialog, recipe generator/card, Pinball shell, Ingredient Garden shell/relay/result, and Bon Apatite shell/HUD/editor/result. Hidden dialogs are re-primed when they become visible so stored sizes restore correctly. Static surfaces are promoted to positioned resize containers, while fixed/absolute windows keep their placement behavior. Resizing the top toolbar also updates the shared toolbar-height variable so the persistent status strip and page offsets stay aligned.

## QA
`docs/tools/qa_pass21.js` checks all 140 level numbers for the 15/45-turn contract, the 35% objective multiplier, timed-level turn floors, the standalone/full 1–5-star contract, and shared resizer surface coverage. The existing project validator and 420-board Garden ecology stress test are also run before packaging.
