/* Onyx Pass 25: eat_drink; no duplicate animation engine. */
(function(root){
"use strict";
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseActions["eat_drink"]=function(options={}){
 const m=root.OnyxBaseMotion;
 if(!m)return {ok:false,error:"Onyx base runtime not initialized"};
 return m.perform("eat_drink",options);
};
})(typeof window!=="undefined"?window:globalThis);
