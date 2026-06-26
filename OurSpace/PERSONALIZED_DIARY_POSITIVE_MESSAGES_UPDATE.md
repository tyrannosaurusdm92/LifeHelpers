# Personalized Diary Cards + Positive Messages Update

Implemented on 2026-06-26.

## Included
- Replaced the prior small diary card HTML files with the attached personalized diary cards.
- Kept the William diary card path: `diary_cards/william_dbt_disability_guilt_diary_card.html`.
- Kept the Jasper diary card path: `diary_cards/jasper_dbt_adhd_caregiver_diary_card.html`.
- Increased the DBT / ADHD diary iframe height for the larger fillable cards.
- Merged the attached profile-positive data into `assets/ourspace-data-catalogs.js`.
- Added standalone profile message files at `json/william/data/positive_messages.json` and `json/jasper/data/positive_messages.json`.
- The named-cat/character messages from the attached positive-message file were not placed into the profile marquee or rotating positive-message pool.
- Service worker cache version bumped so the browser refreshes the updated diary cards and message catalog.

## Counts
- William: 9 marquee entries, 55 positive affirmations.
- Jasper: 9 marquee entries, 52 positive affirmations.

## Notes
The page code still has runtime filtering for named-cat/character text, and the message catalog is also pre-filtered so profile-positive messages stay profile-focused by default.
