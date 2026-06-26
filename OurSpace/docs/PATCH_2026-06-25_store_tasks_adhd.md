# Patch: Store aisles, GiftLink placement, ADHD cleanup, weekly/monthly tasks

## Completed
- Added store aisle dropdowns with **Show all** as the default option.
- Moved GiftLink/Wishlist controls toward the top of each Store page.
- Replaced legacy support-bot references in app data with ADHD skill wording.
- The game launcher hides legacy support-bot records from the dropdown without deleting game files.
- Added weekly/monthly disability-kindness tasks for bathroom care, therapy/admin, laundry, trash, supplies, food safety, wheelchair/oxygen checks, MCAS trigger reduction, spine-kindness resets, and caregiver-burnout check-ins.
- Each new chore/task is broken into tiny steps and uses stop-early / ask-for-help language.

## Validation
- JSON catalogs parse successfully.
- Both user pages include the store aisle selector, top GiftLink area, and hidden legacy game filter.
- Store products combine shared + profile JSON while preserving William/Jasper profile-specific filters.
