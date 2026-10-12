# Project AI Directory merge

This Work package keeps the ChatGPT-style Onyx Work shell and existing OurSpace Apps Script backend.

Merged donor concepts:
- project records with category/status/priority/tags/summary
- searchable and sortable project catalog
- drag/drop project reordering
- drag/drop subtab/channel reordering
- dropped-file metadata cataloging with inferred file kind
- project-to-channel linking
- category filtering
- non-destructive local metadata persistence

Intentionally excluded because they already exist elsewhere or violate the requested architecture:
- donor backend/Code.gs
- donor 3D studios, vendor libraries, images, and large asset catalogs
- duplicate Onyx brain/personality copies

The Work page references the existing Onyx GitHub brain assets and calls the existing OurSpace Apps Script endpoint.
