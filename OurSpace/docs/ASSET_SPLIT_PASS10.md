# Onyx asset split — Pass 10

This pass keeps the two deliverables intentionally separate:

## Testing package

`Onyx_export/` contains the runtime code, JSON, documentation, scripts, and exactly the Onyx source visuals needed for animation work:

- Onyx SVG frame sources for the base cat, nine canonical quadruped moods, and Professor transitions.
- Eleven Onyx sprite atlases.
- Fifteen Onyx contact sheets.
- `frame-black.svg`, the notification-border asset that stays testing-only.
- `onyx-alert-virtual-pet.svg`, the shared Onyx alert icon.

Testing does not duplicate store, inventory, room, leisure, static fallback, audio, or video assets.

## GitHub assets package

The GitHub deliverable contains only `Onyx_export/assets/`. It holds the store, inventory, room, leisure, audio, video, static fallback, and game-HUD payloads. The Onyx SVG frames, atlases, and contact sheets are copied below:

- `https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/legacy/frames`
- `https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/legacy/atlases`
- `https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/legacy/contact-sheets`

`frame-black.svg` is deliberately excluded from GitHub.

At deployment time, overlay the GitHub `assets/` tree with the testing `assets/` tree. This preserves the testing-only Onyx source locations while resolving the rest of the runtime asset references from the assets-only package.

The split was audited against the supplied Pass 8, Happy Home, and Feed Him MEOW packages. The merged Pass 9 runtime remains the behavioral baseline; newer merged fan messaging, consolidated result-manifest paths, and texture code/data are retained where they supersede older source variants.
