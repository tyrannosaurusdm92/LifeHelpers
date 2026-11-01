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

Source: `Sidebar_Messenger_Design_Widget_Pass11(1).zip` (Pass 11). Integrated: `js/sidebar_messenger_messenger.js`, `css/sidebar_messenger_style.css`, `js/sidebar_messenger_design_specs.js`, `js/sidebar_messenger_layout.js`, `js/sidebar_messenger_sync.js`, `json/sidebar_messenger_module.json`, `json/sidebar-messenger.json`. Do not copy its `sidebar_messenger.html` or independent `sidebar_design_widget.js` into OurSpace: those would duplicate the design widget.

## Verification

Browser checks: both profiles, mobile and desktop rail, six menu panels and 8 handles per panel, scrollbar, content scaling with geometry, William-only admin handles and JSON export, blank page rail, no JS errors. Tests used in-memory HTML/JS to avoid network navigation restrictions; remote backend actions were not exercised.
