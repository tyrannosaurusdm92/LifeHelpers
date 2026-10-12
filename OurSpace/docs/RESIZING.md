# Expand / retract resizing

All worksheet and handout pairing pages share `js/dbt/resizing-responsive.js`.
`assets/code/skills.html` uses the same script for the cover iframe,
worksheet reader frame, pair cards, and the reader's header.

- Drag any of the eight edge/corner handles to increase or decrease a panel's size.
- The **−** and **+** buttons on pages and iframe frames retract/expand them by 15%; **↺** restores the default geometry.
- Focus an edge or corner handle and press arrow keys to resize in that direction. Shift + arrow changes size faster. Home or double-click restores the default size.
- Resizing **width only** reflows the page and lets it grow as answers are entered. Resizing a **vertical edge/corner** also sets a fixed viewport height; its content can then scroll without getting cut off.
- The iframe itself remains proportional to its frame (98% of the available frame area). Handouts and worksheets inside it continue to work normally.
- Oversized tables scroll *within the table* rather than compressing words into one-letter-wide columns.
- Panel sizes are saved locally for this browser, per page. On screen-width changes, saved widths adapt to the available space. Restore resets the saved value.
- Resize handles and controls are excluded from printed/PDF output.

No Savanski toolbar, art features, scripts, or color scheme is included.

## JavaScript integration pass 3 (2026-10-09)
- Compared the three JavaScript files in `DBT_Worksheet_Javascript_Updated(2).zip` against Pass 2. The supplied field-entry module is the same baseline; the supplied resize and print modules predate the newer Pass 2 fixes.
- Consolidated the supplied general-purpose responsive selector/attribute conventions with Pass 2: explicit `[data-dbt-responsive]` and `[data-dbt-resizable]` panels now participate alongside all existing document frames.
- Retained 8-edge dragging, keyboard edges, saved size ratios, manual height scrolling, 98% embedded readers, document size buttons, and print-safe restoration.
- Added a `dbt:content-resized` event after editable multiline fields change so integrations can remeasure as users type. Native forms continue saving under the existing storage keys.
- Avoided proportional downscaling of worksheet text; broad text scaling in the older script can make document headings and answer fields too small when retracting. Panels still emit `dbt:resize` and scale their *panel controls and spacing* moderately.
