# OurSpace — Legacy Widget / Game Retirement

The old Onyx Widget and its integrated CAT-astrophic Cuteness and Picnic Panic games have been intentionally **removed** from this version of OurSpace. The standalone Skills workbook, 102 DBT handout/worksheet HTML pages, and their associated code/data have also been removed. Do not restore the old modules when integrating a separately developed replacement.

## Current functional pages

- `ourspace.html` — sign-in and PWA installation.
- `assets/code/william.html` and `assets/code/jasper.html` — profile, household, journal/diary, feed, communication, audio, visual and store pages.
- The **journal/diary's independent skills-tracking checkboxes** remain. The retired full Skills/DBT workbook page does not.
- `script/profile/photo-crop.js` is a preserved profile-photo utility relocated out of the retired `script/game/` folder.

## Retained shared features

The profile pages, Messenger, Household local organizer, Bulletin/corkboard, account settings, Design Widget, record player, journal/diary and visual/audio/store pages remain. Installed-app icons and generic numeric push notification codes `01`–`18` remain as a protocol contract; **retaining category labels does not restore the old widget**.

The previous Onyx-to-Household worksheet assignment bridge and old game wallet sync hooks were retired. The Household organizer preserves independent saved tasks and runs in local mode; use its JSON export for a backup until a compatible future sync integration is available. The Google Apps Script backend is not included in this ZIP and has not been edited.

## Directories

- `assets/images/app/` — original PWA icon assets.
- `assets/images/bulletin/`, `assets/images/OurSpace Branding/` — preserved artwork.
- `assets/audio/` — unrelated Messenger alert/call sounds.
- `assets/code/` — the two profile pages; the old Onyx/Skills pages have been removed.
- `script/`, `style/`, `json/` — surviving feature-specific files, with the source's other directory names preserved.
- `docs/OURSPACE_LEGACY_REMOVAL_QA.json` — current inventory and checks.

Some older QA and historical documentation describes modules that no longer exist; it is archival only. Always use the current removal QA report and current code, not those older reports, to determine which files belong in this package.
