# Happy Home animation and behavior test — Testing pass 4

Happy Home starts with quadruped Onyx. A Health user message changes the module widget to caring and starts the room sequence: caring quadruped, thoughtful quadruped Professor cue, atlas rise, biped walk to the standard couch seat, turn, settle, and seated Professor poses.

After ten minutes without a Health composer input or Happy Home pointer, keyboard, or input activity, Onyx prepares to stand, walks away, reverses to quadruped, and waits in caring. Assistant replies do not reset the timer. The Good boy button stays disabled until this wait state, then enables purring and the existing autonomous cat behavior when clicked. The autonomous mood list excludes Professor.

Keys: `T` start or leave a manual Professor test, `2` walk to couch, `P` pivot, `X` sit, `U` get up, `0` walk away, and `C` cycle quadruped couch rest spots.

The module renderer remains chest-up. Happy Home uses separate full-body quadruped and Professor atlas actors. Feed Him MEOW stays on its existing runtime path.

## Pass 4 verification

- Fake-clock actor/environment exercise passed: caring/Professor entry, turn and seated clips, user-only idle timing, walk-away/reverse transition, Good boy gate, purring, and autonomy resume.
- All 660 atlas cells were checked against the 1919 × 1408 sheet; every semantic animation entry resolves to an atlas frame ID.
- JavaScript syntax, JSON parse, embedded health-shell wiring, package references, and final archive CRC checks are recorded in the pass report.
- A browser smoke test could not run because the environment has no installed Chromium executable. The state machine was exercised with a fake clock instead.
