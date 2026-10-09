(function(global){
  'use strict';
  const preset = {"id":"canvas-landscape-10x8","label":"Canvas — Landscape 10 × 8 in","kind":"canvas","widthIn":10,"heightIn":8,"dpi":300,"widthPx":3000,"heightPx":2400};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
