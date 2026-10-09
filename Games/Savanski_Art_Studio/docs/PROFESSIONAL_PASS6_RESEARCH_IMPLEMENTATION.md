# Savanski Professional Pass 6 — Research & Implementation Notes

This pass extends the existing Savanski Art Studio and 3D Editor tool windows. It does **not** add a new toolbar, menu family, navigation system, or backend.

## Research references

### Blender
- Shape Keys / morph targets: https://docs.blender.org/manual/en/4.5/animation/shape_keys/introduction.html
  - Relative shape keys blend vertex offsets from a Basis and are commonly used for muscles, joint corrections, and facial animation.
- Shrinkwrap Modifier: https://docs.blender.org/manual/en/5.2/modeling/modifiers/deform/shrinkwrap.html
  - Useful workflows include nearest-surface projection, nearest-vertex projection, projection limits, and surface offsets.
- Sculpt Remesh: https://docs.blender.org/manual/en/latest/sculpt_paint/sculpting/tool_settings/remesh.html
  - Voxel remesh rebuilds topology from volume; topology-changing remesh is distinct from rigging/shape-key workflows and can discard mesh data layers.

### MeshLab / PyMeshLab
- Filter list: https://pymeshlab.readthedocs.io/en/latest/filter_list.html
  - Isotropic explicit remeshing combines edge split/collapse/swap, Laplacian relaxation, and surface reprojection. This pass adds a clearly labeled **Surface Relax + Reproject** cleanup operation but does not mislabel it as a full isotropic remesher.

### Krita
- Transform Masks: https://docs.krita.org/en/reference_manual/layers_and_masks/transformation_masks.html
- Filter Masks: https://docs.krita.org/en/reference_manual/layers_and_masks/filter_masks.html
- Gamut Masks: https://docs.krita.org/en/user_manual/gamut_masks.html
  - These reinforce Savanski's direction toward editable, non-destructive transforms/filters and intentional color planning.

### Photopea
- Puppet Warp overview: https://blog.photopea.com/photopea-4-7-puppet-warp.html
  - Pin-based deformation allows local reshaping while keeping the rest of the object comparatively stable.

### Snapseed
- Selective: https://support.google.com/snapseed/answer/6157827
- Tune Image: https://support.google.com/snapseed/answer/6157802
- Glamour Glow: https://support.google.com/snapseed/answer/6158226
  - These reinforce local control-point editing and compact tonal workflows already present in Savanski.

## Pass 6 implementation

### Existing 3D Geometry window
- **Surface Conform / Shrinkwrap**
  - Store the selected mesh as a conform target.
  - Nearest Surface mode uses triangle closest-point projection with an optional normal offset.
  - Nearest Vertex mode provides a faster alternative for dense targets.
  - Influence and maximum-distance controls allow partial / limited conforming.
  - Intended for clothing, fur cards, eyelids, armor plates, decals, retopology shells, appendages, and other geometry that needs to follow an existing body surface.
- **Surface Relax + Reproject**
  - Connectivity-based Laplacian relaxation evens local vertex spacing.
  - After every relaxation pass, vertices can be projected back toward the original surface.
  - The feature is explicitly labeled as cleanup/refinement, **not** a complete isotropic edge split/collapse/swap remesher.

### Existing 3D Avatar / Rigging window
- **Shape Keys / Morph Targets**
  - Capture a Basis.
  - Sculpt an alternate expression or corrective form and capture it as a relative morph target.
  - Blend individual shape weights from -1 to 2.
  - Restore the Basis / zero all weights.
  - Mirror a selected shape across X using spatial vertex matching.
  - Delete shape targets.
  - Key all morph weights at the current Savanski animation frame.
  - Morph animation data is stored with Savanski project data and appended to Three.js animation clips for export.
- Intended uses include:
  - facial expressions and phoneme shapes;
  - ear / paw / toe motion;
  - breathing and muscle bulges;
  - corrective elbow, knee, shoulder, hip, wing, jaw, and neck shapes;
  - asymmetrical expression work after symmetric character construction.

### Existing Art Adjustments window
- **Non-destructive Layer Filter Stack**
  - Brightness
  - Contrast
  - Saturation
  - Hue Rotate
  - Blur
  - Sepia
  - Grayscale
  - Invert
- Filters can be enabled/disabled, reordered, removed, cleared, or baked to pixels.
- The original layer pixels remain unchanged until Bake is chosen.

### Existing Art Layers window
- **Linked Layer Instances**
  - Create a linked instance of a source layer.
  - Each instance keeps its own transform, opacity, blend mode, mask, and filter stack while reading pixels from the source.
  - Select the source from the instance.
  - Detach / bake the instance into independent pixels.
  - If a source layer later becomes unavailable, the instance retains the fallback pixel copy made at creation time.

### Existing Art Transform window
- **Puppet Pin Warp**
  - Add pins directly on the active layer.
  - Drag pins to reshape local regions.
  - Adjustable influence radius, falloff, and deformation strength.
  - Bilinear raster resampling and Savanski history / undo integration.

## WASM

`script/savanski-pass6-kernel.wasm` contains Savanski-authored calculation helpers for clamping, smoothstep/falloff, cubic weighting, luminance, and interpolation. The transient C source used only to compile this small browser-side WASM kernel is **not** included in the release.

No Blender, MeshLab, Krita, Photopea, Snapseed, or other third-party application source code was copied into Savanski. Their documented workflows and algorithms were used as research references only.
