# Licenses, source notes, and attribution audit

Generated: 2026-06-21T08:56:57Z

## Source material

- Source archive: `html games.zip`
- Source manifest: `offline_html_games_manifest (2).json`
- Included source folder from archive: `html games/offline/`
- Package rule: only games marked `recommendation: keep` in `recommendedKeepSet` were copied into `games/`.

## License audit

The uploaded source archive contained `html games/README.md`, copied here as `original_archive_README.md`. I did not find a dedicated LICENSE/LICENSE.md file in the uploaded ZIP. The individual games are preserved as single-file HTML games and may contain embedded third-party code/assets from their original sources.

## Excluded code

Non-kept game files and non-offline helper/inliner files from the source archive were not copied into the runnable package. Their names and removal reasons are logged in `non_kept_games_audit.json` and `package_build_audit.json`.

## Launcher code

`mobile_games.html` is newly generated for this package. It contains the dropdown launcher, playable preview iframe, browser-save controls, exit-save handling, fullscreen controls, mobile orientation lock attempt, and package metadata display.
