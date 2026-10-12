# Discord Layout Reference Pass

This Onyx layout pass uses structural ideas from Discord-clone repositories supplied with the development request. Onyx remains a standalone grayscale module; no Discord branding, colors, server semantics, authentication, or backend code were added.

## MIT-licensed references used

### discord-clone-main (3) — Issam Seghir, MIT License
Adapted ideas: a full-height main shell; a message region that is the flexible scrolling child; near-bottom message auto-follow rather than forcibly snapping the reader to the bottom after every update.

### discord-clone-main (6) — Maheshnath09, MIT License
Adapted ideas: a fixed/full-height application layout where the navigation region and main conversation region remain structurally separate, with overflow constrained to the content area rather than the entire page.

The implementation in Onyx is rewritten in the project's existing plain HTML/CSS/JavaScript architecture and preserves Onyx-specific behavior. The original MIT license notices from the supplied repositories are reproduced below because this pass intentionally adapts their layout concepts.

## MIT License — Issam Seghir

Copyright (c) 2023 Issam Seghir

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## MIT License — Maheshnath09

Copyright (c) 2024 Maheshnath09

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Server / Channel layout pass

The four conversational tabs now deliberately map to Discord-style information architecture without copying Discord branding: **Virtual Pet, Health, Leisure, and Work are independent servers**, while each locally saved Onyx conversation inside a tab is presented as a **channel**. The Design tab is intentionally excluded from server semantics.

The supplied clone references were reviewed again for these structural behaviors: a server-scoped channel rail, compact channel rows with active-state treatment, independent scrolling of the channel list and message log, a fixed conversation header/composer around a flexible message region, and responsive conversion of a vertical channel rail into a horizontally scrollable mobile rail. The implementation is rewritten in the existing plain HTML/CSS/JavaScript Onyx architecture and keeps the grayscale design system.

## Bottom-drag resizing

The supplied `bottom-drag-textareas` reference is incorporated conceptually and extended. All textareas retain native vertical bottom-edge resizing. In addition, Onyx now provides full-width bottom drag grips for the opened widget, each server workspace, each active message viewport, and the Design workspace. The handles support pointer/touch dragging, keyboard Arrow Up/Down sizing, Home to reset, End to expand, and double-click to reset. The 190×190 bubble itself remains fixed-size; resizing the “widget” means resizing the opened module.
