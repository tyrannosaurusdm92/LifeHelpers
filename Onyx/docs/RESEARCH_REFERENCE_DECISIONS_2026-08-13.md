# Research/reference decisions — 2026-08-13

The supplied external models are **references, not replacement Onyx assets** unless licensing and technical fit are both clear.

- **SmellyCat**: canonical lineage. Onyx's protected `cat.fbx`/`cat.bin` match the published SmellyCat cat asset from the original project. Useful geometry/rig foundation; crude game controller is not retained as the animation target.
- **ArtStation Qrreox / Guillaume Bolis cat**: visual production reference for a compact Blender/Substance workflow and believable stylized domestic-cat silhouette. No asset copied.
- **Sketchfab Cat Anatomy**: musculature-only visual reference, especially shoulder girdle, pectoral/serratus transitions, abdomen and hindquarter silhouette. No mesh copied; the page is marked NoAI.
- **CGTrader cat references**: used to compare topology density, rig/PBR expectations and domestic-cat silhouette. No commercial/unclear-license mesh is bundled.
- **zxhuang1698/cat-3d**: MIT code repository for category-level shape learning, not a cat mesh library. The useful concept here is nearest-surface Chamfer/F-score evaluation; `development/tools/compare_surface_points.py` adapts that *evaluation idea* to base-vs-corrected Onyx. No repository model/data/code is copied.
- **Blender**: shape keys/corrective-shape workflow informs the included Blender tool. The tool creates named relative shape keys over the canonical topology.
- **MeshLab**: inspection/measurement/manifold/normal concepts inform read-only geometry audits. MeshLab is not installed in this execution environment, so no claim is made that a MeshLab executable modified or validated the model.
- **OpenSCAD**: procedural measurement/reference geometry is actually executed here; `onyx_measurement_jig.scad` is rebuilt into `onyx_measurement_jig.stl` during validation.
- **Sims 3 Pets / Sims 4 Cats & Dogs**: interaction-language reference only: layered pet sculpt controls, readable anticipation/reaction, idle variety, direct manipulation and living autonomous presentation. EA assets/code are not included and motive/needs systems are explicitly rejected by the Onyx dossier.
