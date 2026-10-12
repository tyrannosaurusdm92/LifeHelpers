# Onyx frame-by-frame animation research — pass 6

## Scope

This pass carries the earlier flipbook and frame-by-frame study into the runtime for all ten canonical moods and the neutral base cat: nine full-body quadruped moods, the biped advising Professor, and `base_cat`. It preserves the existing paired JavaScript/CSS mood profiles and the six authored atlas facings. Legacy assets and the separate chest-up module renderer remain outside this full-body animation route.

## Runtime correction and changes

Pass 5 added five weighted idle phases to each quadruped profile, but the Health shell still selected only phase zero while Onyx was resting. Pass 6 wires the full `[0, 1, 2, 3, 4]` idle sequence into that renderer, so all five supplied idle drawings can now appear while stationary. Mood-specific weighted holds remain in place; reduced-motion mode continues to hold the first stable frame.

Quadruped walk/run phases now follow measured screen distance and the current mood's cycle duration. Professor quadruped/biped walking uses the same travel-locked timing with its own walk exposure. This makes gait phases advance with actor travel and keeps the selected paw-contact drawing steady when the actor stops. A profile flag controls this behavior, with the existing elapsed-time clock retained as a fallback when screen-distance data is unavailable.

The actor still selects one of eight movement sectors. The supplied sheets contain six authored facing views, so due north/south use the nearest up/down diagonal and preserve the previous side to avoid flicker. A true front/back view would require new drawings. Each selected full-body frame already contains its paired paw, face, body, and tail changes; Pass 6 exposes the authored idle differences instead of synthesizing separated anatomy or inventing extra artwork.

## Research applied

- Disney Animation's hand-drawn and animation process references informed pose readability, timing, anticipation, follow-through, and secondary action.
- The UC Davis CAT quadruped work informed keeping locomotion timing distinct from the existing head aim, paw contact/IK, and tail layers.
- E-SAKUGA's key-pose/time-sheet overview and Naoki Yoshibe's animation interview informed uneven exposures, held drawings, and deliberate in-between timing.
- *The Aristocats*, *Oliver & Company*, and *Lady and the Tramp* remain broad observation references for feline carriage, kitten energy/attention changes, and animal pose continuity. Onyx's supplied artwork is used; film frames and character designs are not copied.

The cycle lengths and phase weights are authored starting values for Onyx, not measurements taken from those films. The reference list and per-mood values are in `json/onyx-animation-research.json`.

## Coverage

| Profile | Form | Pass 6 application |
|---|---|---|
| `advising_professor` | Biped | Travel-locked quadruped/biped walking, existing weighted entry/exit/settle/listening clips |
| `caring`, `hungry`, `judgmental`, `listening`, `purring`, `sleepy`, `snuggly`, `thinking`, `thoughtful` | Quadruped | Five-frame idle playback and travel-locked walk/run cycles with mood-specific holds |
| `base_cat` | Quadruped | Five-frame idle playback and travel-locked walk/run cycles |

## Verification targets

- Each of the 11 full-body profiles has its corresponding JavaScript/CSS pair and atlas path.
- The Health shell chooses all five idle frames and keeps the reduced-motion freeze.
- Walk/run phase follows traveled screen distance when profile metadata requests it; zero travel holds the current gait phase.
- Eight movement sectors map deterministically onto the six existing views.
- Professor travel timing remains behind its profile flag and elapsed timing remains the fallback.
- The source atlas PNGs, legacy files, and chest-up widget mood route are unchanged.

## Source references

The source URLs and their specific application notes are recorded in `json/onyx-animation-research.json` under `references`.
