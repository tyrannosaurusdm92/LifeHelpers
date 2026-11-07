# OurSpace HUD / Messenger Drawer / Paw Token Repair

**Package:** OurSpace source package (Drive-synced background names)

**Included:** Original images, external URLs, overlays, PrismShift, Onyx's Adventures and Picnic Panic are preserved.

## Interaction
- Messenger is closed by default for each profile and can be opened with the persimmon heart on the middle right. A second click closes it. State persists per profile using browser localStorage.
- When closed, the rail is moved entirely off-screen and the layout gutter becomes zero. Chat dialogs and messenger windows are hidden while the drawer is closed to avoid obstructing the fullscreen Onyx game HUD.
- The shared wallet is shown in the drawer, backed by `window.OnyxCurrency` and its `data-onyx-currency-balance` readout. It updates when the user earns or spends currency.
- The Messenger scrollbar thumb is persimmon (#F47745) with a teal (#176B65) border.
- NAV uses white collapsed lettering, black expanded navigation labels.
- Picnic Panic paw level buttons use the original WebP sprites at full opacity, with no rectangular button or star-label borders. Level-select and modal geometry are retained.

## Palette
CSS color declarations in interface selectors were changed in their existing source files, not stacked in an additional override sheet. The approved steel blue, cyan, dark teal, persimmon orange, cadmium yellow and mint colors are retained. User-controlled swatches, image/canvas artwork and destructive actions are deliberately protected. The full declaration-change audit appears in `docs/PALETTE_REPAIR_REPORT.json`.

## Testing limitation
Full-site browser navigation was blocked by the container browser policy. An in-memory real-CSS/real-JS browser fixture passed toggle, currency, level-paw and NAV tests, and syntax checks were run across the files.
