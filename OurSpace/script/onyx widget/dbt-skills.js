/* Skills page: permanent, searchable Handout + Worksheet index.
   No floating hamburger, side panel, or dark-mode navigation dependency. */
(() => {
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const source=$('#book-data');
  if(!source)return;
  const book=JSON.parse(source.textContent);
  const pairs=book.pairings||[];
  const pairMap=new Map(pairs.map(pair=>[pair.id,pair]));
  const routes=new Set(['index','contents',...book.chapters.map(c=>c.id)]);
  const persist=(key,value)=>{try{localStorage.setItem(key,value);}catch(_){}};
  const restore=key=>{try{return localStorage.getItem(key);}catch(_){return null;}};
  const pairLink=(pair,view)=>`${pair.path}#${view==='worksheets'?'worksheets':'handouts'}`;
  const bookmark=(pair,view)=>{
    persist('dbtBook.lastRead',JSON.stringify({id:pair.id,view,updatedAt:new Date().toISOString()}));
    updateContinue();
  };
  // Repoint both actions of every pairing to the actual bundled document.
  // Standard anchors still work without JS; all 102 paired files remain standalone.
  $$('[data-open-pair]').forEach(link=>{
    const pair=pairMap.get(link.dataset.openPair);
    if(!pair)return;
    const view=link.dataset.view==='worksheets'?'worksheets':'handouts';
    link.href=pairLink(pair,view);
    link.addEventListener('click',()=>bookmark(pair,view));
  });
  const updateContinue=()=>{
    const el=$('#continueCard');if(!el)return;
    let saved=null;try{saved=JSON.parse(restore('dbtBook.lastRead')||'null');}catch(_){}
    const pair=pairMap.get(saved?.id);
    el.hidden=!pair;
    if(!pair)return;
    $('#continueTitle').textContent=pair.worksheet.title;
    $('#continueModule').textContent=`${pair.worksheet.module} · Worksheet ${pair.worksheet.number}`;
    const link=$('#continueLink');link.href=pairLink(pair,saved.view);
    link.onclick=()=>bookmark(pair,saved.view);
  };
  function filterIndex(){
    const words=($('#catalogSearch')?.value||'').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const module=$('#moduleFilter')?.value||'';
    let count=0;
    $$('#page-index .pair-card').forEach(card=>{
      const match=(!module||card.dataset.module===module)&&words.every(w=>(card.dataset.search||'').includes(w));
      card.hidden=!match;if(match)count++;
    });
    $$('[data-index-module]').forEach(section=>{
      section.hidden=!$$('.pair-card',section).some(card=>!card.hidden);
    });
    const number=$('#indexCount');if(number)number.textContent=`${count} pairing${count===1?'':'s'}${count!==pairs.length?' of '+pairs.length:''}`;
    const empty=$('#emptyResults');if(empty)empty.hidden=count!==0;
  }
  $('#indexSearchForm')?.addEventListener('submit',e=>e.preventDefault());
  $('#catalogSearch')?.addEventListener('input',filterIndex);
  $('#moduleFilter')?.addEventListener('change',filterIndex);
  $('#clearSearch')?.addEventListener('click',()=>{
    $('#catalogSearch').value='';$('#moduleFilter').value='';filterIndex();$('#catalogSearch').focus();
  });
  function showRoute(){
    const hash=decodeURIComponent(location.hash.slice(1));
    if(hash.startsWith('read=')){
      const params=new URLSearchParams(hash),pair=pairMap.get(params.get('read'));
      if(pair){const view=params.get('view')==='worksheets'?'worksheets':'handouts';bookmark(pair,view);location.replace(pairLink(pair,view));return;}
    }
    const route=routes.has(hash)?hash:'index';
    $$('.site-page').forEach(el=>el.classList.toggle('is-active',el.id==='page-'+route));
    $$('.skills-index-nav [data-book-route]').forEach(link=>{
      const selected=link.dataset.bookRoute===route;
      link.classList.toggle('is-current',selected);
      if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    document.title=(book.chapters.find(c=>c.id===route)?.title||(route==='contents'?'Book overview':'Worksheet + Handout Index'))+' · DBT Skills';
    updateContinue();
  }
  window.addEventListener('hashchange',showRoute);
  if(!location.hash)history.replaceState(null,'','#index');
  showRoute();filterIndex();
})();
