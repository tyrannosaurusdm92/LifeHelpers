# Pass 28 — Original Onyx frame restoration

## GitHub main asset mapping

- 267 unique original Onyx frame SVGs restored at
  `OurSpace/assets/images/games/virtual/atlases/<original-frame>.svg`.
- Both original widget assets restored at
  `OurSpace/assets/images/widget/alerts/frame-black.svg` and
  `OurSpace/assets/images/widget/alerts/onyx-alert-virtual-pet.svg`.
- Each restored asset points at the **identical Git blob** already present
  under `OurSpace/assets/images/legacy/frames/` or
  `OurSpace/assets/images/shared/`. There was no recompression,
  rasterization, new design, or manual SVG reconstruction.
- Ambiguous frame name
  `standing_three_quarter_head_tilt_tail_up.svg` was matched to the
  **caring** version by the Pass 15 local source's Git SHA
  `7416fb2de23a390abb4b4a8e686b7d421dab2ff0`.
- The original 11 mood/Professor atlas PNGs at this destination are
  unchanged and retain their prior filenames.

## Still pending

The twelve Pass 15 feeding/drinking SVGs:
`onyx_eat_{left,right}_{01,02,03}.svg` and
`onyx_drink_{left,right}_{01,02,03}.svg`
are present in the supplied local testing archive but are **not**
available in the current GitHub legacy frame tree; they were not
uploaded in this commit.

Much of the complete Pass 15 application JavaScript is still missing
from GitHub. No claim of complete deployment is made.

No backend files, root HTML, manifest, service worker, personal content,
or previous source images are changed. These are individual GitHub
files, not ZIP archives.
