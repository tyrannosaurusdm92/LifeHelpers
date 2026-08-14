# Onyx-Specific Correction Pass

## Scope

This pass edits the cat package itself. It does **not** build Onyx's finished room and does **not** add virtual-pet autonomy, mental-health behaviors, psychiatrist behaviors, or Apps Script behavior integration. The existing 12 ft × 14 ft × 8 ft space remains only a scale/inspection shell.

The dossier-documented package is the authority. The second dossier-documented upload was byte-identical to it. The earlier rendering-fix package was used only as a comparison branch.

## Protected foundation

The canonical FBX and companion BIN are preserved byte-for-byte in two places:

- runtime source: `models/fbx/cat.fbx` and `models/fbx/cat.bin`
- protected source: `development/canonical_original/cat.fbx` and `development/canonical_original/cat.bin`

See `MODEL_LINEAGE.json` for SHA-256 hashes and roles.

No replacement FBX was exported in this pass. That is intentional: the source FBX contains vertices with more skin influences than the legacy Three.js loader retains, so writing a replacement before a higher-fidelity skinning conversion path is validated would risk losing correct source rig data.

## Actual runtime model edits

### 1. Named, topology-preserving morph stack

`viewer.js` now retains a copy of the canonical position buffer and builds three named vertex-delta layers:

1. `primaryAnatomy`
2. `primordialPouch`
3. `faceCorrections`

The viewer applies the layers additively over the canonical buffer. Vertex count/order, UVs, skin attributes, skeleton, and embedded animations are not replaced.

The anatomy layer preserves the existing large/long frame while maintaining broader shoulders, broad-ish chest, and a substantial torso without carving a narrow waist or turning the coat silhouette fluffy.

### 2. Primordial pouch correction + secondary motion

The pouch remains an abdominal band rather than a spherical attachment. The mask is restricted spatially to the torso underside and now uses leg/torso skin influence only as a conservative limiter so low leg vertices are less likely to be pulled into the pouch.

The dynamic pouch pass was changed from an instantaneous sinusoidal offset to a damped spring state with separate lateral, fore-aft, and vertical components. It now has:

- walking follow-through
- stronger running follow-through
- vertical response kept smaller than lateral sway
- inertia/lag
- settling after stopping
- absolute rest coordinates each frame so motion does not accumulate vertex drift

This remains intentionally restrained. It is secondary soft-tissue motion, not gelatin physics.

### 3. Face/eye preservation and comparison

The current corrected green-yellow eye treatment is retained. Before the eye correction is applied, the canonical eye transforms are now captured so the viewer can switch between canonical geometry and corrected Onyx without reloading the FBX.

The existing muzzle/nose/chin delta work and satin-black nose/mouth overlays are retained as part of the corrected view. They are hidden in canonical-comparison mode.

### 4. Whiskers

The whisker overlay is now 16 independently curved whiskers rather than a perfectly even fan. Length, curvature, droop, thickness, asymmetry, and pale/white vs occasional dark strands vary by side and row. They remain attached to the facial rig so they follow head motion.

### 5. Walk/run viewer locomotion

The embedded source animations are now used deliberately:

- `Armature|Walk` for walking
- `Armature|run` for Shift-running

Controller velocity is expressed in meter-scale world units rather than multiplying movement velocity by frame delta and then feeding that value to the physics body. Turning is also time-based instead of frame-count-based.

Vertical physics velocity is preserved instead of being reset to zero every controller frame. The viewer-only jump helper uses a much smaller launch velocity and does not represent final pet behavior.

The running secondary-motion layer increases spinal/tail and pouch response modestly relative to the walk rather than treating both gaits identically.

## Inspection viewer improvements

The viewer now includes controls for:

- Auto / Walk / Run animation selection
- 0.05×–1.5× animation speed
- pause/play
- 1/30-second frame stepping
- corrected Onyx vs canonical geometry comparison
- wireframe
- skeleton helper
- measurement-guide toggle
- camera reset
- existing unrestricted orbit, top/underside view and smooth wheel zoom

Keyboard shortcuts:

- `B`: corrected/canonical geometry
- `V`: wireframe
- `K`: skeleton
- `P`: pause/play
- `.`: 1/30-second step while paused
- `M`: measurement guides
- `R`: model/camera reset

## Rig and geometry audit findings

The included audit tool (`development/tools/audit_canonical_fbx.js`) parses the protected runtime FBX with the bundled loader and instruments the loader before its four-weight truncation step.

Latest audit:

- expanded weighted vertices seen during FBX skin processing: **38,520**
- vertices with more than four source influences: **7,610 (19.76%)**
- maximum source influence count observed: **13**
- rendered Cat vertices after loader expansion: **33,972**
- triangles: **11,324**
- bones: **85**
- degenerate triangles: **0**
- tiny triangles at the audit threshold: **0**
- NaN triangles: **0**
- invalid/zero normals: **0**

The position-merge topology inspection reports 8 boundary edges and 6 >2-use edges, concentrated in the earlier audit near the extreme tail-tip region. This is an inspection signal, not permission to run an automatic repair: the Cat mesh is expanded/non-indexed at runtime, so position-merging is an approximation that intentionally collapses seam duplicates in memory.

For that reason, this pass does **not** remesh, merge, split, delete, or automatically repair canonical FBX topology.

## OpenSCAD use

`development/tools/onyx_measurement_jig.scad` builds a pure measurement/debug jig from the dossier dimensions. It includes independent bars for body, tail, normal overall length, stretched midpoint, shoulder height, chest width, and curled footprint. It is not a room and it is not replacement cat geometry.

The script was actually executed with OpenSCAD in this pass. The resulting `development/reference/onyx_measurement_jig.stl` passed OpenSCAD's CGAL generation as a simple 3D object.

## Blender development tool

`development/tools/blender_build_onyx_shape_keys.py` translates the runtime anatomy/pouch/face layers into Blender relative shape keys on a protected FBX import. It aborts if the mesh cannot be found or if vertex count changes. It saves a `.blend` working file and deliberately does **not** export a replacement FBX.

The Blender executable was not installed in the execution environment used for this package, so this script is supplied for the next Blender-enabled validation stage and is not represented as executed here.

## MeshLab / cleaning policy

MeshLab's cleaning code includes operations that can split vertices, remove faces, merge vertices, and otherwise modify topology. Because this package's canonical mesh must preserve rig/UV/vertex compatibility, those repair operations are not automatically applied. The audit scripts perform non-destructive inspection instead, and any future MeshLab repair should happen only on a duplicate with an explicit before/after topology and rig validation.

## Research applied in this pass

The implementation direction was informed by:

- Blender's relative shape-key model: independent vertex-position shapes blended over a basis, particularly useful for muscles/joints/facial animation.
- MeshLab cleaning/selection source: useful inspection and repair concepts, but several repair operations intentionally alter topology, which is why this pass does not auto-clean the canonical cat.
- ufbx: an open-source FBX loader with explicit mesh, skinning, blend-shape, animation evaluation, and CPU-skinning support; a good candidate for a future full-influence rig validation/conversion path.
- OpenSCAD procedural solids/transforms for scale guides and measurement reference geometry.
- The Sims Create A Pet concept of direct feature manipulation plus coat personalization as a legal design reference for layered corrections rather than destructive replacement. Public Create-a-Pet tutorials/walkthrough listings were also reviewed as workflow references; no EA code or assets are included.
- peer-reviewed feline locomotion work showing meaningful 3D scapular/shoulder motion during walking, plus measured active head movement/stabilization during feline gait.
- published whisker-shape research showing that animal whiskers, including cat whiskers, have intrinsic curvature rather than being naturally straight rigid rods.

Research links are recorded in `RESEARCH_SOURCES.md`.

## Deliberately deferred

These belong after Onyx's model/rig/movement is more trustworthy:

- finished room/interior design
- autonomous virtual-pet state machine
- psychiatric/mental-health support behaviors
- personality/relationship/need-driven action selection
- food/treat/audio stimulus sequences
- Google Apps Script behavior backend connection
- destructive FBX re-export or full rig conversion

The dossier behavior specifications remain source material for later work, but this pass only improves the cat model, cat-scale viewer, and locomotion/inspection foundation.

## Validation boundaries and source availability

The named `blender-main.zip`, `meshlab-main.zip`, and `openscad-master.zip` archives were not available as mounted conversation files or discoverable Library files in this execution session. To avoid pretending those archives had been consumed, this pass used official upstream Blender, MeshLab, OpenSCAD, and related primary-source documentation/repositories for the implemented techniques. OpenSCAD itself was available locally and the measurement jig was actually generated with it; Blender and MeshLab executables were not available locally, so Blender work is supplied as a guarded development script and MeshLab-style operations remain audit-only.

A full WebGL screenshot/readback smoke test could not be completed in this container because headless Chromium could not initialize an EGL/ANGLE graphics context. This package therefore does **not** claim a successful GPU-render screenshot test. The completed validation instead covers JavaScript syntax, asset/reference integrity, embedded-FBX identity, protected canonical hashes, FBX parsing, mesh triangle/normal checks, skin-influence inspection, animation/rig metadata, OpenSCAD measurement-jig generation, required inspector controls, missing-file checks, and nested-ZIP checks.
