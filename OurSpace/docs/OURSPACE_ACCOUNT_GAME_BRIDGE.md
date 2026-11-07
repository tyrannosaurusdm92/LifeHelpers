# OurSpace account/game bridge

- Auth authority: `window.OurSpaceAuth` on the signed-in William/Jasper page. `#admin` cannot transact.
- Game data: self-contained `assets/code/game.html` with the existing embedded asset archive, rebuilt with the account-wallet changes. Standalone game is a non-spendable guest.
- Wallet: `currency.balance`, `currency.earn`, `currency.spend` are routed through the authenticated parent. Currency conversion 10 copper/silver/gold, platinum unlimited. Game never receives a session token.
- Reward claims: the Arcade now calls `arcade.play.start`, `arcade.play.progress` and `arcade.reward.claim`. The updated backend serializes reward claims against the account ledger, preventing duplicate credits for the same game and UTC day. CAT-astrophic game events retain their legacy account-record and `currency.earn` bridge for compatibility.
- Picnic boosters: backend `catastrophic.game-state` records. Existing private/game state unrelated to paid boosters may still use local browser storage.
- Arcade: `Games/js/main.js` on GitHub emits play telemetry to the parent, which checks the exact frame, origin and signed-in account. The backend creates the account-owned play session and played-game history. A game can earn 25 copper (2 silver, 5 copper) after 300 seconds of server-validated elapsed time and client-reported active play, once per game per UTC day. Browser focus is not independently attestable by Apps Script; a modified client could falsify telemetry.
- Profile: Interests displays game-title icon and link to actual GitHub `Games/Both` or `Games/Desktop` path.
- Farm: original map tile collision, floor routes, Faye courtesy free lemonade, Sookie choice data and assigned-staff stool rotation retained.
- Frontend authentication remains configured for `https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec`. No backend .gs source is bundled or changed.

**Not a security audit or full deployed-browser test.**
