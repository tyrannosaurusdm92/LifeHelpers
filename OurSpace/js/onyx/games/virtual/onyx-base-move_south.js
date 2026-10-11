/* Onyx Pass 25: move_south; no duplicate animation engine. */
(function(root){
"use strict";
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseActions["move_south"]=function(options={}){
 const m=root.OnyxBaseMotion;
 if(!m)return {ok:false,error:"Onyx base runtime not initialized"};
 return m.walk("south", options.run===true||options.pace==="run"?"run":"walk");
};
})(typeof window!=="undefined"?window:globalThis);
