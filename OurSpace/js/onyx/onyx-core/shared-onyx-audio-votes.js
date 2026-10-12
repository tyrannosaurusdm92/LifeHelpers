(()=>{
"use strict";
const panel=document.querySelector('[data-panel="boosters"]');
if(!panel||panel.querySelector("[data-onyx-sound-booster]"))return;
const STORAGE_KEY="onyx-cat-sound-vote.v1";
const clips=[
  {id:"clip-01",label:"Clip 1",file:"onyx-vote-clip-01.wav"},
  {id:"clip-02",label:"Clip 2",file:"onyx-vote-clip-02.wav"},
  {id:"clip-03",label:"Clip 3",file:"onyx-vote-clip-03.wav"},
  {id:"clip-04",label:"Clip 4",file:"onyx-vote-clip-04.wav"},
  {id:"clip-05",label:"Clip 5",file:"onyx-vote-clip-05.wav"},
  {id:"clip-06",label:"Clip 6",file:"onyx-vote-clip-06.wav"}
];
const style=document.createElement("style");
style.textContent=".onyx-sound-booster{background:linear-gradient(180deg,#F4FBFB,#E6F1F0);color:#102A30;border:1px solid #397078;border-radius:9px;padding:11px}.onyx-sound-booster h3,.onyx-sound-vote h2{margin:0 0 5px;color:#102A30}.onyx-sound-booster p,.onyx-sound-vote p{margin:0 0 9px;color:#397078;font-size:11px;line-height:1.4}.onyx-sound-quick-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.onyx-sound-quick-list button,.onyx-sound-vote button{min-height:34px;border:1px solid #397078;border-radius:9px;background:linear-gradient(180deg,#F4FBFB,#E6F1F0);color:#102A30;font:800 10px system-ui,sans-serif;cursor:pointer;padding:6px}.onyx-sound-quick-list button:hover,.onyx-sound-vote button:hover{background:#97FBFF}.onyx-sound-booster .onyx-open-vote{margin-top:8px;width:100%;background:#10252B;color:#fff}.onyx-sound-booster button:focus-visible,.onyx-sound-vote button:focus-visible{outline:3px solid #00DFE8;outline-offset:2px}#onyxCatSoundVoteDialog{width:min(520px,calc(100vw - 28px));max-height:min(80vh,700px);padding:0;border:1px solid #397078;border-radius:14px;background:linear-gradient(180deg,#F4FBFB,#E6F1F0);color:#102A30;box-shadow:0 5px 0 #00121766,0 20px 64px #00121788;font:14px system-ui,sans-serif}#onyxCatSoundVoteDialog::backdrop{background:#0009}.onyx-sound-vote header{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:linear-gradient(100deg,#071014,#006C78,#D97820);color:#F4FFFF;border-bottom:2px solid #00DFE8}.onyx-sound-vote h2{font-size:16px}.onyx-sound-vote .vote-list{display:grid;gap:7px;padding:14px 16px;max-height:48vh;overflow:auto}.onyx-vote-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:7px;align-items:center;padding:8px;border:1px solid #97FBFF;border-radius:11px;background:linear-gradient(180deg,#F4FBFB,#E6F1F0)}.onyx-vote-row strong{font-size:12px}.onyx-vote-row small{display:block;color:#397078;font-size:10px}.onyx-vote-row .vote-count{min-width:48px;text-align:right;color:#397078;font:800 10px system-ui,sans-serif}.onyx-sound-vote footer{padding:0 16px 16px}.onyx-sound-vote .vote-status{min-height:18px;padding:0 16px;color:#10252B;font-size:11px;font-weight:800}.onyx-sound-vote footer button{width:100%;background:#10252B;color:#fff}";
document.head.append(style);
const section=document.createElement("section");section.className="section onyx-sound-booster";section.dataset.onyxSoundBooster="";
const title=document.createElement("h3");title.textContent="Onyx Meow Boosters";
const copy=document.createElement("p");copy.textContent="Preview six cat sounds from Onyx’s sound pack, then open the vote screen to choose your favorite.";
const quick=document.createElement("div");quick.className="onyx-sound-quick-list";
clips.forEach(c=>{const b=document.createElement("button");b.type="button";b.dataset.previewClip=c.id;b.textContent="Preview "+c.label;b.setAttribute("aria-label","Preview Onyx cat sound "+c.label);quick.append(b)});
const openVote=document.createElement("button");openVote.type="button";openVote.className="onyx-open-vote";openVote.textContent="Open sound voting screen";
section.append(title,copy,quick,openVote);
const body=panel.querySelector(".panel-body")||panel;body.append(section);
const dialog=document.createElement("dialog");dialog.id="onyxCatSoundVoteDialog";dialog.setAttribute("aria-labelledby","onyxCatSoundVoteTitle");
dialog.innerHTML='<form method="dialog" class="onyx-sound-vote"><header><h2 id="onyxCatSoundVoteTitle">Vote for Onyx’s Meow</h2><button type="button" data-vote-close aria-label="Close sound voting screen">×</button></header><p style="padding:12px 16px 0">Preview a sound and cast one vote in this browser. Your tally stays on this device.</p><div class="vote-list" id="onyxSoundVoteList"></div><div class="vote-status" id="onyxSoundVoteStatus" aria-live="polite"></div><footer><button type="button" data-vote-close>Close voting screen</button></footer></form>';
document.body.append(dialog);
let currentAudio=null;
function readState(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{};return{votes:s.votes&&typeof s.votes==="object"?s.votes:{},selected:String(s.selected||"")}}catch(_){return{votes:{},selected:""}}}
function writeState(state){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(_){}}
function play(id){
  const c=clips.find(x=>x.id===id);if(!c)return false;
  try{if(currentAudio){currentAudio.pause();currentAudio.currentTime=0}currentAudio=new Audio("https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/audio/games/virtual/atlases/cat-votes"+c.file);currentAudio.volume=.75;currentAudio.play().catch(()=>{});return true}catch(_){return false}
}
function countText(state,id){return Number(state.votes[id]||0)+" local vote"+(Number(state.votes[id]||0)===1?"":"s")}
function render(){
  const list=dialog.querySelector("#onyxSoundVoteList"),state=readState();list.innerHTML="";
  clips.forEach(c=>{
    const row=document.createElement("div");row.className="onyx-vote-row";
    const label=document.createElement("div"),strong=document.createElement("strong"),small=document.createElement("small");
    strong.textContent=c.label;small.textContent="Cat sound preview";label.append(strong,small);
    const tally=document.createElement("span");tally.className="vote-count";tally.textContent=countText(state,c.id);
    const preview=document.createElement("button");preview.type="button";preview.dataset.previewClip=c.id;preview.textContent="Preview";
    const vote=document.createElement("button");vote.type="button";vote.dataset.castVote=c.id;vote.textContent=state.selected===c.id?"Your vote":"Vote";
    vote.setAttribute("aria-pressed",String(state.selected===c.id));
    row.append(label,tally,preview,vote);list.append(row);
  });
  const status=dialog.querySelector("#onyxSoundVoteStatus");
  status.textContent=state.selected?("Your current vote is "+(clips.find(c=>c.id===state.selected)?.label||"saved")+"."): "No vote cast in this browser yet.";
}
function castVote(id){
  const state=readState();if(!clips.some(c=>c.id===id))return;
  if(state.selected===id){dialog.querySelector("#onyxSoundVoteStatus").textContent="Your vote is already set to "+clips.find(c=>c.id===id).label+".";return}
  if(state.selected)state.votes[state.selected]=Math.max(0,Number(state.votes[state.selected]||0)-1);
  state.votes[id]=Number(state.votes[id]||0)+1;state.selected=id;writeState(state);render();
}
document.addEventListener("click",e=>{
  const preview=e.target.closest?.("[data-preview-clip]");if(preview){play(preview.dataset.previewClip);return}
  const vote=e.target.closest?.("[data-cast-vote]");if(vote){castVote(vote.dataset.castVote);return}
  if(e.target===openVote){render();if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");return}
  if(e.target.closest?.("[data-vote-close]"))dialog.close();
});
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
window.OnyxCatSoundVote=Object.freeze({preview:play,vote:castVote,getTally:()=>readState()});
})();
