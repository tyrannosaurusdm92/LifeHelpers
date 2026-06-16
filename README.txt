Onyx Static Profile-Embedded Browser Bot

Open either profile page directly in a browser, or upload this folder to static hosting/GitHub Pages:
- dino-nerdzone.html -> Onyx profile mode: Papa / William / Dino Dad
- squishy-cottage.html -> Onyx profile mode: Momma / Jasper / Squishy Momma

Onyx is not a separate HTML page in this build. He is embedded inside each page's Chat Bot with DBT Skills section, using the existing Onyx face and Onyx chat module positions from the provided profile HTML pages.

What changed:
- Replaced backend/App Script Onyx calls with a static browser-only Onyx widget.
- Uses local JavaScript bundles and local JSON-derived response catalogs.
- Uses local Onyx emotion PNGs and changes face/mood from conversation input/output.
- Keeps separate relationship modes:
  - William/Dino page: Onyx calls him Papa.
  - Jasper/Squishy page: Onyx calls them Momma.
- Removed separate Onyx HTML entry page from the returned package.
- Added responsive mobile overrides so modules stack instead of forcing a fixed-width board.

Important:
- The Onyx bot itself does not need Python, a backend, or Google Apps Script.
- The larger profile pages may still contain other non-Onyx modules that refer to existing site assets or optional backends. Onyx will still load and respond from /onyx/ locally.
- Keep the /onyx folder next to both HTML files so these paths stay valid:
  onyx/onyx-widget.css
  onyx/onyx-widget.js
  onyx/static/script/*.js
  onyx/static/img/*.png
