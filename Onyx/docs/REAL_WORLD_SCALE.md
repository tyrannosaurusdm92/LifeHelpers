# Real-World Scale / Relative Room Pass

## Purpose

This pass puts the blank Onyx viewer onto a real measurement system. It does **not** claim to know the dimensions of the user’s physical room. Instead, it provides a measured calibration room so Onyx, a 5 ft 4 in human reference, and future wheelchair/room assets can all share one consistent scale.

## World units

- **1 Three.js / Ammo world unit = 1 meter**
- 1 ft = 0.3048 m
- 1 in = 0.0254 m

## Onyx calibration

Supplied real measurements:

- Weight: ~27 lb (~12.25 kg)
- Nose to tail base: 22–25 in, midpoint used for scale = **23.5 in**
- Tail: 13–16 in, midpoint reference = **14.5 in**
- Normal overall length: 35–41 in, reference = **38 in**
- Fully stretched: 38–44 in, reference = **41 in**
- Shoulder height: 13–15 in, reference = **14 in**
- Chest/body width: 10–12 in, reference = **11 in**
- Curled sleeping footprint: 18–21 × 12–15 in, midpoint reference = **19.5 × 13.5 in**

The FBX body has a raw nose-front to tail-base longitudinal span of approximately 7.702 mesh units and the Cat node carries an internal scale of approximately 100. Mapping that span to 23.5 inches gives a viewer root scale of approximately **0.000775003** when one world unit is one meter.

At this scale the model’s paw-to-shoulder region is about 15 inches in the bind-pose geometry and the modeled tail chain plus tip falls in the supplied 13–16 inch region. This is why this pass changes the global cat scale instead of stretching the mesh to make it “look bigger.”

Physics mass is also now SI-calibrated to approximately **12.25 kg** rather than the previous arbitrary mass of 10. The cat collision body uses the real body width, shoulder height, and nose-to-tail-base length; the tail is excluded from the collision box.

## Relative calibration room

The old blank room was an 8 × 8 world-unit box. Once the cat is put on a meter-based real scale, that would be roughly 26 ft × 26 ft, which is far too large to be a useful everyday human/cat scale reference.

The viewer now uses a deliberately measured **12 ft wide × 14 ft deep × 8 ft high clear interior calibration room**. This is a reference/test room, not a statement that the user’s physical room has those dimensions. Walls are 4.5 in thick and sit outside the clear dimensions; the floor slab is 6 in thick with its top at y=0.

### Visual measurement guides

- 1 ft floor grid
- stronger line every 5 ft
- 1 ft wall-height ticks
- wall marker at **5 ft 4 in** for the user’s stated height
- wall marker at **14 in** for Onyx’s reference shoulder height
- floor scale bar at **38 in** for Onyx’s normal overall reference length
- press **M** to hide/show all measurement guides

## Human and wheelchair reference rule

The user’s supplied human anchors are **5 ft 4 in**, approximately **500 lb**, with a long torso and a custom-sized wheelchair. Photos/videos of Onyx on the wheelchair and in the user’s arms are useful for checking that the relationship between Onyx and a seated adult does not look absurd.

However, weight alone does not determine body width, seated height, chair seat width, chair overall width, wheelbase, or reach. This pass therefore does **not** invent those numbers. If exact wheelchair dimensions are supplied later, they can be entered directly in meters/inches and will line up with this room without rescaling Onyx again.
