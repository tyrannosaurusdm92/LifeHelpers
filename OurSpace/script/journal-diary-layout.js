/* Journal & Diary is read-only here. Imported from the most recent user-supplied bulletin.json.
 * Store editing has moved to the Store page. Keep each tab's content in native flow. */
(()=>{'use strict';
 if(document.documentElement.dataset.ourspaceCurrentPage!=='journal'||!window.OurSpaceAuth?.authorize?.(document.documentElement.dataset.profile))return;
 const who=document.documentElement.dataset.profile,flow=document.getElementById('jdModuleFlow');if(!flow)return;
 const imported={"schema":"ourspace.journal-diary-placement.v1","version":1,"generatedAt":"2026-11-01T02:51:35.397Z","profile":"william","pages":{"journal":{"modules":{"journal":{"moduleId":"journal","index":0,"widthPx":1674,"heightPx":890,"offsetX":0,"offsetY":0,"flow":"normal"},"diary":{"moduleId":"diary","index":1,"widthPx":1674,"heightPx":1100,"offsetX":0,"offsetY":0,"flow":"normal"}}}},"profiles":{"william":{"pages":{"journal":{"modules":{"journal":{"moduleId":"journal","index":0,"widthPx":1674,"heightPx":890,"offsetX":0,"offsetY":0,"flow":"normal"},"diary":{"moduleId":"diary","index":1,"widthPx":1674,"heightPx":1100,"offsetX":0,"offsetY":0,"flow":"normal"}}}}}},"notes":"Journal and Diary Cards; native flow-based offsets, dimensions and per-tab modules. Existing profile bulletin board data is unchanged."};
 const defaults=imported.profiles?.william?.pages?.journal?.modules||imported.pages?.journal?.modules||{};
 const state={schema:'ourspace.journal-diary-placement.v1',version:1,profile:who,pages:{journal:{modules:{}}}};
 const persistedKey='ourspace.journal-diary.layout.v1.'+who;
 let saved=null;try{saved=JSON.parse(localStorage.getItem(persistedKey)||'null')}catch(_){}
 for(const id of ['journal','diary'])state.pages.journal.modules[id]={moduleId:id,index:id==='journal'?0:1,widthPx:1674,heightPx:id==='journal'?890:1100,offsetX:0,offsetY:0,flow:'normal',...(defaults[id]||{}),...(saved?.schema===state.schema?saved.pages?.journal?.modules?.[id]||{}:{})};
 const asNumber=(v,f=0)=>v===null||v===undefined||!Number.isFinite(Number(v))?f:Number(v);
 function apply(){const space=flow.clientWidth-asNumber(parseFloat(getComputedStyle(flow).paddingLeft))-asNumber(parseFloat(getComputedStyle(flow).paddingRight));const maxWidth=Math.max(130,space);
  for(const id of ['journal','diary']){const frame=document.getElementById(id==='journal'?'jdFrameJournal':'jdFrameDiary'),m=state.pages.journal.modules[id];if(!frame||!m)continue;
   const x=Math.max(0,Math.min(asNumber(m.offsetX),Math.max(0,maxWidth-130)));
   const w=Math.max(130,Math.min(asNumber(m.widthPx,maxWidth),maxWidth-x));
   frame.style.setProperty('--jd-frame-left',Math.round(x)+'px');frame.style.setProperty('--jd-frame-top',Math.max(0,asNumber(m.offsetY))+'px');frame.style.setProperty('--jd-frame-width',Math.round(w)+'px');frame.style.setProperty('--jd-frame-height',Math.max(180,asNumber(m.heightPx,id==='journal'?890:1100))+'px');
  }
 }
 window.addEventListener('resize',apply);apply();
 window.OurSpaceJournalDiaryLayout={get:()=>structuredClone(state),isAdmin:false,refresh:apply};
})();
