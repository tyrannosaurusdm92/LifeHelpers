(function(){
'use strict';
const BRAND_RE=/(OurSpace|Ourspace|ourspace)/g;
const SKIP=new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','OPTION','SELECT','NOSCRIPT','CODE','PRE','TITLE','SVG']);
function shouldSkipNode(node){
  const p=node&&node.parentElement;
  if(!p) return true;
  if(p.closest('.ourspace-brand-text')) return true;
  let el=p;
  while(el){ if(SKIP.has(el.tagName)) return true; el=el.parentElement; }
  return false;
}
function wrapTextNode(node){
  if(!node || node.nodeType!==Node.TEXT_NODE || shouldSkipNode(node)) return;
  const txt=node.nodeValue;
  if(!txt || !BRAND_RE.test(txt)){ BRAND_RE.lastIndex=0; return; }
  BRAND_RE.lastIndex=0;
  const frag=document.createDocumentFragment();
  let last=0;
  txt.replace(BRAND_RE,(match, _m, offset)=>{
    if(offset>last) frag.appendChild(document.createTextNode(txt.slice(last,offset)));
    const span=document.createElement('span');
    span.className='ourspace-brand-text';
    span.textContent='OurSpace';
    frag.appendChild(span);
    last=offset+match.length;
    return match;
  });
  if(last<txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
  node.parentNode.replaceChild(frag,node);
}
function applyBrand(root=document.body){
  if(!root) return;
  if(root.nodeType===Node.TEXT_NODE){ wrapTextNode(root); return; }
  if(root.nodeType!==Node.ELEMENT_NODE && root.nodeType!==Node.DOCUMENT_NODE) return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){return shouldSkipNode(node)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(wrapTextNode);
}
let scheduled=false;
function schedule(){ if(scheduled) return; scheduled=true; setTimeout(()=>{scheduled=false; applyBrand(document.body);},60); }
function start(){
  applyBrand(document.body);
  const mo=new MutationObserver((records)=>{
    for(const r of records){
      if(r.type==='childList'){
        for(const n of r.addedNodes){
          if(n.nodeType===Node.TEXT_NODE && BRAND_RE.test(n.nodeValue||'')){ BRAND_RE.lastIndex=0; schedule(); return; }
          if(n.nodeType===Node.ELEMENT_NODE && /OurSpace|Ourspace|ourspace/.test(n.textContent||'')){ schedule(); return; }
        }
      }
    }
  });
  mo.observe(document.body,{childList:true,subtree:true});
  window.OurSpaceBrandFont={apply:applyBrand,schedule};
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
