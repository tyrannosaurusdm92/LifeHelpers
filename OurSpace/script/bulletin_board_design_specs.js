/* Bulletin Board original 10 design parts integrated into the profile Design Studio.
   Deliberately no independent floating designer, iframe, Shadow DOM or global CSS. */
(()=>{'use strict';
const PARTS=[{"id":"board-title","label":"Board and library headings","selectors":["#boardTitleButton",".brand-block h1"],"fields":["text","font","size"],"kind":""},{"id":"board-tools","label":"Board controls","selectors":[".controlbar .button",".view-button",".topbar-actions .button"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"sidebar","label":"Boards navigation sidebar","selectors":["#sidebar"],"fields":["fill","border"],"kind":""},{"id":"sidebar-buttons","label":"Library navigation","selectors":[".nav-button"],"fields":["fill","text","border","font","size"],"kind":""},{"id":"canvas-border","label":"Board frame","selectors":["#boardViewport"],"fields":["border"],"kind":""},{"id":"paper","label":"Paper scraps (not Post-its)","selectors":[".scrap-card.style-paper",".structured-card.style-paper"],"fields":["fill","text","font","size"],"kind":"","preset":false},{"id":"notes","label":"Post-it lettering only","selectors":[".scrap-card.style-note",".structured-card.style-note"],"fields":["text","font","size"],"kind":"","preset":false},{"id":"scrap-titles","label":"Scrap headings","selectors":[".scrap-content h2",".scrap-content h3",".scrap-content strong"],"fields":["text","font","size"],"kind":""},{"id":"inspector","label":"Scrap inspector","selectors":["#inspector"],"fields":["fill","border"],"kind":""},{"id":"board-inputs","label":"Search and board inputs","selectors":["#searchInput","#inspector input","#inspector textarea"],"fields":["fill","text","border","font","size"],"kind":""}];
const FONTS={"Georgia":"Georgia,serif","Verdana":"Verdana,sans-serif","Arial":"Arial,sans-serif","Times":"\"Times New Roman\",serif","Trebuchet":"\"Trebuchet MS\",sans-serif","Monospace":"Consolas,monospace","System":"system-ui,sans-serif"};
const safeColor=s=>/^#[0-9a-fA-F]{6}$/.test(String(s||''));
const clone=v=>JSON.parse(JSON.stringify(v));
const byTarget=id=>PARTS.find(p=>'bb-'+p.id===id)||null;
function sanitize(raw){const result={};if(!raw||typeof raw!=='object')return result;
 for(const part of PARTS){const o=raw[part.id];if(!o||typeof o!=='object')continue;const d={};for(const field of part.fields){const v=o[field];if(['text','fill','border'].includes(field)&&safeColor(v))d[field]=String(v).toUpperCase();else if(field==='font'&&Object.prototype.hasOwnProperty.call(FONTS,v))d.font=v;else if(field==='size'&&Number.isFinite(+v))d.size=Math.min(42,Math.max(9,Math.round(+v)));}if(Object.keys(d).length)result[part.id]=d;}return result;}
function compile(raw){const settings=sanitize(raw),rules=[];for(const part of PARTS){const value=settings[part.id];if(!value)continue;const declarations=[];
 if(value.fill)declarations.push('background-color:'+value.fill+'!important');
 if(value.text)declarations.push('color:'+value.text+'!important');
 if(value.border)declarations.push('border-color:'+value.border+'!important');
 if(value.font)declarations.push('font-family:'+FONTS[value.font]+'!important');
 if(value.size)declarations.push('font-size:'+value.size+'px!important');
 if(declarations.length)for(const selector of part.selectors)rules.push('#bulletinBoardModule '+selector+'{'+declarations.join(';')+'}');
 }return rules.join('\n');}
function renderControl(id,current,esc){const p=byTarget(id);if(!p)return '';current=sanitize({[p.id]:current})[p.id]||{};
 const names={text:'Text',fill:'Background fill',border:'Border'};
 const fields=p.fields.map(f=>{
  if(f==='font')return '<div class="labelled"><label for="bb-font">Font family</label><select id="bb-font" data-bb-part="'+p.id+'" data-bb-field="font">'+Object.keys(FONTS).map(k=>'<option value="'+esc(k)+'"'+((current.font||'System')===k?' selected':'')+'>'+esc(k)+'</option>').join('')+'</select></div>';
  if(f==='size')return '<div class="control-head"><label for="bb-size">Font size</label><output id="bb-size-readout">'+(current.size||14)+'px</output></div><input id="bb-size" type="range" min="9" max="42" value="'+(current.size||14)+'" data-bb-part="'+p.id+'" data-bb-field="size">';
  const val=current[f]|| (f==='fill'?'#F8FBFF':f==='text'?'#203C57':'#99B4CD');
  return '<div class="color-row"><label for="bb-'+p.id+'-'+f+'">'+names[f]+'</label><input id="bb-'+p.id+'-'+f+'" type="color" data-bb-part="'+p.id+'" data-bb-field="'+f+'" value="'+val+'"><input type="text" class="hex" aria-label="'+names[f]+' hex" maxlength="7" data-bb-hex="'+f+'" data-bb-part="'+p.id+'" value="'+val+'"></div>';
 }).join('');
 return '<h2>Bulletin Board · '+esc(p.label)+'</h2><p class="subtle">These controls are taken from the original bulletin board designer and apply only to this bulletin part. Layout, spacing and drag geometry remain unchanged.</p><div class="labelled"><label for="bulletinQuickPart">Bulletin part</label><select id="bulletinQuickPart">'+PARTS.map(x=>'<option value="bb-'+x.id+'"'+(x.id===p.id?' selected':'')+'>'+esc(x.label)+'</option>').join('')+'</select></div><div class="surface stack">'+fields+'</div><button type="button" class="ui" data-action="resetBulletinPart">Reset this bulletin part</button>';
}
window.OurSpaceBulletinDesign={parts:clone(PARTS),byTarget,sanitize,compile,renderControl,FONTS};
})();
