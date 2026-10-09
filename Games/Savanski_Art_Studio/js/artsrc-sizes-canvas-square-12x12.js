(function(global){
  'use strict';
  const preset = {"id":"canvas-square-12x12","label":"Canvas — Square 12 × 12 in","kind":"canvas","widthIn":12,"heightIn":12,"dpi":300,"widthPx":3600,"heightPx":3600};
  global.SavanskiCanvasSizePresets = global.SavanskiCanvasSizePresets || {};
  global.SavanskiCanvasSizePresets[preset.id] = Object.freeze(preset);
  global.dispatchEvent?.(new CustomEvent('savanski:canvas-size-preset-registered', {detail:preset}));
})(typeof window !== 'undefined' ? window : globalThis);
