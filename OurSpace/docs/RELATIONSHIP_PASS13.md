# OurSpace Pass 13 — Communication, media, feed and profile relationships

## What is shared
- Footer Messenger and the Communication page use the **same** `MessengerPluginApp` instance (`window.ourspaceMessenger`). No second message store, call interface, or backend is created.
- On signed-in accounts only, text messages are sent via the existing `message.send` action before being echoed locally. All four fixed conversations are polled via `message.list`. Server IDs are preserved for deduplication.
- Page selections and floating Messenger conversation windows use the same selected room, including deep links from published media and the other person's profile.
- The existing `social-features.js` is now included in the profile iframe. It uses the existing `public.media.list`, `public.link.list`, `public.profile.get`, and `public.media.upsert` actions. Content is publicly visible **only after deliberate publication**.
- Audio, Visual, Feed and Profile pages all read the same published-media state; the Feed panel summarizes published content from each person. News feed still uses its own existing module.
- Public visitor mode (`assets/code/william.html?public=1` or `/jasper.html?public=1`) is a **read-only rendering** of the published public profile, without private modules, chat or the Onyx controls. Its data comes from `public.profile.get`.

## Important existing backend and browser limitations
- There is no public feed-post action in the supplied backend. The new relational feed surfaces public-profile media and links; it does not create a fictitious server feed database.
- The backend supports cross-device **text** messages in the two-person rooms. The local Messenger's file recordings, media data URLs, GIFs and WebRTC calls have not been converted to server delivery. Their existing local behavior remains, and the UI labels the limitation.
- A user's public profile may not be published. In that case it does not appear publicly, and the other profile only shows an unavailable-public-profile state.
- Public profile publishing is explicit. Opening or sharing a private message does **not** publish that message, attachment or recipient details.
- Server records and author identity are scoped by the backend session. The frontend does not modify the backend or invent another account.

## Test plan
1. Log in as William. Open Communication and send a text to Jasper in the shared or direct room. The footer and Communication page should immediately agree, and the server should have the same message ID.
2. In another browser or device, log in as Jasper and open Communication. Within a refresh/poll interval the message should arrive. Reply, then verify in William's view. Check all four conversations.
3. Open a conversation from footer, switch to Communication, and check that room remains selected. Switch room on the Communication page and check footer pop-out opens the same room.
4. Publish a media link from the Audio/Visual page, check Feed and Profile cards, then access the public-view URL in a signed-out browser. Verify only published content appears.
5. Click a media card's Share in chat and verify the link appears in the private conversation without creating a public post.
6. Test a profile that has not yet been published. Its public-view URL must show the not-published message, not internal content.
7. Test browser navigation, PWA installation, and audio/video/voice message functionality. Those last three are local-only until existing backend client transport is extended.
