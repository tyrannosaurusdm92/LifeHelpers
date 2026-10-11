/* Onyx Pass 25: move_west; no duplicate animation engine. */
(function(root){
"use strict";
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseActions["move_west"]=function(options={}){
 const m=root.OnyxBaseMotion;
 if(!m)return {ok:false,error:"Onyx base runtime not initialized"};
 return m.walk("west", options.run===true||options.pace==="run"?"run":"walk");
};
})(typeof window!=="undefined"?window:globalThis);
