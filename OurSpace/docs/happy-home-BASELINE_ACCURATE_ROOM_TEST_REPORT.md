# Accuracy v4 Test Report

## Static validation

- `js/onyx/games/virtual/happy-home-editor.js`: `node --check` passed.
- All JavaScript `$('<id>')` UI references resolve to an element in `editor.html`.
- `json/happy-home-assets.json`, `json/happy-home-defaults.json`, and `json/happy-home-locked_scene.json` parse successfully.
- Every file referenced by `json/happy-home-assets.json` exists in the package.
- The predetermined `ROOM_SCAN_TEMPLATES` overlay table is absent from the final JavaScript; surface overlays are scanner-created.
- `json/happy-home-locked_scene.json` SHA-256 is unchanged from the incoming click-first package: `5e9eb57ed7be55e16a001abf7a636c81aa354c22b148a6c977b74839f50f5e00`.

## Browser scanner smoke tests

The editor was loaded into headless Chromium with the supplied room image embedded into the test harness so the scanner could run without local-server permissions.

### Full-resolution default scan

- analysis size: 1916 × 821
- scan strategy: Hybrid
- output polygons: 95
- corner candidates: 350
- strong-edge coverage: 3.9%
- perspective-aligned weak edges promoted: 10,014
- same-material fragments consolidated: 2,423
- auxiliary regions used as barriers but omitted from default GeoJSON output: 7
- requested simplification: 0.50 px
- topology-safe applied simplification: 0.25 px
- overlap audit: **0 overlapping surface pairs**
- room material palette entries: 8
- browser JavaScript errors: **0**

### Click-first grouping test

At an 800-pixel diagnostic scan:

- output polygons: 83
- two independently scanned GeoJSON groups were selected together
- `Group selected` renamed both to `Smoke Test Group`
- `Ungroup selected` restored them to independent one-polygon GeoJSON groups
- browser JavaScript errors: **0**

### Palette training test

- selected `Wallpaper / Paint`
- `Sample next room click` was activated
- clicking the room at approximately image coordinate 303,183 sampled `#3b4f5c`
- Wallpaper/Paint sample count increased from 1 to 2
- browser JavaScript errors: **0**

### Material / geometry spot checks

Diagnostic scan spot checks found:

- main ceiling point → `Ceilings`
- main floor point → `Floors`
- upper left painted wall → `Wallpaper / Paint`
- lower right wall wood → `Paneling / Doors`
- crown neighborhood → `Trim`
- baseboard neighborhood → `Floorboards + Crown Moulding`
- door-frame neighborhood contains a `Trim` region

These are diagnostic point checks rather than a claim that every pixel is automatically semantically perfect. The click-first polygon editor, material sampling, grouping, and vertex correction remain available for the remaining local corrections.
