# License Notes

This cleanup package does not preserve removed legacy/source payload contents. It keeps only a catalog of removed files in `docs/MANIFEST.json`.

Active files remain under their original project/source licensing obligations. Because several upstream sources in the original package did not include complete machine-readable license text, this file is a license inventory placeholder rather than legal advice.

## Active bundled areas to review before redistribution

- `modules/games/` — bundled game HTML files and embedded assets.
- `assets/legacy-ourspace-*` files that remain because the active game HTML directly references them.
- `assets/game-bots/` — moved active bot support files.
- `assets/game-reward-rules.json` — active game reward rules used by the reward bridge.
- `assets/icons/` and `assets/audio/message-ding.mp3` — app icons and message sound.

## Removed sources

Removed files are listed by path, size, and SHA-256 hash in `docs/MANIFEST.json`; their contents are not included in this lightweight app package.
