# GPU/WebGL validation boundary

A headless Chromium screenshot smoke test was attempted during the 2026-08-13 body/living-motion pass. In this container, Chromium could not initialize an EGL/ANGLE software WebGL context, so no rendered screenshot was accepted as evidence.

This does **not** mean the viewer was considered visually validated. The package instead records successful static/runtime-data checks for JavaScript syntax, FBX loading/parsing, geometry, skin influences, lineage hashes, morph vertex preservation, eye-depth math, asset references, and inspection controls. The included interactive viewer must still be opened in a normal WebGL-capable browser for final visual judgment of pose aesthetics.
