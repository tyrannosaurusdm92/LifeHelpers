# OurSpace safe design presets and permanent catalog deletion registry

## Root cause and profile-safe style rules

The previously reprogrammed 100 layout presets styled `body` with font-size, padding, border, opacity, background and text in one rule, and matched broad `header`, `h1`, `ul`, etc. selectors. This could override the profile grid, module sizing and nested controls. The updated designer compiles decoration-only CSS. It targets explicit `data-design-target="..."` elements, never generic headings, page-wide headers or unregistered components. It keeps existing geometry, positioning, module height/width, scrolling and event handlers. The `body` selector receives background image and color settings only, never layout geometry. Widgets' existing buttons/forms remain functional. It retains individual target colors, images, fonts, borders, and text decoration, within safe limits.

## Deletion registry (passive, no in-browser deletion UI)

The former layout/image admin checkbox manager, Admin cleanup tab, and Delete selected action were removed in the record-player replacement pass. `json/deleted.json` remains as a **read-only tombstone manifest** for previously removed layouts/images. All catalog imports from another chat should filter against this file by ID and matching original source URLs. New deletion requests should be sent with a separate list and the package for a deliberate rebuild, not made through this release's frontend. This release uses `#admin` only for the record-player placement editor on William’s profile.

## JSON schema / canonical identifiers

`choices.json` uses `schema: "ourspace.catalog-removals.v1"` and a `removed` object, with `layouts` and `images` arrays. Each entry includes `id`, `title`, `category`, optional `subcategory`, `sourceUrl`, `wallpaperUrl` and `thumbnailUrl`.

`json/deleted.json` uses `schema: "ourspace.deleted.v1"`, `version: 1`, `layouts: []`, `images: []`. **A deletion is authoritative if either its canonical ID or one of its source/image URLs matches.** Normalize URLs before matching. The new widget blocks application and saves from banned URLs; it sanitizes imported profile design state and saved looks, as well as its own two catalogs.

The bundled `json/deleted.json` starts empty because no images/layouts have been selected for removal yet. The webpage cannot rewrite this static ZIP file in place. Export your selections; the following ZIP merge will populate it. Other ChatGPT chats or independently developed widgets cannot automatically see this chat's local browser storage. They must receive/use the current `deleted.json` or the updated OurSpace package and follow this filtering rule. A shared standalone module that doesn't read the registry can still reintroduce a deleted asset, so enforcing this when modules are merged is required.

## Compatibility

The original MySpace-style profiles, login, backend connection details, blank page destinations and standalone design widget remain intact. After the October 31 choices.json update, 6 layouts and 58 image references were permanently deleted: 94 layouts and 121 image references remain, with 58 Google Drive-hosted replacements. See docs/REMOVALS_AND_DRIVE_MIGRATION.md. Admin removal is an authoring/preview convenience, not a privileged backend account. Exclusion lists are not authorization controls.

## Testing performed

Chromium desktop (1440px) and narrow/mobile (390px) verified admin-only access, multi-category checkbox selection, automatic choices.json export, immediate filtering, non-admin hidden controls, and no client-side errors. All 100 preset preview styles were separately applied to the actual profile and measured against the pre-preset app width, header height, column widths, module count and body padding/borders: none changed. Remote wallpaper availability was not verified; a server-side image URL can still be down independently of the site's geometry.
