# OurSpace cleanup audit

Generated: 2026-06-25

## Completed
- Replaced hard-coded placeholder games with the existing game manifest in `assets/ourspace-embedded-catalogs.js`.
- Added `assets/ourspace-data-catalogs.js` as the runtime catalog for stores, tasks, self-care, skills, and GiftLink backend settings.
- Populated top-level `json/shared`, `json/william`, and `json/jasper` store/task/skill indexes from the detailed JSON already in the project.
- Removed DBT/ADHD placeholder JSON files and restored the shared skill index to point at the existing usable skill files.
- Filtered store data so William does not receive Jasper-only ducks/purses/homecooked/cola-style items, and Jasper does not receive William-only D&D/dinosaur/Brev/Foundry/Arkenforge-style items.
- Moved the user pages to JSON-backed store aisles, daily start scheduling, cadence pull lists, shared DBT/ADHD skill cards, manifest-backed games, and persistent uploaded media.
- Added persistent gallery video support, persistent MP3 data-URL storage, saved uploaded standalone HTML games, and saved profile/background media.
- Rebuilt the footer messenger around one shared William/Jasper local-storage thread.
- Added Store-page GiftLink wishlist routing using the supplied Apps Script endpoint: `https://script.google.com/macros/s/AKfycbwXZ9maNHUWZR68su4O3KXymU-z-RFYJI4JYBuWQUDvUYjfESY_ivEPXTe6odBDqDGrqQ/exec`.
- Restored canonical `OurSpace.html`; lowercase `ourspace.html` is now a small redirect for old links.
- Updated the PWA manifest and service worker cache to include the new runtime catalogs.

## Source-data note
The supplied yearly task and yearly self-care JSON files contain zero records for shared, William, and Jasper. I left those empty rather than inventing new user-facing yearly tasks. The yearly DBT/ADHD skill catalog is populated and usable by both users.

## Legacy code decision
Game reward bridge files named `legacy-ourspace-*` remain in `assets/` because the game HTML files actively reference them. They are integrated game bridge code, not unused source.

## Static validation
See `docs/VALIDATION.md` for automated checks run during packaging.
