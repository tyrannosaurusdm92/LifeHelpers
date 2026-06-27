# Integration Guide

This package is already fully combined. Use `journal-module.html` as the working integrated module.

## Embed into an existing page

1. Copy the `assets/` folder into your site.
2. Paste the contents of `integration-snippets/embed-in-site.html` where the journal should appear.
3. Keep both roots on the page:
   - `#ourspace-journal-root`
   - `#ourspace-journal-a11y-root`
4. Keep the accessibility root pointed at the journal root with:
   - `data-journal-root="#ourspace-journal-root"`

## Backend URL

Both roots use the same Apps Script backend:

`https://script.google.com/macros/s/AKfycbwL1e8Gv-o0wC8kAhseMwoNhs97OBvCfCB5FV4zwNnCRa9jYWbYwm2B-wYwUOjlnjg_vA/exec`

## Profile handling

The module resolves the active profile in this order:

1. Explicit mount options
2. `data-profile`
3. `document.body.dataset.profile`
4. `window.OurSpaceAuth.profile`
5. `localStorage` keys used by OurSpace
6. `shared`

For William and Jasper pages, change `data-profile="shared"` to the current profile name or allow the existing OurSpace auth object/localStorage profile to supply it.

## Accessibility scanner integration behavior

The scanner can insert OCR text by calling the journal instance API:

- `journal.insertAccessibilityText({ title, text, mode, sourceName })`

Supported modes:

- `new`
- `append`
- `replace`

A fallback DOM method is included for older pages, but the public API is the preferred path.
