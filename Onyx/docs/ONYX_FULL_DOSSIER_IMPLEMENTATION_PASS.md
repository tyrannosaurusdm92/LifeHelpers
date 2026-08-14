# Onyx full dossier implementation pass — cat-only foundation

This pass implements the attached instruction file and expanded dossier as far as they apply to the canonical cat-only foundation. It does **not** invent a finished apartment or claim that object anchors exist before the room exists.

## Canonical protection

- Original runtime FBX/BIN remain byte-identical to `development/canonical_original/`.
- Body edits are sparse runtime deltas / Blender shape-key equivalents.
- Vertex order, UVs, skinning and skeleton are not rewritten.
- Source >4-weight influence warnings remain documented; the original FBX is not round-tripped through a lossy converter.

## Onyx body specification now represented

- large, long, broad-shouldered domestic-cat frame;
- lower rear carriage instead of the source SmellyCat rump-up stance;
- smoother scapular/serratus/pectoral transition into chest and neck;
- substantial gravity-biased primordial pouch with walk/run secondary motion and settling;
- domestic-cat face taper, muzzle projection, nose/chin definition;
- forward/compressed eye-depth correction so the eyeballs no longer retain a huge rear hemisphere inside the skull;
- green-yellow eyes with tracking/blink layer;
- mostly white curved/asymmetric whiskers with micro-motion;
- true black coat retained through color-management/material response rather than turning the cat gray.

## Living motion

- Walk and Run use the source animation clips but cross-fade and receive additive feline motion.
- Shoulder/scapular glide, spinal flexion, hip transfer, head stabilization, tail counterbalance and pouch dynamics are layered over gait.
- Jump is phased: crouch → launch → ascent → apex/tuck → descent/reach → landing compression → recovery. The original SmellyCat straight rigid-body launch is not the Onyx behavior.
- Idle includes breathing, ears, tail tip, head attention, whisker motion, eye tracking and blinks.

## Dossier behavior graph

The exact needs-free behavior graph is loaded from `runtime/spec/onyx_behavior_graph_needs_free.json`. All authored states and events are exposed for preview. Timers are short non-decaying state durations only; there are no motive meters.

Core traits are permanent: `grumpy`, `snuggly`, `loving`, `intelligent`. Dossier idle weights modulate only transitions already allowed by the graph, so personality cannot bypass context gates.

`hungry_expression` and `sleepy_expression` remain **expression-only labels**, never stored hunger/energy.

Professor is the only upright exception and remains cat-sized/unclothed. The preview creates only a simple clipboard, as specified.

## Complete dossier animation-family registry

Every item in `onyx_animation_features.json` is registered in the viewer's **Dossier action** selector. Categories that can be performed without room geometry receive direct procedural/clip preview layers. Object-dependent families expose Onyx's body-performance preview now and remain ready for host-provided interaction anchors later.

This includes core locomotion/posture, rest/affection, voice/expression/support, and object/room interaction families. The 20 supplied dossier pose references plus the contact sheet are selectable inside the viewer.

## Needs-free progression projections

`runtime/onyx-progression-runtime.js` implements the dossier's future-facing state contracts without constructing the room:

- permanent core traits;
- learned-trait evidence with emerging/established/signature stages;
- evidence never decays;
- sensitive medical/journal/crisis categories are rejected from automatic trait evidence;
- optional fictional career shifts with no streaks, firing, demotion, injury or lost wages for inactivity;
- promotions are explicit/user-controlled;
- currency follows 10 copper = 1 silver, 10 silver = 1 gold, 10 gold = 1 platinum;
- design tier 0 foundation abilities are never gated;
- design abilities only accumulate;
- spaces only unlock permanently and starter room can never be removed.

The API is exposed at `window.ONYX_PROGRESSION_RUNTIME` for the future OurSpace room/game host.

## Host API

`window.ONYX_CAT_ONLY_API` exposes viewer health, behavior events, dossier actions, camera mode/preset selection, animation mode, backend check, reset and progression runtime. This is the bridge point for the later room/virtual-pet shell rather than duplicating logic.
