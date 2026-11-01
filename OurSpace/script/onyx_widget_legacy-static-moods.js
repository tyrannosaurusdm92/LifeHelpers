(()=>{'use strict';
const host=document.getElementById('onyxWidget');
if(!host)return;
const bubbleImg=document.getElementById('onyxLegacyStatic');
const workImg=document.getElementById('onyxMoodImage');
const workLabel=document.getElementById('onyxMoodLabel');
const bubbleLabel=document.getElementById('onyxBubbleState');
const moodText=document.getElementById('onyxMoodText');
const momentText=document.getElementById('onyxMomentText');
const pics={hungry:'onyx_widget_onyx_hungry.png',thinking:'onyx_widget_onyx_thinking.png',listening:'onyx_widget_onyx_listening.png',judgmental:'onyx_widget_onyx_judgmental.png',snuggly:'onyx_widget_onyx_snuggly.png'};
const labels={hungry:'Hungry',thinking:'Thinking',listening:'Listening',judgmental:'Judgmental',snuggly:'Snuggly'};
const map={sleepy:'snuggly',purring:'snuggly',caring:'snuggly',thoughtful:'thinking',advising_professor:'thinking',work:'thinking',active:'listening',annoyed:'judgmental',happy:'snuggly'};
function pickMood(){
  const raw=(host.getAttribute('data-mood')||host.getAttribute('data-state')||'thinking').toLowerCase().replace(/[^a-z_]/g,'');
  return pics[raw]?raw:(map[raw]||'thinking');
}
function applyImage(el, mood, prefix){
  if(!el) return;
  const next='../../assets/'+pics[mood];
  if(el.getAttribute('src')!==next) el.src=next;
  el.alt=`${prefix} ${labels[mood].toLowerCase()}`;
  el.dataset.mood=mood;
}
function update(){
  const mood=pickMood();
  const label=labels[mood]||'Thinking';
  applyImage(bubbleImg,mood,'Onyx,');
  // Work fullscreen controls #onyxMoodImage from its own workload state.

  // Work mood label is managed by the Work controller.

  if(bubbleLabel) bubbleLabel.textContent=label;
  if(moodText) moodText.textContent=label;
  if(momentText) momentText.textContent=label;
}
new MutationObserver(update).observe(host,{attributes:true,attributeFilter:['data-mood','data-state']});
update();
})();
