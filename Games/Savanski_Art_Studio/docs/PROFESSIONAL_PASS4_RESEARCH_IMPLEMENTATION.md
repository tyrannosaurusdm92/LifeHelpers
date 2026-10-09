# Savanski Professional Pass 4 — Research and Implementation Notes

## Scope

This pass extends the existing Savanski Art Studio and Savanski 3D Editor windows. It does **not** create another toolbar, navigation system, side rail, or editor shell.

All implementation code in this pass is Savanski-authored. Blender, MeshLab/PyMeshLab, Krita, Photopea, Snapseed, Canva, miniPaint, and similar applications were studied for workflow and algorithmic concepts. GPL application source was not copied into Savanski.

The browser computation helper for this pass is `script/savanski-pass4-kernel.wasm`. Its temporary source is not shipped. No C, C++, Python, batch, executable, or app-bundle source is included in the package.

## Research principles used

### Blender sculpting / topology

Blender's sculpting documentation treats voxel remeshing as a topology-rebuilding operation intended to produce more uniform sculpt topology. Lower voxel sizes retain more detail but generate denser meshes, and Blender explicitly notes that remeshing can discard mesh data layers and does not operate through rigging/multires in the same way as ordinary deformations.

Savanski therefore keeps topology-building operations clearly separated from rig deformation. The organic 3D Paint system can build a continuous voxel-fused surface before rigging, while the rigging/weight tools focus on deformation quality after the mesh is bound.

Reference: Blender Manual — Sculpting / Remesh.
https://docs.blender.org/manual/en/latest/sculpt_paint/sculpting/tool_settings/remesh.html

### MeshLab / PyMeshLab mesh processing

PyMeshLab documents Taubin smoothing as a two-step lambda/mu low-pass method and exposes dedicated quadric edge-collapse decimation, problem-face detection, clustering, and other topology filters. Savanski uses this as a workflow reference for keeping smoothing, simplification, diagnostics, and reconstruction as distinct tools rather than presenting one operation as a universal remesher.

Reference: PyMeshLab — List of Filters.
https://pymeshlab.readthedocs.io/en/latest/filter_list.html

### Blender weight paint / rigging

Blender's Weight Paint editing workflow includes normalization and mirroring, and its rigging workflow separates joint constraints from the inverse-kinematics solver. Savanski Pass 4 adds the corresponding deformation-quality stage after automatic weights: influence limiting, cleanup, normalization, neighborhood smoothing, X mirror with left/right bone remapping, per-bone angular limits, and a constraint-aware CCD IK solve.

References:
https://docs.blender.org/manual/en/latest/sculpt_paint/weight_paint/editing.html
https://docs.blender.org/manual/en/latest/animation/armatures/posing/bone_constraints/inverse_kinematics/introduction.html

### Krita selection and color-planning concepts

Krita's Similar Color Selection is tolerance-based, and its gamut-mask/color-selector systems emphasize deliberate color relationships rather than only raw RGB values. Savanski already includes perceptual Lab color matching, palette extraction, harmonies, and gamut planning. Pass 4 adds weighted luminance/chroma precision masks that feed the existing selection, lift, erase, keep, masking, and adjustment workflows.

References:
https://docs.krita.org/en/reference_manual/tools/similar_select.html
https://docs.krita.org/en/user_manual/gamut_masks.html

### Browser-native image editing

miniPaint demonstrates that serious layers, masks, filters, resize, selection, drawing, and color-correction workflows can run locally in a browser. Savanski preserves this local-first editing model and adds another browser-native precision layer without relying on server-side image generation.

Reference:
https://github.com/viliusle/miniPaint

### Photopea / Snapseed / Canva workflow references

Photopea's layer styles demonstrate reusable shadow/glow/stroke-type compositing effects; Snapseed exposes direct tonal and glow controls; Canva's background-removal touch-up workflow explicitly supports erase/restore brushing. These reinforce Savanski's existing layer effects, adjustable glow/HDR tools, connected-background matte, precision masks, and non-AI local correction workflows.

References:
https://www.photopea.com/learn/layer-styles
https://support.google.com/snapseed/answer/6158226
https://support.google.com/snapseed/answer/6157802
https://www.canva.com/help/background-remover/

## 3D Editor additions in this pass

### Organic 3D Paint refinements

The existing 3D Paint window now additionally supports:

- Additive volume strokes from empty space.
- Negative volume strokes for Subtract / Carve / Cut before Build Volume.
- Boolean-style signed volume reconstruction during Build Volume so negative strokes form real cavities rather than orange helper geometry remaining in the final model.
- Surface placement, camera-facing construction plane, and world XY / XZ / YZ construction planes.
- Surface relaxation after voxel reconstruction.
- Existing live X / Y / Z Mirror Paint and centerline de-duplication remain active.

These additions preserve the workflow:

3D Paint → Mirror Paint → Build Volume → Sculpt → Break Symmetry → Surface Paint → Rig → Pose → Animate.

### Skin-weight cleanup

Inside the existing Avatar / Rigging window:

- Limit skin influences to 1–4 strongest bones per vertex.
- Remove influences below a user threshold.
- Renormalize weights after cleanup.
- Smooth weights across mesh adjacency for multiple passes.
- Mirror weights across local X.
- Match common left/right bone-name conventions when mirroring.
- Adjustable mirrored-vertex tolerance.

This is designed for the stage after a Bubble Rig or other skeleton has been applied and before final animation refinement.

### Joint constraints and constrained IK

Also inside the existing Avatar / Rigging window:

- Enable/disable limits per selected bone.
- X/Y/Z minimum and maximum local rotation limits.
- Joint response/stiffness control.
- Save limits in the bone's `userData` so they travel with normal Three.js project serialization.
- Solve IK using the existing target, chain length, iteration, and strength settings while clamping constrained joints after every CCD step.
- Rig validation reports bone count, constrained-bone count, invalid weight sums, zero-weight vertices, and invalid bone references.

## Art Studio additions in this pass

### Luminance / chroma precision masks

Inside the existing Selection window:

- Choose Luminance or Chroma/Saturation measurement.
- Choose low/high range.
- Feather the range boundary.
- Produce a weighted precision selection mask.
- Reuse that selection with existing lift, erase, keep, layer mask, and adjustment actions.

### Raster four-corner perspective

Inside the existing Transform window:

- Independent TL / TR / BR / BL X/Y offsets.
- Percentage-based controls relative to current layer dimensions.
- Inverse bilinear reconstruction with bilinear pixel sampling.
- Transparent pixels outside the warped quadrilateral.
- Normal Savanski history snapshot for undo.

This extends four-corner perspective manipulation from advanced objects to ordinary raster layers.

### Split toning and RGB channel mixer

Inside the existing Adjustments window:

- Independent shadow and highlight tint colors.
- Balance and strength.
- Optional luminance preservation.
- Full 3×3 RGB channel-mixing matrix.
- Matrix reset.
- Optional luminance preservation after channel mixing.

### Blend If luminance alpha

Inside the existing Layers window:

- Low/high luminance range.
- Feathering.
- Convert the range into active-layer transparency.
- Useful for highlight/shadow composites, glow layers, reflections, texture overlays, and effect isolation.

## WASM

`script/savanski-pass4-kernel.wasm` provides compact browser computation helpers used by the Pass-4 JavaScript layer, including clamping, smoothstep/soft thresholds, brush weighting, luminance, interpolation, and angle constraint helpers. JavaScript fallbacks remain available when WebAssembly cannot be loaded.

## What this pass does not claim

- Savanski's voxel-fused construction surface is not described as a full OpenVDB implementation.
- Weight mirroring is a Savanski spatial matching implementation and not Blender source code.
- The raster warp is an authored browser implementation, not copied Photoshop/Photopea code.
- No GPL Blender, MeshLab, Krita, or GIMP source is bundled.
