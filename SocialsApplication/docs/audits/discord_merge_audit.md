# Merge Audit

## End-code decision

The merged end code is a small, direct app rather than a deep monorepo. The uploaded repositories overlap conceptually but not technically: several are full Discord desktop/client-mod projects, one is a PHP Discord library, one is an official Discord interactions example, one is the official Embedded App SDK, one is a history tracker, one is a Discord-like messaging app, and one is mostly unrelated local AI tooling with Discord community links.

To avoid odd duplications, conflicting package managers, long Windows paths, and incompatible license mixing, the final runtime keeps one canonical implementation per concern:

| Concern | Canonical merged implementation | Source influence |
|---|---|---|
| HTTP backend | `app.js` + `src/store.js` | `discord-example-app-main`, `acrd.app-dev` |
| Slash command registration | `cmd.js` + `src/discord.js` | `discord-example-app-main` |
| Discord Activity/iframe bridge | optional loader in `public/app.js` + dependency in `package.json` | `embedded-app-sdk-main` |
| Message history import | `src/history.js` | `Discord-History-Tracker-master` |
| Browser messenger UI | `public/` | `acrd.app-dev`, Discord-style channel UX |
| PHP bot approach | docs only | `DiscordPHP-master` |
| Desktop/client mods | docs only | `BetterDiscord-development`, `BetterDiscordApp-master`, `OpenAsar-main`, `Vesktop-main` |
| Local AI runtime | docs only | `lemonade-main` |

## Repository decisions

- **discord-example-app-main**: merged as the interaction/command pattern. Only one command registrar is retained so command code is not duplicated across examples.
- **embedded-app-sdk-main**: merged as a dependency and optional browser Activity connector. The SDK source tree is not copied.
- **Discord-History-Tracker-master**: merged as a safe import normalizer for user-provided exports. Scraping/client capture code is not copied into the end app.
- **acrd.app-dev**: merged conceptually as a Discord-like channel messenger. The full React/Node app is not copied because it would duplicate the new lightweight backend and frontend.
- **DiscordPHP-master**: documented as an optional alternative backend. It is not copied into runtime because mixing PHP and Node would bloat the final package and duplicate Discord API responsibilities.
- **BetterDiscord-development / BetterDiscordApp-master / OpenAsar-main / Vesktop-main**: audited but not merged as runtime code because they modify or replace Discord clients and would add deep Electron/client-mod trees, long paths, and license complexity.
- **lemonade-main**: audited as uploaded input, but not merged as runtime Discord code because it is local AI tooling, not a Discord client/repository core.
