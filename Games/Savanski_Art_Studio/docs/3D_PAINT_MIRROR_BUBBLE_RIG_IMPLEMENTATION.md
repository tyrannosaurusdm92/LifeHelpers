# Savanski 3D Paint, Mirror Paint, and Bubble Rig Implementation

This pass extends the existing Savanski 3D Editor tool windows. It does not add a new toolbar or menu family.

## Existing Paint window additions

The Paint / Texture window now includes a **3D Volume Paint / Mirror Paint** section.

Volume-paint creation modes create editable mesh geometry from pointer, pen, or touch strokes:

- Add Volume
- Build
- Extend
- Fill

Surface-refinement modes operate on the selected/targeted mesh:

- Subtract Volume
- Smooth
- Inflate
- Deflate
- Pull
- Push
- Pinch
- Flatten
- Crease
- Sharpen
- Blend
- Carve
- Cut

Controls include brush size, depth, strength, hardness, falloff, spacing, stroke smoothing, and pointer-pressure influence.

### Mirror Paint

Mirror Paint can mirror live strokes across X, Y, or Z. Its symmetry plane can use the active model/object center or the world origin. Near the center plane, duplicate mirrored samples are suppressed so centerline construction does not deliberately create two identical samples.

The same Mirror Paint setting synchronizes the editor's existing sculpt-symmetry axis controls. Turning Mirror Paint off clears the synchronized sculpt symmetry, allowing independent asymmetrical refinement.

**Build Volume** reconstructs overlapping painted stroke samples as one continuous voxel-fused surface before normal generation, so mirrored centerline mass becomes one editable volume rather than a collection of visibly separate stroke objects. **Fuse Painted Volume to Selected** combines painted stroke geometry into an existing target mesh coordinate space so it can continue through Savanski's normal sculpt, material, paint, rig, animation, save, and export pipeline.

## Existing Avatar / Rigging window additions

The Avatar tool window now includes **Bubble-Based Rigging**.

### Continuous placement

1. Enable Bubble Rig.
2. Click the first joint.
3. Each following click places the next connected joint.
4. A click within the configured screen-space snap threshold (default 5 px) reuses an existing joint instead of creating a duplicate.
5. Placement continues from that shared joint.
6. Finish / Start New Branch ends the current chain; clicking an existing joint can then start a new branch from it.

Edges store actual shared joint IDs, so a snapped intersection is one graph node shared by every attached segment.

### Rig editing

- Drag joint bubbles in Edit mode.
- Select a connector and drag its orange midpoint handle to arc or bend it.
- Add configurable connector waves for wavy/irregular anatomical paths.
- Delete joints or individual bone connections.
- Reattach/merge joints.
- Mirror the selected outward branch or the whole rig across X/Y/Z.
- Save the rig as a dedicated **Rig Layer**.
- Select the Rig Layer and use the editor's normal Move / Rotate / Scale controls on the complete rig.
- Flip the saved rig on X, Y, or Z.
- Duplicate the rig layer.

Saved rig data lives in the Rig Layer's `userData`, so it is included in Savanski 3D project scene serialization.

### Applying a rig

**Apply Rig + Auto Weights** creates a Three.js bone hierarchy from the bubble graph, supports branch topology, generates normalized four-influence nearest-joint weights, and binds the target mesh or meshes contained in a selected group. The resulting SkinnedMesh remains compatible with Savanski's existing Weight Paint, IK, pose, animation timeline, and GLB animation export systems.

Curved/wavy connector paths are retained as editable anatomical rig guides. Skeletal deformation remains joint/bone based so existing skinning, IK, and animation tooling remains compatible.

## Organic workflow

A supported workflow is:

**Home → New 3D Project → 3D Paint → Mirror Paint → Build/Fuse Volume → Sculpt → Mirror Off → Asymmetry → Surface Paint/Materials → Bubble Rig → Save Rig Layer → Apply Rig/Weights → Weight Paint/IK → Pose → Animate → Export**

This also works with primitive-started models, imported models, sculpt-ready spheres, grouped meshes, and mixed primitive/painted construction.
