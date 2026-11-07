(()=>{'use strict';
const get=tab=>document.getElementById(tab==='work'?'onyxWorkFullscreenFrame':tab==='professor'?'onyxProfessorFullscreenFrame':tab==='leisure'?'onyxLeisureGameFrame':'onyxHealthGameFrame');
function load(tab){const e=get(tab);if(!e)return null;e.hidden=false;if(tab==='health'&&e.tagName==='IFRAME'&&(e.getAttribute('src')==='about:blank'||!e.getAttribute('src')))e.src=e.dataset.gameSrc||'assets/code/game.html';return e;}
function focus(tab){const e=load(tab);if(e)e.focus();return e;}
window.OnyxFullscreenShells=Object.freeze({load,focus,frameFor:get});
})();