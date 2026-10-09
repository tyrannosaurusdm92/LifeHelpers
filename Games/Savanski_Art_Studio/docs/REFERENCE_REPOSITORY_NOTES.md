# Supplied repository review and incorporation policy

The attached repos were examined as references. Their code was **not** blindly mixed into Savanski, because the files target incompatible runtimes or have license restrictions. No unknown-license brush packs are redistributed. Direct copied code from these reference archives is not included.

| Supplied project | Contents/platform | Integration decision |
|---|---|---|
| js-draw | MIT browser TypeScript vector editor | Informed vector/selection and layer interoperability; existing Savanski object model retained |
| p5.brush | MIT JavaScript p5 extension | Informed brush expression; implemented independent native Canvas2D brush tip engine |
| PaintFE | MIT Rust desktop image editor | Informed retouch and color operations; fresh C filter kernel |
| drawing | GPLv3 Python/GTK desktop editor | No desktop/GPL source copied; image processing ideas independently implemented |
| infinipaint | GPLv3 C++ and Skia | Not bundled due to Skia dependencies and copyleft constraints; authored independent C++ texture math |
| FreeProcreateBrushes | Procreate `.brush` art pack without redistribution license | Not redistributed or imported into the package |
| PhotoEditor | Kotlin/Android editor | Android modules not compiled for browser |
| ViewAnimator | Swift/iOS animator | iOS UI code not compiled for browser |
| procreate-clone | Swift/iOS app | Native SwiftUI code not compiled for browser |
| crayon | MIT C#/.NET engine | Not portable directly without a managed WASM runtime |
| crayons, DAISIE | R statistical packages (DAISIE is GPL) | Unrelated to browser painting; not bundled |
| crayon(s) duplicate | Visual palette reference | Used only as concept/reference |
| ECC | MIT coding/agent workflow collection | Developer workflow reference only; not runtime art tools |
| ervell | Web app/Artsy infrastructure | Not a graphics brush engine; no integration |
| spraypaint.js | Graphiti model/REST API ORM | Despite name, not spray-paint brush code; not integrated |
| placeth | NFT/web3 app | Not an art brush module; deliberately excluded |
| tidbit_creative_pad | QMK keyboard firmware C | Microcontroller code cannot be compiled into meaningful drawing WASM |
| graffiti | Minimal canvas painting project | Referenced painting concepts; native Savanski engine remains authoritative |

New custom PNG brushes, C/C++ algorithms and UI bridge files were written specifically for this package. Existing Savanski assets and its licenses remain in place.
