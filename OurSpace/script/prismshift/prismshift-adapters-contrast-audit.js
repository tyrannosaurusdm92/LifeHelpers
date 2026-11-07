import {parseColor,composite,contrastRatio,rgb} from './prismshift-core-color.js';
/** Reports actual text/background contrast without modifying the host. */
export function auditContrast(root,{minimum=4.5,maxNodes=5000,ignoreSelector='[data-prism-ignore]'}={}){
 const doc=root.nodeType===9?root:root.ownerDocument;const win=doc?.defaultView;if(!win)throw new Error('Browser DOM required');
 const nodes=root.querySelectorAll('*'),issues=[];let inspected=0,unknown=0,passing=0;
 for(const el of nodes){if(inspected>=maxNodes)break;if(el.matches('script,style,svg,path,img,video,canvas')||el.closest(ignoreSelector))continue;
  // Skip non-text containers: detect own text nodes so repeated ancestors are not counted.
  if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
  const computed=win.getComputedStyle(el);if(computed.display==='none'||computed.visibility==='hidden'||computed.opacity==='0')continue;
  const foreground=parseColor(computed.color);if(!foreground){unknown++;continue}
  let bg=rgb(255,255,255),found=false;let current=el;
  while(current){const c=parseColor(win.getComputedStyle(current).backgroundColor);if(c&&c.a>0){bg=composite(c,bg);found=true;if(c.a===1)break}current=current.parentElement}
  if(!found){const fallback=parseColor(win.getComputedStyle(doc.documentElement).backgroundColor);if(fallback)bg=composite(fallback,bg)}
  const ratio=contrastRatio(composite(foreground,bg),bg);inspected++;if(ratio<minimum)issues.push({element:el,ratio:+ratio.toFixed(2),foreground:computed.color,background:bg,minimum});else passing++;
 }
 return {inspected,passing,failing:issues.length,unknown,issues};
}
