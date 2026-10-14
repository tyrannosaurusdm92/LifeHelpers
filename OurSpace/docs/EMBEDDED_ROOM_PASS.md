# Embedded Room / Weather / Asset Pass

This build opens directly on the supplied 1916×821 room image. The image remains replaceable, but no initial upload is required.

## Back-wall weather iframe

A single sequential-video iframe spans the entire back-wall rectangle behind the room image. It is intentionally behind the base image rather than duplicated per window. The base-image mask contains 20 pane cutouts corresponding to the two windows and the French-door glazing, so the same continuous scene is visible through every pane. The playlist advances on `ended` and wraps to the first video forever. Video is muted so browser autoplay can work reliably.

The built-in weather layer starts locked to avoid accidental movement. It can be unlocked from Layers.

## Asset library

The Assets generator menu exposes the supplied room SVGs and fish SVGs. Adding one creates a regular polygon iframe object that can be selected from Layers, moved, resized, transformed, grouped, and ordered like other frames.

Interactive room SVGs are not rasterized. They load directly as iframe documents so their embedded JavaScript, color controls, fan/lamp interactions, and embedded audio remain active. Copied SVG roots were normalized to `width="100%"`, `height="100%"`, `preserveAspectRatio="xMidYMid meet"`, and hidden overflow to prevent iframe scroll bars without removing their interactivity.

Use the Iframes menu toggle to enable content interaction. Turn it off temporarily when direct canvas dragging is more convenient; the Layers menu can always select an iframe while interaction is enabled.

## Fish animation

The four fish SVGs can be inserted individually. `Load all fish into animation buffer` prepares them for the existing transparent-asset animation system. `Add animated fish zone` creates a pre-sized aquarium-region frame with all four built-in fish moving, bouncing, flipping when direction changes, and staying within the polygon iframe.

## CSS AC switch + wind

The supplied on/off AC recording is retained, with short start/end clips derived for switch actions. The wall-AC recording is used as the running loop.

The AC switch and wind simulation are separate movable polygon frames. The switch is a CSS slider rendered in an iframe. Toggling it sends a `postMessage` to the editor, which synchronizes every CSS wind frame. Wind uses CSS-only animated streaks and is transparent when the AC is off.

The default switch is placed over the visible wall AC control area, while the default wind field is placed in front of the unit. Both can be moved/resized independently.
