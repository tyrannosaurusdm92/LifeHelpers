# Onyx public runtime behavior contract

This package has exactly **ten canonical visible behaviors**. No care action, idle variant, animation beat, backend cue, or legacy state name may become an eleventh visible behavior.

## Canonical behaviors

1. `advising_professor` → `onyx_advising_professor`
2. `caring` → `onyx_caring`
3. `hungry` → `onyx_hungry`
4. `judgmental` → `onyx_judgmental`
5. `listening` → `onyx_listening`
6. `purring` → `onyx_purring`
7. `sleepy` → `onyx_sleepy`
8. `snuggly` → `onyx_snuggly`
9. `thinking` → `onyx_thinking`
10. `thoughtful` → `onyx_thoughtful`

## Legacy behavior routing

Older behavior names are accepted only as compatibility inputs and are immediately normalized. They are never persisted, emitted as `behaviorVariant`, or exposed as a current mood/state.

- `professor`, `advising`, `clipboard`, `highfive`, `sitpretty` → `advising_professor`
- `care`, `nuzzle`, `pet`, `scratch`, `brush`, `blep`, `wake`, `zoom` → `caring`
- `feed`, `treat` → `hungry`
- `judge`, `grumble`, `sermon`, `bored`, `overstimulated`, `sit` → `judgmental`
- `listen`, `alert`, `watch`, `patrol`, `boundary`, `pounce` → `listening`
- `purr`, `knead`, `slowblink`, `bowtie`, `play` → `purring`
- `sleep`, `napshift`, `yawn`, `resting` → `sleepy`
- `rest`, `cozy`, `loaf`, `pillow`, `blanket`, `returnwarm`, `sprawl`, `fan`, `stretch`, `rotisserie` → `snuggly`
- `think`, `curious`, `inspect`, `groom`, `sidewalk` → `thinking`
- `checkin`, `pawtap` → `thoughtful`

Care buttons such as Feed, Play, Brush, Blanket, Fan, Bow Tie, Pillow, Nuzzle, and Slow Blink remain **actions**, not behaviors. Each action now routes to one of the ten canonical visible behaviors.

## State priority

Immediate safety/serious distress outranks user-input meaning, conversation phase, active tool work, response purpose, direct pet interactions, tab bias, care needs, and idle behavior.

## Persistence rule

Only the ten canonical remote IDs above may be stored as Onyx’s persisted visual state.
