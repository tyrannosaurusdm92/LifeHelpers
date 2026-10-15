/* Feed Him MEOW: real audio playback, centralized phase music and event cues.
   Browser playback is unlocked only after a user gesture; no automatic autoplay promises. */
(()=>{'use strict';
 const A='assets/audio/games/leisure/';
 const cues={
  select:'level_select/actions/garden_select_piece.mp3',
  recipe:'level_select/garden_board_popup.mp3',
  match:'Ingredient_Garden/match.mp3',
  swap:'Ingredient_Garden/actions/garden_piece_plop.mp3',
  invalid:'shared/warning.mp3',
  cascade:'Ingredient_Garden/cascade.mp3',
  collect:'Ingredient_Garden/collect.mp3',
  complete:'Ingredient_Garden/success/garden_success_complete.mp3',
  fail:'Ingredient_Garden/failure/garden_failure_negative_beeps.mp3',
  booster:'Ingredient_Garden/powerups/garden_powerup_01.mp3',
  nibble:'shared/onyx/booster_confirm.mp3',
  market:'Market_Madness/trace_select.mp3',
  machine:'Bon-Appetit/click.wav',
  purring:'Bon-Appetit_result/purring_result.mp3',
  judgmental:'Bon-Appetit_result/judgmental_result.mp3'
 };
 const music={
  'level-select':'Ingredient_Garden/music/garden_music_short_loop.mp3',
  recipe:'Ingredient_Garden/music/garden_music_short_loop.mp3',
  'market-madness':'Ingredient_Garden/music/garden_music_8bit.mp3',
  'ingredient-garden':'Ingredient_Garden/music/garden_music_loop_03.mp3',
  'bon-appetit':'Ingredient_Garden/music/garden_music_8bit.mp3',
  'onyx-verdict':'Ingredient_Garden/music/garden_music_short_loop.mp3'
 };
 let sound=1,phase='level-select',unlocked=false,paused=false,track=null,lastTrack='',audioErrors=0;
 let context=null;
 const sample=new Map();
 function file(path){return A+path}
 function cue(name){if(!unlocked||!sound||paused)return false;const path=cues[name];if(!path)return false;
  let pool=sample.get(name);if(!pool){pool=[];sample.set(name,pool)}
  let clip=pool.find(el=>el.paused||el.ended);
  if(!clip){clip=new Audio(file(path));clip.preload='auto';pool.push(clip);if(pool.length>5)pool.shift()}
  clip.volume=Math.min(1,sound*.8);try{clip.currentTime=0}catch(_){};
  clip.play().catch(error=>{audioErrors++;if(sound&&!paused)tone(name);console.warn('MEOW sound cue failed:',name,error?.name||error)});return true;
 }
 function sync(){const next=music[phase]||null;
  if(!next||!unlocked||!sound||paused){if(track)track.pause();return}
  if(next!==lastTrack){if(track){track.pause();track.src=''};track=new Audio(file(next));track.loop=true;track.preload='auto';lastTrack=next}
  track.volume=Math.min(.37,sound*.25);track.muted=false;track.play().catch(error=>{audioErrors++;console.warn('MEOW background music could not start:',error?.name||error)});
 }
 function tone(name){if(!unlocked||!sound||paused)return;try{
  context=context||new (window.AudioContext||window.webkitAudioContext)();
  if(context.state==='suspended')context.resume().catch(()=>{});
  const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
  oscillator.type=name==='fail'?'triangle':'sine';oscillator.frequency.value=name==='fail'?220:name==='booster'?740:520;
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.06*sound,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.22);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start(now);oscillator.stop(now+.23);
 }catch(_){}}
 function unlock(){if(unlocked)return;unlocked=true;try{context=context||new (window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});}catch(_){}sync()}
 function volume(value){const n=Number(value);sound=Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;sync()}
 function stage(name){phase=name;sync()}
 function pause(flag){paused=!!flag;sync()}
 document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
 document.addEventListener('keydown',unlock,{capture:true});
 document.addEventListener('touchstart',unlock,{capture:true,passive:true});
 window.addEventListener('meow:sound-change',e=>volume(e.detail?.volume));
 window.addEventListener('market-madness:trace-resolved',e=>{cue('market');if((e.detail?.length||0)>4)window.MEOWFX?.word('PURR-FECT PATH!','market')});
 window.addEventListener('ingredient-garden:ingredient-collected',()=>cue('collect'));
 window.addEventListener('bon-appetit:started',()=>cue('machine'));
 // Bon Appétit owns the single verdict cue so Onyx does not double-play result audio.
 window.addEventListener('meow:shell',e=>{if(e.detail?.type==='pause')pause(!!e.detail.paused);if(e.detail?.type==='onyx-audio-cue')cue('booster')});
 window.MEOWAudio={cue,stage,volume,pause,getState:()=>({unlocked,paused,phase,sound,music:track?.src||null,audioErrors,trackPaused:track?.paused??true})};
})();
