# Socials Application Mobile Games Integration

The offline mobile game keep-set is integrated into the main Socials Application under `app/games/` with a new in-site Games tab.

## Runtime behavior

- Games remain single-file HTML games and are loaded inside the Socials Application iframe preview.
- Browser launcher saves are stored in localStorage under `socials.games.v2`.
- The Socials Application server now tracks active site presence in memory through `/api/presence`.
- Multiplayer-capable games read from the current online roster. The launcher passes selected players into the iframe through URL parameters, iframe localStorage/sessionStorage, `postMessage`, and a `socials-players` custom event.

## Multiplayer bridge limitation

The original offline game files are preserved. Some games are local/same-device or franchise-themed multiplayer builds rather than true networked multiplayer. The Socials Application bridge supplies the live signed-in roster and selected player list, but a bundled game must expose compatible controls or read the bridge data to fully alter internal player slots.
