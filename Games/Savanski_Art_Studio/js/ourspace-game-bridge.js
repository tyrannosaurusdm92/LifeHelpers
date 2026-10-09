(function(global){
'use strict';
const GAME_ID='savanski-art-studio';
const backend=()=>global.SavanskiOurSpaceBackend;
const $=s=>document.querySelector(s);
function embedded(){return global.parent&&global.parent!==global;}
function post(type,payload={}){if(!embedded())return;global.parent.postMessage({type,gameId:GAME_ID,...payload},'*');}
function status(text,state='local'){const el=$('#ourspaceStatus');if(el){el.textContent=text;el.dataset.state=state;}}
function applyContext(data){
  // This routed backend does not accept OurSpace session tokens as authentication.
  if(data.theme==='dark'||data.theme==='light')document.documentElement.dataset.theme=data.theme;
  status('OurSpace frame linked; Savanski Drive uses its own identity','local');
}
function closeGame(){post('ourspace:game-close-request');if(!embedded())global.LFStudio?.showLauncher?.();}
global.addEventListener('message',event=>{
  if(!embedded()||event.source!==global.parent)return;
  const d=event.data||{};if(d.gameId&&d.gameId!==GAME_ID)return;
  if(d.type==='ourspace:game-context')applyContext(d);
  if(d.type==='ourspace:theme'&&(d.theme==='dark'||d.theme==='light'))document.documentElement.dataset.theme=d.theme;
  if(d.type==='ourspace:game-save')global.LFStudio?.action?.('save');
});
global.addEventListener('savanski:ourspace-context',e=>{const c=e.detail||{};status('OurSpace frame linked; Savanski Drive uses its own identity','local');});
document.addEventListener('DOMContentLoaded',()=>{
  const back=$('#ourspaceBackBtn');if(back){back.hidden=!embedded();back.addEventListener('click',closeGame);}
  if(embedded()){document.body.classList.add('ourspace-embedded');post('ourspace:game-ready',{version:global.SAVANSKI_BACKEND?.version||'',capabilities:['local-save','ourspace-backup','image-export','studio','3d-editor','sculpt','paint','sprite-capture']});status('OurSpace frame linked; Savanski Drive separate','local');}
  else {const c=backend()?.context;status('OurSpace: linked frame','local');}
});
global.SavanskiOurSpaceGame={gameId:GAME_ID,post,closeGame};
})(window);
