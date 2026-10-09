# User Manual

## 1. Create or import

Use **Create** to add a Box, Sphere, Capsule, Cylinder, Cone, Torus, Plane, Disc, or Torus Knot. Use **Import** for GLB, glTF, OBJ, STL, FBX, DAE, 3MF, or AMF. For formats with sidecar files, select the model and textures/BIN/MTL together.

## 2. Select and transform

Click a mesh in the viewport or Scene list. Use **Move (W)**, **Rotate (E)**, or **Scale (R)**. Exact values are available in the Object inspector. **Apply Transform** bakes the selected transform into mesh geometry.

## 3. Geometry editing

- **Simplify** reduces vertex count using Three.js `SimplifyModifier`.
- **Tessellate** subdivides edges longer than the selected threshold.
- **Weld Vertices** merges near-identical vertices.
- **Recompute Normals** refreshes shading after geometry changes.
- **Mirror X Copy** creates a mirrored duplicate.
- **Center Pivot** moves the geometry origin to its bounding-box center while preserving placement.
- **Merge Visible Meshes** bakes visible mesh world transforms and combines compatible geometry into one mesh/material.

## 4. Sculpt

Select a mesh, open **Sculpt**, enable Sculpt Mode, then drag on the surface. The main brush weighting/deformation math is executed by `script/mesh-kernel-cpp.wasm` when WebAssembly is available. A mathematically equivalent JavaScript fallback is included.

Brushes: Inflate, Deflate, Smooth, Flatten, Pinch, Relax. X symmetry is enabled by default. Low-density meshes can be tessellated before sculpting.

## 5. Paint and materials

The Paint page contains a 1024×1024 texture canvas. Paint on that canvas or enable **Direct 3D Paint** to paint through the selected mesh's UV coordinates. Material swatches in `assets/` can seed the paint canvas and then be edited further.

The Material inspector supports base color, metalness, roughness, opacity, standard/toon/unlit/normal preview, double-sided rendering and wireframe.

## 6. Avatar blockout

The Avatar page generates a project-neutral stylized humanoid composed from editable 3D parts. Sliders control stature, head dimensions, shoulders, torso, waist, hips, arms, legs, limb thickness, hand size and foot size. Presets are convenience starting points, not gender assignments.

**Merge Skin Parts** converts the generated skin components into one mesh while retaining separate eye components. After merging, use ordinary mesh sculpting for detailed refinement.

## 7. 2D / 2.5D conversion

The Convert page renders the current 3D model into:

- Current-view transparent/studio/white/black PNG.
- Portrait PNG.
- 4-view strip: front, right, back, left.
- 8-direction 2.5D sheet: front, front-right, right, back-right, back, back-left, left, front-left.
- Matching sprite metadata JSON containing cell size, order and model bounds.

Toon shading can be enabled only for the capture without permanently changing the editable model.

## 8. Export and save

Use the top ribbon for Project JSON, GLB, OBJ, STL and PLY. Project JSON is the most complete studio-specific restore format. GLB is the recommended portable 3D deliverable because it can preserve materials and textures.


## Keyboard shortcuts

- `W` Move
- `E` Rotate
- `R` Scale
- `F` Frame selection/project
- `Delete` Delete selection
- `Ctrl/Cmd + Z` Undo
- `Ctrl/Cmd + Shift + Z` Redo
