# Validation — Five-Tab Design + Protected Bubble + Updated Alerts

Validation performed after the integration pass.

## Package integrity

- JavaScript files: **20** (maximum preserved)
- JSON files: **5**
- PNG avatar fallbacks: **10**, retained intact
- `js/onyx/onyx-core/onyx-atlas.js`: **0 bytes**, retained only as a compatibility placeholder; the code-first chest-up renderer is `js/onyx/onyx-core/onyx-mood-renderers.js`
- Local `src` / `href` references in `onyx.html`: **all resolved**
- JavaScript syntax (`node --check`): **pass for all 20 files**
- JSON parsing: **pass for all 5 files**
- `css/onyx/onyx-core/onyx-module.css` brace balance: **pass**

## Design-system integration

The Design tab now controls role-based palette variables across all five tabs and their contents: Virtual Pet, Health, Leisure, Work, and Design. It follows the same scoped-widget principle used by the OurSpace record-player and bulletin-board design integrations rather than applying a blanket visual filter.

Protected content is intentionally excluded from design mutation:

- the full transparent interior of the 190×190 Onyx bubble
- Onyx/avatar/fallback imagery
- alert/reaction box contents
- reactions and emoji
- interface glyphs/icons specifically marked as protected
- the fullscreen red exit button

Only a separate **outer Onyx border ring** is designable. The SVG/avatar/interior content remains unchanged.

## Alerts integration

The newer `Onyx_Alerts_Only` frontend runtime was merged into the existing `js/onyx/onyx-core/onyx-alerts.js` instead of adding another JavaScript file. Compatibility hooks for the existing Onyx alert API were retained.

Validated frontend behaviors include:

- current alert list retrieval
- first-load alert-count propagation to the bubble
- incoming-alert update events
- in-app reaction-box routing
- sound de-duplication between the new alert runtime and the bubble renderer
- Onyx notification kind normalization for care, self-care, pet, reply, writing, thinking, research, and important states
- Web Push subscribe/unsubscribe frontend actions in the existing backend-client allow-list
- account-settings alert controls merged into the existing alert file

The Onyx service-worker contribution is included as root `service-worker.js` for later merge into the authoritative OurSpace service worker. `onyx.html` does not register it as a competing scoped worker. Foreground/in-app alert behavior does not require a second worker; Web Push/background notifications should use the merged OurSpace worker.

## Canonical behavior validation

The runtime now exposes exactly ten visible behaviors: `advising_professor`, `caring`, `hungry`, `judgmental`, `listening`, `purring`, `sleepy`, `snuggly`, `thinking`, and `thoughtful`.

Legacy state requests are normalized before state arbitration or rendering. Care-action names remain actions and cannot become independent visual behaviors.
