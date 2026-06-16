# OurSpace Messenger Plug-in

A clean, mobile-first two-member messenger plug-in for the OurSpace site. It keeps the full feature set—shared channels, media sending, browser calling, video calling, voice effects, speech-to-text, sticker creation, configurable chat backgrounds, Onyx alerts, and face-filter camera tools—but every channel, message, call signal, and alert is scoped to the same private two-member OurSpace server.

## Install

Copy the whole `ourspace_messenger_plugin` folder into the site, then add this to the page where the messenger should appear:

```html
<link rel="stylesheet" href="ourspace_messenger_plugin/css/ourspace-messenger.css">
<div id="ourspace-messenger-root"></div>
<script src="ourspace_messenger_plugin/vendor/jeeliz/jeelizFaceFilter.js" defer></script>
<script src="ourspace_messenger_plugin/js/ourspace-backend-bridge.js" defer></script>
<script src="ourspace_messenger_plugin/js/ourspace-messenger.js" defer></script>
<script>
window.addEventListener('DOMContentLoaded', function () {
  window.OurSpaceMessenger.init({
    mount: '#ourspace-messenger-root',
    appName: 'OurSpace Messenger',
    serverId: 'ourspace-william-jasper-private-server',
    twoPersonOnly: true,
    mainBackendUrl: 'https://script.google.com/macros/library/d/1Ld-KR6PrFPTBs1qsdAsZ55kBUa9QRYIkLgidknvgJ-2PLtujf9D-Mt6A/1',
    onyxAlertsBackendUrl: 'https://script.google.com/macros/library/d/1OtngPSoPXDpeYa8FDD9bb7rU_0mvFvD_23niUCrfy09t5Mbk0cy0kV5l/1',
    faceModelPath: 'ourspace_messenger_plugin/vendor/jeeliz/NN_VERYLIGHT_1.json',
    users: [
      { id: 'william', label: 'William', avatar: '🦖' },
      { id: 'jasper', label: 'Jasper', avatar: '🌙' },
      { id: 'onyx', label: 'Onyx Alerts', avatar: '🐈‍⬛', system: true }
    ],
    defaultChannel: 'home'
  });
});
</script>
```

The included `index.html` is a working demo page using the same configuration.

## Two-member channel model

- Only the first two non-system users in `users` can send as human members.
- All channels are shared by those two members only.
- New channels can be created for chores, cat pictures, date ideas, groceries, reminders, media, calls, or anything else.
- Messages, channels, call signals, and Onyx alerts are stamped with `serverId`, `participants`, `visibleTo`, `recipientId`, and `routeMode: "two_person_channels"` so the backend can store one private shared space instead of routing among arbitrary users.
- Older saved local messages/channels are normalized into the two-member server on load instead of being lost.

## Included features

- Mobile-first, desktop-second responsive layout.
- Auto dark-mode with light-mode support through `prefers-color-scheme`.
- Shared channel creation with default channels for Home, Chores, Cat Pics, Date Ideas, Grocery List, Media, and Calls.
- Member switcher for choosing whether William or Jasper is sending.
- Main chat with message bubbles, reply helper, local export, and local-first saving.
- Image, GIF, video, audio, link, JSON, ZIP, text, document, and generic file attachments.
- GIF support through file upload, pasted GIF links, or direct GIF URLs.
- Voice message recording with Web Audio effects.
- Voice effects for recordings and call microphone streams: normal, warm, robot, chipmunk, deep, echo, and monster.
- Browser speech-to-text using `SpeechRecognition` / `webkitSpeechRecognition` when available.
- Sticker creation from typed text or existing conversation messages.
- Sticker tray and one-tap sticker sending.
- Audio and video call panel using WebRTC, STUN, local/remote video panes, mute, video toggle, backend signaling, and signal-copy fallback.
- Backend bridge for messages, channels, channel listing, call signals, call signal listing, and Onyx alerts.
- Chat background image picker with opacity control.
- Face-filter camera studio with bundled Jeeliz runtime/model and canvas fallback filters.
- Local-first offline queue that retries backend sends.

## Backend expectations

The plug-in posts JSON envelopes to the configured Google Apps Script endpoints. It also retries as `FormData` for scripts that expect form posts.

Typical envelope:

```json
{
  "action": "message.create",
  "source": "ourspace_messenger_plugin",
  "clientId": "osm_william_ab12cd",
  "createdAt": "2026-06-14T00:00:00.000Z",
  "serverId": "ourspace-william-jasper-private-server",
  "participants": ["william", "jasper"],
  "routeMode": "two_person_channels",
  "data": {
    "id": "msg_...",
    "serverId": "ourspace-william-jasper-private-server",
    "channelId": "home",
    "authorId": "william",
    "recipientId": ["jasper"],
    "participants": ["william", "jasper"],
    "visibleTo": ["william", "jasper"],
    "routeMode": "two_person_channels",
    "kind": "message",
    "text": "hello",
    "attachments": [],
    "links": []
  }
}
```

Supported actions sent by the plug-in:

- `message.create`
- `message.list`
- `channel.create`
- `channel.list`
- `call.signal`
- `call.signal.list`
- `onyx.alert`

If the backend does not answer because of CORS, auth, or script-contract differences, the plug-in still saves locally and queues writes.

## Browser notes

Camera, microphone, WebRTC, and speech recognition require a modern browser. Most browsers require HTTPS or localhost for camera/microphone access. Jeeliz face tracking works best when served over HTTP/HTTPS because the model JSON must be fetchable; the canvas fallback still works from a local file preview.

## Folder policy

No full legacy app folders are bundled. Only active plug-in files and the minimal Jeeliz runtime/model used by the face-filter feature are included. Source-app decisions, manifests, audits, and licenses are in `docs/`.
