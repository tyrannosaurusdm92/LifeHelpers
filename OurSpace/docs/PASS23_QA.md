> Historical Pass 23 notes. Superseded by the 2026-10-15 fullscreen integration documented in `Feed_Him_MEOW_Integration.md`; the game now opens only from the Onyx Leisure widget and does not use `assets/code/meow.html`.

# Pass 23 QA — Ingredient Garden / Level Select edition

## Checked

- One HTML file, `assets/code/meow.html`; no other `.html` files.
- Active screens and menu links: `page1` Level Select, `page2` Recipe Generator, `page4` Ingredient Garden.
- Level Select keeps paw map art, 45 level nodes configured by original path data, level modal with Solo/Duo, account level and 5-star UI.
- No Pinball Fishing or Kitchen page, menu, kitchen editor, game script, dedicated CSS, dedicated kitchen/fishing images or dedicated kitchen/fishing sound files in package.
- All 20 JavaScript files passed `node --check`.
- Every HTML/CSS local path and directly embedded JS media URI resolved to a file in the package.
- Randomizer generated Ingredient Garden boards for levels 1, 10, 25, 50 and 140 from real recipe catalog data with neutral fishing modifier (1).
- In a JavaScript logic test, start level -> recipe -> Garden routed page2 -> page4 and a three-star Garden win awarded five map stars plus level 2 unlock.
- `script/` contains only `aurora_kernel.wasm`; `docs/` has no nested folders.

## Limitation

Headless Chromium navigation to the local testing host or local file was denied by the execution environment (ERR_BLOCKED_BY_ADMINISTRATOR). Visual interaction in a live browser therefore was not verified. Serve the folder at the desired GitHub Pages path and open `assets/code/meow.html` for final device QA.
