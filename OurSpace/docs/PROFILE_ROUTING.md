# OurSpace profile pages and portal routing

The authoritative `ourspace.html` sign-in portal already exists **in the project root**, above `assets/code/`. It is included at the root of this supplied test package. Its two referenced authentication client scripts were not supplied.

Following successful authentication in `ourspace.html`, load:

- William / Dino → `assets/code/william.html`
- Jasper / Squishy → `assets/code/jasper.html`

**Integration in existing portal:** The profile-routing script is already linked from the parent-level `ourspace.html`. In its existing successful sign-in callback call `window.OurSpaceProfileRoutes.afterSignIn(signedInUser.profileKey)` (or use the authenticated canonical profile string). The helper also accepts `ourspace:sign-in-success`, `ourspace:login-success`, and `ourspace:auth-success` events carrying a verified `detail.profileKey`. Do not invoke the router before authentication succeeds. The supplied archive includes `ourspace.html`, but not its separate login frontend JavaScript files; these need to be restored from your authoritative frontend, without changing your tested backend.

Both profile pages are fully duplicated from the supplied `onyx.html`, sharing one set of supporting JS/CSS/data/media. The four-tab Onyx bubble and fullscreen game/Work/DBT functionality are preserved. The page background is now `<iframe id="ourspaceProfileFrame" src="about:blank">`, sized to 100% of the viewport with no loaded content. Populate its `src` later when the profile content is ready. The older standalone main game DOM remains hidden to avoid painting over this iframe.

The old `assets/code/onyx.html` file no longer exists. The web manifest starts at the existing root `ourspace.html`. Push-notification fallbacks respect a known William/Jasper profile key and otherwise open the portal. No replacement backend was made.

Deployment: use this package root and restore the two missing original frontend login files. Keep the authoritative authentication logic and Apps Script backend.
