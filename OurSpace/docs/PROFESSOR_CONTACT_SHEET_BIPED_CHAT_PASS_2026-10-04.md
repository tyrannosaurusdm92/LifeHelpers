> Runtime update: the old spin clip and 90-second test window described in this pass were superseded by Testing pass 4. See [HAPPY_HOME_ANIMATION_FLOW_PASS4.md](HAPPY_HOME_ANIMATION_FLOW_PASS4.md) for the current 10-minute caring/Professor/couch/Good boy flow.

# Professor Contact-Sheet Biped / Chat Pass — 2026-10-04

- Replaced the rendered full-body Professor paper-doll appearance with `assets/images/games/virtual/atlases/onyx_professor_sprite_atlas.png` and its supplied semantic atlas JSON.
- Happy Home now starts the actor as the atlas quadruped, transitions into Professor biped when the Health chat opens, settles into the forward seated Professor poses, changes seated poses/blocks while conversation continues, prepares to stand, then plays the reverse transition back to quadruped when chat closes.
- Removed the rendered Hungry, Judgmental, and Purring Kitchen biped implementations. Feed Him MEOW's existing quadruped and Kitchen biped placeholder code in `js/onyx/games/leisure/game.js` and `css/onyx/games/leisure/game.css` was intentionally not modified.
- Module chest-up mood renderers, their CSS, and their PNG fallbacks were intentionally not modified.
- Removed the separate fullscreen CHAT buttons beside the red X. The existing chat button in each baked fullscreen HUD remains the owner of chat opening: Happy Home routes to the module `health` tab; Feed Him MEOW routes to the module `leisure` tab.
