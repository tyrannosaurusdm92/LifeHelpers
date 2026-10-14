(()=>{
'use strict';
const root=document.getElementById('levelSelectRoot');if(!root)return;
const $=(s,r=root)=>r.querySelector(s);const DATA=window.INGREDIENT_GARDEN_DATA||{};const path=DATA.ingredient_garden_level_path||{visibleLevelsPerPath:45,positions:[]};
const IMAGE_BASE='assets/images/games/leisure/level_select/';
const STORE={get(k,d=null){try{const v=localStorage.getItem(k);return v===null?d:v}catch(_){return d}},set(k,v){try{localStorage.setItem(k,String(v))}catch(_){}}};
const AUDIO={select:'assets/audio/games/leisure/level_select/actions/garden_select_piece.mp3',popup:'assets/audio/games/leisure/level_select/actions/garden_board_popup.mp3',negative:'assets/audio/games/leisure/level_select/failure/garden_failure_negative_beeps.mp3'};const cache={};
function play(k){const aCfg=window.FeedHimMeowAudioSettings?.()||{sfx:true,volume:.65};if(aCfg.sfx===false)return;try{const a=cache[k]||(cache[k]=new Audio(AUDIO[k]));a.pause();a.currentTime=0;a.volume=Math.min(.65,Number(aCfg.volume??.65));a.play().catch(()=>{})}catch(_){}}
let accountLevel=1,selectedLevel=1,mode='solo';
function currentAccountLevel(){const api=Number(window.FeedHimMeowAccountProgress?.getLevel?.()||1);const session=Number(STORE.get('feedHimMEOW.sessionAccountLevel','1')||1);return Math.max(1,api,session)}
function starsFor(level){const api=Number(window.FeedHimMeowRun?.bestLevelStars?.(level));const n=Number.isFinite(api)?api:Number(STORE.get('fhm.levelStars.'+level,'0'));return n>=1&&n<=5?n:0}
function starsText(n){n=Math.max(0,Math.min(5,Number(n)||0));return`${'★'.repeat(n)}${'☆'.repeat(5-n)}`}
function nodeImage(st){return st==='completed'?'mapsheet_map_point_1.webp':st==='current'?'mapsheet_map_point.webp':'mapsheet_map_point_3.webp'}
function walletText(){return window.FeedHimMeowCurrency?.format?.()||'🟤0 ⚪0 🪙0 🔘0'}
function render(){accountLevel=currentAccountLevel();const count=Number(path.visibleLevelsPerPath||45),batch=Math.floor((accountLevel-1)/count)+1,start=(batch-1)*count+1;const nodes=$('#levelNodes');nodes.innerHTML='';(path.positions||[]).slice(0,count).forEach((pos,i)=>{const level=start+i,st=level<accountLevel?'completed':level===accountLevel?'current':'locked',stars=starsFor(level);const b=document.createElement('button');b.type='button';b.className='level-node '+st;b.dataset.level=level;b.style.left=pos.x+'%';b.style.top=pos.y+'%';b.style.setProperty('--paw-rotation',(Number(pos.rotation)||0)+'deg');b.disabled=st==='locked';b.innerHTML=`<img class="paw-node" src="${IMAGE_BASE}${nodeImage(st)}" alt=""><span class="level-number">${level}</span><span class="level-star-count" aria-label="${stars} of 5 stars">${starsText(stars)}</span>`;b.addEventListener('click',()=>open(level,st));nodes.appendChild(b)});$('#levelBatch').textContent=`Levels ${start}–${start+count-1}`;$('#accountLevel').textContent=accountLevel;$('#levelWallet').textContent=walletText();setTimeout(()=>nodes.querySelector('.level-node.current')?.scrollIntoView({block:'center'}),40);}
function open(level,st){if(st==='locked'){play('negative');return}selectedLevel=level;$('#modalLevel').textContent=level;const n=starsFor(level),stars=$('#modalStars');stars.textContent=starsText(n);stars.setAttribute('aria-label',`${n} of 5 stars`);mode='solo';refresh();$('#levelModal').showModal();window.FeedHimMeowUIResize?.scan?.();play('popup')}
function refresh(){$('#modalSolo').classList.toggle('is-selected',mode==='solo');$('#modalDuo').classList.toggle('is-selected',mode==='duo');$('#modalFullRun').classList.add('is-selected')}
function choosePlayer(m){mode=m==='duo'?'duo':'solo';refresh();play('select')}

function start(){play('select');$('#levelModal').close();window.FeedHimMeowRun?.startLevel(selectedLevel,mode)}
$('#modalClose')?.addEventListener('click',()=>$('#levelModal').close());$('#modalSolo')?.addEventListener('click',()=>choosePlayer('solo'));$('#modalDuo')?.addEventListener('click',()=>choosePlayer('duo'));$('#modalStart')?.addEventListener('click',start);
window.addEventListener('feed-him-meow:account-level-ready',render);window.addEventListener('feed-him-meow:level-stars-changed',render);window.addEventListener('feed-him-meow:page-changed',e=>{if(e.detail?.page==='page1')render()});window.addEventListener('feed-him-meow:garden-result',render);
window.addEventListener('feed-him-meow:booster-request',e=>{if(!document.getElementById('page1')?.classList.contains('is-active'))return;const id=e.detail?.id;if(!id)return;e.detail.accepted='armed';window.FeedHimMeowRun?.armOnyxBooster(id);window.dispatchEvent(new CustomEvent('feed-him-meow:booster-armed',{detail:{id,mood:'thinking'}}));$('#levelMapStatus').textContent=`${id.replaceAll('_',' ')} will carry into the next selected level.`});
window.addEventListener('feed-him-meow:booster-cancel-request',()=>window.FeedHimMeowRun?.clearOnyxBooster());render();
})();
