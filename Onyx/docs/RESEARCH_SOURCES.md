# Research Sources Used for This Onyx Pass

These sources were used for technique/workflow understanding only. No proprietary Sims assets or code are redistributed.

## Blender

- Blender Manual, Shape Keys introduction / Relative Shape Keys: https://docs.blender.org/manual/en/latest/animation/shape_keys/introduction.html
- Blender Manual, Shape Keys panel and workflow: https://docs.blender.org/manual/en/latest/animation/shape_keys/shape_keys_panel.html
- Blender Manual, Blend from Shape: https://docs.blender.org/manual/en/latest/modeling/meshes/editing/vertex/blend_shape.html

Applied lesson: keep the canonical mesh as Basis and express anatomy/pouch/face changes as independently blendable vertex-position deltas.

## MeshLab

- MeshLab cleaning plugin source: https://github.com/cnr-isti-vclab/meshlab/blob/master/src/meshlabplugins/filter_clean/cleanfilter.cpp
- MeshLab selection plugin source: https://github.com/cnr-isti-vclab/meshlab/blob/main/src/meshlabplugins/filter_select/meshselect.cpp

Applied lesson: non-manifold/border inspection is useful, but repair operations such as splitting vertices/removing faces/merging duplicates can change topology. Canonical Onyx is therefore audited without automatically applying those filters.

## ufbx

- ufbx repository: https://github.com/ufbx/ufbx

Applied lesson: use a future higher-fidelity FBX audit/conversion path that understands skinning, blend shapes, animation evaluation, and CPU skinning before writing a replacement FBX.

## OpenSCAD

- OpenSCAD cheat sheet: https://openscad.org/cheatsheet/

Applied lesson: use procedural cubes/transforms for dimension bars and debug reference geometry, not for sculpting the cat.

## The Sims pet-creation workflow references

- EA, The Sims 4 Cats & Dogs / Create A Pet features: https://www.ea.com/games/the-sims/the-sims-4/buy/addon/the-sims-4-cats-and-dogs
- EA Pet Lovers Bundle feature description with direct feature manipulation and coat patterns: https://www.ea.com/games/the-sims/the-sims-4/buy/addon/the-sims-4-pet-lovers-bundle
- YouTube, The Sims 4 Cats & Dogs - Create a Pet: https://www.youtube.com/watch?v=p8jBtMTDRqk
- YouTube, The Sims 3 Pets - Pet Markings Tutorial: https://www.youtube.com/watch?v=B_MMdQ7k_u0
- YouTube, How To Fully Edit An Existing Pet - The Sims 4: https://www.youtube.com/watch?v=TbGepz03zd4

Applied lesson: preserve a recognizable base animal while adding independent body/head/detail controls and coat layers. The package imitates that layered workflow idea, not proprietary implementation.

## Feline locomotion / anatomy

- Boczek-Funcke et al., "Kinematic analysis of the cat shoulder girdle during treadmill locomotion: an X-ray study," PubMed PMID 8714697: https://pubmed.ncbi.nlm.nih.gov/8714697/
- Brown et al., "A three dimensional multiplane kinematic model for bilateral hind limb gait analysis in cats," PLOS ONE: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0197837
- Zubair et al., "Head movement during walking in the cat," PubMed PMID 27339731: https://pubmed.ncbi.nlm.nih.gov/27339731/

Applied lesson: shoulder/scapula, hindlimb, spine and head motion should be treated as coordinated 3D locomotion rather than a rigid quadruped translation.

## Whiskers

- Luo & Hartmann, "On the intrinsic curvature of animal whiskers," PLOS ONE (includes cat whiskers): https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0269210

Applied lesson: use tapered-looking curved/asymmetric trajectories rather than straight, perfectly parallel rods.
