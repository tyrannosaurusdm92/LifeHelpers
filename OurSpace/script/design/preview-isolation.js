/* The preview runs the real demo document with a private, in-memory storage view.
   Install before the original OurSpace scripts so preview activity cannot save
   profile, widget, bulletin, or layout changes into the live Demo Account. */
(()=>{'use strict';
 if(!new URLSearchParams(location.search).has('os-layout-preview'))return;
 const nativeViews=new WeakMap();
 const mirrors=['localStorage','sessionStorage'].map(name=>{
  const data=new Map();let native;
  try{native=window[name];for(let i=0;i<native.length;i++){const key=native.key(i);if(key!==null)data.set(key,native.getItem(key))}}catch{}
  if(native&&typeof native==='object')nativeViews.set(native,data);
  return {name,data,native};
 });
 for(const {name,data,native} of mirrors){
  const shadow={get length(){return data.size},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(String(k))??null,setItem:(k,v)=>{data.set(String(k),String(v))},removeItem:k=>{data.delete(String(k))},clear:()=>data.clear()};
  try{Object.defineProperty(window,name,{configurable:true,value:shadow})}
  catch{
   /* Some browsers expose Storage as a fixed window property. The storage
      prototype belongs to this frame, so its methods can still be isolated. */
   const proto=window.Storage?.prototype;
   if(!proto||!native)throw Error('Preview storage could not be isolated');
   const get=target=>nativeViews.get(target)||data;
   Object.defineProperties(proto,{
    getItem:{configurable:true,value:function(k){return get(this).get(String(k))??null}},
    setItem:{configurable:true,value:function(k,v){get(this).set(String(k),String(v))}},
    removeItem:{configurable:true,value:function(k){get(this).delete(String(k))}},
    clear:{configurable:true,value:function(){get(this).clear()}},
    key:{configurable:true,value:function(i){return [...get(this).keys()][i]??null}},
    length:{configurable:true,get:function(){return get(this).size}}
   });
  }
 }
 let real;try{real=window.indexedDB}catch{}
 if(real){
  const prefix='ourspace-layout-preview-';
  const names=new Set(),connections=new Set();
  const open=real.open.bind(real),remove=real.deleteDatabase.bind(real);
  const isolated=(name,...args)=>{
   const privateName=prefix+String(name);names.add(privateName);
   const request=open(privateName,...args);
   request.addEventListener('success',()=>connections.add(request.result));
   return request;
  };
  const facade=new Proxy(real,{get(target,key){
   if(key==='open')return isolated;
   if(key==='deleteDatabase')return name=>remove(prefix+String(name));
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  }});
  try{Object.defineProperty(window,'indexedDB',{configurable:true,value:facade})}
  catch{
   Object.defineProperties(window.IDBFactory.prototype,{
    open:{configurable:true,value:function(name,...args){return isolated(name,...args)}},
    deleteDatabase:{configurable:true,value:function(name){return remove(prefix+String(name))}}
   });
  }
  addEventListener('pagehide',()=>{
   for(const db of connections)try{db.close()}catch{}
   for(const name of names)try{remove(name)}catch{}
  },{once:true});
 }
 // Preview sessions must not emit notifications into the live account or
 // commit changes to a connected service. Read-only GET/HEAD requests continue
 // to work; the actual (non-preview) Demo Account is never affected.
 if(typeof window.BroadcastChannel==='function'){
  const NativeChannel=window.BroadcastChannel;
  window.BroadcastChannel=class OurSpacePreviewChannel extends NativeChannel{
   constructor(name){super('ourspace-layout-preview:'+String(name))}
  };
 }
 const nativeFetch=typeof window.fetch==='function'?window.fetch.bind(window):null;
 if(nativeFetch)window.fetch=function(input,init){
  const method=String(init?.method||input?.method||'GET').toUpperCase();
  if(method!=='GET'&&method!=='HEAD')return Promise.reject(new DOMException('The layout preview is read-only.','NotAllowedError'));
  return nativeFetch(input,init);
 };
 if(typeof XMLHttpRequest!=='undefined'){
  const originalOpen=XMLHttpRequest.prototype.open,originalSend=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open=function(method,...args){this.__oslsReadOnlyMethod=String(method).toUpperCase();return originalOpen.call(this,method,...args)};
  XMLHttpRequest.prototype.send=function(...args){if(this.__oslsReadOnlyMethod!=='GET'&&this.__oslsReadOnlyMethod!=='HEAD')throw new DOMException('The layout preview is read-only.','NotAllowedError');return originalSend.apply(this,args)};
 }
 if(typeof navigator.sendBeacon==='function')try{Object.defineProperty(navigator,'sendBeacon',{configurable:true,value:()=>false})}catch{}
 window.__OurSpaceLayoutPreviewIsolated=true;
})();
