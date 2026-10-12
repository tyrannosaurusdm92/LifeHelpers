# Pass 29 — Source-true Onyx Pass 23 core modules

Six files restored as real, independently editable JavaScript files in
`OurSpace/js/onyx/games/virtual/`, matching the source ZIP by Git SHA:

| File | Verified Git blob |
|---|---|
| onyx-base-physics.js | f86a276d8f9d28849be07e6de49907f1afc5fd0c |
| onyx-base-navigation.js | 5570dfa5353e314dde529a3003e48c1938711f8c |
| onyx-base-gait.js | 4bd120ee87cb2e1adf09d590de4c389d55c38296 |
| onyx-base-profiles.js | 8ce32281fa4900228d185df917f7a021a9373363 |
| onyx-base-sequences.js | 72bbf17605d69856f519219bbc72098b1dc58266 |
| onyx-base-sprites.js | 6f668714ea02da0580e1ad89996ee896b6389553 |

These files preserve the **original** Pass 23 collision/landing and
pathfinding, paw-contact gait timing, mood timings, sequence orchestration,
and Onyx/optional reference-sprite logic.

**Preservation rule:** The currently active Pass 25 `onyx-base-runtime.js`
and its 18 action wrappers have not been replaced in this commit. The
restored Pass 23 core modules are not yet wired into the live loader, because
the matching original Pass 23 runtime and action descriptors still need to
be restored and tested as a coordinated change.

Do not interpret this addition as confirmation of complete Happy Home
integration. The original OurSpace Pass 15 application JavaScript and the
12 feeding/drinking SVGs remain outstanding. The full 789-file
Pass 26 local test tree remains the preservation reference.

No backend, root HTML, manifest, service worker, or previous file was
changed; no ZIP was committed.
