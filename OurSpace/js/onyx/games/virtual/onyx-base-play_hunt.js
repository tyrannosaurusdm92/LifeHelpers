/* Onyx Pass 25: play_hunt; no duplicate animation engine. */
(function(root){
"use strict";
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseActions["play_hunt"]=function(options={}){
 const m=root.OnyxBaseMotion;
 if(!m)return {ok:false,error:"Onyx base runtime not initialized"};
 return m.perform("play_hunt",options);
};
})(typeof window!=="undefined"?window:globalThis);
