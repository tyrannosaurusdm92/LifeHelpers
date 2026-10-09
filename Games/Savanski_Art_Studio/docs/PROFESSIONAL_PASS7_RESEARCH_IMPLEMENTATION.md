# Savanski Professional Pass 7 — Research & Implementation

Date: 2026-09-24

## Scope

This pass continues the existing Savanski Art Studio and 3D Editor. It does not add a new toolbar or menu family. New controls are injected only into existing Art Studio `Layout` / `Retouch` windows and existing 3D `Sculpt` / `Paint` windows.

The tested Savanski backend, Home/Projects flow, Settings system, manifest, app icons, and existing editor families remain in place.

## Research themes used

### Blender sculpt / texture-paint concepts
- Sculpt Face Sets are used as editable regions that can be initialized from mesh properties and grown, shrunk, or extracted.
- Sculpt masks protect geometry from brush edits.
- Texture-paint stencil masks and cavity masks demonstrate the value of image-driven and surface-detail-driven masking.
- Multires workflows distinguish true high/low detail baking from ordinary smoothing or remeshing.

Implementation consequence in Savanski:
- Sculpt Regions / Face Sets are stored as triangle-region labels and can be initialized by loose connectivity, normal regions, or material groups.
- An active region can be grown/shrunk, extracted, or converted into the existing Savanski sculpt mask.
- Curvature-derived and UV-stencil-derived masks feed the existing sculpt-mask attribute rather than inventing a separate sculpt subsystem.
- Surface bakes are explicitly labeled object-space normal, curvature/cavity, or axis height/displacement. They are not mislabeled as ray-traced AO or tangent-space cage baking.

References:
- https://docs.blender.org/manual/en/latest/sculpt_paint/sculpting/editing/face_sets.html
- https://docs.blender.org/manual/en/latest/sculpt_paint/sculpting/brushes/mask.html
- https://docs.blender.org/manual/en/latest/sculpt_paint/texture_paint/tool_settings/mask.html
- https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/multiresolution.html

### MeshLab / PyMeshLab
MeshLab-style workflows keep topology cleanup, smoothing, decimation, parameterization, and surface-quality operations conceptually separate. Earlier Savanski passes already added simplification, tessellation, cleanup, UV projection, relaxation, and reprojection. Pass 7 continues that separation instead of collapsing unrelated operations under a misleading generic remesh label.

Reference:
- https://pymeshlab.readthedocs.io/en/latest/filter_list.html

### three-mesh-bvh / browser 3D workflows
three-mesh-bvh demonstrates that browser Three.js workflows can support accelerated raycasting, sculpting, triangle painting, lasso-style spatial selection, geometry voxelization, and other mesh queries.

Pass 7 remains dependency-light and does not copy this library, but its browser-first interaction model informed the region-picking and surface-focused workflow.

Reference:
- https://github.com/gkjohnson/three-mesh-bvh

### Krita
Krita's Assistant Tool provides reusable perspective/drawing guides, while Filter Masks, layer/mask separation, similar-color selection, and vector/raster coexistence demonstrate a non-destructive artist workflow.

Pass 7 adds non-exporting perspective/ruler assistants and a reference-image overlay to the existing Layout window. Brush/shape coordinates can optionally snap to the active assistant family.

References:
- https://docs.krita.org/en/reference_manual/tools/assistant.html
- https://docs.krita.org/en/reference_manual/layers_and_masks/filter_masks.html
- https://docs.krita.org/en/reference_manual/tools/similar_select.html

### Browser and mobile art workflows
- miniPaint demonstrates a fully browser-local editor with layers, filters, clipboard import, transforms, clone, color replacement, and service-worker support.
- Snapseed Selective demonstrates point/radius based local editing.
- Canva's background-removal workflow includes erase/restore refinement rather than treating the first automatic mask as final.
- Photopea's Puppet Warp is a familiar pin-based deformation workflow already represented by the Pass-6 Savanski puppet-pin layer.

Pass 7 extends the local retouch side with selection-driven Smart Inpaint and Frequency Separation while preserving existing Savanski local-adjustment, liquify, background-removal, masks, filters, Puppet Pin, and non-destructive layers.

References:
- https://github.com/viliusle/miniPaint
- https://support.google.com/snapseed/answer/6157827
- https://www.canva.com/help/background-remover/
- https://blog.photopea.com/photopea-4-7-puppet-warp.html

## Added Art Studio capabilities

### Drawing Assistants
Existing Layout window:
- 2-point perspective
- 1-point perspective
- angled parallel/ruler guides
- configurable guide spacing and opacity
- VP1 / VP2 placement directly on the canvas
- optional snapping of freehand paint and shape endpoints to the active guide family
- non-exporting overlays

### Reference Board
Existing Layout window:
- load a local image as a non-exporting reference overlay
- X / Y positioning
- scale
- opacity
- reference state stored with the Savanski project when the project serializer preserves custom project fields

### Smart Inpaint
Existing Retouch window:
- uses the current rectangle or precision selection
- browser-local boundary propagation / weighted neighborhood reconstruction
- intended for small object removal, dust, gaps, and background remnants
- deliberately labeled as local Smart Inpaint rather than claiming generative/content-aware equivalence

### Frequency Separation
Existing Retouch window:
- configurable blur radius
- preserves the source layer but hides it
- creates editable low-frequency color/tone layer
- creates an overlay high-frequency detail layer
- supports normal Savanski layer/history workflows

## Added 3D capabilities

### Sculpt Regions / Face Sets
Existing Sculpt window:
- initialize by normal regions
- initialize by loose connected parts
- initialize by material groups
- pick active region directly from the viewport
- grow or shrink region by topology ring
- mask outside active region
- mask active region
- extract active region as a new mesh
- persistent region metadata stored on geometry userData

### Curvature Sculpt Mask
Existing Sculpt window:
- estimates vertex curvature from neighboring normals
- writes directly into Savanski's existing sculpt mask
- adjustable strength
- invert option

### UV Stencil Sculpt Mask
Existing Sculpt window:
- local image file
- uses mesh UV coordinates
- luminance-driven mask
- threshold and invert
- feeds existing Savanski sculpt mask

### Surface Detail Map Baking
Existing Paint window:
- object-space normal map
- curvature/cavity utility map
- normalized X/Y/Z height/displacement utility map
- bake to existing Paint Canvas
- download baked PNG

These utility bakes are intentionally not described as tangent-space cage baking or ray-traced ambient occlusion.

## Licensing / source handling

Blender and Krita are GPL applications. Their workflows and public documentation were used as research references; their source code was not copied into Savanski.

three-mesh-bvh and miniPaint are permissively licensed projects useful for browser-architecture research, but Pass 7 still uses Savanski-authored implementation code rather than importing another UI framework.

No C/C++/Python source is shipped in the release. A small Savanski-authored C math kernel was compiled to `script/savanski-pass7-kernel.wasm`, and only the WASM output is packaged.
