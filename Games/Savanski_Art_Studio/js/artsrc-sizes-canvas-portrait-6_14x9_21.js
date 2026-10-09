(function(global){
  'use strict';
  const preset = {"id":"canvas-portrait-6_14x9_21","label":"Canvas — Portrait 6.14 × 9.21 in","kind":"canvas","widthIn":6.14,"heightIn":9.21,"dpi":300,"widthPx":1842,"heightPx":2763};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
