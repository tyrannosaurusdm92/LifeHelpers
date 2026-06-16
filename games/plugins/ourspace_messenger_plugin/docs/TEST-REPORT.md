# Test Report

Generated for `ourspace-messenger-plugin` version 1.1.0.

## Static checks performed

- JavaScript syntax check:
  - `node --check js/ourspace-backend-bridge.js`
  - `node --check js/ourspace-messenger.js`
- Windows-safe path check:
  - no absolute paths
  - no colon/star/question-mark/backslash-control characters in output names
  - no path longer than 180 characters
- Zip integrity check:
  - final archive tested with `unzip -t`

## Manual browser test checklist

Use `index.html` from a local web server or hosted site page. Camera/microphone features generally require HTTPS or localhost.

- Open messenger on mobile-width viewport.
- Open messenger on desktop-width viewport.
- Confirm only William and Jasper appear as human senders.
- Create a new shared channel.
- Switch channels.
- Send text message.
- Paste/send a link and verify link card.
- Attach image.
- Attach GIF.
- Attach video.
- Attach file.
- Create sticker from composer text.
- Create sticker from existing message.
- Send sticker.
- Start speech-to-text and verify text enters composer.
- Record audio using each voice effect.
- Start audio call and verify local mic permission and two-member call signal payload.
- Start video call and verify local video permission and two-member call signal payload.
- Copy call signal fallback.
- Start face filter camera.
- Switch face filters.
- Send filtered snapshot.
- Choose chat background image.
- Adjust background opacity.
- Send Onyx alert and verify local confirmation.
- Use Sync queue after offline/backend failures.
- Export chat JSON.

## Known environment limits

- Google Apps Script endpoints must accept the documented two-member channel envelope or adapt it server-side.
- WebRTC requires a signaling path. This plug-in sends signals through the main backend and also offers copy-signal fallback.
- Browser speech recognition availability varies by browser.
- Face tracking works best over HTTP/HTTPS. Local file viewing can use the canvas fallback.

## Additional automated checks for version 1.1.0

- `node --check js/ourspace-backend-bridge.js` passed.
- `node --check js/ourspace-messenger.js` passed.
- Backend bridge envelope smoke test passed for `serverId`, two participants, and `routeMode`.
- Messenger export smoke test passed for `window.OurSpaceMessenger.version === "1.1.0"`.
