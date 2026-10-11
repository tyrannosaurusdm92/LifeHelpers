/* Onyx Pass 25: curl_ball; no duplicate animation engine. */
(function(root){
"use strict";
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseActions["curl_ball"]=function(options={}){
 const m=root.OnyxBaseMotion;
 if(!m)return {ok:false,error:"Onyx base runtime not initialized"};
 return m.perform("curl_ball",options);
};
})(typeof window!=="undefined"?window:globalThis);
