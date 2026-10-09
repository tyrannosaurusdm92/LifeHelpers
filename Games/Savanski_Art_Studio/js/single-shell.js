(function(){
'use strict';
const $=s=>document.querySelector(s);
function bindHomeBridge(){
  $('#launcherOpen3D')?.addEventListener('click',e=>{if(window.SavanskiProjectLibrary){e.preventDefault();window.SavanskiProjectLibrary.setMode('3d');}});
  $('#launcher3DTab')?.addEventListener('click',e=>{if(window.SavanskiProjectLibrary){e.preventDefault();window.SavanskiProjectLibrary.setMode('3d');}});
  $('#launcherStudioTab')?.addEventListener('click',e=>{if(window.SavanskiProjectLibrary){e.preventDefault();window.SavanskiProjectLibrary.setMode('studio');}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindHomeBridge);else bindHomeBridge();
})();
