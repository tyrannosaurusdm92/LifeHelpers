## 2026-10-15 · Feed Him MEOW fullscreen replacement

- Added the generated board and cook/assemble/serve runtime as `assets/code/meow.html`, loaded fullscreen through the shared Onyx Leisure launcher used by William and Jasper.
- Kept the Leisure widget tab as chat, removed the duplicated hidden game markup, and retained the game document as a nested fullscreen source rather than a top-level navigation entry.
- Replaced leisure game assets with the generated package, mapped image/audio folders to OurSpace naming, and retained the Bon Appétit result recordings.
- Added current board-generation, recipe, asset, and integration manifests.

# Changelog — Happy Home room, Work fullscreen, and sound vote pass 8

## Room and inventory
- Added spatial A/C, fan, couch, and aquarium anchors; quadruped scaling, walking routes, and jump landings use the existing GeoJSON coordinate system.
- Added 450 px Professor couch sizing, 64 px A/C lounge sizing, and 130 px quadruped couch sizing.
- Added persistent, equally random aquarium catches every 30 real minutes while Onyx is Hungry, using the 12:1 Onyx clock.
- Added room climate controls, double-bowl pouring, food-fill overlays, and fountain ripples.

## Work and sounds
- Applied the complete design palette to the Work fullscreen iframe, including catalog drawers, forms, messages, interactions, focus, and scrollbars.
- Made Projects & Catalog’s close control visible and keyboard-safe.
- Added the supplied food sounds and six cat sound previews with a local voting screen.
- Added `docs/HAPPY_HOME_ROOM_PERCEPTION_PASS8.md`.

# Changelog — Work fullscreen and Design sync pass 7

## Unified Onyx package
- Embedded the full Work workspace in the existing fullscreen shell and kept its CSS, JavaScript, JSON, mood art, and assets at their relative paths; `onyx.html` remains the only HTML file.
- Added a Work fullscreen launcher and the large red X in the top-right corner.
- Linked Work colors to the module Design palette so grayscale/color choices reach Work fullscreen as well as the other module tabs.
- Renamed the Health tab and its fullscreen shell to **Virtual Health**.
- Kept the Leisure button and fullscreen name **Feed Him MEOW** and replaced its fullscreen body with a blank black screen; the red X remains.
- Added `docs/ONYX_WORK_FULLSCREEN_INTEGRATION_PASS7.md`.

# Changelog — Frame-by-frame research pass 6

## Runtime timing correction
- Connected the complete five-drawing idle sequence to the Health shell for all nine quadruped moods and the neutral base cat; the weighted profile timing can now show every supplied idle phase while Onyx is still.
- Locked quadruped walk/run phases and Professor walking phases to measured screen travel, using each profile's cycle duration; stopped actors hold their gait frame, and elapsed-time timing remains the fallback.
- Added `docs/ONYX_FRAME_BY_FRAME_ANIMATION_RESEARCH_PASS6.md` with the fix, research application, profile coverage, and the six-view/eight-sector art limit.
- Preserved the existing atlas drawings, paired per-mood JS/CSS files, reduced-motion behavior, Professor transition clips, and separate chest-up widget.

# Changelog — Frame-by-frame research pass 5

## Animation coverage
- Added one JavaScript/CSS profile pair for each of the nine quadruped moods, the advising Professor biped, and the neutral base cat; created the missing thoughtful quadruped pair.
- Routed the matching mood-specific atlas into the Happy Home quadruped renderer instead of reusing the neutral meow sheet for every mood.
- Added elapsed-time weighted frame exposures so idle actions animate while still, with per-mood cadence for idle, walk, and run and a stable reduced-motion frame.
- Applied uneven frame holds to the Professor entry/exit, walk, seat settle, seated listening/notes, and stand-preparation clips.
- Added eight-sector movement direction selection. Straight front/back movement maps to the nearest of the six existing authored views and keeps its side stable.
- Added `docs/ONYX_FRAME_BY_FRAME_ANIMATION_RESEARCH_PASS5.md` and `json/onyx-animation-research.json` with the source notes, atlas audit, behavior coverage, timing profiles, and visual-view limit. The user's supplied Onyx artwork is preserved; film frames are not copied.

# Changelog — Testing pass 4

## Happy Home Onyx animation and chat choreography
- Starts each Health user turn with caring in the chest-up widget and full-body quadruped.
- Uses a thoughtful quadruped Professor cue, posture-specific walk cycles, atlas rise, directional turn, seated settle/listen/notes, and reverse-rise exit.
- Replaces the old 90-second Professor test timeout with ten minutes since the latest user or Happy Home interaction; assistant replies do not extend it.
- Adds the Happy Home Good boy button. It becomes available only after Onyx walks away, returns to caring, and waits; clicking it starts purring and restores quadruped mood autonomy without Professor.
- Keeps the module actor and Happy Home full-body actors separate. Feed Him MEOW is not changed.

# Changelog — Pass 10

## Frontend privacy and retrieval
- Removed dormant profile/private knowledge bundles from the deployable client.
- Replaced static profile retrieval with shared-safe metadata plus authenticated backend retrieval.
- Removed client hard-coded profile-interest guidance.
- Narrowed Drive retrieval to attached, explicitly selected, or clearly personal/bound file context.

## Attachments and tools
- Attachments are now scoped to the message that sends them.
- Successful turns consume sent attachments; cancellation or failure leaves them available for retry.
- File parsing supports all 12 UI attachments with a three-file concurrency limit.
- Up to two explicit URLs can be fetched concurrently.

## Runtime and packaging
- Consolidated JavaScript to the requested 20 files.
- Consolidated JSON to five shared-safe files.
- Consolidated documentation below ten files.
- Converted raw sprite/mood atlas sources into a compressed lazy runtime store with static-image fallback.
- Preserved the tested external backend endpoint; no backend source is included.

## 2026-09-21 — Avatar-placeholder / 190px size-state export
- Preserved all ten PNG mood images as operational fallback artwork.
- Replaced the dedicated coded atlas payload (`js/onyx/onyx-core/onyx-atlas.js`) with a blank placeholder while preserving its filename/dependency path.
- Added `docs/ONYX_AVATAR_SPRITE_DESCRIPTION.txt` with a detailed reconstruction specification.
- Defined the 190 × 190 movable bubble as the `hyper-reduced` size state.
- Retired the old tiny alert-only meaning of hyper-reduced for this export.
- Defined the largest `mega-larger` presentation as fullscreen viewport mode.
- Strengthened fallback state switching so mood changes continue to select the matching PNG when the coded atlas is absent.

## 2026-09-21 — left-load / movable bubble / centered fullscreen pass
- Restored the 190px Onyx bubble as the authoritative movable footprint and added the missing `--onyx-bubble-size` alias used by the module shell.
- Onyx now loads on the left side of the viewport and the normal module opens to his right when space permits.
- Normal desktop popouts are vertically centered against the bubble and re-clamped while Onyx is dragged.
- Reworked bubble input so ordinary click/tap/keyboard activation opens and closes the module, while pointer movement is reserved for dragging; post-drag clicks are suppressed to prevent accidental toggles.
- Bubble dragging now adds explicit dragging state, remains inside the viewport, persists its position, and continuously repositions the open module.
- Updated the saved-position key so this pass starts from the new left-side default instead of inheriting an older right-side position.
- Fullscreen now keeps the existing 190px Onyx bubble visible at the top center, keeps the five module tabs visible beneath him, centers the existing module panel below the bubble, hides fullscreen buttons while already fullscreen, and uses the red X as the fullscreen exit.
- Mobile popout placement was re-clamped so the panel stays on-screen when the bubble is on the left.
## Discord-layout merge pass
- Merged the draggable/fullscreen interaction fixes with the alternate Onyx shell fallback.
- Kept the authoritative 190 × 190 hyper-reduced bubble.
- Normal expanded mode keeps Onyx on the left and centers the module vertically to his right.
- Fullscreen keeps the bubble centered at the top and the five-tab module underneath, using the remaining viewport height.
- Fullscreen hides every Fullscreen button and uses only the large red X to exit.
- Added Discord-inspired nested overflow behavior: history and messages scroll independently while headers/composer stay fixed.
- Chat auto-follow now occurs only when already near the bottom, preventing new replies from yanking the user away from older messages.
- Added an interaction fallback so the bubble still opens and moves if the primary core runtime fails to initialize.


## 2026-09-21 — Design-style four-chat-tab usability pass
- Rebuilt Virtual Pet, Health, Leisure, and Work around the same padded page/section layout language used by the Design tab.
- Made the conversation the dominant workspace instead of permanently splitting the tab into a narrow history column and chat column.
- Moved local chat history into a Design-style collapsible section, while retaining search, retention mode, clearing, saving, pinning, and thread switching.
- Moved Virtual Pet care/self-care/quiet-company controls into a collapsible Design-style section so they remain available without crowding conversation space.
- Reframed Health scope, support preferences, and conversation modes as Design-style sections that can be opened when needed.
- Increased the normal expanded panel height to up to 760px / 88vh while retaining existing responsive width rules.
- Enlarged the response viewport and composer, added a visible Prompts label, kept suggested prompts horizontally accessible, and made primary tools readable with text labels.
- Enlarged generated-image/file artifact presentation inside replies so multimodal outputs can be inspected without opening a tiny thumbnail.
- Preserved all Onyx-specific backend, chat, memory, retrieval, image-generation, attachment, virtual-pet, alert, fullscreen, and fallback-avatar hooks.


## Server / Channel + Bottom Drag pass
- Virtual Pet, Health, Leisure, and Work are now presented as independent Onyx servers.
- Existing local conversation threads are surfaced as switchable channels, with new/rename/delete/save/pin controls.
- Design remains a normal design page rather than a server.
- Added independent Discord-inspired channel/message scrolling while retaining grayscale styling and Onyx-specific backend/chat behavior.
- Added bottom-edge drag resizing to the opened widget, server workspaces, message viewports, Design workspace, and all textareas.
- Preserved the 190×190 bubble size and existing movable bubble behavior.

## 2026-09-21 — Five-tab design protection + updated alerts

- Extended Design-tab role programming across Virtual Pet, Health, Leisure, Work, and Design, including chat/channel surfaces, inputs, controls, scrolling, selected states, and readability roles.
- Derived the implementation from the scoped OurSpace widget-design pattern used by the record player and bulletin boards rather than a whole-module filter.
- Added a separate designable outer Onyx border role while hard-protecting the complete bubble interior, avatar imagery, alerts, reactions, emoji, and protected interface glyphs.
- Merged the updated `Onyx_Alerts_Only` runtime and account-settings alert controls into the existing `onyx-alerts.js` so the package remains at 20 JavaScript files.
- Updated alert routing, first-load count synchronization, notification-kind normalization, sound de-duplication, and frontend push-action allow-listing.
- Kept the 190×190 bubble, five-tab server/channel behavior, bottom-drag resizing, PNG avatar fallbacks, and blank coded-avatar atlas placeholder intact.
## 2026-10-04 — Professor contact-sheet biped + HUD chat sync
- Full-body Professor now renders from the supplied contact sheet and semantic transition clips.
- Chat drives quadruped → biped → seated pose changes → stand/return-to-quadruped.
- Removed old rendered Hungry/Judgmental/Purring Kitchen bipeds; retained their untouched Feed Him MEOW placeholder slots.
- Removed duplicate fullscreen CHAT buttons; baked HUD chat controls continue to route to the correct module tab.


- 2026-10-04 later pass: Professor enter/exit now use the dedicated spin transformation clips with stronger canvas spin-blur styling in both directions.


## 2026-10-06 — Testing pass 3 brain-link hardening
- Kept the nine brain/runtime sections in one `brain-link.js` bundle (121,386 bytes; one part).
- Added runtime diagnostics for backend endpoint agreement, `onyx.chat` route support, route readiness, and authentication state.
- Updated package metadata and documented the boundary between the verified frontend contract and the unverified live Apps Script brain retrieval.
