# Background image library added to OurSpace designer

- Based entirely on the supplied `OurSpace_Interests_Free_Use_Image_Links(2).txt`.
- All **121 individual image links** across **58 interests** are retained, each with its source/license page.
- The six categories are Aesthetics & Styles (15), Colors & Color Preferences (10), Themes & General Interests (36), Music (18), Movies & Television (30), and Video Games (12).
- The Images tab has category selection, interest/subcategory selection, keyword search, and eight thumbnail previews at a time. No images from the library are requested until someone chooses a category. Thumbnails are loaded from Commons using width-limited redirect URLs, when the upstream host supports them; the **original direct image link** is preserved for applying to the page.
- A selected image previews directly on the chosen style target (website background, module, etc.) until **Keep** or **Undo**; it is not added to profile/browser sync before Keep. Switching image selections previews against the same prior state.
- The original upload field, custom URL input, placement/tiling/image overlay controls, six category layout preset gallery, local saved looks, and profile/page segregation remain untouched.
- `json/background-image-library.json` stores the complete structured catalog. The code also embeds those references into the designer JS and the single-file standalone HTML, so no network request for catalog metadata is required.
- External Commons images may fail to load or redirect; a failed preview shows a placeholder and retains the source/license link. Image availability was not independently verified. Each Commons file may require attribution or share-alike compliance, and subjects from TV, games, or music may involve additional rights.

## October 31 catalog replacement

The previous Commons-only list has been updated: 58 selected Commons images were removed, 63 kept, and 58 Drive WebP links added. See `json/drive-image-library.json` and `docs/REMOVALS_AND_DRIVE_MIGRATION.md`. The Real Life category has 57 entries, while Trans Rights Or I Bites is in Themes & General Interests. No Drive WebP bytes are packaged.
