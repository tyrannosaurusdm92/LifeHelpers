# Happy Home room and Work fullscreen pass 8

## Room perception and movement

- Added data-backed A/C, ceiling-fan, A/C lounge, couch-seat, aquarium landing, and floor-route anchors to `json/happy-home-onyx_interactions.geojson`.
- Quadruped Onyx starts at the A/C lounge spot at the 64 px far-plane scale, grows along the existing floor routes, and lands at 130 px on the couch spots. The existing couch pose choices remain loaf, lounge, and sleep.
- Professor Onyx uses the 450 px authored size at the existing Professor couch seat; size and foot alignment continue to follow the room viewport scale.
- Added room A/C and fan toggles. Onyx asks for both when he is near the A/C. The fan visual spins while enabled.
- Hungry Onyx can take the spatial aquarium route, jump onto its authored landing point, and perform a catch. A persistent catch schedule is spaced at six Onyx hours per catch; the 12:1 clock makes that one catch every 30 real minutes (two per real hour while Hungry). Each catch independently selects goldfish, neon tetra, or amber tetra with equal probability; repeats are allowed.

## Food, water, and sound

- Inventory food cards and the store's Use action open the pour flow for owned wet food, dry food, and treats.
- A bowl can be activated from the room. The pour flow checks the bowl's slot compatibility and consumes one package; wet food fills the wet compartment, while dry food and treats fill the dry compartment.
- The room renderer draws the saved food fill into the bowl's SVG slot geometry. Active fountains show animated ripples and can be toggled by clicking the placed fountain.
- Added the supplied food-pour and food-bag sounds.
- Added six supplied cat sound clips to the Boosters panel and a vote screen. The vote tally is local to the current browser and can be changed by voting again.

## Work fullscreen and controls

- The Work iframe receives the full grayscale design palette at load and on Work fullscreen entry; all Work surfaces, controls, messages, forms, links, focus rings, scrollbars, catalog drawer, and dialogs use the palette values.
- Projects & Catalog now has a visible “× Close” button, returns focus to its launcher, and becomes inert while closed.
- Happy Home action-pad X/Z move down 8 px and R/B move up 8 px. Their existing control meanings stay the same.

## Package structure

- Testing package: one HTML file (`onyx.html`) with relative folders, runtime code, and the supplied assets.
- GitHub package: static assets only under the existing `assets/` tree; it contains no HTML, JavaScript, CSS, JSON, or documentation.
