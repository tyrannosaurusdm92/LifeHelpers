# Current Cat Only Build vs Dossier Desired State

This is a **comparison document, not an implementation report**. “Current” means what the uploaded `Onyx_Cat_Only_relative_room_scale_pass` contains today. “Desired” means the dossier's intended later target. No change is made by this document.

| Area | Current Cat Only build | Dossier desired state | Gap / decision before future work |
| --- | --- | --- | --- |
| Global scale | Real-world calibration, 1 world unit = 1 meter; model scale `0.000775003`; physics mass ~12.25 kg / 27 lb. | Real Onyx scale is canonical; ~27 lb and supplied measurement ranges must remain stable. | **Strong alignment. Freeze global scale unless new hard measurements prove it wrong.** |
| Base mesh | Existing SmellyCat-derived FBX, rig, eye spheres, embedded locomotion clips. | Onyx must remain recognizably himself and natural-cat anatomically. | Existing topology/rig can remain an implementation base, but dossier does not declare this FBX itself canonical. |
| Shoulders/chest | Runtime geometry morph broadens shoulders/chest. | Wide stocky shoulders, broad-ish muscular chest, visible mass. | Direction aligns, but exact amount is still experimental. Judge against real Onyx refs, not current code constants. |
| Mid-body | Current shape pass intentionally restored substance after an earlier over-slim waist. | Long, substantial, sleek rather than fluffy; not kitten-narrow. | Do not reintroduce waist pinching merely to make him look sleek. |
| Primordial pouch | Runtime vertex-selected pouch plus procedural sway exists. | Low-hanging pouch that compresses, swings, lags, bounces, and settles naturally. | Concept aligns, but dossier target is richer soft-tissue behavior. Current vertex mask/sway is an approximation, not final canon. |
| Eyes | `Sphere`/`Sphere001` moved forward and modestly enlarged; green-yellow texture and capped emissive support. | Visible green-gold eyes; not sunken or lost in shadow. | Direction aligns. Future approval should focus on socket depth, eyelid/face integration, iris scale, and natural catchlight. |
| Nose | Current code deforms nose-weighted vertices and adds a small bone-parented nose plane. | Clearly sculpted black/charcoal feline nose with bridge and nostril form. | Current solution is a prototype. Desired endpoint is integrated 3D facial anatomy, not an obvious add-on plane. |
| Mouth/muzzle | Current code adds muzzle/chin deformation plus procedural W-shaped mouth curves. | Readable feline muzzle and mouth planes; not a flat seam. | Current curves are a prototype. Desired endpoint is face geometry/shading that reads correctly from all approved angles. |
| Whiskers | 14 procedural Catmull-Rom whiskers, mostly white, asymmetrical. | Mostly white with silver/smoky variation; naturally curved, non-rigid. | Good conceptual direction. Future evaluation should check root placement, taper, natural sag/arc, density, and interaction with face motion. |
| Fur color | Runtime render-fix uses neutral near-black albedo and sRGB handling to avoid gray lift. | Predominantly true black; charcoal only as highlight response; subtle senior speckle. | Base direction aligns. Current simplified runtime material omits some dossier-intended normal/roughness/senior-detail semantics because earlier maps caused artifacts. |
| Fur detail | Current body renderer deliberately removed runtime normal/roughness maps to stop silver-white streaks. | Sleek black with controlled fur normal/roughness, sparse age speckle, grizzled chest/belly variation. | **Known future material gap.** Reintroduce detail only with corrected UV/material behavior, never at cost of “black first.” |
| Paw/ear/nose detail maps | Source maps preserved but not actively trusted at runtime after UV-localization failures. | Paw-pad, inner-ear, nose, sparse underfur/belly-skin detail should be readable and correctly localized. | Requires model-specific material/UV solution later. Do not globally paint these maps onto incorrect UV regions. |
| Tail | Existing FBX tail retained. | 13–16 in, long, relatively thin, strong taper, natural follow-through. | Confirm final tail length/shape against real scale and motion references; add richer follow-through only after body is approved. |
| Locomotion | Current viewer primarily uses embedded walk/run-era FBX material plus simple procedural secondary motion. | Full natural-cat animation library with readable anticipation/reactions and heavy-but-agile body behavior. | Large future animation gap. Preserve natural quadruped rule. |
| Ordinary camera | Development viewer has unrestricted 360 orbit, top/bottom inspection, zoom. | Ordinary game uses limited 2.5D presets; no unrestricted free orbit/walkthrough. | **Intentional context difference.** Keep free orbit as developer inspection tooling; do not mistake it for final ordinary-play camera. |
| Projection/look | Current inspection viewer uses a conventional perspective inspection camera. | Orthographic or restrained low-FOV perspective, stable scale, limited parallax, silhouette-first staging. | Future runtime presentation work only, after Onyx itself is approved. |
| Room | Current build contains a 12 × 14 × 8 ft blank calibration room with rulers/grid. | Dossier later describes an approximately 14 × 16 ft canonical room and eventual apartment expansion. | **Do not change now.** Current room is a ruler/testing environment, not the final room. |
| Texture source | Cat Only bundles local texture assets for standalone inspection. | Full OurSpace runtime resolves current textures from `OurSpace/Onyx/Textures` through the canonical backend; dossier avoids a competing texture store. | Intentional development/runtime distinction. Do not remove Cat Only local inspection assets solely to mimic deployment architecture. |
| User profiles | Cat Only has no William/Jasper private-data/runtime profile system. | William/Jasper are distinct authenticated profiles sharing one canonical Onyx, with strict private-data separation. | Correctly out of scope for Cat Only appearance work. Document now, integrate later in full game. |
| Needs system | Cat Only viewer does not implement a survival-motive loop. | Onyx must remain fully needs-free and nonpunitive. | Preserve this. Do not introduce motive meters while expanding behavior. |

## Highest-priority visual gaps to discuss before any later code change

1. **Silhouette/body mass** — confirm broad shoulders + substantial long torso + low pouch without making him globally round or artificially skinny.
2. **Face anatomy** — eye socket depth, muzzle/whisker pads, integrated nose, chin and mouth planes.
3. **Black material behavior** — black first, detailed second; restore fur detail only when it does not turn him gray or streaky.
4. **Pouch motion** — localized soft-tissue lag/sway rather than whole-torso wobble.
5. **Whisker naturalism** — curved, tapered, irregular, mostly white, correctly rooted.
6. **Paws/tail** — verify scale and secondary motion after the torso/face are approved.
7. **Animation library** — only after the approved body no longer needs major reshaping.
8. **Final 2.5D camera** — after the cat itself is approved; developer orbit remains useful until then.

## Important interpretation rule for the dossier contact sheet

The contact sheet is useful for:

- front / profile / 3-quarter readability,
- expression staging,
- attitude,
- natural-vs-Professor pose distinction,
- eye visibility,
- overall black-cat read.

It is **not** a literal body-volume override. If a contact-sheet cat looks slimmer than the textual ~27 lb, broad-chested, stocky-shouldered, pouch-bearing canon, the textual canon and real Onyx references win.
