# Ourspace Guides

Consolidated source documents from the supplied OurSpace archive. Each numbered section retains its original filename and content; historical claims describe their original revision, not necessarily the current build.

## Contents
- [BACKEND-INTEGRATION.md](#source-1)
- [BACKGROUND-IMAGE-LIBRARY.md](#source-2)
- [BULLETIN-BOARD-INTEGRATION.md](#source-3)
- [COMMUNICATION-MODULE-INTEGRATION.md](#source-4)
- [DELETIONS-AND-SAFE-PRESETS.md](#source-5)
- [DESIGN-PRESET-CATEGORY-LIVE-PREVIEW.md](#source-6)
- [DESIGN-WIDGET-100-PRESETS-UPGRADE.md](#source-7)
- [FINAL-MODULES-INTEGRATION.md](#source-8)
- [FULLSCREEN_DBT_REVIEW.md](#source-9)
- [GITHUB-REPLACE-INSTRUCTIONS.md](#source-10)
- [JOURNAL-DIARY-INTEGRATION.md](#source-11)
- [LINKS-MODULE-REPLACEMENT.md](#source-12)
- [NAVIGATION-AND-ACCENT-COLORS.md](#source-13)
- [OURSPACE_PRISMSHIFT_INTEGRATION.md](#source-14)
- [OURSPACE_PROFILE_LOCKED_2026-11-02.md](#source-15)
- [OURSPACE_SCOPED_HUD_RECOLOR_IMPLEMENTATION.json](#source-16)
- [OURSPACE_SCOPED_HUD_RECOLOR_IMPLEMENTATION.md](#source-17)
- [OURSPACE_UNIFIED_DESIGN_AND_FEED_UPDATE.md](#source-18)
- [PAGE-FILLS-INTEGRATION.md](#source-19)
- [PROFILE-MODULES-REPLACEMENT.md](#source-20)
- [PROFILE-PICTURE-JUMP-NAV.md](#source-21)
- [PROFILE_GRID_EDITOR_INSTRUCTIONS.md](#source-22)
- [PROFILE_LAYOUT_2026-11-02.json](#source-23)
- [README.md](#source-24)
- [RECORD-PLAYER-REPLACEMENT.md](#source-25)
- [REMOVALS_AND_DRIVE_MIGRATION.md](#source-26)
- [SIDEBAR-MESSENGER-INTEGRATION.md](#source-27)
- [STORE-INTEGRATION.md](#source-28)
- [STORE-MODULES-INTEGRATION.md](#source-29)
- [skills_workbooks_handouts_DESIGN_WIDGET.md](#source-30)

---

<a id="source-1"></a>

## 1. BACKEND-INTEGRATION.md

# Existing backend integration, without backend replacement

The user's existing Apps Script backend is **not** included here and is not modified. Its deployment address is deliberately absent from the frontend.

The client only calls `POST /api/ourspace` on the **same origin**, with `Content-Type: text/plain;charset=UTF-8`, the JSON envelope `{"action":"...","data":{},"clientId":"ourspace-browser","sessionToken":"..."}` (session token only after verified login). The host must route this trusted relative path to the existing deployment, forward response bytes correctly, and preserve response status. Configure that upstream on the server/hosting layer, never in downloadable JavaScript or HTML. Without such a gateway, ordinary sign-in cannot work; the site should show an error rather than invent an authenticated session.

Existing actions used by the client:
- `auth.signin` -> requires an authoritative `sessionToken` and `user.profileKey` in `william|jasper`.
- `auth.signout`.
- `auth.password.forgot` -> request delivery methods and/or a verification challenge.
- `auth.password.reset` -> identifier, code, newPassword, challengeId.
- `profile.get` / `profile.save` -> private profile read/save, **verify the contract and field mapping** before production.
- `public.profile.get` -> published-only, read-only visitor view.

The login treats a browser's password manager as responsible for saved passwords; passwords are never written to localStorage. The remember-device checkbox controls whether the validated session is persisted in localStorage or sessionStorage. Server-side sessions/authorization remain authoritative.

The designer's canonical state schema is `{version,targets,styles,selected,presets,activePreset,showDemo}`. A profile-scoped sync adapter should support `{profileKey,pageKey,state}` via `profile.design.get` and `profile.design.save`, or map those to a compatible existing account-preferences operation. **These actions must be checked for actual support**; the included frontend does not make backend changes and cannot make a static offline page guarantee cloud sync. Server must reject users attempting to read another person's private page and must not accept `#admin` as a real privileged session.

The `assets/code/*.html?public=1` reader fetches only published records. It does not display browser-local or server-private profile data as a fallback. Keeping a private field out of a published response is a backend responsibility.

Deployment checks: verify authenticated sign-in, both profiles' authorization, recovery delivery and reset, private saves across devices, read-only public profile behavior, background-image/asset URL authorization, design read/write actions, PWA install prompt, Apple Add to Home Screen, and HTTPS service worker update flow.


---

<a id="source-2"></a>

## 2. BACKGROUND-IMAGE-LIBRARY.md

# Background image library added to OurSpace designer

- Based entirely on the supplied `OurSpace_Interests_Free_Use_Image_Links(2).txt`.
- All **121 individual image links** across **58 interests** are retained, each with its source/license page.
- The six categories are Aesthetics & Styles (15), Colors & Color Preferences (10), Themes & General Interests (36), Music (18), Movies & Television (30), and Video Games (12).
- The Images tab has category selection, interest/subcategory selection, keyword search, and eight thumbnail previews at a time. No images from the library are requested until someone chooses a category. Thumbnails are loaded from Commons using width-limited redirect URLs, when the upstream host supports them; the **original direct image link** is preserved for applying to the page.
- A selected image previews directly on the chosen style target (website background, module, etc.) until **Keep** or **Undo**; it is not added to profile/browser sync before Keep. Switching image selections previews against the same prior state.
- The original upload field, custom URL input, placement/tiling/image overlay controls, six category layout preset gallery, local saved looks, and profile/page segregation remain untouched.
- `json/design/background-image-library.json` stores the complete structured catalog. The code also embeds those references into the designer JS and the single-file standalone HTML, so no network request for catalog metadata is required.
- External Commons images may fail to load or redirect; a failed preview shows a placeholder and retains the source/license link. Image availability was not independently verified. Each Commons file may require attribution or share-alike compliance, and subjects from TV, games, or music may involve additional rights.

## October 31 catalog replacement

The previous Commons-only list has been updated: 58 selected Commons images were removed, 63 kept, and 58 Drive WebP links added. See `json/design/drive-image-library.json` and `docs/REMOVALS_AND_DRIVE_MIGRATION.md`. The Real Life category has 57 entries, while Trans Rights Or I Bites is in Themes & General Interests. No Drive WebP bytes are packaged.


---

<a id="source-3"></a>

## 3. BULLETIN-BOARD-INTEGRATION.md

# OurSpace — Bulletin integration (2026-11-01)

## In-place replacement

The standalone `03_Bulletin_Board` source was integrated directly into the existing `#profile-bulletins > #bulletinBoardModule` in both `assets/code/william.html` and `assets/code/jasper.html`. It is not an iframe, a second HTML page, or an overlay replacing the profile. The original outer profile-box heading, parent placement controller, 1180×790 design space, proportional scaling, William/Jasper profile arrangement, and unrelated OurSpace modules were preserved.

The Bulletin markup and behaviors now come from the supplied latest aligned-samples ZIP, including the header/HUD, nine feature tiles, separate board details strip, corkboard, four aligned sample notes, decorative pins, movable panels, custom heart scrollbar, Craft Studio, and movable/collapsible designer bubble. The Corkboard image is stored locally in `assets/bulletin/`.

## Isolation and assets

`style/bulletin/bulletin_board_style.css` is the scoped conversion of the source's canonical `css/bulletin.css`, with an embedded 790px root and no global `html`, `body`, button, or `:root` rules. `script/bulletin/bulletin_board_app.js`, `script/bulletin/bulletin_board_design_widget.js`, `script/bulletin/bulletin_board_craft_studio.js`, and `script/bulletin/bulletin_board_postit-colors.js` are the working integrated sources. All original artwork references now resolve from `assets/code/*.html` to `../../assets/bulletin/`. Original assets are copied without modification. The six OpenMoji files are CC BY-SA 4.0; the supplied Vecteezy corkboard art may require separate attribution and licensing review for publication. See `json/bulletin/bulletin_board_module_source.json`.

The module has its **own heart-controlled pinboard scroll** in `#workspace-viewport`; the entire OurSpace page and sibling profile modules are unaffected. The design widget has unique IDs and is moved to `document.body` before startup to prevent the scaled profile module from trapping its floating drag positions. No `OurSpaceDesignWidget` global is overwritten. Existing profile Design Studio includes updated Bulletin targets.

The board uses profile-namespaced local storage to keep William and Jasper's notes apart. Stored content is local-browser data; it is not automatically synced between devices or to the site account. No old personal saved content was deleted or overwritten as part of this file edit.

Dark-gold buttons with white text and red hover/focus provide the agreed contrast. Original OurSpace module geometry is governed by the unchanged `script/bulletin/bulletin_board_placement.js` and `json/bulletin/bulletin.json`.

## Validation checklist

Open both profile pages in the main OurSpace site and check the profile's Bulletin section: sample notes should include `One object, many contexts` centered, `Example event scrap` centered, and `Research reference` right aligned. Change section using the nine HUD tabs, scroll inside the board using the heart, open a board menu, add and edit a Post-it, use Craft Studio, reopen the floating design bubble, and confirm other profile sections stay their original size and position.


---

<a id="source-4"></a>

## 4. COMMUNICATION-MODULE-INTEGRATION.md

# Communication page — native integration

**Files:** `assets/code/william.html` and `assets/code/jasper.html` both contain one native `data-ourspace-page="communication"` section inside `#ourspacePageArea`, replacing the missing/blank destination. There is no separate communication HTML file, iframe, Shadow DOM, or second page layered on the blank placeholder.

## Messenger and Sidebar scroll wheel

The **existing** `js/sidebar_messenger_messenger.js` owns the MessengerPlugin instance mounted on `#sidebar-messenger-root` and exposes `window.ourspaceMessenger`. It already includes the full-page communication controller, which now binds to the inserted `[data-oscomm]` view. Both presentation layers share the same underlying conversation IDs, messages, sent/received updates, selection, presence, attachments, and voice/video controller. The six-item vertical rail with its draggable blue scrollbar (`[data-menu-track]`) stays the same. Selecting a room from either page or sidebar calls the shared `openConversation()` wrapper; message events render both interfaces. The source communication package is not loaded as a second `MessengerPlugin` or second transport. The separate `js/ourspace-communication-media.js` preserves source pinned-message, camera/video, transcription and quick-chat extras while using this one instance.

**Network limitation:** Browser-local and same-origin tab synchronization are the available fallbacks. `js/sidebar_messenger_sync.js` attempts `messenger.sync` only for a verified account. Whether the deployed `/api/ourspace` backend actually supports the method and cross-device delivery requires live testing. Camera and microphone require browser permissions and HTTPS/localhost. These are not asserted to be deployed.

## Design widget

The one existing profile Design Widget loads 58 granular `communication` targets from `js/ourspace-communication-design-specs.js` before `js/design-widget.js`. These include the nine original source designer categories plus named controls, message panels and the composer. Selectors are scoped to `#osCommunicationModule`; there is no second module designer floating overlay. The original design source and original CSS and JS are archived as `.txt` files under `docs/` for reference. The running communication stylesheet `css/ourspace-communication-source.css` retains source communication-specific rules but omits global styles for other pages and the obsolete footer.

## William's admin editor and JSON

With William signed in through `#admin`, open `assets/code/william.html?page=communication`. Drag the module with the top bar; eight handles resize its corners and sides. All position and size changes use width, height, and positive normal-flow margins, not overlay/absolute positioning, so later sections are pushed away naturally. Keyboard arrows also resize handles. **Save layout & export communication.json** stores browser-local placement and downloads schema `ourspace.communication-placement.v1` with dimensions and offsets. Jasper sees the Communication page but cannot edit placement in that profile.

## Previous stores

The Store placement runtime/editor `js/ourspace-store-layout.js` is gone from both profile HTML files and from this bundle. Original source Store catalogs, checkout, styles, and business logic are preserved. The supplied `stores.json` was imported to `json/store/stores-imported-placement.json`, with William's 1674×1150 module and (0,24) offset applied as fixed CSS. Jasper continues to use Squishy Store. Journal & Diary placement remains saved and read-only.

## Validation

In a Chromium isolated rendering test using the actual native page HTML, CSS, existing Sidebar Messenger runtime, communication media additions and layout editor: William and Jasper page rendered with one Sidebar Messenger core, six sidebar wheel entries, and no JavaScript errors; four conversation selectors populated; page-to-sidebar and sidebar-to-page selection passed; page sends updated the single message store; eight handles moved and resized; JSON export downloaded `communication.json`; Jasper had zero edit handles. Full application HTTP navigation was blocked by this browser environment, so actual signed-in backend/camera/cross-device flows were not verified.

## Final layout and styling audit

The selective source stylesheet was checked for malformed nested functional selectors and corrected without importing unrelated global source selectors. Communication's inner conversation grid now expands to the admin-sized frame rather than retaining the original site's 1100px maximum. On the Communication page only, the main profile frame is allowed to use available width **up to the fixed sidebar rail's left edge**. In the rail-present Chromium test at 1800×1000, the SE handle was pointer-accessible; dragging it changed dimensions from 1584×900 to 1491×982 while the rail remained to its right. This does not alter other pages' sidebar or design widget placement.


---

<a id="source-5"></a>

## 5. DELETIONS-AND-SAFE-PRESETS.md

# OurSpace safe design presets and permanent catalog deletion registry

## Root cause and profile-safe style rules

The previously reprogrammed 100 layout presets styled `body` with font-size, padding, border, opacity, background and text in one rule, and matched broad `header`, `h1`, `ul`, etc. selectors. This could override the profile grid, module sizing and nested controls. The updated designer compiles decoration-only CSS. It targets explicit `data-design-target="..."` elements, never generic headings, page-wide headers or unregistered components. It keeps existing geometry, positioning, module height/width, scrolling and event handlers. The `body` selector receives background image and color settings only, never layout geometry. Widgets' existing buttons/forms remain functional. It retains individual target colors, images, fonts, borders, and text decoration, within safe limits.

## Deletion registry (passive, no in-browser deletion UI)

The former layout/image admin checkbox manager, Admin cleanup tab, and Delete selected action were removed in the record-player replacement pass. `json/ourspace main/deleted.json` remains as a **read-only tombstone manifest** for previously removed layouts/images. All catalog imports from another chat should filter against this file by ID and matching original source URLs. New deletion requests should be sent with a separate list and the package for a deliberate rebuild, not made through this release's frontend. This release uses `#admin` only for the record-player placement editor on William’s profile.

## JSON schema / canonical identifiers

`choices.json` uses `schema: "ourspace.catalog-removals.v1"` and a `removed` object, with `layouts` and `images` arrays. Each entry includes `id`, `title`, `category`, optional `subcategory`, `sourceUrl`, `wallpaperUrl` and `thumbnailUrl`.

`json/ourspace main/deleted.json` uses `schema: "ourspace.deleted.v1"`, `version: 1`, `layouts: []`, `images: []`. **A deletion is authoritative if either its canonical ID or one of its source/image URLs matches.** Normalize URLs before matching. The new widget blocks application and saves from banned URLs; it sanitizes imported profile design state and saved looks, as well as its own two catalogs.

The bundled `json/ourspace main/deleted.json` starts empty because no images/layouts have been selected for removal yet. The webpage cannot rewrite this static ZIP file in place. Export your selections; the following ZIP merge will populate it. Other ChatGPT chats or independently developed widgets cannot automatically see this chat's local browser storage. They must receive/use the current `deleted.json` or the updated OurSpace package and follow this filtering rule. A shared standalone module that doesn't read the registry can still reintroduce a deleted asset, so enforcing this when modules are merged is required.

## Compatibility

The original MySpace-style profiles, login, backend connection details, blank page destinations and standalone design widget remain intact. After the October 31 choices.json update, 6 layouts and 58 image references were permanently deleted: 94 layouts and 121 image references remain, with 58 Google Drive-hosted replacements. See docs/REMOVALS_AND_DRIVE_MIGRATION.md. Admin removal is an authoring/preview convenience, not a privileged backend account. Exclusion lists are not authorization controls.

## Testing performed

Chromium desktop (1440px) and narrow/mobile (390px) verified admin-only access, multi-category checkbox selection, automatic choices.json export, immediate filtering, non-admin hidden controls, and no client-side errors. All 100 preset preview styles were separately applied to the actual profile and measured against the pre-preset app width, header height, column widths, module count and body padding/borders: none changed. Remote wallpaper availability was not verified; a server-side image URL can still be down independently of the site's geometry.


---

<a id="source-6"></a>

## 6. DESIGN-PRESET-CATEGORY-LIVE-PREVIEW.md

# OurSpace Design Widget — Category Browsing and Live Keep/Undo (October 31, 2026)

This pass modifies the supplied **OurSpace_MySpace_100_Preset_Upgrade(1).zip** in place as a new deliverable. No login, profile, backend, or unrelated module was replaced.

## Browse categories instead of 100 previews at once

The 100 existing archive-linked presets remain in the embedded catalog, but the gallery initially shows only six choices and **zero thumbnail images** until a category is chosen:

1. Aesthetics & Styles (19)
2. Colors & Color Preferences (27)
3. Themes & General Interests (39)
4. Music (5)
5. Movies & Television (3)
6. Video Games (7)

Each item belongs to exactly one category. These are practical **visual-inspiration groupings** based on the archival title and appearance, not assertions that a preset is officially associated with any film, band, artist, show or game. The original archive category, title, image URL and source link are preserved. The six categories are authored in the user's requested order.

Only **eight thumbnails** render on a gallery page, with Previous / Next paging. Searches apply within the currently selected category; changing categories clears search results. Thumbnails use lazy loading, low fetch priority and asynchronous decoding. Background images are not loaded as hidden CSS backgrounds for every gallery card. The selected layout's detailed image remains available on demand.

## Real profile preview before save

Clicking a layout card (or Preview on profile) immediately styles the **actual visible page behind the designer**, including its profile modules, rather than just a small simulated comparison. Its prior saved state is captured before any trial.

A prominent Keep / Undo bar remains visible while previewing. **View profile** temporarily hides the designer so the member can inspect more of the page without losing the buttons. Reopening the bubble returns to the designer and pending trial. The red X and Escape discard an unconfirmed trial. Switching designer tabs is blocked until Keep or Undo is explicitly chosen. Selecting another preset within the gallery replaces only the temporary preview, without replacing the saved baseline.

- **Keep** saves the new design to the current profile/page storage key, adds one undo-history entry and triggers the same existing optional account-sync event as any committed design change.
- **Undo** restores the pre-preview design and does not write the trial to browser storage or trigger account synchronization.
- Without Keep, refreshing or leaving the page never commits the trial.
- Original six saved personal looks, text/color/scrollbar tools, target discovery, export/import, per-page style-copy controls and the older historical 100 entries remain available.

## Files changed

- `js/design-widget.js`: category metadata/UI, paging, preview state machine and Keep/Undo controls.
- `css/design-widget.css`: category chooser and fixed confirmation bar.
- `assets/code/william.html` and `assets/code/jasper.html`: visible Keep/Undo bar for both profile documents.
- `assets/code/design-widget.html`: same gallery and confirmation behavior in the independent standalone editor.
- `service-worker.js`: static-shell version bumped so browsers can obtain the new UI assets.

No new HTML file or extra nested folder was introduced. All other files from the incoming ZIP are retained.

## Test coverage

Chromium checks completed at 1440px, 1024px and 390px on the two profile pages and on the standalone designer. Confirmed no thumbnails before category selection, maximum eight cards after selection, on-page CSS changes on preview, no storage write before Keep, complete CSS restoration with Undo, persistence only on Keep, and automatic preview cancellation from the red X. Checks did not contact the user's backend, fetch all archived image sources, or prove external image availability.

## October 31 removal update

Six selected layout presets were removed from the archive, reducing the active gallery from 100 to 94. See `json/ourspace main/deleted.json` for the permanent tombstones.


---

<a id="source-7"></a>

## 7. DESIGN-WIDGET-100-PRESETS-UPGRADE.md

# Design widget upgrade: 100 Archive Presets

This ZIP updates the prior OurSpace starter without adding, removing, or rearranging profile modules, login, authentication, or backend functionality.

The upgraded design widget is present on both profiles and every intentionally blank destination. The new **100 Presets** tab contains exactly 100 distinct entries taken from the supplied upgraded standalone widget (91 with an original archive wallpaper URL and 9 with a substitute URL). Each entry includes an archive thumbnail link, a source page link, a category, a wallpaper link, and an OurSpace interpretation preview. **Assets remain hosted at their source URLs; screenshots and wallpapers are not embedded locally or guaranteed to remain available offline.**

Added editing controls include background image overlays, opacity, selectable patterns, text outlines and the historical-font choices. The former standalone upgrade has been absorbed into the shared Quill JS/CSS and its separate HTML file is intentionally absent.

Existing per-profile/page local storage keys (`ourspace.design.v2.<profile>.<page>`) remain compatible, so existing saves and six personal slots are preserved. Profile/module design roles are discovered from page markup; copied design applies only to compatible types. Optional server sync still depends on the already configured backend and existing proxy.

No Shadow DOM, design iframes, new backend file, new profile module or extra HTML route was introduced. The current cottage image continues as the profile design bubble; the standalone file retains its uploaded original icon artwork.

## October 31 removal update

This document describes the historical 100-entry source archive. Six user-selected entries were removed in the current release; 94 are active. The supplied choices are preserved only in `json/ourspace main/deleted.json`.


---

<a id="source-8"></a>

## 8. FINAL-MODULES-INTEGRATION.md

# OurSpace – Final Modules Integration

## Installation and files

- `assets/code/william.html` and `assets/code/jasper.html` each include a native Household section (`#osHouseholdModule`) and native Skills section (`#osSkillsModule`) as actual DOM markup. Neither section uses an iframe, Shadow DOM, or a separate Household HTML file.
- `assets/code/DBT/` holds the 102 source DBT/skills exercise HTML pages. `assets/code/skills.html` and `assets/code/onyx_widget.html` remain as permitted standalone source entrypoints. The integrated user-facing Skills and Onyx interfaces are also in the two profile pages.
- Original module function scripts and page CSS were transferred to `js/`, `script/` and `css/`, with selectors and conflicting IDs scoped as necessary for the surrounding OurSpace pages.
- `json/ourspace main/pages.json` marks the Household and Skills routes as implemented. The existing Communication page, shared messenger sidebar and scroll wheel remain; no second messenger is instantiated.

## Editing and exporting

- In `william.html` with a valid `#admin` session, visit `?page=household` or `?page=skills` to find the module drag bar and eight resize handles (corners and sides).
- Moving the module adjusts its normal-flow margin offsets; resizing changes the container dimensions without creating a floating overlay over other sections. A portion of the height is scrollable when needed. These positions remain within the available page width.
- **Save layout & export final-modules.json** saves both Household and Skills settings to local storage and downloads `final-modules.json`. Its schema is `ourspace.final-modules-placement.v1` and the file includes both page module geometry records.
- The previous Communication editor was unloaded. Store, Communication and Journal/Diary continue as ordinary display sections with the previous integration preserved. Jasper has no admin resize/export handles.

## Design widget

- The existing OurSpace quill Design Widget remains the only site-wide designer. Twenty-six added selectors are registered per applicable page: nine Household targets, five Skills targets and twelve Onyx targets (Journal and Communication pages). The separate source-module design panels are not instantiated.

## Cross-module connections

- `script/ourspace main/ourspace-module-bridge.js` offers a profile-specific, local-storage-backed way to link Onyx/Professor DBT assignments to Household tasks and to the original DBT handout/worksheet pages. The Household task interface listens for local storage updates and in-page save events.
- Onyx's native widget mount and fullscreen modes are present in the two profile files. Their original scripts load on Journal/Diary and Communication routes; the widget mount is hidden on other routes. The source's therapist/DBT material is preserved as content, not represented as professional medical care.
- The existing Communication page and sidebar messenger use the same preexisting controller and sync code, including its existing backend transport where configured. No new messaging transport or independent communication data store is added.

## Verification and limitations

- Integration checks: JavaScript syntax, local relative asset resolution, section existence and identity, DBT page count, and ZIP integrity.
- Isolated Chromium checks: both Household and Skills render, William's controls drag/resize/save/export, Jasper has no admin handles, and Onyx's mount is only visible on the intended routes.
- Full hosted navigation, authenticated server sync, Onyx's remote brain, and cross-device messaging could not be exercised in the isolated test environment. Verify these against the deployed backend before assuming synchronization across devices.


---

<a id="source-9"></a>

## 9. FULLSCREEN_DBT_REVIEW.md

# Onyx Widget follow-up review

## Fullscreen and chat

The widget has three chat tabs: Virtual & Health, Leisure, and Work. Onyx's Adventures remains the Virtual & Health fullscreen game; Work keeps its existing fullscreen workspace. Leisure loads the live LifeHelpers Arcade at `https://tyrannosaurusdm92.github.io/LifeHelpers/Games/index.html` in a full-viewport iframe on demand. Its top-right ❌ returns to the regular Leisure module and unloads the iframe so game audio stops.

Professor Onyx remains a separate, hidden Work-style fullscreen workspace. Saying **“I need a session”** in Virtual & Health opens it; the existing “I need a therapy session” phrase still works. A **Start session** button is visible in Virtual & Health only on Saturdays in Eastern time. Scheduled reminders remain invitations, never automatic starts. Session messages remain in memory and separate from Work history.

The widget's local Onyx portrait assets and black frame remain intact. Notification icons resolve from `assets/images`, and both the alert controller and widget reaction cue use the packaged `assets/audio/onyx_widget_onyx-meow.wav`.

## DBT homework

`assets/code/skills.html` contains the workbook hub. All 102 paired handout and worksheet documents plus the cover are in `assets/code/DBT`. Their existing forms, answer saving, import/export, and print behavior are retained. The hub's direct links, pairing metadata, scripts, and styles now resolve within this package.

Relevant Virtual & Health replies and Professor messages can include a homework card within the chat message. The card links directly to the corresponding handout and worksheet and has an **Add to Household tasks** button. It does not add a chat tab. The button first uses a host-provided `OurSpaceHouseholdTasks.addTask(task)` function if present. Otherwise, the included bridge saves the assignment to `ourspace.onyx.professor.tasks.v1.<profile>`, the format consumed by the earlier OurSpace Household page. It also attempts that page's authenticated `record.save` backend contract. Only assignment metadata is saved; chat transcripts and worksheet answers are not copied to Household. A local-only save says **Saved for Household on this device** rather than claiming account sync. The ZIP contains no Household HTML page, so deploy it on the same origin as the earlier OurSpace Household page for that page to ingest local homework tasks.

The new `OurSpace_All_Colors_By_Category(3).json` attachment was unavailable. This pass retains the palette incorporated from the prior supplied color JSON and does not claim to use the unavailable version.

## Verification

Checked the 105 HTML pages (one widget, one workbook hub, 102 pairings, one cover), JavaScript and JSON syntax, local HTML/CSS resource paths, exactly three widget tabs, and the allowed directory layout. Simulated fullscreen entry and exit, Professor phrase and Saturday scheduling, workbook selection/link construction, and Household record storage. The linked live Arcade was inspected directly. A full visual playthrough of the packaged local widget and a live signed-in Household task save were not available in this environment.

Picnic cats use the same transparent 32-frame atlases and animation manifests as Adventures: Onyx, Callie and Harvey each animate eating, batting, resting, leaving, and choosing boosters, with mood labels and small emotes. Occupied squares block board input, and all three can occupy distinct squares together in later levels. Their autonomous purchases remain in the copper/silver/gold/platinum store.


---

<a id="source-10"></a>

## 10. GITHUB-REPLACE-INSTRUCTIONS.md

# Replace only LifeHelpers/OurSpace on GitHub

**This ZIP is not deployed; the GitHub repository is unchanged.** It contains the new OurSpace directory contents, not the sibling Onyx or Games projects.

1. Back up the current `OurSpace` directory or create a working branch first.
2. In a local checkout of `tyrannosaurusdm92/LifeHelpers`, replace **only** the existing `OurSpace` directory with this ZIP's root files and folders. Do not delete or move `Onyx`, `Games`, or any sibling directory.
3. Confirm the resulting path `LifeHelpers/OurSpace/ourspace.html` and its sibling paths `LifeHelpers/Onyx/...` and `LifeHelpers/Games/index.html` exist.
4. Review diffs, run the JavaScript syntax and link audits, commit, and push. The old `css/` and `js/` directories within `OurSpace` are intentionally replaced by `style/` and `script/`.
5. Deploy from the root `LifeHelpers` site (e.g. GitHub Pages) so relative Onyx and Games links resolve. Verify account login, Web App CORS/permissions, Drive persistence, PWA install badges, push gateway, and live messaging in two separate accounts and browsers.

Do not publish the supplied Apps Script backend `.txt` or its secrets. The frontend uses the existing published Web App contract only.

A deployment cannot be called complete until the production backend and the installed-app notification behavior are verified on target devices. See `LOSSLESS-VALIDATION.json`.


---

<a id="source-11"></a>

## 11. JOURNAL-DIARY-INTEGRATION.md

**Update for Store editing pass:** The previous `#admin` Journal & Diary placement editor and its Save/export `bulletin.json` button have been retired. The user-supplied `bulletin (1).json` geometry is retained as read-only layout. The Journal and Diary tabs, scripts, and shared designer support remain. The section below documents the previous layout editor for historical reference only. See [STORE-INTEGRATION.md](STORE-INTEGRATION.md).

# OurSpace — Journal & Diary Cards native integration

## What was replaced

The previously unimplemented Journal and Diary destinations are now **one actual page, Journal & Diary Cards**, with two tabs. Their contents are embedded directly in the two existing HTML files:

- `assets/code/william.html?page=journal` and `?page=journal&tab=diary`.
- `assets/code/jasper.html?page=journal` and `?page=journal&tab=diary`.
- The old `?page=diary` URL redirects to `?page=journal&tab=diary`.

These are not blank placeholders, iframe documents, or a Shadow DOM. Each profile contains its own native full Journal and Diary Card markup. The original Journal functional code (notes, entry editor, searchable folders, checklists, settings, local storage fallback, etc.) and the original respective diary code (daily table, skill tracker, notes, save/export/print) are incorporated in their own account-specific runtime file. Each module's original CSS declaration blocks and responsive rules were retained, with the selectors namespaced to prevent collisions with unrelated OurSpace modules. A copy of each original component stylesheet is preserved in `docs/` for future comparisons. The quill asset is in `assets/images/journal-quill.webp`.

The original nested Journal and Diary design-widget elements were **not** included. The existing floating OurSpace Design Widget (the same one already in the profile HTML files) is the only designer. Its `js/page-fills-design.js` registry now exposes 76 explicit parts from the supplied source designers, targeting the Journal or Diary Card only, plus their own separate typography, inputs, navigation, and backgrounds. Target styles save in the existing account/page-specific Design Widget state; no generated styles are injected into other pages. The former visual/audio/feed *page placement* editor and part-specific design registry were retired, but the actual Visual, Audio, and Feed pages have not been deleted or replaced.

## Placement in `#admin`

Sign in using the existing app's `#admin` mode and open `william.html?page=journal`. Each tab has a real module frame. The frame contains its complete native module content. Use **✥ Drag Journal** or **✥ Drag Diary Card** to move the frame. Eight grips allow side-only height/width editing or corner width+height editing. The grips also support arrow-key adjustments (10 px per press; Shift+arrow 25 px). Each tab's width, height, horizontal offset, and vertical gap are stored separately.

This editor uses **document flow**: movement changes layout margin, not `position:absolute` or `transform`, so following content reflows instead of overlapping it. When the frame becomes narrower or shorter, its own content remains accessible via scrolling rather than losing entries. Both module behaviors remain active even when switched between tabs. The editor is unavailable on Jasper's page and outside William's `#admin` view.

Click **Save layout & export bulletin.json** to persist locally and download `bulletin.json` containing the actual dimensions and offsets of both tabs. Send that download with the package for the next layout pass. Its schema is `ourspace.journal-diary-placement.v1`, and it is separate from the old profile Pinboard's `json/bulletin/bulletin.json`, which the integration has deliberately left untouched. **Do not overwrite the old profile `json/bulletin/bulletin.json` with this layout file** when manually editing the ZIP; send the exported file separately instead. The subsequent update can install the layout into the appropriate new module schema without deleting the separate bulletin board.

The layout stored in this browser belongs to William's admin view. No backend or automatic synchronization across devices is claimed. Other profiles use their own unedited default placements unless a subsequent project update explicitly applies the exported geometry.

## Source and test boundaries

The integrated scripts, module markup and the merged Design Widget were exercised with a headless Chromium isolated-page test. Both journals initialized, populated their Today views, and the two diary cards rendered their original hundreds of editable inputs with no recorded JavaScript page errors. The William handles appeared, Jasper had no handles, and the top tabs switched. Resize/drag testing verified width-only, move-offset and corner width+height edits, and a browser test verified downloading a correctly structured file named `bulletin.json`. The original profile application and server authentication were not exercised against a live deployment; actual account-backed persistence still depends on the original OurSpace host, and the old public-profile guard remains in place. No live backend data was changed.

CSS and JS paths remain under `css/` and `js/`, and no extra standalone page HTML (including `bulletin_board.html`) or Windows batch file was added.


---

<a id="source-12"></a>

## 12. LINKS-MODULE-REPLACEMENT.md

**CURRENT STATUS:** Links admin editing was retired in this pass. William's exact approved Links Module placement is in `json/profile/links_module.json`; use the new twelve-module editor instead.

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

**Save & export links_module.json** saves the chosen placement in local browser storage and exports `links_module.json` containing the schema `ourspace.links-module-placement.v1`, profile, column, index, neighboring anchor IDs, width, rendered height, scale factor, reference dimensions and spacing offsets. This file can be returned together with the ZIP to make the chosen placement a permanent packaged default. `json/profile/links_module.json` starts with null defaults, deliberately awaiting that selection.

Jasper's profile contains the same Links Module and scripts, **but no admin move/resize toolbar or handles**.

## Compatibility and testing

Validated in headless Chromium at desktop 1440 px, mobile 390 px and Jasper desktop 1280 px: markup uniqueness, link add/delete, local readback, module styling targets, independent dark-mode toggle, proportional scaling, all eight resize directions, column movement, JSON export and dynamic reflow. No new backend files or route HTML were created.

The existing record-player layout, saved default, player scripts, deleted image/layout denylist, external Google Drive image references, blank pages and other profile modules are unchanged. Source thumbnail links still depend on the external hosts.

## Saved bulletin sizing from provided JSON

Saved bulletin settings: `column=main`, `index=6`, `afterId=profile-guestbook`, `beforeId=null`, `widthPx=617`, `heightPx=490`, `scaleFactor=0.51949`, `referenceWidthPx=1180`, `referenceHeightPx=790`, `horizontalOffsetPx=0`, `verticalGapPx=0`. The fixed placement uses width and reference geometry and adapts to smaller available widths; the actual rendered height follows available board content.


---

<a id="source-13"></a>

## 13. NAVIGATION-AND-ACCENT-COLORS.md

# Page navigation and accent colors

- Single shared, original blue hieroglyph Jump Nav bubble appears on all implemented profile routes, with page-specific links and drag/collapse. It defaults next to the messenger rail at vertical center; local browser location is saved by profile + page. Profile menu and existing eight resize handles are retained.
- Red, gold, black, and white master NAV is 68×68px collapsed (original jump is 52×52px); gold inner links and red hover. It defaults to the top left and remains draggable.
- The original existing Design Widget controller persists on every page, now with the supplied quill artwork in bubble and header; no extra designer is created. Defaults in the upper-right content region, left of messenger rail, and can be dragged/collapsed.
- Profile starts 10vw from the left and extends to the reserved sidebar gap.
- The 75-color Green, Purple, Gold, Silver, and Copper palette is in `json/design/ourspace-accent-palette.json`. Bulletin notes offer these shades. Journals, music and visual folders, plus pinned communication messages can each save an accent by item in the browser.
- The Journal headline static quill is removed. No full theme palette or messenger chat transport is modified.
- Browser-backed accent preferences are local and do not claim cross-device synchronization. Existing backend behavior is unchanged.


---

<a id="source-14"></a>

## 14. OURSPACE_PRISMSHIFT_INTEGRATION.md

# OurSpace PrismShift appearance toggle

## Control
A floating **Dark mode / Light mode** toggle appears on all top-level documents (Portal, both profiles, Skills, and each DBT handout/worksheet); it remains out of embedded same-origin iframe documents. The selection is retained in `localStorage` with `ourspace:appearance:prismshift:v1`, synchronizes across same-origin tabs and iframe messages, and defaults to light on first use. The public API is `window.OurSpaceAppearance.setMode('dark'|'light')`, `.toggle()` and `.mode`.

## Theme coverage
PrismShift's adaptive color engine recolors HTML background, foreground, borders and controls, including chat UIs, site modules and game HUD surfaces. Existing HTML geometry, module IDs, navigation, user data and Onyx open/close routines are not edited. Gradient-only surfaces have adaptive color conversion when those gradients have no image URL.

## Never modify images or gameplay pixels
No full-screen CSS `filter: invert()` or `hue-rotate()` is used. `<img>`, `<picture>`, `<canvas>`, `<video>`, `<svg>`, `<iframe>` and other media pixels are not recolored. CSS background-image URLs are never converted. The image-backed bulletin corkboard (#board-surface), puzzle tile grid and level-map artwork are opted out. Onyx Adventures graphics are painted into a canvas and remain untouched, while surrounding menus, chats, forms, HUD and UI surfaces do recolor. SVG/image sprites retain their source color; CSS-based UI gradient backgrounds are adapted where safe.

## Scripts
- `script/prismshift/prismshift.browser.js`: included PrismShift 1.0 classic release runtime
- `script/prismshift/core` and `/adapters`: reusable source modules retained from uploaded archive; not loaded at runtime
- `script/prismshift/ourspace-prismshift.js`: OurSpace integration, persistent toggle and image-preserving gradient handling
- `style/prismshift/ourspace-prismshift.css`: scoped appearance-control styles and gradient binding
- `service-worker.js`: cache bumped to v32

## Known constraints
- The toggle cannot recolor inaccessible cross-origin iframe documents; normal same-origin OurSpace iframes load the integration themselves.
- CSS illustration gradients combined with `url(...)` images are intentionally left alone to guarantee image fidelity.
- Rendered bitmap/canvas/SVG art and custom widget graphics never change. Built-in game canvas visuals remain unchanged; only HTML HUD changes.
- If localStorage is blocked by the browser, the chosen mode continues for the current page and transfers to accessible embedded frames; persistence after navigation may be unavailable.


---

<a id="source-15"></a>

## 15. OURSPACE_PROFILE_LOCKED_2026-11-02.md

# Profile layout locked — November 2, 2026

- The Profile Grid Editor (toolbar, resize handles, drag/snap tools, grid overlay and editor stylesheet/script) is removed from William and Jasper's profile pages.
- The seventeen surviving modules retain the same x/y/width/height from the previous version. The static `script/profile/ourspace-profile-baseline.js` remains authoritative.
- The obsolete profile-module placement controller can no longer override the locked coordinates with its older 327px presets.
- The floating **Design Studio remains available** for color, imagery, fonts and other appearance settings; it is not a module-layout editor.
- Design Studio's quill bubble has no extra red/gold border or artificial ring, including hover and focused states.
- Master navigation black font outline is now **0.075px** (the former 0.75px was a typo). The thick four-sided shadow outline is removed.
- The separate `OurSpace_All_Colors_By_Category.json` export is intentionally **not included in this package**.


---

<a id="source-16"></a>

## 16. OURSPACE_SCOPED_HUD_RECOLOR_IMPLEMENTATION.json

~~~~~~~~~~~~json
{
  "schema": "ourspace.scoped-hud-color-implementation.v1",
  "inputMappingDocument": "OurSpace_All_Colors_By_Category_HUD_Recolored_Complete(1).json",
  "scope": "OurSpace outer HUD, shared portal/site navigation, page fills, shared page-header glow and standalone DBT/Skills navigation chrome only",
  "note": "The supplied color-audit JSON is a historical mapping specification; this manifest records implemented source edits. Protected-only mappings are NOT applied globally.",
  "palette": {
    "Persimmon orange": [
      "#FFB08A",
      "#F47745",
      "#D94B24"
    ],
    "Cadmium yellow": [
      "#FFF09A",
      "#FFD12E",
      "#E9A900"
    ],
    "Cyan": [
      "#99FFFF",
      "#00FFFF",
      "#00BFC4"
    ],
    "Dark teal": [
      "#6FA9A0",
      "#176B65",
      "#083F40"
    ],
    "Steel blue": [
      "#A6C4D8",
      "#5686A6",
      "#31566F"
    ],
    "Mint": [
      "#C8F5DC",
      "#82DDB3",
      "#43B987"
    ]
  },
  "keySourceMappings": [
    {
      "formerHex": "#A70022",
      "newHex": "#F47745",
      "scope": "master nav hover/outline only; bulletin red retained"
    },
    {
      "formerHex": "#DF1535",
      "newHex": "#FFD12E",
      "scope": "master nav selected/hover and shared page HUD glow only; other red retained"
    },
    {
      "formerHex": "#F7DF93",
      "newHex": "#00FFFF",
      "scope": "master nav button background only; bulletin gold retained"
    },
    {
      "formerHex": "#856523",
      "newHex": "#176B65",
      "scope": "master nav button border only; bulletin gold retained"
    },
    {
      "formerHex": "#003399",
      "newHex": "#31566F",
      "scope": "site portal/nav/browser theme only; design presets and page content retained"
    },
    {
      "formerHex": "#6699CC",
      "newHex": "#5686A6",
      "scope": "site portal/page shell only; module-accent & design-editor fields retained"
    },
    {
      "formerHex": "#F8FBFF",
      "newHex": "#C8F5DC",
      "scope": "portal surfaces only; widget/game whites retained"
    }
  ],
  "eligibleImplementationFiles": [
    {
      "sourceFile": "style/ourspace main/site.css",
      "beforeBytes": 6825,
      "afterBytes": 5125,
      "modified": true
    },
    {
      "sourceFile": "style/ourspace main/ourspace-floating-navigation.css",
      "beforeBytes": 9444,
      "afterBytes": 10940,
      "modified": true
    },
    {
      "sourceFile": "style/ourspace main/ourspace-unified-polish.css",
      "beforeBytes": 12181,
      "afterBytes": 10331,
      "modified": true
    },
    {
      "sourceFile": "style/design/page-fill-layout.css",
      "beforeBytes": 6206,
      "afterBytes": 6206,
      "modified": true
    },
    {
      "sourceFile": "style/skills/ourspace-dbt-standalone.css",
      "beforeBytes": 70729,
      "afterBytes": 71038,
      "modified": true
    }
  ],
  "metadataTheme": {
    "value": "#31566F",
    "numberHtmlUpdated": 107,
    "files": [
      "ourspace.html",
      "assets/code/skills.html",
      "assets/code/william.html",
      "assets/code/jasper.html",
      "assets/code/DBT/*.html"
    ],
    "manifest": "ourspace.webmanifest"
  },
  "standaloneDBTChrome": {
    "file": "style/skills/ourspace-dbt-standalone.css",
    "method": "direct edits to existing navigation selector declarations, no appended override",
    "protected": "worksheet and handout content, answer fields and printable layout not recolored"
  },
  "designStudio": {
    "html": "Embedded in assets/code/william.html and assets/code/jasper.html, not a standalone design-widget.html file",
    "editorCSS": "style/design/design-widget.css retained; preset/swatch colors protected"
  },
  "protected": [
    "Post-it notes and bulletin board textures, notes, pins",
    "Folder and playlist accent palettes",
    "Record-player module, artwork and control colors",
    "Onyx Adventures / Picnic Panic, cat games, and fullscreen HUDs",
    "Design Studio color swatches, saved palettes and customized accents",
    "Danger/error/status meanings",
    "Household/content-specific modules and user-selected values"
  ],
  "cssMaintenance": {
    "editedExistingSourcesOnly": true,
    "noNewRecolorStylesheet": true,
    "navigationColorAuthority": "style/ourspace main/ourspace-floating-navigation.css",
    "removedExactRedundantDeclarations": 183,
    "removedEmptyRules": 22,
    "cssFilesParsed": 70,
    "syntaxErrors": 0,
    "remainingLegacyRepeatedSelectors": 1916,
    "note": "Remaining contextual or media-specific repeated selectors were retained instead of applying a risky site-wide cascade rewrite."
  },
  "cacheVersion": "ourspace-myspace-shell-v29-scoped-hud-css-clean",
  "validation": {
    "all307ScriptFilesSyntaxValid": true,
    "all94JSONFilesValid": true,
    "protected547SourcesPreservedOrHexSetsUnchanged": true,
    "profilesUnchangedExceptThemeMeta": true,
    "dbtPages": 103,
    "masterNavComputed": {
      "normal": "#00FFFF",
      "border": "#176B65",
      "hover": "#FFD12E",
      "outlineTextPx": 0.075
    },
    "bulletinButtonProtected": "#F7DF93"
  }
}

~~~~~~~~~~~~

---

<a id="source-17"></a>

## 17. OURSPACE_SCOPED_HUD_RECOLOR_IMPLEMENTATION.md

# OurSpace — scoped site HUD recolor and CSS audit

Applied the **57-entry user-supplied mapping policy** without global text substitutions. Only colors that corresponded to an eligible shared HUD/portal source were replaced. Protected-only or context-specific mappings remain unmodified.

## Main replacements

| Former | New | Scope |
|---|---|---|
| `#A70022` | `#F47745` | Shared navigation persimmon hover/border |
| `#DF1535` | `#FFD12E` | Shared navigation cadmium active and header glow |
| `#F7DF93` | `#00FFFF` | Shared navigation cyan button faces |
| `#856523` | `#176B65` | Shared navigation dark-teal borders |
| `#003399` | `#31566F` | Site portal, deep steel-blue HUD and browser theme |
| `#6699CC` | `#5686A6` | Shared portal steel-blue bars and dividers |
| `#F8FBFF` | `#C8F5DC` | Portal pale mint surfaces |

## No override layers for color changes

- Consolidated the entire master-navigation structural/visual rule set in `style/ourspace main/ourspace-floating-navigation.css`. Removed its old competing rules from `style/ourspace main/site.css` and `style/ourspace main/ourspace-unified-polish.css`.
- Modified CSS declarations directly in `style/ourspace main/site.css`, `style/design/page-fill-layout.css`, `style/ourspace main/ourspace-unified-polish.css`, and `style/skills/ourspace-dbt-standalone.css`; did not append new recolor stylesheets.
- Conservatively removed **183 exact redundant declarations and 22 empty rules** from existing CSS without changing their final color values. All 70 stylesheets passed parser checks.
- Older feature-specific/conditional CSS selectors still repeat in the source; these were not forcibly collapsed because doing so could change layering and in-game interactions. This is a careful cleanup, **not a claim that every historical CSS rule has been rewritten**.

## Page consistency

`ourspace.html`, `skills.html`, `william.html`, `jasper.html`, and all **103** DBT standalone HTML files now share the `#31566F` browser theme color. The Skills and DBT navigation widgets also use the shared cyan/teal/steel-blue/cadmium chrome, by editing their **existing** stylesheet. The independent worksheet and handout content keeps its own protected colors and print styles.

There is no standalone `design-widget.html` in this archive: the Design Studio is embedded in William/Jasper. Its editor stylesheet and saved palette swatches are intentionally not recolored.

## What stays untouched

Bulletin board content and pins; folder/playlist colors; record player artwork and controls; game HUDs, Onyx Adventures, Picnic Panic, and Onyx fullscreen modes; Design Studio swatches; custom module color accents; semantic error/danger colors; and private worksheet content.

## Testing

Verified CSS parser (70 files), 307 JavaScript files, 94 JSON files, all source references in the offline cache, 17 saved modules on each profile, and 547 protected source/media assets or stylesheet color sets. Browser-based spot checks confirmed cyan navigation buttons, cadmium hover/selected states, teal borders, 0.075px text outlines, and the original bulletin gold.

The service-worker cache ID is now `ourspace-myspace-shell-v29-scoped-hud-css-clean`. Deploy the entire ZIP together to ensure cached CSS refreshes correctly.


## Second-pass verification and consolidation (2026-11-02)

The source ZIP for this pass is `OurSpace_Scoped_HUD_Recolor_Clean_CSS(1).zip`, and the only color specification is the user's `OurSpace_All_Colors_By_Category_HUD_Recolored_Complete(1).json`. Its 57 mapping entries are **scoped**, not an instruction to globally replace every occurrence of a former hex code.

- Audited the canonical site/nav CSS against all 57 mappings and kept source-color exceptions where the JSON designates them protected. No new CSS override file was created.
- Recolored **only the embedded, non-fullscreen Onyx widget HUD and chat chrome** in the existing `style/onyx widget/ourspace-onyx-glow-up.css`: deep blue `#003399` → `#31566F`, medium blue `#336699` and border blue `#6699CC` → `#5686A6`, pale blue `#B1D0F0` → `#A6C4D8`, light panel blue `#D5E8FB` → `#82DDB3`, and very pale blue `#F8FBFF` → `#C8F5DC`. Preserved glow alpha (`#6699CC88` → `#5686A688`). The fullscreen Adventures/Arcade/Work/Professor CSS after the fullscreen marker was untouched.
- In the canonical navigation stylesheet, updated the migrated search-field border to light steel blue (`#A6C4D8`), renamed confusing old `gold` and `red` HUD variable names to match the actual cyan/teal/cadmium/persimmon palette, and dropped two unused tokens. All changes replace existing declarations.
- Removed **103 earlier top-level declarations** already superseded by later declarations for the exact same selector and property. The cleanup uses a parser and deliberately preserves responsive `@media`, `@container`, `@supports`, fallback values, and all protected game/design/Bulletin/record-player stylesheet colors. Removed no live layout geometry or modules. Deleted CSS selectors referring to the retired profile grid editor.
- Confirmed **108 HTML entry pages** carry the same `#31566F` browser theme: portal, William, Jasper, Skills, the existing standalone Onyx source, and 103 DBT handout/worksheet HTML documents. The Design Studio remains embedded in the two profile pages and inherits their browser theme; its gallery/swatches and designer-specific styling remain intentionally protected.
- Ran computed-style browser comparisons against the supplied source ZIP: Portal, DBT navigation, and profile elements show no unintended computed differences; the only measured differences are the planned Onyx non-fullscreen HUD colors and navigation input border.
- Validated CSS syntax (70 files), JavaScript syntax (308 files), JSON parsing (96 files), the 17 locked profile modules, **600 byte-identical original binary assets**, **307 byte-identical application JS files**, and **95 byte-identical original JSON files**. The service-worker cache ID is bumped to `ourspace-myspace-shell-v30-scoped-hud-css-audit`.

**CSS limitations:** Existing feature-specific and conditional cascade rules that are not safely equivalent were retained, particularly imported widget/game CSS. Therefore this is a cross-site **safe cleanup**, not a destructive promise that every historical selector was consolidated. Future restyling should edit the owning component's original CSS, not append another override sheet. See `docs/OURSPACE_SCOPED_HUD_RECOLOR_PASS2.json` for the machine-readable change and validation summaries.


---

<a id="source-18"></a>

## 18. OURSPACE_UNIFIED_DESIGN_AND_FEED_UPDATE.md

# OurSpace unified design + connected feed — November 2, 2026

## Structure and preservation

- Existing William and Jasper HTML pages, account-specific journal/diary cards, account-specific stores, and page functionality are preserved.
- William's site name: **Dino Nerdzone**; store: **Dino Store**. Jasper's site name: **Squishy's Cottage**; store: **Squishy Store**.
- The supplied 1754 × 3285 px `profile.json` is the baseline for both profile pages. All surviving 17 modules keep *exactly* the supplied x, y, widthPx, and heightPx; `profile-pins` / Classic Pins is the only removed module.
- Both pages include the same native admin profile-grid editor. Account-specific saved grids remain isolated per account. `json/profile/profile.json` is the portable exported layout.

## Unified design widget

- Removed the separate floating Bulletin Board designer and folded **all 34** of its named detailed design targets into the existing Design Studio, alongside the existing 10 convenient Bulletin part-targets.
- Migrates old per-profile saved standalone Bulletin design styles on first load into the existing site's design state, without intentionally overwriting the new user's saved changes. Original user custom CSS stays under the Bulletin Board module.
- Profile/About section headings, font size, text inputs, selectors, buttons and similar internal controls use Profile Identity as the common type scale. The blue bar and its font on Donate now match the blue bar and font used by Profile Identity despite the modules being different physical sizes.

## Visual palette

- The lightest Bulletin gold (`#F7DF93`) is the single base-gold used for the targeted golden buttons, with dark-gold outlines (`#856523`) and red hover/pressed (`#DF1535`). A deterministic runtime assigns the gold skin to approximately 52% of the site buttons, including module buttons, counting already-golden controls first.
- Master navigation has white lettering with 0.75 px black stroke and a high-contrast text shadow, harmonized red and gold states.
- Former sparkle `✦` labels are replaced by red `♥︎` glyphs. Shared red glow replaces cyan glows around Media/Visual titles and is used in equivalent page mastheads and the profile title.
- Heart scrollbars with real scroll, drag and keyboard behavior attach to audio playlists (reduced size), Communication, Household content after it is rendered, and the Feed. They are not attached to diary cards or the Messenger sidebar. The Bulletin's existing heart scrollbar is unchanged.

## Unified feed / posting

- The Feed shows public news and both people's posts, shares, music, images, videos, and public-board news links, with filters for Images/Videos/Music and author.
- New Profile Posts and Profile News items, Media Player track uploads, Visual Player image/video uploads, and links pinned to a **public** Bulletin board publish metadata to the shared activity stream. Private bulletin items do not silently become public.
- Feed cards show media thumbnails and playable audio/video controls **when there is an accessible supported-format URL**; an upload without an accessible URL publishes its title and metadata instead of claiming playable playback.
- The shared-origin activity log is available across both accounts on the same browser installation. It uses the existing authenticated `record.save`/`record.list` backend actions when those actions accept feed records. This package does not add server-side persistence or guarantee synchronization across separate devices; verify that the deployed backend exposes those actions and the correct shared/feed permissions.
- Diary cards remain per account and are **not** syndicated into the public Feed.

## Deployment and verification

- Deploy the complete ZIP contents together: replacing HTML alone leaves old client scripts and stylesheet files in place.
- The service worker cache version is bumped to `v25` to replace outdated cached assets; previously cached shell versions are evicted at activation.
- Static verification: both profile HTMLs contain the same 17 module IDs; every retained coordinate and dimension matches the uploaded JSON; script syntax passed; all service worker pre-cache references resolve to included files.
- Live in-browser QA couldn't be completed here because browser navigation to both the local test server and file URLs was blocked by the sandbox administrator. Test page switching, uploads, the admin Design Studio, the four new scrollbars, and feed visibility on your deployed origin.


---

<a id="source-19"></a>

## 19. PAGE-FILLS-INTEGRATION.md

**Historical guide:** The Visual/Audio/Feed placement controls described below were retired in the Journal & Diary Cards pass. These older instructions are retained only as a record of the prior build; see `JOURNAL-DIARY-INTEGRATION.md` for the current editor.

# Visual, News Feed and Audio page integration (October 31, 2026)

This update is based on the user-supplied `fill-in_pages.zip` and the prior OurSpace package, retaining `william.html` and `jasper.html` as the **only** personal page HTML files. No new visual/audio/feed HTML file, iframe, viewport, or Shadow DOM was added.

## Actual page sections
- **Visual**: original `15_Visual_Player` photo/video library controller, IndexedDB folders, playlists, external media links, uploads and gallery UI. Two independently movable/resizable major panels (library, viewing area) created by the existing renderer.
- **Audio**: original `02_Audio_Page` library controller, IndexedDB folders/playlists, uploaded audio and mini-player. Two independently movable/resizable major panels (library, player/library content) created by the existing renderer.
- **Feed**: original `12_News_Feed` markup, search/filter controls, feed stream, four independent news screens and feed notes. Seven independently movable/resizable modules, with original filter logic retained.

The original stylesheets are preserved at the declaration level but selectors are prefixed with their exact owning page root to prevent global `html`, `body`, `button`, and media style rules leaking into other pages. The source page controllers remain in `js/` (with only route guards). No extra floating source designer is instantiated: the existing Design Widget uses the **19 original design-part configurations** transformed into targets, selected by page in `js/page-fills-design.js`, `json/design/page-design-targets.json`, and the standalone `assets/code/design-widget.html`. A style chosen on `/william.html?page=visual` is stored separately from audio, feed or profile styles.

## William-only placement editor
On `william.html` in `#admin`, use the eight handles on each of the seven / two / two sections and the Move section control. The E/W handles change **only width**, the N/S handles change **only height**, and corners change both. All panels use normal wrapping flow. Widening one pushes a neighbor to the next row instead of overlapping it; narrower media/page widths reserve the entire right-side 170px messenger rail.

`Save all page fills & export page-fills.json` saves the current page settings in browser storage and exports all three pages' accumulated records. Keep using William's profile and visit/edit each of the three pages before exporting to populate all page records. The file contains each module ID, order, width, selected minimum height, actual measured dimensions, and neighboring IDs. Jasper sees the same pages without admin placement controls. The old Sidebar Messenger editor was physically removed; William's supplied saved rail placement is the new default.

## Feature on profile (local-first, no extra profile modules)
- On Visual, select an image/video from the existing library and feature it on the profile's existing `pictures` carousel.
- On Feed, select an item and feature it in the existing `news` module.
- On Audio, select a track and feature it in the existing retro record player's track feed. Remote URLs are playable through their original links; local audio is resolved from IndexedDB on the same browser when available.
- Existing data is deduplicated by source ID (`ourspaceFeatureKey`) and remains in the original profile module's storage key. Uploaded image blobs that are small enough may be converted to locally stored data URLs; otherwise an IndexedDB reference is saved.

**Cross-device visitor access is not guaranteed:** the supplied backend was not modified or verified for `profile.feature.save`, public media delivery, or published updates. Uploaded IndexedDB media generally stays on the uploading browser unless hosted or synchronized through a compatible backend. If the backend cannot save a featured item, the UI tells the user it is saved only on this browser. No local-only item should be described as publicly available elsewhere.

## Backgrounds and color
Light defaults are white backgrounds and black text with borders/accent colors. The unified dark control switches to black backgrounds and white text. The existing Design Widget's per-page targets can override default styling independently. The previous profile layout, record player, bulletin, links, profile picture and jump nav are retained without re-enabling their admin placement editors.

## Known test boundaries
Browser tests checked the actual full Audio and Visual engines using an in-memory IndexedDB stand-in because local HTTP navigation is blocked in the test environment; real IndexedDB/hosted-backend behavior must still be verified after hosting. News feed filters, seven section controls, media content creation, local featuring, width-only and height-only resizing, dark mode, and placement JSON export were also exercised. The file format and routing scripts were syntactically validated.


---

<a id="source-20"></a>

## 20. PROFILE-MODULES-REPLACEMENT.md

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

Select **Save all placements & export profile-modules.json** in the green bar or the small Save button in any module. It exports one JSON document with `schema: ourspace.profile-modules-placement.v1`, the 12 stable IDs and 12 individual placements, each including the column, neighbor anchors, sibling index, measured width and height, unscaled content height, proportional scale factor, horizontal/vertical offsets, and viewport-measurement metadata. This saves a browser-local layout key too. Return **that exported file and the current OurSpace ZIP** for the user's layout to become the packaged default. `json/profile/profile-modules.json` currently contains the schema and initial inventory with empty profile defaults, not invented user choices.

Jasper's profile has the twelve replacement modules without those admin placement handles or buttons. Its content and design controls remain available to the authorized profile owner. The existing profile designer exposes all nine original source design roles separately for each of the twelve modules (**108 part targets plus 12 module-background targets**), alongside the record player, bulletin and links design roles. Colors have native color pickers plus hex inputs; fonts and text size have their original module roles. These rules are scoped to the selected module's source `data-os-design-scope` and never restyle sibling modules.

## Previously approved placement retained

- Record player: 327 × 408 px, sidebar after Profile Identity, from the earlier `record-player.json`. No record player editing controls.
- Bulletin board: 617 × 490 px recorded, main column after Guestbook, from the earlier `bulletin.json`. No bulletin editing controls.
- Links Module: **617 × 399 px**, main column after Profile About and before Profile Posts, from the newly supplied `links_module.json`, proportional scale factor **0.71268**. The Links Module's admin resize/move toolbar, eight handles, and old editor logic were removed; its functional link-entry and design controls remain.

`json/ourspace main/deleted.json` remains the user's deletion denylist. Prior image catalog and layout preset changes remain.

## Data and backend limitations

The replacement module ZIP describes its own storage as **browser-local**. Its original controllers persist module records to `myspace_module_<profile>_<kind>` localStorage keys; those module-specific records are **not guaranteed to synchronize across devices** until the user's unchanged existing backend supports them. A guarded one-way migration can populate empty replacement modules from existing profile data without overwriting newer module records. The original normal-login backend and `ourspace-auth.js` are unchanged. No backend URL or replacement backend was introduced. In particular, Donation displays a progress editor but the source supplied no live Stripe checkout integration; the display must not be interpreted as working payment processing.

## Testing

Chromium in-memory browser tests ran for William at 1440 and 390 CSS pixels, and Jasper at 1024. Checks included the 12 module roots, no duplicate legacy HTML, deletion of the old Links admin controls, exact saved Links placement, identity form saves, whole-content resize and neighbor reflow, all eight handles, independent resize on all twelve modules, cross-column movement, JSON export and reload restoration, 108 designer targets and scoped color control, and preserved bulletin / record-player anchors. The test browser blocked local network navigation, so tests used the actual HTML, CSS, and JS in an in-memory page; this does not substitute for production backend testing. External image URLs and account backend actions were not independently verified.


---

<a id="source-21"></a>

## 21. PROFILE-PICTURE-JUMP-NAV.md

# Profile Picture and Profile Jump Nav

The profile-picture uploader and 6:7 portrait crop workflow remain directly above Profile Identity. The independent 𓃑 Jump Nav stays on the profile only, follows scrolling and has a resizeable open menu. No admin placement controls are installed for the Jump Nav and it is excluded from sidebar-messenger.json.


---

<a id="source-22"></a>

## 22. PROFILE_GRID_EDITOR_INSTRUCTIONS.md

# William profile grid editor (admin preview)

This is a non-destructive layout editor for `assets/code/william.html` on the **Profile** page when logged in through the portal’s `#admin` preview credentials. The original HTML modules and their scripts remain in their original files. Other pages and Jasper’s layout retain their original geometry.

## Moving and stretching

All direct children of the profile’s sidebar and main content columns are included: title, photo, identity, contact, interests, tags, links, music player, about, bulletin, posts, gallery, projects, guestbook, donation, pins, news, and network notice. No modules are removed or replaced.

- Drag any module using the dotted grip at the top, or drag an unoccupied portion of its heading.
- Drag the side handles to adjust width, top/bottom handles to adjust height, and corner handles to adjust both. Handles also accept arrow keys; Shift increases the step to 20 pixels.
- The translucent 20-pixel reference grid permits modules to cross original column boundaries. Snap to grid can be disabled for individual pixels.
- Other modules automatically reposition to a nearest free space without overlapping the active module. The canvas can grow as needed; no original column placement is enforced in admin editing mode.
- The internal markup is preserved. Designed/scaled modules zoom **uniformly** with width, so text and artwork do not warp. Height changes expand the usable module space or permit scrolling when condensed. Dynamic-height text naturally reflows where supported by that module.
- `Normalize Modules` makes all module frames identical and packs them into rows. Vertical, Horizontal, and Both sliders adjust all modules together. `Free arrangement` returns to individual editing without restoring prior positions.
- Save is automatic after interaction in this browser; **Save & export profile.json** downloads the current positions and sizes of every module in CSS pixels. Send that exact file with the ZIP when requesting adoption of your chosen layout into package defaults.
- `Restore package positions` asks for confirmation before replacing your local edits with the original package geometry.

## MySpace palette conversion

The former MySpace **layout presets** are only color palettes for this package. Their archived wallpaper images are independently listed in Design Studio → Images → **MySpace Archive Wallpapers**. The preset gallery now previews colors and background images without writing position, width, height, column arrangement, flex/grid layout, or other layout CSS to the page. The existing modules and other pages retain their geometry.

## `profile.json`

The runtime export uses schema `ourspace.profile-layout.v1`. It contains `canvas.widthPx`, `canvas.heightPx`, `canvas.gridStepPx`, `moduleCount`, `moduleIds`, and `modules` keyed by the original element IDs with exact `x`, `y`, `widthPx`, `heightPx`, `rightPx`, and `bottomPx` values. The exported JSON is layout data, not a replacement for the separate account/profile content or design palette JSON.

## Scope / behavior

Activation requires William's native profile view in the admin preview session (`OurSpaceAuth.isAdmin()`), not just a hash appended to a public page. It does not change any non-profile page, nor Jasper's existing module geometry, nor the original default positioning scripts when the profile editor is inactive. No widgets, content sections, or buttons are intentionally hidden or discarded.


---

<a id="source-23"></a>

## 23. PROFILE_LAYOUT_2026-11-02.json

~~~~~~~~~~~~json
{
  "schema": "ourspace.profile-layout.v1",
  "version": 1,
  "generatedAt": "2026-11-02T06:25:26.279Z",
  "profile": "william",
  "page": "profile",
  "editor": "disabled: layout locked; no movement, resizing, or grid editing",
  "canvas": {
    "widthPx": 1754,
    "heightPx": 3285,
    "origin": "profile-content top left"
  },
  "moduleCount": 17,
  "moduleIds": [
    "profileTitle",
    "profile-photo",
    "profile-identity",
    "profile-about",
    "profile-contact",
    "profile-donation",
    "profile-tags",
    "profile-interests",
    "profile-music",
    "profile-projects",
    "networkNotice",
    "profile-links",
    "profile-posts",
    "profile-guestbook",
    "profile-gallery",
    "profile-bulletins",
    "profile-news"
  ],
  "modules": {
    "profileTitle": {
      "id": "profileTitle",
      "moduleType": "profileTitle",
      "columnOrigin": "sidebar",
      "order": 0,
      "x": 0,
      "y": 0,
      "widthPx": 560,
      "heightPx": 60,
      "rightPx": 560,
      "bottomPx": 60,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-photo": {
      "id": "profile-photo",
      "moduleType": "profile-photo",
      "columnOrigin": "sidebar",
      "order": 1,
      "x": 0,
      "y": 74,
      "widthPx": 560,
      "heightPx": 360,
      "rightPx": 560,
      "bottomPx": 434,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-identity": {
      "id": "profile-identity",
      "moduleType": "profile_identity",
      "columnOrigin": "sidebar",
      "order": 2,
      "x": 0,
      "y": 448,
      "widthPx": 560,
      "heightPx": 200,
      "rightPx": 560,
      "bottomPx": 648,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-about": {
      "id": "profile-about",
      "moduleType": "profile_about",
      "columnOrigin": "sidebar",
      "order": 3,
      "x": 0,
      "y": 662,
      "widthPx": 560,
      "heightPx": 260,
      "rightPx": 560,
      "bottomPx": 922,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-contact": {
      "id": "profile-contact",
      "moduleType": "contact_links",
      "columnOrigin": "sidebar",
      "order": 4,
      "x": 0,
      "y": 1744,
      "widthPx": 560,
      "heightPx": 280,
      "rightPx": 560,
      "bottomPx": 2024,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-donation": {
      "id": "profile-donation",
      "moduleType": "donation_module",
      "columnOrigin": "sidebar",
      "order": 5,
      "x": 0,
      "y": 936,
      "widthPx": 560,
      "heightPx": 340,
      "rightPx": 560,
      "bottomPx": 1276,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-tags": {
      "id": "profile-tags",
      "moduleType": "profile_tags",
      "columnOrigin": "sidebar",
      "order": 6,
      "x": 580,
      "y": 460,
      "widthPx": 960,
      "heightPx": 420,
      "rightPx": 1540,
      "bottomPx": 880,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-interests": {
      "id": "profile-interests",
      "moduleType": "profile_interests",
      "columnOrigin": "sidebar",
      "order": 7,
      "x": 580,
      "y": 100,
      "widthPx": 960,
      "heightPx": 340,
      "rightPx": 1540,
      "bottomPx": 440,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-music": {
      "id": "profile-music",
      "moduleType": "profile-music",
      "columnOrigin": "sidebar",
      "order": 8,
      "x": 0,
      "y": 2706,
      "widthPx": 560,
      "heightPx": 500,
      "rightPx": 560,
      "bottomPx": 3206,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-projects": {
      "id": "profile-projects",
      "moduleType": "current_projects",
      "columnOrigin": "sidebar",
      "order": 9,
      "x": 580,
      "y": 1320,
      "widthPx": 960,
      "heightPx": 440,
      "rightPx": 1540,
      "bottomPx": 1760,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "networkNotice": {
      "id": "networkNotice",
      "moduleType": "networkNotice",
      "columnOrigin": "main",
      "order": 11,
      "x": 580,
      "y": 0,
      "widthPx": 960,
      "heightPx": 80,
      "rightPx": 1540,
      "bottomPx": 80,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-links": {
      "id": "profile-links",
      "moduleType": "profile-links",
      "columnOrigin": "main",
      "order": 12,
      "x": 0,
      "y": 1290,
      "widthPx": 560,
      "heightPx": 440,
      "rightPx": 560,
      "bottomPx": 1730,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-posts": {
      "id": "profile-posts",
      "moduleType": "profile_posts",
      "columnOrigin": "main",
      "order": 13,
      "x": 580,
      "y": 894,
      "widthPx": 960,
      "heightPx": 400,
      "rightPx": 1540,
      "bottomPx": 1294,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-guestbook": {
      "id": "profile-guestbook",
      "moduleType": "guestbook",
      "columnOrigin": "main",
      "order": 14,
      "x": 0,
      "y": 2038,
      "widthPx": 560,
      "heightPx": 320,
      "rightPx": 560,
      "bottomPx": 2358,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-gallery": {
      "id": "profile-gallery",
      "moduleType": "carousel_gallery_module",
      "columnOrigin": "main",
      "order": 15,
      "x": 580,
      "y": 1780,
      "widthPx": 960,
      "heightPx": 520,
      "rightPx": 1540,
      "bottomPx": 2300,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-bulletins": {
      "id": "profile-bulletins",
      "moduleType": "profile-bulletins",
      "columnOrigin": "main",
      "order": 16,
      "x": 580,
      "y": 2320,
      "widthPx": 960,
      "heightPx": 880,
      "rightPx": 1540,
      "bottomPx": 3200,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    },
    "profile-news": {
      "id": "profile-news",
      "moduleType": "profile_news",
      "columnOrigin": "main",
      "order": 17,
      "x": 0,
      "y": 2372,
      "widthPx": 560,
      "heightPx": 320,
      "rightPx": 560,
      "bottomPx": 2692,
      "contentSizing": "proportional-width; height-reflow-and-scroll"
    }
  },
  "appearancePresets": {
    "geometry": "locked, cannot be changed by presets or editors",
    "palette": "colors only",
    "images": "background image library"
  },
  "notes": "Saved profile positions and dimensions are final. Profile layout editor and all grid/drag/resize controls are disabled. Content and design styling remain active."
}

~~~~~~~~~~~~

---

<a id="source-24"></a>

## 24. README.md

**Current Communication integration:** See [COMMUNICATION-MODULE-INTEGRATION.md](COMMUNICATION-MODULE-INTEGRATION.md). The blank Communication page is replaced by a native working Communication module in both William and Jasper HTML files. The existing Sidebar Messenger / scroll-wheel and page share one messaging instance, with no iframe or second messenger. William `#admin` now edits Communication and exports `communication.json`; Store placement has been retired, with the supplied `stores.json` installed as read-only geometry.

**Current Store integration:** See [STORE-INTEGRATION.md](STORE-INTEGRATION.md). Store is now a native page in both profiles: William sees Dino Store, Jasper sees Squishy Store. The supplied Store geometry is now locked; `communication.json` replaces the Store layout export. The attached Journal/Diary `bulletin.json` layout is preserved, and the former Journal & Diary placement editor is retired.

**Latest module integration:** See [JOURNAL-DIARY-INTEGRATION.md](JOURNAL-DIARY-INTEGRATION.md). Journal & Diary Cards are now implemented in the original profile HTML files with William-only admin layout editing. Visual/Audio/Feed remain functional but their previous layout editor was removed.

# OurSpace · MySpace-style rebuild

Start the site at `ourspace.html` when hosted over HTTPS (or localhost for testing). The supplied PNG is used as the large login illustration and as the PWA icon source. The attached OurSpace cottage emblem is also the 100×100 movable design bubble. No external JS/CSS frameworks or vendor build steps are needed.

## Exactly four HTML files

- `ourspace.html`: landing/sign-in and code recovery dialog. No profile identity choices are exposed in normal login.
- `assets/code/william.html`: William's classic profile, read-only public profile and the nine intentionally blank destinations.
- `assets/code/jasper.html`: Jasper's equivalent profile, read-only public profile and the nine blank destinations.
- `assets/code/design-widget.html` was previously an independent standalone copy; this absorbed shell has been removed. The integrated Quill widget remains in `script/design/design-widget.js` and `style/design/design-widget.css`, without an iframe or Shadow DOM.

## Navigation

When signed in, a person's profile is `assets/code/<profile>.html?page=profile`. Each other destination uses `?page=household`, `journal`, `diary`, `feed`, `skills`, `communication`, `audio`, `visual`, or `store`. Journal and Diary are now fused in the implemented Journal & Diary Cards page; the old Diary URL redirects to the Diary tab. Household and Skills remain deliberately white/empty; the floating design bubble and compact master navigation remain accessible. **The Journal/Diary components and a catalog-based fake-currency Store are included; a connected checkout backend is not guaranteed in the static package.** The profile alone includes MySpace-style identity, interests, details, contact, tags, music, bulletins, posts, photos, links, projects and guestbook.

The master nav can move and collapse. Its export saves a snapshot, not a complete account backup. The page modules can collapse and are vertically resizable. The design widget can be dragged, opened, and closed with its red X.

## Design scope

Each person and page has a separate design state key (`ourspace.design.v2.<profile>.<page>`). The designer scans the current DOM for `data-design-target` + `data-design-label`, so adding a future module automatically creates an editable target, not a code-injection box. Users select type-specific targets, edit color via color wheel or hex code, font, spacing, images, borders, scrollbars, save looks, export CSS/JSON, and copy matching targets to another page or common styles sitewide. A copied style only applies when the target ID and target kind match; profile-only modules never transfer to unrelated pages. The designer runs in the normal DOM and does not permit arbitrary code pasted into About Me.

## State, privacy, and sync caveat

`#admin` in **both** login fields opens a local preview chooser. Preview state remains device-local and must never be interpreted as a backend administrator account. Ordinary sign-in calls the server-side authentication gateway; no special client-side name/password bypass exists.

Private profile data are stored locally only in preview, and are sent through the account backend in normal mode (`profile.get`/`profile.save`). The current design storage is browser-local with a portable JSON export, and supports **optional** server sync actions. The supplied backend's acceptance of these actions has not been verified. **Cross-device profile design sync is not guaranteed until the existing backend and hosting gateway implement/test the compatible design get/save contract.** Do not put a private Apps Script URL or access token in frontend files.

## Installation

`ourspace.webmanifest`, `service-worker.js`, and the 180/192/256/512 PNG icons are present. On a supported HTTPS browser, the Download button requests installation when available; iOS users follow Add to Home Screen. Installed PWAs share the site origin's account authentication rather than a device-specific profile. Cached content is only the static app shell; API responses and user data are never cached by the service worker.

The folders are exactly `js`, `css`, `json`, `docs`, and `assets` containing `images`, `audio`, `code`. There are no scripts for Windows, native app bundles, additional HTML pages, or nested subdirectories elsewhere.

## Latest design-widget improvement

See `docs/DESIGN-PRESET-CATEGORY-LIVE-PREVIEW.md` for six required categories, eight-at-a-time loading, immediate on-profile previews, and the Keep/Undo confirmation workflow.

## Updated Images tab (121 reference images)

See `docs/BACKGROUND-IMAGE-LIBRARY.md` for filtering, lazy previews, Keep/Undo, and licensing notes. The image links and file/license sources are preserved in `json/design/background-image-library.json`; the original user-provided text reference is also in `docs/background-image-links-source.txt`. Six categories and 58 interests are available. Each profile and blank page can browse this collection without loading all images, and the standalone `assets/code/design-widget.html` includes the same image library.

## Safe presets and admin removals

The design widget now applies geometry-safe styles only. The previous layout/image deletion interface has been removed. The existing `json/ourspace main/deleted.json` denylist remains so removed catalog entries cannot return. See `docs/DELETIONS-AND-SAFE-PRESETS.md` for the merge-only deletion policy.

## Current catalog migration

See `docs/REMOVALS_AND_DRIVE_MIGRATION.md`, `json/ourspace main/deleted.json`, and `json/design/drive-image-library.json`. Deletion requests from `choices.json` have been implemented into both designer catalogs. Drive originals are not in this package.

## Integrated replacement record player (this revision)

The original profile record-player markup, CSS, and playback listeners have been deleted and replaced by the turntable and waveform supplied in `01_Record_Player.zip`. Hardware HTML is embedded directly in `assets/code/william.html` and `assets/code/jasper.html`, with no separate `record_player.html`, iframe or Shadow DOM. The profile designer now includes 19 precise record-player hardware targets. **Only `william.html?page=profile` in `#admin` preview has in-flow drag/reorder and all eight resize handles**. The exported `record-player.json` stores William’s chosen position and dimensions; send it back with the package so it can become the shipped default. Jasper has the same player but no placement editor. See `docs/RECORD-PLAYER-REPLACEMENT.md`.

## Record player: whole-artwork proportional resizing (new)

On `william.html` in `#admin` mode, drag any side/corner of the player. The record, tonearm, metadata text, waveform, transport buttons, and playlist/details shrink or grow **together**; the section itself grows or shrinks to fit without hiding its contents. The music player stays in the regular column flow and pushes the sections below it down/up. The admin editing toolbar remains legible at small sizes. Drag the Move handle to change section order or column. **Save & export record-player.json** records the rendered dimensions and precise artwork scale, then send it with this ZIP to install that default. Jasper retains the functioning player without admin handles. The backend and design widget are unchanged. See `docs/RECORD-PLAYER-REPLACEMENT.md`.

## Current module phase: Bulletin Board

The old profile bulletin post form was replaced by the complete native Bulletin Board in both profile HTML files. The record-player editor was retired and the user-supplied `record-player.json` is now the packaged default. William has a new #admin-only move/resize editor for the complete Bulletin Board which exports `bulletin.json`; Jasper has the bulletin but not the editor. See `docs/BULLETIN-BOARD-INTEGRATION.md`.

## Links Module pass

See `docs/LINKS-MODULE-REPLACEMENT.md` for the new Links Module, packaged bulletin placement, nine design parts, and William-only admin proportional resize/move editor.

## Twelve profile-module replacements

See `docs/PROFILE-MODULES-REPLACEMENT.md` for William-only 12-module admin editing, independent whole-content resizing, placement exports, and the finalized Links Module position.

## October 31: Profile picture, jump navigation, fixed footer Messenger

The user-exported 12 `profile-modules.json` placements are adopted as the default. The 12-module editor is gone. The new portrait picture uploader/cropper and independent page-specific jump navigation are on profile pages; see `docs/PROFILE-PICTURE-JUMP-NAV-FOOTER.md`. The footer Messenger is mounted in William and Jasper HTML and remains visible across blank destinations, with the original messenger runtime and browser-local message storage. The 40px bar stays fixed at the viewport bottom; in William #admin its chat window is resizable and exports the same `profile-modules.json` name with 12 frozen modules plus a footer record. Account/device sync depends on compatible backend actions and is not certified.

## Sidebar Messenger rail (current pass)

`docs/SIDEBAR-MESSENGER-INTEGRATION.md` explains the replacement of the previous footer, the 47 design controls and William-only `sidebar-messenger.json` editor. The right rail has the integrated vertical scrollbar and six left-opening menus, with no separate module HTML. The native page scrollbar is visually hidden while the rail is mounted.

## Page Fill-Ins (Visual, Feed, Audio)

The three real page implementations are now embedded in William/Jasper profile HTML routes (no additional HTML). See `docs/PAGE-FILLS-INTEGRATION.md` for placement editor behavior and the three links to existing profile modules. The approved sidebar width is frozen and no longer shows admin resize handles.


---

<a id="source-25"></a>

## 25. RECORD-PLAYER-REPLACEMENT.md

# OurSpace record-player replacement — integration notes

## Source and removal

- Source: user-uploaded `01_Record_Player.zip`, including the exact turntable/transport/waveform HTML and three original audio-engine/metadata scripts.
- **Removed, not hidden:** the old `#recordDisplay` player, old `#profileAudio` audio tag, old `.record-vinyl` implementation and its `record-display` / `record-vinyl` / `record-info` CSS and JavaScript handlers.
- New real DOM markup is included directly inside **both** `assets/code/william.html` and `assets/code/jasper.html`. There is **no** `record_player.html`, iframe, Shadow DOM, canvas-as-site-viewport or second overlaid player.
- The replacement retains the functional audio engine, waveform canvas, turntable, metal tonearm and buttons. `js/record_player_inline-script-01.js` retains the supplied metadata logic. `-02.js` now compensates for the proportional CSS transform when sizing the waveform canvas; this keeps bars sharp and correctly stretched across the whole display at every size. In `-03.js`, only a path correction to the sample MP3 and a guard against starting on blank/public pages were added. `record_player_theme.js` scopes its light/dark toggle inside this record-player component rather than modifying the whole OurSpace page.
- The source MP3 is retained under `assets/audio/shared/record_player_create-in-defiance.mp3`, and its file bytes are unchanged.
- `css/record_player_style.css` contains the original CSS declaration bodies and keyframes, with rewritten selectors restricted to `#recordPlayerFlow` so that original global `html`, `body`, `:root` and button rules cannot overwrite other profiles/modules. A separate lightweight integration stylesheet `css/record_player_layout.css` handles the in-flow wrapper and proportional scaling without any editor handles. No original record-player hardware appearance is restyled into the old record player.
- A small Saved music links disclosure below the replacement preserves profile music entries and sends a music-sync event to the original player runtime without an iframe or a second playback engine.

## Designer migration

- The source's independent `record_player_design_widget.js` is deliberately **not loaded**: users use the existing page's designer.
- Its **19 original part specifications** are represented both in `json/audio visual/record-player-parts.json` and `js/record_player_design_specs.js` and automatically registered in the profile's target picker with `Record Player · Parts` grouping.
- The profile designer's Style tab handles exact original part controls: cabinet wood, platter rim, vinyl grooves, label, tonearm, needle, knob, artist/title/time typography, five playback buttons, whole transport, and three waveform color channels. Colors have wheels and hex codes; fonts and sizes apply only to parts that support them.
- The source's material gradients and waveform CSS variables are reconstructed by the original algorithm; profile-wide design presets cannot override record-player internal geometry or hardware unless a part is specifically edited.
- Part-specific settings are saved in the existing per-profile/per-page design state (`recordParts`), so Undo, Redo, import/export and account design synchronization continue to use the existing designer.

## Record player position finalized, editor removed

The user-supplied `record-player.json` is now installed at `json/audio visual/record-player.json`, and William's approved placement is applied automatically: sidebar, after `profile-identity` and before `profile-contact`; saved preferred width **327 px**, proportional reference width **980 px**, and requested scale **0.32959** (constrained by available viewport width when needed). Jasper's saved record-player placement remains null; his player continues at its ordinary default.

The record player's admin toolbar, all eight resize handles, size/move/export/reset event handlers, and admin-only CSS were **removed**, not hidden. `js/record_player_layout.js` now performs only stable saved placement and proportional display scaling; there is no record-player move/resize editor. The music player itself and its 19 design targets are preserved. The previous editor state is not read back from browser storage, so it cannot override the approved JSON.

The only profile placement editor in this pass is for the newly integrated Bulletin Board, and is offered only on `william.html` in `#admin` preview. See `docs/BULLETIN-BOARD-INTEGRATION.md`.


---

<a id="source-26"></a>

## 26. REMOVALS_AND_DRIVE_MIGRATION.md

# OurSpace — catalog deletion and Google Drive image migration

## Deleted from actual code and catalogs

The supplied `choices.json` removed exactly **6 layout presets** and **58 old image entries**. They are physically absent from both `js/design-widget.js` and `assets/code/design-widget.html`, and from the active JSON catalog. They appear only in `json/ourspace main/deleted.json` as permanent tombstones and in this deletion log. Do **not** reload old item lists when merging a module from another chat without filtering them against `deleted.json` using the IDs and URLs.

## Active catalog

The active catalog contains **94 layout presets**, **63 surviving Wikimedia images**, and **58 new Drive-hosted WebP images** (121 images total). Google Drive files are referenced individually, but the WebP bytes themselves are not in the ZIP.

**New seventh Images category: Real Life**, with 20 Onyx images, 16 Tiggy, 12 Callie, 8 Harvey, and 1 William & Jasper image (57). The `Trans Rights Or I Bites` image is under **Themes & General Interests → Trans rights**.

`json/design/drive-image-library.json` contains exact file IDs, names, categories, original Drive display links, and separate preview and background-image links. Those URLs use Google Drive's public thumbnail endpoint (`drive.google.com/thumbnail?id=FILE_ID&sz=w...`). Availability depends on Drive's host, link access, image format rendering, rate limits, and permissions; remote image delivery has **not** been demonstrated through the existing account backend.

### Backend / privacy limitations

No Apps Script backend was changed, replaced, exposed or bundled. The available ZIP does not contain a verified Drive-image backend response contract, so an authenticated server-side image-proxy cannot truthfully be claimed. The client currently references individual Google Drive images directly over HTTPS and leaves all originals on Google Drive. If your existing backend already offers an authenticated image URL resolver, connect that **verified** operation before treating images as private; a browser displaying an image fetched from Drive directly discloses the image URL and ID to the browser.

Google Drive metadata for the folder and sampled files unexpectedly reports **`anyone:writer`**. That is much more permissive than needed for public-read image backgrounds. Changing sharing roles has not been done here. Review the folder's access before using photos on public-facing profiles. Even with `anyone:reader`, a publicly embeddable image should be treated as publicly viewable. For genuinely private photos, use an authenticated server-side asset endpoint rather than Drive's shared image URLs.

If a Drive image fails to display, the gallery still provides its source-file link so you can confirm sharing and view it in Google Drive. Nothing is silently embedded in the ZIP as a workaround.

### Merge contract for future OurSpace modules

1. Read `json/ourspace main/deleted.json` before importing any image or layout catalog.
2. Compare by ID and **normalized source, wallpaper and thumbnail URLs**; drop any matches.
3. Preserve existing Drive-file IDs and category assignments from `json/design/drive-image-library.json`.
4. Recreate both the standalone catalog and the integrated widget catalog using the filtered lists; update the in-code `DELETED_INITIAL` as well.
5. The former `#admin` image/layout removal manager has been removed in the record-player replacement pass; `deleted.json` remains as a passive denylist for future merges.

All unused core profile HTML pages, the existing authorization system, project scripts, app manifest, and service worker remain otherwise unchanged except for a cache revision. No backend file was created.


---

<a id="source-27"></a>

## 27. SIDEBAR-MESSENGER-INTEGRATION.md

# Sidebar Messenger · OurSpace integration (October 31, 2026)

The original Footer Messenger **has been deleted**, including its footer markup, CSS, JS, layout editor, sync adapter, and design spec registry. No footer dock remains. The Pass 11 Sidebar Messenger core is embedded as one in-page element `#sidebar-messenger-root` in BOTH `assets/code/william.html` and `assets/code/jasper.html`. It also operates on the existing blank page routes without adding HTML entrypoints. It uses no iframe, no Shadow DOM, no new floating design bubble.

## Original functionality retained

All six actions (Quick Chat, Chats, Rooms, Unread, Messages, Today) appear on a fixed right-side rail with the original blue integrated scrollbar. Each opens a separate panel on the left, with its source code's independent eight-edge/corner resizing and draggable titlebar, responsive child typography, composer, attachments, sticker/GIF/voice/video actions and original local message storage. The module's CSS has been **extracted and scoped** to its `.mp-` classes and `#sidebar-messenger-root` to prevent the standalone package's unrelated global selectors from breaking the profiles.

## Rail placement

Only William signed in with `#admin` sees eight resizing handles around the rail, a drag button and **Save & export sidebar-messenger.json**. Rail width, height, right inset, top inset, content scale, internal gaps and each pop-out's own saved geometry are included in the JSON. The profile content reserves the rail width as a right gutter so the modules reflow rather than being covered; because the rail follows the viewport it cannot logically be inserted between two in-flow sections.

`js/sidebar_messenger_layout.js` persists geometry in `ourspace.sidebar-messenger.layout.v1.william` and restores it when the same browser reloads. The original source message storage continues at `ourspace.messenger.v3.<profile>` and is compatible with the replaced footer controller. The **single existing OurSpace Design Widget** now owns all 47 original Sidebar Messenger design parts, as well as rail geometry controls (width, height, content scale and internal spacing); there is no second designer.

## Cross-page messages and backend

Messages persist across page changes in the same browser, because the original storage key and local BroadcastChannel are retained. `js/sidebar_messenger_sync.js` attempts the **existing** server action `messenger.sync` only after a real verified session. It never deletes local messages when a request fails. Backend support for this action has not been confirmed: cross-device synchronization is not guaranteed until the action is tested. No new backend file or endpoint is provided.

## External source vs integrated files

Source: `Sidebar_Messenger_Design_Widget_Pass11(1).zip` (Pass 11). Integrated: `js/sidebar_messenger_messenger.js`, `css/sidebar_messenger_style.css`, `js/sidebar_messenger_design_specs.js`, `js/sidebar_messenger_layout.js`, `js/sidebar_messenger_sync.js`, `json/communication/sidebar_messenger_module.json`, `json/communication/sidebar-messenger.json`. Do not copy its `sidebar_messenger.html` or independent `sidebar_design_widget.js` into OurSpace: those would duplicate the design widget.

## Verification

Browser checks: both profiles, mobile and desktop rail, six menu panels and 8 handles per panel, scrollbar, content scaling with geometry, William-only admin handles and JSON export, blank page rail, no JS errors. Tests used in-memory HTML/JS to avoid network navigation restrictions; remote backend actions were not exercised.


---

<a id="source-28"></a>

## 28. STORE-INTEGRATION.md

# Native Dino / Squishy Store Integration

The supplied stores.zip was integrated into `assets/code/william.html` (Dino Store) and `assets/code/jasper.html` (Squishy Store). There is no separate store HTML, no iframe, no Shadow DOM, and no second design widget. Store selectors use scoped CSS to protect the rest of OurSpace. The intact source product catalogs and shopping/cart logic live in `js/ourspace-store-william.js` and `js/ourspace-store-jasper.js`; the native store CSS is in `css/ourspace-store-*.css`.

`#admin` on William's `?page=store` adds 8 resizing grips and a drag handle. It manipulates flow-based width/height/margins (never absolute overlays), saves to localStorage and exports `stores.json` for the next integration. Jasper sees the Squishy Store only and has no placement editing handles. William sees Dino Store only. Checkout ownership restrictions in the supplied stores were opposite of the requested visibility; required buyer profiles now follow the page identity. In the hosted app, checkout uses `OurSpaceAuth.request()` to reach the same-origin `/api/ourspace` gateway. Backend availability and authorization cannot be guaranteed by a static ZIP; offline/admin catalog viewing does not perform purchases.

`js/ourspace-store-design-specs.js` adds store-specific headings, labels, buttons, cards, product grid, checkout and other targeted parts to the existing OurSpace Design Widget. All selectors are limited to the Store module.

The user-supplied `bulletin (1).json` placement is kept in `json/journal diary/journal-diary-imported-placement.json`. The prior Journal & Diary placement controls and export button have been removed, while its actual Journal and Diary interfaces remain. Existing profile pinboard `json/bulletin/bulletin.json` is unrelated and unchanged.


---

<a id="source-29"></a>

## 29. STORE-MODULES-INTEGRATION.md

# OurSpace native Store integration

Both supplied storefronts are integrated directly into the same Store page in `assets/code/william.html` and `assets/code/jasper.html`. No iframes, Shadow DOM, external store HTML files, or overlapping placeholder pages are used. The two store components stay separate, with independent catalogs, carts and account-based buyer permissions.

## Store components

* Dino Store, source `28_Dino_Store`, native module `osDinoStoreSource`, independent item catalog, seller William, buyer Jasper.
* Squishy Store, source `29_Squishy_Store`, native module `osSquishyStoreSource`, independent item catalog, seller Jasper, buyer William.

All source UI elements and checkout dialogs are present in light DOM; selectors and IDs are namespaced to avoid collisions with OurSpace and with each other. Source styles (including responsive rules) are preserved within namespaced `css/os-store-*.css` and original copies in `docs/`. The original store catalog/config data is retained as `json/os-store-*.json`; each store's core functional runtime remains its own script in `js/os-store-*-runtime.js`. Store authentication now uses the existing secure `OurSpaceAuth` gateway. The module designer's nine original target categories and granular store targets are integrated into the existing profile Design Widget, with NO standalone store designer overlay.

Checkout uses the original backend request actions through the existing `/api/ourspace` gateway. In #admin mode, catalog browsing/search/filtering works but checkout is appropriately disabled. No actual backend order or purchase was exercised; success still requires a deployed backend with matching actions.

## #admin editing

Open `assets/code/william.html?page=store` via the existing #admin sign-in. Each Store module has a real frame with eight side/corner handles, a drag bar, and accessible Up/Down reorder buttons. Resizing and moving change width/height and flow margins, not absolute overlay coordinates. Dragging a module across the other one can reorder both in the normal flow. The normal document flow automatically makes room. Hit **Save layout & export stores.json** to store this browser's positions and download `stores.json`, with both stores' dimensions, offsets and ordering.

The editor never appears on Jasper's page, outside William #admin, or on the Journal page. The previous Journal/Dairy placement editor and its export button were removed; saved Journal + Diary geometry from the supplied `bulletin (1).json` was applied to William and is now locked. Original profile Pinboard `json/bulletin/bulletin.json` is untouched.

The current bundle is front-end only. Account/checkout integration requires the existing live gateway, and UI tests are not equivalent to verified live purchases.


---

<a id="source-30"></a>

## 30. skills_workbooks_handouts_DESIGN_WIDGET.md

# Skills Workbooks Handouts designer (v7)

- Designer is embedded in the existing HTML; **no HTML entry file added**.
- All styling is scoped to `[data-os-design-scope="skills_workbooks_handouts"]` inside this module. Never changes `html`, `body`, sibling modules, or the surrounding page background.
- No iframe, Shadow DOM, arbitrary CSS injection, or unrestricted selector entry.
- Only `5` explicitly registered parts can be changed; changes are previewed live, then kept or undone.
- Local saved preferences key: `ourspace.module-design.v7.skills_workbooks_handouts.<profile>`.
- The 100 archived layout names and references are reorganized into six browse categories by theme. Eight entries are presented per page **after a category is selected**. These category assignments are aesthetic interpretations, not endorsements or licensed media layouts.
- Presets change only compatible component properties. In particular, the original records, needles, notebook imagery, scrapbook textures and static Onyx images are not replaced.
- Some CSS values are only customizable when the relevant component is visible or instantiated.
- The Skills hub is styled independently; its original worksheets and handouts are intentionally not modified.

## Registered module parts

- Skills workbook headings: text, font, size
- Workbooks and chapter descriptions: text, font, size
- Book navigation tabs: fill, text, border, font, size
- Book content cards: fill, border
- Workbook controls: fill, text, border, font, size



---

## External and uploaded backgrounds — verified repair (Nov 2026)

The Design widget's **Images** tab applies image URLs and image-library selections directly to the selected target; the background is saved without a second Keep click. The four numbered module-background slots now let users choose the actual module destination. Profile and page-background CSS are generated after the site's base styles, and the base skin no longer clears explicitly assigned images.

**External image fidelity:** All existing background-image catalog URLs, external URLs, image sources, file names, query strings and links are preserved. No remote image is downloaded, rehosted, converted, resized or substituted. A remote image must still be a directly embeddable image file; some third-party providers disallow hotlinking, block embedding, or expose an HTML page rather than image bytes. The designer reports the warning but does not erase or change the URL.

**Local upload fidelity:** Source bytes are retained without image resizing or conversion, including GIF animation. Small originals (up to 650,000 bytes) are stored as original base64 data URLs within the design state. Larger originals are stored as `Blob`s in browser IndexedDB and referenced by `ourspace-bg:` identifiers; they load again on that origin in the same browser. When IndexedDB is denied, the original data URL is used instead and the UI warns that the browser may limit persistence. Moving to a different browser, website origin or device requires retaining and re-uploading any large original files. A JSON export with `ourspace-bg:` identifiers is not by itself a portable backup of those larger image bytes; keep the original files.

**Background workflow:** Open a page's Design widget, select **Images**, choose **Website background image** or a **Module background image slot**, choose the real module if relevant, then paste a direct HTTP(S) image link, upload a local file, or select an image-library entry. **Use image link**, upload and image-library selection apply immediately. **Saved Looks** retain original external URLs and restore them when applied. The PrismShift color-mode engine does not invert or replace image pixels.
