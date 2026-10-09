/* Public frontend contract for the existing routed Apps Script deployment.
   No server code or AI-Brain secrets belong in the frontend. */
window.SAVANSKI_BACKEND = Object.freeze({
  appName: 'Savanski Art Studio',
  shortName: 'Savanski Studio',
  appId: 'savanski-art-studio',
  version: '2026.10.09-v3-routed-sas-pwa',
  serviceUrl: 'https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec',
  publicAppUrl: 'https://thetransgendertrex.com/Savanski_Art_Studio',
  route: 'Savanski_Art_Studio',
  maxInlineBytes: 8 * 1024 * 1024,
  sharedLibraryDriveUrl: 'https://drive.google.com/drive/folders/172HDX8KoXIS9lvAOpMxVYz6HrDQMlr-k',
  storageModes: ['shared','personal'],
  getActions: ['ping','storageStatus','listLibrary','getLibraryFile','listProjects','getProject','appInstallInfo','aiBrainStatus'],
  postActions: ['ping','saveProject','saveBinary','aiBrain','aiBrain.request'],
  noFrontendAccountAuth: true,
  personalConnectorNeedsSeparateDeployment: true,
  aiCredentialsServerSideOnly: true
});
