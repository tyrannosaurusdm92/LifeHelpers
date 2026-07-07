# OurSpace

Upload the contents of this folder into `LifeHelpers/OurSpace/` on GitHub Pages. Use `ourspace.html` as the public entry route.

The app includes:
- login/sign-up/reset entry
- William and Jasper pages
- JSON-backed stores, tasks, care, DBT/ADHD skills, games manifest, GiftLink, local media persistence, messenger, and installable PWA files
- backend action access on the Sync page, excluding reserved backend module until it is ready


Backend locked frontend URL: https://script.google.com/macros/s/AKfycbwK-F1BfXbkiVkQXFA0Z1acKxFJgeGU6zckChEmSc8ANqLA1mbqUOWSf6_H1CGFtwW7WA/exec
Mobile sign-in patch: simple POST + GET fallback, per-device session tokens.


## 2026-06-26 mobile backend patch
Use the locked backend URL only. Upload all files in this folder to `LifeHelpers/OurSpace/`, including lowercase `ourspace.html`. The app now signs in through the backend so the same William/Jasper account can be used on phone, laptop, tablet, and desktop without signing out elsewhere.


## Temporary no-sign-in profile chooser

This build removes the sign-in requirement. The landing page opens William or Jasper directly and writes a lightweight local session so existing profile tools continue to work. Backend endpoints remain pointed at the locked Apps Script URL supplied for this build.
