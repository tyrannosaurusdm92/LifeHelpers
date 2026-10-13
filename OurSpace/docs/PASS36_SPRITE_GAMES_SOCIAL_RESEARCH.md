# OurSpace Pass 36 — Sprite games, feline acting, and private social UX research

Date: 2026-10-13. Implementation scope: **frontend only**, current `main/OurSpace`. No backend, credentials, external artwork, or ZIP archive is part of this pass.

## Current-source constraints

The supplied `onyx-animation-research.json` describes a 30-column × 22-row atlas, 64 px cells, 660 logical frames, six **authored** views and five phases per view. Straight north and south are nearest 3/4 approximations; there are no dedicated front/back drawings to claim. Its mood presets require *uneven idle exposures*, *distance-driven gait*, held contact poses, and reduced-motion support. The companion `onyx-base-frame-library.json` names neutral-body actions including walk, jump, loaf, curl, inspect and interact. The Fox_Walk/Fox_Idle, CatnDog, CATAI, PixelPet and hatpet uploads are **behavior reference sources**; their art is not silently substituted for Onyx or bundled as newly licensed game content.

Live GitHub review confirmed these existing files already exist: `js/onyx/games/leisure/game.js` (Feed Him MEOW), `js/onyx/games/leisure/core-app.js` (multi-phase leisure game), `js/onyx/games/virtual/happy-home-editor.js`, `happy-home-onyx-spatial-runtime.js`, the original Pass 23 movement engine, and `js/ourspace-core/social-features.js`. Do not rebuild them in isolation.

## Comparable products and transferable behavior

| Reference | Verified product behavior | OurSpace design decision |
|---|---|---|
| **Neko Atsume 2**, Hit-Point | Cat simulation centered on goodies, cat journals, wallpapers, yard customization and offline-compatible progress; its official documentation includes visit/collection and transfer considerations. | Feed Him MEOW should retain clear object affordances (food/toys), stable visit/action states, explicit saved vs temporary progress, and unambiguous interaction completion. **Do not imitate proprietary art**. |
| **Habbo** | Virtual rooms use a furniture store, room decoration, social visits and shared activities. | Keep Happy Home room geometry, item ownership and inventory placement distinct. A visible placed item must be the same item physics and interaction logic target. Prevent ghost collisions after repositioning. |
| **The Sims FreePlay** | An object may be unreachable due to placement or orientation; a user-facing footprint refusal makes blockage understandable. | For Happy Home use obstruction checks and explain *why* Onyx cannot reach a bowl or toy; never trigger successful eating/feeding through geometry. |
| **Phaser animation system** | Frame sequences from sprite atlases may have per-frame durations, repeat or yoyo, and independently chosen playback speeds. | Preserve weighted idle key poses and distinct action clips. Avoid uniform 5-frame exposure for every emotional action. |
| **Godot AnimatedSprite2D** | A sprite sheet or sequence of images is treated as frames with named animations and explicit play/stop transitions. | Keep action IDs and authored frame rows stable across Onyx modules; changing pace should not teleport paw-contact phase. |
| **Disney Animation Research Library / Walt Disney Family Museum** | Archival cats and dogs are studied with concept drawings, model sheets and movement research; examples include *The Aristocats* and *Oliver & Company*. | Emphasize silhouette readability, anticipation, weight shift, held contact, and visible recovery. Research should guide original Onyx movement, not reproduce character designs or film frames. |
| **Mastodon** | Distinct timelines, notifications and posting visibility levels, with filtering by context. | OurSpace's feed/media, profile, private messages, and notifications must remain separate. Social media publishing must be deliberate, not inferred from a chat attachment or game event. |
| **MDN ARIA status / live regions** | A `role=status` region announces nonurgent changes without moving keyboard focus; urgent load errors warrant `role=alert`. | Announce temporary saves as a status; announce failed game-data loading as an alert without clearing the entire page. |

### Sources checked

- https://www.nekoatsume.com/sp2/index_en.html — official product/FAQ
- https://help.habbo.com/hc/en-us/articles/360011619799-All-about-the-Habbo-Shop — official furniture and decorating
- https://forums.ea.com/discussions/the-sims-freeplay-en/faq-gameplay/10975865 — placement/orientation path blockage
- https://docs.phaser.io/phaser/concepts/animations — per-frame animation timing
- https://docs.godotengine.org/en/stable/tutorials/2d/2d_sprite_animation.html — separate images and sheets
- https://www.waltdisney.org/cats-and-dogs — animal archival illustration and movement
- https://www.waltdisney.org/blog/seeds-legacy-walt-disney-and-aristocats — historical *Aristocats* development
- https://d23.com/a-to-z/oliver-company-film/ — original film reference
- https://docs.joinmastodon.org/user/network/ — notifications and timelines
- https://docs.joinmastodon.org/user/posting/ — visibility separation
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role — status semantics
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion — motion preference

## Concrete frontend repairs completed in this pass

1. **Feed Him MEOW load resilience:** `core-app.js` uses an in-memory fallback for blocked `localStorage`. Temporary state remains usable in the current tab but is explicitly announced as **not persistent**. Existing persistent saves remain the default when storage is available; no backend protocol change.
2. **Safer error recovery:** Failed game data loads no longer replace `document.body.innerHTML`. A scoped, accessible alert and a retry button preserve OurSpace's host page and other modules. Errors are logged without writing raw exception strings as HTML.
3. **Motion preferences:** On first run, Feed Him MEOW checks `prefers-reduced-motion`; previously saved choices take priority.
4. **Frame correctness:** `onyx-animation-controller.js` maintains a normalized gait phase across walk/run speed changes, and holds frames on stopped/paused/reduced-motion states. All six authored directions remain untouched.

### Deliberately unchanged

- Root `ourspace.html`, profile pages, the embedded game iframe ownership, all art/atlases and frame SVGs, `service-worker.js`, `manifest.webmanifest`, existing social publishing permissions, and the tested Apps Script backend.
- No additional Disney, Neko Atsume, Habbo, Sims, PixelPet, CatnDog, or fox assets were copied into the deployment.
- This pass does not claim the live end-to-end browser/gameplay test is complete; the test suite covers the isolated behavior and syntax.

## Follow-on integration priorities

1. Bind actual movement output and renderer timing together in the Happy Home iframe using the existing **single Onyx actor**; do not instantiate duplicates.
2. On furniture move/swap, rebuild obstacle geometry and invalidate goals or interaction reach with a user-facing reason.
3. Exercise Feed Him MEOW's 50-level game flow, pause/resume, checkpoints and audio in real browsers and mobile touch.
4. Verify message, public feed, visual/audio share, and notification channels end-to-end with deliberate consent; never publish direct messages.
5. Maintain one top-level HTML entry and avoid relocating existing public files until all references have migrated, rather than breaking URLs to satisfy a directory-only reorganization.

Run `node docs/PASS36_FRONTEND_REGRESSION_TEST.js` from the `OurSpace` root for local regression checks.
