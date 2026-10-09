(function(global){
  'use strict';
  const preset = {"id":"canvas-portrait-6x9","label":"Canvas — Portrait 6 × 9 in","kind":"canvas","widthIn":6,"heightIn":9,"dpi":300,"widthPx":1800,"heightPx":2700};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
