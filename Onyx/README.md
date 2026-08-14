# SmellyCat 🐈
Smelly Cat is a WebGL Experiment inspired from Bedroom in Arles by Vincent van Gogh

# Built With

- WebGL
- Three.js
- Ammo.js

# Developers
| <img src="https://avatars0.githubusercontent.com/u/22966899?s=460&v=4" width="100"/> | <img src="https://avatars3.githubusercontent.com/u/44427408?s=460&v=4" width="100"/> | <img src="https://avatars1.githubusercontent.com/u/46752246?s=460&v=4" width="100"/> |
| --- | --- | --- |
| [Defne Tunçer](https://github.com/defnetuncer98) | [Kutay Barçin](https://github.com/Krykutay) | [Baran Ekin Özdemir](https://github.com/BaranEkin) |

![](SmellyCat.gif)


## Cat shape pass

This revision adds the corrected abdominal pouch + sway, fuller stocky-sleek torso, forward-set green-yellow eyes, nose/mouth sculpt details, more naturally curved mostly-white whiskers, and corrected sRGB decoding so the coat remains genuinely black. See `docs/ONYX_CAT_SHAPE_PASS.md`.

## Real-world relative room scale pass

This revision places Onyx and the blank calibration room on an explicit real-world scale: 1 world unit = 1 meter, Onyx is calibrated from the supplied 23.5 in nose-to-tail-base midpoint at `MODEL.scale = 0.000775003`, and his physics mass is ~12.25 kg / 27 lb. The calibration room is 12 ft × 14 ft × 8 ft with a 1 ft floor grid, height ticks, a 5 ft 4 in human reference, a 14 in Onyx shoulder reference, and a 38 in Onyx length bar. Press `M` to toggle measurement guides. See `docs/REAL_WORLD_SCALE.md`.

## 2026-08-13 Onyx-specific correction pass

The dossier-documented cat remains canonical. This revision adds nondestructive runtime morph layers, improved pouch secondary motion, deliberate Walk/Run clip use, enhanced whiskers, and a substantially stronger inspection UI without exporting a replacement FBX.

Start with `docs/ONYX_SPECIFIC_CORRECTION_PASS.md` and `docs/MODEL_LINEAGE.json`.

The visible 12 × 14 × 8 ft shell is a **scale/debug environment only**, not the finished Onyx room. The current package now includes the dossier behavior/progression contracts and an optional Apps Script runtime bridge, while deliberately avoiding fabrication of the finished apartment or full support/psychiatric conversation product before the cat foundation is ready.

## 2026-08-13 full dossier + viewer-recovery pass

The newest pass is documented in:

- `docs/ONYX_FULL_DOSSIER_IMPLEMENTATION_PASS.md`
- `docs/VIEWER_RECOVERY_AND_BACKEND_CONTRACT.md`
- `docs/RESEARCH_REFERENCE_DECISIONS_2026-08-13.md`
- `docs/OURSPACE_RUNTIME_CONTRACT.md`

The earlier note saying the Apps Script/backend was not integrated is superseded: the cat-only viewer now contains an **optional, failure-isolated runtime bridge** matching the attached backend contract. The finished room and full support/psychiatric conversational product are still not fabricated here; this package supplies the canonical cat, animation/behavior/progression contracts, inspection tooling and host API they will use.

## 2026-08-13 direct-open viewer hotfix

A Windows/Chrome `file:///.../index.html` startup regression was reproduced from the supplied screenshot and repaired. The Ammo runtime can resolve its thenable synchronously; viewer boot is now deferred until every top-level viewer declaration has initialized. This specifically prevents the `MORPH_INSPECTION_CONTROLS before initialization` crash while preserving the cat/body/dossier/backend work from the full implementation pass.

See `docs/VIEWER_DIRECT_OPEN_HOTFIX_2026-08-13.md` and `development/audits/direct_open_startup_regression_test.txt`.

## 2026-08-13 repair-the-repair movement recovery

The user-supplied older `Onyx_Cat_Only_dossier_documented(5)` build is now preserved as a **movement donor**, not as a replacement for the current viewer.

The viewer defaults to **Recovered classic motion**, which restores the older build's source-Walk-driven locomotion, slow/heavy travel feel, quick steering, restrained spine/tail overlay, and pouch sway while keeping the newer phased feline jump, direct-open startup repair, physics fallback, body/eye/chest corrections, dossier systems, backend bridge, and inspection controls.

Use the new **Movement** selector to compare `Recovered classic motion` against `Enhanced living motion` directly.

See `docs/ONYX_REPAIR_THE_REPAIR_MOVEMENT_RECOVERY_2026-08-13.md`.


## 2026-08-13 single-canvas control recovery

A direct-open Ammo bootstrap bug could instantiate two full-screen viewers, leaving the visible Onyx frozen while global controls/rendering pointed at the other canvas. The viewer now hard-guarantees one boot, one renderer canvas, and one animation loop. Drag/orbit and WASD/arrow movement are recovered against the user-supplied `dossier_documented(4)` control donor.

See `docs/ONYX_SINGLE_CANVAS_CONTROL_RECOVERY_2026-08-13.md`.
