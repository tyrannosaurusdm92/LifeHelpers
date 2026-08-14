# SmellyCat Cat-Only Extraction

This package contains only the cat-related assets and behavior references extracted from the supplied SmellyCat project. It intentionally does not contain the playable game.

## Included

- `models/fbx/cat.fbx` — complete skinned cat model with embedded skeleton/animation clips and embedded eye/material definitions.
- `models/fbx/cat.bin` — associated cat data blob found beside the FBX in the original source. The FBX does not reference this filename directly, but it is preserved because it is cat-specific source material.
- `textures/fur/onyx.png` — compatibility copy of the current pass-2 composite Onyx fur albedo.
- `textures/onyx/` — full new Onyx texture pack plus derived runtime composite/eye maps.
- `source-excerpts/cat-code-excerpts.txt` — verbatim cat-specific sections of the original `smellycat.js`, with unrelated game logic omitted.
- `README.md` — the original project README, preserved byte-for-byte.
- `docs/CAT_ASSET_MANIFEST.json` — technical inventory of meshes, materials, animation clips, and movement values.
- `docs/LICENSING_STATUS.md` — records that no standalone license file was present in the supplied archive.

## Not included

No HTML game, score/timer logic, game-over logic, room/props, bird/vase assets, sound/music, GIF gameplay captures, or bundled Three.js/Ammo.js runtime libraries are included.

## Fur variants

The original extraction began with one external fur texture. Texture pass 2 adds the supplied Onyx albedo, AO, normal, roughness, inner-ear, nose, paw-pad, whisker, iris, and emissive maps while retaining `textures/fur/onyx.png` as a compatibility path.

## Viewer added in this package

`index.html` + `viewer.js` provide an isolated blank-room cat viewer. See `VIEWER_README.md`.
