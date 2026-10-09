# Savanski Studio — integrated art/3D upgrade

## Launch
Serve this directory over HTTPS or a local HTTP server, then open `studio.html`.
For local testing: `python -m http.server 8000` and browse to `http://localhost:8000/studio.html`.
`file://` does not permit the Fetch API needed for the brush catalog and WASM.

## Structure
- `studio.html`: only application HTML page; all added tools appear in EXISTING 2D / 3D tool panels.
- `js/`: original studio engine, backend client, and new browser controllers.
- `css/`: original design and the responsive `advanced-suite.css` extension.
- `json/`: original schemas/presets and new brush catalog.
- `docs/`: this guide, license/provenance notes, reproducible source and tests.
- `assets/images/`: original artistic textures and image resources.
- `assets/brushes/`: 240 newly generated PNG brush alpha tips; lazily loaded, not pre-cached.
- `assets/app/`, `assets/audio/`: existing app icons and audio resources preserved.
- `script/`: original and new compiled WebAssembly modules, with original WASM loader paths updated.
- `service-worker.js`, `manifest.webmanifest`: root-scope progressive web app.

## Added to existing menus
- **Draw**: expressive raster brushes for texture, ribbon / rake, glitter, confetti and braid.
- **Brush Lab**: 240 brush PNG tips in 12 groups, browser PNG import, stamp spacing, scatter, rotation, size jitter, flow, symmetry and pressure controls. Painting modifies the selected native raster layer and follows existing undo history.
- **Retouch**: soft glow, ink edges, comic halftone, ordered dither, color fringing and film grain.
- **Adjust**: posterize, threshold, desaturate, pixelate, vignette and seamless texture blend.
- **Color**: sampled 24-color palette with click-to-use swatches and GIMP `.gpl` export.
- **Image**: repeat texture, insert brush stamp and ink outline.
- **File**: sprite sheet, labeled layer contact sheet, brush catalog exports.
- **3D Paint**: UV checker, project canvas-to-mesh paint, generated surface normal map.
- **3D Material**: one-click matte, metal, and glass-like presets, applied to the selected mesh material.

## WebAssembly implementation
The following are **real binary WebAssembly modules** compiled for `wasm32`:

- `script/savanski-raster-fx.wasm` — new C raster pixel kernel (filter effects, including halftone).
- `script/savanski-geometry.wasm` — new C++ normal-map and UV checker kernel.
- Existing `script/*.wasm` (original professional, mesh and sculpt kernels, Draco decoder and Basis transcoder) remain included, with browser loader paths updated.

Build the two new kernels from reproducible original sources in `docs/wasm-source/`:

```sh
clang --target=wasm32 -O3 -nostdlib -Wl,--no-entry \
  -Wl,--export=fx_apply -Wl,--export=fx_pixels -Wl,--export-memory \
  -Wl,--max-memory=67108864 docs/wasm-source/savanski-raster-fx.c \
  -o script/savanski-raster-fx.wasm
clang++ --target=wasm32 -O3 -nostdlib -Wl,--no-entry \
  -Wl,--export=geo_normal_map -Wl,--export=geo_uv_grid \
  -Wl,--export=geo_pixels -Wl,--export-memory \
  -Wl,--max-memory=67108864 docs/wasm-source/savanski-geometry.cpp \
  -o script/savanski-geometry.wasm
```

**Python and native project portability.** Python cannot be directly compiled to standalone WASM without its runtime, and GTK/Qt/Skia apps are not portable by recompilation alone. Image-processing methods used in Python-based editors are represented as standalone C/C++ browser-safe algorithms rather than bundling an inapplicable CPython UI runtime. WASM kernels have a 2048 × 2048 scratch-space limit; raster effect tools use a JavaScript fallback on larger canvases, and the 3D normal-map tool uses fallback calculations if required. Brush textures are generated offline with `docs/generate_brush_library.py`; that Python build-time script is not loaded into the browser.

## Backend preservation
Original `js/backend-config.js`, `js/backend-api.js` and the supplied `Savanski_Art_Studio_Backend.gs` were **not replaced or edited** by this upgrade. The deployed Apps Script URL remains the configured backend, and original auth, project save, listing and sync routes are unchanged. The `.gs` file supplied for reference is not copied over the deployed service. New code does not create endpoints.

## Save/export behavior
Effects and painting use the selected raster layer and call existing history capture/push/render. Generated sheets and palettes download locally. The existing project-save function is unchanged. Newly generated 3D normal maps remain attached to the in-memory material; confirm that your existing 3D export path retains this texture before using it as an interchange format. Imported custom brush image tips are session-only, not automatically cloud synced.

## Performance and accessibility
The service worker pre-caches only core scripts/resources, not 240 heavy brush images. The brush library lazily loads tips; avoid opening every category on low-RAM devices. Effects run on the active raster layer; very large images can take time. Brush buttons are keyboard-focusable and pressed states are exposed with `aria-pressed`; menu layout wraps and scrolls at smaller viewports.
