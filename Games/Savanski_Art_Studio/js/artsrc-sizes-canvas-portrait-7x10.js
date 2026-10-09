(function(global){
  'use strict';
  const preset = {"id":"canvas-portrait-7x10","label":"Canvas — Portrait 7 × 10 in","kind":"canvas","widthIn":7,"heightIn":10,"dpi":300,"widthPx":2100,"heightPx":3000};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
