# OurSpace

Upload the contents of this folder into `LifeHelpers/OurSpace/` on GitHub Pages. Use `ourspace.html` as the public entry route.

The app includes:
- login/sign-up/reset entry
- William and Jasper pages
- JSON-backed stores, tasks, care, DBT/ADHD skills, games manifest, GiftLink, local media persistence, messenger, and installable PWA files
- backend action access on the Sync page, excluding reserved backend module until it is ready


## Mobile sign-in fix
This build points to the new Apps Script backend URL and includes JSONP fallback support for mobile browsers. For full cross-device sign-in, deploy the included `backend/OurSpace_Unified_Merged_Backend.gs` to the Apps Script web app if the currently deployed backend does not already include the JSONP callback patch.
