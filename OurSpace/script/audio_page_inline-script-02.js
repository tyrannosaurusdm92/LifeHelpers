function offlineMediaFallback(){
 const root=document.getElementById('ourspace-media-module');if(!root||root.dataset.offlineReady==='yes')return;
 root.dataset.offlineReady='yes';root.replaceChildren();
 root.innerHTML=`<section class="module"><div class="module-hd"><h2>Audio Library</h2></div><div class="module-body"><label>Import audio files<input id="offlineAudioFiles" type="file" accept="audio/*" multiple></label><div class="card"><h3 id="offlineAudioTitle">Choose a track</h3><p id="offlineAudioStatus" aria-live="polite">Files stay in this browser until closed or replaced.</p><audio id="offlineAudioPlayer" controls style="width:100%;margin:10px 0"></audio><div class="button-row"><button id="offlinePrev" type="button">Previous</button><button id="offlinePlay" type="button">Play / Pause</button><button id="offlineNext" type="button">Next</button><button id="offlineRepeat" type="button" aria-pressed="false">Repeat off</button><button id="offlineShuffle" type="button" aria-pressed="false">Shuffle off</button></div><label>Volume <input id="offlineVol" type="range" min="0" max="100" value="85"></label></div><section class="card"><h3>Queue</h3><div id="offlineAudioList" role="list"></div></section></div></section>`;
 const q=id=>document.getElementById(id),player=q('offlineAudioPlayer'),list=q('offlineAudioList'),title=q('offlineAudioTitle'),status=q('offlineAudioStatus');
 let songs=[],current=-1,repeat=false,shuffle=false;
 const select=(idx,play=false)=>{if(!songs.length)return;current=(idx+songs.length)%songs.length;player.src=songs[current].url;title.textContent=songs[current].file.name;status.textContent='Track '+(current+1)+' of '+songs.length;list.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));if(play)player.play().catch(()=>{})};
 q('offlineAudioFiles').addEventListener('change',e=>{for(const s of songs)URL.revokeObjectURL(s.url);songs=[...e.target.files].filter(f=>f.type.startsWith('audio/')).map(file=>({file,url:URL.createObjectURL(file)}));list.replaceChildren();songs.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.textContent=(i+1)+'. '+s.file.name;b.style='display:block;width:100%;margin:5px 0;text-align:left';b.onclick=()=>select(i,true);list.append(b)});current=-1;if(songs.length)select(0);else title.textContent='Choose a track'});
 const next=()=>{if(!songs.length)return;select(shuffle?Math.floor(Math.random()*songs.length):current+1,true)};
 q('offlinePrev').onclick=()=>select(current-1,true);q('offlineNext').onclick=next;
 q('offlinePlay').onclick=()=>{if(!songs.length)return;if(player.paused)player.play().catch(()=>{});else player.pause()};
 q('offlineVol').oninput=e=>player.volume=Number(e.target.value)/100;player.volume=.85;
 q('offlineShuffle').onclick=e=>{shuffle=!shuffle;e.currentTarget.textContent=shuffle?'Shuffle on':'Shuffle off';e.currentTarget.setAttribute('aria-pressed',String(shuffle))};
 q('offlineRepeat').onclick=e=>{repeat=!repeat;e.currentTarget.textContent=repeat?'Repeat on':'Repeat off';e.currentTarget.setAttribute('aria-pressed',String(repeat))};
 player.addEventListener('ended',()=>{if(repeat)player.play().catch(()=>{});else next()});
}
window.addEventListener('unhandledrejection',event=>{if(String(event.reason).includes('Indexed Database API is denied')){event.preventDefault();offlineMediaFallback()}});
