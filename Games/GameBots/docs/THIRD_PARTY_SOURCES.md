# Third-Party GitHub Research Sources

These sources were reviewed to choose strong, browser-appropriate game-AI patterns. GameBots is a tailored implementation rather than a vendor dump.

## Mugen87/yuka

Repository: https://github.com/Mugen87/yuka

Why it was useful: Yuka is explicitly a JavaScript game-AI library. Its documented capabilities include state-driven and goal-driven agents, steering, navigation/search, perception/memory, triggers, fuzzy logic, and JSON serialization. Those ideas informed the split between observation, local action selection, navigation/utility behavior, and higher-level strategy.

License finding: MIT.

## behavior3/behavior3js

Repository: https://github.com/behavior3/behavior3js

Why it was useful: Behavior3JS is a JavaScript behavior-tree implementation designed for intelligent agents and optimized to control many agents. Its documented blackboard, sequence/priority, decorator, action, and condition model informed the reusable-bot/archetype design and stateful bot sessions.

License finding: MIT.

## qiao/PathFinding.js

Repository: https://github.com/qiao/PathFinding.js

Why it was useful: It is a comprehensive grid pathfinding library whose package metadata lists A*, Dijkstra, jump-point, breadth-first, and depth-first approaches. GameBots includes a compact local A* helper for grid/maze adapters rather than vendoring this library.

License finding: package metadata declares MIT.

## prettymuchbryce/easystarjs

Repository: https://github.com/prettymuchbryce/easystarjs

Why it was useful: EasyStar is a small asynchronous A* API aimed at HTML5 games, with point avoidance and movement-cost features. That reinforced the decision to keep navigation lightweight and game-loop friendly.

License finding: MIT.

## zeyu2001/chess-ai

Repository: https://github.com/zeyu2001/chess-ai

Why it was useful: This browser chess AI documents minimax with alpha-beta pruning and piece-square evaluation concepts. GameBots includes a general minimax helper and a chess-specific move scorer that can consume legal moves exposed by a game bridge.

License finding: MIT.

## henshmi/Classic-Pool-Game and henshmi/Classic-8-Ball-Pool

Repositories:

- https://github.com/henshmi/Classic-Pool-Game
- https://github.com/henshmi/Classic-8-Ball-Pool

Why they were useful: the project documents a browser 8-ball game that can play against AI at multiple difficulty levels and discusses mouse aiming/shot power. It was used only as a gameplay/interaction reference. No code was copied into GameBots.

## Research-to-implementation mapping

- Agent goals, perception, steering, utility behavior: Yuka concepts.
- Stateful reusable decision structure: Behavior3JS concepts.
- Grid/path planning: PathFinding.js and EasyStar.js concepts.
- Board-game lookahead: chess-ai minimax/alpha-beta concepts.
- Pool aiming/difficulty: Classic Pool interaction concepts.
- Actual LifeHelpers code: custom GameBots implementation in this folder.
