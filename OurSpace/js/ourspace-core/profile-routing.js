/* Include this script from the existing project-root ourspace.html after successful sign-in.
   It does not perform authentication or create substitute login accounts. */
(function (global) {
  'use strict';
  const DESTINATIONS = Object.freeze({
    william: 'assets/code/william.html',
    jasper: 'assets/code/jasper.html'
  });
  function canonical(value) {
    const name = String(value || '').trim().toLowerCase();
    if (name === 'william' || name === 'dino') return 'william';
    if (name === 'jasper' || name === 'squishy') return 'jasper';
    return '';
  }
  const SITE_ROOT = new URL("../../", document.currentScript?.src || new URL("./", global.location.href));
  function urlFor(value) {
    const key = canonical(value);
    return key ? new URL(DESTINATIONS[key], SITE_ROOT).href : '';
  }
  function afterSignIn(signedInProfile) {
    const target = urlFor(signedInProfile);
    if (!target) return false;
    global.location.assign(target);
    return true;
  }
  function fromDetail(detail) {
    if (!detail || detail.authenticated === false || detail.ok === false || detail.success === false) return '';
    return canonical(detail.profileKey || detail.profile || detail.user?.profileKey ||
      detail.user?.profile || detail.session?.profileKey || detail.account?.profileKey);
  }
  // Existing portals may publish a sign-in completion event.
  ['ourspace:sign-in-success', 'ourspace:login-success', 'ourspace:auth-success'].forEach(function (eventName) {
    global.addEventListener(eventName, function (event) {
      const key = fromDetail(event.detail);
      if (key) afterSignIn(key);
    });
  });
  global.OurSpaceProfileRoutes = Object.freeze({ canonical, urlFor, afterSignIn });
})(window);
