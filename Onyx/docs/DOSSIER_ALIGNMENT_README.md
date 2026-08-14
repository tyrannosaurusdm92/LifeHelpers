# Onyx Cat Only — Dossier Alignment Notes

## Scope of this revision

This package is a **documentation-only reconciliation** between:

1. the current `Onyx_Cat_Only_relative_room_scale_pass` development viewer, and
2. `Onyx_Cozy_Psychiatric_Game_Dossier_2_5D_Backend_Clean`.

**No existing Onyx implementation file was intentionally changed.** No FBX, texture, JavaScript, HTML, physics, animation, camera, calibration-room geometry, vendor runtime, screenshot, or existing documentation file was edited in this pass. Only the new `DOSSIER_*` documentation files were added.

This package should therefore be used as a planning/reference checkpoint, not as a claim that the current Onyx model has already been altered to satisfy the dossier.

## Authority hierarchy for future Onyx work

When sources disagree, use this order:

1. **Real Onyx references + confirmed real measurements** — highest visual/body authority.
2. **Dossier canonical text**, especially `data/onyx_visual_spec.json` and the canonical scale/body section in the dossier.
3. **Dossier animation pose images** — expression, attitude, staging, and silhouette references; not permission to contradict canonical body mass or proportions.
4. **Current Cat Only implementation** — an experimental technical baseline to compare against canon, not canon merely because it exists in code.
5. **External game references** such as The Sims 2–4, Coral Island, Palia, EverQuest II, and Finch — implementation/design-language inspiration only.

The dossier explicitly says the pose PNGs are attitude/silhouette references and that ordinary poses that become too anthropomorphic must be translated back into natural feline anatomy. Therefore a slender-looking pose image must **not** override the canonical ~27 lb body, broad chest/shoulders, or low primordial pouch.

## Three different contexts must stay separate

### A. Cat Only development/inspection viewer

Purpose: inspect Onyx, compare shape/material/rig behavior, verify real scale, and find rendering defects. A free 360-degree orbit camera is appropriate here because it is a developer inspection tool.

### B. Final ordinary Onyx game presentation

Purpose: the dossier's fully 3D world presented through a restrained 2.5D camera language. Ordinary play explicitly excludes unrestricted free orbit and free walkthrough. Approved camera presets, stable scale, restrained parallax, and silhouette-first staging are the target.

### C. Future room / apartment systems

Purpose: later work only. The dossier's canonical room note is approximately 14 × 16 ft, with accessible routing and furniture that fits Onyx's real measurements. This documentation pass does **not** build or alter the room.

## Key local dossier sources used for these notes

- `data/onyx_visual_spec.json`
- `data/onyx_camera_2_5d.json`
- `data/onyx_animation_features.json`
- `data/onyx_behavior_graph_needs_free.json`
- `data/onyx_login_climate_ritual.json`
- `data/traits.json`
- `docs/ONYX_ANIMATION_IMPLEMENTATION.md`
- canonical/profile/accessibility sections of the dossier `index.html`
- `assets/onyx_animation/animation_contact_sheet.jpg`

## What this package does NOT authorize

These notes do not authorize silently changing Onyx's:

- body proportions or weight,
- face, muzzle, nose, eyes, or whiskers,
- coat, age details, or texture source,
- tail or paws,
- rig, physics, gait, or animation,
- personality or relationships,
- service/support history,
- scale,
- user/profile behavior,
- room geometry.

Future changes should be deliberately reviewed against `DOSSIER_CURRENT_BUILD_VS_DESIRED.md` and approved in small stages.
