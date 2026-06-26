# MySpace Layout Update Notes

Updated user pages:
- william.html
- jasper.html

Implemented changes:
- Added page-scoped MySpace layout storage through `state.pageMyspaceCodes`.
- Each customizable page now keeps its own independent design code.
- Added OurSpace style hook parsing for converter output blocks marked `OURSPACE_STYLE_HOOKS`.
- Added MySpace 1.0 / 2.0 compatibility module aliases at runtime, including classic names such as `friends`, `friendSpaceModule`, `contactTable`, `commentsModule`, `blurbsModule`, `detailsModule`, `interestsModule`, `orangetext15`, and `whitetext12`.
- Added page hook support for header text, subtitle/status text, body intro text, module placement, module gap, and module order.
- Reorganized DBT / ADHD page order:
  1. Saved DBT / ADHD Entries
  2. Mood Tracker + Diary Cards
  3. Skill Menu
- Merged Mood Tracker and Diary Cards into one DBT / ADHD module.
- Moved Journal Entry to the Home page and made it larger.
- Removed the Home page Project Board module and removed the Home Diary Card module.
- Added local diary card HTML files under `diary_cards/` for William and Jasper.
- Added the updated converter at `MySpace_Visual_Style_Converter.html`.

Note:
- Font binary files are not included in this returned zip. Keep your existing font files in place if you still want the custom local fonts.
