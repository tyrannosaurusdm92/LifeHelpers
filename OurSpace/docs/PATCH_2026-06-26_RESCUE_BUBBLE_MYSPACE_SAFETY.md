# Patch: Rescue Bubble + Safer MySpace Layouts

## Purpose
This patch keeps MySpace/SpaceHey/Fillster visual styling powerful while preventing old layout CSS from trapping the app controls, hiding buttons, zeroing modules, or blocking recovery.

## Changes
- Replaced the fixed repair panel with a collapsible movable Layout Rescue bubble.
- Collapsed rescue bubble is 75x75 pixels.
- Bubble can be dragged while collapsed or expanded.
- Added a page selector inside the rescue panel so one page's saved layout code can be removed without deleting other pages.
- Kept emergency URL recovery routes:
  - `william.html#safe`
  - `william.html#clear-layout`
  - `jasper.html#safe`
  - `jasper.html#clear-layout`
- Protected app navigation, rescue controls, and core action buttons from user pasted layout CSS.
- Made each page's MySpace code independent by scoping converted layout CSS to the selected page key.
- Sanitized common destructive old MySpace rules:
  - `display:none`
  - `visibility:hidden`
  - `opacity:0`
  - zero width/height
  - absolute/fixed/sticky positioning
  - dangerous z-index values
  - old IE `expression(...)`
  - script/iframe/object/embed/form/event-handler fragments
- Preserved visual layout features:
  - fonts
  - colors
  - page backgrounds
  - module backgrounds
  - borders
  - buttons/links
  - headings
  - module styling
- Updated uploaded/selected background images so they override the layout background image while preserving layout colors, fonts, borders, and module placement.
- Added missing lowercase `ourspace.html` for GitHub Pages routes.
- Bumped the service worker cache to `ourspace-layout-rescue-bubble-v2`.

## Backend
The locked backend URL was not changed.
