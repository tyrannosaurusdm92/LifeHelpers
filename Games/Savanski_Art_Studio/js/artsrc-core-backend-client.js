(function(global){
'use strict';
const LF=global.SavanskiArtTools=global.SavanskiArtTools||{};
class BackendClient{
 constructor(){this.url=global.SAVANSKI_BACKEND?.serviceUrl||'';}
 service(){const b=global.SavanskiBackend;if(!b)throw new Error('Savanski routed backend is not initialized.');return b}
 health(){return this.service().ping()}
 saveArt(data){return this.service().saveProject(data)}
 listArt(){return this.service().listProjects()}
 getArt(id){return this.service().getProject(id)}
 library(q='',type='all'){return this.service().listLibrary(q,type)}
 call(action,data={}){const b=this.service();if(['ping','storageStatus','listLibrary','getLibraryFile','listProjects','getProject','appInstallInfo','aiBrainStatus'].includes(action))return b.get(action,data);if(['saveProject','saveBinary','aiBrain'].includes(action))return b.post(action,data);throw new Error('Unsupported action on routed Savanski backend: '+action)}
}
LF.BackendClient=BackendClient;
})(typeof window!=='undefined'?window:globalThis);
