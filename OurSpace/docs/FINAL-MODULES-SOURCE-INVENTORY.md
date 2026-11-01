# Final modules source integration

Source: OurSpace_Separate_Modules.zip. Household and Skills module content is moved natively into each existing profile HTML. Source JS, assets, original CSS and all 102 numbered worksheet HTML documents are included.

Allowed standalone HTML resources: `assets/code/onyx_widget.html`, `assets/code/skills.html`, `assets/code/DBT/*.html`. No `household.html` in output.

All original JS and CSS are retained as source components, with scoped native CSS for the active pages and rewritten resource paths. Source onsite Onyx fullscreen/game remains based on original scripts and assets. There is no additional messenger instance. The module bridge is same-origin and local-browser scoped, not a replacement remote sync server.

Design: 26 original scoped design-part targets registered with the shared Quill widget.
