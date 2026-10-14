# Feed Him MEOW — Ingredient Garden Pass 18

## Purpose

Pass 18 turns Ingredient Garden from a mostly rectangular ingredient matcher into a seeded objective-puzzle garden while preserving the active recipe as the authority for ingredients. The design borrows mechanic families from the supplied Candy Crush / Pudding Pop research and the supplied structural `candycrush.html` reference, but uses Feed Him MEOW's own ingredient art, Garden vocabulary, Onyx behavior, and code-rendered Aurora effects.

## Seeded board topologies

The level randomizer can choose these reproducible main-board masks:

- `classic` — full garden bed.
- `diamond` — clipped corners and tapered rows.
- `split_garden` — separated beds with a controlled central break.
- `ring_bed` — playable perimeter with a hollow center.
- `terraces` — stepped planting rows.
- `flower_cross` — cross-shaped high-connectivity planting bed.
- `twin_islands` — separated planting islands with constrained routes.

Inactive cells are true holes. They do not match, trace, accept blockers, or act as gravity destinations.

## Level programs

A level also receives one seeded program that changes its ecological emphasis:

- `calm_beds`
- `petal_release`
- `vine_watch`
- `thorn_maze`
- `cascade_orchard`
- `relay_greenhouse`
- `mixed_ecology`

Programs affect hazard weights, starting specials, and whether a satellite garden is strongly preferred/forced. Replaying the same level/seed reproduces the baseline program and topology.

## Garden ecology hazards

### Creeping vines

Vines lock the ingredient underneath. On their configured creep cycle they attempt to spread to one orthogonally adjacent eligible ingredient. Damaging a vine suppresses that creep cycle. Spread candidates prefer non-objective filler and are rejected if the resulting state would make the board unplayable.

### Flower plots

Flowers cover a real ingredient with 2–4 petal layers. The hidden ingredient remains present but cannot be moved or collected through the flower. Clearing next to the flower or hitting it with an eligible special strips petals. At zero petals the ingredient underneath is released.

### Thorns

Thorns are layered ingredient locks. Repeated adjacent pressure/special hits cut layers until the ingredient can move again.

### Legacy infection

The older spreading infection remains available only as a rarer late-level ecology. Its spread is still solvability checked.

## Linked multi-board levels

Eligible levels can create one smaller relay garden next to the main garden:

- Pollinator Plot — 4×4
- Herb Patch — 4×5
- Greenhouse Bench — 5×5

The relay garden begins with at least one actionable 3+ cluster. Main-board cascades build relay charge. Clearing a 3+ connected cluster on the relay consumes charge and maps that ingredient back to the main board:

1. Matching visible ingredients on the main board are cleared to create a free cascade, or
2. If no matching ingredient is available, the relay attacks flower/vine/thorn layers.

The relay action never spends the player's ordinary Garden move. It is a linked board system, not a second unrelated level.

## Cascades and specials

Some seeded programs begin with row, column, or area specials. Cascades continue to resolve before new input. Larger cascades charge the satellite board when one exists. Special effects interact with hazard layers before protected ingredients can be collected.

## Timers and urgency

Move and timed levels remain data-driven. Timed levels gain a coded urgency pulse/tick near expiration; accessibility settings may still exclude timed levels. Vines also expose their next-creep countdown in the Garden HUD.

## Sound integration

Existing Garden audio is reused semantically instead of adding unrelated media:

- vine creep / thorn impact → negative Garden feedback
- petal strip → correct-match cue
- flower release → ingredient-acquired cue
- relay activation → combo-clear cue
- Onyx snack → piece-plop cue
- ordinary cascade → combo cue
- final objective / win / fail continue to use their dedicated Garden stings

Rapid sounds remain throttled through the existing audio system.

## Onyx Garden Command Center

On Page 4 the floating Onyx booster panel expands into a Garden command center. It reports:

- outstanding recipe units
- current hazard counts
- relay charge
- idle time

Garden-specific helpers now include:

- Imperial Shears — cuts vine/thorn layers or flower petals.
- Pollinator Paw — charges the relay and strips flower petals.
- Snack Attack — safely eats/refills non-objective filler ingredients.
- Cascade Cat — primes a recipe-aware main-board cascade.

The existing Paw Hammer, Scent Sweep, Void Shuffle, Nine Lives, and Imperial Swap remain.

Boosters that have no valid target are preserved rather than consumed.

## Idle Onyx behavior

If the player pauses long enough, Onyx first warns through the Garden booster speech/status system. After the longer idle threshold and cooldown, he can physically move his floating bubble toward one safe, unlocked, non-objective filler ingredient and eat it. That cell refills and may cause a cascade. The snack does not spend a move and never deliberately eats an outstanding recipe objective.

## Rendering

Ingredients remain SVG-only. Vines, thorns, petals, relay pulses, trace ribbons, cascades, shuffle bands, timer urgency, and Onyx snack effects are code-rendered with the Aurora/WASM system; no legacy `bursteffects_*` sprites are used.
