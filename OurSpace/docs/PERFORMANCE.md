# Performance pass

The old raw atlas sources totaled 144,017,094 bytes including reaction text. They are stored as individually gzip-compressed base64 payloads inside `onyx-atlas.js` and inflated only when a needed behavior/mood group is requested. Static canonical mood images remain available as a fallback.

This materially reduces initial JavaScript parse work, but the animation dataset is still large in decoded runtime form when many groups are used. Further atlas format work remains worthwhile.
