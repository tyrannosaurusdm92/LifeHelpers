# LifeHelpers Arcade Revision Audit

## Requested revision

The arcade was revised to support two in-project game folders, `desktop/` and `both/`; existing bundled games were moved into `both/`; and project documentation was consolidated into `docs/`.

## Changes completed

1. Created `both/` and `desktop/` at the project root.
2. Moved all nine existing arcade game launch entries from the former `games/` folder into `both/`, preserving multi-file game folder structure and relative assets.
3. Removed the now-empty `games/` directory so there is one unambiguous folder scheme.
4. Preserved and used the supplied manifests: 82 cross-device standalone games and 47 desktop standalone games.
5. Added `js/game-catalog.js` with 138 total launch entries: 91 `both` + 47 `desktop`.
6. Replaced the previous one-game hardcoded card list with dynamic catalog rendering.
7. Added search and compatibility filters for All, Desktop + Mobile, and Desktop.
8. Added an accessible in-page iframe player with Close and Open separately controls; Escape closes the player.
9. Added a touch-device note for desktop-only games rather than hiding them, so both catalogs remain accessible from every device.
10. Updated the PWA `manifest.json` name, portable start/scope paths, and Rainbow Bottles shortcut path from `games/` to `both/`.
11. Created `docs/` and placed the project README, source license, revision audit, project manifest, and both supplied game-manifest READMEs there.
12. Removed outdated duplicate root README files to prevent instructions from pointing back to `games/`.

## Preservation checks

- Original CSS was retained and extended rather than replaced wholesale.
- Existing images, favicons, `.gitattributes`, and `.gitignore` were retained.
- No existing game source files were rewritten during the move.
- `3d-rainbow-bottles.html` remains one directory below the project root, so its existing `../images`, `../favicon`, and `../index.html` references remain valid.
- Multi-file bundled games were moved as whole directories, preserving their adjacent scripts/styles/assets.

## Folder population status

At this revision point, the 9 games originally shipped with the loader are physically present in `both/`. The 82 additional `both/` standalone files and 47 `desktop/` standalone files are cataloged but intentionally not fabricated; the user will fill those folders with the corresponding files from the supplied manifests.

## Validation targets

- Catalog entries: 138 total.
- `both` entries: 91.
- `desktop` entries: 47.
- Bundled/moved entries: 9.
- Supplied standalone manifest entries: 129.
