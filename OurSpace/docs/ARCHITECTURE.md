# Architecture

## Layout

The UI is an original vanilla HTML/CSS/JavaScript implementation with three nested visual levels:

- **Server rail** → Work tab
- **Channel sidebar** → unlimited Work subtabs
- **Chat shell** → the active subtab's conversation, attachment tray, generation/search controls, and composer

This mirrors the useful information architecture found across the supplied Discord-clone references without importing their React/Next/FastAPI backends.

## Why local channel state

The supplied OurSpace backend already has the required Onyx AI actions, but it does not define a Work-tab-specific server/channel schema. Adding one would violate the instruction not to create a new backend file. Therefore:

- Work tab and subtab definitions are frontend state.
- Each subtab gets a deterministic `threadId` when calling `onyx.chat`.
- Recent per-subtab transcript is passed back in the `history` field.
- Existing Onyx server-side chat logging remains untouched.

This makes unlimited subtabs possible immediately without backend migration.

## Builder concepts applied

The supplied visual builder models nested content with a parent container plus child objects and maintains explicit parent/group relationships. The Work UI applies that idea at application level: a Work tab is the parent container and each channel-like subtab is its child. The builder's responsive/module-shell approach also informed the independent server rail, subtab panel, chat panel, and mobile drawer behavior.

## Onyx brain integration

`work-tab.js` attempts to import:

`../../Onyx/js/ai-brain-config.js`

That existing module declares the same backend URL and `onyx.chat`/history actions. The Work client does not duplicate the Onyx corpus, router, retrieval engine, or model configuration. It only passes Work-specific context to the existing brain/backend boundary.


## Work mood state adapter

The Work sidebar portrait is presentation-only and does not add a backend state system. `work-tab.js` adapts current Work input/output into a small Work-specific visible-state set and can consume an existing backend mood/state hint when that hint is valid for Work.

The state is stored locally in `onyx.work.mood.v1` so a refresh can preserve the recent conversational posture. The most recent stored chat timestamp is also inspected on initialization, allowing the 3-minute and 5-minute idle thresholds to remain correct across page reloads.
