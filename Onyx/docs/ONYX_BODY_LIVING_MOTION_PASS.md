# Onyx Body Shape + Living Motion Pass

## Scope

This pass continues directly from the dossier-canonical correction package. It stays cat-only: no finished room, virtual-pet autonomy, psychiatric/mental-health behavior system, or backend behavior connection is added.

The protected FBX/BIN remain untouched. All visible body work is layered over the canonical geometry and rig.

## SmellyCat lineage comparison

The GitHub `defnetuncer98/smellycat` master tree publishes:

- `src/three/examples/models/fbx/cat.fbx`
- `src/three/examples/models/fbx/cat.bin`

A Git-blob SHA audit proves the protected Onyx copies are byte-identical to those published SmellyCat files. See:

- `development/audits/smellycat_lineage_audit.json`

That establishes SmellyCat as the literal geometry/rig base rather than only a visual reference.

No additional SmellyCat code or assets were copied into this pass. The public repository does not provide a clearly identified root license in the inspected tree, so it is used as provenance/reference only.


## Dossier visual references used directly

The attached dossier was re-opened for this pass rather than relying only on prose measurements. The authoritative local reference set retained in `development/reference/dossier_pose_refs/` includes the front view, front three-quarter, left profile, rear view and full animation contact sheet.

Those images reinforce the specific targets used here:

- a broad chest without a hard shelf at the neck
- a long, fairly level torso
- substantial but not elevated hindquarters
- a lower, gravity-readable abdominal line
- clearly visible forward-facing green-yellow eyes
- a domestic-cat muzzle rather than a lion/dog/game-mascot face
- heavy-but-agile quadruped locomotion

The viewer can display these local dossier images from the **Dossier proportion references** control while `B` toggles the corrected model against the exact SmellyCat/canonical base.

## Body-shape corrections

`viewer.js` now exposes five independently named topology-preserving delta layers:

1. `primaryAnatomy`
2. `hindquarterCarriage`
3. `chestFlow`
4. `primordialPouch`
5. `faceCorrections`

### Hindquarters / booty

The SmellyCat base rises sharply toward the pelvis. The new `hindquarterCarriage` layer:

- lowers the rear torso and dorsal pelvis
- slightly extends the rear torso longitudinally
- preserves hindquarter fullness
- deliberately limits leg-heavy vertices so the paws/leg lengths are not simply squashed
- blends the correction forward across the back rather than creating a sudden hip shelf

Offline evaluation of the exact runtime equations preserves all 33,972 runtime vertices. The largest hindquarter-layer displacement is about 0.84 in at runtime scale; the full combined stack remains topology-preserving. See `development/audits/body_morph_pass_audit.json`.

### Chest / neck transition

The prior pass used a comparatively tight chest bell. From oblique angles it could read as a pinched chest shelf or abrupt neck-to-sternum transition.

`chestFlow` now uses broader overlapping masks for:

- chest body
- sternum
- neck bridge

This reduces the abrupt front-chest bulge while keeping Onyx broad and substantial.

### Face

The face layer is less exaggerated than the previous pass:

- reduced global head widening
- reduced muzzle-pad lateral inflation
- more forward muzzle projection
- gentler chin projection/lowering
- slight upper-cheek taper
- retained nose-tip projection

The goal is a recognizably domestic-cat face rather than a round game-animal muzzle.

## Eye depth / skull-intersection correction

The first correction moved each eye forward only 4.2 source units while enlarging its depth axis by 8.5%. That improved visibility but still left a large rear hemisphere inside the skull.

This pass changes the rendered eye correction to:

- center: `+16.5` source units forward on the FBX eye-forward axis
- lateral size: `1.040×`
- vertical size: `1.030×`
- skull-depth size: `0.420×`

The result is an ellipsoidal eye rather than a larger sphere. Analytical transform auditing shows the corrected rear eye surface now sits slightly forward of the canonical eye-center plane rather than extending roughly 11 mm behind it as the previous correction did. A second local cross-section sanity check places the corrected rear eye surface near the face shell instead of deep behind it, while keeping the visible front surface at almost the same depth as the previous pass.

See `development/audits/eye_depth_correction_audit.json`.

The `B` comparison toggle applies/restores this new eye transform consistently.

## More living movement

The source FBX still supplies the primary `Walk` and `run` clips so the existing rig is protected. The runtime adds non-destructive procedural motion on top.

### Walk / run transition

Walk/run switching no longer hard-stops one action and resets the other. It uses Three.js `AnimationAction.crossFadeFrom(..., warp=true)` so changes of gait blend over roughly a quarter second.

### Idle life

When Onyx is standing rather than locomoting, the viewer now evaluates a small living-motion layer:

- subtle spinal breathing
- tiny neck/head attention movement
- asymmetrical ear twitch
- tail-tip movement
- low-amplitude weight-shift cues

These are intentionally restrained and do not constitute the later personality/autonomy system.

### Slink rather than strut

The locomotion overlay now adds:

- restrained spinal lateral/flexion response
- hip counter-motion
- head stabilization
- small alternating forelimb/scapular-reach cue
- multi-segment tail counterbalance

Combined with the lower hindquarter geometry, this is intended to move the silhouette away from a proud high-rump strut and toward a longer, lower domestic-cat slink.

### Face-overlay restraint

The supplemental nose pad and mouth-line overlay geometry from the prior correction pass was reduced in scale/thickness in this pass. The body mesh and face morph now do more of the silhouette work, while the overlays remain only subtle material/crease cues. This avoids turning a SmellyCat-derived domestic-cat head into a mask-like or overdrawn face.

## Jump correction

SmellyCat's public controller performs an immediate rigid-body vertical launch (`y = 10`) after Space with no crouch/tuck/landing pose layer.

Onyx no longer copies that behavior.

The viewer jump now has explicit phases:

1. `crouch`
2. `ascent`
3. `apex`
4. `descent`
5. `landing`
6. return to `grounded`

The rigid body still supplies gravity and actual trajectory, but thigh/calf/spine bones receive phase-specific additive posing for:

- anticipation/loading
- rear-leg extension
- airborne tuck
- front-paw reach for descent
- landing compression/recovery

This remains a viewer locomotion correction, not final autonomous pet behavior.

## Sims 3 / Sims 4 design influence

No Sims/EA assets or code are included.

The applied design lesson is the *layered character-build model*:

- canonical animal base
- independently adjustable body regions
- face-specific shape controls
- eye placement/depth correction
- locomotion blending instead of a single rigid state
- small idle motion so the animal does not freeze into a prop

The inspection viewer also exposes collapsible, Sims-like **body-shape inspection sliders** for frame, rear carriage, chest flow, tum, and face. Their default value is the authored correction (`1.00×`); they are provided for close visual comparison and do not alter the protected FBX.

The Blender helper now mirrors all five runtime body layers as independently blendable shape keys:

- `Onyx_PrimaryAnatomy`
- `Onyx_HindquarterCarriage`
- `Onyx_ChestFlow`
- `Onyx_PrimordialPouch`
- `Onyx_FaceCorrections`

It does not export over the protected FBX.

## Validation

This pass validates:

- protected FBX/BIN hash identity
- embedded direct-open FBX identity
- SmellyCat Git-blob lineage match
- JavaScript syntax
- all requested inspection controls
- five new morph layers
- eye-depth correction constants
- jump phase implementation
- idle-living-motion implementation
- walk/run cross-fade implementation
- 33,972-in / 33,972-out body morph vertex count
- rear-carriage lowering direction
- software point-cloud side/front comparisons (`development/audits/body_compare_*_pointcloud.png`)
- no accidental nested ZIPs
- prior triangle/normal/skin-influence audits

A current headless Chromium screenshot smoke test was attempted, but the container could not initialize EGL/ANGLE/SwiftShader, so no trustworthy GPU-rendered screenshot was produced here. Static JavaScript, FBX, geometry, lineage, morph, eye-depth and package checks pass. The viewer retains wireframe, skeleton, SmellyCat-base/corrected comparison, slow-motion, pause and frame-step tools for interactive visual inspection on a normal WebGL-capable browser.
