/* DBT Print / Save as PDF — browser-native printing.
 * Uses window.print(): the user selects a physical printer or "Save as PDF"
 * in the browser/OS dialog. JavaScript cannot choose a printer, silently save
 * a PDF, or produce an interactive PDF AcroForm through browser printing.
 *
 * Inspired by Foxit Reader print-content choices:
 *   filled  = worksheet with filled answers (default)
 *   blank   = worksheet without entered answers
 *   answers = a simple question-and-answer listing
 *
 * Existing buttons: <button data-dbt-print data-dbt-print-mode="filled">Print</button>
 * Optional data-dbt-print-target="#worksheet-id" on buttons.
 * If no print button exists, a small toolbar (mode selector + print button) is
 * added to each worksheet. No theme/editor/third-party PDF libraries added.
 * Scripts can also call DBTPrintExport.print(root, {mode:'blank'});
 * The print clone expands overflowing fields; screen editing is untouched.
 */
(() => {
  'use strict';
  if(window.DBTPrintExport)return;
  const ROOTS='[data-dbt-print-root],[data-dbt-worksheet],.dbt-worksheet,[data-worksheet],.worksheet-page';
  const BUTTONS='[data-dbt-print],[data-worksheet-print]';
  const MODES=['filled','blank','answers'];
  let stage=null,selectedRoot=null,selectedMode='filled',cleanTimer=null,initialized=false;
  const CSS=`
    .dbt-print-toolbar { display:flex;align-items:center;justify-content:flex-end;
      flex-wrap:wrap;gap:.6em;margin:0 0 .8rem; }
    .dbt-print-toolbar label { display:inline-flex;align-items:center;flex-wrap:wrap;gap:.4em;
      font-weight:600; }
    .dbt-print-toolbar select { min-height:40px;max-width:100%;width:auto;
      border:1px solid var(--line,#336699);border-radius:6px;
      padding:.4em .55em;background:var(--surface,#ffffff);color:var(--ink,#243950); }
    .dbt-print-button { display:inline-flex;align-items:center;justify-content:center;
      border:1px solid var(--line,#336699);background:var(--accent,#6699cc);
      color:var(--ink,#243950);padding:.6em 1em;border-radius:8px;
      font:inherit;font-weight:700;line-height:1.3;cursor:pointer;min-height:40px; }
    .dbt-print-button:focus-visible {outline:2px solid var(--accent2,#ff6600);outline-offset:3px;}
    .dbt-print-help { flex-basis:100%;text-align:right;line-height:1.35;
      font-size:.82rem;color:var(--muted,#336699); }
    .dbt-print-stage {display:none;}
    @page {size:auto;margin:12mm;}
    @media print {
      html,body {width:auto!important;min-height:0!important;height:auto!important;
        margin:0!important;padding:0!important;overflow:visible!important;}
      body.dbt-print-isolated > :not(.dbt-print-stage) {display:none!important;}
      body.dbt-print-isolated > .dbt-print-stage {display:block!important;position:static!important;
        width:100%!important;max-width:none!important;min-height:0!important;height:auto!important;
        overflow:visible!important;margin:0!important;padding:0!important;border:0!important;}
      .dbt-print-stage,.dbt-print-stage * {print-color-adjust:exact;-webkit-print-color-adjust:exact;}
      .dbt-print-stage :is(.master-nav,.jump-nav,.toolbar,.sav-toolbar,.site-header,.site-footer,
        .footer,.dbt-print-toolbar,.dbt-resize-handle,[data-dbt-no-print],
        [data-dbt-print],[data-worksheet-print],script) {display:none!important;}
      .dbt-print-stage :is(.dbt-resizable,.dbt-user-sized,.dbt-worksheet,.worksheet-page,
        .dbt-responsive,.module-body,.page-frame,.iframe-scrollport) {
        max-width:100%!important;width:auto!important;height:auto!important;max-height:none!important;
        min-height:0!important;left:auto!important;top:auto!important;right:auto!important;
        position:static!important;transform:none!important;overflow:visible!important;}
      .dbt-print-stage :is(.grid-2,.grid-3,.grid-4,.two-col,.three-col,.field-grid,.form-grid,.worksheet-grid) {
        grid-template-columns:minmax(0,1fr)!important;}
      .dbt-print-stage :is(.module,.card,.question,.worksheet-section,.handout) {
        overflow:visible!important;max-height:none!important;break-inside:auto!important;}
      .dbt-print-stage :is(.module-hd,.page-title,h1,h2,h3,legend) {break-after:avoid-page;}
      .dbt-print-stage :is(.dbt-print-value,.dbt-print-editable) {
        box-sizing:border-box!important;width:auto!important;min-width:0!important;max-width:100%!important;
        height:auto!important;max-height:none!important;min-height:1.2em!important;
        overflow:visible!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;
        word-break:normal!important;line-height:1.45!important;}
      .dbt-print-stage .dbt-print-value {display:block;padding:.35em .5em;margin:.15em 0 .3em;
        border:1px solid #b1d0f0;border-radius:3px;color:#003399!important;background:#ffffff!important;}
      .dbt-print-stage .dbt-print-inline {display:inline!important;border:0!important;padding:0!important;
        margin:0!important;background:transparent!important;}
      .dbt-print-stage .dbt-print-editable {background:#ffffff!important;color:#003399!important;
        padding:.35em .5em;border:1px solid #b1d0f0;}
      .dbt-print-stage .dbt-print-answer-row {margin:0 0 1rem;break-inside:auto;}
      .dbt-print-stage .dbt-print-answer-label {font-weight:700;break-after:avoid-page;}
      .dbt-print-stage .dbt-print-answer-list {max-width:100%;font:inherit;}
      .dbt-print-stage .dbt-print-answers-title {margin:0 0 1rem;}
      .dbt-print-stage :is(img,svg,video,canvas) {max-width:100%!important;height:auto!important;}
      .dbt-print-stage table {width:100%!important;table-layout:auto;border-collapse:collapse;}
      .dbt-print-stage tr {break-inside:avoid;}
      .dbt-print-stage :is(td,th) {overflow-wrap:anywhere;}
      .dbt-print-stage a {color:inherit!important;}
    }
  `;
  function styles(){
    if(document.getElementById('dbt-print-style'))return;
    const s=document.createElement('style');s.id='dbt-print-style';s.textContent=CSS;document.head.append(s);
  }
  const modeValue=value=>MODES.includes(value)?value:'filled';
  function roots(){
    const matches=[...document.querySelectorAll(ROOTS)].filter(el=>!el.closest('.dbt-print-stage'));
    return matches.filter(el=>!matches.some(other=>other!==el&&other.contains(el)));
  }
  function isVisible(el){
    if(!el||el.closest('.dbt-print-stage'))return false;
    const css=getComputedStyle(el);
    return css.display!=='none'&&css.visibility!=='hidden'&&el.getClientRects().length>0;
  }
  function findRoot(button){
    const target=button?.dataset?.dbtPrintTarget;
    if(target){try{const node=document.querySelector(target);if(node)return node;}catch(_){}}
    const local=button?.closest(ROOTS);
    if(local)return local;
    return roots().find(isVisible)||document.querySelector('main')||document.querySelector('article')||document.body;
  }
  function controlLabel(control,index){
    const host=control.closest('[data-dbt-type]');
    const own=host?.dataset.dbtLabel || control.dataset.dbtLabel || control.getAttribute('aria-label');
    if(own)return own.trim();
    if(control.id){
      const found=[...document.querySelectorAll('label[for]')].find(n=>n.htmlFor===control.id);
      if(found)return found.textContent.trim();
    }
    const labelled=control.closest('label');
    if(labelled)return labelled.textContent.trim();
    const prev=control.previousElementSibling;
    if(prev?.matches?.('label,legend,.question,.prompt'))return prev.textContent.trim();
    return control.name||control.placeholder||`Answer ${index+1}`;
  }
  function labelForAnswer(el,index){
    const host=el.closest('[data-dbt-type]');
    const own=host?.dataset.dbtLabel || el.dataset.dbtLabel || el.getAttribute('aria-label');
    if(own)return own;
    const prev=el.previousElementSibling;
    return (prev?.textContent||'').trim().slice(0,180)||`Answer ${index+1}`;
  }
  function replaceControl(orig,copy,mode){
    if(!copy)return;
    const type=(orig.getAttribute('type')||'').toLowerCase();
    if(['hidden','file','button','submit','reset','password'].includes(type)||
      orig.matches('button')||orig.closest('[data-dbt-no-print]')) {copy.remove();return;}
    const mark=type==='checkbox'||type==='radio';
    const out=document.createElement(mark?'span':'div');
    out.className=`dbt-print-value${mark?' dbt-print-inline':''}`;
    out.dataset.dbtPrintAnswer='';
    if(type==='checkbox')out.textContent=(mode!=='blank'&&orig.checked)?'☑':'☐';
    else if(type==='radio')out.textContent=(mode!=='blank'&&orig.checked)?'◉':'○';
    else if(orig.matches('select')) {
      out.textContent=mode==='blank'?'\u00a0':
        ([...orig.selectedOptions].filter(opt=>opt.value!=='').map(opt=>opt.textContent.trim()).join(', ')||'\u00a0');
    } else out.textContent=mode==='blank'?'\u00a0':(orig.value||'\u00a0');
    if(orig.hasAttribute('aria-label'))out.setAttribute('aria-label',orig.getAttribute('aria-label'));
    copy.replaceWith(out);
  }
  function resetResizing(copy){
    // Strip every temporary expanded/collapsed panel measurement before printing.
    // Pass 2 exclusions are kept; the attached print module predates them.
    copy.querySelectorAll('[data-dbt-resizable],.dbt-resizable,.dbt-user-sized').forEach(el=>{
      ['width','height','max-width','max-height','left','top','right','bottom','overflow','overflow-y','overflow-x','transform','position','margin-left','margin-right','justify-self']
        .forEach(prop=>el.style.removeProperty(prop));
      el.classList.remove('dbt-user-sized','dbt-height-sized','dbt-resizing','dbt-narrow','dbt-medium');
      ['--dbt-ui-scale','--dbt-panel-pad','--dbt-panel-gap','--dbt-card-title'].forEach(name=>el.style.removeProperty(name));
    });
    // Original font sizes are recorded on scaled elements by onyx_widget_resizing-responsive.js.
    copy.querySelectorAll('[data-dbt-original-font-size]').forEach(el=>{
      const size=el.dataset.dbtOriginalFontSize;
      if(size)el.style.fontSize=size;else el.style.removeProperty('font-size');
      el.removeAttribute('data-dbt-original-font-size');
    });
  }
  function copyValues(source,clone,mode){
    const originals=[...source.querySelectorAll('input,textarea,select')];
    const duplicates=[...clone.querySelectorAll('input,textarea,select')];
    originals.forEach((el,i)=>replaceControl(el,duplicates[i],mode));
    const srcEdits=[...source.querySelectorAll('[contenteditable]')];
    const clonedEdits=[...clone.querySelectorAll('[contenteditable]')];
    srcEdits.forEach((el,i)=>{
      const dest=clonedEdits[i];if(!dest)return;
      dest.removeAttribute('contenteditable');dest.classList.add('dbt-print-editable');
      dest.removeAttribute('data-dbt-placeholder');
      dest.textContent=mode==='blank'?'\u00a0':(el.innerText||el.textContent||'\u00a0');
    });
    clone.querySelectorAll('.dbt-resize-handle,.dbt-resize-controls,.sav-resize-handle,[data-dbt-no-print],.dbt-print-toolbar,script,datalist')
      .forEach(el=>el.remove());
    resetResizing(clone);
  }
  function answersOnly(source){
    const list=document.createElement('section');
    list.className='dbt-print-answer-list';
    const title=document.createElement('h1');title.className='dbt-print-answers-title';
    title.textContent=(source.querySelector('h1')?.textContent||document.title||'DBT Worksheet')+' — Answers';
    list.append(title);
    const items=[...source.querySelectorAll('input,textarea,select,[contenteditable="true"]')]
      .filter(el=>!el.closest('[data-dbt-ignore],[data-dbt-no-print],[data-dbt-no-save],.dbt-print-toolbar'))
      .filter(el=>!el.matches('[type="hidden"],[type="button"],[type="reset"],[type="submit"],[type="file"],[type="password"]'));
    const grouped=new Set();
    const groups=new Set();
    items.forEach((el,i)=>{
      const host=el.closest('[data-dbt-type]');
      const radio=el.matches('input[type=radio]');
      const checkbox=el.matches('input[type=checkbox]');
      // Keep each group together, without repeating its question.
      if(host&&(radio||checkbox)) {
        if(groups.has(host))return;
        groups.add(host);
        host.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(opt=>grouped.add(opt));
        const chosen=[...host.querySelectorAll('input[type=radio]:checked,input[type=checkbox]:checked')]
          .map(opt=>opt.closest('label')?.textContent?.trim()||opt.value).filter(Boolean);
        addAnswer(list,host.dataset.dbtLabel||host.querySelector('legend')?.textContent||`Question ${i+1}`,
          chosen.length?chosen.join(', '):'Not selected');
        return;
      }
      if(grouped.has(el))return;
      if(radio||checkbox){
        addAnswer(list,controlLabel(el,i),el.checked?'Selected':'Not selected');return;
      }
      const label=el.isContentEditable?labelForAnswer(el,i):controlLabel(el,i);
      const value=el.isContentEditable?(el.innerText||el.textContent||''):
        el.matches('select')?[...el.selectedOptions].filter(o=>o.value!=='').map(o=>o.textContent.trim()).join(', '):el.value;
      addAnswer(list,label,value||'—');
    });
    return list;
  }
  function addAnswer(parent,label,value){
    const row=document.createElement('div');row.className='dbt-print-answer-row';
    const header=document.createElement('div');header.className='dbt-print-answer-label';header.textContent=label;
    const body=document.createElement('div');body.className='dbt-print-value';body.textContent=value;
    row.append(header,body);parent.append(row);
  }
  function cleanup(){
    if(cleanTimer){clearTimeout(cleanTimer);cleanTimer=null;}
    document.body.classList.remove('dbt-print-isolated');
    stage?.remove();stage=null;
  }
  function prepare(root=null,options={}){
    if(stage)return stage;
    const source=root||selectedRoot||findRoot();
    if(!source||source.closest('.dbt-print-stage'))return null;
    const mode=modeValue(typeof options==='string'?options:options.mode||selectedMode);
    window.DBTWorksheetEntry?.save?.(source);
    styles();
    const rendered=mode==='answers'?answersOnly(source):source.cloneNode(true);
    if(mode!=='answers')copyValues(source,rendered,mode);
    stage=document.createElement('div');stage.className='dbt-print-stage';
    stage.setAttribute('aria-hidden','true');stage.dataset.dbtPrintMode=mode;
    stage.append(rendered);document.body.append(stage);
    document.body.classList.add('dbt-print-isolated');
    return stage;
  }
  function print(root=null,options={}){
    selectedRoot=root||findRoot();
    selectedMode=modeValue(typeof options==='string'?options:options.mode||'filled');
    prepare(selectedRoot,{mode:selectedMode});
    try{window.print();}
    catch(error){cleanup();throw error;}
    // Most browsers fire afterprint. Fallback only after print() returns;
    // do not remove the stage while the synchronous print dialog is open.
    if(stage)cleanTimer=setTimeout(()=>{cleanup();selectedRoot=null;},60000);
    return true; // Indicates dialog requested, NOT that printing/PDF saving succeeded.
  }
  function toolbar(){
    roots().forEach(root=>{
      if(root.querySelector(BUTTONS))return;
      const bar=document.createElement('div');bar.className='dbt-print-toolbar';bar.dataset.dbtNoPrint='';bar.dataset.dbtNoSave='';
      const lbl=document.createElement('label');lbl.textContent='Print content: ';
      const select=document.createElement('select');select.dataset.dbtPrintModeSelect='';
      select.setAttribute('aria-label','Content to print');
      [['filled','Worksheet + answers'],['blank','Blank worksheet'],['answers','Answers only']]
        .forEach(([value,text])=>{const opt=document.createElement('option');opt.value=value;opt.textContent=text;select.append(opt);});
      lbl.append(select);
      const button=document.createElement('button');button.type='button';button.dataset.dbtPrint='';
      button.className='dbt-print-button';button.textContent='Print / Save as PDF';
      const help=document.createElement('span');help.className='dbt-print-help';
      help.textContent='In the print dialog, select your printer or choose Save as PDF.';
      bar.append(lbl,button,help);root.insertBefore(bar,root.firstChild);
    });
  }
  function init(){
    if(initialized)return;initialized=true;styles();toolbar();
    document.addEventListener('click',event=>{
      const btn=event.target.closest?.(BUTTONS);if(!btn)return;
      event.preventDefault();
      const parent=btn.closest('.dbt-print-toolbar');
      const mode=btn.dataset.dbtPrintMode||parent?.querySelector('[data-dbt-print-mode-select]')?.value||'filled';
      print(findRoot(btn),{mode});
    });
    window.addEventListener('beforeprint',()=>{
      // Ctrl+P/OS File > Print uses the filled worksheet by default.
      if(!stage)prepare(selectedRoot,{mode:selectedMode});
    });
    window.addEventListener('afterprint',()=>{cleanup();selectedRoot=null;selectedMode='filled';});
  }
  window.DBTPrintExport={init,print,prepare,cleanup};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
