# Savanski Professional Pass 5 — Research & Implementation

## Scope

This pass extends the existing Savanski Art Studio and 3D Editor windows. It does **not** create a new toolbar family, menu family, workspace, or backend.

The supplied Savanski backend remains external and unchanged. The frontend continues to use the configured Savanski v3 endpoint.

## 3D research references

### Blender

Blender's current manuals were used as workflow references for the separation between sculpt topology/remeshing, weight painting, bone constraints, and inverse kinematics. In particular:

- Sculpt/remesh workflows treat topology reconstruction as a distinct operation rather than as a synonym for smoothing or simple subdivision.
- Weight Paint provides normalization, mirroring, cleanup, smoothing, transfer, and influence-limit concepts.
- Bone constraints are used to restrict degrees of freedom.
- Inverse kinematics moves a chain tip toward a target while the parent chain follows.

Reference documentation:
- https://docs.blender.org/manual/en/latest/sculpt_paint/sculpting/tool_settings/remesh.html
- https://docs.blender.org/manual/en/4.5/sculpt_paint/weight_paint/index.html
- https://docs.blender.org/manual/en/latest/animation/armatures/posing/bone_constraints/introduction.html
- https://docs.blender.org/manual/en/latest/animation/armatures/posing/bone_constraints/inverse_kinematics/introduction.html

Blender source code was **not copied** into Savanski.

### MeshLab / PyMeshLab

MeshLab/PyMeshLab documentation was used as a workflow reference for keeping simplification, subdivision, smoothing, topology cleanup, and related mesh-processing steps distinct.

Reference:
- https://pymeshlab.readthedocs.io/en/latest/filter_list.html

MeshLab source code was **not copied** into Savanski.

### three-mesh-bvh

The three-mesh-bvh project was reviewed as a browser-native reference for accelerated spatial queries and workflows such as sculpting, triangle painting, lasso selection, SDF generation, and geometry voxelization.

Reference:
- https://github.com/gkjohnson/three-mesh-bvh

No three-mesh-bvh source was copied into this pass.

## Art research references

### Krita

Krita's Similar Color Selection workflow and gamut-mask/color-planning documentation were used as references for perceptual selection and guided color workflows.

References:
- https://docs.krita.org/en/reference_manual/tools/similar_select.html
- https://docs.krita.org/en/user_manual/gamut_masks.html

Krita source code was **not copied** into Savanski.

### Snapseed

Snapseed's documented Selective, Healing, Perspective, Tune/Details, Text, and Glamour Glow workflows were used as interaction references. Pass 5 adds a local control-point adjustment workflow and a local liquify/warp workflow inside Savanski's existing Adjustments and Retouch windows.

References:
- https://support.google.com/snapseed/answer/6183571
- https://support.google.com/snapseed/answer/6157686
- https://support.google.com/snapseed/answer/6158226

No Snapseed source code was copied.

### miniPaint

miniPaint was reviewed as a browser-native example of a layered image editor with selections, filters, multiple export formats, and a service worker.

Reference:
- https://github.com/viliusle/miniPaint

No miniPaint source code was copied into this pass.

## Pass 5 implementation

### 3D Editor — existing Paint window

Pass 5 adds:
- UV readiness inspection for the selected mesh/group.
- Box/triplanar-face UV generation.
- Spherical UV generation.
- Cylindrical UV generation.
- Planar XY/XZ/YZ UV generation.
- UV checker texture generation.
- Surface-paint readiness inspection.

This closes an important workflow gap for volumetric/sculpted meshes: a mesh produced by 3D Paint can now be prepared for the existing Direct 3D Paint workflow rather than depending on imported UV coordinates.

### 3D Editor — existing Avatar/Rigging window

Pass 5 adds:
- Conversion of one selected curved/wavy Bubble Rig connector into 2–24 real bone segments.
- Intermediate shared joints are sampled along the visible connector curve.
- The original visual-only curved connector is replaced by actual joint/bone graph entries.

This is useful for tails, spines, necks, tentacles, wings, long creature bodies, and any curved rig path that should influence the real skeleton rather than remain only a visual guide.

### Art Studio — existing Adjustments window

Pass 5 adds a local selective control point:
- Click directly on the artwork to place the control point.
- Adjustable radius and hardness.
- Optional sampled-color similarity weighting.
- Local brightness.
- Local contrast.
- Local saturation.
- Local temperature.

The implementation uses a spatial falloff multiplied by color similarity, then writes through Savanski's normal history/undo path.

### Art Studio — existing Retouch window

Pass 5 adds local liquify/warp operations:
- Bulge.
- Pinch.
- Twirl.
- Push left/right/up/down.
- Adjustable radius and strength.
- Bilinear resampling.
- Normal Savanski history/undo.

## WebAssembly

`script/savanski-pass5-kernel.wasm` contains small Savanski-authored math helpers used by Pass 5 for falloff/similarity calculations. The build ships only the compiled `.wasm` file; no C/C++/Python source is included in the release.

## PWA / installability research

MDN's installability guidance was used to verify the manifest requirements and service-worker deployment model.

References:
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons

Pass 5 adds a repository-root `service-worker.js` so its default scope covers `studio.html`, `js/`, `css/`, `script/`, `json/`, and `assets/`. The manifest uses the existing Savanski icons in `assets/app/` and continues to launch at Home rather than directly bypassing project management.
