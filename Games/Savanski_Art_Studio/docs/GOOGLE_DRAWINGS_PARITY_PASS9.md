# Savanski Art Studio — Google Drawings Parity Pass 9

## Scope

This pass maps the standalone Google Drawings **editing toolset** into Savanski Art Studio without adding a new toolbar or menu family. All controls are inserted into Savanski's existing Art Studio tool windows. Google-account/Drive collaboration services are not reimplemented because this build must keep the already-tested Savanski backend unchanged.

## Object editing and selection

- All advanced Art objects are selectable and movable: brush/paint strokes, effect strokes, text, Word Art, imported/generated images, shapes, tables, charts, connectors, fills, and grouped objects.
- Click selection, Shift/Ctrl/Cmd multi-selection, marquee selection, Tab/Shift+Tab object cycling.
- Drag move, four-corner resize handles, rotation handle, Shift-constrained 15-degree rotation.
- Ctrl/Option-style copy-drag, duplicate, group, ungroup, internal multi-object copy/cut/paste and Delete/Backspace deletion.
- Arrow-key 1 px nudge; Shift+Arrow 10 px nudge.
- Exact X/Y, width/height and rotation fields; aspect-ratio locking.
- Bring forward/backward, bring to front/send to back.
- Align left/center/right/top/middle/bottom; horizontal and vertical distribution; center horizontally/vertically on page.
- Flip horizontally/vertically and rotate ±90 degrees.
- Snap to guides, snap to grid, show grid, rulers, horizontal/vertical guides and clear guides. Ctrl/Cmd while ordinary drag temporarily suppresses snapping.

## Lines and connectors

- Line, arrow, elbow connector, curved connector, polyline, curve and scribble/freehand workflows.
- Attached connectors between two objects recompute their endpoints when either object moves.
- Line color, width, solid/dashed/dotted styles.
- Start/end marker styles: none, filled arrow, open arrow, circle, square and diamond.

## Shapes

- Existing Savanski procedural shape catalog plus Google-style shape/arrow/callout/equation families.
- Fill color or transparent fill, line color, weight and style.
- Text inside a shape.
- Precise adjustable-shape control (Google Drawings yellow-handle equivalent) for rounded rectangles, arrows, speech callouts and stars.
- Movable/resizable/rotatable like every other object.

## Text and Word Art

- Text Box and Word Art.
- Font family, font size, text color, bold, italic, underline, strikethrough.
- Left/center/right horizontal alignment, top/middle/bottom vertical alignment.
- Line spacing and shrink-to-fit option.
- Multi-line editing in a spellcheck-enabled textarea using the browser's native spelling dictionary/suggestions.
- Bulleted and numbered lists, special-character insertion, clear formatting.
- Link and alt-text metadata.
- Text inside shapes.

## Images

- Upload from device, URL import, clipboard image import and mobile/device camera capture.
- Existing Savanski crop/mask, border color/weight/style, recolor, transparency, brightness/contrast, local background removal, erase/restore cleanup and Reset Image.
- Images remain independent selectable/movable/resizable/rotatable objects.

## Tables, charts and diagrams

- Editable tables with rows/columns, cell-data editing and structure changes.
- Editable local column, bar, line and pie charts from label/value data.
- Process, cycle, hierarchy, relationship and timeline diagrams assembled as editable Savanski groups rather than flattened artwork.

## Page, view and export

- Existing arbitrary custom canvas resize is the File > Page setup equivalent and remains editable after project creation.
- Existing solid/gradient/transparent canvas-base controls.
- Fit, 50%, 100% and 200% zoom presets plus existing zoom controls.
- Existing PNG, JPG and WebP export plus Pass-9 SVG and PDF export.
- Print current drawing.

## Comments and versions

- Object/project comments with open/resolved state.
- Named project revisions stored inside the editable Savanski project and restorability from the File window.

## Google Drawings features that are Google-service integrations rather than drawing tools

Google Drive live multi-user sharing, Drive-folder ownership/star state, Google Photos/Drive pickers, Google web/stock-image search, Google Workspace activity dashboards/notification settings, and Gemini-backed Google background removal depend on Google account services. They are not falsely emulated or routed through a replacement backend. Savanski keeps its tested account/storage backend unchanged and uses its own local image/background tools.

## Sources reviewed

- Google Docs Editors Help — Learn how to use drawings & markups (lines, connectors, curves, polylines, scribble, shapes, movement, resize, rotate, styling, copy-drag, page setup).
- Google Docs Editors Help — Insert and arrange text, shapes, diagrams, and lines (order, align, distribute, center on page, group, rulers, guides, grid snapping, size/position).
- Google Docs Editors Help — Edit drawings with a screen reader (standalone Drawings menus include File, Edit, View, Insert, Format, Arrange, Tools, Table, Help and Accessibility).
- Google Docs Editors Help — Insert or delete images & videos (upload, URL, Drive/Photos, camera and web/stock source categories).
- Google Docs Editors Help — Remove image backgrounds in Google Drawings, Slides & Vids.
- Google Takeout / Docs Editors export documentation (named revisions and published revisions).

No Google application source code was copied. This is a Savanski implementation of documented workflows and editing behavior.
