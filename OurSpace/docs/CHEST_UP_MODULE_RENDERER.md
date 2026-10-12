# Chest-up Onyx module renderer

The widget/module bubble uses the portal-era procedural chest-up Onyx renderer as its primary avatar system for all ten canonical moods.

- Primary render target: `#onyxCanvas` inside `.onyx-round-widget`.
- Static `https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_<mood>.png` files remain failure fallbacks only.
- The fast Leisure game does **not** use this renderer.
- The Virtual+Health fullscreen environment does **not** use this renderer for its game actor.
- Game actors remain on their separate biped/game renderer paths until the later quadruped game implementation is supplied.
- Per-mood `js/onyx/onyx-core/onyx_<mood>.js` and `css/onyx/onyx-core/onyx_<mood>.css` compatibility files resolve to the portal-era chest-up module system.
