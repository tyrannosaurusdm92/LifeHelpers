# Patch — Diary Mount + OurSpace Brand Font

- Replaced the iframe diary-card mount with a direct in-page diary-card loader inside the Mood Tracker + Diary Cards module.
- Added a fallback direct-open button if the diary card cannot load in-place.
- Kept each profile pointed to the correct personalized diary card file:
  - William: `modules/diary/william_dbt_disability_guilt_diary_card.html`
  - Jasper: `modules/diary/jasper_dbt_adhd_caregiver_diary_card.html`
- Added a local `OurSpaceBrand` font face using `assets/fonts/love-ya-like-a-sister/LoveYaLikeASister.ttf`.
- Added a DOM brand pass that wraps visible OurSpace text in `.ourspace-brand-text` so the brand name always renders in the local brand font.
- Comic Sans is kept only as the final fallback after the local brand font and the normal named web font.
- Bumped the service-worker cache to refresh installed app copies.
