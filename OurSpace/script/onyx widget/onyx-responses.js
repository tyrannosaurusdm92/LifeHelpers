/**
 * Work-only loader for the complete Pass 7 response generator. It lazily imports
 * the maintained ESM source after Voice Library opens, so deployed fixes use the
 * same files that are tested; the integrated page and widget stylesheet remain
 * the only runtime shell.
 */
(() => {
  'use strict';
  let loading = null;
  const open = async () => {
    const dialog = document.getElementById('onyxVoiceDialog');
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    if (!loading) {
      const moduleUrl = new URL('./response-generator/generator-app.js', import.meta.url).href;
      loading = import(moduleUrl).then(() => ({loaded:true,source:'maintained-modules'})).catch(error => {
        loading = null;
        const status = document.getElementById('status') || document.getElementById('onyxVoiceStatus');
        if (status) status.textContent = 'The response generator modules could not load: ' + String(error?.message || error);
        throw error;
      });
    }
    return loading;
  };
  const button = document.getElementById('onyxVoiceOpen');
  button?.addEventListener('click', () => { open().catch(() => {}); });
  window.OnyxResponseWorkshop = Object.freeze({ open });
})();
