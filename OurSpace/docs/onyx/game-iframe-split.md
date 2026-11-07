# CAT-astrophic Cuteness — separate game.html

**Widget entry:** `OurSpace/assets/code/onyx_widget.html`  
**Game entry:** `OurSpace/assets/code/game.html`

The floating Onyx Widget continues providing Virtual & Health, Leisure, Work, Professor, shared currency and backend interfaces. The fullscreen Virtual & Health game entry opens `game.html` through the real `#onyxHealthGameFrame` iframe inside widget `#slowPetGame`.

All gameplay markup (HUD, viewport, panels, controls) moved into `game.html`, along with its game styles and lazy game runtime loader. The widget does **not** load or execute the game's simulation scripts. The `#slowPetGame` element in the widget is now only a fullscreen iframe container with an exit button; the same ID inside the iframe is the genuine game root, because existing game CSS and scripts depend on it.

`script/onyx widget/onyx-widget-game-frame.js` is a scoped parent controller; `script/game/game-iframe-bridge.js` bridges active/paused state, cat care events, chat lines, auth events and shared wallet UI. On a same-origin deployment the game uses the parent widget's existing Onyx VirtualPet, Professor, backend and currency APIs. The game preserves local standalone behavior when opened directly. The game must be served from the same origin as the widget to share authenticated functionality: browser `file://` iframe isolation can vary, so using a local web server is recommended when testing.

To play, open `assets/code/onyx_widget.html`, select Virtual & Health, then open **CAT-astrophic Cuteness**. The close button returns to the widget without resetting the iframe; its animation clock and audio pause when hidden. `game.html` can also be visited directly for development.

This packaging task does not merge the separately supplied Faye dialogue/documentation archive, which contains no widget or playable game shell. The base is the most recent playable *Michigan Seasons & Blue Night Filter* package.

Automated checks: game HTML separation and asset paths; JavaScript/JSON parsing; original gameplay regression tests. Full Chromium navigation may be blocked by the environment; that is not evidence the rendered iframe was visually verified.
