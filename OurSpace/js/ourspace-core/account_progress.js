
(()=>{"use strict";
const clampLevel=v=>Math.max(1,Math.floor(Number(v)||1));
const state={level:1,source:"default",ready:false};
function extract(src){return clampLevel(src?.ingredientGardenLevel ?? src?.level ?? src?.progress?.ingredientGardenLevel ?? src?.progress?.level ?? 1)}
function apply(src,source="account"){
  state.level=extract(src);state.source=source;state.ready=true;
  window.FEED_HIM_MEOW_ACCOUNT_LEVEL=state.level;
  window.dispatchEvent(new CustomEvent("feed-him-meow:account-level-ready",{detail:{level:state.level,source:state.source}}));
}
window.FeedHimMeowAccountProgress={
  getLevel:()=>state.level,
  getSource:()=>state.source,
  applyAccountProgress:(data)=>apply(data,"account"),
  proposeLevel:(level,reason="level-complete")=>{
    const next=clampLevel(level);
    window.dispatchEvent(new CustomEvent("feed-him-meow:progress-update",{detail:{ingredientGardenLevel:next,reason,authority:"account"}}));
    return next;
  }
};
const pre=window.FEED_HIM_MEOW_ACCOUNT_PROGRESS||window.FEED_HIM_MEOW_ACCOUNT;
if(pre){apply(pre,"account")}else{
  let resolved=false;
  const resolve=data=>{if(resolved)return;resolved=true;apply(data||{ingredientGardenLevel:1},data?"account":"default")};
  window.dispatchEvent(new CustomEvent("feed-him-meow:request-account-progress",{detail:{resolve}}));
  setTimeout(()=>resolve(null),0);
}
window.addEventListener("feed-him-meow:account-progress",e=>apply(e.detail||{},"account"));
})();
