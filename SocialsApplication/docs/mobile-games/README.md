# Mobile Games Offline Keep Set

Open `mobile_games.html` to use the offline game launcher.

## Folder layout

```
mobile_games.html
games/
  ...only kept offline single-file HTML games...
docs/
  included_games_manifest.json
  non_kept_games_audit.json
  package_build_audit.json
  source_manifest_snapshot.json
  licenses_and_attribution.md
  original_archive_README.md
```

## What was included

- Included games: 25
- Manifest zipped-size total: 188451.8 KB
- Source rule: included only games in `recommendedKeepSet`.
- Removed/non-kept games were logged in docs and their game files were not copied.

## Browser saving

The launcher saves the selected game, session history, timestamps, and the game-specific launcher notes in browser `localStorage`. The individual games remain unmodified; any internal progress/save data they store in browser storage should continue to persist under the same browser origin.

## Fullscreen and mobile rotation

Use **Fullscreen Preview** to fullscreen the iframe preview area. On mobile, the launcher also attempts to lock orientation to landscape while fullscreen is active. Browser support varies, so if a phone blocks orientation lock, rotate manually after entering fullscreen.
