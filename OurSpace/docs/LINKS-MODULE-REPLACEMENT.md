**CURRENT STATUS:** Links admin editing was retired in this pass. William's exact approved Links Module placement is in `json/links_module.json`; use the new twelve-module editor instead.

# Links Module Replacement and Admin Placement — October 31, 2026

## Sources and saved layout

This package was rebuilt from `OurSpace_Bulletin_Board_William_Admin_Editor(1).zip`, `13_Links_Module.zip`, and the new `bulletin.json` supplied by the user.

- The user's bulletin placement is now the **packaged default** on `william.html`: main column, after the Guestbook, 617 px preferred width, no offset or extra vertical gap. Mobile viewports clamp this width to the usable column width. Jasper's bulletin remains at its existing default.
- Both bulletin editing UI and the `js/bulletin_board_layout.js` editing runtime have been removed, **not hidden**. The bulletin remains fully functional with a passive `js/bulletin_board_placement.js` that applies the packaged placement, and its ten design parts are still in the profile designer.
- The old Links profile form, profile-list markup, and old profile-app rendering path are physically removed. There is **one** replacement Links Module per profile.
- The replacement HTML is embedded directly in `assets/code/william.html` and `assets/code/jasper.html`. There is no `links_module.html`. It is light-DOM HTML, no Shadow DOM, iframe or isolated viewport.
- The source `links_module_profile-controller.js` provides original link title, category, URL, description, thumbnail upload/URL, local browser storage, individual link deletion, import/export JSON and a per-profile data key. Legacy profile links import when the replacement module is empty. The module keeps its own saved entries; actual account-level backend synchronization is **not** certified.
- The source CSS was fully mapped under `#linksModuleRoot` to avoid global `body`, `html`, `:root`, `.profile-grid`, `button` etc. affecting the rest of OurSpace. Its light/dark toggle now operates only on the module. Its standalone second design widget is not instantiated; the original nine design-part definitions were extracted and registered in the profile designer through `js/links_module_design_specs.js`.

## William-only #admin placement

Use `#admin` in both portal login fields, then choose William's profile. On the replacement Links section, **Move Links** supports dragging between columns and reordering in normal page flow, or keyboard arrows while focused. Eight handles resize the whole module proportionally (including fonts, controls, thumbnail displays and links), without overlapping adjacent sections. The next sibling moves down or up automatically.

**Save & export links_module.json** saves the chosen placement in local browser storage and exports `links_module.json` containing the schema `ourspace.links-module-placement.v1`, profile, column, index, neighboring anchor IDs, width, rendered height, scale factor, reference dimensions and spacing offsets. This file can be returned together with the ZIP to make the chosen placement a permanent packaged default. `json/links_module.json` starts with null defaults, deliberately awaiting that selection.

Jasper's profile contains the same Links Module and scripts, **but no admin move/resize toolbar or handles**.

## Compatibility and testing

Validated in headless Chromium at desktop 1440 px, mobile 390 px and Jasper desktop 1280 px: markup uniqueness, link add/delete, local readback, module styling targets, independent dark-mode toggle, proportional scaling, all eight resize directions, column movement, JSON export and dynamic reflow. No new backend files or route HTML were created.

The existing record-player layout, saved default, player scripts, deleted image/layout denylist, external Google Drive image references, blank pages and other profile modules are unchanged. Source thumbnail links still depend on the external hosts.

## Saved bulletin sizing from provided JSON

Saved bulletin settings: `column=main`, `index=6`, `afterId=profile-guestbook`, `beforeId=null`, `widthPx=617`, `heightPx=490`, `scaleFactor=0.51949`, `referenceWidthPx=1180`, `referenceHeightPx=790`, `horizontalOffsetPx=0`, `verticalGapPx=0`. The fixed placement uses width and reference geometry and adapts to smaller available widths; the actual rendered height follows available board content.
