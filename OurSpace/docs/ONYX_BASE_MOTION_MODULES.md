# Onyx base movement and behavior modules

18 independently named JavaScript behavior files plus `onyx-base-runtime.js`. No external dependencies or backend changes.

## Source and scope

`trapthecat.html` is a six-direction, five-frame, SVG cat on a hex grid. This package adapts the **idea** of discrete direction frames, repeating jump/run timing and shortest traversable routes; it does **not** copy its image art or assume that it has eight directions or realistic anatomical motions. The more expressive pose fallbacks call the existing OurSpace `OnyxImperialExpedition` public API.

## Load order

Load `onyx-base-runtime.js` and then the 18 `onyx-base-*.js` files. The modules can load before the runtime through `OnyxBaseMotionQueue`, but runtime-first is recommended. The OurSpace version injects these only in Virtual & Health iframe to avoid duplicate Onyx instances.

```js
const m = window.OnyxBaseMotion;
m.heading(-1,-1, {mode:'walk'});       // orient Onyx, NW octant
m.advance('north_east',.016,{pace:'run'}); // move one frame
m.walk('south',{durationMs:1200});     // requestAnimationFrame movement
m.run('west',{durationMs:900});
m.perform('stretch');                // native action fallback
m.perform('loaf',{hold:true});
m.perform('eat_drink');              // placeholder for chew/lap graphics
m.perform('play_hunt');              // placeholder with native paw action
const path=m.findPath({x:2,y:4},{x:15,y:2},{cols:18,rows:8,blocked:new Set(['5,4'])});
```

Walking and running are implemented in all eight directions. The renderer still has six original facings: south and north share appropriate neighboring three-quarter views, but their movement vectors are unique. For automatic scripted movement the position is constrained to screen bounds and, when available, the existing Happy Home floor geometry. `followGridPath` is an optional discrete path command.

`jump_up`, `jump_down`, `jump_across`, `stretch`, `loaf`, `lounge`, `curl_ball`, `eat_drink`, `sleep`, and `play_hunt` define timed behaviors and call the closest native animation. Dedicated eating/drinking, hunting fish, lounging, sleeping and jump-height sprite frames, physical floor/furniture collision, object affordance checks and inventory changes are **not invented**: integration hooks and honest placeholders are supplied. Fish collecting is still owned by Happy Home, not modified here.

### Built-in event hooks

`onyx-base-heading`, `onyx-base-step`, `onyx-base-action`, and `onyx-base-motion-stop`. No global key bindings are added; the existing keyboard and touch controls remain in charge.

## OurSpace integration

Onyx movement modules live in `js/games/virtual/` (requested path), while the original `js/onyx/games/virtual/` system remains untouched except for a small parent bridge in `env.js`. `shared-shells.js` adds the 19 script tags to the Virtual & Health `srcdoc` so they execute within the same frame as `OnyxImperialExpedition`. Existing communication/DBT/site code is preserved. The bridge samples walking direction and native jump variants during room movement and adds `window.OnyxVirtualHealthEnvironment.baseMove`, `.baseRun`, `.baseAction`, and `.baseMotion` accessors.
