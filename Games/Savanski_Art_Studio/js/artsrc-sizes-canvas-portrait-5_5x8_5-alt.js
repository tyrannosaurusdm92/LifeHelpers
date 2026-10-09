(function(global){
  'use strict';
  const preset = {"id":"canvas-portrait-5_5x8_5-alt","label":"Canvas — Portrait 5.5 × 8.5 in","kind":"canvas","widthIn":5.5,"heightIn":8.5,"dpi":300,"widthPx":1650,"heightPx":2550};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
