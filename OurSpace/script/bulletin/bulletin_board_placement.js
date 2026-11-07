/* Bulletin: no independent placement/resize pass. The saved profile grid controls
   x, y, width and height; original pinboard workspace retains its heart scrollbar. */
(()=>{'use strict';
 const section=document.getElementById('profile-bulletins');if(!section)return;
 window.OurSpaceBulletinLayout={
   get:()=>({profile:document.documentElement.dataset.profile,widthPx:section.getBoundingClientRect().width,heightPx:section.getBoundingClientRect().height,editing:!!window.OurSpaceProfileGridEditorActive}),
   apply:()=>false,isAdmin:false,refresh:()=>window.OurSpaceEmbeddedProfileFit?.refresh?.()
 };
})();
