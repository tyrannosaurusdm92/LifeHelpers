# OurSpace Pass 37 — Sprite, home-design, and social interaction findings

Date: 2026-10-13. Scope: frontend continuity and research addendum for the existing `main/OurSpace` implementation. Backend, private server data, credentials, and third-party game artwork remain untouched.

## What the supplied references show

| Supplied reference | Source-level observation | What transfers to OurSpace |
|---|---|---|
| `CatnDog.zip` | 148 transparent PNG frames: cat and dog sets each provide 10 idle, walk, slide, dead and hurt poses, and 8 fall, jump and run poses. | Keep named clips separate, preserve action-specific frame counts, and let a state transition own its full sequence. Do not force every action into five frames. |
| `catai-main.zip` | Its README documents 68×68 PNG frames organized by state and eight direction folders; it can use generated sprites when downloadable artwork is absent. | Keep action, direction and image-source fallback explicit. Ourspace should keep its six authored Onyx views and label north/south approximations honestly. |
| `PixelPet-main.zip` | Desktop pet behavior has 20+ animation names, trait-weighted ambient behavior, drag/click interaction and optional care needs. | Separate idle mood from requested action, and keep needs or care timers optional rather than making basic sprite motion depend on them. |
| `hatpet-main.zip` | An eight-way desktop wanderer with idle timers and drag control; the supplied project describes a single static sprite. | Treat path movement, idle timing and artwork as distinct layers. Motion code alone does not make an animation; keep authored Onyx frames authoritative. |
| `Onyx_Base_Movement_Pass15_Eating_Drinking_Scaled(1).zip` | Its supplied README records 12 independent left/right eat/drink SVGs normalized to 640×640 viewBoxes, with a 51-pixel silhouette and paw baseline at y=61 on the logical 64-pixel sprite. | Load these actions through the existing feeding behavior. Keep the last loaded sprite visible during slow image loads and validate bowl reach before bite callbacks. The matching 12 SVGs and module are already in the repository atlas/runtime paths. |
| `Fox_Walk.rar`, `Fox_Idle.rar` | Supplied as motion-only visual references for walking and idle exposure. | Use them to compare anticipation, contact, settling and silhouette rhythm; no fox frames or source art are copied into Onyx. |

The Disney sources on archival animal drawing and *The Aristocats* / *Oliver & Company* inform pose readability and timing only. They do not authorize reproducing film character silhouettes or frames.

## Existing-game comparisons

| Product | Verified pattern | Design consequence |
|---|---|---|
| **Animal Crossing: Happy Home Paradise** | Client briefs lead to interior and exterior design; facilities unlock as the player develops the resort, and unlocked techniques/items can return to the home island. | Keep the room plan, object ownership, unlocks and optional sharing as separate states. A saved room should remain intelligible after item swaps. |
| **Finch** | Self-care routines feed into a pet companion loop; the home, clothing and seasonal content remain customizable. The supplied August 2026 research file also records goals, house decoration, accessibility controls and low-pressure daily progression. | Happy Home and Onyx can reinforce routines through optional rituals and room interactions. Missed activity should not block ordinary play or make the character appear punished. |
| **Habbo** | Furniture ownership, room decoration and social visiting are separate actions. | Retain exact object identity while moving it; refresh collision/interaction geometry after a transform. |
| **The Sims FreePlay** | Placement/orientation can block a route to an object. | When Onyx cannot reach a bowl, bed or toy, expose the blocked reason; do not report a completed interaction through an obstacle. |
| **Neko Atsume 2** | Goodies attract cats; cat/visit records, albums and collectible goodies provide gentle discovery. | Give Feed Him MEOW readable food/toy targets, a clear result and stable saved-vs-temporary progress. Keep discovery independent from continuous check-ins. |

## Social-site patterns to carry into OurSpace

| Site pattern | Documented behavior | OurSpace rule |
|---|---|---|
| **Facebook audience selector** | Choose the audience for each post and change default audiences. | A compose action names its destination and audience before publishing; private household sharing must never silently become a public-feed post. |
| **TikTok visibility controls** | Per-post options distinguish everyone, friends/followers and self-only; interaction permissions can be restricted separately. | Keep visibility and reply/comment permissions as separate controls. Do not infer permission to repost from permission to view. |
| **Mastodon** | Separate public, unlisted, followers-only and direct visibility; lists create filtered timelines; content warnings and notification preferences are explicit. Mastodon also states that direct messages are not end-to-end encrypted. | Keep public feed, profile, private messages, game chat and notifications distinct. Use audience and content-warning labels, and do not describe a private message as encrypted unless the existing system proves it. |
| **Bluesky** | Users can choose custom feeds, stack moderation controls and declare visibility preferences that affect recommendation reach. | Make feed filtering, muted content and moderation controls user-facing. “Visible to a friend” and “recommended broadly” should not be the same setting. |

These are interaction patterns, not a request to connect OurSpace to external networks. Feed, account profile, private messages, visual/audio attachments and notifications remain separate channels; game events never publish on their own.

## Pass 37 implementation change

Happy Home already measures the biped actor's screen-space distance and passes distance plus speed to the existing single Professor renderer. The renderer previously recomputed gait phase from total distance divided by current stride length, which can move to an earlier pose when speed changes. It now accumulates a normalized phase from each measured distance increment. The same phase selects the SVG in-between poses and the atlas keyframes. A stalled distance holds its current gait pose; the existing standing key pose is used once movement ends. A new action or rewound distance reinitializes the cycle.

Feed Him MEOW's memory fallback now takes precedence over stale readable storage after a quota/write failure. Failed deletes use a per-tab tombstone, so stale checkpoint data is not resurrected during that session.

Run `node docs/PASS37_FRONTEND_REGRESSION_TEST.js` from the `OurSpace` root. It tests the loaded Professor renderer, actual distance-to-frame continuity, source wiring, syntax, save fallback under a realistic quota failure, and scoped retry UI. No live Apps Script call is made.

## Sources

Official product, help and technical sources checked on 2026-10-13:

- Nintendo, Happy Home Paradise features and progression: https://en-americas-support.nintendo.com/app/answers/detail/a_id/56669 and https://animalcrossing.nintendo.com/new-horizons/happy-home-paradise/

- Finch Help Center, home, pet, decoration and routines: https://help.finchcare.com/hc/en-us/articles/37780000231309-Exploring-the-Finch-Home-Page and https://help.finchcare.com/hc/en-us/articles/37942847416973-Placing-Items-Besides-Birdhouse-Door

- Neko Atsume 2 official product updates: https://www.nekoatsume.com/news/news_20260629_1_en.html and https://www.nekoatsume.com/news/news_20260331_1_en.html

- Habbo furniture and shop: https://help.habbo.com/hc/en-us/articles/360011619799-All-about-the-Habbo-Shop

- The Sims FreePlay community discussion on placement/orientation blockage: https://forums.ea.com/discussions/the-sims-freeplay-en/faq-gameplay/10975865

- Mastodon posting visibility, lists, notification preferences: https://docs.joinmastodon.org/user/posting/ and https://docs.joinmastodon.org/user/network/ and https://docs.joinmastodon.org/user/preferences/

- Bluesky visibility and custom feeds: https://bsky.network/docs/about-bluesky-content/visibility-preferences/ and https://bsky.network/docs/bluesky-api/custom-feeds/

- TikTok community controls: https://www.tiktok.com/safety/community-controls/

- Facebook audience selection: https://www.facebook.com/help/170116376402147

- Phaser frame animation timing: https://docs.phaser.io/phaser/concepts/animations

- Godot 2D sprite animation: https://docs.godotengine.org/en/stable/tutorials/2d/2d_sprite_animation.html

- Walt Disney Family Museum archival *Aristocats* discussion and Disney Animation Research Library cats/dogs: https://www.waltdisney.org/blog/seeds-legacy-walt-disney-and-aristocats and https://www.waltdisney.org/cats-and-dogs

- D23 film record for *Oliver & Company*: https://d23.com/a-to-z/oliver-company-film/
