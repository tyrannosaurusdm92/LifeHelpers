# OurSpace validation report

Generated: 2026-06-25

## Automated checks
- [x] manifest JSON parses — start_url=./OurSpace.html, icons=10
- [x] manifest installable fields
- [x] runtime catalog parses
- [x] game catalog populated — 29
- [x] shared skills populated — 404
- [x] william store populated — 103
- [x] william tasks daily — 34
- [x] william care daily — 25
- [x] william tasks weekly — 18
- [x] william care weekly — 4
- [x] william tasks monthly — 2
- [x] william care monthly — 1
- [x] william tasks on_demand — 24
- [x] william care on_demand — 16
- [x] jasper store populated — 96
- [x] jasper tasks daily — 20
- [x] jasper care daily — 13
- [x] jasper tasks weekly — 27
- [x] jasper care weekly — 6
- [x] jasper tasks monthly — 5
- [x] jasper care monthly — 1
- [x] jasper tasks on_demand — 16
- [x] jasper care on_demand — 7
- [x] yearly skills populated — 27
- [x] william store cross-profile filter — []
- [x] jasper store cross-profile filter — []
- [x] JS syntax assets/ourspace-data-catalogs.js
- [x] JS syntax assets/ourspace-embedded-catalogs.js
- [x] JS syntax service-worker.js
- [x] inline JS syntax OurSpace.html
- [x] inline JS syntax william.html
- [x] william.html uses embedded game manifest
- [x] william.html includes runtime catalog
- [x] william.html GiftLink UI present
- [x] william.html messenger shared key
- [x] william.html gallery video accept
- [x] william.html landscape CSS present
- [x] inline JS syntax jasper.html
- [x] jasper.html uses embedded game manifest
- [x] jasper.html includes runtime catalog
- [x] jasper.html GiftLink UI present
- [x] jasper.html messenger shared key
- [x] jasper.html gallery video accept
- [x] jasper.html landscape CSS present
- [x] service worker cached files exist — []
- [x] no leftover Cozy Clicker — []
- [x] no leftover Memory Garden — []
- [x] no leftover Snack Token — []
- [x] no leftover Big Wish — []
- [x] no leftover Creative Supply — []
- [x] no leftover placeholder-only — []
- [x] no leftover PLACEHOLDER — []
- [x] no leftover Use this space for — []
- [x] no leftover Pin non-social — []
- [x] no leftover Today’s main task — []
- [x] no leftover Track albums — []
- [x] no leftover A place to live, breathe — []
- [x] OurSpace.html exists
- [x] ourspace.html exists
- [x] william.html exists
- [x] jasper.html exists
- [x] modules/giftlink/index.html exists

## Browser/device note
Chromium is installed in this sandbox, but its managed policy blocks all URLs (`URLBlocklist: ["*"]`), so a rendered Playwright run could not navigate to local HTTP or file URLs. Static JavaScript, manifest, service-worker, data-catalog, placeholder, responsive-CSS, and cross-profile catalog checks were run instead.

## 2026-06-25 Store / ADHD patch validation
- Confirmed both user pages contain the Store aisle selector with `Show all`.
- Confirmed GiftLink is rendered near the top of both Store pages.
- Confirmed game launcher hides legacy support-bot records.
- Confirmed app data/catalogs contain weekly and monthly tiny-step chores including shower, toilet, therapy/admin, accessibility supplies, wheelchair support, MCAS trigger reduction, and caregiver-burnout check-ins.
- Confirmed catalog JSON parses and both William/Jasper stores have multiple aisles after profile filters.
- Confirmed service-worker cache version was bumped so deployed installs can refresh.
