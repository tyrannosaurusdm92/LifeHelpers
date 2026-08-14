# Development Tools

- `audit_canonical_fbx.js` — non-destructive FBX/geometry/skinning inspection using the bundled Three.js FBX loader; writes `development/audits/fbx_runtime_audit_latest.json`.
- `blender_build_onyx_shape_keys.py` — Blender-side nondestructive shape-key construction. Does not export a replacement FBX.
- `onyx_measurement_jig.scad` — OpenSCAD scale-reference generator. The generated STL is in `development/reference/`.

Never run automatic topology-cleaning against the only canonical FBX. Work on duplicates and compare hashes, vertex counts, UVs, skeleton hierarchy, weights, animations and appearance before promotion.
