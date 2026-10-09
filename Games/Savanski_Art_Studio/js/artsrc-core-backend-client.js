(function(global){
 'use strict'; const LF=global.SavanskiArtTools;
 class BackendClient{
  constructor(url=(global.SAVANSKI_BACKEND&&global.SAVANSKI_BACKEND.serviceUrl)||''){this.url=url;}
  token(){return global.SavanskiOurSpaceBackend?.context?.sessionToken||'';}
  async call(action,data={}){if(global.SavanskiOurSpaceBackend)return global.SavanskiOurSpaceBackend.request(action,data);const r=await fetch(this.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,sessionToken:this.token(),data}),redirect:'follow',cache:'no-store'});const t=await r.text();let out;try{out=JSON.parse(t)}catch{throw new Error(`OurSpace returned non-JSON output (${r.status}).`)}if(!r.ok||out.ok===false)throw new Error(out?.error?.message||out?.message||'OurSpace request failed');return out;}
  health(){return global.SavanskiOurSpaceBackend?.health?.()||this.call('health',{});}
  saveArt(data){return this.call('record.save',{bucket:'games.savanski-art-studio-art',key:data?.id||data?.projectId||String(Date.now()),value:data});}
  listArt(){return this.call('record.list',{bucket:'games.savanski-art-studio-art'});}
 }
 LF.BackendClient=BackendClient;
})(typeof window!=='undefined'?window:globalThis);
