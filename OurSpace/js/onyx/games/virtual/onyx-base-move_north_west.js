/* Onyx Pass 25: move_north_west; no duplicate animation engine. */
(function(root){
"use strict";
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseActions["move_north_west"]=function(options={}){
 const m=root.OnyxBaseMotion;
 if(!m)return {ok:false,error:"Onyx base runtime not initialized"};
 return m.walk("north_west", options.run===true||options.pace==="run"?"run":"walk");
};
})(typeof window!=="undefined"?window:globalThis);
