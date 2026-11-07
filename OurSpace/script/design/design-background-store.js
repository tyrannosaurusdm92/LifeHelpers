/* OurSpace original-image background storage.
 * External URLs are NEVER rewritten. Uploaded image file bytes are preserved
 * either in an original data: URL or in IndexedDB (not recompressed).
 */
(function(){'use strict';
 const DB_NAME='OurSpaceBackgroundUploads';const VERSION=1;const STORE='originals';
 const PREFIX='ourspace-bg:';const urls=new Map(),pending=new Map();let dbPromise;
 function openDB(){if(!window.indexedDB)return Promise.reject(Error('IndexedDB unavailable'));
  if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,VERSION);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'key'})};
   req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Background database failed'));
  }).catch(err=>{dbPromise=null;throw err});return dbPromise;
 }
 function isLocal(ref){return typeof ref==='string'&&ref.startsWith(PREFIX)}
 function validImage(file){return !!file&&/^image\/(png|jpeg|webp|gif|avif|bmp|svg\+xml)$/i.test(file.type)&&file.size>0}
 function fileData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
 async function save(file){if(!validImage(file))throw Error('Choose a supported image file.');
  // Small files are self-contained and portable in exported design JSON.
  // No re-encoding, resizing or GIF animation loss occurs.
  if(file.size<=650000)return fileData(file);
  const key=PREFIX+(crypto.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2));
  try{
   const db=await openDB();await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put({key,blob:file,name:file.name||'',type:file.type,size:file.size,storedAt:Date.now()});
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Could not store original image'));tx.onabort=()=>reject(tx.error||Error('Background upload canceled'))});
   urls.set(key,URL.createObjectURL(file));return key;
  }catch(error){
   // The local file:// protocol and privacy modes sometimes prohibit IndexedDB.
   // Still allow the original file to appear, with a self-contained data URL.
   const data=await fileData(file);
   document.dispatchEvent(new CustomEvent('ourspace:background-storage-warning',{detail:{reason:String(error?.message||error)}}));
   return data;
  }
 }
 function resolve(ref){if(!isLocal(ref))return ref||'';return urls.get(ref)||''}
 async function ensure(key){if(!isLocal(key))return key||'';if(urls.has(key))return urls.get(key);
  if(pending.has(key))return pending.get(key);
  const p=(async()=>{const db=await openDB();const row=await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Image missing'))});
   if(!row?.blob)throw Error('Original uploaded image is unavailable in this browser');
   const url=URL.createObjectURL(row.blob);urls.set(key,url);document.dispatchEvent(new CustomEvent('ourspace:background-ready',{detail:{key}}));return url;
  })().finally(()=>pending.delete(key));pending.set(key,p);return p;
 }
 function warm(styles){if(!styles)return;for(const s of Object.values(styles)){if(s&&typeof s==='object'&&isLocal(s.image))ensure(s.image).catch(()=>document.dispatchEvent(new CustomEvent('ourspace:background-missing',{detail:{key:s.image}})));}}
 window.OurSpaceBackgroundStore=Object.freeze({save,resolve,ensure,warm,isLocal,validImage,fileData});
})();

