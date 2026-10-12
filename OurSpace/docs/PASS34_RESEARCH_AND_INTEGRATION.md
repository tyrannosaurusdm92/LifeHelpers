# Pass 34 — Sprite, pet-game, home-design and social UX research

All work is based on the existing OurSpace files and uploaded animal references; no third-party art or copyrighted character frames were copied. The supplied Onyx animation research identifies a 30×22, 660-frame atlas, with six original authored viewing angles. Eight movement headings remain mapped to six art directions. The base-frame JSON and original scaled feeding assets are preserved.

## Research comparisons and concrete implementations

- Walt Disney Animation, hand-drawn animation: https://www.disneyanimation.com/process/hand-drawn-animation/ — strong poses, weight, anticipation, overlapping movement. Implementation: a weighted sprite-pose sampler holding informative key poses longer.
- Walt Disney Family Museum, cats/dogs and The Aristocats production: https://www.waltdisney.org/cats-and-dogs and https://www.waltdisney.org/blog/seeds-legacy-walt-disney-and-aristocats — observation of animal movement, model consistency. Implementation: maintain original Onyx-only drawings rather than tracing or substituting film characters.
- Aseprite frame-duration model: https://www.aseprite.org/docs/sprite/ and PixiJS timed animation: https://github.com/pixijs/pixijs-skills/blob/main/skills/pixijs-scene-sprite/references/animated-sprite.md — per-frame hold durations and looping versus one-shot playback. Implementation: onyx-base-flipbook.js, called from existing runtime idle sampling; non-looping timer supplied for future actions.
- Neko Atsume 2 official documentation: https://www.nekoatsume.com/sp2/index_en.html and Phaser 3 virtual pet example: https://github.com/geocine/phaser3-virtual-pet — readable food/toy interactions with persistent pet feedback. Implementation: retain existing feeding and toy rules; do not duplicate art or invent purchases.
- The Sims 4 official Build Mode controls: https://help.ea.com/en/articles/the-sims/the-sims-4/how-to-rotate-sims-4/ and Sky Shared Spaces: https://thatgamecompany.helpshift.com/hc/en/17-sky-children-of-the-light/faq/521-what-are-message-shrines-message-candles-message-boats-shared-spaces-and-shared-memories/ — explicit selection and item placement. Existing Happy Home furniture/editor/store code is preserved, not rewritten.
- MDN Pointer Events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events and W3C pointer cancellation: https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation — pointer ownership and cancel-before-commit. Implementation: Market Madness rejects a second finger and cancels unfinished traces on visibility loss, pointer cancellation and window blur; keyboard controls remain.
- Facebook audience selectors: https://www.facebook.com/help/124794780932930/ and Discord safety library: https://discord.com/safety-library — local audience selection and explicit privacy expectations. Implementation: Feed Him Meow leisure history is now keyed by active profile, preventing one profile's local chat from appearing in another's browser feed. The historical unscoped chat cache is left untouched for manual recovery, never auto-migrated.

## Files changed

- js/onyx/games/virtual/onyx-base-flipbook.js: new weighted animation helper, reduced motion, six-view facing.
- js/onyx/games/virtual/onyx-base-runtime.js: uses helper for idle timing, with legacy fallback.
- js/ourspace-onyx-hooks.js: loads helper before Pass23 runtime.
- js/onyx/games/leisure/phase-market_madness.js: primary-pointer chain locking and safe cancel.
- js/onyx/games/leisure/chat-sync.js: profile-local leisure chat storage and stale-profile message guard.
- docs/PASS34_REGRESSION.js: repeatable checks (node docs/PASS34_REGRESSION.js).

## Preservation and limitations

OurSpace entry HTML, William/Jasper pages, service-worker, manifest, DBT, all original SVG/PNG atlases, Happy Home furniture/currency/save format, WASM and Apps Script backend are untouched. No ZIP committed, no new root HTML and no copied film drawings. Browser-local separation is a UX/data-hygiene measure, not a claim of backend access-control verification. Full interactive browser QA remains outstanding.
