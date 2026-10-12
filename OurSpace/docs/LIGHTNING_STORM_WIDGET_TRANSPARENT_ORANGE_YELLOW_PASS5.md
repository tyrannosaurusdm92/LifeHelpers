# Lightning Storm Widget-Only Correction — Pass 5

## Scope
This pass implements the bright orange/yellow/cyan Lightning Storm palette from
website_template_lightning(20261009-052030).html for the Onyx widget and
its optional Work fullscreen color bridge. It DOES NOT alter Feed Him MEOW,
Happy Home/Botanical Garden, their game CSS/JS, assets, or embedded game documents.

## Widget colors (new defaults)
Orange #EC5800, yellow #FFF600, cyan #7AFFFF, pale cyan #C7FFFF,
deep-brown header #712A00, and copper-border #AA3F00. Auto, Light, Dark and
Custom remain available. Dark now uses brown, orange, and yellow, not dark blue.
Alternating orange/yellow tabs, contrasting headers, electric copper shadows.

## Transparency
The root html/body and standalone viewport are transparent rather than
painting a fake OurSpace backdrop. Only the actual Onyx widget/panels and
fullscreen interfaces paint their own surfaces. If embedding in a host iframe,
set the host iframe background:transparent and do not give the iframe a solid
container backdrop. A fullscreen transparent iframe can still capture clicks
on the host page; for true click-through overlay, integrate the widget directly
into the host DOM or structure the iframe overlay around the clickable widget.
The OurSpace host must mount the overlay on profile pages, NOT on the
portal/sign-in view. Host routing files were not in this archive.

## Customization
26 hex inputs, 26 color pickers, preset export/import, and existing keys remain.
Only *exact* saved default blue palettes from Pass 4 are migrated; modified
user-owned palettes remain untouched. Use Design > Reset for bright defaults
if you intentionally saved a custom blue look.

## Work
The Design palette remains bridged to Work fullscreen. The Work currency
badge remains in the Projects & Catalog header, not floating above it.
Work text now computes readable color on the brown header.

## Validation
Static: JavaScript syntax, JSON parsing, CSS parsing, unchanged asset hashes,
ZIP integrity. Browser widget test: body transparent; orange/yellow tabs;
correct brown header contrast; custom border accepts a new hex color.
No live game or full OurSpace host integration test was executed.
