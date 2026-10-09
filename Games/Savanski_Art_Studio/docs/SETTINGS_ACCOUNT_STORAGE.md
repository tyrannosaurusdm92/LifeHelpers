# Settings / account / storage implementation

The Settings UI is deliberately not a new toolbar or navigation family. It is one floating Savanski-style window opened from three entry points:

1. Home / Projects gear icon.
2. Art Studio header gear icon.
3. 3D Editor header gear icon.

Art Studio and 3D Editor share the same editor shell, so the editor gear is one control that stays immediately left of the light/dark toggle as the active workspace changes.

## Account security

Passwords are never written to Savanski localStorage. Password fields use standard browser autocomplete (`current-password` / `new-password`) so the browser or password manager can remember credentials. When `Remember password / sign-in` is selected, Savanski persists the backend session token on that device; otherwise the token is session-only.

Forgotten-password codes are email-only because the supplied backend contains no SMS provider. Recovery responses avoid exposing whether an account exists.

## Storage purchase flow

The backend defines a linear quota model capped at 30 GiB for $130. The Settings selector offers every whole-GiB amount from 1 through 30 GiB (or the backend-provided selectable list when supplied) and calculates the corresponding linear payment amount. `Pay Now with Stripe` opens the Stripe payment link returned by `storage.contract`. The user pays the displayed amount, returns to Settings, enters the Stripe payment/receipt reference, and submits a storage claim. The current backend marks claims pending until admin approval, after which the corresponding storage quota becomes available.


## Install / app icon behavior

The same Settings window contains an Install Savanski section. It listens for the browser `beforeinstallprompt` event when available and records installation with the backend's existing `pwa.install.record` route when a signed-in session is available. When a browser does not expose a direct install prompt, the UI explains that the browser's Install App / Add to Home Screen command should be used instead. The bundled web-app manifest and existing icons live under `assets/app/`. No native wrapper or new backend was added.

## Backend immutability

The tested `Savanski_Backend_v3_0_1_30GiB_130USD.gs` is not bundled and was not modified. The frontend uses only actions the backend advertises. In particular, v3.0.1 exposes `auth.password.change` but not forgotten-password verification-code/reset actions, so the recovery controls remain visibly disabled until a backend version advertises those routes.
