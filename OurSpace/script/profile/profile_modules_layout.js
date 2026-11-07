/* Profile/About layout is permanently locked to json/profile/profile.json coordinates.
   No drag, resize, snap-grid, reordering, or saved-edit restoration. */
(()=>{'use strict';
 const root=document.documentElement;
 const page=new URLSearchParams(location.search).get('page')||'profile';
 if(page!=='profile')return;
 const ids=['profileTitle','profile-photo','profile-identity','profile-about','profile-contact','profile-donation','profile-tags','profile-interests','profile-music','profile-projects','networkNotice','profile-links','profile-posts','profile-guestbook','profile-gallery','profile-bulletins','profile-news'];
 window.OurSpaceProfileModulesLayout=Object.freeze({
  isAdmin:false,isLocked:true,moduleIds:Object.freeze(ids),
  get:()=>({profile:root.dataset.profile||'william',locked:true,moduleIds:[...ids]}),
  refresh:()=>{} // content controllers can request refresh without moving modules
 });
})();
