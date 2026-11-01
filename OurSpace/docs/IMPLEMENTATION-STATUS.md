# Implementation status — October 31, 2026

## Working and locally tested in Chromium

- Landing page logo layout at desktop and phone widths, sign-in form, password reveal, forgot-password dialog, and admin-only profile chooser.
- MySpace-style William and Jasper profile structure (14 collapsible/resizable profile boxes, 75 designable profile targets including module headings and inner content).
- Native browser preview: identity editing, About Me, interests, tags, bulletins, posts, links, gallery URL entries, comments, projects, and URL-based audio player controls.
- The floating 100x100 design artwork and red X collapse, 11 color-wheel + hex pairs, font/border/background/scrollbar controls, generic and per-module design targets.
- Journal & Diary Cards now share one native two-tab page in both profile files. The original Journal and the appropriate Diary Card render with functioning UI, scoped CSS, and integrated source JS. The supplied `bulletin (1).json` layout is preserved, and its admin placement editor has been retired in favor of the Store editor.
- Feed, Visual, and Audio have their preexisting filled-in pages, but their old placement editor is retired. Household, Skills, and Communication remain unimplemented. Dino Store is native in William; Squishy Store is native in Jasper, with admin editing in William and `stores.json` export.
- Static assets, native app manifest and service worker registration logic present; installer outcome is platform/browser-dependent.

## Requires hosting/backend verification

- Real email/phone/password login and recovery verification-code delivery (not testable without the existing service and same-origin proxy).
- Private profile.get/profile.save server schema and authorizations; preview saves are device-local only.
- Cross-device designer get/save actions for profile/page-specific preferences. Local copy of compatible styles is implemented; remote sync is **conditional** on the existing backend supporting mapped actions.
- Public profile publishing and published-only public-profile retrieval.
- PWA install behavior and sync on an actual HTTPS domain, iOS, Android, desktop and tablet.

The frontend deliberately does not embed the user's Apps Script URL. A same-origin server gateway is required to contact that existing backend without placing its deployment address into browser files. This package does not include a new backend, an undocumented backend implementation or any guarantee that untested server calls will succeed.
