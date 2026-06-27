# Diary + Positive Message hard fix

- Diary cards are now written directly into `william.html` and `jasper.html` instead of relying on an iframe or a late runtime-only mount.
- The revision script preserves the written-in diary card when rebuilding the DBT / ADHD page.
- Added `ourspace-diary-direct-fix.js` so the diary card buttons and autosave work even though the card is embedded directly.
- Positive affirmations and marquees use the latest clean William/Jasper lists and are statically present on each page, with JavaScript rotation as enhancement only.
- Bumped the service worker cache to force refresh.
