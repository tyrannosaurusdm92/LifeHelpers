# OurSpace Onyx: Leisure fullscreen, blank Virtual & Health, and repository brain

## Scope

These changes apply only to `LifeHelpers/OurSpace/`. The sibling `LifeHelpers/Games/` and `LifeHelpers/Onyx/` trees were not modified or moved.

## Current navigation

- The standalone **Games** page was removed from both William's and Jasper's inner-profile navigation.
- Onyx's **Leisure** tab now has **Open Games fullscreen**, which displays the existing sibling `Games/index.html` in an iframe that fills the viewport. The top-right red X returns to Leisure.
- Onyx's **Virtual & Health** tab still has its fullscreen control, but this view renders only the empty background and red top-right X. It no longer embeds Happy Home, a room, a pet actor, artwork, tools, assignments, or other overlays. Closing returns to Virtual & Health.
- Onyx's **Work** fullscreen and his regular popup, chat, design tools and profile restrictions remain available.

## Removed

The old **Feed Him MEOW** and **Happy Home** applications were removed from `OurSpace`: their embedded HTML templates and duplicate frontend code, dedicated game CSS and JavaScript folders, room/game JSON data, board and recipe data, game-specific WASM, textures, pictures, audio, video, and game-only reports. Existing shared Onyx avatar art, moods, widget voice clips, and non-game features are retained; those are not exclusive assets of either deleted game.

## Onyx brain integration

`js/onyx/onyx-core/onyx-repository-bridge.js` imports the existing unified `Onyx/script/js/onyx/onyx-core/index.js` module. On a live Onyx conversation, it:

1. Runs the existing Onyx domain/intent capability router.
2. Selects up to three relevant snippets totaling at most 12,000 characters from the existing indexed public `Onyx/js/` corpus.
3. Adds those snippets as references to the original `OnyxBrainLink.chat` request.
4. Leaves the original `onyx.chat` authenticated OurSpace backend, account profile, privacy filtering, and conversation UI in place.

Retrieval is best-effort: if the public corpus cannot be loaded, Onyx chat continues through the current backend without inventing source data or copying profile-private material into the frontend. No backend deployment was created, modified, or replaced.

## Validation notes

The committed Git trees were inspected to confirm the removal of the old games' implementation folders and data, and the continued existence of `Games/index.html`, the unified `Onyx/` runtime, both profiles, and the new bridge. Live browser and authenticated backend response behavior were not independently exercised in this pass. If previously cached assets appear, reload the profiles after GitHub Pages publishes the new commit.
