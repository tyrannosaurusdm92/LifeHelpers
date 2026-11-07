# Current OurSpace Messenger implementation

This package uses the supplied mockup as the design of both the main profile Messenger drawer and its lightweight standalone-page counterpart.

## Authoritative source files

- `style/communication/sidebar_messenger_style.css` — main drawer, menu, panels, right yellow rail and teal/persimmon menu scrollbar. Obsolete horizontal Messenger sidebar rules were deleted from this stylesheet, not covered by an additional override file.
- `script/communication/sidebar_messenger_layout.js` — persistent open/close state, heart alert carousel, real page scrollbar, fullscreen attachment, and drawer geometry.
- `script/communication/sidebar_messenger_messenger.js` — the six menu entries, calls, messages, calendar/agenda, appearance toggle and shared wallet.
- `script/prismshift/ourspace-prismshift.js` and `style/prismshift/ourspace-prismshift.css` — current standalone-page Messenger presentation, using the same white menu, yellow functional right rail, heart handle, and pinned wallet/mode footer.
- `script/profile/profile-jump-nav.js` — independent draggable/collapsible Jump NAV, unchanged by Messenger scrolling.

## Scroll behavior

1. The yellow right-hand rail is an interactive scrollbar **for the current page**. Click the rail, drag its visible teal-bordered persimmon thumb, or focus it and press Arrow Up/Down, Page Up/Down, Home or End. The heart in the rail center is a separate open/close button.
2. The six-entry white menu has its **own native** vertical scrollbar with a teal track and persimmon thumb when the entries do not fit. The page scroll rail does not replace the menu scrollbar.
3. The appearance toggle and currency tracker remain in a rounded bottom footer. The footer itself scrolls only on unusually short viewports so controls are not clipped.
4. The scrollbar and heart are hidden/compact when the drawer is closed; no permanent page gutter is reserved.
5. During native fullscreen, the drawer and Jump NAV are attached to the fullscreen element so they remain interactive.

## Cleanup scope

This is a non-destructive cleanup. Removed 76 **byte-identical** JavaScript copies; updated their real HTML, JSON, and service-worker references to the retained canonical copies. No distinct JavaScript modules were discarded. Removed 37 conflicting/obsolete Messenger CSS blocks, replacing them with a single canonical Messenger layout. Unrelated component-specific stylesheets and distinct HTML documents were retained because merging or deleting them without a verified dependency graph would risk destroying functionality. No second corrective stylesheet or JavaScript layer was added.

## Validation

Checked: 5 main-drawer viewport sizes (1440×900, 820×620, 390×844, 320×568, 820×370); 4 standalone-drawer viewports; full-page track dragging and clicking; inner menu overflow scroll; open/close heart; Jump NAV open/close; native fullscreen attachment. Parsed 66 CSS and 94 JSON files, checked 244 JavaScript files, and resolved 1,134 local HTML script/stylesheet resource links. Live deployed backend and all production page interactions were not tested.
