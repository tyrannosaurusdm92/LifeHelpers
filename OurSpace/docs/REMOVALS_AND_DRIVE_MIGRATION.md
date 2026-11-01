# OurSpace — catalog deletion and Google Drive image migration

## Deleted from actual code and catalogs

The supplied `choices.json` removed exactly **6 layout presets** and **58 old image entries**. They are physically absent from both `js/design-widget.js` and `assets/code/design-widget.html`, and from the active JSON catalog. They appear only in `json/deleted.json` as permanent tombstones and in this deletion log. Do **not** reload old item lists when merging a module from another chat without filtering them against `deleted.json` using the IDs and URLs.

## Active catalog

The active catalog contains **94 layout presets**, **63 surviving Wikimedia images**, and **58 new Drive-hosted WebP images** (121 images total). Google Drive files are referenced individually, but the WebP bytes themselves are not in the ZIP.

**New seventh Images category: Real Life**, with 20 Onyx images, 16 Tiggy, 12 Callie, 8 Harvey, and 1 William & Jasper image (57). The `Trans Rights Or I Bites` image is under **Themes & General Interests → Trans rights**.

`json/drive-image-library.json` contains exact file IDs, names, categories, original Drive display links, and separate preview and background-image links. Those URLs use Google Drive's public thumbnail endpoint (`drive.google.com/thumbnail?id=FILE_ID&sz=w...`). Availability depends on Drive's host, link access, image format rendering, rate limits, and permissions; remote image delivery has **not** been demonstrated through the existing account backend.

### Backend / privacy limitations

No Apps Script backend was changed, replaced, exposed or bundled. The available ZIP does not contain a verified Drive-image backend response contract, so an authenticated server-side image-proxy cannot truthfully be claimed. The client currently references individual Google Drive images directly over HTTPS and leaves all originals on Google Drive. If your existing backend already offers an authenticated image URL resolver, connect that **verified** operation before treating images as private; a browser displaying an image fetched from Drive directly discloses the image URL and ID to the browser.

Google Drive metadata for the folder and sampled files unexpectedly reports **`anyone:writer`**. That is much more permissive than needed for public-read image backgrounds. Changing sharing roles has not been done here. Review the folder's access before using photos on public-facing profiles. Even with `anyone:reader`, a publicly embeddable image should be treated as publicly viewable. For genuinely private photos, use an authenticated server-side asset endpoint rather than Drive's shared image URLs.

If a Drive image fails to display, the gallery still provides its source-file link so you can confirm sharing and view it in Google Drive. Nothing is silently embedded in the ZIP as a workaround.

### Merge contract for future OurSpace modules

1. Read `json/deleted.json` before importing any image or layout catalog.
2. Compare by ID and **normalized source, wallpaper and thumbnail URLs**; drop any matches.
3. Preserve existing Drive-file IDs and category assignments from `json/drive-image-library.json`.
4. Recreate both the standalone catalog and the integrated widget catalog using the filtered lists; update the in-code `DELETED_INITIAL` as well.
5. The former `#admin` image/layout removal manager has been removed in the record-player replacement pass; `deleted.json` remains as a passive denylist for future merges.

All unused core profile HTML pages, the existing authorization system, project scripts, app manifest, and service worker remain otherwise unchanged except for a cache revision. No backend file was created.
