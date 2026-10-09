(function(global){
  'use strict';
  const preset = {"id":"canvas-square-10x10","label":"Canvas — Square 10 × 10 in","kind":"canvas","widthIn":10,"heightIn":10,"dpi":300,"widthPx":3000,"heightPx":3000};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
