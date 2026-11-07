/* Record player: module placement and dimensions are owned by profile.json (locked).
   The content-fit service scales the original player INSIDE that unchanged frame. */
(()=>{'use strict';
 const section=document.getElementById('profile-music');if(!section)return;
 window.OurSpaceRecordPlayerLayout={
   get:()=>({profile:document.documentElement.dataset.profile,widthPx:section.getBoundingClientRect().width,heightPx:section.getBoundingClientRect().height,editing:!!window.OurSpaceProfileGridEditorActive}),
   refresh:()=>window.OurSpaceEmbeddedProfileFit?.refresh?.(),isAdmin:false
 };
})();
