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

---

## Organic 3D Paint, Mirror Paint, and Bubble Rigging

The existing **Paint / Texture** tool window now includes volumetric 3D Paint. Add/Build/Extend/Fill strokes create editable geometry; subtractive and refinement modes reshape a selected mesh. Mirror Paint can be enabled across X, Y, or Z and can use the model center or world origin as its symmetry plane. Disable Mirror Paint after blocking proportions to introduce independent asymmetry.

Use **Build Volume** to voxel-fuse painted stroke samples into one continuous editable surface, or **Fuse Painted Volume to Selected** to bring painted mass into the selected model's mesh coordinate space. The resulting mesh can continue through the normal Sculpt, Material, surface-paint, rig, animation, save, and export pipeline.

The existing **Avatar** tool window now contains **Bubble-Based Rigging**. Enable it and click the first joint. A live green/yellow ghost joint and connector then follow the pointer; each click places the next joint. Placement within the configurable snap distance (5 px by default) reuses the existing joint, producing a true shared graph node. Finish the current branch and click another existing bubble to branch from it.

Switch Rig Mode to **Edit Joints / Connectors** to drag joint bubbles. Select a connector to reveal its orange midpoint handle, which can be dragged to bend/arc the connector. Connector Waves and Wave Amplitude allow curved, wavy, or irregular anatomical guide paths for spines, tails, tentacles, necks, wings, and other non-straight structures.

Use **Save Rig** to create/update the dedicated Rig Layer. The Rig Layer itself can be selected and transformed with Savanski's normal Move / Rotate / Scale tools; it can also be flipped, mirrored, or duplicated. Individual joints and bone connections remain editable, deletable, mergeable, and reattachable afterward.

**Apply Rig + Auto Weights** converts the bubble graph to a Three.js bone hierarchy and generates normalized skin weights for the target mesh or meshes inside a selected group. Continue with the existing Weight Paint, IK, pose, animation timeline, and animated GLB export tools.


## Pass 7 — Sculpt Regions, Mask Sources, and Surface Utility Bakes

### Sculpt Regions / Face Sets
Use the existing Sculpt window to divide the selected mesh into editable triangle regions. Regions can be initialized by connected parts, normal continuity, or material groups. Pick a region in the viewport, grow or shrink it, convert it to sculpt protection, or extract it as a new mesh.

### Curvature and stencil masks
Curvature masking estimates surface-detail intensity from neighboring vertex normals and writes directly into the normal Savanski sculpt mask. UV stencil masking samples a local image through the mesh UV coordinates and writes luminance into the same sculpt mask. Clear Sculpt Mask returns the mesh to unrestricted sculpting.

### Surface map baking
The existing Paint window can write three utility maps to the normal Savanski Paint Canvas:
- Object-space normals
- Curvature/cavity
- Axis-normalized height/displacement

These are deliberately named according to what the browser implementation actually computes. They are not a substitute for tangent-space cage baking or ray-traced ambient occlusion.
