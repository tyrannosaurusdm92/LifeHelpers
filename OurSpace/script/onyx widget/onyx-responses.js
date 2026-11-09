/**
 * Work-only loader for the full Pass 7 response generator. The module graph is
 * fetched after the user opens Voice Library; nothing is mounted in the bubble,
 * Leisure, Virtual & Health, or Professor surfaces. All visual rules come from
 * the existing Onyx widget stylesheet.
 */
(() => {
  'use strict';
  let loading = null;
  const open = async () => {
    const dialog = document.getElementById('onyxVoiceDialog');
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    if (!loading) {
      loading = import('./response-generator/generator-app.js').catch(error => {
        loading = null;
        const status = document.getElementById('status') || document.getElementById('onyxVoiceStatus');
        if (status) status.textContent = 'The complete response generator could not load: ' + String(error?.message || error);
        throw error;
      });
    }
    return loading;
  };
  const button = document.getElementById('onyxVoiceOpen');
  button?.addEventListener('click', () => { open().catch(() => {}); });
  window.OnyxResponseWorkshop = Object.freeze({ open });
})();
