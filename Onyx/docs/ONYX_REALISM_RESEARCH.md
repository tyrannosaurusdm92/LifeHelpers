# Onyx Realism Research Pass

## Target phenotype

Onyx is intentionally **not** a purebred Maine Coon recreation. The target is a sleek domestic-shorthair/short-medium-haired black cat whose *structure* borrows selected big-cat/Maine-Coon traits: long body, broad chest, strong forequarters, substantial build, and a slightly broader tom-cat head. The coat remains close to the body with no mane, ruff, britches, or fluffy tail added.

He also gets a visible low abdominal/primordial-pouch silhouette and mostly white whiskers.

## Anatomy and breed research used

- Cat Fanciers’ Association Maine Coon standard: muscular, broad-chested, medium-to-large, long rectangular body; substantial legs; slightly longer-than-wide head with a visibly square muzzle.
- The International Cat Association Maine Coon standard/overview: broad chest, substantial boning, long hard-muscled rectangular body.
- English (1978), *Functional analysis of the shoulder girdle of cats during locomotion*: feline scapular rotation plus forward/back and vertical translation contributes to step length. This supports keeping the front assembly visually active instead of treating the shoulder as a rigid dog-like hinge.
- Boczek-Funcke et al. (1996), X-ray kinematic analysis: cat scapula motion includes fore/aft translation, vertical movement, ab/adduction, and small axial rotations. The current pass therefore adds only subtle secondary spine motion while leaving the original walk as the primary animation rather than overdriving individual limbs.

## GitHub dive

### leixingyu/autoRigger

The quadruped template is structurally useful because it treats the animal as distinct front legs, rear legs, flexible quadruped spine, tail, neck, head, and head tip, rather than as a stretched biped. Its `SpineQuad` uses a multi-segment IK chain. That matches the direction needed for future Onyx work: spine flexibility and shoulder/hip systems should remain first-class rig components.

Files reviewed:
- `template/quadruped.py`
- `chain/spine/spineQuad.py`

### catprisbrey/Rigodotify

Useful for the game-engine side of the research: it emphasizes simplifying/exporting animation rigs into stable engine-friendly skeletal hierarchies and avoiding scale/jitter problems during retargeting. No code or assets were copied into this package.

### teamneoneko/Cats-Blender-Plugin / original Cats Blender Plugin

Reviewed primarily as model-cleanup/export research. It is avatar-focused rather than feline-specific, so its code was not transplanted. The useful takeaway is to keep material/armature cleanup separate from the character-shape pass.

## What changed in this package

1. **Broad shoulders and chest** – localized vertex reshaping around the front ribcage. This is geometry shape, not fluffy fur volume.
2. **Sleek waist** – mild narrowing behind the ribcage so the stronger front does not make him barrel-shaped.
3. **Low tum tum** – lower abdominal vertices are displaced down and slightly out in a smooth bell-shaped region, creating a hanging primordial-pouch silhouette that remains skinned to the original rig.
4. **Slightly broader tom-cat face** – restrained head/muzzle widening.
5. **Mostly white whiskers** – twelve curved tube whiskers parented to the actual `Nose` bone so they follow head movement. Ten are white/pale and two are charcoal.
6. **Feline secondary motion** – very small spine counter-motion and tail sway is layered *after* the FBX walk mixer while moving. This is intentionally subtle.
7. **Black-coat rendering retained** – no long-hair geometry, ruff, ear tufts, britches, or fluffy tail were introduced.

## Deliberate limits of this pass

This is a runtime anatomy/motion pass over the existing FBX, not a full Blender resculpt/re-weight. The existing mesh topology, skeleton, and embedded walk remain the foundation. A future true sculpt pass could improve paw anatomy, scapular skin sliding, jaw/cheek topology, ear cartilage, toe spread, and a physically simulated primordial pouch, but those changes require editing and re-weighting the source mesh itself rather than safely layering runtime deformations.

## Source URLs

- https://cfa.org/breed/maine-coon-cat/
- https://tica.org/breed/maine-coon/
- https://pubmed.ncbi.nlm.nih.gov/642016/
- https://pubmed.ncbi.nlm.nih.gov/8714697/
- https://github.com/leixingyu/autoRigger
- https://github.com/catprisbrey/Rigodotify
- https://github.com/teamneoneko/Cats-Blender-Plugin-Unofficial-
