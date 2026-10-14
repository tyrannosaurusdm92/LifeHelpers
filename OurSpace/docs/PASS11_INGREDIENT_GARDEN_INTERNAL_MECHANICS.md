# Pass 11 — Ingredient Garden Internal Mechanics

This pass deliberately changes **no visual design on Page 1 or Page 5**. Their HTML sections and governing CSS remain byte-identical to the incoming package.

## Internal changes
- Trace/Connect mode now supports a closed matching loop: connect 4+ unique matching cells and return to the first cell to close the loop.
- A closed loop clears every currently visible token of that ingredient type. It uses the existing Garden board, status, audio, score, and refill systems; no new visual surface was added.
- Closed loops receive a small run-safe move/time and score reward.
- Immediate backtracking still works; a token still cannot otherwise be reused in one trace.
- Minimum valid ordinary trace remains 3; invalid/short traces still do not consume a move.
- Existing objective-aware refill, fish suppression, cascades, special combinations, free dead-board reshuffle, and +5% weak-Fishing pressure punishment remain intact.

## Donor-informed mechanics
The implementation is original project code, informed by the supplied/requested donor set. In particular, connect-the-dots mechanics suggested rewarding a successfully enclosed matching loop, while Candy-Crush-style donors reinforced separation of board state, legal-move validation, cascade resolution, and shuffle safety. No donor visual design was imported.

## Visual-lock QA
Incoming and outgoing checks use SHA-256 hashes for Page 1, Page 5, `css/feed_him_meow.css`, `css/games/leisure/kitchen_game.css`, and `css/games/leisure/kitchen_runtime.css`.
