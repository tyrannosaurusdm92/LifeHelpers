/* Onyx Pass 25: sleep; no duplicate animation engine. */
(function(root){
"use strict";
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseActions["sleep"]=function(options={}){
 const m=root.OnyxBaseMotion;
 if(!m)return {ok:false,error:"Onyx base runtime not initialized"};
 return m.perform("sleep",options);
};
})(typeof window!=="undefined"?window:globalThis);
