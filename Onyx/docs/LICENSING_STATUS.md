# Licensing status

The supplied `smellycat-master.zip` archive does **not** contain a standalone LICENSE, COPYING, or NOTICE file at the project level.

This extraction therefore does not invent, replace, or relicense the original cat model, texture, animation data, or source code. The original `README.md` is preserved unchanged at the package root, including its developer attribution. Any rights and usage permissions remain whatever the original authors or upstream asset creators granted outside the supplied archive.

Third-party runtime libraries (Three.js and Ammo.js) are intentionally **not bundled** in this cat-only package, so their separate license files are not being copied or altered here.

## Viewer runtime addition

This viewer package additionally bundles the specific Three.js r111 loader/runtime files and `ammo.js` runtime copied from the supplied SmellyCat source tree because they are required to reproduce the original cat-loading/physics approach. Their upstream licensing remains separate from the cat assets; bundling them here does not relicense the cat model or texture.
