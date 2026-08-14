# Rendering Fix Pass

This pass was made after auditing every screenshot in `rendering issues screenshots/` and then inspecting the FBX structure directly with the bundled FBX loader.

## Confirmed causes

- The `Cat` skinned mesh exposes three material names, but its geometry has only **one active material group**, and that group uses material index 0 (`skin`). This means detail textures cannot be safely assigned as if separate paw, ear, or nose materials exist.
- The previous composite albedo placed purple paw/ear detail into guessed UV regions. The screenshots showed those details landing on the outside of feet/legs instead of only on pads or inner ears.
- The previous runtime normal/roughness stack created strong specular streaks and bright silver-white patches on the back, shoulder, head, and spine under the viewer lights.
- The eye mesh named `eye` has zero rendered vertices in this FBX. The two rendered eye objects are `Sphere` and `Sphere001`, so those are now the only runtime eye targets.
- The previous mouse-follow camera did not provide a dependable inspection orbit.

## Fixes applied

- Runtime body texture now uses a neutral-black, highlight-compressed version of the supplied fur albedo.
- Purple paw/ear/nose compositing was removed from the runtime material. Source maps are preserved untouched for later work if the model receives explicit UV/material regions.
- Runtime body normal and roughness maps were removed to eliminate the documented silver-white streaks while preserving fur strand detail in the albedo itself.
- Body material is fully opaque, double-sided, depth-tested/depth-writing, and animated-mesh frustum culling is disabled.
- Eye sphere textures were rebuilt from the supplied green-yellow iris so the eyes remain clearly green-yellow from normal viewing angles. Emission is capped to avoid glare.
- Camera uses pointer-drag orbit with pointer capture, full horizontal rotation, top-down and underside inspection, and mouse-wheel zoom.

The screenshots remain in the package as the issue reference used for this pass.
