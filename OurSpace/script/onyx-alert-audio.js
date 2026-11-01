/* Three-category strict audio gate: no notification audio for any other class. */
(()=>{'use strict';
 const CLIPS=Object.freeze({pet:'../../assets/alerts/onyx-pet-care.wav',selfcare:'../../assets/alerts/onyx-self-care.wav',therapy:'../../assets/alerts/onyx-therapy-session.wav'});
 function category(record){
  if(!record)return null;
  const r=typeof record==='string'?{kind:record}:record;
  if(typeof r!=='object')return null;
  const raw=String(r.alertKind||r.kind||r.type||r.category||r.notificationType||r.payload?.kind||r.payload?.type||'').toLowerCase().trim().replace(/[.\s-]+/g,'_');
  if(/^(onyx_)?(pet|virtual_pet|pet_care|pet_needs|pet_reminder|feed_pet|care_pet)$/.test(raw))return'pet';
  if(/^(onyx_)?(selfcare|self_care|self_care_reminder|selfcare_reminder|self_care_nudge|selfcare_nudge)$/.test(raw))return'selfcare';
  if(/^(onyx_)?(therapy|therapy_session|therapy_reminder|scheduled_therapy|therapy_alert)$/.test(raw))return'therapy';
  return null;
 }
 let lastAt=0,active=null;
 function play(record,{force=false}={}){
  const type=category(record);if(!type)return false;
  const pref=window.OurSpaceOnyxAlerts?.getPreferences?.();
  if(pref&&pref.sound===false)return false;
  if(!force&&Date.now()-lastAt<1250)return false;lastAt=Date.now();
  try{active?.pause();active=new Audio(CLIPS[type]);active.preload='auto';active.volume=.55;active.play().catch(()=>{});return true;}catch(_){return false}
 }
 window.OnyxAlertAudio=Object.freeze({category,play,clips:CLIPS});
})();
