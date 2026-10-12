# Onyx — Five-Tab Design + Updated Alerts Integration

## Design scope

The Design tab now follows the same scoped widget-role strategy used by the OurSpace Record Player and Bulletin Boards. It does not apply a blanket grayscale/filter transform. Instead, the Design runtime writes named CSS variables onto the Onyx popout panel, and all five tabs consume those roles.

Designable roles now cover the module shell, headers, tabs, channel rail, conversation canvas, user messages, Onyx responses/output cards, inputs, buttons, selected states, links, muted text, focus rings, and independent scrollbar tracks/thumbs.

The outer 190×190 Onyx bubble exposes one deliberate design hook: `--onyx-border`. Everything inside the frame is excluded. The avatar/canvas, fallback PNG, habitat, SVG frame art, top-center alert box, alert/reaction contents, and bubble status are not descendants of the design-variable scope. Icons, reactions, and emoji in the five-tab module use protected glyph spans so a saved Design look cannot recolor or filter them.

## Alert runtime

`js/onyx/onyx-core/onyx-alerts.js` now contains the updated OurSpace Onyx alert runtime plus the Account Settings alert controls. It keeps the existing `window.OnyxAlerts` API for module-side subscribe/unsubscribe/list/send/in-app calls and also exposes the newer `window.OurSpaceOnyxAlerts` device preference/push API.

The alert runtime supports:

- foreground pending-alert polling when the host/backend supports `notification.list`
- Web Push subscription synchronization
- per-device Onyx alert enable/disable
- per-device sound enable/disable using `https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/audio/shared/onyx-meow.wav`
- per-device app badge enable/disable
- browser system notification permission and subscription status
- profile-scoped local alert preferences
- duplicate endpoint subscription cleanup
- service-worker foreground/open messaging
- top-center bubble alert count updates, including the initial pending-alert snapshot
- no duplicate Onyx meow when the updated alert runtime has already handled the sound

The frontend backend allow-list bundled in `js/onyx/onyx-core/brain-link.js` includes the notification/push actions needed by the updated runtime. The authoritative backend itself is not included or replaced.

## Service worker

The Onyx service-worker contribution is now shipped as root `service-worker.js`. It remains intentionally unregistered by this standalone Onyx module because OurSpace owns the site scope. Merge its push handlers into the parent OurSpace service worker during integration. Foreground/in-app alert behavior continues without a second worker; Web Push uses the merged parent worker.
