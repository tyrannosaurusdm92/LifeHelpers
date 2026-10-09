# Savanski Professional Pass — 2026-09-23

## UI invariant
No new menu family, toolbar family, or navigation family was created. New capabilities were added to the existing authoritative tool panels.

## Art Studio
- Precision color select + tolerance.
- Lift selection / lift matching color to movable layer.
- Precision color erase + feather.
- Interactive color wheel and harmony palette generation.
- Brush stabilization.
- Professional tone controls and detail filters.
- Bloom, shadow, glow, reflection, motes.
- Collage templates.
- Active layer resizing.
- Arbitrary canvas resize with anchoring.

## 3D Editor
- Dense sculpt sphere and cat blockout.
- Subdivide, smooth, seam centering.
- Crease, Clay, Scrape sculpt modes.
- Quadruped rigging, automatic weights, bone selection, skeleton helper.
- Transform keyframe animation timeline.
- Animation persistence and animated GLB export.
- Three-point lighting and shadow quality.
- Professional WASM math/geometry kernel.

## Home / projects
- Home controls creation/import/continuation for both Art and 3D.
- Unified IndexedDB library supports Art + 3D.
- Rename, duplicate, soft delete, restore, permanent delete, Empty Trash.
- Confirmation prompts protect delete/permanent-delete operations.
- 3D project save now writes into the same local project library rather than only downloading an export file.

## Backend
- Frontend service URL updated to the supplied Savanski backend.
- Client calls use the backend's project and binary storage contract.
- No AI frontend requests were added.

## Additional precision pass
- Color replacement with tolerance, feathering, and optional luminance preservation.
- Match active layer color balance to the nearest visible layer below.
- Luminance histogram and input/output Levels controls.
- Existing Avatar panel now includes a live skeleton-bone list for direct bone selection and posing; no new menu or toolbar was created.
- Browser-install metadata added under `assets/app/manifest.webmanifest` for static GitHub hosting.
## 2026-09-23 — Backend v3.0.1 Settings integration

- Kept the tested `Savanski_Backend_v3_0_1_30GiB_130USD.gs` external and unchanged; no backend source is bundled.
- Added/retained a Home Settings gear and a shared editor Settings gear immediately left of the light/dark toggle for both Art Studio and 3D Editor.
- Settings pop-out uses the existing Savanski tool-window visual language and supports backend-backed sign-up, sign-in, remembered sessions, show/hide password, signed-in password change, storage status, storage amount selection, Stripe payment link, storage-claim submission, and claim history.
- Storage selector exposes 1–30 GiB in one-GiB increments and prices from the backend's linear 30 GiB / $130 contract.
- Password recovery controls remain visible but disabled against v3.0.1 because that backend does not advertise forgotten-password verification/reset routes; the frontend does not fake recovery.


## 2026-09-23 — Professional Pass 2

### Existing-UI-only rule
- No new toolbar family, menu family, bubble, sidebar, or navigation system was added.
- All new Art controls were appended to existing Art panels.
- All new 3D controls were appended to existing 3D panels.

### Art additions
- Brush dynamics: spacing, scatter, flow, angle jitter, tip shape, and pointer pressure.
- Connected brush-mark selection and lift-to-movable-layer workflow.
- CIE Lab perceptual color-range selection and color-key erase.
- Precision selection grow/shrink/feather/invert/lift/erase/keep.
- Precision selection to layer mask; mask invert/feather/apply.
- Alpha refine and defringe.
- Curves, auto white balance, local contrast/structure, selective HSL, and color splash.
- Average-color sampler.
- Editable object alignment/distribution.
- Gamut-guided color palettes: complementary, split complement, triad, analogous, monochrome, dominant/accent.

### 3D additions
- Per-vertex sculpt masks with paint/erase/smooth/invert/clear.
- Grab, Snake Hook, and Twist sculpting.
- X/Y/Z symmetry and pointer-pressure-aware sculpting.
- Topology diagnostics and cleanup/uniformization helpers.
- Vertex-color painting.
- Manual skin-weight painting/influence visualization and normalization.
- Extended physical-material controls and texture map inputs.
- Animation key deletion/duplication, interpolation choice, motion path display.
- CCD inverse kinematics and pose copy/paste in the existing Avatar window.

### Project authority
- 3D toolbar New/Import routes now return to Home so project identity is always created/opened from Home.
- Asset/model drops inside an already-open project remain permitted as content imports.

### Packaging / install
- All WebAssembly binaries normalized into `script/`; no WASM remains in `js/`.
- Draco/Basis browser loaders updated to resolve the binaries from `script/`.
- Existing manifest/icons and Settings install-state UI retained for browser-supported installation/Add-to-Home-Screen workflows.


## Third professional pass — 2026-09-24

### Art Studio additions — existing panels only
- Border-connected perceptual background matte with ΔE tolerance and feathering.
- Selection Healing from surrounding visible pixels.
- HDR / Structure tone treatment.
- Adjustable Glamour Glow with radius, amount, saturation, and warmth.
- Luminance Gradient Mapping.
- Alpha clipping active layer to the layer below.
- Contact Sheet, Masonry, and Loose Prints collage layouts.

### 3D Editor additions — existing panels only
- Retained-percentage mesh decimation.
- Edge-length-driven adaptive tessellation.
- Taubin-style volume-preserving smoothing.
- Manual armature creation for arbitrary selected meshes.
- Child-bone creation; name/parent/position/rotation editing.
- Automatic four-influence weighting for the active manual armature.
- Paint-canvas → normal map generation.
- Paint-canvas → roughness map generation.
- Linear, stepped/hold, and smooth animation interpolation control.

### Runtime / WebAssembly
- Added `script/savanski-pass3-kernel.wasm` and `js/professional-pass3-wasm.js` with JavaScript fallback math.
- Added and activated `js/art-professional-pass3.js` and `js/uniform3d-professional-pass3.js` in `studio.html`.
- No external C/C++/Python source is bundled.

### Invariants preserved
- No new toolbar/menu/navigation family.
- Home remains the project creation/open/rename/duplicate/delete/recover authority for Art + 3D.
- Existing Settings surface and tested external backend endpoint remain in place; no backend file was created or modified.

## Professional Pass 4

- Extended 3D Paint with negative pre-build Subtract/Carve/Cut volume strokes.
- Added view-facing and world XY/XZ/YZ construction planes for drawing volume in space.
- Added signed voxel-field reconstruction and post-build surface relaxation.
- Added skin influence cleanup/limiting/normalization.
- Added multi-pass neighborhood weight smoothing.
- Added X weight mirroring with left/right bone-name remapping.
- Added editable per-bone angular joint limits and joint response.
- Added constraint-aware CCD IK using the existing IK target/chain controls.
- Added active-rig validation.
- Added luminance/chroma weighted precision selections.
- Added raster four-corner perspective warp.
- Added split toning and a full RGB channel mixer.
- Added luminance Blend If alpha compositing.
- Added `script/savanski-pass4-kernel.wasm`; no native source ships in the package.
- No new toolbar/menu/navigation family was introduced.

## Pass 7 — 2026-09-24
- Art Layout: perspective/ruler drawing assistants with optional stroke snapping.
- Art Layout: non-exporting project reference-image overlay.
- Art Retouch: selection-driven Smart Inpaint.
- Art Retouch: editable frequency-separation layers.
- 3D Sculpt: Face Set-style sculpt regions, picking, grow/shrink, masking, extraction.
- 3D Sculpt: curvature-derived and UV-stencil sculpt masks.
- 3D Paint: object-space normal, curvature/cavity, and height utility bakes.
- Pass-7 browser math WASM kernel.
- PWA cache advanced to v7 and includes new runtime modules.



## Pass 8 — 2026-09-24
- Added editable vector Pen/Bézier paths and vector-mask/selection conversion in existing Shapes.
- Added content-aware seam-carving layer scale in existing Transform.
- Added surface-snapped manual retopology / Poly Build workflow in existing 3D Geometry.
- Added sculpt-mask / Face-Set-aware pose deformation in existing 3D Sculpt.
- Added Savanski Pass-8 WASM math kernel and advanced service-worker cache to v8.
