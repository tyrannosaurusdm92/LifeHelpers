/* Keep every design-target definition from both original packages. */
(function(){'use strict';
let original={};
function safeSpecs(obj){const out={};for(const [page,parts] of Object.entries(obj||{})){
 if(Array.isArray(parts))out[page]=parts.slice();}return out;}
window.OurSpaceDesignRegistryMerge={
 snapshot(){original=safeSpecs(window.OurSpacePageDesignSpecs)},
 finish(){const now=safeSpecs(window.OurSpacePageDesignSpecs),combined={};
  for(const page of new Set([...Object.keys(original),...Object.keys(now)])){
   const targets=[...(original[page]||[]),...(now[page]||[])];
   const byId=new Map();
   for(const target of targets){if(target&&typeof target.id==='string'){
    if(!byId.has(target.id))byId.set(target.id,target);
    else {const prev=byId.get(target.id);byId.set(target.id,{...prev,...target,selector:prev.selector||target.selector});}
   }}combined[page]=[...byId.values()];
  }
  window.OurSpacePageDesignSpecs=combined;
  window.OurSpaceDesignRegistryMerge.counts=Object.fromEntries(Object.entries(combined).map(([page,items])=>[page,items.length]));
 }
};
})();