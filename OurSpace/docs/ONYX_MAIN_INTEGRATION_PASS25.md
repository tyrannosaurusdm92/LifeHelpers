# OurSpace — Onyx direct-file movement integration (Pass 25)

**Target:** the existing \`tyrannosaurusdm92/LifeHelpers\` \`main\` branch, directory \`OurSpace/\`.

This change adds **actual individual files**, not a ZIP. It is additive and leaves the
existing live \`OurSpace/ourspace.html\`, service worker, manifest, personal profile
HTML, DBT content, shared JavaScript, art assets, and Apps Script backend untouched.

## Entrypoint

The existing root \`ourspace.html\` references \`js/ourspace-onyx-hooks.js\`.
That loader imports the independently editable modules under
\`js/onyx/games/virtual/\`.

- \`onyx-base-runtime.js\`: eight-way movement, collisions, run/walk timing,
  jump trajectories and landing, script navigation, behavior state, actions
  and target-aware interactions.
- 18 separate \`onyx-base-*.js\` action modules: eight compass directions,
  three jump types, and seven behaviors.
- \`onyx-base-happy-home-bridge.js\`: opt-in integration with the existing
  \`OnyxImperialExpedition\` native sprite renderer and the
  \`OnyxRoomSpatial\` / \`HappyHomeOnyxSpatial\` room geometry.
- \`css/onyx/games/virtual/onyx-base-motion.css\`: reduced-motion support.

The movement runtime is available as \`window.OnyxBaseMotion\`, direction/action
modules as \`window.OnyxBaseActions\`, and the native adapter as
\`window.OnyxHappyHomeMotion\`. The adapter only starts its rendering loop
when the original Happy Home Onyx actor is present. It does not create a
second cat, swap sprites, or replace user/profile state.

## Native integration

The live \`main\` page currently contains a dormant
\`#ourspaceOnyxReintegrationHook\` and the marker
\`data-onyx-runtime="removed"\`. This change does **not** override that flag
or assert that Happy Home's native room renderer is active. Native room
scripts must actually initialize \`OnyxImperialExpedition\` for visual movement
to appear. The standalone physics can be exercised without that renderer.

## Assets

The 11 original Onyx mood/professor atlas PNG files already exist on GitHub,
and are **not overwritten**. The original base drawings contain six authored
facings; the engine moves in eight sectors and uses existing appearance
mapping where straight N/S drawings are unavailable.

The 12 scaled feeding/drinking SVGs are preserved in the provided
Pass 15 / Pass 24 archives, but **this direct-file GitHub update does not
upload those large SVGs**. Any part of the site requiring them needs
those files at \`assets/images/games/virtual/atlases/\`. Other media
continue to use their existing GitHub assets.

## Verification

Run: \`node docs/ONYX_PASS25_REGRESSION_TEST.js\`

The behavior tests do not exercise the real backend or verify the complete
Happy Home visual experience in a browser. The backend endpoint and code
are unchanged.
