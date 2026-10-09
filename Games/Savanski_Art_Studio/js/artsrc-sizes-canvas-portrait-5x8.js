(function(global){
  'use strict';
  const preset = {"id":"canvas-portrait-5x8","label":"Canvas — Portrait 5 × 8 in","kind":"canvas","widthIn":5,"heightIn":8,"dpi":300,"widthPx":1500,"heightPx":2400};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
