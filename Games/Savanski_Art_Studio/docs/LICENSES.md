# License Notices

## Project-specific integration code

The newly written HTML/CSS/JavaScript/WebAssembly integration in this build may be used and modified by the project owner. Third-party components retain their original licenses.

## Texture swatches — CC0 1.0

All JPEG files in `assets/` were procedurally generated specifically for this build. They are dedicated to the public domain under CC0 1.0. They may be copied, modified, redistributed, recolored, tiled, baked into models, or replaced without attribution.

## Three.js and Three.js addons — MIT

Files: `js/three.global.js`, `js/three.addons.global.js`.

Copyright 2010-2026 Three.js Authors. Licensed under the MIT License. The runtime files preserve the original license headers.

MIT permission notice: Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies, subject to inclusion of the copyright and permission notice. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

## Google Draco — Apache License 2.0

Files: `js/draco_decoder.js`, `js/draco_wasm_wrapper.js`, `script/draco_decoder.wasm`. Licensed under Apache-2.0. The decoder is used only for compatible compressed 3D imports.

## Basis Universal transcoder

Files: `js/basis_transcoder.js`, `script/basis_transcoder.wasm`. These are the supplied transcoder runtime used by Three.js KTX2Loader. Retain the original notices contained in the supplied/runtime files when redistributing.

## Reference-only donor projects

Blender (GPL), MeshLab (GPL), and OpenSCAD (GPL) were inspected as reference sources but their desktop source code is not bundled into this browser package. image-sculpting and flutter_3d_controller are MIT-licensed reference sources; no entire framework/runtime from either is included.

## Professional editing research pass (2026-09-23)

The professional capability pass studied several external projects and product manuals. GPL projects (including Blender, MeshLab, and Krita) were used for workflow/algorithm research only; their GPL implementation source was not copied into Savanski by this pass.

Permissively licensed browser/geometry references reviewed include:
- miniPaint — MIT License — https://github.com/viliusle/miniPaint
- Fabric.js — MIT License — https://github.com/fabricjs/fabric.js
- Konva — MIT License — https://github.com/konvajs/konva
- SculptGL — MIT License — https://github.com/stephomi/sculptgl
- meshoptimizer — MIT License — https://github.com/zeux/meshoptimizer
- three-mesh-bvh — MIT License — https://github.com/gkjohnson/three-mesh-bvh

The new `savanski-professional-kernel.wasm`, `professional-wasm-bridge.js`, Art professional tools, 3D professional tools, and project-library code in this pass are Savanski-specific implementations rather than copied source snapshots of those projects.


## Third professional pass research boundary

Blender, MeshLab/PyMeshLab, Krita, Photopea, and Snapseed documentation were used as workflow and algorithm-design references for the third professional pass. No source snapshot from those applications was copied into the new Pass-3 files.

The Pass-3 implementation files are Savanski-specific work:
- `js/art-professional-pass3.js`
- `js/uniform3d-professional-pass3.js`
- `js/professional-pass3-wasm.js`
- `script/savanski-pass3-kernel.wasm`

The 3D density tools call Three.js `SimplifyModifier`, `TessellateModifier`, and buffer-geometry helpers already bundled in this project under the existing Three.js MIT license notice above.
