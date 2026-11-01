**Current Communication integration:** See [COMMUNICATION-MODULE-INTEGRATION.md](COMMUNICATION-MODULE-INTEGRATION.md). The blank Communication page is replaced by a native working Communication module in both William and Jasper HTML files. The existing Sidebar Messenger / scroll-wheel and page share one messaging instance, with no iframe or second messenger. William `#admin` now edits Communication and exports `communication.json`; Store placement has been retired, with the supplied `stores.json` installed as read-only geometry.

**Current Store integration:** See [STORE-INTEGRATION.md](STORE-INTEGRATION.md). Store is now a native page in both profiles: William sees Dino Store, Jasper sees Squishy Store. The supplied Store geometry is now locked; `communication.json` replaces the Store layout export. The attached Journal/Diary `bulletin.json` layout is preserved, and the former Journal & Diary placement editor is retired.

**Latest module integration:** See [JOURNAL-DIARY-INTEGRATION.md](JOURNAL-DIARY-INTEGRATION.md). Journal & Diary Cards are now implemented in the original profile HTML files with William-only admin layout editing. Visual/Audio/Feed remain functional but their previous layout editor was removed.

# OurSpace · MySpace-style rebuild

Start the site at `ourspace.html` when hosted over HTTPS (or localhost for testing). The supplied PNG is used as the large login illustration and as the PWA icon source. The attached OurSpace cottage emblem is also the 100×100 movable design bubble. No external JS/CSS frameworks or vendor build steps are needed.

## Exactly four HTML files

- `ourspace.html`: landing/sign-in and code recovery dialog. No profile identity choices are exposed in normal login.
- `assets/code/william.html`: William's classic profile, read-only public profile and the nine intentionally blank destinations.
- `assets/code/jasper.html`: Jasper's equivalent profile, read-only public profile and the nine blank destinations.
- `assets/code/design-widget.html` was previously an independent standalone copy; this absorbed shell has been removed. The integrated Quill widget remains in `script/design-widget.js` and `style/design-widget.css`, without an iframe or Shadow DOM.

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

See `docs/BACKGROUND-IMAGE-LIBRARY.md` for filtering, lazy previews, Keep/Undo, and licensing notes. The image links and file/license sources are preserved in `json/background-image-library.json`; the original user-provided text reference is also in `docs/background-image-links-source.txt`. Six categories and 58 interests are available. Each profile and blank page can browse this collection without loading all images, and the standalone `assets/code/design-widget.html` includes the same image library.

## Safe presets and admin removals

The design widget now applies geometry-safe styles only. The previous layout/image deletion interface has been removed. The existing `json/deleted.json` denylist remains so removed catalog entries cannot return. See `docs/DELETIONS-AND-SAFE-PRESETS.md` for the merge-only deletion policy.

## Current catalog migration

See `docs/REMOVALS_AND_DRIVE_MIGRATION.md`, `json/deleted.json`, and `json/drive-image-library.json`. Deletion requests from `choices.json` have been implemented into both designer catalogs. Drive originals are not in this package.

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
