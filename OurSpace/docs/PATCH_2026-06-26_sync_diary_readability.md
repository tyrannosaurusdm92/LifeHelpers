# Patch 2026-06-26 — Sync, uploads, readability, diary cards

- Locked frontend calls to the backend URL supplied by William/Jasper.
- Added backend-backed profile state sync for MySpace code, profile/background images, music, gallery media, module settings, journal entries, wellness entries, custom games, wishlist, and page styling.
- Added Sync now / Pull latest / Push changes controls on the Sync page.
- Kept localStorage as a device fallback, but backend preference storage is now the cross-device source during synchronization.
- Uploaded profile/background/gallery/music files are also sent through `upload.media` when a signed-in backend session is present.
- Added global black text with a thin white outline/readability shadow across controls, navigation, tables, lists, cards, generated content, currency labels, and shop inventory.
- Changed currency display to PP / GP / SP / CP labels.
- Removed Home modules: Useful Links, Welcome, Quick Notes, Current Focus, Media Shelf, Project Board.
- Added a larger Home Journal Entry module.
- Expanded MySpace layout/code panels to all customizable pages.
- Added hidden `Friends` aliases and common MySpace compatibility classes to modules.
- Replaced the old diary-card fields with the uploaded personalized diary card HTML files and combined them with the Mood Tracker module.
- Reordered DBT / ADHD page: saved entries, combined mood/diary cards, skill menu.
- Imported supplied positive messages and marquees while filtering reserved entries.
- Backend file and backend URL were not changed.
