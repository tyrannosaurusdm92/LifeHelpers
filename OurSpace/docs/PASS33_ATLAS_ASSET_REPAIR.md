# OurSpace Pass 33 — Onyx atlas and feeding path repair

Three original Pass 23 files were updated with no loss of other source files.

1. Eating/drinking animation now resolves its twelve normalized SVGs from `assets/images/games/virtual/atlases/` instead of obsolete standalone `assets/frames/`.
2. Runtime `attachCanvas` and default Onyx sprite renderer load the existing `onyx_meow_sprite_atlas.png` in the GitHub atlas library.
3. The original atlas is 1919px wide rather than 1920px. Sampling the final frame column now safely uses its available 63 source pixels without stretching or altering the PNG file itself.

**Verified locally:** eight inherited Pass 23 regression suites, seven Pass 32 integration smoke checks, Pass 33 asset-path regression, and syntax checks of 161 JavaScript files. No existing application files were removed; 770 local Pass 32 files remained byte-for-byte unchanged.

**Preservation:** Original `ourspace.html`, `assets/code/william.html`, `assets/code/jasper.html`, DBT, Happy Home data, other GitHub art and the deployed Apps Script backend are not modified by this commit. No ZIP committed. The room's native renderer still owns Onyx's behavior and personality; complete in-browser visual acceptance has not been established.
