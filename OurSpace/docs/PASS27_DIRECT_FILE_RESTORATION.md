# Pass 27 — additive stylesheet restoration (main)

This commit restores **66 individual CSS files** into the requested OurSpace CSS
folders without altering or removing their original GitHub paths.

The newly placed files reuse the **exact Git blob SHA** of existing GitHub
stylesheets. They are not approximations or empty placeholders.

Source categories:
- Existing `css/bubble-module/` -> `css/onyx/onyx-core/`
- Existing `css/games/virtual/` -> `css/onyx/games/virtual/`
- Existing `css/happy-home/` and `css/happy-home/textures/` ->
  `css/onyx/games/virtual/happy-home-*.css` and `texture-*.css`
- Existing `css/games/leisure/garden/`, `css/feed_him_meow_*.css`,
  and `css/meow*.css` -> `css/onyx/games/leisure/`
- Existing `css/ourspace.css` -> `css/ourspace-core/ourspace.css`
- Existing Onyx overlay and work-tab CSS -> `css/onyx/onyx-core/`

## Critical preservation boundary

The original live `OurSpace/ourspace.html` is much larger than the
Pass 15 archive's file. Do not replace it without reconciliation.

The Pass 15 local source archive contains 721 files. The integrated
Pass 26 local testing folder retained all 721 and includes 789 total
files. The original Pass 23 animation/physics implementation has 25
JavaScript modules. The local staging tests passed but **those files
have not all been uploaded to GitHub**.

The currently deployed `main` branch still lacks much of the original
Pass 15 JavaScript. This commit is a non-destructive incremental restore,
**not** a declaration of complete OurSpace integration.

No Apps Script backend, root HTML, service worker, manifest, or existing
asset is changed by this commit. Existing CSS filenames remain in place
for backward compatibility. No ZIP file is committed.
