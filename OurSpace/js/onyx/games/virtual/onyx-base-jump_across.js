/* Onyx Pass 25: jump_across; no duplicate animation engine. */
(function(root){
"use strict";
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseActions["jump_across"]=function(options={}){
 const m=root.OnyxBaseMotion;
 if(!m)return {ok:false,error:"Onyx base runtime not initialized"};
 return m.jump("jump_across",options);
};
})(typeof window!=="undefined"?window:globalThis);
