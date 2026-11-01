# OurSpace – Final Modules Integration

## Installation and files

- `assets/code/william.html` and `assets/code/jasper.html` each include a native Household section (`#osHouseholdModule`) and native Skills section (`#osSkillsModule`) as actual DOM markup. Neither section uses an iframe, Shadow DOM, or a separate Household HTML file.
- `assets/code/DBT/` holds the 102 source DBT/skills exercise HTML pages. `assets/code/skills.html` and `assets/code/onyx_widget.html` remain as permitted standalone source entrypoints. The integrated user-facing Skills and Onyx interfaces are also in the two profile pages.
- Original module function scripts and page CSS were transferred to `js/`, `script/` and `css/`, with selectors and conflicting IDs scoped as necessary for the surrounding OurSpace pages.
- `json/pages.json` marks the Household and Skills routes as implemented. The existing Communication page, shared messenger sidebar and scroll wheel remain; no second messenger is instantiated.

## Editing and exporting

- In `william.html` with a valid `#admin` session, visit `?page=household` or `?page=skills` to find the module drag bar and eight resize handles (corners and sides).
- Moving the module adjusts its normal-flow margin offsets; resizing changes the container dimensions without creating a floating overlay over other sections. A portion of the height is scrollable when needed. These positions remain within the available page width.
- **Save layout & export final-modules.json** saves both Household and Skills settings to local storage and downloads `final-modules.json`. Its schema is `ourspace.final-modules-placement.v1` and the file includes both page module geometry records.
- The previous Communication editor was unloaded. Store, Communication and Journal/Diary continue as ordinary display sections with the previous integration preserved. Jasper has no admin resize/export handles.

## Design widget

- The existing OurSpace quill Design Widget remains the only site-wide designer. Twenty-six added selectors are registered per applicable page: nine Household targets, five Skills targets and twelve Onyx targets (Journal and Communication pages). The separate source-module design panels are not instantiated.

## Cross-module connections

- `script/ourspace-module-bridge.js` offers a profile-specific, local-storage-backed way to link Onyx/Professor DBT assignments to Household tasks and to the original DBT handout/worksheet pages. The Household task interface listens for local storage updates and in-page save events.
- Onyx's native widget mount and fullscreen modes are present in the two profile files. Their original scripts load on Journal/Diary and Communication routes; the widget mount is hidden on other routes. The source's therapist/DBT material is preserved as content, not represented as professional medical care.
- The existing Communication page and sidebar messenger use the same preexisting controller and sync code, including its existing backend transport where configured. No new messaging transport or independent communication data store is added.

## Verification and limitations

- Integration checks: JavaScript syntax, local relative asset resolution, section existence and identity, DBT page count, and ZIP integrity.
- Isolated Chromium checks: both Household and Skills render, William's controls drag/resize/save/export, Jasper has no admin handles, and Onyx's mount is only visible on the intended routes.
- Full hosted navigation, authenticated server sync, Onyx's remote brain, and cross-device messaging could not be exercised in the isolated test environment. Verify these against the deployed backend before assuming synchronization across devices.
