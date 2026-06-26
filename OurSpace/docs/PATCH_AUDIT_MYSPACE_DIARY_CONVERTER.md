# OurSpace MySpace + Diary Patch

- Diary cards are embedded into William/Jasper pages with iframe `srcdoc` data so path/cache issues cannot leave the module blank. The original files remain under `diary_cards/` and can still be opened directly.
- MySpace BODY/HTML rules now target the real active page body via `body[data-current-page]`, not only the center module overlay.
- MySpace module/button/heading/font/border selectors now map to live OurSpace module aliases.
- Active MySpace pages make the app background transparent enough for full-page backgrounds to show.
- Added `OurSpace_Profile_Style_Converter.html` as a Sync page module.
- OurSpace word styling now uses `love-ya-like-a-sister` from `assets/fonts/love-ya-like-a-sister/`, falling back to Comic Sans/cursive.
