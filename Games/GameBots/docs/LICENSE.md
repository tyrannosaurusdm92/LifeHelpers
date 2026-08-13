# GameBots License and Third-Party Notice

## LifeHelpers GameBots code

This package does **not** choose a new license on behalf of the LifeHelpers repository owner. The original GameBots code created for this package should follow the license selected for the parent LifeHelpers project/repository.

No third-party GitHub project was copied wholesale into this package. The implementation is a purpose-built GameBots framework informed by common game-AI techniques and the public projects listed in `THIRD_PARTY_SOURCES.md`.

## Referenced MIT-licensed projects

The following repositories were used as architectural/algorithmic references and are MIT-licensed according to their repositories:

- Yuka — Mugen87/yuka
- Behavior3JS — behavior3/behavior3js
- EasyStar.js — prettymuchbryce/easystarjs
- PathFinding.js — qiao/PathFinding.js (package metadata declares MIT)
- chess-ai — zeyu2001/chess-ai

Because GameBots does not vendor those repositories or substantial source portions, their source license text is not embedded as a dependency license. Their project URLs and license findings are preserved in `THIRD_PARTY_SOURCES.md` for provenance.

## Reference-only project without a copied dependency

`henshmi/Classic-8-Ball-Pool` and its predecessor were reviewed for browser pool-game AI/difficulty concepts. No source from that repository was copied into GameBots. This package therefore does not treat it as a bundled dependency.
