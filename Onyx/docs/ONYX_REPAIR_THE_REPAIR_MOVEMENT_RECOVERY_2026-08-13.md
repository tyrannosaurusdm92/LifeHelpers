# Onyx Repair-the-Repair: Movement Recovery Pass

This pass uses the user-supplied `Onyx_Cat_Only_dossier_documented(5).zip` as a **movement donor** and the direct-open hotfix package as the current protected build.

## What was recovered

The older viewer used the embedded `Armature|Walk` clip as the locomotion foundation and advanced that mixer only while Onyx was moving. It also added only very small post-mixer spine/tail corrections and a simple pouch sway. This often preserved more of the source animation's original motion than the newer, heavier procedural gait overlay.

The default movement profile is therefore now **Recovered classic motion**.

Its travel values reproduce the older viewer's effective 60 Hz movement without restoring frame-rate-dependent behavior:

- older velocity formula: `delta * 25 / 2.2`
- older physics step: `delta * 2.5`
- normalized recovered walk speed: `(25 / 60 / 2.2) * 2.5` m/s
- recovered run speed: walk speed × 1.5
- older turn amount: `0.1` radians per frame
- normalized recovered turn speed: `0.1 * 60` radians/second

Recovered mode also keeps the Walk clip during Shift-run, matching the older donor instead of forcing the source `run` clip.

## What was deliberately *not* rolled back

The following newer work remains:

- direct-open startup race fix;
- physics-optional inspection fallback;
- current canonical FBX/BIN protection;
- body, face, eye-depth, chest, hindquarter and pouch morph layers;
- corrected materials and whiskers;
- full 360-degree inspection viewer and debug controls;
- dossier behavior/action/progression registries;
- backend contract fixes;
- phased feline jump: crouch → launch → ascent → apex/tuck → descent/reach → landing compression → recovery.

The rigid older SmellyCat-style vertical jump was **not** restored.

## Important motion stability repair

The newer viewer layered breathing, behavior poses, dossier action poses, and locomotion corrections by multiplying bone quaternions every frame. Even when the FBX mixer was not advancing, those additions could accumulate and gradually distort the skeleton.

The viewer now restores the previous frame's additive bone layer, evaluates the FBX mixer pose, captures that clean pose, and only then applies the current frame's procedural corrections. This keeps the motion nondestructive and prevents long-running pose drift.

## Comparison control

The viewer exposes a **Movement** selector:

- **Recovered classic motion** — default; older locomotion donor, restrained procedural gait, recovered pouch sway.
- **Enhanced living motion** — retains the newer faster walk/run clip switching and stronger procedural gait for comparison.

This is intentional so the next pass can be based on direct visual comparison rather than guessing which parts of each implementation feel most like Onyx.

## Donor preservation

The exact older `viewer.js` used for comparison is preserved at:

`development/movement_donor/Onyx_Cat_Only_dossier_documented_5_viewer.js`

It is not executed by the current viewer.
