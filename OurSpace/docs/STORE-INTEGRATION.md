# Native Dino / Squishy Store Integration

The supplied stores.zip was integrated into `assets/code/william.html` (Dino Store) and `assets/code/jasper.html` (Squishy Store). There is no separate store HTML, no iframe, no Shadow DOM, and no second design widget. Store selectors use scoped CSS to protect the rest of OurSpace. The intact source product catalogs and shopping/cart logic live in `js/ourspace-store-william.js` and `js/ourspace-store-jasper.js`; the native store CSS is in `css/ourspace-store-*.css`.

`#admin` on William's `?page=store` adds 8 resizing grips and a drag handle. It manipulates flow-based width/height/margins (never absolute overlays), saves to localStorage and exports `stores.json` for the next integration. Jasper sees the Squishy Store only and has no placement editing handles. William sees Dino Store only. Checkout ownership restrictions in the supplied stores were opposite of the requested visibility; required buyer profiles now follow the page identity. In the hosted app, checkout uses `OurSpaceAuth.request()` to reach the same-origin `/api/ourspace` gateway. Backend availability and authorization cannot be guaranteed by a static ZIP; offline/admin catalog viewing does not perform purchases.

`js/ourspace-store-design-specs.js` adds store-specific headings, labels, buttons, cards, product grid, checkout and other targeted parts to the existing OurSpace Design Widget. All selectors are limited to the Store module.

The user-supplied `bulletin (1).json` placement is kept in `json/journal-diary-imported-placement.json`. The prior Journal & Diary placement controls and export button have been removed, while its actual Journal and Diary interfaces remain. Existing profile pinboard `json/bulletin.json` is unrelated and unchanged.
