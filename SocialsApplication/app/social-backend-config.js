(function (global) {
  'use strict';

  function decodeEndpoint(value) {
    try { return atob(value); } catch (error) { return ''; }
  }

  global.SOCIAL_APPLICATION_BACKEND_URL = decodeEndpoint('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6a3dpbUc2c1laUlhMalFhZmF1V2dadHhCVFduZUJqVWpwblV0MnlHbE9QN0Ewa3IwODBic3JQaUdoM2gxYjVTUlkvZXhlYw==');
  global.SOCIAL_APPLICATION_BACKEND_DEPLOYMENT_ID = '';
})(window);
