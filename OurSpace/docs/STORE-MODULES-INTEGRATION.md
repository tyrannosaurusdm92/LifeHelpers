# OurSpace native Store integration

Both supplied storefronts are integrated directly into the same Store page in `assets/code/william.html` and `assets/code/jasper.html`. No iframes, Shadow DOM, external store HTML files, or overlapping placeholder pages are used. The two store components stay separate, with independent catalogs, carts and account-based buyer permissions.

## Store components

* Dino Store, source `28_Dino_Store`, native module `osDinoStoreSource`, independent item catalog, seller William, buyer Jasper.
* Squishy Store, source `29_Squishy_Store`, native module `osSquishyStoreSource`, independent item catalog, seller Jasper, buyer William.

All source UI elements and checkout dialogs are present in light DOM; selectors and IDs are namespaced to avoid collisions with OurSpace and with each other. Source styles (including responsive rules) are preserved within namespaced `css/os-store-*.css` and original copies in `docs/`. The original store catalog/config data is retained as `json/os-store-*.json`; each store's core functional runtime remains its own script in `js/os-store-*-runtime.js`. Store authentication now uses the existing secure `OurSpaceAuth` gateway. The module designer's nine original target categories and granular store targets are integrated into the existing profile Design Widget, with NO standalone store designer overlay.

Checkout uses the original backend request actions through the existing `/api/ourspace` gateway. In #admin mode, catalog browsing/search/filtering works but checkout is appropriately disabled. No actual backend order or purchase was exercised; success still requires a deployed backend with matching actions.

## #admin editing

Open `assets/code/william.html?page=store` via the existing #admin sign-in. Each Store module has a real frame with eight side/corner handles, a drag bar, and accessible Up/Down reorder buttons. Resizing and moving change width/height and flow margins, not absolute overlay coordinates. Dragging a module across the other one can reorder both in the normal flow. The normal document flow automatically makes room. Hit **Save layout & export stores.json** to store this browser's positions and download `stores.json`, with both stores' dimensions, offsets and ordering.

The editor never appears on Jasper's page, outside William #admin, or on the Journal page. The previous Journal/Dairy placement editor and its export button were removed; saved Journal + Diary geometry from the supplied `bulletin (1).json` was applied to William and is now locked. Original profile Pinboard `json/bulletin.json` is untouched.

The current bundle is front-end only. Account/checkout integration requires the existing live gateway, and UI tests are not equivalent to verified live purchases.
