window.OURSPACE_CONFIG = {
  BACKEND_URL: "https://script.google.com/macros/library/d/1Ld-KR6PrFPTBs1qsdAsZ55kBUa9QRYIkLgidknvgJ-2PLtujf9D-Mt6A/1",
  ONYX_FULL_BACKEND_URL: "https://script.google.com/macros/library/d/1OtngPSoPXDpeYa8FDD9bb7rU_0mvFvD_23niUCrfy09t5Mbk0cy0kV5l/1",
  ONYX_ALERTS_BACKEND_URL: "https://script.google.com/macros/library/d/1OtngPSoPXDpeYa8FDD9bb7rU_0mvFvD_23niUCrfy09t5Mbk0cy0kV5l/1",
  SESSION_KEY: "ourspace.session.v2",
  PROFILE_ROUTES: {
    jasper: "squishy-cottage.html",
    william: "dino-nerdzone.html"
  },
  PROFILE_LABELS: {
    jasper: "Squishy Cottage",
    william: "Dino Nerdzone"
  }
};

window.OURSPACE_BACKEND_URL = window.OURSPACE_CONFIG.BACKEND_URL;
window.OURSPACE_ONYX_FULL_BACKEND_URL = window.OURSPACE_CONFIG.ONYX_FULL_BACKEND_URL;
window.OURSPACE_ONYX_ALERTS_BACKEND_URL = window.OURSPACE_CONFIG.ONYX_ALERTS_BACKEND_URL;
window.ONYX_BACKEND_CONFIG = Object.assign({
  mainBackendUrl: window.OURSPACE_BACKEND_URL,
  onyxFullBackendUrl: window.OURSPACE_ONYX_FULL_BACKEND_URL,
  onyxAlertsBackendUrl: window.OURSPACE_ONYX_ALERTS_BACKEND_URL,
  directAppsScript: true,
  staticBase: "onyx/"
}, window.ONYX_BACKEND_CONFIG || {});
