(function(global){
  'use strict';
  const preset = {"id":"canvas-portrait-8x10","label":"Canvas — Portrait 8 × 10 in","kind":"canvas","widthIn":8,"heightIn":10,"dpi":300,"widthPx":2400,"heightPx":3000};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
