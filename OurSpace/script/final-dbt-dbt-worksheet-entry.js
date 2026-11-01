/* DBT Worksheet Entry — editable HTML worksheet fields inspired by PDF forms.
 * Built using Adobe Acrobat/Foxit form field conventions, but does not author
 * an interactive AcroForm PDF. No dependencies, server, or external requests.
 *
 * <main data-dbt-worksheet data-dbt-save-key="distress-tolerance">
 *   <div data-dbt-field="thoughts" data-dbt-type="multiline"
 *        data-dbt-label="Describe the situation"></div>
 *   <div data-dbt-field="notes" data-dbt-type="scroll"
 *        data-dbt-label="Additional notes" data-dbt-scroll-height="140"></div>
 *   <div data-dbt-field="skills" data-dbt-type="checkboxes"
 *        data-dbt-label="Skills used" data-dbt-options="STOP|TIP|ACCEPTS"></div>
 *   <div data-dbt-field="urge" data-dbt-type="radio"
 *        data-dbt-label="Urge level" data-dbt-options="Low|Medium|High"></div>
 *   <div data-dbt-field="frequency" data-dbt-type="select"
 *        data-dbt-label="Frequency" data-dbt-options="Never|Sometimes|Often"></div>
 *   <div data-dbt-field="activities" data-dbt-type="multiselect"
 *        data-dbt-label="Activities" data-dbt-options='["Walk","Write","Breathe"]'></div>
 *   <div data-dbt-field="other" data-dbt-type="combobox"
 *        data-dbt-label="Skill" data-dbt-options="Mindfulness|Opposite action"></div>
 * </main>
 *
 * Standard <input>, <select>, <textarea>, or [contenteditable] work too.
 * Plain answer areas marked [data-dbt-answer], .dbt-answer, .answer-box, etc.
 * become editable in place. A marker with data-dbt-type is instead rendered
 * as an appropriate native control; no editor toolbars or themes are added.
 * Options: data-dbt-label, data-dbt-tooltip, data-dbt-required,
 * data-dbt-readonly, data-dbt-maxlength, data-dbt-placeholder,
 * data-dbt-scroll, data-dbt-fixed-height, data-dbt-min/max/step,
 * data-dbt-default, data-dbt-key, data-dbt-ignore, data-dbt-no-save.
 * data-dbt-options accepts a JSON array, |, newline, or comma-separated values.
 *
 * Autosave is stored in localStorage on this device, under the worksheet URL.
 * This is not secure encrypted medical record storage. Avoid shared devices.
 */
(() => {
  'use strict';
  if (window.DBTWorksheetEntry) return;
  const ROOTS = '[data-dbt-worksheet], .dbt-worksheet, [data-worksheet], .worksheet-page';
  const ANSWERS = '[data-dbt-answer], [data-dbt-field], [data-worksheet-field], [data-fillable], [data-dbt-editable], .dbt-answer, .worksheet-answer, .answer-box, .answer-space, .write-in';
  const CONTROLS = 'input,textarea,select,[contenteditable="true"]';
  const FORM_SPEC = '[data-dbt-type]';
  const KEY_PREFIX = 'dbt-worksheet-entry:v1:'; // Keep prior saves readable.
  const instances = new Map();
  let installed = false;
  let sequence = 0;
  const CSS = `
    .dbt-entry-editable { min-width:0;min-height:3.2em;padding:.55em .7em;
      white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;
      outline-offset:2px;border:1px dashed var(--line,#7b9fa7);
      border-radius:6px;background:var(--surface,#fff);color:var(--ink,#102a30); }
    .dbt-entry-editable:empty::before { content:attr(data-dbt-placeholder);
      color:var(--muted,#666);opacity:.72;pointer-events:none; }
    .dbt-entry-editable:focus-visible,.dbt-entry-control:focus-visible {
      outline:2px solid var(--accent,#128c9f);outline-offset:2px; }
    .dbt-entry-generated { min-width:0;max-width:100%; }
    .dbt-entry-generated :is(input,textarea,select) { max-width:100%;font:inherit; }
    .dbt-entry-legend,.dbt-entry-label { display:block;min-width:0;margin:0 0 .35em;
      font-weight:700;color:inherit;overflow-wrap:anywhere; }
    .dbt-entry-group { min-inline-size:0;max-width:100%;margin:.3em 0;padding:.55em .75em;
      border:1px solid var(--line,#7b9fa7);border-radius:7px; }
    .dbt-entry-group .dbt-entry-choice { display:flex;align-items:flex-start;gap:.55em;
      width:100%;min-width:0;padding:.27em 0;cursor:pointer;font-weight:400;
      overflow-wrap:anywhere; }
    .dbt-entry-group :is(input[type=radio],input[type=checkbox]) { width:auto;flex:0 0 auto;
      margin:.18em 0 0;accent-color:var(--accent,#128c9f); }
    .dbt-entry-control:not([type=checkbox]):not([type=radio]) { box-sizing:border-box;
      display:block;width:100%;min-width:0;min-height:2.5em;padding:.45em .6em;
      border:1px solid var(--line,#7b9fa7);border-radius:6px;
      background:var(--surface,#fff);color:var(--ink,#102a30); }
    .dbt-entry-textarea { box-sizing:border-box;display:block;width:100%;min-width:0;
      min-height:4.5em;max-width:100%;overflow-y:hidden;resize:vertical;
      white-space:pre-wrap;overflow-wrap:anywhere; }
    .dbt-entry-scroll { overflow-y:auto!important;resize:vertical;
      min-height:3.8em;scrollbar-gutter:stable; }
    .dbt-entry-combobox { position:relative; }
    .dbt-entry-required::after { content:' *';color:var(--danger,#b53a54); }
    .dbt-entry-invalid { outline:2px solid var(--danger,#b53a54)!important;outline-offset:1px; }
    @media print { .dbt-entry-editable:empty::before { content:none!important; } }
  `;
  function styles() {
    if (document.getElementById('dbt-entry-style')) return;
    const s = document.createElement('style'); s.id = 'dbt-entry-style';
    s.textContent = CSS; document.head.append(s);
  }
  function roots() {
    const els = [...document.querySelectorAll(ROOTS)].filter(e => !e.closest('.dbt-print-stage'));
    const outer = els.filter(el => !els.some(other => other !== el && other.contains(el)));
    return outer.length ? outer : [document.querySelector('main') || document.body].filter(Boolean);
  }
  function labelFor(el) {
    const own = el.dataset.dbtLabel || el.getAttribute('aria-label');
    if (own) return own.trim();
    if (el.id) {
      const labels = document.querySelectorAll('label[for]');
      const found = [...labels].find(label => label.htmlFor === el.id);
      if (found) return found.textContent.trim();
    }
    const label = el.closest('label') || el.previousElementSibling;
    return label?.textContent?.trim().slice(0, 160) || 'Worksheet answer';
  }
  function opts(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(x => typeof x === 'object' && x !== null
        ? { value: String(x.value ?? x.label ?? ''), label: String(x.label ?? x.value ?? '') }
        : { value: String(x), label: String(x) });
    } catch (_) { /* Text-delimited options are valid. */ }
    const delimiter = raw.includes('|') ? '|' : raw.includes('\n') ? '\n' : ',';
    return raw.split(delimiter).map(s => s.trim()).filter(Boolean)
      .map(s => ({ value: s, label: s }));
  }
  function settings(el, control) {
    const source = el.dataset;
    control.classList.add('dbt-entry-control');
    const textLabel = labelFor(el);
    if (textLabel && !control.hasAttribute('aria-label')) control.setAttribute('aria-label', textLabel);
    if (source.dbtTooltip) control.title = source.dbtTooltip;
    if (el.hasAttribute('data-dbt-required')) control.required = true;
    if (el.hasAttribute('data-dbt-readonly')) {
      if ('readOnly' in control) control.readOnly = true;
      else control.disabled = true;
    }
    if (source.dbtMaxlength && 'maxLength' in control) {
      const length = parseInt(source.dbtMaxlength,10); if (length > 0) control.maxLength = length;
    }
    if (source.dbtPlaceholder && 'placeholder' in control) control.placeholder = source.dbtPlaceholder;
    for (const key of ['min','max','step']) if (source[`dbt${key[0].toUpperCase()}${key.slice(1)}`] && key in control)
      control[key] = source[`dbt${key[0].toUpperCase()}${key.slice(1)}`];
    if (source.dbtDefault !== undefined && 'value' in control) control.value = source.dbtDefault;
    return control;
  }
  function make(tag, attrs = {}) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => { if (k === 'text') el.textContent = v; else el.setAttribute(k,String(v)); });
    return el;
  }
  function renderSpec(el) {
    if (el.hasAttribute('data-dbt-field-ready')) return;
    if (el.closest('.dbt-print-stage,[data-dbt-ignore]')) return;
    const type = (el.dataset.dbtType || 'multiline').toLowerCase().replace(/[\s_]+/g,'-');
    // Existing input/textarea/select nodes are already real form controls.
    if (el.matches('input,textarea,select')) {
      settings(el,el); el.dataset.dbtFieldReady=''; return;
    }
    if (el.querySelector(':scope > .dbt-entry-generated')) { el.dataset.dbtFieldReady='';return; }
    const wrap = make('div', { class: 'dbt-entry-generated' });
    const fieldName = el.dataset.dbtField || el.dataset.fieldId || el.id || `field-${++sequence}`;
    const options = opts(el.dataset.dbtOptions);
    const labelText = el.dataset.dbtLabel || '';
    const idPrefix = `dbt-input-${++sequence}`;
    if (['checkboxes','checkbox-group','multi-choice','multiple-choice','radio','radios','checkbox','check'].includes(type)) {
      const isRadio = ['radio','radios'].includes(type);
      const fieldset = make('fieldset',{ class:'dbt-entry-group' });
      if (el.hasAttribute('data-dbt-required') && !isRadio) fieldset.dataset.dbtRequireOne = '';
      const legend = make('legend', {class:'dbt-entry-legend', text:labelText || (isRadio ? 'Choose one' : 'Select any')});
      if (el.hasAttribute('data-dbt-required')) legend.classList.add('dbt-entry-required');
      fieldset.append(legend);
      const choices = options.length ? options : [{value:'yes',label:labelText || 'Yes'}];
      choices.forEach((item,i) => {
        const choice = make('label', {class:'dbt-entry-choice'});
        const box = make('input',{ type: isRadio ? 'radio' : 'checkbox', name: isRadio ? `${idPrefix}-choice` : `${idPrefix}-${i}`,
          value:item.value, 'data-dbt-key':`${fieldName}/option/${i}`, 'aria-label':item.label });
        if (isRadio && el.hasAttribute('data-dbt-required')) box.required = true;
        if (el.hasAttribute('data-dbt-readonly')) box.disabled = true;
        if (el.dataset.dbtDefault?.split('|').includes(item.value)) box.checked = true;
        choice.append(box, document.createTextNode(item.label)); fieldset.append(choice);
      });
      wrap.append(fieldset);
    } else {
      if (labelText) {
        const label = make('label',{class:'dbt-entry-label',for:idPrefix,text:labelText});
        if (el.hasAttribute('data-dbt-required')) label.classList.add('dbt-entry-required');
        wrap.append(label);
      }
      let control;
      if (['multiline','textarea','paragraph','scroll','scrollable','long-text'].includes(type)) {
        control = make('textarea',{id:idPrefix,rows: type === 'scroll' || type === 'scrollable' ? 4 : 3});
        if (['scroll','scrollable','long-text'].includes(type)) control.dataset.dbtScroll = '';
      } else if (['select','dropdown','list','multiselect','listbox','list-multiple'].includes(type)) {
        control = make('select',{id:idPrefix});
        const multi = ['multiselect','listbox','list-multiple'].includes(type);
        if (multi) {control.multiple=true;control.size=Math.max(3,Math.min(options.length,8));}
        else control.append(make('option',{value:'',text: el.dataset.dbtPlaceholder || 'Choose an option'}));
        options.forEach(item=>control.append(make('option',{value:item.value,text:item.label})));
      } else {
        const inputType = ['date','time','number','email','tel'].includes(type) ? type : 'text';
        control = make('input',{id:idPrefix,type:inputType});
        if (['combobox','combo','autocomplete','editable-select'].includes(type)) {
          const listId = `${idPrefix}-options`;
          control.setAttribute('list',listId);
          const list = make('datalist',{id:listId});
          options.forEach(item=>list.append(make('option',{value:item.value,text:item.label})));
          wrap.append(list);
        }
      }
      if (el.dataset.dbtKey) control.dataset.dbtKey=el.dataset.dbtKey;
      else control.dataset.dbtKey=fieldName;
      settings(el,control);
      wrap.append(control);
    }
    el.append(wrap);
    el.dataset.dbtFieldReady='';
    el.classList.add('dbt-entry-field');
  }
  function makeEditable(root) {
    root.querySelectorAll(FORM_SPEC).forEach(renderSpec);
    root.querySelectorAll(ANSWERS).forEach(el => {
      if (el.hasAttribute('data-dbt-type') || el.closest('[data-dbt-ignore],.dbt-print-stage')) return;
      if (el.matches('input,textarea,select,button,[contenteditable="false"]')) return;
      if (el.querySelector('input,textarea,select,[contenteditable="true"]')) return;
      if (!el.isContentEditable) el.setAttribute('contenteditable','true');
      el.classList.add('dbt-entry-editable');
      el.setAttribute('role','textbox'); el.setAttribute('aria-multiline','true');
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label',labelFor(el));
      if (!el.dataset.dbtPlaceholder) el.dataset.dbtPlaceholder = 'Enter your answer';
      if (el.hasAttribute('data-dbt-readonly')) {el.contentEditable='false';el.setAttribute('aria-readonly','true');}
      if (el.hasAttribute('data-dbt-required')) el.setAttribute('aria-required','true');
      if (el.dataset.dbtTooltip) el.title=el.dataset.dbtTooltip;
      el.spellcheck=true;
    });
  }
  function fields(root) {
    return [...root.querySelectorAll(CONTROLS)].filter(el => {
      if (el.matches('input[type="hidden"],input[type="button"],input[type="submit"],input[type="reset"],input[type="file"],input[type="password"]')) return false;
      if (el.closest('[data-dbt-ignore],[data-dbt-no-save],.dbt-print-toolbar,.dbt-print-stage')) return false;
      if (el.isContentEditable && el.parentElement?.closest('[contenteditable="true"]')) return false;
      return true;
    });
  }
  function getValue(el) {
    if (el.matches('input[type="checkbox"],input[type="radio"]')) return !!el.checked;
    if (el.matches('select[multiple]')) return [...el.selectedOptions].map(x=>x.value);
    if (el.isContentEditable) return el.innerText ?? el.textContent ?? '';
    return el.value;
  }
  function putValue(el,value) {
    if (el.matches('input[type="checkbox"],input[type="radio"]')) el.checked = value===true;
    else if (el.matches('select[multiple]')) {
      const selected = Array.isArray(value) ? value : [];
      [...el.options].forEach(opt=>{opt.selected=selected.includes(opt.value);});
    } else if (el.isContentEditable) el.textContent=String(value??'');
    else el.value=String(value??'');
  }
  function scrollMode(el) {
    return el.matches('textarea') && (el.hasAttribute('data-dbt-scroll') || el.dataset.dbtType==='scroll' ||
      el.closest('[data-dbt-type="scroll"],[data-dbt-type="scrollable"],[data-dbt-scroll]'));
  }
  function resizeText(el) {
    if (!el.matches('textarea')) return;
    el.classList.add('dbt-entry-textarea');
    if (scrollMode(el) || el.hasAttribute('data-dbt-fixed-height')) {
      el.classList.add('dbt-entry-scroll');
      const h = Number(el.dataset.dbtScrollHeight || el.closest('[data-dbt-scroll-height]')?.dataset.dbtScrollHeight || 150);
      if (!el.hasAttribute('data-dbt-fixed-height')) el.style.height=`${Math.max(70,Math.min(900,h))}px`;
      return;
    }
    el.style.height='auto';
    el.style.height=`${Math.max(el.scrollHeight+2,72)}px`;
  }
  function storageKey(root,index) {
    const id=root.dataset.dbtSaveKey || root.dataset.dbtWorksheet || root.dataset.worksheet || root.id || `worksheet-${index+1}`;
    const profile = new URLSearchParams(location.search).get('onyxProfile');
    const owner = profile && /^(william|jasper)$/i.test(profile) ? `:onyx-profile:${profile.toLowerCase()}` : '';
    return `${KEY_PREFIX}${location.pathname}:${id}${owner}`;
  }
  function keyFor(el,index,used) {
    const marker = el.dataset.dbtKey || el.dataset.fieldId || el.id || el.name || 'answer';
    // data-dbt-key is the preferred stable ID; fall back to the previous index scheme.
    let key = el.dataset.dbtKey ? `id:${marker}` : `${marker}::${index}`;
    if (used.has(key)) key += `:${index}`;
    used.add(key); return key;
  }
  function emit(root,type,detail={}) {root.dispatchEvent(new CustomEvent(type,{bubbles:true,detail}));}
  function setup(root,index) {
    if (instances.has(root)) return instances.get(root);
    makeEditable(root);
    const key=storageKey(root,index);
    let saved={};
    try {
      const obj=JSON.parse(localStorage.getItem(key)||'{}');
      if ([1,2].includes(obj?.version) && obj.fields && typeof obj.fields==='object') saved=obj.fields;
    } catch (_) {}
    const state={root,key,map:new Map(),defaults:new Map(),timer:0,save:null};
    instances.set(root,state);
    function register() {
      const available=fields(root),used=new Set();
      available.forEach((el,i)=>{
        if (state.map.has(el)) {used.add(state.map.get(el));return;}
        const k=keyFor(el,i,used);
        state.map.set(el,k); state.defaults.set(el,getValue(el));
        const oldName=el.dataset.dbtKey || el.dataset.fieldId || el.id || el.name || 'answer';
        const legacy=`${oldName}::${i}`;
        if (Object.prototype.hasOwnProperty.call(saved,k)) putValue(el,saved[k]);
        else if (Object.prototype.hasOwnProperty.call(saved,legacy)) putValue(el,saved[legacy]);
        resizeText(el);
      });
    }
    function save() {
      clearTimeout(state.timer); state.timer=0;
      register();
      const obj={};
      for (const [el,k] of state.map) {
        if (!root.contains(el)) {state.map.delete(el);state.defaults.delete(el);continue;}
        obj[k]=getValue(el);
      }
      try {
        localStorage.setItem(key,JSON.stringify({version:2,fields:obj}));
        emit(root,'dbt:answers-saved',{key,count:Object.keys(obj).length});return true;
      } catch (err) {
        emit(root,'dbt:save-error',{key,message:err?.message||'Local browser storage unavailable'});return false;
      }
    }
    function schedule() {clearTimeout(state.timer);state.timer=setTimeout(save,320);}
    root.addEventListener('input',e=>{
      const target=e.target;
      if (!target?.matches?.(CONTROLS)) return;
      target.classList.remove('dbt-entry-invalid');
      if (target.matches('textarea')) resizeText(target);
      // A field can change the natural worksheet height after typing.
      // Let the responsive frame remeasure without treating text entry as a drag.
      if (target.matches('textarea,[contenteditable="true"]')) {
        const page=target.closest('.pdf-sheet,[data-dbt-resizable]');
        if (page) requestAnimationFrame(()=>page.dispatchEvent(new CustomEvent('dbt:content-resized',{bubbles:true})));
      }
      schedule();
    });
    root.addEventListener('change',e=>{if(e.target?.matches?.(CONTROLS)) schedule();});
    root.addEventListener('focusout',e=>{if(e.target?.matches?.(CONTROLS)) save();});
    state.save=save;
    state.refresh=()=>{makeEditable(root);register();};
    state.clear=()=>{
      clearTimeout(state.timer);saved={};register();
      for(const [el] of state.map) {
        if(!root.contains(el))continue;
        if (el.matches('select:not([multiple])')) el.selectedIndex=0;
        else putValue(el,el.matches('select[multiple]') ? [] : el.matches('input[type=checkbox],input[type=radio]') ? false : '');
        resizeText(el);
      }
      try {localStorage.removeItem(key);}catch(_){}
      emit(root,'dbt:answers-cleared',{key});
    };
    state.validate=()=>{
      register();let first=null;
      for(const el of state.map.keys()) {
        if(!root.contains(el)||el.disabled||!el.hasAttribute('aria-required')&&!el.required) continue;
        const valid=el.isContentEditable ? !!el.textContent.trim() : (el.checkValidity?.() ?? true);
        el.classList.toggle('dbt-entry-invalid',!valid);
        if(!valid&&!first)first=el;
      }
      root.querySelectorAll('[data-dbt-require-one]').forEach(group=>{
        const ok=!!group.querySelector('input[type=checkbox]:checked');
        group.classList.toggle('dbt-entry-invalid',!ok);
        if (!ok&&!first) first=group;
      });
      if(first) first.focus?.();
      return !first;
    };
    register(); return state;
  }
  function init() {
    if(installed)return;
    installed=true;styles();roots().forEach(setup);
    if (window.MutationObserver) {
      let pending=false;
      const observer=new MutationObserver(records=>{
        if(pending||!records.some(r=>r.addedNodes.length||r.removedNodes.length))return;
        pending=true;
        const later=window.requestAnimationFrame||((fn)=>setTimeout(fn,30));
        later(()=>{pending=false;roots().forEach((root,i)=>(instances.get(root)||setup(root,i)).refresh());});
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }
    window.addEventListener('pagehide',()=>instances.forEach(s=>s.save()));
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='hidden')instances.forEach(s=>s.save());
    });
  }
  function resolve(root) {return root ? instances.get(root) : [...instances.values()][0];}
  window.DBTWorksheetEntry={
    init,
    save(root) {return resolve(root)?.save()??false;},
    clear(root) {resolve(root)?.clear();},
    validate(root) {return resolve(root)?.validate()??true;},
    refresh() {roots().forEach((root,i)=>(instances.get(root)||setup(root,i)).refresh());},
    getValue
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
