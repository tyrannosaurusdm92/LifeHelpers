# Savanski Professional Editing Research & Implementation Notes

## Scope

This pass expanded the existing Savanski Art Studio and 3D Editor without creating a second toolbar, menu bar, navigation system, or tool bubble. New controls are injected into the existing authoritative Art and 3D tool panels.

The implementation is browser-first and static-host compatible. Native-oriented projects were studied for workflow and algorithm design; GPL source from Blender, MeshLab, and Krita was **not copied into Savanski**. Savanski-specific implementations were written for this project, and existing browser-compatible/permissive ecosystems were used as architectural references.

## 3D research

### Blender
- Source: https://github.com/blender/blender
- Studied: end-to-end modeling/sculpting/painting/rigging/animation workflow, armature concepts, mesh transforms, lighting/shadows, scene organization, keyframes, and export expectations.
- License note: Blender is GPL. Its implementation code was treated as a workflow/reference source only, not copied.

### MeshLab
- Source: https://www.meshlab.net/ and https://github.com/cnr-isti-vclab/meshlab
- Studied: mesh cleanup, normals, simplification, tessellation/remeshing-oriented workflows, inspection, mesh conversion, and preparing meshes for downstream use.
- License note: workflow reference only for this implementation.

### meshoptimizer
- Source: https://github.com/zeux/meshoptimizer
- MIT-licensed reference for mesh simplification/optimization concepts, topology constraints, and efficient mesh-processing pipelines.

### SculptGL
- Source: https://github.com/stephomi/sculptgl
- MIT-licensed browser sculpting reference. Studied browser-local sculpt interaction patterns and WebGL sculpt-tool organization.

### three-mesh-bvh
- Source: https://github.com/gkjohnson/three-mesh-bvh
- MIT-licensed spatial-query/raycasting reference. Its sculpting, triangle-painting, and lasso examples informed performance-oriented browser 3D interaction planning.

### Implemented 3D additions
- Dense sculpt-ready sphere starter.
- Editable cat blockout starter.
- Surface subdivision.
- Laplacian smoothing.
- X seam centering/symmetry cleanup.
- Additional sculpt modes: Crease, Clay, Scrape.
- Custom WebAssembly geometry/sculpt support kernel with JavaScript fallback.
- Quadruped skeleton generation.
- Automatic nearest-bone skin-weight assignment and normalization.
- Bone selection and transform support, including a live bone list inside the existing Avatar panel.
- Skeleton helper visibility.
- Custom bone addition.
- Keyframe timeline for object + bone transforms.
- Keyframe interpolation/playback.
- Animation persistence inside Savanski 3D project JSON.
- Animated GLB export when keyframes exist.
- Three-point lighting and configurable shadow-map quality.

This means a user can create a dense ball, sculpt it with multiple brush modes into an organic form, paint it, bind a quadruped skeleton, pose bones, create animation keyframes, preview the motion, and export an animated GLB. The Cat Blockout is also provided as a faster multi-part starting point.

## Art / image-editing research

### Krita
- Source: https://docs.krita.org/
- Studied: broad brush-engine philosophy, filter masks/non-destructive editing concepts, gamut masks/color harmony, selections, assistants, layers/masks, and artist-oriented color workflows.
- License note: Krita is GPL; implementation code was not copied.

### Clip Studio Paint
- Source: https://help.clip-studio.com/ and https://www.clipstudio.net/
- Studied: stroke stabilization, adjustable/vector-like line workflows, selections/transforms, brush customization, layers, color workflows, and animation-oriented drawing UX.

### miniPaint
- Source: https://github.com/viliusle/miniPaint
- MIT-licensed browser editor reference. Studied browser-local layers, resize, color correction, filters, selection, background/color replacement, clone/retouch, and export patterns.

### Fabric.js and Konva
- Sources: https://github.com/fabricjs/fabric.js and https://github.com/konvajs/konva
- MIT-licensed browser canvas references for object interactions, move/scale/rotate/skew, event-driven scene graphs, shapes, filters, gradients, patterns, drag/drop, and export.

### Adobe Photoshop on the web
- Source: https://helpx.adobe.com/photoshop/web/
- Studied: tool grouping around Adjust, Retouch, Select, Paint, Shapes, Type, layer effects, masks, transformations, and browser-first editing workflows.

### Snapseed
- Source: https://support.google.com/snapseed/
- Studied: Tune Image, Details, Perspective, White Balance, selective edits, healing, vignette, text, glow/HDR/film-oriented filters.

### Photomator
- Source: App Store listing and current product descriptions.
- Studied: nondestructive color-adjustment concepts, subject/background selection workflows, denoise, detail, temperature/tint, shadows/highlights, levels/curves expectations, selective color, and match-color concepts.

### LunaPic / Canva
- Sources: https://www2.lunapic.com/ and https://www.canva.com/
- Studied: transparent-background workflows, erase by color, collage, text, glow/shadow effects, broad filter libraries, resize, and design-first composition workflows.

### Implemented Art additions
- Precision select-by-color with tolerance.
- Lift rectangular selections into a new movable layer.
- Lift matching-color pixels into a new movable layer.
- Precision erase by exact/similar color with tolerance and feather.
- Full interactive HSL color wheel.
- Precision find/replace color with tolerance, feathering, and optional luminance preservation.
- Match active layer color balance to the nearest visible reference layer below.
- Luminance histogram plus input/output Levels and midpoint gamma.
- Complementary, analogous, triadic, split-complementary, tetradic, and monochrome harmony generation.
- Brush stroke stabilization.
- Exposure, gamma, temperature, tint, vibrance, shadows, and highlights adjustments.
- Denoise, unsharp mask, edge detect, emboss, and bloom/glow processing.
- Layer-based drop shadow, outer glow, reflection, and light-mote effects.
- Smart Grid, Two Panel, Hero + Two, and Strip collage arrangements.
- Active-layer resize with resampling choice.
- Arbitrary project canvas resizing with anchor control; existing artwork is preserved/repositioned.
- Existing text, layer, mask, brush, retouch, transform, perspective, blend, gradient, border, crop-shape, preset, and export systems remain available.

## Project lifecycle / Home

Home is the project authority for both Art and 3D:
- New Art project.
- New 3D project: Empty Scene, Sculpt-Ready Ball, or Cat Blockout.
- Import Art project/image from Home.
- Import 3D project/model from Home.
- Continue any local Art or 3D project from the Home project list.
- Rename.
- Duplicate.
- Soft-delete with confirmation.
- Recently Deleted recovery.
- Permanent deletion with confirmation.
- Empty Trash with confirmation.

The editor header Studio / 3D Editor controls now return to the relevant Home mode rather than creating or opening a project implicitly.

## Backend

Frontend storage integration is configured to:

https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec

Savanski uses only project/file/storage/auth-compatible calls from this backend integration. This pass adds no AI feature, AI button, AI tool, AI menu, or AI request path.

## WebAssembly

`script/savanski-professional-kernel.wasm` is a compiled browser WebAssembly kernel used for computational helpers including sculpt falloff, smoothing interpolation, crease/clay/scrape deformation helpers, skin-weight falloff, soft-threshold math, and luminance math. `js/professional-wasm-bridge.js` loads it and provides equivalent JavaScript fallbacks when WASM cannot initialize.

The existing C++ mesh kernel and prior Python-derived sculpt math port remain compiled as WebAssembly in `script/`. The bridge prefers the external `.wasm` files when served over HTTP/HTTPS and falls back to embedded bytes for direct local-file use. The `script/` folder contains only `.wasm` files.


## Static hosting / install metadata

`assets/app/manifest.webmanifest` points back to `studio.html` and uses the bundled Savanski icons, so a GitHub Pages deployment has browser install metadata while keeping the requested top-level folder structure. No Electron, Windows batch, `.app`, or other native wrapper was added.

## 2026-09-23 — Second professional research / implementation pass

This continuation keeps the **same 16 Art categories and 15 3D categories**. It adds controls inside those existing windows; it does not add a second toolbar, menu bar, side panel, or tool bubble.

### Additional 3D workflow research applied

- Blender 5.2 sculpt documentation was reviewed for mask-driven sculpting, Grab, Snake Hook, adaptive-resolution thinking, and the way sculpting separates broad proportion changes from surface-detail brushes. Savanski now exposes mask-aware sculpt deformation, Grab, Snake Hook, Twist, pressure-aware radius/strength, and X/Y/Z symmetry in the existing Sculpt window.
- Blender armature/constraint documentation was reviewed for pose chains and inverse-kinematics expectations. Savanski now includes a browser-native CCD inverse-kinematics solver, chain-length/iteration/strength controls, IK target coordinates, and pose copy/paste in the existing Avatar window.
- MeshLab's meshing filters were reviewed for simplification, subdivision, isotropic-regularization concepts, hole/topology diagnostics, normals, and post-process cleanup. Savanski's existing Geometry window now has topology analysis/repair-oriented operations, subdivision, smoothing, welding/normal repair, and uniformization helpers. Savanski deliberately does **not** label the current uniformization helper as a true voxel remesher.
- meshoptimizer and three-mesh-bvh were reviewed as permissively licensed browser-friendly references for mesh simplification/spatial-query architecture. Savanski continues to use its own browser-local implementation and existing Three.js stack rather than copying GPL application code.

### Additional 3D implementation in this pass

- Sculpt masks stored as a per-vertex geometry attribute; masked vertices are protected from deformation.
- Mask painting, erasing, smoothing, clearing, and inversion.
- Grab brush for broad proportional shaping.
- Snake Hook brush for pulling limbs/tails/ears and other elongated forms from a sculpt.
- Twist sculpt stroke around the local brush normal.
- X, Y, and Z symmetry options.
- Pointer-pressure-aware sculpt radius/strength where supported by the device.
- Mesh diagnostics for triangle/vertex counts, degenerate faces, boundary information, and repair-oriented cleanup.
- Vertex-color painting directly onto compatible mesh geometry.
- Manual skin-weight painting, bone influence visualization, normalization, and bind-pose helpers.
- Physically based material extensions for clearcoat, coat roughness, sheen, sheen roughness, transmission, IOR, and emission, plus texture-map inputs.
- Animation key deletion/duplication, interpolation choice, and motion-path visualization.
- CCD inverse kinematics for an existing armature chain.
- Pose copy/paste by bone name.

The intended organic workflow is therefore supported as a real browser workflow: **Home → new Sculpt-Ready Ball → sculpt broad proportions with Grab/Snake Hook/Twist and detail brushes → mask/symmetry cleanup → paint/material/shadow work → auto quadruped rig or edit bones → refine weights → pose/IK → animation keyframes → animated export**. The exact final quality still depends on mesh density, the user's sculpting, browser/GPU limits, and the topology of the model; this is not represented as feature-parity with Blender.

### Additional Art / 2D workflow research applied

- Krita's freehand-brush stabilization model informed the expanded stroke stabilization and brush-dynamics controls.
- Krita's Similar Color Selection and color-selector/gamut-mask workflows informed perceptual color-range selection, selection refinement, and guided palette generation.
- GIMP's mature selection/paint/transform tool grouping was used as a workflow cross-check for fuzzy/select-by-color, clone/heal-style retouch, dodge/burn, smudge, and transform expectations.
- Photoshop on the web adjustment workflows were reviewed for selective Hue/Saturation, Brightness/Contrast, Exposure, Vibrance, Levels, Curves, masking, and object-targeted adjustment expectations.
- Snapseed's Tune Image / RAW / Tonal Contrast / Glow workflows informed shadows, highlights, temperature/tint, local contrast/structure, histogram-guided tuning, and controllable glow behavior.
- miniPaint was reviewed as an MIT-licensed browser-editor reference for local layers, resize, histogram/color corrections, selection, replace-color, filters, and export architecture.
- Konva's transform/select model was reviewed for object move/resize/rotate, multi-object alignment concepts, and bounded transform behavior.

### Additional Art implementation in this pass

- Brush spacing, scatter, flow, angle jitter, tip-family controls, and pointer-pressure response.
- Connected brush-mark selection: choose one connected painted island by perceptual color/alpha similarity, then lift it into its own movable layer.
- CIE Lab / Delta-E-style perceptual color range selection rather than relying only on raw RGB distance.
- Grow, shrink, feather, invert, lift, erase, and keep operations for precision selection masks.
- Precision selection → layer mask; invert, feather, or destructively apply that mask.
- Matte/alpha refinement, edge defringing, and perceptual color-key background erasing.
- Curves presets/channel processing, auto white-balance support, and local contrast/structure processing.
- Selective HSL adjustment and color-splash behavior.
- Average-color sampling for color matching.
- Canvas/object alignment and distribution helpers for editable shapes, text, images, and brush-stroke objects.
- Gamut/palette planning in the existing Color window: complementary, split complementary, triadic, analogous, monochrome, and dominant/accent palette generation from the current primary color.

### Licensing / code-use boundary

Blender, MeshLab, Krita, and GIMP are used here as **workflow and algorithm-design references**. Their GPL application source was not copied into Savanski. This pass uses independent Savanski implementations and the already-bundled browser stack. Where native-language ideas are useful, Savanski's own computational helpers are shipped as WebAssembly, with no C, C++, or Python source included in the release package.

### WASM folder normalization

All shipped `.wasm` binaries are now in `script/`, including the Three.js Draco decoder and Basis/KTX2 transcoder. The JavaScript wrappers remain in `js/` and explicitly resolve their WASM binaries from `script/`. The `script/` directory therefore contains only WebAssembly binaries and `js/` contains no `.wasm` files.

### Settings / account / storage continuation

The tested v3.0.1 backend remains external and unchanged. Existing Settings entry points remain Home + the shared editor header gear immediately to the left of the light/dark control. This pass retains sign-up/sign-in, browser/password-manager compatible password fields, show/hide password, remembered-device session handling, password change, account/storage status, Stripe storage purchase/claim, and adds install-state handling to the same Settings window. The backend does not advertise forgotten-password code/reset actions, so those existing frontend controls remain disabled rather than simulating a code that the server cannot issue.


## 2026-09-24 — Third professional research / implementation pass

This pass continues the existing **16 Art Studio categories** and **15 3D Editor categories**. No new toolbar, menu bar, side navigation, or tool bubble was created. Every new control is injected into an existing authoritative tool window.

### 3D research translated into browser-native tools

Blender's current sculpting documentation distinguishes several mesh-density strategies rather than treating every cleanup/subdivision operation as the same kind of remesh. Its voxel-remesh workflow rebuilds a manifold volume with more uniform topology, while dynamic topology adapts detail underneath sculpt strokes. Blender also treats topology-changing operations as something that can invalidate rigging/shape-key data. Savanski therefore keeps topology-changing density controls clearly separated from skinning and disables the new decimation/adaptive-tessellation operations on already-skinned meshes.

MeshLab / PyMeshLab documentation was reviewed for quadric simplification, edge-length-controlled subdivision, duplicate/degenerate cleanup, non-manifold repair, and multiple subdivision schemes. The browser build uses the Three.js modifiers already shipped with Savanski plus Savanski-authored smoothing/repair logic instead of copying MeshLab source.

Implemented in the existing **Geometry** window:
- Mesh decimation with a user-selected retained-vertex percentage.
- Edge-length-driven adaptive tessellation with iteration control.
- Taubin-style alternating smoothing/inflation to reduce the volume shrinkage of plain Laplacian smoothing.
- Existing topology analysis, cleanup, welding, normals, subdivision, and uniformization remain available beside these additions.

Implemented in the existing **Avatar** window:
- Create a manual armature for an arbitrary selected mesh.
- Add child bones and edit bone name, parent, local position, and local rotation.
- Cycle-safe reparenting.
- Automatic four-influence skin weighting for the current armature, followed by the existing manual Weight Paint workflow.
- Existing quadruped auto-rig, pose copy/paste, inverse kinematics, bone influence visualization, and animation keyframing remain available.

Implemented in the existing **Paint** and **Scene** windows:
- Generate a normal map from the 1024×1024 paint canvas luminance.
- Generate a roughness map from paint-canvas luminance with optional inversion.
- Animation interpolation quality control for linear, stepped/hold, and smooth position/scale tracks while keeping quaternion rotation interpolation safe.

These additions strengthen the intended organic pipeline: **Home → create/open 3D project → Sculpt-Ready Ball → Grab/Snake Hook/Twist/detail sculpting → masks/symmetry/topology density work → texture/vertex/PBR painting → manual or quadruped armature → auto/manual weights → IK/pose → animation → export**. This is a capable browser-native workflow, not a claim of feature parity with Blender.

### Art / image-editing research translated into existing panels

Krita's Similar Color Selection model reinforced threshold/feather/grow-style perceptual selections, while its gamut-mask/color-selector documentation reinforced deliberate palette-limiting and harmony planning. Krita's filter-mask concept and Photopea's masks/adjustment-layer/layer-style model were also used as workflow references for keeping precision mattes and effects separate from basic drawing. Snapseed's HDR/Details, Healing, Selective, and Glamour Glow tools were reviewed for mobile-friendly photo-editing expectations.

Implemented in the existing **Image** window:
- Border-connected perceptual background matte erasing. It starts at the canvas boundary and removes only connected pixels within the selected CIE-Lab-style tolerance instead of deleting every similar-colored pixel in the subject.
- Adjustable edge feathering for the connected matte.

Implemented in the existing **Retouch** window:
- Selection Healing that interpolates surrounding visible pixels into the current rectangle/precision selection. This is local browser processing and does not use generative AI.

Implemented in the existing **Adjustments** window:
- HDR / Structure tonal treatment using browser-local luminance remapping and local-detail comparison.
- Adjustable Glamour Glow with radius, amount, saturation, and warmth.

Implemented in the existing **Gradient**, **Layers**, and **Layout** windows:
- Two-color luminance Gradient Mapping.
- Alpha clipping of the active layer to the alpha of the layer below, with normal history/undo support.
- Additional Contact Sheet, Masonry, and Loose Prints collage arrangements.

Together with the prior passes, Savanski now includes perceptual/connected erasing, layers and masks, selection refinement, brush dynamics, color harmonies/gamut planning, text/object transforms, arbitrary canvas/layer resize, retouching, curves/levels/HSL/tone controls, shadows/glows/reflections/motes, collage systems, and browser-local image cleanup without adding a new toolbar family.

### New WebAssembly helper

`script/savanski-pass3-kernel.wasm` is a small Savanski-authored browser computation kernel used by the third-pass tools for interpolation, Taubin smoothing math, smooth thresholds, tone mapping, brush weights, and color-distance helpers. `js/professional-pass3-wasm.js` loads it with JavaScript fallbacks.

No C, C++, or Python source is distributed in this release. External GPL applications were researched for workflows and algorithm concepts only; their implementation source was not copied into Savanski.

### Backend and Settings boundary

The frontend continues to use only the supplied tested endpoint:

`https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec`

No backend source file was created or modified. The existing Settings window and its Home/editor gear entry points remain the account, password-manager, session, storage purchase/Stripe, and install surface. No AI route was added.
