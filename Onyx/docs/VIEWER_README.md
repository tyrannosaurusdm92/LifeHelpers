# Onyx Cat Viewer

Open `index.html` directly in a modern desktop browser. No batch file, localhost server, or installation step is required.

The viewer keeps the original SmellyCat `cat.fbx`, embedded walking animation, and third-person movement approach, while calibrating the root model scale and physics mass to Onyx's supplied real measurements. The rendering layer remains corrected specifically for Onyx.

## Controls

- W / Up: forward
- S / Down: backward
- A / Left and D / Right: turn using the original SmellyCat mapping
- Shift: faster movement
- Space: jump
- Pointer drag: rotate the inspection camera
- Horizontal drag: unrestricted 360-degree orbit around Onyx
- Vertical drag: move from top-down to underside inspection
- Mouse wheel: zoom in/out
- R: reset Onyx and the inspection camera
- M: hide/show the real-world measurement guides

## Rendering-fix pass

The documented screenshots in `rendering issues screenshots/` were audited before this pass. The corrected runtime prioritizes sleek neutral-black fur, removes the incorrect purple paw/ear composite from live rendering, suppresses the strong silver-white highlight streaks, forces full opaque/double-sided body coverage, and makes the green-yellow eye spheres more visible.

See `docs/RENDERING_FIX_PASS.md` for the technical audit and fixes.


## Onyx realism pass

The viewer now applies a runtime anatomy pass for broad forequarters, a sleek waist, a low abdominal pouch, subtle head/muzzle broadening, mostly-white bone-parented whiskers, and restrained feline spine/tail secondary motion while preserving the corrected black-fur renderer and inspection camera. See `docs/ONYX_REALISM_RESEARCH.md`.


## Real-world scale / measured calibration room

- 1 Three.js / Ammo unit = 1 meter.
- Onyx root scale = `0.000775003`, derived from a 23.5 in nose-to-tail-base midpoint.
- Onyx physics mass = ~12.25 kg / 27 lb.
- Calibration room clear interior = **12 ft W × 14 ft D × 8 ft H**.
- Floor grid = 1 ft squares with stronger 5 ft lines.
- Wall ruler = 1 ft increments.
- Human reference = 5 ft 4 in height only. No body width or wheelchair dimensions are invented from weight.
- Onyx references = 14 in shoulder marker and 38 in normal-overall-length floor bar.

The calibration room is deliberately measured for scale testing; it is not a claim about the user's real physical room dimensions. See `docs/REAL_WORLD_SCALE.md`.
