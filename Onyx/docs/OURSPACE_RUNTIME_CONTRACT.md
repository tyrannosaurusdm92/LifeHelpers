# OurSpace runtime bridge contract

Source of truth: the attached `OurSpace_Backend_v2.gs` plus the supplied deployed endpoint.

Runtime actions used by this cat-only viewer:

- `onyx.runtime.health`
- `onyx.runtime.capabilities.report`
- `onyx.runtime.mode.select`
- `onyx.runtime.behavior.sync`
- `onyx.runtime.activity.sync`

Additional backend actions already supported for the later host include manifest/bootstrap/get/save, scene save/get, navigation save/get and fallback activation.

Important frontend field alignment:

- behavior sync: `{ behavior, activity }`
- activity sync: `{ activity, activityState, autonomous }`
- capability report: `{ capabilities }`
- runtime requests are wrapped in the backend's JSON `data` envelope.

The viewer is deliberately offline-safe. Backend unavailability changes only bridge status; it does not prevent local inspection.
