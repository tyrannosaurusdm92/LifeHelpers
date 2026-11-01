(()=>{'use strict';
const get=tab=>document.getElementById(tab==='work'?'onyxWorkFullscreenFrame':tab==='professor'?'onyxProfessorFullscreenFrame':tab==='leisure'?'onyxLeisureGameFrame':'slowPetGame');
function load(tab){const e=get(tab);if(!e)return null;e.hidden=false;return e;}
function focus(tab){const e=load(tab);if(e)e.focus();return e;}
window.OnyxFullscreenShells=Object.freeze({load,focus,frameFor:get});
})();