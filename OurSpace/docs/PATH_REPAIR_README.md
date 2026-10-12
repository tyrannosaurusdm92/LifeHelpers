# OurSpace path repair / test package

Source: Ourspace-pass7.zip. The app's single root HTML is `ourspace.html`.

The original `js/ourspace-core/backend-client.js` and `js/ourspace-core/portal.js` were **not present** in the supplied archive, nor in the inspected current GitHub `OurSpace/js` directory (only `hello` was there). These scripts are referenced by the existing sign-in portal and **are not fabricated**: copy your authoritative frontend portal scripts to `js/ourspace-core/` before testing sign-in. The existing Apps Script backend URL/configuration remains unchanged.

Onyx's profile pages are `assets/code/william.html` and `assets/code/jasper.html`; they include blank, full-viewport iframes while the Onyx widget, DBT, and game infrastructure remains in place. No separate `onyx.html`. Both pages reference root-relative JS/CSS using `<base href="../../">`.

Other frontend source was reorganized into exactly the specified main directories. Nonessential images/video/audio resolve directly from the public GitHub `OurSpace/assets` raw-host URLs; widget sprite atlases, individual frames, black border/notification imagery, and communication event WAVs are kept locally for testing. Note: a GitHub file that doesn't exist on the current branch will still require an asset-side fix; no unavailable media was silently bundled.

`script/` contains only .wasm binaries. Flattened docs and happy-home JSON records retain distinct names. See PATH_REPAIR_MANIFEST.json for each moved original filename.

**Do not upload this archive over the backend or replace authenticated backend actions.**
