/* Preserve existing profile records when replacing the old MySpace-style sections.
   Migrates to new module keys only if the replacement has no data yet. */
(()=>{'use strict';const params=new URLSearchParams(location.search);if((params.get('page')||'profile')!=='profile'||params.get('public')==='1')return;
const who=document.documentElement.dataset.profile||'william';
function mapLegacy(old){if(!old||typeof old!=='object')return {};const rows={};
 rows.profile_identity=[{displayName:old.displayName||'',headline:old.headline||'',about:old.about||'',imageUrl:old.avatar||''}].filter(x=>Object.values(x).some(Boolean));
 rows.profile_about=old.about?[{bio:old.about,details:old.hereFor||''}]:[];
 rows.profile_tags=old.tags?[{tags:old.tags}]:[];
 rows.profile_posts=(old.posts||[]).filter(x=>x&&typeof x==='object').map(x=>({text:x.body||x.title||'',date:x.date||'',image:''}));
 rows.carousel_gallery_module=(old.gallery||[]).filter(x=>x&&typeof x==='object').map(x=>({image:x.url||'',caption:x.title||''}));
 rows.guestbook=(old.comments||[]).filter(x=>x&&typeof x==='object').map(x=>({name:x.name||'Guest',sticker:'💌',text:x.body||''}));
 rows.current_projects=(old.projects||[]).filter(x=>x&&typeof x==='object').map(x=>({title:x.title||'',status:'Active',url:x.url||'',description:x.body||''}));
 rows.profile_interests=[['Music',old.musicInterest],['Movies',old.movieInterest],['Books',old.bookInterest],['Games',old.gameInterest]].filter(x=>x[1]).map(([category,item])=>({category,item}));
 return rows}
function migrate(data){const all=window.OurSpaceModuleControllers||{},entries=mapLegacy(data);let count=0;for(const [id,records] of Object.entries(entries)){if(records.length&&all[id]?.importLegacy?.(records))count+=records.length}if(count){window.OurSpaceModuleFeatures?.refresh?.();window.dispatchEvent(new CustomEvent('ourspace:profile-modules-migrated',{detail:{profile:who,count}}))}return count}
try{const stored=JSON.parse(localStorage.getItem('ourspace.admin.preview.profile.'+who)||'null');if(stored)migrate(stored)}catch(_){}
window.OurSpaceModuleMigration={migrate};
})();
