# LifeHelpers GameBots

LifeHelpers GameBots is a browser-side bot framework for the LifeHelpers Arcade multiplayer set. It contains **26 bot modules**: **16 game-specific bots** matched to the confirmed multiplayer games and **10 reusable universal bots** that can be attached to other games later.

## Design goals

- No HTML lives inside `GameBots/`.
- All GameBots code, config, backend code, and GameBots documentation stay inside `GameBots/`.
- Local bots handle fast movement, jumping, aiming, firing, hazard avoidance, and turn execution.
- `LifeHelpers.gs` may ask AI-Brain for higher-level gameplay strategy only. It does not expose creation, writing, image generation, code generation, or general chat routes.
- A game keeps working when the strategy backend is unavailable. The bot continues locally.
- The framework can work with an unmodified same-origin iframe through keyboard/pointer injection and lightweight canvas-motion sampling.
- For much stronger play, a game can expose an optional `LifeHelpersBotBridge` object with structured state.

## Exact bot count

The player-count rule is encoded exactly as requested:

- Every **2-player** title receives **1 game-specific bot**.
- Every **2–4-player** title receives **2 game-specific bots**.
- House of Hazards, Tag, and Tube Jumpers therefore each receive two bot modules.
- Total game-specific modules: **16**.
- Reusable universal modules: **10**.
- Grand total: **26**.

## Supported game-specific set

| Game | Players | Specific bots |
|---|---:|---:|
| 8 Ball Classic | 2 | 1 |
| Bad Ice-Cream | 2 | 1 |
| Bad Ice-Cream 2 | 2 | 1 |
| Bad Ice-Cream 3 | 2 | 1 |
| House of Hazards | 2–4 | 2 |
| Rooftop Snipers 2 | 2 | 1 |
| Stick Archers Battle | 2 | 1 |
| Tag | 2–4 | 2 |
| Tube Jumpers | 2–4 | 2 |
| Stick Fighter | 2 | 1 |
| Poor Bunny | 2 | 1 |
| Temple of Boom | 2 | 1 |
| Chess | 2 | 1 |

## Universal bots

1. **Agile Navigator** — platforming, mazes, chase movement.
2. **Adaptive Duelist** — general fighting/arena movement and attacks.
3. **Projectile Sniper** — archery, artillery, aim-and-fire games.
4. **Co-op Partner** — follows objectives/partners and prioritizes assistance.
5. **Hazard Runner** — obstacle and hazard avoidance.
6. **Physics Pilot** — pool/trajectory/physics-style turns.
7. **Turn Planner** — structured legal-action board/turn games.
8. **Racing Line Bot** — steering, acceleration, obstacle reaction.
9. **Survivalist** — arena/one-button survival behavior.
10. **Tactical Commander** — utility-scored strategy/action selection.

## Arcade integration

`index.html` loads `GameBots/js/gamebots.js` before the normal arcade loader. When a supported multiplayer game finishes loading, the arcade attaches its matching bot profile to the iframe.

The viewer provides:

- **Bot 1** toggle
- **Bot 2** toggle when the title is one of the 2–4-player games
- **Bots Off**

Bots are never auto-started. The user chooses when a bot takes a seat.

## Optional game bridge

The framework can run without modifying a game, but structured state dramatically improves decisions. A same-origin game may expose:

```js
window.LifeHelpersBotBridge = {
  getState() {
    return {
      player: { x: 0.3, y: 0.7 },
      enemy: { x: 0.8, y: 0.7 },
      health: 1,
      danger: 0.2,
      objective: { x: 0.9, y: 0.4 }
    };
  }
};
```

Turn-based games can additionally expose `legalMoves`, `legalActions`, `performMove(move)`, or `performAction(action)`. Physics games can expose `legalShots`, `recommendedShot`, and per-shot fields such as `makeProbability`, `scratchRisk`, `positionValue`, `aim`, and `power`.

## Using a universal bot on another game

After GameBots is ready:

```js
LifeHelpersGameBots.useUniversal(
  "universal-hazard-runner",
  document.getElementById("gameFrame"),
  { title: "Another Platform Game", path: "Both/another.html" },
  {
    players: "2",
    maxBots: 1,
    controls: { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp" }
  }
);
```

## LifeHelpers.gs + AI-Brain

`backend/LifeHelpers.gs` is the GitHub-safe backend version. The browser-facing Apps Script deployment is configured in the arcade frontend/config; private AI-Brain library Script ID/version are not stored in the repository.

The deployed Apps Script project uses the AI-Brain library under the identifier `AIBrain`. `AI_BRAIN_ENDPOINT` remains an optional private server-side fallback only.

The browser backend URL is preconfigured in `js/main.js` and `config/backend.json`. `window.LIFEHELPERS_GAMEBOTS_BACKEND_URL` can still override it before initialization when needed.

## Offline behavior

If no LifeHelpers backend URL is configured, or the backend cannot be reached, bots continue using the local GameBots logic. This is intentional; high-frequency controls should not depend on Apps Script round trips.

## Controls and build compatibility

The supplied arcade ZIP contains placeholder `Both/` and `Desktop/` folders because the actual game HTML files already live on GitHub. The specific bot modules therefore use the common control layouts associated with these game families plus optional structured bridge state. If a particular offline HTML build remaps player controls internally, adjust that bot module or expose a `LifeHelpersBotBridge` from the game build.

## Source research

The bot architecture was informed by established open-source game-AI projects on GitHub, including Yuka, Behavior3JS, PathFinding.js, EasyStar.js, a JavaScript minimax/alpha-beta chess AI, and an open-source browser 8-ball implementation. No third-party repository was copied wholesale into GameBots. See `THIRD_PARTY_SOURCES.md` and `LICENSE.md`.
