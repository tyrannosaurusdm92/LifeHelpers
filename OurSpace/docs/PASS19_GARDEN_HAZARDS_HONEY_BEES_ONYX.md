# Feed Him MEOW — Pass 19 Garden Hazards, Honey, Bees, and Onyx Booster Delivery

## Goal

Pass 19 expands Ingredient Garden from the Pass 18 vine/flower/thorn ecology into a modular turn-based garden hazard system without replacing the existing deterministic board generator, relay board, objective-aware refill logic, accessibility controls, or Onyx idle-snack behavior.

The implementation is original project code. Public repositories and web documentation were used as architecture/algorithm references; source code was not copied verbatim.

## Coding research used

### Modular Match-3 blockers and data-driven levels

- Jungle Gems / `bydecom/match-3-game-engine-jungle-gems`
  - https://github.com/bydecom/match-3-game-engine-jungle-gems
  - Useful ideas: blockers as distinct gameplay objects with health/hit rules, board responsibilities split into focused modules, JSON-driven level definitions, and dedicated VFX managers.
  - Applied here: every ecology obstacle remains a `{type, layer}` blocker with type-specific behavior rather than hard-coding an entirely separate board for every hazard.

### Match-3 invariants and deadlock prevention

- `egnaro9/match3-engine`
  - https://github.com/egnaro9/match3-engine
  - Useful ideas: blockers explicitly affect run/move legality, gravity/refill preserve rules, generated boards are checked for valid moves, and invariants are testable independently of rendering.
  - Applied here: new spreading/moving ecology hazards use the existing legal-play checks. Bee relocation rolls back if the move would make the current board illegal; the constrained auto-shuffle remains a safety fallback.

### Local-neighbor simulation for plant/ecology spread

- `chirs/cellular_automata`
  - https://github.com/chirs/cellular_automata
  - Useful idea: a cell changes from local neighborhood state rather than needing a global scripted animation path.
  - Applied here: vines, mud, and mobile bees operate on orthogonal-neighbor candidates, making ecology behavior reproducible, cheap, and easy to constrain around objectives.

### Flocking / swarm cues for bees

- `gstarch/boids`
  - https://github.com/gstarch/boids
  - Useful ideas: local alignment/cohesion/separation produce convincing swarm motion without choreographing every agent.
  - Applied here: gameplay bees remain discrete board blockers for deterministic match-3 rules, while their coded visual effect uses a small orbiting swarm so they read as living hazards rather than static icons.

### Browser animation and Canvas rendering

- MDN Canvas basic animations
  - https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations
- MDN `requestAnimationFrame`
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- MDN Canvas optimization
  - https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
  - Applied here: transient hazard/booster FX stay in the existing requestAnimationFrame-driven Garden canvas, while durable state is represented by DOM/CSS blocker overlays. This keeps game state independent of VFX and retains reduced-motion support.

## New hazard rules

### Mud

Mud is a soft underlay with one or more layers. A matched ingredient on the mud damages the mud and is still collected normally. Adjacent clears may also soften mud. Every fifth consumed turn, existing mud may ooze to an eligible orthogonal neighbor if there is room under the global hazard cap.

### Quicksand

Quicksand is a wet underlay. It does not pin the ingredient, but on its hazard clock it can sink an unattended/non-objective ingredient and replace it with a legal filler ingredient. It prioritizes non-objectives so it creates pressure without deliberately erasing the player's required recipe progress.

### Honey

Honey is a layered pinned overlay. The ingredient below it cannot be moved, but honey is deliberately *not* match-blocking: the trapped ingredient can be the stationary member of a run formed by matching ingredients outside the honey.

When that run resolves, the honey loses one layer and the trapped ingredient remains in place. Only after the final honey layer cracks is the ingredient free. Ordinary adjacent matches do not crack honey; the run must actually include the trapped ingredient, or a specific booster must target the honey.

This gives honey a distinct rule from flower petals, vines, and thorns rather than reskinning an existing blocker.

### Bees

Bees are mobile pinned overlays. They prevent their current ingredient from moving but can be dispersed by a qualifying clear or Bee Smoker. On the bee hazard clock, a limited number of bees move to legal orthogonal cells, preferring neighborhoods containing flowers or honey. Each move is checked against board playability and rolled back if it would strand the board.

The board logic stays discrete/deterministic; the visual effect uses small swarm agents to make the hazard read as bees.

## New Onyx boosters

### Sunbeam

Onyx changes to the configured caring mood, travels to the affected Garden area, and triggers a coded sunlight burst. Vines and infection are removed outright; mud and quicksand lose a layer. The booster is preserved if no relevant target exists.

### Weed Spray

This is a targeted Onyx booster. The user selects a Garden cell, then Onyx changes to the configured judgmental mood and travels to that patch. A Manhattan-radius ecology patch is evaluated; vines/infection are removed and thorns/mud are damaged. The code-rendered effect uses directional spray droplets.

### Bee Smoker

Onyx changes to the configured thoughtful mood and travels to bee/honey targets. Bee overlays are dispersed and honey loses a layer. A coded smoke-ring effect accompanies the action.

## Onyx booster delivery behavior

All Garden Onyx boosters now share a target-travel path:

1. Booster request is accepted only if the current Garden state can use it.
2. Onyx's static image changes to the booster-specific mood.
3. The floating Onyx bubble travels toward either the selected target cells or the board center for board-wide effects.
4. The bubble receives a booster-specific impact treatment.
5. The actual board action resolves at the target.
6. Booster inventory is consumed only after a successful use.
7. Onyx returns to the saved floating position and transitions back to the post-action mood.

The existing idle timeout behavior remains separate: if the user takes too long, Onyx still travels to a safe non-objective filler ingredient and "eats" it without spending a move.

## Board safety / fairness invariants

- Seeded generation remains deterministic for identical level/run seeds.
- New blockers obey the global blocker cap.
- Objective ingredients are deprioritized for destructive/sinking ecology actions.
- Honey must be matched through its trapped ingredient (or targeted by Bee Smoker); adjacent clears alone do not crack it.
- Bee relocation is local and reversible if the destination would destroy legal play.
- The existing constrained shuffle remains free when no legal move remains.
- New visual effects do not determine game state; game state resolves first-class through the blocker map and board engine.
- Reduced-motion mode disables the new repeating blocker/Onyx CSS animations while preserving mechanics.

## Files changed in Pass 19

- `games/leisure/scripts/ingredients_game.js`
- `games/leisure/scripts/ingredient_garden_level_randomizer.js`
- `games/leisure/scripts/garden_aurora_effects.js`
- `js/feed_him_meow.js`
- `css/games/leisure/ingredient_garden.css`
- `json/games/leisure/ingredient_garden_randomizer_config.json`
- `json/games/leisure/ingredient_garden_boosters.json`
- `json/games/leisure/ingredient_garden_manifest.json`
- `json/games/leisure/gameplay_integration_manifest.json`
- `games/leisure/scripts/leisure_json_bridge.js`
- `docs/tools/validate_project.py`
- `docs/tools/qa_garden_pass19.js`
- `docs/PASS19_GARDEN_HAZARDS_HONEY_BEES_ONYX.md`

## QA performed

- JavaScript syntax checks for the edited Garden runtime, randomizer, Aurora FX, Onyx UI, and JSON bridge.
- Full project validator, including the 5,000 core recipes, six difficulty bands, 230 canonical SVG ingredients, 1,575 registered Leisure images, and WASM kernel checks.
- 420 deterministic level generations (levels 1–140 × three run seeds) with an Expert recipe: all reported `startsPlayable=true` and identical output when regenerated with the same inputs.
- The randomized batch exercised all new programs (`muddy_patch`, `honey_hive`, `quicksand_bog`) and all new hazard types (`mud`, `quicksand`, `honey`, `bee`).
