/**
 * Work-only loader for the complete Pass 7 response generator. It loads the
 * compiled source package after Voice Library opens; the generator markup is
 * already inside the existing widget page and all visual rules come from the
 * existing Onyx widget stylesheet.
 */
(() => {
  'use strict';
  let loading = null;
  const open = async () => {
    const dialog = document.getElementById('onyxVoiceDialog');
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = new URL('./response-generator/standalone-bundle.generated.js', import.meta.url).href;
        script.async = true;
        script.dataset.onyxPass7 = 'true';
        script.onload = () => resolve(window.__ONYX_WORKSHOP_CHECK?.() || true);
        script.onerror = () => reject(new Error('The Pass 7 response bundle could not be fetched.'));
        document.head.append(script);
      }).catch(error => {
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
