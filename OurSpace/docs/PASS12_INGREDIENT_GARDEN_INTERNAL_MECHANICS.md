# Pass 12 — Ingredient Garden internal mechanics

**Visual lock:** this pass does not alter Page 1 or Page 5 markup, layout, CSS, imagery, sizing, colors, or control surfaces. Changes are internal gameplay logic only.

## Donor mechanics studied

- Candy-Crush-style donors: separate board/rules state, legal-swap validation, complete horizontal/vertical match grouping, gravity/refill, cascade completion, and move-search/dead-board recovery.
- Connect-the-dots-style donors: drag-path continuity and timer/state separation.

The mechanics below are reimplemented for Ingredient Garden and retain its existing Feed Him MEOW visuals and ingredient identity.

## Pass 12 changes

- Chain and concrete blockers now participate in legal movement rules instead of behaving as decoration only.
- Concrete-covered cells do not count as ingredient matches until the concrete is broken.
- Chained/concrete cells are fixed gravity separators: ingredients above and below them collapse within their own column segments instead of falling through the blocker.
- Specials damage blockers once per cascade contact; a concrete-covered ingredient is not collected through intact concrete.
- Trace mode cannot route through chained/concrete cells.
- Hint and Assist use the same blocker-aware legality rules as player input.
- Trace hints can deliberately prefer closable loops when a loop is stronger than a simple chain.
- Dead-board shuffles preserve fixed blocker positions and only shuffle movable ingredients.
- Infection blockers can spread one orthogonal tile after a resolved action, but a proposed spread is rejected if it would make the board unplayable.
- Infection spreading avoids unfinished objective ingredients where another reasonable candidate exists.
- Existing loop collection, objective-aware refill, special combinations, cascades, fish suppression, and fishing-pressure punishment remain active.
