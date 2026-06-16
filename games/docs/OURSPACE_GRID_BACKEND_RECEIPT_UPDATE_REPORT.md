# OurSpace grid, module zoom, backend, and receipt update report

## Module sizing and layout
- Default module zoom is now 130% while keeping selectable module zoom choices from 25% through 200%.
- Module headers, module bodies, module footer/composer areas, page headers, and the floating side navigation were enlarged to match the 30% larger baseline.
- Module movement now snaps to a 24px grid while dragging and saves snapped positions.
- The module board now spans the usable page width and shows a transparent snap grid over the page overlay/background image.
- Dragging near the lower/right edge expands the board so more of the page can be used.

## Backends
- Main backend URL updated throughout the frontend package.
- Onyx full/alerts backend URL updated throughout the frontend package.
- Backend script files are not included in this front-end package; the front end points to the configured stable site and Onyx backend library URLs instead.

## Purchase receipts
- William purchases now route receipt emails to Jasper.
- Jasper purchases now route receipt emails to William.
- The frontend store checkout now sends `recordPurchase`, `profileKey`, `purchaserProfile`, `receiptToProfile`, and `receiptToEmail` explicitly.
- The site backend now accepts the `recordPurchase` action and sends a richer receipt email via `MailApp.sendEmail`.

## Frontend/backend feature bridge
- The two-member shared-channel messenger plugin was integrated into the main site and plugin folder.
- Messenger backend envelopes now carry saved session tokens/profile keys when available.
- The backend includes aliases used by the frontend for sign-in, sign-up, password reset, channel creation, purchases, Onyx chat, and Onyx alerts.
- The PWA service worker cache name was updated and now includes the Jeeliz face-filter model plus the replacement backend files.

## Validation performed
- JavaScript syntax checks passed for the modified frontend scripts.
- Inline profile-page scripts passed syntax checks.
- Google Apps Script files passed JavaScript syntax checks as `.js` copies.
- Old backend deployment URLs were removed from the package.
