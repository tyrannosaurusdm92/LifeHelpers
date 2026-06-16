# OurSpace module/backend/PWA patch test report

Generated: 2026-06-15

## Changes made

- Module size dropdown now supports: 25%, 50%, 75%, 100%, 125%, 150%, 175%, and 200%.
- Added **Save module user preference** beside the reset control.
- Converted the top-nav **Reset modules** button into a dropdown with **Default** and **User preference** restore options.
- User preference saves module position, collapsed/open state, size, carousel toggle, and carousel slide.
- Wired the profile pages to the supplied backend URLs:
  - Main backend: `https://script.google.com/macros/library/d/1Ld-KR6PrFPTBs1qsdAsZ55kBUa9QRYIkLgidknvgJ-2PLtujf9D-Mt6A/1`
  - Onyx full/alerts backend: `https://script.google.com/macros/library/d/1OtngPSoPXDpeYa8FDD9bb7rU_0mvFvD_23niUCrfy09t5Mbk0cy0kV5l/1`
- Added missing `service-worker.js` so the existing manifest/install banner can work as a PWA/home-screen app.
- Main backend support is expected from the configured stable site backend library URL; no replacement `Code.gs` is bundled in this front-end package.
- Added safe fire-and-forget Onyx chat backend logging through `window.OURSPACE_ONYX_FULL_BACKEND_URL`; local Onyx replies still work even if the backend is offline or rejects a request.

## Static tests performed

- Verified all JSON files parse.
- Verified key JavaScript files pass `node --check` syntax validation.
- Verified HTML pages contain the manifest, PWA script, module workshop script, messenger script, Onyx widget, and backend URLs.
- Verified `service-worker.js` exists and contains install/activate/fetch handlers.
- Verified backend source includes actions for `signup`, `signin`, `recordPurchase`, `recordEarn`, `message.create`, `message.list`, `channel.create`, `call.signal`, `call.signal.list`, `onyx.alert`, and `onyx.chat`.

## Live backend note

The supplied Apps Script URLs redirected through Google user-content URLs in the browsing tool, so live endpoint behavior could not be fully confirmed from here. The frontend is wired to them, and the repository backend source has been updated so redeploying the Apps Script will provide the expected messenger/Onyx actions.
