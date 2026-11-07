# OurSpace Messenger mockup / call / Jump NAV update

- Drawer: Source-owned layout in `style/communication/sidebar_messenger_style.css`; white six-entry vertical menu, yellow right-edge rail and centered cyan heart with yellow inset. Teal-bordered persimmon scrollbars. Bottom rounded card includes appearance toggle and the existing wallet.
- State: `script/communication/sidebar_messenger_layout.js` controls the open/closed heart, alert rotation, responsive overlay width and native fullscreen reparenting. The drawer no longer reserves permanent page space.
- Jump navigation: `script/profile/profile-jump-nav.js` retains drag and expand/collapse, is positioned apart from the heart, is constrained to visible space while Messenger is open, restores the user's saved placement when closed, and enters/exits native fullscreen alongside the heart.
- Calls: 📞 opens a call chooser with existing profile contacts, Voice Call and Video Call, plus missed-call count and clearing. The chosen contact is routed through existing `MessengerPluginApp.startCall()` and local/backend signaling. No second call backend or separate caller address is created. Permissions and live remote connectivity are still controlled by the existing deployment.
- Calendar: 📆 reads the locally saved household organizer tasks/events, profile assignments, recurring tasks and Onyx Professor DBT assignments. It excludes completed tasks, and offers links to Household, Communication, Skills and Onyx's widget. Household edits notify Messenger without altering organizer storage.
- Existing dark-mode state, real-life image presets, game artwork, and site identities are preserved.

## Verification
- Isolated browser tests: 1440x900 desktop, 390x844 mobile, 320x568 compact mobile and 820x370 tablet landscape passed drawer open/close, six entries, non-overlapping navigation, fixed footer, native overflow and absence of JavaScript exceptions.
- Focused tests passed: call chooser, voice and video call actions, organizer tasks/events/DBT today count, Jump NAV collapse/drag, heart availability and Jump NAV presence during browser native fullscreen.
- Full deployed two-device calling, authentication and cross-origin service-worker behavior remain unverified and require testing against the deployed Apps Script backend.
