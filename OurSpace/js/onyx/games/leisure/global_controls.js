(()=>{'use strict';
const pageName=document.getElementById('globalPageName'),sound=document.getElementById('globalSoundToggle'),pause=document.getElementById('globalPauseToggle'),currency=document.getElementById('globalCurrency');
let paused=false,muted=false;
function refreshPage(){const p=document.querySelector('.app-page.is-active');if(pageName)pageName.textContent=p?.dataset.pageName||'Level Select';}
function refreshCurrency(){if(!currency)return;currency.textContent=window.FeedHimMeowCurrency?.format?.()||document.getElementById('levelWallet')?.textContent||'🟤0⚪0🪙0🔘0';}
function refreshSound(){const music=document.getElementById('musicEnabled'),sfx=document.getElementById('sfxEnabled');if(music)music.checked=!muted;if(sfx)sfx.checked=!muted;if(sound){sound.setAttribute('aria-pressed',String(!muted));sound.textContent=muted?'🔇 MUTED':'🔊 SOUND';}window.dispatchEvent(new CustomEvent('feed-him-meow:audio-settings',{detail:window.FeedHimMeowAudioSettings?.()}));}
function refreshPause(){if(pause){pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'Resume game':'Pause game');}window.dispatchEvent(new CustomEvent('feed-him-meow:global-pause',{detail:{paused}}));}
sound?.addEventListener('click',()=>{muted=!muted;refreshSound()});pause?.addEventListener('click',()=>{paused=!paused;refreshPause()});
window.FeedHimMeowPause={isPaused:()=>paused,setPaused:v=>{paused=!!v;refreshPause()}};
window.addEventListener('feed-him-meow:page-changed',()=>{refreshPage();refreshCurrency()});
for(const e of ['feed-him-meow:currency-changed','feed-him-meow:level-stars-changed','feed-him-meow:garden-result'])window.addEventListener(e,refreshCurrency);
for(const e of ['change','input'])for(const id of ['musicEnabled','sfxEnabled'])document.getElementById(id)?.addEventListener(e,()=>{muted=!document.getElementById('musicEnabled')?.checked&&!document.getElementById('sfxEnabled')?.checked;if(sound){sound.textContent=muted?'🔇 MUTED':'🔊 SOUND';sound.setAttribute('aria-pressed',String(!muted))}});
refreshPage();refreshCurrency();})();
