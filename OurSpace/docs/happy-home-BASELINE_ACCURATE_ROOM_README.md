# Happy Home · Finished Living Room

This package is the finished living-room design surface. It is **not** a room-geometry editor or scanner.

## Editable

- 11 authored architectural GeoJSON design groups from `json/happy-home-final_architecture.geojson`.
- Wall groups through Entire Room / Back Wall / Left Wall / Right Wall scopes.
- Floor and Ceiling as independent targets.
- Compatible CSS texture/material patterns from `assets/textures/`.
- Live color (preset palette, color input, RGB, Hex), pattern scale, rotation, offset, coverage, and texture strength.
- Existing interactive SVG furnishings through their own embedded design controls.
- Four fixed picture-frame upload targets.
- AC on/off control.

## Fixed

- Room background geometry and all GeoJSON polygon coordinates.
- Furniture/object placement, size, rotation, perspective, and ordering.
- Weather/outdoor iframe location and portal openings.
- Picture-frame locations.
- AC/wind placement.

The weather playlist remains behind the original room image and is exposed through the authored window/French-door portal cuts.

## Files

- `editor.html` — finished room entry point.
- `js/onyx/games/virtual/happy-home-editor.js` — room renderer, interactions, and Happy Home design system.
- `js/onyx/games/virtual/happy-home-final_architecture.js` — embedded authored GeoJSON used without fetch requirements.
- `json/happy-home-final_architecture.geojson` — canonical grouped architecture export supplied by the user.
- `json/happy-home-locked_scene.json` — fixed scene layout.
- `assets/room-svg/` — interactive furnishings.
- `assets/video/` — outdoor/weather sequence.
- `assets/fish/` — aquarium fish.
- `assets/audio/` — AC sounds.
- `assets/textures/` — 250×250 CSS texture bundle.

Opening `editor.html` does not require the scanner workflow. The old scanner controls are removed from the visible application and all geometry-mutating functions are disabled in finished-room mode.
