(()=>{
'use strict';
const makeSeed=level=>`level-${Math.max(1,Math.floor(Number(level)||1))}-${Date.now().toString(36)}`;
const STAR_KEY=level=>`fhm.levelStars.${level}`;
const state={selectedLevel:1,soloOrDuo:'solo',runType:'garden',runSeed:'level-1',recipe:null,requiresFishing:false,fishInventory:{},fishingPerformance:null,pendingOnyxBooster:null,gardenResult:null,completedMiniGames:{garden:false},levelStars:0};
function snapshot(){return JSON.parse(JSON.stringify(state));}
function emit(type,extra={}){window.dispatchEvent(new CustomEvent(type,{detail:{...snapshot(),...extra}}));}
function syncGlobals(){window.FEED_HIM_MEOW_RUN_STATE=state;window.FEED_HIM_MEOW_SELECTED_LEVEL=state.selectedLevel;window.FEED_HIM_MEOW_PLAY_MODE=state.soloOrDuo;window.FEED_HIM_MEOW_RUN_TYPE='garden';}
function currentAccountLevel(){let session=1;try{session=Number(localStorage.getItem('feedHimMEOW.sessionAccountLevel')||1)}catch(_){}return Math.max(1,Number(window.FeedHimMeowAccountProgress?.getLevel?.()||1),session);}
function calculateLevelStars(){if(!state.completedMiniGames.garden)return 0;const n=Math.max(1,Math.min(3,Number(state.gardenResult?.stars)||1));return n===3?5:n===2?3:1;}
function persistProgress(source='garden'){state.levelStars=calculateLevelStars();const level=Math.max(1,Number(state.selectedLevel)||1);let old=0;try{old=Number(localStorage.getItem(STAR_KEY(level))||0);if(state.levelStars>old)localStorage.setItem(STAR_KEY(level),String(state.levelStars));}catch(_){}const best=Math.max(old,state.levelStars);if(best>=1&&level>=currentAccountLevel()){const next=level+1;try{localStorage.setItem('feedHimMEOW.sessionAccountLevel',String(next));}catch(_){}window.FeedHimMeowAccountProgress?.proposeLevel?.(next,`${source}-one-star`);window.dispatchEvent(new CustomEvent('feed-him-meow:account-level-ready',{detail:{level:next,source:`${source}-one-star`}}));}emit('feed-him-meow:level-stars-changed',{level,stars:best,runStars:state.levelStars,source});return best;}
function startLevel(level,mode){state.selectedLevel=Math.max(1,Math.floor(Number(level)||1));state.soloOrDuo=mode==='duo'?'duo':'solo';state.runType='garden';state.runSeed=makeSeed(state.selectedLevel);state.recipe=null;state.requiresFishing=false;state.fishInventory={};state.fishingPerformance=null;state.gardenResult=null;state.completedMiniGames={garden:false};state.levelStars=0;syncGlobals();emit('feed-him-meow:run-started');window.feedHimMeowActivatePage?.('page2');}
function setRecipe(recipe){state.recipe=recipe||null;state.requiresFishing=false;state.fishInventory={};state.fishingPerformance=null;state.gardenResult=null;state.completedMiniGames={garden:false};state.levelStars=0;syncGlobals();emit('feed-him-meow:run-recipe-set',{recipe:state.recipe});}
function continueFromRecipe(){if(state.recipe)window.feedHimMeowActivatePage?.('page4');}
function armOnyxBooster(id){state.pendingOnyxBooster=id||null;syncGlobals();emit('feed-him-meow:run-booster-armed',{id:state.pendingOnyxBooster});}
function clearOnyxBooster(id=null){if(!id||state.pendingOnyxBooster===id)state.pendingOnyxBooster=null;syncGlobals();}
function setGardenResult(result){state.gardenResult=result||null;if(result?.win||result?.completed)state.completedMiniGames.garden=true;syncGlobals();if(state.completedMiniGames.garden)persistProgress('garden');emit('feed-him-meow:garden-result',{result:state.gardenResult});}
function getState(){return state;}
function bestLevelStars(level){try{return Math.max(0,Math.min(5,Number(localStorage.getItem(STAR_KEY(level))||0)));}catch(_){return 0;}}
window.FeedHimMeowRun={getState,snapshot,startLevel,setRecipe,continueFromRecipe,armOnyxBooster,clearOnyxBooster,setGardenResult,calculateLevelStars,bestLevelStars,persistProgress};
window.addEventListener('feed-him-meow:booster-consumed',e=>clearOnyxBooster(e.detail?.id));syncGlobals();
})();
