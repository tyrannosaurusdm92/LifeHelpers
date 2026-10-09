(function(){
'use strict';
const state={registration:null,error:null};
async function register(){
  if(!('serviceWorker' in navigator))return null;
  if(!/^https?:$/.test(location.protocol))return null;
  try{
    const reg=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});
    state.registration=reg;
    reg.update?.().catch(()=>{});
    window.dispatchEvent(new CustomEvent('savanski:pwa-service-worker',{detail:{ready:true,scope:reg.scope}}));
    return reg;
  }catch(error){
    state.error=error;
    console.warn('Savanski service worker registration failed',error);
    window.dispatchEvent(new CustomEvent('savanski:pwa-service-worker',{detail:{ready:false,error:String(error&&error.message||error)}}));
    return null;
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',register,{once:true});else register();
window.SavanskiPWA=Object.freeze({register,get registration(){return state.registration},get error(){return state.error}});
})();
