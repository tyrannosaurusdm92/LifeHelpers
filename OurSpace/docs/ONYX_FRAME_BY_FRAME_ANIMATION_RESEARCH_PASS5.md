# Onyx frame-by-frame animation research — pass 5

> **Pass 6 correction:** Pass 5 introduced five weighted idle phases in the profiles, but the embedded Health runtime selected only idle phase 0 while Onyx was stationary. Pass 6 connects all five authored phases to that runtime.

## What changed

- Added one paired JavaScript/CSS profile for each of the nine quadruped moods, one for the biped Professor, and one for the neutral base cat. Added the missing `quadruped_thoughtful` pair.
- Added a shared weighted-exposure clock. The virtual Health shell now loads the matching quadruped mood atlas instead of rendering the neutral meow atlas for every mood.
- The idle pose now animates while Onyx is still. Mood profiles use different timing for idle, walk, run, and action loops. `prefers-reduced-motion` holds a stable frame.
- The existing six-segment tail, paw contact/IK, head and face rig, and Professor contact-sheet actor remain in place. Professor clip timings now include longer readable holds at entry, sitting, listening, and preparation to stand.
- Movement selects one of eight direction sectors. The current atlas contains six authored facing views; due-north/south therefore use the nearest diagonal view and preserve the previous side to prevent view flicker.

## Frame and film study

The supplied full-body atlases are 30 columns by 22 rows, 64×64 cells, 660 frames per sheet. Their five phases per authored view support a compact flipbook. The mood-specific atlases differ in their opening idle/movement rows; later action rows are shared source art. The runtime now selects the corresponding mood atlas and assigns independent exposure timing to each mood. The biped Professor uses its dedicated 660-frame contact sheet.

Research applied: Disney Animation’s hand-drawn guidance emphasizes clear acting poses, timing, weight, and overlapping action. The UC Davis quadruped animation work separates gait from head aim, paw IK, and tail layers; Onyx’s existing rig already follows that layered model. The gait-pattern paper supports keeping footfall/body rhythm coherent. Anime production references describe key poses with time-sheet timing, including intentional holds; this pass uses uneven exposure weights rather than advancing all five frames at one speed. The numerical durations below are authored starting values for Onyx and are not copied timings from a film.

The requested films are reference anchors for broad animal-animation observation: *The Aristocats* for feline carriage, *Oliver & Company* for kitten energy and attention changes, and *Lady and the Tramp* for animal pose continuity and paw-led movement. This pass keeps Onyx’s supplied artwork and does not trace or reuse film frames.

## Behavior coverage

| Behavior | Form | Atlas | Idle loop | Walk loop | Run loop |
|---|---|---|---:|---:|---:|
| Caring | Quadruped | `onyx_caring_sprite_atlas.png` | 2,500 ms | 520 ms | 390 ms |
| Hungry | Quadruped | `onyx_hungry_sprite_atlas.png` | 1,650 ms | 440 ms | 340 ms |
| Judgmental | Quadruped | `onyx_judgmental_sprite_atlas.png` | 2,850 ms | 560 ms | 410 ms |
| Listening | Quadruped | `onyx_listening_sprite_atlas.png` | 2,350 ms | 500 ms | 370 ms |
| Purring | Quadruped | `onyx_purring_sprite_atlas.png` | 3,100 ms | 590 ms | 430 ms |
| Sleepy | Quadruped | `onyx_sleepy_sprite_atlas.png` | 3,900 ms | 690 ms | 520 ms |
| Snuggly | Quadruped | `onyx_snuggly_sprite_atlas.png` | 3,450 ms | 630 ms | 470 ms |
| Thinking | Quadruped | `onyx_thinking_sprite_atlas.png` | 3,000 ms | 560 ms | 420 ms |
| Thoughtful | Quadruped | `onyx_thoughtful_sprite_atlas.png` | 2,800 ms | 540 ms | 400 ms |
| Advising Professor | Biped | `onyx_professor_sprite_atlas.png` | Weighted pose holds | 150 ms/frame walk | See clip timings |
| Base cat | Quadruped | `onyx_meow_sprite_atlas.png` | 2,500 ms | 520 ms | 390 ms |

All timings and per-frame exposure weights live in `json/onyx-animation-research.json` and the matching profile files under `js/onyx/games/virtual/` / `css/onyx/games/virtual/`.

## Verification

- Confirm each of the 10 canonical behaviors and the base cat has exactly one matching profile pair and valid atlas path.
- Confirm the Health iframe preloads profiles before its inline quadruped runtime, and `drawSprite` selects the active behavior atlas with the base atlas as fallback.
- Confirm each 5-phase animation selects all five frames over its cycle, that idle advances without movement, and that reduced-motion mode holds phase 0.
- Confirm eight-direction movement sectors map deterministically to the six authored art views.
- Confirm Professor enter/exit, walk, seat-settle, listening, and stand-preparation clips keep their frame order and use the new exposure timing.
