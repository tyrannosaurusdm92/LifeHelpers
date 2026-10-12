# Export package use

The Testing pass is `Onyx_export-testing3.zip`. It contains one `Onyx_export/` directory; use that directory's contents as a local test overlay on a temporary copy of `OurSpace`. The root HTML entry point is `onyx.html`.

The linked GitHub `OurSpace` folder currently contains `assets/` and `json/`. Its 35 asset files match the packaged asset paths byte-for-byte, and the package JSON paths do not collide with existing `OurSpace/json` files. This check is for local integration testing; do not treat the Testing package as the GitHub assets-only package.
