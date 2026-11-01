# OurSpace second lossless / replacement pass

This release starts with the previous lossless package and rechecks it against both original inputs. The original module files are preserved in-place or mapped to their integrated equivalents; no standalone HTML was recreated for any absorbed module.

## Concrete repairs

* The 102 worksheet and handout links in Onyx's DBT assignment scripts now point to `assets/code/DBT/` through `DBT/<name>.html` relative to the permitted profile/widget HTML pages. Case matters when hosted on GitHub Pages.
* The JSON pairing catalogs use the correct `assets/code/DBT/` case.
* The Quill Designer routes the floating Onyx widget controls to the actual `#osOnyxNativeRoot` outside the Journal/Communication page container.
* Historical MySpace visual presets leave text-element background fills intact. No old MySpace DOM, column grids, sizes, ordering, or layout transforms are imported.
* The messenger rail's single page scrollbar responds to dynamic content mutations and resizing.
* The original standalone `assets/code/design-widget.html` was already absorbed into common JS and CSS and is intentionally **not shipped**. The original in-page Quill design features are kept.
* The service-worker shell cache list is updated, without caching private backend responses.

## Integration boundaries

* `OurSpace` is the only deployable folder in this ZIP. The existing `Onyx` brain and `Games` arcade are referenced as sibling directories; their source is not copied into OurSpace.
* The supplied Apps Script backend is **never** bundled. Account profile storage and badge counts use the published backend actions; these are not a guarantee of live provider configuration.
* Browser and OS platform rules control PWA app badges. A numeric app badge can be requested when supported; an arbitrary `‼️[#]` emoji overlay cannot be guaranteed on all installed app icons. The visual favicon/tab fallback is supported.
* The current Onyx backend supports psychiatry-adjacent support, DBT, health, and work modes. A clinical support bot is not a substitute for a licensed clinician.
* GitHub main is not changed by the downloadable ZIP. A complete directory replacement requires a repository commit containing **every** binary and text asset. Do not push only the small JS fixes and delete the old OurSpace tree; the site would break.

## Size requirement

A 100,000–150,000 KB compressed target cannot be satisfied by the original, non-duplicated code and assets currently supplied. Shipping duplicate media, archives, unlicensed material, or dummy padding would break the lossless/de-duplicated and directory-contract requirements. The audit report records the actual ZIP size.
