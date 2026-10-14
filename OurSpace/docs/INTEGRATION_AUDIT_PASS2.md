# Happy Home integration audit

This export embeds the regular finished-room experience in Onyx's Virtual fullscreen tab. The legacy Happy Home admin shell and its sprite editor are excluded.

The merged package includes the room editor, 91-item store catalog and artwork, seven Onyx sleeping-bed inventory sprites, the room scene, spatial interaction map, room audio, weather videos, and the 33 unchanged tablet SVGs with their embedded videos. The room editor loads from `js/happy-home/`; its single authored standalone host is `onyx.html`.

Local HTML and CSS references resolve within `Onyx_export/`; standalone HTML is limited to `onyx.html`. JavaScript, JSON, SVG XML, and the embedded shell scripts pass static syntax or parse checks.
