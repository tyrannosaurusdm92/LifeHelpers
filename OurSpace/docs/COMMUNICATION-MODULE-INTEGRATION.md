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

The Store placement runtime/editor `js/ourspace-store-layout.js` is gone from both profile HTML files and from this bundle. Original source Store catalogs, checkout, styles, and business logic are preserved. The supplied `stores.json` was imported to `json/stores-imported-placement.json`, with William's 1674×1150 module and (0,24) offset applied as fixed CSS. Jasper continues to use Squishy Store. Journal & Diary placement remains saved and read-only.

## Validation

In a Chromium isolated rendering test using the actual native page HTML, CSS, existing Sidebar Messenger runtime, communication media additions and layout editor: William and Jasper page rendered with one Sidebar Messenger core, six sidebar wheel entries, and no JavaScript errors; four conversation selectors populated; page-to-sidebar and sidebar-to-page selection passed; page sends updated the single message store; eight handles moved and resized; JSON export downloaded `communication.json`; Jasper had zero edit handles. Full application HTTP navigation was blocked by this browser environment, so actual signed-in backend/camera/cross-device flows were not verified.

## Final layout and styling audit

The selective source stylesheet was checked for malformed nested functional selectors and corrected without importing unrelated global source selectors. Communication's inner conversation grid now expands to the admin-sized frame rather than retaining the original site's 1100px maximum. On the Communication page only, the main profile frame is allowed to use available width **up to the fixed sidebar rail's left edge**. In the rail-present Chromium test at 1800×1000, the SE handle was pointer-accessible; dragging it changed dimensions from 1584×900 to 1491×982 while the rail remained to its right. This does not alter other pages' sidebar or design widget placement.
