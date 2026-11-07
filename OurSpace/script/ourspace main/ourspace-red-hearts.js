/* Render the shared heart glyph; colors come from the canonical site stylesheet. */
(()=>{'use strict';
 const HEART='\u2665\uFE0E';
 const blocked='script,style,noscript,textarea,pre,code,option,select,[contenteditable]';
 function apply(root){if(!root||root.nodeType===3){if(root?.nodeType===3)wrap(root);return}
  if(root.nodeType!==1||root.closest(blocked))return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const work=[];
  while(walker.nextNode()){const n=walker.currentNode;if(n.nodeValue?.includes(HEART)&&!n.parentElement.closest(blocked)&&!n.parentElement.classList.contains('os-heart-glyph'))work.push(n)}
  for(const n of work)wrap(n);
 }
 function wrap(n){if(!n.parentNode||!n.nodeValue?.includes(HEART)||n.parentElement?.closest(blocked)||n.parentElement?.classList?.contains('os-heart-glyph'))return;
  const split=n.nodeValue.split(HEART),frag=document.createDocumentFragment();
  split.forEach((s,i)=>{if(i){const glyph=document.createElement('span');glyph.className='os-heart-glyph';glyph.textContent=HEART;frag.append(glyph)}if(s)frag.append(document.createTextNode(s))});n.replaceWith(frag);
 }
 let pending=[],id=0;
 const schedule=()=>{if(id)return;id=requestAnimationFrame(()=>{id=0;const entries=pending;pending=[];for(const n of entries)apply(n)})};
 const start=()=>{apply(document.body);new MutationObserver(records=>{for(const record of records)for(const n of record.addedNodes)if(n.nodeType===1||n.nodeType===3)pending.push(n);if(pending.length)schedule()}).observe(document.body,{childList:true,subtree:true})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
