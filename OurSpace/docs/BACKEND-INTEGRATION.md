# Existing backend integration, without backend replacement

The user's existing Apps Script backend is **not** included here and is not modified. Its deployment address is deliberately absent from the frontend.

The client only calls `POST /api/ourspace` on the **same origin**, with `Content-Type: text/plain;charset=UTF-8`, the JSON envelope `{"action":"...","data":{},"clientId":"ourspace-browser","sessionToken":"..."}` (session token only after verified login). The host must route this trusted relative path to the existing deployment, forward response bytes correctly, and preserve response status. Configure that upstream on the server/hosting layer, never in downloadable JavaScript or HTML. Without such a gateway, ordinary sign-in cannot work; the site should show an error rather than invent an authenticated session.

Existing actions used by the client:
- `auth.signin` -> requires an authoritative `sessionToken` and `user.profileKey` in `william|jasper`.
- `auth.signout`.
- `auth.password.forgot` -> request delivery methods and/or a verification challenge.
- `auth.password.reset` -> identifier, code, newPassword, challengeId.
- `profile.get` / `profile.save` -> private profile read/save, **verify the contract and field mapping** before production.
- `public.profile.get` -> published-only, read-only visitor view.

The login treats a browser's password manager as responsible for saved passwords; passwords are never written to localStorage. The remember-device checkbox controls whether the validated session is persisted in localStorage or sessionStorage. Server-side sessions/authorization remain authoritative.

The designer's canonical state schema is `{version,targets,styles,selected,presets,activePreset,showDemo}`. A profile-scoped sync adapter should support `{profileKey,pageKey,state}` via `profile.design.get` and `profile.design.save`, or map those to a compatible existing account-preferences operation. **These actions must be checked for actual support**; the included frontend does not make backend changes and cannot make a static offline page guarantee cloud sync. Server must reject users attempting to read another person's private page and must not accept `#admin` as a real privileged session.

The `assets/code/*.html?public=1` reader fetches only published records. It does not display browser-local or server-private profile data as a fallback. Keeping a private field out of a published response is a backend responsibility.

Deployment checks: verify authenticated sign-in, both profiles' authorization, recovery delivery and reset, private saves across devices, read-only public profile behavior, background-image/asset URL authorization, design read/write actions, PWA install prompt, Apple Add to Home Screen, and HTTPS service worker update flow.
