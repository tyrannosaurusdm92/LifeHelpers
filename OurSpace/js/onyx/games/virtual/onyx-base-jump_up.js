/* Onyx Pass 25: jump_up; no duplicate animation engine. */
(function(root){
"use strict";
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseActions["jump_up"]=function(options={}){
 const m=root.OnyxBaseMotion;
 if(!m)return {ok:false,error:"Onyx base runtime not initialized"};
 return m.jump("jump_up",options);
};
})(typeof window!=="undefined"?window:globalThis);
