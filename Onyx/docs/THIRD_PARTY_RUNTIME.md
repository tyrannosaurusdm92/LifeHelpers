# Third-party runtime notice

The viewer uses runtime files copied from the supplied SmellyCat source tree:

- Three.js revision 111 (`three.module.js` plus FBXLoader dependencies). Three.js is an upstream third-party project; this package does not claim authorship of it.
- Ammo.js. The bundled file identifies itself in its header as "ammo.js, a port of Bullet Physics to JavaScript" and states that it is zlib licensed.

No upstream license file for these libraries was present in the supplied SmellyCat archive, so this package does not fabricate one. Consult the corresponding upstream projects for their complete license texts and notices when redistributing.


## Direct-open packaging

The bundled Three.js/FBXLoader sources are also provided as mechanically converted classic-script copies under `vendor/three/classic/` so `index.html` can run from `file://` without ES-module CORS restrictions. Their original source headers/license notices are retained.
