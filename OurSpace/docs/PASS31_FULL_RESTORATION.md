# OurSpace Pass 31 — Complete source preservation and direct-file restoration

**Repository:** `tyrannosaurusdm92/LifeHelpers`, existing `main` branch, path `OurSpace/`.

## Source fidelity

The original `OurSpace_Pass15_Eating_Drinking_Scaled_Integrated(1).zip` contains **721 files**. All **721 original Git blob SHA-1 hashes** are present in the proposed Git tree. **701** match their original `OurSpace/...` path. The remaining **20** are preserved, without replacement, as:

- **19** original Pass 15 movement scripts in `js/onyx/games/virtual/pass15-legacy-*.js`; these are intentionally **not loaded**, since the newer Pass 23 movement scripts supersede them and loading both would duplicate registrations.
- **1** original `assets/code/dbt/book-cover.html` content at `assets/code/dbt/book-cover-pass15.html`, because a newer version of `book-cover.html` already existed on GitHub.

The newer `Onyx_Base_Movement_Pass23_All_Sources_Refined(1).zip` supplied all **25** original movement JavaScript modules. All were transferred with their exact source bytes and registered through `js/ourspace-onyx-hooks.js` in correct dependency order.

All **12** scaled SVG eating/drinking frames were restored to `assets/images/games/virtual/atlases/`. The original Onyx mood atlases and remaining unique frames are unchanged. Five communication sound files, the widget fallback PNGs and the Onyx contact sheet were also restored as original Git binary blobs.

No ZIP was committed. No separate Git branch was created. The original tested Google Apps Script backend remains untouched.

## Runtime wiring

- `js/ourspace-onyx-hooks.js` loads the original Pass 23 physics, gait, navigation, profiles, sprites, runtime, eight directions, three jumps, seven activity modules, then interaction sequences and the Happy Home adapter.
- `js/onyx/games/virtual/onyx-base-happy-home-bridge.js` now uses Pass 23's **actual** API (`setInput`, `run`, `walk`, `jumpUp`, `jumpDown`, `jumpAcross`, `setSteering`, `navigateTo`) and the original `action-end` event.
- The adapter locates the original Onyx renderer inside same-origin profile iframes and preserves its existing mood, sprite, spatial geometry and persistence. It does not create a second Onyx or access the backend.
- Existing paths are retained to avoid breaking frontend imports. The extra compatibility paths are intentional while preserving the complete application.

## Checks

- Pass 23 original Node regression suites: **8 of 8 passed**.
- Standalone Pass 31 bridge smoke test: **passed**.
- Combined testing folder JavaScript syntax: **161 of 161 checked with zero errors**.
- Original Pass 15 source preservation verified by **Git object hash**, not merely filename or size.
- GitHub final tree is checked before commit and updated with fast-forward/lease protection.
- Chromium navigation to local testing pages was blocked by test-environment policy (`ERR_BLOCKED_BY_ADMINISTRATOR`). This is **not** a completed end-to-end browser/visual test.

## Constraints

The original Onyx atlas has six authored facing views, while the movement controller supports eight sectors. Straight north/south still use adjacent three-quarter art. Pass 23 gait computes quadruped paw contact timing from whole-body animation; it does not create new independently jointed leg artwork.

The original source contains game JSON at `json/*.json` and legacy stylesheet paths beyond the desired minimal folder tree. Those existing compatibility paths were intentionally retained rather than deleting referenced functionality. No backend source file is added or modified.
