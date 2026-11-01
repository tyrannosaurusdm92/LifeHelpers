# OurSpace native modules — integration and compatibility audit

This patch modifies the supplied integrated OurSpace archive, not the sibling LifeHelpers folders.

- All existing standalone HTML files are preserved, with no absorbed HTML resurrected.
- Household, Journal & Diary, Store, Communication, Feed, Audio, Visual, Skills and Profile are authored inside the original William and Jasper documents.
- The 102 supplied standalone DBT worksheet/handout HTML files remain in `assets/code/DBT`.
- All JS and WASM reside in `script`; all CSS in `style`, without nested top-level source folders.
- A page-scoped Quill designer is kept for each page; MySpace presets are now appearance-only, not structural templates.
- Original shared Jump Nav remains page-specific; the sidebar messenger's blue thumb follows the host page height.
- The optional sibling Onyx corpus imports from `../../Onyx/script/js/onyx/onyx-core/index.js`, and retains the existing backend-backed health, psychiatry, DBT and work responses when unavailable.
- The leisure fullscreen pane uses the one explicit game iframe exception linking to `../../../Games/index.html`.
- The supplied Apps Script backend source is **not** included or published in the frontend.
- Design account syncing uses backend `preference.get` / `preference.set` through Google Drive-backed account storage.
- PWA alert badges use the native numeric App Badging API where available. The tab icon/title displays a `‼️[#]` marker where supported; operating systems do not permit a site to draw arbitrary emoji onto all installed-app icons.
- Web push requires an authorized subscription and the backend's separately configured web-push gateway.

## Deployment and size limits

GitHub Pages must host the `OurSpace` and sibling `Onyx` and `Games` paths side by side. The hosting application must expose the published Apps Script endpoint or its secure API gateway; cross-origin Apps Script availability depends on the current deployment permissions and CORS behavior.

Do not force an arbitrary archive-size threshold by adding duplicate binaries or filler. The shipped file inventory and compressed size are reported in `docs/LOSSLESS-VALIDATION.json`.
