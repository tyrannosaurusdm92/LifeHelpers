**Update 2026-10-31:** The 12-module admin placement editor described below has now been REMOVED. The approved `profile-modules.json` is embedded as static layout. The only new admin placement editor in this revision controls the footer messenger chat-window dimensions (the dock itself stays fixed at 40px). See `PROFILE-PICTURE-JUMP-NAV-FOOTER.md`.

# OurSpace — Twelve Replaced Profile Modules and Admin Layout Editor

## Replacement inventory

All twelve requested standalone modules were integrated as light-DOM articles inside `assets/code/william.html` and `assets/code/jasper.html`:

1. **Donation Module** (`profile-donation`; source `donation_module`)
2. **Carousel Gallery Module** (`profile-gallery`; source `carousel_gallery_module`)
3. **Profile Identity** (`profile-identity`; source `profile_identity`)
4. **Profile Tags** (`profile-tags`; source `profile_tags`)
5. **Guestbook** (`profile-guestbook`; source `guestbook`)
6. **Profile Posts** (`profile-posts`; source `profile_posts`)
7. **Profile Interests** (`profile-interests`; source `profile_interests`)
8. **Classic Pins** (`profile-pins`; source `classic_pins`)
9. **Profile News** (`profile-news`; source `profile_news`)
10. **Current Projects** (`profile-projects`; source `current_projects`)
11. **Contact Links** (`profile-contact`; source `contact_links`)
12. **Profile About** (`profile-about`; source `profile_about`)


The old profile versions were **removed from the HTML** rather than hidden. The original Profile URL and Profile Details legacy boxes were also removed because their content is now covered by the supplied Identity, About, and Contact modules. Original independent module designers are not mounted. No iframe, Shadow DOM, viewport shell, or separate module HTML file was introduced.

The supplied modules all used identical canonical CSS; this was consolidated into `css/profile_modules_style.css`, with page-wide selectors rewritten to apply only under `.pm-module-root`. Every module retains its own adapted `<module>_profile-controller.js` for its form, data rendering, export and import. Each source controller's root selector is scoped to the correct module rather than capturing the first module on the page. The original twelve theme controllers are consolidated into `js/profile_modules_theme.js` with one common light/dark toggle in the existing master menu. `profile_modules_features.js` completes the About/Donation save-and-preview forms and the gallery, tags, guestbook, contact-list and pinboard displays, without creating a second instance of a profile module.

## William's 12-module placement editor

Enter `#admin` in **both login fields** and open William's profile. The green **Profile Module Placement** bar appears. Each of the 12 replacement modules has its own draggable **Move** handle and eight resize handles at the corners and sides. Movement reorders modules in the page's actual flex-column DOM, not in overlays. Dragging across columns moves the element to that column. Shift+drag on a Move handle can adjust horizontal margin and additional vertical gap; this remains in normal document flow so later sections shift to make room. Resizing scales each entire module article, including its text, buttons, forms and pictures, proportionally while preserving its original reference geometry.

Select **Save all placements & export profile-modules.json** in the green bar or the small Save button in any module. It exports one JSON document with `schema: ourspace.profile-modules-placement.v1`, the 12 stable IDs and 12 individual placements, each including the column, neighbor anchors, sibling index, measured width and height, unscaled content height, proportional scale factor, horizontal/vertical offsets, and viewport-measurement metadata. This saves a browser-local layout key too. Return **that exported file and the current OurSpace ZIP** for the user's layout to become the packaged default. `json/profile-modules.json` currently contains the schema and initial inventory with empty profile defaults, not invented user choices.

Jasper's profile has the twelve replacement modules without those admin placement handles or buttons. Its content and design controls remain available to the authorized profile owner. The existing profile designer exposes all nine original source design roles separately for each of the twelve modules (**108 part targets plus 12 module-background targets**), alongside the record player, bulletin and links design roles. Colors have native color pickers plus hex inputs; fonts and text size have their original module roles. These rules are scoped to the selected module's source `data-os-design-scope` and never restyle sibling modules.

## Previously approved placement retained

- Record player: 327 × 408 px, sidebar after Profile Identity, from the earlier `record-player.json`. No record player editing controls.
- Bulletin board: 617 × 490 px recorded, main column after Guestbook, from the earlier `bulletin.json`. No bulletin editing controls.
- Links Module: **617 × 399 px**, main column after Profile About and before Profile Posts, from the newly supplied `links_module.json`, proportional scale factor **0.71268**. The Links Module's admin resize/move toolbar, eight handles, and old editor logic were removed; its functional link-entry and design controls remain.

`json/deleted.json` remains the user's deletion denylist. Prior image catalog and layout preset changes remain.

## Data and backend limitations

The replacement module ZIP describes its own storage as **browser-local**. Its original controllers persist module records to `myspace_module_<profile>_<kind>` localStorage keys; those module-specific records are **not guaranteed to synchronize across devices** until the user's unchanged existing backend supports them. A guarded one-way migration can populate empty replacement modules from existing profile data without overwriting newer module records. The original normal-login backend and `ourspace-auth.js` are unchanged. No backend URL or replacement backend was introduced. In particular, Donation displays a progress editor but the source supplied no live Stripe checkout integration; the display must not be interpreted as working payment processing.

## Testing

Chromium in-memory browser tests ran for William at 1440 and 390 CSS pixels, and Jasper at 1024. Checks included the 12 module roots, no duplicate legacy HTML, deletion of the old Links admin controls, exact saved Links placement, identity form saves, whole-content resize and neighbor reflow, all eight handles, independent resize on all twelve modules, cross-column movement, JSON export and reload restoration, 108 designer targets and scoped color control, and preserved bulletin / record-player anchors. The test browser blocked local network navigation, so tests used the actual HTML, CSS, and JS in an in-memory page; this does not substitute for production backend testing. External image URLs and account backend actions were not independently verified.
