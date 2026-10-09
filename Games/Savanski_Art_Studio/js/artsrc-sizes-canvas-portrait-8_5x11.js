(function(global){
  'use strict';
  const preset = {"id":"canvas-portrait-8_5x11","label":"Canvas — Portrait 8.5 × 11 in","kind":"canvas","widthIn":8.5,"heightIn":11,"dpi":300,"widthPx":2550,"heightPx":3300};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
