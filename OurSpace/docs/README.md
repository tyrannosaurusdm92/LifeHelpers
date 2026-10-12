# CURRENT PROFILE ROUTING (2026-10-10)

See [PROFILE_ROUTING.md](PROFILE_ROUTING.md). The current hosts are `assets/code/william.html` and `assets/code/jasper.html`, loaded after sign-in from existing root `ourspace.html`. There is no standalone `onyx.html`; the backdrop is a blank iframe. Historical Onyx notes below describe earlier packages.

---

# Onyx Module — Frame-by-Frame Research and Work Fullscreen Pass 7

Drop-in frontend for the tested OurSpace Onyx backend. The backend is not included or replaced.

## Runtime
- `assets/code/onyx.html`
- exactly 20 JavaScript files in `js/`
- one WASM core in `script/`
- shared-safe JSON only in `json/`
- existing CSS and assets preserved

## Privacy architecture
Profile-private knowledge is not shipped as frontend data bundles. The browser sends authenticated profile context to the existing backend, which remains authoritative for private/profile-scoped retrieval. Frontend profile keys are routing metadata, not authorization.

## This pass
- removed dormant private/profile knowledge bundles from the deployable client
- made local data runtime shared-safe/backend-first
- narrowed Drive retrieval to explicit/bound personal context
- made attachments per-message after successful send
- parses up to 12 attachments with bounded concurrency (3) and URL fetches with bounded concurrency (2)
- compressed/lazy-loaded behavior and mood atlases instead of eagerly parsing raw atlas files
- consolidated JS to the requested 20 filenames, JSON to 5 files, docs to 8 files
- merged the complete Work workspace into the single-page package while preserving its CSS, JavaScript, JSON, mood images, and relative paths
- added a Work fullscreen shell with the large red exit X and synchronized module Design palette
- renamed the user-facing Health tab and fullscreen to Virtual Health
- kept the Feed Him MEOW button/fullscreen name and made that fullscreen view blank

Authoritative master SHA-256: `c19441d70441e3c5273b2a8a3750df6c563582a80378c67e4a8017eda35260ac`

## Current Onyx sprite sources

The module bubble uses the code-first chest-up mood renderer in `js/onyx/onyx-core/onyx-mood-renderers.js`. The ten `https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_*.png` files are fallback images. The Virtual Health actors use the current Studio quadruped and Professor atlases under `https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/games/virtual/atlases`; the legacy standalone atlas is not included. `js/onyx/onyx-core/onyx-atlas.js` is a zero-byte compatibility placeholder, not the module's visual renderer.


## Standalone OurSpace page-size viewport

The standalone `assets/code/onyx.html` preview now uses a blank white host canvas sized from the lightweight RetroSite/OurSpace page reference: `960px` desktop width, `max-width: calc(100% - 20px)`, and `min-height: 100vh`. At `850px` and below it expands to the available width. The RetroSite template itself is not included, and none of its visual design or content has been copied into this package. This sizing applies only to the standalone preview body marked `data-onyx-standalone-viewport="ourspace-main-page"`; it does not alter the 190×190 hyper-reduced Onyx bubble contract.


## Current fullscreen controls
- Virtual Health exposes a **Virtual Health** action that opens its fullscreen view.
- Feed Him MEOW exposes **Feed Him MEOW** to launch the intentionally blank fullscreen shell in this pass.
- Work exposes **Open Work fullscreen**, with its complete workspace and the large red X.
- The large red X returns to the widget/module.
- `#admin` remains only as the module chat-testing marker; the game sprite editor was removed.
