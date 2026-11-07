(function(root){'use strict';
const names=Object.freeze(["advising_professor","caring","hungry","judgmental","listening","purring","sleeping","thinking","thoughtful"]);
const ids=Object.freeze(["onyx_advising_professor","onyx_caring","onyx_hungry","onyx_judgmental","onyx_listening","onyx_purring","onyx_snuggly","onyx_thinking","onyx_thoughtful"]);
const aliases=Object.freeze({"professor":"advising_professor","advising":"advising_professor","clipboard":"advising_professor","highfive":"advising_professor","sitpretty":"advising_professor","care":"caring","nuzzle":"caring","pet":"caring","scratch":"caring","brush":"caring","blep":"caring","wake":"caring","zoom":"caring","feed":"hungry","treat":"hungry","judge":"judgmental","grumble":"judgmental","sermon":"judgmental","bored":"judgmental","overstimulated":"judgmental","sit":"judgmental","listen":"listening","alert":"listening","watch":"listening","patrol":"listening","boundary":"listening","pounce":"listening","purr":"purring","knead":"purring","slowblink":"purring","bowtie":"purring","play":"purring","sleep":"sleeping","sleepy":"sleeping","snuggly":"sleeping","napshift":"sleeping","yawn":"sleeping","resting":"sleeping","rest":"sleeping","cozy":"sleeping","loaf":"sleeping","pillow":"sleeping","blanket":"sleeping","returnwarm":"sleeping","sprawl":"sleeping","fan":"sleeping","stretch":"sleeping","rotisserie":"sleeping","think":"thinking","curious":"thinking","inspect":"thinking","groom":"thinking","sidewalk":"thinking","checkin":"thoughtful","pawtap":"thoughtful"});
const toId=Object.freeze(Object.fromEntries(names.map((n,i)=>[n,ids[i]])));
const toName=Object.freeze(Object.fromEntries(ids.map((id,i)=>[id,names[i]])));
function token(value){
  return String(value||'')
    .trim()
    .toLowerCase()
    .replace(/^onyx_/,'')
    .replace(/[\s-]+/g,'_');
}
function normalize(value){
  const raw=token(value);
  if(names.includes(raw))return raw;
  return aliases[raw]||'sleeping';
}
function normalizeOrNull(value){
  const raw=token(value);
  if(names.includes(raw))return raw;
  return aliases[raw]||null;
}
root.OnyxMoodContract=Object.freeze({
  ids,names,aliases,toId,toName,
  isCanonical:value=>ids.includes(String(value))||names.includes(token(value))||value==='onyx_sleepy',
  normalize,
  normalizeOrNull,
  toCanonicalId:value=>toId[normalize(value)]||'onyx_snuggly'
});
})(window);
