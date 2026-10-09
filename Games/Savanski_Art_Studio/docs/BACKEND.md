# Savanski backend connection

Savanski uses the tested Google Apps Script backend configured in `js/backend-config.js`:

`https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec`

Backend source version used as the frontend contract: **Savanski Backend v3.0.1**. The backend source itself is not bundled or replaced by this frontend package.

The browser client in `js/backend-api.js` uses the backend for:

- account sign-up with username, password, and at least one of email/phone;
- sign-in by username, email, or phone;
- remembered-device sessions;
- account/profile sync;
- signed-in password changes;
- donation-backed cloud-storage quota;
- project/file cloud backup;
- Stripe donation/payment-link workflow and storage-claim submission.

Savanski remains usable in guest/device-only mode without an account. Savanski contains no AI routes.

## Settings window

`js/settings.js` and `css/settings.css` provide one shared Settings pop-out. It is opened from:

- the Home gear icon;
- the editor gear icon immediately to the left of the light/dark toggle in both Art Studio and 3D Editor.

The settings window uses the same visual language as the existing Savanski tool windows and contains sign-in, sign-up, remember-sign-in, browser/password-manager-compatible password fields, show/hide password controls, account status, password change, storage usage/quota, storage-size selection, Stripe checkout link, storage claim submission, and claim history.

## Forgotten-password verification

The tested v3.0.1 backend does **not** advertise `auth.password.forgot` or `auth.password.reset`, and it contains no verification-code delivery route. The requested recovery controls remain present in the Settings UI, but they stay disabled when connected to this backend. The frontend does not fake a verification code or reset a backend password without server authorization.

No alternate backend is created by this package.

## Storage pricing

The backend defines a linear quota model capped at **30 GiB for $130**. The frontend exposes 1–30 GiB selections and calculates the displayed payment amount from the backend pricing response. `Pay Now with Stripe` opens the backend-provided Stripe URL. Because v3.0.1 uses admin-approved donation claims, the user can return to Settings, enter the Stripe payment/receipt reference, and submit a storage claim for approval.
