/* 19 authentic Record Player v7 design-part roles, now controlled by the profile's Design Widget.
   No second designer, iframe, Shadow DOM, or global CSS selector. */
(()=>{'use strict';
 const PARTS=[{"id":"base","label":"Wood cabinet","selectors":[":scope"],"fields":["color"],"kind":"wood","colorLabel":"Cabinet wood tone"},{"id":"deck-metal","label":"Turntable deck accents","selectors":[".platter-rim"],"fields":["border"],"kind":"surface"},{"id":"vinyl","label":"Vinyl record and grooves","selectors":[".vinyl"],"fields":["color"],"kind":"vinyl","colorLabel":"Grooved vinyl color"},{"id":"record-label","label":"Inner record circle","selectors":[".record-label"],"fields":["color","border"],"kind":"label","colorLabel":"Center label color"},{"id":"metal","label":"Metal tonearm","selectors":[".tonearm-tube"],"fields":["color"],"kind":"metal","colorLabel":"Metal finish"},{"id":"needle","label":"Cartridge needle tip","selectors":[".tonearm-head::after"],"fields":["color"],"kind":"needle","colorLabel":"Needle color"},{"id":"upload","label":"Upload / load knob","selectors":["#loadButton"],"fields":["color","border"],"kind":"brass","colorLabel":"Knob finish"},{"id":"artist","label":"Artist lettering","selectors":[".metadata-row:first-of-type .metadata-label",".metadata-row:first-of-type .metadata-value"],"fields":["text","font","size"],"kind":""},{"id":"song","label":"Song title lettering","selectors":[".metadata-row:nth-of-type(2) .metadata-label",".metadata-row:nth-of-type(2) .metadata-value"],"fields":["text","font","size"],"kind":""},{"id":"time","label":"Playback time readouts","selectors":[".time-readout"],"fields":["text","font","size"],"kind":""},{"id":"controls","label":"Playback controls (all)","selectors":[".transport-button"],"fields":["fill","text","border","font","size"],"kind":"transport"},{"id":"play","label":"Play / pause","selectors":["#playButton"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"rewind","label":"Rewind","selectors":["#rewindButton"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"forward","label":"Fast forward","selectors":["#forwardButton"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"previous","label":"Previous track","selectors":["#previousButton"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"next","label":"Next track","selectors":["#nextButton"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"wave-a","label":"Waveform bars · primary","selectors":[],"fields":["color"],"kind":"wave","wave":"--osd-wave-a","colorLabel":"Primary waveform bars"},{"id":"wave-b","label":"Waveform bars · secondary","selectors":[],"fields":["color"],"kind":"wave","wave":"--osd-wave-b","colorLabel":"Secondary waveform bars"},{"id":"wave-axis","label":"Waveform centerline & progress","selectors":[],"fields":["color"],"kind":"wave","wave":"--osd-wave-axis","colorLabel":"Waveform axis / progress"}];
 const FONTS={Default:'',Verdana:'Verdana,Arial,sans-serif',Arial:'Arial,Helvetica,sans-serif',Georgia:'Georgia,serif',Trebuchet:'"Trebuchet MS",Arial,sans-serif',Times:'"Times New Roman",serif',Courier:'"Courier New",monospace',Tahoma:'Tahoma,Arial,sans-serif'};
 const colorOk=x=>/^#[\da-f]{6}$/i.test(String(x||''));
 const copy=x=>JSON.parse(JSON.stringify(x));
 function sanitize(input){const out={};if(!input||typeof input!=='object')return out;
  for(const part of PARTS){const entry=input[part.id];if(!entry||typeof entry!=='object')continue;const values={};for(const field of part.fields){const value=entry[field];if(field==='font'&&Object.prototype.hasOwnProperty.call(FONTS,String(value)))values.font=value;else if(field==='size'&&Number.isFinite(Number(value)))values.size=Math.max(10,Math.min(30,Math.round(Number(value))));else if(['color','fill','text','border'].includes(field)&&colorOk(value))values[field]=String(value).toUpperCase();}if(Object.keys(values).length)out[part.id]=values;}return out;
 }
 function rgb(c){return [1,3,5].map(x=>parseInt(c.slice(x,x+2),16));}
 function scale(c,amt){const x=rgb(c);return '#'+x.map(v=>Math.max(0,Math.min(255,Math.round(v+(amt>0?(255-v)*amt:v*amt)))).toString(16).padStart(2,'0')).join('');}
 function compile(styles){const config=sanitize(styles),out=[];for(const part of PARTS){const values=config[part.id];if(!values)continue;
  if(part.kind==='wave'){if(colorOk(values.color))out.push(`#retroPlayer{${part.wave}:${values.color}!important}`);continue;}
  const sel=part.selectors.map(x=>x===':scope'?'#retroPlayer':('#retroPlayer '+x));const props=[];
  if(colorOk(values.text))props.push(`color:${values.text}!important`);
  if(colorOk(values.border))props.push(`border-color:${values.border}!important`);
  if(values.font&&FONTS[values.font])props.push(`font-family:${FONTS[values.font]}!important`);
  if(values.size)props.push(`font-size:${values.size}px!important`);
  if(colorOk(values.color)){
   const c=values.color;
   if(part.kind==='wood')props.push(`background:repeating-linear-gradient(102deg,rgba(0,0,0,.10) 0 1px,transparent 1px 13px),linear-gradient(112deg,${scale(c,-.48)},${scale(c,.22)} 30%,${c} 53%,${scale(c,.34)} 76%,${scale(c,-.5)})!important`);
   if(part.kind==='vinyl')props.push(`background:repeating-radial-gradient(circle,${scale(c,-.40)} 0 2px,${scale(c,.1)} 4px 6px,${scale(c,-.53)} 7px 10px)!important`);
   if(part.kind==='label')props.push(`background:radial-gradient(circle at 36% 28%,rgba(255,255,255,.32) 0 19%,transparent 32%),radial-gradient(circle,${scale(c,.20)} 0 60%,${scale(c,-.23)} 62%)!important`);
   if(part.kind==='metal')props.push(`background:linear-gradient(90deg,${scale(c,-.60)},${scale(c,.47)} 38%,${c} 70%,${scale(c,-.50)})!important`);
   if(part.kind==='needle')props.push(`background:${c}!important`);
   if(part.kind==='brass')props.push(`background:radial-gradient(circle at 30% 28%,${scale(c,.52)},${c} 45%,${scale(c,-.5)} 90%)!important`);
  }
  if(colorOk(values.fill)){
   if(part.kind==='transport')props.push(`background:linear-gradient(145deg,${scale(values.fill,.18)},${scale(values.fill,-.18)})!important`);
   else props.push(`background:${values.fill}!important`);
  }
  if(props.length)out.push(`${sel.join(', ')}{${props.join(';')};}`);
 }
 return out.join('\n');}
 const byTarget=id=>PARTS.find(p=>'rp-'+p.id===id)||null;
 const fieldLabel={color:'Material color',border:'Border color',text:'Text color',font:'Font',size:'Font size',fill:'Surface color'};
 function renderControl(id,values,esc){const part=byTarget(id);if(!part)return '';
  const current=(sanitize({[part.id]:values||{}}))[part.id]||{};
  const fields=part.fields.map(f=>{
   if(f==='font')return `<div class="labelled"><label for="record-field-font">Font family</label><select id="record-field-font" data-rp-part="${part.id}" data-rp-field="font">${Object.keys(FONTS).map(name=>`<option value="${esc(name)}"${(current.font||'Default')===name?' selected':''}>${esc(name)}</option>`).join('')}</select></div>`;
   if(f==='size')return `<div class="labelled"><label for="record-field-size">Font size (10–30px)</label><input id="record-field-size" type="range" min="10" max="30" step="1" data-rp-part="${part.id}" data-rp-field="size" value="${current.size||16}"><output id="rp-size-readout">${current.size||16}px</output></div>`;
   const val=current[f]||'#6699CC';return `<div class="color-row"><label for="rp-${part.id}-${f}">${esc(part.colorLabel&&f==='color'?part.colorLabel:fieldLabel[f]||f)}</label><input id="rp-${part.id}-${f}" type="color" data-rp-part="${part.id}" data-rp-field="${f}" value="${val}"><input type="text" class="hex" maxlength="7" aria-label="${esc(fieldLabel[f]||f)} hex value" data-rp-hex="${f}" data-rp-part="${part.id}" value="${val}"></div>`;
  }).join('');
  return `<h2>Record player · ${esc(part.label)}</h2><p class="subtle">The original record-player design specification is integrated here. Its edits are restricted to this hardware part, not the entire music section.</p><div class="labelled"><label for="recordQuickPart">Hardware part</label><select id="recordQuickPart">${PARTS.map(p=>`<option value="rp-${p.id}"${p.id===part.id?' selected':''}>${esc(p.label)}</option>`).join('')}</select></div><div class="surface">${fields}</div><button type="button" class="ui" data-action="resetRecordPart">Reset this part</button><p class="subtle">Cabinet wood, vinyl, metal, needle and waveform colors retain the original gradients and rendering behavior.</p>`;
 }
 window.OurSpaceRecordPlayerDesign={parts:copy(PARTS),byTarget,FONTS,sanitize,compile,renderControl};
})();
