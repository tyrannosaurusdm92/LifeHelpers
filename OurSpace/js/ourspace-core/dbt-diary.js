
function formElements(){return Array.from(document.querySelectorAll('.dbt-diary-module[data-save] input,.dbt-diary-module[data-save] textarea,.dbt-diary-module[data-save] select'));}
function getModule(){return document.querySelector('.dbt-diary-module[data-save]');}
function getKey(){return getModule().dataset.storageKey;}
function serializeForm(){
  const data={_savedAt:new Date().toISOString()};
  formElements().forEach(el=>{
    if(!el.name) return;
    if(el.type==='checkbox') data[el.name]=el.checked;
    else data[el.name]=el.value;
  });
  return data;
}
function applyData(data){
  if(!data) return;
  formElements().forEach(el=>{
    if(!el.name || !(el.name in data)) return;
    if(el.type==='checkbox') el.checked=!!data[el.name];
    else el.value=data[el.name];
  });
  updateStatus(data._savedAt ? 'Loaded saved browser copy from '+new Date(data._savedAt).toLocaleString()+'.' : 'Loaded saved browser copy.');
}
function updateStatus(msg){const s=document.getElementById('status'); if(s) s.textContent=msg || '';}
function saveBrowser(){
  localStorage.setItem(getKey(), JSON.stringify(serializeForm()));
  updateStatus('Saved to this browser at '+new Date().toLocaleString()+'.');
}
function loadBrowser(){
  const raw=localStorage.getItem(getKey());
  if(!raw){updateStatus('No saved browser copy found for this sheet yet.'); return;}
  try{applyData(JSON.parse(raw));}catch(e){updateStatus('Saved browser copy could not be loaded.');}
}
function clearSheet(){
  if(!confirm('Clear this visible sheet? Browser saved copy will stay unless you save again.')) return;
  formElements().forEach(el=>{ if(el.type==='checkbox') el.checked=false; else el.value=''; });
  updateStatus('Sheet cleared. Use Save to Browser if you want the blank copy saved.');
}
function exportTxt(){
  const data=serializeForm();
  const lines=[];
  lines.push(document.querySelector('.dbt-title-card h1').textContent.trim());
  lines.push('Exported: '+new Date().toLocaleString());
  lines.push('');
  ['week_of','filled_in_session','fill_frequency','support_notes'].forEach(k=>{ if(data[k]) lines.push(k.replaceAll('_',' ')+': '+data[k]); });
  lines.push('');
  lines.push('SKILLS SIDE MENU');
  document.querySelectorAll('.dbt-skill-name').forEach(skill=>{
    const slug=skill.dataset.skill;
    const used=[];
    ['Mon','Tues','Wed','Thurs','Fri','Sat','Sun'].forEach(d=>{ if(data[`skill_${slug}_${d}`]) used.push(d); });
    if(used.length) lines.push('- '+skill.textContent.trim()+': '+used.join(', '));
  });
  lines.push('');
  lines.push('DAILY CARD');
  document.querySelectorAll('[data-day-row]').forEach(row=>{
    const d=row.dataset.dayRow;
    lines.push(''); lines.push(d+':');
    Array.from(row.querySelectorAll('input, textarea, select')).forEach(el=>{
      const label=el.dataset.label || el.name;
      const val=el.type==='checkbox' ? (el.checked?'yes':'') : el.value;
      if(val) lines.push('  '+label+': '+val);
    });
  });
  lines.push(''); lines.push('REFLECTIONS');
  document.querySelectorAll('[data-reflection]').forEach(el=>{
    if(el.value) lines.push((el.dataset.label||el.name)+': '+el.value);
  });
  const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=(getModule().dataset.fileBase||'diary-card')+'_'+new Date().toISOString().slice(0,10)+'.txt';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  updateStatus('TXT exported.');
}
function syncCloneFormValues(root){
  root.querySelectorAll('input, textarea, select').forEach((el)=>{
    if(el.tagName==='TEXTAREA') el.textContent=el.value;
    if(el.tagName==='SELECT') Array.from(el.options).forEach(opt=>{ if(opt.value===el.value) opt.setAttribute('selected','selected'); else opt.removeAttribute('selected'); });
    if(el.tagName==='INPUT'){
      if(el.type==='checkbox') { if(el.checked) el.setAttribute('checked','checked'); else el.removeAttribute('checked'); }
      else el.setAttribute('value', el.value || '');
    }
  });
}
function savePng(){
  saveBrowser();
  const target=getModule();
  const clone=target.cloneNode(true);
  syncCloneFormValues(clone);
  const controls=clone.querySelector('.dbt-controls');
  if(controls) controls.remove();
  const side=clone.querySelector('.dbt-side-menu');
  if(side){side.style.position='static'; side.style.maxHeight='none'; side.style.overflow='visible';}
  clone.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
  clone.style.width=Math.max(target.scrollWidth, 1200)+'px';
  clone.style.maxWidth='none';
  clone.style.boxShadow='none';
  clone.style.borderRadius='0';
  clone.style.margin='0';
  const measureBox=document.createElement('div');
  measureBox.style.cssText='position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;width:max-content;height:auto;overflow:visible;';
  measureBox.appendChild(clone);
  document.body.appendChild(measureBox);
  const w=Math.max(clone.scrollWidth, target.scrollWidth, 1200);
  const h=Math.max(clone.scrollHeight, target.scrollHeight, 900);
  const css=document.querySelector('#sheet-css').textContent;
  const html=`<div xmlns="http://www.w3.org/1999/xhtml"><style>${css}</style>${clone.outerHTML}</div>`;
  measureBox.remove();
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
  const img=new Image();
  const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  img.onload=()=>{
    const canvas=document.createElement('canvas');
    canvas.width=w*2; canvas.height=h*2;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.scale(2,2); ctx.drawImage(img,0,0);
    URL.revokeObjectURL(url);
    canvas.toBlob((png)=>{
      if(!png){updateStatus('PNG export was blocked by this browser. TXT export still works.'); return;}
      const a=document.createElement('a');
      a.href=URL.createObjectURL(png);
      a.download=(getModule().dataset.fileBase||'diary-card')+'_'+new Date().toISOString().slice(0,10)+'.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href),1000);
      updateStatus('PNG saved.');
    },'image/png');
  };
  img.onerror=()=>{URL.revokeObjectURL(url); updateStatus('PNG export failed in this browser. Try TXT export or Print to PDF.');};
  img.src=url;
}
function wireAutosave(){
  formElements().forEach(el=>el.addEventListener('input',()=>{
    clearTimeout(window.__saveTimer);
    window.__saveTimer=setTimeout(()=>{localStorage.setItem(getKey(), JSON.stringify(serializeForm())); updateStatus('Autosaved in this browser.');},500);
  }));
  loadBrowser();
}
document.addEventListener('DOMContentLoaded', wireAutosave);

