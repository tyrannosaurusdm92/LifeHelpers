# Savanski Professional Pass 8 — Research & Implementation

Date: 2026-09-24

## Scope

Pass 8 extends the existing Savanski Art Studio and 3D Editor. It does **not** add a new toolbar, toolbar family, menu family, or alternate navigation layer. New controls are injected only into existing windows:

- Art Studio: `Shapes` and `Transform`
- 3D Editor: `Geometry` and `Sculpt`

Home/Projects remains the authority for creating, opening, duplicating, renaming, deleting, restoring, and continuing projects. The existing Settings system, tested backend endpoint, PWA manifest, app icons, and root service worker remain in place.

## Research themes

### Blender — retopology / Poly Build

Blender documents retopology as the normal manual process for creating animation-friendly topology over a dense sculpt, because automatic remesh results generally are not ideal for deformation. Its Poly Build tool combines vertex creation, face creation, movement, edge extrusion, snapping and auto-merge concepts.

Savanski Pass 8 implements a browser-native surface-retopology draft:
- select a dense/sculpted surface as the target
- place vertices directly on the visible target surface
- drag draft points while keeping them surface-snapped
- create triangles from the latest 3 points
- create quads from the latest 4 points
- create a quad strip from successive point pairs
- build a separate editable retopology mesh
- continue that mesh through existing UV, material, weighting, rigging and animation tools

References:
- https://docs.blender.org/manual/en/latest/modeling/meshes/retopology.html
- https://docs.blender.org/manual/en/4.5/modeling/meshes/tools/poly_build.html

### Blender — Pose sculpt

Blender's Pose sculpt brush is intended for rig-like proportion changes and posing directly on a mesh before or without a finished armature.

Savanski Pass 8 adds a region-pose operation which works with:
- existing Savanski sculpt masks
- active Sculpt Regions / Face Sets
- X/Y/Z rotation
- translation
- adjustable strength

It is intentionally labeled `Pose Sculpt Region`, not a claim of complete Blender Pose Brush parity.

Reference:
- https://docs.blender.org/manual/en/latest/sculpt_paint/sculpting/brushes/pose.html

### MeshLab / PyMeshLab

PyMeshLab distinguishes explicit isotropic remeshing, refinement/collapse, smoothing, surface-distance constraints and surface reconstruction rather than treating all topology work as one command. Pass 8 preserves that distinction. The new tool is a manual retopology builder, not Screened Poisson reconstruction or a fake "automatic quad remesher."

Reference:
- https://pymeshlab.readthedocs.io/en/latest/filter_list.html

### Photopea — vector graphics

Photopea treats paths, vector masks and shape layers as editable vector structures distinct from raster content.

Savanski Pass 8 adds:
- editable vector path objects
- open and closed paths
- smoothed Bézier interpolation
- stroke and fill styling
- node dragging
- path-to-precision-selection
- path-to-layer-mask
- rasterized-copy creation while retaining the editable vector original

Reference:
- https://www.photopea.com/learn/vector-graphics

### Browser editors / mobile workflows

miniPaint demonstrates that browser-local editing can support layers, filters, selections, transforms and effects without requiring a desktop-native runtime. Snapseed demonstrates local brush-based selective editing, while Canva exposes erase/restore refinement after automatic background removal. Those workflows remain represented by earlier Savanski passes; Pass 8 adds content-aware local scaling without introducing AI or server-side image generation.

References:
- https://github.com/viliusle/miniPaint
- https://support.google.com/snapseed/answer/6157715
- https://www.canva.com/help/background-remover/

## Added Art Studio capabilities

### Editable Vector Pen / Bézier Paths

Existing `Shapes` window:
- Start Vector Path
- click canvas to place editable anchors
- Finish Open
- Close Path
- Edit / drag nodes directly on canvas
- Undo last node
- Delete path
- Stroke color
- Fill color
- stroke width
- curve smoothness
- non-zero or even-odd fill rule
- Path -> precision selection
- Path -> layer mask
- Rasterize Copy while retaining the editable vector path

Vector data is stored inside the existing advanced project scene so it survives Savanski project serialization.

### Content-Aware Layer Scale

Existing `Transform` window:
- width percentage
- height percentage
- seam-carved local resizing
- current precision selection acts as protected content
- transparent pixels and image gradients contribute to seam energy
- source document canvas size is preserved
- intended for nonuniform intelligent shrinking/enlarging of an individual raster layer

Safety limits:
- source region limited to 2.5 million pixels per pass
- at most 240 seam operations per action
- larger changes should be performed in several passes

This is a local seam-carving implementation. It is not described as generative fill or AI-aware reconstruction.

## Added 3D capabilities

### Surface Retopology / Poly Build

Existing `Geometry` window:
- Use Selected as Surface
- Place Vertices on the target surface
- configurable surface offset
- Edit / Drag Points while preserving surface snap
- Undo Vertex
- Face from Last 3
- Quad from Last 4
- Quad Strip from Pairs
- Build Retopology Mesh
- Clear Draft
- visible draft vertices and topology overlay

The built result is a normal editable Savanski mesh and can use existing:
- transform
- simplify / refine
- UV generation
- materials
- surface paint
- Bubble Rig
- auto/manual weights
- IK
- shape keys
- animation
- export

### Pose Sculpt Region

Existing `Sculpt` window:
- All Unmasked scope
- Active Face Set + Mask scope
- X/Y/Z rotation
- arbitrary translation
- adjustable strength
- pivot derived from the weighted selected region

The existing sculpt mask remains authoritative: mask value 1 protects a vertex; unmasked vertices are deformable.

## WebAssembly

A small Savanski-authored computation kernel is compiled to:

`script/savanski-pass8-kernel.wasm`

Exports include:
- clamp01
- smoothstep01
- falloff
- luma
- edge_energy

The browser modules retain JavaScript fallbacks when WASM cannot load.

No C, C++, Python or backend source is packaged with the release.

## Licensing / source handling

Blender and MeshLab workflows and documentation were used as research references. Their GPL source was not copied into Savanski.

Photopea was used as a workflow reference for vector-path concepts. miniPaint was used as a browser-architecture reference.

Pass 8 implementation code is Savanski-authored.
