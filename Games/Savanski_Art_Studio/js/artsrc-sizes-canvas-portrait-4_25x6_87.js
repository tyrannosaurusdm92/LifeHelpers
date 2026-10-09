(function(global){
  'use strict';
  const preset = {"id":"canvas-portrait-4_25x6_87","label":"Canvas — Portrait 4.25 × 6.87 in","kind":"canvas","widthIn":4.25,"heightIn":6.87,"dpi":300,"widthPx":1275,"heightPx":2061};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
