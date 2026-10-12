# Happy Home animation and chat flow — Testing pass 4

## Scope

This pass changes only the testing package. The chest-up widget renderer stays in `js/onyx/onyx-core/`; the Happy Home full-body actor is the atlas renderer in `js/onyx/onyx-core/shared-prof.js`. Feed Him MEOW keeps its existing shell.

## Animation review

The Professor contact sheet is 30 columns by 22 rows (660 frames). All 660 frame rectangles are in bounds, all have visible pixels, and the rightmost column is 63 pixels wide. The unchanged quadruped source frames remain intact. Runtime playback uses posture-specific walk cycles, direction-specific frames, one-shot transformation clips, a short seat-settle clip, multiple forward-facing seated pose blocks, and the seat-preparation clip. The ground anchor remains at y=60/64.

A couch turn steps through directional standing frames. It does not reuse the quadruped-to-biped transformation as a turn. The existing standard, non-chaise couch seat and floor anchor remain the target.

## User sequence

1. A Health user message changes the chest-up widget to caring. In active Happy Home, full-body Onyx holds quadruped caring for 1.45 seconds, then shows a thoughtful quadruped Professor cue for 0.85 seconds.
2. Onyx plays the dedicated atlas rise, walks to the standard couch seat, turns toward the seat, settles into a seated Professor pose, and changes among seated listening/notes/lean poses while the conversation continues.
3. After ten minutes without a user message or Happy Home pointer, keyboard, or input activity, he prepares to stand, rises, walks away, plays the reverse rise, and returns to quadruped caring. Assistant replies do not reset this timer.
4. Happy Home enables **Good boy** only after he is back in caring. That click switches to purring, clears ordinary completed-chat state, and resumes the existing autonomous cat mood/action engine. Its available mood list excludes Professor.

If the user talks during the exit, the sequence resumes and the idle timer restarts from that user message.

## Test checklist

- Validate every frame ID and crop against `json/prof.json` and the atlas dimensions.
- Exercise caring -> quadruped Professor -> rise -> standing -> turn -> seated -> prepare -> stand -> walk -> reverse rise -> caring with a fake clock.
- Confirm a user message resets the 10-minute timer, assistant output does not, and Happy Home controls count as activity.
- Confirm the Good boy button starts disabled, is enabled only in the waiting-caring state, and returns to disabled after use.
- Confirm the module uses its chest-up renderer, Happy Home uses full-body actors, and the button/messaging edits exist only in the Health shell.
- Run JavaScript syntax checks, JSON parsing, and ZIP CRC validation.
