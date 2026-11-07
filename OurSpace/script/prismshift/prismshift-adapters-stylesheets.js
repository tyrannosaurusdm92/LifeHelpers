/** Non-destructive alternate stylesheet manager, inspired by prefers-color-scheme usage. */
export function createStylesheetController(doc,{darkSelector='link[rel="stylesheet"][data-theme="dark"]',lightSelector='link[rel="stylesheet"][data-theme="light"]'}={}){
 if(!doc?.querySelectorAll)throw new TypeError('Document required');const original=new Map();
 const get=()=>({dark:[...doc.querySelectorAll(darkSelector)],light:[...doc.querySelectorAll(lightSelector)]});
 function activate(mode){if(!['dark','light','off'].includes(mode))throw new RangeError('Bad mode');const {dark,light}=get();for(const el of [...dark,...light]){if(!original.has(el))original.set(el,el.getAttribute('media'));el.setAttribute('media',mode==='off'?'not all':((mode==='dark')===dark.includes(el)?'all':'not all'))}return {dark:dark.length,light:light.length}}
 return {activate,restore(){for(const [el,media] of original){if(media===null)el.removeAttribute('media');else el.setAttribute('media',media)}original.clear()},getState:()=>({managed:original.size})};
}
/** A host can supply its own mapping of semantic design-system variables. */
export function createTokenMapper(element,mapping={}){if(!element?.style)throw new TypeError('Element required');const prior=new Map();return {
 apply(palette){for(const [variable,path] of Object.entries(mapping)){if(!/^--[\w-]+$/.test(variable))throw new TypeError('Invalid CSS variable');if(!prior.has(variable))prior.set(variable,[element.style.getPropertyValue(variable),element.style.getPropertyPriority(variable)]);const value=palette[path];if(typeof value==='string')element.style.setProperty(variable,value)}},
 restore(){for(const [variable,[value,priority]] of prior){if(value)element.style.setProperty(variable,value,priority);else element.style.removeProperty(variable)}prior.clear()}
 }}
